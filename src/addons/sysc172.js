/* ===== ATELIER DES SYSTÈMES (5) : Cessna 172P Skyhawk =====
   Moteur Lycoming O-320 à carburateur (4 cylindres à plat), allumage par 2 magnétos, primer, réchauffage carburateur,
   robinet carburant BOTH/LEFT/RIGHT/OFF (alimentation par gravité, aile haute), circuit 28 V (batterie + alternateur),
   pompe à dépression (horizon et conservateur de cap), volets électriques, freins à disque hydrauliques indépendants.
   Valeurs arrondies, ordres de grandeur publics (manuel de vol 172P, FAA-H-8083-25) [SIMPLIFIÉ]. */
(function(){
if(!window.SYSAT) return;
const {MOD}=SYSAT, H=SYSAT.helpers, {P,F,R,Ci,RR,Lb,T,ARC,SCR,G,AM,W,CY,RD}=H;
const near=(a,b,r)=>a+(b-a)*Math.min(1,r);
const fus='M200 60 C214 60 222 80 224 110 L226 250 C226 300 214 380 206 470 L194 470 C186 380 174 300 174 250 L176 110 C178 80 186 60 200 60 Z';
const body=`<path class="bd" d="${fus}"/><path class="bd" d="M40 180 L360 180 L360 232 L40 232 Z"/><path class="bd" d="M130 452 L270 452 L262 486 L138 486 Z"/><path class="bdl" d="M180 120 H220 M176 250 H224"/>`;
const parts=RR('tkL','tkR',70,186,90,40,6)+F('f_fu','M115 206 L188 206 L196 150 M285 206 L212 206 L204 150 M200 206 V150')+Ci('fv',200,212,3)+R('gasc',194,140,12,8,2)+R('carb',192,126,16,10,2)+R('ch',176,124,10,8,1)+Ci('prim',214,160,3)+F('f_prim','M214 160 L210 106')+
 RR('cylL','cylR',180,92,12,10,1)+RR('cylL','cylR',180,106,12,10,1)+R('crank',192,88,16,30,3)+Ci('st',200,120,2.6)+R('alt',214,88,7,9,1)+RR('magL','magR',186,118,6,6,1)+F('f_ign','M189 118 L184 100 M211 118 L216 100')+Ci('spk',181,100,1.8)+Ci('spk',219,100,1.8)+R('oil',188,72,24,6,1)+F('ex','M188 116 L180 132 M212 116 L220 132')+
 R('vac',196,114,8,6,1)+F('f_vac','M200 120 L200 150')+R('gyro',190,150,20,8,2)+R('bat',206,240,14,10,1)+F('f_bat','M213 240 L213 158 M213 158 L218 96')+R('bus',182,158,36,6,1)+R('avio',184,166,32,8,1)+R('flapm',150,226,10,6,1)+RR('flapL','flapR',90,226,60,6,1)+F('f_flap','M155 229 L188 166')+
 Ci('pitot',90,182,2.4)+Ci('stat',176,200,2)+Ci('land',112,180,2.4)+Ci('navL',42,206,2.6)+Ci('navR',358,206,2.6)+Ci('navT',200,488,2.4)+Ci('bcn',200,446,2.6)+Ci('strb',40,196,2)+Ci('strb',360,196,2)+R('brk',160,240,8,8,1)+R('brk',232,240,8,8,1)+Ci('nose',200,60,2.2)+
 `<g data-p="prop" class="sp" style="transform-origin:200px 54px"><path d="M60 52 L200 50 L340 52 L340 56 L200 58 L60 56 Z"/></g>`;
const labels=Lb(200,40,'HÉLICE')+Lb(150,98,'MOTEUR O-320','end')+Lb(70,176,'RÉSERVOIR G','start')+Lb(330,176,'RÉSERVOIR D','end')+Lb(200,500,'EMPENNAGE');
const NM={tkL:'Réservoir gauche (dans l\'aile)',tkR:'Réservoir droit (dans l\'aile)',f_fu:'Tuyauteries carburant (par gravité, aile haute)',fv:'Robinet sélecteur BOTH / LEFT / RIGHT / OFF',gasc:'Filtre-décanteur (gascolator, purge avant vol)',carb:'Carburateur (venturi + gicleur)',ch:'Boîte à air de réchauffage carburateur (air pris autour de l\'échappement)',prim:'Primer (pompe à main)',f_prim:'Ligne du primer vers les cylindres',
 cylL:'Cylindres gauches (O-320, 4 cylindres à plat)',cylR:'Cylindres droits',crank:'Carter et vilebrequin (entraîne directement l\'hélice)',st:'Démarreur électrique',alt:'Alternateur 28 V',magL:'Magnéto gauche',magR:'Magnéto droite',f_ign:'Fils d\'allumage',spk:'Bougies (2 par cylindre)',oil:'Radiateur d\'huile',ex:'Échappement',vac:'Pompe à dépression (entraînée par le moteur)',f_vac:'Ligne de dépression',gyro:'Horizon artificiel et conservateur de cap (gyroscopes à air)',
 bat:'Batterie 24 V',f_bat:'Câbles batterie / alternateur',bus:'Barre principale (disjoncteurs)',avio:'Barre avionique (radio, transpondeur)',flapm:'Moteur électrique des volets',flapL:'Volet gauche',flapR:'Volet droit',f_flap:'Alimentation des volets',pitot:'Sonde Pitot (sous l\'aile gauche)',stat:'Prise statique',land:'Phare (bord d\'attaque gauche)',navL:'Feu rouge (gauche)',navR:'Feu vert (droit)',navT:'Feu blanc arrière',bcn:'Balise anticollision',strb:'Feux à éclats',brk:'Freins à disque (commandés par la pointe des palonniers)',nose:'Cône d\'hélice',prop:'Hélice bipale à pas fixe'};
const ctl=[
 {g:'Électricité',w:'interrupteurs bas de planche',c:[{id:'master',l:'MASTER BAT',t:'sel',o:[false,true],ol:['OFF','ON'],pg:'MOTEUR',pt:['bat','f_bat','bus']},{id:'alt',l:'MASTER ALT',t:'sel',o:[false,true],ol:['OFF','ON'],pg:'MOTEUR',pt:['alt','f_bat']},{id:'avio',l:'AVIONICS',t:'sel',o:[false,true],ol:['OFF','ON'],pg:'MOTEUR',pt:['avio']}]},
 {g:'Carburant',w:'plancher, entre les sièges',c:[{id:'fv',l:'ROBINET',t:'sel',o:['OFF','LEFT','RIGHT','BOTH'],ol:['OFF','GAUCHE','DROIT','BOTH'],pg:'MOTEUR',pt:['fv','f_fu','tkL','tkR']},{id:'prim',l:'PRIMER',t:'sel',o:[0,3],ol:['0','3 INJ.'],pg:'MOTEUR',pt:['prim','f_prim']}]},
 {g:'Moteur',w:'manettes et clé',c:[{id:'mix',l:'MÉLANGE',t:'sel',o:['CUT','RICH'],ol:['IDLE CUT-OFF','RICHE'],pg:'MOTEUR',pt:['carb']},{id:'chot',l:'RÉCHAUFFAGE CARBU',t:'sel',o:[false,true],ol:['FROID','CHAUD'],pg:'MOTEUR',pt:['ch','carb']},{id:'thr',l:'GAZ',t:'sel',o:['IDLE','RUN','FULL'],ol:['RALENTI','1 700 TR','PLEIN GAZ'],pg:'MOTEUR',pt:['carb','crank']},
  {id:'key',l:'CLÉ (MAGNÉTOS)',t:'sel',o:['OFF','R','L','BOTH','START'],ol:['OFF','R','L','BOTH','START'],pg:'MOTEUR',pt:['magL','magR','spk','st']}]},
 {g:'Volets · freins',w:'levier de volets, palonniers',c:[{id:'flaps',l:'VOLETS',t:'sel',o:[0,10,20,30],ol:['0','10','20','30'],pg:'MOTEUR',pt:['flapm','flapL','flapR','f_flap']},{id:'pbrake',l:'FREIN DE PARC',t:'sel',o:[true,false],ol:['SERRÉ','DESSERRÉ'],pg:'MOTEUR',pt:['brk']}]},
 {g:'Feux',w:'interrupteurs bas de planche',c:[{id:'bcn',l:'BEACON',t:'sel',o:[false,true],ol:['OFF','ON'],pg:'MOTEUR',pt:['bcn']},{id:'nav',l:'NAV',t:'sel',o:[false,true],ol:['OFF','ON'],pg:'MOTEUR',pt:['navL','navR','navT']},{id:'land',l:'LAND',t:'sel',o:[false,true],ol:['OFF','ON'],pg:'MOTEUR',pt:['land']},{id:'strb',l:'STROBE',t:'sel',o:[false,true],ol:['OFF','ON'],pg:'MOTEUR',pt:['strb']}]}];
function init(){ return {ground:true,master:false,alt:false,avio:false,fv:'BOTH',prim:0,primed:false,mix:'CUT',chot:false,thr:'IDLE',key:'OFF',flaps:0,fp:0,pbrake:true,bcn:false,nav:false,land:false,strb:false,rpm:0,run:false,crank:0,vac:0,oilP:0,t:0,soc:1}; }
function kk(s){ const k={}; k.dc=s.master; k.altOn=s.alt&&s.run&&s.master; k.mags=s.key!=='OFF'; k.fuel=s.fv!=='OFF'&&s.mix==='RICH'; k.cranking=s.crank>0; k.flapMove=Math.abs(s.fp-s.flaps)>0.5&&s.master; k.single=s.key==='L'||s.key==='R'; return k; }
function step(s,dt){ const k=kk(s); s.t+=dt; if(s.prim>0) s.primed=true;
 if(s.crank>0){ s.crank-=dt; s.rpm=near(s.rpm,250,dt*3); if(s.crank<1.2&&k.fuel&&k.mags&&s.primed) s.run=true; if(s.crank<=0&&s.key==='START') s.key='BOTH'; }
 if(s.run&&(!k.fuel||!k.mags)) s.run=false;
 const tgt=s.run?({IDLE:800,RUN:1700,FULL:2300}[s.thr])-(k.single?100:0)-(s.chot?80:0):(s.crank>0?250:0); s.rpm=near(s.rpm,tgt,dt*(s.run?1.2:0.8));
 if(k.flapMove) s.fp=near(s.fp,s.flaps,dt*0.35*(30/Math.max(1,Math.abs(s.flaps-s.fp)))); s.vac=near(s.vac,s.run?5:0,dt*0.4); s.oilP=near(s.oilP,s.run?(s.rpm>1500?75:40):0,dt*0.3);
 if(s.master&&!k.altOn) s.soc=Math.max(0,s.soc-dt/3600*0.8); else if(k.altOn) s.soc=Math.min(1,s.soc+dt/1800); }
function ev(s){ const k=kk(s), p={}, sp={}, A=(id,c,m)=>{ p[id]=m?[c,m]:c; };
 if(s.master){ A('bat','el',k.altOn?null:'blink'); A('f_bat','el',k.altOn?'rev':'flow'); A('bus','el'); if(s.avio) A('avio','el'); } if(k.altOn) A('alt','el');
 A('tkL','fu',s.fv==='LEFT'||s.fv==='BOTH'?null:'dim'); A('tkR','fu',s.fv==='RIGHT'||s.fv==='BOTH'?null:'dim'); if(s.fv!=='OFF'){ A('fv','fu'); A('f_fu','fu',s.run?'flow':'st'); A('gasc','fu'); } if(k.fuel) A('carb','fu'); if(s.prim) { A('prim','fu','blink'); A('f_prim','fu','flow'); }
 if(s.chot){ A('ch','hot'); A('carb','hot'); }
 if(k.cranking){ A('st','el','blink'); A('crank','me','blink'); } if(s.run){ A('crank','me'); ['cylL','cylR'].forEach(x=>A(x,'hot')); A('ex','hot','flow'); A('oil','oil'); A('vac','me'); A('f_vac','ac','flow'); }
 if(s.vac>4.4) A('gyro','ac'); else if(s.master) A('gyro','warn','blink');
 if(k.mags&&(s.run||k.cranking)){ if(s.key!=='R') A('magL','ig'); if(s.key!=='L') A('magR','ig'); A('f_ign','ig','flow'); A('spk','ig','blink'); }
 if(s.rpm>50){ A('prop','me','spin'); sp.prop=Math.max(0.05,1.4-s.rpm/2300*1.35).toFixed(2)+'s'; A('nose','me'); }
 if(k.flapMove){ A('flapm','el','blink'); A('f_flap','el','flow'); } if(s.fp>1){ A('flapL','me'); A('flapR','me'); }
 if(s.pbrake) A('brk','hg'); if(s.master){ if(s.nav){ A('navL','lr'); A('navR','lg'); A('navT','lt'); } if(s.bcn) A('bcn','lr','blink'); if(s.land) A('land','lt'); if(s.strb) A('strb','lt','blink'); }
 const lv=[]; if(k.cranking) lv.push('DÉMARREUR : le moteur est lancé'+(s.primed?'':' — non amorcé : 2 à 3 injections de primer moteur froid')); if(s.run) lv.push(`MOTEUR ${Math.round(s.rpm)} tr/min · HUILE ${Math.round(s.oilP)} psi · DÉPRESSION ${s.vac.toFixed(1)} inHg`); if(k.flapMove) lv.push('VOLETS en mouvement : '+Math.round(s.fp)+'°');
 const memo=[]; if(s.master&&!k.altOn&&s.run) memo.push([AM,'ALT (ampèremètre −)']); if(s.run&&s.oilP<25) memo.push([RD,'OIL PRESS']); if(s.master&&s.vac<4.4&&s.run) memo.push([AM,'VAC']); if(s.run&&s.rpm>2000&&s.pbrake) memo.push([G,'POINT FIXE']);
 return {p,sp,k,lv,memo}; }
function page(pg,s,d){ let b=T(160,14,'INSTRUMENTS MOTEUR',W,11,'middle')+ARC(90,80,40,s.rpm,2800,'RÉGIME','tr/min',s.rpm>2700?RD:G,0.92)+ARC(230,80,40,s.oilP,115,'HUILE','psi',s.oilP<25&&s.run?RD:G,0.92)+ARC(90,160,28,s.vac,10,'DÉPRESSION','inHg',s.vac>4.4?G:AM,0.9)+T(230,150,'ALT '+(d.k.altOn?'CHARGE':'—'),d.k.altOn?G:AM,11,'middle')+T(230,170,'VOLETS '+Math.round(s.fp)+'°',CY,10,'middle');
 return SCR(b,d.memo); }
function on(s,id,v){ if(id==='key'&&v==='START'){ if(s.master&&!s.run) s.crank=2.5; else s.key='BOTH'; } if(id==='prim'&&v>0) setTimeout(()=>{ s.prim=0; },1500); }
function ex(id,s,d){ const k=d.k, o={ln:[]}, ln=(c,t)=>o.ln.push([c,t]), blk=(t,go)=>{ o.blk=t; o.go=go; };
 switch(id){
 case 'master': o.h='MASTER BAT'; ln('el','Le relais de batterie alimente la barre principale : démarreur, volets, feux, avionique.'); ln('ig','L\'allumage n\'en dépend pas : les magnétos produisent elles-mêmes le courant des bougies.'); break;
 case 'alt': o.h='MASTER ALT'; ln('me','L\'alternateur est entraîné par courroie par le moteur.'); ln('el','Il recharge la batterie et alimente le circuit (ampèremètre positif).'); if(!s.run) blk('Moteur arrêté : aucun courant produit.','key'); break;
 case 'avio': o.h='AVIONICS'; ln('el','Coupé au démarrage et à l\'arrêt : protège radio et transpondeur des pics de tension du démarreur.'); if(!s.master) blk('MASTER OFF : barre avionique non alimentée.','master'); break;
 case 'fv': o.h='Robinet carburant'; ln('fu','Aile haute : l\'essence descend par gravité, sans pompe électrique (172 à carburateur). BOTH en usage normal, au décollage et à l\'atterrissage.'); if(s.fv==='OFF') ln('warn','OFF : le moteur s\'arrête quand le carburateur est vide.'); break;
 case 'prim': o.h='Primer'; ln('fu','Pompe à main qui injecte de l\'essence directement dans les cylindres pour un démarrage à froid (2 à 3 injections, rien moteur chaud).'); break;
 case 'mix': o.h='Mélange'; ln('fu',s.mix==='RICH'?'RICHE : plein débit au gicleur ; on appauvrit en croisière en altitude.':'IDLE CUT-OFF : plus d\'essence, le moteur s\'arrête proprement (procédure d\'arrêt).'); break;
 case 'chot': o.h='Réchauffage carburateur'; ln('hot','Air chaud pris autour de l\'échappement envoyé au carburateur : fait fondre la glace du venturi.'); ln('me','Légère chute de régime : l\'air chaud est moins dense. À utiliser avant toute réduction prolongée de puissance.'); break;
 case 'thr': o.h='Manette des gaz'; ln('me','Ouvre le papillon du carburateur. Hélice à pas fixe : le régime suit directement la puissance (et la vitesse).'); break;
 case 'key': o.h='Clé (magnétos)'; if(s.key==='START'||k.cranking){ if(!s.master){ blk('MASTER OFF : le démarreur ne tourne pas.','master'); break; } ln('el','START : le démarreur entraîne le vilebrequin et l\'hélice.'); ln('ig','Les magnétos produisent les étincelles (2 bougies par cylindre).'); if(!k.fuel) blk('Pas de carburant : robinet ouvert et mélange RICHE.','mix'); else if(!s.primed) blk('Moteur froid non amorcé : donner 2 à 3 injections de primer.','prim'); }
  else if(s.key==='OFF') ln('ig','OFF : magnétos à la masse, plus d\'étincelle.'); else ln('ig',s.key==='BOTH'?'BOTH : fonctionnement normal.':`Une seule magnéto (${s.key}) : essai au point fixe, chute ≤ 125 tr/min, écart ≤ 50 tr/min.`); break;
 case 'flaps': o.h='Volets'; ln('el','Moteur électrique et vis sans fin : environ 2 s par 10°.'); if(!s.master) blk('MASTER OFF : les volets ne bougent pas.','master'); break;
 case 'pbrake': o.h='Frein de parc'; ln('hg','Bloque la pression dans les freins à disque (pointes de palonniers).'); break;
 default: o.h='Feux'; ln('lt','Rouge à gauche, vert à droite, blanc à l\'arrière ; balise et éclats pour être vu.'); }
 return o; }
const tours={start:{n:'Mise en route du Cessna 172',st:[['pbrake',true,'Frein de parc serré.'],['avio',false,'AVIONICS OFF.'],['fv','BOTH','Robinet BOTH.'],['mix','RICH','Mélange riche.'],['prim',3,'Primer : 3 injections (moteur froid).'],['master',true,'MASTER BAT ON.'],['bcn',true,'Balise ON. « Dégagé hélice ! »'],['key','START','Démarreur ; les magnétos allument le moteur.',s=>s.run,'Attendre le moteur'],['alt',true,'MASTER ALT ON : l\'ampèremètre devient positif.'],['avio',true,'AVIONICS ON.'],['nav',true,'NAV ON.'],
 ['thr','RUN','Point fixe : 1 700 tr/min.'],['key','L','Magnéto L : chute de régime.'],['key','R','Magnéto R.'],['key','BOTH','Retour BOTH.'],['chot',true,'Réchauffage CHAUD : légère chute.'],['chot',false,'Réchauffage FROID.'],['thr','IDLE','Ralenti.'],['flaps',10,'Volets 10.'],['pbrake',false,'Frein de parc desserré : prêt au roulage.']]}};
function preset(n){ const s=init(); if(n==='cold') return s; s.master=true; s.nav=true; if(n==='elec') return s; Object.assign(s,{mix:'RICH',key:'BOTH',run:true,primed:true,rpm:800,alt:true,avio:true,bcn:true,vac:5,oilP:40}); return s; }
const snd=(s,d)=>({fan:0,pist:s.run||s.crank>0?s.rpm/23:0,rot:0,bf:8,motor:d.k.flapMove||s.crank>0,hum:s.master?0.3:0});
MOD.c172={snd,name:'Cessna 172P Skyhawk',sub:'1 moteur à pistons Lycoming O-320 à carburateur · hélice à pas fixe · alimentation carburant par gravité · 28 V',vb:'0 0 400 520',svg:body+parts+labels,names:NM,ctl,init,step,ev,page,ex,on,tours,preset,pages:['MOTEUR'],legend:['el','fu','ig','hot','me','oil','ac','lt'],presets:[['cold','Avion froid'],['elec','Sous tension'],['run','Moteur en route']],
 ground:{on:s=>{ if(s.ground){ if(!s.run||s.thr!=='FULL') return 'Plein gaz et moteur en marche nécessaires pour décoller.'; s.ground=false; } else s.ground=true; }}};
})();
