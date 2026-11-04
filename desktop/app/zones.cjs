const {activationRect}=require('./geometry.cjs');
function forDisplay(config,display){const entry=config.zones?.find(z=>z.displayId===display.id);return{...config,...config.displayOverrides?.[display.id],zone:entry?.zone||config.zone,edgeTop:entry?.edgeTop===true};}
function migrateZones(config,primaryId){if(config.zonesInitialized||config.zones?.length)return{...config,zonesInitialized:true};return{...config,zonesInitialized:true,zones:[{displayId:config.displayId??primaryId,zone:{...config.zone},edgeTop:config.zone.y<.02,enabled:true}]};}
function hitZone(config,displays,point){if(!config.zoneEnabled)return null;for(const d of displays){const entry=config.zones?.find(z=>z.displayId===d.id&&z.enabled);if(!entry)continue;const r=activationRect({...config,zone:entry.zone,edgeTop:entry.edgeTop===true},d);if(point.x>=r.x&&point.y>=r.y&&point.x<r.x+r.width&&point.y<r.y+r.height)return d;}return null;}
function saveZone(config,displayId,zone){const rows=(config.zones||[]).filter(z=>z.displayId!==displayId);return{...config,zonesInitialized:true,zones:[...rows,{displayId,zone,edgeTop:zone.y<.0001,enabled:true}]};}
module.exports={forDisplay,migrateZones,hitZone,saveZone};
