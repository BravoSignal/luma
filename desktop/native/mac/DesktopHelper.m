#import <AppKit/AppKit.h>
#import <math.h>
#import <CoreGraphics/CoreGraphics.h>
#import <CoreAudio/CoreAudio.h>
#import <IOKit/hidsystem/IOLLEvent.h>
#import <stdlib.h>
static CGEventFlags modifierMask(CGKeyCode key){switch(key){case 56:return NX_DEVICELSHIFTKEYMASK;case 60:return NX_DEVICERSHIFTKEYMASK;case 59:return NX_DEVICELCTLKEYMASK;case 62:return NX_DEVICERCTLKEYMASK;case 58:return NX_DEVICELALTKEYMASK;case 61:return NX_DEVICERALTKEYMASK;case 55:return NX_DEVICELCMDKEYMASK;case 54:return NX_DEVICERCMDKEYMASK;default:return 0;}}
static BOOL modifierDown(CGKeyCode key,CGEventFlags flags){CGEventFlags mask=modifierMask(key);return mask&&(flags&mask)!=0;}
static void emit(NSDictionary *obj){NSData *d=[NSJSONSerialization dataWithJSONObject:obj options:0 error:nil];if(d){fwrite(d.bytes,1,d.length,stdout);fputc('\n',stdout);fflush(stdout);}}
// Read output volume/mute only. No audio is captured and no device setting is changed.
static CGFloat outputVolume(){AudioObjectID device=kAudioObjectUnknown;UInt32 size=sizeof(device);AudioObjectPropertyAddress a={kAudioHardwarePropertyDefaultOutputDevice,kAudioObjectPropertyScopeGlobal,0};if(AudioObjectGetPropertyData(kAudioObjectSystemObject,&a,0,NULL,&size,&device)!=noErr||device==kAudioObjectUnknown)return 1;
 UInt32 muted=0;size=sizeof(muted);a=(AudioObjectPropertyAddress){kAudioDevicePropertyMute,kAudioDevicePropertyScopeOutput,0};if(AudioObjectHasProperty(device,&a)&&AudioObjectGetPropertyData(device,&a,0,NULL,&size,&muted)==noErr&&muted)return 0;
 Float32 v=1;size=sizeof(v);a=(AudioObjectPropertyAddress){kAudioDevicePropertyVolumeScalar,kAudioDevicePropertyScopeOutput,0};if(AudioObjectHasProperty(device,&a)&&AudioObjectGetPropertyData(device,&a,0,NULL,&size,&v)==noErr&&isfinite(v))return fmax(0,fmin(1,v));
 CGFloat total=0;int count=0;for(UInt32 channel=1;channel<=2;channel++){size=sizeof(v);a.mElement=channel;if(AudioObjectHasProperty(device,&a)&&AudioObjectGetPropertyData(device,&a,0,NULL,&size,&v)==noErr&&isfinite(v)){total+=v;count++;}}return count?fmax(0,fmin(1,total/count)):1;}
