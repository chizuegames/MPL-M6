function getAudioContext(){try{if(!audioCtx){const C=window.AudioContext||window.webkitAudioContext;audioCtx=new C()}if(audioCtx.state==="suspended")audioCtx.resume();return audioCtx}catch(e){return null}}
function toneSweep(a,b,d,v=.1,t="sine"){try{const c=getAudioContext();if(!c)return;const o=c.createOscillator(),g=c.createGain();o.type=t;o.frequency.setValueAtTime(a,c.currentTime);o.frequency.exponentialRampToValueAtTime(Math.max(20,b),c.currentTime+d);g.gain.setValueAtTime(v,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+d);o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+d+.02)}catch(e){}}
function scannerSound(){toneSweep(380,1240,.48,.085,"sine")}
function punchSound(){toneSweep(165,48,.17,.32,"triangle")}
function gunSound(){toneSweep(1250,170,.15,.2,"sawtooth")}
function energyLossSound(){toneSweep(720,180,.33,.11,"sine")}
function itemSound(){toneSweep(520,900,.24,.08,"triangle")}
function lifeLossSound(){[270,195,128].forEach((f,i)=>setTimeout(()=>toneSweep(f,f*.92,.11,.07,"square"),i*60))}
function missionSound(){[520,690,880,1180].forEach((f,i)=>setTimeout(()=>toneSweep(f,f*1.02,.22,.08,"sine"),i*120))}
function dockingTravelSound(){toneSweep(58,98,2.25,.09,"sawtooth")}
function dockingImpactSound(){toneSweep(115,42,.25,.24,"square");setTimeout(()=>toneSweep(610,610,.11,.08,"sine"),170);setTimeout(()=>toneSweep(830,830,.11,.08,"sine"),270)}

function showIntroPage(page){[introPage1,introPage2,dockPage].forEach(x=>x.classList.remove("active"));page.classList.add("active")}
introPage1.addEventListener("click",async()=>{
  if(introLocked)return;getAudioContext();showIntroPage(introPage2);
  try{introMusic.currentTime=0;await introMusic.play()}catch(e){}
});
function crossfadeToGameMusic(){
  bgMusic.volume=.03;
  bgMusic.play().then(()=>{musicPlaying=true;musicButton.classList.add("music-on")}).catch(()=>{});
  let current=0;const steps=18,start=introMusic.volume,t=setInterval(()=>{
    current++;const p=current/steps;introMusic.volume=Math.max(0,start*(1-p));bgMusic.volume=.03+(.32-.03)*p;
    if(current>=steps){clearInterval(t);introMusic.pause();introMusic.currentTime=0;introMusic.volume=.34;bgMusic.volume=.32}
  },65);
}
acceptMissionButton.addEventListener("click",event=>{
  event.stopPropagation();if(introLocked)return;introLocked=true;getAudioContext();crossfadeToGameMusic();dockingTravelSound();startDockingSequence();
});
function startDockingSequence(){
  showIntroPage(dockPage);dockBaseImage.src=ASSETS.stationOnly;dockShip.src=ASSETS.playerShip;dockShip.style.display="block";dockShip.classList.remove("docking");void dockShip.offsetWidth;
  setTimeout(()=>dockShip.classList.add("docking"),180);
  setTimeout(()=>{dockingImpactSound();dockFlash.classList.remove("flash");void dockFlash.offsetWidth;dockFlash.classList.add("flash");dockBaseImage.src=ASSETS.dockedStation;dockShip.style.display="none"},2450);
  setTimeout(startGame,3150);
}
function startGame(){
  setMapImage(ASSETS.map100);state.oxygen=100;updateOxygenUI();introOverlay.style.display="none";game.style.display="block";window.scrollTo(0,0);refreshRoomMarkers();showTutorial();
}

async function toggleMusic(){
  if(!musicPlaying){try{await bgMusic.play();musicPlaying=true;musicButton.classList.add("music-on")}catch(e){showMessage("NO SE PUDO ACTIVAR LA MÚSICA")}return}
  bgMusic.pause();musicPlaying=false;musicButton.classList.remove("music-on");
}
musicButton.addEventListener("click",event=>{event.stopPropagation();toggleMusic()});

const TUTORIAL_MESSAGES=[
  "Durante esta misión puedes llevar 2 Purées de vida y 1 batería de energía.",
  "Si necesitas usar un objeto, da clic en USAR OBJETO."
];
function showTutorial(){state.gameLocked=true;tutorialIndex=0;tutorialText.textContent=TUTORIAL_MESSAGES[0];tutorialNext.textContent="SIGUIENTE";tutorialOverlay.classList.add("show")}
tutorialNext.addEventListener("click",()=>{
  tutorialIndex++;
  if(tutorialIndex>=TUTORIAL_MESSAGES.length){tutorialOverlay.classList.remove("show");state.gameLocked=false;return}
  tutorialText.textContent=TUTORIAL_MESSAGES[tutorialIndex];tutorialNext.textContent="ENTENDIDO";
});

