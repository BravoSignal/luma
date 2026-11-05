(()=>{
 if(globalThis.__lumaVideoObserver||location.hostname==='music.youtube.com')return;globalThis.__lumaVideoObserver=true;
 async function report(){try{const policy=await chrome.runtime.sendMessage({type:'video-policy'});const items=policy?.allowed?[...document.querySelectorAll('video,audio')].filter(v=>!v.paused&&!v.ended&&v.readyState>=2).slice(0,12).map(v=>({kind:v.tagName==='VIDEO'?'video':'audio',audible:!v.muted&&v.volume>0,visible:document.visibilityState==='visible'})):[];await chrome.runtime.sendMessage({type:'video-activity',items});}catch{}}
 for(const event of ['play','pause','ended','volumechange','emptied','visibilitychange'])document.addEventListener(event,report,true);
 setInterval(report,2000);report();
})();
