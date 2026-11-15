/* ===== ÉCRANS AGRANDIS =====
   Toucher / cliquer un écran du tableau de bord (PFD, ND, E/WD, SD…) l'ouvre en grand, en direct, avec une légende de lecture.
   Pendant l'agrandissement, le tableau est dessiné en plus haute définition pour rester net. */
(function(){
const INFO={
 pfd:['PFD — écran de pilotage (commandant)','Au centre l\'horizon (assiette, inclinaison) ; à gauche la vitesse (kt) ; à droite l\'altitude (ft) et la vitesse verticale ; en bas le cap ; en haut les modes du pilote automatique (FMA).'],
 nd:['ND — écran de navigation (commandant)','La route du FMS (trait vert), les points, la distance au prochain point, le vent (flèche), le trafic et la météo radar.'],
 ewd:['E/WD — moteurs et alarmes','N1 (poussée), EGT (température), N2, débit carburant, position des volets ; en bas les messages ECAM et les mémos.'],
 sd:['SD — écran systèmes','La page système demandée : électricité, carburant, hydraulique, portes, roues… ; en bas température, heure et masse.'],
 nd2:['ND — écran de navigation (copilote)','Même lecture que le ND du commandant, avec ses propres réglages.'],
 pfd2:['PFD — écran de pilotage (copilote)','Même lecture que le PFD du commandant : horizon, vitesse, altitude, cap, modes.'],
 all:['Tableau de bord','Instruments de vol et moteurs de l\'appareil.']};
function rects(){ const cv=$('ckc'); if(!cv||view!=='ck') return []; const r=cv.getBoundingClientRect(); if(r.height<20) return []; const W=r.width,H=r.height, out=[];
  if(ACK==='a320'||ACK==='lj60'){ const s=Math.min(H*0.66,W/5.7), gap=(W-5*s)/6, y0=H*0.08, X=i=>gap+i*(s+gap);
    out.push(['pfd',X(0),y0,s,s],['nd',X(1),y0,s,s],['nd2',X(3),y0,s,s],['pfd2',X(4),y0,s,s]);
    if(ACK==='a320'){ const sc=Math.min(s,(H-y0-10)/2); out.push(['ewd',X(2)+(s-sc)/2,y0,sc,sc],['sd',X(2)+(s-sc)/2,y0+sc+4,sc,sc]); } else out.push(['ewd',X(2),y0,s,s]); }
  else out.push(['all',W*0.08,6,W*0.84,H-12]);
  return out.map(([k,x,y,w,h])=>({k,x,y,w,h,r})); }
const Z={k:null,t:null};
const css=document.createElement('style'); css.textContent=`
#zoomscr{position:fixed;inset:0;z-index:58;background:#000000f0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:10px;gap:8px}
#zoomscr[hidden]{display:none}
#zoomscr .zh{width:min(96vw,620px);display:flex;align-items:center;gap:8px;color:#fff;font:700 18px 'Barlow Condensed',sans-serif;letter-spacing:.05em;text-transform:uppercase}
#zoomscr .zh span{flex:1}#zoomscr button{background:#132232;color:#fff;border:1px solid #2b3d50;border-radius:9px;padding:7px 12px;font:600 14px 'Barlow Condensed',sans-serif;cursor:pointer}
#zoomscr canvas{width:min(96vw,620px,70vh);height:auto;border:2px solid #46c8d8;border-radius:10px;background:#000;image-rendering:auto}
#zoomscr .zl{width:min(96vw,620px);color:#cfd8df;font:14px/1.45 'Inter',system-ui,sans-serif;background:#0b131bee;border:1px solid #2b3d50;border-radius:10px;padding:8px 10px}
#zoomscr .zn{display:flex;gap:6px;flex-wrap:wrap;justify-content:center}`;
document.head.appendChild(css);
const ov=document.createElement('div'); ov.id='zoomscr'; ov.hidden=true; ov.innerHTML=`<div class="zh"><span></span><button type="button" data-x aria-label="Fermer">✕ Fermer</button></div><canvas></canvas><div class="zl"></div><div class="zn"></div>`; document.body.appendChild(ov);
const zc=ov.querySelector('canvas'), zg=zc.getContext('2d');
function draw(){ const cv=$('ckc'); const R=rects().find(o=>o.k===Z.k); if(!cv||!R){ close(); return; }
  const sx=cv.width/R.r.width, sy=cv.height/R.r.height, w=Math.round(R.w*sx), h=Math.round(R.h*sy), D=Math.min(1240,Math.max(w,h,600));
  const ar=R.w/R.h; zc.width=ar>=1?D:Math.round(D*ar); zc.height=ar>=1?Math.round(D/ar):D; zg.imageSmoothingEnabled=true; zg.imageSmoothingQuality='high';
  zg.drawImage(cv,Math.round(R.x*sx),Math.round(R.y*sy),w,h,0,0,zc.width,zc.height); }
function open(k){ Z.k=k; const i=INFO[k]||INFO.all; ov.querySelector('.zh span').textContent='🔍 '+i[0]; ov.querySelector('.zl').textContent=i[1];
  ov.querySelector('.zn').innerHTML=rects().map(o=>`<button type="button" data-k="${o.k}"${o.k===k?' style="border-color:#46c8d8"':''}>${(INFO[o.k]||INFO.all)[0].split(' — ')[0]}${/2$/.test(o.k)?' F/O':''}</button>`).join('');
  ov.hidden=false; clearInterval(Z.t); draw(); Z.t=setInterval(draw,150); }
function close(){ ov.hidden=true; Z.k=null; clearInterval(Z.t); }
ov.addEventListener('click',e=>{ const b=e.target.closest('button'); if(b&&b.dataset.k){ open(b.dataset.k); return; } if(b&&b.dataset.x!=null){ close(); return; } if(e.target===ov) close(); });
// haute définition pendant l'agrandissement
ckSize=function(){ const r=CK.cv.getBoundingClientRect(), d=Z.k?Math.min(4,(devicePixelRatio||1)*2.2):Math.min(2,devicePixelRatio||1); if(!r.width) return false;
  const W=Math.round(r.width*d), H=Math.round(r.height*d); if(CK.cv.width!==W||CK.cv.height!==H){ CK.cv.width=W; CK.cv.height=H; }
  CK.g=CK.cv.getContext('2d'); CK.g.setTransform(d,0,0,d,0,0); CK.w=r.width; CK.h=r.height; return true; };
// toucher court sur un écran = agrandir (un glissé ou un appui long ne déclenche rien)
let down=null; const cv=$('ckc');
cv.addEventListener('pointerdown',e=>{ down={x:e.clientX,y:e.clientY,t:performance.now()}; });
cv.addEventListener('pointerup',e=>{ if(!down) return; const d=down; down=null; if(Math.hypot(e.clientX-d.x,e.clientY-d.y)>12||performance.now()-d.t>700) return;
  const hit=rects().find(o=>e.clientX>=o.r.left+o.x&&e.clientX<=o.r.left+o.x+o.w&&e.clientY>=o.r.top+o.y&&e.clientY<=o.r.top+o.y+o.h); if(hit) open(hit.k); });
cv.style.cursor='zoom-in';
addEventListener('keydown',e=>{ if(e.key==='Escape'&&!ov.hidden) close(); });
window.ZOOMSCR={open,close};
})();