function showMessage(html){
  clearTimeout(messageTimer);message.classList.remove("show");void message.offsetWidth;message.innerHTML=html;message.classList.add("show");messageTimer=setTimeout(()=>message.classList.remove("show"),1650);
}
function formatNumber(v){return Number.isInteger(v)?String(v):v.toFixed(1).replace(".",",")}
function formatOxygen(v){return `${formatNumber(v)}%`}
function oxygenPhase(){if(state.oxygen<20)return 20;if(state.oxygen<60)return 60;return 100}
function lifeLossMovementThreshold(){if(state.oxygen>=60)return 5;if(state.oxygen>=20)return 4;return 3}
function registerMovementLifeLoss(){
  state.movementsSinceLifeLoss++;
  const threshold=lifeLossMovementThreshold();
  if(state.movementsSinceLifeLoss<threshold)return false;
  state.movementsSinceLifeLoss=0;lifeLossSound();showMessage(`FALTA DE OXÍGENO<br>PERDISTE 1 DE VIDA`);return true;
}
function setMapImage(src){mapImage.onerror=()=>{mapImage.onerror=null;if(mapImage.src.indexOf(ASSETS.map100)===-1)mapImage.src=ASSETS.map100};mapImage.src=src}
function updateOxygenUI(){
  const phase=oxygenPhase();oxygenCounter.textContent=formatOxygen(state.oxygen);oxygenCounter.classList.remove("phase60","phase20");
  setMapImage(phase===100?ASSETS.map100:phase===60?ASSETS.map60:ASSETS.map20);
  if(phase===60)oxygenCounter.classList.add("phase60");if(phase===20)oxygenCounter.classList.add("phase20");
}
function consumeOxygen(amount){
  if(state.ended)return false;state.oxygen=Math.max(0,Math.round((state.oxygen-amount)*10)/10);updateOxygenUI();
  if(state.oxygen<=0){triggerGameOver("Te has quedado sin oxígeno.");return false}return true;
}
function getMovementOxygenCost(target){if(state.currentRoom==="ENTRADA")return 0;if(state.rooms[target]?.visited)return 2.5;return 5}
useObjectButton.addEventListener("click",()=>{
  if(state.gameLocked||state.ended||encounter.classList.contains("show"))return;itemSound();if(consumeOxygen(5))showMessage("OBJETO UTILIZADO<br>−5% O₂");
});

function removeMarker(id){const el=$(id);if(el)el.remove()}
function imageMarker(id,room,src,className="map-icon event-icon"){
  removeMarker(id);const pos=ROOM_LAYOUT[room];if(!pos||!src)return null;
  const image=document.createElement("img");image.id=id;image.className=className;image.src=src;image.draggable=false;image.style.left=`${pos.x}%`;image.style.top=`${pos.y}%`;iconsLayer.appendChild(image);return image;
}
function clearMarkers(){
  removeMarker("player-marker");removeMarker("nurse-marker");
  Object.keys(ROOM_LAYOUT).forEach(room=>{removeMarker(`check-${room}`);removeMarker(`event-${room}`);removeMarker(`scan-${room}`)});
}
function markerDirection(from,to){
  if(from==="ENTRADA")return"up";const a=ROOM_LAYOUT[from],b=ROOM_LAYOUT[to];if(!a||!b)return"up";
  const dx=b.x-a.x,dy=b.y-a.y;return Math.abs(dx)>Math.abs(dy)?(dx>0?"right":"left"):(dy>0?"down":"up");
}
function refreshRoomMarkers(){
  clearMarkers();
  Object.keys(ROOM_LAYOUT).forEach(room=>{
    const roomState=state.rooms[room];
    if(room===state.currentRoom)return;
    if(roomState.completed){imageMarker(`check-${room}`,room,ASSETS.checkIcon,"map-icon check-image");return}
    const def=definitionFor(room,{draw:false});
    if(roomState.revealed&&def?.icon)imageMarker(`event-${room}`,room,def.icon,"map-icon event-icon");
  });
  if(state.nurseActivated&&!state.nurseSecondHealUsed&&state.nurseRoom&&state.nurseRoom!==state.currentRoom){
    imageMarker("nurse-marker",state.nurseRoom,ASSETS.nurseIcon,"map-icon nurse-image");
  }
  if(state.currentRoom!=="ENTRADA")imageMarker("player-marker",state.currentRoom,ASSETS.playerIcon,"map-icon player-image");
}
function maybeTriggerNurseHeal(room){
  if(!state.nurseActivated||state.nurseSecondHealUsed||state.nurseRoom!==room)return false;
  state.nurseSecondHealUsed=true;state.nurseRoom=null;itemSound();showMessage("LA ENFERMERA TE CURÓ<br>RECUPERAS 3 DE VIDA");refreshRoomMarkers();return true;
}
function moveToRoom(room,{countMovement=true}={}){
  const old=state.currentRoom;state.previousRoom=old;state.currentRoom=room;state.rooms[room].visited=true;refreshRoomMarkers();
  const lostLife=countMovement?registerMovementLifeLoss():false;
  const nurseHeal=maybeTriggerNurseHeal(room);
  return {lostLife,nurseHeal};
}
function adjacentRooms(){return GRAPH[state.currentRoom]||[]}
function isAdjacent(room){return adjacentRooms().includes(room)}

