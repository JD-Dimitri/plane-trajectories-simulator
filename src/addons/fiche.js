/* ===== V10.38 (F9) : fiche détaillée de CHAQUE étape, même méthode partout, pour les 7 appareils =====
   Pour chaque étape : 1. pourquoi · 2. ce que le pilote contrôle · 3. anomalies ou erreurs à repérer (gravité) · 4. que faire ·
   5. documents à remplir · 6. ce que le simulateur simule · 7. questions de fin d'étape.
   Tour avion / hélicoptère : chaque point de contrôle a sa propre fiche (contrôles, anomalies illustrées, conduite à tenir) et une anomalie
   peut être tirée au hasard : décision du pilote, entrée au compte rendu matériel, retard affiché au tableau des départs.
   Contenu : synthèse pédagogique [ESTIMÉ] fondée sur des textes publics (FAA-H-8083-3C Airplane Flying Handbook, FAA-H-8083-25C,
   manuels de vol publics des appareils légers, EASA Part-CAT / Part-NCO / Part-ORO / Part-M, règlement (UE) 376/2014).
   Les illustrations sont des DESSINS [SIMULÉ], pas des photos. Les durées de retard sont des ordres de grandeur [ESTIMÉ].
   Il ne remplace ni le manuel de vol, ni le manuel d'exploitation, ni la formation. */
