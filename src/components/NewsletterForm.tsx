'use client';

import { useActionState } from 'react';
import { subscribeNewsletter, idleNewsletterState } from '@/lib/newsletter-actions';

export default function NewsletterForm() {
  const [state, action, pending] = useActionState(subscribeNewsletter, idleNewsletterState);

  if (state.status === 'ok') {
    return (
      <div className="rounded-[2px] border border-rule/20 bg-paper p-6 text-center">
        <p className="font-semibold text-ink mb-1">You&rsquo;re on the list 🎉</p>
        <p className="text-sm text-ink/60">
          Thanks for subscribing — look out for our next issue.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="rounded-[2px] border border-rule/20 bg-paper p-6">
      {/* Honeypot — hidden from real users; bots that fill it are dropped. */}
      <div aria-hidden="true" className="absolute left-[-9999px] top-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="nl-company">Leave this field empty</label>
        <input id="nl-company" name="company" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          aria-label="Email address"
          className="flex-1 rounded-[2px] border border-rule/25 bg-paper px-3 py-2.5 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-ink"
        />
        <button
          type="submit"
          disabled={pending}
          className="flex-shrink-0 rounded-[2px] bg-navy px-5 py-2.5 text-sm font-semibold text-[#EDE7DA] hover:bg-[#0A1D2B]/85 transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
        >
          {pending ? 'Subscribing…' : 'Subscribe'}
        </button>
      </div>
      {state.status === 'error' && (
        <p className="mt-2 text-sm text-series-02-narrative" role="alert">
          {state.message}
        </p>
      )}
      <p className="mt-3 text-xs text-ink/45">
        No spam. Unsubscribe any time. We only email about workshops, articles, and campaign
        craft.
      </p>
    </form>
  );
}
