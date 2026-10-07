import { Resend } from 'resend';
import { buildEventIcs, buildEventCancelIcs, type IcsEvent } from '@/lib/ics';
import { formatBrusselsRange } from '@/lib/datetime';
import { ADMIN_EMAIL } from '@/lib/admin';

// Sending domain verified in Resend is the subdomain updates.campaignplaybook.eu,
// so the From address lives there; replies route to the real inbox. Both are
// overridable via env without a code change.
const FROM = process.env.EMAIL_FROM || 'european campaign playbook <events@updates.campaignplaybook.eu>';
const REPLY_TO = process.env.EMAIL_REPLY_TO || 'sebastian@campaignplaybook.eu';
// Account emails come from the same address as Supabase's sign-in emails.
const AUTH_FROM = 'european campaign playbook <noreply@updates.campaignplaybook.eu>';
const SITE = 'https://www.campaignplaybook.eu';

// Generic internal email (e.g. the daily activity digest to the team). No-ops
// (returns false) when RESEND_API_KEY isn't set; never throws.
export async function sendAdminEmail(to: string, subject: string, html: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;
  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({ from: FROM, to, replyTo: REPLY_TO, subject, html });
    return true;
  } catch (err) {
    console.error('sendAdminEmail failed', err);
    return false;
  }
}

// Sends the event registration confirmation with the .ics attached. No-ops
// (returns false) when RESEND_API_KEY isn't configured, so registration never
// depends on email being set up. Never throws — callers can ignore the result.
// The meeting link goes only to people who have registered, so it appears in
// the confirmation and the reminder, and nowhere on the public event page.
function joinRowHtml(joinUrl?: string | null): string {
  if (!joinUrl) return '';
  return `<tr><td style="padding:2px 12px 2px 0;color:#555">Join</td><td style="padding:2px 0"><a href="${escapeHtml(
    joinUrl
  )}" style="color:#0A1D2B;font-weight:600">${escapeHtml(joinUrl)}</a></td></tr>`;
}

function joinLineText(joinUrl?: string | null): string[] {
  return joinUrl ? [`Join:  ${joinUrl}`] : [];
}

export async function sendRegistrationEmail(to: string, event: IcsEvent): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  try {
    const resend = new Resend(apiKey);
    const when = formatBrusselsRange(event.startDateTime, event.endDateTime);
    const eventUrl = `${SITE}/events/${event.slug}`;
    const ics = buildEventIcs(event);

    const html = `
      <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#111;line-height:1.6;max-width:560px;margin:0 auto">
        <h1 style="font-size:20px;margin:0 0 16px">You're registered ✓</h1>
        <p style="margin:0 0 16px">Thanks for registering — here are the details:</p>
        <table style="border-collapse:collapse;margin:0 0 20px">
          <tr><td style="padding:2px 12px 2px 0;color:#555">Event</td><td style="padding:2px 0"><strong>${escapeHtml(event.title)}</strong></td></tr>
          <tr><td style="padding:2px 12px 2px 0;color:#555">When</td><td style="padding:2px 0">${escapeHtml(when)}</td></tr>
          <tr><td style="padding:2px 12px 2px 0;color:#555">Where</td><td style="padding:2px 0">${escapeHtml(event.location)}</td></tr>
          ${joinRowHtml(event.joinUrl)}
        </table>
        <p style="margin:0 0 16px">A calendar invite (<code>.ics</code>) is attached — open it to add the event to your calendar.</p>
        <p style="margin:0 0 24px"><a href="${eventUrl}" style="color:#0A1D2B;font-weight:600">View the event page →</a></p>
        <p style="margin:0;color:#777;font-size:13px">european campaign playbook · Reply to this email if you have any questions.</p>
      </div>`;

    const text = [
      "You're registered ✓",
      '',
      `Event: ${event.title}`,
      `When:  ${when}`,
      `Where: ${event.location}`,
      ...joinLineText(event.joinUrl),
      '',
      'A calendar invite (.ics) is attached — open it to add the event to your calendar.',
      `Event page: ${eventUrl}`,
      '',
      'european campaign playbook',
    ].join('\n');

    await resend.emails.send({
      from: FROM,
      to,
      replyTo: REPLY_TO,
      subject: `You're registered: ${event.title}`,
      html,
      text,
      attachments: [{ filename: `${event.slug}.ics`, content: Buffer.from(ics) }],
    });
    return true;
  } catch (err) {
    console.error('sendRegistrationEmail failed:', err);
    return false;
  }
}

