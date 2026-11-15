/* ===== DOSSIER DE VOL : chaque étape et chaque action ouvrent les écrans / commandes concernés =====
   Lire une étape → la voir (le vrai bloc de boutons, la commande encadrée et numérotée comme pendant le vol, ou l'écran avec ses zones légendées).
   Pendant le vol, la même fiche s'ouvre depuis la bulle (« 📖 Fiche de l'étape ») : ce qu'on voit est remis en mots. */
(function(){
const css=document.createElement('style'); css.textContent=`
#vism{position:fixed;inset:0;z-index:75;background:#000d;display:flex;align-items:flex-start;justify-content:center;overflow:auto;padding:12px}
#vism .w{width:min(820px,100%);background:#0a131c;border:2px solid #ff2b2b;border-radius:14px;color:#e8eef2;font:15px/1.5 'Inter',system-ui,sans-serif;margin:auto 0}
#vism .hd{position:sticky;top:0;z-index:2;display:flex;gap:8px;align-items:center;padding:10px 12px;background:#140b0e;border-bottom:1px solid #ff2b2b55;border-radius:12px 12px 0 0}
#vism .hd .t{flex:1;min-width:0}#vism .hd .t small{display:block;color:#ff8a80;font:700 12px 'Barlow Condensed',sans-serif;letter-spacing:.12em;text-transform:uppercase}#vism .hd .t b{font:700 20px/1.15 'Barlow Condensed',sans-serif}
#vism button{background:#132232;color:#fff;border:1px solid #2b3d50;border-radius:9px;padding:7px 11px;font:600 13px 'Barlow Condensed',sans-serif;letter-spacing:.05em;text-transform:uppercase;cursor:pointer}
#vism .bd{padding:10px 12px 14px}#vism .txt{color:#cfd8df;margin:0 0 8px}
#vism .card{border:1px solid #2b3d50;border-radius:12px;margin:12px 0;overflow:hidden;background:#0d1924}#vism .card.focus{border-color:#ff2b2b;box-shadow:0 0 0 2px #ff2b2b55}#vism .card.fin{border-color:#3ddc84}
#vism .ch{display:flex;gap:10px;align-items:flex-start;padding:9px 11px;background:#111f2c}#vism .n{flex:none;background:#ff2b2b;color:#fff;border-radius:999px;padding:2px 10px;font:700 15px 'JetBrains Mono',monospace}#vism .fin .n{background:#1f8a4c}
#vism .ch b{display:block;font:700 17px 'Barlow Condensed',sans-serif}#vism .ch span{color:#9fb3c4;font-size:13px}
#vism .vis{padding:10px;display:flex;justify-content:center;overflow:auto}#vism .help{padding:0 12px 10px;color:#ffd9a8;font-size:13.5px}
#vism .panel-clone{background:#46525e;border-radius:10px;padding:8px;pointer-events:none;max-width:100%}#vism .panel-clone .sec{background:#00000020;margin:0}#vism .panel-clone .sec h4{color:#e8eef2;text-align:center;font:700 13px 'Barlow Condensed',sans-serif;letter-spacing:.1em;margin:0 0 6px}
#vism .panel-clone .row{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
#vism .vt{position:relative;outline:4px solid #ff2b2b;outline-offset:3px;border-radius:6px;animation:vtb 1s ease-in-out infinite}
#vism .vt::after{content:attr(data-n);position:absolute;top:-16px;right:-16px;background:#ff2b2b;color:#fff;border-radius:999px;padding:1px 7px;font:700 13px 'JetBrains Mono',monospace}
@keyframes vtb{50%{outline-color:#ff8a80}}
#vism svg{width:min(100%,520px);height:auto;background:#000;border-radius:8px;border:2px solid #ff2b2b}#vism .snap{width:min(100%,520px);border-radius:8px;border:2px solid #2b3d50;margin-top:6px}
#vism .vf{display:flex;flex-direction:column;align-items:center;gap:6px;width:100%}#vism .cap{color:#9fb3c4;font-size:12px}
#vism .ft{display:flex;gap:8px;flex-wrap:wrap;padding:10px 12px;border-top:1px solid #2b3d50}#vism .go{background:#e04ad8;border:0}
#brief ol.act li[data-vis]{cursor:pointer;border-radius:8px;padding:3px 6px;margin-left:-6px}#brief ol.act li[data-vis]:hover{background:#ff2b2b18}
#brief .visb{display:inline-flex;gap:6px;align-items:center;background:#2a0d0d;border:1px solid #ff2b2b;color:#fff;border-radius:9px;padding:7px 12px;font:700 14px 'Barlow Condensed',sans-serif;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;margin:6px 0}
#brief .vchip{display:inline-block;margin-left:6px;background:#ff2b2b;color:#fff;border-radius:999px;padding:0 8px;font:700 11px 'Barlow Condensed',sans-serif;letter-spacing:.06em}`;
document.head.appendChild(css);

/* ---------- schémas d'écran légendés (lecture) ---------- */
const L=(x,y,t,c)=>`<text x="${x}" y="${y}" fill="${c||'#ffd400'}" font-size="13" font-family="Inter,sans-serif" font-weight="700">${t}</text>`;
const SCR={
 pfd:`<svg viewBox="0 0 400 400"><rect x="120" y="70" width="160" height="210" fill="#2a6fb0"/><rect x="120" y="175" width="160" height="105" fill="#7a4f2a"/><path d="M150 175h40M210 175h40M190 175l10 8 10-8" stroke="#ffd400" stroke-width="5" fill="none"/>
  <rect x="40" y="70" width="60" height="210" fill="#333"/><rect x="40" y="165" width="60" height="22" fill="#000" stroke="#ffd400"/><text x="70" y="181" fill="#3ddc84" font-size="14" text-anchor="middle">250</text>
  <rect x="300" y="70" width="60" height="210" fill="#333"/><rect x="300" y="165" width="60" height="22" fill="#000" stroke="#ffd400"/><text x="330" y="181" fill="#3ddc84" font-size="13" text-anchor="middle">5000</text><rect x="365" y="100" width="18" height="150" fill="#222"/>
  <rect x="40" y="20" width="320" height="34" fill="#111" stroke="#555"/><text x="70" y="42" fill="#3ddc84" font-size="12">SPEED</text><text x="160" y="42" fill="#3ddc84" font-size="12">ALT CST</text><text x="250" y="42" fill="#3ddc84" font-size="12">NAV</text>
  <rect x="120" y="300" width="160" height="34" fill="#333"/><text x="200" y="322" fill="#fff" font-size="13" text-anchor="middle">30 · 31 · 32</text>
  ${L(10,66,'① Modes (FMA)')}${L(4,300,'② Vitesse (kt)')}${L(140,110,'③ Horizon')}${L(296,300,'④ Altitude (ft)')}${L(330,94,'⑤ V/S')}${L(140,360,'⑥ Cap')}</svg>`,
 nd:`<svg viewBox="0 0 400 400"><path d="M60 300 A140 140 0 0 1 340 300" stroke="#fff" stroke-width="2" fill="none"/><path d="M110 300 A90 90 0 0 1 290 300" stroke="#fff" stroke-dasharray="4 6" fill="none"/>
  <path d="M200 330 L280 170 L330 120" stroke="#3ddc84" stroke-width="3" fill="none"/><circle cx="280" cy="170" r="5" fill="#e04ad8"/><text x="288" y="166" fill="#e04ad8" font-size="12">WPT</text>
  <path d="M200 315 v30 M186 330 h28 M192 345 h16" stroke="#ffd400" stroke-width="4"/><text x="20" y="30" fill="#fff" font-size="12">GS 250 TAS 260</text><text x="300" y="30" fill="#fff" font-size="12">WPT 12 NM</text>
  <path d="M40 60 l14 -10" stroke="#3ddc84" stroke-width="3"/><text x="20" y="80" fill="#3ddc84" font-size="12">270/15</text>
  ${L(10,52,'① Vitesses','#ffd400')}${L(268,52,'② Prochain point')}${L(10,100,'③ Vent')}${L(232,210,'④ Route FMS')}${L(116,380,'⑤ Votre avion')}${L(90,270,'⑥ Distance (cercles)')}</svg>`,
 ewd:`<svg viewBox="0 0 400 400"><g fill="none" stroke-width="10"><path d="M60 120 a50 50 0 1 1 90 30" stroke="#ccc"/><path d="M220 120 a50 50 0 1 1 90 30" stroke="#ccc"/></g><text x="80" y="130" fill="#3ddc84" font-size="18">84.5</text><text x="240" y="130" fill="#3ddc84" font-size="18">84.5</text>
  <g fill="none" stroke-width="8"><path d="M70 220 a35 35 0 1 1 65 20" stroke="#ccc"/><path d="M230 220 a35 35 0 1 1 65 20" stroke="#ccc"/></g><text x="86" y="230" fill="#3ddc84" font-size="15">620</text><text x="246" y="230" fill="#3ddc84" font-size="15">620</text>
  <text x="150" y="275" fill="#46c8d8" font-size="13">N2 % · FF kg/h</text><text x="335" y="80" fill="#fff" font-size="13">FLAP</text><text x="345" y="100" fill="#3ddc84" font-size="16">1</text><rect x="20" y="300" width="360" height="80" fill="#0b0b0b" stroke="#444"/><text x="30" y="325" fill="#3ddc84" font-size="12">T.O AUTO BRK MAX · SIGNS ON · SPLRS ARM</text><text x="30" y="350" fill="#ff8a00" font-size="12">ECAM : messages d'alarme et actions</text>
  ${L(20,40,'① N1 = poussée (%)')}${L(20,190,'② EGT = température')}${L(120,292,'③ N2, débit carburant')}${L(300,60,'④ Volets')}${L(30,395,'⑤ Mémos et alarmes ECAM')}</svg>`,
 sd:`<svg viewBox="0 0 400 400"><text x="160" y="30" fill="#fff" font-size="15">ELEC</text><g stroke="#3ddc84" fill="none" stroke-width="2"><rect x="40" y="60" width="80" height="50"/><rect x="280" y="60" width="80" height="50"/><rect x="160" y="160" width="80" height="50"/><rect x="40" y="250" width="80" height="50"/><rect x="280" y="250" width="80" height="50"/><path d="M80 110v50h80M320 110v50h-80M80 250v-40h80M320 250v-40h-80"/></g>
  <text x="52" y="90" fill="#fff" font-size="12">BAT 1</text><text x="292" y="90" fill="#fff" font-size="12">BAT 2</text><text x="170" y="190" fill="#fff" font-size="12">DC BUS</text><text x="52" y="280" fill="#fff" font-size="12">GEN 1</text><text x="292" y="280" fill="#fff" font-size="12">GEN 2</text><text x="50" y="104" fill="#3ddc84" font-size="11">25.6 V</text>
  <rect x="20" y="340" width="360" height="40" fill="#0b0b0b" stroke="#444"/><text x="30" y="365" fill="#3ddc84" font-size="12">TAT +12 °C · SAT +10 °C · 17 H 07 · GW 64 300 KG</text>
  ${L(10,50,'① Page système (ici ELEC)')}${L(130,150,'② Barres et sources')}${L(40,130,'③ Tension / charge')}${L(20,335,'④ Température, heure, masse')}</svg>`,
 all:`<svg viewBox="0 0 400 300"><rect x="20" y="20" width="360" height="260" rx="14" fill="#1b2026" stroke="#555"/>${[0,1,2].map(i=>`<circle cx="${90+i*110}" cy="90" r="40" fill="#000" stroke="#888"/>`).join('')}${[0,1,2].map(i=>`<circle cx="${90+i*110}" cy="200" r="40" fill="#000" stroke="#888"/>`).join('')}
  ${L(50,145,'Vitesse')}${L(160,145,'Horizon')}${L(262,145,'Altitude')}${L(40,258,'Rotor / moteur')}${L(170,258,'Cap')}${L(270,258,'Vario')}</svg>`};
const SNAME={pfd:'PFD — écran de pilotage',nd:'ND — écran de navigation',ewd:'E/WD — moteurs et alarmes',sd:'SD — écran systèmes',all:'Tableau de bord'};
/* captures réelles prises pendant le vol (vue cockpit), réutilisées dans la fiche */
const SNAP={};
setInterval(()=>{ try{ if(view!=='ck'||!$('menu').hidden) return; const cv=$('ckc'), r=cv.getBoundingClientRect(); if(r.height<20) return; const W=r.width,H=r.height, sx=cv.width/W, sy=cv.height/H;
  const take=(k,x,y,w,h)=>{ const c=SNAP[k]||(SNAP[k]=document.createElement('canvas')); c.width=Math.round(w*sx); c.height=Math.round(h*sy); c.getContext('2d').drawImage(cv,x*sx,y*sy,w*sx,h*sy,0,0,c.width,c.height); c.dataset.t=GD.i; };
  if(ACK==='a320'||ACK==='lj60'){ const s=Math.min(H*0.66,W/5.7), gap=(W-5*s)/6, y0=H*0.08, X=i=>gap+i*(s+gap); take('pfd',X(0),y0,s,s); take('nd',X(1),y0,s,s);
    if(ACK==='a320'){ const sc=Math.min(s,(H-y0-10)/2); take('ewd',X(2)+(s-sc)/2,y0,sc,sc); take('sd',X(2)+(s-sc)/2,y0+sc+4,sc,sc); } else take('ewd',X(2),y0,s,s); }
  else take('all',W*0.08,6,W*0.84,H-12); }catch(e){} },4000);

function clonePanel(sel,n){ const el=PT.el(sel); if(!el) return null; const blk=el.closest('.sec')||el.closest('.fcu-g,.grp,.fcu')||el.parentElement; if(!blk) return null;
  el.setAttribute('data-vt','1'); const c=blk.cloneNode(true); el.removeAttribute('data-vt'); c.querySelectorAll('[id]').forEach(x=>x.removeAttribute('id'));
  const t=c.querySelector('[data-vt]'); if(t){ t.removeAttribute('data-vt'); const box=t.closest('.sw')||t; box.classList.add('vt'); box.setAttribute('data-n',n); }
  c.querySelectorAll('select').forEach((s,i)=>{ const o=blk.querySelectorAll('select')[i]; if(o) s.value=o.value; });
  const w=document.createElement('div'); w.className='panel-clone'; w.appendChild(c); return w; }
function visFor(s,st){ const box=document.createElement('div'); box.className='vf';
  if(s.sel){ const p=clonePanel(s.sel,s.n); if(p){ box.appendChild(p); const c=document.createElement('div'); c.className='cap'; c.textContent='Aperçu du vrai bloc de commandes (non cliquable) — la commande à actionner est encadrée en rouge.'; box.appendChild(c); return box; } }
  const k=s.scr||(A.kind==='rw'?'all':null); if(k){ const key=(A.kind==='rw'||!SCR[k])?'all':k; box.insertAdjacentHTML('beforeend',SCR[key]); const c=document.createElement('div'); c.className='cap'; c.textContent=(SNAME[key]||'')+' : schéma de lecture, zones numérotées.'; box.appendChild(c);
    const sn=SNAP[key]; if(sn){ const im=document.createElement('img'); im.className='snap'; im.src=sn.toDataURL(); im.alt='Capture de l\'écran'; box.appendChild(im); const c2=document.createElement('div'); c2.className='cap'; c2.textContent='Capture réelle de cet écran pendant votre vol (étape '+sn.dataset.t+').'; box.appendChild(c2); }
    return box; }
  box.insertAdjacentHTML('beforeend',`<p class="cap">${st.walk?'Action à pied, autour de l\'appareil : suivez les pastilles jaunes du tour avion.':st.calc?'Calcul papier : le détail est dans la page de l\'étape.':'Action de pilotage : manche, palonniers, manettes.'}</p>`); return box; }
function ensurePanels(){ try{ if(!document.querySelector('#ovh [data-sw]')){ if(ACK==='a320'&&typeof buildA320==='function') buildA320(); else buildOVH(); } }catch(e){} try{ if(!document.querySelector('[data-pd]')) buildPED(); }catch(e){} }
function open(i,j){ ensurePanels(); const steps=(window.BR&&BR.steps)||GD.steps; const st=steps&&steps[i]; if(!st) return; let subs=[]; try{ subs=PT.subs(st); }catch(e){ subs=(st.items||[]).map((it,k)=>({n:k+1,l:it[0],sel:it[3],scr:it[4]})); }
  subs.forEach((s,k)=>{ const it=(st.items||[])[k]; if(!s.sel&&!s.final&&it&&/^#mcdu/.test(it[3]||'')){ s.sel=it[3]; s.where='Pédestal › MCDU (clavier du FMS)'; } });
  const N=subs.length; let m=$('vism'); if(m) m.remove(); m=document.createElement('div'); m.id='vism';
  m.innerHTML=`<div class="w"><div class="hd"><div class="t"><small>${st.ph} · étape ${i} / ${steps.length-1} · ${N} sous-étapes</small><b>${st.t}</b></div><button type="button" data-x>✕</button></div><div class="bd"><p class="txt">${st.txt||''}</p></div>
   <div class="ft"><button type="button" class="go" data-auto>▶ Voir cette étape dans le simulateur</button><button type="button" data-guide>🎓 La faire en mode guidé</button><button type="button" data-x>Fermer</button></div></div>`;
  const bd=m.querySelector('.bd');
  subs.forEach((s,k)=>{ const c=document.createElement('div'); c.className='card'+(k===j?' focus':'')+(s.final?' fin':'');
    c.innerHTML=`<div class="ch"><span class="n">${s.n}/${N}</span><div><b>${s.final?s.l.replace(/^Résultat : /,'✓ Résultat attendu : '):s.l}</b><span>${s.where?'📍 '+s.where:''}</span></div></div>`;
    c.appendChild(Object.assign(document.createElement('div'),{className:'vis'})).appendChild(visFor(s,st)); if(s.help) c.insertAdjacentHTML('beforeend',`<div class="help">ℹ ${s.help}</div>`); bd.appendChild(c); });
  document.body.appendChild(m);
  m.addEventListener('click',e=>{ const b=e.target.closest('button'); if(e.target===m||(b&&b.dataset.x!=null)){ m.remove(); return; } if(!b) return;
    if(b.dataset.auto!=null||b.dataset.guide!=null){ m.remove(); const brf=$('brief'); if(brf) brf.hidden=true; window.FF={to:i,then:b.dataset.guide!=null?'guide':'auto'}; if(BR&&BR.launchMode) BR.launchMode('auto'); } });
  if(j!=null){ const f=m.querySelectorAll('.card')[j]; if(f) setTimeout(()=>f.scrollIntoView({block:'center'}),60); } }
window.VIS={open};
// bulle pendant le vol : bouton « Fiche de l'étape »
setInterval(()=>{ const ab=$('abub'); if(!ab||ab.hidden||ab.querySelector('[data-vfiche]')) return; const host=ab.querySelector('.af')||ab; const b=document.createElement('button'); b.type='button'; b.dataset.vfiche=1; b.textContent='📖 Fiche de l\'étape'; b.onclick=e=>{ e.stopPropagation(); open(GD.i,null); }; host.appendChild(b); },1500);
})();
