import Link from 'next/link';
import type { Article, Author, Pillar } from '@/types/content';
import { routes } from '@/lib/routes';

export default function ArticleCard({
  article,
  author,
  pillar,
}: {
  article: Article;
  author?: Author;
  pillar?: Pillar;
}) {
  return (
    <Link
      href={routes.article(article.slug)}
      className="group block rounded-2xl bg-white border border-[rgba(0,0,0,0.08)] p-5 hover:shadow-md transition-shadow duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5B35] focus-visible:ring-offset-2"
      style={pillar ? { borderLeft: `4px solid ${pillar.accentColour}` } : undefined}
    >
      {/* Type and difficulty */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className="rounded-full bg-[rgba(0,0,0,0.05)] px-2.5 py-0.5 text-xs font-medium text-[#7A6380]">
          {article.type}
        </span>
        <span className="rounded-full bg-[rgba(0,0,0,0.04)] px-2.5 py-0.5 text-xs text-[#A896AC]">
          {article.difficulty}
        </span>
        {article.locked && (
          <span className="ml-auto flex items-center gap-1 text-xs text-[#A896AC]" aria-label="Members only">
            <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
            </svg>
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="font-semibold text-[#2B0A2E] group-hover:text-[#4A1F4D] transition-colors leading-snug mb-1">
        {article.title}
      </h3>
      <p className="text-sm text-[#7A6380] line-clamp-2 leading-relaxed mb-3">
        {article.subheadline}
      </p>

      {/* Footer */}
      <div className="flex items-center gap-3 text-xs text-[#A896AC]">
        {author && (
          <>
            <div
              className="h-5 w-5 rounded-full flex items-center justify-center text-white text-[10px] font-medium flex-shrink-0"
              style={{ backgroundColor: author.avatarColour }}
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
    </Link>
  );
}
