#!/usr/bin/env python3
"""Génère src/addons/qcm30.js (F10 suite) : chaque thème de QCM porté à au moins 30 questions, de difficulté croissante, avec corrigé.
Les questions calculées (masse et centrage, carburant, navigation) ont leur réponse CALCULÉE ici ; les autres reprennent des notions établies
(OACI annexe 14 pour le balisage, EASA SERA / Part-CAT / Part-NCO, manuels FAA publics, documents constructeurs publics).
Usage : python3 tools/gen_qcm30.py src/addons/qcm30.js"""
import json, math, sys
OUT = sys.argv[1]
def fr(x, nd=0):
    s = f"{x:,.{nd}f}".replace(',', ' ').replace('.', ',').replace('-', '−'); return s
rot = [1]
def Q(q, good, bad, why):
    bad = [b for b in bad if b != good][:3]; k = rot[0] % 4; rot[0] += 3
    o = bad[:k] + [good] + bad[k:]; assert len(set(o)) == 4, (q, o)
    return [q, o, k, why]
ADD = {}
def add(theme, *qs): ADD.setdefault(theme, []).extend(qs)

# ===================== PROCÉDURES (avion de ligne) =====================
add('proc',
 Q('Rôle du pilote aux commandes (PF) :', 'Il pilote la trajectoire (manuellement ou par le pilote automatique)', ['Il gère seulement la radio', 'Il ne fait que surveiller', 'Il remplit les documents'], 'Le PF pilote, le PM (pilot monitoring) surveille, gère la radio et lit les check-lists.'),
 Q('Rôle du pilote qui surveille (PM) :', 'Surveiller la trajectoire, la radio, les check-lists et annoncer les écarts', ['Piloter', 'Dormir en croisière', 'Gérer seulement la cabine'], 'La surveillance active est une tâche à part entière.'),
 Q('« Cockpit stérile » (sous 10 000 ft environ et au sol) signifie :', 'Aucune conversation ni tâche non liée au vol', ['Le poste est désinfecté', 'La porte est ouverte', 'La radio est coupée'], 'Règle reprise par les exploitants : limiter les distractions dans les phases critiques.'),
 Q('Annonce du PM au décollage quand la vitesse atteint VR :', '« Rotate »', ['« Gear up »', '« V2 »', '« Flaps »'], 'Annonces usuelles : « 100 knots », « V1 », « Rotate ».'),
 Q('Après le décollage, le train est rentré quand :', 'Le variomètre et l\'altimètre montrent une montée positive', ['À V1', 'Au sol', 'À 10 000 ft'], '« Positive climb » (ou « positive rate »), « gear up ».'),
 Q('Panne moteur avant V1 sur un avion de ligne :', 'Interruption du décollage', ['Décollage poursuivi', 'Rotation immédiate', 'Moteur redémarré'], 'Avant V1, la piste restante permet de s\'arrêter.'),
 Q('Panne moteur après V1 :', 'Décollage poursuivi, puis procédure en vol', ['Freinage maximal', 'Inverseurs', 'Retour au parking'], 'Après V1, s\'arrêter ferait sortir de piste.'),
 Q('Un briefing de départ contient notamment :', 'La SID, les altitudes, les vitesses, la conduite en cas de panne au décollage', ['Le menu des repas', 'La météo de destination seulement', 'La liste des passagers'], 'Le briefing prépare les décisions avant d\'en avoir besoin.'),
 Q('Que signifie « portes armées » (toboggans armés) ?', 'Le toboggan se déploie automatiquement si la porte est ouverte', ['La porte est verrouillée', 'Le toboggan est démonté', 'La porte ne s\'ouvre plus'], 'Armement avant le roulage, désarmement au parking (« cross-check »).'),
 Q('Une approche est dite stabilisée quand, au plus tard au point de contrôle :', 'L\'avion est configuré, sur la trajectoire, à la bonne vitesse et au bon taux', ['Le train est sorti seulement', 'La piste est en vue', 'Le pilote automatique est engagé'], 'Critères de l\'exploitant (souvent 1 000 ft IMC, 500 ft VMC) ; sinon remise de gaz.'),
 Q('Aux minimums d\'une approche, sans les références visuelles requises :', 'Remise de gaz', ['On continue jusqu\'à 50 ft', 'On attend de voir la piste', 'On tourne en palier'], 'La DA/DH n\'est pas une invitation à descendre plus bas.'),
 Q('Une check-list de secours qui se fait de mémoire s\'appelle :', 'Des actions mémorisées (memory items)', ['Une check-list normale', 'Un briefing', 'Une MEL'], 'Elles sont ensuite vérifiées avec la check-list écrite.'),
 Q('Le carburant consommé est vérifié en croisière :', 'À chaque point de report, comparé au prévu (OFP)', ['Seulement à l\'arrivée', 'Jamais', 'Seulement au décollage'], 'Un écart signale vent, masse, ou fuite.'),
 Q('Avant le dégivrage, l\'équipage doit connaître :', 'Le temps de protection (holdover time) du fluide', ['La couleur du fluide seulement', 'Le nom de l\'agent', 'Rien'], 'Au-delà du temps de protection, nouvelle inspection ou nouveau traitement.'),
 Q('Pourquoi lire les check-lists à voix haute à deux ?', 'Pour que les deux pilotes vérifient chaque point (contrôle croisé)', ['Pour occuper le temps', 'Par politesse', 'Pour le passager'], 'Le contrôle croisé évite les oublis.'),
 Q('« Alignez-vous et attendez » (line up and wait) autorise :', 'À s\'aligner sur la piste, sans décoller', ['À décoller', 'À traverser la piste', 'À rouler au parking'], 'Le décollage demande une autorisation séparée.'),
 Q('Une remise de gaz commence par :', 'Poussée de remise de gaz, assiette de montée, puis configuration', ['Rentrer le train d\'abord', 'Sortir les volets', 'Couper le pilote automatique et attendre'], 'La trajectoire d\'abord : « Go around, flaps ».'),
 Q('MEL signifie :', 'Liste minimale d\'équipements : ce qui peut manquer pour partir, et à quelles conditions', ['Liste des repas', 'Manuel d\'entretien', 'Liste des passagers'], 'Elle est tirée de la MMEL du constructeur, approuvée par l\'autorité.'),
 Q('Avant de partir avec un équipement en panne autorisé par la MEL, on vérifie :', 'Les conditions (O) opérationnelles et (M) d\'entretien, et l\'entrée au compte rendu matériel', ['Rien', 'Seulement la météo', 'L\'avis des passagers'], 'Un report MEL a des procédures et une durée limitée.'),
 Q('« TCAS RA : CLIMB » alors que le contrôle demande de descendre :', 'Suivre l\'avis du TCAS, puis informer le contrôle', ['Suivre le contrôle', 'Ne rien faire', 'Couper le TCAS'], 'Règle OACI : l\'avis de résolution prime sur la clairance.'),
 Q('Feu moteur au sol pendant le roulage : priorité ?', 'Arrêter l\'avion, appliquer la procédure, préparer l\'évacuation si nécessaire', ['Accélérer vers le parking', 'Décoller', 'Attendre les pompiers sans rien faire'], 'Arrêt, actions feu, information du contrôle et de la cabine.'),
 Q('Annonce « minimum fuel » au contrôle :', 'Toute attente supplémentaire ferait atterrir avec moins que la réserve prévue', ['Le carburant est épuisé', 'On veut aller plus vite', 'Il reste 30 min de carburant exactement'], 'CAT.OP.MPA.281 ; c\'est une information, pas une urgence.'),
 Q('Annonce « MAYDAY, MAYDAY, MAYDAY, FUEL » :', 'Le carburant prévu à l\'atterrissage sera inférieur à la réserve finale', ['Le carburant est au minimum de dégagement', 'Une fuite mineure', 'Le plein est à refaire'], 'C\'est une situation de détresse.'))

