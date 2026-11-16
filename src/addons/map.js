/* ===== CARTE DE NAVIGATION (tous les appareils) =====
   Bouton « 🗺 Carte » : carte mobile (déplaçable) qui montre en continu la position de l'aéronef, son cap, la trace
   parcourue, la route du plan de vol (points), les aéroports et leurs pistes, la destination (distance, cap, heure estimée),
   l'échelle et les coordonnées. Fond : planisphère du simulateur (Natural Earth) ; à fort zoom, pistes et aires en vectoriel.
   Modes : « Suivre » (centrée sur l'appareil) ou « Route » (départ → destination en entier). Zoom de 10 m à 40 km par pixel. */
(function(){
const css=document.createElement('style'); css.textContent=`
#b-map.on{background:#0b5cad;border-color:#58a6ff;color:#fff}
#mapw{position:fixed;right:10px;top:76px;z-index:46;width:min(360px,46vw);background:#06101a;border:2px solid #2f6db3;border-radius:12px;box-shadow:0 8px 30px #000a;overflow:hidden;touch-action:none}
#mapw[hidden]{display:none}#mapw.big{width:min(640px,92vw)}
#mapw .mh{display:flex;align-items:center;gap:4px;padding:4px 6px;background:#0b1e33;cursor:move;font:700 12px 'Barlow Condensed',sans-serif;letter-spacing:.08em;color:#cfe3ff;text-transform:uppercase}
#mapw .mh span{flex:1}#mapw .mh button{background:#132a44;color:#fff;border:1px solid #2f6db3;border-radius:6px;min-width:26px;height:24px;padding:0 6px;font:700 12px 'Barlow Condensed',sans-serif;cursor:pointer}
#mapw .mh button.on{background:#2f6db3}
#mapw canvas{display:block;width:100%;aspect-ratio:1/1;background:#0c2238}
#mapw .mf{display:flex;justify-content:space-between;gap:6px;padding:3px 8px;font:600 11px 'JetBrains Mono',monospace;color:#9fb8d0;background:#071523}`;
document.head.appendChild(css);
const $$=id=>document.getElementById(id), D2=Math.PI/180;
const ZK=[0.01,0.02,0.05,0.1,0.25,0.5,1,2,5,10,20,40];   // km par pixel
const ST={on:false,big:false,z:5,mode:'follow',track:[],lastT:0,ox:0,oy:0};
try{ Object.assign(ST,JSON.parse(localStorage.getItem('sim-map')||'{}'),{track:[]}); }catch(e){}
const save=()=>{ try{ localStorage.setItem('sim-map',JSON.stringify({on:ST.on,big:ST.big,z:ST.z,mode:ST.mode,x:ST.x,y:ST.y})); }catch(e){} };
let W=null, cv=null, g=null;
function build(){ if(W) return; W=document.createElement('div'); W.id='mapw'; W.hidden=true;
  W.innerHTML=`<div class="mh"><span>🗺 Carte · position en vol</span><button type="button" data-m="follow">Suivre</button><button type="button" data-m="route">Route</button><button type="button" data-z="-1" title="Zoom arrière">−</button><button type="button" data-z="1" title="Zoom avant">+</button><button type="button" data-b title="Agrandir / réduire">⤢</button><button type="button" data-x title="Fermer">×</button></div><canvas></canvas><div class="mf"><span id="mapc"></span><span id="mapd"></span></div>`;
  document.body.appendChild(W); cv=W.querySelector('canvas'); g=cv.getContext('2d');
  W.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{ ST.mode=b.dataset.m; save(); draw(); });
  W.querySelectorAll('[data-z]').forEach(b=>b.onclick=()=>{ ST.mode='follow'; ST.z=Math.max(0,Math.min(ZK.length-1,ST.z-(+b.dataset.z))); save(); draw(); });
  W.querySelector('[data-b]').onclick=()=>{ ST.big=!ST.big; W.classList.toggle('big',ST.big); save(); draw(); };
  W.querySelector('[data-x]').onclick=()=>toggle(false);
  cv.addEventListener('wheel',e=>{ e.preventDefault(); ST.mode='follow'; ST.z=Math.max(0,Math.min(ZK.length-1,ST.z+(e.deltaY>0?1:-1))); save(); draw(); },{passive:false});
  // déplacement par l'en-tête
  const h=W.querySelector('.mh'); let dr=null;
  h.addEventListener('pointerdown',e=>{ if(e.target.closest('button')) return; const r=W.getBoundingClientRect(); dr={dx:e.clientX-r.left,dy:e.clientY-r.top}; h.setPointerCapture(e.pointerId); });
  h.addEventListener('pointermove',e=>{ if(!dr) return; const x=Math.max(0,Math.min(innerWidth-60,e.clientX-dr.dx)), y=Math.max(0,Math.min(innerHeight-40,e.clientY-dr.dy)); W.style.left=x+'px'; W.style.top=y+'px'; W.style.right='auto'; ST.x=x; ST.y=y; });
  h.addEventListener('pointerup',()=>{ if(dr){ dr=null; save(); } });
  if(ST.x!=null){ W.style.left=Math.min(ST.x,innerWidth-80)+'px'; W.style.top=Math.min(ST.y,innerHeight-60)+'px'; W.style.right='auto'; }
  W.classList.toggle('big',!!ST.big); }
function toggle(v){ build(); ST.on=v===undefined?!ST.on:!!v; W.hidden=!ST.on; const b=$$('b-map'); if(b) b.classList.toggle('on',ST.on); save(); if(ST.on) draw(); }
// trace parcourue
setInterval(()=>{ try{ if(!MI||(typeof paused!=='undefined'&&paused)) return; const t=ST.track, p=[S.lat,S.lon]; const l=t[t.length-1]; if(!l||gcKm(l[0],l[1],p[0],p[1])>0.02){ t.push(p); if(t.length>4000) t.splice(0,t.length-4000); } }catch(e){} },1000);
function dest(){ try{ return MI&&MI.dest&&APTS[MI.dest]?MI.dest:null; }catch(e){ return null; } }
function routePts(){ try{ if(window.FPLN&&FPLN.pts&&FPLN.pts.length>1) return FPLN.pts; }catch(e){} const d=dest(); if(!d) return null; const s=MI.start?MI.start():null; return s?[[s.lat,s.lon,''],[APTS[d].lat,APTS[d].lon,d]]:null; }
function draw(){ if(!ST.on||!W||W.hidden) return; const r=cv.getBoundingClientRect(), dpr=Math.min(2,devicePixelRatio||1), Wd=Math.round(r.width*dpr), Hd=Math.round(r.height*dpr); if(!Wd) return;
  if(cv.width!==Wd||cv.height!==Hd){ cv.width=Wd; cv.height=Hd; } g.setTransform(dpr,0,0,dpr,0,0); const w=r.width, h=r.height;
  W.querySelectorAll('[data-m]').forEach(b=>b.classList.toggle('on',b.dataset.m===ST.mode));
  // centre et échelle
  let lat0=S.lat, lon0=S.lon, kpp=ZK[ST.z];
  if(ST.mode==='route'){ const R=routePts()||[[S.lat,S.lon]]; const all=R.map(p=>[p[0],p[1]]).concat([[S.lat,S.lon]]); let a=90,b=-90,c=180,d=-180; all.forEach(([la,lo])=>{ a=Math.min(a,la); b=Math.max(b,la); c=Math.min(c,lo); d=Math.max(d,lo); });
    lat0=(a+b)/2; lon0=(c+d)/2; const kx=(d-c)*111.32*Math.cos(lat0*D2), ky=(b-a)*110.57; kpp=Math.max(0.01,Math.max(kx/(w*0.82),ky/(h*0.82))); }
  const cl=Math.cos(lat0*D2), P=(la,lo)=>{ let dl=lo-lon0; if(dl>180) dl-=360; if(dl<-180) dl+=360; return [w/2+dl*111.32*cl/kpp, h/2-(la-lat0)*110.57/kpp]; };
  // fond : planisphère
  g.fillStyle='#0c2238'; g.fillRect(0,0,w,h);
  const im=(typeof texDay!=='undefined'&&texDay.image)||null;
  if(im&&im.width){ const IW=im.width, IH=im.height, dLon=w*kpp/(111.32*cl), dLat=h*kpp/110.57;
    const sx=(lon0-dLon/2+180)/360*IW, sy=(90-(lat0+dLat/2))/180*IH, sw=dLon/360*IW, sh=dLat/180*IH;
    try{ g.imageSmoothingEnabled=true; g.drawImage(im,sx,sy,sw,sh,0,0,w,h); if(sx<0) g.drawImage(im,sx+IW,sy,sw,sh,0,0,w,h); if(sx+sw>IW) g.drawImage(im,sx-IW,sy,sw,sh,0,0,w,h); }catch(e){}
    g.fillStyle='rgba(4,14,26,0.28)'; g.fillRect(0,0,w,h); }
  // graticule
  const span=w*kpp/111.32/cl, step=[0.001,0.002,0.005,0.01,0.02,0.05,0.1,0.25,0.5,1,2,5,10,20,30].find(v=>v>=span/5)||30, dec=step>=1?0:step>=0.1?1:step>=0.01?2:3;
  g.strokeStyle='rgba(160,200,240,0.18)'; g.lineWidth=1; g.font='9px JetBrains Mono, monospace'; g.fillStyle='rgba(190,215,240,0.6)';
  for(let la=Math.ceil((lat0-h*kpp/110.57)/step)*step; la<=lat0+h*kpp/110.57; la+=step){ const y=P(la,lon0)[1]; g.beginPath(); g.moveTo(0,y); g.lineTo(w,y); g.stroke(); g.fillText((Math.abs(la)).toFixed(dec)+(la>=0?'N':'S'),2,y-2); }
  for(let lo=Math.ceil((lon0-span)/step)*step; lo<=lon0+span; lo+=step){ const x=P(lat0,lo)[0]; g.beginPath(); g.moveTo(x,0); g.lineTo(x,h); g.stroke(); g.fillText((Math.abs(lo)).toFixed(dec)+(lo>=0?'E':'W'),x+2,h-3); }
  // aéroports et pistes
  const dk=dest();
  for(const k in APTS){ const a=APTS[k], p=P(a.lat,a.lon); if(p[0]<-40||p[0]>w+40||p[1]<-40||p[1]>h+40) continue;
    if(kpp<0.6&&a.rw) a.rw.forEach(rw=>{ const A1=P(rw[2],rw[3]), A2=P(rw[4],rw[5]); g.strokeStyle='#d9dee3'; g.lineWidth=Math.max(2,(rw[6]||150)*0.3048/1000/kpp); g.beginPath(); g.moveTo(A1[0],A1[1]); g.lineTo(A2[0],A2[1]); g.stroke(); if(kpp<0.12){ g.fillStyle='#fff'; g.font='9px JetBrains Mono, monospace'; g.fillText(rw[0],A1[0]+3,A1[1]-3); g.fillText(rw[1],A2[0]+3,A2[1]-3); } });
    g.fillStyle=k===dk?'#ff4fd8':a.heli?'#ffd166':'#3fd0ff'; g.beginPath(); g.arc(p[0],p[1],k===dk?5:3.5,0,Math.PI*2); g.fill();
    g.font='bold 10px Barlow Condensed, sans-serif'; g.fillText(k,p[0]+6,p[1]+4); }
  // route
  const R=routePts(); if(R){ g.strokeStyle='#e04ad8'; g.lineWidth=2; g.setLineDash([6,4]); g.beginPath(); R.forEach((q,i)=>{ const p=P(q[0],q[1]); i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]); }); g.stroke(); g.setLineDash([]);
    g.fillStyle='#f4b4ee'; g.font='9px JetBrains Mono, monospace'; R.forEach(q=>{ if(!q[2]) return; const p=P(q[0],q[1]); g.fillRect(p[0]-2,p[1]-2,4,4); if(!APTS[q[2]]) g.fillText(q[2],p[0]+4,p[1]-4); }); }
  // trace
  if(ST.track.length>1){ g.strokeStyle='#3ddc84'; g.lineWidth=2; g.beginPath(); ST.track.forEach((q,i)=>{ const p=P(q[0],q[1]); i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]); }); const n=P(S.lat,S.lon); g.lineTo(n[0],n[1]); g.stroke(); }
  // appareil
  const me=P(S.lat,S.lon), cr=typeof crashed!=='undefined'&&crashed; g.save(); g.translate(me[0],me[1]);
  if(cr){ g.fillStyle='#ff3b30'; g.font='bold 16px sans-serif'; g.fillText('✖',-6,6); g.restore(); }
  else { g.rotate(S.psi); g.fillStyle='#ffe14a'; g.strokeStyle='#1a1a1a'; g.lineWidth=1.2; g.beginPath();
    if(A.kind==='fw'){ g.moveTo(0,-10); g.lineTo(2,-3); g.lineTo(9,2); g.lineTo(9,4); g.lineTo(2,2); g.lineTo(1.5,7); g.lineTo(4,9); g.lineTo(4,10); g.lineTo(0,9); g.lineTo(-4,10); g.lineTo(-4,9); g.lineTo(-1.5,7); g.lineTo(-2,2); g.lineTo(-9,4); g.lineTo(-9,2); g.lineTo(-2,-3); }
    else { g.arc(0,0,4,0,Math.PI*2); g.moveTo(0,4); g.lineTo(0,11); }
    g.closePath(); g.fill(); g.stroke(); g.strokeStyle='rgba(255,225,74,0.5)'; g.beginPath(); g.moveTo(0,-10); g.lineTo(0,-40); g.stroke(); g.restore(); }
  // échelle
  const km=[0.1,0.2,0.5,1,2,5,10,20,50,100,200,500,1000,2000].find(v=>v/kpp>60)||1000, px=km/kpp; g.fillStyle='rgba(0,0,0,0.5)'; g.fillRect(w-px-16,6,px+10,18); g.strokeStyle='#fff'; g.lineWidth=2; g.beginPath(); g.moveTo(w-px-11,18); g.lineTo(w-11,18); g.stroke();
  g.fillStyle='#fff'; g.font='10px JetBrains Mono, monospace'; g.fillText(km>=1?km+' km':km*1000+' m',w-px-10,15);
  // pied : coordonnées, destination
  const f=v=>Math.abs(v).toFixed(4); $$('mapc').textContent=`${f(S.lat)}${S.lat>=0?'N':'S'} ${f(S.lon)}${S.lon>=0?'E':'W'} · ${Math.round(S.alt/0.3048)} ft`;
  if(dk){ const a=APTS[dk], d=gcKm(S.lat,S.lon,a.lat,a.lon), b=typeof brg==='function'?brg(S.lat,S.lon,a.lat,a.lon):0, gs=Math.hypot(S.ve||0,S.vn||0)*1.944, eta=gs>40?d/1.852/gs:null;
    $$('mapd').textContent=`${dk} ${d<10?d.toFixed(1):Math.round(d)} km · ${String(Math.round((b+360)%360)).padStart(3,'0')}°${eta?' · '+Math.floor(eta)+' h '+String(Math.round(eta%1*60)).padStart(2,'0'):''}`; }
  else $$('mapd').textContent=''; }
setInterval(()=>{ try{ draw(); }catch(e){} },300);
// la trace repart à chaque mission
const _sm=startMission; startMission=function(){ ST.track=[]; const r=_sm.apply(this,arguments); if(ST.on){ build(); W.hidden=false; } return r; };
function barBtn(){ const m=$$('b-menu'); if(!m||$$('b-map')) return; const b=document.createElement('button'); b.type='button'; b.id='b-map'; b.textContent='🗺 Carte'; b.title='Carte : position de l\'aéronef, route, trace, aéroports'; b.onclick=()=>toggle(); m.parentNode.insertBefore(b,m.nextSibling); if(ST.on){ build(); W.hidden=false; b.classList.add('on'); } }
barBtn(); setTimeout(barBtn,1600);
addEventListener('keydown',e=>{ if((e.key==='m'||e.key==='M')&&!/INPUT|TEXTAREA|SELECT/.test((e.target&&e.target.tagName)||'')) toggle(); });
window.MAP={toggle,draw,ST};
})();
