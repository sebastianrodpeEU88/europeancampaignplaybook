'use client';

import { useEffect, useRef } from 'react';

// Swipeable "before & after" story carousel — the on-site version of the
// LinkedIn deck. Self-contained: scoped styles + a small vanilla controller for
// swipe/arrows/dots and the bar-fill animation. Uses the site's own fonts.
const SHELL = `
<style>
  .aistory{--orange:#F0512A;--orange-deep:#dd3c13;--navy:#0A1D2B;--cream:#F3EFE6;--ink:#0A1D2B;--gold:#E8A33D;
    --disp:var(--font-display,'Arial Narrow',sans-serif);--bd:var(--font-interface,Arial,sans-serif)}
  .aistory *{box-sizing:border-box}
  .aistory .kick{font-family:var(--bd);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink);opacity:.45;font-weight:600;text-align:center;margin-bottom:14px}
  .aistory .stage{position:relative;width:min(430px,92vw);aspect-ratio:4/5;margin:0 auto}
  .aistory .deck{position:absolute;inset:0;display:flex;overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;border-radius:16px;scrollbar-width:none;box-shadow:0 24px 50px -22px rgba(10,29,43,.5)}
  .aistory .deck::-webkit-scrollbar{display:none}
  .aistory .slide{flex:0 0 100%;scroll-snap-align:center;scroll-snap-stop:always;position:relative;display:flex;flex-direction:column;justify-content:center;padding:clamp(44px,6.5vmin,58px) clamp(22px,4vmin,34px) clamp(28px,4vmin,34px);overflow:hidden}
  .aistory .num{position:absolute;top:16px;right:18px;font-family:var(--disp);font-weight:700;font-size:13px;opacity:.35}
  .aistory .brand{position:absolute;left:18px;top:15px;font-size:11px;font-weight:700;opacity:.6;display:flex;align-items:center;gap:6px;font-family:var(--bd)}
  .aistory .brand .mk{width:15px;height:15px;border:1.6px solid currentColor;border-radius:3px;display:inline-flex;align-items:center;justify-content:center;font-size:9px;flex:none}
  .aistory .s-orange{background:linear-gradient(150deg,var(--orange),var(--orange-deep) 55%,#7a1f0c 140%);color:var(--cream)}
  .aistory .s-navy{background:linear-gradient(160deg,#12324a,var(--navy) 70%);color:var(--cream)}
  .aistory .s-cream{background:var(--cream);color:var(--ink)}
  .aistory .s-cream .num,.aistory .s-cream .brand{color:var(--orange-deep)}
  .aistory .body{display:flex;flex-direction:column;gap:13px}
  .aistory .eyebrow{font-family:var(--bd);font-size:12px;font-weight:700;letter-spacing:.13em;text-transform:uppercase;opacity:.75}
  .aistory .s-cream .eyebrow{color:var(--orange-deep);opacity:1}
  .aistory h3{font-family:var(--disp);font-weight:700;line-height:1;letter-spacing:-.01em;font-size:clamp(30px,7vmin,46px)}
  .aistory h4{font-family:var(--disp);font-weight:700;line-height:1.02;font-size:clamp(23px,5.4vmin,36px)}
  .aistory .lead{font-size:clamp(14px,2.4vmin,18px);line-height:1.4;opacity:.9;max-width:27ch}
  .aistory .huge{font-family:var(--disp);font-weight:700;font-size:clamp(66px,19vmin,132px);line-height:.82;letter-spacing:-.03em}
  .aistory .accent{color:var(--orange-deep)} .aistory .s-orange .accent,.aistory .s-navy .accent{color:var(--gold)}
  .aistory .quip{font-size:clamp(12px,2.1vmin,15px);opacity:.7;font-style:italic}
  .aistory .u{text-decoration:underline;text-decoration-thickness:3px;text-underline-offset:5px}
  .aistory .rows{display:flex;flex-direction:column;gap:10px}
  .aistory .r{display:flex;align-items:center;gap:11px}
  .aistory .r .lab{font-size:clamp(12px,2.2vmin,15px);font-weight:500;flex:none;width:42%}
  .aistory .r .track{flex:1;height:10px;border-radius:6px;background:rgba(10,29,43,.12);overflow:hidden}
  .aistory .s-navy .r .track,.aistory .s-orange .r .track{background:rgba(243,239,230,.16)}
  .aistory .r .fill{display:block;height:100%;width:0;border-radius:6px;background:var(--orange-deep);transition:width 1.05s cubic-bezier(.2,.75,.25,1)}
  .aistory .s-navy .r .fill,.aistory .s-orange .r .fill{background:var(--gold)}
  .aistory .r .pct{font-family:var(--disp);font-weight:700;font-size:15px;width:42px;text-align:right}
  .aistory .feel{display:flex;flex-direction:column;gap:15px}
  .aistory .feel .q{font-family:var(--disp);font-weight:700;font-size:clamp(18px,3.9vmin,26px);line-height:1.06}
  .aistory .feel .who{font-size:12px;opacity:.75;margin-top:2px}
  .aistory .wordwrap{display:flex;flex-wrap:wrap;gap:6px 12px;align-items:baseline;line-height:1.05}
  .aistory .wordwrap b{font-family:var(--disp);font-weight:700}
  .aistory .w1{font-size:clamp(15px,2.9vmin,19px);opacity:.65} .aistory .w2{font-size:clamp(20px,4.4vmin,29px)} .aistory .w3{font-size:clamp(28px,6vmin,42px);color:var(--orange-deep)}
  .aistory .stars{color:var(--gold);font-size:19px;letter-spacing:2px}
  .aistory .tquote{font-family:var(--disp);font-weight:700;font-size:clamp(18px,3.8vmin,26px);line-height:1.24;letter-spacing:-.01em}
  .aistory .tquote .hl{color:var(--orange-deep)}
  .aistory .twho{display:flex;align-items:center;gap:10px;margin-top:6px}
  .aistory .tavatar{width:38px;height:38px;border-radius:50%;background:var(--orange-deep);color:var(--cream);display:flex;align-items:center;justify-content:center;font-family:var(--disp);font-weight:700;font-size:13px;flex:none}
  .aistory .tname{font-weight:700;font-size:14px;line-height:1.15} .aistory .trole{font-size:12px;opacity:.65}
  .aistory .cal{display:flex;flex-direction:column;gap:8px}
  .aistory .ce{border-left:3px solid var(--orange-deep);padding-left:11px;display:flex;flex-direction:column;gap:1px}
  .aistory .ce .cd{font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;opacity:.6}
  .aistory .ce .ct{font-family:var(--disp);font-weight:700;font-size:clamp(13px,2.5vmin,16px);line-height:1.12}
  .aistory .swipe{display:inline-flex;align-items:center;gap:8px;font-weight:700;font-size:13px;opacity:.9}
  .aistory .swipe .arw{animation:aistory-nudge 1.3s ease-in-out infinite}
  @keyframes aistory-nudge{0%,100%{transform:translateX(0)}50%{transform:translateX(6px)}}
  .aistory .arrows{position:absolute;inset:0;pointer-events:none;display:flex;align-items:center;justify-content:space-between}
  .aistory .arrows button{pointer-events:auto;width:40px;height:40px;border-radius:50%;border:none;cursor:pointer;background:rgba(10,29,43,.55);color:var(--cream);font-size:19px;line-height:1;display:flex;align-items:center;justify-content:center;margin:0 -14px;transition:opacity .2s,transform .15s;box-shadow:0 4px 14px rgba(0,0,0,.3)}
  .aistory .arrows button:hover{transform:scale(1.08)}
  .aistory .arrows button:disabled{opacity:0;pointer-events:none}
  .aistory .dots{display:flex;gap:6px;align-items:center;justify-content:center;flex-wrap:wrap;margin-top:16px}
  .aistory .dots button{width:7px;height:7px;border-radius:50%;border:none;background:rgba(10,29,43,.22);cursor:pointer;padding:0;transition:all .2s}
  .aistory .dots button.on{background:var(--orange-deep);width:20px;border-radius:4px}
  .aistory .counter{text-align:center;font-size:11px;font-weight:600;color:var(--ink);opacity:.5;margin-top:8px;font-variant-numeric:tabular-nums}
  @media (max-width:560px){ .aistory .arrows button{margin:0 4px;width:34px;height:34px} }
  @media (prefers-reduced-motion:reduce){ .aistory .swipe .arw{animation:none} .aistory .deck{scroll-behavior:auto} .aistory .r .fill{transition:none} }
</style>
<p class="kick">the short version · swipe →</p>
<div class="stage">
  <div class="deck" data-deck>
    <section class="slide s-orange"><span class="brand"><span class="mk">↗</span>european campaign playbook</span><span class="num">01</span>
      <div class="body"><span class="eyebrow">AI insights · before &amp; after</span>
        <h3>we asked 95 comms &amp; advocacy pros where they <em class="u" style="font-style:normal">really</em> are with AI</h3>
        <p class="lead">spoiler: probably not where they think. 👀</p><span class="swipe">swipe to find out <span class="arw">→</span></span></div></section>
    <section class="slide s-cream"><span class="brand"><span class="mk">↗</span>european campaign playbook</span><span class="num">02</span>
      <div class="body"><span class="eyebrow">step 1 · the good news</span><h4>“everyone’s using AI now, right?”</h4>
        <div class="huge accent">99%</div><p class="lead">already use chatbots. ChatGPT, Claude, Gemini, Copilot… the whole gang.</p></div></section>
    <section class="slide s-navy"><span class="brand"><span class="mk">↗</span>european campaign playbook</span><span class="num">03</span>
      <div class="body"><span class="eyebrow">step 2 · the catch</span><h4>but almost nobody goes further</h4>
        <div class="rows">
          <div class="r"><span class="lab">tried an AI agent</span><span class="track"><span class="fill" data-w="8"></span></span><span class="pct">8%</span></div>
          <div class="r"><span class="lab">automate anything</span><span class="track"><span class="fill" data-w="1"></span></span><span class="pct">1%</span></div></div>
        <p class="lead"><b>99% chatbots. ~0% everything else.</b> That’s the ceiling most people quietly hit.</p></div></section>
    <section class="slide s-cream"><span class="brand"><span class="mk">↗</span>european campaign playbook</span><span class="num">04</span>
      <div class="body"><span class="eyebrow">what they use it for</span><h4>AI as a very fast intern</h4>
        <div class="rows">
          <div class="r"><span class="lab">writing &amp; editing reports</span><span class="track"><span class="fill" data-w="64"></span></span><span class="pct">64%</span></div>
          <div class="r"><span class="lab">reviewing outputs</span><span class="track"><span class="fill" data-w="39"></span></span><span class="pct">39%</span></div>
          <div class="r"><span class="lab">strategy &amp; oversight</span><span class="track"><span class="fill" data-w="28"></span></span><span class="pct">28%</span></div>
          <div class="r"><span class="lab">partner comms</span><span class="track"><span class="fill" data-w="23"></span></span><span class="pct">23%</span></div></div>
        <p class="quip">…fast, helpful, occasionally makes things up.</p></div></section>
    <section class="slide s-orange"><span class="brand"><span class="mk">↗</span>european campaign playbook</span><span class="num">05</span>
      <div class="body"><span class="eyebrow">how they feel about it</span>
        <div class="feel"><div><div class="q">“it’s under control, I’m testing advanced stuff.” 💪</div><div class="who">53% of the room</div></div>
          <div><div class="q">“I use ChatGPT… but I can’t apply it to my job.” 😅</div><div class="who">42% of the room</div></div></div></div></section>
    <section class="slide s-cream"><span class="brand"><span class="mk">↗</span>european campaign playbook</span><span class="num">06</span>
      <div class="body"><span class="eyebrow">what they’d do with the time back</span>
        <div class="wordwrap"><b class="w3">new ideas</b><b class="w2">reaching decision-makers</b><b class="w2 accent">strategy</b><b class="w1">stakeholders</b><b class="w2">position papers</b><b class="w1">research</b><b class="w1">the big picture</b></div>
        <p class="lead">you know… <b>the actual job.</b> not the busywork.</p></div></section>
    <section class="slide s-navy"><span class="brand"><span class="mk">↗</span>european campaign playbook</span><span class="num">07</span>
      <div class="body"><span class="eyebrow">so… that’s the “before”</span><h3>then they train <span class="accent">with us.</span> 🚀</h3>
        <p class="lead">from building your first campaign → to shipping your own AI agent for policy, comms &amp; strategy.</p><span class="swipe">now the “after” <span class="arw">→</span></span></div></section>
    <section class="slide s-cream"><span class="brand"><span class="mk">↗</span>european campaign playbook</span><span class="num">08</span>
      <div class="body"><span class="stars">★★★★★</span>
        <p class="tquote">“one of the most hands-on sessions I’ve joined in a long time. I loved <span class="hl">creating your own AI agent</span> for policy, comms, or strategy.”</p>
        <div class="twho"><span class="tavatar">PB</span><span><span class="tname">Philippe Bossin</span><br><span class="trole">Digital Organizer &amp; Strategic Communications</span></span></div></div></section>
    <section class="slide s-cream"><span class="brand"><span class="mk">↗</span>european campaign playbook</span><span class="num">09</span>
      <div class="body"><span class="stars">★★★★★</span>
        <p class="tquote">“I would for sure recommend it. His <span class="hl">systemic approach to storytelling</span> was very useful for my PA work.”</p>
        <div class="twho"><span class="tavatar">MO</span><span><span class="tname">Martin Orešić</span><br><span class="trole">Account Director, Hanbury Strategy</span></span></div></div></section>
    <section class="slide s-cream"><span class="brand"><span class="mk">↗</span>european campaign playbook</span><span class="num">10</span>
      <div class="body"><span class="stars">★★★★★</span>
        <p class="tquote">“practical and engaging: solid theory, real campaign examples, and <span class="hl">AI as a tool for creativity and strategy.</span>”</p>
        <div class="twho"><span class="tavatar">RF</span><span><span class="tname">Roberta Fadda</span><br><span class="trole">Communication Specialist &amp; Multimedia Producer</span></span></div></div></section>
    <section class="slide s-cream"><span class="brand"><span class="mk">↗</span>european campaign playbook</span><span class="num">11</span>
      <div class="body"><span class="eyebrow">your move · sept–oct 2026</span><h4>join one. it’s <span class="accent">free.</span></h4>
        <div class="cal">
          <div class="ce"><span class="cd">fri 18 sep · brussels</span><span class="ct">AI for public affairs — L1: fundamentals + agents</span></div>
          <div class="ce"><span class="cd">fri 18 sep · brussels</span><span class="ct">AI for creatives &amp; social media teams</span></div>
          <div class="ce"><span class="cd">thu 1 oct · online</span><span class="ct">AI for public affairs — L1: fundamentals + agents</span></div>
          <div class="ce"><span class="cd">thu 1 oct · online</span><span class="ct">AI for creatives &amp; social media teams</span></div>
          <div class="ce"><span class="cd">fri 9 oct · brussels</span><span class="ct">AI for advocacy — L2: advanced</span></div>
          <div class="ce"><span class="cd">fri 9 oct · brussels</span><span class="ct">policy comms: winning the political narrative</span></div></div></div></section>
  </div>
  <div class="arrows"><button data-prev aria-label="Previous slide">‹</button><button data-next aria-label="Next slide">›</button></div>
</div>
<div class="dots" data-dots role="tablist" aria-label="Story slides"></div>
<div class="counter"><span data-cur>1</span> / <span data-tot>11</span></div>
`;

