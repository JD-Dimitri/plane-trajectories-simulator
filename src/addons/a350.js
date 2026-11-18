/* ===== V10.39 : AIRBUS A350-900 · ROLLS-ROYCE TRENT XWB-84 · PARIS ↔ LA RÉUNION =====
   Données reprises (lecture seule) du projet COCKPIT PLANE SIMULATION, qui les a sourcées :
   [RÉFÉRENCÉ] Airbus « A350 Family Facts & Figures » (sept. 2022) : masse maximale au décollage 283 t, envergure 64,75 m, longueur 66,8 m,
               carburant 141 000 L, moteur Trent XWB-84 ;
   [RÉFÉRENCÉ] EASA TCDS E.111 (Trent XWB), issue 12 : poussée de décollage 374,5 kN par moteur (5 min), maximale continue 317,6 kN,
               température TGT 900 °C au décollage ;
   [ESTIMÉ]    masse maximale à l'atterrissage 207 t, masse maximale sans carburant 195,7 t, surface alaire 443 m², VMO 340 kt, MMO 0,89,
               masse à vide en opération 142,4 t, aménagement de cabine, coefficients aérodynamiques, consommation, vitesses de décollage.
   Poste de pilotage : disposition commune Airbus du simulateur (FCU, ECAM, MCDU) [SIMPLIFICATION] ; l'A350 réel a 6 grands écrans,
   un clavier et une boule de commande (KCCU) et des écrans OIS. Compagnie et livrée fictives. */
