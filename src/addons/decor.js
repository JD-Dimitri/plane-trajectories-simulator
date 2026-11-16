/* ===== DÉCOR : tours de contrôle, aérogares et villes =====
   Les nuages d'orage en boules sont retirés de la vue 3D (ils restent sur le radar météo).
   Repères réels : tour de JFK 98 m (1992) · tours de Roissy-CDG : Nord 112 m, Sud ≈ 90 m, Centrale 75 m, Est 60 m · Terminal 1 circulaire (1974) ·
   Manhattan (One World Trade Center 541 m, Empire State Building 443 m, Chrysler 319 m) · Paris (tour Eiffel 330 m, Montparnasse 210 m, La Défense). Positions approchées. */
(function(){
const T=THREE;
cbModel=function(c){ const g=new T.Group(); g.visible=false; g.userData.mat=new T.MeshLambertMaterial(); scene.add(g); return g; };   // plus de « blocs arrondis »
const M=c=>new T.MeshLambertMaterial({color:c});
const GLASS=new T.MeshLambertMaterial({color:0x5f8fae,emissive:0x0a1620}), CONC=M(0xc9c6bf), WHITE=M(0xeef0f2), GREY=M(0x8c949c), DARK=M(0x2b3138), ROOF=M(0x6f767d);
function facade(base,win,lit){ const cv=document.createElement('canvas'); cv.width=64; cv.height=128; const g=cv.getContext('2d'); g.fillStyle=base; g.fillRect(0,0,64,128);
  for(let y=4;y<128;y+=8) for(let x=3;x<64;x+=8){ g.fillStyle=Math.random()<lit?'#ffe9a8':win; g.fillRect(x,y,5,5); } const t=new T.CanvasTexture(cv); t.wrapS=t.wrapT=T.RepeatWrapping; return t; }
const FAC=[facade('#9aa4ad','#33475a',0.08),facade('#c2b9a8','#3b4652',0.06),facade('#5e7383','#1c2c3a',0.1),facade('#d7d9dc','#4a5d70',0.05)];
const famMat=FAC.map(t=>new T.MeshLambertMaterial({map:t}));
/* un objet posé au sol en (lat, lon) : repère local x = est, y = haut, z = sud */
window.OBS=window.OBS||[];
/* obstacles solides : chaque bâtiment est enregistré (boîte orientée, hauteur) pour les collisions piéton / appareil */
function regObs(obj,lat,lon,elev,hdg){ try{ const boxes=[]; if(obj.userData.list){ obj.userData.list.forEach(b=>boxes.push({x:b.x,z:b.z,hw:b.w/2,hd:b.d/2,h:b.h,r:b.r||0})); }
  else { const bb=new T.Box3().setFromObject(obj); if(!isFinite(bb.min.x)) return; const r=hdg?-hdg*Math.PI/180:0, cx=(bb.min.x+bb.max.x)/2, cz=(bb.min.z+bb.max.z)/2;
   if(obj.userData.parts) obj.userData.parts.forEach(q=>boxes.push(q)); else boxes.push({x:cx*Math.cos(r)+cz*Math.sin(r),z:-cx*Math.sin(r)+cz*Math.cos(r),hw:(bb.max.x-bb.min.x)/2,hd:(bb.max.z-bb.min.z)/2,h:bb.max.y,r}); }
  let rad=0; boxes.forEach(b=>{ rad=Math.max(rad,Math.hypot(b.x,b.z)+Math.hypot(b.hw,b.hd)); }); OBS.push({lat,lon,elev:elev||0,rad,boxes}); }catch(e){} }
function place(obj,lat,lon,elev,hdg){ regObs(obj,lat,lon,elev,hdg); const p=ecef(lat,lon,elev||0), b=enuBasis(lat,lon); const g=new T.Group(); g.matrixAutoUpdate=false;
  const m=new T.Matrix4().makeBasis(new T.Vector3(...b.E),new T.Vector3(...b.U),new T.Vector3(-b.N[0],-b.N[1],-b.N[2])); m.setPosition(p[0],p[1],p[2]); g.matrix.copy(m);
  if(hdg) obj.rotation.y=-hdg*Math.PI/180; g.add(obj); world.add(g); return g; }
/* tour de contrôle : fût, bloc technique, vigie vitrée, toit, antennes */
function tower(h,style){ const g=new T.Group(), r=style==='slim'?3.2:4.2, cabH=6, cabR=style==='wide'?9:7.5;
  const shaft=new T.Mesh(new T.CylinderGeometry(r,r*1.15,h-cabH-3,16),CONC); shaft.position.y=(h-cabH-3)/2; g.add(shaft);
  const base=new T.Mesh(new T.BoxGeometry(26,9,18),CONC); base.position.set(14,4.5,0); g.add(base);
  const deck=new T.Mesh(new T.CylinderGeometry(cabR*0.9,r*1.2,3,10),CONC); deck.position.y=h-cabH-1.5; g.add(deck);
  const cab=new T.Mesh(new T.CylinderGeometry(cabR*1.08,cabR,cabH,10),GLASS); cab.position.y=h-cabH/2; g.add(cab);
  const roof=new T.Mesh(new T.CylinderGeometry(cabR*0.7,cabR*1.12,1.4,10),DARK); roof.position.y=h+0.7; g.add(roof);
  const ant=new T.Mesh(new T.CylinderGeometry(0.15,0.15,8,6),GREY); ant.position.y=h+5; g.add(ant);
  const rad=new T.Mesh(new T.BoxGeometry(5,0.6,1),GREY); rad.position.y=h+3; g.add(rad);
  const bcn=mkLight('#ff3020',6); bcn.position.y=h+9.2; g.add(bcn); return g; }
function box(w,h,d,mat,x,z,y){ const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat); m.position.set(x||0,(y||0)+h/2,z||0); return m; }
function terminal(len,dep,h,glass){ const g=new T.Group(); g.add(box(len,h,dep,WHITE)); g.add(box(len*0.98,h*0.45,dep*1.02,glass?GLASS:GREY,0,0,h*0.35)); g.add(box(len*1.02,1.2,dep*1.06,ROOF,0,0,h)); return g; }
function hangar(w,d,h){ const g=new T.Group(); const body=new T.Mesh(new T.CylinderGeometry(w/2,w/2,d,16,1,false,0,Math.PI),M(0xb8bfc6)); body.rotation.z=Math.PI/2; body.rotation.y=Math.PI/2; body.scale.set(1,1,h/(w/2)); body.position.y=0; g.add(body); return g; }
/* immeubles fusionnés par famille de façade (peu d'appels de dessin, adapté au mobile) */
function merged(list){ const g=new T.Group(); [0,1,2,3].forEach(k=>{ const P=[],N=[],U=[]; list.filter(b=>b.k===k).forEach(b=>{ const geo=new T.BoxGeometry(b.w,b.h,b.d).toNonIndexed(); const uv=geo.attributes.uv;
    for(let i=0;i<uv.count;i++) uv.setXY(i,uv.getX(i)*Math.max(1,Math.max(b.w,b.d)/14),uv.getY(i)*Math.max(1,b.h/22));
    geo.rotateY(b.r||0); geo.translate(b.x,b.h/2,b.z); P.push(...geo.attributes.position.array); N.push(...geo.attributes.normal.array); U.push(...geo.attributes.uv.array); });
    if(!P.length) return; const bg=new T.BufferGeometry(); bg.setAttribute('position',new T.Float32BufferAttribute(P,3)); bg.setAttribute('normal',new T.Float32BufferAttribute(N,3)); bg.setAttribute('uv',new T.Float32BufferAttribute(U,2)); g.add(new T.Mesh(bg,famMat[k])); }); g.userData.list=list; return g; }
function rng(seed){ let s=seed; return ()=>{ s=(s*16807)%2147483647; return s/2147483647; }; }
/* quartier : zone (rectangle ou ellipse) remplie d'immeubles */
function city(lat0,lon0,lat1,lon1,step,hMin,hMax,seed,elev,hdg,ellipse){ const rnd=rng(seed), c=[(lat0+lat1)/2,(lon0+lon1)/2], kx=111320*Math.cos(c[0]*Math.PI/180), list=[];
  const W=(lon1-lon0)*kx/2, H=(lat1-lat0)*111320/2;
  for(let x=-W;x<=W;x+=step) for(let z=-H;z<=H;z+=step){ if(ellipse&&(x*x/(W*W)+z*z/(H*H))>1) continue; if(rnd()<0.18) continue;
    list.push({x,z,h:hMin+Math.pow(rnd(),2.2)*(hMax-hMin),w:step*(0.45+rnd()*0.35),d:step*(0.45+rnd()*0.35),k:Math.floor(rnd()*4),r:-(hdg||0)*Math.PI/180}); }
  place(merged(list),c[0],c[1],elev); }
/* bande urbaine le long d'un axe (île de Manhattan) : largeurs en mètres le long de l'axe */
function strip(A,B,widths,step,hFn,seed,elev,hdg){ const rnd=rng(seed), c=[(A[0]+B[0])/2,(A[1]+B[1])/2], kx=111320*Math.cos(c[0]*Math.PI/180);
  const ax=(B[1]-A[1])*kx, az=-(B[0]-A[0])*111320, L=Math.hypot(ax,az), ux=ax/L, uz=az/L, vx=-uz, vz=ux, list=[];
  for(let u=-L/2;u<=L/2;u+=step){ const f=(u+L/2)/L, wi=widths[Math.min(widths.length-1,Math.floor(f*widths.length))]; for(let v=-wi/2;v<=wi/2;v+=step){ if(rnd()<0.15) continue;
    list.push({x:u*ux+v*vx,z:u*uz+v*vz,h:hFn(f,rnd),w:step*(0.5+rnd()*0.3),d:step*(0.5+rnd()*0.3),k:Math.floor(rnd()*4),r:-(hdg||0)*Math.PI/180}); } }
  place(merged(list),c[0],c[1],elev); }
function landmark(kind,lat,lon,elev){ const g=new T.Group();
  if(kind==='1wtc'){ const sh=new T.Mesh(new T.CylinderGeometry(18,42,417,4),GLASS); sh.rotation.y=Math.PI/4; sh.position.y=208; g.add(sh); const sp=new T.Mesh(new T.CylinderGeometry(1.2,2.5,124,6),GREY); sp.position.y=417+62; g.add(sp); }
  if(kind==='esb'){ [[57,140,40,0],[44,60,30,140],[32,110,24,200],[18,60,14,310],[8,20,8,370]].forEach(([w,h,d,y])=>g.add(box(w,h,d,famMat[1],0,0,y))); const sp=new T.Mesh(new T.CylinderGeometry(1,3,63,8),GREY); sp.position.y=380+31; g.add(sp); }
  if(kind==='chrysler'){ g.add(box(40,240,40,famMat[3])); const cr=new T.Mesh(new T.ConeGeometry(16,60,8),M(0xd9dde2)); cr.position.y=270; g.add(cr); const sp=new T.Mesh(new T.CylinderGeometry(0.6,1.5,25,6),GREY); sp.position.y=312; g.add(sp); }
  if(kind==='eiffel'){ const mat=M(0x7a5a3c); const leg=(h0,h1,w0,w1)=>{ const m=new T.Mesh(new T.CylinderGeometry(w1,w0,h1-h0,4,1,true),mat); m.rotation.y=Math.PI/4; m.position.y=(h0+h1)/2; g.add(m); };
    leg(0,57,62,40); g.add(box(70,4,70,mat,0,0,57)); leg(61,115,40,22); g.add(box(42,3,42,mat,0,0,115)); leg(118,276,22,6); g.add(box(14,6,14,mat,0,0,276)); const sp=new T.Mesh(new T.CylinderGeometry(1,2,48,6),mat); sp.position.y=306; g.add(sp); }
  if(kind==='montparnasse'){ g.add(box(60,210,36,famMat[2])); }
  place(g,lat,lon,elev); return g; }

/* ---------- New York : JFK, LaGuardia, Manhattan, héliport ---------- */
place(tower(98,'wide'),40.6440,-73.7808,4);
[[40.6443,-73.7826,320,80,22,true,20],[40.6455,-73.7766,240,70,20,true,60],[40.6468,-73.7896,300,70,18,true,-30],[40.6432,-73.7897,220,70,18,false,0],[40.6492,-73.7833,200,60,16,false,90],[40.6420,-73.7740,180,60,16,false,20]]
  .forEach(([la,lo,l,d,h,gl,hd])=>place(terminal(l,d,h,gl),la,lo,4,hd));
[[40.6585,-73.7920],[40.6600,-73.7860],[40.6560,-73.8000]].forEach(([la,lo])=>place(hangar(70,80,24),la,lo,4,30));
city(40.6460,-73.7930,40.6520,-73.7780,90,8,22,7,4,0);   // parkings et bâtiments de la zone centrale
if(APTS.KLGA) place(tower(71,'slim'),40.7746,-73.8746,6);
strip([40.7010,-74.0140],[40.7980,-73.9490],[900,1300,1700,2000,2300,2300,2300,2200,2100,2000],90,(f,r)=>{ const lower=f<0.14, mid=f>0.42&&f<0.62; return (lower?50:mid?60:15)+Math.pow(r(),2.2)*(lower?240:mid?280:80); },11,5,29);   // Manhattan : Lower Manhattan, Midtown
city(40.6800,-74.0000,40.7000,-73.9500,110,10,45,23,5,0);       // Brooklyn
landmark('1wtc',40.7127,-74.0134,5); landmark('esb',40.7484,-73.9857,5); landmark('chrysler',40.7516,-73.9755,5);
/* ---------- Paris : Roissy-CDG et la ville ---------- */
// Orly et La Réunion Roland-Garros : tour et aérogares, positions approchées [SIMPLIFIÉ]
setTimeout(()=>{ try{ if(APTS.LFPO){ place(tower(45,'slim'),48.7312,2.3725,89); [[48.7300,2.3590,420,90,22,0],[48.7262,2.3666,380,110,24,0]].forEach(([la,lo,l,dd,h,hd])=>place(terminal(l,dd,h,true),la,lo,89,hd)); }
if(APTS.FMEE){ place(tower(40,'slim'),-20.8946,55.5163,20); place(terminal(320,80,18,true),-20.8940,55.5205,20,-12); place(hangar(70,80,22),-20.8948,55.5110,20,-12); } }catch(e){} },0);
place(tower(112,'slim'),49.0186,2.5350,110); place(tower(90,'slim'),48.9985,2.5560,110); place(tower(75,'wide'),49.0090,2.5505,110); place(tower(60,'slim'),49.00597,2.59729,110);
{ const t1=new T.Group(); const ring=new T.Mesh(new T.CylinderGeometry(96,96,40,40),CONC); ring.position.y=20; t1.add(ring); const top=new T.Mesh(new T.CylinderGeometry(70,96,4,40),ROOF); top.position.y=42; t1.add(top);
  for(let i=0;i<7;i++){ const a=i/7*Math.PI*2; const sat=box(26,10,26,WHITE,Math.cos(a)*210,Math.sin(a)*210); t1.add(sat); } t1.userData.parts=[{x:0,z:0,hw:92,hd:92,h:44,r:0}].concat([...Array(7).keys()].map(i=>{ const an=i/7*Math.PI*2; return {x:Math.cos(an)*210,z:Math.sin(an)*210,hw:13,hd:13,h:10,r:0}; })); place(t1,49.0144,2.5418,110); }
[[49.0045,2.5650,420,70,20,-12],[49.0030,2.5760,420,70,20,12],[49.0040,2.5880,520,80,22,0],[49.0090,2.5900,260,90,24,90]].forEach(([la,lo,l,d,h,hd])=>place(terminal(l,d,h,true),la,lo,110,hd));
[[48.9960,2.5780],[48.9945,2.5880],[48.9975,2.6000]].forEach(([la,lo])=>place(hangar(90,100,30),la,lo,110,-10));
city(49.0040,2.5280,49.0120,2.5480,90,10,35,29,110,0);          // Roissypôle, hôtels, fret
city(48.8180,2.2550,48.9000,2.4150,160,18,36,31,0,0,true);         // Paris intra-muros (immeubles de 6 à 8 étages)
city(48.8850,2.2300,48.8960,2.2480,60,60,230,37,0,0);          // La Défense
landmark('eiffel',48.8584,2.2945,0); landmark('montparnasse',48.8421,2.3219,0);
// nuit : les fenêtres et la vigie s'éclairent un peu
setInterval(()=>{ try{ const n=SKY.u.night.value; GLASS.emissive.setRGB(0.04+0.25*n,0.08+0.25*n,0.12+0.2*n); famMat.forEach(m=>m.emissive&&m.emissive.setRGB(0.25*n,0.22*n,0.12*n)); }catch(e){} },2000);
})();
