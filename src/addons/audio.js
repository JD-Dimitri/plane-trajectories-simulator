/* =====================================================================================================
   V7 — MOTEUR AUDIO RÉALISTE (100 % synthèse Web Audio, aucun enregistrement reproduit)
   Sources simulées : réacteurs (soufflante, compresseur HP, jet, démarreur, allumeurs), APU, rotors (claquement de pales,
   rotor de queue), moteur à pistons (R44), turbines d'hélicoptère ; écoulement aérodynamique (fonction de la vitesse
   conventionnelle), train sorti, aérofreins, tremblement ; roulement au sol, joints de dalles, feux d'axe, toucher des roues,
   freins, inverseurs ; hydraulique (train, volets, « chien qui aboie » PTU de l'A320) ; poste : ventilation avionique,
   400 Hz du réseau électrique, conditionnement d'air, déclics des commandes ; alarmes (single chime, CRC, cavalry charge,
   C-chord, cricket de décrochage, vibreur de manche, clacker de survitesse, klaxon bas régime rotor), annonces radiosonde ;
   humains : copilote (annonces SOP), commandant et PNC (annonces cabine FR/EN), mécanicien sol (interphone), murmure des
   passagers, ceintures ; environnement : aéroport (jets lointains, véhicules, groupe de parc), vent et rafales du METAR, pluie
   sur le pare-brise, essuie-glaces, grêle, tonnerre (délai éclair → tonnerre = distance / 343 m/s), turbulence, oiseaux,
   grillons la nuit, pas sur le tarmac.
   Niveaux relatifs [ESTIMÉ] : mixage pédagogique, pas une mesure acoustique certifiée.
   ===================================================================================================== */
