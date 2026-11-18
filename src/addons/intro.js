/* ===== INTRODUCTION AU PROJET + TEST DE POSITIONNEMENT (non bloquant) =====
   Affichée au premier lancement, avant le simulateur, puis accessible à tout moment (bouton « 📘 Introduction »).
   1. Pourquoi ce projet, ce qu'il contient, ce qu'il n'est pas.
   2. Comment étudier les contenus dans le bon ordre (parcours conseillé).
   3. Test de positionnement facultatif : 30 questions de mathématiques (prérequis des calculs) et 30 de sciences utiles au vol ; il est SCIENTIFIQUE (F16) : les questions de culture aéronautique sont dans « TEST POST PARCOURS ET TESTS - AÉRONAUTIQUE ». Ancien libellé : culture aéronautique.
      Le résultat propose un parcours adapté ; il ne verrouille rien : le simulateur reste accessible à tout moment. */
(function(){
const K='sim-intro', ACI=id=>{ try{ const all=ACAD.PARTS.flatMap(p=>p.mods); return all.findIndex(m=>m.id===id); }catch(e){ return -1; } }, PI=pid=>{ try{ const p=ACAD.PARTS.find(x=>x.id===pid); return ACAD.PARTS.flatMap(x=>x.mods).indexOf(p.mods[0]); }catch(e){ return -1; } };
const MATH=[
 ['Un avion consomme 66 kg de carburant en 3 h. Combien en 1 h 30 ?',['33 kg','22 kg','44 kg','99 kg'],0,'Proportionnalité : 66 / 3 × 1,5 = 33 kg. C\'est le calcul du carburant d\'étape.'],
 ['Combien font 5 % de 4 200 ?',['210','21','420','2 100'],0,'4 200 × 5 / 100 = 210. C\'est la réserve de route d\'un avion de ligne.'],
 ['2 h 15 min, en heures décimales :',['2,25 h','2,15 h','2,5 h','2,75 h'],0,'15 min = 15/60 = 0,25 h.'],
 ['120 km parcourus en 40 min : vitesse ?',['180 km/h','120 km/h','160 km/h','300 km/h'],0,'120 / 40 × 60 = 180 km/h.'],
 ['15 − 2 × 3 =',['9','39','−21','11'],0,'La multiplication passe avant la soustraction.'],
 ['Température 5 °C, puis elle baisse de 12 °C :',['−7 °C','7 °C','−17 °C','17 °C'],0,'5 − 12 = −7. Les températures en altitude sont souvent négatives.'],
 ['On tourne de 30° vers la droite depuis le cap 350° :',['020°','380°','320°','030°'],0,'350 + 30 = 380, soit 380 − 360 = 020° : les caps tournent en rond de 000 à 359.'],
 ['sin 30° vaut :',['0,5','0,3','0,87','1'],0,'sin 30° = 0,5 ; on s\'en sert pour la composante de vent traversier.'],
 ['2 kg posés à 1 m et 2 kg posés à 3 m d\'un repère : où est le centre de gravité ?',['À 2 m','À 1 m','À 3 m','À 4 m'],0,'(2 × 1 + 2 × 3) / 4 = 2 m. C\'est le calcul du centrage.'],
 ['La racine carrée de 1,21 vaut :',['1,1','0,11','1,21','11'],0,'1,1 × 1,1 = 1,21. Elle sert pour la vitesse de décrochage en virage.'],
 // V10.38 (F10) : 20 questions de plus, niveau moyen puis difficile (calculs réels du pilote) [CALCULÉ]
 ['3 000 ft en mètres (1 ft = 0,3048 m) :',['914 m','1 000 m','984 m','9 144 m'],0,'3 000 × 0,3048 = 914,4 m.'],
 ['150 kt en km/h (1 kt = 1,852 km/h) :',['278 km/h','150 km/h','81 km/h','300 km/h'],0,'150 × 1,852 = 277,8 km/h.'],
 ['Vitesse sol 120 kt : temps pour parcourir 50 NM ?',['25 min','24 min','40 min','2 h 24'],0,'50 / 120 = 0,417 h, soit 25 min. Astuce : 120 kt = 2 NM par minute.'],
 ['Consommation 38 L/h, vol de 1 h 40 : carburant d\'étape ?',['63 L','57 L','76 L','38 L'],0,'1 h 40 = 1,667 h ; 38 × 1,667 = 63,3 L.'],
 ['Réserve finale de 30 min avec une consommation de 36 L/h :',['18 L','30 L','36 L','12 L'],0,'36 × 0,5 = 18 L.'],
 ['Route vraie 090°, déclinaison magnétique 2° Est : route magnétique ?',['088°','092°','090°','270°'],0,'Déclinaison Est : on la retranche (« Est, on enlève ») : 090 − 2 = 088°.'],
 ['Masse 1 000 kg à 1,0 m du repère ; on ajoute 100 kg à 2,1 m. Nouveau bras du centre de gravité ?',['1,10 m','1,05 m','1,55 m','2,10 m'],0,'Moments : 1 000 × 1,0 + 100 × 2,1 = 1 210 kg·m ; 1 210 / 1 100 = 1,10 m.'],
 ['Sur un plan de descente de 3°, on perd environ combien de pieds par mille nautique ?',['≈ 300 ft/NM','≈ 30 ft/NM','≈ 1 000 ft/NM','≈ 3 ft/NM'],0,'tan 3° × 6 076 ft ≈ 318 ft : on retient 300 ft par NM.'],
 ['Plan de 3° à 120 kt de vitesse sol : taux de descente ?',['≈ 600 ft/min','≈ 360 ft/min','≈ 1 200 ft/min','≈ 120 ft/min'],0,'Règle : vitesse sol × 5 = 120 × 5 = 600 ft/min.'],
 ['Température standard (ISA) à 5 000 ft ?',['5 °C','15 °C','−5 °C','10 °C'],0,'ISA : 15 °C au niveau de la mer, −2 °C par 1 000 ft : 15 − 10 = 5 °C.'],
 ['Vent du 270° pour 20 kt, piste 30 (axe 300°) : composante traversière ?',['10 kt','17 kt','20 kt','5 kt'],0,'Écart 30° : 20 × sin 30° = 10 kt.'],
 ['Même vent (270° / 20 kt), piste 30 : composante de face ?',['17 kt','10 kt','20 kt','0 kt'],0,'20 × cos 30° = 20 × 0,87 ≈ 17 kt.'],
 ['Facteur de charge en virage en palier à 60° d\'inclinaison :',['2','1,5','1,15','3'],0,'n = 1 / cos 60° = 1 / 0,5 = 2 : on « pèse » deux fois son poids.'],
 ['Vitesse de décrochage 50 kt en palier. En virage à 60° d\'inclinaison ?',['≈ 71 kt','100 kt','50 kt','≈ 58 kt'],0,'Vs × √n = 50 × √2 ≈ 70,7 kt : la vitesse de décrochage augmente en virage.'],
 ['QNH 1003 hPa, aérodrome à 500 ft (1 hPa ≈ 28 ft). Altitude-pression de l\'aérodrome ?',['≈ 780 ft','≈ 220 ft','500 ft','≈ 1 280 ft'],0,'(1013 − 1003) × 28 = 280 ft ; 500 + 280 = 780 ft. Pression basse : altitude-pression plus haute.'],
 ['Vitesse vraie approchée : 100 kt indiqués à 8 000 ft (règle : + 2 % par 1 000 ft) ?',['≈ 116 kt','100 kt','≈ 108 kt','≈ 180 kt'],0,'8 × 2 % = 16 % : 100 × 1,16 ≈ 116 kt.'],
 ['Perdre 9 000 ft à 1 500 ft/min avec 240 kt de vitesse sol : distance de descente ?',['24 NM','36 NM','6 NM','15 NM'],0,'9 000 / 1 500 = 6 min ; 240 kt = 4 NM/min ; 6 × 4 = 24 NM.'],
 ['Vent traversier 15 kt, vitesse vraie 90 kt : dérive maximale approchée ?',['≈ 10°','≈ 15°','≈ 6°','≈ 1,5°'],0,'Dérive max ≈ 60 × vent traversier / vitesse vraie = 60 × 15 / 90 = 10°.'],
 ['Étape 54 L, roulage 3 L, réserve finale 30 min à 36 L/h, supplément 10 % de l\'étape. Carburant minimum ?',['≈ 80 L','≈ 75 L','≈ 72 L','≈ 90 L'],0,'54 + 3 + 18 + 5,4 = 80,4 L : on embarque au moins 81 L.'],
 ['Masse 1 050 kg, moment total 1 200 kg·m, limite arrière 1,20 m. Centrage ?',['1,14 m : dans la limite','1,26 m : hors limite','0,88 m','1,20 m exactement'],0,'1 200 / 1 050 = 1,143 m, en avant de la limite arrière de 1,20 m.']];
const CULT=[
 ['Un mille nautique (NM) mesure :',['1 852 m','1 000 m','1 609 m','3 048 m'],0,'1 NM = 1 852 m ; c\'est une minute d\'arc de latitude.'],
 ['Les quatre forces en vol :',['Portance, poids, traction, traînée','Portance, vitesse, cap, altitude','Moteur, ailes, train, gouvernes','Vent, pression, température, densité'],0,'En vol stabilisé : portance = poids, traction = traînée.'],
 ['À quoi servent les volets ?',['Voler plus lentement au décollage et à l\'atterrissage','Freiner au sol uniquement','Diriger l\'avion en virage','Refroidir les moteurs'],0,'Ils augmentent la portance à basse vitesse (et la traînée).'],
 ['Un METAR est :',['Une observation météo d\'aérodrome','Un plan de vol','Une carte d\'approche','Un instrument'],0,'Il donne vent, visibilité, nuages, température, QNH.'],
 ['Le cap 270° correspond à :',['L\'ouest','Le nord','L\'est','Le sud'],0,'000 nord, 090 est, 180 sud, 270 ouest.'],
 ['Pourquoi l\'altimètre doit-il être calé (QNH) ?',['La pression au sol change avec la météo','Pour régler la vitesse','Pour la radio','Il n\'a pas besoin de réglage'],0,'L\'altimètre est un baromètre : sans calage, il peut se tromper de centaines de pieds.'],
 // V10.38 (F10) : 24 questions de plus, niveau moyen puis difficile
 ['Que signifie VFR ?',['Règles de vol à vue','Vol à vitesse fixe','Vol de nuit uniquement','Vol aux instruments'],0,'VFR : Visual Flight Rules ; IFR : vol aux instruments.'],
 ['Couleur du feu de navigation au bout de l\'aile gauche :',['Rouge','Vert','Blanc','Bleu'],0,'Rouge à gauche, vert à droite, blanc à l\'arrière.'],
 ['Code transpondeur de détresse (urgence) :',['7700','7600','7500','7000'],0,'7700 urgence ; 7600 panne radio ; 7500 intervention illicite ; 7000 VFR en France.'],
 ['Code transpondeur en cas de panne radio :',['7600','7700','7000','2000'],0,'7600 = panne de communication.'],
 ['Au sol, l\'altimètre calé au QNH indique :',['L\'altitude de l\'aérodrome','Zéro','Le niveau de vol','La hauteur de l\'avion'],0,'Calé au QNH, il donne l\'altitude au-dessus du niveau de la mer ; au QFE, la hauteur (zéro au sol).'],
 ['Que mesure l\'anémomètre ?',['La vitesse par rapport à l\'air, par la pression dynamique','La vitesse par rapport au sol','La force du vent','Le régime moteur'],0,'Il compare pression totale (pitot) et statique : c\'est la vitesse indiquée.'],
 ['Le mouvement autour de l\'axe de lacet est commandé par :',['La gouverne de direction (palonnier)','Les ailerons','La gouverne de profondeur','Les volets'],0,'Lacet : direction ; roulis : ailerons ; tangage : profondeur.'],
 ['En radio, « collationner » veut dire :',['Répéter les éléments importants d\'une clairance','Répondre seulement « reçu »','Demander de répéter','Changer de fréquence'],0,'Clairances, pistes, caps, altitudes, calages et codes se collationnent.'],
 ['CAVOK dans un METAR signifie :',['Visibilité ≥ 10 km, pas de nuage sous 5 000 ft (ou l\'altitude minimale de secteur la plus élevée), pas de cumulonimbus ni de temps significatif','Ciel couvert','Vent calme seulement','Aérodrome fermé'],0,'CAVOK = Ceiling And Visibility OK, avec ces trois conditions.'],
 ['Un vent « 27015KT » dans un METAR :',['Vient de l\'ouest à 15 kt','Va vers l\'ouest à 15 kt','Vient du nord à 27 kt','Vient de l\'est à 15 kt'],0,'La direction est celle d\'où vient le vent.'],
 ['Pourquoi décoller face au vent ?',['Pour réduire la vitesse sol et la distance de décollage','Pour aller plus vite','Pour user moins les freins','Par tradition'],0,'La vitesse air nécessaire est atteinte avec moins de vitesse sol.'],
 ['Un avion décroche quand :',['L\'incidence dépasse l\'incidence critique','La vitesse dépasse la VNE','Le moteur s\'arrête','Il vole trop haut'],0,'Le décrochage est une question d\'incidence, à n\'importe quelle vitesse.'],
 ['Effet d\'une forte chaleur sur la distance de décollage :',['Elle s\'allonge (air moins dense)','Elle raccourcit','Aucun effet','Seulement sur le bruit'],0,'Air chaud = moins dense : moins de portance et de puissance.'],
 ['En montée à vitesse indiquée constante, la vitesse vraie :',['Augmente','Diminue','Reste égale','S\'annule'],0,'L\'air se raréfie : pour la même vitesse indiquée, il faut aller plus vite par rapport à l\'air.'],
 ['Givrage du carburateur : conditions les plus favorables ?',['Air humide, environ −10 à +30 °C, régime réduit','Uniquement sous 0 °C','Uniquement en nuage','Forte chaleur et air très sec'],0,'La détente et l\'évaporation refroidissent le venturi : on peut givrer par temps doux et humide.'],
 ['Altimètre laissé sur 1013 alors que le QNH est 993 hPa : l\'avion est en réalité :',['Plus bas qu\'indiqué, d\'environ 550 ft','Plus haut qu\'indiqué','À l\'altitude indiquée','Au sol'],0,'20 hPa × 28 ft ≈ 560 ft. « Des hautes pressions vers les basses : attention en bas ».'],
 ['Le niveau de vol FL65 correspond à :',['6 500 ft au calage 1013 hPa','6 500 m','650 ft','6 500 ft au QNH'],0,'Un niveau de vol se lit en centaines de pieds au calage standard 1013,25 hPa.'],
 ['Pour entrer en VFR dans un espace de classe D :',['Clairance et contact radio obligatoires','Accès libre sans radio','Le VFR y est interdit','Réservé aux planeurs'],0,'Classe D : clairance, radio et informations de trafic.'],
 ['Hypoxie : premier symptôme souvent non perçu par le pilote ?',['Euphorie et baisse du jugement','Douleur aiguë','Sensation de faim','Démangeaisons'],0,'Elle est insidieuse : on se sent bien alors que les capacités baissent.'],
 ['La nuit, pour voir un feu faible, on regarde :',['Légèrement à côté (vision périphérique)','Droit dessus','Un œil fermé','À travers une lumière vive'],0,'Les bâtonnets, sensibles à la faible lumière, sont en périphérie de la rétine.'],
 ['Centre de gravité trop en arrière : conséquence ?',['Avion moins stable, sortie de décrochage difficile','Avion plus stable','Avion plus lourd','Avion plus rapide en montée seulement'],0,'Au-delà de la limite arrière, la stabilité en tangage peut disparaître.'],
 ['L\'effet de sol à l\'atterrissage :',['Réduit la traînée induite : l\'avion « flotte »','Augmente la traînée','Fait décrocher l\'avion','N\'existe qu\'en hydravion'],0,'Près du sol, les tourbillons marginaux sont réduits : moins de traînée induite.'],
 ['Une TEMSI est :',['Une carte du temps significatif prévu','Un message de vent en altitude','Un NOTAM','Un plan de vol'],0,'TEMSI : temps significatif ; WINTEM : vents et températures en altitude.'],
 ['VNE désigne :',['La vitesse à ne jamais dépasser','La vitesse de décollage','La vitesse de décrochage','La vitesse de croisière'],0,'Trait rouge de l\'anémomètre : au-delà, risque structural (flottement, rupture).']];
// V10.38 (F16) : le test de niveau est SCIENTIFIQUE : mathématiques + sciences utiles aux calculs d'un décollage en sécurité (du facile au difficile) [CALCULÉ]
// Les questions de culture aéronautique (CULT) passent dans « TEST POST PARCOURS ET TESTS - AÉRONAUTIQUE » (QCM).
const AERO=[
 ['Unité de pression utilisée en aéronautique en Europe :',['L\'hectopascal (hPa)','Le newton','Le joule','Le watt'],0,'1 hPa = 100 Pa ; le QNH s\'exprime en hPa.'],
 ['Quand on monte en altitude, la pression de l\'air :',['Diminue','Augmente','Reste constante','Devient nulle à 1 000 m'],0,'Il y a moins d\'air au-dessus : environ 1 hPa de moins tous les 28 ft près du sol.'],
 ['À pression égale, l\'air chaud est :',['Moins dense que l\'air froid','Plus dense','Aussi dense','Plus lourd'],0,'Il se dilate : moins de masse par m³, donc moins de portance et de puissance.'],
 ['Une force se mesure en :',['Newtons','Kilogrammes','Pascals','Watts'],0,'Le kilogramme mesure une masse ; le newton une force.'],
 ['Le poids d\'un avion est :',['La force due à la pesanteur (P = m × g)','La même chose que sa masse','Une vitesse','Une pression'],0,'Avec g ≈ 9,81 m/s², 1 000 kg pèsent environ 9 810 N.'],
 ['0 °C en kelvins :',['273,15 K','0 K','100 K','−273 K'],0,'Les lois des gaz utilisent la température absolue : T(K) = T(°C) + 273,15.'],
 ['1 m/s vaut :',['3,6 km/h','1 km/h','36 km/h','0,36 km/h'],0,'3 600 m par heure = 3,6 km/h.'],
 ['Un angle droit mesure :',['90°','180°','45°','360°'],0,'Vent plein travers : 90° par rapport à la piste.'],
 ['Un vecteur est défini par :',['Une direction, un sens et une norme','Une seule valeur','Une unité','Une couleur'],0,'Le vent et la vitesse de l\'avion sont des vecteurs : on les additionne (triangle des vitesses).'],
 ['Si la densité de l\'air diminue, la portance à même vitesse :',['Diminue','Augmente','Ne change pas','Double'],0,'La portance est proportionnelle à la masse volumique de l\'air.'],
 ['Pression standard au niveau de la mer (atmosphère type OACI) :',['1 013,25 hPa','1 000 hPa','760 hPa','101,3 hPa'],0,'1 013,25 hPa = 101,325 kPa = 760 mm de mercure.'],
 ['Portance L = ½ ρ V² S CL. Si la vitesse double, la portance :',['Est multipliée par 4','Double','Est divisée par 2','Ne change pas'],0,'Elle varie comme le carré de la vitesse : 2² = 4.'],
 ['Même formule : si la densité ρ baisse de 10 %, la portance à même vitesse :',['Baisse de 10 %','Baisse de 20 %','Monte de 10 %','Ne change pas'],0,'Proportionnelle à ρ.'],
 ['À pression constante, si la température absolue augmente, la densité de l\'air :',['Diminue','Augmente','Reste la même','S\'annule'],0,'Loi des gaz parfaits : ρ = P / (R × T).'],
 ['cos 60° vaut :',['0,5','0,87','1','0'],0,'cos 60° = 0,5 ; sin 60° ≈ 0,87.'],
 ['Énergie cinétique E = ½ m v² : si la vitesse double, l\'énergie à dissiper au freinage :',['Est multipliée par 4','Double','Reste la même','Est divisée par 2'],0,'C\'est pourquoi un décollage interrompu à grande vitesse échauffe autant les freins.'],
 ['Un avion passe de 0 à 60 m/s en 30 s. Accélération moyenne ?',['2 m/s²','0,5 m/s²','30 m/s²','1 800 m/s²'],0,'a = Δv / Δt = 60 / 30 = 2 m/s².'],
 ['Avec une accélération constante de 2 m/s², distance parcourue en 30 s depuis l\'arrêt ?',['900 m','1 800 m','60 m','450 m'],0,'d = ½ a t² = 0,5 × 2 × 900 = 900 m.'],
 ['Somme de deux vecteurs perpendiculaires de normes 3 et 4 :',['5','7','1','12'],0,'Pythagore : √(9 + 16) = 5.'],
 ['Gradient de température standard dans la troposphère :',['≈ −6,5 °C par 1 000 m','≈ −1 °C par 1 000 m','≈ +2 °C par 1 000 ft','0'],0,'Soit environ −2 °C par 1 000 ft, jusqu\'à la tropopause (11 km en atmosphère type).'],
 ['Par une journée chaude, l\'altitude-densité d\'un aérodrome est :',['Plus élevée que son altitude réelle : l\'avion se comporte comme s\'il était plus haut','Plus basse','Égale','Sans rapport avec la température'],0,'Air chaud et peu dense : décollage plus long, montée plus faible.'],
 ['La distance de décollage varie environ comme V² / a. Si la vitesse de rotation augmente de 10 % (masse plus forte), à accélération égale :',['Elle augmente d\'environ 21 %','Elle augmente de 10 %','Elle double','Elle ne change pas'],0,'1,1² = 1,21. Et l\'accélération baisse aussi avec la masse : en réalité, c\'est encore plus.'],
 ['Vent de face 10 kt, vitesse de décollage 60 kt : vitesse sol au décollage ?',['50 kt','70 kt','60 kt','10 kt'],0,'Vitesse sol = vitesse air − vent de face.'],
 ['La distance de décollage varie environ comme le carré de la vitesse sol au décollage. Avec 50 kt au lieu de 60 kt :',['≈ 69 % de la distance sans vent','≈ 83 %','≈ 50 %','La même'],0,'(50 / 60)² = 0,694 : le vent de face raccourcit nettement le décollage.'],
 ['Masse volumique de l\'air standard au niveau de la mer :',['≈ 1,225 kg/m³','≈ 1 000 kg/m³','≈ 0,1 kg/m³','≈ 12,25 kg/m³'],0,'Valeur de l\'atmosphère type OACI à 15 °C et 1 013,25 hPa.'],
 ['Densité relative de l\'air à 30 °C au niveau de la mer, pression standard (ρ inversement proportionnelle à la température absolue) :',['≈ 0,95','≈ 0,50','≈ 1,10','≈ 0,70'],0,'288,15 / 303,15 ≈ 0,95 : 5 % de portance et de puissance en moins.'],
 ['Vent de 30 kt soufflant à 40° de l\'axe de piste (sin 40° ≈ 0,64) : composante traversière ?',['≈ 19 kt','≈ 23 kt','≈ 12 kt','30 kt'],0,'30 × 0,64 ≈ 19 kt, à comparer à la limite démontrée de l\'appareil.'],
 ['On monte de 500 ft en parcourant 1 NM (6 076 ft). Pente de montée ?',['≈ 8,2 %','≈ 5 %','≈ 12 %','≈ 0,8 %'],0,'500 / 6 076 = 0,082, soit 8,2 %.'],
 ['Pente de montée exigée 3,3 % à 100 kt de vitesse sol : taux de montée nécessaire ?',['≈ 330 ft/min','≈ 33 ft/min','≈ 1 000 ft/min','≈ 100 ft/min'],0,'1 kt ≈ 101 ft/min : taux ≈ pente (%) × vitesse sol (kt) ≈ 3,3 × 101 ≈ 334 ft/min.'],
 ['Un avion à 70 m/s freine avec une décélération de 3 m/s². Distance d\'arrêt ?',['≈ 817 m','≈ 233 m','≈ 1 633 m','≈ 490 m'],0,'d = v² / (2a) = 4 900 / 6 ≈ 817 m : base du calcul d\'un décollage interrompu.']];
window.QB_CULT=CULT;
const CSS=`#intro{position:fixed;inset:0;z-index:95;background:#071019;overflow:auto;color:#e8eef2;font:15px/1.55 Inter,sans-serif}#intro .w{max-width:780px;margin:0 auto;padding:18px 16px 40px}
#intro h1{font:700 30px 'Barlow Condensed',sans-serif;letter-spacing:.04em;margin:6px 0}#intro h2{font:700 20px 'Barlow Condensed',sans-serif;letter-spacing:.06em;color:#3fd0ff;margin:22px 0 6px}#intro .tp{display:flex;gap:8px;flex-wrap:wrap;margin:14px 0}
#intro button{font:600 14px Inter,sans-serif;border-radius:10px;padding:10px 14px;border:1px solid #2b3d50;background:#11202e;color:#fff;cursor:pointer}#intro button.p{background:#e04ad8;border-color:#e04ad8}#intro button.g{background:#16a34a;border-color:#16a34a}
#intro .card{background:#0d1a26;border:1px solid #2b3d50;border-radius:12px;padding:12px 14px;margin:10px 0}#intro ol li,#intro ul li{margin:4px 0}#intro .op{display:block;width:100%;text-align:left;margin:6px 0}#intro .op.ok{background:#14532d;border-color:#22c55e}#intro .op.ko{background:#4c0519;border-color:#f43f5e}
#intro .skip{position:sticky;top:0;display:flex;justify-content:flex-end;gap:8px;background:#071019;padding:8px 0;z-index:2}#intro small{color:#9fb1c1}`;
function el(){ let d=document.getElementById('intro'); if(!d){ const st=document.createElement('style'); st.textContent=CSS; document.head.appendChild(st); d=document.createElement('div'); d.id='intro'; document.body.appendChild(d);
  d.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b) return; const a=b.dataset;
   if(a.x!=null) return close(); if(a.test!=null) return test(0,[]); if(a.home!=null) return home(); if(a.ac!=null){ close(); try{ const i=a.ac.startsWith('p')?PI(a.ac):ACI(a.ac); ACAD.open(i>=0?i:undefined); }catch(er){} return; }
   if(a.sim!=null){ close(); return; } if(a.qi!=null) answer(+a.qi); if(a.next!=null) test(T.i+1,T.ans); }); } return d; }
