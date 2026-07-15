import Image from 'next/image';
import Link from 'next/link';
import type { Event } from '@/types/content';
import { routes } from '@/lib/routes';
import { urlForImage } from '@/sanity/image';

function formatDateBadge(iso: string): { day: string; month: string } {
  const date = new Date(iso);
  return {
    day: date.toLocaleDateString('en-GB', { day: '2-digit' }),
    month: date.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase(),
  };
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function EventCard({ event, isPast }: { event: Event; isPast: boolean }) {
  const { day, month } = formatDateBadge(event.startDateTime);

  return (
    <Link
      href={routes.event(event.slug)}
      className="group flex gap-4 rounded-[2px] bg-paper border border-rule/20 p-4 hover:border-rule/40 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
    >
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-[2px] bg-ink/5">
        <Image
          src={urlForImage(event.coverImage).width(160).height(160).fit('crop').url()}
          alt=""
          fill
          sizes="80px"
          className={`object-cover ${isPast ? 'grayscale opacity-70' : ''}`}
        />
      </div>

      <div className="flex flex-shrink-0 flex-col items-center justify-center rounded-[2px] border border-rule/20 px-3 py-1.5 h-fit">
        <span className="text-[10px] font-semibold uppercase text-ink/60">{month}</span>
        <span className="text-lg font-bold text-ink leading-none">{day}</span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs text-ink/60 mb-1">
          {formatDateTime(event.startDateTime)}
          {isPast && <span className="ml-2 text-ink/45">· ended</span>}
        </p>
        <h3 className="font-semibold text-ink group-hover:text-ink/80 transition-colors leading-snug mb-1">
          {event.title}
        </h3>
        <p className="text-sm text-ink/60 line-clamp-2 leading-relaxed mb-2">{event.summary}</p>
        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {event.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-[2px] bg-ink/5 px-2 py-0.5 text-[10px] font-medium uppercase text-ink/60"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
