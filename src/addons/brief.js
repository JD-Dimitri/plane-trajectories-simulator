/* =====================================================================================================
   V7 — DOSSIER DE VOL PAS À PAS (affiché AVANT la vue 3D)
   Une page par étape : modes expliqués, dossier météo décodé, tour avion point par point, calculs papier détaillés
   (masse et centrage, carburant, vitesses, vent, descente, approche), chaque étape du guide avec le « pourquoi »,
   les erreurs fréquentes, qui fait quoi et ce que l'on entend ; annexes : sons, commandes, limites.
   Les valeurs viennent des mêmes fonctions que le simulateur (lsCalc, WB, METAR) : ce que vous lisez est ce que vous volerez.
   ===================================================================================================== */
(function(){
'use strict';
const BR=window.BR={i:0,pages:[],fromSim:false,keep:null,all:false,wasPaused:false};
const esc2=s=>String(s==null?'':s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const kg=v=>fmt(v,0)+' kg', pl=(n,s)=>n+' '+s+(n>1?'s':'');

/* ---------------- styles ---------------- */
const css=document.createElement('style'); css.textContent=`
#brief{position:fixed;inset:0;z-index:60;display:grid;grid-template-columns:300px minmax(0,1fr);grid-template-rows:auto 1fr auto;background:radial-gradient(ellipse at 70% 0%,#10243a 0,#05080c 65%);color:var(--tx)}
#brief[hidden]{display:none}
#brief .bh{grid-column:1/-1;display:flex;align-items:center;gap:12px;padding:10px 16px;border-bottom:1px solid var(--line);background:#07101a}
#brief .bh h2{margin:0;font:700 22px/1.1 'Barlow Condensed',sans-serif;letter-spacing:.02em}#brief .bh h2 b{color:var(--acc)}
#brief .bh .sub{color:var(--mut);font-size:12px}
#brief nav{overflow:auto;border-right:1px solid var(--line);padding:10px 8px 30px;background:#060d15}
#brief nav .g{font:600 11px 'Barlow Condensed';letter-spacing:.12em;text-transform:uppercase;color:var(--cy);margin:14px 8px 4px}
#brief nav button{display:flex;gap:8px;width:100%;text-align:left;text-transform:none;letter-spacing:0;font:500 13px/1.25 Inter,sans-serif;background:none;border:1px solid transparent;padding:6px 8px;margin:1px 0;color:#c9d6e2}
#brief nav button .n{flex:0 0 26px;height:20px;border-radius:5px;background:#132233;color:var(--mut);display:grid;place-items:center;font:600 11px 'JetBrains Mono'}
#brief nav button.on{background:#1f0d22;border-color:var(--acc);color:#fff}#brief nav button.on .n{background:var(--acc);color:#fff}
#brief nav button.seen .n{color:var(--grn)}
#brief main{min-width:0;overflow-x:hidden;overflow-y:auto;padding:22px clamp(14px,4vw,48px) 40px;-webkit-user-select:text;user-select:text}
#brief .pg{max-width:860px;margin:0 auto}
#brief .pg h1{font:700 30px/1.08 'Barlow Condensed',sans-serif;margin:4px 0 6px;letter-spacing:.01em}
#brief .chip{display:inline-block;font:600 11px 'Barlow Condensed';letter-spacing:.1em;text-transform:uppercase;padding:2px 8px;border-radius:4px;background:#132233;color:var(--cy);margin-right:6px}
#brief .chip.am{background:#3a2a0a;color:var(--am)}#brief .chip.g{background:#0d2a1a;color:var(--grn)}
#brief h3{font:700 15px 'Barlow Condensed';letter-spacing:.1em;text-transform:uppercase;color:var(--am);margin:22px 0 8px;border-bottom:1px solid #22303f;padding-bottom:4px}
#brief p,#brief li{line-height:1.55;font-size:14.5px}#brief li{margin:4px 0}
#brief .box{border:1px solid var(--line);border-radius:10px;padding:12px 14px;background:#0a141e;margin:10px 0}
#brief .box.why{border-left:4px solid var(--cy)}#brief .box.warn{border-left:4px solid var(--am)}#brief .box.snd{border-left:4px solid var(--acc)}#brief .box.who{border-left:4px solid var(--grn)}
#brief .box b.t{display:block;font:700 13px 'Barlow Condensed';letter-spacing:.1em;text-transform:uppercase;margin-bottom:4px;color:#fff}
#brief ol.act{counter-reset:a;list-style:none;padding:0}#brief ol.act li{counter-increment:a;display:flex;gap:10px;align-items:flex-start;padding:7px 10px;border:1px solid #1d2b3a;border-radius:8px;margin:5px 0;background:#08111a}
#brief ol.act li:before{content:counter(a);flex:0 0 24px;height:24px;border-radius:50%;background:#132233;color:var(--cy);display:grid;place-items:center;font:600 12px 'JetBrains Mono'}
#brief table{border-collapse:collapse;width:100%;font-size:13.5px;margin:6px 0}#brief td,#brief th{border-bottom:1px solid #1d2b3a;padding:6px 8px;vertical-align:top;text-align:left}#brief th{color:var(--mut);font:600 11px 'Barlow Condensed';letter-spacing:.1em;text-transform:uppercase}
#brief input[type=number]{width:72px;background:#08111a;color:var(--tx);border:1px solid var(--line);border-radius:5px;padding:3px 5px;font:600 13px 'JetBrains Mono'}
#brief .f{font:600 13.5px 'JetBrains Mono',monospace;background:#08111a;border:1px dashed #2a3a4c;border-radius:6px;padding:8px 10px;margin:6px 0;white-space:pre-wrap;color:#cfe3f2}
#brief .modes{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(250px,100%),1fr));gap:10px}
#brief .mode{border:1px solid var(--line);border-radius:12px;padding:12px;background:#0a141e;display:flex;flex-direction:column;gap:6px}
#brief .mode.sel{border-color:var(--acc);box-shadow:0 0 0 1px var(--acc) inset;background:#170b1b}
#brief .mode .m-go{margin-top:auto;align-self:flex-start;background:var(--acc);color:#fff;border:0;border-radius:9px;padding:9px 14px;font:700 15px 'Barlow Condensed';letter-spacing:.06em;text-transform:uppercase;cursor:pointer}#brief .mode h4{margin:0;font:700 19px 'Barlow Condensed'}#brief .mode .k{font:600 10px 'Barlow Condensed';letter-spacing:.12em;text-transform:uppercase;color:var(--cy)}
#brief .mode dl{margin:0;font-size:13px;display:grid;grid-template-columns:92px 1fr;gap:3px 8px}#brief .mode dt{color:var(--mut)}#brief .mode dd{margin:0}
#brief .tl{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}#brief .tl button{display:block;text-align:left;text-transform:none;letter-spacing:0;font:500 12.5px Inter;padding:9px;border-radius:9px;background:#0a141e;min-height:70px}
#brief .tl button b{display:block;font:700 15px 'Barlow Condensed';color:#fff}#brief .tl button span{color:var(--mut)}
#brief .snd-b{font:500 12.5px Inter;text-transform:none;letter-spacing:0;margin:3px 4px 3px 0;padding:5px 9px}
#brief .bf{grid-column:1/-1;display:flex;align-items:center;gap:8px;padding:10px 16px;border-top:1px solid var(--line);background:#07101a;flex-wrap:wrap}
#brief .bf .sp{flex:1}#brief #br-go{background:var(--acc);border-color:var(--acc);color:#fff;font-size:15px;padding:10px 20px}
#brief .prog{height:4px;background:#132233;border-radius:3px;overflow:hidden;flex:1;min-width:80px;max-width:260px}#brief .prog i{display:block;height:100%;background:var(--acc)}
#brief .wp{display:grid;grid-template-columns:34px 1fr;gap:4px 10px;padding:9px 0;border-bottom:1px solid #1d2b3a}#brief .wp .n{width:30px;height:30px;border-radius:50%;background:#ffd23a;color:#111;display:grid;place-items:center;font:700 14px 'JetBrains Mono'}
#brief .wp b{font-size:14.5px}#brief .wp p{margin:2px 0;font-size:13.5px;color:#c9d6e2}#brief .wp p.y{color:#9fd7e0}
#brief-nav-t{display:none}
#brief ol.act li>span{min-width:0;overflow-wrap:anywhere}
#brief .f{overflow-wrap:anywhere}
#brief .pg{min-width:0}
#brief .swipe-hint{display:none;text-align:center;color:var(--mut);font-size:12px;margin:10px 0 0}
@media (max-width:820px){ #brief{grid-template-columns:minmax(0,1fr)} #brief table{display:block;overflow-x:auto;-webkit-overflow-scrolling:touch} #brief .mode dl{grid-template-columns:70px 1fr} #brief .swipe-hint{display:block} #brief nav{position:fixed;top:56px;left:0;bottom:60px;width:min(320px,88vw);z-index:2;transform:translateX(-102%);transition:transform .2s} #brief.nav nav{transform:none;box-shadow:8px 0 30px #000a} #brief-nav-t{display:inline-block} #brief .pg h1{font-size:25px} #br-all{display:none} #brief .bh{gap:6px;padding:8px 10px} #brief .bh h2{font-size:17px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis} #brief .bh .sub{white-space:nowrap;overflow:hidden;text-overflow:ellipsis} #brief .bh button{padding:6px 8px} #brief .bf{padding:8px 10px;gap:6px} #brief .prog{display:none} }
`; document.head.appendChild(css);

/* ---------------- contenus pédagogiques ---------------- */
const MODES=[
 {id:'guide',k:'Recommandé pour apprendre',n:'Mode pédagogique guidé',ico:'🎓',
  what:'Un panneau numéroté (étape 0 → N) vous dit quoi faire et pourquoi. Chaque action se coche toute seule quand vous la réalisez réellement dans le cockpit (interrupteur, manette, bouton du FCU…).',
  you:'Vous faites tout : marcher autour de l\'avion, actionner les commandes, roulage, décollage, pilotage (ou pilote automatique), approche, atterrissage.',
  help:'Dans le dossier, chaque action « 👁 Voir » ouvre le vrai bloc de commandes ou l\'écran concerné · « Où ? » fait clignoter la commande à utiliser · « Faire » exécute une action · « Faire pour moi » toute l\'étape · ◀ ▶ pour naviguer · les calculs papier sont modifiables.',
  who:'Débutant à intermédiaire. Missions « Parcours pilote complet ».'},
 {id:'auto',k:'Pour observer d\'abord',n:'Mode automatique (observation)',ico:'▶',
  what:'Le simulateur réalise tout le vol seul, comme un instructeur qui démontre : tour avion (déplacement automatique d\'un point à l\'autre), mise sous tension, démarrages, roulage sur les vraies voies, décollage, montée, croisière accélérée, descente, approche ILS, atterrissage, roulage, arrêt.',
  you:'Vous regardez, lisez les boîtes d\'information, écoutez les annonces. Vous pouvez reprendre la main à tout moment (bouton « ▶ Auto » de la barre).',
  help:'Option : 2 questions de QCM à la fin de chaque phase. Le temps est accéléré automatiquement pendant les attentes réelles (alignement des centrales, croisière).',
  who:'Première découverte, révision avant de faire soi-même.'},
 {id:'free',k:'Pour s\'entraîner sans aide',n:'Parcours sans guide',ico:'🧭',
  what:'Même parcours complet (cold & dark, tour avion, calculs…) mais sans panneau de guidage : seules les boîtes du tour avion s\'affichent.',
  you:'Vous appliquez les procédures de mémoire, avec ce dossier comme référence. Le bouton « Guide » réaffiche le panneau si vous êtes bloqué.',
  help:'Idéal après 1 ou 2 vols guidés. Combinez avec le poste « Pannes ».',who:'Intermédiaire à confirmé.'},
 {id:'libre',k:'Pilotage pur',n:'Vol libre',ico:'✈',
  what:'L\'appareil est déjà aligné sur la piste (ou posé pour un hélicoptère), moteurs en marche. Pas de procédure au sol.',
  you:'Vous décollez et pilotez librement vers la destination ; radio, météo, pannes et scénarios restent disponibles.',
  help:'Choisir une mission « Vol libre » dans le menu.',who:'Travailler le pilotage, les approches, les pannes.'},
 {id:'acad',k:'Avant tout',n:'Académie (cours)',ico:'📚',
  what:'Le cours débutant (l\'avion, ses parties, le vol, les moteurs, les instruments, la météo, la navigation, le pilote), le cours du simulateur, puis le vrai brevet de pilote et la reconversion professionnelle.',
  you:'Vous lisez les modules dans l\'ordre et répondez aux questions de fin de module ; la progression est gardée.',help:'Accessible aussi depuis le menu principal (« Académie »).',who:'Grands débutants, avant le premier vol.'},
 {id:'exam',k:'Valider la théorie',n:'Parcours pilote — examen blanc',ico:'🎓',
  what:'Le vol complet, de la visite extérieure à l\'atterrissage, mais sans aide : seuls les blocs et écrans à utiliser sont encadrés [ ? ]. Les calculs (masse, carburant, VR, descente, VAPP) et le tour avion sont des questions.',
  you:'Vous trouvez et actionnez les bonnes commandes. Après 30 s sans la bonne action, un QCM d\'aide s\'ouvre : bonne réponse ✓ et la commande est montrée ; mauvaise ✗ et le tableau des étapes s\'affiche.',
  help:'Toutes les étapes avant décollage validées → l\'avion décolle ; sinon épreuve éliminatoire. Le bloc-notes final renvoie chaque point raté vers le dossier, le mode automatique ou le mode guidé.',
  who:'Après le mode automatique et au moins un vol guidé.'},
 {id:'scn',k:'Situations',n:'Scénarios et pannes',ico:'⚠',
  what:'Bouton « Scénarios » : situations fictives ou reconstitutions (briefing, critères de réussite, enregistrement 1 Hz, débriefing). Bouton « Pannes » : poste instructeur pour injecter une panne pendant n\'importe quel vol.',
  you:'Vous identifiez l\'alarme (sons, ECAM), appliquez la procédure, gérez la trajectoire.',help:'Les alarmes sonores sont expliquées dans l\'annexe « Les sons du vol ».',who:'Confirmé.'},
 {id:'qcm',k:'Vérifier ses connaissances',n:'QCM',ico:'✔',
  what:'Séries de questions (procédures, masse et centrage, carburant, navigation, roulage, appareil) avec correction expliquée.',
  you:'Vous répondez ; le meilleur score est gardé.',help:'Accessible depuis le menu ou la barre (« QCM »).',who:'Tous niveaux, avant ou après le vol.'},
 {id:'radio',k:'Communication',n:'Radio (contrôle aérien simulé)',ico:'📻',
  what:'Clairances réalistes (délivrance, sol, tour, départ, centre, approche) en anglais aéronautique avec traduction, ATIS construit sur le METAR.',
  you:'Vous collationnez (readback) au clavier ou à la voix ; le contrôleur corrige une erreur.',help:'Bouton « Radio » ; option copilote radio automatique.',who:'Tous niveaux.'}];

const PHX={
 'Préparation':{who:'Commandant de bord (CDB) et officier pilote de ligne (OPL), au bureau des opérations ou sur tablette (EFB), 45 à 60 min avant le départ.',hear:'Rien de particulier : c\'est un travail au calme.',snd:[]},
 'Au sol, à pied':{who:'Le pilote qui fait la visite (souvent l\'OPL). Autour : mécaniciens, agents de piste, avitailleur.',hear:'Le minibus équipage qui repart, vos pas sur le tarmac (plus « mouillés » s\'il pleut), le vent et les rafales du METAR, le groupe de parc diesel, des jets qui décollent au loin, un bip de recul de véhicule, des oiseaux le jour, des grillons la nuit s\'il fait doux.',snd:[]},
 'Cockpit':{who:'CDB à gauche (avion), OPL à droite. Lecture des check-lists en « challenge / response » : l\'un lit, l\'autre vérifie et répond.',hear:'Déclics des interrupteurs, la porte qui se ferme, la ventilation avionique et le léger 400 Hz du réseau électrique dès que le courant arrive, le sifflement de l\'APU qui monte en régime (A320), le « bing-bong » des consignes ceintures, le chef de cabine qui vient saluer.',snd:['belts']},
 'Mise en route':{who:'CDB aux commandes, OPL surveille les paramètres ; mécanicien au sol relié par interphone (« clear to start »).',hear:'Le mécanicien à l\'interphone, le démarreur pneumatique qui siffle en montant, le tic-tic des bougies, le souffle de l\'allumage, puis le ralenti stabilisé. Sur A320, juste après le premier moteur : le « chien qui aboie » (PTU) — c\'est normal.',snd:['start','ptu']},
 'Roulage':{who:'Pilote aux commandes du roulage (CDB sur la plupart des avions : volant de direction du train avant), OPL à la radio et à la carte.',hear:'Le roulement des pneus, les joints des dalles de béton, les freins, l\'annonce de bienvenue et l\'armement des toboggans, les PNC aux postes, l\'appel « cabine parée » (double tintement).',snd:['belts','call']},
 'Décollage':{who:'Pilote en fonction (PF) aux commandes, pilote non en fonction (PNF/PM) surveille et annonce.',hear:'La poussée qui monte, le « buzz-saw » des soufflantes à pleine poussée, les feux d\'axe qui défilent (« tac… tac… »), les annonces du copilote : « thrust set », « one hundred knots », « V1 », « rotate », puis « positive climb » — « gear up ».',snd:['callouts']},
 'Après décollage':{who:'PF pilote, PNF exécute les ordres (train, volets) et répond.',hear:'Le train qui remonte (moteur hydraulique, 3 verrouillages), le vent qui change quand les volets rentrent, la réduction de poussée.',snd:['gear']},
 'Montée':{who:'PF / PNF, pilote automatique engagé.',hear:'Bruit aérodynamique qui augmente avec la vitesse, C-chord à l\'approche de l\'altitude affichée.',snd:['cchord']},
 'Croisière':{who:'Équipage en surveillance ; PNC en service. Annonce du commandant.',hear:'Un souffle régulier, les annonces cabine, éventuellement la turbulence (secousses, craquements) et la pluie si vous traversez une cellule.',snd:['pa']},
 'Descente':{who:'PF prépare et fait le briefing d\'approche ; PNF vérifie.',hear:'Réduction des moteurs, annonce de descente, consignes ceintures.',snd:['belts']},
 'Approche':{who:'PF pilote ou surveille le pilote automatique ; PNF configure (volets, train) sur ordre.',hear:'« Flaps 1… 2… 3… full », le train qui sort (« gear down, three green »), le vent du train sorti, « PNC aux postes pour l\'atterrissage », les annonces radiosonde.',snd:['gear','callouts']},
 'Atterrissage':{who:'PF aux commandes, PNF annonce.',hear:'« … fifty, forty, thirty, twenty — RETARD », le crissement des pneus, le choc, la roulette de nez, « spoilers », « reverse green », « decel », « seventy knots ».',snd:['callouts','touch']},
 'Parking':{who:'CDB arrête les moteurs ; PNC désarment les toboggans ; mécanicien au sol.',hear:'Les moteurs qui ralentissent, « désarmement des toboggans », la consigne ceintures éteinte : des dizaines de boucles qui cliquent et le brouhaha qui monte.',snd:['belts']},
 'Arrêt':{who:'Le pilote, seul à bord sur hélicoptère léger.',hear:'Le rotor qui ralentit, le frein rotor, le silence.',snd:[]},
 'Fin':{who:'Équipage : compte rendu matériel (techlog), débriefing.',hear:'—',snd:[]}};

/* enrichissements par étape (pourquoi · erreurs fréquentes · astuces) */
const EXTRA=[
 [/Briefing et dossier/,{why:'Un vol se décide au sol : la météo de départ, de destination et de dégagement détermine le carburant, la piste, l\'approche. Les NOTAM signalent pistes fermées, balisages en panne, zones réglementées.',err:'Ne lire que la météo de destination ; oublier le dégagement ; ne pas vérifier l\'heure de validité des prévisions (TAF).'}],
 [/Devis de masse/,{why:'Trop lourd, l\'avion décolle plus long, monte moins bien, freine plus long. Centrage trop arrière : instable en tangage ; trop avant : rotation difficile. Les limites MZFW / MTOW / MLW sont des limites de structure certifiées.',err:'Oublier les bagages cabine, prendre une masse passager non réglementaire, ne pas recalculer après ajout de carburant.'}],
 [/Bilan carburant/,{why:'La réglementation impose de quoi aller à destination, faire face aux imprévus, rejoindre le dégagement et voler encore 30 min (avion de ligne : 30 min d\'attente à 1 500 ft). En VFR non commercial : avion 30 min de jour, 45 min de nuit ; hélicoptère 20 min (NCO.OP.125). On ne « finit » jamais réservoirs secs : la réserve finale n\'est pas faite pour être consommée.',err:'Confondre carburant bloc et carburant au décollage (le roulage est consommé avant) ; oublier la réserve de route.'}],
 [/Arrivée au parking/,{why:'On arrive à l\'avion par le côté, gilet haute visibilité, en restant hors des zones de danger (aspiration réacteur, souffle, hélices / rotors, véhicules).',err:'Passer devant une entrée d\'air ou sous une aile pendant l\'avitaillement.'}],
 [/Tour avion|visite/,{why:'Dernière occasion de voir de ses yeux ce qu\'aucun voyant ne montre : un impact d\'oiseau, une sonde bouchée par un insecte, une fuite hydraulique, un pneu entaillé, une trappe restée ouverte.',err:'Aller trop vite ; ne pas se baisser pour voir le train ; oublier de vérifier que les caches et goupilles rouges sont retirés.'}],
 [/cold & dark|Monter à bord/,{why:'« Cold & dark » = avion entièrement éteint. Avant tout, on vérifie le frein de parc, les manettes au ralenti / coupées et le train verrouillé — puis on met sous tension.',err:'Mettre les batteries avant d\'avoir vérifié les sécurités (train, manettes).'}],
 [/batteries|Alimentation électrique|Alimentation et feux/,{why:'Les batteries alimentent le minimum vital. On contrôle la tension pour être sûr qu\'elles pourront démarrer l\'APU ou secourir l\'avion en vol.',err:'Laisser l\'avion longtemps sur batteries seules : elles se vident.'}],
 [/APU|Alimentation sol/,{why:'L\'APU (petite turbine dans la queue) fournit électricité et air comprimé au sol : climatisation et démarrage des moteurs sans aide extérieure.',err:'Démarrer l\'APU alors que du personnel est près de l\'échappement ; oublier APU BLEED pour le démarrage.'}],
 [/inertielles|ADIRS|AHRS/,{why:'Les centrales inertielles déterminent position et attitude en mesurant la rotation de la Terre : l\'avion doit rester parfaitement immobile pendant l\'alignement.',err:'Faire bouger l\'avion (avitaillement brutal, repoussage) pendant l\'alignement ; partir avec des drapeaux sur le PFD.'}],
 [/Feux, consignes|feux, consignes/,{why:'Feux de navigation = « je suis là » ; BEACON (anticollision rouge clignotant) = « moteurs en marche ou sur le point de démarrer, ne pas approcher ».',err:'Allumer le BEACON trop tard : le personnel au sol ne sait pas que vous allez démarrer.'}],
 [/FMS|Performances/,{why:'Les vitesses V1/VR/V2 et le réglage du plan horizontal dépendent de la masse et de la piste. Les saisir permet aussi aux protections et au directeur de vol de fonctionner.',err:'Inverser ZFW et TOW (erreur classique et dangereuse) ; ne pas recouper avec le devis.'}],
 [/Before Start/,{why:'Dernière vérification avant de rendre l\'avion « vivant » : portes fermées, carburant conforme au devis, BEACON allumé, frein de parc serré.',err:'Lire la check-list « de mémoire » sans regarder les commandes.'}],
 [/Démarrage du moteur 2/,{why:'On démarre d\'abord le moteur 2 sur A320 : il alimente le circuit hydraulique jaune, qui sert au frein de parc et au repoussage.',err:'Ne pas surveiller l\'EGT : un démarrage chaud se voit à l\'EGT qui monte trop vite.'}],
 [/Démarrage du moteur 1/,{why:'Après les deux démarrages, ENG MODE revient sur NORM (sinon allumage continu) et APU BLEED OFF (l\'air vient désormais des moteurs).',err:'Oublier ENG MODE NORM.'}],
 [/Démarrage des réacteurs|Démarrage des turbines|Démarrage de la turbine/,{why:'Une turbine démarre en trois temps : le démarreur entraîne le compresseur, l\'allumage s\'enclenche, le carburant arrive ; elle accélère seule jusqu\'au ralenti.',err:'Ne pas surveiller la température (ITT / T4 / T5) : risque de démarrage chaud.'}],
 [/Démarrage du moteur$/,{why:'Moteur à pistons à injection (R44 II, POH section 4) : mélange tiré (OFF) pendant le lancement, contact sur START ; dès que le moteur part, mélange poussé plein riche, puis magnétos sur BOTH.',err:'Laisser le contact sur START après le démarrage.'}],
 [/Embrayage/,{why:'Sur R44, l\'embrayage met progressivement le rotor en rotation par des courroies.',err:'Décoller avant l\'extinction du voyant CLUTCH.'}],
 [/roulage|Roulage/,{why:'Le roulage est une phase à risque (incursions de piste). On suit exactement la clairance, on s\'arrête aux barres rouges des points d\'arrêt, on ne traverse une piste qu\'avec autorisation.',err:'Rouler trop vite en virage ; franchir un point d\'arrêt sans autorisation ; oublier les volets de décollage.'}],
 [/Before Takeoff|^Décollage/,{why:'V1 est la vitesse de décision : avant, on peut arrêter sur la piste restante ; après, on décolle même avec une panne moteur. VR : on tire. V2 : vitesse de sécurité à 35 ft avec un moteur en panne.',err:'Tirer avant VR (risque de toucher la queue) ; trop cabrer ; hésiter après V1.'}],
 [/Après décollage/,{why:'On rentre le train dès que le vario est positif (moins de traînée), puis on réduit la poussée à l\'altitude de réduction et on rentre les volets en accélérant.',err:'Rentrer les volets trop tôt (trop lent) ; oublier l\'automanette.'}],
 [/Montée/,{why:'Au-dessus de l\'altitude de transition, tous les avions règlent 1013 hPa : on parle en niveaux de vol (FL350 = 35 000 ft standard), ce qui garantit les séparations.',err:'Oublier de passer en STD ; garder les phares au-dessus du FL100.'}],
 [/Croisière/,{why:'Le suivi carburant détecte tôt une fuite ou une consommation anormale : on compare chaque heure le restant au prévu.',err:'Se laisser distraire ; ne pas mettre à jour l\'heure estimée d\'arrivée.'}],
 [/Descente/,{why:'Commencer trop tard oblige à descendre très vite ou à faire des tours ; trop tôt, on consomme du carburant à basse altitude. La règle des 3 donne le bon point.',err:'Oublier le briefing d\'approche ; ne pas recaler le QNH sous le niveau de transition.'}],
 [/Approche/,{why:'Une approche stabilisée à 1 000 ft (bonne vitesse, bonne configuration, sur l\'axe et le plan) est la meilleure protection contre les sorties de piste. Sinon : remise des gaz, sans hésiter.',err:'Sortir le train trop tard ; continuer une approche non stabilisée.'}],
 [/Atterrissage|posé/,{why:'L\'arrondi transforme la descente en palier juste au-dessus de la piste ; la réduction (« RETARD ») met les manettes au ralenti pour que les aérofreins et l\'auto-frein agissent.',err:'Arrondir trop haut (atterrissage dur après perte de vitesse) ou trop bas ; garder de la poussée au toucher.'}],
 [/Parking|Arrêt/,{why:'On attend que les moteurs soient arrêtés pour éteindre le BEACON : c\'est le signal pour le personnel au sol qu\'il peut approcher.',err:'Éteindre le BEACON avant l\'arrêt complet ; oublier le frein de parc.'}],
 [/Sécurisation/,{why:'On rend l\'avion « cold & dark » et on note au compte rendu matériel toute anomalie, pour l\'équipage suivant et la maintenance.',err:'Oublier de noter une anomalie constatée en vol.'}],
];
function extraFor(t){ const o={}; EXTRA.forEach(([re,v])=>{ if(re.test(t)){ if(v.why&&!o.why) o.why=v.why; if(v.err&&!o.err) o.err=v.err; } }); return o; }

/* pourquoi de chaque point du tour avion */
const WHYW=[[/sonde|pitot|radôme|Nez/i,'Une sonde pitot ou statique bouchée (insecte, glace, cache oublié) fausse l\'anémomètre et l\'altimètre : plusieurs accidents en sont partis.'],[/train|pneu|roue|patin/i,'Un pneu entaillé ou sous-gonflé peut éclater au décollage ; une fuite hydraulique se voit en premier dans le puits de train.'],
 [/moteur|réacteur|turbine|capot/i,'Un objet dans l\'entrée d\'air (FOD) détruit la soufflante ; un capot mal verrouillé peut s\'ouvrir en vol.'],[/aile|saumon|volet/i,'Bords d\'attaque, volets et gouvernes doivent être intacts et libres ; givre ou neige sur l\'aile = dégivrage obligatoire.'],
 [/empennage|dérive|queue/i,'Les gouvernes de profondeur et de direction pilotent l\'avion en tangage et en lacet : aucun dommage n\'est acceptable.'],[/rotor|pale|tête/i,'La tête rotor porte tout l\'hélicoptère : fissure, jeu ou amortisseur défectueux sont des causes d\'interdiction de vol.'],
 [/porte|statique|côté/i,'Portes et trappes doivent être fermées et verrouillées ; les prises statiques propres pour des instruments justes.'],[/APU|échappement/i,'L\'échappement de l\'APU doit être dégagé ; personne derrière pendant son démarrage.'],[/huile|carburant|réservoir/i,'Niveaux d\'huile et purges carburant : de l\'eau dans le carburant peut arrêter un moteur.'],[/bord|entrée/i,'Fin de la visite : on monte à bord.']];
const whyW=n=>{ for(const [re,t] of WHYW) if(re.test(n)) return t; return ''; };

/* ---------------- calculs pour le dossier ---------------- */
function depIcao(){ try{ const st=MI.start(); let best=null,bd=1e9; for(const k in APTS){ const a=APTS[k]; if(!/^[A-Z]{4}$/.test(k)||(A.kind==='fw'&&(a.heli||!(a.rw||[]).length))) continue; const d=gcKm(st.lat,st.lon,a.lat,a.lon); if(d<bd){ bd=d; best=k; } } return best; }catch(e){ return null; } }
function rwyHdg(icao,rw){ try{ return rwStart(icao,rw).hdg; }catch(e){ return null; } }
function decodeMetar(m){ if(!m) return '<p class="sub">Pas de METAR disponible pour cet aérodrome.</p>';
  const WXN={RA:'pluie',DZ:'bruine',SN:'neige',GR:'grêle',GS:'grésil',BR:'brume',FG:'brouillard',HZ:'brume sèche',TS:'orage',SH:'averses',FZ:'se congelant',VC:'au voisinage',MI:'mince',BC:'bancs',BL:'chasse',PL:'granules de glace',SQ:'grains'};
  const wx=(m.wx||[]).map(s=>(s[0]==='-'?'faible ':s[0]==='+'?'fort(e) ':'')+s.replace(/^[-+]/,'').match(/VC|MI|BC|BL|SH|TS|FZ|RA|DZ|SN|GR|GS|BR|FG|HZ|PL|SQ/g).map(x=>WXN[x]||x).join(' ')).join(', ');
  const cov={FEW:'quelques nuages (1–2/8)',SCT:'épars (3–4/8)',BKN:'fragmentés (5–7/8)',OVC:'couvert (8/8)',VV:'ciel invisible, visibilité verticale'};
  const r=(a,b,c)=>`<tr><td><b>${a}</b></td><td class="num">${b}</td><td>${c}</td></tr>`;
  return `<div class="f">${esc2(m.raw)}</div><table><tr><th>Élément</th><th>Valeur</th><th>Ce que cela veut dire pour le vol</th></tr>
   ${r('Vent',m.spd<3?'calme':(m.vrb?'variable':String(m.dir).padStart(3,'0')+'°')+' '+m.spd+' kt'+(m.gust?' rafales '+m.gust+' kt':''),'Direction d\'où vient le vent (degrés vrais). On décolle et on atterrit face au vent : vitesse sol plus faible, distances plus courtes.'+(m.gust?' Rafales : on ajoute une marge à la vitesse d\'approche.':''))}
   ${r('Visibilité',m.cavok?'CAVOK':m.vis>=10000?'≥ 10 km':fmt(m.vis,0)+' m','Distance à laquelle on voit horizontalement. '+(m.vis<1500?'Faible : approche aux instruments obligatoire.':'Bonne.'))}
   ${r('Phénomènes',wx||'aucun',wx?'Pluie : freinage dégradé, pare-brise ruisselant (essuie-glaces). Orage : éviter les cellules au radar (turbulence, grêle, foudre).':'—')}
   ${r('Nuages',m.cavok?'aucun sous 5 000 ft':(m.clouds||[]).map(c=>c.cov+' '+c.base+' ft'+(c.cb?' '+c.cb:'')).join(', ')||'aucun significatif',(m.clouds||[]).map(c=>`${c.cov} : ${cov[c.cov]||c.cov} à ${c.base} ft${c.cb==='CB'?' — cumulonimbus (orage) !':''}`).join(' · ')||'—')}
   ${r('Température / rosée',m.temp+' °C / '+(m.dew==null?'—':m.dew+' °C'),'Plus il fait chaud, moins l\'air est dense : décollage plus long. Température proche du point de rosée : brouillard possible ; entre +10 °C et −20 °C avec humidité visible : givrage.')}
   ${r('QNH',m.qnh+' hPa'+(m.inHg?' ('+m.inHg.toFixed(2)+' inHg)':''),'Pression ramenée au niveau de la mer : on la règle sur l\'altimètre sous l\'altitude de transition pour lire l\'altitude réelle.')}</table>`; }
function windHTML(icao,hdg,label){ const m=WXS.met[icao]; if(!m||hdg==null) return ''; const d=((m.dir-hdg+540)%360)-180, a=d*D2R, hw=m.spd*Math.cos(a), xw=m.spd*Math.sin(a);
  return `<div class="box"><b class="t">Vent effectif — ${label}</b><div class="f">Δ = vent ${String(m.dir).padStart(3,'0')}° − piste ${Math.round(hdg)}° = ${Math.round(d)}°
Vent de face  = ${m.spd} kt × cos(${Math.round(d)}°) = ${hw.toFixed(1)} kt ${hw<-1?'(vent ARRIÈRE !)':''}
Vent traversier = ${m.spd} kt × sin(${Math.round(d)}°) = ${Math.abs(xw).toFixed(1)} kt de ${xw>0?'droite':'gauche'}${m.gust?`\nAvec rafales ${m.gust} kt : traversier jusqu'à ${Math.abs(m.gust*Math.sin(a)).toFixed(1)} kt`:''}</div>
  <p>Astuce de tête : sin 30° = ½, sin 45° ≈ 0,7, sin 60° ≈ 0,9. ${hw<-10?'<b style="color:var(--am)">Vent arrière au-delà de 10 kt (limite usuelle) : piste opposée.</b> ':hw<-1?'Léger vent arrière, toléré jusqu\'à environ 10 kt ; le contrôle choisit normalement la piste face au vent. ':''}${Math.abs(xw)>(AL()?33:25)?'<b style="color:var(--am)">Au-delà de la limite démontrée de l\'appareil : choisir une autre piste.</b>':'Dans les limites démontrées de l\'appareil.'}</p></div>`; }
function calcBrief(kind){ const L=LS, w=WB[ACK], fw=A.kind==='fw';
  try{
  if(kind==='ls') return `<div id="br-calc" data-k="ls">${calcHTML('ls')}</div><div class="box why"><b class="t">Comment on calcule</b><div class="f">ZFW = masse de base ${kg(w.dow)} + passagers ${L.pax} × ${w.stdPax} kg${L.child?` + enfants ${L.child} × ${w.child} kg`:''} + bagages ${kg(L.bagM)} + fret ${kg(L.cargo)} = ${kg(L.zfw)}
TOW = ZFW + carburant au décollage (bloc − roulage) = ${kg(L.zfw)} + ${kg(L.block-w.taxi)} = ${kg(L.tow)}
LW  = TOW − carburant d'étape ${kg(L.trip)} = ${kg(L.lw)}</div><p>Chaque masse est comparée à sa limite (MZFW, MTOW, MLW). Centrage : chaque masse multipliée par sa distance à une référence donne un moment ; le centre de gravité = somme des moments ÷ somme des masses. Il doit rester entre les limites avant et arrière. <b>Les valeurs sont modifiables ici</b> : elles seront reprises pendant le vol.</p></div>`;
  if(kind==='fuel') return `<div id="br-calc" data-k="fuel">${calcHTML('fuel')}</div><div class="box why"><b class="t">Lecture ligne par ligne</b><ul>
   <li><b>Roulage</b> : consommé avant le décollage (moteurs au ralenti ≈ ${fw?'10 à 15':'5'} min).</li><li><b>Étape (trip)</b> : temps de vol = distance ÷ vitesse sol (+ 15 min de montée/descente) × consommation horaire = ${L.tripH.toFixed(2)} h × ${fmt(w.burn,0)} kg/h.</li>
   <li><b>Réserve de route 5 %</b> : vent plus fort que prévu, déroutement en route, attente.</li><li><b>Dégagement</b> : rejoindre un autre aéroport si la destination ferme.</li><li><b>Réserve finale</b> : avion de ligne 30 min en attente à 1 500 ft (VFR non commercial : avion 30 min de jour / 45 min de nuit, hélicoptère 20 min) — on ne la consomme qu'en urgence (« MAYDAY FUEL »).</li>
   <li><b>Supplément commandant</b> : à son jugement (orages, trafic, givrage).</li></ul></div>`;
  if(kind==='perf'){ const dep=depIcao(), rw=MI.full?'31L':null, h=rw?rwyHdg(dep,rw):(MI.start?MI.start().hdg:null);
    return (fw?calcHTML('perf'):'')+(fw?`<div class="box why"><b class="t">Les trois vitesses du décollage</b><ul><li><b>V1 (${L.v1} kt)</b> — décision : panne avant V1 → on interrompt ; après → on décolle quoi qu'il arrive.</li><li><b>VR (${L.vr} kt)</b> — rotation : on tire doucement vers ~15° d'assiette (≈ 3° par seconde).</li><li><b>V2 (${L.v2} kt)</b> — sécurité au décollage : vitesse de montée garantie même sur un moteur.</li></ul><p>Plus l'avion est lourd, plus ces vitesses sont élevées. Ici : formule linéaire simplifiée sur la masse [ESTIMÉ].</p></div>`:'')+windHTML(dep,h,'départ '+(dep||'')+(rw?' piste '+rw:'')); }
  if(kind==='after') return `<div class="box"><b class="t">Contrôle carburant prévu après la montée</b><div class="f">Carburant prévu à l'arrivée = bloc ${kg(L.block)} − roulage ${kg(w.taxi)} − étape ${kg(L.trip)} = ${kg(L.block-w.taxi-L.trip)}
Doit rester ≥ dégagement + réserve finale = ${kg(w.alt+w.res30)}</div><p>En vol, le panneau du guide refait ce calcul avec le carburant réellement à bord et le débit instantané.</p></div>`;
  if(kind==='cruise'){ const H=Math.max(1,Math.ceil(L.tripH)); let rows=''; for(let h=1;h<=Math.min(H,9);h++) rows+=`<tr><td>${h} h</td><td class="num">${kg(Math.max(0,L.block-w.taxi-w.burn*h))}</td></tr>`;
    return `<div class="box"><b class="t">Le « plan carburant » horaire (à comparer en vol)</b><table><tr><th>Temps de vol</th><th>Carburant prévu à bord</th></tr>${rows}</table><p>Écart supérieur à la réserve de route (${kg(L.cont)}) : rechercher une fuite, envisager un déroutement.</p></div>`; }
  if(kind==='descent'){ const cr=fw?(AL()?35000:41000):1500, de=MI.dest&&APTS[MI.dest]?APTS[MI.dest].elev/FT:0, hh=cr-de, tod=hh/1000*3, gs=fw?420:110;
    return `<div class="box"><b class="t">Point de descente — règle des 3</b><div class="f">Hauteur à perdre = ${fmt(cr,0)} − ${fmt(de,0)} ft = ${fmt(hh,0)} ft
Distance de descente ≈ 3 × ${(hh/1000).toFixed(1)} = ${fmt(tod,0)} NM (≈ ${fmt(tod*1.852,0)} km) avant l'arrivée
Taux de descente ≈ vitesse sol × 5 = ${gs} × 5 = ${fmt(gs*5,0)} ft/min
Durée ≈ ${fmt(hh/(gs*5),0)} min</div><p>Pourquoi ×3 ? Une pente de 3° fait perdre environ 300 ft par mille nautique : 1 000 ft ↔ 3 NM. Vent arrière : commencer plus tôt.</p></div>`; }
  if(kind==='landing'){ const dr=MI.destRw, dh=dr?rwyHdg(MI.dest,dr):null; let vapp=''; try{ vapp=fw?vlsNow(L.lw)+5:''; }catch(e){}
    return `<div class="box"><b class="t">Approche</b><div class="f">Masse à l'atterrissage prévue : ${kg(L.lw)} (MLW ${kg(w.mlw)})${fw?`\nVAPP = VLS + 5 kt ≈ ${vapp} kt [ESTIMÉ]  (correction = le plus grand de 5 kt et du ⅓ du vent de face établi, plafonnée à VLS + 15 kt ; les rafales sont prises en compte par la fonction « ground speed mini », pas ajoutées à VAPP)`:''}
Plan de descente 3° ≈ 318 ft par NM  →  à 3 NM du seuil : ≈ 950 ft
Taux en finale ≈ vitesse sol × 5 = ${fw?140:60} kt × 5 = ${fw?700:300} ft/min</div></div>`+windHTML(MI.dest,dh,'arrivée '+MI.dest+(dr?' piste '+dr:'')); }
  if(kind==='end') return `<div class="box"><b class="t">Débriefing chiffré</b><p>À l'arrivée, le panneau compare : carburant bloc (${kg(L.block)}), consommé réel, étape prévue (${kg(L.trip)}). Un écart s'explique (vent, altitude, attente) et se note.</p></div>`;
  }catch(e){ console.warn('calcBrief',kind,e); }
  return ''; }

/* ---------------- pages ---------------- */
function curMode(){ const p=$('m-peda'), a=$('m-auto'); if(a&&a.checked) return 'auto'; if(p&&!p.checked) return 'free'; return 'guide'; }
function setMode(m){ const p=$('m-peda'), a=$('m-auto'); if(p) p.checked=m==='guide'; if(a) a.checked=m==='auto'; }
function modesHTML(){ const full=!!MI.full, cm=curMode();
  return `<p>Le simulateur propose plusieurs façons d'apprendre. Choisissez <b>avant le vol</b> comment vous voulez être accompagné : ${full?'touchez une des trois premières cartes pour la sélectionner (un seul mode à la fois).':'<b style="color:var(--am)">la mission choisie est un vol libre</b> : pas de procédure au sol ni de guide. Pour le parcours complet guidé : '+`<button type="button" data-full="1">Passer au parcours pilote complet</button>`}</p>
  <div class="modes">${MODES.map(m=>`<div class="mode ${full&&['guide','auto','free'].includes(m.id)&&cm===m.id?'sel':''}" ${full&&['guide','auto','free'].includes(m.id)?`data-mode="${m.id}" role="button" tabindex="0" style="cursor:pointer"`:''}>
    <span class="k">${m.k}</span><h4>${m.ico} ${m.n}</h4><p style="margin:0;font-size:13.5px">${m.what}</p>
    <dl><dt>Vous</dt><dd>${m.you}</dd><dt>Aides</dt><dd>${m.help}</dd><dt>Pour qui</dt><dd>${m.who}</dd></dl><button type="button" class="m-go" data-launch="${m.id}">🚀 Lancer ${m.n.replace(/\s*\(.*\)/,'')} ▸</button></div>`).join('')}</div>
  <h3>Comment progresser</h3><ol><li><b>Lire ce dossier</b> une fois en entier (≈ 15 min) : chaque page correspond à une étape numérotée du guide.</li><li><b>Mode automatique</b> : regarder un vol complet en écoutant les annonces.</li><li><b>Mode guidé</b> : refaire le vol vous-même, le guide coche vos actions.</li><li><b>Sans guide</b>, puis avec des <b>pannes</b> et des <b>scénarios</b>.</li><li>Valider avec le <b>QCM</b>.</li><li>Passer l'<b>examen blanc</b> : sans aide, décollage seulement si tout est validé.</li></ol>
  <div class="box snd"><b class="t">Le son fait partie de l'apprentissage</b>Un pilote entend une panne avant de la lire. Montez le volume (ou mettez un casque) : moteurs, vent, pluie, alarmes, annonces de l'équipage et de l'avion sont simulés en direct. Réglages : bouton « 🔊 Son » de la barre. L'annexe « Les sons du vol » permet de les écouter un par un. <br><button type="button" class="snd-b" data-snd="chime">🔊 Tester : single chime</button><button type="button" class="snd-b" data-snd="callouts">🔊 Tester : annonces radiosonde</button></div>`; }
function overviewHTML(steps){ const groups=[]; steps.forEach((s,i)=>{ let g=groups[groups.length-1]; if(!g||g.ph!==s.ph){ g={ph:s.ph,items:[]}; groups.push(g); } g.items.push([i,s]); });
  return `<p>Voici tout le vol, du minibus jusqu'à l'avion stationné à l'arrivée. ${steps.length} étapes numérotées de 0 à ${steps.length-1} — <b>les mêmes numéros</b> que le panneau du guide pendant le vol. Cliquez une phase pour y aller.</p>
   <div class="tl">${groups.map(g=>`<button type="button" data-go="${BR.pages.findIndex(p=>p.si===g.items[0][0])}"><b>${g.ph}</b><span>Étapes ${g.items[0][0]}${g.items.length>1?' à '+g.items[g.items.length-1][0]:''}<br>${g.items.map(x=>x[1].t.replace(/\s*\(.*?\)/g,'')).slice(0,3).join(' · ')}${g.items.length>3?'…':''}</span></button>`).join('')}</div>
   <h3>En résumé</h3><table><tr><th>Mission</th><td>${esc2(MI.n)}</td></tr><tr><th>Appareil</th><td>${esc2(A.name)} — ${esc2(A.sub)}</td></tr>
   ${MI.dest&&APTS[MI.dest]?`<tr><th>Destination</th><td>${esc2(APTS[MI.dest].n)} · ${fmt(LS.dist||0,0)} km (orthodromie)</td></tr>`:''}
   ${LS.tripH?`<tr><th>Durée de vol prévue</th><td>${Math.floor(LS.tripH)} h ${String(Math.round((LS.tripH%1)*60)).padStart(2,'0')} (accélération du temps possible en croisière)</td></tr>`:''}
   <tr><th>Durées réelles au sol</th><td>${AL()?'Alignement des centrales ≈ 10 min · démarrage ≈ 45 s par moteur · roulage ≈ 10 min':A.kind==='fw'?'Démarrage ≈ 30 s par réacteur · roulage ≈ 10 min':'Démarrage et montée en régime ≈ 2 à 5 min'}</td></tr></table>`; }
function walkHTML(){ const W=WALKPTS[ACK]||[]; return `<p>Sens horaire en partant du nez. Les pastilles jaunes numérotées au sol marquent chaque point : approchez-vous à moins de ${A.kind==='fw'?5:2.6} m pour le valider.</p>`+W.map((p,i)=>`<div class="wp"><span class="n">${i+1}</span><div><b>${p[2]}</b><p>${p[3]}</p>${whyW(p[2])?`<p class="y">Pourquoi : ${whyW(p[2])}</p>`:''}</div></div>`).join(''); }
function stepHTML(s,i,N){ const x=extraFor(s.t), ph=PHX[s.ph]||{}, items=(s.items||[]).map((it,j)=>`<li data-vis="${i}:${j}" title="Voir la commande ou l'écran"><span>${it[0]}<span class="vchip">👁 VOIR</span></span></li>`).join('');
  return `<div><span class="chip">${esc2(s.ph)}</span><span class="chip am">Étape ${i} / ${N}</span>${s.calc?'<span class="chip g">Calcul</span>':''}${s.walk?'<span class="chip g">À pied</span>':''}</div>
   <h1>${s.t}</h1><p>${s.txt}</p>${(s.items||[]).length?`<button type="button" class="visb" data-vis="${i}:-1">👁 Voir les écrans et commandes de cette étape</button>`:''}
   ${items?`<h3>Actions à réaliser (dans cet ordre)</h3><ol class="act">${items}</ol>`:''}
   ${s.walk&&/Tour|visite/i.test(s.t)?`<h3>Les points du tour avion</h3>${walkHTML()}`:''}
   ${i===0?`<h3>Météo de départ — METAR décodé</h3>${decodeMetar(WXS.met[depIcao()])}<h3>Météo de destination</h3>${decodeMetar(MI.dest?WXS.met[MI.dest]:null)}<div class="box"><b class="t">NOTAM et plan de vol</b>Dans la réalité on vérifie aussi les NOTAM (pistes ou feux hors service, travaux, zones militaires actives), le plan de vol déposé (route, niveau, heure) et le compte rendu matériel de l'avion (pannes tolérées par la MEL).</div>`:''}
   ${s.calc?`<h3>Le calcul, pas à pas</h3>${calcBrief(s.calc)}`:''}
   ${x.why?`<div class="box why"><b class="t">Pourquoi</b>${x.why}</div>`:''}
   ${x.err?`<div class="box warn"><b class="t">Erreurs fréquentes</b>${x.err}</div>`:''}
   ${ph.who?`<div class="box who"><b class="t">Qui fait quoi</b>${ph.who}</div>`:''}
   ${ph.hear?`<div class="box snd"><b class="t">Ce que vous entendez</b>${ph.hear}${(ph.snd||[]).length?'<br>'+ph.snd.map(id=>{ const b=SND.BANK.find(z=>z[0]===id); return b?`<button type="button" class="snd-b" data-snd="${id}">🔊 ${b[1]}</button>`:''; }).join(''):''}</div>`:''}
   <p class="sub" style="color:var(--mut);font-size:12.5px">En mode guidé, ces actions se cochent quand vous les faites ; en mode automatique, le simulateur les exécute une à une pendant que vous observez.</p>`; }
function soundsHTML(){ return `<p>Chaque son a un sens. Écoutez-les ici avant le vol : en situation, vous les reconnaîtrez immédiatement.</p><table><tr><th></th><th>Son</th><th>Signification et réaction</th></tr>${SND.BANK.map(b=>`<tr><td><button type="button" class="snd-b" data-snd="${b[0]}">🔊</button></td><td><b>${b[1]}</b></td><td>${b[2]}</td></tr>`).join('')}</table>
  <h3>Ambiances simulées en continu</h3><ul><li><b>Moteurs</b> : soufflante, compresseur, jet, « buzz-saw » à pleine poussée, sifflement de l'APU ; rotor (claquement des pales, rotor de queue) et moteur à pistons du R44. Plus étouffé en cabine, plein et spatialisé dehors (à pied, le son tourne avec votre regard).</li>
  <li><b>Air et sol</b> : souffle qui croît avec la vitesse, train sorti, aérofreins, joints de piste et feux d'axe, freins, inverseurs.</li><li><b>Météo</b> : vent et rafales du METAR, pluie sur le pare-brise (plus forte avec la vitesse), grêle et turbulence dans les cellules orageuses, éclairs et tonnerre retardé selon la distance, essuie-glaces (A320, sélecteur WIPER).</li>
  <li><b>Humains</b> : copilote (annonces SOP), commandant et PNC (annonces cabine), mécanicien sol à l'interphone, passagers (brouhaha, ceintures à l'arrivée).</li></ul><p class="sub" style="color:var(--mut)">Synthèse en temps réel : aucun enregistrement réel ni dialogue d'équipage n'est reproduit. Les voix utilisent la synthèse vocale de votre appareil. Niveaux relatifs [ESTIMÉ].</p>`; }
function genericSteps(){ const fw=A.kind==='fw', d=MI.dest&&APTS[MI.dest]?APTS[MI.dest].n:'destination';
  return fw?[
   {ph:'Préparation',t:'Briefing et dossier de vol',txt:`Vol libre : l'avion est déjà aligné en piste, moteurs en marche. Destination : ${d}.`,items:[]},
   {ph:'Préparation',t:'Devis de masse et centrage',txt:'Masses de référence du simulateur pour cet appareil (le vol libre ne simule pas le carburant).',calc:'ls',items:[]},
   {ph:'Décollage',t:'Décollage',txt:`Volets de décollage, PgUp (ou R) : poussée maximale. Rotation à VR ${A.Vr} kt : flèche ↓ jusqu'à ~15° d'assiette.`,calc:'perf',items:[['Poussée décollage'],['Rotation à VR'],['En vol']]},
   {ph:'Après décollage',t:'Train, volets, pilote automatique',txt:'G : train rentré dès le vario positif ; F / Maj+F : volets ; A : pilote automatique.',items:[['Train rentré'],['Volets rentrés'],['Pilote automatique']]},
   {ph:'Croisière',t:'Croisière',txt:'Accélération du temps (X) sous pilote automatique.',calc:'cruise',items:[]},
   {ph:'Descente',t:'Descente',txt:'Règle des 3 pour le point de descente.',calc:'descent',items:[]},
   {ph:'Approche',t:'Approche',txt:'Volets progressifs, train sorti vers 2 000 ft, vitesse d\'approche.',calc:'landing',items:[['Train sorti'],['Volets atterrissage']]},
   {ph:'Atterrissage',t:'Atterrissage',txt:'Arrondi vers 30 ft, réduction des gaz, freinage (B ou Espace).',items:[['Posé'],['Arrêté']]}]
  :[{ph:'Préparation',t:'Briefing',txt:'Vol libre : hélicoptère posé, moteur(s) en marche.',items:[]},
    {ph:'Décollage',t:'Décollage',txt:'Collectif (PgUp / R) jusqu\'au stationnaire, puis cyclique en avant (↑) pour prendre de la vitesse.',items:[['Stationnaire'],['Translation']]},
    {ph:'Croisière',t:'Croisière',txt:'Cyclique pour la vitesse, collectif pour la hauteur.',items:[]},
    {ph:'Atterrissage',t:'Approche et posé',txt:'Face au vent, réduire progressivement la vitesse, stationnaire puis posé en baissant doucement le collectif.',items:[['Posé']]}]; }
