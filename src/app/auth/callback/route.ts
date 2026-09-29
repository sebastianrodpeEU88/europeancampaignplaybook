import { NextResponse, after, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { pathAfterSignIn } from '@/lib/auth-redirect';
import { routes } from '@/lib/routes';
import { refreshContactForUser, applyAttribution } from '@/lib/crm/contacts';
import { drainContactSyncQueue } from '@/lib/crm/sync';

// Supabase redirects here after a magic-link click or email confirmation,
// with a `code` to exchange for a session.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const redirectTo = searchParams.get('redirectTo') || routes.account();

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // The account exists from this moment, so give it a contact and record
      // where the person came from, before anything else happens.
      const user = data?.user;
      if (user) {
        after(async () => {
          await refreshContactForUser(user.id);
          await applyAttribution(user.id, user.user_metadata);
          await drainContactSyncQueue(5);
        });
      }
      // New/incomplete users land on onboarding first, then their destination.
      return NextResponse.redirect(`${origin}${await pathAfterSignIn(supabase, redirectTo)}`);
    }
  }

  return NextResponse.redirect(`${origin}${routes.login()}`);
}
