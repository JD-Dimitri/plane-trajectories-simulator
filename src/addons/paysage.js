/* =====================================================================================================
   V10.43 (F32) — PAYSAGE AUTOUR DES AÉROPORTS DES PARCOURS (approche, décollage, basse altitude)
   La carte de détail du sol (±0,9° autour de l'appareil) ne montrait que quelques plans d'eau et les pistes : le reste était
   la texture mondiale (≈ 50 km par point), d'où un sol uniforme. On y ajoute, sous les pistes et les plans d'eau existants :
     - La Réunion : contour de l'île, mer autour, villes côtières (Saint-Denis, Le Port, Saint-Paul, Saint-Pierre…) ;
     - Île-de-France : Seine et Marne, Paris et sa proche banlieue, villes nouvelles, forêts (Rambouillet, Saint-Germain,
       Montmorency, Ermenonville, Fontainebleau, Sénart…), mosaïque de champs de la Brie et de la Beauce ;
     - New York : Atlantique au sud de Long Island, Jamaica Bay, baie de New York, détroit de Long Island, zones urbaines.
   STATUT : [APPROX.] — tracés dessinés d'après la géographie générale connue, coordonnées arrondies (quelques centaines de
   mètres à quelques kilomètres d'écart). Les données réelles (Natural Earth, OpenStreetMap, imagerie satellite, relief
   Copernicus) n'ont pas pu être téléchargées depuis l'environnement de développement : elles sont prévues pour la version Pro
   (F33). Ne pas utiliser pour la navigation réelle.
   ===================================================================================================== */