# ===================== MASSE ET CENTRAGE (calculés) =====================
def mz(dow, pax, mp, bag, cargo): return dow + pax*mp + bag + cargo
add('wb',
 Q('La DOW (masse de base en opération) comprend :', 'L\'avion vide équipé, l\'équipage et l\'armement commercial', ['Le carburant', 'Les passagers', 'Le fret'], 'Elle ne comprend ni charge marchande ni carburant utilisable.'),
 Q('La charge marchande (traffic load) comprend :', 'Passagers, bagages, fret et poste', ['Le carburant', 'L\'équipage', 'L\'eau potable seulement'], 'C\'est ce qui rapporte.'),
 Q('MZFW limite :', 'La masse sans carburant, pour protéger la structure de l\'emplanture des ailes', ['La masse au roulage', 'La masse à l\'atterrissage', 'Le carburant'], 'Le carburant dans les ailes soulage la flexion ; sans lui, la charge est limitée.'),
 Q('MLW limite :', 'La masse à l\'atterrissage (train, structure)', ['La masse au décollage', 'La charge marchande', 'La vitesse'], 'Au-delà : atterrissage en surcharge, inspection.'),
 Q(f'DOW 40 500 kg, 168 passagers à 84 kg, bagages 2 520 kg, fret 800 kg. ZFW ?', fr(mz(40500,168,84,2520,800))+' kg', [fr(mz(40500,168,75,2520,800))+' kg', fr(40500+168*84)+' kg', fr(mz(40500,168,84,2520,800)+800)+' kg'], f'168 × 84 = 14 112 ; ZFW = {fr(mz(40500,168,84,2520,800))} kg.'),
 Q('Masse forfaitaire EASA d\'un enfant (2 à 12 ans), bagage à main compris, à partir de 30 sièges :', '35 kg', ['84 kg', '15 kg', '50 kg'], 'CAT.POL.MAB.100 : 84 kg adulte, 35 kg enfant ; nourrisson sans siège : 0.'),
 Q('Masses EASA des bagages de soute (tableau type) pour un vol long-courrier intercontinental :', '15 kg', ['5 kg', '30 kg', '84 kg'], 'Valeurs forfaitaires : 11 kg (domestique), 13 kg (UE / régional), 15 kg (intercontinental) [selon le tableau en vigueur].'),
 Q('ZFW 61 300, carburant au décollage 11 200. TOW ?', fr(61300+11200)+' kg', [fr(61300+11200-200)+' kg', fr(61300)+' kg', fr(61300-11200)+' kg'], '61 300 + 11 200 = 72 500 kg.'),
 Q('TOW 72 500, étape 8 600. LW ?', fr(72500-8600)+' kg', [fr(72500+8600)+' kg', '72 500 kg', fr(72500-11200)+' kg'], '72 500 − 8 600 = 63 900 kg.'),
 Q('MTOW 77 000, MZFW 64 500, MLW 66 000 ; TOF 11 200, étape 8 600. TOW permise ?', fr(min(77000,64500+11200,66000+8600))+' kg', ['77 000 kg', fr(64500+11200)+' kg', fr(66000+11200)+' kg'], f'min(77 000 ; 75 700 ; 74 600) = {fr(min(77000,64500+11200,66000+8600))} kg : la MLW limite.'),
 Q('Même vol : TOW réelle 72 500. Charge offerte restante ?', fr(min(77000,64500+11200,66000+8600)-72500)+' kg', ['4 500 kg', '0 kg', '3 200 kg'], f'{fr(min(77000,64500+11200,66000+8600))} − 72 500 = {fr(min(77000,64500+11200,66000+8600)-72500)} kg (et ZFW 61 300 ≤ 64 500 ✓).'),
 Q('Moment d\'une masse de 2 000 kg à 25 m de la référence :', '50 000 kg·m', ['80 kg·m', '2 025 kg·m', '12,5 kg·m'], '2 000 × 25 = 50 000 kg·m.'),
 Q('Masses : 50 000 kg à 20 m, 5 000 kg à 30 m, 10 000 kg à 18 m. CG ?', fr((50000*20+5000*30+10000*18)/65000,2)+' m', ['21,50 m', '20,00 m', fr((20+30+18)/3,2)+' m'], f'Moments 1 000 000 + 150 000 + 180 000 = 1 330 000 ; / 65 000 = {fr((50000*20+5000*30+10000*18)/65000,2)} m.'),
 Q('CG 20,46 m, LEMAC 19,2 m, MAC 4,3 m. %MAC ?', fr((20.46-19.2)/4.3*100,1)+' %', [fr(20.46/4.3*100,1)+' %', '12,6 %', '46,0 %'], f'(20,46 − 19,2) / 4,3 × 100 = {fr((20.46-19.2)/4.3*100,1)} %.'),
 Q('On charge 600 kg de plus en soute arrière (bras 30 m) sur un avion de 65 000 kg centré à 20,46 m. Nouveau CG ?', fr((65000*20.46+600*30)/65600,2)+' m', ['20,46 m', fr(20.46+600*30/65000/10,2)+' m', '30,00 m'], f'(65 000 × 20,46 + 600 × 30) / 65 600 = {fr((65000*20.46+600*30)/65600,2)} m.'),
 Q('Masse 70 000 kg ; il faut avancer le CG de 12 cm en déplaçant du fret de la soute arrière (31 m) vers l\'avant (13 m). Masse à déplacer ?', fr(0.12*70000/18)+' kg', [fr(0.12*70000/31)+' kg', '840 kg', fr(0.12*70000/13)+' kg'], f'm = 0,12 × 70 000 / (31 − 13) = {fr(0.12*70000/18)} kg.'),
 Q('Pourquoi la position du CG change-t-elle le trim de décollage ?', 'Le plan horizontal doit équilibrer le moment du poids autour du CG', ['Le trim dépend seulement de la vitesse', 'Il n\'a pas de lien', 'À cause du vent'], 'CG avant = plus de cabré nécessaire, CG arrière = moins.'),
 Q('Effet d\'un CG trop avant :', 'Rotation plus lourde, vitesse de décrochage et consommation un peu plus élevées', ['Instabilité', 'Aucune', 'Moins de traînée'], 'La queue doit déporter vers le bas : plus de portance à fournir par l\'aile.'),
 Q('Effet d\'un CG au-delà de la limite arrière :', 'Stabilité longitudinale réduite, risque de perte de contrôle', ['Rotation impossible', 'Moins de carburant consommé, sans risque', 'Aucun effet'], 'D\'où la limite arrière certifiée.'),
 Q('La LMC (modification de dernière minute) sert à :', 'Corriger le devis après la clôture sans tout refaire (dans les limites fixées)', ['Changer d\'avion', 'Annuler le vol', 'Ajouter du carburant sans contrôle'], 'Au-delà des limites LMC de l\'exploitant, nouveau devis.'),
 Q('Qui signe le devis de masse et centrage ?', 'L\'agent de chargement et le commandant de bord qui l\'accepte', ['Le passager', 'Le contrôleur aérien', 'Personne'], 'Le commandant reste responsable de l\'acceptation.'),
 Q('Le NOTOC sert à :', 'Informer le commandant des marchandises dangereuses et chargements spéciaux à bord', ['Commander les repas', 'Déclarer les passagers', 'Remplacer le devis'], 'Notification to Captain : nature, quantité, emplacement.'),
 Q('Un avion vide pèse 600 kg (bras 1,00 m), pilote 80 kg (0,95 m), passager 75 kg (0,95 m), carburant 100 kg (1,20 m). CG ?', fr((600*1+80*0.95+75*0.95+100*1.2)/855,3)+' m', ['1,000 m', fr((1+0.95+0.95+1.2)/4,3)+' m', '1,200 m'], f'Moments 600 + 76 + 71,25 + 120 = 867,25 ; / 855 = {fr((600*1+80*0.95+75*0.95+100*1.2)/855,3)} m.'),
 Q('Même avion, le carburant (bras 1,20 m) passe de 100 à 40 kg en vol. Le CG :', 'Avance', ['Recule', 'Ne bouge pas', 'Sort des limites forcément'], 'On retire une masse en arrière du CG : le CG avance.'),
 Q('Surcharge à l\'atterrissage après un retour immédiat sur un avion sans vidange :', 'Atterrissage en surcharge possible en urgence, puis inspection obligatoire', ['Interdit dans tous les cas', 'Sans conséquence', 'On vidange obligatoirement en vol'], 'Le manuel de vol prévoit le cas ; l\'inspection après atterrissage en surcharge est requise.'))

