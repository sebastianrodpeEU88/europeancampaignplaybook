import Link from 'next/link';
import { routes } from '@/lib/routes';
import Container from './Container';

const navLinks = [
  { label: 'Knowledge library', href: routes.taxonomy() },
  { label: 'Articles', href: routes.articles() },
  { label: 'EU Compliance', href: routes.euCompliance() },
  { label: 'Contributors', href: routes.contributors() },
  { label: 'Community', href: routes.community() },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[rgba(0,0,0,0.08)] shadow-sm">
      <Container>
        <div className="flex h-16 items-center justify-between gap-8">
          {/* Logo */}
          <Link
            href={routes.home()}
            className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#185FA5] rounded"
          >
            <span className="text-lg font-semibold tracking-tight text-[#1C1C1E]">
              Campaign Intelligence
            </span>
            <span className="hidden sm:inline text-lg font-light text-[#6B7280]">
              Library
            </span>
          </Link>

          {/* Desktop nav */}
          <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-[#6B7280] hover:text-[#1C1C1E] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#185FA5] rounded px-1"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Subscribe CTA */}
          <div className="hidden lg:flex items-center">
            <Link
              href={routes.subscribe()}
              className="rounded-lg bg-[#1C1C1E] px-4 py-2 text-sm font-medium text-white hover:bg-[#374151] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#185FA5] focus-visible:ring-offset-2"
            >
              Subscribe
            </Link>
          </div>

          {/* Mobile nav */}
          <details className="lg:hidden group">
            <summary className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg hover:bg-[#F8F7F3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#185FA5] list-none [&::-webkit-details-marker]:hidden">
              <svg
                aria-label="Open navigation menu"
                className="h-5 w-5 text-[#1C1C1E] group-open:hidden"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                aria-label="Close navigation menu"
                className="h-5 w-5 text-[#1C1C1E] hidden group-open:block"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </summary>
            <nav
              aria-label="Mobile navigation"
              className="absolute left-0 right-0 top-16 bg-white border-b border-[rgba(0,0,0,0.08)] shadow-lg z-50 py-4"
            >
              <Container>
                <div className="flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="rounded-lg px-3 py-2 text-sm font-medium text-[#1C1C1E] hover:bg-[#F8F7F3] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#185FA5]"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="pt-2 border-t border-[rgba(0,0,0,0.08)] mt-2">
                    <Link
                      href={routes.subscribe()}
                      className="block rounded-lg bg-[#1C1C1E] px-3 py-2 text-sm font-medium text-white text-center hover:bg-[#374151] transition-colors duration-150"
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
