/* ===== V10.38 — TRAJET EN TEMPS RÉEL CONFIRMÉ (tous les appareils) =====
   Bouton « ⏱ Temps réel » (barre, à côté de TEMPS) et proposition au lancement d'un parcours complet :
   1. la confirmation affiche la durée PRÉVUE du trajet [CALCULÉ] (route FPLN ÷ vitesse de croisière simulée, plus montée,
      descente et roulage [ESTIMÉ]), la durée de RÉFÉRENCE des vols réels quand elle existe [RÉFÉRENCÉ], l'écart (signalé
      au-delà de 10 %) et l'heure d'arrivée estimée (UTC et heure locale de destination) ;
   2. une fois confirmé : ×1 en permanence, plus aucune accélération automatique (croisière ×64, hélicoptère ×16, attentes
      au sol ×16, repoussage ×4) ; « Revenir au temps accéléré » rend la main ;
   3. le vol est sauvegardé sur l'appareil toutes les 30 s ; au retour, « Reprendre le vol » replace l'appareil en tenant
      compte du temps réellement écoulé (en croisière sous pilote automatique : avance le long de la route et carburant
      consommé ; ailleurs : état exact au moment de la sauvegarde) ;
   4. un saut d'étape reste possible mais demande « Quitter le temps réel ? ». */
