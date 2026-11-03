const { app, BrowserWindow, ipcMain, screen, Tray, Menu, nativeImage, clipboard, shell, systemPreferences } = require('electron');
const fs = require('node:fs'); const path = require('node:path'); const crypto = require('node:crypto');
const { defaults, inside, zoneBounds, sanitizeConfig } = require('./core.cjs');
const {widgetRect,overlayRect,activationRect,viewportFor}=require('./geometry.cjs');
const {forDisplay,migrateZones,hitZone,saveZone}=require('./zones.cjs');
const {bindingHeld,labelBinding}=require('./binding.cjs');
const {createBridge}=require('./bridge.cjs');
const {chooseTrack}=require('./routing.cjs');
const { createMedia } = require('./media.cjs');
const capture = process.argv.includes('--capture');
const smoke=process.argv.includes('--smoke');
if(capture||smoke)app.setPath('userData',path.resolve(__dirname,'../../../work/qa-profile'));
let tutorialIndicator=null;
let activeDisplayId=null,temporaryPosition=null,expectedBounds=null,extensionBridge, systemTrack=null, extensionTrack=null, systemStatus={}, extensionStatus={}, settings, overlay, tray, bridge, hook, config, token, track=null, overlayHeight=150, status={connected:false,error:null}, recording=false, dismissed=false,expandedByButton=null,held=false, hovered=false, pressed=new Set(), lastActive=0, previewUntil=0, selecting=[], quitting=false;
if (!app.requestSingleInstanceLock()) app.quit();
else {
 app.on('second-instance',()=>openSettings());
 app.whenReady().then(start);
 app.on('window-all-closed',()=>{});
 app.on('before-quit',()=>{quitting=true;bridge?.close();extensionBridge?.close();hook?.removeAllListeners();});
 // Overlay clicks can activate the app on macOS. Settings open only through explicit actions.
}
function snapshot(){return {atTopEdge:!!forDisplay(config,display()).edgeTop&&widgetRect(forDisplay(config,display()),display()).y===display().bounds.y,expandedByButton,held,hovered,extensionPath:path.join(app.getPath('userData'),'Luma-Browser-Erweiterung'),activationGeometry:activationRect(forDisplay(config,display()),display()),visible:!!overlay?.isVisible(),geometry:widgetRect(forDisplay(config,display()),display()),pinned:!!config.pinnedPositions?.[display().id]&&!temporaryPosition,bindingLabel:labelBinding(config.binding),config,token,track,status,platform:process.platform,holdReady:!!hook,displays:screen.getAllDisplays().map(d=>({id:d.id,label:d.label||`${d.size.width} × ${d.size.height}`,width:d.size.width,height:d.size.height,zone:config.zones.find(z=>z.displayId===d.id)||null}))};}
function broadcast(){for(const w of [settings,overlay])if(w&&!w.isDestroyed())w.webContents.send('state',snapshot());}
function persist(){fs.writeFileSync(path.join(app.getPath('userData'),'config.json'),JSON.stringify({config,token},null,2),{mode:0o600});}
function windowFor(opts){const w=new BrowserWindow({...opts,webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true}});w.webContents.setWindowOpenHandler(()=>({action:'deny'}));w.webContents.on('will-navigate',e=>e.preventDefault());return w;}
function openSettings(){if(!config)return;if(settings&&!settings.isDestroyed()){settings.show();settings.focus();return;}settings=windowFor({width:1180,height:820,minWidth:940,minHeight:720,backgroundColor:'#111414',title:'Luma · Deine Musik',autoHideMenuBar:true,titleBarStyle:process.platform==='darwin'?'hiddenInset':'default'});settings.on('hide',()=>showTutorialIndicator(false));settings.loaded=settings.loadFile(path.join(__dirname,'index.html'));settings.on('close',e=>{if(!quitting&&!capture&&!smoke){e.preventDefault();settings.hide();}});}
function showTutorialIndicator(show){
 tutorialIndicator?.destroy();tutorialIndicator=null;
 if(!show||!tray||process.platform!=='darwin')return;
 const b=tray.getBounds();if(!b.width)return;
 const d=screen.getDisplayMatching(b),width=240,x=Math.max(d.bounds.x,Math.min(d.bounds.x+d.bounds.width-width,b.x+b.width/2-width/2));
 tutorialIndicator=windowFor({x:Math.round(x),y:b.y+b.height,width,height:180,show:false,frame:false,transparent:true,focusable:false,skipTaskbar:true,hasShadow:false,resizable:false});
 tutorialIndicator.setIgnoreMouseEvents(true);tutorialIndicator.setAlwaysOnTop(true,'screen-saver');tutorialIndicator.setVisibleOnAllWorkspaces(true);
 tutorialIndicator.loadFile(path.join(__dirname,'tutorial-arrow.html'),{query:{tip:String(b.x+b.width/2-x)}}).then(()=>tutorialIndicator?.showInactive());
}
function display(){return screen.getAllDisplays().find(d=>d.id===(activeDisplayId??config.displayId))||screen.getPrimaryDisplay();}
function placeOverlay(){overlay.setAlwaysOnTop(true,forDisplay(config,display()).edgeTop?'status':'floating');let b=overlayRect(forDisplay(config,display()),display(),overlayHeight);if(temporaryPosition){const area=viewportFor(forDisplay(config,display()),display());b={...b,x:Math.round(Math.max(area.x,Math.min(area.x+area.width-b.width,temporaryPosition.x))),y:Math.round(Math.max(area.y,Math.min(area.y+area.height-b.height,temporaryPosition.y)))};}expectedBounds=b;overlay.setBounds(b);}
function savePinnedPosition(){const id=display().id;if(config.pinnedPositions[id]&&!temporaryPosition){const positions={...config.pinnedPositions};delete positions[id];config={...config,pinnedPositions:positions};}else{const b=overlay.getBounds(),a=viewportFor(forDisplay(config,display()),display());config={...config,pinnedPositions:{...config.pinnedPositions,[id]:{x:Math.max(0,Math.min(1,(b.x-a.x)/Math.max(1,a.width))),y:Math.max(0,Math.min(1,(b.y-a.y)/Math.max(1,a.height)))}}};}temporaryPosition=null;persist();placeOverlay();broadcast();}
function enableHook(){
 if(!config.holdEnabled){held=false;delete status.hookError;return;}
 if(hook)return;
 if(process.platform==='darwin'&&!systemPreferences.isTrustedAccessibilityClient(false)){status.hookError='Für die Halte-Taste bitte Luma in Systemeinstellungen → Datenschutz & Sicherheit → Bedienungshilfen erlauben. Danach Luma neu starten.';broadcast();return;}
 try{const {uIOhook}=require('uiohook-napi');hook=uIOhook;const updateHeld=()=>{const next=!recording&&config.holdEnabled&&bindingHeld(config.binding,pressed);if(next!==held){held=next;broadcast();}};hook.on('keydown',e=>{pressed.add(e.keycode);updateHeld();});hook.on('keyup',e=>{pressed.delete(e.keycode);updateHeld();});hook.start();delete status.hookError;}
 catch(e){hook=null;status.hookError='Die Halte-Taste ist nicht verfügbar: '+e.message;}
}
async function start(){
 let saved={};try{saved=JSON.parse(fs.readFileSync(path.join(app.getPath('userData'),'config.json'),'utf8'));}catch{}
 config=migrateZones(sanitizeConfig(saved.config||{},defaults),screen.getPrimaryDisplay().id);activeDisplayId=config.displayId??screen.getPrimaryDisplay().id;overlayHeight=widgetRect(forDisplay(config,display()),display()).height;token=typeof saved.token==='string'&&/^[a-f0-9]{48}$/.test(saved.token)?saved.token:crypto.randomBytes(24).toString('hex');persist();
 openSettings();
 overlay=windowFor({width:420,height:150,show:false,frame:false,transparent:true,alwaysOnTop:true,skipTaskbar:true,resizable:false,hasShadow:false,focusable:false,acceptFirstMouse:true});
 overlay.on('move',()=>{const b=overlay.getBounds();if(expectedBounds&&b.x===expectedBounds.x&&b.y===expectedBounds.y)return;temporaryPosition={x:b.x,y:b.y};activeDisplayId=screen.getDisplayMatching(b).id;broadcast();});
 overlay.setVisibleOnAllWorkspaces(true,{visibleOnFullScreen:true});overlay.setAlwaysOnTop(true,'floating');overlay.loadFile(path.join(__dirname,'index.html'),{query:{view:'overlay'}});placeOverlay();
 if(capture){await settings.loaded;await settings.webContents.executeJavaScript('document.fonts.ready');await new Promise(r=>setTimeout(r,800));const img=await settings.webContents.capturePage();fs.writeFileSync(path.resolve('..','Luma-Vorschau.png'),img.toPNG());app.quit();return;}
 const icon=nativeImage.createFromPath(path.join(__dirname,'tray.png')).resize({width:22,height:22});if(process.platform==='darwin')icon.setTemplateImage(true);
 tray=new Tray(icon);if(process.platform==='darwin')tray.setTitle(' Luma');tray.setToolTip('Luma · Musik in Reichweite');tray.setContextMenu(Menu.buildFromTemplate([{label:'Luma öffnen',click:openSettings},{label:'Widget einblenden',click:()=>{previewUntil=Date.now()+7000;}},{type:'separator'},{label:'Kurzanleitung',click:()=>{openSettings();settings.loaded.then(()=>settings.webContents.send('navigate','tutorial'));}},{label:'Beenden',click:()=>app.quit()}]));tray.on('click',openSettings);if(process.platform==='darwin')app.dock.hide();
 bridge=createMedia({root:app.isPackaged?path.join(process.resourcesPath,'native'):path.resolve(__dirname,'../native'),onTrack:t=>{systemTrack=t;refreshMedia();},onStatus:s=>{systemStatus={...systemStatus,...s};refreshMedia();},onResult:commandResult});
 extensionBridge=createBridge({token,port:smoke?17385:17384,onTrack:t=>{extensionTrack=t;refreshMedia();},onStatus:s=>{extensionStatus=s;refreshMedia();},onResult:commandResult});
 if(!smoke)enableHook();
 if(smoke)require('./smoke.cjs')({settings,overlay,token,snapshot,app});
 screen.on('display-metrics-changed',()=>{held=false;placeOverlay();broadcast();});screen.on('display-removed',()=>{held=false;placeOverlay();broadcast();});
 setInterval(()=>{
  if(!overlay||overlay.isDestroyed())return;
  const p=screen.getCursorScreenPoint();const displays=screen.getAllDisplays();const hit=hitZone(config,displays,p);const onWidget=overlay.isVisible()&&inside(p,overlay.getBounds());
  const target=!onWidget?(hit||(held?screen.getDisplayNearestPoint(p):null)):null;if(target&&target.id!==activeDisplayId){activeDisplayId=target.id;temporaryPosition=null;placeOverlay();broadcast();}
  if(expandedByButton===false&&!held)expandedByButton=null;
  if(dismissed&&!hit&&!held)dismissed=false;
  const triggered=!dismissed&&!selecting.length&&(!!hit||held||Date.now()<previewUntil);
  const over=overlay.isVisible()&&inside(p,overlay.getBounds());if(over!==hovered){hovered=over;broadcast();}
  if(triggered || over)lastActive=Date.now();
  const visible=!dismissed&&!selecting.length&&(triggered||Date.now()-lastActive<config.hideDelay);
  if(visible&&!overlay.isVisible()){placeOverlay();overlay.showInactive();broadcast();}
  else if(!visible&&overlay.isVisible()){overlay.hide();hovered=false;expandedByButton=null;temporaryPosition=null;broadcast();}
 },50);
}
function validSender(e){return [settings,overlay,...selecting].some(w=>w&&!w.isDestroyed()&&w.webContents===e.sender);}
ipcMain.handle('get',e=>validSender(e)?snapshot():null);
ipcMain.handle('save',(e,c)=>{if(e.sender!==settings?.webContents)return;const oldAutoStart=config.autoStart;config=sanitizeConfig(c,config);held=false;pressed.clear();overlayHeight=expandedByButton===true?overlayHeight:widgetRect(forDisplay(config,display()),display()).height;persist();enableHook();if(config.autoStart!==oldAutoStart&&!smoke)app.setLoginItemSettings({openAtLogin:config.autoStart});placeOverlay();broadcast();return snapshot();});
ipcMain.on('command',(e,action,value)=>{if(validSender(e)&&['toggle','next','previous','seek','volume','shuffle','repeat','like','dislike','playlist','focus','queue'].includes(action)){if(['seek','volume'].includes(action)&&!Number.isFinite(value))return;if(action==='shuffle'&&typeof value!=='boolean')return;if(action==='repeat'&&!['off','one','all'].includes(value))return;const extensionOnly=['like','dislike','playlist','volume','focus','queue'].includes(action);const missing=extensionOnly&&track?.source!=='extension'||['shuffle','repeat'].includes(action)&&track?.capabilities?.[action]!==true&&track?.source!=='extension';if(missing){commandResult({action,ok:false,reason:'extension-required'});return;}(track?.source==='extension'?extensionBridge:bridge)?.command(action,value);}});
ipcMain.handle('action',async(e,a)=>{if(!validSender(e))return;if(a==='tutorial-indicator-on')showTutorialIndicator(true);if(a==='tutorial-indicator-off')showTutorialIndicator(false);if(a==='record-start'){recording=true;held=false;pressed.clear();settings.webContents.setIgnoreMenuShortcuts(true);broadcast();}if(a==='record-stop'){recording=false;settings.webContents.setIgnoreMenuShortcuts(false);}if(a==='pin'){savePinnedPosition();return snapshot();}if(a==='tutorial'){openSettings();settings.loaded.then(()=>settings.webContents.send('navigate','tutorial'));}if(a==='connection'){openSettings();settings.loaded.then(()=>settings.webContents.send('navigate','connection'));}if(a==='dismiss'){temporaryPosition=null;dismissed=true;previewUntil=0;lastActive=0;expandedByButton=null;hovered=false;overlay.hide();broadcast();}if(a==='expand'){expandedByButton=!(expandedByButton??(held&&hovered));broadcast();return snapshot();}if(a==='preview'){dismissed=false;previewUntil=Date.now()+7000;}if(a==='copy')clipboard.writeText(token);if(a==='copy-extension-path')clipboard.writeText(path.join(app.getPath('userData'),'Luma-Browser-Erweiterung'));if(a==='copy-chrome-address')clipboard.writeText('chrome://extensions');if(a==='music')await shell.openExternal('https://music.youtube.com');if(a==='extension'){const src=app.isPackaged?path.join(process.resourcesPath,'extension'):path.resolve(__dirname,'../extension');const dest=path.join(app.getPath('userData'),'Luma-Browser-Erweiterung');fs.cpSync(src,dest,{recursive:true});await shell.openPath(dest);return dest;}if(a==='accessibility'&&process.platform==='darwin')await shell.openExternal('x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility');if(a==='settings')openSettings();});
ipcMain.handle('select-zone',(e,displayId)=>{if(e.sender!==settings?.webContents)return;closeSelectors();temporaryPosition=null;expandedByButton=null;overlay.hide();settings.hide();for(const d of screen.getAllDisplays().filter(d=>!Number.isInteger(displayId)||d.id===displayId)){const w=windowFor({...d.bounds,frame:false,transparent:true,alwaysOnTop:true,skipTaskbar:true,resizable:false});w.displayId=d.id;selecting.push(w);w.setAlwaysOnTop(true,'screen-saver');w.loadFile(path.join(__dirname,'zone.html'),{query:config.zones.find(z=>z.displayId===d.id)?{rect:JSON.stringify((()=>{const z=config.zones.find(z=>z.displayId===d.id).zone;return{x:z.x*d.bounds.width,y:z.y*d.bounds.height,w:z.w*d.bounds.width,h:z.h*d.bounds.height};})())}:{}});} });
function closeSelectors(){for(const w of selecting)if(!w.isDestroyed())w.destroy();selecting=[];}
ipcMain.on('cancel-zone',e=>{if(validSender(e)){closeSelectors();openSettings();}});
ipcMain.on('zone',(e,r)=>{const w=selecting.find(w=>w.webContents===e.sender);if(!w)return;const clean=sanitizeConfig({zone:r},config).zone;config=saveZone(config,w.displayId,clean);activeDisplayId=w.displayId;overlayHeight=widgetRect(forDisplay(config,display()),display()).height;persist();closeSelectors();openSettings();placeOverlay();broadcast();});

ipcMain.on('height',(e,height)=>{if(e.sender!==overlay?.webContents||!Number.isFinite(height))return;const h=Math.round(Math.max(widgetRect(forDisplay(config,display()),display()).height,Math.min(1200,height)));if(h!==overlayHeight){overlayHeight=h;placeOverlay();}});

function commandResult(r){for(const w of [settings,overlay])if(w&&!w.isDestroyed())w.webContents.send('result',r);}
function refreshMedia(){const wasConnected=status.extensionConnected;track=chooseTrack(systemTrack,extensionTrack);status={...status,connected:!!(systemStatus.connected||extensionStatus.connected),extensionConnected:!!extensionStatus.connected,error:(track?.source==='extension'?null:systemStatus.error)||extensionStatus.error||null};broadcast();if(!wasConnected&&status.extensionConnected)for(const w of [settings,overlay])if(w&&!w.isDestroyed())w.webContents.send('connection-confirmed');}
