# Audit de couverture du programme théorique EASA ATPL(A) — simulateur « PLANE TRAJECTORIES »

Audit automatisé sourcé, réalisé le 16 novembre 2026. Aucun échantillon n'a encore été relu par un instructeur. L'auditeur n'a pas écrit le logiciel et n'a rien modifié.

Instantané audité : `/tmp/audit_atpl_snap/src` (copie du 16/11/2026, 16 h 22 UTC). Toutes les références `fichier:ligne` renvoient à cet instantané. Empreintes SHA-256 (16 premiers caractères) : `base.html` 34306b1a7fae142a ; `addons/acad.js` a5261287cd39d1c5 ; `addons/systems2.js` 71696b72afc8af30 ; `addons/docs.js` e9d732ad08be52a3. Le code a changé pendant l'audit (voir § 2.3).

## 1. Résumé

| Matière | Sous-sujets | COUVERT | PARTIEL | ABSENT | Score |
|---|---:|---:|---:|---:|---:|
| 010 Droit aérien | 53 | 0 | 17 | 36 | 16,0 % |
| 021 Cellule, systèmes, motorisation | 49 | 4 | 34 | 11 | 42,9 % |
| 022 Instrumentation | 66 | 0 | 36 | 30 | 27,3 % |
| 031 Masse et centrage | 14 | 1 | 8 | 5 | 35,7 % |
| 032 Performances | 18 | 0 | 7 | 11 | 19,4 % |
| 033 Préparation et suivi du vol | 12 | 6 | 3 | 3 | 62,5 % |
| 040 Performance humaine | 13 | 0 | 10 | 3 | 38,5 % |
| 050 Météorologie | 43 | 1 | 16 | 26 | 20,9 % |
| 061 Navigation générale | 17 | 0 | 8 | 9 | 23,5 % |
| 062 Radionavigation | 18 | 0 | 6 | 12 | 16,7 % |
| 070 Procédures opérationnelles | 16 | 1 | 10 | 5 | 37,5 % |
| 081 Principes du vol | 40 | 0 | 18 | 22 | 22,5 % |
| 090 Communications | 18 | 2 | 11 | 5 | 41,7 % |
| **Global (13 matières examinées, parts égales)** | **377** | **15** | **184** | **178** | **31,2 %** |
| 100 KSA (non noté, voir § 3.14) | — | — | — | — | qualitatif : PARTIEL |

**Score global : 31,2 %** (COUVERT = 1, PARTIEL = 0,5, ABSENT = 0, moyenne simple des 13 matières).

**Exactitude :** 88 affirmations techniques contrôlées : 58 exactes, 14 simplifiées, 2 fausses, 14 non vérifiables faute de source publique admise (manuels Airbus FCOM/FCTM). Sur les 74 affirmations vérifiables, l'indice d'exactitude stricte (exactes seulement) est de **78,4 %**. Le taux d'affirmations non fausses est de **97,3 %**.

**Verdict sur l'objectif de 98 % :** cet objectif est **hors d'atteinte** dans l'état actuel. Le produit est un très bon simulateur procédural A320 (systèmes, dossier de vol, carburant, radio, scénarios d'accident). Il couvre bien 033 (préparation du vol) et correctement certaines parties de 021 et 090. En revanche, la théorie générale de l'ATPL manque presque entièrement :

- météorologie physique ;
- haute vitesse et stabilité ;
- radionavigation ;
- navigation générale ;
- performances classes A et B ;
- droit international ;
- instruments de base.

Il y a 178 sous-sujets ABSENTS sur 377. Pour atteindre 98 %, il faudrait que presque tous les 377 sous-sujets soient COUVERTS. Cela revient à écrire un cours ATPL complet : environ 362 sous-sujets à créer ou approfondir, et une banque de QCM de plusieurs milliers de questions alignées sur les learning objectives. Aujourd'hui, la banque compte 51 QCM (QB) plus les quiz des modules. Un objectif réaliste à moyen terme est d'environ 60 à 65 %, avec le plan des 15 manques du § 5. Toute communication d'un pourcentage doit porter la mention « audit automatisé sourcé ».

## 2. Référence utilisée et limites

### 2.1 Référence

