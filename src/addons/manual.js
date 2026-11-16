/* ===== MODE D'EMPLOI DES INSTRUMENTS =====
   Bouton « ⓘ Mode d'emploi » : tant qu'il est actif, toucher un instrument, un bouton ou un écran N'ACTIONNE RIEN ;
   une fiche s'ouvre et répond, dans l'ordre :
   1) Quel est ce bouton / cet écran ?  2) Puis-je l'activer maintenant ?  3) Pourquoi je ne peux pas ?
   4) Que se passe-t-il si je l'active ?  5) À quelle étape du parcours il doit être activé (numéro d'étape, comme le guide).
   La liste numérotée suit l'ordre des étapes du parcours (même numérotation que le guide), puis les autres commandes et écrans. */
(function(){
const css=document.createElement('style'); css.textContent=`
#b-man.on{background:#0b5cad;border-color:#58a6ff;color:#fff}
body.manon [data-sw],body.manon [data-pd],body.manon [data-f],body.manon [data-mk],body.manon [data-ecp],body.manon #mcdu,body.manon #mcdu-init,body.manon #b-gear,body.manon #b-flap{cursor:help!important;outline:1px dashed #58a6ffaa;outline-offset:1px}
body.manon select[data-sw],body.manon select[data-pd]{pointer-events:none}
body.manon #ckc{cursor:help}
#manbar{position:fixed;left:50%;transform:translateX(-50%);bottom:8px;z-index:70;display:flex;gap:6px;align-items:center;flex-wrap:wrap;justify-content:center;background:#0b2340f2;border:2px solid #58a6ff;border-radius:12px;padding:6px 10px;color:#e8f1ff;font:600 13px 'Inter',sans-serif;max-width:calc(100vw - 16px)}
#manbar[hidden]{display:none}#manbar button{background:#132a44;color:#fff;border:1px solid #58a6ff88;border-radius:8px;padding:6px 10px;font:700 13px 'Barlow Condensed',sans-serif;letter-spacing:.05em;text-transform:uppercase;cursor:pointer}
#mancard{position:fixed;right:10px;bottom:62px;z-index:72;width:min(430px,calc(100vw - 20px));max-height:72vh;overflow:auto;background:#07121d;border:2px solid #58a6ff;border-radius:12px;color:#e8eef2;font:14px/1.45 'Inter',sans-serif;box-shadow:0 10px 40px #000a}
#mancard[hidden]{display:none}#mancard .hd{display:flex;gap:8px;align-items:flex-start;padding:10px 12px;border-bottom:1px solid #1d2f40}
#mancard .no{flex:none;background:#58a6ff;color:#041019;border-radius:8px;padding:2px 8px;font:800 16px 'Barlow Condensed',sans-serif}
#mancard .hd b{display:block;font:700 19px 'Barlow Condensed',sans-serif;letter-spacing:.03em}#mancard .hd small{color:#8fa4b8}
#mancard .hd>div{flex:1;min-width:0}#mancard .x{margin-left:auto;flex:none;background:none;border:0;color:#fff;font-size:22px;cursor:pointer;line-height:1}
#mancard .q{padding:8px 12px;border-bottom:1px solid #12202e}#mancard .q>i{display:block;font:700 12px 'Barlow Condensed',sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#8fb8e8;font-style:normal;margin-bottom:2px}
#mancard .ok{color:#7ff0a8;font-weight:700}#mancard .ko{color:#ff8a7a;font-weight:700}#mancard .wt{color:#ffd166;font-weight:700}
#mancard ul{margin:4px 0;padding-left:18px}#mancard li{margin:2px 0}#mancard .st{display:inline-block;background:#e04ad8;color:#fff;border-radius:6px;padding:0 6px;font:700 12px 'Barlow Condensed',sans-serif;margin-right:4px}
#mancard .ft{display:flex;gap:8px;flex-wrap:wrap;padding:10px 12px}#mancard .ft button{background:#132232;color:#fff;border:1px solid #2b3d50;border-radius:8px;padding:8px 12px;font:700 13px 'Barlow Condensed',sans-serif;letter-spacing:.05em;text-transform:uppercase;cursor:pointer}
#mancard .ft .go{background:#1f6b3a;border-color:#3ddc84}
#manlist{position:fixed;inset:0;z-index:74;background:#000b;display:flex;justify-content:center;align-items:flex-start;padding:10px;overflow:auto}#manlist[hidden]{display:none}
#manlist .w{width:min(680px,100%);background:#07121d;border:2px solid #58a6ff;border-radius:12px;color:#e8eef2;font:14px/1.4 'Inter',sans-serif;margin:auto 0}
#manlist .hd{display:flex;justify-content:space-between;align-items:center;padding:10px 12px;border-bottom:1px solid #1d2f40}#manlist .hd b{font:700 20px 'Barlow Condensed',sans-serif;letter-spacing:.06em}
#manlist .bd{padding:6px 12px;max-height:74vh;overflow:auto}#manlist h4{margin:10px 0 4px;font:700 13px 'Barlow Condensed',sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#8fb8e8}
#manlist .e{display:flex;gap:8px;align-items:baseline;width:100%;text-align:left;background:#0f1e2c;border:1px solid #1d2f40;border-radius:8px;color:#e8eef2;padding:6px 8px;margin:3px 0;cursor:pointer;font:14px 'Inter',sans-serif}
#manlist .e:hover{border-color:#58a6ff}#manlist .e .n{flex:none;min-width:30px;font:800 15px 'Barlow Condensed',sans-serif;color:#58a6ff}#manlist .e.done{color:#9ff0bf}#manlist .e.cur{outline:2px solid #e04ad8}
#manlist .e small{margin-left:auto;color:#8fa4b8;white-space:nowrap}#manlist .x{background:none;border:0;color:#fff;font-size:24px;cursor:pointer}`;
document.head.appendChild(css);
const $$=id=>document.getElementById(id), esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const AIR=()=>{ try{ return typeof AL==='function'&&AL(); }catch(e){ return false; } };

/* ---------- textes : écrans, FCU, MCDU, effets ---------- */
const SCR={
 pfd:['PFD — écran de pilotage principal','Horizon artificiel (assiette, inclinaison), bande de vitesse, bande d\'altitude, variomètre, cap et modes du pilote automatique (FMA en haut).','C\'est un écran de lecture : on ne le « touche » pas, on le regarde. Il se règle avec le bouton de luminosité et le calage altimétrique (QNH) sur l\'auvent.'],
 nd:['ND — écran de navigation','Route du plan de vol (ligne verte), cap, points, vent, météo radar et trafic (TCAS). Mode et échelle choisis sur le panneau EFIS.','Écran de lecture. On change ce qu\'il montre avec le sélecteur de mode (ROSE / ARC / PLAN) et d\'échelle.'],
 ewd:['E/WD — écran moteurs et alarmes','N1, EGT, N2, débit carburant, position des volets ; en bas, les messages d\'alarme ECAM et les check-lists à appliquer.','Écran de lecture ; les alarmes se gèrent avec le panneau ECAM (CLR, RCL, STS).'],
 sd:['SD — écran systèmes','Pages synoptiques : électricité, hydraulique, carburant, APU, prélèvements, portes, roues… La page change seule selon la phase de vol, ou avec les touches du panneau ECAM.','Écran de lecture : choisir la page avec les touches ENG, BLEED, ELEC, HYD, FUEL, APU… du panneau ECAM.'],
 isis:['ISIS — instrument de secours','Assiette, vitesse et altitude sur un petit écran indépendant, alimenté par batterie.','Lecture seule ; il sert si les grands écrans tombent en panne.'],
 panel:['Planche de bord','Ensemble des écrans et instruments devant les pilotes.','Touchez un écran précis pour sa fiche.']};
const FD={
 'spd-':'Diminue la vitesse sélectionnée (fenêtre SPD du FCU).','spd+':'Augmente la vitesse sélectionnée.','hdg-':'Diminue le cap sélectionné (fenêtre HDG).','hdg+':'Augmente le cap sélectionné.',
 'alt-':'Diminue l\'altitude sélectionnée (fenêtre ALT, par 100 ou 1 000 ft).','alt+':'Augmente l\'altitude sélectionnée.','vs-':'Vitesse verticale sélectionnée plus négative (descente).','vs+':'Vitesse verticale sélectionnée plus positive (montée).',
 nav:'Mode NAV : le pilote automatique suit la route du plan de vol (ligne verte du ND).','ap':'Pilote automatique 1 : il tient la trajectoire et les consignes du FCU. On l\'engage en montée, jamais au roulage.','ap2':'Pilote automatique 2 (second système, utilisé ensemble avec AP1 pour l\'atterrissage automatique).',
 ath:'Automanette (A/THR) : la poussée est réglée automatiquement pour tenir la vitesse ou le mode.','loc':'LOC : capture de l\'axe d\'approche de la piste (localizer de l\'ILS).','appr':'APPR : capture de l\'axe ET de la pente de l\'ILS (approche de précision).','exped':'EXPED : montée ou descente accélérée (peu utilisé en ligne).',
 spdMach:'Bascule l\'affichage de la vitesse entre nœuds (IAS) et nombre de Mach.','spdPull':'Tirer le bouton SPD : vitesse « sélectionnée » par le pilote.','spdPush':'Pousser le bouton SPD : vitesse « gérée » par le FMS.','hdgPull':'Tirer le bouton HDG : cap sélectionné (le pilote choisit le cap).','alth':'Tirer / pousser ALT : niveau sélectionné ou géré.','altStep':'Pas de réglage de l\'altitude : 100 ou 1 000 ft.',
 hdgTrk:'Bascule HDG-V/S ↔ TRK-FPA (cap/vario ou route/pente).','metric':'Affiche l\'altitude aussi en mètres.','chrono':'Chronomètre.','tcas':'Trafic (TCAS) affiché sur le ND.','clr':'Efface un message.','mc':'Master caution : éteint le voyant ambre d\'alarme.','mw':'Master warning : éteint le voyant rouge d\'alarme.','rnd':'Réglage d\'échelle.','x':'Fermer le panneau.'};
const MK={DIR:'DIR : aller directement vers un point (direct to).',PROG:'PROG : progression du vol (niveau, distance, précision de navigation).',PERF:'PERF : vitesses V1, VR, V2, volets, température FLEX — saisies avant le décollage.',INIT:'INIT : départ/arrivée (FROM/TO), indice de coût (CI), niveau de croisière ; flèche → INIT B (masse sans carburant, centrage, carburant bloc).',
 DATA:'DATA : bases de données de navigation.','F-PLN':'F-PLN : plan de vol (liste des points).','RAD NAV':'RAD NAV : fréquences des balises VOR/ILS.','FUEL PRED':'FUEL PRED : carburant prévu à l\'arrivée.','SEC F-PLN':'SEC F-PLN : plan de vol secondaire (dégagement, piste différente).','ATC COMM':'ATC COMM : messages écrits avec le contrôle (CPDLC).','MCDU MENU':'MENU : choix du système (FMGC, ACARS…).','AIRPORT':'AIRPORT : aller à un aéroport du plan de vol.',
 '◀':'Page précédente / suivante (INIT ↔ INIT B).','▶':'Page suivante / précédente (INIT ↔ INIT B).','▲':'Faire défiler.','▼':'Faire défiler.','CLR':'Efface le dernier caractère du bloc-notes.','OVFY':'Survol imposé d\'un point.'};
const MKL={INIT:{L1:'L1 : FROM/TO — tapez par ex. LFPG/FMEE puis L1.',L5:'L5 : indice de coût (CI).',L6:'L6 : niveau de croisière — tapez FL350 puis L6.'},INITB:{R1:'R1 : ZFW/ZFWCG — masse sans carburant (t) / centrage (%).',R2:'R2 : carburant BLOCK (t).'},PERF:{L1:'L1 : V1.',L2:'L2 : VR.',L3:'L3 : V2.',R3:'R3 : volets / plan horizontal (ex. 1/UP0.5).',R4:'R4 : température FLEX (poussée réduite).'}};
const EFF={
 bat1:'La batterie 1 se connecte au réseau : premiers voyants, alimentation des bus de secours. Batteries seules : environ 30 min d\'autonomie.',bat2:'La batterie 2 se connecte au réseau (même rôle que BAT 1).',
 extPwr:'Le groupe de parc alimente tout l\'avion (si un GPU est branché).',apuMaster:'L\'APU (petite turbine dans la queue) est mis sous tension ; la porte d\'entrée d\'air s\'ouvre.',apuStartBtn:'L\'APU démarre ; « APU AVAIL » après environ 1 min. Il fournit électricité et air comprimé.',
 apuGen:'La génératrice de l\'APU alimente les réseaux électriques.',apuBl:'L\'air de l\'APU alimente la climatisation et sert à démarrer les moteurs.',ir1:'NAV : la centrale 1 s\'aligne (6 à 10 min, avion immobile).',ir2:'NAV : la centrale 2 s\'aligne.',ir3:'NAV : la centrale 3 s\'aligne.',
 navLt:'Feux de navigation (rouge gauche, vert droite, blanc arrière) et logo allumés.',beacon:'Feux anticollision rouges clignotants : signal « moteurs en route / va démarrer » pour le personnel au sol.',strobe:'Flashs blancs : allumés en entrant sur la piste.',landL:'Phares d\'atterrissage : piste et approche.',landR:'Phares d\'atterrissage droit.',
 belts:'Consigne « attachez vos ceintures » allumée en cabine (signal sonore).',nosmk:'Consigne « défense de fumer ».',master1:'Moteur 1 : démarrage automatique (FADEC) si ENG MODE est sur IGN START ; coupure si on le remet sur OFF.',master2:'Moteur 2 : démarrage automatique (FADEC) si ENG MODE est sur IGN START.',
 engMode:'IGN START prépare le démarrage (allumage) ; NORM après les démarrages ; CRANK = ventilation sans allumage.',pbrake:'Frein de parc : serré au poste, desserré pour rouler (repoussage, roulage).',thrSel:'Manettes de poussée : IDLE (ralenti), CL (montée), FLX/MCT, TOGA (décollage / remise de gaz), REV (inversion au sol).',
 gearL:'Train d\'atterrissage : sorti (DOWN) ou rentré (UP).',flapL:'Volets : 1 pour décoller, puis rentrés par étapes ; sortis par étapes en approche.',spdbrk:'Aérofreins (spoilers) : freinage aérodynamique en vol, armés pour l\'atterrissage.',xpdr:'Transpondeur : l\'avion apparaît sur le radar du contrôle (code à 4 chiffres).',
 pack1:'Climatisation 1 : refroidit et pressurise la cabine.',pack2:'Climatisation 2.',bl1:'Prélèvement d\'air du moteur 1.',bl2:'Prélèvement d\'air du moteur 2.',wingAI:'Antigivrage des ailes (air chaud sur les bords d\'attaque).',engAI1:'Antigivrage de l\'entrée d\'air du moteur 1.',engAI2:'Antigivrage du moteur 2.',probe:'Réchauffage des sondes (pitot, statiques, incidence).',
 fpL1:'Pompe carburant du réservoir gauche n° 1.',fpL2:'Pompe du réservoir gauche n° 2.',fpR1:'Pompe du réservoir droit n° 1.',fpR2:'Pompe du réservoir droit n° 2.',fpC1:'Pompe du réservoir central n° 1.',fpC2:'Pompe du réservoir central n° 2.',xfeed:'Intercommunication : un moteur peut être alimenté par le réservoir de l\'autre côté.',
 fire1:'Isole le moteur 1 (carburant, hydraulique, électricité, air coupés) et arme ses extincteurs.',fire2:'Isole le moteur 2 et arme ses extincteurs.',fireA:'Isole l\'APU et arme son extincteur.',ditch:'Ferme toutes les vannes sous le plancher avant un amerrissage.',ramAir:'Ouvre une entrée d\'air dynamique (ventilation de secours).',
 mcdu:'Écran et clavier du FMS : on y saisit la route, les masses, le carburant et les vitesses de décollage.','mcdu-init':'Remplit d\'un coup les pages INIT / INIT B / PERF avec les valeurs du devis de masse (raccourci pédagogique).'};

/* ---------- identification d'une commande ---------- */
const KINDS=[['sw','data-sw','Panneau plafond / poste'],['pd','data-pd','Pédestal'],['f','data-f','Auvent : FCU · EFIS'],['mk','data-mk','MCDU (FMS)'],['ecp','data-ecp','Panneau de commande ECAM']];
const SEL='[data-sw],[data-pd],[data-f],[data-mk],[data-ecp],#mcdu,#mcdu-init,#b-gear,#b-flap';
function findDef(id){ let hit=null; const walk=(n,sec,d)=>{ if(hit||!n||d>9) return; if(Array.isArray(n)){
    if(typeof n[0]==='string'&&Array.isArray(n[1])&&n[1].length&&n[1].every(Array.isArray)){ n[1].forEach(x=>walk(x,n[0],d+1)); return; }
    if(n[0]===id&&typeof n[1]==='string'){ hit={l:n[1]||id,sec,t:n[2]}; return; } n.forEach(x=>walk(x,sec,d+1)); }
   else if(typeof n==='object'){ for(const k in n) if(k!=='src') walk(n[k],n.t||sec,d+1); } };
  try{ walk(OVH[ACK],'',0); }catch(e){} try{ if(!hit&&typeof PED!=='undefined') walk(PED[ACK],'',0); }catch(e){} try{ if(!hit&&AIR()&&typeof P320!=='undefined') walk(P320,'',0); }catch(e){}
  return hit; }
function ident(el){ if(!el) return null;
  if(el.id==='mcdu') return {k:'scr',id:'mcdu',el,sel:'#mcdu'}; if(el.id==='mcdu-init') return {k:'btn',id:'mcdu-init',el,sel:'#mcdu-init'};
  if(el.id==='b-gear') return {k:'pd',id:'gearL',el,sel:'#b-gear'}; if(el.id==='b-flap') return {k:'pd',id:'flapL',el,sel:'#b-flap'};
  for(const [k,a] of KINDS){ const v=el.getAttribute(a); if(v!=null) return {k,id:v,el,sel:`[${a}="${v}"]`}; } return null; }
const TYPE={pb:'bouton-poussoir',knob:'sélecteur rotatif',tog:'interrupteur',sel:'sélecteur',mom:'bouton à impulsion',disp:'afficheur (lecture seule)',pd:'levier / sélecteur','pd-tog':'interrupteur',mcdu:'ordinateur de gestion du vol',ecp:'panneau ECAM'};
function info(c){ if(c.k==='scrn'){ const s=SCR[c.id]||SCR.panel; return {name:s[0],where:'Planche de bord',what:s[1],note:s[2],read:true}; }
  if(c.id==='mcdu') return {name:'MCDU — écran du FMS',where:'Pédestal',what:EFF.mcdu,note:'L\'écran affiche la page choisie avec les touches de fonction (INIT, PERF, F-PLN…). Le bloc-notes (dernière ligne) reçoit ce que vous tapez ; une touche de ligne (L1…R6) l\'envoie dans le champ en face.'};
  if(c.id==='mcdu-init') return {name:'Saisir INIT / PERF depuis le devis',where:'Pédestal · MCDU',what:EFF['mcdu-init']};
  if(c.k==='mk'){ const pg=(typeof S320!=='undefined'&&S320.mcdu&&S320.mcdu.page)||'';
    const line=/^[LR][1-6]$/.test(c.id)?((MKL[pg]||{})[c.id]||`Touche de ligne ${c.id} : envoie le contenu du bloc-notes dans le champ en face (page ${pg||'—'} : aucun champ modifiable ici).`):null;
    return {name:'MCDU · touche '+(c.id===' '?'SP':c.id),where:'Pédestal · MCDU',what:line||MK[c.id]||(/^[A-Z0-9.\/-]$/.test(c.id)?'Touche de saisie : écrit « '+c.id+' » dans le bloc-notes.':'Touche du clavier MCDU.')}; }
  if(c.k==='f') return {name:'FCU · '+(c.el&&c.el.textContent.trim()||c.id),where:'Auvent (FCU)',what:FD[c.id]||(c.el&&c.el.title)||'Commande du pilote automatique.'};
  if(c.k==='ecp') return {name:'ECAM · touche '+c.id,where:'Pédestal · panneau ECAM',what:c.id==='CLR'?'CLR : efface le message ECAM traité / revient à la page normale.':c.id==='RCL'?'RCL : rappelle les alarmes effacées.':c.id==='STS'?'STS : état de l\'avion (systèmes dégradés).':c.id==='EMER'?'EMER CANC : annule une alarme sonore.':c.id==='TO'?'T.O CONFIG : vérifie la configuration de décollage (volets, trim, freins…).':'Affiche la page système '+c.id+' sur l\'écran SD.'};
  const d=findDef(c.id)||{}, help=(AIR()&&typeof H320!=='undefined'&&H320[c.id])||(c.el&&c.el.title)||'';
  const where=(c.k==='sw'?(A.kind==='fw'?'Panneau plafond':'Panneau'):c.k==='pd'?(A.kind==='fw'?'Pédestal':'Console'):'Poste')+(d.sec?' › '+d.sec:'');
  return {name:(d.l||(c.el&&c.el.textContent.trim().slice(0,30))||c.id),where,type:TYPE[d.t]||'',what:help||EFF[c.id]||`Commande ${d.l||c.id}${d.sec?' du panneau '+d.sec:''}.`,eff:EFF[c.id]}; }

/* ---------- le parcours : étapes où la commande intervient ---------- */
function steps(){ try{ if(GD.on&&GD.steps&&GD.steps.length) return {st:GD.steps,live:true}; }catch(e){} try{ if(!steps.c||steps.c.k!==ACK){ steps.c={k:ACK,st:stepsFor()}; } return {st:steps.c.st,live:false}; }catch(e){ return {st:[],live:false}; } }
const okIt=it=>{ try{ return !!it[1](); }catch(e){ return false; } };
function uses(c){ const {st}=steps(), out=[]; st.forEach((s,i)=>(s.items||[]).forEach((it,j)=>{ let m=false;
    if(c.k==='scrn'){ m=!it[3]&&window.PT&&(it[4]||PT.scrFor(it[0])||s.scr)===c.id; }
    else if(it[3]){ if(c.sel&&(it[3]===c.sel||it[3].includes('"'+c.id+'"'))) m=true; else if(c.el){ try{ const t=PT.el(it[3]); m=!!t&&(t===c.el||t.contains(c.el)||c.el.contains(t)); }catch(e){} }
      if(!m&&c.k==='mk'&&/^#mcdu/.test(it[3])) m=['INIT','PERF','▶','◀'].includes(c.id)||/^[LR][1-6]$/.test(c.id); if(!m&&c.id==='mcdu'&&/^#mcdu/.test(it[3])) m=true; }
    if(m) out.push({i,j,s,it,ok:okIt(it)}); })); return out; }
function ruleFor(c){ try{ if(!window.GUARD||!c.el||(c.k!=='sw'&&c.k!=='pd')) return null; const id=c.id; let n;
    if(c.el.id==='b-gear'||id==='gearL') n=!S.gear; else if(id==='flapL') n=S.flap>=A.flaps.length-1?0:S.flap+1;
    else if(c.k==='sw'){ n=!SYS[id]; if(c.el.dataset.t==='pb'&&c.el.dataset.dl==='OFF') n=!n; } else n=id==='pbrake'?!S.pbrake:!(typeof pedGet==='function'?pedGet(id):SYS[id]);
    const r=GUARD.rules.find(r=>(r.ids.includes(id)||r.ids.includes(c.el.id))&&(()=>{ try{ return r.bad(n,c.el); }catch(e){ return false; } })()); if(!r) return null;
    const v=x=>typeof x==='function'?x(n):x; return {t:r.y[0],why:v(r.y[1]),cons:(v(r.r)||[]),no:!!r.no}; }catch(e){ return null; } }
function needsPower(c){ return c.k==='scrn'||c.k==='mk'||c.id==='mcdu'||c.k==='f'||c.k==='ecp'; }
function powered(c){ try{ if(AIR()&&typeof dispPower==='function'&&MI.full){ const d=c.k==='scrn'?{pfd:'PFD1',nd:'ND1',ewd:'EWD',sd:'SD'}[c.id]:(c.k==='mk'||c.id==='mcdu')?'MCDU1':null; if(d) return dispPower(d); } return typeof hasPower!=='function'||hasPower(); }catch(e){ return true; } }
function powerStep(){ const {st}=steps(); const f=re=>st.findIndex(s=>re.test(s.t)&&(s.items||[]).some(it=>it[3])); const i=f(/sol ou APU/i); return i>=0?i:f(/Alimentation|batter/i); }

/* conditions physiques propres à certaines commandes : renvoie la raison du refus, ou null */
const COND={ap:()=>S.onGround?'Le pilote automatique ne s\'engage qu\'en vol, au plus tôt 100 ft (≈ 5 s) après le décollage : au sol, il refuse de s\'engager.':null,
 ap2:()=>S.onGround?'Comme AP1 : engagement en vol seulement (AP2 sert surtout avec AP1 pour l\'atterrissage automatique).':null,
 mw:()=>'Il n\'agit que si le voyant rouge MASTER WARN clignote (alarme en cours) : il éteint le voyant et le son, pas la panne.',
 mc:()=>'Il n\'agit que si le voyant ambre MASTER CAUT est allumé : il éteint le voyant, pas la panne.',
 RCL:()=>'Rappelle des alarmes ECAM effacées : sans alarme effacée, rien ne s\'affiche.',EMER:()=>'Annule une alarme sonore en cours : sans alarme, sans effet.',
 gearL:()=>S.onGround?'Au sol, le levier de train est verrouillé en position basse.':null};
const condFor=c=>{ try{ if(c.k==='mk'&&/^[LR][1-6]$/.test(c.id)&&typeof S320!=='undefined'&&!(S320.mcdu.sp||'').trim()) return 'Le bloc-notes (dernière ligne du MCDU) est vide : tapez d\'abord la valeur au clavier, puis appuyez sur la touche de ligne en face du champ.';
  const f=COND[c.id]; return f?f():null; }catch(e){ return null; } };
/* ---------- la fiche ---------- */
let CUR=null;
function card(c){ CUR=c; const I=info(c), U=uses(c), live=steps().live, cur=live?GD.i:-1, rule=ruleFor(c);
  let no=''; const L=listCache(); const e=L.find(x=>x.key===(c.k==='scrn'?'scr:':'')+c.id); if(e) no=e.n;
  const stepsTxt=U.length?U.map(u=>`<li><span class="st">Étape ${u.i}</span>${esc(u.s.t)} — <i>${esc(u.it[0])}</i>${u.ok?' <span class="ok">✓ fait</span>':''}</li>`).join(''):'<li>Aucune étape du parcours ne l\'exige : commande de consultation ou d\'usage occasionnel (pannes, confort, réglages).</li>';
  // Puis-je l'activer maintenant ? Pourquoi ?
  let can='', why='';
  const nowU=U.find(u=>u.i===cur&&!u.ok), futU=U.find(u=>u.i>cur&&!u.ok), pastU=U.filter(u=>u.i<=cur&&u.ok);
  const pw=needsPower(c)&&!powered(c);
  if(I.read&&!pw){ can='<span class="ok">Rien à activer</span> : c\'est un écran de lecture, il s\'allume et se met à jour tout seul.'; why=I.note||''; }
  else if(pw){ const ps=powerStep(); can='<span class="ko">NON, pas maintenant.</span>'; why=`L'avion n'a pas d'alimentation électrique : ${c.k==='scrn'?'l\'écran reste noir':'la commande ne réagit pas'}. ${c.k==='scrn'||c.k==='mk'||c.id==='mcdu'?' Au sol, sur batteries seules, ces écrans restent éteints (comme sur l\'avion réel) : il faut le courant alternatif du groupe de parc ou de la génératrice APU':' Il faut d\'abord mettre le courant (batteries, groupe de parc ou génératrice APU)'}${ps>=0?` — <span class="st">Étape ${ps}</span>`:''}.`; }
  else if(!rule&&condFor(c)&&!(live&&U.find(u=>u.i===cur&&!u.ok))){ can='<span class="ko">NON, pas dans la situation actuelle.</span>'; why=esc(condFor(c)); }
  else if(rule){ can=rule.no?'<span class="ko">NON : impossible.</span>':'<span class="ko">NON, déconseillé maintenant.</span>'; why=`<b>${esc(rule.t)}</b><br>${esc(rule.why)}`; }
  else if(!live){ can='<span class="ok">OUI</span> (vol libre : aucune séquence imposée).'; why=U.length?`Dans le parcours complet, elle intervient à l'étape ${U[0].i}.`:''; }
  else if(nowU){ can=`<span class="ok">OUI, maintenant !</span> C'est l'action attendue : <span class="st">Étape ${cur}</span> sous-étape ${nowU.j+1} « ${esc(nowU.it[0])} ».`; why=''; }
  else if(futU){ can=`<span class="wt">PAS ENCORE.</span> Prévue à l'<span class="st">Étape ${futU.i}</span> (vous êtes à l'étape ${cur}).`;
    const miss=[]; for(let i=cur;i<futU.i&&miss.length<5;i++) (steps().st[i].items||[]).forEach(it=>{ if(miss.length<5&&!okIt(it)) miss.push(`<li><span class="st">Étape ${i}</span>${esc(it[0])}</li>`); });
    why=`La procédure suit un ordre précis, comme sur l'avion réel : chaque système dépend des précédents.${miss.length?' Il reste d\'abord à faire :<ul>'+miss.join('')+'</ul>':''}`; }
  else if(pastU.length){ can=`<span class="ok">Déjà fait</span> à l'<span class="st">Étape ${pastU[pastU.length-1].i}</span>. Le toucher à nouveau changerait l'état réglé.`; why=''; }
  else { can='<span class="ok">OUI</span> : commande libre, non exigée à ce stade.'; why=''; }
  // Que se passe-t-il si je l'active ?
  let eff='';
  if(rule){ eff=`<ul>${rule.cons.map(x=>`<li>${esc(x)}</li>`).join('')||'<li>Action refusée par la logique de l\'avion.</li>'}</ul>`; }
  else if(pw) eff='Rien : sans alimentation, aucune réaction.';
  else if(I.read) eff=esc(I.what);
  else eff=esc(I.eff||(U[0]?U[0].s.txt:'')||I.what);
  if(!rule&&live&&futU&&!pw) eff+=`<br><span class="wt">Hors séquence :</span> l'action est appliquée dans le simulateur, mais la check-list la signalera et l'enchaînement des systèmes ne sera pas celui de la procédure.`;
  let box=$$('mancard'); if(!box){ box=document.createElement('div'); box.id='mancard'; document.body.appendChild(box); }
  box.hidden=false; box.innerHTML=`<div class="hd">${no?`<span class="no">N° ${no}</span>`:''}<div><b>${esc(I.name)}</b><small>${esc(I.where)}${I.type?' · '+esc(I.type):''}</small></div><button type="button" class="x" data-x aria-label="Fermer">×</button></div>
   <div class="q"><i>1 · Qu'est-ce que c'est ? À quoi ça sert ?</i>${esc(I.what)}${I.note&&!I.read?'<br><small>'+esc(I.note)+'</small>':''}</div>
   <div class="q"><i>2 · Puis-je l'activer maintenant ?</i>${can}</div>
   ${why?`<div class="q"><i>3 · Pourquoi ?</i>${why}</div>`:''}
   <div class="q"><i>${why?4:3} · Que se passe-t-il si je l'active ?</i>${eff}</div>
   <div class="q"><i>${why?5:4} · À quelle étape l'activer ?</i><ul>${stepsTxt}</ul></div>
   <div class="ft">${c.el&&!I.read?`<button type="button" class="go" data-a>${nowU?'✓ L\'activer maintenant':'L\'activer quand même'}</button>`:''}${U.length&&live?`<button type="button" data-g>Voir l'étape ${U[0].i} dans la check-list</button>`:''}<button type="button" data-l>📖 Liste numérotée</button></div>`;
  box.querySelector('[data-x]').onclick=()=>{ box.hidden=true; };
  const a=box.querySelector('[data-a]'); if(a) a.onclick=()=>{ box.hidden=true; activate(c); };
  const g=box.querySelector('[data-g]'); if(g) g.onclick=()=>{ try{ CKL.open(); }catch(e){} };
  box.querySelector('[data-l]').onclick=()=>list(); }
function activate(c){ window.MANON=false; try{ if(c.el.tagName==='SELECT'){ c.el.style.pointerEvents='auto'; c.el.focus(); try{ c.el.showPicker&&c.el.showPicker(); }catch(e){} } else c.el.click(); }catch(e){} setTimeout(()=>{ window.MANON=ON; if(c.el) c.el.style.pointerEvents=''; },400); }

/* ---------- écrans du cockpit (canevas) ---------- */
function screenAt(x,y){ const cv=$$('ckc'); if(!cv) return null; const r=cv.getBoundingClientRect(), W=r.width, H=r.height, px=x-r.left, py=y-r.top;
  if(AIR()||ACK==='lj60'){ const s=Math.min(H*0.66,W/5.7), gap=(W-5*s)/6, y0=H*0.08, X=i=>gap+i*(s+gap); const inn=(x0,y1,w,h)=>px>=x0&&px<=x0+w&&py>=y1&&py<=y1+h;
    if(inn(X(0),y0,s,s)||inn(X(4),y0,s,s)) return 'pfd'; if(inn(X(1),y0,s,s)||inn(X(3),y0,s,s)) return 'nd';
    if(AIR()){ const sc=Math.min(s,(H-y0-10)/2), x0=X(2)+(s-sc)/2; if(inn(x0,y0,sc,sc)) return 'ewd'; if(inn(x0,y0+sc+4,sc,sc)) return 'sd'; } else if(inn(X(2),y0,s,s)) return 'ewd'; }
  return 'panel'; }

/* ---------- interception des clics en mode d'emploi ---------- */
let ON=false; window.MANON=false;
function pick(e){ const t=e.target; if(!(t instanceof Element)) return null; if(t.closest('#mancard,#manbar,#manlist')) return null;
  let el=t.closest(SEL); if(!el){ const w=t.closest('.sw,.k320,.c320'); if(w) el=w.querySelector('select[data-sw],select[data-pd]'); }
  if(el) return ident(el); if(t.id==='ckc'||t.closest('#ckc')) return {k:'scrn',id:screenAt(e.clientX,e.clientY)}; return null; }
['pointerdown','mousedown','touchstart'].forEach(ev=>addEventListener(ev,e=>{ if(!ON) return; const c=pick(e); if(c) e.stopImmediatePropagation(); },{capture:true,passive:true}));
addEventListener('click',e=>{ if(!ON) return; const c=pick(e); if(!c) return; e.stopImmediatePropagation(); e.preventDefault(); card(c); },true);
addEventListener('change',e=>{ if(ON&&e.target.closest&&e.target.closest(SEL)) e.stopImmediatePropagation(); },true);
function toggle(v){ ON=v===undefined?!ON:!!v; window.MANON=ON; document.body.classList.toggle('manon',ON); const b=$$('b-man'); if(b) b.classList.toggle('on',ON);
  let bar=$$('manbar'); if(!bar){ bar=document.createElement('div'); bar.id='manbar'; bar.innerHTML='<span>ⓘ Mode d\'emploi : touchez un instrument, un bouton ou un écran (rien n\'est actionné)</span><button type="button" data-l>📖 Liste numérotée</button><button type="button" data-q>Quitter</button>'; document.body.appendChild(bar);
    bar.querySelector('[data-l]').onclick=()=>list(); bar.querySelector('[data-q]').onclick=()=>toggle(false); }
  bar.hidden=!ON; if(!ON){ const c=$$('mancard'); if(c) c.hidden=true; } }

/* ---------- liste numérotée, dans l'ordre des étapes ---------- */
function listCache(){ const {st}=steps(), out=[], seen=new Set(); let n=0;
  st.forEach((s,i)=>(s.items||[]).forEach((it,j)=>{ let key=null, sel=it[3]||null;
    if(sel){ const m=/data-(sw|pd|f|mk|ecp)="([^"]+)"/.exec(sel); key=m?m[2]:sel==='#b-gear'?'gearL':sel==='#b-flap'?'flapL':/^#mcdu-init/.test(sel)?'mcdu-init':/^#mcdu/.test(sel)?'mcdu':null; }
    else if(window.PT){ const sc=it[4]||PT.scrFor(it[0])||s.scr; if(sc) key='scr:'+sc; }
    if(!key||seen.has(key)) return; seen.add(key); out.push({n:++n,key,i,j,l:it[0],st:s,sel,ok:okIt(it)}); }));
  const extra=[]; ['pfd','nd','ewd','sd'].forEach(k=>{ if((A.kind==='fw'||k==='pfd')&&!seen.has('scr:'+k)){ seen.add('scr:'+k); extra.push({key:'scr:'+k,l:SCR[k][0],scr:k}); } });
  const addDefs=(node,kind)=>{ const walk=(x,sec,d)=>{ if(!x||d>9) return; if(Array.isArray(x)){ if(typeof x[0]==='string'&&Array.isArray(x[1])&&x[1].length&&x[1].every(Array.isArray)){ x[1].forEach(y=>walk(y,x[0],d+1)); return; }
      if(typeof x[0]==='string'&&typeof x[1]==='string'&&x[2]!=='disp'&&!seen.has(x[0])){ seen.add(x[0]); extra.push({key:x[0],l:(x[1]||x[0])+(sec?' · '+sec:''),kind,sel:`[data-${kind}="${x[0]}"]`}); return; } x.forEach(y=>walk(y,sec,d+1)); }
     else if(typeof x==='object') for(const k in x) if(k!=='src') walk(x[k],x.t||sec,d+1); }; walk(node,'',0); };
  try{ addDefs(OVH[ACK],'sw'); }catch(e){} try{ addDefs(PED[ACK],'pd'); }catch(e){} try{ if(AIR()) addDefs(P320,'sw'); }catch(e){}
  extra.forEach(x=>x.n=++n); return out.concat(extra.map(x=>Object.assign(x,{extra:true}))); }
function list(){ const L=listCache(), live=steps().live, cur=live?GD.i:-1; let el=$$('manlist'); if(!el){ el=document.createElement('div'); el.id='manlist'; document.body.appendChild(el); }
  let h='', lastI=-2; const main=L.filter(x=>!x.extra), ex=L.filter(x=>x.extra);
  main.forEach(x=>{ if(x.i!==lastI){ h+=`<h4>Étape ${x.i} · ${esc(x.st.t)}</h4>`; lastI=x.i; } h+=`<button type="button" class="e${x.ok&&live?' done':''}${x.i===cur?' cur':''}" data-n="${x.n}"><span class="n">${x.n}.</span><span>${esc(x.l)}</span><small>${x.ok&&live?'✓ ':''}étape ${x.i}</small></button>`; });
  if(ex.length) h+=`<h4>Autres commandes et écrans (sans étape imposée)</h4>`+ex.map(x=>`<button type="button" class="e" data-n="${x.n}"><span class="n">${x.n}.</span><span>${esc(x.l)}</span><small>libre</small></button>`).join('');
  el.hidden=false; el.innerHTML=`<div class="w"><div class="hd"><div><b>📖 MODE D'EMPLOI · ${esc(A.name)}</b><br><small style="color:#8fa4b8">Numéroté dans l'ordre des étapes du parcours${live?'':' (parcours complet de cet appareil)'} · touchez une ligne pour sa fiche</small></div><button type="button" class="x" aria-label="Fermer">×</button></div><div class="bd">${h||'<p>Aucune commande répertoriée.</p>'}</div></div>`;
  el.querySelector('.x').onclick=()=>{ el.hidden=true; }; el.onclick=e=>{ if(e.target===el) el.hidden=true; };
  el.querySelectorAll('[data-n]').forEach(b=>b.onclick=()=>{ const x=L.find(y=>y.n===+b.dataset.n); el.hidden=true; open(x); }); }
function open(x){ if(!x) return; if(x.scr||/^scr:/.test(x.key)){ card({k:'scrn',id:x.scr||x.key.slice(4)}); return; }
  if(steps().live&&x.i!=null){ try{ CKL.go(x.i,x.j); }catch(e){} }
  else if(x.sel){ try{ highlight(x.sel); }catch(e){} }
  setTimeout(()=>{ const el=x.sel?(window.PT&&PT.el(x.sel)||document.querySelector(x.sel)):null; const c=(el&&ident(el))||(x.key==='mcdu'?{k:'scr',id:'mcdu'}:{k:x.kind||(x.sel&&/data-pd/.test(x.sel)?'pd':'sw'),id:x.key,sel:x.sel}); card(c); },350); }

/* ---------- bouton de la barre ---------- */
function barBtn(){ const m=$$('b-menu'); if(!m||$$('b-man')) return; const b=document.createElement('button'); b.type='button'; b.id='b-man'; b.textContent='ⓘ Mode d\'emploi'; b.title='Toucher un instrument explique ce qu\'il fait, si on peut l\'activer et à quelle étape'; b.onclick=()=>toggle(); m.parentNode.insertBefore(b,m.nextSibling); }
barBtn(); setTimeout(barBtn,1500);
addEventListener('keydown',e=>{ if(e.key==='Escape'&&ON){ const c=$$('mancard'),l=$$('manlist'); if(l&&!l.hidden) l.hidden=true; else if(c&&!c.hidden) c.hidden=true; else toggle(false); } });
window.MAN={toggle,card,list,listCache,ident,uses,info,get on(){ return ON; }};
})();
