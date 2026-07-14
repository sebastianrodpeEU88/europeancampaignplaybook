import type { Metadata } from 'next';
import Container from '@/components/Container';
import SignupForm from '@/components/SignupForm';

export const metadata: Metadata = {
  title: 'Sign up',
};

export default function SignupPage() {
  return (
    <div className="bg-[#FDF6EC] min-h-screen py-12">
      <Container>
        <div className="max-w-sm mx-auto">
          <h1 className="text-3xl font-bold text-[#2B0A2E] mb-2 text-center">Create your account</h1>
          <p className="text-[#7A6380] text-center mb-8">
            Free to create — subscribe afterwards to unlock the full library.
          </p>
          <SignupForm />
        </div>
      </Container>
    </div>
  );
}
