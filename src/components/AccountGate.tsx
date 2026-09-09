import Link from 'next/link';
import { routes } from '@/lib/routes';

const BENEFITS = [
  'Every bootcamp episode, start to finish',
  'Downloadable worksheets for each one',
  'Your progress saved as you go',
];

// The free gate. Bootcamp episodes are open to anyone with an account, so this
// asks for a sign-up rather than a payment — deliberately distinct from Paywall.
export default function AccountGate({ redirectTo }: { redirectTo?: string }) {
  const withRedirect = (href: string) =>
    redirectTo ? `${href}?redirectTo=${encodeURIComponent(redirectTo)}` : href;

  return (
    <div className="relative -mx-4 sm:-mx-0">
      <div
        className="absolute inset-x-0 top-0 h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, #EDE7DA)' }}
        aria-hidden="true"
      />

      <div className="relative rounded-[2px] border border-[#dd3c13]/30 bg-paper p-8 mt-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#dd3c13] mb-2">
          Free, account needed
        </p>
        <h2 className="display text-xl text-ink mb-2">create a free account to keep reading</h2>
        <p className="text-sm text-ink/60 leading-relaxed mb-5">
          The bootcamp costs nothing. You just need an account so we can save which episodes
          you have finished. No card, no membership.
        </p>

        <ul className="space-y-2 mb-6">
          {BENEFITS.map((benefit) => (
            <li key={benefit} className="flex items-start gap-2 text-sm text-ink/80">
              <svg
                className="h-4 w-4 text-[#dd3c13] flex-shrink-0 mt-0.5"
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
              {benefit}
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap gap-3">
          <Link
            href={withRedirect(routes.signup())}
            className="rounded-[2px] bg-navy px-4 py-2.5 text-sm font-semibold text-[#EDE7DA] hover:bg-[#0A1D2B]/85 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
          >
            Create a free account
          </Link>
          <Link
            href={withRedirect(routes.login())}
            className="rounded-[2px] border border-navy/30 px-4 py-2.5 text-sm font-semibold text-navy hover:bg-navy/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
          >
            I already have one
          </Link>
        </div>
      </div>
    </div>
  );
}
