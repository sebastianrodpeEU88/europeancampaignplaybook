import Link from 'next/link';
import { routes } from '@/lib/routes';

export default function SubscribeCTA() {
  return (
    <section
      aria-label="Subscribe to Campaign Intelligence Library"
      className="rounded-2xl bg-[#2B0A2E] text-white p-8 my-12"
    >
      <div className="max-w-2xl">
        <p className="text-xs font-semibold font-mono uppercase tracking-wider text-[#A896AC] mb-2">
          Membership
        </p>
        <h2 className="text-2xl font-bold mb-3">
          Unlock the full knowledge library
        </h2>
        <p className="text-[#D1D5DB] leading-relaxed mb-6">
          Subscribe to access full articles, EU compliance checklists, AI prompt packs,
          downloadable templates, and the growing community of EU campaign practitioners.
          From €19 per month.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href={routes.subscribe()}
            className="rounded-lg bg-white text-[#2B0A2E] px-5 py-2.5 text-sm font-semibold hover:bg-[#FDF6EC] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#2B0A2E]"
          >
            View membership options
          </Link>
          <Link
            href={routes.community()}
            className="rounded-lg border border-[rgba(255,255,255,0.2)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[rgba(255,255,255,0.08)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#2B0A2E]"
          >
            Learn about the community
          </Link>
        </div>
      </div>
    </section>
  );
}
