/* Correcciones de interacción — ronda 2 */

/* El icono de escaneo se dibuja en la sala objetivo y apunta hacia la sala
   donde está Kael. El espejo visual se resuelve en correcciones-1.css. */
markerDirection=function(from,to){
  if(from==="ENTRADA")return"left";
  const origin=ROOM_LAYOUT[from],target=ROOM_LAYOUT[to];
  if(!origin||!target)return"left";
  const dx=origin.x-target.x;
  const dy=origin.y-target.y;
  return Math.abs(dx)>Math.abs(dy)?(dx>0?"right":"left"):(dy>0?"down":"up");
};

/* Regla defensiva para cualquier encuentro con dos imágenes:
   la imagen E siempre debe mostrarse primero y la F después. */
function normalizeEncounterOrder(def){
  if(!def||!def.card||!def.finalCard)return def;
  const cardIsF=/F\.png$/i.test(def.card);
  const finalIsE=/E\.png$/i.test(def.finalCard);
  if(cardIsF&&finalIsE){
    const oldCard=def.card;
    def.card=def.finalCard;
    def.finalCard=oldCard;
  }
  return def;
}
Object.values(FIXED_DEFINITIONS).forEach(normalizeEncounterOrder);
B_EVENT_POOL_TEMPLATE.forEach(normalizeEncounterOrder);
state.bAvailable.forEach(normalizeEncounterOrder);
Object.values(state.bAssignments).forEach(normalizeEncounterOrder);

/* Refuerzo defensivo: al abrir encuentros que dependen de botones,
   retiramos cualquier display:none inline heredado del reset. */
const openEncounterBeforeCorrections=openEncounter;
openEncounter=function(room){
  const pending=definitionFor(room,{draw:false});
  if(pending)normalizeEncounterOrder(pending);

  openEncounterBeforeCorrections(room);

  if(["combatHandshake","a2Combat","hybrid","a8Hybrid"].includes(state.encounterMode)){
    gunButton.style.removeProperty("display");
    fistButton.style.removeProperty("display");
    enemyHp.style.removeProperty("display");
  }

  if(state.encounterMode==="combatHandshake"){
    specialTopButton.style.removeProperty("display");
  }

  if(state.encounterMode==="a8Branch"){
    gunButton.style.removeProperty("display");
    fistButton.style.removeProperty("display");
  }

  if(["hybrid","a8Hybrid"].includes(state.encounterMode)){
    fleeButton.style.removeProperty("display");
  }
};

/* Los avisos normales siguen verdes. Solo el deterioro periódico por oxígeno
   usa el cuadro rojo solicitado. */
const showMessageBeforeDanger=showMessage;
showMessage=function(html){
  message.classList.remove("danger");
  showMessageBeforeDanger(html);
};
function showDangerMessage(html){
  message.classList.add("danger");
  showMessageBeforeDanger(html);
  message.classList.add("danger");
}

registerMovementLifeLoss=function(){
  state.movementsSinceLifeLoss++;
  const threshold=lifeLossMovementThreshold();
  if(state.movementsSinceLifeLoss<threshold)return false;
  state.movementsSinceLifeLoss=0;
  lifeLossSound();
  showDangerMessage("TE SIENTES MAL<br>PIERDES 1 DE VIDA");
  return true;
};
