/* =========================================================
   MPL M6 — LLAVES Y LABORATORIOS

   Contador de llaves (bitmask):
   0 = ninguna
   1 = llave A
   2 = llave B
   3 = ambas
   ========================================================= */

/* Intercambio de posición solicitado:
   A6 ahora entrega la llave B.
   A12 ahora entrega la llave A. */
FIXED_DEFINITIONS.A6.type="keyB";
FIXED_DEFINITIONS.A6.reward="OBTUVISTE LA LLAVE DEL LABORATORIO B";
FIXED_DEFINITIONS.A12.type="keyA";
FIXED_DEFINITIONS.A12.reward="OBTUVISTE LA LLAVE DEL LABORATORIO A";

state.keyCounter=(state.keyA?1:0)|(state.keyB?2:0);

function syncLegacyKeys(){
  state.keyA=(state.keyCounter&1)!==0;
  state.keyB=(state.keyCounter&2)!==0;
}
function hasLabKey(key){
  return key==="A"?(state.keyCounter&1)!==0:(state.keyCounter&2)!==0;
}
function acquireLabKey(key){
  state.keyCounter|=key==="A"?1:2;
  syncLegacyKeys();
  return state.keyCounter;
}
function labKeyStatus(){
  if(state.keyCounter===3)return"A + B";
  if(state.keyCounter===1)return"A";
  if(state.keyCounter===2)return"B";
  return"NINGUNA";
}

/* El listener de llaves existente llama esta función por nombre, así que
   la sustituimos para alimentar el contador nuevo. */
applyKeyReward=function(def){
  if(def.type==="keyA"){
    acquireLabKey("A");
    return `${def.reward}<br>LLAVES: ${labKeyStatus()}`;
  }
  if(def.type==="keyB"){
    acquireLabKey("B");
    return `${def.reward}<br>LLAVES: ${labKeyStatus()}`;
  }
  return def.reward||null;
};

/* Precarga de la secuencia completa. Cuando A2F4, A2F5 y A2F6 estén
   presentes en el repositorio se usarán automáticamente. */
["A2F1.png","A2F2.png","A2F3.png","A2F4.png","A2F5.png","A2F6.png"].forEach(src=>{
  const img=new Image();img.src=src;
});

/* Conservamos la versión ya corregida de openEncounter para todas las salas
   que no sean laboratorios. */
const openEncounterBeforeLaboratoryPatch=openEncounter;
openEncounter=function(room){
  const def=definitionFor(room);

  if(def.type==="labA"){
    if(!hasLabKey("A")){
      turnOffScanner();
      showMessage("NECESITAS LA LLAVE DEL LABORATORIO A");
      refreshRoomMarkers();
      return;
    }

    /* Con llave A no se muestra A1E: se entra directamente a A1F. */
    showEncounterShell(room,def);
    state.encounterMode="labAFinal";
    encounterBackButton.style.display="none";
    setEncounterImage("A1F.png","LABORATORIO A");
    encounterCard.style.cursor="pointer";
    return;
  }

  if(def.type==="labB"){
    if(!hasLabKey("B")){
      turnOffScanner();
      showMessage("NECESITAS LA LLAVE DEL LABORATORIO B");
      refreshRoomMarkers();
      return;
    }

    /* Con llave B se entra directamente a A2E y se habilita UN ataque. */
    showEncounterShell(room,def);
    state.encounterMode="a2Combat";
    state.a2AttackAttempts=0;
    state.a2SequenceIndex=0;
    encounterCard.classList.add("combat");
    enemyHp.textContent="∞";
    gunButton.style.removeProperty("display");
    fistButton.style.removeProperty("display");
    enemyHp.style.removeProperty("display");
    return;
  }

  openEncounterBeforeLaboratoryPatch(room);
};

/* Laboratorio B: basta un único ataque. No causa daño y, tras él,
   comienza A2F1 → A2F2 → A2F3 → A2F4 → A2F5 → A2F6. */
attackA2=function(kind){
  if(state.encounterMode!=="a2Combat"||combatLocked)return;

  combatLocked=true;
  state.a2AttackAttempts=1;

  if(kind==="fist"){
    punchSound();
    showMessage("−1 VIDA<br>EL ATAQUE NO SURTIÓ EFECTO");
  }else{
    gunSound();
    showMessage("−1 ENERGÍA<br>EL ATAQUE NO SURTIÓ EFECTO");
  }

  enemyHp.textContent="∞";
  animateHit();

  setTimeout(()=>{
    state.encounterMode="a2Sequence";
    encounterCard.classList.remove("combat");
    enemyHp.style.display="none";
    gunButton.style.display="none";
    fistButton.style.display="none";
    state.a2SequenceIndex=0;
    showA2SequenceStep();
    combatLocked=false;
  },320);
};

const LAB_B_SEQUENCE=[
  "A2F1.png",
  "A2F2.png",
  "A2F3.png",
  "A2F4.png",
  "A2F5.png",
  "A2F6.png"
];

showA2SequenceStep=function(){
  if(state.a2SequenceIndex>=LAB_B_SEQUENCE.length){
    missionComplete();
    return;
  }

  const src=LAB_B_SEQUENCE[state.a2SequenceIndex];
  setEncounterImage(src,`LABORATORIO B · ${state.a2SequenceIndex+1}/${LAB_B_SEQUENCE.length}`);
  encounterCard.style.cursor="pointer";
};

advanceA2Sequence=function(){
  state.a2SequenceIndex++;
  showA2SequenceStep();
};
