"""F25 · F26 · F27 (V10.41) : poste de pilotage 3D réaliste, instruments interactifs.

Pour les 8 appareils : en vue cockpit, la planche 3D est construite (nombre d'écrans de DATA, statut de la source),
les écrans 3D recopient en direct la planche du simulateur (pixels non noirs quand l'avion est alimenté), et un VRAI clic
de souris sur chaque élément visible ouvre l'instrument cliqué : écran → écran agrandi, casquette → FCU / MCP,
pédestal → pédestal, radio → radio, manche → commandes, plafond → panneau plafond. Les éléments hors du champ de vision
sont activés par le même chemin (P3D.act). Survol : nom affiché. Bouton « Poste 3D » : retour à la planche 2D et retour.
Téléphone : un toucher sur un écran 3D l'agrandit. Après un clic, bouger la souris ne fait pas tourner la vue.
Aucune erreur JavaScript.
Préparation : python3 tools/build.py --test ; cd tests ; python3 -m http.server 8765 &   puis : python3 poste3d.py [ac …]
"""
import os
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'out') + os.sep; os.makedirs(OUT, exist_ok=True)
import asyncio, sys
from playwright.async_api import async_playwright
ACS = sys.argv[1:] or ['a320', 'a350', 'b777', 'lj60', 'c172', 'h125', 'r44', 's76']
ok_all = True
def check(name, ok, detail=''):
    global ok_all; ok_all &= bool(ok); print(('✔' if ok else '✘'), name, ('— ' + str(detail)) if detail != '' else '', flush=True)

OPEN = {'scr': "!document.getElementById('zoomscr').hidden", 'zoom': "!document.getElementById('zoomscr').hidden",
        'fcu': "(()=>{ const f=document.getElementById('fcu'); return !!f&&getComputedStyle(f).display!=='none'&&!f.hidden&&f.getBoundingClientRect().height>0; })()",
        'ovh': "!document.getElementById('ovh').hidden", 'ped': "!document.getElementById('ped').hidden", 'atc': "!document.getElementById('atc').hidden", 'help': "!document.getElementById('help').hidden"}
RESET = """(()=>{ try{ ZOOMSCR.close(); }catch(e){} ['ovh','ped','atc','help'].forEach(i=>{ const e=document.getElementById(i); if(e) e.hidden=true; });
  const h=document.getElementById('p3fcu'); if(h) h.classList.remove('open'); ['guide','rtprop','legck','abub'].forEach(i=>{ const e=document.getElementById(i); if(e) e.hidden=true; }); })()"""
# centre projeté de chaque élément cliquable + est-il réellement au premier plan (canvas 3D sous le pointeur) ?
PROJ = """(()=>{ const v=new THREE.Vector3(), el=renderer.domElement; P3D.P.updateMatrixWorld(true); camera.updateMatrixWorld();
  const fb=document.getElementById('bar').getBoundingClientRect().top;
  return P3D.hits().map((m,i)=>{ m.getWorldPosition(v); v.project(camera); const x=(v.x+1)/2*innerWidth, y=(1-v.y)/2*innerHeight;
    const on=v.z<1&&x>4&&x<innerWidth-4&&y>4&&y<fb-4&&document.elementFromPoint(x,y)===el; const p=m.userData.p3;
    const h=on&&P3D.pick(x,y); return {i, act:p.act, label:p.label.split(' — ')[0], x, y, on:!!(h&&h.m===m)}; }); })()"""

async def start(pg, ac):
    await pg.goto('http://localhost:8765/final.html'); await pg.wait_for_timeout(1800)
    await pg.evaluate(f"localStorage.removeItem('sim-p3d'); const i=document.getElementById('intro'); if(i) i.hidden=true; selAC='{ac}'; selMI=FULLOF('{ac}'); renderMenu(); $('go').click(); document.getElementById('br-skip').click();")
    await pg.wait_for_timeout(2200); await pg.evaluate("setView('ck'); hasPower=()=>true;"); await pg.evaluate(RESET); await pg.wait_for_timeout(1200)