function buildPages(){ BR.pages=[]; let steps=null;
  try{ if(!Object.keys(WXS.met).length) wxInit(); }catch(e){}
  if(BR.fromSim&&GD.on&&GD.steps) steps=GD.steps;
  else { try{ if(BR.keep&&BR.keep.ack===ACK&&BR.keep.mi===selMI){ Object.assign(LS,BR.keep.vals); LS.dist=LS.dist||0; } lsInit(); }catch(e){ console.warn('lsInit',e); }
    if(MI.full){ try{ GD.stands=GD.stands||{}; steps=stepsFor(); }catch(e){ console.warn('stepsFor',e); } } }
  if(!steps) steps=genericSteps();
  BR.steps=steps; const N=steps.length-1;
  BR.pages.push({g:'Avant de commencer',n:'i',t:'Les modes du simulateur expliqués',h:()=>`<span class="chip">Avant de commencer</span><h1>Les modes du simulateur expliqués</h1>`+modesHTML()});
  BR.pages.push({g:'Avant de commencer',n:'ii',t:'Le vol complet en un coup d\'œil',h:()=>`<span class="chip">Avant de commencer</span><h1>Le vol complet en un coup d'œil</h1>`+overviewHTML(steps)});
  BR.steps=steps; steps.forEach((s,i)=>BR.pages.push({g:s.ph,n:String(i),si:i,t:s.t,h:()=>stepHTML(s,i,N)}));
  BR.pages.push({g:'Annexes',n:'A',t:'Les sons du vol : écouter et comprendre',h:()=>`<span class="chip">Annexe</span><h1>Les sons du vol : écouter et comprendre</h1>`+soundsHTML()});
  BR.pages.push({g:'Annexes',n:'B',t:'Commandes',h:()=>{ try{ buildHelp(); }catch(e){} const t=$('help-t'); return `<span class="chip">Annexe</span><h1>Commandes</h1><table>${t?t.innerHTML:''}</table>`; }});
  BR.pages.push({g:'Annexes',n:'C',t:'Limites et sources',h:()=>`<span class="chip">Annexe</span><h1>Limites et sources</h1><p>Procédures <b>pédagogiques</b>, reformulées d'après des sources publiques (manuels de formation, POH, réglementation EASA/FAA). Valeurs marquées [ESTIMÉ] : formules simplifiées, pas les tables du constructeur. Ce simulateur ne remplace ni le manuel de vol ni une formation agréée.</p>${(REFS[ACK]||[]).map(([t,u])=>u?`<p><a href="${u}" target="_blank" rel="noopener" style="color:var(--cy)">${t}</a></p>`:`<p>${t}</p>`).join('')}`});
}

