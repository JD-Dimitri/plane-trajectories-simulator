import asyncio, time, os
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'out') + os.sep; os.makedirs(OUT, exist_ok=True)
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
    pg=await b.new_page(viewport={'width':1700,'height':780}); errs=[]; pg.on('pageerror',lambda e: errs.append(str(e)))
    await pg.goto('http://localhost:8765/final.html'); await pg.wait_for_timeout(2500)
    await pg.evaluate("const i=document.getElementById('intro'); if(i) i.hidden=true; selAC='a320'; selMI=FULLOF('a320'); renderMenu(); BR.launchMode('auto')"); await pg.wait_for_timeout(2000)
    await pg.evaluate("$('b-jump').click()"); await pg.wait_for_timeout(400); await pg.screenshot(path=OUT+'jmp0.png')
    await pg.evaluate("document.querySelector('#jmp [data-k=\"15\"]').click()")
    t0=time.time()
    while time.time()-t0<200:
      await pg.wait_for_timeout(5000)
      st=await pg.evaluate("({i:GD.i,ff:!!window.FF,rate,gnd:S.onGround,alt:Math.round(S.alt/FT),V:+(S.V||0).toFixed(1),stage:AUTO.stage})")
      print(int(time.time()-t0),st)
      if not st['ff']: break
    await pg.evaluate("setView('ck')"); await pg.wait_for_timeout(1500); await pg.screenshot(path=OUT+'jmp1.png')
    for k in range(10):
      await pg.wait_for_timeout(5000); st=await pg.evaluate("({i:GD.i,gnd:S.onGround,alt:Math.round(S.alt/FT),V:+(S.V||0).toFixed(1),stage:AUTO.stage,items:GD.steps[GD.i].items.map(x=>{try{return x[1]()?1:0}catch(e){return 'E'}}).join('')})"); print('after',st)
    await pg.screenshot(path=OUT+'jmp2.png'); print(errs or 'no errors'); await b.close()
asyncio.run(main())
