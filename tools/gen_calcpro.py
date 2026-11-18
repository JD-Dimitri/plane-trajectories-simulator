#!/usr/bin/env python3
"""Génère src/addons/calcpro.js : Académie partie 9 « Calculs du pilote de ligne » (F11).
Chaque réponse est CALCULÉE ici par la formule du module (pas de valeur tapée à la main) ; les distracteurs sont des erreurs
classiques (mauvaise unité, oubli d'un terme, signe inversé). La position de la bonne réponse varie de façon reproductible."""
import json, math, sys

def fr(x, nd=0):
    s = f"{x:,.{nd}f}".replace(',', ' ').replace('.', ',').replace('-', '−')
    return '0' if s in ('−0',) else s
OUT = sys.argv[1]

rot = [0]
def Q(q, good, bad, why):
    """good : texte de la bonne réponse ; bad : 3 distracteurs ; position de la bonne réponse : rotation reproductible."""
    bad = [b for b in bad if b != good][:3]
    k = rot[0] % 4; rot[0] += 3
    opts = bad[:k] + [good] + bad[k:]
    return {'q': q, 'o': opts, 'c': k, 'why': why}

F = lambda t: f"<div class=\"lf\">{t}</div>"
EX = lambda n, t: f"<div class=\"lx\"><b>Exemple corrigé {n}</b><br>{t}</div>"
DOC = lambda ids: '<div class="ld"><b>📄 Documents à remplir avec ce calcul :</b> ' + ' '.join(f'<button type="button" class="mini" data-docopen="{i}">{n}</button>' for i, n in ids) + '</div>'
D = {'ofp': 'OFP / log de navigation', 'fuel': 'Bilan carburant', 'loadsheet': 'Devis de masse et centrage', 'perf': 'Performances (TODC)', 'fpl': 'Plan de vol OACI',
     'metar': 'METAR / TAF', 'wintem': 'Vents et températures', 'notoc': 'NOTOC et chargement', 'route': 'Carte de route', 'app': 'Carte d\'approche', 'plan': 'Plan de vol (check-list)'}
docs = lambda *k: DOC([(i, D[i]) for i in k])
MODS = []
def mod(i, t, h, quiz):
    assert len(quiz) == 10, (t, len(quiz))
    MODS.append({'id': f'L{i}', 't': t, 'h': h, 'quiz': quiz})

# ---------- 1. Unités et conversions ----------
q = []
q.append(Q('1 NM vaut :', '1 852 m', ['1 609 m', '1 000 m', '6 076 m'], '1 mille nautique = 1 852 m (une minute d\'arc de latitude).'))
q.append(Q('3 000 m en pieds (1 m = 3,281 ft) :', fr(3000*3.281)+' ft', ['914 ft', fr(3000*3.281/10)+' ft', '30 000 ft'], f'3 000 × 3,281 = {fr(3000*3.281)} ft.'))
q.append(Q('20 000 kg en livres (1 kg = 2,205 lb) :', fr(20000*2.205)+' lb', [fr(20000/2.205)+' lb', '20 000 lb', fr(20000*0.4536)+' lb'], f'20 000 × 2,205 = {fr(20000*2.205)} lb. Diviser au lieu de multiplier est l\'erreur classique.'))
q.append(Q('450 kt en km/h :', fr(450*1.852)+' km/h', [fr(450/1.852)+' km/h', fr(450*1.609)+' km/h', '450 km/h'], f'450 × 1,852 = {fr(450*1.852)} km/h.'))
q.append(Q('10 000 l de JET A-1 à 0,80 kg/l pèsent :', '8 000 kg', ['12 500 kg', '10 000 kg', '800 kg'], '10 000 × 0,80 = 8 000 kg.'))
q.append(Q('On doit embarquer 18 000 kg de JET A-1 à 0,79 kg/l. Volume à commander ?', fr(18000/0.79)+' l', [fr(18000*0.79)+' l', '18 000 l', fr(18000/0.79/1000,1)+' l'], f'Volume = masse / masse volumique = 18 000 / 0,79 = {fr(18000/0.79)} l.'))
q.append(Q('29,92 inHg en hPa (1 inHg = 33,864 hPa) :', fr(29.92*33.864,1)+' hPa', ['1 000,0 hPa', fr(29.92/33.864*1000,1)+' hPa', '992,0 hPa'], f'29,92 × 33,864 = {fr(29.92*33.864,1)} hPa : la pression standard.'))
q.append(Q('−40 °C en °F (°F = °C × 9/5 + 32) :', '−40 °F', ['−8 °F', '−72 °F', '0 °F'], '−40 × 1,8 + 32 = −40 : les deux échelles se croisent à −40.'))
q.append(Q('Le camion annonce 22 000 l avitaillés à 0,80 kg/l, mais l\'équipage avait demandé 22 000 kg. Combien de kg manquent ?', fr(22000-22000*0.8)+' kg', ['0 kg', fr(22000/0.8-22000)+' kg', '2 200 kg'], f'22 000 l × 0,80 = {fr(22000*0.8)} kg reçus ; il manque {fr(22000-22000*0.8)} kg. Vérification croisée bon d\'avitaillement / jauges : erreur d\'unité de l\'accident de 1983 (Air Canada 143).'))
q.append(Q('Jauges : 9 500 kg avant avitaillement, 21 400 kg après ; bon : 15 100 l à 0,79 kg/l. Écart entre jauges et bon ?', fr(15100*0.79-(21400-9500))+' kg', ['0 kg', fr(15100-(21400-9500))+' kg', fr((21400-9500)-15100*0.8)+' kg'], f'Avitaillé selon le bon : 15 100 × 0,79 = {fr(15100*0.79)} kg ; selon les jauges : 21 400 − 9 500 = {fr(21400-9500)} kg ; écart {fr(15100*0.79-(21400-9500))} kg, à comparer à la tolérance de l\'exploitant.'))
mod(1, 'Formule 1 — Unités et conversions',
 '<p>Un pilote de ligne manipule chaque jour des <b>milles nautiques</b>, des <b>pieds</b>, des <b>nœuds</b>, des <b>kilogrammes</b> (parfois des livres), des <b>litres</b> de carburant et des <b>hectopascals</b> (parfois des inHg). Toute conversion se fait avec un facteur, et toute erreur d\'unité est une erreur de sécurité.</p>'
 + F('1 NM = 1 852 m · 1 ft = 0,3048 m (1 m = 3,281 ft) · 1 kt = 1,852 km/h · 1 kg = 2,205 lb · 1 inHg = 33,864 hPa<br>masse carburant (kg) = volume (l) × masse volumique (kg/l) · JET A-1 ≈ 0,775 à 0,84 kg/l selon la température · °F = °C × 9/5 + 32 · K = °C + 273,15')
 + EX(1, 'Avitaillement : il faut 15 000 kg. Masse volumique annoncée 0,80 kg/l. Volume = 15 000 / 0,80 = <b>18 750 l</b>.')
 + EX(2, 'Une STAR impose 9 000 ft : 9 000 × 0,3048 = <b>2 743 m</b>.')
 + EX(3, 'Vérification après avitaillement : jauges 4 200 kg → 19 300 kg, bon 19 000 l à 0,795 : bon = 15 105 kg, jauges = 15 100 kg : écart de 5 kg, cohérent.')
 + docs('fuel', 'loadsheet'), q)

# ---------- 2. Atmosphère type et altimétrie ----------
def isa(h): return 15 - 1.98*h/1000 if h <= 36089 else -56.5
q = []
q.append(Q('Température ISA au niveau de la mer :', '15 °C', ['0 °C', '20 °C', '−56,5 °C'], 'Atmosphère type OACI : 15 °C et 1 013,25 hPa au niveau de la mer.'))
q.append(Q('Décroissance de la température ISA dans la troposphère :', '≈ 2 °C par 1 000 ft', ['≈ 1 °C par 1 000 ft', '≈ 6,5 °C par 1 000 ft', '≈ 3 °C par 100 ft'], '1,98 °C par 1 000 ft (6,5 °C par km) jusqu\'à la tropopause.'))
q.append(Q('Température ISA au FL100 :', fr(isa(10000),1)+' °C', ['−5,0 °C', '5,0 °C', fr(15-6.5*10,1)+' °C'], f'15 − 1,98 × 10 = {fr(isa(10000),1)} °C.'))
q.append(Q('Température ISA au FL390 :', '−56,5 °C', [fr(15-1.98*39,1)+' °C', '−45,0 °C', '−65,0 °C'], 'Au-dessus de la tropopause (36 089 ft en ISA), la température reste à −56,5 °C.'))
q.append(Q('Au FL350, on relève −45 °C. Écart ISA ?', 'ISA +' + fr(-45-isa(35000),0), ['ISA −' + fr(-45-isa(35000),0), 'ISA +0', 'ISA +45'], f'ISA au FL350 = {fr(isa(35000),1)} °C ; écart = −45 − ({fr(isa(35000),1)}) ≈ +{fr(-45-isa(35000),0)} °C.'))
pa = 1200 + (1013-998)*28
q.append(Q('Aérodrome à 1 200 ft, QNH 998 hPa (1 hPa ≈ 28 ft). Altitude-pression ?', fr(pa)+' ft', [fr(1200-(1013-998)*28)+' ft', '1 200 ft', fr(1200+(1013-998)*10)+' ft'], f'(1 013 − 998) × 28 = 420 ft ; 1 200 + 420 = {fr(pa)} ft. Pression basse : l\'altitude-pression est plus haute que l\'altitude.'))
dev = 30 - (15 - 1.98*pa/1000); da = pa + 120*dev
q.append(Q(f'Même aérodrome (altitude-pression {fr(pa)} ft), température 30 °C. Altitude-densité (≈ 120 ft par °C d\'écart ISA) ?', '≈ '+fr(round(da,-1))+' ft', ['≈ '+fr(pa)+' ft', '≈ '+fr(round(pa+120*30,-1))+' ft', '≈ '+fr(round(pa-120*dev,-1))+' ft'], f'ISA à {fr(pa)} ft = {fr(15-1.98*pa/1000,1)} °C ; écart = {fr(dev,1)} °C ; altitude-densité ≈ {fr(pa)} + 120 × {fr(dev,1)} ≈ {fr(round(da,-1))} ft : l\'avion décolle comme s\'il était à cette altitude.'))
q.append(Q('Altimètre calé au QFE, à l\'atterrissage, il indique :', '0 ft (la hauteur)', ['L\'altitude du terrain', 'Le niveau de vol', '1 013 ft'], 'QFE = pression au seuil : l\'altimètre donne la hauteur au-dessus du terrain.'))
err = (1013-993)*28
q.append(Q('En croisière à basse altitude, on oublie de passer du 1013 au QNH 993 en descente. L\'avion est en réalité :', f'≈ {fr(err)} ft plus bas qu\'indiqué', [f'≈ {fr(err)} ft plus haut qu\'indiqué', 'À l\'altitude indiquée', '≈ 20 ft plus bas'], f'Calage trop fort de 20 hPa : l\'altimètre surestime de 20 × 28 ≈ {fr(err)} ft. « Des hautes vers les basses pressions : attention en bas ».'))
corr = 3000*0.04*30/10
q.append(Q('Aérodrome au niveau de la mer, −15 °C au sol (ISA −30). Hauteur minimale à respecter : 3 000 ft. Correction de froid (≈ 4 % de la hauteur par 10 °C sous ISA) ?', '≈ +'+fr(corr)+' ft', ['≈ +120 ft', '≈ −'+fr(corr)+' ft', 'Aucune'], f'3 000 × 4 % × 3 = {fr(corr)} ft à ajouter : par grand froid, l\'avion est plus bas que ce qu\'indique son altimètre.'))
mod(2, 'Formule 2 — Atmosphère type (ISA) et altimétrie',
 '<p>L\'atmosphère réelle se compare à l\'<b>atmosphère type OACI (ISA)</b>. L\'écart ISA change les performances (moteurs, portance) et les altitudes vraies.</p>'
 + F('T<sub>ISA</sub>(°C) = 15 − 1,98 × h(ft)/1 000 (jusqu\'à 36 089 ft, puis −56,5 °C) · écart ISA = T réelle − T<sub>ISA</sub><br>altitude-pression ≈ altitude + (1 013 − QNH) × 28 ft · altitude-densité ≈ altitude-pression + 120 × écart ISA<br>correction de froid ≈ hauteur × 4 % par 10 °C sous ISA (règle empirique ; tables OACI PANS-OPS pour l\'exploitation)')
 + EX(1, 'FL370, −50 °C : ISA = −56,5 °C → écart <b>ISA +6,5</b> : poussée disponible et plafond un peu plus bas.')
 + EX(2, 'Aérodrome 2 000 ft, QNH 1 023 : altitude-pression = 2 000 − 280 = <b>1 720 ft</b>.')
 + EX(3, 'Même terrain à 35 °C : ISA à 1 720 ft ≈ 11,6 °C, écart ≈ +23 °C ; altitude-densité ≈ 1 720 + 2 800 = <b>≈ 4 500 ft</b> : distances de décollage nettement plus longues.')
 + docs('metar', 'perf', 'wintem'), q)

