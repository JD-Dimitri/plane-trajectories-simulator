/* ===== V10.30 — TOUS LES TEXTES SONT COPIABLES =====
   Le corps de la page interdisait la sélection (user-select:none) : on ne pouvait copier ni un cours, ni un document, ni une bulle.
   Désormais tout texte se sélectionne (appui long sur mobile, glisser à la souris) et se copie / colle.
   Exceptions volontaires : la scène 3D et les manches tactiles (sinon le pilotage au doigt sélectionnerait l'écran),
   et un panneau pendant qu'on le déplace. Ctrl/Cmd + C, V, X, A ne déclenchent plus de commande du simulateur. */
(function(){
const css=document.createElement('style'); css.id='copy-css';
css.textContent=`html,body,body *{-webkit-user-select:text!important;user-select:text!important;-webkit-touch-callout:default!important}
#stage,#stage *,canvas,.stick,.stick *,#sfr,.pdrag,.pdrag *{-webkit-user-select:none!important;user-select:none!important;-webkit-touch-callout:none!important}
::selection{background:#3fd0ff88;color:inherit}`;
document.head.appendChild(css);
// raccourcis de copier / coller : ne pas les transmettre aux commandes clavier du simulateur
document.addEventListener('keydown',e=>{ if((e.ctrlKey||e.metaKey)&&/^[acvx]$/i.test(e.key)) e.stopImmediatePropagation(); },true);
// une sélection en cours ne doit pas être prise pour un déplacement de panneau ni un appui
window.HAS_SEL=()=>{ try{ const s=getSelection(); return !!s&&!s.isCollapsed&&String(s).trim().length>0; }catch(e){ return false; } };
})();
