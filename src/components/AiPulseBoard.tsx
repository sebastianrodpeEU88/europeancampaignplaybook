'use client';

import { useEffect, useRef } from 'react';

// Live "AI Readiness Pulse" board — an animated, self-contained dark data panel
// embedded in the light /ai-insights page. All figures are aggregated from
// anonymous participant surveys; no response is attributable to an individual.
// CSS is scoped under `.aipulse` so nothing leaks into the rest of the site,
// and the animation runs once when the board scrolls into view.

const CSS = `
.aipulse{
  --ground:#081821; --panel:#0f2a3a; --panel-2:#123243;
  --line:rgba(237,231,218,.12);
  --ink:#ede7da; --ink-dim:rgba(237,231,218,.64); --ink-faint:rgba(237,231,218,.40);
  --accent:#f55a2c; --accent-deep:#dd3c13; --gold:#e8a33d; --live:#46d39a;
  --track:rgba(237,231,218,.09);
  --mono:ui-monospace,'SF Mono',Menlo,Consolas,monospace;
  --sans:var(--font-interface),system-ui,sans-serif;
  --disp:var(--font-display),'Arial Narrow',Arial,sans-serif;
  position:relative; color:var(--ink); font-family:var(--sans); line-height:1.5;
  background:
    radial-gradient(1200px 600px at 12% -10%, rgba(245,90,44,.16), transparent 60%),
    radial-gradient(1000px 700px at 100% 0%, rgba(70,211,154,.07), transparent 55%),
    var(--ground);
  padding:clamp(30px,5vw,60px) 0;
}
.aipulse *{box-sizing:border-box}
.aipulse .wrap{max-width:1120px;margin:0 auto;padding:0 clamp(16px,3.5vw,36px)}
.aipulse .eyebrow{font-family:var(--mono);font-size:11px;font-weight:500;letter-spacing:.18em;text-transform:uppercase;color:var(--ink-faint)}

.aipulse .topbar{display:flex;flex-wrap:wrap;align-items:center;gap:12px 20px;justify-content:space-between;padding-bottom:22px;border-bottom:1px solid var(--line)}
.aipulse .scope{font-family:var(--mono);font-size:11.5px;color:var(--ink-dim);letter-spacing:.02em}

.aipulse .hero{padding:30px 0 24px;display:grid;grid-template-columns:1.35fr .65fr;gap:28px;align-items:end;border-bottom:1px solid var(--line)}
.aipulse .hero h2{font-family:var(--disp);font-weight:700;font-size:clamp(30px,5.4vw,54px);line-height:1.02;letter-spacing:-.01em;color:var(--ink);text-transform:none}
.aipulse .hero h2 .hl{color:var(--accent)}
.aipulse .hsub{margin-top:16px;max-width:48ch;color:var(--ink-dim);font-size:clamp(15px,1.5vw,17px)}
.aipulse .hsub strong{color:var(--ink);font-weight:600}
.aipulse .counter{text-align:right}
.aipulse .counter .big{font-family:var(--disp);font-weight:700;font-size:clamp(56px,9vw,92px);line-height:.9;color:var(--ink);letter-spacing:-.02em}
.aipulse .counter .cap{font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-faint);margin-top:8px}

.aipulse .band{margin:26px 0;padding:22px 24px;border:1px solid var(--line);border-left:3px solid var(--accent);border-radius:4px;background:linear-gradient(90deg,rgba(245,90,44,.09),rgba(245,90,44,0) 70%)}
.aipulse .band .k{font-family:var(--disp);font-weight:700;font-size:clamp(20px,2.6vw,28px);letter-spacing:0;line-height:1.15}
.aipulse .band .k em{font-style:normal;color:var(--accent)}
.aipulse .band .k .zero{color:var(--gold)}
.aipulse .band p{margin-top:8px;color:var(--ink-dim);font-size:14.5px;max-width:66ch}

.aipulse .grid{display:grid;grid-template-columns:repeat(12,1fr);gap:16px;margin-top:18px}
.aipulse .panel{background:linear-gradient(180deg,var(--panel),var(--panel-2));border:1px solid var(--line);border-radius:6px;padding:20px 20px 22px;position:relative;overflow:hidden}
.aipulse .col-7{grid-column:span 7} .aipulse .col-5{grid-column:span 5} .aipulse .col-12{grid-column:span 12}
.aipulse .p-head{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin-bottom:16px}
.aipulse .p-title{font-weight:600;font-size:15px;color:var(--ink)}
.aipulse .p-note{font-family:var(--mono);font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-faint)}

.aipulse .bars{display:flex;flex-direction:column;gap:11px}
.aipulse .bar{display:grid;grid-template-columns:1fr auto;gap:4px 10px;align-items:center}
.aipulse .bar .lbl{font-size:13px;color:var(--ink-dim)}
.aipulse .bar .val{font-family:var(--mono);font-size:12.5px;color:var(--ink);font-weight:500}
.aipulse .bar .track{grid-column:1 / -1;height:9px;background:var(--track);border-radius:5px;overflow:hidden}
.aipulse .bar .fill{height:100%;width:0;border-radius:5px;background:linear-gradient(90deg,var(--accent-deep),var(--accent));transition:width 1.15s cubic-bezier(.22,1,.36,1);position:relative}
.aipulse .bar .fill.zero{background:repeating-linear-gradient(45deg,rgba(232,163,61,.5),rgba(232,163,61,.5) 5px,rgba(232,163,61,.18) 5px,rgba(232,163,61,.18) 10px)}
.aipulse .bar.lead .lbl{color:var(--ink)}
.aipulse .bar.lead .fill{box-shadow:0 0 16px rgba(245,90,44,.35)}

.aipulse .split{display:flex;align-items:center;gap:20px}
.aipulse .ring{--p:53;width:132px;height:132px;flex:none;border-radius:50%;background:conic-gradient(var(--accent) calc(var(--p)*1%), var(--track) 0);display:grid;place-items:center;position:relative}
.aipulse .ring::after{content:"";position:absolute;inset:14px;border-radius:50%;background:var(--panel)}
.aipulse .ring-c{position:relative;z-index:1;text-align:center}
.aipulse .ring-c .n{font-family:var(--disp);font-weight:700;font-size:30px;color:var(--ink);line-height:1}
.aipulse .ring-c .t{font-family:var(--mono);font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-faint);margin-top:3px}
.aipulse .legend{display:flex;flex-direction:column;gap:12px;font-size:13px}
.aipulse .legend .row{display:flex;gap:9px;align-items:flex-start}
.aipulse .legend .sw{width:11px;height:11px;border-radius:3px;margin-top:3px;flex:none}
.aipulse .legend .row .pc{font-family:var(--mono);color:var(--ink);font-weight:600}
.aipulse .legend .row .d{color:var(--ink-dim)}

.aipulse .gauges{display:grid;grid-template-columns:1fr 1fr;gap:18px}
.aipulse .gauge{text-align:center}
.aipulse .gauge svg{width:100%;height:auto;max-width:150px}
.aipulse .gauge .score{font-family:var(--disp);font-weight:700;font-size:26px;fill:var(--ink)}
.aipulse .gauge .out5{font-family:var(--mono);font-size:9px;fill:var(--ink-faint);letter-spacing:.08em}
.aipulse .gauge .cap{margin-top:6px;font-size:12.5px;color:var(--ink-dim);line-height:1.35;min-height:2.6em}
.aipulse .arc-bg{fill:none;stroke:var(--track);stroke-width:9;stroke-linecap:round}
.aipulse .arc-fg{fill:none;stroke:var(--gold);stroke-width:9;stroke-linecap:round;transition:stroke-dashoffset 1.3s cubic-bezier(.22,1,.36,1)}

.aipulse .cloud{display:flex;flex-wrap:wrap;gap:8px 20px;align-items:baseline;align-content:flex-start;line-height:1.1}
.aipulse .cloud span{font-family:var(--disp);font-weight:700;color:var(--ink-dim);opacity:0;transform:translateY(6px);transition:opacity .5s ease,transform .5s ease;white-space:nowrap}
.aipulse .cloud span.in{opacity:1;transform:none}
.aipulse .cloud .s1{font-size:16px;font-weight:500;color:var(--ink-faint)}
.aipulse .cloud .s2{font-size:21px}
.aipulse .cloud .s3{font-size:clamp(26px,3vw,30px);color:var(--ink-dim)}
.aipulse .cloud .s4{font-size:clamp(32px,4vw,40px);color:var(--gold)}
.aipulse .cloud .s5{font-size:clamp(42px,6vw,58px);color:var(--accent)}


.aipulse .disclaimer{margin-top:24px;font-family:var(--mono);font-size:10.5px;color:var(--ink-faint);letter-spacing:.03em;text-align:center}

@media (max-width:820px){
  .aipulse .hero{grid-template-columns:1fr;gap:16px}
  .aipulse .counter{text-align:left}
  .aipulse .col-7,.aipulse .col-5{grid-column:span 12}
}
`;

