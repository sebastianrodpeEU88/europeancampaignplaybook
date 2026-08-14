'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { hasActiveMembership } from '@/lib/membership';
import { getEventBySlug } from '@/lib/content';
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

  // TODO(email): send a confirmation email (with the .ics attached) once an
  // email provider is configured — see RESEND_API_KEY setup.

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
