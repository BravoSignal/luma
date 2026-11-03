const overlayMode = new URLSearchParams(location.search).get('view') === 'overlay';
if(overlayMode) document.documentElement.classList.add('overlay-mode');
let dragGesture=null,suppressSurfaceClick=false,queueOpen=false,queueItems=[],queueMessage='',queueTrack='',tutorialShown=false,tutorialStep=0,zoneSignature='',noticeTimer,resizeTimer,lastTarget=0,lastFull=null,state, toastTimer, hovering=false, manualExpanded=null, artColor='#c9f3a7',recording=false,modifierCandidate=null;
const $ = id=>document.getElementById(id);
const paths={move:'<path d="m8 5 4-4 4 4M12 1v22m-4-4 4 4 4-4M5 8l-4 4 4 4M1 12h22m-4-4 4 4-4 4"/>',pin:'<path d="M8 3h8M9 3v6l-3 4v2h12v-2l-3-4V3M12 15v7"/>',like:'<path d="M7 10v11H3V10zm0 0 6-7c2 0 2 4 0 7h6a2 2 0 0 1 2 3l-2 7H7"/>',dislike:'<path d="M7 14V3H3v11zm0 0 6 7c2 0 2-4 0-7h6a2 2 0 0 0 2-3l-2-7H7"/>',playlist:'<path d="M3 5h12M3 10h12M3 15h7m7-3v10m-5-5h10"/>',previous:'<path d="M5 5v14M19 5l-10 7 10 7z"/>',next:'<path d="M19 5v14M5 5l10 7-10 7z"/>',play:'<path d="m8 5 11 7-11 7z"/>',pause:'<path d="M8 5v14M16 5v14"/>',shuffle:'<path d="M3 6h3c4 0 7 12 11 12h4m-4-4 4 4-4 4M3 18h3c1.5 0 2.7-1.5 4-3.5M14 8.5C15 7 16 6 17 6h4m-4-4 4 4-4 4"/>',repeat:'<path d="m16 2 4 4-4 4M4 11V9a3 3 0 0 1 3-3h13M8 22l-4-4 4-4m12-1v2a3 3 0 0 1-3 3H4"/>',down:'<path d="m6 9 6 6 6-6"/>',up:'<path d="m6 15 6-6 6 6"/>',close:'<path d="m6 6 12 12M6 18 18 6"/>',settings:'<path d="M3 6h4m4 0h10M3 18h10m4 0h4"/><circle cx="9" cy="6" r="2"/><circle cx="15" cy="18" r="2"/>',volume:'<path d="M11 5 6 9H3v6h3l5 4zM15 8c3 2 3 6 0 8m3-11c5 4 5 10 0 14"/>'};
const icon=name=>'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'+paths[name]+'</svg>';
function player(){
 const card=document.createElement('div');card.className='music-card';
 card.innerHTML=`<div class="cover"><img hidden alt="Cover-Hintergrund"></div><div class="card-head"><span class="card-source"><span class="source-dot">${icon('play')}</span> YOUTUBE MUSIC</span><div class="bars"><i></i><i></i><i></i><i></i></div><div class="head-actions"><button class="pin-widget" aria-label="Position merken" title="Position merken">${icon('pin')}</button><button class="expand-button" aria-label="Widget erweitern" title="Mehr anzeigen">${icon('down')}</button><button class="card-settings" aria-label="Einstellungen öffnen" title="Einstellungen">${icon('settings')}</button><button class="close-widget" aria-label="Widget schließen" title="Widget ausblenden">${icon('close')}</button></div></div><div class="track-row"><div class="front-cover"><img hidden alt="Albumcover"></div><div class="track-info"><button class="song" aria-label="YouTube Music nach vorne holen"></button><div class="artist"></div></div></div><div class="secondary-controls"><button data-action="like" aria-label="Daumen hoch">${icon('like')}</button><button data-action="dislike" aria-label="Daumen runter">${icon('dislike')}</button><button data-action="playlist" class="playlist-button" aria-label="Zur Playlist hinzufügen">${icon('playlist')}<span>Zur Playlist</span></button></div><div class="transport"><button data-action="shuffle" class="shuffle" aria-label="Shuffle">${icon('shuffle')}</button><button data-action="previous" aria-label="Vorheriger Titel">${icon('previous')}</button><button class="play" data-action="toggle" aria-label="Wiedergabe umschalten">${icon('play')}</button><button data-action="next" aria-label="Nächster Titel">${icon('next')}</button><button data-action="repeat" class="repeat" aria-label="Wiederholen">${icon('repeat')}<sup></sup></button></div><div class="timeline"><span class="elapsed">0:00</span><input type="range" min="0" max="1000" value="0" aria-label="Wiedergabeposition"><span class="duration">0:00</span></div><div class="volume-row"><span>${icon('volume')}</span><input class="volume" type="range" min="0" max="100" aria-label="Lautstärke"><span class="volume-label">0 %</span></div><button class="queue-toggle" aria-expanded="false">Als Nächstes <span>⌄</span></button><section class="queue-panel hidden" aria-label="Als Nächstes"><p class="queue-status"></p><ol></ol></section><div class="widget-notice hidden" role="status"><strong>Browser-Erweiterung benötigt</strong><p>Verbinde YouTube Music mit Luma, um diese Funktion zu verwenden.</p><button class="notice-setup">Verbindung öffnen ↗</button><button class="notice-dismiss" aria-label="Hinweis schließen">×</button></div>`;
 card.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>{const a=b.dataset.action;if(needsExtension(a)){extensionHint();return;}window.luma.command(a,a==='shuffle'?!state?.track?.shuffle:a==='repeat'?({off:'all',all:'one',one:'off'})[state?.track?.repeat||'off']:undefined);});
 const expand=async()=>{if(overlayMode){const next=await window.luma.action('expand');if(next)render(next);}else{manualExpanded=!(manualExpanded??(state?.held&&hovering));updateSize();}};
 card.querySelector('.expand-button').onclick=expand;
 const interactive='button,input,a,.widget-notice,.queue-panel';
 card.addEventListener('pointerdown',e=>{
  if(e.button!==0||e.target.closest(interactive))return;
  suppressSurfaceClick=false;dragGesture={id:e.pointerId,x:window.screenX+e.clientX,y:window.screenY+e.clientY,moved:false,full:!card.classList.contains('compact')};
  card.setPointerCapture(e.pointerId);if(overlayMode)window.luma.drag({phase:'start'});
 });
 card.addEventListener('pointermove',e=>{
  if(!dragGesture||e.pointerId!==dragGesture.id)return;
  const dx=window.screenX+e.clientX-dragGesture.x,dy=window.screenY+e.clientY-dragGesture.y;
  if(Math.hypot(dx,dy)>=5)dragGesture.moved=true;
  if(dragGesture.moved){card.classList.add('dragging');suppressSurfaceClick=true;if(overlayMode)window.luma.drag({phase:'move',dx,dy});}
 });
 const endDrag=e=>{if(!dragGesture||e.pointerId!==dragGesture.id)return;suppressSurfaceClick=dragGesture.moved||e.type==='pointercancel';dragGesture=null;card.classList.remove('dragging');if(overlayMode)window.luma.drag({phase:e.type==='pointercancel'?'cancel':'end'});if(card.hasPointerCapture(e.pointerId))card.releasePointerCapture(e.pointerId);};
 card.addEventListener('pointerup',endDrag);card.addEventListener('pointercancel',endDrag);card.addEventListener('lostpointercapture',endDrag);
 card.addEventListener('click',e=>{if(e.target.closest(interactive))return;if(suppressSurfaceClick){suppressSurfaceClick=false;return;}if(card.classList.contains('compact'))expand();});
 card.querySelector('.song').onclick=()=>{if(needsExtension('focus'))extensionHint();else window.luma.command('focus');};
 card.querySelector('.queue-toggle').onclick=()=>{if(needsExtension('queue')){extensionHint();return;}queueOpen=!queueOpen;if(queueOpen){queueMessage='Warteschlange wird geladen …';queueItems=[];window.luma.command('queue');}renderQueue();updateSize();};
 card.querySelector('.close-widget').onclick=()=>{manualExpanded=null;window.luma.action('dismiss');updateSize();if(!overlayMode)toast('Widget ausgeblendet. Musik läuft weiter.');};
 card.querySelector('.notice-setup').onclick=()=>window.luma.action('connection');card.querySelector('.notice-dismiss').onclick=()=>card.querySelector('.widget-notice').classList.add('hidden');
 card.querySelector('.pin-widget').onclick=async()=>{const next=await window.luma.action('pin');if(next)render(next);};
 card.querySelector('.card-settings').onclick=()=>window.luma.action('settings');
 card.querySelector('.volume').addEventListener('pointerdown',e=>{if(needsExtension('volume')){e.preventDefault();extensionHint();}});
 card.querySelector('.volume').addEventListener('input',e=>{if(needsExtension('volume')){extensionHint();return;}card.querySelector('.volume-label').textContent=e.target.value+' %';window.luma.command('volume',Number(e.target.value)/100);});
 card.querySelector('input').addEventListener('change',e=>{if(state?.track?.duration)window.luma.command('seek',Number(e.target.value)/1000*state.track.duration);});
 return card;
}
const card=player();$(overlayMode?'overlay-root':'preview-card').append(card);
card.addEventListener('pointerenter',()=>{hovering=true;updateSize();});
card.addEventListener('pointerleave',()=>{hovering=false;if(manualExpanded===false)manualExpanded=null;updateSize();});
function updateSize(){
 if(!state)return;
 const full=dragGesture?dragGesture.full:((overlayMode?state.expandedByButton:manualExpanded)??!!(state.held&&(overlayMode?state.hovered:hovering)));
 const geometry=state.geometry||{width:394,height:110};
 card.classList.toggle('compact',!full);card.classList.toggle('edge-top',overlayMode&&!!state.atTopEdge);
 const button=card.querySelector('.expand-button');button.innerHTML=icon(full?'up':'down');button.setAttribute('aria-expanded',String(full));button.setAttribute('aria-label',full?'Widget einklappen':'Widget erweitern');
 const base=overlayMode?geometry.height:(state.config.widgetHeight||108);
 const target=full?Math.max(370,base+240)+(queueOpen?180:0):base;
 card.classList.toggle('layout-stacked',state.config.compactLayout==='stacked');card.classList.toggle('layout-inline',state.config.compactLayout!=='stacked');card.classList.toggle('tight',base<116);card.classList.toggle('micro',base<104);card.classList.toggle('compact-likes',state.config.compactLayout==='stacked'?geometry.width>=340:geometry.width>=500);
 card.dataset.textStyle=state.config.textStyle;card.style.setProperty('--tracking',(state.config.letterSpacing??-.2)+'px');
 const pin=card.querySelector('.pin-widget');pin.classList.toggle('enabled',!!state.pinned);pin.title=state.pinned?'Position lösen':'Aktuelle Position merken';pin.setAttribute('aria-pressed',String(!!state.pinned));
 card.style.height=target+'px';
 if(overlayMode){document.getElementById('overlay-root').style.width=geometry.width+'px';if(target!==lastTarget||full!==lastFull){clearTimeout(resizeTimer);if(full)window.luma.height(target);else resizeTimer=setTimeout(()=>window.luma.height(target),190);}}
 else card.style.width=Math.min(440,state.config.widgetWidth||400)+'px';
 lastTarget=target;lastFull=full;
}
function applyColor(){if(!state)return;const color=({auto:artColor,mint:'#c9f3a7',lilac:'#cbb5f8',peach:'#f7bea0',custom:state.config.customColor})[state.config.accent]||artColor;document.documentElement.style.setProperty('--accent',color);const n=parseInt(color.slice(1),16);document.documentElement.style.setProperty('--accent-rgb',`${n>>16},${(n>>8)&255},${n&255}`);}
function extractColor(img){try{const canvas=document.createElement('canvas');canvas.width=32;canvas.height=32;const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,32,32);const data=ctx.getImageData(0,0,32,32).data;let r=0,g=0,b=0,sum=0;for(let i=0;i<data.length;i+=4){const max=Math.max(data[i],data[i+1],data[i+2]),min=Math.min(data[i],data[i+1],data[i+2]);if(max<35||min>235)continue;const w=(max-min+20)/255;r+=data[i]*w;g+=data[i+1]*w;b+=data[i+2]*w;sum+=w;}if(!sum)return;const rgb=[r/sum,g/sum,b/sum];const max=Math.max(...rgb);const lifted=rgb.map(v=>Math.round(125+(v/(max||1))*110));artColor='#'+lifted.map(v=>v.toString(16).padStart(2,'0')).join('');applyColor();}catch{artColor='#c9f3a7';applyColor();}}
card.querySelector('.cover img').onload=e=>extractColor(e.target);
function needsExtension(action){const t=state?.track;return ['like','dislike','playlist','volume','focus','queue'].includes(action)?t?.source!=='extension':['shuffle','repeat'].includes(action)&&t?.capabilities?.[action]!==true&&t?.source!=='extension';}
function extensionHint(){clearTimeout(noticeTimer);card.querySelector('.widget-notice').classList.remove('hidden');noticeTimer=setTimeout(()=>card.querySelector('.widget-notice').classList.add('hidden'),7000);}
window.luma.onResult(r=>{if(r.action==='queue'){queueItems=r.items||[];queueMessage=r.ok?(queueItems.length?'':'Keine weiteren Songs in der geladenen Warteschlange.'):'Die Warteschlange ist im Browser noch nicht geladen. Öffne dort „Als Nächstes“ und versuche es erneut.';renderQueue();return;}if(r.ok===false){if(r.reason==='extension-required'){extensionHint();return;}toast('Dieser Player hat den Befehl nicht bestätigt.');card.classList.add('command-failed');setTimeout(()=>card.classList.remove('command-failed'),2200);}});