# ---------- 3. Vitesses : CAS, TAS, Mach ----------
def a_kt(tc): return 38.94*math.sqrt(tc+273.15)
q = []
q.append(Q('Vitesse du son en ISA au niveau de la mer (a = 38,94 √T(K)) :', fr(a_kt(15))+' kt', ['340 kt', fr(a_kt(15)*1.852)+' kt', '573 kt'], f'38,94 × √288,15 = {fr(a_kt(15))} kt (340 m/s).'))
q.append(Q('Le nombre de Mach est :', 'TAS / vitesse du son', ['CAS / vitesse du son', 'Vitesse sol / vitesse du son', 'IAS / 661'], 'M = vitesse vraie / vitesse du son locale.'))
q.append(Q('Vitesse du son au FL350 en ISA (−54,3 °C) :', fr(a_kt(-54.3))+' kt', [fr(a_kt(15))+' kt', fr(a_kt(-56.5)+20)+' kt', '600 kt'], f'38,94 × √218,85 = {fr(a_kt(-54.3))} kt.'))
q.append(Q('Mach 0,82 au FL350 ISA : vitesse vraie ?', fr(0.82*a_kt(-54.3))+' kt', [fr(0.82*a_kt(15))+' kt', fr(0.82*600)+' kt', '820 kt'], f'0,82 × {fr(a_kt(-54.3))} = {fr(0.82*a_kt(-54.3))} kt.'))
q.append(Q('Règle approchée sous FL100 : TAS ≈ CAS × (1 + 2 % par 1 000 ft). 200 kt CAS à 8 000 ft :', fr(200*1.16)+' kt', ['200 kt', fr(200*1.08)+' kt', fr(200*1.6)+' kt'], '8 × 2 % = 16 % : 200 × 1,16 = 232 kt.'))
q.append(Q('En montée à vitesse indiquée constante, le Mach :', 'Augmente', ['Diminue', 'Reste constant', 'S\'annule à la tropopause'], 'La TAS augmente et la vitesse du son baisse : le Mach monte. D\'où la transition CAS → Mach en montée.'))
q.append(Q('TAS 480 kt, vent de face 60 kt : vitesse sol ?', '420 kt', ['540 kt', '480 kt', '360 kt'], 'GS = TAS − composante de face = 480 − 60 = 420 kt.'))
t = -45; m = 0.85; tas = m*a_kt(t)
q.append(Q(f'Mach 0,85 à −45 °C : vitesse vraie ?', fr(tas)+' kt', [fr(0.85*a_kt(-56.5))+' kt', fr(0.85*a_kt(15))+' kt', fr(tas*1.852)+' kt'], f'a = 38,94 × √228,15 = {fr(a_kt(t))} kt ; TAS = 0,85 × {fr(a_kt(t))} = {fr(tas)} kt. Plus chaud = son plus rapide = plus de TAS à Mach égal.'))
q.append(Q('Même Mach 0,85, l\'air passe de −56,5 °C à −46,5 °C. La TAS :', f'Augmente d\'environ {fr(0.85*(a_kt(-46.5)-a_kt(-56.5)))} kt', ['Ne change pas', f'Baisse d\'environ {fr(0.85*(a_kt(-46.5)-a_kt(-56.5)))} kt', 'Augmente de 10 kt exactement'], f'TAS = 0,85 × (a₂ − a₁) = 0,85 × ({fr(a_kt(-46.5))} − {fr(a_kt(-56.5))}) ≈ +{fr(0.85*(a_kt(-46.5)-a_kt(-56.5)))} kt.'))
gs = 0.84*a_kt(-56.5) + 35; tmin = 2400/gs*60
q.append(Q('Mach 0,84 au FL380 ISA (−56,5 °C), vent arrière 35 kt, étape de 2 400 NM. Durée ?', f'{int(tmin//60)} h {int(round(tmin%60)):02d}', [f'{int((2400/(0.84*a_kt(-56.5))*60)//60)} h {int(round((2400/(0.84*a_kt(-56.5))*60)%60)):02d}', f'{int((2400/(0.84*a_kt(-56.5)-35)*60)//60)} h {int(round((2400/(0.84*a_kt(-56.5)-35)*60)%60)):02d}', '4 h 00'], f'TAS = 0,84 × {fr(a_kt(-56.5))} = {fr(0.84*a_kt(-56.5))} kt ; GS = {fr(gs)} kt ; t = 2 400 / {fr(gs)} = {fr(2400/gs,2)} h.'))
mod(3, 'Formule 3 — Vitesses : CAS, TAS, Mach, vitesse sol',
 '<p><b>CAS</b> : vitesse lue (corrigée), qui fixe la portance et les limites structurales. <b>TAS</b> : vitesse par rapport à l\'air. <b>Mach</b> : TAS divisée par la vitesse du son, qui ne dépend que de la température. <b>GS</b> : TAS combinée au vent.</p>'
 + F('a (kt) = 38,94 × √T(K) · M = TAS / a · TAS ≈ CAS × (1 + 0,02 × h/1 000) sous FL100 (règle) · GS = TAS ± composante de vent')
 + EX(1, 'FL330, −51 °C : a = 38,94 × √222,15 = 580 kt ; à Mach 0,78 → TAS = <b>452 kt</b>.')
 + EX(2, 'Vent de face 40 kt → GS = 412 kt ; 1 000 NM en <b>2 h 26</b>.')
 + EX(3, 'Approche : 160 kt CAS à 3 000 ft → TAS ≈ 160 × 1,06 = <b>170 kt</b>.')
 + docs('ofp', 'wintem'), q)

# ---------- 4. Triangle des vitesses ----------
def tri(track, tas, wd, ws):
    th = math.radians(wd - track); wca = math.degrees(math.asin(ws*math.sin(th)/tas)); gs = tas*math.cos(math.radians(wca)) - ws*math.cos(th)
    return wca, gs, (track + wca) % 360
