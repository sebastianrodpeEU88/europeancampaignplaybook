'use client';

import { useEffect, useState } from 'react';

type TocItem = { id: string; label: string; number: string | null };

// Number scheme mirrors the in-body folio numerals exactly (see the
// fullSections rendering in the article page and GatedArticleSections):
// the preview section reads as "Overview", full sections as 01, 02, 03…
// Derived straight from element id, so no extra data needs threading
// through props — just the `data-toc-heading` marker on each <h2>.
function numberFor(id: string): string | null {
  const match = id.match(/^section-(\d+)$/);
  return match ? String(Number(match[1]) + 1).padStart(2, '0') : null;
}

function labelFor(id: string, text: string): string {
  return id.startsWith('preview-section-') ? 'Overview' : text;
}

// Scans [data-article-root] for [data-toc-heading] elements — including
// ones GatedArticleSections mounts client-side after a live paywall check,
// which a MutationObserver picks up as they appear — and tracks which is
// currently in view to highlight it (a plain scroll-position "scrollspy",
// not IntersectionObserver, since we need one clear "last heading passed"
// answer rather than a set of overlapping visibility ratios).
export default function ArticleTOC({ color }: { color: string }) {
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const root = document.querySelector('[data-article-root]');
    if (!root) return;

    function collect() {
      const headings = [...root!.querySelectorAll<HTMLElement>('[data-toc-heading]')];
      setItems(
        headings.map((h) => ({
          id: h.id,
          label: labelFor(h.id, h.textContent ?? ''),
          number: numberFor(h.id),
        }))
      );
    }

    collect();
    const observer = new MutationObserver(() => collect());
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (items.length === 0) return;

    let raf = 0;
    function measure() {
      raf = 0;
      const offset = 90; // clears the sticky header + progress bar
      let current = items[0].id;
      for (const item of items) {
        const el = document.getElementById(item.id);
        if (el && el.getBoundingClientRect().top - offset <= 0) {
          current = item.id;
        } else {
          break;
        }
      }
      setActiveId(current);
    }
    function onScroll() {
      if (!raf) raf = requestAnimationFrame(measure);
    }

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [items]);

  if (items.length < 2) return null;

  return (
    <nav aria-label="Table of contents" className="rounded-[2px] border border-rule/20 bg-paper p-4 mb-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-ink/45 mb-3">
        In this article
      </p>
      <ul className="space-y-1">
        {items.map((item) => {
          const isActive = item.id === activeId;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={isActive ? 'true' : undefined}
                className="flex items-baseline gap-2 rounded-[2px] px-2 py-1 text-xs transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
                style={{
                  color: isActive ? color : undefined,
                  backgroundColor: isActive ? 'color-mix(in srgb, currentColor 8%, transparent)' : undefined,
                }}
              >
                {item.number && (
                  <span className="flex-shrink-0 text-[10px] text-ink/35 tabular-nums" style={isActive ? { color } : undefined}>
                    {item.number}
                  </span>
                )}
                <span className={isActive ? 'font-medium' : 'text-ink/65'}>{item.label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
