import Link from 'next/link';
import type { Event } from '@/types/content';
import { routes } from '@/lib/routes';
import EventCover from '@/components/brand/EventCover';
import { brusselsDayBadge, formatBrusselsDateTime } from '@/lib/datetime';

export default function EventCard({ event, isPast }: { event: Event; isPast: boolean }) {
  const { day, month } = brusselsDayBadge(event.startDateTime);

  return (
    <Link
      href={routes.event(event.slug)}
      className="group flex gap-4 rounded-[2px] bg-paper border border-rule/20 p-4 hover:border-rule/40 transition-colors duration-200 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
    >
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-[2px] bg-ink/5">
        <EventCover coverImage={event.coverImage} title={event.title} variant="thumb" dimmed={isPast} />
      </div>

      <div className="flex flex-shrink-0 flex-col items-center justify-center rounded-[2px] border border-rule/20 px-3 py-1.5 h-fit">
        <span className="text-[10px] font-semibold uppercase text-ink/60">{month}</span>
        <span className="text-lg font-bold text-ink leading-none">{day}</span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs text-ink/60 mb-1">
          {formatBrusselsDateTime(event.startDateTime)}
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
