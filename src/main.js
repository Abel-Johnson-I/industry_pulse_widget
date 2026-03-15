const { app, BrowserWindow, Tray, Menu, ipcMain, shell, nativeImage, screen } = require('electron');
const path = require('path');
const fs = require('fs');

// ─── App setup ────────────────────────────────────────────────────────────────
app.setName('Industry Pulse');
if (process.platform === 'win32') {
  app.setAppUserModelId('com.industrypulse.widget');
}

let mainWindow = null;
let tray = null;
let settingsWindow = null;

// ─── Settings store (simple JSON file) ───────────────────────────────────────
const userDataPath = app.getPath('userData');
const settingsPath = path.join(userDataPath, 'settings.json');
const cachePath = path.join(userDataPath, 'cache.json');

const defaultSettings = {
  theme: 'dark',
  compact: false,
  alwaysOnTop: true,
  startWithWindows: false,
  refreshInterval: 60,       // minutes
  showElectronics: true,
  showAI: true,
  windowX: null,
  windowY: null,
  opacity: 0.95
};

function loadSettings() {
  try {
    if (fs.existsSync(settingsPath)) {
      const raw = fs.readFileSync(settingsPath, 'utf8');
      return { ...defaultSettings, ...JSON.parse(raw) };
    }
  } catch (e) { /* ignore */ }
  return { ...defaultSettings };
}

function saveSettings(settings) {
  try {
    fs.mkdirSync(userDataPath, { recursive: true });
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
  } catch (e) { /* ignore */ }
}

function loadCache() {
  try {
    if (fs.existsSync(cachePath)) {
      return JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    }
  } catch (e) { /* ignore */ }
  return null;
}

function saveCache(data) {
  try {
    fs.writeFileSync(cachePath, JSON.stringify(data));
  } catch (e) { /* ignore */ }
}

// ─── Window creation ──────────────────────────────────────────────────────────
function createWidget() {
  const settings = loadSettings();
  const display = screen.getPrimaryDisplay();
  const { width, height } = display.workAreaSize;

  const winWidth = settings.compact ? 320 : 380;
  const winHeight = settings.compact ? 420 : 620;

  // Default position: bottom-right corner
  const defaultX = width - winWidth - 20;
  const defaultY = height - winHeight - 20;

  mainWindow = new BrowserWindow({
    width: winWidth,
    height: winHeight,
    x: settings.windowX ?? defaultX,
    y: settings.windowY ?? defaultY,
    frame: false,
    transparent: true,
    resizable: false,
    skipTaskbar: true,
    alwaysOnTop: settings.alwaysOnTop,
    hasShadow: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    show: false
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.setOpacity(settings.opacity);
  });

  // Save position on move
  mainWindow.on('moved', () => {
    const [x, y] = mainWindow.getPosition();
    const s = loadSettings();
    s.windowX = x;
    s.windowY = y;
    saveSettings(s);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray() {
  // Use a simple 16x16 colored icon (created programmatically)
  const iconPath = path.join(__dirname, 'assets', 'tray-icon.png');
  let trayIcon;

  if (fs.existsSync(iconPath)) {
    trayIcon = nativeImage.createFromPath(iconPath);
  } else {
    // Fallback: create a simple icon
    trayIcon = nativeImage.createEmpty();
  }

  tray = new Tray(trayIcon);
  tray.setToolTip('Industry Pulse');
  updateTrayMenu();

  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
      }
    } else {
      createWidget();
    }
  });
}

function updateTrayMenu() {
  const menu = Menu.buildFromTemplate([
    {
      label: 'Show Widget',
      click: () => {
        if (mainWindow) mainWindow.show();
        else createWidget();
      }
    },
    {
      label: 'Refresh Now',
      click: () => {
        if (mainWindow) mainWindow.webContents.send('trigger-refresh');
      }
    },
    { type: 'separator' },
    {
      label: 'Settings',
      click: openSettings
    },
    { type: 'separator' },
    {
      label: 'Exit',
      click: () => app.quit()
    }
  ]);
  tray.setContextMenu(menu);
}

function openSettings() {
  if (settingsWindow) {
    settingsWindow.focus();
    return;
  }

  settingsWindow = new BrowserWindow({
    width: 400,
    height: 520,
    frame: true,
    resizable: false,
    title: 'Industry Pulse — Settings',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  settingsWindow.loadFile(path.join(__dirname, 'settings.html'));
  settingsWindow.setMenuBarVisibility(false);

  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });
}

// ─── IPC handlers ─────────────────────────────────────────────────────────────
ipcMain.handle('get-settings', () => loadSettings());
ipcMain.handle('save-settings', (event, settings) => {
  saveSettings(settings);
  if (mainWindow) {
    mainWindow.setAlwaysOnTop(settings.alwaysOnTop);
    mainWindow.setOpacity(settings.opacity);
    mainWindow.webContents.send('settings-changed', settings);
  }
  return true;
});
ipcMain.handle('get-cache', () => loadCache());
ipcMain.handle('save-cache', (event, data) => {
  saveCache(data);
  return true;
});
ipcMain.handle('open-url', (event, url) => {
  shell.openExternal(url);
});
ipcMain.handle('open-settings', () => openSettings());
ipcMain.handle('minimize-widget', () => {
  if (mainWindow) mainWindow.hide();
});
ipcMain.handle('close-widget', () => {
  app.quit();
});

// ─── App lifecycle ────────────────────────────────────────────────────────────
app.whenReady().then(() => {
  createTray();
  createWidget();
});

app.on('window-all-closed', (e) => {
  e.preventDefault(); // Keep alive in tray
});

app.on('before-quit', () => {
  if (mainWindow) mainWindow.destroy();
  if (tray) tray.destroy();
});
