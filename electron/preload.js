const { contextBridge, ipcRenderer } = require('electron');

// Безопасно передаём IPC функции в web контекст
contextBridge.exposeInMainWorld('electronAPI', {
  // Уведомления
  showNotification: (title, body) =>
    ipcRenderer.invoke('show-notification', { title, body }),

  // Система
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),

  // Локальное хранилище (более надёжное чем localStorage)
  store: {
    set: (key, value) => ipcRenderer.invoke('store-set', key, value),
    get: (key) => ipcRenderer.invoke('store-get', key),
    delete: (key) => ipcRenderer.invoke('store-delete', key)
  },

  // Управление окном
  window: {
    minimize: () => ipcRenderer.invoke('minimize-window'),
    toggleMaximize: () => ipcRenderer.invoke('toggle-maximize-window'),
    close: () => ipcRenderer.invoke('close-window')
  }
});
