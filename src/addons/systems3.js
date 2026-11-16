/* ===== ATELIER (3) : feuille d'équipage, parcours complet vu de dessus (aéroport → vol → arrivée), pannes, dialogues =====
   Phraséologie OACI en anglais (avec traduction), annonces et échanges d'équipage en français. Noms et vol fictifs. */
(function(){
if(!window.SYSAT) return;
const MOD=SYSAT.MOD, mv=(...a)=>SYSAT.moveActor(...a);
/* ---------- feuille d'équipage et manifeste ---------- */
const DEF={vol:'AT 123',imm:'F-HTRJ',dep:'KJFK',arr:'LFPG',cdb:'Claire Martin',opl:'Thomas Leroy',cc:'Sarah Benali',pnc2:'Hugo Petit',g2:'Steward',pnc3:'Léa Moreau',g3:'Hôtesse',pnc4:'Inès Faure',g4:'Hôtesse',meca:'Marc Dubois',pax:132,paxl:'DURAND Paul · 3A\nNGUYEN Linh · 3B\nMARTINS Ana · 12C\nKOWALSKI Jan · 18F'};
// une feuille d'équipage et une liste de passagers PAR APPAREIL (sièges conformes à sa cabine)
const KEYOF=x=>typeof x==='string'?x:x===6?'lj60':x===5?'h125':x===12?'s76':x===3?'r44':'a320';
const PERAC={ a320:{vol:'AT 123',imm:'F-HTRJ',dep:'KJFK',arr:'LFPG',pax:132}, lj60:{vol:'AT 60',imm:'F-HTLJ',dep:'KJFK',arr:'LFPG',pax:4,cc:'',pnc2:'',pnc3:'',pnc4:''},
  h125:{vol:'AT 125',imm:'F-HTEC',dep:'KJRB',arr:'JFKH',pax:4,opl:'',cc:'',pnc2:'',pnc3:'',pnc4:''}, s76:{vol:'AT 76',imm:'F-HTSK',dep:'KJRB',arr:'JFKH',pax:10,cc:'',pnc2:'',pnc3:'',pnc4:''},
  r44:{vol:'AT 44',imm:'F-HTRB',dep:'KJRB',arr:'JFKH',pax:2,opl:'',cc:'',pnc2:'',pnc3:'',pnc4:''} };
let CKEY='a320';
function defFor(k){ const d=Object.assign({},DEF,PERAC[k]||{}); const lay=LAY(k); if(k!=='a320'){ const L=[]; fillPax(lay,L,d.pax); d.paxl=L.map(p=>p.n+' · '+p.s).join('\n'); } return d; }
// remet chaque passager sur un siège qui existe dans CETTE cabine et limite le nombre à la capacité
function sanitize(c,k){ const lay=LAY(k); c.pax=Math.max(0,Math.min(lay.all.length,+c.pax||0)); const L=(c.paxl||'').split('\n').map(l=>l.trim()).filter(Boolean).map(l=>{ const p=l.split(/\s*[·|;]\s*/); return {n:p[0],s:(p[1]||'').toUpperCase().replace(/\s/g,'')}; });
  const seen=new Set(); L.forEach(p=>{ if(!lay.all.includes(p.s)||seen.has(p.s)) p.s=''; else seen.add(p.s); }); const keep=L.slice(0,lay.all.length); fillPax(lay,keep,keep.length); c.paxl=keep.map(p=>p.n+(p.s?' · '+p.s:'')).join('\n'); return c; }
function useCrew(k){ k=KEYOF(k); CKEY=k; let saved={}; try{ saved=JSON.parse(localStorage.getItem('sa-crew-'+k)||(k==='a320'?localStorage.getItem('sa-crew'):null)||'{}'); }catch(e){}
  CREW=sanitize(Object.assign(defFor(k),saved),k); return CREW; }
let CREW=Object.assign({},DEF);
const last=n=>String(n||'').trim().split(/\s+/).pop();
const css=document.createElement('style'); css.textContent=`#sacrew{position:fixed;inset:0;z-index:80;background:#000c;display:flex;align-items:flex-start;justify-content:center;overflow:auto;padding:12px}
#sacrew .w{width:min(760px,100%);margin:auto 0;background:#f4f1e8;color:#14181c;border-radius:6px;box-shadow:0 10px 40px #000;font:14px/1.4 'Inter',sans-serif}
#sacrew .hd{background:#14181c;color:#fff;padding:10px 14px;display:flex;justify-content:space-between;align-items:center;border-radius:6px 6px 0 0}#sacrew .hd b{font:700 19px 'Barlow Condensed',sans-serif;letter-spacing:.08em}#sacrew .hd small{color:#9fb3c4;font:600 11px 'JetBrains Mono',monospace}
#sacrew .bd{padding:12px 14px}#sacrew h4{margin:12px 0 6px;font:700 13px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#7a2a6f;border-bottom:2px solid #14181c;padding-bottom:3px}
#sacrew .g{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(200px,100%),1fr));gap:8px}#sacrew label{display:flex;flex-direction:column;font:700 10.5px 'JetBrains Mono',monospace;letter-spacing:.06em;color:#4a5560;text-transform:uppercase;gap:3px}
#sacrew input,#sacrew select,#sacrew textarea{font:15px 'Inter',sans-serif;padding:6px 8px;border:1px solid #9aa4ae;border-radius:3px;background:#fff;color:#14181c;text-transform:none;letter-spacing:0}
#sacrew textarea{min-height:76px;font:13px 'JetBrains Mono',monospace}#sacrew .ft{display:flex;gap:8px;justify-content:flex-end;padding:10px 14px;border-top:1px solid #c9c2b0;flex-wrap:wrap}
#sacrew button{border-radius:6px;padding:9px 14px;font:700 14px 'Barlow Condensed',sans-serif;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;border:1px solid #14181c;background:#fff;color:#14181c}#sacrew .go{background:#1f8a4c;color:#fff;border-color:#1f8a4c}
#sacrew .note{font-size:12px;color:#5a646e;margin:6px 0 0}
#sacrew .addp{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(120px,100%),1fr));gap:6px;margin-top:6px}#sacrew .addp>*{min-width:0}#sacrew .addp button,#sacrew .paxb button{padding:6px 10px;font-size:13px}
#sacrew .paxb{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-top:6px}#sacrew .paxb span{font:600 12px 'JetBrains Mono',monospace;color:#4a5560}
#seatmap{position:fixed;inset:0;z-index:86;background:#071019;display:flex;flex-direction:column;align-items:center;overflow:auto;padding:10px;color:#e8eef2;font:13px 'Inter',sans-serif}
#seatmap .sh{width:min(560px,100%);display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:6px}#seatmap .sh b{font:700 18px 'Barlow Condensed',sans-serif;letter-spacing:.06em}
#seatmap button{background:#132232;color:#fff;border:1px solid #2b3d50;border-radius:8px;padding:7px 12px;font:700 13px 'Barlow Condensed',sans-serif;letter-spacing:.05em;text-transform:uppercase;cursor:pointer}
#seatmap .lg{width:min(560px,100%);display:flex;gap:10px;flex-wrap:wrap;font-size:12px;color:#9fb3c4;margin-bottom:6px}#seatmap .lg i{display:inline-block;width:12px;height:12px;border-radius:3px;vertical-align:-2px;margin-right:4px}
#seatmap .info{width:min(560px,100%);min-height:20px;background:#0d1b28;border:1px solid #1d2f40;border-radius:8px;padding:6px 10px;margin-bottom:6px}
#seatmap svg{max-width:min(560px,100%);height:auto}#seatmap .seat{cursor:pointer}`; document.head.appendChild(css);
function form(cb,small){ useCrew(small); let m=document.getElementById('sacrew'); if(m) m.remove(); m=document.createElement('div'); m.id='sacrew'; const v=CREW;
 const f=(k,l,t='text',ex='')=>`<label>${l}<input name="${k}" type="${t}" value="${String(v[k]??'').replace(/"/g,'&quot;')}" ${ex}></label>`, g=(k)=>`<select name="${k}">${['Hôtesse','Steward'].map(o=>`<option ${v[k]===o?'selected':''}>${o}</option>`).join('')}</select>`;
 m.innerHTML=`<div class="w"><div class="hd"><b>FEUILLE D'ÉQUIPAGE · MANIFESTE · ${({a320:'A320',lj60:'LEARJET 60',h125:'H125',s76:'S-76',r44:'R44'})[CKEY]}</b><small>GENERAL DECLARATION / CREW LIST</small></div><div class="bd">
  <h4>Vol</h4><div class="g">${f('vol','N° de vol')}${f('imm','Immatriculation')}${f('dep','Départ (OACI)')}${f('arr','Arrivée (OACI)')}</div>
  <h4>Équipage technique</h4><div class="g">${f('cdb','Commandant de bord (CDB)')}${['h125','r44'].includes(CKEY)?'':f('opl',CKEY==='a320'?'Officier pilote de ligne (OPL)':'Copilote')}${f('meca','Mécanicien sol')}</div>
  ${small?'':`<h4>Équipage de cabine (PNC)</h4><div class="g">${f('cc','Chef de cabine')}<label>PNC 2 ${g('g2')}<input name="pnc2" value="${v.pnc2}"></label><label>PNC 3 ${g('g3')}<input name="pnc3" value="${v.pnc3}"></label><label>PNC 4 ${g('g4')}<input name="pnc4" value="${v.pnc4}"></label></div>`}
  <h4>Passagers</h4><div class="g">${f('pax','Nombre de passagers','number',`min="0" max="${small?small:180}"`)}</div><label style="margin-top:8px">Liste nominative (NOM Prénom · siège)<textarea name="paxl" style="min-height:120px">${v.paxl}</textarea></label>
  <div class="addp"><input data-ln placeholder="NOM" aria-label="Nom"><input data-fn placeholder="Prénom" aria-label="Prénom"><select data-se aria-label="Siège"></select><button type="button" data-add>➕ Ajouter</button></div>
  <div class="paxb"><button type="button" data-fill>👥 Compléter tous les passagers</button><button type="button" data-seat>🪑 Sièges (vue du dessus)</button><span data-cnt></span></div>
  <p class="note">Comme la « General Declaration » remise aux autorités : équipage, nombre et liste des passagers. Les noms sont fictifs et modifiables ; ils sont repris par les personnages du schéma et dans les dialogues.</p></div>
  <div class="ft"><button type="button" data-r>Valeurs par défaut</button><button type="button" data-x>Annuler</button><button type="button" class="go" data-ok>✓ Valider et présenter l'équipage</button></div></div>`;
 document.body.appendChild(m); paxUI(m,small); m.querySelector('[name=paxl]').addEventListener('input',()=>paxUI(m,small)); m.querySelector('[name=pax]').addEventListener('input',()=>paxUI(m,small));
 m.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b) return; if(b.dataset.x!=null) m.remove(); if(b.dataset.r!=null){ try{ localStorage.removeItem('sa-crew-'+CKEY); if(CKEY==='a320') localStorage.removeItem('sa-crew'); }catch(e){} m.remove(); form(cb,small); }
  if(b.dataset.add!=null){ const ln=m.querySelector('[data-ln]'), fn=m.querySelector('[data-fn]'), se=m.querySelector('[data-se]'); const nom=(ln.value||'').trim().toUpperCase(), pre=(fn.value||'').trim(); if(!nom){ ln.focus(); return; }
    const L=paxParse(m), seat=se.value||freeSeats(LAY(small),L)[0]||''; L.push({n:(nom+' '+pre).trim(),s:seat}); paxWrite(m,L); ln.value=''; fn.value=''; paxUI(m,small); return; }
  if(b.dataset.fill!=null){ const L=paxParse(m), n=Math.max(+m.querySelector('[name=pax]').value||0,L.length); fillPax(LAY(small),L,n); paxWrite(m,L); paxUI(m,small); return; }
  if(b.dataset.seat!=null){ seatMap(m,small); return; }
  if(b.dataset.ok!=null){ m.querySelectorAll('[name]').forEach(i=>{ CREW[i.name]=i.type==='number'?Math.max(0,Math.min(+i.max||180,+i.value||0)):i.value; }); sanitize(CREW,CKEY); try{ localStorage.setItem('sa-crew-'+CKEY,JSON.stringify(CREW)); }catch(e){} m.remove(); cb(); } }); }

