/* =========================================================
   Language Engine (Hindi / English)
   File: assets/js/lang.js
   ========================================================= */

(function () {
  "use strict";

  const STORAGE_KEY = "pp_lang";
  const SUPPORTED = ["en", "hi"];

  function getLang() {
    const saved = (localStorage.getItem(STORAGE_KEY) || "en").toLowerCase();
    return SUPPORTED.includes(saved) ? saved : "en";
  }

  function setLang(lang) {
    const v = (lang || "en").toLowerCase();
    localStorage.setItem(STORAGE_KEY, SUPPORTED.includes(v) ? v : "en");
    window.dispatchEvent(
      new CustomEvent("pp:langchange", { detail: { lang: getLang() } })
    );
  }

  function t(obj) {
    if (!obj) return "";
    if (typeof obj === "string") return obj;
    const lang = getLang();
    return obj[lang] || obj.en || obj.hi || "";
  }

  window.PP_LANG = {
    getLang,
    setLang,
    t
  };
})();
