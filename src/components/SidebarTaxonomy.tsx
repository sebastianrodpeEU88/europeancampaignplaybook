'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Pillar, Article } from '@/types/content';
import { routes } from '@/lib/routes';

function GlobalSidebar({
  pillars,
  currentTopicSlug,
}: {
  pillars: Pillar[];
  currentTopicSlug?: string;
}) {
  return (
    <nav aria-label="Knowledge taxonomy" className="space-y-1">
      {pillars.map((pillar) => (
        <details key={pillar.slug} className="group" open={pillar.branches.some((b) => b.topics.some((t) => t.slug === currentTopicSlug))}>
          <summary className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[#4A1F4D] hover:bg-[rgba(0,0,0,0.04)] list-none [&::-webkit-details-marker]:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5B35]">
            <span
              className="h-2 w-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: pillar.accentColour }}
              aria-hidden="true"
            />
            <span className="flex-1 truncate">{pillar.title}</span>
            <svg
              className="h-4 w-4 text-[#A896AC] transition-transform group-open:rotate-90 flex-shrink-0"
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
                    className={`block rounded-lg px-2 py-1.5 text-xs transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5B35] ${
                      isActive
                        ? 'bg-[rgba(24,95,165,0.08)] text-[#FF5B35] font-medium'
                        : 'text-[#7A6380] hover:text-[#2B0A2E] hover:bg-[rgba(0,0,0,0.03)]'
                    }`}
                  >
                    {topic.title}
                  </Link>
                );
              })
            )}
          </div>
        </details>
      ))}
    </nav>
  );
}

function ArticleSidebar({
  pillar,
  article,
}: {
  pillar: Pillar;
  article: Article;
}) {
  return (
    <div className="space-y-4">
      {/* Article meta */}
      <div className="rounded-xl border border-[rgba(0,0,0,0.08)] bg-white p-4">
        <p className="text-xs font-semibold font-mono uppercase tracking-wider text-[#A896AC] mb-3">
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
              <dt className="text-[#A896AC]">{label}</dt>
              <dd className="text-[#4A1F4D] font-medium text-right">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Position in taxonomy */}
      <div className="rounded-xl border border-[rgba(0,0,0,0.08)] bg-white p-4">
        <p className="text-xs font-semibold font-mono uppercase tracking-wider text-[#A896AC] mb-3">
          In this pillar
        </p>
        <Link
          href={routes.pillar(pillar.slug)}
          className="flex items-center gap-2 text-sm font-medium text-[#2B0A2E] hover:text-[#4A1F4D] mb-2 focus-visible:outline-none focus-visible:underline"
          style={{ color: pillar.accentColour }}
        >
          <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: pillar.accentColour }} aria-hidden="true" />
          {pillar.title}
        </Link>
        {pillar.branches.map((branch) => {
          const hasCurrent = branch.topics.some((t) => t.slug === article.topicSlug);
          return (
            <div key={branch.slug} className="mt-2">
              <p className="text-xs text-[#A896AC] mb-1">{branch.title}</p>
              {branch.topics.map((topic) => (
                <Link
                  key={topic.slug}
                  href={routes.topic(topic.slug)}
                  aria-current={topic.slug === article.topicSlug ? 'true' : undefined}
                  className={`block text-xs px-2 py-1 rounded transition-colors ${
                    topic.slug === article.topicSlug
                      ? 'font-medium'
                      : 'text-[#7A6380] hover:text-[#2B0A2E]'
                  }`}
                  style={topic.slug === article.topicSlug ? { color: pillar.accentColour } : undefined}
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
      article: Article;
    }
)) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 rounded-lg border border-[rgba(0,0,0,0.12)] bg-white px-4 py-2 text-sm font-medium text-[#4A1F4D] hover:bg-[rgba(0,0,0,0.02)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5B35]"
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
              <div className="rounded-xl border border-[rgba(0,0,0,0.08)] bg-white p-4">
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
