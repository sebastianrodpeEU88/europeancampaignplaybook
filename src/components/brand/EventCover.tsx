import Image from 'next/image';
import type { SanityImageSource } from '@sanity/image-url';
import { urlForImage } from '@/sanity/image';
import MoveMark from '@/components/brand/MoveMark';

// Event cover: a real photo where an editor has supplied one, otherwise a
// generated cover in the brand's vocabulary (navy, the arrow mark, the
// title) — so text-only events still read as designed.
export default function EventCover({
  coverImage,
  title,
  variant = 'hero',
  className,
  dimmed = false,
}: {
  coverImage?: SanityImageSource | null;
  title: string;
  variant?: 'hero' | 'thumb';
  className?: string;
  dimmed?: boolean;
}) {
  const dim = dimmed ? 'grayscale opacity-70' : '';

  if (coverImage) {
    const w = variant === 'hero' ? 1200 : 160;
    const h = variant === 'hero' ? 525 : 160;
    return (
      <Image
        src={urlForImage(coverImage).width(w).height(h).fit('crop').url()}
        alt=""
        fill
        sizes={variant === 'hero' ? '(max-width: 768px) 100vw, 768px' : '80px'}
        className={`object-cover ${dim} ${className ?? ''}`}
        priority={variant === 'hero'}
      />
    );
  }

  if (variant === 'thumb') {
    return (
      <div className={`flex h-full w-full items-center justify-center bg-navy ${dim}`} aria-hidden="true">
        <MoveMark variant="arrow" className="h-7 w-7 text-[#EDE7DA]/80" />
      </div>
    );
  }

  return (
    <div
      className={`relative flex h-full w-full flex-col justify-between bg-navy p-6 ${dim}`}
      aria-hidden="true"
    >
      <MoveMark variant="arrow" className="h-8 w-8 text-[#EDE7DA]/70" />
      <p className="display text-2xl sm:text-3xl text-[#EDE7DA] leading-[0.95] line-clamp-3 max-w-lg">
        {title}
      </p>
    </div>
  );
}
