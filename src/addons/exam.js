/* ===== PARCOURS PILOTE — EXAMEN BLANC =====
   Même vol complet que le mode automatique, mais c'est l'élève qui agit :
   - les blocs / écrans à utiliser sont encadrés [ ? ] sans dire quelle commande actionner ;
   - au bout de 30 s sans la bonne action, un QCM d'aide s'ouvre (bonne réponse → ✓, la commande est montrée ; mauvaise → ✗ + tableau) ;
   - les calculs (masse, carburant, VR, descente, VAPP) et le tour avion sont des questions d'examen ;
   - décollage seulement si toutes les étapes avant décollage sont validées, sinon épreuve éliminatoire ;
   - bloc-notes final : chaque point non validé renvoie au dossier, au mode automatique ou au mode guidé, puis on repasse l'examen. */
(function(){
const EX=window.EXAM={on:false,res:[],det:[],reveal:false,cleared:false,gate:false,modal:false,stepI:-1,itemKey:'',itemT:0,qs:[],qT:0,lastAct:0,trig:new Set(),t0:0,final:false};
const HELP_S=30;
const css=document.createElement('style'); css.textContent=`
#exam{position:fixed;left:10px;top:64px;max-height:60vh;overflow:auto;z-index:27;width:min(330px,calc(100vw - 20px));background:#0b131bf2;border:1px solid #e04ad8;border-radius:12px;padding:10px 12px;color:var(--tx);font:14px 'Inter',system-ui,sans-serif;box-shadow:0 8px 30px #000a}
#exam .eh{padding-right:36px;display:flex;align-items:center;gap:8px;font:700 13px 'Barlow Condensed',sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#e04ad8}
#exam .eh span{margin-left:auto;font:700 18px 'JetBrains Mono',monospace;color:#fff;letter-spacing:0}
#exam .et{font:700 17px 'Barlow Condensed',sans-serif;margin:4px 0 2px;line-height:1.15}#exam .ep{color:var(--mut);font-size:12px}
#exam .eb{height:5px;background:#1c2a38;border-radius:3px;margin:7px 0;overflow:hidden}#exam .eb i{display:block;height:100%;background:#ffb020;width:0}
#exam .ec{display:flex;gap:10px;font:600 13px 'JetBrains Mono',monospace;margin:4px 0}#exam .ec .g{color:#3ddc84}#exam .ec .r{color:#ff4a3d}
#exam .ei{font-size:13px;color:#ffd0d0;background:#2a0d0d;border:1px solid #ff2b2b;border-radius:8px;padding:6px 8px;margin:6px 0}
#exam .ebt{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}#exam button,#exq button,#exn button{background:#132232;color:#fff;border:1px solid var(--line);border-radius:8px;padding:7px 10px;font:600 13px 'Barlow Condensed',sans-serif;letter-spacing:.05em;text-transform:uppercase;cursor:pointer}
@media (max-width:700px){#exam{top:auto;bottom:118px;padding:8px 10px}#exam .eh span{font-size:15px}#exam .ep{display:none}#exam .et{font-size:15px}#exam .ebt button{padding:5px 8px;font-size:12px}}
#exam.min .et,#exam.min .ep,#exam.min .eb,#exam.min .ei,#exam.min .etb{display:none}
.etb{max-height:38vh;overflow:auto;margin-top:6px}.etb table{width:100%;border-collapse:collapse;font-size:12.5px}.etb td{padding:4px 5px;border-top:1px solid #1c2a38;vertical-align:top}
.etb td.s{width:34px;text-align:center;font-weight:700}.etb tr.ok td.s,.etb tr.aide td.s{color:#3ddc84}.etb tr.ko td.s{color:#ff4a3d}.etb tr.ko td{background:#2a0d0d}.etb tr.cur td{outline:1px solid #ffb020}.etb small{color:var(--mut)}
#exq{position:fixed;inset:0;z-index:60;background:#000a;display:flex;align-items:flex-end;justify-content:center;padding:10px}
#exq .q{width:min(560px,100%);max-height:92vh;overflow:auto;background:#0b131b;border:2px solid #ffb020;border-radius:14px;padding:14px;color:var(--tx);font:15px 'Inter',system-ui,sans-serif}
#exq .k{font:700 12px 'Barlow Condensed',sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#ffb020}#exq h3{font:700 21px 'Barlow Condensed',sans-serif;margin:4px 0 6px}
#exq .ctx{color:var(--mut);font-size:13.5px;margin-bottom:8px}#exq .o{display:block;width:100%;text-align:left;margin:6px 0;padding:11px 12px!important;font:600 15px 'Inter',system-ui,sans-serif!important;text-transform:none!important;letter-spacing:0!important}
#exq .o.good{border-color:#3ddc84;background:#0d2a18}#exq .o.bad{border-color:#ff4a3d;background:#2a0d0d}
#exq .fb{margin:8px 0;padding:8px 10px;border-radius:8px}#exq .fb.g{background:#0d2a18;border:1px solid #3ddc84}#exq .fb.r{background:#2a0d0d;border:1px solid #ff4a3d}
#exq .go{background:#e04ad8!important;border:0!important;margin-top:6px}#exq .idk{opacity:.8}
#exn{position:fixed;inset:0;z-index:61;background:#050a10f5;overflow:auto;padding:14px;color:var(--tx);font:15px 'Inter',system-ui,sans-serif}
#exn .w{max-width:760px;margin:0 auto}#exn h2{font:700 28px 'Barlow Condensed',sans-serif;margin:6px 0}#exn .v{font:700 20px 'Barlow Condensed',sans-serif;padding:10px 12px;border-radius:10px;margin:8px 0}
#exn .v.ok{background:#0d2a18;border:1px solid #3ddc84;color:#3ddc84}#exn .v.ko{background:#2a0d0d;border:1px solid #ff4a3d;color:#ff8a80}
#exn .it{border:1px solid #ff4a3d55;background:#170a0a;border-radius:10px;padding:10px;margin:8px 0}#exn .it b{font:700 17px 'Barlow Condensed',sans-serif}#exn .it p{margin:4px 0;color:#ffd0d0;font-size:13.5px}
#exn .it .bt{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}#exn textarea{width:100%;min-height:110px;background:#0b131b;color:#fff;border:1px solid var(--line);border-radius:8px;padding:8px;font:14px 'Inter',system-ui,sans-serif;box-sizing:border-box}
#exn .main{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}#exn .main .p{background:#e04ad8;border:0}
#exn .hist{color:var(--mut);font-size:12.5px}`;
document.head.appendChild(css);

const $$=id=>document.getElementById(id);
const fmtN=n=>Math.round(n).toLocaleString('fr-FR');
const mmss=s=>String(Math.floor(s/60)).padStart(2,'0')+':'+String(Math.floor(s%60)).padStart(2,'0');
const shuffle=a=>{ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
const isStudent=it=>!!(it&&it[2]&&it[3]);   // commande réelle du cockpit
const store={get(k,d){ try{ const v=localStorage.getItem(k); return v==null?d:JSON.parse(v); }catch(e){ return d; } },set(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); }catch(e){} }};

/* ---------- questions d'examen (calculs, tour avion, théorie) ---------- */
function numQ(title,ctx,val,unit,why){ const r=v=>unit==='kg'?Math.round(v/10)*10:Math.round(v); const good=r(val);
  const set=new Set([good]); const opts=[good]; [0.88,1.12,0.94,1.07,1.2,0.8].forEach(f=>{ const v=r(val*f); if(opts.length<4&&!set.has(v)&&v>0){ set.add(v); opts.push(v); } });
  const lab=v=>fmtN(v)+' '+unit; return {kind:'q',title,ctx,opts:shuffle(opts.map(v=>({t:lab(v),ok:v===good}))),why,expect:lab(good)}; }
function txtQ(title,ctx,good,bad,why){ return {kind:'q',title,ctx,opts:shuffle([{t:good,ok:true}].concat(bad.map(t=>({t,ok:false})))),why,expect:good}; }
function walkQ(n){ const W=(WALKPTS[ACK]||[]).slice(); if(W.length<4) return []; const out=[]; const pick=shuffle(W.map((p,i)=>i)).slice(0,n);
  pick.forEach(k=>{ const p=W[k], others=shuffle(W.filter((x,i)=>i!==k)).slice(0,3);
    out.push({kind:'q',title:'Tour avion : point « '+p[2]+' »',ctx:'Arrivé à ce point de la visite extérieure, que contrôlez-vous ?',opts:shuffle([{t:p[3],ok:true}].concat(others.map(o=>({t:o[3],ok:false})))),why:'Chaque point du tour avion a ses vérifications propres : voir la page « Tour avion » du dossier.',expect:p[3]}); });
  return out; }
function questionsFor(st){ const L=LS||{}, W=(typeof WB!=='undefined'&&WB[ACK])||{}, t=st.t||'', Q=[];
  if(/Briefing/i.test(t)) Q.push(txtQ('Lecture du METAR','Dans le METAR de départ, le groupe « 31012KT » signifie :','Vent du 310° (d\'où il vient), 12 nœuds',['Piste 31, visibilité 12 km','Vent vers le 310°, 12 km/h','Cap 310°, 12 kt de vent arrière'],'Le vent est donné d\'où il vient, en degrés vrais, puis la force en nœuds (KT).'));
  if(/Devis de masse/i.test(t)&&L.zfw) Q.push(numQ('Calcul : masse au décollage (TOW)',`ZFW ${fmtN(L.zfw)} kg + carburant bloc ${fmtN(L.block)} kg − carburant de roulage ${fmtN(W.taxi||0)} kg = ?`,L.tow,'kg','TOW = masse sans carburant (ZFW) + carburant embarqué (bloc) − carburant brûlé au roulage. Elle doit rester ≤ MTOW.'));
  if(/Bilan carburant/i.test(t)&&L.need) Q.push(numQ('Calcul : carburant minimum requis',`roulage ${fmtN(W.taxi||0)} + étape ${fmtN(L.trip)} + réserve de route 5 % ${fmtN(L.cont)} + dégagement ${fmtN(W.alt||0)} + réserve finale 30 min ${fmtN(W.res30||0)}${L.extra?' + supplément '+fmtN(L.extra):''} = ? (kg)`,L.need,'kg','On additionne toutes les parts réglementaires : roulage, étape, réserve de route, dégagement, réserve finale (+ supplément décidé par le commandant).'));
  if(st.walk&&/Tour (avion|hélicoptère)/i.test(t)) Q.push(...walkQ(2));
  if(/FMS|Performances/i.test(t)&&L.vr) Q.push(numQ('Calcul : vitesse de rotation VR',AL()?`Formule pédagogique du simulateur : VR = 118 + (TOW en tonnes − 50) × 1,25. TOW = ${(L.tow/1000).toFixed(1)} t.`:`Formule pédagogique du simulateur : VR = 118 + (TOW en tonnes − 8) × 6. TOW = ${(L.tow/1000).toFixed(2)} t.`,L.vr,'kt','VR dépend de la masse : plus l\'avion est lourd, plus il faut de vitesse pour lever le nez.'));
  if(/Before Start/i.test(t)) Q.push(txtQ('Calage altimétrique','Avant la mise en route, on affiche le QNH donné par l\'ATIS. À quoi sert-il ?','L\'altimètre indique l\'altitude au-dessus du niveau de la mer (au sol : l\'altitude du terrain)',['Il règle la fréquence radio de la tour','Il indique la hauteur au-dessus de la piste (0 au sol)','Il sert à calculer le carburant'],'QNH = pression ramenée au niveau de la mer : au sol, l\'altimètre doit afficher l\'altitude du terrain.'));
  if(/début de descente|^Descente/i.test(t)&&A.kind==='fw'){ const cr=Math.max(10000,Math.round((S.alt/FT)/1000)*1000||35000); Q.push(numQ('Calcul : point de début de descente',`Règle des 3 : distance (NM) = altitude à perdre (en milliers de ft) × 3. Vous êtes à ${fmtN(cr)} ft et devez être à 3 000 ft au point d\'approche finale.`,(cr-3000)/1000*3,'NM','Pente d\'environ 3° : on perd 1 000 ft tous les 3 NM. On ajoute une marge pour décélérer.')); }
  if(/Approche ILS|Descente et approche/i.test(t)&&L.vls) Q.push(numQ('Calcul : vitesse d\'approche VAPP',`VLS (vitesse minimale sélectionnable) = ${L.vls} kt. VAPP = VLS + 5 kt (vent faible).`,L.vls+5,'kt','VAPP = VLS + 5 kt, plus une correction si le vent est fort ou en rafales.'));
  if(/^Atterrissage/i.test(t)) Q.push(txtQ('Minimums','En approche ILS, à la hauteur de décision (DH), vous ne voyez pas la piste. Que faites-vous ?','Remise des gaz immédiate',['On continue jusqu\'à 50 ft pour voir','On réduit la vitesse et on attend','On passe en mode HDG et on tourne autour'],'Sans référence visuelle à la DH, la remise des gaz est obligatoire.'));
  if(/Parking et arrêt/i.test(t)) Q.push(txtQ('Arrêt des moteurs','Avant de couper les moteurs au poste, que vérifie-t-on d\'abord ?','Frein de parc serré et cales en place',['Train rentré','Transpondeur sur TA/RA','Volets FULL'],'L\'avion ne doit pas pouvoir bouger : frein de parc, puis cales posées par le personnel au sol.'));
  // hélicoptères
  if(A.kind==='rw'){
    if(/Avant la mise en route|Alimentation et feux/i.test(t)) Q.push(txtQ('Frein rotor','Avant la mise en route, le frein rotor doit être :','Desserré (sinon le rotor ne peut pas tourner au démarrage)',['Serré jusqu\'au décollage','Serré à moitié','Peu importe au sol'],'Frein rotor desserré avant le démarrage ; on ne le serre qu\'à l\'arrêt, rotor à faible régime.'));
    if(/Démarrage de la turbine|Démarrage des turbines/i.test(t)) Q.push(txtQ('Surveillance au démarrage','Pendant le démarrage d\'une turbine, quel paramètre surveille-t-on en priorité ?','La température des gaz (T4 / TOT) : arrêt immédiat si elle dépasse la limite',['La vitesse air','L\'altitude','Le cap'],'Un démarrage « chaud » (température excessive) peut endommager la turbine : on coupe le carburant si la limite est atteinte.'));
    if(/Démarrage du moteur/i.test(t)) Q.push(txtQ('Moteur à pistons','Sur le R44, que fait l\'embrayage (CLUTCH) ?','Il relie progressivement le moteur au rotor par les courroies',['Il démarre le moteur','Il règle la richesse du mélange','Il freine le rotor'],'On démarre moteur débrayé, puis on embraye : les courroies se tendent et le rotor se met à tourner.'));
    if(/Embrayage et montée en régime/i.test(t)) Q.push(txtQ('Régime rotor','Pourquoi le régime rotor doit-il rester dans l\'arc vert ?','Trop bas, le rotor perd sa portance et peut décrocher ; trop haut, risque de survitesse et de dommages',['Pour économiser le carburant uniquement','Pour réduire le bruit','Ce n\'est utile qu\'en croisière'],'Le régime rotor est vital sur hélicoptère : alarme « LOW RPM » si il chute.'));
    if(/^Décollage/i.test(t)) Q.push(txtQ('Décollage hélicoptère','Avant de prendre de la vitesse, que vérifie le pilote en stationnaire près du sol ?','Que l\'hélicoptère tient le stationnaire avec une marge de puissance (effet de sol, paramètres moteur dans les limites)',['Que le train est rentré','Que les volets sont sortis','Que le pilote automatique est engagé'],'Le stationnaire dans l\'effet de sol (HIGE) demande moins de puissance qu\'hors effet de sol (HOGE) : on vérifie la marge avant la transition.'));
    if(/^Approche et posé/i.test(t)) Q.push(txtQ('Anneau tourbillonnaire (vortex)','Quelle situation peut faire entrer l\'hélicoptère en anneau tourbillonnaire ?','Une descente presque verticale, rapide, à faible vitesse avec de la puissance',['Une croisière rapide en palier','Un roulage au sol','Un virage à grande vitesse'],'Le rotor redescend dans son propre souffle : la portance s\'effondre. Remède : prendre de la vitesse (cyclique vers l\'avant).'));
    if(/^Arrêt/i.test(t)) Q.push(txtQ('Panne moteur','En vol, le moteur s\'arrête. Premier réflexe sur hélicoptère ?','Baisser immédiatement le pas collectif pour garder le régime rotor (autorotation)',['Tirer sur le pas collectif','Couper la batterie','Serrer le frein rotor'],'En autorotation, l\'air qui traverse le rotor le fait tourner : on garde le régime, puis on arrondit pour se poser.'));
  }
  return Q; }
/* QCM d'aide pour une commande à actionner */
function helpQ(st,it){ const all=[]; GD.steps.forEach((s,k)=>s.items.forEach(x=>{ if(isStudent(x)&&x[0]!==it[0]) all.push({t:x[0],near:Math.abs(k-GD.i)}); }));
  const uniq=[...new Map(all.map(x=>[x.t,x])).values()].sort((a,b)=>a.near-b.near); const bad=shuffle(uniq.slice(0,8)).slice(0,3).map(x=>x.t);
  const el=PT&&PT.el?PT.el(it[3]):null, sec=el&&el.closest('.sec'), blk=sec?sec.querySelector('h4').textContent:'';
  return {kind:'help',title:'QCM d\'aide — '+st.t,ctx:`Vous êtes à l\'étape « ${st.t} ». ${blk?'Le bloc encadré est « '+blk+' ». ':''}Quelle commande faut-il actionner maintenant ?`,opts:shuffle([{t:it[0],ok:true}].concat(bad.map(t=>({t,ok:false})))),why:(PT&&PT.help?PT.help(it[0])||'':''),expect:it[0],item:it}; }

/* ---------- panneau d'état ---------- */
function panel(){ let p=$$('exam'); if(p) return p; p=document.createElement('aside'); p.id='exam'; p.className='panel'; p.innerHTML=`<div class="eh">🎓 Examen blanc<span data-c>00:00</span></div><div class="et"></div><div class="ep"></div><div class="eb"><i></i></div><div class="ec"><b class="g">✓ 0</b><b class="r">✗ 0</b><b data-n></b></div><div class="ei" hidden></div><div class="etb" hidden></div>
  <div class="ebt"><button type="button" data-t>📋 Tableau</button><button type="button" data-m>▁ Réduire</button><button type="button" data-q>✕ Abandonner</button></div>`; document.body.appendChild(p);
  p.querySelector('[data-t]').onclick=()=>{ const t=p.querySelector('.etb'); t.hidden=!t.hidden; if(!t.hidden) t.innerHTML=tableHTML(); };
  p.querySelector('[data-m]').onclick=()=>p.classList.toggle('min');
  p.querySelector('[data-q]').onclick=()=>{ finish('abandon'); };
  return p; }
function counts(){ let g=0,r=0; EX.res.forEach(v=>{ if(v==='ok'||v==='aide') g++; else if(v==='ko') r++; }); return {g,r}; }
function tableHTML(){ return '<table>'+GD.steps.map((s,k)=>{ const v=EX.res[k]; if(k===GD.steps.length-1) return ''; const cls=(v||'')+(k===GD.i&&EX.on?' cur':'');
  return `<tr class="${cls}"><td class="s">${v==='ok'?'✓':v==='aide'?'✓<small> aide</small>':v==='ko'?'✗':k===GD.i?'▶':'·'}</td><td>${k} · ${s.t}<br><small>${s.ph}${EX.det[k]&&EX.det[k].length?' — '+EX.det[k].map(d=>d.what).join(' ; '):''}</small></td></tr>`; }).join('')+'</table>'; }
function paint(){ const p=$$('exam'); if(!p) return; if(!EX.on){ p.hidden=true; return; } p.hidden=false; const st=GD.steps[GD.i]||{}, N=GD.steps.length-1, now=performance.now();
  p.querySelector('.et').textContent='Étape '+GD.i+'/'+N+' — '+(st.t||''); p.querySelector('.ep').textContent=(st.ph||'')+(EX.cleared?' · décollage autorisé':'');
  p.querySelector('[data-c]').textContent=mmss((now-EX.t0)/1000);
  const c=counts(); p.querySelector('.g').textContent='✓ '+c.g; p.querySelector('.r').textContent='✗ '+c.r; p.querySelector('[data-n]').textContent='/ '+N;
  const it=curItem(), info=p.querySelector('.ei'), bar=p.querySelector('.eb i');
  if(it&&isStudent(it)&&!EX.modal){ const el=(now-EX.itemT)/1000; info.hidden=false; bar.style.width=Math.min(100,el/HELP_S*100)+'%';
    info.innerHTML=EX.reveal?'👉 La commande est encadrée : actionnez-la.':`À vous : trouvez la commande dans le bloc encadré <b>[ ? ]</b>. ${el<HELP_S?'QCM d\'aide dans '+Math.ceil(HELP_S-el)+' s':''}`; }
  else if(EX.qs.length&&!EX.modal){ info.hidden=false; info.textContent='Question d\'examen à venir…'; bar.style.width='0'; }
  else { info.hidden=true; bar.style.width='0'; }
  const tb=p.querySelector('.etb'); if(!tb.hidden&&(!EX._tbT||now-EX._tbT>1500)){ EX._tbT=now; tb.innerHTML=tableHTML(); } }

/* ---------- modale QCM ---------- */
function ask(q,done){ EX.q=q; EX.modal=true; EX.wasPaused=paused; paused=true; let m=$$('exq'); if(m) m.remove(); m=document.createElement('div'); m.id='exq';
  m.innerHTML=`<div class="q"><div class="k">${q.kind==='help'?'QCM d\'aide · '+HELP_S+' s écoulées':'Question d\'examen'} · étape ${GD.i}</div><h3>${q.title}</h3><div class="ctx">${q.ctx}</div>${q.opts.map((o,k)=>`<button type="button" class="o" data-k="${k}">${String.fromCharCode(65+k)}. ${o.t}</button>`).join('')}<button type="button" class="o idk" data-k="-1">Je ne sais pas</button><div class="after"></div></div>`;
  document.body.appendChild(m);
  m.addEventListener('click',e=>{ const b=e.target.closest('.o'); if(!b||m.dataset.done) return; m.dataset.done=1; const k=+b.dataset.k, ok=k>=0&&q.opts[k].ok;
    m.querySelectorAll('.o').forEach((x,j)=>{ const kk=+x.dataset.k; if(kk>=0&&q.opts[kk].ok) x.classList.add('good'); else if(x===b) x.classList.add('bad'); x.disabled=true; });
    const a=m.querySelector('.after');
    if(ok) a.innerHTML=`<div class="fb g">✓ Bonne réponse. ${q.kind==='help'?'La commande est maintenant encadrée : <b>appuyez dessus</b> pour passer à la suite.':''}${q.why?'<br><small>'+q.why+'</small>':''}</div><button type="button" class="go">${q.kind==='help'?'J\'y vais 👆':'Continuer ▸'}</button>`;
    else a.innerHTML=`<div class="fb r">✗ ${k<0?'Pas de réponse':'Mauvaise réponse'}. Attendu : <b>${q.expect}</b>.${q.why?'<br><small>'+q.why+'</small>':''}</div><div class="etb">${tableHTML()}</div><button type="button" class="go">Continuer ▸</button>`;
    a.querySelector('.go').onclick=()=>{ m.remove(); EX.modal=false; paused=EX.wasPaused; EX.itemT=performance.now(); done(ok,k<0?'(sans réponse)':q.opts[k].t); };
    try{ SND&&SND.play&&SND.play(ok?'chime':'caution'); }catch(e){} }); }

/* ---------- moteur ---------- */
function mark(i,v,what){ if(v==='ko'){ EX.res[i]='ko'; } else if(v==='aide'){ if(EX.res[i]!=='ko') EX.res[i]='aide'; } else if(!EX.res[i]) EX.res[i]='ok'; if(what){ (EX.det[i]=EX.det[i]||[]).push(what); } }
function curItem(){ const st=GD.steps[GD.i]; if(!st) return null; return st.items.find(x=>{ try{ return !x[1](); }catch(e){ return true; } })||null; }
function enterStep(){ const st=GD.steps[GD.i]; EX.stepI=GD.i; EX.qs=st?questionsFor(st):[]; EX.qT=performance.now(); EX.reveal=false; EX.itemKey=''; EX.trig=new Set(); EX.doneT=0; }
function tick(){ if(!EX.on||!GD.on||!$$('menu').hidden) return; paint(); if(EX.modal||paused) return;
  const now=performance.now(), st=GD.steps[GD.i]; if(!st) return; if(EX.stepI!==GD.i) enterStep();
  AUTO.stage='exam';
  if(GD.i>=GD.steps.length-1){ finish('end'); return; }
  // questions d'examen de l'étape (calculs, tour avion, théorie)
  if(EX.qs.length&&now-EX.qT>1500){ const q=EX.qs.shift(), i=GD.i; ask(q,(ok,ans)=>{ mark(i,ok?'ok':'ko',ok?null:{what:q.title,got:ans,expect:q.expect,why:q.why}); EX.qT=performance.now(); }); return; }
  // porte de décollage : toutes les étapes avant décollage doivent être validées
  if(st.fly==='takeoff'&&!EX.gate){ const pre=st.items.filter(x=>!/en vol/i.test(x[0])); const ready=pre.every(x=>{ try{ return x[1](); }catch(e){ return false; } });
    if(ready&&!EX.qs.length){ EX.gate=true; mark(GD.i,'ok'); const bad=EX.res.slice(0,GD.i+1).some(v=>v==='ko');
      if(bad){ finish('elim'); return; } EX.cleared=true; flash('Examen : toutes les étapes validées — décollage autorisé','am'); try{ SND&&SND.play&&SND.play('chime'); }catch(e){} } }
  if(st.walk&&!walkDone()) return;   // le déplacement du tour avion est automatique, les questions portent sur les points
  const it=curItem();
  if(!it){ if(EX.qs.length) return; if(!EX.doneT){ EX.doneT=now; mark(GD.i,'ok'); return; } if(now-EX.doneT<1200) return; goStep(GD.i+1); return; }
  const key=GD.i+':'+it[0]; if(key!==EX.itemKey){ EX.itemKey=key; EX.itemT=now; EX.reveal=false; EX.helped=false; }
  if(isStudent(it)){ // à l'élève de jouer
    if(!EX.helped&&now-EX.itemT>HELP_S*1000){ EX.helped=true; const q=helpQ(st,it), i=GD.i; ask(q,(ok,ans)=>{ EX.reveal=true; if(ok) mark(i,'aide',{what:'Aide QCM : '+it[0],help:true}); else mark(i,'ko',{what:'Commande non trouvée : '+it[0],got:ans,expect:it[0],why:q.why}); EX.revT=performance.now(); }); return; }
    if(EX.reveal&&EX.revT&&now-EX.revT>25000&&!EX.trig.has(key)){ EX.trig.add(key); try{ it[2](); ovhSync(); pedSync(); }catch(e){} }   // montrée mais pas faite : l'instructeur la fait
    return; }
  // action système (radio, roulage, attente…) : l'instructeur / le pilote automatique s'en charge
  if(!it[2]) return; if(st.fly&&!S.onGround&&!/APPR|Itinéraire|Calcul|vu$|Mode NAV|LAND OFF/.test(it[0])) return;
  if(EX.trig.has(key)&&now-EX.lastAct<8000) return; if(now-EX.lastAct<1400) return; EX.trig.add(key); EX.lastAct=now;
  setTimeout(()=>{ try{ it[2](); }catch(e){} try{ ovhSync(); pedSync(); renderGuide(); }catch(e){} },500); }
setInterval(()=>{ try{ tick(); }catch(e){ console.warn('examen',e); } },250);

// le pilote automatique ne décolle pas tant que l'examen n'a pas autorisé le décollage
const _fly=flyFW; flyFW=function(dt){ const st=GD.steps[GD.i]||{}; if(EX.on&&S.onGround&&st.fly==='takeoff'&&!EX.cleared){ S.thr=0; S.brake=true; return; } return _fly(dt); };
// l'enchaînement automatique d'origine est remplacé pendant l'examen
const _at=autoTick; autoTick=function(){ if(EX.on) return; return _at.apply(this,arguments); };

function start(){ EX.on=true; EX.res=[]; EX.det=[]; EX.cleared=false; EX.gate=false; EX.final=false; EX.modal=false; EX.stepI=-1; EX.t0=performance.now();
  autoStart(true); AUTO.stage='exam'; GD.peda=false; try{ renderGuide(); }catch(e){} const g=$$('guide'); if(g) g.hidden=true; panel(); paint();
  flash('Examen blanc : à vous de jouer','am'); }
function finish(why){ if(!EX.on&&why!=='show') return; EX.on=false; EX.final=true; const m=$$('exq'); if(m) m.remove(); EX.modal=false;
  if(why==='elim'){ S.thr=0; S.pbrake=true; }
  autoStart(false); if(why!=='end') { paused=true; }
  const p=$$('exam'); if(p) p.hidden=true;
  const c=counts(), ko=EX.res.map((v,k)=>v==='ko'?k:-1).filter(k=>k>=0), N=GD.steps.length-1;
  const verdict=why==='elim'?'ko':why==='abandon'?'ab':ko.length?'ko':'ok';
  const hist=store.get('pt-exam-hist',[]); hist.unshift({d:new Date().toISOString().slice(0,16).replace('T',' '),ac:A.name,ok:c.g,ko:c.r,n:N,v:verdict}); store.set('pt-exam-hist',hist.slice(0,10));
  notes(verdict,ko,c,N,hist); }
/* ---------- bloc-notes final ---------- */
function notes(verdict,ko,c,N,hist){ let n=$$('exn'); if(n) n.remove(); n=document.createElement('div'); n.id='exn';
  const head=verdict==='ok'?`<div class="v ok">✓ EXAMEN BLANC RÉUSSI — ${c.g}/${N} étapes validées. Théorie du cours validée.</div>`:verdict==='ab'?`<div class="v ko">Examen abandonné — ${c.g} étapes validées, ${c.r} non validées.</div>`:verdict==='ko'&&EX.cleared?`<div class="v ko">✗ AJOURNÉ — vol réalisé mais ${c.r} étape(s) non validée(s) après le décollage.</div>`:`<div class="v ko">✗ ÉPREUVE ÉLIMINATOIRE — l'avion ne décolle pas : ${c.r} étape(s) non validée(s) avant le décollage.</div>`;
  n.innerHTML=`<div class="w"><div style="font:700 12px 'Barlow Condensed',sans-serif;letter-spacing:.14em;color:#e04ad8">PARCOURS PILOTE · EXAMEN BLANC · ${A.name}</div><h2>Bloc-notes de l'examen</h2>${head}
   ${ko.length?`<h3 style="font:700 19px 'Barlow Condensed',sans-serif;margin:12px 0 4px">À revoir (${ko.length}) — on réapprend, on révise, on note, puis on reprend l'examen</h3>`:''}
   ${ko.map(k=>{ const s=GD.steps[k]; return `<div class="it"><b>✗ Étape ${k} — ${s.t}</b> <small style="color:var(--mut)">${s.ph}</small>${(EX.det[k]||[]).filter(d=>!d.help).map(d=>`<p>• ${d.what}${d.got?` — votre réponse : <i>${d.got}</i>`:''}${d.expect?` — attendu : <b>${d.expect}</b>`:''}${d.why?`<br><small>${d.why}</small>`:''}</p>`).join('')}
     <div class="bt"><button type="button" data-rev="${k}">📖 Réviser (dossier, étape ${k})</button><button type="button" data-auto="${k}">▶ Voir en mode automatique</button><button type="button" data-guide="${k}">🎓 Refaire en mode guidé</button></div></div>`; }).join('')}
   <h3 style="font:700 19px 'Barlow Condensed',sans-serif;margin:14px 0 4px">📝 Mes notes</h3><textarea id="exn-t" placeholder="Ce que je dois retenir…">${store.get('pt-exam-notes','')}</textarea>
   <div class="main"><button type="button" class="p" data-retry>🔁 Reprendre l'examen blanc</button><button type="button" data-tab>📋 Tableau complet ✓ / ✗</button><button type="button" data-close>Fermer</button></div><div class="etb" hidden></div>
   <div class="hist"><b>Historique :</b> ${hist.slice(0,5).map(h=>`${h.d} · ${h.ac} · ${h.v==='ok'?'réussi':h.v==='ab'?'abandon':'ajourné'} (${h.ok}✓ / ${h.ko}✗)`).join(' — ')}</div></div>`;
  document.body.appendChild(n);
  n.querySelector('#exn-t').addEventListener('input',e=>store.set('pt-exam-notes',e.target.value));
  n.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b) return; const d=b.dataset;
    if(d.close!=null){ n.remove(); paused=false; }
    else if(d.tab!=null){ const t=n.querySelector('.etb'); t.hidden=!t.hidden; t.innerHTML=tableHTML(); }
    else if(d.retry!=null){ n.remove(); paused=false; relaunch('exam'); }
    else if(d.rev!=null){ review(+d.rev); }
    else if(d.auto!=null){ n.remove(); paused=false; window.FF={to:+d.auto,then:'auto'}; relaunch('auto'); }
    else if(d.guide!=null){ n.remove(); paused=false; window.FF={to:+d.guide,then:'guide'}; relaunch('auto'); } }); }
function relaunch(mode){ if(window.BR&&BR.launchMode){ BR.launchMode(mode); return; } }
function review(k){ if(!window.BR||!BR.show) return; BR.show(true,0); const idx=(BR.pages||[]).findIndex(p=>p.si===k); if(idx>0) BR.show(true,idx); }

/* avance rapide : voir addon_jump.js */

/* ---------- branchements ---------- */
const _sm=startMission; startMission=function(){ EX.on=false; const p=$$('exam'); if(p) p.hidden=true; const r=_sm.apply(this,arguments); if(window.EXAM_PENDING&&MI&&MI.full){ window.EXAM_PENDING=false; setTimeout(start,50); } return r; };
EX.start=start; EX.finish=finish;
})();
