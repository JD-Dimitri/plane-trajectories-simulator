/* =====================================================================================================
   V10.41 (F25 · F26 · F27) — POSTE DE PILOTAGE 3D RÉALISTE ET INSTRUMENTS INTERACTIFS
   En vue cockpit, la planche de bord n'est plus une bande 2D posée en bas de l'écran : elle est construite en 3D devant
   le pilote, sous la casquette, avec la disposition propre à chaque appareil. Les écrans 3D affichent EN DIRECT les vrais
   instruments du simulateur (PFD, ND, E/WD ou EICAS, SD ou MFD, planche classique du C172 et des hélicoptères) : la planche
   2D est toujours dessinée, hors de l'écran, et recopiée sur les écrans 3D.
   Toucher ou cliquer un élément du poste OUVRE l'instrument cliqué :
     - un écran → l'écran agrandi avec sa légende de lecture (même comportement qu'un clic sur la planche 2D, mode
       d'emploi compris) ; sur la planche classique, l'instrument touché (anémomètre, horizon, altimètre…) ;
     - la casquette → le FCU / MCP (pilote automatique) ; le plafond → le panneau plafond ; le pédestal, les manettes et
       le levier de train → le pédestal ; le boîtier radio → la radio ; le manche ou mini-manche → les commandes.
   Survol à la souris : surbrillance et nom de l'élément. Bouton « 🛩 Poste 3D » : revenir à la planche 2D d'origine.
   Disposition : sources publiques citées dans DATA (statut affiché) ; cotes [ESTIMÉ] ; formes originales simplifiées,
   sans marque ni photo réelle (les photos fournies par l'auteur servent seulement de référence visuelle hors du dépôt).
   ===================================================================================================== */