static NSImage *whiteSymbol(NSString *name,NSString *label){NSImage *base=[NSImage imageWithSystemSymbolName:name accessibilityDescription:label];NSImage *image=[NSImage imageWithSize:NSMakeSize(15,15) flipped:NO drawingHandler:^BOOL(NSRect rect){[base drawInRect:rect fromRect:NSZeroRect operation:NSCompositingOperationSourceOver fraction:1];[NSColor.whiteColor setFill];NSRectFillUsingOperation(rect,NSCompositingOperationSourceIn);return YES;}];image.template=NO;return image;}
@interface WaveView:NSView{CGFloat levels[4];CGFloat goals[4];NSInteger steps[4];}
@property BOOL playing;@property BOOL animate;@property CGFloat musicVolume;@property CGFloat outputGain;@property NSTimeInterval lastOutputRead;@property CGFloat phase;@property(strong) NSColor *accent;
@end
@implementation WaveView
-(BOOL)acceptsFirstMouse:(NSEvent*)event{return YES;}
-(void)mouseDown:(NSEvent*)event{if(!(event.modifierFlags&NSEventModifierFlagCommand))emit(@{@"type":@"command",@"action":@"show-widget"});}
-(BOOL)accessibilityPerformPress{emit(@{@"type":@"command",@"action":@"show-widget"});return YES;}
-(void)resetCursorRects{[self addCursorRect:self.bounds cursor:NSCursor.pointingHandCursor];}
-(void)advance{NSTimeInterval now=NSProcessInfo.processInfo.systemUptime;if(now-self.lastOutputRead>.25){self.lastOutputRead=now;self.outputGain=outputVolume();}CGFloat volume=fmax(0,fmin(1,self.musicVolume*self.outputGain));BOOL active=self.playing&&volume>0;CGFloat gain=.7+.3*sqrt(volume);BOOL changed=NO;for(int i=0;i<4;i++){CGFloat before=levels[i];if(!active)goals[i]=3;else if(!self.animate)goals[i]=3+gain*(3+(i%3)*3);else if(--steps[i]<=0){goals[i]=3+gain*arc4random_uniform(13);steps[i]=3+arc4random_uniform(9);}if(active&&self.animate)levels[i]+=(goals[i]-levels[i])*.32;else levels[i]=goals[i];if(fabs(levels[i]-before)>.01)changed=YES;}if(changed)self.needsDisplay=YES;}
-(void)drawRect:(NSRect)r{[self.accent setFill];for(int i=0;i<4;i++){CGFloat h=levels[i]>0?levels[i]:3;[[NSBezierPath bezierPathWithRoundedRect:NSMakeRect(3+i*4,NSMidY(self.bounds)-h/2,2,h) xRadius:1 yRadius:1] fill];}}
@end
@interface LumaDesktop:NSObject<NSApplicationDelegate>
@property(strong) NSArray *shortcutGroups;@property NSInteger shortcutGeneration;@property BOOL shortcutHeld;@property BOOL shortcutEnabled;@property NSTimeInterval shortcutSent;@property BOOL keyboardAccess;
@property(strong) NSStatusItem *item;@property(strong) WaveView *wave;@property(strong) NSButton *play;@property(strong) NSMutableData *input;@property(strong) NSDictionary *latest;
@end
@implementation LumaDesktop
-(NSDictionary*)appInfo:(NSRunningApplication*)a{return @{ @"id":a.bundleIdentifier?:a.executableURL.path?:@"",@"name":a.localizedName?:@"Application",@"path":a.bundleURL.path?:@""};}
-(void)front{NSRunningApplication *a=NSWorkspace.sharedWorkspace.frontmostApplication;if(a)emit(@{@"type":@"front-app",@"app":[self appInfo:a]});}
-(void)applicationDidFinishLaunching:(NSNotification*)n{
 self.input=[NSMutableData data];[NSWorkspace.sharedWorkspace.notificationCenter addObserver:self selector:@selector(activated:) name:NSWorkspaceDidActivateApplicationNotification object:nil];[self front];
 __weak LumaDesktop *weak=self;NSFileHandle.fileHandleWithStandardInput.readabilityHandler=^(NSFileHandle *h){NSData *chunk=h.availableData;if(!chunk.length){dispatch_async(dispatch_get_main_queue(),^{[NSApp terminate:nil];});return;}dispatch_async(dispatch_get_main_queue(),^{LumaDesktop *s=weak;if(!s)return;[s.input appendData:chunk];while(YES){const char *bytes=s.input.bytes;NSUInteger count=s.input.length,pos=0;while(pos<count&&bytes[pos]!='\n')pos++;if(pos==count)break;NSData *line=[s.input subdataWithRange:NSMakeRange(0,pos)];[s.input replaceBytesInRange:NSMakeRange(0,pos+1) withBytes:NULL length:0];NSDictionary *m=[NSJSONSerialization JSONObjectWithData:line options:0 error:nil];if([m isKindOfClass:NSDictionary.class])[s command:m];}if(s.input.length>65536)[s.input setLength:0];});};
 [NSTimer scheduledTimerWithTimeInterval:.025 repeats:YES block:^(NSTimer *t){[weak pollShortcut];}];
 [NSTimer scheduledTimerWithTimeInterval:.06 repeats:YES block:^(NSTimer *t){LumaDesktop *s=weak;if(s.wave&&s.item){[s.wave advance];}}];
}
-(void)pollShortcut{
 if(!self.shortcutEnabled)return;
 NSTimeInterval now=NSProcessInfo.processInfo.systemUptime;if(now-self.shortcutSent>1)self.keyboardAccess=CGPreflightListenEventAccess();
 CGEventFlags flags=self.keyboardAccess?(CGEventSourceFlagsState(kCGEventSourceStateHIDSystemState)|CGEventSourceFlagsState(kCGEventSourceStateCombinedSessionState)):0;
 BOOL down=self.keyboardAccess;for(NSArray *group in self.keyboardAccess?self.shortcutGroups:@[]){BOOL any=NO;for(NSNumber *key in group)if(modifierMask(key.unsignedShortValue)?modifierDown(key.unsignedShortValue,flags):(CGEventSourceKeyState(kCGEventSourceStateHIDSystemState,key.unsignedShortValue)||CGEventSourceKeyState(kCGEventSourceStateCombinedSessionState,key.unsignedShortValue))){any=YES;break;}if(!any){down=NO;break;}}
 if(down!=self.shortcutHeld||now-self.shortcutSent>1){self.shortcutHeld=down;self.shortcutSent=now;emit(@{@"type":@"shortcut-state",@"held":@(down),@"generation":@(self.shortcutGeneration),@"inputMonitoring":@(CGPreflightListenEventAccess())});}
}
-(void)activated:(NSNotification*)n{[self front];}
-(NSButton*)button:(NSString*)symbol label:(NSString*)label action:(SEL)action x:(CGFloat)x{
 NSButton *b=[[NSButton alloc]initWithFrame:NSMakeRect(x,1,25,NSStatusBar.systemStatusBar.thickness-2)];b.bordered=NO;b.title=@"";b.imagePosition=NSImageOnly;[b setAccessibilityLabel:label];b.image=whiteSymbol(symbol,label);b.contentTintColor=NSColor.whiteColor;b.target=self;b.action=action;b.toolTip=label;return b;
}
-(void)command:(NSDictionary*)m{
 if([m[@"type"] isEqual:@"shortcut-config"]){self.shortcutEnabled=NO;self.shortcutHeld=NO;self.shortcutSent=0;self.shortcutGeneration=[m[@"generation"] integerValue];self.keyboardAccess=CGPreflightListenEventAccess();NSArray *groups=m[@"groups"];BOOL valid=[groups isKindOfClass:NSArray.class]&&groups.count>0&&groups.count<=5;for(id group in valid?groups:@[]){if(![group isKindOfClass:NSArray.class]||[group count]<1||[group count]>2){valid=NO;break;}for(id key in group)if(![key isKindOfClass:NSNumber.class]||[key integerValue]<0||[key integerValue]>127){valid=NO;break;}}
 self.shortcutGroups=valid?groups:@[];self.shortcutEnabled=valid&&[m[@"enabled"] boolValue];emit(@{@"type":@"shortcut-state",@"held":@NO,@"generation":@(self.shortcutGeneration),@"inputMonitoring":@(CGPreflightListenEventAccess())});return;}

 if([m[@"type"] isEqual:@"list-apps"]){NSMutableArray *apps=[NSMutableArray array];for(NSRunningApplication *a in NSWorkspace.sharedWorkspace.runningApplications)if(a.activationPolicy==NSApplicationActivationPolicyRegular&&a.bundleIdentifier)[apps addObject:[self appInfo:a]];emit(@{@"type":@"apps",@"apps":apps});return;}
 if(![m[@"type"] isEqual:@"mini"])return;self.latest=m;
 if(![m[@"enabled"] boolValue]){if(self.item){[NSStatusBar.systemStatusBar removeStatusItem:self.item];self.item=nil;self.wave=nil;self.play=nil;}emit(@{@"type":@"mini-state",@"visible":@NO});return;}
 if(!self.item){self.item=[NSStatusBar.systemStatusBar statusItemWithLength:103];NSView *view=[[NSView alloc]initWithFrame:NSMakeRect(0,0,103,NSStatusBar.systemStatusBar.thickness)];self.wave=[[WaveView alloc]initWithFrame:NSMakeRect(0,0,23,NSStatusBar.systemStatusBar.thickness)];[self.wave setAccessibilityElement:YES];[self.wave setAccessibilityRole:NSAccessibilityButtonRole];[self.wave setAccessibilityLabel:@"Show music widget"];self.wave.toolTip=@"Show music widget";[view addSubview:self.wave];[view addSubview:[self button:@"backward.end.fill" label:@"Previous track" action:@selector(previous:) x:23]];self.play=[self button:@"play.fill" label:@"Play / Pause" action:@selector(toggle:) x:48];[view addSubview:self.play];[view addSubview:[self button:@"forward.end.fill" label:@"Next track" action:@selector(next:) x:73]];self.item.view=view;}
 NSString *hex=m[@"accent"]?:@"#c9f3a7";unsigned value=0;NSScanner *scanner=[NSScanner scannerWithString:[hex hasPrefix:@"#"]?[hex substringFromIndex:1]:hex];[scanner scanHexInt:&value];NSColor *color=[NSColor colorWithSRGBRed:((value>>16)&255)/255. green:((value>>8)&255)/255. blue:(value&255)/255. alpha:1];self.wave.accent=NSColor.whiteColor;self.wave.playing=[m[@"playing"] boolValue];self.wave.musicVolume=m[@"volume"]?[m[@"volume"] doubleValue]:1;NSString *motion=m[@"motion"]?:@"system";self.wave.animate=![motion isEqual:@"reduced"]&&(![motion isEqual:@"system"]||!NSWorkspace.sharedWorkspace.accessibilityDisplayShouldReduceMotion);for(NSView *v in self.item.view.subviews)if([v isKindOfClass:NSButton.class]){((NSButton*)v).contentTintColor=NSColor.whiteColor;((NSButton*)v).enabled=[m[@"hasTrack"] boolValue];}
 self.play.image=whiteSymbol(self.wave.playing?@"pause.fill":@"play.fill",@"Play / Pause");emit(@{@"type":@"mini-state",@"visible":@YES});
}
-(void)previous:(id)s{emit(@{@"type":@"command",@"action":@"previous"});}
-(void)toggle:(id)s{emit(@{@"type":@"command",@"action":@"toggle"});}
-(void)next:(id)s{emit(@{@"type":@"command",@"action":@"next"});}
@end
int main(int argc,char **argv){if(argc==4&&strcmp(argv[1],"--modifier-state")==0){printf("%s\n",modifierDown((CGKeyCode)strtoul(argv[2],NULL,0),(CGEventFlags)strtoull(argv[3],NULL,0))?"down":"up");return 0;}@autoreleasepool{NSApplication *app=NSApplication.sharedApplication;[app setActivationPolicy:NSApplicationActivationPolicyAccessory];LumaDesktop *delegate=[LumaDesktop new];app.delegate=delegate;if(argc>1&&strcmp(argv[1],"--probe")==0){[delegate front];return 0;}[app run];}return 0;}
