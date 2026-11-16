/* =====================================================================================================
   V7.1 — MODE AUTOMATIQUE : BULLE D'ÉTAPE AVEC CHRONOMÈTRE + BULLE EXPLICATIVE SUR CHAQUE COMMANDE
   À chaque étape (tour avion → atterrissage → parking) une bulle s'ouvre : numéro, phase, titre, chronomètre de l'étape
   (temps réel écoulé et temps simulé, accélération comprise), chronomètre du vol, durée typique en réalité, ce qui se passe
   maintenant (lecture, action en cours, point du tour avion, pilote automatique), pourquoi, actions cochées en direct,
   paramètres de vol. Quand le simulateur actionne une commande, une petite bulle fléchée s'ouvre dessus et l'explique.
   ===================================================================================================== */
(function(){
'use strict';
const BB={i:-1,t0:0,s0:0,m0:0,ms0:0,min:false,lastHl:null,hlT:0};
const TYP=[[/Briefing et dossier/,'30 à 45 min'],[/Devis/,'10 min'],[/Bilan carburant/,'5 min'],[/Arrivée au parking/,'2 à 5 min'],[/Tour avion|visite/,'10 à 15 min'],[/Monter à bord|cold/,'2 min'],
 [/batteries|Alimentation électrique|Alimentation et feux/,'1 min'],[/APU/,'1 à 2 min (APU AVAIL ≈ 1 min)'],[/inertielles/,'6 à 10 min (alignement)'],[/AHRS|Feux/,'1 à 2 min'],[/FMS|Performances/,'5 à 10 min'],[/Before Start|Avant la mise en route/,'2 à 3 min'],
 [/Démarrage du moteur [12]/,'≈ 1 min (stabilisation ≈ 45 s)'],[/Démarrage/,'1 à 3 min'],[/Embrayage/,'2 à 4 min'],[/roulage sur|Roulage/,'5 à 15 min'],[/Before Takeoff|^Décollage/,'≈ 1 min (roulage au décollage ≈ 35 s)'],
 [/Après décollage/,'2 à 4 min'],[/Montée/,'20 à 25 min'],[/Croisière/,'selon la distance'],[/Descente/,'20 à 25 min'],[/Approche/,'8 à 12 min'],[/Atterrissage|posé/,'≈ 1 min'],[/Après l'atterrissage/,'5 à 15 min'],[/Parking|Arrêt/,'2 à 5 min'],[/Sécurisation/,'5 à 10 min'],[/terminée/,'—']];
const typ=t=>{ for(const [r,v] of TYP) if(r.test(t)) return v; return '—'; };
const ck=s=>{ s=Math.max(0,Math.round(s)); const h=Math.floor(s/3600), m=Math.floor(s%3600/60), x=s%60; return (h?h+':'+String(m).padStart(2,'0'):String(m).padStart(2,'0'))+':'+String(x).padStart(2,'0'); };
const strip=s=>String(s||'').replace(/<[^>]+>/g,'');
const css=document.createElement('style'); css.textContent=`
#abub{position:fixed;left:50%;top:52px;transform:translateX(-50%);z-index:19;width:min(560px,calc(100vw - 20px));max-height:calc(100vh - var(--barh,64px) - 70px);overflow:auto;padding:0;border-color:#5a2a58;box-shadow:0 10px 40px #000a;animation:abIn .35s ease}
@keyframes abIn{from{opacity:0;transform:translate(-50%,-10px)}to{opacity:1;transform:translate(-50%,0)}}
#abub .ah{display:flex;gap:10px;align-items:center;padding:10px 12px;background:linear-gradient(90deg,#2a0f2a,#0b131b);border-bottom:1px solid var(--line)}
#abub .an{flex:0 0 40px;height:40px;border-radius:10px;background:var(--acc);color:#fff;display:grid;place-items:center;font:700 19px 'JetBrains Mono'}
#abub .at{flex:1;min-width:0}#abub .at b{display:block;font:700 18px/1.1 'Barlow Condensed';letter-spacing:.02em}#abub .at span{font:600 11px 'Barlow Condensed';letter-spacing:.12em;text-transform:uppercase;color:var(--cy)}
#abub .clk{text-align:right;font:600 20px 'JetBrains Mono';color:#fff;line-height:1}#abub .clk small{display:block;font:500 10.5px Inter;color:var(--mut);margin-top:3px}
#abub .ab{padding:10px 14px 12px;font-size:13.5px;line-height:1.5}#abub .ab p{margin:4px 0}
#abub .now{border-left:4px solid var(--am);background:#1c1508;padding:7px 10px;border-radius:6px;margin:6px 0;font-weight:500}
#abub .why{border-left:4px solid var(--cy);background:#081a1f;padding:7px 10px;border-radius:6px;margin:6px 0}
#abub .row3{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:8px 0}#abub .row3 div{background:#08111a;border:1px solid #1d2b3a;border-radius:7px;padding:5px 7px}#abub .row3 i{display:block;font:600 10px 'Barlow Condensed';letter-spacing:.1em;color:var(--mut);font-style:normal;text-transform:uppercase}#abub .row3 b{font:600 13.5px 'JetBrains Mono'}
#abub ul{list-style:none;padding:0;margin:6px 0}#abub li{padding:2px 0}#abub li.ok{color:var(--grn)}#abub li.cur{color:var(--am);font-weight:600}
#abub .bar{height:5px;background:#132233;border-radius:3px;overflow:hidden;margin:6px 0 2px}#abub .bar i{display:block;height:100%;background:var(--am);transition:width .25s}
#abub .af{display:flex;gap:6px;padding:8px 12px;border-top:1px solid var(--line);flex-wrap:wrap}#abub .af button{font-size:11px;padding:5px 9px}
#abub.min .ab,#abub.min .af{display:none}#abub.cmp.sg .af{display:flex!important}
#abub.cmp{top:auto;bottom:calc(var(--barh,64px) + 6px);width:min(620px,calc(100vw - 20px))}#abub.cmp.tp{top:8px;bottom:auto}#abub.cmp .ab>*:not(.now):not(.bar):not(.subs):not(.crumb){display:none}#abub.cmp .subs li:not(.cur){display:none}#abub.cmp .af{display:none}#abub.cmp .ah{padding:6px 10px}#abub.cmp .an{flex-basis:32px;height:32px;font-size:16px}
#ahl{position:fixed;z-index:30;max-width:280px;background:#2a0f2a;border:1px solid var(--acc);color:#fff;border-radius:9px;padding:8px 10px;font:500 12.5px/1.4 Inter;box-shadow:0 6px 24px #000b;pointer-events:none;animation:abIn2 .25s ease}
#ahl b{display:block;font:700 13px 'Barlow Condensed';letter-spacing:.06em;color:var(--am)}#ahl:after{content:'';position:absolute;left:var(--ax,20px);width:12px;height:12px;background:#2a0f2a;transform:rotate(45deg)}
#ahl.up:after{bottom:-7px;border-right:1px solid var(--acc);border-bottom:1px solid var(--acc)}#ahl.dn:after{top:-7px;border-left:1px solid var(--acc);border-top:1px solid var(--acc)}
@keyframes abIn2{from{opacity:0}to{opacity:1}}
@media (max-width:700px){ #abub{top:44px} #abub .at b{font-size:16px} #abub .row3{grid-template-columns:repeat(3,1fr)} }`;
document.head.appendChild(css);

function curItem(st){ const j=(st.items||[]).findIndex(x=>{ try{ return !x[1](); }catch(e){ return false; } }); return j<0?null:{j,it:st.items[j]}; }
function walkNow(){ const pts=WALKPTS[ACK]||[]; let i=0; while(i<pts.length&&GD.seen.has(i)) i++; if(i>=pts.length) return null; const q=m2l(pts[i][0],pts[i][1]); return {i,p:pts[i],d:Math.hypot(q[0]-GD.walk.x,q[1]-GD.walk.z)}; }
function nowText(st){ const el=(performance.now()-AUTO.t0)/1000;
  if(AUTO.paused) return ['⏸ Mode automatique en pause — appuyez sur ▶ pour reprendre.',0];
  if(AUTO.stage==='read'){ const T=readTime(st); return [`📖 Lecture de l'étape : le simulateur vous laisse le temps de lire (encore ${Math.ceil(Math.max(0,T-el))} s).`,el/T]; }
  if(st.walk&&view==='walk'){ const w=walkNow(); if(w) return [`🚶 Marche vers le point ${w.i+1} / ${(WALKPTS[ACK]||[]).length} : <b>${w.p[2]}</b> (${w.d.toFixed(0)} m). Contrôle : ${w.p[3]}`,GD.seen.size/(WALKPTS[ACK]||[1]).length]; }
  const c=curItem(st);
  if(TX.auto&&TX.pushMsg&&S.onGround&&S.V<-0.05) return ['🚜 <b>Repoussage (pushback)</b> : un tracteur pousse l\'avion en arrière pour le sortir du poste. Vous voyez le terminal s\'éloigner et la piste est derrière vous : c\'est normal. Ensuite, l\'avion roulera vers l\'avant, piste devant vous (temps accéléré ×4).',0.3];
  if(AUTO.stage==='act'&&c){ const airFly=st.fly&&!S.onGround;
    if(airFly&&!c.it[2]) return [`✈ Le pilote automatique vole : objectif « ${c.it[0]} ». Observez les écrans et l'extérieur.`,0.5];
    if(!c.it[2]) return [`⏳ Attente : « ${c.it[0]} » (le système travaille ${window.TREAL?'en temps réel : durée réelle, sans accélération':'— l\'accélération du temps est utilisée pendant les longues attentes ; choisissez « Temps réel » pour les durées réelles'}).`,c.j/st.items.length];
    return [`${window.SCNG&&SCNG.on&&!SCNG.demo?'👉 À vous':'👆 Action en cours'} — sous-étape ${c.j+1}/${st.items.length+1} : <b>${c.it[0]}</b>${c.it[3]?' — la commande clignote, regardez où elle se trouve':''}.`,c.j/st.items.length]; }
  if(AUTO.stage==='done') return ['✅ Étape terminée : passage à la suivante…',1];
  return ['…',0]; }
function flightRow(){ try{ const ad=airdata(), d=MI.dest&&APTS[MI.dest]?gcKm(S.lat,S.lon,APTS[MI.dest].lat,APTS[MI.dest].lon):0, eta=ad.gs>30?d/1.852/ad.gs*3600:null;
  return `<div class="row3"><div><i>Altitude</i><b>${fmt(ad.alt,0)} ft</b></div><div><i>Vitesse</i><b>${fmt(Math.max(0,ad.cas),0)} kt</b></div><div><i>Vario</i><b>${(ad.vs>=0?'+':'')+fmt(ad.vs,0)}</b></div><div><i>Cap</i><b>${pad(ad.hdg)}°</b></div><div><i>Reste</i><b>${fmt(d,0)} km</b></div><div><i>Arrivée dans</i><b>${eta?ck(eta):'—'}</b></div></div>`; }catch(e){ return ''; } }
function render(){ let b=$('abub'); const SGO=!!(window.SCNG&&SCNG.on); const on=!window.ABUB_X&&!(window.EXAM&&EXAM.on)&&(AUTO.on||SGO)&&GD.on&&$('menu').hidden&&!(document.getElementById('brief')&&!document.getElementById('brief').hidden);
  if(!on){ if(b) b.hidden=true; hideHl(); return; }
  const st=GD.steps[GD.i]; if(!st) return; const N=GD.steps.length-1;
  if(GD.i!==BB.i){ BB.i=GD.i; BB.t0=performance.now(); BB.s0=simMs; if(!BB.m0){ BB.m0=performance.now(); BB.ms0=simMs; } if(b){ b.remove(); b=null; } }
  if(!b){ b=document.createElement('aside'); b.id='abub'; b.className='panel'+(BB.min?' min':''); document.body.appendChild(b);
    b.innerHTML=`<div class="ah"><span class="an"></span><div class="at"><span></span><b></b></div><div class="clk"></div><button type="button" class="mini" data-m title="Réduire / agrandir">–</button></div><div class="ab"></div><div class="af"><button type="button" data-p>❚❚ Pause</button><button type="button" data-s>Passer la lecture ▶</button><button type="button" data-d>📋 Page du dossier</button><button type="button" data-x>Reprendre la main</button></div>`;
    b.querySelector('[data-m]').onclick=()=>{ BB.min=!BB.min; b.classList.toggle('min',BB.min); };
    b.querySelector('[data-p]').onclick=()=>{ if(window.SCNG&&SCNG.on){ SCNG.doNow(); return; } AUTO.paused=!AUTO.paused; };
    b.querySelector('[data-s]').onclick=()=>{ if(window.SCNG&&SCNG.on){ SCNG.demo=!SCNG.demo; return; } AUTO.stage='act'; AUTO.lastAct=0; };
    b.querySelector('[data-d]').onclick=()=>{ if(window.SCNG&&SCNG.on){ try{ scnOpen(true); }catch(e){} return; } if(window.BR){ BR.show(true,0); const k=BR.pages.findIndex(q=>q.si===GD.i); if(k>=0) document.querySelector(`#br-nav [data-go="${k}"]`).click(); } };
    b.querySelector('[data-x]').onclick=()=>{ autoStart(false); flash('Mode automatique arrêté : à vous','am'); }; }
  b.hidden=false; b.classList.toggle('sg',SGO); const panels=(!$('ovh').hidden)||($('ped')&&!$('ped').hidden); b.classList.toggle('cmp',(panels||window.PT_TARGET)&&!BB.min);
  if(!BB.gmin){ BB.gmin=1; const g=$('guide'); if(g) g.classList.add('min'); }
  const elR=(performance.now()-BB.t0)/1000, elS=(simMs-BB.s0)/1000, tot=(simMs-BB.ms0)/1000;
  b.querySelector('.an').textContent=GD.i; b.querySelector('.at span').textContent=`${st.ph} · étape ${GD.i} / ${N}`; b.querySelector('.at b').textContent=strip(st.t);
  b.querySelector('.clk').innerHTML=`⏱ ${ck(elR)}<small>${Math.abs(elS-elR)>2?'simulé '+ck(elS)+(rate>1?' (×'+rate+')':'')+' · ':''}vol ${ck(tot)}</small>`;
  if(SGO){ b.querySelector('[data-p]').textContent='👆 Faire la sous-étape'; const ds=b.querySelector('[data-s]'); ds.hidden=false; ds.textContent=SCNG.demo?'❚❚ Arrêter la démonstration':'▶ Démonstration'; b.querySelector('[data-d]').textContent='⚠ Scénario'; b.querySelector('[data-x]').hidden=true; }
  else { b.querySelector('[data-p]').textContent=AUTO.paused?'▶ Reprendre':'❚❚ Pause'; b.querySelector('[data-s]').hidden=AUTO.stage!=='read'; }
  const [nt,f]=nowText(st), x=window.BR&&BR.extraFor?BR.extraFor(st.t):{}, items=(st.items||[]).map(it=>{ let ok=false; try{ ok=it[1](); }catch(e){} return [it[0],ok]; }), c=curItem(st);
  let extra=''; if(st.walk&&view==='walk'){ const w=walkNow(); if(w&&BR.whyW){ const y=BR.whyW(w.p[2]); if(y) extra=`<div class="why"><b>Pourquoi ce point ?</b> ${y}</div>`; } }
  b.querySelector('.ab').innerHTML=`${window.PT?PT.crumb(st,GD.i):''}<div class="now">${nt}</div><div class="bar"><i style="width:${Math.round(Math.min(1,f||0)*100)}%"></i></div>
    ${window.PT?PT.subsHTML(st):(items.length?`<ul>${items.map(([l,ok],j)=>`<li class="${ok?'ok':c&&c.j===j?'cur':''}">${ok?'✓':c&&c.j===j?'▶':'○'} ${l}</li>`).join('')}</ul>`:'')}
    <p>${st.txt}</p>${extra}${x.why?`<div class="why"><b>Pourquoi ?</b> ${x.why}</div>`:''}
    ${st.walk?'':flightRow()}
    <p style="color:var(--mut);font-size:12px;margin-top:6px">Durée typique en réalité : <b style="color:#cfe3f2">${typ(st.t)}</b>${/Croisière/.test(st.t)&&LS.tripH?' (≈ '+LS.tripH.toFixed(1)+' h de vol au total)':''}. ${rate>1?'Le temps est accéléré ×'+rate+'.':''}</p>`; }

/* bulle fléchée sur la commande actionnée */
function hideHl(){ const h=$('ahl'); if(h) h.remove(); BB.lastHl=null; }
function hlBubble(){ if(!AUTO.on||!GD.on||window.PT){ hideHl(); return; } const el=[...document.querySelectorAll('.hl')].find(e=>e.offsetParent!==null); const st=GD.steps[GD.i];
  if(!el||!st){ if(performance.now()-BB.hlT>1500) hideHl(); return; } BB.hlT=performance.now(); const r=el.getBoundingClientRect(); if(r.width===0) return;
  const ab=$('abub'); if(ab&&ab.classList.contains('cmp')){ ab.classList.toggle('tp',r.top+r.height/2>innerHeight*0.55); }
  const c0=curItem(st); if(c0&&c0.it[3]) BB.lastLabel=c0.it[0]; const c={it:[BB.lastLabel||(c0?c0.it[0]:'Commande')]}; const k=(el.dataset&&(el.dataset.sw||el.dataset.pd))||(el.querySelector&&el.querySelector('[data-sw],[data-pd]')&&(el.querySelector('[data-sw],[data-pd]').dataset.sw||el.querySelector('[data-sw],[data-pd]').dataset.pd));
  const help=(typeof H320!=='undefined'&&k&&H320[k])||'';
  let h=$('ahl'); if(!h||BB.lastHl!==el){ hideHl(); h=document.createElement('div'); h.id='ahl'; document.body.appendChild(h); BB.lastHl=el; }
  h.innerHTML=`<b>👆 ${c.it[0]}</b>${help||'Le simulateur actionne cette commande.'}`;
  const W=h.offsetWidth, H=h.offsetHeight, up=r.top>H+20; let x=Math.min(innerWidth-W-8,Math.max(8,r.left+r.width/2-W/2)); h.style.left=x+'px'; h.style.top=(up?r.top-H-12:r.bottom+12)+'px'; h.className=up?'up':'dn'; h.style.setProperty('--ax',Math.max(10,Math.min(W-22,r.left+r.width/2-x-6))+'px'); }
setInterval(()=>{ try{ render(); hlBubble(); }catch(e){ console.warn('bulle auto',e); } },250);
// remise à zéro du chronomètre de vol à chaque mission
const _sm=startMission; startMission=function(){ BB.i=-1; BB.m0=0; BB.gmin=0; BB.lastLabel=''; const b=$('abub'); if(b) b.remove(); hideHl(); _sm(); };
})();
/* V7.3 — étapes fiables : une action validée reste validée pendant l'étape (évite qu'une action ultérieure, ex. l'alignement
   sur la piste qui efface l'itinéraire de roulage, « dé-coche » une action précédente et fasse reboucler le mode automatique). */
(function(){ const _sf=stepsFor; stepsFor=function(){ const st=_sf(); st.forEach(s=>(s.items||[]).forEach(it=>{ const m=/^Alignement sur la piste (\w+)/.exec(it[0]||'');
    if(m){ const rw=m[1], apt=(typeof ATC!=='undefined'&&ATC.dep&&APTS[ATC.dep])?ATC.dep:'KJFK', c0=it[1];   // aligné = sur l'axe (écart < 12 m) et au cap de piste, pas seulement « près de la piste »
      it[1]=()=>{ if(!c0()) return false; try{ const r=rwStart(apt,rw), d=gcKm(r.lat,r.lon,S.lat,S.lon)*1000, b=brg(r.lat,r.lon,S.lat,S.lon); return Math.abs(d*Math.sin((b-r.hdg)*D2R))<12&&d*Math.cos((b-r.hdg)*D2R)>-80; }catch(e){ return true; } }; }
    const c=it[1]; if(typeof c!=='function') return; let done=false; it[1]=()=>{ if(done) return true; try{ done=!!c(); }catch(e){ done=false; } return done; }; })); return st; }; })();
/* V7.3 — décollage : le mode automatique ne met les gaz qu'une fois la check-list « Before Takeoff » terminée
   (sinon les actions restantes, non exécutables en vol, bloquaient l'étape pendant tout le vol). */
(function(){ const _fly=flyFW; flyFW=function(dt){ const st=GD.steps[GD.i]||{};
  if(S.onGround&&st.fly==='takeoff'&&!GD.landed){ const ready=AUTO.stage!=='read'&&(st.items||[]).every(it=>{ try{ return !it[2]||/train|gear|volets|flaps|\bAP|pilote|en vol/i.test(it[0])||it[1](); }catch(e){ return true; } });
    if(!ready){ DIR.pitch=DIR.roll=DIR.yaw=null; S.thr=0; if(ACK==='a320'&&SYS.thrSel!=='IDLE'){ SYS.thrSel='IDLE'; } S.brake=S.V>0.5; return; } S.brake=false; }
  return _fly(dt); };
  /* garde-fou : en vol, une commande de poste (interrupteur / pédestal) restée non faite plus de 12 s est exécutée */
  let sig='', t0=0; setInterval(()=>{ if(!AUTO.on||!GD.on||AUTO.paused||paused||AUTO.stage!=='act'||S.onGround) { sig=''; return; } const st=GD.steps[GD.i]; if(!st) return;
    const s=GD.i+':'+st.items.map(x=>{ try{ return x[1]()?1:0; }catch(e){ return 0; } }).join(''); const now=performance.now(); if(s!==sig){ sig=s; t0=now; return; } if(now-t0<12000) return;
    const it=st.items.find(x=>{ try{ return !x[1]()&&x[2]&&x[3]; }catch(e){ return false; } }); if(it){ try{ if(it[3]) highlight(it[3],true); it[2](); ovhSync(); pedSync(); renderGuide(); }catch(e){} t0=now; } },1000); })();
