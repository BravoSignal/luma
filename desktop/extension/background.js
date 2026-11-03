let socket, token='', retry, heartbeat;const tabs=new Map();let activeTab;
function choose(){const rows=[...tabs.entries()].sort((a,b)=>Number(!!b[1].track?.playing)-Number(!!a[1].track?.playing)||b[1].seen-a[1].seen);activeTab=rows[0]?.[0];if(socket?.readyState===WebSocket.OPEN)socket.send(JSON.stringify({type:'track',track:rows[0]?.[1].track||null}));}
async function connect(){
 clearTimeout(retry);if(socket&&(socket.readyState===WebSocket.OPEN||socket.readyState===WebSocket.CONNECTING))return;
 token=(await chrome.storage.local.get('token')).token||'';if(!/^[a-f0-9]{48}$/.test(token))return;
 const s=new WebSocket(`ws://127.0.0.1:17384/?token=${encodeURIComponent(token)}`);socket=s;
 s.onopen=()=>{choose();chrome.action.setBadgeText({text:'✓'});chrome.action.setBadgeBackgroundColor({color:'#669c59'});clearInterval(heartbeat);heartbeat=setInterval(()=>{if(s.readyState===WebSocket.OPEN)s.send(JSON.stringify({type:'ping'}));},20000);};
 s.onmessage=e=>{try{const msg=JSON.parse(e.data);if(msg.type==='command'&&activeTab!==undefined){if(msg.action==='focus'){const id=activeTab;chrome.tabs.get(id).then(async t=>{await chrome.tabs.update(id,{active:true});await chrome.windows.update(t.windowId,{focused:true});if(s.readyState===WebSocket.OPEN)s.send(JSON.stringify({type:'result',action:'focus',ok:true}));}).catch(()=>{if(s.readyState===WebSocket.OPEN)s.send(JSON.stringify({type:'result',action:'focus',ok:false}));});return;}if(msg.action==='playlist')chrome.tabs.get(activeTab).then(t=>{chrome.tabs.update(activeTab,{active:true});chrome.windows.update(t.windowId,{focused:true});}).catch(()=>{});chrome.tabs.sendMessage(activeTab,msg).catch(()=>{tabs.delete(activeTab);choose();});}}catch{}};
 s.onclose=()=>{if(socket!==s)return;socket=null;clearInterval(heartbeat);chrome.action.setBadgeText({text:'·'});retry=setTimeout(connect,2500);};s.onerror=()=>{};
}
chrome.runtime.onMessage.addListener((msg,sender,reply)=>{
 if(msg.type==='track'&&sender.tab&&sender.url?.startsWith('https://music.youtube.com/')){tabs.set(sender.tab.id,{track:msg.track,seen:Date.now()});choose();connect();}
 if(msg.type==='result'&&sender.tab?.id===activeTab&&socket?.readyState===WebSocket.OPEN)socket.send(JSON.stringify({type:'result',action:msg.action,ok:msg.ok,...(msg.action==='queue'?{items:msg.items}:{})}));
 if(msg.type==='status'){reply({connected:socket?.readyState===WebSocket.OPEN});connect();}
});
chrome.tabs.onRemoved.addListener(id=>{tabs.delete(id);choose();});
chrome.tabs.onUpdated.addListener((id,info)=>{if(info.status==='loading'){tabs.delete(id);choose();}});
chrome.storage.onChanged.addListener((changes,area)=>{if(area==='local'&&changes.token){clearTimeout(retry);const old=socket;socket=null;old?.close();connect();}});
chrome.action.onClicked.addListener(()=>chrome.runtime.openOptionsPage());
chrome.runtime.onInstalled.addListener(()=>{chrome.alarms.create('reconnect',{periodInMinutes:.5});connect();});
chrome.runtime.onStartup.addListener(()=>{chrome.alarms.create('reconnect',{periodInMinutes:.5});connect();});
chrome.alarms.onAlarm.addListener(()=>connect());connect();
