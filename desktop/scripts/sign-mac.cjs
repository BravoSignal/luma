// Bind the packaged app's identity and resources. This is ad-hoc signing,
// not a Developer ID signature or notarization. macOS permissions are never changed here.
const {execFileSync}=require('node:child_process');const path=require('node:path');
module.exports=async context=>{
 if(context.electronPlatformName!=='darwin')return;
 const app=path.join(context.appOutDir,context.packager.appInfo.productFilename+'.app');
 execFileSync('codesign',['--force','--deep','--sign','-',app],{stdio:'inherit'});
 execFileSync('codesign',['--force','--sign','-','--identifier',context.packager.appInfo.id,app],{stdio:'inherit'});
 execFileSync('codesign',['--verify','--deep','--strict',app],{stdio:'inherit'});
};
