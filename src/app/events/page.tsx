import type { Metadata } from 'next';
import { getUpcomingEvents, getPastEvents } from '@/lib/content';
import Container from '@/components/Container';
import EventCard from '@/components/EventCard';

export const metadata: Metadata = {
  title: 'events',
  description: 'Workshops, webinars, and community sessions from European Campaign Playbook — AI for advocacy, campaign strategy, and EU compliance.',
};

export default async function EventsPage() {
  const [upcoming, past] = await Promise.all([getUpcomingEvents(), getPastEvents()]);

  return (
    <div className="bg-paper min-h-screen py-12">
      <Container>
        <div className="mb-10">
          <h1 className="display text-3xl text-ink mb-2">events</h1>
          <p className="text-ink/60 max-w-2xl leading-relaxed">
            Workshops, webinars, and community sessions for EU campaign practitioners — hands-on,
            practical, and led by people doing the work.
          </p>
        </div>

        <section aria-labelledby="upcoming-heading" className="mb-12">
          <h2 id="upcoming-heading" className="display text-xl text-ink mb-4">
            upcoming
          </h2>
          {upcoming.length === 0 ? (
            <div className="rounded-[2px] border border-rule/20 bg-paper p-8 text-center">
              <p className="text-ink/60">No upcoming events scheduled right now — check back soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {upcoming.map((event) => (
                <EventCard key={event.id} event={event} isPast={false} />
              ))}
            </div>
          )}
        </section>

        <section aria-labelledby="past-heading">
          <h2 id="past-heading" className="display text-xl text-ink mb-4">
            past
          </h2>
          {past.length === 0 ? (
            <p className="text-ink/60">No past events yet.</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {past.map((event) => (
                <EventCard key={event.id} event={event} isPast={true} />
              ))}
            </div>
          )}
        </section>
      </Container>
    </div>
  );
}
