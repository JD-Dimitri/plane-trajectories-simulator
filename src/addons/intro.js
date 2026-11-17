/* ===== INTRODUCTION AU PROJET + TEST DE POSITIONNEMENT (non bloquant) =====
   Affichée au premier lancement, avant le simulateur, puis accessible à tout moment (bouton « 📘 Introduction »).
   1. Pourquoi ce projet, ce qu'il contient, ce qu'il n'est pas.
   2. Comment étudier les contenus dans le bon ordre (parcours conseillé).
   3. Test de positionnement facultatif : 10 questions de mathématiques (prérequis des calculs) et 6 de culture aéronautique.
      Le résultat propose un parcours adapté ; il ne verrouille rien : le simulateur reste accessible à tout moment. */
(function(){
const K='sim-intro', ACI=id=>{ try{ const all=ACAD.PARTS.flatMap(p=>p.mods); return all.findIndex(m=>m.id===id); }catch(e){ return -1; } }, PI=pid=>{ try{ const p=ACAD.PARTS.find(x=>x.id===pid); return ACAD.PARTS.flatMap(x=>x.mods).indexOf(p.mods[0]); }catch(e){ return -1; } };
const MATH=[
 ['Un avion consomme 66 kg de carburant en 3 h. Combien en 1 h 30 ?',['33 kg','22 kg','44 kg','99 kg'],0,'Proportionnalité : 66 / 3 × 1,5 = 33 kg. C\'est le calcul du carburant d\'étape.'],
 ['Combien font 5 % de 4 200 ?',['210','21','420','2 100'],0,'4 200 × 5 / 100 = 210. C\'est la réserve de route d\'un avion de ligne.'],
 ['2 h 15 min, en heures décimales :',['2,25 h','2,15 h','2,5 h','2,75 h'],0,'15 min = 15/60 = 0,25 h.'],
 ['120 km parcourus en 40 min : vitesse ?',['180 km/h','120 km/h','160 km/h','300 km/h'],0,'120 / 40 × 60 = 180 km/h.'],
 ['15 − 2 × 3 =',['9','39','−21','11'],0,'La multiplication passe avant la soustraction.'],
 ['Température 5 °C, puis elle baisse de 12 °C :',['−7 °C','7 °C','−17 °C','17 °C'],0,'5 − 12 = −7. Les températures en altitude sont souvent négatives.'],
 ['On tourne de 30° vers la droite depuis le cap 350° :',['020°','380°','320°','030°'],0,'350 + 30 = 380, soit 380 − 360 = 020° : les caps tournent en rond de 000 à 359.'],
 ['sin 30° vaut :',['0,5','0,3','0,87','1'],0,'sin 30° = 0,5 ; on s\'en sert pour la composante de vent traversier.'],
 ['2 kg posés à 1 m et 2 kg posés à 3 m d\'un repère : où est le centre de gravité ?',['À 2 m','À 1 m','À 3 m','À 4 m'],0,'(2 × 1 + 2 × 3) / 4 = 2 m. C\'est le calcul du centrage.'],
 ['La racine carrée de 1,21 vaut :',['1,1','0,11','1,21','11'],0,'1,1 × 1,1 = 1,21. Elle sert pour la vitesse de décrochage en virage.']];
const AERO=[
 ['Un mille nautique (NM) mesure :',['1 852 m','1 000 m','1 609 m','3 048 m'],0,'1 NM = 1 852 m ; c\'est une minute d\'arc de latitude.'],
 ['Les quatre forces en vol :',['Portance, poids, traction, traînée','Portance, vitesse, cap, altitude','Moteur, ailes, train, gouvernes','Vent, pression, température, densité'],0,'En vol stabilisé : portance = poids, traction = traînée.'],
 ['À quoi servent les volets ?',['Voler plus lentement au décollage et à l\'atterrissage','Freiner au sol uniquement','Diriger l\'avion en virage','Refroidir les moteurs'],0,'Ils augmentent la portance à basse vitesse (et la traînée).'],
 ['Un METAR est :',['Une observation météo d\'aérodrome','Un plan de vol','Une carte d\'approche','Un instrument'],0,'Il donne vent, visibilité, nuages, température, QNH.'],
 ['Le cap 270° correspond à :',['L\'ouest','Le nord','L\'est','Le sud'],0,'000 nord, 090 est, 180 sud, 270 ouest.'],
 ['Pourquoi l\'altimètre doit-il être calé (QNH) ?',['La pression au sol change avec la météo','Pour régler la vitesse','Pour la radio','Il n\'a pas besoin de réglage'],0,'L\'altimètre est un baromètre : sans calage, il peut se tromper de centaines de pieds.']];
const CSS=`#intro{position:fixed;inset:0;z-index:95;background:#071019;overflow:auto;color:#e8eef2;font:15px/1.55 Inter,sans-serif}#intro .w{max-width:780px;margin:0 auto;padding:18px 16px 40px}
#intro h1{font:700 30px 'Barlow Condensed',sans-serif;letter-spacing:.04em;margin:6px 0}#intro h2{font:700 20px 'Barlow Condensed',sans-serif;letter-spacing:.06em;color:#3fd0ff;margin:22px 0 6px}#intro .tp{display:flex;gap:8px;flex-wrap:wrap;margin:14px 0}
#intro button{font:600 14px Inter,sans-serif;border-radius:10px;padding:10px 14px;border:1px solid #2b3d50;background:#11202e;color:#fff;cursor:pointer}#intro button.p{background:#e04ad8;border-color:#e04ad8}#intro button.g{background:#16a34a;border-color:#16a34a}
#intro .card{background:#0d1a26;border:1px solid #2b3d50;border-radius:12px;padding:12px 14px;margin:10px 0}#intro ol li,#intro ul li{margin:4px 0}#intro .op{display:block;width:100%;text-align:left;margin:6px 0}#intro .op.ok{background:#14532d;border-color:#22c55e}#intro .op.ko{background:#4c0519;border-color:#f43f5e}
#intro .skip{position:sticky;top:0;display:flex;justify-content:flex-end;gap:8px;background:#071019;padding:8px 0;z-index:2}#intro small{color:#9fb1c1}`;
function el(){ let d=document.getElementById('intro'); if(!d){ const st=document.createElement('style'); st.textContent=CSS; document.head.appendChild(st); d=document.createElement('div'); d.id='intro'; document.body.appendChild(d);
  d.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b) return; const a=b.dataset;
   if(a.x!=null) return close(); if(a.test!=null) return test(0,[]); if(a.home!=null) return home(); if(a.ac!=null){ close(); try{ const i=a.ac.startsWith('p')?PI(a.ac):ACI(a.ac); ACAD.open(i>=0?i:undefined); }catch(er){} return; }
   if(a.sim!=null){ close(); return; } if(a.qi!=null) answer(+a.qi); if(a.next!=null) test(T.i+1,T.ans); }); } return d; }
