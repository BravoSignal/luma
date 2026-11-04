const {test}=require('node:test');const assert=require('node:assert/strict');const vm=require('node:vm');const fs=require('node:fs');const {chooseTrack}=require('../app/routing.cjs');
function fixture({dialogDelay=0,confirmRating=true}={}){
 let shuffle=false,repeat='NONE',rating='INDIFFERENT',dialog=false,receiver,checks=0;const sent=[];
 const buttons={shuffle:{click(){shuffle=!shuffle;}},repeat:{click(){repeat=({NONE:'ALL',ALL:'ONE',ONE:'NONE'})[repeat];}}};
 const ratingButtons=Object.fromEntries(['like','dislike'].map(action=>[action,{click(){if(confirmRating){const target=action==='like'?'LIKE':'DISLIKE';rating=rating===target?'INDIFFERENT':target;}}}]));
 const likeRenderer={getAttribute:()=>rating,querySelector:s=>s.includes('dislike')?ratingButtons.dislike:ratingButtons.like,updateLikeStatus(){throw Error('Internal APIs must not be called');}};
 const menu={click(){}};const playlistItem={hidden:false,getBoundingClientRect:()=>({height:30}),getAttribute:()=> 'Zu Playlist hinzufügen',querySelector:()=>({click(){dialog=true;}})};
 const dialogElement={hidden:false,getBoundingClientRect:()=>({height:400})};
 const bar={hasAttribute:()=>shuffle,getState:()=>({queue:{repeatMode:repeat}}),querySelector:s=>s.includes('like-button-renderer')?likeRenderer:s.includes('shuffle')?buttons.shuffle:s.includes('repeat')?buttons.repeat:menu};
 const win={postMessage:m=>sent.push(m),addEventListener:(name,fn)=>receiver=fn};
 const context={window:win,location:{origin:'https://music.youtube.com'},document:{querySelector:s=>s==='ytmusic-player-bar'?bar:null,querySelectorAll:s=>s==='ytmusic-add-to-playlist-renderer'?(dialog&&++checks>dialogDelay?[dialogElement]:[]):[playlistItem]},setInterval:()=>{},setTimeout:fn=>{queueMicrotask(fn);}};
 vm.runInNewContext(fs.readFileSync(require.resolve('../extension/page.js'),'utf8'),context);return{sent,async command(action,value){await receiver({source:win,origin:context.location.origin,data:{channel:'luma-content',action,value,id:1}});},buttons};
}
test('YouTube bridge confirms shuffle and repeat off/all/one from player state',async()=>{const f=fixture();await f.command('shuffle',true);assert(f.sent.some(m=>m.type==='result'&&m.ok));await f.command('repeat','one');assert.equal(f.sent.filter(m=>m.type==='modes').at(-1).repeat,'one');await f.command('repeat','all');assert.equal(f.sent.filter(m=>m.type==='modes').at(-1).repeat,'all');await f.command('repeat','off');assert.equal(f.sent.filter(m=>m.type==='modes').at(-1).repeat,'off');});
test('YouTube bridge reports missing shuffle button as failure',async()=>{const f=fixture();f.buttons.shuffle=null;await f.command('shuffle',true);assert.equal(f.sent.filter(m=>m.type==='result').at(-1).ok,false);});
test('routing prioritizes connected YouTube playback and falls back to system',()=>{const sys={title:'Other song',playing:true},ext={title:'YouTube song',playing:true};assert.equal(chooseTrack(sys,ext),ext);assert.equal(chooseTrack(sys,null),sys);assert.equal(chooseTrack(null,ext),ext);assert.equal(chooseTrack(sys,{...ext,playing:false}),sys);assert.equal(chooseTrack({...sys,title:ext.title},ext),ext);});

test('likes toggle confirmed player state and playlist opens the selection dialog',async()=>{const f=fixture();await f.command('like');assert.equal(f.sent.filter(m=>m.type==='modes').at(-1).like,'LIKE');await f.command('like');assert.equal(f.sent.filter(m=>m.type==='modes').at(-1).like,'INDIFFERENT');await f.command('dislike');assert.equal(f.sent.filter(m=>m.type==='modes').at(-1).like,'DISLIKE');await f.command('playlist');assert.equal(f.sent.filter(m=>m.type==='result').at(-1).ok,true);});

test('extension focuses the existing playing tab and its window without creating a tab',async()=>{
 let ws,receive;const sent=[],focused=[],activated=[],ordered=[];
 class Socket{static OPEN=1;static CONNECTING=0;constructor(){this.readyState=1;ws=this;}send(s){sent.push(JSON.parse(s));}}
 const chrome={storage:{local:{get:async()=>({token:'a'.repeat(48)})},onChanged:{addListener(){}}},action:{setBadgeText(){},setBadgeBackgroundColor(){},onClicked:{addListener(){}}},tabs:{get:async id=>({id,windowId:19}),update:async(id,v)=>{activated.push([id,v]);ordered.push('tab');},sendMessage:async(id,m)=>ordered.push(m.action),onRemoved:{addListener(){}},onUpdated:{addListener(){}}},windows:{update:async(id,v)=>{focused.push([id,v]);ordered.push('window');}},runtime:{onMessage:{addListener:f=>receive=f},onInstalled:{addListener(){}},onStartup:{addListener(){}}},alarms:{onAlarm:{addListener(){}},create(){}}};
 vm.runInNewContext(fs.readFileSync(require.resolve('../extension/background.js'),'utf8'),{chrome,WebSocket:Socket,setInterval(){},clearInterval(){},setTimeout(){},clearTimeout(){}});await new Promise(r=>setImmediate(r));
 receive({type:'track',track:null},{tab:{id:8},url:'https://music.youtube.com/'});receive({type:'track',track:{playing:true,title:'Song'}},{tab:{id:9},url:'https://music.youtube.com/'});ws.onmessage({data:JSON.stringify({type:'command',action:'focus'})});await new Promise(r=>setImmediate(r));
 assert.equal(JSON.stringify(activated),JSON.stringify([[9,{active:true}]]));assert.equal(JSON.stringify(focused),JSON.stringify([[19,{focused:true}]]));assert(sent.some(r=>r.action==='focus'&&r.ok));ordered.length=0;ws.onmessage({data:JSON.stringify({type:'command',action:'playlist'})});await new Promise(r=>setImmediate(r));assert.deepEqual(ordered,['tab','window','playlist'],'playlist command waits for the tab and window to be focused');
});

test('removed queue commands do not read or send upcoming songs',async()=>{
 let receive,reads=0;const sent=[];vm.runInNewContext(fs.readFileSync(require.resolve('../extension/content.js'),'utf8'),{chrome:{runtime:{sendMessage:async m=>sent.push(m),onMessage:{addListener:f=>receive=f}}},window:{addEventListener(){}},location:{origin:'https://music.youtube.com'},document:{querySelector:()=>null,querySelectorAll:()=>{reads++;return[];},addEventListener(){}},setInterval(){},setTimeout(){}});
 const before=sent.length;await receive({type:'command',action:'queue'});assert.equal(reads,0);assert.equal(sent.length,before);
});

test('playlist waits for a delayed visible dialog and ratings require confirmation',async()=>{
 const slow=fixture({dialogDelay:8});await slow.command('playlist');assert.equal(slow.sent.filter(m=>m.type==='result').at(-1).ok,true);
 const unconfirmed=fixture({confirmRating:false});await unconfirmed.command('like');assert.equal(unconfirmed.sent.filter(m=>m.type==='result').at(-1).ok,false);
});
