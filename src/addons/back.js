/* ===== « ← Appareils » : retour au choix de l'appareil depuis tous les écrans ===== */
(function(){
const css=document.createElement('style'); css.textContent=`.bk-ac{flex:none;display:inline-flex;align-items:center;gap:4px;background:#0f2a1c!important;color:#9ff0bf!important;border:1px solid #3ddc84!important;border-radius:9px;padding:6px 10px;font:700 13px 'Barlow Condensed',sans-serif!important;letter-spacing:.05em;text-transform:uppercase;cursor:pointer;white-space:nowrap}
.bk-ac:hover{background:#1f8a4c!important;color:#fff!important}
#vism .hd .bk-ac,#acad header .bk-ac,#sysat header .bk-ac,#brief .bh .bk-ac{margin-right:4px}
#menu .flashac{animation:bkfl .6s 3}@keyframes bkfl{50%{box-shadow:0 0 0 3px #3ddc84}}`; document.head.appendChild(css);
function back(){ try{ window.ACAD&&ACAD.close(); }catch(e){} try{ window.SYSAT&&SYSAT.close(); }catch(e){}
 ['brief','zoomscr','jmp','jmpo','exn','exq','gdlg','exam'].forEach(id=>{ const e=document.getElementById(id); if(e) e.hidden=true; });
 ['vism','acpick'].forEach(id=>{ const e=document.getElementById(id); if(e) e.remove(); });
 try{ if(window.AUTO&&AUTO.on) AUTO.on=false; }catch(e){}
 try{ openMenu(); }catch(e){ const m=document.getElementById('menu'); if(m) m.hidden=false; }
 setTimeout(()=>{ const ac=document.getElementById('c-ac'); if(ac){ ac.scrollIntoView({block:'center',behavior:'smooth'}); ac.classList.remove('flashac'); void ac.offsetWidth; ac.classList.add('flashac'); } },80); }
window.BACK_AC=back;
function mk(id){ const b=document.createElement('button'); b.type='button'; b.className='bk-ac'; if(id) b.id=id; b.title='Revenir au choix de l\'appareil'; b.innerHTML='← Appareils'; b.onclick=e=>{ e.stopPropagation(); back(); }; return b; }
const SPOTS=[['#b-menu',el=>el.before(mk('b-back'))],['#acad header',el=>el.prepend(mk())],['#sysat header',el=>el.prepend(mk())],['#brief .bh',el=>el.prepend(mk())],['#vism .hd',el=>el.prepend(mk())]];
function inject(){ SPOTS.forEach(([q,f])=>{ const el=document.querySelector(q); if(!el) return; const host=q==='#b-menu'?el.parentNode:el; if(host.querySelector(':scope > .bk-ac')) return; f(el); }); }
inject(); setInterval(inject,700);
})();
