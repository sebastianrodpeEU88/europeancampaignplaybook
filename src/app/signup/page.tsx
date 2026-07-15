import type { Metadata } from 'next';
import Container from '@/components/Container';
import SignupForm from '@/components/SignupForm';

export const metadata: Metadata = {
  title: 'sign up',
};

export default function SignupPage() {
  return (
    <div className="bg-paper min-h-screen py-12">
      <Container>
        <div className="max-w-sm mx-auto">
          <h1 className="display text-3xl text-ink mb-2 text-center">create your account</h1>
          <p className="text-ink/60 text-center mb-8">
            Free to create — subscribe afterwards to unlock the full library.
          </p>
          <SignupForm />
        </div>
      </Container>
    </div>
  );
}
