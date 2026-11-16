/* ===== DOSSIER DE VOL : documents papier et numériques du pilote =====
   Plan de vol (check-list complète en direct), OFP / log de navigation, plan de vol OACI (FPL), METAR / TAF, ATIS,
   carte TEMSI, carte des vents (WINTEM), NOTAM, carte de route, cartes de départ / approche / aérodrome,
   devis de masse et centrage, bilan carburant, performances, NOTOC, compte rendu matériel (tech log), manifeste, check-lists.
   Les valeurs viennent du simulateur (devis LS, WB, METAR, mission). Itinéraires, TAF, NOTAM et cartes : EXEMPLES pédagogiques,
   à ne pas utiliser pour la navigation réelle. Export PDF (générateur intégré) et TXT. */
(function(){
const css=document.createElement('style'); css.textContent=`#docv{position:fixed;inset:0;z-index:70;background:#0b1118;display:flex;flex-direction:column;color:#e8eef2;font:14px/1.45 'Inter',sans-serif}#docv[hidden]{display:none!important}
#docv .hd{display:flex;flex-wrap:wrap;gap:6px;align-items:center;padding:8px 10px;border-bottom:1px solid #1d2f40;background:#08111a}#docv .hd .tt{flex:1 1 180px;min-width:0}#docv .hd b{display:block;font:700 18px 'Barlow Condensed',sans-serif;letter-spacing:.06em}#docv .hd small{color:#8fa4b8;font-size:12px}
#docv button{background:#132232;color:#fff;border:1px solid #2b3d50;border-radius:8px;padding:6px 10px;font:700 13px 'Barlow Condensed',sans-serif;letter-spacing:.05em;text-transform:uppercase;cursor:pointer;white-space:nowrap}#docv button.go{background:#e04ad8;border-color:#e04ad8}#docv button.ok{background:#1f8a4c;border-color:#3ddc84}
#docv .main{flex:1;min-height:0;display:flex}#docv nav{width:250px;flex:none;overflow:auto;border-right:1px solid #1d2f40;padding:6px}#docv nav h5{margin:10px 4px 4px;font:700 11px 'Barlow Condensed',sans-serif;letter-spacing:.14em;color:#3fd0ff;text-transform:uppercase}
#docv nav button{display:block;width:100%;text-align:left;margin:3px 0;text-transform:none;font:500 13.5px 'Inter',sans-serif;letter-spacing:0;padding:7px 9px;white-space:normal}#docv nav button.on{background:#3fd0ff;color:#041018;border-color:#3fd0ff}#docv nav button.rel{border-color:#e04ad8}
#docv .pg{flex:1;overflow:auto;padding:14px;background:#2a3038}#docv .paper{max-width:820px;margin:0 auto;background:#fbfaf6;color:#111;border-radius:2px;box-shadow:0 6px 30px #0008;padding:22px 24px;min-height:60vh}
#docv .paper h2{margin:0 0 2px;font:700 20px 'Barlow Condensed',sans-serif;letter-spacing:.06em}#docv .paper .sub{color:#555;font-size:12px;margin-bottom:10px;border-bottom:2px solid #111;padding-bottom:6px}
#docv .paper pre{margin:0;font:12.5px/1.45 'JetBrains Mono',monospace;white-space:pre;overflow-x:auto}#docv .paper svg{width:100%;height:auto;display:block;background:#fff}
#docv .paper .note{margin-top:10px;font-size:11.5px;color:#7a2a2a;border-top:1px dashed #b99;padding-top:6px}
#docv .pl .stp{margin:8px 0;border:1px solid #c9c2b0;border-radius:4px;overflow:hidden}#docv .pl .stp>.h{padding:5px 8px;background:#ece7da;font:700 13px 'Barlow Condensed',sans-serif;letter-spacing:.04em;display:flex;justify-content:space-between;gap:6px}
#docv .pl .stp.cur>.h{background:#f6d6f3}#docv .pl .stp.ok>.h{background:#cdeedb}#docv .pl .ln{display:flex;gap:8px;align-items:flex-start;padding:4px 8px;border-top:1px solid #e3ddcd;font-size:13px}
#docv .pl .ln.g{background:#dff5e7;color:#0d5a2a}#docv .pl .ln.r{background:#fbe1df;color:#8a1410;cursor:pointer;font-weight:600}#docv .pl .ln.r:hover{background:#f6c6c2}#docv .pl .ln.f{color:#666}#docv .pl .ln i{flex:none;font-style:normal;width:16px;text-align:center}
#docv .pl .ln small{margin-left:auto;font-size:11px;color:#8a1410;white-space:nowrap}#docv .pl .ln.d{font-size:12.5px;padding-left:28px}#docv .pl .sum{display:flex;gap:10px;flex-wrap:wrap;font:700 13px 'Barlow Condensed',sans-serif;letter-spacing:.05em;margin:4px 0 8px}
#docv .pl .bar{height:8px;background:#ddd;border-radius:4px;overflow:hidden;margin-bottom:8px}#docv .pl .bar i{display:block;height:100%;background:#1f8a4c}
#b-docs{} #jmp .st .dc{margin-left:auto;font:700 11px 'Barlow Condensed',sans-serif;letter-spacing:.05em;color:#fff;background:#e04ad8;border-radius:6px;padding:2px 6px;white-space:nowrap}
@media(max-width:800px){#docv .main{flex-direction:column}#docv nav{width:auto;border-right:0;border-bottom:1px solid #1d2f40;display:flex;gap:4px;overflow-x:auto;white-space:nowrap;padding:5px}#docv nav h5{display:none}#docv nav button{display:inline-block;width:auto;white-space:nowrap;margin:0}#docv .pg{padding:6px}#docv .paper{padding:12px}#docv .paper pre{font-size:10px}}
@media print{body>*:not(#docv){display:none!important}#docv{position:static}#docv .hd,#docv nav{display:none}#docv .pg{background:#fff;padding:0}#docv .paper{box-shadow:none}}`; document.head.appendChild(css);
/* ---------- contexte ---------- */
const P=(s,n)=>String(s).padEnd(n), L_=(s,n)=>String(s).padStart(n), F0=n=>Math.round(n).toLocaleString('fr-FR').replace(/\u202f/g,' ');
const pad2=n=>String(n).padStart(2,'0');
function ctx(){ const k=(typeof ACK!=='undefined'&&ACK)||(typeof selAC!=='undefined'&&selAC)||'a320', a=AC[k]||{}, fw=a.kind==='fw';
 let mi=(typeof MI!=='undefined'&&MI&&MI.start)?MI:MISSIONS[fw?'jfk-cdg':'heli-ny'];
 if(fw&&mi.rw) mi=MISSIONS['jfk-cdg']; if(!fw&&mi.fw) mi=MISSIONS['heli-ny'];
 const dep=fw?(mi===MISSIONS['cdg-jfk']?'LFPG':'KJFK'):(mi===MISSIONS['heli-cdg']?'LFPG':'KJRB'), dest=mi.dest||'LFPG';
 let L={}; try{ if(typeof ACK!=='undefined'&&ACK===k&&LS&&LS.block) L=LS; else { const sv=[ACK,A,MI], keep=Object.assign({},LS); ACK=k; A=a; MI=mi; lsInit(); L=Object.assign({},LS); ACK=sv[0]; A=sv[1]; MI=sv[2]; Object.keys(LS).forEach(x=>delete LS[x]); Object.assign(LS,keep); } }catch(e){ L={}; }
 let crew={}; try{ crew=JSON.parse(localStorage.getItem('sa-crew')||'{}'); }catch(e){}
 const d=new Date(), date=`${pad2(d.getUTCDate())}/${pad2(d.getUTCMonth()+1)}/${d.getUTCFullYear()}`, dof=`${String(d.getUTCFullYear()).slice(2)}${pad2(d.getUTCMonth()+1)}${pad2(d.getUTCDate())}`;
 const W=WB[k]||{}, etd=fw?'1830':'1500', fh=L.tripH||(fw?7.3:0.3), eta=(()=>{ const m=18*60+30+Math.round(fh*60); return pad2(Math.floor(m/60)%24)+pad2(m%60); })();
 return {k,a,fw,mi,dep,dest,altn:fw?(dest==='LFPG'?'LFPO':'KEWR'):(dest==='KJFK'?'KLGA':'LFPB'),L,W,crew,date,dof,etd,eta,fh,flt:crew.vol?String(crew.vol).replace(/\s/g,''):'PTA722',cs:(typeof CSN==='function'?CSN():'SIMU 320'),reg:crew.imm||({a320:'F-HTRJ',lj60:'N60PT',s76:'N76PT',h125:'F-HPTJ',r44:'F-HPTR'}[k]),type:{a320:'A320',lj60:'LJ60',s76:'S76',h125:'AS50',r44:'R44'}[k],name:a.name||k}; }
const apN=c=>(APTS[c]&&APTS[c].n)||({KJRB:'Downtown Manhattan Heliport',LFPO:'Paris-Orly',KEWR:'Newark',KLGA:'LaGuardia',LFPB:'Paris-Le Bourget'}[c]||c);
function metar(c){ try{ const m=WXS.met[c]; if(m&&m.raw) return 'METAR '+m.raw.replace(/^METAR /,''); }catch(e){} return {LFPO:'METAR LFPO 030200Z 20005KT CAVOK 08/06 Q1019 NOSIG',KEWR:'METAR KEWR 021851Z 21011KT 10SM FEW050 15/04 A3024',KLGA:'METAR KLGA 021851Z 20009KT 10SM FEW050 14/05 A3025',KJRB:'METAR KJRB (pas de station : voir KJFK / KLGA)',LFPB:'METAR LFPB 030200Z 21005KT CAVOK 07/06 Q1019'}[c]||'METAR '+c+' NIL'; }
/* itinéraire (exemple pédagogique) */
const RT={fw:[['KJFK',40.64,-73.78,'DÉP'],['BETTE',41.0,-69.5,'SID'],['YQX',48.95,-54.57,'VOR'],['50N050W',50,-50,''],['51N040W',51,-40,'NAT'],['52N030W',52,-30,'NAT'],['52N020W',52,-20,'NAT'],['MALOT',53,-15,'Shanwick'],['LND',50.13,-5.64,'VOR'],['ABB',50.13,1.85,'VOR'],['LFPG',49.01,2.55,'ARR']],
 rw:[['KJRB',40.701,-74.009,'DÉP'],['STATUE',40.69,-74.045,'VRP'],['VZ',40.607,-74.045,'Verrazano'],['CI',40.575,-73.98,'Coney Island'],['RCKY',40.6,-73.88,'VRP'],['KJFK',40.64,-73.78,'ARR']]};
const gc=(a,b)=>{ const R=6371,r=Math.PI/180, dl=(b[2]-a[2])*r, p1=a[1]*r, p2=b[1]*r; return Math.acos(Math.min(1,Math.sin(p1)*Math.sin(p2)+Math.cos(p1)*Math.cos(p2)*Math.cos(dl)))*R; };
const brg=(a,b)=>{ const r=Math.PI/180, y=Math.sin((b[2]-a[2])*r)*Math.cos(b[1]*r), x=Math.cos(a[1]*r)*Math.sin(b[1]*r)-Math.sin(a[1]*r)*Math.cos(b[1]*r)*Math.cos((b[2]-a[2])*r); return (Math.atan2(y,x)/r+360)%360; };
function route(c){ let r=RT[c.fw?'fw':'rw']; if(c.fw&&c.dep==='LFPG') r=r.slice().reverse(); return r; }
/* ---------- générateurs ---------- */
const NOTE='EXEMPLE PÉDAGOGIQUE — ne pas utiliser pour la navigation réelle. Valeurs de masse, carburant et vitesses : calculées par le simulateur (formules simplifiées [ESTIMÉ]).';
const D={};
D.ofp={t:'OFP — plan de vol exploitation / log de navigation',cat:'Plan de vol',gen(c){ const r=route(c), L=c.L, tot=r.slice(1).reduce((s,p,i)=>s+gc(r[i],p),0); let acc=0, fuel=(L.block||0)-(c.W.taxi||0), t=0;
  const spd=c.fw?(c.W.gs||450):(c.W.gs||120), fl=c.fw?'350':'010';
  const rows=r.map((p,i)=>{ if(!i) return `${P(p[0],9)} ${P(p[3],9)} ${L_('---',4)} ${L_('',5)} ${L_('',6)} ${L_('0:00',6)} ${L_(F0(fuel),7)}`; const dkm=gc(r[i-1],p); acc+=dkm; const dnm=dkm/1.852; t+=dnm/spd; fuel-=(L.trip||0)*dkm/tot;
   return `${P(p[0],9)} ${P(p[3],9)} ${L_(Math.round(brg(r[i-1],p)).toString().padStart(3,'0'),4)} ${L_(fl,5)} ${L_(Math.round(dnm),6)} ${L_(Math.floor(t)+':'+pad2(Math.round(t%1*60)),6)} ${L_(F0(Math.max(0,fuel)),7)}`; }).join('\n');
  return {txt:`OPERATIONAL FLIGHT PLAN — PLAN DE VOL EXPLOITATION
VOL ${c.flt}  INDICATIF ${c.cs}  ${c.type}  ${c.reg}      DATE ${c.date}
${c.dep} (${apN(c.dep)}) → ${c.dest} (${apN(c.dest)})   DÉGAGEMENT ${c.altn}
ETD ${c.etd}Z   ETA ${c.eta}Z   TEMPS DE VOL ${Math.floor(c.fh)}h${pad2(Math.round(c.fh%1*60))}   ${c.fw?'NIVEAU FL350  MACH 0.78':'ALTITUDE 1 000 ft VFR'}
DISTANCE ${Math.round(tot/1.852)} NM (${Math.round(tot)} km)    VENT MOYEN ${c.fw?'+35 kt (arrière)':'calme'}

CARBURANT (${c.W.unit||'kg'})                 MASSES (${c.W.unit||'kg'})
  ROULAGE      ${L_(F0(c.W.taxi||0),7)}            ZFW  ${L_(F0(L.zfw||0),7)}  max ${F0(c.W.mzfw||0)}
  ÉTAPE        ${L_(F0(L.trip||0),7)}            TOW  ${L_(F0(L.tow||0),7)}  max ${F0(c.W.mtow||0)}
  RÉSERVE 5 %  ${L_(F0(L.cont||0),7)}            LW   ${L_(F0(L.lw||0),7)}  max ${F0(c.W.mlw||0)}
  DÉGAGEMENT   ${L_(F0(c.W.alt||0),7)}
  FINALE 30'   ${L_(F0(c.W.res30||0),7)}
  SUPPLÉMENT   ${L_(F0(L.extra||0),7)}
  BLOC         ${L_(F0(L.block||0),7)}${L.short?'   ⚠ DÉPASSE LA CAPACITÉ':''}

LOG DE NAVIGATION
POINT     TYPE      ROUTE NIV.   DIST    TEMPS  CARB.REST
${rows}

ROUTE ATC : ${r.map(p=>p[0]).join(' ')}
COMMANDANT : ${c.crew.cdb||'____________'}   SIGNATURE : __________   PRÉPARÉ PAR : OCC / dispatch`}; }};
D.fpl={t:'Plan de vol OACI (FPL) déposé',cat:'Plan de vol',gen(c){ const r=route(c), L=c.L, eet=pad2(Math.floor(c.fh))+pad2(Math.round(c.fh%1*60)), endu=c.W.burn?(()=>{ const h=(L.block||0)/c.W.burn; return pad2(Math.floor(h))+pad2(Math.round(h%1*60)); })():'0300';
  const cs=c.cs.replace(/\s/g,''), pob=1+(c.crew.opl?1:0)+(c.fw?(+c.crew.pax||L.pax||0)+4:(L.pax||1));
  return {txt:`FORMULAIRE DE PLAN DE VOL OACI (case par case)
 7  IDENTIFICATION ............ ${cs}
 8  RÈGLES / TYPE DE VOL ...... ${c.fw?'I / S (IFR, régulier)':'V / G (VFR, aviation générale)'}
 9  TYPE / TURBULENCE ......... ${c.type} / ${AL(c.k)?'M':'L'}
10  ÉQUIPEMENT ................ ${c.fw?'SDE2E3FGHIJ1RWXY / LB1':'S / C'}
13  DÉPART / HEURE ............ ${c.dep} ${c.etd}
15  VITESSE / NIVEAU / ROUTE .. ${c.fw?'N0450F350':'N0110VFR'} ${r.slice(1,-1).map(p=>p[0]).join(' DCT ')}
16  DESTINATION / EET / DÉG. .. ${c.dest} ${eet} ${c.altn}
18  AUTRES RENSEIGNEMENTS ..... ${c.fw?'PBN/A1B1C1D1S1 ':''}DOF/${c.dof} REG/${c.reg.replace('-','')} OPR/AIR TRAJECTOIRES
19  AUTONOMIE / POB ........... E/${endu} P/${pob}

MESSAGE ATS :
(FPL-${cs}-${c.fw?'IS':'VG'}
-${c.type}/${AL(c.k)?'M':'L'}-${c.fw?'SDE2E3FGHIJ1RWXY/LB1':'S/C'}
-${c.dep}${c.etd}
-${c.fw?'N0450F350':'N0110VFR'} ${r.slice(1,-1).map(p=>p[0]).join(' DCT ')}
-${c.dest}${eet} ${c.altn}
-${c.fw?'PBN/A1B1C1D1S1 ':''}DOF/${c.dof} REG/${c.reg.replace('-','')}
-E/${endu} P/${pob})`}; }};
D.metar={t:'Météo : METAR et TAF (départ, destination, dégagement)',cat:'Météo',gen(c){ const t=(x)=>({KJFK:`TAF KJFK 021720Z 0218/0324 21012KT P6SM FEW050 SCT250\n  FM030200 23008KT P6SM SCT060\n  FM031400 28012G20KT P6SM BKN040`,LFPG:`TAF LFPG 021700Z 0218/0324 21008KT CAVOK\n  BECMG 0304/0306 4000 BR SCT008\n  BECMG 0309/0311 9999 FEW030`,LFPO:`TAF LFPO 021700Z 0218/0324 20007KT CAVOK\n  TEMPO 0303/0308 3000 BR`,KEWR:`TAF KEWR 021720Z 0218/0324 21011KT P6SM FEW050`,KLGA:`TAF KLGA 021720Z 0218/0324 20010KT P6SM FEW050`,KJRB:`(pas de TAF : utiliser KJFK / KLGA)`,LFPB:`TAF LFPB 021700Z 0218/0324 21006KT CAVOK`}[x]||`TAF ${x} NIL`);
  return {txt:`DOSSIER MÉTÉO — ${c.dep} → ${c.dest}

DÉPART ${c.dep} (${apN(c.dep)})
${metar(c.dep)}
${t(c.dep)}

DESTINATION ${c.dest} (${apN(c.dest)})
${metar(c.dest)}
${t(c.dest)}

DÉGAGEMENT ${c.altn} (${apN(c.altn)})
${metar(c.altn)}
${t(c.altn)}

LECTURE : vent ddd/ff kt (rafales G), visibilité, nuages FEW/SCT/BKN/OVC + base en centaines de ft,
température/point de rosée, QNH (Q hPa, A en pouces). TAF : prévision ; FM = à partir de, BECMG = évolution, TEMPO = temporairement.
Les METAR viennent du simulateur (relevés réels datés, ou en direct si disponibles) ; les TAF sont des exemples.`}; }};
D.atis={t:'ATIS (information de l\'aérodrome)',cat:'Météo',gen(c){ const out=[c.dep,c.dest].map(ic=>{ let a=null; try{ a=atisFor(ic,ic==='KJFK'?'31L':ic==='LFPG'?(c.dep==='LFPG'?'27L':'26L'):null); }catch(e){} return a?`${ic} — INFORMATION ${a.L}\n${a.en}\n→ ${a.fr}`:`${ic} — ATIS non disponible (héliport / pas de METAR)`; }).join('\n\n'); return {txt:`ATIS — Automatic Terminal Information Service\n(construite sur le METAR du simulateur)\n\n${out}`}; }};
D.notam={t:'NOTAM (avis aux navigants)',cat:'Information aéronautique',gen(c){ const fw=c.fw; return {txt:`NOTAM — ${c.dep} / EN ROUTE / ${c.dest} / ${c.altn}

${fw?`A1452/26 NOTAMN
Q) KZNY/QMXLC/IV/M/A/000/999/4038N07347W005
A) KJFK  B) 2611010400  C) 2612152300
E) TWY K BTN TWY B AND TWY A CLSD DUE TO WIP.