const SHELL = `
<div class="wrap">
  <div class="topbar">
    <span class="eyebrow">before the workshop</span>
    <span class="scope">what they told us in the survey they take before training · brussels + online</span>
  </div>

  <div class="hero">
    <div>
      <h2>they already reach for AI.<br><span class="hl">few reach past the chatbot.</span></h2>
      <p class="hsub">Where people stand <strong>before</strong> our AI workshops. Anonymous answers from the pre-training survey we ask practitioners in policy, public affairs and campaigns to fill in, no names, no attribution.</p>
    </div>
    <div class="counter">
      <div class="big"><span data-respn>0</span></div>
      <div class="cap">survey responses</div>
    </div>
  </div>

  <div class="band">
    <div class="k"><em>99%</em> already use chatbots. Only <span class="zero">8%</span> have tried an AI agent, and <span class="zero">1%</span> an automation.</div>
    <p>Almost everyone is fluent with ChatGPT and friends. Very few have crossed into agents, automations or custom assistants, the tools that actually save hours. That gap is exactly what the workshop closes.</p>
  </div>

  <div class="grid">
    <div class="panel col-7">
      <div class="p-head"><div class="p-title">Which AI tools they already use</div><div class="p-note">% of cohort</div></div>
      <div class="bars" data-tools></div>
    </div>
    <div class="panel col-5">
      <div class="p-head"><div class="p-title">Self-reported confidence</div><div class="p-note">n=95</div></div>
      <div class="split">
        <div class="ring" data-ring><div class="ring-c"><div class="n" data-ringn>0%</div><div class="t">testing<br>advanced</div></div></div>
        <div class="legend">
          <div class="row"><span class="sw" style="background:var(--accent)"></span><div><span class="pc">53%</span> <span class="d">&mdash; &ldquo;tools like ChatGPT are under control, I&rsquo;m testing more advanced stuff.&rdquo;</span></div></div>
          <div class="row"><span class="sw" style="background:var(--track)"></span><div><span class="pc">42%</span> <span class="d">&mdash; &ldquo;I use ChatGPT, but it&rsquo;s hard to apply to my work every day.&rdquo;</span></div></div>
        </div>
      </div>
    </div>
    <div class="panel col-7">
      <div class="p-head"><div class="p-title">Where AI is doing the work today</div><div class="p-note">% of cohort</div></div>
      <div class="bars" data-tasks></div>
    </div>
    <div class="panel col-5">
      <div class="p-head"><div class="p-title">How the room feels about AI</div><div class="p-note">avg · 1&ndash;5</div></div>
      <div class="gauges">
        <div class="gauge" data-score="3.5">
          <svg viewBox="0 0 120 78" aria-hidden="true"><path class="arc-bg" d="M12 72 A48 48 0 0 1 108 72"/><path class="arc-fg" d="M12 72 A48 48 0 0 1 108 72"/><text x="60" y="60" text-anchor="middle" class="score">3.5</text><text x="60" y="72" text-anchor="middle" class="out5">/ 5</text></svg>
          <div class="cap">grasp of AI&rsquo;s biases, limits &amp; ethics</div>
        </div>
        <div class="gauge" data-score="3.2">
          <svg viewBox="0 0 120 78" aria-hidden="true"><path class="arc-bg" d="M12 72 A48 48 0 0 1 108 72"/><path class="arc-fg" d="M12 72 A48 48 0 0 1 108 72"/><text x="60" y="60" text-anchor="middle" class="score">3.2</text><text x="60" y="72" text-anchor="middle" class="out5">/ 5</text></svg>
          <div class="cap">&ldquo;AI will bring more opportunity than risk&rdquo;</div>
        </div>
      </div>
    </div>
    <div class="panel col-12">
      <div class="p-head"><div class="p-title">What they&rsquo;d do with more time</div><div class="p-note">their answers, if the day were longer</div></div>
      <div class="cloud" data-cloud></div>
    </div>
  </div>

  <p class="disclaimer">Drawn from anonymous pre-workshop participant surveys, covering our workshops from 2026 to date. Respondents consented to their answers being shared for marketing purposes. Any reference to a specific organisation, or anything that could reveal an identity, has been modified. No response is attributable to any individual.</p>
</div>
`;

