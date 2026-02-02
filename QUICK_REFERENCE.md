# ⚡ Quick Reference - NovaChat Cross-Platform

**Шпаргалка для быстрого доступа к нужной информации**

---

## 🚀 Начать разработку (выберите платформу)

### Веб (в браузере)
```bash
npm start
# Откройте: http://localhost:3000/chat.html
```

### Electron (Desktop)
```bash
npm run electron-dev
# Приложение откроется автоматически
```

### React Native (Mobile)
```bash
# Android
cd mobile && npm run android

# iOS (только macOS)
cd mobile && npm run ios
```

---

## 📚 Найти нужную документацию

| Нужно... | Читать... |
|---------|-----------|
| **Быстро запустить** | [QUICK_START_CROSS_PLATFORM.md](QUICK_START_CROSS_PLATFORM.md) |
| **Понять архитектуру** | [ARCHITECTURE.md](ARCHITECTURE.md) |
| **Развернуть на сервер** | [CROSS_PLATFORM_GUIDE.md](CROSS_PLATFORM_GUIDE.md) |
| **Проверить совместимость** | [SUPPORTED_PLATFORMS.md](SUPPORTED_PLATFORMS.md) |
| **Перед боевым запуском** | [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) |
| **Примеры Electron кода** | [ELECTRON_INTEGRATION_EXAMPLES.js](ELECTRON_INTEGRATION_EXAMPLES.js) |
| **Навигация по докам** | [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) |
| **Список всех файлов** | [FILES_MANIFEST.md](FILES_MANIFEST.md) |

---

## 🛠️ Основные команды

### Backend
```bash
npm start              # Запустить
npm install            # Установить зависимости
NODE_ENV=production npm start   # Production режим
```

### Electron
```bash
npm run electron-dev   # Разработка
npm run build-windows  # Собрать для Windows
npm run build-mac      # Собрать для macOS
npm run build-linux    # Собрать для Linux
npm run build-all      # Собрать для всех
```

### React Native
```bash
cd mobile && npm install   # Установить зависимости
npm run android            # Запустить на Android
npm run ios                # Запустить на iOS
npm run build:android      # Собрать APK
npm run build:android:aab  # Собрать для Google Play
npm run build:ios          # Собрать для App Store
```

---

## 🔧 Конфигурация

### Переменные окружения (.env)
```env
DATABASE_URL=postgresql://...  # Подключение БД
SESSION_SECRET=...             # Секрет сессии
NODE_ENV=development           # production или development
PORT=3000                      # Порт сервера
REACT_APP_API_URL=...         # API URL для мобилы
```

### Для мобилы (если localhost не работает)
```bash
# Используйте IP вашего ПК вместо localhost
export REACT_APP_API_URL=http://192.168.1.100:3000
```

---

## 🐛 Решение проблем

| Проблема | Решение |
|----------|---------|
| Backend не запускается | Проверьте PostgreSQL: `psql -U postgres` |
| Порт 3000 занят | `npm install -g kill-port` → `kill-port 3000` |
| Electron не подключается | Убедитесь что backend запущен в другом терминале |
| Мобиль не видит backend | Используйте IP адрес вместо localhost |
| node_modules проблемы | `rm -rf node_modules package-lock.json` → `npm install` |

---

## 📱 Файлы приложения

### Веб (frontend)
- `public/chat.html` - главный интерфейс
- `public/chat-app.js` - логика
- `public/electron-bridge.js` - интеграция Electron

### Electron (desktop)
- `electron/main.js` - главный процесс
- `electron/preload.js` - безопасный bridge
- `electron-package.json` - конфиг сборки

### React Native (mobile)
- `mobile/App.js` - главный компонент
- `mobile/screens/LoginScreen.js` - вход
- `mobile/screens/ChatListScreen.js` - чаты
- `mobile/screens/ChatScreen.js` - сообщения
- `mobile/screens/ProfileScreen.js` - профиль

---

