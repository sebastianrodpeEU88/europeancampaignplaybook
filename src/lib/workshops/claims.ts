/**
 * Claiming a free workshop: making the request, reading the queue, answering it.
 *
 * A claim never books a seat. It asks, a person answers, and an approval hands
 * the claimant back to the ordinary registration path so the seat, the
 * calendar invite and the reminder all still come from one place.
 */
import { createAdminClient } from '@/lib/supabase/admin';
import { ADMIN_EMAIL } from '@/lib/admin';
import {
  sendAdminEmail,
  sendFreeWorkshopClaimed,
  sendFreeWorkshopRejected,
  sendRegistrationEmail,
} from '@/lib/email';
import { formatBrusselsRange } from '@/lib/datetime';
import { getEventBySlug, getEventJoinUrl } from '@/lib/content';
import { recommend, REJECT_REASONS, type ClaimantFacts, type Recommendation, type RejectReason } from './recommend';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.campaignplaybook.eu';

export type ClaimStatus = 'pending' | 'approved' | 'rejected' | 'withdrawn' | 'lapsed';

export type Claim = {
  id: string;
  userId: string;
  contactId: string | null;
  eventSlug: string;
  eventTitle: string | null;
  eventStart: string | null;
  status: ClaimStatus;
  recommendation: Recommendation | null;
  claimedAt: string;
  decidedAt: string | null;
  rejectReason: string | null;
  decisionNote: string | null;
  note: string | null;
  bookedAt: string | null;
};

/** What the event page needs to know to pick a button. */
export type ClaimState =
  | { kind: 'none'; freeWorkshopAvailable: boolean }
  | { kind: 'pending'; eventSlug: string }
  | { kind: 'approved'; eventSlug: string }
  | { kind: 'rejected'; eventSlug: string };

const toClaim = (r: Record<string, unknown>): Claim => ({
  id: r.id as string,
  userId: r.user_id as string,
  contactId: (r.contact_id as string) ?? null,
  eventSlug: r.event_slug as string,
  eventTitle: (r.event_title as string) ?? null,
  eventStart: (r.event_start as string) ?? null,
  status: r.status as ClaimStatus,
  recommendation: (r.recommendation as Recommendation) ?? null,
  claimedAt: r.claimed_at as string,
  decidedAt: (r.decided_at as string) ?? null,
  rejectReason: (r.reject_reason as string) ?? null,
  decisionNote: (r.decision_note as string) ?? null,
  note: (r.note as string) ?? null,
  bookedAt: (r.booked_at as string) ?? null,
});

/**
 * Everything the scoring needs, from the three places it lives: the contact,
 * the auth account, and what they have actually booked.
 */
export async function gatherFacts(userId: string, email: string): Promise<ClaimantFacts> {
  const db = createAdminClient();
  const [{ data: contact }, { data: auth }, { data: regs }] = await Promise.all([
    db.from('contacts').select('*').eq('user_id', userId).maybeSingle(),
    db.auth.admin.getUserById(userId),
    db.from('event_registrations').select('attended_at,event_start').eq('user_id', userId),
  ]);

  const rows = regs ?? [];
  const now = Date.now();
  return {
    email,
    stage: (contact?.stage as string) ?? null,
    status: (contact?.status as string) ?? null,
    newsletterStatus: (contact?.newsletter_status as string) ?? null,
    emailsSent: (contact?.emails_sent as number) ?? null,
    emailsClicked: (contact?.emails_clicked as number) ?? null,
    openRate: (contact?.open_rate as number) ?? null,
    careerStage: (contact?.career_stage as string) ?? null,
    organisationType: (contact?.organisation_type as string) ?? null,
    company: (contact?.company as string) ?? null,
    position: (contact?.position as string) ?? null,
    firstName: (contact?.first_name as string) ?? null,
    accountConfirmed: Boolean(auth?.user?.email_confirmed_at),
    accountSignedIn: Boolean(auth?.user?.last_sign_in_at),
    freeWorkshopUsedAt: (contact?.free_workshop_used_at as string) ?? null,
    priorRegistrations: rows.length,
    attendedCount: rows.filter((r) => r.attended_at).length,
    // Counted the same way the funnel counts it: the event has been and gone
    // and nobody ticked them off.
    noShowCount: rows.filter(
      (r) => !r.attended_at && r.event_start && new Date(r.event_start).getTime() < now - 4 * 3600_000
    ).length,
  };
}

