(function () {
  "use strict";

  const CONFIG_PATH = "data/config/site-config.json";

  async function loadConfig() {
    try {
      const res = await fetch(CONFIG_PATH, { cache: "no-store" });
      if (!res.ok) throw new Error("Config load failed");
      const json = await res.json();
      window.PP_CONFIG = json;
      window.dispatchEvent(new CustomEvent("pp:configloaded"));
    } catch (e) {
      console.error("[config] failed to load:", e);
      window.PP_CONFIG = {};
    }
  }

  loadConfig();
})();
