Absolutely. Below are drop-in upgrades that add:

✅ Thumbnail strip (click to jump, highlights active)

✅ Progress bar (fills for each slide during autoplay)

✅ Works anywhere, same component

✅ Still supports images + YouTube slides


You only need to update two files:

1. assets/css/pp-carousel.css (replace with full code below)


2. assets/js/pp-carousel.js (replace with full code below)



No change required to your carousel HTML markup (the component auto-builds thumbs + progress).


---

1) Replace assets/css/pp-carousel.css with this (FULL)

/* =========================================================
   PP Carousel (Reusable) — Light Saffron, Fabulous
   + Thumbnails + Progress bar
   ========================================================= */

:root{
  --ppc-accent: #d97706;
  --ppc-accent2:#f59e0b;
  --ppc-bg: rgba(255,255,255,.72);
  --ppc-border: rgba(31,41,55,.12);
  --ppc-text: #111827;
  --ppc-muted:#6b7280;
}

.pp-carousel{
  border: 1px solid var(--ppc-border);
  border-radius: 22px;
  overflow: hidden;
  background:
    radial-gradient(900px 420px at 10% 0%, rgba(245,158,11,.22), transparent 55%),
    radial-gradient(780px 420px at 90% 20%, rgba(217,119,6,.18), transparent 55%),
    linear-gradient(145deg, rgba(255,247,230,.92), rgba(255,241,214,.78));
  box-shadow: 0 18px 40px rgba(0,0,0,.07);
  position: relative;
}

.pp-carousel *{ box-sizing:border-box; }

.ppc-frame{
  position: relative;
  aspect-ratio: 16/9;
  min-height: 220px;
  background: rgba(0,0,0,.03);
}

.ppc-track{
  display:flex;
  height:100%;
  width:100%;
  transform: translate3d(0,0,0);
  transition: transform 420ms cubic-bezier(.2,.8,.2,1);
  will-change: transform;
}

.ppc-slide{
  min-width: 100%;
  height:100%;
  position:relative;
  overflow:hidden;
}

.ppc-slide img,
.ppc-slide video,
.ppc-slide iframe{
  width:100%;
  height:100%;
  display:block;
  object-fit: cover;
  border:0;
}

.ppc-slide::after{
  content:"";
  position:absolute; inset:0;
  background:
    linear-gradient(180deg, rgba(0,0,0,.18), rgba(0,0,0,0) 40%),
    linear-gradient(0deg, rgba(0,0,0,.25), rgba(0,0,0,0) 55%);
  pointer-events:none;
}

.ppc-caption{
  position:absolute;
  left:14px; right:14px; bottom:14px;
  color:#fff;
  display:flex;
  justify-content:space-between;
  align-items:flex-end;
  gap:12px;
  pointer-events:none;
}

.ppc-caption .left{ max-width: 78%; }
.ppc-caption .kicker{ font-size:12px; font-weight:900; opacity:.92; }
.ppc-caption .title{
  margin-top:4px;
  font-size:22px;
  line-height:1.05;
  font-weight:1000;
  text-shadow: 0 12px 30px rgba(0,0,0,.35);
}
.ppc-caption .sub{
  margin-top:6px;
  font-size:13px;
  opacity:.95;
  text-shadow: 0 12px 30px rgba(0,0,0,.35);
}

.ppc-chip{
  pointer-events:none;
  display:inline-flex;
  align-items:center;
  gap:8px;
  padding:8px 10px;
  border-radius:999px;
  background: rgba(255,255,255,.18);
  border: 1px solid rgba(255,255,255,.22);
  backdrop-filter: blur(10px);
  font-weight: 1000;
  font-size:12px;
  white-space:nowrap;
}

/* controls */
.ppc-controls{
  position:absolute;
  inset: 0;
  display:flex;
  justify-content:space-between;
  align-items:center;
  padding: 10px;
  pointer-events:none;
}

