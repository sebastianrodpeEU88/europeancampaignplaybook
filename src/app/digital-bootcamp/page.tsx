import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/Container';
import { getAllBootcamps } from '@/lib/content';
import { routes } from '@/lib/routes';
import type { Bootcamp } from '@/types/content';

export const metadata: Metadata = {
  title: 'digital bootcamp',
  description:
    'Short, sequential AI lessons for small public affairs teams. Free, self-paced, with downloadable worksheets for every episode.',
  alternates: { canonical: routes.digitalBootcamp() },
  openGraph: {
    title: 'digital bootcamp',
    description:
      'Short, sequential AI lessons for small public affairs teams. Free, self-paced, with downloadable worksheets for every episode.',
    type: 'website',
    images: ['/workshops-poster.png'],
  },
};

// Episodes are released one at a time, so a bootcamp is never "complete" on
// first publication — keep this fresh rather than baked in at build time.
export const revalidate = 60;

const STATUS_STYLES: Record<Bootcamp['status'], string> = {
  Live: 'bg-[#dd3c13] text-[#EDE7DA]',
  'Coming soon': 'bg-navy/10 text-navy',
  Finished: 'bg-rule/10 text-ink/55',
};

export default async function DigitalBootcampPage() {
  const bootcamps = await getAllBootcamps();

  return (
    <div className="bg-paper min-h-screen">
      <section className="pt-10 pb-8 sm:pt-14 sm:pb-10">
        <Container>
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#dd3c13] mb-3">
              what we do
            </p>
            <h1 className="display text-3xl sm:text-4xl text-ink leading-tight mb-4">
              digital bootcamp
            </h1>
            <p className="text-ink/75 leading-relaxed text-lg">
              Short, sequential lessons you work through at your own pace, built for small teams who
              already use AI most days and want to get properly good at it. Every episode comes with
              worksheets you can download, fill in and keep. All of it is free.
            </p>
          </div>
        </Container>
      </section>

      <Container>
        <div className="max-w-3xl pb-16 sm:pb-20 space-y-10">
          {bootcamps.length === 0 && (
            <p className="text-ink/60">The first bootcamp is being written. Check back shortly.</p>
          )}

          {bootcamps.map((bootcamp) => (
            <article
              key={bootcamp.id}
              className="rounded-[2px] border border-rule/20 bg-[#F7F4EE] p-6 sm:p-8"
            >
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span
                  className={`rounded-[2px] px-2 py-0.5 text-xs font-semibold uppercase tracking-wider ${STATUS_STYLES[bootcamp.status]}`}
                >
                  {bootcamp.status}
                </span>
                {bootcamp.cadence && (
                  <span className="text-xs text-ink/55">{bootcamp.cadence}</span>
                )}
              </div>

              <h2 className="display text-2xl sm:text-3xl text-ink leading-tight mb-3">
                {bootcamp.title}
              </h2>
              <p className="text-ink/75 leading-relaxed mb-2">{bootcamp.summary}</p>
              {bootcamp.whoItIsFor && (
                <p className="text-sm text-ink/55 leading-relaxed mb-6">{bootcamp.whoItIsFor}</p>
              )}

              {bootcamp.episodes.length > 0 ? (
                <ol className="border-t border-rule/15">
                  {bootcamp.episodes.map((episode) => (
                    <li key={episode.slug} className="border-b border-rule/15">
                      <Link
                        href={routes.article(episode.slug)}
                        className="group flex flex-col gap-1 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink rounded-[2px]"
                      >
                        <div className="flex items-baseline gap-3">
                          <span className="display text-sm text-[#dd3c13] flex-shrink-0">
                            {episode.label}
                          </span>
                          <span className="display text-lg text-ink group-hover:underline">
                            {episode.title}
                          </span>
                        </div>
                        {episode.subheadline && (
                          <p className="text-sm text-ink/65 leading-relaxed">{episode.subheadline}</p>
                        )}
                        <p className="text-xs text-ink/45">
                          {[episode.difficulty, episode.readingTime && `${episode.readingTime} min read`]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-ink/55">The first episode lands shortly.</p>
              )}
            </article>
          ))}
        </div>
      </Container>
    </div>
  );
}
