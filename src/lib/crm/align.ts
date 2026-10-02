import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { listCrmContacts, listNotionExtras, archiveNotionPages } from '@/lib/integrations/notion';
import type { NotionExtras } from '@/lib/integrations/notion';
import { beehiivStats, listBeehiivSubscribers, listBeehiivEngagement } from '@/lib/integrations/beehiiv';
import { upsertContact } from '@/lib/crm/contacts';
import Stripe from 'stripe';
import { stripe, tierAndIntervalForPriceId, amountsForPlan } from '@/lib/stripe';

// Lining the three systems up: the contacts table is the master list, Notion
// holds rows that predate it, and beehiiv is the channel that has to be able
// to reach everybody at once.
//
// The consent basis travels with every subscriber, so a send can go to the
// whole list or only to the people who asked for a newsletter.

// PostgREST caps a select at a thousand rows, so the set of addresses we
// already hold has to be read a page at a time. Getting this wrong makes an
// import re-offer the same people for ever.
async function knownEmails(): Promise<Set<string>> {
  const admin = createAdminClient();
  const known = new Set<string>();
  for (let from = 0; from < 100_000; from += 1000) {
    const { data, error } = await admin
      .from('contacts')
      .select('email_normalised')
      .range(from, from + 999);
    if (error || !data || data.length === 0) break;
    for (const row of data) known.add(row.email_normalised as string);
    if (data.length < 1000) break;
  }
  return known;
}

export type ConsentBasis = 'newsletter' | 'member' | 'account' | 'contact';

export function consentBasis(c: {
  newsletter_opt_in?: boolean;
  membership_status?: string | null;
  user_id?: string | null;
}): ConsentBasis {
  if (c.newsletter_opt_in) return 'newsletter';
  if (c.membership_status === 'active' || c.membership_status === 'trialing') return 'member';
  if (c.user_id) return 'account';
  return 'contact';
}

// Notion is the place work happens, so it holds the people we work with: an
// account, a membership, a page already there, or a stage past lead. A
// newsletter subscriber who has done none of those stays out of it until they
// do, which keeps 1,800 pages from appearing overnight.
export function shouldMirrorToNotion(c: {
  user_id?: string | null;
  membership_status?: string | null;
  notion_page_id?: string | null;
  stage?: string | null;
}): boolean {
  return Boolean(c.user_id || c.membership_status || c.notion_page_id || (c.stage && c.stage !== 'lead'));
}

// Bring the newsletter audience into the master table, with the state beehiiv
// holds for each address. Nothing is sent, and an unsubscribe is recorded as
// one, so the sync will leave those people alone from here on.
export async function importFromBeehiiv(apply: boolean, limit = 250) {
  const admin = createAdminClient();
  const known = await knownEmails();

  const list = await listBeehiivSubscribers();
  if (!list.ok) return { ok: false, error: list.error };

  const missing = list.subscribers.filter((s) => !known.has(s.email.toLowerCase().trim()));
  const byStatus: Record<string, number> = {};
  for (const s of missing) byStatus[s.status ?? 'unknown'] = (byStatus[s.status ?? 'unknown'] ?? 0) + 1;
  if (!apply) return { ok: true, wouldImport: missing.length, byStatus };

  // Batched, because a few thousand round trips will outlast any function.
  const batch = missing.slice(0, limit);
  let imported = 0;
  for (const person of batch) {
    const id = await upsertContact({
      email: person.email,
      source: 'beehiiv',
      patch: {
        // An active subscriber asked for the newsletter at some point; the
        // rest keep the state beehiiv has for them.
        newsletter_opt_in: person.status === 'subscribed',
        newsletter_status: person.status ?? 'none',
      },
    });
    if (id) {
      await admin.from('contacts').update({ beehiiv_subscription_id: person.id }).eq('id', id);
      imported += 1;
    }
  }
  return { ok: true, imported, remaining: missing.length - imported, of: missing.length };
}

