# 🏗️ Архитектура NovaChat Cross-Platform

## 📐 Общая архитектура

```
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                      │
│                  (Единая база для всех)                    │
└────────────┬────────────────────────────────┬───────────────┘
             │                                │
    ┌────────▼────────┐            ┌──────────▼──────────┐
    │  Node.js Server │            │   WebSocket/Socket  │
    │  (Express + API)│◄───────────►│    (Real-time)      │
    │   Backend       │            │                     │
    └────────┬────────┘            └─────────────────────┘
             │
    ┌────────┴──────────────────────────────────────────┐
    │                                                    │
    ▼                    ▼                  ▼            ▼
 ┌──────┐          ┌──────────┐       ┌────────┐  ┌──────────┐
 │ 🌐   │          │💻        │       │📱      │  │📱        │
 │ Web  │          │Electron  │       │React   │  │React     │
 │(HTML)│          │(Desktop) │       │Native  │  │Native    │
 │      │          │W/M/L     │       │Android │  │iOS       │
 └──────┘          └──────────┘       └────────┘  └──────────┘
   PWA           Cross-Platform        Мобильное   Мобильное
  Версия         Десктоп               приложение приложение
```

---

## 🔄 Модульная архитектура

### Backend (Общий для всех платформ)

```
server.js (Главная точка входа)
    │
    ├── /api
    │   ├── /auth (регистрация, логин)
    │   ├── /users (профиль, поиск)
    │   ├── /chats (список, создание)
    │   ├── /messages (отправка, получение)
    │   ├── /media (загрузка файлов)
    │   └── /stats (статистика)
    │
    ├── /socket.io
    │   ├── user-online (подключение)
    │   ├── user-typing (печать)
    │   ├── new-message (новое сообщение)
    │   ├── message-read (прочитано)
    │   └── user-status (статус)
    │
    └── /public (статические файлы)
        ├── *.html (веб интерфейс)
        ├── *.js (логика фронтенда)
        ├── *.css (стили)
        └── /uploads (пользовательские файлы)
```

### Frontend по платформам

#### 🌐 Веб (HTML5 + JS)
```
public/
├── chat.html (главный интерфейс)
├── login.html (вход)
├── register.html (регистрация)
├── profile.html (профиль)
├── chat-app.js (логика приложения)
├── mobile-utils.js (мобильная оптимизация)
├── service-worker.js (PWA поддержка)
├── style-v2.css (основные стили)
├── style-mobile.css (мобильные стили)
├── electron-bridge.js (интеграция с Electron)
└── theme-toggle.js (переключение темы)
```

#### 💻 Electron (Node.js + Renderer)
```
electron/
├── main.js (Main Process)
│   ├── Window management
│   ├── Menu creation
│   ├── IPC handlers
│   └── System integration
│
├── preload.js (Secure IPC bridge)
│   ├── notifications
│   ├── storage API
│   └── window controls
│
└── electron-package.json (build config)
    ├── NSIS (Windows installer)
    ├── DMG (macOS)
    └── AppImage/DEB (Linux)
```

#### 📱 React Native (Cross-Platform Mobile)
```
mobile/
├── App.js (Root component)
│   ├── Navigation stack
│   ├── Auth check
│   └── State management
│
├── screens/
│   ├── LoginScreen.js (Вход)
│   ├── ChatListScreen.js (Список чатов)
│   ├── ChatScreen.js (Просмотр чата)
│   └── ProfileScreen.js (Профиль)
│
├── services/
│   ├── api.js (HTTP requests)
│   └── socket.js (WebSocket)
│
├── android/ (Android config)
│   └── build.gradle (для сборки APK)
│
└── ios/ (iOS config)
    └── Podfile (для CocoaPods)
```

---

## 🔐 Безопасность архитектуры

```
┌─ Electron App (Sandbox)
│  └─ Preload Script (IPC Bridge)
│     └─ Main Process (Node.js - Limited)
│
├─ Web App (Browser Sandbox)
│  └─ Service Worker (Limited permissions)
│
└─ React Native App (OS Sandbox)
   └─ Native modules (Constrained access)

Все ──────────► HTTPS/TLS
             ──────────► Authentication Token
             ──────────► Rate Limiting
             ──────────► Input Validation
```

---

## 💾 Хранение данных

### Backend (PostgreSQL)
```
users (id, email, password_hash, username, avatar_url)
chats (id, user1_id, user2_id, created_at)
messages (id, chat_id, sender_id, text, type, created_at)
sessions (sid, sess, expire) [express-session]
```

### Electron (electron-store)
```
{
  "window": { "width": 1200, "height": 800 },
  "auth": { "token": "...", "userId": "..." },
  "cache": { "chats": [...], "messages": {...} },
  "preferences": { "theme": "dark", "notifications": true }
}
```

