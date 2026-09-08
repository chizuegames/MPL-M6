/* =========================================================
   MPL M6 — MECÁNICAS: ESCÁNER, ENFERMERA Y VIDA
   ========================================================= */

/* ESCÁNER
   El punto queda del lado de Kael y las ondas se abren hacia la sala objetivo.
   La clase devuelve la dirección DESDE Kael HACIA la sala escaneada. */
markerDirection=function(from,to){
  if(from==="ENTRADA")return"right";
  const origin=ROOM_LAYOUT[from],target=ROOM_LAYOUT[to];
  if(!origin||!target)return"right";
  const dx=target.x-origin.x;
  const dy=target.y-origin.y;
  return Math.abs(dx)>Math.abs(dy)?(dx>0?"right":"left"):(dy>0?"down":"up");
};

/* DETERIORO POR OXÍGENO
   60–100%: 1 vida cada 7 movimientos
   20–<60%: 1 vida cada 6 movimientos
   0–<20%: 1 vida cada 5 movimientos */
lifeLossMovementThreshold=function(){
  if(state.oxygen>=60)return 7;
  if(state.oxygen>=20)return 6;
  return 5;
};

/* SALAS DE VIDA: todas recuperan 2 vidas. */
if(FIXED_DEFINITIONS.A4){
  FIXED_DEFINITIONS.A4.reward="RECUPERAS 2 DE VIDA";
}
B_EVENT_POOL_TEMPLATE.forEach(def=>{
  if(def.label==="VIDA")def.reward="RECUPERAS 2 DE VIDA";
});
state.bAvailable.forEach(def=>{
  if(def.label==="VIDA")def.reward="RECUPERAS 2 DE VIDA";
});
Object.values(state.bAssignments).forEach(def=>{
  if(def?.label==="VIDA")def.reward="RECUPERAS 2 DE VIDA";
});

/* =========================================================
   ENFERMERA

   - Al terminar su encuentro permanece en A3.
   - Su icono aparece en su propia habitación.
   - Solo empieza a desplazarse cuando Kael abandona A3.
   - Da como máximo un paso por cada movimiento de Kael.
   - Solo puede caminar a una sala ALEDAÑA que Kael ya haya visitado.
   - Nunca se teletransporta.
   - No entra voluntariamente en la sala donde está Kael; así Kael debe
     volver a encontrársela para recibir la segunda curación.
   ========================================================= */
state.nurseHasStartedWalking=false;

function nurseVisitedAdjacentRooms(room){
  return (GRAPH[room]||[]).filter(next=>
    ROOM_LAYOUT[next] &&
    state.rooms[next]?.visited &&
    next!==state.currentRoom
  );
}

function walkNurseOneRoom(){
  if(!state.nurseActivated||state.nurseSecondHealUsed||!state.nurseRoom)return;
  const options=nurseVisitedAdjacentRooms(state.nurseRoom);
  if(!options.length){
    refreshRoomMarkers();
    return;
  }
  state.nurseRoom=choose(options);
  refreshRoomMarkers();
}

/* Esta función es llamada por la secuencia original justo después de que
   Kael conoce a la enfermera. Ahora ya no la teletransporta: la deja en A3. */
chooseNurseRoamingRoom=function(){
  if(!state.nurseActivated||state.nurseSecondHealUsed)return;
  state.nurseRoom="A3";
  state.nurseHasStartedWalking=false;
  refreshRoomMarkers();
};

/* El código original ocultaba el icono si enfermera y Kael compartían sala.
   Lo volvemos a dibujar para que, al conocerla, se vea que sigue en A3. */
const refreshRoomMarkersBeforeNurseWalk=refreshRoomMarkers;
refreshRoomMarkers=function(){
  refreshRoomMarkersBeforeNurseWalk();
  if(state.nurseActivated&&!state.nurseSecondHealUsed&&state.nurseRoom){
    imageMarker("nurse-marker",state.nurseRoom,ASSETS.nurseIcon,"map-icon nurse-image");
  }
};

/* Un movimiento de Kael equivale, como máximo, a un paso lógico de la enfermera. */
const moveToRoomBeforeNurseWalk=moveToRoom;
moveToRoom=function(room,options={}){
  const kaelOrigin=state.currentRoom;
  const result=moveToRoomBeforeNurseWalk(room,options);

  /* Si Kael acaba de encontrar a la enfermera para la segunda curación,
     maybeTriggerNurseHeal ya la retiró y no debe seguir caminando. */
  if(!state.nurseActivated||state.nurseSecondHealUsed||!state.nurseRoom)return result;

  if(!state.nurseHasStartedWalking){
    /* Solo comienza cuando Kael sale físicamente de A3. */
    if(kaelOrigin!=="A3")return result;
    state.nurseHasStartedWalking=true;
  }

  walkNurseOneRoom();
  return result;
};
