import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/Container';
import ResetPasswordForm from '@/components/ResetPasswordForm';
import { createClient } from '@/lib/supabase/server';
import { routes } from '@/lib/routes';

export const metadata: Metadata = {
  title: 'choose a new password',
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage() {
  // Reaching here with a session means the recovery link was valid and
  // /auth/callback exchanged it. No session → the link expired or was opened
  // directly.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="bg-paper min-h-screen py-16">
      <Container>
        <div className="max-w-md mx-auto">
          <h1 className="display text-3xl text-ink mb-2 text-center">choose a new password</h1>
          {user ? (
            <>
              <p className="text-ink/60 text-center mb-8">
                Signed in as {user.email}. Set a new password below.
              </p>
              <ResetPasswordForm />
            </>
          ) : (
            <div className="rounded-[2px] border border-rule/20 bg-paper p-6 text-center">
              <p className="font-semibold text-ink mb-1">This link has expired</p>
              <p className="text-sm text-ink/60 mb-4">
                Password reset links work once and expire shortly. Request a fresh one to continue.
              </p>
              <Link
                href={routes.forgotPassword()}
                className="text-ink underline hover:no-underline font-medium text-sm"
              >
                Request a new reset link
              </Link>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