/* ---------------- interface ---------------- */
function dom(){ let b=$('brief'); if(b) return b; b=document.createElement('section'); b.id='brief'; b.hidden=true; b.setAttribute('aria-label','Dossier de vol pas à pas');
  b.innerHTML=`<header class="bh"><button type="button" id="brief-nav-t">☰ Sommaire</button><div style="flex:1;min-width:0"><h2>DOSSIER DE VOL <b>PAS À PAS</b></h2><div class="sub" id="br-sub"></div></div><button type="button" id="br-all" title="Afficher tout le dossier sur une seule page">Tout sur une page</button><button type="button" id="br-snd">🔊 Son</button><button type="button" id="br-x" title="Fermer">✕</button></header>
   <nav id="br-nav"></nav><main id="br-main"></main>
   <footer class="bf"><button type="button" id="br-prev">◀ Précédent</button><span class="num" id="br-n"></span><span class="prog"><i id="br-p"></i></span><button type="button" id="br-next">Suivant ▶</button><span class="sp"></span><button type="button" id="br-skip"></button><button type="button" id="br-go"></button></footer>`;
  document.body.appendChild(b);
  swipe(b);
  $('br-prev').onclick=()=>go(BR.i-1); $('br-next').onclick=()=>go(BR.i+1); $('br-x').onclick=close; $('br-go').onclick=launch; $('br-skip').onclick=launch; $('br-snd').onclick=()=>SND.panel&&SND.panel();
  $('brief-nav-t').onclick=()=>b.classList.toggle('nav'); $('br-all').onclick=()=>{ BR.all=!BR.all; $('br-all').classList.toggle('on',BR.all); render(); };
  b.addEventListener('click',e=>{ const vv=e.target.closest('[data-vis]'); if(vv&&window.VIS){ const [a,c]=vv.dataset.vis.split(':').map(Number); VIS.open(a,c<0?null:c); return; } const t=e.target.closest('[data-launch],[data-go],[data-snd],[data-mode],[data-full]'); if(!t) return;
    if(t.dataset.launch){ e.stopPropagation(); BR.launchMode(t.dataset.launch); return; }
    if(t.dataset.go!=null){ BR.all=false; $('br-all').classList.remove('on'); go(+t.dataset.go); }
    else if(t.dataset.snd){ SND.unlock&&SND.unlock(); setTimeout(()=>SND.play(t.dataset.snd),60); }
    else if(t.dataset.mode){ setMode(t.dataset.mode); render(); }
    else if(t.dataset.full){ selMI=window.FULLOF?FULLOF(selAC||ACK):(A.kind==='fw'?'full-fw':'full-rw'); renderMenu(); prep(); render(); } });
  b.addEventListener('keydown',e=>{ const t=e.target.closest&&e.target.closest('[data-mode]'); if(t&&(e.key==='Enter'||e.key===' ')){ e.preventDefault(); setMode(t.dataset.mode); render(); } });
  b.addEventListener('input',e=>{ const k=e.target.dataset.ls; if(!k) return; LS[k]=Math.max(0,+e.target.value||0); lsCalc(); BR.keep={ack:ACK,mi:selMI,vals:{pax:LS.pax,child:LS.child,bag:LS.bag,cargo:LS.cargo,extra:LS.extra}};
    const box=e.target.closest('#br-calc'); if(box){ const f=k; box.innerHTML=calcHTML(box.dataset.k); const n=box.querySelector(`[data-ls="${f}"]`); if(n){ n.focus(); const v=n.value; n.value=''; n.value=v; } } });
  addEventListener('keydown',e=>{ if(b.hidden) return; if(e.target.tagName==='INPUT') return; if(e.key==='ArrowRight'){ go(BR.i+1); e.stopPropagation(); } else if(e.key==='ArrowLeft'){ go(BR.i-1); e.stopPropagation(); } else if(e.key==='Escape'){ close(); } e.stopPropagation(); },true);
  return b; }
