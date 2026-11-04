// Run after building, before manually uploading an approved GitHub release.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const version=require('../package.json').version;const dir=path.resolve(process.argv[2]||`release-v${version}-local`);const keyFile=process.env.LUMA_UPDATE_SIGNING_KEY||path.resolve(__dirname,'../../../work/luma-release-keys/update-private.pem');
const files={};for(const [target,name] of Object.entries({'darwin-arm64':`Luma-${version}-arm64-mac.zip`,'darwin-x64':`Luma-${version}-mac.zip`,'win32-x64':`Luma-Setup-${version}.exe`})){
 const file=path.join(dir,name);if(!fs.existsSync(file))throw Error(`Build missing: ${name}`);const data=fs.readFileSync(file);files[target]={url:`https://github.com/BravoSignal/luma/releases/download/v${version}/${name}`,size:data.length,sha256:crypto.createHash('sha256').update(data).digest('hex')};
}
const payload=JSON.stringify({version,files});const privateKey=fs.readFileSync(keyFile);const pub=crypto.createPublicKey(privateKey).export({type:'spki',format:'pem'});if(pub!==fs.readFileSync(path.resolve(__dirname,'../app/update-public.pem'),'utf8'))throw Error('Signing key does not match the key trusted by Luma.');
const envelope={payload,signature:crypto.sign(null,Buffer.from(payload),privateKey).toString('base64')};fs.writeFileSync(path.join(dir,'luma-update.json'),JSON.stringify(envelope,null,2)+'\n');console.log('Signed update manifest prepared for all three desktop packages. No files were uploaded.');