export type ClaimOutcome =
  | { ok: true; claim: Claim }
  | { ok: false; reason: 'already_used' | 'already_claimed' | 'no_contact' | 'failed'; message: string };

/** Makes the request, scores it, and tells Sebastián it is waiting. */
export async function createClaim(
  userId: string,
  email: string,
  event: { slug: string; title: string; startDateTime: string; endDateTime?: string | null },
  note?: string
): Promise<ClaimOutcome> {
  const db = createAdminClient();
  // Anything pending whose workshop has already begun is spent, so it is
  // cleared before the one-live-claim rule is applied to this person.
  await lapseStaleClaims(userId);

  const { data: contact } = await db.from('contacts').select('id,free_workshop_used_at').eq('user_id', userId).maybeSingle();
  if (contact?.free_workshop_used_at) {
    return { ok: false, reason: 'already_used', message: 'Your free workshop has already been used.' };
  }

  const { data: live } = await db
    .from('free_workshop_claims')
    .select('id,event_slug,status')
    .eq('user_id', userId)
    .in('status', ['pending', 'approved'])
    .maybeSingle();
  if (live) {
    return {
      ok: false,
      reason: 'already_claimed',
      message:
        live.status === 'pending'
          ? 'You already have a claim waiting to be checked.'
          : 'Your free workshop is already approved for another date.',
    };
  }

  const facts = await gatherFacts(userId, email);
  const recommendation = recommend(facts);

  const { data, error } = await db
    .from('free_workshop_claims')
    .insert({
      user_id: userId,
      contact_id: contact?.id ?? null,
      event_slug: event.slug,
      event_title: event.title,
      event_start: event.startDateTime,
      note: note?.trim() ? note.trim().slice(0, 500) : null,
      recommendation,
      notified_at: new Date().toISOString(),
    })
    .select('*')
    .single();
  if (error || !data) {
    return { ok: false, reason: 'failed', message: 'Something went wrong. Please try again.' };
  }

  // Told straight away, so the page is never the only thing that said so.
  await sendFreeWorkshopClaimed(email, {
    firstName: facts.firstName,
    eventTitle: event.title,
    when: formatBrusselsRange(event.startDateTime, event.endDateTime ?? undefined),
  });
  await notifyAdmin(email, facts, recommendation, event, note);
  return { ok: true, claim: toClaim(data) };
}

async function notifyAdmin(
  email: string,
  facts: ClaimantFacts,
  rec: Recommendation,
  event: { slug: string; title: string; startDateTime: string; endDateTime?: string | null },
  note?: string
): Promise<void> {
  const verdict =
    rec.verdict === 'accept' ? 'Looks fine' : rec.verdict === 'reject' ? 'Would refuse' : 'Worth a look';
  const when = formatBrusselsRange(event.startDateTime, event.endDateTime ?? undefined);
  const row = (k: string, v: string) =>
    `<tr><td style="padding:2px 12px 2px 0;color:#555">${k}</td><td style="padding:2px 0">${v}</td></tr>`;

  const html = `
    <div style="font-family:system-ui,-apple-system,'Segoe UI',Arial,sans-serif;font-size:15px;line-height:1.6;color:#0A1D2B;max-width:620px">
      <p style="margin:0 0 6px;font-size:18px"><strong>${verdict}</strong> &middot; score ${rec.score}</p>
      <p style="margin:0 0 18px;color:#555">Free workshop claim from ${email}</p>
      <table style="border-collapse:collapse;margin:0 0 18px">
        ${row('Workshop', `<strong>${event.title}</strong>`)}
        ${row('When', when)}
        ${row('Name', facts.firstName ?? '&mdash;')}
        ${row('Organisation', facts.company ?? '&mdash;')}
        ${row('Stage', facts.stage ?? '&mdash;')}
        ${row('Newsletter', `${facts.newsletterStatus ?? '&mdash;'}, ${facts.emailsClicked ?? 0} clicks, ${Math.round(facts.openRate ?? 0)}% open`)}
        ${row('Account', facts.accountSignedIn ? 'signed in' : facts.accountConfirmed ? 'confirmed, never signed in' : 'not confirmed')}
        ${row('History', `${facts.priorRegistrations} booked, ${facts.attendedCount} attended, ${facts.noShowCount} no-show`)}
      </table>
      ${
        note?.trim()
          ? `<p style="margin:0 0 6px"><strong>What they said</strong></p><p style="margin:0 0 18px;padding:10px 12px;background:#F6F3ED;border-radius:4px">${note.trim()}</p>`
          : ''
      }
      ${
        rec.blockers.length
          ? `<p style="margin:0 0 6px"><strong>Reasons to refuse</strong></p><ul style="margin:0 0 18px;padding-left:20px">${rec.blockers
              .map((b) => `<li>${b}</li>`)
              .join('')}</ul>`
          : ''
      }
      ${
        rec.signals.length
          ? `<p style="margin:0 0 6px"><strong>What we know</strong></p><ul style="margin:0 0 18px;padding-left:20px">${rec.signals
              .map((s) => `<li>${s.label} <span style="color:#777">(${s.weight > 0 ? '+' : ''}${s.weight})</span></li>`)
              .join('')}</ul>`
          : ''
      }
      <p style="margin:0 0 24px"><a href="${SITE}/admin" style="color:#0A1D2B;font-weight:600">Decide in the admin panel &rarr;</a></p>
      <p style="margin:0;color:#777;font-size:13px">Nothing happens until you accept or refuse it.</p>
    </div>`;

  await sendAdminEmail(ADMIN_EMAIL, `Free workshop claim: ${facts.firstName ?? email}`, html);
}