// Reminder ahead of the event, for registered members. Includes the .ics again
// in case they didn't add it. Same guards (no-op without a key, never throws).
export async function sendReminderEmail(to: string, event: IcsEvent): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  try {
    const resend = new Resend(apiKey);
    const when = formatBrusselsRange(event.startDateTime, event.endDateTime);
    const eventUrl = `${SITE}/events/${event.slug}`;
    const ics = buildEventIcs(event);

    const html = `
      <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#111;line-height:1.6;max-width:560px;margin:0 auto">
        <h1 style="font-size:20px;margin:0 0 16px">Reminder: your event is coming up</h1>
        <p style="margin:0 0 16px">A quick reminder that you're registered for:</p>
        <table style="border-collapse:collapse;margin:0 0 20px">
          <tr><td style="padding:2px 12px 2px 0;color:#555">Event</td><td style="padding:2px 0"><strong>${escapeHtml(event.title)}</strong></td></tr>
          <tr><td style="padding:2px 12px 2px 0;color:#555">When</td><td style="padding:2px 0">${escapeHtml(when)}</td></tr>
          <tr><td style="padding:2px 12px 2px 0;color:#555">Where</td><td style="padding:2px 0">${escapeHtml(event.location)}</td></tr>
          ${joinRowHtml(event.joinUrl)}
        </table>
        <p style="margin:0 0 16px">The calendar invite (<code>.ics</code>) is attached again for convenience.</p>
        <p style="margin:0 0 24px"><a href="${eventUrl}" style="color:#0A1D2B;font-weight:600">View the event page →</a></p>
        <p style="margin:0;color:#777;font-size:13px">european campaign playbook · Reply to this email if you have any questions.</p>
      </div>`;

    const text = [
      'Reminder: your event is coming up',
      '',
      `Event: ${event.title}`,
      `When:  ${when}`,
      `Where: ${event.location}`,
      ...joinLineText(event.joinUrl),
      '',
      'The calendar invite (.ics) is attached again for convenience.',
      `Event page: ${eventUrl}`,
      '',
      'european campaign playbook',
    ].join('\n');

    await resend.emails.send({
      from: FROM,
      to,
      replyTo: REPLY_TO,
      subject: `Reminder: ${event.title}`,
      html,
      text,
      attachments: [{ filename: `${event.slug}.ics`, content: Buffer.from(ics) }],
    });
    return true;
  } catch (err) {
    console.error('sendReminderEmail failed:', err);
    return false;
  }
}

