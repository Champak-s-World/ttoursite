

(function () {
  "use strict";

  const KEY = "pp_tour_maker_v1";
  const $ = (id) => document.getElementById(id);

  let map = null;
  let poly = null;
  let markers = [];

  function loadState() {
    try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; }
  }

  function getItinerary() {
    const st = loadState();
    return Array.isArray(st.itinerary) ? st.itinerary : [];
  }

  function setStatus(msg) {
    const el = $("rmStatus");
    if (el) el.textContent = msg;
  }

  function initMapOnce() {
    if (map) return map;

    const el = $("rmMap");
    if (!el) throw new Error("Map container #rmMap not found");

    map = L.map(el).setView([25.3109, 83.0107], 6);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap"
    }).addTo(map);

    return map;
  }

  function clearLayers() {
    markers.forEach((m) => m.remove());
    markers = [];
    if (poly) { poly.remove(); poly = null; }
  }

  function drawFromItinerary() {
    initMapOnce();
    clearLayers();

    const it = getItinerary().filter(p => typeof p.lat === "number" && typeof p.lng === "number");
    if (it.length === 0) {
      setStatus("No itinerary coords found. Add places in Routes first.");
      return;
    }

    const pts = it.map(p => [p.lat, p.lng]);

    it.forEach((p, i) => {
      const m = L.marker([p.lat, p.lng]).addTo(map);
      m.bindPopup(`<b>${(i+1)}. ${String(p.name || p.id)}</b>`);
      markers.push(m);
    });

    poly = L.polyline(pts, { weight: 5, opacity: 0.9 }).addTo(map);

    const bounds = L.latLngBounds(pts);
    map.fitBounds(bounds.pad(0.2));

    setStatus(`Rendered ${it.length} stops.`);
  }

  function init() {
    $("rmRefresh").addEventListener("click", drawFromItinerary);
    window.addEventListener("storage", (e) => { if (e.key === KEY) drawFromItinerary(); });

    // initial render
    drawFromItinerary();
  }

  window.addEventListener("DOMContentLoaded", init);
})();

