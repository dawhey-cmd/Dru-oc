const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const { autoUpdater } = require('electron-updater');
const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

let mainWindow;
const isDev = process.env.NODE_ENV === 'development';

// Auto-updater configuration
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    backgroundColor: '#0A0E1A',
    titleBarStyle: 'hiddenInset',
    frame: process.platform === 'darwin' ? false : true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, 'assets', 'icon.png'),
  });

  // Load the React app
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../frontend/build/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// ─── AUTO-UPDATER ────────────────────────────────────────────────────────────

autoUpdater.on('checking-for-update', () => {
  mainWindow?.webContents.send('updater-status', { status: 'checking' });
});

autoUpdater.on('update-available', (info) => {
  mainWindow?.webContents.send('updater-status', { 
    status: 'available', 
    version: info.version,
    releaseNotes: info.releaseNotes 
  });
});

autoUpdater.on('update-not-available', () => {
  mainWindow?.webContents.send('updater-status', { status: 'not-available' });
});

autoUpdater.on('download-progress', (progress) => {
  mainWindow?.webContents.send('updater-status', { 
    status: 'downloading', 
    percent: progress.percent,
    bytesPerSecond: progress.bytesPerSecond
  });
});

autoUpdater.on('update-downloaded', (info) => {
  mainWindow?.webContents.send('updater-status', { 
    status: 'downloaded', 
    version: info.version 
  });
});

autoUpdater.on('error', (err) => {
  mainWindow?.webContents.send('updater-status', { status: 'error', error: err.message });
});

// IPC handlers for auto-update
ipcMain.handle('check-for-updates', async () => {
  if (isDev) return { status: 'dev-mode' };
  try {
    const result = await autoUpdater.checkForUpdates();
    return { status: 'checking', updateInfo: result?.updateInfo };
  } catch (err) {
    return { status: 'error', error: err.message };
  }
});

ipcMain.handle('download-update', async () => {
  try {
    await autoUpdater.downloadUpdate();
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('install-update', () => {
  autoUpdater.quitAndInstall(false, true);
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

// ─── IPC HANDLERS ────────────────────────────────────────────────────────────

// Execute PowerShell script
ipcMain.handle('execute-powershell', async (event, script) => {
  return new Promise((resolve, reject) => {
    const tempDir = os.tmpdir();
    const scriptPath = path.join(tempDir, 'openclaw-install.ps1');
    
    // Write script to temp file
    fs.writeFileSync(scriptPath, script, 'utf8');
    
    // Execute with PowerShell
    const ps = spawn('powershell.exe', [
      '-ExecutionPolicy', 'Bypass',
      '-NoProfile',
      '-File', scriptPath
    ], {
      windowsHide: false,
      shell: true
    });

    let stdout = '';
    let stderr = '';

    ps.stdout.on('data', (data) => {
      const text = data.toString();
      stdout += text;
      // Send progress to renderer
      mainWindow?.webContents.send('install-progress', { type: 'stdout', data: text });
    });

    ps.stderr.on('data', (data) => {
      const text = data.toString();
      stderr += text;
      mainWindow?.webContents.send('install-progress', { type: 'stderr', data: text });
    });

    ps.on('close', (code) => {
      // Cleanup temp file
      try { fs.unlinkSync(scriptPath); } catch (e) {}
      
      if (code === 0) {
        resolve({ success: true, stdout, stderr });
      } else {
        resolve({ success: false, code, stdout, stderr });
      }
    });

    ps.on('error', (err) => {
      reject(err);
    });
  });
});

// Save script to file
ipcMain.handle('save-script', async (event, { script, filename }) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Save Install Script',
    defaultPath: filename,
    filters: [
      { name: 'PowerShell Script', extensions: ['ps1'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (!result.canceled && result.filePath) {
    fs.writeFileSync(result.filePath, script, 'utf8');
    return { success: true, path: result.filePath };
  }
  return { success: false, canceled: true };
});

// Open external URL
ipcMain.handle('open-external', async (event, url) => {
  await shell.openExternal(url);
  return { success: true };
});

// Get system info
ipcMain.handle('get-system-info', async () => {
  return {
    platform: process.platform,
    arch: process.arch,
    version: os.release(),
    homedir: os.homedir(),
    tempdir: os.tmpdir(),
    cpus: os.cpus().length,
    memory: Math.round(os.totalmem() / (1024 * 1024 * 1024)),
    freeMemory: Math.round(os.freemem() / (1024 * 1024 * 1024)),
  };
});

// Check if running on Windows
ipcMain.handle('is-windows', () => {
  return process.platform === 'win32';
});

// Run system command
ipcMain.handle('run-command', async (event, command) => {
  return new Promise((resolve) => {
    exec(command, (error, stdout, stderr) => {
      resolve({
        success: !error,
        stdout: stdout?.trim(),
        stderr: stderr?.trim(),
        error: error?.message
      });
    });
  });
});

// Export/Import config
ipcMain.handle('export-config', async (event, config) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Export Configuration',
    defaultPath: 'openclaw-config.json',
    filters: [{ name: 'JSON', extensions: ['json'] }]
  });

  if (!result.canceled && result.filePath) {
    fs.writeFileSync(result.filePath, JSON.stringify(config, null, 2), 'utf8');
    return { success: true, path: result.filePath };
  }
  return { success: false, canceled: true };
});

ipcMain.handle('import-config', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Import Configuration',
    filters: [{ name: 'JSON', extensions: ['json'] }],
    properties: ['openFile']
  });

  if (!result.canceled && result.filePaths.length > 0) {
    try {
      const content = fs.readFileSync(result.filePaths[0], 'utf8');
      const config = JSON.parse(content);
      return { success: true, config };
    } catch (e) {
      return { success: false, error: 'Invalid JSON file' };
    }
  }
  return { success: false, canceled: true };
});