// Confirms a cancelled registration, with a METHOD:CANCEL .ics so calendars
// remove the event. Same guarantees as sendRegistrationEmail (no-op without a
// key, never throws).
export async function sendCancellationEmail(to: string, event: IcsEvent): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  try {
    const resend = new Resend(apiKey);
    const when = formatBrusselsRange(event.startDateTime, event.endDateTime);
    const eventUrl = `${SITE}/events/${event.slug}`;
    const ics = buildEventCancelIcs(event);

    const html = `
      <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#111;line-height:1.6;max-width:560px;margin:0 auto">
        <h1 style="font-size:20px;margin:0 0 16px">Registration cancelled</h1>
        <p style="margin:0 0 16px">Your registration for the following event has been cancelled:</p>
        <table style="border-collapse:collapse;margin:0 0 20px">
          <tr><td style="padding:2px 12px 2px 0;color:#555">Event</td><td style="padding:2px 0"><strong>${escapeHtml(event.title)}</strong></td></tr>
          <tr><td style="padding:2px 12px 2px 0;color:#555">When</td><td style="padding:2px 0">${escapeHtml(when)}</td></tr>
          <tr><td style="padding:2px 12px 2px 0;color:#555">Where</td><td style="padding:2px 0">${escapeHtml(event.location)}</td></tr>
        </table>
        <p style="margin:0 0 16px">The attached calendar update will remove the event from your calendar.</p>
        <p style="margin:0 0 24px">Changed your mind? <a href="${eventUrl}" style="color:#0A1D2B;font-weight:600">Register again →</a></p>
        <p style="margin:0;color:#777;font-size:13px">european campaign playbook · Reply to this email if you have any questions.</p>
      </div>`;

    const text = [
      'Registration cancelled',
      '',
      `Event: ${event.title}`,
      `When:  ${when}`,
      `Where: ${event.location}`,
      '',
      'The attached calendar update will remove the event from your calendar.',
      `Register again: ${eventUrl}`,
      '',
      'european campaign playbook',
    ].join('\n');

    await resend.emails.send({
      from: FROM,
      to,
      replyTo: REPLY_TO,
      subject: `Registration cancelled: ${event.title}`,
      html,
      text,
      attachments: [{ filename: `${event.slug}-cancelled.ics`, content: Buffer.from(ics) }],
    });
    return true;
  } catch (err) {
    console.error('sendCancellationEmail failed:', err);
    return false;
  }
}

// The one final reminder to someone who started signing up but never clicked
// the first link. Sent from the same address as the sign-in emails. Unlike the
// helpers above it checks Resend's reply, because the admin panel records the
// reminder as sent only when this returns true.
export async function sendConfirmationReminderEmail(
  to: string,
  { signupDate, confirmUrl }: { signupDate: string; confirmUrl: string }
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  const url = escapeHtml(confirmUrl);
  const html = `
    <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#111;line-height:1.6;max-width:560px;margin:0 auto">
      <h1 style="font-size:20px;margin:0 0 16px">Please confirm your account</h1>
      <p style="margin:0 0 16px">You signed up for an account at campaignplaybook.eu on <strong>${escapeHtml(signupDate)}</strong>, but you have not confirmed it yet.</p>
      <p style="margin:0 0 20px">We need you to confirm your account before we can communicate with you any further. It takes one click:</p>
      <p style="margin:0 0 12px"><a href="${url}" style="display:inline-block;background:#dd3c13;color:#ffffff;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:2px">Confirm my account</a></p>
      <p style="margin:0 0 24px;color:#777;font-size:12px">If the button does not work, copy this link into your browser:<br><a href="${url}" style="color:#0A1D2B;word-break:break-all">${url}</a></p>
      <p style="margin:0 0 16px">This is the last reminder you will receive. If you do not confirm, we will not contact you again.</p>
      <p style="margin:0 0 24px">If you did not sign up, you can ignore this email.</p>
      <p style="margin:0">european campaign playbook</p>
    </div>`;

  const text = [
    'Please confirm your account',
    '',
    `You signed up for an account at campaignplaybook.eu on ${signupDate}, but you have not confirmed it yet.`,
    '',
    'We need you to confirm your account before we can communicate with you any further. It takes one click:',
    '',
    `Confirm my account: ${confirmUrl}`,
    '',
    'This is the last reminder you will receive. If you do not confirm, we will not contact you again.',
    '',
    'If you did not sign up, you can ignore this email.',
    '',
    'european campaign playbook',
  ].join('\n');

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: AUTH_FROM,
      to,
      // The admin gets a hidden copy of every real reminder (previews already go to them).
      ...(to.toLowerCase() === ADMIN_EMAIL ? {} : { bcc: ADMIN_EMAIL }),
      replyTo: REPLY_TO,
      // Previews use the same subject: Gmail groups them with the admin's copies of
      // real reminders and titles the thread after the first one.
      subject: 'Please confirm your european campaign playbook account',
      html,
      text,
    });
    if (error) {
      console.error('sendConfirmationReminderEmail failed:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('sendConfirmationReminderEmail failed:', err);
    return false;
  }
}

