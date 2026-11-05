const {WebSocketServer,WebSocket}=require('ws');const crypto=require('node:crypto');
const {sanitizeTrack,tokenEquals}=require('./core.cjs');
function createBridge({token,onTrack,onSources=()=>{},onActivity=()=>{},onIntent=()=>{},onStatus,onResult=()=>{},port=17384}){
 const server=new WebSocketServer({host:'127.0.0.1',port,maxPayload:131072,verifyClient:({origin,req},done)=>{let key;try{key=new URL(req.url,'http://127.0.0.1').searchParams.get('token');}catch{}done(/^chrome-extension:\/\/[a-p]{32}$/.test(origin||'')&&tokenEquals(key,token),403,'Pairing required');}});
 const clients=new Map();let active=null;
 const rows=()=>[...clients.entries()].flatMap(([socket,c])=>[...c.tracks.entries()].map(([id,track])=>({socket,id,track:{...track,sourceId:`extension:${c.id}:${id}`,provider:'YouTube Music'},seen:c.seen}))).sort((a,b)=>Number(b.track.playing)-Number(a.track.playing)||b.seen-a.seen);
 function publish(){const list=rows();active=list[0]||null;onTrack(active?.track||null);onSources(list.map(r=>r.track));onActivity([...clients.values()].flatMap(c=>Date.now()-c.activitySeen<10000?c.activity:[]));onStatus({connected:clients.size>0,protocol2:[...clients.values()].some(c=>c.modern),error:null});}
 server.on('connection',socket=>{
  const c={id:crypto.randomUUID(),seen:Date.now(),tracks:new Map(),activity:[],activitySeen:0,alive:true,modern:false,pending:new Map()};clients.set(socket,c);socket.send(JSON.stringify({type:'hello',protocol:2}));publish();
  socket.on('pong',()=>{c.alive=true;});socket.on('error',()=>{});
  socket.on('message',raw=>{try{const m=JSON.parse(raw);if(!clients.has(socket))return;
   if(m.type==='hello'&&m.protocol===2){c.modern=true;if(typeof m.instanceId==='string'&&/^[a-f0-9-]{36}$/.test(m.instanceId)&&![...clients.values()].some(v=>v!==c&&v.id===m.instanceId))c.id=m.instanceId;publish();}
   if(m.type==='sources'&&c.modern&&Array.isArray(m.sources)){c.tracks.clear();for(const r of m.sources.slice(0,32)){if(typeof r?.id!=='string'||!/^\d{1,15}$/.test(r.id))continue;const t=sanitizeTrack(r.track);if(t?.title)c.tracks.set(r.id,t);}c.seen=Date.now();publish();}
   if(m.type==='track'&&!c.modern){c.tracks.clear();const t=sanitizeTrack(m.track);if(t?.title)c.tracks.set('legacy',t);c.seen=Date.now();publish();}
   if(m.type==='activity'&&c.modern){c.activitySeen=Date.now();c.activity=Array.isArray(m.items)?m.items.slice(0,64).filter(r=>r&&['video','audio'].includes(r.kind)&&typeof r.audible==='boolean').map(r=>({kind:r.kind,audible:r.audible,visible:r.visible===true})):[];publish();}
   if(m.type==='user-intent'&&c.modern&&typeof m.targetId==='string'){const id=`extension:${c.id}:${m.targetId}`;if(c.tracks.has(m.targetId))onIntent(id);}
   if(m.type==='result'&&(m.requestId||socket===active?.socket)&&m.action!=='queue'){if(m.requestId){const p=c.pending.get(m.requestId);if(!p||p.action!==m.action)return;c.pending.delete(m.requestId);}const requestId=typeof m.requestId==='string'&&/^[a-zA-Z0-9-]{1,80}$/.test(m.requestId)?m.requestId:undefined;onResult({action:String(m.action).slice(0,30),ok:m.ok===true,requestId});}
  }catch{}});
  socket.on('close',()=>{clients.delete(socket);publish();});
 });
 server.on('error',e=>onStatus({connected:false,error:e.code==='EADDRINUSE'?'Port 17384 ist belegt. Ist Luma bereits geöffnet?':e.message}));
 const timer=setInterval(()=>{for(const [socket,c]of clients){if(!c.alive){socket.terminate();continue;}c.alive=false;socket.ping();}publish();},5000);
 return{server,command(action,value,sourceId,requestId){const r=sourceId?rows().find(r=>r.track.sourceId===sourceId):active;if(r?.socket.readyState===WebSocket.OPEN){const c=clients.get(r.socket);for(const [id,p]of c.pending)if(Date.now()-p.at>10000)c.pending.delete(id);if(requestId)c.pending.set(requestId,{action,at:Date.now()});r.socket.send(JSON.stringify({type:'command',action,value,targetId:r.id==='legacy'?undefined:r.id,requestId}));return true;}return false;},close(){clearInterval(timer);for(const s of clients.keys())s.terminate();server.close();}};
}
module.exports={createBridge};