(function(){
'use strict';
if(typeof detailMap!=='function') return;
// [lat, lon] ; polygones fermés automatiquement
const REUNION=[[-20.873,55.448],[-20.885,55.505],[-20.905,55.585],[-20.94,55.645],[-20.985,55.69],[-21.03,55.72],[-21.08,55.755],[-21.13,55.79],[-21.20,55.825],
  [-21.27,55.815],[-21.34,55.785],[-21.37,55.735],[-21.385,55.68],[-21.385,55.62],[-21.37,55.56],[-21.345,55.48],[-21.32,55.43],[-21.285,55.38],[-21.255,55.345],
  [-21.21,55.31],[-21.165,55.285],[-21.11,55.25],[-21.055,55.222],[-21.01,55.27],[-20.97,55.285],[-20.935,55.29],[-20.925,55.33],[-20.90,55.39]];
const URB=[ // [lat, lon, demi-axe N-S km, demi-axe E-O km, densité 0..1, nom]
  [-20.895,55.455,2.4,4.2,0.9,'Saint-Denis'],[-20.935,55.30,2.0,2.6,0.8,'Le Port'],[-21.01,55.275,2.5,1.6,0.7,'Saint-Paul'],[-21.335,55.475,2.4,3.0,0.85,'Saint-Pierre'],
  [-21.28,55.41,1.6,2.0,0.6,'Saint-Louis'],[-20.96,55.65,1.6,2.0,0.6,'Saint-André'],[-21.035,55.715,1.4,1.4,0.55,'Saint-Benoît'],[-21.37,55.62,1.2,1.6,0.5,'Saint-Joseph'],
  [-21.06,55.23,1.6,1.0,0.55,'Saint-Gilles'],[-20.91,55.56,1.2,1.8,0.5,'Sainte-Marie'],[-21.165,55.29,1.2,1.0,0.5,'Saint-Leu'],
  [48.857,2.347,4.6,6.3,1.0,'Paris'],[48.86,2.36,12,15,0.7,'Petite couronne'],[48.89,2.24,1.8,2.2,1.0,'La Défense'],[48.78,2.46,3.5,4,0.6,'Créteil'],
  [49.035,2.08,3.5,5,0.55,'Cergy-Pontoise'],[48.78,2.05,3,4,0.55,'Saint-Quentin-en-Yvelines'],[48.63,2.43,3,4,0.55,'Évry'],[48.85,2.60,3,5,0.55,'Marne-la-Vallée'],
  [48.96,2.50,3,4,0.55,'Aulnay, Sevran'],[48.99,2.45,2,3,0.5,'Sarcelles, Gonesse'],[48.80,2.13,2.5,3,0.65,'Versailles'],[48.54,2.66,2.2,2.8,0.55,'Melun'],
  [49.42,2.83,2.5,3,0.6,'Compiègne'],[48.95,2.89,1.8,2.2,0.5,'Meaux'],[48.75,2.11,1.4,1.6,0.6,'Toussus, Buc'],[48.70,2.31,2.5,3,0.6,'Orly, Massy'],
  [40.76,-73.98,4.5,1.6,1.0,'Manhattan'],[40.65,-73.95,6,7,0.85,'Brooklyn'],[40.72,-73.82,6,9,0.75,'Queens'],[40.84,-73.88,4,5,0.8,'Bronx'],
  [40.73,-74.17,4,4,0.75,'Newark'],[40.72,-74.06,3,2,0.8,'Jersey City'],[40.58,-74.15,4,4,0.5,'Staten Island'],[40.72,-73.60,8,12,0.45,'Nassau'],[40.94,-73.85,6,6,0.45,'Westchester']];
const FOR=[ // forêts [lat, lon, demi-axe N-S km, demi-axe E-O km, nom]
  [48.66,1.83,8,11,'Rambouillet'],[48.93,2.08,3.5,3.5,'Saint-Germain'],[49.03,2.30,3,4,'Montmorency'],[49.13,2.62,4,6,'Ermenonville, Chantilly'],[49.19,2.48,3,4,'Chantilly'],
  [48.41,2.67,8,9,'Fontainebleau'],[48.64,2.52,3,3,'Sénart'],[48.78,2.17,2.5,3,'Meudon, Versailles'],[49.37,2.87,6,9,'Compiègne'],[49.06,2.13,3,4,'L\'Isle-Adam'],
  [48.67,2.07,2.5,3,'Port-Royal'],[48.80,2.66,2.5,3,'Ferrières'],[48.95,1.60,3,5,'Rosny'],
  [-21.08,55.62,5,6,'Bélouve, Bébour'],[-21.16,55.52,6,8,'Hauts de La Réunion'],[-21.28,55.70,4,6,'Grand Brûlé, Mare-Longue']];
const RIV=[ // rivières : [largeur m, points]
  [160,[[48.40,2.70],[48.53,2.66],[48.60,2.55],[48.67,2.47],[48.72,2.43],[48.765,2.41],[48.82,2.39],[48.835,2.375],[48.851,2.355],[48.856,2.343],[48.862,2.32],[48.862,2.295],
    [48.853,2.282],[48.835,2.26],[48.828,2.24],[48.84,2.222],[48.87,2.225],[48.885,2.245],[48.896,2.27],[48.907,2.30],[48.925,2.335],[48.94,2.30],[48.945,2.25],[48.93,2.20],
    [48.915,2.15],[48.94,2.10],[48.985,2.07],[48.99,2.02],[48.96,1.96],[48.99,1.88],[49.0,1.78],[49.05,1.67]]],                      // Seine
  [90,[[48.95,2.89],[48.90,2.78],[48.87,2.70],[48.86,2.60],[48.835,2.53],[48.815,2.46],[48.82,2.415]]],                                          // Marne
  [80,[[49.42,2.83],[49.30,2.62],[49.20,2.50],[49.10,2.25],[49.05,2.10],[49.0,2.07]]],                                                               // Oise
  [70,[[48.62,2.25],[48.68,2.37],[48.70,2.405]]]];                                                                                                       // Orge
const SEA_NY=[[39.40,-74.30],[39.40,-72.60],[40.62,-72.60],[40.64,-73.0],[40.60,-73.40],[40.585,-73.70],[40.57,-73.88],[40.575,-73.95],[40.58,-74.0],[40.57,-74.03],
  [40.495,-74.06],[40.47,-74.12],[40.48,-74.25],[40.40,-74.30],[39.40,-74.30]];                                                                                       // Atlantique et baie inférieure
const BAYS_NY=[[[40.61,-73.88],[40.65,-73.86],[40.655,-73.80],[40.63,-73.76],[40.60,-73.75],[40.585,-73.80],[40.59,-73.86]],                                   // Jamaica Bay
  [[40.60,-74.05],[40.64,-74.03],[40.69,-74.04],[40.70,-74.02],[40.67,-74.0],[40.62,-74.02],[40.58,-74.0]],                                                     // baie supérieure
  [[40.80,-73.80],[40.84,-73.75],[40.88,-73.65],[40.92,-73.40],[41.0,-73.10],[41.2,-72.60],[41.30,-72.60],[41.10,-73.30],[40.95,-73.70],[40.87,-73.80]]];       // détroit de Long Island
function H(s){ let h=2166136261; for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); } return ()=>{ h^=h<<13; h^=h>>>17; h^=h<<5; return ((h>>>0)%10000)/10000; }; }
const _dm=detailMap;
detailMap=function(lat,lon,dl,dlo){ const base=_dm.apply(this,arguments); try{
  const im=base.image, N=im.width, c=document.createElement('canvas'); c.width=c.height=N; const g=c.getContext('2d');
  const X=lo=>(lo-(lon-dlo))/(2*dlo)*N, Y=la=>N-(la-(lat-dl))/(2*dl)*N, kpx=N/(2*dl*110.57), kx=N/(2*dlo*111.32*Math.cos(lat*Math.PI/180));
  const near=(la,lo,m)=>Math.abs(la-lat)<dl+m&&Math.abs(lo-lon)<dlo+m, poly=P=>{ g.beginPath(); P.forEach(([a,b],i)=>i?g.lineTo(X(b),Y(a)):g.moveTo(X(b),Y(a))); g.closePath(); };
  const sea='rgba(31,58,84,1)', land='rgba(84,112,64,1)';
  const reunion=near(-21.1,55.53,0.6), france=lat>46&&lat<51&&lon>-1&&lon<6, ny=lat>39.5&&lat<42&&lon>-75.5&&lon<-72;
  if(!reunion&&!france&&!ny) return base;
  // 1) mer et terres
  if(reunion){ g.fillStyle=sea; g.fillRect(0,0,N,N); g.fillStyle=land; poly(REUNION); g.fill(); }
  if(ny){ g.fillStyle=sea; [SEA_NY,...BAYS_NY].forEach(P=>{ poly(P); g.fill(); }); }
  // 2) mosaïque de champs (plaines agricoles) : parcelles de 0,4 à 1,5 km, teintes de blé, colza, prairie, labour
  if(france){ const R=H('champs'+Math.round(lat*10)+Math.round(lon*10)), C=['rgba(150,150,84,0.3)','rgba(112,134,70,0.28)','rgba(168,156,98,0.3)','rgba(98,122,62,0.26)','rgba(138,124,88,0.26)','rgba(176,170,96,0.28)'];
    const step=Math.max(7,1.6*kpx); for(let y=0;y<N;y+=step) for(let x=0;x<N;x+=step*(0.7+R()*0.9)){ g.fillStyle=C[Math.floor(R()*C.length)]; g.fillRect(x,y,step*(0.6+R()*0.8),step*(0.6+R()*0.6)); } }
  // 3) forêts
  FOR.forEach(([a,b,ns,eo])=>{ if(!near(a,b,0.2)) return; const R=H('f'+a+b); g.fillStyle='rgba(38,66,34,0.92)'; g.beginPath();
    for(let i=0;i<=24;i++){ const t=i/24*Math.PI*2, r=0.8+R()*0.35; const xx=X(b)+Math.cos(t)*eo*kx*r, yy=Y(a)+Math.sin(t)*ns*kpx*r; i?g.lineTo(xx,yy):g.moveTo(xx,yy); } g.fill(); });
  // 4) zones urbaines : tache grise, puis îlots et rues
  URB.forEach(([a,b,ns,eo,dn])=>{ if(!near(a,b,0.25)) return; const R=H('u'+a+b), cx=X(b), cy=Y(a), rx=eo*kx, ry=ns*kpx;
    g.save(); g.translate(cx,cy); g.scale(1,ry/Math.max(rx,0.01)); const gr=g.createRadialGradient(0,0,0,0,0,rx);
    gr.addColorStop(0,`rgba(120,116,108,${Math.min(1,1.05*dn)})`); gr.addColorStop(0.75,`rgba(118,114,106,${0.85*dn})`); gr.addColorStop(1,'rgba(124,120,110,0)');
    g.fillStyle=gr; g.beginPath(); g.arc(0,0,rx,0,7); g.fill(); g.restore();
    const n=Math.min(1600,Math.round(rx*ry*dn*0.6)); for(let i=0;i<n;i++){ const t=R()*Math.PI*2, r=Math.sqrt(R()); const xx=cx+Math.cos(t)*rx*r, yy=cy+Math.sin(t)*ry*r;
      g.fillStyle=R()<0.5?'rgba(170,166,158,0.6)':'rgba(92,90,86,0.55)'; g.fillRect(xx,yy,1+R()*2.5,1+R()*2.5); } });
  // 5) rivières
  g.strokeStyle='rgba(38,66,92,1)'; g.lineCap=g.lineJoin='round'; RIV.forEach(([w,P])=>{ if(!P.some(([a,b])=>near(a,b,0.1))) return; g.lineWidth=Math.max(1.4,w/1000*kpx); g.beginPath(); P.forEach(([a,b],i)=>i?g.lineTo(X(b),Y(a)):g.moveTo(X(b),Y(a))); g.stroke(); });
  // 6) par-dessus : plans d'eau et pistes existants (carte d'origine)
  g.drawImage(im,0,0);
  const t=new THREE.CanvasTexture(c); t.anisotropy=4; t.minFilter=THREE.LinearMipmapLinearFilter; base.dispose(); return t;
 }catch(e){ console.warn('paysage',e); return base; } };
