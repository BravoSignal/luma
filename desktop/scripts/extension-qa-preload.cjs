const {ipcRenderer}=require('electron');
window.chrome.storage={local:{get:key=>ipcRenderer.invoke('qa-extension-get',key),set:value=>ipcRenderer.invoke('qa-extension-set',value)}};
window.chrome.runtime={getManifest:()=>({version:'1.6.0'}),sendMessage:async()=>({connected:!!window.__qaConnected})};
