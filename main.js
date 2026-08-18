const { app, BrowserWindow, ipcMain } = require('electron/main')

const path = require('path')
const fs = require('fs').promises
const { parseFile } = require('music-metadata');
const { match } = require('assert');

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
        preload: path.join(__dirname, "scripts/preload.js")
    },
    autoHideMenuBar:true,
    minHeight: 500,
    minWidth:700
  })

  win.loadFile('windows/index.html')
}


ipcMain.handle('obtener-archivos', async (e, ruta = "C:/Users/PC/Music") => {
  try {
    const rutaCarpeta = ruta

    // Leemos los archivos de la carpeta
    const archivos = await fs.readdir(rutaCarpeta);
    
    return {archivos, ruta}; // Retornamos la lista de archivos al renderizador
  } catch (error) {
    console.error("Error al leer la carpeta:", error);
    return [];
  }
});

ipcMain.handle('read-meta', async (e, ruta) => {
    try {
        // Limpiar direccion de audio
        const cleanPath = ruta.replace(/\\/g, '/');
        
        // Lee todos los metadatos internos del archivo de forma nativa
        const metadata = await parseFile(cleanPath);
        
        let imageUrl = path.join(__dirname, "assets/Iron-man-endgame.jpg")
        let duration = '0:00'

        // Si el mp3 tiene carátula (imagen) guardada adentro:
        if (metadata.common.picture && metadata.common.picture.length > 0) {
            const picture = metadata.common.picture[0];
            // Puedes convertir la imagen binaria a base64 para mostrarla en un <img>
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
            // Datos de texto
            "title": metadata.common.title || "Título Desconocido",
            'artist': metadata.common.artist || "Artista Desconocido",
            "album": metadata.common.album || "Álbum Desconocido",
            'genre': metadata.common.genre || ["Desconocido"], // El género es un array

            // Datos numéricos (usamos 0 si no existe duración)
            "duration": duration,

            // Imagen (será null si no existe)
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