'use client';

import { useActionState } from 'react';
import { subscribeNewsletter } from '@/lib/newsletter-actions';
import { idleNewsletterState } from '@/lib/newsletter-state';

// `card` (default): light card, used on the /newsletter page.
// `footer`: compact, dark-themed inline form for the (navy) site footer.
export default function NewsletterForm({ variant = 'card' }: { variant?: 'card' | 'footer' }) {
  const [state, action, pending] = useActionState(subscribeNewsletter, idleNewsletterState);
  const footer = variant === 'footer';

  if (state.status === 'ok') {
    return footer ? (
      <p className="text-sm text-[#EDE7DA]" role="status">
        <span className="font-medium">📬 Almost there — check your email to confirm.</span>{' '}
        <span className="text-[#EDE7DA]/70">
          Look for &ldquo;Confirm your campaignPro brief subscription&rdquo; from
          europeancampaignplaybook@mail.beehiiv.com — check spam too.
        </span>
      </p>
    ) : (
      <div className="rounded-[2px] border border-rule/20 bg-paper p-6 text-center">
        <p className="font-semibold text-ink mb-1">📬 Almost there — check your email</p>
        <p className="text-sm text-ink/60">
          We&rsquo;ve sent a confirmation link to finish your subscription. Look for{' '}
          <strong className="font-semibold text-ink/80">
            &ldquo;Confirm your campaignPro brief subscription&rdquo;
          </strong>{' '}
          from <span className="whitespace-nowrap">europeancampaignplaybook@mail.beehiiv.com</span>,
          and click the link — check your <strong className="font-semibold">spam folder</strong> if
          it&rsquo;s not in your inbox.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className={footer ? 'w-full' : 'rounded-[2px] border border-rule/20 bg-paper p-6'}>
      {/* Honeypot — hidden from real users; bots that fill it are dropped. */}
      <div aria-hidden="true" className="absolute left-[-9999px] top-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor={`nl-company-${variant}`}>Leave this field empty</label>
        <input id={`nl-company-${variant}`} name="company" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          aria-label="Email address"
          className={
            footer
              ? 'flex-1 rounded-[2px] border border-[#EDE7DA]/20 bg-white/5 px-3 py-2.5 text-sm text-[#EDE7DA] placeholder:text-[#EDE7DA]/40 focus:outline-none focus:ring-2 focus:ring-[#EDE7DA]'
              : 'flex-1 rounded-[2px] border border-rule/25 bg-paper px-3 py-2.5 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-ink'
          }
        />
        <button
          type="submit"
          disabled={pending}
          className={
            footer
              ? 'flex-shrink-0 rounded-[2px] bg-paper px-5 py-2.5 text-sm font-semibold text-navy hover:bg-[#EDE7DA]/85 transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EDE7DA] focus-visible:ring-offset-2 focus-visible:ring-offset-navy'
              : 'flex-shrink-0 rounded-[2px] bg-navy px-5 py-2.5 text-sm font-semibold text-[#EDE7DA] hover:bg-[#0A1D2B]/85 transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2'
          }
        >
          {pending ? 'Subscribing…' : 'Subscribe'}
        </button>
      </div>
      {state.status === 'error' && (
        <p className={footer ? 'mt-2 text-xs text-[#EDE7DA]/80' : 'mt-2 text-sm text-series-02-narrative'} role="alert">
          {state.message}
        </p>
      )}
      {!footer && (
        <p className="mt-3 text-xs text-ink/45">
          No spam. Unsubscribe any time. We only email about workshops, articles, and campaign
          craft.
        </p>
      )}
    </form>
  );
}
