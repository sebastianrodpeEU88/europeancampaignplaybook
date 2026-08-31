import { notFound } from 'next/navigation';
import Link from 'next/link';
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
import JsonLd from '@/components/JsonLd';
import { eventLd } from '@/lib/seo';

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
    openGraph: {
      title: event.title,
      description: event.summary,
      type: 'article',
      images: ['/workshops-poster.png'],
    },
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
      <JsonLd data={eventLd(event)} />
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
                membersOnly: event.membersOnly,
              }}
              hasEnded={false}
            />
          )}

          {/* Separate links to the anonymous insights and the named testimonials,
              so prospective registrants can weigh both before signing up. Shown on
              every event, today and going forward. */}
          <div className="mt-8 rounded-[2px] border border-rule/20 bg-paper p-4 flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-x-6 sm:gap-y-2 text-sm">
            <span className="text-ink/55 font-medium">New to our workshops?</span>
            <Link
              href={routes.aiInsights()}
              className="font-semibold text-[#dd3c13] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dd3c13] rounded"
            >
              where teams start: the insights →
            </Link>
            <Link
              href={`${routes.aiInsights()}#testimonials`}
              className="font-semibold text-[#dd3c13] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dd3c13] rounded"
            >
              what participants say: testimonials →
            </Link>
          </div>

          <div className="prose-article">
            <PortableText value={event.description} components={portableTextComponents} />
          </div>
        </div>
      </Container>
    </div>
  );
}
