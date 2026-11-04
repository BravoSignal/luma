const {spawn}=require('node:child_process');const path=require('node:path');const fs=require('node:fs');const readline=require('node:readline');
function createDesktop({root,onFrontApp,onApps,onCommand,onMini=()=>{},onError=()=>{}}){
 const exe=path.join(root,'mac','Luma.Desktop');if(process.platform!=='darwin')return null;
 if(!fs.existsSync(exe)){onError('Desktop integration is missing.');return null;}
 let closed=false;const child=spawn(exe,[],{stdio:['pipe','pipe','pipe']});const rl=readline.createInterface({input:child.stdout});
 rl.on('line',line=>{try{const m=JSON.parse(line);if(m.type==='mini-state')onMini(m.visible===true);if(m.type==='front-app')onFrontApp(m.app);if(m.type==='apps')onApps(m.apps);if(m.type==='command'&&['previous','toggle','next'].includes(m.action))onCommand(m.action);}catch{}});
 child.stderr.on('data',()=>{});child.on('error',e=>onError(e.message));child.on('exit',()=>{if(!closed)onError('Desktop integration stopped. Restart Luma.');});child.stdin.on('error',()=>{});
 return{send(m){if(!child.killed&&child.stdin.writable)child.stdin.write(JSON.stringify(m)+'\n');},close(){closed=true;rl.close();child.kill();}};
}
module.exports={createDesktop};
