/* ===== V10.40 (F11) : ÉCRAN « 🧮 CALCULS DU VOL » =====
   Un seul écran qui enchaîne tous les calculs du dossier de vol de la mission en cours, dans l'ordre de préparation :
   1 atmosphère au départ · 2 croisière (Mach / TAS, vent, vitesse sol, temps) · 3 bilan carburant · 4 masses et masse permise · 5 centrage ·
   6 vent sur la piste et vitesses de décollage · 7 descente · 8 point équitemps et point de non-retour · 9 heures UTC et locales.
   Valeurs préremplies avec les données de la mission (appareil, route, météo, devis du simulateur), modifiables ; chaque bloc renvoie au document
   qu'il remplit ; « Appliquer au dossier de vol » reporte passagers, bagages, fret et carburant supplémentaire dans les documents (lsCalc).
   Formules : partie 9 de l'Académie (calculs du pilote de ligne). Résultats [CALCULÉ] ; données appareil [RÉFÉRENCÉ] ou [ESTIMÉ] selon l'appareil. */
(function(){
if(typeof LS==='undefined'||typeof WB==='undefined') return;
const f0=v=>isFinite(v)?Math.round(v).toLocaleString('fr-FR'):'—', f1=v=>isFinite(v)?(Math.round(v*10)/10).toLocaleString('fr-FR'):'—', f2=v=>isFinite(v)?(Math.round(v*100)/100).toLocaleString('fr-FR'):'—';
const R=Math.PI/180, a_kt=tc=>38.94*Math.sqrt(tc+273.15), isa=h=>h<=36089?15-1.98*h/1000:-56.5;
const TZ={KJFK:'America/New_York',JFKH:'America/New_York',KLGA:'America/New_York',KJRB:'America/New_York',LFPG:'Europe/Paris',LFPO:'Europe/Paris',LFPN:'Europe/Paris',FMEE:'Indian/Reunion'};
const hm=h=>{ if(!isFinite(h)) return '—'; const m=Math.round(h*60); return Math.floor(m/60)+' h '+String(m%60).padStart(2,'0'); };
const loc=(ms,tz)=>{ try{ return new Intl.DateTimeFormat('fr-FR',{timeZone:tz,hour:'2-digit',minute:'2-digit',weekday:'short'}).format(new Date(ms)); }catch(e){ return '—'; } };
const css=document.createElement('style'); css.textContent=`
#calcform{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:125;width:min(760px,calc(100vw - 16px));max-height:calc(100vh - 24px);overflow:auto;background:#0a131c;border:2px solid #3fd0ff;border-radius:12px;color:#e8eef2;font:13px/1.45 Inter,sans-serif;padding:12px;box-shadow:0 10px 40px #000c;box-sizing:border-box}
#calcform .cfx{flex:0 0 auto;width:32px;height:32px;padding:0;border-radius:50%;display:inline-grid;place-items:center;font:700 15px/1 Inter,sans-serif;background:#2a1418;border:1px solid #6a3a44;color:#ffd7dc;cursor:pointer}#calcform .cfx:hover{background:#4a1a22}#calcform h3{margin:0 0 4px;font:700 21px 'Barlow Condensed',sans-serif;letter-spacing:.04em} #calcform .s{color:#8ea3b8;font-size:11.5px}
#calcform section{border:1px solid #2b3d50;border-radius:10px;padding:8px 10px;margin:8px 0} #calcform h4{margin:0 0 6px;font:700 13px 'Barlow Condensed',sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#3fd0ff}
#calcform .g{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:6px 10px} #calcform label{display:flex;flex-direction:column;font-size:11px;color:#9fb3c4}
#calcform input{background:#0e1822;color:#e8eef2;border:1px solid #2b3d50;border-radius:5px;padding:4px 6px;font:12px 'JetBrains Mono',monospace;margin-top:2px}
#calcform .o{margin-top:6px;padding:6px 8px;background:#0b1622;border-left:3px solid #4ade80;border-radius:4px;font:12px/1.6 'JetBrains Mono',monospace} #calcform .ko{color:#ff8a80} #calcform .ok{color:#8be3b0}
#calcform .bt{display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;position:sticky;bottom:-12px;background:#0a131c;padding:8px 0 0} #calcform button{background:#132232;color:#fff;border:1px solid #2b3d50;border-radius:8px;padding:7px 11px;font:700 13px 'Barlow Condensed',sans-serif;cursor:pointer}
#calcform button.go{background:#1f6b3a;border-color:#3ddc84} #calcform .dl{margin-top:4px} #calcform .dl button{padding:3px 8px;font-size:11.5px;margin:2px 4px 0 0}`;
document.head.appendChild(css);
const SECT=[['atm','1 · Atmosphère au départ'],['cru','2 · Croisière : vitesse, vent, temps'],['fuel','3 · Bilan carburant'],['mass','4 · Masses et masse permise'],['cg','5 · Centrage'],['to','6 · Vent sur la piste et vitesses de décollage'],['desc','7 · Descente'],['pet','8 · Point équitemps et point de non-retour'],['time','9 · Heures UTC et locales']];
const DOCOF={atm:[['metar','METAR / TAF'],['perf','Performances']],cru:[['ofp','OFP'],['wintem','Vents et températures']],fuel:[['fuel','Bilan carburant'],['ofp','OFP'],['fpl','Plan de vol OACI']],mass:[['loadsheet','Devis de masse'],['notoc','NOTOC']],cg:[['loadsheet','Devis de masse']],to:[['perf','Performances'],['metar','METAR']],desc:[['ofp','OFP'],['app','Carte d\'approche']],pet:[['ofp','OFP'],['route','Carte de route']],time:[['fpl','Plan de vol OACI'],['ofp','OFP']]};
function defaults(){ const w=WB[ACK]||{}, AL_=typeof AL==='function'&&AL(), dep=(MI&&(MI.dep||(MI.start&&(()=>{ let b=null,bd=1e9; const s=MI.start(); for(const k in APTS){ const a=APTS[k]; const d=gcKm(s.lat,s.lon,a.lat,a.lon); if(d<bd){ bd=d; b=k; } } return b; })())))||'—', dest=(MI&&MI.dest)||'—';
  let km=0; try{ const F=window.FPLN; if(F&&F.pts&&F.pts.length>1){ for(let i=1;i<F.pts.length;i++) km+=gcKm(F.pts[i-1][0],F.pts[i-1][1],F.pts[i][0],F.pts[i][1]); } else km=LS.dist||0; }catch(e){ km=LS.dist||0; }
  let q=1013, t=15, wd=0, ws=0; try{ const m=WXS.met[dep]; if(m){ q=m.q||m.qnh||1013; t=m.t!=null?m.t:(m.temp!=null?m.temp:15); wd=m.dir||0; ws=m.spd||0; } }catch(e){}
  let rwh=0; try{ rwh=Math.round(rwStart(dep,MI.depRw).hdg); }catch(e){}
  const elev=APTS[dep]?Math.round(APTS[dep].elev*3.281):0, mach={a320:0.78,b777:0.84,a350:0.85,lj60:0.78}[ACK]||0;
  return {dep,dest,AL:AL_,d:Math.round(km/1.852),elev,q,t,fl:AL_?350:ACK==='lj60'?410:65,mach,tas:w.gs||100,isad:0,wc:0,ff:w.burn||30,taxi:w.taxi||0,alt:w.alt||0,res:w.res30||0,extra:LS.extra||0,cap:w.fuelMax||0,
    dow:w.dow||0,pax:LS.pax!=null?LS.pax:(w.pax||0),stdPax:w.stdPax||84,bag:LS.bag!=null?LS.bag:(w.bag||0),cargo:LS.cargo!=null?LS.cargo:(w.cargo||0),mzfw:w.mzfw||0,mtow:w.mtow||0,mlw:w.mlw||0,
    rwh,wd,ws,etd:'17:00',vga:140}; }
let V=null;
const IN=(k,l,st)=>`<label>${l}<input data-k="${k}" type="${typeof V[k]==='string'?'text':'number'}" value="${V[k]}" step="${st||'any'}"></label>`;
function body(){ return SECT.map(([id,t])=>`<section data-s="${id}"><h4>${t}</h4><div class="g">${({
  atm:IN('elev','Altitude du terrain (ft)')+IN('q','QNH (hPa)')+IN('t','Température (°C)'),
  cru:IN('d','Distance de la route (NM)')+IN('fl','Niveau de croisière (FL)')+(V.AL?IN('mach','Mach de croisière'):IN('tas','Vitesse vraie (kt)'))+IN('isad','Écart ISA en croisière (°C)')+IN('wc','Vent moyen (+ arrière / − face, kt)'),
  fuel:IN('ff','Consommation (kg/h)')+IN('taxi','Roulage (kg)')+IN('alt','Dégagement (kg)')+IN('res','Réserve finale 30 min (kg)')+IN('extra','Supplémentaire (kg)')+IN('cap','Capacité (kg)'),
  mass:IN('dow','Masse de base DOW (kg)')+IN('pax','Passagers')+IN('stdPax','Masse forfaitaire (kg)')+IN('bag','Bagages par passager (kg)')+IN('cargo','Fret (kg)')+IN('mzfw','MZFW (kg)')+IN('mtow','MTOW (kg)')+IN('mlw','MLW (kg)'),
  cg:'',to:IN('rwh','Axe de piste (°)')+IN('wd','Vent : direction (°)')+IN('ws','Vent : force (kt)'),desc:IN('vga','Vitesse sol en approche (kt)'),pet:'',time:IN('etd','Départ au bloc (UTC, hh:mm)')})[id]}</div><div class="o" data-o="${id}"></div>
  <div class="dl">${(DOCOF[id]||[]).map(([d,n])=>`<button type="button" data-doc="${d}">📄 ${n}</button>`).join('')}</div></section>`).join(''); }
function calc(){ const v=V, o={}, dep=v.dep, dest=v.dest;
  // 1 atmosphère
  const pa=v.elev+(1013-v.q)*28, dev=v.t-isa(pa), da=pa+120*dev; o.atm=`Altitude-pression ${f0(pa)} ft · ISA ${f1(isa(pa))} °C · écart ISA ${dev>=0?'+':''}${f1(dev)} °C · altitude-densité <b>${f0(da)} ft</b>`;
  // 2 croisière
  const h=v.fl*100, tc=isa(h)+v.isad, a=a_kt(tc), tas=v.AL?v.mach*a:v.tas, gs=tas+v.wc, tt=v.d/gs+0.25;
  o.cru=(v.AL?`Vitesse du son ${f0(a)} kt · TAS = ${f2(v.mach)} × ${f0(a)} = <b>${f0(tas)} kt</b>`:`TAS <b>${f0(tas)} kt</b>`)+` · GS ${f0(gs)} kt · croisière ${hm(v.d/gs)} + 15 min montée / approche = <b>${hm(tt)}</b>`;
  // 3 carburant
  const trip=tt*v.ff, cont=0.05*trip, blk=v.taxi+trip+cont+v.alt+v.res+v.extra, tof=blk-v.taxi;
  o.fuel=`Étape ${f0(trip)} + route 5 % ${f0(cont)} + dégagement ${f0(v.alt)} + réserve finale ${f0(v.res)} + supplémentaire ${f0(v.extra)} + roulage ${f0(v.taxi)} = <b>bloc ${f0(blk)} kg</b> · TOF ${f0(tof)} kg · `+(v.cap&&blk>v.cap?`<span class="ko">✗ dépasse la capacité (${f0(v.cap)} kg) : escale ou dégagement plus proche</span>`:`<span class="ok">✓ capacité ${f0(v.cap)} kg</span>`)+` · autonomie ${hm(tof/v.ff)} (case E du plan de vol)`;
  // 4 masses
  const load=v.pax*v.stdPax+v.pax*v.bag+v.cargo, zfw=v.dow+load, tow=zfw+tof, lw=tow-trip, perm=Math.min(v.mtow||Infinity,(v.mzfw||Infinity)+tof,(v.mlw||Infinity)+trip);
  const chk=(x,l,n)=>l?(x<=l?`<span class="ok">${n} ${f0(x)} ≤ ${f0(l)} ✓</span>`:`<span class="ko">${n} ${f0(x)} > ${f0(l)} ✗</span>`):`${n} ${f0(x)}`;
  o.mass=`Charge marchande ${f0(load)} kg · ${chk(zfw,v.mzfw,'ZFW')} · ${chk(tow,v.mtow,'TOW')} · ${chk(lw,v.mlw,'LW')}<br>TOW permise = min(MTOW ; MZFW + TOF ; MLW + étape) = <b>${f0(perm)} kg</b> · charge offerte restante <b>${f0(perm-tow)} kg</b>`;
  // 5 centrage (devis du simulateur)
  o.cg=LS.cg!=null?`Centrage au décollage (devis de masse du simulateur, chargement par zones) : <b>${f1(LS.cg)} % MAC</b> ${LS.cgOK?'<span class="ok">✓ dans les limites</span>':'<span class="ko">✗ hors limites</span>'} · après « Appliquer », le devis est recalculé avec vos valeurs.`:(LS.arm!=null?`Bras du centre de gravité : <b>${f2(LS.arm)} m</b> ${LS.cgOK?'<span class="ok">✓</span>':'<span class="ko">✗</span>'}`:'Centrage : voir le devis de masse.');
  // 6 piste
  const th=(v.wd-v.rwh)*R, hw=v.ws*Math.cos(th), xw=v.ws*Math.sin(th);
  o.to=`${hw>=0?'Vent de face':'Vent arrière'} <b>${f0(Math.abs(hw))} kt</b> · travers <b>${f0(Math.abs(xw))} kt</b> venant de ${xw>=0?'droite':'gauche'}`+(LS.v1?` · V1 ${LS.v1} / VR ${LS.vr} / V2 ${LS.v2} kt (formule pédagogique [ESTIMÉ] du simulateur)`:'');
  // 7 descente
  const dEl=APTS[dest]?APTS[dest].elev*3.281:0, tod=(h-dEl)/1000*3; o.desc=`Point de début de descente ≈ <b>${f0(tod)} NM</b> avant l\'arrivée (règle des 3, + 10 NM pour décélérer) · plan de 3° à ${f0(v.vga)} kt : <b>${f0(v.vga*5)} ft/min</b>`;
  // 8 PET / PNR
  const O=tas+v.wc, H=tas-v.wc, pet=v.d*H/(O+H), E=(tof-v.alt-v.res)/v.ff, pnr=E*H/(O+H);
  o.pet=`PET à <b>${f0(pet)} NM</b> du départ (${hm(pet/O)}) · PNR à ${hm(pnr)} soit <b>${f0(pnr*O)} NM</b> (autonomie hors réserves ${hm(E)})`+(pnr*O<v.d?'':' · le PNR est au-delà de la destination : on peut toujours revenir');
  // 9 heures
  const m=/^(\d{1,2}):(\d{2})$/.exec(String(v.etd)||''), d0=new Date(); let txt='Heure de départ au format hh:mm.';
  if(m){ const t0=Date.UTC(d0.getUTCFullYear(),d0.getUTCMonth(),d0.getUTCDate(),+m[1],+m[2]), blockH=tt+((v.taxi?0.37:0.05)), t1=t0+blockH*3600e3;
    txt=`Temps bloc ≈ ${hm(blockH)} (roulage compris [ESTIMÉ]) · arrivée <b>${new Date(t1).toISOString().slice(11,16)} UTC</b>`+(TZ[dep]?` · départ ${loc(t0,TZ[dep])} heure locale (${dep})`:'')+(TZ[dest]?` · arrivée <b>${loc(t1,TZ[dest])}</b> heure locale (${dest})`:''); }
  o.time=txt;
  return o; }
function render(){ const w=document.getElementById('calcform'); if(!w) return; const o=calc(); Object.keys(o).forEach(k=>{ const e=w.querySelector(`[data-o="${k}"]`); if(e) e.innerHTML=o[k]; }); }
function open(){ close(); try{ if(!LS.tow&&typeof lsInit==='function'&&MI) lsInit(); }catch(e){} V=defaults(); const w=document.createElement('div'); w.id='calcform';
  w.innerHTML=`<h3 style="display:flex;align-items:center;gap:8px"><span style="flex:1">🧮 Calculs du vol</span><button type="button" data-x class="cfx" title="Fermer" aria-label="Fermer">✕</button></h3><div class="s">${(typeof A!=='undefined'&&A.name)||''} · ${V.dep} → ${V.dest} · valeurs préremplies avec la mission, modifiables. Formules : Académie, partie 9 « Calculs du pilote de ligne ». Résultats [CALCULÉ] ; les documents de l'exploitant font foi.</div>${body()}
   <div class="bt"><button type="button" data-ap class="go">Appliquer au dossier de vol</button><button type="button" data-acad>📘 Cours (partie 9)</button><button type="button" data-x>Fermer</button></div>`;
  document.body.appendChild(w);
  w.addEventListener('input',e=>{ const k=e.target.dataset&&e.target.dataset.k; if(!k) return; V[k]=e.target.type==='number'?(parseFloat(e.target.value)||0):e.target.value; render(); });
  w.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b) return; if(b.dataset.x!=null) return close(); if(b.dataset.doc){ try{ DOCS.open(b.dataset.doc); }catch(er){} return; }
    if(b.dataset.acad!=null){ try{ const i=ACAD.PARTS.flatMap(p=>p.mods).findIndex(m=>m.id==='L1'); ACAD.open(i>=0?i:undefined); }catch(er){} return; }
    if(b.dataset.ap!=null){ try{ Object.assign(LS,{pax:V.pax,bag:V.bag,cargo:V.cargo,extra:V.extra}); lsCalc(); flash('Dossier de vol recalculé : devis de masse, bilan carburant et documents à jour','am'); render(); }catch(er){ console.warn('appliquer',er); } } });
  render(); }
function close(){ const w=document.getElementById('calcform'); if(w) w.remove(); }
addEventListener('keydown',e=>{ if(e.key==='Escape'&&document.getElementById('calcform')) close(); }); /* V10.40 (F24) */
window.CALCF={open,close,calc:()=>calc(),vals:()=>V};
function barBtn(){ const d=document.getElementById('b-docs'); if(!d||document.getElementById('b-calc')) return; const b=document.createElement('button'); b.type='button'; b.id='b-calc'; b.textContent='🧮 Calculs du vol'; b.title='Tous les calculs du dossier de vol, dans l\'ordre, reliés aux documents'; b.onclick=open; d.parentNode.insertBefore(b,d.nextSibling); }
setInterval(barBtn,1000); barBtn();
})();
