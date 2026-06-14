const { app, BrowserWindow, Menu, dialog, shell, ipcMain, protocol, session } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  const iconPath = path.join(__dirname, '..', 'icon.png');

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true,
      allowRunningInsecureContent: false,
      allowFileAccessFromFileUrls: true,
      allowUniversalAccessFromFileUrls: false
    },
    backgroundColor: '#111827',
    show: false,
    autoHideMenuBar: true
  });

  // ─── Content Security Policy ───
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'; " +
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://cdn.tailwindcss.com https://cdn.jsdelivr.net https://fonts.googleapis.com; " +
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; " +
          "img-src 'self' data: blob: file: https:; " +
          "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; " +
          "media-src 'self' file:; " +
          "connect-src 'self' https://api.github.com; " +
          "frame-src 'self'; " +
          "object-src 'none'"
        ]
      }
    });
  });

  // ─── Permissões mínimas necessárias ───
  mainWindow.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
    // Permitir apenas notificações
    const allowed = ['notifications'];
    callback(allowed.includes(permission));
  });

  mainWindow.webContents.session.setPermissionCheckHandler((webContents, permission, requestingOrigin, details) => {
    const allowed = ['notifications'];
    return allowed.includes(permission);
  });

  // Remove a barra de menus (usuário não quer menu algum)
  Menu.setApplicationMenu(null);

  // Carrega o HTML principal
  mainWindow.loadFile(path.join(__dirname, '..', 'index.html'));

  // Abre maximizado independente da resolução
  mainWindow.once('ready-to-show', () => {
    mainWindow.maximize();
    mainWindow.show();
    if (process.argv.includes('--dev')) {
      mainWindow.webContents.openDevTools();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ─── IPC: Abrir mídia no player padrão do SO ───
ipcMain.handle('open-media', async (event, filePath) => {
  if (!filePath || typeof filePath !== 'string') return { success: false, error: 'Caminho inválido' };
  try {
    // Sanitizar: bloquear path traversal
    const normalized = path.normalize(filePath);
    if (normalized.includes('..')) return { success: false, error: 'Path traversal bloqueado' };

    // Se for URL (http/https), abre no navegador padrão
    if (filePath.match(/^https?:\/\//i)) {
      const trusted = filePath.match(/^https?:\/\/([a-zA-Z0-9.-]+)/i);
      if (!trusted) return { success: false, error: 'URL inválida' };
      await shell.openExternal(filePath);
      return { success: true };
    }
    // Se for file:///, converte para caminho local
    if (filePath.startsWith('file:///')) {
      filePath = decodeURIComponent(filePath.replace(/^file:\/\//i, ''));
    }
    // Remove barra inicial duplicada em Windows (ex: /C:/)
    if (process.platform === 'win32' && filePath.startsWith('/')) {
      filePath = filePath.slice(1);
    }
    // Verifica se o arquivo existe
    if (fs.existsSync(filePath)) {
      await shell.openPath(filePath);
      return { success: true };
    }
    return { success: false, error: 'Arquivo não encontrado' };
  } catch (err) {
    console.error('Erro ao abrir mídia:', err);
    return { success: false, error: err.message };
  }
});

// ─── IPC: Abrir arquivo no explorador de arquivos ───
ipcMain.handle('open-in-explorer', async (event, filePath) => {
  if (!filePath || typeof filePath !== 'string') return { success: false };
  const dir = path.dirname(path.normalize(filePath));
  if (dir.includes('..')) return { success: false };
  try {
    await shell.openPath(dir);
    return { success: true };
  } catch {
    return { success: false };
  }
});

// ─── IPC: Abrir seletor de arquivo nativo ───
ipcMain.handle('pick-file', async (event, options) => {
  if (!options || typeof options !== 'object') options = {};
  const opts = {
    title: typeof options.title === 'string' ? options.title : 'Selecionar arquivo',
    defaultPath: typeof options.defaultPath === 'string' ? options.defaultPath : '',
    filters: Array.isArray(options.filters) ? options.filters : [{ name: 'Todos', extensions: ['*'] }],
    properties: ['openFile']
  };
  const result = await dialog.showOpenDialog(mainWindow, opts);
  if (result.canceled || !result.filePaths.length) return null;
  return result.filePaths[0];
});

// ─── IPC: Abrir seletor de pasta nativo ───
ipcMain.handle('pick-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  if (result.canceled || !result.filePaths.length) return null;
  return result.filePaths[0];
});

// ─── Protocolo file:// seguro ───
app.on('ready', () => {
  protocol.registerFileProtocol('local-media', (request, callback) => {
    const filePath = decodeURIComponent(request.url.replace('local-media://', ''));
    callback({ path: filePath });
  });
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