export async function inventory() {
  const admin = createAdminClient();
  type Row = {
    email_normalised: string;
    status: string | null;
    newsletter_opt_in: boolean | null;
    newsletter_status: string | null;
    membership_status: string | null;
    user_id: string | null;
    beehiiv_subscription_id: string | null;
  };
  const rows: Row[] = [];
  for (let from = 0; from < 100_000; from += 1000) {
    const { data, error } = await admin
      .from('contacts')
      .select('email, email_normalised, status, newsletter_opt_in, newsletter_status, membership_status, user_id, beehiiv_subscription_id, notion_page_id, stage')
      .range(from, from + 999);
    if (error || !data || data.length === 0) break;
    rows.push(...(data as unknown as Row[]));
    if (data.length < 1000) break;
  }
  const active = rows.filter((c) => c.status === 'active');
  const byConsent: Record<string, number> = {};
  for (const c of active) {
    const basis = consentBasis({
      newsletter_opt_in: c.newsletter_opt_in ?? false,
      membership_status: c.membership_status,
      user_id: c.user_id,
    });
    byConsent[basis] = (byConsent[basis] ?? 0) + 1;
  }

  const known = new Set(rows.map((c) => c.email_normalised));
  const notion = await listCrmContacts();
  const notionEmails = notion.ok ? notion.contacts : [];
  const newFromNotion = notionEmails.filter((n) => !known.has(n.email.toLowerCase().trim()));

  return {
    contacts: {
      total: rows.length,
      active: active.length,
      junk: rows.length - active.length,
      byConsent,
      unsubscribedOrBounced: active.filter((c) =>
        ['unsubscribed', 'bounced'].includes(c.newsletter_status ?? '')
      ).length,
      onBeehiiv: active.filter((c) => c.beehiiv_subscription_id).length,
      reachable: active.filter(
        (c) => !['unsubscribed', 'bounced'].includes(c.newsletter_status ?? '')
      ).length,
    },
    notion: notion.ok
      ? { rows: notionEmails.length, alreadyContacts: notionEmails.length - newFromNotion.length, newToImport: newFromNotion.length, sample: newFromNotion.slice(0, 10).map((n) => n.email) }
      : { error: notion.error },
    beehiiv: await beehiivStats(),
  };
}

// Bring Notion rows that exist nowhere else into the contacts table, so the
// master list really is the master list. Nothing in Notion is changed.
export async function importFromNotion(apply: boolean, limit = 250) {
  const admin = createAdminClient();
  const known = await knownEmails();

  const notion = await listCrmContacts();
  if (!notion.ok) return { ok: false, error: notion.error };

  const missing = notion.contacts.filter((n) => !known.has(n.email.toLowerCase().trim()));
  if (!apply) return { ok: true, wouldImport: missing.length, sample: missing.slice(0, 20) };

  const batch = missing.slice(0, limit);
  let imported = 0;
  for (const person of batch) {
    const id = await upsertContact({
      email: person.email,
      source: 'notion',
      patch: { first_name: person.firstName ?? null, last_name: person.lastName ?? null },
    });
    if (id) {
      // Keep the page we came from, so the sync updates it rather than making a second one.
      if (person.pageId) await admin.from('contacts').update({ notion_page_id: person.pageId }).eq('id', id);
      imported += 1;
    }
  }
  return { ok: true, imported, remaining: missing.length - imported, of: missing.length };
}


