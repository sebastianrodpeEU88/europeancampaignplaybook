import Link from 'next/link';
import type { Article, Pillar } from '@/types/content';
import { routes } from '@/lib/routes';

function Chip({
  children,
  colour,
}: {
  children: React.ReactNode;
  colour?: string;
}) {
  if (colour) {
    return (
      <span
        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-mono font-medium border"
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
    <span className="inline-flex items-center rounded-full bg-[rgba(0,0,0,0.05)] px-2.5 py-0.5 text-xs font-mono font-medium text-[#7A6380]">
      {children}
    </span>
  );
}

const DIFFICULTY_COLOURS: Record<string, string> = {
  Beginner: '#3B6D11',
  Practitioner: '#FF5B35',
  Advanced: '#BA7517',
  Expert: '#A32D2D',
};

export default function MetadataChips({
  article,
  pillar,
}: {
  article: Article;
  pillar?: Pillar;
}) {
  const difficultyColour = DIFFICULTY_COLOURS[article.difficulty];

  return (
    <div className="flex flex-wrap gap-2 my-4">
      <Chip>{article.type}</Chip>
      <Chip colour={difficultyColour}>{article.difficulty}</Chip>
      <Chip>{article.jurisdiction}</Chip>
      <Chip>
        <svg className="mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {article.readingTime} min read
      </Chip>
      {pillar && (
        <Chip colour={pillar.accentColour}>{pillar.title}</Chip>
      )}
      {article.locked && (
        <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(0,0,0,0.05)] px-2.5 py-0.5 text-xs font-mono font-medium text-[#A896AC]">
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
          className="inline-flex items-center rounded-full bg-[#2B0A2E] px-2.5 py-0.5 text-xs font-mono font-medium text-[#C8F169] hover:bg-[#4A1F4D] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5B35]"
        >
          {trend.isFundamentals ? 'Fundamentals' : `#${trend.number}`}
        </Link>
      ))}
    </div>
  );
}
