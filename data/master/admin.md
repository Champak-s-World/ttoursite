Great — 4 = Visual Admin Helper UI ✅
Because GitHub Pages is static (no server write), this admin page will:

Load data/master/locations.json

Let you add/edit/delete cities + places (name EN/HI, lat/lng, tags, images)

Auto validate (missing lat/lng, duplicates, etc.)

Autosave draft to localStorage

Export updated locations.json via Download

Import a JSON file to continue editing

Copy JSON to clipboard (optional)


Below is the complete code for two files:

admin-locations.html

assets/js/admin-locations.js



---

1) admin-locations.html (FULL CODE)

<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Admin — Locations Editor</title>

  <link rel="stylesheet" href="assets/css/base.css" />

  <style>
    .al-wrap{display:grid;grid-template-columns:360px 1fr;gap:12px;margin-top:12px}
    @media (max-width:980px){.al-wrap{grid-template-columns:1fr}}
    .al-list{display:grid;gap:10px}
    .al-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
    .al-row > *{flex:1;min-width:120px}
    .al-small{font-size:12px;opacity:.75}
    .al-danger{border:1px solid rgba(220,38,38,.35);background:rgba(220,38,38,.06)}
    .al-good{border:1px solid rgba(22,163,74,.25);background:rgba(22,163,74,.06)}
    .al-kpi{display:flex;gap:10px;flex-wrap:wrap}
    .al-kpi .pp-pill{font-weight:900}
    textarea.pp-input{min-height:90px;font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;}
    .al-split{display:flex;gap:10px;flex-wrap:wrap;align-items:center;justify-content:space-between}
    .al-places{display:grid;gap:10px}
    .al-place{position:relative}
    .al-place .badge{position:absolute;top:10px;right:10px}
    .al-muted{opacity:.7}
  </style>
</head>