// ── Stripe ──────────────────────────────────────────────────────────────────
// What the Stripe account actually holds, including anything a previous
// platform created there. Read-only: nothing in Stripe is changed.
export async function stripeInventory() {
  if (!process.env.STRIPE_SECRET_KEY) return { error: 'stripe-not-configured' };

  // Which Stripe account this key belongs to, and whether it is live. Two
  // accounts, or a test key in production, both look like "no subscriptions"
  // from the outside, and they are very different problems.
  const key = process.env.STRIPE_SECRET_KEY;
  const account: Record<string, unknown> = {
    keyKind: key.startsWith('sk_live') || key.startsWith('rk_live') ? 'live' : 'test',
  };
  try {
    // Retrieving with no id returns the account the key belongs to.
    const acct = await stripe.accounts.retrieve(undefined as unknown as string);
    account.id = acct.id;
    account.name = acct.business_profile?.name ?? acct.settings?.dashboard?.display_name ?? null;
    account.email = acct.email ?? null;
    account.chargesEnabled = acct.charges_enabled;
  } catch (e) {
    account.error = (e as Error).message;
  }

  const admin = createAdminClient();
  const known = await knownEmails();

  const byStatus: Record<string, number> = {};
  const byInterval: Record<string, number> = {};
  const byPrice: Record<string, { count: number; product: string; amount: string; recognised: boolean }> = {};
  const created: string[] = [];
  const metadataKeys = new Set<string>();
  let total = 0;
  let matchedContact = 0;
  let matchedAccount = 0;
  const unmatched: string[] = [];

  try {
    for await (const sub of stripe.subscriptions.list({ status: 'all', limit: 100, expand: ['data.customer'] })) {
      total += 1;
      byStatus[sub.status] = (byStatus[sub.status] ?? 0) + 1;
      created.push(new Date(sub.created * 1000).toISOString().slice(0, 10));
      for (const k of Object.keys(sub.metadata ?? {})) metadataKeys.add(k);

      const item = sub.items.data[0];
      const price = item?.price;
      if (price) {
        const interval = price.recurring?.interval ?? 'unknown';
        byInterval[interval] = (byInterval[interval] ?? 0) + 1;
        const productName =
          typeof price.product === 'string' ? price.product : 'name' in price.product ? price.product.name : '—';
        const entry = byPrice[price.id] ?? {
          count: 0,
          product: price.nickname ?? productName ?? '—',
          amount: `${((price.unit_amount ?? 0) / 100).toFixed(2)} ${price.currency?.toUpperCase()} / ${interval}`,
          recognised: Boolean(tierAndIntervalForPriceId(price.id)),
        };
        entry.count += 1;
        byPrice[price.id] = entry;
      }

      const customer = sub.customer;
      const email = typeof customer === 'string' ? null : 'deleted' in customer ? null : customer.email;
      if (email && known.has(email.trim().toLowerCase())) {
        matchedContact += 1;
        const { data } = await admin
          .from('contacts')
          .select('user_id')
          .eq('email_normalised', email.trim().toLowerCase())
          .maybeSingle();
        if (data?.user_id) matchedAccount += 1;
      } else if (email) {
        if (unmatched.length < 20) unmatched.push(email);
      }
    }
  } catch (e) {
    return { error: (e as Error).message };
  }

  created.sort();
  return {
    account,
    subscriptions: total,
    byStatus,
    byInterval,
    prices: byPrice,
    // Anything a previous platform stamped on its subscriptions shows up here.
    metadataKeys: [...metadataKeys],
    oldest: created[0] ?? null,
    newest: created[created.length - 1] ?? null,
    matching: { toAContact: matchedContact, toAnAccount: matchedAccount, unmatchedSample: unmatched },
  };
}


// ── The older Stripe account ────────────────────────────────────────────────
// Memberships sold before this site, through Mighty Networks, were billed on a
// different Stripe account. Reading it needs its own key, and a read-only
// restricted key is enough: STRIPE_LEGACY_SECRET_KEY.
//
// Nothing is ever written there. What comes back is who paid, how much, how
// often, and whether they are still paying, matched to the contacts table by
// email so the legacy cohort stops being a hand-kept list.
function legacyStripe(): Stripe | null {
  const key = process.env.STRIPE_LEGACY_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, { apiVersion: '2026-06-24.dahlia' });
}

export async function legacyStripeInventory() {
  const client = legacyStripe();
  if (!client) return { error: 'legacy-stripe-not-configured' };

  const admin = createAdminClient();
  const known = await knownEmails();

  const byStatus: Record<string, number> = {};
  const byInterval: Record<string, number> = {};
  const amounts: Record<string, number> = {};
  const created: string[] = [];
  let total = 0;
  let matched = 0;
  let matchedAccount = 0;
  const unmatched: string[] = [];
  const account: Record<string, unknown> = {};

  try {
    const acct = await client.accounts.retrieve(undefined as unknown as string);
    account.id = acct.id;
    account.name = acct.business_profile?.name ?? acct.settings?.dashboard?.display_name ?? null;
    account.email = acct.email ?? null;

    for await (const sub of client.subscriptions.list({ status: 'all', limit: 100, expand: ['data.customer'] })) {
      total += 1;
      byStatus[sub.status] = (byStatus[sub.status] ?? 0) + 1;
      created.push(new Date(sub.created * 1000).toISOString().slice(0, 10));

      const price = sub.items.data[0]?.price;
      if (price) {
        const interval = price.recurring?.interval ?? 'unknown';
        byInterval[interval] = (byInterval[interval] ?? 0) + 1;
        const label = `${((price.unit_amount ?? 0) / 100).toFixed(2)} ${price.currency?.toUpperCase()} / ${interval}`;
        amounts[label] = (amounts[label] ?? 0) + 1;
      }

      const customer = sub.customer;
      const email = typeof customer === 'string' ? null : 'deleted' in customer ? null : customer.email;
      if (email && known.has(email.trim().toLowerCase())) {
        matched += 1;
        const { data } = await admin
          .from('contacts')
          .select('user_id')
          .eq('email_normalised', email.trim().toLowerCase())
          .maybeSingle();
        if (data?.user_id) matchedAccount += 1;
      } else if (email && unmatched.length < 25) {
        unmatched.push(email);
      }
    }
  } catch (e) {
    return { account, error: (e as Error).message };
  }

  created.sort();
  return {
    account,
    subscriptions: total,
    byStatus,
    byInterval,
    amounts,
    oldest: created[0] ?? null,
    newest: created[created.length - 1] ?? null,
    matching: { toAContact: matched, toAnAccount: matchedAccount, unmatchedSample: unmatched },
  };
}


