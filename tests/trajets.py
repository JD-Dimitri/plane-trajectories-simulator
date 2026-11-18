"""F28 : cartes et documents de vol conformes aux trajets des parcours.

Pour chaque mission (parcours complets et vols libres des 8 appareils) : départ, destination et liste des points doivent être
les mêmes sur la carte (MAP.pts), le plan de vol du FMS (FPLN) et les documents de vol (DOCS.route : OFP / log de navigation,
plan de vol OACI) ; l'écran « Calculs du vol » utilise le même départ et la même destination.
Préparation : python3 tools/build.py --test ; cd tests ; python3 -m http.server 8765 &   puis : python3 trajets.py [--liste]
"""
import os
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'out') + os.sep; os.makedirs(OUT, exist_ok=True)
import asyncio, sys, json
from playwright.async_api import async_playwright
ok_all = True
def check(name, ok, detail=''):
    global ok_all; ok_all &= bool(ok); print(('✔' if ok else '✘'), name, ('— ' + str(detail)) if detail != '' else '', flush=True)
GET = r"""(()=>{ const near=(la,lo)=>{ let bk=null,bd=1e9; for(const q in APTS){ const a=APTS[q]; const x=gcKm(la,lo,a.lat,a.lon); if(x<bd){ bd=x; bk=q; } } return bd<8?bk:null; };
  const st=MI.start?MI.start():null, dep=st?near(st.lat,st.lon):null;
  const mp=(MAP.pts()||[]).map(p=>[+(+p[0]).toFixed(2),+(+p[1]).toFixed(2),p[2]||'']), fp=(window.FPLN&&FPLN.pts||[]).map(p=>[+(+p[0]).toFixed(2),+(+p[1]).toFixed(2),p[2]||'']);
  const R=DOCS.route(), dc=(R.pts||[]).map(p=>[+(+p[1]).toFixed(2),+(+p[2]).toFixed(2),p[0]]);
  let cf=null; try{ CALCF.open(); const v=CALCF.vals(); cf={dep:v.dep,dest:v.dest,d:v.d}; CALCF.close(); }catch(e){}
  return {mi:Object.keys(MISSIONS).find(k=>MISSIONS[k]===MI), ac:ACK, dep, dest:MI.dest||null, full:!!MI.full, map:mp, fpln:fp, docs:{dep:R.dep,dest:R.dest,pts:dc}, calc:cf}; })()"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader', '--enable-unsafe-swiftshader']); pg = await b.new_page(viewport={'width': 1200, 'height': 800}); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('http://localhost:8765/final.html'); await pg.wait_for_timeout(2000)
        ms = await pg.evaluate("""Object.keys(AC).flatMap(ac=>Object.keys(MISSIONS).filter(k=>{ const m=MISSIONS[k]; if(!m||!m.start) return false; if(MI_AC[k]) return MI_AC[k]===ac; if(m.ac) return m.ac===ac;
          const fw=AC[ac].kind==='fw'; return m.fw?fw:(m.rw?!fw:false); }).map(k=>[k,ac]))""")
        out = []
        for k, ac in ms:
            try:
                await pg.evaluate(f"const i=document.getElementById('intro'); if(i) i.hidden=true; selAC='{ac}'; selMI='{k}'; renderMenu(); $('go').click(); const s=document.getElementById('br-skip'); if(s) s.click();"); await pg.wait_for_timeout(900)
                out.append(await pg.evaluate(GET))
            except Exception as e: out.append({'mi': k, 'ac': ac, 'err': str(e)[:120]})
        json.dump(out, open(OUT+'trajets.json', 'w'), ensure_ascii=False, indent=0)
        for o in out:
            if 'err' in o: check(f"{o['mi']} ({o['ac']})", False, o['err']); continue
            dd = o['docs']; dn = [x[2] for x in dd['pts']]; mn = [x[2] for x in o['map']]
            ends = (not o['dep'] or dd['dep'] == o['dep']) and (not o['dest'] or dd['dest'] == o['dest']) and dn[:1] == [dd['dep']] and dn[-1:] == [dd['dest']]
            same = dn == mn and all(abs(a[0]-b[0]) < 0.02 and abs(a[1]-b[1]) < 0.02 for a, b in zip(dd['pts'], o['map']))
            local = dd['dep'] == dd['dest'] and len(dn) == 2   # tour de piste ou vol local sans point : distance nulle, carburant au temps
            calc = not o['calc'] or (o['calc']['dep'] == dd['dep'] and o['calc']['dest'] == dd['dest'] and (o['calc']['d'] > 0 or local))
            check(f"{o['mi']} ({o['ac']}) : {dd['dep']} → {dd['dest']}, {len(dn)} points, carte = documents = calculs",
                  ends and same and calc, '' if ends and same and calc else f"départ réel {o['dep']} → {o['dest']} ; docs={dn} ; carte={mn} ; calc={o['calc']}")
        check('Aucune erreur JavaScript', not errs, errs[:3]); await b.close()
    sys.exit(0 if ok_all else 1)
asyncio.run(main())