(function(){
if(typeof GD==='undefined'||typeof WALKPTS==='undefined') return;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const K=()=>(typeof ACK!=='undefined'&&ACK)||'a320';
const CLUB=()=>['c172','r44'].includes(K());            // aéroclub / vol privé ; sinon exploitation commerciale
const HELI=()=>typeof A!=='undefined'&&A&&A.kind!=='fw';
const G={ok:['Acceptable','#3ddc84'],sig:['À signaler','#ffb020'],stop:['Vol interdit en l\'état','#ff4a3d']};
const docTxt=d=>typeof d==='string'?d:(CLUB()?d.club:d.pro);

/* ---------- illustrations dessinées (SVG) ---------- */
const svg=(body,cap)=>`<figure class="fi-fig"><svg viewBox="0 0 160 96" role="img" aria-label="${esc(cap)}">${body}</svg><figcaption>${esc(cap)} · <i>dessin [SIMULÉ], pas une photo</i></figcaption></figure>`;
const FIG={
 tyre:()=>svg(`<circle cx="80" cy="50" r="40" fill="#222" stroke="#555" stroke-width="3"/><circle cx="80" cy="50" r="18" fill="#8a949c"/><path d="M52 22 q10 -6 22 -4" stroke="#d8c39a" stroke-width="5" fill="none"/><path d="M50 30 l10 4 M56 24 l8 6" stroke="#d8c39a" stroke-width="2"/><text x="110" y="18" fill="#ff4a3d" font-size="10">toile visible</text><path d="M108 20 L72 22" stroke="#ff4a3d"/>`,'Pneu usé jusqu\'à la toile'),
 brake:()=>svg(`<rect x="30" y="30" width="100" height="40" rx="6" fill="#59636b"/><rect x="62" y="14" width="10" height="18" fill="#c7cdd2"/><rect x="92" y="26" width="10" height="6" fill="#c7cdd2"/><text x="44" y="88" fill="#e8eef2" font-size="9">neuf : témoin sorti</text><text x="96" y="12" fill="#ff4a3d" font-size="9">usé : affleurant</text>`,'Témoin d\'usure de frein'),
 fan:()=>svg(`<circle cx="80" cy="48" r="42" fill="#11161b" stroke="#9aa5ae" stroke-width="3"/>${[...Array(12)].map((_,i)=>`<path d="M80 48 L${80+40*Math.cos(i*.5236)} ${48+40*Math.sin(i*.5236)}" stroke="#b7c0c7" stroke-width="5"/>`).join('')}<circle cx="80" cy="48" r="9" fill="#dfe5ea"/><path d="M112 30 l6 -3 l-2 7z" fill="#ff4a3d"/><text x="118" y="22" fill="#ff4a3d" font-size="9">entaille</text>`,'Aube de soufflante endommagée (corps étranger)'),
 pitot:()=>svg(`<rect x="20" y="40" width="70" height="10" rx="5" fill="#c7cdd2"/><rect x="70" y="36" width="34" height="18" rx="3" fill="#d22"/><path d="M104 45 q20 4 30 30" stroke="#d22" stroke-width="6" fill="none"/><text x="100" y="92" fill="#fff" font-size="8">REMOVE BEFORE FLIGHT</text>`,'Cache de sonde pitot non retiré'),
 leak:()=>svg(`<rect x="10" y="14" width="140" height="26" fill="#6d7880"/><path d="M60 40 q4 10 0 14 q-4 -4 0 -14z M84 40 q4 14 0 20 q-4 -6 0 -20z M100 40 q3 8 0 11 q-3 -3 0 -11z" fill="#c9a227"/><ellipse cx="82" cy="86" rx="30" ry="5" fill="#c9a22766"/><text x="20" y="72" fill="#ffb020" font-size="9">gouttes / flaque</text>`,'Fuite (hydraulique, carburant ou huile)'),
 dent:()=>svg(`<path d="M10 70 Q80 -10 150 70 Z" fill="#e6ebef"/><path d="M70 30 q10 8 20 0" stroke="#7a8288" stroke-width="3" fill="none"/><path d="M76 26 l-4 -6 M86 25 l3 -6" stroke="#a33" stroke-width="2"/><text x="96" y="20" fill="#ff4a3d" font-size="9">impact, plumes</text>`,'Impact d\'oiseau ou bosse'),
 frost:()=>svg(`<path d="M5 60 L150 40 L150 52 L5 72 Z" fill="#b9c4cc"/>${[...Array(18)].map((_,i)=>`<circle cx="${12+i*8}" cy="${58-i*1.1}" r="2.2" fill="#fff"/>`).join('')}<text x="20" y="90" fill="#9fd8ff" font-size="9">givre / neige sur l'extrados</text>`,'Contamination de l\'aile (givre, neige)'),
 discharger:()=>svg(`<path d="M10 40 L150 40 L150 56 L10 56 Z" fill="#c7cdd2"/><path d="M40 56 l-4 16 M70 56 l-4 16" stroke="#333" stroke-width="3"/><path d="M100 56 l-4 6" stroke="#333" stroke-width="3"/><text x="96" y="84" fill="#ffb020" font-size="9">déperditeur cassé</text>`,'Déperditeur d\'électricité statique manquant'),
 light:()=>svg(`<path d="M10 50 L140 40 L150 50 L140 60 Z" fill="#c7cdd2"/><circle cx="142" cy="50" r="7" fill="#333" stroke="#666"/><path d="M130 34 l24 32" stroke="#ff4a3d" stroke-width="2"/><text x="20" y="84" fill="#ffb020" font-size="9">feu de navigation éteint</text>`,'Feu de navigation inopérant'),
 fuelwater:()=>svg(`<path d="M60 12 L100 12 L96 84 L64 84 Z" fill="#9fd8ff33" stroke="#9fd8ff"/><rect x="63" y="36" width="34" height="36" fill="#4aa3ff88"/><circle cx="74" cy="78" r="5" fill="#e8f6ff"/><circle cx="86" cy="79" r="4" fill="#e8f6ff"/><text x="104" y="80" fill="#ff4a3d" font-size="9">eau au fond</text><text x="104" y="50" fill="#9fd8ff" font-size="9">100LL bleue</text>`,'Purge carburant : eau dans l\'échantillon'),
 oil:()=>svg(`<rect x="74" y="6" width="8" height="84" fill="#c7cdd2"/><rect x="74" y="64" width="8" height="26" fill="#a07a1a"/><path d="M70 30 h16 M70 44 h16" stroke="#e8eef2"/><text x="92" y="32" fill="#e8eef2" font-size="9">MAX</text><text x="92" y="46" fill="#e8eef2" font-size="9">MIN</text><text x="92" y="76" fill="#ff4a3d" font-size="9">niveau bas</text>`,'Jauge d\'huile sous le minimum'),
 prop:()=>svg(`<ellipse cx="80" cy="48" rx="70" ry="9" fill="#2a2f33"/><circle cx="80" cy="48" r="10" fill="#dfe5ea"/><path d="M128 42 l5 4 l-5 3z" fill="#ff4a3d"/><text x="112" y="30" fill="#ff4a3d" font-size="9">entaille</text>`,'Entaille au bord d\'attaque de l\'hélice'),
 nest:()=>svg(`<rect x="20" y="20" width="120" height="60" rx="10" fill="#3a434a"/><ellipse cx="80" cy="56" rx="28" ry="12" fill="#8a6a3a"/><path d="M58 52 q22 -10 44 0 M60 58 q20 -8 40 0" stroke="#b8925a"/><text x="30" y="16" fill="#ffb020" font-size="9">nid dans le capot / la prise d'air</text>`,'Nid d\'oiseau dans le capot moteur'),
 blade:()=>svg(`<path d="M4 46 L156 40 L156 52 L4 54 Z" fill="#c7cdd2"/><path d="M110 41 l6 5 l-6 6" stroke="#ff4a3d" stroke-width="2" fill="none"/><path d="M60 44 h22" stroke="#7a8288" stroke-dasharray="3 2"/><text x="96" y="74" fill="#ff4a3d" font-size="9">choc / délaminage</text>`,'Pale de rotor endommagée'),
 lock:()=>svg(`<rect x="40" y="30" width="80" height="12" rx="6" fill="#444"/><rect x="74" y="20" width="12" height="44" fill="#d22"/><text x="30" y="84" fill="#ff4a3d" font-size="9">blocage de commandes en place</text>`,'Blocage des commandes ou attaches non retirés'),
 door:()=>svg(`<rect x="30" y="14" width="100" height="68" rx="8" fill="#e6ebef"/><rect x="60" y="24" width="40" height="50" rx="4" fill="#cfd6db" stroke="#ff4a3d" stroke-width="2"/><path d="M100 34 l10 -6" stroke="#ff4a3d" stroke-width="2"/><text x="40" y="94" fill="#ffb020" font-size="9">trappe ou porte mal verrouillée</text>`,'Trappe ou porte non verrouillée')
};

/* ---------- fiches des points du tour (par mots-clés : valables pour les 7 appareils) ---------- */
const DOC_ANO={pro:'Entrée au compte rendu matériel (CRM / tech log, Part-M M.A.306) par le commandant de bord ; la maintenance (contrôle maintenance, mécanicien de piste) décide : réparation, report selon la liste minimale d\'équipements (MEL, Part-ORO ORO.MLR.105) avec affichette, ou immobilisation. Le mécanicien signe l\'approbation pour remise en service (APRS) avant le départ.',
  club:'Inscription dans le carnet de route de l\'appareil (rubrique observations) et information immédiate du mécanicien ou du chef pilote de l\'aéroclub ; l\'appareil est marqué indisponible sur le planning tant qu\'il n\'est pas remis en service. En vol privé, le pilote ne part pas avec un doute.'};
const SIM=(delay,opts,ok,res,fig)=>({delay,opts,ok,res,fig});
const WP=[
 [/Cabine/i,{check:['Documents de bord présents : certificats d\'immatriculation et de navigabilité, licence radio, manuel de vol, carnet de route, assurance','Magnétos sur OFF et clé retirée avant de toucher l\'hélice','MASTER ON : lecture des jauges carburant, sortie des volets pour la visite, puis MASTER OFF','Blocage des commandes retiré ; robinet carburant sur BOTH'],
  ano:[['Document de bord manquant ou périmé','stop','Le vol n\'est pas autorisé sans les documents obligatoires : prévenir l\'aéroclub.','door'],['Blocage des commandes laissé en place','stop','Le retirer ; ne jamais décoller sans vérifier que les commandes sont libres et dans le bon sens.','lock',SIM(5,['Le retirer, contrôler les commandes libres et dans le bon sens','Le laisser, il sera retiré au point d\'arrêt','Décoller : les commandes se libèrent en vol'],0,'Blocage retiré, commandes contrôlées libres et dans le bon sens. Aucun retard notable.')]]}],
 [/monter à bord/i,{check:['Tour complet terminé dans l\'ordre','Toutes les anomalies vues ont été signalées et traitées','Escalier, passerelle ou marchepied en place'],ano:[['Anomalie vue mais non signalée','stop','Toute anomalie se signale avant le départ, même si elle paraît mineure.']]}],
 [/Moteur|Réacteur|hélice|Capots moteur/i,{check:['Entrée d\'air dégagée, pas de corps étranger ni de nid','Soufflante ou hélice : aubes et pales sans entaille ni fissure','Capots fermés et verrouillés ; inverseur rangé','Pas de fuite d\'huile ni de carburant ; niveau d\'huile selon le manuel de vol'],
  ano:[['Aube de soufflante entaillée (ingestion d\'un corps étranger)','stop','Maintenance : mesure du dommage selon les limites du manuel d\'entretien (réparation par meulage ou dépose du moteur).','fan',SIM(70,['Signaler à la maintenance : entrée au compte rendu matériel','Démarrer pour voir si le moteur vibre','Rien : les aubes supportent les petits chocs'],0,'Mesure du dommage par la maintenance : réparation dans les limites, contrôle signé. Départ retardé d\'environ 1 h.')],
   ['Entaille au bord d\'attaque de l\'hélice','stop','Pas de vol : le mécanicien juge si l\'entaille peut être reprise dans les tolérances.','prop',SIM(40,['Ne pas voler et prévenir le mécanicien','Poncer soi-même l\'entaille','Voler doucement, à régime réduit'],0,'Entaille reprise par le mécanicien dans les tolérances, carnet de route renseigné. Vol retardé.')],
   ['Nid d\'oiseau dans le capot ou la prise d\'air','stop','Retirer et faire contrôler : risque de feu et d\'obstruction.','nest'],
   ['Huile sous le minimum','sig','Compléter avec l\'huile prescrite avant le vol et noter l\'appoint.','oil',SIM(10,['Compléter avec l\'huile prescrite et noter l\'appoint','Partir : le minimum suffit pour un tour de piste','Mettre n\'importe quelle huile disponible'],0,'Appoint d\'huile réalisé avec l\'huile prescrite, noté au carnet. Léger retard.')]]}],
 [/Nez|radôme|verrière|pare-brise/i,{check:['Radôme ou verrière : fissures, impacts, rivets','Sondes pitot, statiques et d\'incidence : caches retirés, propres, sans dommage','Essuie-glaces rangés, phares en état','Antennes présentes et intactes'],
  ano:[['Cache de sonde pitot non retiré','sig','Le retirer, vérifier la sonde ; un pitot obstrué fausse l\'anémomètre (cause d\'accidents graves).','pitot',SIM(5,['Retirer le cache et contrôler la sonde','Laisser le cache : le réchauffage pitot le fera tomber','Partir et surveiller la vitesse en vol'],0,'Cache retiré et rangé, sonde propre. Contrôle croisé des vitesses prévu au décollage.')],
   ['Impact d\'oiseau sur le radôme (bosse, traces, plumes)','stop','Ne pas partir : inspection par la maintenance (le radar et les sondes peuvent être touchés) ; notification d\'événement (règlement (UE) 376/2014).','dent',SIM(55,['Signaler au commandant et à la maintenance, entrée au compte rendu matériel','Nettoyer les traces et partir','Signaler seulement à l\'arrivée'],0,'Inspection du radôme par la maintenance : dommage dans les tolérances, entrée au compte rendu matériel clôturée et APRS signée. Départ retardé.')]]}],
 [/Train|roues|patins/i,{check:['Pneus : usure, coupures, corps étrangers, gonflage (aspect)','Freins : témoins d\'usure, fuite hydraulique','Amortisseurs : sortie normale, pas de fuite','Goupilles de train et de remorquage retirées ; puits de train dégagés'],
  ano:[['Pneu usé jusqu\'à la toile, ou coupure profonde','stop','Remplacement du pneu par la maintenance avant le vol.','tyre',SIM(50,['Signaler : entrée au compte rendu matériel et remplacement du pneu','Partir, le pneu tiendra pour un vol','Regonfler le pneu soi-même'],0,'Roue remplacée par la maintenance (environ 45 min), entrée clôturée, APRS signée. Départ retardé.')],
   ['Témoin d\'usure de frein affleurant','stop','Frein en limite d\'usure : remplacement par la maintenance.','brake'],
   ['Fuite hydraulique au niveau d\'un frein ou d\'un amortisseur','sig','Signaler : la maintenance évalue le débit de fuite selon le manuel d\'entretien.','leak']]}],
 [/Aile|saumon|réservoir/i,{check:['Bord d\'attaque, becs : impacts, bosses','Volets, ailerons, spoilers : libres, sans dommage, charnières','Feux de navigation (rouge à gauche, vert à droite) et anticollision','Déperditeurs d\'électricité statique ; bouchons et purges carburant','Givre, neige ou glace sur les surfaces'],
  ano:[['Givre, neige ou glace adhérant aux ailes','stop','Dégivrage et antigivrage obligatoires avant le décollage (concept « avion propre », EASA CAT.OP.MPA.250).','frost',SIM(35,['Demander le dégivrage et l\'antigivrage','Décoller vite, le givre partira avec la vitesse','Balayer à la main une partie de l\'aile'],0,'Dégivrage et antigivrage effectués (environ 30 min), temps de protection noté. Départ retardé.')],
   ['Feu de navigation inopérant','sig','Signaler : selon la MEL, vol de jour possible avec report, vol de nuit interdit.','light',SIM(25,['Signaler : la maintenance remplace la lampe ou reporte selon la MEL','Partir : c\'est un feu, pas un moteur','Le noter seulement à l\'arrivée'],0,'Lampe remplacée par la maintenance, entrée clôturée. Départ retardé.')],
   ['Déperditeur statique manquant ou cassé','sig','La liste de déviations de configuration (CDL) fixe combien peuvent manquer ; au-delà, réparation.','discharger'],
   ['Eau ou impuretés dans la purge carburant','stop','Purger jusqu\'à obtenir un carburant propre ; si l\'eau persiste, ne pas partir et prévenir le mécanicien.','fuelwater',SIM(15,['Purger jusqu\'à un échantillon propre, sinon ne pas partir','Partir : un peu d\'eau ne gêne pas le moteur','Remettre l\'échantillon dans le réservoir'],0,'Plusieurs purges jusqu\'à un carburant propre et bleu (100LL). Noté au carnet de route.')]]}],
 [/Empennage|Cône de queue|APU|Poutre|rotor de queue|anticouple/i,{check:['Gouvernes de profondeur et de direction : libres, charnières, compensateurs','Feu de queue, anticollision ; échappement d\'APU dégagé','Hélicoptère : rotor de queue, boîte de transmission arrière (niveau d\'huile), arbre, poutre sans fissure','Attaches et blocages de gouvernes retirés'],
  ano:[['Fissure ou criques sur la poutre ou un raccord','stop','Immobilisation : contrôle structural par la maintenance.','dent'],['Blocage de gouverne ou attache non retiré','stop','Le retirer et vérifier le débattement complet.','lock']]}],
 [/Tête rotor|Rotor/i,{check:['Pales : chocs, érosion, délaminage, protection de bord d\'attaque','Moyeu, amortisseurs, biellettes de pas : fixations, jeu, fuites','Plateau cyclique : biellettes et goupilles'],
  ano:[['Pale de rotor endommagée (choc, délaminage)','stop','Pas de vol : inspection par la maintenance selon le manuel d\'entretien.','blade',SIM(60,['Ne pas voler : prévenir la maintenance, entrée au compte rendu','Voler sans dépasser la vitesse de croisière','Rien : les pales sont prévues pour'],0,'Pale inspectée par la maintenance : dommage dans les tolérances, réparé et contrôlé. Départ retardé.')]]}],
 [/Fuselage|Côté|Porte L1|prises statiques|Réservoirs, train|Coffres/i,{check:['Revêtement : bosses, rivets, peinture écaillée inhabituelle','Prises statiques propres et non obstruées','Trappes de service et portes cargo fermées et verrouillées','Antennes présentes'],
  ano:[['Trappe de service ou porte cargo non verrouillée','sig','La faire fermer et vérifier le verrouillage (voyant ou repère) ; noter si la trappe est endommagée.','door',SIM(10,['La faire fermer et contrôler son verrouillage','Partir : elle se plaquera en vol','Fermer seulement en cas d\'alarme'],0,'Trappe fermée et verrouillée par l\'agent de piste, contrôle visuel fait. Léger retard.')],
   ['Fuite sous le fuselage (traînée, gouttes)','sig','Signaler : identification du fluide et décision de la maintenance.','leak']]}],
];
const wpOf=title=>{ for(const [re,f] of WP) if(re.test(title)) return f; return null; };

/* ---------- fiches de CHAQUE étape (par mots-clés du titre : valables pour les 7 appareils) ---------- */
const F=[
 [/Briefing|dossier de vol/i,()=>({why:'Partir en connaissant la météo, les restrictions (NOTAM), la route, l\'état de l\'appareil et les alternatives : la plupart des accidents commencent par une préparation incomplète.',
   check:['METAR / TAF de départ, destination et dégagement ; cartes TEMSI et WINTEM','NOTAM : pistes ou aides fermées, zones actives','Plan de vol (OACI) déposé si nécessaire ; créneau de départ','État technique de l\'appareil (compte rendu matériel, carnet de route)','Masse, carburant, performances (étapes suivantes)'],
   ano:[['Météo sous les minima à destination ou au dégagement','stop','Retarder, changer de dégagement ou annuler.'],['NOTAM : piste prévue fermée','sig','Recalculer les performances sur une autre piste ou changer d\'horaire.'],['Pilote fatigué, malade, sous médicament','stop','Ne pas voler (performance humaine : « IMSAFE »).']],
   doc:{pro:'Dossier de vol signé par le commandant de bord : OFP (plan de vol exploitation), plan de vol OACI, météo, NOTAM, NOTOC.',club:'Préparation dans le dossier de l\'aéroclub : météo, NOTAM (SOFIA), log de navigation ; réservation de l\'avion.'},
   sim:'Dossier de vol avec 19 documents (METAR, TAF, TEMSI, NOTAM, OFP…), modifiables et téléchargeables.',
   q:[['Le TAF de destination annonce des orages au moment de l\'arrivée. Que fait le pilote ?',['Il prévoit un dégagement et du carburant supplémentaire, voire retarde','Il ignore le TAF : seul le METAR compte','Il part plus vite pour arriver avant'],0,'Le TAF sert justement à prévoir : dégagement adapté, carburant supplémentaire ou report.']]})],
 [/Devis de masse|centrage/i,()=>({why:'Un appareil trop lourd ou mal centré décolle mal, monte mal, peut devenir instable ou incontrôlable.',
   check:['Masse à vide de base, équipage, passagers (masses réelles ou forfaitaires), bagages, carburant','Masses au décollage et à l\'atterrissage comparées aux maximums certifiés','Centrage dans l\'enveloppe du manuel de vol'],
   ano:[['Masse au décollage au-dessus du maximum','stop','Réduire la charge (bagages, passagers) ou le carburant si la marge le permet.'],['Centrage hors limites','stop','Déplacer la charge (soute, sièges) jusqu\'à revenir dans l\'enveloppe.']],
   doc:{pro:'Devis de masse et centrage (loadsheet) signé par le commandant de bord, avec les modifications de dernière minute (LMC).',club:'Feuille de masse et centrage du manuel de vol, gardée avec le dossier de vol.'},
   sim:'Calcul papier interactif (ZFW, TOW, LW, centrage) et document « devis de masse et centrage ».',
   q:[['Masse à vide 700 kg, pilote 80 kg, passager 75 kg, carburant 100 kg, maximum 1 043 kg. Combien de bagages au maximum ?',['88 kg','103 kg','343 kg'],0,'700 + 80 + 75 + 100 = 955 kg ; 1 043 − 955 = 88 kg [CALCULÉ], à condition que le centrage reste dans l\'enveloppe.']]})],
 [/Bilan carburant/i,()=>({why:'La panne sèche reste une cause d\'accident évitable : le carburant se calcule, se vérifie et se surveille.',
   check:['Carburant de roulage, d\'étape, réserve de route, dégagement, réserve finale, supplément du commandant','Carburant réellement à bord (jauges et contrôle visuel ou bon d\'avitaillement)'],
   ano:[['Carburant à bord inférieur au minimum calculé','stop','Compléter l\'avitaillement avant le départ.'],['Écart entre jauges et quantité avitaillée','sig','Contrôler (jaugeage manuel, bon d\'avitaillement) et signaler.']],
   doc:{pro:'Bilan carburant de l\'OFP signé ; bon d\'avitaillement ; quantité reportée au compte rendu matériel.',club:'Log de navigation (consommation horaire), carnet de route (carburant au départ).'},
   sim:'Calcul du bilan carburant et de la réserve ; contrôle en croisière (étape « Croisière »).',
   q:[['Réserve finale d\'un avion à turbine en transport public (EASA) :',['30 min d\'attente à 1 500 ft','10 min','Aucune : le dégagement suffit'],0,'Réserve finale de 30 min à 1 500 ft au-dessus de l\'aérodrome pour les avions à turbine (CAT.OP.MPA.181).']]})],
 [/Arrivée au parking/i,()=>({why:'Arriver à l\'appareil en sécurité sur une aire où circulent véhicules, avions et réacteurs en marche.',
   check:['Gilet haute visibilité, badge, trajet piéton balisé','Environnement de l\'appareil : véhicules, cales, cônes, câble du groupe de parc (GPU)','Aucun moteur ni rotor en marche à proximité'],
   ano:[['Moteur ou rotor en marche sur le poste voisin','sig','Rester hors des zones dangereuses (souffle, aspiration, rotor) ; contourner.']],doc:'Aucun document ; le tour commence.',sim:'Marche à pied autour de l\'appareil, objets solides.',q:[]})],
 [/Tour (avion|hélicoptère)/i,()=>({why:'Vérifier de ses yeux que l\'appareil est en état de voler : c\'est souvent ici que l\'on découvre ce qu\'aucun instrument ne montre (cache oublié, pneu, fuite, givre).',
   check:['Sens horaire, en partant du nez, point par point (pastilles numérotées)','Chaque point : voir la fiche du point dans la boîte jaune'],
   ano:[['Une anomalie relevée sur un point','sig','Voir la fiche du point : gravité, conduite à tenir, document à remplir.']],
   doc:DOC_ANO,sim:'Anomalies tirées au hasard (réglage ci-dessous) : décision, entrée au compte rendu matériel, retard au tableau des départs.',
   q:[['Vous trouvez une petite bosse sur le bord d\'attaque, sans savoir si elle est acceptable. Que faites-vous ?',['Je la signale : c\'est la maintenance qui décide','Je pars : c\'est petit','Je la prends en photo pour plus tard'],0,'Le pilote constate et signale ; la décision de navigabilité appartient à la maintenance (et, en aéroclub, au mécanicien).']]})],
 [/cold & dark|Monter à bord/i,()=>({why:'Prendre place et vérifier l\'état du poste avant toute mise sous tension.',
   check:['Frein de parc serré ; tous les interrupteurs dans la position prévue','Documents de bord et équipements de secours (extincteur, lampe, gilets)','Réglage du siège, des palonniers, harnais'],
   ano:[['Équipement de secours absent ou périmé','sig','Le faire remplacer ; certains sont obligatoires pour le départ (liste MEL / exigences d\'équipement).']],
   doc:{pro:'Vérification du compte rendu matériel à bord : entrées ouvertes, reports MEL, APRS.',club:'Carnet de route : dernières observations, potentiel moteur, prochaine visite.'},sim:'Poste « cold & dark » : tout est éteint.',q:[]})],
 [/Alimentation|batteries/i,()=>({why:'Mettre l\'appareil sous tension dans le bon ordre, sans endommager les équipements et sans risque d\'incendie.',
   check:['Tension des batteries suffisante','Source extérieure (GPU) ou APU disponible','Voyants et alarmes testés'],
   ano:[['Tension batterie trop basse','sig','Ne pas démarrer l\'APU ou le moteur sur la batterie : source extérieure ou signalement.'],['Odeur de brûlé ou fumée','stop','Couper l\'alimentation, évacuer si nécessaire, signaler.']],
   doc:DOC_ANO,sim:'Panneau électrique fonctionnel ; actions incohérentes signalées en jaune puis en rouge.',q:[['Une batterie affiche une tension trop basse avant le démarrage de l\'APU. Que faites-vous ?',['Je demande une source extérieure ou je signale','Je démarre quand même','Je coupe et rallume pour voir'],0,'Un démarrage sur batterie faible peut échouer ou endommager l\'équipement.']]})],
 [/ADIRS|AHRS|Centrales/i,()=>({why:'Les centrales donnent l\'attitude, le cap et la position : elles doivent être alignées, appareil immobile, avant tout déplacement.',
   check:['Sélecteurs sur NAV ; position entrée ou confirmée','Appareil immobile pendant l\'alignement','Fin d\'alignement (voyants)'],
   ano:[['Alignement interrompu (appareil bougé)','sig','Recommencer l\'alignement : départ retardé de la durée d\'alignement.'],['Centrale en panne','sig','Report selon la MEL si possible, sinon maintenance.']],
   doc:DOC_ANO,sim:'Alignement des centrales avec durée [ESTIMÉ].',q:[]})],
 [/Feux, consignes|Alimentation et feux/i,()=>({why:'Rendre l\'appareil visible et préparer la cabine et le carburant avant la mise en route.',
   check:['Feux de navigation et anticollision selon la phase','Consignes lumineuses (ceintures, interdiction de fumer)','Pompes carburant et répartition'],
   ano:[['Feu anticollision inopérant','stop','Il doit fonctionner pour la mise en route et le vol (sauf tolérance MEL précise).']],doc:DOC_ANO,sim:'Interrupteurs reliés aux feux visibles de l\'extérieur.',q:[]})],
 [/FMS|Performances \(calcul/i,()=>({why:'Préparer la navigation et les vitesses de décollage : une erreur d\'entrée de données (masse, piste, température) peut provoquer un décollage trop court.',
   check:['Route, départ (SID), niveau de croisière','Masse et centrage, température, vent, état de piste','V1, VR, V2 et poussée réduite ; contrôle croisé par les deux pilotes'],
   ano:[['Masse saisie très différente du devis de masse','stop','Corriger et recalculer les vitesses : contrôle croisé obligatoire.'],['Piste changée par la tour','sig','Recalculer les performances avant d\'accepter.']],
   doc:{pro:'Carte de décollage ou feuille de performances ; vitesses notées et annoncées au briefing.',club:'Distances de décollage et d\'atterrissage calculées avec les abaques du manuel de vol.'},sim:'Initialisation du FMS et calcul des vitesses.',
   q:[['Vous saisissez une masse inférieure de 20 t à la réalité. Risque ?',['Vitesses trop faibles : rotation trop tôt, queue qui touche, montée insuffisante','Aucun','Consommation plus faible'],0,'Les vitesses calculées sont trop basses : erreur connue à l\'origine d\'accidents et d\'incidents.']]})],
 [/Before Start|Avant la mise en route/i,()=>({why:'Vérifier, dans l\'ordre de la check-list, que tout est prêt avant de démarrer.',
   check:['Lecture de la check-list « défi – réponse »','Portes fermées, cales et personnel dégagés, feu anticollision','Clairance de mise en route et de repoussage'],
   ano:[['Ligne de check-list sautée','sig','Reprendre la check-list depuis la ligne manquée.']],doc:'Aucun document : la check-list se lit et s\'annonce.',sim:'Check-list cliquable, lignes vertes et rouges.',q:[]})],
 [/Démarrage|Mise en route du moteur|Embrayage/i,()=>({why:'Démarrer sans endommager le moteur et en s\'assurant que personne n\'est près de l\'hélice, des entrées d\'air ou du rotor.',
   check:['Zone dégagée (« Dégagé hélice ! »)','Paramètres pendant le démarrage : température des gaz (EGT / TOT), régime, pression d\'huile','Pression d\'huile dans le vert dans le délai du manuel de vol'],
   ano:[['Température des gaz qui dépasse la limite (démarrage chaud)','stop','Interrompre le démarrage selon la procédure ; signaler (contrôle moteur).'],['Pas de pression d\'huile dans le délai','stop','Arrêter le moteur immédiatement et signaler.'],['Moteur qui ne démarre pas','sig','Respecter les temps de refroidissement du démarreur ; signaler après le nombre d\'essais prévu.']],
   doc:DOC_ANO,sim:'Séquences de démarrage (FADEC, turbine, piston avec primer et magnétos) et pannes associées.',
   q:[['Pendant le démarrage d\'un réacteur, la température des gaz monte très vite vers la limite. Que faites-vous ?',['J\'interromps le démarrage selon la procédure et je signale','J\'attends, elle va redescendre','J\'augmente la poussée'],0,'Un démarrage chaud peut détruire la turbine : on interrompt et on signale.']]})],
 [/Après (la )?mise en route|Roulage vers|roulage sur les vraies voies/i,()=>({why:'Rouler en sécurité jusqu\'au point d\'arrêt : les incursions de piste font partie des risques majeurs.',
   check:['Clairance de roulage collationnée, carte d\'aérodrome sous les yeux','Essai des freins au début du roulage','Vitesse adaptée ; arrêt avant toute barre d\'arrêt et point d\'arrêt'],
   ano:[['Doute sur l\'itinéraire','sig','S\'arrêter et demander au contrôle : ne jamais deviner.'],['Barre d\'arrêt allumée','stop','Ne jamais la franchir sans clairance explicite.']],
   doc:'Aucun document ; un incident (incursion) fait l\'objet d\'un compte rendu d\'événement.',sim:'Roulage sur les vraies voies de JFK, CDG, Toussus.',q:[['Au point d\'arrêt, la barre d\'arrêt rouge est allumée, mais la tour vous a dit « alignez-vous ». Que faites-vous ?',['Je m\'arrête et je fais confirmer par la tour','Je passe : j\'ai la clairance','Je recule'],0,'Une barre d\'arrêt allumée ne se franchit jamais : on fait confirmer.']]})],
 [/Essais moteur|point fixe/i,()=>({why:'Vérifier, avant de décoller, que le moteur et ses allumages fonctionnent correctement.',
   check:['Régime d\'essai du manuel de vol','Chute de régime sur chaque magnéto et écart entre les deux, dans les limites du manuel de vol','Réchauffage carburateur : chute puis remontée du régime','Instruments moteur dans le vert, dépression des gyroscopes'],
   ano:[['Chute magnéto hors limites ou moteur qui tourne mal sur une magnéto','stop','Ne pas décoller : retour au parking, carnet de route, mécanicien.']],doc:DOC_ANO,sim:'Essais magnétos, réchauffage carburateur, givrage carburateur simulé.',q:[]})],
 [/Before Takeoff|avant décollage/i,()=>({why:'Dernières vérifications : un décollage mal configuré (volets, compensateur) est une cause d\'accident connue.',
   check:['Commandes libres, volets et compensateur réglés','Transpondeur, feux, réchauffages','Briefing de décollage : vitesses, panne avant et après V1, trajectoire'],
   ano:[['Volets non sortis pour le décollage','stop','Configurer : l\'alarme de configuration le rappelle, la check-list d\'abord.']],doc:'Aucun document.',sim:'Alarme de configuration ; scénario « décollage sans volets ».',q:[]})],
 [/Après décollage|Montée/i,()=>({why:'Nettoyer la configuration (train, volets) et monter en respectant la trajectoire et les autres trafics.',
   check:['Train rentré à taux de montée positif ; volets à la vitesse prévue','Altimètre : calage standard à l\'altitude de transition','Trajectoire de départ et clairance'],
   ano:[['Train qui ne rentre pas','sig','Laisser sorti, procédure, souvent retour au terrain.'],['Montée plus faible que prévue','sig','Vérifier configuration, poussée et masse.']],doc:DOC_ANO,sim:'Train, volets, poussée de montée, transition altimétrique.',q:[]})],
 [/Décollage/i,()=>({why:'La phase la plus exigeante en performance : décision rapide et préparée en cas de problème.',
   check:['Poussée affichée et contrôlée','Annonces des vitesses ; trajectoire dans l\'axe','Décision : avant V1 on interrompt, après V1 on continue (avion de ligne)'],
   ano:[['Panne moteur avant V1','stop','Interrompre le décollage.'],['Panne moteur après V1','sig','Continuer, sécuriser la trajectoire, puis procédure.'],['Impact d\'oiseau','sig','Selon la vitesse et les paramètres ; notification d\'événement après le vol.']],
   doc:{pro:'Compte rendu d\'événement (ASR) si interruption ou incident ; entrée au compte rendu matériel.',club:'Carnet de route et information du chef pilote en cas d\'incident.'},sim:'Décollage interrompu, feu moteur, oiseaux (US 1549).',q:[['Avion de ligne : alarme au décollage APRÈS V1. Que fait l\'équipage ?',['Il continue le décollage puis traite la panne en vol','Il freine au maximum','Il réduit la poussée'],0,'Après V1, la distance restante ne permet plus de s\'arrêter en sécurité.']]})],
 [/Croisière/i,()=>({why:'Surveiller la consommation, la route, la météo et les systèmes : une fuite ou un écart se détecte ici.',
   check:['Carburant restant comparé au prévu (log ou OFP)','Équilibre des réservoirs','Météo en route et à destination'],
   ano:[['Carburant restant nettement inférieur au prévu','sig','Envisager une fuite : procédure, déroutement si nécessaire.']],
   doc:{pro:'Relevés carburant notés sur l\'OFP aux points de compte rendu.',club:'Log de navigation : heures et carburant réels.'},sim:'Fuite carburant simulée et contrôle papier.',q:[]})],
 [/descente/i,()=>({why:'Arriver au bon endroit à la bonne hauteur, sans précipitation.',
   check:['Point de début de descente (règle des 3 : distance en NM ≈ altitude à perdre en milliers de ft × 3)','Météo et piste en service à destination','Briefing d\'approche'],
   ano:[['Descente commencée trop tard','sig','Augmenter le taux (aérofreins) ou demander des circuits.']],doc:'Aucun document.',sim:'Calcul du point de descente.',q:[['Il faut perdre 30 000 ft. À quelle distance environ commencer la descente ?',['90 NM','30 NM','300 NM'],0,'Règle des 3 : 30 × 3 = 90 NM [CALCULÉ].']]})],
 [/Approche|Finale|Vent arrière|Étape de base/i,()=>({why:'Une approche stabilisée est la meilleure protection contre les sorties de piste.',
   check:['Configuration atterrissage, vitesse d\'approche, plan de descente','Critères de stabilisation (en général à 1 000 ft en IMC, 500 ft en VMC, selon l\'exploitant)','Check-list atterrissage'],
   ano:[['Approche non stabilisée au point de contrôle','stop','Remise de gaz : ce n\'est pas un échec, c\'est la procédure.']],doc:'Aucun document ; une remise de gaz se note éventuellement dans le compte rendu de vol.',sim:'Approche ILS, tour de piste, remise de gaz.',q:[['À 500 ft, vous êtes 15 kt trop vite et au-dessus du plan. Que faites-vous ?',['Remise de gaz','Je réduis tout pour rattraper','Je pose quand même'],0,'Approche non stabilisée : remise de gaz.']]})],
 [/Après l'atterrissage|Piste dégagée/i,()=>({why:'Dégager la piste vite et rouler au parking sans incursion.',check:['Piste dégagée entièrement','Configuration après atterrissage (volets, feux, transpondeur)','Itinéraire de roulage collationné'],ano:[['Doute sur l\'itinéraire','sig','S\'arrêter et demander.']],doc:'Aucun document.',sim:'Roulage à l\'arrivée.',q:[]})],
 [/Atterrissage|Arrondi|posé/i,()=>({why:'Poser dans la zone de toucher, dans l\'axe, à la bonne vitesse, puis s\'arrêter sur la longueur disponible.',
   check:['Point de toucher, axe, vitesse','Inverseurs et freinage','Hélicoptère : stationnaire puis posé en douceur'],
   ano:[['Atterrissage long ou rebond','sig','Remise de gaz si c\'est encore possible.'],['Atterrissage dur','sig','Le signaler : inspection d\'atterrissage dur par la maintenance.']],doc:DOC_ANO,sim:'Atterrissage, sortie de piste, atterrissage dur.',q:[]})],
 [/Parking et arrêt|Arrêt/i,()=>({why:'Arrêter l\'appareil en sécurité et laisser un état connu pour le vol suivant.',
   check:['Frein de parc, cales','Arrêt des moteurs et des rotors selon la procédure (refroidissement)','Hélicoptère : frein rotor selon le manuel'],
   ano:[['Anomalie apparue pendant le vol','sig','La noter maintenant, tant qu\'elle est fraîche.']],doc:{pro:'Compte rendu matériel : « RAS » ou anomalies, signature du commandant ; heures de vol.',club:'Carnet de route : heures, carburant, observations ; fiche de vol de l\'aéroclub.'},sim:'Arrêt moteurs, documents de fin de vol.',q:[]})],
 [/Sécurisation/i,()=>({why:'Laisser l\'appareil protégé (vent, intrusion, corps étrangers).',check:['Caches et goupilles posés si prévu','Batteries coupées','Portes fermées'],ano:[['Cache ou goupille manquant','sig','Le signaler pour remplacement.']],doc:DOC_ANO,sim:'Sécurisation de l\'appareil.',q:[]})],
 [/Mission terminée|Vol terminé/i,()=>({why:'Faire le bilan : ce qui s\'est bien passé, ce qui est à revoir.',check:['Débriefing','Documents clôturés'],ano:[],doc:{pro:'Compte rendu de vol, notification d\'événement s\'il y a lieu.',club:'Carnet de vol personnel du pilote (heures), livret de progression de l\'élève.'},sim:'Résultat de la mission.',q:[]})]
];
function ficheOf(st){ if(!st) return null; for(const [re,f] of F) if(re.test(st.t)) return f(); return null; }
window.FICHE={of:ficheOf,wp:wpOf,fig:k=>FIG[k]?FIG[k]():''};

