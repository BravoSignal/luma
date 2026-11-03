function chooseTrack(system,extension){return extension&&(extension.playing||!system?.playing||system.title===extension.title)?extension:system;}
module.exports={chooseTrack};
