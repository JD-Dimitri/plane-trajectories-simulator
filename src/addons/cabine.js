/* ===== V10.38 (F4) : vue « Cabine » 3D pour les 7 appareils + poste plus détaillé =====
   Cabine passagers construite à partir des dispositions du plan de cabine existant (bouton « 🪑 Sièges », systems3.js : CABLAY),
   donc cohérente avec le manifeste : A320 30 rangs 3-3 ; 777-300ER 18 J · 40 W · 384 Y ; Learjet 60 club 6 ; S-76 12 ; H125 5 ; R44 3 ; C172 3
   (+ sièges des pilotes pour les appareils où la cabine et le poste ne font qu'un). Sièges en instances (fluide sur téléphone).
   Cotes : largeur de cabine A320 3,70 m et 777 5,86 m [RÉFÉRENCÉ constructeurs] ; autres cotes, pas de sièges, couleurs [ESTIMÉ].
   Formes simplifiées et originales, sans marque ni logo. Bouton « Cabine » à côté de « Cockpit » et « Extérieur » ;
   déplacement dans l'allée : touches Page précédente / Page suivante, ou boutons ▲ ▼ (téléphone). */
(function(){
if(typeof scene==='undefined'||typeof THREE==='undefined'||typeof placeCamera!=='function') return;
const G=new THREE.Group(); G.visible=false; scene.add(G); let built=null, mats=[], CAM=null;
const D={ // largeur et hauteur intérieures (m), pas des rangs par classe (m), largeur de siège par classe (m), sièges des pilotes dans la cabine
 a320:{src:'largeur 3,70 m [RÉFÉRENCÉ Airbus, famille A320] ; hauteur et pas des sièges [ESTIMÉ]',w:3.70,h:2.22,lead:2.6,pitch:{Y:0.76},sw:{Y:0.46},bins:true,col:0x2f4b6e},
 a350:{src:'largeur 5,61 m [RÉFÉRENCÉ Airbus] ; hauteur, pas et plan de cabine [ESTIMÉ]',w:5.61,h:2.42,lead:2.8,pitch:{J:1.9,W:0.97,Y:0.79},sw:{J:0.62,W:0.48,Y:0.45},bins:true,col:0x2d3f57},   // largeur de cabine A350 5,61 m [RÉFÉRENCÉ Airbus], le reste [ESTIMÉ]
 b777:{src:'largeur 5,87 m (19 ft 3 in) [RÉFÉRENCÉ Economy Class & Beyond, 2014] ; hauteur et pas [ESTIMÉ]',w:5.87,h:2.45,lead:3.0,pitch:{J:1.55,W:0.97,Y:0.79},sw:{J:0.62,W:0.5,Y:0.45},bins:true,col:0x34465a},
 lj60:{src:'largeur 1,80 m (5 ft 11 in), hauteur 1,75 m (5 ft 9 in), longueur 5,38 m [RÉFÉRENCÉ Magellan Jets]',w:1.80,h:1.75,lead:1.6,pitch:{C:1.25},sw:{C:0.56},col:0xb9a88c},
 s76:{src:'dimensions [ESTIMÉ] (sources publiques contradictoires, non retenues)',w:1.90,h:1.35,lead:1.3,pitch:{P:0.95},sw:{P:0.48},col:0x4b5560},
 h125:{src:'dimensions [ESTIMÉ] (pas de source constructeur consultable)',w:1.60,h:1.30,lead:0,pitch:{P:0.95},sw:{P:0.48},col:0x3f4650,crew:'R',small:true},
 r44:{src:'largeur 1,22 m (4 ft), hauteur 1,20 m (3 ft 11 in) [RÉFÉRENCÉ AeroCorner]',w:1.22,h:1.20,lead:0,pitch:{P:0.95},sw:{P:0.46},col:0x5a4a3a,crew:'R',small:true},
 c172:{src:'largeur 1,02 m (40 in) [RÉFÉRENCÉ AOPA, fiche Cessna 172] ; hauteur [ESTIMÉ]',w:1.02,h:1.20,lead:0,pitch:{P:0.95},sw:{P:0.44},col:0x6b5d4c,crew:'L',small:true}};
function M(color,map,emis){ const m=new THREE.MeshBasicMaterial({color,map:map||null}); m.userData.base=new THREE.Color(color); m.userData.emis=!!emis; mats.push(m); return m; }
function box(par,w,h,d,mat,x,y,z){ const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat); b.position.set(x,y,z); par.add(b); return b; }
function tex(w,h,draw){ const c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'),w,h); return new THREE.CanvasTexture(c); }
const winTex=()=>tex(64,96,(g,w,h)=>{ g.fillStyle='#e9edf0'; g.fillRect(0,0,w,h); const gr=g.createLinearGradient(0,0,0,h); gr.addColorStop(0,'#8fc7ff'); gr.addColorStop(1,'#dff1ff'); g.fillStyle=gr; g.beginPath(); g.ellipse(w/2,h/2,w*0.32,h*0.36,0,0,7); g.fill(); });
const panelTex=()=>tex(256,64,(g,w,h)=>{ g.fillStyle='#202226'; g.fillRect(0,0,w,h); for(let i=0;i<6;i++){ const x=18+i*40; g.fillStyle='#0b0c0d'; g.beginPath(); g.arc(x,28,15,0,7); g.fill(); g.strokeStyle='#d9dde2'; g.lineWidth=1.5; g.beginPath(); g.arc(x,28,12,0,7); g.stroke(); g.beginPath(); g.moveTo(x,28); g.lineTo(x+8*Math.cos(i),28-8*Math.sin(i)); g.stroke(); } });   // « six instruments » schématiques
const signTex=(t,bg)=>tex(128,48,(g,w,h)=>{ g.fillStyle=bg; g.fillRect(0,0,w,h); g.fillStyle='#fff'; g.font='bold 26px sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText(t,w/2,h/2+1); });

// x des sièges d'un rang : groupes séparés par des allées, centrés dans la largeur utile
function rowX(groups,sw,w){ const n=groups.reduce((s,g)=>s+Math.max(g.length,0),0), slots=groups.map(g=>g.length), nA=Math.max(1,groups.length-1);
  const usable=w-0.24, aisle=Math.max(0.42,(usable-groups.reduce((s,g)=>s+Math.max(1,g.length),0)*sw)/nA), xs=[], aisles=[]; let x=-usable/2;
  groups.forEach((g,gi)=>{ const k=Math.max(1,g.length); for(let i=0;i<k;i++){ if(i<g.length) xs.push({x:x+sw*(i+0.5),l:g[i]}); } x+=k*sw; if(gi<groups.length-1){ aisles.push(x+aisle/2); x+=aisle; } }); return {xs,aisles}; }

function build(k){ while(G.children.length) G.remove(G.children[0]); mats=[]; const d=D[k]; if(!d) return; const L=(window.CABLAY?CABLAY(k):null), e=A.eye;
  const floor=e[1]-(d.small?0.95:1.15), z0=e[2]+(d.small?0.15:d.lead), g=new THREE.Group(); G.add(g);
  // sièges (instances) : assise, dossier, appui-tête
  const seats=[]; let z=z0, last=null, aisleX=0, firstZ=null; const rowsZ=[]; const exits=[];
  const rows=(L&&L.rows)||[]; const crew=d.crew?[{r:0,c:'P',g:d.crew==='L'?[['PIL'],['']]:[[''],['PIL']],crew:true}]:[];
  [...crew,...rows].forEach((r,ri)=>{ const cls=r.c||'Y', p=d.pitch[cls]||d.pitch[Object.keys(d.pitch)[0]], sw=d.sw[cls]||0.46;
    if(last&&last!==cls&&!d.small){ z+=1.1; box(g,d.w*0.98,1.6,0.06,M(0x9aa3ab),0,floor+0.8,z-0.6); }   // séparation de classe (cloison / rideau)
    last=cls; const groups=r.g.map(x=>x.filter(Boolean)); const lay=rowX(r.g.map(x=>x.length?x:[]),sw,d.w);
    if(r.crew){ const xs=d.crew==='L'?[-d.w/4]:[d.w/4]; xs.forEach(x=>seats.push({x,z,sw,cls:'CREW'})); }
    else lay.xs.forEach(s=>{ if(s.l) seats.push({x:s.x,z,sw,cls}); });
    if(lay.aisles.length) aisleX=lay.aisles[0]; if(firstZ==null) firstZ=z; rowsZ.push({r:r.r,z,cls}); if(r.ex) exits.push(z); z+=p; });
  const zEnd=z+(d.small?0.2:1.6), len=zEnd-z0+(d.small?0.3:0.6);
  const cush=new THREE.InstancedMesh(new THREE.BoxGeometry(1,0.12,1),M(d.col),Math.max(1,seats.length)),
        back=new THREE.InstancedMesh(new THREE.BoxGeometry(1,0.72,0.12),M(new THREE.Color(d.col).multiplyScalar(1.15).getHex()),Math.max(1,seats.length)),
        head=new THREE.InstancedMesh(new THREE.BoxGeometry(1,0.16,0.13),M(0xe9eaec),Math.max(1,seats.length)), mx=new THREE.Matrix4();
  // l'avant de l'appareil est vers −z : le passager regarde vers −z, le dossier est derrière lui (+z)
  seats.forEach((s,i)=>{ const dep=s.cls==='J'?0.75:s.cls==='CREW'?0.5:0.5, w=s.sw*0.92;
    mx.makeScale(w,1,dep); mx.setPosition(s.x,floor+0.45,s.z); cush.setMatrixAt(i,mx);
    mx.makeScale(w,1,1); mx.setPosition(s.x,floor+0.45+0.42,s.z+dep/2); back.setMatrixAt(i,mx);
    mx.makeScale(w*0.9,1,1); mx.setPosition(s.x,floor+0.45+0.86,s.z+dep/2); head.setMatrixAt(i,mx); });
  [cush,back,head].forEach(m=>{ m.count=seats.length; m.instanceMatrix.needsUpdate=true; g.add(m); });
  const zA=z0-(d.small?0.55:1.45), zB=zEnd+(d.small?0.35:1.2), len2=zB-zA, zc=(zA+zB)/2, W=d.w, H=d.h, wall=M(0xdfe3e6), dark=M(0x2b2f33);   // l'enveloppe englobe les offices avant et arrière
  box(g,W,0.05,len2,M(d.small?0x2a2a2a:0x4a5560),0,floor-0.025,zc);                                   // plancher
  if(!d.small) box(g,0.5,0.006,len-0.4,M(0x6c2f3a),aisleX,floor+0.003,zc);                            // moquette d'allée
  box(g,W,0.05,len2,M(d.small?0xcfc6b0:0xf0f1f2),0,floor+H,zc);                                                         // plafond
  [-1,1].forEach(s=>{ box(g,0.05,H,len2,wall,s*W/2,floor+H/2,zc); });                                    // parois
  if(d.small){ box(g,W,0.62,0.12,M(0x17181a),0,floor+0.62,zA); box(g,W*0.9,0.3,0.02,M(0xffffff,panelTex(),true),0,floor+0.72,zA+0.065); }   // petit appareil : tableau de bord en bas, pare-brise ouvert au-dessus (on voit dehors)
  else box(g,W,H,0.05,M(0xcfd4d8),0,floor+H/2,zA);                                                   // cloison avant (poste)
  box(g,W,H,0.05,M(0xcfd4d8),0,floor+H/2,zB);                                                         // cloison arrière
  // hublots (texture de jour) le long des parois, à hauteur d'œil assis
  const wm=M(0xffffff,winTex(),true); wm.userData.win=true; const step=d.small?0.8:0.53;
  for(let zz=z0;zz<zEnd;zz+=step) [-1,1].forEach(s=>{ const h=new THREE.Mesh(new THREE.PlaneGeometry(d.small?0.5:0.26,d.small?0.42:0.36),wm); h.position.set(s*(W/2-0.03),floor+(d.small?0.95:1.05),zz); h.rotation.y=-s*Math.PI/2; g.add(h); });
  if(d.bins){ [-1,1].forEach(s=>{ box(g,0.62,0.42,len-0.8,M(0xf4f5f6),s*(W/2-0.31),floor+H-0.36,zc); box(g,0.02,0.02,len-0.8,M(0xbfe3ff,null,true),s*(W/2-0.64),floor+H-0.58,zc); });   // coffres à bagages, rampe lumineuse
    if(k==='b777'||k==='a350') box(g,1.6,0.38,len-6,M(0xf4f5f6),0,floor+H-0.3,zc+1);                            // coffres centraux (777)
    box(g,W*0.5,1.9,0.9,M(0xb8c0c7),-W*0.22,floor+0.95,z0-0.85);                                       // office avant (galley)
    box(g,0.9,1.9,0.9,M(0xa7b0b8),W*0.3,floor+0.95,z0-0.85); box(g,0.06,0.9,0.04,dark,W*0.3-0.3,floor+1.0,z0-0.39);   // toilettes avant
    box(g,W*0.6,1.9,0.8,M(0xb8c0c7),0,floor+0.95,zEnd+0.7); }
  if(!d.small){
  for(let zz=z0;zz<zEnd;zz+=0.9) box(g,0.03,0.01,0.12,M(0xffe08a,null,true),aisleX+0.27,floor+0.006,zz);   // éclairage de cheminement au sol
  const ex=M(0xffffff,signTex('EXIT','#0f8a3a'),true);                                                // signalisation des issues
  [z0-0.2,...exits,zEnd].forEach(zz=>{ const sgn=new THREE.Mesh(new THREE.PlaneGeometry(0.3,0.11),ex); sgn.position.set(aisleX,floor+H-0.12,zz); g.add(sgn);
    if(exits.includes(zz)) [-1,1].forEach(s=>box(g,0.04,1.2,0.6,M(0x9ec2e0),s*(W/2-0.05),floor+0.9,zz)); }); }   // signalisation : avions de ligne, Learjet, S-76
  // petits appareils : passager assis au rang arrière, regard vers l'avant ; avions de ligne : debout dans l'allée, entre l'office et le rang 1, regard vers l'arrière
  CAM={x:d.small?0:aisleX, y:floor+(d.small?1.05:Math.min(1.62,d.h*0.8)),   /* cabine basse (S-76, Learjet) : œil sous le plafond */ z:d.small?(rowsZ.length?rowsZ[rowsZ.length-1].z+0.05:z0):z0-0.3,
       zmin:d.small?z0:z0-0.3, zmax:d.small?(rowsZ.length?rowsZ[rowsZ.length-1].z+0.05:z0):zEnd-0.3, back:!d.small, rows:rowsZ, n:seats.length, w:W, len};
  built=k; }

// vue « Cabine »
let pos=null;
const _pc=placeCamera; placeCamera=function(){ const r=_pc.apply(this,arguments); try{
  const on=view==='cab'; if(on&&built!==ACK){ build(ACK); pos=null; } G.visible=on&&!!CAM;
  if(on&&CAM){ G.quaternion.copy(qAtt); G.position.set(0,0,0); if(pos==null) pos=CAM.z;
    const kb=(typeof KEYS!=='undefined'&&KEYS)||(typeof IN!=='undefined'&&IN.kb)||{}, mv=((kb.pagedown?1:0)-(kb.pageup?1:0))*(CAM.back?-1:1)*0.05+(window.CAB_MV||0)*0.05;   // Page préc. / Page suiv. (Z, S et les flèches pilotent l'appareil) pos=Math.max(CAM.zmin,Math.min(CAM.zmax,pos+mv));
    camera.position.set(CAM.x,CAM.y,pos).applyQuaternion(qAtt);
    eLook.set(LK.pitch,LK.yaw+(CAM.back?Math.PI:0),0,'YXZ'); qLook.setFromEuler(eLook); camera.quaternion.copy(qAtt).multiply(qLook);
    if(Math.abs(camera.fov-70)>0.01){ camera.fov=70; camera.updateProjectionMatrix(); }
    if(!ovhPinned&&!$('ovh').hidden) $('ovh').hidden=true;
    const n=SKY&&SKY.u&&SKY.u.night?SKY.u.night.value:0, lit=1-0.12*n, win=1-0.82*n;   // éclairage de cabine allumé ; seuls les hublots s'assombrissent la nuit
    mats.forEach(m=>{ const k=m.userData.win?win:m.userData.emis?1:lit; m.color.copy(m.userData.base).multiplyScalar(k); });
    navUI(true); } else navUI(false); }catch(e){ G.visible=false; } return r; };

// bouton « Cabine » (même style que les boutons de vue) et commandes d'allée sur téléphone
const css=document.createElement('style'); css.textContent=`#cabnav{position:fixed;right:12px;bottom:calc(var(--barh,56px) + 12px);z-index:12;display:flex;flex-direction:column;gap:6px;align-items:center}
#cabnav button{width:46px;height:46px;font-size:20px} #cabnav span{font:600 11px Inter,sans-serif;color:var(--mut);background:#0b131bcc;border-radius:6px;padding:2px 6px}`;
document.head.appendChild(css);
function navUI(on){ let n=document.getElementById('cabnav'); if(!on){ if(n) n.hidden=true; return; }
  if(!n){ n=document.createElement('div'); n.id='cabnav'; n.innerHTML='<button type="button" data-d="-1" title="Avancer dans l\'allée">▲</button><span>allée</span><button type="button" data-d="1" title="Reculer dans l\'allée">▼</button>';
    n.querySelectorAll('button').forEach(b=>{ const dd=+b.dataset.d; const st=()=>window.CAB_MV=(CAM&&CAM.back?-dd:dd), sp=()=>window.CAB_MV=0;
      b.addEventListener('pointerdown',st); ['pointerup','pointerleave','pointercancel'].forEach(t=>b.addEventListener(t,sp)); }); document.body.appendChild(n); }
  { let sp=n.querySelector('.csrc'); if(!sp){ sp=document.createElement('span'); sp.className='csrc'; sp.style.cssText='max-width:120px;text-align:center;cursor:help'; n.prepend(sp); }
    const d=D[ACK]; if(d){ sp.textContent='ⓘ '+d.w.toFixed(2).replace('.',',')+' × '+d.h.toFixed(2).replace('.',',')+' m'; sp.title='Cabine : '+d.src; sp.setAttribute('aria-label',sp.title); } }   // V10.41 (F27) : dimensions et leur source
  n.hidden=false; }
function addBtn(){ const ext=document.querySelector('[data-v="ext"]'); if(!ext||document.querySelector('[data-v="cab"]')) return;
  const b=document.createElement('button'); b.type='button'; b.dataset.v='cab'; b.textContent='Cabine'; b.title='Cabine passagers (Page préc. / Page suiv. ou ▲ ▼ pour se déplacer dans l\'allée)';
  b.onclick=()=>{ setView('cab'); }; ext.after(b); }
const _sv=setView; setView=function(v){ const r=_sv.apply(this,arguments); try{ navUI(v==='cab'&&!!CAM&&built===ACK); }catch(e){} return r; };   // V10.39 : boutons d'allée masqués dès qu'on quitte la cabine, même en pause
addBtn(); setTimeout(addBtn,1500);
window.CABIN={G,build,cam:()=>CAM,pos:()=>pos};
})();
