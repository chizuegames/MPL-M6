function handleRoomClick(room){
  if(state.gameLocked||state.ended||encounter.classList.contains("show"))return;
  if(room===state.currentRoom){showMessage("ESTÁS EN ESTA SALA");return}
  if(!isAdjacent(room)){showMessage("SOLO PUEDES IR A UNA SALA ALEDAÑA");return}

  if(state.scannerActive&&!state.rooms[room].revealed){revealRoom(room);return}

  const cost=getMovementOxygenCost(room);if(cost>0&&!consumeOxygen(cost))return;
  turnOffScanner();

  if(state.rooms[room].completed){moveToRoom(room);return}

  state.rooms[room].visited=true;
  openEncounter(room);
}

function triggerGameOver(reason="Has muerto durante la misión."){
  if(state.ended)return;state.ended=true;state.gameLocked=true;turnOffScanner();encounter.classList.remove("show");endOverlay.className="show gameover";endTitle.textContent="HAS MUERTO";endSubtitle.innerHTML=reason;
}
function missionComplete(){
  if(state.ended)return;state.ended=true;state.gameLocked=true;turnOffScanner();encounter.classList.remove("show");missionSound();endOverlay.className="show mission";endTitle.textContent="MISIÓN CUMPLIDA";endSubtitle.textContent="Has descubierto la verdad que ocultaban los laboratorios.";
}

let lastTouchEnd=0;document.addEventListener("touchend",event=>{const now=Date.now();if(now-lastTouchEnd<=300)event.preventDefault();lastTouchEnd=now},{passive:false});
