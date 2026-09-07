function openEncounter(room){
  const def=definitionFor(room);showEncounterShell(room,def);

  if(def.type==="labA"){
    state.encounterMode=state.keyA?"labAReady":"labLocked";encounterBackButton.style.display="block";encounterCard.style.cursor="pointer";return;
  }
  if(def.type==="labB"){
    if(!state.keyB){state.encounterMode="labLocked";encounterBackButton.style.display="block";encounterCard.style.cursor="pointer";return}
    state.encounterMode="a2Combat";state.a2AttackAttempts=0;state.a2SequenceIndex=0;encounterCard.classList.add("combat");enemyHp.textContent="∞";return;
  }
  if(def.type==="nurse"){
    state.encounterMode="nurse";encounterCard.classList.add("special-lower");encounterBackButton.style.display="block";return;
  }
  if(def.type==="greenBranch"){
    state.encounterMode="a8Branch";state.a8Hybrid=false;encounterCard.classList.add("branch");return;
  }
  if(def.type==="combatHandshake"){
    state.encounterMode="combatHandshake";encounterCard.classList.add("combat","special-top");const hp=enemyHpFor(def);state.combat={room,definition:def,hp};enemyHp.textContent=formatNumber(hp);return;
  }
  if(def.type==="hybrid"){
    startHybrid(def,"B");return;
  }
  state.encounterMode="simple";encounterCard.style.cursor="pointer";
}

function closeEncounter(){encounter.classList.remove("show");state.pendingRoom=null;state.pendingDefinition=null;state.encounterMode=null;resetEncounterUI()}
function finishNormalRoom(reward=null){
  const room=state.pendingRoom;if(!room)return;
  state.rooms[room].completed=true;state.rooms[room].revealed=true;closeEncounter();moveToRoom(room);if(reward)setTimeout(()=>showMessage(reward),160);
}
function leaveLockedRoom(){
  const room=state.pendingRoom;if(room)state.rooms[room].revealed=true;closeEncounter();refreshRoomMarkers();
}
function animateHit(){encounterCard.classList.remove("hit");void encounterCard.offsetWidth;encounterCard.classList.add("hit")}

function chooseNurseRoamingRoom(){
  const candidates=Object.keys(state.rooms).filter(room=>state.rooms[room].visited&&room!=="A3"&&room!==state.currentRoom);
  state.nurseRoom=candidates.length?choose(candidates):null;refreshRoomMarkers();
}
function activateNurse(){
  if(state.encounterMode!=="nurse")return;
  state.encounterMode="nurseFinal";encounterCard.classList.remove("special-lower");encounterBackButton.style.display="none";setEncounterImage(state.pendingDefinition.finalCard,"ENFERMERA - FINAL");encounterCard.style.cursor="pointer";itemSound();
}

function attackCombatHandshake(kind){
  if(state.encounterMode!=="combatHandshake"||combatLocked||!state.combat)return;
  combatLocked=true;const combat=state.combat;
  if(kind==="fist"){punchSound();showMessage("−1 VIDA<br>1 DE DAÑO")}else{gunSound();showMessage("−1 ENERGÍA<br>1 DE DAÑO")}
  combat.hp=Math.max(0,combat.hp-1);enemyHp.textContent=formatNumber(combat.hp);animateHit();
  setTimeout(()=>{
    if(combat.hp>0){combatLocked=false;return}
    const reward=state.pendingDefinition.reward||null;finishNormalRoom(reward);
  },320);
}
function activateHandshake(){
  if(state.encounterMode!=="combatHandshake")return;
  state.encounterMode="handshakeFinal";state.combat=null;encounterCard.classList.remove("combat","special-top");enemyHp.style.display="none";setEncounterImage(state.pendingDefinition.finalCard,"MARCIANO VERDE - FINAL");encounterCard.style.cursor="pointer";itemSound();
}