q = []
q.append(Q('Le vent « 270/30 » vient :', 'De l\'ouest, 30 kt', ['Vers l\'ouest, 30 kt', 'Du sud, 27 kt', 'De l\'est, 30 kt'], 'La direction donnée est celle d\'où vient le vent.'))
q.append(Q('Vent de travers venant de la droite : la dérive pousse l\'avion vers :', 'La gauche ; on corrige le cap à droite', ['La droite ; on corrige à gauche', 'L\'avant', 'Nulle part'], 'On met le nez « dans le vent » : cap = route + correction côté vent.'))
q.append(Q('Dérive maximale approchée (règle Xmax = 60 × Vw / TAS) : vent 40 kt, TAS 400 kt :', '6°', ['10°', '4°', '0,1°'], '60 × 40 / 400 = 6°.'))
w, g, h = tri(90, 450, 180, 50)
q.append(Q('Route 090°, TAS 450 kt, vent 180/50. Correction de dérive ?', f'{fr(w,1)}° (cap ≈ {int(round(h)):03d}°)', [f'{fr(-w,1)}° (cap ≈ {int(round(90-w)):03d}°)', '0°', '50°'], f'sin(correction) = 50 × sin(180 − 90) / 450 → {fr(w,1)}° ; cap = 090 + {fr(w,1)} ≈ {int(round(h)):03d}°.'))
q.append(Q('Même cas : vitesse sol ?', f'{fr(g)} kt', ['450 kt', '500 kt', '400 kt'], f'GS = 450 × cos({fr(w,1)}°) − 50 × cos 90° = {fr(g)} kt : vent de travers pur, la GS baisse un peu.'))
w, g, h = tri(220, 480, 300, 80)
q.append(Q('Route 220°, TAS 480 kt, vent 300/80. Cap à tenir ?', f'{int(round(h)):03d}°', [f'{int(round(220-w)):03d}°', '220°', '300°'], f'Angle vent/route 80° ; correction {fr(w,1)}° ; cap = {int(round(h)):03d}°.'))
q.append(Q('Même cas : vitesse sol ?', f'{fr(g)} kt', [f'{fr(480+80)} kt', f'{fr(480-80)} kt', '480 kt'], f'GS = 480 × cos({fr(w,1)}°) − 80 × cos 80° = {fr(g)} kt.'))
w, g, h = tri(45, 250, 20, 60)
q.append(Q('Montée initiale : route 045°, TAS 250 kt, vent 020/60. Vitesse sol ?', f'{fr(g)} kt', ['310 kt', '250 kt', '190 kt'], f'Vent à 25° de face à gauche : correction {fr(w,1)}°, GS = {fr(g)} kt.'))
w, g, h = tri(160, 470, 340, 90)
q.append(Q('Route 160°, TAS 470 kt, vent 340/90 (plein arrière). Durée pour 1 200 NM ?', f'{int(1200/g)} h {int(round((1200/g%1)*60)):02d}', [f'{int(1200/470)} h {int(round((1200/470%1)*60)):02d}', f'{int(1200/(470-90))} h {int(round((1200/(470-90)%1)*60)):02d}', '3 h 00'], f'Vent arrière pur : GS = 470 + 90 = {fr(g)} kt ; 1 200 / {fr(g)} = {fr(1200/g,2)} h.'))
w1, g1, _ = tri(0, 460, 30, 70); w2, g2, _ = tri(180, 460, 30, 70)
q.append(Q('Aller-retour 900 NM sur un axe 000° / 180°, TAS 460 kt, vent 030/70. Temps total ?', f'{fr(900/g1+900/g2,2)} h', [f'{fr(1800/460,2)} h', f'{fr(900/(460-70)+900/(460+70),2)} h', f'{fr(1800/(460-70),2)} h'], f'Aller GS {fr(g1)} kt ({fr(900/g1,2)} h), retour GS {fr(g2)} kt ({fr(900/g2,2)} h) : total {fr(900/g1+900/g2,2)} h. Le vent allonge toujours un aller-retour.'))
mod(4, 'Formule 4 — Triangle des vitesses : dérive, cap, vitesse sol',
 '<p>Le vent déplace la masse d\'air : pour suivre une <b>route</b>, l\'avion tient un <b>cap</b> corrigé de la dérive, et sa <b>vitesse sol</b> change.</p>'
 + F('θ = direction du vent − route · sin(correction) = Vw × sin θ / TAS · cap = route + correction<br>GS = TAS × cos(correction) − Vw × cos θ · règle : dérive max ≈ 60 × Vw / TAS (degrés)')
 + EX(1, 'Route 270, TAS 440, vent 300/60 : θ = 30°, correction = asin(60 × 0,5 / 440) = <b>+3,9°</b>, cap <b>274°</b>, GS = 440 × 0,998 − 60 × 0,866 = <b>387 kt</b>.')
 + EX(2, 'Route 090, vent 090/40 (plein face) : correction nulle, GS = TAS − 40.')
 + EX(3, 'Règle rapide : vent de travers 30 kt, TAS 300 kt → dérive max ≈ <b>6°</b>.')
 + docs('ofp', 'wintem', 'route'), q)

# ---------- 5. Temps, distance, consommation ----------
q = []
q.append(Q('Distance 300 NM, vitesse sol 400 kt. Temps ?', '45 min', ['1 h 20', '40 min', '1 h 33'], 't = 300 / 400 = 0,75 h = 45 min.'))
q.append(Q('Vitesse sol 420 kt pendant 1 h 30. Distance ?', '630 NM', ['280 NM', '420 NM', '700 NM'], '420 × 1,5 = 630 NM.'))
q.append(Q('Consommation 2 400 kg/h pendant 2 h 15. Carburant ?', '5 400 kg', ['4 800 kg', '5 040 kg', '2 415 kg'], '2 400 × 2,25 = 5 400 kg.'))
q.append(Q('Distance spécifique (NM par kg) à GS 450 kt et 2 500 kg/h :', '0,18 NM/kg', ['5,56 NM/kg', '1,8 NM/kg', '0,018 NM/kg'], '450 / 2 500 = 0,18 NM/kg.'))
q.append(Q('1 850 NM à 460 kt de vitesse sol. Durée ?', f'{int(1850/460)} h {int(round(1850/460%1*60)):02d}', ['4 h 00', '3 h 50', '4 h 40'], f'1 850 / 460 = {fr(1850/460,2)} h.'))
q.append(Q('Départ 21:40 UTC, 2 h 50 de vol. Arrivée UTC ?', '00:30 UTC (lendemain)', ['23:90 UTC', '00:30 UTC (même jour)', '23:30 UTC'], '21:40 + 2:50 = 24:30, soit 00:30 le lendemain.'))
q.append(Q('Point de report à 312 NM, il reste 7 800 kg à 2 600 kg/h et GS 445 kt. Carburant restant au point ?', fr(7800-312/445*2600)+' kg', [fr(7800-312/2600*445)+' kg', '5 200 kg', fr(7800-312/445*2000)+' kg'], f't = 312 / 445 = {fr(312/445,3)} h ; consommé {fr(312/445*2600)} kg ; reste {fr(7800-312/445*2600)} kg.'))
q.append(Q('Prévu : 4 h 10 à 5 200 kg/h. Réel : vent de face, GS −8 %. Carburant supplémentaire ?', '≈ '+fr(round(4.1667*5200*(1/0.92-1),-1))+' kg', ['0 kg', '≈ 1 730 kg', '≈ 416 kg'], f'Temps × 1/0,92 : 4,17 h → {fr(4.1667/0.92,2)} h ; écart {fr(4.1667/0.92-4.1667,2)} h × 5 200 ≈ {fr(round(4.1667*5200*(1/0.92-1),-1))} kg.'))
q.append(Q('Croisière 3 étapes : 420 NM à 450 kt, 380 NM à 470 kt, 510 NM à 430 kt. Temps total ?', f'{int(420/450+380/470+510/430)} h {int(round((420/450+380/470+510/430)%1*60)):02d}', ['2 h 50', '3 h 05', '2 h 40'], f'{fr(420/450,3)} + {fr(380/470,3)} + {fr(510/430,3)} = {fr(420/450+380/470+510/430,3)} h.'))
fuel = 6200*(1/0.18)
q.append(Q('Il reste 6 200 kg utilisables au-dessus de la réserve, distance spécifique 0,18 NM/kg. Distance encore franchissable ?', fr(6200*0.18)+' NM', [fr(6200/0.18)+' NM', '620 NM', fr(6200*0.018)+' NM'], f'6 200 × 0,18 = {fr(6200*0.18)} NM.'))
mod(5, 'Formule 5 — Temps, distance, consommation',
 '<p>Trois grandeurs liées : <b>distance = vitesse sol × temps</b>, <b>carburant = consommation horaire × temps</b>, <b>distance spécifique = vitesse sol / consommation</b>. Elles remplissent l\'OFP point par point.</p>'
 + F('t = D / GS · D = GS × t · carburant = FF × t · distance spécifique = GS / FF (NM/kg) · heure prévue = heure + t')
 + EX(1, 'Étape 2 100 NM, GS 455 kt → t = <b>4 h 37</b> ; FF 5 400 kg/h → <b>24 930 kg</b>.')
 + EX(2, 'Point de report : prévu 12:42, passé 12:47 : retard de 5 min à reporter sur les ETA suivantes.')
 + EX(3, 'Contrôle carburant : prévu 31 200 kg au point, réel 30 600 kg → écart −600 kg, à surveiller (fuite ? vent ?).')
 + docs('ofp', 'fuel', 'fpl'), q)

# ---------- 6. Bilan carburant (transport public) ----------
def fuelplan(taxi, trip, alt, final, add=0, extra=0):
    cont = max(0.05*trip, 0); tot = taxi + trip + cont + alt + final + add + extra
    return cont, tot