A1503/26 NOTAMN
A) KJFK  E) RWY 13R/31L REDL 300M NORTH SIDE U/S.

B0871/26 NOTAMN (NAT)
E) ORGANISED TRACK SYSTEM : SEE NAT TRACK MESSAGE, TRACK C VALID 0100-0800Z.

C4410/26 NOTAMN
Q) LFFF/QFAXX/IV/NBO/A/000/999
A) LFPG  E) TWY WB1 CLSD. STAND E42 AVBL ONLY WITH MARSHALLER.

C4532/26 NOTAMN
A) LFPG  E) ILS RWY 26L GP U/S 0200-0400 DAILY (MAINTENANCE).`:`A2204/26 NOTAMN
A) KJRB  E) PPR 24HR. HELIPAD 2 CLSD.

A2231/26 NOTAMN (FDC)
E) TEMPORARY FLIGHT RESTRICTION : HUDSON RIVER CORRIDOR — CHARTED VFR PROCEDURES AND
   SELF-ANNOUNCE ON 123.050 MANDATORY. MAX 1300 FT MSL.

A2290/26 NOTAMN
A) KJFK  E) HELICOPTER ARRIVALS VIA RCKY ONLY, CTC TWR 119.1 BEFORE CI.`}

À LIRE : A) aérodrome, B) début, C) fin (AAMMJJHHMM UTC), E) texte. Q) code : centre, sujet (QMXLC = taxiway fermé).
EXEMPLES PÉDAGOGIQUES : consulter les NOTAM officiels avant tout vol réel.`}; }};
/* --- cartes (projection simple) --- */
function proj(c){ return c.fw?{x0:-80,x1:6,y0:36,y1:60,W:820,H:440}:{x0:-74.08,x1:-73.74,y0:40.55,y1:40.73,W:820,H:440}; }
const XY=(p,lo,la)=>[(lo-p.x0)/(p.x1-p.x0)*p.W,(p.y1-la)/(p.y1-p.y0)*p.H];
const COAST={na:[[-80,36],[-76,37],[-75.5,38.5],[-74,40],[-72,41],[-70,41.7],[-70,43],[-67,44.5],[-66,45],[-64,45.5],[-61,45.5],[-60,46.5],[-59.5,47.5],[-53,46.6],[-52.6,47.6],[-53.5,49.5],[-55.5,51.5],[-57,52],[-60,55],[-62,57.5],[-64,60]],
 eu:[[6,60],[5,58.5],[6,56],[4.5,53],[3,51.3],[1.6,50.9],[0.1,49.5],[-1.5,49.7],[-1.9,48.7],[-4.7,48.4],[-4.3,47.8],[-2,47],[-1.2,46],[-1.8,44],[-1.6,43.4],[-3,43.4],[-8,43.7],[-9.3,42.5],[-9,40],[-9.5,38.5],[-9,36.9]],
 uk:[[-5.7,50.05],[-3.5,50.4],[-1,50.8],[1.3,51.2],[1.7,52.6],[0.3,53.4],[-0.2,54.3],[-1.6,55.6],[-2,57],[-1.8,57.6],[-4,57.6],[-3.3,58.6],[-5,58.6],[-6.2,57.4],[-5.6,56.4],[-5.8,55],[-3,54.9],[-3.3,53.4],[-4.6,53.3],[-4.2,52.3],[-5.3,51.8],[-3.4,51.4],[-4.2,51.2],[-5.7,50.05]],
 ie:[[-6,52.2],[-6.2,53.9],[-5.9,55.2],[-7.3,55.4],[-8.5,54.9],[-10,54.2],[-9.9,53.3],[-10.3,52.1],[-9.6,51.5],[-8,51.7],[-6,52.2]]};
