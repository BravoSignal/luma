const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('luma', {
 update:action=>ipcRenderer.invoke('update',action),manage:(op,data)=>ipcRenderer.invoke('manage',op,data),accent:color=>ipcRenderer.send('accent',color),onNavigate:fn=>ipcRenderer.on('navigate',(_,target)=>fn(target)),onConnected:fn=>ipcRenderer.on('connection-confirmed',fn),height:h=>ipcRenderer.send('height',h), onResult:fn=>ipcRenderer.on('result',(_,r)=>fn(r)), get:()=>ipcRenderer.invoke('get'), save:c=>ipcRenderer.invoke('save',c), command:(action,value)=>ipcRenderer.send('command',action,value),
 drag:gesture=>ipcRenderer.send('widget-drag',gesture), action:(action)=>ipcRenderer.invoke('action',action), selectZone:id=>ipcRenderer.invoke('select-zone',id), zone:r=>ipcRenderer.send('zone',r), cancelZone:()=>ipcRenderer.send('cancel-zone'),
 onState:fn=>{const listener=(_,v)=>fn(v);ipcRenderer.on('state',listener);return()=>ipcRenderer.removeListener('state',listener);}
});
