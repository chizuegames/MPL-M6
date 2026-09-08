/* =========================================================
   MPL M6 — CORRECCIONES RONDA 6
   Híbridos detectados por escáner + epílogo FF antes del final
   ========================================================= */

/* ---------------------------------------------------------
   1. HÍBRIDOS DETECTADOS POR ESCÁNER

   Regla:
   - Solo aplica a habitaciones B.
   - Si el escáner revela un híbrido, su icono SÍ queda visible en el mapa.
   - Kael no se mueve al escanear.
   - Cuando Kael entre después en esa habitación, el híbrido ya se habrá ido
     y se mostrará SLV.png como sala vacía.
   - Las habitaciones A nunca usan esta regla.
   --------------------------------------------------------- */
Object.keys(state.rooms).forEach(room=>{
  if(typeof state.rooms[room].scannerClearedHybrid!=="boolean"){
    state.rooms[room].scannerClearedHybrid=false;
  }
});

revealRoom=function(room){
  const roomState=state.rooms[room];
  const def=definitionFor(room);

  roomState.revealed=true;
  removeMarker(`scan-${room}`);
  energyLossSound();

  const scannedHybrid=B_ROOMS.includes(room) && def?.type==="hybrid";

  if(scannedHybrid){
    roomState.completed=false;
    roomState.scannerClearedHybrid=true;

    /* El híbrido se detecta y por eso su icono permanece visible. */
    if(def.icon){
      imageMarker(`event-${room}`,room,def.icon,"map-icon event-icon");
    }

    showMessage("HÍBRIDO DETECTADO<br>−1 ENERGÍA");
    return;
  }

  if(def?.icon){
    imageMarker(`event-${room}`,room,def.icon,"map-icon event-icon");
  }

  showMessage(`${def?.label||"SEÑAL"}<br>−1 ENERGÍA`);
};

const openEncounterBeforeRound6=openEncounter;
openEncounter=function(room){
  const roomState=state.rooms[room];

  if(B_ROOMS.includes(room) && roomState?.scannerClearedHybrid===true){
    const emptyDefinition={
      type:"simple",
      label:"SALA VACÍA",
      card:"SLV.png",
      icon:null,
      reward:null
    };

    /* El híbrido ya abandonó esta habitación. */
    roomState.scannerClearedHybrid=false;
    removeMarker(`event-${room}`);

    /* Consumimos la asignación del híbrido en esta sala para que no vuelva
       a reaparecer aquí al refrescar marcadores. */
    if(state.bAssignments[room]?.type==="hybrid"){
      delete state.bAssignments[room];
    }

    showEncounterShell(room,emptyDefinition);
    state.pendingDefinition=emptyDefinition;
    state.encounterMode="simple";
    encounterCard.style.cursor="pointer";
    return;
  }

  openEncounterBeforeRound6(room);
};

/* ---------------------------------------------------------
   2. EPÍLOGO FF.png ANTES DE MISIÓN CUMPLIDA

   Secuencia final:
   A2F6 -> FF.png a pantalla completa + texto -> clic -> MISIÓN CUMPLIDA
   -> después aparece el letrero rojo "¿O no...?".
   --------------------------------------------------------- */
function ensureAftermathOverlay(){
  let overlay=document.getElementById("aftermathOverlay");
  if(overlay)return overlay;

  overlay=document.createElement("div");
  overlay.id="aftermathOverlay";
  overlay.setAttribute("role","button");
  overlay.setAttribute("tabindex","0");
  overlay.setAttribute("aria-label","Continuar al final de la misión");
  overlay.innerHTML=`
    <img id="aftermathImage" src="FF.png" alt="La nave quedó destruida">
    <div id="aftermathShade"></div>
    <div id="aftermathTextBox">
      La nave quedó completamente destruida, pero la tensión no desapareció. Todos permanecían en alerta mientras Kael recibía tratamiento médico por sus heridas.
    </div>
  `;

  document.body.appendChild(overlay);

  const continueFinal=()=>{
    if(!overlay.classList.contains("show"))return;
    overlay.classList.remove("show");
    showMissionCompleteAfterAftermath();
  };

  overlay.addEventListener("click",continueFinal);
  overlay.addEventListener("keydown",event=>{
    if(event.key==="Enter"||event.key===" "){
      event.preventDefault();
      continueFinal();
    }
  });

  return overlay;
}

function ensureTwistOverlayRound6(){
  if(typeof ensureTwistOverlay==="function")return ensureTwistOverlay();

  let overlay=document.getElementById("twistOverlay");
  if(overlay)return overlay;

  overlay=document.createElement("div");
  overlay.id="twistOverlay";
  overlay.innerHTML='<div id="twistPanel"><h1 id="twistTitle">¿O no...?</h1></div>';
  document.body.appendChild(overlay);
  return overlay;
}

function showMissionCompleteAfterAftermath(){
  missionSound();

  endOverlay.className="show mission";
  endTitle.textContent="MISIÓN CUMPLIDA";
  endSubtitle.textContent="";

  const twist=ensureTwistOverlayRound6();
  twist.classList.remove("show");

  setTimeout(()=>{
    endOverlay.classList.remove("show");
    twist.classList.add("show");
    toneSweep(180,72,.75,.09,"sine");
  },2200);
}

missionComplete=function(){
  if(state.ended)return;

  state.ended=true;
  state.gameLocked=true;
  turnOffScanner();
  encounter.classList.remove("show");

  /* No mostramos todavía MISIÓN CUMPLIDA: primero queda el epílogo en pantalla
     hasta que el jugador toque/clickee. */
  endOverlay.classList.remove("show");
  const twist=document.getElementById("twistOverlay");
  if(twist)twist.classList.remove("show");

  const aftermath=ensureAftermathOverlay();
  aftermath.classList.add("show");
};
