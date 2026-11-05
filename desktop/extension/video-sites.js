(()=>{
 let sites=[];let syncing=false,again=false;
 function allowed(url){try{return sites.includes(new URL(url).origin+'/*')&&new URL(url).hostname!=='music.youtube.com';}catch{return false;}}
 async function sync(){if(syncing){again=true;return;}syncing=true;try{const prefs=await chrome.storage.local.get('videoSites');const requested=Array.isArray(prefs.videoSites)?prefs.videoSites:[];sites=[];for(const origin of requested.slice(0,32)){try{if(await chrome.permissions.contains({permissions:['scripting'],origins:[origin]}))sites.push(origin);}catch{}}
  if(!chrome.scripting)return;const current=await chrome.scripting.getRegisteredContentScripts();const ids=current.filter(s=>s.id.startsWith('luma-video-')).map(s=>s.id);if(ids.length)await chrome.scripting.unregisterContentScripts({ids});
  if(sites.length){await chrome.scripting.registerContentScripts([{id:'luma-video-sites',matches:sites,js:['video-observer.js'],allFrames:true,runAt:'document_idle',persistAcrossSessions:true}]);const tabs=await chrome.tabs.query({url:sites});await Promise.allSettled(tabs.map(t=>chrome.scripting.executeScript({target:{tabId:t.id,allFrames:true},files:['video-observer.js']})));}
 }catch{}finally{syncing=false;if(again){again=false;sync();}}}
 globalThis.LumaVideoSites={allowed,sync};chrome.storage.onChanged.addListener((c,area)=>{if(area==='local'&&c.videoSites)sync();});chrome.permissions.onRemoved.addListener(()=>sync());chrome.permissions.onAdded.addListener(()=>sync());sync();
})();
