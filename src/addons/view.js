/* =====================================================================================================
   V7.5 — VOIR LA PISTE ET LE DÉCOR SUR TÉLÉPHONE
   Sur un écran vertical, les écrans du cockpit (≈ 240 px) et la barre de boutons (5 lignes) recouvraient toute la moitié
   basse de l'image 3D : l'horizon était au milieu de l'écran, donc la piste et le sol étaient dessinés… sous les panneaux.
   1) L'image 3D est recentrée dans la partie réellement visible (camera.setViewOffset), horizon placé au tiers haut
      pour voir la piste devant le nez et le sol en vol.
   2) Barre compacte sur mobile (une ligne : Menu, Pause, Cockpit, Extérieur, Auto, Écrans, ⋯) ; « ⋯ » déplie le reste.
   3) Bouton « Écrans » : masquer / afficher la planche de bord en vue cockpit pour regarder dehors.
   ===================================================================================================== */
(function(){
'use strict';
const KEEP=['b-menu','b-pause','b-auto','b-jump','b-more','b-scr'];
const css=document.createElement('style'); css.textContent=`
#bar.compact > *:not([data-v]):not(#${KEEP.join('):not(#')}){display:none!important}
#bar.compact{flex-wrap:wrap}
#b-more{min-width:40px}`;
document.head.appendChild(css);
const bar=$('bar'); let scrHidden=false;
function store(k,v){ try{ ls.set(k,v); }catch(e){} } function read(k){ try{ return ls.get(k); }catch(e){ return null; } }
// boutons
const more=document.createElement('button'); more.type='button'; more.id='b-more'; more.title='Afficher / masquer les autres boutons';
const scr=document.createElement('button'); scr.type='button'; scr.id='b-scr'; scr.title='Masquer / afficher les écrans du cockpit pour regarder dehors';
const auto=$('b-auto'); (auto||$('b-help')).after(scr); bar.appendChild(more);
function syncBtns(){ const c=bar.classList.contains('compact'); more.textContent=c?'⋯ Plus':'▴ Moins'; scr.textContent=scrHidden?'🖥 Écrans':'🖥 Masquer écrans'; scr.classList.toggle('on',!scrHidden); }
const pref=read('sim-barc'); bar.classList.toggle('compact',pref==null?innerWidth<760:pref==='1');
more.onclick=()=>{ bar.classList.toggle('compact'); store('sim-barc',bar.classList.contains('compact')?'1':'0'); syncBtns(); resize(); };
scr.onclick=()=>{ scrHidden=!scrHidden; syncBtns(); resize(); };
// recentrage de l'image 3D dans la zone visible
function freeBottom(){ const H=innerHeight; let b=H; const r=bar.getBoundingClientRect(); if(!bar.hidden&&r.height) b=Math.min(b,r.top);
  if(view==='ck'){ const ck=$('ck'); if(ck&&!ck.hidden){ const c=$('ckc').getBoundingClientRect(); if(c.height>4) b=Math.min(b,c.top); const f=$('fcu'); if(f&&!f.hidden){ const fr=f.getBoundingClientRect(); if(fr.height) b=Math.min(b,fr.top); } } }
  return Math.max(H*0.35,b); }
let lastOff=null;
function recentre(){ if(typeof camera==='undefined'||!camera.setViewOffset) return; const W=innerWidth, H=innerHeight, fb=freeBottom();
  // horizon visé : 42 % de la zone libre en vue cockpit (on voit la piste sous le nez), 48 % en vue extérieure
  const target=fb*(view==='ck'?0.42:0.48), off=Math.round(H/2-target);
  if(Math.abs(off)<8){ if(lastOff!==0){ camera.clearViewOffset(); lastOff=0; } return; }
  if(off!==lastOff){ camera.setViewOffset(W,H,0,off,W,H); lastOff=off; } }
const _resize=resize; resize=function(){ _resize(); if(view==='ck'&&scrHidden) document.documentElement.style.setProperty('--ckh','0px'); document.documentElement.style.setProperty('--barh',(bar.offsetHeight+16)+'px'); lastOff=null; requestAnimationFrame(recentre); };
const _sv=setView; setView=function(v){ const r=_sv.apply(this,arguments); resize(); return r; };
setInterval(recentre,500); syncBtns(); resize();
})();

/* V8.6 — PC : la vue cockpit revient vers l'avant.
   Un clic-glissé sur l'image 3D (souvent involontaire à la souris) relève la tête : on ne voit plus que le ciel.
   → bouton « 🎯 Vue avant » dès que le regard est décalé, et retour doux vers l'avant après 4 s sans manipulation
   (sauf si l'on regarde volontairement le plafonnier). Double-clic ou touche 0 : recentrage immédiat. */
(function(){ let lastIn=performance.now(); ['pointerdown','pointermove','wheel'].forEach(t=>addEventListener(t,e=>{ if(e.type!=='pointermove'||e.buttons) lastIn=performance.now(); },{passive:true}));
  const b=document.createElement('button'); b.type='button'; b.id='b-front'; b.textContent='🎯 Vue avant'; b.hidden=true;
  b.style.cssText='position:fixed;left:50%;top:12px;transform:translateX(-50%);z-index:30;background:#132232ee;color:#fff;border:1px solid #46c8d8;border-radius:10px;padding:8px 14px;font:700 14px "Barlow Condensed",sans-serif;letter-spacing:.06em;text-transform:uppercase;cursor:pointer';
  b.onclick=()=>{ LK.ty=LK.tp=0; LK.tz=1; b.hidden=true; }; document.body.appendChild(b);
  setInterval(()=>{ if(typeof LK==='undefined'||!$('menu').hidden){ b.hidden=true; return; } const off=Math.abs(LK.tp)>0.12||Math.abs(LK.ty)>0.25||Math.abs(LK.tz-1)>0.35;
    b.hidden=!(off&&view!=='walk');
    if(view==='ck'&&off&&LK.tp<0.6&&performance.now()-lastIn>4000){ LK.tp*=0.85; LK.ty*=0.85; LK.tz+=(1-LK.tz)*0.1; if(Math.abs(LK.tp)<0.02) LK.tp=0; if(Math.abs(LK.ty)<0.02) LK.ty=0; } },200); })();

/* V8.8 — PC : la bulle d'étape se range en haut à droite, dans le ciel, sans couvrir le bandeau FCU ni les écrans ;
   le panneau du guide n'est plus affiché en double pendant le mode automatique. */
(function(){ const st=document.createElement('style'); st.textContent=`@media (min-width:1000px) and (min-aspect-ratio:4/3){ #abub{left:auto;right:12px;transform:none;width:min(470px,34vw)} #abub.cmp,#abub.cmp.tp{top:52px;bottom:auto;width:min(470px,34vw)} } body.ab-on #guide{display:none!important}`; document.head.appendChild(st);
  setInterval(()=>{ const ab=$('abub'), g=$('guide'); const desk=innerWidth>=1000&&innerWidth/innerHeight>=4/3;
    if(ab){ if(desk&&view==='ck'){ const f=$('fcu'), c=$('ckc'); let top=innerHeight*0.55; if(f&&!f.hidden&&f.getBoundingClientRect().height) top=f.getBoundingClientRect().top; else if(c) top=c.getBoundingClientRect().top||top; ab.style.maxHeight=Math.max(220,top-60)+'px'; } else ab.style.maxHeight=''; }
    document.body.classList.toggle('ab-on',!!(ab&&!ab.hidden&&AUTO.on&&!(GD.steps[GD.i]||{}).walk)); },400); })();
