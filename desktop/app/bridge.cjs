const { WebSocketServer, WebSocket } = require('ws');
const { sanitizeTrack, tokenEquals } = require('./core.cjs');
function createBridge({ token, onTrack, onStatus, onResult=()=>{}, port = 17384 }) {
 const server = new WebSocketServer({ host:'127.0.0.1', port, maxPayload:32768, verifyClient: ({origin,req}, done) => {
  const validOrigin = /^chrome-extension:\/\/[a-p]{32}$/.test(origin || '');
  let key; try { key = new URL(req.url,'http://127.0.0.1').searchParams.get('token'); } catch {}
  done(validOrigin && tokenEquals(key,token),403,'Pairing required');
 }});
 const clients = new Map(); let active = null;
 function publish() {
  const rows = [...clients.entries()].filter(([,v])=>v.track).sort((a,b)=>Number(b[1].track.playing)-Number(a[1].track.playing) || b[1].seen-a[1].seen);
  active = rows[0]?.[0] || null; onTrack(rows[0]?.[1].track || null); onStatus({ connected:clients.size>0, error:null });
 }
 server.on('connection',socket=>{
  clients.set(socket,{seen:Date.now(),track:null,alive:true}); publish();
  socket.on('pong',()=>{ const c = clients.get(socket); if(c)c.alive=true; });
  socket.on('message',raw=>{try { const msg=JSON.parse(raw); const c=clients.get(socket); if(!c)return; if(msg.type==='result'&&socket===active&&msg.action!=='queue')onResult({action:String(msg.action).slice(0,30),ok:msg.ok===true});if(msg.type==='track'){c.track=sanitizeTrack(msg.track);c.seen=Date.now();publish();} }catch{}});
  socket.on('error',()=>{}); socket.on('close',()=>{clients.delete(socket);publish();});
 });
 server.on('error',err=>onStatus({ connected:false,error:err.code === 'EADDRINUSE' ? 'Port 17384 ist belegt. Ist Luma bereits geöffnet?' : err.message }));
 const timer=setInterval(()=>{for(const [s,c] of clients){if(!c.alive){s.terminate();continue;}c.alive=false;s.ping();}},15000);
 return { server, command(action,value){if(active?.readyState===WebSocket.OPEN)active.send(JSON.stringify({type:'command',action,value}));}, close(){clearInterval(timer);for(const s of clients.keys())s.terminate();server.close();} };
}
module.exports={createBridge};
