import { NextResponse, after, type NextRequest } from 'next/server';
import Stripe from 'stripe';
import { stripe, tierAndIntervalForPriceId, amountsForPlan } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import { drainContactSyncQueue } from '@/lib/crm/sync';

// A subscription can be created anywhere: site checkout, a payment link, or
// by hand in the Stripe dashboard. Only the first tells us who the person is,
// so the others are resolved by the customer's email against the contacts
// table, which is the one place every address is known.
async function userIdForCustomer(customerId: string): Promise<string | undefined> {
  const supabase = createAdminClient();

  // Somebody we have already written a subscription for.
  const { data: existing } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .maybeSingle();
  if (existing?.user_id) return existing.user_id as string;

  try {
    const customer = await stripe.customers.retrieve(customerId);
    const email = 'deleted' in customer ? null : customer.email;
    if (!email) return undefined;

    const { data: contact } = await supabase
      .from('contacts')
      .select('user_id')
      .eq('email_normalised', email.trim().toLowerCase())
      .maybeSingle();
    return (contact?.user_id as string | null) ?? undefined;
  } catch {
    return undefined;
  }
}

async function upsertFromSubscription(subscription: Stripe.Subscription, userId?: string) {
  const item = subscription.items.data[0];
  const resolved = item ? tierAndIntervalForPriceId(item.price.id) : null;
  const customerId =
    typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;

  // A pending cancellation can be expressed either via the cancel_at_period_end
  // boolean or via cancel_at (a timestamp) depending on the Stripe API version —
  // treat either as "will not renew".
  const willCancel = subscription.cancel_at_period_end === true || subscription.cancel_at != null;

  // Record the monthly/yearly figure from the tier price so New (Stripe)
  // members feed the admin cashflow projection, just like the legacy rows.
  const amounts = amountsForPlan(resolved?.tier, resolved?.interval);

  const supabase = createAdminClient();

  if (userId) {
    // First write for this user (from checkout.session.completed) — we know
    // who they are, so upsert keyed on user_id. A live Stripe subscription
    // means they pay on the new site, so stamp them as a "new" member.
    await supabase.from('subscriptions').upsert({
      user_id: userId,
      source: 'new',
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      tier: resolved?.tier ?? null,
      billing_interval: resolved?.interval ?? null,
      monthly_amount: amounts.monthly,
      yearly_amount: amounts.yearly,
      status: subscription.status,
      cancel_at_period_end: willCancel,
      current_period_end: item ? new Date(item.current_period_end * 1000).toISOString() : null,
    });
    return;
  }

  // Later lifecycle events only carry the Stripe customer id. Where we have
  // never seen it, the customer's email decides who they are, so a
  // subscription started outside the site still lands on the right person.
  const resolvedUser = await userIdForCustomer(customerId);
  if (resolvedUser) {
    await supabase.from('subscriptions').upsert({
      user_id: resolvedUser,
      source: 'new',
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      tier: resolved?.tier ?? null,
      billing_interval: resolved?.interval ?? null,
      monthly_amount: amounts.monthly,
      yearly_amount: amounts.yearly,
      status: subscription.status,
      cancel_at_period_end: willCancel,
      current_period_end: item ? new Date(item.current_period_end * 1000).toISOString() : null,
    });
    return;
  }

  await supabase
    .from('subscriptions')
    .update({
      stripe_subscription_id: subscription.id,
      tier: resolved?.tier ?? null,
      billing_interval: resolved?.interval ?? null,
      monthly_amount: amounts.monthly,
      yearly_amount: amounts.yearly,
      status: subscription.status,
      cancel_at_period_end: willCancel,
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
    case 'customer.subscription.created':
    case 'customer.subscription.paused':
    case 'customer.subscription.resumed':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      await upsertFromSubscription(event.data.object);
      break;
    }
    default:
      break;
  }

  // A membership change is exactly the kind of thing the newsletter segments
  // on, so the contact travels on to Notion and beehiiv right away. The
  // database trigger has already refreshed it; this only drains the queue.
  after(() => drainContactSyncQueue(5));

  return NextResponse.json({ received: true });
}
