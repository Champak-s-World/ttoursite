(function(){const KEY="pp_tour_maker_v1"; function load(){try{return JSON.parse(localStorage.getItem(KEY)||"{}");}catch(e){return {};}}
function ensureLeaflet(){if(window.L) return Promise.resolve(); return new Promise((res,rej)=>{const css=document.createElement("link"); css.rel="stylesheet"; css.href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"; document.head.appendChild(css);
const s=document.createElement("script"); s.src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"; s.onload=()=>res(); s.onerror=()=>rej(new Error("Leaflet failed")); document.head.appendChild(s);});}
async function init(){await ensureLeaflet(); const st=load(); const it=Array.isArray(st.itinerary)?st.itinerary:[]; const pts=it.filter(p=>p.lat!=null&&p.lng!=null);
const center=pts.length?[pts[0].lat,pts[0].lng]:[25.3176,82.9739]; const map=L.map("rmMap").setView(center,12);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:"&copy; OpenStreetMap"}).addTo(map);
if(!pts.length) return; const latlngs=[]; pts.forEach((p,i)=>{const ll=[+p.lat,+p.lng]; latlngs.push(ll); L.marker(ll).addTo(map).bindPopup("<b>Stop "+(i+1)+"</b><br>"+(p.name||""));});
const line=L.polyline(latlngs,{weight:5,opacity:.9}).addTo(map); map.fitBounds(line.getBounds(),{padding:[20,20]});}
document.addEventListener("DOMContentLoaded",init);})();