function coast(p){ return Object.values(COAST).map(l=>`<polyline points="${l.map(q=>XY(p,q[0],q[1]).map(v=>v.toFixed(1)).join(',')).join(' ')}" fill="${l[0][0]===l[l.length-1][0]?'#efe9d6':'none'}" stroke="#7a8a7a" stroke-width="1.4"/>`).join(''); }
function grid(p,step){ let g=''; for(let lo=Math.ceil(p.x0/step)*step;lo<=p.x1;lo+=step){ const [x]=XY(p,lo,p.y0); g+=`<line x1="${x}" y1="0" x2="${x}" y2="${p.H}" stroke="#d8d2c0" stroke-width=".7"/><text x="${x+2}" y="${p.H-4}" font-size="9" fill="#888">${Math.abs(lo)}${lo<0?'W':'E'}</text>`; } for(let la=Math.ceil(p.y0/5)*5;la<=p.y1;la+=5){ const [,y]=XY(p,0,la); g+=`<line x1="0" y1="${y}" x2="${p.W}" y2="${y}" stroke="#d8d2c0" stroke-width=".7"/><text x="3" y="${y-2}" font-size="9" fill="#888">${la}N</text>`; } return g; }
const rline=(p,r,col='#c2185b',w=3)=>`<polyline points="${r.map(q=>XY(p,q[2],q[1]).map(v=>v.toFixed(1)).join(',')).join(' ')}" fill="none" stroke="${col}" stroke-width="${w}"/>`+r.map(q=>{ const [x,y]=XY(p,q[2],q[1]); return `<circle cx="${x}" cy="${y}" r="3.5" fill="#fff" stroke="${col}" stroke-width="2"/><text x="${x+5}" y="${y-5}" font-size="10" font-weight="700" fill="#222">${q[0]}</text>`; }).join('');
const svgW=(p,inner,title)=>`<svg viewBox="0 0 ${p.W} ${p.H}" role="img" aria-label="${title}"><rect width="${p.W}" height="${p.H}" fill="#f6fbff"/>${inner}<rect width="${p.W}" height="${p.H}" fill="none" stroke="#111" stroke-width="2"/></svg>`;
D.route={t:'Carte de route (trajet et points de report)',cat:'Plan de vol',svg:1,gen(c){ const p=proj(c), r=route(c);
  if(!c.fw){ const inner=`<rect width="${p.W}" height="${p.H}" fill="#eaf4ea"/>${(()=>{ const river=[[-74.03,40.73],[-74.025,40.70],[-74.045,40.66],[-74.04,40.6],[-74.0,40.56]]; return `<polyline points="${river.map(q=>XY(p,q[0],q[1]).join(',')).join(' ')}" fill="none" stroke="#9cc8e8" stroke-width="26"/>`; })()}<polygon points="${[[-74.0,40.705],[-73.97,40.71],[-73.97,40.73],[-74.01,40.73]].map(q=>XY(p,q[0],q[1]).join(',')).join(' ')}" fill="#d9d2c0"/><text x="${XY(p,-73.99,40.72)[0]}" y="${XY(p,-73.99,40.72)[1]}" font-size="11">MANHATTAN</text>
   <polygon points="${[[-73.83,40.62],[-73.76,40.62],[-73.76,40.67],[-73.83,40.67]].map(q=>XY(p,q[0],q[1]).join(',')).join(' ')}" fill="#e6e0f0" stroke="#7a5aa8"/><text x="${XY(p,-73.82,40.665)[0]}" y="${XY(p,-73.82,40.665)[1]}" font-size="11" fill="#7a5aa8">KJFK — CTR classe B</text>${rline(p,r)}<text x="10" y="18" font-size="13" font-weight="700">CARTE VFR — COULOIR DE L'HUDSON / ARRIVÉE JFK (schéma)</text><text x="10" y="34" font-size="10">Altitude max 1 300 ft MSL dans le couloir · auto-annonce 123.050 · contact Tour JFK avant Coney Island</text>`;
   return {svg:svgW(p,inner,'Carte VFR'),txt:'Carte VFR (schéma) : '+r.map(q=>q[0]+' ('+q[3]+')').join(' → ')}; }
  const fir=[['NEW YORK OCEANIC',-68,39],['GANDER',-52,53],['SHANWICK',-25,55],['BREST',-8,46.5],['PARIS',0.5,48]].map(f=>{ const [x,y]=XY(p,f[1],f[2]); return `<text x="${x}" y="${y}" font-size="11" fill="#5a7aa8" font-weight="700">${f[0]} FIR</text>`; }).join('');
  const inner=grid(p,10)+coast(p)+`<line x1="${XY(p,-30,36)[0]}" y1="0" x2="${XY(p,-30,36)[0]}" y2="${p.H}" stroke="#5a7aa8" stroke-dasharray="6 4"/><line x1="${XY(p,-15,36)[0]}" y1="0" x2="${XY(p,-15,36)[0]}" y2="${p.H}" stroke="#5a7aa8" stroke-dasharray="6 4"/>`+fir+rline(p,r)+`<text x="10" y="18" font-size="13" font-weight="700">CARTE DE ROUTE ${c.dep} → ${c.dest} — Atlantique Nord (schéma, projection simplifiée)</text><text x="10" y="34" font-size="10">Trait rouge : route du plan de vol. Pointillés : limites océaniques (30W, 15W). Track NAT : 50N050W → 52N020W.</text>`;
  return {svg:svgW(p,inner,'Carte de route'),txt:'Carte de route (schéma) : '+r.map(q=>q[0]).join(' → ')}; }};
