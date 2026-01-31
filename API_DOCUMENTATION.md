# 📚 API Documentation: Nexfery Features

## 1. MESSAGING API

### Get Messages (с Pagination)
```http
GET /api/nexferies/:nexferyId/messages?limit=50&offset=0
```

**Параметры запроса:**
- `limit` (number, default: 50, max: 100) - количество сообщений
- `offset` (number, default: 0) - смещение

**Ответ:**
```json
{
  "ok": true,
  "messages": [
    {
      "id": 1,
      "text": "Hello",
      "author": "John",
      "authorId": 5,
      "authorAvatar": "data:image/...",
      "createdAt": "2026-01-31T12:00:00Z",
      "isEdited": false,
      "editedAt": null,
      "reactions": {
        "👍": 2,
        "❤️": 1
      },
      "isOwnMessage": false
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 100,
    "hasMore": true
  }
}
```

### Send Message (с Rate Limiting)
```http
POST /api/nexferies/:nexferyId/messages
Content-Type: application/json

{
  "text": "Hello world"
}
```

**Rate Limit:** 20 сообщений за 1 минуту

---

## 2. MESSAGE EDITING & DELETION

### Edit Message
```http
PATCH /api/nexferies/:nexferyId/messages/:messageId
Content-Type: application/json

{
  "text": "Updated text"
}
```

**Ограничения:** Только автор сообщения может редактировать

**Socket Event:** `message:edited`

### Delete Message
```http
DELETE /api/nexferies/:nexferyId/messages/:messageId
```

**Ограничения:** Автор или администратор нексферы

**Socket Event:** `message:deleted`

---

## 3. REACTIONS API

### Add Reaction
```http
POST /api/messages/:messageId/react
Content-Type: application/json

{
  "emoji": "👍"
}
```

**Socket Event:** `reaction:added`

### Remove Reaction
```http
DELETE /api/messages/:messageId/react
Content-Type: application/json

{
  "emoji": "👍"
}
```

**Socket Event:** `reaction:removed`

---

## 4. INVITATIONS API

### Send Invitation
```http
POST /api/nexferies/:nexferyId/invite
Content-Type: application/json

{
  "invitedUserId": 42
}
```

**Ограничения:** Только владелец или администратор

**Ответ:**
```json
{
  "ok": true,
  "invite": {
    "id": 1,
    "created_at": "2026-01-31T12:00:00Z",
    "expires_at": "2026-02-07T12:00:00Z"
  }
}
```

**Socket Event:** `invitation:new`

### Accept Invitation
```http
POST /api/nexferies/invites/:inviteId/accept
```

**Socket Event:** `member:joined`

### Decline Invitation
```http
POST /api/nexferies/invites/:inviteId/decline
```

---

## 5. NEXFERY MANAGEMENT

### Delete Nexfery
```http
DELETE /api/nexferies/:nexferyId
```

**Ограничения:** Только владелец

**Socket Event:** `nexfery:deleted`
**Global Event:** `nexus:updated` (обновляет ленту)

---

## 6. TYPING INDICATOR

### Send Typing Status
```http
POST /api/nexferies/:nexferyId/typing
Content-Type: application/json

{
  "isTyping": true
}
```

**Socket Event:** `user:typing`

---

## 7. SOCKET.IO EVENTS

### Server → Client Events

| Event | Payload | Описание |
|-------|---------|---------|
| `nexfery:new-message` | `{ message: Object }` | Новое сообщение |
| `message:edited` | `{ messageId, text, editedAt }` | Сообщение отредактировано |
| `message:deleted` | `{ messageId }` | Сообщение удалено |
| `reaction:added` | `{ messageId, userId, emoji }` | Реакция добавлена |
| `reaction:removed` | `{ messageId, userId, emoji }` | Реакция удалена |
| `user:typing` | `{ userId, isTyping }` | Печать пользователя |
| `member:joined` | `{ nexferyId, userId }` | Член присоединился |
| `member:status-changed` | `{ userId, status, timestamp }` | Статус члена изменился |
| `nexfery:deleted` | `{ nexferyId }` | Нексфера удалена |
| `nexus:updated` | - | Нексолента обновлена |

### Client → Server Events

