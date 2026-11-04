const crypto=require('node:crypto');
const REPO='BravoSignal/luma';
function versionParts(v){if(typeof v!=='string'||!/^\d+\.\d+\.\d+$/.test(v))throw Error('Invalid update version.');return v.split('.').map(Number);}
function newer(a,b){const x=versionParts(a),y=versionParts(b);for(let i=0;i<3;i++){if(x[i]!==y[i])return x[i]>y[i];}return false;}
function assetUrl(value,tag){const u=new URL(value);if(u.protocol!=='https:'||u.hostname!=='github.com'||u.username||u.password||u.search||u.hash||!u.pathname.startsWith(`/${REPO}/releases/download/${tag}/`))throw Error('Invalid update download address.');return u.href;}
function verifyManifest(envelope,key,release,platform,arch,current){
 if(!envelope||typeof envelope.payload!=='string'||envelope.payload.length>48000||typeof envelope.signature!=='string'||!crypto.verify(null,Buffer.from(envelope.payload),key,Buffer.from(envelope.signature,'base64')))throw Error('The update signature is invalid.');
 const m=JSON.parse(envelope.payload);versionParts(m.version);if(release.draft||release.prerelease||release.tag_name!==`v${m.version}`)throw Error('This is not a stable Luma release.');
 if(!newer(m.version,current))return null;
 const a=m.files?.[`${platform}-${arch}`];if(!a)throw Error('This release has no update for your computer.');
 if(!/^[a-f0-9]{64}$/.test(a.sha256)||!Number.isSafeInteger(a.size)||a.size<1||a.size>800*1024*1024)throw Error('Invalid update package.');
 const url=assetUrl(a.url,release.tag_name);const ext=platform==='darwin'?'.zip':'.exe';if(!new URL(url).pathname.endsWith(ext))throw Error('Invalid update package type.');
 const releaseAsset=release.assets?.find(x=>x.browser_download_url===url);if(!releaseAsset||releaseAsset.size!==a.size)throw Error('Update package does not match the published release.');
 return{version:m.version,url,sha256:a.sha256,size:a.size,releaseUrl:`https://github.com/${REPO}/releases/tag/v${m.version}`};
}
module.exports={REPO,newer,assetUrl,verifyManifest};
