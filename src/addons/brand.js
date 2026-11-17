/* ===== MARQUES FICTIVES =====
   Bascule « Noms réels » ↔ « Marques fictives » : les parcours, procédures, valeurs et directives restent EXACTEMENT les mêmes ;
   seuls les noms de constructeurs, d'appareils, de motoristes et de compagnies sont remplacés à l'affichage (textes, menus,
   documents exportés). Les aéroports, codes OACI, fréquences et la réglementation restent réels (données publiques factuelles).
   Noms fictifs inventés : à faire vérifier (recherche d'antériorité INPI / EUIPO) avant toute exploitation commerciale. */
(function(){
const MAP=[
 [/Airbus A320-200/g,'Aéralis AL-20'],[/\bA320-200\b/g,'AL-20'],[/\bA320\b/g,'AL-20'],[/\bA32[01N]\b/g,'AL-20'],
 [/Boeing 777-300ER/g,'Celestra C-77 LR'],[/\b777-300ER\b/g,'C-77 LR'],[/\b777\b/g,'C-77'],[/\bBoeing\b/g,'Celestra'],
 [/Airbus H125/g,'Héliane H-25'],[/\bH125\b/g,'H-25'],[/Écureuil/g,'Héliane'],[/\s*\(AS ?350 ?B3e?\)/g,''],[/\bAS ?350( ?B3e?)?\b/g,'H-25'],[/\bAirbus\b/g,'Aéralis'],
 [/Learjet 60/g,'Stratus SJ-6'],[/\bLearjet\b/g,'Stratus'],[/\bLJ60\b/g,'SJ-6'],
 [/Sikorsky S-76[A-D+]*/g,'Orion HB-7'],[/\bS-76[A-D+]*\b/g,'HB-7'],[/\bSikorsky\b/g,'Orion'],
 [/Robinson R44 Raven II/g,'Colibri C-4 II'],[/\bR44\b/g,'C-4'],[/\bRaven II\b/g,'II'],[/\bRobinson\b/g,'Colibri'],
 [/GE90-115B/g,'turbofan T-115'],[/\bGE90\b/g,'T-115'],[/CFM56(-5B)?/g,'turbofan R-56'],[/\bCFM\b/g,'R-56'],[/Safran Arriel 2D/g,'turbine Arvel'],[/\bArriel\b/g,'Arvel'],[/\bSafran\b/g,'le motoriste'],
 [/Pratt & Whitney( Canada)?/g,'le motoriste'],[/Rolls-Royce/g,'le motoriste'],[/\bLycoming\b/g,'motoriste à pistons'],[/Collins Pro Line 4/g,'avionique intégrée'],[/\bCollins\b/g,'avionique'],
 [/Air France/g,'Air Hexagone'],[/Air Austral/g,'Air Lagon'],[/Germanwings( vol)?\s*/g,'Vol '],[/US Airways( vol)?\s*/g,'Vol '],[/American Airlines/g,'une compagnie américaine']];
const tx=s=>{ if(typeof s!=='string'||!s) return s; for(const [re,r] of MAP) s=s.replace(re,r); return s; };
let ON=false; try{ ON=localStorage.getItem('sim-brand')==='fict'; }catch(e){}
window.BRANDTX=s=>ON?tx(s):s;
// données : noms d'appareils et de missions (originaux conservés pour revenir aux noms réels)
const ORIG={ac:{},mi:{}};
function data(){ for(const k in AC){ const a=AC[k]; if(!ORIG.ac[k]) ORIG.ac[k]={name:a.name,sub:a.sub}; a.name=ON?tx(ORIG.ac[k].name):ORIG.ac[k].name; a.sub=ON?tx(ORIG.ac[k].sub):ORIG.ac[k].sub; }
  for(const k in MISSIONS){ const m=MISSIONS[k]; if(!ORIG.mi[k]) ORIG.mi[k]={n:m.n,d:m.d}; m.n=ON?tx(ORIG.mi[k].n):ORIG.mi[k].n; m.d=ON?tx(ORIG.mi[k].d):ORIG.mi[k].d; } }
// étapes de parcours
const _sf=stepsFor; stepsFor=function(){ const st=_sf.apply(this,arguments); if(!ON) return st; st.forEach(s=>{ s.t=tx(s.t); s.txt=tx(s.txt); (s.items||[]).forEach(it=>{ it[0]=tx(it[0]); }); }); return st; };
// filet de sécurité : tout texte affiché (menus, atelier, documents, bulles, fiches)
const SKIP=new Set(['SCRIPT','STYLE','TEXTAREA','INPUT','CODE']);
function fixNode(n){ if(n.nodeType===3){ const p=n.parentNode; if(p&&SKIP.has(p.nodeName)) return; const v=n.nodeValue, w=tx(v); if(w!==v) n.nodeValue=w; return; }
  if(n.nodeType!==1||SKIP.has(n.nodeName)) return; if(n.title){ const w=tx(n.title); if(w!==n.title) n.title=w; }
  const it=document.createTreeWalker(n,NodeFilter.SHOW_TEXT); let t; const L=[]; while((t=it.nextNode())) L.push(t); L.forEach(x=>fixNode(x)); }
const OBS=new MutationObserver(ms=>{ if(!ON) return; for(const m of ms){ if(m.type==='characterData') fixNode(m.target); else m.addedNodes.forEach(fixNode); } });
function apply(){ data(); try{ document.title=ON?'Simulateur PLANE TRAJECTORIES — marques fictives':'Simulateur PLANE TRAJECTORIES'; }catch(e){}
  if(ON){ OBS.observe(document.body,{childList:true,subtree:true,characterData:true}); fixNode(document.body); } else OBS.disconnect();
  try{ renderMenu(); }catch(e){} btn(); }
function set(v){ ON=!!v; try{ localStorage.setItem('sim-brand',ON?'fict':'real'); }catch(e){} if(!ON){ location.reload(); return; } apply(); flash('Marques fictives : mêmes parcours et procédures, noms de constructeurs et compagnies remplacés','am'); }
function btn(){ const m=document.getElementById('menu'); if(!m) return; let b=document.getElementById('b-brand');
  if(!b){ b=document.createElement('button'); b.type='button'; b.id='b-brand'; b.style.cssText='display:block;margin:12px 0 4px;background:#132232;color:#e8eef2;border:1px solid #2b3d50;border-radius:8px;padding:6px 10px;font:700 13px "Barlow Condensed",sans-serif;letter-spacing:.05em;text-transform:uppercase;cursor:pointer';
    b.onclick=()=>set(!ON); }
  /* V10.28 : placé après le paragraphe « Heure de départ » (il cachait le bouton Introduction en haut du menu) */
  const tm=document.getElementById('c-tm'); if(tm&&b.previousElementSibling!==tm) tm.after(b); else if(!tm&&!b.parentNode) m.appendChild(b);
  b.textContent=ON?'🏷 Marques fictives ✓ (revenir aux noms réels)':'🏷 Passer en marques fictives'; }
setTimeout(apply,0);
window.BRAND={set,get on(){ return ON; },tx};
})();