D.temsi={t:'Carte TEMSI (temps significatif)',cat:'Météo',svg:1,gen(c){ const p=proj(c); if(!c.fw){ const inner=`<rect width="${p.W}" height="${p.H}" fill="#fff"/><text x="10" y="20" font-size="14" font-weight="700">TEMSI BASSE COUCHE (SFC – FL150) — RÉGION NEW YORK (schéma)</text>
   <path d="M120 250 q40 -40 80 0 q40 -40 80 0 q40 -40 80 0" fill="none" stroke="#1565c0" stroke-width="3"/><text x="140" y="280" font-size="12">Brume côtière possible VIS 5 km, plafond 1 500 ft en fin de nuit</text>
   <rect x="480" y="90" width="260" height="120" rx="40" fill="none" stroke="#c62828" stroke-width="2.5" stroke-dasharray="8 5"/><text x="500" y="140" font-size="12" fill="#c62828">TURB MOD SFC–3000 ft</text><text x="500" y="158" font-size="11" fill="#c62828">(vent fort entre les tours)</text>
   <text x="10" y="420" font-size="11">Isotherme 0 °C : 9 000 ft · Vent 2 000 ft : 230° 15 kt · Validité 18–24 UTC</text>`; return {svg:svgW(p,inner,'TEMSI'),txt:'TEMSI basse couche (schéma) : brume côtière, turbulence modérée près des tours, 0 °C à 9 000 ft.'}; }
  const r=route(c), jet=[[-78,38],[-62,44],[-45,50],[-28,53],[-10,51],[4,48]], cbx=[[-58,45],[-50,45],[-48,49],[-56,50]];
  const inner=grid(p,10)+coast(p)+`<polyline points="${jet.map(q=>XY(p,q[0],q[1]).join(',')).join(' ')}" fill="none" stroke="#2e7d32" stroke-width="5"/><text x="${XY(p,-42,51.5)[0]}" y="${XY(p,-42,51.5)[1]}" font-size="12" font-weight="700" fill="#2e7d32">JET FL340 140 kt</text>
  <polygon points="${cbx.map(q=>XY(p,q[0],q[1]).join(',')).join(' ')}" fill="#c6282822" stroke="#c62828" stroke-width="3" stroke-dasharray="3 3"/><text x="${XY(p,-57,47.5)[0]}" y="${XY(p,-57,47.5)[1]}" font-size="11" fill="#c62828" font-weight="700">ISOL EMBD CB XXX/250</text>
  <ellipse cx="${XY(p,-30,53)[0]}" cy="${XY(p,-30,53)[1]}" rx="110" ry="40" fill="none" stroke="#e65100" stroke-width="2.5" stroke-dasharray="10 5"/><text x="${XY(p,-36,55.2)[0]}" y="${XY(p,-36,55.2)[1]}" font-size="11" fill="#e65100" font-weight="700">TURB MOD (CAT) FL300/380</text>
  <polyline points="${[[-35,40],[-30,45],[-26,50]].map(q=>XY(p,q[0],q[1]).join(',')).join(' ')}" fill="none" stroke="#1565c0" stroke-width="3"/>${[[-34,41.5],[-31,44],[-28,47.5]].map(q=>{ const [x,y]=XY(p,q[0],q[1]); return `<path d="M${x} ${y} l8 -10 l4 12 z" fill="#1565c0"/>`; }).join('')}<text x="${XY(p,-33,39.5)[0]}" y="${XY(p,-33,39.5)[1]}" font-size="11" fill="#1565c0">front froid</text>
  ${[[-70,42,'380'],[-45,47,'350'],[-15,50,'330']].map(q=>{ const [x,y]=XY(p,q[0],q[1]); return `<rect x="${x-16}" y="${y-10}" width="32" height="16" fill="#fff" stroke="#111"/><text x="${x}" y="${y+2}" font-size="10" text-anchor="middle">${q[2]}</text>`; }).join('')}`+rline(p,r,'#c2185b',2)+
  `<text x="10" y="18" font-size="13" font-weight="700">TEMSI / SIGWX FL250–630 — ATLANTIQUE NORD — VALIDITÉ 00 UTC (schéma)</text><text x="10" y="34" font-size="10">Vert : courant-jet · rouge festonné : cumulonimbus · orange : turbulence en ciel clair · bleu : front froid · encadrés : tropopause (FL)</text>`;
  return {svg:svgW(p,inner,'TEMSI'),txt:'TEMSI (schéma) : jet FL340 140 kt ; CB isolés noyés près de Terre-Neuve jusqu\'au FL250 ; turbulence modérée FL300-380 vers 30W ; front froid 26-35W ; tropopause FL330-380.'}; }};
D.wintem={t:'Carte des vents et températures (WINTEM FL340)',cat:'Météo',svg:1,gen(c){ const p=proj(c); let g=grid(p,10)+coast(p);
  for(let lo=-75;lo<=0;lo+=10) for(let la=40;la<=58;la+=6){ const [x,y]=XY(p,lo,la), dir=250+((lo+la)%20), spd=Math.max(30,Math.round(120-Math.abs(la-50)*7-Math.abs(lo+40)*0.6)), t=-50-Math.round((la-40)*0.4);
   const a=(dir+180)*Math.PI/180, x2=x+28*Math.sin(a), y2=y-28*Math.cos(a); let barbs=''; let n=Math.round(spd/10); for(let i=0;i<Math.min(n,8);i++){ const f=1-i*0.12, bx=x+(x2-x)*f, by=y+(y2-y)*f, pa=a+Math.PI/2.4; barbs+=`<line x1="${bx}" y1="${by}" x2="${bx+(i%5===4?0:9)*Math.sin(pa)}" y2="${by-(i%5===4?0:9)*Math.cos(pa)}" stroke="#1a237e" stroke-width="1.6"/>`; }
   g+=`<circle cx="${x}" cy="${y}" r="2" fill="#1a237e"/><line x1="${x}" y1="${y}" x2="${x2}" y2="${y2}" stroke="#1a237e" stroke-width="1.6"/>${barbs}<text x="${x+4}" y="${y+12}" font-size="9" fill="#b71c1c">${t}</text>`; }
  g+=rline(p,route(c),'#c2185b',2)+`<text x="10" y="18" font-size="13" font-weight="700">WINTEM FL340 (250 hPa) — vent (barbules, 10 kt par trait) et température °C (schéma)</text>`;
  return {svg:svgW(p,g,'WINTEM'),txt:'WINTEM FL340 (schéma) : vent d\'ouest 250-270° de 60 à 120 kt, maximum vers 50N ; température -50 à -57 °C. Vent arrière moyen ≈ +35 kt sur la route.'}; }};
