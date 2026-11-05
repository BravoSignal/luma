const {normalizeBinding,fromLegacy}=require('./binding.cjs');
const crypto = require('node:crypto');
const defaults = { songAnnouncement:true,songAnnouncementMs:2000,fadePauseMs:600, activationDelay:0,motion:'system',artworkOpacity:100,artworkBlur:16,titleSize:13,showRatings:true,showPlaylist:true, language:'en',preferredSource:'youtube',lockedSourceId:null,autoPause:false,pauseApps:[],pauseForVideos:false,pauseForSystemVideo:false,pauseForAudio:false,ignoreMutedVideos:true,videoForegroundOnly:false,autoResume:true,resumeDelay:1500,autoUpdate:true,profiles:[],displayOverrides:{},orientation:'horizontal',verticalWidth:224,verticalHeight:400,miniPlayer:false,rearmDelay:1200,zonesInitialized:false, zones:[],pinnedPositions:{},compactLayout:'stacked',textStyle:'system',letterSpacing:-.2,onboardingVersion:0,zoneEnabled: true, holdEnabled: false, widgetWidth:400,widgetHeight:108,key: 'F8', binding:fromLegacy('F8'), displayId: null, zone: { x: .4, y: .04, w: .2, h: .1 }, placement: 'top', accent: 'auto', customColor: '#b6dce8', size: 'adaptive', scale: 1, hoverDelay: 650, hideDelay: 650, autoStart: false };
function inside(p, r) { return p.x >= r.x && p.y >= r.y && p.x < r.x + r.width && p.y < r.y + r.height; }
function zoneBounds(config, display) { const b = display.bounds, z = config.zone; return { x: b.x + z.x * b.width, y: b.y + z.y * b.height, width: z.w * b.width, height: z.h * b.height }; }
function sanitizeConfig(input, current = defaults, includeProfiles=true) {
 const c = { ...current };
 if(!input||typeof input!=='object'||Array.isArray(input))input={};
 if(['system','full','reduced'].includes(input.motion))c.motion=input.motion;
 for(const [key,min,max] of [['activationDelay',0,2000],['artworkOpacity',0,150],['artworkBlur',0,30],['titleSize',12,14]])if(Number.isFinite(input[key]))c[key]=Math.round(Math.max(min,Math.min(max,input[key])));
 if(typeof input.songAnnouncement==='boolean')c.songAnnouncement=input.songAnnouncement;
 if(Number.isFinite(input.songAnnouncementMs))c.songAnnouncementMs=Math.round(Math.max(1000,Math.min(5000,input.songAnnouncementMs)));
 for(const key of ['showRatings','showPlaylist'])if(typeof input[key]==='boolean')c[key]=input[key];
 if(input.lockedSourceId===null||typeof input.lockedSourceId==='string'&&input.lockedSourceId.length<=800&&/^(extension|system):/.test(input.lockedSourceId))c.lockedSourceId=input.lockedSourceId;
 if(['youtube','system','automatic'].includes(input.preferredSource))c.preferredSource=input.preferredSource;
 for(const key of ['autoPause','pauseForVideos','pauseForSystemVideo','pauseForAudio','ignoreMutedVideos','videoForegroundOnly','autoResume'])if(typeof input[key]==='boolean')c[key]=input[key];
 if(Number.isFinite(input.fadePauseMs))c.fadePauseMs=Math.round(Math.max(0,Math.min(1500,input.fadePauseMs)));
 if(Number.isFinite(input.resumeDelay))c.resumeDelay=Math.round(Math.max(0,Math.min(30000,input.resumeDelay)));
 if(Array.isArray(input.pauseApps))c.pauseApps=input.pauseApps.filter(a=>a&&typeof a.id==='string'&&a.id.length&&a.id.length<501&&typeof a.name==='string').slice(0,64).map(a=>({id:a.id,name:a.name.slice(0,120)})).filter((a,i,all)=>all.findIndex(x=>x.id===a.id)===i);
 if(typeof input.miniPlayer==='boolean')c.miniPlayer=input.miniPlayer;
 if(typeof input.zonesInitialized==='boolean')c.zonesInitialized=input.zonesInitialized;
 if(['horizontal','vertical'].includes(input.orientation))c.orientation=input.orientation;
 if(Number.isFinite(input.rearmDelay))c.rearmDelay=Math.round(Math.max(0,Math.min(10000,input.rearmDelay)));
 if(['en','de'].includes(input.language))c.language=input.language;
 delete c.showQueue; // Discard the removed queue preference from older installations.
 if(['inline','stacked'].includes(input.compactLayout))c.compactLayout=input.compactLayout;
 if(['system','rounded','compact'].includes(input.textStyle))c.textStyle=input.textStyle;
 if(Number.isFinite(input.letterSpacing))c.letterSpacing=Math.max(-.6,Math.min(.8,input.letterSpacing));
 if(Number.isInteger(input.onboardingVersion))c.onboardingVersion=Math.max(0,Math.min(1,input.onboardingVersion));
 for (const k of ['zoneEnabled','holdEnabled','autoStart','autoUpdate']) if (typeof input[k] === 'boolean') c[k] = input[k];
 if (['F6','F7','F8','F9','F10','AltRight','ShiftRight'].includes(input.key)) c.key = input.key;
 if(normalizeBinding(input.binding))c.binding=normalizeBinding(input.binding);else if(input.key)c.binding=fromLegacy(c.key);
 if (['top','bottom'].includes(input.placement)) c.placement = input.placement;
 if (['auto','mint','lilac','peach','custom'].includes(input.accent)) c.accent = input.accent;
 if (typeof input.customColor==='string' && /^#[0-9a-f]{6}$/i.test(input.customColor)) c.customColor=input.customColor;
 if (['compact','expanded','adaptive'].includes(input.size)) c.size=input.size;
 if ([.85,1,1.15].includes(input.scale)) c.scale=input.scale;
 if(Number.isFinite(input.verticalWidth))c.verticalWidth=Math.round(Math.max(188,Math.min(360,input.verticalWidth)));
 if(Number.isFinite(input.verticalHeight))c.verticalHeight=Math.round(Math.max(300,Math.min(800,input.verticalHeight)));
 if(Number.isFinite(input.widgetWidth))c.widgetWidth=Math.round(Math.max(300,Math.min(640,input.widgetWidth)));
 if(Number.isFinite(input.widgetHeight))c.widgetHeight=Math.round(Math.max(96,Math.min(180,input.widgetHeight)));
 if (Number.isFinite(input.hoverDelay)) c.hoverDelay=Math.max(200,Math.min(2000,input.hoverDelay));
 if (Number.isFinite(input.hideDelay)) c.hideDelay = Math.max(150, Math.min(2500, input.hideDelay));
 if (input.displayId === null || Number.isInteger(input.displayId)) c.displayId = input.displayId;
 if (input.zone && ['x','y','w','h'].every(k => Number.isFinite(input.zone[k]))) {
  const z = input.zone; const x = Math.max(0, Math.min(.9999,z.x)), y = Math.max(0, Math.min(.9999,z.y));
  c.zone = { x,y,w: Math.max(.0001, Math.min(1-x,z.w)),h: Math.max(.0001, Math.min(1-y,z.h)) };
 }
 if(Array.isArray(input.zones))c.zones=input.zones.filter(z=>Number.isInteger(z?.displayId)&&z.zone&&['x','y','w','h'].every(k=>Number.isFinite(z.zone[k]))).slice(0,16).map(z=>({displayId:z.displayId,enabled:z.enabled!==false,edgeTop:z.edgeTop===true,zone:sanitizeConfig({zone:z.zone},{...defaults,zones:[]}).zone})).filter((z,i,a)=>a.findIndex(x=>x.displayId===z.displayId)===i);
 if(input.pinnedPositions&&typeof input.pinnedPositions==='object'&&!Array.isArray(input.pinnedPositions))c.pinnedPositions=Object.fromEntries(Object.entries(input.pinnedPositions).filter(([id,p])=>/^-?\d+$/.test(id)&&p&&Number.isFinite(p.x)&&Number.isFinite(p.y)).slice(0,16).map(([id,p])=>[id,{x:Math.max(0,Math.min(1,p.x)),y:Math.max(0,Math.min(1,p.y))}]));
 if(input.displayOverrides&&typeof input.displayOverrides==='object'&&!Array.isArray(input.displayOverrides))c.displayOverrides=Object.fromEntries(Object.entries(input.displayOverrides).filter(([id,v])=>/^-?\d+$/.test(id)&&v&&typeof v==='object').slice(0,16).map(([id,v])=>{const out={};if(['vertical','horizontal'].includes(v.orientation))out.orientation=v.orientation;if(Number.isFinite(v.widgetWidth))out.widgetWidth=Math.round(Math.max(300,Math.min(640,v.widgetWidth)));if(Number.isFinite(v.widgetHeight))out.widgetHeight=Math.round(Math.max(96,Math.min(180,v.widgetHeight)));if(Number.isFinite(v.verticalWidth))out.verticalWidth=Math.round(Math.max(188,Math.min(360,v.verticalWidth)));if(Number.isFinite(v.verticalHeight))out.verticalHeight=Math.round(Math.max(300,Math.min(800,v.verticalHeight)));return[id,out];}));
 if(includeProfiles&&Array.isArray(input.profiles)){const {PROFILE_KEYS}=require('./features.cjs');c.profiles=input.profiles.filter(p=>p&&typeof p.id==='string'&&typeof p.appId==='string'&&p.appId.length>0&&p.settings&&typeof p.settings==='object').slice(0,64).map(p=>{const clean=sanitizeConfig(p.settings,defaults,false);return{id:p.id.slice(0,80),appId:p.appId.slice(0,500),name:String(p.name||p.appId).slice(0,120),enabled:p.enabled!==false,settings:Object.fromEntries(PROFILE_KEYS.filter(k=>Object.hasOwn(p.settings,k)).map(k=>[k,clean[k]]))};}).filter((p,i,a)=>a.findIndex(x=>x.id===p.id||x.appId===p.appId)===i);}
 return c;
}
function sanitizeTrack(t) {
 if (!t || typeof t !== 'object') return null;
 const str = k => typeof t[k] === 'string' ? t[k].slice(0,500) : '';
 let artwork = str('artwork');
 try { const u = new URL(artwork); if (u.protocol !== 'https:' || !/(^|\.)(ytimg\.com|googleusercontent\.com|ggpht\.com)$/.test(u.hostname)) artwork = ''; } catch { artwork = ''; }
 const numeric = k => Number.isFinite(Number(t[k])) ? Number(t[k]) : 0;
 return { mediaId:typeof t.mediaId==='string'?t.mediaId.slice(0,100):'',title: str('title'), artist: str('artist'), artwork, playing: t.playing === true, muted:t.muted===true, position: Math.max(0,numeric('position')), duration: Math.max(0,numeric('duration')), shuffle:typeof t.shuffle==='boolean'?t.shuffle:null,repeat:['off','one','all'].includes(t.repeat)?t.repeat:null,like:['LIKE','DISLIKE','INDIFFERENT'].includes(t.like)?t.like:'INDIFFERENT',source:'extension',capabilities:Object.fromEntries(['toggle','play','pause','next','previous','seek','volume','fade','shuffle','repeat','like','dislike','playlist'].map(k=>[k,t.capabilities?.[k]===true])),volume: Math.min(1,Math.max(0,numeric('volume'))), updatedAt: Date.now() };
}
function tokenEquals(a,b) { if(typeof a !== 'string') return false; const left=Buffer.from(a),right=Buffer.from(b);return left.length===right.length&&crypto.timingSafeEqual(left,right); }
module.exports = { defaults, inside, zoneBounds, sanitizeConfig, sanitizeTrack, tokenEquals };
