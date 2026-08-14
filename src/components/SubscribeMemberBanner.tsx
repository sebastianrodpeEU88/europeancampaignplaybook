'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { routes } from '@/lib/routes';

// Shown to visitors who already have an active membership: choosing a plan
// again would create a second, parallel subscription, so point them to their
// account (to change the plan or manage billing) instead. Checked client-side
// so the subscribe page stays static; the server action enforces the same
// guard as the real protection.
export default function SubscribeMemberBanner() {
  const [member, setMember] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/membership')
      .then((r) => (r.ok ? r.json() : { member: false }))
      .then((d) => {
        if (!cancelled) setMember(Boolean(d.member));
      })
      .catch(() => {
        if (!cancelled) setMember(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Render nothing while loading or for non-members.
  if (member !== true) return null;

  return (
    <div className="mb-10 rounded-[2px] border border-navy/20 bg-navy/[0.04] p-6 text-center">
      <p className="font-semibold text-ink mb-1">You’re already a member ✓</p>
      <p className="text-sm text-ink/70 mb-4 max-w-xl mx-auto leading-relaxed">
        No need to subscribe again — choosing a plan here would start a second subscription
        billed alongside your current one. To change your plan or update billing, head to your
        account.
      </p>
      <Link
        href={routes.account()}
        className="inline-block rounded-[2px] bg-navy px-5 py-2.5 text-sm font-semibold text-[#EDE7DA] hover:bg-[#0A1D2B]/85 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
      >
        Go to your account
      </Link>
    </div>
  );
}
