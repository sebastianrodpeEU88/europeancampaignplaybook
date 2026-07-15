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
          background: 'linear-gradient(to bottom, transparent, #EDE7DA)',
        }}
        aria-hidden="true"
      />

      {/* Paywall card */}
      <div className="relative rounded-[2px] border border-rule/20 bg-paper p-8 mt-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink/45 mb-2">
          Members only
        </p>
        <h2 className="display text-xl text-ink mb-2">
          continue reading inside the community
        </h2>
        <p className="text-sm text-ink/60 leading-relaxed mb-5">
          Subscribe to unlock the full article, EU compliance checklists, contributor field
          notes and related playbooks.
        </p>

        {/* Benefits */}
        <ul className="space-y-2 mb-6" aria-label="Membership benefits">
          {BENEFITS.map((benefit) => (
            <li key={benefit} className="flex items-start gap-2 text-sm text-ink/80">
              <svg
                className="h-4 w-4 text-ink flex-shrink-0 mt-0.5"
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
            className="rounded-[2px] bg-navy px-5 py-2.5 text-sm font-semibold text-[#EDE7DA] hover:bg-[#0A1D2B]/85 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
          >
            Subscribe to the community
          </Link>
          <Link
            href={routes.community()}
            className="rounded-[2px] border border-rule/25 px-5 py-2.5 text-sm font-medium text-ink/80 hover:bg-ink/[0.03] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
          >
            View membership benefits
          </Link>
        </div>
      </div>
    </div>
  );
}