function close(){ const d=document.getElementById('intro'); if(d) d.hidden=true; try{ localStorage.setItem(K,'1'); }catch(e){} }
function home(){ const d=el(); d.hidden=false; d.scrollTop=0; d.innerHTML=`<div class="w"><div class="skip"><button type="button" data-sim>Passer et aller au simulateur ✈</button></div>
 <h1>✈ PLANE TRAJECTORIES · Introduction</h1><small>À lire avant d'aborder le simulateur et les cours (≈ 5 min). Vous pourrez la rouvrir à tout moment avec le bouton « 📘 Introduction ».</small>
 <h2>Pourquoi ce projet ?</h2><p>Comprendre comment vole réellement un avion, du dossier de vol préparé au sol jusqu'au parking d'arrivée, sans avoir besoin d'un simulateur coûteux ni d'un cockpit. Le projet est <b>pédagogique</b> : faire découvrir le métier de pilote, donner les bases théoriques, et pourquoi pas faire naître des vocations. Il suit les procédures, les textes et les ordres de grandeur réels (EASA, DGAC, OACI, manuels publics), en signalant toujours ce qui est simplifié ou estimé.</p>
 <div class="card"><b>Ce que le projet n'est pas</b> : un simulateur certifié, un cours agréé ou un manuel de vol. Il ne remplace ni une école de pilotage, ni un instructeur, ni les documents officiels de l'avion. Les valeurs chiffrées sont des ordres de grandeur.</div>
 <h2>Ce qu'il contient</h2><ul><li><b>Sept appareils</b> : Airbus A320, Boeing 777, Learjet 60, Cessna 172 (avion école), hélicoptères H125, R44 et S-76.</li>
 <li><b>Des parcours guidés</b> : chaque vol est découpé en étapes numérotées (préparation, visite de l'avion, mise en route, roulage, décollage, croisière, approche, atterrissage), avec des actions qui se cochent quand vous les faites, et un mode automatique pour regarder le vol entier.</li>
 <li><b>Les documents de vol</b> (dossier, devis de masse, carburant, log de navigation, manifeste), modifiables et téléchargeables en PDF ou Word.</li>
 <li><b>L'Académie</b> : 7 parties de cours, du débutant à la théorie du brevet de pilote (PPL) et aux calculs, avec des QCM.</li>
 <li><b>Des scénarios</b> de pannes et d'urgences, et l'atelier des systèmes de chaque appareil.</li></ul>
 <h2>Comment étudier efficacement</h2><ol>
 <li><b>Découvrir</b> : lancez un parcours en mode automatique et regardez le vol entier une première fois, sans chercher à tout comprendre.</li>
 <li><b>Les bases</b> : Académie partie 1 (cours débutant) puis partie 2 (le simulateur). Vocabulaire, forces du vol, instruments.</li>
 <li><b>Piloter guidé</b> : refaites le parcours en mode guidé, en réalisant vous-même chaque action. Commencez par le Cessna 172 (simple) ou l'A320 (le plus complet).</li>
 <li><b>La théorie</b> : partie 6 (les 9 matières du brevet PPL) et partie 5 (structures, moteurs, systèmes).</li>
 <li><b>Les calculs</b> : partie 7. Elle demande un bagage minimal en mathématiques (proportionnalité, pourcentages, conversions, angles, sinus et cosinus). C'est elle qui permet de remplir les documents de vol vous-même.</li>
 <li><b>Les urgences</b> : scénarios de pannes, puis examen blanc et QCM par matière.</li></ol>
 ${lastGauge()}<div class="card"><b>Où en êtes-vous ?</b> Un test de 16 questions (≈ 5 min) indique si vous pouvez aborder directement les calculs, ou par quoi commencer. <b>Il est facultatif et ne bloque rien</b> : le simulateur et tous les cours restent accessibles quel que soit le résultat.
 <div class="tp"><button type="button" class="p" data-test>▶ Faire le test de positionnement</button><button type="button" data-sim>Plus tard : aller au simulateur</button><button type="button" data-ac="p1">Ouvrir l'Académie</button></div></div>
 <small>Aucune donnée n'est envoyée : le résultat reste sur cet appareil.</small></div>`; }
