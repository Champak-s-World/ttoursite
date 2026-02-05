(function(){function box(){let b=document.getElementById("ppSearch"); if(b) return b; b=document.createElement("div");
b.style.cssText="position:fixed;right:14px;bottom:14px;z-index:998;width:min(420px,calc(100% - 28px));border:1px solid var(--border);background:rgba(255,255,255,.78);border-radius:18px;box-shadow:var(--shadow);padding:10px";
b.innerHTML=`<div style="display:flex;gap:10px;align-items:center"><input id="ppQ" style="flex:1;border:1px solid var(--border);border-radius:14px;padding:10px;font-weight:900" placeholder="Search on this page…"><button class="pp-btn pp-btn--ghost" id="ppClr" type="button">✕</button></div><div class="pp-mini" style="margin-top:6px">Ctrl/Cmd + K</div>`;
document.body.appendChild(b); const q=b.querySelector("#ppQ"); const clr=b.querySelector("#ppClr");
function apply(){const v=q.value.trim().toLowerCase(); document.querySelectorAll("[data-pp-search]").forEach(el=>{const h=(el.getAttribute("data-pp-search")||"").toLowerCase(); el.style.display=(!v||h.includes(v))?"":"none";});}
q.addEventListener("input",apply); clr.onclick=()=>{q.value="";apply();q.focus();};
window.addEventListener("keydown",(e)=>{const isMac=navigator.platform.toLowerCase().includes("mac"); if((isMac?e.metaKey:e.ctrlKey)&&e.key.toLowerCase()==="k"){e.preventDefault();q.focus();}});}
document.addEventListener("DOMContentLoaded",box);})();