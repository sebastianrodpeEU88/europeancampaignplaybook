'use client';

import { useEffect, useState } from 'react';

// Sets expectations for logged-out visitors: choosing a plan takes them to log
// in / sign up before checkout (rather than a silent bounce). Hidden for
// signed-in users, who go straight to Stripe. Checked client-side so the
// subscribe page stays static.
export default function SubscribeAccountNote() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/membership')
      .then((r) => (r.ok ? r.json() : { authenticated: false }))
      .then((d) => {
        if (!cancelled) setAuthed(Boolean(d.authenticated));
      })
      .catch(() => {
        if (!cancelled) setAuthed(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Render nothing while loading or when signed in.
  if (authed !== false) return null;

  return (
    <div className="mb-8 flex items-center justify-center gap-2 rounded-[2px] border border-rule/20 bg-ink/[0.02] px-4 py-3 text-sm text-ink/70">
      <svg className="h-4 w-4 flex-shrink-0 text-ink/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>
        You&apos;ll need a free account to subscribe — choosing a plan takes you to log in or sign
        up first, then straight to secure checkout.
      </span>
    </div>
  );
}
