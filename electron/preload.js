const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // PowerShell execution
  executePowerShell: (script) => ipcRenderer.invoke('execute-powershell', script),
  
  // File operations
  saveScript: (data) => ipcRenderer.invoke('save-script', data),
  exportConfig: (config) => ipcRenderer.invoke('export-config', config),
  importConfig: () => ipcRenderer.invoke('import-config'),
  
  // System info
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  isWindows: () => ipcRenderer.invoke('is-windows'),
  runCommand: (cmd) => ipcRenderer.invoke('run-command', cmd),
  
  // External links
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  
  // Auto-updater
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  downloadUpdate: () => ipcRenderer.invoke('download-update'),
  installUpdate: () => ipcRenderer.invoke('install-update'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  onUpdaterStatus: (callback) => {
    ipcRenderer.on('updater-status', (event, data) => callback(data));
  },
  
  // Progress listener
  onInstallProgress: (callback) => {
    ipcRenderer.on('install-progress', (event, data) => callback(data));
  },
  
  // Remove listener
  removeInstallProgressListener: () => {
    ipcRenderer.removeAllListeners('install-progress');
  }
});

// Platform info immediately available
contextBridge.exposeInMainWorld('platform', {
  isElectron: true,
  isWindows: process.platform === 'win32',
  isMac: process.platform === 'darwin',
  isLinux: process.platform === 'linux'
});