.ppc-btn{
  pointer-events:auto;
  width: 44px;
  height: 44px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,.25);
  background: rgba(17,24,39,.18);
  backdrop-filter: blur(10px);
  color:#fff;
  display:grid;
  place-items:center;
  cursor:pointer;
  transition: transform .12s ease, background .12s ease, border-color .12s ease, opacity .12s ease;
  user-select:none;
}
.ppc-btn:hover{
  transform: translateY(-1px);
  background: rgba(17,24,39,.26);
  border-color: rgba(255,255,255,.35);
}
.ppc-btn:active{ transform: translateY(0px) scale(.98); }
.ppc-btn[disabled]{ opacity:.45; cursor:not-allowed; }

/* dots */
.ppc-dots{
  position:absolute;
  left: 50%;
  bottom: 10px;
  transform: translateX(-50%);
  display:flex;
  gap:8px;
  padding: 8px 10px;
  border-radius: 999px;
  background: rgba(255,255,255,.12);
  border: 1px solid rgba(255,255,255,.18);
  backdrop-filter: blur(12px);
}

.ppc-dot{
  width: 9px;
  height: 9px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,.55);
  background: rgba(255,255,255,.25);
  cursor:pointer;
  transition: transform .12s ease, background .12s ease;
}
.ppc-dot[aria-current="true"]{
  transform: scale(1.2);
  background: linear-gradient(180deg, var(--ppc-accent2), var(--ppc-accent));
  border-color: rgba(255,255,255,.75);
}

/* progress bar (top of frame) */
.ppc-progress{
  position:absolute;
  left: 10px;
  right: 10px;
  top: 10px;
  height: 5px;
  border-radius: 999px;
  background: rgba(255,255,255,.18);
  border: 1px solid rgba(255,255,255,.18);
  overflow:hidden;
  backdrop-filter: blur(10px);
}
.ppc-progress > i{
  display:block;
  height:100%;
  width:0%;
  background: linear-gradient(90deg, var(--ppc-accent2), var(--ppc-accent));
  border-radius: 999px;
  transform: translateZ(0);
}

/* thumbnails strip */
.ppc-thumbs{
  display:flex;
  gap:10px;
  padding: 10px 12px 12px;
  overflow:auto;
  scroll-snap-type: x mandatory;
  border-top: 1px solid var(--ppc-border);
  background: rgba(255,255,255,.62);
}
.ppc-thumbs::-webkit-scrollbar{ height: 10px; }
.ppc-thumbs::-webkit-scrollbar-thumb{
  background: rgba(31,41,55,.15);
  border-radius: 999px;
}

.ppc-thumb{
  flex: 0 0 auto;
  width: 94px;
  height: 54px;
  border-radius: 14px;
  border: 1px solid rgba(31,41,55,.12);
  background: rgba(0,0,0,.03);
  overflow:hidden;
  cursor:pointer;
  scroll-snap-align: start;
  position:relative;
  transition: transform .12s ease, box-shadow .12s ease, border-color .12s ease;
}
.ppc-thumb img{
  width:100%; height:100%; object-fit: cover; display:block;
}
.ppc-thumb::after{
  content:"";
  position:absolute; inset:0;
  background: linear-gradient(180deg, rgba(0,0,0,.0), rgba(0,0,0,.22));
  pointer-events:none;
}
.ppc-thumb:hover{ transform: translateY(-1px); box-shadow: 0 10px 20px rgba(0,0,0,.10); }
.ppc-thumb[aria-current="true"]{
  border-color: rgba(217,119,6,.65);
  box-shadow: 0 0 0 3px rgba(217,119,6,.22);
}
.ppc-thumb .badge{
  position:absolute;
  left:8px; top:8px;
  font-size:12px;
  font-weight:1000;
  padding:6px 8px;
  border-radius:999px;
  background: rgba(255,255,255,.18);
  border: 1px solid rgba(255,255,255,.22);
  backdrop-filter: blur(10px);
  color:#fff;
}

/* optional bar under carousel */
.ppc-bar{
  padding: 12px 14px;
  border-top: 1px solid var(--ppc-border);
  background: rgba(255,255,255,.68);
  display:flex;
  flex-wrap:wrap;
  align-items:center;
  justify-content:space-between;
  gap: 10px;
}

