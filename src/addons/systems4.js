/* ===== ATELIER DES SYSTÈMES (4) : Boeing 777-300ER =====
   Architecture Boeing (FCOM 777, documents publics de formation) [SIMPLIFIÉ] :
   · Électricité : 2 génératrices IDG (une par moteur, 120 kVA), génératrice APU, 2 génératrices de secours (backup), RAT ;
     barres AC gauche / droite reliées par les contacteurs de couplage (BUS TIE) ; batterie principale et batterie APU.
   · Hydraulique : 3 circuits indépendants 3 000 psi — GAUCHE (pompe moteur + pompe électrique), CENTRE (2 pompes électriques
     C1/C2 + 2 pompes entraînées par l'air ADP), DROIT (pompe moteur + pompe électrique).
   · Carburant : réservoirs gauche, central, droit ; 2 pompes par aile (AV/AR), 2 pompes centrales ; intercommunication.
   · Démarrage : sélecteur START (GND) → démarreur à air (air de l'APU) → N2 ≈ 25 % → interrupteur FUEL CONTROL sur RUN
     (carburant + allumage) → allumage → coupure du démarreur vers 50 % N2, le sélecteur revient sur NORM.
   · Air : prélèvements moteurs et APU, 2 packs de climatisation. Commandes de vol électriques (fly-by-wire Boeing, manche classique). */