/* ---------- rendu (mêmes classes que le guide : .gr, .gi, .wbox, .qopt) ---------- */
const css=document.createElement('style'); css.textContent=`
#guide .fi{margin-top:8px} #guide .fi summary{cursor:pointer;color:#ffd166;font:700 13px 'Barlow Condensed',sans-serif;letter-spacing:.04em}
.fi h5{margin:8px 0 3px;font:700 11px 'Barlow Condensed',sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--cy)} .fi ul{margin:2px 0 4px 16px;padding:0} .fi li{margin:2px 0;color:#d6dee5;font-size:12px}
.fi .an{display:flex;gap:6px;align-items:flex-start;margin:4px 0;font-size:12px;color:#d6dee5} .fi .g{flex:0 0 auto;font:700 10px 'Barlow Condensed',sans-serif;padding:1px 5px;border-radius:4px;color:#111}
.fi p,.wbox .fi p{font-size:12px;color:#d6dee5;margin:3px 0} .fi-fig{margin:6px 0;background:#060b10;border:1px solid var(--line);border-radius:8px;padding:4px} .fi-fig svg{width:100%;max-height:120px;display:block}
.fi .fi-fig{max-width:300px} .fi .fi-fig svg{max-height:74px} .ano .fi-fig svg{max-height:120px}
.fi-fig figcaption{font-size:10px;color:var(--mut);padding:2px 4px} .fi .qz{margin:6px 0;padding:6px;border:1px solid var(--line);border-radius:8px} .fi .qz button{display:block;width:100%;text-align:left;margin:3px 0;font-size:12px}
.fi .qz .r{font-size:12px;margin-top:4px} .ano{margin-top:8px;padding:8px;border:2px solid #ff4a3d;border-radius:8px;background:#2a0f0c} .ano b{color:#ffb4a8} .ano button{display:block;width:100%;text-align:left;margin:4px 0;font-size:12px}
.ano .ok{color:#8be3b0} .ano .ko{color:#ffb4a8} .fi select{font-size:12px;background:#0e1822;color:var(--tx);border:1px solid var(--line);border-radius:4px}
#fids{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:130;width:min(560px,calc(100vw - 16px));max-height:calc(100vh - 30px);overflow:auto;background:#05080b;border:2px solid #ffb020;border-radius:12px;color:#e8eef2;font:13px Inter,sans-serif;padding:12px;box-shadow:0 10px 40px #000c}
#fids h3{margin:0 0 8px;font:700 20px 'Barlow Condensed',sans-serif;letter-spacing:.06em;color:#ffd166} #fids table{width:100%;border-collapse:collapse;font:12px 'JetBrains Mono',monospace;background:#0b0f14}
#fids td,#fids th{padding:5px 6px;border-bottom:1px solid #1e2c3a;text-align:left} #fids th{color:#8ea3b8;font-weight:600} #fids .late{color:#ffb020;font-weight:700} #fids .me{background:#2a2110}
@media (max-width:760px){ #guide{box-sizing:border-box} }   /* le guide dépassait de 14 px sur téléphone (défaut antérieur) */
#fids .s{color:#7d93a8;font-size:11px;margin-top:6px} #fids .ann{margin:8px 0;padding:8px;border:1px solid #2a3a4c;border-radius:8px;background:#0a131c} #fids button{margin-top:8px;background:#1f6b3a;color:#fff;border:1px solid #3ddc84;border-radius:8px;padding:8px 12px;font:700 14px 'Barlow Condensed',sans-serif;cursor:pointer;float:right}`;
document.head.appendChild(css);