- **Structure officielle (sujets `xxx yy 00 00` et sous-sujets `xxx yy zz 00`), 010 à 040 01** : *Appendix to AMC & GM to Part-FCL, Issue 1, Amendment 10*, ED Decision 2020/018/R. Ce texte intègre la refonte des learning objectives faite par l'ED Decision 2018/001/R. EASA, https://easa.europa.eu/da/downloads/120814/en (lu jusqu'au caractère 500 000).
- **040 02 à 090** : l'outil de lecture s'arrête à 500 000 caractères, donc la suite de l'Amendment 10 n'a pas pu être lue. Les intitulés des sujets et sous-sujets ont été repris de l'*Annex II to ED Decision 2016/008/R — AMC & GM to Part-FCL (Learning Objectives), Amendment 2* (EASA, https://easa.europa.eu/de/downloads/20796/en). Ils ont été recoupés avec la liste des sujets modifiés par l'ED Decision 2019/017/R (Amendment 8, https://easa.europa.eu/bg/downloads/102529/en), qui fait apparaître 090 01 à 090 07 et 081 01 à 081 08.
- Adaptations à la structure 2018 : 091/092 sont regroupés en **090 01 à 090 07**, avec des sous-sujets 090 02 xx repris de 091/092. **062 07 PBN** est ajouté comme ligne unique, car ses sous-sujets n'ont pas pu être récupérés.
- Les sous-sujets propres aux hélicoptères (021 14-17, 022 07, 034, 071 02 14-15, 071 03, 082) et les rubriques « intentionally left blank » sont exclus.
- Les CS-25, le règlement Air OPS (965/2012), Part-FCL, Part-MED, SERA et les Annexes OACI ont servi de références de vérification. Sauf mention « consulté », ils ont été **cités sans re-téléchargement** pendant l'audit. Le proxy de l'environnement refuse les téléchargements directs depuis easa.europa.eu ; seules des lectures partielles via un outil web ont abouti.

### 2.2 Méthode

1. Le code a été figé dans un instantané. Le texte a été extrait (balises HTML retirées), puis une table de 376 motifs de recherche (un par sous-sujet) a été passée sur tout le corpus. Les occurrences ont été relues une à une, avec une lecture complète des cours (`acad.js` parties 1 à 5, `systems2.js` partie 5), du dossier de vol (`docs.js`), des briefings (`brief.js`), du QCM `QB`, de l'aide `H320`, des étapes `commonFirst`/`stepsFor`, de `WB`/`lsCalc`, de la radio `STN`/`atcSeqFW`, de `fwStep`, des scénarios (`scn.js`, `systems3.js`, registre des scénarios dans `base.html`) et de `guard.js`.
2. Règles de verdict :
   - **COUVERT** : explication suffisante pour l'essentiel des learning objectives du sous-sujet, en cours ou en pratique guidée et commentée.
   - **PARTIEL** : au moins une phrase d'explication correcte, ou une pratique sans théorie.
   - **ABSENT** : rien, une simple mention ou un acronyme sans explication, ou une seule phrase qui est elle-même inexacte.
3. Un sujet effleuré en une phrase est au mieux PARTIEL. La mention de mode (cours / pratique / QCM) précise la nature de la couverture.

### 2.3 Limites

- La granularité est celle du sous-sujet (`xxx yy zz 00`), pas des quelque 3 000 learning objectives individuels. Les poids d'examen (nombre de questions par matière) ne sont pas appliqués : la consigne impose des parts égales.
- La correspondance de numérotation 040 02 à 090 repose sur l'Amendment 2 (2016). Un écart de quelques sous-sujets avec l'Amendment 10 est possible, notamment pour 062 (PBN) et 090.
- Les détails A320 (FCOM/FCTM/QRH) ne sont pas publics : 14 affirmations restent NON VÉRIFIABLES et n'entrent pas dans l'indice.
- **Le code a évolué pendant l'audit.** À 16 h 45 UTC, `base.html`, `acad.js`, `brief.js`, `map.js` et `systems3.js` avaient changé, et `fog.js` était apparu. Exemple : la phrase sur la traînée (S37) a été corrigée dans le code vivant. Les deux erreurs FAUX restent présentes dans le code vivant (F2 se trouve désormais à `base.html:1118`). Les verdicts ne portent que sur l'instantané.
- L'audit automatisé ne remplace pas un instructeur. L'échantillon du § 6 doit être relu par un instructeur humain.

## 3. Tableau détaillé par matière

Légende du mode : cours = texte explicatif (Académie, aide, briefing) ; pratique = action ou document dans un parcours ; QCM = question avec explication.

### 3.1 010 Droit aérien — 16,0 %

| N° | Sous-sujet | Verdict | Mode | Preuve | Remarque |
|---|---|---|---|---|---|
| 010 01 01 | Convention de Chicago, libertés de l'air | ABSENT | - | aucune occurrence |  |
| 010 01 02 | Autres conventions (Tokyo, Montréal...) | ABSENT | - | aucune occurrence |  |
| 010 01 03 | Organisations mondiales (OACI) | ABSENT | - | « Alphabet OACI » acad.js:110 (simple mention) |  |
| 010 01 04 | Organisations européennes (UE, EASA, Eurocontrol) | ABSENT | - | EASA cité comme source (acad.js:4, base.html:928) | aucun cours sur le rôle de l'EASA |
| 010 02 02 | Certificat de navigabilité | ABSENT | - | aucune occurrence |  |
| 010 02 03 | Annexe 7 - nationalité et immatriculation | ABSENT | - | champ « Immatriculation » systems3.js:42 |  |
| 010 02 04 | Marques de nationalité/immatriculation | ABSENT | - | aucune occurrence |  |
| 010 04 01 | Annexe 1 OACI (licences) | ABSENT | - | aucune occurrence |  |
| 010 04 02 | Part-FCL | PARTIEL | cours | acad.js:117, 152-153, 156-158, 164-169 (LAPL/PPL heures, âges, CPL/ATPL, 1 500 h) | niveau PPL ; privilèges ATPL, qualifications, prorogations absents |
| 010 04 03 | Part-MED | PARTIEL | cours | acad.js:155, 164 (classes 1/2, validités) | pas de limitations, pas de baisse d'aptitude |
| 010 05 01 | Annexe 2 / SERA (vue d'ensemble) | ABSENT | - | aucune occurrence |  |
| 010 05 02 | Règles de l'air (applicabilité) | ABSENT | - | aucune occurrence |  |
| 010 05 03 | Règles générales (priorités, feux, signaux) | PARTIEL | pratique | feux NAV/BEACON/STROBE base.html:1081, 1228 ; brief.js « Feux, consignes » | priorités de passage, signaux lumineux absents |
| 010 05 04 | VFR (VMC, minima) | PARTIEL | cours | acad.js:109 (une phrase) | pas de tableau VMC SERA.5001 |
| 010 05 05 | IFR | PARTIEL | cours+pratique | acad.js:109 (affirmation FAUSSE), clairance IFR base.html:1947 | voir erreur F1 |
| 010 05 06 | Interception | ABSENT | - | aucune occurrence pertinente |  |
| 010 06 02 | Définitions PANS-OPS (DA/H, MDA, OCA/H) | ABSENT | - | « DA 200 ft » docs.js:189 sans définition |  |
| 010 06 03 | Procédures de départ | PARTIEL | pratique | SID schématique docs.js:181-185 | pas de critères PANS-OPS (PDG 3,3 %) |
| 010 06 04 | Procédures d'approche | PARTIEL | pratique | carte ILS IAF/IF/FAF/DA docs.js:186-191 ; approche base.html:1090 | segments, OCA/H, approches classiques absents |
| 010 06 05 | Attente (holding) | ABSENT | - | « point d'attente » = point d'arrêt sol, pas l'hippodrome |  |
| 010 06 06 | Calage altimétrique | PARTIEL | cours | acad.js:103 ; base.html:1087 ; brief.js:140 ; QB nav (base.html:1717) | QFE, couche de transition absents |
| 010 06 07 | Pistes parallèles | ABSENT | - | aucune occurrence |  |
| 010 06 08 | Procédures SSR/transpondeur | PARTIEL | cours+pratique | acad.js:111 ; H320 xpdr base.html:1246 ; base.html:1920 | modes A/C/S non expliqués |
| 010 06 09 | Règlement (UE) 965/2012 | PARTIEL | cours | QB fuel « CAT.OP.MPA » base.html:1711 ; masses forfaitaires base.html:1068 |  |
| 010 07 01 | Annexe 11 (ATS, espaces, FIR) | PARTIEL | pratique | organismes Delivery/Ground/Tower/Approach/Center base.html:1906-1918 ; FIR docs.js:155+ | classes d'espace absentes |
| 010 07 02 | Doc 4444 (clairances, séparations) | PARTIEL | pratique | séquence ATC base.html:1939-2000 ; collationnement QB a320 | séparations, catégories de sillage absentes |
| 010 08 01 | AIS : introduction | ABSENT | - | références SIA dans des commentaires de code (base.html:1904) |  |
| 010 08 02 | Définitions Annexe 15 | ABSENT | - | aucune occurrence |  |
| 010 08 03 | AIS : généralités (AIRAC) | ABSENT | - | commentaire de code seulement |  |
| 010 08 04 | Produits AIS (AIP, NOTAM) | PARTIEL | cours | NOTAM décodé (Q, A, B, C, E) docs.js:114-153 | AIP, AIC, PIB non expliqués |
| 010 08 05 | Prestataires ATM | ABSENT | - | aucune occurrence pédagogique |  |
| 010 09 01 | Aérodromes : généralités | ABSENT | - | aucune occurrence pédagogique |  |
| 010 09 02 | Données d'aérodrome (TORA, TODA, ASDA, LDA) | ABSENT | - | aucune occurrence |  |
| 010 09 03 | Caractéristiques physiques | ABSENT | - | aucune occurrence |  |
| 010 09 04 | Aides visuelles (marques, feux, panneaux) | PARTIEL | QCM+pratique | QB ground base.html:1721-1725 ; balisage base.html:378-388 | PAPI, rampes d'approche absents |
| 010 09 05 | Balisage des obstacles | ABSENT | - | aucune occurrence |  |
| 010 09 06 | Zones à usage restreint | ABSENT | - | aucune occurrence |  |
| 010 09 07 | Services d'aérodrome (SSLIA) | ABSENT | - | pompiers dans scénarios seulement (systems3.js:220) |  |
| 010 09 08 | Matériel complémentaire | ABSENT | - | aucune occurrence |  |
| 010 10 02 | Facilitation : entrée/sortie | PARTIEL | pratique | déclaration générale docs.js:263-275 |  |
| 010 11 01 | SAR : définitions | ABSENT | - | aucune occurrence |  |
| 010 11 02 | SAR : organisation | ABSENT | - | aucune occurrence |  |
| 010 11 03 | SAR : procédures équipages non SAR | ABSENT | - | 121.5 uniquement comme fréquence d'attente RMP (base.html:1305) |  |
| 010 11 04 | Signaux SAR | ABSENT | - | aucune occurrence |  |
| 010 12 01 | Sûreté : définitions Annexe 17 | ABSENT | - | aucune occurrence |  |
| 010 12 02 | Sûreté : principes | ABSENT | - | aucune occurrence |  |
| 010 12 04 | Mesures préventives | ABSENT | - | « porte blindée » acad.js:179 (mention) |  |
| 010 12 05 | Gestion des actes illicites | PARTIEL | cours | 7500 acad.js:111 (une ligne) |  |
| 010 12 06 | Programme de sûreté exploitant | ABSENT | - | aucune occurrence |  |
| 010 12 07 | Sûreté du poste (porte) | PARTIEL | pratique | parcours 9525 scn.js (sécurité du poste) ; porte H320 base.html:1244 |  |
| 010 13 01 | Définitions Annexe 13 | ABSENT | - | aucune occurrence |  |
| 010 13 02 | Enquête selon Annexe 13 | ABSENT | - | rapports NTSB/BEA cités comme sources de scénarios, procédure non enseignée |  |
| 010 13 03 | Enquête (UE) 996/2010, 376/2014 | ABSENT | - | aucune occurrence |  |

### 3.2 021 Cellule, systèmes, motorisation — 42,9 %

| N° | Sous-sujet | Verdict | Mode | Preuve | Remarque |
|---|---|---|---|---|---|
| 021 01 01 | Conception (fail-safe, redondance) | ABSENT | - | redondance implicite seulement (H320 elac1) |  |
| 021 01 02 | Charges et contraintes | PARTIEL | cours | acad.js:174 ; systems2.js:385 (semi-monocoque, flambage) |  |
| 021 01 03 | Fatigue et corrosion | ABSENT | - | « apprêt anticorrosion » systems2.js:390 (mention) |  |
| 021 01 05 | Maintenance | PARTIEL | pratique | tech log, MEL, APRS docs.js:251-262 |  |
| 021 02 01 | Méthodes d'assemblage | PARTIEL | cours | rivetage acad.js:174, systems2.js:385 |  |
| 021 02 02 | Matériaux | PARTIEL | cours | alliages 2024/7075/Al-Li, composite systems2.js:385 ; acad.js:178 |  |
| 021 02 03 | Voilure, empennages, gouvernes | COUVERT | cours | systems2.js:385 (longerons, nervures, Fowler, THS) ; acad.js:81-84 |  |
| 021 02 04 | Fuselage, train, portes, plancher, pare-brise | COUVERT | cours | acad.js:174-200 ; systems2.js:385-390 |  |
| 021 02 06 | Limitations structurales | PARTIEL | cours | brief.js (MZFW/MTOW/MLW = limites de structure) ; guard.js:5,15-16 |  |
| 021 03 01 | Hydromécanique (Pascal) | ABSENT | - | aucune occurrence |  |
| 021 03 02 | Systèmes hydrauliques | PARTIEL | cours+pratique | systems2.js:398 (3 circuits, PTU, RAT) ; H320 base.html:1219-1220 | composants génériques (types de pompes, accumulateurs) absents |
| 021 04 01 | Train d'atterrissage | PARTIEL | cours | systems2.js:385, 404 (oléopneumatique, LGCIU, gravité) |  |
| 021 04 02 | Direction de la roue avant | PARTIEL | cours | H320 askid base.html:1240 ; systems2.js:398 |  |
| 021 04 03 | Freins, antidérapage, auto-frein | PARTIEL | cours+pratique | H320 abrk base.html:1240 ; systems2.js:385, 404 |  |
| 021 04 04 | Roues et pneus | PARTIEL | pratique | tour avion ; scénario éclatement systems3.js:369-377 |  |
| 021 05 01 | Commandes primaires | PARTIEL | cours | acad.js:84 ; systems2.js:404, 409 |  |
| 021 05 02 | Commandes secondaires | PARTIEL | cours | acad.js:84 ; systems2.js:385, 404 |  |
| 021 05 04 | Commandes électriques (FBW) | PARTIEL | cours | systems2.js:404 ; QB a320 base.html:1729-1730 | lois alternate/direct non expliquées |
| 021 06 01 | Air prélevé | PARTIEL | cours | systems2.js:398 ; H320 base.html:1224 |  |
| 021 06 03 | Pressurisation, conditionnement | PARTIEL | cours+pratique | systems2.js:398 ; guard.js:27 ; F-DEPRESS base.html:2581 | ΔP max, soupapes absents |
| 021 07 01 | Antigivrage/dégivrage | PARTIEL | cours | H320 base.html:1226 ; systems2.js:409, 414 | boudins, fluides absents |
| 021 07 02 | Détection du givre | ABSENT | - | aucune occurrence pédagogique |  |
| 021 08 01 | Carburant moteur à pistons | PARTIEL | cours | systems2.js:414 (injection R44) |  |
| 021 08 02 | Carburant turbine | PARTIEL | cours+pratique | systems2.js:398 ; scénario fuite systems3.js:304-315 | vidange rapide absente |
| 021 09 01 | Électricité de base, disjoncteurs | ABSENT | - | aucune occurrence pédagogique |  |
| 021 09 02 | Batteries | PARTIEL | cours | systems2.js:398 ; base.html:1077 |  |
| 021 09 03 | Génération | PARTIEL | cours | systems2.js:394, 398, 409 | CSD, mise en parallèle absents |
| 021 09 04 | Distribution | PARTIEL | cours | systems2.js:398 ; H320 base.html:1222 |  |
| 021 09 05 | Moteurs électriques | ABSENT | - | aucune occurrence pédagogique |  |
| 021 10 01 | Moteur à pistons : généralités | PARTIEL | cours | acad.js:92 ; systems2.js:414 |  |
| 021 10 02 | Carburant AVGAS | ABSENT | - | aucune occurrence |  |
| 021 10 03 | Pompes carburant moteur | PARTIEL | cours | systems2.js:414 |  |
| 021 10 04 | Carburateur/injection | PARTIEL | cours | systems2.js:414 |  |
| 021 10 05 | Refroidissement | ABSENT | - | aucune occurrence |  |
| 021 10 06 | Lubrification | PARTIEL | QCM | QB r44 25 psi base.html:1748 |  |
| 021 10 07 | Allumage (magnétos) | PARTIEL | cours | systems2.js:414 |  |
| 021 10 08 | Mélange | PARTIEL | cours | acad.js:92 ; systems2.js:414 |  |
| 021 10 09 | Hélices | ABSENT | - | « hélice qui visse l'avion » acad.js:92 |  |
| 021 10 10 | Performances et conduite moteur pistons | ABSENT | - | aucune occurrence |  |
| 021 11 01 | Turbine : principes | PARTIEL | cours | acad.js:93 ; systems2.js:394, 412 | turbopropulseur, taux de dilution absents |
| 021 11 02 | Composants principaux | COUVERT | cours | systems2.js:394 |  |
| 021 11 03 | Composants additionnels (AGB, FADEC, inverseurs) | COUVERT | cours | systems2.js:394 |  |
| 021 11 04 | Exploitation et surveillance | PARTIEL | cours+pratique | acad.js:93-95 ; systems2.js:394 ; base.html:1082 | pompage, démarrage avorté absents |
| 021 11 05 | Aspects performances (flat rating) | ABSENT | - | aucune occurrence |  |
| 021 11 06 | APU | PARTIEL | cours+pratique | acad.js:95 ; brief.js ; base.html:2588-2592 |  |
| 021 12 01 | Détection de fumée | PARTIEL | cours | H320 cargo base.html:1233 |  |
| 021 12 02 | Protection incendie | PARTIEL | cours+pratique | H320 base.html:1216-1218 ; F-FIRE base.html:2574 | principes de détection absents |
| 021 12 03 | Protection pluie | PARTIEL | cours | H320 base.html:1215 |  |
| 021 13 01 | Oxygène | PARTIEL | cours | H320 base.html:1213 ; guard.js:27, 34-35 |  |

### 3.3 022 Instrumentation — 27,3 %

| N° | Sous-sujet | Verdict | Mode | Preuve | Remarque |
|---|---|---|---|---|---|
| 022 01 01 | Manomètres | ABSENT | - | aucune occurrence |  |
| 022 01 02 | Capteurs de température | ABSENT | - | EGT/ITT nommés, principe absent |  |
| 022 01 03 | Jauges carburant | ABSENT | - | aucune occurrence |  |
| 022 01 04 | Débitmètres | ABSENT | - | FF nommé acad.js:94 |  |
| 022 01 05 | Tachymètres (N1/N2) | PARTIEL | cours | acad.js:94 |  |
| 022 01 06 | Mesure de la poussée | PARTIEL | cours | acad.js:94 (N1 image de la poussée) | EPR absent |
| 022 01 07 | Couplemètre | PARTIEL | cours | acad.js:144 (TQ % S-76) |  |
| 022 01 08 | Synchroscope | ABSENT | - | aucune occurrence |  |
| 022 01 09 | Vibrations moteur | ABSENT | - | aucune occurrence |  |
| 022 01 10 | Mesure du temps | PARTIEL | pratique | H320 chrono/ET base.html:1236, 1242 |  |
| 022 02 01 | Mesure des pressions (Pitot/statique) | PARTIEL | cours+pratique | systems2.js:404 ; F-ICE base.html:2593 |  |
| 022 02 02 | Mesure température air (SAT/TAT) | ABSENT | - | TAT nommée systems2.js:404 |  |
| 022 02 03 | Incidence (AoA) | ABSENT | - | sondes nommées |  |
| 022 02 04 | Altimètre | PARTIEL | cours | acad.js:103 | erreurs absentes |
| 022 02 05 | Variomètre | ABSENT | - | aucune explication |  |
| 022 02 06 | Anémomètre (IAS/CAS/TAS) | PARTIEL | cours | acad.js:57 (six instruments) | IAS/CAS/EAS/TAS non définies |
| 022 02 07 | Machmètre | ABSENT | - | MMO cité, principe absent |  |
| 022 02 08 | Centrale aérodynamique (ADC/ADR) | PARTIEL | cours | systems2.js:404 |  |
| 022 03 01 | Magnétisme terrestre | ABSENT | - | aucune occurrence |  |
| 022 03 02 | Magnétisme avion | ABSENT | - | aucune occurrence |  |
| 022 03 03 | Compas magnétique | ABSENT | - | aucune occurrence |  |
| 022 03 04 | Vanne de flux | ABSENT | - | aucune occurrence |  |
| 022 04 01 | Gyroscope : principes | ABSENT | - | aucune occurrence |  |
| 022 04 02 | Indicateur de virage, bille | ABSENT | - | « bille au centre » acad.js:88 (pilotage) |  |
| 022 04 03 | Horizon artificiel | PARTIEL | cours | acad.js:57, 98 |  |
| 022 04 04 | Conservateur de cap | ABSENT | - | aucune occurrence |  |
| 022 04 05 | Compas télécommandés, RMI | ABSENT | - | aucune occurrence |  |
| 022 04 06 | AHRS | PARTIEL | cours | acad.js:133 ; QB lj60 |  |
| 022 05 01 | Inertie : principes | PARTIEL | cours | systems2.js:404 ; brief.js (rotation de la Terre) |  |
| 022 05 02 | Alignement et exploitation | PARTIEL | cours+pratique | base.html:1078 ; H320 ir1 | erreurs (dérive, Schuler) absentes |
| 022 06 01 | AFCS : généralités | PARTIEL | cours | acad.js:99-100 |  |
| 022 06 02 | Pilote automatique | PARTIEL | cours+pratique | base.html:1086-1087 ; manual.js:46 |  |
| 022 06 03 | Directeur de vol | ABSENT | - | nommé H320 fdL |  |
| 022 06 04 | FMA | ABSENT | - | nommé acad.js:98 |  |
| 022 06 05 | Atterrissage automatique | PARTIEL | cours | H320 autoland base.html:1234 ; base.html:1091 | catégories et fail-passive/operational absents |
| 022 08 01 | Trims | PARTIEL | cours | H320 pTrim base.html:1243 ; docs.js:198 |  |
| 022 08 02 | Amortisseur de lacet | ABSENT | - | nommé H320 fac1 |  |
| 022 08 03 | Protections d'enveloppe | PARTIEL | cours | QB a320 base.html:1729-1731 ; base.html:500-506 |  |
| 022 09 01 | Automanette | PARTIEL | cours+pratique | H320 thrSel base.html:1242 ; base.html:1085-1086 |  |
| 022 10 01 | Communications voix/datalink | PARTIEL | pratique | RMP/ACP H320 base.html:1247 ; CPDLC base.html:1944 |  |
| 022 10 02 | FANS | PARTIEL | pratique | CPDLC océanique base.html:1961-1970 |  |
| 022 11 01 | FMS : conception | PARTIEL | cours | systems2.js:404 |  |
| 022 11 02 | Bases de données FMC | ABSENT | - | aucune occurrence |  |
| 022 11 03 | FMS : exploitation | PARTIEL | pratique | base.html:1080 ; fms.js:2-3 |  |
| 022 11 04 | Interface MCDU | PARTIEL | pratique | manual.js (MCDU INIT/PERF) |  |
| 022 12 01 | Alertes : généralités | PARTIEL | cours | H320 mw/mc base.html:1234 ; QB cockpit sombre |  |
| 022 12 02 | Système d'alarme (FWS/ECAM) | PARTIEL | cours | systems2.js:404 |  |
| 022 12 03 | Alarme de décrochage | PARTIEL | cours+pratique | acad.js:88 ; systems3.js:276 |  |
| 022 12 04 | Protection décrochage | PARTIEL | cours | acad.js:88 ; base.html:505 |  |
| 022 12 05 | Alerte de survitesse | PARTIEL | cours | guard.js:44 |  |
| 022 12 06 | Alarme configuration décollage | PARTIEL | pratique | systems3.js:284-293 |  |
| 022 12 07 | Alerte d'altitude | PARTIEL | cours | brief.js (C-chord) |  |
| 022 12 08 | Radioaltimètre | PARTIEL | pratique | base.html:1091 |  |
| 022 12 09 | GPWS/TAWS | PARTIEL | cours | H320 base.html:1211, 1241 ; systems3.js:297 | enveloppes des modes absentes |
| 022 12 10 | ACAS/TCAS | PARTIEL | cours+pratique | H320 base.html:1246 ; QB a320 base.html:1727 ; F-TCAS base.html:2599 | principe d'interrogation, tau absents |
| 022 13 01 | Écrans électroniques (technologie) | ABSENT | - | aucune occurrence |  |
| 022 13 02 | Instruments intégrés mécaniques | ABSENT | - | aucune occurrence |  |
| 022 13 03 | EFIS | PARTIEL | cours | acad.js:98 ; H320 ND base.html:1237 |  |
| 022 13 04 | Affichage moteurs/systèmes | PARTIEL | cours | acad.js:98 ; systems2.js:404 |  |
| 022 13 05 | Indicateur de première limite | ABSENT | - | aucune occurrence |  |
| 022 13 06 | EFB | ABSENT | - | « tablette (EFB) » brief.js:102 (mention) |  |
| 022 13 07 | HUD/SVS/EVS | ABSENT | - | aucune occurrence |  |
| 022 14 01 | CVR | PARTIEL | cours | H320 base.html:1212 |  |
| 022 14 02 | FDR | ABSENT | - | nommé H320 rcdr |  |
| 022 14 03 | Systèmes de maintenance | ABSENT | - | aucune occurrence |  |
| 022 15 01 | Circuits numériques, calculateurs | ABSENT | - | aucune occurrence |  |

### 3.4 031 Masse et centrage — 35,7 %

| N° | Sous-sujet | Verdict | Mode | Preuve | Remarque |
|---|---|---|---|---|---|
| 031 01 01 | Limitations de masse (raisons) | PARTIEL | cours | brief.js (EXTRA « Devis de masse ») ; acad.js:126 |  |
| 031 01 02 | Limites de centrage (raisons) | PARTIEL | cours+QCM | QB wb base.html:1708 ; brief.js |  |
| 031 02 01 | Terminologie | PARTIEL | cours | QB wb base.html:1704 ; acad.js:126 | BEM, DOM, masse de rampe, traffic load non définis |
| 031 02 02 | Limites de masse | PARTIEL | cours | base.html:935-945 ; docs.js:198 | MRM/MTW absents |
| 031 02 03 | Calculs de masse (masses forfaitaires) | COUVERT | cours+pratique | base.html:1068 (tables EASA) ; lsCalc base.html:950 ; exam.js:56-60 |  |
| 031 04 01 | Documentation masse et centrage | PARTIEL | pratique | loadsheet docs.js:198-218 |  |
| 031 04 02 | Pesée | ABSENT | - | aucune occurrence |  |
| 031 04 03 | Extraction BEM/CG des documents | ABSENT | - | aucune occurrence |  |
| 031 05 01 | Méthodes de calcul du CG | PARTIEL | cours | QB wb base.html:1707 ; brief.js (moments) | méthode des indices absente |
| 031 05 02 | Load and trim sheet | PARTIEL | pratique | docs.js:198-218 (% CMA, THS) |  |
| 031 05 03 | Repositionnement du CG | ABSENT | - | aucune occurrence |  |
| 031 06 01 | Types de fret | PARTIEL | pratique | NOTOC docs.js:242-250 |  |
| 031 06 02 | Charge au plancher | ABSENT | - | aucune occurrence |  |
| 031 06 03 | Arrimage | ABSENT | - | aucune occurrence |  |

### 3.5 032 Performances — 19,4 %

| N° | Sous-sujet | Verdict | Mode | Preuve | Remarque |
|---|---|---|---|---|---|
| 032 01 01 | Réglementation des performances | ABSENT | - | aucune occurrence |  |
| 032 01 02 | Théorie générale des performances | PARTIEL | cours | brief.js (masse, densité, vent) |  |
| 032 01 03 | Palier, distance franchissable, autonomie | ABSENT | - | aucune occurrence |  |
| 032 01 04 | Montée (pente, taux, Vx, Vy) | ABSENT | - | aucune occurrence |  |
| 032 01 05 | Descente | PARTIEL | cours | acad.js:128 ; brief.js:196 |  |
| 032 02 01 | Classe B : exigences de navigabilité | ABSENT | - | aucune occurrence |  |
| 032 02 03 | Classe B : décollage et atterrissage | ABSENT | - | aucune occurrence |  |
| 032 02 04 | Classe B : montée, croisière, descente | ABSENT | - | aucune occurrence |  |
| 032 03 03 | Classe B : utilisation des données | ABSENT | - | aucune occurrence |  |
| 032 04 01 | Classe A : décollage | PARTIEL | cours | QB proc base.html:1697-1699 ; brief.js:138 ; systems3.js:369-377 | VMCG, VEF, ASD/TOD/TOR, piste équilibrée absents |
| 032 04 02 | Classe A : montée (segments) | PARTIEL | cours | QB proc V2 base.html:1699 ; base.html:2607 |  |
| 032 04 03 | Classe A : croisière | ABSENT | - | aucune occurrence |  |
| 032 04 04 | Classe A : en route un moteur en panne | ABSENT | - | aucune occurrence |  |
| 032 04 05 | Classe A : descente | PARTIEL | cours | acad.js:128 |  |
| 032 04 06 | Classe A : approche et atterrissage | PARTIEL | cours+pratique | brief.js:143 ; systems3.js:258-271 | coefficients 60 %/1,67, piste mouillée +15 % absents |
| 032 05 01 | Utilisation des données de décollage | PARTIEL | pratique | docs.js:236-241 (TODC, FLEX) | formules simplifiées [ESTIMÉ] |
| 032 05 02 | Drift-down : utilisation | ABSENT | - | aucune occurrence |  |
| 032 05 03 | Atterrissage : utilisation des données | ABSENT | - | aucune occurrence |  |

### 3.6 033 Préparation et suivi du vol — 62,5 %

| N° | Sous-sujet | Verdict | Mode | Preuve | Remarque |
|---|---|---|---|---|---|
| 033 01 01 | Plan de navigation VFR | PARTIEL | pratique | OFP hélicoptère docs.js:49-73 ; carte VFR docs.js:155+ |  |
| 033 02 01 | Plan de navigation IFR | PARTIEL | pratique | OFP docs.js:49-73 ; carte de route | MEA/MORA, cartes en route absentes |
| 033 03 01 | Carburant : généralités | COUVERT | cours | brief.js:183-184 ; docs.js:219-235 |  |
| 033 03 02 | Planification carburant (vols commerciaux) | COUVERT | cours+pratique | acad.js:127 ; base.html:1069, 1711-1713 ; docs.js:219-235 | minimum 5 min de la réserve de route et carburant additionnel absents |
| 033 03 03 | Procédures carburant spécifiques | ABSENT | - | aucune occurrence |  |
| 033 04 01 | Briefing NOTAM | COUVERT | cours+pratique | docs.js:114-153 |  |
| 033 04 02 | Briefing météo | COUVERT | cours+pratique | docs.js:95-113, 162-180 ; brief.js:160-171 |  |
| 033 04 03 | PET et PSR | ABSENT | - | aucune occurrence |  |
| 033 05 01 | Plan de vol OACI (FPL) | COUVERT | cours+pratique | docs.js:74-94 (case par case) |  |
| 033 05 02 | Plan de vol répétitif (RPL) | ABSENT | - | aucune occurrence |  |
| 033 06 01 | Suivi du vol | COUVERT | cours+pratique | base.html:1088 ; brief.js « Croisière » ; docs.js:235 |  |
| 033 06 02 | Replanification en vol | PARTIEL | pratique | systems3.js:313-315 ; base.html:1108 |  |

### 3.7 040 Performance humaine — 38,5 %

| N° | Sous-sujet | Verdict | Mode | Preuve | Remarque |
|---|---|---|---|---|---|
| 040 01 01 | Facteurs humains en aviation | PARTIEL | cours | acad.js:117 (une ligne) | modèle SHELL absent |
| 040 01 03 | Concepts de sécurité des vols | PARTIEL | pratique | scénarios « version corrigée » systems3.js:258-377 | Reason, TEM non enseignés |
| 040 01 04 | Culture de sécurité | ABSENT | - | aucune occurrence |  |
| 040 02 01 | Physiologie du vol | PARTIEL | cours+pratique | guard.js:27 ; scn.js (TUC) ; acad.js:117 | hyperventilation, barotraumatismes absents |
| 040 02 02 | Système sensoriel, illusions | ABSENT | - | « illusions sensorielles » acad.js:117 (mention) |  |
| 040 02 03 | Santé et hygiène | PARTIEL | pratique | systems3.js:259 (équipage fatigué) |  |
| 040 03 01 | Traitement de l'information | PARTIEL | cours | acad.js:101 (circuit visuel) ; systems3.js:295 |  |
| 040 03 02 | Erreur humaine | PARTIEL | pratique | systems3.js:284-299 |  |
| 040 03 03 | Prise de décision | PARTIEL | cours+pratique | acad.js:117 ; base.html:2573 (débriefing US1549) |  |
| 040 03 04 | Gestion des erreurs, CRM | PARTIEL | cours+pratique | acad.js:114-117 ; QB proc base.html:1701 |  |
| 040 03 05 | Comportement humain | PARTIEL | pratique | systems3.js:260 (« Ça va passer ») |  |
| 040 03 06 | Surcharge et sous-charge | ABSENT | - | aucune occurrence |  |
| 040 03 07 | Automatisation avancée | PARTIEL | pratique | systems3.js:272-283 ; base.html:2559 |  |

### 3.8 050 Météorologie — 20,9 %

| N° | Sous-sujet | Verdict | Mode | Preuve | Remarque |
|---|---|---|---|---|---|
| 050 01 01 | Composition et couches de l'atmosphère | ABSENT | - | tropopause seulement sur la TEMSI docs.js:170 |  |
| 050 01 02 | Température de l'air | ABSENT | - | aucune occurrence |  |
| 050 01 03 | Pression atmosphérique | PARTIEL | cours | acad.js:103 |  |
| 050 01 04 | Densité de l'air | PARTIEL | cours | acad.js:87 ; brief.js:170 |  |
| 050 01 05 | Atmosphère type (ISA) | ABSENT | - | code isaP base.html:270 seulement |  |
| 050 01 06 | Altimétrie | PARTIEL | cours | acad.js:103 ; base.html:1087 | erreurs de température absentes |
| 050 02 01 | Vent : définition, mesure | PARTIEL | cours | acad.js:106 ; brief.js:166, 175-176 |  |
| 050 02 02 | Cause du vent (Coriolis, géostrophique) | ABSENT | - | aucune occurrence |  |
| 050 02 03 | Circulation générale | ABSENT | - | aucune occurrence |  |
| 050 02 04 | Vents locaux | ABSENT | - | aucune occurrence |  |
| 050 02 05 | Ondes orographiques | ABSENT | - | aucune occurrence |  |
| 050 02 06 | Turbulence | ABSENT | - | libellé « TURB MOD (CAT) » docs.js:170 |  |
| 050 02 07 | Courants-jets | PARTIEL | pratique | TEMSI/WINTEM docs.js:162-180 |  |
| 050 03 01 | Humidité | PARTIEL | cours | brief.js:170 ; acad.js:104 |  |
| 050 03 02 | Changements d'état | ABSENT | - | aucune occurrence |  |
| 050 03 03 | Processus adiabatiques, stabilité | ABSENT | - | aucune occurrence |  |
| 050 04 01 | Nuages | PARTIEL | cours | brief.js:169 (FEW/SCT/BKN/OVC en octas) | genres et formation absents |
| 050 04 02 | Brouillard, brume | PARTIEL | cours | acad.js:105 ; brief.js:170 | types de brouillard absents |
| 050 05 01 | Formation des précipitations | ABSENT | - | aucune occurrence |  |
| 050 05 02 | Types de précipitations | PARTIEL | cours | codes METAR brief.js:166 |  |
| 050 06 01 | Masses d'air | ABSENT | - | aucune occurrence |  |
| 050 06 02 | Fronts | ABSENT | - | symbole « front froid » docs.js:170 |  |
| 050 07 01 | Principaux centres de pression | ABSENT | - | aucune occurrence |  |
| 050 07 02 | Anticyclone | ABSENT | - | aucune occurrence |  |
| 050 07 03 | Dépressions non frontales | ABSENT | - | aucune occurrence |  |
| 050 07 04 | Cyclones tropicaux | ABSENT | - | aucune occurrence |  |
| 050 08 01 | Zones climatiques | ABSENT | - | aucune occurrence |  |
| 050 08 02 | Climatologie tropicale | ABSENT | - | aucune occurrence |  |
| 050 08 03 | Situations types des moyennes latitudes | ABSENT | - | aucune occurrence |  |
| 050 08 04 | Vents locaux et temps associé | ABSENT | - | aucune occurrence |  |
| 050 09 01 | Givrage | PARTIEL | cours+pratique | acad.js:105 ; brief.js:170 ; base.html:483 ; F-ICE base.html:2593 | types de givre absents |
| 050 09 02 | Turbulence (danger) | PARTIEL | cours | acad.js:105 ; docs.js:170 |  |
| 050 09 03 | Cisaillement de vent | PARTIEL | cours | acad.js:105 ; H320 pws base.html:1246 |  |
| 050 09 04 | Orages | PARTIEL | cours+QCM | acad.js:105 ; QB a320 base.html:1728 |  |
| 050 09 05 | Tornades | ABSENT | - | aucune occurrence |  |
| 050 09 06 | Inversions | ABSENT | - | aucune occurrence |  |
| 050 09 07 | Conditions stratosphériques | ABSENT | - | aucune occurrence |  |
| 050 09 08 | Dangers en montagne | ABSENT | - | aucune occurrence |  |
| 050 09 09 | Phénomènes réduisant la visibilité | PARTIEL | cours | brief.js:166-167 |  |
| 050 10 01 | Observation (METAR, SPECI) | COUVERT | cours+pratique | parseMetar base.html:2341+ ; brief.js:160-171 ; acad.js:104 |  |
| 050 10 02 | Cartes météo | PARTIEL | pratique | TEMSI/WINTEM docs.js:162-180 | cartes de surface absentes |
| 050 10 03 | Informations pour la préparation | PARTIEL | cours | TAF docs.js:95-112 ; ATIS docs.js:113 | SIGMET, GAMET, VOLMET absents |
| 050 10 04 | Services météorologiques | ABSENT | - | aucune occurrence |  |

### 3.9 061 Navigation générale — 23,5 %

| N° | Sous-sujet | Verdict | Mode | Preuve | Remarque |
|---|---|---|---|---|---|
| 061 01 01 | Système solaire, saisons | ABSENT | - | code de position du soleil seulement (base.html:427) |  |
| 061 01 02 | La Terre, coordonnées, grand cercle | ABSENT | - | « distance orthodromique » affichée base.html:1067 |  |
| 061 01 03 | Temps et conversions | ABSENT | - | « UTC » dans un exemple METAR |  |
| 061 01 04 | Directions | PARTIEL | cours | acad.js:108 | vrai/magnétique/compas absents |
| 061 01 05 | Distances | PARTIEL | cours | acad.js:90 |  |
| 061 02 01 | Compas magnétique direct | ABSENT | - | aucune occurrence |  |
| 061 03 01 | Projections | ABSENT | - | aucune occurrence |  |
| 061 03 02 | Méridiens, grands cercles, loxodromies | ABSENT | - | aucune occurrence |  |
| 061 03 03 | Utilisation des cartes aéronautiques | PARTIEL | pratique | cartes schématiques docs.js:155-197 |  |
| 061 04 01 | Bases de l'estime (triangle des vitesses) | PARTIEL | cours | acad.js:108 ; brief.js:175-176 |  |
| 061 04 02 | Calculateur de navigation | ABSENT | - | aucune occurrence |  |
| 061 04 04 | Position estimée | ABSENT | - | aucune occurrence |  |
| 061 04 05 | Mesure des éléments de l'estime | PARTIEL | pratique | OFP docs.js:49-73 |  |
| 061 05 01 | Observations visuelles | PARTIEL | pratique | route VFR hélicoptère docs.js:41 |  |
| 061 05 02 | Navigation en montée et descente | PARTIEL | cours | acad.js:128 ; brief.js:196 | montée absente |
| 061 05 03 | Navigation en croisière, recalage | ABSENT | - | aucune occurrence |  |
| 061 05 04 | Log de navigation | PARTIEL | pratique | docs.js:49-73 |  |

### 3.10 062 Radionavigation — 16,7 %

| N° | Sous-sujet | Verdict | Mode | Preuve | Remarque |
|---|---|---|---|---|---|
| 062 01 01 | Principes radio | ABSENT | - | aucune occurrence |  |
| 062 01 02 | Antennes | ABSENT | - | aucune occurrence |  |
| 062 01 03 | Propagation | ABSENT | - | aucune occurrence |  |
| 062 02 01 | Goniométrie (VDF) | ABSENT | - | aucune occurrence |  |
| 062 02 02 | NDB/ADF | ABSENT | - | aiguilles ADF nommées H320 base.html:1238 |  |
| 062 02 03 | VOR | PARTIEL | cours | acad.js:108 (une phrase) |  |
| 062 02 04 | DME | PARTIEL | cours | acad.js:108 (une phrase) |  |
| 062 02 05 | ILS | PARTIEL | cours+pratique | acad.js:108 ; QB nav ; docs.js:186-191 |  |
| 062 02 06 | MLS | ABSENT | - | aucune occurrence |  |
| 062 03 01 | Techniques d'impulsion | ABSENT | - | aucune occurrence |  |
| 062 03 02 | Radar sol | ABSENT | - | phraséologie « radar contact » seulement |  |
| 062 03 03 | Radar météo de bord | PARTIEL | cours+QCM | H320 base.html:1246 ; QB a320 base.html:1728 |  |
| 062 03 04 | SSR et transpondeur | PARTIEL | cours | H320 base.html:1246 | mode S, ADS-B absents |
| 062 05 01 | RNAV : principes | ABSENT | - | aucune occurrence |  |
| 062 05 02 | RNAV/FMS : termes | PARTIEL | pratique | fms.js:2-3 ; mode NAV |  |
| 062 06 01 | GNSS | ABSENT | - | « GPS » acad.js:108 (mention) |  |
| 062 06 02 | Augmentations (SBAS, GBAS, ABAS) | ABSENT | - | aucune occurrence |  |
| 062 07 00 | PBN (RNAV/RNP, RNP APCH) | ABSENT | - | « PBN/A1B1C1D1S1 » docs.js:83 sans explication |  |

### 3.11 070 Procédures opérationnelles — 37,5 %

| N° | Sous-sujet | Verdict | Mode | Preuve | Remarque |
|---|---|---|---|---|---|
| 071 01 01 | Annexe 6 | ABSENT | - | aucune occurrence |  |
| 071 01 02 | Exigences opérationnelles (MEL, documents) | PARTIEL | pratique | docs.js:251-262 (MEL CAT C) |  |
| 071 01 03 | Vols long-courriers (NAT HLA, ETOPS, RVSM) | PARTIEL | pratique | route NAT docs.js:40 ; CPDLC base.html:1961-1970 | ETOPS/EDTO, RVSM, SLOP absents |
| 071 02 01 | Manuel d'exploitation | ABSENT | - | aucune occurrence |  |
| 071 02 02 | Conditions givrantes (dégivrage au sol) | PARTIEL | cours | brief.js (WHYW aile) ; acad.js:105 | holdover, fluides absents |
| 071 02 03 | Péril aviaire | PARTIEL | pratique | US1549 base.html:2547-2573 |  |
| 071 02 04 | Atténuation du bruit | ABSENT | - | aucune occurrence |  |
| 071 02 05 | Feu et fumée | PARTIEL | pratique | F-FIRE base.html:2574-2580 ; scn.js |  |
| 071 02 06 | Dépressurisation | COUVERT | cours+pratique | F-DEPRESS base.html:2581-2587 ; guard.js:27 ; scn.js |  |
| 071 02 07 | Cisaillement et microrafale | PARTIEL | cours | acad.js:105 |  |
| 071 02 08 | Turbulence de sillage | ABSENT | - | catégorie « M » au FPL docs.js:80 seulement |  |
| 071 02 09 | Sûreté (actes illicites) | PARTIEL | pratique | scn.js (9525) ; acad.js:111 |  |
| 071 02 10 | Atterrissages d'urgence, amerrissage | PARTIEL | pratique | US1549 ; évacuations systems3.js:264, 299 |  |
| 071 02 11 | Vidange carburant | ABSENT | - | aucune occurrence |  |
| 071 02 12 | Marchandises dangereuses | PARTIEL | pratique | NOTOC docs.js:242-250 |  |
| 071 02 13 | Pistes contaminées | PARTIEL | pratique | systems3.js:258-265 (aquaplanage) | RCAM/RWYCC absents |

### 3.12 081 Principes du vol — 22,5 %

| N° | Sous-sujet | Verdict | Mode | Preuve | Remarque |
|---|---|---|---|---|---|
| 081 01 01 | Lois et définitions | PARTIEL | cours | acad.js:87 (½ ρ V² S Cz) | Bernoulli, continuité absents |
| 081 01 02 | Écoulement 2D autour du profil | PARTIEL | cours | acad.js:87 |  |
| 081 01 03 | Coefficients | ABSENT | - | Cz nommé seulement |  |
| 081 01 04 | Écoulement 3D | ABSENT | - | sharklets nommés |  |
| 081 01 05 | Traînée totale | ABSENT | - | seule phrase : « augmente avec la vitesse » (SIMPLIFIÉ) |  |
| 081 01 06 | Effet de sol | ABSENT | - | aucune occurrence (avion) |  |
| 081 01 07 | Relation CL / vitesse | PARTIEL | QCM | quiz acad.js:89 |  |
| 081 01 08 | Décrochage | PARTIEL | cours+pratique | acad.js:88 ; QB wb ; systems3.js:272-283 | facteur de charge, Vs1g absents |
| 081 01 09 | Hypersustentation | PARTIEL | cours | acad.js:84, 89 ; systems2.js:385 |  |
| 081 01 10 | Destructeurs de portance | PARTIEL | cours | acad.js:84 |  |
| 081 01 11 | Couche limite | ABSENT | - | aucune occurrence |  |
| 081 01 12 | Dégradation aérodynamique | PARTIEL | cours | acad.js:105 ; systems3.js:288 |  |
| 081 02 01 | Vitesses, nombre de Mach | ABSENT | - | MMO cité |  |
| 081 02 02 | Ondes de choc | ABSENT | - | aucune occurrence |  |
| 081 02 03 | Effets du dépassement de Mcrit | ABSENT | - | aucune occurrence |  |
| 081 02 04 | Tremblement (buffet onset) | ABSENT | - | aucune occurrence |  |
| 081 02 05 | Moyens d'agir sur Mcrit | ABSENT | - | aucune occurrence |  |
| 081 04 01 | Stabilité statique et dynamique | ABSENT | - | aucune occurrence |  |
| 081 04 03 | Stabilité longitudinale | PARTIEL | QCM | QB wb base.html:1708 |  |
| 081 04 04 | Stabilité directionnelle | ABSENT | - | aucune occurrence |  |
| 081 04 05 | Stabilité latérale | ABSENT | - | aucune occurrence |  |
| 081 04 06 | Stabilité dynamique latérale/directionnelle | ABSENT | - | aucune occurrence |  |
| 081 05 01 | Contrôle : généralités | PARTIEL | cours | acad.js:84, 88 |  |
| 081 05 02 | Tangage | PARTIEL | cours | acad.js:84 |  |
| 081 05 03 | Lacet | PARTIEL | cours | acad.js:84, 88 |  |
| 081 05 04 | Roulis | PARTIEL | cours | acad.js:84, 89 ; systems2.js:404 | lacet inverse absent |
| 081 05 05 | Interaction roulis/lacet | ABSENT | - | aucune occurrence |  |
| 081 05 06 | Réduction des efforts | PARTIEL | cours | systems2.js:404, 412 | tabs absents |
| 081 05 07 | Équilibrage massique | ABSENT | - | aucune occurrence |  |
| 081 05 08 | Compensation (trim) | PARTIEL | cours | acad.js:84 |  |
| 081 06 01 | Limitations opérationnelles | PARTIEL | cours | guard.js:5, 15-16, 44 |  |
| 081 06 02 | Enveloppe de manœuvre | ABSENT | - | aucune occurrence |  |
| 081 06 03 | Enveloppe de rafale | ABSENT | - | aucune occurrence |  |
| 081 07 01 | Hélices : couple et traction | ABSENT | - | aucune occurrence |  |
| 081 07 02 | Hélices : panne moteur | ABSENT | - | aucune occurrence |  |
| 081 07 03 | Hélices : absorption de puissance | ABSENT | - | aucune occurrence |  |
| 081 07 04 | Hélices : effets secondaires | ABSENT | - | aucune occurrence |  |
| 081 08 01 | Forces sur l'avion | PARTIEL | cours | acad.js:87-88 | virage et facteur de charge non chiffrés |
| 081 08 02 | Poussée dissymétrique | PARTIEL | pratique | scn.js (« palonnier pour la symétrie ») | VMCA absente |
| 081 08 03 | Points de la polaire | PARTIEL | pratique | scn.js (finesse max, green dot) |  |

### 3.13 090 Communications — 41,7 %

| N° | Sous-sujet | Verdict | Mode | Preuve | Remarque |
|---|---|---|---|---|---|
| 090 01 00 | Définitions, abréviations, Q-codes | PARTIEL | cours | acad.js:103 (QNH) | Q-codes, catégories de messages absents |
| 090 02 01 | Épellation (alphabet) | PARTIEL | cours | acad.js:110 |  |
| 090 02 02 | Chiffres et niveaux | PARTIEL | pratique | base.html:2032 ; systems3.js:168 |  |
| 090 02 03 | Heure | ABSENT | - | aucune occurrence |  |
| 090 02 04 | Technique de transmission | ABSENT | - | aucune occurrence |  |
| 090 02 05 | Mots et expressions conventionnels | PARTIEL | pratique | WILCO base.html:2054 ; systems3.js:318-326 |  |
| 090 02 06 | Indicatifs des stations au sol | PARTIEL | pratique | STN base.html:1906-1918 |  |
| 090 02 07 | Indicatifs des aéronefs | PARTIEL | pratique | séquence ATC base.html:1939+ | abréviation non enseignée |
| 090 02 08 | Transfert de communication | COUVERT | pratique | hand() base.html:1944 |  |
| 090 02 09 | Essais, échelle de lisibilité | ABSENT | - | aucune occurrence |  |
| 090 02 10 | Collationnement | COUVERT | cours+pratique | acad.js:110 ; QB a320 base.html:1728 ; base.html:1948-1950 |  |
| 090 02 11 | Phraséologie radar | PARTIEL | pratique | base.html:1958 |  |
| 090 02 12 | Changements de niveau, comptes rendus | PARTIEL | pratique | base.html:1957-1958, 1985 |  |
| 090 03 00 | Information météo (ATIS, VOLMET) | PARTIEL | pratique | ATIS base.html:1946 ; docs.js:113 | VOLMET absent |
| 090 04 00 | Panne de communication | PARTIEL | cours | acad.js:111 (7600) | procédure absente |
| 090 05 00 | Détresse et urgence | PARTIEL | pratique | base.html:2062 ; base.html:1820 | contenu du message non enseigné |
| 090 06 00 | Propagation VHF, fréquences | ABSENT | - | aucune occurrence |  |
| 090 07 00 | Morse | ABSENT | - | aucune occurrence |  |

### 3.14 100 KSA (non noté)

La CRM est présente : PF/PM, check-lists en challenge/response, surveillance croisée (parcours 9525), et débriefings « version corrigée » qui modélisent la chaîne d'erreurs. Le parcours « examen blanc » évalue l'application de procédures. On ne trouve en revanche aucune référence au cadre de compétences OACI/EASA (9 compétences, Doc 9995, CBTA/EBT), ni d'évaluation des comportements observables. Verdict qualitatif : PARTIEL. Non intégré au score, faute de sous-sujets examinés équivalents.

## 4. Erreurs relevées

### 4.1 FAUX

**F1 — `addons/acad.js:109` (toujours présent dans le code vivant, ligne 109)**
- Texte : « En **IFR** on vole aux instruments, sous contrôle radar : c'est le cas de tous les vols de ligne. »
- Erreur : l'IFR est un régime de règles de vol, pas un régime de surveillance radar. Le contrôle peut être procédural, sans radar. Le simulateur lui-même le montre avec la clairance océanique en CPDLC (`base.html:1961-1970`). Un vol IFR peut aussi se dérouler en espace non contrôlé (classes F et G).
- Correction exacte : « En **IFR** on vole selon les règles de vol aux instruments : l'avion suit des procédures et des altitudes minimales publiées et, en espace contrôlé, reçoit un service du contrôle (radar ou procédural, par exemple au-dessus des océans). Presque tous les vols de transport commercial sont effectués en IFR. »
- Sources : SERA.5015 et SERA.5025 (règles IFR, en espace contrôlé et hors espace contrôlé) ; OACI Annexe 11 (contrôle régional procédural ou radar).

**F2 — `base.html:1099` (étape Learjet 60 « Démarrage des réacteurs » ; `base.html:1118` dans le code vivant), en contradiction avec `addons/systems2.js:410-411`**
- Texte de l'étape : « Manette sur IDLE, IGN ON, bouton ENG START : le démarreur-générateur entraîne N2… » La liste à cocher exige aussi « THROTTLE R IDLE » avant « ENG START R ».
- Le cours `systems2.js:410` enseigne au contraire « Manette CUTOFF → IDLE (à 10 % N2) … trop tôt = démarrage chaud ». Son quiz (`systems2.js:411`) le confirme.
- Erreur : sur un réacteur, le carburant n'est admis qu'une fois le compresseur entraîné à une vitesse suffisante (sinon risque de démarrage chaud). La séquence de l'étape apprend l'inverse du cours.
- Correction exacte du texte : « IGN ON, bouton ENG START : le démarreur-générateur entraîne N2 ; **à 10 % N2 au minimum, manette CUTOFF → IDLE** ; stabilisation ≈ 30 s ; surveiller l'ITT. Puis GEN ON. » Dans `items`, il faut aussi placer « ENG START R » avant « THROTTLE R IDLE », et faire de même pour le côté gauche.
- Sources : FAA Airplane Flying Handbook FAA-H-8083-3C, chapitre 15 (démarrage d'un turboréacteur). La valeur de 10 % N2 est à confirmer dans l'AFM Learjet 60 par un instructeur.

### 4.2 SIMPLIFIÉ

| # | Emplacement | Affirmation | Correction | Source |
|---|---|---|---|---|
| S4 | acad.js:155 | Classe 2 valable 5 ans < 40 ans, 2 ans 40-50, 1 an > 50 | omet la règle « délivré avant 40 ans : fin de validité à 42 ans » | Part-MED MED.A.045 |
| S5 | acad.js:155, 164 | Classe 1 renouvelée chaque année | 6 mois après 60 ans (et après 40 ans en monopilote transport de passagers) | Part-MED MED.A.045 |
| S13 | acad.js:127 ; base.html:1069 | Réserve de route = 5 % de l'étape | ajouter le minimum de 5 min et les variantes (3 % ERA, 20 min, SCF) | AMC1 CAT.OP.MPA.181 (5 % ou au moins 5 min d'attente au-dessus de la destination) |
| S16 | guard.js:5, 15 | VLO 250 kt | préciser 220 kt pour la rentrée | EASA TCDS A.064 : VLO 250 kt en sortie, 220 kt en rentrée |
| S36 | acad.js:109 | « En VFR on vole en voyant le sol » | le VFR exige les VMC (visibilité, distance aux nuages), pas la vue du sol en toutes circonstances | SERA.5001/5005 |
| S37 | acad.js:87 | « Traînée : augmente avec la vitesse » | corrigé dans le code vivant après l'instantané | FAA PHAK ch. 5 (la traînée induite diminue avec la vitesse) |
| S42 | acad.js:90, 128 ; base.html:952 | VAPP = VLS + 5 kt | aligner tous les modules sur la règle complète | incohérence interne : brief.js donne « + ⅓ du vent de face, + rafales, max + 15 kt » |
| S50 | brief.js:169 | CAVOK = « aucun nuage sous 5 000 ft » | ajouter : ou sous la plus haute MSA, pas de CB/TCU, visibilité ≥ 10 km, pas de temps significatif | OACI Annexe 3 |
| S53 | brief.js:167 | Visibilité < 1 500 m : approche aux instruments obligatoire |  | SERA.5001/5005 (VMC : 5 km en CTR, 1 500 m en VFR spécial) |
| S54 | brief.js:170 | Givrage entre +10 °C et −20 °C avec humidité visible | ordre de grandeur ; le givrage existe en dessous de −20 °C | FAA AC 91-74B ; FAA PHAK ch. 12 |
| S56 | docs.js:188 | FAF à 5,5 NM / 2 000 ft sur un plan à 3,0° | schéma : recaler FAF/IF sur 318 ft/NM | calcul : 2 000 ft à 5,5 NM ≈ 3,4° ; plan 3° → ≈ 6,1 NM |
| S64 | base.html:1226 | WING ANTI ICE : « dégivrage » des becs | écrire « antigivrage » (fonction préventive) | FAA AC 91-74B (définitions antigivrage/dégivrage) |
| S65 | docs.js:245 | NOTOC : UN3481 PI 967 section II déclaré | exemple sans inexactitude mais trompeur ; choisir un article réellement soumis à NOTOC | OACI Doc 9284 (piles en section II dispensées de NOTOC) |
| S74 | acad.js:110 | Radio « en français en France pour le VFR » | le français est aussi admis en IFR sur les aérodromes désignés | SERA.14015 et réglementation nationale |

### 4.3 Registre complet des affirmations contrôlées

E = exact, S = simplifié, F = faux, NV = non vérifiable.

| # | Emplacement | Affirmation | Verdict | Source |
|---|---|---|---|---|
| 1 | acad.js:152 | PPL(A) : 45 h dont 25 h DC, 10 h solo supervisé dont 5 h nav., vol de 270 km avec 2 atterrissages | E | Part-FCL FCL.210.A |
| 2 | acad.js:152 | LAPL(A) : 30 h dont 15 h DC, 6 h solo supervisé, nav. de 150 km | E | Part-FCL FCL.110.A |
| 3 | acad.js:152 | Âges : 16 ans premier solo, 17 ans licence | E | Part-FCL FCL.020, FCL.100 |
| 4 | acad.js:155 | Classe 2 valable 5 ans < 40 ans, 2 ans 40-50, 1 an > 50 | S | Part-MED MED.A.045 |
| 5 | acad.js:155, 164 | Classe 1 renouvelée chaque année | S | Part-MED MED.A.045 |
| 6 | acad.js:164 | Copilote dès 18 ans (CPL), CDB dès 21 ans (ATPL) | E | Part-FCL FCL.300, FCL.500 |
| 7 | acad.js:169 | 1 500 h pour l'ATPL complet | E | Part-FCL FCL.510.A |
| 8 | acad.js:117 | Contrôle simulateur tous les 6 mois en compagnie | E | Air OPS ORO.FC.230 (OPC) |
| 9 | acad.js:157 | Examen PPL DGAC : 9 épreuves depuis le 4/12/2023, 75 % par épreuve ; 18 mois ; validité 24 mois | E | DGAC (page examens) ; aerovfr.com 10/2023 ; FCL.025 |
| 10 | acad.js:169 | ATPL théorique : 13 à 14 épreuves | E | AMC1 FCL.310 (13 matières examinées + domaine 100 KSA) |
| 11 | base.html:1068 | Masses forfaitaires 84 kg (≥ 30 sièges), 88/70 (20-29), 104/96/92 (≤ 19), bagage 15 kg intercontinental | E | Air OPS CAT.POL.MAB.100, tableaux 1 à 4 |
| 12 | base.html:1711 | Réserve finale 30 min à 1 500 ft (turbine) | E | Air OPS CAT.OP.MPA.181 et AMC |
| 13 | acad.js:127 ; base.html:1069 | Réserve de route = 5 % de l'étape | S | AMC1 CAT.OP.MPA.181 (5 % ou au moins 5 min d'attente au-dessus de la destination) |
| 14 | guard.js:5 ; base.html:1736 | VMO 350 kt, MMO 0,82 | E | EASA TCDS A.064 (consulté) |
| 15 | guard.js:5 | VLE 280 kt | E | EASA TCDS A.064 |
| 16 | guard.js:5, 15 | VLO 250 kt | S | EASA TCDS A.064 : VLO 250 kt en sortie, 220 kt en rentrée |
| 17 | guard.js:5 | VFE 1/2/3/FULL = 230/200/185/177 kt | E | EASA TCDS A.064 |
| 18 | base.html:936 | A320 : MTOW 78 000, MLW 66 000, MZFW 62 500 kg | E | EASA TCDS A.064 (A320-214) |
| 19 | base.html:936 | Corde moyenne aérodynamique 4,19 m | E | EASA TCDS A.064 (4,1935 m) |
| 20 | systems2.js:398 | Carburant ≈ 24 000 L (A320ceo de base) | E | EASA TCDS A.064 (23 859 L, 3 réservoirs) |
| 21 | acad.js:178 | A320 : longueur 37,57 m, largeur fuselage 3,95 m | E | Airbus, page A320ceo |
| 22 | guard.js:27 ; scn.js | Temps de conscience utile à FL350 : 30 s à 1 min | E | FAA PHAK ch. 17 ; FAA AIM 8-1-2 |
| 23 | base.html:2583 | Masques passagers automatiques vers 14 000 ft cabine | E | CS 25.1447(c)(1) (présentation avant 15 000 ft) |
| 24 | systems2.js:398 | Altitude cabine maximale ≈ 8 000 ft | E | CS 25.841(a) |
| 25 | acad.js:111 | 7700 détresse, 7600 panne radio, 7500 intervention illicite | E | OACI Doc 8168 vol. I ; Annexe 10 |
| 26 | base.html:1727 | La RA prime sur une instruction ATC contraire ; annoncer « TCAS RA » | E | OACI Doc 8168 vol. I ; Doc 4444 15.7.3 |
| 27 | scn.js ; base.html:2600 | Réagir à une RA en 5 s | E | OACI Doc 8168 vol. I (ACAS) |
| 28 | base.html:1721 | Feux de bord de taxiway bleus, d'axe verts, de bord de piste blancs | E | OACI Annexe 14 ; FAA AIM 2-1 |
| 29 | base.html:1722-1723 | Panneaux : rouge/blanc obligation, noir/jaune position, jaune/noir direction | E | OACI Annexe 14 ; FAA AIM 2-3-8 |
| 30 | base.html:1724 | Marque de point d'attente : 2 lignes continues + 2 tiretées | E | OACI Annexe 14 ; FAA AIM 2-3-5 |
| 31 | base.html:1716 | Plan 3° ≈ 318 ft/NM ; taux ≈ vitesse sol × 5 | E | calcul (tan 3° × 6 076 ft) ; FAA AIM |
| 32 | acad.js:90 | 1 NM = 1 852 m ; 1 000 ft ≈ 305 m | E | OACI Annexe 5 |
| 33 | base.html:1717 | Au-dessus de l'altitude de transition : 1013,25 hPa | E | OACI Doc 8168 vol. I |
| 34 | base.html:1087 | Altitude de transition 18 000 ft aux États-Unis | E | FAA AIM 7-2-2 ; 14 CFR 91.121 |
| 35 | acad.js:109 | « En IFR on vole aux instruments, sous contrôle radar : c'est le cas de tous les vols de ligne » | F | SERA.5025 ; OACI Annexe 11 (contrôle procédural possible ; IFR possible hors espace contrôlé) |
| 36 | acad.js:109 | « En VFR on vole en voyant le sol » | S | SERA.5001/5005 |
| 37 | acad.js:87 | « Traînée : augmente avec la vitesse » | S | FAA PHAK ch. 5 (la traînée induite diminue avec la vitesse) |
| 38 | acad.js:88 | Décrochage : réduire l'incidence, puis remettre la puissance | E | FAA Airplane Flying Handbook ch. 5 |
| 39 | acad.js:89 | Portance proportionnelle à V² (× 4 si V double) | E | FAA PHAK ch. 5 |
| 40 | base.html:1708 | CG arrière : moins stable ; CG avant : Vs plus élevée | E | FAA PHAK ch. 10 |
| 41 | base.html:1707 | CG = Σ moments ÷ Σ masses | E | FAA PHAK ch. 10 |
| 42 | acad.js:90, 128 ; base.html:952 | VAPP = VLS + 5 kt | S | incohérence interne : brief.js donne « + ⅓ du vent de face, + rafales, max + 15 kt » |
| 43 | brief.js:138 | V2 : vitesse de sécurité atteinte à 35 ft avec un moteur en panne | E | CS 25.107, 25.111 |
| 44 | base.html:1697 | V1 : vitesse de décision | E | CS 25.107(a)(2) |
| 45 | docs.js:80 | A320 : catégorie de turbulence de sillage M | E | OACI Doc 8643 |
| 46 | docs.js:74-94 | Plan de vol OACI : cases 7, 8, 9, 10, 13, 15, 16, 18, 19 | E | OACI Doc 4444, appendice 2 |
| 47 | docs.js:150 | NOTAM : champs Q, A, B, C, E ; QMXLC = taxiway fermé | E | OACI Annexe 15 ; Doc 8126 |
| 48 | docs.js:109 | TAF : FM, BECMG, TEMPO | E | OACI Annexe 3 |
| 49 | brief.js:169 | FEW 1-2, SCT 3-4, BKN 5-7, OVC 8 octas | E | OACI Annexe 3 |
| 50 | brief.js:169 | CAVOK = « aucun nuage sous 5 000 ft » | S | OACI Annexe 3 |
| 51 | brief.js:166 | Vent du METAR en degrés vrais | E | OACI Annexe 3 |
| 52 | docs.js:174 | WINTEM FL340 ≈ 250 hPa ; barbule entière = 10 kt | E | OACI Annexe 3 ; atmosphère type |
| 53 | brief.js:167 | Visibilité < 1 500 m : approche aux instruments obligatoire | S | SERA.5001/5005 (VMC : 5 km en CTR, 1 500 m en VFR spécial) |
| 54 | brief.js:170 | Givrage entre +10 °C et −20 °C avec humidité visible | S | FAA AC 91-74B ; FAA PHAK ch. 12 |
| 55 | docs.js:189 | ILS CAT I : DA 200 ft, RVR 550 m | E | Air OPS (AMC CAT.OP.MPA.110) |
| 56 | docs.js:188 | FAF à 5,5 NM / 2 000 ft sur un plan à 3,0° | S | calcul : 2 000 ft à 5,5 NM ≈ 3,4° ; plan 3° → ≈ 6,1 NM |
| 57 | base.html:2552-2554 | US1549 : impact d'oiseaux à 2 818 ft, MAYDAY 15:27:33, amerrissage 125 kt, 9,5°, ≈ 750 ft/min, volets 2 | E | NTSB AAR-10/03 |
| 58 | base.html:2573 | NTSB : délai réaliste de 35 s, retour LGA alors impossible | E | NTSB AAR-10/03 |
| 59 | base.html:1748-1749 | R44 : pales en rotation sous 5 s après embrayage ; 25 psi d'huile sous 30 s ; 101-102 % | E | Robinson, R44 II POH section 4 |
| 60 | systems3.js:355 | R44 en faible g : roulis à droite dû au rotor anticouple | E | Robinson Safety Notice SN-11 |
| 61 | base.html:1099 vs systems2.js:410-411 | Learjet 60 : « manette sur IDLE, puis ENG START » contredit « CUTOFF → IDLE à 10 % N2 » | F | incohérence interne ; FAA Airplane Flying Handbook ch. 15 (carburant après rotation suffisante) |
| 62 | base.html:937 | Learjet 60 : MTOW 10 660 kg, MLW 8 845 kg, MZFW 7 257 kg | E | FAA TCDS A10CE (23 500 / 19 500 / 16 000 lb) |
| 63 | base.html:1742 | JFK-CDG ≈ 5 840 km | E | calcul orthodromique (5 833 km) |
| 64 | base.html:1226 | WING ANTI ICE : « dégivrage » des becs | S | FAA AC 91-74B (définitions antigivrage/dégivrage) |
| 65 | docs.js:245 | NOTOC : UN3481 PI 967 section II déclaré | S | OACI Doc 9284 (piles en section II dispensées de NOTOC) |
| 66 | acad.js:93 | Double flux : la plus grande partie de l'air contourne le cœur et donne l'essentiel de la poussée | E | FAA AFH ch. 15 ; FAA PHAK ch. 7 |
| 67 | acad.js:94 | N1 = image de la poussée | E | FAA AFH ch. 15 |
| 68 | acad.js:105 | Orage : contourner, ne jamais traverser | E | FAA AC 00-24C |
| 69 | base.html:1728 | Radar météo : tilt trop haut, la cellule disparaît | E | FAA AC 00-24C |
| 70 | base.html:1246 | TCAS : STBY / TA / TA-RA | E | FAA AC 20-151 |
| 71 | brief.js:196 | Plan 3° : environ 300 ft par NM | E | calcul |
| 72 | acad.js:103 | Avec le QNH, au sol l'altimètre lit l'altitude du terrain | E | OACI Doc 8168 vol. I |
| 73 | acad.js:110 | Alphabet OACI (Alfa, Bravo...) | E | OACI Annexe 10 vol. II |
| 74 | acad.js:110 | Radio « en français en France pour le VFR » | S | SERA.14015 et réglementation nationale |
| 75 | base.html:1730 | A320 : inclinaison maximale 67° en loi normale | NV | FCOM Airbus (non public) |
| 76 | guard.js:27 | Alarme EXCESS CAB ALT vers 9 550 ft | NV | FCOM Airbus (non public) |
| 77 | systems2.js:394 | CFM56 : allumage 16 % N2, carburant 22 %, coupure démarreur 50 % | NV | FCOM Airbus (non public) |
| 78 | systems2.js:398 | Répartition des 3 circuits hydrauliques, PTU 500 psi | NV | FCOM Airbus (non public) |
| 79 | systems2.js:398 | IDG 90 kVA ; batteries Ni-Cd 24 V / 23 Ah | NV | FCOM Airbus (non public) |
| 80 | base.html:1078, 1005 | Alignement ADIRS ≈ 6 min à l'équateur, 10 min au-delà de 45° | NV | aucune source primaire publique (le code cite « retours d'exploitation ») |
| 81 | guard.js:31 | DITCHING : la pression cabine monte jusqu'aux soupapes | NV | FCOM Airbus (non public) |
| 82 | base.html:1084 | Roulage : 20 kt en ligne droite, 10 kt en virage | NV | FCTM Airbus (non public) |
| 83 | brief.js:176 | Vent arrière limite usuelle 10 kt | NV | AFM (non public) |
| 84 | scn.js ; base.html:2580 | Aucune action sous 400 ft (feu moteur) | NV | FCTM Airbus (non public) |
| 85 | base.html:2589 | ELEC EMER CONFIG : loi alternée | NV | FCOM Airbus (non public) |
| 86 | base.html:2589-2592 | Démarrage APU sur batteries limité au FL250 | NV | FCOM Airbus (non public) |
| 87 | base.html:2573 | NTSB : 7 retours réussis sur 13 essais immédiats | NV | NTSB AAR-10/03 non relu sur ce point |
| 88 | base.html:1742 | Learjet 60 : autonomie ≈ 4 400 km | NV | fiche constructeur non consultée |
## 5. Plan de comblement : les 15 manques prioritaires

