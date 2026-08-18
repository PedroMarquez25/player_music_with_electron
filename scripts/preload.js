const { contextBridge, ipcRenderer } = require('electron')


contextBridge.exposeInMainWorld('api', {
  listarArchivos: () => ipcRenderer.invoke('obtener-archivos'),
  readMetadata: (ruta) => ipcRenderer.invoke('read-meta', ruta),
})
