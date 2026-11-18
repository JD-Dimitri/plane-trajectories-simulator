/* ===== PARITÉ ENTRE APPAREILS : l'A320 est la référence =====
   Chaque scénario de l'A320 est proposé sur les autres appareils dès que leurs systèmes le permettent :
   - 777 : mêmes systèmes modélisés que l'A320 (feu moteur, dépressurisation, génératrices, Pitot, TCAS, fuite carburant,
     sécurité du poste, parcours Germanwings sans le crash) + variante fictive de l'impact d'oiseaux (US 1549) ;
   - Learjet 60, Cessna 172 : impact d'oiseaux / panne moteur, fuite carburant, panne d'alternateur, (C172) givrage carburateur ;
   - hélicoptères : panne moteur, panne de génératrice.
   Exceptions assumées (non transposables) : la reconstitution historique US 1549 reste sur A320 (avion réel du rapport NTSB) ;
   le parcours Germanwings au FL380 n'a pas de sens pour un avion non pressurisé ou un hélicoptère. */
(function(){
if(typeof SCNS==='undefined') return;
const NM={a320:'A320',b777:'Boeing 777',a350:'A350-900',lj60:'Learjet 60',c172:'Cessna 172',h125:'H125',r44:'R44',s76:'S-76'};
const clone=(id,ac,o)=>{ const b=SCNS.find(s=>s.id===id); if(!b||SCNS.find(s=>s.id===id+'@'+ac)) return; SCNS.push(Object.assign({},b,{id:id+'@'+ac,ac,name:b.name.replace(/A320-?200|A320/g,NM[ac])+(/A320/.test(b.name)?'':' · '+NM[ac])},o||{})); };

/* --- pannes propres au Cessna 172 (aussi dans le panneau « Pannes ») --- */
if(typeof FAILS!=='undefined'&&!FAILS.find(f=>f.id==='engC')){
  FAILS.push({id:'engC',g:'Moteurs',n:'Panne moteur (monomoteur à pistons)',l:0,ac:'c172',atc:['mayday','engine failure, forced landing','panne moteur, atterrissage forcé'],fix:()=>{}},
    {id:'carbIce',g:'Moteurs',n:'Givrage du carburateur',l:0,ac:'c172',atc:['pan','rough running engine','moteur qui tourne mal'],fix:()=>{ try{ pedSet('carbH','CHAUD'); }catch(e){} }}); }
if(typeof failAvail==='function'){ const _fa=failAvail; failAvail=function(f){ if(f.ac==='c172') return ACK==='c172'; if(ACK==='c172'&&f.ac==='fw2') return false; return _fa.apply(this,arguments); }; }

/* --- Learjet 60 : pressurisation (modèle simplifié), feu moteur, sonde Pitot (modèle de givrage commun) --- */
if(typeof FAILS!=='undefined'&&!FAILS.find(f=>f.id==='ljDep')){
  FAILS.push({id:'ljDep',g:'Air · pressurisation',n:'Dépressurisation (Learjet 60)',l:2,t:'CABIN ALTITUDE',ac:'lj60',atc:['mayday','rapid depressurisation, emergency descent','dépressurisation rapide, descente d\'urgence'],fix:()=>{}},
    {id:'ljFire',g:'Moteurs',n:'Feu moteur gauche (Learjet 60)',l:3,t:'L ENG FIRE',ac:'lj60',atc:['mayday','left engine fire','feu moteur gauche'],fix:()=>{ S.eng[0]=false; if(S.n2) S.n2[0]=0; GD.ljExt=true; }}); }
const LJ={cab:0};
setInterval(()=>{ try{ window.FORCEICE=!!(SCN.cur&&SCN.cur.id==="LJ-ICE"&&!SCN.done); }catch(e){} },500);   // nuage givrant du scénario
setInterval(()=>{ if(typeof ACK==='undefined'||ACK!=='lj60'||typeof S==='undefined') return; const dt=0.5, alt=S.alt/FT;
  // cabine : ≈ 8 000 ft au plafond (écart de pression maximal ≈ 9,4 psi [ESTIMÉ]) ; en panne, la cabine rejoint l'altitude de l'avion en quelques secondes
  const tgt=FAIL.ljDep?alt:Math.max(0,Math.min(8000,alt*0.17)); LJ.cab+=Math.max(-2000/60*dt,Math.min((FAIL.ljDep?60000:600)/60*dt,tgt-LJ.cab)); window.LJCAB=LJ.cab;
  if(LJ.cab>10000&&(!LJ.t||Date.now()-LJ.t>8000)){ LJ.t=Date.now(); flash(`CABIN ALTITUDE ${Math.round(LJ.cab/100)*100} ft : masques à oxygène, descente d'urgence vers 10 000 ft`,'red'); }
  if(FAIL.ljFire){ if(S.eng[0]===false&&GD.ljExt){ delete FAIL.ljFire; flash('Feu éteint : moteur gauche coupé, extincteur percuté. Poursuivre sur un moteur et se dérouter','am'); }
    else { if(S.eng[0]===false) GD.ljExt=true; if(!LJ.f||Date.now()-LJ.f>7000){ LJ.f=Date.now(); flash('L ENG FIRE : manette gauche CUTOFF, extincteur (Pannes › corriger, ou couper le moteur gauche)','red'); } } } },500);
if(typeof failAvail==='function'){ const _fa2=failAvail; failAvail=function(f){ if(f.ac==='lj60') return ACK==='lj60'; return _fa2.apply(this,arguments); }; }
const ljBase=SCNS.find(s=>s.id==='F-LJENG')||{};
[['LJ-DEP','Learjet 60 — dépressurisation en croisière','Croisière au FL410, la pressurisation lâche.','t = 40 s : dépressurisation.','La cabine monte vers l\'altitude de l\'avion.','Masques, descente d\'urgence (manettes au ralenti, vitesse élevée) vers 10 000 ft, MAYDAY, 7700.',()=>{ SCN.trig=[{t:40,f:()=>failSet('ljDep',true)}]; },
   L=>[['Descendu sous 10 000 ft',S.alt/FT<10500,Math.round(S.alt/FT)+' ft'],['MAYDAY',!!L.mayday,L.mayday?'oui':'non']],41000],
 ['LJ-FIRE','Learjet 60 — feu moteur gauche en montée','Montée initiale après le décollage de JFK.','t = 30 s : feu moteur gauche.','Alarme feu.','Manette gauche CUTOFF, extincteur, poursuite sur un moteur, MAYDAY, retour à JFK.',()=>{ SCN.trig=[{t:30,f:()=>failSet('ljFire',true)}]; },
   L=>[['Feu éteint',!FAIL.ljFire,FAIL.ljFire?'non':'oui'],['Issue',L.out==='atterrissage',L.out||'en cours']],null],
 ['LJ-ICE','Learjet 60 — givrage de la sonde Pitot','Croisière en conditions givrantes, réchauffage des sondes coupé.','Entrée en givrage, PROBE HEAT OFF.','Vitesse indiquée fausse.','Identifier l\'incohérence (assiette + poussée, vitesse sol), PROBE HEAT ON, sortir du givrage.',()=>{ SYS.probe=false; },
   L=>[['Réchauffage sondes ON',!!SYS.probe,SYS.probe?'ON':'OFF']],24000]].forEach(([id,name,ctx,trg,fails,exp,init,ev,cr])=>{ if(SCNS.find(s=>s.id===id)) return;
  const o=Object.assign({},ljBase,{id,ac:'lj60',cat:'A',name,context:ctx,triggers:trg,fails,expected:exp,init,eval:ev}); if(cr) o.cruise=cr; else delete o.cruise; SCNS.push(o); });
/* --- 777 : tous les scénarios fictifs de l'A320 --- */
['F-FIRE','F-DEPRESS','F-ELEC','F-ICE','F-TCAS','F-FUEL','GW-SEC','GW-ROUTE'].forEach(id=>clone(id,'b777'));
/* --- V10.39 : A350-900, mêmes systèmes modélisés que l'A320 : tous les scénarios fictifs de l'A320 --- */
['F-FIRE','F-DEPRESS','F-ELEC','F-ICE','F-TCAS','F-FUEL','GW-SEC','GW-ROUTE'].forEach(id=>clone(id,'a350'));
/* --- fuite carburant : Learjet 60 --- */
clone('F-FUEL','lj60',{expected:'Reconnaître l\'écart carburant, prévenir le contrôle, se dérouter vers le terrain le plus proche.'});

/* --- impact d'oiseaux / double perte de poussée (fictif, d'après US 1549) : 777, Learjet 60, Cessna 172 --- */
const birdStart=()=>{ const p=offsetLL(APTS.KLGA.lat,APTS.KLGA.lon,4.5*1609*Math.cos(337*D2R),4.5*1609*Math.sin(337*D2R)); return {lat:p[0],lon:p[1],hdg:315,elev:6}; };
const birdEval=L=>{ const d=L.ditch; return [['MAYDAY transmis',!!L.mayday,L.mayday?'oui':'non'],['Issue',!!(d&&!/rupture/.test(L.out||''))||L.out==='atterrissage',L.out||'—'],['Train rentré à l\'amerrissage',d?!d.gear:null,d?(d.gear?'SORTI':'rentré'):'—']]; };
[['b777',250000,215,2818],['a350',230000,210,2818],['lj60',9000,200,2818],['c172',1000,85,2000]].forEach(([ac,m,kt,ft])=>{ if(SCNS.find(s=>s.id==='BIRDS@'+ac)) return;
  SCNS.push({id:'BIRDS@'+ac,cat:'A',ac,name:'Impact d\'oiseaux au départ de LaGuardia — '+(ac==='c172'?'panne moteur':'double perte de poussée')+' (fictif, d\'après US 1549) · '+NM[ac],
    context:'Variante fictive du vol US 1549 transposée sur '+NM[ac]+' : mêmes lieu et altitude, l\'avion et ses performances changent. La reconstitution historique fidèle reste sur A320.',
    wx:'Jour, vent 290°/8 kt [ESTIMÉ].',phase:'Montée initiale au nord-ouest de LaGuardia, '+ft+' ft.',triggers:'t = 0 : ingestion d\'oiseaux.',fails:ac==='c172'?'Panne moteur.':'Perte de poussée des deux moteurs.',
    auto:'Aucun.',expected:ac==='c172'?'Vitesse de plané ≈ 65 KIAS, choisir un champ (ou l\'Hudson), check-list panne moteur (carburant, mélange, réchauffage, magnétos), MAYDAY, se poser face au vent.':'Vitesse de meilleure finesse, MAYDAY, terrain atteignable ou amerrissage, train rentré pour un amerrissage, taux de chute minimal.',
    dest:'KLGA',seed:1549,limit:900,start:birdStart,
    init(){ Object.assign(S,{onGround:false,alt:ft*FT,V:tasFromCas(kt*KT,ft*FT),gam:2*D2R,th:5*D2R,ph:0,psi:315*D2R,gear:false,flap:0,thr:0.85,eng:[true,ac!=='c172'],n2:[1,ac!=='c172'?1:0],mass:m,pbrake:false,pushed:true});
      if(ac==='c172'){ S.gear=true; Object.assign(SYS,{bat1:true,alt1:true,avion:true,mags:'BOTH',mix:'RICH',fuelSel:'BOTH',irAl:1}); }
      AP.on=false; AP.ath=false; ATC.seq=[]; try{ ATC.curSt='LGA_DEP'; atcTune('LGA_DEP'); }catch(e){} failSet(ac==='c172'?'engC':'birds',true); },
    eval:birdEval,debrief:'Sans moteur, la vitesse de meilleure finesse donne la plus grande distance franchissable. Le NTSB a montré pour US 1549 que le temps d\'identification et de décision réduit fortement les options de retour au terrain.'}); });

/* --- Cessna 172 : scénarios PPL (vol local à Toussus) --- */
const c172Air=(ft,kt)=>()=>{ const r=rwStart('LFPN','25R'), p=offsetLL(r.lat,r.lon,-3000*Math.cos(r.hdg*D2R),-3000*Math.sin(r.hdg*D2R));
  Object.assign(S,{lat:p[0],lon:p[1],onGround:false,alt:(APTS.LFPN.elev/FT+ft)*FT,V:tasFromCas(kt*KT,ft*FT),gam:0,th:2*D2R,ph:0,psi:(r.hdg+180)*D2R,gear:true,flap:0,thr:0.7,eng:[true,false],n2:[1,0],pbrake:false,pushed:true});
  Object.assign(SYS,{bat1:true,alt1:true,avion:true,mags:'BOTH',mix:'RICH',fuelSel:'BOTH',carbH:'FROID',irAl:1,xpdr:'ALT'}); try{ PATCH.lat=999; }catch(e){} };
const PPL=[
 {id:'C-EFATO',name:'Cessna 172 — panne moteur au décollage (Toussus 25R)',context:'Exercice PPL : panne moteur juste après l\'envol, piste 25R de Toussus.',phase:'Décollage, montée initiale.',triggers:'Hauteur > 300 ft → panne moteur.',fails:'Panne moteur.',
  expected:'Rendre la main immédiatement pour garder ≈ 65 KIAS, atterrir DROIT DEVANT (± 30°) : pas de demi-tour à basse hauteur. Volets selon besoin, MAYDAY si le temps le permet, couper carburant / magnétos / MASTER avant le contact.',
  base:'c172-local',init(){ S.pbrake=false; Object.assign(SYS,{bat1:true,alt1:true,avion:true,mags:'BOTH',mix:'RICH',fuelSel:'BOTH',irAl:1}); S.eng[0]=true; S.thr=1; SCN.trig=[{c:()=>!S.onGround&&aglFt()>300,f:()=>failSet('engC',true)}]; },
  eval(L){ return [['Posé sans accident',L.out==='atterrissage',L.out||'en cours'],['Pas de demi-tour sous 500 ft',!L.turnBack,L.turnBack?'demi-tour tenté':'non']]; },
  debrief:'Le demi-tour à basse hauteur après une panne au décollage (« impossible turn ») est une cause d\'accident mortel bien documentée : la perte de hauteur dans le virage dépasse souvent la hauteur disponible.'},
 {id:'C-ICE',name:'Cessna 172 — givrage du carburateur en vent arrière',context:'Air humide et doux : le carburateur givre à puissance réduite.',phase:'Vent arrière, 1 000 ft sol.',triggers:'t = 20 s : givrage carburateur.',fails:'Le régime chute peu à peu, le moteur tourne mal puis s\'arrête si rien n\'est fait.',
  expected:'Reconnaître la baisse de régime, réchauffage carburateur CHAUD (le moteur tousse d\'abord, l\'eau de fonte passe), le laisser plusieurs minutes, puis FROID.',
  base:'c172-local',init(){ c172Air(1000,90)(); SCN.trig=[{t:20,f:()=>failSet('carbIce',true)}]; },
  eval(L){ return [['Réchauffage carburateur utilisé',SYS.carbH==='CHAUD'||(GD.ice||0)<0.2,SYS.carbH],['Moteur toujours en marche',!!S.eng[0],S.eng[0]?'oui':'arrêté']]; },
  debrief:'Le givrage du carburateur peut survenir jusqu\'à +25 °C par air humide : la détente et la vaporisation de l\'essence refroidissent fortement le venturi. Les essais au point fixe et le réchauffage avant réduction le préviennent.'},
 {id:'C-ALT',name:'Cessna 172 — panne d\'alternateur',context:'Vol local : l\'alternateur lâche, la batterie se décharge.',phase:'Croisière, 1 500 ft sol.',triggers:'t = 30 s : alternateur en panne.',fails:'Ampèremètre négatif, la batterie alimente seule radio et feux.',
  expected:'Constater la décharge (ampèremètre), délester (phare, feux non indispensables, avionique superflue), prévenir le contrôle et rentrer.',
  base:'c172-local',night:false,init(){ c172Air(1500,95)(); SCN.trig=[{t:30,f:()=>failSet('genGA0',true)}]; },
  eval(L){ return [['Posé',L.out==='atterrissage',L.out||'en cours'],['Batterie restante',EGA.soc>0.05,Math.round(EGA.soc*100)+' %']]; },
  debrief:'Le moteur à pistons n\'a pas besoin d\'électricité pour tourner (magnétos autonomes) : la panne d\'alternateur prive seulement de radio, feux et volets électriques quand la batterie est vide.'},
 {id:'C-FUEL',name:'Cessna 172 — fuite de carburant',context:'Vol local : la quantité baisse plus vite que la consommation.',phase:'Croisière, 1 500 ft sol.',triggers:'t = 20 s : fuite (≈ 25 kg/h en plus).',fails:'Jauges qui baissent anormalement.',
  expected:'Comparer jauges et consommation prévue, choisir le terrain le plus proche, prévenir le contrôle, se poser avec une marge.',
  base:'c172-local',init(){ c172Air(1500,95)(); S.fuel=40; SCN.trig=[{t:20,f:()=>failSet('fuelLeak',true)}]; },
  eval(L){ return [['Posé moteur tournant',L.out==='atterrissage'&&!!S.eng[0],L.out||'en cours'],['Contrôle prévenu',!!L.mayday,L.mayday?'oui':'non']]; },
  debrief:'Le suivi carburant (heure par heure, jauges et calcul) est la seule façon de détecter une fuite avant la panne sèche.'}];
PPL.forEach(o=>{ if(!SCNS.find(s=>s.id===o.id)) SCNS.push(Object.assign({cat:'A',ac:'c172',wx:'Conditions du vol libre en cours.',auto:'Aucun.',seed:172,limit:900},o)); });

/* --- hélicoptères : chacun a une panne moteur et une panne électrique --- */
clone('F-H125','r44',{name:'R44 — panne moteur (autorotation)',triggers:'Hauteur > 800 ft → panne moteur.',fails:'Panne du moteur à pistons.',expected:'Collectif en bas immédiatement (le régime rotor du R44 chute très vite), 60–70 kt, arrondi puis posé.'});
clone('F-R44','h125',{name:'H125 — panne de génératrice de nuit',fails:'Voyant GEN, la batterie se décharge.'});
clone('F-R44','s76',{name:'S-76 — perte d\'une génératrice de nuit',init(){ SCN.trig=[{t:60,f:()=>failSet('genGA0',true)}]; },fails:'Une génératrice sur deux : charge à surveiller.',expected:'Constater, délester si besoin, poursuivre sur la génératrice restante.'});

/* --- menu : cartes de scénarios avec un bouton par appareil compatible --- */
const CARD={'sc-1549':{acs:['a320','b777','a350','lj60','c172'],id:{a320:'US1549',b777:'BIRDS@b777',a350:'BIRDS@a350',lj60:'BIRDS@lj60',c172:'BIRDS@c172'},d:'Amerrissage sur l\'Hudson (2009) : reconstitution guidée sur A320 ; variante fictive (mêmes lieu et altitude) sur les autres avions.'},
  'sc-9525':{acs:['a320','b777','a350'],id:{a320:'GW-ROUTE',b777:'GW-ROUTE@b777',a350:'GW-ROUTE@a350'}},
  'sc-dep':{acs:['a320','b777','a350','lj60'],id:{a320:'F-DEPRESS',b777:'F-DEPRESS@b777',a350:'F-DEPRESS@a350',lj60:'LJ-DEP'},n:'Scénario fictif · dépressurisation en croisière',d:'Perte de pressurisation en altitude : masques, descente d\'urgence, MAYDAY.'},
  'sc-fict':{acs:['a320','b777','a350','lj60','c172'],id:{a320:'F-FUEL',b777:'F-FUEL@b777',a350:'F-FUEL@a350',lj60:'F-FUEL@lj60',c172:'C-FUEL'},n:'Scénario fictif · fuite carburant'},
  'sc-eng':{acs:['lj60','c172','h125','r44','s76','b777','a350','a320'],id:{a320:'F-FIRE',b777:'F-FIRE@b777',a350:'F-FIRE@a350',lj60:'LJ-FIRE',c172:'C-EFATO',h125:'F-H125',r44:'F-H125@r44',s76:'F-S76'},n:'Scénario fictif · panne moteur au décollage',d:'Feu ou panne moteur juste après le décollage, sur chaque appareil : procédure propre au type (feu moteur sur avion de ligne, panne au décollage sur monomoteur, autorotation sur hélicoptère).'},
  'sc-elec':{acs:['a320','b777','a350','lj60','c172','h125','r44','s76'],id:{a320:'F-ELEC',b777:'F-ELEC@b777',a350:'F-ELEC@a350',lj60:'F-LJGEN',c172:'C-ALT',h125:'F-R44@h125',r44:'F-R44',s76:'F-R44@s76'},n:'Scénario fictif · panne électrique',d:'Perte de génératrice(s) ou d\'alternateur : reconnaître, délester, rejoindre un terrain.'},
  'sc-ice':{acs:['a320','b777','a350','lj60','c172'],id:{a320:'F-ICE',b777:'F-ICE@b777',a350:'F-ICE@a350',lj60:'LJ-ICE',c172:'C-ICE'},n:'Scénario fictif · givrage',d:'Sonde Pitot non réchauffée sur avion de ligne ; givrage du carburateur sur le Cessna 172.'}};
if(!SCNS.find(s=>s.id==='F-LJGEN')) SCNS.push(Object.assign({},SCNS.find(s=>s.id==='F-R44'),{id:'F-LJGEN',ac:'lj60',name:'Learjet 60 — perte des deux génératrices de nuit',base:'jfk-cdg',context:'Croisière de nuit, les deux génératrices lâchent.',triggers:'t = 60 s : génératrices 1 et 2.',fails:'Batteries seules.',init(){ SCN.trig=[{t:60,f:()=>{ failSet('genGA0',true); failSet('genGA1',true); }}]; },expected:'Délester, descendre et se poser avant l\'épuisement des batteries.'}));
Object.keys(CARD).forEach(k=>{ const c=CARD[k]; if(!MISSIONS[k]) MISSIONS[k]={n:c.n||k,d:c.d||''}; const m=MISSIONS[k]; m.soon=false; m.acs=c.acs; if(c.n) m.n=c.n; if(c.d) m.d=c.d; if(typeof MI_AC!=='undefined') delete MI_AC[k]; });
const goB=document.getElementById('go'); if(goB){ const _go=goB.onclick; goB.onclick=function(){ const c=CARD[selMI]; if(c){ const id=c.id[selAC]||c.id[c.acs[0]]; if(SCNS.find(s=>s.id===id)){ document.getElementById('menu').hidden=true; paused=false; scnStart(id); try{ SCN.view='run'; scnOpen(true,'run'); }catch(e){} return; } } return _go&&_go.apply(this,arguments); }; }
// guidage pas à pas des scénarios clonés : mêmes étapes que l'original
if(window.SCNG&&SCNG.steps){ const _st=SCNG.steps; SCNG.steps=id=>{ const r=_st(id); if(r&&r.length) return r; return _st(String(id).split('@')[0]); }; }
// demi-tour à basse hauteur (évaluation EFATO)
setInterval(()=>{ try{ if(SCN.cur&&SCN.cur.id==='C-EFATO'&&FAIL.engC&&!S.onGround&&aglFt()<500){ const r=rwStart('LFPN','25R'); if(Math.abs(wrapPi(S.psi-r.hdg*D2R))>120*D2R) SCN.log.turnBack=true; } }catch(e){} },500);
try{ renderMenu(); }catch(e){}
})();

/* V10.35 : chaque vue nommée justement — pour un hélicoptère, « Tour avion » devient « Tour hélicoptère » (titres d'étape, phases, textes). */
(function(){ const fix=t=>typeof t==='string'?t.replace(/Tour avion/g,'Tour hélicoptère').replace(/TOUR AVION/g,'TOUR HÉLICOPTÈRE').replace(/tour avion/g,'tour hélicoptère').replace(/pied de l'avion/g,'pied de l\'hélicoptère'):t;
  const _sf=stepsFor; stepsFor=function(){ const st=_sf.apply(this,arguments); try{ if(A&&A.kind==='rw') st.forEach(s=>{ s.t=fix(s.t); s.txt=fix(s.txt); s.ph=fix(s.ph); (s.items||[]).forEach(it=>{ it[0]=fix(it[0]); }); }); }catch(e){} return st; };
  window.KINDFIX=fix; })();