(function(){
'use strict';
const KEY='pt-rt-save-v1', MAXAGE=72*3600e3;
/* Durées de référence des vols réels (temps bloc, porte à porte) [RÉFÉRENCÉ] — vérifiées le 18/11/2026 */
const REF={
  'full-777-af':{min:660,txt:'Air France AF652 Paris-CDG → La Réunion, Boeing 777-300ER : départ 18 h 00, arrivée 08 h 00 (heure locale) = 11 h 00',src:'FlightStats, vol AF652, horaires de novembre 2026'},
  'full-fw':{min:435,txt:'Vols réguliers New York JFK → Paris-CDG : 7 h 15 à 7 h 25 (Air France AF1)',src:'FlightMapper, vol Air France AF 1 JFK → CDG'},
  'full-rw':{min:7.5,range:[5,10],kind:'flight',txt:'Hélicoptère Manhattan → JFK : environ 5 à 10 min de vol selon l\'itinéraire',src:'Blade, « How do you get from Manhattan to JFK by helicopter? »'},
  'full-c172':{min:7,range:[6,8],kind:'flight',txt:'Tour de piste à Toussus en Cessna 172 : environ 6 à 8 min [ESTIMÉ], ordre de grandeur courant en école',src:'[ESTIMÉ] — pas de source officielle'}};
/* Learjet 60 sur JFK → CDG : aucun vol régulier comparable → pas de durée de référence, seule la durée calculée est affichée.
   kind:'flight' = la référence est un temps de vol (hélicoptères, tour de piste) : on la compare au temps de vol calculé, pas au temps bloc */
const TZ={KJFK:'America/New_York',JFKH:'America/New_York',KLGA:'America/New_York',KTEB:'America/New_York',LFPG:'Europe/Paris',LFPO:'Europe/Paris',LFPN:'Europe/Paris',FMEE:'Indian/Reunion'};
const RT=window.RT={on:false};
const miKey=()=>{ try{ if(typeof selMI!=='undefined'&&selMI) return selMI; }catch(e){} return ''; };
const routeKm=()=>{ const F=window.FPLN; let d=0; if(F&&F.pts&&F.pts.length>1){ for(let i=1;i<F.pts.length;i++) d+=gcKm(F.pts[i-1][0],F.pts[i-1][1],F.pts[i][0],F.pts[i][1]); return d; }
  try{ const s=MI.start(), D=APTS[MI.dest]; return gcKm(s.lat,s.lon,D.lat,D.lon); }catch(e){ return 0; } };
/* durée prévue [CALCULÉ] avec les vitesses que la simulation utilise réellement (mêmes formules que le saut direct) */
function plan(){ const k=miKey(), heli=A.kind==='rw', c172=ACK==='c172';
  if(c172){ const km=10.6, v=80*1.852; const fl=km/v*60+1.5, blk=fl+5; return {k,km,cruise:'≈ 80 kt (tour de piste)',flight:fl,block:blk}; }   // tour de piste de la mission (≈ 10,6 km)
  const km=routeKm();
  if(heli){ const kt=A===AC.r44?90:110, fl=km/(kt*1.852)*60+3, blk=fl+2; return {k,km,cruise:kt+' kt',flight:fl,block:blk}; }
  const cruiseFt=AL()?35000:(ACK==='lj60'?41000:6500), a=cruiseFt*FT, mach=AL()?0.82:0.78, tas=Math.min(tasFromCas(280*KT,a),mach*sos(a)), tkt=tas/KT;
  const fl=km/(tkt*1.852)*60+20, blk=fl+22;   // +20 min montée/descente, +22 min roulage départ (15) et arrivée (7) [ESTIMÉ]
  return {k,km,cruise:`FL${Math.round(cruiseFt/100)} · ${Math.round(tkt)} kt vrais (Mach ${(tas/sos(a)).toFixed(2)})`,flight:fl,block:blk}; }
const hm=m=>{ m=Math.round(m); const h=Math.floor(m/60), x=m%60; return h?`${h} h ${String(x).padStart(2,'0')}`:`${x} min`; };
function fmt(ms,tz){ try{ return new Intl.DateTimeFormat('fr-FR',{timeZone:tz,weekday:'short',hour:'2-digit',minute:'2-digit'}).format(new Date(ms)); }catch(e){ return new Date(ms).toISOString().slice(11,16); } }
function info(){ const p=plan(), r=ACK==='lj60'?null:REF[p.k], remain=remainMin(p); const now=(typeof simMs!=='undefined'?simMs:Date.now()), eta=now+remain*60e3, dest=MI&&MI.dest;
  const refMin=r?r.min:null, cmp=r&&r.kind==='flight'?p.flight:p.block, gap=refMin?Math.round((cmp-refMin)/refMin*100):null, inRange=r&&r.range?(cmp>=r.range[0]&&cmp<=r.range[1]):false;
  return {p,r,cmp,remain,eta,etaUTC:fmt(eta,'UTC'),etaLoc:dest&&TZ[dest]?fmt(eta,TZ[dest]):null,dest,refMin,gap,warn:gap!=null&&Math.abs(gap)>10&&!inRange}; }
/* temps restant : bloc complet au départ, ou proportion de route restante en vol */
function remainMin(p){ try{ if(!GD.on||!S||S.onGround!==false) return p.block; const D=APTS[MI.dest], left=gcKm(S.lat,S.lon,D.lat,D.lon), tot=Math.max(1,p.km); return Math.max(5,p.flight*Math.min(1,left/tot)+7); }catch(e){ return p.block; } }

/* ---------- verrouillage ---------- */
function lock(){ RT.on=window.RT_LOCK=true; window.DUR_ON=true; window.TREAL=true; window.RSEL=1; window.FF=null; try{ setRate(1); }catch(e){ rate=1; } try{ rateUI(true); }catch(e){}
  const sel=document.getElementById('b-rate'); if(sel) sel.value='real'; btn(); save(); }
function unlock(msg){ RT.on=window.RT_LOCK=false; btn(); if(msg) flash(msg,'am'); }
RT.lock=lock; RT.unlock=unlock; RT.info=info; RT.plan=plan;
const sel=document.getElementById('b-rate'); if(sel) sel.addEventListener('change',()=>{ if(RT.on&&sel.value!=='real') unlock('Temps réel quitté : temps accéléré'); });

/* ---------- interface ---------- */
const css=document.createElement('style'); css.textContent=`#b-treal.on{border-color:#3ddc84;color:#3ddc84}
#rtdlg{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:130;width:min(500px,calc(100vw - 20px));max-height:calc(100vh - 30px);overflow:auto;background:#0a131c;border:2px solid #3ddc84;border-radius:12px;color:#e8eef2;font:14px/1.45 Inter,sans-serif;padding:14px;box-shadow:0 10px 40px #000c}
#rtdlg h3{font:700 22px 'Barlow Condensed',sans-serif;margin:2px 0 8px} #rtdlg .k{font:700 12px 'Barlow Condensed',sans-serif;letter-spacing:.12em;color:#3ddc84;text-transform:uppercase}
#rtdlg table{width:100%;border-collapse:collapse;margin:6px 0} #rtdlg td{padding:4px 6px;border-bottom:1px solid #1e2c3a;vertical-align:top} #rtdlg td:first-child{color:#9fb3c4;width:42%}
#rtdlg .w{background:#2a2110;border:1px solid #ffd166;border-radius:8px;padding:8px;margin:8px 0;color:#ffe3a3} #rtdlg .s{color:#7d93a8;font-size:12px}
#rtdlg .bt{display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;margin-top:10px} #rtdlg button{background:#132232;color:#fff;border:1px solid #2b3d50;border-radius:8px;padding:9px 13px;font:700 14px 'Barlow Condensed',sans-serif;cursor:pointer}
#rtdlg button.ok{background:#1f6b3a;border-color:#3ddc84} #rtprop{position:fixed;left:50%;bottom:74px;transform:translateX(-50%);z-index:100;background:#0a131ce6;border:1px solid #3ddc84;border-radius:10px;color:#e8eef2;font:13px Inter,sans-serif;padding:8px 10px;display:flex;gap:8px;align-items:center;max-width:calc(100vw - 20px)}
#rtprop button{background:#1f6b3a;color:#fff;border:1px solid #3ddc84;border-radius:7px;padding:6px 10px;font:700 13px 'Barlow Condensed',sans-serif;cursor:pointer} #rtprop .x{background:none;border:none;color:#9fb3c4;font-size:16px;padding:2px 6px}
@media (max-width:560px){ #rtprop{bottom:auto;top:150px;flex-wrap:wrap;justify-content:center;width:calc(100vw - 24px);box-sizing:border-box;padding:8px 30px 8px 10px;text-align:center} #rtprop .x{position:absolute;top:2px;right:2px} }`;
document.head.appendChild(css);
let b=document.getElementById('b-treal');
if(!b&&sel){ b=document.createElement('button'); b.type='button'; b.id='b-treal'; b.title='Confirmation trajet temps réel'; sel.insertAdjacentElement('afterend',b); }
function btn(){ if(!b) return; b.textContent=RT.on?'⏱ Temps réel ✓':'⏱ Temps réel'; b.classList.toggle('on',RT.on); }
if(b){ b.onclick=()=>open(); btn(); }
function esc(t){ return String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
function open(){ if(typeof MI==='undefined'||!MI||!GD||!GD.on){ flash('Lancez d\'abord un parcours','am'); return; }
  close(); const I=info(), p=I.p, w=document.createElement('div'); w.id='rtdlg';
  const ref=I.r?`${esc(I.r.txt)}<div class="s">Source : ${esc(I.r.src)}</div>`:'Aucun vol régulier comparable : pas de durée de référence. Seule la durée calculée est affichée.';
  const gap=I.gap==null?'—':`${I.gap>0?'+':''}${I.gap} %${I.warn?' ⚠ écart supérieur à 10 %':' (écart acceptable)'}`;
  w.innerHTML=`<div class="k">⏱ Confirmation trajet temps réel</div><h3>${esc(MI.n||'Parcours')}</h3>
   <table><tr><td>Durée prévue (temps bloc) [CALCULÉ]</td><td><b>${hm(p.block)}</b> dont vol ${hm(p.flight)}<div class="s">Route ${Math.round(p.km).toLocaleString('fr-FR')} km · croisière ${esc(p.cruise)} · montée, descente et roulage [ESTIMÉ]</div></td></tr>
   <tr><td>Durée de référence [RÉFÉRENCÉ]</td><td>${ref}</td></tr><tr><td>Écart${I.r&&I.r.kind==='flight'?' (temps de vol)':' (temps bloc)'}</td><td>${gap}</td></tr>
   <tr><td>Temps restant</td><td>${hm(I.remain)}</td></tr>
   <tr><td>Arrivée estimée</td><td>${esc(I.etaUTC)} UTC${I.etaLoc?` · <b>${esc(I.etaLoc)}</b> heure locale (${esc(I.dest)})`:''}</td></tr></table>
   <div class="w">Le vol durera réellement environ <b>${hm(I.remain)}</b>, sans accélération automatique. Vous pouvez fermer l'onglet et reprendre plus tard : le vol est sauvegardé sur cet appareil toutes les 30 s.</div>
   <div class="bt">${RT.on?'<button type="button" data-u>Revenir au temps accéléré</button>':''}<button type="button" data-x>${RT.on?'Fermer':'Annuler'}</button>${RT.on?'':'<button type="button" class="ok" data-c>Confirmer le temps réel</button>'}</div>`;
  document.body.appendChild(w);
  w.querySelector('[data-x]').onclick=close; const c=w.querySelector('[data-c]'); if(c) c.onclick=()=>{ close(); lock(); flash('Temps réel confirmé : ×1 pendant tout le trajet','am'); };
  const u=w.querySelector('[data-u]'); if(u) u.onclick=()=>{ close(); unlock('Retour au temps accéléré'); try{ const s2=document.getElementById('b-rate'); if(s2){ s2.value='fast'; window.DUR_ON=false; window.TREAL=false; rateUI(true); } }catch(e){} }; }
function close(){ const w=document.getElementById('rtdlg'); if(w) w.remove(); }
RT.open=open; RT.close=close;

/* proposition discrète au lancement d'un parcours complet (non bloquante) */
function propose(n){ const old=document.getElementById('rtprop'); if(old) old.remove(); if(RT.on||!MI||!MI.full||(window.EXAM&&EXAM.on)) return;
  // V10.38 : pas de proposition par-dessus l'introduction ou un panneau plein écran (téléphone) : elle attend leur fermeture (2 min au plus)
  const ov=['intro','acad','docv','sysat'].map(id=>document.getElementById(id)).find(e=>e&&!e.hidden&&e.offsetParent!==null); if(ov){ if((n||0)<120) setTimeout(()=>propose((n||0)+1),1000); return; }
  let I; try{ I=info(); }catch(e){ return; } const d=document.createElement('div'); d.id='rtprop';
  d.innerHTML=`<span>Trajet réel : <b>${hm(I.p.block)}</b>${I.r?` (référence ${hm(I.r.min)})`:''}</span><button type="button">⏱ Confirmation trajet temps réel</button><button type="button" class="x" aria-label="Fermer">✕</button>`;
  document.body.appendChild(d); d.querySelector('button').onclick=()=>{ d.remove(); open(); }; d.querySelector('.x').onclick=()=>d.remove(); setTimeout(()=>d.remove(),15000); }
const _sm=startMission; startMission=function(){ const r=_sm.apply(this,arguments); if(RT.on&&!RESUMING) unlock(); setTimeout(propose,1500); return r; };

/* ---------- saut d'étape en temps réel : confirmation ---------- */
const _dir=window.DIRECT;
if(_dir){ const j=function(k,then){ if(RT.on&&!RT.jumpOK){ ask(k,then); return; } RT.jumpOK=false; return _dir(k,then); }; window.DIRECT=window.JUMP=j; }
function ask(k,then){ close(); const w=document.createElement('div'); w.id='rtdlg';
  w.innerHTML=`<div class="k">⏱ Temps réel en cours</div><h3>Quitter le temps réel ?</h3><p>Aller à l'étape ${k} déplace l'appareil et interrompt le trajet en temps réel.</p><div class="bt"><button type="button" data-x>Rester en temps réel</button><button type="button" class="ok" data-c>Quitter et aller à l'étape ${k}</button></div>`;
  document.body.appendChild(w); w.querySelector('[data-x]').onclick=close;
  w.querySelector('[data-c]').onclick=()=>{ close(); unlock('Temps réel quitté'); RT.jumpOK=true; window.DIRECT(k,then); }; }

/* ---------- sauvegarde et reprise d'un vol long ---------- */
const ls2={get(){ try{ return JSON.parse(localStorage.getItem(KEY)||'null'); }catch(e){ return null; } },set(v){ try{ localStorage.setItem(KEY,JSON.stringify(v)); }catch(e){} },del(){ try{ localStorage.removeItem(KEY); }catch(e){} }};
const SK=['lat','lon','alt','V','psi','gam','th','ph','gear','flap','thr','fuel','mass','ff','eng','n2','onGround','pushed','pbrake','nr','coll','ve','vn','vu'];
const AK=['on','lat','alt','vs','spd','hdg','ath','appr','althold'];
function save(){ try{ if(!RT.on||!GD.on||!MI||crashed) return; const s={}, a={}; SK.forEach(k=>{ if(S[k]!==undefined) s[k]=S[k]; }); AK.forEach(k=>{ if(AP[k]!==undefined) a[k]=AP[k]; });
  ls2.set({v:1,ac:ACK,mi:miKey(),name:MI.n,i:GD.i,auto:!!(AUTO&&AUTO.on),wall:Date.now(),simMs,S:s,AP:a,fpi:window.FPLN?FPLN.i:null}); }catch(e){} }
RT.save=save; setInterval(save,30000); window.addEventListener('pagehide',save); document.addEventListener('visibilitychange',()=>{ if(document.hidden) save(); });
let RESUMING=false;
/* avance le long de la route (croisière sous pilote automatique) sans dépasser la fin de croisière */
function advance(sv,sec){ const F=window.FPLN; if(!F||!F.pts||!sv.S||sv.S.onGround!==false||!sv.AP.on||sv.AP.appr) return 0;
  const D=APTS[MI.dest], stopKm=250; let left=sv.S.V*sec/1000, moved=0, lat=S.lat, lon=S.lon, i=Math.max(1,F.i||1);
  while(left>0&&i<F.pts.length){ const q=F.pts[i], seg=gcKm(lat,lon,q[0],q[1]), toDest=gcKm(lat,lon,D.lat,D.lon); if(toDest-Math.min(left,seg)<stopKm){ const room=Math.max(0,toDest-stopKm); if(room<=0) break; const f=Math.min(1,room/Math.max(1e-6,seg)); lat+=(q[0]-lat)*f; lon+=(q[1]-lon)*f; moved+=room; break; }
    if(left>=seg){ lat=q[0]; lon=q[1]; left-=seg; moved+=seg; i++; } else { const f=left/seg; lat+=(q[0]-lat)*f; lon+=(q[1]-lon)*f; moved+=left; left=0; } }
  S.lat=lat; S.lon=lon; F.i=Math.min(i,F.pts.length-1); try{ const q=F.pts[F.i]; S.psi=brg(S.lat,S.lon,q[0],q[1])*D2R; }catch(e){}
  return moved; }
function resume(sv){ RESUMING=true; try{ selAC=sv.ac; selMI=sv.mi; renderMenu(); }catch(e){}
  try{ const a=$('m-auto'), p=$('m-peda'); if(a) a.checked=!!sv.auto; if(p) p.checked=!sv.auto; }catch(e){} try{ $('go').click(); }catch(e){} try{ const sk=document.getElementById('br-skip'); if(sk) sk.click(); }catch(e){}
  setTimeout(()=>{ try{ if(sv.i>GD.i&&_dir) _dir(sv.i,sv.auto?'auto':'guide');
      Object.assign(S,sv.S); Object.assign(AP,sv.AP); if(window.FPLN&&sv.fpi!=null) FPLN.i=sv.fpi;
      const sec=Math.max(0,(Date.now()-sv.wall)/1000), km=advance(sv,sec);
      if(km>0&&S.ff) S.fuel=Math.max(0,(S.fuel||0)-S.ff*(km*1000/Math.max(1,sv.S.V))/3600);
      simMs=sv.simMs+sec*1000; try{ patchUpdate(S.lat,S.lon); }catch(e){} lock();
      flash(`Vol repris : ${hm(sec/60)} écoulées${km>0?` · ${Math.round(km)} km parcourus en croisière`:''}`,'am'); }catch(e){ console.warn('reprise du vol',e); }
    RESUMING=false; },1800); }
RT.resume=()=>{ const sv=ls2.get(); if(sv) resume(sv); };
/* proposition de reprise au chargement */
setTimeout(()=>{ const sv=ls2.get(); if(!sv||Date.now()-sv.wall>MAXAGE){ if(sv) ls2.del(); return; }
  const d=document.createElement('div'); d.id='rtprop'; const ago=hm((Date.now()-sv.wall)/60000);
  d.innerHTML=`<span>Vol en temps réel sauvegardé il y a ${ago} : <b>${esc(sv.name||'parcours')}</b>, étape ${sv.i}</span><button type="button">▶ Reprendre le vol</button><button type="button" class="x" aria-label="Oublier ce vol">✕</button>`;
  document.body.appendChild(d); d.querySelector('button').onclick=()=>{ d.remove(); resume(sv); }; d.querySelector('.x').onclick=()=>{ d.remove(); ls2.del(); }; },2500);
})();
