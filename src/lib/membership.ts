import { createClient } from '@/lib/supabase/server';

// A subscription counts as active membership access for as long as Stripe
// reports it 'active' or 'trialing' — cancellations still grant access
// until the current period ends, since Stripe only fires
// customer.subscription.deleted (which we map to 'canceled') once that
// period is actually over.
export async function hasActiveMembership(): Promise<boolean> {
  // Supabase isn't configured yet (e.g. mid-setup) — every article should
  // still render (as locked) rather than 500.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return false;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data } = await supabase
    .from('subscriptions')
    .select('status')
    .eq('user_id', user.id)
    .maybeSingle();

  return data?.status === 'active' || data?.status === 'trialing';
}
