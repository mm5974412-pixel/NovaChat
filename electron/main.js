const { app, BrowserWindow, Menu, ipcMain, Notification, dialog } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const Store = require('electron-store');

// Инициализация хранилища конфига
const store = new Store();

let mainWindow;
const WINDOW_MIN_WIDTH = 300;
const WINDOW_MIN_HEIGHT = 600;

// Создание главного окна
function createWindow() {
  mainWindow = new BrowserWindow({
    width: store.get('window.width', 1200),
    height: store.get('window.height', 800),
    minWidth: WINDOW_MIN_WIDTH,
    minHeight: WINDOW_MIN_HEIGHT,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      sandbox: true
    },
    icon: path.join(__dirname, '../public/icons/app-icon.png')
  });

  // Загруз приложения
  const startUrl = isDev
    ? 'http://localhost:3000/chat.html' // Во время разработки подключаемся к dev серверу
    : `file://${path.join(__dirname, '../public/chat.html')}`; // В продакшене используем локальные файлы

  mainWindow.loadURL(startUrl);

  // Открыть DevTools в режиме разработки
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Сохранение размера окна при закрытии
  mainWindow.on('resized', () => {
    const [width, height] = mainWindow.getSize();
    store.set('window.width', width);
    store.set('window.height', height);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Создание меню приложения
function createMenu() {
  const template = [
    {
      label: 'Файл',
      submenu: [
        {
          label: 'Выход',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Правка',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    },
    {
      label: 'Вид',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Помощь',
      submenu: [
        {
          label: 'О приложении',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'NovaChat Desktop',
              message: 'NovaChat Desktop',
              detail: 'Версия 1.0.0\n\nПолнофункциональный кросс-платформенный мессенджер'
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Запуск приложения
app.on('ready', () => {
  createWindow();
  createMenu();
});

// Переоткрыть окно на macOS при нажатии на иконку в доке
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Закрыть приложение когда все окна закрыты (кроме macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// ===== IPC Handlers для связи между Electron и Web =====

// Показать уведомление
ipcMain.handle('show-notification', async (event, options) => {
  const notification = new Notification({
    title: options.title || 'NovaChat',
    body: options.body || '',
    icon: path.join(__dirname, '../public/icons/notification-icon.png')
  });
  
  notification.show();
  
  if (options.onClick) {
    notification.on('click', () => {
      mainWindow.focus();
    });
  }
  
  return true;
});

// Получить информацию о системе
ipcMain.handle('get-system-info', async (event) => {
  return {
    platform: process.platform,
    arch: process.arch,
    version: app.getVersion(),
    appPath: app.getAppPath()
  };
});

// Сохранить данные в хранилище
ipcMain.handle('store-set', async (event, key, value) => {
  store.set(key, value);
  return true;
});

// Получить данные из хранилища
ipcMain.handle('store-get', async (event, key) => {
  return store.get(key);
});

// Удалить данные из хранилища
ipcMain.handle('store-delete', async (event, key) => {
  store.delete(key);
  return true;
});

// Минимизировать окно
ipcMain.handle('minimize-window', async (event) => {
  mainWindow.minimize();
  return true;
});

// Развернуть/свернуть окно
ipcMain.handle('toggle-maximize-window', async (event) => {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
  return true;
});

// Закрыть окно
ipcMain.handle('close-window', async (event) => {
  mainWindow.close();
  return true;
});
