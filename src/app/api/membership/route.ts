import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { hasActiveMembership } from '@/lib/membership';
import { isAdminEmail } from '@/lib/admin';

// Lightweight per-request membership check for client components (e.g. the
// event Register button, and the header auth/admin nav links) to gate on
// without making the host page dynamic. Returns whether the visitor is signed
// in and whether they're a paid member.
//
// This response depends on the caller's session cookie and carries their admin
// status, so it must never be cached: `force-dynamic` opts out of Next's route
// cache, and the response sets `private, no-store` so no browser or CDN edge
// can reuse one visitor's answer (or the anonymous one) for another. Without
// this the header links wrongly showed logged-out to signed-in users.
export const dynamic = 'force-dynamic';

function noStore(body: { authenticated: boolean; member: boolean; admin: boolean }) {
  return NextResponse.json(body, {
    headers: { 'Cache-Control': 'private, no-store, max-age=0, must-revalidate' },
  });
}

export async function GET() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return noStore({ authenticated: false, member: false, admin: false });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const member = user ? await hasActiveMembership() : false;
  return noStore({ authenticated: !!user, member, admin: isAdminEmail(user?.email) });
}
