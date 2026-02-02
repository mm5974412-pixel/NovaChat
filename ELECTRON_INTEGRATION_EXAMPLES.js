// ===== ПРИМЕРЫ ИСПОЛЬЗОВАНИЯ ELECTRON BRIDGE =====
// Эти примеры показывают как использовать Electron функции в веб приложении

// 1. УВЕДОМЛЕНИЯ
// ============

// Показать уведомление (работает как в Electron так и в веб браузере)
async function sendNotification() {
  await ElectronBridge.notify('Новое сообщение', 'Вам написал Иван');
}

// 2. ПОЛУЧИТЬ ИНФОРМАЦИЮ О СИСТЕМЕ
// =================================

async function getSystemInfo() {
  const info = await ElectronBridge.getSystemInfo();
  if (info) {
    console.log('Platform:', info.platform);      // 'win32', 'darwin', 'linux'
    console.log('Architecture:', info.arch);      // 'x64', 'arm64'
    console.log('App Version:', info.version);    // '1.0.0'
  }
}

// 3. ЛОКАЛЬНОЕ ХРАНИЛИЩЕ (Лучше чем localStorage)
// ================================================

async function saveUserData() {
  // Сохранить
  await ElectronBridge.storage.set('user_preferences', {
    theme: 'dark',
    notifications: true,
    fontSize: 14
  });

  // Получить
  const prefs = await ElectronBridge.storage.get('user_preferences');
  console.log('Preferences:', prefs);

  // Удалить
  await ElectronBridge.storage.delete('user_preferences');
}

// 4. УПРАВЛЕНИЕ ОКНОМ
// ====================

// Свернуть приложение
async function minimizeApp() {
  await ElectronBridge.window.minimize();
}

// Развернуть/свернуть окно
async function toggleMaximize() {
  await ElectronBridge.window.toggleMaximize();
}

// Закрыть приложение
async function closeApp() {
  await ElectronBridge.window.close();
}

// 5. ПРОВЕРКА ПЛАТФОРМЫ
// =====================

if (ElectronBridge.isElectron()) {
  console.log('Приложение запущено в Electron');
  // Показать кнопки управления окном
  document.querySelector('.window-controls').style.display = 'flex';
} else {
  console.log('Приложение запущено в браузере');
  // Скрыть кнопки управления окном
  document.querySelector('.window-controls').style.display = 'none';
}

// 6. ИНТЕГРАЦИЯ В HTML (ПОЛНЫЙ ПРИМЕР)
// =====================================

// HTML:
/*
<div class="chat-app">
  <!-- Кнопка отправки уведомления -->
  <button onclick="sendNotification()">Тестовое уведомление</button>

  <!-- Элементы управления окном (видны только в Electron) -->
  <div class="window-controls">
    <button onclick="minimizeApp()">−</button>
    <button onclick="toggleMaximize()">□</button>
    <button onclick="closeApp()">×</button>
  </div>
</div>
*/

// CSS для окон:
/*
.window-controls {
  display: none;  // Скрыто по умолчанию
  position: fixed;
  top: 0;
  right: 0;
  gap: 8px;
  padding: 8px;
  -webkit-app-region: drag;  // Сделать область перетаскиваемой
}

.window-controls button {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  -webkit-app-region: no-drag;  // Исключить кнопку из перетаскивания
}

.window-controls button:hover {
  color: #f1f5f9;
}
*/

// 7. ОБРАБОТКА OFFLINE РЕЖИМА (ELECTRON)
// =======================================

// В Electron приложение может работать без интернета
async function initializeApp() {
  // Сохраняем сообщения локально
  const pendingMessages = await ElectronBridge.storage.get('pending_messages') || [];
  
  // Когда приложение вернётся онлайн, отправляем их
  window.addEventListener('online', async () => {
    for (const msg of pendingMessages) {
      await sendMessage(msg);
    }
    await ElectronBridge.storage.delete('pending_messages');
  });
}

// 8. КЕШИРОВАНИЕ ДАННЫХ
// =====================

async function cacheUserData(userId, userData) {
  // Сохраняем в Electron Store (более надёжно чем localStorage)
  await ElectronBridge.storage.set(`user_${userId}`, userData);
}

async function getCachedUserData(userId) {
  return await ElectronBridge.storage.get(`user_${userId}`);
}

// 9. АВТОМАТИЧЕСКИЕ ОБНОВЛЕНИЯ (В ELECTRON)
// ===========================================

// Слушаем события обновления (настраивается в electron-builder)
// electron-updater автоматически проверяет обновления
// Уведомление появится автоматически

// 10. SHORTCUTS И ГОРЯЧИЕ КЛАВИШИ (ELECTRON)
// ============================================

// Можно настроить в electron/main.js
// Пример: Ctrl+K для поиска, Ctrl+, для настроек и т.д.