// Line the old account's subscriptions up against what this database believes.
// Read-only on both sides: it reports, and a person decides what to do.
export async function reconcileLegacyStripe() {
  const client = legacyStripe();
  if (!client) return { error: 'legacy-stripe-not-configured' };

  const admin = createAdminClient();
  const rows: Record<string, unknown>[] = [];
  const counts = { active: 0, noContact: 0, noAccount: 0, noMembershipRow: 0, datesDiffer: 0, weSayActiveTheyDont: 0 };

  try {
    for await (const sub of client.subscriptions.list({ status: 'all', limit: 100, expand: ['data.customer'] })) {
      const customer = sub.customer;
      const email = typeof customer === 'string' ? null : 'deleted' in customer ? null : customer.email;
      const name = typeof customer === 'string' ? null : 'deleted' in customer ? null : customer.name;
      if (!email) continue;

      const item = sub.items.data[0];
      const price = item?.price;
      const amount = `${((price?.unit_amount ?? 0) / 100).toFixed(2)} ${price?.currency?.toUpperCase()} / ${price?.recurring?.interval ?? '?'}`;
      const periodEnd = item?.current_period_end
        ? new Date(item.current_period_end * 1000).toISOString().slice(0, 10)
        : null;

      const { data: contact } = await admin
        .from('contacts')
        .select('id, user_id, email, stage, membership_status, membership_plan, renewal_status')
        .eq('email_normalised', email.trim().toLowerCase())
        .maybeSingle();

      let ours: Record<string, unknown> | null = null;
      if (contact?.user_id) {
        const { data: sb } = await admin
          .from('subscriptions')
          .select('status, plan_label, current_period_end, source, yearly_amount, monthly_amount')
          .eq('user_id', contact.user_id)
          .maybeSingle();
        ours = sb ?? null;
      }

      const live = sub.status === 'active' || sub.status === 'trialing';
      if (live) counts.active += 1;

      const flags: string[] = [];
      if (!contact) { flags.push('no contact'); if (live) counts.noContact += 1; }
      else if (!contact.user_id) { flags.push('no account'); if (live) counts.noAccount += 1; }
      else if (!ours) { flags.push('no membership row'); if (live) counts.noMembershipRow += 1; }
      else {
        const oursEnd = ours.current_period_end ? String(ours.current_period_end).slice(0, 10) : null;
        if (live && oursEnd !== periodEnd) { flags.push(`renewal date differs (ours ${oursEnd ?? '—'})`); counts.datesDiffer += 1; }
        // A cancelled subscription means nothing on its own: plenty of people
        // cancelled once and came back, so only flag somebody whose every
        // subscription on this account is dead while we still call them a
        // member.
        const oursLive = ours.status === 'active' || ours.status === 'trialing';
        if (!live && oursLive) {
          const stillPaying = await client.subscriptions.list({
            customer: typeof customer === 'string' ? customer : customer.id,
            status: 'active',
            limit: 1,
          });
          if (stillPaying.data.length === 0) {
            flags.push('every subscription on this account has stopped, and we still call them a member');
            counts.weSayActiveTheyDont += 1;
          }
        }
      }

      // Only the interesting rows travel back: everything live, and anything
      // where the two systems disagree.
      if (live || flags.length > 0) {
        rows.push({
          email,
          name: name ?? contact?.email ?? null,
          stripe: { status: sub.status, amount, renews: periodEnd, since: new Date(sub.created * 1000).toISOString().slice(0, 10) },
          ours: contact
            ? { stage: contact.stage, membership: ours?.status ?? 'none', plan: ours?.plan_label ?? null, renews: ours?.current_period_end ? String(ours.current_period_end).slice(0, 10) : null, source: ours?.source ?? null, renewal: contact.renewal_status }
            : null,
          flags,
        });
      }
    }
  } catch (e) {
    return { error: (e as Error).message };
  }

  rows.sort((a, b) => String((a.stripe as { status: string }).status).localeCompare(String((b.stripe as { status: string }).status)));
  return { counts, rows };
}


