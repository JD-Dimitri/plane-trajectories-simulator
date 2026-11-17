/* ===== V10.27 — SIGLES CLIQUABLES DANS TOUS LES DOCUMENTS =====
   Dans les documents de vol (tous les parcours) et la check-list, chaque sigle connu est souligné en pointillé.
   Toucher le sigle ouvre une petite bulle : définition courte, étape du parcours où il intervient, et trois boutons :
     👁 Voir       → ferme le document et montre l'élément encadré dans le cockpit (commande ou écran correspondant) ;
     ← Retour     → revient au sigle souligné dans le document ;
     Poursuivre → → lance le parcours directement à l'étape concernée (point d'entrée = ce sigle).
   Même méthode pour tous les sigles. Les exports PDF / Word / TXT restent sans soulignement. */
(function(){
'use strict';
/* sigle : [définition courte et claire, écran où on le voit (pfd/nd/ewd/sd) ou null, mots-clés supplémentaires pour trouver l'étape] */
const SIG={
 IR:['Inertial Reference — centrale inertielle. Gyroscopes et accéléromètres qui calculent en permanence la position, le cap et l\'assiette de l\'avion, sans aide extérieure. Il faut l\'aligner avion immobile avant le vol.','pfd','inertielles|ADIRS'],
 ADIRS:['Air Data Inertial Reference System — l\'ensemble qui réunit les centrales inertielles (IR) et les calculateurs anémobarométriques (vitesse, altitude). Trois exemplaires sur l\'A320.','pfd','inertielles|IR'],
 AHRS:['Attitude and Heading Reference System — centrale de cap et d\'attitude, version simplifiée de la centrale inertielle (avions d\'affaires, hélicoptères).','pfd','AHRS|inertielles'],
 APU:['Auxiliary Power Unit — petit réacteur placé dans la queue. Au sol, il fournit l\'électricité et l\'air comprimé (climatisation, démarrage des moteurs) sans faire tourner les moteurs principaux.','sd','APU'],
 AVAIL:['Available — « disponible ». Exemple : APU AVAIL = l\'APU tourne et peut fournir électricité et air.','sd','APU'],
 BLEED:['Prélèvement d\'air comprimé sur un moteur ou l\'APU, pour la climatisation, le dégivrage et le démarrage des moteurs.','sd','BLEED|APU'],
 BAT:['Batterie. Premier interrupteur de la mise sous tension : elle alimente les équipements essentiels avant le groupe de parc ou l\'APU.','sd','batteries|BAT'],
 BATT:['Batterie (abréviation Boeing / Learjet).','sd','batteries|BAT'],
 GEN:['Generator — alternateur entraîné par un moteur ou l\'APU, qui produit l\'électricité en vol.','sd','GEN|électrique'],
 ELEC:['Électricité : page ou panneau du circuit électrique (batteries, alternateurs, barres).','sd','électrique|ELEC'],
 EXT:['External — extérieur. EXT PWR : groupe électrique de parc branché au sol ; EXT LT : feux extérieurs.','sd','EXT'],
 ENG:['Engine — moteur. ENG MASTER : interrupteur qui ouvre le carburant et lance la séquence de démarrage.','ewd','Démarrage|ENG'],
 MASTER:['Interrupteur principal. ENG MASTER : carburant et allumage du moteur ; MASTER CAUTION / WARNING : voyants d\'alarme.','ewd','Démarrage|MASTER'],
 IGN:['Ignition — allumage. Position du sélecteur de mode moteur utilisée pour le démarrage.','ewd','Démarrage|IGN'],
 START:['Démarrage (moteur ou APU).','ewd','Démarrage|START'],
 IDLE:['Ralenti : la poussée minimale des moteurs.','ewd','IDLE|ralenti'],
 N1:['Vitesse de rotation de la soufflante (le gros ventilateur avant) d\'un réacteur, en % : c\'est le principal indicateur de poussée.','ewd','N1|Démarrage'],
 N2:['Vitesse de rotation du compresseur haute pression d\'un réacteur, en % : on la surveille au démarrage.','ewd','N2|Démarrage'],
 EGT:['Exhaust Gas Temperature — température des gaz en sortie de turbine. Elle ne doit pas dépasser sa limite, surtout au démarrage.','ewd','EGT|Démarrage'],
 ITT:['Inter-Turbine Temperature — température entre les turbines (turbines à gaz d\'hélicoptères et d\'avions d\'affaires).','ewd','ITT|Démarrage'],
 FF:['Fuel Flow — débit de carburant, en kg/h.','ewd','FF|carburant'],
 FADEC:['Full Authority Digital Engine Control — calculateur qui gère seul le moteur (carburant, démarrage, limites).','ewd','FADEC|Démarrage'],
 NR:['Vitesse de rotation du rotor principal d\'un hélicoptère, en %.','ewd','NR|rotor'],
 NAV:['Navigation. IR sur NAV : centrale en mode navigation ; NAV LT : feux de position (rouge à gauche, vert à droite).','nd','NAV'],
 LOGO:['Feux qui éclairent le logo de la compagnie sur la dérive.',null,'LOGO|Feux'],
 BEACON:['Feu anticollision rouge clignotant : allumé dès qu\'un moteur va démarrer, il prévient le personnel au sol.',null,'BEACON|Before Start'],
 STROBE:['Feux à éclats blancs très puissants, allumés sur la piste et en vol.',null,'STROBE|Décollage'],
 SEAT:['SEAT BELTS — consigne lumineuse « attachez vos ceintures » en cabine.',null,'SEAT|consignes'],
 BELTS:['SEAT BELTS — consigne lumineuse « attachez vos ceintures » en cabine.',null,'SEAT|consignes'],
 AUTO:['Automatique : le système se règle seul.',null,'AUTO'],
 MCDU:['Multipurpose Control and Display Unit — clavier-écran du calculateur de vol (FMS) : on y entre la route, les masses et les vitesses.',null,'MCDU|FMS|Performances'],
 CDU:['Control Display Unit — clavier-écran du calculateur de vol (Boeing).',null,'CDU|FMS|Performances'],
 FMS:['Flight Management System — calculateur de gestion du vol : route, performances, carburant, guidage.','nd','FMS|Performances'],
 FCU:['Flight Control Unit — bandeau sous le pare-brise où l\'on règle le pilote automatique (vitesse, cap, altitude, vitesse verticale).',null,'FCU|pilote automatique'],
 MCP:['Mode Control Panel — bandeau du pilote automatique (équivalent Boeing du FCU).',null,'MCP|pilote automatique'],
 AP:['Autopilot — pilote automatique.','pfd','pilote automatique|AP'],
 AP1:['Pilote automatique numéro 1.','pfd','pilote automatique|AP'],
 ECAM:['Electronic Centralized Aircraft Monitoring — les deux écrans centraux Airbus : moteurs et alarmes (E/WD) en haut, systèmes (SD) en bas.','ewd','ECAM'],
 PFD:['Primary Flight Display — écran de pilotage : assiette, vitesse, altitude, vitesse verticale, cap.','pfd','PFD'],
 ND:['Navigation Display — écran de navigation : route, carte, radar météo.','nd','ND'],
 SD:['System Display — écran ECAM du bas : schémas des systèmes (électricité, APU, carburant, portes…).','sd','SD'],
 EWD:['Engine / Warning Display — écran ECAM du haut : paramètres moteurs, volets et messages d\'alarme.','ewd','EWD'],
 TCAS:['Traffic Collision Avoidance System — système anticollision : il affiche les avions proches et donne un ordre de montée ou de descente (RA) en cas de danger.','nd','TCAS|transpondeur'],
 RA:['Resolution Advisory — ordre d\'évitement du TCAS ; ou Radio-Altimètre : hauteur au-dessus du sol.','pfd','TCAS|RA'],
 THS:['Trimmable Horizontal Stabilizer — plan horizontal réglable de la queue ; on le règle au décollage selon le centrage.',null,'THS|Performances'],
 TOGA:['Take-Off / Go-Around — poussée maximale, au décollage ou pour remettre les gaz.','ewd','TOGA|Décollage'],
 FLX:['Poussée de décollage réduite (« flexible »), calculée avec une température fictive pour ménager les moteurs.','ewd','FLX|FLEX|Décollage'],
 FLEX:['Poussée de décollage réduite, calculée avec une température fictive pour ménager les moteurs.','ewd','FLX|FLEX|Décollage'],
 MCT:['Maximum Continuous Thrust — poussée maximale utilisable sans limite de temps (panne d\'un moteur).','ewd','MCT'],
 V1:['Vitesse de décision au décollage : en dessous on peut s\'arrêter sur la piste, au-dessus on décolle même en cas de panne.','pfd','V1|Décollage|Performances'],
 VR:['Vitesse de rotation : le pilote tire sur le manche pour lever le nez.','pfd','VR|Décollage|Performances'],
 V2:['Vitesse de sécurité au décollage, à tenir en montée initiale si un moteur tombe en panne.','pfd','V2|Décollage|Performances'],
 VAPP:['Vitesse d\'approche finale.','pfd','VAPP|Approche'],
 VREF:['Vitesse de référence à l\'atterrissage (1,23 × vitesse de décrochage en configuration atterrissage).','pfd','VREF|Approche'],
 VLS:['Lowest Selectable Speed — vitesse minimale sélectionnable sur Airbus (marge au décrochage).','pfd','VLS|Approche'],
 KIAS:['Knots Indicated Air Speed — vitesse indiquée en nœuds.','pfd','KIAS|vitesse'],
 ALT:['Altitude.','pfd','ALT|Montée'],
 FL:['Flight Level — niveau de vol : altitude en centaines de pieds, calée sur 1013 hPa (FL340 = 34 000 ft).','pfd','Montée|Croisière|FL'],
 QNH:['Pression ramenée au niveau de la mer. Calée sur l\'altimètre, elle fait afficher l\'altitude au-dessus de la mer.','pfd','QNH|ATIS'],
 ILS:['Instrument Landing System — guidage radio d\'approche : un axe (LOC) et une pente (GLIDE) jusqu\'à la piste.','pfd','ILS|Approche'],
 LOC:['Localizer — partie de l\'ILS qui donne l\'axe de piste.','pfd','LOC|Approche'],
 APPR:['Approach — mode d\'approche du pilote automatique (capture de l\'ILS).','pfd','APPR|Approche'],
 VOR:['Balise radio au sol qui donne la direction de l\'avion par rapport à elle.','nd','VOR'],
 DA:['Decision Altitude — altitude de décision : à ce point, sans la piste en vue, on remet les gaz.','pfd','DA|Approche'],
 DH:['Decision Height — hauteur de décision (mesurée au-dessus de la piste).','pfd','DH|Approche'],
 MDA:['Minimum Descent Altitude — altitude minimale de descente d\'une approche sans guidage vertical.','pfd','MDA|Approche'],
 FAF:['Final Approach Fix — point d\'approche finale : début de la descente finale.','nd','FAF|Approche'],
 IAF:['Initial Approach Fix — point de début de l\'approche.','nd','IAF|Approche'],
 IF:['Intermediate Fix — point intermédiaire de l\'approche.','nd','IF|Approche'],
 SID:['Standard Instrument Departure — procédure de départ normalisée, depuis la piste jusqu\'à la route.','nd','SID|FMS|Décollage'],
 STAR:['Standard Arrival Route — procédure d\'arrivée normalisée, de la route jusqu\'à l\'approche.','nd','STAR|Descente'],
 DCT:['Direct : route en ligne droite entre deux points.','nd','DCT|FMS'],
 NAT:['North Atlantic Tracks — routes océaniques de l\'Atlantique Nord, redéfinies chaque jour selon les vents.','nd','NAT|Croisière'],
 RWY:['Runway — piste.','nd','roulage|piste'],
 TWY:['Taxiway — voie de circulation (roulage).','nd','roulage|TWY'],
 METAR:['Observation météo d\'un aérodrome, toutes les 30 ou 60 min : vent, visibilité, nuages, température, QNH.',null,'Briefing|METAR'],
 TAF:['Prévision météo d\'un aérodrome pour les heures à venir.',null,'Briefing|TAF'],
 NOTAM:['Notice to Airmen — avis aux navigants : piste fermée, balise en panne, travaux… À lire avant chaque vol.',null,'Briefing|NOTAM'],
 NOTAMN:['NOTAM nouveau (le N final signifie « new »).',null,'Briefing|NOTAM'],
 ATIS:['Message radio enregistré et répété en boucle : météo, piste en service, QNH. On l\'écoute avant d\'appeler la tour.',null,'ATIS|radio'],
 TEMSI:['Carte du temps significatif (fronts, nuages, givrage, turbulence) pour les vols à moyenne et basse altitude.',null,'Briefing'],
 WINTEM:['Carte des vents et températures en altitude.',null,'Briefing'],
 SIGWX:['Significant Weather — carte du temps significatif en haute altitude (jet-streams, cumulonimbus, turbulence).',null,'Briefing'],
 CAVOK:['Ceiling And Visibility OK — visibilité ≥ 10 km, pas de nuage gênant, pas de phénomène significatif.',null,'Briefing|METAR'],
 NOSIG:['No significant change — pas de changement significatif prévu dans les 2 heures.',null,'Briefing|METAR'],
 BECMG:['Becoming — évolution progressive prévue dans un TAF.',null,'Briefing|TAF'],
 TEMPO:['Temporairement : variation passagère prévue dans un TAF.',null,'Briefing|TAF'],
 FEW:['Quelques nuages (1 à 2 octas du ciel couverts).',null,'Briefing|METAR'],
 SCT:['Scattered — nuages épars (3 à 4 octas).',null,'Briefing|METAR'],
 BKN:['Broken — nuages fragmentés (5 à 7 octas) : c\'est un plafond.',null,'Briefing|METAR'],
 OVC:['Overcast — ciel couvert (8 octas).',null,'Briefing|METAR'],
 CB:['Cumulonimbus — nuage d\'orage, à éviter absolument (turbulence, grêle, foudre).',null,'Briefing|METAR'],
 RVR:['Runway Visual Range — portée visuelle de piste, mesurée le long de la piste.',null,'Briefing|METAR'],
 FIR:['Flight Information Region — région d\'information de vol, l\'espace aérien géré par un centre de contrôle.','nd','Briefing|FIR'],
 UTC:['Temps universel coordonné : l\'heure de référence de l\'aviation, la même partout dans le monde.',null,'Briefing'],
 ETD:['Estimated Time of Departure — heure de départ prévue.',null,'Briefing'],
 ETA:['Estimated Time of Arrival — heure d\'arrivée prévue.',null,'Briefing'],
 EET:['Estimated Elapsed Time — durée de vol estimée.',null,'Briefing'],
 OFP:['Operational Flight Plan — plan de vol exploitation : route, carburant, temps, calculés par la compagnie.',null,'Briefing|carburant'],
 FPL:['Plan de vol déposé auprès du contrôle aérien (format OACI).',null,'Briefing'],
 ZFW:['Zero Fuel Weight — masse sans carburant : avion + équipage + passagers + bagages + fret.',null,'Devis|masse'],
 TOW:['Take-Off Weight — masse au décollage = ZFW + carburant embarqué − carburant de roulage.',null,'Devis|masse'],
 LW:['Landing Weight — masse à l\'atterrissage = TOW − carburant consommé pendant le vol.',null,'Devis|masse'],
 MZFW:['Maximum Zero Fuel Weight — masse sans carburant maximale certifiée.',null,'Devis|masse'],
 MTOW:['Maximum Take-Off Weight — masse maximale au décollage certifiée.',null,'Devis|masse'],
 MLW:['Maximum Landing Weight — masse maximale à l\'atterrissage certifiée.',null,'Devis|masse'],
 DOW:['Dry Operating Weight — masse de base en exploitation : avion équipé avec équipage, sans charge ni carburant.',null,'Devis|masse'],
 LMC:['Last Minute Change — modification de dernière minute du devis de masse.',null,'Devis|masse'],
 CG:['Centre de gravité : point d\'équilibre de l\'avion ; il doit rester entre deux limites (centrage).',null,'Devis|centrage'],
 MAC:['Mean Aerodynamic Chord — corde aérodynamique moyenne ; le centrage s\'exprime en % de cette longueur.',null,'Devis|centrage'],
 CDB:['Commandant de bord : le pilote responsable du vol.',null,'Briefing|carburant'],
 OPL:['Officier pilote de ligne (copilote).',null,'Briefing'],
 CI:['Cost Index — indice de coût : réglage FMS qui arbitre entre économie de carburant et rapidité.',null,'FMS|Performances|CI'],
 CRM:['Crew Resource Management — travail en équipage : communication, répartition des tâches, gestion des erreurs.',null,'Briefing'],
 MEL:['Minimum Equipment List — liste des équipements qui peuvent être en panne sans interdire le vol.',null,'Briefing|technique'],
 NOTOC:['Notification to Captain — information du commandant sur les marchandises dangereuses à bord.',null,'Briefing|fret'],
 ATC:['Air Traffic Control — contrôle de la circulation aérienne.',null,'radio|ATC'],
 VFR:['Visual Flight Rules — vol à vue : le pilote se guide en regardant dehors.',null,'VFR'],
 IFR:['Instrument Flight Rules — vol aux instruments, suivi par le contrôle.',null,'IFR'],
 VRP:['Visual Reporting Point — point de report visuel (repère au sol) pour les vols VFR.','nd','VRP|circuit'],
 TA:['Transition Altitude — altitude de transition : en montée, au-dessus, on cale l\'altimètre sur 1013 hPa.','pfd','Montée|TA'],
 MSL:['Mean Sea Level — niveau moyen de la mer.','pfd',''],
 SFC:['Surface — le sol.',null,''],
 NM:['Nautical Mile — mille nautique = 1 852 m.',null,''],
 OACI:['Organisation de l\'aviation civile internationale : elle fixe les règles mondiales (codes, procédures).',null,''],
 EASA:['Agence européenne de la sécurité aérienne : elle fixe les règles en Europe (licences, opérations).',null,''],
 AIP:['Aeronautical Information Publication — publication officielle de chaque pays : aérodromes, cartes, règles.',null,'Briefing'],
 PPL:['Private Pilot Licence — licence de pilote privé.',null,''],
 SEL:['Sélecteur.',null,''],
 STBY:['Standby — veille / secours.',null,''],
 XPDR:['Transpondeur : il répond au radar du contrôle avec un code à 4 chiffres et l\'altitude.',null,'transpondeur|XPDR'],
 CUTOFF:['Étouffoir : coupe l\'arrivée de carburant pour arrêter un moteur à pistons.','ewd','Arrêt|mixture'],
 RICH:['Mélange riche (plus de carburant) : position de la manette de mixture pour démarrer et décoller.','ewd','Démarrage|mixture'],
 LDG:['Landing — atterrissage.','pfd','Atterrissage'],
 LND:['Landing — atterrissage (feux d\'atterrissage, page atterrissage).',null,'Atterrissage|LAND'],
 CONF:['Configuration des volets et becs (CONF 1, 2, 3, FULL).','ewd','volets|CONF'],
 THR:['Thrust — poussée (manettes de poussée).','ewd','poussée|THR'],
 KJFK:['Code OACI de l\'aéroport John F. Kennedy, New York.','nd',''],LFPG:['Code OACI de Paris-Charles-de-Gaulle.','nd',''],LFPO:['Code OACI de Paris-Orly.','nd',''],LFPB:['Code OACI de Paris-Le Bourget.','nd',''],LFPN:['Code OACI de Toussus-le-Noble (aérodrome école, au sud-ouest de Paris).','nd',''],FMEE:['Code OACI de La Réunion Roland-Garros.','nd',''],KJRB:['Code OACI de l\'héliport de Downtown Manhattan (Wall Street).','nd',''],KLGA:['Code OACI de New York LaGuardia.','nd',''],KEWR:['Code OACI de Newark.','nd',''],CYQX:['Code OACI de Gander (Terre-Neuve), aérodrome de dégagement transatlantique.','nd',''],BIKF:['Code OACI de Keflavík (Islande), aérodrome de dégagement transatlantique.','nd','']
};
window.SIGLES=SIG;
let RX=null, KC=0; function rx(){ const K=Object.keys(SIG); if(K.length!==KC){ KC=K.length; K.sort((a,b)=>b.length-a.length); RX=new RegExp('(^|[^A-Za-z0-9À-ÿ])('+K.join('|')+')(?![A-Za-z0-9À-ÿ])','g'); } return RX; }   // reconstruit si d'autres modules ajoutent des sigles
const ROOTS=['#docv .paper','#ckl'];
const css=document.createElement('style'); css.textContent=`.sig{text-decoration:underline dotted #b0207f 2px;text-underline-offset:3px;cursor:help;border-radius:3px}.sig:hover,.sig.on{background:#f6d6f3}#ckl .sig:hover,#ckl .sig.on{background:#3a1238}
.sig.fl{animation:sigfl 1.6s 2}@keyframes sigfl{50%{background:#ffe066}}
#sigb{position:fixed;z-index:120;width:min(340px,calc(100vw - 16px));background:#0d1a26;color:#e8eef2;border:2px solid #e04ad8;border-radius:12px;padding:10px 12px;font:13.5px/1.45 Inter,sans-serif;box-shadow:0 10px 30px #000c}
#sigb b.t{font:700 19px 'Barlow Condensed',sans-serif;letter-spacing:.05em;color:#ff9cf5}#sigb .st{margin:7px 0 2px;padding:6px 8px;background:#132232;border-radius:8px;font-size:12.5px}#sigb .bt{display:flex;gap:6px;margin-top:8px;flex-wrap:wrap}
#sigb button{flex:1;background:#132232;color:#fff;border:1px solid #2b3d50;border-radius:9px;padding:8px 6px;font:700 13px 'Barlow Condensed',sans-serif;letter-spacing:.05em;text-transform:uppercase;cursor:pointer}#sigb button.p{background:#e04ad8;border-color:#e04ad8}#sigb button:disabled{opacity:.4}
#sigfr{position:fixed;z-index:110;border:3px solid #3fd0ff;border-radius:8px;box-shadow:0 0 0 2000px #0006,0 0 18px #3fd0ff;pointer-events:none;transition:all .25s}#sigfr span{position:absolute;left:-3px;top:-26px;background:#3fd0ff;color:#041018;font:700 14px 'Barlow Condensed',sans-serif;padding:2px 8px;border-radius:6px 6px 0 0;white-space:nowrap}
#sigret{position:fixed;z-index:121;left:50%;top:10px;transform:translateX(-50%);display:flex;gap:6px}#sigret button{background:#e04ad8;color:#fff;border:0;border-radius:10px;padding:10px 14px;font:700 14px 'Barlow Condensed',sans-serif;letter-spacing:.05em;text-transform:uppercase;box-shadow:0 4px 14px #000a;cursor:pointer}#sigret button.s{background:#132232;border:1px solid #3fd0ff}`;
document.head.appendChild(css);
/* ---------- soulignement ---------- */
function mark(root){ if(!root||root.isContentEditable||root.closest('[contenteditable="true"]')) return; rx(); const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>{ const p=n.parentElement; if(!p||p.closest('.sig,button,input,textarea,select,script,style,svg,.hd,nav')) return NodeFilter.FILTER_REJECT; RX.lastIndex=0; return RX.test(n.nodeValue)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT; }});
 const list=[]; while(w.nextNode()) list.push(w.currentNode);
 for(const n of list){ const s=n.nodeValue, f=document.createDocumentFragment(); let last=0; RX.lastIndex=0; let m;
  while((m=RX.exec(s))){ const i=m.index+m[1].length; if(i>last) f.appendChild(document.createTextNode(s.slice(last,i))); const sp=document.createElement('span'); sp.className='sig'; sp.dataset.sig=m[2]; sp.textContent=m[2]; f.appendChild(sp); last=i+m[2].length; }
  if(last<s.length) f.appendChild(document.createTextNode(s.slice(last))); n.replaceWith(f); } }
