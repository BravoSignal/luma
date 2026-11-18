// Live, video-only WebM over the existing authenticated local bridge. No file output.
(function(root){function createVideoStream({getVideo,getMediaId,emit,Recorder=globalThis.MediaRecorder,Stream=globalThis.MediaStream}){let enabled=false,key='',generation=0,recorder=null,captured=null,currentVideo=null,currentId='',failed=false;
 function release(){if(recorder){const old=recorder;recorder=null;old.ondataavailable=null;old.onerror=null;if(old.state!=='inactive')try{old.stop();}catch{}}if(captured){for(const t of captured.getTracks())t.stop();captured=null;}currentVideo=null;}
 async function start(){const token=++generation;release();failed=false;const v=getVideo(),id=getMediaId()||'';currentId=id;currentVideo=v;
 if(!v||v.readyState<2||!v.videoWidth||!v.videoHeight){emit({frame:null,mediaId:id,state:'no-video'});return;}
 try{const mime='video/webm;codecs=vp8';if(!Recorder?.isTypeSupported(mime)||typeof v.captureStream!=='function')throw Error('Unsupported video stream');captured=v.captureStream();const tracks=captured.getVideoTracks();for(const audio of captured.getAudioTracks())audio.stop();if(!tracks.length)throw Error('No video track');
 try{await tracks[0].applyConstraints?.({width:{max:640},height:{max:360},frameRate:{max:24}});}catch{}if(token!==generation||!enabled)return;
 const streamId=String(Date.now())+'-'+String(token);let sequence=0,queue=Promise.resolve();recorder=new Recorder(new Stream(tracks),{mimeType:mime,videoBitsPerSecond:500000});
 recorder.ondataavailable=event=>{if(!event.data?.size)return;queue=queue.then(async()=>{if(token!==generation||!enabled)return;const bytes=new Uint8Array(await event.data.arrayBuffer());for(let offset=0;offset<bytes.length;offset+=60000){if(token!==generation||!enabled)return;const piece=bytes.subarray(offset,offset+60000);const chunk=btoa(String.fromCharCode(...piece));const ack=await emit({streamId,sequence:sequence++,mime,chunk,mediaId:id,state:'ready'});if(ack?.ok===false)throw Error('Video receiver unavailable');}}).catch(()=>fail(token,id));};
 recorder.onerror=()=>fail(token,id);recorder.start(200);
 }catch{fail(token,id);}}
 function fail(token,id){if(token!==generation)return;failed=true;release();currentVideo=getVideo();currentId=id;emit({frame:null,mediaId:id,state:'protected-video'});}
 return{set(on,nextKey=''){on=!!on;if(enabled===on&&key===nextKey)return;enabled=on;key=nextKey;if(enabled)start();else{++generation;release();}},refresh(){if(!enabled)return;const v=getVideo(),id=getMediaId()||'';if(v!==currentVideo||id!==currentId||!recorder&&!failed&&v?.readyState>=2&&v.videoWidth)start();},close(){enabled=false;++generation;release();}};}
 const api={createVideoStream};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.LumaVideoStream=api;
})(typeof window!=='undefined'?window:globalThis);