// Take the renewal dates from the old account, where they are the truth: what
// this database holds was typed in by hand from a signup anniversary, which
// misses trials and free months. Only the date moves, and only for people
// whose membership is live on both sides.
export async function applyLegacyRenewalDates(apply: boolean) {
  const client = legacyStripe();
  if (!client) return { error: 'legacy-stripe-not-configured' };

  const admin = createAdminClient();
  const changes: { email: string; from: string | null; to: string }[] = [];

  try {
    for await (const sub of client.subscriptions.list({ status: 'active', limit: 100, expand: ['data.customer'] })) {
      const customer = sub.customer;
      const email = typeof customer === 'string' ? null : 'deleted' in customer ? null : customer.email;
      const item = sub.items.data[0];
      if (!email || !item?.current_period_end) continue;

      const stripeEnd = new Date(item.current_period_end * 1000).toISOString();
      const { data: contact } = await admin
        .from('contacts')
        .select('user_id')
        .eq('email_normalised', email.trim().toLowerCase())
        .maybeSingle();
      if (!contact?.user_id) continue;

      const { data: row } = await admin
        .from('subscriptions')
        .select('status, current_period_end')
        .eq('user_id', contact.user_id)
        .maybeSingle();
      if (!row || !['active', 'trialing'].includes(row.status as string)) continue;

      const ours = row.current_period_end ? String(row.current_period_end).slice(0, 10) : null;
      if (ours === stripeEnd.slice(0, 10)) continue;

      changes.push({ email, from: ours, to: stripeEnd.slice(0, 10) });
      if (apply) {
        await admin
          .from('subscriptions')
          .update({ current_period_end: stripeEnd, updated_at: new Date().toISOString() })
          .eq('user_id', contact.user_id);
      }
    }
  } catch (e) {
    return { error: (e as Error).message };
  }

  return { ok: true, applied: apply, changes };
}

// ── Bringing the Notion-only fields home ────────────────────────────────────
// Notion carried LinkedIn, Position, Website, Deal Value and the rest, which
// the contacts table had no column for. Winding Notion down means copying
// them across first. Blanks are filled and existing values are left alone, so
// running it twice changes nothing and nothing already in the CRM is
// overwritten by an older Notion value.
const EXTRA_FIELDS = [
    'position',
    'linkedin_url',
    'website',
    'organisation_name',
    'org_mission',
    'deal_value',
    'participation_tags',
    'policy_comms_source',
  'phone',
  'company',
] as const;

// Copy one Notion row onto its contact, filling blanks only. Returns the
// contact id when a contact exists, so a caller can act on having matched.
async function fillContactFromNotion(
  admin: ReturnType<typeof createAdminClient>,
  r: NotionExtras,
  apply: boolean,
  filled: Record<string, number>
): Promise<string | null> {
  const { data } = await admin
    .from('contacts')
    .select('id, position, linkedin_url, website, organisation_name, org_mission, deal_value, participation_tags, policy_comms_source, phone, company')
    .eq('email_normalised', r.email)
    .maybeSingle();
  if (!data) return null;

  const current = data as Record<string, unknown> & { id: string };
  const patch: Record<string, string | number> = {};
  const put = (column: (typeof EXTRA_FIELDS)[number], value: string | number | null) => {
    if (value === null || value === '') return;
    const held = current[column];
    if (held === null || held === undefined || held === '') {
      patch[column] = value;
      filled[column] += 1;
    }
  };

  put('position', r.position);
  put('linkedin_url', r.linkedin);
  put('website', r.website);
  put('organisation_name', r.organisationName);
  put('org_mission', r.orgMission);
  put('deal_value', r.dealValue);
  put('participation_tags', r.tags);
  put('policy_comms_source', r.policySource);
  put('phone', r.phone);
  put('company', r.company);

  if (apply && Object.keys(patch).length) {
    await admin.from('contacts').update(patch).eq('id', current.id);
  }
  return current.id;
}

export async function importNotionExtras(apply: boolean, status?: string) {
  const admin = createAdminClient();
  const read = await listNotionExtras();
  if (!read.ok) return { ok: false as const, error: read.error };

  const rows = status ? read.rows.filter((r) => r.status === status) : read.rows;
  const filled: Record<string, number> = Object.fromEntries(EXTRA_FIELDS.map((f) => [f, 0]));
  let matched = 0;
  let missing = 0;
  const notInCrm: string[] = [];

  for (const r of rows) {
    const id = await fillContactFromNotion(admin, r, apply, filled);
    if (id) {
      matched += 1;
    } else {
      missing += 1;
      if (notInCrm.length < 40) notInCrm.push(r.email);
    }
  }

  return {
    ok: true as const,
    applied: apply,
    notionRows: rows.length,
    matched,
    missingFromCrm: missing,
    notInCrm,
    wouldFill: filled,
  };
}

