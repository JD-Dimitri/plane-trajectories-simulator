/* ===== CHECKLIST : vérifier que chaque sous-étape a été faite, aller directement à la commande manquante ===== */
(function(){
const css=document.createElement('style'); css.textContent=`#b-ckl{position:fixed;top:8px;right:8px;z-index:46;display:none;user-select:none;-webkit-user-select:none;align-items:center;gap:6px;padding:8px 12px;border-radius:10px;border:2px solid #3ddc84;background:#071a10ee;color:#9ff0bf;font:700 14px 'Barlow Condensed',sans-serif;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;box-shadow:0 4px 14px #0008}
#b-ckl.bad{border-color:#ff3b30;background:#2a0707ee;color:#ffb3ad;animation:cklp 1.2s ease-in-out infinite}@keyframes cklp{50%{box-shadow:0 0 0 4px #ff3b3055}}#b-ckl i{font-style:normal;background:#ff3b30;color:#fff;border-radius:999px;padding:0 7px}
@media(min-width:901px){#b-ckl{left:50%;right:auto;transform:translateX(-50%)}}
#ckl{position:fixed;inset:0;z-index:66;background:#000a;display:flex;align-items:flex-start;justify-content:center;padding:10px;overflow:auto}#ckl[hidden]{display:none}
#ckl .w{width:min(620px,100%);background:#0a131c;border:2px solid #3ddc84;border-radius:12px;color:#e8eef2;font:14px/1.4 'Inter',sans-serif;margin:auto 0}#ckl .w.bad{border-color:#ff3b30}
#ckl .hd{display:flex;justify-content:space-between;align-items:center;padding:10px 12px;border-bottom:1px solid #1d2f40}#ckl .hd b{font:700 20px 'Barlow Condensed',sans-serif;letter-spacing:.08em}#ckl .hd small{display:block;color:#8fa4b8;font-size:12px}
#ckl .bd{padding:8px 12px;max-height:68vh;overflow:auto}#ckl .st{margin:6px 0;padding:6px 8px;border-radius:8px;background:#0f1e2c}#ckl .st.ok{color:#9ff0bf}#ckl .st.cur{outline:2px solid #e04ad8}#ckl .st.fut{opacity:.45}
#ckl .st>b{font:700 13px 'Barlow Condensed',sans-serif;letter-spacing:.04em}#ckl .it{display:flex;align-items:center;gap:6px;width:100%;text-align:left;margin:3px 0;padding:6px 8px;border-radius:7px;font:14px 'Inter',sans-serif;cursor:pointer;border:1px solid transparent;background:none;color:inherit}
#ckl .it.miss{background:#3a0b0b;border-color:#ff3b30;color:#ffd0cc;font-weight:600}#ckl .it.miss:hover{background:#5a1010}#ckl .it.done{color:#9ff0bf}#ckl .it .go{margin-left:auto;font:700 12px 'Barlow Condensed',sans-serif;letter-spacing:.06em;color:#fff;background:#ff3b30;border-radius:6px;padding:2px 7px;white-space:nowrap}
#ckl .ft{display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;padding:10px 12px;border-top:1px solid #1d2f40}#ckl .ft button{background:#132232;color:#fff;border:1px solid #2b3d50;border-radius:8px;padding:8px 12px;font:700 14px 'Barlow Condensed',sans-serif;letter-spacing:.05em;text-transform:uppercase;cursor:pointer}#ckl .ft .go{background:#1f8a4c;border-color:#3ddc84}#ckl .ft .warn{background:#5a1010;border-color:#ff3b30}
#ckl .msg{margin:4px 0 8px;padding:8px 10px;border-radius:8px;background:#2a0707;border:1px solid #ff3b30;color:#ffd0cc}`; document.head.appendChild(css);
const DONE=new Set(); let FORCE=false, PEND=null;
const key=(i,j)=>ACK+'|'+i+'|'+j;
const chk=(it)=>{ try{ return !!it[1](); }catch(e){ return false; } };
function rec(){ if(typeof GD==='undefined'||!GD.on||!GD.steps) return; for(let i=0;i<=GD.i&&i<GD.steps.length;i++){ const st=GD.steps[i]; (st.items||[]).forEach((it,j)=>{ if(!DONE.has(key(i,j))&&chk(it)) DONE.add(key(i,j)); }); } }
function missing(from,to){ const out=[]; for(let i=from;i<=to&&i<GD.steps.length;i++){ const st=GD.steps[i]; (st.items||[]).forEach((it,j)=>{ if(!DONE.has(key(i,j))&&!chk(it)) out.push({i,j,st,it}); }); } return out; }
function gotoItem(m){ close(); const [l,c,a,sel]=m.it; if(typeof view!=='undefined'&&view==='walk'&&sel&&typeof setView==='function') setView('ck');
 if(sel){ highlight(sel); flash('À faire : '+l,'am'); }
 else if(a){ a(); try{ ovhSync(); pedSync(); }catch(e){} rec(); flash('Fait : '+l,'am'); refresh(); }
 else flash('En attente : '+l+' (le système travaille)','am'); }
function itemRow(m,done){ const l=m.it[0]; return done?`<div class="it done">✓ ${l}</div>`:`<button type="button" class="it miss" data-i="${m.i}" data-j="${m.j}">✗ ${l}<span class="go">${m.it[3]?'Y aller →':m.it[2]?'Faire':'Attendre'}</span></button>`; }
function render(msg){ let p=document.getElementById('ckl'); if(!p){ p=document.createElement('div'); p.id='ckl'; p.hidden=true; document.body.appendChild(p);
  p.addEventListener('click',e=>{ if(e.target===p) return close(); const b=e.target.closest('button'); if(!b) return;
   if(b.dataset.i!=null){ const i=+b.dataset.i, j=+b.dataset.j; gotoItem({i,j,st:GD.steps[i],it:GD.steps[i].items[j]}); return; }
   if(b.dataset.x!=null) return close(); if(b.dataset.first!=null){ const m=missing(0,GD.i)[0]; if(m) gotoItem(m); else close(); return; }
   if(b.dataset.force!=null){ const f=PEND; PEND=null; close(); if(f){ FORCE=true; try{ f(); } finally{ FORCE=false; } } } }); }
 rec(); const N=GD.steps.length-1, miss=missing(0,GD.i), prev=miss.filter(m=>m.i<GD.i);
 let body=''; for(let i=0;i<=N;i++){ const st=GD.steps[i], its=(st.items||[]); if(i>GD.i+2) { body+=`<div class="st fut"><b>${i}. ${st.t}</b> · à venir</div>`; continue; }
  const ms=its.map((it,j)=>({i,j,st,it,done:DONE.has(key(i,j))||chk(it)})), ok=ms.every(x=>x.done);
  body+=`<div class="st ${i===GD.i?'cur':''} ${i>GD.i?'fut':''} ${ok&&i<=GD.i?'ok':''}"><b>${ok&&i<GD.i?'✓ ':''}${i}. ${st.ph} · ${st.t}${i===GD.i?' (étape en cours)':''}</b>${i<=GD.i?ms.map(x=>itemRow(x,x.done)).join(''):''}</div>`; }
 const bad=miss.length>0;
 p.innerHTML=`<div class="w ${bad?'bad':''}"><div class="hd"><div><b>☑ CHECKLIST</b><small>${bad?`${miss.length} sous-étape(s) non faite(s) — touchez une ligne rouge pour aller à la commande`:'Toutes les sous-étapes faites jusqu\'ici ✓'}</small></div><button type="button" data-x style="background:none;border:0;color:#fff;font-size:20px;cursor:pointer">✕</button></div>
  <div class="bd">${msg?`<div class="msg">${msg}</div>`:''}${body}</div>
  <div class="ft">${bad?'<button type="button" class="go" data-first>Faire la première étape manquante</button>':''}${PEND?'<button type="button" class="warn" data-force>Passer quand même</button>':''}<button type="button" data-x>Fermer</button></div></div>`;
 p.hidden=false; setTimeout(()=>{ const c=p.querySelector('.st.cur'); c&&c.scrollIntoView({block:'center'}); },30); }
function close(){ const p=document.getElementById('ckl'); if(p) p.hidden=true; PEND=null; }
function refresh(){ const p=document.getElementById('ckl'); if(p&&!p.hidden) render(); }
/* bouton en haut de l'écran */
const btn=document.createElement('button'); btn.type='button'; btn.id='b-ckl'; btn.innerHTML='☑ Checklist'; btn.title='Toucher : ouvrir · glisser : déplacer'; document.body.appendChild(btn);
/* bouton déplaçable : on le glisse où il ne gêne pas ; position mémorisée ; un simple toucher ouvre la checklist */
(function(){ let sx=0, sy=0, ox=0, oy=0, drag=false, down=false;
 const apply=(x,y)=>{ const w=btn.offsetWidth, h=btn.offsetHeight; x=Math.max(4,Math.min(innerWidth-w-4,x)); y=Math.max(4,Math.min(innerHeight-h-4,y)); btn.style.left=x+'px'; btn.style.top=y+'px'; btn.style.right='auto'; btn.style.transform='none'; return [x,y]; };
 try{ const p=JSON.parse(localStorage.getItem('ckl-pos')||'null'); if(p) requestAnimationFrame(()=>apply(p[0],p[1])); }catch(e){}
 btn.addEventListener('pointerdown',e=>{ down=true; drag=false; sx=e.clientX; sy=e.clientY; const r=btn.getBoundingClientRect(); ox=r.left; oy=r.top; btn.setPointerCapture(e.pointerId); });
 btn.addEventListener('pointermove',e=>{ if(!down) return; const dx=e.clientX-sx, dy=e.clientY-sy; if(!drag&&Math.hypot(dx,dy)>8){ drag=true; btn.style.opacity='.85'; } if(drag){ e.preventDefault(); apply(ox+dx,oy+dy); } });
 btn.addEventListener('pointerup',e=>{ if(!down) return; down=false; btn.style.opacity=''; if(drag){ const r=btn.getBoundingClientRect(); try{ localStorage.setItem('ckl-pos',JSON.stringify([r.left,r.top])); }catch(er){} } else render(); });
 btn.addEventListener('pointercancel',()=>{ down=false; drag=false; btn.style.opacity=''; });
 btn.style.touchAction='none';
 addEventListener('resize',()=>{ if(btn.style.left){ const r=btn.getBoundingClientRect(); apply(r.left,r.top); } }); })();
setInterval(()=>{ const on=typeof GD!=='undefined'&&GD.on&&GD.steps&&GD.steps.length&&(!document.getElementById('menu')||document.getElementById('menu').hidden)&&!(document.getElementById('sysat')&&!document.getElementById('sysat').hidden);
 btn.style.display=on?'flex':'none'; if(!on) return; rec(); const prev=missing(0,GD.i-1).length, cur=missing(GD.i,GD.i).length;
 const h=prev?`☑ Checklist <i>${prev}</i>`:`☑ Checklist${cur?'':' ✓'}`; if(btn._h!==h){ btn.innerHTML=h; btn._h=h; } btn.classList.toggle('bad',prev>0); refresh(); },600);
/* contrôle avant de passer à l'étape suivante */
const _g=goStep; goStep=function(i){ if(typeof GD!=='undefined'&&GD.on&&i===GD.i+1&&!FORCE&&!window.FF&&!(typeof AUTO!=='undefined'&&AUTO.on)){ rec(); const m=missing(0,GD.i);
  if(m.length){ PEND=()=>goStep(i); render(`⚠ Avant de passer à l'étape ${i}, ${m.length} sous-étape(s) ne sont pas faites (en rouge). Faites-les, ou passez quand même.`); return; } }
 return _g.apply(this,arguments); };
const _sm=startMission; startMission=function(){ DONE.clear(); return _sm.apply(this,arguments); };
window.CKL={done:(i,j)=>{ rec(); const it=GD.steps[i]&&GD.steps[i].items[j]; return DONE.has(key(i,j))||(it?chk(it):false); },go:(i,j)=>gotoItem({i,j,st:GD.steps[i],it:GD.steps[i].items[j]}),open:()=>render(),missing:()=>{ rec(); return missing(0,GD.i).map(m=>m.it[0]); }};
})();
