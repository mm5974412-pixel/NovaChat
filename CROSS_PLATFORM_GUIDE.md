# 🚀 Кросс-платформенный NovaChat - Полное руководство развёртывания

> **Статус**: ✅ Готово к развёртыванию на всех платформах  
> **Дата**: 02.02.2026  
> **Версия**: 1.0.0

---

## 📋 Содержание

1. [Архитектура проекта](#архитектура-проекта)
2. [Требования](#требования)
3. [Развёртывание Backend](#развёртывание-backend)
4. [Развёртывание Electron (Десктоп)](#развёртывание-electron-десктоп)
5. [Развёртывание React Native (Мобиль)](#развёртывание-react-native-мобиль)
6. [Структура файлов](#структура-файлов)
7. [CI/CD Pipeline](#cicd-pipeline)

---

## 🏗️ Архитектура проекта

```
NovaChat (Кросс-платформенный мессенджер)
├── Backend (Node.js + Express + PostgreSQL)
│   ├── server.js (основной сервер)
│   ├── API endpoints
│   └── WebSocket (Socket.io)
│
├── Web (React/HTML5)
│   ├── public/*.html
│   └── public/*.js
│
├── Desktop (Electron)
│   ├── electron/main.js (процесс приложения)
│   ├── electron/preload.js (мост между процессами)
│   └── Поддержка: Windows, macOS, Linux
│
└── Mobile (React Native)
    ├── mobile/App.js
    ├── mobile/screens/*.js
    └── Поддержка: iOS, Android
```

### Общие компоненты
- Один Backend для всех клиентов
- WebSocket для real-time синхронизации
- REST API для основных операций
- Одна база данных PostgreSQL

---

## 📦 Требования

### Глобально (для всех платформ)
- **Node.js** 16+ ([download](https://nodejs.org))
- **npm** 7+ или **yarn** 1.22+
- **PostgreSQL** 12+ (база данных)
- **Git** для версионирования

### Для Electron (Десктоп)
- **Windows**: Visual C++ Build Tools (автоматично при сборке)
- **macOS**: Xcode Command Line Tools (`xcode-select --install`)
- **Linux**: build-essential, python3

### Для React Native (Мобиль)
- **Android**:
  - Android Studio
  - JDK 11+
  - Android SDK (API level 31+)
  
- **iOS**:
  - macOS 11+
  - Xcode 13+
  - CocoaPods

---

## 🔧 Развёртывание Backend

### 1. Подготовка
```bash
# Перейдите в корневую папку проекта
cd c:\Users\mm597\Desktop\NovaChat

# Установите зависимости
npm install
```

### 2. Настройка переменных окружения
```bash
# Проверьте .env файл
cat .env

# Если его нет, создайте:
# DATABASE_URL=postgresql://user:password@localhost:5432/novachat
# SESSION_SECRET=your-secret-key-here
# NODE_ENV=production
```

### 3. Подготовка базы данных
```bash
# Убедитесь что PostgreSQL запущен
# Создайте базу данных (если её ещё нет)

psql -U postgres -c "CREATE DATABASE novachat;"
```

### 4. Запуск сервера
```bash
# Разработка (с hot-reload)
npm start

# Продакшн
NODE_ENV=production npm start

# Сервер будет доступен на http://localhost:3000
```

### 5. Проверка статуса
```bash
# API должен быть доступен
curl http://localhost:3000/api/health

# Ответ:
# {"status":"ok","message":"Server is running"}
```

---

## 💻 Развёртывание Electron (Десктоп)

### Структура Electron проекта
```
electron/
├── main.js              # Главный процесс
├── preload.js           # Безопасный мост между процессами
└── electron-package.json # Конфиг сборки
```

### Для Windows

#### 1. Подготовка
```bash
# Перейдите в папку проекта
cd c:\Users\mm597\Desktop\NovaChat

# Убедитесь что зависимости установлены
npm install electron electron-builder --save-dev
```

#### 2. Разработка (с горячей перезагрузкой)
```bash
# Запустите dev сервер и Electron одновременно
npm run electron-dev

# Это запустит:
# - Web сервер на http://localhost:3000
# - Electron приложение, подключенное к нему
```

#### 3. Сборка для Windows
```bash
# Создает инсталлятор для Windows
npm run build-windows

# Результаты в папке dist/:
# - NovaChat.exe (portable версия)
# - NovaChat Setup 1.0.0.exe (инсталлятор NSIS)
# - NovaChat 1.0.0.exe (MSI инсталлятор)
```

#### 4. Распространение
- Скопируйте `dist/NovaChat Setup 1.0.0.exe` пользователям
- Инсталлятор автоматически установит приложение

### Для macOS

#### 1. Сборка
```bash
npm run build-mac

# Результаты в папке dist/:
# - NovaChat-1.0.0.dmg (DMG образ)
# - NovaChat-1.0.0.zip (ZIP архив)
```

#### 2. Подпись кода (для Apple Notarization)
```bash
# Требуется Apple Developer certificate
# Настройте в electron-builder конфиге:
# "certificateFile": "path/to/certificate.p12"
# "certificatePassword": "password"
```

### Для Linux

#### 1. Сборка
```bash
npm run build-linux

# Результаты в папке dist/:
# - novachat-1.0.0.AppImage (AppImage)
# - novachat_1.0.0_amd64.deb (Debian пакет)
```

#### 2. Установка (для пользователей)
```bash
# AppImage
chmod +x novachat-1.0.0.AppImage
./novachat-1.0.0.AppImage

# Или через Debian
sudo apt install ./novachat_1.0.0_amd64.deb
```

### Сборка для всех платформ одновременно
```bash
npm run build-all

# Создает инсталляторы для Windows, macOS и Linux
# Требует соответствующие сертификаты для подписания
```

---

## 📱 Развёртывание React Native (Мобиль)

### Структура проекта
```
mobile/
├── App.js                   # Главный компонент
├── screens/                 # Экраны приложения
│   ├── LoginScreen.js
│   ├── ChatListScreen.js
│   ├── ChatScreen.js
│   └── ProfileScreen.js
├── package.json
├── android/                 # Проект Android
└── ios/                     # Проект iOS
```

### Подготовка
```bash
# Перейдите в папку mobile
cd c:\Users\mm597\Desktop\NovaChat\mobile

# Установите зависимости
npm install
```

### Для Android

#### 1. Подготовка окружения
```bash
# Установите Android Studio
# https://developer.android.com/studio

# Добавьте переменные окружения (Windows):
# JAVA_HOME = C:\Program Files\Android\Android Studio\jre
# ANDROID_HOME = C:\Users\YourUsername\AppData\Local\Android\Sdk
# PATH += %JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\tools

# Проверьте установку
adb devices
```

#### 2. Разработка
```bash
# Запустите Metro bundler
npm start

# В другом терминале, запустите приложение
npm run android

# Это запустит приложение на подключенном устройстве или эмуляторе
```

#### 3. Сборка релиза
```bash
# Создание APK (инсталляемый файл)
npm run build:android

# Результат: android/app/build/outputs/apk/release/app-release.apk

# Или создайте AAB (для Google Play Store)
npm run build:android:aab

# Результат: android/app/build/outputs/bundle/release/app-release.aab
```

#### 4. Распространение
- **Google Play Store**:
  1. Создайте Developer аккаунт ($25 one-time)
  2. Загрузите AAB на Play Console
  3. Настройте листинг и опубликуйте

- **APK напрямую**:
  - Разместите APK на веб-сайте
  - Пользователи могут установить на Android устройства

### Для iOS

#### 1. Подготовка (только на macOS)
```bash
# Установите Xcode (из App Store)
# Установите CocoaPods
sudo gem install cocoapods

# Подготовьте iOS зависимости
cd ios && pod install && cd ..
```

#### 2. Разработка
```bash
# Запустите Metro bundler
npm start

# В другом терминале, запустите на симуляторе
npm run ios

# Или на реальном устройстве
npm run ios -- --device --configuration Release
```

#### 3. Сборка релиза
```bash
npm run build:ios

# Откроется Xcode с проектом
# Выберите: Product → Archive
# Затем: Organizer → Distribute App
```

#### 4. Распространение
- **App Store**:
  1. Создайте Apple Developer аккаунт ($99/год)
  2. Создайте сертификаты и provisioning profiles
  3. Архивируйте приложение в Xcode
  4. Загрузите через App Store Connect

---

## 📂 Структура файлов

### Корневая папка
```
NovaChat/
├── .env                      # Переменные окружения
├── package.json              # Зависимости (backend)
├── electron-package.json     # Конфиг Electron
├── server.js                 # Главный сервер
│
├── electron/                 # Electron приложение
│   ├── main.js
│   └── preload.js
│
├── mobile/                   # React Native приложение
│   ├── App.js
│   ├── screens/
│   ├── android/
│   ├── ios/
│   └── package.json
│
├── public/                   # Веб приложение
│   ├── *.html
│   ├── *.js
│   ├── *.css
│   ├── electron-bridge.js    # Мост для Electron
│   └── icons/
│
└── README.md                 # Этот файл
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions (автоматическая сборка при push)

Создайте `.github/workflows/build.yml`:

```yaml
name: Build and Release

on:
  push:
    tags:
      - 'v*'

jobs:
  build-windows:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build-windows
      - uses: softprops/action-gh-release@v1
        with:
          files: dist/NovaChat*.exe

  build-mac:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build-mac
      - uses: softprops/action-gh-release@v1
        with:
          files: dist/NovaChat*.dmg

  build-linux:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build-linux
      - uses: softprops/action-gh-release@v1
        with:
          files: dist/novachat*.AppImage
```

### Запуск CI/CD
```bash
# Создайте тег и push
git tag v1.0.0
git push origin v1.0.0

# GitHub Actions автоматически создаст инсталляторы
```

---

## 🧪 Тестирование

### Веб приложение
```bash
npm start
# Откройте http://localhost:3000/chat.html
```

### Electron
```bash
npm run electron-dev
# Приложение откроется автоматически
```

### React Native Android
```bash
npm run android
# Будет запущено на подключенном устройстве
```

### React Native iOS
```bash
npm run ios
# Будет запущено на симуляторе
```

---

## 🐛 Решение проблем

### Backend не запускается
```bash
# Проверьте PostgreSQL
psql -U postgres -c "SELECT version();"

# Проверьте переменные .env
cat .env

# Очистите node_modules и переустановите
rm -rf node_modules package-lock.json
npm install
```

### Electron не подключается к серверу
```bash
# Проверьте что сервер запущен
curl http://localhost:3000

# Проверьте firewall
# Windows: Allow node.exe in Windows Defender
```

### React Native не собирается
```bash
# Очистьте кеш
npm run android -- --clear-cache

# Переустановите зависимости
cd mobile && npm install && cd ..

# Проверьте Android Studio SDK
$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager --list
```

---

## 📊 Мониторинг

### Логирование
- Backend логи: консоль при запуске
- Electron логи: DevTools (F12)
- React Native логи: `react-native log-android` или `react-native log-ios`

### Статистика пользователей
- Количество пользователей онлайн: `/api/stats`
- История активности: PostgreSQL логи

---

## 🔐 Безопасность

- ✅ Все пароли захеширани (bcrypt)
- ✅ WebSocket защищен аутентификацией
- ✅ HTTPS в продакшене (используйте reverse proxy как nginx)
- ✅ Rate limiting на API
- ✅ CORS настроен для безопасности

---

## 📞 Поддержка

Для вопросов или проблем:
1. Проверьте логи в консоли
2. Убедитесь что все зависимости установлены
3. Проверьте переменные окружения
4. Перезагрузите сервис

---

**Версия**: 1.0.0  
**Дата обновления**: 02.02.2026  
**Статус**: ✅ Production-ready
