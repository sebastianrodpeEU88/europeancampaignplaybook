'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { stripe } from '@/lib/stripe';
import { routes } from '@/lib/routes';

// GDPR Art. 17 (right to erasure) — with the Art. 17(3)(b) carve-out for
// data we're legally obliged to keep (tax/invoice records). This does NOT
// hard-delete the account. It:
//   1. Cancels any active Stripe subscription (stop future billing).
//   2. Bans the auth user, so they're locked out immediately — the
//      subscriptions row (billing history) is left fully intact.
//   3. Logs the request in deletion_requests for manual follow-up.
// Actually purging the auth user + personal data is a deliberate manual
// step, done once the required retention period has passed. The target
// user always comes from the verified session cookie, never from form
// input, so this cannot be used to act on anyone else's account.
export async function requestAccountDeletion(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(routes.login());
  }

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('stripe_subscription_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (subscription?.stripe_subscription_id) {
    try {
      await stripe.subscriptions.cancel(subscription.stripe_subscription_id);
    } catch {
      // Already cancelled/expired on Stripe's side — fine, proceed.
    }
  }

  const admin = createAdminClient();

  const { error: banError } = await admin.auth.admin.updateUserById(user.id, {
    ban_duration: '876000h', // ~100 years — effectively permanent, reversible if needed
  });
  if (banError) {
    throw new Error(`Failed to lock account: ${banError.message}`);
  }

  const { error: logError } = await admin
    .from('deletion_requests')
    .upsert({ user_id: user.id, email: user.email });
  if (logError) {
    throw new Error(`Failed to record deletion request: ${logError.message}`);
  }

  await supabase.auth.signOut();
  redirect(`${routes.home()}?deletionRequested=1`);
}