function swipe(b){ let x0=null,y0=0,t0=0,edge=false;
  b.addEventListener('touchstart',e=>{ if(e.touches.length!==1){ x0=null; return; } const t=e.touches[0]; if(e.target.closest('input,table,.f,select')){ x0=null; return; } x0=t.clientX; y0=t.clientY; t0=Date.now(); edge=x0<24; },{passive:true});
  b.addEventListener('touchend',e=>{ if(x0==null) return; const t=e.changedTouches[0], dx=t.clientX-x0, dy=t.clientY-y0; x0=null; if(Date.now()-t0>700||Math.abs(dx)<60||Math.abs(dy)>Math.abs(dx)*0.6) return;
    const navOpen=b.classList.contains('nav'); if(navOpen){ if(dx<0) b.classList.remove('nav'); return; }
    if(edge&&dx>0&&innerWidth<=820){ b.classList.add('nav'); return; }
    if(BR.all) return; if(dx<0) go(BR.i+1); else go(BR.i-1); },{passive:true}); }
function render(){ const b=dom(), P=BR.pages, p=P[BR.i]; let lastG='';
  $('br-sub').textContent=`${A.name} · ${MI.n}${MI.full?' · mode : '+({guide:'pédagogique guidé',auto:'automatique (observation)',free:'sans guide'}[curMode()]):''}`;
  $('br-nav').innerHTML=P.map((q,i)=>{ const g=q.g!==lastG?`<div class="g">${esc2(q.g)}</div>`:''; lastG=q.g; return g+`<button type="button" data-go="${i}" class="${i===BR.i&&!BR.all?'on':''} ${q.seen?'seen':''}"><span class="n">${q.n}</span><span>${esc2(q.t.replace(/<[^>]+>/g,''))}</span></button>`; }).join('');
  const m=$('br-main'); m.innerHTML=(BR.all?'':'')+(BR.all?P.map(q=>`<div class="pg" style="margin-bottom:46px;padding-bottom:20px;border-bottom:2px solid #1d2b3a">${q.h()}</div>`).join(''):`<div class="pg">${p.h()}<p class="swipe-hint">← Glissez pour changer de page →</p></div>`); m.scrollTop=0; p.seen=true;
  $('br-n').textContent=BR.all?`${P.length} pages`:`${BR.i+1} / ${P.length}`; $('br-p').style.width=((BR.i+1)/P.length*100)+'%';
  $('br-prev').disabled=BR.i===0||BR.all; $('br-next').disabled=BR.i>=P.length-1||BR.all;
  const last=BR.i>=P.length-1||BR.all; $('br-go').textContent=BR.fromSim?'Reprendre le vol ▸':'Commencer le vol ▸'; $('br-go').hidden=!last&&!BR.fromSim;
  $('br-skip').textContent=BR.fromSim?'Fermer':'Passer le dossier et voler ▸'; $('br-skip').hidden=last||BR.fromSim; b.classList.remove('nav');
  const on=$('br-nav').querySelector('.on'); if(on) on.scrollIntoView({block:'nearest'}); }
