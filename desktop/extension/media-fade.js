// Fade only the selected music element. Never changes system volume.
(function(root){
 function createFader({now=()=>performance.now(),later=(fn,ms)=>setTimeout(fn,ms),clear=id=>clearTimeout(id)}={}){
  let active=null;
  function cancel(preserve=false){active?.finish(false,preserve);}
  function pause(video,ms,valid=()=>true){
   cancel();ms=Math.max(0,Math.min(1500,Number(ms)||0));
   if(video.paused)return Promise.resolve(true);
   if(!ms||video.muted||!Number.isFinite(video.volume)||video.volume<=0){video.pause();return Promise.resolve(video.paused);}
   return new Promise(resolve=>{
    const job={video,original:video.volume,last:video.volume,start:now(),timer:null,done:false,finishing:false};
    job.finish=(ok,preserve=false)=>{if(job.done)return;job.done=true;clear(job.timer);video.removeEventListener('volumechange',changed);video.removeEventListener('pause',paused);if(active===job)active=null;if(!preserve&&Math.abs(video.volume-job.last)<.005)video.volume=job.original;resolve(ok);};
    const changed=()=>{if(Math.abs(video.volume-job.last)>.005)job.finish(false,true);};
    const paused=()=>{if(!job.finishing)job.finish(false);};
    const tick=()=>{if(job.done)return;try{if(!valid()||video.ended||video.paused){job.finish(false);return;}const p=Math.min(1,(now()-job.start)/ms);job.last=job.original*Math.cos(p*Math.PI/2);video.volume=job.last;if(p>=1){job.finishing=true;video.pause();job.finish(video.paused);return;}job.timer=later(tick,25);}catch{job.finish(false);}};
    active=job;video.addEventListener('volumechange',changed);video.addEventListener('pause',paused);tick();
   });
  }
  return{pause,cancel};
 }
 if(typeof module!=='undefined'&&module.exports)module.exports={createFader};else root.LumaMediaFade={createFader};
})(typeof window!=='undefined'?window:globalThis);
