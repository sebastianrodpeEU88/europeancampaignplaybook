'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { hasActiveMembership } from '@/lib/membership';
import { getEventBySlug } from '@/lib/content';
import { sendRegistrationEmail } from '@/lib/email';
import { routes } from '@/lib/routes';

// Register the signed-in member for an event. Members-only and idempotent
// (composite primary key on user_id + event_slug). The event details are read
// from Sanity server-side rather than trusted from the client.
export async function registerForEvent(slug: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`${routes.login()}?redirectTo=${encodeURIComponent(routes.event(slug))}`);
  }

  if (!(await hasActiveMembership())) {
    redirect(routes.subscribe());
  }

  const event = await getEventBySlug(slug);
  if (!event) {
    redirect(routes.events());
  }

  const admin = createAdminClient();
  await admin.from('event_registrations').upsert(
    {
      user_id: user.id,
      event_slug: slug,
      event_title: event.title,
      event_start: event.startDateTime,
      event_location: event.location,
    },
    { onConflict: 'user_id,event_slug' }
  );

  // Confirmation email with the .ics attached. No-ops if RESEND_API_KEY isn't
  // set, and never throws — registration must not depend on email delivery.
  if (user.email) {
    await sendRegistrationEmail(user.email, {
      slug,
      title: event.title,
      summary: event.summary,
      location: event.location,
      startDateTime: event.startDateTime,
      endDateTime: event.endDateTime,
    });
  }

  // No redirect: callers update optimistically for instant feedback. Revalidate
  // so the My Events page (and event page cache) reflect the new registration.
  revalidatePath(routes.event(slug));
  revalidatePath(routes.myEvents());
}

// Cancel the signed-in member's registration for an event.
export async function cancelRegistration(slug: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(routes.login());
  }

  const admin = createAdminClient();
  await admin.from('event_registrations').delete().eq('user_id', user.id).eq('event_slug', slug);

  revalidatePath(routes.event(slug));
  revalidatePath(routes.myEvents());
}
