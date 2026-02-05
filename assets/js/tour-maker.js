(function(){const KEY="pp_tour_maker_v1"; const $=id=>document.getElementById(id);
function load(){try{return JSON.parse(localStorage.getItem(KEY)||"{}");}catch(e){return {};}}
function save(st){localStorage.setItem(KEY,JSON.stringify(st));}
function places(){const D=window.PP_DATA; const out=[]; for(const c of (D.locations?.cities||[])) for(const p of (c.places||[])) out.push({id:p.id,name:window.PP_RENDER.pick(p.name,p.id),lat:p.lat,lng:p.lng}); return out;}
function searchLocal(q){q=q.trim().toLowerCase(); if(!q) return []; return places().filter(x=>(x.name||"").toLowerCase().includes(q)).slice(0,20);}
async function searchAll(q){q=q.trim(); if(!q) return []; const local=searchLocal(q); if(local.length) return local;
const url="https://nominatim.openstreetmap.org/search?format=json&limit=10&q="+encodeURIComponent(q); const r=await fetch(url); const j=await r.json();
return (j||[]).map(x=>({id:"osm_"+(x.place_id||Math.random()),name:x.display_name,lat:Number(x.lat),lng:Number(x.lon)}));}
function renderIt(){const st=load(); const it=Array.isArray(st.itinerary)?st.itinerary:[]; const m=$("tmItinerary");
m.innerHTML=it.length?it.map((p,i)=>`<div class="pp-card pp-pad" style="display:flex;justify-content:space-between;gap:10px">
  <div><b>${p.name}</b><div class="pp-mini">${(p.lat!=null&&p.lng!=null)?(Number(p.lat).toFixed(5)+", "+Number(p.lng).toFixed(5)):"No coords"}</div></div>
  <div class="pp-actions">
    <button class="pp-btn pp-btn--ghost" data-up="${i}" ${i==0?"disabled":""}>↑</button>
    <button class="pp-btn pp-btn--ghost" data-down="${i}" ${i==it.length-1?"disabled":""}>↓</button>
    <button class="pp-btn pp-btn--ghost" data-del="${i}">Remove</button>
  </div>
</div>`).join(""):`<div class="pp-muted">No stops yet.</div>`;
m.querySelectorAll("[data-up]").forEach(b=>b.onclick=()=>{const i=+b.dataset.up; const s=load(); const a=s.itinerary||[]; [a[i-1],a[i]]=[a[i],a[i-1]]; s.itinerary=a; save(s); renderIt();});
m.querySelectorAll("[data-down]").forEach(b=>b.onclick=()=>{const i=+b.dataset.down; const s=load(); const a=s.itinerary||[]; [a[i+1],a[i]]=[a[i],a[i+1]]; s.itinerary=a; save(s); renderIt();});
m.querySelectorAll("[data-del]").forEach(b=>b.onclick=()=>{const i=+b.dataset.del; const s=load(); const a=s.itinerary||[]; a.splice(i,1); s.itinerary=a; save(s); renderIt();});
}
function renderRes(list){const m=$("tmResults");
m.innerHTML=list.length?list.map(p=>`<div class="pp-card pp-pad" style="display:flex;justify-content:space-between;gap:10px">
  <div><b>${p.name}</b><div class="pp-mini">${(p.lat!=null&&p.lng!=null)?(Number(p.lat).toFixed(5)+", "+Number(p.lng).toFixed(5)):"No coords"}</div></div>
  <button class="pp-btn pp-btn--ghost" data-add="${p.id}">Add</button>
</div>`).join(""):`<div class="pp-muted">No results.</div>`;
m.querySelectorAll("[data-add]").forEach(btn=>btn.onclick=()=>{const id=btn.dataset.add; const p=list.find(x=>String(x.id)===String(id)); if(!p) return;
const st=load(); st.itinerary=Array.isArray(st.itinerary)?st.itinerary:[]; st.itinerary.push({id:p.id,name:p.name,lat:p.lat,lng:p.lng}); save(st); renderIt();});
}
document.addEventListener("DOMContentLoaded",()=>{ $("tmSearch").onclick=async()=>{ $("tmBusy").style.display=""; try{renderRes(await searchAll($("tmQuery").value));}finally{$("tmBusy").style.display="none";}};
$("tmDownload").onclick=()=>{const blob=new Blob([JSON.stringify(load(),null,2)],{type:"application/json"}); const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="tour-itinerary.json"; a.click();};
$("tmShare").onclick=()=>{const st=load(); const it=st.itinerary||[]; const msg=["Tour Itinerary:",...it.map((p,i)=>`${i+1}. ${p.name}`)].join("\n"); window.open(window.PP_RENDER.wa(msg),"_blank","noopener");};
$("tmOpenRoute").onclick=()=>location.href="route.html"; renderIt();});})();