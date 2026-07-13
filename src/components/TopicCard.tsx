import Link from 'next/link';
import type { Topic, Pillar } from '@/types/content';
import { routes } from '@/lib/routes';

export default function TopicCard({
  topic,
  pillar,
  articleCount,
}: {
  topic: Topic;
  pillar: Pillar;
  articleCount: number;
}) {
  return (
    <Link
      href={routes.topic(topic.slug)}
      className="group block rounded-xl bg-white border border-[rgba(0,0,0,0.08)] p-4 hover:shadow-sm transition-shadow duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5B35] focus-visible:ring-offset-2"
    >
      <h4 className="text-sm font-medium text-[#2B0A2E] group-hover:text-[#4A1F4D] transition-colors mb-1">
        {topic.title}
      </h4>
      <p className="text-xs text-[#7A6380] leading-relaxed line-clamp-2 mb-2">
        {topic.description}
      </p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#A896AC]">
          {articleCount} {articleCount === 1 ? 'article' : 'articles'}
        </span>
        <span
          className="text-xs font-medium"
          style={{ color: pillar.accentColour }}
        >
          →
        </span>
      </div>
    </Link>
  );
}
