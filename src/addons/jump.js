/* ===== ALLER DIRECTEMENT À UNE ÉTAPE =====
   Bouton « 🧭 Étapes » (barre) et bande d'étapes cliquables dans la bulle : un clic mène à l'étape étudiée sans attendre tout le parcours.
   Le simulateur exécute les étapes précédentes en avance rapide (temps accéléré, lectures sautées) puis rend la main dans le mode choisi.
   Retour en arrière = le vol repart du début et avance jusqu'à l'étape. */
(function(){
const css=document.createElement('style'); css.textContent=`
#jmp{position:fixed;inset:0;z-index:72;background:#000c;display:flex;align-items:flex-start;justify-content:center;overflow:auto;padding:12px}
#jmp .w{width:min(760px,100%);background:#0a131c;border:2px solid #46c8d8;border-radius:14px;color:#e8eef2;font:15px/1.45 'Inter',system-ui,sans-serif;margin:auto 0}
#jmp .hd{position:sticky;top:0;display:flex;align-items:center;gap:8px;padding:10px 12px;background:#0d1b27;border-bottom:1px solid #2b3d50;border-radius:12px 12px 0 0}#jmp .hd b{flex:1;font:700 20px 'Barlow Condensed',sans-serif;letter-spacing:.04em}
#jmp button{background:#132232;color:#fff;border:1px solid #2b3d50;border-radius:9px;padding:7px 11px;font:600 13px 'Barlow Condensed',sans-serif;letter-spacing:.05em;text-transform:uppercase;cursor:pointer}
#jmp .bd{padding:8px 12px 14px}#jmp h4{font:700 15px 'Barlow Condensed',sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#46c8d8;margin:12px 0 4px}
#jmp .st{display:flex;width:100%;gap:10px;align-items:center;text-align:left;margin:4px 0;text-transform:none!important;letter-spacing:0!important;font:500 15px 'Inter',sans-serif!important;padding:9px 10px!important}
#jmp .st .n{flex:none;width:34px;height:34px;border-radius:9px;display:flex;align-items:center;justify-content:center;background:#1c2a38;font:700 15px 'JetBrains Mono',monospace}
#jmp .st.cur{border-color:#e04ad8}#jmp .st.cur .n{background:#e04ad8}#jmp .st.done .n{background:#1f6b3a}#jmp .md{display:flex;gap:6px;flex-wrap:wrap;margin:4px 0 6px}#jmp .md button.on{background:#e04ad8;border-color:#e04ad8}
#jmpo{position:fixed;left:50%;top:10px;transform:translateX(-50%);z-index:71;background:#0d1b27f2;border:2px solid #46c8d8;border-radius:12px;padding:8px 12px;color:#fff;font:600 14px 'Inter',sans-serif;display:flex;gap:10px;align-items:center;box-shadow:0 8px 30px #000a}
#jmpo[hidden]{display:none}#jmpo i{display:block;height:5px;background:#46c8d8;border-radius:3px;margin-top:4px}#jmpo button{background:#132232;color:#fff;border:1px solid #2b3d50;border-radius:8px;padding:5px 9px;cursor:pointer}
#abub .jstrip{display:flex;gap:4px;overflow-x:auto;padding:6px 10px 8px;scrollbar-width:thin}#abub .jstrip button{flex:none;min-width:30px;height:28px;border-radius:7px;border:1px solid #2b3d50;background:#132232;color:#cfd8df;font:700 12px 'JetBrains Mono',monospace;cursor:pointer;padding:0 6px}
#abub .jstrip button.cur{background:#e04ad8;color:#fff;border-color:#e04ad8}#abub .jstrip button.dn{background:#1f3a2a;color:#9fe3b8}#abub.cmp .jstrip{padding:3px 8px 4px}#abub.cmp .jstrip button{height:24px;min-width:26px}
#guide .jstrip{display:flex;gap:4px;overflow-x:auto;padding:4px 2px 8px;scrollbar-width:thin}#guide .jstrip button{flex:none;min-width:30px;height:28px;border-radius:7px;border:1px solid #2b3d50;background:#132232;color:#cfd8df;font:700 12px 'JetBrains Mono',monospace;cursor:pointer;padding:0 6px}#guide .jstrip button.cur{background:#e04ad8;color:#fff;border-color:#e04ad8}#guide .jstrip button.dn{background:#1f3a2a;color:#9fe3b8}#guide.min .jstrip{padding:2px 2px 4px}`;   /* V10.34 : bande d'étapes aussi dans le panneau du guide, et toujours visible dans la bulle automatique */
document.head.appendChild(css);
const ov=document.createElement('div'); ov.id='jmpo'; ov.hidden=true; ov.innerHTML='<div><span></span><i style="width:0"></i></div><button type="button">Annuler</button>'; document.body.appendChild(ov);
ov.querySelector('button').onclick=()=>{ window.FF=null; ov.hidden=true; try{ setRate(1); }catch(e){} };
let mode='auto';
function jump(k,then){ if(window.DIRECT) return window.DIRECT(k,then);   /* V10.37 : saut direct (direct.js) */
  if(!GD.on||!GD.steps.length) return; then=then||(AUTO.on?'auto':'guide'); if(window.EXAM&&EXAM.on){ flash('Examen blanc : pas de saut d\'étape','am'); return; }
  if(k===GD.i){ return; }
  if(k<GD.i){ window.FF={to:k,then,t0:GD.i}; const want=window.FF; if(window.BR&&BR.launchMode){ BR.launchMode('auto'); window.FF=want; } return; }
  window.FF={to:k,then,from:GD.i}; if(!AUTO.on) autoStart(true); }
window.JUMP=jump;
/* moteur d'avance rapide (remplace l'ancienne version de l'examen) */
setInterval(()=>{ const F=window.FF; if(!F||!GD.on){ ov.hidden=true; return; } if(!AUTO.on){ try{ autoStart(true); }catch(e){} return; }
  const st=GD.steps[GD.i], N=F.to, from=F.from||0;
  ov.hidden=false; ov.querySelector('span').textContent=`⏩ Avance rapide vers l'étape ${N} — en cours : ${GD.i}. ${(st&&st.t)||''}`; ov.querySelector('i').style.width=Math.min(100,Math.max(4,(GD.i-from)/Math.max(1,N-from)*100))+'%';
  if(GD.i>=N){ window.FF=null; ov.hidden=true; try{ if(S.onGround&&rate>1) setRate(1); else if(!S.onGround&&rate>4) setRate(AP.on?4:1); }catch(e){}
    if(F.then==='guide'){ autoStart(false); GD.peda=true; try{ renderGuide(); }catch(e){} flash('Étape '+GD.i+' : à vous (mode guidé)','am'); } else flash('Étape '+GD.i+' : observez (mode automatique)','am'); return; }
  if(AUTO.paused) AUTO.paused=false;
  // roulage : on saute directement près du point d'arrêt (sinon plusieurs minutes de roulage)
  try{ const R=TX.route; if(TX.auto&&R&&S.onGround&&F.txr!==R&&R.path&&R.path.length>1){ F.txr=R; const P=R.path, nd=k=>GN[R.code].n[P[k]], a=nd(P.length-2), b=nd(P.length-1), dN=(b[0]-a[0])*D2R*RE, dE=(b[1]-a[1])*D2R*RE*Math.cos(b[0]*D2R), L=Math.hypot(dE,dN)||1, f=Math.min(0.9,60/L);
      S.lat=b[0]-(b[0]-a[0])*f; S.lon=b[1]-(b[1]-a[1])*f; S.psi=Math.atan2(dE,dN); TX.idx=P.length-2; S.V=3; TX.pushMsg=true; } }catch(e){}
  if(AUTO.stage==='read') AUTO.t0-=6000; if(AUTO.stage==='done') AUTO.t0-=3000; AUTO.lastAct-=1200;
  // temps accéléré : fort à l'arrêt, modéré en roulage, très fort en croisière sous pilote automatique
  let r=4; if(S.onGround){ r=TX.auto||Math.abs(S.V||0)>1?4:16; } else if(AP.on){ const a=S.alt/FT; r=a>12000?64:8; }
  if(rate!==r){ rate=r; const sel=$('b-rate'); if(sel) sel.value=String(Math.min(r,64)); } },250);

/* ---------- sélecteur d'étapes ---------- */
function picker(){ let m=$('jmp'); if(m) m.remove(); if(!GD.on||!GD.steps.length){ flash('Démarrez d\'abord un parcours','am'); return; }
  m=document.createElement('div'); m.id='jmp'; const groups=[]; GD.steps.forEach((s,i)=>{ let g=groups[groups.length-1]; if(!g||g.ph!==s.ph){ g={ph:s.ph,l:[]}; groups.push(g); } g.l.push([i,s]); });
  m.innerHTML=`<div class="w"><div class="hd"><b>🧭 Aller directement à une étape</b><button type="button" data-x>✕</button></div><div class="bd">
   <p style="color:#9fb3c4;margin:4px 0">Vous arrivez directement à l'étape choisie (les actions précédentes sont faites et l'appareil est placé au bon endroit). Arrivé, vous voulez :</p>
   <div class="md"><button type="button" data-m="auto" class="${mode==='auto'?'on':''}">▶ Observer (automatique)</button><button type="button" data-m="guide" class="${mode==='guide'?'on':''}">🎓 La faire moi-même (guidé)</button></div>
   ${groups.map(g=>`<h4>${g.ph}</h4>${g.l.map(([i,s])=>`<button type="button" class="st ${i===GD.i?'cur':i<GD.i?'done':''}" data-k="${i}"><span class="n">${i}</span><span>${s.t}</span></button>`).join('')}`).join('')}</div></div>`;
  document.body.appendChild(m);
  m.addEventListener('click',e=>{ const b=e.target.closest('button'); if(e.target===m||(b&&b.dataset.x!=null)){ m.remove(); return; } if(!b) return;
    if(b.dataset.m){ mode=b.dataset.m; m.querySelectorAll('[data-m]').forEach(x=>x.classList.toggle('on',x===b)); return; }
    if(b.dataset.k){ m.remove(); jump(+b.dataset.k,mode); } });
  const c=m.querySelector('.st.cur'); if(c) setTimeout(()=>c.scrollIntoView({block:'center'}),50); }
window.JUMP_PICK=picker;
// bouton de barre
(function(){ const bar=$('bar')||document.querySelector('#b-menu')&&$('b-menu').parentElement; if(!bar) return; const b=document.createElement('button'); b.type='button'; b.id='b-jump'; b.textContent='🧭 Étapes'; b.title='Aller directement à une étape';
  b.onclick=picker; const ref=$('b-auto'); if(ref&&ref.parentElement) ref.parentElement.insertBefore(b,ref.nextSibling); else bar.appendChild(b); })();
// bande d'étapes dans la bulle
setInterval(()=>{ if(!GD.on) return; [['abub','.ah'],['guide','.gh']].forEach(([id,hs])=>{ const ab=$(id); if(!ab||ab.hidden) return; let s=ab.querySelector('.jstrip'); const sig=GD.i+':'+GD.steps.length;
  if(!s){ s=document.createElement('div'); s.className='jstrip'; s.title='Cliquez un numéro pour aller à cette étape'; const ah=ab.querySelector(hs); if(ah) ah.after(s); else ab.prepend(s); s.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b) return; e.stopPropagation(); if(b.dataset.all) picker(); else jump(+b.dataset.k,AUTO.on?'auto':'guide'); }); }
  if(s.dataset.sig===sig) return; s.dataset.sig=sig;
  s.innerHTML='<button type="button" data-all="1" title="Toutes les étapes">🧭</button>'+GD.steps.map((x,i)=>`<button type="button" data-k="${i}" class="${i===GD.i?'cur':i<GD.i?'dn':''}" title="${i}. ${String(x.t).replace(/"/g,'')}">${i}</button>`).join('');
  const c=s.querySelector('.cur'); if(c) c.scrollIntoView({block:'nearest',inline:'center'}); }); },700);
})();
