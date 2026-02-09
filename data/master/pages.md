Done ✅ Separate pages first is the safest path (less coupling, easier debugging).
Below is a clean “content system” that adds these pages:

occasions.html (Festivals / occasions)

rituals.html

kathas.html

yagyas.html

acharyas.html


All pages share one renderer + one search + popout + Hindi/English toggle.


---

0) Folder structure to add

site/
  occasions.html
  rituals.html
  kathas.html
  yagyas.html
  acharyas.html

  assets/
    js/
      lang.js
      content-pages.js

(Your existing: includes.js, site-config.js, render.js, popout.js, CSS remain same.)


---

1) Add language toggle engine

✅ assets/js/lang.js (full file)

(function () {
  "use strict";

  const KEY = "pp_lang";
  const SUPPORTED = ["en", "hi"];

  function getLang() {
    const v = (localStorage.getItem(KEY) || "en").toLowerCase();
    return SUPPORTED.includes(v) ? v : "en";
  }

  function setLang(lang) {
    const v = (lang || "en").toLowerCase();
    localStorage.setItem(KEY, SUPPORTED.includes(v) ? v : "en");
    window.dispatchEvent(new CustomEvent("pp:langchange", { detail: { lang: getLang() } }));
  }

  function t(obj) {
    // bilingual object {en,hi} -> selected language string
    if (!obj) return "";
    if (typeof obj === "string") return obj;
    const lang = getLang();
    return obj[lang] || obj.en || obj.hi || "";
  }

  window.PP_LANG = { getLang, setLang, t };
})();


---

2) Add the shared renderer for ALL content pages

✅ assets/js/content-pages.js (full file)

