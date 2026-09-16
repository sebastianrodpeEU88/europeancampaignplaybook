import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/Container';
import { routes } from '@/lib/routes';
import { MEMBERSHIP_FEATURES, MEMBERSHIP_TIERS, annualDiscount } from '@/lib/membershipTiers';

export const metadata: Metadata = {
  title: 'community',
  description:
    'Why european campaign playbook exists, what we do, how it works and what it costs: practitioner-led workshops on AI, social media and policy communications, a knowledge library, a free digital bootcamp, and a members community in Brussels and online.',
};

const CONTACT_EMAIL = 'sebastian@campaignplaybook.eu';

const linkClass =
  'text-ink underline underline-offset-2 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink rounded';

// Each thing we do, once. The cards carry the whole offer, so nothing below
// needs to repeat it.
const WHAT_WE_DO = [
  {
    title: 'workshops',
    href: routes.events(),
    body: 'Two and a half hours, hands-on, in Brussels or online. AI for advocacy, social media and creative campaigning, policy communications, and running policy events. You leave with something you built.',
  },
  {
    title: 'the knowledge library',
    href: routes.taxonomy(),
    body: 'Practitioner articles across 16 pillars, from strategy and narrative to compliance and measurement, plus the trends we follow through the year.',
  },
  {
    title: 'the digital bootcamp',
    href: routes.digitalBootcamp(),
    body: 'A free course on AI for small public affairs teams. Create an account and work through it a day at a time, at your own pace.',
  },
  {
    title: 'the community',
    href: routes.subscribe(),
    body: 'campaignPro members meet at workshops and networking events in Brussels, get the full library, and from this season a mentorship scheme as well.',
  },
];

const HOW_IT_WORKS = [
  {
    step: 'Start free',
    body: (
      <>
        Create an account, work through the{' '}
        <Link href={routes.digitalBootcamp()} className={linkClass}>
          digital bootcamp
        </Link>{' '}
        at your own pace, and join a free live info session to see how we teach.
      </>
    ),
  },
  {
    step: 'Come to a workshop',
    body: (
      <>
        Pick a session from the{' '}
        <Link href={routes.events()} className={linkClass}>
          calendar
        </Link>
        . If it is AI you are after,{' '}
        <Link href={routes.aiWorkshopsBrussels()} className={linkClass}>
          this page explains what each level covers
        </Link>
        .
      </>
    ),
  },
  {
    step: 'Become a campaignPro',
    body: (
      <>
        One membership covers every workshop for a full year, the whole library, members-only
        networking and the mentorship scheme.{' '}
        <Link href={routes.subscribe()} className={linkClass}>
          See the plans
        </Link>
        .
      </>
    ),
  },
];

