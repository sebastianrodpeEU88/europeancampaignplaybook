'use client';

import { useEffect, useRef } from 'react';

// A living, canvas-driven telling of the ECP move mark — homepage hero only.
// The arrow is a fixed, crisp shape. Below it, dispersed square units start
// distinct at the source, then — as they gather momentum up the north-east
// diagonal — stretch into long luminous light-rays that converge and stream
// into the arrow, blowing out into a bright beam that feeds it. Additive
// light blending gives the convergent glow; a soft halo and cursor parallax
// finish it. Reduced-motion draws one still frame.
//
// The plain currentColor MoveMark still drives the header/footer/cards.

const PAPER = '236, 231, 218'; // #EDE7DA

// Arrow outline (from public/brand/ecp-move-mark.svg's direction-arrow path),
// in the shared 256×256 logical space. This is the fixed end shape.
const ARROW: [number, number][] = [
  [166, 67], [184, 85], [214, 55], [214, 82], [238, 82],
  [238, 14], [170, 14], [170, 38], [198, 38],
];

// Flow axis: S (lower-left source) → E (the arrow's inner elbow, where the
// beam enters). The stream converges to that point as it brightens.
const S = { x: 30, y: 214 };
const E = { x: 190, y: 66 };
const DX = E.x - S.x;
const DY = E.y - S.y;
const LEN = Math.hypot(DX, DY);
const UX = DX / LEN; // unit flow direction
const UY = DY / LEN;
const PX = -UY; // unit perpendicular
const PY = UX;
const ANGLE = Math.atan2(UY, UX);

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
  p.t = spread ? Math.random() : Math.random() * 0.04;
  p.lateral = Math.random() * 2 - 1;
  p.sz = 0.7 + Math.random() * 0.7;
  p.speed = 0.85 + Math.random() * 0.5;
  p.curlAmp = 3 + Math.random() * 6;
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

    // One particle as a luminous ray: a wide soft glow streak + a narrow
    // bright core streak, plus a crisp square head that fades as the unit
    // accelerates (distinct square at the source → pure light-ray at the top).
    function drawRay(p: Particle) {
      const t = p.t;
      const spread = lerp(30, 1.5, t); // converge into the arrow's mouth
      const curl = Math.sin(p.curlPhase + t * Math.PI * 2.2) * p.curlAmp * (1 - t);
      const off = p.lateral * spread + curl;
      const x = S.x + DX * t + PX * off;
      const y = S.y + DY * t + PY * off;

      const speedF = Math.sin(clamp(t, 0, 1) * Math.PI); // 0 at ends, 1 mid-flight
      const len = lerp(5, 58, smoothstep(0.04, 0.9, t)) * (0.6 + p.speed * 0.5);
      const w = lerp(9 * p.sz, 2.2, t); // thick square → thin ray
      const headFade = clamp(t / 0.08, 0, 1) * (1 - smoothstep(0.82, 0.98, t));
      const bright = (0.18 + speedF * 0.4) * headFade;
      if (bright <= 0.01) return;

      ctx!.save();
      ctx!.translate(x, y);
      ctx!.rotate(ANGLE);

      // Soft wide glow around the ray.
      const gGlow = ctx!.createLinearGradient(-len, 0, 0, 0);
      gGlow.addColorStop(0, `rgba(${PAPER}, 0)`);
      gGlow.addColorStop(1, `rgba(${PAPER}, ${bright * 0.35})`);
      ctx!.fillStyle = gGlow;
      ctx!.fillRect(-len, -w * 1.3, len, w * 2.6);

      // Bright ray core.
      const gCore = ctx!.createLinearGradient(-len, 0, 0, 0);
      gCore.addColorStop(0, `rgba(${PAPER}, 0)`);
      gCore.addColorStop(0.72, `rgba(${PAPER}, ${bright * 0.5})`);
      gCore.addColorStop(1, `rgba(255, 255, 255, ${bright})`);
      ctx!.fillStyle = gCore;
      ctx!.fillRect(-len, -w / 2, len, w);
      ctx!.restore();

      // Distinct square head, strongest near the source.
      const sq = (1 - smoothstep(0.24, 0.72, t)) * headFade;
      if (sq > 0.02) {
        const s = lerp(11, 5, t) * p.sz;
        ctx!.fillStyle = `rgba(255, 255, 255, ${clamp(0.55 * sq + speedF * 0.2 * sq, 0, 1)})`;
        ctx!.fillRect(x - s / 2, y - s / 2, s, s);
      }
    }

    function radial(cx: number, cy: number, r: number, a: number) {
      const g = ctx!.createRadialGradient(cx, cy, 1, cx, cy, r);
      g.addColorStop(0, `rgba(${PAPER}, ${a})`);
      g.addColorStop(0.5, `rgba(${PAPER}, ${a * 0.35})`);
      g.addColorStop(1, `rgba(${PAPER}, 0)`);
      ctx!.fillStyle = g;
      ctx!.fillRect(0, 0, 256, 256);
    }

    function drawArrow(brightness: number) {
      ctx!.save();
      ctx!.shadowColor = `rgba(${PAPER}, 0.55)`;
      ctx!.shadowBlur = 16;
      const g = ctx!.createLinearGradient(170, 14, 238, 85);
      g.addColorStop(0, `rgba(250, 247, 240, ${clamp(brightness, 0, 1)})`);
      g.addColorStop(1, `rgba(226, 220, 208, ${clamp(0.94 * brightness, 0, 1)})`);
      ctx!.fillStyle = g;
      ctx!.beginPath();
      ctx!.moveTo(ARROW[0][0], ARROW[0][1]);
      for (let i = 1; i < ARROW.length; i++) ctx!.lineTo(ARROW[i][0], ARROW[i][1]);
      ctx!.closePath();
      ctx!.fill();
      ctx!.restore();
    }

    let energy = 0;

    function paint(scene: () => void) {
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      ctx!.setTransform(dpr * k, 0, 0, dpr * k, pointerX * 6 * dpr, pointerY * 6 * dpr);
      scene();
      ctx!.globalCompositeOperation = 'source-over';
    }

    function scene() {
      // Additive light: halo, rays, and the bright beam entering the arrow.
      ctx!.globalCompositeOperation = 'lighter';
      radial(204, 48, 132, 0.1 + energy * 0.06); // ambient halo
      for (const p of particles) drawRay(p);
      radial(190, 66, 40, 0.22 + energy * 0.22); // convergence hotspot at the mouth

      // The crisp, solid arrow on top of the beam.
      ctx!.globalCompositeOperation = 'source-over';
      drawArrow(0.98 + energy * 0.02);
    }

    if (reduced) {
      const still = Array.from({ length: 18 }, () => resetParticle({} as Particle, true));
      still.forEach((p, i) => (p.t = 0.04 + (i / 18) * 0.82));
      paint(() => {
        ctx!.globalCompositeOperation = 'lighter';
        radial(204, 48, 132, 0.12);
        for (const p of still) drawRay(p);
        radial(190, 66, 40, 0.28);
        ctx!.globalCompositeOperation = 'source-over';
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

      for (const p of particles) {
        // Slow-fast-slow: gather momentum through the middle, ease into the
        // arrow rather than snapping.
        const profile = 0.35 + 1.35 * Math.sin(clamp(p.t, 0, 1) * Math.PI);
        p.t += p.speed * 0.011 * profile * dt;
        if (p.t >= 1) {
          energy = Math.min(1, energy + 0.1);
          resetParticle(p, false);
        }
      }

      paint(scene);
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
