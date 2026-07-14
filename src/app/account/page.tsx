import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import Container from '@/components/Container';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { createPortalSession } from '@/lib/stripe-actions';
import { logOut } from '@/lib/auth-actions';
import { TIER_LABELS, type Tier } from '@/lib/stripe';
import { routes } from '@/lib/routes';

export const metadata: Metadata = {
  title: 'Account',
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
    .select('tier, billing_interval, status, current_period_end')
    .eq('user_id', user.id)
    .maybeSingle();

  const hasAccess = subscription?.status === 'active' || subscription?.status === 'trialing';

  return (
    <div className="bg-[#FDF6EC] min-h-screen py-12">
      <Container>
        <div className="max-w-lg mx-auto">
          <h1 className="text-3xl font-bold text-[#2B0A2E] mb-2">Account</h1>
          <p className="text-[#7A6380] mb-8">{user.email}</p>

          <div className="rounded-2xl border border-[rgba(43,10,46,0.1)] bg-white p-6 mb-6">
            <p className="text-xs font-semibold font-mono uppercase tracking-wider text-[#A896AC] mb-3">
              Membership
            </p>
            {subscription ? (
              <>
                <p className="text-lg font-semibold text-[#2B0A2E] mb-1">
                  {TIER_LABELS[subscription.tier as Tier] ?? subscription.tier}
                  {subscription.billing_interval && ` · ${subscription.billing_interval === 'year' ? 'Annual' : 'Monthly'}`}
                </p>
                <p className="text-sm text-[#7A6380] mb-4">
                  {STATUS_LABELS[subscription.status] ?? subscription.status}
                  {subscription.current_period_end &&
                    ` — renews ${new Date(subscription.current_period_end).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}`}
                </p>
                <form action={createPortalSession}>
                  <button
                    type="submit"
                    className="rounded-lg bg-[#2B0A2E] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#4A1F4D] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5B35] focus-visible:ring-offset-2"
                  >
                    Manage billing
                  </button>
                </form>
              </>
            ) : (
              <>
                <p className="text-sm text-[#7A6380] mb-4">No active membership yet.</p>
                <Link
                  href={routes.subscribe()}
                  className="inline-block rounded-lg bg-[#2B0A2E] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#4A1F4D] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5B35] focus-visible:ring-offset-2"
                >
                  View membership options
                </Link>
              </>
            )}
          </div>

          {!hasAccess && subscription && (
            <p className="text-xs text-[#A896AC] mb-6">
              Your membership isn’t currently active. Manage billing above, or{' '}
              <Link href={routes.subscribe()} className="text-[#FF5B35] hover:underline">
                subscribe again
              </Link>
              .
            </p>
          )}

          <form action={logOut}>
            <button
              type="submit"
              className="text-sm text-[#7A6380] hover:text-[#2B0A2E] hover:underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5B35] rounded"
            >
              Log out
            </button>
          </form>
        </div>
      </Container>
    </div>
  );
}