(function(){
'use strict';
if(typeof scene==='undefined'||typeof THREE==='undefined'||typeof CK==='undefined') return;
const K='sim-p3d';
function rd(){ try{ return localStorage.getItem(K); }catch(e){ return null; } } function wr(v){ try{ localStorage.setItem(K,v); }catch(e){} }
const P3={on:rd()!=='0'}; window.P3D=P3;
const css=document.createElement('style'); css.textContent=`
body.p3d #ck{top:calc(100vh + 40px)!important;bottom:auto!important;left:0!important;right:auto!important;width:1200px!important;visibility:visible}
body.p3d #ck canvas{width:1200px!important;height:420px!important}
#p3fcu{position:fixed;left:50%;bottom:calc(var(--barh,56px) + 54px);width:0;height:0;z-index:12}
#p3fcu #fcu{top:-44px}
#p3fcu:not(.open) #fcu{display:none!important}
#p3tip{position:fixed;z-index:57;pointer-events:none;background:#0b1620ee;color:#e8eef2;border:1px solid #3fd0ff;border-radius:8px;padding:4px 8px;font:600 12px/1.3 Inter,sans-serif;max-width:260px;white-space:normal}
#p3tip small{display:block;font-weight:400;color:#9fb3c4}
#p3hint{position:fixed;left:50%;top:calc(64px + env(safe-area-inset-top,0px));transform:translateX(-50%);z-index:23;background:#0d2232ee;color:#fff;border:1px solid #3fd0ff;border-radius:10px;padding:7px 12px;font:600 13px Inter,sans-serif;max-width:min(92vw,520px);text-align:center;pointer-events:none;transition:opacity .6s}
body.p3d-hov canvas{cursor:pointer}`;
document.head.appendChild(css);

/* ---------- disposition des postes (dx : distance à l'axe de l'avion, y : hauteur sous l'œil, en m) ----------
   Écrans : src = zone de la planche 2D recopiée ; parts = découpage d'un écran (A350 : PFD + OIS, ND + profil vertical). */
const DATA={
 a320:{fam:'airbus', st:'[ESTIMÉ] disposition générale Airbus A320 : 6 écrans identiques (PFD et ND de chaque pilote, E/WD au centre, SD en dessous), casquette avec FCU, mini-manches latéraux',
   s:0.185, y:-0.47, face:[2.1,-0.355,-0.82], z:-1.0, col:'#5a6670',
   scr:[['pfd',-0.47],['nd',-0.26],['ewd',0],['sd',0,-0.675],['nd2',0.26],['pfd2',0.47]], gear:0.2, stby:-0.14},
 a350:{fam:'airbus', st:'[RÉFÉRENCÉ Leeham News 2015] 6 grands écrans identiques, 2 écrans OIS (documentation) sur les côtés, 2 KCCU ; répartition PFD + OIS / ND + profil vertical / E/WD / SD [ESTIMÉ], à confirmer sur une source constructeur',
   w:0.22, h:0.29, y:-0.52, face:[2.3,-0.355,-0.97], z:-1.02, col:'#55606b',
   scr:[['out',-0.6],['in',-0.36],['ewd',0],['sd',0,-0.82],['in2',0.36],['out2',0.6]], gear:0.2, stby:null},
 b777:{fam:'boeing', st:'[ESTIMÉ] disposition générale Boeing 777 : 6 écrans (PFD extérieurs, ND intérieurs, EICAS au centre, écran multifonction en dessous), MCP sur la casquette, manches',
   s:0.2, y:-0.485, face:[2.4,-0.355,-0.84], z:-1.02, col:'#4d4640',
   scr:[['pfd',-0.56],['nd',-0.335],['ewd',0],['sd',0,-0.70],['nd2',0.335],['pfd2',0.56]], gear:0.2, stby:-0.16},
 lj60:{fam:'collins', st:'[ESTIMÉ] Learjet 60 : écrans de pilotage et de navigation de chaque pilote, écran moteurs au centre (disposition du simulateur)',
   s:0.155, y:-0.47, face:[1.42,-0.355,-0.72], z:-0.9, col:'#3b3f45',
   scr:[['pfd',-0.40],['nd',-0.22],['ewd',0],['nd2',0.22],['pfd2',0.40]], gear:0.13, stby:null},
 c172:{fam:'ga', st:'[ESTIMÉ] Cessna 172 : planche classique (six instruments de base devant le pilote, radios au centre, moteur à droite) recopiée de la planche du simulateur',
   panel:[1.08,-0.33], z:-0.95, col:'#202226'},
 h125:{fam:'heli', st:'[ESTIMÉ] H125 : planche d\'instruments recopiée de la planche du simulateur', panel:[1.1,-0.40], z:-0.9, col:'#1d1f22'},
 r44:{fam:'heli', st:'[ESTIMÉ] R44 : planche d\'instruments recopiée de la planche du simulateur', panel:[0.98,-0.40], z:-0.89, col:'#1d1f22'},
 s76:{fam:'heli', st:'[ESTIMÉ] S-76 : planche biturbine recopiée de la planche du simulateur', panel:[1.5,-0.39], z:-0.98, col:'#2b2f33'}
};
const NAME={pfd:'PFD — écran de pilotage (commandant)',pfd2:'PFD — écran de pilotage (copilote)',nd:'ND — écran de navigation (commandant)',nd2:'ND — écran de navigation (copilote)',
  ewd:{airbus:'E/WD — moteurs et alarmes (ECAM)',boeing:'EICAS — moteurs et alarmes',collins:'EICAS — écran moteurs'},sd:{airbus:'SD — écran systèmes (ECAM)',boeing:'MFD — écran multifonction (pages systèmes)'},
  out:'Écran extérieur (commandant) : PFD + OIS',out2:'Écran extérieur (copilote) : PFD + OIS',in:'Écran intérieur (commandant) : ND + profil vertical',in2:'Écran intérieur (copilote) : ND + profil vertical',
  panel:'Planche de bord : touchez un instrument pour l\'agrandir'};

/* ---------- zones de la planche 2D (même calcul que la planche et le mode d'emploi) ---------- */
function regions(){ const cv=CK.cv, d=cv.width/(CK.w||1), Wc=CK.w, Hc=CK.h; if(!Wc||!Hc) return null;
  const s=Math.min(Hc*0.66,Wc/5.7), gap=(Wc-5*s)/6, y0=Hc*0.08, X=i=>gap+i*(s+gap), R=(x,y,w,h)=>[x*d,y*d,w*d,h*d];
  const o={pfd:R(X(0),y0,s,s),nd:R(X(1),y0,s,s),nd2:R(X(3),y0,s,s),pfd2:R(X(4),y0,s,s),panel:[0,0,cv.width,cv.height]};
  if(AIR()){ const sc=Math.min(s,(Hc-y0-10)/2), x0=X(2)+(s-sc)/2; o.ewd=R(x0,y0,sc,sc); o.sd=R(x0,y0+sc+4,sc,sc); } else o.ewd=R(X(2),y0,s,s);
  return o; }
function AIR(){ return ['a320','b777','a350'].includes(ACK); }

/* ---------- construction ---------- */
const P=new THREE.Group(); P.visible=false; scene.add(P);
let built=null, mats=[], HIT=[], SCRS=[], hov=null;
function tex(w,h,draw){ const c=document.createElement('canvas'); c.width=w; c.height=h; const g=c.getContext('2d'); draw&&draw(g,w,h); const t=new THREE.CanvasTexture(c); t.anisotropy=4; return {c,g,t}; }
function M(col,map,emis){ const m=new THREE.MeshBasicMaterial({color:col,map:map||null}); m.userData.base=new THREE.Color(col); m.userData.emis=!!emis; mats.push(m); return m; }
function box(g,w,h,d,mat,x,y,z,rx){ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat); m.position.set(x,y,z); if(rx) m.rotation.x=rx; g.add(m); return m; }
function plane(g,w,h,mat,x,y,z,rx){ const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),mat); m.position.set(x,y,z); if(rx) m.rotation.x=rx; g.add(m); return m; }
const HMAT=new THREE.MeshBasicMaterial({visible:false});
function hit(g,w,h,d,x,y,z,label,act,extra){ const m=box(g,w,h,d,HMAT,x,y,z); m.userData.p3={label,act,...(extra||{})}; HIT.push(m); return m; }
function outline(m){ const e=new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry),new THREE.LineBasicMaterial({color:0x3fd0ff,transparent:true,opacity:0.95,depthTest:false}));
  e.renderOrder=20; e.visible=false; m.add(e); m.userData.ol=e; return e; }