<body>
  <div data-include="includes/header.html"></div>

  <main class="pp-container">
    <section class="pp-card pp-pad" style="margin-top:12px">
      <div class="al-split">
        <div>
          <div class="pp-mini">Visual Admin Helper</div>
          <h1 class="pp-h1">Locations Editor</h1>
          <div class="pp-muted">
            Loads <b>data/master/locations.json</b> • Autosaves draft in <b>localStorage</b> • Export as JSON
          </div>
        </div>
        <div class="pp-actions">
          <button class="pp-btn pp-btn--ghost" id="alLoad" type="button">Reload from file</button>
          <button class="pp-btn pp-btn--ghost" id="alLoadDraft" type="button">Load draft</button>
          <button class="pp-btn" id="alSaveDraft" type="button">Save draft</button>
          <button class="pp-btn" id="alDownload" type="button">Download locations.json</button>
        </div>
      </div>
      <div class="pp-actions" style="margin-top:12px">
        <input class="pp-input" id="alSearch" placeholder="Search city/place/tag…" style="flex:1" />
        <button class="pp-btn pp-btn--ghost" id="alCopyJson" type="button">Copy JSON</button>
        <label class="pp-btn pp-btn--ghost" style="cursor:pointer">
          Import JSON <input id="alImport" type="file" accept="application/json" hidden />
        </label>
      </div>

      <div class="al-kpi" style="margin-top:12px">
        <span class="pp-pill" id="alKpiCities">Cities: 0</span>
        <span class="pp-pill" id="alKpiPlaces">Places: 0</span>
        <span class="pp-pill" id="alKpiMissing">Missing coords: 0</span>
        <span class="pp-pill" id="alKpiDup">Duplicate IDs: 0</span>
        <span class="pp-mini" id="alStatus">Ready.</span>
      </div>
    </section>

    <div class="al-wrap">
      <!-- LEFT: Cities -->
      <section class="pp-card pp-pad">
        <div class="al-split">
          <div>
            <div class="pp-h2">Cities</div>
            <div class="pp-mini">Select a city to edit places</div>
          </div>
          <button class="pp-btn" id="alAddCity" type="button">+ City</button>
        </div>

        <div class="al-list" id="alCityList" style="margin-top:12px"></div>

        <div class="pp-card pp-pad" style="margin-top:12px">
          <div class="pp-h2">City Editor</div>
          <div class="al-row" style="margin-top:10px">
            <input class="pp-input" id="alCityId" placeholder="city id (e.g., ayodhya)" />
            <input class="pp-input" id="alCityEn" placeholder="City name (EN)" />
            <input class="pp-input" id="alCityHi" placeholder="City name (HI)" />
          </div>
          <div class="pp-actions" style="margin-top:10px">
            <button class="pp-btn" id="alCityApply" type="button">Apply</button>
            <button class="pp-btn pp-btn--ghost" id="alCityDelete" type="button">Delete city</button>
          </div>
          <div class="pp-mini al-muted" style="margin-top:8px">
            Tip: keep city IDs lowercase, underscores only. Example: <b>prayagraj</b>.
          </div>
        </div>
      </section>

      <!-- RIGHT: Places -->
      <section class="pp-card pp-pad">
        <div class="al-split">
          <div>
            <div class="pp-h2">Places</div>
            <div class="pp-mini" id="alPlaceHint">Select a city…</div>
          </div>
          <button class="pp-btn" id="alAddPlace" type="button" disabled>+ Place</button>
        </div>

        <div class="al-places" id="alPlaceList" style="margin-top:12px"></div>

        <div class="pp-card pp-pad" style="margin-top:12px">
          <div class="pp-h2">Place Editor</div>

          <div class="al-row" style="margin-top:10px">
            <input class="pp-input" id="alPlaceId" placeholder="place id (e.g., ram_janmabhoomi)" />
            <input class="pp-input" id="alPlaceEn" placeholder="Place name (EN)" />
            <input class="pp-input" id="alPlaceHi" placeholder="Place name (HI)" />
          </div>

          <div class="al-row" style="margin-top:10px">
            <input class="pp-input" id="alLat" placeholder="lat (number)" />
            <input class="pp-input" id="alLng" placeholder="lng (number)" />
            <input class="pp-input" id="alTags" placeholder="tags (comma separated)" />
          </div>

          <div style="margin-top:10px">
            <textarea class="pp-input" id="alDescEn" placeholder="Description (EN)"></textarea>
            <textarea class="pp-input" id="alDescHi" placeholder="Description (HI)" style="margin-top:8px"></textarea>
          </div>

          <div style="margin-top:10px">
            <textarea class="pp-input" id="alImages" placeholder="Images (one per line)&#10;assets/images/ayodhya/ram_janmabhoomi.jpg"></textarea>
          </div>

          <div class="pp-actions" style="margin-top:10px">
            <button class="pp-btn" id="alPlaceApply" type="button">Apply</button>
            <button class="pp-btn pp-btn--ghost" id="alPlaceDelete" type="button">Delete place</button>
          </div>

          <div class="pp-mini al-muted" style="margin-top:8px">
            Images: store files inside <b>assets/images/&lt;cityId&gt;/</b> and add paths here.
          </div>
        </div>
      </section>
    </div>
  </main>

  <div data-include="includes/footer.html"></div>

  <script src="assets/js/includes.js"></script>
  <script src="assets/js/admin-locations.js?v=1"></script>
</body>
</html>


---

2) assets/js/admin-locations.js (FULL CODE)

