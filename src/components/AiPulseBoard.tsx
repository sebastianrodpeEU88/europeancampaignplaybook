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
.aipulse .livewrap{display:flex;align-items:center;gap:12px;font-family:var(--mono);font-size:11.5px;color:var(--ink-dim)}
.aipulse .live{display:inline-flex;align-items:center;gap:8px;padding:5px 11px 5px 9px;border:1px solid rgba(70,211,154,.4);border-radius:999px;color:var(--live);letter-spacing:.16em;text-transform:uppercase;font-size:10.5px;font-weight:600}
.aipulse .dot{width:7px;height:7px;border-radius:50%;background:var(--live);box-shadow:0 0 0 0 rgba(70,211,154,.6);animation:aip-pulse 2s infinite}
@keyframes aip-pulse{0%{box-shadow:0 0 0 0 rgba(70,211,154,.55)}70%{box-shadow:0 0 0 7px rgba(70,211,154,0)}100%{box-shadow:0 0 0 0 rgba(70,211,154,0)}}

.aipulse .hero{padding:30px 0 24px;display:grid;grid-template-columns:1.35fr .65fr;gap:28px;align-items:end;border-bottom:1px solid var(--line)}
.aipulse .hero h2{font-family:var(--disp);font-weight:700;font-size:clamp(30px,5.4vw,54px);line-height:1.02;letter-spacing:-.01em;color:var(--ink);text-transform:none}
.aipulse .hero h2 .hl{color:var(--accent)}
.aipulse .hsub{margin-top:16px;max-width:48ch;color:var(--ink-dim);font-size:clamp(15px,1.5vw,17px)}
.aipulse .counter{text-align:right}
.aipulse .counter .big{font-family:var(--disp);font-weight:700;font-size:clamp(56px,9vw,92px);line-height:.9;color:var(--ink);letter-spacing:-.02em}
.aipulse .counter .cap{font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-faint);margin-top:8px}
.aipulse .counter .upd{font-family:var(--mono);font-size:11px;color:var(--live);margin-top:4px}

.aipulse .band{margin:26px 0;padding:22px 24px;border:1px solid var(--line);border-left:3px solid var(--accent);border-radius:4px;background:linear-gradient(90deg,rgba(245,90,44,.09),rgba(245,90,44,0) 70%)}
.aipulse .band .k{font-family:var(--disp);font-weight:700;font-size:clamp(20px,2.6vw,28px);letter-spacing:0;line-height:1.15}
.aipulse .band .k em{font-style:normal;color:var(--accent)}
.aipulse .band .k .zero{color:var(--gold)}
.aipulse .band p{margin-top:8px;color:var(--ink-dim);font-size:14.5px;max-width:66ch}

.aipulse .grid{display:grid;grid-template-columns:repeat(12,1fr);gap:16px;margin-top:18px}
.aipulse .panel{background:linear-gradient(180deg,var(--panel),var(--panel-2));border:1px solid var(--line);border-radius:6px;padding:20px 20px 22px;position:relative;overflow:hidden}
.aipulse .col-7{grid-column:span 7} .aipulse .col-5{grid-column:span 5}
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
.aipulse .shimmer::before{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,.28),transparent);transform:translateX(-100%);animation:aip-sweep 1.1s ease}
@keyframes aip-sweep{to{transform:translateX(100%)}}

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

.aipulse .cloud{display:flex;flex-wrap:wrap;gap:6px 14px;align-items:baseline;align-content:flex-start;line-height:1.15}
.aipulse .cloud span{font-family:var(--disp);font-weight:700;color:var(--ink-dim);opacity:0;transform:translateY(6px);transition:opacity .5s ease,transform .5s ease;white-space:nowrap}
.aipulse .cloud span.in{opacity:1;transform:none}
.aipulse .cloud .s1{font-size:15px;font-weight:500;color:var(--ink-faint)}
.aipulse .cloud .s2{font-size:19px}
.aipulse .cloud .s3{font-size:25px;color:var(--ink-dim)}
.aipulse .cloud .s4{font-size:33px;color:var(--gold)}
.aipulse .cloud .s5{font-size:42px;color:var(--accent)}

