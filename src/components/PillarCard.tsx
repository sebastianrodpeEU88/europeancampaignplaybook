import Link from 'next/link';
import type { Pillar } from '@/types/content';
import { routes } from '@/lib/routes';
import { seriesForPillar, seriesHex } from '@/lib/pillarSeries';

export default function PillarCard({ pillar }: { pillar: Pillar }) {
  const topicCount = pillar.branches.reduce((n, b) => n + b.topics.length, 0);
  const series = seriesForPillar(pillar.slug);
  const accent = seriesHex(pillar.slug);

  return (
    <Link
      href={routes.pillar(pillar.slug)}
      className="group block rounded-[2px] bg-paper border border-rule/20 p-5 hover:border-rule/40 transition-colors duration-200 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
      style={accent ? { borderLeft: `4px solid ${accent}` } : undefined}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-ink leading-snug">
          {pillar.title}
        </h3>
        {pillar.isNew && (
          <span
            className="flex-shrink-0 rounded-[2px] px-2 py-0.5 text-xs font-medium text-[#EDE7DA]"
            style={{ backgroundColor: accent ?? '#111111' }}
          >
            New
          </span>
        )}
      </div>
      <p className="text-sm text-ink/60 leading-relaxed line-clamp-2 mb-3">
        {pillar.description}
      </p>
      <div className="flex items-center gap-3 text-xs text-ink/45">
        {series && (
          <span className="font-medium" style={{ color: accent ?? undefined }}>
            {series.number}
          </span>
        )}
        <span>{pillar.branches.length} branches</span>
        <span>·</span>
        <span>{topicCount} topics</span>
        <span className="ml-auto text-ink/45 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-150">
          →
        </span>
      </div>
    </Link>
  );
}
