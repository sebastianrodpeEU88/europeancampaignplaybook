'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { routes } from '@/lib/routes';

// Shows a "my events" nav link only to signed-in visitors. Checked client-side
// (via /api/membership) so the header stays static like HeaderAuthLink.
export default function MyEventsNavLink({ className }: { className?: string }) {
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

  if (authed !== true) return null;

  return (
    <Link href={routes.myEvents()} className={className}>
      my events
    </Link>
  );
}
