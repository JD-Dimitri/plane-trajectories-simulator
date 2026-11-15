/* =====================================================================================================
   V7.6 — MODE AUTOMATIQUE « COMME SI VOUS PILOTIEZ » : CADRES ROUGES NUMÉROTÉS SUR LES COMMANDES ET LES ÉCRANS
   Hiérarchie lisible partout : [THÈME GLOBAL] › [PARTIE A-D] › [ÉTAPE n] › [SOUS-ÉTAPE 1 … finale].
   À chaque étape, le panneau qui contient les commandes s'ouvre (plafonnier, pédestal ; FCU et écrans toujours visibles
   en vue cockpit) et chaque commande à actionner est entourée d'un cadre rouge portant le numéro de sa sous-étape.
   La sous-étape finale (✓) encadre l'écran où l'on vérifie le résultat. Les numéros sont les mêmes que dans la bulle.
   ===================================================================================================== */
(function(){
'use strict';
const PT=window.PT={};
/* ---------- parties du vol (le « thème global » découpé) ---------- */
PT.parts=function(steps){ steps=steps||GD.steps||[]; const tk=steps.findIndex(s=>s.ph==='Décollage'), cr=steps.map(s=>s.ph).lastIndexOf('Croisière'), ld=steps.map(s=>s.ph).lastIndexOf('Atterrissage');
  const a=tk<0?0:tk, b=cr<0?a:cr, c=ld<0?b:ld;
  return [{k:'A',n:'DÉPART',d:'de la préparation au point d\'arrêt',i0:0,i1:a-1},{k:'B',n:'DÉCOLLAGE → CROISIÈRE',d:'quitter le sol et monter au niveau de vol',i0:a,i1:b},
    {k:'C',n:'CROISIÈRE → ATTERRISSAGE',d:'descendre, approcher, se poser',i0:b+1,i1:c},{k:'D',n:'PARKING',d:'dégager la piste, rouler, arrêter, sécuriser',i0:c+1,i1:steps.length-1}].filter(p=>p.i1>=p.i0); };
PT.partOf=i=>PT.parts().find(p=>i>=p.i0&&i<=p.i1)||{k:'',n:''};
PT.theme=()=>`PILOTER ${(A&&A.name)||'L\'AVION'}`;
/* ---------- résultat attendu de chaque étape (sous-étape finale) ---------- */
const RES=[[/Briefing/,'Vous savez quel temps il fera, quelle route suivre et si le vol est possible.','nd'],[/Devis/,'Masses sous les limites (MZFW, MTOW, MLW), centrage dans les limites.',null],[/Bilan carburant/,'Carburant décidé : trajet, imprévus, dégagement et réserve finale sont prévus.',null],
 [/Arrivée au parking/,'Vous êtes au pied de l\'avion, en sécurité.',null],[/Tour avion|visite/,'L\'avion est apte au vol : rien d\'anormal à l\'extérieur.',null],[/Monter à bord|cold/,'Assis en place gauche, sécurités vérifiées, avion éteint.',null],
 [/batteries|Alimentation électrique|Alimentation et feux/,'L\'AVION EST SOUS TENSION : les écrans peuvent s\'allumer.','sd'],[/APU/,'L\'APU TOURNE (APU AVAIL) : électricité et air comprimé disponibles.','sd'],
 [/inertielles|AHRS/,'CENTRALES ALIGNÉES : l\'avion connaît sa position et son attitude (plus de drapeaux rouges).','pfd'],[/Feux, consignes/,'Feux et consignes réglés, carburant vérifié.','sd'],[/FMS|Performances/,'Le calculateur connaît la route, les masses et les vitesses de décollage.','pfd'],
 [/Before Start/,'Prêt pour la mise en route ; le personnel au sol est prévenu (BEACON).','ewd'],[/Démarrage du moteur 2/,'LE MOTEUR 2 TOURNE : N2 stabilisé au ralenti, EGT normale.','ewd'],[/Démarrage du moteur 1/,'L\'AVION A DÉMARRÉ : les deux moteurs tournent au ralenti.','ewd'],
 [/Démarrage/,'L\'APPAREIL A DÉMARRÉ : moteur(s) au ralenti, paramètres normaux.','ewd'],[/Embrayage/,'Le rotor tourne à son régime de vol.','ewd'],[/Après l'atterrissage/,'Piste dégagée, roulage vers le poste de stationnement.','nd'],[/roulage|Roulage/,'L\'AVION EST ALIGNÉ sur la piste, prêt à décoller.','nd'],
 [/Before Takeoff|^Décollage/,'L\'AVION VOLE : il a quitté la piste et monte.','pfd'],[/Après décollage/,'Train et volets rentrés, pilote automatique engagé.','pfd'],[/Montée/,'L\'avion est à son niveau de croisière.','pfd'],[/Croisière/,'Croisière stable, carburant conforme au plan.','nd'],
 [/Descente/,'Descente commencée au bon point.','nd'],[/Approche/,'Avion configuré et stabilisé sur l\'axe et la pente.','pfd'],[/Atterrissage|posé/,'L\'AVION EST POSÉ et ralenti sur la piste.','pfd'],[/Parking|Arrêt/,'L\'AVION EST STATIONNÉ : moteurs arrêtés, BEACON éteint.','ewd'],[/Sécurisation/,'Avion éteint et sécurisé, anomalies notées.',null],[/terminée/,'Fin de la mission.',null]];
PT.result=st=>{ for(const [r,t,s] of RES) if(r.test(st.t)) return {t,scr:s}; return {t:'Étape terminée.',scr:null}; };
/* écran où l'on voit l'effet d'une action sans commande dédiée */
PT.scrFor=l=>/BAT|EXT PWR|GEN|ELEC|APU/i.test(l)?'sd':/ENG|N1|N2|EGT|MASTER|IGN|START|AVAIL|moteur|turbine|rotor/i.test(l)?'ewd':/ADIRS|IR |align|AHRS/i.test(l)?'pfd':/NAV|route|itinéraire|roulage|point d'arrêt|250 km|cap/i.test(l)?'nd':/En vol|FL|vitesse|ALT|V\/S|Posé|APPR|LOC|ILS|SPD|stationnaire|translation|arrêt|Arrêté|hauteur/i.test(l)?'pfd':null;
/* ---------- où se trouve la commande ---------- */
function defOf(kind,id){ try{ if(kind==='sw'){ for(const col of OVH[ACK].secs) for(const [t,items] of col) for(const it of items) if(it[0]===id) return {sec:t,l:it[1]}; }
  if(kind==='pd'){ for(const [t,items] of PED[ACK]) for(const it of items) if(it[0]===id) return {sec:t,l:it[1]}; } }catch(e){} return null; }
PT.where=sel=>{ const m=/data-(sw|pd|f)="([^"]+)"/.exec(sel||''); if(!m) return ''; const d=defOf(m[1],m[2]);
  return m[1]==='sw'?`Panneau plafond${d?' › '+d.sec:''}`:m[1]==='pd'?`${A.kind==='fw'?'Pédestal':'Console'}${d?' › '+d.sec:''}`:'Bandeau FCU (au-dessus des écrans)'; };