const anoHTML=a=>a.map(([t,g,act,fig])=>`<div class="an"><span class="g" style="background:${G[g][1]}">${G[g][0]}</span><div><b>${esc(t)}</b><br>${esc(act)}</div></div>${fig&&FIG[fig]?FIG[fig]():''}`).join('');
const mix=n=>{ const a=[...Array(n).keys()]; for(let i=n-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };   // V10.38 : ordre des réponses mélangé (la bonne n'est pas toujours la première)
const qzHTML=(q,id)=>q.map((x,n)=>`<div class="qz" data-qz="${id}-${n}"><b>${esc(x[0])}</b>${mix(x[1].length).map(j=>`<button type="button" class="mini" data-o="${j}">${esc(x[1][j])}</button>`).join('')}<div class="r"></div></div>`).join('');
function bindQz(root,q){ root.querySelectorAll('.qz').forEach(z=>{ const n=+z.dataset.qz.split('-').pop(), x=q[n]; z.querySelectorAll('[data-o]').forEach(b=>b.onclick=()=>{ const ok=+b.dataset.o===x[2]; z.querySelector('.r').innerHTML=`<span class="${ok?'qok':'qko'}">${ok?'✓ Exact.':'✗ Non.'}</span> ${esc(x[3])}`; }); }); }
function ficheHTML(f){ return `<h5>1 · Pourquoi</h5><p>${esc(f.why)}</p><h5>2 · Ce que le pilote contrôle</h5><ul>${f.check.map(c=>`<li>${esc(c)}</li>`).join('')}</ul>`
  +(f.ano.length?`<h5>3-4 · Anomalies à repérer et que faire</h5>${anoHTML(f.ano)}`:'')
  +`<h5>5 · Documents à remplir</h5><p>${esc(docTxt(f.doc))}</p><h5>6 · Dans le simulateur</h5><p>${esc(f.sim)}</p>`
  +(f.q&&f.q.length?`<h5>7 · Question de fin d'étape</h5>${qzHTML(f.q,'st')}`:'')
  +`<p class="hint">Synthèse pédagogique [ESTIMÉ] : le manuel de vol, le manuel d'exploitation et l'instructeur font foi.</p>`; }

/* préférence : anomalies au tour (jamais / parfois / toujours) */
const PREF_K='pt-ano'; const pref=()=>{ try{ return localStorage.getItem(PREF_K)||'parfois'; }catch(e){ return 'parfois'; } };
const setPref=v=>{ try{ localStorage.setItem(PREF_K,v); }catch(e){} };

const _rg=renderGuide;
renderGuide=function(){ _rg.apply(this,arguments); try{
  const g=document.getElementById('guide'); if(!g||g.hidden||!GD.on) return; const st=GD.steps[GD.i], f=ficheOf(st); const gb=g.querySelector('.gb'); if(!gb||!f) return;
  if(st.walk&&/Tour/.test(st.t)) anoInit(st);
  const d=document.createElement('details'); d.className='gr fi'; d.open=!!GD.fiOpen;
  d.innerHTML=`<summary>📘 Fiche de l'étape : contrôles, anomalies, documents</summary>${ficheHTML(f)}`
   +(st.walk&&/Tour/.test(st.t)?`<h5>Anomalies simulées au tour</h5><p>Tirage : <select data-ap><option value="jamais">jamais</option><option value="parfois">parfois (1 sur 3)</option><option value="toujours">toujours</option></select> <span class="hint">pris en compte au prochain tour</span></p>`:'');
  d.addEventListener('toggle',()=>{ GD.fiOpen=d.open; });
  const wp=gb.querySelector('#g-wp'); gb.insertBefore(d,wp||null); bindQz(d,f.q||[]);
  if(/Mission terminée|Vol terminé/.test(st.t)&&typeof qcmOpen==='function'){ const t=document.createElement('div'); t.className='wbox'; t.innerHTML='<b>📝 TEST POST PARCOURS</b><p>30 questions tirées de tous les thèmes (culture aéronautique, procédures, masse et centrage, carburant, navigation, roulage, réglementation PPL, sécurité, appareil).</p><button type="button" class="mini" data-post>Commencer le test</button>'; t.querySelector('[data-post]').onclick=()=>qcmOpen('post',30); gb.insertBefore(t,d); }
  const s=d.querySelector('[data-ap]'); if(s){ s.value=pref(); s.onchange=()=>setPref(s.value); }
  if(st.walk&&wp&&!wp.innerHTML){ const j=(GD.ano&&!GD.ano.done&&GD.seen.has(GD.ano.i))?GD.ano.i:GD.lastWp; if(j!=null&&GD.seen.has(j)) walkBox(j,true); }
 }catch(e){ console.warn('fiche d\'étape',e); } };

/* ---------- anomalie tirée au hasard pendant le tour ---------- */
function anoInit(st){ if(GD.anoStep===GD.i) return; GD.anoStep=GD.i; GD.ano=null;
  if(typeof EXAM!=='undefined'&&EXAM&&EXAM.on) return;                     // examen blanc : pas de tirage (épreuve comparable)
  const p=pref(); if(p==='jamais'||(p==='parfois'&&Math.random()>=1/3)) return;
  const cand=[]; (WALKPTS[K()]||[]).forEach((w,i)=>{ const f=wpOf(w[2]); if(f) f.ano.forEach(a=>{ if(a[4]) cand.push({i,a}); }); });
  if(!cand.length) return; const c=cand[Math.floor(Math.random()*cand.length)];
  GD.ano={i:c.i,a:c.a,done:false,tries:0,step:st}; }
function anoFound(){ const x=GD.ano, st=x&&x.step; if(!st||st._ano) return; st._ano=true;   // ligne ajoutée à la découverte : rien ne trahit l'anomalie avant
  st.items.push([`Anomalie au point ${x.i+1} : décision prise`,()=>!GD.ano||GD.ano.done||GD.anoStep!==GD.i,()=>anoResolve()]); }
function anoResolve(){ const A_=GD.ano; if(!A_||A_.done) return; A_.done=true; const a=A_.a, s=a[4], p=(WALKPTS[K()]||[])[A_.i];
  (window.ANO_LOG=window.ANO_LOG||[]).push({pt:p?p[2]:'',txt:a[0],act:s.res,delay:s.delay,club:CLUB()});
  try{ renderGuide(); }catch(e){} showFids(s.delay,a[0]); }
window.ANO={get:()=>GD.ano,resolve:anoResolve,log:()=>window.ANO_LOG||[]};

const _wb=walkBox;
walkBox=function(i,quiet){ const p=(WALKPTS[K()]||[])[i], w=document.getElementById('g-wp'); GD.lastWp=i;
  if(quiet&&w&&p) w.innerHTML=`<div class="wbox"><span class="gn">${i+1}</span><b>${esc(p[2])}</b><p>${esc(p[3])}</p></div>`; else _wb.apply(this,arguments);
  try{ const f=p&&wpOf(p[2]); if(!w||!f) return; const box=w.querySelector('.wbox')||w;
  const d=document.createElement('details'); d.className='gr fi'; d.open=true;
  d.innerHTML=`<summary>🔎 Fiche du point ${i+1} : que contrôler, quelles anomalies</summary><h5>Contrôles</h5><ul>${f.check.map(c=>`<li>${esc(c)}</li>`).join('')}</ul><h5>Anomalies possibles et conduite à tenir</h5>${anoHTML(f.ano)}<h5>Si une anomalie est trouvée : documents</h5><p>${esc(docTxt(DOC_ANO))}</p>`;
  box.appendChild(d);
  if(GD.ano&&GD.ano.i===i&&!GD.ano.done){ const a=GD.ano.a, s=a[4], z=document.createElement('div'); z.className='ano';
    z.innerHTML=`<b>⚠ Anomalie constatée : ${esc(a[0])}</b>${FIG[a[3]]?FIG[a[3]]():''}<p>Que faites-vous ?</p>${mix(s.opts.length).map(j=>`<button type="button" class="mini" data-c="${j}">${esc(s.opts[j])}</button>`).join('')}<div class="r"></div>`;
    anoFound(); box.insertBefore(z,d); if(!quiet) flash('Anomalie au point '+(i+1)+' : '+a[0],'am');
    z.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{ const j=+b.dataset.c; if(j===s.ok){ z.querySelector('.r').innerHTML=`<p class="ok">✓ Bonne décision. ${esc(s.res)}</p>`; anoResolve(); }
      else { GD.ano.tries++; z.querySelector('.r').innerHTML=`<p class="ko">✗ Décision dangereuse : ${esc(a[2])} ${CLUB()?'':'Un commandant de bord qui part avec ce défaut engage sa responsabilité et celle de l\'exploitant.'}</p>`; } });
    if(typeof AUTO!=='undefined'&&AUTO.on&&!quiet) setTimeout(()=>{ try{ if(GD.ano&&!GD.ano.done){ const b=z.querySelector(`[data-c="${s.ok}"]`); if(b) b.click(); else anoResolve(); } }catch(e){} },2500); }
 }catch(e){ console.warn('fiche du point',e); } };

