"""Modification 15 (V10.38) : trajet en temps réel confirmé.

Vérifie, pour chaque parcours complet :
  - la confirmation affiche la durée prévue [CALCULÉ], la référence [RÉFÉRENCÉ] et l'écart ;
  - 777 CDG → La Réunion ≈ 11 h et JFK → CDG ≈ 7 h 15 (écart ≤ 10 %) ;
  - après confirmation, le temps reste à ×1 pendant la croisière (plus d'accélération automatique) ;
  - un saut d'étape demande « Quitter le temps réel ? » ;
  - la sauvegarde puis la reprise replacent l'appareil plus loin sur la route, selon le temps écoulé.
Préparation : python3 tools/build.py --test ; cd tests ; python3 -m http.server 8765 &   puis : python3 temps_reel.py
"""
import asyncio, sys, re
from playwright.async_api import async_playwright
PAGE = sys.argv[1] if len(sys.argv) > 1 else 'final.html'
URL = f'http://localhost:8765/{PAGE}'
SETUP = """window.VT=performance.now(); performance.now=()=>window.VT; loop=function(){}; renderer.render=()=>{}; drawCockpit=()=>{};
window.drive=(n)=>{ for(let k=0;k<n;k++){ VT+=50; try{ loopBody(VT); }catch(e){ console.error('LB',e.message); } } };"""
ok_all = True
def check(name, ok, detail=''):
    global ok_all; ok_all &= bool(ok); print(('✔' if ok else '✘'), name, ('— ' + str(detail)) if detail != '' else '', flush=True)

