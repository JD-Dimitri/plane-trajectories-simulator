/* =====================================================================================================
   V7.2 — PANNEAUX DÉPLAÇABLES (mobile et souris)
   Glisser un panneau par sa barre du haut (zone de 34 px, poignée « ━ ») pour le déplacer ; double-tap sur la barre :
   position d'origine. Glisser vers le bas jusqu'au bord de l'écran : le panneau se replie. La position est gardée pendant
   la session (même quand le panneau est reconstruit).
   ===================================================================================================== */
(function(){
'use strict';
// V10.26 : toutes les bulles flottantes sont déplaçables (légendes, checklist, carte, mode d'emploi, messages…)
const WHOLE=['hud','b-ckl','legck','msg','atcsub','ahl','jmpo'];   // petites bulles : on les saisit n'importe où
const IDS=['guide','abub','snd','atc','ped','fail','scn','qcm','help','hud','exam','b-ckl','legck','msg','atcsub','ahl','jmpo','gdlg','mancard','mapw','navlog','ovh'];
let noClick=0;
const POS={}; let D=null, lastTap={id:null,t:0};
const css=document.createElement('style'); css.textContent=`
${IDS.filter(i=>!WHOLE.includes(i)).map(i=>'#'+i).join(',')}{--grip:1}
#legck{pointer-events:auto!important;cursor:grab;touch-action:none}#b-ckl{touch-action:none}
${IDS.filter(i=>!WHOLE.includes(i)).map(i=>'#'+i+'::before').join(',')}{content:'';display:block;width:44px;height:5px;border-radius:3px;background:#5a7088;margin:0 auto 6px;opacity:.85;cursor:grab}
.pdrag{outline:2px solid var(--acc)!important;opacity:.94;transition:none!important;animation:none!important;user-select:none}
.pmoved{animation:none!important}
.pfold>*:not(:first-child){display:none!important}
.pfold{max-height:none!important;height:auto!important}`;
document.head.appendChild(css);
function panelOf(t){ for(const id of IDS){ const p=document.getElementById(id); if(p&&!p.hidden&&p.contains(t)&&getComputedStyle(p).position==='fixed') return p; } return null; }
function inHandle(p,x,y,t){ if(WHOLE.includes(p.id)) return true; if(t.closest('button,input,select,textarea,a,label,[data-sw],[data-pd],.sw,canvas')) return false; const r=p.getBoundingClientRect();
  return y-r.top<34||!!t.closest('.gh,.ah,.hd,h3,.drag-h'); }
function place(p,x,y){ const r=p.getBoundingClientRect(), w=r.width, h=r.height; x=Math.min(innerWidth-60,Math.max(60-w,x)); y=Math.min(innerHeight-36,Math.max(0,y));
  p.classList.add('pmoved'); Object.assign(p.style,{left:x+'px',top:y+'px',right:'auto',bottom:'auto',transform:'none',margin:'0'}); POS[p.id]={x,y}; }
function reset(p){ ['left','top','right','bottom','transform','margin'].forEach(k=>p.style[k]=''); p.classList.remove('pfold','pmoved'); delete POS[p.id]; }
function start(p,x,y){ const r=p.getBoundingClientRect(); D={p,dx:x-r.left,dy:y-r.top,x0:x,y0:y,moved:false}; }
function move(x,y){ if(!D) return false; if(!D.moved&&Math.hypot(x-D.x0,y-D.y0)<6) return true; if(!D.moved){ D.moved=true; D.p.classList.add('pdrag'); } place(D.p,x-D.dx,y-D.dy); return true; }
function end(x,y){ if(!D) return; const p=D.p, moved=D.moved; p.classList.remove('pdrag'); D=null;
  if(moved){ noClick=Date.now(); if(y>innerHeight-40){ p.classList.add('pfold'); place(p,parseFloat(p.style.left)||8,innerHeight-120); } return; }
  const now=Date.now(); if(lastTap.id===p.id&&now-lastTap.t<350){ reset(p); lastTap.id=null; } else { lastTap={id:p.id,t:now}; if(p.classList.contains('pfold')) p.classList.remove('pfold'); } }
// tactile
addEventListener('touchstart',e=>{ if(e.touches.length!==1) return; const t=e.touches[0], p=panelOf(e.target); if(!p||!inHandle(p,t.clientX,t.clientY,e.target)) return; start(p,t.clientX,t.clientY); e.stopPropagation(); },{capture:true,passive:true});
addEventListener('touchmove',e=>{ if(!D) return; const t=e.touches[0]; if(move(t.clientX,t.clientY)){ e.preventDefault(); e.stopPropagation(); } },{capture:true,passive:false});
addEventListener('touchend',e=>{ if(!D) return; const t=e.changedTouches[0]; end(t.clientX,t.clientY); },{capture:true});
addEventListener('touchcancel',()=>{ if(D){ D.p.classList.remove('pdrag'); D=null; } },{capture:true});
// un glisser ne doit pas déclencher le bouton saisi (bouton CHECKLIST)
addEventListener('click',e=>{ if(Date.now()-noClick<400){ e.preventDefault(); e.stopPropagation(); noClick=0; } },true);
// souris
addEventListener('mousedown',e=>{ if(e.button!==0) return; const p=panelOf(e.target); if(!p||!inHandle(p,e.clientX,e.clientY,e.target)) return; start(p,e.clientX,e.clientY); if(!e.target.closest('button,input,select,textarea')) e.preventDefault(); },true);
addEventListener('mousemove',e=>{ if(D) move(e.clientX,e.clientY); },true);
addEventListener('mouseup',e=>{ if(D) end(e.clientX,e.clientY); },true);
// réappliquer les positions aux panneaux reconstruits, garder à l'écran après rotation
setInterval(()=>{ for(const id in POS){ const p=document.getElementById(id); if(p&&!p.hidden&&p.style.left!==POS[id].x+'px') place(p,POS[id].x,POS[id].y); } },400);
addEventListener('resize',()=>{ for(const id in POS){ const p=document.getElementById(id); if(p) place(p,POS[id].x,POS[id].y); } });
})();
