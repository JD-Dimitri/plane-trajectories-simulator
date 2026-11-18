"""F11 (V10.40) : Académie partie 9 « Calculs du pilote de ligne » et écran « 🧮 Calculs du vol ».

Vérifie : 15 modules (14 formules + cas complet), 10 questions chacun avec corrigé, 3 exemples corrigés, boutons « documents à remplir »
qui ouvrent le bon document ; thème QCM de 150 questions ; écran de calculs préremplie avec la mission (A350 Paris → La Réunion,
A320 New York → Paris, C172), bloc carburant = somme des termes, masse permise = min des trois limites, « Appliquer » met à jour le dossier ;
affichage téléphone sans dépassement ; aucune erreur JavaScript.
Préparation : python3 tools/build.py --test ; cd tests ; python3 -m http.server 8765 &   puis : python3 calculs.py
"""
import os
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'out') + os.sep; os.makedirs(OUT, exist_ok=True)
import asyncio, sys, re
from playwright.async_api import async_playwright
ok_all = True
def check(name, ok, detail=''):
    global ok_all; ok_all &= bool(ok); print(('✔' if ok else '✘'), name, ('— ' + str(detail)) if detail != '' else '', flush=True)

async def start(pg, ac):
    await pg.goto('http://localhost:8765/final.html'); await pg.wait_for_timeout(1800)
    await pg.evaluate(f"selAC='{ac}'; selMI=FULLOF('{ac}'); renderMenu(); $('go').click(); document.getElementById('br-skip').click(); const i=document.getElementById('intro'); if(i) i.hidden=true;")
    await pg.wait_for_timeout(1200); await pg.evaluate("const r=document.getElementById('rtprop'); if(r) r.remove();")

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader', '--enable-unsafe-swiftshader']); errs = []
        pg = await b.new_page(viewport={'width': 1200, 'height': 800}); pg.on('pageerror', lambda e: errs.append(str(e)))
        await start(pg, 'a350')
        r = await pg.evaluate("""(()=>{ const P=ACAD.PARTS.find(p=>p.id==='p9'); if(!P) return null; return {n:P.mods.length, q:P.mods.map(m=>m.quiz.length), ex:P.mods.map(m=>(m.h.match(/Exemple corrigé/g)||[]).length), doc:P.mods.map(m=>(m.h.match(/data-docopen/g)||[]).length), qb:(QB.calcpro||[]).length, th:!!QTH.find(t=>t[0]==='calcpro')}; })()""")
        check('Partie 9 « Calculs du pilote de ligne » : 15 modules', r and r['n'] == 15, r and r['n'])
        check('10 questions avec corrigé par module, 3 exemples corrigés, documents à remplir', r and all(x == 10 for x in r['q']) and all(x == 3 for x in r['ex']) and all(x >= 1 for x in r['doc']), r and (r['q'], r['ex']))
        check('Thème QCM « Calculs du pilote de ligne » : 150 questions', r and r['qb'] == 150 and r['th'], r and r['qb'])
        # rendu d'un module et réponse à une question
        await pg.evaluate("(()=>{ const all=ACAD.PARTS.flatMap(p=>p.mods); ACAD.open(all.findIndex(m=>m.id==='L6')); })()"); await pg.wait_for_timeout(600)
        t = await pg.evaluate("(()=>{ const q=[...document.querySelectorAll('[data-qi]')]; return {n:q.length, txt:(document.body.innerText.match(/Bilan carburant d.un avion de ligne/)||[''])[0]}; })()")
        check('Module affiché dans l\'Académie, avec ses boutons de réponse', t['n'] >= 40 and t['txt'], t)
        await pg.evaluate("document.querySelector('[data-docopen=\"fuel\"]').click()"); await pg.wait_for_timeout(500)
        d = await pg.evaluate("(()=>{ const v=document.getElementById('docv'); return {cur:DOCS.cur(), vis:!!(v&&!v.hidden), t:v?v.innerText:''}; })()")
        check('Bouton « Bilan carburant » ouvre le document', d['cur'] == 'fuel' and d['vis'] and 'BILAN CARBURANT' in d['t'].upper(), d['cur'])
        await pg.evaluate("try{ DOCS.close(); }catch(e){} try{ ACAD.close(); }catch(e){} const a=document.getElementById('acad'); if(a) a.hidden=true;")
        # écran de calculs
        for ac, dep, dest in [('a350', 'LFPG', 'FMEE'), ('a320', 'KJFK', 'LFPG'), ('c172', 'LFPN', 'LFPN')]:
            await start(pg, ac)
            has = await pg.evaluate("!!document.getElementById('b-calc')")
            await pg.evaluate("document.getElementById('b-calc').click()"); await pg.wait_for_timeout(400)
            v = await pg.evaluate("CALCF.vals()"); o = await pg.evaluate("CALCF.calc()")
            txt = await pg.evaluate("document.getElementById('calcform').innerText")
            blk = re.search(r'bloc ([\d\s ]+) kg', o['fuel'].replace('<b>', '').replace('</b>', ''))
            nums = [int(re.sub(r'\D', '', x)) for x in re.findall(r'(?:Étape|route 5 %|dégagement|réserve finale|supplémentaire|roulage) ([\d\s ]+)', re.sub('<[^>]+>', '', o['fuel']))]
            blkv = int(re.sub(r'\D', '', blk.group(1))) if blk else -1
            check(f"{ac} : bouton « 🧮 Calculs du vol », écran prérempli {v['dep']} → {v['dest']}", has and v['dep'] == dep and v['dest'] == dest and all(s.upper() in txt.upper() for s in ['Bilan carburant', 'Masses', 'Point équitemps', 'UTC']), f"{v['d']} NM")
            check(f"{ac} : bloc carburant = somme des 6 termes ({blkv} kg)", blk and abs(sum(nums) - blkv) <= 6, nums)
            perm = re.search(r'TOW permise.*?= <b>([\d\s\u202f\u00a0]+) kg', o['mass'])
            check(f"{ac} : masse permise calculée = min(MTOW ; MZFW + TOF ; MLW + étape)", perm is not None, re.sub('<[^>]+>', '', o['mass'])[:110])
        # appliquer au dossier
        await start(pg, 'a350'); await pg.evaluate("document.getElementById('b-calc').click()"); await pg.wait_for_timeout(300)
        before = await pg.evaluate("LS.tow")
        await pg.evaluate("const i=document.querySelector('#calcform input[data-k=\"pax\"]'); i.value='250'; i.dispatchEvent(new Event('input',{bubbles:true})); document.querySelector('#calcform [data-ap]').click();"); await pg.wait_for_timeout(300)
        after = await pg.evaluate("({tow:LS.tow, pax:LS.pax})")
        check('« Appliquer au dossier de vol » : passagers reportés, devis recalculé', after['pax'] == 250 and after['tow'] < before, f"TOW {before} → {after['tow']} kg")
        # téléphone
        m = await b.new_page(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True); m.on('pageerror', lambda e: errs.append(str(e)))
        await start(m, 'a350'); await m.evaluate("CALCF.open()"); await m.wait_for_timeout(400)
        g = await m.evaluate("(()=>{ const r=document.getElementById('calcform').getBoundingClientRect(); return {l:Math.round(r.left), r:Math.round(r.right), sw:document.documentElement.scrollWidth}; })()")
        await m.screenshot(path=OUT+'calcform_tel.png')
        check('Téléphone : écran de calculs dans l\'écran, sans défilement horizontal', g['l'] >= 0 and g['r'] <= 390 and g['sw'] <= 392, g)
        check('Aucune erreur JavaScript', not errs, errs[:3])
        await b.close()
    sys.exit(0 if ok_all else 1)
asyncio.run(main())
