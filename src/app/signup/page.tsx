import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Container from '@/components/Container';
import SignupForm from '@/components/SignupForm';
import { readAttribution, attributionFields } from '@/lib/crm/attribution';

export const metadata: Metadata = {
  title: 'sign up',
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Where this person came from, read from the link they arrived on and the
  // referrer their browser sent. Nothing is stored on their device; the
  // fields travel with the form into the account's own metadata.
  const params = await searchParams;
  const referer = (await headers()).get('referer');
  const attribution = attributionFields(readAttribution(params, referer, '/signup'));

  return (
    <div className="bg-paper min-h-screen py-12">
      <Container>
        <div className="max-w-sm mx-auto">
          <h1 className="display text-3xl text-ink mb-2 text-center">create your account</h1>
          <p className="text-ink/60 text-center mb-8">
            Create it for free events and content - subscribe afterwards to enjoy a full year of
            training, learning and networking!
          </p>
          <SignupForm attribution={attribution} />
        </div>
      </Container>
    </div>
  );
}