PT.help=sel=>{ const m=/data-(sw|pd|f)="([^"]+)"/.exec(sel||''); return m&&typeof H320!=='undefined'&&ACK==='a320'&&H320[m[2]]?H320[m[2]]:''; };
const SCRN={pfd:'Écran PFD (pilotage : assiette, vitesse, altitude)',nd:'Écran ND (navigation : route, carte)',ewd:'Écran moteurs (E/WD : N1, EGT, N2, volets)',sd:'Écran systèmes (SD : électricité, APU, carburant)',panel:'Planche de bord'};
PT.scrName=k=>SCRN[k]||SCRN.panel;
/* ---------- sous-étapes numérotées d'une étape ---------- */
PT.subs=function(st){ const out=(st.items||[]).map((it,j)=>{ let ok=false; try{ ok=!!it[1](); }catch(e){} const sel=it[3]&&!/^#mcdu/.test(it[3])?it[3]:null, scr=sel?null:PT.scrFor(it[0]);
    return {n:j+1,l:it[0],ok,sel,scr,where:sel?PT.where(sel):scr?PT.scrName(scr):(st.calc?'Calcul papier (panneau du guide)':st.walk?'À pied, autour de l\'appareil':'Commandes de vol'),help:sel?PT.help(sel):''}; });
  const r=PT.result(st), all=out.every(s=>s.ok); out.push({n:out.length+1,l:'Résultat : '+r.t,ok:all&&AUTO.stage==='done',scr:r.scr,final:true,where:r.scr?PT.scrName(r.scr):''}); return out; };
