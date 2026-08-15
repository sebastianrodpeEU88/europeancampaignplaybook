'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

// The mobile menu is a native <details> element. Client-side navigation via
// <Link> doesn't reload the page, so the panel would otherwise stay open on top
// of the content after tapping a link. This wrapper closes it: instantly when a
// link inside is tapped (so it vanishes even when the destination is the current
// page), and again on every route change as a safety net.
export default function MobileNav({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (ref.current) ref.current.open = false;
  }, [pathname]);

  function handleClick(e: React.MouseEvent<HTMLDetailsElement>) {
    // Only collapse when a navigation link was tapped — never the summary
    // toggle itself, which must keep its native open/close behaviour.
    if ((e.target as HTMLElement).closest('a') && ref.current) {
      ref.current.open = false;
    }
  }

  return (
    <details ref={ref} onClick={handleClick} className="lg:hidden group">
      {children}
    </details>
  );
}
