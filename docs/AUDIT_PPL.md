# Audit indépendant : couverture du programme théorique EASA PPL(A) par le simulateur « PLANE TRAJECTORIES »

Auditeur : relecture de type FI/TKI, indépendante des auteurs du logiciel. Audit en lecture seule : le code n'a pas été modifié.
Date : 16 novembre 2026.

---

## 1. Résumé

| Matière (code de matière EASA) | Sous-sujets | Couvert | Partiel | Absent | **Score de couverture** |
|---|---:|---:|---:|---:|---:|
| 1. Droit aérien et procédures ATC (010) | 46 | 0 | 11 | 35 | **12,0 %** |
| 2. Performance humaine (040) | 27 | 0 | 6 | 21 | **11,1 %** |
| 3. Météorologie (050) | 46 | 0 | 14 | 32 | **15,2 %** |
| 4. Communications (090) | 19 | 1 | 11 | 7 | **34,2 %** |
| 5. Principes du vol, avion (080) | 33 | 1 | 17 | 15 | **28,8 %** |
| 6. Procédures opérationnelles (070) | 8 | 1 | 5 | 2 | **43,8 %** |
| 7. Performances et préparation du vol (030) | 15 | 4 | 9 | 2 | **56,7 %** |
| 8. Connaissance générale de l'aéronef (020) | 36 | 6 | 20 | 10 | **44,4 %** |
| 9. Navigation (060) | 22 | 0 | 7 | 15 | **15,9 %** |
| **Global (les 9 matières pèsent autant)** | **252** | **13** | **100** | **139** | **29,1 %** |

Barème : COUVERT = 1, PARTIEL = 0,5, ABSENT = 0, rapporté au nombre de sous-sujets de la matière. Le score global est la moyenne simple des 9 scores.

**Indice d'exactitude** (55 affirmations techniques vérifiées, détail en section 5) :
- 36 exactes, 3 FAUX, 6 SIMPLIFIÉ, 10 NON VÉRIFIABLE ;
- **exactitude stricte : 80,0 %** (36 sur 45 affirmations vérifiables) ;
- **exact ou simplification acceptable : 93,3 %** (42 sur 45).