function startHybrid(def,context){
  state.encounterMode=context==="A8"?"a8Hybrid":"hybrid";state.a8Hybrid=context==="A8";
  state.pendingDefinition=def;encounterCard.classList.add("combat","hybrid");enemyHp.textContent="∞";
}
function attackHybrid(kind){
  if(!["hybrid","a8Hybrid"].includes(state.encounterMode)||combatLocked)return;
  combatLocked=true;
  if(kind==="fist"){punchSound();showMessage("−1 VIDA<br>EL ENEMIGO NO SUFRIÓ DAÑO")}else{gunSound();showMessage("−1 ENERGÍA<br>EL ENEMIGO NO SUFRIÓ DAÑO")}
  animateHit();setTimeout(()=>{enemyHp.textContent="∞";combatLocked=false},280);
}
function fleeHybrid(){
  if(!["hybrid","a8Hybrid"].includes(state.encounterMode)||combatLocked)return;
  combatLocked=true;lifeLossSound();showMessage("HUISTE DEL COMBATE<br>PERDISTE 1 DE VIDA");
  encounterCard.classList.remove("combat","hybrid");enemyHp.style.display="none";gunButton.style.display="none";fistButton.style.display="none";fleeButton.style.display="none";
  if(state.encounterMode==="a8Hybrid"){
    state.encounterMode="a8HybridFlee1";setEncounterImage("E1F.png","HUIDA DEL HÍBRIDO");encounterCard.style.cursor="pointer";
  }else{
    state.encounterMode="hybridFinal";setEncounterImage(state.pendingDefinition.finalCard,"HÍBRIDO - HUIDA");encounterCard.style.cursor="pointer";
  }
  combatLocked=false;
}

function attackA8Branch(kind){
  if(state.encounterMode!=="a8Branch"||combatLocked)return;
  combatLocked=true;
  if(kind==="fist"){
    punchSound();showMessage("−1 VIDA");state.encounterMode="a8FistFinal";encounterCard.classList.remove("branch");setEncounterImage("A8F.png","MARCIANO VERDE - FINAL");encounterCard.style.cursor="pointer";combatLocked=false;return;
  }
  gunSound();showMessage("−1 ENERGÍA");encounterCard.classList.remove("branch");setEncounterImage("E1E.png","HÍBRIDO");startHybrid({type:"hybrid",label:"HÍBRIDO",card:"E1E.png",finalCard:"E1F.png",icon:"ICOK.png"},"A8");combatLocked=false;
}

function attackA2(kind){
  if(state.encounterMode!=="a2Combat"||combatLocked)return;
  combatLocked=true;state.a2AttackAttempts++;
  if(kind==="fist"){punchSound();showMessage("−1 VIDA<br>EL ENEMIGO NO SUFRIÓ DAÑO")}else{gunSound();showMessage("−1 ENERGÍA<br>EL ENEMIGO NO SUFRIÓ DAÑO")}
  animateHit();
  setTimeout(()=>{
    if(state.a2AttackAttempts<2){combatLocked=false;return}
    state.encounterMode="a2Sequence";encounterCard.classList.remove("combat");enemyHp.style.display="none";state.a2SequenceIndex=0;showA2SequenceStep();combatLocked=false;
  },300);
}
const A2_SEQUENCE=[
  ["A2F1.png"],
  ["A2F11.png","A2F2.png"],
  ["A2F2.png","A2F3.png"],
  ["A3F2.png","A2F3.png"],
  ["A4F2.png","A2F3.png"],
  ["A5F2.png","A2F3.png"],
  ["A6F2.png","A2F.png"]
];
function showA2SequenceStep(){
  if(state.a2SequenceIndex>=A2_SEQUENCE.length){missionComplete();return}
  const candidates=A2_SEQUENCE[state.a2SequenceIndex];setEncounterImageWithFallback(candidates,`LABORATORIO B · SECUENCIA ${state.a2SequenceIndex+1}`);encounterCard.style.cursor="pointer";
}
function advanceA2Sequence(){state.a2SequenceIndex++;showA2SequenceStep()}

