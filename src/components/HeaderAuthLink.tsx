'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { routes } from '@/lib/routes';

// Auth state comes from the server via /api/membership (which reads the session
// cookie server-side and is the source of truth) rather than the browser
// Supabase client. This mirrors AdminNavLink / MyEventsNavLink and stays correct
// regardless of how the session cookie is stored or read in the browser — the
// earlier browser-side getUser() could report logged-out to a signed-in user,
// leaving the header stuck on "log in". Rendered client-side so the Header
// (in the root layout) can stay static and cacheable.
export default function HeaderAuthLink({ className }: { className: string }) {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/membership')
      .then((r) => (r.ok ? r.json() : { authenticated: false }))
      .then((d) => {
        if (!cancelled) setLoggedIn(Boolean(d.authenticated));
      })
      .catch(() => {
        if (!cancelled) setLoggedIn(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Link href={loggedIn ? routes.account() : routes.login()} className={className}>
      {loggedIn ? 'account' : 'log in'}
    </Link>
  );
}
