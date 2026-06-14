const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openMedia: (filePath) => ipcRenderer.invoke('open-media', filePath),
  pickFile: (options) => ipcRenderer.invoke('pick-file', options),
  pickFolder: () => ipcRenderer.invoke('pick-folder'),
  openInExplorer: (filePath) => ipcRenderer.invoke('open-in-explorer', filePath),
  isElectron: true
});
