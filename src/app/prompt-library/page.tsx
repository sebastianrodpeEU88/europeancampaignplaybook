import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/Container';
import CopyPromptButton from '@/components/CopyPromptButton';
import { getPromptLibrary } from '@/lib/content';
import { createClient } from '@/lib/supabase/server';
import { routes } from '@/lib/routes';

const TITLE = 'the AI prompt library';
const DESCRIPTION =
  'Every prompt from the AI bootcamp for EU affairs, in one place: prompting basics, research, narrative, stakeholders, visuals, rollout and measurement. Free with an account.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: routes.promptLibrary() },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: 'website',
    images: ['/workshops-poster.png'],
  },
};

// New bootcamp episodes bring new prompts with them, so keep this fresh
// rather than baked in at build time.
export const revalidate = 60;

export default async function PromptLibraryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // Signed out: the collections and prompt names render, the prompt text is
  // never fetched into the page.
  const collections = await getPromptLibrary(Boolean(user));
  const total = collections.reduce((n, c) => n + c.prompts.length, 0);

  return (
    <div className="bg-paper min-h-screen">
      <section className="pt-10 pb-8 sm:pt-14 sm:pb-10">
        <Container>
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#dd3c13] mb-3">
              what we do
            </p>
            <h1 className="display text-3xl sm:text-4xl text-ink leading-tight mb-4">{TITLE}</h1>
            <p className="text-ink/75 leading-relaxed text-lg mb-4">
              Every prompt from the{' '}
              <Link href={routes.digitalBootcamp()} className="underline hover:no-underline">
                digital bootcamp
              </Link>
              , collected in one place and grouped by the job you are doing. {total} prompts today,
              and each new episode adds its own.
            </p>
            <p className="text-ink/60 leading-relaxed">
              Every prompt says which day it comes from, so you can go back to the exercise that
              explains it. They are starting points: give them your real context, and check what
              comes back against primary sources.
            </p>
          </div>
        </Container>
      </section>

      <Container>
        <div className="pb-16 sm:pb-20">
          {/* Collection cards */}
          <h2 className="display text-xl text-ink mb-4">select a collection</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {collections.map((collection) => (
              <li key={collection.slug}>
                <a
                  href={`#${collection.slug}`}
                  className="group block h-full rounded-[2px] border border-rule/20 bg-navy p-5 transition-colors hover:border-[#dd3c13] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dd3c13]"
                >
                  <div className="flex items-baseline justify-between gap-3 mb-2">
                    <h3 className="display text-lg text-[#EDE7DA] group-hover:text-white">
                      {collection.title}
                    </h3>
                    <span className="flex-shrink-0 text-xs font-semibold uppercase tracking-wider text-[#dd3c13]">
                      {collection.prompts.length}
                    </span>
                  </div>
                  <p className="text-sm text-[#EDE7DA]/70 leading-relaxed">{collection.blurb}</p>
                </a>
              </li>
            ))}
          </ul>

          {!user && (
            <div className="rounded-[2px] border border-[#dd3c13]/40 bg-[#dd3c13]/5 p-5 mb-12 max-w-3xl">
              <p className="font-semibold text-ink mb-1">Sign in to copy the prompts</p>
              <p className="text-sm text-ink/70 leading-relaxed mb-3">
                The bootcamp and its prompts are free. You need an account so we know who is working
                through them, and so your progress is saved.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`${routes.login()}?redirectTo=${encodeURIComponent(routes.promptLibrary())}`}
                  className="rounded-[2px] bg-navy px-4 py-2 text-sm font-semibold text-[#EDE7DA] hover:bg-navy/85 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href={routes.signup()}
                  className="rounded-[2px] border border-rule/30 px-4 py-2 text-sm font-semibold text-ink hover:bg-ink/5 transition-colors"
                >
                  Create a free account
                </Link>
              </div>
            </div>
          )}

          {/* The collections themselves */}
          <div className="space-y-12">
            {collections.map((collection) => (
              <section key={collection.slug} id={collection.slug} className="scroll-mt-24">
                <div className="border-b border-rule/20 pb-3 mb-5">
                  <h2 className="display text-2xl text-ink">{collection.title}</h2>
                  <p className="text-sm text-ink/60 mt-1">{collection.blurb}</p>
                </div>
                <ul className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {collection.prompts.map((p, i) => (
                    <li
                      key={`${p.articleSlug}-${p.label}-${i}`}
                      className="flex flex-col overflow-hidden rounded-[2px] border border-rule/20 bg-[#F7F4EE]"
                    >
                      <div className="flex items-center justify-between gap-3 bg-navy px-4 py-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-[#EDE7DA]">
                          {p.label}
                        </p>
                        {p.prompt && <CopyPromptButton text={p.prompt} />}
                      </div>
                      {p.prompt ? (
                        <pre className="flex-1 whitespace-pre-wrap break-words px-4 py-4 font-sans text-sm leading-relaxed text-ink">
                          {p.prompt}
                        </pre>
                      ) : (
                        <p className="flex-1 px-4 py-4 text-sm text-ink/55">
                          Log in to read and copy this prompt.
                        </p>
                      )}
                      {p.note && (
                        <p className="border-t border-rule/15 px-4 py-2 text-xs text-ink/55">{p.note}</p>
                      )}
                      <Link
                        href={routes.article(p.articleSlug)}
                        className="border-t border-rule/15 px-4 py-2 text-xs text-ink/60 hover:text-ink hover:bg-ink/5 transition-colors"
                      >
                        {p.episodeLabel}
                        {p.section ? ` · ${p.section}` : ''} →
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          {collections.length === 0 && (
            <p className="text-ink/60">The first bootcamp prompts are being written. Check back shortly.</p>
          )}
        </div>
      </Container>
    </div>
  );
}