# ===================== CARBURANT =====================
add('fuel',
 Q('Masse volumique typique du JET A-1 à 15 °C :', '≈ 0,80 kg/l', ['≈ 0,72 kg/l', '≈ 1,00 kg/l', '≈ 0,60 kg/l'], 'Entre 0,775 et 0,84 kg/l selon la spécification et la température.'),
 Q('Masse volumique de l\'AVGAS 100LL :', '≈ 0,72 kg/l', ['≈ 0,80 kg/l', '≈ 1,00 kg/l', '≈ 0,90 kg/l'], 'Essence aviation plus légère que le kérosène.'),
 Q('Couleur de l\'AVGAS 100LL :', 'Bleue', ['Rouge', 'Incolore à paille', 'Verte'], 'Le colorant permet d\'identifier le carburant à la purge.'),
 Q('Couleur du JET A-1 :', 'Incolore à jaune paille', ['Bleue', 'Rouge', 'Verte'], 'Le kérosène n\'est pas coloré.'),
 Q('Point de congélation maximal du JET A-1 :', '−47 °C', ['−40 °C', '−20 °C', '−60 °C'], 'JET A (États-Unis) : −40 °C. À surveiller sur les longues croisières froides.'),
 Q('Quand le carburant se réchauffe, sa masse volumique :', 'Diminue : même volume, moins de masse', ['Augmente', 'Ne change pas', 'Double'], 'D\'où l\'importance de convertir avec la masse volumique réelle.'),
 Q(f'Il faut 12 500 kg ; masse volumique 0,782 kg/l. Volume ?', fr(12500/0.782)+' l', [fr(12500*0.782)+' l', '12 500 l', fr(12500/0.8)+' l'], f'12 500 / 0,782 = {fr(12500/0.782)} l.'),
 Q(f'Avitaillé 9 800 l à 0,79 kg/l. Masse ?', fr(9800*0.79)+' kg', [fr(9800/0.79)+' kg', '9 800 kg', fr(9800*0.72)+' kg'], f'9 800 × 0,79 = {fr(9800*0.79)} kg.'),
 Q('Carburant d\'étape : 3 h 20 à 2 450 kg/h. Combien ?', fr((3+20/60)*2450)+' kg', ['7 350 kg', fr(3.2*2450)+' kg', '8 400 kg'], f'3,333 × 2 450 = {fr((3+20/60)*2450)} kg.'),
 Q('Carburant de route 5 % d\'une étape de 8 167 kg :', fr(8167*0.05)+' kg', ['817 kg', '41 kg', '1 633 kg'], f'0,05 × 8 167 = {fr(8167*0.05)} kg.'),
 Q('Réserve finale 30 min, consommation en attente 2 200 kg/h :', '1 100 kg', ['2 200 kg', '660 kg', '1 320 kg'], '2 200 × 0,5 = 1 100 kg.'),
 Q('Roulage 220, étape 8 167, route 408, dégagement 1 650, réserve finale 1 100, supplément 500. Bloc ?', fr(220+8167+408+1650+1100+500)+' kg', [fr(220+8167+408+1650+1100)+' kg', fr(8167+408+1650+1100+500)+' kg', '12 000 kg'], 'Somme des six termes.'),
 Q('Carburant au décollage (TOF) avec ce bloc ?', fr(220+8167+408+1650+1100+500-220)+' kg', [fr(220+8167+408+1650+1100+500)+' kg', fr(8167)+' kg', fr(1650+1100)+' kg'], 'TOF = bloc − roulage.'),
 Q('Le carburant « additionnel » (additional fuel) couvre :', 'Des cas particuliers prévus par la réglementation (par exemple une panne en route loin d\'un terrain)', ['Le roulage', 'Le confort du commandant', 'La réserve finale'], 'À distinguer du supplémentaire (discretionary) décidé par le commandant.'),
 Q('« Tankering » signifie :', 'Emporter plus de carburant que nécessaire pour éviter d\'avitailler à destination', ['Vidanger en vol', 'Refroidir les réservoirs', 'Mélanger AVGAS et JET'], 'Utile si le carburant est cher ou indisponible, mais emporter du poids consomme davantage.'),
 Q('Un déséquilibre carburant entre les ailes :', 'Se corrige avec la procédure de transfert ou d\'intercommunication, après avoir écarté une fuite', ['Se corrige en coupant un moteur', 'N\'a aucune importance', 'Se corrige en virant'], 'Toujours se demander d\'abord : fuite ?'),
 Q('Indice d\'une fuite carburant en croisière :', 'Le carburant restant baisse plus vite que la consommation des moteurs', ['La vitesse augmente', 'Le cap change', 'L\'altitude augmente'], 'Comparer carburant consommé (débitmètres) et carburant restant (jauges).'),
 Q('Vidange de carburant en vol (fuel jettison) :', 'Existe sur certains gros-porteurs pour revenir sous la masse maximale à l\'atterrissage', ['Existe sur tous les avions', 'Est interdite partout', 'Sert à refroidir les moteurs'], 'L\'A320 n\'en a pas ; un long-courrier comme le 777 en est équipé.'),
 Q(f'Il reste 6 400 kg ; consommation 2 300 kg/h ; réserve finale 1 150 kg. Temps de vol encore possible avant d\'entamer la réserve ?', f'{int((6400-1150)/2300)} h {int(round(((6400-1150)/2300)%1*60)):02d}', ['2 h 47', '3 h 00', '1 h 30'], f'(6 400 − 1 150) / 2 300 = {fr((6400-1150)/2300,2)} h.'),
 Q('Le carburant minimum au départ est vérifié par :', 'Le commandant de bord, avant le départ', ['Le contrôleur', 'Le passager', 'Le pompier'], 'Il signe le bilan carburant et le devis.'),
 Q('Le bon d\'avitaillement indique :', 'Le volume livré, la masse volumique (ou la température) et le type de carburant', ['La météo', 'La liste des passagers', 'Le niveau de vol'], 'Il sert au contrôle croisé avec les jauges.'),
 Q('Carburant à bord trop froid (cold soak) au sol, en air humide :', 'Peut provoquer du givre sur l\'extrados au-dessus des réservoirs', ['Augmente la poussée', 'Est sans effet', 'Empêche le démarrage'], 'Inspection et éventuel dégivrage.'),
 Q('Avion léger : consommation 30 l/h, réserve VFR de jour 30 min, vol prévu 1 h 40, roulage 3 l. Carburant minimum ?', fr(30*(1+40/60)+15+3)+' l', ['65 l', '53 l', '83 l'], f'Vol 30 × 1,667 = 50 l + réserve 15 l + roulage 3 l = {fr(30*(1+40/60)+15+3)} l (Part-NCO, de jour ; 45 min de nuit).'),
 Q('Même vol de nuit (réserve 45 min) :', fr(30*(1+40/60)+22.5+3,1)+' l', [fr(30*(1+40/60)+15+3)+' l', '75,0 l', '80,0 l'], f'50 + 22,5 + 3 = {fr(30*(1+40/60)+22.5+3,1)} l.'),
 Q('Pourquoi garder une marge au-delà du minimum réglementaire ?', 'Pour absorber vents plus forts, attente, changement de piste ou dégagement imprévu', ['Ce n\'est jamais utile', 'Pour alourdir l\'avion', 'Pour les passagers seulement'], 'Le minimum est un plancher, pas une cible.'),
 Q('Erreur du « Gimli Glider » (Air Canada 143, 1983) :', 'Le carburant a été calculé en livres au lieu de kilogrammes', ['Un moteur a pris feu', 'Une erreur de route', 'Un oubli du dégivrage'], 'L\'avion est tombé en panne sèche et a plané jusqu\'à Gimli.'),
 Q('On reçoit 2 h d\'attente à destination imprévues : 2 300 kg/h, carburant prévu à l\'atterrissage 4 200 kg (dégagement 1 800 + réserve 1 150 + route 1 250). Peut-on attendre 1 h ?', 'Non : il faut se dérouter avant d\'entamer le carburant de dégagement', ['Oui, 1 h sans problème', 'Oui, 2 h', 'On annule la réserve finale'], 'Disponible pour l\'attente : 4 200 − 1 800 − 1 150 = 1 250 kg, soit environ 33 min.'))
