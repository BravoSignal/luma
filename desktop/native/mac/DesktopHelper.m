#import <AppKit/AppKit.h>
#import <math.h>
static void emit(NSDictionary *obj){NSData *d=[NSJSONSerialization dataWithJSONObject:obj options:0 error:nil];if(d){fwrite(d.bytes,1,d.length,stdout);fputc('\n',stdout);fflush(stdout);}}
@interface WaveView:NSView
@property BOOL playing;@property CGFloat phase;@property(strong) NSColor *accent;
@end
@implementation WaveView
-(void)drawRect:(NSRect)r{[self.accent setFill];for(int i=0;i<4;i++){CGFloat h=self.playing?4+fabs(sin(self.phase+i*.8))*10:3;[[NSBezierPath bezierPathWithRoundedRect:NSMakeRect(3+i*4,NSMidY(self.bounds)-h/2,2,h) xRadius:1 yRadius:1] fill];}}
@end
@interface LumaDesktop:NSObject<NSApplicationDelegate>
@property(strong) NSStatusItem *item;@property(strong) WaveView *wave;@property(strong) NSButton *play;@property(strong) NSMutableData *input;@property(strong) NSDictionary *latest;
@end
@implementation LumaDesktop
-(NSDictionary*)appInfo:(NSRunningApplication*)a{return @{ @"id":a.bundleIdentifier?:a.executableURL.path?:@"",@"name":a.localizedName?:@"Application",@"path":a.bundleURL.path?:@""};}
-(void)front{NSRunningApplication *a=NSWorkspace.sharedWorkspace.frontmostApplication;if(a)emit(@{@"type":@"front-app",@"app":[self appInfo:a]});}
-(void)applicationDidFinishLaunching:(NSNotification*)n{
 self.input=[NSMutableData data];[NSWorkspace.sharedWorkspace.notificationCenter addObserver:self selector:@selector(activated:) name:NSWorkspaceDidActivateApplicationNotification object:nil];[self front];
 __weak LumaDesktop *weak=self;NSFileHandle.fileHandleWithStandardInput.readabilityHandler=^(NSFileHandle *h){NSData *chunk=h.availableData;if(!chunk.length){dispatch_async(dispatch_get_main_queue(),^{[NSApp terminate:nil];});return;}dispatch_async(dispatch_get_main_queue(),^{LumaDesktop *s=weak;if(!s)return;[s.input appendData:chunk];while(YES){const char *bytes=s.input.bytes;NSUInteger count=s.input.length,pos=0;while(pos<count&&bytes[pos]!='\n')pos++;if(pos==count)break;NSData *line=[s.input subdataWithRange:NSMakeRange(0,pos)];[s.input replaceBytesInRange:NSMakeRange(0,pos+1) withBytes:NULL length:0];NSDictionary *m=[NSJSONSerialization JSONObjectWithData:line options:0 error:nil];if([m isKindOfClass:NSDictionary.class])[s command:m];}if(s.input.length>65536)[s.input setLength:0];});};
 [NSTimer scheduledTimerWithTimeInterval:.14 repeats:YES block:^(NSTimer *t){LumaDesktop *s=weak;if(s.wave&&s.item){s.wave.phase+=.5;s.wave.needsDisplay=YES;}}];
}
-(void)activated:(NSNotification*)n{[self front];}
-(NSButton*)button:(NSString*)symbol label:(NSString*)label action:(SEL)action x:(CGFloat)x{
 NSButton *b=[[NSButton alloc]initWithFrame:NSMakeRect(x,1,25,NSStatusBar.systemStatusBar.thickness-2)];b.bordered=NO;b.title=@"";b.imagePosition=NSImageOnly;[b setAccessibilityLabel:label];b.image=[NSImage imageWithSystemSymbolName:symbol accessibilityDescription:label];b.target=self;b.action=action;b.toolTip=label;return b;
}
-(void)command:(NSDictionary*)m{
 if([m[@"type"] isEqual:@"list-apps"]){NSMutableArray *apps=[NSMutableArray array];for(NSRunningApplication *a in NSWorkspace.sharedWorkspace.runningApplications)if(a.activationPolicy==NSApplicationActivationPolicyRegular&&a.bundleIdentifier)[apps addObject:[self appInfo:a]];emit(@{@"type":@"apps",@"apps":apps});return;}
 if(![m[@"type"] isEqual:@"mini"])return;self.latest=m;
 if(![m[@"enabled"] boolValue]){if(self.item){[NSStatusBar.systemStatusBar removeStatusItem:self.item];self.item=nil;self.wave=nil;self.play=nil;}emit(@{@"type":@"mini-state",@"visible":@NO});return;}
 if(!self.item){self.item=[NSStatusBar.systemStatusBar statusItemWithLength:103];NSView *view=[[NSView alloc]initWithFrame:NSMakeRect(0,0,103,NSStatusBar.systemStatusBar.thickness)];self.wave=[[WaveView alloc]initWithFrame:NSMakeRect(0,0,23,NSStatusBar.systemStatusBar.thickness)];[view addSubview:self.wave];[view addSubview:[self button:@"backward.end.fill" label:@"Previous track" action:@selector(previous:) x:23]];self.play=[self button:@"play.fill" label:@"Play / Pause" action:@selector(toggle:) x:48];[view addSubview:self.play];[view addSubview:[self button:@"forward.end.fill" label:@"Next track" action:@selector(next:) x:73]];self.item.view=view;}
 NSString *hex=m[@"accent"]?:@"#c9f3a7";unsigned value=0;NSScanner *scanner=[NSScanner scannerWithString:[hex hasPrefix:@"#"]?[hex substringFromIndex:1]:hex];[scanner scanHexInt:&value];NSColor *color=[NSColor colorWithSRGBRed:((value>>16)&255)/255. green:((value>>8)&255)/255. blue:(value&255)/255. alpha:1];self.wave.accent=color;self.wave.playing=[m[@"playing"] boolValue];for(NSView *v in self.item.view.subviews)if([v isKindOfClass:NSButton.class]){((NSButton*)v).contentTintColor=color;((NSButton*)v).enabled=[m[@"hasTrack"] boolValue];}
 self.play.image=[NSImage imageWithSystemSymbolName:self.wave.playing?@"pause.fill":@"play.fill" accessibilityDescription:@"Play / Pause"];emit(@{@"type":@"mini-state",@"visible":@YES});
}
-(void)previous:(id)s{emit(@{@"type":@"command",@"action":@"previous"});}
-(void)toggle:(id)s{emit(@{@"type":@"command",@"action":@"toggle"});}
-(void)next:(id)s{emit(@{@"type":@"command",@"action":@"next"});}
@end
int main(int argc,char **argv){@autoreleasepool{NSApplication *app=NSApplication.sharedApplication;[app setActivationPolicy:NSApplicationActivationPolicyAccessory];LumaDesktop *delegate=[LumaDesktop new];app.delegate=delegate;if(argc>1&&strcmp(argv[1],"--probe")==0){[delegate front];return 0;}[app run];}return 0;}