export default function CommunityPage() {
  const contactHref = `mailto:${CONTACT_EMAIL}`;

  return (
    <div className="bg-paper min-h-screen py-12">
      <Container>
        <div className="max-w-3xl mx-auto">
          {/* Hero */}
          <h1 className="display text-3xl sm:text-4xl text-ink leading-tight mb-6">
            🇪🇺 changing the conversation on europe starts here.
          </h1>

          {/* Pricing banner — high-visibility CTA to the membership plans */}
          <Link
            href={routes.subscribe()}
            className="group block rounded-[2px] bg-gradient-to-br from-[#dd3c13] to-[#0A1D2B] p-6 sm:p-7 mb-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dd3c13] focus-visible:ring-offset-2"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#EDE7DA]/60 mb-1">
                  membership
                </p>
                <p className="display text-xl sm:text-2xl text-[#EDE7DA]">
                  become a campaignPro — plans starting at{' '}
                  <span className="whitespace-nowrap">€9 a month</span>
                </p>
                <p className="text-sm text-[#EDE7DA]/80 mt-1">
                  every workshop for a full year, the complete knowledge library, and the community.
                </p>
              </div>
              <span className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-[2px] bg-paper px-5 py-2.5 text-sm font-semibold text-navy group-hover:bg-[#EDE7DA]/85 transition-colors duration-150">
                see membership options
                <span aria-hidden="true">→</span>
              </span>
            </div>
          </Link>

          {/* Embedded video */}
          <div className="relative aspect-video w-full overflow-hidden rounded-[2px] border border-rule/20 bg-navy mb-12">
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

          {/* 1. Why we exist */}
          <section aria-labelledby="why-heading" className="mb-14">
            <h2 id="why-heading" className="display text-2xl text-ink mb-4">
              why we exist
            </h2>
            <div className="space-y-4 text-ink/75 leading-relaxed">
              <p>
                Populists and extremists run the same playbook everywhere. Name a problem, name
                someone to blame, promise an easy fix. It is simple, it travels fast, and it wins
                arguments.
              </p>
              <p>
                The people making the case for an open, democratic Europe are usually small teams with
                more complex arguments, tighter budgets and less time. Institutions, NGOs, trade
                associations, parties, agencies. Often two or three people covering everything.
              </p>
              <p className="font-semibold text-ink">
                Without well-equipped pro-European communicators, that argument is lost by default.
              </p>
              <p>
                european campaign playbook exists to close that gap: to give those teams the tactics,
                the tools and the network that the other side already has. We are practitioner-led and
                independent, and we are funded by our members rather than by the EU.
              </p>
            </div>
          </section>

          {/* 2. What we do */}
          <section aria-labelledby="what-heading" className="mb-14">
            <h2 id="what-heading" className="display text-2xl text-ink mb-4">
              what we do
            </h2>
            <p className="text-ink/75 leading-relaxed mb-6">
              Four things, all serving the same job: helping a small team win a bigger argument.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {WHAT_WE_DO.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group block rounded-[2px] border border-rule/20 p-5 hover:border-[#dd3c13] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dd3c13]"
                >
                  <p className="display text-lg text-ink mb-1 group-hover:underline">{item.title}</p>
                  <p className="text-sm text-ink/70 leading-relaxed">{item.body}</p>
                </Link>
              ))}
            </div>
            <p className="mt-6 text-ink/75 leading-relaxed">
              It is built for public affairs professionals, campaigners, communications and social
              media teams, consultants, NGOs, trade associations and political parties working on EU
              and international issues. People who have just started, and people who run the team.
            </p>

            <h3 className="font-semibold text-ink mt-8 mb-3">what is coming next</h3>
            <ul className="list-disc space-y-2 pl-5 text-ink/75 leading-relaxed">
              <li>
                <strong className="text-ink">Deeper AI training.</strong> Level 2 rebuilt around the
                latest models and the “Work” and “Cowork” style of chats, a new level 3 on{' '}
                <Link href={routes.event('ai-advocacy-level-3-18-nov-2026')} className={linkClass}>
                  writing your organisation’s AI usage policy
                </Link>
                , and a level 4 on GEO and on building websites, apps and internal tools with Claude
                and Codex, the way{' '}
                <Link href={routes.home()} className={linkClass}>
                  this website
                </Link>{' '}
                was built.
              </li>
              <li>
                <strong className="text-ink">More topics, more voices.</strong>{' '}
                <Link
                  href={routes.event('accessible-communications-part-1-online-17-nov-2026')}
                  className={linkClass}
                >
                  Accessible communications
                </Link>{' '}
                with Olivia Lori Iglesias Ucendo of the European Youth Forum,{' '}
                <Link
                  href={routes.event('organising-eu-policy-events-level-1-online-20-oct-2026')}
                  className={linkClass}
                >
                  organising EU policy events
                </Link>{' '}
                with Andrea Bittnerová, and more on social media, policy communications and event
                management with experts from inside the EU bubble.
              </li>
              <li>
                <strong className="text-ink">Mentorship.</strong> Senior practitioners paired with
                people earlier in their careers, mid-career people connecting with each other, and
                each pair writing a thought leadership article that we put in front of our audience.
              </li>
              <li>
                <strong className="text-ink">More on the list.</strong> Collaborative campaigns,
                discounted tickets to industry events, and whatever you suggest.{' '}
                <a href={contactHref} className={linkClass}>
                  Email me
                </a>{' '}
                and I am happy to consider it.
              </li>
            </ul>
          </section>

          {/* 3. How it works */}
          <section aria-labelledby="how-heading" className="mb-14">
            <h2 id="how-heading" className="display text-2xl text-ink mb-4">
              how it works
            </h2>
            <ol className="space-y-3">
              {HOW_IT_WORKS.map((item, i) => (
                <li key={item.step} className="flex gap-4 rounded-[2px] border border-rule/20 p-5">
                  <span
                    className="display flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[2px] bg-navy text-[#EDE7DA]"
                    aria-hidden="true"
                  >
                    {i + 1}
                  </span>
                  <p className="text-ink/75 leading-relaxed">
                    <strong className="text-ink">{item.step}.</strong> {item.body}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          {/* 4. How much */}
          <section aria-labelledby="price-heading" className="mb-14">
            <h2 id="price-heading" className="display text-2xl text-ink mb-4">
              how much
            </h2>
            <p className="text-ink/75 leading-relaxed mb-5">
              One membership covers every workshop we run for a full year, the whole knowledge library
              and the community. Prices exclude VAT.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              {MEMBERSHIP_TIERS.map((tier) => (
                <div
                  key={tier.name}
                  className={`rounded-[2px] border p-5 ${
                    tier.highlight ? 'border-navy/30 bg-[#F7F4EE]' : 'border-rule/20'
                  }`}
                >
                  {tier.badge && (
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#dd3c13] mb-1">
                      {tier.badge}
                    </p>
                  )}
                  <p className="display text-lg text-ink mb-2">{tier.name.toLowerCase()}</p>
                  <p className="text-2xl font-semibold text-ink leading-none">
                    €{tier.annual}
                    <span className="text-sm font-normal text-ink/60"> / year</span>
                  </p>
                  <p className="mt-2 text-sm text-ink/70">
                    or €{tier.monthly} a month. Paying for the year saves{' '}
                    {annualDiscount(tier.monthly, tier.annual)}%.
                  </p>
                  {tier.eligibility && (
                    <p className="mt-2 text-xs text-ink/55 leading-relaxed">{tier.eligibility}</p>
                  )}
                </div>
              ))}
            </div>
            <p className="text-sm font-semibold text-ink mb-2">Every membership includes:</p>
            <ul className="mb-5 list-disc space-y-1 pl-5 text-ink/75 leading-relaxed">
              {MEMBERSHIP_FEATURES.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            <p className="text-ink/75 leading-relaxed mb-5">
              Free without a membership: the{' '}
              <Link href={routes.digitalBootcamp()} className={linkClass}>
                digital bootcamp
              </Link>{' '}
              and our live info sessions, both of which only need an account, and the{' '}
              <Link href={routes.newsletter()} className={linkClass}>
                newsletter
              </Link>
              .
            </p>
            <Link
              href={routes.subscribe()}
              className="inline-flex rounded-[2px] bg-[#dd3c13] px-5 py-2.5 text-sm font-semibold text-[#EDE7DA] hover:bg-[#dd3c13]/85 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dd3c13] focus-visible:ring-offset-2"
            >
              see membership options →
            </Link>
          </section>

          {/* Mailing list CTA */}
          <section className="mb-14 rounded-[2px] border border-rule/20 bg-navy p-8 text-center">
            <p className="display text-xl text-[#EDE7DA] mb-2">not ready to join yet?</p>
            <p className="text-sm text-[#EDE7DA]/70 mb-5">
              start with the mailing list (GDPR-friendly, unsubscribe anytime).
            </p>
            <Link
              href={routes.newsletter()}
              className="inline-block rounded-[2px] bg-paper px-6 py-3 text-sm font-semibold text-navy hover:bg-[#EDE7DA]/85 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EDE7DA] focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
            >
              join the mailing list
            </Link>
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
                    <a href={contactHref} className={linkClass}>
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
                    <Link href={routes.privacy()} className={linkClass}>
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
