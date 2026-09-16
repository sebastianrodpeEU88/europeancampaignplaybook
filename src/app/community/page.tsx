import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/Container';
import { routes } from '@/lib/routes';
import { MEMBERSHIP_FEATURES, MEMBERSHIP_TIERS, annualDiscount } from '@/lib/membershipTiers';

export const metadata: Metadata = {
  title: 'community',
  description:
    'What european campaign playbook is: practitioner-led workshops on AI, social media and policy communications, a knowledge library for campaigners and public affairs teams, a free digital bootcamp, and a members community in Brussels and online.',
};

const CONTACT_EMAIL = 'sebastian@campaignplaybook.eu';

// A first-time visitor needs to know what this is before anything else.
const WHAT_WE_DO = [
  {
    title: 'workshops',
    href: routes.events(),
    body: 'Hands-on sessions on AI for advocacy, social media and creative campaigning, policy communications, and running policy events. In Brussels and online, two and a half hours each, led by people who do the work.',
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
    body: 'campaignPro members meet at workshops and networking events, get the full library, and from this season a mentorship scheme as well.',
  },
];

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

const linkClass =
  'text-ink underline underline-offset-2 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink rounded';

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

          {/* New here? What this actually is */}
          <section aria-labelledby="what-heading" className="mb-14">
            <h2 id="what-heading" className="display text-2xl text-ink mb-4">
              new here? this is what we do
            </h2>
            <div className="space-y-4 text-ink/75 leading-relaxed mb-6">
              <p>
                european campaign playbook trains and equips the people who run political, advocacy
                and public affairs campaigns in Europe. We are practitioner-led and independent, we
                work in Brussels and online, and we are funded by our members.
              </p>
              <p>
                In practice, that is four things:
              </p>
            </div>
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
          </section>

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

          {/* What we are building next */}
          <section aria-labelledby="next-heading" className="mb-14">
            <h2 id="next-heading" className="display text-2xl text-ink mb-4">
              what we are building next
            </h2>

            <h3 className="font-semibold text-ink mb-2">
              training: more focused, more levels, more diversity
            </h3>
            <p className="text-ink/75 leading-relaxed mb-3">First, we are going deeper on AI.</p>
            <ul className="mb-5 list-disc space-y-2 pl-5 text-ink/75 leading-relaxed">
              <li>
                Level 2 gets a substantial update, in line with the latest models, the “Work” and
                “Cowork” style of chats, and more.
              </li>
              <li>
                A new level 3 on writing an AI usage policy for your organisation.{' '}
                <Link href={routes.event('ai-advocacy-level-3-18-nov-2026')} className={linkClass}>
                  The first session runs on 18 November
                </Link>
                .
              </li>
              <li>
                A new level 4 on GEO, and on building websites, apps and internal tools with Claude
                and Codex, the way{' '}
                <Link href={routes.home()} className={linkClass}>
                  this website
                </Link>{' '}
                was built.
              </li>
            </ul>
            <p className="text-ink/75 leading-relaxed mb-3">Second, we are widening the topics.</p>
            <ul className="mb-5 list-disc space-y-2 pl-5 text-ink/75 leading-relaxed">
              <li>
                Accessible communications with Olivia Lori Iglesias Ucendo, Senior Communications
                Officer at the European Youth Forum, on{' '}
                <Link
                  href={routes.event('accessible-communications-part-1-online-17-nov-2026')}
                  className={linkClass}
                >
                  17 and 18 November
                </Link>
                .
              </li>
              <li>
                Organising EU policy events with Andrea Bittnerová, event strategist and Brussels
                insider, on{' '}
                <Link
                  href={routes.event('organising-eu-policy-events-level-1-online-20-oct-2026')}
                  className={linkClass}
                >
                  20 and 22 October
                </Link>
                .
              </li>
              <li>
                More on social media, policy communications and event management, with external
                experts from inside the EU bubble.
              </li>
            </ul>
            <p className="text-ink/75 leading-relaxed mb-8">
              The up-to-date calendar of training is always on the{' '}
              <Link href={routes.events()} className={linkClass}>
                workshops page
              </Link>
              , and{' '}
              <Link href={routes.aiWorkshopsBrussels()} className={linkClass}>
                this page explains what each AI level covers
              </Link>
              .
            </p>

            <h3 className="font-semibold text-ink mb-2">
              networking: in-person events and mentorship
            </h3>
            <div className="space-y-3 text-ink/75 leading-relaxed">
              <p>
                We are starting a mentorship scheme: senior practitioners helping people earlier in
                their careers, and mid-career people connecting with each other.
              </p>
              <p>
                The point is that a mentor and a mentee work on a thought leadership article together,
                and we give it visibility through our channels.
              </p>
              <p>
                There is more on the list, including collaborative campaigns and discounted tickets to
                industry events. If you have something in mind,{' '}
                <a href={contactHref} className={linkClass}>
                  email me
                </a>{' '}
                and I am happy to consider it.
              </p>
            </div>
          </section>

          {/* What it costs */}
          <section aria-labelledby="price-heading" className="mb-14">
            <h2 id="price-heading" className="display text-2xl text-ink mb-4">
              what it costs
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
            <p className="display text-xl text-[#EDE7DA] mb-2">want to start hearing about us?</p>
            <p className="text-sm text-[#EDE7DA]/70 mb-5">
              join our mailing list (GDPR-friendly, unsubscribe anytime).
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
