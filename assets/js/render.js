(function(){const PH="assets/images/placeholder/place.svg"; function pick(o,fb){if(!o) return fb||""; if(typeof o==="string") return o; return o.en||fb||"";}
function esc(s){return String(s||"").replace(/[&<>"']/g,c=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));}
function wa(text){const digits=String(window.PP_CONFIG?.contact?.phoneE164||"").replace(/\D/g,""); const msg=text||"Hello"; return digits?("https://wa.me/"+digits+"?text="+encodeURIComponent(msg)):("https://wa.me/?text="+encodeURIComponent(msg));}
function makeCard(type,x){const title=pick(x.title,pick(x.name,x.id)); const tags=(x.tags||[]).slice(0,6).map(t=>'<span style="display:inline-flex;padding:6px 10px;border-radius:999px;border:1px solid var(--border);background:rgba(255,255,255,.55);font-weight:900;font-size:12px">'+esc(t)+'</span>').join(" ");
const img=(x.images&&x.images[0])?x.images[0]:PH;
return `<article class="pp-card" data-pp-type="${esc(type)}" data-pp-id="${esc(x.id)}" data-pp-search="${esc(title+' '+(x.tags||[]).join(' '))}">
  <div style="aspect-ratio:16/10;background:rgba(0,0,0,.03)"><img src="${img}" style="width:100%;height:100%;object-fit:cover;display:block" alt="${esc(title)}"></div>
  <div class="pp-pad">
    <div style="font-weight:1000">${esc(title)}</div>
    <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">${tags}</div>
    <div class="pp-actions" style="margin-top:12px">
      <a class="pp-btn" target="_blank" rel="noopener" href="${wa('I want details for '+title)}">WhatsApp</a>
      <button class="pp-btn pp-btn--ghost" type="button" data-pp-pop="1">Pop out</button>
    </div>
  </div>
</article>`;}
window.PP_RENDER={pick,esc,wa,makeCard};})();