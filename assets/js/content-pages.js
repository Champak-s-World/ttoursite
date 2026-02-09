/* =========================================================
   Generic Content Page Renderer
   Used by: kathas.html, rituals.html, yagyas.html,
            acharyas.html, occasions.html
   File: assets/js/content-pages.js
   ========================================================= */

(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);

  /* ---------- helpers ---------- */
  function esc(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function arr(v) {
    return Array.isArray(v) ? v : (v ? [v] : []);
  }

  function waLink(text) {
    const cfg = window.PP_CONFIG?.contact?.primary;
    const number = (cfg?.whatsapp || "").replace(/\D/g, "");
    const base = number ? `https://wa.me/${number}` : "https://wa.me/";
    return base + "?text=" + encodeURIComponent(text || "");
  }

  /* ---------- normalize any master JSON item ---------- */
  function normalize(raw, type) {
    const t = window.PP_LANG.t;

    const title = t(raw.title) || t(raw.name) || raw.id;
    const summary = t(raw.summary) || "";
    const description = t(raw.description) || summary;

    return {
      type,
      id: raw.id,
      title,
      summary,
      description,
      images: arr(raw.images),
      videos: arr(raw.videos),
      tags: arr(raw.tags),
      featured: !!raw.featured,
      featuredRank: Number(raw.featuredRank || 999),
      ctaText: t(raw.ctaText) || (PP_LANG.getLang() === "hi" ? "व्हाट्सएप करें" : "WhatsApp"),
      waText: t(raw.whatsappText) || title,
      meta:
        raw.durationDays ? `${raw.durationDays} days` :
        raw.duration ? t(raw.duration) :
        raw.experienceYears ? `${raw.experienceYears}+ yrs` :
        ""
    };
  }

  /* ---------- card renderer ---------- */
  function cardHTML(x) {
    const img = x.images[0] || "assets/images/placeholder/place.svg";

    return `
      <article class="pp-card"
        data-pp-title="${esc(x.title)}"
        data-pp-desc="${esc(x.description)}"
        data-pp-images='${JSON.stringify(x.images)}'
      >
        <div style="aspect-ratio:16/10;background:#eee">
          <img src="${img}" alt="${esc(x.title)}"
               style="width:100%;height:100%;object-fit:cover">
        </div>

        <div class="pp-pad">
          <div style="font-weight:1000">${esc(x.title)}</div>
          ${x.meta ? `<div class="pp-mini" style="margin-top:6px">${esc(x.meta)}</div>` : ""}

          ${x.tags.length ? `
            <div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap">
              ${x.tags.map(t => `<span class="pp-pill">${esc(t)}</span>`).join("")}
            </div>` : ""}

          <div class="pp-actions" style="margin-top:12px">
            <a class="pp-btn" target="_blank" rel="noopener"
               href="${waLink(x.waText + " " + x.title)}">
              ${esc(x.ctaText)}
            </a>
            <button class="pp-btn pp-btn--ghost" data-pp-pop="1">Pop out</button>
          </div>
        </div>
      </article>
    `;
  }

  /* ---------- render blocks ---------- */
  function renderList(list) {
    $("cpList").innerHTML = list.length
      ? list.map(cardHTML).join("")
      : `<div class="pp-muted">No results.</div>`;
  }

  function renderFeatured(list) {
    const f = list.filter(x => x.featured)
                  .sort((a,b) => a.featuredRank - b.featuredRank)
                  .slice(0, 6);
    $("cpFeatured").innerHTML = f.length
      ? f.map(cardHTML).join("")
      : `<div class="pp-muted">No featured items.</div>`;
  }

  /* ---------- search ---------- */
  let ALL = [];

  function runSearch() {
    const q = ($("cpQuery").value || "").toLowerCase().trim();

    if (q && q.length < 3) {
      $("cpStatus").textContent = "Type 3+ characters…";
      return;
    }

    const out = ALL.filter(x => {
      const hay = `${x.title} ${x.summary} ${x.description} ${x.tags.join(" ")}`.toLowerCase();
      return !q || hay.includes(q);
    });

    $("cpStatus").textContent = `Showing ${out.length} results`;
    renderList(out);
  }

  /* ---------- language refresh ---------- */
  function applyLang() {
    const type = document.body.dataset.collection;
    ALL = ALL.map(x => normalize(x._raw, type));

    $("cpTitle").textContent = PP_LANG.t(window.__CP_PAGE_TITLE || {});
    $("cpSubtitle").textContent = PP_LANG.t(window.__CP_PAGE_SUB || {});

    renderFeatured(ALL);
    renderList(ALL);
  }

  /* ---------- init ---------- */
  async function init() {
    const type = document.body.dataset.collection;
    const jsonPath = document.body.dataset.json;

    try {
      const res = await fetch(jsonPath, { cache: "no-store" });
      const data = await res.json();
      const list = data[type] || [];

      ALL = list.map(x => {
        const n = normalize(x, type);
        n._raw = x; // keep original
        return n;
      });

      $("cpStatus").textContent = `Loaded ${ALL.length} items`;
      renderFeatured(ALL);
      renderList(ALL);

      $("cpSearchBtn").onclick = runSearch;
      $("cpClearBtn").onclick = () => {
        $("cpQuery").value = "";
        runSearch();
      };
      $("cpQuery").addEventListener("input", () => {
        setTimeout(runSearch, 200);
      });

      $("cpLang").onclick = () =>
        PP_LANG.setLang(PP_LANG.getLang() === "hi" ? "en" : "hi");

      applyLang();
    } catch (e) {
      console.error(e);
      $("cpStatus").textContent = "Failed to load content";
    }
  }

  window.addEventListener("pp:langchange", applyLang);
  window.addEventListener("DOMContentLoaded", init);
})();
