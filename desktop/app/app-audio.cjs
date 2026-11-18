class AppAudioGate {
 constructor(){this.sample=null;this.lastAudible=0;this.audibleApp=null;}
 ingest(value,now=Date.now()){if(!value||typeof value.appId!=='string'||!['off','ready','waiting','no-selected-app','permission-or-device-error','device-error','unsupported-os','unsupported-format'].includes(value.state))return;this.sample={appId:value.appId.slice(0,500),peak:Number.isFinite(value.peak)?Math.max(0,Math.min(1,value.peak)):0,state:value.state,at:now};}
 active(frontId,threshold=.003,now=Date.now()){const s=this.sample;if(!s||s.state!=='ready'||s.appId!==frontId||now-s.at>1200){this.lastAudible=0;this.audibleApp=null;return false;}if(s.peak>=threshold){this.lastAudible=now;this.audibleApp=frontId;}return this.audibleApp===frontId&&now-this.lastAudible<600;}
}
module.exports={AppAudioGate};
