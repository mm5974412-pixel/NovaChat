/**
 * Mobile Utility Helpers for Nexora
 * Полезные функции для работы с мобильными устройствами
 */

/**
 * Определяет, является ли устройство мобильным
 */
const DeviceDetection = {
  isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  },

  isTablet() {
    return /iPad|Android|Tablet/i.test(navigator.userAgent);
  },

  isIOS() {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent);
  },

  isAndroid() {
    return /Android/i.test(navigator.userAgent);
  },

  getDeviceType() {
    if (this.isTablet()) return 'tablet';
    if (this.isMobile()) return 'mobile';
    return 'desktop';
  }
};

/**
 * Утилиты для работы с viewport
 */
const ViewportHelper = {
  /**
   * Получить высоту viewport (с учетом клавиатуры)
   */
  getViewportHeight() {
    // Использует innerHeight вместо clientHeight для мобильных
    return window.innerHeight || document.documentElement.clientHeight;
  },

  /**
   * Получить ширину viewport
   */
  getViewportWidth() {
    return window.innerWidth || document.documentElement.clientWidth;
  },

  /**
   * Проверить в портретной ли ориентации
   */
  isPortrait() {
    return window.innerHeight > window.innerWidth;
  },

  /**
   * Проверить в ландшафтной ли ориентации
   */
  isLandscape() {
    return window.innerWidth > window.innerHeight;
  },

  /**
   * Добавить слушателя на изменение ориентации
   */
  onOrientationChange(callback) {
    window.addEventListener('orientationchange', callback);
    window.addEventListener('resize', callback);
    return () => {
      window.removeEventListener('orientationchange', callback);
      window.removeEventListener('resize', callback);
    };
  }
};

/**
 * Утилиты для работы с touch события
 */
const TouchHelper = {
  /**
   * Получить координаты touch события
   */
  getTouchPosition(event) {
    const touch = event.touches[0] || event.changedTouches[0];
    return {
      x: touch.clientX,
      y: touch.clientY,
      identifier: touch.identifier
    };
  },

  /**
   * Обнаружить свайп
   */
  detectSwipe(startX, startY, endX, endY, minDistance = 50) {
    const dx = endX - startX;
    const dy = endY - startY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < minDistance) return null;

    // Определяем направление
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    if (angle >= -45 && angle <= 45) return 'right';
    if (angle > 45 && angle < 135) return 'down';
    if (angle >= 135 || angle <= -135) return 'left';
    if (angle > -135 && angle < -45) return 'up';

    return null;
  },

  /**
   * Обнаружить двойной клик
   */
  detectDoubleTap(callback, delay = 300) {
    let lastTap = 0;
    return (event) => {
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTap;

      if (tapLength < delay && tapLength > 0) {
        callback(event);
        lastTap = 0;
      } else {
        lastTap = currentTime;
      }
    };
  }
};

/**
 * Утилиты для работы с хранилищем
 */
const StorageHelper = {
  /**
   * Сохранить данные в localStorage
   */
  set(key, value, ttl = null) {
    const data = {
      value,
      timestamp: Date.now(),
      ttl
    };
    localStorage.setItem(key, JSON.stringify(data));
  },

  /**
   * Получить данные из localStorage
   */
  get(key) {
    const item = localStorage.getItem(key);
    if (!item) return null;

    const data = JSON.parse(item);

    // Проверить TTL
    if (data.ttl) {
      const now = Date.now();
      if (now - data.timestamp > data.ttl) {
        localStorage.removeItem(key);
        return null;
      }
    }

    return data.value;
  },

  /**
   * Удалить данные из localStorage
   */
  remove(key) {
    localStorage.removeItem(key);
  },

  /**
   * Очистить все
   */
  clear() {
    localStorage.clear();
  },

  /**
   * Получить размер используемого хранилища
   */
  getSize() {
    let size = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        size += localStorage[key].length + key.length;
      }
    }
    return (size / 1024).toFixed(2) + ' KB';
  }
};

/**
 * Утилиты для работы с уведомлениями
 */
const NotificationHelper = {
  /**
   * Запросить разрешение на уведомления
   */
  async requestPermission() {
    if (!('Notification' in window)) return false;

    if (Notification.permission === 'granted') return true;
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  },

  /**
   * Показать уведомление
   */
  show(title, options = {}) {
    if (Notification.permission === 'granted') {
      return new Notification(title, {
        icon: '✨',
        ...options
      });
    }
  },

  /**
   * Показать уведомление на рабочем столе
   */
  async alert(title, message) {
    const hasPermission = await this.requestPermission();
    if (hasPermission) {
      this.show(title, {
        body: message,
        tag: 'nexora-alert'
      });
    }
  }
};

/**
 * Утилиты для работы с производительностью
 */
