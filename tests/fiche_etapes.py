"""F9 (V10.38) : fiche détaillée de chaque étape, même méthode pour les 7 appareils.

Vérifie :
  - chaque étape de chaque parcours complet a sa fiche (pourquoi, contrôles, anomalies, documents, simulateur) affichée dans le guide ;
  - chaque point du tour avion / hélicoptère a sa fiche de point ;
  - anomalie tirée au tour (réglage « toujours ») : mauvaise décision refusée, bonne décision → tableau des départs « RETARDÉ »,
    entrée au compte rendu matériel ; en mode automatique, la décision se prend seule ;
  - aucune erreur JavaScript ; captures écran sur téléphone (390 × 800).
Préparation : python3 tools/build.py --test ; cd tests ; python3 -m http.server 8765 &   puis : python3 fiche_etapes.py
"""
import os
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'out') + os.sep; os.makedirs(OUT, exist_ok=True)
import asyncio, sys
from playwright.async_api import async_playwright
URL = 'http://localhost:8765/final.html'
ACS = ['a320', 'b777', 'a350', 'lj60', 'c172', 'h125', 'r44', 's76']
ok_all = True
def check(name, ok, detail=''):
    global ok_all; ok_all &= bool(ok); print(('✔' if ok else '✘'), name, ('— ' + str(detail)) if detail != '' else '', flush=True)