const fname=(id,fam)=>{ const n=NAME[id.replace(/2$/,'')==='ewd'||id.replace(/2$/,'')==='sd'?id.replace(/2$/,''):id]; return typeof n==='object'?(n[fam]||n.airbus):n; };

function faceTex(D,k){ const [fw,yt,yb]=D.face, fh=yt-yb, px=720/fh; return tex(Math.round(fw*px),720,(g,w,h)=>{
  const boe=D.fam==='boeing'; g.fillStyle=D.col; g.fillRect(0,0,w,h);
  const gr=g.createLinearGradient(0,0,0,h); gr.addColorStop(0,'#ffffff10'); gr.addColorStop(1,'#00000030'); g.fillStyle=gr; g.fillRect(0,0,w,h);
  g.strokeStyle='#00000055'; g.lineWidth=3; [0.24,0.5,0.76].forEach(f=>{ g.beginPath(); g.moveTo(w*f,0); g.lineTo(w*f,h); g.stroke(); });       // jointures des panneaux
  const X=dx=>w/2+dx*px, Y=y=>(yt-y)*px;
  D.scr.forEach(([id,dx,yy])=>{ const sw=(D.w||D.s)*px, sh=(D.h||D.s)*px, cx=X(dx), cy=Y(yy==null?D.y:yy);
    g.fillStyle=boe?'#2b2724':'#22272c'; g.fillRect(cx-sw/2-14,cy-sh/2-14,sw+28,sh+40);                                                    // cadre de l'écran
    g.fillStyle='#ffffff18'; for(let i=0;i<4;i++){ g.beginPath(); g.arc(cx-sw/2+10+i*(sw-20)/3,cy+sh/2+14,5,0,7); g.fill(); }                    // boutons de luminosité
    g.fillStyle='#d9dde2aa'; g.font='600 15px Inter,sans-serif'; g.textAlign='center'; g.fillText(fname(id,D.fam).split(' — ')[0].split(' (')[0].replace('Écran ',''),cx,cy-sh/2-20); });
  // instrument de secours, horloge, autofreinage (dessinés sur la planche)
  if(D.stby!=null){ const cx=X(D.stby), cy=Y(-0.66), r=38; g.fillStyle='#0b0c0d'; g.fillRect(cx-r,cy-r,2*r,2*r); g.fillStyle='#3a78c8'; g.fillRect(cx-r+6,cy-r+6,2*r-12,r-6); g.fillStyle='#8a5a2b'; g.fillRect(cx-r+6,cy,2*r-12,r-6);
    g.strokeStyle='#ffd23a'; g.lineWidth=3; g.beginPath(); g.moveTo(cx-18,cy); g.lineTo(cx+18,cy); g.stroke(); g.fillStyle='#d9dde2aa'; g.font='600 13px Inter,sans-serif'; g.textAlign='center'; g.fillText(boe?'SECOURS':'ISIS',cx,cy+r+16);
    const kx=X(D.stby-0.12); g.fillStyle='#0b0c0d'; g.beginPath(); g.arc(kx,cy,28,0,7); g.fill(); g.strokeStyle='#d9dde2'; g.lineWidth=2; g.beginPath(); g.moveTo(kx,cy); g.lineTo(kx,cy-20); g.moveTo(kx,cy); g.lineTo(kx+14,cy+6); g.stroke(); g.fillText('CHRONO',kx,cy+r+16); }
  if(D.gear!=null){ const gx=X(D.gear+0.1), gy=Y(-0.6); g.fillStyle='#d9dde2aa'; g.font='600 13px Inter,sans-serif'; g.textAlign='left';
    ['LO','MED','MAX'].forEach((t,i)=>{ g.fillStyle='#1b1d20'; g.fillRect(gx,gy+i*30,58,24); g.fillStyle='#d9dde2'; g.fillText(t,gx+12,gy+i*30+17); }); g.fillText(boe?'AUTOBRAKE':'AUTO/BRK',gx-4,gy-10);
    g.fillStyle='#d9dde2aa'; g.fillText('LDG GEAR',X(D.gear)-34,Y(-0.53)); }
  g.fillStyle='#ffffff30'; g.font='500 12px Inter,sans-serif'; g.textAlign='left'; g.fillText('Poste simplifié · '+(DATA[k].st.match(/^\[[^\]]+\]/)||[''])[0],12,h-12); }); }

