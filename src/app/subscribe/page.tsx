import type { Metadata } from 'next';
import Container from '@/components/Container';

export const metadata: Metadata = {
  title: 'Subscribe',
  description: 'Choose a Campaign Intelligence Library membership — Student, Young Professional, or Standard. Full access to all articles, compliance briefings, and AI prompt packs.',
};

const FEATURES = [
  'Full access to all articles across 16 knowledge pillars',
  'Downloadable templates and compliance checklists',
  'AI prompt packs for campaign content workflows',
  'EU compliance briefings updated quarterly',
  'Community access and contributor field notes',
  'Member-only playbooks and practitioner frameworks',
];

function annualDiscount(monthly: number, annual: number): number {
  const monthlyTotal = monthly * 12;
  return Math.round(((monthlyTotal - annual) / monthlyTotal) * 100);
}

const TIERS = [
  {
    name: 'Student',
    eligibility: 'Valid student ID or institutional email required.',
    monthly: 9,
    annual: 99,
    highlight: false,
    badge: null,
  },
  {
    name: 'Young Professional',
    eligibility: 'Open to practitioners aged 30 and under.',
    monthly: 24,
    annual: 249,
    highlight: true,
    badge: 'Most popular',
  },
  {
    name: 'Standard',
    eligibility: null,
    monthly: 34,
    annual: 349,
    highlight: false,
    badge: null,
  },
] as const;

export default function SubscribePage() {
  return (
    <div className="bg-[#F8F7F3] min-h-screen py-12">
      <Container>
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-[#1C1C1E] mb-3">Membership</h1>
            <p className="text-[#6B7280] leading-relaxed max-w-2xl mx-auto">
              Full access to the Campaign Intelligence Library — all articles, compliance
              checklists, AI prompt packs, and the growing community of EU campaign practitioners.
            </p>
          </div>

          {/* Pricing cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {TIERS.map((tier) => {
              const discount = annualDiscount(tier.monthly, tier.annual);
              const monthlyTotal = tier.monthly * 12;

              return (
                <div
                  key={tier.name}
                  className={`rounded-2xl bg-white flex flex-col ${
                    tier.highlight
                      ? 'border-2 border-[#185FA5] shadow-md'
                      : 'border border-[rgba(0,0,0,0.08)]'
                  }`}
                >
                  {/* Card header */}
                  <div
                    className={`px-6 pt-6 pb-5 border-b ${
                      tier.highlight
                        ? 'border-[rgba(24,95,165,0.15)]'
                        : 'border-[rgba(0,0,0,0.06)]'
                    }`}
                  >
                    {tier.badge && (
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#185FA5] mb-2">
                        {tier.badge}
                      </p>
                    )}
                    <h2 className="text-xl font-bold text-[#1C1C1E] mb-4">{tier.name}</h2>

                    {/* Annual price — primary */}
                    <div className="mb-3">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-3xl font-bold text-[#1C1C1E]">
                          €{tier.annual}
                        </span>
                        <span className="text-sm text-[#6B7280]">/ year</span>
                        <span className="ml-1 inline-flex items-center rounded-full bg-[#EAF4E5] px-2 py-0.5 text-xs font-semibold text-[#3B6D11]">
                          Save {discount}%
                        </span>
                      </div>
                      <p className="text-xs text-[#9CA3AF]">
                        vs €{monthlyTotal} if paying monthly
                      </p>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-2 my-3">
                      <div className="flex-1 border-t border-[rgba(0,0,0,0.06)]" />
                      <span className="text-xs text-[#9CA3AF]">or</span>
                      <div className="flex-1 border-t border-[rgba(0,0,0,0.06)]" />
                    </div>

                    {/* Monthly price — secondary */}
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-semibold text-[#374151]">
                        €{tier.monthly}
                      </span>
                      <span className="text-sm text-[#6B7280]">/ month</span>
                    </div>

                    {/* Eligibility */}
                    {tier.eligibility && (
                      <p className="mt-3 text-xs text-[#9CA3AF] leading-relaxed">
                        {tier.eligibility}
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <div className="px-6 py-5 flex-1">
                    <ul className="space-y-2.5">
                      {FEATURES.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm text-[#374151]">
                          <svg
                            className="h-4 w-4 text-[#3B6D11] flex-shrink-0 mt-0.5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA */}
                  <div className="px-6 pb-6">
                    <div className="relative group mb-2">
                      <button
                        disabled
                        aria-disabled="true"
                        aria-describedby={`coming-soon-${tier.name}`}
                        className={`w-full rounded-lg px-4 py-2.5 text-sm font-semibold cursor-not-allowed transition-colors ${
                          tier.highlight
                            ? 'bg-[rgba(24,95,165,0.12)] text-[rgba(24,95,165,0.5)]'
                            : 'bg-[rgba(0,0,0,0.06)] text-[#9CA3AF]'
                        }`}
                      >
                        Subscribe — coming soon
                      </button>
                      <div
                        id={`coming-soon-${tier.name}`}
                        role="tooltip"
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block whitespace-nowrap rounded-lg bg-[#1C1C1E] px-3 py-1.5 text-xs text-white shadow-lg z-10"
                      >
                        Memberships open shortly
                      </div>
                    </div>
                    <p className="text-center text-xs text-[#9CA3AF]">
                      Stripe checkout connecting soon
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer notes */}
          <div className="text-center space-y-2">
            <p className="text-xs text-[#9CA3AF] max-w-2xl mx-auto leading-relaxed">
              All prices shown exclusive of VAT where applicable. EU VAT rules apply to
              digital services sold to EU consumers — VAT will be calculated and added at
              checkout based on your country of residence.
            </p>
            <p className="text-xs text-[#9CA3AF]">
              Eligibility for Student and Young Professional tiers is verified at signup.
            </p>
          </div>

        </div>
      </Container>
    </div>
  );
}