/* ---------- plan de cabine : dispositions types, liste nominative, vue du dessus des sièges ---------- */
// dispositions [cabine, rangs, groupes de lettres de part et d'autre des couloirs] ; rangées d'issues de secours
function LAY(small){ const k=small==null?CKEY:KEYOF(small);
  const R=(c,a,b,g,ex)=>{ const o=[]; for(let r=a;r<=b;r++) o.push({r,c,g,ex:(ex||[]).includes(r)}); return o; };
  const L={ a320:{n:'A320 · 180 sièges (30 rangs, 3-3) · issues au-dessus de l\'aile rangs 11-12',rows:R('Y',1,30,[['A','B','C'],['D','E','F']],[11,12])},
    b777:{n:'777-300ER · 442 sièges type Air Austral (18 J · 40 W · 384 Y)',rows:[...R('J',1,3,[['A','C'],['D','G'],['H','K']]),...R('W',6,10,[['A','C'],['D','E','F','G'],['H','K']]),...R('Y',20,57,[['A','B','C'],['D','E','F','G'],['H','J','K']],[20,33,47]),{r:58,c:'Y',g:[[],['D','E','F','G'],[]]}]},
    lj60:{n:'Learjet 60 · 6 sièges club',rows:R('C',1,3,[['A'],['C']])}, h125:{n:'H125 · 5 passagers (1 avant gauche, banquette arrière 4)',rows:[{r:1,c:'P',g:[['A'],[]]},{r:2,c:'P',g:[['A','B'],['C','D']]}]},
    s76:{n:'S-76 · 12 passagers (3 rangs, 2-2)',rows:R('P',1,3,[['A','B'],['C','D']])}, r44:{n:'R44 · 3 passagers (avant gauche, arrière 2)',rows:[{r:1,c:'P',g:[['A'],[]]},{r:2,c:'P',g:[['A'],['B']]}]} };
  const o=L[k]; o.k=k; o.all=[]; o.rows.forEach(r=>r.g.flat().forEach(l=>o.all.push(r.r+l))); return o; }
function paxParse(m){ return (m.querySelector('[name=paxl]').value||'').split('\n').map(l=>l.trim()).filter(Boolean).map(l=>{ const p=l.split(/\s*[·|;]\s*/); return {n:p[0],s:(p[1]||'').toUpperCase().replace(/\s/g,'')}; }); }
function paxWrite(m,L){ m.querySelector('[name=paxl]').value=L.map(p=>p.n+(p.s?' · '+p.s:'')).join('\n'); }
function freeSeats(lay,L){ const used=new Set(L.map(p=>p.s)); return lay.all.filter(s=>!used.has(s)); }
const NOMS=['MARTIN','BERNARD','THOMAS','PETIT','ROBERT','RICHARD','DURAND','DUBOIS','MOREAU','LAURENT','SIMON','MICHEL','LEFEBVRE','LEROY','ROUX','DAVID','BERTRAND','MOREL','FOURNIER','GIRARD','BONNET','DUPONT','LAMBERT','FONTAINE','ROUSSEAU','VINCENT','MULLER','LEFEVRE','FAURE','ANDRE','MERCIER','BLANC','GUERIN','BOYER','GARNIER','CHEVALIER','FRANCOIS','LEGRAND','GAUTHIER','GARCIA','PERRIN','ROBIN','CLEMENT','MORIN','NICOLAS','HENRY','ROUSSEL','MATHIEU','GAUTIER','MASSON','NGUYEN','DIALLO','SILVA','ROSSI','SCHMIDT','KOWALSKI','HOARAU','PAYET','GRONDIN','FONTAINE','RIVIERE','TECHER','BOYER','LEBON','MAILLOT','SMITH','JOHNSON','TANAKA','KHAN','COHEN'];
const PRENOMS=['Paul','Linh','Ana','Jan','Emma','Lucas','Chloé','Hugo','Léa','Louis','Manon','Nathan','Camille','Jules','Sarah','Gabriel','Inès','Arthur','Jade','Adam','Louise','Raphaël','Lina','Mathis','Zoé','Noah','Alice','Ethan','Lola','Tom','Mila','Théo','Rose','Sacha','Nina','Malik','Yasmine','Karim','Aïcha','Kenji','Sofia','Marco','Olga','Pedro','Fatou','Mamadou','Priya','Ravi','Mei','David','Julie','Claire','Pierre','Marie','Jean','Anne','Michel','Sophie','Nicolas','Isabelle'];
function fillPax(lay,L,n){ n=Math.min(n,lay.all.length); const taken=new Set(L.map(p=>p.n)), free=freeSeats(lay,L); let seed=L.length*7919+n*31; const rnd=()=>{ seed=(seed*16807)%2147483647; return seed/2147483647; };
  for(let i=free.length-1;i>0;i--){ const j=Math.floor(rnd()*(i+1)); [free[i],free[j]]=[free[j],free[i]]; }
  // les passagers déjà listés sans siège reçoivent un siège libre
  L.forEach(p=>{ if(!p.s||!lay.all.includes(p.s)) p.s=free.shift()||''; });
  let guard=0; while(L.length<n&&free.length&&guard++<5000){ const nm=NOMS[Math.floor(rnd()*NOMS.length)]+' '+PRENOMS[Math.floor(rnd()*PRENOMS.length)]; if(taken.has(nm)) continue; taken.add(nm); L.push({n:nm,s:free.shift()}); } }
function paxUI(m,small){ const lay=LAY(small), L=paxParse(m), se=m.querySelector('[data-se]'), fr=freeSeats(lay,L), cap=lay.all.length, px=m.querySelector('[name=pax]');
  px.max=cap; if(+px.value>cap) px.value=cap;
  if(se){ const cur=se.value; se.innerHTML=fr.slice(0,600).map(s=>`<option ${s===cur?'selected':''}>${s}</option>`).join(''); }
  const c=m.querySelector('[data-cnt]'); if(c) c.textContent=`${L.length} nommé(s) / ${px.value||0} passagers · ${cap} sièges · ${fr.length} libres`; }
function seatMap(m,small){ const lay=LAY(small); let L=paxParse(m), sel=null; let w=document.getElementById('seatmap'); if(w) w.remove(); w=document.createElement('div'); w.id='seatmap'; document.body.appendChild(w);
  const draw=()=>{ const by={}; L.forEach((p,i)=>{ if(p.s) by[p.s]=i; }); const S=16, gap=3, aisle=14, maxW=Math.max(...lay.rows.map(r=>r.g.reduce((a,g)=>a+g.length*(S+gap),0)+(r.g.length-1)*aisle));
    const W=maxW+70, top=90; let y=top, cells=''; const col={J:'#7a2a6f',W:'#2f6db3',Y:'#3a4656',C:'#3a4656',P:'#3a4656'}; let lastC='';
    lay.rows.forEach(r=>{ if(r.c!==lastC){ y+=lastC?14:4; cells+=`<text x="${W/2}" y="${y}" text-anchor="middle" fill="#9fb3c4" font-size="9" letter-spacing="1.5" font-family="JetBrains Mono">${{J:'CLASSE AFFAIRES',W:'PREMIUM ÉCO',Y:'ÉCONOMIQUE',C:'CABINE',P:'CABINE'}[r.c]}</text>`; y+=6; lastC=r.c; }
      const rw=r.g.reduce((a,g)=>a+g.length*(S+gap),0)+(r.g.length-1)*aisle; let x=(W-rw)/2+16;
      cells+=`<text x="${(W-rw)/2-4}" y="${y+12}" fill="#9fb3c4" font-size="9" text-anchor="end" font-family="JetBrains Mono">${r.r}</text>`;
      if(r.ex) cells+=`<text x="${W-14}" y="${y+12}" fill="#ffd166" font-size="9" font-family="JetBrains Mono">⇆</text>`;
      r.g.forEach((g,gi)=>{ g.forEach(l=>{ const id=r.r+l, i=by[id], occ=i!=null, me=sel===id; cells+=`<g class="seat" data-s="${id}"><rect x="${x}" y="${y}" width="${S}" height="${S}" rx="4" fill="${me?'#ffe14a':occ?'#3ddc84':col[r.c]}" stroke="${r.ex?'#ffd166':'#0b141c'}" stroke-width="1.2"/><text x="${x+S/2}" y="${y+11.5}" text-anchor="middle" font-size="8.5" font-weight="700" fill="${occ||me?'#06210f':'#c9d4de'}" font-family="Inter">${occ?L[i].n.split(' ').map(t=>t[0]).join('').slice(0,2):l}</text></g>`; x+=S+gap; }); if(gi<r.g.length-1) x+=aisle-gap; });
      y+=S+gap+ (r.ex?4:0); });
    const H=y+70, fus=`<path d="M${W/2} 6 C ${W*0.86} 30, ${W-6} 70, ${W-6} ${top-10} L ${W-6} ${H-60} C ${W-6} ${H-25}, ${W*0.62} ${H-6}, ${W/2} ${H-4} C ${W*0.38} ${H-6}, 6 ${H-25}, 6 ${H-60} L 6 ${top-10} C 6 70, ${W*0.14} 30, ${W/2} 6 Z" fill="#0f1c28" stroke="#5f7a92" stroke-width="2"/>`;
    const ck=`<path d="M${W/2-24} 46 Q ${W/2} 30 ${W/2+24} 46" fill="none" stroke="#3fd0ff" stroke-width="3"/><text x="${W/2}" y="64" text-anchor="middle" fill="#9fb3c4" font-size="9" font-family="JetBrains Mono">POSTE · avant</text>`;
    const occN=L.filter(p=>p.s&&lay.all.includes(p.s)).length;
    w.innerHTML=`<div class="sh"><b>🪑 PLAN DE CABINE · VUE DU DESSUS</b><span><button type="button" data-fill>👥 Compléter</button> <button type="button" data-back>↩ Retour au document</button></span></div>
     <div class="lg"><span>${lay.n}</span><span><i style="background:#3ddc84"></i>occupé (${occN})</span><span><i style="background:#3a4656"></i>libre (${lay.all.length-occN})</span><span><i style="background:#ffe14a"></i>sélection</span><span style="color:#ffd166">⇆ rangée d'issue de secours</span></div>
     <div class="info">${sel?(by[sel]!=null?`Siège <b>${sel}</b> : ${L[by[sel]].n}. Touchez un siège libre pour le déplacer, ou de nouveau ce siège pour annuler.`:`Siège <b>${sel}</b> libre.`):'Touchez un siège : nom du passager ; puis un siège libre pour le déplacer.'}</div>
     <svg viewBox="0 0 ${W} ${H}" width="${W*1.5}">${fus}${ck}${cells}</svg>`;
    w.querySelector('[data-back]').onclick=()=>{ paxWrite(m,L); paxUI(m,small); w.remove(); };
    w.querySelector('[data-fill]').onclick=()=>{ const n=Math.max(+m.querySelector('[name=pax]').value||0,L.length); fillPax(lay,L,n); draw(); };
    w.querySelectorAll('.seat').forEach(g=>g.onclick=()=>{ const id=g.dataset.s, i=by[id];
      if(sel&&sel!==id&&by[sel]!=null&&i==null){ L[by[sel]].s=id; sel=null; draw(); return; }
      sel=sel===id?null:id; draw(); }); };
  draw(); }
