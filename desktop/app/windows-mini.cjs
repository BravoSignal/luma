const {iconPng}=require('./mini-icons.cjs');
function createWindowsMini({Tray,nativeImage,Menu,onCommand,onDisable,onOpen,onError=()=>{}}){
 let items=[],timer=null,state={enabled:false,playing:false,hasTrack:false,accent:'#c9f3a7',language:'en'},phase=0,lastSignature='';
 const image=kind=>nativeImage.createFromBuffer(iconPng(kind,state.accent,phase,state.playing,state.hasTrack));
 const close=()=>{clearInterval(timer);timer=null;for(const item of items)if(!item.isDestroyed())item.destroy();items=[];lastSignature='';};
 return{update(next){state=next;if(!state.enabled){close();return;}try{
  if(!items.length){for(const [i,action] of ['wave','previous','toggle','next'].entries()){const item=new Tray(image(action==='toggle'?(state.playing?'pause':'play'):action));item.on('click',()=>{if(i===0)onOpen();else if(state.hasTrack)onCommand(action);});items.push(item);}timer=setInterval(()=>{if(!items.length||!state.playing)return;phase+=.55;items[0].setImage(image('wave'));},260);}
  const sig=JSON.stringify(state);if(sig!==lastSignature){lastSignature=sig;const de=state.language==='de';const labels=de?['Luma · Wiedergabe','Vorheriger Titel',state.playing?'Pause':'Wiedergabe','Nächster Titel']:['Luma · Playback','Previous track',state.playing?'Pause':'Play','Next track'];const menu=Menu.buildFromTemplate([{label:de?'Luma öffnen':'Open Luma',click:onOpen},{label:de?'Mini-Player ausschalten':'Disable mini player',click:onDisable}]);for(let i=0;i<items.length;i++){items[i].setImage(image(['wave','previous',state.playing?'pause':'play','next'][i]));items[i].setToolTip(labels[i]);items[i].setContextMenu(menu);}}
 }catch(e){close();onError(e.message);}},diagnostics:()=>({enabled:!!state.enabled,icons:items.length}),close};
}
module.exports={createWindowsMini};
