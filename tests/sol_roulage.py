"""F34 (V10.42) : le mécanicien et les véhicules au sol (tracteur, groupe de parc, minibus) disparaissent avant le roulage.

Atelier des systèmes, visite automatique de l'avion jusqu'au roulage, pour plusieurs appareils : au moment où l'avion roule
(environnement « taxi », vitesse > 2 kt), plus aucun personnel ni véhicule au sol n'est affiché autour de l'avion.
Préparation : python3 tools/build.py --test ; cd tests ; python3 -m http.server 8765 &   puis : python3 sol_roulage.py [ac …]
"""
import asyncio, sys
from playwright.async_api import async_playwright
ACS = sys.argv[1:] or ['lj60', 'a320', 'b777', 'a350']
ok_all = True
def check(name, ok, detail=''):
    global ok_all; ok_all &= bool(ok); print(('✔' if ok else '✘'), name, ('— ' + str(detail)) if detail != '' else '', flush=True)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader', '--enable-unsafe-swiftshader']); errs = []
        pg = await b.new_page(viewport={'width': 1200, 'height': 800}); pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('http://localhost:8765/final.html'); await pg.wait_for_timeout(2000)
        for ac in ACS:
            await pg.evaluate(f"const i=document.getElementById('intro'); if(i) i.hidden=true; SYSAT.open('{ac}');"); await pg.wait_for_timeout(600)
            await pg.evaluate(f"SYSAT.MOD['{ac}'].tours.vol._ok=true; SYSAT.tourStart('vol','auto')"); await pg.wait_for_timeout(300)
            r = None
            for _ in range(600):
                r = await pg.evaluate("""(()=>{ const T=SYSAT._t; for(let i=0;i<6;i++){ T.ff(); T.adv(3); } const w=SYSAT.world()||{}, S=SYSAT.S, st=T.TOUR&&T.TOUR.st[T.TI];
                  const vis=Object.keys(S.act||{}).filter(k=>/^(meca|tug|gpuv|bus|pbus)/.test(k)&&!S.act[k].hide&&!S.act[k].hidden);
                  return {env:w.env, ias:Math.round(w.ias||0), t:st?st.t||st.title||'':'', vis, done:!st}; })()""")
                if r['env'] == 'taxi' and r['ias'] > 2 or r['done']: break
            check(f"{ac} : au roulage ({r['ias']} kt), plus de personnel ni de véhicule au sol", r['env'] == 'taxi' and not r['vis'], r)
            await pg.evaluate("try{ SYSAT.close(); }catch(e){}")
        check('Aucune erreur JavaScript', not errs, errs[:3]); await b.close()
    sys.exit(0 if ok_all else 1)
asyncio.run(main())