.ppc-meta{ display:flex; flex-direction:column; gap:2px; }
.ppc-meta .m1{ font-weight:1000; color:var(--ppc-text); }
.ppc-meta .m2{ font-size:12px; color:var(--ppc-muted); }

.ppc-actions{ display:flex; gap: 10px; flex-wrap:wrap; }
.ppc-action{
  border:1px solid var(--ppc-border);
  background: rgba(255,255,255,.86);
  padding: 8px 12px;
  border-radius: 999px;
  font-weight: 1000;
  cursor:pointer;
  text-decoration:none;
  color: var(--ppc-text);
  transition: transform .12s ease;
}
.ppc-action.primary{
  background: linear-gradient(180deg, #fde68a, #fff7e6);
  border-color: rgba(217,119,6,.35);
}
.ppc-action:hover{ transform: translateY(-1px); }
.ppc-action:active{ transform: translateY(0px) scale(.99); }

@media (max-width: 680px){
  .ppc-caption .title{ font-size:18px; }
  .ppc-btn{ width: 40px; height: 40px; }
  .ppc-frame{ min-height: 200px; }
  .ppc-thumb{ width: 78px; height: 48px; border-radius: 12px; }
}


---

2) Replace assets/js/pp-carousel.js with this (FULL)

/* =========================================================
   PP Carousel (Reusable)
   + Thumbnails + Progress bar
   - Autoplay (optional)
   - Swipe / drag
   - Keyboard (← →)
   - Dots, Prev/Next
   - Slides:
       <div class="ppc-slide"><img ...></div>
       <div class="ppc-slide"><video ...></video>
       <div class="ppc-slide" data-yt="YOUTUBE_ID"></div>
   Attributes:
     autoplay="1" interval="4500" loop="1"
   ========================================================= */