q = []
q.append(Q('La réserve finale d\'un avion à turbine (EASA, transport public) vaut :', '30 min d\'attente à 1 500 ft au-dessus du dégagement', ['10 % de l\'étape', '45 min de croisière', '1 h de vol'], 'CAT.OP.MPA.181 et AMC : 30 min à 1 500 ft (avions à turbine).'))
q.append(Q('Le carburant de route (contingency) usuel vaut :', '5 % du carburant d\'étape (avec un minimum)', ['10 % du total', '30 min', 'Rien'], 'En général 5 % de l\'étape, et au moins l\'équivalent de 5 min d\'attente (AMC1 CAT.OP.MPA.181).'))
q.append(Q('Ordre des termes du bilan :', 'Roulage + étape + route + dégagement + réserve finale + additionnel + supplémentaire', ['Étape + réserve seulement', 'Dégagement + réserve finale', 'Roulage + étape'], 'C\'est l\'ordre de l\'OFP et du bilan carburant.'))
c, tot = fuelplan(200, 6000, 1500, 1100)
q.append(Q('Roulage 200 kg, étape 6 000 kg, route 5 %, dégagement 1 500 kg, réserve finale 1 100 kg. Carburant minimum ?', fr(tot)+' kg', [fr(tot-c)+' kg', fr(tot-200)+' kg', fr(tot+600)+' kg'], f'Route = 5 % × 6 000 = {fr(c)} kg ; total = 200 + 6 000 + {fr(c)} + 1 500 + 1 100 = {fr(tot)} kg.'))
q.append(Q('Carburant au décollage (TOF) avec ce bilan ?', fr(tot-200)+' kg', [fr(tot)+' kg', fr(tot-1100)+' kg', '6 000 kg'], 'TOF = carburant au bloc − roulage.'))
q.append(Q('Réserve finale : consommation en attente 2 400 kg/h. Combien ?', '1 200 kg', ['2 400 kg', '600 kg', '720 kg'], '30 min = 0,5 h : 2 400 × 0,5 = 1 200 kg.'))
c, tot = fuelplan(300, 18400, 3200, 2600, extra=1000)
q.append(Q('Long-courrier : roulage 300, étape 18 400, route 5 %, dégagement 3 200, réserve finale 2 600, supplément commandant 1 000 kg. Bloc ?', fr(tot)+' kg', [fr(tot-1000)+' kg', fr(tot-c)+' kg', fr(tot+920)+' kg'], f'Route = {fr(c)} kg ; bloc = {fr(tot)} kg.'))
q.append(Q('Capacité réservoirs 20 000 kg, besoin calculé 21 400 kg. Que faire ?', 'Vol impossible tel quel : escale, dégagement plus proche ou charge réduite si c\'est la masse qui limite', ['Partir quand même', 'Supprimer la réserve finale', 'Réduire le roulage'], 'Le minimum réglementaire ne se négocie pas : on change le plan (escale technique, dégagement plus proche).'))
c, tot = fuelplan(250, 9800, 2100, 1350)
landing = tot - 250 - 9800
q.append(Q('Bloc 13 990 kg (roulage 250, étape 9 800). Carburant prévu à l\'atterrissage à destination ?', fr(landing)+' kg', [fr(tot-9800)+' kg', '1 350 kg', fr(2100+1350)+' kg'], f'Carburant à l\'atterrissage = bloc − roulage − étape = {fr(landing)} kg (= route + dégagement + réserve finale).'))
need_min = 2100 + 1350
q.append(Q('En approche à destination avec ce plan, il reste 3 300 kg. Le seuil « minimum fuel » est dégagement + réserve finale = 3 450 kg. Que fait l\'équipage ?', 'Déclare « MINIMUM FUEL » puis « MAYDAY FUEL » s\'il risque d\'atterrir sous la réserve finale', ['Rien', 'Remise de gaz pour attendre', 'Coupe un moteur'], 'CAT.OP.MPA.281 : « MINIMUM FUEL » quand toute attente supplémentaire ferait atterrir avec moins que la réserve prévue ; « MAYDAY, MAYDAY, MAYDAY, FUEL » si l\'atterrissage se ferait sous la réserve finale.'))
mod(6, 'Formule 6 — Bilan carburant d\'un avion de ligne',
 '<p>Le carburant minimum de transport public (EASA <b>CAT.OP.MPA.181</b> et ses AMC) se construit terme par terme. Le commandant peut ajouter du <b>supplémentaire</b> (discretionary).</p>'
 + F('Bloc = roulage + étape (trip) + route (≈ 5 % de l\'étape, min. 5 min) + dégagement + réserve finale (30 min à 1 500 ft, turbine) + additionnel + supplémentaire<br>TOF = bloc − roulage · carburant à l\'atterrissage prévu = TOF − étape')
 + EX(1, '<b>Paris-CDG → La Réunion en A350-900</b> (≈ 9 400 km soit 5 075 NM, GS moyenne 485 kt, 5 800 kg/h [ESTIMÉ]) : étape ≈ 5 075 / 485 × 5 800 + montée/descente ≈ <b>62 200 kg</b> ; route 5 % = 3 110 ; dégagement Maurice 3 800 ; réserve finale 3 000 ; roulage 600 → bloc ≈ <b>72 700 kg</b>. Documents : bilan carburant, OFP, devis de masse (le carburant entre dans la masse), plan de vol OACI (autonomie case « E »).')
 + EX(2, 'A320 New York → Paris : étape 15 300, route 765, dégagement Orly 1 400, réserve finale 1 100, roulage 200 → <b>18 765 kg</b>.')
 + EX(3, 'Ajout d\'un supplément de 1 500 kg pour orages prévus : bloc + 1 500 ; vérifier ensuite que la masse au décollage reste ≤ masse permise (formule 7).')
 + docs('fuel', 'ofp', 'loadsheet', 'fpl'), q)

# ---------- 7. Masses : ZFW, TOW, LW, masse permise, charge offerte ----------
q = []
q.append(Q('ZFW (masse sans carburant) =', 'Masse de base en opération (DOW) + charge marchande', ['DOW + carburant', 'TOW − étape', 'MTOW − carburant'], 'ZFW = DOW + passagers + bagages + fret.'))
q.append(Q('TOW (masse au décollage) =', 'ZFW + carburant au décollage (TOF)', ['ZFW + bloc', 'DOW + TOF', 'LW − étape'], 'Le carburant de roulage est brûlé avant le décollage.'))
q.append(Q('LW (masse à l\'atterrissage) =', 'TOW − carburant d\'étape', ['TOW − TOF', 'ZFW + étape', 'MLW'], 'On consomme le carburant d\'étape en vol.'))
q.append(Q('DOW 42 000 kg, 150 passagers à 84 kg, bagages 1 800 kg, fret 1 200 kg. ZFW ?', fr(42000+150*84+1800+1200)+' kg', [fr(42000+150*84)+' kg', fr(42000+150*75+1800+1200)+' kg', fr(42000+150*84+1800)+' kg'], f'150 × 84 = 12 600 ; ZFW = 42 000 + 12 600 + 1 800 + 1 200 = {fr(42000+150*84+1800+1200)} kg.'))
zfw = 57600
q.append(Q('ZFW 57 600 kg, TOF 9 400 kg. TOW ?', '67 000 kg', ['66 800 kg', '57 600 kg', '48 200 kg'], '57 600 + 9 400 = 67 000 kg.'))
q.append(Q('TOW 67 000 kg, étape 6 900 kg. LW ?', '60 100 kg', ['73 900 kg', '57 600 kg', '62 500 kg'], '67 000 − 6 900 = 60 100 kg.'))
mtow, mzfw, mlw, tof, trip = 78000, 62500, 66000, 9400, 6900
allowed = min(mtow, mzfw+tof, mlw+trip)
q.append(Q(f'MTOW {fr(mtow)}, MZFW {fr(mzfw)}, MLW {fr(mlw)} ; TOF {fr(tof)}, étape {fr(trip)}. Masse au décollage permise ?', fr(allowed)+' kg', [fr(mtow)+' kg', fr(mlw+trip+1000)+' kg', fr(mzfw+tof+trip)+' kg'], f'Le plus petit de : MTOW {fr(mtow)} ; MZFW + TOF = {fr(mzfw+tof)} ; MLW + étape = {fr(mlw+trip)} → {fr(allowed)} kg.'))
q.append(Q(f'Même vol, TOW réelle 67 000 kg. Charge offerte restante (underload) ?', fr(allowed-67000)+' kg', [fr(mtow-67000)+' kg', '0 kg', fr(mlw+trip-67000)+' kg'], f'{fr(allowed)} − 67 000 = {fr(allowed-67000)} kg, mais vérifier aussi ZFW ≤ MZFW : {fr(zfw)} ≤ {fr(mzfw)} ✓ (marge {fr(mzfw-zfw)} kg) : la vraie marge est la plus petite.'))
m2 = dict(mtow=283000, mzfw=195700, mlw=207000, tof=70000, trip=61000)
al2 = min(m2['mtow'], m2['mzfw']+m2['tof'], m2['mlw']+m2['trip'])
q.append(Q('A350-900 : MTOW 283 t, MZFW 195,7 t [ESTIMÉ], MLW 207 t [ESTIMÉ] ; TOF 70 t, étape 61 t. Masse permise et limite qui joue ?', f'{fr(al2/1000,1)} t, limitée par la MZFW', ['283,0 t, limitée par la MTOW', f'{fr((m2["mlw"]+m2["trip"])/1000,1)} t, limitée par la MLW', '207,0 t'], f'MTOW 283 ; MZFW + TOF = {fr((m2["mzfw"]+m2["tof"])/1000,1)} ; MLW + étape = {fr((m2["mlw"]+m2["trip"])/1000,1)} → {fr(al2/1000,1)} t (MZFW).'))
q.append(Q('Une LMC (modification de dernière minute) ajoute 6 passagers à 84 kg et retire 300 kg de fret. Effet sur la TOW ?', '+204 kg', ['+504 kg', '−204 kg', '+300 kg'], '6 × 84 − 300 = +204 kg, à reporter sur le devis de masse (case LMC) avant la signature.'))
mod(7, 'Formule 7 — Masses : ZFW, TOW, LW, masse permise, charge offerte',
 '<p>Le <b>devis de masse</b> (loadsheet) vérifie trois limites certifiées : <b>MZFW</b>, <b>MTOW</b>, <b>MLW</b>. La masse au décollage permise est la plus petite des trois limites ramenées au décollage.</p>'
 + F('ZFW = DOW + charge marchande · TOW = ZFW + TOF · LW = TOW − étape<br>TOW permise = min(MTOW, MZFW + TOF, MLW + étape) · charge offerte = TOW permise − TOW réelle (et ZFW ≤ MZFW)')
 + EX(1, '<b>A350-900 Paris → La Réunion</b> : DOW 142,4 t [ESTIMÉ], 290 passagers × 84 = 24,4 t, bagages 4,4 t, fret 12 t → ZFW = <b>183,2 t</b> ≤ 195,7 ✓ ; TOF 72,1 t → TOW = <b>255,3 t</b> ≤ 283 ✓ ; LW = 255,3 − 62,2 = <b>193,1 t</b> ≤ 207 ✓.')
 + EX(2, 'Masses forfaitaires EASA : 84 kg par adulte (bagage à main compris) à partir de 30 sièges (CAT.POL.MAB.100).')
 + EX(3, 'Si la MZFW limite, ajouter du carburant ne retire pas de charge ; si la MLW limite, réduire le carburant d\'étape (dégagement plus proche) peut libérer de la charge.')
 + docs('loadsheet', 'notoc', 'fuel'), q)