PT.current=subs=>subs.find(s=>!s.ok&&!s.final)||subs[subs.length-1];
/* ---------- géométrie des écrans du cockpit (même calcul que drawCockpit) ---------- */
PT.scrRect=function(k){ const cv=$('ckc'); if(!cv||view!=='ck') return null; const r=cv.getBoundingClientRect(); if(r.height<20) return null; const W=r.width,H=r.height;
  if(ACK==='a320'||ACK==='lj60'){ const s=Math.min(H*0.66,W/5.7), gap=(W-5*s)/6, y0=H*0.08, X=i=>gap+i*(s+gap); let x,y,w,h;
    if(k==='pfd'){ x=X(0); y=y0; w=h=s; } else if(k==='nd'){ x=X(1); y=y0; w=h=s; }
    else if(k==='ewd'||k==='sd'){ if(ACK==='a320'){ const sc=Math.min(s,(H-y0-10)/2); x=X(2)+(s-sc)/2; y=k==='ewd'?y0:y0+sc+4; w=h=sc; } else { x=X(2); y=y0; w=h=s; } }
    else { x=4; y=4; w=W-8; h=H-8; }
    return {left:r.left+x,top:r.top+y,width:w,height:h}; }
  return {left:r.left+W*0.08,top:r.top+6,width:W*0.84,height:H-12}; };
/* ---------- calque des cadres ---------- */
const css=document.createElement('style'); css.textContent=`
#sfr{position:fixed;inset:0;pointer-events:none;z-index:25}
#sfr .fr{position:fixed;border:3px solid #ff2b2b;border-radius:7px;box-shadow:0 0 0 2px #0008,0 0 14px #ff2b2b88;transition:all .15s}
#sfr .fr i{position:absolute;left:-13px;top:-13px;min-width:24px;height:24px;padding:0 5px;border-radius:12px;background:#ff2b2b;color:#fff;font:700 13px/24px 'JetBrains Mono',monospace;text-align:center;font-style:normal;box-shadow:0 2px 6px #000a}
#sfr .fr.cur{border-width:4px;animation:frp 1s ease-in-out infinite}
#sfr .fr.ok{border-color:#ff2b2b66;box-shadow:none}#sfr .fr.ok i{background:#2a8c4a}
#sfr .fr.fin{border-style:dashed}#sfr .fr.fin.ok{border-color:#3ddc84;border-style:solid}#sfr .fr.fin.ok i{background:#3ddc84;color:#062}
#sfr .fr b{position:absolute;left:14px;top:-12px;max-width:220px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;background:#ff2b2b;color:#fff;font:600 11px Inter;padding:2px 7px;border-radius:5px}
#sfr .fr.ok b{display:none}#sfr .fr b{display:none}
#sfr .tip{position:fixed;max-width:270px;background:#2a0d0d;border:2px solid #ff2b2b;color:#fff;border-radius:10px;padding:8px 10px;font:500 12.5px/1.4 Inter;box-shadow:0 8px 26px #000c;z-index:19}
#sfr .tip .h{display:flex;align-items:center;gap:6px;font:700 13px 'Barlow Condensed';letter-spacing:.05em;margin-bottom:3px}#sfr .tip .h span{background:#ff2b2b;border-radius:9px;padding:1px 7px;font:700 11px 'JetBrains Mono'}
#sfr .tip small{display:block;color:#ffb7b7;margin-top:3px}#sfr .tip:after{content:'';position:absolute;left:var(--ax,20px);width:12px;height:12px;background:#2a0d0d;transform:rotate(45deg)}
#sfr .tip.up:after{bottom:-8px;border-right:2px solid #ff2b2b;border-bottom:2px solid #ff2b2b}#sfr .tip.dn:after{top:-8px;border-left:2px solid #ff2b2b;border-top:2px solid #ff2b2b}
#sfr .tip.fin{border-color:var(--am);background:#1f1606}#sfr .tip.fin:after{background:#1f1606;border-color:var(--am)}#sfr .tip.fin .h span{background:var(--am);color:#111}
@keyframes frp{0%,100%{box-shadow:0 0 0 2px #0008,0 0 6px #ff2b2b66}50%{box-shadow:0 0 0 2px #0008,0 0 22px #ff2b2b}}
#abub{z-index:26}#abub.cmp .subs{display:none!important}
.pt-num{display:inline-grid;place-items:center;min-width:22px;height:22px;padding:0 4px;border-radius:11px;background:#ff2b2b;color:#fff;font:700 12px 'JetBrains Mono';margin-right:6px;flex:0 0 auto}
.pt-num.ok{background:#2a8c4a}.pt-num.fin{background:#3a2a0a;color:var(--am);border:1px dashed var(--am)}.pt-num.fin.ok{background:#3ddc84;color:#062;border:0}
#abub .subs{list-style:none;padding:0;margin:8px 0}#abub .subs li{display:flex;align-items:flex-start;gap:4px;padding:5px 6px;border-radius:7px;margin:3px 0;border:1px solid transparent}
#abub .subs li.cur{border-color:#ff2b2b;background:#2a0d0d}#abub .subs li.ok{opacity:.7}#abub .subs li small{display:block;color:var(--mut);font-size:11.5px}#abub .subs li em{display:block;font-style:normal;color:#ffd0d0;font-size:12px;margin-top:2px}
#abub .crumb{font:600 10.5px 'Barlow Condensed';letter-spacing:.08em;text-transform:uppercase;color:var(--mut);margin:0 0 6px;line-height:1.5}#abub .crumb b{color:#fff}`;
document.head.appendChild(css);
const lay=document.createElement('div'); lay.id='sfr'; document.body.appendChild(lay);
let opened={ovh:false,ped:false};
function visible(el){ if(!el) return null; const t=el.closest('.sw')||el; if(t.offsetParent===null&&getComputedStyle(t).position!=='fixed') return null; const r=t.getBoundingClientRect(); if(r.width<2||r.height<2) return null;
  // hors de la zone visible de son panneau défilant ?
  const sc=t.closest('#ovh,#ped'); if(sc){ const q=sc.getBoundingClientRect(); if(r.bottom<q.top||r.top>q.bottom) return null; } return r; }
