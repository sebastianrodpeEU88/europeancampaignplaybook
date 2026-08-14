import { createAdminClient } from '@/lib/supabase/admin';

// Read helpers for event registrations. Reads go through the service-role
// client filtered by the authenticated user's id (resolved by the caller),
// keeping access server-side.

export async function getUserRegistrationSlugs(userId: string): Promise<string[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('event_registrations')
    .select('event_slug')
    .eq('user_id', userId);
  return (data ?? []).map((r) => r.event_slug as string);
}

export async function isUserRegistered(userId: string, slug: string): Promise<boolean> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('event_registrations')
    .select('event_slug')
    .eq('user_id', userId)
    .eq('event_slug', slug)
    .maybeSingle();
  return !!data;
}