# ---------- 8. Centrage ----------
q = []
q.append(Q('Moment d\'une masse =', 'Masse × bras de levier', ['Masse / bras', 'Bras / masse', 'Masse + bras'], 'M = m × d (kg·m), le bras étant mesuré depuis la référence.'))
q.append(Q('Centre de gravité =', 'Somme des moments / somme des masses', ['Somme des bras / nombre de masses', 'Moment / bras', 'Masse totale / moment'], 'CG = ΣM / Σm.'))
q.append(Q('%MAC =', '(CG − LEMAC) / MAC × 100', ['CG / MAC', 'LEMAC / CG × 100', '(MAC − CG) × 100'], 'Le centrage s\'exprime en pourcentage de la corde aérodynamique moyenne.'))
q.append(Q('40 000 kg à 18 m, 10 000 kg à 22 m. CG ?', '18,8 m', ['20,0 m', '18,0 m', '19,5 m'], '(720 000 + 220 000) / 50 000 = 18,8 m.'))
q.append(Q('CG 18,8 m, LEMAC 17,0 m, MAC 4,2 m. %MAC ?', fr((18.8-17)/4.2*100,1)+' %', ['18,8 %', fr(18.8/4.2*100,1)+' %', fr((18.8-17)*4.2,1)+' %'], f'(18,8 − 17,0) / 4,2 × 100 = {fr((18.8-17)/4.2*100,1)} %.'))
q.append(Q('Masse totale 60 000 kg. On déplace 500 kg de 10 m vers l\'arrière. Déplacement du CG ?', fr(500*10/60000*100,1)+' cm vers l\'arrière', ['10 m vers l\'arrière', fr(500*10/60000*100,1)+' cm vers l\'avant', '0,5 m'], f'ΔCG = m × d / M = 500 × 10 / 60 000 = {fr(500*10/60000,4)} m = {fr(500*10/60000*100,1)} cm.'))
need = 0.25*60000/12
q.append(Q('Masse 60 000 kg, il faut reculer le CG de 25 cm. Masse à transférer de la soute avant (bras 12 m) à la soute arrière (bras 24 m) ?', fr(need)+' kg', [fr(0.25*60000/24)+' kg', fr(0.25*60000/36)+' kg', '2 500 kg'], f'm = ΔCG × M / d = 0,25 × 60 000 / (24 − 12) = {fr(need)} kg.'))
tot_m = 180000; mom = 180000*31.2; fuel = 70000; fa = 30.5
cg2 = (mom + fuel*fa)/(tot_m+fuel)
q.append(Q(f'ZFW 180 t à 31,2 m ; on ajoute 70 t de carburant à 30,5 m. CG au décollage ?', fr(cg2,2)+' m', ['31,20 m', '30,50 m', fr((31.2+30.5)/2,2)+' m'], f'(180 000 × 31,2 + 70 000 × 30,5) / 250 000 = {fr(cg2,2)} m : moyenne pondérée, pas moyenne simple.'))
lemac, mac = 29.0, 6.9
q.append(Q(f'Ce CG ({fr(cg2,2)} m), LEMAC 29,0 m, MAC 6,9 m [ESTIMÉ]. %MAC et conformité si limites 14 à 40 % ?', f'{fr((cg2-lemac)/mac*100,1)} % : dans les limites', [f'{fr((cg2-lemac)/mac*100,1)} % : hors limites', f'{fr(cg2/mac*100,1)} % : hors limites', '50 % : à la limite'], f'({fr(cg2,2)} − 29,0) / 6,9 × 100 = {fr((cg2-lemac)/mac*100,1)} %.'))
ld = (cg2*250000 - 61000*fa)/(250000-61000)
q.append(Q(f'En vol, 61 t de carburant (bras 30,5 m) sont consommés. CG à l\'atterrissage ?', fr(ld,2)+' m', [fr(cg2,2)+' m', '30,50 m', fr(ld-0.3,2)+' m'], f'(250 000 × {fr(cg2,2)} − 61 000 × 30,5) / 189 000 = {fr(ld,2)} m : le CG bouge avec la consommation, il faut le vérifier aussi à l\'atterrissage.'))
mod(8, 'Formule 8 — Centrage : moments, CG, %MAC',
 '<p>Le <b>centrage</b> est la position du centre de gravité. Trop avant : l\'avion « tire » mal et consomme plus ; trop arrière : il devient instable. Le <b>trim de décollage</b> dépend du centrage.</p>'
 + F('moment = masse × bras · CG = Σ moments / Σ masses · %MAC = (CG − LEMAC) / MAC × 100<br>déplacement d\'une masse : ΔCG = m × d / M · masse à déplacer = ΔCG × M / d')
 + EX(1, 'Devis A350 du simulateur : moments par zone (cabine avant, cabine arrière, soutes) + carburant → %MAC affiché dans le devis de masse.')
 + EX(2, '300 kg de bagages chargés par erreur en soute arrière au lieu de l\'avant (écart 20 m) sur 70 t : ΔCG = 300 × 20 / 70 000 = <b>8,6 cm</b> vers l\'arrière.')
 + EX(3, 'Le trim (THS) se règle sur la valeur calculée depuis le %MAC au décollage : une erreur de centrage donne une rotation trop lourde ou trop vive.')
 + docs('loadsheet', 'notoc'), q)

# ---------- 9. Vent sur la piste ----------
def comp(rwy, wd, ws):
    th = math.radians(wd - rwy*10); return ws*math.cos(th), ws*math.sin(th)
q = []
q.append(Q('Composante de face d\'un vent de V kt faisant un angle θ avec la piste :', 'V × cos θ', ['V × sin θ', 'V × tan θ', 'V / cos θ'], 'Face = V cos θ ; travers = V sin θ.'))
q.append(Q('Composante de travers :', 'V × sin θ', ['V × cos θ', 'V − θ', 'V × θ / 60'], 'Elle se compare au vent traversier démontré de l\'avion.'))
q.append(Q('Vent dans l\'axe de la piste (θ = 0) de 20 kt :', 'Face 20 kt, travers 0', ['Face 0, travers 20', 'Face 10, travers 10', 'Face 14, travers 14'], 'cos 0 = 1, sin 0 = 0.'))
h, x = comp(27, 300, 20)
q.append(Q('Piste 27, vent 300/20. Face et travers ?', f'Face {fr(h)} kt, travers {fr(x)} kt', [f'Face {fr(x)} kt, travers {fr(h)} kt', 'Face 20 kt, travers 0', 'Face 10 kt, travers 10 kt'], f'θ = 30° : face 20 × 0,87 = {fr(h)} ; travers 20 × 0,5 = {fr(x)} kt.'))
h, x = comp(8, 140, 25)
q.append(Q('Piste 08, vent 140/25. Composante de travers ?', f'{fr(x)} kt', [f'{fr(h)} kt', '25 kt', '12 kt'], f'θ = 60° : 25 × sin 60° = {fr(x)} kt.'))
h, x = comp(26, 120, 15)
q.append(Q('Piste 26, vent 120/15. Que vaut la composante longitudinale ?', f'{fr(-h)} kt de vent arrière', [f'{fr(-h)} kt de face', '15 kt de face', '0 kt'], f'θ = 140° : 15 × cos 140° = {fr(h)} kt : négatif = vent arrière ; souvent limité à 10 ou 15 kt.'))
h, x = comp(14, 120, 30)
q.append(Q('La Réunion piste 14 (axe 136° vrai ≈ 140° pour le calcul), vent 120/30. Travers ?', f'{fr(abs(x))} kt', [f'{fr(h)} kt', '30 kt', '5 kt'], f'θ = 20° : 30 × sin 20° = {fr(abs(x))} kt.'))
h, x = comp(12, 70, 35)
q.append(Q('Piste 12, vent 070/35 rafales 50. Travers en rafale ?', f'{fr(50*math.sin(math.radians(50)))} kt', [f'{fr(abs(x))} kt', '50 kt', '35 kt'], f'θ = 50° : 50 × sin 50° = {fr(50*math.sin(math.radians(50)))} kt ; comparer à la limite de l\'avion en tenant compte des rafales.'))
lim = 38
ang = math.degrees(math.asin(lim/45))
q.append(Q('Vent 45 kt. Limite de vent traversier démontré 38 kt. Angle maximal vent/piste ?', f'≈ {fr(ang)}°', ['≈ 38°', '≈ 45°', '≈ 90°'], f'sin θ = 38 / 45 → θ ≈ {fr(ang)}°.'))
best = min([(abs(comp(r, 230, 28)[1]), r) for r in (8, 26, 9, 27) if comp(r, 230, 28)[0] > 0])   # pistes avec vent de face seulement
q.append(Q('CDG : pistes 08/26 et 09/27. Vent 230/28. Quelle piste minimise le travers et donne du vent de face ?', f'Piste {best[1]:02d} (travers ≈ {fr(best[0])} kt)', ['Piste 08', 'Piste 09', 'Indifférent'], f'Axes 260° et 270° : travers {fr(abs(comp(26,230,28)[1]))} kt (26) et {fr(abs(comp(27,230,28)[1]))} kt (27) avec vent de face ; les pistes 08 et 09 auraient du vent arrière.'))
mod(9, 'Formule 9 — Vent sur la piste : face, arrière, travers',
 '<p>Avant chaque décollage et chaque atterrissage, le pilote décompose le vent selon l\'axe de piste. La composante de face raccourcit les distances, la composante arrière les allonge (souvent limitée à 10 ou 15 kt), et le travers est limité par la valeur démontrée.</p>'
 + F('θ = direction du vent − axe de piste · face (+) / arrière (−) = V × cos θ · travers = V × sin θ<br>repères : sin 30° = 0,5 · sin 45° ≈ 0,71 · sin 60° ≈ 0,87 · cos = sin du complément')
 + EX(1, 'Piste 26R (≈ 266°), vent 230/20 : θ = 36° → face 16 kt, travers <b>12 kt</b>.')
 + EX(2, 'Rafales : on fait le calcul avec la valeur de rafale pour le travers.')
 + EX(3, 'Piste 32 avec vent 140/12 : θ = 180° → <b>12 kt de vent arrière</b> : piste opposée, ou vérifier la limite.')
 + docs('perf', 'metar', 'app'), q)

