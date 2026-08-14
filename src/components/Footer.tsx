import Link from 'next/link';
import { routes } from '@/lib/routes';
import Container from './Container';
import MoveMark from './brand/MoveMark';
import BrandWordmark from './brand/BrandWordmark';
import SocialBar from './SocialBar';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/10 bg-navy">
      <Container>
        <div className="py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MoveMark variant="arrow" className="h-4 w-4 text-[#EDE7DA] flex-shrink-0" />
              <p className="display text-lg text-[#EDE7DA]">european campaign playbook</p>
            </div>
            <p className="text-sm text-[#EDE7DA]/70 leading-relaxed">
              A knowledge system for political campaigning, public affairs, and civic
              engagement. Non-partisan, compliance-aware, practitioner-led.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#EDE7DA]/50 mb-3">
              Platform
            </p>
            <nav aria-label="Footer navigation">
              <ul className="space-y-2">
                {[
                  { label: 'Knowledge library', href: routes.taxonomy() },
                  { label: 'Articles', href: routes.articles() },
                  { label: 'EU Compliance', href: routes.euCompliance() },
                  { label: 'Contributors', href: routes.contributors() },
                  { label: 'Community', href: routes.community() },
                  { label: 'Subscribe', href: routes.subscribe() },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#EDE7DA]/70 hover:text-[#EDE7DA] transition-colors duration-150 focus-visible:outline-none focus-visible:underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Compliance note */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#EDE7DA]/50 mb-3">
              Compliance note
            </p>
            <p className="text-xs text-[#EDE7DA]/70 leading-relaxed" role="note">
              Where EU compliance topics are covered, both EU-level law and national Member State
              rules apply. Campaign teams should seek jurisdiction-specific legal advice.
            </p>
          </div>
        </div>

        {/* Social */}
        <div className="border-t border-white/10 py-5 flex flex-col sm:flex-row sm:items-center gap-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#EDE7DA]/50">
            Follow
          </p>
          <SocialBar className="-ml-2 sm:ml-0" />
        </div>

        {/* Legal disclaimer */}
        <div className="border-t border-white/10 py-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-xs text-[#EDE7DA]/50 leading-relaxed max-w-4xl" role="note">
              This platform provides practitioner education and editorial resources. It does not
              constitute legal advice. Campaign teams should obtain jurisdiction-specific advice
              before publication, targeting, advertising or deployment.
            </p>
            <p className="mt-2 text-xs text-[#EDE7DA]/50">
              © {new Date().getFullYear()} European Campaign Playbook. All editorial content is
              produced in British English.
            </p>
            <p className="mt-2 text-xs">
              <Link
                href={routes.privacy()}
                className="text-[#EDE7DA]/70 hover:text-[#EDE7DA] underline underline-offset-2 hover:no-underline transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EDE7DA] rounded"
              >
                Privacy Policy
              </Link>
            </p>
          </div>
          <BrandWordmark className="h-5 w-auto text-[#EDE7DA]/40 flex-shrink-0" />
        </div>
      </Container>
    </footer>
  );
}
