'use client';

import { useEffect, useRef } from 'react';

// A living, premium treatment of the ECP move mark — hero-only. The plain
// currentColor MoveMark still drives the header, footer, cards, etc.; this
// one layers continuous particle drift, breathing pulses, a light-sheen
// sweep across the arrow, an ambient glow, and cursor parallax for depth.
// On top of that continuous motion, the first paint is a one-time staged
// entrance — dispersed field, then gathering pulses, then the arrow
// resolving upward last — telling the "disperse → clear direction" story
// the brand describes, rather than presenting all three at once.
// Everything is gated behind prefers-reduced-motion (see globals.css);
// parallax additionally skips touch devices. Geometry matches the fixed,
// de-overlapped mark — the field is scattered clear of the pulses.
const DOTS = [
  { x: 24, y: 222, s: 12 },
  { x: 43, y: 229, s: 11 },
  { x: 62, y: 220, s: 11 },
  { x: 34, y: 206, s: 11 },
  { x: 53, y: 212, s: 10 },
  { x: 72, y: 202, s: 10 },
  { x: 44, y: 191, s: 10 },
  { x: 63, y: 197, s: 10 },
  { x: 80, y: 186, s: 10 },
  { x: 55, y: 177, s: 9 },
  { x: 71, y: 181, s: 9 },
  { x: 87, y: 171, s: 9 },
  { x: 66, y: 164, s: 9 },
  { x: 81, y: 167, s: 8 },
  { x: 94, y: 158, s: 8 },
  { x: 76, y: 152, s: 8 },
  { x: 89, y: 154, s: 7 },
];

const ARROW = 'M166 67 184 85 214 55v27h24V14h-68v24h28z';

// Deterministic 0..1 from an index — stable across SSR/hydration (never
// Math.random, which would mismatch), varied enough to feel organic.
function seeded(i: number, salt: number): number {
  const v = Math.sin((i + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return v - Math.floor(v);
}

export default function HeroMark({
  className,
  title,
}: {
  className?: string;
  title?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(hover: hover)').matches) return;

    let raf = 0;
    let targetX = 0;
    let targetY = 0;
    let curX = 0;
    let curY = 0;

    function tick() {
      raf = 0;
      curX += (targetX - curX) * 0.08;
      curY += (targetY - curY) * 0.08;
      el!.style.setProperty('--px', curX.toFixed(3));
      el!.style.setProperty('--py', curY.toFixed(3));
      if (Math.abs(targetX - curX) > 0.001 || Math.abs(targetY - curY) > 0.001) {
        raf = requestAnimationFrame(tick);
      }
    }

    function onMove(e: MouseEvent) {
      const r = el!.getBoundingClientRect();
      // Sample from the whole viewport so the mark reacts to broad cursor
      // movement, not just when the pointer is directly over it.
      targetX = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2)));
      targetY = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2)));
      if (!raf) raf = requestAnimationFrame(tick);
    }

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const a11y = title
    ? { role: 'img' as const, 'aria-label': title }
    : { 'aria-hidden': true as const };

  return (
    <div ref={ref} className={`hero-mark ${className ?? ''}`}>
      <svg viewBox="0 0 256 256" className="hero-mark-svg" {...a11y}>
        <defs>
          <radialGradient id="hero-glow" cx="0.72" cy="0.3" r="0.62">
            <stop offset="0" stopColor="#EDE7DA" stopOpacity="0.18" />
            <stop offset="0.6" stopColor="#EDE7DA" stopOpacity="0.04" />
            <stop offset="1" stopColor="#EDE7DA" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="hero-arrow-fill" x1="0.1" y1="0" x2="0.6" y2="1">
            <stop offset="0" stopColor="#F6F1E7" />
            <stop offset="1" stopColor="#D6CFC0" />
          </linearGradient>
          <linearGradient id="hero-sheen" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0.65" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
          <clipPath id="hero-arrow-clip">
            <path d={ARROW} />
          </clipPath>
        </defs>

        {/* Ambient glow lifting the mark off the navy field */}
        <rect className="hero-glow" x="0" y="0" width="256" height="256" fill="url(#hero-glow)" />

        <g className="hero-float">
          {/* Drifting particle field — parallax layer (moves most) */}
          <g className="hero-field" fill="#EDE7DA">
            {DOTS.map((d, i) => (
              <rect
                key={i}
                className="hero-particle"
                x={d.x}
                y={d.y}
                width={d.s}
                height={d.s}
                style={{
                  animationDuration: `${(4.6 + seeded(i, 1) * 3.4).toFixed(2)}s`,
                  // Short entrance-scale stagger (under ~1s) so the field
                  // reads as materializing quickly, before pulses/arrow
                  // follow — the long variety lives in duration above,
                  // which keeps each dot's later loop cycles organic.
                  animationDelay: `${(seeded(i, 2) * 0.9).toFixed(2)}s`,
                }}
              />
            ))}
          </g>

          {/* Momentum pulses — breathe, parallax layer (moves some) */}
          <g className="hero-pulses" fill="#EDE7DA">
            <rect className="hero-pulse" x="110" y="128" width="10" height="22" transform="rotate(-45 115 139)" style={{ animationDelay: '0s' }} />
            <rect className="hero-pulse" x="129" y="109" width="11" height="23" transform="rotate(-45 134.5 120.5)" style={{ animationDelay: '0.3s' }} />
            <rect className="hero-pulse" x="148" y="89" width="12" height="25" transform="rotate(-45 154 101.5)" style={{ animationDelay: '0.6s' }} />
          </g>

          {/* Solid arrow with gradient + light sheen — parallax layer (moves
              least). Entrance (fade + slide up) lives on this outer wrapper
              so it doesn't collide with .hero-arrow's own parallax
              transform on the inner group. */}
          <g className="hero-arrow-in">
            <g className="hero-arrow">
              <g clipPath="url(#hero-arrow-clip)">
                <path d={ARROW} fill="url(#hero-arrow-fill)" />
                <rect className="hero-sheen" x="150" y="-12" width="26" height="132" fill="url(#hero-sheen)" />
              </g>
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}
