const {trackKey,supportsAutoPause}=require('./routing.cjs');
class AutoPause{
 constructor(){this.owner=null;this.pending=null;this.suppressed=false;this.clearSince=null;this.sequence=0;this.phase='idle';this.reasons=[];}
 cancel(manual=false){this.owner=null;this.pending=null;this.clearSince=null;this.phase=manual?'manual':'idle';if(manual)this.suppressed=true;}
 manual(sourceId,action){if(['toggle','play','pause','next','previous','seek','source'].includes(action)&&(!sourceId||sourceId===(this.owner||this.pending)?.sourceId))this.cancel(true);}
 result(id,ok){if(this.pending?.id===id)this.pending.ack=ok===true;}
 request(action,t,now,fadeMs=0){const command={id:'auto-'+(++this.sequence),action,sourceId:t.sourceId,key:trackKey(t),position:t.position||0,deadline:now+5000,ack:null};if(action==='pause'&&t.source==='extension'&&t.capabilities?.fade===true&&fadeMs>0)command.value={fadeMs:Math.min(1500,fadeMs)};this.pending=command;this.phase=action==='pause'?'pausing':'resuming';return{...command};}
 step({enabled,reasons=[],sources=[],selectedId,resume=true,delay=1500,fadeMs=0,now=Date.now()}){
  this.reasons=reasons;const blocked=reasons.length>0;
  if(!enabled){this.cancel();this.suppressed=false;return null;}
  const active=this.pending||this.owner;const target=active&&sources.find(t=>t.sourceId===active.sourceId);
  if(active&&(!target||trackKey(target)!==active.key)){this.cancel(blocked);return null;}
  if(this.pending){const p=this.pending;
   if(p.ack===false||now>=p.deadline){this.cancel(blocked);this.phase='unconfirmed';return null;}
   if(p.ack===true&&target.playing===(p.action==='play')){
    this.pending=null;if(p.action==='pause'){this.owner={sourceId:p.sourceId,key:p.key,position:target.position||0};this.phase='paused';}else{this.owner=null;this.phase='idle';}
   }else return null;
  }
  if(this.owner){
   if(target.playing||Math.abs((target.position||0)-this.owner.position)>3){this.cancel(true);return null;}
   if(blocked){this.clearSince=null;this.phase='paused';return null;}
   if(!resume){this.cancel();return null;}
   if(this.clearSince===null)this.clearSince=now;this.phase='waiting';
   if(now-this.clearSince>=delay)return this.request('play',target,now);
   return null;
  }
  if(!blocked){this.suppressed=false;this.phase='idle';return null;}
  if(this.suppressed)return null;
  const selected=sources.find(t=>t.sourceId===selectedId);
  if(selected?.playing&&selected.mediaType!=='video'&&supportsAutoPause(selected))return this.request('pause',selected,now,fadeMs);
  return null;
 }
 get state(){return{phase:this.phase,fading:!!this.pending?.value?.fadeMs,ownsPause:!!this.owner,reasons:[...this.reasons]};}
}
module.exports={AutoPause};
