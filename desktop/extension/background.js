if(typeof importScripts==='function')importScripts('video-sites.js');
let socket,token='',retry,heartbeat,modern=false,instanceId='';const tabs=new Map();let activeTab;const activity=new Map();
globalThis.LumaVideoPolicyChanged=()=>{for(const [key,value] of activity)if(!globalThis.LumaVideoSites?.allowed(value.url,value.tabURL))activity.delete(key);reportActivity();};
function send(value){if(socket?.readyState===WebSocket.OPEN)socket.send(JSON.stringify(value));}
function choose(){const entries=[...tabs.entries()].filter(([,v])=>v.track);if(!entries.some(([id])=>id===activeTab))activeTab=entries.find(([,v])=>v.track.playing)?.[0]??entries[0]?.[0];else if(!tabs.get(activeTab)?.track?.playing)activeTab=entries.find(([,v])=>v.track.playing)?.[0]??activeTab;if(modern)send({type:'sources',sources:entries.map(([id,v])=>({id:String(id),track:v.track}))});else send({type:'track',track:tabs.get(activeTab)?.track||null});}
function reportActivity(){const now=Date.now();for(const [id,v]of activity)if(now-v.seen>6000)activity.delete(id);send({type:'activity',items:[...activity.values()].flatMap(v=>v.items).slice(0,64)});}
async function connect(){clearTimeout(retry);if(socket&&(socket.readyState===WebSocket.OPEN||socket.readyState===WebSocket.CONNECTING))return;const prefs=await chrome.storage.local.get(['token','instanceId']);token=prefs.token||'';if(!/^[a-f0-9]{48}$/.test(token))return;instanceId=prefs.instanceId||globalThis.crypto?.randomUUID?.()||'00000000-0000-4000-8000-000000000001';if(!prefs.instanceId)await chrome.storage.local.set?.({instanceId});if(socket&&(socket.readyState===WebSocket.OPEN||socket.readyState===WebSocket.CONNECTING))return;const s=new WebSocket(`ws://127.0.0.1:17384/?token=${encodeURIComponent(token)}`);socket=s;modern=false;
 s.onopen=()=>{send({type:'hello',protocol:2,instanceId});choose();chrome.action.setBadgeText({text:'✓'});chrome.action.setBadgeBackgroundColor({color:'#669c59'});clearInterval(heartbeat);heartbeat=setInterval(()=>{send({type:'ping'});reportActivity();},2000);};
 s.onmessage=e=>{try{const msg=JSON.parse(e.data);if(msg.type==='hello'&&msg.protocol===2){modern=true;send({type:'hello',protocol:2,instanceId});choose();reportActivity();return;}if(msg.type!=='command')return;const id=msg.targetId!==undefined?Number(msg.targetId):activeTab;if(!Number.isSafeInteger(id)||!tabs.has(id)){send({type:'result',action:msg.action,ok:false,requestId:msg.requestId});return;}if(!msg.requestId)activeTab=id;const result=ok=>send({type:'result',action:msg.action,ok,requestId:msg.requestId});
  if(msg.action==='focus'||msg.action==='playlist'){chrome.tabs.get(id).then(async t=>{await chrome.tabs.update(id,{active:true});await chrome.windows.update(t.windowId,{focused:true});await chrome.tabs.sendMessage(id,msg.action==='focus'?{...msg,value:{mediaId:tabs.get(id)?.track?.mediaId||''}}:msg);}).catch(()=>result(false));return;}
  chrome.tabs.sendMessage(id,msg).catch(()=>{tabs.delete(id);choose();result(false);});
 }catch{}};
 s.onclose=()=>{if(socket!==s)return;socket=null;clearInterval(heartbeat);chrome.action.setBadgeText({text:'·'});retry=setTimeout(connect,2500);};s.onerror=()=>{};
}
chrome.runtime.onMessage.addListener((msg,sender,reply)=>{
 if(msg.type==='reload-music'&&sender.id===chrome.runtime.id&&sender.url===chrome.runtime.getURL('options.html')){reloadMusicTabs().then(count=>reply({count}));return true;}
 const music=sender.tab&&sender.url?.startsWith('https://music.youtube.com/');
 if(msg.type==='track'&&music){tabs.set(sender.tab.id,{track:msg.track,seen:Date.now()});choose();connect();}
 if(msg.type==='result'&&music&&(msg.requestId||sender.tab.id===activeTab))send({type:'result',action:msg.action,ok:msg.ok,requestId:msg.requestId});
 if(msg.type==='user-intent'&&music)send({type:'user-intent',targetId:String(sender.tab.id)});
 if(msg.type==='video-policy'&&sender.tab){reply?.({allowed:globalThis.LumaVideoSites?.allowed(sender.url,sender.tab.url)===true});return;}
 if(msg.type==='video-activity'&&sender.tab&&globalThis.LumaVideoSites?.allowed(sender.url,sender.tab.url)){const key=sender.tab.id+':'+(sender.frameId||0);activity.set(key,{seen:Date.now(),url:sender.url,tabURL:sender.tab.url,items:Array.isArray(msg.items)?msg.items.slice(0,12).filter(r=>r&&['video','audio'].includes(r.kind)).map(r=>({kind:r.kind,audible:r.audible===true,visible:r.visible===true})):[]});reportActivity();reply?.({ok:true});}
 if(msg.type==='open-options'&&sender.url?.startsWith('https://music.youtube.com/')){chrome.runtime.openOptionsPage();reply({ok:true});}
 if(msg.type==='status'){reply({connected:socket?.readyState===WebSocket.OPEN,paired:/^[a-f0-9]{48}$/.test(token),protocol:modern?2:1});connect();}
});
chrome.tabs.onRemoved.addListener(id=>{tabs.delete(id);for(const key of activity.keys())if(key.startsWith(id+':'))activity.delete(key);choose();reportActivity();});
chrome.tabs.onUpdated.addListener((id,info)=>{if(info.status==='loading'){tabs.delete(id);for(const key of activity.keys())if(key.startsWith(id+':'))activity.delete(key);choose();reportActivity();}});
chrome.storage.onChanged.addListener((changes,area)=>{if(area==='local'&&changes.token){clearTimeout(retry);const old=socket;socket=null;old?.close();connect();}});
chrome.action.onClicked.addListener(()=>chrome.runtime.openOptionsPage());
async function reloadMusicTabs(){try{const open=await chrome.tabs.query({url:'https://music.youtube.com/*'});const results=await Promise.allSettled(open.filter(t=>Number.isInteger(t.id)).map(t=>chrome.tabs.reload(t.id)));return results.filter(r=>r.status==='fulfilled').length;}catch{return 0;}}
chrome.runtime.onInstalled.addListener(details=>{if(details?.reason==='install')chrome.runtime.openOptionsPage();if(['install','update'].includes(details?.reason))reloadMusicTabs();chrome.alarms.create('reconnect',{periodInMinutes:.5});connect();});chrome.runtime.onStartup.addListener(()=>{chrome.alarms.create('reconnect',{periodInMinutes:.5});connect();});chrome.alarms.onAlarm.addListener(()=>{reportActivity();connect();});connect();