function close(){ const d=document.getElementById('intro'); if(d) d.hidden=true; try{ localStorage.setItem(K,'1'); }catch(e){} }
function home(){ const d=el(); d.hidden=false; d.scrollTop=0; d.innerHTML=`<div class="w"><div class="skip"><button type="button" data-sim>Passer et aller au simulateur ✈</button></div>
 <h1>✈ PLANE TRAJECTORIES · Introduction</h1><small>À lire avant d'aborder le simulateur et les cours (≈ 5 min). Vous pourrez la rouvrir à tout moment avec le bouton « 📘 Introduction ».</small>
 <h2>Pourquoi ce projet ?</h2><p>Comprendre comment vole réellement un avion, du dossier de vol préparé au sol jusqu'au parking d'arrivée, sans avoir besoin d'un simulateur coûteux ni d'un cockpit. Le projet est <b>pédagogique</b> : faire découvrir le métier de pilote, donner les bases théoriques, et pourquoi pas faire naître des vocations. Il suit les procédures, les textes et les ordres de grandeur réels (EASA, DGAC, OACI, manuels publics), en signalant toujours ce qui est simplifié ou estimé.</p>
 <div class="card"><b>Ce que le projet n'est pas</b> : un simulateur certifié, un cours agréé ou un manuel de vol. Il ne remplace ni une école de pilotage, ni un instructeur, ni les documents officiels de l'avion. Les valeurs chiffrées sont des ordres de grandeur.</div>
 <h2>Ce qu'il contient</h2><ul><li><b>Huit appareils</b> : Airbus A320, Airbus A350-900, Boeing 777, Learjet 60, Cessna 172 (avion école), hélicoptères H125, R44 et S-76.</li>
 <li><b>Des parcours guidés</b> : chaque vol est découpé en étapes numérotées (préparation, visite de l'avion, mise en route, roulage, décollage, croisière, approche, atterrissage), avec des actions qui se cochent quand vous les faites, et un mode automatique pour regarder le vol entier.</li>
 <li><b>Les documents de vol</b> (dossier, devis de masse, carburant, log de navigation, manifeste), modifiables et téléchargeables en PDF ou Word.</li>
 <li><b>L'Académie</b> : 8 parties de cours, du débutant à la théorie du brevet de pilote (PPL), aux calculs et à la sécurité des vols (ce que les accidents nous ont appris), avec des QCM.</li>
 <li><b>Des scénarios</b> de pannes et d'urgences, et l'atelier des systèmes de chaque appareil.</li></ul>
 <h2>Comment étudier efficacement</h2><ol>
 <li><b>Découvrir</b> : lancez un parcours en mode automatique et regardez le vol entier une première fois, sans chercher à tout comprendre.</li>
 <li><b>Les bases</b> : Académie partie 1 (cours débutant) puis partie 2 (le simulateur). Vocabulaire, forces du vol, instruments.</li>
 <li><b>Piloter guidé</b> : refaites le parcours en mode guidé, en réalisant vous-même chaque action. Commencez par le Cessna 172 (simple) ou l'A320 (le plus complet).</li>
 <li><b>La théorie</b> : partie 6 (les 9 matières du brevet PPL) et partie 5 (structures, moteurs, systèmes).</li>
 <li><b>Les calculs</b> : partie 7. Elle demande un bagage minimal en mathématiques (proportionnalité, pourcentages, conversions, angles, sinus et cosinus). C'est elle qui permet de remplir les documents de vol vous-même.</li>
 <li><b>Les urgences</b> : scénarios de pannes, puis Académie partie 8 (sécurité des vols : accidents et incidents qui ont changé les règles), examen blanc et QCM par matière.</li></ol>
 ${lastGauge()}<div class="card"><b>Où en êtes-vous ?</b> Un test de 60 questions, du niveau facile au niveau difficile (≈ 25 min) indique si vous pouvez aborder directement les calculs, ou par quoi commencer. <b>Il est facultatif et ne bloque rien</b> : le simulateur et tous les cours restent accessibles quel que soit le résultat.
 <div class="tp"><button type="button" class="p" data-test>▶ Faire le test de positionnement</button><button type="button" data-sim>Plus tard : aller au simulateur</button><button type="button" data-ac="p1">Ouvrir l'Académie</button></div></div>
 <small>Aucune donnée n'est envoyée : le résultat reste sur cet appareil.</small></div>`; }
