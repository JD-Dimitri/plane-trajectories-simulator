import asyncio, sys
from playwright.async_api import async_playwright
MODE=sys.argv[1] if len(sys.argv)>1 else 'perfect'
AC=sys.argv[2] if len(sys.argv)>2 else 'a320'
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
    pg=await b.new_page(viewport={'width':390,'height':800}); errs=[]; pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type in('error','warning') and 'resource' not in m.text else None)
    await pg.goto('http://localhost:8765/final.html'); await pg.wait_for_timeout(2500)
    await pg.evaluate(f"""selAC='{AC}'; selMI={'"full-fw"' if AC in ('a320','lj60') else '"full-rw"'}; renderMenu(); BR.launchMode('exam');
      window.VT=performance.now(); performance.now=()=>window.VT; loop=function(){{}}; renderer.render=()=>{{}}; drawCockpit=()=>{{}};
      window.drive=(n)=>{{ for(let k=0;k<n;k++){{ VT+=50; try{{ loopBody(VT); }}catch(e){{ console.error('LB',e.message); }} }} }};""")
    await pg.wait_for_timeout(500)
    last=None; t=0; shot=0
    while t<5000:
      await pg.evaluate("drive(20)"); await pg.wait_for_timeout(270); t+=1
      st=await pg.evaluate(f"""(()=>{{ const s=GD.steps[GD.i]; const m=document.getElementById('exq'); let ans=null;
        if(m&&EXAM.q&&!m.dataset.done){{ const q=EXAM.q; let k=q.opts.findIndex(o=>o.ok); if('{MODE}'==='wrong'&&GD.i===7) k=(k+1)%q.opts.length; if('{MODE}'==='lazy') {{}} m.querySelectorAll('.o')[k].click(); ans=q.title; }}
        else if(m&&m.dataset.done){{ m.querySelector('.go').click(); }}
        else if(EXAM.on){{ const it=s&&s.items.find(x=>{{try{{return !x[1]()}}catch(e){{return true}}}}); 
          const lazy=('{MODE}'!=='perfect')&&(GD.i===6||GD.i===7); 
          if(it&&it[2]&&it[3]&&(!lazy||EXAM.reveal)&&!window._tw){{ window._tw=1; setTimeout(()=>{{ try{{ it[2](); ovhSync(); pedSync(); }}catch(e){{}} window._tw=0; }},300); }} }}
        const n=document.getElementById('exn');
        return {{i:GD.i,t:s?s.t.slice(0,34):'',on:EXAM.on,res:EXAM.res.map(v=>v=='ok'?'v':v=='aide'?'a':v=='ko'?'X':'.').join(''),ans,gnd:S.onGround,alt:Math.round(S.alt/FT),cl:EXAM.cleared,notes:n?n.querySelector('.v').textContent.slice(0,90):null,fr:[...document.querySelectorAll('#sfr .fr b')].map(x=>x.textContent).join('|').slice(0,60)}}; }})()""")
      key=(st['i'],st['res'],st['ans'],st['notes'])
      if key!=last: print(st); last=key
      if st['i'] in (6,9,14) and shot!=st['i']: shot=st['i']; await pg.screenshot(path=f't/ex_{MODE}_{st["i"]}.png')
      if st['notes']: await pg.screenshot(path=f't/ex_{MODE}_notes.png'); break
    print('\n'.join(errs[:20]) or 'no errors'); await b.close()
asyncio.run(main())
