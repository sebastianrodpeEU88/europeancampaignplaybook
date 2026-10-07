import type { createClient } from '@/lib/supabase/server';
import { isProfileComplete } from '@/lib/profile';
import { routes } from '@/lib/routes';

// Where somebody was heading when they asked for a sign-in link.
//
// The emailed link cannot carry it: Supabase pastes {{ .RedirectTo }} into the
// template raw, and that value has a query string of its own, so it would
// break the one it lands in. A cookie set at the moment they ask is simpler
// and exact. It lives as long as the link does, and /auth/confirm clears it.
export const AFTER_SIGNIN_COOKIE = 'ecp_after_signin';

// Where someone goes straight after signing in: onboarding first if their
// profile is incomplete, otherwise the page they were heading to.
export async function pathAfterSignIn(
  supabase: Awaited<ReturnType<typeof createClient>>,
  redirectTo: string
): Promise<string> {
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
      return `${routes.welcome()}?next=${encodeURIComponent(redirectTo)}`;
    }
  }
  return redirectTo;
}
