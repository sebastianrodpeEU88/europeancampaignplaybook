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

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

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

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`,
    },
  });

  if (error) {
    return { status: 'error', message: error.message };
  }

  return { status: 'check-email' };
}

export async function signUp(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get('email') || '');
  const password = String(formData.get('password') || '');

  if (password.length < 8) {
    return { status: 'error', message: 'Password must be at least 8 characters.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?redirectTo=${encodeURIComponent(routes.account())}`,
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
