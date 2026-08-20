import Link from 'next/link';
import { routes } from '@/lib/routes';

export default function SubscribeCTA() {
  return (
    <section
      aria-label="Subscribe to European Campaign Playbook"
      className="rounded-[2px] bg-navy text-[#EDE7DA] p-8 my-12"
    >
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#EDE7DA]/50 mb-2">
          Membership
        </p>
        <h2 className="display text-2xl text-[#EDE7DA] mb-3">
          unlock the full knowledge library
        </h2>
        <p className="text-[#EDE7DA]/75 leading-relaxed mb-6">
          One membership, every workshop we run for a full year — AI, social media, strategy — plus
          members-only networking, all our articles and knowledge pillars, and discounts at industry
          events. Plans from €9 a month.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href={routes.subscribe()}
            className="rounded-[2px] bg-paper text-navy px-5 py-2.5 text-sm font-semibold hover:bg-[#EDE7DA]/85 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EDE7DA] focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
          >
            View membership options
          </Link>
          <Link
            href={routes.community()}
            className="rounded-[2px] border border-white/20 px-5 py-2.5 text-sm font-medium text-[#EDE7DA] hover:bg-white/10 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EDE7DA] focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
          >
            Learn about the community
          </Link>
        </div>
      </div>
    </section>
  );
}
