const fs=require('node:fs'),fsp=fs.promises,path=require('node:path'),https=require('node:https'),crypto=require('node:crypto');
const {pipeline}=require('node:stream/promises');const {Transform}=require('node:stream');
const {REPO,newer,assetUrl,verifyManifest}=require('./update-policy.cjs');const {prepareMac,prepareWindows}=require('./update-install.cjs');
const HOSTS=new Set(['api.github.com','github.com','release-assets.githubusercontent.com','objects.githubusercontent.com']);
function response(url,redirects=0){return new Promise((resolve,reject)=>{let u;try{u=new URL(url);if(u.protocol!=='https:'||!HOSTS.has(u.hostname)||u.username||u.password)throw Error('Untrusted update address.');}catch(e){reject(e);return;}
 const req=https.get(u,{headers:{'User-Agent':'Luma-Desktop-Updater','Accept':'application/vnd.github+json'}},res=>{if([301,302,303,307,308].includes(res.statusCode)){res.resume();if(redirects>=5||!res.headers.location){reject(Error('Too many update redirects.'));return;}response(new URL(res.headers.location,u).href,redirects+1).then(resolve,reject);return;}if(res.statusCode!==200){res.resume();const error=Error(`Update server returned ${res.statusCode}. Please try again later.`);error.statusCode=res.statusCode;reject(error);return;}resolve(res);});req.setTimeout(30000,()=>req.destroy(Error('Update connection timed out.')));req.on('error',reject);
 });}
async function json(url){const res=await response(url),chunks=[];let size=0;for await(const c of res){size+=c.length;if(size>1024*1024){res.destroy();throw Error('Update metadata is too large.');}chunks.push(c);}return JSON.parse(Buffer.concat(chunks).toString('utf8'));}
async function download(url,dest,expected,onProgress){const res=await response(url),hash=crypto.createHash('sha256');let size=0,last=0;const meter=new Transform({transform(chunk,encoding,cb){size+=chunk.length;if(size>expected.size){cb(Error('Update package is larger than expected.'));return;}hash.update(chunk);const percent=Math.floor(size/expected.size*100);if(percent!==last){last=percent;onProgress(percent);}cb(null,chunk);}});await pipeline(res,meter,fs.createWriteStream(dest,{mode:0o600}));if(size!==expected.size||hash.digest('hex')!==expected.sha256)throw Error('Update integrity check failed. The download was discarded.');}
async function validFile(file,expected){try{if((await fsp.stat(file)).size!==expected.size)return false;const h=crypto.createHash('sha256');for await(const chunk of fs.createReadStream(file))h.update(chunk);return h.digest('hex')===expected.sha256;}catch{return false;}}
function createUpdater({version,platform=process.platform,arch=process.arch,cache,enabled=true,packaged=true,execPath=process.execPath,onState=()=>{},quit=()=>{},getJson=json,downloadFile=download,prepareInstall=platform==='darwin'?prepareMac:prepareWindows,key=fs.readFileSync(path.join(__dirname,'update-public.pem'))}){
 let state={phase:'idle',version,availableVersion:null,percent:0,lastChecked:null,error:null,enabled,supported:packaged&&['darwin','win32'].includes(platform)},candidate=null,busy=false,timers=[];
 const emit=patch=>{state={...state,...patch};onState({...state});};
 const fail=e=>emit({phase:'error',error:e.message||'Updates are unavailable. Please try again later.'});
 async function fetchUpdate(){
  if(!candidate||!state.supported)return;
  emit({phase:'downloading',error:null,percent:0});await fsp.mkdir(cache,{recursive:true,mode:0o700});
  const file=path.join(cache,`Luma-${candidate.version}-${platform}-${arch}${platform==='darwin'?'.zip':'.exe'}`);
  for(const name of await fsp.readdir(cache))if(/^Luma-.*\.(zip|exe)(\.partial)?$/.test(name)&&name!==path.basename(file))await fsp.rm(path.join(cache,name),{force:true});
  if(!await validFile(file,candidate)){
   const partial=file+'.partial';try{await downloadFile(candidate.url,partial,candidate,percent=>emit({percent}));if(!await validFile(partial,candidate))throw Error('Update integrity check failed. The download was discarded.');await fsp.rename(partial,file);}catch(e){await fsp.rm(partial,{force:true});throw e;}
  }
  candidate={...candidate,file};emit({phase:'ready',percent:100});
 }
 async function check(){if(busy||!state.supported||state.phase==='ready')return;busy=true;emit({phase:'checking',error:null});try{
  let release;try{release=await getJson(`https://api.github.com/repos/${REPO}/releases/latest`);}catch(e){if(e.statusCode===404){candidate=null;emit({phase:'waiting',availableVersion:null,lastChecked:Date.now()});return;}throw e;}const latest=String(release.tag_name||'').replace(/^v/,'');
  if(!newer(latest,version)){candidate=null;emit({phase:'current',availableVersion:null,lastChecked:Date.now()});return;}
  const manifest=release.assets?.find(a=>a.name==='luma-update.json');if(!manifest)throw Error('This release needs a manual download. Open Releases to install it.');
  const envelope=await getJson(assetUrl(manifest.browser_download_url,release.tag_name));candidate=verifyManifest(envelope,key,release,platform,arch,version);
  emit({phase:'available',availableVersion:candidate.version,lastChecked:Date.now()});if(state.enabled)await fetchUpdate();
 }catch(e){fail(e);}finally{busy=false;}}
 async function requestDownload(){if(busy||!candidate||!state.supported)return;busy=true;try{await fetchUpdate();}catch(e){fail(e);}finally{busy=false;}}
 async function install(){if(busy||state.phase!=='ready'||!candidate?.file)return;busy=true;try{emit({phase:'installing',error:null});if(!await validFile(candidate.file,candidate))throw Error('Update integrity check failed. Download the update again.');const launch=await prepareInstall({archive:candidate.file,execPath,version:candidate.version,cache});await launch();quit();}catch(e){fail(e);busy=false;}}
 function automatic(){if(state.enabled)void check();}
 function start(){if(!state.supported)return;try{const file=path.join(cache,'install-error.txt');if(fs.existsSync(file)){fail(Error(fs.readFileSync(file,'utf8').trim()));fs.rmSync(file);}}catch{}timers.push(setTimeout(automatic,20000),setInterval(automatic,6*60*60*1000));timers.forEach(t=>t.unref?.());}
 return{start,check,download:requestDownload,install,get state(){return{...state};},setEnabled(value){emit({enabled:value===true});if(state.enabled&&state.phase==='available')void requestDownload();},close(){timers.forEach(t=>{clearTimeout(t);clearInterval(t);});}};
}
module.exports={createUpdater,validFile};