const PerformanceHelper = {
  /**
   * Измерить время выполнения функции
   */
  measurePerformance(fn, label = 'Operation') {
    const start = performance.now();
    const result = fn();
    const end = performance.now();

    console.log(`${label}: ${(end - start).toFixed(2)}ms`);
    return result;
  },

  /**
   * Debounce функцию
   */
  debounce(fn, delay = 300) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
  },

  /**
   * Throttle функцию
   */
  throttle(fn, delay = 300) {
    let lastCall = 0;
    return function (...args) {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        fn.apply(this, args);
      }
    };
  },

  /**
   * RequestAnimationFrame helper
   */
  animate(callback, duration = 300) {
    const start = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);

      callback(progress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }
};

/**
 * Утилиты для работы с сетью
 */
const NetworkHelper = {
  /**
   * Проверить соединение с интернетом
   */
  isOnline() {
    return navigator.onLine;
  },

  /**
   * Добавить слушателя на изменение статуса сети
   */
  onConnectionChange(callback) {
    window.addEventListener('online', () => callback(true));
    window.addEventListener('offline', () => callback(false));
  },

  /**
   * Получить тип соединения
   */
  getConnectionType() {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    return connection?.effectiveType || 'unknown';
  },

  /**
   * Проверить быстрое ли соединение
   */
  isFastConnection() {
    const type = this.getConnectionType();
    return type === '4g' || type === 'wifi';
  },

  /**
   * Retry функция для сетевых запросов
   */
  async fetchWithRetry(url, options = {}, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, options);
        if (response.ok) return response;
      } catch (err) {
        if (i === retries - 1) throw err;
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
      }
    }
  }
};

/**
 * Утилиты для работы с клавиатурой
 */
const KeyboardHelper = {
  /**
   * Получить высоту виртуальной клавиатуры
   */
  getKeyboardHeight() {
    // Это сложная задача, обычно вычисляется как разница высот
    const visualViewport = window.visualViewport;
    if (visualViewport) {
      return window.innerHeight - visualViewport.height;
    }
    return 0;
  },

  /**
   * Слушать появление клавиатуры
   */
  onKeyboardToggle(onShow, onHide) {
    let previousHeight = window.innerHeight;

    window.addEventListener('resize', () => {
      const currentHeight = window.innerHeight;

      if (currentHeight < previousHeight) {
        onShow?.();
      } else if (currentHeight > previousHeight) {
        onHide?.();
      }

      previousHeight = currentHeight;
    });
  }
};

/**
 * Утилиты для работы с батареей
 */
const BatteryHelper = {
  /**
   * Получить информацию о батарее
   */
  async getBatteryInfo() {
    if ('getBattery' in navigator) {
      return await navigator.getBattery();
    }
    return null;
  },

  /**
   * Проверить уровень батареи
   */
  async isLowBattery(threshold = 20) {
    const battery = await this.getBatteryInfo();
    if (!battery) return false;
    return battery.level * 100 < threshold;
  }
};

/**
 * Утилиты для работы с геолокацией
 */
const GeolocationHelper = {
  /**
   * Получить текущую позицию
   */
  getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation не поддерживается'));
        return;
      }

      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  },

  /**
   * Следить за позицией
   */
  watchPosition(callback, options = {}) {
    return navigator.geolocation.watchPosition(callback, null, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
      ...options
    });
  }
};

/**
 * Утилиты для работы с камерой
 */
const CameraHelper = {
  /**
   * Получить доступ к камере
   */
  async getCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false
      });
      return stream;
    } catch (err) {
      console.error('Camera access denied:', err);
      return null;
    }
  },

  /**
   * Остановить камеру
   */
  stopCamera(stream) {
    stream?.getTracks().forEach(track => track.stop());
  }
};

// Экспорт всех утилит
window.Nexora = {
  DeviceDetection,
  ViewportHelper,
  TouchHelper,
  StorageHelper,
  NotificationHelper,
  PerformanceHelper,
  NetworkHelper,
  KeyboardHelper,
  BatteryHelper,
  GeolocationHelper,
  CameraHelper
};

// Примеры использования
console.log('=== Примеры использования ===');
console.log('Тип устройства:', Nexora.DeviceDetection.getDeviceType());
console.log('В сети:', Nexora.NetworkHelper.isOnline());
console.log('Тип соединения:', Nexora.NetworkHelper.getConnectionType());
console.log('Размер localStorage:', Nexora.StorageHelper.getSize());
console.log('Ориентация:', Nexora.ViewportHelper.isPortrait() ? 'Портрет' : 'Ландшафт');

// Сохранить что-то с TTL (2 часа)
Nexora.StorageHelper.set('user_theme', 'dark', 2 * 60 * 60 * 1000);
console.log('Тема:', Nexora.StorageHelper.get('user_theme'));
