"""F29 (V10.41) : tour avion en mode AUTO sur les 8 appareils — le marcheur contourne l'appareil.

Pour chaque appareil : parcours complet, étape « Arrivée au parking », mode AUTO, vue à pied. La marche automatique est
simulée en accéléré (pas de 0,1 s) : tous les points du tour doivent être contrôlés, la caméra ne doit jamais s'approcher
à moins de 0,5 m de la coque (sinon l'écran n'affiche plus que le fuselage : vue « bloquée » signalée sur le Learjet 60),
et le tour doit durer moins de 6 min simulées. Une capture téléphone du Learjet pendant le tour est enregistrée.
Préparation : python3 tools/build.py --test ; cd tests ; python3 -m http.server 8765 &   puis : python3 tour_auto.py [ac …]
"""
import asyncio, sys
from playwright.async_api import async_playwright
ACS = sys.argv[1:] or ['lj60', 'a320', 'a350', 'b777', 'c172', 'h125', 'r44', 's76']
ok_all = True
def check(name, ok, detail=''):
    global ok_all; ok_all &= bool(ok); print(('✔' if ok else '✘'), name, ('— ' + str(detail)) if detail != '' else '', flush=True)
RUN = """((n)=>{ AUTO.on=true; AUTO.stage='act'; let t=0, mn=1e9, i=0; const H=(window.WALKAUTO||{}).clr;
  for(i=0;i<n&&!walkDone();i++){ autoWalk(0.1); walkCheck(); t+=0.1; if(H){ const [x,z]=(()=>{ const c=Math.cos(-S.psi), s=Math.sin(-S.psi); return [GD.walk.x*c-GD.walk.z*s, GD.walk.x*s+GD.walk.z*c]; })(); mn=Math.min(mn,H(x,z,0)); } }
  return {done:walkDone(), t:Math.round(t), mn:+mn.toFixed(2), seen:GD.seen.size, n:(WALKPTS[ACK]||[]).length}; })"""

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader', '--enable-unsafe-swiftshader']); errs = []
        for ac in ACS:
            tel = ac == 'lj60'
            pg = await (b.new_page(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True) if tel else b.new_page(viewport={'width': 1200, 'height': 800}))
            pg.on('pageerror', lambda e: errs.append(f'{ac}: {e}'))
            await pg.goto('http://localhost:8765/final.html'); await pg.wait_for_timeout(1800)
            await pg.evaluate(f"const i=document.getElementById('intro'); if(i) i.hidden=true; selAC='{ac}'; selMI=FULLOF('{ac}'); renderMenu(); $('m-auto').checked=true; $('go').click(); document.getElementById('br-skip').click();")
            await pg.wait_for_timeout(1500); await pg.evaluate("const r=document.getElementById('rtprop'); if(r) r.remove();")
            k = await pg.evaluate("GD.steps.findIndex(s=>/Arrivée au parking/.test(s.t))")
            await pg.evaluate(f"goStep({k}); AUTO.on=true;"); await pg.wait_for_timeout(1200)
            r = await pg.evaluate(RUN + "(1200)")   # 1 200 pas de 0,1 s = 2 min, puis un point de mesure
            if tel: await pg.screenshot(path='tests/out/tour_lj60_tel.png')
            r2 = await pg.evaluate(RUN + "(2400)") if not r['done'] else r
            t = r['t'] + (r2['t'] if r2 is not r else 0); mn = min(r['mn'], r2['mn'])
            check(f"{ac} : tour avion automatique terminé ({r2['seen']}/{r2['n']} points en {t // 60} min {t % 60:02d} s simulées), caméra à {mn} m de la coque au plus près",
                  r2['done'] and mn >= 0.5 and t <= 360, r2)
            await pg.close()
        check('Aucune erreur JavaScript', not errs, errs[:3]); await b.close()
    sys.exit(0 if ok_all else 1)
asyncio.run(main())