/** What the event page shows this person for this event. */
export async function claimStateFor(userId: string, eventSlug: string): Promise<ClaimState> {
  await lapseStaleClaims(userId);
  const db = createAdminClient();
  const [{ data: contact }, { data: claims }] = await Promise.all([
    db.from('contacts').select('free_workshop_used_at').eq('user_id', userId).maybeSingle(),
    db.from('free_workshop_claims').select('event_slug,status').eq('user_id', userId).order('claimed_at', { ascending: false }),
  ]);

  const live = (claims ?? []).find((c) => c.status === 'pending' || c.status === 'approved');
  if (live) {
    return { kind: live.status as 'pending' | 'approved', eventSlug: live.event_slug as string };
  }
  const refused = (claims ?? []).find((c) => c.status === 'rejected' && c.event_slug === eventSlug);
  if (refused) return { kind: 'rejected', eventSlug };

  return { kind: 'none', freeWorkshopAvailable: !contact?.free_workshop_used_at };
}

/**
 * Silence is a valid answer, and it must not trap anybody. A pending claim
 * whose workshop has started is spent: it lapses quietly, with no email, and
 * the person is free to claim another. Called wherever claims are read, so it
 * heals itself without needing a job to run.
 */
export async function lapseStaleClaims(userId?: string): Promise<number> {
  const db = createAdminClient();
  let q = db
    .from('free_workshop_claims')
    .update({ status: 'lapsed', decided_at: new Date().toISOString() })
    .eq('status', 'pending')
    .lt('event_start', new Date().toISOString());
  if (userId) q = q.eq('user_id', userId);
  const { data } = await q.select('id');
  return (data ?? []).length;
}

