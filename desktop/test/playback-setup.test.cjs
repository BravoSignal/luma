const {test}=require('node:test'),assert=require('node:assert/strict');const {playbackSetup}=require('../app/playback-setup.cjs');
test('connected legacy bridge is reported as requiring an update instead of ready',()=>{
 const input={config:{autoPause:true,pauseForVideos:true},track:{source:'extension',capabilities:{pause:false,play:false}},status:{bridgeProtocol2:false},automation:{phase:'idle'}};
 assert.equal(playbackSetup(input),'update-bridge');
 input.track.capabilities={pause:true,play:true};assert.equal(playbackSetup(input),'update-bridge');
 input.status.bridgeProtocol2=true;assert.equal(playbackSetup(input),'ready');
 input.config.pauseForVideos=false;assert.equal(playbackSetup(input),'no-rules');
 input.track.source='system';input.track.capabilities.autoPause=false;assert.equal(playbackSetup(input),'unsupported');
 input.config.autoPause=false;assert.equal(playbackSetup(input),'off');
});
