import type { Metadata } from 'next';
import Container from '@/components/Container';
import LoginForm from '@/components/LoginForm';

export const metadata: Metadata = {
  title: 'log in',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { redirectTo } = await searchParams;

  return (
    <div className="bg-paper min-h-screen py-12">
      <Container>
        <div className="max-w-sm mx-auto">
          <h1 className="display text-3xl text-ink mb-2 text-center">log in</h1>
          <p className="text-ink/60 text-center mb-8">
            Access your European Campaign Playbook membership.
          </p>
          <LoginForm redirectTo={redirectTo} />
        </div>
      </Container>
    </div>
  );
}
