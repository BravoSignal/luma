const PROFILE_KEYS=['zoneEnabled','holdEnabled','binding','zones','pinnedPositions','displayOverrides','orientation','widgetWidth','widgetHeight','verticalWidth','verticalHeight','hideDelay','rearmDelay','activationDelay'];
function matchingProfile(config,appId){return config.profiles?.find(p=>p.enabled!==false&&p.appId===appId)||null;}
function effectiveConfig(config,profileId){const profile=config.profiles?.find(p=>p.id===profileId);return profile?{...config,...profile.settings,profiles:config.profiles}:config;}
function removeDisplayZone(config,displayId){return{...config,zones:(config.zones||[]).filter(z=>z.displayId!==displayId)};}
function exportedPreferences(config,displays=[]){return{format:'luma-preferences',version:1,screens:displays.map(d=>({id:d.id,label:d.label||'',width:d.bounds.width,height:d.bounds.height})),config:{...structuredClone(config),lockedSourceId:null}};}
function remapScreens(config,oldScreens,newScreens){
 if(!newScreens?.length)return config;const mapping=new Map();const used=new Set();const oldIds=[...new Set([...(oldScreens||[]).map(d=>d.id),...(config.zones||[]).map(z=>z.displayId),...(config.profiles||[]).flatMap(p=>(p.settings.zones||[]).map(z=>z.displayId))])];
 for(const id of oldIds){let target=newScreens.find(d=>d.id===id&&!used.has(d.id));const old=oldScreens?.find(d=>d.id===id);if(!target&&old){const matches=newScreens.filter(d=>!used.has(d.id)&&d.label&&d.label===old.label);if(matches.length===1)target=matches[0];}if(!target&&old){const matches=newScreens.filter(d=>!used.has(d.id)&&d.bounds.width===old.width&&d.bounds.height===old.height);if(matches.length===1)target=matches[0];}if(target){mapping.set(id,target.id);used.add(target.id);}}
 for(const id of oldIds)if(!mapping.has(id)){const d=newScreens.find(d=>!used.has(d.id));if(d){mapping.set(id,d.id);used.add(d.id);}}
 const move=c=>{const next={...c};if(c.zones)next.zones=c.zones.filter(z=>mapping.has(z.displayId)).map(z=>({...z,displayId:mapping.get(z.displayId)}));for(const key of ['pinnedPositions','displayOverrides'])if(c[key])next[key]=Object.fromEntries(Object.entries(c[key]).filter(([id])=>mapping.has(Number(id))).map(([id,v])=>[mapping.get(Number(id)),v]));if(c.displayId!=null)next.displayId=mapping.get(c.displayId)??null;return next;};
 return{...move(config),profiles:config.profiles?.map(p=>({...p,settings:move(p.settings)}))||[]};
}
function importedPreferences(input,sanitizeConfig,defaults,displays=[]){if(!input||input.format!=='luma-preferences'||input.version!==1||!input.config||typeof input.config!=='object'||Array.isArray(input.config))throw Error('Choose a Luma preferences export.');return remapScreens(sanitizeConfig(input.config,defaults),Array.isArray(input.screens)?input.screens:[],displays);}
// A dismissal re-arms only after a continuous period outside every active zone.
class DismissalGate{
 constructor(){this.dismissed=false;this.outsideSince=null;}
 dismiss(){this.dismissed=true;this.outsideSince=null;}
 reset(){this.dismissed=false;this.outsideSince=null;}
 update(inZone,held,now,delay){if(!this.dismissed)return false;if(inZone||held){this.outsideSince=null;return true;}if(this.outsideSince===null)this.outsideSince=now;if(now-this.outsideSince>=delay)this.reset();return this.dismissed;}
}
// Require continuous presence in the same zone; shortcuts bypass this gate.
class ZoneEntryGate {
 constructor(){this.reset();}
 reset(){this.id=null;this.since=null;}
 update(id,now,delay){if(id==null){this.reset();return false;}if(id!==this.id){this.id=id;this.since=now;}return now-this.since>=delay;}
}
module.exports={ZoneEntryGate,PROFILE_KEYS,matchingProfile,effectiveConfig,removeDisplayZone,exportedPreferences,importedPreferences,remapScreens,DismissalGate};
