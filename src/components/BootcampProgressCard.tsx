import Link from 'next/link';
import { routes } from '@/lib/routes';
import type { Bootcamp } from '@/types/content';

// Read-only progress summary for the account page: how far the signed-in user
// has got through each bootcamp they have started (or every live one).
export default function BootcampProgressCard({
  bootcamps,
  completedSlugs,
}: {
  bootcamps: Bootcamp[];
  completedSlugs: string[];
}) {
  const done = new Set(completedSlugs);
  const visible = bootcamps.filter(
    (b) => b.status === 'Live' || b.episodes.some((e) => done.has(e.slug))
  );
  if (visible.length === 0) return null;

  return (
    <div className="rounded-[2px] border border-rule/20 bg-paper p-6 mb-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-ink/45 mb-3">
        Bootcamp progress
      </p>

      <div className="space-y-6">
        {visible.map((bootcamp) => {
          const total = bootcamp.episodes.length;
          const complete = bootcamp.episodes.filter((e) => done.has(e.slug)).length;
          const pct = total ? Math.round((complete / total) * 100) : 0;

          return (
            <div key={bootcamp.id}>
              <div className="flex items-baseline justify-between gap-3 mb-1">
                <Link
                  href={routes.digitalBootcamp()}
                  className="font-semibold text-ink hover:underline"
                >
                  {bootcamp.title}
                </Link>
                <span className="text-sm text-ink/55 flex-shrink-0">
                  {complete} of {total}
                </span>
              </div>

              <div
                className="h-1.5 w-full rounded-full bg-ink/[0.08] mb-3 overflow-hidden"
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${bootcamp.title} progress`}
              >
                <div className="h-full bg-[#dd3c13]" style={{ width: `${pct}%` }} />
              </div>

              <ul className="space-y-1.5">
                {bootcamp.episodes.map((episode) => {
                  const isDone = done.has(episode.slug);
                  return (
                    <li key={episode.slug} className="flex items-start gap-2 text-sm">
                      <span
                        className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border ${
                          isDone ? 'border-[#dd3c13] bg-[#dd3c13]' : 'border-ink/25'
                        }`}
                        aria-hidden="true"
                      >
                        {isDone && (
                          <svg className="h-2.5 w-2.5 text-[#EDE7DA]" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </span>
                      <Link
                        href={routes.article(episode.slug)}
                        className={`hover:underline ${isDone ? 'text-ink/55' : 'text-ink/80'}`}
                      >
                        <span className="text-ink/45">{episode.label}</span> {episode.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
