const ASSETS={
  introIncoming:"M01a.png",
  introMission:"M01b.png",
  stationOnly:"MIa.png",
  dockedStation:"MIb.png",
  playerShip:"NVKael.png",
  playerIcon:"ICOKAEL.png",
  map100:"MIc100.png",
  map60:"MIc60.png",
  map20:"MIc20.png",
  scannerIcon:"Esc1.png",
  checkIcon:"icocheck.png",
  nurseIcon:"ICOEMF.png"
};

/* Coordenadas del esquema de MPL6 sobre MIc100/60/20. */
const ROOM_LAYOUT={
  A5:{x:13.3,y:19.8},B1:{x:31.6,y:19.8},B9:{x:50.0,y:19.8},B2:{x:70.2,y:19.8},A6:{x:86.9,y:19.8},
  A3:{x:13.3,y:29.8},A7:{x:50.0,y:29.8},A4:{x:86.9,y:29.8},
  A1:{x:31.6,y:39.9},B6:{x:50.0,y:39.9},A2:{x:70.2,y:39.9},
  B3:{x:13.3,y:50.0},B5:{x:31.6,y:50.0},A8:{x:50.0,y:50.0},B7:{x:70.2,y:50.0},B4:{x:86.9,y:50.0},
  A9:{x:31.6,y:60.0},B10:{x:50.0,y:60.0},A10:{x:70.2,y:60.0},
  A11:{x:50.0,y:70.1},
  A12:{x:31.6,y:80.2},B8:{x:50.0,y:80.2},A13:{x:70.2,y:80.2}
};

/* Cada borde rojo del diagrama corresponde a una conexión. La entrada inicial es A11. */
const GRAPH={
  ENTRADA:["A11"],
  A5:["B1","A3"],B1:["A5","B9"],B9:["B1","B2","A7"],B2:["B9","A6"],A6:["B2","A4"],
  A3:["A5"],A7:["B9","B6"],A4:["A6"],
  A1:["B6"],B6:["A1","A2","A7","A8"],A2:["B6"],
  B3:["B5"],B5:["B3","A8","A9"],A8:["B5","B7","B6","B10"],B7:["A8","B4","A10"],B4:["B7"],
  A9:["B5","B10"],B10:["A9","A10","A8","A11"],A10:["B10","B7"],
  A11:["B10","B8"],
  A12:["B8"],B8:["A12","A13","A11"],A13:["B8"]
};

const FIXED_DEFINITIONS={
  A1:{type:"labA",label:"LABORATORIO A",card:"A1E.png",finalCard:"A1F.png",icon:"ICOBT.png"},
  A2:{type:"labB",label:"LABORATORIO B",card:"A2E.png",finalCard:"A2F.png",icon:"ICOK.png"},
  A3:{type:"nurse",label:"ENFERMERA",card:"A3E.png",finalCard:"A3F.png",icon:"ICOEMF.png"},
  A4:{type:"simple",label:"VIDA",card:"SDV.png",icon:"ICOV.png",reward:"MÁS 1 DE VIDA"},
  A5:{type:"simple",label:"TRAMPA DE ENERGÍA",card:"TRE.png",icon:"ICOTR.png",reward:"PIERDE 1 DE ENERGÍA"},
  A6:{type:"keyA",label:"TARJETA LLAVE",card:"TLL.png",icon:"ICOV.png",reward:"OBTUVISTE LA LLAVE DEL LABORATORIO A"},
  A7:{type:"simple",label:"CAJA DE OBJETO",card:"CJO.png",icon:"ICOCO.png",reward:"TOMA UN OBJETO"},
  A8:{type:"greenBranch",label:"MARCIANO VERDE E",card:"A8E.png",finalCard:"A8F.png",icon:"ICOMV.png"},
  A9:{type:"simple",label:"TRAMPA DE VIDA",card:"TRV.png",icon:"ICOTR.png",reward:"PIERDE 1 DE VIDA"},
  A10:{type:"simple",label:"TRAMPA DE ENERGÍA",card:"TRE.png",icon:"ICOTR.png",reward:"PIERDE 1 DE ENERGÍA"},
  A11:{type:"combatHandshake",label:"MARCIANO VERDE E",card:"A11E.png",finalCard:"A11F.png",icon:"ICOMV.png",hp:{100:1,60:1,20:2}},
  A12:{type:"keyB",label:"TARJETA LLAVE",card:"TLL.png",icon:"ICOV.png",reward:"OBTUVISTE LA LLAVE DEL LABORATORIO B"},
  A13:{type:"simple",label:"CAJA DE OBJETO",card:"CJO.png",icon:"ICOCO.png",reward:"TOMA UN OBJETO"}
};

