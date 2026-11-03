using System.Text.Json;
using Windows.Media.Control;
using Windows.Media;
using Windows.Storage.Streams;

class Program {
 static readonly object gate = new();
 static GlobalSystemMediaTransportControlsSessionManager? manager;
 static string cacheKey="", cachedArtwork=""; static DateTime artTime=DateTime.MinValue;
 static void Emit(object obj) { lock(gate) Console.WriteLine(JsonSerializer.Serialize(obj)); }
 static async Task Main() {
  try { manager=await GlobalSystemMediaTransportControlsSessionManager.RequestAsync(); }
  catch(Exception e) { Emit(new{type="error",message=e.Message});return; }
  _ = Task.Run(async()=>{while(await Console.In.ReadLineAsync() is string line){try{using var doc=JsonDocument.Parse(line);var r=doc.RootElement;var action=r.GetProperty("action").GetString();var s=manager.GetCurrentSession();bool ok=false;if(s!=null){var info=s.GetPlaybackInfo();switch(action){case"toggle":ok=await s.TryTogglePlayPauseAsync();break;case"next":ok=await s.TrySkipNextAsync();break;case"previous":ok=await s.TrySkipPreviousAsync();break;case"seek":ok=await s.TryChangePlaybackPositionAsync((long)(Math.Max(0,r.GetProperty("value").GetDouble())*10000000));break;case"shuffle":ok=await s.TryChangeShuffleActiveAsync(r.GetProperty("value").GetBoolean());break;case"repeat":ok=await s.TryChangeAutoRepeatModeAsync(r.GetProperty("value").GetString() switch{"one"=>MediaPlaybackAutoRepeatMode.Track,"all"=>MediaPlaybackAutoRepeatMode.List,_=>MediaPlaybackAutoRepeatMode.None});break;}}Emit(new{type="result",action,ok});}catch(Exception e){Emit(new{type="error",message=e.Message});}}Environment.Exit(0);});
  while(true){try{await Poll();}catch(Exception e){Emit(new{type="error",message=e.Message});}await Task.Delay(900);}
 }
 static async Task Poll(){
  var s=manager!.GetCurrentSession();if(s==null){Emit(new{type="track",track=(object?)null});return;}
  var p=await s.TryGetMediaPropertiesAsync();var info=s.GetPlaybackInfo();var timeline=s.GetTimelineProperties();var c=info.Controls;
  string key=s.SourceAppUserModelId+"|"+p.Title+"|"+p.Artist;
  if(key!=cacheKey){cacheKey=key;cachedArtwork="";artTime=DateTime.MinValue;}
  if(cachedArtwork==""&&(DateTime.UtcNow-artTime).TotalSeconds>3){artTime=DateTime.UtcNow;try{if(p.Thumbnail!=null){using var input=await p.Thumbnail.OpenReadAsync();if(input.Size<=8000000){using var reader=new DataReader(input);await reader.LoadAsync((uint)input.Size);var data=new byte[(int)input.Size];reader.ReadBytes(data);var mime=input.ContentType;if(mime is "image/jpeg" or "image/png" or "image/webp")cachedArtwork="data:"+mime+";base64,"+Convert.ToBase64String(data);}}}catch{}}
  Emit(new{type="track",track=new{title=p.Title,artist=p.Artist,artwork=cachedArtwork,playing=info.PlaybackStatus==GlobalSystemMediaTransportControlsSessionPlaybackStatus.Playing,position=Math.Max(0,timeline.Position.TotalSeconds),duration=Math.Max(0,timeline.EndTime.TotalSeconds),shuffle=info.IsShuffleActive,repeat=info.AutoRepeatMode?.ToString() switch{"Track"=>"one","List"=>"all","None"=>"off",_=>null},app=s.SourceAppUserModelId,capabilities=new{toggle=c.IsPlayPauseToggleEnabled,next=c.IsNextEnabled,previous=c.IsPreviousEnabled,seek=c.IsPlaybackPositionEnabled,shuffle=c.IsShuffleEnabled,repeat=c.IsRepeatEnabled}}});
 }
}