/* ---------- tableau des départs / planning de l'aéroclub : retard affiché ---------- */
function showFids(delay,why){ try{ const old=document.getElementById('fids'); if(old) old.remove(); if(typeof AUTO!=='undefined'&&AUTO.on&&delay<20) return;
  let crew={}; try{ crew=JSON.parse(localStorage.getItem('sa-crew')||'{}'); }catch(e){}
  const flt=crew.vol?String(crew.vol).replace(/\s/g,''):'PTA722', fw=!HELI(), std=fw?18*60+30:15*60, nt=std+Math.ceil(delay/5)*5, hh=m=>String(Math.floor(m/60)%24).padStart(2,'0')+':'+String(m%60).padStart(2,'0');
  const dest=(typeof MI!=='undefined'&&MI&&APTS[MI.dest])?APTS[MI.dest].n:'Destination';
  const w=document.createElement('div'); w.id='fids';
  if(CLUB()) w.innerHTML=`<h3>PLANNING DE L'AÉROCLUB</h3><table><tr><th>Heure</th><th>Avion</th><th>Vol</th><th>État</th></tr>
    <tr class="me"><td>${hh(std)}</td><td>${esc(crew.imm||(K()==='r44'?'F-HPTR':'F-GBQT'))}</td><td>${esc(MI&&MI.n?MI.n.slice(0,30):'Vol local')}</td><td class="late">RETARDÉ ${hh(nt)}</td></tr>
    <tr><td>${hh(std+60)}</td><td>F-GXXA</td><td>Navigation</td><td>À L'HEURE</td></tr><tr><td>${hh(std+90)}</td><td>F-GXXB</td><td>Tours de piste</td><td>À L'HEURE</td></tr></table>
    <div class="ann">Motif : ${esc(why)}. Carnet de route renseigné ; le mécanicien remet l'appareil en service (environ ${delay} min [ESTIMÉ]).</div>`;
  else w.innerHTML=`<h3>DÉPARTS · DEPARTURES</h3><table><tr><th>Heure</th><th>Vol</th><th>Destination</th><th>Statut</th></tr>
    <tr><td>${hh(std-10)}</td><td>PT 1204</td><td>Exemple A</td><td>PARTI</td></tr>
    <tr class="me"><td>${hh(std)}</td><td>${esc(flt)}</td><td>${esc(dest)}</td><td class="late">RETARDÉ · ${hh(nt)}</td></tr>
    <tr><td>${hh(std+15)}</td><td>PT 3310</td><td>Exemple B</td><td>EMBARQUEMENT</td></tr><tr><td>${hh(std+25)}</td><td>PT 0457</td><td>Exemple C</td><td>À L'HEURE</td></tr></table>
    <div class="ann">📢 <b>Annonce en salle d'embarquement</b> : « Mesdames et messieurs, le vol ${esc(flt)} à destination de ${esc(dest)} est retardé en raison d'une intervention technique. Nouvel horaire prévu ${hh(nt)}. Nous vous remercions de votre patience. »</div>
    <div class="ann">Côté équipage : entrée au compte rendu matériel, appel à la maintenance, nouvel horaire transmis au contrôle (créneau de départ recalculé) et à l'escale. Motif : ${esc(why)} (environ ${delay} min [ESTIMÉ]).</div>`;
  w.innerHTML+=`<div class="s">Tableau [SIMULÉ] : horaires et vols voisins fictifs. Le retard est affiché, le parcours continue.</div><button type="button" data-x>Continuer</button>`;
  w.querySelector('[data-x]').onclick=()=>w.remove(); document.body.appendChild(w); if(typeof AUTO!=='undefined'&&AUTO.on) setTimeout(()=>{ try{ w.remove(); }catch(e){} },4000);
 }catch(e){ console.warn('tableau des départs',e); } }

/* ---------- F16 : « TEST POST PARCOURS ET TESTS - AÉRONAUTIQUE » dans les QCM (mêmes écrans que les autres thèmes) ---------- */
try{ if(typeof QB!=='undefined'&&typeof QTH!=='undefined'&&typeof qPool==='function'){
  QB.aero=window.QB_CULT||[];
  QTH.push(['post','TEST POST PARCOURS ET TESTS - AÉRONAUTIQUE · tous thèmes (30 questions)']); QTH.push(['aero','TESTS - AÉRONAUTIQUE · culture aéronautique']);
  const _qp=qPool; qPool=function(th){ if(th==='post') return [...QB.aero,...(QB.proc||[]),...(QB.wb||[]),...(QB.fuel||[]),...(QB.nav||[]),...(QB.ground||[]),...(QB.ppl||[]),...(QB.secu||[]),..._qp('ac'),...(K()==='c172'?(QB.c172||[]):[])]; return _qp(th); };
  const _qo=qcmOpen; qcmOpen=function(th,n){ return _qo.call(this,th,th==='post'?30:n); };
 } }catch(e){ console.warn('tests aéronautique',e); }
})();
