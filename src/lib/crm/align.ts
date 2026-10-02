import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { listCrmContacts, listNotionExtras, archiveNotionPages } from '@/lib/integrations/notion';
import type { NotionExtras } from '@/lib/integrations/notion';
import { beehiivStats, listBeehiivSubscribers, listBeehiivEngagement } from '@/lib/integrations/beehiiv';
import { upsertContact } from '@/lib/crm/contacts';
import Stripe from 'stripe';
import { stripe, tierAndIntervalForPriceId } from '@/lib/stripe';

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

  for (const r of read.rows) {
    if (apply && updated >= budget) break;

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
    remaining: apply ? Math.max(0, matched - updated - skippedFresh) : matched,
  };
}
