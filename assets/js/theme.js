(function(){function init(){const cfg=window.PP_CONFIG||{};const brand=cfg.brand||"Spiritual Services";document.getElementById("ppBrandText")&&(document.getElementById("ppBrandText").textContent=brand);document.getElementById("ppFootBrand")&&(document.getElementById("ppFootBrand").textContent=brand);
document.getElementById("ppYear")&&(document.getElementById("ppYear").textContent=new Date().getFullYear());
const digits=String(cfg.contact?.phoneE164||"").replace(/\D/g,"");const wa=document.getElementById("ppFootWhatsApp"); if(wa) wa.href=digits?("https://wa.me/"+digits):"https://wa.me/";
const em=document.getElementById("ppFootEmail"); if(em){const email=cfg.contact?.email||""; em.href=email?("mailto:"+email):"mailto:"; em.textContent=email||"Email";}
const file=(location.pathname.split("/").pop()||"index.html").toLowerCase();
const map={"index.html":"index","tours.html":"tours","tour-maker.html":"tours","route.html":"tours","rituals.html":"rituals","katha.html":"katha","calendar.html":"calendar","videos.html":"videos","gallery.html":"gallery","contact.html":"contact","admin.html":"admin","debug.html":"admin"};
document.querySelectorAll("[data-nav]").forEach(a=>a.classList.toggle("active",a.getAttribute("data-nav")===map[file]));
} window.addEventListener("pp:configloaded",init); window.addEventListener("pp:includesloaded",()=>{if(window.PP_CONFIG)init();});})();