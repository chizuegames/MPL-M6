/* =========================================================
   MPL M6 — CORRECCIONES RONDA 5
   Enfermera / escáner a 1 energía / híbridos detectados
   ========================================================= */

/* ---------------------------------------------------------
   1. MENSAJE INICIAL: el escáner cuesta 1 energía en esta misión.
   --------------------------------------------------------- */
if(Array.isArray(TUTORIAL_MESSAGES) && !TUTORIAL_MESSAGES.some(text=>/escáner.*1.*energ/i.test(text))){
  TUTORIAL_MESSAGES.splice(1,0,"Durante esta misión el escáner costará solo 1 de energía.");
}

/* ---------------------------------------------------------
   2. ESCÁNER
   - Revelar una sala cuesta 1 energía.
   - Si lo detectado es un híbrido, Kael NO entra en la sala.
   - El híbrido abandona la sala inmediatamente.
   - Cuando Kael pase después por esa sala, estará vacía.
   --------------------------------------------------------- */
revealRoom=function(room){
  const roomState=state.rooms[room];
  const def=definitionFor(room);

  roomState.revealed=true;
  removeMarker(`scan-${room}`);
  energyLossSound();

  if(def?.type==="hybrid"){
    roomState.completed=true;
    roomState.scannerClearedHybrid=true;
    removeMarker(`event-${room}`);
    imageMarker(`check-${room}`,room,ASSETS.checkIcon,"map-icon check-image");
    showMessage("HÍBRIDO DETECTADO<br>EL HÍBRIDO SE HA IDO<br>−1 ENERGÍA");
    return;
  }

  if(def?.icon){
    imageMarker(`event-${room}`,room,def.icon,"map-icon event-icon");
  }
  showMessage(`${def?.label||"SEÑAL"}<br>−1 ENERGÍA`);
};

/* ---------------------------------------------------------
   3. ENFERMERA — botón de manos verdes

   El botón de manos está abajo a la derecha en A3E.
   Al tocarlo:
   - se vuelve al mapa;
   - Kael entra en esa habitación;
   - la enfermera permanece exactamente en esa habitación;
   - su icono queda visible;
   - cuando Kael abandona la habitación, la enfermera vuelve a caminar;
   - si Kael vuelve a entrar en la habitación donde ella se encuentre,
     A3E se reactiva.
   --------------------------------------------------------- */
let nurseHandshakeButton=document.getElementById("nurseHandshakeButton");
if(!nurseHandshakeButton){
  nurseHandshakeButton=document.createElement("button");
  nurseHandshakeButton.id="nurseHandshakeButton";
  nurseHandshakeButton.type="button";
  nurseHandshakeButton.setAttribute("aria-label","Quedarse con la enfermera");
  nurseHandshakeButton.style.position="absolute";
  nurseHandshakeButton.style.left="62%";
  nurseHandshakeButton.style.top="56%";
  nurseHandshakeButton.style.width="35%";
  nurseHandshakeButton.style.height="27%";
  nurseHandshakeButton.style.zIndex="145";
  nurseHandshakeButton.style.border="0";
  nurseHandshakeButton.style.background="transparent";
  nurseHandshakeButton.style.cursor="pointer";
  nurseHandshakeButton.style.display="none";
  encounterCard.appendChild(nurseHandshakeButton);
}

function showNurseHandshakeButton(){
  nurseHandshakeButton.style.display="block";
}
function hideNurseHandshakeButton(){
  nurseHandshakeButton.style.display="none";
}

/* Ya no se cura automáticamente solo por entrar en la casilla de la enfermera:
   primero se vuelve a abrir su escena. */
maybeTriggerNurseHeal=function(){
  return false;
};

/* La enfermera se queda en la habitación actual después de su escena.
   No vuelve mágicamente a A3. */
chooseNurseRoamingRoom=function(){
  if(!state.nurseActivated||state.nurseSecondHealUsed)return;
  state.nurseRoom=state.currentRoom;
  state.nurseHasStartedWalking=false;
  refreshRoomMarkers();
};