(function () {
  "use strict";

  const $$ = (root, sel) => Array.from((root || document).querySelectorAll(sel));
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

  function makeEl(tag, cls, attrs){
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (attrs) Object.keys(attrs).forEach(k => el.setAttribute(k, attrs[k]));
    return el;
  }

  function ytIframe(id){
    const iframe = document.createElement("iframe");
    iframe.loading = "lazy";
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.allowFullscreen = true;
    iframe.src = `https://www.youtube.com/embed/${encodeURIComponent(id)}?rel=0&modestbranding=1`;
    return iframe;
  }

  function getThumbSrc(slide){
    // 1) explicit thumb attr
    const th = slide.getAttribute("data-thumb");
    if (th) return th;

    // 2) image inside slide
    const img = slide.querySelector("img");
    if (img && img.getAttribute("src")) return img.getAttribute("src");

    // 3) youtube
    const yt = slide.getAttribute("data-yt");
    if (yt) return `https://i.ytimg.com/vi/${encodeURIComponent(yt)}/hqdefault.jpg`;

    // 4) fallback placeholder (your existing placeholder)
    return "assets/images/placeholder/place.svg";
  }

  function initOne(host){
    if (!host || host.__ppc_inited) return;
    host.__ppc_inited = true;

    const initialSlides = $$(host, ".ppc-slide");
    if (!initialSlides.length) return;

    // Config
    const autoplay = host.getAttribute("autoplay") === "1";
    const interval = Number(host.getAttribute("interval") || 4500);
    const loop = host.getAttribute("loop") !== "0"; // default true

    // Wrap-only-slides case
    let frame = host.querySelector(".ppc-frame");
    let track = host.querySelector(".ppc-track");

    if (!frame || !track){
      const old = initialSlides.map(s => s);
      host.innerHTML = "";
      frame = makeEl("div", "ppc-frame");
      track = makeEl("div", "ppc-track");
      old.forEach(s => track.appendChild(s));
      frame.appendChild(track);
      host.appendChild(frame);
    }

    const slides = $$(host, ".ppc-slide");
    if (!slides.length) return;

    // Ensure progress bar
    let prog = host.querySelector(".ppc-progress");
    let progFill = prog ? prog.querySelector("i") : null;
    if (!prog){
      prog = makeEl("div", "ppc-progress", {"aria-hidden":"true"});
      progFill = makeEl("i");
      prog.appendChild(progFill);
      frame.appendChild(prog);
    }

    // Ensure controls
    if (!host.querySelector(".ppc-controls")){
      const controls = makeEl("div", "ppc-controls");
      const prevBtn = makeEl("button", "ppc-btn", {"type":"button","aria-label":"Previous","data-ppc-prev":"1"});
      prevBtn.innerHTML = "‹";
      const nextBtn = makeEl("button", "ppc-btn", {"type":"button","aria-label":"Next","data-ppc-next":"1"});
      nextBtn.innerHTML = "›";
      controls.appendChild(prevBtn);
      controls.appendChild(nextBtn);
      frame.appendChild(controls);
    }

    // Ensure dots
    let dots = host.querySelector(".ppc-dots");
    if (!dots){
      dots = makeEl("div", "ppc-dots", {"role":"tablist","aria-label":"Carousel dots"});
      frame.appendChild(dots);
    }
    dots.innerHTML = "";

    // Thumbnails (below frame)
    let thumbs = host.querySelector(".ppc-thumbs");
    if (!thumbs){
      thumbs = makeEl("div", "ppc-thumbs", {"role":"tablist","aria-label":"Carousel thumbnails"});
      host.appendChild(thumbs);
    }
    thumbs.innerHTML = "";

    const dotEls = slides.map((_, i) => {
      const d = makeEl("button","ppc-dot",{"type":"button","role":"tab","aria-label":`Go to slide ${i+1}`});
      d.onclick = () => go(i, true);
      dots.appendChild(d);
      return d;
    });

    const thumbEls = slides.map((s, i) => {
      const th = makeEl("button","ppc-thumb",{"type":"button","role":"tab","aria-label":`Go to slide ${i+1}`});
      const src = getThumbSrc(s);
      th.innerHTML = `<img loading="lazy" src="${src}" alt="">`;
      // small badge for youtube/video
      const yt = s.getAttribute("data-yt");
      const vid = s.querySelector("video");
      if (yt) th.insertAdjacentHTML("beforeend", `<span class="badge">▶</span>`);
      else if (vid) th.insertAdjacentHTML("beforeend", `<span class="badge">🎞</span>`);
      th.onclick = () => go(i, true);
      thumbs.appendChild(th);
      return th;
    });

    // Lazy load YouTube iframe on active slide
    function ensureYT(i){
      const s = slides[i];
      if (!s) return;
      const yt = s.getAttribute("data-yt");
      if (!yt) return;
      if (s.__ppc_yt_loaded) return;
      s.__ppc_yt_loaded = true;

      // Keep captions if present by moving them out/in
      const cap = s.querySelector(".ppc-caption");
      s.innerHTML = "";
      s.appendChild(ytIframe(yt));
      if (cap) s.appendChild(cap);
    }

    // Progress bar animation (no CSS animation, we drive it for accuracy)
    let raf = null;
    let cycleStart = 0;
    let cycleMs = Math.max(1200, interval);

    function progressStop(){
      if (raf){ cancelAnimationFrame(raf); raf = null; }
      if (progFill) progFill.style.width = "0%";
    }

    function progressStart(){
      if (!autoplay || slides.length <= 1) return;
      progressStop();
      cycleStart = performance.now();
      cycleMs = Math.max(1200, interval);

      const tick = (now) => {
        const p = clamp((now - cycleStart) / cycleMs, 0, 1);
        if (progFill) progFill.style.width = (p * 100).toFixed(2) + "%";
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }

    function progressRestart(){
      progressStop();
      progressStart();
    }

    // State
    let index = 0;
    let timer = null;

    // Drag/swipe state
    let dragging = false;
    let startX = 0;
    let baseX = 0;

    function updateUI(){
      track.style.transform = `translate3d(${(-index * 100)}%,0,0)`;

      dotEls.forEach((d, i) => d.setAttribute("aria-current", i === index ? "true" : "false"));
      thumbEls.forEach((t, i) => t.setAttribute("aria-current", i === index ? "true" : "false"));

      // keep active thumb in view
      const activeThumb = thumbEls[index];
      if (activeThumb && activeThumb.scrollIntoView){
        activeThumb.scrollIntoView({block:"nearest", inline:"nearest", behavior:"smooth"});
      }

      ensureYT(index);

      if (!loop){
        const pb = host.querySelector("[data-ppc-prev]");
        const nb = host.querySelector("[data-ppc-next]");
        if (pb) pb.disabled = (index === 0);
        if (nb) nb.disabled = (index === slides.length - 1);
      }
    }

    function go(next, userAction){
      const max = slides.length - 1;

      if (loop){
        if (next < 0) next = max;
        if (next > max) next = 0;
      } else {
        next = clamp(next, 0, max);
      }

      index = next;
      updateUI();

      if (autoplay && slides.length > 1){
        if (userAction) restartAutoplay();
        progressRestart();
      }
    }

    function next(){ go(index + 1, true); }
    function prev(){ go(index - 1, true); }

    function stopAutoplay(){
      if (timer){ clearInterval(timer); timer = null; }
      progressStop();
    }

    function startAutoplay(){
      if (!autoplay || slides.length <= 1) return;
      stopAutoplay();
      timer = setInterval(() => {
        // start of new cycle
        cycleStart = performance.now();
        if (progFill) progFill.style.width = "0%";
        next();
      }, Math.max(1200, interval));
      progressStart();
    }

    function restartAutoplay(){
      stopAutoplay();
      startAutoplay();
    }

    // Buttons
    host.querySelector("[data-ppc-next]")?.addEventListener("click", next);
    host.querySelector("[data-ppc-prev]")?.addEventListener("click", prev);

    // Keyboard
    host.tabIndex = host.tabIndex >= 0 ? host.tabIndex : 0;
    host.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight"){ e.preventDefault(); next(); }
      if (e.key === "ArrowLeft"){ e.preventDefault(); prev(); }
    });

    // Drag/swipe
    function onDown(e){
      if (slides.length <= 1) return;
      dragging = true;
      stopAutoplay();
      startX = (e.touches ? e.touches[0].clientX : e.clientX);
      baseX = -index * frame.clientWidth;
      track.style.transition = "none";
    }

    function onMove(e){
      if (!dragging) return;
      const x = (e.touches ? e.touches[0].clientX : e.clientX);
      const dx = x - startX;
      const px = baseX + dx;
      track.style.transform = `translate3d(${px}px,0,0)`;
    }

    function onUp(e){
      if (!dragging) return;
      dragging = false;

      const x = (e.changedTouches ? e.changedTouches[0].clientX : e.clientX);
      const dx = x - startX;

      track.style.transition = ""; // restore
      const threshold = Math.min(120, frame.clientWidth * 0.18);

      if (dx <= -threshold) next();
      else if (dx >= threshold) prev();
      else updateUI();

      startAutoplay();
    }

    frame.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);

    frame.addEventListener("touchstart", onDown, {passive:true});
    frame.addEventListener("touchmove", onMove, {passive:true});
    frame.addEventListener("touchend", onUp);

    // Pause on hover (desktop)
    host.addEventListener("mouseenter", stopAutoplay);
    host.addEventListener("mouseleave", startAutoplay);

    // Init
    updateUI();
    startAutoplay();
  }

  function initAll(root){
    $$(root || document, "[data-ppc], .pp-carousel").forEach(initOne);
  }

  window.PP_CAROUSEL = { initOne, initAll };
  window.addEventListener("pp:includesloaded", () => initAll(document));
  document.addEventListener("DOMContentLoaded", () => initAll(document));
})();


---

3) Home page: nothing new to add (if you already included CSS/JS)

Just ensure your index.html has:

In <head>:

<link rel="stylesheet" href="assets/css/pp-carousel.css" />

Before closing </body>:

<script src="assets/js/pp-carousel.js"></script>

And your carousel block remains the same — thumbnails + progress will appear automatically.


---

Optional: best-practice slide thumbs

If you want a specific thumbnail (different from the slide image), add:

<div class="ppc-slide" data-thumb="assets/images/varanasi/thumbs/kashi.jpg">
  <img src="assets/images/varanasi/kashi.jpg" alt="">
</div>


---

If you want, I can also add a tiny “1 / N” counter on the top-right (looks premium).