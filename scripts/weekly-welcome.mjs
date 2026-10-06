/**
 * Prepares the Tuesday welcome: who signed up this week, what is on, and a
 * personalised email for each of them.
 *
 *   node --env-file=.env.local scripts/weekly-welcome.mjs            # show
 *   node --env-file=.env.local scripts/weekly-welcome.mjs --json     # machine-readable
 *   node --env-file=.env.local scripts/weekly-welcome.mjs --stamp    # mark as drafted
 *
 * It writes nothing to Gmail. It produces the drafts' content; creating them
 * in Gmail is a separate, deliberate step, so nothing is ever sent by a job
 * running on its own.
 */
const SUPABASE = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SANITY = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET;
const SANITY_TOKEN = process.env.SANITY_API_WRITE_TOKEN;
const SITE = 'https://www.campaignplaybook.eu';

// Shared inboxes get a person's welcome letter wrong, and most of ours are
// signup noise rather than people.
const ROLE_ADDRESS = /^(info|admin|office|contact|hello|sales|accounting|procurement|billing|support|team|no-?reply|postmaster|webmaster|secretariat|media|press|comms?|communications)@/i;

// Our own alignment job wrote the existing audience into beehiiv in late
// September, so those contacts carry a recent subscribe date and never
// signed up at all. Welcoming them would thank people for something they
// did not do.
const OUR_OWN_BACKFILL = 'crm-sync';

