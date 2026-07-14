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
    normal: ({ children }) => <p className="text-[#4A1F4D] leading-relaxed mb-4">{children}</p>,
    h3: ({ children }) => <h3 className="text-lg font-bold text-[#2B0A2E] mt-6 mb-3">{children}</h3>,
    h4: ({ children }) => <h4 className="text-base font-bold text-[#2B0A2E] mt-5 mb-2">{children}</h4>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-[rgba(0,0,0,0.1)] pl-4 italic text-[#7A6380] my-4">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => <ul className="list-disc pl-5 mb-4 space-y-1 text-[#4A1F4D]">{children}</ul>,
    number: ({ children }) => <ol className="list-decimal pl-5 mb-4 space-y-1 text-[#4A1F4D]">{children}</ol>,
  },
  marks: {
    link: ({ value, children }) => (
      <a
        href={value?.href}
        className="text-[#FF5B35] hover:underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
  },
  types: {
    image: ({ value }) => (
      <figure className="my-6">
        <div className="relative w-full aspect-[16/9] overflow-hidden rounded-xl bg-[#FDF6EC]">
          <Image
            src={urlForImage(value).width(1200).height(675).fit('crop').url()}
            alt={value.alt || ''}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
          />
        </div>
        {value.caption && (
          <figcaption className="mt-2 text-sm text-[#A896AC] text-center">{value.caption}</figcaption>
        )}
      </figure>
    ),
    youtubeEmbed: ({ value }) => {
      const videoId = extractYoutubeId(value.url);
      if (!videoId) return null;
      return (
        <figure className="my-6">
          <div className="relative w-full aspect-video overflow-hidden rounded-xl bg-[#2B0A2E]">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${videoId}`}
              title={value.caption || 'YouTube video'}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          {value.caption && (
            <figcaption className="mt-2 text-sm text-[#A896AC] text-center">{value.caption}</figcaption>
          )}
        </figure>
      );
    },
    videoFile: ({ value }) => (
      <figure className="my-6">
        <video controls className="w-full rounded-xl bg-black" src={value.url} />
        {value.caption && (
          <figcaption className="mt-2 text-sm text-[#A896AC] text-center">{value.caption}</figcaption>
        )}
      </figure>
    ),
  },
};