function renderQueue(){card.querySelector('.queue-panel').classList.toggle('hidden',!queueOpen);card.querySelector('.queue-toggle').setAttribute('aria-expanded',String(queueOpen));card.querySelector('.queue-status').textContent=queueMessage;card.querySelector('.queue-panel ol').replaceChildren(...queueItems.map(item=>{const li=document.createElement('li'),title=document.createElement('strong'),artist=document.createElement('small');title.textContent=item.title;artist.textContent=item.artist;li.append(title,artist);return li;}));}
function time(seconds){if(!Number.isFinite(seconds)||seconds<0)return '0:00';return `${Math.floor(seconds/60)}:${String(Math.floor(seconds%60)).padStart(2,'0')}`;}
function updatePlayer(){
 const identity=state?.track?.title+'|'+state?.track?.artist;if(queueTrack!==identity){queueTrack=identity;queueItems=[];queueMessage='Zum Aktualisieren „Als Nächstes“ erneut öffnen.';renderQueue();}
 const t=state?.track, demo=!t&&!overlayMode, connected=state?.status?.connected;
 card.classList.toggle('playing',t?.playing===true);
 card.querySelector('.song').textContent=t?.title||(demo?'Dein nächster Lieblingssong':'Bereit für deinen Sound');
 card.querySelector('.song').title=t?.title||'';card.querySelector('.artist').title=t?.artist||'';
 card.querySelector('.artist').textContent=t?.artist||(demo?'Deine Musik · dein Moment':connected?'Starte einen Titel in YouTube Music':'Starte YouTube Music in deinem Browser');
 for(const img of card.querySelectorAll('img')){if(t?.artwork){if(img.getAttribute('src')!==t.artwork)img.src=t.artwork;img.hidden=false;}else{img.hidden=true;img.removeAttribute('src');}img.onerror=()=>{img.hidden=true;};}
 card.querySelector('.play').innerHTML=icon(t?.playing?'pause':'play');
 card.querySelectorAll('[data-action]').forEach(b=>{const extra=['shuffle','repeat','like','dislike','playlist'].includes(b.dataset.action);b.disabled=!extra&&(!t||t.capabilities?.[b.dataset.action]===false);b.classList.toggle('needs-extension',needsExtension(b.dataset.action));b.title=needsExtension(b.dataset.action)?'Browser-Erweiterung benötigt':({shuffle:'Shuffle',repeat:'Wiederholung',previous:'Vorheriger Titel',next:'Nächster Titel',toggle:'Play / Pause',like:'Daumen hoch',dislike:'Daumen runter',playlist:'Zur Playlist hinzufügen'})[b.dataset.action];});
 card.querySelector('[data-action=like]').classList.toggle('enabled',t?.like==='LIKE');card.querySelector('[data-action=dislike]').classList.toggle('enabled',t?.like==='DISLIKE');
 card.querySelector('.shuffle').classList.toggle('enabled',t?.shuffle===true);
 card.querySelector('.repeat').classList.toggle('enabled',!!t?.repeat&&t.repeat!=='off');
 card.querySelector('.repeat sup').textContent=t?.repeat==='one'?'1':'';
 const volume=card.querySelector('.volume');volume.disabled=false;volume.title=needsExtension('volume')?'Browser-Erweiterung benötigt':'Lautstärke';if(document.activeElement!==volume)volume.value=Math.round((t?.volume??0)*100);card.querySelector('.volume-label').textContent=volume.value+' %';
 card.querySelector('.timeline input').disabled=!t?.duration||t.capabilities?.seek===false;
 
 card.querySelector('.card-head .card-source').lastChild.textContent=demo?' DESIGN-VORSCHAU':(t?.source==='extension'?' YOUTUBE MUSIC':' SYSTEM AUDIO');
 updateSize();tick();
}
function tick(){if(!state)return;const t=state.track;const pos=t?Math.min(t.duration||Infinity,t.position+(t.playing?(Date.now()-t.updatedAt)/1000:0)):0;card.querySelector('.elapsed').textContent=time(pos);card.querySelector('.duration').textContent=time(t?.duration||0);if(document.activeElement!==card.querySelector('input'))card.querySelector('input').value=t?.duration?pos/t.duration*1000:0;}
function render(s){if(overlayMode&&!s.visible){manualExpanded=null;hovering=false;}state=s;applyColor();updatePlayer();if(overlayMode)return;
 for(const key of ['zoneEnabled','holdEnabled','autoStart'])$(key).checked=s.config[key];
 $('hideDelay').value=String(s.config.hideDelay);if(!recording)$('bind-key').textContent=(s.bindingLabel||'F8')+' · Ändern';
 for(const k of ['compactLayout','textStyle'])$(k).value=s.config[k];$('letterSpacing').value=s.config.letterSpacing;$('letterSpacing-value').textContent=s.config.letterSpacing+' px';$('connection-success').classList.toggle('hidden',!s.status.extensionConnected);renderZones(s);
 $('customColor').value=s.config.customColor; $('extension-status').textContent=s.status.extensionConnected?'Erweiterung verbunden ✓':'Erweiterung noch nicht verbunden';
 $('status').textContent=s.status.error?'Verbindung prüfen':s.status.extensionConnected?'YouTube Music verbunden':s.status.connected?'System-Medien verbunden':'Warte auf Musik';$('status-dot').classList.toggle('connected',s.status.connected);
 for(const k of ['widgetWidth','widgetHeight']){if(document.activeElement!==$(k))$(k).value=s.config[k];$(k+'-value').textContent=s.config[k]+' px';}$('extension-path').value=s.extensionPath||'';
 const g=s.activationGeometry||s.geometry;$('zone-info').textContent=g?`${g.width} × ${g.height} px · Position ${g.x}, ${g.y}`:'Position und Größe direkt auf dem Bildschirm wählen';
 document.querySelectorAll('[data-accent]').forEach(b=>b.classList.toggle('selected',b.dataset.accent===s.config.accent));
 if(!tutorialShown&&s.config.onboardingVersion<1){tutorialShown=true;showTutorial();}
 const error=s.status.hookError||s.status.error;$('hook-error').classList.toggle('hidden',!error);$('hook-error').replaceChildren();if(error){$('hook-error').textContent=error;if(s.platform==='darwin'&&s.status.hookError){const b=document.createElement('button');b.textContent='Bedienungshilfen öffnen ↗';b.onclick=()=>window.luma.action('accessibility');$('hook-error').append(b);}}
}
function safeColor(){return state?.config.customColor||'#b6dce8';}
function toast(t){$('toast').textContent=t;$('toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),2200);}
async function save(c){render(await window.luma.save(c));toast('Gespeichert. Ganz dein Stil.');}
if(!overlayMode){
 for(const k of ['zoneEnabled','holdEnabled','autoStart'])$(k).onchange=e=>save({[k]:e.target.checked});
 for(const k of ['widgetWidth','widgetHeight']){$(k).oninput=e=>$(k+'-value').textContent=e.target.value+' px';$(k).onchange=e=>save({[k]:Number(e.target.value)});}
for(const k of ['compactLayout','textStyle'])$(k).onchange=e=>save({[k]:e.target.value});$('letterSpacing').oninput=e=>$('letterSpacing-value').textContent=e.target.value+' px';$('letterSpacing').onchange=e=>save({letterSpacing:Number(e.target.value)});$('show-tutorial').onclick=showTutorial;$('tutorial-next').onclick=nextTutorial;$('tutorial-skip').onclick=finishTutorial;
 $('hideDelay').onchange=e=>save({hideDelay:Number(e.target.value)});
 $('bind-key').onclick=startRecording;$('cancel-binding').onclick=stopRecording;
 document.querySelectorAll('[data-accent]').forEach(b=>b.onclick=()=>save({accent:b.dataset.accent}));
 $('customColor').value=safeColor();$('customColor').onchange=e=>save({customColor:e.target.value,accent:'custom'});
 $('select-zone').onclick=()=>window.luma.selectZone();$('edit-layout').onclick=()=>window.luma.selectZone();
 for(const id of ['preview','show-widget'])$(id).onclick=()=>window.luma.action('preview');
 $('copy-token').onclick=async()=>{await window.luma.action('copy');toast('Kopplungscode kopiert.');};
 $('open-extension').onclick=async()=>{const path=await window.luma.action('extension');if(path)$('extension-path').value=path;toast('Ordner bereit. Jetzt „Entpackte Erweiterung laden“ in Chrome wählen.');};$('copy-extension-path').onclick=async()=>{await window.luma.action('copy-extension-path');toast('Ordnerpfad kopiert. Im Auswahlfenster ⌘ + Shift + G drücken.');};$('copy-chrome-address').onclick=async()=>{await window.luma.action('copy-chrome-address');toast('Adresse kopiert. In die Chrome-Adresszeile einfügen.');}; $('open-music').onclick=()=>window.luma.action('music');
 document.querySelectorAll('[data-section]').forEach(b=>b.onclick=()=>{document.querySelectorAll('.nav').forEach(n=>n.classList.toggle('active',n===b));$(b.dataset.section).scrollIntoView({behavior:'smooth',block:'start'});});
}
function startRecording(){recording=true;modifierCandidate=null;window.luma.action('record-start');$('bind-key').textContent='Jetzt Taste drücken …';$('bind-key').classList.add('recording');$('binding-hint').textContent='Taste oder Kombination drücken. Einzelne Zusatztaste: drücken und loslassen.';$('cancel-binding').classList.remove('hidden');}
function stopRecording(){recording=false;modifierCandidate=null;window.luma.action('record-stop');$('bind-key').classList.remove('recording');$('cancel-binding').classList.add('hidden');$('binding-hint').textContent='Einzeltaste oder Kombination · nur solange gehalten';$('bind-key').textContent=(state?.bindingLabel||'F8')+' · Ändern';}
function bindingEvent(e){return{code:e.code,ctrl:e.ctrlKey,alt:e.altKey,shift:e.shiftKey,meta:e.metaKey};}
async function bind(b){const next=await window.luma.save({binding:b});if(next.config.binding.code!==b.code){toast('Diese Taste wird vom System nicht unterstützt. Wähle eine andere.');return;}stopRecording();render(next);toast('Neue Halte-Taste gespeichert.');}
window.addEventListener('keydown',e=>{if(!recording)return;e.preventDefault();e.stopPropagation();if(e.repeat)return;if(/^(Control|Alt|Shift|Meta)(Left|Right)$/.test(e.code)){modifierCandidate=bindingEvent(e);return;}modifierCandidate=null;bind(bindingEvent(e));},true);
window.addEventListener('keyup',e=>{if(!recording)return;e.preventDefault();e.stopPropagation();if(modifierCandidate?.code===e.code)bind(modifierCandidate);},true);
window.addEventListener('blur',()=>{if(recording)stopRecording();});
function renderZones(s){const signature=JSON.stringify(s.displays)+JSON.stringify(s.config.zones);if(signature===zoneSignature)return;zoneSignature=signature;$('display-zones').replaceChildren(...s.displays.map(d=>{const row=document.createElement('div');row.className='display-zone';const info=document.createElement('div'),name=document.createElement('strong'),detail=document.createElement('small');name.textContent=d.label;detail.textContent=d.zone?(d.zone.edgeTop?'Randbündig am oberen Bildschirmrand':'Eigener Aktivierungsbereich eingerichtet'):'Noch kein Aktivierungsbereich';info.append(name,detail);const button=document.createElement('button');button.className='outline';button.textContent=d.zone?'Bereich bearbeiten ↗':'Bereich wählen ↗';button.onclick=()=>window.luma.selectZone(d.id);row.append(info,button);if(d.zone){const enabled=document.createElement('input');enabled.type='checkbox';enabled.checked=d.zone.enabled;enabled.setAttribute('aria-label',d.label+' aktivieren');enabled.onchange=()=>save({zones:state.config.zones.map(z=>z.displayId===d.id?{...z,enabled:enabled.checked}:z)});row.append(enabled);}return row;}));}
const tutorialPages=[['Luma wohnt hier oben.','Oben in der Menüleiste findest du „≋ Luma“. Darüber öffnest du Einstellungen und Widget. Im Dock erscheint Luma nicht. Auch nach dem Schließen dieses Fensters läuft es weiter.'],['Ein Bildschirm. Dein Bereich.','Lege für jeden angeschlossenen Bildschirm einen eigenen Aktivierungsbereich fest. Widget-Größe und Textanordnung stellst du separat ein. Auf jeder freien Fläche verschiebst du das Widget durch Ziehen vorübergehend; der Pin merkt sich seine Position.'],['Verbinden und loshören.','Play und Titeldaten kommen über das System. Für Daumen, Playlist und weitere YouTube-Music-Funktionen richtest du die Browser-Erweiterung unter „Verbindung“ ein. Eine grüne Bestätigung zeigt dir, dass die Kopplung geklappt hat.']];
function updateTutorial(){window.luma.action(tutorialStep===0?'tutorial-indicator-on':'tutorial-indicator-off');const p=tutorialPages[tutorialStep];$('tutorial-title').textContent=tutorialStep===0&&state?.platform!=='darwin'?'Luma bleibt in Reichweite.':p[0];$('tutorial-text').textContent=tutorialStep===0&&state?.platform!=='darwin'?'Unten rechts im Windows-Infobereich findest du das Luma-Symbol. Darüber öffnest du Einstellungen und Widget. Auch nach dem Schließen dieses Fensters läuft Luma weiter.':p[1];$('tutorial-step').textContent=String(tutorialStep+1).padStart(2,'0')+' / 03';$('tutorial-next').textContent=tutorialStep===2?'Los geht’s ✓':'Weiter ↗';document.querySelectorAll('.tutorial-dots i').forEach((e,i)=>e.classList.toggle('active',i===tutorialStep));}
function showTutorial(){tutorialShown=true;tutorialStep=0;updateTutorial();if(!$('tutorial').open)$('tutorial').showModal();}
function nextTutorial(){if(tutorialStep<2){tutorialStep++;updateTutorial();}else finishTutorial();}
async function finishTutorial(){window.luma.action('tutorial-indicator-off');if($('tutorial').open)$('tutorial').close();await save({onboardingVersion:1});}
window.luma.onNavigate(target=>{if(overlayMode)return;if(target==='tutorial')showTutorial();else $(target)?.scrollIntoView({behavior:'smooth'});});window.luma.onConnected(()=>{if(!overlayMode)toast('✓ Erfolgreich verbunden: YouTube Music ist mit Luma gekoppelt.');});
if(!overlayMode){$('tutorial').addEventListener('cancel',()=>window.luma.action('tutorial-indicator-off'));window.addEventListener('pagehide',()=>window.luma.action('tutorial-indicator-off'));}
window.luma.onState(render);window.luma.get().then(render);setInterval(tick,400);