(function(){
'use strict';
const SND=window.SND={ctx:null,ready:false,on:true,
  vol:{master:0.85,eng:0.9,aero:0.85,wx:0.85,ck:0.9,alert:1,vox:0.95,env:0.8},
  opt:{callouts:true,pa:true,pax:true,crew:true,acVoice:true},
  n:{},P:{},T:{},lastVoice:0};
try{ const s=JSON.parse(ls.get('sim-snd')||'null'); if(s){ Object.assign(SND.vol,s.vol||{}); Object.assign(SND.opt,s.opt||{}); if(s.on===false) SND.on=false; } }catch(e){}
function save(){ ls.set('sim-snd',JSON.stringify({vol:SND.vol,opt:SND.opt,on:SND.on})); }
const cl=(x,a,b)=>x<a?a:x>b?b:x, now=()=>SND.ctx.currentTime, R=Math.random;

/* ---------- contexte et graphe ---------- */
function unlock(){ try{ if(!SND.ctx){ AUD=AUD||new (window.AudioContext||window.webkitAudioContext)(); SND.ctx=AUD; }
  if(SND.ctx.state==='suspended') SND.ctx.resume(); if(!SND.ready) build(); }catch(e){ console.warn('Audio indisponible',e); } }
SND.unlock=unlock;
['pointerdown','keydown','touchstart'].forEach(ev=>addEventListener(ev,unlock,{passive:true}));

function noiseBuf(kind,sec){ const c=SND.ctx, n=Math.floor(c.sampleRate*sec), b=c.createBuffer(2,n,c.sampleRate);
  for(let ch=0;ch<2;ch++){ const d=b.getChannelData(ch); let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0,last=0;
    for(let i=0;i<n;i++){ const w=R()*2-1;
      if(kind==='white') d[i]=w*0.5;
      else if(kind==='pink'){ b0=0.99886*b0+w*0.0555179; b1=0.99332*b1+w*0.0750759; b2=0.969*b2+w*0.153852; b3=0.8665*b3+w*0.3104856; b4=0.55*b4+w*0.5329522; b5=-0.7616*b5-w*0.016898; d[i]=(b0+b1+b2+b3+b4+b5+b6+w*0.5362)*0.11; b6=w*0.115926; }
      else if(kind==='brown'){ last=(last+0.02*w)/1.02; d[i]=last*3.2; }
      else if(kind==='crackle'){ d[i]=R()<0.0035?(R()*2-1)*(0.4+R()*0.6):0; }       // impacts de gouttes
      else if(kind==='hail'){ d[i]=R()<0.0009?(R()*2-1):0; } } }
  return b; }
function G(v){ const g=SND.ctx.createGain(); g.gain.value=v==null?1:v; return g; }
function F(type,f,q){ const x=SND.ctx.createBiquadFilter(); x.type=type; x.frequency.value=f; if(q!=null) x.Q.value=q; return x; }
function O(type,f){ const o=SND.ctx.createOscillator(); o.type=type; o.frequency.value=f; o.start(); return o; }
function src(buf){ const s=SND.ctx.createBufferSource(); s.buffer=buf; s.loop=true; s.loopStart=R()*0.5; s.start(0,R()*buf.duration); return s; }
function pan(v){ const c=SND.ctx; if(c.createStereoPanner){ const p=c.createStereoPanner(); p.pan.value=v||0; return p; } return G(1); }
function chain(...a){ for(let i=0;i<a.length-1;i++) a[i].connect(a[i+1]); return a[a.length-1]; }
function set(param,v,tau){ if(!param) return; try{ param.setTargetAtTime(v,now(),tau||0.12); }catch(e){ param.value=v; } }
function shaper(fn,n=1024){ const w=SND.ctx.createWaveShaper(), c=new Float32Array(n); for(let i=0;i<n;i++) c[i]=fn(i/(n-1)*2-1); w.curve=c; return w; }

function build(){ const c=SND.ctx, N=SND.n; SND.ready=true;
  N.buf={white:noiseBuf('white',3),pink:noiseBuf('pink',4),brown:noiseBuf('brown',4),crackle:noiseBuf('crackle',3),hail:noiseBuf('hail',3)};
  const comp=c.createDynamicsCompressor(); comp.threshold.value=-16; comp.knee.value=8; comp.ratio.value=5; comp.attack.value=0.004; comp.release.value=0.25; comp.connect(c.destination);
  N.out=G(SND.on?SND.vol.master:0); N.out.connect(comp);
  N.live=G(0); N.live.connect(N.out);                  // tout le son « simulation » passe ici (coupé en pause / menu)
  N.prev=G(0.9); N.prev.connect(N.out);                // écoute des sons depuis le dossier / le mélangeur
  // bus ; les sources extérieures traversent le « fuselage » (filtre passe-bas variable selon la vue)
  const bus=(k,hull)=>{ const g=G(SND.vol[k]); if(hull){ const h=F('lowpass',18000,0.5); g.connect(h); h.connect(N.live); N['hull_'+k]=h; } else g.connect(N.live); N[k]=g; return g; };
  bus('eng',true); bus('aero',false); bus('wx',true); bus('ck',false); bus('alert',false); bus('vox',false); bus('env',true);
  const P=SND.P;
  // ---- réacteurs / turbines (2) ----
  P.eng=[0,1].map(i=>{ const pn=pan(i?0.35:-0.35); pn.connect(N.eng); const e={pn};
    e.roarG=G(0); chain(src(N.buf.pink),e.roarF=F('lowpass',600,0.7),e.roarG,pn);
    e.jetG=G(0); chain(src(N.buf.brown),F('lowpass',260,0.6),e.jetG,pn);
    e.whO=O('sawtooth',800); e.whG=G(0); chain(e.whO,e.whF=F('bandpass',1200,6),e.whG,pn);
    e.wh2=O('triangle',1600); e.wh2G=G(0); chain(e.wh2,e.wh2G,pn);
    e.fanO=O('sine',2500); e.fanG=G(0); chain(e.fanO,e.fanG,pn);
    e.bzO=O('sawtooth',80); e.bzG=G(0); chain(e.bzO,F('lowpass',1400,1),e.bzG,pn);     // « buzz-saw » (sons multiples purs) à forte poussée
    e.stO=O('sawtooth',300); e.stG=G(0); chain(e.stO,e.stF=F('bandpass',900,4),e.stG,pn);   // démarreur pneumatique
    e.n1=0; e.n2=0; return e; });
  // ---- rotor principal + rotor de queue (claquement de pales par modulation d'amplitude) ----
  { const r={}; r.am=O('sine',15); r.depth=G(0); r.base=G(0); const sh=shaper(x=>Math.pow(Math.max(0,x),5));
    r.amG=G(0); chain(src(N.buf.pink),r.f=F('bandpass',320,0.9),r.amG); r.amG.connect(N.eng);
    chain(r.am,sh,r.depth); r.depth.connect(r.amG.gain); r.base.connect(r.amG.gain);
    const dc=c.createConstantSource?c.createConstantSource():null; if(dc){ dc.offset.value=1; dc.start(); dc.connect(r.base); }
    r.thO=O('sine',15); r.thG=G(0); r.thO.connect(r.thG); r.thG.connect(N.eng);           // fondamentale grave (« wop-wop »)
    r.trO=O('square',90); r.trG=G(0); chain(r.trO,F('lowpass',700,2),r.trG,N.eng);        // rotor anticouple
    P.rot=r; }
  // ---- moteur à pistons (R44 : Lycoming 6 cylindres) ----
  { const p={}; p.o=O('sawtooth',130); p.g=G(0); chain(p.o,shaper(x=>Math.tanh(3*x)),p.f=F('lowpass',900,1.5),p.g,N.eng); p.o2=O('square',65); p.g2=G(0); chain(p.o2,F('lowpass',300,1),p.g2,N.eng); P.pis=p; }
  // ---- APU ----
  { const a={}; a.o=O('sawtooth',300); a.g=G(0); chain(a.o,a.f=F('bandpass',3000,8),a.g,N.eng); a.nG=G(0); chain(src(N.buf.pink),F('bandpass',1400,0.8),a.nG,N.eng); a.n=0; P.apu=a; }
  // ---- aérodynamique ----
  P.wind=G(0); chain(src(N.buf.pink),P.windF=F('bandpass',500,0.6),P.wind,N.aero);
  P.windHi=G(0); chain(src(N.buf.white),F('highpass',3500,0.7),P.windHi,N.aero);
  P.gearR=G(0); chain(src(N.buf.brown),F('lowpass',240,0.8),P.gearR,N.aero);
  P.buf=G(0); P.bufAm=O('sine',8); { const d=G(0.5), b=G(0); chain(src(N.buf.brown),F('lowpass',110,1),b,P.buf,N.aero); P.bufAm.connect(d); d.connect(b.gain); P.bufB=b; }
  // ---- sol ----
  P.roll=G(0); chain(src(N.buf.brown),F('lowpass',150,0.9),P.roll,N.aero);
  P.tyre=G(0); chain(src(N.buf.pink),F('bandpass',800,1.2),P.tyre,N.aero);
  P.sq=G(0); P.sqO=O('sine',2300); { const v=O('sine',7), vg=G(60); v.connect(vg); vg.connect(P.sqO.frequency); } chain(P.sqO,P.sq,N.aero);
  // ---- météo ----
  P.rain=G(0); chain(src(N.buf.crackle),F('highpass',700,0.6),P.rain,N.wx);
  P.rainH=G(0); chain(src(N.buf.white),F('bandpass',5000,0.5),P.rainH,N.wx);
  P.hail=G(0); chain(src(N.buf.hail),F('bandpass',1800,0.9),P.hail,N.wx);
  P.owind=G(0); chain(src(N.buf.pink),P.owindF=F('lowpass',500,0.8),P.owind,N.wx);
  // ---- poste ----
  P.hum=G(0); chain(O('sine',400),P.hum,N.ck); P.hum2=G(0); chain(O('sine',800),P.hum2,N.ck);
  P.fan=G(0); chain(src(N.buf.pink),F('bandpass',1100,0.8),P.fan,N.ck);
  P.pack=G(0); chain(src(N.buf.pink),F('bandpass',520,0.5),P.pack,N.ck);
  P.hyd=G(0); P.hydO=O('sawtooth',360); chain(P.hydO,F('bandpass',700,3),P.hyd,N.ck);
  P.flp=G(0); P.flpO=O('sawtooth',520); chain(P.flpO,F('bandpass',1000,4),P.flp,N.ck);
  // ---- passagers : brouhaha (formants filtrés, modulation aléatoire) ----
  P.pax=G(0); const pf=F('lowpass',1300,0.7); pf.connect(P.pax); P.pax.connect(N.ck);
  P.paxV=[330,620,1150,2300,480].map(f=>{ const g=G(0); chain(src(N.buf.pink),F('bandpass',f,5),g,pf); return g; });
  // ---- aéroport ----
  P.apt=G(0); chain(src(N.buf.brown),F('lowpass',320,0.7),P.apt,N.env);
  P.gpu=G(0); P.gpuO=O('sawtooth',29); chain(P.gpuO,F('lowpass',160,1),P.gpu,N.env);
  // boucle
  setInterval(tick,50); }

/* ---------- générateurs ponctuels ---------- */
function env(g,t0,a,peak,d,sus){ const p=g.gain; p.cancelScheduledValues(t0); p.setValueAtTime(0.0001,t0); p.linearRampToValueAtTime(peak,t0+a); p.setTargetAtTime(sus||0.0001,t0+a,d/4); }
function out(bus){ return bus==='prev'?SND.n.prev:(SND.n[bus]||SND.n.ck); }
function bell(f,dur,vol,bus,t0){ if(!SND.ready) return; const c=SND.ctx; t0=t0||now(); const g=G(0); g.connect(out(bus||'alert'));
  [[1,1],[2.76,0.45],[5.4,0.25],[8.93,0.12]].forEach(([m,a])=>{ const o=c.createOscillator(); o.type='sine'; o.frequency.value=f*m; const og=G(a); o.connect(og); og.connect(g); o.start(t0); o.stop(t0+dur+0.1); });
  g.gain.setValueAtTime(0.0001,t0); g.gain.linearRampToValueAtTime(vol,t0+0.006); g.gain.exponentialRampToValueAtTime(0.0001,t0+dur); }
function tone(f,dur,vol,bus,type,t0,att){ if(!SND.ready) return; const c=SND.ctx; t0=t0||now(); const o=c.createOscillator(); o.type=type||'sine'; o.frequency.value=f; const g=G(0); o.connect(g); g.connect(out(bus||'alert'));
  g.gain.setValueAtTime(0.0001,t0); g.gain.linearRampToValueAtTime(vol,t0+(att||0.01)); g.gain.setValueAtTime(vol,t0+Math.max(0.02,dur-0.03)); g.gain.linearRampToValueAtTime(0.0001,t0+dur); o.start(t0); o.stop(t0+dur+0.05); return o; }
function burst(kind,dur,ftype,f,vol,bus,t0,att,q,fEnd){ if(!SND.ready) return; const c=SND.ctx; t0=t0||now(); const s=c.createBufferSource(); s.buffer=SND.n.buf[kind]; const fl=F(ftype,f,q==null?0.8:q); const g=G(0);
  s.connect(fl); fl.connect(g); g.connect(out(bus||'ck')); if(fEnd) fl.frequency.exponentialRampToValueAtTime(fEnd,t0+dur);
  g.gain.setValueAtTime(0.0001,t0); g.gain.linearRampToValueAtTime(vol,t0+(att||0.005)); g.gain.exponentialRampToValueAtTime(0.0001,t0+dur); s.start(t0,R()*2); s.stop(t0+dur+0.05); }
const click=(v,bus,t0)=>{ burst('white',0.03,'bandpass',3200+R()*1500,0.35*(v||1),bus||'ck',t0,0.001,2); tone(1800+R()*400,0.012,0.08*(v||1),bus||'ck','square',t0,0.001); };
const clunk=(v,bus,t0)=>{ burst('brown',0.35,'lowpass',140,0.9*(v||1),bus||'ck',t0,0.003,1); burst('white',0.05,'bandpass',900,0.2*(v||1),bus||'ck',t0,0.001,1.5); };
const thump=(v,bus,t0)=>burst('brown',0.5,'lowpass',90,1.2*(v||1),bus||'aero',t0,0.004,1);
function chirp(v,t0){ burst('white',0.14,'bandpass',2600,0.6*v,'aero',t0,0.002,3,1500); }
function cavalry(bus){ const t=now(); [523,659,784,1047,784,1047].forEach((f,i)=>tone(f,0.13,0.18,bus||'alert','square',t+i*0.12,0.005)); }
function cchord(bus,d){ const t=now(); [523.25,659.25,783.99].forEach(f=>tone(f,d||1.5,0.07,bus||'alert','triangle',t,0.04)); }
function crc(bus){ const t=now(); bell(1350,0.32,0.28,bus||'alert',t); }
function singleChime(bus){ bell(1100,0.9,0.3,bus||'alert'); }
function cricket(bus){ const t=now(); for(let i=0;i<6;i++) tone(4800,0.025,0.12,bus||'alert','square',t+i*0.045,0.002); }
function shaker(bus,d){ const t=now(); const o=SND.ctx.createOscillator(); o.type='square'; o.frequency.value=23; const g=G(0); chain(o,F('lowpass',400,1),g,out(bus||'alert')); env(g,t,0.02,0.35,d||0.6); o.start(t); o.stop(t+(d||0.6)+0.2); }
function clacker(bus,d){ const t=now(); for(let i=0;i<(d||1)*8;i++) click(1.6,bus||'alert',t+i/8); }
function cabinChime(bus){ const t=now(); bell(1318,1.4,0.22,bus||'alert',t); bell(1046,1.6,0.2,bus||'alert',t+0.45); }
function callChime(bus){ const t=now(); bell(1568,0.7,0.2,bus||'alert',t); bell(1568,0.7,0.2,bus||'alert',t+0.35); }
function horn(bus,d){ const t=now(); const o=SND.ctx.createOscillator(); o.type='square'; o.frequency.value=430; const g=G(0); chain(o,F('lowpass',1500,1),g,out(bus||'alert')); env(g,t,0.02,0.12,d||0.8,0.1); g.gain.setTargetAtTime(0.0001,t+(d||0.8),0.03); o.start(t); o.stop(t+(d||0.8)+0.2); }
function ptuBark(bus){ const t=now(); for(let i=0;i<5;i++){ const t0=t+i*0.42+R()*0.05, o=SND.ctx.createOscillator(); o.type='sawtooth'; o.frequency.setValueAtTime(95,t0); o.frequency.linearRampToValueAtTime(140,t0+0.12); o.frequency.linearRampToValueAtTime(70,t0+0.25);
  const g=G(0); chain(o,F('lowpass',700,4),g,out(bus||'ck')); env(g,t0,0.02,0.45,0.28); o.start(t0); o.stop(t0+0.4); burst('brown',0.25,'lowpass',200,0.6,bus||'ck',t0,0.01); } }
function thunder(distKm,bus){ if(!SND.ready) return; const t=now()+0.01, near=distKm<3, f=near?2400:Math.max(180,1200/(1+distKm/3)), v=cl(1.4/(1+distKm/4),0.08,1.4);
  if(near) burst('white',0.35,'highpass',800,v*0.9,bus||'wx',t,0.002,0.5);
  burst('brown',4+R()*3,'lowpass',f,v,bus||'wx',t+0.05,near?0.02:0.6,0.7,120);
  for(let i=0;i<5;i++) burst('brown',1.2+R(),'lowpass',f*0.7,v*0.6*R(),bus||'wx',t+0.4+R()*3,0.15,0.7); }
function step(v,surf){ burst('brown',0.12,'lowpass',surf==='wet'?900:500,0.9*v,'env',null,0.003,1); burst('white',0.04,'bandpass',surf==='wet'?2500:1500,0.18*v,'env',null,0.002,1.2); }
function birds(){ const t=now(); const n=2+Math.floor(R()*4), f0=2500+R()*2500; for(let i=0;i<n;i++){ const o=SND.ctx.createOscillator(); o.type='sine'; const t0=t+i*0.13; o.frequency.setValueAtTime(f0,t0); o.frequency.exponentialRampToValueAtTime(f0*(1.3+R()*0.5),t0+0.07); const g=G(0); o.connect(g); g.connect(SND.n.env); env(g,t0,0.01,0.05,0.09); o.start(t0); o.stop(t0+0.15); } }
function crickets(){ const t=now(); for(let k=0;k<3;k++) for(let i=0;i<3;i++) tone(4400+k*30,0.02,0.035,'env','sine',t+k*0.32+i*0.05,0.003); }
function beeper(){ const t=now(); for(let i=0;i<4;i++) tone(1040,0.25,0.05,'env','sine',t+i*0.6,0.01); }
function distantJet(){ if(!SND.ready) return; const t=now(), s=SND.ctx.createBufferSource(); s.buffer=SND.n.buf.pink; s.loop=true; const f=F('lowpass',200,0.7), g=G(0); chain(s,f,g,SND.n.env);
  g.gain.setValueAtTime(0.0001,t); g.gain.linearRampToValueAtTime(0.28,t+7); g.gain.linearRampToValueAtTime(0.0001,t+22); f.frequency.linearRampToValueAtTime(900,t+8); f.frequency.linearRampToValueAtTime(180,t+22); s.start(t); s.stop(t+23); }
function vanLeave(){ const t=now(), o=SND.ctx.createOscillator(); o.type='sawtooth'; o.frequency.setValueAtTime(38,t); o.frequency.linearRampToValueAtTime(70,t+4); const g=G(0); chain(o,F('lowpass',220,1),g,SND.n.env);
  g.gain.setValueAtTime(0.25,t); g.gain.linearRampToValueAtTime(0.0001,t+6); o.start(t); o.stop(t+6.2); burst('white',0.6,'bandpass',600,0.3,'env',t,0.05,1,300); clunk(0.8,'env',t+0.6); }
function door(bus){ const t=now(); burst('white',0.5,'bandpass',500,0.25,bus||'ck',t,0.08,1,250); clunk(1.1,bus||'ck',t+0.45); }
function buckles(n){ const t=now(); for(let i=0;i<(n||25);i++) click(0.5+R()*0.6,'ck',t+R()*4); }
function wiper(fast,t0){ burst('pink',fast?0.35:0.55,'bandpass',1400,0.22,'ck',t0,0.08,1.2,700); burst('brown',0.08,'lowpass',200,0.35,'ck',t0+(fast?0.33:0.52),0.003); }
function lightning(km){ let f=document.getElementById('snd-flash'); if(!f){ f=document.createElement('div'); f.id='snd-flash'; f.style.cssText='position:fixed;inset:0;background:#e8f0ff;pointer-events:none;z-index:4;opacity:0;transition:opacity .25s'; document.body.appendChild(f); }
  const v=cl(0.55/(1+km/6),0.05,0.55); f.style.transition='none'; f.style.opacity=v; requestAnimationFrame(()=>{ f.style.transition='opacity .35s'; f.style.opacity=0; setTimeout(()=>{ f.style.opacity=v*0.6; setTimeout(()=>f.style.opacity=0,70); },120); }); }
function gearCycle(down,dur){ const t=now(); clunk(0.9,'ck',t); set(SND.P.hyd.gain,0.07,0.15); set(SND.P.hydO.frequency,380,0.2); set(SND.P.gearR.gain,0,0.1);
  SND.T.hyd=t+dur; setTimeout(()=>{ clunk(1.2,'ck'); setTimeout(()=>clunk(1,'ck'),150); setTimeout(()=>clunk(1.1,'ck'),320); },dur*1000-300); }
function flapRun(sec){ set(SND.P.flp.gain,0.045,0.3); SND.T.flp=now()+sec; }
function touchdown(fpm){ const t=now(), v=cl(Math.abs(fpm)/400,0.25,2.2); chirp(0.6+v*0.3,t); chirp(0.5+v*0.3,t+0.05); thump(v,'aero',t); burst('brown',0.9,'lowpass',60,0.7*v,'aero',t+0.02,0.01,1); clunk(0.5*v,'ck',t+0.1); }

/* ---------- voix (synthèse vocale du navigateur ; voix différentes selon le rôle) ---------- */
let VOICES=[]; const loadV=()=>{ try{ VOICES=speechSynthesis.getVoices()||[]; }catch(e){} }; if(window.speechSynthesis){ loadV(); speechSynthesis.onvoiceschanged=loadV; }
const ROLE={ ac:{lang:'en-US',pitch:0.55,rate:0.98,vol:1,pick:0}, pnf:{lang:'en-GB',pitch:1.0,rate:1.08,vol:0.9,pick:1}, capt:{lang:'en-US',pitch:0.8,rate:1.02,vol:0.85,pick:2},
  pnc:{lang:'fr-FR',pitch:1.25,rate:1.0,vol:0.85,pick:1}, cdb:{lang:'fr-FR',pitch:0.82,rate:0.97,vol:0.85,pick:0}, sol:{lang:'en-US',pitch:1.15,rate:1.12,vol:0.75,pick:3}, pncEn:{lang:'en-GB',pitch:1.25,rate:1.0,vol:0.85,pick:2} };
function pickVoice(r){ const L=r.lang.slice(0,2), list=VOICES.filter(v=>v.lang&&v.lang.toLowerCase().startsWith(L)); if(!list.length) return null; const ex=list.filter(v=>v.lang===r.lang||v.lang.replace('_','-')===r.lang); const pool=ex.length?ex:list; return pool[r.pick%pool.length]; }
function say(role,text,opts){ opts=opts||{}; if(!SND.on||!SND.ready) return; const r=ROLE[role]||ROLE.pnf; const vol=SND.vol.vox*SND.vol.master*(r.vol||1);
  if(role==='ac'&&!SND.opt.acVoice) return; if((role==='pnf'||role==='capt')&&!SND.opt.callouts) return; if((role==='pnc'||role==='cdb'||role==='pncEn')&&!SND.opt.pa) return; if(role==='sol'&&!SND.opt.crew) return;
  if(window.speechSynthesis){ try{ if(opts.urgent) speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(text); u.lang=r.lang; const v=pickVoice(r); if(v) u.voice=v; u.pitch=r.pitch; u.rate=r.rate*(opts.rate||1); u.volume=cl(vol,0,1); speechSynthesis.speak(u); }catch(e){} }
  else if(typeof TTSX!=='undefined'&&TTSX){ TTSX.speak(text,{language:r.lang.slice(0,2),rate:r.rate}).catch(()=>{}); }
  if(opts.sub) subtitle((opts.icon||'🔊 ')+text,opts.sub); }
SND.say=say;
function pa(lines,role){ if(!SND.opt.pa) return; cabinChime('ck'); let d=1700; lines.forEach(([r,t,sub])=>{ setTimeout(()=>say(r||role||'pnc',t,{sub,icon:'📢 '}),d); d+=300; }); }

/* ---------- état et boucle ---------- */
const ST={ground:true,gear:true,flap:0,ap:false,mc:false,mwT:0,stallT:0,ovsT:0,ra:9999,co:{},ph:'',phT:0,cruiseT:0,apuN:0,lastPos:null,stepT:0,stepAcc:0,wipT:0,thunT:0,birdT:0,jetT:0,beepT:0,crkT:0,
  tdArmed:false,vsMin:0,belts:null,pb:null,rev:false,spl:false,engRun:[false,false],lit:[false,false],tko:{},gi:-1,altBand:null,turbT:0,horn:0,firstEng:false,sig:''};
function inViewCk(){ return view==='ck'; }
function mission(){ return typeof MI!=='undefined'&&MI; }
function wxHere(){ const o={rain:0,ts:false,hail:false,wind:0,gust:0,snow:0,temp:15,cloud:false,thDist:99};
  try{ const near=metNear(S.lat,S.lon)[0]; const agl=(S.alt-elevAt(S.lat,S.lon))/FT;
    if(near&&near[0]<70&&agl<9000){ const m=near[1]; o.wind=m.spd||0; o.gust=m.gust||0; o.temp=m.temp==null?15:m.temp;
      (m.wx||[]).forEach(s=>{ let k=s.startsWith('+')?1.6:s.startsWith('-')?0.5:1; if(s.includes('VC')) k*=0.3;
        if(/RA/.test(s)) o.rain=Math.max(o.rain,0.55*k); if(/DZ/.test(s)) o.rain=Math.max(o.rain,0.25*k); if(/SN|SG|PL/.test(s)) o.snow=Math.max(o.snow,0.5*k); if(/GR|GS/.test(s)){ o.hail=true; o.rain=Math.max(o.rain,0.8); }
        if(/TS/.test(s)){ o.ts=true; o.thDist=Math.min(o.thDist,s.includes('VC')?12:5); } if(/SH/.test(s)) o.rain=Math.max(o.rain,0.6*k); });
      const base=(m.clouds||[]).find(c=>c.cov==='BKN'||c.cov==='OVC'); if(base&&agl>base.base&&agl<base.base+2500) o.cloud=true; }
    if(typeof WXR!=='undefined'){ if(WXR.turb>0.05){ o.rain=Math.max(o.rain,cl(WXR.turb*1.3,0,1.6)); if(WXR.turb>0.65&&!o.snow) o.hail=true; }
      for(const c of WXR.cells||[]) if(c.d!=null&&c.d<90){ o.thDist=Math.min(o.thDist,Math.max(0.5,c.d-c.r*0.5)); o.ts=true; } } }catch(e){}
  return o; }

function tick(){ const N=SND.n, P=SND.P; if(!SND.ready) return; const c=SND.ctx;
  const live=SND.on&&mission()&&$('menu').hidden&&!paused&&!(document.getElementById('brief')&&!document.getElementById('brief').hidden)&&!crashed;
  set(N.live.gain,live?1:0,live?0.4:0.08); set(N.out.gain,SND.on?SND.vol.master:0,0.1);
  ['eng','aero','wx','ck','alert','vox','env'].forEach(k=>set(N[k].gain,SND.vol[k],0.1));
  if(!mission()||!S||!A) return;
  let ad; try{ ad=airdata(); }catch(e){ return; }
  const fw=A.kind==='fw', ck=inViewCk(), walk=view==='walk', ext=!ck&&!walk, cas=Math.max(0,ad.cas||0), ra=ad.ra==null?(S.alt-elevAt(S.lat,S.lon))/FT:ad.ra, vs=ad.vs||0, pw=(typeof hasPower==='function')?hasPower():true, dt=0.05, t=c.currentTime;
  // ---------- vue : filtre de fuselage et spatialisation ----------
  const hullF=ck?(fw?(ACK==='lj60'?850:1150):ACK==='r44'?3200:2200):walk?16000:14000;
  set(N.hull_eng.frequency,hullF,0.15); set(N.hull_wx.frequency,ck?(fw?2600:3500):16000,0.15); set(N.hull_env.frequency,ck?700:16000,0.2);
  let dist=0, pL=-0.35, pR=0.35;
  if(walk&&GD&&GD.walk){ dist=Math.hypot(GD.walk.x,GD.walk.z); const ang=Math.atan2(-GD.walk.x,-GD.walk.z)-(GD.walk.yaw+LK.yaw); const s=Math.sin(ang); pL=pR=cl(-s,-0.9,0.9); }
  else if(ext){ pL=-0.5; pR=0.5; }
  const att=walk?1/(1+dist/14):1, inK=ck?(fw?(ACK==='lj60'?0.55:0.75):1.1):ext?1.25:1;
  // ---------- moteurs ----------
  const full=!!MI.full;
  for(let i=0;i<2;i++){ const e=P.eng[i]; const exists=A.kind==='fw'||A.twin||i===0; set(e.pn.pan,i?pR:pL,0.2);
    const run=!!(S.eng&&S.eng[i])&&exists, n2raw=full&&S.n2?S.n2[i]:(run?1:0), starting=!run&&n2raw>0.02&&exists;
    if(ACK==='r44'||ACK==='c172'||!exists){ [e.roarG,e.jetG,e.whG,e.wh2G,e.fanG,e.bzG,e.stG].forEach(g=>set(g.gain,0,0.2)); continue; }
    const thr=cl(S.thr||0,0,1), n1t=run?(fw?0.2+0.76*thr+(S.rev&&S.onGround?0.18*thr+0.12:0):0.62+0.38*(S.nr||1)*(0.5+0.5*(S.coll||0))):n2raw*0.24;
    const k=n1t>e.n1?dt/2.2:dt/1.3; e.n1+=(n1t-e.n1)*k; e.n2=run?0.62+0.38*e.n1:n2raw;
    const n1=e.n1, n2=e.n2, lv=att*inK;
    // allumage : « whoomp » + tic-tic des bougies pendant la séquence
    if(starting&&n2raw>0.12&&n2raw<0.7&&t-(ST['ign'+i]||0)>0.65){ ST['ign'+i]=t; click(0.7,'eng'); }
    if(starting&&n2raw>0.26&&!ST.lit[i]){ ST.lit[i]=true; burst('brown',1.2,'lowpass',180,0.9*lv,'eng',null,0.08,0.8); }
    if(!starting&&!run) ST.lit[i]=false;
    if(run&&!ST.engRun[i]){ ST.engRun[i]=true; if(fw&&AL()&&!ST.firstEng&&S.onGround){ ST.firstEng=true; setTimeout(()=>ptuBark('ck'),2500); } }
    if(!run&&ST.engRun[i]){ ST.engRun[i]=false; burst('brown',3,'lowpass',300,0.4*lv,'eng',null,0.01,0.7,60); }
    const fwK=fw?1:0.7;
    set(e.roarG.gain,(run?0.03+0.55*Math.pow(n1,2.4):0.0)*lv*fwK,0.15); set(e.roarF.frequency,300+3600*n1*n1,0.2);
    set(e.jetG.gain,(run?0.5*Math.pow(n1,3):0)*lv*(ext||walk?1.4:0.6),0.15);
    set(e.whO.frequency,fw?700+2600*n2:1400+3600*n2,0.25); set(e.whF.frequency,fw?700+2600*n2:1400+3600*n2,0.25); set(e.whG.gain,(n2>0.02?0.05*Math.min(1,n2*1.4):0)*lv*(walk?1.6:1),0.2);
    set(e.wh2.frequency,(fw?700+2600*n2:1400+3600*n2)*1.51,0.25); set(e.wh2G.gain,n2>0.3?0.012*lv:0,0.2);
    set(e.fanO.frequency,600+2900*n1,0.25); set(e.fanG.gain,run&&fw?0.025*n1*lv*(walk||ext?1.8:0.5):0,0.2);
    set(e.bzO.frequency,30+58*n1,0.25); set(e.bzG.gain,run&&fw&&n1>0.8?(n1-0.8)*0.5*lv*(ext||walk?1.5:0.4):0,0.25);
    set(e.stO.frequency,200+1800*n2raw,0.3); set(e.stF.frequency,400+2200*n2raw,0.3); set(e.stG.gain,starting?0.07*lv:0,0.3); }
  // ---------- rotor ----------
  const rw=A.kind==='rw', r=P.rot;
  if(rw){ const nr=S.nr||0, spec={r44:[408,2,5.3],h125:[390,3,5.9],s76:[293,4,6.3]}[ACK]||[350,3,6], bpf=spec[0]/60*spec[1]*nr, load=cl(0.3+0.7*(S.coll||0)+cas/250,0,1.5);
    set(r.am.frequency,Math.max(1,bpf),0.2); set(r.thO.frequency,Math.max(1,bpf),0.2); set(r.trO.frequency,Math.max(5,bpf*spec[2]),0.2);
    set(r.depth.gain,nr>0.05?0.9*nr*load*att*(ck?1:1.5):0,0.2); set(r.base.gain,nr>0.05?0.04*nr:0,0.2); set(r.f.frequency,220+260*load,0.3);
    set(r.thG.gain,nr>0.05?0.18*nr*load*att:0,0.2); set(r.trG.gain,nr>0.05?0.035*nr*att*(ext||walk?1.6:0.8):0,0.2); }
  else { set(r.depth.gain,0,0.2); set(r.base.gain,0,0.2); set(r.thG.gain,0,0.2); set(r.trG.gain,0,0.2); }
  // ---------- R44 : moteur à pistons ----------
  const p=P.pis; if(ACK==='c172'){ const crank=!S.eng[0]&&SYS.mags==='START'&&SYS.bat1, run=S.eng[0], rpm=run?(S.rpm||800):crank?240:0, f=rpm/60*2;   // Lycoming O-320 : 4 cylindres, 2 explosions par tour
    set(p.o.frequency,Math.max(5,f),0.15); set(p.o2.frequency,Math.max(3,f/2),0.15); set(p.g.gain,(run?0.08+0.12*(S.thr||0):crank?0.07:0)*att*(ck?1:1.4),0.15); set(p.g2.gain,(run||crank)?0.08*att:0,0.15); set(p.f.frequency,run?600+900*(S.thr||0):400,0.2);
    if(crank&&t-(ST.crk||0)>0.25){ ST.crk=t; burst('brown',0.12,'lowpass',260,0.5,'eng',null,0.005); } }
  else if(ACK==='r44'){ const crank=!S.eng[0]&&SYS.ign==='START', run=S.eng[0], rpm=run?2718*(S.nr>0.3?S.nr:0.62):crank?260:0, f=rpm/60*3;
    set(p.o.frequency,Math.max(5,f),0.15); set(p.o2.frequency,Math.max(3,f/2),0.15); set(p.g.gain,(run?0.1+0.1*(S.coll||0):crank?0.07:0)*att*(ck?1:1.4),0.15); set(p.g2.gain,(run||crank)?0.08*att:0,0.15); set(p.f.frequency,run?700+600*(S.coll||0):400,0.2);
    if(crank&&t-(ST.crk||0)>0.23){ ST.crk=t; burst('brown',0.12,'lowpass',260,0.5,'eng',null,0.005); } }
  else { set(p.g.gain,0,0.2); set(p.g2.gain,0,0.2); }
  // ---------- APU (A320) ----------
  const a=P.apu; if(AL()&&full){ const want=SYS.apuMaster&&(SYS.apuStart||SYS.apuAvail)?1:0; ST.apuN+=(want-ST.apuN)*dt/(want?20:12); if(SYS.apuMaster&&!ST.apuM){ clunk(0.35,'env'); } ST.apuM=!!SYS.apuMaster;
    const n=ST.apuN, lv=(walk?2.2/(1+Math.hypot(GD.walk.x,GD.walk.z-24)/10):ck?0.25:0.9); set(a.o.frequency,300+5200*n,0.3); set(a.f.frequency,600+5600*n,0.3); set(a.g.gain,n>0.02?0.05*n*lv:0,0.3); set(a.nG.gain,n>0.02?0.16*n*n*lv:0,0.3); }
  else { set(a.g.gain,0,0.2); set(a.nG.gain,0,0.2); }
  // ---------- aérodynamique ----------
  const air=!S.onGround, q=Math.pow(cas/250,2);
  set(P.wind.gain,cl(q*(ck?(fw?0.55:0.45):1.1),0,1.3),0.25); set(P.windF.frequency,250+cas*5,0.3); set(P.windHi.gain,cl(q*q*(ck?0.06:0.15),0,0.3),0.3);
  set(P.gearR.gain,fw&&air&&S.gear?cl(Math.pow(cas/160,2)*0.45,0,0.8):0,0.3);
  const spoil=!!S.spoil||SYS.spdbrk==='FULL'||(SYS.spdbrk&&/1\/2|FULL|EXT/.test(SYS.spdbrk));
  set(P.buf.gain,(air&&(spoil||S.stall)?cl(q*1.2+(S.stall?0.6:0),0,1.2):0)*(ck?1:0.7),0.2);
  // ---------- sol ----------
  const gs=S.V||0, onG=S.onGround&&fw;
  set(P.roll.gain,onG&&gs>0.3?cl(gs/40,0,1)*0.9*(ck?1:0.7):0,0.15); set(P.tyre.gain,onG&&gs>3?cl(gs/70,0,0.4):0,0.2);
  if(onG&&gs>4){ const spacing=(typeof nearRunway==='function'&&nearRunway(S.lat,S.lon))?15:22; ST.jt=(ST.jt||0)+gs*dt; if(ST.jt>spacing){ ST.jt=0; thump(cl(gs/60,0.12,0.6)*(ck?1:0.6),'aero'); } }
  const braking=onG&&(S.brake||(SYS.abrk&&SYS.abrk!=='OFF'&&gs>15&&ST.tdT&&t-ST.tdT<25))&&gs>0.8&&gs<14;
  set(P.sq.gain,braking?0.012*cl(1-gs/14,0,1):0,0.15);
  if(S.pbrake!==ST.pb){ if(ST.pb!=null){ burst('white',0.35,'bandpass',2600,0.12,'ck',null,0.01,1); clunk(0.4,'ck'); } ST.pb=S.pbrake; }
  // toucher des roues / décollage
  if(air) ST.vsMin=Math.min(ST.vsMin*0.98+vs*0.02,vs);
  if(ST.ground&&!S.onGround){ ST.vsMin=0; ST.tdArmed=false; }
  if(!ST.ground&&S.onGround){ const fpm=Math.min(-60,ST.vsMin||-200); touchdown(fpm); ST.tdT=t; if(fw) setTimeout(()=>{ if(SND.ready) thump(0.8,'aero'); clunk(0.4,'ck'); },cl(1800-cas*6,600,2600)); ST.vsMin=0;
    if(fw&&SYS.spdbrk==='ARMED') setTimeout(()=>{ say('pnf','Spoilers',{sub:'Copilote : spoilers sortis'}); burst('brown',1.5,'lowpass',160,0.6,'aero'); },700); }
  ST.ground=S.onGround;
  // ---------- train, volets, hydraulique ----------
  if(S.gear!==ST.gear){ if(fw||ACK==='s76') gearCycle(S.gear,AL()?10:ACK==='lj60'?7:8);
    if(fw&&!S.gear&&air&&SND.opt.callouts) setTimeout(()=>say('pnf','Gear up',{sub:'Copilote : train rentré'}),600);
    if(fw&&S.gear&&air&&SND.opt.callouts) setTimeout(()=>say('pnf','Gear down, three green',{sub:'Copilote : train sorti, trois vertes'}),(AL()?10:7)*1000);
    ST.gear=S.gear; }
  if(S.flap!==ST.flap&&(SND.quiet||0)>performance.now()){ ST.flap=S.flap; }   // mise en place de la mission : pas d'annonce
  if(S.flap!==ST.flap){ if(fw) flapRun(Math.abs(S.flap-ST.flap)*(AL()?7:5)); if(fw&&SND.opt.callouts&&A.flaps[S.flap]) say('pnf',(S.flap?'Flaps '+A.flaps[S.flap].n:'Flaps zero'),{sub:'Copilote : volets '+A.flaps[S.flap].n}); ST.flap=S.flap; }
  if(SND.T.hyd&&t>SND.T.hyd){ set(P.hyd.gain,0,0.2); SND.T.hyd=0; } if(SND.T.flp&&t>SND.T.flp){ set(P.flp.gain,0,0.4); SND.T.flp=0; }
  // ---------- poste : alimentation, ventilation, climatisation ----------
  const pax=(AL()||ACK==='lj60');
  set(P.hum.gain,pw&&fw?0.006:0,0.4); set(P.hum2.gain,pw&&fw?0.002:0,0.4); set(P.fan.gain,pw?(fw?0.07:0.03):0,0.6);
  const packs=AL()?(typeof E320!=='undefined'&&(E320.packs[0]||E320.packs[1])):(pw&&(S.eng[0]||S.eng[1]));
  set(P.pack.gain,packs?0.09:0,1);
  // passagers (A320 : 150 à 180 personnes derrière la porte blindée)
  if(AL()&&SND.opt.pax&&full&&ck){ const loud=S.onGround?(gs<1?0.06:0.035):(cas>200?0.02:0.03); set(P.pax.gain,loud,1); P.paxV.forEach(g=>set(g.gain,R()*0.9,0.08)); }
  else set(P.pax.gain,0,0.6);
  // ---------- météo ----------
  const W=(ST.wxT&&t-ST.wxT<2)?ST.wx:(ST.wx=wxHere(),ST.wxT=t,ST.wx); const wet=W.rain>0.05;
  const rainK=W.rain*(ck?(1+cl(cas/120,0,1.6)):1.2);
  set(P.rain.gain,cl(rainK*0.9,0,1.8),0.6); set(P.rainH.gain,cl(rainK*0.08,0,0.2),0.6); set(P.hail.gain,W.hail?0.9:0,0.5);
  const gl=S.onGround||ra<800; const wv=gl?(W.wind+(W.gust>W.wind?(W.gust-W.wind)*Math.max(0,Math.sin(t*0.7)+Math.sin(t*1.9)*0.5):0)):0;
  set(P.owind.gain,cl(wv/30,0,1)*(walk?0.6:ck?0.12:0.4),0.5); set(P.owindF.frequency,250+wv*25,0.5);
  if(W.ts&&t>ST.thunT){ ST.thunT=t+12+R()*30; const d=cl(W.thDist*(0.6+R()*0.8),0.4,30); lightning(d); setTimeout(()=>{ if(SND.on) thunder(d,'wx'); },Math.min(25,d/0.343)*1000); }
  // essuie-glaces (A320 : sélecteur WIPER)
  const wip=AL()&&pw&&SYS.wiper&&SYS.wiper!=='OFF'; if(wip&&t>ST.wipT){ const fast=SYS.wiper==='FAST'; wiper(fast,t); ST.wipT=t+(fast?0.7:1.3); }
  // turbulence : secousses, craquements de la cellule
  const turb=(typeof WXR!=='undefined'?WXR.turb:0)+(gl&&air?cl((W.gust-15)/40,0,0.4):0)+(W.cloud&&air?0.08:0);
  if(air&&turb>0.06&&t>ST.turbT){ ST.turbT=t+cl(1.6-turb*1.5,0.25,2)*(0.5+R()); thump(cl(turb,0.1,1)*0.8,'aero'); if(R()<0.4) burst('pink',0.4,'bandpass',300+R()*500,0.12*turb,'ck',null,0.05,6); if(R()<0.25) click(0.6,'ck'); }
  // ---------- environnement d'aéroport ----------
  const onApt=S.onGround&&ra<60;
  set(P.apt.gain,onApt?(walk?0.18:0.05):0,1); set(P.gpu.gain,onApt&&walk&&AL()&&!ST.apuN?0.05/(1+dist/12):0,0.6);
  if(onApt&&t>ST.jetT){ ST.jetT=t+50+R()*70; if(ST.jetT>0) distantJet(); }
  if(onApt&&walk&&t>ST.beepT){ ST.beepT=t+25+R()*40; beeper(); }
  const night=(typeof SKY!=='undefined'&&SKY.u.night.value>0.5);
  if(walk&&!night&&!wet&&t>ST.birdT){ ST.birdT=t+3+R()*9; birds(); }
  if(walk&&night&&W.temp>12&&t>ST.crkT){ ST.crkT=t+1.2+R()*2; crickets(); }
  // pas
  if(walk&&GD&&GD.walk){ const pos=[GD.walk.x,GD.walk.z]; if(ST.lastPos){ const d=Math.hypot(pos[0]-ST.lastPos[0],pos[1]-ST.lastPos[1]); ST.stepAcc+=d; const sl=d/dt>3?1.1:0.75; if(ST.stepAcc>sl){ ST.stepAcc=0; step(d/dt>3?1:0.7,wet?'wet':'dry'); } } ST.lastPos=pos; } else ST.lastPos=null;
  // ---------- alarmes ----------
  alerts(ad,ra,vs,cas,air,pw,t);
  // ---------- annonces humaines selon la phase ----------
  phases(ad,ra,vs,cas,air,t);
  stepHooks(t);
}

function alerts(ad,ra,vs,cas,air,pw,t){ const fw=A.kind==='fw';
  if(AL()&&typeof S320!=='undefined'&&pw){ if(S320.mw&&t-ST.mwT>0.36){ ST.mwT=t; crc(); } if(S320.mc&&!ST.mc) singleChime(); ST.mc=!!S320.mc; }
  if(S.stall&&air&&t-ST.stallT>1.4){ ST.stallT=t; if(AL()){ cricket(); setTimeout(()=>say('ac','Stall, stall',{urgent:true}),280); } else if(fw){ shaker('alert',1.4); } else horn('alert',1); }
  let ovs=false; try{ ovs=overspeed(); }catch(e){}
  if(ovs&&t-ST.ovsT>(AL()?0.36:1)){ ST.ovsT=t; if(AL()) crc(); else if(fw) clacker('alert',1); else horn('alert',0.5); }
  // pilote automatique : déconnexion
  if(ST.ap&&!AP.on&&air){ if(AL()) cavalry(); else if(fw){ const tt=now(); [0,0.25,0.5].forEach(d=>{ tone(880,0.12,0.12,'alert','sine',tt+d); tone(660,0.12,0.12,'alert','sine',tt+d+0.12); }); } }
  ST.ap=!!AP.on;
  // alerte d'altitude (C-chord) : à l'approche de l'altitude sélectionnée, train et volets rentrés
  if(fw&&air&&!S.gear&&S.flap===0&&AP.alt){ const d=Math.abs(S.alt/FT-AP.alt), band=d<250?'cap':d<750?'near':'far';
    if(ST.altBand==='far'&&band==='near') cchord('alert',1.5); if(ST.altBand==='cap'&&band!=='cap'&&d>300) cchord('alert',1.5); ST.altBand=band; } else ST.altBand=null;
  // klaxon bas régime rotor (H125 / R44)
  if((ACK==='h125'||ACK==='r44')&&air&&S.nr<0.95&&ra>3&&t-ST.horn>0.9){ ST.horn=t; horn('alert',0.85); }
  // annonces radiosonde (avions)
  if(fw&&air&&vs<-100){ const da=200, CO=AL()?[[2500,'twenty five hundred'],[1000,'one thousand'],[500,'five hundred'],[400,'four hundred'],[da+100,'hundred above'],[da,'minimum'],[100,'one hundred'],[50,'fifty'],[40,'forty'],[30,'thirty'],[20,'twenty'],[10,'ten']]
      :[[2500,'two thousand five hundred'],[1000,'one thousand'],[500,'five hundred'],[da+100,'approaching minimums'],[da,'minimums'],[100,'one hundred'],[50,'fifty'],[40,'forty'],[30,'thirty'],[20,'twenty'],[10,'ten']];
    for(const [h,w] of CO){ if(ra<=h&&ST.ra>h&&!ST.co[h]){ ST.co[h]=1; let word=w; if(AL()&&h===20&&(S.thr||0)>0.05) word='retard, retard'; if(AL()&&h===10&&(S.thr||0)>0.05) continue;
        say('ac',word,{urgent:h<=50}); if(h===1000&&SND.opt.callouts) setTimeout(()=>say('pnf','Stabilized',{sub:'Copilote : approche stabilisée'}),1300); break; } } }
  if(ra>2700||(vs>500&&air)) ST.co={};
  ST.ra=ra; }

/* annonces SOP du copilote au décollage et à l'atterrissage, annonces cabine selon la phase de vol */
function phases(ad,ra,vs,cas,air,t){ const fw=A.kind==='fw', K=ST.tko, L=(typeof LS!=='undefined'&&LS.v1)?LS:{v1:A.Vr-4,vr:A.Vr,v2:A.V2||A.Vr+6};
  if(fw&&S.onGround&&(S.thr||0)>0.75&&S.V>3){ if(!K.set){ K.set=1; say('pnf','Thrust set',{sub:'Copilote : poussée affichée'}); }
    if(cas>=100&&!K.k100){ K.k100=1; say('pnf','One hundred knots',{sub:'Copilote : 100 nœuds (vérification des anémomètres)'}); setTimeout(()=>say('capt','Checked'),1300); }
    if(cas>=L.v1&&!K.v1){ K.v1=1; say('pnf','V one',{urgent:true,sub:'Copilote : V1 — décision : on décolle'}); }
    if(cas>=L.vr&&!K.vr){ K.vr=1; say('pnf','Rotate',{urgent:true,sub:'Copilote : rotation'}); } }
  if(fw&&air&&K.vr&&!K.pc&&vs>250&&ra>30){ K.pc=1; say('pnf','Positive climb',{sub:'Copilote : vario positif'}); setTimeout(()=>say('capt','Gear up'),1100); }
  if(fw&&S.onGround&&S.V<2) ST.tko={};
  // atterrissage : inverseurs, décélération, 70 kt
  if(fw&&S.onGround&&ST.tdT&&now()-ST.tdT<40){ if(S.rev&&!ST.rev){ setTimeout(()=>say('pnf','Reverse green',{sub:'Copilote : inverseurs déployés'}),800); } ST.rev=!!S.rev;
    if(cas<135&&cas>90&&!ST.decel&&now()-ST.tdT>2){ ST.decel=1; say('pnf','Decel',{sub:'Copilote : décélération ressentie'}); }
    if(cas<70&&!ST.k70){ ST.k70=1; say('pnf','Seventy knots',{sub:'Copilote : 70 nœuds'}); } }
  if(air){ ST.decel=0; ST.k70=0; }
  // phases cabine (A320 seulement : PNC et passagers)
  if(!AL()) return; const fl=S.alt/FT; let ph=ST.ph;
  if(S.onGround&&S.V<1&&!(S.eng[0]||S.eng[1])) ph=ph==='landed'||ph==='taxiIn'?'arrived':ph||'pre';
  if(S.onGround&&S.V>2&&!air&&(ph==='pre'||ph==='')) ph='taxiOut';
  if(air&&(ph==='taxiOut'||ph==='pre'||ph===''||ph==='lineup')) ph='climb';
  if(air&&ph==='climb'&&fl>18000&&Math.abs(vs)<400){ ST.cruiseT+=0.05; if(ST.cruiseT>25) ph='cruise'; } else if(ph==='climb') ST.cruiseT=0;
  if(air&&ph==='cruise'&&vs<-900) ph='descent';
  if(air&&(ph==='descent'||ph==='climb')&&S.gear&&ra<5000&&vs<0) ph='approach';
  if(S.onGround&&(ph==='approach'||ph==='descent')&&S.V<40) ph='taxiIn';
  if(ph!==ST.ph){ const prev=ST.ph; ST.ph=ph; paEvent(ph,prev); } }
function hhmm(ms,lon){ const d=new Date(ms+(lon||0)/15*3600e3); return String(d.getUTCHours()).padStart(2,'0')+' h '+String(d.getUTCMinutes()).padStart(2,'0'); }
function paEvent(ph,prev){ const dest=MI.dest&&APTS[MI.dest]?APTS[MI.dest]:null, dn=dest?dest.n.replace(/\s*—.*$/,''):'destination', m=dest&&WXS.met[MI.dest];
  if(ph==='taxiOut'){ pa([['pnc','Mesdames et messieurs, bienvenue à bord. Merci d\'attacher votre ceinture, de redresser votre dossier et de passer vos appareils électroniques en mode avion.','PNC : bienvenue à bord, ceintures, mode avion'],['pncEn','Ladies and gentlemen, welcome aboard. Please fasten your seat belt and switch your devices to flight mode.']]);
    setTimeout(()=>say('cdb','PNC aux portes, armement des toboggans, vérification de la porte opposée.',{sub:'Commandant : armement des toboggans',icon:'📢 '}),16000);
    setTimeout(()=>{ say('cdb','Personnel navigant, aux postes pour le décollage.',{sub:'Commandant : PNC aux postes pour le décollage',icon:'📢 '}); },32000);
    setTimeout(()=>{ callChime('ck'); setTimeout(()=>say('pnc','Commandant, la cabine est parée pour le décollage.',{sub:'Interphone PNC → poste : cabine parée'}),900); },44000); }
  if(ph==='climb'&&prev) { setTimeout(()=>{ if(ST.ph==='climb'||ST.ph==='cruise') cabinChime('ck'); },90000); }
  if(ph==='cruise') pa([['cdb',`Mesdames et messieurs, ici votre commandant de bord. Nous volons à ${Math.round(S.alt/FT/1000)} mille pieds. Arrivée prévue à ${dn} vers ${hhmm(simMs+((typeof LS!=='undefined'&&LS.tripH)||2)*3600e3*0.6,dest?dest.lon:0)}, heure locale. Bon vol.`,'Commandant : altitude de croisière, heure d\'arrivée']]);
  if(ph==='descent') pa([['cdb',`Mesdames et messieurs, nous commençons notre descente vers ${dn}. ${m?'La température au sol est de '+m.temp+' degrés. ':''}Merci de regagner votre siège et d'attacher votre ceinture.`,'Commandant : début de descente, ceintures']]);
  if(ph==='approach'){ cabinChime('ck'); setTimeout(()=>say('cdb','Personnel navigant, aux postes pour l\'atterrissage.',{sub:'Commandant : PNC aux postes pour l\'atterrissage',icon:'📢 '}),1600); }
  if(ph==='taxiIn') setTimeout(()=>pa([['pnc',`Mesdames et messieurs, bienvenue à ${dn}. Il est ${hhmm(simMs,dest?dest.lon:0)}, heure locale${m?', la température extérieure est de '+m.temp+' degrés':''}. Merci de rester assis, ceinture attachée, jusqu'à l'arrêt complet de l'appareil.`,'PNC : bienvenue, rester assis jusqu\'à l\'arrêt complet']]),9000);
  if(ph==='arrived'){ setTimeout(()=>{ say('cdb','PNC, désarmement des toboggans, vérification de la porte opposée.',{sub:'Commandant : désarmement des toboggans',icon:'📢 '}); },1500); setTimeout(()=>{ cabinChime('ck'); buckles(40); set(SND.P.pax.gain,0.09,2); },7000); } }

/* événements liés aux étapes du parcours guidé (au sol, avant le vol) */
function stepHooks(t){ if(typeof GD==='undefined'||!GD.on||!GD.steps) return; if(GD.i===ST.gi) return; const prev=ST.gi; ST.gi=GD.i; const s=GD.steps[GD.i]; if(!s||prev<0&&GD.i>0) return; const T=s.t||'';
  if(/Arrivée au parking/.test(T)) setTimeout(vanLeave,400);
  if(/Monter à bord|poste « cold/.test(T)){ door('ck'); if(AL()) setTimeout(()=>say('pnc','Bonjour commandant. La cabine est prête, l\'embarquement pourra commencer après vos vérifications.',{sub:'Chef de cabine : bonjour, cabine prête'}),2500); }
  if(/Before Start/.test(T)&&AL()){ setTimeout(()=>{ door('env'); say('sol','Cockpit from ground. All doors closed, ground equipment removed, parking brake set. Ready for start.',{sub:'Mécanicien (interphone) : portes fermées, prêt pour la mise en route'}); },1500); }
  if(/Démarrage du moteur 2/.test(T)) setTimeout(()=>say('sol','Clear to start engine two.',{sub:'Mécanicien : zone dégagée, mise en route moteur 2'}),1200);
  if(/Démarrage du moteur 1/.test(T)) setTimeout(()=>say('sol','Clear to start engine one.',{sub:'Mécanicien : mise en route moteur 1'}),1200);
  if(/Démarrage des réacteurs|turbine|Démarrage du moteur$/.test(T)&&!AL()) setTimeout(()=>say('sol','Clear to start.',{sub:'Personnel au sol : zone dégagée'}),1200);
  if(/roulage sur les vraies voies/.test(T)&&AL()) setTimeout(()=>say('sol','Disconnecting interphone. Have a good flight!',{sub:'Mécanicien : je me débranche, bon vol !'}),1500); }

/* ceintures : « bing-bong » quand la consigne change */
setInterval(()=>{ if(!SND.ready||!mission()) return; const b=(typeof SYS!=='undefined')?(SYS.belts||SYS.seatbelt||null):null; if(ST.belts!=null&&b!==ST.belts&&$('menu').hidden) cabinChime('ck'); ST.belts=b; },300);

/* déclics des commandes du poste */
addEventListener('pointerdown',e=>{ if(!SND.ready||!SND.on) return; const el=e.target.closest&&e.target.closest('#ovh button,#ovh select,#ovh .sw,#ped button,#ped select,#ped .sw,#fcu button,#fcu select,[data-sw],[data-pd]'); if(!el) return; const v=0.7+R()*0.5;
  if(/knob|sel/.test(el.className||'')||el.tagName==='SELECT') { click(v*0.7,'prev'); setTimeout(()=>click(v*0.5,'prev'),40); } else { click(v,'prev'); if(/guard|mw|mc/.test(el.className||'')) burst('brown',0.08,'lowpass',300,0.3,'prev'); } },true);

/* remise à zéro à chaque mission */
SND.reset=function(){ Object.assign(ST,{ground:true,gear:S.gear,flap:S.flap,ap:false,mc:false,ra:9999,co:{},ph:MI&&MI.full?'pre':(S.onGround?'lineup':'climb'),cruiseT:0,apuN:0,tko:{},gi:-1,altBand:null,firstEng:false,engRun:[!!S.eng[0],!!S.eng[1]],lit:[false,false],pb:S.pbrake,tdT:0,rev:false,belts:null,jetT:(SND.ctx?now():0)+20,thunT:(SND.ctx?now():0)+8});
  if(SND.ready) SND.P.eng.forEach((e,i)=>{ e.n1=S.eng[i]?0.2:0; e.n2=S.eng[i]?0.7:0; }); if(window.speechSynthesis) speechSynthesis.cancel(); };

/* ---------- banque de sons (écoute + explication) ---------- */
SND.BANK=[
 ['chime','Single chime (A320)','Master Caution orange : panne non urgente. Lire l\'ECAM, appliquer la procédure quand la trajectoire est assurée.',()=>singleChime('prev')],
 ['crc','Continuous Repetitive Chime','Master Warning rouge : danger immédiat (feu, survitesse, configuration au décollage…). Action immédiate.',()=>{ for(let i=0;i<8;i++) setTimeout(()=>crc('prev'),i*360); }],
 ['cavalry','« Cavalry charge »','Déconnexion du pilote automatique (A320). Volontaire : on l\'annule par un 2e appui ; involontaire : reprendre la main.',()=>cavalry('prev')],
 ['cchord','C-chord','Alerte d\'altitude : approche de l\'altitude affichée (750 ft) ou écart de plus de 250 ft après capture.',()=>cchord('prev',1.5)],
 ['cricket','Cricket + « STALL » (A320)','Avertissement de décrochage en loi dégradée : rendre la main (piquer), poussée, ailes horizontales.',()=>{ cricket('prev'); setTimeout(()=>cricket('prev'),700); setTimeout(()=>say('ac','Stall, stall'),300); }],
 ['shaker','Vibreur de manche','Avion classique (Learjet) : le manche vibre avant le décrochage.',()=>shaker('prev',1.6)],
 ['clacker','Clacker de survitesse','Survitesse (VMO/MMO dépassée) sur avion classique : réduire, aérofreins.',()=>clacker('prev',1.5)],
 ['horn','Klaxon bas régime rotor','H125 / R44 : régime rotor trop bas : baisser le collectif immédiatement (R44 : gaz).',()=>horn('prev',1.2)],
 ['belts','Ceintures / annonce cabine','« Bing-bong » quand la consigne ceintures change, ou avant une annonce passagers.',()=>cabinChime('prev')],
 ['call','Appel PNC → poste','Double tintement : un PNC appelle le poste par interphone (ex. « cabine parée »).',()=>callChime('prev')],
 ['ptu','PTU « chien qui aboie » (A320)','Unité de transfert de puissance entre circuits hydrauliques vert et jaune ; typique après la 1re mise en route : normal.',()=>ptuBark('prev')],
 ['gear','Train d\'atterrissage','Déverrouillage (clunk), moteur hydraulique ~10 s, puis verrouillage : 3 clunks = 3 jambes verrouillées.',()=>{ clunk(1,'prev'); tone(380,7,0.05,'prev','sawtooth',null,0.4); setTimeout(()=>{ clunk(1.2,'prev'); setTimeout(()=>clunk(1,'prev'),150); setTimeout(()=>clunk(1.1,'prev'),320); },7000); }],
 ['start','Démarrage d\'un réacteur','Démarreur pneumatique (sifflement montant), bougies (tic-tic), allumage (souffle), N2 stabilisé au ralenti.',()=>{ const o=tone(250,9,0.06,'prev','sawtooth',null,0.5); if(o) o.frequency.exponentialRampToValueAtTime(2200,now()+9); for(let i=0;i<8;i++) setTimeout(()=>click(0.7,'prev'),1500+i*650); setTimeout(()=>burst('brown',1.4,'lowpass',180,0.9,'prev',null,0.1),3000); }],
 ['touch','Toucher des roues','Crissement des pneus (mise en rotation), choc, puis roulette de nez ; la force dépend du taux de chute.',()=>{ chirp(1,now()); chirp(0.8,now()+0.05); thump(1.2,'prev'); setTimeout(()=>thump(0.7,'prev'),1500); }],
 ['callouts','Annonces radiosonde','Voix synthétique de l\'avion : hauteur au-dessus du sol en finale (… fifty, forty, thirty, twenty, ten ; « RETARD » = réduire).',()=>{ ['fifty','forty','thirty','twenty','retard, retard'].forEach((w,i)=>setTimeout(()=>say('ac',w),i*900)); }],
 ['rain','Pluie sur le pare-brise','L\'intensité vient du METAR (-RA, RA, +RA, SHRA, TSRA) ou des cellules orageuses ; plus fort avec la vitesse.',()=>{ burst('crackle',4,'highpass',700,1.4,'prev',null,0.4,0.6); burst('white',4,'bandpass',5000,0.12,'prev',null,0.4,0.5); }],
 ['thunder','Tonnerre','Éclair, puis tonnerre : délai (s) × 343 m = distance. 3 s ≈ 1 km.',()=>thunder(2,'prev')],
 ['pa','Annonce cabine','Exemple d\'annonce du commandant de bord.',()=>{ cabinChime('prev'); setTimeout(()=>say('cdb','Mesdames et messieurs, ici votre commandant de bord. Nous allons commencer notre descente.'),1600); }],
];
SND.play=id=>{ unlock(); const b=SND.BANK.find(x=>x[0]===id); if(b&&SND.ready) b[3](); };

/* ---------- mélangeur (panneau « Son ») ---------- */
const css=document.createElement('style'); css.textContent=`#snd{position:fixed;right:12px;bottom:calc(var(--barh,64px));z-index:21;width:min(380px,calc(100vw - 24px));max-height:calc(100vh - var(--barh,64px) - 24px);overflow:auto;padding:12px}
#snd h3{margin:0 0 8px;font:700 17px 'Barlow Condensed';letter-spacing:.04em}#snd .row{display:grid;grid-template-columns:120px 1fr 40px;align-items:center;gap:8px;margin:6px 0;font-size:13px}
#snd input[type=range]{width:100%;accent-color:var(--acc)}#snd .ck{display:flex;gap:8px;align-items:center;font-size:13px;margin:5px 0}#snd .bank{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:8px}#snd .bank button{text-transform:none;letter-spacing:0;font:500 12px Inter;text-align:left}
#snd .hint{color:var(--mut);font-size:12px}`; document.head.appendChild(css);
const VLAB={master:'Général',eng:'Moteurs / rotors',aero:'Air, train, sol',wx:'Météo',env:'Aéroport, extérieur',ck:'Poste, cabine',alert:'Alarmes',vox:'Voix'};
const OLAB={callouts:'Annonces du copilote (SOP)',acVoice:'Voix de l\'avion (radiosonde, alarmes)',pa:'Annonces cabine (CDB / PNC)',crew:'Mécanicien sol (interphone)',pax:'Brouhaha des passagers'};
function sndPanel(){ let p=document.getElementById('snd'); if(p){ p.hidden=!p.hidden; return; } unlock(); p=document.createElement('aside'); p.id='snd'; p.className='panel'; document.body.appendChild(p);
  p.innerHTML=`<h3>Son du simulateur <button type="button" id="snd-x" style="float:right">✕</button></h3>
   <label class="ck"><input type="checkbox" id="snd-on" ${SND.on?'checked':''}> Son activé</label>
   ${Object.keys(VLAB).map(k=>`<div class="row"><span>${VLAB[k]}</span><input type="range" min="0" max="1.5" step="0.05" value="${SND.vol[k]}" data-v="${k}"><span class="num">${Math.round(SND.vol[k]*100)}</span></div>`).join('')}
   ${Object.keys(OLAB).map(k=>`<label class="ck"><input type="checkbox" data-o="${k}" ${SND.opt[k]?'checked':''}> ${OLAB[k]}</label>`).join('')}
   <div class="lbl" style="margin-top:10px">Écouter et comprendre</div><div class="bank">${SND.BANK.map(b=>`<button type="button" data-p="${b[0]}" title="${b[2].replace(/"/g,'&quot;')}">🔊 ${b[1]}</button>`).join('')}</div>
   <p class="hint">Tout est synthétisé en direct (Web Audio) à partir de l'état du simulateur : régime moteur, vitesse, train, volets, météo METAR, vue cockpit / extérieure / à pied. Voix : synthèse vocale de votre appareil. Niveaux relatifs [ESTIMÉ].</p>`;
  p.querySelector('#snd-x').onclick=()=>p.hidden=true; p.querySelector('#snd-on').onchange=e=>{ SND.on=e.target.checked; if(!SND.on&&window.speechSynthesis) speechSynthesis.cancel(); save(); syncBtn(); };
  p.querySelectorAll('[data-v]').forEach(i=>i.oninput=()=>{ SND.vol[i.dataset.v]=+i.value; i.nextElementSibling.textContent=Math.round(i.value*100); save(); });
  p.querySelectorAll('[data-o]').forEach(i=>i.onchange=()=>{ SND.opt[i.dataset.o]=i.checked; save(); });
  p.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>{ SND.play(b.dataset.p); subtitle('🔊 '+SND.BANK.find(x=>x[0]===b.dataset.p)[1],SND.BANK.find(x=>x[0]===b.dataset.p)[2]); }); }
SND.panel=sndPanel;
function syncBtn(){ const b=document.getElementById('b-snd'); if(b){ b.textContent=SND.on?'🔊 Son':'🔇 Son'; b.classList.toggle('on',SND.on); } }
{ const bar=$('bar'), help=$('b-help'); if(bar&&help){ const b=document.createElement('button'); b.type='button'; b.id='b-snd'; b.title='Son : volumes, options, banque de sons'; b.onclick=sndPanel; help.before(b); syncBtn(); } }
})();

/* pas d'annonce « Flaps… » ni de bruit de volets pendant la mise en place d'une mission ou d'un scénario */
(function(){ const q=()=>{ SND.quiet=performance.now()+4000; }; const w=n=>{ const f=window[n]; if(typeof f!=='function') return; window[n]=function(){ q(); const r=f.apply(this,arguments); q(); return r; }; };
  try{ const a=startMission; startMission=function(){ q(); const r=a.apply(this,arguments); q(); return r; }; }catch(e){}
  try{ const b=scnStart; scnStart=function(){ q(); const r=b.apply(this,arguments); q(); return r; }; }catch(e){}
  try{ const c=resetState; resetState=function(){ q(); return c.apply(this,arguments); }; }catch(e){} })();
