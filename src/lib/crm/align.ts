import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { listCrmContacts } from '@/lib/integrations/notion';
import { beehiivStats, listBeehiivSubscribers } from '@/lib/integrations/beehiiv';
import { upsertContact } from '@/lib/crm/contacts';
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