Priorité = nombre de sous-sujets ABSENTS × poids de la matière à l'examen ATPL × risque pédagogique. Effort en jours-personne (j) pour un rédacteur qualifié, hors relecture par un instructeur.

| # | Manque (sous-sujets) | Contenu concret à ajouter | Effort |
|---|---|---|---|
| 1 | **050 Météo physique** (050 01 01-02, 01 05, 02 02-06, 03 02-03, 05 01, 06 01-02, 07, 08) | Module « Atmosphère » : couches, ISA (15 °C, 1013,25 hPa, −6,5 °C/1 000 m jusqu'à 11 km), densité. Module « Vent » : gradient de pression, Coriolis, vent géostrophique et de gradient, frottement, brises, foehn, ondes. Module « Thermodynamique » : humidité, chaleur latente, adiabatiques sèche (3 °C/1 000 ft) et saturée, stabilité, schémas d'émagramme. Modules « Masses d'air et fronts » (coupes de fronts chaud, froid, occlus, temps associé), « Centres de pression », « Climatologie » (ZCIT, moussons, cyclones). Environ 120 QCM. | 8 j |
| 2 | **081 Haute vitesse et stabilité** (081 02 01-05, 04 01, 04 04-06, 05 05, 05 07, 06 02-03) | Mach, Mcrit, ondes de choc, Mach tuck, buffet et coffin corner (marge 1,3 g), flèche et profil supercritique. Stabilité statique et dynamique, point neutre, marge statique, dièdre, roulis hollandais, spirale. Diagramme V-n (2,5 g / −1 g), enveloppe de rafale, VA, VRA. Interactions roulis-lacet, flutter. Environ 100 QCM. | 6 j |
| 3 | **062 Radionavigation** (062 01, 02 01-02, 02 06, 03 01-02, 05 01, 06, 07) | Bandes de fréquences et propagation (ondes de sol, d'espace, ligne de vue avec la formule 1,23√h). NDB/ADF (QDM, QDR, erreurs), VOR (radiales, cône de silence), DME (distance oblique), ILS (couverture, catégories). Radar primaire, SSR modes A/C/S, ADS-B. GNSS (segments, erreurs, RAIM), SBAS/EGNOS, GBAS. PBN : RNAV 5/1, RNP 1, RNP APCH (LNAV, LNAV/VNAV, LPV), RNP AR. Exploiter le ND du simulateur pour des exercices d'orientation VOR/ADF. Environ 120 QCM. | 7 j |
| 4 | **032 Performances classes A et B** (032 01 01, 01 03-04, 02, 03, 04 03-04, 05 02-03) | Classes A, B et C. TORA/TODA/ASDA/LDA. VMCG, VMCA, VEF, V1, VR, VLOF, V2 ; piste équilibrée ; segments de montée (2,4 % / 0 % / 1,2 % pour un biréacteur) ; trajectoire nette et marges d'obstacles 35 ft. Drift-down. Atterrissage (60 %, ×1,67, +15 % piste mouillée). Vx, Vy, finesse, Vmd, Vmp, LRC, indice de coût. Classe B. Remplacer les formules [ESTIMÉ] par des abaques pédagogiques. Environ 100 QCM. | 7 j |
| 5 | **061 Navigation générale** (061 01 01-03, 02 01, 03 01-02, 04 02, 04 04, 05 03) | La Terre (coordonnées, grand cercle, loxodromie, convergence), temps (UTC, heure locale, lever et coucher du soleil), directions (vrai, magnétique, compas, déclinaison, déviation), projections (Mercator, Lambert, stéréographique polaire), triangle des vitesses et calculateur, estime et recalage. Exercices sur le globe du simulateur. Environ 100 QCM. | 6 j |
| 6 | **010 Droit international et aérodromes** (010 01, 02, 04 01, 05 01-02, 05 06, 06 02, 06 05, 06 07, 08 01-03, 09, 11, 12, 13) | Chicago et libertés de l'air, OACI, EASA, Eurocontrol. Annexes 1, 7, 13, 14, 15, 17. SERA : VMC (tableau SERA.5001), règles IFR, interception. PANS-OPS : DA/H, MDA, OCA/H, attente (entrées directe, décalée et parallèle). Classes d'espace A à G. Distances déclarées, balisage, PAPI. SAR (phases INCERFA, ALERFA, DETRESFA ; signaux). Sûreté. Enquêtes (règlements 996/2010 et 376/2014). Environ 150 QCM. | 8 j |
| 7 | **022 Instruments de base** (022 01 01-04, 08-09, 02 02-03, 02 05, 02 07, 03, 04 01-02, 04 04-05, 13 01-02, 13 05-07, 14 02-03, 15) | Chaîne Pitot-statique et ses erreurs (obstructions, position). IAS, CAS, EAS, TAS ; Mach ; erreurs d'altimètre (température, pression : « du haut vers le bas, attention en bas »). Gyroscopes (rigidité, précession, dérives). Compas, erreurs de virage et d'accélération, vanne de flux. FDR. HUD, EFB, FLI. Environ 100 QCM. | 6 j |
| 8 | **Corriger F1 et F2 et harmoniser les simplifications** (S13, S16, S42, S50, S53, S56, S64) | Appliquer les corrections du § 4. Une seule règle VAPP (VLS + max(5 kt, ⅓ vent de face), plafonnée à +15 kt) dans `acad.js`, `exam.js` et `stepsFor`. Ajouter le minimum de 5 min à la réserve de route. VLO 250/220 kt. CAVOK complet. Recaler la géométrie de la carte ILS. | 1 j |
| 9 | **033 PET/PSR et carburant spécifique** (033 03 03, 04 03, 05 02) | Formules PET = D·H/(O+H) et PSR = E·O·H/(O+H), avec un exercice sur la traversée JFK-CDG du simulateur. Point de décision et reclearance, aérodrome isolé, tankering. RPL. | 2 j |
| 10 | **070 Procédures opérationnelles** (071 01 01, 02 01, 02 04, 02 08, 02 11) | Turbulence de sillage (catégories OACI et RECAT-EU, séparations, procédures). Bruit (NADP 1 et 2). Dégivrage au sol (fluides de type I à IV, holdover). ETOPS/EDTO, RVSM, NAT HLA, SLOP. Vidange carburant. Annexe 6, manuel d'exploitation. Scénario jouable « turbulence de sillage en finale ». | 4 j |
| 11 | **040 Performance humaine** (040 01 04, 02 02, 03 06, et les PARTIEL) | SHELL, modèle de Reason, TEM, culture juste et SMS. Physiologie : vision (point aveugle, vision nocturne), oreille interne et illusions (somatogravique, « leans », trou noir), hypoxie et hyperventilation, barotraumatismes. Stress et charge de travail (courbe de Yerkes-Dodson). Prise de décision (FORDEC/DODAR). Relier chaque scénario d'accident à ces concepts. | 4 j |
| 12 | **090 Communications IFR** (090 02 03-04, 02 09, 04, 05, 06, 07) | Q-codes, catégories de messages, transmission de l'heure et des chiffres, échelle de lisibilité 1-5. Panne radio : SERA.14083 (VMC : se poser au plus proche ; IMC : maintien 7 min puis plan de vol). Contenu des messages MAYDAY/PAN-PAN, 121,5 MHz. Propagation VHF et canaux à 8,33 kHz. Indicatifs morse. Ajouter dans `atcSeqFW` un scénario de panne radio. | 3 j |
| 13 | **031 Méthodes de centrage** (031 04 02-03, 05 03, 06 02-03) | Méthode des indices, formule de déplacement du CG Δx = m·d/M, transfert de charge et de carburant, pesée, extraction de la BEM, charge au plancher et charge linéaire, arrimage. Exercices sur le devis A320 existant (`WB`). | 2 j |
| 14 | **021 Bases génériques** (021 01 01, 01 03, 03 01, 07 02, 09 01, 09 05, 10 02, 10 05, 10 09-10, 11 05) | Conception fail-safe, safe-life et damage-tolerant ; fatigue et corrosion ; loi de Pascal ; électricité de base (loi d'Ohm, disjoncteurs, logique) ; AVGAS ; refroidissement ; hélices (pas variable, drapeau, régulation) ; flat rating et effet de la température sur la poussée ; détecteurs de givre. | 5 j |
| 15 | **Banque de QCM et traçabilité** | Passer de 51 questions `QB` à au moins 2 000 QCM étiquetés par learning objective (champ `lo:'050 03 03 01'`). Tirer les examens blancs par matière selon la répartition de l'AMC1 FCL.310. Exporter une table LO ↔ module ↔ QCM pour rendre les futurs audits mesurables. | 10 j |

Effort total estimé : environ 79 jours-personne. Score projeté si tous les manques sont traités au niveau COUVERT : environ 70 à 80 %. Les 98 % demandent en plus d'approfondir la plupart des 184 sous-sujets PARTIELS.

## 6. Échantillon pour relecture par un instructeur humain (38 points, ≈ 10 %)

Priorité : erreurs FAUX, verdicts COUVERT (risque de surévaluation), verdicts limites PARTIEL/ABSENT, et affirmations NON VÉRIFIABLES à fort enjeu.

| # | Point | Question pour l'instructeur |
|---|---|---|
| 1 | F1 `acad.js:109` (IFR) | La correction proposée convient-elle ? |
| 2 | F2 `base.html:1099` (Learjet 60) | Séquence et seuil de 10 % N2 conformes à l'AFM ? |
| 3 | 021 02 03 COUVERT | La description de la voilure suffit-elle pour l'ATPL ? |
| 4 | 021 02 04 COUVERT | Fuselage, train, portes : suffisant ? |
| 5 | 021 11 02 COUVERT | Composants du réacteur : suffisant ? |
| 6 | 021 11 03 COUVERT | AGB, FADEC, inverseurs : suffisant ? |
| 7 | 031 02 03 COUVERT | Masses forfaitaires et calculs : suffisant ? |
| 8 | 033 03 01 COUVERT | Carburant, généralités |
| 9 | 033 03 02 COUVERT | Carburant commercial, malgré l'absence du minimum de 5 min |
| 10 | 033 04 01 COUVERT | Décodage NOTAM |
| 11 | 033 04 02 COUVERT | Dossier météo |
| 12 | 033 05 01 COUVERT | FPL case par case |
| 13 | 033 06 01 COUVERT | Suivi carburant |
| 14 | 050 10 01 COUVERT | METAR/SPECI |
| 15 | 071 02 06 COUVERT | Dépressurisation (contenu propre à l'A320) |
| 16 | 090 02 08 COUVERT (pratique) | Une pratique sans explication peut-elle valoir COUVERT ? |
| 17 | 090 02 10 COUVERT | Collationnement |
| 18 | 010 06 06 PARTIEL | Calage altimétrique : COUVERT possible ? |
| 19 | 022 12 10 PARTIEL | TCAS : COUVERT possible ? |
| 20 | 040 03 04 PARTIEL | CRM |
| 21 | 021 03 02 PARTIEL | Hydraulique A320 détaillée mais non générique |
| 22 | 021 05 04 PARTIEL | FBW |
| 23 | 010 07 02 PARTIEL | Clairances pratiquées sans théorie des séparations |
| 24 | 032 04 01 PARTIEL | V1/VR/V2 sans VMCG ni ASD |
| 25 | 010 04 02 PARTIEL | Part-FCL (niveau PPL) |
| 26 | 022 05 02 PARTIEL | Alignement IRS |
| 27 | 081 01 05 ABSENT | Une seule phrase simplifiée : ABSENT ou PARTIEL ? (corrigé dans le code vivant) |
| 28 | 022 06 04 ABSENT | FMA nommé mais non expliqué |
| 29 | 050 06 02 ABSENT | Symbole de front froid sur la TEMSI seulement |
| 30 | 061 01 02 ABSENT | Distance orthodromique affichée sans cours |
| 31 | 062 06 01 ABSENT | GPS cité en une phrase |
| 32 | 010 13 02 ABSENT | Rapports BEA/NTSB utilisés sans cours sur l'enquête |
| 33 | 040 02 02 ABSENT | « Illusions sensorielles » seulement nommées |
| 34 | NV 81 `guard.js:31` | DITCHING : la pression cabine monte-t-elle réellement (fermeture des vannes de packs) ? |
| 35 | NV 86 | Démarrage de l'APU sur batteries limité au FL250 ? |
| 36 | NV 78 | Répartition des utilisateurs des circuits vert, bleu et jaune |
| 37 | NV 80 | Durée d'alignement ADIRS en fonction de la latitude |
| 38 | NV 87 | US1549 : « 7 essais sur 13 » conforme au rapport NTSB ? |

## 7. Sources

Référentiel EASA :
- EASA, *Appendix to AMC & GM to Part-FCL, Amendment 10* (ED Decision 2020/018/R) : https://easa.europa.eu/da/downloads/120814/en
- EASA, *Annex II to ED Decision 2016/008/R — Learning Objectives, Amendment 2* : https://easa.europa.eu/de/downloads/20796/en
- EASA, ED Decision 2018/001/R (fiche et annexes) : https://easa.europa.eu/en/document-library/agency-decisions/ed-decision-2018001r
- EASA, *AMC & GM to Part-FCL, Amendment 8* (ED Decision 2019/017/R) : https://easa.europa.eu/bg/downloads/102529/en
- EASA, Easy Access Rules for Aircrew (sommaire, AMC1 FCL.310 ; FCL.515(b)) : https://www.easa.europa.eu/en/document-library/easy-access-rules/online-publications/easy-access-rules-aircrew-regulation-eu-no?page=47

Données techniques et réglementaires :
- EASA, TCDS EASA.A.064 Airbus A318/A319/A320/A321 (consulté) : https://www.easa.europa.eu/en/downloads/16507/en
- EASA Community, schéma carburant et réserve de route (citation de l'AMC1/AMC6 CAT.OP.MPA.181 ; source secondaire) : https://www.easa.europa.eu/community/topics/fuel-scheme-and-its-effects-contingency-fuel
- DGAC, examens théoriques du personnel navigant : https://www.ecologie.gouv.fr/politiques-publiques/examens-theoriques-devenir-personnel-navigant
- AeroVFR (source secondaire), passage à 9 modules le 4/12/2023 : https://aerovfr.com/2023/10/de-la-pratique-de-lexamen-theorique

FAA et enquêtes :
- FAA, Pilot's Handbook of Aeronautical Knowledge (FAA-H-8083-25) : https://www.faa.gov/regulations_policies/handbooks_manuals/aviation/phak
- FAA, Airplane Flying Handbook (FAA-H-8083-3C) : https://www.faa.gov/regulations_policies/handbooks_manuals/aviation/airplane_handbook
- FAA, Aeronautical Information Manual : https://www.faa.gov/air_traffic/publications/atpubs/aim_html/
- NTSB, AAR-10/03 (US Airways 1549) : https://www.ntsb.gov/investigations/AccidentReports/Reports/AAR1003.pdf

Constructeurs :
- Airbus, A320ceo (dimensions) : https://www.aircraft.airbus.com/en/aircraft/a320-family/a320ceo

Textes cités sans re-téléchargement pendant l'audit : SERA (règlement (UE) 923/2012), Air OPS (965/2012 : CAT.POL.MAB.100, CAT.OP.MPA.181, ORO.FC.230), Part-FCL, Part-MED, CS-25, OACI Annexes 2, 3, 5, 10, 11, 14, 15, Doc 4444, Doc 8168, Doc 8643, Doc 9284, FAA AC 00-24C, AC 20-151, AC 91-74B, FAA TCDS A10CE, Robinson R44 II POH et SN-11.