/** The claimant changing their own mind, so they can ask for a different date. */
export async function withdrawClaim(userId: string): Promise<{ ok: boolean; message: string }> {
  const db = createAdminClient();
  const { data, error } = await db
    .from('free_workshop_claims')
    .update({ status: 'withdrawn', decided_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('status', 'pending')
    .select('id');
  if (error) return { ok: false, message: error.message };
  if (!data?.length) return { ok: false, message: 'There was nothing waiting to withdraw.' };
  return { ok: true, message: 'Withdrawn. You can claim a different workshop whenever you like.' };
}

/**
 * Cancelling the booking the free workshop paid for gives the entitlement
 * back. Spending it on a session somebody then cancelled, and leaving them
 * with nothing, is the kind of small unfairness nobody would ever complain
 * about and everybody would remember.
 */
export async function releaseFreeWorkshopOnCancel(userId: string, eventSlug: string): Promise<boolean> {
  const db = createAdminClient();
  const { data: claim } = await db
    .from('free_workshop_claims')
    .select('id,contact_id')
    .eq('user_id', userId)
    .eq('event_slug', eventSlug)
    .eq('status', 'approved')
    .maybeSingle();
  if (!claim) return false;

  await db
    .from('free_workshop_claims')
    .update({ status: 'withdrawn', decided_at: new Date().toISOString(), booked_at: null })
    .eq('id', claim.id);
  if (claim.contact_id) {
    await db
      .from('contacts')
      .update({ free_workshop_used_at: null, free_workshop_event: null })
      .eq('id', claim.contact_id as string);
  }
  return true;
}

export async function listClaims(status?: ClaimStatus): Promise<Claim[]> {
  await lapseStaleClaims();
  const db = createAdminClient();
  // Soonest workshop first: these are answered by urgency rather than arrival.
  let q = db.from('free_workshop_claims').select('*').order('event_start', { ascending: true }).range(0, 499);
  if (status) q = q.eq('status', status);
  const { data, error } = await q;
  if (error) throw new Error(`listClaims: ${error.message}`);
  return (data ?? []).map(toClaim);
}

/**
 * Answering a claim. Approving records nothing against the contact: the free
 * workshop is only spent when they actually register, which the existing
 * registration path already handles.
 */
export async function decideClaim(
  id: string,
  decision: 'approved' | 'rejected',
  opts: { reason?: RejectReason; note?: string } = {}
): Promise<{ ok: boolean; emailed: boolean; message?: string }> {
  const db = createAdminClient();
  const { data: claim, error } = await db.from('free_workshop_claims').select('*').eq('id', id).single();
  if (error || !claim) return { ok: false, emailed: false, message: 'No such claim.' };
  if (claim.status !== 'pending') return { ok: false, emailed: false, message: 'That claim has already been answered.' };

  const { data: auth } = await db.auth.admin.getUserById(claim.user_id as string);
  const email = auth?.user?.email;
  const { data: contact } = await db.from('contacts').select('first_name').eq('user_id', claim.user_id as string).maybeSingle();

  const { error: upErr } = await db
    .from('free_workshop_claims')
    .update({
      status: decision,
      decided_at: new Date().toISOString(),
      reject_reason: decision === 'rejected' ? (opts.reason ?? 'other') : null,
      decision_note: opts.note ?? null,
    })
    .eq('id', id);
  if (upErr) return { ok: false, emailed: false, message: upErr.message };

  if (!email) return { ok: true, emailed: false, message: 'Decided, but the account has no email address.' };

  if (decision === 'approved') {
    const booked = await bookApprovedClaim(claim as Record<string, unknown>, email);
    await db.from('free_workshop_claims').update({ answered_at: new Date().toISOString() }).eq('id', id);
    return { ok: true, emailed: booked };
  }

  const emailed = decision === 'rejected'
      ? await sendFreeWorkshopRejected(email, {
          firstName: (contact?.first_name as string) ?? null,
          eventTitle: (claim.event_title as string) ?? 'the workshop',
          reason: REJECT_REASONS[(opts.reason ?? 'other') as RejectReason],
          note: opts.note ?? null,
        })
      : false;

  await db.from('free_workshop_claims').update({ answered_at: new Date().toISOString() }).eq('id', id);
  return { ok: true, emailed };
}

/**
 * Approval books the seat. The entitlement is spent here rather than at the
 * moment of claiming, because a claim that was refused should cost nothing.
 *
 * The confirmation is the ordinary registration email, calendar invite and
 * joining link included, so a free place arrives looking exactly like a paid
 * one. The stage is recomputed from the booking rather than set, so the funnel
 * stays derived from what actually happened.
 */
async function bookApprovedClaim(claim: Record<string, unknown>, email: string): Promise<boolean> {
  const db = createAdminClient();
  const userId = claim.user_id as string;
  const slug = claim.event_slug as string;

  const event = await getEventBySlug(slug);
  if (!event) return false;

  await db.from('event_registrations').upsert(
    {
      user_id: userId,
      event_slug: slug,
      event_title: event.title,
      event_start: event.startDateTime,
      event_location: event.location,
      event_kind: /info session/i.test(event.title) ? 'info_session' : 'workshop',
    },
    { onConflict: 'user_id,event_slug' }
  );

  if (claim.contact_id) {
    await db
      .from('contacts')
      .update({ free_workshop_used_at: new Date().toISOString(), free_workshop_event: slug })
      .eq('id', claim.contact_id as string);
    // Recounts their bookings and moves the stage where the rules allow, which
    // is what puts them at Workshop registered.
    await db.rpc('advance_contact_stage', { p_contact_id: claim.contact_id, p_user_id: userId });
  }

  await db.from('free_workshop_claims').update({ booked_at: new Date().toISOString() }).eq('id', claim.id as string);

  return sendRegistrationEmail(email, {
    slug,
    title: event.title,
    summary: event.summary,
    location: event.location,
    startDateTime: event.startDateTime,
    endDateTime: event.endDateTime,
    joinUrl: await getEventJoinUrl(slug),
  });
}
