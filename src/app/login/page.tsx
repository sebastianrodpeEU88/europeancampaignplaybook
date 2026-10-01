import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Container from '@/components/Container';
import LoginForm from '@/components/LoginForm';
import { readAttribution, attributionFields } from '@/lib/crm/attribution';

export const metadata: Metadata = {
  title: 'log in',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { redirectTo, expired } = (await searchParams) as { redirectTo?: string; expired?: string };
  const referer = (await headers()).get('referer');
  const attribution = attributionFields(
    readAttribution(await searchParams, referer, '/login')
  );

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
              That link did not work. It may have expired, or your email system may have opened it
              before you did, which uses it up. Enter your email below for a new one, and open it in
              this browser.
            </p>
          )}
          <LoginForm redirectTo={redirectTo} attribution={attribution} />
        </div>
      </Container>
    </div>
  );
}
