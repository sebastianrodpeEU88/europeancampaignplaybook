import Image from 'next/image';
import type { PortableTextComponents } from '@portabletext/react';
import { urlForImage } from '@/sanity/image';

// Handles youtube.com/watch?v=, youtu.be/, youtube.com/embed/, and
// youtube.com/shorts/ URL forms.
function extractYoutubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

export const portableTextComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="text-ink/80 leading-relaxed mb-4">{children}</p>,
    h3: ({ children }) => <h3 className="display text-lg text-ink mt-6 mb-3">{children}</h3>,
    h4: ({ children }) => <h4 className="display text-base text-ink mt-5 mb-2">{children}</h4>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-ink pl-4 italic text-ink/70 my-4">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => <ul className="list-disc pl-5 mb-4 space-y-1 text-ink/80">{children}</ul>,
    number: ({ children }) => <ol className="list-decimal pl-5 mb-4 space-y-1 text-ink/80">{children}</ol>,
  },
  marks: {
    link: ({ value, children }) => (
      <a
        href={value?.href}
        className="text-ink underline hover:no-underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
  },
  types: {
    image: ({ value }) => {
      // Sanity asset refs encode dimensions (…-WIDTHxHEIGHT-ext). Portrait
      // images (e.g. a poster) show in full at a capped width so they aren't
      // sliced; landscape/square keep the existing 16:9 crop.
      const dims = (value?.asset?._ref || '').match(/-(\d+)x(\d+)-/);
      const w = dims ? Number(dims[1]) : 0;
      const h = dims ? Number(dims[2]) : 0;
      if (w && h && h > w) {
        return (
          <figure className="my-6">
            <Image
              src={urlForImage(value).width(900).url()}
              alt={value.alt || ''}
              width={w}
              height={h}
              sizes="(max-width: 768px) 100vw, 448px"
              className="mx-auto h-auto w-full max-w-md rounded-[2px]"
            />
            {value.caption && (
              <figcaption className="mt-2 text-sm text-ink/45 text-center">{value.caption}</figcaption>
            )}
          </figure>
        );
      }
      return (
        <figure className="my-6">
          <div className="relative w-full aspect-[16/9] overflow-hidden rounded-[2px] bg-ink/5">
            <Image
              src={urlForImage(value).width(1200).height(675).fit('crop').url()}
              alt={value.alt || ''}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          </div>
          {value.caption && (
            <figcaption className="mt-2 text-sm text-ink/45 text-center">{value.caption}</figcaption>
          )}
        </figure>
      );
    },
    youtubeEmbed: ({ value }) => {
      const videoId = extractYoutubeId(value.url);
      if (!videoId) return null;
      return (
        <figure className="my-6">
          <div className="relative w-full aspect-video overflow-hidden rounded-[2px] bg-navy">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${videoId}`}
              title={value.caption || 'YouTube video'}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          {value.caption && (
            <figcaption className="mt-2 text-sm text-ink/45 text-center">{value.caption}</figcaption>
          )}
        </figure>
      );
    },
    videoFile: ({ value }) => (
      <figure className="my-6">
        <video controls className="w-full rounded-[2px] bg-navy" src={value.url} />
        {value.caption && (
          <figcaption className="mt-2 text-sm text-ink/45 text-center">{value.caption}</figcaption>
        )}
      </figure>
    ),
  },
};