try{ const _op=SYSAT.open; SYSAT.open=function(k){ try{ useCrew(k||'a320'); }catch(e){} return _op.apply(this,arguments); }; }catch(e){}
useCrew('a320');
/* ---------- outils de parcours ---------- */
const Q=(t,n,o)=>Object.assign({t,n},o||{});            // séquence (sans commande)
const K=(c,v,n,say,w,wt)=>({c,v,n,say,w,wt});            // commande
const A320ACT={cdb:{c:'#e04ad8',l:'CDB',foot:true},opl:{c:'#3fd0ff',l:'OPL',foot:true},cc:{c:'#f2f4f6',l:'CC',foot:true},pnc:{c:'#cfd8df',l:'PNC',foot:true,r:4},meca:{c:'#ffe14a',l:'MÉCA',foot:true},bus:{c:'#4a8bff',l:'Minibus équipage',sq:true,w:30,h:12,spd:55,veh:true},pbus:{c:'#4a8bff',l:'Bus passagers',sq:true,w:34,h:12,spd:55,veh:true},tug:{c:'#ffa21a',l:'Tracteur (pushback)',sq:true,w:20,h:12,spd:12,veh:true},gpuv:{c:'#9fb3c4',l:'GPU',sq:true,w:14,h:10},pax:{c:'#9fe8b8',l:'',r:2,spd:30},fire:{c:'#ff3b30',l:'Pompiers',sq:true,w:22,h:12,spd:60,veh:true}};
function crewNames(){ return {CDB:'CDB '+last(CREW.cdb),OPL:'OPL '+last(CREW.opl),CC:'CC '+last(CREW.cc),P2:(CREW.g2==='Steward'?'Stw ':'Hôt. ')+last(CREW.pnc2),P3:(CREW.g3==='Steward'?'Stw ':'Hôt. ')+last(CREW.pnc3),P4:(CREW.g4==='Steward'?'Stw ':'Hôt. ')+last(CREW.pnc4),ME:'Méca '+last(CREW.meca)}; }
// tous les passagers sont représentés à LEUR siège (manifeste), sinon à un siège libre attribué de façon reproductible
// A320 : 30 rangs × 6 sièges (ABC | DEF), allée au centre (x = 200), rang 1 à y = 150, pas de 10
const SX={A:183.5,B:188.5,C:193.5,D:206.5,E:211.5,F:216.5};
function seatOrder(lay){ const named=(CREW.paxl||'').split('\n').map(l=>((l.split(/\s*[·|;]\s*/)[1])||'').toUpperCase().replace(/\s/g,'')).filter(x=>lay.all.includes(x));
  const used=new Set(named), rest=lay.all.filter(x=>!used.has(x)); let seed=12345; const rnd=()=>{ seed=(seed*16807)%2147483647; return seed/2147483647; };
  for(let i=rest.length-1;i>0;i--){ const j=Math.floor(rnd()*(i+1)); [rest[i],rest[j]]=[rest[j],rest[i]]; } return named.concat(rest); }
function seats(n){ const lay=LAY('a320'); if(lay.k!=='a320'){ lay.all=[]; for(let r=1;r<=30;r++) for(const l of 'ABCDEF') lay.all.push(r+l); }
  return seatOrder(lay).slice(0,n).map(id=>{ const r=parseInt(id,10), l=id.replace(/^\d+/,''); return [SX[l]||200,150+(r-1)*10]; }); }