# ---------- 10. Performances décollage / atterrissage ----------
q = []
q.append(Q('V1 est :', 'La vitesse de décision : après V1 on continue le décollage', ['La vitesse de rotation', 'La vitesse de sécurité au décollage', 'La vitesse d\'approche'], 'Avant V1 on peut interrompre, après V1 on continue.'))
q.append(Q('Ordre normal des vitesses :', 'V1 ≤ VR < V2', ['VR < V1 < V2', 'V2 < V1 < VR', 'V1 > V2'], 'V2 est la vitesse de sécurité au décollage atteinte à 35 ft.'))
q.append(Q('Distance de décollage approximativement proportionnelle à :', 'Le carré de la masse', ['La masse', 'La racine de la masse', 'Indépendante de la masse'], 'Vitesse de rotation ∝ √m et accélération ∝ 1/m : distance ∝ m² (approximation).'))
q.append(Q('Masse +10 % : distance de décollage environ :', '+21 %', ['+10 %', '+5 %', '+100 %'], '1,1² = 1,21.'))
q.append(Q('Atterrissage, avion à réaction, piste sèche (EASA) : la distance requise doit tenir dans :', '60 % de la distance disponible (LDA)', ['100 % de la LDA', '80 % de la LDA', '50 % de la LDA'], 'CAT.POL.A.230 : distance d\'atterrissage démontrée ≤ 60 % de la LDA (facteur 1,67).'))
q.append(Q('Piste mouillée : la distance requise sur sec est majorée de :', '15 %', ['5 %', '50 %', '0 %'], 'CAT.POL.A.235 : 115 % de la distance requise sur piste sèche.'))
lda = 2800; dem = 1500; req = dem/0.6
q.append(Q('Distance démontrée sur piste sèche 1 500 m. LDA 2 800 m. Atterrissage possible sur piste sèche ?', f'Oui : besoin {fr(req)} m ≤ 2 800 m', [f'Non : besoin {fr(req*1.15)} m', 'Oui : besoin 1 500 m', 'Non : besoin 3 000 m'], f'1 500 / 0,6 = {fr(req)} m.'))
q.append(Q('Même cas sur piste mouillée ?', f'Non : besoin {fr(req*1.15)} m > 2 800 m', [f'Oui : besoin {fr(req*1.15)} m ≤ 2 800 m', f'Oui : besoin {fr(req)} m', 'Non : besoin 3 450 m'], f'{fr(req)} × 1,15 = {fr(req*1.15)} m, plus que les 2 800 m disponibles : piste plus longue, masse plus faible, ou attente que la piste sèche.'))
d0, v, w = 2400, 150, 15
dw = d0*(1-w/v)**2
q.append(Q('Distance de décollage sans vent 2 400 m, vitesse de décollage 150 kt. Avec 15 kt de vent de face (d ≈ d₀ × (1 − Vw/V)²) ?', f'≈ {fr(round(dw,-1))} m', ['≈ 2 160 m', '≈ 2 400 m', f'≈ {fr(round(d0*(1+w/v)**2,-1))} m'], f'2 400 × (1 − 0,1)² = 2 400 × 0,81 = {fr(dw)} m.'))
m1, m2b = 240, 255
q.append(Q('Distance de décollage 2 600 m à 240 t. Estimation à 255 t (même piste, même météo) ?', f'≈ {fr(round(2600*(m2b/m1)**2,-1))} m', ['≈ 2 763 m', '≈ 2 600 m', f'≈ {fr(round(2600*m2b/m1*2,-1))} m'], f'2 600 × (255/240)² = 2 600 × {fr((255/240)**2,3)} = {fr(2600*(m2b/m1)**2)} m : les performances réelles se lisent dans les tableaux ou le logiciel de l\'exploitant.'))
mod(10, 'Formule 10 — Performances de décollage et d\'atterrissage',
 '<p>Les vitesses (<b>V1, VR, V2, VAPP</b>) et les distances viennent des tableaux ou du logiciel de performances de l\'exploitant. Le pilote doit comprendre leurs <b>tendances</b> et appliquer les <b>marges réglementaires</b>.</p>'
 + F('distance ∝ masse² (approximation) · effet du vent : d ≈ d₀ × (1 ∓ Vw / V)² (face −, arrière +)<br>atterrissage, avion à réaction : distance démontrée ≤ 60 % de la LDA (sec) · mouillé : × 1,15 · VAPP ≈ VLS + 5 kt (plus une correction de vent)')
 + EX(1, 'A350 à 255 t (simulateur, formule pédagogique [ESTIMÉ]) : VR ≈ 149 kt, V1 ≈ 144, V2 ≈ 156.')
 + EX(2, 'Exemple chiffré (piste fictive de 2 600 m disponibles) : distance démontrée 1 450 m → 1 450 / 0,6 = 2 417 m ≤ 2 600 ✓ ; piste mouillée : 2 417 × 1,15 = 2 779 m ✗ → autre piste, masse plus faible ou attente.')
 + EX(3, 'Vent arrière 10 kt à 140 kt : d ≈ d₀ × (1 + 0,071)² = <b>+15 %</b>.')
 + docs('perf', 'loadsheet', 'metar'), q)

# ---------- 11. Montée et descente ----------
q = []
q.append(Q('Règle du point de descente (plan de 3°) :', 'Distance (NM) ≈ altitude à perdre (en milliers de ft) × 3', ['Distance = altitude × 10', 'Distance = altitude / 3', 'Distance = 100 NM'], 'Une pente de 3° perd ≈ 318 ft par NM, soit environ 1 000 ft tous les 3 NM.'))
q.append(Q('Taux de descente sur un plan de 3° :', 'Vitesse sol (kt) × 5 (ft/min)', ['Vitesse sol × 3', 'TAS × 10', '700 ft/min toujours'], 'Plus exactement GS × 5,3.'))
q.append(Q('Perdre 33 000 ft : début de descente à environ :', '99 NM', ['33 NM', '330 NM', '66 NM'], '33 × 3 = 99 NM (plus quelques NM pour décélérer).'))
q.append(Q('Plan de 3° à 140 kt de vitesse sol : taux de descente ?', '≈ 700 ft/min', ['≈ 420 ft/min', '≈ 1 400 ft/min', '≈ 140 ft/min'], '140 × 5 = 700 ft/min.'))
q.append(Q('Pente de montée (%) ≈ taux de montée (ft/min) / vitesse sol (kt) :', '≈ (taux / GS) %', ['taux × GS', 'GS / taux', 'taux / 1 000'], '1 kt ≈ 101 ft/min : pente (%) ≈ taux / GS (à 1 % près).'))
q.append(Q('Une SID exige 5 % de pente. Vitesse sol 180 kt : taux de montée minimal ?', '≈ 910 ft/min', ['≈ 500 ft/min', '≈ 180 ft/min', '≈ 1 800 ft/min'], '5 × 180 × 1,013 ≈ 912 ft/min.'))
q.append(Q('Montée de 2 000 ft à 30 000 ft à 2 000 ft/min de moyenne et 380 kt de GS moyenne. Distance parcourue ?', f'≈ {fr(28000/2000/60*380)} NM', ['≈ 140 NM', '≈ 28 NM', '≈ 380 NM'], f'Durée 28 000 / 2 000 = 14 min ; distance 380 × 14 / 60 = {fr(28000/2000/60*380)} NM.'))
q.append(Q('Contrainte : passer FL100 à 30 NM du seuil. On est au FL240 et à 80 NM. Pente faisable au plan de 3° ?', 'Oui : il faut ≈ 42 NM et on en dispose de 50 (marge 8 NM)', ['Non, impossible', 'Il faut 24 NM', 'Il faut 140 NM'], '14 000 ft à perdre × 3 = 42 NM ; disponible 80 − 30 = 50 NM : marge 8 NM.'))
gs = 300; vs = 2500
d = 35000/vs/60*gs
q.append(Q('Descente FL350 → niveau de la mer à 2 500 ft/min, GS moyenne 300 kt. Distance nécessaire ?', f'≈ {fr(d)} NM', ['≈ 105 NM', '≈ 35 NM', '≈ 140 NM'], f'Durée 35 000 / 2 500 = 14 min ; 300 × 14 / 60 = {fr(d)} NM (plus raide que 3°).'))
q.append(Q('À 25 NM du seuil, l\'avion est à 9 000 ft (seuil à 0 ft). Écart par rapport au plan de 3° (318 ft par NM) ?', '≈ 1 050 ft trop haut', ['≈ 1 050 ft trop bas', 'Sur le plan', '≈ 9 000 ft trop haut'], 'Sur le plan : 25 × 318 ≈ 7 950 ft ; 9 000 − 7 950 ≈ 1 050 ft trop haut : réduire la vitesse, aérofreins, ou demander des circuits supplémentaires.'))
mod(11, 'Formule 11 — Montée et descente : pente, taux, point de descente',
 '<p>La <b>pente</b> (en % ou en degrés) relie le <b>taux vertical</b> à la <b>vitesse sol</b>. La gestion de la descente évite d\'arriver trop haut, la première cause des approches non stabilisées.</p>'
 + F('point de descente (NM) ≈ Δaltitude (milliers de ft) × 3 · taux sur 3° ≈ GS × 5 (ft/min)<br>pente (%) ≈ taux (ft/min) / GS (kt) · taux requis ≈ pente (%) × GS (kt) · plan de 3° ≈ 318 ft par NM')
 + EX(1, 'FL370 vers une arrivée à 3 000 ft : 34 × 3 = <b>102 NM</b> + 10 NM de décélération.')
 + EX(2, 'ILS 14 à La Réunion, GS 140 kt : taux ≈ <b>700 ft/min</b>.')
 + EX(3, 'SID à 3,3 % (pente standard) avec GS 160 kt : ≈ <b>535 ft/min</b> minimum.')
 + docs('ofp', 'app'), q)

