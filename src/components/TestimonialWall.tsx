import { TESTIMONIALS, type Testimonial } from '@/lib/testimonials';

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

// Masonry wall of attributed testimonial cards. Presentational only — the
// section heading and any CTA live with the caller. `limit` trims the list.
export default function TestimonialWall({
  items = TESTIMONIALS,
  limit,
}: {
  items?: Testimonial[];
  limit?: number;
}) {
  const list = typeof limit === 'number' ? items.slice(0, limit) : items;
  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
      {list.map((t) => (
        <figure
          key={t.name}
          className="mb-4 break-inside-avoid rounded-[2px] border border-rule/20 bg-paper p-5"
        >
          <blockquote className="text-ink/80 leading-relaxed">“{t.quote}”</blockquote>
          <figcaption className="mt-4 flex items-center gap-3">
            <span
              className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-[#dd3c13]/12 text-[#dd3c13] text-xs font-bold"
              aria-hidden="true"
            >
              {initials(t.name)}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-ink">{t.name}</span>
              <span className="block text-xs text-ink/55">
                {t.role} · {t.date}
              </span>
            </span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
