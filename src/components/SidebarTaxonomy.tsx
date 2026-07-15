'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Pillar, Article } from '@/types/content';
import { routes } from '@/lib/routes';
import { seriesHex } from '@/lib/pillarSeries';

function GlobalSidebar({
  pillars,
  currentTopicSlug,
}: {
  pillars: Pillar[];
  currentTopicSlug?: string;
}) {
  return (
    <nav aria-label="Knowledge taxonomy" className="space-y-1">
      {pillars.map((pillar) => {
        const accent = seriesHex(pillar.slug);
        return (
          <details key={pillar.slug} className="group" open={pillar.branches.some((b) => b.topics.some((t) => t.slug === currentTopicSlug))}>
            <summary className="flex cursor-pointer items-center gap-2 rounded-[2px] px-3 py-2 text-sm font-medium text-ink/80 hover:bg-ink/[0.04] list-none [&::-webkit-details-marker]:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink">
              <span
                className="h-2 w-2 rounded-full flex-shrink-0 bg-ink/30"
                style={accent ? { backgroundColor: accent } : undefined}
                aria-hidden="true"
              />
              <span className="flex-1 truncate">{pillar.title}</span>
              <svg
                className="h-4 w-4 text-ink/45 transition-transform group-open:rotate-90 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </summary>
            <div className="pl-5 pt-1 space-y-0.5">
              {pillar.branches.map((branch) =>
                branch.topics.map((topic) => {
                  const isActive = topic.slug === currentTopicSlug;
                  return (
                    <Link
                      key={topic.slug}
                      href={routes.topic(topic.slug)}
                      aria-current={isActive ? 'true' : undefined}
                      className={`block rounded-[2px] px-2 py-1.5 text-xs transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink ${
                        isActive
                          ? 'font-medium bg-ink/[0.06] text-ink'
                          : 'text-ink/60 hover:text-ink hover:bg-ink/[0.03]'
                      }`}
                      style={isActive && accent ? { color: accent } : undefined}
                    >
                      {topic.title}
                    </Link>
                  );
                })
              )}
            </div>
          </details>
        );
      })}
    </nav>
  );
}

// Deliberately narrow — this component is a Client Component, so whatever
// shape is passed as `article` gets serialized into the page's RSC payload
// regardless of which fields are actually rendered. Passing the full
// `Article` here would leak gated fields (fullSections, checklist,
// promptPack, etc.) to every visitor of a locked article, sidebar or not.
type ArticleSidebarInfo = Pick<
  Article,
  'readingTime' | 'difficulty' | 'jurisdiction' | 'lastUpdated' | 'type' | 'topicSlug'
>;

function ArticleSidebar({
  pillar,
  article,
}: {
  pillar: Pillar;
  article: ArticleSidebarInfo;
}) {
  const accent = seriesHex(pillar.slug);

  return (
    <div className="space-y-4">
      {/* Article meta */}
      <div className="rounded-[2px] border border-rule/20 bg-paper p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink/45 mb-3">
          About this article
        </p>
        <dl className="space-y-2 text-xs">
          {[
            ['Reading time', `${article.readingTime} min`],
            ['Difficulty', article.difficulty],
            ['Jurisdiction', article.jurisdiction],
            ['Last updated', new Date(article.lastUpdated).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })],
            ['Article type', article.type],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between gap-2">
              <dt className="text-ink/45">{label}</dt>
              <dd className="text-ink/80 font-medium text-right">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Position in taxonomy */}
      <div className="rounded-[2px] border border-rule/20 bg-paper p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink/45 mb-3">
          In this pillar
        </p>
        <Link
          href={routes.pillar(pillar.slug)}
          className="flex items-center gap-2 text-sm font-medium text-ink mb-2 focus-visible:outline-none focus-visible:underline"
          style={accent ? { color: accent } : undefined}
        >
          <span className="h-2 w-2 rounded-full flex-shrink-0 bg-ink/30" style={accent ? { backgroundColor: accent } : undefined} aria-hidden="true" />
          {pillar.title}
        </Link>
        {pillar.branches.map((branch) => {
          return (
            <div key={branch.slug} className="mt-2">
              <p className="text-xs text-ink/45 mb-1">{branch.title}</p>
              {branch.topics.map((topic) => (
                <Link
                  key={topic.slug}
                  href={routes.topic(topic.slug)}
                  aria-current={topic.slug === article.topicSlug ? 'true' : undefined}
                  className={`block text-xs px-2 py-1 rounded-[2px] transition-colors ${
                    topic.slug === article.topicSlug
                      ? 'font-medium'
                      : 'text-ink/60 hover:text-ink'
                  }`}
                  style={topic.slug === article.topicSlug ? { color: accent ?? '#111111' } : undefined}
                >
                  {topic.title}
                </Link>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function SidebarTaxonomy({
  variant,
  pillars,
  currentTopicSlug,
  pillar,
  article,
}: (
  | {
      variant: 'global';
      pillars: Pillar[];
      currentTopicSlug?: string;
      pillar?: undefined;
      article?: undefined;
    }
  | {
      variant: 'article';
      pillars?: undefined;
      currentTopicSlug?: undefined;
      pillar: Pillar;
      article: ArticleSidebarInfo;
    }
)) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 rounded-[2px] border border-rule/25 bg-paper px-4 py-2 text-sm font-medium text-ink/80 hover:bg-ink/[0.02] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
          aria-expanded={isOpen}
          aria-controls="sidebar-content"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
          </svg>
          {variant === 'global' ? 'Browse topics' : 'Article details'}
          <svg
            className={`h-4 w-4 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isOpen && (
          <div id="sidebar-content" className="mt-2">
            {variant === 'global' ? (
              <div className="rounded-[2px] border border-rule/20 bg-paper p-4">
                <GlobalSidebar pillars={pillars!} currentTopicSlug={currentTopicSlug} />
              </div>
            ) : (
              <ArticleSidebar pillar={pillar!} article={article!} />
            )}
          </div>
        )}
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        {variant === 'global' ? (
          <GlobalSidebar pillars={pillars!} currentTopicSlug={currentTopicSlug} />
        ) : (
          <ArticleSidebar pillar={pillar!} article={article!} />
        )}
      </div>
    </>
  );
}
