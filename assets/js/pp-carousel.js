/* =========================================================
   PP Carousel (Reusable)
   + Thumbnails + Progress bar + Counter + Auto Captions
   + Thumbnail hover titles (tooltips)
   ========================================================= */

(function () {
  "use strict";

  const $$ = (root, sel) => Array.from((root || document).querySelectorAll(sel));
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

  function makeEl(tag, cls, attrs) {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (attrs) Object.keys(attrs).forEach((k) => el.setAttribute(k, attrs[k]));
    return el;
  }

  function ytIframe(id) {
    const iframe = document.createElement("iframe");
    iframe.loading = "lazy";
    iframe.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.allowFullscreen = true;
    iframe.src = `https://www.youtube.com/embed/${encodeURIComponent(
      id
    )}?rel=0&modestbranding=1`;
    return iframe;
  }

  function getThumbSrc(slide) {
    // 1) explicit thumb attr
    const th = slide.getAttribute("data-thumb");
    if (th) return th;

    // 2) image inside slide
    const img = slide.querySelector("img");
    if (img && img.getAttribute("src")) return img.getAttribute("src");

    // 3) youtube thumbnail
    const yt = slide.getAttribute("data-yt");
    if (yt) return `https://i.ytimg.com/vi/${encodeURIComponent(yt)}/hqdefault.jpg`;

    // 4) fallback
    return "assets/images/placeholder/place.svg";
  }

  function ensureCaption(slide) {
    // If user provided a manual caption block, keep it.
    if (slide.querySelector(".ppc-caption")) return;

    const kicker = slide.getAttribute("data-kicker") || "";
    const title = slide.getAttribute("data-title") || "";
    const sub = slide.getAttribute("data-sub") || "";
    const chip = slide.getAttribute("data-chip") || "";

    if (!kicker && !title && !sub && !chip) return;

    const cap = makeEl("div", "ppc-caption");
    const left = makeEl("div", "left");

    if (kicker) {
      const k = makeEl("div", "kicker");
      k.textContent = kicker;
      left.appendChild(k);
    }
    if (title) {
      const t = makeEl("div", "title");
      t.textContent = title;
      left.appendChild(t);
    }
    if (sub) {
      const s = makeEl("div", "sub");
      s.textContent = sub;
      left.appendChild(s);
    }

    cap.appendChild(left);

    if (chip) {
      const c = makeEl("span", "ppc-chip");
      c.textContent = chip;
      cap.appendChild(c);
    }

    slide.appendChild(cap);
  }

  function initOne(host) {
    if (!host || host.__ppc_inited) return;
    host.__ppc_inited = true;

    const initialSlides = $$(host, ".ppc-slide");
    if (!initialSlides.length) return;

    const autoplay = host.getAttribute("autoplay") === "1";
    const interval = Number(host.getAttribute("interval") || 4500);
    const loop = host.getAttribute("loop") !== "0";

    let frame = host.querySelector(".ppc-frame");
    let track = host.querySelector(".ppc-track");

    // Wrap-only-slides case
    if (!frame || !track) {
      const old = initialSlides.map((s) => s);
      host.innerHTML = "";
      frame = makeEl("div", "ppc-frame");
      track = makeEl("div", "ppc-track");
      old.forEach((s) => track.appendChild(s));
      frame.appendChild(track);
      host.appendChild(frame);
    }

    const slides = $$(host, ".ppc-slide");
    if (!slides.length) return;

    // Ensure captions from data-* (doesn't overwrite manual captions)
    slides.forEach(ensureCaption);

    // Progress
    let prog = host.querySelector(".ppc-progress");
    let progFill = prog ? prog.querySelector("i") : null;
    if (!prog) {
      prog = makeEl("div", "ppc-progress", { "aria-hidden": "true" });
      progFill = makeEl("i");
      prog.appendChild(progFill);
      frame.appendChild(prog);
    }

    // Counter
    let count = host.querySelector(".ppc-count");
    if (!count) {
      count = makeEl("div", "ppc-count", { "aria-label": "Slide counter" });
      frame.appendChild(count);
    }

    // Controls
    if (!host.querySelector(".ppc-controls")) {
      const controls = makeEl("div", "ppc-controls");
      const prevBtn = makeEl("button", "ppc-btn", {
        type: "button",
        "aria-label": "Previous",
        "data-ppc-prev": "1",
      });
      prevBtn.innerHTML = "‹";
      const nextBtn = makeEl("button", "ppc-btn", {
        type: "button",
        "aria-label": "Next",
        "data-ppc-next": "1",
      });
      nextBtn.innerHTML = "›";
      controls.appendChild(prevBtn);
      controls.appendChild(nextBtn);
      frame.appendChild(controls);
    }

    // Dots
    let dots = host.querySelector(".ppc-dots");
    if (!dots) {
      dots = makeEl("div", "ppc-dots", {
        role: "tablist",
        "aria-label": "Carousel dots",
      });
      frame.appendChild(dots);
    }
    dots.innerHTML = "";

    // Thumbs
    let thumbs = host.querySelector(".ppc-thumbs");
    if (!thumbs) {
      thumbs = makeEl("div", "ppc-thumbs", {
        role: "tablist",
        "aria-label": "Carousel thumbnails",
      });
      host.appendChild(thumbs);
    }
    thumbs.innerHTML = "";

    const dotEls = slides.map((_, i) => {
      const d = makeEl("button", "ppc-dot", {
        type: "button",
        role: "tab",
        "aria-label": `Go to slide ${i + 1}`,
      });
      d.onclick = () => go(i, true);
      dots.appendChild(d);
      return d;
    });

    // ---- Thumbnails with hover titles (tooltip via data-tip) ----
    const thumbEls = slides.map((s, i) => {
      const th = makeEl("button", "ppc-thumb", {
        type: "button",
        role: "tab",
        "aria-label": `Go to slide ${i + 1}`,
      });

      const src = getThumbSrc(s);

      // tooltip title priority:
      // 1) data-title on slide
      // 2) caption .title text
      // 3) fallback "Slide N"
      const dt = (s.getAttribute("data-title") || "").trim();
      const capTitle = (s.querySelector(".ppc-caption .title")?.textContent || "").trim();
      const tip = dt || capTitle || `Slide ${i + 1}`;
      th.setAttribute("data-tip", tip);

      // content
      th.innerHTML = `<img loading="lazy" src="${src}" alt="">`;

      // tooltip arrow element (because ::after is used by overlay)
      const arrow = makeEl("span", "ppc-tip-arrow", { "aria-hidden": "true" });
      th.appendChild(arrow);

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
    function ensureYT(i) {
      const s = slides[i];
      if (!s) return;
      const yt = s.getAttribute("data-yt");
      if (!yt) return;
      if (s.__ppc_yt_loaded) return;
      s.__ppc_yt_loaded = true;

      // preserve caption
      const cap = s.querySelector(".ppc-caption");
      s.innerHTML = "";
      s.appendChild(ytIframe(yt));
      if (cap) s.appendChild(cap);
    }

    // Progress bar animation
    let raf = null;
    let cycleStart = 0;
    let cycleMs = Math.max(1200, interval);

    function progressStop() {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = null;
      }
      if (progFill) progFill.style.width = "0%";
    }

    function progressStart() {
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

    function progressRestart() {
      progressStop();
      progressStart();
    }

    // State
    let index = 0;
    let timer = null;

    // Drag/swipe
    let dragging = false;
    let startX = 0;
    let baseX = 0;

    function updateCounter() {
      count.innerHTML = `<b>${index + 1}</b> / ${slides.length}`;
    }

    function updateUI() {
      track.style.transform = `translate3d(${(-index * 100)}%,0,0)`;

      dotEls.forEach((d, i) =>
        d.setAttribute("aria-current", i === index ? "true" : "false")
      );
      thumbEls.forEach((t, i) =>
        t.setAttribute("aria-current", i === index ? "true" : "false")
      );

      // keep active thumb in view
      const activeThumb = thumbEls[index];
      if (activeThumb && activeThumb.scrollIntoView) {
        activeThumb.scrollIntoView({
          block: "nearest",
          inline: "nearest",
          behavior: "smooth",
        });
      }

      updateCounter();
      ensureYT(index);

      if (!loop) {
        const pb = host.querySelector("[data-ppc-prev]");
        const nb = host.querySelector("[data-ppc-next]");
        if (pb) pb.disabled = index === 0;
        if (nb) nb.disabled = index === slides.length - 1;
      }
    }

    function go(next, userAction) {
      const max = slides.length - 1;

      if (loop) {
        if (next < 0) next = max;
        if (next > max) next = 0;
      } else {
        next = clamp(next, 0, max);
      }

      index = next;
      updateUI();

      if (autoplay && slides.length > 1) {
        if (userAction) restartAutoplay();
        progressRestart();
      }
    }

    function next() {
      go(index + 1, true);
    }
    function prev() {
      go(index - 1, true);
    }

    function stopAutoplay() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
      progressStop();
    }

    function startAutoplay() {
      if (!autoplay || slides.length <= 1) return;
      stopAutoplay();
      timer = setInterval(() => {
        cycleStart = performance.now();
        if (progFill) progFill.style.width = "0%";
        next();
      }, Math.max(1200, interval));
      progressStart();
    }

    function restartAutoplay() {
      stopAutoplay();
      startAutoplay();
    }

    // Buttons
    host.querySelector("[data-ppc-next]")?.addEventListener("click", next);
    host.querySelector("[data-ppc-prev]")?.addEventListener("click", prev);

    // Keyboard
    host.tabIndex = host.tabIndex >= 0 ? host.tabIndex : 0;
    host.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      }
    });

    // Drag/swipe
    function onDown(e) {
      if (slides.length <= 1) return;
      dragging = true;
      stopAutoplay();
      startX = e.touches ? e.touches[0].clientX : e.clientX;
      baseX = -index * frame.clientWidth;
      track.style.transition = "none";
    }

    function onMove(e) {
      if (!dragging) return;
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      const dx = x - startX;
      const px = baseX + dx;
      track.style.transform = `translate3d(${px}px,0,0)`;
    }

    function onUp(e) {
      if (!dragging) return;
      dragging = false;

      const x = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
      const dx = x - startX;

      track.style.transition = "";
      const threshold = Math.min(120, frame.clientWidth * 0.18);

      if (dx <= -threshold) next();
      else if (dx >= threshold) prev();
      else updateUI();

      startAutoplay();
    }

    frame.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);

    frame.addEventListener("touchstart", onDown, { passive: true });
    frame.addEventListener("touchmove", onMove, { passive: true });
    frame.addEventListener("touchend", onUp);

    // Pause on hover
    host.addEventListener("mouseenter", stopAutoplay);
    host.addEventListener("mouseleave", startAutoplay);

    // Init
    updateUI();
    startAutoplay();
  }

  function initAll(root) {
    $$(root || document, "[data-ppc], .pp-carousel").forEach(initOne);
  }

  window.PP_CAROUSEL = { initOne, initAll };
  window.addEventListener("pp:includesloaded", () => initAll(document));
  document.addEventListener("DOMContentLoaded", () => initAll(document));
})();
