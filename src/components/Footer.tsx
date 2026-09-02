import Link from 'next/link';
import { routes } from '@/lib/routes';
import Container from './Container';
import MoveMark from './brand/MoveMark';
import BrandWordmark from './brand/BrandWordmark';
import SocialBar from './SocialBar';
import NewsletterForm from './NewsletterForm';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/10 bg-navy">
      <Container>
        {/* Newsletter signup — straight into Beehiiv, on every page. */}
        <div className="py-10 border-b border-white/10 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 md:items-center">
          <div>
            <p className="display text-lg text-[#EDE7DA] mb-1">get it in your inbox</p>
            <p className="text-sm text-[#EDE7DA]/70 leading-relaxed max-w-md">
              New workshops, fresh articles, and practical campaign craft. No spam, unsubscribe any
              time.
            </p>
          </div>
          <div className="md:max-w-md md:justify-self-end w-full">
            <NewsletterForm variant="footer" />
          </div>
        </div>

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
            <p className="text-xs font-semibold tracking-wider text-[#EDE7DA]/50 mb-3">
              platform
            </p>
            <nav aria-label="Footer navigation">
              <ul className="space-y-2">
                {[
                  { label: 'knowledge library', href: routes.taxonomy() },
                  { label: 'articles', href: routes.articles() },
                  { label: 'contributors', href: routes.contributors() },
                  { label: 'community', href: routes.community() },
                  { label: 'subscribe', href: routes.subscribe() },
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

          {/* compliance note */}
          <div>
            <p className="text-xs font-semibold tracking-wider text-[#EDE7DA]/50 mb-3">
              compliance note
            </p>
            <p className="text-xs text-[#EDE7DA]/70 leading-relaxed" role="note">
              Where EU compliance topics are covered, both EU-level law and national Member State
              rules apply. Campaign teams should seek jurisdiction-specific legal advice.
            </p>
          </div>
        </div>

        {/* Social */}
        <div className="border-t border-white/10 py-5 flex flex-col sm:flex-row sm:items-center gap-3">
          <p className="text-xs font-semibold tracking-wider text-[#EDE7DA]/50">
            follow
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
              © {new Date().getFullYear()} european campaign playbook. All editorial content is
              produced in British English.
            </p>
            <p className="mt-2 text-xs flex flex-wrap items-center gap-x-3 gap-y-1">
              <Link
                href={routes.privacy()}
                className="text-[#EDE7DA]/70 hover:text-[#EDE7DA] underline underline-offset-2 hover:no-underline transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EDE7DA] rounded"
              >
                privacy policy
              </Link>
              <span className="text-[#EDE7DA]/30" aria-hidden="true">·</span>
              <Link
                href={routes.cookies()}
                className="text-[#EDE7DA]/70 hover:text-[#EDE7DA] underline underline-offset-2 hover:no-underline transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EDE7DA] rounded"
              >
                cookie policy
              </Link>
            </p>
          </div>
          <BrandWordmark className="h-5 w-auto text-[#EDE7DA]/40 flex-shrink-0" />
        </div>
      </Container>
    </footer>
  );
}
