'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { isAdminEmail } from '@/lib/admin';
import { client as sanityClient } from '@/sanity/client';
import { createClaim, decideClaim, withdrawClaim, type ClaimState, claimStateFor } from './claims';
import type { RejectReason } from './recommend';

/**
 * Claiming is done by the person themselves, so this is the one action here
 * that any signed-in user may call. Everything it needs about the event is
 * read from Sanity rather than taken from the caller: a slug posted by hand
 * cannot invent a workshop, a date or a title.
 */
export async function claimFreeWorkshop(
  eventSlug: string,
  note?: string
): Promise<{ ok: boolean; message: string; state?: ClaimState }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return { ok: false, message: 'Please log in first.' };

  const event = await sanityClient.fetch<{
    slug: string;
    title: string;
    startDateTime: string;
    endDateTime?: string | null;
  } | null>(
    `*[_type == "event" && slug.current == $slug][0]{ "slug": slug.current, title, startDateTime, endDateTime }`,
    { slug: eventSlug }
  );
  if (!event) return { ok: false, message: 'We could not find that workshop.' };
  if (new Date(event.endDateTime ?? event.startDateTime) < new Date()) {
    return { ok: false, message: 'That workshop has already taken place.' };
  }

  const result = await createClaim(user.id, user.email, event, note);
  if (!result.ok) return { ok: false, message: result.message };

  revalidatePath(`/events/${eventSlug}`);
  return {
    ok: true,
    message: 'Thanks. I will check this and confirm shortly, usually the same day.',
    state: { kind: 'pending', eventSlug },
  };
}

/** What the button should say for the person looking at it. */
export async function readClaimState(eventSlug: string): Promise<ClaimState | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return claimStateFor(user.id, eventSlug);
}

async function requireAdmin(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!isAdminEmail(user?.email)) throw new Error('Not allowed.');
}

export async function answerClaim(
  id: string,
  decision: 'approved' | 'rejected',
  reason?: RejectReason,
  note?: string
): Promise<{ ok: boolean; message: string }> {
  try {
    await requireAdmin();
    const res = await decideClaim(id, decision, { reason, note });
    if (!res.ok) return { ok: false, message: res.message ?? 'Could not answer that claim.' };
    revalidatePath('/admin');
    const what = decision === 'approved' ? 'Approved' : 'Refused';
    return {
      ok: true,
      message: res.emailed ? `${what}, and they have been emailed.` : `${what}, but the email did not go out.`,
    };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : 'Something went wrong.' };
  }
}

/** The claimant changing their own mind, so a different date becomes possible. */
export async function withdrawMyClaim(eventSlug: string): Promise<{ ok: boolean; message: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: 'Please log in first.' };
  const res = await withdrawClaim(user.id);
  if (res.ok) revalidatePath(`/events/${eventSlug}`);
  return res;
}
