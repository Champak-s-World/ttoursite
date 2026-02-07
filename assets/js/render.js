
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
    return "https://wa.me/?text=" + encodeURIComponent(text || "");
  }

  window.PP_RENDER = { esc, wa };
})();


