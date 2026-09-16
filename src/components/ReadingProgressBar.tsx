'use client';

import { useEffect, useState } from 'react';

// Bar pinned directly under the sticky header, filling in the brand orange
// as the reader moves through [data-article-root]. The same colour on every
// article: pillar-series colours were easy to miss on the darker series.
// Progress is 0 with the article top at the viewport top, 100 once its
// bottom has scrolled past.
export default function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const article = document.querySelector('[data-article-root]');
    if (!article) return;

    let raf = 0;
    function measure() {
      raf = 0;
      const rect = article!.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      if (total <= 0) {
        setProgress(rect.top <= 0 ? 100 : 0);
        return;
      }
      const scrolled = -rect.top;
      setProgress(Math.min(100, Math.max(0, (scrolled / total) * 100)));
    }
    function onScrollOrResize() {
      if (!raf) raf = requestAnimationFrame(measure);
    }

    measure();
    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize);
    return () => {
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      className="sticky top-16 z-30 h-[5px] w-full bg-ink/10"
      role="progressbar"
      aria-label="Reading progress"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="h-full bg-[#dd3c13]" style={{ width: `${progress}%` }} />
    </div>
  );
}
