'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { routes } from '@/lib/routes';

// Shows an "Admin" nav link only to super-users. Checked client-side (via
// /api/membership) so the header stays static; the /admin page enforces the
// same check server-side.
export default function AdminNavLink({ className }: { className?: string }) {
  const [admin, setAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/membership')
      .then((r) => (r.ok ? r.json() : { admin: false }))
      .then((d) => {
        if (!cancelled) setAdmin(Boolean(d.admin));
      })
      .catch(() => {
        if (!cancelled) setAdmin(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (admin !== true) return null;

  return (
    <Link href={routes.admin()} className={className}>
      Admin
    </Link>
  );
}