function handleAttack(kind){
  if(state.encounterMode==="combatHandshake"){attackCombatHandshake(kind);return}
  if(state.encounterMode==="a8Branch"){attackA8Branch(kind);return}
  if(["hybrid","a8Hybrid"].includes(state.encounterMode)){attackHybrid(kind);return}
  if(state.encounterMode==="a2Combat"){attackA2(kind)}
}
gunButton.addEventListener("click",event=>{event.stopPropagation();handleAttack("gun")});
fistButton.addEventListener("click",event=>{event.stopPropagation();handleAttack("fist")});
specialTopButton.addEventListener("click",event=>{event.stopPropagation();activateHandshake()});
specialLowerButton.addEventListener("click",event=>{event.stopPropagation();activateNurse()});
fleeButton.addEventListener("click",event=>{event.stopPropagation();fleeHybrid()});
encounterBackButton.addEventListener("click",event=>{
  event.stopPropagation();
  if(state.encounterMode==="labLocked"){leaveLockedRoom();return}
  if(state.encounterMode==="labAReady"){leaveLockedRoom();return}
  if(state.encounterMode==="nurse"){leaveLockedRoom();return}
});

encounterCard.addEventListener("click",()=>{
  const def=state.pendingDefinition;if(!def)return;

  if(state.encounterMode==="simple"){finishNormalRoom(def.reward||null);return}

  if(state.encounterMode==="labLocked"){
    const lockedRoom=state.pendingRoom;leaveLockedRoom();showMessage(lockedRoom==="A1"?"NECESITAS LA LLAVE DEL LABORATORIO A":"NECESITAS LA LLAVE DEL LABORATORIO B");return;
  }
  if(state.encounterMode==="labAReady"){
    state.encounterMode="labAFinal";encounterBackButton.style.display="none";setEncounterImage(def.finalCard,"LABORATORIO A - FINAL");encounterCard.style.cursor="pointer";return;
  }
  if(state.encounterMode==="labAFinal"){
    finishNormalRoom("AHORA TIENES MÁS INFORMACIÓN, PERO LA REVELACIÓN ESTÁ EN EL OTRO LABORATORIO");return;
  }

  if(state.encounterMode==="nurseFinal"){
    const room=state.pendingRoom;state.rooms[room].completed=true;state.rooms[room].revealed=true;closeEncounter();moveToRoom(room);state.nurseActivated=true;itemSound();showMessage("RECUPERAS 3 DE VIDA");setTimeout(chooseNurseRoamingRoom,260);return;
  }

  if(state.encounterMode==="handshakeFinal"){finishNormalRoom();return}
  if(state.encounterMode==="a8FistFinal"){finishNormalRoom();return}

  if(state.encounterMode==="a8HybridFlee1"){
    state.encounterMode="a8HybridFlee2";setEncounterImage("A8FF.png","A8 - FINAL");encounterCard.style.cursor="pointer";return;
  }
  if(state.encounterMode==="a8HybridFlee2"){
    finishNormalRoom();return;
  }

  if(state.encounterMode==="hybridFinal"){
    const room=state.pendingRoom;releaseReusableBEvent(room);closeEncounter();moveToRoom(room);return;
  }

  if(state.encounterMode==="a2Sequence"){advanceA2Sequence();return}
});

function applyKeyReward(def){
  if(def.type==="keyA"){state.keyA=true;return def.reward}
  if(def.type==="keyB"){state.keyB=true;return def.reward}
  return def.reward||null;
}

/* Intercepta los eventos de llave para activar su estado antes de completar la sala. */
const baseEncounterClick=encounterCard.onclick;
void baseEncounterClick;
encounterCard.addEventListener("click",event=>{
  if(event.defaultPrevented)return;
  const def=state.pendingDefinition;
  if(!def||!["keyA","keyB"].includes(def.type)||state.encounterMode!=="simple")return;
  event.stopImmediatePropagation();
  finishNormalRoom(applyKeyReward(def));
},true);