/* Las diez fichas B se sortean. Los híbridos vuelven al mazo tras huir.
   Regla general: E siempre es el encuentro inicial y F el resultado/final. */
const B_EVENT_POOL_TEMPLATE=[
  {sourceId:"B1",type:"simple",label:"CAJA DE OBJETO",card:"CJO.png",icon:"ICOCO.png",reward:"TOMA UN OBJETO"},
  {sourceId:"B2",type:"simple",label:"TRAMPA DE VIDA",card:"TRV.png",icon:"ICOTR.png",reward:"PIERDE 1 DE VIDA"},
  {sourceId:"B3",type:"hybrid",label:"HÍBRIDO",card:"B9E.png",finalCard:"B9F.png",icon:"ICOK.png",reusable:true},
  {sourceId:"B4",type:"hybrid",label:"HÍBRIDO",card:"B9E.png",finalCard:"B9F.png",icon:"ICOK.png",reusable:true},
  {sourceId:"B5",type:"simple",label:"CAJA DE OBJETO",card:"CJO.png",icon:"ICOCO.png",reward:"TOMA UN OBJETO"},
  {sourceId:"B6",type:"simple",label:"VIDA",card:"SDV.png",icon:"ICOV.png",reward:"MÁS 1 DE VIDA"},
  {sourceId:"B7",type:"simple",label:"VIDA",card:"SDV.png",icon:"ICOV.png",reward:"MÁS 1 DE VIDA"},
  {sourceId:"B8",type:"simple",label:"VIDA",card:"SDV.png",icon:"ICOV.png",reward:"MÁS 1 DE VIDA"},
  {sourceId:"B9",type:"hybrid",label:"HÍBRIDO",card:"B9E.png",finalCard:"B9F.png",icon:"ICOK.png",reusable:true},
  {sourceId:"B10",type:"hybrid",label:"HÍBRIDO",card:"B9E.png",finalCard:"B9F.png",icon:"ICOK.png",reusable:true}
];
const B_ROOMS=["B1","B2","B3","B4","B5","B6","B7","B8","B9","B10"];

const state={
  currentRoom:"ENTRADA",
  previousRoom:null,
  oxygen:100,
  scannerActive:false,
  pendingRoom:null,
  pendingDefinition:null,
  encounterMode:null,
  combat:null,
  gameLocked:true,
  ended:false,
  rooms:{},
  keyA:false,
  keyB:false,
  bAvailable:[],
  bAssignments:{},
  nurseActivated:false,
  nurseRoom:null,
  nurseSecondHealUsed:false,
  movementsSinceLifeLoss:0,
  a2AttackAttempts:0,
  a2SequenceIndex:0,
  a8Hybrid:false
};
Object.keys(ROOM_LAYOUT).forEach(room=>state.rooms[room]={revealed:false,completed:false,visited:false});

