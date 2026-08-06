'use client';

import { useEffect, useRef } from 'react';

// A living, canvas-driven telling of the ECP move mark — homepage hero only.
// The arrow is a fixed, crisp shape, always fully present. Dispersed square
// units stream up the north-east diagonal, tilt and elongate into momentum
// "pulses" as they gain speed, then decelerate and dissolve as they reach the
// arrow — sliding beneath it (it's drawn on top) so they read as merging into
// the shape and feeding it (the arrow glows a touch brighter with each). Light
// trails, an ambient glow, cursor parallax. Reduced-motion draws one still
// frame (the crisp arrow + a hint of the incoming field).
//
// The plain currentColor MoveMark still drives the header/footer/cards.

const PAPER = '236, 231, 218'; // #EDE7DA
const NAVY = '10, 29, 43'; // #0A1D2B — matches the hero section bg for trails

// Arrow outline (from public/brand/ecp-move-mark.svg's direction-arrow path),
// in the shared 256×256 logical space. This is the fixed end shape.
const ARROW: [number, number][] = [
  [166, 67], [184, 85], [214, 55], [214, 82], [238, 82],
  [238, 14], [170, 14], [170, 38], [198, 38],
];

// Flow axis: S (lower-left) → E (just inside the arrow's inner elbow), so the
// stream converges to a point and slides under the arrow as it's absorbed.
const S = { x: 28, y: 214 };
const E = { x: 196, y: 64 };
const DX = E.x - S.x;
const DY = E.y - S.y;
const LEN = Math.hypot(DX, DY);
const PX = -DY / LEN;
const PY = DX / LEN;

const COUNT = 26;

function clamp(v: number, a: number, b: number) {
  return v < a ? a : v > b ? b : v;
}
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
function smoothstep(e0: number, e1: number, x: number) {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
}

type Particle = {
  t: number;
  lateral: number;
  sz: number;
  speed: number;
  curlAmp: number;
  curlPhase: number;
};

function resetParticle(p: Particle, spread: boolean): Particle {
  p.t = spread ? Math.random() : Math.random() * 0.05;
  p.lateral = Math.random() * 2 - 1;
  p.sz = 0.65 + Math.random() * 0.7;
  p.speed = 0.8 + Math.random() * 0.5;
  p.curlAmp = 4 + Math.random() * 7;
  p.curlPhase = Math.random() * Math.PI * 2;
  return p;
}

export default function HeroSignal({
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

    const particles: Particle[] = Array.from({ length: COUNT }, () =>
      resetParticle({} as Particle, true)
    );

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

    function drawParticle(p: Particle) {
      const t = p.t;
      const spread = lerp(26, 2, t); // converge to a point entering the arrow
      const curl = Math.sin(p.curlPhase + t * Math.PI * 2.2) * p.curlAmp * (1 - t);
      const off = p.lateral * spread + curl;
      const x = S.x + DX * t + PX * off;
      const y = S.y + DY * t + PY * off;

      const s = lerp(10, 5, t) * p.sz;
      const rot = smoothstep(0.12, 0.62, t) * (Math.PI / 4); // tilt into momentum bars
      const hMul = 1 + smoothstep(0.28, 0.7, t) * 1.7; // elongate with speed

      // Fade in at the start, dissolve as it merges into the arrow.
      const alpha =
        (0.5 + p.sz * 0.32) *
        clamp(t / 0.1, 0, 1) *
        (1 - smoothstep(0.78, 0.98, t));
      if (alpha <= 0.01) return;

      ctx!.save();
      ctx!.translate(x, y);
      ctx!.rotate(rot);
      ctx!.fillStyle = `rgba(${PAPER}, ${clamp(alpha, 0, 0.92)})`;
      ctx!.fillRect(-s / 2, (-s * hMul) / 2, s, s * hMul);
      ctx!.restore();
    }

    function drawGlow(intensity: number) {
      const g = ctx!.createRadialGradient(202, 50, 4, 202, 50, 118);
      g.addColorStop(0, `rgba(${PAPER}, ${0.16 * intensity})`);
      g.addColorStop(0.55, `rgba(${PAPER}, ${0.04 * intensity})`);
      g.addColorStop(1, `rgba(${PAPER}, 0)`);
      ctx!.fillStyle = g;
      ctx!.fillRect(0, 0, 256, 256);
    }

    // The fixed, crisp arrow — drawn on top of the stream each frame, so
    // arriving squares slide under it and read as absorbed.
    function drawArrow(brightness: number) {
      const g = ctx!.createLinearGradient(170, 14, 238, 85);
      g.addColorStop(0, `rgba(246, 241, 231, ${clamp(0.98 * brightness, 0, 1)})`);
      g.addColorStop(1, `rgba(214, 207, 192, ${clamp(0.9 * brightness, 0, 1)})`);
      ctx!.fillStyle = g;
      ctx!.beginPath();
      ctx!.moveTo(ARROW[0][0], ARROW[0][1]);
      for (let i = 1; i < ARROW.length; i++) ctx!.lineTo(ARROW[i][0], ARROW[i][1]);
      ctx!.closePath();
      ctx!.fill();
    }

    let energy = 0;
    let first = true;

    function paint(scene: () => void) {
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      if (first || reduced) {
        ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
        first = false;
      } else {
        ctx!.fillStyle = `rgba(${NAVY}, 0.30)`;
        ctx!.fillRect(0, 0, canvas!.width, canvas!.height);
      }
      ctx!.setTransform(dpr * k, 0, 0, dpr * k, pointerX * 6 * dpr, pointerY * 6 * dpr);
      scene();
    }

    if (reduced) {
      const field = Array.from({ length: 16 }, () => resetParticle({} as Particle, true));
      field.forEach((p, i) => (p.t = 0.04 + (i / 16) * 0.72));
      paint(() => {
        drawGlow(1);
        for (const p of field) drawParticle(p);
        drawArrow(1);
      });
      return () => {
        ro.disconnect();
        window.removeEventListener('pointermove', onPointer);
      };
    }

    let raf = 0;
    let last = performance.now();
    let running = true;

    function frame(now: number) {
      if (!running) return;
      const dt = clamp((now - last) / 16.67, 0, 3);
      last = now;

      pointerX += (pointerTX - pointerX) * 0.06;
      pointerY += (pointerTY - pointerY) * 0.06;
      energy *= 0.94;

      paint(() => {
        drawGlow(0.6 + energy * 0.5);
        for (const p of particles) {
          // Slow-fast-slow speed profile: dispersed units gather momentum
          // through the middle, then ease into the arrow rather than
          // snapping — a gradual merge.
          const profile = 0.35 + 1.35 * Math.sin(clamp(p.t, 0, 1) * Math.PI);
          p.t += p.speed * 0.011 * profile * dt;
          if (p.t >= 1) {
            energy = Math.min(1, energy + 0.12); // the signal feeds the arrow
            resetParticle(p, false);
          }
          drawParticle(p);
        }
        drawArrow(1 + energy * 0.1);
      });

      raf = requestAnimationFrame(frame);
    }

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries[0]?.isIntersecting ?? true;
        if (visible && !running) {
          running = true;
          last = performance.now();
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
