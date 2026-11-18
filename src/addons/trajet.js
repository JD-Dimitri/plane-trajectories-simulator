/* =====================================================================================================
   V10.41 (F28) — UNE SEULE DÉFINITION DU TRAJET PAR MISSION
   La carte, les documents de vol (OFP / log de navigation, plan de vol OACI…) et l'écran « Calculs du vol » lisaient le
   trajet à des endroits différents : les documents retombaient sur une route fixe (New York → Paris pour les avions,
   Manhattan → JFK pour les hélicoptères) dès qu'une mission n'avait pas de route pédagogique, et le calcul prenait la
   distance du FMS (nulle pour un tour de piste qui revient au terrain). TRAJET() donne le même trajet à tous :
   départ (aéroport de la mission ou le plus proche du point de départ), points de la mission (points VFR du parcours,
   sinon route pédagogique), destination ; et la distance totale le long de ces points.
   ===================================================================================================== */
(function(){
'use strict';
function near(la,lo){ let b=null,bd=1e9; for(const k in APTS){ const a=APTS[k]; const d=gcKm(la,lo,a.lat,a.lon); if(d<bd){ bd=d; b=k; } } return bd<15?b:null; }
function TRAJET(mi){ mi=mi||(typeof MI!=='undefined'?MI:null); if(!mi||!mi.start) return null; let st=null; try{ st=mi.start(); }catch(e){}
  const dep=mi.dep||(st&&near(st.lat,st.lon))||null, dest=mi.dest||dep, A=k=>APTS[k]?[k,APTS[k].lat,APTS[k].lon]:null, P=[];
  const mid=mi.wps&&mi.wps.length>1?mi.wps.map(w=>[String(w[0]),+w[1],+w[2],'VRP']):mi.route&&mi.route.length?mi.route.map(p=>[String(p[2]||''),+p[0],+p[1],'point']):[];
  if(dep&&A(dep)) P.push([...A(dep),'DÉP']); else if(st) P.push(['DÉP',st.lat,st.lon,'DÉP']);
  mid.forEach(p=>{ const l=P[P.length-1]; if(l&&l[0]===p[0]&&Math.abs(l[1]-p[1])<0.02) return; P.push(p); });
  if(dest&&A(dest)){ const l=P[P.length-1]; if(P.length>1&&l[0]===dest) l[3]='ARR'; else P.push([...A(dest),'ARR']); }
  let km=0; for(let i=1;i<P.length;i++) km+=gcKm(P[i-1][1],P[i-1][2],P[i][1],P[i][2]);
  return {dep,dest,pts:P,km}; }
window.TRAJET=TRAJET;
})();