function build(k){ while(P.children.length) P.remove(P.children[0]); mats=[]; HIT=[]; SCRS=[]; hov=null; const D=DATA[k]; built=k; if(!D) return;
  const e=A.eye, cx=-e[0], g=new THREE.Group(); g.position.set(e[0],e[1],e[2]); P.add(g); const z=D.z;
  if(D.scr){ const [fw,yt,yb]=D.face, fh=yt-yb, ft=faceTex(D,k);
    const face=plane(g,fw,fh,M(0xffffff,ft.t),cx,(yt+yb)/2,z,-0.1);                                                                       // planche principale
    box(g,fw,0.04,0.3,M(0x1d2024),cx,yb-0.02,z+0.12);                                                                                       // bord inférieur
    D.scr.forEach(([id,dx,yy])=>{ const w=D.w||D.s, h=D.h||D.s, y=yy==null?D.y:yy;
      const T=tex(id.startsWith('out')||id.startsWith('in')||k==='a350'?440:512, id.startsWith('out')||id.startsWith('in')||k==='a350'?580:512);
      const zz=z+0.008-(y-(yt+yb)/2)*Math.tan(0.1), m=plane(g,w,h,M(0xffffff,T.t,true),cx+dx,y,zz,-0.1);
      const parts=id.startsWith('out')?[[id.endsWith('2')?'pfd2':'pfd',[0,0,1,0.62]],['ois',[0,0.62,1,0.38]]]:id.startsWith('in')?[[id.endsWith('2')?'nd2':'nd',[0,0,1,0.62]],['vd',[0,0.62,1,0.38]]]
        :k==='a350'&&id==='ewd'?[['mail',[0,0,1,0.2]],['ewd',[0,0.2,1,0.8]]]:k==='a350'&&id==='sd'?[['sd',[0,0,1,0.8]],['memo',[0,0.8,1,0.2]]]:[[id,[0,0,1,1]]];
      const S={id,m,T,parts,lay:[]}; SCRS.push(S); m.userData.p3={label:fname(id,D.fam),act:'scr',scr:S}; HIT.push(m); outline(m); });
    // levier de train, instrument de secours (cliquables)
    if(D.gear!=null){ box(g,0.012,0.085,0.012,M(0x8d939a),cx+D.gear,-0.60,z+0.05); const kn=new THREE.Mesh(new THREE.CylinderGeometry(0.024,0.024,0.026,20),M(0xd9dde2)); kn.rotation.z=Math.PI/2; kn.position.set(cx+D.gear,-0.555,z+0.06); g.add(kn);   // levier de train : tige et molette en forme de roue
      outline(hit(g,0.08,0.16,0.08,cx+D.gear,-0.58,z+0.06,'Levier de train d\'atterrissage (touche G) — ouvre le pédestal et ses commandes','ped')); }
    if(D.stby!=null) outline(hit(g,0.09,0.09,0.02,cx+D.stby,-0.66,z+0.02,'Instrument de secours (assiette, vitesse, altitude) — ouvre le PFD agrandi','zoom',{k:'pfd'}));
    // casquette : FCU / MCP (le FCU 3D est dessiné par la structure du poste) ; plafond ; pédestal ; manches
    outline(hit(g,Math.min(1.4,fw-0.2),0.11,0.09,cx,-0.30,(k==='lj60'?-0.78:-0.95)+0.04,(D.fam==='boeing'?'MCP':D.fam==='collins'?'Panneau de pilote automatique':'FCU')+' — pilote automatique : ouvre le panneau de réglage (vitesse, cap, altitude, V/S)','fcu'));
    outline(hit(g,Math.min(1.5,fw-0.3),0.1,1.0,cx,0.40,z+1.0,'Panneau plafond — ouvre le panneau plafond (électricité, carburant, hydraulique, feux…)','ovh'));
    const ped=box(g,k==='lj60'?0.34:0.46,0.22,0.7,M(D.fam==='boeing'?0x3e3934:0x4c5660),cx,-0.78,z+0.55);
    const pt=tex(256,384,(q,w,h)=>{ q.fillStyle=D.fam==='boeing'?'#3e3934':'#4c5660'; q.fillRect(0,0,w,h); [[10,8],[136,8]].forEach(([x,y])=>{ q.fillStyle='#14171a'; q.fillRect(x,y,110,120); q.fillStyle='#0f2a12'; q.fillRect(x+8,y+8,94,60); q.fillStyle='#3ddc84'; q.font='10px monospace'; q.fillText(D.fam==='boeing'?'CDU':'MCDU',x+14,y+22); q.fillStyle='#2a2d31'; for(let i=0;i<4;i++) for(let j=0;j<6;j++) q.fillRect(x+10+j*16,y+74+i*11,12,8); });
      q.fillStyle='#1b1d20'; q.fillRect(60,150,136,110); q.fillStyle='#d9dde2'; q.fillRect(88,160,26,90); q.fillRect(142,160,26,90); q.fillStyle='#111'; q.fillRect(30,280,196,90); q.fillStyle='#ffa21a'; q.font='12px monospace'; q.fillText('118.700   121.500',44,312); q.fillStyle='#d9dde2'; q.fillText(D.fam==='boeing'?'RADIO':'RMP',44,340); });
    plane(g,k==='lj60'?0.34:0.46,0.7,M(0xffffff,pt.t),cx,-0.669,z+0.55,-Math.PI/2);
    [-1,1].forEach(s=>box(g,0.035,0.12,0.05,M(0xd9dde2),cx+s*0.06,-0.62,z+0.55));                                                            // manettes de poussée
    outline(hit(g,0.46,0.06,0.25,cx,-0.66,z+0.32,(D.fam==='boeing'?'CDU':'MCDU')+' (ordinateur de gestion du vol) — ouvre le pédestal','ped'));
    outline(hit(g,0.3,0.16,0.2,cx,-0.62,z+0.55,'Manettes de poussée — ouvre le pédestal (poussée, volets, aérofreins)','ped'));
    outline(hit(g,0.46,0.06,0.22,cx,-0.66,z+0.8,'Boîtier radio (RMP) — ouvre la radio et le contrôle aérien','atc'));
    if(k==='a320'||k==='a350') [-1,1].forEach(s=>outline(hit(g,0.09,0.2,0.12,cx+s*0.92,-0.48,-0.35,'Mini-manche (tangage et roulis) — ouvre l\'aide des commandes','help')));
    else [0,2*cx].forEach(x=>outline(hit(g,0.36,0.36,0.08,x,-0.5,-0.62,'Manche (tangage et roulis) — ouvre l\'aide des commandes','help')));
  } else { const [pw,yt]=D.panel, ph=pw/(1200/420), y=yt-ph/2, T=tex(1200,420);
    box(g,pw+0.08,ph+0.08,0.05,M(0x111214),cx,y,z-0.03,-0.08);
    const m=plane(g,pw,ph,M(0xffffff,T.t,true),cx,y,z,-0.08); const S={id:'panel',m,T,parts:[['panel',[0,0,1,1]]],lay:[]}; SCRS.push(S);
    m.userData.p3={label:NAME.panel,act:'scr',scr:S}; HIT.push(m); outline(m);
    outline(hit(g,Math.min(0.9,pw),0.12,0.5,cx,0.36,-0.25,'Plafond — ouvre le panneau plafond','ovh'));
    if(D.fam==='heli') outline(hit(g,0.08,0.5,0.08,2*cx,-0.75,-0.3,'Cyclique — ouvre l\'aide des commandes','help'));
    else outline(hit(g,0.3,0.1,0.32,0,-0.42,-0.5,'Manche — ouvre l\'aide des commandes','help')); }
}

