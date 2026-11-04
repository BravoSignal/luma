const {spawn,execFile}=require('node:child_process');const path=require('node:path');const readline=require('node:readline');const fs=require('node:fs');
function macTrack(p){
 if(!p?.title)return null;
 const stamp=Number(p.timestampEpochMicros)/1000;const playing=p.playing===true;
 const pos=(Number(p.elapsedTimeMicros)||0)/1e6+(playing&&Number.isFinite(stamp)?Math.max(0,(Date.now()-stamp)/1000)*(Number(p.playbackRate)||1):0);
 return {title:p.title,artist:p.artist||'',artwork:p.artworkData&&/^image\/(png|jpeg|webp)$/.test(p.artworkMimeType)?`data:${p.artworkMimeType};base64,${p.artworkData}`:'',playing,position:pos,duration:(Number(p.durationMicros)||0)/1e6,shuffle:p.shuffleMode==null?null:p.shuffleMode!==1,repeat:({1:'off',2:'one',3:'all'})[p.repeatMode]??null,app:p.parentApplicationBundleIdentifier||p.bundleIdentifier,capabilities:{toggle:true,next:!p.prohibitsSkip,previous:!p.prohibitsSkip,seek:!!p.durationMicros,shuffle:p.shuffleMode!=null,repeat:p.repeatMode!=null},updatedAt:Date.now(),source:'system'};
}
function createMedia({root,onTrack,onStatus,onResult,onDesktop=()=>{}}){
 let child,closed=false,latest=null,lastPayload={};const isMac=process.platform==='darwin';
 const script=path.join(root,'mac','mediaremote-adapter.pl'),framework=path.join(root,'mac','MediaRemoteAdapter.framework');
 const exe=path.join(root,'windows','bin','Luma.Media.exe');
 const emit=t=>{latest=t;if(t){t.updatedAt=Date.now();t.source='system';}onTrack(t);};
 if(!isMac&&process.platform!=='win32'){onStatus({error:'Die System-Medienanbindung unterstützt Windows und macOS.'});return{command(){},close(){}};}
 if(!fs.existsSync(isMac?framework:exe)){onStatus({error:'Die System-Medienanbindung fehlt. Bitte den passenden Luma-Build verwenden.'});return{command(){},close(){}};}
 child=spawn(isMac?'/usr/bin/perl':exe,isMac?[script,framework,'stream','--micros','--debounce=120']:[],{windowsHide:true,stdio:['pipe','pipe','pipe']});
 const rl=readline.createInterface({input:child.stdout});
 rl.on('line',line=>{try{const msg=JSON.parse(line);if(isMac&&msg.type==='data'){lastPayload=msg.diff?{...lastPayload,...msg.payload}:msg.payload;emit(macTrack(lastPayload));onStatus({connected:true,error:null});}else if(msg.type==='track'){emit(msg.track);onStatus({connected:true,error:null});}else if(['front-app','apps'].includes(msg.type))onDesktop(msg);else if(msg.type==='result')onResult(msg);else if(msg.type==='error')onStatus({error:msg.message});}catch{}});
 child.stderr.on('data',()=>{});child.on('error',e=>onStatus({connected:false,error:'Medienanbindung: '+e.message}));child.on('exit',code=>{if(!closed){emit(null);onStatus({connected:false,error:`Die System-Medienanbindung wurde beendet (${code}). Bitte Luma neu starten.`});}});
 return {desktop(action){if(child?.stdin.writable)child.stdin.write(JSON.stringify({action})+'\n');},command(action,value){
  if(!latest)return onResult({action,ok:false});
  if(!isMac){child.stdin.write(JSON.stringify({action,value})+'\n');return;}
  const args=({toggle:['send','2'],next:['send','4'],previous:['send','5'],seek:['seek',String(Math.round(Math.max(0,Number(value)||0)*1e6))],shuffle:['shuffle',value?'3':'1'],repeat:['repeat',({off:'1',one:'2',all:'3'})[value]||'1']})[action];
  if(!args)return onResult({action,ok:false});
  execFile('/usr/bin/perl',[script,framework,...args],{timeout:5000},err=>{if(err)return onResult({action,ok:false});if(['shuffle','repeat'].includes(action))setTimeout(()=>onResult({action,ok:action==='shuffle'?latest?.shuffle===value:latest?.repeat===value}),1200);});
 },close(){closed=true;rl.close();child.kill();}};
}
module.exports={createMedia,macTrack};
