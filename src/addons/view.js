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
const KEEP=['b-menu','b-pause','b-auto','b-more','b-scr'];
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
