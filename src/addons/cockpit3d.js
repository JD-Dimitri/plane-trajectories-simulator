/* ===== VUE COCKPIT : STRUCTURE 3D AUTOUR DU PILOTE, PROPRE À CHAQUE APPAREIL =====
   En vue cockpit, l'extérieur était vu « sans avion ». On ajoute la structure vue depuis le siège : casquette (glareshield)
   avec son panneau de pilote automatique rétroéclairé, montants de pare-brise, bord du panneau plafond et ses interrupteurs,
   appuis de fenêtre. Formes originales et simplifiées, dessinées d'après la disposition générale de chaque famille :
   - avions de ligne (A320, 777) : 4 vitres frontales et latérales, montant central, panneau plafond large, MCP/FCU sur la casquette ;
   - Learjet 60 : poste étroit, plafond bas, 2 vitres frontales ;
   - Cessna 172 : pare-brise d'une pièce, compas au sommet, garnissage de toit clair, montants de porte ;
   - hélicoptères : verrière, montants fins, console plafond (S-76 : poste biturbine à montant central).
   Teintes : gris-bleu Airbus, brun-gris Boeing, noir mat aviation légère. Éclairage atténué de nuit, voyants rétroéclairés. */
(function(){
if(typeof scene==='undefined'||typeof THREE==='undefined') return;
const G=new THREE.Group(); G.visible=false; scene.add(G); let built=null, mats=[];
function tex(w,h,draw){ const c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'),w,h); const t=new THREE.CanvasTexture(c); t.anisotropy=4; return t; }
// panneau d'interrupteurs générique (procédural) : rangées de boutons, voyants et étiquettes
const swTex=(base,seed)=>tex(512,128,(g,w,h)=>{ let r=seed||7; const R=()=>(r=(r*9301+49297)%233280)/233280; g.fillStyle=base; g.fillRect(0,0,w,h);
  for(let p=0;p<6;p++){ const x0=p*w/6+6; g.strokeStyle='#ffffff22'; g.strokeRect(x0,6,w/6-12,h-12);
    for(let i=0;i<3;i++) for(let j=0;j<4;j++){ const x=x0+10+j*19, y=18+i*34, k=R(); if(k<0.35){ g.fillStyle='#1b1d20'; g.fillRect(x,y,14,14); g.fillStyle=R()<0.3?'#f2b632':'#d9dde2'; g.fillRect(x+3,y+3,8,3); }
      else if(k<0.7){ g.fillStyle='#d9dde2'; g.beginPath(); g.arc(x+7,y+7,4.5,0,7); g.fill(); g.fillStyle='#000'; g.fillRect(x+6,y,2,7); } else { g.fillStyle='#2a2d31'; g.beginPath(); g.arc(x+7,y+7,6,0,7); g.fill(); g.fillStyle='#bfc4ca'; g.fillRect(x+6,y+1,2,6); }
      g.fillStyle='#ffffffaa'; g.font='7px sans-serif'; g.fillText(['ON','OFF','AUTO','ALT','FAULT','NORM'][Math.floor(R()*6)],x-2,y+24); } } });
// bandeau du pilote automatique : afficheurs à segments orangés et boutons
const mcpTex=(base,col)=>tex(512,64,(g,w,h)=>{ g.fillStyle=base; g.fillRect(0,0,w,h); const box=(x,t)=>{ g.fillStyle='#0b0c0d'; g.fillRect(x,14,62,22); g.fillStyle=col; g.font='bold 16px monospace'; g.fillText(t,x+6,31); };
  box(40,'250'); box(150,'270'); box(270,'35000'); box(390,'-1000'); g.fillStyle='#d9dde2'; for(let i=0;i<12;i++){ g.fillRect(20+i*40,44,22,10); } g.fillStyle='#ffffffaa'; g.font='8px sans-serif'; ['SPD','HDG','ALT','V/S'].forEach((t,i)=>g.fillText(t,50+[0,110,230,350][i],10)); });
function M(color,map,emis){ const m=new THREE.MeshBasicMaterial({color,map:map||null}); m.userData.base=new THREE.Color(color); m.userData.emis=!!emis; mats.push(m); return m; }
function box(par,w,h,d,mat,x,y,z,rx,ry,rz){ const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat); b.position.set(x,y,z); b.rotation.set(rx||0,ry||0,rz||0); par.add(b); return b; }
// montant oblique entre deux points (repère du poste)
function post(par,a,b,t,mat){ const A=new THREE.Vector3(...a), B=new THREE.Vector3(...b), d=B.clone().sub(A), m=new THREE.Mesh(new THREE.BoxGeometry(t,d.length(),t*0.8),mat); m.position.copy(A).add(B).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize()); par.add(m); return m; }
function build(k){ while(G.children.length) G.remove(G.children[0]); mats=[]; const e=A.eye, cx=-e[0], g=new THREE.Group(); g.position.set(e[0],e[1],e[2]); G.add(g);
  const air=k==='a320'||k==='b777'||k==='a350', boe=k==='b777';
  if(air||k==='lj60'||k==='s76'){ const W=k==='b777'?1.45:k==='a350'?1.4:k==='a320'?1.3:k==='s76'?0.95:0.85, top=k==='lj60'?0.28:0.34, gz=k==='lj60'?-0.78:-0.95;
    const col=boe?0x4a443e:k==='lj60'?0x3b3e43:k==='s76'?0x3d4146:0x56616c, frame=M(boe?0x2e2a27:0x24282c), glare=M(col), sill=M(boe?0x5a534c:0x66707a);
    box(g,2*W,0.10,0.45,glare,cx,-0.30,gz);                                                           // casquette
    if(k!=='lj60'||true){ const p=box(g,Math.min(1.4,2*W-0.2),0.09,0.02,M(0xffffff,mcpTex(boe?'#3e3934':'#4a545e',boe?'#ffb347':'#ffd27a'),true),cx,-0.30,gz-0.235); }   // MCP / FCU rétroéclairé
    post(g,[cx,-0.25,gz-0.12],[cx,top,gz+0.18],0.055,frame);                                           // montant central
    [-1,1].forEach(s=>{ post(g,[cx+s*(W-0.12),-0.25,gz+0.05],[cx+s*(W-0.02),top-0.02,gz+0.32],0.075,frame);    // montants pare-brise / vitre latérale
      post(g,[cx+s*W,-0.24,gz+0.55],[cx+s*W,top-0.04,gz+0.75],0.09,frame); box(g,0.14,0.05,1.3,sill,cx+s*(W+0.02),-0.24,gz+0.9);   // montant arrière, appui de fenêtre
      box(g,0.5,0.012,0.02,M(0x111111),cx+s*W*0.45,-0.235,gz-0.12,0,0,s*0.08); });                    // essuie-glaces au repos
    box(g,2*W,0.07,0.5,frame,cx,top+0.02,gz+0.32);                                                     // traverse haute
    box(g,Math.min(1.5,2*W-0.3),0.14,0.03,M(0xffffff,swTex(boe?'#3e3934':'#4c5660',k.length),true),cx,top-0.02,gz+0.56,-0.5);   // bord du panneau plafond
    box(g,Math.min(1.5,2*W-0.3),0.03,1.2,M(boe?0x3e3934:0x4c5660),cx,top+0.1,gz+1.1); }
  else if(k==='c172'){ const W=0.56, frame=M(0x1d1e20), roof=M(0xcfc6b0);
    box(g,1.15,0.06,0.32,M(0x17181a),cx,-0.26,-0.72);                                                   // casquette noire
    [-1,1].forEach(s=>{ post(g,[cx+s*W,-0.23,-0.78],[cx+s*(W-0.04),0.31,-0.46],0.06,frame); post(g,[cx+s*(W+0.02),-0.3,-0.1],[cx+s*(W+0.02),0.3,-0.05],0.06,frame); });   // montants de pare-brise et de porte
    box(g,1.2,0.04,1.1,roof,cx,0.34,-0.05); box(g,1.15,0.05,0.06,frame,cx,0.31,-0.5);                  // garnissage de toit, traverse
    box(g,0.08,0.07,0.07,M(0x111111),cx,0.255,-0.52); box(g,0.05,0.04,0.005,M(0xf2f2f2,null,true),cx,0.255,-0.556);   // compas magnétique
    box(g,0.12,0.03,0.25,M(0x2b2c2f),cx+0.25,0.31,-0.2); }                                               // aérateur / pare-soleil
  else { const W=k==='r44'?0.62:0.72, frame=M(0x18191b);                                               // H125, R44 : verrière
    post(g,[cx,0.4,-0.9],[cx,0.42,0.1],0.05,frame); if(k==='r44') post(g,[cx,-0.25,-0.62],[cx,0.4,-0.8],0.045,frame);
    [-1,1].forEach(s=>{ post(g,[cx+s*W,-0.35,-0.55],[cx+s*(W-0.1),0.38,-0.6],0.05,frame); post(g,[cx+s*W,-0.3,0.05],[cx+s*(W-0.08),0.4,0.0],0.05,frame); });
    box(g,0.3,0.06,0.4,M(0x2a2c2f),cx,0.36,-0.25); box(g,0.28,0.035,0.02,M(0xffffff,swTex('#2a2c2f',3),true),cx,0.33,-0.46,-0.4);   // console plafond
    box(g,1.0,0.07,0.25,M(0x1c1d1f),cx,-0.33,-0.72); }
  try{ detail(g,k,cx); }catch(e){ console.warn('poste détaillé',e); }
  built=k; }
/* V10.38 (F4) : poste plus détaillé, sur ce qui est réellement visible au-dessus de la planche 2D : siège et commandes du copilote,
   pare-soleil, rails de fenêtre, console latérale, cloison arrière avec porte du poste, panneaux de disjoncteurs, boîte à masque à oxygène.
   Formes simplifiées et originales, cotes [ESTIMÉ]. */
function detail(g,k,cx){ const air=k==='a320'||k==='b777'||k==='a350', boe=k==='b777', heli=k==='h125'||k==='r44'||k==='s76', small=k==='c172'||k==='r44'||k==='h125';
  const seat=M(boe?0x3a3632:k==='c172'?0x6b5d4c:k==='r44'?0x5a4a3a:0x2f3640), seatL=M(boe?0x4a453f:0x3c4552), dk=M(0x1a1c1f), mid=M(boe?0x4a443e:0x56616c), pale=M(0xc9ced3);
  const half=air?(boe?0.62:0.55):k==='lj60'?0.42:k==='s76'?0.48:k==='c172'?0.3:0.36, xo=2*cx;                // x du copilote (symétrique du pilote)
  const back=heli||k==='c172'?0.35:0.55, hz=0.32;
  // siège du copilote (dossier, appui-tête, accoudoirs) — visible en regardant à droite
  box(g,0.5,0.75,0.12,seat,xo,-0.45,hz); box(g,0.36,0.22,0.1,seatL,xo,0.02,hz+0.02); box(g,0.5,0.12,0.5,seat,xo,-0.86,hz-0.25);
  if(air||k==='lj60'){ [-1,1].forEach(s=>box(g,0.07,0.06,0.42,seatL,xo+s*0.28,-0.62,hz-0.2)); }
  // pare-soleil (teintés) relevés en haut du pare-brise
  if(!heli){ const vis=new THREE.MeshBasicMaterial({color:0x1d2a33,transparent:true,opacity:0.55}); mats.push(Object.assign(vis,{userData:{base:new THREE.Color(0x1d2a33)}}));
    [0,xo].forEach(x=>{ const v=new THREE.Mesh(new THREE.BoxGeometry(0.42,0.012,0.22),vis); v.position.set(x,air?0.27:0.27,air?-0.62:-0.42); v.rotation.x=-0.35; g.add(v); }); }
  // rail de fenêtre latérale et poignée (avions de ligne : fenêtre coulissante)
  if(air||k==='lj60'){ [-1,1].forEach(s=>{ const xs=cx+s*(air?(boe?1.42:1.27):0.82); box(g,0.03,0.03,0.9,dk,xs,0.16,-0.25); box(g,0.04,0.12,0.04,pale,xs-s*0.03,0.05,-0.05); });
    // console latérale (tiroir à cartes, tiller du côté pilote, mini-manche sur A320)
    box(g,0.28,0.1,0.9,mid,cx-(air?(boe?1.15:1.0):0.6),-0.62,-0.25); box(g,0.28,0.1,0.9,mid,cx+(air?(boe?1.15:1.0):0.6),-0.62,-0.25);
    if(k==='a320'){ [-1,1].forEach(s=>{ const xs=cx+s*0.92; box(g,0.05,0.16,0.05,dk,xs,-0.5,-0.35); box(g,0.06,0.05,0.07,dk,xs,-0.41,-0.36); }); }   // mini-manches
    else { [0,xo].forEach(x=>{ box(g,0.04,0.32,0.04,dk,x,-0.62,-0.62); box(g,0.34,0.05,0.05,dk,x,-0.44,-0.62); }); }      // manches (777, Learjet)
    // cloison arrière : porte du poste, panneau de disjoncteurs, siège observateur replié
    const rz=air?1.25:0.95; box(g,2*Math.abs(cx)+(air?2.4:1.6),1.9,0.05,M(boe?0x4a453f:0x59636d),cx,-0.2,rz);
    box(g,0.7,1.75,0.03,M(0x3a414a),cx,-0.25,rz-0.04); box(g,0.06,0.04,0.06,pale,cx+0.25,-0.25,rz-0.07);             // porte et poignée
    const cb=new THREE.CanvasTexture((()=>{ const c=document.createElement('canvas'); c.width=256; c.height=128; const q=c.getContext('2d'); q.fillStyle='#2b3138'; q.fillRect(0,0,256,128); for(let i=0;i<16;i++) for(let j=0;j<7;j++){ q.fillStyle='#15181b'; q.beginPath(); q.arc(10+i*15.5,10+j*17,3.2,0,7); q.fill(); q.fillStyle='#6d757d'; q.beginPath(); q.arc(10+i*15.5,10+j*17,1.6,0,7); q.fill(); } q.fillStyle='#9aa3ab'; q.font='7px sans-serif'; for(let j=0;j<7;j++) q.fillText('CB',2,18+j*17); return c; })());
    [-1,1].forEach(s=>box(g,0.02,0.45,0.55,M(0xffffff,cb,true),cx+s*(air?(boe?1.4:1.25):0.8),-0.1,rz-0.4));            // disjoncteurs
    const sideW=air?(boe?1.45:1.3):0.85; [-1,1].forEach(s=>box(g,0.04,1.5,rz-0.55,M(boe?0x4a453f:0x59636d),cx+s*(sideW+0.02),-0.4,(rz+0.55)/2));   // parois latérales jusqu'à la cloison arrière (le poste est fermé)
    box(g,0.16,0.1,0.12,M(0x8a1f1f),cx-(air?(boe?1.3:1.15):0.7),-0.36,0.25); }                                       // boîte à masque à oxygène
  // petits appareils : manche et siège du passager avant, poignée de porte ; hélicoptères : cyclique et collectif côté gauche
  if(k==='c172'){ box(g,0.03,0.03,0.3,dk,xo,-0.42,-0.42); box(g,0.24,0.04,0.04,dk,xo,-0.42,-0.58); box(g,0.04,0.04,0.12,pale,cx+0.62,-0.2,0.05); box(g,0.05,0.07,0.05,M(0x111111),cx,-0.5,-0.55); }
  if(heli){ box(g,0.035,0.55,0.035,dk,xo,-0.75,-0.3); box(g,0.05,0.05,0.42,dk,xo-0.18,-0.8,-0.05); }
}
const _pc=placeCamera; placeCamera=function(){ const r=_pc.apply(this,arguments); try{
  const on=view==='ck'&&typeof $==='function'&&$('menu').hidden; if(on&&built!==ACK) build(ACK); G.visible=on; if(on){ G.quaternion.copy(qAtt); G.position.set(0,0,0);
    const n=SKY&&SKY.u&&SKY.u.night?SKY.u.night.value:0, day=1-0.72*n; mats.forEach(m=>{ const k=m.userData.emis?Math.max(day,0.75):day; m.color.copy(m.userData.base).multiplyScalar(k); }); } }catch(e){ G.visible=false; } return r; };
window.CK3D={G,build};
})();
