(()=>{
 const broad=['https://*/*','http://*/*'];let sites=[],blocked=[],all=false,syncing=false,again=false;
 function excluded(url){try{const u=new URL(url);return !['http:','https:'].includes(u.protocol)||u.hostname==='music.youtube.com'||blocked.some(h=>u.hostname===h||u.hostname.endsWith('.'+h));}catch{return true;}}
 function allowed(url,top){if(excluded(url)||top&&excluded(top))return false;try{return all||sites.includes(new URL(url).origin+'/*');}catch{return false;}}
 async function sync(){if(syncing){again=true;return;}syncing=true;try{
  const prefs=await chrome.storage.local.get(['videoSites','videoAllSites','videoBlocklist']);
  blocked=Array.isArray(prefs.videoBlocklist)?prefs.videoBlocklist.filter(h=>typeof h==='string'&&/^[a-z0-9.-]{1,253}$/i.test(h)).map(h=>h.toLowerCase()).slice(0,64):[];
  all=prefs.videoAllSites!==false&&await chrome.permissions.contains({permissions:['scripting'],origins:broad});sites=[];
  for(const origin of (Array.isArray(prefs.videoSites)?prefs.videoSites:[]).slice(0,32))try{if(await chrome.permissions.contains({permissions:['scripting'],origins:[origin]}))sites.push(origin);}catch{}
  globalThis.LumaVideoPolicyChanged?.();if(!chrome.scripting)return;
  const current=await chrome.scripting.getRegisteredContentScripts();const ids=current.filter(s=>s.id.startsWith('luma-video-')).map(s=>s.id);if(ids.length)await chrome.scripting.unregisterContentScripts({ids});
  const matches=all?broad:sites;if(matches.length){const excludeMatches=['*://music.youtube.com/*',...blocked.flatMap(h=>/^\d+(\.\d+){3}$/.test(h)?['*://'+h+'/*']:['*://'+h+'/*','*://*.'+h+'/*'])];
   await chrome.scripting.registerContentScripts([{id:'luma-video-sites',matches,excludeMatches,js:['video-observer.js'],allFrames:true,runAt:'document_idle',persistAcrossSessions:true}]);
   const tabs=await chrome.tabs.query({url:matches});await Promise.allSettled(tabs.filter(t=>allowed(t.url)).map(t=>chrome.scripting.executeScript({target:{tabId:t.id,allFrames:true},files:['video-observer.js']})));
  }
 }catch{}finally{syncing=false;if(again){again=false;sync();}}}
 globalThis.LumaVideoSites={allowed,sync};chrome.storage.onChanged.addListener((c,area)=>{if(area==='local'&&(c.videoSites||c.videoAllSites||c.videoBlocklist))sync();});chrome.permissions.onRemoved.addListener(()=>sync());chrome.permissions.onAdded.addListener(()=>sync());sync();
})();
