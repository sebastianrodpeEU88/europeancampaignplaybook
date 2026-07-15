import Link from 'next/link';
import type { Article, Pillar } from '@/types/content';
import { routes } from '@/lib/routes';
import { seriesHex } from '@/lib/pillarSeries';

function Chip({
  children,
  colour,
}: {
  children: React.ReactNode;
  colour?: string | null;
}) {
  if (colour) {
    return (
      <span
        className="inline-flex items-center rounded-[2px] px-2.5 py-0.5 text-xs font-medium border"
        style={{
          backgroundColor: `${colour}18`,
          borderColor: `${colour}40`,
          color: colour,
        }}
      >
        {children}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-[2px] bg-ink/5 px-2.5 py-0.5 text-xs font-medium text-ink/70">
      {children}
    </span>
  );
}

export default function MetadataChips({
  article,
  pillar,
}: {
  article: Article;
  pillar?: Pillar;
}) {
  const pillarAccent = pillar ? seriesHex(pillar.slug) : null;

  return (
    <div className="flex flex-wrap gap-2 my-4">
      <Chip>{article.type}</Chip>
      <Chip>{article.difficulty}</Chip>
      <Chip>{article.jurisdiction}</Chip>
      <Chip>
        <svg className="mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {article.readingTime} min read
      </Chip>
      {pillar && (
        <Chip colour={pillarAccent}>{pillar.title}</Chip>
      )}
      {article.locked && (
        <span className="inline-flex items-center gap-1 rounded-[2px] bg-ink/5 px-2.5 py-0.5 text-xs font-medium text-ink/45">
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
          </svg>
          Members only
        </span>
      )}
      {article.trends?.map((trend) => (
        <Link
          key={trend.slug}
          href={routes.trend(trend.slug)}
          className="inline-flex items-center rounded-[2px] bg-navy px-2.5 py-0.5 text-xs font-medium text-[#EDE7DA] hover:bg-[#0A1D2B]/85 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
        >
          {trend.isFundamentals ? 'Fundamentals' : `#${trend.number}`}
        </Link>
      ))}
    </div>
  );
}
