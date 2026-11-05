// Titles and media IDs arrive on different polls. Use the displayed song label,
// so a late ID cannot consume a song change before its new title arrives.
class SongAnnouncement {
 constructor(){this.source=null;this.label=null;this.pending=null;}
 update(track){
  if(!track?.sourceId||!track.title)return false;
  const label=[track.title,track.artist||''].join('\n');
  if(track.sourceId!==this.source){this.source=track.sourceId;this.label=label;this.pending=null;return false;}
  if(label!==this.label){this.label=label;this.pending=label;}
  if(this.pending===label&&track.playing){this.pending=null;return true;}
  return false;
 }
}
module.exports={SongAnnouncement};