const TOOLS: [string, number, boolean][] = [
  ['Chatbots (ChatGPT, Claude, Gemini…)', 99, true],
  ['Image generation', 47, false],
  ['Meeting assistants & summaries', 37, false],
  ['AI for data & spreadsheets', 11, false],
  ['AI agents / custom assistants', 8, false],
  ['Video generation', 6, false],
  ['Automations (Zapier, Make)', 1, false],
];
const TASKS: [string, number][] = [
  ['Writing & editing reports', 64],
  ['Reviewing & approving outputs', 39],
  ['Strategic decisions & oversight', 28],
  ['Communicating with partners', 23],
  ['Admin templates & forms', 21],
  ['Creating social / publications', 13],
  ['Managing events & logistics', 13],
];
// The keywords from the survey's most-loved question — "what would you do if you
// had more time?" — sized by how often each theme came up across the answers.
const CLOUD: [string, number][] = [
  ['new ideas', 5], ['decision-makers', 4], ['stakeholders', 4], ['upskilling', 4],
  ['strategy', 3], ['position papers', 3], ['research', 3], ['analysing results', 3],
  ['creating content', 3], ['new projects', 2], ['reaching members', 2], ['following policy', 2],
  ['deeper reading', 2], ['writing reports', 2], ['partnerships', 2], ['the big picture', 2],
  ['learning', 1], ['new opportunities', 1],
];

