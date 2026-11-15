/* ===== MODÈLES 3D CONFORMES =====
   Appareils reconstruits aux cotes publiées (constructeurs, certificats de type EASA) :
   A320-200 : long. 37,57 m · envergure 35,80 m (sharklets) · fuselage 3,95 m · haut. 11,76 m · voie 7,59 m · empattement 12,64 m · flèche 25°
   Learjet 60 : long. 17,88 m · envergure 13,34 m · haut. 4,47 m · fuselage ≈ 2,0 m · empennage en T · réacteurs PW305A à l'arrière
   H125 : rotor 3 pales 10,69 m · fuselage 10,93 m · long. 12,94 m · rotor arrière 2 pales · patins
   R44 Raven II : rotor 2 pales 10,06 m · long. 11,66 m · haut. 3,28 m · rotor arrière 1,47 m à gauche · patins
   S-76 : rotor 4 pales 13,41 m · fuselage 13,22 m · long. 16,0 m · rotor arrière 4 pales 2,44 m à gauche · train rentrant
   Repère du modèle : −z = avant, +x = droite, +y = haut ; origine = axe du fuselage (le sol est à y = −yOff). */
(function(){
const T=THREE, D=Math.PI/180;
const mat=(c,o)=>new T.MeshLambertMaterial(Object.assign({color:c,side:T.DoubleSide},o||{}));
const VC=()=>new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide});
const col=new T.Color();
/* fuselage par sections elliptiques (ou super-elliptiques) : st = [{z,w,h,y,n}] du nez vers la queue ; colorFn(z,a,x,y) → couleur */
function densify(st,step){ const out=[]; for(let i=0;i<st.length;i++){ const a=st[i]; out.push(a); const b=st[i+1]; if(!b) break; const n=Math.floor((b.z-a.z)/step); for(let k=1;k<n;k++){ const f=k/n; out.push({z:a.z+(b.z-a.z)*f,w:a.w+(b.w-a.w)*f,h:a.h+(b.h-a.h)*f,y:(a.y||0)+((b.y||0)-(a.y||0))*f,n:a.n}); } } return out; }
function loft(st,seg,colorFn){ seg=seg||28; if(colorFn) st=densify(st,0.3); const pos=[],cols=[],idx=[];
  st.forEach((s,i)=>{ const n=s.n||2; for(let j=0;j<=seg;j++){ const a=j/seg*Math.PI*2, sa=Math.sin(a), ca=Math.cos(a);
    const x=s.w*Math.sign(sa)*Math.pow(Math.abs(sa),2/n), y=(s.y||0)+s.h*Math.sign(ca)*Math.pow(Math.abs(ca),2/n); pos.push(x,y,s.z);
    col.set(colorFn?colorFn(s.z,a,x,y-(s.y||0),s):0xffffff); cols.push(col.r,col.g,col.b); } });
  for(let i=0;i<st.length-1;i++) for(let j=0;j<seg;j++){ const a=i*(seg+1)+j, b=a+seg+1; idx.push(a,b,a+1, b,b+1,a+1); }
  const g=new T.BufferGeometry(); g.setAttribute('position',new T.Float32BufferAttribute(pos,3)); g.setAttribute('color',new T.Float32BufferAttribute(cols,3)); g.setIndex(idx); g.computeVertexNormals(); return g; }