| Event | Payload |
|-------|---------|
| `join-nexfery` | `nexferyId` |
| `leave-nexfery` | `nexferyId` |
| `nexfery:typing` | `{ nexferyId, userId, isTyping }` |
| `nexfery:user-status` | `{ nexferyId, userId, status }` |
| `message:mark-read` | `{ messageId, userId }` |

---

## 8. RATE LIMITING

### Configured Limiters

**Message Limiter:**
- Window: 1 минута
- Max: 20 сообщений
- Endpoints: `POST /api/nexferies/:nexferyId/messages`

**General Limiter:**
- Window: 15 минут
- Max: 100 запросов
- Endpoints: Все остальные (опционально)

---

## 9. ERROR RESPONSES

```json
{
  "ok": false,
  "error": "Descriptive error message"
}
```

### Common Error Codes

| Status | Error | Meaning |
|--------|-------|---------|
| 400 | Bad Request | Неправильный формат запроса |
| 403 | Forbidden | Недостаточно прав |
| 404 | Not Found | Ресурс не найден |
| 429 | Too Many Requests | Rate limit превышен |
| 500 | Server Error | Ошибка сервера |

---

## 10. FRONTEND INTEGRATION EXAMPLE

```javascript
// Создать клиента
const nexferyClient = {
  async sendMessage(nexferyId, text) {
    const res = await fetch(`/api/nexferies/${nexferyId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    return await res.json();
  },

  async editMessage(nexferyId, messageId, text) {
    const res = await fetch(`/api/nexferies/${nexferyId}/messages/${messageId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    return await res.json();
  },

  async addReaction(messageId, emoji) {
    const res = await fetch(`/api/messages/${messageId}/react`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emoji })
    });
    return await res.json();
  },

  async sendInvite(nexferyId, invitedUserId) {
    const res = await fetch(`/api/nexferies/${nexferyId}/invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invitedUserId })
    });
    return await res.json();
  }
};

// Использование Socket.io
const socket = io();

socket.on('nexfery:new-message', (msg) => {
  console.log('New message:', msg);
});

socket.on('message:edited', (data) => {
  console.log('Message edited:', data);
});

socket.on('reaction:added', (data) => {
  console.log('Reaction added:', data);
});

socket.on('user:typing', (data) => {
  console.log('User typing:', data.isTyping);
});
```

---

## 11. MIGRATION & DATABASE

### New Tables

```sql
-- Таблица для реакций
CREATE TABLE message_reactions (
  id SERIAL PRIMARY KEY,
  message_id INTEGER REFERENCES nexferies_messages(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  emoji VARCHAR(10),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(message_id, user_id, emoji)
);

-- Таблица для приглашений
CREATE TABLE nexfery_invites (
  id SERIAL PRIMARY KEY,
  nexfery_id INTEGER REFERENCES nexferies(id) ON DELETE CASCADE,
  invited_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  invited_by_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP + INTERVAL '7 days',
  UNIQUE(nexfery_id, invited_user_id)
);

-- Таблица для отметок "прочитано"
CREATE TABLE message_read_receipts (
  id SERIAL PRIMARY KEY,
  message_id INTEGER REFERENCES nexferies_messages(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(message_id, user_id)
);
```

### New Indexes

```sql
CREATE INDEX idx_messages_nexfery ON nexferies_messages(nexfery_id);
CREATE INDEX idx_messages_created ON nexferies_messages(created_at DESC);
CREATE INDEX idx_members_nexfery ON nexferies_members(nexfery_id);
CREATE INDEX idx_members_user ON nexferies_members(user_id);
CREATE INDEX idx_reactions_message ON message_reactions(message_id);
CREATE INDEX idx_invites_user ON nexfery_invites(invited_user_id);
```

---

## 12. BEST PRACTICES

✅ **DO:**
- Всегда проверяйте авторизацию перед операциями
- Используйте pagination для больших наборов данных
- Подтверждайте действия перед удалением
- Отправляйте typing indicator каждые 1000ms
- Обновляйте UI через Socket.io события

❌ **DON'T:**
- Не отправляйте более 20 сообщений в минуту
- Не удаляйте сообщения других пользователей (кроме админа)
- Не игнорируйте ошибки авторизации
- Не блокируйте UI при загрузке данных
- Не забывайте `socket.emit('leave-nexfery', id)` при выходе

---

Generated: 2026-01-31
Version: 1.0.0
