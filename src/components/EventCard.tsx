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
      className="group flex gap-4 rounded-2xl bg-white border border-[rgba(43,10,46,0.1)] p-4 hover:shadow-md transition-shadow duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5B35] focus-visible:ring-offset-2"
    >
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-[#FDF6EC]">
        <Image
          src={urlForImage(event.coverImage).width(160).height(160).fit('crop').url()}
          alt=""
          fill
          className={`object-cover ${isPast ? 'grayscale opacity-70' : ''}`}
        />
      </div>

      <div className="flex flex-shrink-0 flex-col items-center justify-center rounded-lg border border-[rgba(43,10,46,0.1)] px-3 py-1.5 h-fit">
        <span className="text-[10px] font-mono font-semibold uppercase text-[#FF5B35]">{month}</span>
        <span className="text-lg font-bold text-[#2B0A2E] leading-none">{day}</span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-mono text-[#7A6380] mb-1">
          {formatDateTime(event.startDateTime)}
          {isPast && <span className="ml-2 text-[#A896AC]">· ended</span>}
        </p>
        <h3 className="font-semibold text-[#2B0A2E] group-hover:text-[#4A1F4D] transition-colors leading-snug mb-1">
          {event.title}
        </h3>
        <p className="text-sm text-[#7A6380] line-clamp-2 leading-relaxed mb-2">{event.summary}</p>
        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {event.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-[rgba(43,10,46,0.05)] px-2 py-0.5 text-[10px] font-mono font-medium uppercase text-[#7A6380]"
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