# ===================== NAVIGATION, APPROCHE =====================
add('nav',
 Q('Un radial de VOR est :', 'Une route magnétique qui part de la balise', ['Une route qui va vers la balise', 'Une distance', 'Une fréquence'], 'Radial 090 = route magnétique 090 en s\'éloignant de la station.'),
 Q('Le DME mesure :', 'La distance oblique entre l\'avion et la station', ['La distance au sol exacte', 'Le cap', 'La vitesse vraie'], 'À la verticale de la station, il affiche la hauteur en NM.'),
 Q('Fréquences du localizer ILS :', '108,10 à 111,95 MHz, dixièmes impairs', ['118 à 136 MHz', '190 à 1 750 kHz', '962 à 1 213 MHz'], 'Les dixièmes pairs de 108 à 112 MHz sont des VOR.'),
 Q('Une ADF indique :', 'Le relèvement d\'une balise NDB', ['La distance', 'L\'altitude', 'La vitesse sol'], 'Gisement de la station par rapport à l\'axe de l\'avion.'),
 Q('Le circuit d\'attente standard se fait :', 'En virages à droite, branches d\'1 min jusqu\'au FL140', ['À gauche, 2 min', 'À droite, 3 min', 'En ligne droite'], 'OACI PANS-OPS : 1 min jusqu\'au FL140, 1 min 30 au-dessus.'),
 Q('Entrées dans une attente :', 'Directe, parallèle, décalée (teardrop)', ['Avant, arrière, latérale', 'Haute, basse, moyenne', 'Rapide, lente'], 'Selon le secteur d\'arrivée.'),
 Q('Altitude de transition (TA) :', 'En montée, au-dessus de la TA, on passe au calage 1013', ['En descente, on passe au 1013', 'Elle n\'existe qu\'en France', 'C\'est le niveau de croisière'], 'En descente, on passe au QNH au niveau de transition (TL).'),
 Q('DA (altitude de décision) concerne :', 'Une approche de précision (ILS) ou à guidage vertical', ['Une approche classique sans guidage vertical', 'Le décollage', 'La croisière'], 'Approche classique : MDA (altitude minimale de descente).'),
 Q('Règle du 1 dans 60 : écart de 2 NM après 30 NM parcourus. Erreur de route ?', '4°', ['2°', '15°', '60°'], '2 / 30 × 60 = 4°.'),
 Q('Même écart (2 NM à 30 NM), il reste 40 NM. Correction totale pour rejoindre l\'arrivée ?', fr(4+2/40*60)+'°', ['4°', '3°', '10°'], '4° (annuler l\'erreur) + 2/40 × 60 = 3° (converger) = 7°.'),
 Q('Distance orthodromique (grand cercle) :', 'Le plus court chemin sur la Terre', ['Une route à cap constant', 'Toujours plus longue', 'Une ligne droite sur une carte Mercator'], 'Le cap change le long d\'une orthodromie ; la loxodromie garde un cap constant.'),
 Q('Déclinaison magnétique 3° W, route vraie 120°. Route magnétique ?', '123°', ['117°', '120°', '300°'], '« West is best » : on ajoute la déclinaison ouest. 120 + 3 = 123°.'),
 Q('Déclinaison 2° E, route magnétique 088°. Route vraie ?', '090°', ['086°', '088°', '268°'], 'Vraie = magnétique + déclinaison est : 088 + 2 = 090°.'),
 Q('Glide de l\'ILS : demi-déviation maximale environ :', '0,7° au-dessus ou au-dessous du plan', ['2,5°', '10°', '0,1°'], 'Le localizer, lui, a environ ±2,5° de pleine échelle.'),
 Q('Une approche RNP utilise :', 'La navigation par satellite (GNSS) avec une précision et une surveillance requises', ['Uniquement le NDB', 'Uniquement le VOR', 'La vue seulement'], 'RNP = Required Navigation Performance.'),
 Q('Catégorie d\'approche d\'un avion :', 'Fixée par la vitesse au seuil (1,3 × Vs0) : A à E', ['Par le nombre de moteurs', 'Par la couleur de l\'avion', 'Par la taille de l\'aéroport'], 'Elle fixe les vitesses et minimums de manœuvre à vue.'),
 Q('À 9 NM du seuil sur un ILS à 3°, hauteur approximative :', '≈ 2 860 ft', ['≈ 900 ft', '≈ 9 000 ft', '≈ 1 500 ft'], '9 × 318 ≈ 2 860 ft.'),
 Q('Durée d\'un virage de 180° au taux standard :', '1 min', ['2 min', '30 s', '3 min'], '3° par seconde : 180° en 60 s.'),
 Q('Montée vers une MSA de 4 300 ft depuis 1 500 ft, à 600 ft/min et 120 kt : distance nécessaire ?', fr((4300-1500)/600/60*120,1)+' NM', ['14,0 NM', '4,3 NM', '2,8 NM'], f'(4 300 − 1 500) / 600 = 4,67 min ; 120 × 4,67 / 60 = {fr((4300-1500)/600/60*120,1)} NM.'),
 Q('Pour passer un point de report à 12:30 alors qu\'il reste 85 NM à 12:12, quelle vitesse sol faut-il ?', fr(85/18*60)+' kt', ['85 kt', '255 kt', '300 kt'], f'85 NM en 18 min : 85 / 0,3 = {fr(85/18*60)} kt.'),
 Q('Position estimée (navigation à l\'estime) : on part du point A, cap tenu 20 min à 150 kt de vitesse sol. Distance parcourue ?', '50 NM', ['150 NM', '30 NM', '20 NM'], '150 × 20/60 = 50 NM.'),
 Q('Le transpondeur en mode C transmet :', 'Le code et l\'altitude-pression', ['La position GPS', 'La vitesse', 'Seulement le code'], 'Mode S : en plus, l\'identification de l\'avion et d\'autres données.'),
 Q('« Squawk 7600 » signifie :', 'Panne de radio', ['Détresse', 'Intervention illicite', 'Vol VFR en France'], '7700 détresse, 7500 intervention illicite, 7000 VFR (France).'),
 Q('Vent du 300/30 sur une route 090 à TAS 120 kt : la vitesse sol est :', fr(120*math.cos(math.asin(30*math.sin(math.radians(210))/120))-30*math.cos(math.radians(210)))+' kt', ['90 kt', '120 kt', '150 kt'], 'Vent arrière à 30° de l\'axe : GS = TAS cos(correction) − Vw cos(210°).'),
 Q('Approche indirecte (circling) :', 'Approche aux instruments vers une piste puis manœuvre à vue pour une autre', ['Approche sans visibilité', 'Approche automatique', 'Approche interdite'], 'Elle a ses propres minimums, plus élevés.'))
