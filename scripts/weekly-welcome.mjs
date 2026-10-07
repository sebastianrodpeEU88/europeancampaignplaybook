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
// --redraft rebuilds the same batch, for when the template changes after the
// drafts were already made.
const redraft = process.argv.includes('--redraft');
// --catchup is the one-off backlog: people who signed up in September, are
// still sitting in Lead, and never had a letter from a person. Anyone already
// drafted is left alone so nobody gets two.
const catchup = process.argv.includes('--catchup');
const CATCHUP_FROM = '2026-09-01';
const CATCHUP_TO = '2026-10-01';
const all = await rest(
  catchup
    ? `contacts?select=${cols}&status=eq.active&stage=eq.lead&welcome_drafted_at=is.null` +
        `&or=(and(newsletter_subscribed_at.gte.${CATCHUP_FROM},newsletter_subscribed_at.lt.${CATCHUP_TO}),` +
        `and(newsletter_subscribed_at.is.null,created_at.gte.${CATCHUP_FROM},created_at.lt.${CATCHUP_TO}))` +
        `&order=created_at.asc&limit=500`
    : `contacts?select=${cols}&status=eq.active${redraft ? '' : '&welcome_drafted_at=is.null'}` +
        `&or=(newsletter_subscribed_at.gte.${since},and(newsletter_subscribed_at.is.null,created_at.gte.${since}))` +
        (redraft ? '&welcome_drafted_at=not.is.null' : '') +
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
    catchup
      ? "you signed up to the european campaign playbook back in September and I never wrote to you properly, which I am putting right now. I'm Sebastián, the person behind it."
      : veteran
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
    subject: catchup
      ? 'A belated hello, and a free info session on Thursday'
      : 'Welcome to the european campaign playbook',
    body: lines.join('\n'),
  };
}

// ── the HTML version, matching the house email template ────────────────────
// Palette and structure follow the 2026 workshops mailing: a cream page, a
// white card at 620px, Arial throughout for client support, the amber button
// for the thing we want clicked and the navy one for the alternative.
const PAGE = '#F6F3ED', CARD = '#FFFFFF', INK = '#0B2236', AMBER = '#F5A641';
// No images anywhere in here on purpose. Gmail strips every <img> out of a
// draft written through the API, hosted ones and inline Content-ID ones alike,
// so an image only leaves an empty cell behind. The brand carries on type and
// colour instead. Verified 2026-10-06.

// --unlinked renders the same design with no anchors and no URL text anywhere.
// Gmail's API turns every link, and every URL written as plain text, into a
// google.com/url redirect that survives sending. Nothing to rewrite means the
// draft stays clean, and Sebastian applies the three links by hand in the Gmail
// compose window, where Gmail strips its own annotation on send.
const UNLINKED = process.argv.includes('--unlinked');

