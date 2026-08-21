'use client';

import { useEffect, useRef } from 'react';

// An animated "play" being chalked out — homepage hero only, a literal take on
// the brand name. Markers (the team's O's, the opposition's X's) appear, then
// routes draw themselves across the board, and the primary route sweeps up the
// north-east diagonal and resolves into the ECP arrow — the play "built to
// move." It loops: draw, hold, wipe, redraw. Paper chalk on the navy hero.
// Reduced-motion shows one still, fully-drawn play. Cursor gives gentle
// parallax. The plain currentColor MoveMark still drives header/footer/cards.

const PAPER = '10, 29, 43'; // navy #0A1D2B (homepage hero is orange)

// The ECP arrow the primary route resolves into (256×256 logical space).
// Reordered to start at the vertex where the primary route arrives (184, 85),
// so the chalk outline traces on from the route rather than appearing separate.
const ARROW: [number, number][] = [
  [184, 85], [214, 55], [214, 82], [238, 82], [238, 14],
  [170, 14], [170, 38], [198, 38], [166, 67],
];

// Timeline (seconds). Slow, deliberate chalking, then a long fully-drawn hold.
const T = 13.0;
const FADE_START = 10.8;
const FADE_DUR = 1.8;

// Formation.
const OLINE: [number, number][] = [[84, 158], [112, 158], [140, 158], [168, 158]];
const BACK: [number, number] = [128, 188];
const XS: [number, number][] = [[98, 116], [134, 112], [170, 116]];

// Routes as cubic Béziers: [p0, c1, c2, p3]. The primary sweeps into the arrow.
const PRIMARY: [number, number][] = [[128, 188], [172, 182], [198, 120], [184, 86]];
const SECONDARY: [number, number][] = [[84, 158], [60, 152], [52, 132], [64, 120]];

function clamp(v: number, a: number, b: number) {
  return v < a ? a : v > b ? b : v;
}
function easeOut(t: number) {
  const u = 1 - t;
  return 1 - u * u * u;
}
function cubic(pts: [number, number][], t: number): [number, number] {
  const u = 1 - t;
  const a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
  return [
    a * pts[0][0] + b * pts[1][0] + c * pts[2][0] + d * pts[3][0],
    a * pts[0][1] + b * pts[1][1] + c * pts[2][1] + d * pts[3][1],
  ];
}
// Sample a bézier into a jittered polyline for a hand-chalked feel (jitter is
// baked once, so it's stable across frames — no flicker).
function sampleRoute(pts: [number, number][], n = 26): [number, number][] {
  const out: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const [x, y] = cubic(pts, i / n);
    const j = i === 0 || i === n ? 0 : (Math.random() - 0.5) * 1.6;
    // perpendicular-ish jitter is overkill; a small isotropic wobble reads fine
    out.push([x + j, y + (Math.random() - 0.5) * 1.6 * (i === 0 || i === n ? 0 : 1)]);
  }
  return out;
}
// Sample a closed polygon (the arrow) into a jittered polyline — corners kept
// crisp so the shape stays recognizable, edges lightly waved for a chalk feel.
function sampleClosed(verts: [number, number][], perEdge = 4): [number, number][] {
  const out: [number, number][] = [];
  const n = verts.length;
  for (let i = 0; i < n; i++) {
    const a = verts[i];
    const b = verts[(i + 1) % n];
    for (let s = 0; s < perEdge; s++) {
      const t = s / perEdge;
      const j = s === 0 ? 0 : (Math.random() - 0.5) * 1.1; // corners crisp
      out.push([a[0] + (b[0] - a[0]) * t + j, a[1] + (b[1] - a[1]) * t + j]);
    }
  }
  out.push([verts[0][0], verts[0][1]]); // close
  return out;
}

