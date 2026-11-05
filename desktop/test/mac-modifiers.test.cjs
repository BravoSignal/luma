const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const helper=path.resolve(__dirname,'../native/mac/Luma.Desktop');
test('native Mac modifiers distinguish each side, simultaneous keys and release', {skip:process.platform!=='darwin'||!fs.existsSync(helper)},()=>{
 const state=(key,flags)=>execFileSync(helper,['--modifier-state',String(key),String(flags)],{encoding:'utf8'}).trim();
 for(const [left,right,lmask,rmask] of [[56,60,2,4],[59,62,1,8192],[58,61,32,64],[55,54,8,16]]){
  assert.equal(state(right,rmask),'down');assert.equal(state(left,rmask),'up');
  assert.equal(state(left,lmask),'down');assert.equal(state(right,lmask),'up');
  assert.equal(state(right,lmask|rmask),'down');assert.equal(state(left,lmask|rmask),'down');
  assert.equal(state(right,0),'up');assert.equal(state(left,0),'up');
 }
});
