import Link from 'next/link';
import { routes } from '@/lib/routes';

const BENEFITS = [
  'Full article access across all 16 knowledge pillars',
  'Downloadable templates and compliance checklists',
  'AI prompt packs for campaign content workflows',
  'EU-first compliance briefings reviewed by practitioners',
  'Community contributor field notes and case studies',
  'Member-only playbooks and practitioner frameworks',
];

export default function Paywall() {
  return (
    <div className="relative -mx-4 sm:-mx-0">
      {/* Gradient fade over preview content */}
      <div
        className="absolute inset-x-0 top-0 h-32 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, transparent, #FDF6EC)',
        }}
        aria-hidden="true"
      />

      {/* Paywall card */}
      <div className="relative rounded-2xl border border-[rgba(0,0,0,0.08)] bg-white p-8 shadow-sm mt-4">
        <p className="text-xs font-semibold font-mono uppercase tracking-wider text-[#A896AC] mb-2">
          Members only
        </p>
        <h2 className="text-xl font-bold text-[#2B0A2E] mb-2">
          Continue reading inside the community
        </h2>
        <p className="text-sm text-[#7A6380] leading-relaxed mb-5">
          Subscribe to unlock the full article, EU compliance checklists, contributor field
          notes and related playbooks.
        </p>

        {/* Benefits */}
        <ul className="space-y-2 mb-6" aria-label="Membership benefits">
          {BENEFITS.map((benefit) => (
            <li key={benefit} className="flex items-start gap-2 text-sm text-[#4A1F4D]">
              <svg
                className="h-4 w-4 text-[#3B6D11] flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {benefit}
            </li>
          ))}
        </ul>

        {/* CTAs */}
        <div className="flex flex-wrap gap-3">
          <Link
            href={routes.subscribe()}
            className="rounded-lg bg-[#2B0A2E] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#4A1F4D] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5B35] focus-visible:ring-offset-2"
          >
            Subscribe to the community
            {/* TODO: Stripe — replace with Stripe Checkout session creation */}
          </Link>
          <Link
            href={routes.community()}
            className="rounded-lg border border-[rgba(0,0,0,0.12)] px-5 py-2.5 text-sm font-medium text-[#4A1F4D] hover:bg-[rgba(0,0,0,0.03)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5B35] focus-visible:ring-offset-2"
          >
            View membership benefits
          </Link>
        </div>

        <p className="mt-4 text-xs text-[#A896AC]">
          Stripe checkout will be connected later.
        </p>
      </div>
    </div>
  );
}