function ensurePanels(subs,cur){ // ouvrir le panneau de la sous-étape courante, refermer celui qu'on avait ouvert s'il ne sert plus
  const need={ovh:subs.some(s=>!s.ok&&s.sel&&s.sel.startsWith('[data-sw')),ped:subs.some(s=>!s.ok&&s.sel&&s.sel.startsWith('[data-pd'))};
  const want=cur&&cur.sel?(cur.sel.startsWith('[data-sw')?'ovh':cur.sel.startsWith('[data-pd')?'ped':null):null;
  if(want==='ovh'&&$('ovh').hidden){ ovhPinned=true; $('ovh').hidden=false; $('b-ovh').classList.add('on'); try{ ovhSync(); }catch(e){} opened.ovh=true; }
  if(want==='ped'&&$('ped')&&$('ped').hidden){ $('ped').hidden=false; $('b-ped').classList.add('on'); opened.ped=true; }
  if(want==='ped'&&opened.ovh&&!$('ovh').hidden&&innerWidth<900){ $('ovh').hidden=true; ovhPinned=false; $('b-ovh').classList.remove('on'); opened.ovh=false; }
  if(want==='ovh'&&opened.ped&&$('ped')&&!$('ped').hidden&&innerWidth<900){ $('ped').hidden=true; $('b-ped').classList.remove('on'); opened.ped=false; }
  if(!need.ovh&&opened.ovh){ $('ovh').hidden=true; ovhPinned=false; $('b-ovh').classList.remove('on'); opened.ovh=false; }
  if(!need.ped&&opened.ped&&$('ped')){ $('ped').hidden=true; $('b-ped').classList.remove('on'); opened.ped=false; }
  if(cur&&cur.sel){ const el=document.querySelector(cur.sel); const t=el&&(el.closest('.sw')||el); if(t&&t!==PT._sc){ PT._sc=t; try{ t.scrollIntoView({block:'center',inline:'nearest'}); }catch(e){} } } }
