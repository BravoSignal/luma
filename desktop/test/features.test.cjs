const {test}=require('node:test');const assert=require('node:assert/strict');
const {defaults,sanitizeConfig}=require('../app/core.cjs');const {DismissalGate,removeDisplayZone,effectiveConfig,matchingProfile,exportedPreferences,importedPreferences}=require('../app/features.cjs');const {migrateZones,forDisplay}=require('../app/zones.cjs');const {widgetRect}=require('../app/geometry.cjs');
test('dismissed zones rearm only after a continuous outside interval',()=>{const g=new DismissalGate();g.dismiss();assert(g.update(true,false,100,1200));assert(g.update(false,false,150,1200));assert(g.update(false,false,1100,1200));assert(g.update(true,false,1200,1200));assert(g.update(false,false,1300,1200));assert(g.update(false,false,2499,1200));assert.equal(g.update(false,false,2500,1200),false);g.dismiss();assert(g.update(false,true,3000,0));assert.equal(g.update(false,false,3010,0),false);});
test('deleting the final zone stays deleted after restart and independent widget pins survive',()=>{const a={displayId:1,enabled:true,zone:{x:0,y:0,w:.1,h:.1}},b={...a,displayId:2};const c={...defaults,zonesInitialized:true,zones:[a,b],pinnedPositions:{1:{x:.1,y:.2},2:{x:.3,y:.4}}};const removed=removeDisplayZone(c,1);assert.deepEqual(removed.zones,[b]);assert.deepEqual(removed.pinnedPositions,c.pinnedPositions);const none=removeDisplayZone(removed,2);assert.equal(migrateZones(sanitizeConfig(none),1).zones.length,0);});
test('profiles use foreground app identity and restore general preferences without changing them',()=>{const base=sanitizeConfig({holdEnabled:false,profiles:[{id:'edit',appId:'com.editor',name:'Editor',settings:{zoneEnabled:false,holdEnabled:true,orientation:'vertical',verticalWidth:240}}]});const p=matchingProfile(base,'com.editor');const active=effectiveConfig(base,p.id);assert.equal(active.zoneEnabled,false);assert.equal(active.holdEnabled,true);assert.equal(active.verticalWidth,240);assert.equal(base.holdEnabled,false);assert.equal(matchingProfile(base,'com.browser'),null);assert.equal(effectiveConfig(base,null),base);});
test('profile imports reject executable settings and preserve only validated preference fields',()=>{const c=sanitizeConfig({profiles:[{id:'a',appId:'app',settings:{verticalWidth:99999,widgetWidth:-2,key:'EVIL',token:'secret',profiles:[{}],orientation:'vertical'}}]});assert.equal(c.profiles[0].settings.verticalWidth,360);assert.equal(c.profiles[0].settings.widgetWidth,300);assert.equal('token' in c.profiles[0].settings,false);assert.equal('profiles' in c.profiles[0].settings,false);assert.equal('key' in c.profiles[0].settings,false);assert.throws(()=>importedPreferences({config:{}},sanitizeConfig,defaults));assert.deepEqual(importedPreferences(exportedPreferences(c),sanitizeConfig,defaults),c);});
test('vertical widget and display override keep geometry within the selected monitor',()=>{const display={id:2,bounds:{x:-1920,y:0,width:1920,height:1080},workArea:{x:-1920,y:24,width:1920,height:1056}};const c=sanitizeConfig({orientation:'horizontal',displayOverrides:{2:{orientation:'vertical',verticalWidth:224,verticalHeight:430}},zones:[{displayId:2,zone:{x:.99,y:.95,w:.01,h:.05}}]});const r=widgetRect(forDisplay(c,display),display);assert.equal(r.width,224);assert.equal(r.height,430);assert(r.x+r.width<=0);assert(r.y+r.height<=1080);assert.equal(c.orientation,'horizontal');});

test('preference import maps zones and pins to screens on the new computer',()=>{const original=sanitizeConfig({zonesInitialized:true,zones:[{displayId:11,zone:{x:0,y:0,w:.2,h:.1}}],pinnedPositions:{11:{x:.2,y:.3}},displayOverrides:{11:{orientation:'vertical'}}});const exported=exportedPreferences(original,[{id:11,label:'Office',bounds:{width:1920,height:1080}}]);const c=importedPreferences(exported,sanitizeConfig,defaults,[{id:99,label:'Office',bounds:{width:1920,height:1080}}]);assert.equal(c.zones[0].displayId,99);assert.deepEqual(c.pinnedPositions[99],{x:.2,y:.3});assert.equal(c.displayOverrides[99].orientation,'vertical');assert.equal('11' in c.pinnedPositions,false);});

test('Windows mini controls reuse native icons, route commands and remove every icon when disabled',()=>{
 const {createWindowsMini}=require('../app/windows-mini.cjs');const icons=[],commands=[];let opens=0;
 class Tray{constructor(image){this.image=image;this.handlers={};this.dead=false;icons.push(this);}on(name,fn){this.handlers[name]=fn;}setImage(i){this.image=i;}setToolTip(v){this.tip=v;}setContextMenu(m){this.menu=m;}isDestroyed(){return this.dead;}destroy(){this.dead=true;}}
 const mini=createWindowsMini({Tray,nativeImage:{createFromBuffer:b=>b},Menu:{buildFromTemplate:m=>m},onCommand:a=>commands.push(a),onOpen:()=>opens++,onDisable(){}});
 const state={enabled:true,hasTrack:true,playing:false,accent:'#c9f3a7',language:'en'};mini.update(state);assert.equal(icons.length,4);icons[1].handlers.click();icons[2].handlers.click();icons[3].handlers.click();assert.deepEqual(commands,['previous','toggle','next']);const before=icons[2].image;mini.update({...state,playing:true,accent:'#f7bea0'});assert.equal(icons.length,4);assert.notDeepEqual(icons[2].image,before);assert.equal(icons[2].tip,'Pause');mini.update({...state,hasTrack:false});icons[1].handlers.click();assert.equal(commands.length,3);mini.update({...state,enabled:false});assert(icons.every(i=>i.dead));mini.close();
});

test('zone opening delay requires uninterrupted presence on one screen and resets on leave',()=>{
 const {ZoneEntryGate}=require('../app/features.cjs'),g=new ZoneEntryGate();
 assert.equal(g.update(1,100,500),false);
 assert.equal(g.update(1,599,500),false);
 assert.equal(g.update(2,600,500),false);
 assert.equal(g.update(2,1099,500),false);
 assert.equal(g.update(2,1100,500),true);
 assert.equal(g.update(null,1101,500),false);
 assert.equal(g.update(2,1200,500),false);
 g.reset();assert.equal(g.update(1,1201,0),true);
 const c=sanitizeConfig({activationDelay:500,profiles:[{id:'p',appId:'app',settings:{activationDelay:1000}}]});
 assert.equal(effectiveConfig(c,'p').activationDelay,1000);
 assert.equal(effectiveConfig(c,null).activationDelay,500);
});