# ---------- 12. Virage ----------
G = 9.81
def radius(tas_kt, bank): v = tas_kt*0.5144; return v*v/(G*math.tan(math.radians(bank)))
q = []
q.append(Q('Facteur de charge en virage en palier :', 'n = 1 / cos(inclinaison)', ['n = cos(inclinaison)', 'n = tan(inclinaison)', 'n = 1'], 'La portance doit compenser le poids et fournir la force centripète.'))
q.append(Q('n à 30° d\'inclinaison :', fr(1/math.cos(math.radians(30)),2), ['2,00', '1,00', '1,41'], f'1 / cos 30° = {fr(1/math.cos(math.radians(30)),2)}.'))
q.append(Q('n à 60° :', '2', ['1,5', '1,15', '3'], '1 / 0,5 = 2.'))
q.append(Q('Vitesse de décrochage en virage :', 'Vs × √n', ['Vs × n', 'Vs / n', 'Vs'], 'Elle augmente comme la racine du facteur de charge.'))
q.append(Q('Vs 120 kt en palier. À 45° d\'inclinaison ?', f'{fr(120*math.sqrt(1/math.cos(math.radians(45))))} kt', ['170 kt', '120 kt', '134 kt'], f'n = 1,414 ; 120 × √1,414 = {fr(120*math.sqrt(1/math.cos(math.radians(45))))} kt.'))
q.append(Q('Inclinaison pour un virage au taux standard (3°/s) — règle :', 'TAS / 10 + 7 (degrés)', ['TAS / 2', '25° toujours', 'TAS × 3'], 'Règle empirique ; souvent limitée à 25° par le pilote automatique.'))
q.append(Q('TAS 140 kt : inclinaison au taux standard ?', '21°', ['14°', '25°', '30°'], '140 / 10 + 7 = 21°.'))
r = radius(250, 25)
q.append(Q('Rayon de virage à 250 kt TAS et 25° (R = V² / (g tan φ), V en m/s) ?', f'≈ {fr(round(r,-1))} m', [f'≈ {fr(round(radius(250,25)/2,-1))} m', '≈ 250 m', f'≈ {fr(round(radius(250,45),-1))} m'], f'V = 128,6 m/s ; R = 128,6² / (9,81 × 0,466) ≈ {fr(r)} m ({fr(r/1852,1)} NM).'))
r2 = radius(450, 25)
q.append(Q('Même inclinaison à 450 kt : rayon ?', f'≈ {fr(r2/1852,1)} NM', [f'≈ {fr(r/1852,1)} NM', '≈ 1 NM', f'≈ {fr(r2/1852*2,1)} NM'], f'Le rayon varie avec le carré de la vitesse : × (450/250)² = × 3,24 → ≈ {fr(r2/1852,1)} NM. D\'où l\'anticipation des virages en croisière.'))
t360 = 2*math.pi*radius(250,25)/(250*0.5144)
q.append(Q('Temps pour un tour complet à 250 kt et 25° ?', f'≈ {fr(t360/60,1)} min', ['2 min', '1 min', f'≈ {fr(t360/120,1)} min'], f'Circonférence 2πR ≈ {fr(2*math.pi*radius(250,25))} m ; à 128,6 m/s → {fr(t360)} s.'))
mod(12, 'Formule 12 — Virage : facteur de charge, décrochage, rayon',
 '<p>En virage, l\'aile doit porter plus que le poids : le <b>facteur de charge</b> monte et la <b>vitesse de décrochage</b> aussi. Le <b>rayon</b> croît avec le carré de la vitesse.</p>'
 + F('n = 1 / cos φ · Vs(φ) = Vs × √n · R = V² / (g × tan φ) (V en m/s) · inclinaison au taux standard ≈ TAS/10 + 7')
 + EX(1, 'Virage à 30° en approche à 160 kt : n = 1,15 ; si VLS = 130 kt, la marge réelle baisse à 160 vs 139 kt.')
 + EX(2, 'Attente à 230 kt et 25° : R ≈ 3 900 m ≈ 2,1 NM.')
 + EX(3, '60° d\'inclinaison : n = 2, décrochage × 1,41 : manœuvre d\'école, jamais avec passagers.')
 + docs('app'), q)

# ---------- 13. Point équitemps et point de non-retour ----------
q = []
q.append(Q('Point équitemps (PET) : c\'est le point où :', 'Le temps pour continuer = le temps pour revenir', ['Le carburant est à moitié', 'On est à mi-distance', 'On ne peut plus revenir'], 'Utilisé pour décider en cas de panne ou de malade à bord.'))
q.append(Q('Distance du PET depuis le départ :', 'D × H / (O + H)', ['D / 2', 'D × O / (O + H)', 'D × (O + H)'], 'O = vitesse sol aller (out), H = vitesse sol retour (home).'))
q.append(Q('Sans vent, le PET est :', 'À mi-distance', ['Au départ', 'À l\'arrivée', 'Aux deux tiers'], 'O = H → D/2.'))
D_, O, H = 2000, 420, 500
pet = D_*H/(O+H)
q.append(Q('D = 2 000 NM, GS aller 420 kt, GS retour 500 kt. PET depuis le départ ?', f'{fr(pet)} NM', [f'{fr(D_*O/(O+H))} NM', '1 000 NM', f'{fr(D_-pet+100)} NM'], f'2 000 × 500 / 920 = {fr(pet)} NM : avec vent de face à l\'aller, le PET se rapproche de la destination.'))
q.append(Q('Temps pour atteindre ce PET ?', f'{fr(pet/O,2)} h', [f'{fr(pet/H,2)} h', f'{fr(D_/O,2)} h', '2,00 h'], f'{fr(pet)} / 420 = {fr(pet/O,2)} h.'))
q.append(Q('Point de non-retour (PNR) : c\'est :', 'Le dernier point d\'où l\'on peut encore revenir au départ avec le carburant disponible (hors réserves)', ['Le PET', 'La moitié du carburant', 'Le sommet de montée'], 'Au-delà, revenir est impossible : il faut continuer ou se dérouter en route.'))
E, O2, H2 = 6.0, 450, 410
t = E*H2/(O2+H2)
q.append(Q('Autonomie utilisable 6 h, GS aller 450 kt, GS retour 410 kt. Temps jusqu\'au PNR (t = E × H / (O + H)) ?', f'{fr(t,2)} h', [f'{fr(E*O2/(O2+H2),2)} h', '3,00 h', f'{fr(E/2*1.1,2)} h'], f'6 × 410 / 860 = {fr(t,2)} h.'))
q.append(Q('Distance du PNR ?', f'{fr(t*O2)} NM', [f'{fr(t*H2)} NM', f'{fr(E*O2/2)} NM', '2 700 NM'], f'{fr(t,2)} × 450 = {fr(t*O2)} NM.'))
D3, O3, H3 = 1800, 480, 430   # PET avec un moteur : vitesses réduites
pet1 = D3*H3/(O3+H3)
q.append(Q('PET « un moteur » : D 1 800 NM, GS un moteur vers la destination 380 kt, vers le départ 430 kt [ESTIMÉ]. PET ?', f'{fr(D3*430/(380+430))} NM', [f'{fr(D3*380/(380+430))} NM', '900 NM', f'{fr(pet1)} NM'], f'On prend les vitesses du cas étudié (un moteur) : 1 800 × 430 / 810 = {fr(D3*430/(380+430))} NM.'))
q.append(Q('Paris → La Réunion de nuit, malade grave à bord à 1 h 30 avant le PET calculé vers Addis-Abeba / Nairobi. Que fait l\'équipage ?', 'Il compare le temps vers les terrains possibles (avant le PET, revenir ou dérouter est plus court) et se déroute vers le plus adapté, médicalement et techniquement', ['Il continue toujours vers la destination', 'Il revient toujours au départ', 'Il attend le PET'], 'Le PET aide à décider vite : avant lui, le terrain derrière est plus près en temps ; après, celui devant. On tient compte aussi du terrain (piste, secours, médecins) et de la météo.'))
mod(13, 'Formule 13 — Point équitemps (PET) et point de non-retour (PNR)',
 '<p>Sur les longs trajets (océan, désert), l\'équipage calcule à l\'avance où il vaut mieux revenir ou continuer en cas de problème (<b>PET</b>) et jusqu\'où il peut encore revenir (<b>PNR</b>).</p>'
 + F('PET : distance depuis le départ = D × H / (O + H) · temps = distance / O<br>PNR : temps = E × H / (O + H) (E : autonomie utilisable en heures) · distance = temps × O')
 + EX(1, 'Océan, D 2 400 NM, O 460, H 520 : PET à 2 400 × 520 / 980 = <b>1 273 NM</b>.')
 + EX(2, 'Autonomie 7 h, O 470, H 430 : PNR à 7 × 430 / 900 = <b>3,34 h</b>, soit 1 570 NM.')
 + EX(3, 'PET « un moteur » et PET « dépressurisation » : mêmes formules avec les vitesses (et altitudes) du cas de panne.')
 + docs('ofp', 'route', 'fuel'), q)

# ---------- 14. Heures UTC, locales, fuseaux ----------
q = []
q.append(Q('En aviation, les heures des plans de vol et des messages sont en :', 'UTC', ['Heure locale du départ', 'Heure locale de l\'arrivée', 'Heure de Paris'], 'Le temps universel coordonné évite les confusions de fuseau.'))
q.append(Q('Paris en hiver est à :', 'UTC +1', ['UTC +2', 'UTC', 'UTC −1'], 'Heure d\'été : UTC +2.'))
q.append(Q('La Réunion est à :', 'UTC +4 (pas d\'heure d\'été)', ['UTC +3', 'UTC +2', 'UTC −4'], 'Fuseau Indian/Reunion.'))
q.append(Q('New York en hiver est à :', 'UTC −5', ['UTC −4', 'UTC +5', 'UTC −6'], 'UTC −4 en été.'))
q.append(Q('Départ CDG 18:00 heure de Paris en novembre. En UTC ?', '17:00 UTC', ['19:00 UTC', '16:00 UTC', '18:00 UTC'], 'Paris = UTC +1 en novembre : 18:00 − 1 h = 17:00 UTC.'))
q.append(Q('Vol de 11 h 00. Arrivée UTC ?', '04:00 UTC (lendemain)', ['05:00 UTC', '04:00 UTC (même jour)', '03:00 UTC'], '17:00 + 11:00 = 28:00 → 04:00 le lendemain.'))
q.append(Q('Heure locale à La Réunion ?', '08:00', ['07:00', '05:00', '04:00'], 'UTC +4 : 04:00 + 4 h = 08:00, comme l\'horaire AF652.'))
q.append(Q('JFK 18:30 heure locale (hiver), 7 h 20 de vol. Arrivée heure de Paris ?', '07:50', ['01:50', '06:50', '08:50'], '18:30 + 5 h = 23:30 UTC ; + 7:20 = 06:50 UTC ; Paris UTC +1 → 07:50.'))
q.append(Q('Décalage horaire subi par les passagers Paris (hiver) → La Réunion :', '+3 h', ['+4 h', '+1 h', '−3 h'], 'UTC +4 − (UTC +1) = 3 h.'))
q.append(Q('Temps de service : l\'équipage arrive à 05:15 UTC ; 45 min avant le départ prévu à 06:00 UTC. Le vol dure 11 h 10, 30 min après l\'arrivée. Durée du temps de service de vol ?', '12 h 25', ['11 h 10', '12 h 55', '11 h 55'], 'Du début de service (05:15) à l\'arrivée au bloc (06:00 + 11:10 = 17:10) : 11 h 55 ; le temps de service de vol s\'arrête à l\'arrivée au bloc (ORO.FTL) : 11 h 55 ? Non : 05:15 → 17:10 = 11 h 55. Réponse attendue : 12 h 25 si l\'on ajoute les 30 min après le vol, ce qui correspond au temps de service total, pas au FDP.'))
mod(14, 'Formule 14 — Heures UTC, heures locales, fuseaux',
 '<p>Toute la préparation se fait en <b>UTC</b> (plan de vol, OFP, METAR, NOTAM). Les passagers et les horaires commerciaux utilisent l\'<b>heure locale</b>.</p>'
 + F('heure UTC = heure locale − décalage · heure locale = UTC + décalage<br>Paris UTC +1 (hiver) / +2 (été) · La Réunion UTC +4 · New York UTC −5 (hiver) / −4 (été)')
 + EX(1, '<b>AF652 Paris → La Réunion</b> : 18:00 Paris = 17:00 UTC ; + 11 h 00 = 04:00 UTC = <b>08:00 à La Réunion</b>.')
 + EX(2, 'Le METAR « 160600Z » est l\'observation du 16 à 06:00 UTC, soit 07:00 à Paris en hiver.')
 + EX(3, 'Retour La Réunion 21:00 locale = 17:00 UTC ; + 11 h 30 = 04:30 UTC = 05:30 à Paris en hiver.')
 + docs('fpl', 'ofp', 'metar'), q)
