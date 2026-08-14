import Link from 'next/link';
import { routes } from '@/lib/routes';
import { getSearchIndex } from '@/lib/content';
import Container from './Container';
import HeaderAuthLink from './HeaderAuthLink';
import MoveMark from './brand/MoveMark';
import CommandPalette from './CommandPalette';
import MobileSearchTrigger from './MobileSearchTrigger';

const navLinks = [
  { label: 'Knowledge library', href: routes.taxonomy() },
  { label: 'Trends', href: routes.trends() },
  { label: 'Articles', href: routes.articles() },
  { label: 'Events', href: routes.events() },
  { label: 'Contributors', href: routes.contributors() },
  { label: 'Community', href: routes.community() },
];

export default async function Header() {
  const searchIndex = await getSearchIndex();

  return (
    // viewTransitionName anchors the header during route transitions — the
    // content animates, the chrome stays still (see globals.css).
    <header className="sticky top-0 z-40 bg-navy" style={{ viewTransitionName: 'site-header' }}>
      <Container>
        <div className="flex h-16 items-center justify-between gap-8">
          {/* Logo */}
          <Link
            href={routes.home()}
            className="flex items-center gap-2.5 flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EDE7DA] focus-visible:ring-offset-2 focus-visible:ring-offset-navy rounded"
          >
            <MoveMark variant="arrow" className="h-5 w-5 text-[#EDE7DA] flex-shrink-0" title="European Campaign Playbook" />
            <span className="display text-lg text-[#EDE7DA] whitespace-nowrap">
              european campaign
            </span>
            <span className="hidden sm:inline display text-lg text-[#EDE7DA]/60 whitespace-nowrap">
              playbook
            </span>
          </Link>

          {/* Desktop nav */}
          <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-4 xl:gap-6 min-w-0">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-[#EDE7DA]/70 hover:text-[#EDE7DA] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EDE7DA] rounded px-1 whitespace-nowrap"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Command palette — mounted here (not inside a `hidden` wrapper)
              so its fixed-position modal can still open on mobile, where
              it's triggered from the menu below instead of this button. */}
          <CommandPalette index={searchIndex} />

          {/* Account + Subscribe CTA */}
          <div className="hidden lg:flex items-center gap-3 xl:gap-4 flex-shrink-0">
            <HeaderAuthLink className="text-sm font-medium text-[#EDE7DA]/70 hover:text-[#EDE7DA] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EDE7DA] rounded px-1 whitespace-nowrap" />
            <Link
              href={routes.subscribe()}
              className="rounded-[2px] bg-paper px-4 py-2 text-sm font-medium text-navy hover:bg-[#EDE7DA]/85 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EDE7DA] focus-visible:ring-offset-2 focus-visible:ring-offset-navy whitespace-nowrap"
            >
              Subscribe
            </Link>
          </div>

          {/* Mobile nav */}
          <details className="lg:hidden group">
            <summary className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-[2px] hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EDE7DA] list-none [&::-webkit-details-marker]:hidden">
              <svg
                aria-label="Open navigation menu"
                className="h-5 w-5 text-[#EDE7DA] group-open:hidden"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                aria-label="Close navigation menu"
                className="h-5 w-5 text-[#EDE7DA] hidden group-open:block"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </summary>
            <nav
              aria-label="Mobile navigation"
              className="absolute left-0 right-0 top-16 bg-navy border-t border-white/10 shadow-lg z-50 py-4"
            >
              <Container>
                <div className="flex flex-col gap-1">
                  <MobileSearchTrigger />
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="rounded-[2px] px-3 py-2 text-sm font-medium text-[#EDE7DA] hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EDE7DA]"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <HeaderAuthLink className="rounded-[2px] px-3 py-2 text-sm font-medium text-[#EDE7DA] hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EDE7DA]" />
                  <div className="pt-2 border-t border-white/10 mt-2">
                    <Link
                      href={routes.subscribe()}
                      className="block rounded-[2px] bg-paper px-3 py-2 text-sm font-medium text-navy text-center hover:bg-[#EDE7DA]/85 transition-colors duration-150"
                    >
                      Subscribe
                    </Link>
                  </div>
                </div>
              </Container>
            </nav>
          </details>
        </div>
      </Container>
    </header>
  );
}
