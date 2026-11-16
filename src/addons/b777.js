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
APTS.FMEE={n:'La Réunion Roland-Garros',lat:-20.8900,lon:55.5164,elev:20,rw:[['12','30',-20.8870,55.5014,-20.8930,55.5314,148]]};
['LFPO','FMEE'].forEach(k=>{ try{ buildAirport(k); }catch(e){} });

/* ---- missions ---- */
// route pédagogique Paris → La Réunion (≈ 9 400 km, 10 h 30 – 11 h) : Alpes, Italie, Libye, Soudan, Éthiopie, Kenya, canal du Mozambique [points pédagogiques]
const RT=[[45.9,6.1,'ALPES'],[41.8,12.25,'ROMA'],[32.1,20.27,'BENGHAZI'],[15.59,32.55,'KHARTOUM'],[8.98,38.8,'ADDIS'],[-1.32,36.93,'NAIROBI'],[-12.8,45.28,'MAYOTTE']];
const RTb=RT.slice().reverse();
const M=(key,o)=>{ MISSIONS[key]=Object.assign({fw:true,ac:'b777'},o); MI_AC[key]='b777'; };
const hist=' Vol historique : Air France a transféré ses vols Réunion d\'Orly vers CDG le 29 mars 2026.';
M('af-cdg-run',{n:'Air France · Paris-CDG → La Réunion',d:'777-300ER Air France. Décollage piste 26R de CDG, croisière ≈ FL350, arrivée piste 12 à Roland-Garros (≈ 9 400 km, ≈ 11 h).',livery:'af',start:()=>rwStart('LFPG','26R'),dest:'FMEE',destRw:'12',route:RT});
M('af-run-cdg',{n:'Air France · La Réunion → Paris-CDG',d:'777-300ER Air France. Décollage piste 12 de Roland-Garros, retour de nuit vers CDG, arrivée piste 26L.',livery:'af',start:()=>rwStart('FMEE','12'),dest:'LFPG',destRw:'26L',route:RTb});
M('uu-cdg-run',{n:'Air Austral · Paris-CDG → La Réunion',d:'777-300ER Air Austral (442 sièges). Décollage piste 26R de CDG, arrivée piste 12 à Roland-Garros.',livery:'uu',start:()=>rwStart('LFPG','26R'),dest:'FMEE',destRw:'12',route:RT});
M('uu-run-cdg',{n:'Air Austral · La Réunion → Paris-CDG',d:'777-300ER Air Austral. Décollage piste 12 de Roland-Garros, arrivée piste 26L à CDG.',livery:'uu',start:()=>rwStart('FMEE','12'),dest:'LFPG',destRw:'26L',route:RTb});
M('af-ory-run',{n:'Air France · Paris-Orly → La Réunion (historique)',d:'777-300ER Air France. Décollage piste 24 d\'Orly, arrivée piste 12 à Roland-Garros.'+hist,livery:'af',start:()=>rwStart('LFPO','24'),dest:'FMEE',destRw:'12',route:RT});
M('af-run-ory',{n:'Air France · La Réunion → Paris-Orly (historique)',d:'777-300ER Air France. Décollage piste 12 de Roland-Garros, arrivée piste 25 à Orly.'+hist,livery:'af',start:()=>rwStart('FMEE','12'),dest:'LFPO',destRw:'25',route:RTb});

// livrée choisie par la mission (couleurs seules, sans logo) puis plan de vol par la route pédagogique
const _sm=startMission; startMission=function(){ flapOpts(selAC); const m=MISSIONS[selMI]; window.LIVERY=(m&&m.livery)||''; const r=_sm.apply(this,arguments); try{ if(ACK==='b777'&&!MI.full) lsInit(); }catch(e){}
  try{ if(MI&&MI.route&&APTS[MI.dest]){ const D=APTS[MI.dest], st=MI.start(); window.FPLN={pts:[[st.lat,st.lon,'']].concat(MI.route.map(p=>p.slice())).concat([[D.lat,D.lon,MI.dest]]),i:1}; } }catch(e){}
  return r; };

/* ---- vitesses de décollage 777 (formule pédagogique [ESTIMÉ], pas les tables Boeing) ---- */
const _lc=lsCalc; lsCalc=function(){ const L=_lc.apply(this,arguments); if(ACK==='b777'&&LS.tow){ const t=LS.tow/1000; LS.vr=Math.round(120+(t-170)*0.32); LS.v1=LS.vr-6; LS.v2=LS.vr+6; LS.vapp=LS.vls+5; LS.trim=(5.0-(LS.cg-25)*0.15).toFixed(1); } return L||LS; };
// débit carburant : GE90 ≈ 2,6 × CFM56
const _ed=engData; engData=function(){ const d=_ed.apply(this,arguments); if(ACK==='b777'&&d) d.ff=Math.round(d.ff*2.6); return d; };
})();