const NPAX=()=>Math.max(0,Math.min(180,Math.round(+CREW.pax||0)));
/* ---------- A320 : parcours complet ---------- */
function a320vol(){ const N=crewNames(), vol=CREW.vol, cs='Air Trajectoires '+String(vol).replace(/\D/g,'').split('').map(d=>['zero','one','two','three','four','five','six','seven','eight','niner'][d]).join(' '), np=NPAX(), SE=seats(np);
 const DOOR=[176,66], GATE=[70,60];
 const st=[
 Q('Présentation de l\'équipage',`${CREW.vol} ${CREW.dep} → ${CREW.arr} · ${CREW.imm} · ${CREW.pax} passagers. ${CREW.cdb} (CDB), ${CREW.opl} (OPL), ${CREW.cc} (chef de cabine), ${CREW.pnc2}, ${CREW.pnc3}, ${CREW.pnc4}.`,{ph:'Aéroport',fl:{env:'park',apt:CREW.dep},
  run:()=>{ [['cdb',N.CDB],['opl',N.OPL],['cc',N.CC],['pnc2',N.P2],['pnc3',N.P3],['pnc4',N.P4]].forEach(([id,l],i)=>mv(id,[],{at:[14,96+i*17],l})); mv('meca',[[246,120]],{at:[300,60],l:N.ME}); mv('gpuv',[],{at:[252,108]}); },
  say:[['CDB',`Bonjour à tous. Je suis ${CREW.cdb}, votre commandant. Vol ${CREW.vol} pour ${CREW.arr==='LFPG'?'Paris Charles-de-Gaulle':CREW.arr}, ${CREW.pax} passagers, environ sept heures de vol.`],['CDB',`${CREW.opl} sera pilote aux commandes à l'aller. Météo correcte, quelques turbulences prévues sur l'Atlantique.`],['CC',`Cabine : ${CREW.pnc2} et ${CREW.pnc3} à l'avant et au milieu, ${CREW.pnc4} à l'arrière. Rappel des issues et de l'équipement de secours fait.`]],d:3}),
 Q('Minibus vers l\'avion','L\'équipage monte dans le minibus qui le dépose au pied de l\'escalier avant gauche.',{run:()=>{ mv('bus',[[60,92],[150,92]],{at:[-40,92]}); ['cdb','opl','cc','pnc2','pnc3','pnc4'].forEach((id,i)=>mv(id,[[40,96+i*4],[60,92]])); },d:4}),
 Q('Montée à bord','Le copilote s\'installe au poste pour la préparation ; les PNC vont à leurs postes ; le commandant commence le tour avion.',{run:()=>{ ['cdb','opl','cc','pnc2','pnc3','pnc4'].forEach(id=>{ const a=SYSAT.S.act[id]; if(a){ a.x=150; a.y=92; } }); mv('opl',[DOOR,[204,40]]); mv('cc',[DOOR,[196,70]]); mv('pnc2',[DOOR,[200,90],[200,140]]); mv('pnc3',[DOOR,[200,300]]); mv('pnc4',[DOOR,[200,470]]); mv('cdb',[[170,72]]); mv('bus',[[300,92],[440,92]]); },d:3}),
 K('bat1',true,'Préparation cockpit : le copilote met les batteries.',[['OPL','Batteries : vingt-cinq virgule huit volts. Batterie un, ON.']]),K('bat2',true,'',[['OPL','Batterie deux, ON.']]),
 K('callMech',true,'Le copilote appelle le mécanicien au sol pour brancher le groupe de parc.',[['MECA','Oui cockpit, ici le sol.'],['OPL','Le groupe de parc est branché ?'],['MECA','Branché et disponible, vous pouvez le prendre.']]),
 K('ext',true,'',[['OPL','External power, ON.']]),K('ir1','NAV','Alignement des centrales inertielles.',[['OPL','ADIRS sur NAV, alignement en cours.']]),K('ir2','NAV',''),K('ir3','NAV',''),K('nav',true,''),
 Q('Tour avion : nez et sondes','Le commandant fait le tour dans le sens horaire : radôme, sondes Pitot, statiques et d\'incidence, pare-brise.',{ph:'Tour avion',mv:[['cdb',[[166,40],[184,8],[216,8],[234,40]]]],pt:['probe','wshield'],say:[['CDB','Sondes Pitot et d\'incidence : caches retirés, propres, pas de dommage.']]}),
 Q('Tour avion : train avant','Pneus, amortisseur, goupille de sécurité, phare de roulage.',{mv:[['cdb',[[232,120],[214,122],[232,126]]]],pt:['ngear','taxi'],say:[['CDB','Train avant : pneus bons, amortisseur sorti normalement, goupille retirée.']]}),
 Q('Tour avion : moteur 2','Entrée d\'air, aubes de soufflante, capots fermés, inverseur, pas de fuite.',{mv:[['cdb',[[232,205],[272,212],[290,226]]]],pt:['e2','e2fan','e2lip'],say:[['CDB','Moteur deux : soufflante libre, capots verrouillés, pas de fuite.']]}),
 Q('Tour avion : aile droite','Becs, saumon et feu vert, déchargeurs d\'électricité statique, aileron, volets.',{mv:[['cdb',[[372,312],[376,342],[300,334]]]],pt:['slatR','navR','ailR','flapR']}),
 Q('Tour avion : train principal droit','Pneus, freins carbone (indicateurs d\'usure), puits de train.',{mv:[['cdb',[[232,326],[226,318]]]],pt:['mgR','brk']}),
 Q('Tour avion : arrière et APU','Plan horizontal, gouvernes, dérive, APU (pas de fuite d\'huile), vanne de décharge.',{mv:[['cdb',[[230,470],[262,560],[205,600],[195,600],[138,560]]]],pt:['elevR','rud','apu','ofv','elevL'],say:[['CDB','Empennage et APU : rien à signaler.']]}),
 Q('Tour avion : côté gauche et moteur 1','Train principal gauche, aile gauche, feu rouge, moteur 1.',{mv:[['cdb',[[170,470],[174,326],[110,334],[24,342],[28,312],[110,226],[128,212]]]],pt:['mgL','ailL','navL','e1','e1fan']}),
 Q('Retour au poste','Le commandant remonte à bord et s\'installe en place gauche.',{mv:[['cdb',[[168,200],[168,80],DOOR,[196,40]]]],say:[['CDB','Tour avion terminé, aucune anomalie.'],['OPL','Préparation cockpit terminée, centrales alignées.']]}),
 K('ptt',true,'Demande de clairance au prévol (anglais, phraséologie OACI).',[['OPL',`Kennedy Clearance, ${cs}, Airbus A320 at gate seven, information Bravo, request IFR clearance to Paris Charles de Gaulle.`,'Demande de clairance IFR pour Paris.'],['CLR',`${cs}, cleared to Paris Charles de Gaulle as filed, Kennedy Five departure, climb and maintain five thousand, squawk two three four one.`,'Autorisé vers Paris comme déposé, départ Kennedy 5, montée 5000 ft, transpondeur 2341.'],['OPL',`Cleared to Paris as filed, Kennedy Five, climb five thousand, squawk two three four one, ${cs}.`,'Collationnement.'],['CLR',`${cs}, readback correct.`,'Collationnement correct.']]),
 Q('Embarquement des passagers',`${CREW.pax} passagers (points verts) arrivent de la porte 7 en bus et s'installent ; les PNC accueillent et aident au rangement des bagages.`,{ph:'Embarquement',fl:{env:'park',apt:CREW.dep},run:()=>{ mv('pbus',[[120,70]],{at:[-40,70]}); SE.forEach((p,i)=>mv('pax'+i,[[150,78],DOOR,[200,70],[200,p[1]],p],{at:[96-(i%12)*5,64+Math.floor(i/12)*4.5],spd:34+(i%5)*2})); },say:[['CC','Bonjour madame, bonjour monsieur, bienvenue à bord. Votre siège est dans l\'allée de gauche.'],['PAX','Merci ! Où puis-je mettre mon sac ?'],['CC','Dans le coffre au-dessus de vous, ou sous le siège devant vous.']],d:6,w:()=>Object.keys(SYSAT.S.act).filter(k=>k.startsWith('pax')).every(k=>!SYSAT.S.act[k].path.length)}),
 K('apuMaster',true,'Démarrage de l\'APU.',[['OPL','APU master switch, ON.']]),K('apuStart',true,'',[['OPL','APU start.']],s=>s.apuSt===2,'Attendre APU AVAIL'),K('apuBleed',true,'',[['OPL','APU AVAIL. APU bleed, ON.']]),
 Q('Portes fermées','Le chef de cabine annonce la fin de l\'embarquement ; le bus passagers repart.',{run:()=>{ mv('pbus',[[-60,70]]); },say:[['CC','Commandant, embarquement terminé, '+CREW.pax+' passagers, portes fermées.'],['CDB','Merci, portes fermées.']]}),
 K('pa',true,'Annonce du commandant aux passagers.',[['PA',`Mesdames et messieurs, bonjour, ici ${CREW.cdb}, votre commandant de bord. Nous allons quitter le parking pour Paris, temps de vol prévu sept heures.`],['PA','Personnel de cabine aux portes, armement des toboggans, vérification de la porte opposée.']]),
 K('belts',true,'Consigne ceintures allumée.',[['CC','Toboggans armés, porte opposée vérifiée.']]),K('beacon',true,'Feu anticollision : on prévient le sol que les moteurs vont démarrer.',[['OPL','Beacon, ON.']]),
 K('ext',false,'Le mécanicien débranche et retire le groupe de parc.',[['MECA','Groupe de parc débranché.']]),
 Q('Arrivée du tracteur','Le tracteur se place devant le train avant et s\'y accroche par la barre de tractage.',{run:()=>{ mv('gpuv',[[330,108]]); mv('tug',[[200,-4]],{at:[300,-30]}); mv('meca',[[214,110]]); },d:3}),
 K('ptt',true,'Demande de repoussage et de mise en route.',[['OPL',`Kennedy Ground, ${cs}, gate seven, request pushback and start up.`,'Demande repoussage et mise en route.'],['GND',`${cs}, pushback and start up approved, face west.`,'Repoussage et mise en route approuvés, nez vers l\'ouest.'],['OPL',`Pushback and start approved, face west, ${cs}.`,'Collationnement.']]),
 K('callMech',true,'Le commandant appelle le mécanicien à l\'interphone.',[['MECA','Cockpit, ici le sol.'],['CDB','Sol, freins de parc desserrés, prêts pour le repoussage, démarrage approuvé, nez à l\'ouest.'],['MECA','Repoussage en cours, vous pouvez démarrer.']]),
 K('pbrake',false,'Frein de parc desserré : le tracteur peut repousser.',[]),
 Q('Repoussage','Le tracteur pousse l\'avion en arrière (le sol défile) pendant la mise en route des moteurs.',{ph:'Mise en route',fl:{ias:3,tIas:3,dir:-1},d:2}),
 K('eMode','IGN','',[['CDB','Démarrage du moteur deux.'],['OPL','ENG MODE sur IGN/START.']]),
 K('m2',true,'',[['OPL','Master deux, ON.'],['CDB','Vanne de démarrage ouverte… N2 monte… allumage… débit carburant… l\'EGT monte.']],s=>s.es[1]===2,'Attendre le ralenti du moteur 2'),
 K('m1',true,'',[['CDB','Moteur deux stabilisé. Démarrage du moteur un.']],s=>s.es[0]===2,'Attendre le ralenti du moteur 1'),
 K('eMode','NORM','',[['CDB','Moteur un stabilisé.']]),K('apuBleed',false,''),K('apuMaster',false,''),
 Q('Fin du repoussage','Le tracteur s\'arrête et se décroche ; le mécanicien montre la goupille de la roulette de nez et salue.',{fl:{ias:0,tIas:0,dir:1},run:()=>{ mv('tug',[[300,-40]]); mv('meca',[[260,90],[330,60]]); },say:[['MECA','Repoussage terminé, frein de parc, s\'il vous plaît.'],['CDB','Frein de parc serré, vous pouvez déconnecter.'],['MECA','Déconnecté, goupille à gauche, bon vol !']],d:3}),
 K('flaps',1,'Volets 1 pour le décollage.',[['CDB','Volets un.'],['OPL','Volets un.']]),K('taxi','TAXI',''),
 K('ptt',true,'Autorisation de roulage.',[['OPL',`Kennedy Ground, ${cs}, ready to taxi.`,'Prêts à rouler.'],['GND',`${cs}, runway three one left, taxi via Bravo, hold short of three one left.`,'Piste 31 gauche, roulez via B, arrêt avant la 31 gauche.'],['OPL',`Runway three one left via Bravo, hold short, ${cs}.`,'Collationnement.']]),
 K('pbrake',false,''),
 Q('Roulage','L\'avion roule vers la piste à environ 15 nœuds (le taxiway défile sous l\'avion).',{ph:'Roulage',fl:{env:'taxi',tIas:15},run:()=>{ Object.keys(SYSAT.S.act).forEach(k=>{ if(['meca','tug','gpuv','bus','pbus'].includes(k)) mv(k,null,{hide:1}); }); },say:[['CDB','Contrôle des commandes de vol.'],['OPL','Check-list avant décollage terminée.']],d:5}),
 K('xpdr','AUTO','Transpondeur et TCAS actifs.'),K('strobe','ON',''),K('land',true,''),K('taxi','T.O',''),
 K('ptt',true,'Autorisation de décollage.',[['TWR',`${cs}, wind three zero zero at ten, runway three one left, cleared for take-off.`,'Vent 300° 10 nœuds, piste 31 gauche, autorisé au décollage.'],['OPL',`Cleared for take-off three one left, ${cs}.`,'Collationnement.']]),
 Q('Alignement','L\'avion s\'aligne sur la piste 31 gauche.',{ph:'Décollage',fl:{env:'rwy',tIas:0,ias:0},d:2}),
 K('thr','TOGA','Pleine poussée.',[['CDB','Décollage. Poussée TOGA.']]),
 Q('Course au décollage','La vitesse augmente : la piste défile de plus en plus vite.',{fl:{tIas:150,acc:4},w:s=>s.fl.ias>=148,say:[['OPL','Cent nœuds.'],['CDB','Vérifié.'],['OPL','V1… Rotation.']],d:3}),
 K('ground',false,'Rotation : l\'avion quitte le sol.',[]),
 Q('Montée initiale','',{ph:'Montée',fl:{env:'air',tAlt:1500,rate:350,tIas:165},say:[['OPL','Vario positif.'],['CDB','Train sur rentré.']],w:s=>s.fl.alt>400}),
 K('gear','UP','',[['OPL','Train rentré.']],s=>s.gp<0.01,'Attendre la rentrée du train'),K('thr','CL','Poussée de montée.',[['CDB','Climb.']]),K('flaps',0,'',[['CDB','Volets zéro.']]),
 K('ptt',true,'Changement de fréquence.',[['TWR',`${cs}, contact New York Departure, one three five decimal niner.`,'Contactez le départ de New York sur 135,9.'],['OPL',`New York Departure, ${cs}, passing two thousand climbing five thousand.`,'Passons 2000 ft en montée vers 5000.'],['DEP',`${cs}, radar contact, climb flight level two three zero.`,'Contact radar, montez au niveau 230.']]),
 Q('Montée vers la croisière','Montée vers le niveau 350 (35 000 ft). À 10 000 ft les phares sont rentrés.',{fl:{tAlt:10000,rate:1800,tIas:250},w:s=>s.fl.alt>=9900}),K('land',false,''),K('belts',false,'Consigne ceintures éteinte (pas de turbulence).',[['PA','Le commandant a éteint la consigne lumineuse : vous pouvez détacher votre ceinture. Nous vous recommandons de la garder attachée lorsque vous êtes assis.']]),
 Q('Croisière','Niveau 350, environ 450 nœuds de vitesse sol. Les PNC servent le repas.',{ph:'Croisière',fl:{tAlt:35000,rate:2400,tIas:280},w:s=>s.fl.alt>=34900,run:()=>{ mv('cc',[[200,140],[200,320],[200,140]]); mv('pnc4',[[200,470],[200,330],[200,470]]); },say:[['DEP',`${cs}, contact Gander Oceanic on HF, good day.`,'Contactez Gander Océanique en HF, bonne journée.'],['CDB','Croisière établie, niveau trois cinq zéro.']],d:4}),
 Q('Descente','Arrivée sur la France : descente vers Paris.',{ph:'Descente',fl:{tAlt:10000,rate:2200,tIas:250},w:s=>s.fl.alt<=10100,say:[['APP',`${cs}, Paris Control, descend flight level one hundred, expect ILS approach runway two six left.`,'Descendez au niveau 100, prévoir une approche ILS piste 26 gauche.']]}),
 K('belts',true,'',[['PA','Nous commençons notre descente vers Paris. Veuillez regagner votre siège et attacher votre ceinture.']]),K('land',true,''),
 Q('Approche','Interception de l\'ILS de la piste 26 gauche.',{ph:'Atterrissage',fl:{tAlt:3000,rate:1500,tIas:180},w:s=>s.fl.alt<=3100}),
 K('flaps',1,'',[['CDB','Volets un.']]),K('flaps',2,'',[['CDB','Volets deux.']]),K('gear','DOWN','',[['OPL','Glide slope. '],['CDB','Train sorti.']],s=>s.gp>0.99,'Attendre train sorti verrouillé'),K('flaps',3,''),K('flaps',4,'',[['CDB','Volets full.']]),K('spd',0,'Aérofreins armés pour l\'atterrissage (sortie automatique au toucher).'),
 K('ptt',true,'Autorisation d\'atterrissage.',[['TWR',`${cs}, wind two five zero at eight, runway two six left, cleared to land.`,'Vent 250° 8 nœuds, piste 26 gauche, autorisé à atterrir.'],['OPL',`Cleared to land two six left, ${cs}.`,'Collationnement.']]),
 Q('Finale','',{fl:{tAlt:0,rate:500,tIas:140},w:s=>s.fl.alt<=60,say:[['ECAM','Five hundred.'],['ECAM','Fifty, forty, thirty, twenty, ten. Retard.']]}),
 Q('Toucher des roues','La piste apparaît sous l\'avion.',{fl:{env:'rwy',alt:0,tAlt:0,ias:135,tIas:135},d:1.5}),
 K('ground',true,'',[]),K('spd',1,'Spoilers sortis : plus de portance, les roues freinent.',[['OPL','Spoilers. Reverse green. Décélération.']]),K('thr','IDLE',''),
 Q('Décélération','Freinage automatique jusqu\'à la vitesse de roulage.',{fl:{tIas:15,acc:6},w:s=>s.fl.ias<=18,say:[['OPL','Soixante-dix nœuds.']]}),
 K('spd',0,''),K('flaps',0,''),K('strobe','AUTO',''),K('land',false,''),K('taxi','TAXI',''),
 K('ptt',true,'Roulage vers le parking.',[['GND',`${cs}, Charles de Gaulle Ground, taxi to stand Echo four two via Whisky.`,'Roulez vers le poste E42 via W.'],['OPL',`Stand Echo four two via Whisky, ${cs}.`,'Collationnement.']]),
 Q('Roulage vers le poste','',{ph:'Arrivée',fl:{env:'taxi',tIas:15},d:5}),
 Q('Arrivée au poste de stationnement','Le placeur guide l\'avion jusqu\'à la ligne d\'arrêt.',{fl:{env:'park',apt:CREW.arr,tIas:0,ias:0},run:()=>{ mv('meca',[[246,120]],{at:[330,40],l:'Agent de piste'}); },d:3}),
 K('pbrake',true,''),K('apuMaster',true,'APU pour garder l\'électricité et la climatisation après l\'arrêt des moteurs.'),K('apuStart',true,'',[],s=>s.apuSt===2,'Attendre APU AVAIL'),
 K('m1',false,'',[['CDB','Arrêt des moteurs.']]),K('m2',false,''),K('beacon',false,'Feu anticollision éteint : le personnel au sol peut approcher.'),K('belts',false,''),
 K('pa',true,'',[['PA','Personnel de cabine, désarmement des toboggans, vérification de la porte opposée.'],['CC','Toboggans désarmés.'],['PA',`Mesdames et messieurs, bienvenue à Paris. Merci d'avoir voyagé avec Air Trajectoires.`]]),
 Q('Débarquement','Les passagers quittent l\'avion par l\'avant, puis l\'équipage.',{run:()=>{ mv('pbus',[[120,70]],{at:[-40,70]}); Object.keys(SYSAT.S.act).filter(k=>k.startsWith('pax')).forEach((k,i)=>{ const a=SYSAT.S.act[k]; mv(k,[[200,a.y],[200,70],DOOR,[150,78],[100-(i%8)*7,70]],{spd:34}); }); },d:6,w:()=>Object.keys(SYSAT.S.act).filter(k=>k.startsWith('pax')).every(k=>!SYSAT.S.act[k].path.length),say:[['CC','Au revoir, bonne journée !']]}),
 Q('Fin du vol','L\'équipage remplit le compte rendu matériel et descend. Fin du parcours.',{run:()=>{ ['cdb','opl','cc','pnc2','pnc3','pnc4'].forEach((id,i)=>mv(id,[DOOR,[150,92],[14,96+i*17]])); },say:[['CDB','Compte rendu matériel : rien à signaler. Merci à tous, beau vol.']],d:4})
 ];
 return st; }
