/* ===== LÉGENDES : bouton Légende ON / OFF, légendes de phase extérieures et intérieures =====
   - ON/OFF : affiche ou masque les pastilles numérotées du tour avion et toutes les légendes.
   - Légendes extérieures (vues extérieures) : étiquettes 3D posées sur les éléments de l'appareil qui comptent
     dans la phase en cours — préparation (points de visite), roulage, décollage, croisière, atterrissage.
   - Légendes intérieures (vue cockpit) : encadré « à surveiller maintenant » listant les instruments et commandes
     de la phase, propres à la famille d'appareil (Airbus, Boeing, jet d'affaires, avion école, hélicoptère).
   Positions des éléments : calculées depuis les dimensions de chaque appareil (ordres de grandeur). */
(function(){
if(typeof MODEL==='undefined') return;
const LEG={on:true}; try{ LEG.on=localStorage.getItem('sim-leg')!=='off'; }catch(e){}
const G=new THREE.Group(); MODEL.add(G); let cur='', curAc='', EXT=[];
function spr(t,col){ const cv=document.createElement('canvas'), g=cv.getContext('2d'); g.font='600 30px Inter,Arial'; const w=Math.ceil(g.measureText(t).width)+36; cv.width=w; cv.height=52;
  g.font='600 30px Inter,Arial'; g.fillStyle='rgba(10,20,30,0.82)'; g.beginPath(); g.roundRect?g.roundRect(0,0,w,52,14):g.rect(0,0,w,52); g.fill(); g.strokeStyle=col||'#3fd0ff'; g.lineWidth=4; g.stroke(); g.fillStyle='#fff'; g.textBaseline='middle'; g.fillText(t,18,28);
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cv),depthTest:false,transparent:true,sizeAttenuation:false})); s.userData.ar=w/52; s.renderOrder=20; return s; }
// éléments de l'appareil (repère modèle : x à droite, y vers le haut depuis l'axe du fuselage, z vers l'arrière)
function parts(k){ const e=(AC[k]&&AC[k].ext)||{len:30,span:30}, L=e.len, W=e.span/2, y0=-(AC[k]?AC[k].yOff:2), rw=AC[k]&&AC[k].kind==='rw';
  if(rw){ const top=k==='r44'?1.4:k==='s76'?1.9:1.6; return {rotor:[0,top+0.4,0],tail:[0,0.6,L*0.47],trotor:[0.3,0.8,L*0.5],skid:[0,y0+0.2,0],eng:[0,top-0.2,0.9],cock:[0,0.3,-L*0.3],gear:[0,y0+0.3,-0.5]}; }
  const nose=-L/2, tail=L/2, jetW=k==='b777'?W*0.31:k==='a350'?W*0.29:k==='a320'?W*0.34:0; return {
    nose:[0,0.2,nose+0.4], cock:[0,0.8,nose+L*0.08], wingL:[-W*0.8,0.2,-L*0.02], wingR:[W*0.8,0.2,-L*0.02], flapL:[-W*0.5,0.0,L*0.04], flapR:[W*0.5,0.0,L*0.04],
    ailL:[-W*0.9,0.1,L*0.05], spoil:[-W*0.42,0.35,L*0.02], engL:k==='lj60'?[-1.1,0.4,L*0.28]:k==='c172'?[0,0,nose+0.3]:[-jetW,-1.4,-L*0.1], engR:k==='lj60'?[1.1,0.4,L*0.28]:null,
    gearN:[0,y0+0.6,nose+L*0.12], gearM:[k==='c172'?1.25:W*0.12,y0+0.7,L*0.02], elev:[W*0.18,L*0.04,tail-L*0.04], rud:[0,L*0.16,tail-L*0.03], land:[-W*0.25,-0.5,-L*0.06], bcn:[0,1.1,-L*0.05], apu:[0,0.6,tail]}; }
