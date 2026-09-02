import type { Metadata } from 'next';
import Container from '@/components/Container';
import ForgotPasswordForm from '@/components/ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'reset your password',
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <div className="bg-paper min-h-screen py-16">
      <Container>
        <div className="max-w-md mx-auto">
          <h1 className="display text-3xl text-ink mb-2 text-center">reset your password</h1>
          <p className="text-ink/60 text-center mb-8">
            Enter your email and we&rsquo;ll send you a link to set a new password.
          </p>
          <ForgotPasswordForm />
        </div>
      </Container>
    </div>
  );
}
