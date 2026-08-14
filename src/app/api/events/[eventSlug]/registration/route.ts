import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Per-request check of whether the current user is registered for an event,
// so the event page can stay statically generated while the Register button
// reflects live state client-side.
export async function GET(
  _request: Request,
  ctx: RouteContext<'/api/events/[eventSlug]/registration'>
) {
  const { eventSlug } = await ctx.params;

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ authenticated: false, registered: false });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ authenticated: false, registered: false });
  }

  const { data } = await supabase
    .from('event_registrations')
    .select('event_slug')
    .eq('user_id', user.id)
    .eq('event_slug', eventSlug)
    .maybeSingle();

  return NextResponse.json({ authenticated: true, registered: !!data });
}
