import Stripe from 'stripe';

// Lazily constructed — module-level `new Stripe(...)` would throw at
// import time (breaking the build/every page) whenever STRIPE_SECRET_KEY
// isn't set yet, since Next collects page data by importing every route.
let stripeInstance: Stripe | undefined;

function getStripeInstance(): Stripe {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('Missing STRIPE_SECRET_KEY — add it to .env.local.');
    }
    stripeInstance = new Stripe(secretKey, { apiVersion: '2026-06-24.dahlia' });
  }
  return stripeInstance;
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop, receiver) {
    return Reflect.get(getStripeInstance(), prop, receiver);
  },
});

export type Tier = 'student' | 'young_professional' | 'standard';
export type BillingInterval = 'month' | 'year';

export const TIER_LABELS: Record<Tier, string> = {
  student: 'Student',
  young_professional: 'Young Professional',
  standard: 'Standard',
};

// Maps each tier + billing interval to its Stripe Price ID, set once the
// products are created in the Stripe dashboard (see supabase/schema.sql's
// sibling checkpoint in .env.example for the full list of vars).
export function priceIdFor(tier: Tier, interval: BillingInterval): string {
  const envKey = `STRIPE_PRICE_${tier.toUpperCase()}_${interval === 'month' ? 'MONTHLY' : 'ANNUAL'}`;
  const priceId = process.env[envKey];
  if (!priceId) {
    throw new Error(`Missing ${envKey} — add it to .env.local with the Stripe Price ID.`);
  }
  return priceId;
}

// Reverse lookup used by the webhook handler, which only gets a Price ID
// back from Stripe and needs to know which tier/interval it corresponds to.
export function tierAndIntervalForPriceId(priceId: string): { tier: Tier; interval: BillingInterval } | null {
  const tiers: Tier[] = ['student', 'young_professional', 'standard'];
  const intervals: BillingInterval[] = ['month', 'year'];
  for (const tier of tiers) {
    for (const interval of intervals) {
      if (process.env[`STRIPE_PRICE_${tier.toUpperCase()}_${interval === 'month' ? 'MONTHLY' : 'ANNUAL'}`] === priceId) {
        return { tier, interval };
      }
    }
  }
  return null;
}
