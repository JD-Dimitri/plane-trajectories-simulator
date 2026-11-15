"""Vol complet en mode automatique, accéléré (horloge virtuelle), pour un appareil.

Préparation (une fois) : cd tests && npm i three@0.128.0 && pip install playwright && python3 -m playwright install chromium
Puis : python3 tools/build.py --test ; cd tests ; python3 -m http.server 8765 & python3 auto_flight.py a320   (ou lj60, h125, r44, s76)
Affiche chaque changement d'étape ; « ABORT » = blocage détecté.
"""
import asyncio, sys
from playwright.async_api import async_playwright
AC=sys.argv[1] if len(sys.argv)>1 else 'a320'
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
    pg=await b.new_page(viewport={'width':1000,'height':700}); errs=[]; pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' and 'resource' not in m.text else None)
    await pg.goto('http://localhost:8765/final.html'); await pg.wait_for_timeout(2500)
    await pg.evaluate(f"""selAC='{AC}'; selMI={'"full-fw"' if AC in ('a320','lj60') else '"full-rw"'}; renderMenu(); $('m-auto').click(); $('go').click(); document.getElementById('br-skip').click();
      window.VT=performance.now(); const _pn=performance.now.bind(performance); performance.now=()=>window.VT; loop=function(){{}}; renderer.render=()=>{{}}; drawCockpit=()=>{{}};
      window.drive=(n)=>{{ for(let k=0;k<n;k++){{ VT+=50; try{{ loopBody(VT); }}catch(e){{ console.error('LB',e.message); }} }} }};""")
    last=None; stuck=0; t=0
    while t<4000:
      await pg.evaluate("drive(40)"); await pg.wait_for_timeout(60); t+=1
      st=await pg.evaluate("""(()=>{const s=GD.steps[GD.i]; const ad=airdata(); return {i:GD.i,t:s?s.t.slice(0,40):'',stage:AUTO.stage,on:AUTO.on,items:s?s.items.map(x=>{try{return x[1]()?1:0}catch(e){return 'E'}}).join(''):'',
        alt:Math.round(ad.alt),cas:Math.round(ad.cas),gnd:S.onGround,V:S.V.toFixed(1),rate,tx:TX.auto,view,ap:AP.on,appr:AP.appr,simt:Math.round(simMs/1000),th:(S.th/D2R).toFixed(1),dp:DIR.pitch,rot:DIR.rot,near:nearRunway(S.lat,S.lon),landed:GD.landed,flap:S.flap,mass:Math.round(S.mass||0),thr:S.thr}})()""")
      key=(st['i'],st['items'],st['stage'])
      if key!=last: print(st); last=key; stuck=0
      else: stuck+=1
      if stuck in (150,): print('STUCK?',st)
      if stuck>300 and abs(float(st['V']))<0.3: print('ABORT stuck'); break
      if stuck>2500: print('ABORT long'); break
      if st['i']>=len(await pg.evaluate('GD.steps'))-1 or not st['on']: print('END',st); break
    print('\n'.join(errs[:20]) or 'no errors'); await b.close()
asyncio.run(main())