/* ---------- recopie des instruments sur les écrans 3D ---------- */
function fit(src,dst){ const sa=src[2]/src[3], da=dst[2]/dst[3]; let w=dst[2], h=dst[3]; if(sa>da) h=w/sa; else w=h*sa; return [dst[0]+(dst[2]-w)/2,dst[1]+(dst[3]-h)/2,w,h]; }
function extra(q,id,x,y,w,h){ q.fillStyle='#03080c'; q.fillRect(x,y,w,h); q.strokeStyle='#2b3d50'; q.strokeRect(x+1,y+1,w-2,h-2); q.font='600 '+Math.round(h*0.14)+'px monospace'; q.textAlign='left';
  if(id==='ois'){ q.fillStyle='#3fd0ff'; q.fillText('OIS · DOCUMENTATION',x+10,y+h*0.25); q.fillStyle='#9fb3c4'; ['PERF  T.O / LDG','CARTES  ·  MEL','DOSSIER DE VOL'].forEach((t,i)=>q.fillText(t,x+10,y+h*(0.47+i*0.19))); }
  else if(id==='vd'){ q.fillStyle='#3fd0ff'; q.fillText('PROFIL VERTICAL',x+10,y+h*0.22); const a=(S&&S.alt||0)/FT, top=Math.max(1000,(typeof AP!=='undefined'&&AP.alt)||a+2000);
    q.strokeStyle='#8a5a2b'; q.lineWidth=3; q.beginPath(); q.moveTo(x+6,y+h-8); for(let i=0;i<=20;i++) q.lineTo(x+6+i*(w-12)/20,y+h-8-((Math.sin(i*1.7)+1)*0.08*h)); q.stroke();
    q.strokeStyle='#3ddc84'; q.lineWidth=2; q.beginPath(); q.moveTo(x+10,y+h*0.85-Math.min(1,a/Math.max(top,1))*h*0.55); q.lineTo(x+w-10,y+h*0.3); q.stroke();
    q.fillStyle='#f2f4f6'; q.beginPath(); const py=y+h*0.85-Math.min(1,a/Math.max(top,1))*h*0.55; q.moveTo(x+10,py-6); q.lineTo(x+22,py); q.lineTo(x+10,py+6); q.fill(); }
  else if(id==='mail'){ q.fillStyle='#3fd0ff'; q.fillText('MAILBOX ATC (DATALINK)',x+10,y+h*0.6); }
  else if(id==='memo'){ q.fillStyle='#3ddc84'; q.fillText('MEMO',x+10,y+h*0.62); } }
