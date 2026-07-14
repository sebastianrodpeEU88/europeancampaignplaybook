import type { Metadata } from 'next';
import Container from '@/components/Container';
import LoginForm from '@/components/LoginForm';

export const metadata: Metadata = {
  title: 'Log in',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { redirectTo } = await searchParams;

  return (
    <div className="bg-[#FDF6EC] min-h-screen py-12">
      <Container>
        <div className="max-w-sm mx-auto">
          <h1 className="text-3xl font-bold text-[#2B0A2E] mb-2 text-center">Log in</h1>
          <p className="text-[#7A6380] text-center mb-8">
            Access your Campaign Intelligence Library membership.
          </p>
          <LoginForm redirectTo={redirectTo} />
        </div>
      </Container>
    </div>
  );
}
