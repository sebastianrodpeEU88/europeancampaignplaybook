import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isProfileComplete } from '@/lib/profile';
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
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name, email')
          .eq('user_id', user.id)
          .maybeSingle();
        if (!isProfileComplete(profile)) {
          return NextResponse.redirect(
            `${origin}${routes.welcome()}?next=${encodeURIComponent(redirectTo)}`
          );
        }
      }
      return NextResponse.redirect(`${origin}${redirectTo}`);
    }
  }

  return NextResponse.redirect(`${origin}${routes.login()}`);
}