const FW={
  prep:k=>WALKPTS[k]?null:[],
  taxi:k=>[['nose','Roulette de nez : direction au sol'],['gearM','Freins (pédales)'],['land','Phare de roulage'],['bcn','Balise anticollision allumée']],
  to:k=>[['flapL','Volets : configuration décollage'],['engL',k==='c172'?'Hélice : plein gaz ≈ 2 300 tr/min':'Moteurs : poussée de décollage'],['elev','Profondeur : rotation à VR'],['gearM','Train : rentré dès la montée positive'],['land','Phares d\'atterrissage ON']],
  cruise:k=>[['wingR','Aile : portance de croisière'],['engL',k==='c172'?'Mélange appauvri en altitude':'Moteurs : poussée de croisière'],['rud','Gouverne de direction'],['ailL','Ailerons : virages']],
  land:k=>[['flapL','Volets sortis : vitesse d\'approche plus faible'],['gearN','Train sorti et verrouillé'],['spoil',k==='c172'?'Pas d\'aérofreins : réduction et volets':'Aérofreins / spoilers armés'],['engL',k==='c172'?'Réduction totale à l\'arrondi':'Inverseurs de poussée après le toucher'],['land','Phares d\'atterrissage ON']]};
const RW={prep:FW.prep,taxi:k=>[['skid','Patins / train : roulage ou vol stationnaire'],['rotor','Rotor principal : régime nominal']],
  to:k=>[['rotor','Collectif : décollage vertical puis translation'],['trotor','Rotor anticouple : palonniers'],['eng','Moteur : puissance de décollage']],
  cruise:k=>[['rotor','Cyclique : vitesse et virages'],['trotor','Rotor anticouple'],['eng','Puissance de croisière']],
  land:k=>[['rotor','Collectif : descente, vol stationnaire, posé'],['skid','Patins : contact progressif'],['trotor','Palonniers : tenir le cap']]};
const CK={ air:{prep:['Électricité : batteries, groupe auxiliaire (APU)','MCDU : plan de vol, masses, vitesses','ECAM : portes, carburant, pages systèmes'],taxi:['Freins et direction','ND : cheminement de roulage','Commandes de vol : vérification (ECAM F/CTL)'],
    to:['PFD : vitesse — V1, VR, V2','FMA : modes du pilote automatique et de la poussée','EWD : N1 de décollage, EGT'],cruise:['ND : route et prochain point','Carburant : prévu / restant','Altitude et Mach sur le PFD'],land:['PFD : alignement de piste et pente (LOC / G/S)','Train : 3 vertes','Volets et vitesse d\'approche','Hauteur radio (annonces automatiques)']},
  bus:{prep:['Électricité, APU','FMS : plan de vol, vitesses','Avertissements (CAS)'],taxi:['Freins, direction','Plan de roulage'],to:['Vitesse : V1, VR, V2','Poussée : N1, ITT'],cruise:['Route, carburant, altitude'],land:['Approche : alignement et pente','Train sorti','Volets, vitesse d\'approche']},
  sep:{prep:['Visite prévol faite, carburant purgé','Magnétos OFF, MASTER : jauges','Check-list avant mise en route'],taxi:['Bille / aiguille de virage','Freins','Pression d\'huile au vert'],
    to:['Compte-tours : ≈ 2 300 tr/min plein gaz','Anémomètre : rotation à 55 KIAS, montée à 74','Huile et température au vert'],cruise:['Altimètre au QNH','Conservateur de cap recalé sur le compas','Réchauffage carburateur si baisse de régime'],land:['Réchauffage carburateur CHAUD avant de réduire','Volets : 10 / 20 / 30 sous 85 KIAS','Vitesse : 65 puis 60 KIAS en courte finale']},
  rw:{prep:['Batterie, voyants','Commandes libres, frein rotor'],taxi:['Régime rotor (NR)','Vol stationnaire stable'],to:['Couple / puissance','Vitesse de translation, régime rotor'],cruise:['Vitesse, altitude','Régime rotor dans l\'arc vert'],land:['Vitesse de descente','Régime rotor','Point de poser']}};
function phase(){ if(typeof S==='undefined') return 'prep'; const agl=(S.alt-(typeof elevAt==='function'?elevAt(S.lat,S.lon):0))/FT, kt=(S.V||0)/KT;
  if(S.onGround){ if(!S.eng||!S.eng.some(Boolean)) return 'prep'; if(kt>25) return LEG.air?'land':'to'; return 'taxi'; }
  LEG.air=true; if(agl<3000&&((S.gear&&A.kind==='fw'&&S.flap>=2)||(S.vs||(S.gam||0))<-0.02&&agl<1500)) return 'land'; if(agl<3000) return 'to'; return 'cruise'; }
