'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { routes } from '@/lib/routes';

// A launch promo shown once per browser session (sessionStorage), a short beat
// after arrival, promoting the workshops and the free info sessions with the
// poster. Bump the key to re-show for a new campaign. Skipped on the events
// pages themselves, where it would be redundant.
const STORAGE_KEY = 'ecp-promo-workshops-2026';

export default function PromoModal() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const closeRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* storage blocked — it just won't be remembered */
    }
    setOpen(false);
  }, []);

  useEffect(() => {
    if (pathname?.startsWith(routes.events())) return;
    let seen = true;
    try {
      seen = sessionStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      seen = false;
    }
    if (seen) return;
    const t = setTimeout(() => setOpen(true), 900);
    return () => clearTimeout(t);
  }, [pathname]);

  // While open: lock body scroll, focus the close button, close on Escape.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="promo-title"
      className="fixed inset-0 z-[80] flex items-center justify-center bg-navy/70 p-4"
      onClick={close}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-[2px] bg-paper shadow-2xl md:max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-navy/80 text-[#EDE7DA] hover:bg-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EDE7DA]"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <Link href={routes.events()} onClick={close} className="block">
          {/* Portrait poster on phones; landscape on tablet/laptop/desktop (md+). */}
          <Image
            src="/workshops-poster.png"
            alt="european campaign playbook workshops"
            width={1024}
            height={1536}
            sizes="(max-width: 767px) 92vw, 1px"
            className="h-auto w-full md:hidden"
          />
          <Image
            src="/workshops-poster-landscape.png"
            alt="european campaign playbook workshops"
            width={1536}
            height={1024}
            sizes="(max-width: 767px) 1px, 42rem"
            className="hidden h-auto w-full md:block"
          />
        </Link>

        <div className="p-5">
          <h2 id="promo-title" className="display text-xl text-ink mb-2">
            free workshops and info sessions this autumn
          </h2>
          <p className="text-sm text-ink/70 mb-4">
            Join a free live info session, or a hands-on AI workshop for campaigners. Brussels and
            online, September to October 2026.
          </p>
          <Link
            href={routes.events()}
            onClick={close}
            className="block rounded-[2px] bg-navy px-4 py-2.5 text-center text-sm font-semibold text-[#EDE7DA] hover:bg-[#0A1D2B]/85 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
          >
            See the programme
          </Link>
        </div>
      </div>
    </div>
  );
}