const rest = async (path) => {
  const res = await fetch(`${SUPABASE}/rest/v1/${path}`, {
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
  });
  if (!res.ok) throw new Error(`supabase ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res.json();
};

const groq = async (query) => {
  const url = new URL(`https://${SANITY}.api.sanity.io/v2026-07-12/data/query/${DATASET}`);
  url.searchParams.set('query', query);
  const res = await fetch(url, { headers: { Authorization: `Bearer ${SANITY_TOKEN}` } });
  const body = await res.json();
  if (!res.ok) throw new Error(`sanity: ${JSON.stringify(body).slice(0, 200)}`);
  return body.result;
};

const dayMonth = (iso) =>
  new Date(iso).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Brussels' });
const time = (iso) =>
  new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Brussels' });

// ── who arrived this week ──────────────────────────────────────────────────
const since = new Date(Date.now() - 7 * 86400000).toISOString();
const cols = 'id,email,first_name,last_name,company,stage,status,newsletter_status,created_at,newsletter_subscribed_at,welcome_drafted_at,utm_medium';
const all = await rest(
  `contacts?select=${cols}&status=eq.active&welcome_drafted_at=is.null` +
    `&or=(newsletter_subscribed_at.gte.${since},and(newsletter_subscribed_at.is.null,created_at.gte.${since}))` +
    `&order=created_at.desc&limit=500`
);

const skipped = { unreachable: [], roleAddress: [], backfilled: [] };
const people = [];
for (const c of all) {
  if (c.utm_medium === OUR_OWN_BACKFILL) {
    skipped.backfilled.push(c.email);
    continue;
  }
  if (c.newsletter_status === 'unsubscribed' || c.newsletter_status === 'bounced') {
    skipped.unreachable.push(`${c.email} (${c.newsletter_status})`);
    continue;
  }
  if (ROLE_ADDRESS.test(c.email)) {
    skipped.roleAddress.push(c.email);
    continue;
  }
  people.push(c);
}

// ── what is on ─────────────────────────────────────────────────────────────
const events = await groq(
  `*[_type=="event" && startDateTime > now()] | order(startDateTime asc)[0...8]{
     title, "slug": slug.current, startDateTime, format, location,
     "isInfoSession": count(tags[@ match "Info session"]) > 0
   }`
);
const infoSession = events.find((e) => e.isInfoSession);
const horizon = Date.now() + 17 * 86400000;
const workshops = events.filter((e) => !e.isInfoSession && new Date(e.startDateTime).getTime() < horizon);

const link = (e) => `${SITE}/events/${e.slug}`;

function emailFor(person) {
  const name = (person.first_name || '').trim();
  const greeting = name ? `Hi ${name},` : 'Hi,';
  const lines = [greeting, ''];
  const veteran = !['lead', 'reached_out', 'linkedin_lead', 'info_registered'].includes(person.stage);
  lines.push(
    veteran
      ? "good to have you on the newsletter. I'm Sebastián, the person behind the european campaign playbook, and since you have already been to one of our sessions I wanted to write properly rather than let an automated email do it."
      : "thanks for signing up to the european campaign playbook. I'm Sebastián, the person behind it, and I wanted to say hello properly rather than let an automated email do it."
  );
  lines.push('');
  lines.push('A few things worth knowing about, all free:');
  lines.push('');
  // Somebody who has already booked should be greeted, rather than invited
  // again to the thing they booked.
  const alreadyBooked = person.stage === 'info_registered';
  if (infoSession && alreadyBooked) {
    lines.push(
      `• You are already booked for the info session on ${dayMonth(infoSession.startDateTime)} at ${time(infoSession.startDateTime)} CEST, so I will see you there.`
    );
  } else if (infoSession) {
    lines.push(
      `• Our info session on ${dayMonth(infoSession.startDateTime)} at ${time(infoSession.startDateTime)} CEST. One hour, online, and the easiest way to see how we work: ${link(infoSession)}`
    );
  }
  if (workshops.length) {
    lines.push('');
    lines.push('• Workshops coming up:');
    for (const w of workshops) {
      lines.push(`   – ${w.title}, ${dayMonth(w.startDateTime)}: ${link(w)}`);
    }
  }
  lines.push('');
  lines.push(
    `• The digital bootcamp, eight short days on using AI in EU public affairs, free and self-paced: ${SITE}/digital-bootcamp`
  );
  if (person.newsletter_status === 'pending') {
    lines.push('');
    lines.push(
      'One small thing: our newsletter confirmation may have landed in your spam folder or been opened by your IT security before you saw it. If you would like the newsletter, search for it and click confirm, and I will make sure you get everything.'
    );
  }
  lines.push('');
  lines.push('If any of it is useful, or if you would just like a coffee or a call to talk about what you are working on, reply to this and we will find a time.');
  lines.push('');
  lines.push('Best,');
  lines.push('Sebastián');
  return {
    to: person.email,
    subject: 'Welcome to the european campaign playbook',
    body: lines.join('\n'),
  };
}

const drafts = people.map((p) => ({ contactId: p.id, person: p, ...emailFor(p) }));

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ drafts, skipped, infoSession, workshops }, null, 2));
} else {
  console.log(`New this week and not yet welcomed: ${all.length}`);
  console.log(`  to draft: ${drafts.length}`);
  console.log(`  skipped, unreachable: ${skipped.unreachable.length}  ${skipped.unreachable.slice(0, 6).join(', ')}`);
  console.log(`  skipped, shared inbox: ${skipped.roleAddress.length}  ${skipped.roleAddress.slice(0, 6).join(', ')}`);
  console.log(`  skipped, our own import rather than a signup: ${skipped.backfilled.length}`);
  console.log(`\nInfo session: ${infoSession ? `${infoSession.title} — ${dayMonth(infoSession.startDateTime)}` : 'none upcoming'}`);
  console.log(`Workshops in the next 17 days: ${workshops.length}`);
  for (const w of workshops) console.log(`   ${dayMonth(w.startDateTime)}  ${w.title}`);
  console.log('\n--- sample draft ---');
  if (drafts[0]) {
    console.log(`To: ${drafts[0].to}`);
    console.log(`Subject: ${drafts[0].subject}\n`);
    console.log(drafts[0].body);
  }
}

if (process.argv.includes('--stamp')) {
  const ids = drafts.map((d) => d.contactId);
  if (ids.length) {
    const res = await fetch(`${SUPABASE}/rest/v1/contacts?id=in.(${ids.join(',')})`, {
      method: 'PATCH',
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ welcome_drafted_at: new Date().toISOString() }),
    });
    console.log(`\nstamped ${res.ok ? ids.length : 0} contacts as drafted`);
  }
}