.aipulse .ticker{position:relative;min-height:150px}
.aipulse .quotes{position:relative;min-height:120px}
.aipulse .q{position:absolute;inset:0;opacity:0;transform:translateY(10px);transition:opacity .6s ease,transform .6s ease;pointer-events:none}
.aipulse .q.on{opacity:1;transform:none;position:relative}
.aipulse .q .txt{font-family:var(--disp);font-weight:500;font-size:clamp(19px,2.4vw,26px);line-height:1.28;color:var(--ink)}
.aipulse .q .txt .mark{color:var(--accent);font-weight:700}
.aipulse .q .meta{margin-top:12px;font-family:var(--mono);font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-faint);display:flex;align-items:center;gap:9px}
.aipulse .q .meta .tag{color:var(--gold)}
.aipulse .q .meta .anon{color:var(--ink-dim)}
.aipulse .qnav{display:flex;gap:6px;margin-top:16px}
.aipulse .qnav i{width:22px;height:3px;border-radius:2px;background:var(--track);cursor:pointer;transition:background .3s}
.aipulse .qnav i.on{background:var(--accent)}

.aipulse .foot{margin-top:30px;padding:26px;border:1px solid var(--line);border-radius:6px;background:linear-gradient(120deg,rgba(245,90,44,.14),rgba(8,24,33,.2) 65%);display:flex;flex-wrap:wrap;gap:18px 24px;align-items:center;justify-content:space-between}
.aipulse .foot .h{font-family:var(--disp);font-weight:700;font-size:clamp(20px,2.4vw,26px);line-height:1.1;max-width:24ch}
.aipulse .foot p{color:var(--ink-dim);font-size:13.5px;margin-top:5px;max-width:52ch}
.aipulse .cta{font-weight:600;font-size:14.5px;color:var(--ground);background:var(--ink);padding:13px 22px;border-radius:4px;text-decoration:none;white-space:nowrap;transition:transform .15s ease,background .15s ease;display:inline-flex;gap:8px;align-items:center}
.aipulse .cta:hover{background:#fff;transform:translateY(-1px)}
.aipulse .cta:focus-visible{outline:2px solid var(--accent);outline-offset:3px}
.aipulse .disclaimer{margin-top:18px;font-family:var(--mono);font-size:10.5px;color:var(--ink-faint);letter-spacing:.03em;text-align:center}

@media (max-width:820px){
  .aipulse .hero{grid-template-columns:1fr;gap:16px}
  .aipulse .counter{text-align:left}
  .aipulse .col-7,.aipulse .col-5{grid-column:span 12}
}
@media (prefers-reduced-motion:reduce){
  .aipulse .dot{animation:none}
  .aipulse .shimmer::before{display:none}
}
`;

const SHELL = `
<div class="wrap">
  <div class="topbar">
    <span class="eyebrow">live from the room</span>
    <div class="livewrap">
      <span class="live"><span class="dot"></span>live</span>
      <span>ai workshop cohort · brussels + online</span>
    </div>
  </div>

  <div class="hero">
    <div>
      <h2>they already reach for AI.<br><span class="hl">few reach past the chatbot.</span></h2>
      <p class="hsub">Anonymous answers from the practitioners who join our AI workshops, in policy, public affairs and campaigns. No names, no attribution, just the honest picture of where teams are today.</p>
    </div>
    <div class="counter">
      <div class="big"><span data-respn>0</span></div>
      <div class="cap">responses in</div>
      <div class="upd">▲ last reply <span data-ago>2</span>s ago</div>
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
    <div class="panel col-5">
      <div class="p-head"><div class="p-title">What they want from the session</div><div class="p-note">their words</div></div>
      <div class="cloud" data-cloud></div>
    </div>
    <div class="panel col-7 ticker">
      <div class="p-head"><div class="p-title">Streaming in, from the cohort</div><div class="p-note" data-qcount>reply 1 / 8</div></div>
      <div class="quotes" data-quotes></div>
      <div class="qnav" data-qnav></div>
    </div>
  </div>

  <div class="foot">
    <div>
      <div class="h">These are real answers. The next ones could be your team&rsquo;s.</div>
      <p>We run hands-on AI workshops for campaigners, public affairs and policy teams, in Brussels and online. Come find where your gap is.</p>
    </div>
    <a class="cta" href="/events">see the workshops →</a>
  </div>

  <p class="disclaimer">These insights are drawn from anonymous participant surveys, covering our workshops from 2026 to date. Respondents consented to their answers being shared for marketing purposes. Any reference to a specific organisation, or anything that could reveal an identity, has been modified. No response is attributable to any individual.</p>
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
const CLOUD: [string, number][] = [
  ['AI agents', 5], ['assistants', 4], ['position papers', 4], ['prompting', 3], ['automation', 4],
  ['strategising', 3], ['reaching decision-makers', 2], ['streamline my work', 3], ['beyond chatbots', 2],
  ['new ideas', 2], ['team coordination', 2], ['summaries', 2], ['its limitations', 1], ['research', 1], ['sharper reports', 1],
];
const QUOTES: [string, string][] = [
  ['It significantly increases my productivity, for many types of work, inside and outside the workplace.', 'how AI helps now'],
  ['Being a non-native English speaker, AI helps <span class="mark">tune the language</span> and makes the text smooth.', 'how AI helps now'],
  ['I put together a coherent position that made both sense and internal consensus.', 'how AI helps now'],
  ['Summaries for meetings, fine-tuning bullet points, drafting sharper emails.', 'how AI helps now'],
  ['Drafting speeches and speaking points from the inputs I provide.', 'how AI helps now'],
  ['What I want: to <span class="mark">create an assistant</span> and use AI for position papers.', 'what they want next'],
  ['I want to get into <span class="mark">AI agents</span> for recurring tasks.', 'what they want next'],
  ['Show me how AI can streamline my work, and where its limits are.', 'what they want next'],
];

export default function AiPulseBoard() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    const timers: Array<ReturnType<typeof setInterval>> = [];
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

    let qi = 0;
    const qEls: HTMLElement[] = [];
    const navEls: HTMLElement[] = [];
    let ticker: ReturnType<typeof setInterval> | undefined;
    const qcount = root.querySelector('[data-qcount]');
    const show = (i: number) => {
      qEls[qi]?.classList.remove('on'); navEls[qi]?.classList.remove('on');
      qi = i;
      qEls[qi]?.classList.add('on'); navEls[qi]?.classList.add('on');
      if (qcount) qcount.textContent = 'reply ' + (qi + 1) + ' / ' + QUOTES.length;
    };
    const resetTicker = () => {
      if (ticker) clearInterval(ticker);
      if (!reduce) { ticker = setInterval(() => show((qi + 1) % QUOTES.length), 4200); timers.push(ticker); }
    };
    const buildQuotes = () => {
      const q = root.querySelector('[data-quotes]');
      const nav = root.querySelector('[data-qnav]');
      if (!q || !nav) return;
      QUOTES.forEach((item, i) => {
        const d = document.createElement('div');
        d.className = 'q' + (i === 0 ? ' on' : '');
        d.innerHTML = '<div class="txt">“' + item[0] + '”</div><div class="meta"><span class="tag">' + item[1] + '</span><span>·</span><span class="anon">anonymised</span></div>';
        q.appendChild(d); qEls.push(d);
        const n = document.createElement('i');
        if (i === 0) n.className = 'on';
        n.addEventListener('click', () => { show(i); resetTicker(); });
        nav.appendChild(n); navEls.push(n);
      });
    };

    const liveClock = () => {
      if (reduce) return;
      const ago = root.querySelector('[data-ago]');
      let s = 2;
      const iv = setInterval(() => {
        s++;
        if (s > Math.floor(6 + Math.random() * 10)) {
          s = 1;
          const bars = root.querySelectorAll('.panel .track');
          const pick = bars[Math.floor(Math.random() * bars.length)];
          if (pick) { pick.classList.add('shimmer'); setTimeout(() => pick.classList.remove('shimmer'), 1100); }
        }
        if (ago) ago.textContent = String(s);
      }, 1000);
      timers.push(iv);
    };

    const start = () => {
      // Guard on the element (not just the closure) so React's dev-mode double
      // invoke of effects can't build the bars/quotes twice on the same node.
      if (started || root.getAttribute('data-aip-started')) return;
      started = true;
      root.setAttribute('data-aip-started', '1');
      buildBars(root.querySelector('[data-tools]'), TOOLS);
      buildBars(root.querySelector('[data-tasks]'), TASKS);
      countUp(root.querySelector('[data-respn]'), 95, 1400);
      fillBars(); fillRing(); fillGauges(); fillCloud();
      buildQuotes(); resetTicker(); liveClock();
    };

    // The board now sits high on the page, so build the results on mount rather
    // than waiting for a scroll — that is the whole point of the page. Called
    // directly (not via rAF) so it also runs when the page loads in a background
    // tab, where requestAnimationFrame is paused.
    start();

    return () => {
      timers.forEach((t) => clearInterval(t));
    };
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
