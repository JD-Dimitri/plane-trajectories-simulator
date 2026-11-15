/* ===== PLAN DE VOL (FMS) : la ligne verte du ND est la route, et le mode NAV la suit =====
   Avion : orthodromie aéroport de départ → destination (ou position actuelle → destination si le vol commence en l'air).
   En mode NAV, le pilote automatique corrige l'écart latéral (≈ 12° par mille nautique, interception à 40° au plus) et séquence les points.
   Germanwings 9525 : route Barcelone → Provence → Grenoble → Genève → Luxembourg → Düsseldorf [points pédagogiques]. */
(function(){
function nearestRw(la,lo){ let best=null,bd=1e9; for(const k in APTS){ const a=APTS[k]; if(!a||a.heli||!(a.rw||[]).length) continue; const d=gcKm(la,lo,a.lat,a.lon); if(d<bd){ bd=d; best=k; } } return bd<15?best:null; }
function setPlan(){ window.FPLN=null; try{ if(!MI||A.kind!=='fw'||!MI.dest||!APTS[MI.dest]) return; const D=APTS[MI.dest]; const dep=S.onGround?nearestRw(S.lat,S.lon):null; const a=dep?APTS[dep]:null;
  window.FPLN={pts:[a?[a.lat,a.lon,dep]:[S.lat,S.lon,''],[D.lat,D.lon,MI.dest]],i:1}; }catch(e){} }
window.FMS_SET=setPlan;
const _sm=startMission; startMission=function(){ const r=_sm.apply(this,arguments); setPlan(); return r; };
// scénarios : on recalcule après leur mise en place (position de croisière)
const _ss=scnStart; scnStart=function(){ const r=_ss.apply(this,arguments); setTimeout(()=>{ try{ if(SCN.cur&&SCN.cur.id==='GW-ROUTE'){ window.FPLN={pts:[[41.297,2.078,'LEBL'],[43.55,5.05,'PROVENCE'],[45.20,5.80,'GRENOBLE'],[46.24,6.11,'GENEVE'],[49.63,6.21,'LUX'],[51.289,6.767,'EDDL']],i:2};
      AP.lat='NAV'; S.psi=brg(S.lat,S.lon,45.2,5.8)*D2R; AP.hdg=Math.round(brg(S.lat,S.lon,45.2,5.8)); try{ fcuSync(); }catch(e){} } else setPlan(); }catch(e){} },120); return r; };
})();
