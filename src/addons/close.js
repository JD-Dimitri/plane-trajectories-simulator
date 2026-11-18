/* =====================================================================================================
   V7.4 — UNE CROIX DE FERMETURE ✕ SUR CHAQUE BOÎTE ET PANNEAU QUI N'EN A PAS
   Détection automatique (toutes les 0,4 s, y compris les panneaux reconstruits) ; fermeture propre selon le panneau
   (guide, radio, pannes, scénarios, pédestal, QCM, aide, bulle du mode automatique, informations de vol, FCU, menu).
   Un panneau fermé reste fermé jusqu'à ce qu'on le rouvre par son bouton de la barre ; ceux qui n'ont pas de bouton
   (bulle automatique, informations de vol, FCU) se rouvrent par une pastille en haut à gauche.
   ===================================================================================================== */
(function(){
'use strict';
const css=document.createElement('style'); css.textContent=`
.pclose{flex:0 0 auto;width:30px;height:30px;padding:0!important;border-radius:50%!important;display:inline-grid;place-items:center;font:700 15px/1 Inter,sans-serif!important;letter-spacing:0!important;background:#2a1418!important;border:1px solid #6a3a44!important;color:#ffd7dc!important;z-index:5;margin-left:6px}
.pclose:hover{background:#4a1a22!important;border-color:var(--red)!important}
.pclose.abs{position:absolute;top:6px;right:6px}
.pclose.out{top:-11px;right:-11px;width:26px;height:26px;font-size:13px!important}
#msg{pointer-events:none}/* V10.40 (F24) : les messages d'alerte ne masquent plus la ✕ du bandeau d'informations */
#pchips{position:fixed;left:8px;top:calc(8px + env(safe-area-inset-top,0px));z-index:22;display:flex;gap:6px;flex-wrap:wrap}
#pchips button{font-size:11px;padding:5px 9px;background:#101b26ee}`;
document.head.appendChild(css);
const FORCE=new Set(), CHIP={abub:'💬 Bulle d\'étape',hud:'ⓘ Infos de vol',fcu:'🎛 FCU'};
const BTN={guide:'b-guide',ped:'b-ped',atc:'b-atc',fail:'b-fail',scn:'b-scn',qcm:'b-qcm',help:'b-help',ovh:'b-ovh',snd:'b-snd'};
let started=false; const _sm=startMission; startMission=function(){ started=true; FORCE.clear(); renderChips(); return _sm.apply(this,arguments); };

function hasClose(p){ return [...p.querySelectorAll('button')].some(b=>{ if(b.classList.contains('pclose')) return true; const t=(b.textContent||'').trim();
  return /^(✕|×|x|X|✖|Fermer|Close)$/.test(t)||/-x$/.test(b.id||'')||/fermer/i.test((b.title||'')+(b.getAttribute('aria-label')||'')); }); }
function closeP(id){ const p=document.getElementById(id); if(!p) return;
  switch(id){
    case 'guide': GD.peda=false; { const b=$('b-guide'); if(b) b.classList.remove('on'); } p.hidden=true; FORCE.add(id); break;
    case 'atc': atcOpen(false); break; case 'fail': failOpen(false); break; case 'scn': scnOpen(false); break;
    case 'ped': p.hidden=true; { const b=$('b-ped'); if(b) b.classList.remove('on'); } break;
    case 'ovh': { const x=$('ovh-x'); if(x) x.click(); else p.hidden=true; } break;
    case 'abub': window.ABUB_X=true; p.hidden=true; FORCE.add(id); break;
    case 'menu': $('menu').hidden=true; paused=false; return;
    default: p.hidden=true; if(CHIP[id]) FORCE.add(id); }
  { const b=BTN[id]&&$(BTN[id]); if(b) b.classList.remove('on'); }
  renderChips(); }
function reopen(id){ FORCE.delete(id); const p=document.getElementById(id); if(id==='abub') window.ABUB_X=false; else if(p) p.hidden=false; renderChips(); }
function renderChips(){ let c=$('pchips'); if(!c){ c=document.createElement('div'); c.id='pchips'; document.body.appendChild(c); }
  const ids=[...FORCE].filter(i=>CHIP[i]&&!(i==='abub'&&!(typeof AUTO!=='undefined'&&AUTO.on)));
  c.innerHTML=ids.map(i=>`<button type="button" data-reopen="${i}" title="Rouvrir">${CHIP[i]}</button>`).join(''); c.hidden=!ids.length||!$('menu').hidden; }
addEventListener('click',e=>{ const r=e.target.closest&&e.target.closest('[data-reopen]'); if(r){ reopen(r.dataset.reopen); return; }
  // rouvrir par le bouton de la barre : on lève la fermeture forcée
  const b=e.target.closest&&e.target.closest('#bar button'); if(b){ for(const id in BTN) if(BTN[id]===b.id) FORCE.delete(id); } },true);
// fermeture sur pointerdown : fonctionne même si le panneau est reconstruit entre l'appui et le relâchement
addEventListener('pointerdown',e=>{ const x=e.target.closest&&e.target.closest('.pclose'); if(!x) return; e.preventDefault(); e.stopPropagation(); closeP(x.dataset.for); },true);
// V10.40 (F24) : aussi au clic (clavier : Entrée / Espace, lecteurs d'écran, clic programmé), sans double fermeture
addEventListener('click',e=>{ const x=e.target.closest&&e.target.closest('.pclose'); if(!x) return; e.preventDefault(); e.stopPropagation(); const p=document.getElementById(x.dataset.for); if(p&&!p.hidden) closeP(x.dataset.for); },true);

function candidates(){ const out=[]; document.querySelectorAll('.panel, #ovh, #menu').forEach(p=>{ if(!p.id||p.hidden||p.offsetParent===null&&getComputedStyle(p).position!=='fixed') return;
  if(['bar','brief','pchips'].includes(p.id)) return; if(p.id==='menu'&&!started) return; if(p.closest('#brief')) return; out.push(p); }); return out; }
function inject(p){ if(hasClose(p)) return; const b=document.createElement('button'); b.type='button'; b.className='pclose'; b.dataset.for=p.id; b.title='Fermer'; b.setAttribute('aria-label','Fermer'); b.textContent='✕';
  const h=p.id==='menu'?null:p.querySelector(':scope > .gh, :scope > .ah, :scope > .hd, :scope > .qh, :scope > h3');
  if(h&&getComputedStyle(h).display==='flex'){ h.appendChild(b); }
  else { if(getComputedStyle(p).position==='static') p.style.position='relative'; b.classList.add('abs'); if(p.id==='hud'||p.id==='fcu') b.classList.add('out'); if(p.id==='menu'){ b.style.position='fixed'; b.style.top='calc(10px + env(safe-area-inset-top,0px))'; b.style.right='12px'; b.style.width=b.style.height='40px'; b.title='Fermer le menu et reprendre le vol'; } p.appendChild(b); } }
let raf=0; new MutationObserver(()=>{ if(raf) return; raf=requestAnimationFrame(()=>{ raf=0; try{ candidates().forEach(inject); }catch(e){} }); }).observe(document.body,{childList:true,subtree:true});
setInterval(()=>{ try{
  FORCE.forEach(id=>{ const p=document.getElementById(id); if(p&&!p.hidden) p.hidden=true; });
  candidates().forEach(inject); renderChips();
  // V10.40 (F24) : une croix ne doit jamais sortir de l'écran (FCU très large, panneaux déplacés) : on la ramène à l'intérieur
  document.querySelectorAll('.pclose.abs').forEach(x=>{ if(x.closest('[hidden]')) return; const r=x.getBoundingClientRect(); if(!r.width) return;
    if(r.right>innerWidth-2||r.left<2||r.top<2){ x.classList.remove('out'); x.style.right='4px'; x.style.top='4px'; } });
}catch(e){ console.warn('croix',e); } },400);
})();
