/* Correcciones de interacción — ronda 1 */

/* El icono de escaneo se dibuja en la sala objetivo, por eso debe apuntar
   hacia la sala donde está Kael (origen del escaneo), no alejándose de él. */
markerDirection=function(from,to){
  if(from==="ENTRADA")return"left";
  const origin=ROOM_LAYOUT[from],target=ROOM_LAYOUT[to];
  if(!origin||!target)return"left";
  const dx=origin.x-target.x;
  const dy=origin.y-target.y;
  return Math.abs(dx)>Math.abs(dy)?(dx>0?"right":"left"):(dy>0?"down":"up");
};

/* Refuerzo defensivo: al abrir encuentros que dependen de botones,
   retiramos cualquier display:none inline heredado del reset. */
const openEncounterBeforeCorrections=openEncounter;
openEncounter=function(room){
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
