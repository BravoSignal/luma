const { app, BrowserWindow, ipcMain, screen, Tray, Menu, nativeImage, clipboard, shell, systemPreferences, dialog } = require('electron');
const fs = require('node:fs'); const path = require('node:path'); const crypto = require('node:crypto');
const { defaults, inside, zoneBounds, sanitizeConfig } = require('./core.cjs');
const {widgetRect,overlayRect,activationRect,viewportFor}=require('./geometry.cjs');
const {forDisplay,migrateZones,hitZone,saveZone}=require('./zones.cjs');
const {bindingHeld,labelBinding}=require('./binding.cjs');
const {createBridge}=require('./bridge.cjs');
const {MediaRouter,sourceId,mergeSources,supportsAutoPause}=require('./routing.cjs');
const {AutoPause}=require('./auto-pause.cjs');const {playbackSetup}=require('./playback-setup.cjs');
const {Diagnostics}=require('./diagnostics.cjs');
const {SongAnnouncement}=require('./song-announcement.cjs');const songAnnouncement=new SongAnnouncement();let songNoticeUntil=0,sliderActive=false;
const mediaRouter=new MediaRouter(),autoPauseEngine=new AutoPause();
let diagnostics,systemSources=[],extensionSources=[],videoActivity=[],mediaSources=[],lastSourcesSignature='',lastAutoSignature='',lastMiniSignature='',artworkSource=null;
const requestSources=new Map();
process.on('uncaughtExceptionMonitor',()=>diagnostics?.record('error',{code:1}));
const { createMedia } = require('./media.cjs');
const {createWindowsMini}=require('./windows-mini.cjs');
const {createDesktop}=require('./desktop.cjs');
const {PROFILE_KEYS,matchingProfile,effectiveConfig,removeDisplayZone,exportedPreferences,importedPreferences,DismissalGate,ZoneEntryGate}=require('./features.cjs');
const {createUpdater}=require('./updater.cjs');
let updater,previewScope='editor';
const dismissalGate=new DismissalGate(),zoneEntryGate=new ZoneEntryGate();
let windowsMini=null,hookHandlers=null,shortcutMatchAt=0,hookRetryAt=0,nativeShortcutGeneration=0,nativeShortcutSignature='',nativeShortcutReady=false;
let baseConfig,editingProfileId=null,frontApp=null,availableApps=[],desktopBridge=null,activeProfileId=null,lastAccent='#c9f3a7',undoZone=null,testIndicator=null,wasPreview=false;
const {text:localize}=require('./i18n.js');
const tr=value=>localize(value,config?.language||'en');
if(process.platform==='win32')app.setAppUserModelId('local.luma.music');
const capture = process.argv.includes('--capture');
const smoke=process.argv.includes('--smoke');
if(capture||smoke)app.setPath('userData',path.resolve(__dirname,'../../../work/qa-profile'));
let tutorialIndicator=null,widgetDrag=null;
let activeDisplayId=null,temporaryPosition=null,expectedBounds=null,extensionBridge, systemTrack=null, extensionTrack=null, systemStatus={}, extensionStatus={}, settings, overlay, tray, bridge, hook, config, token, track=null, overlayHeight=150, status={connected:false,error:null}, recording=false, dismissed=false,expandedByButton=null,held=false, hovered=false, pressed=new Set(), lastActive=0, previewUntil=0, selecting=[], quitting=false;
if (!app.requestSingleInstanceLock()) app.quit();
else {
 app.on('second-instance',()=>openSettings());
 app.whenReady().then(start);
 app.on('window-all-closed',()=>{});
 app.on('before-quit',()=>{quitting=true;updater?.close();bridge?.close();extensionBridge?.close();desktopBridge?.close();windowsMini?.close();testIndicator?.destroy();stopHook();});
 // Overlay clicks can activate the app on macOS. Settings open only through explicit actions.
}
function editingConfig(){return effectiveConfig(baseConfig||config,editingProfileId);}
function displayRows(c){return screen.getAllDisplays().map(d=>({id:d.id,label:d.label||`${d.size.width} × ${d.size.height}`,width:d.size.width,height:d.size.height,zone:c.zones.find(z=>z.displayId===d.id)||null,orientation:forDisplay(c,d).orientation}));}
function snapshot(){const d=display(),c=forDisplay(config,d),edit=editingConfig(),editD=forDisplay(edit,d);return{playbackSetup:playbackSetup({config:baseConfig,track,status,automation:autoPauseEngine.state}),mediaSources,sourcePin:mediaRouter.pinnedId,selectedSourceId:track?.sourceId||null,autoPause:autoPauseEngine.state,diagnostics:{recording:!!diagnostics?.recording},update:updater?.state,atTopEdge:!!c.edgeTop&&widgetRect(c,d).y===d.bounds.y,expandedByButton,sliderActive,held,hovered,editingProfileId,activeProfileId,frontApp,availableApps,profiles:baseConfig.profiles,editingConfig:edit,viewport:viewportFor(c,d),editingViewport:viewportFor(editD,d),editingGeometry:widgetRect(editD,d),widgetOrientation:c.orientation,editingWidgetOrientation:editD.orientation,editingDisplays:displayRows(edit),profileError:status.desktopError||null,extensionPath:path.join(app.getPath('userData'),'Luma-Browser-Erweiterung'),activationGeometry:activationRect(c,d),visible:!!overlay&&!overlay.isDestroyed()&&overlay.isVisible(),geometry:widgetRect(c,d),pinned:!!config.pinnedPositions?.[d.id]&&!temporaryPosition,bindingLabel:labelBinding(edit.binding,edit.language),runtimeBindingLabel:labelBinding(config.binding,config.language),config,token,track,status:{...status,error:tr(status.error),hookError:tr(status.hookError)},platform:process.platform,holdReady:hook?.native?nativeShortcutReady:!!hook,shortcut:{inputMonitoring:status.keyboardInputMonitoring,matched:Date.now()-shortcutMatchAt<2000},automation:{musicSupported:supportsAutoPause(track),videoSignals:videoActivity.length,activeVideos:videoActivity.filter(v=>v.kind==='video'&&(!baseConfig.ignoreMutedVideos||v.audible)&&(!baseConfig.videoForegroundOnly||v.visible)).length},displays:displayRows(config)};}
function refreshConfig(reset=true){
 if(!baseConfig.songAnnouncement)songNoticeUntil=0;
 const p=matchingProfile(baseConfig,frontApp?.id);activeProfileId=p?.id||null;
 config=effectiveConfig(baseConfig,Date.now()<previewUntil&&previewScope!=='runtime'?editingProfileId:activeProfileId);
 if(reset&&!sliderActive){zoneEntryGate.reset();lastActive=0;held=false;pressed.clear();temporaryPosition=null;expandedByButton=null;dismissalGate.reset();dismissed=false;overlayHeight=widgetRect(forDisplay(config,display()),display()).height;}
 if(overlay){placeOverlay();if(!smoke)enableHook();broadcast();}updateMini();
}
function cancelAutomaticFade(){const p=autoPauseEngine.pending;if(p?.value?.fadeMs)extensionBridge?.command('cancel-fade',undefined,p.sourceId);}
function commitSettings(change,scope=editingProfileId){
 if(change.autoPause===false||change.preferredSource&&change.preferredSource!==baseConfig.preferredSource)cancelAutomaticFade();
 if(change.preferredSource&&change.preferredSource!==baseConfig.preferredSource)autoPauseEngine.manual(null,'source');
 const global=Object.fromEntries(Object.entries(change).filter(([k])=>!scope||!PROFILE_KEYS.includes(k)));
 baseConfig=sanitizeConfig(global,baseConfig);
 if(scope){const patch=Object.fromEntries(Object.entries(change).filter(([k])=>PROFILE_KEYS.includes(k)));baseConfig=sanitizeConfig({profiles:baseConfig.profiles.map(p=>p.id===scope?{...p,settings:{...p.settings,...patch}}:p)},baseConfig);}
 const wasExpanded=expandedByButton===true,oldHeight=overlayHeight;refreshConfig(true);if(wasExpanded){expandedByButton=true;overlayHeight=oldHeight;placeOverlay();broadcast();}persist();configureMenus();updater?.setEnabled(baseConfig.autoUpdate);refreshMedia();
}
function desktopEvent(m){if(quitting)return;if(m.type==='apps'){availableApps=(Array.isArray(m.apps)?m.apps:[]).filter(a=>a&&typeof a.id==='string'&&typeof a.name==='string'&&a.name!=='Luma').slice(0,128).filter((a,i,all)=>all.findIndex(x=>x.id===a.id)===i).map(a=>({id:a.id.slice(0,500),name:a.name.slice(0,120)})).sort((a,b)=>a.name.localeCompare(b.name));broadcast();}
 if(m.type==='front-app'){const a=m.app;if(!a||typeof a.id!=='string'||typeof a.name!=='string'||a.id==='local.luma.music'||/^(Luma|Electron|Luma.Desktop)$/i.test(a.name)||a.id.toLowerCase()===process.execPath.toLowerCase())return;const changed=frontApp?.id!==a.id;frontApp={id:a.id.slice(0,500),name:a.name.slice(0,120)};if(changed){diagnostics?.record('front-app',{sourceId:frontApp.id});evaluateAutoPause();const next=matchingProfile(baseConfig,frontApp.id)?.id||null;if(next!==activeProfileId)refreshConfig(true);else broadcast();}}}
