import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { routes } from '@/lib/routes';

// Dedicated landing for password-recovery links. Unlike /auth/callback (which
// applies normal login routing — onboarding, intended destination), this always
// sends the user to the set-a-new-password form after exchanging the code.
// The /reset-password page itself handles the "link expired" case when there's
// no session, so we can redirect there unconditionally.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${origin}${routes.resetPassword()}`);
}
