import Link from 'next/link';
import type { Pillar } from '@/types/content';
import { routes } from '@/lib/routes';

export default function PillarCard({ pillar }: { pillar: Pillar }) {
  const topicCount = pillar.branches.reduce((n, b) => n + b.topics.length, 0);

  return (
    <Link
      href={routes.pillar(pillar.slug)}
      className="group block rounded-2xl bg-white border border-[rgba(0,0,0,0.08)] p-5 hover:shadow-md transition-shadow duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5B35] focus-visible:ring-offset-2"
      style={{ borderLeft: `4px solid ${pillar.accentColour}` }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-[#2B0A2E] group-hover:text-[#4A1F4D] transition-colors leading-snug">
          {pillar.title}
        </h3>
        {pillar.isNew && (
          <span
            className="flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium text-white"
            style={{ backgroundColor: pillar.accentColour }}
          >
            New
          </span>
        )}
      </div>
      <p className="text-sm text-[#7A6380] leading-relaxed line-clamp-2 mb-3">
        {pillar.description}
      </p>
      <div className="flex items-center gap-3 text-xs text-[#A896AC]">
        <span>{pillar.branches.length} branches</span>
        <span>·</span>
        <span>{topicCount} topics</span>
        <span className="ml-auto text-[#A896AC] group-hover:translate-x-0.5 transition-transform duration-150">
          →
        </span>
      </div>
    </Link>
  );
}