const $=id=>document.getElementById(id);
const introOverlay=$("introOverlay"),introPage1=$("introPage1"),introPage2=$("introPage2"),dockPage=$("dockPage"),acceptMissionButton=$("acceptMissionButton"),dockBaseImage=$("dockBaseImage"),dockShip=$("dockShip"),dockFlash=$("dockFlash");
const game=$("game"),mapImage=$("mapImage"),roomsLayer=$("roomsLayer"),iconsLayer=$("iconsLayer"),scannerButton=$("scannerButton"),useObjectButton=$("useObjectButton"),musicButton=$("musicButton"),oxygenCounter=$("oxygenCounter");
const tutorialOverlay=$("tutorialOverlay"),tutorialText=$("tutorialText"),tutorialNext=$("tutorialNext");
const encounter=$("encounter"),encounterCard=$("encounterCard"),encounterImage=$("encounterImage"),encounterFallback=$("encounterFallback"),enemyHp=$("enemyHp"),gunButton=$("gunButton"),fistButton=$("fistButton"),specialTopButton=$("specialTopButton"),specialLowerButton=$("specialLowerButton"),fleeButton=$("fleeButton"),encounterBackButton=$("encounterBackButton");
const message=$("message"),endOverlay=$("endOverlay"),endTitle=$("endTitle"),endSubtitle=$("endSubtitle"),introMusic=$("introMusic"),bgMusic=$("bgMusic");

let messageTimer=null,musicPlaying=false,combatLocked=false,introLocked=false,audioCtx=null,tutorialIndex=0;
introMusic.volume=.34;bgMusic.volume=.32;

function randomIndex(max){
  if(max<=1)return 0;
  if(window.crypto&&window.crypto.getRandomValues){const d=new Uint32Array(1);window.crypto.getRandomValues(d);return d[0]%max}
  return Math.floor(Math.random()*max);
}
function choose(list){return list[randomIndex(list.length)]}
function cloneDefinition(def){return {...def,hp:def.hp?{...def.hp}:undefined}}
function resetBPool(){state.bAvailable=B_EVENT_POOL_TEMPLATE.map(cloneDefinition);state.bAssignments={}}
resetBPool();

function drawBEvent(room){
  if(state.bAssignments[room])return state.bAssignments[room];
  if(!state.bAvailable.length){
    /* Cuando solo quedan encuentros reutilizables, los híbridos siguen circulando. */
    state.bAvailable=B_EVENT_POOL_TEMPLATE.filter(x=>x.reusable).map(cloneDefinition);
  }
  const index=randomIndex(state.bAvailable.length);
  const [drawn]=state.bAvailable.splice(index,1);
  state.bAssignments[room]=drawn;
  return drawn;
}
function releaseReusableBEvent(room){
  const def=state.bAssignments[room];
  if(def?.reusable)state.bAvailable.push(cloneDefinition(def));
  delete state.bAssignments[room];
  state.rooms[room].revealed=false;
  state.rooms[room].completed=false;
}
function definitionFor(room,{draw=true}={}){
  if(FIXED_DEFINITIONS[room])return FIXED_DEFINITIONS[room];
  if(B_ROOMS.includes(room))return state.bAssignments[room]||(draw?drawBEvent(room):null);
  return {type:"simple",label:"SALA VACÍA",card:"SLV.png",icon:null};
}

function buildRooms(){
  Object.entries(ROOM_LAYOUT).forEach(([room,pos])=>{
    const button=document.createElement("button");
    button.type="button";button.className="room";button.id=`room-${room}`;button.setAttribute("aria-label",`Habitación ${room}`);
    button.style.left=`${pos.x}%`;button.style.top=`${pos.y}%`;
    button.addEventListener("click",()=>handleRoomClick(room));
    roomsLayer.appendChild(button);
  });
}
buildRooms();

const preload=[...Object.values(ASSETS)];
Object.values(FIXED_DEFINITIONS).forEach(d=>[d.card,d.finalCard,d.icon].filter(Boolean).forEach(x=>preload.push(x)));
B_EVENT_POOL_TEMPLATE.forEach(d=>[d.card,d.finalCard,d.icon].filter(Boolean).forEach(x=>preload.push(x)));
[
  "E1E.png","E1F.png","A8FF.png","A2F1.png","A2F11.png","A2F2.png","A2F3.png",
  "A3F2.png","A4F2.png","A5F2.png","A6F2.png"
].forEach(x=>preload.push(x));
preload.filter(Boolean).forEach(src=>{const i=new Image();i.src=src});