# ===================== ROULAGE, AÉROPORT (OACI annexe 14) =====================
add('ground',
 Q('Feux d\'axe de voie de circulation :', 'Verts', ['Bleus', 'Blancs', 'Rouges'], 'Bleus : feux de bord de voie de circulation.'),
 Q('Feux de bord de piste :', 'Blancs (jaunes sur la fin de piste aux instruments)', ['Bleus', 'Verts', 'Rouges'], 'Rouges en extrémité de piste, verts au seuil.'),
 Q('Feux de seuil de piste :', 'Verts', ['Rouges', 'Bleus', 'Blancs'], 'Vus à l\'arrivée ; rouges vus en fin de piste.'),
 Q('Barre d\'arrêt (stop bar) allumée :', 'Rouge : interdiction de la franchir', ['Verte : passage libre', 'Jaune : prudence', 'Bleue : parking'], 'Même avec une autorisation : on fait confirmer.'),
 Q('Feux de protection de piste (wig-wag) :', 'Deux feux jaunes clignotants au point d\'attente', ['Feux verts fixes', 'Feux bleus', 'Feux blancs'], 'Ils signalent l\'entrée sur une piste en service.'),
 Q('Panneau à fond noir et inscription jaune :', 'Panneau de position (où l\'on est)', ['Panneau d\'obligation', 'Panneau de direction', 'Panneau de destination'], 'Ex. « B » : vous êtes sur la voie B.'),
 Q('Panneau à fond jaune, inscription noire et flèche :', 'Panneau de direction', ['Panneau de position', 'Panneau d\'obligation', 'Panneau d\'interdiction'], 'Il indique une voie et sa direction.'),
 Q('Panneau d\'obligation :', 'Fond rouge, inscription blanche (ex. « 26R », « 08L-26R »)', ['Fond jaune', 'Fond noir', 'Fond bleu'], 'Il marque un point d\'attente ou une entrée de piste.'),
 Q('Numéro de piste « 26 » :', 'Orientation magnétique d\'environ 260°', ['260 m de long', '26° de pente', 'Piste n° 26 de l\'aéroport'], 'Arrondi à la dizaine de degrés.'),
 Q('Pistes parallèles « 26L / 26R » :', 'Gauche et droite, vues dans le sens d\'atterrissage', ['Longue et réduite', 'Lourde et légère', 'Locale et régionale'], 'C pour une piste centrale.'),
 Q('Seuil décalé :', 'Partie de piste utilisable pour le décollage ou le roulage, pas pour le toucher', ['Interdit à tout usage', 'Réservé aux hélicoptères', 'Zone de parking'], 'Signalé par des flèches blanches.'),
 Q('Chevrons jaunes en bout de piste :', 'Zone non utilisable par les avions (prolongement d\'arrêt ou de souffle)', ['Zone de toucher', 'Parking', 'Voie de sortie rapide'], 'Ni roulage, ni décollage, ni atterrissage.'),
 Q('PAPI : 2 feux blancs et 2 rouges :', 'Sur le plan de descente', ['Trop haut', 'Trop bas', 'Piste fermée'], '4 blancs : trop haut ; 4 rouges : trop bas.'),
 Q('PAPI : 3 rouges et 1 blanc :', 'Légèrement trop bas', ['Légèrement trop haut', 'Sur le plan', 'Très haut'], 'Plus il y a de rouge, plus l\'avion est bas.'),
 Q('Marquage d\'attente « ILS » (échelle jaune) :', 'Point d\'attente protégeant la zone critique ILS', ['Zone de parking', 'Piste fermée', 'Sortie rapide'], 'Utilisé en procédures par faible visibilité.'),
 Q('Une « incursion sur piste » est :', 'La présence non autorisée d\'un avion, d\'un véhicule ou d\'une personne sur une piste', ['Un atterrissage long', 'Une sortie de piste', 'Un roulage lent'], 'Cause d\'accidents majeurs (Tenerife, 1977).'),
 Q('Le contrôle dit « maintenez avant piste 26R » (hold short) :', 'S\'arrêter avant le point d\'attente et collationner', ['Traverser la piste', 'S\'aligner', 'Décoller'], 'Les instructions d\'attente avant une piste se collationnent toujours.'),
 Q('Signal du placeur : bras croisés au-dessus de la tête :', 'Arrêt', ['Avancez', 'Tournez à gauche', 'Coupez les moteurs'], 'Signaux visuels de l\'annexe 2 / SERA.'),
 Q('Le souffle des réacteurs est dangereux :', 'Derrière l\'avion, sur plusieurs dizaines de mètres, surtout en accélération', ['Seulement devant', 'Jamais au sol', 'Seulement sur le côté'], 'D\'où la prudence au roulage près des postes et des véhicules.'),
 Q('Procédures par faible visibilité (LVP) :', 'Restrictions de roulage, protection des zones ILS, minimums spécifiques', ['Aéroport fermé', 'Vitesse de roulage doublée', 'Aucune règle'], 'Mises en œuvre quand la RVR ou le plafond baissent.'),
 Q('RVR signifie :', 'Portée visuelle de piste, mesurée le long de la piste', ['Rayon de virage', 'Vitesse de rotation', 'Visibilité verticale'], 'Elle conditionne les minimums d\'approche et de décollage.'),
 Q('Repoussage (pushback) :', 'Un tracteur recule l\'avion hors de son poste', ['L\'avion recule avec ses inverseurs, toujours', 'Un roulage rapide', 'Un remorquage en vol'], 'Le roulage arrière aux inverseurs est rare et réglementé.'),
 Q('Pendant le repoussage, la direction de la roue avant :', 'Est neutralisée (goupille ou commande) pour le tracteur', ['Est pilotée par le commandant', 'Est verrouillée en braquage maximal', 'N\'existe pas'], 'Goupille de remorquage retirée et montrée au poste après.'),
 Q('Manche à air :', 'Indique la direction et une estimation de la force du vent', ['Mesure la pression', 'Mesure la visibilité', 'Indique la piste en service officiellement'], 'Tendue : vent fort (souvent ≥ 15 kt).'),
 Q('Feu vert continu de la tour vers un avion au sol :', 'Autorisé à décoller', ['Autorisé à rouler', 'Dégagez la piste', 'Revenez au point de départ'], 'Vert clignotant : autorisé à rouler.'))