(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);

  // ---------- helpers ----------
  function esc(s) {
    return String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function uniq(arr) {
    return Array.from(new Set((arr || []).filter(Boolean)));
  }

  function toArray(v) {
    return Array.isArray(v) ? v : (v ? [v] : []);
  }

  function waLink(text) {
    const cfg = window.PP_CONFIG?.contact?.primary;
    const number = (cfg?.whatsapp || "").replace(/\D/g, "");
    const base = number ? `https://wa.me/${number}` : "https://wa.me/";
    return base + "?text=" + encodeURIComponent(text || "");
  }

  // ---------- normalize different master schemas into common "CardItem" ----------
  function normalizeItem(raw, type) {
    const t = window.PP_LANG?.t || ((x) => (typeof x === "string" ? x : (x?.en || x?.hi || "")));
    const id = raw.id || raw.slug || (type + "_" + Math.random().toString(16).slice(2));

    // Common text fields (some files use name instead of title)
    const title = t(raw.title) || t(raw.name) || raw.title || raw.name || id;
    const summary = t(raw.summary) || "";
    const description = t(raw.description) || summary || "";

    const images = toArray(raw.images);
    const videos = toArray(raw.videos);

    const tags = toArray(raw.tags).map(String);

    // Some types have locations/cities, keep as meta line
    const metaParts = [];
    if (raw.durationDays) metaParts.push(`${raw.durationDays} days`);
    if (raw.duration) metaParts.push(t(raw.duration) || raw.duration);
    if (raw.experienceYears) metaParts.push(`${raw.experienceYears}+ yrs`);
    if (raw.kathaType) metaParts.push(String(raw.kathaType));
    if (raw.locations) metaParts.push("Locations: " + toArray(raw.locations).join(", "));
    if (raw.cities) metaParts.push("Cities: " + toArray(raw.cities).join(", "));

    const metaLine = metaParts.join(" • ");

    // CTA + WhatsApp text
    const ctaText = t(raw.ctaText) || (window.PP_LANG.getLang() === "hi" ? "व्हाट्सएप करें" : "WhatsApp");
    const waTextBase = t(raw.whatsappText) || (window.PP_LANG.getLang() === "hi"
      ? "मुझे जानकारी चाहिए:"
      : "I want details for:");

    const featured = !!raw.featured;
    const featuredRank = Number.isFinite(raw.featuredRank) ? raw.featuredRank : 999;

    return {
      type,
      id,
      title,
      summary,
      description,
      tags,
      images,
      videos,
      metaLine,
      ctaText,
      waTextBase,
      featured,
      featuredRank,
      raw // keep original for future use
    };
  }

  function flattenDataset(json, type) {
    // Accept different root keys:
    // occasions.json -> { occasions:[...] }
    // rituals.json   -> { rituals:[...] }
    // kathas.json    -> { kathas:[...] }
    // yagyas.json    -> { yagyas:[...] }
    // acharyas.json  -> { acharyas:[...] }
    const root = json && typeof json === "object" ? json : {};
    const arr =
      root[type] ||
      root.items ||
      root.list ||
      [];

    return (arr || []).map((x) => normalizeItem(x, type));
  }

  // ---------- UI render ----------
  function renderTagChips(tags) {
    const show = (tags || []).slice(0, 8);
    if (!show.length) return "";
    return `<div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">
      ${show.map((t) => `<span class="pp-pill" data-tag="${esc(t)}">${esc(t)}</span>`).join("")}
    </div>`;
  }

  function cardHTML(item) {
    const img = item.images[0] || "assets/images/placeholder/place.svg";
    const sub = item.metaLine || item.summary || "";

    return `
      <article class="pp-card"
        data-pp-title="${esc(item.title)}"
        data-pp-desc="${esc(item.description)}"
        data-pp-images='${JSON.stringify(item.images || [])}'
      >
        <div style="aspect-ratio:16/10;background:rgba(0,0,0,.03)">
          <img src="${img}" alt="${esc(item.title)}"
            style="width:100%;height:100%;object-fit:cover;display:block">
        </div>

        <div class="pp-pad">
          <div style="font-weight:1000">${esc(item.title)}</div>
          ${sub ? `<div class="pp-mini" style="margin-top:6px">${esc(sub)}</div>` : ""}

          ${renderTagChips(item.tags)}

          <div class="pp-actions" style="margin-top:12px">
            <a class="pp-btn" target="_blank" rel="noopener"
               href="${waLink(item.waTextBase + " " + item.title)}">
              ${esc(item.ctaText)}
            </a>
            <button class="pp-btn pp-btn--ghost" type="button" data-pp-pop="1">Pop out</button>
          </div>
        </div>
      </article>
    `;
  }

  function renderList(items) {
    const host = $("cpList");
    if (!host) return;
    host.innerHTML = items.length
      ? items.map(cardHTML).join("")
      : `<div class="pp-muted">No results.</div>`;
  }

  function renderFeatured(items) {
    const host = $("cpFeatured");
    if (!host) return;

    const featured = items
      .filter((x) => x.featured)
      .sort((a, b) => (a.featuredRank - b.featuredRank));

    host.innerHTML = featured.length
      ? featured.slice(0, 6).map(cardHTML).join("")
      : `<div class="pp-muted">No featured items set yet.</div>`;
  }

  function renderTags(items) {
    const host = $("cpTags");
    if (!host) return;

    const all = [];
    items.forEach((x) => (x.tags || []).forEach((t) => all.push(String(t))));
    const tags = uniq(all).sort((a, b) => a.localeCompare(b)).slice(0, 60);

    host.innerHTML = tags.length
      ? tags.map((t) => `<button class="pp-btn pp-btn--ghost" type="button" data-tagbtn="${esc(t)}">${esc(t)}</button>`).join(" ")
      : `<span class="pp-mini">No tags found.</span>`;

    host.querySelectorAll("[data-tagbtn]").forEach((b) => {
      b.onclick = () => {
        $("cpQuery").value = b.dataset.tagbtn;
        runSearch();
      };
    });
  }

  // ---------- search ----------
  let ALL = [];
  function runSearch() {
    const q = ($("cpQuery")?.value || "").trim().toLowerCase();
    const tag = ($("cpTagFilter")?.value || "").trim().toLowerCase();

    const out = ALL.filter((x) => {
      const hay = `${x.title} ${x.summary} ${x.description} ${(x.tags || []).join(" ")} ${x.metaLine}`.toLowerCase();
      const okQ = !q || (q.length >= 3 ? hay.includes(q) : false);
      const okTag = !tag || (x.tags || []).map(String).some((t) => t.toLowerCase() === tag);
      return (q ? okQ : true) && okTag;
    });

    $("cpStatus").textContent =
      q && q.length < 3 ? "Type 3+ characters to search…" : `Showing ${out.length} results`;

    renderList(out);
  }

  // ---------- language toggle UI ----------
  function applyLangUI() {
    const lang = window.PP_LANG.getLang();
    const btn = $("cpLang");
    if (btn) btn.textContent = lang === "hi" ? "EN" : "HI";

    // Page title/subtitle from dataset
    const t = window.PP_LANG.t;
    const titleEl = $("cpTitle");
    const subEl = $("cpSubtitle");

    if (titleEl) titleEl.textContent = t(window.__CP_PAGE_TITLE || { en: "Page", hi: "पेज" });
    if (subEl) subEl.textContent = t(window.__CP_PAGE_SUB || { en: "", hi: "" });

    // Re-render cards in new language (because title/desc are language-dependent)
    // We must re-normalize from stored raw:
    const type = document.body.getAttribute("data-collection");
    ALL = ALL.map((x) => normalizeItem(x.raw, type));

    renderFeatured(ALL);
    renderTags(ALL);
    runSearch();
  }

  // ---------- init ----------
  async function init() {
    const type = document.body.getAttribute("data-collection");
    const jsonPath = document.body.getAttribute("data-json");
    if (!type || !jsonPath) return;

    $("cpStatus").textContent = "Loading…";

    try {
      const res = await fetch(jsonPath, { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to load ${jsonPath} (${res.status})`);
      const data = await res.json();

      ALL = flattenDataset(data, type);
      $("cpStatus").textContent = `Loaded ${ALL.length} items`;

      renderFeatured(ALL);
      renderTags(ALL);
      renderList(ALL);

      // search wiring
      const q = $("cpQuery");
      const btn = $("cpSearchBtn");
      const clear = $("cpClearBtn");
      const tagSel = $("cpTagFilter");

      let timer = null;

      q.addEventListener("input", () => {
        clearTimeout(timer);
        timer = setTimeout(runSearch, 250);
      });

      btn.onclick = runSearch;
      clear.onclick = () => { q.value = ""; tagSel.value = ""; runSearch(); };
      tagSel.onchange = runSearch;

      // language toggle
      $("cpLang").onclick = () => {
        window.PP_LANG.setLang(window.PP_LANG.getLang() === "hi" ? "en" : "hi");
      };

      applyLangUI();
    } catch (e) {
      console.error(e);
      $("cpStatus").textContent = "Load failed. Check JSON path and console.";
      $("cpList").innerHTML = `<div class="pp-muted">Error: ${esc(e.message || e)}</div>`;
    }
  }

  window.addEventListener("pp:langchange", applyLangUI);
  window.addEventListener("DOMContentLoaded", init);
})();


---

3) Create the 5 pages (copy-paste)

Each page differs only by:

data-collection="kathas" etc

data-json="data/master/kathas.json"

title/subtitle (bilingual)


✅ kathas.html

<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Kathas</title>
  <link rel="stylesheet" href="assets/css/base.css" />
  <link rel="stylesheet" href="assets/css/popout.css?v=99" />
</head>

<body data-collection="kathas" data-json="data/master/kathas.json">
  <div data-include="includes/header.html"></div>

  <main class="pp-container">
    <section class="pp-card pp-pad" style="margin-top:12px">
      <div class="pp-split">
        <div>
          <div class="pp-mini" id="cpStatus">…</div>
          <h1 class="pp-h1" id="cpTitle"></h1>
          <div class="pp-muted" id="cpSubtitle"></div>
        </div>

        <div class="pp-actions">
          <button class="pp-btn pp-btn--ghost" id="cpLang" type="button">HI</button>
        </div>
      </div>

      <div class="pp-actions" style="margin-top:12px">
        <input id="cpQuery" class="pp-input" style="flex:1" placeholder="Type 3+ characters to search…" />
        <select id="cpTagFilter" class="pp-input">
          <option value="">All tags</option>
          <option value="ram">ram</option>
          <option value="shiv">shiv</option>
          <option value="katha">katha</option>
        </select>
        <button class="pp-btn" id="cpSearchBtn" type="button">Search</button>
        <button class="pp-btn pp-btn--ghost" id="cpClearBtn" type="button">Clear</button>
      </div>
    </section>

    <section class="pp-card pp-pad" style="margin-top:12px">
      <div class="pp-h2">Featured</div>
      <div class="pp-grid" id="cpFeatured" style="margin-top:12px"></div>
    </section>

    <section class="pp-card pp-pad" style="margin-top:12px">
      <div class="pp-h2">Tags</div>
      <div id="cpTags" style="margin-top:12px;display:flex;gap:10px;flex-wrap:wrap"></div>
    </section>

    <section class="pp-card pp-pad" style="margin-top:12px">
      <div class="pp-h2">All Kathas</div>
      <div class="pp-grid" id="cpList" style="margin-top:12px"></div>
    </section>
  </main>

  <div data-include="includes/footer.html"></div>

  <script>
    window.__CP_PAGE_TITLE = { en: "Kathas", hi: "कथाएँ" };
    window.__CP_PAGE_SUB = { en: "Ramkatha, Bhagwat Katha, Shiv Mahapuran and more.", hi: "रामकथा, भागवत कथा, शिवमहापुराण आदि।" };
  </script>

  <script src="assets/js/includes.js"></script>
  <script src="assets/js/site-config.js"></script>
  <script src="assets/js/lang.js"></script>
  <script src="assets/js/render.js"></script>
  <script src="assets/js/popout.js?v=99"></script>
  <script src="assets/js/content-pages.js?v=1"></script>
</body>
</html>

✅ rituals.html

<!doctype html><html lang="en"><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Rituals</title>
<link rel="stylesheet" href="assets/css/base.css"/><link rel="stylesheet" href="assets/css/popout.css?v=99"/>
</head>
<body data-collection="rituals" data-json="data/master/rituals.json">
<div data-include="includes/header.html"></div>

<main class="pp-container">
  <section class="pp-card pp-pad" style="margin-top:12px">
    <div class="pp-split">
      <div>
        <div class="pp-mini" id="cpStatus">…</div>
        <h1 class="pp-h1" id="cpTitle"></h1>
        <div class="pp-muted" id="cpSubtitle"></div>
      </div>
      <div class="pp-actions"><button class="pp-btn pp-btn--ghost" id="cpLang" type="button">HI</button></div>
    </div>
    <div class="pp-actions" style="margin-top:12px">
      <input id="cpQuery" class="pp-input" style="flex:1" placeholder="Type 3+ characters to search…"/>
      <select id="cpTagFilter" class="pp-input"><option value="">All tags</option></select>
      <button class="pp-btn" id="cpSearchBtn" type="button">Search</button>
      <button class="pp-btn pp-btn--ghost" id="cpClearBtn" type="button">Clear</button>
    </div>
  </section>

  <section class="pp-card pp-pad" style="margin-top:12px">
    <div class="pp-h2">Featured</div>
    <div class="pp-grid" id="cpFeatured" style="margin-top:12px"></div>
  </section>

  <section class="pp-card pp-pad" style="margin-top:12px">
    <div class="pp-h2">All Rituals</div>
    <div class="pp-grid" id="cpList" style="margin-top:12px"></div>
  </section>
</main>

<div data-include="includes/footer.html"></div>

<script>
  window.__CP_PAGE_TITLE = { en: "Rituals & Pujas", hi: "अनुष्ठान व पूजा" };
  window.__CP_PAGE_SUB = { en: "Rudrabhishek, Tripindi Shraddh, Narayani Jaap and more.", hi: "रुद्राभिषेक, त्रिपिंडी श्राद्ध, नारायणी जाप आदि।" };
</script>

<script src="assets/js/includes.js"></script>
<script src="assets/js/site-config.js"></script>
<script src="assets/js/lang.js"></script>
<script src="assets/js/render.js"></script>
<script src="assets/js/popout.js?v=99"></script>
<script src="assets/js/content-pages.js?v=1"></script>
</body></html>

✅ yagyas.html

<!doctype html><html lang="en"><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Yagyas</title>
<link rel="stylesheet" href="assets/css/base.css"/><link rel="stylesheet" href="assets/css/popout.css?v=99"/>
</head>
<body data-collection="yagyas" data-json="data/master/yagyas.json">
<div data-include="includes/header.html"></div>

<main class="pp-container">
  <section class="pp-card pp-pad" style="margin-top:12px">
    <div class="pp-split">
      <div>
        <div class="pp-mini" id="cpStatus">…</div>
        <h1 class="pp-h1" id="cpTitle"></h1>
        <div class="pp-muted" id="cpSubtitle"></div>
      </div>
      <div class="pp-actions"><button class="pp-btn pp-btn--ghost" id="cpLang" type="button">HI</button></div>
    </div>
    <div class="pp-actions" style="margin-top:12px">
      <input id="cpQuery" class="pp-input" style="flex:1" placeholder="Type 3+ characters to search…"/>
      <select id="cpTagFilter" class="pp-input"><option value="">All tags</option></select>
      <button class="pp-btn" id="cpSearchBtn" type="button">Search</button>
      <button class="pp-btn pp-btn--ghost" id="cpClearBtn" type="button">Clear</button>
    </div>
  </section>

  <section class="pp-card pp-pad" style="margin-top:12px">
    <div class="pp-h2">Featured</div>
    <div class="pp-grid" id="cpFeatured" style="margin-top:12px"></div>
  </section>

  <section class="pp-card pp-pad" style="margin-top:12px">
    <div class="pp-h2">All Yagyas</div>
    <div class="pp-grid" id="cpList" style="margin-top:12px"></div>
  </section>
</main>

<div data-include="includes/footer.html"></div>

<script>
  window.__CP_PAGE_TITLE = { en: "Yagyas & Havan", hi: "यज्ञ व हवन" };
  window.__CP_PAGE_SUB = { en: "Shatchandi, Sahasra Chandi, Dashmahavidya Jaap and more.", hi: "शतचंडी, सहस्र चंडी, दशमहाविद्या जाप आदि।" };
</script>

<script src="assets/js/includes.js"></script>
<script src="assets/js/site-config.js"></script>
<script src="assets/js/lang.js"></script>
<script src="assets/js/render.js"></script>
<script src="assets/js/popout.js?v=99"></script>
<script src="assets/js/content-pages.js?v=1"></script>
</body></html>

✅ occasions.html

<!doctype html><html lang="en"><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Occasions</title>
<link rel="stylesheet" href="assets/css/base.css"/><link rel="stylesheet" href="assets/css/popout.css?v=99"/>
</head>
<body data-collection="occasions" data-json="data/master/occasions.json">
<div data-include="includes/header.html"></div>

<main class="pp-container">
  <section class="pp-card pp-pad" style="margin-top:12px">
    <div class="pp-split">
      <div>
        <div class="pp-mini" id="cpStatus">…</div>
        <h1 class="pp-h1" id="cpTitle"></h1>
        <div class="pp-muted" id="cpSubtitle"></div>
      </div>
      <div class="pp-actions"><button class="pp-btn pp-btn--ghost" id="cpLang" type="button">HI</button></div>
    </div>
    <div class="pp-actions" style="margin-top:12px">
      <input id="cpQuery" class="pp-input" style="flex:1" placeholder="Type 3+ characters to search…"/>
      <select id="cpTagFilter" class="pp-input"><option value="">All tags</option></select>
      <button class="pp-btn" id="cpSearchBtn" type="button">Search</button>
      <button class="pp-btn pp-btn--ghost" id="cpClearBtn" type="button">Clear</button>
    </div>
  </section>

  <section class="pp-card pp-pad" style="margin-top:12px">
    <div class="pp-h2">Featured</div>
    <div class="pp-grid" id="cpFeatured" style="margin-top:12px"></div>
  </section>

  <section class="pp-card pp-pad" style="margin-top:12px">
    <div class="pp-h2">All Occasions</div>
    <div class="pp-grid" id="cpList" style="margin-top:12px"></div>
  </section>
</main>

<div data-include="includes/footer.html"></div>

<script>
  window.__CP_PAGE_TITLE = { en: "Festivals & Occasions", hi: "पर्व व अवसर" };
  window.__CP_PAGE_SUB = { en: "Important dates with services linked via tags.", hi: "टैग्स के आधार पर सेवाएँ लिंक होंगी।" };
</script>

<script src="assets/js/includes.js"></script>
<script src="assets/js/site-config.js"></script>
<script src="assets/js/lang.js"></script>
<script src="assets/js/render.js"></script>
<script src="assets/js/popout.js?v=99"></script>
<script src="assets/js/content-pages.js?v=1"></script>
</body></html>

✅ acharyas.html

<!doctype html><html lang="en"><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Acharyas</title>
<link rel="stylesheet" href="assets/css/base.css"/><link rel="stylesheet" href="assets/css/popout.css?v=99"/>
</head>
<body data-collection="acharyas" data-json="data/master/acharyas.json">
<div data-include="includes/header.html"></div>

<main class="pp-container">
  <section class="pp-card pp-pad" style="margin-top:12px">
    <div class="pp-split">
      <div>
        <div class="pp-mini" id="cpStatus">…</div>
        <h1 class="pp-h1" id="cpTitle"></h1>
        <div class="pp-muted" id="cpSubtitle"></div>
      </div>
      <div class="pp-actions"><button class="pp-btn pp-btn--ghost" id="cpLang" type="button">HI</button></div>
    </div>
    <div class="pp-actions" style="margin-top:12px">
      <input id="cpQuery" class="pp-input" style="flex:1" placeholder="Type 3+ characters to search…"/>
      <select id="cpTagFilter" class="pp-input"><option value="">All tags</option></select>
      <button class="pp-btn" id="cpSearchBtn" type="button">Search</button>
      <button class="pp-btn pp-btn--ghost" id="cpClearBtn" type="button">Clear</button>
    </div>
  </section>

  <section class="pp-card pp-pad" style="margin-top:12px">
    <div class="pp-h2">Featured</div>
    <div class="pp-grid" id="cpFeatured" style="margin-top:12px"></div>
  </section>

  <section class="pp-card pp-pad" style="margin-top:12px">
    <div class="pp-h2">All Acharyas</div>
    <div class="pp-grid" id="cpList" style="margin-top:12px"></div>
  </section>
</main>

<div data-include="includes/footer.html"></div>

<script>
  window.__CP_PAGE_TITLE = { en: "Acharyas & Pandits", hi: "आचार्य व पंडित" };
  window.__CP_PAGE_SUB = { en: "Browse specialties, cities, and book via WhatsApp.", hi: "विशेषता, शहर देखें और व्हाट्सएप से बुक करें।" };
</script>

<script src="assets/js/includes.js"></script>
<script src="assets/js/site-config.js"></script>
<script src="assets/js/lang.js"></script>
<script src="assets/js/render.js"></script>
<script src="assets/js/popout.js?v=99"></script>
<script src="assets/js/content-pages.js?v=1"></script>
</body></html>


---

4) Minimal starter JSONs (if you don’t already have them)

Create these files (starter content; expand later):

data/master/occasions.json

data/master/rituals.json

data/master/yagyas.json

data/master/acharyas.json


If you want, paste your current JSONs and I’ll align them to the shared schema.


---

5) How Hindi–English “transactions” will work (already supported)

Your JSON fields like { "en": "...", "hi": "..." } are read by PP_LANG.t()

Toggle button switches language:

UI title/subtitle changes

Card titles/descriptions change

WhatsApp message uses whatsappText in that language



✅ Result: bilingual browsing + bilingual inquiry message.


---

Next step

Tell me which one you want first to wire with real data:

1) rituals.json
2) kathas.json (you already have)
3) yagyas.json
4) acharyas.json
5) occasions.json

Reply with a number and paste that JSON if you have it.