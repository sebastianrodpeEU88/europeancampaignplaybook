import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { PortableText } from '@portabletext/react';
import { getAllEvents, getEventBySlug } from '@/lib/content';
import { routes } from '@/lib/routes';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import EventCover from '@/components/brand/EventCover';
import EventActions from '@/components/EventActions';
import { portableTextComponents } from '@/components/portableTextComponents';
import { formatBrusselsRange } from '@/lib/datetime';

export async function generateStaticParams() {
  const events = await getAllEvents();
  return events.map((e) => ({ eventSlug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ eventSlug: string }>;
}): Promise<Metadata> {
  const { eventSlug } = await params;
  const event = await getEventBySlug(eventSlug);
  if (!event) return {};
  return {
    title: event.title,
    description: event.summary,
  };
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ eventSlug: string }>;
}) {
  const { eventSlug } = await params;
  const event = await getEventBySlug(eventSlug);
  if (!event) notFound();

  const hasEnded = new Date(event.endDateTime ?? event.startDateTime) < new Date();

  const breadcrumbs = [
    { label: 'Events', href: routes.events() },
    { label: event.title, href: routes.event(event.slug) },
  ];

  return (
    <div className="bg-paper min-h-screen py-12">
      <Container>
        <div className="max-w-3xl mx-auto">
          <Breadcrumbs items={breadcrumbs} />

          <div className="relative aspect-[16/7] w-full overflow-hidden rounded-[2px] mb-8 bg-navy">
            <EventCover coverImage={event.coverImage} title={event.title} variant="hero" accent={event.coverColour} dimmed={hasEnded} />
          </div>

          {event.tags && event.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {event.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-[2px] bg-ink/5 px-2.5 py-0.5 text-xs font-medium uppercase text-ink/60"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <h1 className="display text-3xl sm:text-4xl text-ink leading-tight mb-4">
            {event.title}
          </h1>

          <div className="flex flex-col gap-1 text-ink/80 mb-6">
            <p className="text-sm">{formatBrusselsRange(event.startDateTime, event.endDateTime)}</p>
            <p className="text-sm text-ink/60">{event.location}</p>
          </div>

          {hasEnded ? (
            <div className="inline-block rounded-[2px] border border-rule/25 bg-paper px-4 py-2 text-sm font-medium text-ink/60 mb-8">
              This event has ended
            </div>
          ) : (
            <EventActions
              event={{
                slug: event.slug,
                title: event.title,
                summary: event.summary,
                location: event.location,
                startDateTime: event.startDateTime,
                endDateTime: event.endDateTime,
                registrationUrl: event.registrationUrl,
                waitingListUrl: event.waitingListUrl,
              }}
              hasEnded={false}
            />
          )}

          <div className="prose-article">
            <PortableText value={event.description} components={portableTextComponents} />
          </div>
        </div>
      </Container>
    </div>
  );
}