/* ---------- A320 : pannes et urgences ---------- */
function flyInit(alt,ias){ return (s)=>{ s.fl.env='air'; s.fl.alt=alt; s.fl.tAlt=alt; s.fl.ias=ias; s.fl.tIas=ias; const N=crewNames(); mv('cdb',[],{at:[196,40],l:N.CDB}); mv('opl',[],{at:[204,40],l:N.OPL}); mv('cc',[],{at:[196,70],l:N.CC}); mv('pnc4',[],{at:[200,470],l:N.P4}); seats(NPAX()).forEach((p,i)=>mv('pax'+i,[],{at:p})); }; }
const cs=()=>'Air Trajectoires '+String(CREW.vol).replace(/\D/g,'').split('').map(d=>['zero','one','two','three','four','five','six','seven','eight','niner'][d]).join(' ');
function evac(){ const out=[[150,300],[250,300],[160,330],[240,330],[176,66],[224,66],[176,470],[224,470]]; Object.keys(SYSAT.S.act).filter(k=>k.startsWith('pax')).forEach((k,i)=>{ const a=SYSAT.S.act[k], o=out[i%out.length]; mv(k,[[200,a.y],[o[0]<200?182:218,o[1]],[o[0]<200?o[0]-40-(i%5)*8:o[0]+40+(i%5)*8,o[1]+(i%7)*6]],{spd:40}); }); }
const FAILS={
 dual:{n:'Double panne moteur (oiseaux) et amerrissage',fail:1,pre:'fly',init:flyInit(2800,220),st:()=>[
  Q('Impact d\'oiseaux','Juste après le décollage, un vol d\'oiseaux est ingéré par les deux moteurs : perte de poussée totale.',{ph:'Panne',run:s=>{ s.fail.e1=1; s.fail.e2=1; s.thr='CL'; },snd:'chime',say:[['CDB','Oiseaux !'],['ECAM','Engine dual failure.'],['CDB','J\'ai les commandes. Perte de poussée des deux moteurs.']],pt:['e1','e2'],pg:'ENG',d:3}),
  Q('RAT et électricité de secours','Les génératrices s\'arrêtent avec les moteurs : la RAT sort automatiquement (circuit bleu + génératrice de secours).',{pt:['rat','f_rat','hB'],pg:'HYD',w:s=>s.rat,d:3}),
  K('apuMaster',true,'Le copilote démarre l\'APU pour retrouver l\'électricité normale.',[['OPL','APU, start.']]),K('apuStart',true,'',[],s=>s.apuSt===2,'Attendre APU AVAIL'),
  K('ptt',true,'Le MAYDAY.',[['CDB',`Mayday, mayday, mayday, ${cs()}, hit birds, lost thrust in both engines, turning back.`,'Détresse : oiseaux, perte de poussée des deux moteurs, retour.'],['DEP',`${cs()}, roger, turn left heading two two zero, runway one three available.`,'Reçu, virez à gauche cap 220, piste 13 disponible.'],['CDB','Unable. We may end up in the river.','Impossible. Nous allons peut-être finir dans le fleuve.']]),
  K('ditch',true,'Fermeture de la vanne de décharge et des entrées d\'air pour flotter.',[['OPL','Ditching, ON.']]),K('flaps',2,'',[['CDB','Volets deux.']]),
  K('pa',true,'',[['PA','Ici le commandant. Préparez-vous à l\'impact.'],['PNC','Têtes baissées, restez baissés ! Heads down, stay down!']]),
  Q('Plané vers le fleuve','L\'avion plane sans moteur (environ 1 000 ft par minute) ; train rentré pour l\'amerrissage.',{fl:{tAlt:0,rate:120,tIas:130},w:s=>s.fl.alt<=40,d:4}),
  Q('Amerrissage','L\'avion se pose sur l\'eau, ailes horizontales, nez légèrement haut.',{fl:{env:'water',alt:0,tAlt:0,tIas:0,acc:8},run:s=>{ s.ground=true; },snd:'chime',d:4}),
  Q('Évacuation','Les PNC ouvrent les portes avant et les issues d\'aile ; les passagers sortent sur les ailes et les toboggans-radeaux.',{run:()=>evac(),say:[['PNC','Détachez vos ceintures, laissez tout, sortez ! Évacuez !'],['CDB','Cabine vide, je suis le dernier à sortir.']],d:6})]},
 dep:{n:'Dépressurisation en croisière',fail:1,pre:'fly',init:flyInit(35000,280),st:()=>[
  Q('Perte de pressurisation','Une fuite structurale fait monter l\'altitude cabine vers l\'altitude de l\'avion.',{ph:'Panne',run:s=>{ s.fail.dep=1; },pg:'PRESS',w:s=>s.cab>14000,say:[['ECAM','Cabin pressure. Excess cabin altitude.']],d:2}),
  Q('Masques à oxygène','Au-dessus de 14 000 ft de cabine, les masques passagers tombent automatiquement (points jaunes).',{pt:['masks'],say:[['CDB','Masques à oxygène, cent pour cent !'],['OPL','Masque en place, communication établie.']],d:3}),
  K('thr','IDLE','Descente d\'urgence : poussée au ralenti.',[['CDB','Descente d\'urgence.']]),K('spd',1,'Aérofreins sortis.'),
  K('ptt',true,'',[['OPL',`Mayday, mayday, mayday, ${cs()}, emergency descent, flight level one hundred.`,'Détresse, descente d\'urgence vers le niveau 100.'],['DEP',`${cs()}, roger, descend at your discretion, traffic cleared below.`,'Reçu, descendez à votre convenance, trafic dégagé.']]),
  Q('Descente d\'urgence','Environ 6 000 ft/min jusqu\'au niveau 100, où l\'on respire sans masque.',{fl:{tAlt:10000,rate:5000,tIas:300},w:s=>s.fl.alt<=10100,d:3}),
  K('spd',0,''),K('thr','CL',''),K('pa',true,'',[['PA','Ici le commandant. Nous sommes à une altitude où vous pouvez respirer normalement. Vous pouvez retirer votre masque.']])]},
 fireTO:{n:'Feu moteur 1 au décollage',fail:1,pre:'run',init:(s)=>{ s.fl.env='rwy'; s.pbrake=false; s.flaps=1; s.fp=1; s.strobe='ON'; s.land=true; const N=crewNames(); mv('cdb',[],{at:[196,40],l:N.CDB}); mv('opl',[],{at:[204,40],l:N.OPL}); seats(NPAX()).forEach((p,i)=>mv('pax'+i,[],{at:p})); },st:()=>[
  K('thr','TOGA','',[['CDB','Décollage.']]),Q('Course au décollage','',{ph:'Décollage',fl:{tIas:150,acc:4},w:s=>s.fl.ias>=148,say:[['OPL','V1… Rotation.']]}),K('ground',false,''),
  Q('Montée','',{fl:{env:'air',tAlt:1500,rate:300,tIas:165},w:s=>s.fl.alt>400}),K('gear','UP','',[['OPL','Vario positif.'],['CDB','Train sur rentré.']],s=>s.gp<0.01,'Attendre'),
  Q('ENG 1 FIRE','Alarme feu : sonnerie continue, voyants rouges.',{ph:'Panne',run:s=>{ s.fire1=true; },pt:['e1','e1fire'],pg:'ENG',say:[['ECAM','Engine one fire.'],['CDB','J\'ai les commandes, actions ECAM.']],d:3}),
  K('m1',false,'Master 1 OFF.',[['OPL','Manette un, ralenti. Master un… confirmez ?'],['CDB','Confirmé.']]),K('ff1',true,'',[['OPL','Bouton feu moteur un, poussé.']]),K('ag1',true,'',[['OPL','Agent un, décharge.']],s=>!s.fire1,'Attendre l\'extinction'),
  K('ptt',true,'',[['CDB',`Mayday, mayday, mayday, ${cs()}, engine fire, returning to Kennedy.`,'Détresse, feu moteur, retour à Kennedy.'],['TWR',`${cs()}, roger, cleared to land any runway, emergency services alerted.`,'Reçu, autorisé à atterrir sur toute piste, secours alertés.']]),
  Q('Retour sur un moteur','Circuit de retour, moteur 1 éteint.',{fl:{tAlt:0,rate:150,tIas:150},w:s=>s.fl.alt<=40}),K('gear','DOWN','',[],s=>s.gp>0.99,'Attendre'),
  Q('Atterrissage','',{fl:{env:'rwy',alt:0,ias:140,tIas:0,acc:5},run:s=>{ s.ground=true; mv('fire',[[100,300]],{at:[-40,300]}); },say:[['TWR',`${cs()}, fire services are on their way to your left side.`,'Les pompiers arrivent par votre gauche.']],d:5})]}
};
const A=MOD.a320; if(A){ A.actors=A320ACT; A.tours=Object.assign({vol:{n:'Parcours complet : aéroport → vol → arrivée',pre:'cold',before:cb=>form(cb),build:a320vol}},A.tours,FAILS); Object.values(FAILS).forEach(t=>{ t.build=t.st; t.st=[]; }); }
/* ---------- parcours des autres appareils (même méthode) ---------- */
function generic(key,o){ const M=MOD[key]; if(!M) return; M.actors=A320ACT; if(o.pad) M.pad=true;
 const start=(M.tours.start||{st:[]}).st;
 M.tours=Object.assign({vol:{n:'Parcours complet : prévol → vol → arrivée',pre:'cold',before:cb=>form(cb,o.maxPax),build:()=>{ const N=crewNames(), ell=[...Array(17).keys()].map(i=>{ const a=-Math.PI/2+i/16*Math.PI*2; return [200+o.rx*Math.cos(a),o.cy+o.ry*Math.sin(a)]; }), np=Math.min(o.maxPax,+CREW.pax||0);
  return [
   Q('Présentation de l\'équipage',`${CREW.vol} · ${CREW.cdb} (CDB)${o.two?', '+CREW.opl+' (OPL)':''} · ${np} passager(s).`,{ph:'Aéroport',fl:{env:o.pad?'pad':'park',apt:CREW.dep},run:()=>{ mv('cdb',[],{at:[14,96],l:N.CDB}); if(o.two) mv('opl',[],{at:[14,113],l:N.OPL}); mv('meca',[],{at:[300,80],l:N.ME}); },say:[['CDB',`Bonjour, je suis ${CREW.cdb}, commandant de bord. ${np} passager${np>1?'s':''} aujourd'hui, météo favorable.`]]}),
   Q('Vers l\'appareil','',{run:()=>{ mv('bus',[[60,92],[140,92]],{at:[-40,92]}); },d:3}),
   Q('Tour de l\'appareil','Le commandant fait le tour : structure, rotor ou gouvernes, trains, fuites, niveaux.',{ph:'Tour avion',run:()=>{ mv('cdb',[[140,100],...ell]); if(o.two) mv('opl',[[140,100],o.seat2]); mv('bus',[[440,92]]); },say:[['CDB',o.walkSay]]}),
   Q('Installation à bord','',{mv:[['cdb',[o.seat1]]],run:()=>{ for(let i=0;i<np;i++) mv('pax'+i,[[150,100],o.paxSeats[i%o.paxSeats.length]],{at:[60-i*8,96],spd:30}); },say:[['CDB','Ceintures attachées, portes fermées ? Briefing passagers fait.']],d:3}),
   ...start.map(x=>Array.isArray(x)?K(x[0],x[1],x[2],null,x[3],x[4]):Object.assign({},x)).filter(x=>!(o.pad&&(x.c==='coll'||x.c==='cyc'))).map((x,i)=>i===0?Object.assign(x,{ph:'Mise en route'}):x),
   ...o.flight(),
   Q('Débarquement','Les passagers et l\'équipage quittent l\'appareil.',{ph:'Arrivée',run:()=>{ Object.keys(SYSAT.S.act).filter(k=>k.startsWith('pax')).forEach((k,i)=>mv(k,[[150,100],[60-i*8,96]],{spd:30})); mv('cdb',[[150,100],[30,92]]); if(o.two) mv('opl',[[150,100],[52,92]]); },say:[['CDB','Fin du vol, merci et à bientôt.']],d:4})]; }}},M.tours); }
const TWRL=(t,f)=>['TWR',t,f];
generic('lj60',{two:true,rx:200,ry:300,cy:300,seat1:[196,42],seat2:[204,42],maxPax:6,paxSeats:[[194,160],[206,160],[194,200],[206,200],[194,240],[206,240]],walkSay:'Moteurs arrière : entrées d\'air libres. Empennage en T, trains et pneus : rien à signaler.',
 flight:()=>[Q('Roulage','',{ph:'Roulage',fl:{env:'taxi',tIas:15},d:4}),Q('Alignement','',{ph:'Décollage',fl:{env:'rwy',ias:0,tIas:0},say:[TWRL('Lear six zero alpha, runway three one left, cleared for take-off.','Autorisé au décollage piste 31 gauche.')]}),K('tl1','MAX','',[['CDB','Poussée de décollage.']]),K('tl2','MAX',''),
  Q('Course au décollage','',{fl:{tIas:130,acc:5},w:s=>s.fl.ias>=128,say:[['OPL','V1, rotation.']]}),K('ground',false,''),Q('Montée','',{ph:'Vol',fl:{env:'air',tAlt:1500,rate:400,tIas:160},w:s=>s.fl.alt>500}),K('gear','UP','',[['OPL','Vario positif, train sur rentré.']],s=>s.gp<0.01,'Attendre'),K('flaps',0,''),
  Q('Croisière','Niveau 430.',{fl:{tAlt:43000,rate:3000,tIas:250},w:s=>s.fl.alt>=42900}),Q('Descente et approche','',{ph:'Atterrissage',fl:{tAlt:2000,rate:3000,tIas:160},w:s=>s.fl.alt<=2100}),K('gear','DOWN','',[],s=>s.gp>0.99,'Attendre'),K('flaps',40,''),
  Q('Finale et toucher','',{fl:{tAlt:0,rate:400,tIas:120},w:s=>s.fl.alt<=40}),Q('Piste','',{fl:{env:'rwy',alt:0,ias:115,tIas:15,acc:5}}),K('ground',true,''),K('tl1','IDLE',''),K('tl2','IDLE',''),K('flaps',0,''),Q('Roulage vers le parking','',{fl:{env:'taxi',tIas:12},d:4}),Q('Parking','',{fl:{env:'park',apt:CREW.arr,tIas:0,ias:0},d:2}),K('tl1','CUT','Arrêt des moteurs.'),K('tl2','CUT',''),K('beacon',false,'')]});
