import Link from 'next/link';
import type { ArticleSummary, Author, Pillar } from '@/types/content';
import { routes } from '@/lib/routes';
import { seriesHex } from '@/lib/pillarSeries';
import ArticleCover from '@/components/brand/ArticleCover';

export default function ArticleCard({
  article,
  author,
  pillar,
}: {
  article: ArticleSummary;
  author?: Author;
  pillar?: Pillar;
}) {
  const accent = pillar ? seriesHex(pillar.slug) : null;

  return (
    <Link
      href={routes.article(article.slug)}
      className="group block rounded-[2px] bg-paper border border-rule/20 overflow-hidden hover:border-rule/40 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
      style={accent ? { borderLeft: `4px solid ${accent}` } : undefined}
    >
      <ArticleCover title={article.title} pillarSlug={article.pillarSlug} coverImage={article.coverImage} />

      <div className="p-5">
        {/* Type and difficulty */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="rounded-[2px] bg-ink/5 px-2.5 py-0.5 text-xs font-medium text-ink/70">
            {article.type}
          </span>
          <span className="rounded-[2px] bg-ink/5 px-2.5 py-0.5 text-xs text-ink/50">
            {article.difficulty}
          </span>
          {article.locked && (
            <span className="ml-auto flex items-center gap-1 text-xs text-ink/50" aria-label="Members only">
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
              </svg>
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-ink leading-snug mb-1">
          {article.title}
        </h3>
        <p className="text-sm text-ink/60 line-clamp-2 leading-relaxed mb-3">
          {article.subheadline}
        </p>

        {/* Footer */}
        <div className="flex items-center gap-3 text-xs text-ink/45">
          {author && (
            <>
              <div
                className="h-5 w-5 rounded-full flex items-center justify-center bg-ink text-[#EDE7DA] text-[10px] font-medium flex-shrink-0"
                aria-hidden="true"
              >
                {author.initials}
              </div>
              <span className="truncate">{author.name}</span>
              <span>·</span>
            </>
          )}
          <span>{article.readingTime} min</span>
          <span>·</span>
          <span>{article.jurisdiction}</span>
        </div>
      </div>
    </Link>
  );
}
