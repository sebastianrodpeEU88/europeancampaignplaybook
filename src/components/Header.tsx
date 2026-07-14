import Link from 'next/link';
import { routes } from '@/lib/routes';
import Container from './Container';

const navLinks = [
  { label: 'Knowledge library', href: routes.taxonomy() },
  { label: 'Articles', href: routes.articles() },
  { label: 'EU Compliance', href: routes.euCompliance() },
  { label: 'Events', href: routes.events() },
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
            className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5B35] rounded"
          >
            <span className="text-lg font-semibold tracking-tight text-[#2B0A2E]">
              Campaign Intelligence
            </span>
            <span className="hidden sm:inline text-lg font-light text-[#7A6380]">
              Library
            </span>
          </Link>

          {/* Desktop nav */}
          <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-[#7A6380] hover:text-[#2B0A2E] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5B35] rounded px-1"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Subscribe CTA */}
          <div className="hidden lg:flex items-center">
            <Link
              href={routes.subscribe()}
              className="rounded-lg bg-[#2B0A2E] px-4 py-2 text-sm font-medium text-white hover:bg-[#4A1F4D] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5B35] focus-visible:ring-offset-2"
            >
              Subscribe
            </Link>
          </div>

          {/* Mobile nav */}
          <details className="lg:hidden group">
            <summary className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg hover:bg-[#FDF6EC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5B35] list-none [&::-webkit-details-marker]:hidden">
              <svg
                aria-label="Open navigation menu"
                className="h-5 w-5 text-[#2B0A2E] group-open:hidden"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                aria-label="Close navigation menu"
                className="h-5 w-5 text-[#2B0A2E] hidden group-open:block"
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
                      className="rounded-lg px-3 py-2 text-sm font-medium text-[#2B0A2E] hover:bg-[#FDF6EC] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5B35]"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="pt-2 border-t border-[rgba(0,0,0,0.08)] mt-2">
                    <Link
                      href={routes.subscribe()}
                      className="block rounded-lg bg-[#2B0A2E] px-3 py-2 text-sm font-medium text-white text-center hover:bg-[#4A1F4D] transition-colors duration-150"
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
