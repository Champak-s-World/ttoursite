(function(){function render(){const D=window.PP_DATA; if(!D) return; const g=document.getElementById("gGrid"); if(!g) return;
let items=[]; (D.tours||[]).forEach(x=>items.push({type:"tours",id:x.id,title:window.PP_RENDER.pick(x.title,x.id),img:(x.images&&x.images[0])||"assets/images/placeholder/place.svg"}));
g.innerHTML=items.map(x=>`<article class="pp-card" data-pp-type="${x.type}" data-pp-id="${x.id}" data-pp-search="${window.PP_RENDER.esc(x.title)}">
<div style="aspect-ratio:16/10;background:rgba(0,0,0,.03)"><img src="${x.img}" style="width:100%;height:100%;object-fit:cover;display:block"></div>
<div class="pp-pad"><b>${window.PP_RENDER.esc(x.title)}</b><div class="pp-actions" style="margin-top:12px"><button class="pp-btn pp-btn--ghost" type="button" data-pp-pop="1">Pop out</button></div></div></article>`).join("");}
window.addEventListener("pp:dataloaded",render); window.addEventListener("pp:includesloaded",render);})();