### React Native (AsyncStorage)
```
{
  "auth_token": "...",
  "user_id": "...",
  "user_data": { ... },
  "chats_cache": [...],
  "notifications_enabled": true
}
```

### Веб (localStorage + Service Worker Cache)
```
localStorage: {
  "auth_token": "...",
  "theme": "dark"
}

Service Worker Cache:
  /static/... (кешированные ассеты)
  /api/chats (кешированные запросы)
```

---

## 🚀 Развёртывание по платформам

```
Development (Локально)
├── npm start (Backend on port 3000)
├── npm run electron-dev (Electron + Backend)
├── npm run android (React Native on device/emulator)
└── http://localhost:3000 (Веб)

Staging (Pre-production)
├── Backend: Docker container
├── Database: PostgreSQL cloud
├── Electron: Auto-update server
├── Mobile: TestFlight / Firebase TestLab
└── Web: Static hosting

Production
├── Backend: Linux server / Docker / Cloud (AWS/Azure/GCP)
├── Database: Managed PostgreSQL
├── Electron: GitHub Releases / S3 CDN
├── Mobile: App Store / Google Play
└── Web: CDN / Static hosting
```

---

## 📊 Производительность по платформам

### Веб
- First Load: ~2-3 сек
- Runtime: ~80-100 MB RAM
- Network: 5 Mbps recommended
- Offline: Partial (Service Worker cache)

### Electron
- Startup: ~1-2 сек
- Runtime: ~200-300 MB RAM
- Storage: ~150 MB disk
- Offline: Full (SQLite cache possible)

### React Native
- Startup: ~1-2 сек
- Runtime: ~100-150 MB RAM (Android), ~150-200 MB (iOS)
- Storage: ~100 MB disk
- Offline: Full (AsyncStorage + SQLite)

---

## 🔄 Sync Strategy

```
┌─────────────────────────────────┐
│   Backend (Single Source Truth) │
└────────────┬────────────────────┘
             │
    ┌────────┴────────────────────────────────┐
    │                                         │
    ▼                     ▼                   ▼
┌────────┐         ┌────────────┐       ┌────────┐
│  Web   │         │  Electron  │       │Mobile  │
│ Cache  │         │   Store    │       │Storage │
└────────┘         └────────────┘       └────────┘
    │                   │                   │
    └───────────────────┼───────────────────┘
                        │
                WebSocket Events
            (Real-time synchronization)
```

---

## 🗺️ Дорожная карта

### v1.0.0 ✅ (Текущая - 02.02.2026)
- ✅ Backend (Express + PostgreSQL)
- ✅ Веб приложение (HTML5 + PWA)
- ✅ Electron (Windows, macOS, Linux)
- ✅ React Native (Android, iOS)
- ✅ Real-time чаты (Socket.io)
- ✅ Аутентификация + Авторизация

### v1.1.0 (Q1 2026)
- 🔄 Видео вызовы (WebRTC)
- 🔄 Голосовые сообщения
- 🔄 Шифрование E2E (опционально)
- 🔄 Offline синхронизация

### v1.2.0 (Q2 2026)
- 🔄 Группы чатов
- 🔄 Стикеры + Emoji
- 🔄 Поиск в истории
- 🔄 Экспорт чатов

### v2.0.0 (Q3 2026)
- 🔄 Бизнес версия (Teams)
- 🔄 Боты и интеграции
- 🔄 Облачное хранилище
- 🔄 Advanced analytics

---

## 📈 Масштабируемость

```
Single Server (< 1000 users)
├── Node.js single instance
├── PostgreSQL single instance
└── All on one machine

Scaled (1000-100k users)
├── Node.js cluster (multiple instances)
├── Load balancer (nginx/HAProxy)
├── PostgreSQL with read replicas
└── Redis for caching
└── S3 for file storage

Enterprise (100k+ users)
├── Kubernetes deployment
├── Managed database (RDS/Cloud SQL)
├── Distributed caching (Redis cluster)
├── Global CDN (Cloudflare/CloudFront)
└── Message queue (RabbitMQ/Kafka)
```

---

## 🔌 API Gateway Pattern (Будущее)

```
┌─────────────────────────────────┐
│      API Gateway                │
│  (Rate Limit, Auth, Routing)    │
└────────────┬────────────────────┘
             │
    ┌────────┴──────────────────┐
    ▼                           ▼
┌──────────┐            ┌──────────────┐
│ REST API │            │WebSocket Hub │
│ (Express)│            │  (Socket.io) │
└──────────┘            └──────────────┘
    │                          │
    └──────────┬───────────────┘
               │
         PostgreSQL
```

---

**Архитектура дата**: 02.02.2026  
**Версия**: 1.0.0  
**Статус**: Production Ready ✅