(function(){
if(typeof AC==='undefined'||!AC.a320) return;
AC.a350={kind:'fw',name:'Airbus A350-900',sub:'Biréacteur long-courrier · Rolls-Royce Trent XWB-84 · Paris ↔ La Réunion',law:'fbw',cockpit:'a320',
  m:230000,S:443,Tmax:2*374500,CD0:0.0185,k:0.043,CL0:0.25,CLa:5.7,CLmax:1.55,gearCD:0.015,Vr:150,V2:158,Vmo:340,Mmo:0.89,ceil:43100,range:15000,ffK:2.2,
  flaps:AC.a320.flaps.map(f=>Object.assign({},f)),
  eye:[-0.55,6.45,-30.1],yOff:4.9,ap:'fcu',ext:{len:66.8,span:64.75}};
WB.a350={unit:'kg',dow:142400,seats:326,pax:290,stdPax:84,child:35,bag:15,cargo:12000,mzfw:195700,mtow:283000,mlw:207000,fuelMax:110700,burn:5800,taxi:600,alt:3800,res30:3000,gs:485,
  lemac:29.0,mac:6.9,dowArm:31.0,zones:[['Cabine avant (J + W, rangs 1-12)',17.0,0.25],['Cabine arrière (Y, rangs 20-49)',37.0,0.75],['Soute avant',21.0,0.55],['Soute arrière',42.0,0.45]],fuelArm:30.5,cgLim:[14,40],crewMass:0};
REFS.a350=[['Airbus — A350 Family Facts & Figures (sept. 2022) : masses, dimensions, carburant, motorisation','https://www.airbus.com/sites/g/files/jlcbta136/files/2022-09/airbus-a350-family-facts-and-figures_sept-2022.pdf'],
  ['EASA — TCDS E.111 Rolls-Royce Trent XWB, issue 12 : poussées, régimes, températures limites','https://www.easa.europa.eu/sites/default/files/dfu/EASA%20E111%20TCDS%20issue%2012_Trent%20XWB.pdf'],
  ['FAA — Airplane Flying Handbook FAA-H-8083-3C (tour avion, check-lists, phases de vol)','https://www.faa.gov/regulations_policies/handbooks_manuals/aviation/airplane_handbook'],
  ['Airbus FCOM / QRH A350 : documents opérateur non publics — séquence reformulée, valeurs [ESTIMÉ]',null]];
// tour avion A350 (repère du modèle : nez vers −z, mètres) — mêmes points que les autres avions de ligne
WALKPTS.a350=[[0,-36,'Nez, radôme, sondes','Radôme sans impact ; sondes pitot et d\'incidence libres, caches retirés ; essuie-glaces rangés ; cadre noir des vitres du poste sans fissure.'],
  [0,-26.9,'Train avant','Pneus (2) : usure, coupures, gonflage ; amortisseur ; goupille de remorquage retirée après le repoussage.'],
  [-3.9,-27.4,'Porte L1 · prises statiques gauche','Prises statiques propres ; antennes intactes ; porte et toboggan en état.'],
  [-9.4,-15,'Moteur gauche (Trent XWB-84)','Entrée d\'air dégagée ; soufflante de 22 aubes sans dommage ; capots fermés et verrouillés ; inverseur rangé ; pas de fuite d\'huile.'],
  [-31,10,'Aile gauche, saumon courbé','Bord d\'attaque, becs ; saumon courbé (aile en composite) sans impact ; feu de navigation rouge et strobe ; déperditeurs ; volets et ailerons libres.'],
  [-7.2,1.8,'Train principal gauche (bogie 4 roues)','Quatre pneus, freins carbone (indicateurs d\'usure), fuites hydrauliques.'],
  [-4,28,'Empennage gauche','Plan horizontal réglable, gouverne de profondeur ; feux ; déperditeurs.'],
  [0,36,'Cône de queue · APU','Échappement APU dégagé ; feu de queue ; trappes fermées.'],
  [4,28,'Empennage droit','Gouverne de profondeur ; feux ; déperditeurs.'],
  [7.2,1.8,'Train principal droit (bogie 4 roues)','Pneus, freins, fuites hydrauliques.'],
  [31,10,'Aile droite, saumon courbé','Feu de navigation vert et strobe ; ailerons, volets, spoilers ; saumon courbé sans dommage.'],
  [9.4,-15,'Moteur droit (Trent XWB-84)','Entrée d\'air, soufflante, capots ; pas de fuite d\'huile ; inverseur rangé.'],
  [3.9,-23,'Côté droit avant','Prises statiques droites ; trappes de service fermées ; portes cargo fermées et verrouillées.'],
  [-3.9,-25.4,'Retour porte L1 : monter à bord','Fin du tour avion.']];
// panneaux : disposition commune Airbus du simulateur [SIMPLIFICATION]
if(typeof OVH!=='undefined'&&OVH.a320&&!OVH.a350) OVH.a350=Object.assign({},OVH.a320,{t:'A350 · PANNEAU PLAFOND (disposition simplifiée, commune Airbus)'});
if(typeof PED!=='undefined'&&PED.a320&&!PED.a350) PED.a350=PED.a320;

/* ---- missions : la route naturelle de l'A350 du projet COCKPIT PLANE SIMULATION (La Réunion ⇄ Paris) ---- */
const RT=[[45.9,6.1,'ALPES'],[41.8,12.25,'ROMA'],[32.1,20.27,'BENGHAZI'],[15.59,32.55,'KHARTOUM'],[8.98,38.8,'ADDIS'],[-1.32,36.93,'NAIROBI'],[-12.8,45.28,'MAYOTTE']];   // points pédagogiques
const RTb=RT.slice().reverse(), APRON_RUN=()=>({lat:-20.8917,lon:55.5195,hdg:282,elev:20});
const M=(key,o)=>{ MISSIONS[key]=Object.assign({fw:true,ac:'a350',livery:'pt'},o); MI_AC[key]='a350'; };
M('a350-cdg-run',{n:'A350-900 · Paris-CDG → La Réunion',d:'Airbus A350-900 (Trent XWB-84), compagnie fictive. Décollage piste 26R de CDG, croisière ≈ FL350 à Mach 0,85, arrivée ILS piste 14 à Roland-Garros (≈ 9 400 km, ≈ 11 h).',start:()=>rwStart('LFPG','26R'),dest:'FMEE',destRw:'14',route:RT});
M('a350-run-cdg',{n:'A350-900 · La Réunion → Paris-CDG',d:'Airbus A350-900. Décollage piste 12 de Roland-Garros, retour de nuit vers CDG, arrivée piste 26L.',start:()=>rwStart('FMEE','12'),dest:'LFPG',destRw:'26L',route:RTb});
M('a350-ory-run',{n:'A350-900 · Paris-Orly → La Réunion',d:'Airbus A350-900. Décollage piste 24 d\'Orly, arrivée ILS piste 14 à Roland-Garros.',start:()=>rwStart('LFPO','24'),dest:'FMEE',destRw:'14',route:RT});
M('a350-run-ory',{n:'A350-900 · La Réunion → Paris-Orly',d:'Airbus A350-900. Décollage piste 12 de Roland-Garros, arrivée piste 25 à Orly.',start:()=>rwStart('FMEE','12'),dest:'LFPO',destRw:'25',route:RTb});
const FULL='Arrivée au parking à pied, tour avion, cockpit, dossier de vol Paris–Réunion, devis de masse et carburant, mise en route des Trent XWB, roulage réel à CDG, décollage 26R, croisière ≈ 11 h au-dessus de l\'Europe et de l\'Afrique, approche ILS piste 14 à Roland-Garros, roulage simplifié, parking.';
M('full-350',{n:'Parcours pilote complet Paris-CDG → La Réunion · A350-900',d:FULL,full:true,dep:'LFPG',depRw:'26R',start:()=>standOf('LFPG'),dest:'FMEE',destRw:'14',route:RT});
M('full-350-ret',{n:'Parcours pilote complet La Réunion → Paris-CDG · A350-900',d:'Départ de l\'aire de trafic de Roland-Garros (roulage simplifié), décollage piste 12 (3 200 m), croisière de nuit ≈ 11 h, arrivée piste 26L à CDG, roulage réel vers le poste, parking.',full:true,dep:'FMEE',depRw:'12',start:APRON_RUN,dest:'LFPG',destRw:'26L',route:RTb});
const _fo=window.FULLOF; window.FULLOF=k=>k==='a350'?'full-350':(_fo?_fo(k):((AC[k]||A).kind==='fw'?'full-fw':'full-rw'));

// plan de vol par la route pédagogique (comme pour le 777)
const _sm=startMission; startMission=function(){ const m=MISSIONS[selMI]; if(selAC==='a350') window.LIVERY=(m&&m.livery)||'pt'; const r=_sm.apply(this,arguments);
  try{ if(ACK==='a350'&&!MI.full) lsInit(); }catch(e){}
  try{ if(ACK==='a350'&&MI&&MI.route&&APTS[MI.dest]){ const D=APTS[MI.dest], st=MI.start(); window.FPLN={pts:[[st.lat,st.lon,'']].concat(MI.route.map(p=>p.slice())).concat([[D.lat,D.lon,MI.dest]]),i:1}; } }catch(e){}
  return r; };

/* ---- étapes : nom de l'appareil, motorisation et Mach de croisière de l'A350 ; roulage simplifié là où le plan de roulage n'est pas modélisé ---- */
function a35(t){ if(typeof t!=='string') return t; return t.replace(/Airbus A320-200|Airbus A320|A320-200|A320/g,'Airbus A350-900').replace(/Mach 0,78/g,'Mach 0,85').replace(/CFM56(-5B)?/g,'Trent XWB-84')
  .replace(/ILS 12/g,MI&&MI.dest==='FMEE'?'RNP 12':'ILS 12'); }
const APRON={FMEE:[-20.8925,55.5195,282],LFPO:[48.7290,2.3640,240]};
const _sf=stepsFor; stepsFor=function(){ const st=_sf.apply(this,arguments); if(ACK!=='a350') return st;
  st.forEach(s=>{ s.t=a35(s.t); s.txt=a35(s.txt); (s.items||[]).forEach(it=>{ it[0]=a35(it[0]); });
    if(s.fly==='taxiOut'&&MI&&MI.dep&&!GN[MI.dep]){ const r=rwStart(MI.dep,MI.depRw), h=r.hdg*D2R, hp=offsetLL(r.lat,r.lon,-80*Math.cos(h)+170*Math.cos(h+Math.PI/2),-80*Math.sin(h)+170*Math.sin(h+Math.PI/2));
      s.txt='Repoussage terminé, roulage vers le point d\'arrêt de la piste '+MI.depRw+' (plan de roulage détaillé de cet aéroport non modélisé : roulage simplifié [SIMPLIFICATION]). Volets de décollage, auto-frein RTO, puis alignement après l\'autorisation.';
      const al=s.items.find(it=>/^Alignement/.test(it[0])); s.items=[s.items[0],s.items[1],['Roulage jusqu\'au point d\'arrêt '+MI.depRw,()=>S.onGround&&S.V<1&&gcKm(S.lat,S.lon,hp[0],hp[1])<0.2,()=>{ S.lat=hp[0]; S.lon=hp[1]; S.psi=h; S.V=0; flash('Au point d\'arrêt '+MI.depRw,'am'); }]].concat(al?[al]:[]); }
    if(s.fly==='taxiIn'&&MI&&!GN[MI.dest]&&APRON[MI.dest]){ const ap=APRON[MI.dest];
      s.txt='Dégagez la piste, spoilers rentrés, volets 0, STROBE AUTO, LAND OFF, APU START. Roulez vers l\'aire de trafic indiquée par le contrôle (plan de roulage détaillé de cet aéroport non modélisé : roulage simplifié [SIMPLIFICATION]).';
      s.items=[s.items[0],['Roulage jusqu\'à l\'aire de trafic',()=>S.onGround&&S.V<1&&gcKm(S.lat,S.lon,ap[0],ap[1])<0.25,()=>{ S.lat=ap[0]; S.lon=ap[1]; S.psi=ap[2]*D2R; S.V=0; flash('Arrivé sur l\'aire de trafic','am'); }]]; } });
  return st; };

/* ---- vitesses de décollage (formule pédagogique [ESTIMÉ], pas les tables Airbus) et consommation ---- */
const _lc=lsCalc; lsCalc=function(){ const L=_lc.apply(this,arguments); if(ACK==='a350'&&LS.tow){ const t=LS.tow/1000; LS.vr=Math.round(118+(t-140)*0.27); LS.v1=LS.vr-5; LS.v2=LS.vr+7; LS.vapp=LS.vls+5; LS.trim=(4.5-(LS.cg-25)*0.15).toFixed(1); } return L||LS; };
const _ed=engData; engData=function(){ const d=_ed.apply(this,arguments); if(ACK==='a350'&&d) d.ff=Math.round(d.ff*2.2); return d; };   // Trent XWB-84 ≈ 2,2 × CFM56 [ESTIMÉ]

/* ---- titre du poste complet ---- */
if(typeof buildA320==='function'){ const _b=buildA320; buildA320=function(){ const r=_b.apply(this,arguments);
  try{ if(ACK==='a350'){ document.getElementById('ovh-t').textContent='A350-900 · POSTE COMPLET'; const s=document.getElementById('ovh-s'); if(s&&!s.querySelector('.a35n')) s.insertAdjacentHTML('afterbegin','<b class="a35n">[SIMULÉ] Disposition commune Airbus du simulateur : l\'A350 réel a six grands écrans, un clavier et une boule de commande (KCCU) et des écrans d\'information (OIS). </b>'); } }catch(e){}
  return r; }; }
})();
