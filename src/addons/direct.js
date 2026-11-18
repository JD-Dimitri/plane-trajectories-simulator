/* ===== V10.37 — ALLER DIRECTEMENT À UNE ÉTAPE (saut direct, tous les appareils) =====
   Choisir une étape (🧭 Étapes, bande d'étapes, « Poursuivre » d'un sigle) mène IMMÉDIATEMENT la simulation à cette étape :
   1. les actions des étapes précédentes sont exécutées d'un coup (systèmes, moteurs, FMS…) et cochées dans la check-list ;
   2. l'appareil est placé là où se déroule l'étape : parking, aligné sur la piste, en montée, en croisière sur la route,
      au début de la descente, en approche, en finale ILS, posé à destination ; hélicoptères : stationnaire, transit, approche ;
      Cessna 172 : la branche du tour de piste (vent traversier, vent arrière, base, finale) ;
   3. on rend la main en mode guidé ou automatique. Revenir à une étape antérieure relance le parcours puis saute de la même façon.
   Positions et vitesses types [SIMULÉ] : elles reproduisent un vol normal, pas un vol réel enregistré. */
(function(){
'use strict';
const ft=x=>x*FT, kt=x=>x*KT;
function ffOff(){ window.FF=null; const o=document.getElementById('jmpo'); if(o) o.hidden=true; }
function runActions(k){ const done=window.__DIRDONE||(window.__DIRDONE=new Set());
  for(let i=0;i<k&&i<GD.steps.length;i++){ const st=GD.steps[i]; (st.items||[]).forEach((it,j)=>{ try{ if(!it[1]()&&typeof it[2]==='function') it[2](); }catch(e){} done.add(i+':'+j); try{ if(window.CKL&&CKL.mark) CKL.mark(i,j); }catch(e){} });
    if(st.walk){ try{ if(GD.markers) GD.markers.forEach(m=>{ m.seen=true; }); GD.walkDone=true; if(GD.seen&&GD.pts) GD.pts.forEach((p,n)=>GD.seen.add(n)); }catch(e){} } } }
function startedBefore(k){ return GD.steps.slice(0,k).some(s=>/Mise en route|Démarrage|Start/i.test(s.ph+' '+s.t)); }
function enginesOn(){ try{ const n=A.twin||AL()||ACK==='lj60'?2:1; S.eng=[true,n>1]; S.n2=[1,n>1?1:0]; if(A.kind==='rw'){ S.nr=1; S.eng=[true,!!A.twin]; }
  if(AL()){ SYS.master1=SYS.master2='ON'; SYS.engMode='NORM'; } if(ACK==='c172'){ Object.assign(SYS,{bat1:true,alt1:true,avion:true,mix:'RICH',mags:'BOTH',fuelSel:'BOTH'}); GD.primed=true; }   /* valeurs exactes attendues par c172.js (« RICH ») */ }catch(e){} }
const ll=(r,x,y)=>{ const h=r.hdg*D2R; return offsetLL(r.lat,r.lon,x*Math.cos(h)-y*Math.sin(h),x*Math.sin(h)+y*Math.cos(h)); };   // x le long de l'axe, y à droite
function air(lat,lon,altM,casKt,hdgDeg,o){ o=o||{}; const V=o.tas||tasFromCas(kt(casKt),altM);
  Object.assign(S,{lat,lon,alt:altM,V,onGround:false,gam:(o.gam||0)*D2R,th:(o.th!=null?o.th:2)*D2R,ph:0,psi:hdgDeg*D2R,gear:!!o.gear,flap:o.flap||0,thr:o.thr!=null?o.thr:0.6,pbrake:false,brake:false,pushed:true});
  if(A.kind==='rw'){ S.ve=V*Math.sin(S.psi); S.vn=V*Math.cos(S.psi); S.vu=0; S.coll=0.6; try{ DIR.iv=0; }catch(e){} }   /* mémoire (terme intégral) du pilotage automatique remise à zéro après le saut */
  TX.auto=false; try{ showRoute(null); }catch(e){} }
function ground(lat,lon,hdgDeg,elev){ Object.assign(S,{lat,lon,alt:(elev!=null?elev:elevAt(lat,lon)),V:0,onGround:true,gam:0,th:0,ph:0,psi:hdgDeg*D2R,thr:0,pbrake:true,pushed:true}); if(A.kind==='rw'){ S.ve=S.vn=S.vu=0; S.coll=0; try{ DIR.iv=0; }catch(e){} } TX.auto=false; }
function routePoint(frac){ const F=window.FPLN; if(!F||!F.pts||F.pts.length<2) return null; const P=F.pts; let tot=0; const seg=[]; for(let i=1;i<P.length;i++){ const d=gcKm(P[i-1][0],P[i-1][1],P[i][0],P[i][1]); seg.push(d); tot+=d; }
  let want=tot*frac; for(let i=1;i<P.length;i++){ if(want<=seg[i-1]){ const f=want/Math.max(1e-6,seg[i-1]), la=P[i-1][0]+(P[i][0]-P[i-1][0])*f, lo=P[i-1][1]+(P[i][1]-P[i-1][1])*f; F.i=i; return {lat:la,lon:lo,hdg:brg(P[i-1][0],P[i-1][1],P[i][0],P[i][1])}; } want-=seg[i-1]; }
  return null; }
function before(lat,lon,km,fromLat,fromLon){ const b=brg(lat,lon,fromLat,fromLon); return {p:offsetLL(lat,lon,km*1000*Math.cos(b*D2R),km*1000*Math.sin(b*D2R)),hdg:wrap360(b+180)}; }
function prevRoutePt(){ const F=window.FPLN; if(F&&F.pts&&F.pts.length>2){ const p=F.pts[F.pts.length-2]; F.i=F.pts.length-1; return p; } const s=MI.start?MI.start():{lat:S.lat,lon:S.lon}; return [s.lat,s.lon]; }
function apOn(alt,spd,vs){ AP.on=true; AP.lat='NAV'; AP.alt=alt; AP.vs=vs||0; AP.spd=spd; AP.ath=AL(); AP.appr=false; AP.althold=false; }
/* placement de l'appareil selon l'étape visée */
function place(k){ const st=GD.steps[k]||{}, fly=st.fly||'', idxLand=GD.steps.findIndex(s=>s.fly==='land'||s.fly==='hLand'), cruiseFt=AL()?35000:(ACK==='lj60'?41000:6500);
  AP.appr=false; GD.landed=false; GD.taxiInStarted=false;
  // hélicoptères
  if(A.kind==='rw'){ const D=APTS[MI.dest], s0=MI.start(), dD=gcKm(s0.lat,s0.lon,D.lat,D.lon)*1000, h=brg(s0.lat,s0.lon,D.lat,D.lon);
    if(fly==='hTakeoff'){ ground(s0.lat,s0.lon,s0.hdg!=null?s0.hdg:h,s0.elev); return 'au sol, prêt au décollage'; }   /* altitude de l'hélistation, pas celle du relief */
    if(fly==='hCruise'){ const p=offsetLL(s0.lat,s0.lon,dD*0.4*Math.cos(h*D2R),dD*0.4*Math.sin(h*D2R)); air(p[0],p[1],elevAt(p[0],p[1])+300,A===AC.r44?90:110,h); return 'en transit à 300 m'; }
    if(fly==='hLand'){ const b=before(D.lat,D.lon,1.7,s0.lat,s0.lon); air(b.p[0],b.p[1],elevAt(b.p[0],b.p[1])+200,70,b.hdg); return 'en approche à 1,7 km'; }
    if(idxLand>=0&&k>idxLand){ ground(D.lat,D.lon,h,D.elev); GD.landed=true; return 'posé à destination'; }
    return null; }
  // Cessna 172 : tour de piste de Toussus (main gauche, 1 000 ft)
  if(ACK==='c172'&&MI.dest==='LFPN'){ const r=rwStart('LFPN','25R'), el=APTS.LFPN.elev, T=/traversier/i.test(st.t), Dw=/arrière/i.test(st.t), B=/base/i.test(st.t), Fi=/Finale/i.test(st.t);
    GD.cAir=true; GD.cTi=null; const elFt=el/FT, kap=(h,above,appr)=>{ AP.on=true; AP.lat='HDG'; AP.hdg=wrap360(h); AP.alt=Math.round((elFt+above)/100)*100; AP.vs=500; AP.appr=!!appr; };   /* état du KAP 140 dans un tour de piste normal (c172.js) */
    if(fly==='takeoff'){ lineUp('LFPN','25R'); S.pbrake=true; return 'aligné piste 25R'; }
    if(fly==='pattern'&&T){ const p=ll(r,1700,-200); air(p[0],p[1],el+ft(700),75,wrap360(r.hdg-90),{flap:0,thr:0.85}); kap(r.hdg-90,1000); GD.cLeg='cross'; return 'vent traversier'; }
    if(fly==='pattern'&&Dw){ const p=ll(r,600,-1300); air(p[0],p[1],el+ft(1000),90,wrap360(r.hdg-180),{flap:0,thr:0.6}); kap(r.hdg-180,1000); GD.cLeg='down'; return 'vent arrière, 1 000 ft'; }
    if(fly==='pattern'&&B){ const p=ll(r,-2450,-1100); air(p[0],p[1],el+ft(750),70,wrap360(r.hdg+90),{flap:2,thr:0.45}); kap(r.hdg+90,500); GD.cLeg='base'; return 'étape de base'; }
    if(fly==='pattern'&&Fi){ const p=ll(r,-2000,0); air(p[0],p[1],el+ft(450),65,r.hdg,{flap:3,thr:0.35}); kap(r.hdg,500,true); GD.cLeg='final'; return 'en finale 25R'; }
    if(fly==='land'){ const p=ll(r,-500,0); air(p[0],p[1],el+ft(110),62,r.hdg,{flap:3,thr:0.2,gam:-3}); kap(r.hdg,500,true); GD.cLeg='final'; return 'courte finale 25R'; }
    if(idxLand>=0&&k>idxLand){ const p=ll(r,700,0); ground(p[0],p[1],r.hdg,el); GD.cLanded=true; GD.cLeg='landed'; GD.landed=true; return 'posé, piste à dégager'; }
    return null; }
  // avions de ligne et d'affaires
  if(!MI.dest||!APTS[MI.dest]) return null;
  const dep=MI.dep||ATC.dep, D=APTS[MI.dest], rw=MI.destRw, thr=rw?rwStart(MI.dest,rw):{lat:D.lat,lon:D.lon,hdg:0}, el=D.elev||0;
  if(fly==='taxiOut'){ try{ const R=taxiOutRoute(); if(R&&R.path&&R.path.length>1){ const n=GN[R.code].n, a=n[R.path[R.path.length-2]], z=n[R.path[R.path.length-1]];   // point d'arrêt = fin du trajet de roulage
      ground(z[0],z[1],brg(a[0],a[1],z[0],z[1]),APTS[R.code].elev); GD.taxiDone=true; return 'au point d\'arrêt piste '+DRW(); } }catch(e){ console.warn('saut direct : point d\'arrêt',e); } return null; }
  if(fly==='takeoff'){ try{ if(MI.depRw&&dep) lineUp(dep,MI.depRw); }catch(e){} S.pbrake=true; S.flap=Math.min(1,A.flaps.length-1); try{ pedSync(); }catch(e){} return 'aligné sur la piste'+(MI.depRw?' '+MI.depRw:''); }
  if(fly==='climb'){ const first=GD.steps.findIndex(s=>s.fly==='climb')===k; let r=null; try{ r=rwStart(dep,MI.depRw); }catch(e){} const base=r||{lat:S.lat,lon:S.lon,hdg:S.psi*R2D}, de=(APTS[dep]&&APTS[dep].elev)||0;
    const p=ll(base,first?5000:30000,0), a=first?de+ft(1500):ft(10000); air(p[0],p[1],a,first?180:250,base.hdg,{flap:first?1:0,thr:0.9,gam:4,th:9}); apOn(cruiseFt,250,2500); return first?'après le décollage, 1 500 ft':'en montée, FL100'; }
  if(fly==='cruise'){ const q=routePoint(0.5)||{lat:(S.lat+D.lat)/2,lon:(S.lon+D.lon)/2,hdg:brg(S.lat,S.lon,D.lat,D.lon)}; const a=ft(cruiseFt), V=Math.min(tasFromCas(kt(280),a),(AL()?0.82:0.78)*sos(a)); air(q.lat,q.lon,a,0,q.hdg,{tas:V,thr:0.75}); apOn(cruiseFt,280,0); return 'en croisière, mi-parcours'; }
  if(fly==='descent'&&rw){ const faf=fafOf(MI.dest,rw,22), pr=prevRoutePt(), tod=(cruiseFt-3000)/1000*3*1.852+20, b=before(faf.lat,faf.lon,tod,pr[0],pr[1]), a=ft(cruiseFt); air(b.p[0],b.p[1],a,0,b.hdg,{tas:Math.min(tasFromCas(kt(280),a),0.8*sos(a)),thr:0.5}); apOn(cruiseFt,280,0); return 'au début de la descente'; }
  if(fly==='approach'&&rw){ const faf=fafOf(MI.dest,rw,22), pr=prevRoutePt(), b=before(faf.lat,faf.lon,40,pr[0],pr[1]); air(b.p[0],b.p[1],el+ft(6000),250,b.hdg,{thr:0.45}); apOn(3000,250,1500); AP.lat='HDG'; AP.hdg=b.hdg; return 'en approche, 40 km avant le FAF'; }
  if(fly==='land'&&rw){ const p=ll(thr,-14800,0); air(p[0],p[1],el+14800*Math.tan(3*D2R),0,thr.hdg,{tas:tasFromCas(kt(vlsNow(S.mass)+5),el+700),gear:true,flap:A.flaps.length-1,thr:0.45,gam:-3,th:2}); apOn(3000,vlsNow(S.mass)+5,0); AP.appr=true; AP.lat='HDG'; AP.hdg=thr.hdg; try{ if(AL()){ SYS.spdbrk='ARMED'; SYS.landL='ON'; } pedSync(); }catch(e){} return 'en finale ILS '+rw+', 8 NM'; }
  if(idxLand>=0&&k>idxLand){ let p=[D.lat,D.lon], h=thr.hdg; try{ const a=APTS[MI.dest].rw.find(x=>x[0]===rw||x[1]===rw); if(a){ const e=a[0]===rw?[a[4],a[5]]:[a[2],a[3]]; const b=before(e[0],e[1],0.35,thr.lat,thr.lon); p=b.p; } }catch(e){} ground(p[0],p[1],h,el); S.gear=true; GD.landed=true; return 'posé à destination'; }
  return null; }
function direct(k,then){ if(!GD.on||!GD.steps.length) return; then=then||(AUTO.on?'auto':'guide'); k=Math.max(0,Math.min(GD.steps.length-1,k)); ffOff();
  if(window.EXAM&&EXAM.on){ flash('Examen blanc : pas de saut d\'étape','am'); return; }
  if(k===GD.i) return;
  if(k<GD.i){ const want={k,then}; try{ if(window.BR&&BR.launchMode){ BR.launchMode(then==='auto'?'auto':'guide'); } }catch(e){} setTimeout(()=>{ ffOff(); direct(want.k,want.then); },900); return; }
  runActions(k); if(startedBefore(k)) enginesOn();
  let where=null; try{ where=place(k); }catch(e){ console.warn('saut direct',e); }
  try{ setRate(1); }catch(e){ rate=1; } try{ rateUI(true); }catch(e){}
  try{ if(typeof patchUpdate==='function') patchUpdate(S.lat,S.lon); }catch(e){}
  goStep(k);
  if(then==='auto'){ if(!AUTO.on) autoStart(true); AUTO.stage='read'; AUTO.t0=performance.now(); flash(`Étape ${k}${where?' · '+where:''} : observez (mode automatique)`,'am'); }
  else { if(AUTO.on) autoStart(false); GD.peda=true; try{ renderGuide(); }catch(e){} flash(`Étape ${k}${where?' · '+where:''} : à vous (mode guidé)`,'am'); }
  try{ if(typeof pedSync==='function') pedSync(); if(typeof ovhSync==='function') ovhSync(); }catch(e){} }
window.DIRECT=direct; window.JUMP=direct;
})();