const chartFrame=(t,sub,inner)=>`<svg viewBox="0 0 820 520"><rect width="820" height="520" fill="#fff"/><rect x="0" y="0" width="820" height="46" fill="#111"/><text x="12" y="20" fill="#fff" font-size="15" font-weight="700">${t}</text><text x="12" y="38" fill="#ccc" font-size="11">${sub}</text>${inner}<text x="12" y="510" font-size="10" fill="#b71c1c">SCHÉMA PÉDAGOGIQUE — NE PAS UTILISER POUR LA NAVIGATION — fréquences et altitudes indicatives</text><rect width="820" height="520" fill="none" stroke="#111" stroke-width="2"/></svg>`;
D.sid={t:'Carte de départ (SID) KJFK piste 31L',cat:'Information aéronautique',svg:1,fw:1,gen(c){ const inner=`<rect x="360" y="330" width="16" height="140" fill="#555" transform="rotate(-45 368 400)"/><text x="330" y="470" font-size="12" font-weight="700">KJFK RWY 31L</text>
 <path d="M368 400 L470 300 L520 200 L620 120" fill="none" stroke="#c2185b" stroke-width="3" marker-end="url(#ar)"/><defs><marker id="ar" markerWidth="10" markerHeight="10" refX="6" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6 Z" fill="#c2185b"/></marker></defs>
 <text x="480" y="300" font-size="11">Montée piste jusqu'à 1 000 ft, puis virage à droite</text><text x="530" y="200" font-size="11">Cap 060° — vecteurs radar</text><circle cx="620" cy="120" r="6" fill="#fff" stroke="#111" stroke-width="2"/><text x="632" y="118" font-size="12" font-weight="700">BETTE</text>
 <rect x="40" y="70" width="250" height="120" fill="#f5f5f5" stroke="#111"/><text x="50" y="92" font-size="12" font-weight="700">KENNEDY FIVE (vecteurs)</text><text x="50" y="112" font-size="11">Altitude initiale : 5 000 ft</text><text x="50" y="130" font-size="11">Altitude de transition : 18 000 ft</text><text x="50" y="148" font-size="11">Départ (Departure) : 135.9</text><text x="50" y="166" font-size="11">Transpondeur : code de la clairance</text>`;
 return {svg:chartFrame('KJFK — DÉPART RWY 31L (SID, schéma)','New York JFK · élévation 13 ft · rattachement : vecteurs radar puis BETTE',inner),txt:'SID KJFK 31L (schéma) : montée dans l\'axe jusqu\'à 1 000 ft, virage à droite cap 060, vecteurs vers BETTE, altitude initiale 5 000 ft.'}; }};
D.app={t:'Carte d\'approche ILS (arrivée)',cat:'Information aéronautique',svg:1,fw:1,gen(c){ const ic=c.dest, rw=ic==='LFPG'?'26L':'31R';
 const inner=`<line x1="80" y1="300" x2="740" y2="300" stroke="#c2185b" stroke-width="3"/><rect x="40" y="292" width="60" height="16" fill="#555"/><text x="40" y="285" font-size="12" font-weight="700">RWY ${rw}</text>
 ${[[260,'FAF 5,5 NM — 2 000 ft'],[480,'IF 10 NM — 3 000 ft'],[700,'IAF 15 NM — 4 000 ft']].map(q=>`<path d="M${q[0]} 290 l8 10 l-8 10 l-8 -10 z" fill="#fff" stroke="#111"/><text x="${q[0]-40}" y="330" font-size="11">${q[1]}</text>`).join('')}
 <path d="M100 440 L700 360" stroke="#1565c0" stroke-width="2"/><text x="520" y="350" font-size="11" fill="#1565c0">Plan de descente 3,0°</text><text x="110" y="460" font-size="11">Seuil — minima ILS CAT I : DA 200 ft / RVR 550 m</text>
 <rect x="460" y="70" width="320" height="140" fill="#f5f5f5" stroke="#111"/><text x="470" y="92" font-size="12" font-weight="700">ILS ${rw} — ${apN(ic)}</text><text x="470" y="112" font-size="11">Axe d'approche final : ${ic==='LFPG'?'266°':'314°'}</text><text x="470" y="130" font-size="11">Remise des gaz : montée dans l'axe 3 000 ft</text><text x="470" y="148" font-size="11">Tour / Sol : voir ATIS</text><text x="470" y="166" font-size="11">Altitude de transition ${ic[0]==='L'?'5 000 ft (niveau 70)':'18 000 ft'}</text>`;
 return {svg:chartFrame(`${ic} — APPROCHE ILS RWY ${rw} (schéma)`,`${apN(ic)} · plan 3° · minima CAT I`,inner),txt:`Approche ILS ${rw} ${ic} (schéma) : IAF 4 000 ft, IF 3 000 ft, FAF 2 000 ft à 5,5 NM, plan 3°, DA 200 ft.`}; }};
D.apt={t:'Carte d\'aérodrome (roulage)',cat:'Information aéronautique',svg:1,gen(c){ const ic=c.fw?c.dep:(c.dest||'KJFK');
 const inner=`<rect x="80" y="380" width="660" height="22" fill="#555" transform="rotate(-20 410 391)"/><text x="100" y="440" font-size="12" font-weight="700">${ic==='KJFK'?'RWY 13R/31L':'RWY 08R/26L'}</text>
 <rect x="80" y="180" width="660" height="22" fill="#555" transform="rotate(-20 410 191)"/><text x="100" y="160" font-size="12" font-weight="700">${ic==='KJFK'?'RWY 13L/31R':'RWY 09L/27R'}</text>
 <path d="M150 300 L700 120" stroke="#e8c33a" stroke-width="6"/><text x="420" y="225" font-size="12" font-weight="700" fill="#8a6d00">TWY ${ic==='KJFK'?'B':'W'}</text><path d="M300 250 L340 390 M560 170 L600 300" stroke="#e8c33a" stroke-width="5"/>
 <rect x="330" y="60" width="200" height="60" fill="#d9d2c0" stroke="#111"/><text x="345" y="95" font-size="12">TERMINAL ${ic==='KJFK'?'4 · GATE 7':'2E · E42'}</text><circle cx="410" cy="300" r="8" fill="#c62828"/><text x="422" y="304" font-size="11" fill="#c62828">Point d'arrêt</text>`;
 return {svg:chartFrame(`${ic} — CARTE D'AÉRODROME (schéma)`,`${apN(ic)} · roulage poste → piste`,inner),txt:`Carte d'aérodrome ${ic} (schéma).`}; }};
