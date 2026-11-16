/* ===== BRUME ATMOSPHÉRIQUE DES OBJETS (bâtiments, tours, décor) =====
   Le terrain avait déjà sa brume (shader du globe) mais pas les objets 3D : de loin, les immeubles de Manhattan ressortaient en
   silhouette noire sur l'horizon brumeux. Les objets suivent maintenant la même brume (couleur et distance) que le terrain.
   Les feux (balisage, feux de navigation) restent visibles de loin la nuit. */
(function(){
if(typeof scene==='undefined'||typeof THREE==='undefined') return;
scene.fog=new THREE.Fog(0x9fb8cc,20000,90000);
scene.traverse(o=>{ const m=o.material; (Array.isArray(m)?m:m?[m]:[]).forEach(x=>{ if(x.isSpriteMaterial) x.fog=false; x.needsUpdate=true; }); });
const _pc=placeCamera; placeCamera=function(){ _pc.apply(this,arguments); try{ const c=earthU.fogC.value, d=earthU.fogD.value; scene.fog.color.copy(c); scene.fog.near=d*0.2; scene.fog.far=d*1.6; }catch(e){} };
// nouveaux feux créés plus tard : sans brume
if(typeof mkLight==='function'){ const _mk=mkLight; mkLight=function(){ const s=_mk.apply(this,arguments); try{ if(s&&s.material) s.material.fog=false; }catch(e){} return s; }; }
})();
