'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { routes } from '@/lib/routes';

// Client-rendered deliberately: checking auth server-side in Header would
// force every page in the site to render dynamically instead of
// statically (Header is in the root layout, so it wraps every route).
// This keeps the rest of the page cacheable and only this link updates
// client-side after hydration.
export default function HeaderAuthLink({ className }: { className: string }) {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    // Supabase isn't configured yet (e.g. mid-setup) — leave loggedIn at
    // its default `null`, which already renders as logged-out below,
    // rather than throwing.
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return;
    }

    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => setLoggedIn(!!data.user));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Link href={loggedIn ? routes.account() : routes.login()} className={className}>
      {loggedIn ? 'Account' : 'Log in'}
    </Link>
  );
}
