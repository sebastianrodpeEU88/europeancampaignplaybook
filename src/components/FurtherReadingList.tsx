import Link from 'next/link';
import type { Article } from '@/types/content';

const rowClass =
  'flex items-center gap-3 rounded-[2px] border border-rule/20 bg-paper p-3 text-sm';

// Further reading rows. A row links out when the editor linked an article or
// gave a URL; without either it stays a plain row, as before.
export default function FurtherReadingList({ items }: { items: Article['furtherReading'] }) {
  if (!items.length) return null;
  return (
    <div className="my-6">
      <h2 className="display text-base text-ink mb-3">Further reading</h2>
      <ul className="space-y-2">
        {items.map((item, i) => {
          const content = (
            <>
              {item.type && (
                <span className="rounded-[2px] bg-ink/5 px-2 py-0.5 text-xs text-ink/60 flex-shrink-0">
                  {item.type}
                </span>
              )}
              <span className="text-ink/80 flex-1 group-hover:text-ink group-hover:underline">{item.title}</span>
              {item.readingTime ? (
                <span className="text-xs text-ink/45 flex-shrink-0">{item.readingTime} min</span>
              ) : null}
              {item.href && (
                <span className="text-[#dd3c13] flex-shrink-0" aria-hidden="true">
                  →
                </span>
              )}
            </>
          );
          if (!item.href) {
            return (
              <li key={i} className={rowClass}>
                {content}
              </li>
            );
          }
          const linkClass = `group ${rowClass} hover:border-[#dd3c13] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dd3c13]`;
          return (
            <li key={i}>
              {/^https?:\/\//.test(item.href) ? (
                <a href={item.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  {content}
                </a>
              ) : (
                <Link href={item.href} className={linkClass}>
                  {content}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