let last=0;
function copy(now){ const iv=innerWidth<760?100:66; if(now-last<iv) return; last=now; const R=regions(); if(!R) return; const cv=CK.cv;
  SCRS.forEach(S=>{ const q=S.T.g, W=S.T.c.width, H=S.T.c.height; q.fillStyle='#000'; q.fillRect(0,0,W,H); S.lay=[];
    S.parts.forEach(([src,d])=>{ const dst=[d[0]*W,d[1]*H,d[2]*W,d[3]*H];
      if(R[src]){ const r=fit(R[src],dst); try{ q.drawImage(cv,R[src][0],R[src][1],R[src][2],R[src][3],r[0],r[1],r[2],r[3]); }catch(e){} S.lay.push({src,r:R[src],d:r}); }
      else extra(q,src,...dst); });
    if(typeof hasPower==='function'&&!hasPower()){ q.fillStyle='#000'; q.fillRect(0,0,W,H); }
    S.T.t.needsUpdate=true; }); }

/* ---------- activation ---------- */
function active(){ return P3.on&&typeof view!=='undefined'&&view==='ck'&&$('menu').hidden&&!!DATA[ACK]; }
let holder=null;
function fcuHome(on){ const f=$('fcu'); if(!f) return; if(on){ if(!holder){ holder=document.createElement('div'); holder.id='p3fcu'; document.body.appendChild(holder); } if(f.parentElement!==holder){ holder.appendChild(f); holder.classList.remove('open'); } }
  else if(f.parentElement!==$('ck')){ $('ck').insertBefore(f,$('ckc')); f.hidden=false; } }