const esc = (v) => String(v ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

const button = (href, label, bg, colour) => `
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 26px 0;">
                <tr>
                  <td bgcolor="${bg}" style="border-radius:4px; background-color:${bg};">
                    ${UNLINKED
                      ? `<span style="display:inline-block; padding:13px 22px; font-family:Arial,Helvetica,sans-serif; font-size:15px; line-height:1.2; font-weight:700; color:${colour}; text-decoration:none;">${esc(label)}</span>`
                      : `<a href="${esc(href)}" target="_blank" style="display:inline-block; padding:13px 22px; font-family:Arial,Helvetica,sans-serif; font-size:15px; line-height:1.2; font-weight:700; color:${colour}; text-decoration:none;">${esc(label)}</a>`}
                  </td>
                </tr>
              </table>`;

const paragraph = (html) => `              <p style="margin:0 0 20px 0;">${html}</p>`;

function htmlFor(person) {
  const name = (person.first_name || '').trim();
  const greeting = name ? `Hi ${esc(name)},` : 'Hi,';
  const alreadyBooked = person.stage === 'info_registered';
  const veteran = !['lead', 'reached_out', 'linkedin_lead', 'info_registered'].includes(person.stage);
  const parts = [];

  parts.push(paragraph(greeting));
  parts.push(paragraph(
    catchup
      ? "you signed up to the european campaign playbook back in September and I never wrote to you properly, which I am putting right now. I'm Sebasti\u00e1n, the person behind it."
      : veteran
      ? "good to have you on the newsletter. I'm Sebasti\u00e1n, the person behind the european campaign playbook, and since you have already been to one of our sessions I wanted to write properly rather than let an automated email do it."
      : "thanks for signing up to the european campaign playbook. I'm Sebasti\u00e1n, the person behind it, and I wanted to say hello properly rather than let an automated email do it."
  ));

  if (infoSession) {
    parts.push(paragraph(
      alreadyBooked
        ? `You are already booked for our info session on <strong>${dayMonth(infoSession.startDateTime)} at ${time(infoSession.startDateTime)} CEST</strong>, so I will see you there.`
        : `The easiest way to see how we work is our info session on <strong>${dayMonth(infoSession.startDateTime)} at ${time(infoSession.startDateTime)} CEST</strong>. One hour, online, and free.`
    ));
    if (!alreadyBooked) parts.push(button(link(infoSession), 'Join the info session', AMBER, INK));
  }

  if (workshops.length) {
    parts.push(paragraph('Coming up in the next few weeks:'));
    parts.push(`              <ul style="margin:0 0 22px 0; padding-left:20px;">${workshops
      .map((w) => `<li style="margin:0 0 8px 0;">${UNLINKED ? esc(w.title) : `<a href="${esc(link(w))}" style="color:${INK};">${esc(w.title)}</a>`}, ${dayMonth(w.startDateTime)}</li>`)
      .join('')}</ul>`);
    parts.push(button(`${SITE}/events`, 'See all the workshops', INK, '#FFFFFF'));
  }

  parts.push(paragraph(
    UNLINKED
      ? 'There is also the <strong>digital bootcamp</strong>: eight short days on using AI in EU public affairs, free and self-paced.'
      : `There is also the <a href="${SITE}/digital-bootcamp" style="color:${INK};"><strong>digital bootcamp</strong></a>: eight short days on using AI in EU public affairs, free and self-paced.`
  ));

  if (person.newsletter_status === 'pending') {
    parts.push(paragraph(
      'One small thing: our newsletter confirmation may have landed in your spam folder, or been opened by your IT security before you saw it. If you would like the newsletter, search for it and click confirm, and I will make sure you get everything.'
    ));
  }

  parts.push(paragraph(
    'If any of it is useful, or if you would just like a coffee or a call to talk about what you are working on, just hit reply and we will find a time.'
  ));
  parts.push(`              <p style="margin:0;">Best,<br>Sebasti\u00e1n<br><strong>european campaign playbook</strong></p>`);

  const preview = infoSession
    ? `Our info session on ${dayMonth(infoSession.startDateTime)}, the workshops coming up, and the free bootcamp.`
    : 'The workshops coming up, and the free bootcamp.';

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Welcome to the european campaign playbook</title></head>
<body style="margin:0; padding:0; background-color:${PAGE};">
  <div style="display:none; max-height:0; overflow:hidden; opacity:0;">${esc(preview)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%; background-color:${PAGE};">
    <tr><td align="center" style="padding:30px 16px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%; max-width:620px; background-color:${CARD}; border-collapse:collapse;">
        <tr><td style="padding:24px 36px 22px 36px;">
          <div style="font-family:'Inter Tight','Arial Narrow',Arial,sans-serif; font-size:13px; line-height:1.2; font-weight:700; letter-spacing:-0.01em; color:${INK};">european campaign playbook</div>
        </td></tr>
        <tr><td style="padding:12px 36px 38px 36px; font-family:Arial,Helvetica,sans-serif; font-size:16px; line-height:1.6; color:${INK};">
${parts.join('\n')}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

const drafts = people.map((p) => ({ contactId: p.id, person: p, ...emailFor(p), html: htmlFor(p) }));

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

// --page writes one self-contained file per email, plus an index. Gmail's API
// rewrites every URL into a google.com/url redirect that survives sending, so
// these go out by pasting into a Gmail compose window, where links stay clean and
// the mail still comes from sebastian@campaignplaybook.eu. One email per file so
// that select-all then copy picks up the email and nothing else: no buttons, no
// JavaScript, works the same in any browser. See the 2026-10-06 tests.
if (process.argv.includes('--page')) {
  const { writeFileSync, mkdirSync, rmSync } = await import('node:fs');
  const { resolve, join } = await import('node:path');

  const dir = 'scratchpad/welcome';
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });

  const slug = (addr) => addr.split('@')[0].replace(/[^a-z0-9]+/gi, '-').toLowerCase();
  const files = drafts.map((d, i) => {
    const name = `${String(i + 1).padStart(2, '0')}-${slug(d.to)}.html`;
    // Retitle so eight open tabs are told apart. The title sits outside <body>,
    // so it never travels with a select-all of the email itself.
    const page = d.html.replace(/<title>[^<]*<\/title>/i, `<title>${i + 1}. ${esc(d.to)}</title>`);
    writeFileSync(join(dir, name), page, 'utf8');
    return { name, ...d };
  });

  const rows = files.map((f) => `
      <li>
        <a href="welcome/${f.name}">${esc(f.to)}</a>
        <span>${esc(f.subject)}</span>
      </li>`).join('');

  const index = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Welcome emails to send</title>
<style>
  body { margin:0; padding:40px 16px; background:#EDE7DA; color:#0A1D2B;
         font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif; }
  .wrap { max-width:640px; margin:0 auto; }
  h1 { font-size:22px; margin:0 0 10px 0; }
  ol { padding-left:22px; }
  li { margin:0 0 14px 0; line-height:1.5; }
  li a { color:#0A1D2B; font-weight:600; }
  li span { display:block; font-size:13px; color:#33312D; }
  .how { font-size:14px; line-height:1.7; margin:0 0 26px 0; }
  .how b { font-weight:600; }
</style>
</head>
<body>
  <div class="wrap">
    <h1>Welcome emails, ${files.length} to send</h1>
    <p class="how">Open one, press <b>Cmd+A</b> then <b>Cmd+C</b>, open a Gmail compose
    window, press <b>Cmd+V</b>, fill in the address and subject, send. Each page holds
    one email and nothing else, so select-all picks up exactly what should go.
    Pasting is what keeps the links clean.</p>
    <ol>${rows}</ol>
  </div>
</body>
</html>`;

  writeFileSync('scratchpad/welcome-emails.html', index, 'utf8');
  console.log(`\nWrote ${files.length} emails to ${resolve(dir)}`);
  console.log(`Index: ${resolve('scratchpad/welcome-emails.html')}`);
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
