/* assets/js/pp-themes.js
   PP Themes v1
   - 3 themes: saffron, midnight, mint
   - Smooth transitions (after first paint)
   - Auto-midnight after 7PM (only if user never chose a theme)
   - Theme button (#ppThemeBtn) works with injected header (delegated click)
   - Injects theme dropdown into mobile menu after burger opens
*/

(function () {
  "use strict";

  const KEY = "pp_theme";
  const THEMES = ["saffron", "midnight", "mint"];
  const ICON = { saffron: "🔶", midnight: "🌙", mint: "🌿" };

  function nowHour() {
    try {
      return new Date().getHours();
    } catch {
      return 12;
    }
  }

  function pickDefaultTheme() {
    const saved = localStorage.getItem(KEY);
    if (saved && THEMES.includes(saved)) return saved;

    const h = nowHour();
    if (h >= 19 || h < 6) return "midnight";
    return "saffron";
  }

  function enableTransitions() {
    requestAnimationFrame(() => {
      document.documentElement.classList.add("theme-animate");
    });
  }

  function setMetaThemeColor(theme) {
    let m = document.querySelector('meta[name="theme-color"]');
    if (!m) {
      m = document.createElement("meta");
      m.setAttribute("name", "theme-color");
      document.head.appendChild(m);
    }
    const color =
      theme === "midnight" ? "#0b1220" : theme === "mint" ? "#059669" : "#d97706";
    m.setAttribute("content", color);
  }

  function applyTheme(theme, persist) {
    const t = THEMES.includes(theme) ? theme : "saffron";
    document.documentElement.setAttribute("data-theme", t);
    if (persist) localStorage.setItem(KEY, t);
    setMetaThemeColor(t);

    const btn = document.getElementById("ppThemeBtn");
    if (btn) btn.textContent = ICON[t] || "🔶";

    const sel = document.getElementById("ppThemeSelectMobile");
    if (sel) sel.value = t;
  }

  function cycleTheme() {
    const cur =
      document.documentElement.getAttribute("data-theme") || "saffron";
    const idx = THEMES.indexOf(cur);
    applyTheme(THEMES[(idx + 1) % THEMES.length], true);
  }

  function injectSelectStyleOnce() {
    if (document.getElementById("ppThemeSelectStyle")) return;
    const s = document.createElement("style");
    s.id = "ppThemeSelectStyle";
    s.textContent = `
      .pp-theme-select{
        padding: 8px 10px;
        border-radius: 12px;
        border: 1px solid var(--border);
        background: var(--card);
        color: var(--text);
        font-weight: 900;
        max-width: 220px;
      }
    `;
    document.head.appendChild(s);
  }

  // Try to find the popout/menu container created by your pp-nav.js
  function ensureMobileThemeDropdown() {
    const host =
      document.querySelector(".pp-mobile__panel") ||
      document.querySelector(".pp-nav__drawer") ||
      document.querySelector(".pp-nav__sheet") ||
      document.querySelector(".pp-nav__menu") ||
      document.querySelector(".pp-nav__mobile") ||
      document.querySelector("[data-pp-mobilemenu]") ||
      document.querySelector(".pp-popout") ||
      document.querySelector(".popout");

    if (!host) return;
    if (document.getElementById("ppThemeSelectMobile")) return;

    const wrap = document.createElement("div");
    wrap.style.display = "flex";
    wrap.style.gap = "10px";
    wrap.style.alignItems = "center";
    wrap.style.padding = "10px 12px";
    wrap.style.borderBottom = "1px solid var(--border)";

    const lbl = document.createElement("div");
    lbl.textContent = "Theme";
    lbl.style.fontWeight = "900";
    lbl.style.color = "var(--muted)";

    const sel = document.createElement("select");
    sel.id = "ppThemeSelectMobile";
    sel.className = "pp-theme-select";
    sel.innerHTML = `
      <option value="saffron">🔶 Saffron</option>
      <option value="midnight">🌙 Midnight</option>
      <option value="mint">🌿 Mint</option>
    `;
    sel.addEventListener("change", (e) => applyTheme(e.target.value, true));

    wrap.appendChild(lbl);
    wrap.appendChild(sel);

    host.prepend(wrap);
    sel.value = document.documentElement.getAttribute("data-theme") || "saffron";
  }

  // Init on every page
  document.addEventListener("DOMContentLoaded", () => {
    injectSelectStyleOnce();
    enableTransitions();

    // Apply default theme (auto-midnight only if no user choice)
    applyTheme(pickDefaultTheme(), false);

    // If user already chose earlier, apply it without rewriting
    const saved = localStorage.getItem(KEY);
    if (saved && THEMES.includes(saved)) applyTheme(saved, false);
  });

  // Delegated clicks (header is injected later)
  document.addEventListener("click", (e) => {
    const tbtn = e.target.closest("#ppThemeBtn");
    if (tbtn) {
      cycleTheme();
      return;
    }

    // When burger opens, inject dropdown into mobile menu
    const burger = e.target.closest("[data-pp-burger], .pp-burger, #ppBurger");
    if (burger) {
      setTimeout(ensureMobileThemeDropdown, 60);
      setTimeout(ensureMobileThemeDropdown, 260);
    }
  });
})();