const T={i:0,ans:[]}, ALL=()=>[...MATH.map(q=>q.concat('m')),...AERO.map(q=>q.concat('a'))];
function test(i,ans){ T.i=i; T.ans=ans; const Qs=ALL(); if(i>=Qs.length) return result(); const q=Qs[i], d=el(); d.scrollTop=0;
 d.innerHTML=`<div class="w"><div class="skip"><button type="button" data-home>← Introduction</button><button type="button" data-sim>Arrêter et aller au simulateur ✈</button></div>
  <h2>Test de positionnement · ${i+1} / ${Qs.length} <small>· ${q[4]==='m'?'mathématiques utiles aux calculs':'culture aéronautique'}</small></h2><div class="card"><p><b>${q[0]}</b></p>${q[1].map((o,j)=>`<button type="button" class="op" data-qi="${j}">${o}</button>`).join('')}<div id="iq-why"></div></div>
  <div style="display:flex;justify-content:space-between"><small>Progression du test</small><small>${Math.round(i/Qs.length*100)} %</small></div><div class="ig" style="height:10px;background:#1c2b3a;border-radius:5px"><div style="height:10px;width:${Math.round(i/Qs.length*100)}%;background:#3fd0ff;border-radius:5px;transition:width .4s"></div></div></div>`; }
function answer(j){ const Qs=ALL(), q=Qs[T.i], d=el(); if(T.ans.length>T.i) return; T.ans.push(j===q[2]?1:0);
 d.querySelectorAll('.op').forEach((b,k)=>{ b.disabled=true; if(k===q[2]) b.classList.add('ok'); else if(k===j) b.classList.add('ko'); });
 d.querySelector('#iq-why').innerHTML=`<p>${j===q[2]?'✓ Exact.':'✗ Pas tout à fait.'} ${q[3]}</p><button type="button" class="p" data-next>${T.i+1<Qs.length?'Question suivante →':'Voir mon résultat'}</button>`; }
// jauge de progression : barre remplie selon le score, seuil « prêt pour les calculs » marqué à 80 %
function gauge(lbl,v,n,seuil){ const pc=Math.round(v/n*100), col=pc>=80?'#22c55e':pc>=50?'#f59e0b':'#f43f5e';
 return `<div style="margin:10px 0"><div style="display:flex;justify-content:space-between"><b>${lbl}</b><b style="color:${col}">${v} / ${n} · ${pc} %</b></div>
 <div class="ig" style="position:relative;height:16px;background:#1c2b3a;border-radius:8px;margin-top:4px;overflow:hidden"><div style="height:16px;width:${pc}%;background:${col};border-radius:8px;transition:width .8s"></div>${seuil?`<div title="seuil" style="position:absolute;top:0;bottom:0;left:${seuil}%;width:2px;background:#fff"></div>`:''}</div>
 ${seuil?`<small>Trait blanc : seuil conseillé (${seuil} %) pour aborder les calculs.</small>`:''}</div>`; }
