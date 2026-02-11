(function () {
  "use strict";

  async function loadIncludes() {
    const nodes = document.querySelectorAll("[data-include]");

    for (const el of nodes) {
      const url = el.getAttribute("data-include");
      try {
        const r = await fetch(url, { cache: "no-store" });
        el.innerHTML = await r.text();
      } catch (e) {
        el.innerHTML = `<div style="padding:12px;color:#b91c1c;font-weight:900">
             Include failed: ${url}
           </div>`;
      }
    }

    // 🔥 IMPORTANT: tell the rest of the app includes are ready
    window.dispatchEvent(new CustomEvent("pp:includesloaded"));
  }

  document.addEventListener("DOMContentLoaded", loadIncludes);
})();
