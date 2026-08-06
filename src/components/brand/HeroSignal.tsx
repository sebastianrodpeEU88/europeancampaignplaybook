'use client';

import { useEffect, useRef } from 'react';

// A living, canvas-driven telling of the ECP move mark — homepage hero only.
// Dispersed square units stream up the north-east diagonal, tilt and elongate
// into momentum "pulses" as they gain speed, then — instead of just fading —
// decelerate, align to the grid, and lock into cells that tile the arrow, so
// the arrow visibly *assembles* from the flow. Settled cells hold, then release
// after a moment, freeing slots for new arrivals, so the arrow is perpetually
// (re)built from the signal. Light trails, an ambient glow, cursor parallax.
// Reduced-motion draws one still, fully-formed frame.
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

// Flow axis: particles travel from S (lower-left) toward the arrow, gathering
// momentum and converging as they go.
const S = { x: 26, y: 216 };
const E = { x: 188, y: 76 };
const DX = E.x - S.x;
const DY = E.y - S.y;
const LEN = Math.hypot(DX, DY);
const PX = -DY / LEN; // unit perpendicular (lateral spread + curl)
const PY = DX / LEN;

// Arrow assembles from a grid of square cells clipped to its polygon.
const STEP = 11;
const CELL = 12.5;
const ASSIGN_T = 0.55; // grab an arrow cell once past this point on the axis

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
function easeOutCubic(t: number) {
  const u = 1 - t;
  return 1 - u * u * u;
}
function pointInPoly(x: number, y: number, poly: [number, number][]) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

type Slot = { x: number; y: number; occupied: boolean };
type State = 'flow' | 'settling' | 'settled' | 'releasing';
type Particle = {
  state: State;
  t: number;
  lateral: number;
  sz: number;
  speed: number;
  curlAmp: number;
  curlPhase: number;
  slot: number;
  fromX: number;
  fromY: number;
  fromSize: number;
  fromRot: number;
  prog: number; // 0..1 within settling / releasing
  hold: number; // frames remaining as settled
};