function turnOffScanner(){state.scannerActive=false;scannerButton.classList.remove("scanner-on");Object.keys(ROOM_LAYOUT).forEach(room=>removeMarker(`scan-${room}`))}
function scanNearbyRooms(){
  if(state.gameLocked||state.ended||encounter.classList.contains("show"))return;
  if(state.scannerActive){turnOffScanner();return}
  let count=0;
  adjacentRooms().forEach(room=>{
    const roomState=state.rooms[room];
    if(!roomState.completed&&!roomState.revealed){
      const pos=ROOM_LAYOUT[room],image=document.createElement("img");image.id=`scan-${room}`;image.src=ASSETS.scannerIcon;image.className=`map-icon scan-image dir-${markerDirection(state.currentRoom,room)}`;image.style.left=`${pos.x}%`;image.style.top=`${pos.y}%`;iconsLayer.appendChild(image);count++;
    }
  });
  if(!count){showMessage("SIN NUEVAS SEÑALES");return}
  state.scannerActive=true;scannerButton.classList.add("scanner-on");scannerSound();
}
scannerButton.addEventListener("click",scanNearbyRooms);
function revealRoom(room){
  const roomState=state.rooms[room],def=definitionFor(room);roomState.revealed=true;removeMarker(`scan-${room}`);
  if(def?.icon)imageMarker(`event-${room}`,room,def.icon,"map-icon event-icon");energyLossSound();showMessage(`${def?.label||"SEÑAL"}<br>−2 ENERGÍAS`);
}

function resetEncounterUI(){
  encounterCard.className="";encounterCard.style.cursor="default";
  enemyHp.style.display="none";gunButton.style.display="none";fistButton.style.display="none";specialTopButton.style.display="none";specialLowerButton.style.display="none";fleeButton.style.display="none";encounterBackButton.style.display="none";
  encounterFallback.style.display="none";encounterFallback.textContent="";encounterImage.style.display="block";
  combatLocked=false;state.combat=null;
}
function setEncounterImage(src,label="ENCUENTRO"){
  encounterFallback.style.display="none";encounterImage.style.display="block";encounterImage.alt=label;
  encounterImage.onerror=()=>{encounterImage.onerror=null;encounterImage.style.display="none";encounterFallback.style.display="flex";encounterFallback.innerHTML=`${label}<br><small>Falta el archivo ${src}</small>`};
  encounterImage.src=src||"";
}
function setEncounterImageWithFallback(candidates,label,onLoaded=null){
  const list=(Array.isArray(candidates)?candidates:[candidates]).filter(Boolean);let index=0;
  const tryNext=()=>{
    if(index>=list.length){encounterImage.onerror=null;encounterImage.style.display="none";encounterFallback.style.display="flex";encounterFallback.innerHTML=`${label}<br><small>Faltan las imágenes de esta secuencia.</small>`;if(onLoaded)onLoaded(false);return}
    const src=list[index++];encounterFallback.style.display="none";encounterImage.style.display="block";encounterImage.alt=label;
    encounterImage.onerror=tryNext;encounterImage.onload=()=>{encounterImage.onerror=null;encounterImage.onload=null;if(onLoaded)onLoaded(true)};encounterImage.src=src;
  };
  tryNext();
}
function showEncounterShell(room,def){
  turnOffScanner();state.pendingRoom=room;state.pendingDefinition=def;state.rooms[room].revealed=true;resetEncounterUI();setEncounterImage(def.card,def.label);encounter.classList.add("show");
}
function enemyHpFor(def){return def.hp?def.hp[oxygenPhase()]:0}
