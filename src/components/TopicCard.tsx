import Link from 'next/link';
import type { Topic, Pillar } from '@/types/content';
import { routes } from '@/lib/routes';
import { seriesHex } from '@/lib/pillarSeries';

export default function TopicCard({
  topic,
  pillar,
  articleCount,
}: {
  topic: Topic;
  pillar: Pillar;
  articleCount: number;
}) {
  const accent = seriesHex(pillar.slug);

  return (
    <Link
      href={routes.topic(topic.slug)}
      className="group block rounded-[2px] bg-paper border border-rule/20 p-4 hover:border-rule/40 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
    >
      <h4 className="text-sm font-medium text-ink mb-1">
        {topic.title}
      </h4>
      <p className="text-xs text-ink/60 leading-relaxed line-clamp-2 mb-2">
        {topic.description}
      </p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-ink/45">
          {articleCount} {articleCount === 1 ? 'article' : 'articles'}
        </span>
        <span
          className="text-xs font-medium text-ink/45"
          style={accent ? { color: accent } : undefined}
        >
          →
        </span>
      </div>
    </Link>
  );
}