async def start(pg, ac, mode='m-peda', ano='jamais', intro=False):
    await pg.goto(URL); await pg.wait_for_timeout(1800)
    await pg.evaluate(f"localStorage.setItem('pt-ano','{ano}'); selAC='{ac}'; selMI=FULLOF('{ac}'); renderMenu(); $('m-peda').checked={'true' if mode=='m-peda' else 'false'}; $('m-auto').checked={'true' if mode=='m-auto' else 'false'}; $('go').click(); document.getElementById('br-skip').click();")
    if not intro: await pg.evaluate("const i=document.getElementById('intro'); if(i) i.hidden=true;")
    await pg.wait_for_timeout(900)

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader', '--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': 1200, 'height': 800}); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' and 'resource' not in m.text else None)
        # 1. couverture : toutes les étapes, tous les points
        for ac in ACS:
            await start(pg, ac)
            r = await pg.evaluate("""(()=>{ const miss=[], shown=[]; for(let i=0;i<GD.steps.length;i++){ const f=FICHE.of(GD.steps[i]); if(!f||!f.why||!f.check.length||!f.doc) miss.push(i+':'+GD.steps[i].t); }
              const pts=(WALKPTS[ACK]||[]).filter(w=>!FICHE.wp(w[2])).map(w=>w[2]);
              goStep(0); const a=!!document.querySelector('#guide details.fi'); goStep(GD.steps.length-2); const z=!!document.querySelector('#guide details.fi');
              return {n:GD.steps.length, miss, pts, a, z, npts:(WALKPTS[ACK]||[]).length}; })()""")
            check(f"{ac} : fiche pour les {r['n']} étapes, affichée dans le guide", not r['miss'] and r['a'] and r['z'], r['miss'][:3])
            check(f"{ac} : fiche pour les {r['npts']} points du tour", not r['pts'], r['pts'])
        # bon classement de quelques points et étapes
        await start(pg, 'c172')
        c = await pg.evaluate("""({nez:FICHE.wp('Nez, moteur, hélice').check.join(' '), apd:FICHE.of({t:'Après décollage : train, volets'}).why, apa:FICHE.of({t:"Après l'atterrissage, dégagement"}).why, fin:FICHE.wp('Retour porte L1 : monter à bord').check[0]})""")
        check('C172 « Nez, moteur, hélice » → fiche moteur et hélice', 'hélice' in c['nez'], c['nez'][:60])
        check('« Après décollage » → fiche montée (pas décollage)', 'Nettoyer la configuration' in c['apd'])
        check('« Après l\'atterrissage » → fiche dégagement (pas atterrissage)', 'Dégager la piste' in c['apa'])
        check('« Retour porte L1 : monter à bord » → fiche fin de tour', 'Tour complet' in c['fin'])
        # 2. anomalie au tour, mode guidé
        for ac in ['a320', 'c172']:
            await start(pg, ac, 'm-peda', 'toujours')
            k = await pg.evaluate("GD.steps.findIndex(s=>s.walk&&/Tour/.test(s.t))")
            await pg.evaluate(f"goStep({k})"); await pg.wait_for_timeout(300)
            a = await pg.evaluate("(()=>{ const x=GD.ano; return x?{i:x.i,t:x.a[0],ok:x.a[4].ok,items:GD.steps[GD.i].items.map(i=>i[0])}:null; })()")
            check(f"{ac} : anomalie tirée au tour", a is not None, a and f"point {a['i']+1} : {a['t']}")
            if a: check(f"{ac} : aucune ligne « anomalie » avant de l'avoir découverte (rien ne la trahit)", not any('Anomalie' in x for x in a['items']), a['items'])
            if not a: continue
            await pg.evaluate(f"GD.seen.add({a['i']}); walkBox({a['i']})"); await pg.wait_for_timeout(200)
            vis = await pg.evaluate("!!document.querySelector('#g-wp .ano') && !!document.querySelector('#g-wp .ano svg') && !!document.querySelector('#g-wp details.fi')")
            check(f"{ac} : boîte d'anomalie avec dessin et fiche du point", vis)
            await pg.screenshot(path=OUT+'ano_desktop_'+ac+'.png')
            wrong = (a['ok'] + 1) % 3
            await pg.evaluate(f"document.querySelector('#g-wp .ano [data-c=\"{wrong}\"]').click()"); await pg.wait_for_timeout(150)
            w = await pg.evaluate("({ko:!!document.querySelector('#g-wp .ano .ko'), done:GD.ano.done})")
            check(f"{ac} : mauvaise décision expliquée, anomalie non traitée", w['ko'] and not w['done'])
            await pg.evaluate(f"document.querySelector('#g-wp .ano [data-c=\"{a['ok']}\"]').click()"); await pg.wait_for_timeout(300)
            f = await pg.evaluate("(()=>{ const d=document.getElementById('fids'); return {done:GD.ano.done, fids:d?d.innerText:'', item:GD.steps[GD.i].items.slice(-1)[0][1]()}; })()")
            check(f"{ac} : bonne décision → retard affiché ({'planning aéroclub' if ac=='c172' else 'tableau des départs'})", f['done'] and 'RETARDÉ' in f['fids'] and f['item'], f['fids'].split('\n')[0])
            await pg.evaluate("document.querySelector('#fids [data-x]').click(); DOCS.open('techlog')"); await pg.wait_for_timeout(400)
            tl = await pg.evaluate("(()=>{ const v=document.getElementById('docv'); return v?v.innerText:''; })()")
            check(f"{ac} : entrée au compte rendu matériel", a['t'] in tl, [l for l in tl.split('\n') if 'Tour avion' in l][:1])
            await pg.evaluate("DOCS.close()")
        # 3. mode automatique : la décision se prend seule
        await start(pg, 'a320', 'm-auto', 'toujours')
        k = await pg.evaluate("GD.steps.findIndex(s=>s.walk&&/Tour/.test(s.t))")
        await pg.evaluate(f"JUMP({k},'auto')"); await pg.wait_for_timeout(500)
        has = await pg.evaluate("!!GD.ano")
        if has:
            await pg.evaluate("GD.seen.add(GD.ano.i); walkBox(GD.ano.i)"); await pg.wait_for_timeout(3200)
        d = await pg.evaluate("GD.ano?GD.ano.done:null")
        check('Mode automatique : anomalie traitée seule (bonne décision montrée)', has and d, d)
        # 4. téléphone
        mp = await b.new_page(viewport={'width': 390, 'height': 800}, device_scale_factor=2, is_mobile=True, has_touch=True)
        mp.on('pageerror', lambda e: errs.append(str(e)))
        await mp.goto(URL); await mp.wait_for_timeout(1500)
        await mp.evaluate("localStorage.removeItem('pt-intro-seen'); Object.keys(localStorage).filter(k=>/intro/i.test(k)).forEach(k=>localStorage.removeItem(k))")
        await start(mp, 'a320', 'm-peda', 'toujours', intro=True); await mp.wait_for_timeout(1800)
        st = await mp.evaluate("(()=>{ const i=document.getElementById('intro'); return {intro:!!(i&&!i.hidden), rt:!!document.getElementById('rtprop')}; })()")
        check('Téléphone : pas de proposition « temps réel » par-dessus l\'introduction', not (st['intro'] and st['rt']), st)
        await mp.evaluate("const i=document.getElementById('intro'); if(i&&!i.hidden){ const b=i.querySelector('[data-sim]'); if(b) b.click(); else i.hidden=true; }"); await mp.wait_for_timeout(1800)
        st2 = await mp.evaluate("(()=>{ const d=document.getElementById('rtprop'); if(!d) return null; const r=d.getBoundingClientRect(); return {l:Math.round(r.left), r:Math.round(r.right)}; })()")
        check('Téléphone : la proposition apparaît après l\'introduction, dans l\'écran', st2 is not None and st2['l'] >= 0 and st2['r'] <= 390, st2)
        await mp.screenshot(path=OUT+'rtprop_mobile.png')
        await mp.evaluate("const d=document.getElementById('rtprop'); if(d) d.remove();")
        k = await mp.evaluate("GD.steps.findIndex(s=>s.walk&&/Tour/.test(s.t))")
        await mp.evaluate(f"goStep({k}); GD.fiOpen=true; renderGuide(); if(GD.ano){{ GD.seen.add(GD.ano.i); walkBox(GD.ano.i); }}"); await mp.wait_for_timeout(400)
        await mp.screenshot(path=OUT+'ano_mobile.png')
        ov = await mp.evaluate("(()=>{ const g=document.getElementById('guide').getBoundingClientRect(); return {w:Math.round(g.width), right:Math.round(g.right), sw:document.documentElement.scrollWidth}; })()")
        check('Téléphone : guide et fiche dans l\'écran, sans défilement horizontal', ov['right'] <= 390 and ov['sw'] <= 392, ov)
        await mp.evaluate("goStep(15)"); await mp.wait_for_timeout(300)
        await mp.screenshot(path=OUT+'fiche_mobile_decollage.png')
        check('Aucune erreur JavaScript', not errs, errs[:3])
        await b.close()
    sys.exit(0 if ok_all else 1)
asyncio.run(main())