// Wind one Notion status down.
//
// For each row with that status: copy its fields onto the matching contact,
// confirm the contact is there, and only then send the Notion page to the
// trash. The check happens at the moment of deletion rather than against a
// list drawn up earlier, so a row that is not in the CRM is never removed,
// whatever changed in between. Dry by default.
export async function pruneNotionStatus(status: string, apply: boolean) {
  const admin = createAdminClient();
  const read = await listNotionExtras();
  if (!read.ok) return { ok: false as const, error: read.error };

  const rows = read.rows.filter((r) => r.status === status);
  const filled: Record<string, number> = Object.fromEntries(EXTRA_FIELDS.map((f) => [f, 0]));

  const toArchive: string[] = [];
  const keptNotInCrm: string[] = [];

  for (const r of rows) {
    const id = await fillContactFromNotion(admin, r, apply, filled);
    if (id) {
      toArchive.push(r.pageId);
    } else if (keptNotInCrm.length < 50) {
      keptNotInCrm.push(r.email);
    }
  }

  if (!apply) {
    return {
      ok: true as const,
      applied: false,
      status,
      notionRows: rows.length,
      wouldArchive: toArchive.length,
      wouldKeep: rows.length - toArchive.length,
      keptNotInCrm,
      wouldFill: filled,
    };
  }

  const result = await archiveNotionPages(toArchive);
  return {
    ok: true as const,
    applied: true,
    status,
    notionRows: rows.length,
    archived: result.archived.length,
    failed: result.failed.slice(0, 10),
    keptNotInCrm,
    filled,
  };
}

// ── Newsletter engagement ───────────────────────────────────────────────────
// Pull what beehiiv holds per subscriber onto the contact: the real subscribe
// date, where they came from, and how they have engaged. Engagement figures
// are overwritten every run, because beehiiv is the authority on them and
// they move with every send. The subscribe date and the utm fields are only
// ever filled when blank, so a value already in the CRM stands.
export async function importBeehiivEngagement(apply: boolean, budget = 600) {
  const admin = createAdminClient();
  const read = await listBeehiivEngagement();
  if (!read.ok) return { ok: false as const, error: read.error };

  let matched = 0;
  let updated = 0;
  let notInCrm = 0;
  let withStats = 0;
  let skippedFresh = 0;
  // Writing two thousand rows in one request runs past the function's time
  // limit. Each run takes a budget of the ones not refreshed in the last
  // hour, so repeated runs converge instead of redoing the same head of the
  // list and never reaching the tail.
  const freshAfter = Date.now() - 60 * 60 * 1000;
  let visited = 0;

  for (const r of read.rows) {
    if (apply && updated >= budget) break;
    visited += 1;

    const { data } = await admin
      .from('contacts')
      .select('id, newsletter_subscribed_at, utm_source, utm_medium, utm_campaign, referring_site, newsletter_stats_at')
      .eq('email_normalised', r.email)
      .maybeSingle();
    if (!data) {
      notInCrm += 1;
      continue;
    }
    matched += 1;
    if (r.sent !== null) withStats += 1;

    const stamped = (data as { newsletter_stats_at: string | null }).newsletter_stats_at;
    if (apply && stamped && new Date(stamped).getTime() > freshAfter) {
      skippedFresh += 1;
      continue;
    }

    const current = data as Record<string, unknown> & { id: string };
    const patch: Record<string, string | number | null> = {
      emails_sent: r.sent,
      emails_opened: r.opened,
      emails_clicked: r.clicked,
      open_rate: r.openRate,
      click_rate: r.clickRate,
      newsletter_stats_at: new Date().toISOString(),
    };
    const fill = (column: string, value: string | null) => {
      if (!value) return;
      const held = current[column];
      if (held === null || held === undefined || held === '') patch[column] = value;
    };
    fill('newsletter_subscribed_at', r.subscribedAt);
    fill('utm_source', r.utmSource);
    fill('utm_medium', r.utmMedium);
    fill('utm_campaign', r.utmCampaign);
    fill('referring_site', r.referringSite);

    if (apply) {
      await admin.from('contacts').update(patch).eq('id', current.id);
      updated += 1;
    }
  }

  return {
    ok: true as const,
    applied: apply,
    beehiivSubscribers: read.rows.length,
    matched,
    withStats,
    notInCrm,
    updated,
    skippedFresh,
    // What the budget left untouched. Counting from the rows never visited,
    // because the counters above stop the moment the loop breaks.
    remaining: apply ? read.rows.length - visited : matched,
  };
}

