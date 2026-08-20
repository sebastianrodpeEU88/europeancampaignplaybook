import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/Container';
import { routes } from '@/lib/routes';

export const metadata: Metadata = {
  title: 'the playbook',
  description:
    'The Playbook is the heart of european campaign playbook — this year’s community trends, the full knowledge library, practitioner articles, and the contributors behind it.',
};

const SECTIONS: { label: string; href: string; description: string }[] = [
  {
    label: 'Trends',
    href: routes.trends(),
    description:
      'The shifts our community of EU campaign practitioners is watching this year — every article is mapped to at least one of them.',
  },
  {
    label: 'Knowledge library',
    href: routes.taxonomy(),
    description:
      '16 knowledge pillars covering political campaigning, public affairs, compliance, and civic engagement — structured, evidenced, and compliance-aware.',
  },
  {
    label: 'Articles',
    href: routes.articles(),
    description:
      'Explainers, playbooks, field notes, and legal briefings written by practitioners working across the EU’s political environments.',
  },
  {
    label: 'Contributors',
    href: routes.contributors(),
    description:
      'The practitioners, researchers, and legal experts behind the Playbook — each writing independently, with a published disclosure.',
  },
];

export default function PlaybookPage() {
  return (
    <div className="bg-paper min-h-screen py-12">
      <Container>
        <div className="max-w-4xl mx-auto">
          {/* Hero */}
          <div className="mb-12">
            <h1 className="display text-3xl sm:text-4xl text-ink mb-3">the playbook</h1>
            <p className="text-lg text-ink/60 leading-relaxed max-w-2xl">
              The Playbook is where the knowledge lives — this year’s community trends, the full
              knowledge library across 16 pillars, practitioner articles, and the contributors who
              write them. Start wherever you like.
            </p>
          </div>

          {/* Sections */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SECTIONS.map((section) => (
              <Link
                key={section.href}
                href={section.href}
                className="group flex flex-col rounded-[2px] border border-rule/20 bg-paper p-6 hover:border-rule/40 transition-colors duration-200 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
              >
                <div className="flex items-center justify-between mb-2">
                  <h2 className="display text-xl text-ink">{section.label.toLowerCase()}</h2>
                  <span
                    className="text-ink/40 group-hover:text-ink group-hover:translate-x-0.5 transition-all duration-150"
                    aria-hidden="true"
                  >
                    →
                  </span>
                </div>
                <p className="text-sm text-ink/60 leading-relaxed">{section.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