function go(i){ if(i<0||i>=BR.pages.length) return; BR.i=i; render(); }
function prep(){ if(!BR.fromSim){ ACK=selAC; A=AC[ACK]; MI=MISSIONS[selMI]; } buildPages(); }
function show(fromSim,page){ BR.fromSim=!!fromSim; if(fromSim){ BR.wasPaused=paused; paused=true; } prep(); BR.i=page||0; BR.all=false; dom().hidden=false; $('br-all').classList.remove('on'); render(); try{ SND.unlock&&SND.unlock(); }catch(e){} }
function close(){ const b=$('brief'); if(b) b.hidden=true; if(BR.fromSim){ paused=BR.wasPaused; } }
// bouton « Lancer » de chaque carte : démarre directement le parcours correspondant
function launchMode(id){ const fw=(AC[selAC]||A).kind==='fw', full=window.FULLOF?FULLOF(selAC):(fw?'full-fw':'full-rw'), libre=selAC==='b777'?'af-cdg-run':fw?'jfk-cdg':'heli-ny';
  if(BR.fromSim){ BR.fromSim=false; paused=false; }
  let m='guide';
  if(['guide','auto','free','exam'].includes(id)){ if(!MISSIONS[selMI]||!MISSIONS[selMI].full) selMI=full; m=id==='exam'?'guide':id; window.EXAM_PENDING=id==='exam'; }
  else if(id==='libre'){ selMI=libre; m='free'; }
  else if(id==='scn'||id==='radio'){ if(!MISSIONS[selMI]) selMI=libre; m=curMode(); }
  else if(id==='acad'){ const b=$('brief'); if(b) b.hidden=true; if(window.ACAD) ACAD.open(); return; }
  else if(id==='qcm'){ const b=$('brief'); if(b) b.hidden=true; try{ qcmOpen(); }catch(e){} return; }
  try{ renderMenu(); }catch(e){} setMode(m); launch();
  if(id==='scn') setTimeout(()=>{ try{ scnOpen(true); }catch(e){} },600);
  if(id==='radio') setTimeout(()=>{ try{ atcOpen(true); }catch(e){} },600); }