export default function HeroPlay({
  className,
  title,
}: {
  className?: string;
  title?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canHover = window.matchMedia('(hover: hover)').matches;

    const primary = sampleRoute(PRIMARY);
    const secondary = sampleRoute(SECONDARY);
    const arrowLine = sampleClosed(ARROW);

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let cssSize = 0;
    let k = 1;
    function resize() {
      const rect = container!.getBoundingClientRect();
      cssSize = Math.max(1, rect.width);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.round(cssSize * dpr);
      canvas!.height = Math.round(cssSize * dpr);
      k = cssSize / 256;
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    let pointerTX = 0, pointerTY = 0, pointerX = 0, pointerY = 0;
    function onPointer(e: PointerEvent) {
      pointerTX = clamp((e.clientX - window.innerWidth / 2) / (window.innerWidth / 2), -1, 1);
      pointerTY = clamp((e.clientY - window.innerHeight / 2) / (window.innerHeight / 2), -1, 1);
    }
    if (canHover && !reduced) window.addEventListener('pointermove', onPointer, { passive: true });

    // Alpha for an element that appears at `at` (over `dur`) then holds, then
    // fades with the whole play at the end of the loop.
    function vis(e: number, at: number, dur: number) {
      const rise = clamp((e - at) / dur, 0, 1);
      const fall = 1 - clamp((e - FADE_START) / FADE_DUR, 0, 1);
      return rise * fall;
    }

    function chalk(alpha: number, width = 2.3) {
      ctx!.strokeStyle = `rgba(${PAPER}, ${clamp(alpha, 0, 1)})`;
      ctx!.lineWidth = width;
      ctx!.lineCap = 'round';
      ctx!.lineJoin = 'round';
    }

    function drawO(cx: number, cy: number, r: number, alpha: number) {
      if (alpha <= 0.01) return;
      chalk(alpha, 2.4);
      ctx!.beginPath();
      ctx!.arc(cx, cy, r, 0, Math.PI * 2);
      ctx!.stroke();
    }

    function drawX(cx: number, cy: number, s: number, alpha: number) {
      if (alpha <= 0.01) return;
      chalk(alpha, 2.4);
      ctx!.beginPath();
      ctx!.moveTo(cx - s, cy - s); ctx!.lineTo(cx + s, cy + s);
      ctx!.moveTo(cx + s, cy - s); ctx!.lineTo(cx - s, cy + s);
      ctx!.stroke();
    }

    // Draw a sampled polyline up to `progress` (0..1) of its length.
    function drawRoute(pts: [number, number][], progress: number, alpha: number, width = 2.5) {
      if (alpha <= 0.01 || progress <= 0) return;
      let total = 0;
      for (let i = 1; i < pts.length; i++) {
        total += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      }
      let budget = progress * total;
      chalk(alpha, width);
      ctx!.beginPath();
      ctx!.moveTo(pts[0][0], pts[0][1]);
      let endX = pts[0][0], endY = pts[0][1], endAng = 0;
      for (let i = 1; i < pts.length; i++) {
        const segLen = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
        if (budget >= segLen) {
          ctx!.lineTo(pts[i][0], pts[i][1]);
          endX = pts[i][0]; endY = pts[i][1];
          endAng = Math.atan2(pts[i][1] - pts[i - 1][1], pts[i][0] - pts[i - 1][0]);
          budget -= segLen;
        } else {
          const f = budget / segLen;
          endX = pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f;
          endY = pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f;
          endAng = Math.atan2(pts[i][1] - pts[i - 1][1], pts[i][0] - pts[i - 1][0]);
          ctx!.lineTo(endX, endY);
          break;
        }
      }
      ctx!.stroke();
      return { x: endX, y: endY, ang: endAng };
    }

    function drawChalkArrowhead(x: number, y: number, ang: number, alpha: number) {
      if (alpha <= 0.01) return;
      const h = 7;
      chalk(alpha, 2.5);
      ctx!.beginPath();
      ctx!.moveTo(x, y);
      ctx!.lineTo(x + Math.cos(ang + Math.PI - 0.5) * h, y + Math.sin(ang + Math.PI - 0.5) * h);
      ctx!.moveTo(x, y);
      ctx!.lineTo(x + Math.cos(ang + Math.PI + 0.5) * h, y + Math.sin(ang + Math.PI + 0.5) * h);
      ctx!.stroke();
    }

    // The arrow chalks itself in as an outline (traced from the vertex where
    // the primary route arrives), a touch heavier than the O's/X's so it reads
    // as the play's focal point while still sharing their hand-drawn chalk
    // language — no solid block that stands apart from the rest.
    function drawArrow(progress: number, alpha: number) {
      drawRoute(arrowLine, progress, alpha, 3);
    }

    function drawPlay(e: number) {
      // Markers chalk in, staggered and unhurried.
      OLINE.forEach((p, i) => drawO(p[0], p[1], 8, vis(e, 0.1 + i * 0.16, 0.5)));
      drawO(BACK[0], BACK[1], 8, vis(e, 0.1, 0.5));
      XS.forEach((p, i) => drawX(p[0], p[1], 9, vis(e, 0.5 + i * 0.16, 0.5)));

      // Secondary route draws, then its chalk arrowhead.
      const sA = vis(e, 1.4, 0.6);
      const sProg = easeOut(clamp((e - 1.4) / 1.6, 0, 1));
      const sEnd = drawRoute(secondary, sProg, sA);
      if (sEnd && sProg > 0.98) drawChalkArrowhead(sEnd.x, sEnd.y, sEnd.ang, sA);

      // Primary route sweeps slowly up into the arrow.
      const pA = vis(e, 2.6, 0.6);
      const pProg = easeOut(clamp((e - 2.6) / 2.8, 0, 1));
      drawRoute(primary, pProg, pA);

      // The arrow chalks its outline in on from the route's end.
      const aA = vis(e, 5.2, 0.5);
      const aProg = easeOut(clamp((e - 5.2) / 1.6, 0, 1));
      drawArrow(aProg, aA);
    }

    function paint(e: number) {
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      ctx!.setTransform(dpr * k, 0, 0, dpr * k, pointerX * 6 * dpr, pointerY * 6 * dpr);
      drawPlay(e);
    }

    if (reduced) {
      // Still, fully-drawn play (mid-hold phase).
      paint(8.5);
      return () => {
        ro.disconnect();
        window.removeEventListener('pointermove', onPointer);
      };
    }

    let raf = 0;
    const start = performance.now();
    let running = true;

    function frame(now: number) {
      if (!running) return;
      pointerX += (pointerTX - pointerX) * 0.06;
      pointerY += (pointerTY - pointerY) * 0.06;
      const e = ((now - start) / 1000) % T;
      paint(e);
      raf = requestAnimationFrame(frame);
    }

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries[0]?.isIntersecting ?? true;
        if (visible && !running) {
          running = true;
          raf = requestAnimationFrame(frame);
        } else if (!visible && running) {
          running = false;
          cancelAnimationFrame(raf);
        }
      },
      { threshold: 0 }
    );
    io.observe(container);
    // One synchronous frame so the hero is never blank before rAF's first
    // tick (rAF is throttled to zero in a hidden/background tab).
    frame(performance.now());

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('pointermove', onPointer);
    };
  }, []);

  const a11y = title
    ? { role: 'img' as const, 'aria-label': title }
    : { 'aria-hidden': true as const };

  return (
    <div ref={containerRef} className={className} style={{ aspectRatio: '1 / 1' }}>
      <canvas ref={canvasRef} className="block h-full w-full" {...a11y} />
    </div>
  );
}
