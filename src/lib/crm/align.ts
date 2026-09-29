import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { listCrmContacts } from '@/lib/integrations/notion';
import { beehiivStats } from '@/lib/integrations/beehiiv';
import { upsertContact } from '@/lib/crm/contacts';

// Lining the three systems up: the contacts table is the master list, Notion
// holds rows that predate it, and beehiiv is the channel that has to be able
// to reach everybody at once.
//
// The consent basis travels with every subscriber, so a send can go to the
// whole list or only to the people who asked for a newsletter.

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

export async function inventory() {
  const admin = createAdminClient();
  const { data: contacts } = await admin
    .from('contacts')
    .select('email, email_normalised, status, newsletter_opt_in, newsletter_status, membership_status, user_id, beehiiv_subscription_id');

  const rows = contacts ?? [];
  const active = rows.filter((c) => c.status === 'active');
  const byConsent: Record<string, number> = {};
  for (const c of active) byConsent[consentBasis(c)] = (byConsent[consentBasis(c)] ?? 0) + 1;

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
export async function importFromNotion(apply: boolean) {
  const admin = createAdminClient();
  const { data: contacts } = await admin.from('contacts').select('email_normalised');
  const known = new Set((contacts ?? []).map((c) => c.email_normalised));

  const notion = await listCrmContacts();
  if (!notion.ok) return { ok: false, error: notion.error };

  const missing = notion.contacts.filter((n) => !known.has(n.email.toLowerCase().trim()));
  if (!apply) return { ok: true, wouldImport: missing.length, sample: missing.slice(0, 20) };

  let imported = 0;
  for (const person of missing) {
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
  return { ok: true, imported, of: missing.length };
}
