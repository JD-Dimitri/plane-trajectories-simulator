/* ===== PHYSIQUE DES OBJETS : tout objet solide est un obstacle, chaque substance suit sa propre constitution =====
   Solides : l'appareil (fuselage là où il est trop bas pour passer dessous, nacelles, jambes de train, ailes basses, poutres de queue,
   patins), les bâtiments (tours, terminaux, hangars, immeubles) → le piéton les contourne, l'appareil qui les heurte s'écrase.
   Eau : on ne marche pas dessus (l'appareil qui s'y pose amerrit : déjà géré). Nuages : traversables, mais visibilité très réduite,
   turbulence et risque de givrage sous 0 °C. Dimensions issues des cotes publiées (cf. addon_models). */
(function(){
/* --- formes solides de chaque appareil : capsules [x1,z1,x2,z2,rayon] en mètres, repère modèle (−z avant, +x droite) --- */
const M2=(l)=>l.concat(l.filter(c=>c[0]||c[2]).map(c=>[-c[0],c[1],-c[2],c[3],c[4]]));
const HULL={
 a320:M2([[0,-10,0,12,2.05],[5.75,-6.9,5.75,-1.7,1.3],[3.8,0.4,3.8,1.7,0.55],[0,-15.9,0,-15.2,0.35]]),   // fuselage central (ventre bas) ; on passe sous le nez et sous le cône de queue
 lj60:M2([[0,-8.4,0,8.6,1.0],[0,-9.3,0,-8.4,0.6],[1.0,0.6,3.8,1.2,1.0],[3.8,1.2,6.6,1.7,0.6],[1.65,3.5,1.65,7.6,0.65]]),
 h125:M2([[0,-4.2,0,1.6,1.05],[0,1.6,0,6.6,0.35],[0,6.6,0,7.3,0.45],[1.15,-2.6,1.15,1.6,0.1]]),
 r44:M2([[0,-3.4,0,1.0,0.72],[0,1.0,0,5.4,0.22],[0,5.4,0,5.9,0.3],[1.1,-2.2,1.1,1.2,0.08]]),
 s76:M2([[0,-6.0,0,3.0,1.15],[0,-6.7,0,-6.0,0.7],[0,3.0,0,8.3,0.45],[0,8.3,0,8.9,0.5],[1.3,0.6,1.3,1.4,0.3],[0,-4.8,0,-4.3,0.3]])
};
const RAD={a320:17.9,lj60:6.7,h125:5.4,r44:5.0,s76:6.7};   // demi-envergure / rayon rotor : pour les bâtiments
const MARGIN=0.35;                                          // demi-largeur d'épaules d'un piéton
function segDist(px,pz,c){ const [x1,z1,x2,z2]=c, dx=x2-x1, dz=z2-z1, L=dx*dx+dz*dz, t=L?Math.max(0,Math.min(1,((px-x1)*dx+(pz-z1)*dz)/L)):0, cx=x1+dx*t, cz=z1+dz*t, d=Math.hypot(px-cx,pz-cz); return [d,px-cx,pz-cz]; }
function hullHit(mx,mz,k){ let best=null; (HULL[k||ACK]||[]).forEach(c=>{ const [d,nx,nz]=segDist(mx,mz,c), pen=c[4]+MARGIN-d; if(pen>0&&(!best||pen>best.pen)){ const n=d>1e-6?[nx/d,nz/d]:[mx>=0?1:-1,0]; best={pen,n}; } }); return best; }
/* repère local (x est, z sud, origine appareil) ↔ repère modèle */
const l2m=(x,z)=>{ const t=-S.psi, c=Math.cos(t), s=Math.sin(t); return [x*c-z*s, x*s+z*c]; };
const m2lv=(x,z)=>{ const t=-S.psi, c=Math.cos(t), s=Math.sin(t); return [x*c+z*s, -x*s+z*c]; };
/* bâtiments proches, en repère local */
function obsHit(lx,lz,R,altM){ const OB=window.OBS||[]; if(!OB.length) return null; const kx=111320*Math.cos(S.lat*Math.PI/180), wx=lx, wz=lz; let best=null;
 for(const o of OB){ const ox=(o.lon-S.lon)*kx, oz=-(o.lat-S.lat)*111320, dx=wx-ox, dz=wz-oz; if(Math.hypot(dx,dz)>o.rad+R+5) continue; if(altM!=null&&altM-o.elev>Math.max(...o.boxes.map(b=>b.h))+2) continue;
  for(const b of o.boxes){ if(altM!=null&&altM-o.elev>b.h) continue; const ex=dx-b.x, ez=dz-b.z, c=Math.cos(b.r), s=Math.sin(b.r), bx=ex*c-ez*s, bz=ex*s+ez*c, qx=Math.max(-b.hw,Math.min(b.hw,bx)), qz=Math.max(-b.hd,Math.min(b.hd,bz)), d=Math.hypot(bx-qx,bz-qz), inside=Math.abs(bx)<=b.hw&&Math.abs(bz)<=b.hd;
   const pen=inside?R+Math.min(b.hw-Math.abs(bx),b.hd-Math.abs(bz)):R-d; if(pen>0&&(!best||pen>best.pen)){ let nx,nz; if(inside){ if(b.hw-Math.abs(bx)<b.hd-Math.abs(bz)){ nx=Math.sign(bx)||1; nz=0; } else { nx=0; nz=Math.sign(bz)||1; } } else { nx=(bx-qx)/d; nz=(bz-qz)/d; }
    best={pen,n:[nx*c+nz*s,-nx*s+nz*c],o,b}; } } } return best; }
function pedLL(lx,lz){ const kx=111320*Math.cos(S.lat*Math.PI/180); return [S.lat-lz/111320, S.lon+lx/kx]; }
function blocked(lx,lz){ const [mx,mz]=l2m(lx,lz), h=hullHit(mx,mz); if(h){ const n=m2lv(h.n[0],h.n[1]); return {pen:h.pen,n,what:'appareil'}; }
 const o=obsHit(lx,lz,MARGIN,null); if(o) return {pen:o.pen,n:o.n,what:'bâtiment'};
 try{ const [la,lo]=pedLL(lx,lz); if(typeof waterAt==='function'&&waterAt(la,lo)) return {pen:0.5,n:[-lx/(Math.hypot(lx,lz)||1),-lz/(Math.hypot(lx,lz)||1)],what:'eau'}; }catch(e){}
 return null; }
let SIDE=1, warnT=0;
function resolve(px,pz,nx,nz){ const dx=nx-px, dz=nz-pz; if(!dx&&!dz) return [px,pz];
 let b=blocked(nx,nz); if(!b) return [nx,nz];
 const d=dx*b.n[0]+dz*b.n[1], tx=dx-d*b.n[0], tz=dz-d*b.n[1];            // glisser le long de la surface
 if(Math.hypot(tx,tz)>1e-4&&!blocked(px+tx,pz+tz)) return [px+tx,pz+tz];
 const L=Math.hypot(dx,dz); for(const s of [SIDE,-SIDE]){ const rx=-b.n[1]*s*L, rz=b.n[0]*s*L; if(!blocked(px+rx,pz+rz)){ SIDE=s; return [px+rx,pz+rz]; } }
 if(performance.now()>warnT){ warnT=performance.now()+2500; try{ flash(b.what==='eau'?'On ne marche pas sur l\'eau.':'Obstacle solide : impossible de traverser '+(b.what==='appareil'?'l\'appareil':'le bâtiment')+'.','am'); }catch(e){} }
 return [px,pz]; }
function pushOut(){ for(let i=0;i<6;i++){ const b=blocked(GD.walk.x,GD.walk.z); if(!b||b.what==='eau') return; GD.walk.x+=b.n[0]*(b.pen+0.05); GD.walk.z+=b.n[1]*(b.pen+0.05); } }
/* points du tour avion : jamais à l'intérieur d'un solide (on regarde la pièce depuis l'extérieur) */
function fixPoints(){ for(const k in WALKPTS){ (WALKPTS[k]||[]).forEach(p=>{ for(let i=0;i<6;i++){ const h=hullHit(p[0],p[1],k); if(!h) break; p[0]+=h.n[0]*(h.pen+0.25); p[1]+=h.n[1]*(h.pen+0.25); } }); }
 const h=(WALKPTS.h125||[]).find(p=>/fenestron/.test(p[2])); if(h) h[2]='Poutre de queue, rotor anticouple bipale'; }
try{ fixPoints(); }catch(e){}
/* marche manuelle et automatique : collisions */
if(typeof walkStep==='function'){ const _w=walkStep; walkStep=function(dt){ const px=GD.walk.x, pz=GD.walk.z; _w.apply(this,arguments); const [x,z]=resolve(px,pz,GD.walk.x,GD.walk.z); GD.walk.x=x; GD.walk.z=z; }; }
let stuck=0;
if(typeof autoWalk==='function'){ const _a=autoWalk; autoWalk=function(dt){ const px=GD.walk.x, pz=GD.walk.z; _a.apply(this,arguments); if(GD.walk.x===px&&GD.walk.z===pz) return;
  const want=Math.hypot(GD.walk.x-px,GD.walk.z-pz); const [x,z]=resolve(px,pz,GD.walk.x,GD.walk.z); GD.walk.x=x; GD.walk.z=z;
  const got=Math.hypot(x-px,z-pz); if(got<want*0.15){ stuck+=dt; if(stuck>2){ stuck=0; const pts=WALKPTS[ACK]||[]; let i=0; while(i<pts.length&&GD.seen.has(i)) i++; if(i<pts.length){ GD.seen.add(i); try{ walkBox(i); }catch(e){} } } } else stuck=0; }; }
setInterval(()=>{ try{ if(typeof view!=='undefined'&&view==='walk'&&GD&&GD.walk) pushOut(); }catch(e){} },500);
/* appareil contre bâtiments : collision = accident */
let ign=new Set(), t0=0, lastMI=null;
setInterval(()=>{ try{ if(typeof S==='undefined'||!MI||crashed||paused) return; if(MI!==lastMI){ lastMI=MI; ign=new Set(); t0=performance.now(); }
  const R=RAD[ACK]||10, alt=S.alt; const hit=obsHit(0,0,R,alt);
  if(performance.now()-t0<6000){ if(hit) ign.add(hit.b); return; }   // départ au contact d'un bâtiment (poste de stationnement) : toléré
  if(hit&&!ign.has(hit.b)&&(S.V||0)>1.5){ CRASH_WHY='Collision avec un bâtiment : un obstacle solide ne peut pas être traversé (hauteur '+Math.round(hit.b.h)+' m).'; crash(-Math.min(30,S.V||5),false); } }catch(e){} },120);
/* nuages : substance traversable (gouttelettes d'eau ou cristaux de glace) → visibilité, turbulence, givrage */
const fog=document.createElement('div'); fog.id='cloudfx'; fog.style.cssText='position:fixed;inset:0;pointer-events:none;background:radial-gradient(ellipse at center,rgba(235,240,245,.92),rgba(205,214,222,.97));opacity:0;transition:opacity .6s'; try{ renderer.domElement.after(fog); }catch(e){ document.body.appendChild(fog); }
const TH={FEW:[700,0.35],SCT:[1200,0.6],BKN:[2000,0.85],OVC:[3000,0.97],VV:[600,0.97]};
let inC=false, shake=0, icing=0;
function layers(){ let best=null, bd=1e9; try{ for(const k in WXS.met){ const m=WXS.met[k], a=APTS[k]; if(!a||!m.clouds) continue; const d=gcKm(S.lat,S.lon,a.lat,a.lon); if(d<bd){ bd=d; best=m; } } }catch(e){} return bd<120&&best?best.clouds:[]; }
setInterval(()=>{ try{ if(typeof S==='undefined'||!MI){ fog.style.opacity=0; return; } const agl=aglFt(); let op=0, cb=false;
  layers().forEach(c=>{ const t=TH[c.cov]||[1000,0.5]; let thick=t[0]; if(c.cb){ thick=12000; cb=true; } const b=c.base, top=b+thick; if(agl>=b&&agl<=top){ const edge=Math.min(agl-b,top-agl), k=Math.min(1,edge/250); op=Math.max(op,t[1]*k); } });
  const ext=view!=='ck'||!document.body.classList.contains('hidescr'); fog.style.opacity=(op*(view==='walk'?0:1)).toFixed(2);
  const now=op>0.3; if(now&&!inC){ inC=true; try{ flash('Dans les nuages : visibilité quasi nulle, pilotage aux instruments'+(cb?' — cumulonimbus : turbulence forte !':''),'am'); }catch(e){} } if(!now) inC=false;
  shake=op>0.2?(cb?0.012:0.004)*op:0;
  const oat=15-2*(S.alt/0.3048/1000); if(now&&oat<=0){ icing+=1; if(icing===10) try{ flash('Nuage à '+Math.round(oat)+' °C : risque de givrage — antigivrage voilure et moteurs !','am'); }catch(e){} } else icing=0; }catch(e){} },300);
if(typeof placeCamera==='function'){ const _pc=placeCamera; placeCamera=function(){ _pc.apply(this,arguments); if(shake&&!paused){ camera.rotateX((Math.random()-0.5)*shake); camera.rotateZ((Math.random()-0.5)*shake); } }; }
window.PHYS={HULL,blocked,obsHit,fixPoints};
})();
