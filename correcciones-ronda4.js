/* =========================================================
   MPL M6 — CORRECCIONES RONDA 4
   Escáner / Laboratorio B / Final con giro de intriga
   ========================================================= */

/* ---------------------------------------------------------
   1. ESCÁNER
   Esc1.png tiene el punto ARRIBA y las ondas hacia ABAJO.
   El punto debe quedar siempre del lado de Kael y las ondas abrirse hacia
   la sala escaneada. Aplicamos el transform directamente al elemento para
   que ninguna regla CSS anterior pueda invertirlo otra vez.
   --------------------------------------------------------- */
function scannerTransformFor(targetRoom){
  if(state.currentRoom==="ENTRADA"){
    /* Kael entra desde la izquierda hacia A11: punto a la izquierda,
       ondas hacia la derecha. */
    return "translate(-50%,-50%) rotate(-90deg)";
  }

  const origin=ROOM_LAYOUT[state.currentRoom];
  const target=ROOM_LAYOUT[targetRoom];
  if(!origin||!target)return "translate(-50%,-50%) rotate(-90deg)";

  const dx=target.x-origin.x;
  const dy=target.y-origin.y;

  if(Math.abs(dx)>Math.abs(dy)){
    return dx>0
      ? "translate(-50%,-50%) rotate(-90deg)"
      : "translate(-50%,-50%) rotate(90deg)";
  }

  return dy>0
    ? "translate(-50%,-50%) rotate(0deg)"
    : "translate(-50%,-50%) rotate(180deg)";
}

function orientScannerElement(node){
  if(!(node instanceof HTMLElement))return;
  if(!node.classList.contains("scan-image"))return;
  const room=node.id.replace(/^scan-/,"");
  node.style.setProperty("transform",scannerTransformFor(room),"important");
}

const scannerObserver=new MutationObserver(mutations=>{
  mutations.forEach(mutation=>{
    mutation.addedNodes.forEach(node=>{
      if(!(node instanceof HTMLElement))return;
      orientScannerElement(node);
      node.querySelectorAll?.(".scan-image").forEach(orientScannerElement);
    });
  });
});
scannerObserver.observe(iconsLayer,{childList:true,subtree:true});
document.querySelectorAll(".scan-image").forEach(orientScannerElement);

/* ---------------------------------------------------------
   2. LABORATORIO B
   Con llave B:
   A2F = encuentro de combate.
   El monstruo tiene vida infinita y UN ataque no le hace daño.
   Después del ataque inicia:
   A2F1 → A2F2 → A2F3 → A2F4 → A2F5 → A2F6.
   --------------------------------------------------------- */
const openEncounterBeforeRound4=openEncounter;
openEncounter=function(room){
  const def=definitionFor(room);

  if(def.type==="labB" && typeof hasLabKey==="function" && hasLabKey("B")){
    showEncounterShell(room,def);

    /* La primera escena dentro del laboratorio es A2F, no A2E. */
    setEncounterImage("A2F.png","LABORATORIO B · COMBATE");

    state.encounterMode="a2Combat";
    state.a2AttackAttempts=0;
    state.a2SequenceIndex=0;

    encounterCard.classList.remove("branch","hybrid","special-top","special-lower");
    encounterCard.classList.add("combat");

    enemyHp.textContent="∞";
    enemyHp.style.removeProperty("display");
    gunButton.style.removeProperty("display");
    fistButton.style.removeProperty("display");

    fleeButton.style.display="none";
    specialTopButton.style.display="none";
    specialLowerButton.style.display="none";
    encounterBackButton.style.display="none";
    return;
  }

  openEncounterBeforeRound4(room);
};

/* ---------------------------------------------------------
   3. FINAL
   Primero aparece MISIÓN CUMPLIDA. Después se reemplaza por un segundo
   letrero independiente en rojo: “¿O no...?”
   --------------------------------------------------------- */
function ensureTwistOverlay(){
  let overlay=document.getElementById("twistOverlay");
  if(overlay)return overlay;

  overlay=document.createElement("div");
  overlay.id="twistOverlay";
  overlay.innerHTML='<div id="twistPanel"><h1 id="twistTitle">¿O no...?</h1></div>';
  document.body.appendChild(overlay);
  return overlay;
}

missionComplete=function(){
  if(state.ended)return;
  state.ended=true;
  state.gameLocked=true;
  turnOffScanner();
  encounter.classList.remove("show");
  missionSound();

  endOverlay.className="show mission";
  endTitle.textContent="MISIÓN CUMPLIDA";
  endSubtitle.textContent="";

  const twist=ensureTwistOverlay();
  twist.classList.remove("show");

  setTimeout(()=>{
    endOverlay.classList.remove("show");
    twist.classList.add("show");
    toneSweep(180,72,.75,.09,"sine");
  },2200);
};
