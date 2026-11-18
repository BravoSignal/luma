#import <CoreAudio/CATapDescription.h>
#import <CoreAudio/AudioHardwareTapping.h>
#import <stdatomic.h>
typedef struct { _Atomic(float) peak; } LumaMeterState;
@interface LumaAppAudioMeter:NSObject
@property BOOL enabled;@property(strong) NSArray *apps;@property(strong) NSString *currentApp;@property(strong) NSString *state;@property pid_t pid;@property AudioObjectID tap;@property AudioObjectID device;@property AudioDeviceIOProcID io;@property LumaMeterState *meter;@property NSTimeInterval retryAt;
-(NSDictionary*)poll;
-(void)stop;
@end
@implementation LumaAppAudioMeter
-(instancetype)init{if((self=[super init])){_meter=calloc(1,sizeof(LumaMeterState));atomic_init(&_meter->peak,0);_state=@"off";}return self;}
-(void)stop{if(self.device){if(self.io){AudioDeviceStop(self.device,self.io);AudioDeviceDestroyIOProcID(self.device,self.io);self.io=NULL;}AudioHardwareDestroyAggregateDevice(self.device);self.device=0;}if(@available(macOS 14.2,*)){if(self.tap){AudioHardwareDestroyProcessTap(self.tap);self.tap=0;}}atomic_store(&self.meter->peak,0);}
-(void)dealloc{[self stop];free(_meter);}
-(BOOL)start:(NSRunningApplication*)app API_AVAILABLE(macos(14.2)){
 AudioObjectPropertyAddress a={kAudioHardwarePropertyProcessObjectList,kAudioObjectPropertyScopeGlobal,0};UInt32 size=0;NSMutableArray *ids=[NSMutableArray array];
 if(AudioObjectGetPropertyDataSize(kAudioObjectSystemObject,&a,0,NULL,&size)==noErr&&size){AudioObjectID *processes=malloc(size);if(AudioObjectGetPropertyData(kAudioObjectSystemObject,&a,0,NULL,&size,processes)==noErr)for(UInt32 i=0;i<size/sizeof(AudioObjectID);i++){pid_t pid=0;UInt32 n=sizeof(pid);AudioObjectPropertyAddress p={kAudioProcessPropertyPID,kAudioObjectPropertyScopeGlobal,0};AudioObjectGetPropertyData(processes[i],&p,0,NULL,&n,&pid);CFStringRef bundle=NULL;n=sizeof(bundle);p.mSelector=kAudioProcessPropertyBundleID;AudioObjectGetPropertyData(processes[i],&p,0,NULL,&n,&bundle);BOOL matches=pid==app.processIdentifier||(bundle&&[(__bridge NSString*)bundle isEqual:app.bundleIdentifier]);if(bundle)CFRelease(bundle);if(matches)[ids addObject:@(processes[i])];}free(processes);}
 if(!ids.count){self.state=@"waiting";self.retryAt=NSProcessInfo.processInfo.systemUptime+1;return NO;}
 CATapDescription *description=[[CATapDescription alloc]initStereoMixdownOfProcesses:ids];description.privateTap=YES;description.muteBehavior=CATapUnmuted;description.name=@"Luma foreground-app level detection";
 OSStatus err=AudioHardwareCreateProcessTap(description,&_tap);if(err!=noErr){self.state=@"permission-or-device-error";self.retryAt=INFINITY;return NO;}
 AudioStreamBasicDescription format={0};size=sizeof(format);a=(AudioObjectPropertyAddress){kAudioTapPropertyFormat,kAudioObjectPropertyScopeGlobal,0};err=AudioObjectGetPropertyData(self.tap,&a,0,NULL,&size,&format);
 if(err!=noErr||!(format.mFormatFlags&kAudioFormatFlagIsFloat)||format.mBitsPerChannel!=32){self.state=@"unsupported-format";self.retryAt=INFINITY;[self stop];return NO;}
 NSDictionary *aggregate=@{@kAudioAggregateDeviceNameKey:@"Luma private audio meter",@kAudioAggregateDeviceUIDKey:NSUUID.UUID.UUIDString,@kAudioAggregateDeviceIsPrivateKey:@YES,@kAudioAggregateDeviceTapAutoStartKey:@YES,@kAudioAggregateDeviceTapListKey:@[@{@kAudioSubTapUIDKey:description.UUID.UUIDString,@kAudioSubTapDriftCompensationKey:@YES}]};
 err=AudioHardwareCreateAggregateDevice((__bridge CFDictionaryRef)aggregate,&_device);LumaMeterState *meter=self.meter;
 if(err==noErr)err=AudioDeviceCreateIOProcIDWithBlock(&_io,self.device,NULL,^(const AudioTimeStamp *now,const AudioBufferList *input,const AudioTimeStamp *inputTime,AudioBufferList *output,const AudioTimeStamp *outputTime){float peak=0;for(UInt32 b=0;b<input->mNumberBuffers;b++){const AudioBuffer buffer=input->mBuffers[b];const float *samples=buffer.mData;if(!samples)continue;for(UInt32 i=0;i<buffer.mDataByteSize/sizeof(float);i++){float v=fabsf(samples[i]);if(isfinite(v)&&v>peak)peak=v;}}float previous=atomic_load_explicit(&meter->peak,memory_order_relaxed);while(peak>previous&&!atomic_compare_exchange_weak_explicit(&meter->peak,&previous,peak,memory_order_relaxed,memory_order_relaxed)){};});
 if(err==noErr)err=AudioDeviceStart(self.device,self.io);if(err!=noErr){[self stop];self.state=@"permission-or-device-error";self.retryAt=INFINITY;return NO;}self.state=@"ready";return YES;
}
-(NSDictionary*)poll{NSRunningApplication *front=NSWorkspace.sharedWorkspace.frontmostApplication;NSString *app=front.bundleIdentifier?:@"";BOOL eligible=self.enabled&&[self.apps containsObject:app];
 if(!eligible||front.processIdentifier!=self.pid){[self stop];self.pid=eligible?front.processIdentifier:0;self.currentApp=eligible?app:@"";self.retryAt=0;self.state=eligible?@"waiting":self.enabled?@"no-selected-app":@"off";}
 if(eligible&&!self.device&&NSProcessInfo.processInfo.systemUptime>=self.retryAt){if(@available(macOS 14.2,*)){[self start:front];}else{self.state=@"unsupported-os";self.retryAt=INFINITY;}}
 float peak=self.device?atomic_exchange(&self.meter->peak,0):0;return @{@"type":@"app-audio",@"appId":self.currentApp?:@"",@"peak":@(fminf(1,peak)),@"state":self.state?:@"off"};
}
@end