# ===================== LOT 2 (V10.41) : A320, C172, HÉLICOPTÈRE =====================
add('a320',
 Q('A320 : combien de circuits hydrauliques ?', 'Trois : vert, bleu et jaune', ['Un seul', 'Deux : gauche et droit', 'Quatre'], 'Trois circuits indépendants à 3 000 psi (documentation Airbus A320).'),
 Q('A320 : pression nominale des circuits hydrauliques ?', '3 000 psi', ['300 psi', '5 000 psi', '1 000 psi'], 'L\'A350 passe à 5 000 psi ; l\'A320 reste à 3 000 psi.'),
 Q('A320 : rôle de la PTU (Power Transfer Unit) ?', 'Transférer de la puissance hydraulique entre les circuits vert et jaune, sans échange de liquide', ['Démarrer l\'APU', 'Alimenter la cabine en air', 'Pomper le carburant'], 'Elle se met en marche quand l\'écart de pression entre vert et jaune dépasse un seuil.'),
 Q('A320 : que fait la RAT (éolienne de secours) une fois déployée ?', 'Elle pressurise le circuit bleu, qui entraîne la génératrice de secours', ['Elle démarre les moteurs', 'Elle freine l\'avion', 'Elle chauffe les sondes'], 'Elle fournit hydraulique et électricité de secours en cas de perte totale.'),
 Q('A320 : quels sont les deux types de moteurs proposés (A320ceo) ?', 'CFM56-5 ou IAE V2500', ['PW4000 ou GE90', 'Trent XWB ou GEnx', 'PT6A ou TPE331'], 'Deux motoristes au choix de la compagnie.'),
 Q('A320 : positions du levier de volets ?', '0, 1, 2, 3, FULL', ['UP, 10, 20, 40', '0 à 45 par pas de 5', 'IN, OUT'], 'Chaque cran combine becs et volets (CONF 1, 1+F, 2, 3, FULL).'),
 Q('A320 : crans des manettes de poussée ?', 'TOGA, FLX/MCT, CL, IDLE et inversion', ['MAX, CRUISE, IDLE', 'Uniquement IDLE et TOGA', 'Cinq crans numérotés'], 'En croisière avec automanette, les manettes restent au cran CL.'),
 Q('A320 : sur le FCU, tirer un bouton signifie…', 'Mode « sélecté » : le pilote impose la valeur', ['Mode « managé » par le FMS', 'Couper le pilote automatique', 'Afficher la page de test'], 'Pousser : mode managé (point blanc), suivi des valeurs du FMS.'),
 Q('A320 : code couleur ECAM d\'une alarme rouge ?', 'Situation dangereuse : action immédiate', ['Simple information', 'Système normal', 'Mémo de rappel'], 'Ambre : attention, surveillance ou action différée ; vert : fonctionnement normal.'),
 Q('A320 : autofreinage au décollage ?', 'MAX (en cas d\'interruption du décollage)', ['LO', 'MED', 'Aucun'], 'LO et MED servent à l\'atterrissage.'),
 Q('A320 : combien de calculateurs de commandes de vol ELAC et SEC ?', '2 ELAC et 3 SEC', ['1 ELAC et 1 SEC', '3 ELAC et 2 SEC', '4 ELAC'], 'Plus 2 FAC pour le lacet et les enveloppes de vitesse.'),
 Q('A320 : lois de commandes de vol, de la plus protégée à la moins protégée ?', 'Normale, alternée, directe', ['Directe, normale, alternée', 'Alternée, normale, mécanique', 'Une seule loi'], 'En loi directe, la gouverne suit directement le mini-manche, sans protection.'),
 Q('A320 : qu\'est-ce que l\'« alpha floor » ?', 'La poussée TOGA commandée automatiquement à très forte incidence', ['Un mode d\'atterrissage automatique', 'L\'arrêt des moteurs', 'Une alarme de porte'], 'Protection de l\'énergie en loi normale.'),
 Q('A320 : nombre de groupes de conditionnement d\'air (packs) ?', 'Deux', ['Un', 'Trois', 'Quatre'], 'Un pack suffit à maintenir la pressurisation, avec des limites.'),
 Q('A320 : réservoirs de carburant ?', 'Réservoirs d\'aile (intérieurs et extérieurs) et réservoir central', ['Un seul réservoir dans la queue', 'Uniquement le réservoir central', 'Réservoirs dans les moteurs'], 'Le réservoir central est consommé en premier en usage normal.'),
 Q('A320 : TCAS annonce « MONITOR VERTICAL SPEED ». Que faire ?', 'Garder la vitesse verticale hors de la zone rouge du variomètre', ['Monter au maximum', 'Couper le transpondeur', 'Ignorer l\'annonce'], 'C\'est un avis de résolution préventif.'),
 Q('A320 : nombre de MCDU (interfaces du FMS) dans le poste ?', 'Deux, un par pilote', ['Un seul', 'Quatre', 'Aucun'], 'Chaque MCDU agit sur le FMS ; ses pages sont communes.'),
 Q('A320 : phase « dark cockpit » : un bouton-poussoir allumé en blanc au plafonnier signifie…', 'Le système n\'est pas dans sa position normale (exemple : OFF)', ['Fonctionnement normal', 'Panne grave', 'Test en cours, sans autre sens'], 'Ambre : panne ; aucun voyant : configuration normale.'))
