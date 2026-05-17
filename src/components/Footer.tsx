import Link from 'next/link';
import { routes } from '@/lib/routes';
import Container from './Container';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-[rgba(0,0,0,0.08)] bg-white">
      <Container>
        <div className="py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <p className="font-semibold text-[#1C1C1E] mb-2">Campaign Intelligence Library</p>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              A premium EU-first knowledge platform for political campaigning, public affairs,
              and civic engagement. Non-partisan, compliance-aware, practitioner-led.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF] mb-3">
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
                      className="text-sm text-[#6B7280] hover:text-[#1C1C1E] transition-colors duration-150 focus-visible:outline-none focus-visible:underline"
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
            <p className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF] mb-3">
              Compliance note
            </p>
            <p className="text-xs text-[#6B7280] leading-relaxed" role="note">
              Where EU compliance topics are covered, both EU-level law and national Member State
              rules apply. Campaign teams should seek jurisdiction-specific legal advice.
            </p>
          </div>
        </div>

        {/* Legal disclaimer */}
        <div className="border-t border-[rgba(0,0,0,0.08)] py-6">
          <p className="text-xs text-[#9CA3AF] leading-relaxed max-w-4xl" role="note">
            This platform provides practitioner education and editorial resources. It does not
            constitute legal advice. Campaign teams should obtain jurisdiction-specific advice
            before publication, targeting, advertising or deployment.
          </p>
          <p className="mt-2 text-xs text-[#9CA3AF]">
            © {new Date().getFullYear()} Campaign Intelligence Library. All editorial content is
            produced in British English.
          </p>
        </div>
      </Container>
    </footer>
  );
}
