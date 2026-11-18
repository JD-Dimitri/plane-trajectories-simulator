"""Modification 14 (V10.37) : dans l'atelier, le groupe de parc (GPU), son câble et son étiquette
sont visibles au parking et masqués au roulage et en vol (A320 et Learjet 60).
Préparation : python3 tools/build.py --test ; cd tests ; python3 -m http.server 8765 &   puis : python3 gpu_atelier.py
"""
import asyncio, sys
from playwright.async_api import async_playwright
CASES=[('park',0,0,True),('taxi',0,15,False),('rwy',0,140,False),('air',3000,180,False),('air',35000,280,False)]
async def main():
  ok=True
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
    pg=await b.new_page(viewport={'width':1200,'height':800}); errs=[]; pg.on('pageerror',lambda e: errs.append(str(e)))
    await pg.goto('http://localhost:8765/final.html'); await pg.wait_for_timeout(2500)
    for ac in ('a320','lj60'):
      await pg.evaluate(f"SYSAT.open('{ac}')"); await pg.wait_for_timeout(800)
      for env,alt,ias,want in CASES:
        r=await pg.evaluate(f"""(async()=>{{ const f=SYSAT.S.fl; f.env='{env}'; f.alt={alt}; f.tAlt={alt}; f.ias={ias}; f.tIas={ias};
          await new Promise(r=>setTimeout(r,700)); const svg=document.querySelector('svg.ac');
          const parts=[...svg.querySelectorAll('[data-p="gpu"],[data-p="f_ext"],[data-p="f_gpu"]')], lbl=[...svg.querySelectorAll('text.lbl')].filter(e=>e.textContent==='GPU');
          const vis=e=>getComputedStyle(e).display!=='none';
          return {{n:parts.length+lbl.length, visible:[...parts,...lbl].filter(vis).length}}; }})()""")
        good = r['n']>0 and ((r['visible']==r['n']) if want else (r['visible']==0))
        ok &= good
        print(('✔' if good else '✘'), ac, env, f'{alt} ft {ias} kt', '→ GPU', 'visible' if want else 'masqué', r)
      await pg.evaluate("SYSAT.close&&SYSAT.close()"); await pg.wait_for_timeout(300)
    print(errs or 'aucune erreur'); ok &= not errs
    await b.close()
  sys.exit(0 if ok else 1)
asyncio.run(main())
