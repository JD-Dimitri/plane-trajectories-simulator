"""Modification 9 (V10.37) : choisir une étape mène DIRECTEMENT à cette étape, pour les 7 appareils.

Pour chaque appareil et chaque étape cible (une étape cockpit, puis toutes les étapes à partir du roulage) :
  - page neuve, parcours complet lancé en mode automatique ;
  - JUMP(k) : moins de 3 s, GD.i === k, position et état attendus selon la phase ;
  - 60 s de vol automatique (horloge virtuelle) sans crash ;
  - depuis l'étape « Atterrissage » : l'atterrissage se termine en automatique, posé à destination, sans crash.

Préparation : python3 tools/build.py --test ; cd tests ; python3 -m http.server 8765 &
Usage : python3 direct_jump.py [appareil ...]     (par défaut : les 7)
"""
import asyncio, sys, time, json
from playwright.async_api import async_playwright

ACS = sys.argv[1:] or ['a320', 'b777', 'lj60', 'c172', 'h125', 'r44', 's76']
CRUISE = {'a320': 35000, 'b777': 35000, 'lj60': 41000}
FLIGHT = {'takeoff', 'climb', 'cruise', 'descent', 'approach', 'land', 'pattern', 'hTakeoff', 'hCruise', 'hLand'}

SETUP = """window.VT=performance.now(); performance.now=()=>window.VT; loop=function(){}; renderer.render=()=>{}; drawCockpit=()=>{};
window.drive=(n)=>{ for(let k=0;k<n;k++){ VT+=50; try{ loopBody(VT); }catch(e){ console.error('LB',e.message); } } };"""

STATE = """(()=>{ const D=APTS[MI.dest]||{lat:S.lat,lon:S.lon}, P=APTS[MI.dep||ATC.dep]||{lat:S.lat,lon:S.lon}, ad=airdata();
  return {i:GD.i, gnd:!!S.onGround, alt:Math.round(S.alt/FT), agl:Math.round((S.alt-elevAt(S.lat,S.lon))/FT), cas:Math.round(ad.cas),
    dDest:+gcKm(S.lat,S.lon,D.lat,D.lon).toFixed(1), dDep:+gcKm(S.lat,S.lon,P.lat,P.lon).toFixed(1), dThr:(()=>{ try{ const r=rwStart(DEP(),DRW()); return +gcKm(S.lat,S.lon,r.lat,r.lon).toFixed(2); }catch(e){ return -1; } })(), gear:S.gear, crashed:!!crashed,
    landed:!!GD.landed, eng:(S.eng||[]).map(x=>x?1:0).join(''), rate, stage:AUTO.stage, on:AUTO.on} })()"""


def expect(ac, fly, k, idx_land, st):
    """Retourne la liste des écarts à l'état attendu juste après le saut."""
    bad = []
    if fly in ('', 'taxiOut') and (idx_land < 0 or k < idx_land):
        if not st['gnd']: bad.append('devrait être au sol')
        if fly == 'taxiOut' and not (0 <= st['dThr'] <= 1.0): bad.append(f"roulage : point d'arrêt attendu près du seuil de piste, {st['dThr']} km")
    elif fly in ('takeoff', 'hTakeoff'):
        if not st['gnd']: bad.append('devrait être au sol, aligné')
    elif fly in ('climb', 'pattern', 'hCruise'):
        if st['gnd'] or st['agl'] < 300: bad.append(f"devrait voler (hauteur {st['agl']} ft)")
    elif fly == 'cruise':
        want = CRUISE.get(ac)
        if st['gnd'] or (want and abs(st['alt'] - want) > 2000): bad.append(f"croisière attendue vers {want} ft, {st['alt']} ft")
    elif fly == 'descent':
        if st['gnd'] or st['alt'] < 15000: bad.append(f"début de descente attendu en altitude, {st['alt']} ft")
        if st['dDest'] < 60: bad.append(f"trop près de la destination ({st['dDest']} km)")
    elif fly == 'approach':
        if st['gnd'] or not (30 <= st['dDest'] <= 150): bad.append(f"approche attendue à 30-150 km, {st['dDest']} km")
    elif fly in ('land', 'hLand'):
        lim = 5 if fly == 'hLand' else 30
        if st['gnd'] or st['dDest'] > lim: bad.append(f"finale attendue à moins de {lim} km en vol, {st['dDest']} km")
        if fly == 'land' and not st['gear']: bad.append('train rentré en finale')
    elif idx_land >= 0 and k > idx_land:
        if not st['gnd'] or st['dDest'] > 6: bad.append(f"devrait être posé à destination ({st['dDest']} km, sol={st['gnd']})")
    if fly in FLIGHT and fly not in ('takeoff', 'hTakeoff') and '1' not in st['eng']:
        bad.append('moteur(s) arrêté(s) en vol')
    return bad