function updateMini(){if(!config)return;const color=({mint:'#c9f3a7',lilac:'#cbb5f8',peach:'#f7bea0',custom:config.customColor,auto:lastAccent})[config.accent]||'#c9f3a7';const mini={enabled:baseConfig.miniPlayer,playing:!!track?.playing,hasTrack:!!track,accent:'#ffffff',volume:track?.source==='extension'?track.muted?0:track.volume:1,motion:baseConfig.motion,language:baseConfig.language};desktopBridge?.send({type:'mini',...mini});windowsMini?.update(mini);const signature=JSON.stringify([mini.enabled,windowsMini?.diagnostics?.().icons]);if(signature!==lastMiniSignature){lastMiniSignature=signature;diagnostics?.record('mini',{enabled:mini.enabled,icons:windowsMini?.diagnostics?.().icons||0});}}
function runCommand(action,value,targetId=track?.sourceId,automatic=false,requestId){
 if(!['toggle','play','pause','next','previous','seek','volume','shuffle','repeat','like','dislike','playlist','focus'].includes(action))return false;
 if(['seek','volume'].includes(action)&&!Number.isFinite(value)||action==='shuffle'&&typeof value!=='boolean'||action==='repeat'&&!['off','one','all'].includes(value))return false;
 if(!automatic)autoPauseEngine.manual(targetId,action);
 const target=mediaSources.find(t=>t.sourceId===targetId);if(!target){if(requestId)commandResult({action,ok:false,requestId});else commandResult({action,ok:false,reason:'source-unavailable'});return false;}
 const missing=['like','dislike','playlist','volume','focus'].includes(action)&&target.source!=='extension'||['shuffle','repeat'].includes(action)&&target.capabilities?.[action]!==true&&target.source!=='extension';
 if(missing){commandResult({action,ok:false,reason:'extension-required',requestId});return false;}
 const id=requestId||crypto.randomUUID();requestSources.set(id,targetId);if(requestSources.size>200)requestSources.delete(requestSources.keys().next().value);diagnostics?.record('command',{action,sourceId:targetId});
 const sent=(target.source==='extension'?extensionBridge:bridge)?.command(action,value,targetId,id);if(sent!==false&&['playlist','focus'].includes(action)){songNoticeUntil=0;previewUntil=0;lastActive=0;expandedByButton=null;hovered=false;dismissalGate.dismiss();dismissed=true;overlay?.hide();broadcast();}if(sent===false)commandResult({action,ok:false,requestId:id});return sent!==false;
}
function evaluateAutoPause(){
 if(!config||quitting)return;
 const reasons=[];if(baseConfig.pauseApps.some(a=>a.id===frontApp?.id))reasons.push('app');
 const activity=videoActivity.filter(v=>(!baseConfig.ignoreMutedVideos||v.audible)&&(!baseConfig.videoForegroundOnly||v.visible));
 if(process.platform==='win32'&&baseConfig.pauseForSystemVideo&&mediaSources.some(t=>t.mediaType==='video'&&t.playing&&t.sourceId!==track?.sourceId))reasons.push('video');
 if(baseConfig.pauseForVideos&&activity.some(v=>v.kind==='video'))reasons.push('video');if(baseConfig.pauseForAudio&&activity.some(v=>v.kind==='audio'))reasons.push('audio');
 const command=autoPauseEngine.step({enabled:baseConfig.autoPause,reasons,sources:mediaSources,selectedId:track?.sourceId,resume:baseConfig.autoResume,delay:baseConfig.resumeDelay,fadeMs:baseConfig.fadePauseMs});
 const signature=JSON.stringify(autoPauseEngine.state);if(signature!==lastAutoSignature){lastAutoSignature=signature;diagnostics?.record('auto-pause',{phase:autoPauseEngine.phase});broadcast();}
 if(command)runCommand(command.action,command.value,command.sourceId,true,command.id);
}
function broadcast(){if(quitting)return;for(const w of [settings,overlay])if(w&&!w.isDestroyed())w.webContents.send('state',snapshot());}
function persist(){fs.writeFileSync(path.join(app.getPath('userData'),'config.json'),JSON.stringify({config:baseConfig||config,token},null,2),{mode:0o600});}
function windowFor(opts){const w=new BrowserWindow({...(process.platform==='win32'?{icon:path.join(__dirname,'icon.png')}:{}),...opts,webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true}});w.webContents.setWindowOpenHandler(()=>({action:'deny'}));w.webContents.on('will-navigate',e=>e.preventDefault());return w;}
function showWidget(){previewScope='runtime';activeDisplayId=screen.getDisplayNearestPoint(screen.getCursorScreenPoint()).id;previewUntil=Date.now()+7000;dismissalGate.reset();dismissed=false;refreshConfig(true);}
function configureMenus(){
 if(quitting)return;
 if(tray){tray.setToolTip(tr('Luma · Musik in Reichweite'));tray.setContextMenu(Menu.buildFromTemplate([{label:tr('Luma öffnen'),click:openSettings},{label:tr('Widget einblenden'),click:showWidget},{type:'separator'},{label:tr('Kurzanleitung'),click:()=>{openSettings();settings.loaded.then(()=>settings.webContents.send('navigate','tutorial'));}},{label:tr(updater?.state.phase==='ready'?'Update ready · Open Updates':'Check for updates…'),click:()=>{openSettings();settings.loaded.then(()=>settings.webContents.send('navigate','updates'));if(updater?.state.phase!=='ready')void updater?.check();}},{type:'separator'},{label:tr('Beenden'),click:()=>app.quit()}]));}
 const menu=[...(process.platform==='darwin'?[{label:'Luma',submenu:[{role:'about',label:tr('Über Luma')},{type:'separator'},{role:'hide',label:tr('Luma ausblenden')},{role:'hideOthers',label:tr('Andere ausblenden')},{role:'unhide',label:tr('Alle einblenden')},{type:'separator'},{role:'quit',label:tr('Beenden')}]}]:[]),{label:tr('Bearbeiten'),submenu:[{role:'undo',label:tr('Rückgängig')},{role:'redo',label:tr('Wiederholen ↶')},{type:'separator'},{role:'cut',label:tr('Ausschneiden')},{role:'copy',label:tr('Kopieren')},{role:'paste',label:tr('Einfügen')},{role:'selectAll',label:tr('Alles auswählen')}]},{label:tr('Fenster'),submenu:[{role:'minimize',label:tr('Minimieren')},{role:'close',label:tr('Schließen')}]}];Menu.setApplicationMenu(Menu.buildFromTemplate(menu));
 settings?.setTitle(tr('Luma · Deine Musik'));
}
function openSettings(){if(!config)return;if(settings&&!settings.isDestroyed()){settings.show();settings.focus();return;}settings=windowFor({width:1180,height:820,minWidth:940,minHeight:720,backgroundColor:'#111414',title:tr('Luma · Deine Musik'),autoHideMenuBar:true,titleBarStyle:process.platform==='darwin'?'hiddenInset':'default'});settings.on('hide',()=>showTutorialIndicator(false));settings.loaded=settings.loadFile(path.join(__dirname,'index.html'));settings.on('close',e=>{if(!quitting&&!capture&&!smoke){e.preventDefault();settings.hide();}});}
function showTutorialIndicator(show){
 tutorialIndicator?.destroy();tutorialIndicator=null;
 if(!show||!tray||process.platform!=='darwin')return;
 const b=tray.getBounds();if(!b.width)return;
 const d=screen.getDisplayMatching(b),width=240,x=Math.max(d.bounds.x,Math.min(d.bounds.x+d.bounds.width-width,b.x+b.width/2-width/2));
 tutorialIndicator=windowFor({x:Math.round(x),y:b.y+b.height,width,height:180,show:false,frame:false,transparent:true,focusable:false,skipTaskbar:true,hasShadow:false,resizable:false});
 tutorialIndicator.setIgnoreMouseEvents(true);tutorialIndicator.setAlwaysOnTop(true,'screen-saver');tutorialIndicator.setVisibleOnAllWorkspaces(true);
 tutorialIndicator.loadFile(path.join(__dirname,'tutorial-arrow.html'),{query:{tip:String(b.x+b.width/2-x),language:config.language}}).then(()=>tutorialIndicator?.showInactive());
}
function display(){return screen.getAllDisplays().find(d=>d.id===(activeDisplayId??config.displayId))||screen.getPrimaryDisplay();}
function placeOverlay(){overlay.setAlwaysOnTop(true,forDisplay(config,display()).edgeTop?'pop-up-menu':'floating');let b=overlayRect(forDisplay(config,display()),display(),overlayHeight);if(temporaryPosition){const area=viewportFor(forDisplay(config,display()),display());b={...b,x:Math.round(Math.max(area.x,Math.min(area.x+area.width-b.width,temporaryPosition.x))),y:Math.round(Math.max(area.y,Math.min(area.y+area.height-b.height,temporaryPosition.y)))};}expectedBounds=b;overlay.setBounds(b);}
function savePinnedPosition(){const id=display().id,positions={...config.pinnedPositions};if(positions[id]&&!temporaryPosition)delete positions[id];else{const b=overlay.getBounds(),area=viewportFor(forDisplay(config,display()),display());positions[id]={x:Math.max(0,Math.min(1,(b.x-area.x)/Math.max(1,area.width))),y:Math.max(0,Math.min(1,(b.y-area.y)/Math.max(1,area.height)))};}const scope=Date.now()<previewUntil&&previewScope!=='runtime'?editingProfileId:activeProfileId;commitSettings({pinnedPositions:positions},scope);}
function stopHook(){if(hook?.native){desktopBridge?.send({type:'shortcut-config',enabled:false,generation:++nativeShortcutGeneration});nativeShortcutSignature='';nativeShortcutReady=false;}else if(hook){if(hookHandlers){hook.removeListener('keydown',hookHandlers.down);hook.removeListener('keyup',hookHandlers.up);}try{hook.stop();}catch{}}hook=null;hookHandlers=null;pressed.clear();held=false;}
function enableHook(force=false){
 if(force){stopHook();hookRetryAt=0;}
 if(!config.holdEnabled){stopHook();delete status.hookError;return;}
 if(process.platform==='darwin'){
  if(!desktopBridge){status.hookError='Native keyboard support is not available. Restart Luma.';return;}
  const groups=require('./mac-binding.cjs').macBindingGroups(config.binding);if(!groups){status.hookError='This key is not supported on Mac. Choose another shortcut.';return;}
  const signature=JSON.stringify(groups);if(!hook?.native||nativeShortcutSignature!==signature){nativeShortcutSignature=signature;nativeShortcutReady=false;hook={native:true};desktopBridge.send({type:'shortcut-config',enabled:true,groups,generation:++nativeShortcutGeneration});}delete status.hookError;return;
 }
 if(hook||Date.now()<hookRetryAt)return;hookRetryAt=Date.now()+10000;
 try{const {uIOhook}=require('uiohook-napi');const updateHeld=e=>{const next=!recording&&config.holdEnabled&&bindingHeld(config.binding,pressed,e);if(next)shortcutMatchAt=Date.now();if(next!==held){held=next;broadcast();}};hookHandlers={down:e=>{pressed.add(e.keycode);updateHeld(e);},up:e=>{pressed.delete(e.keycode);updateHeld(e);}};uIOhook.on('keydown',hookHandlers.down);uIOhook.on('keyup',hookHandlers.up);try{uIOhook.start();hook=uIOhook;}catch(e){uIOhook.removeListener('keydown',hookHandlers.down);uIOhook.removeListener('keyup',hookHandlers.up);hookHandlers=null;throw e;}delete status.hookError;}
 catch(e){hook=null;status.hookError='Die Halte-Taste ist nicht verfügbar: '+e.message;}
}
async function start(){
 let saved={};try{saved=JSON.parse(fs.readFileSync(path.join(app.getPath('userData'),'config.json'),'utf8'));}catch{}
 diagnostics=new Diagnostics(path.join(app.getPath('userData'),'diagnostics'));
 baseConfig=migrateZones(sanitizeConfig(saved.config||{},defaults),screen.getPrimaryDisplay().id);config=baseConfig;mediaRouter.pin(baseConfig.lockedSourceId);activeDisplayId=config.displayId??screen.getPrimaryDisplay().id;overlayHeight=widgetRect(forDisplay(config,display()),display()).height;token=typeof saved.token==='string'&&/^[a-f0-9]{48}$/.test(saved.token)?saved.token:crypto.randomBytes(24).toString('hex');persist();
 openSettings();
 updater=createUpdater({version:app.getVersion(),cache:path.join(app.getPath('userData'),'updates'),enabled:baseConfig.autoUpdate,packaged:app.isPackaged&&!smoke&&!capture,onState:()=>{broadcast();configureMenus();},quit:()=>app.quit()});updater.start();
 overlay=windowFor({width:420,height:150,show:false,frame:false,transparent:true,alwaysOnTop:true,skipTaskbar:true,resizable:false,hasShadow:false,focusable:false,acceptFirstMouse:true,...(process.platform==='darwin'?{type:'panel'}:{})});
 overlay.on('move',()=>{const b=overlay.getBounds();if(expectedBounds&&b.x===expectedBounds.x&&b.y===expectedBounds.y)return;temporaryPosition={x:b.x,y:b.y};activeDisplayId=screen.getDisplayMatching(b).id;broadcast();});
 overlay.setVisibleOnAllWorkspaces(true,{visibleOnFullScreen:true});overlay.setAlwaysOnTop(true,'floating');overlay.loadFile(path.join(__dirname,'index.html'),{query:{view:'overlay'}});placeOverlay();
 if(capture){await settings.loaded;await settings.webContents.executeJavaScript('document.fonts.ready');await new Promise(r=>setTimeout(r,800));const img=await settings.webContents.capturePage();fs.writeFileSync(path.resolve('..','Luma-Vorschau.png'),img.toPNG());app.quit();return;}
 const icon=nativeImage.createFromPath(path.join(__dirname,process.platform==='darwin'?'tray.png':'icon.png')).resize({width:22,height:22});if(process.platform==='darwin')icon.setTemplateImage(true);
 tray=new Tray(icon);if(process.platform==='darwin')tray.setTitle('');configureMenus();if(process.platform!=='darwin')tray.on('click',()=>{if(!overlay?.isVisible()||!inside(screen.getCursorScreenPoint(),overlay.getBounds()))openSettings();});if(process.platform==='darwin')app.dock.hide();
 bridge=createMedia({root:app.isPackaged?path.join(process.resourcesPath,'native'):path.resolve(__dirname,'../native'),onTrack:t=>{systemTrack=t;},onSources:rows=>{systemSources=rows;},onStatus:s=>{systemStatus={...systemStatus,...s};refreshMedia();},onResult:commandResult,onDesktop:desktopEvent});
 desktopBridge=createDesktop({root:app.isPackaged?path.join(process.resourcesPath,'native'):path.resolve(__dirname,'../native'),onShortcut:m=>{if(!hook?.native||m.generation!==nativeShortcutGeneration)return;const wasReady=nativeShortcutReady;nativeShortcutReady=true;status.keyboardInputMonitoring=m.inputMonitoring;const next=!recording&&config.holdEnabled&&m.held===true;if(next)shortcutMatchAt=Date.now();if(next!==held||!wasReady){held=next;broadcast();}},onFrontApp:a=>desktopEvent({type:'front-app',app:a}),onApps:apps=>desktopEvent({type:'apps',apps}),onCommand:action=>action==='show-widget'?showWidget():runCommand(action),onMini:visible=>{if(status.miniPlayerVisible!==visible){status.miniPlayerVisible=visible;broadcast();}},onError:error=>{status.desktopError=error;broadcast();}});desktopBridge?.send({type:'list-apps'});if(process.platform==='win32')bridge?.desktop?.('list-apps');updateMini();
 extensionBridge=createBridge({token,port:smoke?17385:17384,onTrack:t=>{extensionTrack=t;},onSources:rows=>{extensionSources=rows;},onActivity:rows=>{videoActivity=rows;},onIntent:id=>{autoPauseEngine.manual(id,'toggle');evaluateAutoPause();},onStatus:s=>{if(extensionStatus.connected&&!s.connected&&autoPauseEngine.reasons.some(r=>r==='video'||r==='audio'))autoPauseEngine.cancel(true);extensionStatus=s;refreshMedia();},onResult:commandResult});
 if(process.platform==='win32'){windowsMini=createWindowsMini({Tray,nativeImage,Menu,onCommand:runCommand,onOpen:openSettings,onWidget:showWidget,onDisable:()=>commitSettings({miniPlayer:false},null),onError:error=>{status.miniPlayerError=error;broadcast();}});updateMini();}
 if(!smoke)enableHook();
 setInterval(evaluateAutoPause,250);setInterval(()=>{if(!smoke&&config)enableHook();},1000);
 if(smoke)require('./smoke.cjs')({settings,overlay,token,snapshot,app,showWidget});
 screen.on('display-metrics-changed',()=>{held=false;placeOverlay();broadcast();});screen.on('display-removed',()=>{held=false;placeOverlay();broadcast();});
 setInterval(()=>{
  if(!overlay||overlay.isDestroyed())return;
  const preview=Date.now()<previewUntil;if(preview!==wasPreview){wasPreview=preview;refreshConfig(true);}
  const p=screen.getCursorScreenPoint();const displays=screen.getAllDisplays();const hit=hitZone(config,displays,p);const onWidget=overlay.isVisible()&&inside(p,overlay.getBounds());
  const target=!onWidget&&!widgetDrag&&!sliderActive?(hit||(held?screen.getDisplayNearestPoint(p):null)):null;if(target&&target.id!==activeDisplayId){activeDisplayId=target.id;temporaryPosition=null;placeOverlay();broadcast();}
  if(expandedByButton===false&&!held)expandedByButton=null;
  dismissed=dismissalGate.update(!!hit,held,Date.now(),config.rearmDelay);
  const allowed=config.zoneEnabled||config.holdEnabled||Date.now()<previewUntil||Date.now()<songNoticeUntil||sliderActive;
  const zoneReady=zoneEntryGate.update(selecting.length?null:hit?.id,Date.now(),config.activationDelay);
  const triggered=!dismissed&&!selecting.length&&(sliderActive||!!widgetDrag||zoneReady||held||Date.now()<previewUntil);
  const over=overlay.isVisible()&&inside(p,overlay.getBounds());if(over!==hovered){hovered=over;broadcast();}
  if(triggered || over)lastActive=Date.now();
  const visible=allowed&&!dismissed&&!selecting.length&&(triggered||Date.now()<songNoticeUntil||Date.now()-lastActive<config.hideDelay);
  if(visible&&!overlay.isVisible()){placeOverlay();overlay.showInactive();broadcast();}
  else if(!visible&&overlay.isVisible()){overlay.hide();hovered=false;expandedByButton=null;temporaryPosition=null;broadcast();}
 },50);
}
ipcMain.on('widget-interaction',(e,active)=>{if(e.sender!==overlay?.webContents||typeof active!=='boolean')return;sliderActive=active;if(!active)lastActive=Date.now();broadcast();});
ipcMain.on('widget-drag',(e,g)=>{
 if(e.sender!==overlay?.webContents||!overlay.isVisible()||!g)return;
 if(g.phase==='start'){widgetDrag={bounds:overlay.getBounds(),moved:false};return;}
 if(g.phase==='end'||g.phase==='cancel'){widgetDrag=null;lastActive=Date.now();broadcast();return;}
 if(g.phase!=='move'||!widgetDrag||!Number.isFinite(g.dx)||!Number.isFinite(g.dy)||Math.abs(g.dx)>50000||Math.abs(g.dy)>50000)return;
 if(!widgetDrag.moved&&Math.hypot(g.dx,g.dy)<5)return;
 widgetDrag.moved=true;
 const b={...widgetDrag.bounds,x:Math.round(widgetDrag.bounds.x+g.dx),y:Math.round(widgetDrag.bounds.y+g.dy)};
 activeDisplayId=screen.getDisplayMatching(b).id;temporaryPosition={x:b.x,y:b.y};placeOverlay();lastActive=Date.now();broadcast();
});
function validSender(e){return [settings,overlay,...selecting].some(w=>w&&!w.isDestroyed()&&w.webContents===e.sender);}
ipcMain.handle('get',e=>validSender(e)?snapshot():null);
ipcMain.handle('update',async(e,action)=>{if(e.sender!==settings?.webContents)return;if(action==='check')await updater?.check();if(action==='download')await updater?.download();if(action==='install')await updater?.install();if(quitting)return;if(action==='releases')await shell.openExternal('https://github.com/BravoSignal/luma/releases');return snapshot();});
ipcMain.handle('save',(e,c)=>{if(e.sender!==settings?.webContents)return;const old=baseConfig.autoStart;commitSettings(c);if(baseConfig.autoStart!==old&&!smoke)app.setLoginItemSettings({openAtLogin:baseConfig.autoStart});return snapshot();});
ipcMain.on('command',(e,action,value)=>{if(validSender(e))runCommand(action,value);});
ipcMain.on('accent',(e,color)=>{if(!validSender(e)||typeof color!=='string'||!/^#[0-9a-f]{6}$/i.test(color)||lastAccent===color)return;lastAccent=color;updateMini();});
ipcMain.handle('manage',async(e,op,data)=>{
 if(e.sender!==settings?.webContents)return null;
 if(op==='profile-select'){editingProfileId=baseConfig.profiles.some(p=>p.id===data)?data:null;undoZone=null;}
 if(op==='media-source'){if(data===''||mediaSources.some(t=>t.sourceId===data)){cancelAutomaticFade();autoPauseEngine.manual(null,'source');mediaRouter.pin(data);commitSettings({lockedSourceId:data&&!data.endsWith(':legacy')?data:null},null);}}
 if(op==='pause-app-add'){const a=availableApps.find(a=>a.id===data);if(a&&!baseConfig.pauseApps.some(p=>p.id===a.id))commitSettings({pauseApps:[...baseConfig.pauseApps,a]},null);}
 if(op==='pause-app-remove'){commitSettings({pauseApps:baseConfig.pauseApps.filter(a=>a.id!==data)},null);}
 if(op==='diagnostics-start')diagnostics.start();
 if(op==='diagnostics-stop')diagnostics.stop();
 if(op==='diagnostics-export'){const report=diagnostics.report({version:app.getVersion(),platform:process.platform,arch:process.arch,config:baseConfig,status,sources:mediaSources,selectedId:track?.sourceId,autoPause:autoPauseEngine.state,displays:screen.getAllDisplays(),mini:windowsMini?.diagnostics?.()||{enabled:baseConfig.miniPlayer,visible:!!status.miniPlayerVisible},nativeHelperPresent:fs.existsSync(app.isPackaged?path.join(process.resourcesPath,'native',process.platform==='win32'?'windows/bin/Luma.Media.exe':'mac/Luma.Desktop'):path.resolve(__dirname,'../native',process.platform==='win32'?'windows/bin/Luma.Media.exe':'mac/Luma.Desktop'))});const r=await dialog.showSaveDialog(settings,{title:tr('Export diagnostic report'),defaultPath:'Luma-diagnostics.json',filters:[{name:'JSON',extensions:['json']}]});if(!r.canceled&&r.filePath)fs.writeFileSync(r.filePath,JSON.stringify(report,null,2),{mode:0o600});}
 if(op==='apps'){if(process.platform==='darwin')desktopBridge?.send({type:'list-apps'});else bridge?.desktop?.('list-apps');}
 if(op==='profile-add'){const a=availableApps.find(a=>a.id===data)|| (frontApp?.id===data?frontApp:null);if(a&&!baseConfig.profiles.some(p=>p.appId===a.id)){const id=crypto.randomUUID(),settings=Object.fromEntries(PROFILE_KEYS.map(k=>[k,structuredClone(baseConfig[k])]));baseConfig=sanitizeConfig({profiles:[...baseConfig.profiles,{id,appId:a.id,name:a.name,enabled:true,settings}]},baseConfig);editingProfileId=id;persist();refreshConfig();}}
 if(op==='profile-reassign'&&editingProfileId){const a=availableApps.find(a=>a.id===data)|| (frontApp?.id===data?frontApp:null);if(a){if(baseConfig.profiles.some(p=>p.id!==editingProfileId&&p.appId===a.id))return{error:'This app already has a profile.'};baseConfig={...baseConfig,profiles:baseConfig.profiles.map(p=>p.id===editingProfileId?{...p,appId:a.id,name:a.name}:p)};persist();refreshConfig();}}
 if(op==='profile-delete'&&editingProfileId){baseConfig={...baseConfig,profiles:baseConfig.profiles.filter(p=>p.id!==editingProfileId)};editingProfileId=null;persist();refreshConfig();}
 if(op==='zone-delete'&&Number.isInteger(data)){const c=editingConfig();undoZone={scope:editingProfileId,displayId:data,zone:structuredClone(c.zones.find(z=>z.displayId===data)),pin:structuredClone(c.pinnedPositions[data])};const next=removeDisplayZone(c,data);commitSettings({zones:next.zones});}
 if(op==='zone-undo'&&undoZone){const u=undoZone;undoZone=null;const c=effectiveConfig(baseConfig,u.scope);if(u.zone)commitSettings({zones:[...c.zones.filter(z=>z.displayId!==u.displayId),u.zone]},u.scope);}
 if(op==='zone-test'&&Number.isInteger(data)){const d=screen.getAllDisplays().find(d=>d.id===data);if(d&&editingConfig().zones.some(z=>z.displayId===data)){activeDisplayId=data;previewUntil=Date.now()+5000;dismissalGate.reset();refreshConfig();testIndicator?.destroy();const r=activationRect(forDisplay(editingConfig(),d),d);testIndicator=windowFor({...r,show:false,frame:false,transparent:true,skipTaskbar:true,focusable:false,resizable:false,hasShadow:false});testIndicator.setIgnoreMouseEvents(true);testIndicator.setAlwaysOnTop(true,'screen-saver');testIndicator.loadFile(path.join(__dirname,'zone-preview.html')).then(()=>testIndicator?.showInactive());setTimeout(()=>{testIndicator?.destroy();testIndicator=null;},4500);}}
 if(op==='export'){const r=await dialog.showSaveDialog(settings,{title:tr('Export Luma preferences'),defaultPath:'Luma-preferences.json',filters:[{name:'JSON',extensions:['json']}]});if(r.filePath&&!r.canceled)fs.writeFileSync(r.filePath,JSON.stringify(exportedPreferences(baseConfig,screen.getAllDisplays()),null,2),{mode:0o600});}
 if(op==='import'){const r=await dialog.showOpenDialog(settings,{title:tr('Import Luma preferences'),properties:['openFile'],filters:[{name:'JSON',extensions:['json']}]});if(!r.canceled&&r.filePaths[0]){try{const file=r.filePaths[0];if(fs.statSync(file).size>1024*1024)throw Error('Preferences file is too large.');const oldAuto=baseConfig.autoStart;autoPauseEngine.cancel(true);baseConfig=importedPreferences(JSON.parse(fs.readFileSync(file,'utf8')),sanitizeConfig,defaults,screen.getAllDisplays());if(baseConfig.autoStart!==oldAuto&&!smoke)app.setLoginItemSettings({openAtLogin:baseConfig.autoStart});editingProfileId=null;undoZone=null;mediaRouter.pin(baseConfig.lockedSourceId);persist();refreshConfig();configureMenus();updater?.setEnabled(baseConfig.autoUpdate);}catch(error){return{error:error.message};}}}
 broadcast();return snapshot();
});
ipcMain.handle('action',async(e,a)=>{if(!validSender(e))return;if(a==='shortcut-retry'&&e.sender===settings?.webContents){enableHook(true);broadcast();return snapshot();}if(a==='tutorial-indicator-on')showTutorialIndicator(true);if(a==='tutorial-indicator-off')showTutorialIndicator(false);if(a==='record-start'){recording=true;held=false;pressed.clear();settings.webContents.setIgnoreMenuShortcuts(true);broadcast();}if(a==='record-stop'){recording=false;settings.webContents.setIgnoreMenuShortcuts(false);}if(a==='pin'){savePinnedPosition();return snapshot();}if(a==='tutorial'){openSettings();settings.loaded.then(()=>settings.webContents.send('navigate','tutorial'));}if(a==='connection'){openSettings();settings.loaded.then(()=>settings.webContents.send('navigate','connection'));}if(a==='dismiss'){sliderActive=false;songNoticeUntil=0;widgetDrag=null;temporaryPosition=null;dismissalGate.dismiss();dismissed=true;previewUntil=0;lastActive=0;expandedByButton=null;hovered=false;overlay.hide();broadcast();}if(a==='expand'){expandedByButton=!(expandedByButton??(held&&hovered));broadcast();return snapshot();}if(a==='preview'){previewScope='editor';dismissalGate.reset();dismissed=false;previewUntil=Date.now()+7000;refreshConfig();}if(a==='copy')clipboard.writeText(token);if(a==='copy-extension-path')clipboard.writeText(path.join(app.getPath('userData'),'Luma-Browser-Erweiterung'));if(a==='copy-chrome-address')clipboard.writeText('chrome://extensions');if(a==='store')await shell.openExternal('https://chromewebstore.google.com/detail/ahjjpjjmiaokgbmoojngfnbpmicidlcc');if(a==='music')await shell.openExternal('https://music.youtube.com');if(a==='extension'){const src=app.isPackaged?path.join(process.resourcesPath,'extension'):path.resolve(__dirname,'../extension');const dest=path.join(app.getPath('userData'),'Luma-Browser-Erweiterung');fs.cpSync(src,dest,{recursive:true});await shell.openPath(dest);return dest;}if(a==='accessibility'&&process.platform==='darwin')await shell.openExternal('x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility');if(a==='settings')openSettings();});
ipcMain.handle('select-zone',(e,displayId)=>{if(e.sender!==settings?.webContents)return;closeSelectors();temporaryPosition=null;expandedByButton=null;overlay.hide();settings.hide();const edit=editingConfig();for(const d of screen.getAllDisplays().filter(d=>!Number.isInteger(displayId)||d.id===displayId)){const w=windowFor({...d.bounds,frame:false,transparent:true,alwaysOnTop:true,skipTaskbar:true,resizable:false});w.displayId=d.id;w.profileId=editingProfileId;selecting.push(w);w.setAlwaysOnTop(true,'screen-saver');w.loadFile(path.join(__dirname,'zone.html'),{query:edit.zones.find(z=>z.displayId===d.id)?{language:baseConfig.language,rect:JSON.stringify((()=>{const z=edit.zones.find(z=>z.displayId===d.id).zone;return{x:z.x*d.bounds.width,y:z.y*d.bounds.height,w:z.w*d.bounds.width,h:z.h*d.bounds.height};})())}:{language:baseConfig.language}});} });
function closeSelectors(){for(const w of selecting)if(!w.isDestroyed())w.destroy();selecting=[];}
ipcMain.on('cancel-zone',e=>{if(validSender(e)){closeSelectors();openSettings();}});
ipcMain.on('zone',(e,r)=>{const w=selecting.find(w=>w.webContents===e.sender);if(!w)return;const scope=w.profileId,clean=sanitizeConfig({zone:r},effectiveConfig(baseConfig,scope)).zone,c=saveZone(effectiveConfig(baseConfig,scope),w.displayId,clean);activeDisplayId=w.displayId;closeSelectors();commitSettings({zones:c.zones,zonesInitialized:true},scope);openSettings();placeOverlay();broadcast();});

ipcMain.on('height',(e,height)=>{if(e.sender!==overlay?.webContents||!Number.isFinite(height))return;const h=Math.round(Math.max(widgetRect(forDisplay(config,display()),display()).height,Math.min(1200,height)));if(h!==overlayHeight){overlayHeight=h;placeOverlay();}});

function commandResult(r){const id=r.requestId,source=requestSources.get(id);if(id)requestSources.delete(id);diagnostics?.record('result',{action:r.action,ok:r.ok,sourceId:source});if(id?.startsWith('auto-')){autoPauseEngine.result(id,r.ok);evaluateAutoPause();return;}for(const w of [settings,overlay])if(w&&!w.isDestroyed())w.webContents.send('result',r);}
function refreshMedia(){if(quitting)return;const wasConnected=status.extensionConnected;
 const ext=extensionSources.length?extensionSources:extensionTrack?[extensionTrack]:[];const sys=systemSources.length?systemSources:systemTrack?[systemTrack]:[];
 mediaSources=mergeSources(sys,ext).map(t=>({...t,sourceId:sourceId(t),capabilities:{...t.capabilities,autoPause:supportsAutoPause(t)}}));track=mediaRouter.select(mediaSources,baseConfig.preferredSource,autoPauseEngine.owner?.sourceId||autoPauseEngine.pending?.sourceId);
 const announcementTrack=track?.source==='extension'?track:extensionStatus.connected&&baseConfig.preferredSource!=='system'&&!mediaRouter.pinnedId?.startsWith('system:')?null:track;const newSong=songAnnouncement.update(announcementTrack);if(newSong&&baseConfig.songAnnouncement&&!overlay?.isVisible()&&!dismissed&&!selecting.length){songNoticeUntil=Date.now()+baseConfig.songAnnouncementMs;expandedByButton=null;placeOverlay();}
 if(track?.sourceId!==artworkSource){artworkSource=track?.sourceId;bridge?.selectSource?.(artworkSource);}
 const sig=JSON.stringify(mediaSources.map(t=>[t.sourceId,t.playing]));if(sig!==lastSourcesSignature){lastSourcesSignature=sig;diagnostics?.record('sources',{count:mediaSources.length,sourceId:track?.sourceId,active:!!track?.playing});}
 status={...status,...(systemStatus.errorCode!=null?{errorCode:systemStatus.errorCode}:{}),connected:!!(systemStatus.connected||extensionStatus.connected),extensionConnected:!!extensionStatus.connected,extensionMusicReady:ext.length>0,bridgeProtocol2:!!extensionStatus.protocol2,error:(track?.source==='extension'?null:systemStatus.error)||extensionStatus.error||null};if(wasConnected!==status.extensionConnected)diagnostics?.record('connection',{connected:status.extensionConnected,protocol2:status.bridgeProtocol2});
 evaluateAutoPause();updateMini();broadcast();if(!wasConnected&&status.extensionConnected)for(const w of [settings,overlay])if(w&&!w.isDestroyed())w.webContents.send('connection-confirmed');
}