add('c172',
 Q('C172P : quel moteur ?', 'Un Lycoming O-320 à quatre cylindres opposés, 160 ch', ['Un turbopropulseur PT6', 'Deux moteurs Rotax', 'Un moteur diesel V8'], 'Moteur à pistons à carburateur (manuel de vol C172P).'),
 Q('C172 : l\'hélice est…', 'À pas fixe', ['À pas variable avec régulateur', 'Contrarotative', 'Carénée'], 'La puissance se règle avec la manette des gaz et se lit en tr/min.'),
 Q('C172 : alimentation en carburant ?', 'Par gravité depuis les réservoirs d\'aile, sélecteur sur BOTH', ['Par pompe électrique uniquement', 'Depuis un réservoir de fuselage', 'Sous pression d\'azote'], 'Aile haute : le carburant descend vers le moteur.'),
 Q('C172 : premier symptôme du givrage du carburateur ?', 'Une baisse du régime (tr/min) avec l\'hélice à pas fixe', ['Une hausse de la température d\'huile', 'Une alarme sonore', 'Une montée du variomètre'], 'Remède : réchauffage du carburateur (carb heat).'),
 Q('C172 : quand appauvrir le mélange en croisière ?', 'En altitude, pour garder un mélange correct quand l\'air devient moins dense', ['Jamais', 'Seulement au décollage', 'À l\'atterrissage'], 'Le manuel de vol précise la méthode et les limites.'),
 Q('C172 : quels instruments dépendent du circuit pitot-statique ?', 'Anémomètre, altimètre et variomètre', ['Horizon et conservateur de cap', 'Compas et chronomètre', 'Tachymètre et jauges'], 'L\'horizon et le conservateur de cap sont entraînés par le circuit de dépression (gyroscopes).'),
 Q('C172 : le circuit à dépression entraîne…', 'L\'horizon artificiel et le conservateur de cap', ['L\'anémomètre', 'Le compas magnétique', 'L\'altimètre'], 'Une panne de dépression laisse les instruments pitot-statiques intacts.'),
 Q('C172 : rôle de la double magnéto ?', 'Deux allumages indépendants, pour la sécurité et une meilleure combustion', ['Charger la batterie', 'Démarrer seulement', 'Chauffer l\'huile'], 'Essai des magnétos avant le vol : chute de régime limitée et écart limité.'),
 Q('C172P : Vy (meilleur taux de montée) au niveau de la mer ?', '76 KIAS', ['59 KIAS', '110 KIAS', '45 KIAS'], 'Vx (meilleur angle) : 59 KIAS (manuel de vol C172P).'),
 Q('C172P : vitesse de meilleur plané ?', '65 KIAS', ['45 KIAS', '100 KIAS', '127 KIAS'], 'Vitesse à afficher dès une panne moteur (manuel de vol C172P).'),
 Q('C172P : VNE (vitesse à ne jamais dépasser) ?', '158 KIAS', ['127 KIAS', '200 KIAS', '85 KIAS'], 'Trait rouge de l\'anémomètre ; 127 KIAS est la VNO (début de l\'arc jaune).'),
 Q('C172P : VFE (vitesse maximale volets sortis) ?', '85 KIAS', ['158 KIAS', '127 KIAS', '65 KIAS'], 'Haut de l\'arc blanc (manuel de vol C172P).'))
