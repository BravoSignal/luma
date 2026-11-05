// Session selection stays stable across polling updates and unrelated media playback.
function sourceId(track){return track?.sourceId||(track?.source==='extension'?'extension:legacy':track?'system:'+(track.app||'current'):null);}
function trackKey(t){return t?[t.mediaId||'',t.title||'',t.artist||'',Math.round(t.duration||0)].join('\n'):'';}
class MediaRouter{
 constructor(){this.selectedId=null;this.pinnedId=null;this.lastSelected=null;}
 pin(id){this.pinnedId=id||null;}
 select(rows,preference='youtube',holdId=null){
  const sources=rows.filter(t=>t&&t.title&&sourceId(t)).map(t=>({...t,sourceId:sourceId(t)}));
  if(this.pinnedId||holdId){const wanted=this.pinnedId||holdId;const exact=sources.find(t=>t.sourceId===wanted);if(exact){this.selectedId=exact.sourceId;this.lastSelected=exact;}return exact||null;}
  const music=sources.filter(t=>t.mediaType!=='video');const preferred=preference==='youtube'?music.filter(t=>t.source==='extension'):preference==='system'?music.filter(t=>t.source==='system'):[];
  const pool=preferred.length?preferred:music;let next=pool.find(t=>t.sourceId===this.selectedId);
  // Prefer a playing music source only when the selected one is no longer playing.
  if(!next||!next.playing)next=pool.find(t=>t.playing)||next||pool[0]||null;
  this.selectedId=next?.sourceId||null;if(next)this.lastSelected=next;return next;
 }
 get waiting(){return!!this.pinnedId&&this.selectedId===this.pinnedId;}
}
function supportsAutoPause(t){return t?.capabilities?.pause===true&&t.capabilities.play===true&&t.capabilities.autoPause!==false&&!(t.source==='system'&&/(chrome|chromium|edge|brave)/i.test(t.app||''));}
function mergeSources(system,extension){return [...extension,...system.filter(t=>!(/(chrome|chromium|edge|brave)/i.test(t.app||'')&&extension.some(e=>e.title===t.title&&(!e.artist||!t.artist||e.artist===t.artist))))];}
function chooseTrack(system,extension){return extension&&(extension.playing||!system?.playing||system.title===extension.title)?extension:system;}
module.exports={chooseTrack,MediaRouter,sourceId,trackKey,mergeSources,supportsAutoPause};
