/* ===== ATELIER DES SYSTÈMES : simulateur pédagogique bouton → pièce =====
   À gauche les commandes réelles du poste, au centre l'écran système (type ECAM / VEMD), à droite le schéma de l'appareil.
   Chaque commande colore les pièces qu'elle actionne réellement : électricité, électronique, carburant, hydraulique, air, mécanique, allumage, feux.
   La logique de fonctionnement est simulée (ordre des actions, conditions, temporisations accélérées). Valeurs indicatives [SIMULÉ]. */
(function(){
const C={el:'#3fd0ff',dat:'#b48cff',fu:'#ffa21a',hg:'#3ddc84',hb:'#4a8bff',hy:'#ffe14a',ah:'#ff4a3d',ac:'#cfe9ff',me:'#e04ad8',ig:'#fff38a',hot:'#ff7a2a',oil:'#c58b4a',lt:'#ffffff',lr:'#ff3b30',lg:'#3ddc84',fire:'#ff1f1f',grn:'#3ddc84',warn:'#ffa21a'};
const LEGN={el:'Électricité (courant continu / alternatif)',dat:'Électronique : calculateurs, signaux',fu:'Carburant',hg:'Hydraulique vert',hb:'Hydraulique bleu',hy:'Hydraulique jaune',ah:'Air chaud prélevé (bleed)',ac:'Air conditionné, cabine',me:'Mouvement mécanique',ig:'Allumage (étincelles)',hot:'Combustion, gaz chauds',oil:'Huile, transmission',lt:'Éclairage extérieur',fire:'Feu, alarme'};
const css=document.createElement('style'); css.textContent=`
#sysat[hidden]{display:none!important}
#sysat{position:fixed;inset:0;z-index:72;background:#050a10;color:#e8eef2;display:flex;flex-direction:column;font:14px/1.45 'Inter',system-ui,sans-serif}
#sysat header{display:flex;flex-wrap:wrap;align-items:center;gap:6px;padding:7px 9px;border-bottom:1px solid #1d2f40;background:#08111a}
#sysat header .tt{flex:1 1 180px;min-width:0}#sysat header .tt b{display:block;font:700 19px 'Barlow Condensed',sans-serif;letter-spacing:.05em;text-transform:uppercase}#sysat header .tt span{color:#8fa4b8;font-size:12px}
#sysat button,#sysat select{background:#132232;color:#fff;border:1px solid #2b3d50;border-radius:8px;padding:6px 9px;font:600 13px 'Barlow Condensed',sans-serif;letter-spacing:.04em;cursor:pointer}
#sysat .modes{flex:1 1 100%;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:5px}#sysat .modes i{font-style:normal}#sysat .dlg{grid-column:1/3;display:flex;gap:8px;align-items:center;background:#05080c;border:1px solid #2b3d50;border-radius:10px;padding:6px 8px;min-height:46px}#sysat .dlg[hidden]{display:none}#sysat .dlg .av{flex:none;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:19px;border:2px solid currentColor}#sysat .dlg .tx{flex:1;min-width:0;font-size:13px;line-height:1.3}#sysat .dlg .tx b{display:block;font:700 11px 'Barlow Condensed',sans-serif;letter-spacing:.1em;text-transform:uppercase}#sysat .dlg .tx span{display:block;color:#fff}#sysat .dlg .tx small{display:block;color:#8fa4b8;font-size:11.5px}#sysat .dlg.ao .tx span,#sysat .dlg.ao .tx small{display:none}#sysat .dlg .db{display:flex;flex-direction:column;gap:3px}#sysat .dlg .db button{padding:2px 6px;font-size:13px}#sysat .dlg .db button.off{opacity:.45}
#sysat .strip{grid-column:1/3;font:600 13px/1.3 'Inter',sans-serif;padding:6px 8px;border-radius:8px;background:#16091a;border:2px solid #e04ad8}#sysat .strip.auto{border-color:#3ddc84;background:#071a10}#sysat .strip.exam{border-color:#ff3b30;background:#1a0707}#sysat .strip b{color:#fff}#sysat .modes button{padding:8px 4px;font-size:14px}#sysat .modes button.on{background:#e04ad8;border-color:#e04ad8}
#sysat .modes button[data-mode=auto].on{background:#1f8a4c;border-color:#3ddc84}#sysat .modes button[data-mode=exam].on{background:#b3261e;border-color:#ff3b30}
#sysat .pre{flex:1 1 100%;flex-wrap:nowrap;overflow-x:auto}#sysat .pre button{font-size:12px;padding:5px 8px}
#sysat .fneed{outline:3px solid #ff2b2b!important;outline-offset:3px;border-radius:8px;animation:safn 0.9s ease-in-out infinite}@keyframes safn{50%{outline-color:#ff2b2b44;box-shadow:0 0 14px #ff2b2b}}
#sysat .fok{outline:3px solid #3ddc84!important;outline-offset:3px;border-radius:8px;box-shadow:0 0 14px #3ddc84}
#sysat .fbad{outline:3px solid #ff2b2b!important;outline-offset:3px;border-radius:8px;background:#ff2b2b33!important;animation:saflash .4s 3}
#sysat .tour.auto{border-color:#3ddc84;background:#071a10}#sysat .tour.auto b.t{color:#3ddc84}#sysat .tour.exam{border-color:#ff3b30;background:#1a0707}#sysat .tour.exam b.t{color:#ff6a60}
#sysat .phb{display:flex;flex-wrap:wrap;gap:3px;margin:5px 0}#sysat .phb span{font:600 10.5px 'Barlow Condensed',sans-serif;letter-spacing:.04em;text-transform:uppercase;padding:2px 6px;border-radius:999px;background:#1d2f40;color:#8fa4b8}#sysat .phb span.dn{background:#1f8a4c55;color:#9ff0bf}#sysat .phb span.cur{background:#e04ad8;color:#fff}
#sysat .errtag{display:inline-block;margin:4px 0;padding:2px 8px;border-radius:6px;background:#ff3b30;color:#fff;font:700 12px 'Barlow Condensed',sans-serif;letter-spacing:.1em}#sysat .tour .an{border-left:3px solid #ffa21a;padding-left:8px;margin:6px 0}#sysat .tour .an p{margin:4px 0;font-size:13.5px}
#sysat .tour .res{font:700 30px 'Barlow Condensed',sans-serif}#sysat .tour ul{margin:4px 0;padding-left:18px;font-size:13px}
#sysat .hrow{display:flex;gap:4px;align-items:center;flex-wrap:wrap}#sysat .pre{display:flex;gap:4px;flex-wrap:wrap}#sysat header button{white-space:nowrap}#sysat .pre button.on{background:#e04ad8;border-color:#e04ad8}
#sysat .main{flex:1;min-height:0;display:grid;grid-template-columns:minmax(280px,340px) minmax(300px,1fr) minmax(300px,1fr);grid-template-areas:"ctl mid sch";overflow:hidden}
#sysat .ctl{grid-area:ctl;overflow:auto;padding:8px;border-right:1px solid #1d2f40;background:#07101a}
#sysat .mid{grid-area:mid;overflow:auto;padding:8px;display:flex;flex-direction:column;gap:8px}
#sysat .sch{grid-area:sch;overflow:auto;padding:8px;border-left:1px solid #1d2f40;display:flex;flex-direction:column;gap:6px}
#sysat .sch svg.ac{width:100%;max-height:calc(100vh - 170px);background:radial-gradient(#0c1a28,#060c12);border:1px solid #1d2f40;border-radius:10px;touch-action:manipulation}
#sysat .grp{border:1px solid #1d2f40;border-radius:10px;margin:0 0 8px;background:#0a1520}
#sysat .grp h4{margin:0;padding:6px 9px;font:700 13px 'Barlow Condensed',sans-serif;letter-spacing:.12em;color:#9fb3c4;text-transform:uppercase;border-bottom:1px solid #1d2f40;display:flex;justify-content:space-between}
#sysat .grp h4 small{color:#5f7d99;letter-spacing:.04em;font-weight:500}
#sysat .row{display:flex;flex-wrap:wrap;gap:6px;padding:8px}
#sysat .pb{width:74px;display:flex;flex-direction:column;align-items:center;gap:3px;background:none;border:0;padding:0;cursor:pointer;color:#e8eef2}
#sysat .pb .k{width:56px;height:44px;border-radius:5px;background:linear-gradient(#2b3540,#1a2129);border:2px solid #4a5866;display:flex;flex-direction:column;justify-content:space-around;align-items:center;font:700 10.5px 'JetBrains Mono',monospace;box-shadow:inset 0 -3px 0 #0006}
#sysat .pb:active .k{transform:translateY(1px)}#sysat .pb .k i{font-style:normal;min-height:12px;letter-spacing:.02em}
#sysat .pb .l{font:600 11px 'Barlow Condensed',sans-serif;letter-spacing:.04em;text-align:center;line-height:1.1;color:#cfd8df}
#sysat .pb.mom .k{border-radius:50%;width:46px}#sysat .pb.grd .k{outline:2px dashed #ff3b3088;outline-offset:2px}
#sysat .sel{display:flex;flex-direction:column;gap:3px;min-width:0}#sysat .sel .l{font:600 11px 'Barlow Condensed',sans-serif;letter-spacing:.04em;color:#cfd8df}
#sysat .seg{display:flex;border:1px solid #2b3d50;border-radius:8px;overflow:hidden}#sysat .seg button{border:0;border-radius:0;padding:6px 8px;background:#101c28;font-size:12px}#sysat .seg button+button{border-left:1px solid #2b3d50}
#sysat .seg button.on{background:#e8eef2;color:#061018}#sysat .ctl .flash{animation:saflash .5s 4}@keyframes saflash{50%{box-shadow:0 0 0 3px #e04ad8;background:#e04ad855}}
#sysat .tabs{display:flex;flex-wrap:wrap;gap:3px}#sysat .tabs button{padding:4px 7px;font-size:12px;background:#0d1924}#sysat .tabs button.on{background:#3fd0ff;color:#041018;border-color:#3fd0ff}
#sysat .scr{background:#000;border:6px solid #1c232b;border-radius:10px;box-shadow:inset 0 0 0 1px #333}
#sysat .scr svg{display:block;width:100%;height:auto}#sysat .scr svg text{font-family:'JetBrains Mono',monospace}
#sysat .ex{border:1px solid #1d2f40;border-radius:10px;background:#0a1520;padding:9px 11px}
#sysat .ex h3{margin:0;font:700 19px 'Barlow Condensed',sans-serif;color:#fff}#sysat .ex .w{color:#8fa4b8;font-size:12.5px;margin:1px 0 6px}
#sysat .ex ol{margin:4px 0;padding-left:0;list-style:none;counter-reset:x}#sysat .ex li{display:flex;gap:7px;margin:5px 0;align-items:flex-start}
#sysat .ex li i{flex:none;width:12px;height:12px;border-radius:3px;margin-top:4px;box-shadow:0 0 6px currentColor}
#sysat .ex .blk{border:1px solid #ffa21a;background:#2a1a05;color:#ffd9a8;border-radius:8px;padding:7px 9px;margin:6px 0;animation:sablk 1s ease-in-out 3}
@keyframes sablk{50%{box-shadow:0 0 0 3px #ffa21a66}}#sysat .ex .blk button{margin-top:5px;background:#ffa21a;color:#1a0f00;border:0}
#sysat .ex .live{font:12.5px 'JetBrains Mono',monospace;color:#9fe8b8;margin-top:6px;white-space:pre-line}
#sysat .chips{display:flex;flex-wrap:wrap;gap:4px;margin-top:6px}#sysat .chips button{font:500 12px 'Inter',sans-serif;padding:3px 7px;border-radius:999px;letter-spacing:0}
#sysat .leg{display:flex;flex-wrap:wrap;gap:4px 10px;font-size:11.5px;color:#b8c6d2}#sysat .leg span{display:inline-flex;align-items:center;gap:4px}#sysat .leg i{width:10px;height:10px;border-radius:2px;display:inline-block}
#sysat .pinfo{border:1px solid #1d2f40;border-radius:10px;padding:7px 9px;background:#0a1520;font-size:13px}#sysat .pinfo b{color:#fff}
#sysat .tour{border:2px solid #e04ad8;border-radius:10px;background:#16091a;padding:9px 11px}#sysat .tour b.t{display:block;font:700 13px 'Barlow Condensed',sans-serif;letter-spacing:.12em;color:#e04ad8;text-transform:uppercase}
#sysat .tour p{margin:4px 0}#sysat .tour .bt{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}#sysat .tour .go{background:#e04ad8;border:0}#sysat .tour .wt{color:#ffd9a8;font-size:12.5px}
#sysat svg.ac .bd{fill:#0f1e2c;stroke:#5f7d99;stroke-width:1.1}#sysat svg.ac .bdl{fill:none;stroke:#5f7d99;stroke-width:1.4}
#sysat svg.ac .sp{fill:#152a3d;stroke:#3d5870;stroke-width:.7;cursor:pointer}#sysat svg.ac .sp.ring{fill:none;stroke:none}
#sysat svg.ac .sf{fill:none;stroke:#1f3346;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;cursor:pointer}
#sysat svg.ac .on.sp{fill:var(--c);fill-opacity:.8;stroke:var(--c);stroke-width:1}#sysat svg.ac .on.sp.ring{fill:none;stroke-width:2}
#sysat svg.ac .on.dim.sp{fill-opacity:.3}#sysat svg.ac .on.sf{stroke:var(--c);stroke-width:2.4}
#sysat svg.ac .on.flow{stroke-dasharray:5 4;animation:saf .7s linear infinite}#sysat svg.ac .on.rev{stroke-dasharray:5 4;animation:saf .7s linear infinite reverse}
@keyframes saf{to{stroke-dashoffset:-9}}#sysat svg.ac .on.blink{animation:sab .6s steps(2,start) infinite}@keyframes sab{50%{opacity:.12}}
#sysat svg.ac .on.spin{animation:sar var(--sp,.4s) linear infinite;transform-box:view-box}@keyframes sar{to{transform:rotate(360deg)}}
#sysat svg.ac .tch{stroke:#fff!important;stroke-width:2.2!important;filter:drop-shadow(0 0 4px #fff)}
#sysat svg.ac .tags text{fill:#fff;font:600 9px 'Inter',sans-serif;paint-order:stroke;stroke:#000;stroke-width:3px}#sysat svg.ac .tags line{stroke:#fff;stroke-width:.7;stroke-dasharray:2 2}
#sysat svg.ac .hud{fill:#e8eef2;font:700 10px 'JetBrains Mono',monospace;paint-order:stroke;stroke:#000;stroke-width:3px}#sysat svg.ac .actors text{fill:#fff;font:700 7.5px 'Inter',sans-serif;paint-order:stroke;stroke:#000;stroke-width:2.5px}#sysat svg.ac .env *{pointer-events:none}
#sysat svg.ac .lbl{fill:#6f8aa3;font:600 8px 'Inter',sans-serif;pointer-events:none}
#samenu{display:flex;gap:12px;align-items:center;width:100%;text-align:left;margin:4px 0;padding:11px 14px;border-radius:12px;border:1px solid #3fd0ff;background:linear-gradient(90deg,#062033,#0a141e);color:#fff;cursor:pointer;font:500 14px 'Inter',sans-serif}
#samenu b{display:block;font:700 19px 'Barlow Condensed',sans-serif;letter-spacing:.04em}#samenu .e{font-size:28px}
@media (max-width:900px){
 #sysat .main{display:block;overflow:auto}
 #sysat .top>*{grid-area:auto!important}#sysat .top>.strip,#sysat .top>.dlg{grid-column:1/3!important}#sysat header .tt{flex:1 1 120px}#sysat header .tt b{font-size:16px}#sysat .modes button{font-size:12.5px;padding:7px 2px;overflow:hidden}#sysat .modes i{display:none}#sysat header .tt b{font-size:15px}#sysat header .tt .tl{display:none}#sysat header .tt{flex:1 1 90px}#sysat header select{max-width:40vw;font-size:12px}#sysat header{gap:4px}#sysat header select{max-width:46vw}
 #sysat .top{position:sticky;top:0;z-index:3;display:grid;grid-template-columns:58% 42%;gap:4px;background:#050a10;padding:4px;border-bottom:1px solid #1d2f40}
 #sysat .sch,#sysat .mid,#sysat .ctl{overflow:visible;border:0}
 #sysat .top .sch{padding:0}#sysat .top .sch svg.ac{max-height:36vh;height:36vh}
 #sysat .top .scrw{display:flex;flex-direction:column;gap:3px;min-width:0}#sysat .top .scr{border-width:3px}
 #sysat .top .tabs button{padding:3px 5px;font-size:10.5px}
 #sysat .ctl{padding:6px}#sysat .pb{width:66px}#sysat .pb .k{width:52px;height:40px}
 #sysat header .tt span{display:none}
}`;
document.head.appendChild(css);

/* ---------- outils SVG ---------- */
const MOD={}; let M=null, S=null, K=null, D=null, AC='a320', LAST=null, LASTV=null, PAGE='', TCH=[], tTch=0, TOUR=null, TI=0, PRE='cold', timer=0, tPrev=0, exPrev='', pgPrev='';
const mir=(d,W=400)=>{ let cmd='',k=0; return d.match(/[MLHVCQZ]|-?\d+(\.\d+)?/g).map(x=>{ if(/[A-Z]/.test(x)){ cmd=x; k=0; return x; } const n=+x; if(cmd==='H') return W-n; if(cmd==='V') return n; return (k++%2===0)?W-n:n; }).join(' '); };
const P=(id,d,c='sp')=>`<path data-p="${id}" class="${c}" d="${d}"/>`, F=(id,d)=>P(id,d,'sf');
const R=(id,x,y,w,h,rx=1.5,c='sp')=>`<rect data-p="${id}" class="${c}" x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}"/>`;
const Ci=(id,x,y,r,c='sp')=>`<circle data-p="${id}" class="${c}" cx="${x}" cy="${y}" r="${r}"/>`;
const RR=(a,b,x,y,w,h,rx)=>R(a,x,y,w,h,rx)+R(b,400-x-w,y,w,h,rx), CC=(a,b,x,y,r)=>Ci(a,x,y,r)+Ci(b,400-x,y,r), PP=(a,b,d,c)=>P(a,d,c)+P(b,mir(d),c), FF=(a,b,d)=>F(a,d)+F(b,mir(d));
const Lb=(x,y,t,a='middle')=>`<text class="lbl" x="${x}" y="${y}" text-anchor="${a}">${t}</text>`;
/* écran type ECAM */
const G='#3ddc84',AM='#ffa21a',W='#f2f4f6',CY='#3fd0ff',RD='#ff3b30',MG='#e04ad8',GY='#5a6672';
const T=(x,y,t,c=W,z=11,a='start')=>`<text x="${x}" y="${y}" fill="${c}" font-size="${z}" text-anchor="${a}">${t}</text>`;
const BX=(x,y,w,h,c=W)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${c}" stroke-width="1.2"/>`;
const LN=(p,c=G,w=1.6)=>`<polyline points="${p}" fill="none" stroke="${c}" stroke-width="${w}"/>`;
const ARC=(x,y,r,v,max,lab,unit,c=G,red)=>{ const a0=Math.PI*0.8,a1=Math.PI*2.2,a=a0+(a1-a0)*Math.max(0,Math.min(1,v/max)); const px=t=>x+r*Math.cos(t),py=t=>y+r*Math.sin(t);
  return `<path d="M${px(a0)} ${py(a0)} A${r} ${r} 0 1 1 ${px(a1)} ${py(a1)}" fill="none" stroke="${W}" stroke-width="1.4"/>${red?`<path d="M${px(a0+(a1-a0)*red)} ${py(a0+(a1-a0)*red)} A${r} ${r} 0 0 1 ${px(a1)} ${py(a1)}" fill="none" stroke="${RD}" stroke-width="2.4"/>`:''}<line x1="${x}" y1="${y}" x2="${px(a)}" y2="${py(a)}" stroke="${c}" stroke-width="2.2"/>${T(x,y+r*0.75,Math.round(v)+(unit||''),c,12,'middle')}${T(x,y-r-4,lab,CY,10,'middle')}`; };
const SCR=(body,memo)=>`<svg viewBox="0 0 320 230">${body}${memo&&memo.length?`<line x1="0" y1="196" x2="320" y2="196" stroke="${GY}"/>`+memo.slice(0,3).map((m,i)=>T(6+(i%2)*160,210+Math.floor(i/2)*14,m[1],m[0],10.5)).join(''):''}</svg>`;
const OFFSCR=(why)=>`<svg viewBox="0 0 320 230"><rect width="320" height="230" fill="#000"/>${T(160,105,'ÉCRAN ÉTEINT',GY,16,'middle')}${T(160,128,why,GY,10.5,'middle')}</svg>`;

/* ================= AIRBUS A320 ================= */
(function(){
const body=`<path class="bd" d="M200 14 C214 14 222 40 222 72 V520 C222 548 212 578 200 592 C188 578 178 548 178 520 V72 C178 40 186 14 200 14 Z"/>
<path class="bd" d="M178 230 L34 318 L30 334 L178 300 Z"/><path class="bd" d="${mir('M178 230 L34 318 L30 334 L178 300 Z')}"/>
<path class="bd" d="M180 505 L118 548 L118 560 L180 540 Z"/><path class="bd" d="${mir('M180 505 L118 548 L118 560 L180 540 Z')}"/><path class="bdl" d="M200 498 V590"/>`;
const parts=
 R('cabin',182,140,36,330,6)+
 PP('tLi','tRi','M174 238 L102 282 L102 312 L174 296 Z')+PP('tLo','tRo','M98 284 L62 306 L62 322 L98 313 Z')+R('tC',181,254,38,36,3)+
 PP('slatL','slatR','M170 238 L64 302 L66 307 L170 243 Z')+PP('splL','splR','M172 286 L106 301 L106 306 L172 291 Z')+PP('flapL','flapR','M176 294 L102 311 L102 317 L176 300 Z')+PP('ailL','ailR','M94 311 L44 322 L43 329 L94 318 Z')+
 PP('elevL','elevR','M180 534 L120 554 L120 559 L180 539 Z')+R('rud',198,560,4,30,1)+
 FF('waiL','waiR','M112 271 L66 299')+
 F('f_cond','M200 312 V140')+F('f_ac','M196 82 V44')+F('f_dc','M204 73 V49')+
 F('f_gen1','M134 262 L176 252 L184 240 V87')+F('f_gen2',mir('M134 262 L176 252 L184 240 V87'))+F('f_apug','M188 558 V105')+F('f_ext','M244 110 H223')+
 FF('f_fu1','f_fu2','M160 282 L146 268 L136 262')+F('f_xf','M160 292 L176 296 H224 L240 292')+F('f_fuC','M192 276 V296 M208 276 V296')+F('f_apuf','M184 296 V558')+
 FF('f_bl1','f_bl2','M136 248 L176 246')+F('f_xb','M176 246 H224')+F('f_pk1','M184 246 V326')+F('f_pk2','M216 246 V326')+F('f_apub','M194 572 L181 552 V248')+F('f_pm','M190 326 V320 M210 326 V320')+
 FF('f_hGe','f_hYe','M122 276 L150 300 L176 330 L188 352')+F('f_hG','M188 361 V530 L150 552')+F('f_hB','M200 372 V560')+F('f_hY','M212 361 V530 L250 552')+
 F('f_hGw','M186 352 L176 300 L48 323 '+mir('M186 352 L176 300 L48 323').replace(/^M/,'M'))+F('f_hBw','M198 352 L178 295 L50 318 '+mir('M198 352 L178 295 L50 318'))+F('f_hYw','M210 352 L179 290 L52 313 '+mir('M210 352 L179 290 L52 313'))+
 F('f_rat','M222 302 L204 356')+
 P('wshield','M188 30 C194 26 206 26 212 30','sf')+R('scr',189,35,22,6,1)+R('ovh',193,45,14,4,1)+CC('probe','probe',184,50,2.2)+
 R('bat1',183,62,9,7)+R('bat2',208,62,9,7)+R('dcbus',185,73,30,5)+R('acbus1',185,82,14,5)+R('acbus2',201,82,14,5)+R('adiru',185,91,30,5)+R('fctlc',185,100,14,5)+R('fmgc',201,100,14,5)+
 Ci('ngear',200,116,4.5)+Ci('taxi',200,125,2)+R('extrcp',218,107,5,6,1)+R('gpu',244,100,24,18,3)+
 Ci('pC1',192,272,3)+Ci('pC2',208,272,3)+CC('pL1','pR1',160,276,3)+CC('pL2','pR2',160,288,3)+Ci('xfv',200,296,3.2)+
 RR('e1','e2',117,222,22,62,9)+FF('e1fan','e2fan','M119 230 H137')+RR('e1core','e2core',123,240,10,30,3)+CC('e1ig','e2ig',128,252,2)+CC('e1st','e2st',121.5,262,2.4)+RR('e1idg','e2idg',132,258,5,8,1)+RR('e1hp','e2hp',119.5,270,5,6,1)+RR('e1fadec','e2fadec',132,244,5,6,1)+
 P('e1lip','M117 226 C117 219 139 219 139 226','sf')+P('e2lip',mir('M117 226 C117 219 139 219 139 226'),'sf')+R('e1fire',120,236,16,38,4,'sp ring')+R('e2fire',264,236,16,38,4,'sp ring')+FF('e1ex','e2ex','M128 284 V298')+
 CC('lp1','lp2',146,268,2.6)+CC('ag1','ag2',146,252,2.6)+F('f_ag1','M146 252 L134 250')+
 Ci('xbv',200,246,3.2)+R('pack1',182,326,16,13,2)+R('pack2',202,326,16,13,2)+R('mixer',188,312,24,8,2)+R('ofv',217,486,5,8,1)+
 R('hG',184,352,9,9,2)+R('hB',195.5,352,9,9,2)+R('hY',207,352,9,9,2)+Ci('pB',200,368,3)+Ci('pYe',211,368,3)+R('ptu',190,376,20,5,2)+Ci('rat',224,300,3.6)+
 R('mgL',182,306,6,11,2)+R('mgR',212,306,6,11,2)+Ci('brk',185,311.5,1.6)+Ci('brk',215,311.5,1.6)+
 R('apu',192,560,16,18,4)+R('apugen',193,555,6,4,1)+R('apuflap',203,555,5,4,1)+F('apuex','M200 578 V594')+
 Ci('navL',31,328,3)+Ci('navR',369,328,3)+Ci('navT',200,594,2.5)+CC('stb','stb',35,321,2)+Ci('stb',200,588,1.8)+Ci('bcn',200,226,2.6)+Ci('bcn',200,420,2.6)+CC('land','land',168,242,2.2)+CC('logo','logo',150,548,2)+[...Array(14).keys()].map(i=>Ci('masks',189,150+i*22,1.7)+Ci('masks',211,150+i*22,1.7)).join('')+R('avio2',186,109,28,4,1);
const labels=Lb(200,10,'NEZ')+Lb(60,262,'AILE GAUCHE')+Lb(340,262,'AILE DROITE')+Lb(128,214,'MOTEUR 1')+Lb(272,214,'MOTEUR 2')+Lb(238,60,'SOUTE AVIONIQUE','start')+Lb(226,570,'APU','start')+Lb(246,96,'GPU','start');
const NM={cabin:'Cabine pressurisée (fuselage entre cloisons étanches avant et arrière)',tLi:'Réservoir intérieur gauche (inner tank, caisson de voilure)',tRi:'Réservoir intérieur droit',tLo:'Réservoir extérieur gauche (outer tank)',tRo:'Réservoir extérieur droit',tC:'Réservoir central, dans le caisson central de voilure',
 slatL:'Becs de bord d\'attaque gauches (slats 1 à 5)',slatR:'Becs de bord d\'attaque droits',splL:'Spoilers gauches 1 à 5 (destructeurs de portance)',splR:'Spoilers droits 1 à 5',flapL:'Volets Fowler gauches (intérieur + extérieur)',flapR:'Volets Fowler droits',ailL:'Aileron gauche',ailR:'Aileron droit',elevL:'Gouverne de profondeur gauche',elevR:'Gouverne de profondeur droite',rud:'Gouverne de direction (sur la dérive)',
 waiL:'Antigivrage voilure gauche : becs 3-4-5 chauffés par tube piccolo',waiR:'Antigivrage voilure droit',f_cond:'Gaines de distribution d\'air conditionné (sous plancher vers cabine et poste)',f_ac:'Alimentation 115 V AC des écrans et calculateurs',f_dc:'Alimentation 28 V DC du poste',
 f_gen1:'Câble d\'alimentation IDG 1 → barre AC 1',f_gen2:'Câble d\'alimentation IDG 2 → barre AC 2',f_apug:'Câble génératrice APU → barres AC',f_ext:'Câble du groupe de parc',f_fu1:'Tuyauterie d\'alimentation moteur 1 (via vanne BP)',f_fu2:'Tuyauterie d\'alimentation moteur 2',f_xf:'Collecteur d\'intercommunication carburant',f_fuC:'Sorties des pompes du réservoir central',f_apuf:'Ligne carburant de l\'APU',
 f_bl1:'Conduit pneumatique moteur 1 : prélèvement (bleed) ou air de démarrage',f_bl2:'Conduit pneumatique moteur 2',f_xb:'Conduit d\'intercommunication pneumatique (cross bleed)',f_pk1:'Conduit vers pack 1',f_pk2:'Conduit vers pack 2',f_apub:'Conduit d\'air de l\'APU',f_pm:'Sorties des packs vers le mélangeur',
 f_hGe:'Tuyauterie verte : pompe moteur 1 → réservoir',f_hYe:'Tuyauterie jaune : pompe moteur 2 → réservoir',f_hG:'Circuit vert 3000 psi vers l\'empennage',f_hB:'Circuit bleu 3000 psi vers l\'empennage',f_hY:'Circuit jaune 3000 psi vers l\'empennage',f_hGw:'Circuit vert dans les ailes (ailerons, spoilers, volets, becs)',f_hBw:'Circuit bleu dans les ailes',f_hYw:'Circuit jaune dans les ailes',f_rat:'Ligne RAT → circuit bleu',
 wshield:'Pare-brise chauffé (film conducteur)',scr:'Six écrans (DU) : PFD, ND, E/WD, SD',ovh:'Panneau supérieur (overhead) et éclairage intégré',probe:'Sondes Pitot, prises statiques, sondes d\'incidence et TAT (réchauffées)',
 bat1:'Batterie 1 Ni-Cd 24 V 23 Ah',bat2:'Batterie 2 Ni-Cd 24 V 23 Ah',dcbus:'Barres courant continu 28 V (DC 1, DC 2, DC BAT, DC ESS) et TR',acbus1:'Barre AC 1 (115 V, 400 Hz)',acbus2:'Barre AC 2 (115 V, 400 Hz)',adiru:'ADIRU 1-2-3 : centrales anémo-barométriques (ADR) et inertielles à gyrolasers (IR)',fctlc:'Calculateurs de commandes de vol : 2 ELAC, 3 SEC, 2 FAC',fmgc:'FMGC 1 et 2 : gestion du vol, guidage, pilote automatique',
 ngear:'Atterrisseur avant (amortisseur oléopneumatique, 2 roues, orientation)',taxi:'Phare de roulage et de décollage (sur le train avant)',extrcp:'Prise de parc électrique',gpu:'Groupe de parc au sol (GPU) 115 V 400 Hz, 90 kVA',
 pC1:'Pompe du réservoir central 1 (115 V AC)',pC2:'Pompe du réservoir central 2',pL1:'Pompe de gavage aile gauche 1',pL2:'Pompe de gavage aile gauche 2',pR1:'Pompe de gavage aile droite 1',pR2:'Pompe de gavage aile droite 2',xfv:'Vanne d\'intercommunication carburant (crossfeed, moteurs électriques)',
 e1:'Nacelle moteur 1 (CFM56-5B ou LEAP-1A) : entrée d\'air, capots, inverseur',e2:'Nacelle moteur 2',e1fan:'Soufflante (fan), attelage basse pression N1',e2fan:'Soufflante moteur 2',e1core:'Générateur de gaz : compresseur HP, chambre de combustion, turbines (attelage N2)',e2core:'Générateur de gaz moteur 2',e1ig:'Bougies d\'allumage A et B moteur 1',e2ig:'Bougies d\'allumage moteur 2',e1st:'Démarreur pneumatique moteur 1 (boîte d\'accessoires)',e2st:'Démarreur pneumatique moteur 2',
 e1idg:'IDG 1 : génératrice à entraînement intégré 90 kVA',e2idg:'IDG 2',e1hp:'Pompe hydraulique entraînée par le moteur 1 (EDP, circuit vert)',e2hp:'Pompe hydraulique moteur 2 (EDP, circuit jaune)',e1fadec:'FADEC moteur 1 (calculateur ECU double canal)',e2fadec:'FADEC moteur 2',e1lip:'Lèvre d\'entrée d\'air moteur 1 (antigivrage)',e2lip:'Lèvre d\'entrée d\'air moteur 2',e1fire:'Boucles de détection incendie moteur 1',e2fire:'Boucles de détection incendie moteur 2',e1ex:'Tuyère moteur 1',e2ex:'Tuyère moteur 2',
 lp1:'Vanne carburant basse pression (LP) moteur 1, dans le mât',lp2:'Vanne LP moteur 2',ag1:'Bouteilles d\'extincteur moteur 1 (agents 1 et 2)',ag2:'Bouteilles d\'extincteur moteur 2',f_ag1:'Ligne de décharge de l\'agent extincteur',xbv:'Vanne de cross bleed',pack1:'Pack 1 : groupe de conditionnement (échangeurs + machine à cycle à air)',pack2:'Pack 2',mixer:'Mélangeur (mixer unit)',ofv:'Vanne de décharge de pressurisation (outflow valve)',
 hG:'Réservoir hydraulique vert',hB:'Réservoir hydraulique bleu',hY:'Réservoir hydraulique jaune',pB:'Pompe électrique bleue',pYe:'Pompe électrique jaune',ptu:'PTU, unité de transfert de puissance vert ↔ jaune',rat:'RAT : éolienne de secours (pompe bleue + génératrice de secours)',
 mgL:'Atterrisseur principal gauche (2 roues)',mgR:'Atterrisseur principal droit (2 roues)',brk:'Freins carbone multidisques',apu:'APU : groupe auxiliaire de puissance (turbine à gaz dans le cône de queue)',apugen:'Génératrice de l\'APU 90 kVA',apuflap:'Volet d\'entrée d\'air de l\'APU',apuex:'Échappement APU',
 navL:'Feu de navigation gauche (rouge)',navR:'Feu de navigation droit (vert)',navT:'Feu de navigation arrière (blanc)',stb:'Feux à éclats blancs (strobes)',bcn:'Feux anticollision rouges (beacon), dessus et dessous',land:'Phares d\'atterrissage (emplanture)',logo:'Feux de logo (éclairent la dérive)',masks:'Masques à oxygène passagers (générateurs chimiques au-dessus des sièges)',avio2:'Radios VHF, transpondeur, interphone (RMP / ACP)'};

const st=v=>v; // lisibilité
const OFF=['','OFF|wh'], NONE=['',''];
const pbOff=id=>s=>s[id]?NONE:OFF;
const pbOn=(id,t='ON')=>s=>s[id]?['',t+'|cy']:NONE;
const ctl=[
 {g:'Électricité',w:'overhead · panneau ELEC (35VU)',c:[
  {id:'bat1',l:'BAT 1',t:'pb',pg:'ELEC',pt:['bat1','dcbus'],lt:pbOff('bat1')},
  {id:'bat2',l:'BAT 2',t:'pb',pg:'ELEC',pt:['bat2','dcbus'],lt:pbOff('bat2')},
  {id:'ext',l:'EXT PWR',t:'pb',pg:'ELEC',pt:['gpu','f_ext','extrcp','acbus1','acbus2'],lt:s=>s.ext&&s.ground?['','ON|cy']:(s.ground?['AVAIL|gn','']:NONE)},
  {id:'apuGen',l:'APU GEN',t:'pb',pg:'ELEC',pt:['apugen','f_apug'],lt:pbOff('apuGen')},
  {id:'gen1',l:'GEN 1',t:'pb',pg:'ELEC',pt:['e1idg','f_gen1','acbus1'],lt:pbOff('gen1')},
  {id:'gen2',l:'GEN 2',t:'pb',pg:'ELEC',pt:['e2idg','f_gen2','acbus2'],lt:pbOff('gen2')}]},
 {g:'APU',w:'overhead · panneau APU (25VU) et AIR COND (30VU)',c:[
  {id:'apuMaster',l:'APU MASTER SW',t:'pb',pg:'APU',pt:['apu','apuflap'],lt:s=>s.apuMaster?['','ON|cy']:NONE},
  {id:'apuStart',l:'APU START',t:'mom',pg:'APU',pt:['apu','bat1','bat2','f_apuf'],lt:s=>[s.apuSt===2?'AVAIL|gn':'',s.apuSt===1?'ON|cy':'']},
  {id:'apuBleed',l:'APU BLEED',t:'pb',pg:'BLEED',pt:['apu','f_apub','xbv'],lt:pbOn('apuBleed')}]},
 {g:'Carburant',w:'overhead · panneau FUEL (40VU)',c:[
  {id:'pL1',l:'L TK PUMP 1',t:'pb',pg:'FUEL',pt:['pL1','tLi'],lt:s=>pumpLt(s,'pL1')},{id:'pL2',l:'L TK PUMP 2',t:'pb',pg:'FUEL',pt:['pL2','tLi'],lt:s=>pumpLt(s,'pL2')},
  {id:'pC1',l:'CTR TK PUMP 1',t:'pb',pg:'FUEL',pt:['pC1','tC'],lt:s=>pumpLt(s,'pC1')},{id:'pC2',l:'CTR TK PUMP 2',t:'pb',pg:'FUEL',pt:['pC2','tC'],lt:s=>pumpLt(s,'pC2')},
  {id:'pR1',l:'R TK PUMP 1',t:'pb',pg:'FUEL',pt:['pR1','tRi'],lt:s=>pumpLt(s,'pR1')},{id:'pR2',l:'R TK PUMP 2',t:'pb',pg:'FUEL',pt:['pR2','tRi'],lt:s=>pumpLt(s,'pR2')},
  {id:'xfeed',l:'X FEED',t:'pb',pg:'FUEL',pt:['xfv','f_xf'],lt:s=>s.xfeed?['OPEN|gn','ON|cy']:NONE}]},
 {g:'Démarrage moteurs',w:'pylône central (pedestal) · panneau ENG',c:[
  {id:'eMode',l:'ENG MODE',t:'sel',o:['CRANK','NORM','IGN'],ol:['CRANK','NORM','IGN/START'],pg:'ENG',pt:['e1fadec','e2fadec']},
  {id:'m1',l:'ENG 1 MASTER',t:'sw',pg:'ENG',pt:['lp1','e1st','e1ig','e1core','e1fadec']},
  {id:'m2',l:'ENG 2 MASTER',t:'sw',pg:'ENG',pt:['lp2','e2st','e2ig','e2core','e2fadec']},
  {id:'thr',l:'MANETTES DE POUSSÉE',t:'sel',o:['IDLE','CL','TOGA'],ol:['IDLE','CL','TOGA'],pg:'ENG',pt:['e1fadec','e2fadec','e1core','e2core','e1fan','e2fan']}]},
 {g:'Air · conditionnement',w:'overhead · panneau AIR COND (30VU)',c:[
  {id:'b1',l:'ENG 1 BLEED',t:'pb',pg:'BLEED',pt:['f_bl1','e1core'],lt:pbOff('b1')},{id:'b2',l:'ENG 2 BLEED',t:'pb',pg:'BLEED',pt:['f_bl2','e2core'],lt:pbOff('b2')},
  {id:'xbleed',l:'X BLEED',t:'sel',o:['SHUT','AUTO','OPEN'],ol:['SHUT','AUTO','OPEN'],pg:'BLEED',pt:['xbv','f_xb']},
  {id:'pack1',l:'PACK 1',t:'pb',pg:'BLEED',pt:['pack1','mixer','f_cond'],lt:pbOff('pack1')},{id:'pack2',l:'PACK 2',t:'pb',pg:'BLEED',pt:['pack2','mixer','f_cond'],lt:pbOff('pack2')},
  {id:'ditch',l:'DITCHING',t:'pb',pg:'PRESS',pt:['ofv','pack1','pack2'],lt:pbOn('ditch')}]},
 {g:'Hydraulique',w:'overhead · panneau HYD (40VU)',c:[
  {id:'hEP1',l:'G ENG 1 PUMP',t:'pb',pg:'HYD',pt:['e1hp','f_hGe','hG'],lt:pbOff('hEP1')},
  {id:'hBE',l:'BLUE ELEC PUMP',t:'pb',pg:'HYD',pt:['pB','hB'],lt:pbOff('hBE')},
  {id:'hEP2',l:'Y ENG 2 PUMP',t:'pb',pg:'HYD',pt:['e2hp','f_hYe','hY'],lt:pbOff('hEP2')},
  {id:'hYE',l:'Y ELEC PUMP',t:'pb',pg:'HYD',pt:['pYe','hY'],lt:pbOn('hYE')},
  {id:'ptu',l:'PTU',t:'pb',pg:'HYD',pt:['ptu','hG','hY'],lt:pbOff('ptu')},
  {id:'rat',l:'RAT MAN ON',t:'mom',grd:1,pg:'HYD',pt:['rat','f_rat','hB'],lt:s=>s.rat?['','ON|cy']:NONE}]},
 {g:'Antigivrage · sondes',w:'overhead · ANTI ICE (30VU)',c:[
  {id:'wai',l:'WING ANTI ICE',t:'pb',pg:'BLEED',pt:['waiL','waiR'],lt:pbOn('wai')},
  {id:'eai1',l:'ENG 1 ANTI ICE',t:'pb',pg:'BLEED',pt:['e1lip'],lt:pbOn('eai1')},{id:'eai2',l:'ENG 2 ANTI ICE',t:'pb',pg:'BLEED',pt:['e2lip'],lt:pbOn('eai2')},
  {id:'probe',l:'PROBE / WINDOW HEAT',t:'pb',pg:'ELEC',pt:['probe','wshield'],lt:pbOn('probe')}]},
 {g:'Navigation inertielle',w:'overhead · ADIRS (49VU)',c:[
  {id:'ir1',l:'IR 1',t:'sel',o:['OFF','NAV','ATT'],ol:['OFF','NAV','ATT'],pg:'ELEC',pt:['adiru','probe']},
  {id:'ir2',l:'IR 2',t:'sel',o:['OFF','NAV','ATT'],ol:['OFF','NAV','ATT'],pg:'ELEC',pt:['adiru','probe']},
  {id:'ir3',l:'IR 3',t:'sel',o:['OFF','NAV','ATT'],ol:['OFF','NAV','ATT'],pg:'ELEC',pt:['adiru','probe']}]},
 {g:'Feux extérieurs',w:'overhead · EXT LT (25VU)',c:[
  {id:'beacon',l:'BEACON',t:'sel',o:[false,true],ol:['OFF','ON'],pg:'FEUX',pt:['bcn']},
  {id:'strobe',l:'STROBE',t:'sel',o:['OFF','AUTO','ON'],ol:['OFF','AUTO','ON'],pg:'FEUX',pt:['stb']},
  {id:'nav',l:'NAV & LOGO',t:'sel',o:[false,true],ol:['OFF','ON'],pg:'FEUX',pt:['navL','navR','navT','logo']},
  {id:'land',l:'LAND',t:'sel',o:[false,true],ol:['RETRACT','ON'],pg:'FEUX',pt:['land']},
  {id:'taxi',l:'NOSE',t:'sel',o:['OFF','TAXI','T.O'],ol:['OFF','TAXI','T.O'],pg:'FEUX',pt:['taxi']}]},
 {g:'Commandes de vol · train',w:'mini-manche, palonnier, pedestal, planche de bord',c:[
  {id:'stick',l:'MINI-MANCHE',t:'pad',o:[['L','◀ gauche'],['R','droite ▶'],['F','▲ piquer'],['A','▼ cabrer']],pg:'F/CTL',pt:['fctlc','ailL','ailR','splL','splR','elevL','elevR']},
  {id:'ped',l:'PALONNIER',t:'pad',o:[['L','◀ pied gauche'],['R','pied droit ▶']],pg:'F/CTL',pt:['fctlc','rud']},
  {id:'flaps',l:'LEVIER VOLETS',t:'sel',o:[0,1,2,3,4],ol:['0','1','2','3','FULL'],pg:'F/CTL',pt:['flapL','flapR','slatL','slatR']},
  {id:'spd',l:'AÉROFREINS',t:'sel',o:[0,1],ol:['RET','FULL'],pg:'F/CTL',pt:['splL','splR']},
  {id:'gear',l:'LEVIER DE TRAIN',t:'sel',o:['UP','DOWN'],ol:['UP','DOWN'],pg:'WHEEL',pt:['ngear','mgL','mgR']},
  {id:'pbrake',l:'PARK BRK',t:'sel',o:[false,true],ol:['OFF','ON'],pg:'WHEEL',pt:['brk']}]},
 {g:'Communications · cabine',w:'pylône (RMP, ACP), overhead (SIGNS, CALLS)',c:[
  {id:'ptt',l:'VHF 1 · ALTERNAT',t:'mom',pg:'ELEC',pt:['avio2','scr']},
  {id:'callMech',l:'CALL MECH',t:'mom',pg:'ELEC',pt:['ngear']},
  {id:'callFwd',l:'CALL FWD',t:'mom',pg:'ELEC',pt:['cabin']},{id:'callAft',l:'CALL AFT',t:'mom',pg:'ELEC',pt:['cabin']},
  {id:'pa',l:'PA (annonce)',t:'mom',pg:'ELEC',pt:['cabin']},
  {id:'belts',l:'SEAT BELTS',t:'sel',o:[false,true],ol:['OFF','ON'],pg:'ELEC',pt:['cabin']},
  {id:'xpdr',l:'TRANSPONDEUR',t:'sel',o:['STBY','AUTO'],ol:['STBY','AUTO'],pg:'ELEC',pt:['avio2']},
  {id:'mask',l:'MASQUES PAX',t:'mom',grd:1,pg:'PRESS',pt:['masks'],lt:s=>s.masks?['','ON|cy']:NONE}]},
 {g:'Feu moteur (exercice)',w:'overhead · FIRE (20VU)',c:[
  {id:'fireSim',l:'SIMULER FEU MOT. 1',t:'mom',pg:'ENG',pt:['e1fire','e1'],lt:s=>s.fire1?['','FEU|rd']:NONE},
  {id:'ff1',l:'ENG 1 FIRE',t:'mom',grd:1,pg:'ENG',pt:['lp1','f_bl1','e1hp','e1idg','ag1'],lt:s=>[s.fire1?'FIRE|rd':'',s.ff1?'PUSHED|wh':'']},
  {id:'ag1',l:'AGENT 1',t:'mom',pg:'ENG',pt:['ag1','f_ag1','e1'],lt:s=>[s.ff1&&!s.ag1?'SQUIB|wh':'',s.ag1?'DISCH|am':'']}]}
];
function pumpLt(s,id){ const k=kk(s); return !s[id]?OFF:(!k.acAny?['FAULT|am','']:NONE); }
function init(){ return {ground:true,bat1:false,bat2:false,ext:false,apuMaster:false,apuSt:0,apuN:0,apuFlap:0,apuGen:true,apuBleed:false,gen1:true,gen2:true,
  pL1:true,pL2:true,pC1:true,pC2:true,pR1:true,pR2:true,xfeed:false,eMode:'NORM',m1:false,m2:false,thr:'IDLE',es:[0,0],n2:[0,0],eg:[15,15],sf:[0,0],
  b1:true,b2:true,xbleed:'AUTO',pack1:true,pack2:true,ditch:false,hEP1:true,hBE:true,hEP2:true,hYE:false,ptu:true,rat:false,gP:0,bP:0,yP:0,
  wai:false,waiT:0,eai1:false,eai2:false,probe:false,ir1:'OFF',ir2:'OFF',ir3:'OFF',al:[0,0,0],beacon:false,strobe:'OFF',nav:false,land:false,taxi:'OFF',
  stick:'N',stickT:0,ped:'N',pedT:0,flaps:0,fp:0,spd:0,gear:'DOWN',gp:1,pbrake:true,fire1:false,ff1:false,ag1:false,agT:0,
  fuel:{lo:690,li:2800,c:2400,ri:2800,ro:690},cab:0,t:0,belts:false,xpdr:'STBY',masks:false,fail:{e1:0,e2:0,dep:0}}; }
function kk(s){ const k={};
 k.apuAv=s.apuSt===2; k.extOn=s.ext&&s.ground; k.apuG=k.apuAv&&s.apuGen;
 k.g=[s.es[0]===2&&s.gen1&&!s.ff1, s.es[1]===2&&s.gen2];
 k.src1=k.g[0]?'GEN 1':k.extOn?'EXT PWR':k.apuG?'APU GEN':k.g[1]?'GEN 2':null;
 k.src2=k.g[1]?'GEN 2':k.extOn?'EXT PWR':k.apuG?'APU GEN':k.g[0]?'GEN 1':null;
 k.ac1=!!k.src1; k.ac2=!!k.src2; k.acAny=k.ac1||k.ac2; k.ratG=s.rat&&!s.ground&&s.bP>1500; k.acEss=k.acAny||k.ratG;
 k.dcbat=s.bat1||s.bat2; k.dcAny=k.acAny||k.dcbat||k.ratG;
 k.pump=id=>s[id]&&k.acAny; k.fL=k.pump('pL1')||k.pump('pL2'); k.fR=k.pump('pR1')||k.pump('pR2'); k.fC=k.pump('pC1')||k.pump('pC2');
 k.lp=[s.m1&&!s.ff1&&k.dcAny, s.m2&&k.dcAny]; k.xf=s.xfeed&&k.dcAny;
 k.apuBl=k.apuAv&&s.apuBleed; k.xb=s.xbleed==='OPEN'||(s.xbleed==='AUTO'&&k.apuBl);
 k.ebv=[s.es[0]===2&&s.b1&&!k.apuBl&&!s.ff1, s.es[1]===2&&s.b2&&!k.apuBl];
 let L=k.apuBl||k.ebv[0], Rr=k.ebv[1]; if(k.xb){ const x=L||Rr; L=x; Rr=x; } k.duct=[L,Rr];
 k.sv=[0,1].map(i=>s.es[i]===1&&s.n2[i]<50); k.anyStart=s.es[0]===1||s.es[1]===1;
 k.burn=[0,1].map(i=>k.lp[i]&&((s.es[i]===1&&s.n2[i]>=22)||s.es[i]===2));
 k.ign=[0,1].map(i=>s.es[i]===1&&s.n2[i]>=16&&s.n2[i]<50);
 k.pack=[s.pack1&&k.duct[0]&&!k.anyStart&&!s.ditch&&k.dcAny, s.pack2&&k.duct[1]&&!k.anyStart&&!s.ditch&&k.dcAny];
 k.tG=(s.es[0]===2&&s.hEP1&&!s.ff1)?3000:0; k.tY=((s.es[1]===2&&s.hEP2)||(s.hYE&&k.acAny))?3000:0;
 k.tB=(s.hBE&&k.acAny&&(s.es[0]===2||s.es[1]===2))?3000:((s.rat&&!s.ground)?2500:0);
 k.ptuRun=s.ptu&&Math.abs(k.tG-k.tY)>=500&&(k.tG>0||k.tY>0)&&!(s.ground&&s.pbrake&&s.m1!==s.m2);
 if(k.ptuRun){ if(!k.tG) k.tG=2900; else k.tY=2900; }
 k.G=s.gP>1450; k.B=s.bP>1450; k.Y=s.yP>1450; k.elac=k.dcAny;
 k.irOn=[s.ir1,s.ir2,s.ir3].map(v=>v!=='OFF'&&k.dcAny);
 k.lights=k.acAny; k.waiOn=s.wai&&(k.duct[0]||k.duct[1])&&(!s.ground||s.waiT<30);
 return k; }
const N1T={IDLE:19.5,CL:84,TOGA:94}, N2T={IDLE:58.5,CL:93,TOGA:98}, EGTT={IDLE:410,CL:690,TOGA:790}, FFT={IDLE:290,CL:1900,TOGA:2900};
function step(s,dt){ const k=kk(s); s.t+=dt;
 // APU
 s.apuFlap=Math.max(0,Math.min(1,s.apuFlap+(s.apuMaster&&k.dcAny?dt/2:-dt/2)));
 if(s.apuSt===1){ if(!s.apuMaster||!k.dcAny){ s.apuSt=3; } else if(s.apuFlap>=1){ s.apuN=Math.min(100,s.apuN+dt*8.5); if(s.apuN>=95){ s.apuSt=2; } } }
 if(s.apuSt===2&&!s.apuMaster) s.apuSt=3;
 if(s.apuSt===3){ s.apuN=Math.max(0,s.apuN-dt*12); if(s.apuN<=0) s.apuSt=0; }
 if(s.apuSt===2) s.apuN+=(100-s.apuN)*Math.min(1,dt);
 // pannes
 const fl=s.fail||{};
 if(fl.leak){ const r=45*dt*fl.leak, take=(a,b,q)=>{ const t=Math.min(q,s.fuel[a]); s.fuel[a]-=t; s.fuel[b]=Math.max(0,s.fuel[b]-(q-t)); }; take('lo','li',r); if(s.xfeed){ take('ro','ri',r*0.6); s.fuel.c=Math.max(0,s.fuel.c-r*0.6); } }
 if(s.fuel.lo+s.fuel.li<=0&&(!s.xfeed||s.fuel.c<=0)) fl.e1=1; if(s.fuel.ro+s.fuel.ri<=0&&s.fuel.c<=0) fl.e2=1; if(s.fuel.lo+s.fuel.li<=0&&s.xfeed&&s.fuel.c<=0) fl.e2=fl.e2||(s.fuel.ro+s.fuel.ri<=0?1:0); if(fl.e1&&s.es[0]) s.es[0]=0; if(fl.e2&&s.es[1]) s.es[1]=0;
 if(!s.ground&&!k.acAny&&s.es[0]!==2&&s.es[1]!==2&&(s.n2[0]>0||s.n2[1]>0||fl.e1||fl.e2)) s.rat=true;
 // moteurs
 for(let i=0;i<2;i++){ const m=s['m'+(i+1)];
  if(s.es[i]===1){
   if(!m||(!k.lp[i]&&s.n2[i]>=22)) s.es[i]=0;
   else if(s.n2[i]<50){ if(k.duct[i]){ s.n2[i]+=dt*(s.n2[i]<22?4.4:5.6); s.sf[i]=0; } else { s.n2[i]=Math.max(0,s.n2[i]-dt*3); s.sf[i]=1; } }
   else { s.n2[i]+=dt*2.6; if(s.n2[i]>=N2T.IDLE){ s.es[i]=2; } }
  } else if(s.es[i]===2){ if(!m||!k.lp[i]) s.es[i]=0; else { const t=s.ground&&s.thr!=='IDLE'&&s.pbrake?N2T.IDLE+6:N2T[s.thr]; s.n2[i]+=(t-s.n2[i])*Math.min(1,dt*0.8); } }
  else s.n2[i]=Math.max(s.ground?0:Math.min(s.n2[i],12),s.n2[i]-dt*5);
  const egt=k.burn[i]?(s.es[i]===1?655:EGTT[s.thr]):18+s.n2[i]*.5; s.eg[i]+=(egt-s.eg[i])*Math.min(1,dt*(egt>s.eg[i]?0.9:0.35)); }
 // carburant
 const ff=[0,1].map(i=>k.burn[i]?(s.es[i]===2?FFT[s.thr]:180):0), use=(ff[0]+ff[1]+(s.apuSt===2?120:0))*dt/3600;
 if(k.fC&&s.fuel.c>0) s.fuel.c=Math.max(0,s.fuel.c-use); else { s.fuel.li=Math.max(0,s.fuel.li-use/2); s.fuel.ri=Math.max(0,s.fuel.ri-use/2); }
 // hydraulique
 s.gP+=(k.tG-s.gP)*Math.min(1,dt*2.5); s.bP+=(k.tB-s.bP)*Math.min(1,dt*2.5); s.yP+=(k.tY-s.yP)*Math.min(1,dt*2.5);
 // volets / train
 const fAv=k.G||k.Y, sAv=k.G||k.B, spd=(fAv&&sAv?0.45:(fAv||sAv?0.22:0));
 if(s.fp!==s.flaps&&spd){ const d=s.flaps-s.fp; s.fp+=Math.sign(d)*Math.min(Math.abs(d),dt*spd); }
 const gt=s.gear==='DOWN'?1:0; if(s.gp!==gt){ if(k.G&&!s.ground) s.gp+=Math.sign(gt-s.gp)*Math.min(Math.abs(gt-s.gp),dt/6); else if(gt===1&&!k.G&&s.grav) s.gp=Math.min(1,s.gp+dt/8); }
 s.stickT=Math.max(0,s.stickT-dt); if(!s.stickT) s.stick='N'; s.pedT=Math.max(0,s.pedT-dt); if(!s.pedT) s.ped='N';
 // ADIRS
 ['ir1','ir2','ir3'].forEach((id,j)=>{ if(s[id]==='OFF'||!k.dcAny) s.al[j]=0; else s.al[j]=Math.min(1,s.al[j]+dt/(s[id]==='ATT'?2:16)); });
 if(s.wai) s.waiT+=dt; else s.waiT=0;
 // feu
 if(s.ag1&&s.fire1){ s.agT+=dt; if(s.agT>3&&!k.lp[0]) { s.fire1=false; } }
 { const alt=s.fl?s.fl.alt:35000, dep=fl.dep&&!s.ground, tg=s.ground?0:(dep?alt:((k.pack[0]||k.pack[1])&&!s.ditch?Math.min(alt,6000):alt)), r=dep?4000:350; s.cab+=Math.max(-dt*r,Math.min(dt*r,tg-s.cab)); if(s.cab>14000) s.masks=true; }
}
function ev(s){ const k=kk(s), p={}; const A=(id,c,m)=>{ p[id]=m?[c,m]:c; };
 // électricité
 if(k.extOn){ A('gpu','el'); A('f_ext','el','flow'); A('extrcp','el'); }
 if(k.apuG){ A('apugen','el'); A('f_apug','el','flow'); }
 if(k.g[0]){ A('e1idg','el'); A('f_gen1','el','flow'); } if(k.g[1]){ A('e2idg','el'); A('f_gen2','el','flow'); }
 if(s.bat1) A('bat1','el',k.acAny?null:'blink'); if(s.bat2) A('bat2','el',k.acAny?null:'blink');
 if(k.dcAny){ A('dcbus','el'); A('f_dc','el','flow'); A('ovh','el','dim'); }
 if(k.ac1) A('acbus1','el'); if(k.ac2) A('acbus2','el');
 if(k.acAny){ A('scr','el'); A('f_ac','el','flow'); } else if(k.ratG) A('scr','el','dim');
 if(k.irOn.some(x=>x)) A('adiru','dat',Math.min(...s.al.filter((v,j)=>k.irOn[j]))<1?'blink':null);
 if(k.elac) A('fctlc','dat'); if(k.acAny) A('fmgc','dat');
 [0,1].forEach(i=>{ if(k.dcAny&&(s['m'+(i+1)]||s.eMode!=='NORM'||s.es[i])) A('e'+(i+1)+'fadec','dat'); });
 // carburant
 ['tLi','tRi','tLo','tRo','tC'].forEach(t=>A(t,'fu','dim'));
 ['pL1','pL2','pC1','pC2','pR1','pR2'].forEach(id=>{ if(k.pump(id)) A(id,'fu'); else if(s[id]&&!k.acAny) A(id,'warn','blink'); });
 if(k.fC) A('f_fuC','fu','flow');
 [0,1].forEach(i=>{ const n=i+1, feed=i?k.fR:k.fL; if(k.lp[i]) A('lp'+n,'fu'); if(k.burn[i]) A('f_fu'+n,'fu','flow'); else if(feed||k.fC) A('f_fu'+n,'fu','st'); });
 if(k.xf){ A('xfv','fu'); A('f_xf','fu','st'); }
 if(s.apuSt===1||s.apuSt===2) A('f_apuf','fu','flow');
 // APU
 if(s.apuMaster&&k.dcAny) A('apuflap','me',s.apuFlap<1?'blink':null);
 if(s.apuSt===1) A('apu','me','blink'); else if(s.apuSt===2) A('apu','hot'); else if(s.apuSt===3) A('apu','me','dim');
 if(s.apuSt===2) A('apuex','hot','flow');
 // air
 if(k.apuBl) A('f_apub','ah','flow'); if(k.xb){ A('xbv','ah'); if(k.duct[0]||k.duct[1]) A('f_xb','ah','flow'); }
 [0,1].forEach(i=>{ const n=i+1; if(k.sv[i]&&k.duct[i]){ A('f_bl'+n,'ah','rev'); A('e'+n+'st','ah','blink'); } else if(k.ebv[i]) A('f_bl'+n,'ah','flow');
   if(k.ign[i]) A('e'+n+'ig','ig','blink'); if(k.burn[i]) A('e'+n+'core','hot',s.es[i]===1?'blink':null); else if(s.n2[i]>2) A('e'+n+'core','me','dim');
   if(s.n2[i]>8) A('e'+n+'fan','me','flow'); if(s.es[i]===2) A('e'+n+'ex','hot','flow');
   if(s['eai'+n]&&s.es[i]===2) A('e'+n+'lip','ah','flow'); });
 if(k.duct[0]&&s.pack1) A('f_pk1','ah',k.pack[0]?'flow':'st'); if(k.duct[1]&&s.pack2) A('f_pk2','ah',k.pack[1]?'flow':'st');
 if(k.pack[0]) A('pack1','ac'); if(k.pack[1]) A('pack2','ac');
 if(k.pack[0]||k.pack[1]){ A('f_pm','ac','flow'); A('mixer','ac'); A('f_cond','ac','flow'); A('cabin','ac','dim'); }
 if(s.ditch) A('ofv','warn'); else if(!s.ground&&(k.pack[0]||k.pack[1])) A('ofv','ac');
 if(k.waiOn){ A('waiL','ah','flow'); A('waiR','ah','flow'); }
 if(k.acAny&&(s.probe||s.es[0]===2||s.es[1]===2)){ A('probe','el'); A('wshield','el'); }
 // hydraulique
 if(s.gP>200){ A('hG','hg'); A('f_hG','hg','st'); A('f_hGw','hg','st'); } if(s.bP>200){ A('hB','hb'); A('f_hB','hb','st'); A('f_hBw','hb','st'); } if(s.yP>200){ A('hY','hy'); A('f_hY','hy','st'); A('f_hYw','hy','st'); }
 if(s.es[0]===2&&s.hEP1&&!s.ff1){ A('e1hp','hg'); A('f_hGe','hg','flow'); } if(s.es[1]===2&&s.hEP2){ A('e2hp','hy'); A('f_hYe','hy','flow'); }
 if(s.hBE&&k.acAny&&(s.es[0]===2||s.es[1]===2)) A('pB','hb'); if(s.hYE&&k.acAny) A('pYe','hy');
 if(k.ptuRun) A('ptu',k.tG===2900?'hg':'hy','blink');
 if(s.rat){ A('rat','me',s.ground?null:'blink'); if(!s.ground) A('f_rat','hb','flow'); }
 // commandes de vol
 const roll=s.stick==='L'||s.stick==='R', pitch=s.stick==='F'||s.stick==='A';
 const okAil=(k.G||k.B)&&k.elac, okEl=(k.G||k.B||k.Y)&&k.elac, okRud=k.G||k.B||k.Y;
 if(roll){ ['ailL','ailR'].forEach(x=>A(x,okAil?'me':'warn','blink')); ['splL','splR'].forEach(x=>A(x,(k.G||k.B||k.Y)&&k.elac?'me':'warn',null)); }
 if(pitch) ['elevL','elevR'].forEach(x=>A(x,okEl?'me':'warn','blink'));
 if(s.ped!=='N') A('rud',okRud?'me':'warn','blink');
 if(s.spd&&!roll) ['splL','splR'].forEach(x=>A(x,(k.G||k.B||k.Y)?'me':'warn',null));
 if(s.fp>0.02||s.flaps>0){ const mv=Math.abs(s.fp-s.flaps)>0.02, ok=(k.G||k.Y)||(k.G||k.B); ['flapL','flapR'].forEach(x=>A(x,mv&&!ok?'warn':'me',mv?'blink':null)); ['slatL','slatR'].forEach(x=>A(x,mv&&!ok?'warn':'me',mv?'blink':null)); }
 const gm=s.gp>0.99?['grn',null]:(s.gp<0.01?null:['me','blink']); if(gm){ ['ngear','mgL','mgR'].forEach(x=>A(x,gm[0],gm[1])); }
 if(s.pbrake&&(s.yP>200||true)) A('brk','hy');
 // feux
 if(k.lights){ if(s.nav){ A('navL','lr'); A('navR','lg'); A('navT','lt'); A('logo','lt'); } if(s.beacon) A('bcn','lr','blink');
  if(s.strobe==='ON'||(s.strobe==='AUTO'&&!s.ground)) A('stb','lt','blink'); if(s.land) A('land','lt'); if(s.taxi!=='OFF') A('taxi','lt'); }
 if(s.masks) A('masks','hy','blink'); if(s.fail&&s.fail.pitot) A('probe','warn','blink'); if(s.fail&&s.fail.leak) A('tLo','warn','blink'); if(k.acAny&&(s.xpdr==='AUTO')) A('avio2','dat');
 // feu moteur
 if(s.fire1){ A('e1','fire','blink'); A('e1fire','fire','blink'); } if(s.ag1){ A('ag1','ac'); if(s.agT<3) A('f_ag1','ac','flow'); }
 // live
 const lv=[]; if(s.apuSt===1) lv.push(`APU : N ${Math.round(s.apuN)} %${s.apuFlap<1?' · volet d\'entrée d\'air en ouverture':''}`);
 [0,1].forEach(i=>{ if(s.es[i]===1) lv.push(`MOTEUR ${i+1} : N2 ${s.n2[i].toFixed(0)} %  ${k.sv[i]?(k.duct[i]?'· vanne de démarrage OUVERTE':'· PAS D\'AIR au démarreur !'):'· démarreur coupé'}${k.ign[i]?' · ALLUMAGE':''}${k.burn[i]?' · carburant HP ouvert · EGT '+Math.round(s.eg[i])+' °C':''}`); });
 if(s.al.some((v,j)=>k.irOn[j]&&v<1)) lv.push('ADIRS : alignement '+Math.round(Math.min(...s.al.filter((v,j)=>k.irOn[j]))*100)+' %');
 if(Math.abs(s.fp-s.flaps)>0.02) lv.push('VOLETS/BECS en mouvement'+(!(k.G||k.Y||k.B)?' — BLOQUÉS : pas de pression hydraulique':''));
 if(s.gp>0.01&&s.gp<0.99) lv.push('TRAIN en manœuvre (trappes ouvertes)');
 if(k.ptuRun) lv.push('PTU en fonctionnement (bruit d\'« aboiement » caractéristique)');
 const memo=[]; if(s.fire1) memo.push([RD,'ENG 1 FIRE']); if(k.apuAv) memo.push([G,'APU AVAIL']); if(k.apuBl) memo.push([G,'APU BLEED']);
 [0,1].forEach(i=>{ if(s.sf[i]&&s.es[i]===1) memo.push([AM,'ENG '+(i+1)+' START FAULT']); }); if(k.ptuRun) memo.push([G,'HYD PTU']); if(s.rat&&!s.ground) memo.push([AM,'RAT OUT']);
 if(k.dcAny&&!k.acAny&&s.ground) memo.push([AM,'ELEC : BAT ONLY']); if(s.pbrake&&k.dcAny) memo.push([G,'PARK BRK']); if(s.ditch) memo.push([AM,'DITCHING']); if(s.belts&&k.dcAny) memo.push([G,'SEAT BELTS']); if(s.cab>9550&&!s.ground) memo.push([RD,'CAB PR EXCESS CAB ALT']); if(s.masks) memo.push([AM,'PAX OXY MASKS']); if(s.fail&&(s.fail.e1||s.fail.e2)&&!s.ground) memo.push([AM,'ENG '+(s.fail.e1&&s.fail.e2?'1+2':s.fail.e1?'1':'2')+' FAIL']);
 return {p,k,lv,memo}; }

/* ----- pages écran (style ECAM, SD) ----- */
function page(pg,s,d){ const k=d.k, c=b=>b?G:AM;
 if(!k.acAny&&!k.ratG) return OFFSCR(k.dcAny?'Batteries seules : pas de 115 V AC pour les écrans':'Aucune source électrique');
 let b='';
 if(pg==='ELEC'){ const bv=on=>on?(k.acAny?'28.0':'25.6'):'0.0';
  b+=T(160,14,'ELEC',W,12,'middle')+BX(10,22,62,32,c(s.bat1))+T(16,35,'BAT 1',c(s.bat1))+T(16,49,bv(s.bat1)+' V',s.bat1?G:GY)+BX(248,22,62,32,c(s.bat2))+T(254,35,'BAT 2',c(s.bat2))+T(254,49,bv(s.bat2)+' V',s.bat2?G:GY);
  b+=T(160,40,'DC BAT',c(k.dcbat||k.acAny),11,'middle')+LN(`72,38 135,38`,s.bat1?G:GY)+LN(`248,38 185,38`,s.bat2?G:GY);
  b+=T(40,84,'DC 1',c(k.ac1),11,'middle')+T(160,84,'DC ESS',c(k.dcAny),11,'middle')+T(280,84,'DC 2',c(k.ac2),11,'middle');
  b+=T(40,120,'AC 1',c(k.ac1),11,'middle')+T(160,120,'AC ESS',c(k.acEss),11,'middle')+T(280,120,'AC 2',c(k.ac2),11,'middle')+LN('40,110 40,90',k.ac1?G:GY)+LN('280,110 280,90',k.ac2?G:GY)+T(40,102,'TR 1',k.ac1?W:GY,9,'middle')+T(280,102,'TR 2',k.ac2?W:GY,9,'middle');
  const gb=(x,lab,on,src)=>BX(x,140,64,48,on?W:AM)+T(x+32,153,lab,on?W:AM,10.5,'middle')+(on?T(x+32,168,'115 V',G,10,'middle')+T(x+32,181,'400 HZ',G,10,'middle'):T(x+32,172,src,AM,9,'middle'));
  b+=gb(4,'GEN 1',k.g[0],s.gen1?'MOT. ARRÊTÉ':'OFF')+gb(86,'APU GEN',k.apuG,s.apuSt===2?'OFF':'APU ARRÊTÉ')+gb(168,'EXT PWR',k.extOn,s.ground?'AVAIL':'—')+gb(250,'GEN 2',k.g[1],s.gen2?'MOT. ARRÊTÉ':'OFF');
  if(k.ac1) b+=LN(`36,140 36,126`)+T(60,134,'← '+k.src1,G,8.5); if(k.ac2) b+=LN(`282,140 282,126`)+T(200,134,k.src2+' →',G,8.5); }
 else if(pg==='APU'){ b+=T(160,14,'APU',W,12,'middle')+ARC(80,80,40,s.apuN,110,'N','%',s.apuN>0?G:GY)+ARC(220,80,40,s.apuSt?Math.max(s.apuN*6.2,0):20,1000,'EGT','°C',G,0.9);
  b+=T(160,150,s.apuSt===2?'AVAIL':s.apuSt===1?'DÉMARRAGE':s.apuSt===3?'ARRÊT':'',s.apuSt===2?G:CY,14,'middle')+T(20,175,'VOLET ENTRÉE AIR : '+(s.apuFlap>=1?'OUVERT':s.apuFlap>0?'EN TRANSIT':'FERMÉ'),s.apuFlap>=1?G:W,10)+T(20,189,'BLEED : '+(k.apuBl?'35 PSI':'—')+'   GEN : '+(k.apuG?'115 V 400 HZ':'—'),k.apuBl?G:W,10); }
 else if(pg==='BLEED'){ b+=T(160,14,'BLEED',W,12,'middle');
  const v=(x,y,o)=>`<circle cx="${x}" cy="${y}" r="8" fill="none" stroke="${o?G:W}" stroke-width="1.4"/><line x1="${o?x:x-6}" y1="${o?y-6:y}" x2="${o?x:x+6}" y2="${o?y+6:y}" stroke="${o?G:W}" stroke-width="2"/>`;
  b+=T(60,40,'PACK 1',c(k.pack[0]),11,'middle')+T(260,40,'PACK 2',c(k.pack[1]),11,'middle')+v(60,64,k.pack[0])+v(260,64,k.pack[1]);
  b+=LN(`60,72 60,120 260,120 260,72`,k.duct[0]||k.duct[1]?G:GY)+v(160,120,k.xb)+T(160,108,'X BLEED',W,9,'middle');
  b+=v(60,160,k.ebv[0])+v(260,160,k.ebv[1])+LN('60,128 60,152',k.duct[0]?G:GY)+LN('260,128 260,152',k.duct[1]?G:GY)+T(60,186,'ENG 1',W,10,'middle')+T(260,186,'ENG 2',W,10,'middle');
  b+=v(120,150,k.apuBl)+T(120,174,'APU',W,10,'middle')+LN('120,142 120,120',k.apuBl?G:GY);
  b+=T(10,140,(k.duct[0]?'40':'0')+' PSI',k.duct[0]?G:AM,10)+T(270,140,(k.duct[1]?'40':'0')+' PSI',k.duct[1]?G:AM,10);
  if(k.anyStart) b+=T(160,88,'PACKS FERMÉS : DÉMARRAGE',AM,9.5,'middle'); if(k.waiOn) b+=T(160,148,'ANTI ICE AILE',G,9.5,'middle'); }
 else if(pg==='ENG'){ b+=T(160,14,'ENGINE',W,12,'middle');
  [0,1].forEach(i=>{ const x=i?240:80, n1=s.es[i]===2?N1T[s.thr]*(s.n2[i]/N2T[s.thr]):s.n2[i]*0.28; b+=ARC(x,58,30,n1,110,'N1','%',G,0.92)+ARC(x,128,26,s.eg[i],1000,'EGT','°C',s.eg[i]>900?RD:G,0.95)+T(x,178,'N2 '+s.n2[i].toFixed(1)+' %',G,11,'middle');
   if(s.es[i]===1) b+=T(x,192,(k.ign[i]?'IGN A  ':'')+(k.sv[i]?'START VLV':'')+(k.burn[i]?' FUEL':''),k.sv[i]&&!k.duct[i]?AM:CY,9,'middle'); });
  b+=T(160,58,'N1',CY,10,'middle')+T(160,128,'EGT',CY,10,'middle')+T(160,92,'FF '+[0,1].map(i=>k.burn[i]?(s.es[i]===2?FFT[s.thr]:180):0).join(' | ')+' kg/h',G,9,'middle'); }
 else if(pg==='HYD'){ b+=T(160,14,'HYD',W,12,'middle'); [['GREEN',s.gP,60,'ENG 1',s.es[0]===2&&s.hEP1],['BLUE',s.bP,160,'ELEC',s.hBE&&k.acAny&&(s.es[0]===2||s.es[1]===2)],['YELLOW',s.yP,260,'ENG 2',s.es[1]===2&&s.hEP2]].forEach(([n,p,x,pu,on])=>{
   b+=T(x,38,n,p>1450?G:AM,12,'middle')+T(x,60,Math.round(p/50)*50+'',p>1450?G:AM,16,'middle')+T(x,74,'PSI',CY,9,'middle')+LN(`${x},80 ${x},120`,p>1450?G:AM)+BX(x-22,120,44,22,on?G:AM)+T(x,135,pu,on?G:AM,9.5,'middle'); });
  b+=T(260,165,'ELEC',s.hYE&&k.acAny?G:W,9.5,'middle')+T(160,165,s.rat?'RAT':'',s.rat?G:W,9.5,'middle')+T(110,100,k.ptuRun?'◀ PTU ▶':'PTU',k.ptuRun?G:(s.ptu?W:AM),10,'middle'); }
 else if(pg==='FUEL'){ b+=T(160,14,'FUEL',W,12,'middle')+T(160,32,'FOB '+Math.round(s.fuel.lo+s.fuel.li+s.fuel.c+s.fuel.ri+s.fuel.ro)+' KG',G,11,'middle');
  const tk=(x,w,q,lab)=>BX(x,120,w,40,W)+T(x+w/2,145,Math.round(q),G,11,'middle')+T(x+w/2,172,lab,W,8.5,'middle');
  b+=tk(4,40,s.fuel.lo,'OUTER')+tk(46,68,s.fuel.li,'INNER')+tk(120,80,s.fuel.c,'CENTER')+tk(206,68,s.fuel.ri,'INNER')+tk(276,40,s.fuel.ro,'OUTER');
  const pu=(x,id)=>BX(x-7,104,14,12,k.pump(id)?G:AM)+LN(`${x},104 ${x},96`,k.pump(id)?G:GY);
  b+=pu(70,'pL1')+pu(90,'pL2')+pu(145,'pC1')+pu(175,'pC2')+pu(230,'pR1')+pu(250,'pR2')+LN('70,90 250,90',G);
  b+=`<circle cx="160" cy="90" r="7" fill="#000" stroke="${k.xf?G:W}"/>`+T(160,80,'X FEED',W,8.5,'middle')+LN('80,90 80,52',k.lp[0]?G:AM)+LN('240,90 240,52',k.lp[1]?G:AM)+T(80,48,'ENG 1 LP '+(k.lp[0]?'OPEN':'SHUT'),k.lp[0]?G:AM,8.5,'middle')+T(240,48,'ENG 2 LP '+(k.lp[1]?'OPEN':'SHUT'),k.lp[1]?G:AM,8.5,'middle'); }
 else if(pg==='F/CTL'){ b+=T(160,14,'F/CTL',W,12,'middle'); const hl=(x,y,on)=>T(x,y,on[0]?'G':'',on[0]?G:AM,9)+T(x+9,y,on[1]?'B':'',G,9)+T(x+18,y,on[2]?'Y':'',G,9);
  const def=v=>v; b+=T(40,40,'AIL',W,10,'middle')+T(280,40,'AIL',W,10,'middle')+LN(`28,${60+(s.stick==='L'?-14:s.stick==='R'?14:0)} 52,60`,(k.G||k.B)?G:AM,3)+LN(`268,60 292,${60+(s.stick==='L'?14:s.stick==='R'?-14:0)}`,(k.G||k.B)?G:AM,3);
  b+=T(160,40,'SPD BRK',W,10,'middle')+[1,2,3,4,5].map(n=>T(96+n*20,60,(s.spd||(s.stick==='L'&&n>1)||(s.stick==='R'&&n>1))?'▲':'—',(k.G||k.B||k.Y)?G:AM,11,'middle')).join('');
  b+=T(80,110,'ELEV',W,10,'middle')+T(240,110,'ELEV',W,10,'middle')+LN(`68,${130+(s.stick==='F'?10:s.stick==='A'?-10:0)} 92,130`,(k.G||k.B)?G:AM,3)+LN(`228,130 252,${130+(s.stick==='F'?10:s.stick==='A'?-10:0)}`,(k.Y||k.B)?G:AM,3);
  b+=T(160,150,'RUD',W,10,'middle')+LN(`160,160 ${160+(s.ped==='L'?-14:s.ped==='R'?14:0)},186`,(k.G||k.B||k.Y)?G:AM,3)+T(10,190,'ELAC 1-2 · SEC 1-2-3 : '+(k.elac?'OK':'PANNE'),k.elac?G:AM,9);
  b+=T(250,186,'FLAPS '+['0','1','2','3','FULL'][Math.round(s.fp)],(Math.abs(s.fp-s.flaps)>0.02)?CY:G,10,'middle'); }
 else if(pg==='WHEEL'){ b+=T(160,14,'WHEEL',W,12,'middle'); const tri=(x,y)=>{ const g=s.gp>0.99, tr=s.gp>0.01&&s.gp<0.99; return tr?`<path d="M${x-12} ${y} L${x+12} ${y} L${x} ${y+18} Z" fill="none" stroke="${RD}" stroke-width="2"/>`:g?`<path d="M${x-12} ${y} L${x+12} ${y} L${x} ${y+18} Z" fill="${G}"/>`:T(x,y+12,'UP',W,10,'middle'); };
  b+=tri(160,40)+tri(90,96)+tri(230,96)+T(160,150,'PARK BRK '+(s.pbrake?'ON':'OFF'),s.pbrake?G:W,11,'middle')+T(160,170,'ACCU JAUNE '+(s.yP>200?'3000':'2800')+' PSI · FREINS '+(k.G?'NORM (VERT)':'ALTN (JAUNE)'),G,9,'middle')+T(160,186,s.ground?'AU SOL — LEVIER VERROUILLÉ':'EN VOL',CY,9,'middle'); }
 else if(pg==='PRESS'){ b+=T(160,14,'CAB PRESS',W,12,'middle')+ARC(80,80,38,s.cab,25000,'CAB ALT','',s.cab>9550?RD:G,0.4)+ARC(220,80,38,s.ground?0:Math.max(0,8.1-s.cab/3000),9,'ΔP','',G,0.9);
  b+=T(160,150,'OUTFLOW VALVE : '+(s.ditch?'FERMÉE (DITCHING)':s.ground?'GRANDE OUVERTE (AU SOL)':'RÉGULE'),s.ditch?AM:G,10,'middle')+T(160,168,'PACK 1 '+(k.pack[0]?'FLOW':'OFF')+'   PACK 2 '+(k.pack[1]?'FLOW':'OFF'),k.pack[0]||k.pack[1]?G:AM,10,'middle'); }
 else if(pg==='FEUX'){ b+=T(160,14,'FEUX EXTÉRIEURS (EXT LT)',W,12,'middle'); [['BEACON',s.beacon,'rouge, à éclats'],['STROBE',s.strobe==='ON'||(s.strobe==='AUTO'&&!s.ground),'blanc, à éclats'],['NAV + LOGO',s.nav,'rouge G · vert D · blanc AR'],['LANDING',s.land,'phares emplanture'],['NOSE',s.taxi!=='OFF',s.taxi]].forEach((r,i)=>{ b+=T(20,44+i*26,r[0],W,11)+T(130,44+i*26,r[1]&&k.lights?'ALLUMÉ':'ÉTEINT',r[1]&&k.lights?G:GY,11)+T(210,44+i*26,r[2],CY,9); }); }
 return SCR(b,d.memo); }

/* ----- explications : ce que fait réellement le bouton ----- */
function ex(id,s,d){ const k=d.k, o={ln:[]}, ln=(c,t)=>o.ln.push([c,t]), blk=(t,go)=>{ o.blk=t; o.go=go; };
 switch(id){
 case 'bat1': case 'bat2': { const n=id.slice(-1); o.h='BAT '+n+' — Batterie '+n;
  if(s[id]){ ln('el',`Le contacteur de batterie se ferme : la batterie ${n} (nickel-cadmium, 24 V, 23 Ah, dans la soute avionique sous le poste) est reliée à la barre DC BAT, puis aux barres DC ESS.`);
   ln('dat','Le BCL (Battery Charge Limiter) surveille tension et courant ; contrôle avant vol : tension supérieure à 25,5 V sur la page ELEC.');
   if(k.acAny) ln('el','Le 115 V alternatif est disponible : les transformateurs-redresseurs (TR 1 et 2) fournissent le 28 V continu et rechargent la batterie.');
   else ln('el','Sans courant alternatif, la batterie est seule : les écrans principaux restent noirs ; elle peut démarrer l\'APU (démarreur électrique) et garder les circuits essentiels.'); }
  else ln('el','Contacteur ouvert : la batterie est isolée. Seules les barres HOT, reliées directement sans bouton, restent sous tension (bouteilles d\'extincteur, ouverture de secours).'); break; }
 case 'ext': o.h='EXT PWR — Prise de parc';
  if(!s.ground){ blk('En vol il n\'y a pas de groupe de parc : le bouton n\'a aucun effet.'); break; }
  if(s.ext){ ln('el','Le contacteur EXT PWR se ferme : le groupe de parc au sol (115 V, 400 Hz, 90 kVA) alimente les barres AC 1 et AC 2 par les contacteurs de liaison (bus tie).');
   ln('el','Les transformateurs-redresseurs donnent le 28 V continu : les batteries se rechargent.'); ln('dat','Les six écrans s\'allument, les calculateurs démarrent ; les pompes carburant (115 V AC) peuvent tourner.');
   ln('dat','Priorité automatique : génératrice moteur > groupe de parc > génératrice APU.'); }
  else ln('el','Contacteur ouvert : le GPU reste branché (voyant AVAIL vert) mais n\'alimente plus l\'avion.'); break;
 case 'gen1': case 'gen2': { const n=id.slice(-1); o.h='GEN '+n+' — Génératrice moteur '+n;
  ln('me',`L\'IDG ${n} (génératrice à entraînement intégré, 90 kVA) est entraîné par la boîte d\'accessoires du moteur ${n} ; un régulateur hydromécanique garde une vitesse constante, donc 400 Hz.`);
  if(!s[id]) ln('el','Bouton OFF : le relais de ligne (GLC) est ouvert, la génératrice est désexcitée ; la barre AC est reprise par une autre source.');
  else if(s.es[+n-1]!==2) blk(`Moteur ${n} arrêté : l\'IDG ne tourne pas, aucune tension. Il faut d\'abord démarrer le moteur ${n}.`,'m'+n);
  else ln('el',`Le relais GLC ${n} est fermé : l\'IDG ${n} alimente la barre AC ${n} (prioritaire sur le GPU et l\'APU).`); break; }
 case 'apuGen': o.h='APU GEN — Génératrice APU'; ln('me','La génératrice (90 kVA) est montée directement sur la boîte de l\'APU.');
  if(!s.apuGen) ln('el','OFF : la génératrice est désexcitée.'); else if(s.apuSt!==2) blk('L\'APU ne tourne pas : pas de courant. Démarrez l\'APU (APU MASTER SW puis START).','apuMaster'); else ln('el','APU AVAIL : la génératrice alimente les barres AC qui n\'ont pas de source prioritaire (moteur ou GPU).'); break;
 case 'apuMaster': o.h='APU MASTER SW — Interrupteur général APU';
  if(!s.apuMaster){ ln('dat','Arrêt : le calculateur ECB laisse tourner l\'APU environ 1 à 2 minutes à vide s\'il a fourni de l\'air (refroidissement), puis coupe le carburant ; le volet d\'entrée d\'air se referme.'); break; }
  if(!k.dcAny){ blk('Aucun courant continu : le calculateur de l\'APU ne s\'allume pas. Mettez BAT 1 et BAT 2.','bat1'); break; }
  ln('dat','Le calculateur ECB (Electronic Control Box) s\'alimente et fait son autotest ; la détection incendie de l\'APU est surveillée.');
  ln('me','Un actionneur électrique ouvre le volet d\'entrée d\'air sur le flanc du cône de queue.'); ln('fu','La pompe carburant de l\'APU (28 V DC) se prépare à alimenter la ligne depuis le collecteur gauche.'); break;
 case 'apuStart': o.h='APU START — Démarrage de l\'APU';
  if(!s.apuMaster){ blk('Rien ne se passe : APU MASTER SW est sur OFF. Le calculateur de l\'APU, qui pilote le démarrage, n\'est pas alimenté.','apuMaster'); break; }
  if(!k.dcAny){ blk('Pas de 28 V DC pour le démarreur électrique.','bat1'); break; }
  ln('el','Le démarreur électrique (alimenté par les batteries via la barre DC BAT, ou par un TR si le 115 V est là) entraîne la turbine de l\'APU.');
  ln('fu','Vers 7 % de régime : le carburant est injecté et les bougies s\'allument ; vers 55 % le démarreur se coupe.'); ln('hot','À 95 % : AVAIL (vert). L\'APU fournit alors électricité (génératrice) et air comprimé (prélèvement).');
  if(s.apuFlap<1) ln('me','Le démarrage attend que le volet d\'entrée d\'air soit complètement ouvert.'); break;
 case 'apuBleed': o.h='APU BLEED — Prélèvement d\'air APU';
  if(!s.apuBleed){ ln('ah','Vanne de prélèvement APU fermée : plus d\'air de l\'APU dans le circuit pneumatique.'); break; }
  if(s.apuSt!==2){ blk('L\'APU ne tourne pas (pas AVAIL) : la vanne s\'ouvre mais aucun air n\'arrive.','apuStart'); break; }
  ln('ah','La vanne de prélèvement de l\'APU s\'ouvre : de l\'air comprimé (environ 35-40 psi, 200 °C) entre dans le conduit pneumatique.');
  ln('ah','La vanne de cross bleed (sur AUTO) s\'ouvre : les deux côtés du circuit reçoivent l\'air ; les vannes de prélèvement moteurs se ferment automatiquement.');
  ln('ac','Usages : les packs (climatisation, ventilation) et les démarreurs pneumatiques des moteurs.'); break;
 case 'pL1': case 'pL2': case 'pC1': case 'pC2': case 'pR1': case 'pR2': { const tk={L:'aile gauche',C:'réservoir central',R:'aile droite'}[id[1]]; o.h=id.replace('p','').replace(/(\w)(\d)/,'$1 TK PUMP $2')+' — Pompe de gavage ('+tk+')';
  ln('fu','Pompe centrifuge immergée dans le réservoir, entraînée par un moteur électrique 115 V AC : elle pousse le carburant vers le collecteur des moteurs.');
  if(id[1]==='C') ln('fu','Les pompes du réservoir central refoulent à plus forte pression : le réservoir central est consommé en premier, les ailes servent de « masse » contre la flexion.');
  if(!s[id]) ln('fu','OFF : la pompe s\'arrête ; un clapet évite que les autres pompes refoulent dans celle-ci.');
  else if(!k.acAny) blk('Pas de 115 V AC : la pompe ne tourne pas, voyant FAULT (pression basse). Il faut le GPU, l\'APU ou une génératrice moteur.','ext');
  else ln('fu','Pression établie : le collecteur est alimenté jusqu\'aux vannes basse pression (LP) des moteurs.'); break; }
 case 'xfeed': o.h='X FEED — Intercommunication carburant'; ln('me','Deux moteurs électriques (28 V DC) font tourner la vanne d\'intercommunication.');
  ln('fu',s.xfeed?'Vanne ouverte : un côté peut alimenter les deux moteurs (rééquilibrer les ailes, pompes en panne d\'un côté).':'Vanne fermée : chaque aile alimente son moteur.'); break;
 case 'eMode': o.h='ENG MODE — Sélecteur de mode moteur';
  if(s.eMode==='IGN'){ ln('dat','Les FADEC des deux moteurs sont alimentés (ils l\'étaient seulement si un MASTER était ON) et prêts à piloter un démarrage automatique.'); ln('ac','Les vannes des packs se fermeront pendant le démarrage : tout l\'air doit aller aux démarreurs.'); ln('ig','Aucune étincelle encore : l\'allumage viendra quand un ENG MASTER passera sur ON.'); }
  else if(s.eMode==='CRANK') ln('me','Ventilation sèche (dry crank) : on fait tourner le moteur au démarreur sans carburant ni allumage, pour le purger.');
  else ln('dat','NORM : allumage automatique seulement si nécessaire (réallumage en vol, pluie forte) ; c\'est la position une fois les moteurs démarrés.'); break;
 case 'm1': case 'm2': { const n=+id[1], i=n-1; o.h=`ENG ${n} MASTER — Robinet carburant et démarrage moteur ${n}`;
  if(!s[id]){ ln('fu','Vannes basse pression (dans le mât) et haute pression (FMU) fermées : plus de carburant, le moteur s\'arrête.'); ln('el','L\'IDG, la pompe hydraulique et le prélèvement d\'air de ce moteur s\'arrêtent avec lui.'); break; }
  if(!k.dcAny){ blk('Aucun courant : le FADEC et les vannes ne fonctionnent pas. Mettez les batteries.','bat1'); break; }
  ln('fu','La vanne carburant basse pression (LP), dans le mât, s\'ouvre.');
  if(s.es[i]===2){ ln('hot','Le moteur tourne.'); break; }
  if(s.eMode!=='IGN'&&s.es[i]!==1){ blk('ENG MODE n\'est pas sur IGN/START : aucune séquence de démarrage. Remettez MASTER sur OFF, mettez ENG MODE sur IGN/START, puis MASTER ON.','eMode'); break; }
  if(!k.duct[i]){ blk('La vanne de démarrage s\'ouvre mais aucun air comprimé n\'arrive : le démarreur ne tourne pas, N2 reste à 0 (START FAULT). Il faut l\'air de l\'APU (APU BLEED ON), d\'un groupe de parc pneumatique, ou de l\'autre moteur avec X BLEED.','apuBleed'); }
  ln('ah','1. Vanne de démarrage ouverte : l\'air comprimé fait tourner le démarreur pneumatique (petite turbine), qui entraîne l\'attelage haute pression (N2) par la boîte d\'accessoires.');
  ln('ig','2. Vers 16 % de N2 : une bougie (A ou B, alternées à chaque démarrage) produit des étincelles dans la chambre de combustion.');
  ln('fu','3. Vers 22 % : le FADEC ouvre la vanne haute pression du FMU, les injecteurs pulvérisent le carburant, la combustion démarre (l\'EGT monte).');
  ln('ah','4. Vers 50 % : la vanne de démarrage se ferme, le démarreur se désaccouple, l\'allumage s\'arrête.');
  ln('me','5. Vers 58 % : ralenti stabilisé. Le moteur entraîne l\'IDG (électricité), sa pompe hydraulique ('+(n===1?'circuit vert':'circuit jaune')+') et fournit son propre air.'); break; }
 case 'thr': o.h='Manettes de poussée'; ln('dat','Les manettes ne sont reliées à aucun câble : des capteurs (résolveurs) envoient leur position au FADEC.');
  ln('fu','Le FADEC règle le débit de carburant dans le FMU pour obtenir le N1 demandé (IDLE ≈ 20 %, CL ≈ 85 %, TOGA ≈ 94 %).'); ln('me','Plus de carburant → plus de gaz chauds → les turbines accélèrent la soufflante (N1) qui fournit l\'essentiel de la poussée.');
  if(s.es[0]!==2&&s.es[1]!==2) blk('Aucun moteur ne tourne : déplacer les manettes ne produit rien.','m2'); break;
 case 'b1': case 'b2': { const n=id[1]; o.h=`ENG ${n} BLEED — Prélèvement d\'air moteur ${n}`;
  ln('ah','La vanne de régulation (PRV) prend de l\'air aux étages intermédiaire/haute pression du compresseur, le refroidit dans le pré-refroidisseur (precooler) avec de l\'air de soufflante, puis l\'envoie au conduit.');
  if(!s[id]) ln('ah','OFF : vanne fermée.'); else if(s.es[+n-1]!==2) blk(`Moteur ${n} arrêté : pas d\'air à prélever.`,'m'+n); else if(k.apuBl) ln('ah','Fermée automatiquement tant que APU BLEED est ouvert.'); else ln('ah','Air disponible pour packs, antigivrage et démarrage de l\'autre moteur.'); break; }
 case 'xbleed': o.h='X BLEED — Vanne d\'intercommunication pneumatique'; ln('me','Vanne à moteurs électriques entre les côtés gauche et droit du circuit pneumatique.');
  ln('ah',s.xbleed==='AUTO'?'AUTO : ouverte quand l\'APU fournit de l\'air, fermée sinon.':s.xbleed==='OPEN'?'OPEN : un seul côté peut alimenter les deux (démarrage croisé d\'un moteur avec l\'air de l\'autre).':'SHUT : les deux côtés sont séparés.'); break;
 case 'pack1': case 'pack2': { const n=id.slice(-1); o.h=`PACK ${n} — Groupe de conditionnement ${n}`;
  ln('ah','La vanne de débit (FCV) laisse entrer l\'air chaud prélevé.'); ln('ac','Échangeurs (refroidis par l\'air extérieur) puis machine à cycle à air : un compresseur et une turbine sur le même arbre détendent et refroidissent l\'air.');
  ln('ac','L\'air froid va au mélangeur (avec l\'air recyclé de la cabine), puis aux gaines du poste et de la cabine : il pressurise le fuselage.');
  if(!s[id]) ln('ac','OFF : vanne fermée.'); else if(!k.duct[+n-1]) blk('Pas d\'air dans le conduit : il faut l\'APU (APU BLEED) ou un moteur.','apuBleed'); else if(k.anyStart) ln('ac','Fermé automatiquement pendant le démarrage d\'un moteur.'); break; }
 case 'ditch': o.h='DITCHING — Amerrissage'; ln('me',s.ditch?'Ferme la vanne de décharge (outflow valve), les entrées d\'air de ventilation et les vannes des packs : le fuselage devient étanche pour flotter.':'Normal : la vanne de décharge régule la pression.'); break;
 case 'hEP1': case 'hEP2': { const n=id[3], c=n==='1'?'hg':'hy', nm=n==='1'?'vert':'jaune'; o.h=`${n==='1'?'G ENG 1':'Y ENG 2'} PUMP — Pompe hydraulique moteur ${n}`;
  ln(c,`Pompe à pistons (débit variable) entraînée par la boîte d\'accessoires du moteur ${n} : 3000 psi dans le circuit ${nm}.`);
  if(!s[id]) ln(c,'OFF : la pompe est mise en débit nul (dépressurisée).'); else if(s.es[+n-1]!==2) blk(`Moteur ${n} arrêté : la pompe ne tourne pas.`,'m'+n); else ln(c,`Le circuit ${nm} alimente : ${n==='1'?'ailerons, spoilers 1 et 5, profondeur gauche, direction, volets, becs, train, freins normaux':'spoilers 2 et 4, profondeur droite, direction, volets, roulette de nez, freins alternés et de parc'}.`); break; }
 case 'hBE': o.h='BLUE ELEC PUMP — Pompe électrique bleue'; ln('hb','Pompe entraînée par un moteur électrique 115 V AC ; en AUTO elle tourne dès qu\'un moteur tourne.');
  if(!s.hBE) ln('hb','OFF : circuit bleu dépressurisé (sauf RAT).'); else if(!k.acAny) blk('Pas de 115 V AC.','ext'); else if(s.es[0]!==2&&s.es[1]!==2) ln('hb','Au sol, moteurs arrêtés, elle reste à l\'arrêt (logique AUTO).'); else ln('hb','Le bleu alimente : ailerons, spoiler 3, profondeur (G et D), direction, becs.'); break;
 case 'hYE': o.h='Y ELEC PUMP — Pompe électrique jaune'; ln('hy','Pompe 115 V AC : pressurise le jaune au sol, moteurs arrêtés (freins, portes de soute, volets).');
  if(s.hYE&&!k.acAny) blk('Pas de 115 V AC : la pompe ne tourne pas.','ext'); else if(s.hYE&&s.ptu) ln('hg','Par le PTU, le jaune pressurise aussi le vert (écart > 500 psi).'); break;
 case 'ptu': o.h='PTU — Unité de transfert de puissance';
  ln('me','Un moteur hydraulique et une pompe sur un même arbre, entre vert et jaune : aucune goutte de liquide ne passe d\'un circuit à l\'autre, seule la puissance mécanique.');
  ln('hg','Il démarre seul si l\'écart de pression dépasse 500 psi (bruit d\'« aboiement »). Inhibé au premier démarrage, frein de parc serré.'); if(!s.ptu) ln('hy','OFF : transfert interdit.'); break;
 case 'rat': o.h='RAT MAN ON — Éolienne de secours';
  if(s.ground){ blk('Au sol, sans vent relatif, l\'hélice ne tourne pas : aucune pression. (Elle ne se rentre qu\'au sol, à la main.)'); }
  ln('me','Un vérin à ressort fait sortir la RAT sous le fuselage, côté droit ; l\'hélice tourne grâce au vent relatif.'); ln('hb','Elle entraîne une pompe : le circuit bleu remonte à environ 2500 psi.');
  ln('el','Le bleu fait tourner la génératrice de secours (CSM/G, 5 kVA) : barres AC ESS et DC ESS, PFD et écran ECAM du commandant.'); break;
 case 'wai': o.h='WING ANTI ICE — Antigivrage voilure';
  ln('ah','Deux vannes envoient l\'air chaud prélevé dans les becs 3, 4 et 5 de chaque aile, par un tube perforé (piccolo) qui chauffe le bord d\'attaque.');
  if(s.wai&&!(k.duct[0]||k.duct[1])) blk('Pas d\'air dans le circuit pneumatique : rien ne chauffe.','apuBleed'); else if(s.wai&&s.ground) ln('ah','Au sol : les vannes ne s\'ouvrent que 30 secondes (test), pour ne pas surchauffer les becs.'); break;
 case 'eai1': case 'eai2': { const n=id[3]; o.h=`ENG ${n} ANTI ICE — Antigivrage entrée d\'air`; ln('ah','De l\'air du compresseur haute pression est soufflé dans la lèvre d\'entrée d\'air de la nacelle.'); if(s[id]&&s.es[+n-1]!==2) blk('Moteur arrêté : pas d\'air chaud.','m'+n); break; }
 case 'probe': o.h='PROBE / WINDOW HEAT'; ln('el','Des résistances chauffent les sondes Pitot, statiques, d\'incidence et TAT ; un film conducteur chauffe les pare-brise.');
  ln('dat','Sans réchauffage, le givre boucherait une sonde Pitot : vitesse fausse sur le PFD (cas du vol AF447).'); ln('el','Automatique dès qu\'un moteur tourne ; le bouton force le chauffage au sol.'); if(!k.acAny) blk('Pas de 115 V AC : aucun chauffage.','ext'); break;
 case 'ir1': case 'ir2': case 'ir3': { const n=id[2]; o.h=`IR ${n} — Centrale ADIRU ${n}`;
  if(s[id]==='OFF'){ ln('dat','Centrale arrêtée : plus d\'attitude, de cap ni de position venant d\'elle.'); break; }
  if(!k.dcAny){ blk('Aucun courant.','bat1'); break; }
  ln('dat','L\'ADIRU réunit l\'ADR (vitesse, altitude, incidence, à partir des sondes) et l\'IR (attitude, cap, position).');
  ln('dat',s[id]==='NAV'?'NAV : alignement. Les gyrolasers et accéléromètres mesurent la rotation de la Terre et la gravité pour trouver le nord vrai et la verticale (environ 10 minutes réelles, accélérées ici). L\'avion ne doit pas bouger.':'ATT : mode dégradé, attitude seulement (pas de position), cap à entrer à la main.');
  if(!k.acAny) ln('el','Sur batterie seulement : voyant ON BAT, l\'ADIRU tient quelques minutes.'); break; }
 case 'beacon': o.h='BEACON — Feux anticollision'; ln('lt','Feux rouges à éclats sur le dessus et le dessous du fuselage : ils annoncent au personnel au sol que les moteurs vont démarrer ou tournent.'); if(s.beacon&&!k.lights) blk('Pas de 115 V AC : les feux restent éteints.','ext'); break;
 case 'strobe': o.h='STROBE — Feux à éclats'; ln('lt','Éclats blancs très puissants aux saumons et à la queue. AUTO : allumés automatiquement en vol (amortisseurs détendus).'); if(s.strobe!=='OFF'&&!k.lights) blk('Pas de 115 V AC.','ext'); break;
 case 'nav': o.h='NAV & LOGO — Feux de navigation'; ln('lt','Rouge au saumon gauche, vert au saumon droit, blanc à la queue : un autre pilote sait dans quel sens vous allez. Les feux de logo éclairent la dérive.'); if(s.nav&&!k.lights) blk('Pas de 115 V AC.','ext'); break;
 case 'land': o.h='LAND — Phares d\'atterrissage'; ln('me','Les phares, logés sous l\'emplanture, sortent par un moteur électrique puis s\'allument.'); ln('lt','Utilisés au décollage, à l\'atterrissage et sous 10 000 ft.'); if(s.land&&!k.lights) blk('Pas de 115 V AC.','ext'); break;
 case 'taxi': o.h='NOSE — Phares du train avant'; ln('lt','TAXI : phare de roulage ; T.O : phare de décollage, plus puissant. Ils sont sur la jambe du train avant et s\'éteignent quand le train est rentré.'); break;
 case 'stick': { o.h='Mini-manche (sidestick)'; const roll=LASTV==='L'||LASTV==='R';
  ln('dat','Le mini-manche n\'est relié à aucune gouverne : il envoie un signal électrique aux calculateurs ELAC et SEC (commandes de vol électriques, fly-by-wire), qui protègent le domaine de vol.');
  if(roll){ ln('hg','Roulis : les servocommandes des ailerons (vert + bleu) braquent les ailerons ; les spoilers 2 à 5 de l\'aile qui descend se lèvent.'); }
  else { ln('hb','Tangage : les gouvernes de profondeur (gauche : vert + bleu, droite : jaune + bleu) braquent, puis le plan horizontal réglable (PHR, vis entraînée par des moteurs vert et jaune) suit.'); }
  if(!k.elac) blk('Calculateurs non alimentés : aucun ordre.','bat1'); else if(!(k.G||k.B||k.Y)) blk('Aucune pression hydraulique : les vérins ne bougent pas, les gouvernes restent pendantes (cadre ambre). Il faut un moteur, la pompe électrique jaune (+ PTU) ou la RAT.','hYE'); break; }
 case 'ped': o.h='Palonnier'; ln('me','Les pédales commandent la gouverne de direction : liaison mécanique (câbles) vers trois servocommandes, plus les ordres électriques des FAC (amortisseur de lacet).'); ln('hy','Les servocommandes sont alimentées par les trois circuits (vert, bleu, jaune).'); if(!(k.G||k.B||k.Y)) blk('Aucune pression hydraulique : la gouverne ne bouge pas.','hYE'); break;
 case 'flaps': o.h='Levier des volets et becs';
  ln('dat','Le levier commande deux calculateurs SFCC (Slat Flap Control Computers).'); ln('hg','Volets : deux moteurs hydrauliques (vert + jaune) dans le fuselage font tourner des arbres de transmission jusqu\'aux vérins à vis des chariots de volets.');
  ln('hb','Becs : moteurs hydrauliques vert + bleu, même principe. Avec un seul circuit, le mouvement se fait à demi-vitesse.'); ln('me','Les volets Fowler reculent et s\'abaissent : plus de surface et de cambrure, donc plus de portance à basse vitesse.');
  if(!(k.G||k.Y||k.B)) blk('Le levier bouge mais rien ne se passe : pas de pression hydraulique. Démarrez un moteur ou mettez Y ELEC PUMP (et PTU).','hYE'); break;
 case 'spd': o.h='Levier des aérofreins'; ln('dat','Ordre électrique aux SEC.'); ln('me','Les spoilers 2 à 4 (en vol) se lèvent sur l\'extrados : la portance diminue et la traînée augmente.'); if(!(k.G||k.B||k.Y)) blk('Pas de pression hydraulique.','hYE'); break;
 case 'gear': o.h='Levier de train';
  if(s.ground&&LASTV==='UP'){ blk('Au sol le levier est verrouillé : les amortisseurs comprimés indiquent « avion au sol ». Rentrer le train écraserait l\'avion.'); break; }
  ln('dat','Le levier commande deux calculateurs LGCIU et une vanne de sélection hydraulique.');
  ln('hg','Circuit vert : les trappes s\'ouvrent, les vérins de relevage manœuvrent les jambes, les verrous (haut ou bas) se ferment, puis les trappes se referment.');
  ln('me','Sur l\'écran WHEEL : triangle rouge en transit, vert quand le train est sorti et verrouillé.');
  if(!k.G&&!s.ground) blk('Pas de pression verte : le train ne bouge pas. Secours : manivelle de sortie par gravité (déverrouillage mécanique).'); break;
 case 'pbrake': o.h='PARK BRK — Frein de parc'; ln('hy','L\'accumulateur du circuit jaune envoie la pression aux freins carbone (multidisques) des 4 roues principales.'); ln('dat','Le frein de parc tient même moteurs arrêtés, tant que l\'accumulateur garde sa pression.'); break;
 case 'fireSim': o.h='Exercice : feu moteur 1'; ln('fire','Les deux boucles de détection autour du moteur 1 détectent une surchauffe : alarme sonore continue, ENG 1 FIRE rouge, bouton ENG 1 FIRE et voyant sur le MASTER 1 allumés.'); ln('dat','Procédure : manette 1 IDLE, ENG 1 MASTER OFF, bouton ENG 1 FIRE poussé, AGENT 1 après 10 s.'); break;
 case 'ff1': o.h='ENG 1 FIRE — Bouton-poussoir gardé';
  if(!s.ff1){ ln('fire','Bouton non poussé.'); break; }
  ln('fu','Ferme la vanne carburant basse pression (LP) dans le mât : plus d\'alimentation du moteur 1.'); ln('hg','Ferme la vanne coupe-feu hydraulique : la pompe verte n\'est plus alimentée.');
  ln('ah','Ferme la vanne de prélèvement et la vanne de pack côté 1.'); ln('el','Désexcite l\'IDG 1.'); ln('dat','Arme les agents extincteurs (voyant SQUIB) ; ils sont alimentés par les barres HOT, même batteries sur OFF.');
  if(s.m1) blk('Procédure : ENG 1 MASTER aurait dû être mis sur OFF avant. Le moteur s\'arrête de toute façon faute de carburant.','m1'); break;
 case 'ag1': o.h='AGENT 1 — Décharge extincteur';
  if(!s.ff1){ blk('Rien ne se passe : les agents ne sont armés qu\'après avoir poussé le bouton ENG 1 FIRE.','ff1'); break; }
  ln('el','Un courant de la barre HOT met à feu une cartouche pyrotechnique (squib) qui perce l\'opercule de la bouteille.'); ln('ac','L\'agent (halon) se répand dans la nacelle par une tuyauterie et étouffe le feu ; voyant DISCH.'); ln('fire',s.fire1?'Si le feu persiste 30 s après, décharger l\'AGENT 2.':'Feu éteint : voyants rouges éteints.'); break;
 case 'ptt': o.h='Alternat VHF 1 (Push To Talk)'; ln('dat','Le RMP (panneau radio) sélectionne VHF 1 sur la fréquence du contrôle ; l\'alternat met l\'émetteur en émission tant qu\'il est appuyé.'); ln('el','Les radios VHF sont alimentées en 28 V / 115 V ; l\'antenne est sur le dessus du fuselage.'); if(!k.dcAny) blk('Aucun courant : radio muette.','bat1'); break;
 case 'callMech': o.h='CALL MECH — Appel du mécanicien'; ln('el','Fait retentir un klaxon dans la case du train avant : le mécanicien au sol branche son casque sur la prise d\'interphone près du train avant.'); if(!k.dcAny) blk('Aucun courant.','bat1'); break;
 case 'callFwd': case 'callAft': o.h=(id==='callFwd'?'CALL FWD':'CALL AFT')+' — Appel cabine'; ln('el','Carillon et voyant au poste PNC '+(id==='callFwd'?'avant':'arrière')+' : le PNC décroche le combiné d\'interphone.'); break;
 case 'pa': o.h='PA — Annonce passagers'; ln('el','Le sélecteur de l\'ACP passe le micro du pilote sur les haut-parleurs de la cabine.'); break;
 case 'belts': o.h='SEAT BELTS — Consigne ceintures'; ln('lt','Allume les signaux « ceintures » au-dessus de chaque rangée, avec un carillon en cabine.'); break;
 case 'xpdr': o.h='Transpondeur'; ln('dat','AUTO : le transpondeur répond aux radars du contrôle (code à 4 chiffres, altitude) et alimente le TCAS anticollision.'); break;
 case 'mask': o.h='MASK MAN ON — Masques passagers'; ln('el','Ouvre les trappes au-dessus des sièges : les masques tombent ; tirer le masque allume un générateur chimique d\'oxygène (environ 15 minutes).'); ln('dat','Automatique si l\'altitude cabine dépasse environ 14 000 ft.'); break;
 case 'ground': o.h='Situation de l\'avion'; ln('me',s.ground?'Au sol : amortisseurs comprimés, certains systèmes sont inhibés ou limités (train verrouillé, antigivrage voilure 30 s, strobes en AUTO éteints).':'En vol : le vent relatif existe (RAT possible), le train peut se rentrer, le GPU est débranché.'); break;
 }
 return o; }

const tours={
 start:{n:'Mise en route complète (avion froid → décollage)',st:[
  ['bat1',true,'Toujours en premier : les batteries. Regardez la soute avionique s\'éclairer (électricité en bleu clair). Les écrans restent noirs : pas encore de 115 V alternatif.'],
  ['bat2',true,'Deuxième batterie. Les deux alimentent la barre DC BAT.'],
  ['ext',true,'Le groupe de parc branché au nez fournit le 115 V : écrans, calculateurs (violet) et pompes carburant s\'allument.'],
  ['ir1','NAV','Les centrales inertielles commencent leur alignement (clignotent).'],['ir2','NAV',''],['ir3','NAV',''],
  ['apuMaster',true,'Le volet d\'entrée d\'air de l\'APU s\'ouvre dans la queue.'],
  ['apuStart',true,'Démarreur électrique, puis combustion. Attendez AVAIL.',s=>s.apuSt===2,'Attendre APU AVAIL'],
  ['apuBleed',true,'L\'air comprimé de l\'APU (rouge) remplit les conduits jusqu\'aux packs et aux moteurs.'],
  ['beacon',true,'Feu anticollision : on prévient le sol que les moteurs vont démarrer.'],
  ['eMode','IGN','Les FADEC sont prêts ; les packs se fermeront pendant le démarrage.'],
  ['m2',true,'Moteur 2 en premier (il pressurise le circuit jaune : freins de parc et roulette de nez). Suivez l\'air rouge vers le démarreur, l\'allumage, puis le carburant.',s=>s.es[1]===2,'Attendre le ralenti du moteur 2'],
  ['m1',true,'Moteur 1 : même séquence. Le circuit vert monte en pression.',s=>s.es[0]===2,'Attendre le ralenti du moteur 1'],
  ['eMode','NORM','Démarrage terminé : sélecteur sur NORM.'],
  ['ext',false,'Les génératrices moteurs ont pris le relais : on débranche le groupe de parc.'],
  ['apuBleed',false,'Les moteurs fournissent leur propre air.'],['apuMaster',false,'L\'APU refroidit puis s\'arrête.'],
  ['flaps',1,'Volets 1 : les becs et volets sortent (vert, jaune, bleu).'],
  ['strobe','ON','Entrée sur la piste : strobes.'],['land',true,'Phares d\'atterrissage.'],['thr','TOGA','Pleine poussée : le FADEC augmente le carburant, N1 monte.'],
  ['ground',false,'Rotation et envol.'],['gear','UP','Train rentré par le circuit vert : trappes, jambes, verrous.',s=>s.gp<0.01,'Attendre la fin de la rentrée'],['flaps',0,'Volets rentrés.']]},
 fire:{n:'Feu moteur 1 au sol',pre:'run',st:[
  ['fireSim',true,'Le feu est détecté par les boucles autour du moteur 1.'],['thr','IDLE','Manettes au ralenti.'],['m1',false,'ENG 1 MASTER OFF : vannes carburant fermées.'],
  ['ff1',true,'Bouton ENG 1 FIRE : carburant, hydraulique vert, air et électricité du moteur 1 sont isolés ; agents armés.'],['ag1',true,'Agent 1 déchargé dans la nacelle.',s=>!s.fire1,'Attendre l\'extinction']]},
 hyd:{n:'Hydraulique : qui alimente quoi',pre:'elec',st:[
  ['flaps',1,'Volets demandés sans aucune pression : rien ne bouge (cadre ambre).'],['hYE',true,'Pompe électrique jaune : le jaune monte à 3000 psi, les volets bougent à demi-vitesse.'],
  ['ptu',true,'Le PTU démarre seul et pressurise le vert à partir du jaune.'],['stick','L','Mini-manche à gauche : les ailerons et spoilers bougent grâce au vert.'],['flaps',0,'Volets rentrés.']]}
};
function preset(n){ const s=init(); if(n==='cold') return s;
 Object.assign(s,{bat1:true,bat2:true,ext:true,ir1:'NAV',ir2:'NAV',ir3:'NAV',al:[1,1,1],nav:true}); if(n==='elec') return s;
 Object.assign(s,{beacon:true,m1:true,m2:true,es:[2,2],n2:[58.5,58.5],eg:[410,410],gP:3000,bP:3000,yP:3000,ext:false}); if(n==='run') return s;
 Object.assign(s,{ground:false,gear:'UP',gp:0,pbrake:false,thr:'CL',strobe:'AUTO',n2:[93,93],eg:[690,690],cab:6000}); return s; }
const snd=(s,d)=>{ const k=d.k; return {hum:k.acAny?1:0,fan:k.dcAny?(k.acAny?1:0.5):0,apu:s.apuN/100,eng:[0,1].map(i=>({n:s.n2[i],burn:k.burn[i]})),air:((k.sv[0]&&k.duct[0])||(k.sv[1]&&k.duct[1]))?1:((k.pack[0]||k.pack[1])?0.35:0),hyd:(s.hYE&&k.acAny?1:0)+(s.hBE&&k.acAny&&(s.es[0]===2||s.es[1]===2)?0.5:0),motor:Math.abs(s.fp-s.flaps)>0.02||(s.gp>0.01&&s.gp<0.99)||(s.apuMaster&&s.apuFlap>0&&s.apuFlap<1),ptu:k.ptuRun,ign:k.ign[0]||k.ign[1],bell:s.fire1}; };
MOD.a320={snd,name:'Airbus A320',sub:'2 turboréacteurs CFM56-5B / LEAP-1A · commandes électriques · 3 circuits hydrauliques',vb:'0 0 400 600',svg:body+parts+labels,names:NM,ctl,init,step,ev,page,ex,tours,preset,
 pages:['ELEC','APU','BLEED','ENG','HYD','FUEL','F/CTL','WHEEL','PRESS','FEUX'],legend:['el','dat','fu','hg','hb','hy','ah','ac','me','ig','hot','lt','fire'],
 presets:[['cold','Avion froid'],['elec','Sous tension'],['run','Moteurs en route'],['fly','En vol']],
 ground:{id:'ground',on:s=>{ if(s.ground){ if(s.es[0]!==2&&s.es[1]!==2) return 'Aucun moteur ne tourne : pas de poussée pour voler.'; s.ground=false; s.ext=false; s.pbrake=false; } else { if(s.gp<0.99) return 'Train rentré : sortez le train avant de vous poser !'; s.ground=true; s.rat=false; } }}};
})();

/* ===== sons de l'atelier (synthèse Web Audio, mixage indicatif) ===== */
const AU=(function(){ const A={on:true,ctx:null,v:{}}; try{ A.on=localStorage.getItem('sa-snd')!=='0'; }catch(e){}
 function init(){ if(A.ctx) return true; try{ A.ctx=(window.SND&&SND.ctx)||new (window.AudioContext||window.webkitAudioContext)(); }catch(e){ return false; } const x=A.ctx;
  A.m=x.createGain(); A.m.gain.value=0; A.m.connect(x.destination);
  const nb=x.createBuffer(1,x.sampleRate*2,x.sampleRate), d=nb.getChannelData(0); A.nb=nb; for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1;
  const voice=(name,kind,freq,ft,ff,q,lfo)=>{ let src; if(kind==='noise'){ src=x.createBufferSource(); src.buffer=nb; src.loop=true; } else { src=x.createOscillator(); src.type=kind; src.frequency.value=freq; }
   const f=x.createBiquadFilter(); f.type=ft; f.frequency.value=ff; f.Q.value=q||0.7; const g=x.createGain(); g.gain.value=0; let last=g;
   src.connect(f); if(lfo){ const am=x.createGain(); am.gain.value=0.5; const lo=x.createOscillator(); lo.type=lfo.t||'square'; lo.frequency.value=lfo.f; const la=x.createGain(); la.gain.value=0.5; lo.connect(la); la.connect(am.gain); lo.start(); f.connect(am); am.connect(g); A.v[name+'_lfo']=lo; } else f.connect(g);
   g.connect(A.m); src.start(); A.v[name]={src,f,g}; };
  voice('hum','sine',400,'lowpass',2000); voice('fan','noise',0,'bandpass',1400,0.6); voice('apu','sawtooth',300,'bandpass',900,3); voice('apuN','noise',0,'bandpass',2500,1.2);
  [0,1].forEach(i=>{ voice('ew'+i,'sawtooth',300,'bandpass',1200,4); voice('er'+i,'noise',0,'lowpass',380); voice('ef'+i,'noise',0,'bandpass',900,0.8); });
  voice('air','noise',0,'highpass',2400); voice('hyd','square',95,'lowpass',500); voice('motor','sawtooth',150,'lowpass',900); voice('ptu','square',230,'lowpass',900,1,{f:2.6});
  voice('rot','noise',0,'lowpass',260,1,{f:18,t:'square'}); voice('pist','sawtooth',120,'lowpass',420); voice('ign','noise',0,'highpass',4200,1,{f:1.6}); voice('bell','sine',1150,'lowpass',3000,1,{f:14});
  return true; }
 const set=(n,g,f,ff)=>{ const v=A.v[n]; if(!v) return; const t=A.ctx.currentTime; v.g.gain.setTargetAtTime(g,t,0.12); if(f!=null&&v.src.frequency) v.src.frequency.setTargetAtTime(f,t,0.25); if(ff!=null) v.f.frequency.setTargetAtTime(ff,t,0.25); };
 const lfo=(n,f)=>{ const l=A.v[n+'_lfo']; if(l) l.frequency.setTargetAtTime(f,A.ctx.currentTime,0.2); };
 function blip(f,dur,type,vol){ if(!A.on||!init()) return; const x=A.ctx, o=x.createOscillator(), g=x.createGain(), t=x.currentTime; o.type=type||'square'; o.frequency.value=f; g.gain.setValueAtTime(vol||0.12,t); g.gain.exponentialRampToValueAtTime(0.0001,t+dur); o.connect(g); g.connect(x.destination); o.start(t); o.stop(t+dur+0.02); }
 A.click=()=>{ blip(2200,0.03,'square',0.08); setTimeout(()=>blip(1400,0.025,'square',0.05),25); };
 A.chime=()=>{ blip(660,0.5,'sine',0.18); };
 A.ok=()=>{ blip(880,0.12,'sine',0.1); setTimeout(()=>blip(1320,0.18,'sine',0.09),110); };
 A.foot=()=>{ if(!A.on||!init()) return; const x=A.ctx, t=x.currentTime, b=x.createBufferSource(); b.buffer=A.nb; const f=x.createBiquadFilter(); f.type='lowpass'; f.frequency.value=650+Math.random()*250; const g=x.createGain(); g.gain.setValueAtTime(0.0001,t); g.gain.linearRampToValueAtTime(0.22,t+0.008); g.gain.exponentialRampToValueAtTime(0.0001,t+0.09); b.connect(f); f.connect(g); g.connect(x.destination); b.start(t,Math.random()); b.stop(t+0.12); };
 A.radio=()=>{ blip(1000,0.05,'square',0.05); setTimeout(()=>blip(1500,0.04,'square',0.04),60); };
 A.cabin=()=>{ blip(988,0.6,'sine',0.12); setTimeout(()=>blip(784,0.9,'sine',0.11),420); };
 A.horn=()=>{ blip(420,0.7,'sawtooth',0.07); };
 A.mute=()=>{ if(A.m) A.m.gain.setTargetAtTime(0,A.ctx.currentTime,0.1); };
 A.toggle=()=>{ A.on=!A.on; try{ localStorage.setItem('sa-snd',A.on?'1':'0'); }catch(e){} const b=document.querySelector('#sysat [data-snd]'); if(b) b.textContent=A.on?'🔊':'🔇'; if(!A.on) A.mute(); else { init(); A.ctx.resume&&A.ctx.resume(); } };
 A.update=()=>{ const b=document.querySelector('#sysat [data-snd]'); if(b&&b.textContent!==(A.on?'🔊':'🔇')) b.textContent=A.on?'🔊':'🔇';
  if(!A.on||!M||!M.snd||!D) return; if(!init()) return; if(A.ctx.state==='suspended'){ A.ctx.resume(); } A.m.gain.setTargetAtTime(0.9,A.ctx.currentTime,0.2);
  const x=M.snd(S,D)||{}; set('hum',0.025*(x.hum||0)); set('fan',0.05*(x.fan||0));
  const ap=x.apu||0; set('apu',ap>0.02?0.035:0,180+ap*820); set('apuN',0.07*ap,null,1200+ap*2600);
  [0,1].forEach(i=>{ const e=(x.eng||[])[i]||{n:0,burn:0}, n=e.n/100; set('ew'+i,n>0.02?0.035*Math.min(1,n*3):0,140+n*1800,300+n*3000); set('er'+i,e.burn?0.10+0.12*n:0,null,250+n*500); set('ef'+i,0.09*n*n,null,500+n*1600); });
  set('air',0.06*(x.air||0)); set('hyd',0.03*Math.min(2,x.hyd||0)); set('motor',(x.motor||performance.now()<VEH)?0.04:0); set('ptu',x.ptu?0.09:0); set('ign',x.ign?0.06:0); set('bell',x.bell?0.07:0);
  const r=x.rot||0; set('rot',r>0.02?0.22*Math.min(1,r):0,null,180+r*200); lfo('rot',Math.max(2,(x.bf||18)*r)); const p=x.pist||0; set('pist',p>0.02?0.08:0,30+p*1.1,300+p*4); };
 addEventListener('pointerdown',()=>{ if(A.on&&!document.getElementById('sysat')?.hidden) { init(); A.ctx&&A.ctx.resume&&A.ctx.resume(); } },{capture:true});
 return A; })();
/* ================= MOTEUR DE L'ATELIER ================= */
const $s=q=>document.querySelector('#sysat '+q);
function dom(){ let a=document.getElementById('sysat'); if(a) return a; a=document.createElement('section'); a.id='sysat'; a.hidden=true; a.setAttribute('aria-label','Atelier des systèmes');
 a.innerHTML=`<header><div class="tt"><b>⚙ Atelier<span class="tl"> des systèmes</span></b><span>Touchez une commande : les pièces qu'elle actionne se colorent sur le schéma, l'écran système réagit.</span></div>
  <select data-acsel aria-label="Appareil"></select><button type="button" data-ckl title="Checklist des étapes">☑</button><button type="button" data-snd aria-label="Son">🔊</button><button type="button" data-help>?</button><button type="button" data-x aria-label="Fermer">✕</button><div class="modes"><button type="button" data-mode="libre">✋ <span>Libre</span></button><button type="button" data-mode="auto">▶ <span>Auto</span><i>matique</i></button><button type="button" data-mode="peda">🎓 <span>Pédago</span><i>gique</i></button><button type="button" data-mode="exam">📝 <span>Examen</span></button></div><div class="pre"></div></header>
  <div class="main"><div class="top"><div class="sch"><svg class="ac" xmlns="http://www.w3.org/2000/svg"></svg></div><div class="scrw"><div class="tabs"></div><div class="scr"></div></div><div class="strip" hidden></div><div class="dlg" hidden><div class="av"></div><div class="tx"><b></b><span></span><small></small></div><div class="db"><button type="button" data-dv title="Voix">🔈</button><button type="button" data-da title="Audio seul">🎧</button></div></div></div>
  <div class="mid"><div class="tour" hidden></div><div class="ex"></div><div class="pinfo" hidden></div><div class="leg"></div><div class="sitw"></div></div><div class="ctl"></div></div>`;
 document.body.appendChild(a);
 a.addEventListener('click',e=>{ const b=e.target.closest('button,[data-p]'); if(!b) return; const d=b.dataset;
  if(d.x!=null) return close();
  if(d.p!=null&&b.closest('svg.ac')) return partInfo(d.p);
  if(d.c!=null) return act(d.c, d.v!=null?parseV(d.v):undefined);
  if(d.pg!=null){ PAGE=d.pg; pgPrev=''; paint(true); return; }
  if(d.pre!=null){ setPreset(d.pre); return; }
  if(d.tour!=null) return tourPick(MODE==='libre'?'peda':MODE);
  if(d.mode!=null) return setMode(d.mode);
  if(d.snd!=null) return AU.toggle();
  if(d.ckl!=null) return ckl();
  if(d.cki!=null){ const st=TOUR&&TOUR.st[+d.cki]; if(st&&st.c){ frame(st.c,'fneed'); scrollTo(st.c); } return; }
  if(d.tpa!=null){ AUTO.pause=!AUTO.pause; renderTour(); return; }
  if(d.thint!=null) return hint();
  if(d.dv!=null){ DLG.voice=!DLG.voice; if(!DLG.voice) try{ speechSynthesis.cancel(); }catch(e){} dlgBtns(); return; }
  if(d.da!=null){ DLG.ao=!DLG.ao; if(DLG.ao) DLG.voice=true; dlgBtns(); return; }
  if(d.tp!=null) return tourStart(d.tp,d.tm);
  if(d.tdo!=null) return tourDo(); if(d.tnx!=null) return tourNext(); if(d.tq!=null){ return setMode('libre'); }
  if(d.go!=null) return flashCtl(d.go);
  if(d.hp!=null) return touch([d.hp]);
  if(d.help!=null) return help();
  if(d.sit!=null) return act('ground'); });
 a.querySelector('[data-acsel]').addEventListener('change',e=>load(e.target.value));
 return a; }
function parseV(v){ return v==='true'?true:v==='false'?false:(/^-?\d+$/.test(v)?+v:v); }
function relayout(){ const a=dom(), mob=matchMedia('(max-width:900px)').matches, a2=a, main=a.querySelector('.main'), top=a.querySelector('.top'), sch=a.querySelector('.sch'), scrw=a.querySelector('.scrw'), mid=a.querySelector('.mid'), ctl=a.querySelector('.ctl');
 if(mob){ if(sch.parentNode!==top){ top.append(sch,scrw); } top.style.display=''; main.prepend(top); main.append(mid,ctl); }
 else { top.style.display='none'; main.append(ctl,mid,sch); mid.prepend(scrw); const dl=a.querySelector('.dlg'); if(dl&&dl.parentNode!==sch) sch.insertBefore(dl,sch.children[1]||null); }
 if(mob){ const dl=a.querySelector('.dlg'); if(dl&&dl.parentNode!==top) top.appendChild(dl); } }
function load(ac){ M=MOD[ac]; if(!M) return; AC=ac; S=M.preset?M.preset(PRE='cold'):M.init(); world(); LAST=null; TOUR=null; PAGE=M.pages[0]; exPrev=''; pgPrev='';
 const a=dom(); a.querySelector('[data-acsel]').innerHTML=Object.keys(MOD).map(k=>`<option value="${k}" ${k===ac?'selected':''}>${MOD[k].name}</option>`).join('');
 a.querySelector('.tt > span').textContent=M.sub;
 const svg=a.querySelector('svg.ac'); svg.setAttribute('viewBox',M.vb); svg.innerHTML='<g class="env"></g>'+M.svg+'<g class="actors"></g><g class="fx"></g><g class="tags"></g><text class="hud" x="6" y="14"></text>'; ENVK='';
 svg.querySelectorAll('[data-p]').forEach(el=>{ el._k=''; const t=document.createElementNS('http://www.w3.org/2000/svg','title'); t.textContent=M.names[el.dataset.p]||el.dataset.p; el.appendChild(t); });
 a.querySelector('.pre').innerHTML=(M.presets||[]).map(p=>`<button type="button" data-pre="${p[0]}" class="${p[0]===PRE?'on':''}">${p[1]}</button>`).join('');
 a.querySelector('.leg').innerHTML=M.legend.map(c=>`<span><i style="background:${C[c]}"></i>${LEGN[c]}</span>`).join('')+'<span><i style="background:#fff;box-shadow:0 0 5px #fff"></i>Pièce touchée par la commande</span><span><i style="background:none;border:2px solid #ffa21a"></i>Commandé mais bloqué</span>';
 a.querySelector('.ctl').innerHTML=(M.ground?`<div class="grp"><h4>Situation <small>simulée</small></h4><div class="row"><div class="sel"><span class="l">L'AVION EST</span><div class="seg"><button type="button" data-sit>…</button></div></div></div></div>`:'')+
  M.ctl.map(g=>`<div class="grp"><h4>${g.g}<small>${g.w||''}</small></h4><div class="row">${g.c.map(cHTML).join('')}</div></div>`).join('');
 a.querySelector('.tabs').innerHTML=M.pages.map(p=>`<button type="button" data-pg="${p}">${p}</button>`).join('');
 explainIntro(); MODE='libre'; setMode('libre'); relayout(); D=M.ev(S); paint(true); }
function cHTML(c){ if(c.t==='pb'||c.t==='mom') return `<button type="button" class="pb ${c.t==='mom'?'mom':''} ${c.grd?'grd':''}" data-c="${c.id}" title="${c.l}"><span class="k"><i class="u"></i><i class="d"></i></span><span class="l">${c.l}</span></button>`;
 if(c.t==='sw') return `<div class="sel" data-cw="${c.id}"><span class="l">${c.l}</span><div class="seg"><button type="button" data-c="${c.id}" data-v="false">OFF</button><button type="button" data-c="${c.id}" data-v="true">ON</button></div></div>`;
 if(c.t==='sel') return `<div class="sel" data-cw="${c.id}"><span class="l">${c.l}</span><div class="seg">${c.o.map((v,i)=>`<button type="button" data-c="${c.id}" data-v="${v}">${c.ol[i]}</button>`).join('')}</div></div>`;
 if(c.t==='pad') return `<div class="sel" data-cw="${c.id}"><span class="l">${c.l}</span><div class="seg">${c.o.map(o=>`<button type="button" data-c="${c.id}" data-v="${o[0]}">${o[1]}</button>`).join('')}</div></div>`; return ''; }
function findC(id){ for(const g of M.ctl) for(const c of g.c) if(c.id===id) return c; return null; }
function act(id,v){ if(!M) return; let c=findC(id); AU.click();
 if(TOUR&&(MODE==='peda'||MODE==='exam')&&!SELF){ const st=TOUR.st[TI]; if(st&&!st.done&&!matches(st,id,v)){ wrong(id,v,st); return; } }
 if(id==='ground'&&M.ground){ const r=M.ground.on(S); LAST='ground'; LASTV=S.ground; if(r){ showBlock('Situation',r); return; } D=M.ev(S); explain(true); paint(true); return; }
 if(!c) return; const prev=S[id];
 if(c.t==='pb') S[id]=!S[id]; else if(c.t==='mom'){ v=true; } else if(c.t==='pad'){ S[id]=v; S[id+'T']=1.8; } else S[id]=v;
 if(M.on){ const r=M.on(S,id,S[id],prev,v); if(r&&r.revert){ S[id]=prev; } }
 else defaultOn(id,prev,v);
 LAST=id; LASTV=c.t==='pb'?S[id]:v; if(c.pg){ PAGE=c.pg; pgPrev=''; }
 touch(c.pt||[]); D=M.ev(S); explain(true); paint(true); tourCheck(id,v); }
function defaultOn(id,prev,v){ const s=S; /* A320 */
 if(AC!=='a320'&&AC!=='a350') return;   // V10.42 : l'A350 reprend le schéma Airbus de l'A320 (APU, démarrage…)
 if(id==='apuStart'){ if(s.apuMaster&&s.apuSt===0&&(s.bat1||s.bat2||s.ext)) s.apuSt=1; }
 if((id==='m1'||id==='m2')){ const i=+id[1]-1; if(s[id]&&!prev&&s.eMode==='IGN'&&s.es[i]===0&&s.n2[i]<10){ s.es[i]=1; s.sf[i]=0; } }
 if(id==='gear'&&s.ground&&v==='UP'){ s.gear='DOWN'; }
 if(id==='rat'){ s.rat=true; } if(id==='fireSim'){ s.fire1=true; s.ag1=false; s.agT=0; } if(id==='ff1'){ s.ff1=true; } if(id==='ag1'){ if(s.ff1) s.ag1=true; }
 if(id==='ext'&&!s.ground) s.ext=false;
 if(id==='mask') s.masks=true;
 if(!SELF){ const k=kk(s);
  if(id==='callMech'){ AU.horn(); if(s.ground) say([['MECA','Oui cockpit, ici le sol, je vous écoute.']]); }
  if(id==='callFwd'||id==='callAft'){ AU.cabin(); say([['PNC','Cockpit, j\'écoute ?']]); }
  if(id==='pa') say([['PA','Mesdames et messieurs, ici le commandant de bord. Bienvenue à bord.']]);
  if(id==='ptt'&&k.dcAny) say([['OPL','Kennedy Ground, Air Trajectoires one two three, radio check.'],['GND','Air Trajectoires one two three, reading you five.','Je vous reçois 5 sur 5.']]);
  if(id==='belts'&&v) { AU.cabin(); } } }
function showBlock(h,t){ AU.chime(); const e=$s('.ex'); e.innerHTML=`<h3>${h}</h3><div class="blk">⚠ ${t}</div>`; exPrev=''; }
function touch(ids){ TCH=ids.slice(); tTch=performance.now()+4500; const svg=$s('svg.ac'), g=svg.querySelector('.tags'); g.innerHTML='';
 const seen={}; ids.forEach(id=>{ const el=svg.querySelector(`[data-p="${id}"]`); if(!el||seen[id]) return; seen[id]=1; let bb; try{ bb=el.getBBox(); }catch(e){ return; }
  const nm=(M.names[id]||id).split(/[(:,—]/)[0].trim().slice(0,30), vb=svg.viewBox.baseVal, cx=bb.x+bb.width/2, cy=bb.y+bb.height/2, mid=Math.abs(cx-vb.width/2)<vb.width*0.07, right=mid||cx>vb.width/2, tx=right?Math.min(vb.width-6,(mid?vb.width/2+40:cx+26)):Math.max(6,cx-26), ty=cy-4+(Object.keys(seen).length%3)*8-8;
g.insertAdjacentHTML('beforeend',`<line x1="${cx}" y1="${cy}" x2="${tx}" y2="${ty}"/><text x="${tx}" y="${ty-2}" text-anchor="${right?'start':'end'}">${nm}</text>`); }); }
function flashCtl(id){ const el=document.querySelector(`#sysat [data-c="${id}"]`); if(!el) return; const w=el.closest('.sel')||el; w.scrollIntoView({block:matchMedia('(max-width:900px)').matches?'end':'center',behavior:'smooth'}); w.classList.remove('flash'); void w.offsetWidth; w.classList.add('flash'); }
function partInfo(id){ const el=$s('.pinfo'); const by=[]; M.ctl.forEach(g=>g.c.forEach(c=>{ if((c.pt||[]).includes(id)) by.push(c); }));
 el.hidden=false; el.innerHTML=`<b>${M.names[id]||id}</b>${by.length?`<div class="chips">Actionnée par : ${by.map(c=>`<button type="button" data-go="${c.id}">${c.l}</button>`).join('')}</div>`:''}`; touch([id]); }
function explainIntro(){ $s('.ex').innerHTML=`<h3>${M.name} — comment lire l'atelier</h3><div class="w">${M.sub}</div><ol>
 <li><i style="color:${C.el};background:${C.el}"></i>Touchez une commande (bouton à voyant, sélecteur, levier). Ce panneau explique l'action <b>électrique, électronique, hydraulique, pneumatique ou mécanique</b> qu'elle produit, pièce par pièce.</li>
 <li><i style="color:#fff;background:#fff"></i>Les pièces touchées s'entourent de blanc avec leur nom ; les couleurs montrent ce qui circule (voir la légende).</li>
 <li><i style="color:${C.warn};background:${C.warn}"></i>L'ordre compte : si une condition manque, rien ne se passe et un cadre ambre indique quoi faire.</li>
 <li><i style="color:${C.me};background:${C.me}"></i>Touchez une pièce du schéma pour voir son nom et les commandes qui l'actionnent. « Démonstration commentée » enchaîne une procédure réelle.</li></ol>`; exPrev=''; }
function explain(force){ if(!LAST) return; if(exPrev==='__ckl'&&!force) return; const o=LAST==='ground'?M.ex('ground',S,D):M.ex(LAST,S,D); if(!o||!o.h) return; const c=findC(LAST);
 const html=`<h3>${o.h}</h3><div class="w">${c&&c.w?c.w:(c?(M.ctl.find(g=>g.c.includes(c))||{}).w||'':'')}</div><ol>${o.ln.map(l=>`<li><i style="color:${C[l[0]]};background:${C[l[0]]}"></i><span>${l[1]}</span></li>`).join('')}</ol>
  ${o.blk?`<div class="blk">⚠ ${o.blk}${o.go?`<br><button type="button" data-go="${o.go}">Montrer la commande à utiliser</button>`:''}</div>`:''}
  ${c&&c.pt?`<div class="chips">Pièces touchées : ${c.pt.map(p=>`<button type="button" data-hp="${p}">${(M.names[p]||p).split(/[(:,—]/)[0].trim()}</button>`).join('')}</div>`:''}<div class="live">${D.lv.join('\n')}</div>`;
 if(html!==exPrev){ $s('.ex').innerHTML=html; exPrev=html; } }
function paint(force){ if(!M||!D) return; const a=dom(), svg=a.querySelector('svg.ac'), now=performance.now(), tch=now<tTch?TCH:[];
 if(!(now<tTch)&&svg.querySelector('.tags').childNodes.length) svg.querySelector('.tags').innerHTML='';
 svg.querySelectorAll('[data-p]').forEach(el=>{ const id=el.dataset.p, v=D.p[id], c=v?(Array.isArray(v)?v[0]:v):'', m=v&&Array.isArray(v)?v[1]:'', t=tch.includes(id), key=c+'|'+m+'|'+t+'|'+(D.sp&&D.sp[id]||'');
  if(el._k===key) return; el._k=key; el.classList.remove('on','flow','rev','blink','dim','st','spin','tch');
  if(c){ el.classList.add('on'); el.style.setProperty('--c',C[c]||c); if(m) m.split(' ').forEach(x=>el.classList.add(x)); }
  if(D.sp&&D.sp[id]) el.style.setProperty('--sp',D.sp[id]); if(t) el.classList.add('tch'); });
 // commandes
 M.ctl.forEach(g=>g.c.forEach(c=>{ if(c.t==='pb'||c.t==='mom'){ const el=a.querySelector(`[data-c="${c.id}"] .k`); if(!el) return; const l=c.lt?c.lt(S):['',''], h=l.map(x=>{ if(!x) return ''; const [t,col]=x.split('|'); return `<span style="color:${{wh:'#f2f4f6',cy:'#3fd0ff',gn:'#3ddc84',am:'#ffa21a',rd:'#ff3b30'}[col]};text-shadow:0 0 6px currentColor">${t}</span>`; });
   const html=`<i class="u">${h[0]}</i><i class="d">${h[1]}</i>`; if(el._h!==html){ el.innerHTML=html; el._h=html; } }
  else { const v=c.t==='pad'?S[c.id]:S[c.id]; a.querySelectorAll(`[data-cw="${c.id}"] [data-v]`).forEach(b=>b.classList.toggle('on',String(parseV(b.dataset.v))===String(v))); } }));
 const sit=a.querySelector('[data-sit]'); if(sit&&M.ground){ const t=S.ground?'AU SOL → passer EN VOL':'EN VOL → se poser'; if(sit.textContent!==t) sit.textContent=t; }
 a.querySelectorAll('.tabs [data-pg]').forEach(b=>b.classList.toggle('on',b.dataset.pg===PAGE));
 const ph=M.page(PAGE,S,D); if(ph!==pgPrev){ a.querySelector('.scr').innerHTML=ph; pgPrev=ph; }
 if(force||Math.floor(now/600)!==Math.floor(tPrev/600)) explain(); tPrev=now; }
function loop(){ if(!M||dom().hidden) return; const now=performance.now(), dt=Math.min(1,(now-(loop.t||now))/1000); loop.t=now; M.step(S,dt); wstep(dt); D=M.ev(S); paint(); paintWorld(); dlgTick(); if(TOUR){ tourTick(); renderTour(true); } AU.update(); }
function setPreset(n){ PRE=n; S=M.preset(n); world(); LAST=null; exPrev=''; pgPrev=''; dom().querySelectorAll('.pre button').forEach(b=>b.classList.toggle('on',b.dataset.pre===n)); explainIntro(); D=M.ev(S); paint(true); }
/* ===== dialogues : équipage, sol, tour, cabine (texte + voix) ===== */
const ROLES={CDB:['Commandant de bord','#e04ad8','👨‍✈️'],OPL:['Copilote','#3fd0ff','🧑‍✈️'],PNC:['Chef de cabine','#f2f4f6','💁'],MECA:['Mécanicien sol (casque)','#ffe14a','🎧'],CLR:['Kennedy Clearance (prévol)','#3ddc84','🗼'],GND:['Contrôle Sol','#3ddc84','🗼'],TWR:['Tour de contrôle','#3ddc84','🗼'],DEP:['Départ / Radar','#3ddc84','📡'],APP:['Approche','#3ddc84','📡'],PA:['Annonce passagers','#ffa21a','📢'],ECAM:['Alarme / voix synthétique','#ff3b30','⚠'],PAX:['Passager','#9fb3c4','🧳']};
const DLG={q:[],cur:null,until:0,voice:true,ao:false}; try{ const v=JSON.parse(localStorage.getItem('sa-dlg')||'{}'); if(v.voice===false) DLG.voice=false; if(v.ao) DLG.ao=true; }catch(e){}
function say(lines){ (lines||[]).forEach(l=>DLG.q.push(l)); }
function dlgIdle(){ return !DLG.q.length&&(!DLG.cur||performance.now()>DLG.until); }
function dlgClear(){ DLG.q=[]; DLG.cur=null; try{ speechSynthesis.cancel(); }catch(e){} const b=$s('.dlg'); if(b) b.hidden=true; }
function dlgBtns(){ const b=$s('.dlg'); if(!b) return; b.classList.toggle('ao',DLG.ao); b.querySelector('[data-dv]').classList.toggle('off',!DLG.voice); b.querySelector('[data-dv]').textContent=DLG.voice?'🔈':'🔇'; b.querySelector('[data-da]').classList.toggle('off',!DLG.ao); try{ localStorage.setItem('sa-dlg',JSON.stringify({voice:DLG.voice,ao:DLG.ao})); }catch(e){} }
function dlgTick(){ const now=performance.now(), box=$s('.dlg'); if(!box) return;
 if(DLG.cur&&now<DLG.until) return; if(!DLG.q.length){ if(DLG.cur&&now>DLG.until+2500){ DLG.cur=null; box.hidden=true; } return; }
 const l=DLG.q.shift(); DLG.cur=l; const r=ROLES[l[0]]||[l[0],'#fff','💬'], en=!!l[2]; DLG.until=now+Math.max(1700,l[1].length*(en?62:58))+400;
 box.hidden=false; dlgBtns(); const av=box.querySelector('.av'); av.textContent=r[2]; av.style.color=r[1]; box.querySelector('.tx b').textContent=r[0]; box.querySelector('.tx b').style.color=r[1]; box.querySelector('.tx span').textContent=(en?'« ':'')+l[1]+(en?' »':''); box.querySelector('.tx small').textContent=en?'🇫🇷 '+l[2]:'';
 if(['MECA','CLR','GND','TWR','DEP','APP'].includes(l[0])) AU.radio(); if(l[0]==='PA'||l[0]==='PNC') AU.cabin();
 if(DLG.voice&&AU.on){ try{ const u=new SpeechSynthesisUtterance(l[1]); u.lang=en?'en-US':'fr-FR'; u.rate=en?1.08:1.05; u.pitch={CDB:0.85,OPL:1.05,PNC:1.25,MECA:0.95,PA:1.0,ECAM:0.7}[l[0]]||1; const vs=speechSynthesis.getVoices().filter(v=>v.lang&&v.lang.startsWith(en?'en':'fr')); if(vs.length) u.voice=vs[(l[0].length)%vs.length];
   u.onend=()=>{ DLG.until=Math.min(DLG.until,performance.now()+300); }; DLG.until=now+Math.max(2500,l[1].length*80)+800; speechSynthesis.speak(u); }catch(e){} } }
/* ===== monde vu de dessus : décor qui défile, vol simplifié, personnages ===== */
let ENVK='';
function world(){ const air=S&&S.ground===false; S.fl={alt:air?35000:0,ias:air?280:0,vs:0,tAlt:null,tIas:null,rate:1500,acc:5,env:air?'air':(M.pad?'pad':'park'),scroll:0,dir:1,ph:''}; S.act={}; }
function wstep(dt){ const f=S.fl; if(!f) return;
 if(f.tIas!=null) f.ias+=Math.sign(f.tIas-f.ias)*Math.min(Math.abs(f.tIas-f.ias),f.acc*dt*3);
 const a0=f.alt; if(f.tAlt!=null) f.alt+=Math.sign(f.tAlt-f.alt)*Math.min(Math.abs(f.tAlt-f.alt),f.rate*dt); f.vs=Math.abs(f.alt-a0)<0.01?0:Math.sign(f.alt-a0)*Math.round(Math.max(500,Math.min(6000,f.rate*1.2))/100)*100;
 const sp=f.env==='air'?f.ias*0.25:f.env==='water'?f.ias*0.5:f.ias*0.9; f.scroll+=sp*dt*f.dir;
 for(const id in S.act){ const a=S.act[id]; if(!a.path||!a.path.length) continue; const [tx,ty]=a.path[0], dx=tx-a.x, dy=ty-a.y, d=Math.hypot(dx,dy), st=(a.spd||22)*dt; if(d<=st){ a.x=tx; a.y=ty; a.path.shift(); } else { a.x+=dx/d*st; a.y+=dy/d*st; } if(a.foot){ a.acc=(a.acc||0)+Math.min(d,st); if(a.acc>11){ a.acc=0; AU.foot(); } } if(a.veh) VEH=performance.now()+400; } }
let VEH=0;
function moveActor(id,path,o){ o=o||{}; let a=S.act[id]; const def=(M.actors||{})[id.replace(/\d+$/,'')]||(M.actors||{})[id]||{c:'#fff',l:id};
 if(!a||o.at){ const p0=o.at||(path&&path[0])||[0,0]; a=S.act[id]={ac:o.ac||def.ac,rot:o.rot||def.rot,sc:o.sc||def.sc,x:p0[0],y:p0[1],c:o.c||def.c,l:o.l!=null?o.l:def.l,r:o.r||def.r||5,sq:o.sq||def.sq,w:o.w||def.w,h:o.h||def.h,spd:o.spd||def.spd,foot:o.foot!=null?o.foot:def.foot,veh:def.veh||o.veh,path:[]}; }
 if(o.hide){ delete S.act[id]; return; } a.path=(path||[]).map(p=>p.slice()); if(o.spd) a.spd=o.spd; }
function actorsIdle(ids){ return (ids||Object.keys(S.act)).every(id=>!S.act[id]||!S.act[id].path.length); }
function paintWorld(){ if(!M||!S.fl) return; const svg=$s('svg.ac'), f=S.fl, vb=svg.viewBox.baseVal, W=vb.width, H=vb.height, env=svg.querySelector('.env');
 const key=f.env+(f.apt||''); if(key!==ENVK){ ENVK=key; let h='';
  if(f.env==='park') h=`<rect width="${W}" height="${H}" fill="#1b2128"/><rect x="0" y="0" width="${W*0.27}" height="${H*0.12}" fill="#2a3a4c" stroke="#5f7d99"/><text x="6" y="16" fill="#9fb3c4" font-size="9" font-weight="700">TERMINAL ${S.fl&&S.fl.apt||''}</text><text x="6" y="30" fill="#6f8aa3" font-size="8">Salle d'équipage · Porte 7</text><path class="mv" d="M${W/2} -60 V${H+60}" stroke="#e8c33a" stroke-width="3" stroke-dasharray="30 12"/><path class="mv" d="M${W*0.12} -60 V${H+60} M${W*0.88} -60 V${H+60}" stroke="#e8eef233" stroke-width="2" stroke-dasharray="60 20"/>`;
  else if(f.env==='pad') h=`<rect width="${W}" height="${H}" fill="#1b2128"/><circle cx="${W/2}" cy="${H*0.42}" r="${W*0.3}" fill="none" stroke="#e8eef244" stroke-width="5"/><text x="${W/2}" y="${H*0.42+40}" text-anchor="middle" fill="#e8eef222" font-size="120" font-weight="700">H</text>`;
  else if(f.env==='taxi') h=`<rect width="${W}" height="${H}" fill="#14181b"/><rect x="${W*0.3}" y="0" width="${W*0.4}" height="${H}" fill="#23292f"/><path class="mv" d="M${W/2} -60 V${H+60}" stroke="#e8c33a" stroke-width="3" stroke-dasharray="26 14"/><path class="mv" d="M${W*0.3} -60 V${H+60} M${W*0.7} -60 V${H+60}" stroke="#4a8bff" stroke-width="4" stroke-linecap="round" stroke-dasharray="0.1 40"/>`;
  else if(f.env==='rwy') h=`<rect width="${W}" height="${H}" fill="#101315"/><rect x="${W*0.3}" y="0" width="${W*0.4}" height="${H}" fill="#2b3036"/><path class="mv" d="M${W/2} -60 V${H+60}" stroke="#fff" stroke-width="4" stroke-dasharray="30 30"/><path class="mv" d="M${W*0.3} -60 V${H+60} M${W*0.7} -60 V${H+60}" stroke="#fff6c0" stroke-width="5" stroke-linecap="round" stroke-dasharray="0.1 36"/>`;
  else if(f.env==='grass') h=`<rect width="${W}" height="${H}" fill="#16301c"/><rect x="${W*0.3}" y="${H*0.78}" width="${W*0.4}" height="${H*0.22}" fill="#2b3036"/><path d="M${W*0.3} ${H*0.78} H${W*0.7}" stroke="#ff3b30" stroke-width="5" stroke-dasharray="4 10"/>${[...Array(30).keys()].map(i=>`<circle class="mvg" data-y="${(i*41)%H}" cx="${(i*67)%W}" cy="0" r="3" fill="#2f5a36"/>`).join('')}`;
  else if(f.env==='water') h=`<rect width="${W}" height="${H}" fill="#0a3a57"/>${[...Array(14).keys()].map(i=>`<path class="mv" d="M${(i*53)%W} -60 V${H+60}" stroke="#ffffff22" stroke-width="2" stroke-dasharray="14 40"/>`).join('')}`;
  else h=`<rect class="sky" width="${W}" height="${H}" fill="#0b2a44"/>${[...Array(9).keys()].map(i=>`<ellipse class="cl" data-y="${(i*137)%H}" cx="${(i*97+40)%W}" cy="0" rx="${30+(i*13)%40}" ry="${12+(i*7)%14}" fill="#ffffff" opacity="0.13"/>`).join('')}`;
  env.innerHTML=h; }
 const sc=f.scroll; env.querySelectorAll('.mv').forEach(e=>e.setAttribute('stroke-dashoffset',(-sc).toFixed(1)));
 if(f.env==='grass') env.querySelectorAll('.mvg').forEach(e=>e.setAttribute('cy',(((+e.dataset.y+sc*0.9)%(H+20))-10).toFixed(1)));
 if(f.env==='air'){ const sky=env.querySelector('.sky'); if(sky){ const t=Math.min(1,f.alt/35000); sky.setAttribute('fill',`rgb(${Math.round(40-30*t)},${Math.round(80-50*t)},${Math.round(120-50*t)})`); }
  env.querySelectorAll('.cl').forEach(e=>{ const y=((+e.dataset.y+sc*0.6)%(H+80))-40; e.setAttribute('cy',y.toFixed(1)); e.setAttribute('opacity',f.alt>30000?0.06:0.14); }); }
 const g=svg.querySelector('.actors'); let ah=''; for(const id in S.act){ const a=S.act[id]; ah+=a.ac?`<path transform="translate(${a.x.toFixed(1)} ${a.y.toFixed(1)}) rotate(${a.rot||0}) scale(${a.sc||1.6})" d="M0 -14 L2.5 -4 L14 2 L14 5 L2.5 2 L2 10 L6 13 L6 15 L-6 15 L-6 13 L-2 10 L-2.5 2 L-14 5 L-14 2 L-2.5 -4 Z" fill="${a.c}" stroke="#000" stroke-width=".6"/>`:a.sq?`<rect x="${(a.x-(a.w||16)/2).toFixed(1)}" y="${(a.y-(a.h||10)/2).toFixed(1)}" width="${a.w||16}" height="${a.h||10}" rx="2" fill="${a.c}" stroke="#000"/>`:`<circle cx="${a.x.toFixed(1)}" cy="${a.y.toFixed(1)}" r="${a.r}" fill="${a.c}" stroke="#fff" stroke-width="${a.r>3?1.2:0.5}"/>`; if(a.l) ah+=`<text x="${(a.x+(a.sq?(a.w||16)/2:a.r)+2).toFixed(1)}" y="${(a.y+3).toFixed(1)}">${a.l}</text>`; } if(g._h!==ah){ g.innerHTML=ah; g._h=ah; }
 const fx=svg.querySelector('.fx'); let fh=''; const t=performance.now()/1000;
 if(f.fx==='impact') fh=`<rect width="${W}" height="${H}" fill="#ff2000" opacity="${(0.25+0.2*Math.sin(t*9)).toFixed(2)}"/>${[1,2,3].map(i=>`<circle cx="${W/2}" cy="${f.fy||H*0.45}" r="${(((t*120+i*60)%180)+10).toFixed(0)}" fill="none" stroke="#ffb020" stroke-width="3" opacity="${(1-((t*120+i*60)%180)/180).toFixed(2)}"/>`).join('')}<text x="${W/2}" y="${H*0.12}" text-anchor="middle" fill="#fff" font-size="26" font-weight="800" stroke="#000" stroke-width="1">${f.fxt||'IMPACT'}</text>`;
 else if(f.fx==='sparks') fh=[...Array(26).keys()].map(i=>`<circle cx="${(W/2+(Math.random()-0.5)*40).toFixed(1)}" cy="${(H*0.25+Math.random()*H*0.6).toFixed(1)}" r="${(1+Math.random()*2.2).toFixed(1)}" fill="${Math.random()<0.5?'#ffb020':'#fff38a'}"/>`).join('')+`<text x="${W/2}" y="${H*0.12}" text-anchor="middle" fill="#ffb020" font-size="18" font-weight="800" stroke="#000" stroke-width="1">${f.fxt||''}</text>`;
 else if(f.fx==='smoke') fh=[...Array(14).keys()].map(i=>{ const ph=((t*0.4+i/14)%1); return `<circle cx="${(W/2+Math.sin(i*2.3)*30*ph).toFixed(1)}" cy="${(H*0.35+i*14-ph*60).toFixed(1)}" r="${(6+ph*22).toFixed(1)}" fill="#9aa4ae" opacity="${(0.45*(1-ph)).toFixed(2)}"/>`; }).join('')+(f.fxt?`<text x="${W/2}" y="${H*0.12}" text-anchor="middle" fill="#e8eef2" font-size="18" font-weight="800" stroke="#000" stroke-width="1">${f.fxt}</text>`:'');
 else if(f.fx==='warn') fh=`<rect width="${W}" height="${H}" fill="none" stroke="#ff3b30" stroke-width="${(6+4*Math.sin(t*10)).toFixed(1)}"/><text x="${W/2}" y="${H*0.12}" text-anchor="middle" fill="#ff3b30" font-size="20" font-weight="800" stroke="#000" stroke-width="1">${f.fxt||''}</text>`;
 fx.innerHTML=fh;
 const hud=svg.querySelector('.hud'), ht=(f.ph?f.ph.toUpperCase()+' · ':'')+(f.alt>5||f.ias>1?`ALT ${Math.round(f.alt/10)*10} ft · ${Math.round(f.ias)} kt${f.vs?' · V/S '+(f.vs>0?'+':'')+f.vs:''}`:''); if(hud.textContent!==ht) hud.textContent=ht;
 /* V10.37 : le groupe de parc (GPU), son câble et son étiquette n'existent qu'au sol, à l'arrêt : masqués en vol et dès que l'appareil roule (A320 : f_ext ; Learjet : f_gpu) */
 const air=f.alt>5||f.ias>3||(f.env&&f.env!=='park'&&f.env!=='pad'); svg.querySelectorAll('[data-p="gpu"],[data-p="f_ext"],[data-p="f_gpu"]').forEach(e=>{ e.style.display=air?'none':''; }); svg.querySelectorAll('text.lbl').forEach(e=>{ if(e.textContent==='GPU') e.style.display=air?'none':''; }); }
/* ===== modes : libre, automatique, pédagogique, examen ===== */
let MODE='libre', SELF=false; const AUTO={t:0,pause:false}, EXM={err:0,steps:{},hints:0,log:[],t0:0,wc:{}};
const MLAB={auto:'Mode automatique',peda:'Mode pédagogique',exam:'Examen'};
const norm=st=>Array.isArray(st)?{c:st[0],v:st[1],n:st[2],w:st[3],wt:st[4]}:st;
const isSeq=st=>!st.c;
function setMode(m){ MODE=m; dlgClear(); dom().querySelectorAll('.modes [data-mode]').forEach(b=>b.classList.toggle('on',b.dataset.mode===m)); dom().querySelector('.pre').style.display=m==='libre'?'':'none';
 if(m==='libre'){ TOUR=null; clearFrames(); const te=$s('.tour'); te.innerHTML=''; te.hidden=true; strip(); explainIntro(); return; }
 const ks=Object.keys(M.tours||{}); if(m==='auto'&&M.tours.vol) return tourStart('vol','auto'); if(ks.length===1) tourStart(ks[0],m); else tourPick(m); }
function tourPick(m){ MODE=m||MODE; const t=M.tours||{}; const e=$s('.tour'); e.hidden=false; e.className='tour '+MODE; TOUR=null; clearFrames();
 const what={auto:'L\'atelier joue lui-même : cadre ROUGE sur la commande, puis VERT une fois activée ; les pièces touchées s\'éclairent, l\'équipage et les passagers se déplacent sur le schéma.',peda:'À vous : la commande à utiliser est encadrée en ROUGE ; touchez-la, elle passe au VERT. Les séquences sans commande (tour avion, roulage, vol) se jouent seules.',exam:'Aucune aide : réalisez la procédure dans l\'ordre. Chaque erreur est comptée et sa conséquence expliquée ; note sur 20 à la fin.'}[MODE];
 const ks=Object.keys(t).filter(k=>!t[k].hide), norms=ks.filter(k=>!t[k].fail&&!t[k].acc), fails=ks.filter(k=>t[k].fail), accs=ks.filter(k=>t[k].acc);
 e.innerHTML=`<b class="t">${MLAB[MODE]} · ${M.name}</b><p>${what}</p><div class="bt">${norms.map(k=>`<button type="button" class="go" data-tp="${k}" data-tm="${MODE}">${t[k].n}</button>`).join('')}</div>${fails.length?`<p><b>Pannes et urgences :</b></p><div class="bt">${fails.map(k=>`<button type="button" class="go" style="background:#b3261e" data-tp="${k}" data-tm="${MODE}">⚠ ${t[k].n}</button>`).join('')}</div>`:''}${accs.length?`<p><b>Accidents : chaîne des événements et analyse</b> <small>(scénarios fictifs inspirés d'accidents réels)</small></p><div class="bt">${accs.map(k=>`<button type="button" class="go" style="background:#4a0d0d;border:1px solid #ff3b30" data-tp="${k}" data-tm="${MODE}">💥 ${t[k].n}</button>`).join('')}</div>`:''}<div class="bt"><button type="button" data-tq>Fermer</button></div>`;
 e.scrollIntoView({block:'nearest'}); }
function tourStart(k,m){ if(m) MODE=m; if(MODE==='libre') MODE='peda'; dom().querySelectorAll('.modes [data-mode]').forEach(b=>b.classList.toggle('on',b.dataset.mode===MODE)); dom().querySelector('.pre').style.display='none';
 dlgClear(); const t=M.tours[k]; if(t.before&&!t._ok){ t.before(()=>{ t._ok=true; tourStart(k,MODE); t._ok=false; }); return; } if(typeof t.st==='function'&&!t.build) t.build=t.st; t.st=(typeof t.build==='function'?t.build():t.st).map(norm); TOUR=t; TI=0; t.st.forEach(x=>{ x.done=false; x.tDone=0; x.ran=false; }); setPreset(t.pre||'cold'); if(t.init) t.init(S,{move:moveActor}); AUTO.pause=false; Object.assign(EXM,{err:0,steps:{},hints:0,log:[],wc:{},t0:performance.now()});
 if(MODE==='exam') $s('.ex').innerHTML=`<h3>📝 Examen : ${t.n}</h3><div class="w">${M.name} · ${t.st.filter(x=>!isSeq(x)).length} actions à réaliser dans l'ordre, sans aide.</div>`;
 renderTour(); stepEnter(); $s('.tour').scrollIntoView({block:'nearest'}); }
function ctlEl(id){ return document.querySelector(`#sysat [data-cw="${id}"]`)||document.querySelector(`#sysat [data-c="${id}"]`)||(id==='ground'?document.querySelector('#sysat [data-sit]'):null); }
function clearFrames(){ document.querySelectorAll('#sysat .fneed,#sysat .fok').forEach(e=>e.classList.remove('fneed','fok')); }
function frame(id,cls){ clearFrames(); const el=ctlEl(id); if(!el) return; el.classList.add(cls); }
function badFrame(id){ const el=ctlEl(id); if(!el) return; el.classList.remove('fbad'); void el.offsetWidth; el.classList.add('fbad'); setTimeout(()=>el.classList.remove('fbad'),1600); }
const MOB=()=>matchMedia('(max-width:900px)').matches;
function scrollTo(id){ const el=ctlEl(id); if(el) el.scrollIntoView({block:MOB()?'end':'center',behavior:'smooth'}); }
function satisfied(st){ if(isSeq(st)) return false; const id=st.c, c=findC(id); if(id==='ground') return S.ground===st.v; if(!c||c.t==='mom'||c.t==='pad') return false; if(c.t==='pb') return !!S[id]===st.v; return String(S[id])===String(st.v); }
function matches(st,id,v){ if(isSeq(st)||st.c!==id) return false; const c=findC(id); if(id==='ground') return true; if(c.t==='pb') return !S[id]===st.v; if(c.t==='mom') return true; return String(v)===String(st.v); }
function stepLabel(st){ if(isSeq(st)) return st.t||'Séquence'; const c=findC(st.c); if(st.c==='ground') return 'Situation : '+(st.v?'poser l\'appareil':'décollage'); if(c&&c.t==='sw') return c.l+' → '+(st.v?'ON':'OFF');
 return (c?c.l:st.c)+(c&&c.t!=='pb'&&c.t!=='mom'?' → '+(c.ol?c.ol[c.o.findIndex(x=>String(x)===String(st.v))]:((c.o||[]).find(x=>String(x[0])===String(st.v))||[0,st.v])[1]):(c&&c.t==='pb'?' → '+(st.v?'ON':'OFF'):'')); }
function stepEnter(){ const st=TOUR&&TOUR.st[TI]; if(!st) return; AUTO.t=performance.now(); st.t0=performance.now();
 if(isSeq(st)){ clearFrames(); if(!st.ran){ st.ran=true; if(st.ph) S.fl.ph=st.ph; if(st.fl) Object.assign(S.fl,st.fl); if('fx' in st){ S.fl.fx=st.fx; S.fl.fxt=st.fxt; if(st.fy) S.fl.fy=st.fy; } if(st.mv) st.mv.forEach(m=>moveActor(m[0],m[1],m[2])); if(st.run) st.run(S,{move:moveActor}); if(st.fl&&/^(taxi|rwy|air)$/.test(st.fl.env||'')&&S.act) Object.keys(S.act).forEach(k=>{ if(['meca','tug','gpuv','bus','pbus'].includes(k)) moveActor(k,null,{hide:1}); });   /* V10.42 (F34) : personnel et véhicules au sol retirés dès que l'avion roule (tous les appareils) */ if(st.pt) touch(st.pt); if(st.pg){ PAGE=st.pg; pgPrev=''; } if(st.snd==='chime') AU.chime(); if(st.say) say(st.say); } return; }
 if(st.ph) S.fl.ph=st.ph; if(st.say&&!st.ran){ st.ran=true; say(st.say); }
 if(satisfied(st)){ st.done=true; st.tDone=performance.now()-2000; }
 if(MODE==='auto'){ frame(st.c,'fneed'); scrollTo(st.c); } else if(MODE==='peda'){ frame(st.c,st.done?'fok':'fneed'); scrollTo(st.c); } else clearFrames(); }
function stepDone(){ const st=TOUR.st[TI]; st.done=true; st.tDone=performance.now(); frame(st.c,'fok'); if(MODE==='exam'){ if(!EXM.steps[TI]) EXM.steps[TI]='ok'; setTimeout(()=>{ const el=ctlEl(st.c); el&&el.classList.remove('fok'); },1200); } AU.ok(); renderTour(); }
function wrong(id,v,st){ const c=findC(id); badFrame(id); AU.chime();
 if(isSeq(st)){ $s('.ex').innerHTML=`<h3>Séquence en cours</h3><div class="blk">⏳ ${st.t} : attendez la fin de cette séquence, la prochaine commande sera encadrée.</div>`; exPrev=''; return; }
 let o={ln:[]}; const S0=S, LV=LASTV; try{ S=JSON.parse(JSON.stringify(S0)); if(c&&c.t==='pb') S[id]=!S[id]; else if(c&&c.t!=='mom') S[id]=v; LASTV=c&&c.t==='pb'?S[id]:v; o=(id==='ground'?M.ex('ground',S,M.ev(S)):M.ex(id,S,M.ev(S)))||o; }catch(e){} S=S0; LASTV=LV; const cons=o.blk?o.blk:(o.ln[0]||['',''])[1];
 if(MODE==='exam'){ EXM.err++; EXM.steps[TI]='err'; EXM.log.push([c?c.l:id,stepLabel(st)]); EXM.wc[TI]=(EXM.wc[TI]||0)+1; const n=EXM.wc[TI];
  $s('.ex').innerHTML=`<h3>✗ Erreur ${EXM.err}</h3><div class="blk">⚠ « ${c?c.l:id} » n'est pas l'action attendue à ce moment de la procédure. Elle est refusée.${cons?'<br><b>Ce qu\'elle aurait fait :</b> '+cons:''}${n>=2?'<br><b>Après deux erreurs, la réponse :</b> '+stepLabel(st):''}</div>`; if(n>=2) frame(st.c,'fneed'); }
 else $s('.ex').innerHTML=`<h3>Pas cette commande</h3><div class="blk">⚠ « ${c?c.l:id} » : pas maintenant. L'étape demandée est <b>${stepLabel(st)}</b> (encadrée en rouge).${cons?'<br><b>Cette commande :</b> '+cons:''}<br><button type="button" data-go="${st.c}">Montrer la commande attendue</button></div>`;
 exPrev=''; renderTour(); }
function hint(){ const st=TOUR&&TOUR.st[TI]; if(!st||isSeq(st)) return; EXM.hints++; EXM.steps[TI]='hint'; frame(st.c,'fneed'); scrollTo(st.c); $s('.ex').innerHTML=`<h3>Indice (−½ point)</h3><div class="blk">L'action attendue : <b>${stepLabel(st)}</b></div>`; exPrev=''; renderTour(); }
function doStep(){ const st=TOUR.st[TI]; if(!st||isSeq(st)) return; const c=findC(st.c); SELF=true; try{ if(st.c==='ground'){ if(S.ground!==st.v) act('ground'); } else if(c.t==='pb'){ if(!!S[st.c]!==st.v) act(st.c); } else act(st.c,st.v); } finally{ SELF=false; } if(!st.done) stepDone(); }
function tourDo(){ doStep(); }
function advance(){ TI++; if(TOUR.st[TI]){ renderTour(); stepEnter(); } else { clearFrames(); finish(); } }
function seqReady(st){ return dlgIdle()&&actorsIdle(st.mv?st.mv.map(m=>m[0]).filter(id=>S.act[id]):null)&&(!st.w||st.w(S))&&performance.now()-st.t0>(st.d||2.6)*1000*(MODE==='auto'?1:0.8); }
function tourNext(){ const st=TOUR.st[TI]; if(!st) return; if(isSeq(st)){ if(!seqReady(st)) return; advance(); return; } if(!st.done) doStep(); if(st.w&&!st.w(S)) return; advance(); }
function tourCheck(id,v){ if(!TOUR||SELF) return; const st=TOUR.st[TI]; if(st&&!isSeq(st)&&!st.done&&st.c===id) stepDone(); }
function finish(){ AU.ok(); if(MODE==='exam'){ const N=TOUR.st.filter(x=>!isSeq(x)).length, bad=Object.values(EXM.steps).filter(x=>x==='err').length, note=Math.max(0,Math.round(20*(N-bad-EXM.hints*0.5)/N*2)/2), dur=Math.round((performance.now()-EXM.t0)/1000);
  EXM.res=`<b class="t">Résultat · ${TOUR.n}</b><p class="res" style="color:${note>=14?'#3ddc84':note>=10?'#ffa21a':'#ff3b30'}">${note} / 20</p><p>${N} actions · ${bad} étape(s) avec erreur · ${EXM.err} erreur(s) au total · ${EXM.hints} indice(s) · ${Math.floor(dur/60)} min ${dur%60} s · ${note>=14?'Réussi':note>=10?'Juste : à retravailler':'Insuffisant'}</p>${EXM.log.length?`<ul>${EXM.log.map(l=>`<li>« ${l[0]} » au lieu de : ${l[1]}</li>`).join('')}</ul>`:''}`; }
 renderTour(); }
function phaseBar(){ const ph=[]; TOUR.st.forEach((x,i)=>{ if(x.ph&&!ph.find(p=>p[0]===x.ph)) ph.push([x.ph,i]); }); if(ph.length<2) return ''; return `<div class="phb">${ph.map((p,j)=>{ const nx=ph[j+1]?ph[j+1][1]:1e9, cur=TI>=p[1]&&TI<nx, dn=TI>=nx; return `<span class="${cur?'cur':dn?'dn':''}">${p[0]}</span>`; }).join('')}</div>`; }
function renderTour(live){ const e=$s('.tour'); if(!TOUR){ if(!live&&MODE==='libre') e.hidden=true; strip(); return; } e.hidden=false; e.className='tour '+MODE; const st=TOUR.st[TI];
 let html;
 if(!st){ html=MODE==='exam'?EXM.res+`<div class="bt"><button type="button" class="go" data-mode="peda">🎓 Revoir en mode pédagogique</button><button type="button" data-mode="exam">↺ Repasser l'examen</button><button type="button" data-tq>Fermer</button></div>`:`<b class="t">${MLAB[MODE]} · ${TOUR.n}</b><p>✓ Terminé.</p><div class="bt">${MODE==='auto'?'<button type="button" class="go" data-mode="peda">🎓 À vous en mode pédagogique</button>':'<button type="button" class="go" data-mode="exam">📝 Passer l\'examen</button>'}${TOUR.ok&&M.tours[TOUR.ok]?`<button type="button" class="go" style="background:#1f8a4c" data-tp="${TOUR.ok}" data-tm="${MODE==='exam'?'peda':MODE}">▶ Rejouer en évitant l'accident</button>`:''}<button type="button" data-tour>Autres procédures, pannes, accidents</button><button type="button" data-tq>Fermer</button></div>`; }
 else { const seq=isSeq(st), wt=!seq&&st.w&&st.done&&!st.w(S), head=`<b class="t">${MLAB[MODE]} · ${TOUR.n} · étape ${TI+1}/${TOUR.st.length}</b>${phaseBar()}`, more=`<button type="button" data-tour>Autres / pannes</button>`;
  if(seq) html=head+`${st.err?'<p class="errtag">⚠ FACTEUR DE L\'ACCIDENT</p>':''}<p><b>${st.t}</b></p><p>${st.n||''}</p>${st.an?`<div class="an">${st.an.map(a=>`<p><b>${a[0]}</b> ${a[1]}</p>`).join('')}</div>`:''}<p class="wt">${seqReady(st)?'✓':'⏳ séquence en cours…'}</p><div class="bt">${MODE==='auto'?`<button type="button" class="go" data-tpa>${AUTO.pause?'▶ Reprendre':'⏸ Pause'}</button>`:''}<button type="button" data-tnx ${seqReady(st)?'':'disabled'}>⏭ Suite</button>${more}<button type="button" data-tq>■ Arrêter</button></div>`;
  else if(MODE==='exam') html=head+`<p>${st.done?'✓ Action correcte.':'Quelle est la prochaine action ? Utilisez les commandes.'}</p>${wt?`<p class="wt">⏳ ${st.wt}…</p>`:''}<p class="wt">Erreurs : ${EXM.err} · indices : ${EXM.hints}</p><div class="bt"><button type="button" data-thint ${st.done?'disabled':''}>💡 Indice (−½ point)</button><button type="button" data-tq>Abandonner</button></div>`;
  else if(MODE==='auto') html=head+`<p><b>${stepLabel(st)}</b></p><p>${st.n||''}</p><p class="wt">${AUTO.pause?'⏸ En pause':(st.done?(wt?'⏳ '+st.wt+'…':'✓ Activée (cadre vert)'):'▶ Commande à activer (cadre rouge)…')}</p><div class="bt"><button type="button" class="go" data-tpa>${AUTO.pause?'▶ Reprendre':'⏸ Pause'}</button><button type="button" data-tnx ${wt?'disabled':''}>⏭ Étape suivante</button>${more}<button type="button" data-tq>■ Arrêter</button></div>`;
  else html=head+`<p><b>${stepLabel(st)}</b></p><p>${st.n||''}</p><p class="wt">${st.done?(wt?'⏳ '+st.wt+'…':'✓ Bien. Étape suivante…'):'👉 Touchez la commande encadrée en ROUGE.'}</p><div class="bt">${st.done?'':`<button type="button" data-go="${st.c}">Montrer</button><button type="button" data-tdo>Le faire pour moi</button>`}${more}<button type="button" data-tq>Arrêter</button></div>`; }
 if(e._h!==html){ e.innerHTML=html; e._h=html; } strip(st); }
function strip(st){ const el=$s('.strip'); if(!el) return; if(!TOUR){ el.hidden=true; return; } el.hidden=false; el.className='strip '+MODE; let t;
 if(!st) t=MODE==='exam'?'📝 Examen terminé : résultat ci-dessous.':'✓ Terminé.';
 else { const n=`${TI+1}/${TOUR.st.length}`; if(isSeq(st)) t=`${st.err?'⚠ ':''}${MODE==='auto'?'▶':MODE==='exam'?'📝':'🎓'} ${n} · <b>${st.t}</b>${st.n&&!MOB()?' — '+st.n:''}`;
  else { const wt=st.w&&st.done&&!st.w(S);
   if(MODE==='exam') t=`📝 Examen · étape ${n} · ${st.done?'✓ correct':'à vous : quelle commande ?'} · erreurs ${EXM.err}`;
   else t=`${MODE==='auto'?'▶ Auto':'🎓 Pédago'} · ${n} · <b>${stepLabel(st)}</b> · ${st.done?(wt?'⏳ '+st.wt:'✓ activée (vert)'):(MODE==='auto'?'cadre rouge : activation…':'👉 touchez le cadre ROUGE')}`; } }
 if(el._h!==t){ el.innerHTML=t; el._h=t; } }
function tourTick(){ if(!TOUR) return; const st=TOUR.st[TI]; if(!st) return; const now=performance.now();
 if(isSeq(st)){ if(MODE==='auto'&&AUTO.pause) return; if(seqReady(st)&&now-st.t0>(st.d||2.6)*1000+600) advance(); return; }
 const cond=!st.w||st.w(S);
 if(MODE==='auto'){ if(AUTO.pause) return; if(!st.done&&now-AUTO.t>1900&&dlgIdle()) doStep(); else if(st.done&&cond&&now-st.tDone>2400&&dlgIdle()) advance(); }
 else if(st.done&&cond&&now-st.tDone>1500&&dlgIdle()) advance(); }
function ckl(){ const e=$s('.ex'); if(!TOUR){ e.innerHTML=`<h3>☑ Checklist</h3><div class="w">Aucune procédure en cours : choisissez Automatique, Pédagogique ou Examen.</div>`; exPrev=''; return; }
 const rows=TOUR.st.map((st,i)=>{ const seq=isSeq(st), done=st.done||(seq&&i<TI)||(!seq&&satisfied(st)), miss=!seq&&i<TI&&!done; const lab=stepLabel(st);
  return miss?`<button type="button" data-cki="${i}" style="display:block;width:100%;text-align:left;margin:3px 0;background:#3a0b0b;border:1px solid #ff3b30;color:#ffd0cc">✗ ${i+1}. ${lab} — y aller →</button>`:`<div style="margin:3px 0;color:${i===TI?'#e04ad8':done||i<TI?'#9ff0bf':'#5f7d99'}">${i<TI||done?'✓':i===TI?'▶':'○'} ${i+1}. ${lab}</div>`; }).join('');
 const nm=TOUR.st.filter((st,i)=>!isSeq(st)&&i<TI&&!st.done&&!satisfied(st)).length;
 e.innerHTML=`<h3>☑ Checklist · ${TOUR.n}</h3><div class="w">${nm?nm+' étape(s) manquante(s) en rouge : touchez-la pour aller à la commande.':'Toutes les étapes passées sont faites ✓'}</div><div style="max-height:52vh;overflow:auto;font-size:13.5px">${rows}</div>`; exPrev='__ckl'; e.scrollIntoView({block:'nearest'}); }
function help(){ explainIntro(); }
function open(ac,tour){ const a=dom(); a.hidden=false; if(!M||(ac&&ac!==AC)) load(ac&&MOD[ac]?ac:(typeof selAC!=='undefined'&&selAC&&MOD[selAC]?selAC:'a320')); else relayout(); clearInterval(timer); loop.t=0; timer=setInterval(loop,100); if(tour&&M.tours&&M.tours[tour]) tourStart(tour,MODE==='libre'?'peda':MODE); }
function close(){ dom().hidden=true; clearInterval(timer); AU.mute(); dlgClear(); }
addEventListener('resize',()=>{ if(M&&!dom().hidden) relayout(); });
window.SYSAT={tourStart:(k,m)=>tourStart(k,m),_t:{DLG,get TI(){return TI},get TOUR(){return TOUR},ff(){ DLG.q=[]; DLG.until=0; for(const id in S.act){ const a=S.act[id]; if(a.path.length){ const p=a.path[a.path.length-1]; a.x=p[0]; a.y=p[1]; a.path=[]; } } const st=TOUR&&TOUR.st[TI]; if(st){ st.t0-=1e5; if(st.tDone) st.tDone-=1e5; } AUTO.t-=1e5; },adv(n){ for(let i=0;i<n;i++){ M.step(S,0.1); wstep(0.1); } }},say,world:()=>S&&S.fl,moveActor:(...a)=>moveActor(...a),open,close,MOD,C,LEGN,helpers:{mir,P,F,R,Ci,RR,CC,PP,FF,Lb,T,BX,LN,ARC,SCR,OFFSCR,G,AM,W,CY,RD,GY},get S(){return S;},act,load};
/* entrée dans le menu */
function inject(){ const box=document.querySelector('#menu .box'); if(!box||box.querySelector('#samenu')) return; const b=document.createElement('button'); b.type='button'; b.id='samenu';
 b.innerHTML='<span class="e">⚙</span><span><b>Atelier des systèmes</b>Un bouton → la pièce qu\'il actionne : électricité, carburant, hydraulique, air, gouvernes, colorés sur le schéma de l\'appareil.</span>';
 b.onclick=()=>open(); const ac=box.querySelector('.acad-b'); (ac||box.firstChild).after(b); }
inject(); const _rm=renderMenu; renderMenu=function(){ const r=_rm.apply(this,arguments); try{ inject(); }catch(e){} return r; };
})();
