(()=>{
 if(globalThis.__lumaVideoObserver||location.hostname==='music.youtube.com')return;globalThis.__lumaVideoObserver=true;let enabled=true,last='';
 const origin=location.origin+'/*';
 async function permissions(){try{const s=await chrome.storage.local.get('videoSites');enabled=Array.isArray(s.videoSites)&&s.videoSites.includes(origin);}catch{enabled=false;}}
 async function report(){try{await permissions();const items=enabled?[...document.querySelectorAll('video,audio')].filter(v=>!v.paused&&!v.ended&&v.readyState>=2).slice(0,12).map(v=>({kind:v.tagName==='VIDEO'?'video':'audio',audible:!v.muted&&v.volume>0,visible:document.visibilityState==='visible'})):[];const signature=JSON.stringify(items);last=signature;await chrome.runtime.sendMessage({type:'video-activity',items});}catch{}}
 for(const event of ['play','pause','ended','volumechange','emptied','visibilitychange'])document.addEventListener(event,report,true);
 setInterval(report,2000);report();
})();