let frames=[];
function draw(){ const on=AUTO.on&&GD.on&&!paused&&$('menu').hidden&&!(document.getElementById('brief')&&!$('brief').hidden)&&view!=='walk';
  if(!on){ lay.innerHTML=''; frames=[]; if(!AUTO.on){ if(opened.ovh){ opened.ovh=false; } if(opened.ped){ opened.ped=false; } } return; }
  const st=GD.steps[GD.i]; if(!st) return; const subs=PT.subs(st), cur=PT.current(subs); ensurePanels(subs,cur);
  const shown=(r,ok,all)=>{ const pts=[[0.5,0.5],[0.25,0.3],[0.75,0.7]]; return pts[all?'every':'some'](([fx,fy])=>{ const x=r.left+r.width*fx, y=r.top+r.height*fy; if(x<0||y<0||x>innerWidth||y>innerHeight) return false; const h=document.elementFromPoint(x,y); return h&&ok(h); }); };   // pas de cadre sur une commande ou un écran caché par un panneau
  { const ab=$('abub'); const rc=cur.sel?visible(document.querySelector(cur.sel)):cur.scr?PT.scrRect(cur.scr):null; if(ab&&rc&&ab.classList.contains('cmp')) ab.classList.toggle('tp',rc.top+rc.height/2>innerHeight*0.5); }
  const want=[]; subs.forEach(s=>{ let r=null;
    if(s.sel){ const el=document.querySelector(s.sel); r=visible(el); const t=el&&(el.closest('.sw')||el); if(r&&!shown(r,h=>t.contains(h)||h.contains(t))) r=null; }
    else if(s.scr){ r=PT.scrRect(s.scr); if(r&&!shown(r,h=>h.id==='ckc',true)) r=null; }
    if(r) want.push({s,r}); });
  // plusieurs sous-étapes sur le même écran : on regroupe les numéros sur un seul cadre
  const groups=[]; want.forEach(w=>{ const g=groups.find(x=>Math.abs(x.r.left-w.r.left)<2&&Math.abs(x.r.top-w.r.top)<2&&Math.abs(x.r.width-w.r.width)<2); if(g) g.list.push(w.s); else groups.push({r:w.r,list:[w.s]}); });
  while(frames.length<groups.length){ const d=document.createElement('div'); d.className='fr'; d.innerHTML='<i></i><b></b>'; lay.appendChild(d); frames.push(d); }
  while(frames.length>groups.length){ frames.pop().remove(); }
  groups.forEach((g,k)=>{ const d=frames[k], p=4, isCur=g.list.includes(cur), ok=g.list.every(s=>s.ok), fin=g.list.some(s=>s.final);
    Object.assign(d.style,{left:(g.r.left-p)+'px',top:(g.r.top-p)+'px',width:(g.r.width+2*p)+'px',height:(g.r.height+2*p)+'px'});
    d.className='fr'+(isCur?' cur':'')+(ok?' ok':'')+(fin?' fin':'');
    const N=subs.length; d.querySelector('i').textContent=g.list.map(s=>s.final?'✓ '+s.n+'/'+N:s.n+'/'+N).join(' · ');
    const lab=isCur?cur:g.list.find(s=>!s.ok)||g.list[0]; d.querySelector('b').textContent=(lab.final?'Vérifier : ':'')+lab.l.replace(/^Résultat : /,''); }); tip(groups,subs,cur);
  const ab=$('abub'), gc=groups.find(x=>x.list.includes(cur)); if(ab&&gc&&ab.classList.contains('cmp')) ab.classList.toggle('tp',gc.r.top+gc.r.height/2>innerHeight*0.5); }
const SCRH={pfd:'Regardez l\'horizon artificiel (assiette), la bande de vitesse à gauche, l\'altitude à droite, le vario.',nd:'Regardez la route (trait), votre avion (triangle), la distance et le cap.',
  ewd:'Regardez les moteurs : N1, EGT (température), N2 ; les volets et les messages en bas.',sd:'Regardez la page système : batteries, générateurs, APU, carburant.',panel:'Regardez les instruments de la planche de bord.'};
function tip(groups,subs,cur){ let t=lay.querySelector('.tip'); const st=GD.steps[GD.i], g=groups.find(x=>x.list.includes(cur));
  if(!g){ if(t) t.remove(); return; } if(!t){ t=document.createElement('div'); t.className='tip'; lay.appendChild(t); }
  const N=subs.length, sc=cur.scr||(cur.final?PT.result(st).scr:null);
  t.className='tip'+(cur.final?' fin':''); t.innerHTML=`<div class="h"><span>${cur.final?'✓ ':''}${cur.n}/${N}</span>${cur.final?'SOUS-ÉTAPE FINALE':'SOUS-ÉTAPE'}</div><b>${cur.final?PT.result(st).t:cur.l}</b>${cur.help?`<small>${cur.help}</small>`:''}${!cur.sel&&sc?`<small>${SCRH[sc]||''}</small>`:''}${cur.where?`<small>📍 ${cur.where}</small>`:''}`;
  const r=g.r, W=t.offsetWidth, H=t.offsetHeight, up=r.top>H+24; const x=Math.min(innerWidth-W-6,Math.max(6,r.left+r.width/2-W/2));
  t.style.left=x+'px'; t.style.top=(up?r.top-H-16:Math.min(innerHeight-H-6,r.top+r.height+16))+'px'; t.classList.add(up?'up':'dn'); t.style.setProperty('--ax',Math.max(10,Math.min(W-24,r.left+r.width/2-x-6))+'px'); }
