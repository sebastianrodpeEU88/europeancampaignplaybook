'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { SearchIndex } from '@/types/content';
import { routes } from '@/lib/routes';
import { seriesHex } from '@/lib/pillarSeries';
import MoveMark from '@/components/brand/MoveMark';

type Result = {
  key: string;
  href: string;
  kind: 'Article' | 'Topic' | 'Pillar' | 'Trend';
  title: string;
  subtitle?: string;
  accent: string | null;
  locked?: boolean;
  score: number;
};

// Cheap, dependency-free relevance score — favours matches at the start of
// a field, and title matches over secondary-field matches. Good enough for
// a few hundred items searched on every keystroke with no network round trip.
function matchScore(haystack: string, query: string): number {
  const h = haystack.toLowerCase();
  const q = query.toLowerCase();
  const i = h.indexOf(q);
  if (i === -1) return -1;
  if (i === 0) return 100 - q.length;
  const wordStart = h[i - 1] === ' ' || h[i - 1] === '-';
  return (wordStart ? 60 : 30) - i * 0.1;
}

function buildResults(index: SearchIndex, query: string): Result[] {
  if (!query.trim()) return [];
  const results: Result[] = [];

  for (const a of index.articles) {
    const titleScore = matchScore(a.title, query);
    const subScore = matchScore(a.subheadline, query);
    const score = Math.max(titleScore, subScore >= 0 ? subScore - 20 : -1);
    if (score < 0) continue;
    results.push({
      key: `article-${a.slug}`,
      href: routes.article(a.slug),
      kind: 'Article',
      title: a.title,
      subtitle: a.type,
      accent: a.pillarSlug ? seriesHex(a.pillarSlug) : null,
      locked: a.locked,
      score,
    });
  }

  for (const t of index.topics) {
    const score = matchScore(t.title, query);
    if (score < 0) continue;
    results.push({
      key: `topic-${t.slug}`,
      href: routes.topic(t.slug),
      kind: 'Topic',
      title: t.title,
      subtitle: t.pillarTitle,
      accent: seriesHex(t.pillarSlug),
      score,
    });
  }

  for (const p of index.pillars) {
    const score = matchScore(p.title, query);
    if (score < 0) continue;
    results.push({
      key: `pillar-${p.slug}`,
      href: routes.pillar(p.slug),
      kind: 'Pillar',
      title: p.title,
      subtitle: 'Knowledge pillar',
      accent: seriesHex(p.slug),
      score,
    });
  }

  for (const t of index.trends) {
    const score = matchScore(t.title, query);
    if (score < 0) continue;
    results.push({
      key: `trend-${t.slug}`,
      href: routes.trend(t.slug),
      kind: 'Trend',
      title: t.title,
      subtitle: `Trend #${t.number}`,
      accent: null,
      score,
    });
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, 24);
}

export default function CommandPalette({ index }: { index: SearchIndex }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();
  const router = useRouter();

  const results = useMemo(() => buildResults(index, query), [index, query]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
    setActiveIndex(0);
  }, []);

  const navigate = useCallback(
    (href: string) => {
      close();
      router.push(href);
    },
    [close, router]
  );

  // Global ⌘K / Ctrl+K to open, from anywhere on the site.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Lets the mobile nav's "Search" row (no ⌘K on a touch keyboard) open the
  // same palette without prop-drilling open state through Header's tree.
  useEffect(() => {
    function onOpenEvent() {
      setOpen(true);
    }
    window.addEventListener('open-command-palette', onOpenEvent);
    return () => window.removeEventListener('open-command-palette', onOpenEvent);
  }, []);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  function onQueryChange(value: string) {
    setQuery(value);
    setActiveIndex(0);
  }

  function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const active = results[activeIndex];
      if (active) navigate(active.href);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden lg:flex flex-shrink-0 items-center justify-center h-8 w-8 rounded-[2px] border border-[#EDE7DA]/20 bg-white/5 text-[#EDE7DA]/60 hover:text-[#EDE7DA] hover:border-[#EDE7DA]/35 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EDE7DA]"
        aria-label="Search the knowledge library"
        title="Search (⌘K)"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
        </svg>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center bg-navy/60 backdrop-blur-[2px] px-4 pt-[12vh]"
          onClick={close}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Search"
            className="w-full max-w-xl rounded-[2px] bg-paper border border-rule/25 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-rule/15 px-4">
              <svg className="h-4 w-4 text-ink/40 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                role="combobox"
                aria-expanded={results.length > 0}
                aria-controls={listboxId}
                aria-autocomplete="list"
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                onKeyDown={onInputKeyDown}
                placeholder="Search articles, topics, pillars, trends…"
                className="w-full bg-transparent py-4 text-base text-ink placeholder:text-ink/40 focus:outline-none"
              />
              <kbd className="flex-shrink-0 rounded-[2px] border border-rule/25 px-1.5 py-0.5 text-[10px] font-medium text-ink/45">
                esc
              </kbd>
            </div>

            <ul id={listboxId} role="listbox" className="max-h-[60vh] overflow-y-auto py-2">
              {query.trim() && results.length === 0 && (
                <li className="px-4 py-8 text-center text-sm text-ink/45">
                  No results for &ldquo;{query}&rdquo;
                </li>
              )}
              {results.map((r, i) => (
                <li key={r.key} role="option" aria-selected={i === activeIndex}>
                  <button
                    type="button"
                    onClick={() => navigate(r.href)}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors duration-100 ${
                      i === activeIndex ? 'bg-ink/[0.05]' : ''
                    }`}
                  >
                    <span
                      className="flex-shrink-0 h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: r.accent ?? 'var(--color-rule)' }}
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm text-ink truncate">{r.title}</span>
                      {r.subtitle && (
                        <span className="block text-xs text-ink/45 truncate">{r.subtitle}</span>
                      )}
                    </span>
                    {r.locked && (
                      <svg className="h-3.5 w-3.5 text-ink/35 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                      </svg>
                    )}
                    <span className="flex-shrink-0 text-[10px] font-medium uppercase tracking-wide text-ink/35">
                      {r.kind}
                    </span>
                  </button>
                </li>
              ))}
              {!query.trim() && (
                <li className="px-4 py-8 flex flex-col items-center gap-2 text-center">
                  <MoveMark variant="arrow" className="h-5 w-5 text-ink/25" />
                  <span className="text-sm text-ink/45">
                    Search across articles, topics, pillars and trends.
                  </span>
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
