import Image from 'next/image';
import type { SanityImageSource } from '@sanity/image-url';
import { urlForImage } from '@/sanity/image';
import { seriesForPillar, seriesHex } from '@/lib/pillarSeries';
import MoveMark from '@/components/brand/MoveMark';

// Every article gets a cover — a real photo where an editor has supplied
// one, otherwise a generated cover in the brand's own vocabulary (series
// colour, the arrow mark, and display type), never a stock image or a
// hand-drawn substitute for the move mark.
export default function ArticleCover({
  title,
  pillarSlug,
  coverImage,
  priority = false,
}: {
  title: string;
  pillarSlug: string;
  coverImage?: SanityImageSource | null;
  priority?: boolean;
}) {
  if (coverImage) {
    return (
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[2px] bg-navy">
        <Image
          src={urlForImage(coverImage).width(1200).height(675).fit('crop').url()}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 768px"
          className="object-cover"
          priority={priority}
        />
        <MoveMark
          variant="arrow"
          className="absolute top-3 right-3 h-6 w-6 text-[#EDE7DA] drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </div>
    );
  }

  const series = seriesForPillar(pillarSlug);
  const accent = seriesHex(pillarSlug);

  return (
    <div
      className="relative aspect-[16/9] w-full overflow-hidden rounded-[2px] flex flex-col justify-between p-5"
      style={{ backgroundColor: accent ?? '#0A1D2B' }}
      aria-hidden="true"
    >
      <div className="flex items-start justify-between">
        {series ? (
          <span className="text-xs font-medium text-[#EDE7DA]/60">{series.number}</span>
        ) : (
          <span />
        )}
        <MoveMark
          variant="arrow"
          className="h-6 w-6 text-[#EDE7DA]/70 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </div>
      <p className="display text-xl sm:text-2xl text-[#EDE7DA] leading-[0.95] line-clamp-3 transition-transform duration-200 group-hover:-translate-y-0.5">
        {title}
      </p>
    </div>
  );
}
