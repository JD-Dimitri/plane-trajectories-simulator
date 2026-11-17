/* ===== AVION ÉCOLE · CESSNA 172P SKYHAWK · TOUSSUS-LE-NOBLE (LFPN) · PARCOURS PPL =====
   Appareil : Cessna 172P (Lycoming O-320-D2J, 160 ch, carburateur, hélice bipale à pas fixe), train tricycle fixe, aile haute.
   Valeurs arrondies, ordres de grandeur publics (FAA TCDS 3A12, manuel de vol 172P) : chaque avion a SON manuel de vol, qui fait foi.
   Aérodrome : Toussus-le-Noble (Paris-Saclay-Versailles), pistes 07L/25R (1 100 m) et 07R/25L (1 050 m), altitude 538 ft.
   Parcours PPL : préparation, visite prévol, mise en route (primer, magnétos), roulage, essais moteur au point d'arrêt (magnétos,
   réchauffage carburateur), décollage, tour de piste main gauche, atterrissage, arrêt. Radio VFR en phraséologie française. */
(function(){
if(typeof AC==='undefined') return;
const K='c172';
AC.c172={kind:'fw',name:'Cessna 172P Skyhawk',sub:'Avion école monomoteur à pistons · instruments classiques · formation PPL à Toussus',law:'conv',cockpit:'c172',
  single:true,prop:95,fixedGear:true,sep:true,
  m:1000,S:16.2,Tmax:3000,CD0:0.031,k:0.054,CL0:0.30,CLa:5.0,CLmax:1.6,gearCD:0,Vr:55,V2:62,Vmo:158,Mmo:0.5,ceil:13000,range:1100,
  flaps:[{n:'0',a:0,b:0,c:0},{n:'10',a:.10,b:.20,c:.006},{n:'20',a:.20,b:.36,c:.016},{n:'30',a:.28,b:.50,c:.028}],
  eye:[-0.3,1.75,-0.6],yOff:1.2,ap:'kap140',ext:{len:8.2,span:11.0}};
// devis de masse : bras de levier en mètres depuis la cloison pare-feu (manuel de vol 172P, arrondis)
WB.c172={unit:'kg',dow:680,seats:3,pax:1,stdPax:80,child:35,bag:10,cargo:0,mzfw:1089,mtow:1089,mlw:1089,fuelMax:109,burn:22,taxi:3,alt:0,res30:11,gs:100,
  zones:[['Sièges avant (pilote 80 kg + passager / instructeur)',0.94],['Compartiment bagages 1',2.41]],dowArm:1.00,fuelArm:1.22,armLim:[0.89,1.20],crewMass:80};
REFS.c172=[['FAA — Type Certificate Data Sheet 3A12 (Cessna 172) : masses et limites certifiées','https://drs.faa.gov/browse/TCDSModel/doctypeDetails'],
  ['FAA — Airplane Flying Handbook FAA-H-8083-3C (visite prévol, essais moteur, tour de piste)','https://www.faa.gov/regulations_policies/handbooks_manuals/aviation/airplane_handbook'],
  ['FAA — Pilot\'s Handbook of Aeronautical Knowledge FAA-H-8083-25C (moteur à pistons, givrage carburateur, instruments)','https://www.faa.gov/regulations_policies/handbooks_manuals/aviation/phak'],
  ['SIA — eAIP France, AD 2 LFPN (Toussus-le-Noble) et carte VAC','https://www.sia.aviation-civile.gouv.fr/'],
  ['Manuel de vol Cessna 172P (POH/AFM) : document de l\'avion, non public — valeurs arrondies [ESTIMÉ]',null]];
// visite prévol (ordre du manuel : cabine, empennage, aile droite, nez, aile gauche) — repère modèle : nez vers −z
WALKPTS.c172=[[-1.0,-1.0,'Cabine','Documents de bord ; magnétos OFF, clé retirée ; MASTER ON : jauges carburant, volets sortis pour la visite ; MASTER OFF ; robinet carburant BOTH.'],
  [-0.9,1.6,'Fuselage gauche','Revêtement, antennes, prise statique gauche propre et non obstruée.'],
  [-1.2,4.0,'Empennage','Retirer les attaches ; gouvernes libres, charnières, compensateur, feu de queue, balise.'],
  [1.2,4.0,'Empennage droit','Gouverne de profondeur droite, charnières, déperditeur.'],
  [5.0,-0.6,'Aile droite','Saumon et feu vert ; aileron libre ; volet ; réservoir droit : niveau visuel, bouchon fermé ; purge (eau, impuretés) ; hauban.'],
  [1.4,0.2,'Train principal droit','Pneu (usure, gonflage), frein, lame de train ; carénage.'],
  [0.6,-3.2,'Nez, moteur, hélice','Huile 6 à 8 qts ; purge du filtre carburant (gascolator) ; hélice et cône sans entaille ; prise d\'air propre ; train avant et amortisseur.'],
  [-1.4,0.2,'Train principal gauche','Pneu, frein, lame de train.'],
  [-3.4,-1.0,'Aile gauche, pitot','Cache pitot retiré, tube libre ; avertisseur de décrochage (aspirer) ; prise d\'air carburant ; purge réservoir gauche.'],
  [-5.0,-0.6,'Saumon gauche','Feu rouge, aileron, volet ; hauban.'],
  [-1.0,-0.8,'Porte gauche : monter à bord','Fin de la visite prévol : avion apte au vol.']];

/* ---- aérodrome de Toussus-le-Noble (seuils : SIA / données publiques arrondies) ---- */
APTS.LFPN={n:'Toussus-le-Noble',lat:48.7519,lon:2.1062,elev:164,rw:[['07L','25R',48.7512,2.0987,48.7544,2.1129,30],['07R','25L',48.7495,2.0997,48.7525,2.1133,30]]};
try{ buildAirport('LFPN'); }catch(e){}
const STAND={lat:48.7542,lon:2.1058,hdg:160,elev:164};
const HOLD=()=>{ const r=rwStart('LFPN','25R'); const p=offsetLL(r.lat,r.lon,70,25); return {lat:p[0],lon:p[1],hdg:r.hdg}; };
if(typeof STN!=='undefined'){ Object.assign(STN,{TNF_ATIS:{n:'Toussus ATIS',f:127.475,ref:'SIA'},TNF_GND:{n:'Toussus Sol',f:121.850,ref:'SIA'},TNF_TWR:{n:'Toussus Tour',f:119.300,ref:'SIA'}}); }
try{ METAR_SAMPLES.LFPN=METAR_SAMPLES.LFPN||'METAR LFPN 160800Z 24008KT 9999 FEW030 10/05 Q1019 NOSIG'; if(!WXS.met.LFPN) wxSet(METAR_SAMPLES.LFPN); }catch(e){}
if(typeof DCX!=='undefined') DCX.c172={bats:['bat1'],gens:[['alt1',0]],ah:24,load:22,txt:'1 alternateur entraîné par le moteur, batterie 24 V'};

/* ---- missions ---- */
MISSIONS['full-c172']={n:'Parcours PPL · Toussus : visite, mise en route, essais moteur, tour de piste',d:'Cessna 172P de l\'aéroclub. Préparation, visite prévol, mise en route au primer, roulage vers le point d\'arrêt 25R, essais moteur (magnétos, réchauffage carburateur), décollage, tour de piste main gauche à 1 500 ft QNH, atterrissage complet, arrêt.',
  fw:true,full:true,ac:K,dep:'LFPN',depRw:'25R',dest:'LFPN',destRw:'25R',start:()=>Object.assign({},STAND)};
MISSIONS['c172-local']={n:'Toussus · tours de piste (en vol)',d:'Cessna 172P aligné piste 25R, moteur tournant : décollage et tour de piste main gauche.',fw:true,ac:K,start:()=>rwStart('LFPN','25R'),dest:'LFPN',destRw:'25R'};
MI_AC['full-c172']=K; MI_AC['c172-local']=K;
const _fo=window.FULLOF; window.FULLOF=k=>k===K?'full-c172':_fo?_fo(k):((AC[k]||A).kind==='fw'?'full-fw':'full-rw');

/* ---- commandes (pas de panneau plafond : interrupteurs sous la planche, à gauche) ---- */
OVH.c172={t:'CESSNA 172P · INTERRUPTEURS (bas de planche, à gauche)',cols:2,src:'Le C172 n\'a pas de panneau plafond : MASTER (BAT et ALT jumelés), feux et réchauffage pitot sont des interrupteurs à bascule sous la planche ; avionique à droite du MASTER.',
  secs:[[['ÉLECTRICITÉ',[['bat1','MASTER BAT','tog',1],['alt1','MASTER ALT','tog',1],['avion','AVIONICS','tog']]],['DIVERS',[['probe','PITOT HEAT','tog'],['dome','ÉCLAIRAGE','knob',['OFF','DIM','BRT']]]]],
    [['FEUX',[['beacon','BEACON','tog'],['landL','LAND','knob',['OFF','ON']],['taxiL','TAXI','tog'],['navLt','NAV','tog'],['strobe','STROBE','knob',['OFF','ON']]]]]]};
PED.c172=[['MOTEUR',[['gaz','MANETTE DES GAZ','knob',['RALENTI','1000 tr/min','1700 tr/min','2100 tr/min','PLEIN GAZ']],['mix','MÉLANGE','knob',['RICH','IDLE CUT-OFF']],['carbH','RÉCHAUFFAGE CARBU','knob',['FROID','CHAUD']],['primer','PRIMER (injections)','knob',['0','1','2','3']],['mags','MAGNÉTOS (clé)','knob',['OFF','R','L','BOTH','START']]]],
  ['CARBURANT',[['fuelSel','ROBINET CARBURANT','knob',['BOTH','LEFT','RIGHT','OFF']]]],
  ['VOLETS · COMPENSATEUR · FREINS',[['flapL','VOLETS','knob',['0','10','20','30']],['trim','COMPENSATEUR','knob',['NEUTRE','DÉCOLLAGE']],['pbrake','FREIN DE PARC','tog']]],
  ['TRANSPONDEUR',[['xpdr','XPDR','knob',['OFF','STBY','ON','ALT']]]]];
const GAZ={'RALENTI':0,'1000 tr/min':0.23,'1700 tr/min':0.63,'2100 tr/min':0.86,'PLEIN GAZ':1};
const C=()=>ACK===K;

const _ps=pedSet; pedSet=function(id,v){ if(!C()) return _ps.apply(this,arguments);
  if(id==='gearL'){ flash('Train fixe sur le C172','am'); return; }
  if(id==='gaz'){ SYS.gaz=v; S.thr=GAZ[v]??S.thr; pedSync(); return; }
  return _ps.apply(this,arguments); };
const _cd=coldDark; coldDark=function(){ if(!C()) return _cd.apply(this,arguments);
  S.eng=[false,false]; S.n2=[0,0]; S.nr=0; S.thr=0; S.coll=0; S.pbrake=true; S.flap=0; S.gear=true; AP.on=AP.ath=false; AP.appr=false; S.rpm=0;
  Object.assign(SYS,{bat1:false,alt1:false,avion:false,probe:false,beacon:false,landL:'OFF',taxiL:false,navLt:false,strobe:'OFF',gaz:'RALENTI',mix:'IDLE CUT-OFF',carbH:'FROID',primer:'0',mags:'OFF',fuelSel:'BOTH',trim:'NEUTRE',xpdr:'OFF',irAl:0,ir1:'ON'});
  GD.magL=GD.magR=GD.carbT=0; GD.cTi=null; AP.alt=1500; AP.vs=500; AP.hdg=250; GD.idleOK=false; GD.cLeg=null; GD.cAir=false; GD.cLanded=false; GD.primed=false; buildOVH(); };
const _sd=sysDefaults; sysDefaults=function(){ _sd.apply(this,arguments); if(C()){ if(!(S.fuel>0)) S.fuel=Math.round(WB.c172.fuelMax*0.8); AP.alt=1500; AP.vs=500; AP.hdg=250; GD.cLeg=null; GD.cAir=false; GD.cLanded=false; GD.cTi=null; } if(C()) Object.assign(SYS,{bat1:true,alt1:true,avion:true,mix:'RICH',mags:'BOTH',fuelSel:'BOTH',carbH:'FROID',primer:'0',gaz:'RALENTI',xpdr:'ALT',navLt:true,beacon:true,strobe:'ON',irAl:1}); };

/* ---- moteur à pistons : démarrage, régime, magnétos, réchauffage carburateur, dépression (gyroscopes) ---- */
let crankT=0;
const _es=engStep; engStep=function(dt){ if(!C()) return _es.apply(this,arguments);
  if(!S.n2) S.n2=[0,0]; S.eng[1]=false;
  if(GD.cMI!==MI){ GD.cMI=MI; if(!MI.full){ Object.assign(SYS,{bat1:true,alt1:true,avion:true,mix:'RICH',mags:'BOTH',fuelSel:'BOTH',carbH:'FROID',navLt:true,beacon:true,strobe:'ON',xpdr:'ALT',irAl:1}); S.eng[0]=true; S.n2[0]=1; if(!(S.fuel>0)) S.fuel=Math.round(WB.c172.fuelMax*0.8); try{ pedSync(); ovhSync(); }catch(e){} } }
  if(MI.full){ const pw=!!SYS.bat1, fuel=SYS.fuelSel!=='OFF'&&(S.fuel??1)>0, rich=SYS.mix==='RICH';
    if(SYS.primer!=='0') GD.primed=true;
    const dead=!!(FAIL.engC||FAIL.dead1||(GD.ice||0)>0.95);
    if(!S.eng[0]){ if(SYS.mags==='START'&&pw){ crankT+=dt; S.n2[0]=Math.min(0.12,S.n2[0]+dt/10);
        if(crankT>2){ if(rich&&fuel&&GD.primed&&!dead){ S.eng[0]=true; S.n2[0]=1; SYS.mags='BOTH'; flash('MOTEUR TOURNANT · clé relâchée sur BOTH · pression d\'huile dans les 30 s','am'); if(S.thr>0.4) flash('Gaz trop ouverts au démarrage : risque d\'emballement','am'); pedSync(); }
          else if(crankT>6){ crankT=0; SYS.mags='OFF'; flash(!rich?'Mélange sur IDLE CUT-OFF : pas de carburant au moteur':!fuel?'Robinet carburant fermé':'Moteur froid non amorcé : 2 à 3 injections de primer','am'); pedSync(); } } }
      else { crankT=0; S.n2[0]=Math.max(0,S.n2[0]-dt/5); } }
    else if(dead){ S.eng[0]=false; S.n2[0]=0; flash(FAIL.engC||FAIL.dead1?'PANNE MOTEUR : hélice en moulinet. Vitesse de plané ≈ 65 KIAS, choisir un champ':'Givrage carburateur : le moteur s\'arrête','red'); }
    else if(SYS.mags==='OFF'||!rich||!fuel){ S.eng[0]=false; S.n2[0]=0; flash(SYS.mags==='OFF'?'Magnétos OFF : moteur arrêté':!rich?'Mélange IDLE CUT-OFF : moteur arrêté':'Panne d\'alimentation carburant : moteur arrêté','am'); }
    // horizon et conservateur de cap entraînés par la pompe à dépression (moteur)
    SYS.irAl=S.eng[0]?Math.min(1,(SYS.irAl||0)+dt/30):Math.max(0,(SYS.irAl||0)-dt/120);
    if(FAIL.carbIce&&S.eng[0]) GD.ice=SYS.carbH==='CHAUD'?Math.max(0,(GD.ice||0)-dt/25):Math.min(1,(GD.ice||0)+dt/100); else if(!FAIL.carbIce) GD.ice=0;
    let ff=S.eng[0]?6+S.thr*24:0; if(FAIL.fuelLeak) S.fuel=Math.max(0,(S.fuel??0)-25*dt/3600); S.ff=ff; S.fuel=Math.max(0,(S.fuel??WB[K].fuelMax*0.8)-ff*dt/3600); S.mass=(LS.zfw||WB[K].dow+80)+S.fuel; }
  else { if(S.eng[0]) S.n2[0]=1; SYS.irAl=1; }
  // régime (tr/min) : point fixe ≈ 2 300 plein gaz ; l'hélice à pas fixe « s'allège » avec la vitesse
  const run=!!S.eng[0], single=SYS.mags==='L'||SYS.mags==='R', hot=SYS.carbH==='CHAUD';
  let rpm=run?600+S.thr*1750+(S.V||0)*6*(S.thr>0.3?1:0.5):(S.onGround?(SYS.mags==='START'&&SYS.bat1?240:0):Math.min(1200,(S.V||0)*18));
  if(run&&single) rpm-=SYS.mags==='L'?95:85; if(run&&hot) rpm-=80; if(run&&GD.ice) rpm-=600*GD.ice*(0.9+0.1*Math.sin(simMs/90)); S.rpm=Math.max(0,Math.min(2800,rpm));
  S.pk=run?(single?0.95:1)*(hot?0.9:1)*(1-0.7*(GD.ice||0)):0; S.nr=run?1:0;
  // essais moteur au point d'arrêt
  if(run&&S.onGround&&S.rpm>1550){ if(SYS.mags==='L') GD.magL=(GD.magL||0)+dt; if(SYS.mags==='R') GD.magR=(GD.magR||0)+dt; if(hot) GD.carbT=(GD.carbT||0)+dt; }
  if(run&&S.onGround&&S.thr<0.05&&(GD.magL||0)>1&&(GD.magR||0)>1) GD.idleOK=true;
  S.gear=true; };

/* ---- tour de piste : branche courante calculée par la géométrie (main gauche, 1 000 ft au-dessus du terrain) ---- */
function rwFrame(){ const r=rwStart('LFPN','25R'); const d=gcKm(r.lat,r.lon,S.lat,S.lon)*1000, b=brg(r.lat,r.lon,S.lat,S.lon), a=(b-r.hdg)*D2R; return {x:d*Math.cos(a),y:d*Math.sin(a),h:r.hdg,r}; }
const aglC=()=>(S.alt-elevAt(S.lat,S.lon))/FT;
function legStep(){ if(!C()) return; const f=rwFrame(), agl=aglC();
  if(!S.onGround) GD.cAir=true;
  if(S.onGround){ if(GD.cAir&&!GD.cLanded&&GD.cLeg==='final'){ GD.cLanded=true; GD.cLeg='landed'; } return; }
  const L=GD.cLeg;
  if(!L) GD.cLeg='up';
  else if(L==='up'&&agl>500&&f.x>1400) GD.cLeg='cross';
  else if(L==='cross'&&f.y<-1250) GD.cLeg='down';
  else if(L==='down'&&f.x<-2300) GD.cLeg='base';
  else if(L==='base'&&f.y>-380) GD.cLeg='final';
  GD.cAbeam=GD.cLeg==='down'&&f.x<0; }
const LEGN={up:'montée dans l\'axe',cross:'vent traversier',down:'vent arrière',base:'étape de base',final:'finale',landed:'posé'};

/* ---- pilotage automatique (mode AUTO) : le « pilote » tient les vitesses du tour de piste à la manette ---- */
const _ff=flyFW; flyFW=function(dt){ if(!C()) return _ff.apply(this,arguments); legStep();
  const st=GD.steps[GD.i]||{}, cas=casFromTas(S.V,S.alt)/KT, f=rwFrame(), el=APTS.LFPN.elev/FT, agl=aglC();
  DIR.pitch=null; DIR.roll=null; DIR.yaw=null;
  if(S.onGround){ if(TX.auto) return;
    if(st.fly==='takeoff'&&nearRunway(S.lat,S.lon)&&!GD.cLanded){ S.pbrake=false; S.thr=1; SYS.gaz='PLEIN GAZ'; if(cas>A.Vr) DIR.rot=true; DIR.pitch=DIR.rot&&S.th<10*D2R?1:0; }
    else if(GD.cLanded||st.fly==='land'){ S.thr=0; SYS.gaz='RALENTI'; S.brake=S.V>2; }
    return; }
  DIR.rot=false; if(!st.fly) return;
  let vt=75, legH=f.h;
  if(agl>200&&!AP.on){ AP.on=true; AP.lat='HDG'; AP.hdg=f.h; AP.alt=Math.round((el+1000)/100)*100; AP.vs=650; flash('Montée Vy · pilote automatique KAP 140 (mode auto)','am'); }
  if(GD.cLeg==='up'){ legH=f.h; vt=74; if(agl>300&&S.flap>0){ S.flap=0; pedSync(); } }
  else if(GD.cLeg==='cross'){ legH=f.h-90; vt=80; }
  else if(GD.cLeg==='down'){ legH=f.h-180; vt=GD.cAbeam?75:90; if(GD.cAbeam){ if(SYS.carbH!=='CHAUD'){ SYS.carbH='CHAUD'; flash('Travers seuil : réchauffage carburateur CHAUD, réduction, volets 10','am'); } if(S.flap<1&&cas<105) S.flap=1; } }
  else if(GD.cLeg==='base'){ legH=f.h+90; vt=70; AP.alt=Math.round((el+500)/100)*100; AP.vs=500; if(S.flap<2&&cas<84) S.flap=2; }
  else if(GD.cLeg==='final'){ vt=agl>200?65:60; AP.appr=true; if(S.flap<3&&cas<84) S.flap=3; }
  if(GD.cLeg!=='final'){ AP.appr=false; AP.lat='HDG'; AP.hdg=wrap360(legH); }
  if(AP.appr&&agl<15){ S.thr=0; SYS.gaz='RALENTI'; }
  else { const v=tasFromCas(vt*KT,S.alt), e=v-S.V; GD.cTi=clamp((GD.cTi??S.thr)+e*0.02*dt,0,1); S.thr=clamp(GD.cTi+e*0.08,0,1); }   // régulation PI de la vitesse à la manette
  pedSync(); const mx=window.C172RATE||4; if(rate>mx){ rate=mx; rateUI(); } };   // tour de piste : temps réel, ×4 au plus
// mode guidé (pilotage manuel) : la branche est quand même suivie pour les items
const _fs=fwStep; fwStep=function(dt){ const r=_fs.apply(this,arguments); if(C()){ S.gear=true; if(!(AUTO&&AUTO.on)) legStep(); } return r; };

/* ---- vitesses du devis (formules simplifiées [ESTIMÉ]) ---- */
const _lc=lsCalc; lsCalc=function(){ const L=_lc.apply(this,arguments); if(C()){ L.vr=55; L.v1=null; L.v2=62; L.vx=60; L.vy=74; L.vls=Math.round(vlsNow(L.lw)); L.vapp=65; L.trim='DÉCOLLAGE'; } return L; };

/* ---- étapes du parcours PPL ---- */
const at=(p,m)=>()=>S.onGround&&gcKm(S.lat,S.lon,p.lat,p.lon)*1000<m;
const put=p=>()=>{ S.lat=p.lat; S.lon=p.lon; S.psi=p.hdg*D2R; S.V=0; S.alt=elevAt(p.lat,p.lon); try{ PATCH.lat=999; }catch(e){} };
const leg=n=>()=>GD.cLeg===n||(['up','cross','down','base','final','landed'].indexOf(GD.cLeg)>['up','cross','down','base','final','landed'].indexOf(n));
function stepsC172(){ const L=LS, Cf=commonFirst(), R=rwStart('LFPN','25R'), H=HOLD();
  const P=[
  {ph:'Cockpit',t:'Avant la mise en route',txt:'Ceintures et harnais attachés, portes fermées ; frein de parc serré ; disjoncteurs enfoncés ; AVIONICS OFF (protège la radio des pics de tension au démarrage) ; robinet carburant sur BOTH ; réchauffage carburateur FROID.',items:[['Frein de parc serré',()=>S.pbrake,()=>{S.pbrake=true; pedSync();},'[data-pd="pbrake"]'],['AVIONICS OFF',notS('avion'),setS('avion',false),'[data-sw="avion"]'],['Robinet carburant BOTH',is('fuelSel','BOTH'),()=>pedSet('fuelSel','BOTH'),'[data-pd="fuelSel"]'],['Réchauffage carburateur FROID',is('carbH','FROID'),()=>pedSet('carbH','FROID'),'[data-pd="carbH"]']]},
  {ph:'Mise en route',t:'Mise en route du moteur',txt:'Mélange plein RICHE ; primer : 2 à 3 injections moteur froid (aucune moteur chaud) ; gaz ouverts d\'environ 1 cm ; MASTER ON ; BEACON ON ; regarder dehors et annoncer « Dégagé hélice ! » ; clé sur START puis relâchée (retour sur BOTH) dès que le moteur tourne. Pression d\'huile dans le vert en 30 s, sinon arrêt. Régime 1 000 tr/min.',items:[['Mélange RICH',is('mix','RICH'),()=>pedSet('mix','RICH'),'[data-pd="mix"]'],['Primer : 2 à 3 injections',()=>SYS.primer>='2'||S.eng[0],()=>pedSet('primer','3'),'[data-pd="primer"]'],['MASTER BAT et ALT ON',()=>SYS.bat1&&SYS.alt1,()=>{SYS.bat1=SYS.alt1=true; sysEffect('bat1'); ovhSync();},'[data-sw="bat1"]'],['BEACON ON',on('beacon'),setS('beacon',true),'[data-sw="beacon"]'],['Clé sur START',()=>S.eng[0]||SYS.mags==='START',()=>pedSet('mags','START'),'[data-pd="mags"]'],['Moteur tournant, clé sur BOTH',()=>S.eng[0]&&SYS.mags==='BOTH',null],['Régime 1 000 tr/min',()=>S.eng[0]&&S.rpm>900&&S.rpm<1300,()=>pedSet('gaz','1000 tr/min'),'[data-pd="gaz"]']]},
  {ph:'Mise en route',t:'Après la mise en route',txt:'AVIONICS ON ; NAV ON ; transpondeur STBY ; fréquences : ATIS 127,475 puis Toussus Sol 121,85 ; calage altimétrique au QNH (l\'altimètre doit indiquer ≈ 540 ft, altitude du terrain). Horizon artificiel et conservateur de cap sont entraînés par la pompe à dépression : attendre qu\'ils se stabilisent, puis caler le conservateur sur le compas.',items:[['AVIONICS ON',on('avion'),setS('avion',true),'[data-sw="avion"]'],['NAV ON',on('navLt'),setS('navLt',true),'[data-sw="navLt"]'],['Transpondeur STBY',is('xpdr','STBY'),()=>pedSet('xpdr','STBY'),'[data-pd="xpdr"]'],['Gyroscopes stabilisés (dépression)',()=>(SYS.irAl||0)>=1,()=>{SYS.irAl=1;}]]},
  {ph:'Roulage',t:'Roulage vers le point d\'arrêt 25R',txt:'Après l\'autorisation de Toussus Sol : frein de parc desserré, puissance juste nécessaire, essai des freins dès les premiers mètres ; en virage, contrôle des instruments (bille à l\'extérieur du virage, aiguille de virage du bon côté, cap qui défile). Vitesse d\'un homme au pas rapide. Plan de roulage détaillé de Toussus : non modélisé [SIMPLIFICATION], ligne directe vers le point d\'arrêt.',items:[['Frein de parc desserré',()=>!S.pbrake||at(H,60)(),()=>{S.pbrake=false; pedSync();},'[data-pd="pbrake"]'],['Au point d\'arrêt 25R',at(H,60),put(H)],['Arrêté, frein de parc serré',()=>S.V<0.5&&S.pbrake,()=>{S.V=0; S.pbrake=true; pedSync();},'[data-pd="pbrake"]']]},
  {ph:'Point d\'arrêt',t:'Essais moteur (« point fixe »)',txt:'Face au vent si possible, frein de parc serré, manche tenu. Gaz 1 700 tr/min. Magnétos : sur L puis sur R, chute de régime ≤ 125 tr/min sur chacune, écart ≤ 50 tr/min entre les deux ; une chute nulle signale une magnéto mal coupée (danger au sol). Retour sur BOTH. Réchauffage carburateur CHAUD : légère chute de régime (l\'air chaud est moins dense), puis FROID. Dépression 4,5 à 5,4 inHg ; huile dans le vert ; ampèremètre. Gaz réduits : ralenti stable, puis 1 000 tr/min.',items:[['Régime 1 700 tr/min',()=>S.rpm>1600&&S.rpm<1850||GD.idleOK,()=>pedSet('gaz','1700 tr/min'),'[data-pd="gaz"]'],['Magnéto L testée',()=>(GD.magL||0)>1.5,()=>{ pedSet('mags','L'); GD.magL=Math.max(GD.magL||0,1.6); },'[data-pd="mags"]'],['Magnéto R testée',()=>(GD.magR||0)>1.5,()=>{ pedSet('mags','R'); GD.magR=Math.max(GD.magR||0,1.6); },'[data-pd="mags"]'],['Retour sur BOTH',is('mags','BOTH'),()=>pedSet('mags','BOTH'),'[data-pd="mags"]'],['Réchauffage carburateur testé',()=>(GD.carbT||0)>1.5,()=>{ pedSet('carbH','CHAUD'); GD.carbT=Math.max(GD.carbT||0,1.6); },'[data-pd="carbH"]'],['Réchauffage FROID',is('carbH','FROID'),()=>pedSet('carbH','FROID'),'[data-pd="carbH"]'],['Ralenti vérifié',()=>GD.idleOK||S.thr<0.05,()=>{ pedSet('gaz','RALENTI'); GD.idleOK=true; },'[data-pd="gaz"]']]},
  {ph:'Point d\'arrêt',t:'Check-list avant décollage',txt:'Commandes libres et dans le bon sens ; compensateur sur DÉCOLLAGE ; volets 0 à 10° ; mélange RICH ; robinet BOTH ; instruments : altimètre au QNH, conservateur calé ; portes et fenêtres fermées ; transpondeur ALT ; phare et strobes ON. Briefing : « en cas de panne moteur avant la rotation, réduire et freiner ; après la rotation, se poser droit devant ».',items:[['Compensateur DÉCOLLAGE',is('trim','DÉCOLLAGE'),()=>pedSet('trim','DÉCOLLAGE'),'[data-pd="trim"]'],['Volets 10',()=>S.flap===1,()=>pedSet('flapL','10'),'[data-pd="flapL"]'],['Transpondeur ALT',is('xpdr','ALT'),()=>pedSet('xpdr','ALT'),'[data-pd="xpdr"]'],['Phare ON',is('landL','ON'),setS('landL','ON'),'[data-sw="landL"]'],['STROBE ON',is('strobe','ON'),setS('strobe','ON'),'[data-sw="strobe"]'],['Frein de parc desserré',()=>!S.pbrake,()=>{S.pbrake=false; pedSync();},'[data-pd="pbrake"]'],['Aligné piste 25R',()=>S.onGround&&gcKm(S.lat,S.lon,R.lat,R.lon)*1000<120&&Math.abs(wrapPi(S.psi-R.hdg*D2R))<0.3,put(R)]]},
  {ph:'Décollage',t:'Décollage',fly:'takeoff',txt:`Plein gaz progressivement (PgUp) ; vérifier ≈ 2 300 tr/min et les paramètres moteur ; tenir l'axe aux palonniers. Rotation à ${L.vr||55} KIAS (flèche ↓), puis palier d'accélération et montée à Vy ≈ 74 KIAS (meilleur taux) [arrondi : voir le manuel de VOTRE avion].`,items:[['En vol',()=>!S.onGround,null],['Au-dessus de 300 ft sol',()=>aglC()>300,null],['Volets rentrés',()=>S.flap===0,()=>pedSet('flapL','0'),'[data-pd="flapL"]']]},
  {ph:'Tour de piste',t:'Montée, vent traversier',fly:'pattern',txt:'Dans l\'axe jusqu\'à 500 ft sol au minimum et au-delà de l\'extrémité de piste, puis virage à gauche de 90° : vent traversier. Contrôle visuel du trafic avant chaque virage.',items:[['Vent traversier',leg('cross'),null]]},
  {ph:'Tour de piste',t:'Vent arrière (1 500 ft QNH)',fly:'pattern',txt:'Virage à gauche : parallèle à la piste, à environ 1,3 km, à 1 000 ft au-dessus du terrain (≈ 1 500 ft QNH ; sens et hauteur réels : carte VAC LFPN). Puissance ≈ 2 200 tr/min, 90 KIAS. Message radio « vent arrière 25 droite ». Check-list vent arrière : carburant BOTH, mélange RICH, réchauffage carburateur CHAUD avant de réduire (le givrage du carburateur est le plus probable à faible puissance, même par temps doux et humide), phare ON.',items:[['En vent arrière',leg('down'),null],['Travers du seuil : réchauffage CHAUD',()=>SYS.carbH==='CHAUD'||leg('base')(),()=>pedSet('carbH','CHAUD'),'[data-pd="carbH"]']]},
  {ph:'Tour de piste',t:'Étape de base',fly:'pattern',txt:'Quand le seuil est à 45° derrière : virage à gauche, réduction (≈ 1 500 tr/min), volets 20 sous 85 KIAS, descente vers 500 ft sol, 70 KIAS.',items:[['En étape de base',leg('base'),null],['Volets 20',()=>S.flap>=2,()=>pedSet('flapL','20'),'[data-pd="flapL"]']]},
  {ph:'Approche',t:'Finale 25R',fly:'pattern',txt:'Virage en finale, aligné sur l\'axe ; volets 30 ; 65 KIAS puis 60 en courte finale ; plan ≈ 3° à 5° (point d\'aboutissement fixe dans le pare-brise). Message « finale 25 droite » ; attendre « autorisé atterrissage ». Remise de gaz si l\'approche n\'est pas stabilisée à 300 ft : plein gaz, réchauffage FROID, volets 20 puis rentrés par étapes.',items:[['En finale',leg('final'),null],['Volets 30',()=>S.flap===3,()=>pedSet('flapL','30'),'[data-pd="flapL"]']]},
  {ph:'Atterrissage',t:'Arrondi et atterrissage',fly:'land',txt:'Vers 15 ft : réduction totale, arrondi progressif (tirer pour garder l\'avion en l\'air le plus longtemps possible) ; toucher sur le train principal, roulette avant posée ensuite ; freinage ; dégager la piste.',items:[['Posé',()=>S.onGround&&GD.cAir,null],['Vitesse de roulage',()=>S.onGround&&S.V<8,null]]},
  {ph:'Après l\'atterrissage',t:'Piste dégagée, retour au parking',txt:'Piste dégagée : volets rentrés, réchauffage FROID, phare et strobes OFF, transpondeur STBY. Roulage vers le parking de l\'aéroclub [SIMPLIFICATION : ligne directe].',items:[['Volets 0',()=>S.flap===0,()=>pedSet('flapL','0'),'[data-pd="flapL"]'],['Réchauffage FROID',is('carbH','FROID'),()=>pedSet('carbH','FROID'),'[data-pd="carbH"]'],['Strobes OFF',is('strobe','OFF'),setS('strobe','OFF'),'[data-sw="strobe"]'],['Au parking',at(STAND,40),put(STAND)]]},
  {ph:'Arrêt',t:'Arrêt du moteur et sécurisation',txt:'Frein de parc serré ; AVIONICS OFF ; ralenti 1 000 tr/min quelques instants ; test de coupure des magnétos (rapide, au ralenti) ; mélange IDLE CUT-OFF : le moteur s\'arrête par manque de carburant (aucun mélange ne reste dans les cylindres) ; magnétos OFF, clé retirée ; MASTER OFF ; robinet carburant (selon l\'aéroclub) ; cales et attaches.',items:[['Frein de parc serré',()=>S.pbrake,()=>{S.pbrake=true; pedSync();},'[data-pd="pbrake"]'],['AVIONICS OFF',notS('avion'),setS('avion',false),'[data-sw="avion"]'],['Mélange IDLE CUT-OFF',is('mix','IDLE CUT-OFF'),()=>pedSet('mix','IDLE CUT-OFF'),'[data-pd="mix"]'],['Moteur arrêté',()=>!S.eng[0],null],['Magnétos OFF',is('mags','OFF'),()=>pedSet('mags','OFF'),'[data-pd="mags"]'],['MASTER OFF',()=>!SYS.bat1&&!SYS.alt1,()=>{SYS.bat1=SYS.alt1=false; sysEffect('bat1'); ovhSync();},'[data-sw="bat1"]']]}];
  return [...Cf,...P,{ph:'Fin',t:'Vol terminé',txt:'Bravo : un tour de piste complet, de la visite prévol à la mise en sécurité de l\'avion. Remplir le carnet de route (heures bloc et vol, carburant). Le programme PPL comprend aussi la navigation VFR, les pannes et les atterrissages de précaution : ils sont en cours d\'intégration.',calc:'end',items:[]}]; }
const _sf=stepsFor; stepsFor=function(){ return C()?stepsC172():_sf.apply(this,arguments); };

/* ---- radio VFR (phraséologie française, Toussus) ---- */
const _as=atcSeqFW; atcSeqFW=function(dep,dest){ if(!C()) return _as.apply(this,arguments);
  const cs=()=>'F-HTCA', ab=()=>'F-CA', s=[], q=()=>Math.round(qnhOf('LFPN')), W_=()=>{ const m=WXS.met.LFPN; return m?`${String(m.dir).padStart(3,'0')} degrés ${m.spd} nœuds`:'calme'; };
  s.push(X({k:'atis',st:'TNF_ATIS',type:'atis',trig:()=>S.onGround&&radioPowered(),skip:()=>!S.onGround,lab:'écoute de l\'ATIS',a:()=>{ ATC.info='A'; const t=`Toussus, information Alpha. Piste en service 25 droite. Vent ${W_()}. Visibilité supérieure à 10 km. QNH ${q()}. Tours de piste au sud [voir carte VAC]. Accusez réception de l'information Alpha au premier contact.`; return [t,t]; }}));
  s.push(X({k:'taxi',st:'TNF_GND',gate:1,trig:()=>S.onGround,skip:()=>!S.onGround,p:()=>`Toussus Sol, ${cs()}, Cessna 172 au parking aéroclub, information Alpha, pour tours de piste, demande roulage.`,pf:()=>'Premier contact : indicatif complet, type, position, information ATIS reçue, intention.',
    a:()=>[`${ab()}, roulez point d'arrêt piste 25 droite, QNH ${q()}.`,`Roulez jusqu'au point d'arrêt de la piste 25 droite ; QNH ${q()}.`],rb:()=>`Point d'arrêt 25 droite, QNH ${q()}, ${ab()}.`}));
  s.push(X({k:'twrH',st:'TNF_GND',type:'ini',trig:()=>S.onGround&&gcKm(S.lat,S.lon,HOLD().lat,HOLD().lon)<0.15,next:'TNF_TWR',a:()=>[`${ab()}, contactez Toussus Tour 119,3.`,`Contactez la Tour sur 119,3.`],rb:()=>`119,3, ${ab()}.`}));
  s.push(X({k:'ready',st:'TNF_TWR',trig:()=>S.onGround&&(GD.idleOK||gcKm(S.lat,S.lon,HOLD().lat,HOLD().lon)<0.15),p:()=>`Toussus Tour, ${ab()}, point d'arrêt 25 droite, prêt au départ, pour un tour de piste.`,pf:()=>'Prêt au départ (après les essais moteur et la check-list avant décollage).',
    a:()=>[`${ab()}, alignez-vous piste 25 droite, vent ${W_()}, autorisé décollage, rappelez vent arrière.`,`Alignez-vous, autorisé au décollage, rappelez en vent arrière.`],rb:()=>`Alignons et décollons 25 droite, rappellerons vent arrière, ${ab()}.`}));
  s.push(X({k:'down',st:'TNF_TWR',trig:()=>!S.onGround&&GD.cLeg==='down',p:()=>`${ab()}, vent arrière 25 droite, pour un complet.`,pf:()=>'Report de position en vent arrière ; « complet » = atterrissage avec arrêt.',a:()=>[`${ab()}, numéro 1, rappelez finale.`,`Numéro 1, rappelez en finale.`],rb:()=>`Numéro 1, ${ab()}.`}));
  s.push(X({k:'fin',st:'TNF_TWR',trig:()=>!S.onGround&&GD.cLeg==='final',p:()=>`${ab()}, finale 25 droite.`,pf:()=>'Report en finale.',a:()=>[`${ab()}, piste 25 droite, autorisé atterrissage, vent ${W_()}.`,`Autorisé à l'atterrissage.`],rb:()=>`Autorisé atterrissage 25 droite, ${ab()}.`}));
  s.push(X({k:'vac',st:'TNF_TWR',trig:()=>S.onGround&&GD.cLanded&&S.V<8,p:()=>`${ab()}, piste dégagée.`,pf:()=>'Piste dégagée.',a:()=>[`${ab()}, roulez parking, au revoir.`,`Roulez vers le parking ; au revoir.`],rb:()=>`Parking, au revoir, ${ab()}.`}));
  return s; };

/* ---- planche de bord : « six instruments de base » + moteur + radio ---- */
function tc(g,cx,cy,r){ g.save(); g.translate(cx,cy); g.fillStyle='#0b0d0f'; g.beginPath(); g.arc(0,0,r,0,7); g.fill(); g.strokeStyle='#555'; g.lineWidth=2; g.stroke();
  g.strokeStyle='#e8eef2'; g.lineWidth=2; [-1,1].forEach(s=>{ const a=s*20*D2R; g.beginPath(); g.moveTo(Math.cos(a)*r*0.72,Math.sin(a)*r*0.72+r*0.05); g.lineTo(Math.cos(a)*r*0.9,Math.sin(a)*r*0.9+r*0.05); g.stroke(); g.beginPath(); g.moveTo(-Math.cos(a)*r*0.72,Math.sin(a)*r*0.72+r*0.05); g.lineTo(-Math.cos(a)*r*0.9,Math.sin(a)*r*0.9+r*0.05); g.stroke(); });
  const rr=S.onGround?0:clamp((S.ph||0)/(25*D2R),-1.2,1.2)*20*D2R; g.save(); g.rotate(rr); g.fillStyle='#fff'; g.fillRect(-r*0.62,-2,r*1.24,4); g.beginPath(); g.arc(0,0,r*0.1,0,7); g.fill(); g.fillRect(-2,-r*0.22,4,r*0.2); g.restore();
  g.fillStyle='#1d2328'; g.fillRect(-r*0.38,r*0.42,r*0.76,r*0.16); const sl=clamp((IN.yaw||0)*0.8,-1,1); g.fillStyle='#e8eef2'; g.beginPath(); g.arc(sl*r*0.3,r*0.5,r*0.07,0,7); g.fill();
  g.fillStyle='#9aa3ab'; g.font=`500 ${Math.max(8,r*0.15)}px Inter,sans-serif`; g.textAlign='center'; g.fillText('L          R',0,r*0.3); g.fillText('2 MIN',0,-r*0.45); g.restore(); txt(g,'VIRAGE / BILLE',cx,cy+r+12,'#c9d1d8',10,'center','500 '); }
const _dc=drawCockpit; drawCockpit=function(){ if(!C()) return _dc.apply(this,arguments); if(!ckSize()) return; const g=CK.g, W=CK.w, H=CK.h, ad=airdata(), night=SKY.u.night.value>0.5;
  const grd=g.createLinearGradient(0,0,0,H); grd.addColorStop(0,'#1a1d20'); grd.addColorStop(0.07,night?'#15181b':'#34373b'); grd.addColorStop(1,night?'#0c0e10':'#2b2d30'); g.fillStyle=grd; g.fillRect(0,0,W,H);
  const flag=!S.eng[0]&&(SYS.irAl||0)<1, gy=(SYS.irAl||0)<1&&MI.full;
  const r=Math.min(H*0.2,W/20), row1=H*0.08+r*1.15, row2=row1+r*2.4, cx=W*0.3;
  dial(g,cx-r*2.3,row1,r,{min:0,max:180,a0:-90,a1:270,val:Math.max(0,ad.cas),label:'KIAS',step:20,lab:2,arcs:[[40,85,'#e8eef2'],[48,127,'#2fbf55'],[127,158,'#e6c229'],[158,180,COL.red]]});
  adiRound(g,cx,row1,r*1.1,ad,gy); dial(g,cx+r*2.3,row1,r,{min:0,max:1000,a0:-90,a1:270,val:wrap360(ad.alt/1000*360)/360*1000,v2:(ad.alt%10000)/10,label:'ALT FT',step:100,lab:2,lf:v=>v/100,dig:fmt(ad.alt,0)});
  tc(g,cx-r*2.3,row2,r); hsiRound(g,cx,row2,r*1.1,ad); dial(g,cx+r*2.3,row2,r,{min:-2000,max:2000,a0:-180,a1:0,val:ad.vs,label:'VS ×100',step:500,lab:2,lf:v=>v/100});
  if(gy){ txt(g,'gyros : dépression insuffisante',cx,row1+r*1.25,'#e6c229',10,'center','600 '); }
  const ex=W*0.62; dial(g,ex,row1,r*0.95,{min:0,max:3500,a0:-150,a1:150,val:S.rpm||0,label:'TR/MIN ×100',step:500,lab:2,lf:v=>v/100,arcs:[[2100,2700,'#2fbf55'],[2700,3500,COL.red]],dig:fmt(S.rpm||0,0)});
  const s=r*0.55, fu=(S.fuel||0)/2/0.72/3.785, run=!!S.eng[0];
  dial(g,ex+r*1.9,row1-r*0.5,s,{min:0,max:20,val:fu,label:'FUEL G gal',step:5,lab:1}); dial(g,ex+r*3.1,row1-r*0.5,s,{min:0,max:20,val:fu,label:'FUEL D gal',step:5,lab:1});
  dial(g,ex+r*1.9,row1+r*0.7,s,{min:0,max:250,val:run?60+S.thr*120:0,label:'OIL T',step:50,lab:1,arcs:[[100,245,'#2fbf55']]}); dial(g,ex+r*3.1,row1+r*0.7,s,{min:0,max:120,val:run?55+S.thr*25:0,label:'OIL P',step:20,lab:1,arcs:[[60,90,'#2fbf55']]});
  dial(g,ex-r*0.6,row2,s,{min:0,max:10,val:run?5+(S.thr>0.5?0.2:0):0,label:'SUCTION',step:2,lab:1,arcs:[[4.5,5.4,'#2fbf55']]}); dial(g,ex+r*0.6,row2,s,{min:-60,max:60,val:run&&SYS.alt1?5:SYS.bat1?-8:0,label:'AMP',step:20,lab:1});
  dial(g,ex+r*1.9,row2,s,{min:0,max:4,val:SYS.carbH==='CHAUD'?2.5:1,label:'CARB',step:1,lab:1});
  radioBlock(g,ex+r*2.6,row2-r*0.8,W-(ex+r*2.6)-12,r*1.9,SYS.avion&&SYS.bat1?'COM 119.30 · NAV 112.35 TSU':'RADIO (AVIONICS OFF)');
  txt(g,'Mags '+(SYS.mags||'OFF')+' · Mélange '+(SYS.mix||'')+' · Carbu '+(SYS.carbH||'')+' · Volets '+(A.flaps[S.flap]||{}).n+'°',W*0.62,H-10,'#9aa3ab',10,'center','500 ');
  txt(g,'Commandant de bord : place GAUCHE',cx,H-10,'#9aa3ab',10,'center','500 ');
  g.fillStyle='#121416'; g.fillRect(0,0,W,H*0.045); };
// pilote automatique KAP 140 (option de nombreux C172) : panneau HDG / NAV / ALT / VS
const _bf=buildFCU; buildFCU=function(){ if(!C()) return _bf.apply(this,arguments); const sv=ACK; try{ ACK='lj60'; _bf.apply(this,arguments); } finally{ ACK=sv; }
  const f=$('fcu'); if(f){ const l=f.querySelector('.lbl'); if(l) l.textContent='Bendix/King KAP 140 · pas d\'automanette : la puissance se règle à la main'; const b=f.querySelector('[data-f="ap"]'); if(b) b.textContent='AP'; } };
})();
/* ===== NAVIGATION VFR (PPL) : Toussus → Rambouillet → Dourdan → Toussus, avec log de navigation calculé ===== */
(function(){
if(typeof AC==='undefined'||!AC.c172) return;
const WPS=[['LFPN',48.7519,2.1062],['RAMBOUILLET',48.6440,1.8300],['DOURDAN',48.5290,2.0110],['LFPN',48.7519,2.1062]];
const DECL=2, VP=95, BURN=22, ALT=1500;   // déclinaison magnétique ≈ 2° Est [ESTIMÉ, région parisienne 2026] ; Vp 95 kt ; 22 kg/h
MISSIONS['c172-nav']={n:'Navigation VFR · Toussus → Rambouillet → Dourdan → Toussus',d:'Cessna 172P, première navigation PPL (≈ 36 NM) : log de navigation calculé avec le vent du jour (route vraie et magnétique, dérive, cap, vitesse sol, temps, carburant), suivi des points tournants, retour et atterrissage à Toussus.',
  fw:true,ac:'c172',start:()=>rwStart('LFPN','25R'),dest:'LFPN',destRw:'25R',wps:WPS};
MI_AC['c172-nav']='c172';
function navLog(){ const m=(typeof WXS!=='undefined'&&WXS.met.LFPN)||{dir:240,spd:8}, wd=m.dir||0, ws=m.spd||0, legs=[]; let T=0, F=0, D=0;
  for(let i=1;i<WPS.length;i++){ const a=WPS[i-1], b=WPS[i], rv=(brg(a[1],a[2],b[1],b[2])+360)%360, nm=gcKm(a[1],a[2],b[1],b[2])/1.852, ang=(wd-rv)*Math.PI/180, x=Math.asin(Math.max(-1,Math.min(1,ws*Math.sin(ang)/VP)))*180/Math.PI,
    cv=(rv+x+360)%360, cm=(cv-DECL+360)%360, vs=VP*Math.cos(x*Math.PI/180)-ws*Math.cos(ang), t=nm/vs*60, f=t/60*BURN; T+=t; F+=f; D+=nm;
    legs.push({from:a[0],to:b[0],rv,rm:(rv-DECL+360)%360,nm,x,cm,vs,t,f}); }
  return {legs,T,F,D,wd,ws,res:BURN*0.5}; }
const r0=v=>String(Math.round(v)).padStart(3,'0');
function open(){ let p=document.getElementById('navlog'); if(!p){ p=document.createElement('div'); p.id='navlog'; p.style.cssText='position:fixed;inset:0;z-index:67;background:#000a;display:flex;align-items:flex-start;justify-content:center;padding:10px;overflow:auto'; document.body.appendChild(p); p.addEventListener('click',e=>{ if(e.target===p||e.target.closest('[data-x]')) p.hidden=true; }); }
  const L=navLog(), th='padding:4px 6px;border-bottom:1px solid #2b3d50;text-align:right', tl=th.replace('right','left');
  p.innerHTML=`<div style="background:#0d1a26;color:#e8eef2;border:1px solid #2b3d50;border-radius:12px;max-width:760px;width:100%;font:13px Inter,sans-serif"><div style="display:flex;justify-content:space-between;padding:10px 12px;border-bottom:1px solid #2b3d50"><b style="font:700 18px 'Barlow Condensed',sans-serif;letter-spacing:.06em">🧭 LOG DE NAVIGATION · F-HTCA</b><button type="button" data-x style="background:none;border:0;color:#fff;font-size:20px">✕</button></div>
   <div style="padding:10px 12px;overflow:auto"><p>Vp ${VP} kt · altitude ${ALT} ft QNH · vent ${r0(L.wd)}°/${L.ws} kt (METAR LFPN) · déclinaison ${DECL}° E · consommation ${BURN} kg/h</p>
   <table style="border-collapse:collapse;width:100%"><tr>${['Branche','Rv','Rm','Dist. NM','Dérive','Cm','Vs kt','Temps','Carb. kg'].map((h,i)=>`<th style="${i?th:tl}">${h}</th>`).join('')}</tr>
   ${L.legs.map(l=>`<tr><td style="${tl}">${l.from} → ${l.to}</td><td style="${th}">${r0(l.rv)}°</td><td style="${th}">${r0(l.rm)}°</td><td style="${th}">${l.nm.toFixed(1)}</td><td style="${th}">${l.x>=0?'+':''}${l.x.toFixed(0)}°</td><td style="${th}"><b>${r0(l.cm)}°</b></td><td style="${th}">${Math.round(l.vs)}</td><td style="${th}">${Math.round(l.t)} min</td><td style="${th}">${l.f.toFixed(1)}</td></tr>`).join('')}
   <tr><td style="${tl}"><b>Total</b></td><td></td><td></td><td style="${th}"><b>${L.D.toFixed(1)}</b></td><td></td><td></td><td></td><td style="${th}"><b>${Math.round(L.T)} min</b></td><td style="${th}"><b>${L.F.toFixed(1)}</b></td></tr></table>
   <p>Carburant minimal : délestage ${L.F.toFixed(1)} kg + roulage 3 kg + réserve finale 30 min (${L.res.toFixed(0)} kg, NCO.OP.125) + aléas 10 % = <b>${(L.F*1.1+3+L.res).toFixed(0)} kg</b> (à bord : ${Math.round(S.fuel||0)} kg).</p>
   <p class="m2-note">Méthode : dérive X = arcsin(Vw·sin(vent − Rv) / Vp) ; Cv = Rv + X ; Cm = Cv − déclinaison Est ; Vs = Vp·cos X − Vw·cos(vent − Rv). Les points tournants sont des repères au sol (villes), pas des points de report officiels ; l\'altitude et les espaces aériens (TMA de Paris, zones réglementées) se vérifient sur la carte OACI et l\'AIP avant tout vol réel.</p></div></div>`;
  p.hidden=false; }
window.NAVLOG={open,navLog};
let btn=null, next=1, tLeg=0;
setInterval(()=>{ const on=typeof MI!=='undefined'&&MI&&MI.wps===WPS&&document.getElementById('menu').hidden;
  if(!btn){ btn=document.createElement('button'); btn.type='button'; btn.id='b-navlog'; btn.textContent='🧭 Log de nav'; btn.style.cssText='position:fixed;top:52px;right:8px;z-index:46;padding:7px 11px;border-radius:9px;border:1px solid #e04ad8;background:#1a0f22;color:#fff;font:600 13px Inter,sans-serif'; btn.onclick=open; document.body.appendChild(btn); }
  btn.style.display=on?'block':'none'; if(!on){ next=1; return; }
  if(!S.onGround&&next<WPS.length){ const w=WPS[next], d=gcKm(S.lat,S.lon,w[1],w[2])/1.852; if(d<1.0&&!(next===WPS.length-1)){ const L=navLog(), sim=(simMs-tLeg)/60000; flash(`Verticale ${w[0]} · branche ${Math.round(sim)} min (prévu ${Math.round(L.legs[next-1].t)} min) · prochain cap ${r0(L.legs[next].cm)}°`,'am'); tLeg=simMs; next++; } }
  if(S.onGround&&next===1) tLeg=simMs; },1000);
let shown=false; setInterval(()=>{ if(typeof MI!=='undefined'&&MI&&MI.wps===WPS&&document.getElementById('menu').hidden){ if(!shown){ shown=true; setTimeout(open,1500); } } else shown=false; },800);
})();
