/* =====================================================================================================
   V7.8 — SCÉNARIOS GUIDÉS : MÊME SYSTÈME D'ÉTAPES ET DE SOUS-ÉTAPES ENCADRÉES (ROUGE → VERT)
   Chaque scénario reçoit sa procédure : [SCÉNARIO] › [PARTIE A Détecter / B Agir / C Stabiliser] › [ÉTAPE] › [SOUS-ÉTAPE n/N].
   Les commandes à actionner sont encadrées en rouge et numérotées, passent au vert quand c'est fait ; la sous-étape finale
   encadre l'écran du résultat. Vous pilotez ; « Faire » exécute la sous-étape en cours, « Démonstration » enchaîne seul.
   Procédures pédagogiques simplifiées, d'après les check-lists publiques et le champ « attendu » de chaque scénario [SIMULÉ].
   ===================================================================================================== */
(function(){
'use strict';
const SG=window.SCNG={on:false,demo:false,run:null,doneT:0,lastDemo:0};
const S_=id=>`[data-sw="${id}"]`, P_=id=>`[data-pd="${id}"]`, CALL='#atc [data-a="call"]';
const sw=(id,v)=>()=>{ SYS[id]=v; try{ sysEffect(id); }catch(e){} try{ ovhSync(); }catch(e){} try{ a320Sync(); }catch(e){} };
const pd=(id,v)=>()=>{ try{ pedSet(id,v); }catch(e){} try{ pedSync(); }catch(e){} };
const cas=()=>{ try{ return airdata().cas; }catch(e){ return 0; } }, alt=()=>{ try{ return airdata().alt; }catch(e){ return 0; } }, agl=()=>{ try{ return aglFt(); }catch(e){ return 0; } };
const L=()=>(typeof SCN!=='undefined'&&SCN.log)||{};
const fl=n=>()=>{ const f=A.flaps[S.flap]; return !!f&&String(f.n)===String(n); };
const callEmer=()=>{ try{ atcOpen(true); if(!ATC.q.some(x=>x.k==='emer')) atcEmergency(['mayday','emergency','situation d\'urgence']); }catch(e){} const tryCall=n=>{ if(L().mayday) return; const rb=document.querySelector('#atc [data-a="rb"]'), b=document.querySelector(CALL); if(rb&&!rb.disabled) rb.click(); else if(b&&!b.disabled) b.click(); if(n>0) setTimeout(()=>tryCall(n-1),900); }; setTimeout(()=>tryCall(14),400); };
SG.callEmer=callEmer;
const mayday=['MAYDAY : appeler le contrôle (Radio › Appeler)',()=>!!L().mayday,callEmer,CALL];
const altFcu=v=>[`FCU : altitude ${fmt(v,0)} ft`,()=>AP.alt<=v,()=>{ AP.alt=v; AP.on=true; try{ fcuSync(); }catch(e){} },'#f-alt'];
// [libellé, vérification, action (facultative), sélecteur de la commande (facultatif)] ; sans sélecteur → cadre sur l'écran concerné
const P={
 US1549:[
  {part:'A',ph:'Détecter',t:'Impact d\'oiseaux : sauver l\'électricité',txt:'Les deux moteurs perdent leur poussée à 2 800 ft. Premier réflexe (NTSB) : démarrer l\'APU tout de suite pour garder l\'électricité et la loi normale.',res:'APU en démarrage : loi normale et protections conservées.',scr:'sd',items:[
   ['APU MASTER SW : ON',()=>!!SYS.apuMaster,sw('apuMaster',true),S_('apuMaster')],['APU START',()=>!!(SYS.apuStart||SYS.apuAvail||SYS.apuStartBtn),sw('apuStartBtn',true),S_('apuStartBtn')],
   ['ENG MODE : IGN START (rallumage)',()=>SYS.engMode==='IGN START',pd('engMode','IGN START'),P_('engMode')]]},
  {part:'B',ph:'Agir',t:'Planer et prévenir',txt:'Sans moteur, l\'avion devient un planeur : tenir la vitesse de meilleure finesse (≈ « green dot », environ 210 kt) et déclarer la détresse.',res:'Plané stabilisé, contrôle prévenu.',scr:'pfd',items:[
   ['Vitesse ≈ 210 kt (meilleure finesse)',()=>cas()>190&&cas()<230,null,null],mayday]},
  {part:'C',ph:'Stabiliser',t:'Préparer l\'amerrissage',txt:'Le retour à LaGuardia est impossible : amerrissage sur l\'Hudson. Fermer les vannes basses, volets 2, train rentré.',res:'Configuré pour l\'amerrissage : volets 2, train rentré, vannes fermées.',scr:'ewd',items:[
   ['DITCHING : ON',()=>!!SYS.ditch,sw('ditch',true),S_('ditch')],['Volets 2',fl(2),pd('flapL','2'),P_('flapL')],['Train : RENTRÉ (UP)',()=>!S.gear,pd('gearL','UP'),P_('gearL')]]},
  {part:'C',ph:'Stabiliser',t:'Amerrissage',txt:'Assiette ≈ 10° au contact, ailes horizontales, taux de chute le plus faible possible.',res:'Amerrissage terminé.',scr:'pfd',items:[['Contact avec l\'eau, assiette ≈ 10°',()=>!!L().ditch||S.onGround,null,null]]}],
 'F-FIRE':[
  {part:'A',ph:'Détecter',t:'Décollage : aucune action sous 400 ft',txt:'Le feu se déclare en montée initiale. Règle : on ne touche à rien sous 400 ft, on vole d\'abord.',res:'Feu moteur 1 identifié au-dessus de 400 ft.',scr:'ewd',items:[
   ['Poussée TOGA',()=>SYS.thrSel==='TOGA'||!S.onGround,pd('thrSel','TOGA'),P_('thrSel')],['En vol, train rentré',()=>!S.onGround&&!S.gear,()=>{ if(!S.onGround) pedSet('gearL','UP'); },P_('gearL')],
   ['Gong + ENG 1 FIRE (attendre)',()=>!!(FAIL.fire1||SYS.fire1),null,null]]},
  {part:'B',ph:'Agir',t:'ENG 1 FIRE : procédure ECAM',txt:'Couper le moteur 1, tirer la poignée FIRE, décharger l\'extincteur, prévenir le contrôle. (Manette 1 au ralenti : non simulée séparément.)',res:'Feu éteint, moteur 1 sécurisé.',scr:'ewd',items:[
   ['ENG MASTER 1 : OFF',()=>!SYS.master1,pd('master1',false),P_('master1')],['ENG 1 FIRE P/B : PUSH',()=>!!SYS.fire1,sw('fire1',true),S_('fire1')],['AGENT 1 : DISCH',()=>!!SYS.ag11,sw('ag11',true),S_('ag11')],mayday]},
  {part:'C',ph:'Stabiliser',t:'Sécuriser la trajectoire, retour JFK',txt:'Pilote automatique, au moins 1 000 ft sol, puis retour vers JFK.',res:'Avion stabilisé, retour vers JFK.',scr:'pfd',items:[
   ['AP1 engagé',()=>!!AP.on,()=>{ try{ fcuCmd('ap'); }catch(e){} },'[data-f="ap"]'],['Hauteur ≥ 1 000 ft sol',()=>agl()>1000,null,null]]}],
 'F-DEPRESS':[
  {part:'A',ph:'Détecter',t:'Croisière : surveiller la cabine',txt:'À 35 000 ft, le temps de conscience utile ne dure que quelques dizaines de secondes.',res:'Dépressurisation identifiée : agir immédiatement.',scr:'ewd',items:[['Alarme cabine (attendre)',()=>!!FAIL.depress,null,null]]},
  {part:'B',ph:'Agir',t:'Masques puis descente d\'urgence',txt:'Masques équipage d\'abord (geste réel, non simulé), puis descendre vers 10 000 ft, 7700, MAYDAY.',res:'Descente d\'urgence engagée, contrôle prévenu.',scr:'pfd',items:[
   altFcu(10000),['Descente engagée',()=>(S.gam||0)<-0.03,null,null],['Transpondeur 7700',()=>String(SYS.xpdrCode)==='7700',sw('xpdrCode',7700),S_('xpdrCode')],mayday]},
  {part:'C',ph:'Stabiliser',t:'Rejoindre 10 000 ft',txt:'Vitesse sous VMO/MMO, descente jusqu\'à l\'altitude respirable.',res:'Altitude respirable atteinte.',scr:'pfd',items:[['Altitude ≤ 10 000 ft',()=>alt()<10300,null,null]]}],
 'F-ELEC':[
  {part:'A',ph:'Détecter',t:'Croisière : perte des génératrices',txt:'Les deux génératrices tombent : la RAT sort, seule la génératrice de secours alimente l\'essentiel.',res:'ELEC EMER CONFIG identifiée.',scr:'ewd',items:[['Panne GEN 1 + GEN 2 (attendre)',()=>!!(FAIL.gen1&&FAIL.gen2),null,null]]},
  {part:'B',ph:'Agir',t:'Descendre sous le FL250',txt:'L\'APU ne démarre sur batteries que sous le FL250 : descendre d\'abord.',res:'Sous le FL250 : APU démarrable.',scr:'pfd',items:[altFcu(24000),['Altitude < 25 000 ft',()=>alt()<25000,null,null]]},
  {part:'C',ph:'Stabiliser',t:'Démarrer l\'APU, rétablir l\'AC',txt:'APU MASTER, START, puis la génératrice de l\'APU rétablit l\'alternatif.',res:'Courant alternatif rétabli par l\'APU.',scr:'ewd',items:[
   ['APU MASTER SW : ON',()=>!!SYS.apuMaster,sw('apuMaster',true),S_('apuMaster')],['APU START',()=>!!(SYS.apuStart||SYS.apuAvail||SYS.apuStartBtn),sw('apuStartBtn',true),S_('apuStartBtn')],
   ['AC rétabli (APU AVAIL)',()=>!!(typeof E320!=='undefined'&&E320.anyAC),null,null]]}],
 'F-ICE':[
  {part:'A',ph:'Détecter',t:'Vitesse incohérente',txt:'La sonde Pitot du commandant givre : sa vitesse devient fausse. Comparer PFD 1, PFD 2 et l\'instrument de secours.',res:'Source de vitesse fausse identifiée.',scr:'pfd',items:[['Comparer les vitesses (PFD 1 / PFD 2)',()=>!!FAIL.pitot,null,null]]},
  {part:'B',ph:'Agir',t:'Assiette et poussée, antigivrage, commutation',txt:'Piloter à l\'assiette et à la poussée connues, mettre l\'antigivrage, remplacer la source fausse par l\'ADR 3.',res:'Vitesse fiable rétablie, antigivrage en service.',scr:'pfd',items:[
   ['Assiette ≈ 5°, poussée constante (AP OFF)',()=>!AP.on,null,null],['WING ANTI ICE : ON',()=>!!SYS.wingAI,sw('wingAI',true),S_('wingAI')],['PROBE/WINDOW HEAT : ON',()=>!!SYS.probe,sw('probe',true),S_('probe')],
   ['AIR DATA : CAPT 3',()=>SYS.airData==='CAPT 3',sw('airData','CAPT 3'),S_('airData')]]}],
 'F-TCAS':[
  {part:'A',ph:'Détecter',t:'Trafic signalé (TA)',txt:'« TRAFFIC, TRAFFIC » : repérer le trafic sur le ND, ne pas manœuvrer sur un TA.',res:'Trafic repéré.',scr:'nd',items:[['Trafic affiché (attendre)',()=>typeof TCAS!=='undefined'&&!!(TCAS.ta||TCAS.ra||L().raT),null,null]]},
  {part:'B',ph:'Agir',t:'Suivre la RA',txt:'Suivre l\'ordre (zone verte du vario) en moins de 5 s, jamais à l\'opposé ; informer le contrôle « TCAS RA ».',res:'RA suivie.',scr:'pfd',items:[['RA reçue et suivie',()=>!!L().raT,null,null]]},
  {part:'C',ph:'Stabiliser',t:'Clear of conflict',txt:'Après « CLEAR OF CONFLICT », revenir à la clairance.',res:'Conflit résolu, retour au niveau.',scr:'pfd',items:[['Fin du conflit',()=>!!L().raT&&!(typeof TCAS!=='undefined'&&TCAS.ra),null,null]]}],
 'F-LJENG':[
  {part:'A',ph:'Détecter',t:'Décollage',txt:'Le moteur gauche s\'arrête à 100 ft.',res:'Panne moteur gauche identifiée.',scr:'pfd',items:[['En vol',()=>!S.onGround,null,null],['Panne moteur gauche (attendre)',()=>!!FAIL.eng1,null,null]]},
  {part:'B',ph:'Agir',t:'Tenir V2, nettoyer',txt:'Palonnier pour la symétrie, V2, train rentré, volets rentrés à 1 000 ft.',res:'Configuration minimale de traînée.',scr:'pfd',items:[
   ['Train : RENTRÉ',()=>!S.gear,pd('gearL','UP'),P_('gearL')],['Vitesse ≥ V2',()=>cas()>=(A.V2||A.Vr+6),null,null],['Volets rentrés',()=>S.flap===0,()=>{ S.flap=0; },P_('flapL')]]},
  {part:'C',ph:'Stabiliser',t:'Monter à 1 500 ft, retour',txt:'Monter à 1 500 ft sol puis revenir se poser.',res:'1 500 ft atteints sur un moteur.',scr:'pfd',items:[['Hauteur ≥ 1 500 ft',()=>agl()>1500,null,null]]}],
 'F-H125':[
  {part:'A',ph:'Détecter',t:'Montée',txt:'La turbine s\'arrête vers 800 ft au-dessus de Manhattan.',res:'Panne moteur identifiée.',scr:'panel',items:[['Panne moteur (klaxon, attendre)',()=>!!FAIL.engH,null,null]]},
  {part:'B',ph:'Agir',t:'Autorotation',txt:'Collectif en bas IMMÉDIATEMENT pour garder le régime rotor, puis vitesse d\'autorotation.',res:'Autorotation établie.',scr:'panel',items:[
   ['Collectif EN BAS',()=>(S.coll||0)<0.15,()=>{ S.coll=0; },null],['Régime rotor dans le vert',()=>(S.nr||0)>0.95,null,null],['Vitesse ≈ 65 kt',()=>cas()>50&&cas()<85,null,null]]},
  {part:'C',ph:'Stabiliser',t:'Arrondi et posé',txt:'Arrondi vers 50 ft, puis collectif pour amortir le posé.',res:'Posé.',scr:'panel',items:[['Posé',()=>S.onGround,null,null]]}],
 'F-R44':[
  {part:'A',ph:'Détecter',t:'Croisière de nuit',txt:'Le voyant ALT s\'allume : la batterie seule alimente tout.',res:'Panne d\'alternateur identifiée.',scr:'panel',items:[['Voyant ALT (attendre)',()=>!!FAIL.genGA0,null,null]]},
  {part:'B',ph:'Agir',t:'Délester',txt:'Couper ce qui consomme sans être indispensable : le phare d\'abord.',res:'Consommation réduite.',scr:'panel',items:[['Phare d\'atterrissage : OFF',()=>!SYS.landL||SYS.landL==='OFF',sw('landL',false),S_('landL')]]},
  {part:'C',ph:'Stabiliser',t:'Se poser au plus tôt',txt:'Choisir un terrain éclairé proche et se poser avant l\'épuisement de la batterie.',res:'Posé avant la décharge.',scr:'panel',items:[['Posé',()=>S.onGround,null,null]]}],
 'F-S76':[
  {part:'A',ph:'Détecter',t:'Montée',txt:'Le moteur 1 s\'arrête à 500 ft.',res:'Panne d\'un moteur identifiée.',scr:'panel',items:[['Panne moteur 1 (attendre)',()=>!!FAIL.engH2,null,null]]},
  {part:'B',ph:'Agir',t:'Réduire la puissance demandée',txt:'Vitesse de meilleur taux, collectif raisonnable pour ne pas faire chuter le régime.',res:'Vol stabilisé sur un moteur.',scr:'panel',items:[['Vitesse ≈ 75 kt',()=>cas()>62&&cas()<90,null,null],['Collectif modéré',()=>(S.coll||0)<0.7,null,null]]},
  {part:'C',ph:'Stabiliser',t:'Poser sur un moteur',txt:'Approche plate, posé roulé si possible.',res:'Posé sur un moteur.',scr:'panel',items:[['Posé',()=>S.onGround,null,null]]}]};
const PARTS={A:'DÉTECTER',B:'AGIR',C:'STABILISER'};
function steps(id){ const st=(P[id]||[]).map(s=>Object.assign({},s,{items:s.items.map(it=>{ const c=it[1]; let done=false; return [it[0],()=>{ if(done) return true; try{ done=!!c(); }catch(e){} return done; },it[2],it[3]]; })})); return st; }
SG.steps=steps;
/* hiérarchie des scénarios pour les cadres et la bulle */
const _parts=PT.parts, _theme=PT.theme, _result=PT.result;
PT.parts=function(st){ st=st||GD.steps||[]; if(!st.length||!st[0].part) return _parts(st); const out=[]; st.forEach((s,i)=>{ let p=out.find(x=>x.k===s.part); if(!p){ p={k:s.part,n:PARTS[s.part]||s.part,d:'',i0:i,i1:i}; out.push(p); } p.i1=i; }); return out; };
PT.theme=()=>SG.on&&SCN.cur?'SCÉNARIO · '+SCN.cur.name.replace(/\s*\(.*\)$/,'').replace(/ — .*/,''):_theme();
PT.result=st=>st.res?{t:st.res,scr:st.scr||null}:_result(st);
/* exécution */
function stop(){ if(!SG.on) return; SG.on=false; SG.demo=false; GD.on=false; GD.steps=SG.prevSteps||GD.steps; const b=$('abub'); if(b) b.remove(); try{ renderGuide(); }catch(e){} }
function start(){ const id=SCN.cur.id; SG.run=SCN.t0+':'+id; SG.prevSteps=GD.steps; GD.steps=SG.steps(id); GD.i=0; GD.on=true; GD.peda=false; GD.seen=GD.seen||new Set(); AUTO.stage='act'; SG.on=true; SG.demo=false; SG.doneT=0; window.ABUB_X=false;
  try{ renderGuide(); }catch(e){} flash('Scénario guidé : suivez les cadres rouges numérotés','am'); }
SG.doNow=function(){ const st=GD.steps[GD.i]; if(!st) return; const it=st.items.find(x=>{ try{ return !x[1](); }catch(e){ return false; } }); if(it&&it[2]){ try{ it[2](); }catch(e){} } else if(it) flash('À vous : '+it[0],'am'); };
setInterval(()=>{ try{
  const active=typeof SCN!=='undefined'&&SCN.run&&!SCN.ended&&SCN.cur&&SG.steps(SCN.cur.id).length;
  if(!active){ stop(); return; }
  if(SG.run!==SCN.t0+':'+SCN.cur.id) start();
  if(paused||AUTO.on) return;
  const st=GD.steps[GD.i]; if(!st) return; const all=st.items.every(x=>{ try{ return x[1](); }catch(e){ return false; } });
  if(all){ AUTO.stage='done'; if(!SG.doneT) SG.doneT=performance.now(); if(performance.now()-SG.doneT>2200&&GD.i<GD.steps.length-1){ SG.doneT=0; AUTO.stage='act'; goStep(GD.i+1); } }
  else { AUTO.stage='act'; SG.doneT=0;
    if(SG.demo&&performance.now()-SG.lastDemo>2400){ const it=st.items.find(x=>{ try{ return !x[1](); }catch(e){ return false; } }); if(it&&it[2]){ SG.lastDemo=performance.now(); try{ it[2](); }catch(e){} } } }
}catch(e){ console.warn('scénario guidé',e); } },400);
})();
/* V7.8 — nouveaux scénarios guidés : sécurité du poste (leçons du vol 9525, sans reconstitution) et fuite carburant (fictif) ;
   cartes du menu US Airways 1549 / Germanwings 9525 / Scénario fictif activées. */