window.PAYSAGE={REUNION,URB,FOR,RIV,statut:'[APPROX.]'};

/* ---------- V10.43 : côte nord de La Réunion — relief, NRL et Saint-Denis en 3D [APPROX.] ---------- */
const inPoly=(la,lo,P)=>{ let c=false; for(let i=0,j=P.length-1;i<P.length;j=i++){ const [a1,b1]=P[i],[a2,b2]=P[j]; if((a1>la)!==(a2>la)&&lo<(b2-b1)*(la-a1)/(a2-a1)+b1) c=!c; } return c; };
try{ if(typeof RELIEF!=='undefined') RELIEF.push(
  [-20.985,55.44,2100,4.2],[-20.95,55.47,900,3.5],                              // Roche Écrite (2 276 m) et pentes au-dessus de Saint-Denis
  [-20.912,55.415,650,1.8],[-20.925,55.39,750,1.8],[-20.935,55.365,750,1.8],[-20.945,55.345,650,1.8],   // plateau de La Montagne : falaises de la route du Littoral
  [-20.95,55.40,1100,3.0],[-21.0,55.38,1300,5.0]); }catch(e){}                   // arrière-pays (Dos d'Âne, Mafate)
const FLAT={FMEE:[2.4,4.5]};    // aplanissement autour de la piste : rayon plein, rayon de raccord (km)
if(typeof elevAt==='function'&&typeof reliefAt==='function'){ const _el=elevAt; elevAt=function(lat,lon){
  if(lat<-20.6&&lat>-21.6&&lon>55.0&&lon<56.0){ if(!inPoly(lat,lon,REUNION)) return 0; let e=reliefAt(lat,lon); const a=APTS.FMEE;
    if(a){ const d=gcKm(lat,lon,a.lat,a.lon), [r0,r1]=FLAT.FMEE; if(d<r1){ const w=clamp((r1-d)/(r1-r0),0,1); e=e*(1-w)+a.elev*w; } }
    for(const k in APTS){ if(k==='FMEE') continue; const b=APTS[k], d=gcKm(lat,lon,b.lat,b.lon); if(d<4){ const w=clamp((4-d)/2,0,1); e=e*(1-w)+b.elev*w; } }
    // bord de mer : la pente rejoint 0 sur les 300 derniers mètres
    let near=1e9; for(let i=0;i<REUNION.length;i++){ const [a1,b1]=REUNION[i],[a2,b2]=REUNION[(i+1)%REUNION.length]; const t=Math.max(0,Math.min(1,((lat-a1)*(a2-a1)+(lon-b1)*(b2-b1))/((a2-a1)**2+(b2-b1)**2))); near=Math.min(near,gcKm(lat,lon,a1+(a2-a1)*t,b1+(b2-b1)*t)); }
    return near<0.3?e*near/0.3:e; }
  return _el(lat,lon); }; }
