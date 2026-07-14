import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';
import { PortableText } from '@portabletext/react';
import { getAllEvents, getEventBySlug } from '@/lib/content';
import { routes } from '@/lib/routes';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import { portableTextComponents } from '@/components/portableTextComponents';
import { urlForImage } from '@/sanity/image';

function formatDateRange(startIso: string, endIso?: string): string {
  const start = new Date(startIso);
  const datePart = start.toLocaleDateString('en-GB', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const startTime = start.toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit' });
  if (!endIso) return `${datePart} · ${startTime}`;
  const end = new Date(endIso);
  const endTime = end.toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit' });
  return `${datePart} · ${startTime} – ${endTime}`;
}

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
    <div className="bg-[#FDF6EC] min-h-screen py-12">
      <Container>
        <div className="max-w-3xl mx-auto">
          <Breadcrumbs items={breadcrumbs} />

          <div className="relative aspect-[16/7] w-full overflow-hidden rounded-2xl mb-8 bg-[#2B0A2E]">
            <Image
              src={urlForImage(event.coverImage).width(1200).height(525).fit('crop').url()}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className={`object-cover ${hasEnded ? 'grayscale opacity-70' : ''}`}
              priority
            />
          </div>

          {event.tags && event.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {event.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-[rgba(43,10,46,0.05)] px-2.5 py-0.5 text-xs font-mono font-medium uppercase text-[#7A6380]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <h1 className="text-3xl sm:text-4xl font-bold text-[#2B0A2E] leading-tight mb-4">
            {event.title}
          </h1>

          <div className="flex flex-col gap-1 text-[#4A1F4D] mb-6">
            <p className="font-mono text-sm">{formatDateRange(event.startDateTime, event.endDateTime)}</p>
            <p className="font-mono text-sm text-[#7A6380]">{event.location}</p>
          </div>

          {hasEnded ? (
            <div className="inline-block rounded-lg border border-[rgba(43,10,46,0.15)] bg-white px-4 py-2 text-sm font-medium text-[#7A6380] mb-8">
              This event has ended
            </div>
          ) : (
            event.registrationUrl && (
              <a
                href={event.registrationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-lg bg-[#2B0A2E] px-6 py-3 text-sm font-semibold text-white hover:bg-[#4A1F4D] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5B35] focus-visible:ring-offset-2 mb-8"
              >
                {event.registrationLabel || 'Register now'}
              </a>
            )
          )}

          <div className="prose-article">
            <PortableText value={event.description} components={portableTextComponents} />
          </div>
        </div>
      </Container>
    </div>
  );
}
