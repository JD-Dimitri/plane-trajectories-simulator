"""F10 (V10.38) : test de positionnement de 30 questions par thème, du plus facile au plus difficile.

Vérifie : 30 questions de mathématiques et 30 de culture aéronautique ; niveau affiché (facile, moyen, difficile) ;
la bonne réponse n'est pas toujours la première ; un élève qui répond juste obtient 30 / 30 partout ; aucune erreur JavaScript.
Préparation : python3 tools/build.py --test ; cd tests ; python3 -m http.server 8765 &   puis : python3 positionnement.py
"""
import asyncio, sys
from playwright.async_api import async_playwright
ok_all = True
def check(name, ok, detail=''):
    global ok_all; ok_all &= bool(ok); print(('✔' if ok else '✘'), name, ('— ' + str(detail)) if detail != '' else '', flush=True)

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader', '--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': 390, 'height': 800}); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('http://localhost:8765/final.html'); await pg.wait_for_timeout(2000)
        await pg.evaluate("document.querySelector('#intro [data-test]').click()"); await pg.wait_for_timeout(200)
        first_ok, levels, n = 0, set(), 0
        for i in range(80):
            h = await pg.evaluate("(()=>{ const h=document.querySelector('#intro h2'); return h?h.textContent:''; })()")
            if 'Test de positionnement' not in h: break
            n += 1; levels.add(h.split('niveau ')[-1].strip())
            ok_idx = await pg.evaluate("(()=>{ const bs=[...document.querySelectorAll('#intro .op')]; return bs.map(b=>+b.dataset.qi); })()")
            if ok_idx[0] == 0: first_ok += 1
            await pg.evaluate("document.querySelector('#intro .op[data-qi=\"0\"]').click()")   # la bonne réponse est l'indice 0 des données
            await pg.evaluate("document.querySelector('#intro [data-next]').click()"); await pg.wait_for_timeout(30)
        r = await pg.evaluate("JSON.parse(localStorage.getItem('sim-level')||'null')")
        check('60 questions (30 mathématiques + 30 sciences utiles au vol)', n == 60, n)
        check('Niveaux affichés : facile, moyen, difficile', {'facile', 'moyen', 'difficile'} <= levels, sorted(levels))
        check('Bonne réponse pas toujours en premier (ordre mélangé)', first_ok < 40, f'{first_ok} / 60 en première position')
        check('Toutes justes → 30 / 30 et 30 / 30', r and r['m'] == 30 and r['a'] == 30, r)
        txt = await pg.evaluate("document.getElementById('intro').innerText")
        check('Résultat affiché avec parcours conseillé', 'partie 7' in txt.lower() or 'calculs' in txt.lower(), txt[:80].replace('\n', ' '))
        h = await pg.evaluate("(()=>{ const a=document.querySelector('#intro h2'); return document.getElementById('intro').innerText.includes('Sciences utiles au vol'); })()")
        check('Résultat : jauge « Sciences utiles au vol » (test scientifique)', h)
        await pg.evaluate("document.getElementById('intro').hidden=true; qcmOpen()"); await pg.wait_for_timeout(200)
        th = await pg.evaluate("[...document.querySelectorAll('#qcm [data-qt]')].map(b=>b.textContent)")
        check('QCM : section « TEST POST PARCOURS ET TESTS - AÉRONAUTIQUE »', any('TEST POST PARCOURS ET TESTS - AÉRONAUTIQUE' in t for t in th) and any('TESTS - AÉRONAUTIQUE' in t for t in th), [t for t in th if 'TEST' in t])
        await pg.evaluate("qcmOpen('post',30)"); await pg.wait_for_timeout(200)
        n2 = await pg.evaluate("QZ.list.length"); c = await pg.evaluate("QB.aero.length")
        check('Test post parcours : 30 questions tirées de tous les thèmes ; 30 questions de culture aéronautique déplacées', n2 == 30 and c == 30, f'{n2} questions, culture {c}')
        check('Aucune erreur JavaScript', not errs, errs[:3])
        await b.close()
    sys.exit(0 if ok_all else 1)
asyncio.run(main())