export default function AiPulseBoard() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    let started = false;

    const buildBars = (host: Element | null, rows: Array<[string, number, boolean?]>) => {
      if (!host) return;
      rows.forEach((r) => {
        const lead = r[2];
        const d = document.createElement('div');
        d.className = 'bar' + (lead ? ' lead' : '');
        d.innerHTML =
          '<span class="lbl">' + r[0] + '</span><span class="val">' + r[1] + '%</span>' +
          '<div class="track"><div class="fill' + (r[1] === 0 ? ' zero' : '') + '" data-w="' + r[1] + '"></div></div>';
        host.appendChild(d);
      });
    };

    const fillBars = () => {
      root.querySelectorAll<HTMLElement>('.fill').forEach((f, i) => {
        const w = Number(f.getAttribute('data-w'));
        setTimeout(() => { f.style.width = (w === 0 ? 6 : w) + '%'; }, reduce ? 0 : 120 + i * 70);
      });
    };

    const countUp = (el: Element | null, to: number, dur: number) => {
      if (!el) return;
      if (reduce) { el.textContent = String(to); return; }
      const start = performance.now();
      const step = (t: number) => {
        const p = Math.min(1, (t - start) / dur);
        el.textContent = String(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const fillRing = () => {
      const ring = root.querySelector<HTMLElement>('[data-ring]');
      const label = root.querySelector('[data-ringn]');
      if (!ring || !label) return;
      if (reduce) { ring.style.setProperty('--p', '53'); label.textContent = '53%'; return; }
      const s = performance.now();
      const step = (t: number) => {
        const p = Math.min(1, (t - s) / 1200), v = 53 * (1 - Math.pow(1 - p, 3));
        ring.style.setProperty('--p', String(v));
        label.textContent = Math.round(v) + '%';
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const fillGauges = () => {
      root.querySelectorAll<SVGElement>('.gauge').forEach((g) => {
        const sc = Number(g.getAttribute('data-score'));
        const path = g.querySelector<SVGPathElement>('.arc-fg');
        if (!path) return;
        const len = path.getTotalLength();
        path.style.strokeDasharray = String(len);
        path.style.strokeDashoffset = String(len);
        path.getBoundingClientRect();
        setTimeout(() => { path.style.strokeDashoffset = String(len * (1 - sc / 5)); }, reduce ? 0 : 200);
      });
    };

    const fillCloud = () => {
      const c = root.querySelector('[data-cloud]');
      if (!c) return;
      CLOUD.forEach((w, i) => {
        const s = document.createElement('span');
        s.className = 's' + w[1];
        s.textContent = w[0];
        c.appendChild(s);
        setTimeout(() => s.classList.add('in'), reduce ? 0 : 150 + i * 60);
      });
    };

    const start = () => {
      // Guard on the element (not just the closure) so React's dev-mode double
      // invoke of effects can't build the board twice on the same node.
      if (started || root.getAttribute('data-aip-started')) return;
      started = true;
      root.setAttribute('data-aip-started', '1');
      buildBars(root.querySelector('[data-tools]'), TOOLS);
      buildBars(root.querySelector('[data-tasks]'), TASKS);
      countUp(root.querySelector('[data-respn]'), 95, 1400);
      fillBars(); fillRing(); fillGauges(); fillCloud();
    };

    // The board now sits high on the page, so build the results on mount rather
    // than waiting for a scroll — that is the whole point of the page. Called
    // directly (not via rAF) so it also runs when the page loads in a background
    // tab, where requestAnimationFrame is paused.
    start();
  }, []);

  return (
    <section
      ref={rootRef}
      className="aipulse"
      aria-label="Live AI readiness insights from workshop participants"
    >
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="wrap" dangerouslySetInnerHTML={{ __html: SHELL }} />
    </section>
  );
}