function unmark(root){ root.querySelectorAll('.sig').forEach(s=>s.replaceWith(s.textContent)); root.normalize&&root.normalize(); }
let busy=false; function scan(){ if(busy) return; busy=true; try{ for(const r of ROOTS) document.querySelectorAll(r).forEach(el=>{ if(el.offsetParent===null&&getComputedStyle(el).position!=='fixed') return; if(el.isContentEditable) unmark(el); else mark(el); }); }catch(e){ console.warn('sigles',e); } busy=false; }
new MutationObserver(()=>{ clearTimeout(scan.t); scan.t=setTimeout(scan,60); }).observe(document.body,{childList:true,subtree:true,characterData:false});
/* ---------- étape du parcours où le sigle intervient ---------- */
function wre(k){ return new RegExp('(^|[^A-Za-z0-9])'+k.replace(/[/]/g,'\\/')+'(?![A-Za-z0-9])'); }
function findStep(k){ const steps=(typeof GD!=='undefined'&&GD.on&&GD.steps)||[]; if(!steps.length) return null; const r=wre(k), kw=SIG[k][2]?new RegExp(SIG[k][2],'i'):null;
 const lab=s=>(s.items||[]).map(i=>i[0]).join(' · '), tries=[s=>r.test(s.t),s=>r.test(lab(s)),s=>kw&&kw.test(s.t),s=>r.test(s.txt||''),s=>kw&&kw.test(lab(s))];
 for(const f of tries){ const i=steps.findIndex(s=>{ try{ return f(s); }catch(e){ return false; } }); if(i>=0) return i; } return null; }