function resetFlow(p: Particle): Particle {
  p.state = 'flow';
  p.t = Math.random() * 0.04;
  p.lateral = Math.random() * 2 - 1;
  p.sz = 0.65 + Math.random() * 0.7;
  p.speed = 0.65 + Math.random() * 0.6;
  p.curlAmp = 4 + Math.random() * 7;
  p.curlPhase = Math.random() * Math.PI * 2;
  p.slot = -1;
  p.prog = 0;
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

    // Precompute arrow cells (grid clipped to the polygon).
    const slots: Slot[] = [];
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const [x, y] of ARROW) {
      minX = Math.min(minX, x); maxX = Math.max(maxX, x);
      minY = Math.min(minY, y); maxY = Math.max(maxY, y);
    }
    for (let y = minY + STEP / 2; y < maxY; y += STEP) {
      for (let x = minX + STEP / 2; x < maxX; x += STEP) {
        if (pointInPoly(x, y, ARROW)) slots.push({ x, y, occupied: false });
      }
    }

    const COUNT = slots.length + 16;
    const particles: Particle[] = Array.from({ length: COUNT }, () => {
      const p = resetFlow({} as Particle);
      p.t = Math.random(); // spread the initial stream across the whole axis
      return p;
    });

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

    // Flow-state on-screen position/size/rotation for a particle.
    function flowGeom(p: Particle) {
      const t = p.t;
      const spread = lerp(24, 3, t);
      const curl = Math.sin(p.curlPhase + t * Math.PI * 2.2) * p.curlAmp * (1 - t);
      const off = p.lateral * spread + curl;
      const x = S.x + DX * t + PX * off;
      const y = S.y + DY * t + PY * off;
      const s = lerp(10, 5, t) * p.sz;
      const rot = smoothstep(0.12, 0.68, t) * (Math.PI / 4);
      const hMul = 1 + smoothstep(0.28, 0.72, t) * 1.7;
      return { x, y, w: s, h: s * hMul, rot };
    }

    function square(x: number, y: number, w: number, h: number, rot: number, alpha: number) {
      if (alpha <= 0.01) return;
      ctx!.save();
      ctx!.translate(x, y);
      if (rot) ctx!.rotate(rot);
      ctx!.fillStyle = `rgba(${PAPER}, ${clamp(alpha, 0, 1)})`;
      ctx!.fillRect(-w / 2, -h / 2, w, h);
      ctx!.restore();
    }

    function drawGlow(intensity: number) {
      const g = ctx!.createRadialGradient(202, 52, 4, 202, 52, 120);
      g.addColorStop(0, `rgba(${PAPER}, ${0.16 * intensity})`);
      g.addColorStop(0.55, `rgba(${PAPER}, ${0.04 * intensity})`);
      g.addColorStop(1, `rgba(${PAPER}, 0)`);
      ctx!.fillStyle = g;
      ctx!.fillRect(0, 0, 256, 256);
    }

    // Faint arrow silhouette so the shape reads even mid-assembly.
    function drawArrowBase(alpha: number) {
      ctx!.fillStyle = `rgba(${PAPER}, ${alpha})`;
      ctx!.beginPath();
      ctx!.moveTo(ARROW[0][0], ARROW[0][1]);
      for (let i = 1; i < ARROW.length; i++) ctx!.lineTo(ARROW[i][0], ARROW[i][1]);
      ctx!.closePath();
      ctx!.fill();
    }

    function firstFreeSlot(px: number, py: number) {
      let best = -1, bestD = Infinity;
      for (let i = 0; i < slots.length; i++) {
        if (slots[i].occupied) continue;
        const d = (slots[i].x - px) ** 2 + (slots[i].y - py) ** 2;
        if (d < bestD) { bestD = d; best = i; }
      }
      return best;
    }

    let energy = 0;
    let first = true;

    function paint(scene: () => void) {
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      if (first || reduced) {
        ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
        first = false;
      } else {
        ctx!.fillStyle = `rgba(${NAVY}, 0.32)`;
        ctx!.fillRect(0, 0, canvas!.width, canvas!.height);
      }
      ctx!.setTransform(dpr * k, 0, 0, dpr * k, pointerX * 6 * dpr, pointerY * 6 * dpr);
      scene();
    }

    if (reduced) {
      // Fully-formed still frame: every arrow cell filled + a hint of field.
      for (const s of slots) s.occupied = true;
      paint(() => {
        drawGlow(1);
        drawArrowBase(0.28);
        for (const s of slots) square(s.x, s.y, CELL, CELL, 0, 0.95);
        const field = Array.from({ length: 12 }, (_, i) => {
          const p = resetFlow({} as Particle);
          p.t = 0.05 + (i / 12) * 0.5;
          return p;
        });
        for (const p of field) {
          const g = flowGeom(p);
          square(g.x, g.y, g.w, g.h, g.rot, 0.7);
        }
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

      // Update
      for (const p of particles) {
        if (p.state === 'flow') {
          p.t += p.speed * (0.006 + p.t * 0.012) * dt;
          if (p.t >= ASSIGN_T) {
            const g = flowGeom(p);
            const slot = firstFreeSlot(g.x, g.y);
            if (slot >= 0) {
              slots[slot].occupied = true;
              p.state = 'settling';
              p.slot = slot;
              p.fromX = g.x; p.fromY = g.y; p.fromSize = g.w; p.fromRot = g.rot;
              p.prog = 0;
            }
          }
          if (p.t >= 1) resetFlow(p); // no slot grabbed in time — recycle
        } else if (p.state === 'settling') {
          p.prog += dt / 30; // ~0.5s to lock in
          if (p.prog >= 1) {
            p.state = 'settled';
            p.hold = 150 + Math.random() * 210; // ~2.5–6s held
            energy = Math.min(1, energy + 0.16); // the signal feeds the arrow
          }
        } else if (p.state === 'settled') {
          p.hold -= dt;
          if (p.hold <= 0) { p.state = 'releasing'; p.prog = 0; }
        } else if (p.state === 'releasing') {
          p.prog += dt / 34;
          if (p.prog >= 1) {
            slots[p.slot].occupied = false;
            resetFlow(p);
          }
        }
      }

      paint(() => {
        drawGlow(0.6 + energy * 0.5);
        drawArrowBase(0.2 + energy * 0.1);

        // Settled / releasing cells (the arrow body) under the incoming flow.
        for (const p of particles) {
          const s = slots[p.slot];
          if (p.state === 'settled') {
            square(s.x, s.y, CELL, CELL, 0, 0.96);
          } else if (p.state === 'releasing') {
            const a = 1 - p.prog;
            square(s.x, s.y, CELL, CELL, 0, 0.96 * a);
          }
        }
        // Flowing + settling squares on top, so arrivals read as merging in.
        for (const p of particles) {
          if (p.state === 'flow') {
            const g = flowGeom(p);
            const fade = clamp(p.t / 0.1, 0, 1) * clamp((1 - p.t) / 0.22, 0, 1);
            square(g.x, g.y, g.w, g.h, g.rot, (0.5 + p.sz * 0.32) * fade);
          } else if (p.state === 'settling') {
            const e = easeOutCubic(p.prog);
            const s = slots[p.slot];
            square(
              lerp(p.fromX, s.x, e),
              lerp(p.fromY, s.y, e),
              lerp(p.fromSize, CELL, e),
              lerp(p.fromSize, CELL, e),
              lerp(p.fromRot, 0, e),
              lerp(0.75, 0.96, e)
            );
          }
        }
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
    // Draw one frame synchronously so the hero is never blank before the
    // rAF loop's first tick (rAF is throttled to zero in a hidden/background
    // tab; this guarantees an initial composition either way).
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
