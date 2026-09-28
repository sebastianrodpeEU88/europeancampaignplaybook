// Health check for the contact layer.
//
//   node --env-file=.env.local scripts/crm-check.mjs
//
// Says whether supabase/schema.sql has been applied, how many contacts exist,
// how many have reached Notion and beehiiv, and what is sitting in the outbox.
import { createClient } from '@supabase/supabase-js';

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const probe = await admin.from('contacts').select('id').limit(1);
if (probe.error) {
  console.log('The contact tables are not there yet:', probe.error.message);
  console.log('\nRun supabase/schema.sql in the Supabase SQL editor, then this check again.');
  process.exit(0);
}

const count = async (table, build = (q) => q) => {
  const { count } = await build(admin.from(table).select('id', { count: 'exact', head: true }));
  return count ?? 0;
};

const [total, linked, members, optIns, onNotion, onBeehiiv, pending, stuck] = await Promise.all([
  count('contacts'),
  count('contacts', (q) => q.not('user_id', 'is', null)),
  count('contacts', (q) => q.not('membership_status', 'is', null)),
  count('contacts', (q) => q.eq('newsletter_opt_in', true)),
  count('contacts', (q) => q.not('notion_page_id', 'is', null)),
  count('contacts', (q) => q.not('beehiiv_subscription_id', 'is', null)),
  count('contact_sync_queue', (q) => q.is('synced_at', null)),
  count('contact_sync_queue', (q) => q.is('synced_at', null).gte('attempts', 5)),
]);

console.log(`contacts                 ${total}`);
console.log(`  linked to an account   ${linked}`);
console.log(`  with a membership      ${members}`);
console.log(`  newsletter opt-ins     ${optIns}`);
console.log(`  on a Notion page       ${onNotion}`);
console.log(`  on a beehiiv record    ${onBeehiiv}`);
console.log(`queue pending            ${pending}${stuck ? `  (${stuck} stuck after 5 tries)` : ''}`);

const { data: recent } = await admin
  .from('contacts')
  .select('email, membership_tier, membership_status, events_registered, bootcamp_days_done, newsletter_opt_in, last_synced_at')
  .order('updated_at', { ascending: false })
  .limit(8);
console.table(recent ?? []);

const { data: failing } = await admin
  .from('contact_sync_queue')
  .select('attempts, last_error, contacts(email)')
  .is('synced_at', null)
  .not('last_error', 'is', null)
  .limit(5);
if (failing?.length) {
  console.log('\nerrors waiting to retry:');
  for (const row of failing) {
    const contact = Array.isArray(row.contacts) ? row.contacts[0] : row.contacts;
    console.log(`  ${contact?.email ?? '-'} (try ${row.attempts}): ${row.last_error}`);
  }
}
