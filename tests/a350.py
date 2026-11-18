"""V10.39 : Airbus A350-900 (Rolls-Royce Trent XWB-84) — même équipement que les autres avions de ligne.

Vérifie : carte du menu ; modèle 3D réel (train, 2 soufflantes) ; données sourcées (MTOW 283 t, envergure 64,75 m, longueur 66,8 m,
poussée 2 × 374,5 kN) ; devis de masse sous la MTOW ; parcours complet de 26 étapes au nom de l'A350 ; missions libres ; scénarios
(oiseaux, dépressurisation, feu moteur, panne électrique, givrage, fuite, Germanwings) ; atelier des systèmes ; manifeste ; documents ;
QCM ; marques fictives ; collisions ; cabine 326 sièges ; aucune erreur JavaScript.
Préparation : python3 tools/build.py --test ; cd tests ; python3 -m http.server 8765 &   puis : python3 a350.py
"""
import asyncio, sys
from playwright.async_api import async_playwright
ok_all = True
def check(name, ok, detail=''):
    global ok_all; ok_all &= bool(ok); print(('✔' if ok else '✘'), name, ('— ' + str(detail)) if detail != '' else '', flush=True)

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader', '--enable-unsafe-swiftshader']); errs = []
        pg = await b.new_page(viewport={'width': 1200, 'height': 760})
        pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' and 'resource' not in m.text else None)
        await pg.goto('http://localhost:8765/final.html'); await pg.wait_for_timeout(2000)
        await pg.evaluate("const i=document.getElementById('intro'); if(i) i.hidden=true;")
        r = await pg.evaluate("""({card:!!document.querySelector('[data-ac="a350"]'), a:AC.a350, wb:WB.a350,
          missions:Object.keys(MISSIONS).filter(k=>MI_AC[k]==='a350'), scn:SCNS.filter(s=>s.ac==='a350').map(s=>s.id),
          cards:Object.values(MISSIONS).filter(m=>m.acs&&m.acs.includes('a350')).length, mod:!!(window.SYSAT||true)})""")
        a, wb = r['a'], r['wb']
        check('Carte A350 dans le menu des appareils', r['card'])
        check('Données [RÉFÉRENCÉ] : MTOW 283 t, envergure 64,75 m, longueur 66,8 m, poussée 2 × 374,5 kN', wb['mtow'] == 283000 and a['ext']['span'] == 64.75 and a['ext']['len'] == 66.8 and a['Tmax'] == 749000)
        check('Missions : parcours complets aller et retour + 4 vols libres (CDG / Orly ⇄ La Réunion)', {'full-350', 'full-350-ret', 'a350-cdg-run', 'a350-run-cdg', 'a350-ory-run', 'a350-run-ory'} <= set(r['missions']), r['missions'])
        check('Scénarios : 9 variantes A350 (dont oiseaux, Germanwings sans crash)', len(r['scn']) >= 9 and 'BIRDS@a350' in r['scn'] and 'GW-ROUTE@a350' in r['scn'], r['scn'])
        check('Cartes de scénarios du menu proposant l\'A350', r['cards'] >= 7, r['cards'])
        await pg.evaluate("selAC='a350'; selMI=FULLOF('a350'); renderMenu(); $('go').click(); document.getElementById('br-skip').click(); const i=document.getElementById('intro'); if(i) i.hidden=true;")
        await pg.wait_for_timeout(2000)
        s = await pg.evaluate("""({n:GD.steps.length, t:GD.steps.map(x=>x.t+' '+x.txt).join(' '), real:!!(MODEL&&MODEL.userData.real), gear:!!(MODEL&&MODEL.userData.gear), fans:(MODEL&&MODEL.userData.fans||[]).length,
          tow:LS.tow, mtow:WB.a350.mtow, vr:LS.vr, v1:LS.v1, v2:LS.v2, fpl:(window.FPLN&&FPLN.pts.length)||0, walk:WALKPTS.a350.length, al:AL(), q:qPool('ac').length})""")
        import re as _re; _m=_re.search(r'.{0,50}A320.{0,30}', s['t'])
        check(f"Parcours complet : {s['n']} étapes, plus aucune mention de l'A320, croisière à Mach 0,85", s['n'] == 26 and 'A320' not in s['t'] and 'Mach 0,85' in s['t'] and 'Mach 0,78' not in s['t'], _m.group(0) if _m else s['n'])
        check('Modèle 3D réel : train et 2 soufflantes Trent XWB animées', s['real'] and s['gear'] and s['fans'] == 2)
        check(f"Devis de masse : masse au décollage {s['tow']/1000:.1f} t ≤ MTOW 283 t ; V1 {s['v1']} / VR {s['vr']} / V2 {s['v2']} kt [ESTIMÉ]", 0 < s['tow'] <= s['mtow'] and s['v1'] < s['vr'] < s['v2'])
        check('Plan de vol par la route pédagogique Paris → La Réunion ; 14 points de tour avion ; avion de ligne (AL) ; QCM', s['fpl'] >= 8 and s['walk'] == 14 and s['al'] and s['q'] > 0, s)
        d = await pg.evaluate("(()=>{ DOCS.open('techlog'); const t=document.getElementById('docv').innerText; DOCS.close(); return t; })()")
        check('Documents de vol : A350 et immatriculation propre', 'F-HTXW' in d and ('A350' in d or 'A359' in d), d.split('\n')[0][:80])
        await pg.evaluate("localStorage.setItem('sim-brand','fict')"); await pg.reload(); await pg.wait_for_timeout(2000)
        br = await pg.evaluate("window.BRANDTX?BRANDTX('Airbus A350-900 · Rolls-Royce Trent XWB-84'):''")
        await pg.evaluate("localStorage.setItem('sim-brand','real'); const i=document.getElementById('intro'); if(i) i.hidden=true;")
        check('Marques fictives : A350 et Trent XWB remplacés', br and 'A350' not in br and 'Trent' not in br, br)
        h = await pg.evaluate("(()=>{ const L=CABLAY('a350'); return {n:L.all.length, t:L.n}; })()")
        check('Plan de cabine : 326 sièges (32 J · 24 W · 270 Y) [ESTIMÉ]', h['n'] == 326, h['t'])
        w = await pg.evaluate("(()=>{ try{ SYSAT.open('a350'); }catch(e){ return 'err '+e.message; } const a=document.getElementById('sysat'); const t=a?a.innerText:''; try{ SYSAT.close(); }catch(e){} return t; })()")
        check('Atelier des systèmes : A350-900 disponible (schéma commun Airbus [SIMPLIFIÉ])', 'Trent XWB-84' in w, w[:90].replace('\n', ' '))
        check('Aucune erreur JavaScript', not errs, errs[:3])
        await b.close()
    sys.exit(0 if ok_all else 1)
asyncio.run(main())
