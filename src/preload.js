const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (s) => ipcRenderer.invoke('save-settings', s),
  getCache: () => ipcRenderer.invoke('get-cache'),
  saveCache: (d) => ipcRenderer.invoke('save-cache', d),
  openUrl: (url) => ipcRenderer.invoke('open-url', url),
  openSettings: () => ipcRenderer.invoke('open-settings'),
  minimize: () => ipcRenderer.invoke('minimize-widget'),
  close: () => ipcRenderer.invoke('close-widget'),
  onRefreshTrigger: (cb) => ipcRenderer.on('trigger-refresh', cb),
  onSettingsChanged: (cb) => ipcRenderer.on('settings-changed', (_, s) => cb(s))
});
