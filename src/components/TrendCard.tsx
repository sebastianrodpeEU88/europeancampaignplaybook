import Link from 'next/link';
import type { Trend } from '@/types/content';
import { routes } from '@/lib/routes';

export default function TrendCard({ trend, articleCount }: { trend: Trend; articleCount: number }) {
  return (
    <Link
      href={routes.trend(trend.slug)}
      className="group block rounded-[2px] bg-navy p-5 hover:bg-[#0A1D2B]/90 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EDE7DA] focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className="text-2xl font-bold text-[#EDE7DA]">
          {trend.isFundamentals ? '—' : `#${trend.number}`}
        </span>
        <span className="text-xs text-[#EDE7DA]/50">
          {articleCount} {articleCount === 1 ? 'article' : 'articles'}
        </span>
      </div>
      <h3 className="font-semibold text-[#EDE7DA] transition-colors leading-snug mb-1">
        {trend.title}
      </h3>
      {trend.description && (
        <p className="text-sm text-[#EDE7DA]/60 line-clamp-2 leading-relaxed">{trend.description}</p>
      )}
    </Link>
  );
}