function put(obj,lat,lon,elev,hdg){ const p=ecef(lat,lon,elev||0), b=enuBasis(lat,lon), g=new THREE.Group(); g.matrixAutoUpdate=false;
  const m=new THREE.Matrix4().makeBasis(new THREE.Vector3(...b.E),new THREE.Vector3(...b.U),new THREE.Vector3(-b.N[0],-b.N[1],-b.N[2])); m.setPosition(p[0],p[1],p[2]); g.matrix.copy(m);
  if(hdg) obj.rotation.y=-hdg*Math.PI/180; g.add(obj); world.add(g); return g; }
function coastLat(lon){ for(let i=0;i<REUNION.length;i++){ const [a1,b1]=REUNION[i],[a2,b2]=REUNION[(i+1)%REUNION.length]; if(a1>-20.95&&a2>-20.95&&((b1<=lon&&lon<=b2)||(b2<=lon&&lon<=b1))) return a1+(a2-a1)*(lon-b1)/((b2-b1)||1e-9); } return null; }
try{ const L=new THREE.MeshLambertMaterial({color:0xd9d6cf}), PIL=new THREE.MeshLambertMaterial({color:0xbab6ad}), ROCK=new THREE.MeshLambertMaterial({color:0x6d6a64}), ROAD=new THREE.MeshLambertMaterial({color:0x3d3f42});
  // NRL : de La Possession au Barachois, 300 m au large de la côte ; viaduc sur piles entre 55,350° et 55,405° E, digues ailleurs
  const lons=[]; for(let lo=55.338;lo<=55.444;lo+=0.0035) lons.push(lo);
  const P=lons.map(lo=>{ const c=coastLat(lo); return c==null?null:[c+0.0028,lo]; }).filter(Boolean);
  for(let i=1;i<P.length;i++){ const [a1,b1]=P[i-1],[a2,b2]=P[i], la=(a1+a2)/2, lo=(b1+b2)/2, dE=(b2-b1)*111320*Math.cos(la*Math.PI/180), dN=(a2-a1)*110570, L2=Math.hypot(dE,dN), hdg=Math.atan2(dE,dN)*180/Math.PI;
    const via=lo>55.350&&lo<55.405, g=new THREE.Group(), h=via?28:7;
    const deck=new THREE.Mesh(new THREE.BoxGeometry(30,2.4,L2+1),L); deck.position.y=h; g.add(deck); const rd=new THREE.Mesh(new THREE.BoxGeometry(24,0.3,L2+1),ROAD); rd.position.y=h+1.3; g.add(rd);
    if(via){ for(const zz of [-L2/2,0]){ const pl=new THREE.Mesh(new THREE.CylinderGeometry(3.2,3.6,h,10),PIL); pl.position.set(0,h/2-1,zz); g.add(pl); } }
    else { const dg=new THREE.Mesh(new THREE.BoxGeometry(46,h,L2+1),ROCK); dg.position.y=h/2-1.2; g.add(dg); }
    put(g,la,lo,0,hdg); }
  // Saint-Denis : immeubles du centre (Barachois, rue de Paris, Champ-Fleuri) et front de mer
  const R=H('saint-denis'), N=380, geo=new THREE.BoxGeometry(1,1,1), FA=new THREE.MeshLambertMaterial({color:0xe8e2d6}), IM=new THREE.InstancedMesh(geo,FA,N), mx=new THREE.Matrix4(), c0=[-20.882,55.452]; let n=0;
  for(let i=0;i<N*3&&n<N;i++){ const la=c0[0]-R()*0.022, lo=c0[1]+(R()-0.5)*0.05; if(!inPoly(la,lo,REUNION)) continue; const e=elevAt(la,lo), dE=(lo-c0[1])*111320*Math.cos(la*Math.PI/180), dN=(la-c0[0])*110570;
    if(e>260) continue; const hh=8+R()*(Math.abs(dE)<900&&dN>-1200?36:16), w=14+R()*22, d=12+R()*20; mx.compose(new THREE.Vector3(dE,e+hh/2,-dN),new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),(R()-0.5)*0.4),new THREE.Vector3(w,hh,d)); IM.setMatrixAt(n++,mx); }
  IM.count=n; IM.instanceMatrix.needsUpdate=true; put(IM,c0[0],c0[1],0,0);
  const bar=new THREE.Group(); const grass=new THREE.Mesh(new THREE.BoxGeometry(520,1,70),new THREE.MeshLambertMaterial({color:0x5f8a3e})); grass.position.y=2; bar.add(grass);   // Barachois : promenade et pelouse du front de mer
  for(let i=0;i<14;i++){ const tr=new THREE.Mesh(new THREE.CylinderGeometry(0.4,0.5,12,6),new THREE.MeshLambertMaterial({color:0x6b5a44})); tr.position.set(-240+i*37,8,-20); bar.add(tr);
    const pa=new THREE.Mesh(new THREE.SphereGeometry(4,8,6),new THREE.MeshLambertMaterial({color:0x2f6b2a})); pa.position.set(-240+i*37,14,-20); bar.add(pa); }
  put(bar,-20.8755,55.4485,0,95);
}catch(e){ console.warn('côte nord',e); }
window.PAYSAGE.coteNord={statut:'[APPROX.]',NRL:'viaduc et digues dessinés au large de la côte',stDenis:'immeubles génériques'};
})();