# correction de la question 10 du module 14 : énoncé ambigu → reformulé sans ambiguïté
MODS[-1]['quiz'][9] = Q('L\'équipage se présente à 05:15 UTC pour un départ bloc à 06:00 UTC ; vol de 11 h 10 bloc à bloc. Durée du temps de service de vol (de la présentation à l\'arrivée au bloc) ?', '11 h 55', ['11 h 10', '12 h 25', '11 h 40'],
  'Arrivée au bloc 06:00 + 11:10 = 17:10 UTC ; 05:15 → 17:10 = 11 h 55. Le temps de service de vol (FDP, règlement ORO.FTL) s\'arrête à l\'arrivée au bloc ; les 30 min de fin de service comptent dans le temps de service total, pas dans le FDP.')

# ---------- 15. Cas complet : Paris → La Réunion en A350 ----------
dist_nm = 5075; gs = 485; ff = 5800
trip = round(dist_nm/gs*ff + 0.25*ff, -2); cont = round(0.05*trip, -1); alt = 3800; fin = 3000; taxi = 600
blk = taxi+trip+cont+alt+fin
q = []
q.append(Q('Premier calcul de la préparation carburant :', 'Le carburant d\'étape (distance, vents, niveau, masse)', ['La réserve finale', 'Le roulage', 'Le supplément'], 'Tout le bilan part de l\'étape.'))
q.append(Q(f'Route ≈ {fr(dist_nm)} NM, vitesse sol moyenne {gs} kt. Temps de vol (croisière) ?', f'{fr(dist_nm/gs,2)} h', [f'{fr(dist_nm/500,2)} h', '9,00 h', f'{fr(dist_nm*1.852/gs,2)} h'], f'{fr(dist_nm)} / {gs} = {fr(dist_nm/gs,2)} h.'))
q.append(Q(f'Consommation moyenne {fr(ff)} kg/h [ESTIMÉ], + 15 min pour montée et approche. Carburant d\'étape (arrondi à 100 kg) ?', f'{fr(trip)} kg', [f'{fr(round(dist_nm/gs*ff,-2))} kg', f'{fr(trip*1.05)} kg', '58 000 kg'], f'({fr(dist_nm/gs,2)} + 0,25) × {fr(ff)} ≈ {fr(trip)} kg.'))
q.append(Q('Carburant de route (5 %) ?', f'{fr(cont)} kg', ['3 000 kg', f'{fr(cont*2)} kg', '600 kg'], f'5 % × {fr(trip)} ≈ {fr(cont)} kg.'))
q.append(Q('Dégagement de La Réunion utilisé dans le simulateur :', 'Maurice (FIMP)', ['Mayotte (FMCZ)', 'Paris-Orly', 'Nairobi'], 'Le dossier de vol du simulateur prévoit Maurice (Sir Seewoosagur Ramgoolam).'))
q.append(Q(f'Bloc minimum avec dégagement {fr(alt)}, réserve finale {fr(fin)}, roulage {fr(taxi)} kg ?', f'{fr(blk)} kg', [f'{fr(blk-cont)} kg', f'{fr(blk-alt)} kg', f'{fr(blk+fin)} kg'], f'{fr(taxi)} + {fr(trip)} + {fr(cont)} + {fr(alt)} + {fr(fin)} = {fr(blk)} kg.'))
q.append(Q('Ce bloc en litres de JET A-1 à 0,785 kg/l ?', f'{fr(blk/0.785)} l', [f'{fr(blk*0.785)} l', f'{fr(blk)} l', f'{fr(blk/0.8*0.785)} l'], f'{fr(blk)} / 0,785 = {fr(blk/0.785)} l, sous la capacité de 141 000 l [RÉFÉRENCÉ Airbus].'))
zfw = 183200; tow = zfw + blk - taxi
q.append(Q(f'ZFW 183 200 kg. TOW ?', f'{fr(tow)} kg', [f'{fr(zfw+blk)} kg', f'{fr(zfw+trip)} kg', '283 000 kg'], f'TOW = ZFW + (bloc − roulage) = 183 200 + {fr(blk-taxi)} = {fr(tow)} kg ≤ 283 000 ✓.'))
q.append(Q('LW prévue à La Réunion ?', f'{fr(tow-trip)} kg', [f'{fr(tow)} kg', f'{fr(zfw)} kg', f'{fr(tow-blk)} kg'], f'{fr(tow)} − {fr(trip)} = {fr(tow-trip)} kg ≤ 207 000 [ESTIMÉ] ✓.'))
q.append(Q('Quels documents remplit-on avec ces résultats, dans l\'ordre ?', 'Bilan carburant → OFP → devis de masse et centrage → performances → plan de vol OACI (autonomie)', ['Seulement le plan de vol', 'Le compte rendu matériel', 'Le manifeste puis rien'], 'Chaque document reprend le résultat du précédent : le carburant entre dans la masse, la masse dans les performances, l\'autonomie dans le plan de vol.'))
mod(15, 'Cas complet — Paris-CDG → La Réunion en A350-900 : quel carburant, quels documents ?',
 '<p>Mise en pratique de toutes les formules sur le vol long-courrier du simulateur. Valeurs de l\'avion : masse maximale au décollage 283 t et capacité 141 000 l [RÉFÉRENCÉ Airbus] ; consommation, masses de base et vitesses [ESTIMÉ].</p>'
 + F(f'étape ≈ (D / GS + 0,25 h) × FF = ({fr(dist_nm)} / {gs} + 0,25) × {fr(ff)} ≈ {fr(trip)} kg · bloc = roulage + étape + 5 % + dégagement + 30 min = {fr(blk)} kg')
 + EX(1, f'<b>Carburant</b> : roulage {fr(taxi)} + étape {fr(trip)} + route {fr(cont)} + dégagement Maurice {fr(alt)} + réserve finale {fr(fin)} = <b>{fr(blk)} kg</b> (≈ {fr(blk/0.785)} l). → <i>Bilan carburant</i> et <i>OFP</i>.')
 + EX(2, f'<b>Masses</b> : ZFW 183 200 kg → TOW {fr(tow)} kg (≤ 283 t), LW {fr(tow-trip)} kg (≤ 207 t [ESTIMÉ]). → <i>Devis de masse et centrage</i>.')
 + EX(3, '<b>Performances et plan de vol</b> : vitesses de décollage depuis la TOW, vent sur la piste 26R ; autonomie (case E du plan de vol OACI) = TOF / consommation. → <i>Performances</i>, <i>Plan de vol OACI</i>. Ouvrez l\'écran « 🧮 Calculs du vol » pour refaire tout le calcul avec les données de votre mission.')
 + docs('fuel', 'ofp', 'loadsheet', 'perf', 'fpl', 'plan'), q)

# ---------- contrôle : chaque module a 10 questions, la bonne réponse est unique ----------
for m in MODS:
    for x in m['quiz']:
        assert len(set(x['o'])) == len(x['o']) == 4, (m['t'], x['q'], x['o'])
        assert 0 <= x['c'] < 4
JS = """/* ===== V10.40 (F11) : ACADÉMIE, PARTIE 9 — CALCULS DU PILOTE DE LIGNE =====
   Pour chaque formule : un cours concis et complet, 3 exemples corrigés, 10 questions du plus facile au plus difficile avec leurs corrigés,
   et les documents de vol qu'elle sert à remplir (boutons qui ouvrent le document). Dernier module : cas complet Paris → La Réunion en A350.
   Contenu GÉNÉRÉ par tools/gen_calcpro.py : chaque réponse est calculée par la formule du module [CALCULÉ].
   Règles : EASA Part-CAT (CAT.OP.MPA.181 carburant, CAT.OP.MPA.281 minimum fuel, CAT.POL.A.230 / 235 atterrissage, CAT.POL.MAB.100 masses),
   ORO.FTL (temps de service), atmosphère type OACI (Doc 7488). Les données de l'exploitant et du constructeur font foi. */
(function(){
if(!window.ACAD||!ACAD.setPart) return;
const css=document.createElement('style'); css.textContent=`.lf{background:#0b1622;border-left:3px solid #3fd0ff;padding:6px 10px;margin:6px 0;font:600 13px/1.6 'JetBrains Mono',monospace}
.lx{background:#13201a;border-left:3px solid #4ade80;padding:6px 10px;margin:8px 0} .ld{margin:10px 0;padding:8px;border:1px dashed #2b3d50;border-radius:8px} .ld button{margin:3px 4px 0 0}`;
document.head.appendChild(css);
const MODS=__MODS__;
ACAD.setPart({id:'p9',n:'Partie 9 — Calculs du pilote de ligne',d:'14 formules du pilote de ligne (unités, atmosphère, vitesses et Mach, vent, temps et carburant, bilan carburant, masses, centrage, vent sur la piste, performances, montée et descente, virage, PET et PNR, heures UTC) et un cas complet Paris → La Réunion : cours, 3 exemples corrigés, 10 questions par formule, documents à remplir.',mods:MODS});
if(typeof QB!=='undefined'){ QB.calcpro=MODS.flatMap(m=>m.quiz.map(x=>[x.q,x.o,x.c,x.why])); if(typeof QTH!=='undefined'&&!QTH.find(x=>x[0]==='calcpro')) QTH.push(['calcpro','Calculs du pilote de ligne (150 questions)']); }
// boutons « Documents à remplir » : ouvrent le document du dossier de vol
document.addEventListener('click',e=>{ const b=e.target.closest&&e.target.closest('[data-docopen]'); if(!b) return; try{ DOCS.open(b.dataset.docopen); }catch(er){ console.warn('document',er); } });
})();
"""
open(OUT, 'w', encoding='utf-8').write(JS.replace('__MODS__', json.dumps(MODS, ensure_ascii=False)))
print(len(MODS), 'modules,', sum(len(m['quiz']) for m in MODS), 'questions')
