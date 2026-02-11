/* =========================================================
   PP Responsive Nav
   - Works with includes (header injected)
   - Mobile drawer
   - Active link highlight
   - Language toggle hook (optional)
   ========================================================= */

(function(){
  "use strict";

  const $ = (sel, root=document) => root.querySelector(sel);

  function setActiveLinks(root){
    const path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    root.querySelectorAll(".pp-link, [data-pp-navlink]").forEach(a=>{
      const href = (a.getAttribute("href") || "").toLowerCase();
      const clean = href.split("#")[0].split("?")[0];
      if (clean === path) a.classList.add("active");
      else a.classList.remove("active");
    });
  }

  function ensureDrawerMarkup(header){
    // If drawer already exists, don’t duplicate
    if (document.getElementById("ppDrawer")) return;

    const drawer = document.createElement("div");
    drawer.className = "pp-drawer";
    drawer.id = "ppDrawer";
    drawer.innerHTML = `
      <div class="pp-drawer__backdrop" data-pp-close="1"></div>
      <div class="pp-drawer__panel" role="dialog" aria-modal="true" aria-label="Menu">
        <div class="pp-drawer__top">
          <div class="pp-drawer__title">Menu</div>
          <button class="pp-navbtn pp-drawer__close" type="button" data-pp-close="1" aria-label="Close">✕</button>
        </div>

        <div class="pp-drawer__grid" id="ppDrawerLinks">
          <!-- cloned links go here -->
        </div>

        <div style="padding:10px 6px; font-size:12px; opacity:.75;">
          Tip: Use Routes to build itinerary and Route Map to view it.
        </div>
      </div>
    `;
    document.body.appendChild(drawer);

    // clone desktop links into drawer
    const host = document.getElementById("ppDrawerLinks");
    const desktopLinks = header.querySelectorAll(".pp-links a, [data-pp-navlink]");
    desktopLinks.forEach(a=>{
      const c = a.cloneNode(true);
      c.classList.remove("active");
      c.addEventListener("click", ()=> closeDrawer());
      host.appendChild(c);
    });

    drawer.querySelectorAll("[data-pp-close]").forEach(el=>{
      el.addEventListener("click", closeDrawer);
    });

    // ESC to close
    window.addEventListener("keydown", (e)=>{
      if (e.key === "Escape") closeDrawer();
    });
  }

  function openDrawer(){
    const d = document.getElementById("ppDrawer");
    if (!d) return;
    d.classList.add("open");
    document.documentElement.style.overflow = "hidden";
  }

  function closeDrawer(){
    const d = document.getElementById("ppDrawer");
    if (!d) return;
    d.classList.remove("open");
    document.documentElement.style.overflow = "";
  }

  function wire(header){
    if (!header) return;

    ensureDrawerMarkup(header);
    setActiveLinks(header);

    // Burger button
    const burger = header.querySelector("[data-pp-burger]");
    if (burger){
      burger.addEventListener("click", openDrawer);
    }

    // Close drawer on route change (best effort)
    window.addEventListener("hashchange", closeDrawer);

    // Language toggle hook (if you have PP_LANG)
    const langBtn = header.querySelector("[data-pp-lang]");
    if (langBtn && window.PP_LANG){
      const sync = () => (langBtn.textContent = (PP_LANG.getLang()==="hi") ? "EN" : "HI");
      sync();
      langBtn.addEventListener("click", ()=>{
        PP_LANG.setLang(PP_LANG.getLang()==="hi" ? "en" : "hi");
        sync();
      });
      window.addEventListener("pp:langchange", sync);
    }
  }

  function init(){
    // Your header is injected by includes.js.
    // We listen for includesloaded, and also try on DOMContentLoaded.
    const header = document.querySelector(".pp-nav") || document.getElementById("ppHeader") || document.querySelector("header");
    wire(header);
  }

  window.addEventListener("pp:includesloaded", init);
  document.addEventListener("DOMContentLoaded", init);

  // Expose minimal API
  window.PP_NAV = { init, open: openDrawer, close: closeDrawer };
})();