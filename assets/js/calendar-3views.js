(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);

  const OCC_PATH = "data/master/occasions.json";

  const pad2 = (n) => String(n).padStart(2, "0");
  const iso = (y, m, d) => `${y}-${pad2(m)}-${pad2(d)}`;
  const parseISO = (s) => {
    const [Y, M, D] = String(s || "").split("-").map(Number);
    return (Y && M && D) ? { y: Y, m: M, d: D } : null;
  };

  function t(obj) {
    return window.PP_LANG?.t
      ? window.PP_LANG.t(obj)
      : (typeof obj === "string" ? obj : (obj?.en || obj?.hi || ""));
  }

  function waLink(text) {
    const cfg = window.PP_CONFIG?.contact?.primary;
    const number = (cfg?.whatsapp || "").replace(/\D/g, "");
    const base = number ? `https://wa.me/${number}` : "https://wa.me/";
    return base + "?text=" + encodeURIComponent(text || "");
  }

  function monthName(m0) {
    return ["January","February","March","April","May","June","July","August","September","October","November","December"][m0];
  }
  function dowName(d) {
    return ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d];
  }

  // ----- occasion date resolver -----
  function datesForOccasion(occ, year) {
    // explicit dates (best for lunar-based festivals)
    if (Array.isArray(occ.dates) && occ.dates.length) {
      return occ.dates
        .map(parseISO)
        .filter(Boolean)
        .filter(x => x.y === year)
        .map(x => iso(x.y, x.m, x.d));
    }

    // fixed date rule
    const dr = occ.dateRule;
    if (dr && dr.type === "fixed" && dr.month && dr.day) {
      return [iso(year, dr.month, dr.day)];
    }
    return [];
  }

  function buildIndex(occasions, year) {
    const idx = new Map(); // iso -> array of occ
    occasions.forEach((occ) => {
      datesForOccasion(occ, year).forEach((dayISO) => {
        if (!idx.has(dayISO)) idx.set(dayISO, []);
        idx.get(dayISO).push(occ);
      });
    });

    // sort each day list by featuredRank if present
    idx.forEach((arr) => {
      arr.sort((a, b) => {
        const ar = Number(a.featuredRank ?? 999);
        const br = Number(b.featuredRank ?? 999);
        return ar - br;
      });
    });

    return idx;
  }

  // ----- render day list cards -----
  function renderDayList(list, dayISO) {
    const host = $("dayList");
    $("dayLabel").textContent = dayISO;

    if (!list || !list.length) {
      host.innerHTML = `<div class="pp-muted">No occasions on <b>${dayISO}</b>.</div>`;
      return;
    }

    host.innerHTML = list.map((occ) => {
      const title = t(occ.title) || occ.id;
      const desc = t(occ.description) || t(occ.summary) || "";
      const img = (occ.images && occ.images[0]) ? occ.images[0] : "assets/images/placeholder/place.svg";
      const tags = (occ.tags || []).slice(0, 10);
      const featured = !!occ.featured;
      const fRank = Number(occ.featuredRank ?? 999);

      const cta = t(occ.ctaText) || (PP_LANG.getLang() === "hi" ? "व्हाट्सएप करें" : "WhatsApp");
      const msg = (t(occ.whatsappText) || (PP_LANG.getLang() === "hi" ? "मुझे जानकारी चाहिए:" : "I want details for:"))
        + ` ${title} (${dayISO})`;

      return `
        <article class="pp-card pp-occ-card ${featured ? "pp-occ-featured" : ""}"
          data-pp-title="${PP_RENDER?.esc ? PP_RENDER.esc(title) : title}"
          data-pp-desc="${PP_RENDER?.esc ? PP_RENDER.esc(desc) : desc}"
          data-pp-images='${JSON.stringify(occ.images || [])}'
        >
          <div class="pp-occ-media">
            <img src="${img}" alt="" class="pp-occ-img">
            ${featured ? `<div class="pp-occ-ribbon">★ Featured</div>` : ``}
          </div>

          <div class="pp-pad">
            <div class="pp-occ-top">
              <div style="font-weight:1000">${title}</div>
              <span class="pp-occ-date">${dayISO}</span>
            </div>

            ${desc ? `<div class="pp-mini" style="margin-top:8px;line-height:1.5">${desc}</div>` : ""}

            ${tags.length ? `<div class="pp-occ-tags">
              ${tags.map((x)=>`<span class="pp-pill">${x}</span>`).join("")}
            </div>` : ""}

            <div class="pp-actions" style="margin-top:12px">
              <a class="pp-btn" target="_blank" rel="noopener" href="${waLink(msg)}">${cta}</a>
              <button class="pp-btn pp-btn--ghost" type="button" data-pp-pop="1">Pop out</button>
              ${featured ? `<span class="pp-occ-rank">Rank: ${fRank}</span>` : ``}
            </div>
          </div>
        </article>
      `;
    }).join("");
  }

  // ----- views state -----
  const VIEW = { WEEK: "week", MONTH: "month", YEAR: "year" };
  let viewMode = VIEW.WEEK;

  let OCC = [];
  let base = new Date(); // anchor date (WEEK = start day)

  function viewYear() { return base.getFullYear(); }
  function viewMonth0() { return base.getMonth(); }

  function setView(mode) {
    viewMode = mode;

    $("viewWeek").style.display = (mode === VIEW.WEEK) ? "" : "none";
    $("viewMonth").style.display = (mode === VIEW.MONTH) ? "" : "none";
    $("viewYear").style.display = (mode === VIEW.YEAR) ? "" : "none";

    $("tabWeek").className = "pp-btn" + (mode === VIEW.WEEK ? "" : " pp-btn--ghost");
    $("tabMonth").className = "pp-btn" + (mode === VIEW.MONTH ? "" : " pp-btn--ghost");
    $("tabYear").className = "pp-btn" + (mode === VIEW.YEARYEAR ? "" : " pp-btn--ghost");
  }

  // Fix typo-safe: (some pages might have older code)
  const VIEW_YEAR_ID = "tabYear";

  function label() {
    if (viewMode === VIEW.YEAR) return `${viewYear()}`;
    if (viewMode === VIEW.MONTH) return `${monthName(viewMonth0())} ${viewYear()}`;

    // ✅ 7 days from base (today-style)
    const start = startOfDay(base);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return `Next 7 days: ${iso(start.getFullYear(), start.getMonth()+1, start.getDate())} → ${iso(end.getFullYear(), end.getMonth()+1, end.getDate())}`;
  }

  function startOfDay(d) {
    const x = new Date(d);
    x.setHours(0,0,0,0);
    return x;
  }

  // ----- render WEEK (7 days from today/base) -----
  function renderWeek(idx) {
    const host = $("weekGrid");
    const start = startOfDay(base);

    const cells = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);

      const dayISO = iso(day.getFullYear(), day.getMonth()+1, day.getDate());
      const list = idx.get(dayISO) || [];
      const count = list.length;

      const chips = list.slice(0, 2).map(o => `<span class="pp-oc-chip">${t(o.title) || o.id}</span>`).join("");
      const more = count > 2 ? `<span class="pp-oc-chip pp-oc-chip--more">+${count - 2}</span>` : "";

      const isToday = isSameDay(day, new Date());
      const has = count > 0;

      cells.push(`
        <div class="pp-weekDay ${has ? "pp-weekDay--has" : ""} ${isToday ? "pp-weekDay--today" : ""}"
             data-iso="${dayISO}">
          <div class="pp-weekTop">
            <div class="d">${dowName(day.getDay())} • ${day.getDate()}</div>
            ${has ? `<span class="pp-oc-badge">${count}</span>` : `<span class="pp-oc-badge pp-oc-badge--off">0</span>`}
          </div>
          <div class="meta">${monthName(day.getMonth())} ${day.getFullYear()}</div>
          ${has ? `<div class="pp-oc-chips">${chips}${more}</div>` : `<div class="pp-oc-empty">No occasions</div>`}
        </div>
      `);
    }

    host.innerHTML = cells.join("");

    host.querySelectorAll("[data-iso]").forEach((el) => {
      el.onclick = () => {
        const dayISO = el.dataset.iso;
        renderDayList(idx.get(dayISO) || [], dayISO);

        host.querySelectorAll(".pp-weekDay").forEach(x => x.classList.remove("pp-weekDay--selected"));
        el.classList.add("pp-weekDay--selected");
      };
    });

    // auto-select first day (base day)
    host.querySelector("[data-iso]")?.click();
  }

  function isSameDay(a, b) {
    return a.getFullYear() === b.getFullYear()
      && a.getMonth() === b.getMonth()
      && a.getDate() === b.getDate();
  }

  // ----- render MONTH -----
  function renderMonth(idx) {
    const grid = $("monthGrid");
    grid.innerHTML = "";

    ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].forEach((d) => {
      grid.insertAdjacentHTML("beforeend", `<div class="pp-cal-dow">${d}</div>`);
    });

    const y = viewYear();
    const m0 = viewMonth0();

    const first = new Date(y, m0, 1);
    const startDow = first.getDay();
    const daysInMonth = new Date(y, m0 + 1, 0).getDate();
    const prevDays = new Date(y, m0, 0).getDate();

    for (let i = 0; i < 42; i++) {
      const dayNum = i - startDow + 1;

      let d, mm, yy;
      let muted = false;

      if (dayNum <= 0) {
        muted = true;
        yy = (m0 === 0) ? y - 1 : y;
        mm = (m0 === 0) ? 12 : m0;
        d = prevDays + dayNum;
      } else if (dayNum > daysInMonth) {
        muted = true;
        yy = (m0 === 11) ? y + 1 : y;
        mm = (m0 === 11) ? 1 : m0 + 2;
        d = dayNum - daysInMonth;
      } else {
        yy = y;
        mm = m0 + 1;
        d = dayNum;
      }

      const dayISO = iso(yy, mm, d);
      const list = idx.get(dayISO) || [];
      const hasEvent = list.length > 0;

      const today = new Date();
      const isToday = (yy === today.getFullYear() && (mm-1) === today.getMonth() && d === today.getDate());

      grid.insertAdjacentHTML("beforeend", `
        <div class="pp-cal-cell ${muted ? "pp-cal-muted" : ""} ${isToday ? "pp-cal-today" : ""} ${hasEvent ? "pp-cal-has" : ""}"
             data-iso="${dayISO}">
          <div class="pp-cal-num">${d}</div>
          ${hasEvent ? `<span class="pp-cal-dot"></span><span class="pp-cal-count">${list.length}</span>` : ""}
        </div>
      `);
    }

    grid.querySelectorAll(".pp-cal-cell").forEach((cell) => {
      cell.onclick = () => {
        grid.querySelectorAll(".pp-cal-cell").forEach(c => c.classList.remove("pp-cal-selected"));
        cell.classList.add("pp-cal-selected");
        const dayISO = cell.dataset.iso;
        renderDayList(idx.get(dayISO) || [], dayISO);
      };
    });

    const now = new Date();
    const nowISO = iso(now.getFullYear(), now.getMonth()+1, now.getDate());
    const auto = grid.querySelector(`.pp-cal-cell[data-iso="${nowISO}"]`);
    if (auto) auto.click();
    else grid.querySelector(".pp-cal-cell[data-iso]")?.click();
  }

  // ----- render YEAR -----
  function renderYear(idx) {
    const host = $("yearGrid");
    const y = viewYear();
    const blocks = [];

    for (let m0 = 0; m0 < 12; m0++) {
      const first = new Date(y, m0, 1);
      const startDow = first.getDay();
      const daysInMonth = new Date(y, m0 + 1, 0).getDate();
      const prevDays = new Date(y, m0, 0).getDate();

      let inner = `<h3>${monthName(m0)}</h3><div class="grid">`;
      ["S","M","T","W","T","F","S"].forEach((d) => {
        inner += `<div class="cell muted" style="font-weight:900;background:rgba(0,0,0,.02);cursor:default">${d}</div>`;
      });

      for (let i = 0; i < 42; i++) {
        const dayNum = i - startDow + 1;

        let d, mm, yy;
        let muted = false;

        if (dayNum <= 0) {
          muted = true;
          yy = (m0 === 0) ? y - 1 : y;
          mm = (m0 === 0) ? 12 : m0;
          d = prevDays + dayNum;
        } else if (dayNum > daysInMonth) {
          muted = true;
          yy = (m0 === 11) ? y + 1 : y;
          mm = (m0 === 11) ? 1 : m0 + 2;
          d = dayNum - daysInMonth;
        } else {
          yy = y;
          mm = m0 + 1;
          d = dayNum;
        }

        const dayISO = iso(yy, mm, d);
        const list = idx.get(dayISO) || [];
        const hasEvent = list.length > 0;

        inner += `
          <div class="cell ${muted ? "muted" : ""} ${hasEvent ? "has" : ""}" data-iso="${dayISO}">
            ${d}
            ${hasEvent ? `<span class="dot"></span><span class="count">${list.length}</span>` : ""}
          </div>
        `;
      }

      inner += `</div>`;
      blocks.push(`<div class="pp-miniMonth">${inner}</div>`);
    }

    host.innerHTML = blocks.join("");

    host.querySelectorAll("[data-iso]").forEach((cell) => {
      cell.onclick = () => {
        const dayISO = cell.dataset.iso;
        renderDayList(idx.get(dayISO) || [], dayISO);
      };
    });

    const now = new Date();
    const nowISO = iso(now.getFullYear(), now.getMonth()+1, now.getDate());
    host.querySelector(`[data-iso="${nowISO}"]`)?.click();
  }

  // ----- refresh for current view -----
  function refresh() {
    const y = viewYear();
    const idx = buildIndex(OCC, y);

    $("viewLabel").textContent = label();

    if (viewMode === VIEW.WEEK) renderWeek(idx);
    else if (viewMode === VIEW.MONTH) renderMonth(idx);
    else renderYear(idx);
  }

  function setViewMode(mode) {
    viewMode = mode;

    $("viewWeek").style.display = (mode === VIEW.WEEK) ? "" : "none";
    $("viewMonth").style.display = (mode === VIEW.MONTH) ? "" : "none";
    $("viewYear").style.display = (mode === VIEW.YEAR) ? "" : "none";

    $("tabWeek").className = "pp-btn" + (mode === VIEW.WEEK ? "" : " pp-btn--ghost");
    $("tabMonth").className = "pp-btn" + (mode === VIEW.MONTH ? "" : " pp-btn--ghost");
    const ty = document.getElementById(VIEW_YEAR_ID);
    if (ty) ty.className = "pp-btn" + (mode === VIEW.YEAR ? "" : " pp-btn--ghost");

    refresh();
  }

  // ----- navigation -----
  function shiftUnit(delta) {
    if (viewMode === VIEW.WEEK) base.setDate(base.getDate() + (7 * delta)); // ✅ 7-days shift
    else if (viewMode === VIEW.MONTH) base.setMonth(base.getMonth() + delta);
    else base.setFullYear(base.getFullYear() + delta);
    refresh();
  }

  function shiftYear(delta) {
    base.setFullYear(base.getFullYear() + delta);
    refresh();
  }

  function goToday() {
    base = new Date(); // ✅ week will start from today
    refresh();
  }

  // ----- language toggle -----
  function syncLangBtn() {
    const b = $("calLang");
    if (!b) return;
    b.textContent = (PP_LANG.getLang() === "hi" ? "EN" : "HI");
  }

  // ----- init -----
  async function loadOccasions() {
    const res = await fetch(OCC_PATH, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to load ${OCC_PATH} (${res.status})`);
    const json = await res.json();
    return Array.isArray(json.occasions) ? json.occasions : [];
  }

  async function init() {
    try {
      syncLangBtn();

      OCC = await loadOccasions();

      $("tabWeek").onclick = () => setViewMode(VIEW.WEEK);
      $("tabMonth").onclick = () => setViewMode(VIEW.MONTH);
      $("tabYear").onclick = () => setViewMode(VIEW.YEAR);

      $("prevUnit").onclick = () => shiftUnit(-1);
      $("nextUnit").onclick = () => shiftUnit(1);
      $("prevYear").onclick = () => shiftYear(-1);
      $("nextYear").onclick = () => shiftYear(1);
      $("todayBtn").onclick = () => goToday();

      $("calLang").onclick = () => {
        PP_LANG.setLang(PP_LANG.getLang() === "hi" ? "en" : "hi");
      };

      // ✅ default view: WEEK starting today
      base = new Date();
      setViewMode(VIEW.WEEK);

      // initial day list = today
      const now = new Date();
      const nowISO = iso(now.getFullYear(), now.getMonth()+1, now.getDate());
      const idx = buildIndex(OCC, now.getFullYear());
      renderDayList(idx.get(nowISO) || [], nowISO);
    } catch (e) {
      console.error(e);
      $("dayList").innerHTML = `<div class="pp-muted">Calendar failed to load. Check console.</div>`;
    }
  }

  window.addEventListener("pp:langchange", () => {
    syncLangBtn();

    // re-render current selected day list
    const dayISO = ($("dayLabel").textContent || "").trim();
    if (dayISO) {
      const d = parseISO(dayISO);
      if (d) {
        const idx = buildIndex(OCC, d.y);
        renderDayList(idx.get(dayISO) || [], dayISO);
      }
    }

    refresh();
  });

  window.addEventListener("DOMContentLoaded", init);
})();