PT._tip=tip;
setInterval(()=>{ try{ draw(); }catch(e){ console.warn('cadres',e); } },150);
addEventListener('resize',()=>{ try{ draw(); }catch(e){} });
/* liste numérotée pour la bulle : mêmes numéros que les cadres */
PT.subsHTML=function(st){ const subs=PT.subs(st), cur=PT.current(subs);
  return `<ul class="subs">${subs.map(s=>`<li class="${s===cur&&!s.ok?'cur':''} ${s.ok?'ok':''}"><span class="pt-num ${s.ok?'ok':''} ${s.final?'fin':''}">${s.final?'✓ ':''}${s.n}/${subs.length}</span><span>${s.final?'<b>Sous-étape finale — '+s.l+'</b>':s.l}${s.where?`<small>📍 ${s.where}</small>`:''}${s===cur&&s.help?`<em>${s.help}</em>`:''}</span></li>`).join('')}</ul>`; };
PT.crumb=function(st,i){ const p=PT.partOf(i), subs=PT.subs(st), cur=PT.current(subs);
  return `<div class="crumb">${PT.theme()} › <b>${p.k}. ${p.n}</b> › Étape ${i} › <b>sous-étape ${(cur.final?'finale ':'')+cur.n+' / '+subs.length}</b></div>`; };
})();
/* V7.7 — repoussage (pushback) compréhensible : pendant que le tracteur pousse l'avion en arrière, la bulle l'explique
   (on voit le terminal s'éloigner, la piste est derrière : c'est normal) et, en mode automatique, le temps est accéléré ×4
   pour arriver vite au roulage vers l'avant, piste devant soi. */
(function(){ let boosted=false;
  setInterval(()=>{ try{ const pushing=GD.on&&TX.auto&&TX.pushMsg&&S.onGround&&S.V<-0.05;
    if(pushing&&AUTO.on&&rate===1&&!boosted){ setRate(4); boosted=true; }
    if(!pushing&&boosted){ if(rate===4) setRate(1); boosted=false; }
    if(pushing&&!PT._pushSaid){ PT._pushSaid=true; subtitle('🚜 Repoussage (pushback)','Un tracteur pousse l\'avion EN ARRIÈRE pour le sortir du poste : un avion de ligne ne recule pas seul. Vous voyez le terminal s\'éloigner, la piste est derrière vous : c\'est normal. Ensuite le tracteur se détache et l\'avion roule vers l\'AVANT, la piste devant vous.'); }
    if(!TX.auto) PT._pushSaid=false; }catch(e){} },300); })();
/* V7.7 — fin du repoussage : le tracteur oriente l'avion dans l'axe de la voie AVANT de le lâcher. Avant ce correctif,
   l'avion finissait le pushback le nez à l'opposé de la voie à suivre (jusqu'à 160° d'écart) et commençait à rouler avec
   la voie… derrière lui. Maintenant : arrêt, rotation par le tracteur jusqu'au cap de la voie, puis roulage vers l'avant. */
(function(){ const _ta=taxiAuto; let lastR=null, aligned=false;
  taxiAuto=function(dt){ const R=TX.route; if(R!==lastR){ lastR=R; aligned=false; }
    if(!TX.auto||!R||!S.onGround||aligned||R.kind!=='out'||!TX.pushMsg) return _ta(dt);
    const C=R.code, P=R.path, i=TX.idx; const arc=arcOf(C,P[i],P[Math.min(i+1,P.length-1)]), push=arc&&arc[3]&&i<P.length-2;
    if(push||S.V<-0.05||i>=P.length-1) return _ta(dt);
    const q=enOf(C,P[i+1],S.lat,S.lon), want=Math.atan2(q[0],q[1]), err=wrapPi(want-S.psi);
    if(Math.abs(err)<0.12){ aligned=true; return _ta(dt); }
    if(!TX.turnMsg){ TX.turnMsg=true; flash('Le tracteur oriente l\'avion dans l\'axe de la voie','am'); }
    S.V=0; S.thr=0; S.psi=wrapPi(S.psi+Math.sign(err)*Math.min(Math.abs(err),0.22*dt)); return true; }; })();