const T={i:0,ans:[]}, ALL=()=>[...MATH.map(q=>q.concat('m')),...AERO.map(q=>q.concat('a'))];
// V10.38 (F10) : 30 questions par thème, du plus facile au plus difficile ; réponses dans un ordre mélangé (la bonne n'est plus toujours la première)
const MIX=n=>{ const a=[...Array(n).keys()]; for(let i=n-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
const LVL=q=>{ const L=q[4]==='m'?MATH:AERO, k=L.findIndex(x=>x[0]===q[0]), r=k/L.length; return r<1/3?'facile':r<2/3?'moyen':'difficile'; };
function test(i,ans){ T.i=i; T.ans=ans; const Qs=ALL(); if(i>=Qs.length) return result(); const q=Qs[i], d=el(); d.scrollTop=0;
 d.innerHTML=`<div class="w"><div class="skip"><button type="button" data-home>← Introduction</button><button type="button" data-sim>Arrêter et aller au simulateur ✈</button></div>
  <h2>Test de positionnement · ${i+1} / ${Qs.length} <small>· ${q[4]==='m'?'mathématiques utiles aux calculs':'sciences utiles au vol'} · niveau ${LVL(q)}</small></h2><div class="card"><p><b>${q[0]}</b></p>${MIX(q[1].length).map(j=>`<button type="button" class="op" data-qi="${j}">${q[1][j]}</button>`).join('')}<div id="iq-why"></div></div>
  <div style="display:flex;justify-content:space-between"><small>Progression du test</small><small>${Math.round(i/Qs.length*100)} %</small></div><div class="ig" style="height:10px;background:#1c2b3a;border-radius:5px"><div style="height:10px;width:${Math.round(i/Qs.length*100)}%;background:#3fd0ff;border-radius:5px;transition:width .4s"></div></div></div>`; }
function answer(j){ const Qs=ALL(), q=Qs[T.i], d=el(); if(T.ans.length>T.i) return; T.ans.push(j===q[2]?1:0);
 d.querySelectorAll('.op').forEach(b=>{ const k=+b.dataset.qi; b.disabled=true; if(k===q[2]) b.classList.add('ok'); else if(k===j) b.classList.add('ko'); });
 d.querySelector('#iq-why').innerHTML=`<p>${j===q[2]?'✓ Exact.':'✗ Pas tout à fait.'} ${q[3]}</p><button type="button" class="p" data-next>${T.i+1<Qs.length?'Question suivante →':'Voir mon résultat'}</button>`; }
// jauge de progression : barre remplie selon le score, seuil « prêt pour les calculs » marqué à 80 %
function gauge(lbl,v,n,seuil){ const pc=Math.round(v/n*100), col=pc>=80?'#22c55e':pc>=50?'#f59e0b':'#f43f5e';
 return `<div style="margin:10px 0"><div style="display:flex;justify-content:space-between"><b>${lbl}</b><b style="color:${col}">${v} / ${n} · ${pc} %</b></div>
 <div class="ig" style="position:relative;height:16px;background:#1c2b3a;border-radius:8px;margin-top:4px;overflow:hidden"><div style="height:16px;width:${pc}%;background:${col};border-radius:8px;transition:width .8s"></div>${seuil?`<div title="seuil" style="position:absolute;top:0;bottom:0;left:${seuil}%;width:2px;background:#fff"></div>`:''}</div>
 ${seuil?`<small>Trait blanc : seuil conseillé (${seuil} %) pour aborder les calculs.</small>`:''}</div>`; }
function lastGauge(){ try{ const r=JSON.parse(localStorage.getItem('sim-level')||'null'); if(!r) return ''; return `<div class="card"><b>Votre dernier positionnement</b>${gauge('Mathématiques',r.m,MATH.length,80)}${gauge('Sciences utiles au vol',r.a,AERO.length)}${gauge('Global',r.m+r.a,MATH.length+AERO.length)}</div>`; }catch(e){ return ''; } }
function result(){ const m=T.ans.slice(0,MATH.length).reduce((s,x)=>s+x,0), a=T.ans.slice(MATH.length).reduce((s,x)=>s+x,0), d=el(); d.scrollTop=0;
 try{ localStorage.setItem('sim-level',JSON.stringify({m,a,t:Date.now()})); }catch(e){}
 const mOK=m>=Math.ceil(MATH.length*0.8), mMid=m>=Math.ceil(MATH.length*0.5)&&!mOK, aOK=a>=Math.ceil(AERO.length*0.8);   // V10.38 : seuils en pourcentage (80 % / 50 %)
 const rec=[]; if(!aOK) rec.push(['p1','Commencer par l\'Académie partie 1 : cours débutant (vocabulaire, forces, instruments)']); else rec.push(['p2','Revoir rapidement la partie 2 : le cours théorique du simulateur']);
 if(mOK) rec.push(['p7','Vous pouvez aborder directement la partie 7 : les calculs aéronautiques']); else if(mMid) rec.push(['c1','Partie 7 : commencer par les modules 1 à 3 (unités, atmosphère, vitesses), en refaisant les exemples à la main']); else rec.push(['c1','Avant les calculs : revoir la proportionnalité, les pourcentages et les conversions (module 1 de la partie 7), puis revenir au test']);
 rec.push(['p6','Théorie du brevet de pilote (PPL) : partie 6, une matière à la fois']);
 d.innerHTML=`<div class="w"><div class="skip"><button type="button" data-home>← Introduction</button></div><h1>Votre positionnement</h1>
  <div class="card">${gauge('Mathématiques utiles aux calculs',m,MATH.length,80)}${gauge('Sciences utiles au vol',a,AERO.length)}${gauge('Niveau global',m+a,MATH.length+AERO.length)}</div>
  <div class="card"><p><b>Mathématiques : </b>${mOK?'bagage suffisant pour la partie 7.':mMid?'bases présentes : abordez les calculs progressivement, avec les exemples.':'quelques révisions de calcul vous rendront la partie 7 beaucoup plus facile.'}</p>
  <p><b>Sciences utiles au vol : </b>${aOK?'les bases sont là.':'commencez par le cours débutant : tout le reste s\'appuie dessus.'}</p></div>
  <h2>Parcours conseillé</h2>${rec.map(([id,t],i)=>`<div class="card">${i+1}. ${t}<div class="tp"><button type="button" data-ac="${id}">Ouvrir</button></div></div>`).join('')}
  <div class="card">Et dans tous les cas : <b>regardez un vol complet en mode automatique</b>, puis refaites-le en mode guidé. <div class="tp"><button type="button" class="g" data-sim>✈ Aller au simulateur</button><button type="button" data-test>Refaire le test</button></div></div>
  <small>Ce résultat est indicatif : il ne bloque aucun contenu.</small></div>`; }
window.INTRO={open:home,test:()=>{ el().hidden=false; test(0,[]); }};
// bouton dans la barre d'outils et dans le menu
function addBtns(){ const bar=document.getElementById('bar'), help=document.getElementById('b-help'); if(bar&&help&&!document.getElementById('b-intro')){ const b=document.createElement('button'); b.type='button'; b.id='b-intro'; b.textContent='📘 Introduction'; b.onclick=home; help.before(b); }
 const m=document.getElementById('menu'); if(m&&!m.hidden&&!document.getElementById('m-intro')){ const box=m.querySelector('.box')||m; const b=document.createElement('button'); b.type='button'; b.id='m-intro'; b.textContent='📘 Introduction au projet et test de niveau'; b.style.cssText='display:block;width:100%;margin:0 0 10px;padding:11px;border-radius:10px;border:1px solid #3fd0ff;background:#0d2232;color:#fff;font:600 14px Inter,sans-serif;cursor:pointer'; b.onclick=home; box.prepend(b); } }
setInterval(addBtns,800);
// premier lancement : l'introduction s'affiche avant le simulateur
let seen=false; try{ seen=localStorage.getItem(K)==='1'; }catch(e){ seen=true; } if(!seen) setTimeout(home,400);
})();
