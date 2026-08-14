import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import Container from '@/components/Container';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { createPortalSession } from '@/lib/stripe-actions';
import { logOut } from '@/lib/auth-actions';
import { TIER_LABELS, type Tier } from '@/lib/stripe';
import { routes } from '@/lib/routes';
import DeleteAccountButton from '@/components/DeleteAccountButton';

export const metadata: Metadata = {
  title: 'account',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  trialing: 'Trial',
  past_due: 'Payment overdue',
  canceled: 'Cancelled',
  incomplete: 'Incomplete',
  incomplete_expired: 'Expired',
  unpaid: 'Unpaid',
};

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`${routes.login()}?redirectTo=${encodeURIComponent(routes.account())}`);
  }

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('tier, billing_interval, status, current_period_end, cancel_at_period_end')
    .eq('user_id', user.id)
    .maybeSingle();

  const hasAccess = subscription?.status === 'active' || subscription?.status === 'trialing';

  return (
    <div className="bg-paper min-h-screen py-12">
      <Container>
        <div className="max-w-lg mx-auto">
          <h1 className="display text-3xl text-ink mb-2">account</h1>
          <p className="text-ink/60 mb-8">{user.email}</p>

          <div className="rounded-[2px] border border-rule/20 bg-paper p-6 mb-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink/45 mb-3">
              Membership
            </p>
            {subscription ? (
              <>
                <p className="text-lg font-semibold text-ink mb-1">
                  {TIER_LABELS[subscription.tier as Tier] ?? subscription.tier}
                  {subscription.billing_interval && ` · ${subscription.billing_interval === 'year' ? 'Annual' : 'Monthly'}`}
                </p>
                <p className={`text-sm text-ink/60 ${subscription.cancel_at_period_end ? 'mb-1' : 'mb-4'}`}>
                  {STATUS_LABELS[subscription.status] ?? subscription.status}
                  {subscription.current_period_end &&
                    ` — ${subscription.cancel_at_period_end ? 'access ends' : 'renews'} ${new Date(
                      subscription.current_period_end
                    ).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}`}
                </p>
                {subscription.cancel_at_period_end && (
                  <p className="text-sm text-ink/45 mb-4">
                    Your membership won’t renew. You keep full access until then — use “Manage
                    billing” to reactivate.
                  </p>
                )}
                <form action={createPortalSession}>
                  <button
                    type="submit"
                    className="rounded-[2px] bg-navy px-4 py-2.5 text-sm font-semibold text-[#EDE7DA] hover:bg-[#0A1D2B]/85 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
                  >
                    Manage billing
                  </button>
                </form>
              </>
            ) : (
              <>
                <p className="text-sm text-ink/60 mb-4">No active membership yet.</p>
                <Link
                  href={routes.subscribe()}
                  className="inline-block rounded-[2px] bg-navy px-4 py-2.5 text-sm font-semibold text-[#EDE7DA] hover:bg-[#0A1D2B]/85 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
                >
                  View membership options
                </Link>
              </>
            )}
          </div>

          {!hasAccess && subscription && (
            <p className="text-xs text-ink/45 mb-6">
              Your membership isn’t currently active. Manage billing above, or{' '}
              <Link href={routes.subscribe()} className="text-ink underline hover:no-underline">
                subscribe again
              </Link>
              .
            </p>
          )}

          <form action={logOut}>
            <button
              type="submit"
              className="text-sm text-ink/60 hover:text-ink hover:underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink rounded"
            >
              Log out
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-rule/20">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink/45 mb-3">
              Your data
            </p>
            <a
              href="/api/account/export"
              className="text-sm text-ink/80 hover:text-ink hover:underline transition-colors"
            >
              Download my data
            </a>
            <div className="mt-4">
              <DeleteAccountButton />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
