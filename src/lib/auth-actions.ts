'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isProfileComplete } from '@/lib/profile';
import { routes } from '@/lib/routes';
import type { AuthState } from '@/lib/auth-state';

// Where to send a just-authenticated user: onboarding first if their profile
// isn't complete, otherwise their intended destination.
async function destinationAfterAuth(
  supabase: Awaited<ReturnType<typeof createClient>>,
  redirectTo: string
): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return redirectTo;
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, email')
    .eq('user_id', user.id)
    .maybeSingle();
  if (!isProfileComplete(profile)) {
    return `${routes.welcome()}?next=${encodeURIComponent(redirectTo)}`;
  }
  return redirectTo;
}

export async function logIn(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get('email') || '');
  const password = String(formData.get('password') || '');
  const redirectTo = String(formData.get('redirectTo') || routes.account());
  const captchaToken = String(formData.get('captchaToken') || '');

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
    options: { captchaToken },
  });

  if (error) {
    if (error.code === 'user_banned') {
      return {
        status: 'error',
        message: 'This account has been deleted and can no longer be used to log in.',
      };
    }
    return { status: 'error', message: error.message };
  }

  redirect(await destinationAfterAuth(supabase, redirectTo));
}

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
  const password = String(formData.get('password') || '');
  const captchaToken = String(formData.get('captchaToken') || '');
  // Honeypot: a field hidden from real users. Bots fill it in — when it's
  // present we silently pretend the signup succeeded and create nothing.
  const honeypot = String(formData.get('website') || '').trim();
  if (honeypot) {
    return { status: 'check-email' };
  }

  if (!firstName || !lastName) {
    return { status: 'error', message: 'Please enter your first and last name.' };
  }
  if (password.length < 8) {
    return { status: 'error', message: 'Password must be at least 8 characters.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Stored as user metadata — used to greet by name in the confirmation
      // email ({{ .Data.first_name }}) and to pre-fill the onboarding form.
      data: { first_name: firstName, last_name: lastName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?redirectTo=${encodeURIComponent(routes.account())}`,
      captchaToken,
    },
  });

  if (error) {
    return { status: 'error', message: error.message };
  }

  return { status: 'check-email' };
}

export async function requestPasswordReset(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get('email') || '');
  const captchaToken = String(formData.get('captchaToken') || '');

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    // Land on the dedicated recovery route (no query param for Supabase's verify
    // step to drop), which always routes to the set-a-new-password form.
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset`,
    captchaToken,
  });

  // Supabase doesn't reveal whether the address has an account, so any error
  // here is operational (CAPTCHA, rate limit, config) — surface it; otherwise
  // report the generic "check your email".
  if (error) {
    return { status: 'error', message: error.message };
  }
  return { status: 'check-email' };
}

export async function updatePassword(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const password = String(formData.get('password') || '');
  if (password.length < 8) {
    return { status: 'error', message: 'Password must be at least 8 characters.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      status: 'error',
      message: 'This reset link has expired or is invalid. Please request a new one.',
    };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { status: 'error', message: error.message };
  }

  redirect(routes.account());
}

export async function logOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(routes.home());
}
