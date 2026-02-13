
(function () {
  "use strict";

  function esc(s) {
    return String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function wa(text) {
    const cfg = window.PP_CONFIG?.contact?.primary;
// alert (cfg.whatsapp);
  const number = cfg?.whatsapp?.replace(/\D/g, "") || "";
  const base = number ? `https://wa.me/${number}` : "https://wa.me/";
 return base + "?text=" + encodeURIComponent(text || "");
    // return "https://wa.me/?text=" + encodeURIComponent(text || "");
  }

  window.PP_RENDER = { esc, wa };
})();


