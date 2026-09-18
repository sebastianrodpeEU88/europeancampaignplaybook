import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { pathAfterSignIn } from '@/lib/auth-redirect';
import { routes } from '@/lib/routes';

// Supabase redirects here after a magic-link click or email confirmation,
// with a `code` to exchange for a session.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const redirectTo = searchParams.get('redirectTo') || routes.account();

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // New/incomplete users land on onboarding first, then their destination.
      return NextResponse.redirect(`${origin}${await pathAfterSignIn(supabase, redirectTo)}`);
    }
  }

  return NextResponse.redirect(`${origin}${routes.login()}`);
}
