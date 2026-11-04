const fs=require('node:fs/promises'),path=require('node:path');const {execFile,spawn}=require('node:child_process');const {promisify}=require('node:util');const {once}=require('node:events');const run=promisify(execFile);
const quote=s=>"'"+s.replace(/'/g,"'\\''")+"'";
function macSwapScript({pid,target,stage,backup,result,open='/usr/bin/open'}){
 return`#!/bin/sh\nset -eu\ncount=0\nwhile kill -0 ${Number(pid)} 2>/dev/null; do count=$((count+1)); if [ "$count" -ge 60 ]; then echo 'Luma did not close. Try installing again.' > ${quote(result)}; exit 1; fi; sleep 1; done\nif ! /bin/mv ${quote(target)} ${quote(backup)}; then echo 'Luma could not replace the installed app.' > ${quote(result)}; exit 1; fi\nif ! /bin/mv ${quote(stage)} ${quote(target)}; then /bin/mv ${quote(backup)} ${quote(target)}; echo 'Update failed; the previous app was restored.' > ${quote(result)}; ${quote(open)} ${quote(target)}; exit 1; fi\nif ! ${quote(open)} ${quote(target)}; then /bin/mv ${quote(target)} ${quote(stage)}; /bin/mv ${quote(backup)} ${quote(target)}; echo 'The new app could not start; the previous app was restored.' > ${quote(result)}; ${quote(open)} ${quote(target)}; exit 1; fi\n/bin/rm -rf ${quote(backup)}\n/bin/rmdir ${quote(path.dirname(backup))} 2>/dev/null || true\n`;
}
async function prepareMac({archive,execPath,version,cache,pid=process.pid}){
 const target=path.resolve(execPath,'../../..');if(path.basename(target)!=='Luma.app'||target.includes('/AppTranslocation/')||target.includes('/Volumes/'))throw Error('Move Luma to Applications before installing an update.');
 await fs.access(path.dirname(target),fs.constants.W_OK);
 const staging=await fs.mkdtemp(path.join(path.dirname(target),'.Luma-update-'));const stage=path.join(staging,'Luma.app'),backup=path.join(staging,'previous.app');
 try{
  await run('/usr/bin/ditto',['-x','-k',archive,staging]);
  const plist=path.join(stage,'Contents/Info.plist');
  const read=async key=>(await run('/usr/bin/plutil',['-extract',key,'raw','-o','-',plist])).stdout.trim();
  if(await read('CFBundleIdentifier')!=='local.luma.music'||await read('CFBundleShortVersionString')!==version)throw Error('The downloaded app is not the expected Luma version.');
  await fs.access(path.join(stage,'Contents/MacOS/Luma'),fs.constants.X_OK);
  const script=path.join(cache,'install-update.sh'),result=path.join(cache,'install-error.txt');await fs.rm(result,{force:true});
  await fs.writeFile(script,macSwapScript({pid,target,stage,backup,result}),{mode:0o700});
  return async()=>{const child=spawn('/bin/sh',[script],{detached:true,stdio:'ignore'});await once(child,'spawn');child.on('error',()=>{});child.unref();};
 }catch(e){await fs.rm(staging,{recursive:true,force:true});throw e;}
}
async function prepareWindows({archive}){
 await fs.access(archive);return async()=>{const child=spawn(archive,['--updated'],{detached:true,stdio:'ignore'});await once(child,'spawn');child.on('error',()=>{});child.unref();};
}
module.exports={macSwapScript,prepareMac,prepareWindows};