async def run(b, ac, errs):
    pg = await b.new_page(viewport={'width': 1280, 'height': 800}); pg.on('pageerror', lambda e: errs.append(f'{ac}: {e}'))
    await start(pg, ac)
    r = await pg.evaluate("""(()=>{ const D=P3D.DATA[ACK]; const S=P3D.screens(); let lit=0;
      S.forEach(s=>{ const d=s.T.g.getImageData(0,0,s.T.c.width,s.T.c.height).data; let n=0; for(let i=0;i<d.length;i+=4*97) if(d[i]+d[i+1]+d[i+2]>60) n++; if(n>20) lit++; });
      return {act:P3D.active(), vis:P3D.P.visible, n:S.length, want:D.scr?D.scr.length:1, st:D.st, lit, hits:P3D.hits().length, p3d:document.body.classList.contains('p3d'),
              ckOff:document.getElementById('ckc').getBoundingClientRect().top>=innerHeight}; })()""")
    check(f"{ac} : poste 3D construit en vue cockpit ({r['n']} écran(s), {r['hits']} éléments cliquables), planche 2D hors de l'écran", r['act'] and r['vis'] and r['p3d'] and r['n'] == r['want'] and r['ckOff'], r['st'][:70])
    check(f"{ac} : les écrans 3D affichent en direct les instruments du simulateur ({r['lit']}/{r['n']})", r['lit'] >= max(1, r['n'] - 1), r['lit'])
    pts = await pg.evaluate(PROJ); seen = set(); real = 0
    for h in pts:
        key = h['act'] + ('' if h['act'] != 'scr' else h['label'])
        if key in seen: continue
        seen.add(key); await pg.evaluate(RESET); await pg.wait_for_timeout(250)
        h = (await pg.evaluate(PROJ))[h['i']]   # position recalculée juste avant le clic
        if h['on']:
            await pg.mouse.move(h['x'], h['y']); await pg.wait_for_timeout(120); await pg.mouse.click(h['x'], h['y']); real += 1; how = 'clic réel'
        else:
            await pg.evaluate(f"(()=>{{ const m=P3D.hits()[{h['i']}]; P3D.act({{m, p:m.userData.p3, uv:{{x:0.5,y:0.6}}}}); }})()"); how = 'hors du champ'
        await pg.wait_for_timeout(500); ok = await pg.evaluate(OPEN[h['act']])
        check(f"{ac} : « {h['label']} » ({how}) ouvre {'l’écran agrandi' if h['act'] in ('scr','zoom') else h['act']}", ok)
    q0 = await pg.evaluate("[LK.ty, LK.tp]"); await pg.mouse.move(200, 200); await pg.mouse.move(900, 500); await pg.wait_for_timeout(200); q1 = await pg.evaluate("[LK.ty, LK.tp]")
    check(f"{ac} : après les clics, bouger la souris ne fait pas tourner la vue", q0 == q1, (q0, q1))
    check(f"{ac} : éléments testés par vrai clic dans le champ de vision", real >= (3 if ac in ('a320', 'a350', 'b777', 'lj60') else 1), real)
    # survol
    await pg.evaluate(RESET); await pg.mouse.move(5, 300); await pg.wait_for_timeout(300); pts = await pg.evaluate(PROJ); s0 = next((h for h in pts if h['on'] and h['act'] == 'scr'), None)
    if s0:
        await pg.mouse.move(s0['x'] + 1, s0['y'] + 1); await pg.wait_for_timeout(200)
        t = await pg.evaluate("(()=>{ const t=document.getElementById('p3tip'); return t&&!t.hidden?t.innerText:''; })()")
        check(f"{ac} : survol d'un écran → nom de l'instrument", bool(t), t.split('\n')[0][:60])
    if ac == ACS[0]:
        await pg.evaluate("document.getElementById('b-p3d').click()"); await pg.wait_for_timeout(700)
        o = await pg.evaluate("({p3d:document.body.classList.contains('p3d'), vis:P3D.P.visible, ck:document.getElementById('ckc').getBoundingClientRect().top<innerHeight, fcuIn:!!document.querySelector('#ck #fcu')})")
        await pg.evaluate("document.getElementById('b-p3d').click()"); await pg.wait_for_timeout(700)
        o2 = await pg.evaluate("({p3d:document.body.classList.contains('p3d'), vis:P3D.P.visible})")
        check('Bouton « 🛩 Poste 3D » : retour à la planche 2D d\'origine (FCU remis en place) puis retour au poste 3D', not o['p3d'] and not o['vis'] and o['ck'] and o['fcuIn'] and o2['p3d'] and o2['vis'], (o, o2))
    await pg.close()

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader', '--enable-unsafe-swiftshader']); errs = []
        for ac in ACS: await run(b, ac, errs)
        m = await b.new_page(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True); m.on('pageerror', lambda e: errs.append(f'tel: {e}'))
        await start(m, ACS[0]); pts = await m.evaluate(PROJ); s0 = next((h for h in pts if h['on'] and h['act'] == 'scr'), None)
        if s0: await m.touchscreen.tap(s0['x'], s0['y']); await m.wait_for_timeout(500)
        z = await m.evaluate(OPEN['scr'])
        await m.screenshot(path=OUT+'p3_tel.png')
        check('Téléphone : toucher un écran du poste 3D l\'agrandit', s0 and z, s0 and s0['label'])
        check('Aucune erreur JavaScript', not errs, errs[:3]); await b.close()
    sys.exit(0 if ok_all else 1)
asyncio.run(main())
