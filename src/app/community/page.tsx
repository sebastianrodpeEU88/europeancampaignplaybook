import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/Container';
import { routes } from '@/lib/routes';

export const metadata: Metadata = {
  title: 'community',
  description:
    'Changing the conversation on Europe starts here — a community for policy comms and campaign professionals who want to shift the narrative with powerful stories, strategy, and cutting-edge influence tactics.',
};

const MAILING_LIST_URL = 'https://52dwpvqaoz2.typeform.com/to/sRIe327d';
const CONTACT_EMAIL = 'sebastian@campaignplaybook.eu';

const CAMPAIGNPRO = [
  {
    title: 'strategic training hub',
    description: 'learn the smartest tactics to shape public debate and grow your skills.',
  },
  {
    title: 'live workshops with experts',
    description:
      'from political persuasion to digital tools and media impact, guided by practitioners who’ve been there.',
  },
  {
    title: 'personalised learning paths',
    description:
      'your growth is unique. we combine tailored insights with mentoring so you can build the skills that matter most to you.',
  },
  {
    title: 'networking that works',
    description:
      'connect with peers and allies in brussels and beyond. the right people, the right conversations, the right opportunities.',
  },
];

export default function CommunityPage() {
  return (
    <div className="bg-paper min-h-screen py-12">
      <Container>
        <div className="max-w-3xl mx-auto">
          {/* Hero */}
          <h1 className="display text-3xl sm:text-4xl text-ink leading-tight mb-6">
            🇪🇺 changing the conversation on europe starts here.
          </h1>

          {/* Embedded video */}
          <div className="relative aspect-video w-full overflow-hidden rounded-[2px] border border-rule/20 bg-navy mb-10">
            <iframe
              className="absolute inset-0 h-full w-full"
              src="https://www.youtube-nocookie.com/embed/T0qepmBp97I"
              title="european campaign playbook — welcome to the community"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              loading="lazy"
            />
          </div>

          {/* Mission */}
          <section className="space-y-4 text-ink/75 leading-relaxed mb-14">
            <p>
              right now, populists and extremists are following the same playbook: they identify a
              problem, tell you who to blame, and promise an easy fix.
            </p>
            <p>
              but when they gain power, they bring chaos, incompetence, and take away the very
              freedoms they claimed to protect.
            </p>
            <p>
              without savvy pro-european communicators, we will lose our freedoms, our prosperity and
              our security.
            </p>
            <p className="font-semibold text-ink">it’s that simple.</p>
            <p>and that’s what our community is all about.</p>
            <p>
              it’s a community built for policy comms and campaign professionals who want to learn how
              to shift the narrative with powerful stories, strategy, and cutting-edge influence
              tactics and tools.
            </p>
          </section>

          {/* campaignPro experience */}
          <section aria-labelledby="campaignpro-heading" className="mb-14">
            <h2 id="campaignpro-heading" className="display text-2xl text-ink mb-4">
              the campaignPro experience
            </h2>
            <div className="space-y-4 text-ink/75 leading-relaxed mb-6">
              <p>
                every communicator has their own story, their own strengths, and their own ambitions.
                that’s why we built something flexible, personal, and inspiring.
              </p>
              <p>
                we call it the <strong className="text-ink">campaignPro experience</strong>.
              </p>
              <p>by becoming a campaignPro, you’ll find:</p>
            </div>

            <ul className="space-y-3">
              {CAMPAIGNPRO.map((item) => (
                <li
                  key={item.title}
                  className="flex gap-3 rounded-[2px] border border-rule/20 bg-paper p-4"
                >
                  <span className="text-lg leading-none" aria-hidden="true">✅</span>
                  <p className="text-ink/75 leading-relaxed">
                    <strong className="text-ink">{item.title}:</strong> {item.description}
                  </p>
                </li>
              ))}
            </ul>

            <p className="mt-6 text-ink/75 leading-relaxed">
              🇪🇺 together, we’re building a community of pro-european communicators ready to shape
              europe’s future with clarity, strategy, and purpose.
            </p>
          </section>

          {/* Mailing list CTA */}
          <section className="mb-14 rounded-[2px] border border-rule/20 bg-navy p-8 text-center">
            <p className="display text-xl text-[#EDE7DA] mb-2">want to start hearing about us?</p>
            <p className="text-sm text-[#EDE7DA]/70 mb-5">
              join our mailing list (GDPR-friendly, unsubscribe anytime).
            </p>
            <a
              href={MAILING_LIST_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-[2px] bg-paper px-6 py-3 text-sm font-semibold text-navy hover:bg-[#EDE7DA]/85 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EDE7DA] focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
            >
              join the mailing list
            </a>
          </section>

          {/* FAQs */}
          <section aria-labelledby="faqs-heading">
            <h2 id="faqs-heading" className="display text-2xl text-ink mb-6">
              the faqs
            </h2>

            <div className="space-y-6">
              <div className="rounded-[2px] border border-rule/20 bg-paper p-6">
                <h3 className="font-semibold text-ink mb-2">who is behind this community?</h3>
                <div className="space-y-3 text-ink/75 leading-relaxed">
                  <p>
                    hi! that’d be me, Sebastian Rodriguez, a political consultant and entrepreneur who
                    works for europe’s largest pro-european organisations. feel free to drop me a note
                    at{' '}
                    <a
                      href={`mailto:${CONTACT_EMAIL}`}
                      className="text-ink underline underline-offset-2 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink rounded"
                    >
                      {CONTACT_EMAIL}
                    </a>
                    .
                  </p>
                  <p>
                    and legally speaking, the european campaign playbook is part of Sebastián
                    Rodríguez Pérez, self-employed established in Spain with VAT number: ES30990798T.
                  </p>
                  <p>
                    you can find our privacy policy{' '}
                    <Link
                      href={routes.privacy()}
                      className="text-ink underline underline-offset-2 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink rounded"
                    >
                      here
                    </Link>
                    .
                  </p>
                </div>
              </div>

              <div className="rounded-[2px] border border-rule/20 bg-paper p-6">
                <h3 className="font-semibold text-ink mb-2">are you funded by the european union?</h3>
                <div className="space-y-3 text-ink/75 leading-relaxed">
                  <p>nope. not a cent.</p>
                  <p>
                    the european campaign playbook is funded by its members following a paid
                    membership model.
                  </p>
                  <p>
                    we also work with sponsors who share our values and we will always clearly
                    disclose whether an event or a specific content is sponsored, and by whom.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </Container>
    </div>
  );
}
