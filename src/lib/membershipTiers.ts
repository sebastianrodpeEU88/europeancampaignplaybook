import type { Tier } from '@/lib/stripe';

// Membership tiers and benefits, shared by the subscribe page and the
// community page so the prices on the two can never drift apart.
export const MEMBERSHIP_FEATURES = [
  'Every workshop we run for a full year, from AI to social media to strategy, all included',
  'Members-only networking to advance your career alongside fellow practitioners',
  'Full access to all articles across our 16 knowledge pillars',
  'Member discounts and perks at industry events, and more',
];

export type MembershipTier = {
  tier: Tier;
  name: string;
  eligibility: string | null;
  monthly: number;
  annual: number;
  highlight: boolean;
  badge: string | null;
};

export const MEMBERSHIP_TIERS: MembershipTier[] = [
  {
    tier: 'student',
    name: 'Student',
    eligibility: 'Valid student ID or institutional email required.',
    monthly: 9,
    annual: 99,
    highlight: false,
    badge: null,
  },
  {
    tier: 'young_professional',
    name: 'Young Professional',
    eligibility: 'Open to practitioners aged 30 and under.',
    monthly: 24,
    annual: 249,
    highlight: true,
    badge: 'Most popular',
  },
  {
    tier: 'standard',
    name: 'Standard',
    eligibility: null,
    monthly: 34,
    annual: 349,
    highlight: false,
    badge: null,
  },
];

// Percentage saved by paying for a year up front.
export function annualDiscount(monthly: number, annual: number): number {
  const monthlyTotal = monthly * 12;
  return Math.round(((monthlyTotal - annual) / monthlyTotal) * 100);
}