// Everything the live Stripe account holds for one address: customers,
// subscriptions whatever their state, one-off payments and checkout
// sessions. A membership that never reached the CRM looks identical from
// here whether Stripe never had it, the webhook missed it, or the money
// arrived some way other than a subscription, and those need telling apart.
export async function stripeSearch(email: string) {
  if (!process.env.STRIPE_SECRET_KEY) return { error: 'stripe-not-configured' };

  const out: Record<string, unknown> = { email };
  try {
    const customers = await stripe.customers.list({ email, limit: 10 });
    // Stripe matches `email` exactly; search also catches a different case
    // or an address held only on the payment rather than the customer.
    const found = await stripe.customers.search({
      query: `email~'${email.replace(/'/g, "")}'`,
      limit: 10,
    });
    const all = new Map<string, Stripe.Customer>();
    for (const c of [...customers.data, ...found.data]) all.set(c.id, c);

    out.customers = [];
    for (const c of all.values()) {
      const subs = await stripe.subscriptions.list({ customer: c.id, status: 'all', limit: 10 });
      const pays = await stripe.paymentIntents.list({ customer: c.id, limit: 10 });
      (out.customers as unknown[]).push({
        id: c.id,
        email: c.email,
        name: c.name,
        created: new Date(c.created * 1000).toISOString().slice(0, 10),
        subscriptions: subs.data.map((s) => ({
          id: s.id,
          status: s.status,
          created: new Date(s.created * 1000).toISOString().slice(0, 10),
          currentPeriodEnd: s.items.data[0]?.current_period_end
            ? new Date(s.items.data[0].current_period_end * 1000).toISOString().slice(0, 10)
            : null,
          cancelAtPeriodEnd: s.cancel_at_period_end,
          priceId: s.items.data[0]?.price?.id ?? null,
          amount: s.items.data[0]?.price?.unit_amount
            ? `${(s.items.data[0].price.unit_amount ?? 0) / 100} ${s.items.data[0].price.currency}`
            : null,
          interval: s.items.data[0]?.price?.recurring?.interval ?? null,
          metadata: s.metadata,
        })),
        payments: pays.data.map((p) => ({
          id: p.id,
          status: p.status,
          amount: `${(p.amount ?? 0) / 100} ${p.currency}`,
          created: new Date(p.created * 1000).toISOString().slice(0, 10),
        })),
      });
    }

    const sessions = await stripe.checkout.sessions.list({ limit: 100 });
    out.checkoutSessions = sessions.data
      .filter((s) => (s.customer_details?.email ?? '').toLowerCase() === email.toLowerCase())
      .map((s) => ({
        id: s.id,
        status: s.status,
        paymentStatus: s.payment_status,
        mode: s.mode,
        amount: `${(s.amount_total ?? 0) / 100} ${s.currency}`,
        created: new Date(s.created * 1000).toISOString().slice(0, 10),
        subscription: typeof s.subscription === 'string' ? s.subscription : (s.subscription?.id ?? null),
        clientReferenceId: s.client_reference_id,
      }));

    return out;
  } catch (e) {
    return { error: (e as Error).message, ...out };
  }
}

