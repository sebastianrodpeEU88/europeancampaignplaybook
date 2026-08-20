import { Resend } from 'resend';
import { buildEventIcs, buildEventCancelIcs, type IcsEvent } from '@/lib/ics';
import { formatBrusselsRange } from '@/lib/datetime';

// Sending domain verified in Resend is the subdomain updates.campaignplaybook.eu,
// so the From address lives there; replies route to the real inbox. Both are
// overridable via env without a code change.
const FROM = process.env.EMAIL_FROM || 'european campaign playbook <events@updates.campaignplaybook.eu>';
const REPLY_TO = process.env.EMAIL_REPLY_TO || 'sebastian@campaignplaybook.eu';
const SITE = 'https://europeancampaignplaybook.vercel.app';

// Sends the event registration confirmation with the .ics attached. No-ops
// (returns false) when RESEND_API_KEY isn't configured, so registration never
// depends on email being set up. Never throws — callers can ignore the result.
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

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
