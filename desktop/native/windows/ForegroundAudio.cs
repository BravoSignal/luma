using System.Diagnostics;
using System.Runtime.InteropServices;
using NAudio.CoreAudioApi;
// Reads WASAPI session peaks only; never opens a recorder or changes device settings.
static class ForegroundAudio {
 [DllImport("user32.dll")] static extern IntPtr GetForegroundWindow();
 [DllImport("user32.dll")] static extern uint GetWindowThreadProcessId(IntPtr window,out uint pid);
 static readonly object gate=new();static string[] apps=Array.Empty<string>();static bool enabled;
 public static void Configure(bool on,string[] ids){lock(gate){enabled=on;apps=ids;}}
 public static object Poll(){string id="";try{GetWindowThreadProcessId(GetForegroundWindow(),out var pid);using var p=Process.GetProcessById((int)pid);id=(p.MainModule?.FileName??p.ProcessName).ToLowerInvariant();lock(gate){if(!enabled)return new{type="app-audio",appId="",peak=0f,state="off"};if(!apps.Contains(id))return new{type="app-audio",appId="",peak=0f,state="no-selected-app"};}
 float peak=0;using var enumerator=new MMDeviceEnumerator();foreach(var device in enumerator.EnumerateAudioEndPoints(DataFlow.Render,DeviceState.Active)){using(device){var sessions=device.AudioSessionManager.Sessions;for(int i=0;i<sessions.Count;i++){using var session=sessions[i];if(session.GetProcessID!=pid)continue;var volume=session.SimpleAudioVolume;if(volume?.Mute==true)continue;peak=Math.Max(peak,(session.AudioMeterInformation?.MasterPeakValue??0)*(volume?.Volume??1));}}}return new{type="app-audio",appId=id,peak=Math.Clamp(peak,0,1),state="ready"};
 }catch{return new{type="app-audio",appId=id,peak=0f,state="device-error"};}}
}
