'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { stripe, priceIdFor, type Tier, type BillingInterval } from '@/lib/stripe';
import { routes } from '@/lib/routes';

// The absolute origin for Stripe's success/cancel/return URLs. Derived from
// the actual request so checkout works on any deployment without depending on
// NEXT_PUBLIC_SITE_URL being set correctly (it defaults to localhost). Falls
// back to the env var, then to the known production origin.
async function siteOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host');
  if (host) {
    const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
    return `${proto}://${host}`;
  }
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://www.campaignplaybook.eu';
}

export async function createCheckoutSession(tier: Tier, interval: BillingInterval): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`${routes.login()}?redirectTo=${encodeURIComponent(routes.subscribe())}`);
  }

  const { data: existing } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id, status')
    .eq('user_id', user.id)
    .maybeSingle();

  // Already an active member — don't let them start a second, parallel
  // subscription (which Stripe would create and bill alongside the first).
  // Send them to their account to change or manage the plan instead. Checked
  // before the profile gate so existing members aren't sent through onboarding.
  if (existing?.status === 'active' || existing?.status === 'trialing') {
    redirect(routes.account());
  }

  // New/lapsed subscribers must complete their profile before checking out.
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, email')
    .eq('user_id', user.id)
    .maybeSingle();
  if (!profile?.first_name || !profile?.last_name || !profile?.email) {
    redirect(`${routes.welcome()}?next=${encodeURIComponent(routes.subscribe())}`);
  }

  const siteUrl = await siteOrigin();

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: priceIdFor(tier, interval), quantity: 1 }],
    client_reference_id: user.id,
    ...(existing?.stripe_customer_id
      ? { customer: existing.stripe_customer_id }
      : { customer_email: user.email }),
    automatic_tax: { enabled: true },
    success_url: `${siteUrl}${routes.account()}?checkout=success`,
    cancel_url: `${siteUrl}${routes.subscribe()}?checkout=cancelled`,
  });

  if (session.url) {
    redirect(session.url);
  }
}

export async function createPortalSession(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(routes.login());
  }

  const { data } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!data?.stripe_customer_id) {
    redirect(routes.subscribe());
  }

  const siteUrl = await siteOrigin();
  const session = await stripe.billingPortal.sessions.create({
    customer: data.stripe_customer_id,
    return_url: `${siteUrl}${routes.account()}`,
  });

  redirect(session.url);
}
