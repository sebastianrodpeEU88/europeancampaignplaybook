// Purge unconfirmed bot / abandoned signups from Supabase Auth.
//
// A confirmed user can't be a bot (they clicked the email link), so we only
// ever touch accounts that never confirmed AND are older than the cutoff.
// Dry-run by default — it just lists candidates. Add --delete to remove them.
//
// Usage (from the project root):
//   node --env-file=.env.local scripts/purge-bot-signups.mjs              # dry run, 72h
//   node --env-file=.env.local scripts/purge-bot-signups.mjs --hours=48   # dry run, 48h
//   node --env-file=.env.local scripts/purge-bot-signups.mjs --delete     # actually delete
//
// Uses the service-role key, so run it locally only — never expose this key.

import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error(
    'Missing env. Run with:  node --env-file=.env.local scripts/purge-bot-signups.mjs'
  );
  process.exit(1);
}

const args = process.argv.slice(2);
const doDelete = args.includes('--delete');
const hoursArg = args.find((a) => a.startsWith('--hours='));
const hours = hoursArg ? Number(hoursArg.split('=')[1]) : 72;
const cutoff = Date.now() - hours * 3_600_000;

const admin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Page through every auth user.
const all = [];
for (let page = 1; ; page++) {
  const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
  if (error) {
    console.error('listUsers failed:', error.message);
    process.exit(1);
  }
  const users = data.users ?? [];
  all.push(...users);
  if (users.length < 1000) break;
}

const candidates = all.filter(
  (u) => !u.email_confirmed_at && u.created_at && new Date(u.created_at).getTime() < cutoff
);

console.log(`Total accounts:                 ${all.length}`);
console.log(`Unconfirmed, older than ${hours}h:   ${candidates.length}\n`);
for (const u of candidates) {
  console.log(`  ${(u.email ?? '(no email)').padEnd(42)} created ${u.created_at}`);
}

if (candidates.length === 0) {
  console.log('\nNothing to purge.');
  process.exit(0);
}

if (!doDelete) {
  console.log('\nDRY RUN — nothing deleted. Re-run with --delete to remove the accounts above.');
  process.exit(0);
}

console.log('\nDeleting…');
let ok = 0;
let fail = 0;
for (const u of candidates) {
  const { error } = await admin.auth.admin.deleteUser(u.id);
  if (error) {
    fail++;
    console.error(`  ✗ ${u.email}: ${error.message}`);
  } else {
    ok++;
  }
}
console.log(`\nDone. Deleted ${ok}, failed ${fail}.`);
