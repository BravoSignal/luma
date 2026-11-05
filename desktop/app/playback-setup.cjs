const {supportsAutoPause}=require('./routing.cjs');
function playbackSetup({config,track,status,automation}){
 if(!config.autoPause)return 'off';
 if(!track)return 'no-music';
 if(!supportsAutoPause(track))return track.source==='extension'?'update-bridge':'unsupported';
 if(!config.pauseApps?.length&&!config.pauseForVideos&&!config.pauseForAudio&&!config.pauseForSystemVideo)return 'no-rules';
 if((config.pauseForVideos||config.pauseForAudio)&&!status.bridgeProtocol2)return 'update-bridge';
 if(automation.phase==='unconfirmed')return 'unconfirmed';
 return 'ready';
}
module.exports={playbackSetup};
