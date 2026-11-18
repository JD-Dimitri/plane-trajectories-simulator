"""F4 (V10.38) : vue « Cabine » 3D et poste plus détaillé, pour les 7 appareils.

Vérifie : bouton « Cabine » à côté de « Cockpit » et « Extérieur » ; cabine visible seulement dans cette vue ; nombre de sièges = plan de cabine
existant (+ pilotes quand cabine et poste ne font qu'un) ; œil sous le plafond ; déplacement dans l'allée borné ; retour au cockpit ;
poste détaillé construit ; aucune erreur JavaScript.
Préparation : python3 tools/build.py --test ; cd tests ; python3 -m http.server 8765 &   puis : python3 cabine_vue.py
"""
import asyncio, sys
from playwright.async_api import async_playwright
ok_all = True
def check(name, ok, detail=''):
    global ok_all; ok_all &= bool(ok); print(('✔' if ok else '✘'), name, ('— ' + str(detail)) if detail != '' else '', flush=True)
CREW = {'c172': 1, 'h125': 1, 'r44': 1}

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader', '--enable-unsafe-swiftshader']); errs = []
        for ac in ['a320', 'b777', 'a350', 'lj60', 'c172', 'h125', 'r44', 's76']:
            pg = await b.new_page(viewport={'width': 900, 'height': 600}); pg.on('pageerror', lambda e: errs.append(str(e)))
            await pg.goto('http://localhost:8765/final.html'); await pg.wait_for_timeout(1800)
            await pg.evaluate(f"selAC='{ac}'; selMI=FULLOF('{ac}'); renderMenu(); $('go').click(); document.getElementById('br-skip').click(); const i=document.getElementById('intro'); if(i) i.hidden=true;")
            await pg.wait_for_timeout(1000)
            r0 = await pg.evaluate("({btn:!!document.querySelector('[data-v=\"cab\"]'), vis:CABIN.G.visible, ck:CK3D.G.children.length})")
            await pg.evaluate("document.querySelector('[data-v=\"cab\"]').click()"); await pg.wait_for_timeout(800)
            r = await pg.evaluate(f"""(()=>{{ const c=CABIN.cam(); return {{vis:CABIN.G.visible, n:c.n, lay:CABLAY('{ac}').all.length, y:c.y, z:CABIN.pos(), zmin:c.zmin, zmax:c.zmax, on:!!document.querySelector('[data-v="cab"].on'), nav:!document.getElementById('cabnav').hidden}}; }})()""")
            ceil = await pg.evaluate("(()=>{ const c=CABIN.cam(); const top=Math.max(...CABIN.G.children[0].children.map(m=>m.position.y)); return c.y<top; })()")
            await pg.evaluate("window.CAB_MV=1"); await pg.wait_for_timeout(1500); await pg.evaluate("window.CAB_MV=0")
            z2 = await pg.evaluate("CABIN.pos()")
            await pg.evaluate("setView('ck')"); await pg.wait_for_timeout(500)
            r2 = await pg.evaluate("({vis:CABIN.G.visible, nav:!!document.getElementById('cabnav')&&!document.getElementById('cabnav').hidden, ck:CK3D.G.children.length})")
            check(f"{ac} : bouton « Cabine », cabine cachée hors de sa vue", r0['btn'] and not r0['vis'])
            check(f"{ac} : {r['n']} sièges = plan de cabine ({r['lay']}) + pilotes", r['vis'] and r['n'] == r['lay'] + CREW.get(ac, 0), r)
            check(f"{ac} : œil sous le plafond, déplacement dans l'allée borné", ceil and r['zmin'] - 1e-6 <= z2 <= r['zmax'] + 1e-6, f"z {r['z']:.2f} → {z2:.2f}")
            check(f"{ac} : retour au cockpit (cabine masquée, poste détaillé construit)", not r2['vis'] and not r2['nav'] and r2['ck'] > 0, r2)
            await pg.close()
        check('Aucune erreur JavaScript', not errs, errs[:3])
        await b.close()
    sys.exit(0 if ok_all else 1)
asyncio.run(main())