// For people who have an account and have never managed to open it: the ones
// whose sign-in link was eaten by their own mail security, and the members
// moved over from the old platform who were never sent one. Says when they
// signed up, and carries a link that signs them in.
export async function sendAccountAccessEmail(
  to: string,
  { signupDate, signInUrl }: { signupDate: string; signInUrl: string }
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  const url = escapeHtml(signInUrl);
  const html = `
    <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#111;line-height:1.6;max-width:560px;margin:0 auto">
      <h1 style="font-size:20px;margin:0 0 16px">Your account is ready</h1>
      <p style="margin:0 0 16px">You created an account at campaignplaybook.eu on <strong>${escapeHtml(signupDate)}</strong>.</p>
      <p style="margin:0 0 20px">To open the workshops, the articles, the digital bootcamp and everything else, we need one click from you. It signs you in and shows us a human is at the keyboard.</p>
      <p style="margin:0 0 12px"><a href="${url}" style="display:inline-block;background:#dd3c13;color:#ffffff;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:2px">Open my account</a></p>
      <p style="margin:0 0 24px;color:#777;font-size:12px">If the button does not work, copy this link into your browser:<br><a href="${url}" style="color:#0A1D2B;word-break:break-all">${url}</a></p>
      <p style="margin:0 0 16px">If you tried to sign in before and it kept asking for another link, that was a fault on our side. Email security at many organisations opens links automatically, which used up the link before you clicked it. It is fixed, and this one will wait for you.</p>
      <p style="margin:0 0 24px">If you did not create this account, you can ignore this email.</p>
      <p style="margin:0">european campaign playbook</p>
    </div>`;

  const text = [
    'Your account is ready',
    '',
    `You created an account at campaignplaybook.eu on ${signupDate}.`,
    '',
    'To open the workshops, the articles, the digital bootcamp and everything else, we need one click from you. It signs you in and shows us a human is at the keyboard.',
    '',
    `Open my account: ${signInUrl}`,
    '',
    'If you tried to sign in before and it kept asking for another link, that was a fault on our side. Email security at many organisations opens links automatically, which used up the link before you clicked it. It is fixed, and this one will wait for you.',
    '',
    'If you did not create this account, you can ignore this email.',
    '',
    'european campaign playbook',
  ].join('\n');

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: AUTH_FROM,
      to,
      ...(to.toLowerCase() === ADMIN_EMAIL ? {} : { bcc: ADMIN_EMAIL }),
      replyTo: REPLY_TO,
      subject: 'Your european campaign playbook account is ready',
      html,
      text,
    });
    if (error) {
      console.error('sendAccountAccessEmail failed:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('sendAccountAccessEmail failed:', err);
    return false;
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── The free workshop ─────────────────────────────────────────────────────
// Claiming is a request a person reads, and both answers are written to sound
// like a person wrote them. An approval sends no mail of its own: approving
// books the seat, so the claimant gets the ordinary registration email with
// its calendar invite and joining link, exactly as a paying member would.

export async function sendFreeWorkshopRejected(
  to: string,
  opts: { firstName?: string | null; eventTitle: string; reason: string; note?: string | null }
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;
  try {
    const resend = new Resend(apiKey);
    const hello = opts.firstName ? `Hi ${escapeHtml(opts.firstName)},` : 'Hi,';
    // A refusal that offers nothing is the kind that ends a relationship, so
    // both versions point at the things that are genuinely still open.
    const html = `
      <div style="font-family:system-ui,-apple-system,'Segoe UI',Arial,sans-serif;font-size:16px;line-height:1.6;color:#0A1D2B;max-width:560px">
        <p style="margin:0 0 16px">${hello}</p>
        <p style="margin:0 0 16px">Thanks for asking about a free place at <strong>${escapeHtml(opts.eventTitle)}</strong>. I am not able to give you one this time.</p>
        <p style="margin:0 0 16px">We offer <strong>one free workshop per person</strong>, so that as many people as possible get to try what we do before deciding whether it is for them. ${escapeHtml(opts.reason)}${opts.note ? ` ${escapeHtml(opts.note)}` : ''}</p>
        <p style="margin:0 0 16px">If that looks like a misunderstanding, I would genuinely rather hear about it than have you walk away. Write to me at <a href="mailto:sebastian@campaignplaybook.eu" style="color:#0A1D2B">sebastian@campaignplaybook.eu</a> and I will look again.</p>
        <p style="margin:0 0 16px">In the meantime the info session is free and always open, and so is the digital bootcamp. Membership opens every workshop on the calendar.</p>
        <p style="margin:0;color:#777;font-size:13px">Sebasti&aacute;n &middot; european campaign playbook</p>
      </div>`;
    const text = [
      opts.firstName ? `Hi ${opts.firstName},` : 'Hi,',
      '',
      `Thanks for asking about a free place at ${opts.eventTitle}. I am not able to give you one this time.`,
      '',
      `We offer one free workshop per person, so that as many people as possible get to try what we do before deciding whether it is for them. ${opts.reason}${opts.note ? ` ${opts.note}` : ''}`,
      '',
      'If that looks like a misunderstanding, I would genuinely rather hear about it than have you walk away. Write to me at sebastian@campaignplaybook.eu and I will look again.',
      '',
      'In the meantime the info session is free and always open, and so is the digital bootcamp. Membership opens every workshop on the calendar.',
      '',
      'Sebastián, european campaign playbook',
    ].join('\n');
    await resend.emails.send({
      from: FROM,
      to,
      replyTo: REPLY_TO,
      subject: `About your free workshop request`,
      html,
      text,
    });
    return true;
  } catch (err) {
    console.error('sendFreeWorkshopRejected failed:', err);
    return false;
  }
}

/**
 * Sent the instant somebody claims, so the page is not the only thing that
 * ever told them. Deliberately warm and short: it sets the expectation that a
 * person reads it, states the one-per-person policy before it can feel like a
 * surprise, and promises nothing about timing it cannot keep.
 */
export async function sendFreeWorkshopClaimed(
  to: string,
  opts: { firstName?: string | null; eventTitle: string; when: string }
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;
  try {
    const resend = new Resend(apiKey);
    const hello = opts.firstName ? `Hi ${escapeHtml(opts.firstName)},` : 'Hi,';
    const html = `
      <div style="font-family:system-ui,-apple-system,'Segoe UI',Arial,sans-serif;font-size:16px;line-height:1.6;color:#0A1D2B;max-width:560px">
        <p style="margin:0 0 16px">${hello}</p>
        <p style="margin:0 0 16px">Good choice. You have claimed a free place at <strong>${escapeHtml(opts.eventTitle)}</strong>, ${escapeHtml(opts.when)}.</p>
        <p style="margin:0 0 16px">Here is how it works: everyone gets <strong>one workshop on the house</strong>, no catch and nothing to cancel afterwards. We keep it to one per person so that as many people as possible get to try what we do.</p>
        <p style="margin:0 0 16px">I read every one of these myself, so give me a little time and I will come back to you and confirm. Nothing is booked until I do, and you do not need to do anything in the meantime.</p>
        <p style="margin:0 0 16px">If you have a question before then, just reply to this.</p>
        <p style="margin:0;color:#777;font-size:13px">Sebasti&aacute;n &middot; european campaign playbook</p>
      </div>`;
    const text = [
      opts.firstName ? `Hi ${opts.firstName},` : 'Hi,',
      '',
      `Good choice. You have claimed a free place at ${opts.eventTitle}, ${opts.when}.`,
      '',
      'Here is how it works: everyone gets one workshop on the house, no catch and nothing to cancel afterwards. We keep it to one per person so that as many people as possible get to try what we do.',
      '',
      'I read every one of these myself, so give me a little time and I will come back to you and confirm. Nothing is booked until I do, and you do not need to do anything in the meantime.',
      '',
      'If you have a question before then, just reply to this.',
      '',
      'Sebastián, european campaign playbook',
    ].join('\n');
    await resend.emails.send({
      from: FROM,
      to,
      replyTo: REPLY_TO,
      subject: `Your free workshop claim: ${opts.eventTitle}`,
      html,
      text,
    });
    return true;
  } catch (err) {
    console.error('sendFreeWorkshopClaimed failed:', err);
    return false;
  }
}