/* surface portante : sections [{x,y,z (bord d'attaque),c (corde),t (épaisseur relative)}], corde dans l'axe +z */
const FX=[0,0.06,0.25,0.55,1], TX=[0,0.62,1,0.72,0.08];
function wing(sec){ const pos=[],idx=[], R=FX.length*2-2;
  sec.forEach((s,i)=>{ const p=sec[Math.min(i+1,sec.length-1)], q=sec[Math.max(i-1,0)]; const sp=new T.Vector3(p.x-q.x,p.y-q.y,p.z-q.z).normalize(); const nrm=new T.Vector3(0,0,1).cross(sp).normalize(); if(nrm.y<0) nrm.negate();
    const ring=[]; FX.forEach((f,k)=>ring.push([f,TX[k]])); for(let k=FX.length-2;k>0;k--) ring.push([FX[k],-TX[k]]);
    ring.forEach(([f,tt])=>{ const h=tt*s.t*s.c/2; pos.push(s.x+nrm.x*h, s.y+nrm.y*h, s.z+f*s.c+nrm.z*h); }); });
  for(let i=0;i<sec.length-1;i++) for(let k=0;k<R;k++){ const a=i*R+k, b=i*R+(k+1)%R, c=a+R, d=b+R; idx.push(a,c,b, b,c,d); }
  [0,sec.length-1].forEach(i=>{ for(let k=1;k<R-1;k++) idx.push(i*R,i*R+k,i*R+k+1); });
  const g=new T.BufferGeometry(); g.setAttribute('position',new T.Float32BufferAttribute(pos,3)); g.setIndex(idx); g.computeVertexNormals(); return g; }
function pair(g,m,parent){ const r=new T.Mesh(g,m), l=new T.Mesh(g,m); l.scale.x=-1; parent.add(r); parent.add(l); return [r,l]; }
/* corps de révolution autour de l'axe z : prof = [[r, z]] */
function lathe(prof,m,seg){ const g=new T.LatheGeometry(prof.map(([r,z])=>new T.Vector2(Math.max(r,0.001),-z)),seg||24); const me=new T.Mesh(g,m); me.rotation.x=-Math.PI/2; return me; }
function cyl(r1,r2,len,m,seg){ const me=new T.Mesh(new T.CylinderGeometry(r1,r2,len,seg||12),m); return me; }
function strut(a,b,r,m){ const va=new T.Vector3(...a), vb=new T.Vector3(...b), d=vb.clone().sub(va), me=cyl(r,r,d.length(),m,8); me.position.copy(va).add(vb).multiplyScalar(0.5); me.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize()); return me; }
function wheel(x,y,z,r,w,m,hub){ const g=new T.Group(); const t=cyl(r,r,w,m,18); t.rotation.z=Math.PI/2; g.add(t); if(hub){ const h=cyl(r*0.55,r*0.55,w*1.02,hub,12); h.rotation.z=Math.PI/2; g.add(h); } g.position.set(x,y,z); return g; }
function lights(g,L,p){ const add=(k,c,s,v)=>{ L[k]=mkLight(c,s); L[k].position.set(...v); }; add('port','#ff2020',p.s,p.port); add('stbd','#20ff40',p.s,[-p.port[0],p.port[1],p.port[2]]); add('tail','#ffffff',p.s*0.8,p.tail);
  add('bcn','#ff3020',p.s,p.bcn); add('bcn2','#ff3020',p.s,p.bcn2||p.bcn); add('strL','#ffffff',p.s*1.6,p.port); add('strR','#ffffff',p.s*1.6,[-p.port[0],p.port[1],p.port[2]]); add('land','#fff4d0',p.s*2.5,p.land); }
const GLASS=0x0f1a24, WIN=0x16222e;