async def start(pg, ac):
    await pg.goto(URL); await pg.wait_for_timeout(2000)
    await pg.evaluate(f"localStorage.removeItem('pt-rt-save-v1'); selAC='{ac}'; selMI=FULLOF('{ac}'); renderMenu(); $('m-auto').checked=true; $('go').click(); document.getElementById('br-skip').click();")
    for _ in range(20):
        await pg.wait_for_timeout(250)
        if await pg.evaluate("!!document.getElementById('rtprop')"): break

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader', '--enable-unsafe-swiftshader'])
        ctx = await b.new_context(viewport={'width': 1200, 'height': 800})   # même profil : la sauvegarde (localStorage) est partagée
        pg = await ctx.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        # 1. durées prévues de chaque parcours
        for ac, ref in [('b777', 660), ('a320', 435), ('lj60', None), ('h125', 7.5), ('r44', 7.5), ('s76', 7.5), ('c172', 7)]:
            await start(pg, ac)
            prop = await pg.evaluate("!!document.getElementById('rtprop')")
            i = await pg.evaluate("(()=>{ const I=RT.info(); return {block:Math.round(I.p.block), flight:Math.round(I.p.flight), ref:I.refMin, gap:I.gap, warn:I.warn, eta:I.etaUTC, loc:I.etaLoc, km:Math.round(I.p.km)}; })()")
            await pg.evaluate("RT.open()"); txt = await pg.inner_text('#rtdlg'); await pg.evaluate("RT.close()")
            h = f"{i['block']//60} h {i['block']%60:02d}" if i['block'] >= 60 else f"{i['block']} min"
            check(f'{ac} : proposition au lancement', prop)
            check(f'{ac} : durée prévue {h} (vol {i["flight"]} min, route {i["km"]} km), référence {i["ref"]}, écart {i["gap"]} %',
                  ('Durée prévue' in txt and 'Arrivée estimée' in txt and (ref is not None or 'pas de durée de référence' in txt))
                  and (ac not in ('b777', 'a320') or abs(i['gap']) <= 10),
                  f"ETA {i['eta']} UTC / {i['loc']} local" + (' — écart signalé' if i['warn'] else ''))
        await start(pg, 'b777')
        i = await pg.evaluate("RT.info().p.block")
        check('777 CDG → La Réunion ≈ 11 h (± 10 %)', abs(i - 660) <= 66, f'{i/60:.2f} h')
        # 2. confirmation → ×1 en croisière
        await pg.evaluate(SETUP)
        await pg.evaluate("JUMP(18,'auto')"); await pg.evaluate("drive(5)")
        await pg.evaluate("RT.open()"); await pg.click('#rtdlg [data-c]')
        rates = []
        for _ in range(40):
            await pg.evaluate("drive(40)"); rates.append(await pg.evaluate("rate"))
        st = await pg.evaluate("({rt:!!window.RT_LOCK, gnd:S.onGround, alt:Math.round(S.alt/FT), btn:document.getElementById('b-treal').textContent})")
        check('Temps réel confirmé : verrou actif, bouton « Temps réel ✓ »', st['rt'] and '✓' in st['btn'], st['btn'])
        check('Croisière en temps réel : ×1 en permanence (plus de ×64 automatique)', set(rates) == {1} and not st['gnd'], f"accélérations vues : {sorted(set(rates))}, {st['alt']} ft")
        # 3. sauvegarde puis reprise après 2 h simulées d'absence
        sv = await pg.evaluate("RT.save(); (()=>{ const s=JSON.parse(localStorage.getItem('pt-rt-save-v1')); return {i:s.i, lat:s.S.lat, lon:s.S.lon, fuel:Math.round(s.S.fuel)}; })()")
        check('Sauvegarde du vol (étape, position, carburant)', sv['i'] == 18 and sv['fuel'] > 0, sv)
        # 4. saut d'étape en temps réel : confirmation demandée
        await pg.evaluate("JUMP(20,'auto')"); await pg.wait_for_timeout(300)
        asked = await pg.evaluate("(()=>{ const w=document.getElementById('rtdlg'); return w?w.textContent:''; })()")
        stay = await pg.evaluate("GD.i")
        check('Saut en temps réel : « Quitter le temps réel ? » demandé, rien ne bouge', 'Quitter le temps réel' in asked and stay == 18, f'étape {stay}')
        await pg.click('#rtdlg [data-x]')
        # reprise : nouvelle page
        await pg.close()
        pg2 = await ctx.new_page(); pg2.on('pageerror', lambda e: errs.append(str(e)))
        await pg2.goto(URL, wait_until='domcontentloaded')
        # absence de 2 h : la sauvegarde faite à la fermeture de la page est vieillie de 2 h (avant l'affichage de la proposition)
        sv = await pg2.evaluate("(()=>{ const s=JSON.parse(localStorage.getItem('pt-rt-save-v1')); s.wall-=2*3600e3; localStorage.setItem('pt-rt-save-v1',JSON.stringify(s)); return {i:s.i, lat:s.S.lat, lon:s.S.lon, fuel:Math.round(s.S.fuel)}; })()")
        await pg2.wait_for_timeout(3500)
        banner = await pg2.evaluate("(()=>{ const d=document.getElementById('rtprop'); return d?d.textContent:''; })()")
        check('Au retour : proposition « Reprendre le vol »', 'Reprendre le vol' in banner, re.sub(r'\s+', ' ', banner)[:110])
        await pg2.click('#rtprop button'); await pg2.wait_for_timeout(4500)
        r = await pg2.evaluate("({i:GD.i, rt:!!window.RT_LOCK, gnd:S.onGround, alt:Math.round(S.alt/FT), lat:S.lat, lon:S.lon, fuel:Math.round(S.fuel), rate})")
        moved = await pg2.evaluate(f"gcKm({sv['lat']},{sv['lon']},S.lat,S.lon)")
        check('Reprise : même étape, en vol, temps réel toujours actif', r['i'] == 18 and r['rt'] and not r['gnd'] and r['rate'] == 1, r)
        check('Reprise : 2 h écoulées → appareil avancé sur la route, carburant consommé', 1300 < moved < 2000 and r['fuel'] < sv['fuel'],
              f"{moved:.0f} km parcourus, carburant {sv['fuel']} → {r['fuel']} kg")
        check('Aucune erreur JavaScript', not errs, errs[:3])
        await b.close()
    sys.exit(0 if ok_all else 1)
asyncio.run(main())