add('heli',
 Q('Dissymétrie de portance : en vol d\'avance, quelle pale porte le plus sans correction ?', 'La pale avançante', ['La pale reculante', 'Les deux pareil', 'La pale arrière seulement'], 'Le battement et le pas cyclique égalisent la portance.'),
 Q('Comment le rotor compense-t-il la dissymétrie de portance ?', 'Par le battement des pales et le pas cyclique', ['Par le rotor de queue', 'Par le moteur', 'Par le train'], 'La pale avançante monte et réduit son incidence ; la reculante descend et l\'augmente.'),
 Q('Décrochage de la pale reculante : quand survient-il ?', 'À grande vitesse d\'avance, forte masse, haute altitude-densité', ['En stationnaire', 'Au sol', 'En autorotation lente'], 'Symptômes : vibrations, cabré et roulis vers le côté de la pale reculante.'),
 Q('Portance de translation (ETL) :', 'Gain de portance quand le rotor entre en air « propre », vers 15 à 25 kt', ['Perte de portance à l\'arrêt', 'Effet du sol', 'Effet du rotor de queue'], 'On la sent par une vibration passagère puis une meilleure performance.'),
 Q('Effet de sol :', 'Gain de performance quand le rotor est à moins d\'environ un diamètre du sol', ['Perte de portance près du sol', 'Effet du vent seulement', 'Effet de la température'], 'Stationnaire dans l\'effet de sol (IGE) : moins de puissance qu\'hors effet de sol (OGE).'),
 Q('Vortex (état d\'anneau tourbillonnaire) : conditions réunies ?', 'Faible vitesse, descente verticale marquée et puissance appliquée', ['Grande vitesse et montée', 'Autorotation à 80 kt', 'Roulage au sol'], 'Sortie : prendre de la vitesse horizontale (ou méthode enseignée sur le type).'),
 Q('Retournement dynamique (dynamic rollover) :', 'Basculement autour d\'un patin ou d\'une roue resté au sol', ['Perte de régime en vol', 'Tonneau en vol', 'Panne de rotor de queue'], 'Prévention : décoller et se poser en douceur, attention au patin accroché.'),
 Q('« Mast bumping » concerne surtout…', 'Les rotors bipales en balancier, en situation de facteur de charge faible', ['Les rotors à quatre pales rigides', 'Les avions', 'Les rotors de queue'], 'Ne jamais pousser brutalement le cyclique vers l\'avant : risque de rupture du mât.'),
 Q('Premier geste en cas de panne moteur en vol ?', 'Baisser immédiatement le collectif pour garder le régime rotor', ['Tirer le collectif', 'Freiner le rotor', 'Couper la batterie'], 'Le régime rotor est vital : il chute en une ou deux secondes.'),
 Q('Autorotation : à quoi sert l\'arrondi (flare) final ?', 'Réduire la vitesse et le taux de chute en utilisant l\'énergie du rotor', ['Prendre de l\'altitude', 'Arrêter le rotor', 'Changer de cap'], 'Suivi d\'une remise à plat et d\'un amortissement au collectif.'),
 Q('Courbe hauteur-vitesse (« zone à éviter ») :', 'Combinaisons hauteur / vitesse d\'où une autorotation réussie est difficile', ['Zone de vitesse maximale', 'Zone de vol normal', 'Altitude de croisière'], 'Publiée dans le manuel de vol de chaque type.'),
 Q('Rôle de la roue libre (freewheeling unit) ?', 'Désaccoupler le moteur du rotor quand le moteur ralentit, pour permettre l\'autorotation', ['Démarrer le moteur', 'Freiner le rotor au sol', 'Entraîner l\'alternateur seulement'], 'Le rotor continue de tourner librement.'),
 Q('Le plateau cyclique transmet…', 'Les commandes de pas (collectif et cyclique) aux pales qui tournent', ['La puissance du moteur', 'Le carburant', 'Le courant électrique'], 'Plateau fixe et plateau tournant, reliés aux pales par des biellettes.'),
 Q('Perte d\'efficacité du rotor de queue (LTE) : situation à risque ?', 'Faible vitesse avec vent de certaines directions, forte puissance', ['Croisière rapide', 'Moteur arrêté au sol', 'Autorotation à grande vitesse'], 'Elle se traduit par une rotation non commandée en lacet.'),
 Q('Panne du rotor de queue en croisière : symptôme typique ?', 'Le nez part en lacet ; la dérive l\'atténue en vol rapide, mais la rotation s\'accentue en ralentissant', ['Aucun effet', 'Montée brusque', 'Arrêt du rotor principal'], 'En vol rapide, la dérive stabilise ; au ralenti ou en stationnaire, la rotation devient forte.'),
 Q('Résonance sol :', 'Oscillation destructrice au sol, due à un déséquilibre du rotor et aux trains', ['Bruit du rotor en croisière', 'Effet de sol', 'Vibration de la radio'], 'Remède usuel : décoller si le régime le permet, ou réduire et couper.'),
 Q('Conicité du rotor (coning) :', 'Les pales se relèvent sous l\'effet de la portance, équilibrée par la force centrifuge', ['Les pales se tordent', 'Le rotor s\'incline vers l\'avant', 'Les pales s\'allongent'], 'Un régime trop bas augmente dangereusement la conicité.'),
 Q('Pourquoi les pales ont-elles un mouvement de traînée (lead-lag) ?', 'Pour absorber les effets de Coriolis quand le battement change le rayon du centre de gravité', ['Pour freiner l\'hélicoptère', 'Pour changer de pas', 'Pour réduire le bruit uniquement'], 'Les amortisseurs de traînée évitent les oscillations.'),
 Q('Altitude-densité élevée (chaud, haut) : effet ?', 'Moins de puissance moteur et moins de portance rotor', ['Plus de puissance', 'Aucun effet', 'Rotor plus efficace'], 'Les tableaux de performances du manuel de vol en tiennent compte.'),
 Q('Faible régime rotor (low RPM) : danger ?', 'Perte de portance et conicité excessive, pouvant être irrattrapable', ['Usure des patins', 'Consommation réduite', 'Aucun danger'], 'Alarme sonore et voyant sur la plupart des types.'),
 Q('Surpas (overpitching) :', 'Tirer trop de collectif : le moteur ne suit plus et le régime chute', ['Excès de vitesse', 'Trop de pédale', 'Trop peu de carburant'], 'Correction : réduire le collectif pour rétablir le régime.'),
 Q('La VNE d\'un hélicoptère avec l\'altitude :', 'Diminue en général, selon le tableau du manuel de vol', ['Augmente toujours', 'Ne change jamais', 'Double au-dessus de 5 000 ft'], 'Décrochage de pale reculante plus précoce en air peu dense.'),
 Q('Piston (exemple R44) : givrage du carburateur ?', 'Possible même par temps doux et humide : réchauffage selon le manuel de vol', ['Impossible au-dessus de 0 °C', 'Seulement en vol de nuit', 'Uniquement sur turbine'], 'Une jauge de température carburateur aide à le prévenir.'),
 Q('Le gouverneur (sur turbine ou piston équipé) sert à…', 'Maintenir automatiquement le régime rotor quand le collectif varie', ['Limiter la vitesse d\'avance', 'Commander le rotor de queue', 'Régler la radio'], 'Le pilote surveille le régime et peut reprendre la main.'),
 Q('Stationnaire hors effet de sol (OGE) par rapport à IGE :', 'Demande plus de puissance', ['Demande moins de puissance', 'Demande la même puissance', 'Est impossible'], 'Vérifier la marge de puissance avant un stationnaire OGE (treuillage, pente).'),
 Q('Pourquoi l\'hélicoptère dérive-t-il latéralement en stationnaire (dérive de translation) ?', 'La poussée du rotor de queue pousse l\'appareil sur le côté ; on la compense au cyclique', ['À cause du vent seulement', 'À cause du moteur', 'Ce n\'est jamais le cas'], 'Le mât est souvent incliné ou le cyclique décalé pour la compenser.'))

for k, v in ADD.items():
    for x in v: assert len(x[1]) == 4 and len(set(x[1])) == 4, (k, x)
JS = """/* ===== V10.40 (F10 suite) : QCM portés à au moins 30 questions par thème, difficulté croissante, avec corrigés =====
   Contenu GÉNÉRÉ par tools/gen_qcm30.py (réponses calculées pour masse et centrage, carburant, navigation ; notions établies pour le reste :
   OACI annexe 14 et PANS-OPS, EASA SERA / Part-CAT / Part-NCO, manuels FAA publics). Les documents de l'exploitant et du constructeur font foi. */
(function(){
if(typeof QB==='undefined') return;
const ADD=__ADD__;
Object.keys(ADD).forEach(k=>{ QB[k]=(QB[k]||[]).concat(ADD[k]); });
// examen blanc PPL : recomposé avec toutes les matières enrichies
const P=['p010','p020','p030','p040','p050','p060','p070','p080','p090']; if(P.every(k=>Array.isArray(QB[k]))) QB.ppl=P.flatMap(k=>QB[k]);
})();
"""
open(OUT, 'w', encoding='utf-8').write(JS.replace('__ADD__', json.dumps(ADD, ensure_ascii=False)))
print({k: len(v) for k, v in ADD.items()})