/* ---------------- Airbus A320-200 ---------------- */
function a320(){ const g=new T.Group(), L={}, W=mat(0xf4f6f8), Wg=mat(0xd3d8dd), Gy=mat(0x9aa3ab), Dk=mat(0x1c2126), Bl=mat(0x163f86), Tyre=mat(0x111316), Hub=mat(0xb9c0c6), Mt=mat(0x8c939a);
  // fuselage : nez arrondi, section 3,95 × 4,14 m, cône de queue relevé vers l'APU
  const st=[[-18.78,.06,.06,-.35],[-18.55,.42,.42,-.32],[-18.2,.78,.8,-.26],[-17.7,1.15,1.2,-.18],[-17.1,1.5,1.55,-.1],[-16.75,1.64,1.71,-.06],[-16.4,1.76,1.84,-.03],[-15.6,1.93,2.02,0],[-14.6,1.975,2.07,0],
    [7.2,1.975,2.07,0],[9.2,1.88,1.92,.14],[11.2,1.6,1.58,.42],[13.2,1.25,1.2,.74],[15.2,.88,.82,1.02],[17.0,.52,.48,1.27],[18.3,.24,.24,1.43],[18.78,.14,.14,1.47]].map(([z,w,h,y])=>({z,w,h,y}));
  const fus=new T.Mesh(loft(st,36,(z,a,x,y)=>{ const ca=Math.cos(a);
    if(z>-17.45&&z<-15.95&&ca>0.38&&ca<0.86) return GLASS;   // vitres du poste
    if(ca<-0.55&&z>-12&&z<8) return 0xdfe3e7;                // ventre
    return 0xf4f6f8; }),VC()); g.add(fus);
  // hublots (instanciés) et portes
  const wg=new T.BoxGeometry(0.06,0.32,0.22), N=34, win=new T.InstancedMesh(wg,mat(WIN),N*2), m4=new T.Matrix4(); let k=0;
  for(let i=0;i<N;i++){ const z=-13.3+i*0.66+(i>11?0.5:0)+(i>13?0.25:0); if(z>8.2) continue; [-1,1].forEach(s=>{ m4.makeTranslation(s*1.97,0.62,z); win.setMatrixAt(k++,m4); }); } win.count=k; g.add(win);
  [[-14.1],[7.6]].forEach(([z])=>[-1,1].forEach(s=>{ const d=new T.Mesh(new T.BoxGeometry(0.04,1.85,0.82),mat(0xe1e5e9)); d.position.set(s*1.985,0.15,z); g.add(d); }));
  // voilure : flèche 25° au quart de corde, dièdre ≈ 5°, cassure du bord de fuite, sharklets 2,4 m
  const dh=Math.tan(5.1*D), wy=x=>-1.32+(x-1.9)*dh, le=x=>-4.25+(x-1.9)*Math.tan(27.5*D);
  const ws=[{x:0.5,y:wy(1.9),z:-4.6,c:7.2,t:.15},{x:1.9,y:wy(1.9),z:le(1.9),c:6.65,t:.15},{x:6.3,y:wy(6.3),z:le(6.3),c:4.62,t:.135},{x:16.95,y:wy(16.95),z:le(16.95),c:1.55,t:.11},
    {x:17.45,y:wy(16.95)+0.45,z:le(16.95)+0.55,c:1.15,t:.1},{x:17.9,y:wy(16.95)+2.4,z:le(16.95)+2.1,c:0.45,t:.09}];
  pair(wing(ws),Wg,g);
  // empennage horizontal (envergure 12,45 m) et dérive
  pair(wing([{x:0.3,y:.95,z:13.2,c:3.9,t:.11},{x:6.22,y:1.6,z:16.95,c:1.45,t:.09}]),Wg,g);
  g.add(new T.Mesh(wing([{x:0,y:1.3,z:11.0,c:6.2,t:.11},{x:0,y:7.55,z:15.55,c:2.35,t:.09}]),Bl));
  g.add(new T.Mesh(wing([{x:0,y:1.55,z:9.4,c:3.0,t:.06},{x:0,y:2.6,z:11.4,c:1.2,t:.06}]),Bl));   // dorsale
  // réacteurs CFM56-5B sous l'aile : nacelle ≈ 4,4 m, garde au sol ≈ 0,75 m
  [-1,1].forEach(s=>{ const e=new T.Group(); e.position.set(s*5.75,-2.28,0);
    e.add(lathe([[0.86,-7.35],[1.0,-7.25],[1.08,-6.9],[1.1,-6.2],[1.04,-5.0],[0.88,-3.9],[0.68,-3.15]],W,28));
    const lip=lathe([[0.84,-7.36],[0.98,-7.31],[1.0,-7.25]],Mt,28); e.add(lip);
    const fan=new T.Mesh(new T.CircleGeometry(0.84,24),Dk); fan.position.z=-7.1; e.add(fan); const sp=lathe([[0.001,-7.2],[0.22,-6.95],[0.3,-6.8]],Mt,16); e.add(sp);
    e.add(lathe([[0.66,-3.2],[0.55,-2.6],[0.0,-1.75]],Gy,20));
    const py=new T.Mesh(wing([{x:0,y:0.75,z:-6.0,c:4.2,t:.09},{x:0,y:1.42,z:-4.6,c:3.4,t:.09}]),W); e.add(py); g.add(e); });
  // trains : avant 2 roues (Ø 0,76 m) à 5,1 m du nez, principal 2 × 2 roues (Ø 1,25 m), voie 7,59 m, empattement 12,64 m
  const gear=new T.Group(), Gd=-4.1; const zn=-13.65, zm=zn+12.64;
  gear.add(strut([0,-1.7,zn],[0,Gd+0.38,zn],0.11,Mt)); [-0.27,0.27].forEach(x=>gear.add(wheel(x,Gd+0.38,zn,0.38,0.27,Tyre,Hub)));
  [-1,1].forEach(s=>{ gear.add(strut([s*3.6,wy(3.6)-0.1,zm-0.3],[s*3.795,Gd+0.62,zm],0.16,Mt)); [-0.46,0.46].forEach(dx=>gear.add(wheel(s*3.795+dx,Gd+0.62,zm,0.62,0.4,Tyre,Hub))); });
  g.add(gear); g.userData.gear=gear;
  lights(g,L,{s:3,port:[-17.0,wy(16.95)+0.05,le(16.95)+0.3],tail:[0,1.5,18.8],bcn:[0,2.08,-1.5],bcn2:[0,-2.08,-1.0],land:[0,-1.9,-13.4]});
  return {g,L}; }