## 🌐 Поддерживаемые платформы

```
✅ Веб (Chrome, Firefox, Safari)
✅ Windows 10/11
✅ macOS 10.13+
✅ Linux (Ubuntu, Debian, Fedora)
✅ Android 5.0+
✅ iOS 12+
```

---

## 📊 Архитектура в двух словах

```
Backend (Node.js) ← одна база данных (PostgreSQL)
    ↓
    ├─ Веб (HTML/JavaScript)
    ├─ Electron (Windows, macOS, Linux)
    └─ React Native (Android, iOS)
```

---

## 🔐 Безопасность

- ✅ Пароли захешираны (bcrypt)
- ✅ WebSocket защищен токенами
- ✅ CORS включен
- ✅ Rate limiting включен
- ✅ Electron в sandbox режиме

---

## 📈 Производительность

| Платформа | Память | Диск |
|-----------|--------|------|
| Веб | 80-100 MB | — |
| Electron | 200-300 MB | 150 MB |
| Android | 100-150 MB | 80 MB |
| iOS | 150-200 MB | 120 MB |

---

## 🎯 Последовательность для новичков

1. **Прочитайте** [QUICK_START_CROSS_PLATFORM.md](QUICK_START_CROSS_PLATFORM.md) (5 мин)
2. **Запустите** `npm start` (1 мин)
3. **Откройте** http://localhost:3000/chat.html (1 мин)
4. **Протестируйте** на разных платформах (20 мин)
5. **Прочитайте** [ARCHITECTURE.md](ARCHITECTURE.md) (20 мин)

---

## 📝 Примеры кода Electron

```javascript
// Уведомление
await ElectronBridge.notify('Заголовок', 'Сообщение');

// Хранилище
await ElectronBridge.storage.set('key', { data: true });
const value = await ElectronBridge.storage.get('key');

// Управление окном
await ElectronBridge.window.minimize();
await ElectronBridge.window.toggleMaximize();
```

Больше примеров: [ELECTRON_INTEGRATION_EXAMPLES.js](ELECTRON_INTEGRATION_EXAMPLES.js)

---

## 🎛️ API Endpoints (Backend)

```
POST   /api/auth/register     - Регистрация
POST   /api/auth/login        - Вход
GET    /api/chats             - Список чатов
GET    /api/messages/:chatId  - Сообщения
POST   /api/messages          - Отправить сообщение
GET    /api/users/profile     - Профиль
```

---

## 🚢 Перед развёртыванием

1. ✅ Прочитайте [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)
2. ✅ Протестируйте все функции
3. ✅ Проверьте требования [SUPPORTED_PLATFORMS.md](SUPPORTED_PLATFORMS.md)
4. ✅ Настройте HTTPS
5. ✅ Установите резервные копии БД
6. ✅ Настройте мониторинг

---

## 🎁 Полезные ссылки

- **Electron**: https://www.electronjs.org/docs
- **React Native**: https://reactnative.dev/docs
- **Express**: https://expressjs.com/
- **Socket.io**: https://socket.io/docs/
- **PostgreSQL**: https://www.postgresql.org/docs/

---

## 📞 Нужна помощь?

1. **Быстрое решение**: [QUICK_START_CROSS_PLATFORM.md](QUICK_START_CROSS_PLATFORM.md) → "Решение проблем"
2. **Подробное объяснение**: [CROSS_PLATFORM_GUIDE.md](CROSS_PLATFORM_GUIDE.md) → "Решение проблем"
3. **Специфичный вопрос**: [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) - найдите нужный документ

---

## ✨ Готово!

Ваше приложение поддерживает:
- 🌐 **Web** (любой браузер)
- 💻 **Desktop** (Windows, macOS, Linux)
- 📱 **Mobile** (Android, iOS)

**Начните с**: `npm start` 🚀

---

**Версия**: 1.0.0 | **Дата**: 02.02.2026 | **Статус**: ✅ Production Ready
