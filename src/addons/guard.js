/* ===== ACTIONS INCOHÉRENTES : cadre jaune puis cadre rouge =====
   Une commande actionnée hors de l'ordre des procédures ou contre la logique de fonctionnement :
   1) cadre JAUNE clignotant autour de la commande + explication (ce que dit la procédure) ; Annuler (recommandé) ou « Le faire quand même » ;
   2) si on force : cadre ROUGE + conséquences réelles de la décision, et l'action est appliquée dans le simulateur.
   L'action attendue par le guide (étape en cours) n'est jamais bloquée. Valeurs A320 : VLO 250 kt, VLE 280 kt, VFE 1/2/3/FULL 230/200/185/177 kt, VMO 350 kt / MMO M0,82. */
(function(){
const ad=()=>{ try{ return airdata(); }catch(e){ return {alt:S.alt/FT,cas:0,gs:0}; } };
const air=()=>!S.onGround, A_=()=>ad().alt, V=()=>ad().cas, fw=()=>A.kind==='fw';
const fail=k=>!!(window.FAIL&&FAIL[k]);
const VFE={a320:{'1':230,'2':200,'3':185,'FULL':177},b777:{'1':255,'5':235,'15':215,'20':195,'25':185,'30':170},lj60:{'8':250,'20':200,'40':150},c172:{'10':110,'20':85,'30':85}};
const R=[];   // {ids, bad(next,el), y (titre, texte jaune), r (conséquences), no (impossible : pas de forçage), fx (effet supplémentaire)}
const rule=(ids,bad,y,r,o)=>R.push(Object.assign({ids:[].concat(ids),bad,y,r},o||{}));
/* ---- train ---- */
rule(['gearL','b-gear'],n=>n===true&&air()&&fw()&&(V()>250||(A_()>15000)),
  ['Sortir le train maintenant est incohérent',()=>`On sort le train en approche, vers 2 000 ft sol, et seulement sous 250 kt (VLO de l'A320). Vous êtes à ${Math.round(A_()).toLocaleString('fr-FR')} ft et ${Math.round(V())} kt.`],
  ()=>['La traînée double environ : la vitesse chute, il faut beaucoup plus de poussée.','Consommation fortement augmentée : l\'autonomie ne suffit peut-être plus pour la destination et le dégagement.',V()>280?'Au-delà de 280 kt (VLE), trappes et jambes de train peuvent être arrachées ou déformées : inspection au sol obligatoire.':'Bruit et vibrations dans la cabine ; alarme ECAM si la vitesse dépasse les limites.','Le pilote automatique et l\'automanette compensent en augmentant la poussée.']);
rule(['gearL','b-gear'],n=>n===false&&!air()&&fw(),['Rentrer le train au sol est impossible','Au sol, le levier est verrouillé : rentrer le train ferait s\'effondrer l\'avion sur son ventre.'],null,{no:true});
/* ---- volets ---- */
const vfeBad=n=>{ const t=VFE[ACK]; if(!t||!air()) return false; const name=typeof n==='number'?(A.flaps[n]||{}).n:n; return t[name]!=null&&V()>t[name]+3; };
rule(['flapL','b-flap'],vfeBad,['Vitesse trop élevée pour ce braquage de volets',n=>{ const name=typeof n==='number'?(A.flaps[n]||{}).n:n; return `Volets ${name} : vitesse maximale ${VFE[ACK][name]} kt (VFE). Vous êtes à ${Math.round(V())} kt : réduisez d'abord la vitesse, puis sortez les volets un cran à la fois.`; }],
  ()=>['Dépassement de la VFE : efforts excessifs sur les volets et leurs rails — inspection structurelle obligatoire après le vol.','Alarme « OVERSPEED » ; l\'avion cabre brusquement (augmentation soudaine de portance).','Risque de blocage ou d\'asymétrie des volets : roulis non commandé.']);
rule(['flapL','b-flap'],n=>{ const name=typeof n==='number'?(A.flaps[n]||{}).n:n; return air()&&String(name)==='0'&&S.flap>0&&V()<(AL()?195:150)&&aglFt()<4000; },
  ['Rentrer les volets trop tôt',()=>`Les volets se rentrent par étapes, une fois la vitesse « F » puis « S » atteinte (≈ 210 kt sur A320). Vous n'êtes qu'à ${Math.round(V())} kt.`],
  ()=>['La portance chute d\'un coup : l\'avion s\'enfonce.','Près du sol, risque de décrochage (alarme « STALL ») et de perte de hauteur dangereuse.']);
/* ---- pressurisation, oxygène ---- */
rule('manVs',n=>n==='UP'&&air()&&A_()>10000,['Ouvrir la vanne de pressurisation en croisière',()=>`La commande manuelle MAN V/S ne sert qu'après une double panne du système automatique. Vers le haut, elle ouvre la vanne de sortie (outflow) : à ${Math.round(A_()).toLocaleString('fr-FR')} ft, c'est une dépressurisation.`],
  ()=>['L\'air de la cabine s\'échappe : l\'altitude cabine monte rapidement.','Alarme « CAB PR EXCESS CAB ALT » vers 9 550 ft cabine ; les masques passagers tombent vers 14 000 ft cabine.','Hypoxie : à FL350 le temps de conscience utile n\'est que de 30 s à 1 min — masques équipage immédiatement.','Descente d\'urgence obligatoire vers 10 000 ft (ou l\'altitude de sécurité) ; froid, buée, douleurs d\'oreilles.'],{fx:()=>{ try{ failSet('depress',true); }catch(e){} }});
rule('cpMode',n=>n===true&&air()&&A_()>10000&&!fail('depress'),['Pressurisation en mode manuel sans panne','Le mode MAN n\'est utilisé qu\'après la panne des deux régulateurs. En croisière, c\'est au pilote de tenir l\'altitude cabine à la main.'],
  ()=>['Plus de régulation automatique : chaque mouvement de MAN V/S change la pression cabine.','Risque de dépressurisation ou de surpression si la commande est mal tenue.']);
rule('ditch',n=>n===true&&air()&&A_()>3000,['DITCHING n\'est prévu qu\'avant un amerrissage','Ce bouton ferme toutes les vannes sous le plancher (vanne de sortie, ventilation) pour limiter l\'entrée d\'eau.'],
  ()=>['La vanne de sortie se ferme : la pression cabine monte jusqu\'aux soupapes de sécurité, inconfort pour les oreilles.','Plus de ventilation des soutes et de l\'avionique : échauffement des équipements.']);
rule('ramAir',n=>n===true&&air()&&A_()>10000&&!fail('pack1'),['RAM AIR en croisière','RAM AIR sert à ventiler la cabine après la perte des deux packs ou une fumée, sous 10 000 ft.'],
  ()=>['La vanne ne s\'ouvre que si la différence de pression est inférieure à 1 psi : en croisière pressurisée, elle reste sans effet.','Si elle s\'ouvrait, l\'air de la cabine s\'échapperait : dépressurisation.']);
rule('oxyPax',n=>n===true&&air()&&!fail('depress'),['Faire tomber les masques sans dépressurisation','Les masques passagers ne se déclenchent manuellement que si la cabine dépasse 14 000 ft et qu\'ils ne sont pas tombés tout seuls.'],
  ()=>['Les masques tombent dans toute la cabine : stress, panique possible.','Les générateurs chimiques ne durent que 12 à 15 min : plus d\'oxygène disponible pour une vraie urgence.','Atterrissage dès que possible pour remettre l\'avion en état.']);
/* ---- moteurs ---- */
['master1','master2'].forEach((id,k)=>rule(id,n=>n===false&&air()&&!fail('eng'+(k+1))&&!fail('fire'+(k+1))&&!fail('dualEng'),[`Couper le moteur ${k+1} en vol`,'Un moteur ne se coupe en vol que sur procédure ECAM (feu, dommage grave, vibrations), après confirmation des deux pilotes.'],
  ()=>['Perte de la moitié de la poussée : l\'avion ne peut plus tenir la croisière et doit redescendre (drift-down, ≈ FL200–FL250 sur un moteur).',`Perte de la génératrice ${k+1} et du circuit hydraulique associé (${k?'jaune':'vert'}).`,'Dissymétrie de poussée : l\'avion lacet vers le moteur coupé, il faut compenser au palonnier / trim.','Déroutement vers l\'aéroport adapté le plus proche (« LAND ASAP »).']));
['fire1','fire2'].forEach((id,k)=>rule(id,n=>air()&&!fail('fire'+(k+1)),[`Bouton FEU du moteur ${k+1} sans feu`,'Ce bouton isole le moteur : carburant, hydraulique, génératrice et prélèvement d\'air coupés. Il ne s\'utilise que sur alarme ENG FIRE.'],
  ()=>['Le moteur s\'arrête et ne peut plus être rallumé normalement en vol.','Perte de poussée, de génératrice et d\'hydraulique de ce côté.','Déroutement immédiat.']));
['ag11','ag12','ag21','ag22','agA'].forEach(id=>rule(id,n=>!fail(id[2]==='A'?'apuFire':'fire'+id[2]),['Percuter un extincteur sans feu','Les agents extincteurs ne se déclenchent que sur un feu confirmé, dans l\'ordre de la procédure (AGENT 1, puis AGENT 2 après 30 s si le feu persiste).'],
  ()=>['La bouteille est vidée : plus de protection si un vrai feu se déclare.','Avion immobilisé au sol pour remplacer la bouteille.']));
rule(['thrSel'],n=>n==='TOGA'&&air()&&A_()>20000,['Poussée maximale (TOGA) en croisière','TOGA est réservée au décollage et à la remise des gaz. En croisière, la poussée est gérée sur CL par l\'automanette.'],
  ()=>['Survitesse en quelques dizaines de secondes : dépassement de VMO 350 kt / MMO M0,82, alarme « OVERSPEED ».','Usure accélérée des moteurs, consommation très élevée.']);
rule(['thrSel'],n=>n==='IDLE'&&!air()&&ad().gs>40&&S.thr>0.6,['Réduire au ralenti pendant la course au décollage','Avant V1, réduire = décollage interrompu (sur décision du commandant). Après V1, on décolle quoi qu\'il arrive.'],
  ()=>['Décollage interrompu : freinage automatique maximal, inverseurs.',ad().gs>130?'Au-delà de V1, la piste restante ne suffit plus pour s\'arrêter : sortie de piste.':'Freins très chauds : risque de pneus dégonflés (fusibles thermiques), attente avant un nouveau départ.']);
rule(['thrSel'],n=>n==='REV'&&air(),['Inverseurs de poussée en vol','Les inverseurs ne fonctionnent qu\'au sol, après le toucher des roues.'],null,{no:true});
['thr1','thr2'].forEach(id=>rule(id,n=>n==='CUTOFF'&&air(),['Couper l\'alimentation d\'un réacteur en vol','La manette sur CUTOFF arrête le réacteur : seulement sur procédure de panne.'],
  ()=>['Le réacteur s\'éteint : moitié de la poussée perdue, descente obligatoire, déroutement.','Perte de la génératrice associée.']));
/* ---- électricité, systèmes ---- */
['bat1','bat2'].forEach(id=>rule(id,n=>n===false&&air()&&fw(),['Batterie hors circuit en vol','Les batteries restent sur AUTO pendant tout le vol : elles sont le dernier secours électrique.'],
  ()=>['Si les génératrices tombent ensuite, plus de secours immédiat : écrans noirs jusqu\'à la sortie de l\'éolienne de secours (RAT).','Perte de la recharge et de la surveillance batterie.']));
['gen1','gen2','apuGen'].forEach(id=>rule(id,n=>n===false&&air()&&AL()&&!fail(id),['Génératrice coupée en vol sans panne','Une génératrice ne se coupe que sur procédure (panne, surchauffe IDG).'],
  ()=>['Une source électrique en moins : délestage automatique d\'équipements (cabine, office).','Si la seconde génératrice tombe : configuration de secours (ELEC EMER CONFIG).']));
['idg1','idg2'].forEach(id=>rule(id,n=>n===true&&!fail('idg1'),['Déconnecter l\'IDG sans panne','La déconnexion de l\'IDG est irréversible en vol : elle ne se fait que sur alarme IDG (pression ou température d\'huile).'],
  ()=>['La génératrice correspondante est perdue jusqu\'à la maintenance au sol (réenclenchement uniquement moteur arrêté).','Exploitation suivante possiblement interdite (MEL).']));
['ir1','ir2','ir3'].forEach(id=>rule(id,n=>n==='OFF'&&air(),['Éteindre une centrale inertielle en vol','Les IR restent sur NAV pendant tout le vol ; l\'alignement n\'est possible qu\'avion immobile au sol.'],
  ()=>['L\'écran correspondant perd attitude, cap et position (drapeaux rouges ATT, HDG).','Impossible de la réaligner en vol : au mieux le mode ATT, avec un cap à entrer à la main.']));
['fpL1','fpL2','fpC1','fpC2','fpR1','fpR2'].forEach(id=>rule(id,n=>n===false&&air()&&AL(),['Couper une pompe carburant en vol','Les pompes restent sur AUTO ; on ne les coupe que sur procédure (fuite, déséquilibre).'],
  ()=>['Si les deux pompes d\'un réservoir sont coupées, le moteur est alimenté par gravité : risque d\'extinction en altitude.','Le carburant de ce réservoir n\'est plus utilisé : déséquilibre et carburant inutilisable.']));
['elac1','elac2','sec1','sec2','sec3','fac1','fac2'].forEach(id=>rule(id,n=>n===false&&air()&&AL(),['Couper un calculateur de commandes de vol','ELAC, SEC et FAC restent en marche ; on ne les réinitialise que sur procédure ECAM.'],
  ()=>['Perte d\'une partie des commandes de vol et de leurs redondances.','Avec deux ELAC coupés : loi de pilotage « alternate », les protections (décrochage, survitesse, inclinaison) disparaissent.']));
['hydG','hydY','hydB'].forEach(id=>rule(id,n=>n===false&&air()&&AL(),['Couper une pompe hydraulique en vol','Les pompes hydrauliques alimentent gouvernes, train, freins et volets : on ne les coupe que sur fuite ou surchauffe.'],
  ()=>['Perte de pression du circuit concerné : gouvernes, volets, train ou freins associés moins efficaces ou perdus.','Distance d\'atterrissage augmentée.']));
rule(['xpdr'],n=>n==='STBY'&&air(),['Transpondeur en veille en vol','Le transpondeur reste sur AUTO / ON pendant tout le vol.'],
  ()=>['Le contrôle ne voit plus votre identification ni votre altitude sur le radar.','Le TCAS des autres avions ne vous détecte plus : risque de collision.']);
rule(['tcas'],n=>n==='STBY'&&air(),['TCAS en veille en vol','Le TCAS (anticollision) reste sur TA/RA en vol.'],()=>['Plus aucune alerte de trafic ni ordre d\'évitement : risque de collision en vol.']);
['gpwsSys','gpwsTerr','gpwsT','gpwsS'].forEach(id=>rule(id,n=>n===false&&air(),['Couper l\'avertisseur de proximité du sol','Le GPWS / TERR reste actif ; il ne s\'inhibe que sur procédure (fausse alarme confirmée).'],()=>['Plus d\'alarme « TERRAIN, PULL UP » : un rapprochement dangereux du relief ne serait plus signalé.']));
rule(['pbrake'],n=>n===true&&air(),['Frein de parc en vol','Le frein de parc ne se serre qu\'avion arrêté au sol.'],()=>['Au toucher des roues, roues bloquées : pneus éclatés, sortie de piste possible.']);
rule(['door'],n=>n==='UNLOCK'&&air(),['Ouvrir la porte du poste sans identification','On n\'autorise l\'accès qu\'après avoir identifié la personne (caméra, interphone) ; sinon on laisse NORM ou on sélectionne LOCK.'],
  ()=>['Intrusion possible dans le poste de pilotage : c\'est pour l\'empêcher que la porte est blindée.']);
rule(['apuMaster'],n=>n===false&&!air()&&!S.eng.some(Boolean)&&!SYS.extPwr,['Couper l\'APU sans autre source','Moteurs arrêtés et sans groupe de parc, l\'APU est la seule source d\'électricité et d\'air.'],()=>['Plus d\'électricité ni de climatisation : retour sur batteries, écrans éteints, cabine qui chauffe.']);
/* ---- hélicoptères ---- */
rule(['rbrake'],n=>n==='ON'&&air(),['Frein rotor en vol','Le frein rotor ne s\'utilise qu\'au sol, moteur coupé, sous un régime rotor faible.'],()=>['Freiner le rotor en vol arrêterait la sustentation : destruction de la transmission et chute.'],{no:true});
['fuelSO','fsv1','fsv2'].forEach(id=>rule(id,n=>n==='CLOSED'&&air(),['Fermer le robinet carburant en vol','Le robinet carburant reste ouvert pendant tout le vol ; il ne se ferme que sur feu moteur ou à l\'arrêt.'],
  ()=>['Le moteur s\'arrête faute de carburant.','Sur hélicoptère monomoteur : autorotation immédiate (baisser le pas général) et atterrissage forcé.']));
rule(['mix'],n=>n==='OFF'&&air(),['Mélange sur OFF en vol','La mixture coupe l\'arrivée d\'essence : elle ne se tire qu\'à l\'arrêt du moteur.'],()=>['Le moteur s\'arrête : autorotation immédiate et atterrissage forcé.']);
rule(['clutch'],n=>n==='DISENGAGE'&&air(),['Débrayer en vol','L\'embrayage relie le moteur au rotor : il reste engagé de la mise en route à l\'arrêt.'],()=>['Le rotor n\'est plus entraîné : autorotation obligatoire, risque de survitesse moteur.']);
rule(['mag'],n=>n==='OFF'&&air(),['Magnétos sur OFF en vol','Les magnétos restent sur BOTH en vol.'],()=>['Plus d\'allumage : le moteur s\'arrête, autorotation immédiate.']);
['ecl1','ecl2'].forEach(id=>rule(id,n=>n==='OFF'&&air(),['Couper un moteur (ECL) en vol','Le levier ECL reste sur FLY en vol ; OFF seulement sur procédure de panne.'],()=>['Un moteur perdu : puissance réduite, vol stationnaire impossible à masse élevée, atterrissage dès que possible.']));
rule(['twist'],n=>n==='IDLE'&&air(),['Poignée tournante au ralenti en vol','La poignée reste sur FLIGHT en vol ; IDLE sert à l\'entraînement à l\'autorotation avec instructeur.'],()=>['La puissance chute : le rotor ralentit, autorotation nécessaire.']);
rule(['gov'],n=>n===false&&air(),['Couper le régulateur en vol','Le régulateur (governor) tient le régime rotor automatiquement.'],()=>['Le régime rotor varie à chaque mouvement du pas : charge de travail élevée, risque de sous-régime.']);

/* ---------- intercepteur ---------- */
const css=document.createElement('style'); css.textContent=`
.gfr{position:fixed;z-index:62;pointer-events:none;border-radius:8px}.gfr.y{border:4px solid #ffd400;box-shadow:0 0 0 3px #0008,0 0 22px #ffd400;animation:gblink .5s steps(2) infinite}.gfr.r{border:4px solid #ff2b2b;box-shadow:0 0 0 3px #0008,0 0 24px #ff2b2b}
@keyframes gblink{50%{border-color:transparent;box-shadow:none}}
#gdlg{position:fixed;left:50%;bottom:10px;transform:translateX(-50%);z-index:63;width:min(560px,calc(100vw - 16px));max-height:70vh;overflow:auto;border-radius:14px;padding:12px 14px;color:#fff;font:15px/1.45 'Inter',system-ui,sans-serif;box-shadow:0 10px 40px #000c}
#gdlg.y{background:#2a2300f5;border:3px solid #ffd400}#gdlg.r{background:#2a0606f5;border:3px solid #ff2b2b}
#gdlg .k{font:700 13px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase}#gdlg.y .k{color:#ffd400}#gdlg.r .k{color:#ff6a5a}
#gdlg h3{font:700 21px 'Barlow Condensed',sans-serif;margin:3px 0 6px}#gdlg ul{margin:6px 0;padding-left:20px}#gdlg li{margin:4px 0}
#gdlg .b{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}#gdlg button{border-radius:9px;padding:9px 13px;font:700 14px 'Barlow Condensed',sans-serif;letter-spacing:.05em;text-transform:uppercase;cursor:pointer;border:1px solid #fff4;background:#132232;color:#fff}
#gdlg .ok{background:#1f6b3a;border-color:#3ddc84}#gdlg .force{background:#5a1010;border-color:#ff4a3d}`;
document.head.appendChild(css);
let frame=null, dlg=null, pass=false;
function clear(){ if(frame){ frame.remove(); frame=null; } if(dlg){ dlg.remove(); dlg=null; } clearInterval(clear.t); }
function frameOn(el,cls){ if(frame) frame.remove(); frame=document.createElement('div'); frame.className='gfr '+cls; document.body.appendChild(frame);
  const pos=()=>{ if(!frame) return; const b=(el.closest('.sw')||el).getBoundingClientRect(); frame.style.display=b.width>2&&b.height>2?'':'none'; Object.assign(frame.style,{left:(b.left-6)+'px',top:(b.top-6)+'px',width:(b.width+12)+'px',height:(b.height+12)+'px'}); }; pos(); clearInterval(clear.t); clear.t=setInterval(pos,200); }
const val=(x,n)=>typeof x==='function'?x(n):x;
function expected(el){ try{ if(!GD.on) return false; const st=GD.steps[GD.i]; if(!st) return false; return st.items.some(it=>{ if(!it[3]) return false; try{ if(it[1]()) return false; }catch(e){} const t=PT.el(it[3]); return t&&(t===el||t.contains(el)||el.contains(t)); }); }catch(e){ return false; } }
function show(rl,n,el,apply){ clear(); try{ SND.play('caution'); }catch(e){} frameOn(el,'y'); dlg=document.createElement('div'); dlg.id='gdlg'; dlg.className='y';
  dlg.innerHTML=`<div class="k">⚠ Action incohérente avec la procédure</div><h3>${rl.y[0]}</h3><p>${val(rl.y[1],n)}</p><div class="b"><button type="button" class="ok" data-c>✓ Annuler (recommandé)</button>${rl.no?'':'<button type="button" class="force" data-f>Le faire quand même ⚠</button>'}</div>`;
  document.body.appendChild(dlg);
  dlg.querySelector('[data-c]').onclick=()=>{ clear(); try{ ovhSync(); pedSync(); a320Sync(); }catch(e){} };
  const f=dlg.querySelector('[data-f]'); if(f) f.onclick=()=>{ pass=true; try{ apply(); }catch(e){} pass=false; if(rl.fx) try{ rl.fx(); }catch(e){}
    try{ if(window.EXAM&&EXAM.on){ EXAM.res[GD.i]='ko'; (EXAM.det[GD.i]=EXAM.det[GD.i]||[]).push({what:'Action dangereuse : '+rl.y[0],why:val(rl.y[1],n)}); } }catch(e){}
    frameOn(el,'r'); try{ SND.play('warning'); }catch(e){} const cons=val(rl.r,n)||[];
    dlg.className='r'; dlg.innerHTML=`<div class="k">⛔ Conséquences de votre décision</div><h3>${rl.y[0]}</h3><ul>${cons.map(c=>`<li>${c}</li>`).join('')}</ul><div class="b"><button type="button" data-k>J'ai compris</button></div>`;
    dlg.querySelector('[data-k]').onclick=clear; }; }
function check(id,n,el,apply){ if(pass||expected(el)) return false; const rl=R.find(r=>r.ids.includes(id)&&(()=>{ try{ return r.bad(n,el); }catch(e){ return false; } })()); if(!rl) return false; show(rl,n,el,apply); return true; }
addEventListener('click',e=>{ if(pass||window.MANON) return; const el=e.target.closest('button[data-sw],button[data-pd],#b-gear,#b-flap'); if(!el) return;
  let id, n; if(el.id==='b-gear'){ id='b-gear'; n=!S.gear; } else if(el.id==='b-flap'){ id='b-flap'; n=S.flap>=A.flaps.length-1?0:S.flap+1; }
  else if(el.dataset.sw){ id=el.dataset.sw; n=!SYS[id]; if(el.dataset.t==='pb'&&el.dataset.dl==='OFF') n=!n; }   // boutons « cockpit sombre » : voyant OFF allumé = système coupé else { id=el.dataset.pd; n=id==='pbrake'?!S.pbrake:!(typeof pedGet==='function'?pedGet(id):SYS[id]); }
  if(check(id,n,el,()=>el.click())){ e.stopImmediatePropagation(); e.preventDefault(); } },true);
addEventListener('change',e=>{ if(pass||window.MANON) return; const el=e.target; if(el.tagName!=='SELECT') return; const id=el.dataset.sw||el.dataset.pd; if(!id) return; const n=id==='gearL'?el.value==='DOWN':el.value;
  if(check(id,n,el,()=>{ el.value=typeof n==='boolean'?(n?'DOWN':'UP'):n; el.dispatchEvent(new Event('change',{bubbles:true})); })){ e.stopImmediatePropagation(); try{ ovhSync(); pedSync(); a320Sync(); }catch(x){} } },true);
// raccourci clavier G (train)
addEventListener('keydown',e=>{ if(pass||e.repeat) return; if((e.key==='g'||e.key==='G')&&!/INPUT|TEXTAREA|SELECT/.test((document.activeElement||{}).tagName||'')){ const b=$('b-gear'); if(b&&check('b-gear',!S.gear,b,()=>{ pass=true; toggleGear(); pass=false; })){ e.stopImmediatePropagation(); e.preventDefault(); } } },true);
window.GUARD={rules:R,clear};
})();