/* ---------------- Learjet 60 ---------------- */
function lj60(){ const g=new T.Group(), L={}, W=mat(0xf5f6f7), Gy=mat(0xa2aab2), Dk=mat(0x1c2126), St=mat(0x3a4656), Tyre=mat(0x111316), Hub=mat(0xb9c0c6), Mt=mat(0x8c939a);
  const st=[[-8.94,.03,.03,-.22],[-8.7,.28,.26,-.2],[-8.3,.5,.48,-.17],[-7.8,.7,.68,-.12],[-7.2,.86,.84,-.06],[-6.5,.96,.95,0],[-5.8,.99,.99,0],[2.6,.99,.99,0],[4.0,.9,.9,.08],[5.6,.68,.7,.24],[7.0,.46,.5,.4],[8.3,.26,.3,.56],[8.94,.1,.12,.62]].map(([z,w,h,y])=>({z,w,h,y}));
  g.add(new T.Mesh(loft(st,32,(z,a,x,y)=>{ const ca=Math.cos(a), sa=Math.abs(Math.sin(a));
    if(z>-7.75&&z<-6.65&&ca>0.35&&ca<0.86) return GLASS;
    if(ca>-0.2&&ca<0.12&&z>-5.6&&z<2.4) return 0x3a4656;   // liseré
    return 0xf5f6f7; }),VC()));
  const wg=new T.BoxGeometry(0.05,0.36,0.28), win=new T.InstancedMesh(wg,mat(WIN),12), m4=new T.Matrix4(); let k=0;
  for(let i=0;i<6;i++){ const z=-4.9+i*0.95; [-1,1].forEach(s=>{ m4.makeTranslation(s*0.985,0.28,z); win.setMatrixAt(k++,m4); }); } g.add(win);
  // voilure basse : double flèche du bord d'attaque, petits winglets
  const wy=x=>-0.68+(x-0.9)*Math.tan(2.5*D);
  pair(wing([{x:0.2,y:wy(.9),z:-1.9,c:3.8,t:.14},{x:0.9,y:wy(.9),z:-1.6,c:3.45,t:.14},{x:2.9,y:wy(2.9),z:-0.85,c:2.4,t:.125},{x:6.45,y:wy(6.45),z:0.05,c:1.15,t:.1},{x:6.67,y:wy(6.45)+0.55,z:0.55,c:0.7,t:.09}]),Gy,g);
  // empennage en T
  g.add(new T.Mesh(wing([{x:0,y:0.6,z:5.4,c:2.9,t:.11},{x:0,y:2.5,z:7.15,c:1.55,t:.1}]),W));
  pair(wing([{x:0,y:2.52,z:7.0,c:1.6,t:.1},{x:2.35,y:2.62,z:7.85,c:0.8,t:.09}]),Gy,g);
  // réacteurs PW305A sur l'arrière du fuselage
  [-1,1].forEach(s=>{ const e=new T.Group(); e.position.set(s*1.58,0.5,0);
    e.add(lathe([[0.42,2.45],[0.52,2.6],[0.56,3.0],[0.55,4.2],[0.47,5.1],[0.36,5.45]],W,24)); const lip=lathe([[0.41,2.44],[0.5,2.5],[0.52,2.6]],Mt,24); e.add(lip);
    const fan=new T.Mesh(new T.CircleGeometry(0.41,20),Dk); fan.position.z=2.6; e.add(fan); e.add(lathe([[0.34,5.4],[0.0,6.0]],Gy,16));
    g.add(e); g.add(new T.Mesh(wing([{x:s*0.9,y:0.5,z:3.3,c:1.6,t:.12},{x:s*1.2,y:0.5,z:3.35,c:1.5,t:.12}]),W)); });
  // trains
  const gear=new T.Group(), Gd=-1.9;
  gear.add(strut([0,-0.8,-6.3],[0,Gd+0.21,-6.3],0.05,Mt)); [-0.12,0.12].forEach(x=>gear.add(wheel(x,Gd+0.21,-6.3,0.21,0.14,Tyre,Hub)));
  [-1,1].forEach(s=>{ gear.add(strut([s*1.3,wy(1.3)-0.05,0.85],[s*1.3,Gd+0.3,0.95],0.07,Mt)); [-0.12,0.12].forEach(dx=>gear.add(wheel(s*1.3+dx,Gd+0.3,0.95,0.3,0.17,Tyre,Hub))); });
  g.add(gear); g.userData.gear=gear;
  lights(g,L,{s:2,port:[-6.6,wy(6.45)+0.05,0.4],tail:[0,2.55,8.6],bcn:[0,2.66,7.6],bcn2:[0,-1.0,0],land:[0,-0.95,-6.0]});
  return {g,L}; }