const NAMES={prep:'Préparation',taxi:'Roulage',to:'Décollage',cruise:'Croisière',land:'Atterrissage'};
function rebuild(ph){ while(G.children.length) G.remove(G.children[0]); const k=ACK, P=parts(k), list=(A.kind==='rw'?RW:FW)[ph](k);
  EXT=[]; (list||[]).forEach(([p,t])=>{ const xyz=P[p]; if(!xyz) return; EXT.push(t); const s=spr(String(EXT.length),ph==='land'?'#ffb347':ph==='to'?'#4ade80':'#3fd0ff'), sc=Math.min(innerWidth,innerHeight)<700?0.04:0.03; s.scale.set(sc*s.userData.ar,sc,1); s.center.set(0.5,-0.15); /* taille constante à l'écran */ s.position.set(...xyz); G.add(s); }); }
// encadré intérieur (vue cockpit)
function box(){ let b=document.getElementById('legck'); if(!b){ b=document.createElement('div'); b.id='legck'; b.style.cssText='position:fixed;right:8px;'+(innerWidth<700?'bottom:calc(var(--barh,64px) + 10px);max-height:30vh;overflow:auto;':'top:96px;')+'z-index:8;max-width:250px;background:rgba(8,16,24,.86);color:#e8eef2;border:1px solid #3fd0ff;border-radius:10px;padding:7px 10px;font:12px/1.35 Inter,sans-serif;pointer-events:none'; document.body.appendChild(b); } return b; }
function fam(){ return A.kind==='rw'?'rw':ACK==='c172'?'sep':ACK==='lj60'?'bus':'air'; }
// bouton
function sync(){ const b=document.getElementById('b-leg'); if(b){ b.textContent=LEG.on?'🏷 Légende ON':'🏷 Légende OFF'; b.classList.toggle('on',LEG.on); } }
{ const bar=document.getElementById('bar'), help=document.getElementById('b-help'); if(bar&&help){ const b=document.createElement('button'); b.type='button'; b.id='b-leg'; b.title='Afficher ou masquer les numéros du tour avion et les légendes de phase'; b.onclick=()=>{ LEG.on=!LEG.on; try{ localStorage.setItem('sim-leg',LEG.on?'on':'off'); }catch(e){} sync(); cur=''; }; help.before(b); sync(); } }
let lastMI=null;
setInterval(()=>{ try{ if(typeof view==='undefined') return; if(G.parent!==MODEL) MODEL.add(G); if(MI!==lastMI){ lastMI=MI; LEG.air=false; }
  const menu=document.getElementById('menu'), vis=menu&&menu.hidden; if(GD.markers) GD.markers.visible=LEG.on;
  const ph=phase(), key=ACK+'|'+ph; if(key!==cur){ cur=key; rebuild(ph); }
  G.visible=LEG.on&&vis&&view!=='ck'&&!(ph==='prep'&&GD.markers&&GD.markers.children.length);   // en préparation, les pastilles numérotées du tour avion servent de légende
  const b=box(), ext=G.visible&&EXT.length, show=LEG.on&&vis&&(view==='ck'||ext); b.style.display=show?'block':'none';
  if(show&&ext&&view!=='ck'){ const h=`<b style="color:#3fd0ff;font:700 12px 'Barlow Condensed',sans-serif;letter-spacing:.08em">🏷 ${NAMES[ph].toUpperCase()} · SUR L'APPAREIL</b>`+EXT.map((x,i)=>`<div><b style="color:#ffd27a">${i+1}</b> · ${x}</div>`).join(''); if(b._h!==h){ b.innerHTML=h; b._h=h; } }
  else if(show){ const L=CK[fam()][ph]||[], h=`<b style="color:#3fd0ff;font:700 12px 'Barlow Condensed',sans-serif;letter-spacing:.08em">🏷 ${NAMES[ph].toUpperCase()} · À SURVEILLER</b>`+L.map(x=>`<div>• ${x}</div>`).join(''); if(b._h!==h){ b.innerHTML=h; b._h=h; } } }catch(e){} },500);
window.LEGEND=LEG;
})();
