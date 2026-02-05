(function(){function render(){const D=window.PP_DATA; if(!D) return; const l=document.getElementById("calList"); if(!l) return;
l.innerHTML=D.calendar.map(o=>{const title=window.PP_RENDER.pick(o.title,o.id); return `<div class="pp-card pp-pad" data-pp-search="${window.PP_RENDER.esc(title+' '+(o.date||''))}">
<b>${window.PP_RENDER.esc(title)}</b><div class="pp-mini">${o.date||''}</div>
<div class="pp-actions" style="margin-top:12px"><a class="pp-btn" target="_blank" rel="noopener" href="${window.PP_RENDER.wa('I want booking for '+title+' on '+(o.date||''))}">WhatsApp</a></div></div>`;}).join("")||`<div class="pp-muted">No occasions yet.</div>`;}
window.addEventListener("pp:dataloaded",render); window.addEventListener("pp:includesloaded",render);})();