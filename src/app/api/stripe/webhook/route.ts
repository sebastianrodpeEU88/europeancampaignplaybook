import { NextResponse, type NextRequest } from 'next/server';
import Stripe from 'stripe';
import { stripe, tierAndIntervalForPriceId } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';

async function upsertFromSubscription(subscription: Stripe.Subscription, userId?: string) {
  const item = subscription.items.data[0];
  const resolved = item ? tierAndIntervalForPriceId(item.price.id) : null;
  const customerId =
    typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;

  const supabase = createAdminClient();

  if (userId) {
    // First write for this user (from checkout.session.completed) — we know
    // who they are, so upsert keyed on user_id.
    await supabase.from('subscriptions').upsert({
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      tier: resolved?.tier ?? null,
      billing_interval: resolved?.interval ?? null,
      status: subscription.status,
      cancel_at_period_end: subscription.cancel_at_period_end,
      current_period_end: item ? new Date(item.current_period_end * 1000).toISOString() : null,
    });
    return;
  }

  // Later lifecycle events only carry the Stripe customer id — look up
  // which user that maps to from what we stored on the first write.
  await supabase
    .from('subscriptions')
    .update({
      stripe_subscription_id: subscription.id,
      tier: resolved?.tier ?? null,
      billing_interval: resolved?.interval ?? null,
      status: subscription.status,
      cancel_at_period_end: subscription.cancel_at_period_end,
      current_period_end: item ? new Date(item.current_period_end * 1000).toISOString() : null,
    })
    .eq('stripe_customer_id', customerId);
}

export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ message: 'STRIPE_WEBHOOK_SECRET is not set' }, { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature') ?? '';

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch {
    return NextResponse.json({ message: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      if (session.mode === 'subscription' && session.subscription) {
        const subscriptionId =
          typeof session.subscription === 'string' ? session.subscription : session.subscription.id;
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        await upsertFromSubscription(subscription, session.client_reference_id ?? undefined);
      }
      break;
    }
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      await upsertFromSubscription(event.data.object);
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
