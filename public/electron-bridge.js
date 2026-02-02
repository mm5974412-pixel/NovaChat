// Инициализация Electron API если доступно
const electronAPI = typeof window !== 'undefined' && window.electronAPI;

class ElectronBridge {
  /**
   * Проверить, запущено ли приложение в Electron
   */
  static isElectron() {
    return !!electronAPI;
  }

  /**
   * Показать уведомление
   */
  static async notify(title, body = '') {
    if (!this.isElectron()) {
      // Fallback на Web Notifications API
      if ('Notification' in window) {
        new Notification(title, { body });
      }
      return;
    }
    return electronAPI.showNotification(title, body);
  }

  /**
   * Получить информацию о системе
   */
  static async getSystemInfo() {
    if (!this.isElectron()) return null;
    return electronAPI.getSystemInfo();
  }

  /**
   * Безопасное локальное хранилище (предпочтительнее localStorage)
   */
  static storage = {
    async set(key, value) {
      if (electronAPI) {
        await electronAPI.store.set(key, value);
      } else {
        localStorage.setItem(key, JSON.stringify(value));
      }
    },

    async get(key) {
      if (electronAPI) {
        return await electronAPI.store.get(key);
      } else {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      }
    },

    async delete(key) {
      if (electronAPI) {
        await electronAPI.store.delete(key);
      } else {
        localStorage.removeItem(key);
      }
    }
  };

  /**
   * Управление окном
   */
  static window = {
    minimize: async () => {
      if (electronAPI) await electronAPI.window.minimize();
    },

    toggleMaximize: async () => {
      if (electronAPI) await electronAPI.window.toggleMaximize();
    },

    close: async () => {
      if (electronAPI) await electronAPI.window.close();
    }
  };
}

// Экспортируем глобально, если это window окружение
if (typeof window !== 'undefined') {
  window.ElectronBridge = ElectronBridge;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ElectronBridge;
}