async def run_target(b, ac, k):
    pg = await b.new_page(viewport={'width': 1000, 'height': 700}); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' and 'resource' not in m.text else None)
    await pg.goto('http://localhost:8765/final.html'); await pg.wait_for_timeout(2000)
    await pg.evaluate(f"selAC='{ac}'; selMI=FULLOF('{ac}'); renderMenu(); $('m-auto').click(); $('go').click(); document.getElementById('br-skip').click();")
    await pg.wait_for_timeout(800)
    await pg.evaluate(SETUP); await pg.evaluate("drive(20)")
    info = await pg.evaluate("({n:GD.steps.length, fly:GD.steps.map(s=>s.fly||''), t:GD.steps.map(s=>s.t)})")
    fly = info['fly'][k]; idx_land = next((i for i, f in enumerate(info['fly']) if f in ('land', 'hLand')), -1)
    t0 = time.time(); await pg.evaluate(f"JUMP({k},'auto')"); dt = time.time() - t0
    await pg.evaluate("drive(2)")
    st = await pg.evaluate(STATE)
    bad = expect(ac, fly, k, idx_land, st)
    if dt > 3: bad.append(f'saut trop long ({dt:.1f} s)')
    if st['i'] != k: bad.append(f"GD.i={st['i']} au lieu de {k}")
    # 60 s de vol automatique
    for _ in range(30): await pg.evaluate("drive(40)")
    st60 = await pg.evaluate(STATE)
    if st60['crashed']: bad.append('crash pendant les 60 s')
    land = None
    if k == idx_land:   # finir l'atterrissage en automatique
        for _ in range(400):
            await pg.evaluate("drive(40)"); s = await pg.evaluate(STATE)
            if s['crashed'] or (s['gnd'] and s['i'] > k) or (s['gnd'] and s['landed']): break
        land = s
        if s['crashed']: bad.append('crash à l\'atterrissage')
        elif not s['gnd']: bad.append(f"atterrissage non terminé ({s['agl']} ft, {s['dDest']} km)")
        elif s['dDest'] > 6: bad.append(f"posé loin de la destination ({s['dDest']} km)")
    bad += [f'erreur JS : {e[:120]}' for e in errs[:3]]
    await pg.close()
    return {'k': k, 'fly': fly, 't': info['t'][k][:34], 'dt': round(dt, 2), 'st': st, 'st60': st60, 'land': land, 'bad': bad}


async def main():
    total = fails = 0
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader', '--enable-unsafe-swiftshader'])
        for ac in ACS:
            pg = await b.new_page(); await pg.goto('http://localhost:8765/final.html'); await pg.wait_for_timeout(1500)
            await pg.evaluate(f"selAC='{ac}'; selMI=FULLOF('{ac}'); renderMenu(); $('m-auto').click(); $('go').click(); document.getElementById('br-skip').click();")
            await pg.wait_for_timeout(800)
            fl = await pg.evaluate("GD.steps.map(s=>s.fly||'')"); await pg.close()
            first = next(i for i, f in enumerate(fl) if f in FLIGHT or f == 'taxiOut')
            cockpit = max(5, first - 3)
            targets = [cockpit] + list(range(first - 1 if fl[first] in ('takeoff', 'hTakeoff') else first, len(fl)))
            targets = sorted(set(t for t in targets if 0 < t < len(fl)))
            for k in targets:
                r = await run_target(b, ac, k); total += 1; fails += bool(r['bad'])
                s = r['st']
                print(f"{'✔' if not r['bad'] else '✘'} {ac:5} étape {k:2} [{r['fly'] or '-':8}] {r['t']:34} {r['dt']:4}s → "
                      f"{'sol' if s['gnd'] else 'vol'} {s['alt']} ft, {s['cas']} kt, dest {s['dDest']} km, moteurs {s['eng']}"
                      + (f" | atterrissage : {'sol' if r['land']['gnd'] else 'vol'} à {r['land']['dDest']} km" if r['land'] else '')
                      + ('' if not r['bad'] else '  ⚠ ' + ' ; '.join(r['bad'])), flush=True)
        await b.close()
    print(f"\n{total - fails}/{total} sauts conformes")
    sys.exit(1 if fails else 0)

asyncio.run(main())
