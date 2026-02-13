(function () {
  "use strict";

  const STORAGE_KEY = "pp_tour_maker_v1";
  const $ = (id) => document.getElementById(id);


function getMarkerColor(stop) {
  const cfg = window.PP_CONFIG?.map?.markerColors || {};
  const key =
    (stop.cityId || stop.cityName || stop.source || "default")
      .toString()
      .toLowerCase()
      .replace(/\s+/g, "_");

  return cfg[key] || cfg.default || "#7c3aed";
}

function makeColoredDivIcon(color, label) {
  const text = label != null ? String(label) : "";

  return L.divIcon({
    className: "",
    html: `
      <div class="pp-marker">
        <span class="pp-marker__inner">${text}</span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
}




  /* ---------------- Storage ---------------- */
  function safeParse(s, fb) { try { return JSON.parse(s); } catch { return fb; } }
  function loadState() { return safeParse(localStorage.getItem(STORAGE_KEY) || "{}", {}); }
  function saveState(st) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(st));
    window.dispatchEvent(new CustomEvent("pp:itinerarychange"));
  }
  function getItinerary() {
    const st = loadState();
    return Array.isArray(st.itinerary) ? st.itinerary : [];
  }
  function setItinerary(arr) {
    const st = loadState();
    st.itinerary = Array.isArray(arr) ? arr : [];
    saveState(st);
  }

  /* ---------------- Data ---------------- */
  function pickName(obj) {
    if (!obj) return "";
    if (typeof obj === "string") return obj;
    return obj.en || obj.hi || "";
  }

  function allLocationPlaces() {
  const cities = window.PP_DATA?.locations?.cities || [];
  const out = [];
  for (const c of cities) {
    for (const p of (c.places || [])) {
      out.push({
        id: p.id,
        name: pickName(p.name) || p.id,
        cityId: c.id,                              // ✅ add
        cityName: pickName(c.name) || c.id,
        lat: typeof p.lat === "number" ? p.lat : null,
        lng: typeof p.lng === "number" ? p.lng : null,
        tags: p.tags || [],
        images: p.images || [],
        description: pickName(p.description) || "",
        source: "locations"
      });
    }
  }
  return out;
}

  function searchLocations(q) {
    const qq = (q || "").trim().toLowerCase();
    if (!qq) return [];
    const all = allLocationPlaces();
    return all.filter((x) => {
      const hay = `${x.name} ${x.cityName} ${(x.tags || []).join(" ")}`.toLowerCase();
      return hay.includes(qq);
    }).slice(0, 30);
  }

  async function searchOSM(q) {
    const qq = (q || "").trim();
    if (!qq) return [];
    const url = "https://nominatim.openstreetmap.org/search?format=json&limit=10&q=" + encodeURIComponent(qq);
    const r = await fetch(url, { headers: { "Accept-Language": "en" } });
    const j = await r.json();
    return (j || []).map((x) => ({
      id: "osm_" + (x.place_id || Math.random().toString(16).slice(2)),
      name: x.display_name,
      cityName: "",
      lat: Number(x.lat),
      lng: Number(x.lon),
      tags: ["osm"],
      images: [],
      description: "OpenStreetMap result",
      source: "osm"
    }));
  }

  /* ---------------- UI helpers ---------------- */
  function setStatus(msg) { const el = $("rsStatus"); if (el) el.textContent = msg; }
  function setMapStatus(msg) { const el = $("rmStatus"); if (el) el.textContent = msg; }

  function cardHTML(item) {
    const title = item.name || item.id;
    const img = (item.images && item.images[0]) ? item.images[0] : "assets/images/placeholder/place.svg";
    const tags = (item.tags || []).slice(0, 6);

    return `
      <article class="pp-card"
        data-pp-title="${PP_RENDER.esc(title)}"
        data-pp-desc="${PP_RENDER.esc(item.description || "")}"
        data-pp-lat="${item.lat ?? ""}"
        data-pp-lng="${item.lng ?? ""}"
        data-pp-images='${JSON.stringify(item.images || [])}'
      >
        <div style="aspect-ratio:16/10;background:rgba(0,0,0,.03)">
          <img src="${img}" alt="${PP_RENDER.esc(title)}" style="width:100%;height:100%;object-fit:cover;display:block">
        </div>
        <div class="pp-pad">
          <div style="font-weight:1000">${PP_RENDER.esc(title)}</div>
          <div class="pp-mini" style="margin-top:6px">
            ${item.cityName ? PP_RENDER.esc(item.cityName) + " • " : ""}
            <b>${PP_RENDER.esc(String(item.source).toUpperCase())}</b>
            ${item.lat != null && item.lng != null ? " • " + Number(item.lat).toFixed(5) + ", " + Number(item.lng).toFixed(5) : ""}
          </div>

          <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">
            ${tags.map((t)=>`<span class="pp-pill">${PP_RENDER.esc(t)}</span>`).join("")}
          </div>

          <div class="pp-actions" style="margin-top:12px">
            <button class="pp-btn" type="button" data-add="${PP_RENDER.esc(item.id)}">Add</button>
            <button class="pp-btn pp-btn--ghost" type="button" data-pp-pop="1">Pop out</button>
          </div>
        </div>
      </article>
    `;
  }

  function renderItinerary() {
    const it = getItinerary();
    const box = $("rsItinerary");
    if (!box) return;

    if (!it.length) {
      box.innerHTML = `<div class="pp-muted">No stops yet. Search above and press <b>Add</b>.</div>`;
      return;
    }

    box.innerHTML = it.map((p, i) => {
      const nm = p.name || p.id || "Stop";
      const img = (p.images && p.images[0]) ? p.images[0] : "assets/images/placeholder/place.svg";
      const coords = (typeof p.lat === "number" && typeof p.lng === "number")
        ? `${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}`
        : "No coords";

      return `
        <div class="pp-card pp-pad"
          data-pp-title="${PP_RENDER.esc(nm)}"
          data-pp-desc="${PP_RENDER.esc(p.description || "")}"
          data-pp-lat="${p.lat ?? ""}"
          data-pp-lng="${p.lng ?? ""}"
          data-pp-images='${JSON.stringify(p.images || [])}'
        >
          <div style="display:flex;gap:12px;align-items:flex-start;flex-wrap:wrap">
            <div style="width:120px;max-width:40vw;aspect-ratio:16/11;border-radius:16px;overflow:hidden;border:1px solid var(--border);background:rgba(0,0,0,.03)">
              <img src="${img}" style="width:100%;height:100%;object-fit:cover;display:block" alt="">
            </div>

            <div style="flex:1;min-width:220px">
              <div style="font-weight:1000;font-size:16px;display:flex;gap:10px;align-items:center;flex-wrap:wrap">
  <span class="pp-dot" style="background:${getMarkerColor(p)}"></span>
  <span>${PP_RENDER.esc((i + 1) + ". " + nm)}</span>
  ${p.cityName ? `<span class="pp-pill">${PP_RENDER.esc(p.cityName)}</span>` : ""}
</div>
             
              <div class="pp-mini" style="margin-top:6px">${coords}</div>

              <div class="pp-actions" style="margin-top:10px">
                <button class="pp-btn pp-btn--ghost" type="button" data-up="${i}" ${i === 0 ? "disabled" : ""}>↑</button>
                <button class="pp-btn pp-btn--ghost" type="button" data-down="${i}" ${i === it.length - 1 ? "disabled" : ""}>↓</button>
                <button class="pp-btn pp-btn--ghost" type="button" data-remove="${i}">Remove</button>
                <button class="pp-btn pp-btn--ghost" type="button" data-pp-pop="1">Pop out</button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join("");

    box.querySelectorAll("[data-up]").forEach((b) => {
      b.onclick = () => {
        const i = Number(b.dataset.up);
        const it2 = getItinerary();
        [it2[i - 1], it2[i]] = [it2[i], it2[i - 1]];
        setItinerary(it2);
      };
    });

    box.querySelectorAll("[data-down]").forEach((b) => {
      b.onclick = () => {
        const i = Number(b.dataset.down);
        const it2 = getItinerary();
        [it2[i + 1], it2[i]] = [it2[i], it2[i + 1]];
        setItinerary(it2);
      };
    });

    box.querySelectorAll("[data-remove]").forEach((b) => {
      b.onclick = () => {
        const i = Number(b.dataset.remove);
        const it2 = getItinerary();
        it2.splice(i, 1);
        setItinerary(it2);
      };
    });
  }

  /* ---------------- Map ---------------- */
  let map = null;
  let poly = null;
  let markers = [];

  function initMapOnce() {
    if (map) return map;
    const el = $("rmMap");
    if (!el) throw new Error("Map container #rmMap not found.");
    
    
const cfg = window.PP_CONFIG?.map;
const lat = cfg?.defaultCenter?.lat ?? 25.3109;
const lng = cfg?.defaultCenter?.lng ?? 83.0107;
const zoom = cfg?.defaultZoom ?? 6;

map = L.map(el).setView([lat, lng], zoom);



    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap"
    }).addTo(map);

    return map;
  }

  function clearMap() {
    markers.forEach((m) => m.remove());
    markers = [];
    if (poly) { poly.remove(); poly = null; }
  }

  function drawMapFromItinerary() {
    try {
      initMapOnce();
      clearMap();

      const it = getItinerary().filter(p => typeof p.lat === "number" && typeof p.lng === "number");
      if (!it.length) {
        setMapStatus("No itinerary coords yet.");
        return;
      }

      const pts = it.map(p => [p.lat, p.lng]);

     it.forEach((p, i) => {
  const title = `${i + 1}. ${p.name || p.id}`;
  const color = getMarkerColor(p);
  const icon = makeColoredDivIcon(color, i + 1);


  const m = L.marker([p.lat, p.lng], { icon }).addTo(map);

  // ✅ Mouse-over name
  m.bindTooltip(title, {
    direction: "top",
    offset: [0, -10],
    opacity: 0.95,
    sticky: true
  });

  // Optional: click popup too
  m.bindPopup(`<b>${PP_RENDER.esc(title)}</b>`);

  markers.push(m);
});

      poly = L.polyline(pts, { weight: 5, opacity: 0.9 }).addTo(map);
      map.fitBounds(L.latLngBounds(pts).pad(0.2));
      setMapStatus(`Rendered ${it.length} stops.`);
    } catch (e) {
      console.error(e);
      setMapStatus("Map error: " + (e?.message || e));
    }
  }

  /* ---------------- Search flow ---------------- */
  let lastResults = [];
  let debounce = null;

  async function runSearch(trigger) {
    const q = ($("rsQuery")?.value || "").trim();
    const source = ($("rsSource")?.value || "locations");

    if (!q) {
      $("rsResults").innerHTML = "";
      setStatus("Ready.");
      return;
    }
    if (q.length < 3 && trigger !== "button") {
      setStatus("Type 3+ characters…");
      return;
    }

    setStatus("Searching…");
    try {
      let res = [];
      if (source === "locations") res = searchLocations(q);
      else if (source === "osm") res = await searchOSM(q);
      else {
        const loc = searchLocations(q);
        res = loc;
        if (res.length < 10) res = res.concat(await searchOSM(q));
      }

      lastResults = res;
      $("rsResults").innerHTML = res.map(cardHTML).join("") || `<div class="pp-muted">No results.</div>`;
      setStatus(`Results: ${res.length}`);

      $("rsResults").querySelectorAll("[data-add]").forEach((btn) => {
        btn.onclick = () => {
          const id = btn.dataset.add;
          const item = lastResults.find(x => String(x.id) === String(id));
          if (!item) return;
          const it = getItinerary();
      it.push({
  id: item.id,
  name: item.name,
  cityId: item.cityId || "",          // ✅ add
  cityName: item.cityName || "",      // ✅ add
  lat: item.lat,
  lng: item.lng,
  images: item.images || [],
  description: item.description || "",
  tags: item.tags || [],
  source: item.source || ""
});



          setItinerary(it);
          setStatus("Added: " + item.name);
        };
      });
    } catch (e) {
      console.error(e);
      setStatus("Search failed: " + (e?.message || e));
    }
  }

  function wireButtons() {
    $("rsSearchBtn").onclick = () => runSearch("button");
    $("rsClearBtn").onclick = () => { $("rsQuery").value = ""; $("rsResults").innerHTML = ""; setStatus("Cleared."); };

    $("rsQuery").addEventListener("input", () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => runSearch("typing"), 260);
    });

    $("rsDownloadBtn").onclick = () => {
      const st = loadState();
      const blob = new Blob([JSON.stringify(st, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "tour-itinerary.json";
      a.click();
    };

    $("rsShareBtn").onclick = () => {
      const it = getItinerary();
      const msg = ["Tour Itinerary:", ...it.map((p, i) => `${i + 1}. ${p.name || p.id}`)].join("\n");
      window.open(PP_RENDER.wa(msg), "_blank", "noopener");
    };

    $("rsClearItBtn").onclick = () => { setItinerary([]); };
  }

  function init() {
    wireButtons();
    renderItinerary();
    drawMapFromItinerary();
    setStatus("Ready. Start typing…");
  }

  window.addEventListener("pp:dataloaded", init);
  window.addEventListener("pp:itinerarychange", () => {
    renderItinerary();
    drawMapFromItinerary();
  });

  // Also re-render if another tab changes storage
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) {
      renderItinerary();
      drawMapFromItinerary();
    }
  });
})();
