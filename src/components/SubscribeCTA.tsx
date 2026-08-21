import Link from 'next/link';
import { routes } from '@/lib/routes';

// `variant="orange"` is used on the homepage (where the dark sections are the
// brand orange); everywhere else it stays navy.
export default function SubscribeCTA({ variant = 'navy' }: { variant?: 'navy' | 'orange' }) {
  const orange = variant === 'orange';

  const card = orange ? 'bg-[#dd3c13] text-[#EDE7DA]' : 'bg-navy text-[#EDE7DA]';
  const eyebrow = orange ? 'text-[#EDE7DA]/60' : 'text-[#EDE7DA]/50';
  const heading = 'text-[#EDE7DA]';
  const body = orange ? 'text-[#EDE7DA]/85' : 'text-[#EDE7DA]/75';
  const primary =
    'bg-paper text-navy hover:bg-[#EDE7DA]/85 focus-visible:ring-[#EDE7DA] ' +
    (orange ? 'focus-visible:ring-offset-[#dd3c13]' : 'focus-visible:ring-offset-navy');
  const secondary = orange
    ? 'border-[#EDE7DA]/30 text-[#EDE7DA] hover:bg-white/10 focus-visible:ring-[#EDE7DA] focus-visible:ring-offset-[#dd3c13]'
    : 'border-white/20 text-[#EDE7DA] hover:bg-white/10 focus-visible:ring-[#EDE7DA] focus-visible:ring-offset-navy';

  return (
    <section
      aria-label="Subscribe to european campaign playbook"
      className={`rounded-[2px] p-8 my-12 ${card}`}
    >
      <div className="max-w-2xl">
        <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${eyebrow}`}>Membership</p>
        <h2 className={`display text-2xl mb-3 ${heading}`}>unlock the full knowledge library</h2>
        <p className={`leading-relaxed mb-6 ${body}`}>
          One membership, every workshop we run for a full year of AI, social media, and strategy, plus
          members-only networking, all our articles and knowledge pillars, and discounts at industry
          events. Plans from €9 a month.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href={routes.subscribe()}
            className={`rounded-[2px] px-5 py-2.5 text-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${primary}`}
          >
            View membership options
          </Link>
          <Link
            href={routes.community()}
            className={`rounded-[2px] border px-5 py-2.5 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${secondary}`}
          >
            Learn about the community
          </Link>
        </div>
      </div>
    </section>
  );
}