function lastGauge(){ try{ const r=JSON.parse(localStorage.getItem('sim-level')||'null'); if(!r) return ''; return `<div class="card"><b>Votre dernier positionnement</b>${gauge('Mathématiques',r.m,MATH.length,80)}${gauge('Culture aéronautique',r.a,AERO.length)}${gauge('Global',r.m+r.a,MATH.length+AERO.length)}</div>`; }catch(e){ return ''; } }
function result(){ const m=T.ans.slice(0,MATH.length).reduce((s,x)=>s+x,0), a=T.ans.slice(MATH.length).reduce((s,x)=>s+x,0), d=el(); d.scrollTop=0;
 try{ localStorage.setItem('sim-level',JSON.stringify({m,a,t:Date.now()})); }catch(e){}
 const mOK=m>=8, mMid=m>=5&&m<8, aOK=a>=5;
 const rec=[]; if(!aOK) rec.push(['p1','Commencer par l\'Académie partie 1 : cours débutant (vocabulaire, forces, instruments)']); else rec.push(['p2','Revoir rapidement la partie 2 : le cours théorique du simulateur']);
 if(mOK) rec.push(['p7','Vous pouvez aborder directement la partie 7 : les calculs aéronautiques']); else if(mMid) rec.push(['c1','Partie 7 : commencer par les modules 1 à 3 (unités, atmosphère, vitesses), en refaisant les exemples à la main']); else rec.push(['c1','Avant les calculs : revoir la proportionnalité, les pourcentages et les conversions (module 1 de la partie 7), puis revenir au test']);
 rec.push(['p6','Théorie du brevet de pilote (PPL) : partie 6, une matière à la fois']);
 d.innerHTML=`<div class="w"><div class="skip"><button type="button" data-home>← Introduction</button></div><h1>Votre positionnement</h1>
  <div class="card">${gauge('Mathématiques utiles aux calculs',m,MATH.length,80)}${gauge('Culture aéronautique',a,AERO.length)}${gauge('Niveau global',m+a,MATH.length+AERO.length)}</div>
  <div class="card"><p><b>Mathématiques : </b>${mOK?'bagage suffisant pour la partie 7.':mMid?'bases présentes : abordez les calculs progressivement, avec les exemples.':'quelques révisions de calcul vous rendront la partie 7 beaucoup plus facile.'}</p>
  <p><b>Culture aéronautique : </b>${aOK?'les bases sont là.':'commencez par le cours débutant : tout le reste s\'appuie dessus.'}</p></div>
  <h2>Parcours conseillé</h2>${rec.map(([id,t],i)=>`<div class="card">${i+1}. ${t}<div class="tp"><button type="button" data-ac="${id}">Ouvrir</button></div></div>`).join('')}
  <div class="card">Et dans tous les cas : <b>regardez un vol complet en mode automatique</b>, puis refaites-le en mode guidé. <div class="tp"><button type="button" class="g" data-sim>✈ Aller au simulateur</button><button type="button" data-test>Refaire le test</button></div></div>
  <small>Ce résultat est indicatif : il ne bloque aucun contenu.</small></div>`; }
window.INTRO={open:home,test:()=>{ el().hidden=false; test(0,[]); }};
// bouton dans la barre d'outils et dans le menu
function addBtns(){ const bar=document.getElementById('bar'), help=document.getElementById('b-help'); if(bar&&help&&!document.getElementById('b-intro')){ const b=document.createElement('button'); b.type='button'; b.id='b-intro'; b.textContent='📘 Introduction'; b.onclick=home; help.before(b); }
 const m=document.getElementById('menu'); if(m&&!m.hidden&&!document.getElementById('m-intro')){ const box=m.querySelector('.box')||m; const b=document.createElement('button'); b.type='button'; b.id='m-intro'; b.textContent='📘 Introduction au projet et test de niveau'; b.style.cssText='display:block;width:100%;margin:0 0 10px;padding:11px;border-radius:10px;border:1px solid #3fd0ff;background:#0d2232;color:#fff;font:600 14px Inter,sans-serif;cursor:pointer'; b.onclick=home; box.prepend(b); } }
setInterval(addBtns,800);
// premier lancement : l'introduction s'affiche avant le simulateur
let seen=false; try{ seen=localStorage.getItem(K)==='1'; }catch(e){ seen=true; } if(!seen) setTimeout(home,400);
})();
