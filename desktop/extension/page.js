// Page-world access is restricted to the YouTube Music player on this origin.
(()=>{
 if(window.__lumaPlayerCommands)return;window.__lumaPlayerCommands=true;
 const post=data=>window.postMessage({channel:'luma-page',...data},location.origin);
 const bar=()=>document.querySelector('ytmusic-player-bar');
 const likes=()=>bar()?.querySelector('#like-button-renderer, ytmusic-like-button-renderer');
 const ratingButton=action=>likes()?.querySelector(action==='like'?'#button-shape-like button, .like button, button.like, #like-button':'#button-shape-dislike button, .dislike button, button.dislike, #dislike-button');
 const visible=el=>!!el&&!el.hidden&&el.getBoundingClientRect().height>0;
 const waitFor=async check=>{for(let i=0;i<25;i++){const value=check();if(value)return value;await pause(100);}return null;};
 const modes=()=>{const b=bar();let raw;try{raw=b?.getState?.()?.queue?.repeatMode;}catch{}raw=raw??b?.repeatMode??b?.getAttribute('repeat-mode');return{shuffle:b?b.hasAttribute('shuffle-on'):null,repeat:({NONE:'off',OFF:'off',ALL:'all',ONE:'one',REPEAT_MODE_OFF:'off',REPEAT_MODE_ALL:'all',REPEAT_MODE_ONE:'one'})[raw]??null,like:likes()?.getAttribute('like-status')||'INDIFFERENT'};};
 const button=name=>bar()?.querySelector(name==='shuffle'?'.shuffle, #shuffle, .shuffle-button':'.repeat, #repeat, .repeat-button');
 const menuButton=()=>bar()?.querySelector('ytmusic-menu-renderer button, ytmusic-menu-renderer tp-yt-paper-icon-button, .menu-button');
 const currentMediaId=()=>{try{return document.querySelector('#movie_player')?.getVideoData?.()?.video_id||'';}catch{return '';}};
 const emit=()=>post({type:'modes',mediaId:currentMediaId(),...modes(),likeAvailable:!!ratingButton('like')&&!!ratingButton('dislike'),playlistAvailable:!!menuButton(),shuffleAvailable:!!button('shuffle'),repeatAvailable:!!button('repeat')});
 const pause=ms=>new Promise(r=>setTimeout(r,ms));let busy=false;
 window.addEventListener('message',async e=>{if(e.source!==window||e.origin!==location.origin||e.data?.channel!=='luma-content')return;const {action,value,id}=e.data;if(!['shuffle','repeat','like','dislike','playlist','focus'].includes(action))return;if(busy){post({type:'result',id,action,ok:false});return;}
  busy=true;let ok=false;
  try{
   if(action==='focus'){if(value?.mediaId&&currentMediaId()&&value.mediaId!==currentMediaId())throw Error();if(location.pathname==='/watch')ok=true;else{const toggle=bar()?.querySelector('.toggle-player-page-button button, .toggle-player-page-button');if(!toggle)throw Error();toggle.click();ok=!!await waitFor(()=>location.pathname==='/watch');}}
   else if(action==='shuffle'){const b=button(action);if(!b||typeof value!=='boolean')throw Error();if(modes().shuffle!==value)b.click();await pause(200);ok=modes().shuffle===value;}
   else if(action==='repeat'){const b=button(action);if(!b||!['off','all','one'].includes(value))throw Error();for(let i=0;i<3&&modes().repeat!==value;i++){b.click();await pause(180);}ok=modes().repeat===value;}
   else if(action==='like'||action==='dislike'){
    const b=ratingButton(action);if(!b)throw Error();const target=action==='like'?'LIKE':'DISLIKE',next=modes().like===target?'INDIFFERENT':target;
    b.click();ok=!!await waitFor(()=>modes().like===next);
   }
   else if(action==='playlist'){
    const dialog=()=>[...document.querySelectorAll('ytmusic-add-to-playlist-renderer')].find(visible);
    if(dialog())ok=true;
    else{
     const menu=menuButton();if(!menu)throw Error();const open=[...document.querySelectorAll('ytmusic-menu-popup-renderer')].some(visible);if(!open)menu.click();await pause(180);
     const item=await waitFor(()=>[...document.querySelectorAll('ytmusic-menu-popup-renderer ytmusic-menu-navigation-item-renderer, ytmusic-menu-popup-renderer ytmusic-menu-service-item-renderer')].find(el=>visible(el)&&/(add|save|hinzufügen|speichern).*playlist|playlist.*(hinzufügen|speichern)/i.test(el.getAttribute('aria-label')||el.textContent||'')));
     if(!item)throw Error();(item.querySelector('a,button')||item).click();ok=!!await waitFor(dialog);if(ok){await pause(250);ok=!!dialog();}
    }
   }
  }catch{}finally{busy=false;emit();post({type:'result',id,action,ok});}
 });
 setInterval(emit,700);emit();
})();
