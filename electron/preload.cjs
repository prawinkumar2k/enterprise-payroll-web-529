const { contextBridge } = require('electron');

// Securely expose APIs to the renderer process
contextBridge.exposeInMainWorld('electron', {
    platform: process.platform,
    version: process.versions.electron
});
