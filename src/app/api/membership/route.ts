import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { hasActiveMembership } from '@/lib/membership';

// Lightweight per-request membership check for client components (e.g. the
// event Register button) to gate on without making the host page dynamic.
// Returns whether the visitor is signed in and whether they're a paid member.
export async function GET() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ authenticated: false, member: false });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const member = user ? await hasActiveMembership() : false;
  return NextResponse.json({ authenticated: !!user, member });
}