const heliFlight=(gear,two)=>()=>[K('coll',1,'Décollage en stationnaire.',[['CDB','Paramètres moteur au vert, décollage.']],s=>!s.ground,'Attendre le décollage'),
 ...(gear?[K('gear','UP','',[],s=>s.gp<0.01,'Attendre')]:[]),K('cyc','F','Cyclique en avant : le disque s\'incline, l\'appareil accélère.'),
 Q('Vol en palier','Transit à basse altitude.',{ph:'Vol',fl:{env:'air',tAlt:1500,rate:300,tIas:120},w:s=>s.fl.alt>=1450,say:[TWRL('Helicopter, proceed via the Hudson corridor, report the Verrazano bridge.','Suivez le couloir de l\'Hudson, rappelez au pont Verrazano.')],d:4}),
 Q('Approche','',{ph:'Atterrissage',fl:{tAlt:0,rate:200,tIas:0,acc:3},w:s=>s.fl.alt<=20}),...(gear?[K('gear','DOWN','',[],s=>s.gp>0.99,'Attendre')]:[]),Q('Hélistation','',{fl:{env:'pad',alt:0}}),
 K('coll',0,'Collectif en bas : posé.'),...(two?[K('eng0','IDLE',''),K('eng1','IDLE',''),K('eng0','OFF',''),K('eng1','OFF','')]:[K('eng0','IDLE','Refroidissement au ralenti.'),K('eng0','OFF','Arrêt du moteur.')]),
 Q('Ralentissement du rotor','',{w:s=>s.nr<(two?40:165),d:2}),K('rbrake',true,'Frein rotor à faible régime.'),K('fso0',false,'')];
generic('h125',{pad:true,rx:70,ry:200,cy:330,seat1:[188,170],seat2:[212,170],maxPax:5,paxSeats:[[212,170],[188,205],[200,205],[212,205],[200,190]],walkSay:'Pales et tête rotor sans dommage, niveaux d\'huile BTP et moteur bons, rotor anticouple libre.',flight:heliFlight(false,false)});
generic('s76',{pad:true,two:true,rx:70,ry:230,cy:340,seat1:[190,150],seat2:[210,150],maxPax:12,paxSeats:[[186,220],[195,220],[205,220],[214,220],[186,250],[195,250],[205,250],[214,250],[186,280],[195,280],[205,280],[214,280]],walkSay:'Rotor quatre pales, trains, capots moteurs verrouillés, pas de fuite.',flight:heliFlight(true,true)});
generic('r44',{pad:true,rx:60,ry:190,cy:330,seat1:[190,180],seat2:[210,180],maxPax:3,paxSeats:[[210,180],[190,230],[210,230]],walkSay:'Courroies, pales, niveaux d\'huile, carburant purgé : rien à signaler.',
 flight:()=>[K('coll',1,'Décollage.',[['CDB','Régime au vert, décollage.']],s=>!s.ground,'Attendre le décollage'),K('cyc','F','Cyclique en avant.'),Q('Vol','',{ph:'Vol',fl:{env:'air',tAlt:1000,rate:250,tIas:100},w:s=>s.fl.alt>=950}),Q('Approche','',{ph:'Atterrissage',fl:{tAlt:0,rate:200,tIas:0,acc:3},w:s=>s.fl.alt<=20}),Q('Posé','',{fl:{env:'pad',alt:0}}),
  K('coll',0,''),K('gov',false,''),K('thr','IDLE','Refroidissement.'),K('clutch',false,'Débrayage : l\'actionneur détend les courroies.',[],s=>s.cl<=0.02,'Attendre le débrayage'),K('mix','CUT','Mélange étouffoir : arrêt du moteur.'),Q('Rotor qui ralentit','',{w:s=>s.nr<20}),K('rbrake',true,''),K('key','OFF',''),K('master',false,'')]});
/* ================= ACCIDENTS : chaîne des événements, analyse, version corrigée =================
   Scénarios fictifs, inspirés de types d'accidents réels étudiés en sécurité des vols. Représentation sobre. */
