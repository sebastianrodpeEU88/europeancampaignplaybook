'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PortableText } from '@portabletext/react';
import { portableTextComponents } from '@/components/portableTextComponents';
import Paywall from '@/components/Paywall';
import { routes } from '@/lib/routes';
import type { Article } from '@/types/content';

type GatedContent = Pick<
  Article,
  | 'fullSections'
  | 'aiWorkflow'
  | 'promptPack'
  | 'checklist'
  | 'sources'
  | 'furtherReading'
  | 'relatedTopicSlugs'
  | 'versionHistory'
>;

type State =
  | { status: 'loading' }
  | { status: 'locked' }
  | { status: 'unlocked'; content: GatedContent };

export default function GatedArticleSections({ articleSlug }: { articleSlug: string }) {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/articles/${articleSlug}/gated`)
      .then(async (res) => {
        if (cancelled) return;
        if (!res.ok) {
          setState({ status: 'locked' });
          return;
        }
        const content = (await res.json()) as GatedContent;
        setState({ status: 'unlocked', content });
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'locked' });
      });
    return () => {
      cancelled = true;
    };
  }, [articleSlug]);

  if (state.status === 'loading') {
    return (
      <div className="my-8 space-y-3 animate-pulse" aria-hidden="true">
        <div className="h-4 rounded-[2px] bg-ink/[0.06]" />
        <div className="h-4 w-5/6 rounded-[2px] bg-ink/[0.06]" />
        <div className="h-4 w-4/6 rounded-[2px] bg-ink/[0.06]" />
      </div>
    );
  }

  if (state.status === 'locked') {
    return <Paywall />;
  }

  const { content } = state;

  return (
    <>
      {content.fullSections.map((section, i) => (
        <section
          key={i}
          aria-labelledby={`section-${i}`}
          className={`prose-article my-8 ${i > 0 ? 'pt-8 border-t border-rule/15' : ''}`}
        >
          <div className="flex items-baseline gap-4 mb-4">
            <span
              className="display text-4xl text-ghost leading-none flex-shrink-0"
              aria-hidden="true"
            >
              {String(i + 1).padStart(2, '0')}
            </span>
            <h2 id={`section-${i}`} data-toc-heading className="display text-xl text-ink">
              {section.title}
            </h2>
          </div>
          <PortableText value={section.body} components={portableTextComponents} />
        </section>
      ))}

      {content.aiWorkflow && content.aiWorkflow.length > 0 && (
        <div className="rounded-[2px] border border-rule/20 bg-paper p-5 my-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink/45 mb-3">
            AI workflow suggestions
          </p>
          <ul className="space-y-2">
            {content.aiWorkflow.map((step, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-ink/80">
                <span className="flex-shrink-0 font-medium text-ink/45">{i + 1}.</span>
                {step}
              </li>
            ))}
          </ul>
        </div>
      )}

      {content.promptPack && content.promptPack.length > 0 && (
        <div className="my-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink/45 mb-3">
            Prompt pack
          </p>
          <div className="space-y-3">
            {content.promptPack.map((item, i) => (
              <div key={i} className="rounded-[2px] border border-rule/20 bg-paper p-4">
                <p className="text-sm font-semibold text-ink mb-2">{item.title}</p>
                <pre className="text-xs text-ink/80 bg-ink/[0.03] rounded-[2px] p-3 whitespace-pre-wrap leading-relaxed overflow-x-auto">
                  {item.prompt}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}

      {content.checklist && content.checklist.length > 0 && (
        <div className="rounded-[2px] border border-rule/20 bg-paper p-5 my-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink/45 mb-3">
            Checklist
          </p>
          <ul className="space-y-2">
            {content.checklist.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-ink/80">
                <svg className="h-4 w-4 text-ink flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {content.sources.length > 0 && (
        <div className="my-8 pt-8 border-t border-rule/15">
          <h2 className="display text-base text-ink mb-3">Sources</h2>
          <ol className="space-y-1">
            {content.sources.map((source, i) => (
              <li key={i} className="text-sm text-ink/60 flex gap-2">
                <span className="text-ink/45 flex-shrink-0">{i + 1}.</span>
                {source}
              </li>
            ))}
          </ol>
        </div>
      )}

      {content.furtherReading.length > 0 && (
        <div className="my-6">
          <h2 className="display text-base text-ink mb-3">Further reading</h2>
          <ul className="space-y-2">
            {content.furtherReading.map((item, i) => (
              <li key={i} className="flex items-center gap-3 rounded-[2px] border border-rule/20 bg-paper p-3 text-sm">
                <span className="rounded-[2px] bg-ink/5 px-2 py-0.5 text-xs text-ink/60 flex-shrink-0">
                  {item.type}
                </span>
                <span className="text-ink/80 flex-1">{item.title}</span>
                <span className="text-xs text-ink/45 flex-shrink-0">{item.readingTime} min</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {content.relatedTopicSlugs.length > 0 && (
        <div className="my-6">
          <h2 className="display text-base text-ink mb-3">Related topics</h2>
          <div className="flex flex-wrap gap-2">
            {content.relatedTopicSlugs.map((slug) => (
              <Link
                key={slug}
                href={routes.topic(slug)}
                className="rounded-full border border-rule/25 bg-paper px-3 py-1 text-sm text-ink/80 hover:bg-ink/[0.03] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
              >
                {slug.replace(/-/g, ' ')}
              </Link>
            ))}
          </div>
        </div>
      )}

      {content.versionHistory.length > 0 && (
        <div className="my-6 pt-6 border-t border-rule/15">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-ink/45 mb-3">
            Version history
          </h2>
          <ul className="space-y-1">
            {content.versionHistory.map((entry, i) => (
              <li key={i} className="text-xs text-ink/45 flex gap-3">
                <span>{entry.date}</span>
                <span>{entry.note}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
