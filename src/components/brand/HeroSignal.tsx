'use client';

import { useEffect, useRef } from 'react';

// A living, canvas-driven telling of the ECP move mark — homepage hero only.
// Instead of a fixed logo with CSS polish, this is a continuous signal:
// dispersed square units stream up the north-east diagonal, tilt and
// elongate into momentum "pulses" as they gain speed (the brand's own
// field → pulse → arrow motif, but in motion), then dissolve into a solid
// arrow that pulses each time the signal feeds it. Light trails, an ambient
// glow, and gentle cursor parallax. Reduced-motion draws one still frame.
//
// The plain currentColor MoveMark still drives the header/footer/cards.

const PAPER = '236, 231, 218'; // #EDE7DA
const NAVY = '10, 29, 43'; // #0A1D2B — matches the hero section bg for trails

// Arrow outline (from public/brand/ecp-move-mark.svg's direction-arrow path),
// in the shared 256×256 logical space.
const ARROW: [number, number][] = [
  [166, 67], [184, 85], [214, 55], [214, 82], [238, 82],
  [238, 14], [170, 14], [170, 38], [198, 38],
];

// Flow axis: particles travel from S (lower-left) toward E (arrow's inner
// base), gathering momentum and converging as they go.
const S = { x: 26, y: 216 };
const E = { x: 188, y: 76 };
const DX = E.x - S.x;
const DY = E.y - S.y;
const LEN = Math.hypot(DX, DY);
const PX = -DY / LEN; // unit perpendicular (for lateral spread + curl)
const PY = DX / LEN;

const COUNT = 30;

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

// Random is fine here — this only runs client-side after mount (never during
// SSR), so there's no hydration surface to mismatch.
function makeParticle(spread: boolean, i: number): Particle {
  return {
    t: spread ? (i / COUNT + Math.random() * 0.06) % 1 : Math.random() * 0.02,
    lateral: Math.random() * 2 - 1,
    sz: 0.65 + Math.random() * 0.7,
    speed: 0.65 + Math.random() * 0.6,
    curlAmp: 4 + Math.random() * 7,
    curlPhase: Math.random() * Math.PI * 2,
  };
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

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let cssSize = 0;
    let k = 1; // logical(256) → css px scale

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

    const particles: Particle[] = Array.from({ length: COUNT }, (_, i) => makeParticle(true, i));

    // Eased cursor parallax + flow bias.
    let pointerTX = 0;
    let pointerTY = 0;
    let pointerX = 0;
    let pointerY = 0;
    function onPointer(e: PointerEvent) {
      pointerTX = clamp((e.clientX - window.innerWidth / 2) / (window.innerWidth / 2), -1, 1);
      pointerTY = clamp((e.clientY - window.innerHeight / 2) / (window.innerHeight / 2), -1, 1);
    }
    if (canHover && !reduced) {
      window.addEventListener('pointermove', onPointer, { passive: true });
    }

    function drawGlow(intensity: number) {
      const cx = 202;
      const cy = 52;
      const g = ctx!.createRadialGradient(cx, cy, 4, cx, cy, 120);
      g.addColorStop(0, `rgba(${PAPER}, ${0.16 * intensity})`);
      g.addColorStop(0.55, `rgba(${PAPER}, ${0.04 * intensity})`);
      g.addColorStop(1, `rgba(${PAPER}, 0)`);
      ctx!.fillStyle = g;
      ctx!.fillRect(0, 0, 256, 256);
    }

    function drawArrow(brightness: number) {
      const g = ctx!.createLinearGradient(170, 14, 238, 85);
      const hi = clamp(0.96 * brightness, 0, 1);
      g.addColorStop(0, `rgba(246, 241, 231, ${hi})`);
      g.addColorStop(1, `rgba(214, 207, 192, ${clamp(0.92 * brightness, 0, 1)})`);
      ctx!.fillStyle = g;
      ctx!.beginPath();
      ctx!.moveTo(ARROW[0][0], ARROW[0][1]);
      for (let i = 1; i < ARROW.length; i++) ctx!.lineTo(ARROW[i][0], ARROW[i][1]);
      ctx!.closePath();
      ctx!.fill();
    }

    function drawParticle(p: Particle, biasX: number, biasY: number) {
      const t = p.t;
      const baseX = S.x + DX * t;
      const baseY = S.y + DY * t;
      const spread = lerp(24, 3, t); // converge toward the arrow
      const curl = Math.sin(p.curlPhase + t * Math.PI * 2.2) * p.curlAmp * (1 - t);
      const off = p.lateral * spread + curl;
      const x = baseX + PX * off + biasX * (0.4 + t * 0.6);
      const y = baseY + PY * off + biasY * (0.4 + t * 0.6);

      const s = lerp(10, 5, t) * p.sz;
      // Tilt to 45° through the momentum zone (mirrors the pulse bars) …
      const rot = smoothstep(0.12, 0.68, t) * (Math.PI / 4);
      // … and elongate with speed, then shrink as it's absorbed.
      const hMul = (1 + smoothstep(0.28, 0.72, t) * 1.7) * (1 - smoothstep(0.82, 1, t) * 0.85);
      const w = s;
      const h = s * hMul;

      const fadeIn = clamp(t / 0.1, 0, 1);
      const fadeOut = clamp((1 - t) / 0.16, 0, 1);
      const alpha = (0.5 + p.sz * 0.32) * fadeIn * fadeOut;
      if (alpha <= 0.01) return;

      ctx!.save();
      ctx!.translate(x, y);
      ctx!.rotate(rot);
      ctx!.fillStyle = `rgba(${PAPER}, ${clamp(alpha, 0, 0.9)})`;
      ctx!.fillRect(-w / 2, -h / 2, w, h);
      ctx!.restore();
    }

    let energy = 0;
    let first = true;

    function renderFrame(scene: () => void) {
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      if (first || reduced) {
        ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
        first = false;
      } else {
        // Semi-transparent navy overpaint → short comet trails on the
        // fast-moving particles (canvas sits over the navy hero section,
        // so the trail colour matches seamlessly).
        ctx!.fillStyle = `rgba(${NAVY}, 0.30)`;
        ctx!.fillRect(0, 0, canvas!.width, canvas!.height);
      }
      const px = pointerX * 6;
      const py = pointerY * 6;
      ctx!.setTransform(dpr * k, 0, 0, dpr * k, px * dpr, py * dpr);
      scene();
    }

    if (reduced) {
      // One still frame: a settled dispersed field + arrow, no motion.
      renderFrame(() => {
        drawGlow(1);
        const still = Array.from({ length: COUNT }, (_, i) => makeParticle(true, i));
        for (const p of still) drawParticle(p, 0, 0);
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
      energy *= 0.93;

      const biasX = pointerX * 10;
      const biasY = pointerY * 10;

      renderFrame(() => {
        drawGlow(0.62 + energy * 0.55);
        for (const p of particles) {
          p.t += p.speed * (0.006 + p.t * 0.012) * dt;
          if (p.t >= 1) {
            energy = Math.min(1, energy + 0.14); // the signal feeds the arrow
            Object.assign(p, makeParticle(false, Math.floor(Math.random() * COUNT)));
          }
          drawParticle(p, biasX, biasY);
        }
        drawArrow(1 + energy * 0.14);
      });

      raf = requestAnimationFrame(frame);
    }

    // Pause the loop when the hero scrolls out of view.
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

    raf = requestAnimationFrame(frame);

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