const AN=(c,f,ok)=>Q('Analyse de l\'accident','',{ph:'Analyse',fx:null,an:[['Causes :',c],['Facteurs contributifs :',f],['Ce qu\'il fallait faire :',ok]],d:16});
const FX=(fx,fxt,o)=>Object.assign({fx,fxt},o||{});
const appInit=(alt,ias,cfg)=>s=>{ flyInit(alt,ias)(s); Object.assign(s,cfg||{}); s.fl.tAlt=alt; };
const A320ACC={
 accOver:{n:'Sortie de piste à l\'atterrissage (piste mouillée)',acc:1,ok:'accOver_ok',pre:'fly',init:appInit(1500,165,{gear:'DOWN',gp:1,flaps:4,fp:4,thr:'IDLE',belts:true,land:true}),st:()=>[
  Q('Orage sur l\'aéroport','Forte pluie, vent arrière de 10 nœuds annoncé, piste mouillée et courte. L\'équipage, fatigué et en retard, décide de continuer.',{ph:'Approche',err:1,say:[['TWR','Runway two six left, wind one zero zero at ten, heavy rain, cleared to land.','Vent arrière 10 nœuds, forte pluie, autorisé à atterrir.']],d:3}),
  Q('Approche non stabilisée','À 1 000 ft : vitesse 20 nœuds trop élevée et au-dessus du plan. Les critères de stabilisation imposent la remise des gaz… elle n\'est pas faite.',{err:1,fl:{tAlt:0,rate:120,tIas:160},w:s=>s.fl.alt<=60,say:[['OPL','Vitesse, plus vingt.'],['CDB','Ça va passer.']]}),
  Q('Atterrissage long','Toucher des roues à 1 200 m du seuil : il reste peu de piste.',{err:1,fl:{env:'rwy',alt:0,tAlt:0,ias:155,tIas:155},run:s=>{ s.ground=true; },d:2}),
  Q('Freinage insuffisant','Spoilers non armés, inverseurs sortis tardivement ; l\'eau fait glisser les pneus (aquaplanage).',{err:1,fl:{tIas:55,acc:1.2},w:s=>s.fl.ias<=60,say:[['OPL','Pas de spoilers !'],['CDB','Reverse, freinage maxi !']]}),
  Q('Sortie de piste','L\'avion dépasse l\'extrémité de piste et s\'arrête dans l\'herbe.',FX('warn','SORTIE DE PISTE',{fl:{env:'grass',tIas:0,acc:3},w:s=>s.fl.ias<=1,snd:'chime',d:3})),
  Q('Évacuation','Train avant endommagé, pas de feu : évacuation par les toboggans.',FX(null,'',{run:()=>evac(),say:[['PNC','Détachez vos ceintures, laissez tout, sortez !']],d:6})),
  AN('Approche non stabilisée poursuivie, atterrissage long, spoilers non armés sur piste mouillée.','Fatigue et pression du retard (« get-there-itis »), vent arrière, faible adhérence, défaut de surveillance mutuelle (le copilote n\'a pas imposé la remise des gaz).','Remettre les gaz dès que l\'approche n\'est pas stabilisée à 1 000 ft ; attendre la fin de l\'orage ou se dérouter ; armer les spoilers, inverseurs et freinage maximum dès le toucher.')]},
 accOver_ok:{n:'Version corrigée : remise des gaz',hide:1,pre:'fly',init:appInit(1500,165,{gear:'DOWN',gp:1,flaps:4,fp:4,thr:'IDLE',belts:true,land:true}),st:()=>[
  Q('Approche non stabilisée détectée','À 1 000 ft la vitesse est trop forte : remise des gaz obligatoire.',{ph:'Approche',say:[['OPL','Vitesse plus vingt, non stabilisés.'],['CDB','Remise des gaz !']]}),
  K('thr','TOGA','Remise des gaz.',[['CDB','Go around, flaps.']]),K('flaps',3,''),K('gear','UP','',[['OPL','Vario positif.'],['CDB','Train sur rentré.']],s=>s.gp<0.01,'Attendre'),
  Q('Attente de la fin de l\'orage','L\'orage s\'éloigne ; nouvelle approche stabilisée.',{fl:{tAlt:3000,rate:500,tIas:200},w:s=>s.fl.alt>=2900,d:3}),K('thr','IDLE',''),
  K('gear','DOWN','',[],s=>s.gp>0.99,'Attendre'),K('flaps',4,''),Q('Approche stabilisée','',{fl:{tAlt:0,rate:300,tIas:138},w:s=>s.fl.alt<=40}),Q('Toucher dans la zone','',{fl:{env:'rwy',alt:0,ias:135}}),
  K('ground',true,''),K('spd',1,'Spoilers sortis.',[['OPL','Spoilers. Reverse green.']]),Q('Arrêt normal','Assez de piste pour s\'arrêter.',{fl:{tIas:12,acc:5},w:s=>s.fl.ias<=15})]},
 accStall:{n:'Décrochage après givrage des sondes Pitot (croisière)',acc:1,ok:'accStall_ok',pre:'fly',init:flyInit(35000,280),st:()=>[
  Q('Cristaux de glace','En traversant une zone orageuse, les sondes Pitot se bouchent de glace : les vitesses affichées deviennent fausses.',{ph:'Croisière',run:s=>{ s.fail.pitot=1; },pt:['probe'],say:[['ECAM','Navigation. I A S disagree.']],d:3}),
  Q('Pilote automatique déconnecté','Sans vitesse fiable, le pilote automatique et l\'auto-manette se déconnectent : le pilote reprend la main par surprise.',{err:0,say:[['ECAM','Autopilot off.'],['OPL','J\'ai les commandes.']],d:3}),
  Q('Action à cabrer','Surpris, le pilote tire sur le mini-manche : l\'avion monte, la vitesse réelle chute.',{err:1,fl:{tAlt:38000,rate:600,tIas:180},w:s=>s.fl.alt>=37500,d:3}),
  Q('Alarme de décrochage ignorée','L\'alarme retentit à plusieurs reprises ; elle n\'est pas reconnue, la poussée reste au maximum et le nez haut.',{err:1,say:[['ECAM','Stall. Stall.'],['CDB','Qu\'est-ce qui se passe ?']],d:3}),
  Q('Décrochage installé','L\'aile ne porte plus : l\'avion tombe à plat, nez haut, à plus de 10 000 ft par minute.',FX('warn','DÉCROCHAGE',{fl:{tAlt:0,rate:900,tIas:110},w:s=>s.fl.alt<=100})),
  Q('Impact avec la mer','',FX('impact','IMPACT',{fl:{env:'water',alt:0,ias:0,tIas:0},d:4})),
  AN('Perte des indications de vitesse (sondes givrées), puis action inadaptée à cabrer maintenue jusqu\'au décrochage.','Effet de surprise, formation insuffisante au pilotage manuel à haute altitude, alarmes non comprises, mauvaise coordination de l\'équipage.','Appliquer la procédure « vitesse non fiable » : garder l\'assiette (environ 5°) et la poussée de croisière, ne pas cabrer ; au décrochage, rendre la main (nez en bas) puis remettre la puissance.')]},
 accStall_ok:{n:'Version corrigée : vitesse non fiable',hide:1,pre:'fly',init:flyInit(35000,280),st:()=>[
  Q('Sondes givrées','Vitesses incohérentes, pilote automatique déconnecté.',{ph:'Croisière',run:s=>{ s.fail.pitot=1; },pt:['probe'],say:[['ECAM','I A S disagree.'],['CDB','Vitesse non fiable. Assiette, poussée.']]}),
  K('thr','CL','Garder la poussée de croisière et l\'assiette : l\'avion reste en palier.',[['OPL','Assiette deux et demi, poussée CLB, on garde le palier.']]),K('probe',true,'Réchauffage des sondes forcé.'),
  Q('Les sondes se dégivrent','Après quelques dizaines de secondes, les vitesses redeviennent cohérentes.',{run:s=>{ s.fail.pitot=0; },d:4,say:[['CDB','Vitesses de nouveau cohérentes. Pilote automatique, ON.']]})]},
 accConfig:{n:'Décollage sans volets (alarme de configuration en panne)',acc:1,ok:'accConfig_ok',pre:'run',init:s=>{ s.fl.env='rwy'; s.pbrake=false; s.flaps=0; s.fp=0; const N=crewNames(); mv('cdb',[],{at:[196,40],l:N.CDB}); mv('opl',[],{at:[204,40],l:N.OPL}); seats(NPAX()).forEach((p,i)=>mv('pax'+i,[],{at:p})); },st:()=>[
  Q('Check-list interrompue','Un appel du contrôle interrompt la check-list avant décollage : l\'item « volets » est sauté.',{ph:'Décollage',err:1,say:[['GND','Air Trajectoires, expedite, traffic behind you.','Accélérez, du trafic derrière vous.']],d:3}),
  Q('Alarme de configuration inopérante','Le système qui doit avertir « volets non sortis » est en panne (disjoncteur) : aucune alarme.',{err:1,d:3}),
  Q('Poussée de décollage','',{run:s=>{ s.thr='TOGA'; },pt:['e1fan','e2fan']}),Q('Course au décollage','',{fl:{tIas:155,acc:4},w:s=>s.fl.ias>=150,say:[['OPL','V1… Rotation.']]}),
  Q('L\'avion ne monte pas','Sans volets ni becs, l\'aile ne porte pas assez à cette vitesse : l\'avion décolle à peine, en décrochage.',FX('warn','DÉCROCHAGE',{err:1,run:s=>{ s.ground=false; },fl:{env:'air',tAlt:120,rate:50},say:[['ECAM','Stall. Stall.']],d:3})),
  Q('Retour au sol','L\'avion retombe après la piste.',FX('impact','IMPACT',{fl:{env:'grass',alt:0,tAlt:0,tIas:0,acc:5},run:s=>{ s.ground=true; },d:4})),
  AN('Volets et becs non sortis au décollage, sans alarme de configuration.','Interruption de la check-list, pression temporelle, panne de l\'alarme de configuration non détectée.','Reprendre la check-list depuis le début après toute interruption ; vérifier visuellement « volets 1 » sur l\'écran ; ne jamais décoller sans confirmation de la configuration.')]},
 accConfig_ok:{n:'Version corrigée : check-list complète',hide:1,pre:'run',init:s=>{ s.fl.env='rwy'; s.pbrake=false; s.flaps=0; s.fp=0; },st:()=>[
  Q('Check-list reprise depuis le début','',{ph:'Décollage',say:[['CDB','On reprend la check-list au début.'],['OPL','Volets ?']]}),K('flaps',1,'Volets 1 sortis et vérifiés.',[['CDB','Volets un, vérifiés.']]),
  K('thr','TOGA',''),Q('Course au décollage','',{fl:{tIas:150,acc:4},w:s=>s.fl.ias>=148}),K('ground',false,''),Q('Montée normale','',{fl:{env:'air',tAlt:1500,rate:300,tIas:165},w:s=>s.fl.alt>400}),K('gear','UP','',[],s=>s.gp<0.01,'Attendre')]},
 accGear:{n:'Atterrissage train rentré',acc:1,ok:'accGear_ok',pre:'fly',init:appInit(2500,180,{gear:'UP',gp:0,flaps:3,fp:3,thr:'IDLE',belts:true}),st:()=>[
  Q('Distraction en approche','Une panne mineure et des échanges radio occupent l\'équipage pendant l\'approche.',{ph:'Approche',err:1,say:[['APP','Air Trajectoires, say again your fuel endurance?','Répétez votre autonomie ?']],d:3}),
  Q('Check-list atterrissage oubliée','La sortie du train n\'est pas faite et la check-list n\'est pas lue.',{err:1,d:3}),
  Q('Alarmes ignorées','Les alarmes sonores s\'enchaînent mais sont prises pour une fausse alerte.',{err:1,fl:{tAlt:0,rate:200,tIas:140},w:s=>s.fl.alt<=60,say:[['ECAM','Too low. Gear.'],['ECAM','Too low. Gear.']]}),
  Q('Toucher sur le ventre','Le fuselage et les nacelles frottent sur la piste.',FX('sparks','TRAIN RENTRÉ',{fl:{env:'rwy',alt:0,ias:140,tIas:0,acc:2},run:s=>{ s.ground=true; },w:s=>s.fl.ias<=2,snd:'chime'})),
  Q('Évacuation','Fumée sous l\'avion : évacuation immédiate.',FX('smoke','',{run:()=>evac(),say:[['PNC','Évacuez ! Évacuez !']],d:6})),
  AN('Train non sorti avant l\'atterrissage.','Charge de travail et distraction, check-list non lue, alarmes non prises en compte.','Lire la check-list atterrissage quoi qu\'il arrive ; « train sorti, trois vert » annoncé et vérifié ; toute alarme « too low gear » impose la remise des gaz.')]},
 accGear_ok:{n:'Version corrigée : check-list atterrissage',hide:1,pre:'fly',init:appInit(2500,180,{gear:'UP',gp:0,flaps:3,fp:3,thr:'IDLE',belts:true}),st:()=>[
  K('gear','DOWN','Train sorti.',[['CDB','Train sorti.']],s=>s.gp>0.99,'Attendre les trois verts'),K('flaps',4,'',[['OPL','Check-list atterrissage : train, trois vert ; volets full ; spoilers armés.']]),
  Q('Finale','',{ph:'Approche',fl:{tAlt:0,rate:250,tIas:138},w:s=>s.fl.alt<=40}),Q('Toucher','',{fl:{env:'rwy',alt:0,ias:135}}),K('ground',true,''),K('spd',1,''),Q('Arrêt','',{fl:{tIas:12,acc:5},w:s=>s.fl.ias<=15})]},
 accFuel:{n:'Panne sèche après une fuite de carburant',acc:1,ok:'accFuel_ok',pre:'fly',init:s=>{ flyInit(35000,280)(s); s.fuel={lo:300,li:900,c:0,ri:1300,ro:300}; },st:()=>[
  Q('Fuite de carburant','Une tuyauterie fissurée sur le moteur 1 laisse fuir le carburant : le réservoir gauche se vide anormalement vite.',{ph:'Croisière',run:s=>{ s.fail.leak=4; },pt:['tLo','tLi','e1'],pg:'FUEL',d:4}),
  Q('Déséquilibre mal interprété','L\'équipage croit à une erreur de jauge et ne suspecte pas la fuite.',{err:1,d:3,say:[['OPL','Déséquilibre carburant… sûrement une jauge.']]}),
  Q('Intercommunication ouverte','Pour rééquilibrer, l\'équipage ouvre l\'intercommunication : le carburant de l\'aile droite part aussi par la fuite.',{err:1,run:s=>{ s.xfeed=true; },pt:['xfv','f_xf'],w:s=>s.es[0]!==2&&s.es[1]!==2,say:[['ECAM','Engine one fail.'],['ECAM','Engine two fail.']]}),
  Q('Plus aucun moteur','La RAT sort ; l\'avion plane vers un aérodrome de déroutement.',{pt:['rat'],pg:'HYD',fl:{tAlt:0,rate:300,tIas:200},w:s=>s.fl.alt<=60,say:[['CDB',`Mayday, mayday, mayday, ${cs()}, both engines out, gliding to the nearest airport.`,'Détresse, plus aucun moteur, plané vers l\'aéroport le plus proche.']]}),
  Q('Atterrissage dur','Sans moteur ni inverseurs, freinage seul : pneus éclatés, l\'avion s\'arrête en bout de piste.',FX('sparks','PNEUS ÉCLATÉS',{fl:{env:'rwy',alt:0,ias:180,tIas:0,acc:4},run:s=>{ s.gear='DOWN'; s.gp=1; s.ground=true; },w:s=>s.fl.ias<=2})),
  Q('Évacuation','Feu de freins léger maîtrisé par les pompiers.',FX('smoke','',{run:()=>{ evac(); mv('fire',[[100,300]],{at:[-40,300]}); },d:6})),
  AN('Fuite de carburant non identifiée, aggravée par l\'ouverture de l\'intercommunication.','Indice (déséquilibre) attribué à une panne de jauge, procédure de fuite non appliquée, maintenance (tuyauterie mal montée).','Comparer carburant à bord et consommé ; en cas de doute appliquer la procédure « fuite » : ne pas ouvrir l\'intercommunication, arrêter le moteur concerné, se dérouter tôt.')]},
 accFuel_ok:{n:'Version corrigée : procédure fuite',hide:1,pre:'fly',init:s=>{ flyInit(35000,280)(s); s.fuel={lo:300,li:900,c:0,ri:1300,ro:300}; },st:()=>[
  Q('Fuite suspectée','Carburant à bord + consommé < carburant au départ : fuite.',{ph:'Croisière',run:s=>{ s.fail.leak=4; },pg:'FUEL',say:[['CDB','Carburant à bord plus consommé ne colle pas : fuite. Procédure fuite.']]}),
  K('xfeed',false,'Intercommunication FERMÉE (surtout ne pas l\'ouvrir).'),K('m1',false,'Arrêt du moteur 1 (côté de la fuite).',[['OPL','Master un… confirmez ?'],['CDB','Confirmé.']]),
  Q('Déroutement','Le moteur 2 garde le carburant de l\'aile droite.',{fl:{tAlt:0,rate:500,tIas:180},w:s=>s.fl.alt<=60}),K('gear','DOWN','',[],s=>s.gp>0.99,'Attendre'),Q('Atterrissage sur un moteur','',{fl:{env:'rwy',alt:0,ias:140,tIas:15,acc:4}}),K('ground',true,'')]},
 accIncur:{n:'Collision sur la piste (incursion, brouillard)',acc:1,ok:'accIncur_ok',pre:'run',init:s=>{ s.fl.env='rwy'; s.pbrake=false; s.flaps=1; s.fp=1; const N=crewNames(); mv('cdb',[],{at:[196,40],l:N.CDB}); mv('opl',[],{at:[204,40],l:N.OPL}); seats(NPAX()).forEach((p,i)=>mv('pax'+i,[],{at:p})); },st:()=>[
  Q('Brouillard','Visibilité 300 m : la tour ne voit pas la piste, et l\'équipage ne voit pas l\'autre bout.',{ph:'Décollage',d:3}),
  Q('Malentendu radio','Messages qui se chevauchent et formulations non standard.',{err:1,say:[['OPL','We are now at take-off.','Nous sommes maintenant au décollage. (formule ambiguë)'],['TWR','OK… stand by for take-off, I will call you.','OK… attendez pour le décollage, je vous rappelle.']],d:2}),
  Q('Décollage sans autorisation','Le « OK » est compris comme une autorisation ; la fin du message est couverte par une autre émission.',{err:1,run:s=>{ s.thr='TOGA'; },fl:{tIas:130,acc:4},d:2}),
  Q('Un avion sur la piste','Un autre avion, qui roule sur la piste dans le brouillard, apparaît devant.',{run:()=>mv('intrus',[[200,150]],{at:[200,-60],ac:true,c:'#e8eef2',l:'Autre avion',rot:180,sc:2,spd:140}),w:s=>!SYSAT.S.act.intrus||!SYSAT.S.act.intrus.path.length,say:[['CDB','Oh non !']]}),
  Q('Collision','',FX('impact','COLLISION',{fy:150,fl:{tIas:0,acc:8},d:4})),
  AN('Décollage sans autorisation alors qu\'un avion était sur la piste.','Brouillard, phraséologie non standard (« OK », « at take-off »), messages radio simultanés, pression horaire, absence de radar sol.','N\'utiliser que la phraséologie standard ; ne jamais décoller sans « cleared for take-off » clair et collationné ; en cas de doute, demander confirmation.')]},
 accIncur_ok:{n:'Version corrigée : confirmer avant de décoller',hide:1,pre:'run',init:s=>{ s.fl.env='rwy'; s.pbrake=false; s.flaps=1; s.fp=1; },st:()=>[
  Q('Brouillard','',{ph:'Décollage'}),K('ptt',true,'Demander confirmation.',[['OPL','Confirm, are we cleared for take-off?','Confirmez : sommes-nous autorisés au décollage ?'],['TWR','Negative! Hold position, traffic on the runway.','Négatif ! Restez sur place, trafic sur la piste.']]),
  Q('L\'autre avion dégage la piste','',{run:()=>mv('intrus',[[440,150]],{at:[200,-60],ac:true,c:'#e8eef2',l:'Autre avion',rot:90,sc:2,spd:90}),d:5}),
  K('ptt',true,'',[['TWR','Runway clear, cleared for take-off.','Piste dégagée, autorisé au décollage.'],['OPL','Cleared for take-off.','Collationnement.']]),K('thr','TOGA',''),Q('Course au décollage','',{fl:{tIas:150,acc:4},w:s=>s.fl.ias>=148}),K('ground',false,'')]}
};
if(MOD.a320) Object.assign(MOD.a320.tours,A320ACC);
/* hélicoptères */
const hInit=(alt,ias)=>s=>{ s.ground=false; s.coll=1; s.fl.env='air'; s.fl.alt=alt; s.fl.tAlt=alt; s.fl.ias=ias; s.fl.tIas=ias; const N=crewNames(); mv('cdb',[],{at:[192,175],l:N.CDB}); };
function heliAcc(key,nrN){ const M=MOD[key]; if(!M) return; const engOff=s=>{ s.efail=true; s.autoro=true; };
 Object.assign(M.tours,{
  accAuto:{n:'Panne moteur : collectif non baissé',acc:1,ok:'accAuto_ok',pre:'run',init:hInit(800,90),st:()=>[
   Q('Panne moteur','Le moteur s\'arrête en vol (contamination du carburant). Le rotor n\'est plus entraîné : il ralentit en quelques secondes.',{ph:'Vol',run:engOff,snd:'chime',say:[['ECAM','Engine out. Rotor r p m.']]}),
   Q('Collectif maintenu','Surpris, le pilote garde le collectif levé : les pales freinent le rotor, le régime s\'effondre.',FX('warn','RÉGIME ROTOR BAS',{err:1,w:s=>s.nr<nrN*0.6,fl:{tAlt:0,rate:150}})),
   Q('Chute','Rotor trop lent : plus de portance.',FX('impact','IMPACT',{fl:{env:'pad',alt:0,tAlt:0,tIas:0,acc:6},run:s=>{ s.ground=true; s.autoro=false; },d:4})),
   AN('Collectif non baissé après la panne moteur : perte du régime rotor.','Effet de surprise, entraînement à l\'autorotation insuffisant.','Baisser le collectif immédiatement (1 à 2 secondes) : l\'air qui traverse le rotor le fait tourner (autorotation) ; arrondi au cyclique près du sol, puis collectif pour amortir.')]},
  accAuto_ok:{n:'Version corrigée : autorotation',hide:1,pre:'run',init:hInit(800,90),st:()=>[
   Q('Panne moteur','',{ph:'Vol',run:engOff,snd:'chime'}),K('coll',0,'Collectif en bas immédiatement : le régime rotor est conservé (autorotation).',[['CDB','Autorotation !']]),
   Q('Descente en autorotation','Environ 1 500 ft/min, vitesse 65 nœuds, régime rotor au vert.',{fl:{tAlt:40,rate:60,tIas:65},w:s=>s.fl.alt<=60,d:3}),K('cyc','A','Arrondi : cyclique en arrière pour freiner.'),K('coll',1,'Collectif levé au dernier moment : l\'énergie du rotor amortit le posé.'),
   Q('Posé','',{fl:{env:'pad',alt:0,tIas:0,acc:5},run:s=>{ s.ground=true; s.autoro=false; },say:[['CDB','Posés. Tout le monde va bien.']]})]},
  accVrs:{n:'Anneau tourbillonnaire (descente verticale)',acc:1,ok:'accVrs_ok',pre:'run',init:hInit(600,10),st:()=>[
   Q('Descente presque verticale','Vitesse quasi nulle et descente rapide : le rotor descend dans son propre souffle.',{ph:'Vol',err:1,fl:{tAlt:350,rate:30,tIas:5},w:s=>s.fl.alt<=360}),
   Q('Anneau tourbillonnaire','Les tourbillons de bout de pale se referment : la portance chute, vibrations, le vario s\'emballe.',FX('warn','ANNEAU TOURBILLONNAIRE',{d:3})),
   Q('Plus de collectif','Le pilote lève le collectif : cela aggrave l\'anneau.',{err:1,run:s=>{ s.coll=2; },fl:{tAlt:0,rate:60},w:s=>s.fl.alt<=40}),
   Q('Impact','',FX('impact','IMPACT',{fl:{env:'pad',alt:0,tIas:0},run:s=>{ s.ground=true; },d:4})),
   AN('Entrée en anneau tourbillonnaire en descente lente à faible vitesse.','Descente supérieure à environ 300 ft/min sous 30 nœuds, réflexe de lever le collectif.','Éviter les descentes verticales rapides ; en anneau, sortir latéralement ou vers l\'avant au cyclique (méthode Vuichard / prise de vitesse) avant de remettre du collectif.')]},
  accVrs_ok:{n:'Version corrigée : sortie au cyclique',hide:1,pre:'run',init:hInit(600,10),st:()=>[
   Q('Début d\'anneau','Vibrations, vario qui augmente.',{ph:'Vol',fl:{tAlt:420,rate:30,tIas:5},w:s=>s.fl.alt<=430}),K('cyc','F','Cyclique en avant : l\'hélicoptère prend de la vitesse et sort de son souffle.'),
   Q('Sortie de l\'anneau','À partir d\'environ 20 nœuds, le rotor retrouve de l\'air « propre » : la portance revient.',{fl:{tAlt:500,rate:40,tIas:40},w:s=>s.fl.ias>=35,say:[['CDB','Sortis, on reprend une approche normale.']]})]}}); }
