import type { Metadata } from 'next';
import Container from '@/components/Container';
import LoginForm from '@/components/LoginForm';

export const metadata: Metadata = {
  title: 'log in',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string; expired?: string }>;
}) {
  const { redirectTo, expired } = await searchParams;

  return (
    <div className="bg-paper min-h-screen py-12">
      <Container>
        <div className="max-w-sm mx-auto">
          <h1 className="display text-3xl text-ink mb-2 text-center">log in</h1>
          <p className="text-ink/60 text-center mb-8">
            Access your european campaign playbook membership.
          </p>
          {/* Set by /auth/confirm when an emailed link has expired or was already used. */}
          {expired && (
            <p className="mb-6 rounded-[2px] border border-[#dd3c13]/40 bg-[#dd3c13]/5 px-4 py-3 text-sm text-ink/80">
              That link has expired or has already been used. Enter your email below and we will send
              you a new one; clicking it confirms your account.
            </p>
          )}
          <LoginForm redirectTo={redirectTo} />
        </div>
      </Container>
    </div>
  );
}
