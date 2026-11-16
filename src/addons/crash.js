/* ===== CRASH : EXPLOSION ET DISLOCATION SCHÉMATISÉES =====
   À l'impact, l'appareil ne reste plus « posé » intact : il se disloque et la scène montre ce qui se passe réellement,
   de façon schématique (aucune image réelle) et selon le lieu :
   · SOL : boule de feu (vaporisation du kérosène), éclats projetés dans le sens du mouvement, gros tronçons (fuselage,
     voilure, empennage, moteurs), trace calcinée, feux résiduels et colonne de fumée noire qui dérive avec le vent.
   · MER / EAU : gerbe et anneau d'éclaboussures, pas de boule de feu sauf impact à très haute énergie (flash bref + vapeur),
     débris qui flottent puis coulent, nappe de carburant.
   · MONTAGNE (terrain > 400 m ou indicateur de scénario) : comme au sol, plus nuage de poussière et de roche ; débris sur la pente.
   · EN VOL (impact au-dessus de 40 m du sol, ex. collision) : boule de feu en altitude, débris qui tombent en traînant de la fumée.
   L'ampleur suit l'énergie : ½·m·V² et masse de carburant. Représentation pédagogique [SCHÉMATIQUE], pas un calcul de structure. */
(function(){
if(typeof THREE==='undefined'||typeof scene==='undefined') return;
const T=THREE;
function tex(stops){ const c=document.createElement('canvas'); c.width=c.height=64; const g=c.getContext('2d'), gr=g.createRadialGradient(32,32,0,32,32,32); stops.forEach(([o,col])=>gr.addColorStop(o,col)); g.fillStyle=gr; g.fillRect(0,0,64,64); const t=new T.CanvasTexture(c); return t; }
const TX={ fire:tex([[0,'rgba(255,252,225,1)'],[0.22,'rgba(255,200,70,0.95)'],[0.55,'rgba(235,90,20,0.65)'],[1,'rgba(110,20,0,0)']]),
  smoke:tex([[0,'rgba(45,45,48,0.9)'],[0.55,'rgba(35,35,38,0.55)'],[1,'rgba(30,30,30,0)']]),
  steam:tex([[0,'rgba(235,240,245,0.85)'],[0.6,'rgba(220,228,235,0.45)'],[1,'rgba(220,228,235,0)']]),
  spray:tex([[0,'rgba(255,255,255,0.95)'],[0.5,'rgba(230,240,248,0.6)'],[1,'rgba(230,240,248,0)']]),
  dust:tex([[0,'rgba(140,118,90,0.85)'],[0.6,'rgba(120,100,78,0.45)'],[1,'rgba(110,95,75,0)']]) };
let FX=null;
const rnd=(a,b)=>a+Math.random()*(b-a);
function sprite(t,size,add,op){ const m=new T.SpriteMaterial({map:TX[t],transparent:true,depthWrite:false,opacity:op==null?1:op,blending:add?T.AdditiveBlending:T.NormalBlending}); const s=new T.Sprite(m); s.scale.set(size,size,1); return s; }
const MW=new T.MeshLambertMaterial({color:0xe9ecef}), MG=new T.MeshLambertMaterial({color:0x8a9298}), MD=new T.MeshLambertMaterial({color:0x22262a}), MB=new T.MeshLambertMaterial({color:0x1d1f22}), MC=new T.MeshLambertMaterial({color:0x2b2622});
function part(geo,m){ const o=new T.Mesh(geo,m); return o; }
/* --- pièces de l'appareil (proportionnelles aux dimensions réelles) --- */
function pieces(){ const L=(A.ext&&A.ext.len)||12, Sp=(A.ext&&A.ext.span)||L, fw=A.kind==='fw', R=fw?L*0.053:L*0.09, out=[];
  if(fw){ out.push(part(new T.CylinderGeometry(R,R*0.9,L*0.42,14),MW)); out.push(part(new T.CylinderGeometry(R*0.95,R*0.5,L*0.36,14),MW));
    out.push(part(new T.BoxGeometry(Sp*0.42,R*0.25,L*0.16),MG)); out.push(part(new T.BoxGeometry(Sp*0.36,R*0.22,L*0.13),MG));
    out.push(part(new T.BoxGeometry(R*0.2,R*2.6,L*0.12),MG)); const eng=AL()||ACK==='lj60'?2:0; for(let i=0;i<eng;i++) out.push(part(new T.CylinderGeometry(R*0.5,R*0.45,L*0.12,12),MW)); }
  else { out.push(part(new T.SphereGeometry(R*1.1,12,8),MW)); out.push(part(new T.CylinderGeometry(R*0.25,R*0.12,L*0.5,8),MW)); for(let i=0;i<3;i++) out.push(part(new T.BoxGeometry(L*0.3,0.05,0.3),MD)); }
  return out; }
/* --- son d'explosion (bruit filtré décroissant) --- */
function boom(big,water){ try{ const C=FX.ac||(FX.ac=new (window.AudioContext||window.webkitAudioContext)()); const n=C.sampleRate*(big?3.5:2), b=C.createBuffer(1,n,C.sampleRate), d=b.getChannelData(0);
  for(let i=0;i<n;i++){ const t=i/n; d[i]=(Math.random()*2-1)*Math.pow(1-t,water?1.6:2.4); }
  const s=C.createBufferSource(); s.buffer=b; const f=C.createBiquadFilter(); f.type='lowpass'; f.frequency.value=water?900:big?420:650; const g=C.createGain(); g.gain.value=big?0.9:0.6; s.connect(f); f.connect(g); g.connect(C.destination); s.start(); }catch(e){} }
function clear(){ if(!FX) return; scene.remove(FX.g); FX.g.traverse(o=>{ if(o.geometry) o.geometry.dispose(); if(o.material&&o.material.dispose&&!o.material.map) o.material.dispose(); }); cancelAnimationFrame(FX.raf); FX=null; }
window.CRASHFX={clear,get on(){ return !!FX; }};
function kindOf(c){ const elev=elevAt(S.lat,S.lon), agl=S.alt-elev; let k='sol';
  if(window.CRASH_KIND) k=window.CRASH_KIND; else if(agl>40&&!c.ditch) k='vol'; else if(c.ditch||(typeof waterAt==='function'&&waterAt(S.lat,S.lon))) k='mer'; else if(elev>400) k='montagne';
  return {k,agl:Math.max(0,agl)}; }
function start(c){ clear(); const {k,agl}=kindOf(c), m=S.mass||(LS&&LS.tow)||A.m, V=S.V||0, E=0.5*m*V*V/1e6, fuel=((S.fuel!=null?S.fuel:(LS&&LS.block))||m*0.15)/1000;
  const energ=Math.min(1,Math.max(0.15,E/400)), big=E>8||V>45, R=Math.min(80,(A.kind==='fw'?10:5)+Math.sqrt(fuel+0.2)*7*energ+V*0.08);
  const g=new T.Group(); scene.add(g); FX={g,t0:performance.now(),last:performance.now(),k,agl,R,big,E,fuel,parts:[],sp:[],fires:[],emitT:0,ac:null,raf:0};
  c.kindTxt=({sol:'impact au sol',mer:'impact en mer / sur l\'eau',montagne:'impact en relief (montagne)',vol:'explosion en vol'})[k]+` · énergie ≈ ${Math.round(E)} MJ · carburant ≈ ${fuel.toFixed(1)} t`;
  const gy=-agl, vel=new T.Vector3(S.ve||0,S.vu||0,-(S.vn||0)), fwd=vel.clone().setY(0); if(fwd.length()<1) fwd.set(Math.sin(S.psi),0,-Math.cos(S.psi)); fwd.normalize();
  FX.gy=gy;
  // gros tronçons + éclats
  const big3=pieces(); big3.forEach((p,i)=>{ p.position.set(rnd(-2,2),gy+(k==='vol'?agl:1.5),rnd(-2,2)); g.add(p);
    const sp=k==='vol'?12:(k==='mer'?0.25:0.45); const v=fwd.clone().multiplyScalar(Math.min(V,90)*rnd(0.15,sp)).add(new T.Vector3(rnd(-6,6),rnd(3,12)*(k==='mer'?0.4:1),rnd(-6,6)));
    FX.parts.push({o:p,v,w:new T.Vector3(rnd(-2,2),rnd(-2,2),rnd(-2,2)),big:true,rest:false,float:k==='mer'?rnd(8,40):0}); });
  const nS=k==='mer'?40:90; for(let i=0;i<nS;i++){ const s=rnd(0.15,0.9)*(A.kind==='fw'?1:0.5), p=part(new T.BoxGeometry(s,s*rnd(0.2,0.8),s*rnd(0.3,1.2)),[MW,MG,MD,MB][i%4]);
    p.position.set(rnd(-2,2),gy+(k==='vol'?agl:1),rnd(-2,2)); g.add(p);
    const v=fwd.clone().multiplyScalar(Math.min(V,90)*rnd(0.1,0.7)).add(new T.Vector3(rnd(-1,1),0,rnd(-1,1)).normalize().multiplyScalar(rnd(5,25)*energ+3)).add(new T.Vector3(0,rnd(4,22)*energ+2,0));
    FX.parts.push({o:p,v,w:new T.Vector3(rnd(-8,8),rnd(-8,8),rnd(-8,8)),rest:false,float:k==='mer'?rnd(2,20):0,trail:k==='vol'&&i%6===0}); }
  // boule de feu / gerbe
  if(k!=='mer'||E>60){ const n=k==='mer'?6:18; for(let i=0;i<n;i++){ const s=sprite('fire',1,true); s.position.set(rnd(-R*0.3,R*0.3),gy+(k==='vol'?agl:R*0.25)+rnd(0,R*0.3),rnd(-R*0.3,R*0.3)); g.add(s); FX.sp.push({s,kind:'fire',t0:rnd(0,0.25),life:k==='mer'?0.6:rnd(1.6,3.2),size:R*rnd(0.6,1.3),vy:rnd(2,6)}); } }
  if(k==='mer'){ for(let i=0;i<70;i++){ const s=sprite('spray',1,false,0.9); s.position.set(rnd(-3,3),gy+0.5,rnd(-3,3)); g.add(s); const a=rnd(0,Math.PI*2), sp=rnd(4,16)*energ+3;
      FX.sp.push({s,kind:'spray',t0:rnd(0,0.3),life:rnd(2,4),size:rnd(3,8)*(A.kind==='fw'?1:0.6),v:new T.Vector3(Math.cos(a)*sp*0.5,rnd(10,28)*energ+6,Math.sin(a)*sp*0.5).add(fwd.clone().multiplyScalar(Math.min(V,80)*0.2))}); }
    const ring=new T.Mesh(new T.RingGeometry(0.8,1.6,48),new T.MeshBasicMaterial({color:0xf2f6fa,transparent:true,opacity:0.45,side:T.DoubleSide,depthWrite:false})); ring.rotation.x=-Math.PI/2; ring.position.y=gy+0.08; g.add(ring); FX.ring=ring;
    const slick=new T.Mesh(new T.CircleGeometry(1,40),new T.MeshBasicMaterial({color:0x1a1e22,transparent:true,opacity:0.0,depthWrite:false})); slick.rotation.x=-Math.PI/2; slick.position.y=gy+0.05; g.add(slick); FX.slick=slick; }
  else { const sc=new T.Mesh(new T.CircleGeometry(R*0.7,40),new T.MeshBasicMaterial({color:0x14110e,transparent:true,opacity:0,depthWrite:false})); sc.rotation.x=-Math.PI/2; sc.position.set(fwd.x*R*0.4,gy+0.06,fwd.z*R*0.4); g.add(sc); FX.scorch=sc; }
  if(k==='montagne') for(let i=0;i<30;i++){ const s=sprite('dust',1,false,0.8); s.position.set(rnd(-R,R),gy+rnd(0,R*0.4),rnd(-R,R)); g.add(s); FX.sp.push({s,kind:'dust',t0:rnd(0,0.6),life:rnd(6,14),size:R*rnd(0.5,1.2),vy:rnd(0.5,2)}); }
  boom(big,k==='mer');
  // vue extérieure pour voir la scène
  try{ if(view==='ck') setView('ext'); }catch(e){}
  FX.raf=requestAnimationFrame(tick); }
function tick(now){ if(!FX) return; FX.raf=requestAnimationFrame(tick); const dt=Math.min(0.05,(now-FX.last)/1000), t=(now-FX.t0)/1000; FX.last=now; const gy=FX.gy, G=9.81, k=FX.k;
  const wind=(typeof windNow==='function'?windNow():[2,0]);
  FX.parts.forEach(p=>{ if(p.rest) return; p.v.y-=G*dt; p.o.position.addScaledVector(p.v,dt); p.o.rotation.x+=p.w.x*dt; p.o.rotation.y+=p.w.y*dt; p.o.rotation.z+=p.w.z*dt;
    if(p.trail&&Math.random()<dt*8&&FX.sp.length<420){ const s=sprite('smoke',1,false,0.7); s.position.copy(p.o.position); FX.g.add(s); FX.sp.push({s,kind:'trail',t0:t,born:t,life:5,size:2,vy:0.5}); }
    const floor=gy+0.2;
    if(p.o.position.y<=floor){ if(k==='mer'){ p.v.multiplyScalar(0.9); p.v.y=Math.max(p.v.y,-0.4); p.w.multiplyScalar(0.95); if(p.float>0){ p.float-=dt; p.o.position.y=floor+Math.sin(t*1.5+p.o.id)*0.08; p.v.y=0; } else if(p.o.position.y<floor-8){ p.rest=true; p.o.visible=false; } }
      else { p.o.position.y=floor; if(Math.abs(p.v.y)>3){ p.v.y=-p.v.y*0.25; p.v.x*=0.6; p.v.z*=0.6; p.w.multiplyScalar(0.6); } else { p.v.set(0,0,0); p.w.set(0,0,0); p.rest=true; if(p.big&&FX.fires.length<8) FX.fires.push(p.o.position.clone()); else if(Math.random()<0.12&&FX.fires.length<14) FX.fires.push(p.o.position.clone()); } } } });
  // feux résiduels et fumée (terre, montagne, après chute en vol)
  if(k!=='mer'){ FX.emitT+=dt; const rate=t<60?0.05:t<180?0.12:0.4; while(FX.emitT>rate&&FX.fires.length){ FX.emitT-=rate; const f=FX.fires[Math.floor(Math.random()*FX.fires.length)];
      if(FX.sp.length<420){ const s=sprite('smoke',1,false,0.85); s.position.set(f.x+rnd(-1,1),f.y+1,f.z+rnd(-1,1)); FX.g.add(s); FX.sp.push({s,kind:'smoke',born:t,t0:t,life:rnd(14,26),size:rnd(4,8)*(A.kind==='fw'?1:0.6),vy:rnd(3,7)}); }
      if(t<240&&Math.random()<0.6&&FX.sp.length<420){ const s=sprite('fire',1,true); s.position.set(f.x+rnd(-1.5,1.5),f.y+0.6,f.z+rnd(-1.5,1.5)); FX.g.add(s); FX.sp.push({s,kind:'flame',born:t,t0:t,life:rnd(0.5,1.1),size:rnd(1.5,4)*(A.kind==='fw'?1:0.6),vy:rnd(1,3)}); } }
    if(FX.emitT>2) FX.emitT=0; }
  else if(t<20&&Math.random()<dt*6&&FX.sp.length<300&&FX.E>60){ const s=sprite('steam',1,false,0.6); s.position.set(rnd(-4,4),gy+1,rnd(-4,4)); FX.g.add(s); FX.sp.push({s,kind:'steam',born:t,t0:t,life:8,size:5,vy:2}); }
  for(let i=FX.sp.length-1;i>=0;i--){ const q=FX.sp[i], b=q.born!=null?q.born:0, a=t-b-(q.born!=null?0:q.t0); if(a<0){ q.s.visible=false; continue; } q.s.visible=true; const f=a/q.life;
    if(f>=1){ FX.g.remove(q.s); q.s.material.dispose(); FX.sp.splice(i,1); continue; }
    if(q.kind==='fire'){ const sz=q.size*(0.3+1.1*Math.sqrt(f)); q.s.scale.set(sz,sz,1); q.s.position.y+=q.vy*dt; q.s.material.opacity=1-f*f; if(f>0.55&&!q.sm&&FX.sp.length<420){ q.sm=1; const s=sprite('smoke',1,false,0.8); s.position.copy(q.s.position); FX.g.add(s); FX.sp.push({s,kind:'smoke',born:t,t0:t,life:rnd(18,30),size:q.size*0.7,vy:rnd(4,8)}); } }
    else if(q.kind==='spray'){ q.v.y-=G*dt; q.s.position.addScaledVector(q.v,dt); if(q.s.position.y<gy) q.s.position.y=gy; const sz=q.size*(0.6+f); q.s.scale.set(sz,sz,1); q.s.material.opacity=0.9*(1-f); }
    else { const sz=q.size*(1+f*(q.kind==='flame'?0.2:3.2)); q.s.scale.set(sz,sz,1); q.s.position.y+=q.vy*dt*(1-f*0.5); q.s.position.x+=wind[0]*dt*f*1.5; q.s.position.z-=wind[1]*dt*f*1.5; q.s.material.opacity=(q.kind==='flame'?1-f:0.85*(1-f))*(q.kind==='trail'?0.8:1); } }
  if(FX.ring){ const s=1+Math.min(t,8)*FX.R*0.12; FX.ring.scale.set(s,s,1); FX.ring.material.opacity=Math.max(0,0.45*(1-t/8)); }
  if(FX.slick){ const s=Math.min(FX.R*1.4,3+t*1.2); FX.slick.scale.set(s,s,1); FX.slick.material.opacity=Math.min(0.4,t/12); }
  if(FX.scorch) FX.scorch.material.opacity=Math.min(0.75,t/1.5);
  // tremblement de caméra bref
  if(t<1.2&&typeof camera!=='undefined'){ const a=(1.2-t)*0.6*(FX.big?1:0.4); camera.position.x+=rnd(-a,a); camera.position.y+=rnd(-a,a); } }
// l'appareil disloqué n'est plus affiché intact
const _pc=placeCamera; placeCamera=function(){ _pc.apply(this,arguments); if(FX&&MODEL) MODEL.visible=false; };
const _cr=crash; crash=function(vs,onRw){ const r=_cr.apply(this,arguments); try{ if(crashed){ start(crashed); addInfo(); } }catch(e){ console.error(e); } return r; };
if(typeof ditch==='function'){ const _dt=ditch; ditch=function(vs){ const r=_dt.apply(this,arguments); try{ if(crashed&&!/contrôlé/.test(crashed.why||'')){ start(crashed); addInfo(); } }catch(e){} return r; }; }
function addInfo(){ const d=document.getElementById('crash'); if(!d||!crashed||!crashed.kindTxt) return; d.style.top='auto'; d.style.bottom='150px'; d.style.transform='translateX(-50%)'; d.style.maxWidth='min(440px,92vw)'; if(FX&&FX.k==='vol'){ const p0=d.querySelector('p'); if(p0) p0.textContent=`Rupture et explosion en vol à ${Math.round(S.alt/0.3048)} ft, ${Math.round((S.V||0)*1.944)} kt. ${crashed.why||''} [SIMULÉ]`; } const p=document.createElement('p'); p.style.cssText='margin:0 0 10px;font-size:13px;color:#ffb0a6';
  p.textContent='💥 '+crashed.kindTxt[0].toUpperCase()+crashed.kindTxt.slice(1)+'. '+({sol:'Le carburant se vaporise et s\'enflamme (boule de feu), la structure se disloque dans le sens du mouvement ; feux résiduels et fumée.',mer:'L\'eau, quasi incompressible à haute vitesse, disloque la structure : gerbe, débris qui flottent puis coulent, nappe de carburant ; pas de boule de feu sauf énergie très élevée.',montagne:'Impact sur le relief : dislocation, incendie, débris et poussière sur la pente.',vol:'Rupture en vol : boule de feu en altitude, débris qui tombent en traînant de la fumée.'})[FX.k]+' [SCHÉMATIQUE]';
  d.insertBefore(p,d.querySelector('button')); }
// nettoyage au redémarrage ou au retour au menu
const _sm=startMission; startMission=function(){ clear(); window.CRASH_KIND=null; return _sm.apply(this,arguments); };
const _om=openMenu; openMenu=function(){ clear(); window.CRASH_KIND=null; return _om.apply(this,arguments); };
})();
