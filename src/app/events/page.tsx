import type { Metadata } from 'next';
import { getUpcomingEvents, getPastEvents } from '@/lib/content';
import Container from '@/components/Container';
import EventCard from '@/components/EventCard';
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
    q: 'Who are the workshops for?',
    a: 'Campaigners, public affairs professionals, and communications and social media teams working on EU and international issues.',
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
