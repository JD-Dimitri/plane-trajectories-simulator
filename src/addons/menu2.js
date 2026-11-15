/* ===== MENU SIMPLIFIÉ : un seul choix (l'appareil) + LIGNE DIRECTRICE + Réinitialiser =====
   - Plus de rubrique « Mission » : choisir un appareil lance directement son parcours pilote complet (dans le mode coché).
   - Ligne directrice : pour chaque appareil, ses étapes sur une ligne ——|——|——, chaque repère mène directement à l'étape dans la simulation.
   - Réinitialiser : arrête tout et repart de zéro. Les vols libres et les scénarios restent accessibles pendant le vol (boutons « Scénarios », « Procédures »). */
(function(){
const FULL=k=>AC[k].kind==='fw'?'full-fw':'full-rw';
const css=document.createElement('style'); css.textContent=`
#menu .m2-hide{display:none!important}
#menu .ld{margin:6px 0 4px}#menu .ld-row{border:1px solid var(--line);border-radius:12px;background:#0a141e;padding:10px 12px;margin:8px 0}
#menu .ld-row>b{display:flex;align-items:center;gap:8px;font:700 17px 'Barlow Condensed',sans-serif;letter-spacing:.04em}#menu .ld-row>b small{color:var(--mut);font:500 12px 'Inter',sans-serif}
#menu .ld-track{position:relative;display:flex;align-items:flex-end;gap:0;overflow-x:auto;padding:4px 4px 6px;scrollbar-width:thin}#menu .ld-g{display:flex;flex-direction:column;min-width:0;border-left:2px solid #2b3d50;padding-left:2px}#menu .ld-g:first-child{border-left:0}#menu .ld-gl{font:700 10px 'Barlow Condensed',sans-serif;letter-spacing:.08em;text-transform:uppercase;color:var(--cy);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding:0 4px 4px}#menu .ld-gs{display:flex}
#menu .ld-gs{position:relative}#menu .ld-gs::before{content:'';position:absolute;left:0;right:0;top:10px;height:3px;background:linear-gradient(90deg,var(--cy),var(--acc))}
#menu .ld-st{position:relative;flex:1 0 34px;display:flex;flex-direction:column;align-items:center;gap:4px;background:none;border:0;color:#cfd8df;cursor:pointer;padding:0 2px;min-width:34px}
#menu .ld-st i{display:block;width:3px;height:22px;background:#e8eef2;border-radius:2px;z-index:1}#menu .ld-st span{font:700 12px 'JetBrains Mono',monospace}
#menu .ld-st:hover i,#menu .ld-st:focus i{background:var(--acc);height:28px}#menu .ld-st:hover span{color:#fff}
#menu .ld-st em{position:absolute;top:-20px;white-space:nowrap;font:700 10px 'Barlow Condensed',sans-serif;letter-spacing:.08em;text-transform:uppercase;color:var(--cy);font-style:normal}
#menu .ld-tip{min-height:20px;color:#ffd9a8;font-size:13px;margin-top:2px}
#menu .m2-reset{display:flex;gap:10px;align-items:center;margin:14px 0 6px;flex-wrap:wrap}#menu .m2-reset button{background:#2a0d0d;color:#fff;border:1px solid #ff4a3d;border-radius:10px;padding:10px 14px;font:700 15px 'Barlow Condensed',sans-serif;letter-spacing:.06em;text-transform:uppercase;cursor:pointer}
#menu .m2-reset small{color:var(--mut)}#menu .m2-note{color:var(--mut);font-size:13px;margin:4px 0 8px}`;
document.head.appendChild(css);
/* étapes de chaque appareil (calculées une fois, sans démarrer de vol) */
const CACHE={};
function stepsOf(k){ if(CACHE[k]) return CACHE[k]; const sv={ACK,A,MI}; let out=[];
  try{ ACK=k; A=AC[k]; MI=MISSIONS[FULL(k)]; out=stepsFor().map(s=>({t:s.t,ph:s.ph})); }catch(e){ out=[]; } finally{ ACK=sv.ACK; A=sv.A; MI=sv.MI; }
  return CACHE[k]=out; }
function mode(){ const p=$('m-peda'), a=$('m-auto'); if(a&&a.checked) return 'auto'; if(p&&!p.checked) return 'free'; return 'guide'; }
function go(k,step){ selAC=k; ls.set('sim-ac',k); selMI=FULL(k); try{ renderMenu(); }catch(e){} const m=mode();
  if(step>0){ window.FF={to:step,then:m==='auto'?'auto':'guide',from:0}; const want=window.FF; BR.launchMode('auto'); window.FF=want; }
  else BR.launchMode(m==='free'?'free':m); }
function decorate(){ const box=document.querySelector('#menu .box'); if(!box) return; const mi=$('c-mi'), ac=$('c-ac');
  // rubrique Mission retirée
  if(mi){ mi.classList.add('m2-hide'); const h=mi.previousElementSibling; if(h&&h.tagName==='H2') h.classList.add('m2-hide'); }
  const goB=$('go'); if(goB) goB.classList.add('m2-hide');
  const sub=box.querySelector('.sub'); if(sub) sub.innerHTML='Choisissez <b>un appareil</b> : son parcours pilote complet démarre aussitôt, dans le mode coché (guidé ou automatique). La <b>ligne directrice</b> mène directement à n\'importe quelle étape. Modèles simplifiés : tout ce qui est calculé est <b>[SIMULÉ]</b>.';
  // l'heure et les modes passent avant le choix de l'appareil (le clic lance le vol)
  const hTm=$('c-tm')&&$('c-tm').previousElementSibling, hAc=ac&&ac.previousElementSibling;
  if(hAc&&hTm&&hTm.tagName==='H2'&&!box.dataset.m2){ box.dataset.m2=1; const tm=$('c-tm'), peda=$('m-peda')&&$('m-peda').closest('label'), auto=$('m-auto')&&$('m-auto').closest('label');
    box.insertBefore(hTm,hAc); box.insertBefore(tm,hAc); if(peda) box.insertBefore(peda,hAc); if(auto) box.insertBefore(auto,hAc); }
  if(hAc&&hAc.tagName==='H2') hAc.textContent='Appareil — un clic lance le parcours';
  // un seul appareil : clic = lancement
  ac.querySelectorAll('[data-ac]').forEach(b=>{ b.classList.toggle('on',false); b.onclick=()=>go(b.dataset.ac,0); });
  // ligne directrice
  let ld=box.querySelector('.ld'); if(!ld){ ld=document.createElement('div'); ld.className='ld'; ac.after(ld); }
  ld.innerHTML='<h2>Ligne directrice — aller directement à une étape</h2><p class="m2-note">Chaque repère | est une étape du parcours : touchez-le pour la voir ou la faire dans la simulation (les étapes précédentes passent en avance rapide).</p>'+
    Object.keys(AC).map(k=>{ const st=stepsOf(k), G=[]; st.forEach((s,i)=>{ let g=G[G.length-1]; if(!g||g.ph!==s.ph){ g={ph:s.ph,l:[]}; G.push(g); } g.l.push([i,s]); });
      return `<div class="ld-row" data-k="${k}"><b>${AC[k].name}<small>${st.length?st.length-1+' étapes':''}</small></b><div class="ld-track">${G.map(g=>`<div class="ld-g" style="flex:${g.l.length} 0 ${g.l.length*34}px"><div class="ld-gl" title="${g.ph}">${g.ph}</div><div class="ld-gs">${g.l.map(([i,s])=>`<button type="button" class="ld-st" data-k="${k}" data-i="${i}" title="${i}. ${String(s.t).replace(/"/g,'')} (${s.ph})"><i></i><span>${i}</span></button>`).join('')}</div></div>`).join('')}</div><div class="ld-tip"></div></div>`; }).join('');
  ld.querySelectorAll('.ld-st').forEach(b=>{ const tip=b.closest('.ld-row').querySelector('.ld-tip'); const show=()=>{ tip.textContent='▸ '+b.title; };
    b.onmouseenter=show; b.onfocus=show; b.onclick=()=>go(b.dataset.k,+b.dataset.i); });
  // réinitialiser
  if(!box.querySelector('.m2-reset')){ const r=document.createElement('div'); r.className='m2-reset'; r.innerHTML='<button type="button">↺ Réinitialiser — repartir de zéro</button><small>Arrête le vol en cours, efface les choix et recharge le simulateur (la progression des cours de l\'Académie est conservée).</small>';
    r.querySelector('button').onclick=()=>{ try{ window.FF=null; ['sim-ac','sim-mi','sim-tm'].forEach(x=>localStorage.removeItem(x)); }catch(e){} location.reload(); }; ld.after(r); }
  if(!box.querySelector('.m2-scn')){ const n=document.createElement('p'); n.className='m2-note m2-scn'; n.innerHTML='Vols libres, scénarios (US Airways 1549, Germanwings 9525, pannes) et examen blanc : boutons <b>« Scénarios »</b> et <b>« Procédures »</b> pendant le vol, ou cartes « Lancer » du dossier.'; box.querySelector('.m2-reset').after(n); } }
const _rm=renderMenu; renderMenu=function(){ const r=_rm.apply(this,arguments); try{ decorate(); }catch(e){ console.warn('menu',e); } return r; };
try{ decorate(); }catch(e){}
})();
