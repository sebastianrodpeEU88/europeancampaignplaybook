import Image from 'next/image';
import {
  PortableText,
  type PortableTextComponents,
  type PortableTextMarkComponent,
} from '@portabletext/react';
import { urlForImage } from '@/sanity/image';
import CopyPromptButton from '@/components/CopyPromptButton';

const LinkMark: PortableTextMarkComponent<{ _type: 'link'; href?: string }> = ({ value, children }) => (
  <a
    href={value?.href}
    className="text-ink underline hover:no-underline"
    target="_blank"
    rel="noopener noreferrer"
  >
    {children}
  </a>
);

// A note sits inline inside its list item, so its paragraph must not bring
// the body-text margins with it.
const noteComponents: PortableTextComponents = {
  block: { normal: ({ children }) => <>{children}</> },
  marks: { link: LinkMark },
};

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
    link: LinkMark,
    // Superscript note number pointing down to its entry in the Notes block.
    footnoteRef: ({ value, children }) => {
      const n = value?.number;
      if (!n) return <>{children}</>;
      return (
        <sup id={`ref-${n}`} className="scroll-mt-24 leading-none">
          <a
            href={`#note-${n}`}
            aria-label={`Note ${n}`}
            className="px-px font-semibold text-[#dd3c13] no-underline hover:underline"
          >
            {children}
          </a>
        </sup>
      );
    },
  },
  types: {
    // Numbered notes at the end of an article. Each entry links back up to the
    // sentence citing it, which keeps source references out of the prose.
    footnotes: ({ value }) => {
      const notes = value?.notes ?? [];
      if (!notes.length) return null;
      return (
        <aside aria-label={value?.title || 'Notes'} className="mt-10 border-t border-rule/15 pt-6">
          <h2 className="display text-base text-ink mb-3">{value?.title || 'Notes'}</h2>
          <ol className="space-y-1.5">
            {notes.map((note: { _type: string; _key?: string }, i: number) => (
              <li
                key={note._key ?? i}
                id={`note-${i + 1}`}
                className="scroll-mt-24 flex gap-2 rounded-[2px] text-sm text-ink/60 leading-relaxed target:bg-[#dd3c13]/[0.08]"
              >
                {/* Fixed-width, right-aligned so notes 10+ line up with 1-9. */}
                <span className="w-6 flex-shrink-0 text-right tabular-nums text-ink/45">{i + 1}.</span>
                <span className="min-w-0">
                  {/* Non-breaking space keeps the back-link from wrapping onto a line of its own. */}
                  <PortableText value={note} components={noteComponents} />{' '}
                  <a
                    href={`#ref-${i + 1}`}
                    aria-label={`Back to reference ${i + 1}`}
                    className="text-ink/45 no-underline hover:text-ink"
                  >
                    {'↩︎'}
                  </a>
                </span>
              </li>
            ))}
          </ol>
        </aside>
      );
    },
    image: ({ value }) => {
      // Sanity asset refs encode dimensions (…-WIDTHxHEIGHT-ext). Portrait
      // images (e.g. a poster) show in full at a capped width so they aren't
      // sliced; landscape/square keep the existing 16:9 crop.
      const dims = (value?.asset?._ref || '').match(/-(\d+)x(\d+)-/);
      const w = dims ? Number(dims[1]) : 0;
      const h = dims ? Number(dims[2]) : 0;
      // Small images (a trainer's photo, say) show whole at a modest size.
      if (value?.size === 'small' && w && h) {
        return (
          <figure className="my-6">
            <Image
              src={urlForImage(value).width(Math.min(w, 480)).url()}
              alt={value.alt || ''}
              width={w}
              height={h}
              sizes="240px"
              className="h-auto w-full max-w-[240px] rounded-[2px]"
            />
            {value.caption && <figcaption className="mt-2 text-sm text-ink/45">{value.caption}</figcaption>}
          </figure>
        );
      }
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
      // Shorts are 9:16 — in a 16:9 frame they end up as a sliver between two
      // black pillars, so give them a portrait frame at a capped width.
      const isShort = /\/shorts\//.test(value.url as string);
      const frame = isShort
        ? 'relative mx-auto w-full max-w-[330px] aspect-[9/16]'
        : 'relative w-full aspect-video';
      return (
        <figure className="my-6">
          <div className={`${frame} overflow-hidden rounded-[2px] bg-navy`}>
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
    // Copyable prompt. Hands-on episodes put each prompt where it is explained,
    // so readers copy it in place instead of hunting for it in a pack at the end.
    promptBlock: ({ value }) =>
      value?.prompt ? (
        <figure className="my-6 overflow-hidden rounded-[2px] border border-rule/20 bg-[#F7F4EE]">
          <div className="flex items-center justify-between gap-3 bg-navy px-4 py-2">
            <figcaption className="text-xs font-semibold uppercase tracking-wider text-[#EDE7DA]">
              {value.label || 'Prompt'}
            </figcaption>
            <CopyPromptButton text={value.prompt} />
          </div>
          <pre className="whitespace-pre-wrap break-words px-4 py-4 font-sans text-sm leading-relaxed text-ink">
            {value.prompt}
          </pre>
          {value.note && (
            <p className="border-t border-rule/15 px-4 py-2 text-xs text-ink/55">{value.note}</p>
          )}
        </figure>
      ) : null,
    // Highlighted one-liner. Explainers end each definition on one of these so
    // a reader skimming the page still leaves with the gist of every term.
    callout: ({ value }) =>
      value?.text ? (
        <aside className="my-6 rounded-[2px] border-l-4 border-[#dd3c13] bg-[#F7F4EE] px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#dd3c13] mb-1">
            {value.label || 'In simple terms'}
          </p>
          <p className="text-lg font-medium text-ink leading-snug">{value.text}</p>
        </aside>
      ) : null,
    // Highlighted downloads block — the worksheets are the point of a bootcamp
    // episode, so they get a card rather than an inline link in a paragraph.
    downloads: ({ value }) => {
      const items = value?.items ?? [];
      if (!items.length) return null;
      return (
        <aside className="my-8 rounded-[2px] border border-[#dd3c13]/30 bg-[#F7F4EE] overflow-hidden">
          <div className="bg-[#dd3c13] px-5 py-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#EDE7DA]">
              {value?.title || 'Downloads'}
            </p>
          </div>
          <ul className="divide-y divide-rule/12">
            {items.map(
              (
                item: { label?: string; description?: string; pdfHref?: string; docxHref?: string },
                i: number
              ) => (
                <li
                  key={i}
                  className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-ink">{item.label}</p>
                    {item.description && (
                      <p className="text-sm text-ink/60 leading-relaxed">{item.description}</p>
                    )}
                  </div>
                  <div className="flex flex-shrink-0 gap-2">
                    {item.pdfHref && (
                      <a
                        href={item.pdfHref}
                        download
                        className="rounded-[2px] bg-navy px-3 py-1.5 text-xs font-semibold text-[#EDE7DA] hover:bg-[#0A1D2B]/85 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
                      >
                        PDF
                      </a>
                    )}
                    {item.docxHref && (
                      <a
                        href={item.docxHref}
                        download
                        className="rounded-[2px] border border-navy/30 px-3 py-1.5 text-xs font-semibold text-navy hover:bg-navy/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
                      >
                        Word
                      </a>
                    )}
                  </div>
                </li>
              )
            )}
          </ul>
          {value?.note && (
            <p className="border-t border-rule/12 px-5 py-3 text-xs text-ink/55">{value.note}</p>
          )}
        </aside>
      );
    },
    // Branded data table — matches the key-framework table styling.
    table: ({ value }) => {
      const columns = value?.columns ?? [];
      const rows = value?.rows ?? [];
      if (!rows.length) return null;
      return (
        <figure className="my-6">
          {value?.caption && (
            <figcaption className="text-xs font-semibold uppercase tracking-wider text-ink/45 mb-2">
              {value.caption}
            </figcaption>
          )}
          <div className="overflow-x-auto rounded-[2px] border border-rule/20 bg-paper">
            <table className="w-full text-sm">
              {columns.length > 0 && (
                <thead>
                  <tr className="border-b border-rule/20">
                    {columns.map((c: string, i: number) => (
                      <th
                        key={i}
                        className="px-4 py-3 text-left text-xs font-semibold text-ink/45 uppercase tracking-wider"
                      >
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody className="divide-y divide-rule/10">
                {rows.map((row: { cells?: string[] }, i: number) => (
                  <tr key={i} className="hover:bg-ink/[0.02]">
                    {(row.cells ?? []).map((cell: string, j: number) => (
                      <td
                        key={j}
                        className={
                          j === 0
                            ? 'px-4 py-3 font-medium text-ink align-top'
                            : 'px-4 py-3 text-ink/80 align-top'
                        }
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </figure>
      );
    },
  },
};
