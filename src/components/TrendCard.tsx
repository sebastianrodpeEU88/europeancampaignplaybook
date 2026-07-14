import Link from 'next/link';
import type { Trend } from '@/types/content';
import { routes } from '@/lib/routes';

export default function TrendCard({ trend, articleCount }: { trend: Trend; articleCount: number }) {
  return (
    <Link
      href={routes.trend(trend.slug)}
      className="group block rounded-2xl bg-[#2B0A2E] p-5 hover:shadow-lg transition-shadow duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5B35] focus-visible:ring-offset-2"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className="font-mono text-2xl font-bold text-[#C8F169]">
          {trend.isFundamentals ? '—' : `#${trend.number}`}
        </span>
        <span className="text-xs font-mono text-[#C9B3CC]">
          {articleCount} {articleCount === 1 ? 'article' : 'articles'}
        </span>
      </div>
      <h3 className="font-semibold text-[#FDF6EC] group-hover:text-white transition-colors leading-snug mb-1">
        {trend.title}
      </h3>
      {trend.description && (
        <p className="text-sm text-[#C9B3CC] line-clamp-2 leading-relaxed">{trend.description}</p>
      )}
    </Link>
  );
}
