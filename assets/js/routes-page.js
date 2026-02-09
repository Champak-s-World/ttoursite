(function () {
  "use strict";

  /* =========================================================
     CONFIG
  ========================================================= */
  const STORAGE_KEY = "pp_tour_maker_v1";
  const $ = (id) => document.getElementById(id);

  /* =========================================================
     STORAGE HELPERS
  ========================================================= */
  function safeParse(str, fallback) {
    try {
      return JSON.parse(str);
    } catch {
      return fallback;
    }
  }

  function loadState() {
    return safeParse(localStorage.getItem(STORAGE_KEY) || "{}", {});
  }

  function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent("pp:itinerarychange"));
  }

  function getItinerary() {
    const st = loadState();
    return Array.isArray(st.itinerary) ? st.itinerary : [];
  }

  function setItinerary(arr) {
    const st = loadState();
    st.itinerary = arr;
    saveState(st);
  }

  /* =========================================================
     DATA ACCESS
  ========================================================= */
  function pickName(obj) {
    if (!obj) return "";
    if (typeof obj === "string") return obj;
    return obj.en || obj.hi || "";
  }

  function getAllLocations() {
    const D = window.PP_DATA;
    const out = [];
    const cities = D?.locations?.cities || [];

    for (const city of cities) {
      for (const place of city.places || []) {
        out.push({
          id: place.id,
          name: pickName(place.name) || place.id,
          cityName: pickName(city.name) || city.id,
          lat: place.lat,
          lng: place.lng,
          tags: place.tags || [],
          images: place.images || [],
          description: pickName(place.description) || "",
          source: "locations",
        });
      }
    }
    return out;
  }

  /* =========================================================
     SEARCH ENGINES
  ========================================================= */
  function searchLocations(query) {
    const q = query.toLowerCase();
    return getAllLocations()
      .filter((p) => {
        const hay = `${p.name} ${p.cityName} ${p.tags.join(" ")}`.toLowerCase();
        return hay.includes(q);
      })
      .slice(0, 40);
  }

  async function searchOSM(query) {
    const url =
      "https://nominatim.openstreetmap.org/search" +
      "?format=json&limit=12&q=" +
      encodeURIComponent(query);

    const res = await fetch(url, { headers: { "Accept-Language": "en" } });
    const data = await res.json();

    return data.map((x) => ({
      id: "osm_" + x.place_id,
      name: x.display_name,
      cityName: "",
      lat: Number(x.lat),
      lng: Number(x.lon),
      tags: ["osm"],
      images: [],
      description: "OpenStreetMap result",
      source: "osm",
    }));
  }

  /* =========================================================
     CARD RENDERING
  ========================================================= */
  function renderCard(item) {
    // alert(item);
    const img = item.images[0] || "assets/images/placeholder/place.svg";

    return `
      <article class="pp-card"
        data-pp-title="${PP_RENDER.esc(item.name)}"
        data-pp-desc="${PP_RENDER.esc(item.description)}"
        data-pp-lat="${item.lat ?? ""}"
        data-pp-lng="${item.lng ?? ""}"
        data-pp-images='${PP_RENDER.esc(JSON.stringify(item.images))}'
      >
        <div style="aspect-ratio:16/10;background:#eee">
          <img src="${img}" style="width:100%;height:100%;object-fit:cover">
        </div>

        <div class="pp-pad">
          <div style="font-weight:1000">${PP_RENDER.esc(item.name)}</div>
          <div class="pp-mini">
            ${item.cityName ? PP_RENDER.esc(item.cityName) + " • " : ""}
            ${item.source.toUpperCase()}
          </div>

          <div class="pp-actions" style="margin-top:10px">
            <button class="pp-btn" data-add="${item.id}">Add</button>
           <button class="pp-btn pp-btn--ghost" data-pp-pop="1" style="outline:3px solid red">
  Pop out (DEBUG)
</button>

            
          </div>
        </div>
      </article>
    `;
  }

  /* =========================================================
     ITINERARY UI
  ========================================================= */
  function renderItinerary() {
    const it = getItinerary();
    const box = $("rsItinerary");

    if (!it.length) {
      box.innerHTML = `<div class="pp-muted">No places added yet.</div>`;
      return;
    }

    box.innerHTML = it
      .map(
        (p, i) => `
      <div class="pp-card pp-pad"
        data-pp-title="${PP_RENDER.esc(p.name)}"
        data-pp-desc="${PP_RENDER.esc(p.description)}"
        data-pp-lat="${p.lat}"
        data-pp-lng="${p.lng}"
        data-pp-images='${PP_RENDER.esc(JSON.stringify(p.images))}'
      >
        <b>${i + 1}. ${PP_RENDER.esc(p.name)}</b>
        <div class="pp-mini">${p.lat}, ${p.lng}</div>

        <div class="pp-actions" style="margin-top:8px">
          <button class="pp-btn pp-btn--ghost" data-up="${i}" ${i === 0 ? "disabled" : ""}>↑</button>
          <button class="pp-btn pp-btn--ghost" data-down="${i}" ${i === it.length - 1 ? "disabled" : ""}>↓</button>
          <button class="pp-btn pp-btn--ghost" data-remove="${i}">Remove</button>
          <button class="pp-btn pp-btn--ghost" data-pp-pop="1">Pop out</button>
        </div>
      </div>
    `,
      )
      .join("");

    box.querySelectorAll("[data-up]").forEach((btn) => {
      btn.onclick = () => {
        const i = +btn.dataset.up;
        const arr = getItinerary();
        [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
        setItinerary(arr);
        renderItinerary();
      };
    });

    box.querySelectorAll("[data-down]").forEach((btn) => {
      btn.onclick = () => {
        const i = +btn.dataset.down;
        const arr = getItinerary();
        [arr[i + 1], arr[i]] = [arr[i], arr[i + 1]];
        setItinerary(arr);
        renderItinerary();
      };
    });

    box.querySelectorAll("[data-remove]").forEach((btn) => {
      btn.onclick = () => {
        const arr = getItinerary();
        arr.splice(+btn.dataset.remove, 1);
        setItinerary(arr);
        renderItinerary();
      };
    });
  }

  /* =========================================================
     SEARCH FLOW
  ========================================================= */
  let lastResults = [];

  async function runSearch(trigger) {
    const q = $("rsQuery").value.trim();
    const source = $("rsSource").value;

    if (!q) return;
    if (q.length < 3 && trigger !== "button") return;

    let results = [];

    if (source === "locations") {
      results = searchLocations(q);
    } else if (source === "osm") {
      results = await searchOSM(q);
    } else {
      results = searchLocations(q);
      if (results.length < 10) {
        const osm = await searchOSM(q);
        results = results.concat(osm);
      }
    }

    lastResults = results;
    $("rsResults").innerHTML =
      results.map(renderCard).join("") ||
      `<div class="pp-muted">No results</div>`;

    $("rsResults")
      .querySelectorAll("[data-add]")
      .forEach((btn) => {
        btn.onclick = () => {
          const item = lastResults.find((x) => x.id === btn.dataset.add);
          if (!item) return;

          const it = getItinerary();
          it.push(item);
          setItinerary(it);
          renderItinerary();
        };
      });
  }

  /* =========================================================
     INIT
  ========================================================= */
  function init() {
    $("rsSearchBtn").onclick = () => runSearch("button");
    $("rsClearBtn").onclick = () => {
      $("rsQuery").value = "";
      $("rsResults").innerHTML = "";
    };

    $("rsQuery").addEventListener("input", () => {
      setTimeout(() => runSearch("typing"), 250);
    });

    $("rsClearItBtn").onclick = () => {
      setItinerary([]);
      renderItinerary();
    };

    $("rsDownloadBtn").onclick = () => {
      const blob = new Blob([JSON.stringify(loadState(), null, 2)], {
        type: "application/json",
      });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "itinerary.json";
      a.click();
    };

    $("rsShareBtn").onclick = () => {
      const msg = getItinerary()
        .map((p, i) => `${i + 1}. ${p.name}`)
        .join("\n");
      window.open(PP_RENDER.wa("My Tour:\n" + msg));
    };

    renderItinerary();
  }

  window.addEventListener("pp:dataloaded", init);
  window.addEventListener("pp:itinerarychange", renderItinerary);
})();
