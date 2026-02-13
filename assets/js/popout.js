(function () {
  "use strict";

  function ensure() {
    let r = document.getElementById("ppPop");
    if (r) return r;

    r = document.createElement("div");
    r.id = "ppPop";
    r.className = "pp-pop";
    r.innerHTML = `
      <div class="pp-pop-panel">
        <button class="pp-x" id="ppPopX" type="button">✕</button>
        <div id="ppPopMedia"></div>
        <div class="pp-pop-body">
          <div>
            <div class="pp-h2" id="ppPopTitle">Details</div>
            <div class="pp-muted" id="ppPopSub"></div>
          </div>

          <div id="ppPopDesc" style="margin-top:12px;line-height:1.55;font-weight:700"></div>
          <div class="pp-actions" id="ppPopCTA" style="margin-top:16px;flex-wrap:wrap"></div>
        </div>
      </div>
    `;
    document.body.appendChild(r);

    r.addEventListener("click", (e) => {
      if (e.target === r) close();
    });

    r.querySelector("#ppPopX").addEventListener("click", close);

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });

    return r;
  }

  function open() {
    const r = ensure();
    r.classList.add("open");
    document.body.classList.add("pp-pop-lock");
  }

  function close() {
    const r = document.getElementById("ppPop");
    if (!r) return;
    r.classList.remove("open");
    document.body.classList.remove("pp-pop-lock");
  }

  function decodeHtmlEntities(s) {
    const t = document.createElement("textarea");
    t.innerHTML = s || "";
    return t.value;
  }

  function parseImagesAttr(v) {
    if (!v) return [];
    const raw = decodeHtmlEntities(v).trim();
    try {
      const j = JSON.parse(raw);
      return Array.isArray(j) ? j.filter(Boolean) : [];
    } catch {
      return [];
    }
  }

  function wa(text) {
    const cfg = window.PP_CONFIG?.contact?.primary;
    const number = cfg?.whatsapp?.replace(/\D/g, "") || "";
    const base = number ? `https://wa.me/${number}` : "https://wa.me/";
    return base + "?text=" + encodeURIComponent(text || "");
  }

  function renderCarousel(images) {
    const imgs = Array.isArray(images) ? images.filter(Boolean) : [];
    const main = imgs[0] || "assets/images/placeholder/place.svg";
    const multi = imgs.length > 1;

    return `
      <div style="position:relative">
        <img id="ppCarImg" src="${main}" alt="">
        ${multi ? `
          <button id="ppCarPrev" class="pp-car-btn pp-car-left">‹</button>
          <button id="ppCarNext" class="pp-car-btn pp-car-right">›</button>
          <div id="ppCarDots" class="pp-car-dots">
            ${imgs.map((_, i)=>`<button data-dot="${i}" class="pp-car-dot ${i===0?"on":""}"></button>`).join("")}
          </div>
        ` : ``}
      </div>
    `;
  }

  function wireCarousel(images) {
    const imgs = images || [];
    if (imgs.length <= 1) return;

    let idx = 0;
    const imgEl = document.getElementById("ppCarImg");
    const dots = document.getElementById("ppCarDots");

    function set(i) {
      idx = (i + imgs.length) % imgs.length;
      imgEl.src = imgs[idx];
      dots?.querySelectorAll("[data-dot]").forEach((b) => {
        b.classList.toggle("on", Number(b.dataset.dot) === idx);
      });
    }

    document.getElementById("ppCarPrev").onclick = () => set(idx - 1);
    document.getElementById("ppCarNext").onclick = () => set(idx + 1);
    dots?.querySelectorAll("[data-dot]").forEach((b) => {
      b.onclick = () => set(Number(b.dataset.dot));
    });
  }

  function show(card) {
    const title = card.getAttribute("data-pp-title") || "Details";
    const desc  = card.getAttribute("data-pp-desc") || "";
    const lat   = card.getAttribute("data-pp-lat") || "";
    const lng   = card.getAttribute("data-pp-lng") || "";
    const images = parseImagesAttr(card.getAttribute("data-pp-images"));

    ensure();

    document.getElementById("ppPopTitle").textContent = title;
    document.getElementById("ppPopSub").textContent =
      (lat && lng) ? `Location: ${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)}` : "";

    document.getElementById("ppPopDesc").textContent = desc;

    const media = document.getElementById("ppPopMedia");
    media.innerHTML = renderCarousel(images);
    wireCarousel(images);

    const cta = document.getElementById("ppPopCTA");
    cta.innerHTML = `
      <a class="pp-btn" target="_blank" rel="noopener"
         href="${wa("I want details for " + title)}">WhatsApp</a>
      <button class="pp-btn pp-btn--ghost" type="button" id="ppPopClose">Close</button>
    `;

    cta.querySelector("#ppPopClose").onclick = close;

    open();
  }

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-pp-pop]");
    if (!btn) return;

    const card = btn.closest("[data-pp-title]");
    if (!card) return;

    try {
      show(card);
    } catch (err) {
      console.error("[popout] failed:", err);
    }
  });

  window.PP_POPOUT = { show, close };
})();
