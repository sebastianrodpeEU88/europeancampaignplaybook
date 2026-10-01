// The project's auth email settings, kept in the repo and applied from here
// rather than clicked into a dashboard.
//
//   node --env-file=.env.local scripts/supabase-auth-config.mjs            # show
//   node --env-file=.env.local scripts/supabase-auth-config.mjs --apply    # set
//
// Needs SUPABASE_ACCESS_TOKEN: a personal access token from
// supabase.com/dashboard/account/tokens. It is an account-wide credential, so
// keep it in .env.local (never committed) and nowhere else.
//
// What it sets, and why:
//   * both email templates point at /auth/confirm with a token_hash, so a link
//     is verified by a form submission on our own page. Mail security opens
//     links automatically, and a link verified by a plain GET is used up
//     before the recipient ever sees it.
//   * the one-time code lasts 24 hours, for people who read email the next
//     morning or in another time zone.
import fs from 'node:fs';
import path from 'node:path';

const token = process.env.SUPABASE_ACCESS_TOKEN;
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (!token) throw new Error('Missing SUPABASE_ACCESS_TOKEN — add it to .env.local.');
if (!url) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL.');

const ref = new URL(url).hostname.split('.')[0];
const api = `https://api.supabase.com/v1/projects/${ref}/config/auth`;
const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

const read = async () => {
  const res = await fetch(api, { headers });
  if (!res.ok) throw new Error(`GET ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return res.json();
};

const here = path.join(process.cwd(), 'supabase', 'email-templates');
const template = (file) => fs.readFileSync(path.join(here, file), 'utf8').trim();

const desired = {
  mailer_otp_exp: 86400,
  mailer_subjects_magic_link: 'Your sign-in link',
  mailer_templates_magic_link_content: template('magic-link.html'),
  mailer_subjects_confirmation: 'Confirm your european campaign playbook account',
  mailer_templates_confirmation_content: template('confirm-signup.html'),
};

const current = await read();
console.log(`project ${ref}\n`);
for (const key of Object.keys(desired)) {
  const now = current[key];
  const want = desired[key];
  const same = String(now ?? '').trim() === String(want).trim();
  const show = (v) => (typeof v === 'string' && v.length > 60 ? `${v.slice(0, 57).replace(/\s+/g, ' ')}…` : String(v ?? '(unset)'));
  console.log(`${same ? '  same    ' : '  CHANGE  '}${key}`);
  if (!same) {
    console.log(`      now:  ${show(now)}`);
    console.log(`      want: ${show(want)}`);
  }
}

if (!process.argv.includes('--apply')) {
  console.log('\nnothing sent. Re-run with --apply to set these.');
  process.exit(0);
}

const res = await fetch(api, { method: 'PATCH', headers, body: JSON.stringify(desired) });
if (!res.ok) throw new Error(`PATCH ${res.status}: ${(await res.text()).slice(0, 400)}`);
const after = await res.json();
console.log('\napplied.');
console.log('  otp expiry now:', after.mailer_otp_exp, 'seconds');
console.log('  magic link points at /auth/confirm:', String(after.mailer_templates_magic_link_content ?? '').includes('/auth/confirm'));
console.log('  signup link points at /auth/confirm:', String(after.mailer_templates_confirmation_content ?? '').includes('/auth/confirm'));
