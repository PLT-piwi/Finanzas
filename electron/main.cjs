/* ============================================
   Electron main (CJS) + Vite integration
   - En dev: carga la URL del servidor Vite
   - En prod: carga dist/index.html
   ============================================ */

const { app, BrowserWindow, shell } = require('electron');
const fs = require('fs');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 720,
    minWidth: 720,
    minHeight: 500,
    title: 'Mis Finanzas',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      partition: 'persist:finanzas',
    },
  });

  const devServerURL = process.env.VITE_DEV_SERVER_URL;
  if (devServerURL) {
    win.loadURL(devServerURL);
  } else {
    // Producción:
    // - Si existe dist, lo usamos
    // - Si no (o si falta contenido estático), caemos a index.html del root
    const distIndex = path.join(__dirname, '..', 'dist', 'index.html');
    const rootIndex = path.join(__dirname, '..', 'index.html');
    win.loadFile(fs.existsSync(distIndex) ? distIndex : rootIndex);
  }

  // Abrir links externos en el navegador del sistema
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

