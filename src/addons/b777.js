/* ===== BOEING 777-300ER · PARIS ↔ LA RÉUNION =====
   Appareil : Boeing 777-300ER (GE90-115B). Valeurs publiques arrondies (FAA TCDS T00001SE, documentation Boeing « 777 Airplane
   Characteristics for Airport Planning ») ; coefficients aérodynamiques [ESTIMÉ] pour un comportement crédible.
   Compagnies : Air France et Air Austral (777-300ER, 442 sièges chez Air Austral : 18 J · 40 W · 384 Y).
   Aéroports : Paris-Charles-de-Gaulle (LFPG), Paris-Orly (LFPO), La Réunion Roland-Garros (FMEE, piste 12/30 de 3 200 m).
   Air France a transféré ses vols Réunion d'Orly vers CDG le 29 mars 2026 : les vols Orly sont proposés comme vols historiques.
   Poste de pilotage : affichages et panneaux de l'A320 réutilisés provisoirement [SIMPLIFICATION], vocabulaire Boeing à venir. */
(function(){
if(typeof AC==='undefined') return;
AC.b777={kind:'fw',name:'Boeing 777-300ER',sub:'Biréacteur long-courrier · Air France / Air Austral · Paris ↔ La Réunion',law:'fbw',cockpit:'a320',
  m:240000,S:436.8,Tmax:2*513000,CD0:0.020,k:0.045,CL0:0.25,CLa:5.6,CLmax:1.5,gearCD:0.016,Vr:165,V2:172,Vmo:330,Mmo:0.89,ceil:43100,range:13650,ffK:2.6,
  flaps:[{n:'0',a:0,b:0,c:0},{n:'1',a:.10,b:.25,c:.004},{n:'5',a:.20,b:.45,c:.008},{n:'15',a:.30,b:.60,c:.013},{n:'20',a:.38,b:.68,c:.020},{n:'25',a:.46,b:.75,c:.030},{n:'30',a:.55,b:.82,c:.042}],
  eye:[-0.55,7.0,-32.3],yOff:5.3,ap:'fcu',ext:{len:73.9,span:64.8}};
WB.b777={unit:'kg',dow:167800,seats:442,pax:380,stdPax:84,child:35,bag:15,cargo:15000,mzfw:237682,mtow:351534,mlw:251290,fuelMax:145500,burn:7500,taxi:800,alt:4000,res30:3600,gs:480,
  lemac:32.5,mac:7.6,dowArm:34.6,zones:[['Cabine avant (J + W, rangs 1-15)',20.0,0.25],['Cabine arrière (Y, rangs 16-58)',42.0,0.75],['Soute avant',24.0,0.55],['Soute arrière',47.0,0.45]],fuelArm:34.0,cgLim:[14,44],crewMass:0};
REFS.b777=[['FAA — Type Certificate Data Sheet T00001SE (Boeing 777) : masses et limites certifiées','https://drs.faa.gov/browse/TCDSModel/doctypeDetails'],
  ['Boeing — 777 Airplane Characteristics for Airport Planning (dimensions, masses)','https://www.boeing.com/commercial/airports/plan_manuals'],
  ['FAA — Airplane Flying Handbook FAA-H-8083-3C (tour avion, check-lists, phases de vol)','https://www.faa.gov/regulations_policies/handbooks_manuals/aviation/airplane_handbook'],
  ['Boeing FCOM / QRH 777 : documents opérateur non publics — séquence reformulée, valeurs [ESTIMÉ]',null]];
// tour avion 777 (repère du modèle : nez vers −z, mètres)
WALKPTS.b777=[[0,-40,'Nez, radôme, sondes','Radôme sans impact ; sondes pitot et d\'incidence libres, caches retirés ; essuie-glaces rangés.'],
  [0,-30.5,'Train avant','Pneus (2) : usure, coupures, gonflage ; amortisseur ; goupille de remorquage retirée après le repoussage.'],
  [-4.2,-30.5,'Porte L1 · prises statiques gauche','Prises statiques propres ; antennes intactes ; porte et toboggan en état.'],
  [-9.75,-15.5,'Moteur gauche (GE90-115B)','Entrée d\'air dégagée ; soufflante de 3,25 m sans dommage (aubes composites) ; capots fermés et verrouillés ; inverseur rangé.'],
  [-34.5,10.5,'Aile gauche, saumon incliné','Bord d\'attaque, becs ; feu de navigation rouge et strobe ; déperditeurs ; volets et ailerons libres de tout dommage.'],
  [-7.6,2.5,'Train principal gauche (bogie 6 roues)','Six pneus, freins carbone (indicateurs d\'usure), fuites hydrauliques, capteur d\'inclinaison du bogie.'],
  [-4.5,31,'Empennage gauche','Plan horizontal réglable, gouverne de profondeur ; feux ; déperditeurs.'],
  [0,40,'Cône de queue · APU','Échappement APU dégagé ; feu de queue ; sabot de queue (tail skid) sans trace de frottement.'],
  [4.5,31,'Empennage droit','Gouverne de profondeur ; feux ; déperditeurs.'],
  [7.6,2.5,'Train principal droit (bogie 6 roues)','Pneus, freins, fuites hydrauliques.'],
  [34.5,10.5,'Aile droite, saumon incliné','Feu de navigation vert et strobe ; ailerons, volets, spoilers ; purge carburant si prévue.'],
  [9.75,-15.5,'Moteur droit (GE90-115B)','Entrée d\'air, soufflante, capots ; pas de fuite d\'huile ; inverseur rangé.'],
  [4.2,-26,'Côté droit avant','Prises statiques droites ; trappes de service fermées ; portes cargo fermées et verrouillées.'],
  [-4.2,-28.5,'Retour porte L1 : monter à bord','Fin du tour avion.']];
// panneaux : disposition A320 réutilisée provisoirement [SIMPLIFICATION]
if(typeof OVH!=='undefined'&&OVH.a320&&!OVH.b777) OVH.b777=Object.assign({},OVH.a320,{t:'777 · PANNEAU PLAFOND (disposition simplifiée, commune A320)'});
if(typeof PED!=='undefined'&&PED.a320&&!PED.b777) PED.b777=PED.a320;
// leviers de volets : crans de l'appareil choisi (A320 : 0-1-2-3-FULL ; 777 : 0-1-5-15-20-25-30)
const FLAPOPT=[]; const grab=(n,d)=>{ if(!n||d>9) return; if(Array.isArray(n)){ if(n[0]==='flapL'&&Array.isArray(n[3])){ FLAPOPT.push(n[3]); return; } n.forEach(x=>grab(x,d+1)); } else if(typeof n==='object') for(const k in n) grab(n[k],d+1); };
try{ grab(PED.a320,0); }catch(e){} try{ grab(P320,0); }catch(e){}
function flapOpts(k){ if(!AC[k]||!(k==='a320'||k==='b777')) return; const names=AC[k].flaps.map(f=>f.n); FLAPOPT.forEach(a=>a.splice(0,a.length,...names)); }

/* ---- aéroports ---- */
APTS.LFPO={n:'Paris-Orly',lat:48.7233,lon:2.3794,elev:89,rw:[
  ['06','24',48.7200,2.3169,48.7355,2.3607,148],['07','25',48.7194,2.3586,48.7274,2.4021,148],['02','20',48.717542,2.376697,48.738022,2.386969,197]]};
// seuils officiels SIA eAIP FMEE AD 2.12 (AIRAC 06/08/2026) ; ILS 14 « SD » 110,3 MHz, axe 136°, pente 3°
APTS.FMEE={n:'La Réunion Roland-Garros',lat:-20.8900,lon:55.5164,elev:20,rw:[['12','30',-20.885992,55.504639,-20.892100,55.534700,148],['14','32',-20.884217,55.504158,-20.894967,55.527147,148]]};
['LFPO','FMEE'].forEach(k=>{ try{ buildAirport(k); }catch(e){} });

/* ---- missions ---- */
// route pédagogique Paris → La Réunion (≈ 9 400 km, 10 h 30 – 11 h) : Alpes, Italie, Libye, Soudan, Éthiopie, Kenya, canal du Mozambique [points pédagogiques]
const RT=[[45.9,6.1,'ALPES'],[41.8,12.25,'ROMA'],[32.1,20.27,'BENGHAZI'],[15.59,32.55,'KHARTOUM'],[8.98,38.8,'ADDIS'],[-1.32,36.93,'NAIROBI'],[-12.8,45.28,'MAYOTTE']];
const RTb=RT.slice().reverse();
const M=(key,o)=>{ MISSIONS[key]=Object.assign({fw:true,ac:'b777'},o); MI_AC[key]='b777'; };
const hist=' Vol historique : Air France a transféré ses vols Réunion d\'Orly vers CDG le 29 mars 2026.';
M('af-cdg-run',{n:'Air France · Paris-CDG → La Réunion',d:'777-300ER Air France. Décollage piste 26R de CDG, croisière ≈ FL350, arrivée ILS piste 14 à Roland-Garros (≈ 9 400 km, ≈ 11 h).',livery:'af',start:()=>rwStart('LFPG','26R'),dest:'FMEE',destRw:'14',route:RT});
M('af-run-cdg',{n:'Air France · La Réunion → Paris-CDG',d:'777-300ER Air France. Décollage piste 12 de Roland-Garros, retour de nuit vers CDG, arrivée piste 26L.',livery:'af',start:()=>rwStart('FMEE','12'),dest:'LFPG',destRw:'26L',route:RTb});
M('uu-cdg-run',{n:'Air Austral · Paris-CDG → La Réunion',d:'777-300ER Air Austral (442 sièges). Décollage piste 26R de CDG, arrivée ILS piste 14 à Roland-Garros.',livery:'uu',start:()=>rwStart('LFPG','26R'),dest:'FMEE',destRw:'14',route:RT});
M('uu-run-cdg',{n:'Air Austral · La Réunion → Paris-CDG',d:'777-300ER Air Austral. Décollage piste 12 de Roland-Garros, arrivée piste 26L à CDG.',livery:'uu',start:()=>rwStart('FMEE','12'),dest:'LFPG',destRw:'26L',route:RTb});
M('af-ory-run',{n:'Air France · Paris-Orly → La Réunion (historique)',d:'777-300ER Air France. Décollage piste 24 d\'Orly, arrivée ILS piste 14 à Roland-Garros.'+hist,livery:'af',start:()=>rwStart('LFPO','24'),dest:'FMEE',destRw:'14',route:RT});
M('af-run-ory',{n:'Air France · La Réunion → Paris-Orly (historique)',d:'777-300ER Air France. Décollage piste 12 de Roland-Garros, arrivée piste 25 à Orly.'+hist,livery:'af',start:()=>rwStart('FMEE','12'),dest:'LFPO',destRw:'25',route:RTb});

// livrée choisie par la mission (couleurs seules, sans logo) puis plan de vol par la route pédagogique
const _sm=startMission; startMission=function(){ flapOpts(selAC); const m=MISSIONS[selMI]; window.LIVERY=(m&&m.livery)||''; const r=_sm.apply(this,arguments); try{ if(ACK==='b777'&&!MI.full) lsInit(); }catch(e){}
  try{ if(MI&&MI.route&&APTS[MI.dest]){ const D=APTS[MI.dest], st=MI.start(); window.FPLN={pts:[[st.lat,st.lon,'']].concat(MI.route.map(p=>p.slice())).concat([[D.lat,D.lon,MI.dest]]),i:1}; } }catch(e){}
  return r; };


/* ---- météo de référence (exemples réalistes, remplacés par la météo en direct si disponible) ---- */
try{ METAR_SAMPLES.FMEE=METAR_SAMPLES.FMEE||'METAR FMEE 160600Z 12015KT 9999 FEW025 SCT040 26/19 Q1016 NOSIG'; METAR_SAMPLES.LFPO=METAR_SAMPLES.LFPO||'METAR LFPO 160600Z 24008KT 9999 FEW030 09/05 Q1019 NOSIG';
  ['FMEE','LFPO'].forEach(k=>{ if(!WXS.met[k]) wxSet(METAR_SAMPLES[k]); }); }catch(e){}

/* ---- parcours complet 777 : Paris-CDG → La Réunion ---- */
const FULL='Arrivée au parking à pied, tour avion, cockpit, dossier de vol Paris–Réunion, devis de masse et carburant (≈ 93 t), mise en route, roulage réel à CDG, décollage 26R, croisière ≈ 11 h au-dessus de l\'Europe et de l\'Afrique, approche ILS piste 14 à Roland-Garros, roulage simplifié, parking.';
M('full-777-af',{n:'Parcours pilote complet Paris-CDG → La Réunion · Air France 777',d:FULL,livery:'af',full:true,dep:'LFPG',depRw:'26R',start:()=>standOf('LFPG'),dest:'FMEE',destRw:'14',route:RT});
M('full-777-uu',{n:'Parcours pilote complet Paris-CDG → La Réunion · Air Austral 777',d:FULL,livery:'uu',full:true,dep:'LFPG',depRw:'26R',start:()=>standOf('LFPG'),dest:'FMEE',destRw:'14',route:RT});
const FULLR='Départ de l\'aire de trafic de Roland-Garros (roulage simplifié), décollage piste 12 (3 200 m), croisière de nuit ≈ 11 h au-dessus de l\'Afrique et de l\'Europe, arrivée piste 26L à CDG, roulage réel vers le poste, parking.';
const APRON_RUN=()=>({lat:-20.8917,lon:55.5195,hdg:282,elev:20});
M('full-777-af-ret',{n:'Parcours pilote complet La Réunion → Paris-CDG · Air France 777',d:FULLR,livery:'af',full:true,dep:'FMEE',depRw:'12',start:APRON_RUN,dest:'LFPG',destRw:'26L',route:RTb});
M('full-777-uu-ret',{n:'Parcours pilote complet La Réunion → Paris-CDG · Air Austral 777',d:FULLR,livery:'uu',full:true,dep:'FMEE',depRw:'12',start:APRON_RUN,dest:'LFPG',destRw:'26L',route:RTb});
window.FULLOF=k=>k==='b777'?'full-777-af':((AC[k]||A).kind==='fw'?'full-fw':'full-rw');

/* ---- étapes : vocabulaire Boeing en regard des commandes (le poste reprend la disposition A320 [SIMPLIFICATION]) ---- */
const BOE=[[/\bECAM\b/,'ECAM (EICAS sur 777)'],[/\bFCU\b/,'FCU (MCP sur 777)'],[/\bMCDU\b/,'MCDU (CDU sur 777)'],[/mini-manche/,'mini-manche (manche classique sur 777)']];
function boe(t){ if(typeof t!=='string') return t; t=t.replace(/Airbus A320-200|Airbus A320|A320-200|A320/g,'Boeing 777-300ER').replace(/Volets 1 puis 2, 3, FULL/g,'Volets 1, 5, 15, 20, 25 puis 30').replace(/Mach 0,78/g,'Mach 0,84');
  if(MI&&MI.dest==='FMEE') t=t.replace(/ILS 12/g,'RNP 12 (guidage simulé comme un ILS [SIMPLIFICATION] ; l\'ILS de Roland-Garros dessert la piste 14)');
  BOE.forEach(([re,r])=>{ t=t.replace(re,r); }); return t; }
const APRON={FMEE:[-20.8925,55.5195,282],LFPO:[48.7290,2.3640,240]};
const _sf=stepsFor; stepsFor=function(){ const st=_sf.apply(this,arguments); if(ACK!=='b777') return st;
  st.forEach(s=>{ s.t=boe(s.t).replace(/RNP 12 \(.*\)/,'RNP 12'); s.txt=boe(s.txt); (s.items||[]).forEach(it=>{
    if(it[0]==='Volets 1'){ it[0]='Volets 15 (décollage 777)'; it[1]=()=>S.flap===3; it[2]=()=>pedSet('flapL','15'); }
    else if(it[0]==='Volets FULL'){ it[0]='Volets 30 (atterrissage 777)'; it[1]=()=>S.flap===A.flaps.length-1; it[2]=()=>pedSet('flapL','30'); }
    else it[0]=boe(it[0]); });
    // départ sans plan de roulage détaillé (La Réunion) : roulage simplifié jusqu'au point d'arrêt
    if(s.fly==='taxiOut'&&MI&&MI.dep&&!GN[MI.dep]){ const r=rwStart(MI.dep,MI.depRw), h=r.hdg*D2R, hp=offsetLL(r.lat,r.lon,-80*Math.cos(h)+170*Math.cos(h+Math.PI/2),-80*Math.sin(h)+170*Math.sin(h+Math.PI/2));
      s.txt='Repoussage terminé, roulage vers le point d\'arrêt de la piste '+MI.depRw+' (plan de roulage détaillé de cet aéroport non modélisé : roulage simplifié [SIMPLIFICATION]). Volets de décollage, auto-frein RTO, puis alignement après l\'autorisation.';
      const al=s.items.find(it=>/^Alignement/.test(it[0])); s.items=[s.items[0],s.items[1],['Roulage jusqu\'au point d\'arrêt '+MI.depRw,()=>S.onGround&&S.V<1&&gcKm(S.lat,S.lon,hp[0],hp[1])<0.2,()=>{ S.lat=hp[0]; S.lon=hp[1]; S.psi=h; S.V=0; flash('Au point d\'arrêt '+MI.depRw,'am'); }]].concat(al?[al]:[]); }
    // arrivée sans plan de roulage détaillé (La Réunion, Orly) : roulage simplifié vers l'aire de trafic
    if(s.fly==='taxiIn'&&MI&&!GN[MI.dest]&&APRON[MI.dest]){ const ap=APRON[MI.dest];
      s.txt='Dégagez la piste, spoilers rentrés, volets 0, STROBE AUTO, LAND OFF, APU START. Roulez vers l\'aire de trafic indiquée par le contrôle (plan de roulage détaillé de cet aéroport non modélisé : roulage simplifié [SIMPLIFICATION]).';
      s.items=[s.items[0],['Roulage jusqu\'à l\'aire de trafic',()=>S.onGround&&S.V<1&&gcKm(S.lat,S.lon,ap[0],ap[1])<0.25,()=>{ S.lat=ap[0]; S.lon=ap[1]; S.psi=ap[2]*D2R; S.V=0; flash('Arrivé sur l\'aire de trafic','am'); }]]; } });
  return st; };


/* ---- EICAS du 777 (écran moteurs et alertes de type Boeing) à la place de l'E/WD Airbus ----
   Disposition Boeing : N1 et EGT en cadrans avec valeur numérique encadrée, TAT, carburant total, position des volets et du
   train, messages d'alerte CAS (WARNING rouge, CAUTION ambre, ADVISORY ambre en retrait, MEMO blanc). [SIMPLIFIÉ] */
const _ewd=drawEWD; drawEWD=function(g,x,y,w,h){ if(ACK!=='b777') return _ewd.apply(this,arguments);
  screen(g,x,y,w,h); let pw=true; try{ pw=(typeof dispPower==='function'&&MI&&MI.full)?dispPower('EWD'):hasPower(); }catch(e){} if(!pw) return;
  const e=engData(), Y=k=>y+h*k, X=k=>x+w*k, C='#f2f4f6', CY='#3fd0ff', MG='#e04ad8', AM='#ffa21a', RD='#ff3b30', GR='#3ddc84';
  const dial=(cx,cy,r,v,max,red,lab,val)=>{ const a0=Math.PI*0.95, a1=Math.PI*2.15, mp=t=>a0+Math.max(0,Math.min(1,t/max))*(a1-a0);
    g.strokeStyle=C; g.lineWidth=2; g.beginPath(); g.arc(cx,cy,r,a0,mp(red)); g.stroke(); g.strokeStyle=RD; g.lineWidth=3; g.beginPath(); g.arc(cx,cy,r,mp(red),a1); g.stroke();
    g.fillStyle='rgba(242,244,246,0.12)'; g.beginPath(); g.moveTo(cx,cy); g.arc(cx,cy,r,a0,mp(v)); g.closePath(); g.fill();
    g.strokeStyle=C; g.lineWidth=2.5; g.beginPath(); g.moveTo(cx,cy); g.lineTo(cx+Math.cos(mp(v))*r,cy+Math.sin(mp(v))*r); g.stroke();
    g.strokeStyle=C; g.lineWidth=1.2; g.strokeRect(cx+r*0.05,cy-r*0.62,r*1.0,r*0.42); txt(g,val,cx+r*0.98,cy-r*0.41,C,r*0.32,'right'); txt(g,lab,cx-r*0.1,cy+r*0.62,CY,r*0.26,'center'); };
  txt(g,'TAT '+Math.round(15-2*(S.alt/0.3048)/1000+((S.V||0)*1.944)/100*1.5)+'c',X(0.05),Y(0.05),CY,h*0.04);
  [0,1].forEach(i=>{ const on=S.eng[i]||(S.n2&&S.n2[i]>0.05), sp=S.eng[i]?1:(S.n2?S.n2[i]:0), n1=S.eng[i]?20+S.thr*80:sp*19, egt=S.eng[i]?420+S.thr*520:sp*640, cx=X(0.26+i*0.36);
    dial(cx,Y(0.24),h*0.11,on?n1:0,117.5,110,'N1',on?n1.toFixed(1):'--'); dial(cx,Y(0.5),h*0.085,on?egt:0,1150,1090,'EGT',on?String(Math.round(egt)):'--'); });
  txt(g,'N1',X(0.44),Y(0.14),C,h*0.035,'center'); txt(g,'EGT',X(0.44),Y(0.44),C,h*0.035,'center');
  const fuel=(S.fuel!=null?S.fuel:(LS&&LS.block)||0)/1000; txt(g,'TOTAL FUEL',X(0.78),Y(0.66),CY,h*0.033,'center'); txt(g,(fuel).toFixed(1),X(0.78),Y(0.71),C,h*0.05,'center'); txt(g,'KG X 1000',X(0.78),Y(0.755),CY,h*0.028,'center');
  txt(g,'FLAPS',X(0.12),Y(0.66),CY,h*0.033); txt(g,A.flaps[S.flap].n,X(0.12),Y(0.71),S.flap?MG:C,h*0.05); txt(g,'GEAR',X(0.42),Y(0.66),CY,h*0.033,'center');
  txt(g,S.gear?'DOWN':'UP',X(0.42),Y(0.71),S.gear?GR:C,h*0.045,'center');
  g.strokeStyle='#555'; g.beginPath(); g.moveTo(x+4,Y(0.79)); g.lineTo(x+w-4,Y(0.79)); g.stroke();
  const msg=[]; if(S.stall) msg.push(['STALL',RD]); if(typeof overspeed==='function'&&overspeed()) msg.push(['OVERSPEED',RD]);
  try{ (S320.warns||[]).forEach(wn=>{ if(msg.length<6) msg.push([String(wn.t||wn.n||'').toUpperCase().replace(/^ENG ?1/,'ENG L').replace(/^ENG ?2/,'ENG R'),wn.l>=3?RD:AM]); }); }catch(e){}
  if(SYS.belts==='ON') msg.push(['SEATBELTS ON',C]); if(SYS.apuAvail) msg.push(['APU RUNNING',C]); if(S.pbrake) msg.push(['PARKING BRAKE SET',C]);
  msg.slice(0,5).forEach((m,i)=>txt(g,m[0],X(0.06),Y(0.83+i*0.035),m[1],h*0.033)); txt(g,'EICAS',X(0.95),Y(0.05),'#8899aa',h*0.03,'right'); };

/* ---- vitesses de décollage 777 (formule pédagogique [ESTIMÉ], pas les tables Boeing) ---- */
const _lc=lsCalc; lsCalc=function(){ const L=_lc.apply(this,arguments); if(ACK==='b777'&&LS.tow){ const t=LS.tow/1000; LS.vr=Math.round(120+(t-170)*0.32); LS.v1=LS.vr-6; LS.v2=LS.vr+6; LS.vapp=LS.vls+5; LS.trim=(5.0-(LS.cg-25)*0.15).toFixed(1); } return L||LS; };
// débit carburant : GE90 ≈ 2,6 × CFM56
const _ed=engData; engData=function(){ const d=_ed.apply(this,arguments); if(ACK==='b777'&&d) d.ff=Math.round(d.ff*2.6); return d; };
})();
