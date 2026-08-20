import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getUpcomingEvents, getPastEvents } from '@/lib/content';
import { getUserRegistrationSlugs } from '@/lib/event-registrations';
import { cancelRegistration } from '@/lib/event-actions';
import { routes } from '@/lib/routes';
import Container from '@/components/Container';
import EventCard from '@/components/EventCard';
import type { Event } from '@/types/content';

export const metadata: Metadata = {
  title: 'my events',
  description: 'The european campaign playbook events you have registered for.',
};

function RegisteredRow({ event, isPast }: { event: Event; isPast: boolean }) {
  return (
    <div>
      <EventCard event={event} isPast={isPast} />
      {!isPast && (
        <form action={cancelRegistration.bind(null, event.slug)} className="mt-1.5 pl-1">
          <button
            type="submit"
            className="text-xs text-ink/50 hover:text-ink hover:underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink rounded"
          >
            Cancel registration
          </button>
        </form>
      )}
    </div>
  );
}

export default async function MyEventsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`${routes.login()}?redirectTo=${encodeURIComponent(routes.myEvents())}`);
  }

  // Upcoming/past split is done in GROQ (dateTime(now())), so no impure "now"
  // during render; we just filter each to the events this user registered for.
  const [slugs, upcomingAll, pastAll] = await Promise.all([
    getUserRegistrationSlugs(user.id),
    getUpcomingEvents(),
    getPastEvents(),
  ]);
  const registeredSlugs = new Set(slugs);

  const upcoming = upcomingAll.filter((e) => registeredSlugs.has(e.slug));
  const past = pastAll.filter((e) => registeredSlugs.has(e.slug));
  const registered = [...upcoming, ...past];

  return (
    <div className="bg-paper min-h-screen py-12">
      <Container>
        <div className="max-w-3xl mx-auto">
          <h1 className="display text-3xl text-ink mb-2">my events</h1>
          <p className="text-ink/60 mb-8">Workshops and sessions you’ve registered for.</p>

          {registered.length === 0 ? (
            <div className="rounded-[2px] border border-rule/20 bg-paper p-12 text-center">
              <p className="text-ink/60 mb-2">You haven’t registered for any events yet.</p>
              <Link
                href={routes.events()}
                className="text-sm text-ink underline underline-offset-2 hover:no-underline"
              >
                Browse events
              </Link>
            </div>
          ) : (
            <div className="space-y-10">
              {upcoming.length > 0 && (
                <section aria-labelledby="upcoming-heading">
                  <h2 id="upcoming-heading" className="display text-xl text-ink mb-4">
                    upcoming
                  </h2>
                  <div className="space-y-4">
                    {upcoming.map((event) => (
                      <RegisteredRow key={event.slug} event={event} isPast={false} />
                    ))}
                  </div>
                </section>
              )}
              {past.length > 0 && (
                <section aria-labelledby="past-heading">
                  <h2 id="past-heading" className="display text-xl text-ink mb-4">
                    past
                  </h2>
                  <div className="space-y-4">
                    {past.map((event) => (
                      <RegisteredRow key={event.slug} event={event} isPast={true} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
