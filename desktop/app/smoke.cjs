const assert=require('node:assert/strict');const {once}=require('node:events');const {WebSocket}=require('ws');const fs=require('node:fs');const path=require('node:path');
module.exports=async({settings,overlay,token,snapshot,app})=>{
 const pause=ms=>new Promise(r=>setTimeout(r,ms));let socket;
 try{
  await settings.loaded;await pause(1500);assert.equal(snapshot().status.error,null,'Native media / bridge startup failed');
  socket=new WebSocket(`ws://127.0.0.1:17385/?token=${token}`,{origin:'chrome-extension://'+'a'.repeat(32)});await once(socket,'open');
  socket.send(JSON.stringify({type:'track',track:{title:'Luma · Verbindungstest',artist:'Lokale Testwiedergabe',playing:true,position:35,duration:180,volume:.6,shuffle:false,repeat:'off',capabilities:{shuffle:true,repeat:true,toggle:true,next:true,previous:true,seek:true,volume:true}}}));await pause(100);
  assert.equal(snapshot().track.source,'extension');assert.equal(snapshot().status.extensionConnected,true);assert.equal(await settings.webContents.executeJavaScript("document.getElementById('connection-success').classList.contains('hidden')"),false);
  const command=once(socket,'message');await settings.webContents.executeJavaScript("window.luma.command('shuffle',true)");assert.equal(JSON.parse(String((await command)[0])).action,'shuffle');
  await settings.webContents.executeJavaScript("window.luma.save({zoneEnabled:false})");await settings.webContents.executeJavaScript("window.luma.action('preview')");await pause(200);assert(overlay.isVisible());const compact=snapshot().geometry;assert.deepEqual(overlay.getBounds(),compact,'compact window matches selected rectangle exactly');
  settings.hide();
  const surface={x:compact.width-35,y:compact.height-47};
  overlay.webContents.sendInputEvent({type:'mouseDown',button:'left',clickCount:1,...surface});
  overlay.webContents.sendInputEvent({type:'mouseMove',x:surface.x+35,y:surface.y+25,modifiers:['leftButtonDown']});await pause(120);
  overlay.webContents.sendInputEvent({type:'mouseUp',button:'left',clickCount:1,x:surface.x,y:surface.y});await pause(120);
  assert.equal(overlay.getBounds().x,compact.x+35,'free background drag moves the actual window');assert.equal(overlay.getBounds().y,compact.y+25);assert(!snapshot().expandedByButton,'drag must not expand');assert(!settings.isVisible(),'background drag does not reveal settings');
  const pinPoint=await overlay.webContents.executeJavaScript("(()=>{const r=document.querySelector('.pin-widget').getBoundingClientRect();return{x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)};})()");
  overlay.webContents.sendInputEvent({type:'mouseDown',button:'left',clickCount:1,...pinPoint});overlay.webContents.sendInputEvent({type:'mouseUp',button:'left',clickCount:1,...pinPoint});await pause(100);assert(snapshot().pinned,'real pin click remembers dragged position');assert(!settings.isVisible(),'pin click does not reveal settings');
  await overlay.webContents.executeJavaScript("window.luma.action('pin');window.luma.action('dismiss')");await pause(80);await settings.webContents.executeJavaScript("window.luma.action('preview')");await pause(260);assert.equal(overlay.getBounds().x,compact.x);
  const button=await overlay.webContents.executeJavaScript("(()=>{const r=document.querySelector('.expand-button').getBoundingClientRect();return{x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)};})()");
  overlay.webContents.sendInputEvent({type:'mouseDown',button:'left',clickCount:1,...button});overlay.webContents.sendInputEvent({type:'mouseUp',button:'left',clickCount:1,...button});await pause(240);assert(snapshot().expandedByButton,'real pointer hit expands');assert(overlay.getBounds().height>=300);assert.equal(overlay.getBounds().x,compact.x);
  await settings.webContents.executeJavaScript("window.luma.save({widgetWidth:480})");await pause(80);assert.equal(overlay.getBounds().width,480);assert(overlay.getBounds().height>=300,'resizing preserves expanded height');
  const image=await overlay.webContents.capturePage();fs.writeFileSync(path.resolve(__dirname,'../../Luma-Widget.png'),image.toPNG());
  settings.hide();app.emit('activate');await pause(50);assert(!settings.isVisible(),'overlay app activation must not open settings');
  const close=await overlay.webContents.executeJavaScript("(()=>{const r=document.querySelector('.close-widget').getBoundingClientRect();return{x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)};})()");
  overlay.webContents.sendInputEvent({type:'mouseDown',button:'left',clickCount:1,...close});overlay.webContents.sendInputEvent({type:'mouseUp',button:'left',clickCount:1,...close});await pause(500);assert(!overlay.isVisible(),'X hides immediately without reopening from the preview timer');
  await settings.webContents.executeJavaScript("window.luma.action('preview')");await pause(260);const base=overlay.getBounds(),d=snapshot().geometry;overlay.setPosition(base.x+25,base.y+25);await pause(90);assert.equal(overlay.getBounds().x,base.x+25,'temporary drag stays until hidden');await overlay.webContents.executeJavaScript("window.luma.action('dismiss')");await pause(80);await settings.webContents.executeJavaScript("window.luma.action('preview')");await pause(260);assert.equal(overlay.getBounds().x,d.x,'temporary position resets on reopen');
  const beforePin=overlay.getBounds();overlay.setPosition(beforePin.x+35,beforePin.y+35);await pause(90);await overlay.webContents.executeJavaScript("window.luma.action('pin')");await pause(50);const pinned=overlay.getBounds();assert(snapshot().pinned,'pin saved');await overlay.webContents.executeJavaScript("window.luma.action('dismiss')");await pause(60);await settings.webContents.executeJavaScript("window.luma.action('preview')");await pause(260);assert.equal(overlay.getBounds().x,pinned.x,'pinned position survives reopen');await overlay.webContents.executeJavaScript("window.luma.action('pin')");
  socket.close();await once(socket,'close');await pause(100);assert.notEqual(snapshot().track?.source,'extension');
  console.log('App smoke: real native startup, authenticated extension, command routing, independent widget size, real pointer expansion and X dismissal and disconnect fallback passed.');app.quit();
 }catch(e){console.error(e);socket?.terminate();app.exit(1);}
};