/* ---------------- hélicoptères ---------------- */
function rotor(nb,R,ch,m,y,z,hubR){ const grp=new T.Group(); for(let i=0;i<nb;i++){ const h=new T.Group(); const b=new T.Mesh(new T.BoxGeometry(ch,0.06,R*0.9),m); b.position.z=R*0.55; h.add(b); h.rotation.y=i*Math.PI*2/nb; grp.add(h); }
  const hub=cyl(hubR,hubR,0.22,m,12); grp.add(hub); grp.position.set(0,y,z); return grp; }
function trotor(nb,R,ch,m){ const grp=new T.Group(); for(let i=0;i<nb;i++){ const h=new T.Group(); const b=new T.Mesh(new T.BoxGeometry(0.04,R*0.9,ch),m); b.position.y=R*0.55; h.add(b); h.rotation.x=i*Math.PI*2/nb; grp.add(h); } grp.add(cyl(0.08,0.08,0.14,m,10).rotateZ(Math.PI/2)); return grp; }
function disc(R,y,z){ const d=new T.Mesh(new T.CircleGeometry(R,48),new T.MeshBasicMaterial({color:0x111111,transparent:true,opacity:0.16,side:T.DoubleSide,depthWrite:false})); d.rotation.x=-Math.PI/2; d.position.set(0,y,z); return d; }
function skids(g,xw,y,z0,z1,legs,yb,m){ [-1,1].forEach(s=>{ const t=strut([s*xw,y,z0],[s*xw,y,z1],0.045,m); g.add(t); g.add(strut([s*xw,y,z0],[s*xw,y+0.22,z0-0.32],0.045,m));
    legs.forEach(z=>g.add(strut([s*xw,y,z],[s*xw*0.55,yb,z],0.045,m))); }); legs.forEach(z=>g.add(strut([-xw*0.55,yb,z],[xw*0.55,yb,z],0.045,m))); }

