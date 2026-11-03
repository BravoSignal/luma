// Page-world access is restricted to the YouTube Music player on this origin.
(()=>{
 const post=data=>window.postMessage({channel:'luma-page',...data},location.origin);
 const bar=()=>document.querySelector('ytmusic-player-bar');
 const likes=()=>document.querySelector('#like-button-renderer, ytmusic-like-button-renderer');
 const modes=()=>{const b=bar();let raw;try{raw=b?.getState?.()?.queue?.repeatMode;}catch{}raw=raw??b?.repeatMode??b?.getAttribute('repeat-mode');return{shuffle:b?b.hasAttribute('shuffle-on'):null,repeat:({NONE:'off',OFF:'off',ALL:'all',ONE:'one',REPEAT_MODE_OFF:'off',REPEAT_MODE_ALL:'all',REPEAT_MODE_ONE:'one'})[raw]??null,like:likes()?.getAttribute('like-status')||'INDIFFERENT'};};
 const button=name=>bar()?.querySelector(name==='shuffle'?'.shuffle, #shuffle, .shuffle-button':'.repeat, #repeat, .repeat-button');
 const menuButton=()=>bar()?.querySelector('ytmusic-menu-renderer button, ytmusic-menu-renderer tp-yt-paper-icon-button, .menu-button');
 const emit=()=>post({type:'modes',...modes(),likeAvailable:!!likes(),playlistAvailable:!!menuButton(),shuffleAvailable:!!button('shuffle'),repeatAvailable:!!button('repeat')});
 const pause=ms=>new Promise(r=>setTimeout(r,ms));let busy=false;
 window.addEventListener('message',async e=>{if(e.source!==window||e.origin!==location.origin||e.data?.channel!=='luma-content')return;const {action,value,id}=e.data;if(!['shuffle','repeat','like','dislike','playlist'].includes(action))return;if(busy){post({type:'result',id,action,ok:false});return;}
  busy=true;let ok=false;
  try{
   if(action==='shuffle'){const b=button(action);if(!b||typeof value!=='boolean')throw Error();if(modes().shuffle!==value)b.click();await pause(200);ok=modes().shuffle===value;}
   else if(action==='repeat'){const b=button(action);if(!b||!['off','all','one'].includes(value))throw Error();for(let i=0;i<3&&modes().repeat!==value;i++){b.click();await pause(180);}ok=modes().repeat===value;}
   else if(action==='like'||action==='dislike'){const r=likes();if(!r)throw Error();const target=action==='like'?'LIKE':'DISLIKE',next=modes().like===target?'INDIFFERENT':target;if(typeof r.updateLikeStatus==='function')r.updateLikeStatus(next);else{const b=r.querySelector(action==='like'?'.like, #like-button':'.dislike, #dislike-button');if(!b)throw Error();b.click();}await pause(250);ok=modes().like===next;}
   else if(action==='playlist'){const menu=menuButton();if(!menu)throw Error();menu.click();await pause(250);const items=[...document.querySelectorAll('ytmusic-menu-navigation-item-renderer, ytmusic-menu-service-item-renderer')];const item=items.find(el=>['ADD_TO_PLAYLIST','PLAYLIST_ADD'].includes(el.data?.icon?.iconType)||/(add|save|hinzufügen|speichern).*playlist|playlist.*(hinzufügen|speichern)/i.test(el.textContent||''));if(!item)throw Error();item.click();await pause(250);ok=!!document.querySelector('ytmusic-add-to-playlist-renderer, ytmusic-playlist-add-to-option-renderer');}
  }catch{}finally{busy=false;emit();post({type:'result',id,action,ok});}
 });
 setInterval(emit,700);emit();
})();
