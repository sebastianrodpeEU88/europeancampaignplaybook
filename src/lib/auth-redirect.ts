import type { createClient } from '@/lib/supabase/server';
import { isProfileComplete } from '@/lib/profile';
import { routes } from '@/lib/routes';

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