BR.launchMode=launchMode;
function launch(){ const b=$('brief'); if(BR.fromSim){ close(); return; } if(b) b.hidden=true; try{ SND.unlock&&SND.unlock(); }catch(e){} startMission(); }
BR.show=show; BR.close=close; BR.extraFor=extraFor; BR.whyW=whyW; BR.PHX=PHX;

/* ---------------- branchements ---------------- */
// lsInit garde les valeurs saisies dans le dossier pour le vol qui suit
const _lsInit=lsInit; lsInit=function(){ if(BR.keep&&BR.keep.ack===ACK&&BR.keep.mi===selMI&&MI&&MI.full){ _lsInit(); Object.assign(LS,BR.keep.vals); lsCalc(); return; } _lsInit(); };
// démarrage : remise à zéro du son
const _sm=startMission; startMission=function(){ _sm(); try{ SND.reset&&SND.reset(); }catch(e){ console.warn(e); } };
// menu : « Démarrer » ouvre d'abord le dossier
const goB=$('go'); goB.onclick=()=>show(false,0); goB.textContent='Dossier de vol pas à pas puis départ ▸';
{ const n=document.createElement('button'); n.type='button'; n.textContent='ⓘ Comprendre les modes'; n.style.cssText='margin:18px 0 0 10px'; n.onclick=()=>show(false,0); goB.after(n); }
// textes du menu plus explicites
const _rm=renderMenu; renderMenu=function(){ _rm(); const p=$('m-peda'), a=$('m-auto');
  if(p&&!p.dataset.v7){ p.dataset.v7=1; p.nextElementSibling.innerHTML='<b style="font-size:15px">🎓 Mode pédagogique guidé</b> · un panneau numéroté 0 → N vous dit quoi faire et pourquoi ; vos actions dans le cockpit se cochent toutes seules ; « Où ? » montre la commande, « Faire pour moi » exécute l\'étape. Exclusif avec le mode automatique. Décochez les deux pour voler sans guide. <i>(Missions « Parcours pilote complet »)</i>'; }
  if(a&&!a.dataset.v7){ a.dataset.v7=1; a.nextElementSibling.innerHTML='<b style="font-size:15px">▶ Mode automatique (observation)</b> · le simulateur fait tout le vol à votre place, du tour avion au parking, en affichant chaque étape : vous regardez et écoutez, puis vous refaites en mode guidé. Exclusif avec le mode guidé. <i>(Reprise en main : bouton « ▶ Auto »)</i>';
    a.addEventListener('change',()=>{ if(a.checked&&p) p.checked=false; }); p.addEventListener('change',()=>{ if(p.checked&&a) a.checked=false; }); }
  if(p&&a&&p.checked&&a.checked) a.checked=false; };
// barre : rouvrir le dossier pendant le vol
{ const h=$('b-help'); if(h){ const b=document.createElement('button'); b.type='button'; b.id='b-brief'; b.textContent='📋 Procédures'; b.title='Dossier de vol pas à pas (met le vol en pause)'; b.onclick=()=>{ show(true,0); if(GD.on){ const k=BR.pages.findIndex(q=>q.si===GD.i); if(k>=0) go(k); } }; h.before(b); } }
if(!$('menu').hidden) renderMenu();
})();