D.loadsheet={t:'Devis de masse et centrage (load & trim sheet)',cat:'Masse, centrage, carburant',gen(c){ const L=c.L, W=c.W, u=W.unit||'kg', ok=x=>x?'OK':'⚠ DÉPASSEMENT';
  return {txt:`LOADSHEET — DEVIS DE MASSE ET CENTRAGE
VOL ${c.flt}  ${c.type}  ${c.reg}   ${c.dep}-${c.dest}   ${c.date}   ÉDITION 01

MASSE DE BASE (DOW, équipage inclus) ....... ${L_(F0(W.dow||0),8)} ${u}
PASSAGERS  ${L_(L.pax||0,3)} × ${W.stdPax||84} kg${L.child?` + ${L.child} enfants`:''} ......... ${L_(F0(L.paxM||0),8)} ${u}
BAGAGES  (${L.bag||0} kg/passager) ............... ${L_(F0(L.bagM||0),8)} ${u}
FRET / POSTE ............................... ${L_(F0(L.cargo||0),8)} ${u}
---------------------------------------------------------------
MASSE SANS CARBURANT (ZFW) ................. ${L_(F0(L.zfw||0),8)} ${u}   max ${F0(W.mzfw||0)}  ${ok(L.ok&&L.ok.zfw)}
CARBURANT AU DÉCOLLAGE (bloc − roulage) .... ${L_(F0((L.block||0)-(W.taxi||0)),8)} ${u}
MASSE AU DÉCOLLAGE (TOW) ................... ${L_(F0(L.tow||0),8)} ${u}   max ${F0(W.mtow||0)}  ${ok(L.ok&&L.ok.tow)}
CARBURANT D'ÉTAPE .......................... ${L_(F0(L.trip||0),8)} ${u}
MASSE À L'ATTERRISSAGE (LW) ................ ${L_(F0(L.lw||0),8)} ${u}   max ${F0(W.mlw||0)}  ${ok(L.ok&&L.ok.lw)}

CENTRAGE ${L.cg!=null?`: ${L.cg.toFixed(1)} % CMA (limites ${W.cgLim?W.cgLim.join(' – '):'—'} %)`:`: bras ${L.arm?L.arm.toFixed(2):'—'} m (limites ${W.armLim?W.armLim.join(' – '):'—'})`}  ${ok(L.cgOK)}
${c.fw?`RÉGLAGE DU PLAN HORIZONTAL (THS) : ${L.trim||'—'}   ·   V1 ${L.v1||'—'}  VR ${L.vr||'—'}  V2 ${L.v2||'—'} kt [ESTIMÉ]`:''}

RÉPARTITION : ${c.fw?'cabine avant / arrière, soutes AV / AR':'sièges avant / arrière, coffre'}
LMC (dernière minute) : NIL
PRÉPARÉ PAR : agent de trafic ________   ACCEPTÉ (CDB) : ${c.crew.cdb||'________'}   SIGNATURE : ______`}; }};
D.fuel={t:'Bilan carburant (fuel plan et décision)',cat:'Masse, centrage, carburant',gen(c){ const L=c.L, W=c.W, u=W.unit||'kg';
  return {txt:`BILAN CARBURANT — ${c.dep} → ${c.dest} (dégagement ${c.altn})
Distance ${F0(L.dist||0)} km · vitesse sol ${W.gs||'—'} kt · temps ${Math.floor(c.fh)}h${pad2(Math.round(c.fh%1*60))} · consommation moyenne ${F0(W.burn||0)} ${u}/h

  1. Roulage ................................ ${L_(F0(W.taxi||0),7)} ${u}
  2. Étape (temps × consommation) ............ ${L_(F0(L.trip||0),7)} ${u}
  3. Réserve de route (5 % de l'étape) ....... ${L_(F0(L.cont||0),7)} ${u}
  4. Dégagement vers ${c.altn} ................ ${L_(F0(W.alt||0),7)} ${u}
  5. Réserve finale (30 min) ................. ${L_(F0(W.res30||0),7)} ${u}
  6. Supplément décidé par le CDB ............ ${L_(F0(L.extra||0),7)} ${u}
  ---------------------------------------------------------------
  CARBURANT MINIMUM REQUIS .................. ${L_(F0(L.need||0),7)} ${u}
  CAPACITÉ MAXIMALE ......................... ${L_(F0(W.fuelMax||0),7)} ${u}
  CARBURANT EMPORTÉ (BLOC) .................. ${L_(F0(L.block||0),7)} ${u}  ${L.short?'⚠ IMPOSSIBLE : réduire la charge ou faire escale':'OK'}

DÉCISION DU COMMANDANT : bloc ${F0(L.block||0)} ${u} — motif du supplément : ${L.extra?'météo / attente prévue':'néant'}.
Contrôle en vol : carburant restant à chaque point du log (OFP) ; écart > 5 % → analyse (fuite ?).`}; }};
D.perf={t:'Performances décollage et atterrissage (TODC)',cat:'Masse, centrage, carburant',fw:1,gen(c){ const L=c.L; return {txt:`CARTE DE DONNÉES DE DÉCOLLAGE / ATTERRISSAGE [ESTIMÉ — formules simplifiées]
${c.dep} RWY ${c.dep==='KJFK'?'31L':'27L'} · masse ${F0(L.tow||0)} kg · volets ${AL(c.k)?'1+F':'8°'} · centrage ${L.cg!=null?L.cg.toFixed(1)+' %':'—'}
  V1 ${L.v1||'—'} kt   VR ${L.vr||'—'} kt   V2 ${L.v2||'—'} kt   THS ${L.trim||'—'}   poussée ${AL(c.k)?'TOGA (ou FLEX)':'T/O'}
${c.dest} · masse à l'atterrissage ${F0(L.lw||0)} kg · volets FULL
  VLS ${L.vls||'—'} kt   VAPP ${L.vapp||'—'} kt   autofrein MED
Saisie dans le MCDU (PERF TAKE OFF / APPR) et sur le FCU. Vérification croisée CDB / OPL obligatoire.`}; }};
D.notoc={t:'NOTOC (marchandises dangereuses) et chargement',cat:'Masse, centrage, carburant',fw:1,gen(c){ return {txt:`NOTOC — NOTIFICATION TO CAPTAIN (marchandises dangereuses et spéciales)
VOL ${c.flt}  ${c.dep}-${c.dest}

SOUTE 1 (avant) : UN3481 — batteries lithium-ion contenues dans un équipement, classe 9, 12 kg, PI 967 section II
SOUTE 4 (arrière) : AVI (animaux vivants) — 1 chien en caisse, ventilation soute ON
SOUTE 5 (vrac) : bagages

Aucune autre marchandise dangereuse à bord.
CHARGÉ PAR : __________   VÉRIFIÉ / ACCEPTÉ (CDB) : ${c.crew.cdb||'__________'}`}; }};
D.techlog={t:'Compte rendu matériel (tech log) et tolérances (MEL)',cat:'Appareil et équipage',gen(c){ return {txt:`COMPTE RENDU MATÉRIEL (CRM / TECH LOG) — ${c.reg} (${c.name})
DERNIÈRE VISITE : check journalier (daily) effectué le ${c.date} 1500Z — mécanicien ${c.crew.meca||'M. Dubois'} — APRS signé

ENTRÉES OUVERTES
${c.fw?`  1. Liseuse siège 12C inopérante — MEL 33-25-01 CAT C — valable 10 jours — placard posé.
  2. Essuie-glace gauche bruyant — contrôlé, conforme — clôturé.`:`  1. Feu anticollision bas fonctionnant par intermittence — réparé, testé — clôturé.`}

CARBURANT : avitaillé ${F0(c.L.block||0)} ${c.W.unit||'kg'} (bon d'avitaillement n° 48211)
HUILE : moteurs complétés, niveaux OK  ·  HYDRAULIQUE : niveaux OK  ·  PNEUS : pressions OK

APRÈS LE VOL : le commandant note toute anomalie (ex. « RAS ») et signe.
Visa CDB : ________`}; }};
D.manifest={t:'Manifeste passagers et déclaration générale',cat:'Appareil et équipage',gen(c){ const cr=c.crew, pax=(cr.paxl||'').split('\n').filter(x=>x.trim());
  return {txt:`GENERAL DECLARATION — DÉCLARATION GÉNÉRALE
EXPLOITANT : AIR TRAJECTOIRES   VOL ${c.flt}   ${c.reg}   ${c.dep} → ${c.dest}   ${c.date}

ÉQUIPAGE
  Commandant de bord ......... ${cr.cdb||'Claire Martin'}
  ${c.fw||c.k==='s76'||c.k==='lj60'?`Officier pilote de ligne .... ${cr.opl||'Thomas Leroy'}`:''}
  ${c.fw&&AL(c.k)?`Chef de cabine ............. ${cr.cc||'Sarah Benali'}
  ${cr.g2||'Steward'} ................... ${cr.pnc2||'Hugo Petit'}
  ${cr.g3||'Hôtesse'} ................... ${cr.pnc3||'Léa Moreau'}
  ${cr.g4||'Hôtesse'} ................... ${cr.pnc4||'Inès Faure'}`:''}

PASSAGERS : ${cr.pax!=null?cr.pax:(c.L.pax||0)}
${pax.length?'LISTE NOMINATIVE\n'+pax.map((x,i)=>`  ${L_(i+1,3)}. ${x}`).join('\n'):'(liste nominative : voir système de départ)'}

Saisie dans « Feuille d'équipage » de l'Atelier des systèmes (modifiable).`}; }};
D.checklist={t:'Check-lists normales',cat:'Appareil et équipage',gen(c){ const fw=AL(c.k);
  return {txt:fw?`A320 — CHECK-LISTS NORMALES (lecture « challenge / response »)

BEFORE START
  Cockpit prep ............ COMPLETED (BOTH)     Gear pins & covers ...... REMOVED
  Signs ................... ON/AUTO              ADIRS ................... NAV
  Fuel quantity ........... ____ KG CHECKED      T.O data ................ SET
  Baro ref ................ SET (BOTH)           Windows/doors ........... CLOSED (BOTH)
  Beacon .................. ON                   Thr levers .............. IDLE
  Parking brake ........... AS RQRD
AFTER START
  Anti ice ................ AS RQRD              ECAM status ............. CHECKED
  Pitch trim .............. ___ SET              Rudder trim ............. ZERO
TAXI
  Flight controls ......... CHECKED              Flap setting ............ CONF ___ (BOTH)
  Radar & pred W/S ........ ON & AUTO            ENG mode sel ............ AS RQRD
  ECAM memo ............... T.O NO BLUE
LINE-UP
  T.O RWY ................. ___ CONFIRMED (BOTH) TCAS .................... TA OR TA/RA
  Packs 1 + 2 ............. AS RQRD
APPROACH
  Briefing ................ CONFIRMED            ECAM status ............. CHECKED
  Seat belts .............. ON                   Baro ref ................ ___ SET (BOTH)
  MDA/DH .................. ___ SET (BOTH)       ENG mode sel ............ AS RQRD
LANDING
  ECAM memo ............... LDG NO BLUE
AFTER LANDING
  Flaps ................... RETRACTED            Spoilers ................ DISARMED
  APU ..................... START                Radar & pred W/S ........ OFF
PARKING
  APU bleed ............... ON                   Engines ................. OFF
  Seat belts .............. OFF                  Ext lt .................. AS RQRD
  Fuel pumps .............. OFF                  Park brk & chocks ....... AS RQRD
SECURING THE AIRCRAFT
  ADIRS ................... OFF                  Oxygen .................. OFF
  APU bleed ............... OFF                  Emer exit lt ............ OFF
  Signs ................... OFF                  APU and BAT ............. OFF`:`${c.name.toUpperCase()} — CHECK-LISTS NORMALES (résumé)

AVANT MISE EN ROUTE
  Visite prévol ........... FAITE           Carburant ............... ____ VÉRIFIÉ
  Ceintures / portes ...... ATTACHÉES / FERMÉES
  Frein rotor ............. ${c.k==='lj60'?'—':'DESSERRÉ'}         Batterie ................ ON
MISE EN ROUTE
  Anticollision ........... ON              Démarrage ............... PARAMÈTRES SURVEILLÉS
  Génératrice ............. ON              Avionique ............... ON
AVANT DÉCOLLAGE
  Paramètres moteur ....... VERT            Régime rotor ............ ${c.k==='lj60'?'—':'NOMINAL'}
  Commandes ............... LIBRES          Transpondeur ............ ALT
APRÈS ATTERRISSAGE / ARRÊT
  Refroidissement ......... 30 s à 2 min    Moteur(s) ............... OFF
  Frein rotor ............. ${c.k==='lj60'?'—':'SERRÉ (régime faible)'}    Batterie ................ OFF`}; }};
