(function(){function ensure(){let r=document.getElementById("ppPop"); if(r) return r; r=document.createElement("div"); r.id="ppPop"; r.className="pp-pop";
r.innerHTML=`<div class="pp-pop-panel"><div id="ppPopMedia"></div><div class="pp-pop-body">
  <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start">
    <div><div class="pp-h2" id="ppPopTitle">Details</div><div class="pp-muted" id="ppPopSub"></div></div>
    <button class="pp-x" id="ppPopX" type="button">✕</button>
  </div>
  <div id="ppPopDesc" style="margin-top:10px;line-height:1.55;font-weight:800"></div>
  <div class="pp-actions" id="ppPopCTA" style="margin-top:12px"></div>
</div></div>`; document.body.appendChild(r);
r.addEventListener("click",e=>{if(e.target===r) close();}); r.querySelector("#ppPopX").addEventListener("click",close);
window.addEventListener("keydown",e=>{if(e.key==="Escape") close();}); return r;}
function open(){ensure().classList.add("open"); document.documentElement.style.overflow="hidden";}
function close(){const r=document.getElementById("ppPop"); if(!r) return; r.classList.remove("open"); document.documentElement.style.overflow="";}
function find(type,id){const D=window.PP_DATA||{}; const arr=D[type]||[]; return Array.isArray(arr)?arr.find(x=>x.id===id):null;}
function show(type,id){const item=find(type,id); if(!item) return;
ensure(); const title=window.PP_RENDER.pick(item.title,item.id); document.getElementById("ppPopTitle").textContent=title;
document.getElementById("ppPopSub").textContent=item.duration?("Duration: "+item.duration):"";
document.getElementById("ppPopMedia").innerHTML=`<img src="${(item.images&&item.images[0])?item.images[0]:'assets/images/placeholder/place.svg'}" style="width:100%;height:100%;object-fit:cover;display:block" alt="">`;
document.getElementById("ppPopDesc").textContent=window.PP_RENDER.pick(item.description,"");
const c=document.getElementById("ppPopCTA"); c.innerHTML=`<a class="pp-btn" target="_blank" rel="noopener" href="${window.PP_RENDER.wa('I want details for '+title)}">WhatsApp</a><button class="pp-btn pp-btn--ghost" type="button" id="ppPopClose">Close</button>`;
c.querySelector("#ppPopClose").onclick=close; open();}
document.addEventListener("click",(e)=>{const b=e.target.closest("[data-pp-pop]"); if(!b) return; const card=b.closest("[data-pp-type][data-pp-id]"); if(!card) return; show(card.getAttribute("data-pp-type"),card.getAttribute("data-pp-id"));});})();