function targetOf(k,si){ const st=si!=null?GD.steps[si]:null, r=wre(k);
 if(st){ const it=(st.items||[]).find(i=>i[3]&&r.test(i[0]))||(SIG[k][1]?null:(st.items||[]).find(i=>i[3])); if(it) return {sel:it[3],lab:it[0]}; }
 const scr=SIG[k][1]||(window.PT&&PT.scrFor?PT.scrFor(k):null); return scr?{scr}:null; }
/* ---------- bulle ---------- */
let CUR=null;   // {k, el, idx, root, si}
function bubble(el){ const k=el.dataset.sig, d=SIG[k]; if(!d) return; closeB(); const rootSel=el.closest('#ckl')?'#ckl':'#docv'; const all=[...document.querySelectorAll(rootSel+' .sig')].filter(s=>s.dataset.sig===k);
 const si=findStep(k); CUR={k,idx:all.indexOf(el),root:rootSel,si}; el.classList.add('on'); const st=si!=null?GD.steps[si]:null, tg=targetOf(k,si);
 const b=document.createElement('div'); b.id='sigb';
 b.innerHTML=`<b class="t">${k}</b> : ${d[0]}<div class="st">${st?`📍 Se situe à l'étape <b>${si}</b> : ${String(st.t).replace(/<[^>]+>/g,'')}`:(typeof GD!=='undefined'&&GD.on?'Ce sigle n\'est pas lié à une étape précise de ce parcours.':'Lancez un parcours guidé pour relier ce sigle à son étape.')}</div>
  <div class="bt"><button type="button" data-v ${tg?'':'disabled'}>👁 Voir</button><button type="button" data-r>← Retour</button><button type="button" class="p" data-c ${st?'':'disabled'}>Poursuivre →</button></div>`;
 document.body.appendChild(b); const r=el.getBoundingClientRect(), W=b.offsetWidth, H=b.offsetHeight; let x=Math.min(innerWidth-W-8,Math.max(8,r.left+r.width/2-W/2)), y=r.bottom+8; if(y+H>innerHeight-8) y=Math.max(8,r.top-H-8); b.style.left=x+'px'; b.style.top=y+'px';
 b.onclick=e=>{ const t=e.target.closest('button'); if(!t) return; if(t.dataset.r!=null){ closeB(); back(false); } if(t.dataset.v!=null) see(); if(t.dataset.c!=null) go(); }; }
function closeB(){ const b=document.getElementById('sigb'); if(b) b.remove(); document.querySelectorAll('.sig.on').forEach(s=>s.classList.remove('on')); }
function hideRoot(){ if(!CUR) return; if(CUR.root==='#ckl'){ const c=document.getElementById('ckl'); if(c) c.hidden=true; } else { const v=document.getElementById('docv'); if(v) v.hidden=true; } }
function clearSee(){ clearInterval(clearSee.t); ['sigfr','sigret'].forEach(id=>{ const e=document.getElementById(id); if(e) e.remove(); }); document.querySelectorAll('.hl').forEach(e=>e.classList.remove('hl')); }
function see(){ if(!CUR) return; const k=CUR.k, tg=targetOf(k,CUR.si); if(!tg) return; closeB(); hideRoot();
 try{ if(typeof view!=='undefined'&&view!=='ck') setView('ck'); }catch(e){}
 if(tg.sel){ try{ highlight(tg.sel,false); }catch(e){} }
 const fr=document.createElement('div'); fr.id='sigfr'; fr.innerHTML=`<span>${k}${tg.lab?' · '+tg.lab:tg.scr&&window.PT?' · '+PT.scrName(tg.scr):''}</span>`; document.body.appendChild(fr);
 const rb=document.createElement('div'); rb.id='sigret'; rb.innerHTML=`<button type="button" data-r>← Retour à ${k}</button>${CUR.si!=null?'<button type="button" class="s" data-c>Poursuivre →</button>':''}`; document.body.appendChild(rb);
 rb.onclick=e=>{ const t=e.target.closest('button'); if(!t) return; if(t.dataset.r!=null){ clearSee(); back(true); } else { clearSee(); go(true); } };
 const pos=()=>{ let rc=null; try{ if(tg.sel){ const el=window.PT?PT.el(tg.sel):document.querySelector(tg.sel); const t=el&&(el.closest('.sw')||el); if(t&&t.offsetParent!==null) rc=t.getBoundingClientRect(); } if(!rc&&tg.scr&&window.PT&&PT.scrRect) rc=PT.scrRect(tg.scr); }catch(e){}
  if(rc&&rc.width>0){ fr.style.display=''; fr.style.left=(rc.left-5)+'px'; fr.style.top=(rc.top-5)+'px'; fr.style.width=(rc.width+10)+'px'; fr.style.height=(rc.height+10)+'px'; } else fr.style.display='none'; };
 setTimeout(pos,80); clearSee.t=setInterval(pos,300); }
function back(reopen){ const c=CUR; if(!c) return;
 if(reopen){ if(c.root==='#ckl'){ const e=document.getElementById('ckl'); if(e) e.hidden=false; } else if(window.DOCS&&DOCS.reopen) DOCS.reopen(); else { const v=document.getElementById('docv'); if(v) v.hidden=false; } }
 setTimeout(()=>{ scan(); const all=[...document.querySelectorAll(c.root+' .sig')].filter(s=>s.dataset.sig===c.k), el=all[c.idx]||all[0]; if(el){ el.scrollIntoView({block:'center'}); el.classList.remove('fl'); void el.offsetWidth; el.classList.add('fl'); } },reopen?250:0); }
function go(already){ const c=CUR; if(!c||c.si==null) return; closeB(); if(!already) hideRoot(); clearSee(); try{ if(window.DOCS&&DOCS.close) DOCS.close(); }catch(e){}
 try{ if(c.si!==GD.i&&window.JUMP) JUMP(c.si,(typeof AUTO!=='undefined'&&AUTO.on)?'auto':'guide'); else if(typeof goStep==='function') goStep(c.si); }catch(e){ console.warn(e); } try{ flash(`Étape ${c.si} : point d'entrée ${c.k}`,'am'); }catch(e){} }
/* toucher un sigle (capture : passe avant les lignes cliquables du document) */
addEventListener('click',e=>{ const s=e.target.closest&&e.target.closest('.sig'); if(s&&!s.closest('[contenteditable="true"]')){ e.preventDefault(); e.stopPropagation(); bubble(s); return; }
 if(document.getElementById('sigb')&&!e.target.closest('#sigb')) closeB(); },true);
window.SIGUI={scan,bubble,findStep};
})();
