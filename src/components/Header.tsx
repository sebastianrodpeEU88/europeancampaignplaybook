import Link from 'next/link';
import { routes } from '@/lib/routes';
import { getSearchIndex } from '@/lib/content';
import Container from './Container';
import HeaderAuthLink from './HeaderAuthLink';
import MyEventsNavLink from './MyEventsNavLink';
import AdminNavLink from './AdminNavLink';
import MoveMark from './brand/MoveMark';
import CommandPalette from './CommandPalette';
import MobileSearchTrigger from './MobileSearchTrigger';
import MobileNav from './MobileNav';


// Grouped under the "the playbook" dropdown.
const playbookLinks = [
  { label: 'trends', href: routes.trends() },
  { label: 'knowledge library', href: routes.taxonomy() },
  { label: 'articles', href: routes.articles() },
  { label: 'contributors', href: routes.contributors() },
];

// Grouped under the "what we do" dropdown.
const whatWeDoLinks = [
  { label: 'workshops', href: routes.events() },
  { label: 'AI insights', href: routes.aiInsights() },
  { label: 'consultancy and advice', href: routes.consultancy() },
];

// Grouped under the "who we are" dropdown.
const whoWeAreLinks = [
  { label: 'community', href: routes.community() },
];

export default async function Header() {
  const searchIndex = await getSearchIndex();

  return (
    // viewTransitionName anchors the header during route transitions — the
    // content animates, the chrome stays still (see globals.css).
    <header className="sticky top-0 z-40 bg-navy" style={{ viewTransitionName: 'site-header' }}>
      <Container>
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href={routes.home()}
            className="flex items-center gap-2.5 flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EDE7DA] focus-visible:ring-offset-2 focus-visible:ring-offset-navy rounded"
          >
            <MoveMark variant="arrow" className="h-5 w-5 text-[#EDE7DA] flex-shrink-0" title="european campaign playbook" />
            {/* Compact "ecp" wordmark on mobile; full wordmark from sm up so the
                brand never shows a truncated "european campaign" without "playbook". */}
            <span className="sm:hidden display text-lg text-[#EDE7DA] whitespace-nowrap">
              ecp
            </span>
            <span className="hidden sm:inline display text-lg text-[#EDE7DA] whitespace-nowrap">
              european campaign
            </span>
            <span className="hidden sm:inline display text-lg text-[#EDE7DA]/60 whitespace-nowrap">
              playbook
            </span>
          </Link>

          {/* Right cluster — nav, search, and CTAs grouped and right-aligned
              so they sit together instead of spreading across the bar. */}
          <div className="flex items-center gap-4 xl:gap-6 min-w-0">
          {/* Desktop nav */}
          <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-4 xl:gap-6 min-w-0">
            {/* "the playbook" — reveals its submenu on hover or keyboard focus */}
            <div className="relative group">
              <Link
                href={routes.playbook()}
                aria-haspopup="true"
                className="flex items-center gap-1 text-sm font-medium text-[#EDE7DA]/70 group-hover:text-[#EDE7DA] group-focus-within:text-[#EDE7DA] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EDE7DA] rounded px-1 whitespace-nowrap"
              >
                the playbook
                <svg
                  className="h-3.5 w-3.5 transition-transform duration-150 group-hover:rotate-180 group-focus-within:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Link>
              {/* pt-2 keeps the hover bridge gap-free between trigger and panel */}
              <div className="absolute left-0 top-full pt-2 z-50 hidden group-hover:block group-focus-within:block">
                <ul className="min-w-[14rem] rounded-[2px] border border-white/10 bg-navy py-2 shadow-xl">
                  {playbookLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="block px-4 py-2 text-sm font-medium text-[#EDE7DA]/70 hover:bg-white/10 hover:text-[#EDE7DA] transition-colors duration-150 focus-visible:outline-none focus-visible:bg-white/10 focus-visible:text-[#EDE7DA]"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* "what we do" — Workshops + Consultancy; reveals on hover or focus.
                The trigger is a button (there is no standalone landing page). */}
            <div className="relative group">
              <button
                type="button"
                aria-haspopup="true"
                className="flex items-center gap-1 text-sm font-medium text-[#EDE7DA]/70 group-hover:text-[#EDE7DA] group-focus-within:text-[#EDE7DA] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EDE7DA] rounded px-1 whitespace-nowrap"
              >
                what we do
                <svg
                  className="h-3.5 w-3.5 transition-transform duration-150 group-hover:rotate-180 group-focus-within:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute left-0 top-full pt-2 z-50 hidden group-hover:block group-focus-within:block">
                <ul className="min-w-[14rem] rounded-[2px] border border-white/10 bg-navy py-2 shadow-xl">
                  {whatWeDoLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="block px-4 py-2 text-sm font-medium text-[#EDE7DA]/70 hover:bg-white/10 hover:text-[#EDE7DA] transition-colors duration-150 focus-visible:outline-none focus-visible:bg-white/10 focus-visible:text-[#EDE7DA] whitespace-nowrap"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* "who we are" — Community (and more later); reveals on hover or focus. */}
            <div className="relative group">
              <button
                type="button"
                aria-haspopup="true"
                className="flex items-center gap-1 text-sm font-medium text-[#EDE7DA]/70 group-hover:text-[#EDE7DA] group-focus-within:text-[#EDE7DA] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EDE7DA] rounded px-1 whitespace-nowrap"
              >
                who we are
                <svg
                  className="h-3.5 w-3.5 transition-transform duration-150 group-hover:rotate-180 group-focus-within:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute left-0 top-full pt-2 z-50 hidden group-hover:block group-focus-within:block">
                <ul className="min-w-[14rem] rounded-[2px] border border-white/10 bg-navy py-2 shadow-xl">
                  {whoWeAreLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="block px-4 py-2 text-sm font-medium text-[#EDE7DA]/70 hover:bg-white/10 hover:text-[#EDE7DA] transition-colors duration-150 focus-visible:outline-none focus-visible:bg-white/10 focus-visible:text-[#EDE7DA] whitespace-nowrap"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <MyEventsNavLink className="text-sm font-medium text-[#EDE7DA]/70 hover:text-[#EDE7DA] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EDE7DA] rounded px-1 whitespace-nowrap" />
            <AdminNavLink className="text-sm font-medium text-[#EDE7DA]/70 hover:text-[#EDE7DA] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EDE7DA] rounded px-1 whitespace-nowrap" />
          </nav>

          {/* Command palette — mounted here (not inside a `hidden` wrapper)
              so its fixed-position modal can still open on mobile, where
              it's triggered from the menu below instead of this button. */}
          <CommandPalette index={searchIndex} />

          {/* Account + subscribe CTA */}
          <div className="hidden lg:flex items-center gap-3 xl:gap-4 flex-shrink-0">
            <HeaderAuthLink className="text-sm font-medium text-[#EDE7DA]/70 hover:text-[#EDE7DA] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EDE7DA] rounded px-1 whitespace-nowrap" />
            <Link
              href={routes.newsletter()}
              className="rounded-[2px] border border-[#EDE7DA]/30 px-3 py-2 text-sm font-medium text-[#EDE7DA] hover:bg-white/10 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EDE7DA] whitespace-nowrap"
            >
              join the mailing list
            </Link>
            <Link
              href={routes.subscribe()}
              className="rounded-[2px] bg-paper px-4 py-2 text-sm font-medium text-navy hover:bg-[#EDE7DA]/85 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EDE7DA] focus-visible:ring-offset-2 focus-visible:ring-offset-navy whitespace-nowrap"
            >
              subscribe
            </Link>
          </div>

          {/* Mobile nav — MobileNav closes the panel on link tap / route change */}
          <MobileNav>
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
                  <Link
                    href={routes.playbook()}
                    className="rounded-[2px] px-3 pt-2 pb-1 text-xs font-semibold tracking-wider text-[#EDE7DA]/50 hover:text-[#EDE7DA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EDE7DA]"
                  >
                    the playbook
                  </Link>
                  {playbookLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="rounded-[2px] px-3 py-2 pl-5 text-sm font-medium text-[#EDE7DA] hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EDE7DA]"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <span className="rounded-[2px] px-3 pt-2 pb-1 text-xs font-semibold tracking-wider text-[#EDE7DA]/50">
                    what we do
                  </span>
                  {whatWeDoLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="rounded-[2px] px-3 py-2 pl-5 text-sm font-medium text-[#EDE7DA] hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EDE7DA]"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <span className="rounded-[2px] px-3 pt-2 pb-1 text-xs font-semibold tracking-wider text-[#EDE7DA]/50">
                    who we are
                  </span>
                  {whoWeAreLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="rounded-[2px] px-3 py-2 pl-5 text-sm font-medium text-[#EDE7DA] hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EDE7DA]"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <MyEventsNavLink className="rounded-[2px] px-3 py-2 text-sm font-medium text-[#EDE7DA] hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EDE7DA]" />
                  <AdminNavLink className="rounded-[2px] px-3 py-2 text-sm font-medium text-[#EDE7DA] hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EDE7DA]" />
                  <HeaderAuthLink className="rounded-[2px] px-3 py-2 text-sm font-medium text-[#EDE7DA] hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EDE7DA]" />
                  <div className="pt-2 border-t border-white/10 mt-2 space-y-2">
                    <Link
                      href={routes.newsletter()}
                      className="block rounded-[2px] border border-[#EDE7DA]/30 px-3 py-2 text-sm font-medium text-[#EDE7DA] text-center hover:bg-white/10 transition-colors duration-150"
                    >
                      join the mailing list
                    </Link>
                    <Link
                      href={routes.subscribe()}
                      className="block rounded-[2px] bg-paper px-3 py-2 text-sm font-medium text-navy text-center hover:bg-[#EDE7DA]/85 transition-colors duration-150"
                    >
                      subscribe
                    </Link>
                  </div>
                </div>
              </Container>
            </nav>
          </MobileNav>
          </div>
        </div>
      </Container>
    </header>
  );
}
