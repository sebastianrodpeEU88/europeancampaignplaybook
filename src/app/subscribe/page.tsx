import type { Metadata } from 'next';
import Container from '@/components/Container';

export const metadata: Metadata = {
  title: 'Subscribe',
  description: 'Choose a Campaign Intelligence Library membership — Individual, Team, or Institution. Full access to all articles, compliance briefings, and AI prompt packs.',
};

const TIERS = [
  {
    name: 'Individual',
    price: '€19',
    period: 'per month',
    annual: '€149 per year',
    description: 'For practitioners who want full access to the knowledge library and compliance resources.',
    audience: 'Campaign managers, public affairs advisers, researchers, and independent practitioners.',
    features: [
      'Full access to all articles across 16 pillars',
      'Downloadable templates and compliance checklists',
      'AI prompt packs for campaign workflows',
      'EU compliance briefings updated quarterly',
      'Community access and contributor field notes',
      'Member-only playbooks',
    ],
  },
  {
    name: 'Team',
    price: 'Per seat',
    period: 'shared workspace',
    annual: 'Volume discounts available',
    description: 'For agencies, party communications teams, and organisations that need a shared knowledge base.',
    audience: 'Campaign agencies, party headquarters, public affairs consultancies, and NGO communications teams.',
    features: [
      'Everything in Individual',
      'Shared team workspace',
      'Team-level article annotations and notes',
      'Centralised billing and account management',
      'Priority access to new content and features',
      'Dedicated account support',
    ],
    highlighted: true,
  },
  {
    name: 'Institution',
    price: 'Custom',
    period: 'contact us',
    annual: 'Annual contract',
    description: 'For parties, NGOs, coalitions, and institutions that need tailored access and onboarding.',
    audience: 'Political parties, national campaign organisations, EU institutions, civil society coalitions.',
    features: [
      'Everything in Team',
      'Custom taxonomy and content curation',
      'Onboarding and training for staff',
      'Bespoke compliance briefings for your jurisdiction',
      'Dedicated editorial support',
      'SLA and contractual terms',
    ],
  },
];

export default function SubscribePage() {
  return (
    <div className="bg-[#F8F7F3] min-h-screen py-12">
      <Container>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-[#1C1C1E] mb-3">
              Membership
            </h1>
            <p className="text-[#6B7280] leading-relaxed max-w-2xl mx-auto">
              Full access to the Campaign Intelligence Library — including all articles, compliance
              checklists, AI prompt packs, and the growing community of EU campaign practitioners.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-2xl border bg-white p-6 flex flex-col ${
                  tier.highlighted
                    ? 'border-[#185FA5] shadow-md'
                    : 'border-[rgba(0,0,0,0.08)]'
                }`}
              >
                {tier.highlighted && (
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#185FA5] mb-3">
                    Most popular
                  </p>
                )}
                <h2 className="text-xl font-bold text-[#1C1C1E] mb-1">{tier.name}</h2>
                <div className="mb-1">
                  <span className="text-2xl font-bold text-[#1C1C1E]">{tier.price}</span>
                  <span className="text-sm text-[#6B7280] ml-1">{tier.period}</span>
                </div>
                <p className="text-xs text-[#9CA3AF] mb-4">{tier.annual}</p>
                <p className="text-sm text-[#6B7280] leading-relaxed mb-3">{tier.description}</p>
                <p className="text-xs text-[#9CA3AF] mb-5 italic">{tier.audience}</p>

                <ul className="space-y-2 mb-6 flex-1">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-[#374151]">
                      <svg
                        className="h-4 w-4 text-[#3B6D11] flex-shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Disabled button with coming soon tooltip */}
                <div className="relative group">
                  <button
                    disabled
                    aria-disabled="true"
                    aria-describedby={`coming-soon-${tier.name}`}
                    className="w-full rounded-lg bg-[rgba(0,0,0,0.08)] px-4 py-2.5 text-sm font-medium text-[#9CA3AF] cursor-not-allowed"
                  >
                    {tier.name === 'Institution' ? 'Contact us' : 'Subscribe'}
                    {/* TODO: Stripe Checkout — replace disabled button with Stripe Checkout session creation */}
                  </button>
                  <div
                    id={`coming-soon-${tier.name}`}
                    role="tooltip"
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block whitespace-nowrap rounded-lg bg-[#1C1C1E] px-3 py-1.5 text-xs text-white shadow-lg z-10"
                  >
                    Coming soon — memberships open shortly
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Notes */}
          <div className="text-center">
            <p className="text-sm text-[#9CA3AF] mb-2">
              Stripe checkout will be connected when memberships launch.
            </p>
            <p className="text-xs text-[#9CA3AF] max-w-2xl mx-auto leading-relaxed">
              All prices shown exclusive of VAT where applicable. EU VAT rules apply to
              digital services sold to EU consumers. VAT will be calculated and added at
              checkout based on your country of residence.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