/* --- PLAN DE VOL = CHECK-LIST COMPLÈTE EN DIRECT --- */
function sentences(t){ return String(t||'').replace(/<[^>]+>/g,'').split(/(?<=[.!?])\s+(?=[A-ZÀ-Ý«(])/).map(s=>s.trim()).filter(s=>s.length>3); }
function planData(){ const on=typeof GD!=='undefined'&&GD.on&&GD.steps&&GD.steps.length; if(!on) return null; const out=[]; let tot=0, ok=0;
 GD.steps.forEach((st,i)=>{ const its=(st.items||[]).map((it,j)=>{ const d=window.CKL?CKL.done(i,j):false; tot++; if(d) ok++; return {l:it[0],d,i,j,sel:it[3],act:!!it[2]}; });
  const det=sentences(st.txt).map(s=>({l:s,d:i<GD.i&&its.every(x=>x.d)}));
  const all=its.every(x=>x.d); out.push({i,st,its,det,all,cur:i===GD.i,past:i<GD.i}); });
 return {out,tot,ok}; }
D.plan={t:'PLAN DE VOL — check-list complète (en direct)',cat:'Plan de vol',live:1,gen(c){ const pd=planData();
 if(!pd) return {html:`<p>Démarrez un parcours (appareil → parcours guidé ou automatique) : le plan de vol se remplit en direct, ligne par ligne.</p>`,txt:'Aucun parcours en cours.'};
 const pct=Math.round(pd.ok/Math.max(1,pd.tot)*100), miss=pd.out.filter(s=>s.i<=GD.i).reduce((n,s)=>n+s.its.filter(x=>!x.d).length,0);
 const html=`<div class="pl"><div class="sum"><span style="color:#0d5a2a">✓ ${pd.ok} validées</span><span style="color:#8a1410">✗ ${miss} manquante(s) jusqu'à l'étape en cours</span><span>${pd.tot} actions au total · étape ${GD.i}/${GD.steps.length-1}</span></div><div class="bar"><i style="width:${pct}%"></i></div>
  ${pd.out.map(s=>`<div class="stp ${s.cur?'cur':''} ${s.all&&s.past?'ok':''}"><div class="h"><span>${s.all&&s.past?'✓ ':''}${s.i}. ${s.st.ph} — ${s.st.t}</span><span>${s.cur?'EN COURS':s.past?(s.all?'VALIDÉE':'INCOMPLÈTE'):'À VENIR'}</span></div>
   ${s.det.map(d=>`<div class="ln d ${d.d?'g':'f'}"><i>${d.d?'✓':'·'}</i><span>${d.l}</span></div>`).join('')}
   ${s.its.map(x=>`<div class="ln ${x.d?'g':(s.i<=GD.i?'r':'f')}" ${!x.d&&s.i<=GD.i?`data-ci="${x.i}" data-cj="${x.j}"`:''}><i>${x.d?'✓':(s.i<=GD.i?'✗':'○')}</i><span><b>${x.l}</b></span>${!x.d&&s.i<=GD.i?`<small>${x.sel?'Y aller →':x.act?'Faire →':'En attente'}</small>`:''}</div>`).join('')}</div>`).join('')}</div>`;
 const txt=`PLAN DE VOL — CHECK-LIST COMPLÈTE   ${c.flt} ${c.dep}-${c.dest}   ${c.date}\n${pd.ok}/${pd.tot} actions validées\n\n`+pd.out.map(s=>`${s.i}. ${s.st.ph} — ${s.st.t}  [${s.cur?'EN COURS':s.past?(s.all?'VALIDÉE':'INCOMPLÈTE'):'À VENIR'}]\n`+s.det.map(d=>`     ${d.d?'[x]':'[ ]'} ${d.l}`).join('\n')+(s.det.length?'\n':'')+s.its.map(x=>`   ${x.d?'[X]':'[ ]'} ${x.l}`).join('\n')).join('\n\n');
 return {html,txt}; }};
/* ---------- quels documents pour quelle étape ---------- */
const MAP=[[/brief|dossier/i,['plan','ofp','fpl','metar','temsi','wintem','notam','route']],[/devis|masse|centrage/i,['loadsheet','notoc','manifest']],[/carburant/i,['fuel','ofp']],[/tour avion|visite|parking.*arriv|arrivée au parking/i,['techlog']],[/fms|perf|init/i,['perf','ofp','sid']],[/check-list|before start/i,['checklist','plan']],[/roulage|repoussage|taxi/i,['apt']],[/approche|descente|ils/i,['app','metar','atis']],[/atis|météo/i,['metar','atis']],[/décollage|alignement/i,['perf','sid']],[/arrêt|fin du vol|parking et/i,['techlog','plan']],[/croisière|océan/i,['ofp','route','wintem','temsi']]];
function forStep(st){ const c=ctx(), t=(st.t||'')+' '+(st.ph||''); let ids=[]; MAP.forEach(([re,l])=>{ if(re.test(t)) ids.push(...l); }); return [...new Set(ids)].filter(id=>avail(c,id)); }
const avail=(c,id)=>D[id]&&!(D[id].fw&&!c.fw);
/* ---------- visionneuse ---------- */
let CUR='plan', GOTO=null, REL=[], TMR=0;
function open(id,opt){ opt=opt||{}; GOTO=opt.go!=null?opt.go:null; REL=opt.rel||[]; CUR=id||(REL[0])||'plan'; let v=document.getElementById('docv');
 if(!v){ v=document.createElement('section'); v.id='docv'; v.hidden=true; document.body.appendChild(v);
  v.addEventListener('click',e=>{ const b=e.target.closest('button,[data-ci]'); if(!b) return; const d=b.dataset;
   if(d.ci!=null){ close(); if(window.CKL) CKL.go(+d.ci,+d.cj); return; }
   if(d.doc){ CUR=d.doc; render(); return; } if(d.x!=null) return close(); if(d.pdf!=null) return dl('pdf'); if(d.txt!=null) return dl('txt'); if(d.svg!=null) return dl('svg'); if(d.pr!=null){ try{ window.print(); }catch(e){} return; }
   if(d.go!=null){ const k=GOTO; close(); if(window.JUMP) JUMP(k,(typeof AUTO!=='undefined'&&AUTO.on)?'auto':'guide'); } }); }
 v.hidden=false; render(); clearInterval(TMR); TMR=setInterval(()=>{ if(v.hidden){ clearInterval(TMR); return; } if(D[CUR]&&D[CUR].live) render(true); },1000); }
function close(){ const v=document.getElementById('docv'); if(v) v.hidden=true; clearInterval(TMR); }
function render(soft){ const v=document.getElementById('docv'), c=ctx(), doc=D[CUR], out=doc.gen(c);
 if(soft){ const pp=v.querySelector('.paper .body'); if(pp&&out.html&&pp._h!==out.html){ const sc=v.querySelector('.pg').scrollTop; pp.innerHTML=out.html; pp._h=out.html; v.querySelector('.pg').scrollTop=sc; } return; }
 const cats=[...new Set(Object.values(D).map(x=>x.cat))], step=GOTO!=null&&typeof GD!=='undefined'?GD.steps[GOTO]:null;
 v.innerHTML=`<div class="hd"><div class="tt"><b>📁 Dossier de vol · ${c.flt} · ${c.dep} → ${c.dest}</b><small>${c.name} · ${c.reg} · ${c.date}${step?` · documents de l'étape ${GOTO} « ${step.t} »`:''}</small></div>
  ${GOTO!=null?`<button type="button" class="go" data-go>▶ Aller à l'étape ${GOTO}</button>`:''}<button type="button" data-pdf>⬇ PDF</button><button type="button" data-txt>⬇ TXT</button>${doc.svg?'<button type="button" data-svg>⬇ SVG</button>':''}<button type="button" data-pr>🖨</button><button type="button" data-x>✕</button></div>
  <div class="main"><nav>${cats.map(ct=>`<h5>${ct}</h5>`+Object.keys(D).filter(id=>D[id].cat===ct&&avail(c,id)).map(id=>`<button type="button" data-doc="${id}" class="${id===CUR?'on':''} ${REL.includes(id)?'rel':''}">${REL.includes(id)?'📌 ':''}${D[id].t}</button>`).join('')).join('')}</nav>
  <div class="pg"><div class="paper"><h2>${doc.t}</h2><div class="sub">${c.flt} · ${c.type} ${c.reg} · ${c.dep} → ${c.dest} · ${c.date}${doc.live?' · mis à jour en direct':''}</div><div class="body">${out.html||(out.svg?out.svg+(out.txt?`<pre style="margin-top:8px">${esc(out.txt)}</pre>`:''):`<pre>${esc(out.txt)}</pre>`)}</div>${CUR==='plan'?'':`<div class="note">${NOTE}</div>`}</div></div></div>`;
 const nb=v.querySelector('nav .on'); if(nb) nb.scrollIntoView({block:'nearest',inline:'center'}); }
const esc=s=>String(s).replace(/[&<>]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]));
/* ---------- export ---------- */
function save(name,blob){ const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; document.body.appendChild(a); a.click(); setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); },1500); }
function dl(kind){ const c=ctx(), doc=D[CUR], out=doc.gen(c), base=`${c.flt}_${CUR}`; const txt=`${doc.t}\n${c.flt} ${c.type} ${c.reg} ${c.dep}-${c.dest} ${c.date}\n${'='.repeat(70)}\n\n${out.txt||''}\n\n${CUR==='plan'?'':NOTE}`;
 if(kind==='txt') save(base+'.txt',new Blob(['\ufeff'+txt],{type:'text/plain;charset=utf-8'}));
 else if(kind==='svg'&&out.svg) save(base+'.svg',new Blob([out.svg],{type:'image/svg+xml'}));
 else if(kind==='pdf') save(base+'.pdf',pdf(txt)); flashMsg('Téléchargement : '+base+'.'+kind); }
function flashMsg(t){ try{ flash(t,'am'); }catch(e){} }
/* générateur PDF minimal : texte monospace (Courier, WinAnsi), A4, pagination */
function pdf(text){ const MAP={'→':'->','←':'<-','≥':'>=','≤':'<=','⚠':'!','✓':'v','✗':'x','○':'o','·':'\u00b7','’':"'",'‘':"'",'“':'"','”':'"','…':'\u0085','–':'\u0096','—':'\u0097','œ':'\u009c','Œ':'\u008c','€':'\u0080','\u202f':' ','\u00a0':' ','📌':'*','📁':'','🖨':'','′':"'"};
 const clean=s=>[...s].map(ch=>MAP[ch]!=null?MAP[ch]:(ch.charCodeAt(0)<256?ch:'?')).join('');
 const lines=[]; clean(text).split('\n').forEach(l=>{ while(l.length>92){ lines.push(l.slice(0,92)); l='  '+l.slice(92); } lines.push(l); });
 const per=62, pages=[]; for(let i=0;i<lines.length;i+=per) pages.push(lines.slice(i,i+per)); if(!pages.length) pages.push(['']);
 const escp=s=>s.replace(/\\/g,'\\\\').replace(/\(/g,'\\(').replace(/\)/g,'\\)').replace(/[\u0080-\u00ff]/g,ch=>'\\'+ch.charCodeAt(0).toString(8).padStart(3,'0'));
 const objs=[]; const add=s=>{ objs.push(s); return objs.length; };
 const font=add('<< /Type /Font /Subtype /Type1 /BaseFont /Courier /Encoding /WinAnsiEncoding >>'), fontB=add('<< /Type /Font /Subtype /Type1 /BaseFont /Courier-Bold /Encoding /WinAnsiEncoding >>');
 const pagesId=objs.length+1+pages.length*2; const kids=[];
 pages.forEach((pl,pi)=>{ let st=`BT /F1 9 Tf 11 TL 40 800 Td `; pl.forEach((l,li)=>{ st+=(pi===0&&li===0?`/F2 11 Tf (${escp(l)}) Tj /F1 9 Tf T* `:`(${escp(l)}) Tj T* `); }); st+=`ET BT /F1 7 Tf 40 24 Td (${escp('Simulateur PLANE TRAJECTORIES - document pedagogique - page '+(pi+1)+'/'+pages.length)}) Tj ET`;
  const cs=add(`<< /Length ${st.length} >>\nstream\n${st}\nendstream`); const pg=add(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${font} 0 R /F2 ${fontB} 0 R >> >> /Contents ${cs} 0 R >>`); kids.push(pg); });
 add(`<< /Type /Pages /Kids [${kids.map(k=>k+' 0 R').join(' ')}] /Count ${kids.length} >>`); const cat=add(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);
 let out='%PDF-1.4\n%\u00e2\u00e3\u00cf\u00d3\n'; const off=[]; objs.forEach((o,i)=>{ off.push(out.length); out+=`${i+1} 0 obj\n${o}\nendobj\n`; });
 const x=out.length; out+=`xref\n0 ${objs.length+1}\n0000000000 65535 f \n`+off.map(o=>String(o).padStart(10,'0')+' 00000 n \n').join('')+`trailer\n<< /Size ${objs.length+1} /Root ${cat} 0 R >>\nstartxref\n${x}\n%%EOF`;
 const bytes=new Uint8Array(out.length); for(let i=0;i<out.length;i++) bytes[i]=out.charCodeAt(i)&255; return new Blob([bytes],{type:'application/pdf'}); }
