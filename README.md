# PLANE TRAJECTORIES — simulateur de vol pédagogique

Simulateur web (un seul fichier HTML) pour comprendre et vivre le métier de pilote, du tour de l'avion à pied jusqu'à l'avion stationné à destination.

## Lancer

Ouvrir `index.html` dans un navigateur récent, ou le servir localement :

```bash
python3 -m http.server 8000   # puis http://localhost:8000
```

Il faut une connexion internet pour three.js et les polices (CDN).

## Ce que contient le simulateur

- **Monde** : globe 3D réel, aéroports et pistes réels (JFK, CDG, héliports de Manhattan), jour, crépuscule ou nuit, météo réelle (METAR / ATIS).
- **Appareils** : Airbus A320-200, Learjet 60, H125, Robinson R44, Sikorsky S-76.
- **Cockpit A320** : panneau plafond, pédestal, FCU, écrans PFD, ND, E/WD et SD dessinés en direct.
- **Parcours pilote complet** en étapes numérotées 0 → N : préparation, tour avion, mise sous tension, démarrage, roulage, décollage, croisière, approche, atterrissage, parking.
- **Modes** (exclusifs) : pédagogique guidé, automatique (observation), sans guide, vol libre, scénarios et pannes, QCM, radio ATC.
- **Dossier de vol pas à pas** affiché avant le vol : modes expliqués, METAR décodé, tour avion, calculs détaillés (masse et centrage, carburant, V1/VR/V2, vent, descente).
- **Mode automatique** : bulle par étape avec chronomètre, hiérarchie `PILOTER L'APPAREIL › PARTIE › ÉTAPE › SOUS-ÉTAPE n/N`, commandes encadrées en rouge et numérotées (vert quand c'est fait), sous-étape finale sur l'écran du résultat.
- **Académie** (avant le simulateur) : cours débutant (l'avion et ses parties, comment il vole, moteurs, instruments, météo, navigation et radio, le métier de pilote), cours du simulateur (phases, calculs), le vrai pilotage (LAPL / PPL, médical, école, examen théorique à 9 épreuves, budget) et la reconversion vers pilote de ligne (médical classe 1, voies ENAC / cadets / intégré / modulaire, financement, formation), et anatomie de chaque appareil couche par couche (peau extérieure → structure → isolation → réseaux → revêtements → habitacle ; avant, corps, arrière). Questions en fin de module, progression gardée.
- **Examen blanc** : vol complet sans aide, blocs et écrans encadrés `[ ? ]` sans nommer la commande, QCM d'aide après 30 s, questions de calcul (masse, carburant, VR, descente, VAPP) et de tour avion, décollage seulement si tout est validé (sinon épreuve éliminatoire), tableau ✓ / ✗ et bloc-notes final avec renvoi vers le dossier, le mode automatique ou le mode guidé de l'étape ratée.
- **Scénarios guidés** (US Airways 1549, Germanwings 9525 sur le vrai trajet Barcelone → Düsseldorf au FL380 au-dessus des Alpes, sans le crash (la partie critique devient une urgence : commandant hors du poste, dépressurisation, descente d'urgence arrêtée à l'altitude de sécurité, retour au poste, surveillance croisée), module sécurité du poste,, fuite carburant fictive, pannes) avec le même système de cadres rouges / verts numérotés.
- **Bouton « Lancer »** sur chaque carte de mode du dossier : le parcours correspondant démarre directement.
- **Modèles 3D aux cotes réelles** (constructeurs, certificats de type EASA) : A320-200 avec sharklets et CFM56, Learjet 60 à empennage en T et réacteurs arrière, H125 (rotor 3 pales), R44 (2 pales), S-76 (4 pales, train rentrant) ; train qui rentre en vol, rotors principal et arrière animés.
- **Actions incohérentes** : une commande actionnée contre la procédure (train sorti en croisière, volets au-delà de la VFE, vanne de pressurisation ouverte en altitude, moteur coupé en vol, frein rotor en vol…) ouvre un cadre **jaune clignotant** avec l'explication ; si l'on force, un cadre **rouge** affiche les conséquences et l'action est appliquée (plus de 40 règles, A320, Learjet et hélicoptères).
- **Écrans agrandis** : un toucher sur un écran du tableau de bord l'ouvre en grand, en direct, avec une légende de lecture.
- **Décor** : tours de contrôle réelles (JFK 98 m, Roissy Nord 112 m, Sud ≈ 90 m, Centrale 75 m, Est 60 m), aérogares, hangars, Manhattan et Paris avec leurs monuments.
- **Son** 100 % synthétisé (Web Audio) : moteurs, rotors, vent, roulage, alarmes réelles, annonces radiosonde, équipage et cabine, météo, aéroport.
- **Mobile** : image recentrée pour voir la piste, barre compacte, panneaux déplaçables et fermables, glisser pour changer de page.

Les valeurs marquées [ESTIMÉ] sont des approximations pédagogiques et les systèmes marqués [SIMULÉ] sont simplifiés. Ce simulateur ne remplace ni un manuel de vol ni une formation agréée.

## Structure du dépôt

| Chemin | Rôle |
| --- | --- |
| `index.html` | Le simulateur complet, prêt à publier (généré) |
| `src/base.html` | Moteur du simulateur (monde, appareils, cockpit, guide, ATC, météo…) |
| `src/addons/*.js` | Modules : `audio`, `brief` (dossier pas à pas, boutons Lancer), `bubble` (bulle du mode automatique et fiabilité des étapes), `drag`, `close`, `view` (affichage mobile), `frames` (cadres numérotés, hiérarchie, pushback), `scn` (scénarios guidés), `exam` (examen blanc), `acad` (Académie), `models` (modèles 3D), `decor` (tours et villes), `zoom` (écrans agrandis), `guard` (actions incohérentes) |
| `tools/build.py` | Assemble `src/` en `index.html` |
| `tests/auto_flight.py` | Vol complet automatique accéléré, détecte les blocages d'étape |
| `tests/exam_blanc.py` | Examen blanc piloté par un élève simulé (`perfect` : réussite et décollage ; `wrong` : épreuve éliminatoire) |

Après une modification dans `src/` :

```bash
python3 tools/build.py
```

## Tester

```bash
cd tests && npm i three@0.128.0 && pip install playwright && python3 -m playwright install chromium && cd ..
python3 tools/build.py --test
cd tests && python3 -m http.server 8765 &
python3 auto_flight.py a320     # puis lj60, h125, r44, s76
```

Dernière vérification (V8.0) : examen blanc A320 complet réussi (25/25, décollage puis atterrissage et parking) et cas éliminatoire vérifié ; vol automatique complet sans blocage sur les 5 appareils (V7.3).

## Historique récent

| Version | Changement |
| --- | --- |
| V8.13 | Menu : plus de rubrique « Mission », un clic sur l'appareil lance son parcours ; ligne directrice cliquable des étapes de chaque appareil ; bouton Réinitialiser |
| V9.0 | Atelier des systèmes : commandes réelles, écran système et schéma de l'appareil où chaque bouton colore les pièces qu'il actionne (électricité, carburant, hydraulique, air, gouvernes) avec la logique de fonctionnement ; A320, Learjet 60, H125, S-76, R44 ; démonstrations commentées ; Académie partie 5 réécrite en cours aéronautique (structures, moteurs, circuits, calculateurs) |
| V9.1 | Atelier : modes Libre, Automatique (cadre rouge puis vert, pièces éclairées), Pédagogique (commande attendue en rouge, mauvaise commande refusée et expliquée) et Examen (sans aide, erreurs et conséquences, note sur 20) pour chaque appareil ; sons synthétisés (APU, réacteurs, démarreur, allumage, hydraulique, PTU, alarme feu, rotor, moteur à pistons, déclics) |
| V9.2 | Plus de vol lancé avec l'appareil d'une session précédente : depuis l'Académie ou le dossier, le choix de l'appareil est demandé ; atelier R44 aligné sur le Raven II du simulateur (injection, pompe auxiliaire, servocommandes hydrauliques) |
| V9.3 | Bouton « ← Appareils » dans tous les écrans (vol, dossier, Académie, atelier, fiches) : retour direct au choix de l'appareil |
| V10.0 | Atelier : parcours complet vu de dessus (aéroport, présentation de l'équipage, minibus, tour avion à pied avec bruit de pas, embarquement, tracteur de repoussage, mise en route, roulage, décollage, croisière, atterrissage, débarquement) sans 3D, l'appareil fixe et le décor qui défile ; feuille d'équipage et manifeste avant le départ ; dialogues équipage, sol, tour et cabine (texte + voix, bouton audio seul) ; panneau de communications fonctionnel ; pannes : double panne moteur et amerrissage, dépressurisation, feu moteur au décollage ; parcours complet pour les 5 appareils |
| V10.1 | Atelier : accidents (scénarios fictifs inspirés d'accidents réels) avec chaîne des événements, facteurs signalés en rouge, effets sobres (impact, étincelles, fumée, sortie de piste), analyse (causes, facteurs, ce qu'il fallait faire) et version corrigée à rejouer — A320 : sortie de piste, décrochage après givrage des sondes, décollage sans volets, atterrissage train rentré, panne sèche après fuite, collision sur la piste ; H125 et S-76 : panne moteur sans autorotation, anneau tourbillonnaire ; R44 : faible g et choc du mât, panne moteur ; Learjet 60 : éclatement de pneu et interruption tardive |
| V10.2 | Bouton « ☑ Checklist » en haut de l'écran pendant le parcours : sous-étapes faites en vert, manquantes en rouge (avec compteur) ; un toucher sur une ligne rouge ouvre le panneau et met en évidence la commande à utiliser ; passage à l'étape suivante bloqué tant qu'une sous-étape manque (« Passer quand même » possible) ; checklist aussi dans l'Atelier des systèmes |
| V10.3 | Dossier de vol : 19 documents (plan de vol = check-list complète en direct avec lignes vertes/rouges cliquables, OFP / log de navigation, plan de vol OACI, METAR/TAF, ATIS, TEMSI, WINTEM, NOTAM, carte de route, SID, approche ILS, carte d'aérodrome, devis de masse et centrage, bilan carburant, performances, NOTOC, compte rendu matériel, manifeste, check-lists) ; export PDF et TXT ; accès depuis le sélecteur d'étapes, le guide, la bulle et la barre ; tour avion automatique à vitesse de marche (÷ 2,5) |
| V10.4 | Objets solides : l'appareil (fuselage, nacelles, trains, ailes basses, poutres, patins) et tous les bâtiments ne se traversent plus à pied (contournement automatique, glissement le long des parois) ; l'appareil qui heurte un bâtiment s'écrase ; on ne marche pas sur l'eau ; nuages traversables avec visibilité réduite, turbulence et alerte givrage. Rubrique « Missions et scénarios réels » restaurée dans le menu (Germanwings 9525, US Airways 1549, scénario fictif, vols libres, N722BD). Temps : « Temps réel (durées réelles) » sans accélération automatique, ×1, ×2, ×5, ×10, ×20, ×50 |
| V10.5 | Mode d'emploi des instruments : bouton « ⓘ Mode d'emploi » — toucher un instrument, un bouton ou un écran (PFD, ND, E/WD, SD, MCDU, FCU, ECAM, plafonnier, pédestal) n'actionne rien et ouvre une fiche : ce que c'est, si on peut l'activer maintenant, pourquoi pas (alimentation, ordre de la procédure, logique de l'avion), ce qui se passe si on l'active, et le numéro d'étape du parcours ; liste numérotée dans l'ordre des étapes. Vérification automatique de toutes les commandes des 5 appareils. Boeing 777-300ER (Air France, Air Austral) : Paris-CDG / Orly (historique) ↔ La Réunion Roland-Garros, modèle 3D et livrées (couleurs seules), route pédagogique, aéroports LFPO et FMEE |
| V10.6 | Durées réelles des étapes : TEMPS → « Durées réelles (×1) » ou « Temps accéléré ×2, ×5, ×10, ×20, ×30, ×50 » ; chaque étape au sol dure son temps réel divisé par l'accélération (dossier de vol 30 min, devis de masse 20 min, carburant 10 min, tour avion 15 min, FMS 10 min…), compteur dans le guide et la bulle, en mode guidé proposition d'accélérer puis passage automatique ; accélération > ×4 permise à l'arrêt au sol ; marche à pied à allure réelle. « Étapes courtes » conserve l'ancien fonctionnement |
| V10.7 | Boeing 777-300ER : parcours pilote complet Paris-CDG → La Réunion (Air France ou Air Austral) avec roulage réel à CDG piste 26R, radio complète (CDG, Orly, Gillot/Roland-Garros, centres Marseille, Rome puis CPDLC Tripoli, Khartoum, Addis, Nairobi, Antananarivo), approche RNP 12, roulage simplifié à l'arrivée, vocabulaire Boeing (EICAS, MCP, CDU) en regard des commandes, volets 15/30, Mach 0,84, dossier de vol Paris–Réunion (route, dégagement Maurice), décor Orly et Roland-Garros, météo FMEE/LFPO. Marques fictives (bouton du menu) : mêmes parcours et procédures, noms de constructeurs, motoristes et compagnies remplacés, y compris dans les exports. Correctif : export TXT/PDF des documents |
| V10.8 | Détails extérieurs des aéronefs : soufflantes à pales vrillées qui tournent avec le régime moteur (CFM56 de l'A320 : 36 pales ; GE90-115B du 777 : 22 pales larges ; PW305 du Learjet : 24 pales), cône avec spirale, conduit d'entrée d'air, séparation capot / inverseur, tuyère ; contours des ailerons, volets, spoilers et becs ; carénages de rails de volets ; déperditeurs d'électricité statique ; sondes pitot et d'incidence ; antennes VHF, transpondeur, GPS, dôme SATCOM (777) ; sortie APU ; portes cargo et issues de secours ; essuie-glaces ; trappes, compas et phare de roulage du train ; prises d'air dynamiques ; moyeux et biellettes de pas des rotors d'hélicoptères |
| V10.8.1 | Corrections issues de l'audit PPL (docs/AUDIT_PPL.md) : calage 1013 hPa à l'altitude de transition (et non au niveau de transition) en montée ; masses forfaitaires EASA selon le nombre de sièges (84 kg à partir de 30 sièges, 104/96/92 kg pour 19 sièges ou moins) appliquées au Learjet 60, S-76, H125 et R44 ; QCM corrigé ; R44 Raven II à injection (pas de carburateur) |
| V10.9 | Carte de navigation pour tous les appareils (bouton « 🗺 Carte » ou touche M) : position, cap, trace parcourue, route du plan de vol, aéroports et pistes, destination (distance, cap, heure estimée), échelle, modes Suivre / Route, zoom 10 m à 40 km par pixel, déplaçable. Crash réaliste et schématisé : l'appareil se disloque (tronçons et éclats balistiques), boule de feu proportionnelle à l'énergie et au carburant, trace calcinée, feux résiduels et fumée qui dérive au vent ; en mer : gerbe, anneau, débris qui flottent puis coulent, nappe ; en vol : explosion en altitude et débris qui tombent avec traînées ; relief : poussière ; son d'explosion ; la check-list affiche « CRASH » au lieu de l'étape en attente. Sélecteur TEMPS : affiche toujours l'accélération réelle (×4, ×16, ×64 automatiques compris) |
| V10.10 | Feuille d'équipage / manifeste : ajout de passagers nommés (nom, prénom, siège libre), bouton « Compléter tous les passagers » (noms fictifs, sièges attribués), compteur nommés / sièges libres ; bouton « 🪑 Sièges » : plan de cabine vu du dessus à la place de l'avion (A320 30 rangs 3-3 ; 777-300ER 18 J · 40 W · 384 Y ; Learjet 60 ; H125 ; S-76 ; R44), sièges occupés avec initiales, issues de secours, déplacement d'un passager par toucher |
| V10.11 | Vue du dessus (atelier) : tous les passagers sont représentés et remplissent l'appareil (A320 : jusqu'à 180, au siège du manifeste, 30 rangs × 6 ; S-76 : 12 ; H125 : 5 ; R44 : 3 ; Learjet : 6), embarquement de tous les passagers par la porte avant, file d'attente compacte en salle d'embarquement |
| V10.12 | Une feuille d'équipage et une liste de passagers par appareil (A320, Learjet 60, H125, S-76, R44) : vol, immatriculation, départ/arrivée, nombre de passagers et sièges conformes à la cabine de chaque appareil ; ancienne liste A320 conservée ; sièges inexistants réattribués ; champ copilote masqué pour les monopilotes ; ligne d'ajout de passager adaptée au mobile |
| V10.13 | Relief : La Réunion (Piton des Neiges 3 070 m, Piton de la Fournaise 2 630 m, Grand Bénare, Maïdo), Alpes (Mont Blanc 4 808 m, Mont Rose, Cervin, Écrins, Grand Paradis, Jungfrau), Kilimandjaro, mont Kenya, plateau éthiopien ; couleurs et ombrage du relief ; collisions et crash « montagne » actifs. Correctif majeur : le terrain devenait noir loin du point de départ (origine du shader non mise à jour). Brume atmosphérique sur les objets 3D (plus de silhouettes noires de Manhattan à l'horizon). Carte : fond schématique net à fort zoom avec voies de circulation et bâtiments. Simplifications de l'audit précisées : traînée parasite / induite, VAPP, anneau tourbillonnaire, démarrage R44 à injection, réserves VFR (avion 30/45 min, hélicoptère 20 min) |
| V10.14 | Boeing 777-300ER : parcours retour complet La Réunion → Paris (Roland-Garros piste 12, arrivée CDG 26L) pour les deux compagnies ; pistes de Gillot aux seuils officiels SIA avec piste 14/32 et approche ILS 14 ; EICAS de type Boeing (N1, EGT, TAT, carburant, volets, train, messages) ; atelier 777 en vue de dessus avec ses systèmes (électricité, hydraulique, carburant, air, démarrage), pages EICAS, explications, tour de démarrage et embarquement des passagers. Corrections issues de l'audit ATPL : démarrage du Learjet 60 (démarreur puis carburant à N2 ≥ 10 %) et définition du vol IFR |
| V10.15 | Avion école Cessna 172P à Toussus-le-Noble (LFPN) : modèle 3D aile haute et train fixe, moteur à pistons (primer, magnétos, mélange, réchauffage carburateur, régime, dépression des gyroscopes), traction d'hélice, son du moteur, planche « six instruments » et instruments moteur, pilote automatique KAP 140 ; parcours PPL complet (visite prévol, mise en route, roulage, essais moteur, check-list avant décollage, tour de piste main gauche, atterrissage, arrêt) avec radio VFR en phraséologie française (Toussus Sol / Tour). Checklist disponible dans toutes les missions (checklist de référence de l'appareil pour les vols sans parcours) ; le bouton Guide d'une mission sans parcours bascule vers le parcours guidé équivalent |
| V10.16 | Parité des scénarios avec l'A320 (référence) : le 777 reçoit tous les scénarios fictifs de l'A320 (feu moteur, dépressurisation, génératrices, Pitot, TCAS, fuite carburant, sécurité du poste, parcours Germanwings sans le crash) ; variante fictive de l'impact d'oiseaux US 1549 sur 777, Learjet 60 et Cessna 172 ; Cessna 172 : panne moteur au décollage, givrage du carburateur, panne d'alternateur, fuite carburant (aussi dans le panneau Pannes) ; Learjet 60 : fuite carburant, perte des génératrices ; hélicoptères : panne moteur et panne électrique pour chacun. Cartes du menu avec un bouton par appareil compatible |
| V8.12 | Un seul appareil à la fois (une mission propre à un appareil le sélectionne) ; même méthode pour tous : cours du simulateur par appareil (A320, Learjet 60, H125, R44, S-76) et questions d'examen hélicoptère |
| V8.11 | Hélicoptères : chaque instrument s'agrandit au clic avec sa légende ; horizon artificiel alimenté (plus de drapeau OFF permanent) |
| V8.10 | Menu de départ défilable (haut et bas) sur mobile et PC ; plus d'annonce « Flaps one » ni de bruit de volets au démarrage |
| V8.9 | FMS : la ligne verte du ND est le plan de vol (orthodromie départ → destination, route Barcelone → Düsseldorf pour Germanwings) ; le mode NAV la rejoint puis la suit avec correction d'écart latéral |
| V8.8 | « 🧭 Étapes » : aller directement à n'importe quelle étape (avance rapide, saut du roulage) ; bulle rangée en haut à droite sur PC ; plus de guide en double en mode automatique |
| V8.7 | Dossier de vol : chaque étape et chaque action ouvrent une fiche avec le vrai bloc de commandes (commande encadrée et numérotée) ou l'écran légendé ; fiche aussi depuis la bulle en vol |
| V8.6 | PC : bouton « Vue avant » et retour automatique de la vue cockpit vers l'avant |
| V8.5 | Cadres jaune / rouge pour les actions incohérentes ; Académie : anatomie des 5 appareils |
| V8.4 | Écrans du tableau de bord agrandis au toucher |
| V8.3 | Décor : tours de contrôle, aérogares, Manhattan, Paris ; nuages en boules retirés |
| V8.2 | Modèles 3D des 5 appareils reconstruits aux cotes publiées ; train rentré en vol ; descente d'urgence à 4 000 ft/min dans le scénario Germanwings |
| V8.1 | Germanwings 9525 : parcours Barcelone → Düsseldorf sans le crash, partie critique remplacée par une urgence de pilotage au-dessus du relief |
| V8.0 | Examen blanc, Académie (cours débutant → brevet → reconversion), boutons « Lancer » sur les cartes du dossier |
| V7.8 | Scénarios guidés avec cadres rouges / verts : US Airways 1549, sécurité du poste (Germanwings 9525), fuite carburant fictive, pannes |
| V7.7 | Fin du repoussage dans l'axe de la voie : roulage vers l'avant, piste devant soi ; repoussage expliqué et accéléré ×4 en mode automatique |
| V7.6 | Cadres rouges numérotés « sous-étape n/N » sur les commandes et écrans, bulle explicative, hiérarchie visible |
| V7.5 | Piste et décor visibles sur téléphone, barre compacte, bouton « masquer écrans » |
| V7.4 | Croix de fermeture sur tous les panneaux |
| V7.3 | Mode automatique corrigé (blocage étape 14, alignement, décollage après check-list) |
| V7.2 | Panneaux déplaçables, modes exclusifs, dossier mobile |
| V7.1 | Bulle d'étape avec chronomètre en mode automatique |
| V7 | Audio réaliste et dossier de vol pas à pas |
