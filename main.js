const { app, BrowserWindow, ipcMain, dialog } = require('electron/main');
const { parseFile } = require('music-metadata');

const path = require('path')
const fs = require('fs').promises
const Store = require('electron-store').default || require('electron-store');

let store = new Store();
let mainWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
        preload: path.join(__dirname, "scripts/preload.js")
    },
    autoHideMenuBar:true,
    minHeight: 500,
    minWidth:600
  })
  mainWindow.loadFile('windows/index.html')
}


ipcMain.handle('obtener-archivos', async (e, ruta) => {
  try {
    const archivos = await fs.readdir(ruta);
    
    return {archivos, ruta};
  } catch (error) {
    console.error("Error al leer la carpeta:", error);
    return [];
  }
});

ipcMain.handle('read-meta', async (e, ruta) => {
    try {
        const cleanPath = ruta.replace(/\\/g, '/');
        
        // Lee todos los metadatos internos del archivo de forma nativa
        const metadata = await parseFile(cleanPath);
        
        let imageUrl = null
        let duration = '0:00'

        if (metadata.common.picture && metadata.common.picture.length > 0) {
            const picture = metadata.common.picture[0];
            const base64String = Buffer.from(picture.data).toString('base64');
            imageUrl = `data:${picture.format};base64,${base64String}`;
        }

        if(metadata.format.duration){
          const totalSeconds = Math.floor(metadata.format.duration)
          const minutes = Math.floor((totalSeconds % 3600) / 60);
          const remainingSeconds = totalSeconds % 60;
          duration = `${minutes}:${remainingSeconds}`
        }

        return {
            "title": metadata.common.title || "Título Desconocido",
            'artist': metadata.common.artist || "Artista Desconocido",
            "album": metadata.common.album || "Álbum Desconocido",
            'genre': metadata.common.genre || ["Desconocido"], // El género es un array
            "duration": duration,
            'image': imageUrl
        };
    } catch (error) {
        console.error(`Ocurrio un error al extraer los metadatos de la cacion ${ruta}: ${error}`)
        return {
            "title": "Error al leer archivo",
            'artist': '',
            "album": '',
            "duration": 0,
            'genre': [],
            'image': null
        };
  }
});

ipcMain.handle("dialog:open-directory", async (event, prop, filtros) =>{
  const {canceled, filePaths} = await dialog.showOpenDialog(mainWindow, {
    properties: [prop],
    filters: [filtros]
  });

  if (canceled) return null;
  else return filePaths[0];
})

ipcMain.handle("store", async (event, method, data = {}) =>{
    switch(method){
      case "set":
        store.set(data.key, data.value)
        return "Dato guardado exitosamente"
      case "get":
        let value = store.get(data.key)
        return value
      case "delete":
        store.delete(data.key)
        return "Dato borrado exitosamente"
      case "clear":
        store.clear()
        return "Datos borrados"
      case "has":
        return store.has(data.key)
      default:
        return null
    }
})


app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