(function(){
if(!window.SYSAT) return;
const {MOD}=SYSAT, H=SYSAT.helpers, {mir,P,F,R,Ci,RR,CC,PP,FF,Lb,T,BX,LN,ARC,SCR,G,AM,W,CY,RD,GY}=H;
const near=(a,b,r)=>a+(b-a)*Math.min(1,r);
/* ---- dessin vu de dessus (repère 400 × 600, nez en haut) ---- */
const fus='M200 10 C214 10 219 40 219 70 V470 C219 520 210 560 200 590 C190 560 181 520 181 470 V70 C181 40 186 10 200 10 Z';
const wing='M181 238 L30 352 L24 366 L36 368 L181 316 Z', stab='M200 528 L132 566 L132 578 L200 556 Z';
const body=`<path class="bd" d="${fus}"/><path class="bd" d="${wing}"/><path class="bd" d="${mir(wing)}"/><path class="bd" d="${stab}"/><path class="bd" d="${mir(stab)}"/><path class="bdl" d="M200 480 V588 M24 366 L18 356 M376 366 L382 356"/>`;
const parts=
 PP('tkL','tkR','M181 252 L64 340 L70 346 L181 302 Z','sp')+R('tkC',184,256,32,48,3)+
 RR('engL','engR',98,240,26,58,8)+RR('fanL','fanR',100,236,22,6,2)+RR('idgL','idgR',104,282,8,8,1)+RR('edpL','edpR',114,282,8,8,1)+
 R('apu',192,560,16,16,3)+R('apug',194,546,12,8,1)+R('bat',188,40,10,7,1)+R('apubat',202,40,10,7,1)+R('ext',222,60,10,8,1)+
 R('acL',184,110,12,10,1)+R('acR',204,110,12,10,1)+R('tie',196,113,8,4,1)+RR('bkL','bkR',96,300,8,7,1)+R('rat',224,330,8,10,1)+
 R('hL',150,180,12,10,1)+R('hC',194,180,12,10,1)+R('hR',238,180,12,10,1)+R('acmpL',150,200,12,8,1)+R('acmpR',238,200,12,8,1)+R('c1',186,200,10,8,1)+R('c2',204,200,10,8,1)+
 RR('packL','packR',184,318,14,14,2)+RR('blL','blR',126,262,8,8,1)+R('blA',196,532,8,8,1)+
 FF('f_bL','f_bR','M130 266 L184 300 M196 536 V470')+F('f_bA','M200 532 V330')+
 FF('f_el','f_er','M108 286 L186 116')+F('f_apu','M200 546 V122')+F('f_ext','M222 64 L210 110')+F('f_bat','M193 47 V110')+
 FF('f_hL','f_hR','M118 286 L156 190')+F('f_hC','M200 208 V420')+FF('f_fu','f_fr','M110 300 L120 296 L184 280')+F('f_fc','M200 304 V330')+
 RR('fpLF','fpRF',150,268,6,6,1)+RR('fpLA','fpRA',140,290,6,6,1)+RR('fpCL','fpCR',186,296,6,6,1)+R('xf',197,284,6,6,1)+
 CC('navL','navR',26,362,3)+Ci('navT',200,588,2.6)+Ci('bcn',200,140,3)+Ci('bcn2',200,420,3)+CC('strL','strR',30,366,2.4)+
 RR('gearL','gearR',176,326,10,16,2)+R('gearN',196,56,8,10,2)+PP('flapL','flapR','M181 318 L70 356 L72 362 L181 324 Z','sp');
const labels=Lb(200,8,'NEZ')+Lb(78,226,'MOTEUR GAUCHE GE90')+Lb(322,226,'MOTEUR DROIT GE90')+Lb(200,602,'APU')+Lb(150,176,'HYD G','middle')+Lb(200,176,'HYD C','middle')+Lb(250,176,'HYD D','middle');
const NM={tkL:'Réservoir gauche (aile)',tkR:'Réservoir droit (aile)',tkC:'Réservoir central',engL:'Moteur gauche GE90-115B',engR:'Moteur droit GE90-115B',fanL:'Soufflante gauche',fanR:'Soufflante droite',
 idgL:'IDG gauche (génératrice 120 kVA)',idgR:'IDG droite',edpL:'Pompe hydraulique moteur gauche (EDP)',edpR:'Pompe hydraulique moteur droite (EDP)',apu:'APU (groupe auxiliaire)',apug:'Génératrice APU',
 bat:'Batterie principale',apubat:'Batterie APU',ext:'Prise de parc (EXT PWR)',acL:'Barre AC gauche',acR:'Barre AC droite',tie:'Contacteurs de couplage (BUS TIE)',bkL:'Génératrice de secours gauche',bkR:'Génératrice de secours droite',
 rat:'RAT (éolienne de secours)',hL:'Circuit hydraulique GAUCHE',hC:'Circuit hydraulique CENTRE',hR:'Circuit hydraulique DROIT',acmpL:'Pompe électrique gauche (ACMP)',acmpR:'Pompe électrique droite (ACMP)',c1:'Pompe électrique C1',c2:'Pompe électrique C2',
 packL:'Pack de climatisation gauche',packR:'Pack de climatisation droit',blL:'Prélèvement d\'air moteur gauche',blR:'Prélèvement d\'air moteur droit',blA:'Prélèvement d\'air APU',
 f_bL:'Air moteur gauche',f_bR:'Air moteur droit',f_bA:'Air APU',f_el:'Câbles IDG gauche',f_er:'Câbles IDG droite',f_apu:'Câbles génératrice APU',f_ext:'Câble groupe de parc',f_bat:'Câble batterie',
 f_hL:'Tuyauteries circuit gauche',f_hR:'Tuyauteries circuit droit',f_hC:'Tuyauteries circuit centre',f_fu:'Carburant aile gauche',f_fr:'Carburant aile droite',f_fc:'Carburant central',
 fpLF:'Pompe AV gauche',fpRF:'Pompe AV droite',fpLA:'Pompe AR gauche',fpRA:'Pompe AR droite',fpCL:'Pompe centrale gauche',fpCR:'Pompe centrale droite',xf:'Vanne d\'intercommunication',
 navL:'Feu de navigation rouge',navR:'Feu de navigation vert',navT:'Feu de queue',bcn:'Anticollision haut',bcn2:'Anticollision bas',strL:'Feu à éclats gauche',strR:'Feu à éclats droit',gearL:'Train principal gauche (6 roues)',gearR:'Train principal droit (6 roues)',gearN:'Train avant',flapL:'Volets gauches',flapR:'Volets droits'};
const OO=[false,true], OL=['OFF','ON'];
const ctl=[
 {g:'Électricité',w:'panneau plafond · ELEC',c:[{id:'bat',l:'BATTERY',t:'sel',o:OO,ol:OL,pg:'ÉLEC',pt:['bat','f_bat']},{id:'ext',l:'EXT PWR PRIM',t:'sel',o:OO,ol:OL,pg:'ÉLEC',pt:['ext','f_ext']},
  {id:'apuGen',l:'APU GEN',t:'sel',o:OO,ol:OL,pg:'ÉLEC',pt:['apug','f_apu']},{id:'genL',l:'L GEN CTRL',t:'sel',o:OO,ol:OL,pg:'ÉLEC',pt:['idgL','f_el']},{id:'genR',l:'R GEN CTRL',t:'sel',o:OO,ol:OL,pg:'ÉLEC',pt:['idgR','f_er']},
  {id:'tie',l:'BUS TIE',t:'sel',o:[false,true],ol:['ISLN','AUTO'],pg:'ÉLEC',pt:['tie']}]},
 {g:'APU',w:'panneau plafond',c:[{id:'apu',l:'APU',t:'sel',o:['OFF','ON','START'],ol:['OFF','ON','START'],pg:'ÉLEC',pt:['apu','apubat']}]},
 {g:'Hydraulique',w:'panneau plafond · HYDRAULIC',c:[{id:'edpL',l:'L ENG PUMP',t:'sel',o:OO,ol:OL,pg:'HYD',pt:['edpL','hL','f_hL']},{id:'edpR',l:'R ENG PUMP',t:'sel',o:OO,ol:OL,pg:'HYD',pt:['edpR','hR','f_hR']},
  {id:'acmpL',l:'L ELEC PUMP',t:'sel',o:['OFF','AUTO','ON'],ol:['OFF','AUTO','ON'],pg:'HYD',pt:['acmpL','hL']},{id:'acmpR',l:'R ELEC PUMP',t:'sel',o:['OFF','AUTO','ON'],ol:['OFF','AUTO','ON'],pg:'HYD',pt:['acmpR','hR']},
  {id:'c1',l:'C1 ELEC PUMP',t:'sel',o:OO,ol:OL,pg:'HYD',pt:['c1','hC','f_hC']},{id:'c2',l:'C2 ELEC PUMP',t:'sel',o:OO,ol:OL,pg:'HYD',pt:['c2','hC','f_hC']}]},
 {g:'Carburant',w:'panneau plafond · FUEL',c:[{id:'fpL',l:'L FWD / AFT',t:'sel',o:OO,ol:OL,pg:'CARBURANT',pt:['fpLF','fpLA','tkL','f_fu']},{id:'fpR',l:'R FWD / AFT',t:'sel',o:OO,ol:OL,pg:'CARBURANT',pt:['fpRF','fpRA','tkR','f_fr']},
  {id:'fpC',l:'CTR L / R',t:'sel',o:OO,ol:OL,pg:'CARBURANT',pt:['fpCL','fpCR','tkC','f_fc']},{id:'xf',l:'CROSSFEED',t:'sel',o:OO,ol:['FERMÉE','OUVERTE'],pg:'CARBURANT',pt:['xf']}]},
 {g:'Air',w:'panneau plafond · AIR COND / BLEED',c:[{id:'blA',l:'APU BLEED',t:'sel',o:OO,ol:['OFF','AUTO'],pg:'AIR',pt:['blA','f_bA']},{id:'blL',l:'L ENG BLEED',t:'sel',o:OO,ol:['OFF','ON'],pg:'AIR',pt:['blL','f_bL']},
  {id:'blR',l:'R ENG BLEED',t:'sel',o:OO,ol:['OFF','ON'],pg:'AIR',pt:['blR','f_bR']},{id:'packL',l:'L PACK',t:'sel',o:OO,ol:['OFF','AUTO'],pg:'AIR',pt:['packL']},{id:'packR',l:'R PACK',t:'sel',o:OO,ol:['OFF','AUTO'],pg:'AIR',pt:['packR']}]},
 {g:'Démarrage moteurs',w:'plafond (START) et pédestal (FUEL CONTROL)',c:[{id:'stL',l:'L START',t:'sel',o:['NORM','GND'],ol:['NORM','GND'],pg:'MOTEURS',pt:['engL','f_bL']},{id:'stR',l:'R START',t:'sel',o:['NORM','GND'],ol:['NORM','GND'],pg:'MOTEURS',pt:['engR','f_bR']},
  {id:'fcL',l:'FUEL CONTROL L',t:'sel',o:['CUTOFF','RUN'],ol:['CUTOFF','RUN'],pg:'MOTEURS',pt:['engL','f_fu']},{id:'fcR',l:'FUEL CONTROL R',t:'sel',o:['CUTOFF','RUN'],ol:['CUTOFF','RUN'],pg:'MOTEURS',pt:['engR','f_fr']}]},
 {g:'Poussée',w:'pédestal',c:[{id:'thr',l:'MANETTES DE POUSSÉE',t:'sel',o:['IDLE','CLB','TO'],ol:['IDLE','CLB','TO/GA'],pg:'MOTEURS',pt:['engL','engR','fanL','fanR']}]},
 {g:'Feux',w:'panneau plafond',c:[{id:'bcn',l:'BEACON',t:'sel',o:OO,ol:OL,pg:'ÉLEC',pt:['bcn','bcn2']},{id:'nav',l:'NAV',t:'sel',o:OO,ol:OL,pg:'ÉLEC',pt:['navL','navR','navT']},{id:'strobe',l:'STROBE',t:'sel',o:OO,ol:OL,pg:'ÉLEC',pt:['strL','strR']}]},
 {g:'Commandes',w:'pédestal et planche',c:[{id:'flaps',l:'VOLETS',t:'sel',o:[0,1,5,15,20,25,30],ol:['UP','1','5','15','20','25','30'],pg:'HYD',pt:['flapL','flapR']},{id:'gear',l:'TRAIN',t:'sel',o:['DOWN','UP'],ol:['DOWN','UP'],pg:'HYD',pt:['gearL','gearR','gearN']}]}];
function init(){ return {ground:true,bat:false,ext:false,extAv:true,apuGen:false,genL:true,genR:true,tie:true,apu:'OFF',apuN:0,apuSt:0,edpL:true,edpR:true,acmpL:'AUTO',acmpR:'AUTO',c1:true,c2:true,
  fpL:false,fpR:false,fpC:false,xf:false,blA:true,blL:true,blR:true,packL:true,packR:true,stL:'NORM',stR:'NORM',fcL:'CUTOFF',fcR:'CUTOFF',n2:[0,0],run:[false,false],egt:[20,20],thr:'IDLE',bcn:false,nav:false,strobe:false,flaps:0,fp:0,gear:'DOWN',gp:1,t:0,fuel:[50000,40000,50000]}; }
function kk(s){ const k={}; k.dc=s.bat||s.ext||s.apuGen&&s.apuSt===2; k.apuAv=s.apuSt===2; k.gen=[s.genL&&s.run[0],s.genR&&s.run[1]]; k.extOn=s.ext&&s.ground&&s.extAv; k.apuOn=k.apuAv&&s.apuGen;
  k.acL=k.gen[0]||k.extOn||k.apuOn||(s.tie&&k.gen[1]); k.acR=k.gen[1]||k.extOn||k.apuOn||(s.tie&&k.gen[0]); k.ac=k.acL||k.acR;
  k.air=(s.blA&&k.apuAv)||(s.blL&&s.run[0])||(s.blR&&s.run[1]); k.airAPU=s.blA&&k.apuAv;
  k.hL=(s.edpL&&s.run[0])||(k.ac&&(s.acmpL==='ON'||s.acmpL==='AUTO'&&!s.run[0])); k.hR=(s.edpR&&s.run[1])||(k.ac&&(s.acmpR==='ON'||s.acmpR==='AUTO'&&!s.run[1])); k.hC=k.ac&&(s.c1||s.c2);
  k.pressL=k.ac&&(s.fpL||s.fpC||s.xf&&s.fpR); k.pressR=k.ac&&(s.fpR||s.fpC||s.xf&&s.fpL); k.press=[k.pressL||s.run[0],k.pressR||s.run[1]];
  k.starter=[s.stL==='GND'&&k.air,s.stR==='GND'&&k.air]; return k; }
function step(s,dt){ const k=kk(s); s.t+=dt;
  if(s.apu==='START'&&k.dc&&s.apuSt===0){ s.apuSt=1; } if(s.apuSt===1){ s.apuN=Math.min(100,s.apuN+dt*4); if(s.apuN>=100){ s.apuSt=2; s.apu='ON'; } }
  if(s.apu==='OFF'&&s.apuSt){ s.apuN=Math.max(0,s.apuN-dt*6); if(s.apuN<=0) s.apuSt=0; else s.apuSt=Math.min(s.apuSt,1); }
  [0,1].forEach(i=>{ const st=i?s.stR:s.stL, fc=i?s.fcR:s.fcL; let tgt=0;
    if(s.run[i]) tgt=fc==='RUN'?(s.thr==='TO'?99:s.thr==='CLB'?92:62):0; else if(k.starter[i]) tgt=30; s.n2[i]=near(s.n2[i],tgt,dt*(s.run[i]?0.35:0.18));
    if(!s.run[i]&&fc==='RUN'&&s.n2[i]>=24&&k.press[i]) s.run[i]=true;   // carburant + allumage → combustion
    if(s.run[i]&&(fc==='CUTOFF'||s.efail&&i===0)) s.run[i]=false;
    if(s.run[i]&&s.n2[i]>=50&&st==='GND'){ if(i) s.stR='NORM'; else s.stL='NORM'; }   // coupure du démarreur, le sélecteur revient sur NORM
    s.egt[i]=near(s.egt[i],s.run[i]?(s.n2[i]<55?560:430):20,dt*0.3); });
  s.fp=near(s.fp,s.flaps,dt*0.6*(k.hC?1:0.2)); s.gp=near(s.gp,s.gear==='DOWN'?1:0,dt*0.15*(k.hC?1:0));
  if(s.run[0]||s.run[1]){ const ff=(s.run[0]?0.6:0)+(s.run[1]?0.6:0); s.fuel[1]=Math.max(0,s.fuel[1]-ff*dt*(s.fpC?1:0)); } }
function ev(s){ const k=kk(s), p={}, sp={}, A=(id,c,m)=>{ p[id]=m?[c,m]:c; };
  if(s.bat){ A('bat','el'); A('f_bat','el','flow'); } if(k.extOn){ A('ext','el'); A('f_ext','el','flow'); } if(k.apuOn){ A('apug','el'); A('f_apu','el','flow'); }
  if(k.acL) A('acL','el'); if(k.acR) A('acR','el'); if(s.tie&&k.ac) A('tie','el'); if(k.gen[0]){ A('idgL','el'); A('f_el','el','flow'); } if(k.gen[1]){ A('idgR','el'); A('f_er','el','flow'); }
  if(s.apuSt===1){ A('apu','me','blink'); A('apubat','el'); } if(k.apuAv) A('apu','me');
  if(k.airAPU){ A('blA','ah'); A('f_bA','ah','flow'); } if(s.blL&&s.run[0]){ A('blL','ah'); A('f_bL','ah','flow'); } if(s.blR&&s.run[1]){ A('blR','ah'); A('f_bR','ah','flow'); }
  if(s.packL&&k.air) A('packL','ac'); if(s.packR&&k.air) A('packR','ac');
  if(k.starter[0]){ A('f_bL','ah','flow'); A('engL','me','blink'); } if(k.starter[1]){ A('f_bR','ah','flow'); A('engR','me','blink'); }
  [0,1].forEach(i=>{ const e=i?'engR':'engL', f=i?'fanR':'fanL'; if(s.run[i]){ A(e,'hot'); A(f,'me','spin'); } else if(s.n2[i]>1) A(f,'me','blink'); });
  if(k.hL){ A('hL','hg'); A('f_hL','hg','st'); } if(k.hR){ A('hR','hg'); A('f_hR','hg','st'); } if(k.hC){ A('hC','hg'); A('f_hC','hg','st'); }
  if(s.edpL&&s.run[0]) A('edpL','hg'); if(s.edpR&&s.run[1]) A('edpR','hg'); if(k.ac&&(s.acmpL==='ON'||s.acmpL==='AUTO'&&!s.run[0])) A('acmpL','el'); if(k.ac&&(s.acmpR==='ON'||s.acmpR==='AUTO'&&!s.run[1])) A('acmpR','el'); if(k.ac&&s.c1) A('c1','el'); if(k.ac&&s.c2) A('c2','el');
  A('tkL','fu','dim'); A('tkR','fu','dim'); A('tkC','fu','dim'); if(k.ac&&s.fpL){ A('fpLF','fu'); A('fpLA','fu'); A('f_fu','fu','flow'); } if(k.ac&&s.fpR){ A('fpRF','fu'); A('fpRA','fu'); A('f_fr','fu','flow'); } if(k.ac&&s.fpC){ A('fpCL','fu'); A('fpCR','fu'); A('f_fc','fu','flow'); } if(s.xf) A('xf','fu');
  if(k.dc){ if(s.bcn){ A('bcn','lr','blink'); A('bcn2','lr','blink'); } if(s.nav){ A('navL','lr'); A('navR','lg'); A('navT','lt'); } if(s.strobe){ A('strL','lt','blink'); A('strR','lt','blink'); } }
  if(Math.abs(s.fp-s.flaps)>0.3){ A('flapL','hg','blink'); A('flapR','hg','blink'); } else if(s.flaps){ A('flapL','me'); A('flapR','me'); }
  if(s.gp>0.02&&s.gp<0.98){ ['gearL','gearR','gearN'].forEach(x=>A(x,'hg','blink')); } else if(s.gp>=0.98) ['gearL','gearR','gearN'].forEach(x=>A(x,'me'));
  const lv=[]; if(s.apuSt===1) lv.push('APU en démarrage : '+Math.round(s.apuN)+' %'); [0,1].forEach(i=>{ if(k.starter[i]&&!s.run[i]) lv.push(`Démarreur ${i?'droit':'gauche'} : N2 ${Math.round(s.n2[i])} %`+(s.n2[i]>=24&&(i?s.fcR:s.fcL)==='CUTOFF'?' — FUEL CONTROL sur RUN maintenant':'')); });
  const memo=[]; if(k.apuAv) memo.push([W,'APU RUNNING']); if(k.extOn) memo.push([W,'EXT PWR']); if(!k.ac&&s.bat) memo.push([AM,'ELEC AC BUS OFF']); if(s.bat&&!k.hC&&k.ac) memo.push([AM,'HYD PRESS SYS C']); if(s.run[0]&&!s.genL) memo.push([AM,'ELEC GEN OFF L']);
  return {p,sp,k,lv,memo}; }
function page(pg,s,d){ const k=d.k; let b='';
  if(pg==='MOTEURS'){ b=T(160,14,'EICAS · MOTEURS',W,12,'middle'); [0,1].forEach(i=>{ const x=90+i*140; b+=ARC(x,70,34,s.run[i]?s.n2[i]*0.38+(s.n2[i]>55?20:0):s.n2[i]*0.3,117,'N1','%',G)+ARC(x,150,28,s.egt[i],1100,'EGT','°C',s.egt[i]>1000?RD:G)+T(x,196,'N2 '+Math.round(s.n2[i])+' %',s.run[i]?G:W,11,'middle'); }); }
  else if(pg==='ÉLEC'){ b=T(160,14,'SYNOPTIQUE ÉLECTRIQUE',W,12,'middle')+T(40,50,'IDG G',k.gen[0]?G:GY,11,'middle')+T(280,50,'IDG D',k.gen[1]?G:GY,11,'middle')+T(160,50,'APU',k.apuOn?G:GY,11,'middle')+T(160,70,'EXT',k.extOn?G:GY,11,'middle')+
     T(60,110,'AC G',k.acL?G:AM,13,'middle')+T(260,110,'AC D',k.acR?G:AM,13,'middle')+T(160,110,s.tie?'BUS TIE AUTO':'ISLN',s.tie?G:AM,10,'middle')+T(160,150,'BATTERIE '+(s.bat?'ON':'OFF'),s.bat?G:AM,11,'middle')+T(160,175,'APU '+(s.apuSt===2?'EN MARCHE':s.apuSt===1?Math.round(s.apuN)+' %':'ARRÊTÉ'),s.apuSt===2?G:W,11,'middle'); }
  else if(pg==='HYD'){ b=T(160,14,'HYDRAULIQUE (3 circuits)',W,12,'middle'); [['GAUCHE',k.hL],['CENTRE',k.hC],['DROIT',k.hR]].forEach((h,i)=>{ b+=T(60+i*100,60,h[0],W,11,'middle')+T(60+i*100,90,h[1]?'3 000 PSI':'0',h[1]?G:AM,14,'middle'); });
     b+=T(160,140,'VOLETS '+Math.round(s.fp),Math.abs(s.fp-s.flaps)>0.3?CY:G,13,'middle')+T(160,170,'TRAIN '+(s.gp>0.98?'DOWN':s.gp<0.02?'UP':'EN TRANSIT'),s.gp>0.98?G:s.gp<0.02?W:AM,12,'middle'); }
  else if(pg==='CARBURANT'){ b=T(160,14,'CARBURANT',W,12,'middle')+T(60,70,(s.fuel[0]/1000).toFixed(1)+' t',W,14,'middle')+T(160,70,(s.fuel[1]/1000).toFixed(1)+' t',W,14,'middle')+T(260,70,(s.fuel[2]/1000).toFixed(1)+' t',W,14,'middle')+
     T(60,95,'AILE G',CY,10,'middle')+T(160,95,'CENTRAL',CY,10,'middle')+T(260,95,'AILE D',CY,10,'middle')+T(60,140,k.press[0]?'PRESSION OK':'PRESS BASSE',k.press[0]?G:AM,10,'middle')+T(260,140,k.press[1]?'PRESSION OK':'PRESS BASSE',k.press[1]?G:AM,10,'middle')+T(160,170,'INTERCOM '+(s.xf?'OUVERTE':'FERMÉE'),s.xf?G:W,10,'middle'); }
  else if(pg==='AIR'){ b=T(160,14,'AIR · PRÉLÈVEMENTS',W,12,'middle')+T(160,60,'APU '+(k.airAPU?'ALIMENTE':'—'),k.airAPU?G:W,11,'middle')+T(60,90,'MOTEUR G '+(s.blL&&s.run[0]?'ON':'—'),s.blL&&s.run[0]?G:W,10,'middle')+T(260,90,'MOTEUR D '+(s.blR&&s.run[1]?'ON':'—'),s.blR&&s.run[1]?G:W,10,'middle')+T(160,130,'PACKS '+(s.packL&&k.air?'G ':'')+(s.packR&&k.air?'D':''),k.air?G:AM,11,'middle'); }
  return SCR(b,d.memo); }
function on(s,id,v,prev){ if(id==='gear'&&s.ground&&v==='UP') s.gear='DOWN'; if(id==='ext'&&!s.ground) s.ext=false; }
function ex(id,s,d){ const k=d.k, o={ln:[]}, ln=(c,t)=>o.ln.push([c,t]), blk=(t,go)=>{ o.blk=t; o.go=go; };
 switch(id){
 case 'bat': o.h='BATTERY — Batterie principale'; ln('el','Batterie 28 V : alimente les équipements essentiels et le démarrage de l\'APU (avec la batterie APU). Seule, elle ne permet pas de faire fonctionner l\'avion.'); break;
 case 'ext': o.h='EXT PWR — Groupe de parc'; ln('el','Prise de parc 115 V 400 Hz : alimente les barres AC au sol, moteurs et APU arrêtés.'); if(!s.ground) blk('En vol, pas de groupe de parc.'); break;
 case 'apu': o.h='APU — Groupe auxiliaire de puissance'; ln('me','Petite turbine dans la queue : génératrice électrique et air comprimé (démarrage des moteurs, climatisation au sol).'); ln('el','START : la batterie APU entraîne le démarreur ; ≈ 1 min jusqu\'à « APU RUNNING ».'); if(!k.dc) blk('Batterie OFF : impossible de démarrer l\'APU.','bat'); break;
 case 'apuGen': o.h='APU GEN — Génératrice APU'; ln('el','Alimente les barres AC gauche et droite quand l\'APU tourne.'); if(!k.apuAv) blk('APU arrêté : génératrice sans effet.','apu'); break;
 case 'genL': case 'genR': o.h=(id==='genL'?'L':'R')+' GEN CTRL — IDG'; ln('me','IDG : génératrice entraînée par le moteur à vitesse constante (fréquence 400 Hz stable).'); ln('el','Alimente sa barre AC ; si elle manque, l\'autre côté reprend par les contacteurs de couplage, puis les génératrices de secours.'); if(!s.run[id==='genL'?0:1]) blk('Moteur arrêté : l\'IDG ne produit rien.',id==='genL'?'stL':'stR'); break;
 case 'tie': o.h='BUS TIE — Couplage des barres'; ln('el','AUTO : si une source manque, les deux barres AC sont reliées automatiquement. ISLN : barres séparées.'); break;
 case 'edpL': case 'edpR': o.h=(id==='edpL'?'L':'R')+' ENG PUMP'; ln('hg','Pompe hydraulique entraînée par le moteur : source principale du circuit '+(id==='edpL'?'gauche':'droit')+'.'); if(!s.run[id==='edpL'?0:1]) blk('Moteur arrêté : la pompe ne tourne pas ; la pompe électrique (AUTO) prend le relais.',id==='edpL'?'acmpL':'acmpR'); break;
 case 'acmpL': case 'acmpR': o.h=(id==='acmpL'?'L':'R')+' ELEC PUMP'; ln('hg','Pompe électrique d\'appoint : AUTO la fait tourner quand la pompe moteur ne suffit pas (moteur arrêté, forte demande).'); if(!k.ac) blk('Pas de courant alternatif : la pompe ne tourne pas.','apuGen'); break;
 case 'c1': case 'c2': o.h=id.toUpperCase()+' ELEC PUMP — circuit centre'; ln('hg','Le circuit centre alimente train, volets, freins de secours et une partie des commandes de vol ; deux pompes électriques et deux pompes à air (ADP).'); if(!k.ac) blk('Pas de courant alternatif.','apuGen'); break;
 case 'fpL': case 'fpR': case 'fpC': o.h={fpL:'Pompes aile gauche',fpR:'Pompes aile droite',fpC:'Pompes du réservoir central'}[id]; ln('fu',id==='fpC'?'On consomme d\'abord le central (pompes plus puissantes) puis les ailes.':'Deux pompes (avant, arrière) alimentent le moteur du même côté.'); if(!k.ac) blk('Pas de courant alternatif : pompes arrêtées (aspiration par gravité seulement).','apuGen'); break;
 case 'xf': o.h='CROSSFEED — Intercommunication'; ln('fu','Relie les deux côtés : rééquilibrage ou alimentation d\'un moteur depuis l\'autre aile.'); break;
 case 'blA': o.h='APU BLEED'; ln('ah','Air comprimé de l\'APU : démarrage des moteurs et climatisation au sol.'); if(!k.apuAv) blk('APU arrêté : pas d\'air.','apu'); break;
 case 'blL': case 'blR': o.h=(id==='blL'?'L':'R')+' ENG BLEED'; ln('ah','Air prélevé au compresseur du moteur : climatisation, pressurisation, antigivrage.'); break;
 case 'packL': case 'packR': o.h=(id==='packL'?'L':'R')+' PACK'; ln('ac','Machine à cycle à air : refroidit l\'air prélevé et pressurise la cabine.'); if(!k.air) blk('Aucune source d\'air.','blA'); break;
 case 'stL': case 'stR': { const i=id==='stL'?0:1; o.h=(i?'R':'L')+' START — Démarrage moteur '+(i?'droit':'gauche'); ln('ah','1. GND : la vanne de démarrage s\'ouvre, l\'air de l\'APU fait tourner le démarreur à air, le N2 monte.'); ln('fu','2. Vers 25 % de N2 : FUEL CONTROL sur RUN, la régulation (EEC) envoie carburant et allumage.'); ln('me','3. Allumage, l\'EGT monte (surveiller la limite) ; vers 50 % de N2 le démarreur se coupe et le sélecteur revient sur NORM.');
   if(!k.air) blk('Pas d\'air de démarrage : APU en marche et APU BLEED sur AUTO d\'abord.','blA'); else if(!k.press[i]) blk('Pression carburant basse : pompes carburant ON.',i?'fpR':'fpL'); break; }
 case 'fcL': case 'fcR': { const i=id==='fcL'?0:1, n2=s.n2[i]; o.h='FUEL CONTROL '+(i?'R':'L'); ln('fu','RUN : carburant et allumage autorisés ; CUTOFF : coupe le carburant, le moteur s\'arrête (procédure d\'arrêt).'); if((i?s.fcR:s.fcL)==='RUN'&&!s.run[i]&&n2<20&&n2>1) blk('Trop tôt : attendre au moins 25 % de N2 (sinon démarrage chaud).',i?'fcR':'fcL'); break; }
 case 'thr': o.h='Manettes de poussée'; ln('dat','Les manettes donnent une consigne à la régulation électronique (EEC) de chaque GE90 ; l\'automanette peut les déplacer. TO/GA : poussée de décollage ou de remise des gaz.'); if(!s.run[0]&&!s.run[1]) blk('Moteurs arrêtés.','stR'); break;
 case 'bcn': case 'nav': case 'strobe': o.h={bcn:'BEACON — Anticollision',nav:'NAV — Navigation',strobe:'STROBE — Éclats'}[id]; ln('lt',{bcn:'Feux rouges à éclats : signale moteurs en route ou démarrage imminent.',nav:'Rouge à gauche, vert à droite, blanc à l\'arrière.',strobe:'Flashs blancs, allumés en entrant sur la piste.'}[id]); break;
 case 'flaps': o.h='Levier des volets'; ln('hg','Volets et becs par le circuit hydraulique CENTRE (secours électrique). Crans 1-5-15-20-25-30.'); if(!k.hC) blk('Circuit centre sans pression : C1 / C2 ON (avec courant alternatif).','c1'); break;
 case 'gear': o.h='Levier de train'; ln('hg','Train par le circuit CENTRE ; secours par gravité (déverrouillage électrique).'); if(s.ground) ln('me','Au sol, un capteur d\'écrasement des amortisseurs interdit la rentrée.'); break;
 case 'ground': o.h='Situation'; ln('me',s.ground?'Au sol.':'En vol.'); break; }
 return o; }
const tours={start:{n:'Mise en route : APU puis les deux moteurs',st:[['bat',true,'Batterie ON : écrans et APU disponibles.'],['ext',true,'Groupe de parc : les barres AC s\'allument.'],['apu','START','APU START : environ une minute.',s=>s.apuSt===2,'Attendre APU RUNNING'],
  ['apuGen',true,'Génératrice APU.'],['ext',false,'Groupe de parc débranché.'],['blA',true,'APU BLEED AUTO : air pour le démarrage.'],['fpL',true,'Pompes carburant gauche.'],['fpR',true,'Pompes droite.'],['fpC',true,'Pompes centrales.'],['bcn',true,'BEACON : on va démarrer.'],
  ['stR','GND','R START GND : air de l\'APU vers le démarreur du moteur droit (on démarre souvent le droit d\'abord, côté opposé à la porte passagers).',s=>s.n2[1]>=24,'Attendre N2 25 %'],['fcR','RUN','FUEL CONTROL R sur RUN : carburant et allumage.',s=>s.run[1]&&s.stR==='NORM','Attendre la stabilisation (sélecteur revenu sur NORM)'],
  ['stL','GND','L START GND.',s=>s.n2[0]>=24,'Attendre N2 25 %'],['fcL','RUN','FUEL CONTROL L sur RUN.',s=>s.run[0]&&s.stL==='NORM','Attendre la stabilisation'],['apu','OFF','APU OFF après la mise en route (les IDG alimentent l\'avion).']]}};
function preset(n){ const s=init(); if(n==='cold') return s; Object.assign(s,{bat:true,ext:true,nav:true}); if(n==='elec') return s; Object.assign(s,{ext:false,fpL:true,fpR:true,fpC:true,run:[true,true],n2:[62,62],egt:[430,430],fcL:'RUN',fcR:'RUN',bcn:true}); return s; }
const snd=(s,d)=>({hum:d.k.ac?1:0,fan:d.k.dc?1:0,eng:[0,1].map(i=>({n:s.n2[i],burn:s.run[i]})),motor:Math.abs(s.fp-s.flaps)>0.3,hyd:d.k.hC?1:0,ign:false,air:d.k.air?0.4:0});
MOD.b777={snd,name:'Boeing 777-300ER',sub:'2 turboréacteurs GE90-115B · 3 circuits hydrauliques (G, C, D) · IDG + APU + génératrices de secours + RAT · commandes électriques',vb:'0 0 400 600',svg:body+parts+labels,names:NM,ctl,init,step,ev,page,ex,on,tours,preset,
 pages:['MOTEURS','ÉLEC','HYD','CARBURANT','AIR'],legend:['el','fu','hg','ah','ac','me','hot','lt'],presets:[['cold','Avion froid'],['elec','Sous tension'],['run','Moteurs en route']],
 ground:{on:s=>{ if(s.ground){ if(!s.run[0]&&!s.run[1]) return 'Aucun moteur ne tourne.'; s.ground=false; s.ext=false; } else { if(s.gp<0.99) return 'Train rentré !'; s.ground=true; } }}};
})();
