"""F24 (V10.40) : « toutes les X doivent vraiment fermer ».

Pour chaque appareil testé : ouvre l'introduction, le dossier de vol puis le simulateur et chacun de ses panneaux (documents,
calculs du vol, QCM, Académie, atelier, carte, plafonnier, pédestal, procédures, mode d'emploi, pannes, scénarios, radio,
étapes, aide…). Chaque croix ✕ / × visible et cliquable (au premier plan) reçoit un VRAI clic de souris ; la fenêtre qui la
porte doit disparaître et rester fermée 1,5 s plus tard. Chaque fenêtre n'est testée qu'une fois par appareil. Le mode d'emploi reste actif après son ouverture :
les croix suivantes doivent aussi fermer dans ce mode (elles ne sont pas « expliquées »).
Préparation : python3 tools/build.py --test ; cd tests ; python3 -m http.server 8765 &   puis : python3 fermetures.py [ac …]
"""
import asyncio, sys
from playwright.async_api import async_playwright
ACS = sys.argv[1:] or ['a350', 'c172', 'r44']
ok_all = True
def check(name, ok, detail=''):
    global ok_all; ok_all &= bool(ok); print(('✔' if ok else '✘'), name, ('— ' + str(detail)) if detail != '' else '', flush=True)

# hôte d'une croix : cible déclarée (data-for) sinon premier ancêtre « fenêtre » (id + position fixe/absolue, ou classe de panneau)
HOST = r"""e=>{ if(e.dataset.for) return document.getElementById(e.dataset.for); let p=e.parentElement;
  while(p&&p!==document.body){ const s=getComputedStyle(p); if(p.id&&(s.position==='fixed'||s.position==='absolute'||/panel|dlg|modal/.test(p.className||''))) return p; p=p.parentElement; } return null; }"""
FIND = r"""(done)=>{ const host=""" + HOST + r"""; const out=[];
  document.querySelectorAll('button,span,a,div,b,i').forEach(e=>{ if(e.children.length||!/^\s*(?:[✕×✖]|Fermer ✕|✕ Fermer)\s*$/.test(e.textContent)) return;
    const r=e.getBoundingClientRect(); if(r.width<4||r.height<4||r.bottom<0||r.top>innerHeight||r.right<0||r.left>innerWidth) return;
    const cx=r.left+r.width/2, cy=r.top+r.height/2, top=document.elementFromPoint(cx,cy); if(!top||!(top===e||e.contains(top)||top.contains(e))) return;
    const h=host(e); if(!h||done.includes(h.id)) return; if(out.some(o=>o.id===h.id)) return;
    out.push({id:h.id, x:cx, y:cy, t:(h.innerText||'').replace(/\s+/g,' ').slice(0,46)}); }); return out; }"""
SHUT = r"""id=>{ const p=document.getElementById(id); if(!p||!document.body.contains(p)) return true; if(p.closest('[hidden]')) return true;
  const s=getComputedStyle(p); if(s.display==='none'||s.visibility==='hidden'||+s.opacity===0) return true; const r=p.getBoundingClientRect(); return r.width<2||r.height<2; }"""

DEBUG = bool(__import__('os').environ.get('XDEBUG'))
DBG = r"""(()=>[...document.querySelectorAll('button,span,a,div,b,i')].filter(e=>!e.children.length&&/[✕×✖]/.test(e.textContent)&&e.textContent.trim().length<14&&!e.closest('[hidden]')&&e.getBoundingClientRect().width>1).map(e=>{ const r=e.getBoundingClientRect(), t=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2); let h=e.parentElement; while(h&&!h.id) h=h.parentElement; return (h&&h.id)+':'+JSON.stringify(e.textContent.trim())+(t&&(t===e||e.contains(t)||t.contains(e))?'':'(couvert par '+(t&&t.closest('[id]')?t.closest('[id]').id:'?')+')'); }))()"""
def btn(rx):  # bouton de la barre par son texte
    return f"(()=>{{ const b=[...document.querySelectorAll('button')].find(b=>b.offsetParent!==null&&{rx}.test(b.textContent.trim())); if(b) b.click(); return !!b; }})()"

async def sweep(pg, label, done, tel=False):
    if DEBUG: print('  ·', label, await pg.evaluate(DBG))
    for x in await pg.evaluate(FIND, done):
        done.append(x['id'])
        if tel: await pg.touchscreen.tap(x['x'], x['y'])
        else: await pg.mouse.click(x['x'], x['y'])
        await pg.wait_for_timeout(400)
        a = await pg.evaluate(SHUT, x['id']); await pg.wait_for_timeout(1500); b = await pg.evaluate(SHUT, x['id'])
        check(f"{label} · ✕ de « {x['id']} » ferme la fenêtre", a and b, x['t'] if not (a and b) else ('' if a else 'rouverte'))

async def run(b, ac, errs, tel=False):
    pg = await (b.new_page(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True) if tel else b.new_page(viewport={'width': 1280, 'height': 800}))
    ac_ = ac; ac = ac + (' (téléphone)' if tel else ''); acx = ac_; pg.on('pageerror', lambda e: errs.append(f'{ac}: {e}'))
    await pg.goto('http://localhost:8765/final.html'); await pg.wait_for_timeout(2000); done = []
    await sweep(pg, f'{ac} · introduction', done, tel)
    await pg.evaluate(f"const i=document.getElementById('intro'); if(i) i.hidden=true; selAC='{acx}'; selMI=FULLOF('{acx}'); renderMenu(); $('go').click();"); await pg.wait_for_timeout(1500)
    await sweep(pg, f'{ac} · dossier de vol', [d for d in done] + ['brief'], tel)  # le dossier se ferme par « Passer » (testé ailleurs)
    await pg.evaluate("const s=document.getElementById('br-skip'); if(s) s.click();"); await pg.wait_for_timeout(2500)
    await sweep(pg, f'{ac} · simulateur', done, tel)
    opens = [('Documents', "DOCS.open('plan')"), ('Calculs du vol', "CALCF.open()"), ('QCM', "qcmOpen()"), ('Académie', "ACAD.open(0)"),
             ('Atelier', f"SYSAT.open('{acx}')"), ('Carte', btn(r'/Carte|🗺/')), ('Plafonnier', "(document.getElementById('b-ovh')||{click(){}}).click()"),
             ('Pédestal', "(document.getElementById('b-ped')||{click(){}}).click()"), ('Procédures', btn(r'/Procédures/')),
             ("Mode d'emploi", btn(r"/Mode d.emploi/")), ('Pannes', btn(r'/^Pannes$/i')), ('Scénarios', btn(r'/^Scénarios$/i')),
             ('Radio', btn(r'/^Radio$/i')), ('Étapes', btn(r'/Étapes/')), ('Aide', btn(r'/^Aide$|^\?$/i')), ('Son', btn(r'/^Son$|🔊/'))]
    for lab, js in opens:
        try: await pg.evaluate(js); await pg.wait_for_timeout(700)
        except Exception as e: print('·', ac, lab, 'non disponible :', str(e)[:60]); continue
        await sweep(pg, f'{ac} · {lab}', done, tel)
    check(f'{ac} : croix testées', len(done) >= (6 if tel else 8), len(done))
    await pg.close()

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader', '--enable-unsafe-swiftshader']); errs = []
        for ac in ACS: await run(b, ac, errs)
        await run(b, ACS[0], errs, tel=True)
        check('Aucune erreur JavaScript', not errs, errs[:3]); await b.close()
    sys.exit(0 if ok_all else 1)
asyncio.run(main())