heliAcc('h125',390); heliAcc('s76',107);
if(MOD.r44) Object.assign(MOD.r44.tours,{
 accLowG:{n:'Faible g et choc du mât (mast bumping)',acc:1,ok:'accLowG_ok',pre:'run',init:hInit(1000,100),st:()=>[
  Q('Poussée brutale sur le cyclique','En air turbulent, le pilote pousse vite le manche : l\'appareil passe en « faible g », presque en apesanteur.',{ph:'Vol',err:1,run:s=>{ s.cyc='F'; s.cycT=3; },d:3}),
  Q('Roulis non commandé','Rotor bipale déchargé : le couple du rotor anticouple fait rouler l\'appareil à droite. Le pilote corrige au cyclique à gauche.',{err:1,run:s=>{ s.cyc='L'; s.cycT=3; },d:3}),
  Q('Choc du mât','Le moyeu bascule jusqu\'à frapper le mât rotor (mast bumping) : rupture.',FX('impact','RUPTURE DU MÂT',{fl:{tAlt:0,rate:200,tIas:0},w:s=>s.fl.alt<=40})),
  AN('Faible g provoqué par une poussée sur le cyclique, puis correction latérale : choc du mât sur un rotor bipale.','Turbulence, réflexe inadapté ; les rotors bipales à battement libre y sont particulièrement sensibles.','En faible g : ramener d\'abord DOUCEMENT le cyclique en arrière pour recharger le rotor, puis corriger le roulis ; réduire la vitesse en turbulence.')]},
 accLowG_ok:{n:'Version corrigée : recharger le rotor',hide:1,pre:'run',init:hInit(1000,100),st:()=>[
  Q('Faible g','Sensation d\'allègement, début de roulis à droite.',{ph:'Vol',d:3}),K('cyc','A','Cyclique doucement en arrière : le rotor se recharge.'),Q('Roulis contrôlé','Le rotor chargé redevient efficace ; roulis corrigé ensuite.',{fl:{tIas:80},d:3,say:[['CDB','Rotor rechargé, on réduit la vitesse.']]})]},
 accAuto:{n:'Panne moteur : collectif non baissé',acc:1,ok:'accAuto_ok',pre:'run',init:hInit(700,80),st:()=>[
  Q('Panne moteur','',{ph:'Vol',run:s=>{ s.efail=true; s.autoro=true; },snd:'chime'}),Q('Collectif maintenu','',FX('warn','RÉGIME ROTOR BAS',{err:1,w:s=>s.nr<60,fl:{tAlt:0,rate:150}})),
  Q('Chute','',FX('impact','IMPACT',{fl:{env:'pad',alt:0},run:s=>{ s.ground=true; s.autoro=false; },d:4})),
  AN('Collectif non baissé : perte du régime rotor (faible inertie du rotor du R44).','Moins de 2 secondes de délai sur un rotor léger.','Collectif en bas immédiatement, maintenir le régime au vert, arrondi puis amortir au collectif.')]},
 accAuto_ok:{n:'Version corrigée : autorotation',hide:1,pre:'run',init:hInit(700,80),st:()=>[
  Q('Panne moteur','',{ph:'Vol',run:s=>{ s.efail=true; s.autoro=true; },snd:'chime'}),K('coll',0,'Collectif en bas immédiatement.'),Q('Autorotation','',{fl:{tAlt:40,rate:60,tIas:65},w:s=>s.fl.alt<=60}),
  K('cyc','A','Arrondi.'),K('coll',1,'Amortir.'),Q('Posé','',{fl:{env:'pad',alt:0},run:s=>{ s.ground=true; s.autoro=false; }})]}});
/* Learjet 60 */
if(MOD.lj60) Object.assign(MOD.lj60.tours,{
 accTire:{n:'Éclatement de pneu et interruption tardive',acc:1,ok:'accTire_ok',pre:'run',init:s=>{ s.fl.env='rwy'; s.flaps=8; s.fp=8; const N=crewNames(); mv('cdb',[],{at:[196,46],l:N.CDB}); mv('opl',[],{at:[204,46],l:N.OPL}); },st:()=>[
  Q('Pneus sous-gonflés','Pression des pneus non vérifiée depuis plusieurs semaines.',{ph:'Décollage',err:1,d:3}),Q('Course au décollage','',{run:s=>{ s.tl1='MAX'; s.tl2='MAX'; },fl:{tIas:135,acc:4},w:s=>s.fl.ias>=133}),
  Q('Éclatement au-dessus de V1','Un pneu éclate ; des débris endommagent capteurs et freins.',FX('sparks','PNEU ÉCLATÉ',{d:2})),
  Q('Interruption après V1','Le décollage est interrompu au-delà de V1 : il ne reste pas assez de piste.',{err:1,run:s=>{ s.tl1='IDLE'; s.tl2='IDLE'; },fl:{tIas:50,acc:1.5},w:s=>s.fl.ias<=55}),
  Q('Sortie de piste','',FX('impact','SORTIE DE PISTE',{fl:{env:'grass',tIas:0,acc:4},d:4})),
  AN('Interruption du décollage au-delà de V1 après un éclatement de pneu.','Pneus sous-gonflés, décision tardive, freins endommagés.','Avant V1 : interrompre ; après V1 : continuer le décollage et traiter la panne en vol ; vérifier la pression des pneus avant chaque vol.')]},
 accTire_ok:{n:'Version corrigée : continuer après V1',hide:1,pre:'run',init:s=>{ s.fl.env='rwy'; s.flaps=8; s.fp=8; },st:()=>[
  Q('Course au décollage','',{ph:'Décollage',run:s=>{ s.tl1='MAX'; s.tl2='MAX'; },fl:{tIas:135,acc:4},w:s=>s.fl.ias>=133}),Q('Pneu éclaté après V1','',FX('sparks','PNEU ÉCLATÉ',{d:2,say:[['CDB','On continue !']]})),
  K('ground',false,'Rotation : on continue le décollage.'),Q('Montée','Train laissé sorti (débris possibles), retour pour atterrissage avec secours prévenus.',FX(null,'',{fl:{env:'air',tAlt:1500,rate:300,tIas:160},w:s=>s.fl.alt>=1400}))]}});

})();
