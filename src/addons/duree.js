/* ===== DURÉES RÉELLES DES ÉTAPES =====
   TEMPS → « Durées réelles (×1) » ou « Temps accéléré ×2 … ×50 » : chaque étape au sol dure son temps réel
   (étude du dossier de vol ≈ 30 min, devis de masse ≈ 20 min, bilan carburant ≈ 10 min, tour avion ≈ 15 min…),
   divisé par l'accélération choisie. L'horloge simulée (UTC) avance d'autant. Les phases de vol et de roulage sont
   déjà en temps physique réel : pas de durée minimale. « Étapes courtes » conserve l'ancien fonctionnement.
   Durées [ESTIMÉ] d'après les pratiques courantes des équipages (présentation ≈ 1 h 15 avant le départ en long-courrier). */
(function(){
const HELI=()=>A&&A.kind==='rw';
// [motif du titre, minutes avion, minutes hélicoptère, ce que fait l'équipage pendant ce temps]
const DUR=[
 [/Briefing et dossier/i,30,15,'L\'équipage étudie la météo (METAR, TAF, TEMSI, vents), les NOTAM, le plan de vol et l\'état technique.'],
 [/Devis de masse|centrage/i,20,10,'Calcul de la masse et du centrage, vérification des limites, signature du devis.'],
 [/Bilan carburant/i,10,5,'Calcul du carburant (étape, réserve de route, dégagement, réserve finale) et décision du commandant.'],
 [/Arrivée au parking/i,5,5,'Trajet en minibus équipage et accès au poste de stationnement.'],
 [/Tour avion|visite/i,15,10,'Inspection extérieure point par point, sans se presser.'],
 [/cold & dark|Monter à bord/i,3,2,'Installation au poste, documents de bord, vérifications de sécurité.'],
 [/Alimentation : batteries/i,1,1,'Mise sous tension et contrôle des tensions.'],
 [/Alimentation sol ou APU|Alimentation électrique|Alimentation et feux/i,2,2,'Branchement du groupe de parc ou démarrage de l\'APU.'],
 [/ADIRS|AHRS/i,1,1,'Lancement de l\'alignement des centrales (sa durée réelle est simulée à part).'],
 [/Feux, consignes|feux, consignes/i,2,2,'Réglage du panneau plafond.'],
 [/FMS|Performances \(calcul/i,10,5,'Saisie de la route, des masses et calcul des performances de décollage, puis contre-vérification.'],
 [/Before Start|Avant la mise en route/i,5,3,'Briefing départ et lecture de la check-list à deux voix.'],
 [/Démarrage|Embrayage/i,1,1,'Séquence de démarrage (durée physique simulée).'],
 [/Parking et arrêt|Arrêt \(POH\)|Arrêt et sécurisation/i,3,3,'Arrêt des moteurs et check-list de parking.'],
 [/Sécurisation/i,5,5,'Mise en sécurité de l\'appareil, compte rendu technique (techlog).']];
const GROUND=/Préparation|Au sol|Cockpit|Mise en route|Parking|Arrêt/;
function durOf(st){ if(!st||st.fly||!GROUND.test(st.ph||'')) return null; for(const [re,a,h,w] of DUR) if(re.test(st.t||'')) return {min:HELI()?h:a,what:w}; return null; }
const T=s=>{ s=Math.max(0,Math.round(s)); const h=Math.floor(s/3600), m=Math.floor(s%3600/60), x=s%60; return h?`${h} h ${String(m).padStart(2,'0')}`:m>=1?`${m} min ${String(x).padStart(2,'0')} s`:`${x} s`; };
let I=-1, S0=0;
function info(){ try{ if(!window.DUR_ON||!GD.on||!MI||!MI.full||window.FF) return null; const st=GD.steps[GD.i]; const d=durOf(st); if(!d) return null;
    if(I!==GD.i){ I=GD.i; S0=simMs; } const tot=d.min*60, el=(simMs-S0)/1000, left=Math.max(0,tot-el), N=window.RSEL||1;
    return {tot,el,left,N,what:d.what,totT:T(tot),leftT:T(left),wallT:T(left/N)}; }catch(e){ return null; } }
window.DUR_INFO=info; window.DUR_LEFT=()=>{ const i=info(); return i?i.left:0; };
// changement d'étape : l'horloge de l'étape repart
const _g=goStep; goStep=function(i){
  const d=info(); const manual=!(typeof AUTO!=='undefined'&&AUTO.on)&&!window.FF&&!(window.EXAM&&EXAM.on)&&!(window.SCNG&&SCNG.on);
  if(d&&d.left>0&&manual&&GD.on&&i===GD.i+1){ ask(d,i); return; }
  const b=GD.i, r=_g.apply(this,arguments); if(GD.i!==b){ I=GD.i; S0=simMs; } return r; };
// en mode guidé : l'étape n'est pas finie tant que sa durée réelle n'est pas écoulée → proposer d'accélérer
function ask(d,i){ let w=document.getElementById('durdlg'); if(w) w.remove(); w=document.createElement('div'); w.id='durdlg';
  w.style.cssText='position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:80;width:min(440px,calc(100vw - 20px));background:#0a131c;border:2px solid #ffd166;border-radius:12px;color:#e8eef2;font:14px/1.45 Inter,sans-serif;padding:14px;box-shadow:0 10px 40px #000c';
  w.innerHTML=`<div style="font:700 13px 'Barlow Condensed',sans-serif;letter-spacing:.12em;color:#ffd166;text-transform:uppercase">⏳ Durée réelle de l'étape</div>
   <h3 style="font:700 21px 'Barlow Condensed',sans-serif;margin:4px 0 6px">${d.totT} — encore ${d.leftT}</h3><p style="margin:0 0 8px">${d.what} En vol réel, l'étape suivante ne commence pas avant. Patientez (≈ ${d.wallT} à l'accélération actuelle) ou accélérez le temps :</p>
   <div style="display:flex;gap:6px;flex-wrap:wrap">${[2,5,10,20,30,50].map(n=>`<button type="button" data-r="${n}" style="background:#132232;color:#fff;border:1px solid #2b3d50;border-radius:8px;padding:8px 11px;font:700 14px 'Barlow Condensed',sans-serif;cursor:pointer;${n===(window.RSEL||1)?'border-color:#ffd166':''}">×${n}</button>`).join('')}</div>
   <div style="display:flex;justify-content:flex-end;margin-top:10px"><button type="button" data-k style="background:#1f6b3a;color:#fff;border:1px solid #3ddc84;border-radius:8px;padding:8px 12px;font:700 14px 'Barlow Condensed',sans-serif;cursor:pointer">J'attends</button></div>`;
  document.body.appendChild(w);
  w.querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>{ const n=+b.dataset.r; window.RSEL=n; const sel=document.getElementById('b-rate'); if(sel){ sel.value=String(n); } setRate(n); w.remove(); flash('Temps accéléré ×'+n,'am'); WAIT=i; });
  w.querySelector('[data-k]').onclick=()=>{ w.remove(); WAIT=i; }; }
let WAIT=-1;   // l'utilisateur a demandé l'étape suivante : on y passe dès que la durée est écoulée
setInterval(()=>{ try{ if(WAIT>=0){ if(!GD.on||GD.i!==WAIT-1){ WAIT=-1; } else if(window.DUR_LEFT()<=0){ const n=WAIT; WAIT=-1; goStep(n); } } paint(); }catch(e){} },500);
// compteur dans le panneau du guide
function paint(){ const g=document.getElementById('guide'); if(!g||g.hidden) return; const h=g.querySelector('.gh>div'); if(!h) return; let c=g.querySelector('#gdur'); const d=info();
  if(!d){ if(c) c.remove(); return; } if(!c){ c=document.createElement('small'); c.id='gdur'; c.style.cssText='display:block;color:#ffd166;font:600 12px Inter,sans-serif;margin-top:2px'; h.appendChild(c); }
  c.textContent=`⏱ Durée réelle ${d.totT} · écoulé ${T(d.el)} · reste ${d.leftT}${d.N>1?' (×'+d.N+' ≈ '+d.wallT+')':''}${WAIT>=0?' · passage automatique à la fin':''}`; }
})();
