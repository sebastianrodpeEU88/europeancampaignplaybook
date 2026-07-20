'use client';

import { useState, useMemo } from 'react';
import type { ArticleSummary, Author, Pillar } from '@/types/content';
import ArticleCard from './ArticleCard';

type Filters = {
  pillar: string;
  type: string;
  difficulty: string;
  jurisdiction: string;
  search: string;
};

export default function ArticleList({
  articles,
  authors,
  pillars,
}: {
  articles: ArticleSummary[];
  authors: Author[];
  pillars: Pillar[];
}) {
  const [filters, setFilters] = useState<Filters>({
    pillar: '',
    type: '',
    difficulty: '',
    jurisdiction: '',
    search: '',
  });

  const authorMap = useMemo(
    () => new Map(authors.map((a) => [a.id, a])),
    [authors]
  );
  const pillarMap = useMemo(
    () => new Map(pillars.map((p) => [p.slug, p])),
    [pillars]
  );

  const uniqueTypes = useMemo(
    () => [...new Set(articles.map((a) => a.type))].sort(),
    [articles]
  );
  const uniqueDifficulties = useMemo(
    () => [...new Set(articles.map((a) => a.difficulty))],
    [articles]
  );
  const uniqueJurisdictions = useMemo(
    () => [...new Set(articles.map((a) => a.jurisdiction))].sort(),
    [articles]
  );

  const filtered = useMemo(() => {
    const query = filters.search.toLowerCase();
    return articles.filter((a) => {
      if (filters.pillar && a.pillarSlug !== filters.pillar) return false;
      if (filters.type && a.type !== filters.type) return false;
      if (filters.difficulty && a.difficulty !== filters.difficulty) return false;
      if (filters.jurisdiction && a.jurisdiction !== filters.jurisdiction) return false;
      if (query) {
        const hay = `${a.title} ${a.subheadline} ${a.inBrief.join(' ')}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }
      return true;
    });
  }, [articles, filters]);

  const hasFilters = Object.values(filters).some(Boolean);

  function clearFilters() {
    setFilters({ pillar: '', type: '', difficulty: '', jurisdiction: '', search: '' });
  }

  return (
    <div>
      {/* Filter bar */}
      <div className="rounded-[2px] border border-rule/20 bg-paper p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <input
            type="search"
            placeholder="Search articles…"
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            className="col-span-1 lg:col-span-2 rounded-[2px] border border-rule/25 bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-ink"
            aria-label="Search articles"
          />

          <select
            value={filters.pillar}
            onChange={(e) => setFilters((f) => ({ ...f, pillar: e.target.value }))}
            className="rounded-[2px] border border-rule/25 bg-paper px-3 py-2 text-sm text-ink/80 focus:outline-none focus:ring-2 focus:ring-ink"
            aria-label="Filter by pillar"
          >
            <option value="">All pillars</option>
            {pillars.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.title}
              </option>
            ))}
          </select>

          <select
            value={filters.type}
            onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
            className="rounded-[2px] border border-rule/25 bg-paper px-3 py-2 text-sm text-ink/80 focus:outline-none focus:ring-2 focus:ring-ink"
            aria-label="Filter by article type"
          >
            <option value="">All types</option>
            {uniqueTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <select
            value={filters.jurisdiction}
            onChange={(e) => setFilters((f) => ({ ...f, jurisdiction: e.target.value }))}
            className="rounded-[2px] border border-rule/25 bg-paper px-3 py-2 text-sm text-ink/80 focus:outline-none focus:ring-2 focus:ring-ink"
            aria-label="Filter by jurisdiction"
          >
            <option value="">All jurisdictions</option>
            {uniqueJurisdictions.map((j) => (
              <option key={j} value={j}>
                {j}
              </option>
            ))}
          </select>

          <select
            value={filters.difficulty}
            onChange={(e) => setFilters((f) => ({ ...f, difficulty: e.target.value }))}
            className="rounded-[2px] border border-rule/25 bg-paper px-3 py-2 text-sm text-ink/80 focus:outline-none focus:ring-2 focus:ring-ink"
            aria-label="Filter by difficulty"
          >
            <option value="">All difficulties</option>
            {uniqueDifficulties.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {hasFilters && (
          <div className="mt-3 flex items-center justify-between">
            <p className="text-sm text-ink/60">
              {filtered.length} {filtered.length === 1 ? 'article' : 'articles'} found
            </p>
            <button
              onClick={clearFilters}
              className="text-sm text-ink underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink rounded"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="rounded-[2px] border border-rule/20 bg-paper p-12 text-center">
          <p className="text-ink/60 mb-2">No articles match your filters.</p>
          <button
            onClick={clearFilters}
            className="text-sm text-ink underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink rounded"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((article) => (
            <div key={article.id} className="reveal">
              <ArticleCard
                article={article}
                author={authorMap.get(article.authorId)}
                pillar={pillarMap.get(article.pillarSlug)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