(function(){
'use strict';
const SG=window.SCNG, S_=id=>`[data-sw="${id}"]`;
SG.clicked={}; SG.flags={}; SG.stepT=0;
addEventListener('click',e=>{ const t=e.target.closest&&e.target.closest('[data-sw],[data-pd]'); if(t) SG.clicked[t.dataset.sw||t.dataset.pd]=performance.now(); },true);
setInterval(()=>{ if(SG.on&&typeof SYS!=='undefined'&&SYS.door==='UNLOCK') SG.flags.unlocked=true; },300);
setInterval(()=>{ if(!SG.on||!SCN.cur||SCN.cur.id!=='GW-ROUTE') return; const a=alt(); if(FAIL.depress&&a>1000) SG.minAlt=Math.min(SG.minAlt||99999,a); const st=GD.steps[GD.i]; if(st&&st.part==='E'&&!SG.flags.buzz){ SG.flags.buzz=true; flash('Buzzer : le commandant demande à rentrer','am'); try{ SND.play('chime'); }catch(e){} } },500);
const alt=()=>{ try{ return airdata().alt; }catch(e){ return 0; } };
const inStep=s=>()=>SG.stepT&&performance.now()-SG.stepT>s*1000;
const sw=(id,v)=>()=>{ SYS[id]=v; try{ sysEffect(id); }catch(e){} try{ a320Sync(); }catch(e){} try{ ovhSync(); }catch(e){} };
const mayday=['Prévenir le contrôle (Radio › Appeler)',()=>!!(SCN.log&&SCN.log.mayday),()=>SG.callEmer(),'#atc [data-a="call"]'];
SCNS.push(
 {id:'GW-SEC',cat:'A',ac:'a320',name:'Sécurité du poste de pilotage — leçons du vol 9525 (BEA 2016, AESA 2015)',
  context:'Module de sécurité : procédures de sortie et de retour au poste, contrôle de la porte, surveillance croisée. AUCUN élément de l\'accident n\'est rejoué, par respect pour les 150 victimes.',
  wx:'Croisière, hors nuages.',phase:'Croisière FL350, pilote automatique engagé.',triggers:'t = 0 : le commandant doit quitter le poste quelques minutes.',fails:'Aucune panne.',
  auto:'Aucun.',expected:'Faire venir un membre d\'équipage dans le poste avant de sortir (règle des deux personnes recommandée par l\'AESA en 2015), garder la porte en NORM, autoriser l\'accès au retour puis remettre en NORM, surveiller la trajectoire.',
  ref:[['Commission européenne — rapport du groupe de travail AESA sur le vol 9525 (2015)','https://transport.ec.europa.eu/news-events/news/european-aviation-commission-releases-task-forces-report-germanwings-incident-2016-09-22_en'],['BEA — « Germanwings 4U 9525: Flying With Mental Disorder », ISASI 2016','https://isasi.org/Documents/library/technical-papers/2016/Thurs/BEA_Paper-Germanwings_ISASI_2016_vf.pdf']],
  seed:9525,limit:600,base:'jfk-cdg',cruise:true,
  init(){ SG.clicked={}; SG.flags={}; SYS.door='NORM'; },
  eval(){ return [['Membre d\'équipage appelé avant la sortie',!!SG.clicked.callFwd,SG.clicked.callFwd?'oui':'non'],['Accès autorisé puis porte remise en NORM',!!SG.flags.unlocked&&SYS.door==='NORM',SYS.door],['Altitude sélectionnée conforme (FL350)',AP.alt===35000,fmt(AP.alt,0)+' ft']]; },
  debrief:'Après l\'accident, l\'AESA a recommandé en 2015 la présence permanente de deux personnes dans le poste, ainsi qu\'une évaluation psychologique des pilotes avant leur embauche. Le rapport final du BEA (mars 2016) porte surtout sur le suivi médical des pilotes et la détection des troubles psychiques. La porte blindée protège le poste ; les procédures d\'accès et la surveillance mutuelle de l\'équipage complètent cette protection.'},
 {id:'GW-ROUTE',cat:'A',ac:'a320',name:'Germanwings 9525 — parcours Barcelone → Düsseldorf, sans le crash',
  context:'Le vrai trajet du 24 mars 2015 : A320, croisière au FL380 au sud des Alpes, juste après la clairance « direct IRMAR ». Le crash n\'est pas rejoué : au moment critique du vrai vol, la situation devient une urgence de pilotage — dépressurisation rapide alors que le commandant est sorti du poste, descente d\'urgence au-dessus du relief.',
  wx:'Croisière, hors nuages.',phase:'Croisière FL380, pilote automatique engagé.',triggers:'Le commandant quitte le poste ; quelques secondes plus tard : dépressurisation rapide.',fails:'CAB PR SYS 1+2 FAULT (dépressurisation).',
  auto:'Aucun.',expected:'Règle des deux personnes avant la sortie du commandant, porte en NORM ; masques, descente d\'urgence vers l\'altitude minimale de sécurité du secteur (pas 10 000 ft au-dessus des Alpes), 7700, MAYDAY, déroutement vers Marseille ; autoriser le retour du commandant puis porte en NORM ; surveillance croisée de l\'altitude sélectionnée.',
  ref:[['BEA — rapport final D-AIPX (mars 2016), présentation','https://www.bea.aero/uploads/tx_elyextendttnews/2016_03_15_D-AIPX_Presentation_Presse_FR_06.pdf'],['Commission européenne — groupe de travail AESA sur le vol 9525 (2015)','https://transport.ec.europa.eu/news-events/news/european-aviation-commission-releases-task-forces-report-germanwings-incident-2016-09-22_en']],
  seed:9526,limit:900,base:'jfk-cdg',cruise:38000,
  init(){ SG.clicked={}; SG.flags={}; SG.minAlt=99999; SYS.door='NORM';
    Object.assign(S,{lat:43.55,lon:5.05,psi:40*D2R}); try{ STN.MARSEILLE=STN.MARSEILLE||{n:'Marseille Control',f:133.330,est:1}; ATC.curSt='MARSEILLE'; }catch(e){} AP.hdg=40; AP.lat='HDG'; AP.alt=38000; try{ fcuSync(); }catch(e){}
    SCN.trig=[{c:()=>SG.on&&GD.i===1&&SG.stepT&&performance.now()-SG.stepT>8000,f:()=>failSet('depress',true)}]; },
  eval(L){ return [['Deux personnes dans le poste avant la sortie du commandant',!!SG.clicked.callFwd,SG.clicked.callFwd?'oui':'non'],['Transpondeur 7700',String(SYS.xpdrCode)==='7700',String(SYS.xpdrCode)],['MAYDAY transmis',!!L.mayday,L.mayday?'oui':'non'],
    ['Jamais sous l\'altitude de sécurité (15 000 ft)',SG.minAlt>=15000,fmt(Math.min(SG.minAlt,alt()),0)+' ft mini'],['Retour du commandant autorisé, porte en NORM',!!SG.flags.unlocked&&SYS.door==='NORM',SYS.door]]; },
  debrief:'Le vrai vol : à 9 h 30 min 24 le commandant sort du poste ; 29 secondes plus tard l\'altitude sélectionnée passe de 38 000 ft à 100 ft, l\'avion descend en continu et percute le relief à 9 h 41 min 06 (BEA, rapport final 2016). Ici, la même situation — un pilote seul au-dessus des Alpes, une descente rapide — est traitée comme une urgence normale : une descente ne s\'arrête jamais sous l\'altitude de sécurité, et l\'altitude sélectionnée est toujours annoncée et vérifiée par l\'autre membre d\'équipage. Les recommandations du BEA portent sur le suivi médical et psychologique des pilotes ; l\'AESA avait recommandé en 2015 deux personnes en permanence dans le poste.'},
 {id:'F-FUEL',cat:'A',ac:'a320',name:'Fuite de carburant au-dessus de l\'Atlantique (fictif)',context:'Croisière transatlantique ; le carburant diminue plus vite que prévu.',wx:'Croisière.',phase:'Croisière FL350.',
  triggers:'t = 20 s : fuite de carburant (≈ 3 t/h).',fails:'FUEL F.USED/FOB DISAGREE.',auto:'Aucun.',expected:'Reconnaître l\'écart carburant, laisser X FEED fermé, prévenir le contrôle, se dérouter vers le terrain le plus proche.',seed:303,limit:900,base:'jfk-cdg',cruise:true,
  init(){ SCN.trig=[{t:20,f:()=>failSet('fuelLeak',true)}]; },
  eval(L){ return [['Contrôle prévenu',!!L.mayday,L.mayday?'oui':'non'],['X FEED resté fermé',!SYS.xfeed,SYS.xfeed?'OUVERT (aggrave la fuite)':'fermé']]; },
  debrief:'Une fuite se détecte par le suivi carburant : écart entre carburant utilisé et carburant à bord. Ouvrir l\'intercommunication (X FEED) ferait perdre aussi le carburant du côté sain.'});
const MSA=16000;   // altitude minimale de sécurité du secteur [ESTIMÉ, valeur pédagogique : sommets des Alpes du Sud jusqu'à ≈ 3 400 m + marge]
const P2={
 'GW-ROUTE':[
  {part:'A',pn:'PRÉPARER',ph:'Préparer',t:'FL380 au sud des Alpes : le commandant doit sortir',txt:'Vous êtes OPL sur le Barcelone → Düsseldorf, clairance « direct IRMAR » reçue. Le commandant doit quitter le poste quelques minutes. Règle des deux personnes : un membre d\'équipage de cabine vient dans le poste ; la porte reste en NORM.',res:'Deux personnes dans le poste, porte en NORM.',scr:'nd',items:[
   ['Appeler un PNC (interphone CALLS › FWD)',()=>!!SG.clicked.callFwd,()=>{ SG.clicked.callFwd=performance.now(); },S_('callFwd')],['COCKPIT DOOR : NORM',()=>SYS.door==='NORM',sw('door','NORM'),S_('door')]]},
  {part:'B',pn:'DÉTECTER',ph:'Détecter',t:'Le moment critique : alarme cabine',txt:'Le commandant est sorti. C\'est à ce moment que, dans le vrai vol, la descente a commencé. Ici : dépressurisation rapide. À 38 000 ft, le temps de conscience utile ne dure que quelques dizaines de secondes.',res:'Dépressurisation identifiée : masques et descente immédiate.',scr:'ewd',items:[['Alarme CAB PR (attendre)',()=>!!FAIL.depress,null,null,'ewd']]},
  {part:'C',pn:'AGIR',ph:'Agir',t:'Descente d\'urgence… au-dessus du relief',txt:'Masques équipage (geste réel, non simulé). On descend vers 10 000 ft <b>sauf si le relief l\'interdit</b> : au-dessus des Alpes, on s\'arrête à l\'altitude minimale de sécurité du secteur, ici '+MSA.toLocaleString('fr-FR')+' ft. Jamais 100 ft. Puis 7700 et MAYDAY.',res:'Descente engagée vers l\'altitude de sécurité, contrôle prévenu.',scr:'pfd',items:[
   ['FCU : altitude '+MSA.toLocaleString('fr-FR')+' ft (altitude de sécurité)',()=>AP.alt<=MSA+500&&AP.alt>=15000,()=>{ AP.alt=MSA; AP.on=true; try{ fcuSync(); }catch(e){} },'#f-alt'],['Descente engagée',()=>(S.gam||0)<-0.03||alt()<36000,null,null,'pfd'],
   ['Transpondeur 7700',()=>String(SYS.xpdrCode)==='7700',sw('xpdrCode',7700),S_('xpdrCode')],mayday]},
  {part:'D',pn:'STABILISER',ph:'Stabiliser',t:'Palier à l\'altitude de sécurité, déroutement',txt:'L\'avion se stabilise à l\'altitude de sécurité : on ne descend plus tant que le relief n\'est pas dégagé. Cap vers Marseille-Provence, au sud-ouest, où le relief permet de continuer la descente.',res:'Palier au-dessus du relief, cap vers Marseille.',scr:'nd',items:[
   ['FCU : cap 220 (Marseille)',()=>AP.lat==='HDG'&&Math.abs(((AP.hdg-220+540)%360)-180)<15,()=>{ AP.lat='HDG'; AP.hdg=220; try{ fcuSync(); }catch(e){} },'#f-hdg'],['Altitude ≤ '+(MSA+500).toLocaleString('fr-FR')+' ft, jamais sous 15 000 ft',()=>alt()<MSA+500&&SG.minAlt>=15000,null,null,'pfd']]},
  {part:'E',pn:'CONTRÔLER L\'ACCÈS',ph:'Contrôler',t:'Le commandant demande à rentrer',txt:'Le buzzer sonne : identifier le commandant (caméra, interphone), autoriser avec le sélecteur UNLOCK, puis remettre en NORM. À deux dans le poste, on refait le point.',res:'Commandant de retour, porte en NORM.',scr:'sd',items:[
   ['COCKPIT DOOR : UNLOCK (autoriser)',()=>!!SG.flags.unlocked,sw('door','UNLOCK'),S_('door')],['COCKPIT DOOR : NORM',()=>!!SG.flags.unlocked&&SYS.door==='NORM',sw('door','NORM'),S_('door')]]},
  {part:'F',pn:'SURVEILLER',ph:'Surveiller',t:'Surveillance croisée de l\'altitude sélectionnée',txt:'Chaque changement d\'altitude au FCU s\'annonce et se vérifie par l\'autre pilote : « altitude sélectionnée '+MSA.toLocaleString('fr-FR')+' — vérifié ». Une valeur sous l\'altitude de sécurité se conteste immédiatement.',res:'Altitude vérifiée à deux, trajectoire sûre.',scr:'pfd',items:[
   ['Altitude FCU ≥ altitude de sécurité',()=>AP.alt>=15000,()=>{ AP.alt=MSA; try{ fcuSync(); }catch(e){} },'#f-alt'],['Vérifier PFD et ND (6 s)',inStep(6),null,null,'nd']]}],
 'GW-SEC':[
  {part:'A',pn:'PRÉPARER',ph:'Préparer',t:'Avant de quitter le poste',txt:'Règle des deux personnes : avant de sortir, on fait venir un membre d\'équipage dans le poste. La porte reste en NORM (accès d\'urgence possible par le clavier).',res:'Deux personnes dans le poste, porte en NORM.',scr:'pfd',items:[
   ['Appeler un PNC (interphone CALLS › FWD)',()=>!!SG.clicked.callFwd,()=>{ SG.clicked.callFwd=performance.now(); try{ callChime&&0; }catch(e){} },S_('callFwd')],['COCKPIT DOOR : NORM',()=>SYS.door==='NORM',sw('door','NORM'),S_('door')]]},
  {part:'B',pn:'CONTRÔLER L\'ACCÈS',ph:'Contrôler',t:'Retour du commandant : autoriser l\'accès',txt:'Le buzzer sonne : identifier la personne (caméra, interphone), autoriser avec le sélecteur UNLOCK, puis le remettre en NORM.',res:'Accès autorisé, porte revenue en NORM.',scr:'sd',items:[
   ['COCKPIT DOOR : UNLOCK (autoriser)',()=>!!SG.flags.unlocked,sw('door','UNLOCK'),S_('door')],['COCKPIT DOOR : NORM',()=>!!SG.flags.unlocked&&SYS.door==='NORM',sw('door','NORM'),S_('door')]]},
  {part:'C',pn:'SURVEILLER',ph:'Surveiller',t:'Surveillance croisée de la trajectoire',txt:'Chaque pilote vérifie les changements faits par l\'autre : altitude sélectionnée, vitesse, cap. Une modification non annoncée se questionne immédiatement.',res:'Trajectoire conforme à la clairance.',scr:'pfd',items:[
   ['Altitude FCU conforme : FL350',()=>AP.alt===35000,()=>{ AP.alt=35000; try{ fcuSync(); }catch(e){} },'#f-alt'],['Vérifier PFD et ND (6 s)',inStep(6),null,null,'nd']]}],
 'F-FUEL':[
  {part:'A',ph:'Détecter',t:'Suivi carburant',txt:'Toutes les heures, on compare le carburant à bord au plan. Ici l\'écart grandit vite.',res:'Fuite de carburant identifiée.',scr:'ewd',items:[['Écart carburant (attendre)',()=>!!FAIL.fuelLeak,null,null,'ewd']]},
  {part:'B',ph:'Agir',t:'Procédure FUEL LEAK',txt:'Ne pas ouvrir l\'intercommunication, prévenir le contrôle, préparer le déroutement.',res:'Fuite isolée, contrôle prévenu.',scr:'sd',items:[['X FEED : FERMÉ',()=>!SYS.xfeed,sw('xfeed',false),S_('xfeed')],mayday]},
  {part:'C',ph:'Stabiliser',t:'Se dérouter',txt:'Descendre vers le terrain le plus proche (Gander, Shannon…) avec la réserve qui reste.',res:'Déroutement engagé.',scr:'nd',items:[['FCU : altitude 25 000 ft',()=>AP.alt<=25000,()=>{ AP.alt=25000; AP.on=true; try{ fcuSync(); }catch(e){} },'#f-alt']]}]};
const _steps=SG.steps; SG.steps=id=>{ if(!P2[id]) return _steps(id); return P2[id].map(s=>Object.assign({},s,{items:s.items.map(it=>{ const c=it[1]; let done=false; return [it[0],()=>{ if(done) return true; try{ done=!!c(); }catch(e){} return done; },it[2],it[3],it[4]]; })})); };
// les procédures de P2 doivent aussi être reconnues comme « scénario guidé »
const _parts=PT.parts; PT.parts=function(st){ st=st||GD.steps||[]; const out=_parts(st); if(st.length&&st[0].pn) out.forEach(p=>{ const s=st[p.i0]; if(s&&s.pn) p.n=s.pn; }); return out; };
// chronomètre d'étape pour les vérifications temporisées
let lastI=-1; setInterval(()=>{ if(SG.on&&GD.i!==lastI){ lastI=GD.i; SG.stepT=performance.now(); } if(!SG.on) lastI=-1; },200);
// cartes du menu
const MAP={'sc-1549':'US1549','sc-9525':'GW-ROUTE','sc-fict':'F-FUEL'};
const fix=()=>{ if(typeof MISSIONS==='undefined') return; MISSIONS['sc-1549'].soon=false; MISSIONS['sc-1549'].d='Amerrissage sur l\'Hudson (2009) : scénario guidé, étapes encadrées.';
  MISSIONS['sc-9525'].soon=false; MISSIONS['sc-9525'].n='Germanwings 9525 · Barcelone → Düsseldorf'; MISSIONS['sc-9525'].d='Le vrai trajet au FL380 au-dessus des Alpes, sans le crash : la partie critique devient une urgence (commandant hors du poste, dépressurisation, descente d\'urgence au-dessus du relief).';
  MISSIONS['sc-fict'].soon=false; MISSIONS['sc-fict'].n='Scénario fictif · fuite carburant A320'; MISSIONS['sc-fict'].d='Croisière JFK → Paris : fuite de carburant, procédure et déroutement guidés.'; };
fix(); try{ renderMenu(); }catch(e){}
const goB=$('go'), _go=goB.onclick; goB.onclick=function(){ const id=MAP[selMI]; if(id){ $('menu').hidden=true; paused=false; scnStart(id); try{ SCN.view='run'; scnOpen(true,'run'); }catch(e){} return; } return _go.apply(this,arguments); };
})();
