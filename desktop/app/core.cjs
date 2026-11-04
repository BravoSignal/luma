const {normalizeBinding,fromLegacy}=require('./binding.cjs');
const crypto = require('node:crypto');
const defaults = { language:'en', zones:[],pinnedPositions:{},compactLayout:'stacked',textStyle:'system',letterSpacing:-.2,onboardingVersion:0,zoneEnabled: true, holdEnabled: false, widgetWidth:400,widgetHeight:108,key: 'F8', binding:fromLegacy('F8'), displayId: null, zone: { x: .4, y: .04, w: .2, h: .1 }, placement: 'top', accent: 'auto', customColor: '#b6dce8', size: 'adaptive', scale: 1, hoverDelay: 650, hideDelay: 650, autoStart: false };
function inside(p, r) { return p.x >= r.x && p.y >= r.y && p.x < r.x + r.width && p.y < r.y + r.height; }
function zoneBounds(config, display) { const b = display.bounds, z = config.zone; return { x: b.x + z.x * b.width, y: b.y + z.y * b.height, width: z.w * b.width, height: z.h * b.height }; }
function sanitizeConfig(input, current = defaults) {
 const c = { ...current };
 if(['en','de'].includes(input.language))c.language=input.language;
 delete c.showQueue; // Discard the removed queue preference from older installations.
 if(['inline','stacked'].includes(input.compactLayout))c.compactLayout=input.compactLayout;
 if(['system','rounded','compact'].includes(input.textStyle))c.textStyle=input.textStyle;
 if(Number.isFinite(input.letterSpacing))c.letterSpacing=Math.max(-.6,Math.min(.8,input.letterSpacing));
 if(Number.isInteger(input.onboardingVersion))c.onboardingVersion=Math.max(0,Math.min(1,input.onboardingVersion));
 for (const k of ['zoneEnabled','holdEnabled','autoStart']) if (typeof input[k] === 'boolean') c[k] = input[k];
 if (['F6','F7','F8','F9','F10','AltRight','ShiftRight'].includes(input.key)) c.key = input.key;
 if(normalizeBinding(input.binding))c.binding=normalizeBinding(input.binding);else if(input.key)c.binding=fromLegacy(c.key);
 if (['top','bottom'].includes(input.placement)) c.placement = input.placement;
 if (['auto','mint','lilac','peach','custom'].includes(input.accent)) c.accent = input.accent;
 if (typeof input.customColor==='string' && /^#[0-9a-f]{6}$/i.test(input.customColor)) c.customColor=input.customColor;
 if (['compact','expanded','adaptive'].includes(input.size)) c.size=input.size;
 if ([.85,1,1.15].includes(input.scale)) c.scale=input.scale;
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
 return c;
}
function sanitizeTrack(t) {
 if (!t || typeof t !== 'object') return null;
 const str = k => typeof t[k] === 'string' ? t[k].slice(0,500) : '';
 let artwork = str('artwork');
 try { const u = new URL(artwork); if (u.protocol !== 'https:' || !/(^|\.)(ytimg\.com|googleusercontent\.com|ggpht\.com)$/.test(u.hostname)) artwork = ''; } catch { artwork = ''; }
 const numeric = k => Number.isFinite(Number(t[k])) ? Number(t[k]) : 0;
 return { title: str('title'), artist: str('artist'), artwork, playing: t.playing === true, position: Math.max(0,numeric('position')), duration: Math.max(0,numeric('duration')), shuffle:typeof t.shuffle==='boolean'?t.shuffle:null,repeat:['off','one','all'].includes(t.repeat)?t.repeat:null,like:['LIKE','DISLIKE','INDIFFERENT'].includes(t.like)?t.like:'INDIFFERENT',source:'extension',capabilities:Object.fromEntries(['toggle','next','previous','seek','volume','shuffle','repeat','like','dislike','playlist'].map(k=>[k,t.capabilities?.[k]===true])),volume: Math.min(1,Math.max(0,numeric('volume'))), updatedAt: Date.now() };
}
function tokenEquals(a,b) { if(typeof a !== 'string') return false; const left=Buffer.from(a),right=Buffer.from(b);return left.length===right.length&&crypto.timingSafeEqual(left,right); }
module.exports = { defaults, inside, zoneBounds, sanitizeConfig, sanitizeTrack, tokenEquals };
