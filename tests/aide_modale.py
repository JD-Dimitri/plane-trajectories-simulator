"""F31 (V10.42) : aide « Commandes » en fenêtre modale défilante.

Téléphone (390 × 844) et ordinateur : la fenêtre tient dans l'écran, son en-tête (titre et ✕) est visible en entier,
le contenu défile de haut en bas, la ✕ ferme, le fond assombri ferme, Échap ferme. Aucune erreur JavaScript.
Préparation : python3 tools/build.py --test ; cd tests ; python3 -m http.server 8765 &   puis : python3 aide_modale.py
"""
import asyncio, sys
from playwright.async_api import async_playwright
ok_all = True
def check(name, ok, detail=''):
    global ok_all; ok_all &= bool(ok); print(('✔' if ok else '✘'), name, ('— ' + str(detail)) if detail != '' else '', flush=True)
G = """(()=>{ const h=document.getElementById('help'), x=document.getElementById('help-x'), b=h.querySelector('.hbd'), r=h.getBoundingClientRect(), rx=x.getBoundingClientRect();
  return {vis:!h.hidden, top:Math.round(r.top), bot:Math.round(r.bottom), H:innerHeight, xt:Math.round(rx.top), xb:Math.round(rx.bottom), xl:Math.round(rx.left), xr:Math.round(rx.right), W:innerWidth,
          scroll:b?b.scrollHeight>b.clientHeight+5:false, bg:!document.getElementById('helpbg').hidden}; })()"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader', '--enable-unsafe-swiftshader']); errs = []
        for nm, kw in [('téléphone', dict(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)), ('ordinateur', dict(viewport={'width': 1280, 'height': 720}))]:
            pg = await b.new_page(**kw); pg.on('pageerror', lambda e: errs.append(str(e)))
            await pg.goto('http://localhost:8765/final.html'); await pg.wait_for_timeout(1800)
            await pg.evaluate("const i=document.getElementById('intro'); if(i) i.hidden=true; selAC='a320'; selMI=FULLOF('a320'); renderMenu(); $('go').click(); document.getElementById('br-skip').click();")
            await pg.wait_for_timeout(1500); await pg.evaluate("toggleHelp()"); await pg.wait_for_timeout(400)
            r = await pg.evaluate(G)
            check(f"{nm} : fenêtre dans l'écran, ✕ entièrement visible", r['vis'] and r['top'] >= 0 and r['bot'] <= r['H'] and r['xt'] >= 0 and r['xr'] <= r['W'], r)
            if nm == 'téléphone': check(f"{nm} : contenu qui défile, fond assombri", r['scroll'] and r['bg'], r)
            await pg.mouse.click((r['xl'] + r['xr']) / 2, (r['xt'] + r['xb']) / 2); await pg.wait_for_timeout(300)
            c1 = await pg.evaluate("document.getElementById('help').hidden")
            await pg.evaluate("toggleHelp()"); await pg.wait_for_timeout(200); await pg.mouse.click(5, 5 if nm == 'ordinateur' else r['H'] - 5); await pg.wait_for_timeout(300)
            c2 = await pg.evaluate("document.getElementById('help').hidden")
            await pg.evaluate("toggleHelp()"); await pg.wait_for_timeout(200); await pg.keyboard.press('Escape'); await pg.wait_for_timeout(300)
            c3 = await pg.evaluate("document.getElementById('help').hidden && document.getElementById('helpbg').hidden")
            check(f"{nm} : ferme par la ✕, par le fond et par Échap", c1 and c2 and c3, (c1, c2, c3))
            if nm == 'téléphone':
                await pg.evaluate("toggleHelp()"); await pg.wait_for_timeout(300); await pg.screenshot(path='tests/out/aide_tel.png')
            await pg.close()
        check('Aucune erreur JavaScript', not errs, errs[:3]); await b.close()
    sys.exit(0 if ok_all else 1)
asyncio.run(main())