/* ---------- points d'accès ---------- */
// 1) sélecteur d'étapes : les étapes « documents » ouvrent les documents
setInterval(()=>{ const m=document.getElementById('jmp'); if(!m||typeof GD==='undefined') return; m.querySelectorAll('.st[data-k]').forEach(b=>{ if(b._dc) return; b._dc=1; const st=GD.steps[+b.dataset.k]; const ids=st?forStep(st):[]; if(ids.length){ b.dataset.docs=ids.join(','); b.insertAdjacentHTML('beforeend',`<span class="dc">📄 ${ids.length} doc.</span>`); } }); },300);
document.addEventListener('click',e=>{ const b=e.target.closest('#jmp .st[data-docs]'); if(!b) return; e.stopPropagation(); e.preventDefault(); const k=+b.dataset.k, rel=b.dataset.docs.split(','); const m=document.getElementById('jmp'); if(m) m.remove(); open(rel[0],{go:k,rel}); },true);
// 2) panneau guide et bulle : bouton « Documents » quand l'étape en a
setInterval(()=>{ if(typeof GD==='undefined'||!GD.on||!GD.steps) return; const st=GD.steps[GD.i]; const ids=st?forStep(st):[];
 [['#guide .gf','g-docs'],['#abub','ab-docs']].forEach(([q,id])=>{ const host=document.querySelector(q); if(!host) return; let b=host.querySelector('#'+id);
  if(!ids.length){ if(b) b.remove(); return; } if(!b){ b=document.createElement('button'); b.type='button'; b.id=id; b.className='mini'; b.style.cssText='background:#e04ad8;border-color:#e04ad8;color:#fff'; b.onclick=e=>{ e.stopPropagation(); open(b._ids[0],{rel:b._ids}); }; if(q==='#abub'){ const t=host.querySelector('.ab')||host; t.appendChild(b); } else host.prepend(b); }
  b._ids=ids; const t='📄 Documents ('+ids.length+')'; if(b.textContent!==t) b.textContent=t; }); },700);
// 3) barre : dossier complet
function barBtn(){ const m=document.getElementById('b-menu'); if(!m||document.getElementById('b-docs')) return; const b=document.createElement('button'); b.type='button'; b.id='b-docs'; b.textContent='📁 Documents'; b.onclick=()=>open('plan'); m.parentNode.insertBefore(b,m.nextSibling); }
setInterval(barBtn,1000); barBtn();
window.DOCS={open,list:()=>Object.keys(D),forStep};
})();