function h125(){ const g=new T.Group(), L={}, R=mat(0xc62a2f), W=mat(0xf2f3f4), Dk=mat(0x24292e), Mt=mat(0x7f878e);
  const st=[[-3.38,.06,.06,-.18],[-3.25,.42,.42,-.15],[-3.0,.7,.68,-.08],[-2.6,.86,.8,0],[-2.0,.9,.84,.02],[-1.0,.9,.84,.03],[0.0,.86,.8,.06],[0.8,.68,.62,.22],[1.5,.42,.4,.34],[2.05,.2,.22,.36],[5.5,.15,.17,.38],[7.4,.11,.13,.4],[7.6,.07,.08,.4]].map(([z,w,h,y])=>({z,w,h,y,n:2.4}));
  g.add(new T.Mesh(loft(st,32,(z,a,x,y)=>{ const ca=Math.cos(a), sa=Math.abs(Math.sin(a)); if(z<-1.75&&ca>-0.35) return GLASS; if(z>-1.7&&z<-0.25&&sa>0.8&&ca>-0.1&&ca<0.65) return 0x1a2733; if(ca<-0.5&&z<1) return 0xf2f3f4; return 0xc62a2f; }),VC()));
  g.add(new T.Mesh(loft([{z:-1.5,w:.05,h:.05,y:.82},{z:-1.2,w:.5,h:.28,y:.95},{z:0.8,w:.56,h:.3,y:.95},{z:1.7,w:.32,h:.2,y:.8},{z:2.1,w:.06,h:.06,y:.72}].map(s=>Object.assign(s,{n:2.6})),24,()=>0xc62a2f),VC()));
  g.add(cyl(0.09,0.09,0.42,Mt).translateY(1.38).translateZ(-0.25));
  // empennage : stabilisateur horizontal avec dérives d'extrémité, dérive, rotor arrière à droite
  pair(wing([{x:0.1,y:.38,z:5.9,c:.62,t:.12},{x:1.12,y:.38,z:6.0,c:.5,t:.12}]),R,g);
  [-1,1].forEach(s=>g.add(new T.Mesh(wing([{x:s*1.13,y:.18,z:5.95,c:.55,t:.08},{x:s*1.13,y:.62,z:6.08,c:.42,t:.08}]),R)));
  g.add(new T.Mesh(wing([{x:0,y:.4,z:6.95,c:.75,t:.12},{x:0,y:1.32,z:7.45,c:.42,t:.1}]),R)); g.add(new T.Mesh(wing([{x:0,y:-.42,z:7.1,c:.5,t:.1},{x:0,y:.38,z:6.95,c:.72,t:.12}]),R));
  const tr=trotor(2,0.93,0.16,Dk); tr.position.set(0.24,0.62,7.45); g.add(tr); g.userData.trotor=tr;
  skids(g,1.12,-1.72,-1.75,1.55,[-1.05,0.85],-0.75,Mt);
  const bl=rotor(3,5.345,0.35,Dk,1.6,-0.25,0.28); g.add(bl); g.userData.blades=bl; g.add(disc(5.345,1.6,-0.25));
  lights(g,L,{s:1.6,port:[-0.92,0.1,-0.6],tail:[0,1.3,7.65],bcn:[0,1.2,1.4],bcn2:[0,-0.85,0],land:[0,-0.8,-2.6]}); return {g,L}; }

