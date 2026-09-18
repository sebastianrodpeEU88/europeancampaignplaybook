import { NextResponse, type NextRequest } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { pathAfterSignIn } from '@/lib/auth-redirect';
import { routes } from '@/lib/routes';

// Links the site emails itself (the final signup reminder) land here with a
// token hash instead of a code. Verifying it signs the person in and, for
// someone who never confirmed, confirms the account. An expired or used link
// goes to the login page, which explains how to get a new one.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const nextParam = searchParams.get('next');
  // Only same-site paths, so the link can't be turned into a redirect elsewhere.
  const next = nextParam?.startsWith('/') && !nextParam.startsWith('//') ? nextParam : routes.account();

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error) {
      return NextResponse.redirect(`${origin}${await pathAfterSignIn(supabase, next)}`);
    }
  }

  return NextResponse.redirect(`${origin}${routes.login()}?expired=1&redirectTo=${encodeURIComponent(next)}`);
}