(function () {
  "use strict";

  const FILE_PATH = "data/master/locations.json";
  const DRAFT_KEY = "pp_locations_admin_draft_v1";

  const $ = (id) => document.getElementById(id);
  const setStatus = (s) => { const el = $("alStatus"); if (el) el.textContent = s; };

  function safeParse(s, fb) { try { return JSON.parse(s); } catch { return fb; } }
  function deepClone(x) { return JSON.parse(JSON.stringify(x)); }

  function esc(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function normId(s) {
    return String(s || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");
  }

  function pick(obj, lang) {
    if (!obj) return "";
    if (typeof obj === "string") return obj;
    return obj[lang] || obj.en || obj.hi || "";
  }

  function toNum(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }

  function splitTags(s) {
    return String(s || "")
      .split(",")
      .map(x => x.trim())
      .filter(Boolean);
  }

  function splitLines(s) {
    return String(s || "")
      .split("\n")
      .map(x => x.trim())
      .filter(Boolean);
  }

  // ---------- state ----------
  let data = { cities: [] };
  let selectedCity = null;   // city id
  let selectedPlace = null;  // place id

  // ---------- compute KPIs / validation ----------
  function computeStats(d) {
    const cities = Array.isArray(d.cities) ? d.cities : [];
    let placesCount = 0;
    let missing = 0;

    const ids = new Map(); // id -> count
    const allIds = [];

    for (const c of cities) {
      allIds.push(c.id);
      const places = Array.isArray(c.places) ? c.places : [];
      placesCount += places.length;
      for (const p of places) {
        allIds.push(p.id);
        if (!(typeof p.lat === "number" && typeof p.lng === "number")) missing++;
      }
    }

    for (const id of allIds) {
      const k = String(id || "");
      ids.set(k, (ids.get(k) || 0) + 1);
    }
    const dup = Array.from(ids.values()).filter(v => v > 1).length;

    return { cities: cities.length, places: placesCount, missing, dup };
  }

  function refreshKPIs() {
    const s = computeStats(data);
    $("alKpiCities").textContent = `Cities: ${s.cities}`;
    $("alKpiPlaces").textContent = `Places: ${s.places}`;
    $("alKpiMissing").textContent = `Missing coords: ${s.missing}`;
    $("alKpiDup").textContent = `Duplicate IDs: ${s.dup}`;
    $("alKpiMissing").className = "pp-pill " + (s.missing ? "al-danger" : "al-good");
    $("alKpiDup").className = "pp-pill " + (s.dup ? "al-danger" : "al-good");
  }

  // ---------- rendering ----------
  function renderCities() {
    const host = $("alCityList");
    const q = ($("alSearch").value || "").trim().toLowerCase();

    const cities = Array.isArray(data.cities) ? data.cities : [];
    const filtered = cities.filter(c => {
      if (!q) return true;
      const hay = `${c.id} ${pick(c.name, "en")} ${pick(c.name, "hi")}`.toLowerCase();
      return hay.includes(q);
    });

    host.innerHTML = filtered.length ? filtered.map(c => {
      const active = (c.id === selectedCity);
      return `
        <button type="button" class="pp-btn ${active ? "" : "pp-btn--ghost"}" data-city="${esc(c.id)}"
          style="width:100%;justify-content:space-between">
          <span><b>${esc(pick(c.name, "en") || c.id)}</b></span>
          <span class="pp-mini">${esc(c.id)}</span>
        </button>
      `;
    }).join("") : `<div class="pp-muted">No cities.</div>`;

    host.querySelectorAll("[data-city]").forEach(b => {
      b.onclick = () => {
        selectedCity = b.dataset.city;
        selectedPlace = null;
        hydrateCityEditor();
        renderCities();
        renderPlaces();
      };
    });

    $("alAddPlace").disabled = !selectedCity;
    $("alPlaceHint").textContent = selectedCity ? `Editing city: ${selectedCity}` : "Select a city…";
  }

  function renderPlaces() {
    const host = $("alPlaceList");
    const q = ($("alSearch").value || "").trim().toLowerCase();

    const city = (data.cities || []).find(c => c.id === selectedCity);
    const places = city?.places || [];

    const filtered = places.filter(p => {
      if (!q) return true;
      const hay = `${p.id} ${pick(p.name, "en")} ${pick(p.name, "hi")} ${(p.tags || []).join(" ")}`.toLowerCase();
      return hay.includes(q);
    });

    host.innerHTML = filtered.length ? filtered.map(p => {
      const active = (p.id === selectedPlace);
      const ok = (typeof p.lat === "number" && typeof p.lng === "number");
      const img = (p.images && p.images[0]) ? p.images[0] : "assets/images/placeholder/place.svg";

      return `
        <div class="pp-card al-place ${active ? "al-good" : ""}">
          <div style="aspect-ratio:16/10;background:rgba(0,0,0,.03);border-radius:18px;overflow:hidden">
            <img src="${esc(img)}" alt="" style="width:100%;height:100%;object-fit:cover;display:block">
          </div>
          <div class="pp-pad">
            <div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:center">
              <div style="font-weight:1000">${esc(pick(p.name, "en") || p.id)}</div>
              <span class="pp-pill badge ${ok ? "al-good" : "al-danger"}">${ok ? "coords ok" : "missing coords"}</span>
            </div>
            <div class="pp-mini" style="margin-top:6px">${esc(p.id)}</div>
            <div class="pp-actions" style="margin-top:12px">
              <button class="pp-btn ${active ? "" : "pp-btn--ghost"}" type="button" data-place="${esc(p.id)}">Edit</button>
              <button class="pp-btn pp-btn--ghost" type="button" data-dup="${esc(p.id)}">Duplicate</button>
            </div>
          </div>
        </div>
      `;
    }).join("") : `<div class="pp-muted">No places in this city.</div>`;

    host.querySelectorAll("[data-place]").forEach(b => {
      b.onclick = () => {
        selectedPlace = b.dataset.place;
        hydratePlaceEditor();
        renderPlaces();
      };
    });

    host.querySelectorAll("[data-dup]").forEach(b => {
      b.onclick = () => duplicatePlace(b.dataset.dup);
    });
  }

  // ---------- editor hydration ----------
  function hydrateCityEditor() {
    const c = (data.cities || []).find(x => x.id === selectedCity);
    $("alCityId").value = c?.id || "";
    $("alCityEn").value = pick(c?.name, "en") || "";
    $("alCityHi").value = pick(c?.name, "hi") || "";
  }

  function hydratePlaceEditor() {
    const c = (data.cities || []).find(x => x.id === selectedCity);
    const p = (c?.places || []).find(x => x.id === selectedPlace);

    $("alPlaceId").value = p?.id || "";
    $("alPlaceEn").value = pick(p?.name, "en") || "";
    $("alPlaceHi").value = pick(p?.name, "hi") || "";
    $("alLat").value = (typeof p?.lat === "number") ? String(p.lat) : "";
    $("alLng").value = (typeof p?.lng === "number") ? String(p.lng) : "";
    $("alTags").value = (p?.tags || []).join(", ");
    $("alDescEn").value = pick(p?.description, "en") || "";
    $("alDescHi").value = pick(p?.description, "hi") || "";
    $("alImages").value = (p?.images || []).join("\n");
  }

  // ---------- mutations ----------
  function addCity() {
    const id = normId(prompt("New city id (e.g., ayodhya):") || "");
    if (!id) return;

    if ((data.cities || []).some(c => c.id === id)) {
      alert("City id already exists.");
      return;
    }

    data.cities.push({
      id,
      name: { en: id.charAt(0).toUpperCase() + id.slice(1), hi: "" },
      places: []
    });

    selectedCity = id;
    selectedPlace = null;
    hydrateCityEditor();
    renderCities();
    renderPlaces();
    refreshKPIs();
    setStatus("City added.");
  }

  function applyCity() {
    if (!selectedCity) return;

    const oldId = selectedCity;
    const newId = normId($("alCityId").value);
    const en = $("alCityEn").value.trim();
    const hi = $("alCityHi").value.trim();

    if (!newId) { alert("City id required."); return; }

    const cities = data.cities || [];
    const c = cities.find(x => x.id === oldId);
    if (!c) return;

    // id change
    if (newId !== oldId) {
      if (cities.some(x => x.id === newId)) { alert("Another city already uses this id."); return; }
      c.id = newId;
      selectedCity = newId;
    }

    c.name = { en, hi };
    setStatus("City saved.");
    renderCities();
    refreshKPIs();
  }

  function deleteCity() {
    if (!selectedCity) return;
    if (!confirm("Delete this city and all its places?")) return;

    data.cities = (data.cities || []).filter(c => c.id !== selectedCity);
    selectedCity = null;
    selectedPlace = null;
    hydrateCityEditor();
    $("alCityId").value = $("alCityEn").value = $("alCityHi").value = "";
    $("alPlaceList").innerHTML = `<div class="pp-muted">Select a city…</div>`;
    refreshKPIs();
    renderCities();
    setStatus("City deleted.");
  }

  function addPlace() {
    if (!selectedCity) return;

    const id = normId(prompt("New place id (e.g., ram_janmabhoomi):") || "");
    if (!id) return;

    const city = (data.cities || []).find(c => c.id === selectedCity);
    if (!city) return;

    if ((city.places || []).some(p => p.id === id)) {
      alert("Place id already exists in this city.");
      return;
    }

    city.places = city.places || [];
    city.places.push({
      id,
      name: { en: id.replace(/_/g, " "), hi: "" },
      lat: null,
      lng: null,
      tags: [],
      images: [],
      description: { en: "", hi: "" }
    });

    selectedPlace = id;
    hydratePlaceEditor();
    renderPlaces();
    refreshKPIs();
    setStatus("Place added.");
  }

  function duplicatePlace(placeId) {
    const city = (data.cities || []).find(c => c.id === selectedCity);
    if (!city) return;
    const p = (city.places || []).find(x => x.id === placeId);
    if (!p) return;

    const newId = normId(prompt("Duplicate place id:", placeId + "_2") || "");
    if (!newId) return;
    if ((city.places || []).some(x => x.id === newId)) { alert("That id already exists."); return; }

    const copy = deepClone(p);
    copy.id = newId;
    city.places.push(copy);

    selectedPlace = newId;
    hydratePlaceEditor();
    renderPlaces();
    refreshKPIs();
    setStatus("Place duplicated.");
  }

  function applyPlace() {
    if (!selectedCity || !selectedPlace) return;

    const city = (data.cities || []).find(c => c.id === selectedCity);
    const p = (city?.places || []).find(x => x.id === selectedPlace);
    if (!p) return;

    const newId = normId($("alPlaceId").value);
    const en = $("alPlaceEn").value.trim();
    const hi = $("alPlaceHi").value.trim();
    const lat = toNum($("alLat").value.trim());
    const lng = toNum($("alLng").value.trim());
    const tags = splitTags($("alTags").value);
    const descEn = $("alDescEn").value.trim();
    const descHi = $("alDescHi").value.trim();
    const images = splitLines($("alImages").value);

    if (!newId) { alert("Place id required."); return; }

    // id change
    if (newId !== p.id) {
      if ((city.places || []).some(x => x.id === newId)) { alert("Another place already uses this id."); return; }
      p.id = newId;
      selectedPlace = newId;
    }

    p.name = { en, hi };
    p.lat = lat;
    p.lng = lng;
    p.tags = tags;
    p.description = { en: descEn, hi: descHi };
    p.images = images;

    setStatus("Place saved.");
    renderPlaces();
    refreshKPIs();
  }

  function deletePlace() {
    if (!selectedCity || !selectedPlace) return;
    if (!confirm("Delete this place?")) return;

    const city = (data.cities || []).find(c => c.id === selectedCity);
    if (!city) return;

    city.places = (city.places || []).filter(p => p.id !== selectedPlace);
    selectedPlace = null;
    $("alPlaceId").value = $("alPlaceEn").value = $("alPlaceHi").value = "";
    $("alLat").value = $("alLng").value = $("alTags").value = "";
    $("alDescEn").value = $("alDescHi").value = $("alImages").value = "";

    renderPlaces();
    refreshKPIs();
    setStatus("Place deleted.");
  }

  // ---------- load/save/export ----------
  async function loadFromFile() {
    setStatus("Loading from file…");
    const res = await fetch(FILE_PATH, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to load ${FILE_PATH} (${res.status})`);
    const json = await res.json();
    data = json && typeof json === "object" ? json : { cities: [] };

    // reset selections
    selectedCity = data.cities?.[0]?.id || null;
    selectedPlace = null;

    hydrateCityEditor();
    renderCities();
    renderPlaces();
    refreshKPIs();
    setStatus("Loaded locations.json");
  }

  function saveDraft() {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(data, null, 2));
    setStatus("Draft saved to localStorage.");
  }

  function loadDraft() {
    const d = safeParse(localStorage.getItem(DRAFT_KEY) || "", null);
    if (!d) { alert("No draft found."); return; }
    data = d;
    selectedCity = data.cities?.[0]?.id || null;
    selectedPlace = null;
    hydrateCityEditor();
    renderCities();
    renderPlaces();
    refreshKPIs();
    setStatus("Draft loaded.");
  }

  function downloadJson() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "locations.json";
    a.click();
    setStatus("Downloaded locations.json");
  }

  async function copyJson() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setStatus("Copied JSON to clipboard.");
    } catch {
      setStatus("Clipboard blocked. Use Download instead.");
    }
  }

  function importJsonFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const json = safeParse(reader.result, null);
      if (!json) { alert("Invalid JSON"); return; }
      data = json;
      selectedCity = data.cities?.[0]?.id || null;
      selectedPlace = null;
      hydrateCityEditor();
      renderCities();
      renderPlaces();
      refreshKPIs();
      setStatus("Imported JSON.");
    };
    reader.readAsText(file);
  }

  // ---------- wiring ----------
  function wire() {
    $("alAddCity").onclick = addCity;
    $("alCityApply").onclick = applyCity;
    $("alCityDelete").onclick = deleteCity;

    $("alAddPlace").onclick = addPlace;
    $("alPlaceApply").onclick = applyPlace;
    $("alPlaceDelete").onclick = deletePlace;

    $("alSaveDraft").onclick = saveDraft;
    $("alLoadDraft").onclick = loadDraft;
    $("alDownload").onclick = downloadJson;
    $("alCopyJson").onclick = copyJson;

    $("alLoad").onclick = () => loadFromFile().catch(e => {
      console.error(e);
      setStatus("Load failed. Check path and console.");
      alert(e.message || e);
    });

    $("alSearch").addEventListener("input", () => {
      renderCities();
      renderPlaces();
    });

    $("alImport").addEventListener("change", (e) => {
      importJsonFile(e.target.files?.[0]);
      e.target.value = "";
    });
  }

  // ---------- init ----------
  document.addEventListener("DOMContentLoaded", () => {
    wire();
    loadFromFile().catch(e => {
      console.error(e);
      setStatus("Could not load locations.json. Check FILE_PATH and server root.");
    });
  });
})();


---

How to use (quick)

1. Open: admin-locations.html


2. Edit cities/places visually


3. Click Save draft (keeps work safe)


4. Click Download locations.json


5. Replace your file:

put downloaded file into: data/master/locations.json



6. Refresh route/tour pages — changes apply instantly ✅




---

Important note about images

This admin page only stores image paths (because browser can’t upload to GitHub).
So you still:

place image files inside assets/images/<cityId>/...

then paste paths in the images box, one per line.



---

If you want, I’ll add 2 power upgrades:

1. A small map preview inside admin (click place → see marker)


2. A “auto-geocode” button (type place name → fetch lat/lng from OpenStreetMap)



Just reply: “Add map preview” or “Add geocode”.