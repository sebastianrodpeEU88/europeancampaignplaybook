import type { Metadata } from 'next';
import Link from 'next/link';
import { getUpcomingEvents, getPastEvents } from '@/lib/content';
import { routes } from '@/lib/routes';
import Container from '@/components/Container';
import EventCard from '@/components/EventCard';
import TestimonialWall from '@/components/TestimonialWall';
import JsonLd from '@/components/JsonLd';
import { faqLd } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'AI, social media & policy communications workshops in Brussels',
  description:
    'Practitioner-led workshops on AI, social media, and policy communications for campaigners and public affairs teams. In Brussels and online. Free live info sessions.',
  openGraph: {
    title: 'AI, social media & policy communications workshops in Brussels',
    description:
      'Practitioner-led workshops on AI, social media, and policy communications for campaigners and public affairs teams. In Brussels and online.',
    images: ['/workshops-poster.png'],
  },
};

const FAQS = [
  {
    q: 'Where are the workshops held?',
    a: 'In Brussels, Belgium, and online via Zoom. Each session lists its own format and location.',
  },
  {
    q: 'What do the workshops cover?',
    a: 'Practical skills for campaigners and public affairs teams: AI for advocacy, social media and creative campaigning, and policy communications.',
  },
  {
    q: 'Who runs the workshops?',
    a: 'Sebastián Rodríguez, a European campaign strategist and the founder of european campaign playbook, is the trainer and curator. He often invites other leading experts to deliver the masterclasses.',
  },
  {
    q: 'Who are the workshops for?',
    a: 'Campaigners, public affairs professionals, and communications and social media teams working on EU and international issues.',
  },
  {
    q: 'Why is AI important for campaigners and public affairs teams?',
    a: 'AI is changing how campaign and public affairs teams research, create content, and reach audiences. Used well, it lets small teams move faster and compete with larger ones, from drafting and testing messages to mapping stakeholders. Our workshops focus on practical, responsible AI for advocacy.',
  },
  {
    q: 'Why is social media important for campaigns?',
    a: 'Social media is where public debate happens and where narratives are won or lost. For campaigners it is the fastest, lowest-cost way to reach, persuade, and mobilise audiences. Our workshops cover creative content, platform strategy, and turning attention into action.',
  },
  {
    q: 'Why does policy communications matter?',
    a: 'Policy communications turns complex positions into clear, persuasive narratives that move decision-makers. In Brussels and the member states, it is how organisations shape debates and influence outcomes. Our workshops cover message framing, stakeholder mapping, and winning the political narrative.',
  },
  {
    q: 'How much do the workshops cost?',
    a: 'The live info sessions are free to join. The workshops are included with european campaign playbook membership.',
  },
];

export default async function EventsPage() {
  const [upcoming, past] = await Promise.all([getUpcomingEvents(), getPastEvents()]);

  return (
    <div className="bg-paper min-h-screen py-12">
      <JsonLd data={faqLd(FAQS)} />
      <Container>
        <div className="mb-10">
          <h1 className="display text-3xl text-ink mb-2">workshops</h1>
          <p className="text-ink/60 max-w-2xl leading-relaxed">
            Practitioner-led workshops on AI, social media, and policy communications for campaigners
            and public affairs teams. In Brussels and online, hands-on and led by people doing the
            work.
          </p>
        </div>

        {/* Social proof before the list — testimonials + link to the full insights */}
        <section aria-labelledby="proof-heading" className="mb-12">
          <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#dd3c13] mb-1">
                before you register
              </p>
              <h2 id="proof-heading" className="display text-2xl text-ink">
                what participants say afterwards
              </h2>
            </div>
            <Link
              href={`${routes.aiInsights()}#testimonials`}
              className="text-sm font-semibold text-[#dd3c13] hover:underline whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dd3c13] rounded"
            >
              all testimonials →
            </Link>
          </div>
          <TestimonialWall limit={3} />
          <p className="mt-5 text-sm text-ink/70">
            Curious where teams start?{' '}
            <Link
              href={routes.aiInsights()}
              className="font-medium text-ink underline underline-offset-2 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink rounded"
            >
              See the anonymous pre-workshop insights →
            </Link>
          </p>
        </section>

        <section aria-labelledby="upcoming-heading" className="mb-12">
          <h2 id="upcoming-heading" className="display text-xl text-ink mb-4">
            upcoming
          </h2>
          {upcoming.length === 0 ? (
            <div className="rounded-[2px] border border-rule/20 bg-paper p-8 text-center">
              <p className="text-ink/60">No upcoming workshops scheduled right now. Check back soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {upcoming.map((event) => (
                <EventCard key={event.id} event={event} isPast={false} />
              ))}
            </div>
          )}
        </section>

        <section aria-labelledby="past-heading" className="mb-14">
          <h2 id="past-heading" className="display text-xl text-ink mb-4">
            past
          </h2>
          {past.length === 0 ? (
            <p className="text-ink/60">No past workshops yet.</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {past.map((event) => (
                <EventCard key={event.id} event={event} isPast={true} />
              ))}
            </div>
          )}
        </section>

        <section aria-labelledby="faq-heading" className="max-w-2xl">
          <h2 id="faq-heading" className="display text-xl text-ink mb-4">
            questions
          </h2>
          <div className="divide-y divide-rule/15 border-y border-rule/15">
            {FAQS.map((f) => (
              <details key={f.q} className="group py-3">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium text-ink [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <svg
                    className="h-4 w-4 flex-shrink-0 text-ink/50 transition-transform group-open:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-ink/65">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </Container>
    </div>
  );
}