/* Reemplazamos el movimiento de la enfermera por una versión general:
   espera en la sala donde Kael la encontró y comienza a caminar cuando él sale.
   Después avanza como máximo un cuarto lógico por cada movimiento de Kael. */
if(typeof moveToRoomBeforeNurseWalk!=="undefined"){
  moveToRoom=function(room,options={}){
    const origin=state.currentRoom;
    const suppressStep=!!state.suppressNurseStepOnce;
    state.suppressNurseStepOnce=false;

    const result=moveToRoomBeforeNurseWalk(room,options);

    if(suppressStep)return result;
    if(!state.nurseActivated||state.nurseSecondHealUsed||!state.nurseRoom)return result;

    if(!state.nurseHasStartedWalking){
      if(origin!==state.nurseRoom)return result;
      state.nurseHasStartedWalking=true;
      walkNurseOneRoom();
      return result;
    }

    walkNurseOneRoom();
    return result;
  };
}

/* Cerramos cualquier escena ocultando también el nuevo botón. */
const closeEncounterBeforeRound5=closeEncounter;
closeEncounter=function(){
  hideNurseHandshakeButton();
  closeEncounterBeforeRound5();
};

/* Si la enfermera está caminando y Kael entra en SU habitación actual,
   se abre A3E aunque el evento original de esa habitación ya estuviera resuelto. */
const openEncounterBeforeRound5=openEncounter;
openEncounter=function(room){
  const nurseIsHere=state.nurseActivated && !state.nurseSecondHealUsed && state.nurseRoom===room;

  if(nurseIsHere){
    const nurseDef=FIXED_DEFINITIONS.A3;
    showEncounterShell(room,nurseDef);
    state.encounterMode="nurseRoaming";
    encounterCard.classList.add("special-lower");
    encounterBackButton.style.display="block";
    showNurseHandshakeButton();
    return;
  }

  openEncounterBeforeRound5(room);

  if(state.encounterMode==="nurse"){
    showNurseHandshakeButton();
  }else{
    hideNurseHandshakeButton();
  }
};

/* Interceptamos la entrada a la sala donde se encuentra la enfermera antes de
   que una sala ya completada la salte automáticamente. */
const handleRoomClickBeforeRound5=handleRoomClick;
handleRoomClick=function(room){
  const nurseIsThere=state.nurseActivated && !state.nurseSecondHealUsed && state.nurseRoom===room;

  if(!nurseIsThere){
    handleRoomClickBeforeRound5(room);
    return;
  }

  if(state.gameLocked||state.ended||encounter.classList.contains("show"))return;
  if(room===state.currentRoom){
    showMessage("ESTÁS EN ESTA SALA");
    return;
  }
  if(!isAdjacent(room)){
    showMessage("SOLO PUEDES IR A UNA SALA ALEDAÑA");
    return;
  }

  if(state.scannerActive&&!state.rooms[room].revealed){
    revealRoom(room);
    return;
  }

  const cost=getMovementOxygenCost(room);
  if(cost>0&&!consumeOxygen(cost))return;
  turnOffScanner();
  openEncounter(room);
};

function nurseHandshakeReturnToMap(){
  if(!["nurse","nurseRoaming"].includes(state.encounterMode))return;

  const room=state.pendingRoom;
  if(!room)return;

  const firstMeeting=!state.nurseActivated;

  state.nurseActivated=true;
  state.nurseSecondHealUsed=false;
  state.nurseRoom=room;
  state.nurseHasStartedWalking=false;
  state.rooms[room].revealed=true;

  /* La sala A3 queda resuelta como habitación, pero la enfermera sigue siendo
     una entidad móvil independiente sobre el mapa. */
  if(firstMeeting && room==="A3")state.rooms[room].completed=true;

  /* Este movimiento coloca a Kael en la sala sin hacer que la enfermera se
     mueva en el mismo instante. Ella empezará cuando Kael SALGA de allí. */
  state.suppressNurseStepOnce=true;
  closeEncounter();
  moveToRoom(room);

  state.nurseRoom=room;
  state.nurseHasStartedWalking=false;
  refreshRoomMarkers();
};

nurseHandshakeButton.addEventListener("click",event=>{
  event.stopPropagation();
  nurseHandshakeReturnToMap();
});
