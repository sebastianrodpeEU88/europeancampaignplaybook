'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { routes } from '@/lib/routes';
import type { AuthState } from '@/lib/auth-state';

// Passwordless auth: everyone signs in with a magic link. `signInWithOtp`
// creates the account on first use, so login and signup are the same mechanism —
// signup just also captures the name up front for a friendlier email + onboarding.

export async function sendMagicLink(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get('email') || '');
  const redirectTo = String(formData.get('redirectTo') || routes.account());
  const captchaToken = String(formData.get('captchaToken') || '');

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`,
      captchaToken,
    },
  });

  if (error) {
    return { status: 'error', message: error.message };
  }

  return { status: 'check-email' };
}

export async function signUp(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const firstName = String(formData.get('first_name') || '').trim();
  const lastName = String(formData.get('last_name') || '').trim();
  const email = String(formData.get('email') || '');
  const captchaToken = String(formData.get('captchaToken') || '');
  // Honeypot: a field hidden from real users. Bots fill it in — when it's
  // present we silently pretend it worked and create nothing.
  const honeypot = String(formData.get('website') || '').trim();
  if (honeypot) {
    return { status: 'check-email' };
  }

  if (!firstName || !lastName) {
    return { status: 'error', message: 'Please enter your first and last name.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      // Stored as user metadata on first sign-in — used to greet by name in the
      // magic-link email ({{ .Data.first_name }}) and to pre-fill onboarding.
      data: { first_name: firstName, last_name: lastName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?redirectTo=${encodeURIComponent(routes.account())}`,
      shouldCreateUser: true,
      captchaToken,
    },
  });

  if (error) {
    return { status: 'error', message: error.message };
  }

  return { status: 'check-email' };
}

export async function logOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(routes.home());
}