export default function AiStoryCarousel() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const deck = root.querySelector<HTMLElement>('[data-deck]');
    const dotsWrap = root.querySelector<HTMLElement>('[data-dots]');
    const prev = root.querySelector<HTMLButtonElement>('[data-prev]');
    const next = root.querySelector<HTMLButtonElement>('[data-next]');
    const curEl = root.querySelector<HTMLElement>('[data-cur]');
    if (!deck || !dotsWrap || !prev || !next) return;
    const slides = Array.from(deck.querySelectorAll<HTMLElement>('.slide'));
    let idx = 0;

    const dots = slides.map((_, i) => {
      const b = document.createElement('button');
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', 'Slide ' + (i + 1));
      if (i === 0) b.className = 'on';
      b.addEventListener('click', () => go(i));
      dotsWrap.appendChild(b);
      return b;
    });

    const go = (i: number) => {
      i = Math.max(0, Math.min(slides.length - 1, i));
      deck.scrollTo({ left: slides[i].offsetLeft, behavior: 'smooth' });
    };
    const setActive = (i: number) => {
      if (i === idx) return;
      idx = i;
      dots.forEach((d, j) => d.classList.toggle('on', j === i));
      if (curEl) curEl.textContent = String(i + 1);
      prev.disabled = i === 0;
      next.disabled = i === slides.length - 1;
    };
    const fillBars = (slide: HTMLElement) => {
      slide.querySelectorAll<HTMLElement>('.fill[data-w]').forEach((el, i) => {
        setTimeout(() => { el.style.width = el.getAttribute('data-w') + '%'; }, 100 + i * 130);
      });
    };
    const resetBars = (slide: HTMLElement) => {
      slide.querySelectorAll<HTMLElement>('.fill[data-w]').forEach((el) => { el.style.width = '0'; });
    };

    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        const target = e.target as HTMLElement;
        const i = slides.indexOf(target);
        if (e.isIntersecting && e.intersectionRatio > 0.55) {
          setActive(i);
          if (!target.dataset.filled) { target.dataset.filled = '1'; fillBars(target); }
        } else if (e.intersectionRatio < 0.1 && target.dataset.filled) {
          target.dataset.filled = ''; resetBars(target);
        }
      });
    }, { root: deck, threshold: [0.05, 0.55, 0.9] });
    slides.forEach((s) => io.observe(s));

    prev.addEventListener('click', () => go(idx - 1));
    next.addEventListener('click', () => go(idx + 1));
    prev.disabled = true;

    return () => io.disconnect();
  }, []);

  return <div className="aistory" ref={rootRef} dangerouslySetInnerHTML={{ __html: SHELL }} />;
}
