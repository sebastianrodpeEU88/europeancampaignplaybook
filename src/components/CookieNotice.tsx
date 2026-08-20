'use client';

import { useSyncExternalStore } from 'react';
import Link from 'next/link';
import { routes } from '@/lib/routes';

// We use only strictly-necessary cookies, which are exempt from the consent
// requirement under the ePrivacy Directive + GDPR. So this is a transparency
// NOTICE, not a consent gate: it's non-blocking, has no Accept/Reject choice
// (there's nothing to consent to), and remembers dismissal in localStorage —
// adding no cookie of its own. Bump the version suffix if the policy changes
// materially and the notice should reappear.
const STORAGE_KEY = 'ecp-cookie-notice-v1';

// A tiny external store over localStorage: lets the notice read its dismissal
// state via useSyncExternalStore, which reads on the client without a
// post-mount setState and renders nothing during SSR (server snapshot =
// "dismissed"), so there's no hydration mismatch.
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener('storage', cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener('storage', cb);
  };
}

function isDismissed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    // localStorage blocked (private mode / disabled): show the notice. It just
    // won't be remembered, which is fine for a purely informational note.
    return false;
  }
}

// Server render: treat as dismissed so the notice never ships in the SSR HTML;
// the client re-evaluates after hydration.
function getServerSnapshot(): boolean {
  return true;
}

function dismiss() {
  try {
    localStorage.setItem(STORAGE_KEY, '1');
  } catch {
    /* ignore — dismissal simply won't persist */
  }
  listeners.forEach((l) => l());
}

export default function CookieNotice() {
  const dismissed = useSyncExternalStore(subscribe, isDismissed, getServerSnapshot);
  if (dismissed) return null;

  return (
    <div role="region" aria-label="Cookie notice" className="fixed inset-x-0 bottom-0 z-40 p-3 sm:p-4">
      <div className="mx-auto flex max-w-3xl flex-col gap-3 rounded-[2px] border border-white/10 bg-navy p-4 text-[#EDE7DA] shadow-xl sm:flex-row sm:items-center sm:gap-4">
        <p className="text-sm leading-relaxed text-[#EDE7DA]/85">
          We use <strong className="font-semibold text-[#EDE7DA]">only essential cookies</strong> — the ones needed to
          sign you in and keep the site secure. No tracking, no advertising.{' '}
          <Link
            href={routes.cookies()}
            className="underline underline-offset-2 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EDE7DA] rounded"
          >
            Cookie Policy
          </Link>
          .
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 self-end rounded-[2px] bg-paper px-4 py-2 text-sm font-semibold text-navy transition-colors hover:bg-[#EDE7DA]/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EDE7DA] focus-visible:ring-offset-2 focus-visible:ring-offset-navy sm:self-auto"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