function sync(){ const a=active(); document.body.classList.toggle('p3d',a); fcuHome(a); if(a) document.documentElement.style.setProperty('--ckh','0px'); btnSync(); }
const _rs=resize; resize=function(){ const r=_rs.apply(this,arguments); try{ sync(); }catch(e){} return r; };
const QDN=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),-0.23);
const _pc=placeCamera; placeCamera=function(){ const r=_pc.apply(this,arguments); try{ const a=active(), scrOn=!$('b-scr')||$('b-scr').classList.contains('on');
  if(a!==document.body.classList.contains('p3d')) { sync(); setTimeout(()=>{ try{ resize(); }catch(e){} },0); }
  if(a&&built!==ACK){ build(ACK); if(window.CK3D) CK3D.build(ACK); }
  // regard abaissé (≈ 13°) : on voit la planche sous la casquette, comme depuis le siège
  if(a){ camera.quaternion.multiply(QDN); camera.updateMatrixWorld(); }
  P.visible=a&&scrOn; if(P.visible){ P.quaternion.copy(qAtt); P.position.set(0,0,0); copy(performance.now());
    const n=SKY&&SKY.u&&SKY.u.night?SKY.u.night.value:0, day=1-0.72*n; mats.forEach(m=>{ const k=m.userData.emis?Math.max(day,0.85):day; m.color.copy(m.userData.base).multiplyScalar(k); }); } }catch(e){ P.visible=false; } return r; };

/* ---------- bouton ---------- */
const btn=document.createElement('button'); btn.type='button'; btn.id='b-p3d'; btn.title='Poste de pilotage 3D réaliste (instruments cliquables) ou planche 2D';
function btnSync(){ btn.textContent=P3.on?'🛩 Poste 3D':'🛩 Planche 2D'; btn.classList.toggle('on',P3.on); btn.hidden=typeof view!=='undefined'&&view!=='ck'; }
btn.onclick=()=>{ P3.on=!P3.on; wr(P3.on?'1':'0'); if(window.CK3D) CK3D.build(ACK); built=null; sync(); try{ resize(); }catch(e){} if(P3.on) hint(); };
(($('b-scr')||$('b-help'))||{after(){}}).after(btn); btnSync();

/* ---------- interaction : survol, toucher, clic ---------- */
const ray=new THREE.Raycaster(), nd=new THREE.Vector2(), el=renderer.domElement; let down=null;
const tip=document.createElement('div'); tip.id='p3tip'; tip.hidden=true; document.body.appendChild(tip);
function pick(x,y){ if(!P.visible||!HIT.length) return null; nd.set(x/innerWidth*2-1,-(y/innerHeight)*2+1); P.updateMatrixWorld(true); camera.updateMatrixWorld(); ray.setFromCamera(nd,camera);
  const h=ray.intersectObjects(HIT,false)[0]; return h?{m:h.object,uv:h.uv,p:h.object.userData.p3}:null; }
function setHov(m){ if(hov===m) return; if(hov&&hov.userData.ol) hov.userData.ol.visible=false; hov=m; if(m&&m.userData.ol) m.userData.ol.visible=true; document.body.classList.toggle('p3d-hov',!!m); }
el.addEventListener('pointermove',e=>{ if(e.pointerType!=='mouse'||!P.visible){ return; } const h=pick(e.clientX,e.clientY); setHov(h&&h.m);
  if(h){ tip.innerHTML=h.p.label.replace(/ — (.*)$/,'<small>$1</small>'); tip.hidden=false; tip.style.left=Math.min(innerWidth-270,e.clientX+14)+'px'; tip.style.top=(e.clientY+16)+'px'; } else tip.hidden=true; });
el.addEventListener('pointerleave',()=>{ setHov(null); tip.hidden=true; });
el.addEventListener('pointerdown',e=>{ down={x:e.clientX,y:e.clientY,t:performance.now()}; },true);
el.addEventListener('pointerup',e=>{ if(!down) return; const d=down; down=null; if(Math.hypot(e.clientX-d.x,e.clientY-d.y)>10||performance.now()-d.t>650) return;
  const h=pick(e.clientX,e.clientY); if(!h) return; act(h); },true);   // pas de stopPropagation : le regard (LK) doit voir le relâchement