// Catch up the live Stripe account.
//
// The webhook writes a membership row as each event arrives. Anything it
// missed leaves money arriving in Stripe and no member in the CRM, which is
// invisible from this side: the contact simply looks like a lead. This walks
// the account and writes the row the webhook would have written, in the same
// shape, so a repaired record is indistinguishable from a captured one.
//
// Dry by default. Existing rows are updated rather than duplicated, because
// the upsert is keyed on the user.
export async function reconcileLiveStripe(apply: boolean) {
  if (!process.env.STRIPE_SECRET_KEY) return { error: 'stripe-not-configured' };
  const admin = createAdminClient();

  const seen: Record<string, unknown>[] = [];
  const counts = { subscriptions: 0, repaired: 0, alreadyHeld: 0, noContact: 0, noAccount: 0 };

  try {
    for await (const sub of stripe.subscriptions.list({ status: 'all', limit: 100, expand: ['data.customer'] })) {
      counts.subscriptions += 1;
      const customer = sub.customer;
      const email = typeof customer === 'string' ? null : 'deleted' in customer ? null : customer.email;
      const customerId = typeof customer === 'string' ? customer : customer.id;
      const item = sub.items.data[0];
      const resolved = item ? tierAndIntervalForPriceId(item.price.id) : null;
      const amounts = amountsForPlan(resolved?.tier, resolved?.interval);
      const periodEnd = item?.current_period_end
        ? new Date(item.current_period_end * 1000).toISOString()
        : null;
      const willCancel = sub.cancel_at_period_end === true || sub.cancel_at != null;

      const record: Record<string, unknown> = {
        email,
        subscription: sub.id,
        status: sub.status,
        amount: `${((item?.price?.unit_amount ?? 0) / 100).toFixed(2)} ${item?.price?.currency?.toUpperCase()}`,
        interval: item?.price?.recurring?.interval ?? null,
        tier: resolved?.tier ?? null,
        periodEnd: periodEnd?.slice(0, 10) ?? null,
      };

      if (!email) {
        record.outcome = 'no email on the Stripe customer';
        counts.noContact += 1;
        seen.push(record);
        continue;
      }

      const { data: contact } = await admin
        .from('contacts')
        .select('id, user_id')
        .eq('email_normalised', email.trim().toLowerCase())
        .maybeSingle();

      if (!contact) {
        record.outcome = 'no contact';
        counts.noContact += 1;
        seen.push(record);
        continue;
      }
      if (!contact.user_id) {
        record.outcome = 'contact has no account, so no membership row can be keyed';
        counts.noAccount += 1;
        seen.push(record);
        continue;
      }

      const { data: held } = await admin
        .from('subscriptions')
        .select('stripe_subscription_id, status, current_period_end')
        .eq('user_id', contact.user_id)
        .maybeSingle();

      const live = sub.status === 'active' || sub.status === 'trialing';
      const heldIsLive = held?.status === 'active' || held?.status === 'trialing';
      const sameSubscription = held?.stripe_subscription_id === sub.id;

      // The table keeps one row per person, so somebody with several
      // subscriptions on the account has all but one unrepresented. Treating
      // that as damage would report a repair every single run and teach
      // everyone to ignore the warning. A subscription is only worth writing
      // when there is no row at all, when it is the one already recorded and
      // its details have moved, or when it is live and the recorded one is
      // not.
      const heldEnd = held?.current_period_end ? String(held.current_period_end).slice(0, 10) : null;
      const drifted = sameSubscription && (held?.status !== sub.status || heldEnd !== (periodEnd?.slice(0, 10) ?? null));
      const supersedes = !sameSubscription && live && !heldIsLive;

      if (held && !drifted && !supersedes) {
        record.outcome = sameSubscription ? 'already held' : 'another subscription for this person is the one recorded';
        counts.alreadyHeld += 1;
        seen.push(record);
        continue;
      }

      record.outcome = held ? 'row exists but differs, would update' : 'missing, would create';
      counts.repaired += 1;

      if (apply) {
        await admin.from('subscriptions').upsert({
          user_id: contact.user_id,
          source: 'new',
          stripe_customer_id: customerId,
          stripe_subscription_id: sub.id,
          tier: resolved?.tier ?? null,
          billing_interval: resolved?.interval ?? null,
          monthly_amount: amounts.monthly,
          yearly_amount: amounts.yearly,
          status: sub.status,
          cancel_at_period_end: willCancel,
          current_period_end: periodEnd,
        });
        record.outcome = held ? 'updated' : 'created';
      }
      seen.push(record);
    }

    return { ok: true as const, applied: apply, counts, subscriptions: seen };
  } catch (e) {
    return { ok: false as const, error: (e as Error).message, counts, subscriptions: seen };
  }
}

// Why a payment never became a member.
//
// Stripe knows whether it ever tried to tell us: the endpoints registered on
// the account, what each is subscribed to, and how recent deliveries went.
// A missing endpoint, a wrong url, a signing secret that does not match and
// an event type that was never selected all look identical from the database.
export async function stripeWebhookHealth() {
  if (!process.env.STRIPE_SECRET_KEY) return { error: 'stripe-not-configured' };
  try {
    const endpoints = await stripe.webhookEndpoints.list({ limit: 20 });
    const events = await stripe.events.list({ limit: 40 });

    return {
      ok: true as const,
      secretConfigured: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
      endpoints: endpoints.data.map((e) => ({
        id: e.id,
        url: e.url,
        status: e.status,
        apiVersion: e.api_version,
        events: e.enabled_events,
        created: new Date(e.created * 1000).toISOString().slice(0, 10),
      })),
      recentEvents: events.data.map((e) => ({
        type: e.type,
        created: new Date(e.created * 1000).toISOString().slice(0, 16).replace('T', ' '),
        // How many deliveries Stripe still has queued for this event. Anything
        // above zero means it is still trying, or gave up.
        pendingWebhooks: e.pending_webhooks,
      })),
    };
  } catch (e) {
    return { ok: false as const, error: (e as Error).message };
  }
}