**Verdict sur l'objectif « approcher 98 % d'un cours réel » : non atteint, et de loin (29 %).**
Ce que le simulateur enseigne, il l'enseigne en général correctement (93 % d'affirmations exactes ou acceptables). Mais il couvre surtout un vol de ligne IFR (A320, B777, Learjet) et des hélicoptères. Le PPL(A), lui, porte sur un monomoteur à pistons en VFR. Les points forts sont la masse et le centrage, le carburant, les systèmes (cellule, commandes de vol, alarmes, écrans), le roulage et les incursions de piste, et la radio pratique en anglais. Quatre matières sont quasi absentes : le droit aérien (règles de l'air, VMC, espaces aériens), la performance humaine, la météorologie théorique et la navigation VFR.

Pour approcher 98 %, il faudrait au minimum :
1. **Un avion école monomoteur à pistons** (type DR400 ou C172). Sans lui, la moitié de la matière 8 (hélice, givrage carburateur, mélange, carburants AVGAS) et de la matière 7 (abaques de performances, Vx/Vy) reste hors de portée.
2. **Un module de cours par matière** suivant les 252 sous-sujets, avec schémas et exemples chiffrés. Il faut aussi une banque de QCM organisée comme l'examen DGAC : 9 épreuves, 128 questions, 75 % requis dans chaque épreuve (source : aerovfr, voir section 8).
3. **Une mission de navigation VFR** : carte au 1/500 000, triangle des vitesses, log de navigation, déroutement, espaces aériens, SIV.
4. **La correction des 3 erreurs FAUX et la mise en contexte PPL des 6 simplifications** (voir section 5).
5. **Une relecture par un FI/TKI**, au minimum de l'échantillon de la section 7.

---

## 2. Référence utilisée et limites de l'audit

**Référence principale.** EASA, *Easy Access Rules for Aircrew (Regulation (EU) No 1178/2011)*, version en ligne, texte **AMC1 FCL.210; FCL.215 « Syllabus of theoretical knowledge for the PPL(A) and PPL(H) »**. La page en ligne cite en dernier amendement l'ED Decision 2020/005/R.
URL : https://www.easa.europa.eu/en/document-library/easy-access-rules/online-publications/easy-access-rules-aircrew-regulation-eu-no?page=9

**Source complémentaire.** The Honourable Company of Air Pilots, *PPL(A) Training Programme (SEP/TMG, AltMoC1 FCL.210;215)*, version 1 de mars 2019. Ce document sert de contrôle de granularité et a été utilisé pour les procédures opérationnelles.
URL : https://www.airpilots.org/file/4f9e99a120e95165db8c5497a36004e3/pplprogrammev1.pdf

**Limites (à lire avant d'utiliser les scores) :**
1. **Numérotation.** Le syllabus en ligne de l'EASA présente des rubriques non numérotées dans un tableau à 9 matières. Je n'ai pas pu obtenir le document intégral avec la numérotation des objectifs d'apprentissage (du type « 010 01 01 00 »). Le serveur PDF de l'EASA et les miroirs nationaux (CAA Norvège) étaient bloqués par le proxy de la session. La colonne « n° » utilise donc une numérotation d'audit **matière.rubrique.sous-rubrique**, dans l'ordre du texte officiel. Le code de matière (010, 040, etc.) est donné entre parenthèses à titre de correspondance. **Ce n'est pas la numérotation officielle des objectifs d'apprentissage.**
2. **Granularité.** L'extraction du tableau officiel a été faite au deuxième niveau (rubrique, puis sous-rubrique). Un audit au niveau de chaque objectif d'apprentissage donnerait des scores plus bas, parce qu'un sous-sujet « partiel » contient souvent plusieurs objectifs absents.
3. **Code modifié pendant l'audit.** `base.html` est passé de 2 853 à 2 872 lignes, et `docs.js` a aussi changé. J'ai donc figé un instantané le **2026-11-16T14:19:33+01:00** et tous les numéros de ligne s'y rapportent. Empreintes SHA-256 (16 premiers caractères) : `base.html f46fe25654f5f7f3`, `acad.js a5261287cd39d1c5`, `brief.js 8c8585c67bcdfbea`, `docs.js e9d732ad08be52a3`, `guard.js 06db6c6df6bb84be`, `systems2.js 1b2656a67af47840`, `systems3.js a638f53d999d10fe`. Les fichiers s'appellent `src/addons/acad.js`, `systems*.js`, etc., et non `addon_acad.js` comme indiqué dans la commande.
4. **Méthode de preuve.** Recherche par mots-clés (plus de 250 expressions régulières), puis lecture du texte des cours `acad.js` (parties 1 à 5), de `systems2.js` (partie 5, ca0 à ca8), des QCM `QB` (`base.html` l. 1696 à 1760), des étapes `commonFirst`, de `brief.js`, `docs.js`, `guard.js` et du module accidents de `systems3.js`. Une notion non trouvée par recherche peut exister sous un autre libellé. C'est pourquoi les verdicts ABSENT les plus lourds sont dans l'échantillon de relecture.
5. **Règles de verdict.** Un mot isolé dans une liste, sans fait examinable, compte ABSENT. Un sujet traité en une ou deux phrases contenant au moins un fait examinable compte PARTIEL au mieux. COUVERT exige une explication et au moins une vérification (QCM, calcul ou étape pratique). Les verdicts de type « pratique » indiquent que la notion n'apparaît que dans une action du parcours, sans être expliquée.
6. **Sources secondaires.** Certaines vérifications A320 reposent sur des documentations publiques non constructeur (FlyByWire, a320.netlify.app) ou sur un blog de pilote (VAPP). Elles sont signalées comme telles. Les données Airbus officielles (FCOM) n'étaient pas accessibles.

---

## 3. Tableau détaillé par matière

Abréviations des preuves : `B` = `src/base.html`, `ac` = `addons/acad.js`, `br` = `addons/brief.js`, `dc` = `addons/docs.js`, `gd` = `addons/guard.js`, `s2` = `addons/systems2.js`, `s3` = `addons/systems3.js`, `sy` = `addons/systems.js`, `sc` = `addons/scn.js`.
Type : **E** = explicatif (cours ou QCM commenté), **P** = pratique seulement.

### 3.1 Droit aérien et procédures ATC (010) — 12,0 %

| n° | Sous-sujet officiel | Verdict | Preuve | Type | Remarque |
|---|---|---|---|---|---|
| 1.1.1 | Convention de Chicago, partie I : principes généraux, application | ABSENT | aucune occurrence de « Chicago » | – | |
| 1.1.2 | Survol du territoire des États contractants | ABSENT | – | – | |
| 1.1.3 | Nationalité des aéronefs | ABSENT | – | – | |
| 1.1.4 | Mesures pour faciliter la navigation aérienne | ABSENT | – | – | |
| 1.1.5 | Conditions à remplir par les aéronefs (documents de bord) | ABSENT | – | – | |
| 1.1.6 | Normes et pratiques recommandées (SARP) | ABSENT | – | – | |
| 1.1.7 | Validité des certificats et licences | ABSENT | – | – | |
| 1.1.8 | Notification des différences | ABSENT | – | – | |
| 1.1.9 | Partie II : objectifs et composition de l'OACI | ABSENT | – | – | |
| 1.2.1 | Annexe 8 : définitions | ABSENT | – | – | |
| 1.2.2 | Certificat de navigabilité | ABSENT | dc:251 (compte rendu matériel / MEL) ne traite pas du CDN | – | |
| 1.3.1 | Annexe 7 : définitions | ABSENT | – | – | |
| 1.3.2 | Marques de nationalité et d'immatriculation | ABSENT | seulement un champ « Immatriculation » (s3:22) | – | |
| 1.3.3 | Certificat d'immatriculation | ABSENT | – | – | |
| 1.4.1 | Annexe 1 : définitions | ABSENT | – | – | |
| 1.4.2 | Licences : liens avec Part-FCL et Part-MED | PARTIEL | ac:152 (LAPL/PPL : heures, âges), ac:155 (médical), ac:157 (examen) | E | Exact (voir §5). Manquent les privilèges détaillés, l'expérience récente (3 décollages et atterrissages en 90 jours), la validité et la prorogation de la qualification de classe SEP. |
| 1.5.1 | SERA / Annexe 2 : définitions, application, règles générales (priorités, anticollision, vol à proximité d'un aérodrome, hauteurs minimales) | ABSENT | aucune règle de priorité ou de hauteur minimale ; seulement le TCAS (B:1727) | – | **Manque majeur.** |
| 1.5.2 | Règles de vol à vue (VMC, VFR) | ABSENT | ac:109 « En VFR on vole en voyant le sol… (conditions météo minimales) », sans aucune valeur | – | Aucun minimum de visibilité ni de distance aux nuages, par classe d'espace. |
| 1.5.3 | Signaux et interception des aéronefs civils | ABSENT | aucun signal lumineux de la tour ; « interception » n'apparaît que dans fms.js (interception de route) | – | |
| 1.6.1 | Procédures de calage altimétrique | PARTIEL | ac:103 ; br:140, br:142, br:171 ; B:1718 (QCM) ; dc:184/190 (altitudes de transition) | E | QFE absent, couche de transition non définie, **erreur B:1087** (voir F1). |
| 1.6.2 | Exigences de base, procédures des exploitants et des pilotes | ABSENT | – | – | |
| 1.6.3 | Procédures d'emploi du transpondeur SSR | PARTIEL | ac:111 (7700/7600/7500) ; B:1036 (STBY/AUTO/ON) ; affichage du code (B:1920) | E+P | Modes A/C/S, code VFR 7000 et IDENT non expliqués. |
| 1.6.4 | Phraséologie | PARTIEL | B:1939 et suivantes (séquence ATC complète) | P | Phraséologie IFR en anglais (FAA/OACI) ; pas de phraséologie VFR française. |
| 1.7.1 | Annexe 11 / Doc 4444 : définitions | ABSENT | – | – | |
| 1.7.2 | Dispositions générales des services ATS (contrôle, information de vol, alerte ; classes d'espace) | ABSENT | seulement « KJFK — CTR classe B » sur une carte schématique (dc:157) | – | **Manque majeur** : classes A à G, CTR, TMA, zones P/R/D, RMZ/TMZ. |
| 1.7.3 | Séparation visuelle au voisinage des aérodromes | ABSENT | – | – | |
| 1.7.4 | Procédures du contrôle d'aérodrome | PARTIEL | B:1939 et suivantes (alignement, autorisation de décollage et d'atterrissage, point d'arrêt) | P | Aucun tour de piste VFR (vent arrière, base, finale). |
| 1.7.5 | Services radar | PARTIEL | B:1939 et suivantes (« radar contact », « radar vectors ») | P | |
| 1.7.6 | Services d'information de vol et d'alerte | ABSENT | aucun SIV/FIS | – | |
| 1.7.7 | Phraséologies | PARTIEL | idem 1.6.4 | P | |
| 1.7.8 | Urgences, panne de communications, imprévus | PARTIEL | B:2061 (MAYDAY / PAN PAN) ; ac:111 (7600) | P | Pas de procédure de panne radio VFR. |
| 1.8.1 | Annexe 15 : introduction, définitions | ABSENT | – | – | |
| 1.8.2 | AIP, NOTAM, AIRAC, AIC | PARTIEL | dc:114 (NOTAM d'exemple) ; br:120 (rôle des NOTAM) | E+P | Pas de structure de l'AIP (GEN/ENR/AD), pas de lecture de la ligne Q, pas de SUP/AIC, pas de carte VAC. |
| 1.9.1 | Annexe 14 : définitions | ABSENT | – | – | |
| 1.9.2 | Données d'aérodrome, état de l'aire de mouvement | ABSENT | – | – | |
| 1.9.3 | Aides visuelles (indicateurs, marques, feux, panneaux) | PARTIEL | B:1721 à 1725 (5 QCM : feux, panneaux, marquage du point d'attente) ; balisage 3D (B:378) | E | Exact (E13 à E16). Manquent l'aire à signaux, la manche à air, le PAPI et le marquage des seuils. |
| 1.9.4 | Balisage des obstacles | ABSENT | – | – | |
| 1.9.5 | Aires d'emploi restreint | ABSENT | – | – | |
| 1.9.6 | Services d'urgence (SSLIA), gestion de l'aire de trafic | ABSENT | – | – | |
| 1.10.1 | Annexe 12, recherche et sauvetage : définitions | ABSENT | – | – | |
| 1.10.2 | Procédures (commandant de bord sur les lieux d'un accident, interception d'un message de détresse) | ABSENT | – | – | |
| 1.10.3 | Signaux SAR (sol-air, air-sol, navires) | ABSENT | – | – | |
| 1.11.1 | Annexe 17, sûreté : buts et objectifs | PARTIEL | ac:111 (7500 « intervention illicite ») ; gd:70 (porte du poste) | E | À peine effleuré. |
| 1.12.1 | Annexe 13 : définitions (accident, incident grave) | ABSENT | des cas d'accidents existent (s3:177 et suivantes) mais sans définitions réglementaires | – | |
| 1.12.2 | Application, notification | ABSENT | – | – | |
| 1.13 | Droit national et différences avec l'OACI et l'UE | ABSENT | – | – | |

### 3.2 Performance humaine (040) — 11,1 %

| n° | Sous-sujet officiel | Verdict | Preuve | Type | Remarque |
|---|---|---|---|---|---|
| 2.1.1 | Facteurs humains en aviation | PARTIEL | ac:116 ; analyses d'accidents s3:177 à 300 (fonction AN : causes, parades) | E | Études de cas de bonne qualité, mais sans cadre théorique (modèle SHELL, statistiques). |
| 2.1.2 | Devenir un pilote compétent | ABSENT | – | – | |
| 2.2.1 | Atmosphère : composition, lois des gaz | ABSENT | – | – | |
| 2.2.2 | Systèmes respiratoire et circulatoire (hypoxie, hyperventilation, CO, décompression) | PARTIEL | gd:27 et sc:41 (temps de conscience utile) ; ac:116 | E+P | Seule l'hypoxie en altitude, côté avion de ligne, est traitée. Rien sur l'hyperventilation, le monoxyde de carbone (chauffage d'un avion léger), les plafonds d'oxygène en aviation générale. |
| 2.2.3 | Systèmes nerveux | ABSENT | – | – | |
| 2.3.1 | Vision | ABSENT | – | – | Ni vision de nuit, ni technique de veille extérieure, ni tache aveugle. |
| 2.3.2 | Audition | ABSENT | seulement « douleurs d'oreilles » (gd:27) | – | |
| 2.3.3 | Équilibre | ABSENT | – | – | |
| 2.3.4 | Intégration sensorielle (désorientation, illusions, approche et atterrissage) | ABSENT | le mot « illusions sensorielles » seul (ac:116) | – | **Manque majeur** (le vol VFR en conditions dégradées est une cause d'accident). |
| 2.4.1 | Hygiène personnelle, condition physique | ABSENT | – | – | |
| 2.4.2 | Rythmes biologiques, sommeil | ABSENT | – | – | |
| 2.4.3 | Problèmes de santé courants (barotraumatismes, plongée, rhume) | ABSENT | – | – | |
| 2.4.4 | Intoxication (médicaments, alcool, drogues, tabac, caféine) | ABSENT | – | – | |
| 2.5.1 | Attention, vigilance | ABSENT | – | – | |
| 2.5.2 | Perception | ABSENT | – | – | |
| 2.5.3 | Mémoire | ABSENT | seulement « on ne se fie pas à sa mémoire » (ac:116) | – | |
| 2.6.1 | Fiabilité du comportement humain | ABSENT | – | – | |
| 2.6.2 | Genèse de l'erreur | PARTIEL | s3:203 (check-list interrompue), s3:213 (distraction), s3:235 (incompréhension radio) | P+E | Cas concrets ; pas de typologie (lapsus, raté, faute). |
| 2.7.1 | Prise de décision | PARTIEL | s3:177 à 184 (« get-there-itis », approche non stabilisée) ; V1 (B:1697) | E | Aucun modèle de décision (DECIDE, FOR-DEC, T-DODAR). |
| 2.8.1 | Gestion du poste (check-lists, charge de travail) | PARTIEL | ac:116 ; B:1701 (check-list « challenge / response ») ; B:1081 ; br:131 | E | |
| 2.8.2 | Conscience de la situation, zones de risque | ABSENT | – | – | |
| 2.8.3 | Communication verbale et non verbale | PARTIEL | ac:116 (CRM) ; s3:235 (« OK » compris comme une autorisation) | E | |
| 2.9.1 | Personnalité et attitudes | ABSENT | – | – | |
| 2.9.2 | Attitudes dangereuses | ABSENT | – | – | Les 5 attitudes dangereuses de la FAA et leurs antidotes ne sont pas enseignées. |
| 2.10.1 | Éveil (arousal) | ABSENT | – | – | |
| 2.10.2 | Stress | ABSENT | le mot seul (ac:116) | – | |
| 2.10.3 | Fatigue et gestion du stress | ABSENT | le mot seul (ac:116) | – | |

### 3.3 Météorologie (050) — 15,2 %

| n° | Sous-sujet officiel | Verdict | Preuve | Type | Remarque |
|---|---|---|---|---|---|
| 3.1.1 | Atmosphère : composition, étendue, division verticale | ABSENT | « tropopause » seulement en légende de carte (dc:172) | – | |
| 3.1.2 | Température : gradients, stabilité, inversions | ABSENT | – | – | |
| 3.1.3 | Pression : isobares, variation avec l'altitude, réduction au niveau de la mer | PARTIEL | ac:103 (« la pression baisse quand on monte » ; QNH ramené au niveau de la mer) | E | |
| 3.1.4 | Densité | PARTIEL | ac:87 (ρ dans la formule de portance), ac:102 | E | Altitude-densité absente. |
| 3.1.5 | Atmosphère type OACI (ISA) | ABSENT | ISA programmée en code (B:269 à 271) mais jamais enseignée | – | |
| 3.1.6 | Altimétrie (termes, calages, calculs, effet de la température) | PARTIEL | ac:103 ; br:171 ; B:2413 (« un QNH mal affiché fausse l'altitude ») | E | Ni environ 27 ft/hPa, ni règle « du chaud vers le froid, attention en dessous », ni erreurs de température. |
| 3.2.1 | Vent : définition, mesure | PARTIEL | ac:106 (QCM « d'où vient le vent ») ; br:172 à 176 (composantes) | E | |
| 3.2.2 | Causes : gradient de pression, Coriolis, vent géostrophique | ABSENT | – | – | |
| 3.2.3 | Variation dans la couche de frottement | ABSENT | modèle présent en code (B:2369) mais non enseigné | – | |
| 3.2.4 | Circulation générale | ABSENT | – | – | |
| 3.2.5 | Vents locaux (brises, vents anabatiques et catabatiques, effet Venturi) | ABSENT | – | – | |
| 3.2.6 | Ondes orographiques | ABSENT | – | – | |
| 3.2.7 | Turbulence : types, formation | ABSENT | seulement « turbulence en ciel clair » en légende de carte (dc:172) | – | |
| 3.3.1 | Humidité, point de rosée | ABSENT | le point de rosée est décodé dans le METAR (ac:104) mais jamais expliqué | – | |
| 3.3.2 | Changements d'état, chaleur latente | ABSENT | – | – | |
| 3.3.3 | Processus adiabatiques, stabilité | ABSENT | – | – | |
| 3.4.1 | Formation des nuages | ABSENT | – | – | |
| 3.4.2 | Types et classification des nuages | PARTIEL | codes FEW/SCT/BKN/OVC/CB/TCU (dc:110, ac:104) ; danger des CB (ac:105) | E | Pas les 10 genres de nuages ni les étages. |
| 3.4.3 | Brouillard, brume : généralités | PARTIEL | br:161 (BR/FG/HZ) ; ac:105 (ligne « Brouillard ») | E | |
| 3.4.4 | Types de brouillard (rayonnement, advection, évaporation, frontal, orographique) | ABSENT | – | – | |
| 3.5.1 | Processus de précipitation | ABSENT | – | – | |
| 3.5.2 | Types de précipitations et nuages associés | PARTIEL | br:161 (RA, DZ, SN, GR, GS, SH, TS) | E | Décodage seulement. |
| 3.6.1 | Masses d'air | ABSENT | – | – | |
| 3.6.2 | Fronts : généralités | ABSENT | seulement « front froid » sur la TEMSI (dc:172) | – | |
| 3.6.3 | Types de fronts et temps associé | ABSENT | – | – | **Manque majeur.** |
| 3.6.4 | Mouvement des fronts, cycle de vie | ABSENT | – | – | |
| 3.6.5 | Évolution d'une onde frontale | ABSENT | – | – | |
| 3.7.1 | Anticyclones | ABSENT | – | – | |
| 3.7.2 | Dépressions non frontales | ABSENT | – | – | |
| 3.8.1 | Zones climatiques | ABSENT | – | – | |
| 3.8.2 | Situations types aux latitudes moyennes | ABSENT | – | – | |
| 3.8.3 | Vents locaux et temps associé (foehn) | ABSENT | – | – | |
| 3.9.1 | Givrage : conditions, types, dangers, prévention | PARTIEL | ac:105 ; modèle de givrage B:483 et B:2423 ; s3:191 (sondes Pitot givrées) | E+P | Pas de types (givre blanc, givre transparent, verglas). Givrage carburateur seulement cité (s2:414). |
| 3.9.2 | Turbulence : effets, évitement | ABSENT | – | – | |
| 3.9.3 | Cisaillement de vent | PARTIEL | ac:105 ; B:1246 (PWS) | E+P | |
| 3.9.4 | Orages : conditions, développement | ABSENT | – | – | |
| 3.9.5 | Orages : structure, cycle de vie, lignes de grains | ABSENT | – | – | |
| 3.9.6 | Décharges électriques, rafales descendantes | ABSENT | – | – | |
| 3.9.7 | Évitement des orages | PARTIEL | ac:105 (« contourner, jamais traverser ») ; QCM radar B:1728 | E | |
| 3.9.8 | Inversions : effet sur les performances | ABSENT | – | – | |
| 3.9.9 | Dangers en montagne | ABSENT | – | – | |
| 3.9.10 | Réduction de visibilité | PARTIEL | décodage visibilité METAR (ac:104, B:2402) | E | |
| 3.10.1 | Observations (sol, radiosondage, satellite, radar) | PARTIEL | METAR réels (B:2330 et suivantes) ; ATIS (dc:113) | E+P | Observations au sol seulement. |
| 3.10.2 | Cartes (TEMSI/SIGWX, cartes de surface) | PARTIEL | dc:162 à 172 (TEMSI schématique), dc:174 (WINTEM) | P | Lecture de carte non enseignée ; pas de carte isobarique. |
| 3.10.3 | Informations pour la préparation (messages, diffusions, avertissements) | PARTIEL | dc:95 à 111 (METAR, TAF, FM/BECMG/TEMPO) ; br:120 | E | Ni SIGMET, AIRMET, GAMET ni VOLMET. TAF expliqué en une ligne (dc:110). |
| 3.10.4 | Services (WAFS, centres météo) | ABSENT | WAFS cité seulement (B:2413) | – | |

### 3.4 Communications (090) — 34,2 %

| n° | Sous-sujet officiel | Verdict | Preuve | Type | Remarque |
|---|---|---|---|---|---|
| 4.1.1 | Définitions : sens des termes | ABSENT | – | – | |
| 4.1.2 | Abréviations ATS | ABSENT | utilisées (ATIS, CTR…) mais pas enseignées | – | |
| 4.1.3 | Codes Q (QNH, QFE, QDM…) | PARTIEL | QNH expliqué (ac:103) ; QFE seulement comme mauvaise réponse (B:1718) | E | |
| 4.1.4 | Catégories de messages (ordre de priorité) | ABSENT | – | – | |
| 4.2.1 | Épellation des lettres | PARTIEL | ac:110 (alphabet partiel) ; B:2397 (alphabet complet, utilisé pour la lettre ATIS) | E+P | |
| 4.2.2 | Chiffres et niveaux | PARTIEL | s3:87 (« one three five decimal niner ») | P | Règles non enseignées. |
| 4.2.3 | Transmission de l'heure | ABSENT | – | – | |
| 4.2.4 | Technique d'émission | ABSENT | – | – | |
| 4.2.5 | Expressions conventionnelles (ROGER, WILCO, AFFIRM…) | ABSENT | seulement WILCO en CPDLC (B:2054) | – | |
| 4.2.6 | Indicatifs (stations, aéronefs, abréviation) | PARTIEL | indicatif « SIMU … », stations (B:1939 et suivantes) | P | |
| 4.2.7 | Transfert de communication | PARTIEL | « contact … on … » (B:1939 et suivantes, fonction hand) | P | |
| 4.2.8 | Essais radio, échelle de lisibilité | PARTIEL | sy:700 (« reading you five ») | P | L'échelle 1 à 5 n'est pas enseignée. |
| 4.2.9 | Collationnement et accusé de réception | **COUVERT** | ac:110 (éléments à collationner) ; B:1729 (QCM commenté) ; collationnement vérifié en vol (B:1939 et suivantes, rb/ok) | E+P | |
| 4.3.1 | Termes météo d'aérodrome | PARTIEL | ATIS (dc:113, B:1946) ; METAR | E+P | |
| 4.3.2 | Diffusions météo (ATIS, VOLMET) | PARTIEL | ATIS oui, VOLMET non | P | |
| 4.4 | Conduite en cas de panne de communications | PARTIEL | ac:111 (code 7600 seulement) | E | Pas de procédure (VMC, aérodrome le plus proche, émission en l'air). |
| 4.5 | Procédures de détresse | PARTIEL | B:2061 (MAYDAY ×3) ; ac:111 (7700) ; s3:119 | P | Contenu du message incomplet (voir N7) ; 121,5 MHz jamais expliqué. |
| 4.6 | Procédures d'urgence | PARTIEL | B:2061 (PAN PAN ×3) | P | |
| 4.7 | Propagation VHF, attribution des fréquences | ABSENT | – | – | Portée optique non traitée. |

### 3.5 Principes du vol, avion (080) — 28,8 %

| n° | Sous-sujet officiel | Verdict | Preuve | Type | Remarque |
|---|---|---|---|---|---|
| 5.1.1 | Notions, lois, définitions | PARTIEL | ac:86 (portance par déviation de l'air vers le bas) | E | Ni Bernoulli ni équation de continuité. |
| 5.1.2 | Écoulement : notions de base | ABSENT | – | – | |
| 5.1.3 | Forces aérodynamiques | PARTIEL | ac:87 (4 forces) | E | |
| 5.1.4 | Forme du profil (corde, cambrure, épaisseur) | ABSENT | seulement « les nervures donnent le profil » (s2:387) | – | |
| 5.1.5 | Forme de l'aile (allongement, flèche) | ABSENT | – | – | |
| 5.1.6 | Écoulement 2D autour du profil (incidence, répartition des pressions) | PARTIEL | ac:87 (définition de l'incidence) | E | |
| 5.1.7 | Coefficients (Cz, Cx, courbe Cz-α) | PARTIEL | ac:87 (½ ρ V² S Cz), ac:91 (QCM V²) | E | |
| 5.1.8 | Écoulement 3D (tourbillons marginaux, déflexion vers le bas) | ABSENT | – | – | |
| 5.1.9 | Traînée (parasite, induite, courbe de traînée totale) | ABSENT | ac:87 « la traînée augmente avec la vitesse » (voir S1) | – | Phrase trompeuse, donc pas de crédit. |
| 5.1.10 | Effet de sol (avion) | ABSENT | seulement HIGE/HOGE pour les hélicoptères (ac:138) | – | |
| 5.1.11 | Décrochage | PARTIEL | ac:88, ac:91 (QCM) ; s3:191 (cas AF447) | E | Facteurs de la vitesse de décrochage (masse, facteur de charge, centrage, volets) absents ; vrille absente. |
| 5.1.12 | Hypersustentation (volets, becs) | PARTIEL | ac:83, ac:85 ; s2:387 (volets Fowler) ; gd:20 (VFE) | E+P | |
| 5.1.13 | Couche limite | ABSENT | – | – | |
| 5.1.14 | Circonstances particulières (glace, contamination) | PARTIEL | ac:105 ; B:483 (Cz max −22 % givré) | E | |
| 5.2.1 | Équilibre en vol stabilisé | PARTIEL | ac:87 | E | |
| 5.2.2 | Moyens d'équilibrage (empennage, trim) | PARTIEL | ac:83 (plan horizontal réglable : « équilibrer selon le centrage ») | E | |
| 5.2.3 | Stabilité longitudinale statique et dynamique | PARTIEL | B:1709 (QCM : centrage arrière moins stable) | E | |
| 5.2.4 | Stabilité latérale et de route (dièdre, flèche, dérive) | ABSENT | – | – | |
| 5.3.1 | Commandes : généralités (axes, gouvernes) | **COUVERT** | ac:83 (tableau des gouvernes), ac:89 (3 axes, schéma SVG), ac:85 (QCM) | E | |
| 5.3.2 | Contrôle en tangage | PARTIEL | ac:83 | E | |
| 5.3.3 | Contrôle en lacet | PARTIEL | ac:83, ac:89 (bille au centre) | E | Lacet inverse absent. |
| 5.3.4 | Contrôle en roulis | PARTIEL | ac:83, ac:85 | E | |
| 5.3.5 | Réduction des efforts aux commandes | ABSENT | seulement servocommandes hydrauliques (s2:407) ; compensation aérodynamique absente | – | |
| 5.3.6 | Équilibrage massique | ABSENT | – | – | |
| 5.3.7 | Compensation (trim) | PARTIEL | ac:83 ; calcul du trim B:963 | E+P | |
| 5.4.1 | Limitations (VNE, VNO, VFE, VLE/VLO, VA, arcs de l'anémomètre) | PARTIEL | gd:20 (VFE), B:1737 (MMO) | E+P | Arcs de couleur de l'anémomètre avion absents. |
| 5.4.2 | Domaine de manœuvre (facteur de charge, VA) | ABSENT | – | – | |
| 5.4.3 | Domaine de rafale | ABSENT | – | – | |
| 5.5.1 | Hélice : du couple à la traction | ABSENT | seulement « l'hélice visse l'avion » (ac:92) | – | |
| 5.5.2 | Moments dus à l'hélice (couple, souffle, effet gyroscopique, facteur P) | ABSENT | – | – | |
| 5.6 | Panne ou arrêt moteur | PARTIEL | V1/V2 (B:1697 à 1699) ; gd:38 (dissymétrie, descente sur un moteur) | E | Plané d'un monomoteur (finesse max) absent. |
| 5.7.1 | Forces en montée, descente, plané | ABSENT | – | – | |
| 5.7.2 | Virage coordonné stabilisé (n = 1/cos φ, rayon, taux) | PARTIEL | ac:89 | E | Facteur de charge absent. |

### 3.6 Procédures opérationnelles (070) — 43,8 %

| n° | Sous-sujet officiel | Verdict | Preuve | Type | Remarque |
|---|---|---|---|---|---|
| 6.1.1 | Exploitation des aéronefs (Annexe 6, NCO : responsabilités du CDB, documents, carburant, équipements) | PARTIEL | ac:114 (CDB) ; B:1067 à 1069 (préparation) | E | Contexte transport commercial (CAT) ; Part-NCO absente. |
| 6.1.2 | Moindre bruit | ABSENT | – | – | |
| 6.1.3 | Prévention des incursions de piste | **COUVERT** | br:137 ; B:1721 à 1725 (QCM) ; s3:235 (cas d'incursion dans le brouillard, avec version corrigée) | E+P | |
| 6.2 | Feu ou fumée | PARTIEL | pannes « feu moteur », « fumée soute/avionique » (B:1815 et suivantes) ; gd:75 | P | Procédures d'avion de ligne seulement ; pas de feu moteur monomoteur. |
| 6.3 | Cisaillement de vent, microrafale | PARTIEL | ac:105 ; PWS | E | |
| 6.4 | Turbulence de sillage | ABSENT | aucune occurrence de « sillage » ni de « wake » | – | **Manque majeur.** |
| 6.5 | Atterrissages d'urgence et de précaution | PARTIEL | autorotation (s3:252 à 260) ; amerrissage A320 (sc:175) | P+E | Atterrissage forcé avion (choix du champ, PTE) absent. |
| 6.6 | Pistes contaminées | PARTIEL | s3:177 (sortie de piste sur piste mouillée) | P | Aquaplanage et coefficients de freinage non enseignés. |

*Le programme de l'Air Pilots (AltMoC) détaille aussi les marchandises dangereuses, le SAR, le compte rendu d'événements et le briefing des passagers. Ils sont faiblement présents : NOTOC en dc:242, consignes cabine. Ils ne sont pas comptés pour ne pas sortir de la référence officielle.*

### 3.7 Performances et préparation du vol (030) — 56,7 %

| n° | Sous-sujet officiel | Verdict | Preuve | Type | Remarque |
|---|---|---|---|---|---|
| 7.1.1 | Masse et centrage : objet, limitations | **COUVERT** | B:1068 ; B:1709 (QCM) ; br:179 | E+P | |
| 7.1.2 | Chargement : terminologie, limites, calculs | **COUVERT** | ac:126 (ZFW/TOW/LW) ; B:1705 à 1707 ; B:950 (calcul) ; ac:131 (exercice) | E+P | Masses forfaitaires : voir F2 et S2. |
| 7.1.3 | Principes du calcul du centre de gravité | **COUVERT** | B:1708 (Σ m·d / Σ m) ; br:179 | E+P | |
| 7.1.4 | Documentation (référence, bras de levier, masse de base) | PARTIEL | WB B:935 et suivantes ; dc:198 | P | Masse à vide de base et masse de base opérationnelle non distinguées. |
| 7.1.5 | Détermination du centrage (calcul et méthode graphique) | PARTIEL | calcul seulement | E+P | Pas d'enveloppe graphique. |
| 7.1.6 | Devis de masse et centrage | **COUVERT** | dc:198 (load & trim sheet) ; B:1068 (étape signée) | P+E | Format avion de ligne. |
| 7.2.1 | Introduction (classes de performances, phases, pentes) | ABSENT | – | – | |
| 7.2.2 | Monomoteur : termes et vitesses (Vx, Vy, VS, VR, TODA/TORA/ASDA/LDA) | PARTIEL | B:1697 à 1699 (V1/VR/V2, vitesses CS-25) ; ac:90 | E | Distances déclarées, Vx et Vy absentes. |
| 7.2.3 | Performances au décollage et à l'atterrissage | PARTIEL | dc:236 (TODC) ; br:172 à 176 (vent effectif) ; B:963 (VR fonction de la masse) | E | Altitude-pression, température, pente, nature de piste et abaques absents. |
| 7.2.4 | Performances en montée et en croisière | ABSENT | consommation horaire constante (B:950) | – | |
| 7.3.1a | Préparation VFR : log de navigation | PARTIEL | dc:49 (OFP de ligne) | P | Pas de log VFR. |
| 7.3.1b | Préparation VFR : bilan carburant | PARTIEL | ac:127 ; B:1069 ; dc:219 ; br:122 | E+P | Règles CAT IFR seulement ; réserves VFR NCO (30 min de jour, 45 min de nuit) absentes. |
| 7.3.2 | Préparation : briefing AIP, NOTAM et météo | PARTIEL | B:1067 ; br:120 ; dc:95 et dc:114 | E+P | |
| 7.3.3 | Plan de vol OACI | PARTIEL | dc:74 (FPL déposé d'exemple) | P | Cases non expliquées une par une. |
| 7.3.4 | Suivi du vol et nouvelle planification en vol | PARTIEL | br:189 (carburant ≥ dégagement + réserve) ; s3:223 (fuite carburant) | E+P | |

### 3.8 Connaissance générale de l'aéronef (020) — 44,4 %

| n° | Sous-sujet officiel | Verdict | Preuve | Type | Remarque |
|---|---|---|---|---|---|
| 8.1.1 | Conception, charges | PARTIEL | s2:385 (semi-monocoque) | E | |
| 8.1.2 | Cellule : ailes, empennages, gouvernes | **COUVERT** | s2:387 et 388 ; ac:82 et 83 ; QCM s2:389 | E | |
| 8.1.3 | Fuselage, portes, plancher, pare-brise | **COUVERT** | s2:386, s2:390 à 393 ; ac:174 | E | |
| 8.1.4 | Hydraulique | PARTIEL | s2:400 et 401 (A320) | E+P | Principe de Pascal et types de fluide absents. |
| 8.1.5 | Trains d'atterrissage : types, matériaux | PARTIEL | s2:388 | E | Tricycle et train classique non comparés. |
| 8.1.6 | Roulette de nez orientable | PARTIEL | s2:400 | E | |
| 8.1.7 | Freins | PARTIEL | s2:388 ; auto-frein B:1239 ; gd:46 | E+P | |
| 8.1.8 | Roues et pneus | PARTIEL | tour avion (B:980 à 982) ; s3:288 (éclatement de pneu) | P | |
| 8.1.9 | Commandes de vol (mécaniques, assistées) | **COUVERT** | s2:407 ; s2:409 et 410 (câbles du Learjet) ; QCM s2:408 | E | |
| 8.1.10 | Commandes secondaires | **COUVERT** | s2:387, s2:407 ; ac:83 | E | |
| 8.1.11 | Antigivrage (Pitot, pare-brise) | PARTIEL | B:782 et 791 (PITOT HEAT) ; panne de réchauffage de sonde | P+E | |
| 8.1.12 | Circuit carburant d'un moteur à pistons | PARTIEL | s2:414 (R44, injection, pompes) | E | Pas de sélecteur, de mise à l'air libre ni de purge expliqués. |
| 8.1.13 | Électricité : généralités (CC/CA, loi d'Ohm) | ABSENT | – | – | |
| 8.1.14 | Batteries | PARTIEL | s2:398 | E | |
| 8.1.15 | Électricité statique (déperditeurs, foudre) | ABSENT | seulement « déperditeurs statiques » au tour avion (B:980) | – | |
| 8.1.16 | Production d'énergie électrique (CC, CA) | PARTIEL | s2:398, s2:409 | E | |
| 8.1.17 | Composants (disjoncteurs, relais) | ABSENT | – | – | |
| 8.1.18 | Distribution (barres) | PARTIEL | s2:398 | E | |
| 8.1.19 | Moteurs à pistons : généralités | PARTIEL | ac:92 (4 temps en une phrase) ; s2:414 | E | |
| 8.1.20 | Carburants (indices, carburants de remplacement) | ABSENT | – | – | AVGAS 100LL et UL91 absents. |
| 8.1.21 | Carburateur ou injection | PARTIEL | s2:414 | E | **F3** en s2:349. |
| 8.1.22 | Givrage carburateur, refroidissement, lubrification, allumage, mélange | PARTIEL | s2:414 (magnétos) ; br:135 ; cadran CHT (B:722) | E | Givrage carburateur non expliqué ; réglage du mélange en croisière absent. |
| 8.1.23 | Hélices (pas fixe, pas variable, conduite) | ABSENT | – | – | |
| 8.1.24 | Performances et conduite du moteur | ABSENT | – | – | |
| 8.2.1 | Indicateurs (pression, température, carburant, débit, compte-tours) | PARTIEL | ac:94 (N1, EGT, FF) ; cadrans R44 (B:722) | E+P | |
| 8.2.2 | Mesure des pressions (Pitot et statique, erreurs) | PARTIEL | s2:404 | E | Effets d'un Pitot ou d'une prise statique bouchés absents. |
| 8.2.3 | Mesure de température (SAT/TAT) | ABSENT | seulement « sonde TAT » (s2:404) | – | |
| 8.2.4 | Altimètre | PARTIEL | ac:103 (« baromètre gradué en pieds ») | E | Erreurs absentes. |
| 8.2.5 | Variomètre | ABSENT | seulement l'étiquette du schéma (ac:57) | – | |
| 8.2.6 | Anémomètre (IAS, CAS, TAS, erreurs, arcs) | ABSENT | conversions en code (B:273 et 274), non enseignées | – | |
| 8.2.7 | Magnétisme et compas | ABSENT | seulement l'interrupteur STBY COMPASS (B:1271) | – | |
| 8.2.8 | Instruments gyroscopiques | PARTIEL | ac:57 ; AHRS (ac:135), ADIRU (s2:405) | E | Rigidité et précession absentes. |
| 8.2.9 | Équipements de communication | PARTIEL | RMP/ACP (B:1197, B:1305) | P | |
| 8.2.10 | Systèmes d'alarme | **COUVERT** | ECAM, GPWS, TCAS (B:1211, B:1727, B:1461) ; gd:27 | E+P | |
| 8.2.11 | Avertisseur de décrochage | PARTIEL | ac:88 | E | |
| 8.2.12 | Instruments intégrés, écrans électroniques | **COUVERT** | ac:98 ; s2:406 ; QCM ac:101 | E | |

### 3.9 Navigation (060) — 15,9 %

| n° | Sous-sujet officiel | Verdict | Preuve | Type | Remarque |
|---|---|---|---|---|---|
| 9.1.1 | Système solaire, saisons | ABSENT | – | – | |
| 9.1.2 | La Terre (orthodromie, loxodromie, latitude, longitude) | ABSENT | « distance orthodromique » sans explication (B:1067) | – | |
| 9.1.3 | Temps (UTC, heure locale, lever et coucher du soleil) | PARTIEL | ac:104 (« 10 h 30 UTC ») ; heure locale annoncée en cabine | E | Nuit aéronautique absente. |
| 9.1.4 | Directions (vrai, magnétique, compas ; déclinaison, déviation) | ABSENT | – | – | **Manque majeur.** |
| 9.1.5 | Distances (NM, SM, km, ft ; conversions) | PARTIEL | ac:90 | E | |
| 9.1.6 | Magnétisme et compas | ABSENT | – | – | |
| 9.1.7 | Projections (Mercator, Lambert) | ABSENT | – | – | |
| 9.1.8 | Représentation des méridiens, parallèles, orthodromies | ABSENT | – | – | |
| 9.1.9 | Utilisation des cartes aéronautiques | ABSENT | cartes schématiques (dc:155) non utilisées pour des exercices | – | |
| 9.1.10 | Navigation à l'estime : bases (route, cap, dérive, vitesse sol, ETA) | PARTIEL | ac:107 | E | |
| 9.1.11 | Computeur de navigation | ABSENT | – | – | |
| 9.1.12 | Triangle des vitesses | ABSENT | br:172 à 176 calcule les composantes de vent sur la piste, pas le triangle cap/vitesse sol | – | |
| 9.1.13 | Mesure des éléments de l'estime | ABSENT | – | – | |
| 9.1.14 | Navigation en vol (repères visuels, écart de route, révision d'ETA, log) | ABSENT | – | – | |
| 9.2.1 | Propagation radio | ABSENT | – | – | |
| 9.2.2 | Radiogoniométrie au sol (VDF, QDM) | ABSENT | – | – | |
| 9.2.3 | NDB / ADF | ABSENT | seulement des options d'affichage du ND (B:1238) | – | |
| 9.2.4 | VOR | PARTIEL | ac:108 (« donne une direction ») | E | Une phrase. |
| 9.2.5 | DME | PARTIEL | ac:108 (« une distance ») | E | Une phrase. |
| 9.2.6 | Radar au sol | ABSENT | phraséologie radar seulement (pratique) | – | |
| 9.2.7 | Radar secondaire et transpondeur (modes, codes) | PARTIEL | ac:111 ; B:1036 | E+P | |
| 9.2.8 | GNSS | PARTIEL | ac:108 (GPS et FMS) | E | Une phrase ; ni RAIM ni limitations. |

---

## 4. Synthèse des points forts (pour équilibrer)

- **Masse, centrage et carburant** : calculs justes, réutilisés de façon cohérente dans le dossier de vol, le guide et l'examen (B:950 et suivantes, br:179, dc:198 et 219).
- **Systèmes** : description riche et exacte de la cellule, de l'hydraulique, de l'électricité et des commandes de vol (s2:385 à 416), avec un atelier interactif.
- **Analyses d'accidents** (s3:177 à 300) : bonne base pour le TEM et les facteurs humains, chaque cas ayant une version corrigée.
- **Radio pratique** avec vérification du collationnement : rare dans un logiciel pédagogique.
- **Physique** : atmosphère ISA et conversions CAS/TAS exactes (B:269 à 274), portance et traînée cohérentes (B:482 et suivantes).

---

## 5. Erreurs factuelles relevées

Bases de vérification : **[S]** source consultée en ligne (liste en §8) ; **[C]** calcul ou loi physique ; **[NV]** non vérifiable sans source primaire accessible.

### 5.1 FAUX (3)

| # | Emplacement | Affirmation du simulateur | Correction | Source |
|---|---|---|---|---|
| F1 | B:1087 (étape Montée, A320) | « Au niveau de transition : calage altimétrique standard 1013 hPa » (en montée) | En montée, on affiche 1013 hPa en passant l'**altitude de transition**. Le **niveau de transition** sert en descente, pour repasser au QNH. Le reste du simulateur dit juste (ac:103, br:140, br:142, B:1718) : l'étape est incohérente avec le cours. Gravité : conceptuelle, c'est une question d'examen classique. | [S] AIP Belgique ENR 1.7 |
| F2 | B:1068 et `WB.*.stdPax` (B:936 à 945) | « Masses standard passagers EASA : 84 kg par adulte », appliqué aussi au Learjet 60 (8 sièges), au S-76 et au H125 | Pour 19 sièges ou moins, les masses forfaitaires EASA sont 104/86 kg (1 à 5 sièges), 96/78 kg (6 à 9) et 92/74 kg (10 à 19), bagage à main compris, hommes/femmes. Utiliser 84 kg **sous-estime la masse** de 8 à 20 kg par passager. C'est une erreur de sécurité en masse et centrage. | [S] tables de masses forfaitaires (NCC.POL.105, identiques à CAT.POL.MASS.10) |
| F3 | s2:349 (atelier R44) | Poignée des gaz : « câble vers le papillon du carburateur » | Le R44 **Raven II** modélisé a un moteur IO-540 **à injection** : il n'a pas de carburateur. Le cours ca8 le dit lui-même (s2:414). Gravité faible, mais l'incohérence interne embrouille la notion de givrage carburateur. | [S] POH R44 II ; s2:414 |

### 5.2 SIMPLIFIÉ (6), acceptables s'ils sont signalés

| # | Emplacement | Affirmation | Ce qu'il faut préciser | Source |
|---|---|---|---|---|
| S1 | ac:87 | « Traînée : la résistance de l'air, qui augmente avec la vitesse » | Seule la traînée parasite augmente avec V². La traînée induite diminue avec la vitesse, d'où la courbe en U et la vitesse de finesse maximale. Cette notion est fondamentale au PPL. | [C] |
| S2 | B:1706 (QCM) | « 84 kg… avion de 20 sièges ou plus » | 84 kg (« tous adultes ») vaut pour **30 sièges ou plus**. De 20 à 29 sièges : 88 kg homme / 70 kg femme. | [S] tables de masses forfaitaires |
| S3 | br:198 | « VAPP = VLS + 5 kt (+ ⅓ du vent de face, + rafales, max +15 kt) » | Méthode Airbus : VAPP = VLS + max(5 kt ; ⅓ du vent de face établi), plafonnée à VLS + 15. Les rafales sont gérées par la fonction « ground speed mini », pas ajoutées à VAPP. | [S] Petitt (blog de pilote) |
| S4 | s3:266 | Anneau tourbillonnaire : « descente supérieure à environ 300 ft/min sous 30 nœuds » | Selon le Helicopter Flying Handbook (FAA) : vitesse inférieure à la portance de translation (environ 10 à 15 kt), vario de 300 ft/min ou plus, puissance d'au moins 20 %. Le seuil de 30 kt est trop large (prudent, donc non dangereux). | [S] AOPA, d'après le Helicopter Flying Handbook |
| S5 | B:1108, br:135 | R44 : « mélange riche, contact sur START… puis BOTH » | POH R44 II : mélange tiré sur OFF pendant le lancement, puis poussé plein riche quand le moteur part. La procédure simplifiée risque de noyer le moteur. | [S] POH R44 II, section 4 |
| S6 | br:184 ; `WB.h125/r44/s76.res30` | Réserve finale de 30 min appliquée aux hélicoptères | En VFR hélicoptère (NCO), la réserve finale est de 20 min à la vitesse de meilleur rayon d'action. 30 min est prudent mais présenté comme la règle. Il faut aussi enseigner les réserves VFR avion : 30 min de jour, 45 min de nuit. | [S] AMC1 NCO.OP.125(b) |

### 5.3 Affirmations vérifiées exactes (36)

| # | Emplacement | Affirmation | Base |
|---|---|---|---|
| E1 | ac:87 | Portance = ½ ρ V² S Cz | [C] |
| E2 | ac:91 | Vitesse doublée → portance ×4 | [C] |
| E3 | ac:90 | 1 kt = 1 NM (1 852 m) par heure ; 1 000 ft ≈ 305 m | [C] |
| E4 | ac:106 | Le METAR donne la direction d'où vient le vent | [S] learn-atc |
| E5 | ac:104 | Décodage METAR (9999 = 10 km ou plus, FEW030, 08/03, Q1021) | [S] learn-atc |
| E6 | ac:106 | Avec le QNH affiché, au sol l'altimètre indique l'altitude du terrain | [S] learn-atc |
| E7 | ac:103, br:140, B:1718 | Au-dessus de l'altitude de transition, calage 1013 hPa | [S] AIP ENR 1.7 |
| E8 | br:142 | On recale le QNH au niveau de transition en descente | [S] AIP ENR 1.7 |
| E9 | ac:111 | 7700 urgence, 7600 panne radio, 7500 intervention illicite | [S] code7700 (OACI Doc 8168) |
| E10 | br:198, B:1716 | Plan à 3° ≈ 318 ft/NM ; environ 950 ft à 3 NM | [C] |
| E11 | B:1717 | Vario ≈ vitesse sol × 5 sur un plan à 3° | [C] |
| E12 | B:1715, ac:129 | Règle des 3 pour le point de début de descente | [C] |
| E13 | B:1721 | Feux de bord de voie de circulation bleus, feux d'axe verts | [S] Wikipédia Taxiway |
| E14 | B:1722 | Panneau jaune à lettres noires = direction | [S] idem |
| E15 | B:1723 | Panneau rouge à inscription blanche = obligation (point d'attente) | [S] idem |
| E16 | B:1724 | Marquage de point d'attente : lignes continues côté attente, à ne pas franchir sans autorisation | [S] idem |
| E17 | B:1711 | Réserve finale d'un avion à turbine : 30 min à 1 500 ft | [S] rotatepilot |
| E18 | B:1068 | Bagage de soute forfaitaire : 15 kg en intercontinental | [S] tables de masses forfaitaires |
| E19 | ac:152 | PPL(A) : 45 h dont 25 h en double commande, 10 h en solo, navigation de 270 km avec 2 atterrissages | [S] fiche de référence DGAC |
| E20 | ac:152 | LAPL(A) : 30 h dont 15 h en double commande, 6 h en solo, navigation de 150 km | [S] idem |
| E21 | ac:152 | 16 ans pour le premier solo, 17 ans pour la licence | [S] idem |
| E22 | ac:155 | Classe 2 valable 5 ans avant 40 ans, 2 ans de 40 à 50 ans, 1 an après 50 ans | [S] MED.A.045 |
| E23 | ac:155 | Classe 1 renouvelée chaque année | [S] MED.A.045 (cas à 6 mois omis) |
| E24 | ac:157 | DGAC : 9 épreuves depuis le 4 décembre 2023, 75 % requis dans chacune | [S] aerovfr |
| E25 | ac:157 | Réussite valable 24 mois pour passer le test en vol | [S] fiche de référence DGAC |
| E26 | gd:27 | Temps de conscience utile au FL350 : 30 s à 1 min | [S] FAA AC 61-107A |
| E27 | B:1749 | R44 : pales en rotation en moins de 5 s après embrayage | [S] POH R44 II |
| E28 | B:1750 | R44 : pression d'huile de 25 psi en 30 s | [S] POH R44 II |
| E29 | B:1751 | R44 : 101 à 102 % au décollage, chauffe à 60–70 % | [S] POH R44 II |
| E30 | s3:266 et 268 | Sortie d'anneau tourbillonnaire par le cyclique (méthode Vuichard ou prise de vitesse) | [S] AOPA |
| E31 | s2:401 | PTU de l'A320 actif au-delà de 500 psi d'écart | [S] FlyByWire (secondaire) |
| E32 | s2:400 | Sources hydrauliques de l'A320 : vert = moteur 1 ; bleu = pompe électrique + RAT ; jaune = moteur 2 + pompe électrique | [S] FlyByWire (secondaire) |
| E33 | s2:396 | Allumage automatique vers 16 % de N2 | [S] a320.netlify (secondaire) |
| E34 | B:1732 | Inclinaison maximale de 67° en loi normale | [S] FlyByWire (secondaire) |
| E35 | B:1731 | Manche lâché à 25° : l'inclinaison est conservée | [S] FlyByWire (stabilité jusqu'à 33°) |
| E36 | B:269 | ISA : 288,15 K, −6,5 K/km, 216,65 K au-dessus de 11 km | [C] (constantes OACI) |

### 5.4 NON VÉRIFIABLE (10) : à confirmer par un instructeur ou une documentation constructeur

| # | Emplacement | Affirmation | Motif |
|---|---|---|---|
| N1 | s2:396 | Carburant injecté à 22 % de N2, démarreur coupé à 50 % (CFM56-5B) | Les sources secondaires divergent (20 % et 55 %) ; FCOM non accessible. |
| N2 | B:1737 | MMO de l'A320 = 0,82 | Fiche de certification (TCDS) non consultée. |
| N3 | gd:27, B:1461 | Alarme CAB PR EXCESS à 9 550 ft ; masques à 14 000 ft cabine | FCOM non accessible. |
| N4 | B:938 à 939 | Masses du Learjet 60 (MTOW 10 660 kg, MLW 8 845 kg, MZFW 7 257 kg) | Fiche de certification FAA non consultée. |
| N5 | ac:152 | LAPL : 2 t au plus, 3 passagers au plus | FCL.105.A non consulté. |
| N6 | ac:157 | 18 mois pour réussir toutes les épreuves | FCL.025 non consulté (seule la validité de 24 mois a été confirmée). |
| N7 | B:2062 | Contenu du message MAYDAY (pas de position ni de cap) | Probablement SIMPLIFIÉ (Annexe 10, volume II) ; texte non consulté. |
| N8 | dc:136 | Couloir de l'Hudson : 1 300 ft MSL, 123,05 MHz | Carte FAA non consultée (document marqué « exemple »). |
| N9 | dc:190 | LFPG : « altitude de transition 5 000 ft (niveau 70) » | eAIP France non consultée ; le niveau de transition dépend du QNH. |
| N10 | dc:172 | SIGWX haute altitude FL250–630 | Documentation WAFS non consultée. |

---

## 6. Plan de comblement priorisé (les 15 manques les plus importants)

Effort estimé pour un binôme développeur et instructeur : **S** = 2 jours au plus, **M** = 3 à 7 jours, **L** = 2 à 4 semaines, **XL** = plus d'un mois.

| Prio. | Manque (sous-sujets) | Contenu concret à ajouter | Exercice, QCM ou étape suggérés | Effort |
|---|---|---|---|---|
| 1 | Règles de l'air et VFR (1.5.1, 1.5.2, 1.7.2) | Minimums VMC par classe d'espace (SERA.5001), vol au-dessus/au-dessous du FL100, hauteurs minimales (SERA.5005), priorités (SERA.3210), classes A à G, CTR, TMA, RMZ, TMZ, zones P/R/D, SIV | Carte d'espaces aériens interactive (« puis-je entrer ici en VFR ? ») ; 30 QCM | L |
| 2 | Avion école monomoteur à pistons (8.1.19 à 8.1.24, 5.5, 7.2.x) | Modèle SEP : hélice à pas fixe, carburateur et réchauffage, mélange, magnétos, AVGAS 100LL / UL91, instruments classiques, devis en kg et m | Parcours PPL complet : visite prévol, mise en route, essais moteur, tour de piste | XL |
| 3 | Navigation VFR à l'estime (9.1.2, 9.1.4, 9.1.6 à 9.1.14) | Nord vrai, magnétique et compas (déclinaison, déviation), carte au 1/500 000 (échelle, symboles), triangle des vitesses (facteur de base, dérive maximale), règle du 1 sur 60, révision d'ETA, log de navigation | Mission « navigation » : préparer le log, puis voler avec contrôle des points tournants ; exercices de computeur | XL |
| 4 | Météorologie théorique (3.1.1, 3.1.2, 3.1.5, 3.2.2 à 3.2.7, 3.3, 3.4.1, 3.4.4, 3.6, 3.7) | ISA (15 °C, 1013,25 hPa, −2 °C/1 000 ft), stabilité adiabatique, humidité et écart température/point de rosée, types de brouillard, masses d'air, fronts (coupes et temps associé), anticyclones et dépressions, Buys-Ballot, brises, foehn | Schémas animés ; 40 QCM ; « lire la situation » sur une carte isobarique | L |
| 5 | Dangers météo pour l'aviation légère (3.9.1, 3.9.2, 3.9.4 à 3.9.9) | Types de givrage et **givrage carburateur** (abaque température/humidité), cycle de vie d'un orage, rafales descendantes, turbulence (mécanique, thermique, onde), dangers en montagne | Scénario « givrage carburateur en descente » sur le SEP | M |
| 6 | Performance humaine (2.2 à 2.5, 2.9, 2.10) | Hypoxie et hyperventilation (symptômes, oxygène au-delà de 10 000 / 13 000 ft), monoxyde de carbone, vision de nuit et veille extérieure, illusions vestibulaires et visuelles (désorientation, illusions d'approche), sommeil et fatigue, alcool et médicaments (règles Part-MED à vérifier), plongée, stress, 5 attitudes dangereuses, IMSAFE | Module illustré ; 30 QCM ; scénario « VFR dans les nuages » de désorientation, avec version corrigée | L |
| 7 | Principes du vol (5.1.8 à 5.1.11, 5.4.2, 5.7) | Courbe de traînée (parasite et induite), finesse et plané, facteurs de la vitesse de décrochage (VS√n, masse, centrage, volets), vrille (prévention et sortie), facteur de charge en virage n = 1/cos φ, domaine de vol, VA, stabilité latérale et de route. **Corriger S1.** | Visualisation de la courbe Cx/Cz, calculateur de virage, 25 QCM | M |
| 8 | Radio VFR (4.1.4, 4.2.3 à 4.2.5, 4.4, 4.5, 4.7) | Phraséologie VFR française et anglaise (arrivée et départ d'un terrain contrôlé, auto-information), priorité des messages, expressions conventionnelles, échelle de lisibilité, panne radio VFR, message MAYDAY complet, 121,5 MHz, portée VHF ≈ 1,23 √h NM | Exercice de transit SIV et d'entrée en CTR, avec reconnaissance vocale ou choix multiples | M |
| 9 | Performances d'un monomoteur (7.2.1 à 7.2.4) | TODA, TORA, ASDA, LDA ; effets de l'altitude-pression, de la température, de l'altitude-densité, de la pente, de l'herbe mouillée et du vent ; lecture d'abaques ; coefficients de sécurité ; Vx/Vy ; distance franchissable et autonomie | 10 exercices d'abaques corrigés | M |
| 10 | Instruments de bord classiques (8.2.2 à 8.2.7) | Pitot et statique (blocages et effets), anémomètre (IAS/CAS/TAS, arcs de couleur), erreurs altimétriques, retard du variomètre, gyroscope (rigidité, précession), erreurs du compas (virage, accélération) | Pannes « prise statique bouchée » et « Pitot bouché » sur le SEP ; 20 QCM | M |
| 11 | Corrections FAUX et SIMPLIFIÉ | F1 (B:1087 : « altitude de transition »), F2 (masses forfaitaires par nombre de sièges), F3 (s2:349 : « servo d'injection »), S1 à S6 | Test de non-régression sur les textes | S |
| 12 | Altimétrie complète (1.6.1, 3.1.6) | QFE, QNH, QNE, altitude et niveau de transition, couche de transition, environ 28 ft/hPa, erreurs de température, « du chaud vers le froid, attention en dessous » | 5 calculs altimétriques corrigés | S |
| 13 | Procédures opérationnelles (6.1.2, 6.4, 6.5, 6.6) | Turbulence de sillage (catégories, délais, évitement), moindre bruit, atterrissage forcé d'un monomoteur (choix du champ, vent, check-list), pistes contaminées (aquaplanage) | Scénario « panne moteur en campagne » sur le SEP | M |
| 14 | Réglementation licences et documents (1.1, 1.2, 1.3, 1.4, 1.12) | Privilèges PPL/LAPL, expérience récente pour emporter des passagers, prorogation de la qualification SEP, documents de bord (certificat d'immatriculation, certificat de navigabilité, ARC, licence de station radio, assurance), définitions de l'Annexe 13, compte rendu d'événements | Check-list « documents de bord » à l'étape préparation ; 20 QCM | M |
| 15 | Radionavigation (9.2.1 à 9.2.8) | VOR (radiales, CDI, TO/FROM), ADF/NDB, DME (distance oblique), VDF et QDM, modes A/C/S, GNSS (RAIM, limitations, l'utilisation en VFR ne dispense pas de la navigation à l'estime) | Exercices d'interception de radiale ; 20 QCM | M |

**Transversal** : refondre la banque de QCM en **9 épreuves calquées sur l'examen DGAC** (droit aérien 20, météorologie 20, navigation 20, communications 8, autres matières 12 chacune ; source : aerovfr). Il faut aussi un tableau de bord de progression par matière, et une relecture par un FI/TKI avant toute publication.

---

## 7. Échantillon recommandé pour la relecture par un instructeur (25 points, environ 10 % des 252 sous-sujets, plus toutes les erreurs)

**Priorité 1, erreurs et simplifications** : F1, F2, F3, S1 à S6, N1 à N10.

**Priorité 2, verdicts incertains** :

| # | Point | Verdict de l'audit | Question à l'instructeur |
|---|---|---|---|
| 1 | 1.5.2 Règles VFR | ABSENT | Une phrase sans valeur numérique suffit-elle à mériter PARTIEL ? |
| 2 | 1.6.1 Calage altimétrique | PARTIEL | Le passer en COUVERT une fois F1 corrigée ? |
| 3 | 1.9.3 Aides visuelles | PARTIEL | Les 5 QCM suffisent-ils ? |
| 4 | 1.11.1 Sûreté | PARTIEL | Verdict généreux, à confirmer. |
| 5 | 2.3.4 Désorientation | ABSENT | Un seul mot dans une liste. |
| 6 | 2.8.1 Gestion du poste | PARTIEL | Ou COUVERT ? |
| 7 | 3.4.3 Brouillard | PARTIEL | Une ligne de tableau plus des codes METAR. |
| 8 | 3.10.3 Messages météo | PARTIEL | METAR bien traité, TAF faible. |
| 9 | 4.2.9 Collationnement | COUVERT | Contexte IFR en anglais seulement. |
| 10 | 4.4 Panne de communications | PARTIEL | Seul le code 7600 est donné. |
| 11 | 5.1.9 Traînée | ABSENT | Choix de ne pas créditer une phrase trompeuse. |
| 12 | 5.3.1 Commandes | COUVERT | |
| 13 | 6.1.3 Incursions de piste | COUVERT | |
| 14 | 6.5 Atterrissages d'urgence | PARTIEL | Hélicoptère et amerrissage A320 seulement. |
| 15 | 7.1.1 à 7.1.3 et 7.1.6 Masse et centrage | COUVERT | Contexte avion de ligne : transposable au PPL ? |
| 16 | 7.3.2 Préparation | PARTIEL | |
| 17 | 8.1.11 Antigivrage | PARTIEL | |
| 18 | 8.2.10 Systèmes d'alarme | COUVERT | |
| 19 | 9.1.3 Temps | PARTIEL | Ou ABSENT ? |
| 20 | 9.2.6 Radar au sol | ABSENT | La pratique radar en vol devrait-elle compter PARTIEL ? |
| 21 | 2.6.2 Genèse de l'erreur | PARTIEL | Cas pratiques sans théorie. |
| 22 | 3.9.1 Givrage | PARTIEL | |
| 23 | 6.2 Feu ou fumée | PARTIEL | Procédures d'avion de ligne seulement. |
| 24 | 8.1.22 Allumage, mélange… | PARTIEL | |
| 25 | 9.1.12 Triangle des vitesses | ABSENT | Le calcul de vent sur la piste ne compte pas. |

Contrôle complémentaire recommandé : pour 10 verdicts ABSENT tirés au hasard, chercher sous d'autres libellés pour détecter d'éventuels faux négatifs de la recherche par mots-clés.

---

## 8. Sources

Référentiel :
- EASA, Easy Access Rules for Aircrew, AMC1 FCL.210; FCL.215 (syllabus PPL(A)/PPL(H)) : https://www.easa.europa.eu/en/document-library/easy-access-rules/online-publications/easy-access-rules-aircrew-regulation-eu-no?page=9
- EASA, AMC & GM to Part-FCL, révision de juin 2016, version 03 (table des matières seulement) : https://www.easa.europa.eu/ga/downloads/21001/en
- Honourable Company of Air Pilots, PPL(A) Training Programme, AltMoC, version 1 (2019) : https://www.airpilots.org/file/4f9e99a120e95165db8c5497a36004e3/pplprogrammev1.pdf

Vérification des affirmations :
- EASA, MED.A.045 (validité des certificats médicaux) : https://www.easa.europa.eu/document-library/easy-access-rules/online-publications/easy-access-rules-aircrew-regulation-eu-no?page=52
- DGAC / ministère, *Licensing requirements – quick reference*, révision 2 (2015) : https://www.ecologie.gouv.fr/sites/default/files/documents/Licensing_requirements_-_quick_reference-rev2-May-2015.pdf
- UK CAA, Private Pilot Licence for aeroplanes : https://caa.co.uk/general-aviation/pilot-licences/aeroplanes/private-pilot-licence-for-aeroplanes
- RotatePilot, guide EASA PPL : https://rotatepilot.com/guides/easa/ppl
- Aerovfr, passage à 9 modules de l'examen PPL/LAPL : https://aerovfr.com/2023/10/de-la-pratique-de-lexamen-theorique
- Tables de masses forfaitaires (Règlement 965/2012, annexe VI, NCC.POL.105) : https://legislation.gov.uk/eur/2012/965/annex/VI/division/subpart+c/2022-12-23
- AMC1 NCO.OP.125(b), réserves de carburant VFR : https://regulatorylibrary.caa.co.uk/965-2012/Content/Document%20Structure/07%20NCO/3%20AMC/AMC1%20NCO%20OP%20125%20b%20Fuel%20energy.htm
- RotatePilot, réserve finale d'un avion à turbine : https://rotatepilot.com/questions/flight-planning/803
- Temps de conscience utile (d'après FAA AC 61-107A) : https://en.wikipedia.org/wiki/Time_of_useful_consciousness
- skeyes, AIP Belgique ENR 1.7 (calage altimétrique) : https://ops.skeyes.be/html/belgocontrol_static/eaip/eAIP_Main/html/eAIP/EB-ENR-1.7-en-GB.html
- K. Petitt, calcul de VAPP sur Airbus (secondaire) : https://karlenepetitt.blogspot.com/2012/09/how-does-airbus-calculate-vapp.html
- Robinson, POH R44 II, section 4 : https://robinsonheli.com/wp-content/uploads/2022/01/r44ii_poh_4.pdf
- AOPA, anneau tourbillonnaire et méthode Vuichard (d'après le Helicopter Flying Handbook de la FAA) : https://www.aopa.org/news-and-media/all-news/2020/february/pilot/technique-escape-plan
- FlyByWire, hydraulique A320 (secondaire) : https://docs.flybywiresim.com/pilots-corner/a32nx/a32nx-briefing/flight-deck/ovhd/hyd/
- FlyByWire, protections en loi normale (secondaire) : https://docs.flybywiresim.com/pilots-corner/a32nx/a32nx-advanced-guides/protections/overview/
- A320 Engines DSC-70 (secondaire) : https://a320.netlify.app/systems/engines
- Wikipédia, Taxiway (feux, panneaux, marquages) : https://en.wikipedia.org/wiki/Taxiway
- code7700, codes transpondeur (avec renvois OACI Doc 4444 et Doc 8168) : https://code7700.com/transponder.htm
- learn-atc, lecture du METAR : https://www.learn-atc.com/blog/how-to-read-metar