function toCk(S,uv){ const W=S.T.c.width, H=S.T.c.height, px=uv.x*W, py=(1-uv.y)*H; const L=S.lay.find(l=>px>=l.d[0]&&px<=l.d[0]+l.d[2]&&py>=l.d[1]&&py<=l.d[1]+l.d[3]); if(!L) return null;
  const fx=L.r[0]+(px-L.d[0])/L.d[2]*L.r[2], fy=L.r[1]+(py-L.d[1])/L.d[3]*L.r[3], cv=CK.cv, b=cv.getBoundingClientRect(); return {x:b.left+fx/cv.width*b.width, y:b.top+fy/cv.height*b.height}; }
function tapCk(x,y){ const cv=CK.cv, o={clientX:x,clientY:y,bubbles:true,cancelable:true,pointerId:7,pointerType:'mouse',button:0};
  cv.dispatchEvent(new PointerEvent('pointerdown',o)); cv.dispatchEvent(new PointerEvent('pointerup',o)); cv.dispatchEvent(new MouseEvent('click',o)); }
function open(id){ const b=$(id); if(b) b.click(); }
function act(h){ const a=h.p.act; tip.hidden=true; window.P3LAST=h.p.label;
  if(a==='scr'){ const S=h.p.scr, c=h.uv&&toCk(S,h.uv), z=$('zoomscr'); if(c) tapCk(c.x,c.y);
    // repli : clic entre deux instruments (ou sur l'OIS, le profil vertical…) → l'écran ou la planche entière, agrandis
    if(!window.MANON&&window.ZOOMSCR&&(!z||z.hidden)){ let k=S.id.replace(/^out/,'pfd').replace(/^in/,'nd');
      if(S.id==='panel'){ const R=(ZOOMSCR.rects&&ZOOMSCR.rects())||[]; let best=null, bd=1e9; R.forEach(o=>{ const d=c?Math.hypot(o.r.left+o.x+o.w/2-c.x,o.r.top+o.y+o.h/2-c.y):0; if(d<bd){ bd=d; best=o.k; } }); k=best; }
      if(k) ZOOMSCR.open(k); } return; }
  if(a==='zoom'){ if(window.ZOOMSCR) ZOOMSCR.open(h.p.k); return; }
  if(a==='fcu'){ const f=$('fcu'); if(!f||!holder) return; if(holder.classList.contains('open')&&!f.hidden){ holder.classList.remove('open'); return; }
    const chip=document.querySelector('[data-reopen="fcu"]'); if(chip) chip.click(); f.hidden=false; holder.classList.add('open'); return; }
  if(a==='ovh'){ const o=$('ovh'); if(o&&o.hidden) open('b-ovh'); else if(o){ o.hidden=false; } return; }
  if(a==='ped'){ const p=$('ped'); if(p&&p.hidden) open('b-ped'); return; }
  if(a==='atc'){ const p=$('atc'); if(p&&p.hidden) open('b-atc'); return; }
  if(a==='help'){ const p=$('help'); if(p&&p.hidden) open('b-help'); return; } }
// une étape du guide qui montre un bouton du FCU l'affiche
if(typeof highlight==='function'){ const _h=highlight; highlight=function(selc){ try{ if(active()&&selc&&/data-f=|#fcu|#f-/.test(selc)&&holder){ holder.classList.add('open'); } }catch(e){} return _h.apply(this,arguments); }; }
function hint(){ if(!active()) return; let d=$('p3hint'); if(!d){ d=document.createElement('div'); d.id='p3hint'; document.body.appendChild(d); }
  d.textContent=innerWidth<760?'Touchez un instrument du poste pour l\'ouvrir':'Cliquez un instrument du poste pour l\'ouvrir (survol : son nom)'; d.style.opacity='1'; d.hidden=false;
  clearTimeout(hint.t); hint.t=setTimeout(()=>{ d.style.opacity='0'; setTimeout(()=>d.hidden=true,700); },4200); }
const _sv=typeof setView==='function'?setView:null; if(_sv){ setView=function(v){ const r=_sv.apply(this,arguments); try{ sync(); if(v==='ck') setTimeout(hint,600); }catch(e){} return r; }; }
window.P3D=Object.assign(P3,{P,DATA,build,regions,pick,act,hits:()=>HIT,screens:()=>SCRS,active,sync});
})();
