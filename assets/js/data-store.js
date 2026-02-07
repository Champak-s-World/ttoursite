
(function () {
  "use strict";

  const PP_DATA = (window.PP_DATA = window.PP_DATA || {});

  async function loadJSON(path) {
    const r = await fetch(path, { cache: "no-store" });
    if (!r.ok) throw new Error(`Failed to load ${path} (${r.status})`);
    return await r.json();
  }

  async function init() {
    try {
      PP_DATA.locations = await loadJSON("data/master/locations.json");
      window.dispatchEvent(new CustomEvent("pp:dataloaded"));
    } catch (e) {
      console.error(e);
      window.dispatchEvent(new CustomEvent("pp:dataloadfailed", { detail: e }));
    }
  }

  init();
})();