function r44(){ const g=new T.Group(), L={}, W=mat(0xf4f5f6), Bl=mat(0x1b3a6e), Dk=mat(0x22272c), Mt=mat(0x9aa1a8);
  const st=[[-2.48,.05,.05,-.2],[-2.35,.42,.44,-.16],[-2.05,.62,.66,-.08],[-1.5,.66,.72,0],[-0.6,.64,.7,.02],[0.2,.55,.58,.05],[0.75,.32,.32,.16],[1.05,.1,.1,.26],[6.45,.07,.07,.3],[6.6,.05,.05,.3]].map(([z,w,h,y])=>({z,w,h,y,n:2.2}));
  g.add(new T.Mesh(loft(st,32,(z,a,x,y)=>{ const ca=Math.cos(a), sa=Math.abs(Math.sin(a)); if(z<-1.15&&ca>-0.45) return GLASS; if(z>-1.15&&z<0.1&&sa>0.85&&ca>-0.15&&ca<0.6) return 0x1a2733; if(z>-1.15&&z<0.6&&ca<-0.15&&ca>-0.55) return 0x1b3a6e; return 0xf4f5f6; }),VC()));
  g.add(new T.Mesh(loft([{z:-0.85,w:.05,h:.05,y:.72},{z:-0.6,w:.3,h:.42,y:.88},{z:0.3,w:.3,h:.42,y:.86},{z:0.7,w:.06,h:.1,y:.78}].map(s=>Object.assign(s,{n:2.4})),20,()=>0xf4f5f6),VC()));
  g.add(cyl(0.07,0.07,0.6,Mt).translateY(1.38).translateZ(-0.2));
  g.add(new T.Mesh(wing([{x:0,y:.3,z:6.1,c:.55,t:.1},{x:0,y:.98,z:6.42,c:.32,t:.09}]),Bl)); g.add(new T.Mesh(wing([{x:0,y:-.5,z:6.25,c:.4,t:.09},{x:0,y:.3,z:6.1,c:.55,t:.1}]),Bl));
  pair(wing([{x:0.05,y:.3,z:5.5,c:.38,t:.1},{x:0.55,y:.3,z:5.55,c:.3,t:.1}]),W,g);
  const tr=trotor(2,0.735,0.12,Dk); tr.position.set(-0.2,0.38,6.55); g.add(tr); g.userData.trotor=tr;
  skids(g,1.09,-1.58,-1.55,1.05,[-0.95,0.55],-0.65,Mt);
  const bl=rotor(2,5.03,0.27,Dk,1.68,-0.2,0.18); g.add(bl); g.userData.blades=bl; g.add(disc(5.03,1.68,-0.2));
  lights(g,L,{s:1.4,port:[-0.67,0.0,-0.9],tail:[0,0.3,6.65],bcn:[0,1.1,0.4],bcn2:[0,-0.7,0],land:[0,-0.55,-2.2]}); return {g,L}; }

function s76(){ const g=new T.Group(), L={}, W=mat(0xf4f5f6), Nv=mat(0x13294b), Dk=mat(0x22272c), Mt=mat(0x8c939a), Tyre=mat(0x111316), Hub=mat(0xb9c0c6);
  const st=[[-5.62,.06,.06,-.4],[-5.45,.42,.36,-.36],[-5.0,.72,.6,-.25],[-4.4,.92,.8,-.12],[-3.6,1.03,.92,-.03],[-2.6,1.06,.95,0],[1.4,1.06,.95,0],[2.5,.92,.82,.1],[3.6,.6,.56,.26],[4.5,.36,.38,.36],[7.6,.22,.28,.48],[8.2,.15,.22,.52]].map(([z,w,h,y])=>({z,w,h,y,n:2.3}));
  g.add(new T.Mesh(loft(st,32,(z,a,x,y)=>{ const ca=Math.cos(a), sa=Math.abs(Math.sin(a)); if(z<-3.5&&z>-5.3&&ca>0.05) return GLASS; if(z>-2.8&&z<1.2&&sa>0.85&&ca>0.05&&ca<0.6) return 0x1a2733; if(ca<-0.25) return 0x13294b; return 0xf4f5f6; }),VC()));
  g.add(new T.Mesh(loft([{z:-2.6,w:.05,h:.05,y:.82},{z:-2.2,w:.72,h:.38,y:.98},{z:2.6,w:.78,h:.42,y:.98},{z:3.6,w:.4,h:.25,y:.8},{z:4.1,w:.06,h:.06,y:.62}].map(s=>Object.assign(s,{n:2.6})),24,()=>0xf4f5f6),VC()));
  g.add(cyl(0.12,0.12,0.36,Mt).translateY(1.32).translateZ(0.1));
  [-1,1].forEach(s=>{ const sp=new T.Mesh(loft([{z:-0.3,w:.04,h:.04,y:-.62},{z:0.1,w:.32,h:.3,y:-.62},{z:2.0,w:.3,h:.28,y:-.6},{z:2.6,w:.04,h:.04,y:-.55}],16,()=>0xf4f5f6),VC()); sp.position.x=s*1.05; g.add(sp); });
  pair(wing([{x:0.2,y:.45,z:6.3,c:.85,t:.12},{x:1.52,y:.45,z:6.45,c:.65,t:.12}]),W,g);
  g.add(new T.Mesh(wing([{x:0,y:.45,z:7.25,c:1.05,t:.12},{x:0,y:2.05,z:8.25,c:.55,t:.1}]),Nv));
  const tr=trotor(4,1.22,0.16,Dk); tr.position.set(-0.3,1.6,8.1); g.add(tr); g.userData.trotor=tr;
  const gear=new T.Group(), Gd=-2.3; gear.add(strut([0,-0.9,-3.9],[0,Gd+0.24,-3.9],0.06,Mt)); [-0.13,0.13].forEach(x=>gear.add(wheel(x,Gd+0.24,-3.9,0.24,0.15,Tyre,Hub)));
  [-1,1].forEach(s=>{ gear.add(strut([s*1.1,-0.7,1.2],[s*1.2,Gd+0.3,1.2],0.07,Mt)); gear.add(wheel(s*1.2,Gd+0.3,1.2,0.3,0.2,Tyre,Hub)); }); g.add(gear); g.userData.gear=gear;
  const bl=rotor(4,6.705,0.4,Dk,1.5,0.1,0.32); g.add(bl); g.userData.blades=bl; g.add(disc(6.705,1.5,0.1));
  lights(g,L,{s:1.8,port:[-1.1,0.2,-0.5],tail:[0,2.0,8.4],bcn:[0,1.3,2.8],bcn2:[0,-1.0,0],land:[0,-0.95,-4.4]}); return {g,L}; }

const BUILD={a320,lj60,h125,r44,s76};
const _bm=buildModel;
buildModel=function(key){ const f=BUILD[key]; if(!f) return _bm(key); const {g,L}=f(); Object.values(L).forEach(o=>{ o.visible=false; g.add(o); }); g.userData.L=L; g.userData.real=true; return g; };
// train rentré en vol, rotor arrière qui tourne
const _pc=placeCamera; placeCamera=function(){ _pc.apply(this,arguments); if(!MODEL||!MODEL.userData.real) return; const u=MODEL.userData;
  if(u.gear) u.gear.visible=S.onGround||S.gear!==false; if(u.trotor) u.trotor.rotation.x+=(S.eng[0]||S.eng[1]?2.2:0.8)*(S.nr||0); };
try{ if(typeof MODEL!=='undefined'&&MODEL) setModel(); }catch(e){}
})();
