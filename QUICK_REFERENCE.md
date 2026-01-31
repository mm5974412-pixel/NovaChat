# 🚀 Quick Reference Guide - Nexfery Features

## File Structure
```
NovaChat/
├── server.js                          # Backend API + Socket.IO
├── package.json                       # Dependencies
├── public/
│   ├── nexferies.html                # Nexfery UI
│   └── ... (other pages)
├── API_DOCUMENTATION.md               # Full API reference
├── TESTING_GUIDE.md                   # Testing procedures
├── IMPLEMENTATION_CHECKLIST.md        # Feature status
└── QUICK_REFERENCE.md                 # This file
```

---

## 🔥 Top 5 Most Important Changes

### 1. Database Tables
```sql
-- New tables for advanced features
nexfery_invites        -- Invitations system
message_reactions      -- Emoji reactions
message_read_receipts  -- Read status tracking
```

### 2. API Endpoints (11 New)
```
PATCH /api/nexferies/:id/messages/:mid    -- Edit message
DELETE /api/nexferies/:id/messages/:mid   -- Delete message
POST /api/messages/:mid/react              -- Add reaction
DELETE /api/messages/:mid/react            -- Remove reaction
POST /api/nexferies/:id/invite            -- Send invitation
POST /api/nexferies/invites/:iid/accept   -- Accept invite
POST /api/nexferies/invites/:iid/decline  -- Decline invite
DELETE /api/nexferies/:id                 -- Delete nexfery
POST /api/nexferies/:id/typing            -- Typing indicator
```

### 3. Rate Limiting
```javascript
const messageLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,  // 1 minute
  max: 20                    // 20 messages max
});
```

### 4. Socket.IO Events
```
Server → Client:
  message:edited
  message:deleted
  reaction:added/removed
  user:typing
  member:joined
  nexfery:deleted

Client → Server:
  nexfery:typing
  nexfery:user-status
  message:mark-read
```

### 5. Frontend Enhancements
```javascript
editMessage()          -- Edit message UI
deleteMessage()        -- Delete message UI
toggleReaction()       -- Add/remove emoji
showEmojiPicker()      -- Emoji selection
quickReact()          -- Quick emoji reaction
```

---

## 📋 API Endpoints Cheat Sheet

### Messages
```bash
# Get messages (paginated)
GET /api/nexferies/:nexferyId/messages?limit=50&offset=0

# Send message
POST /api/nexferies/:nexferyId/messages
Body: { "text": "..." }

# Edit message
PATCH /api/nexferies/:nexferyId/messages/:messageId
Body: { "text": "..." }

# Delete message
DELETE /api/nexferies/:nexferyId/messages/:messageId
```

### Reactions
```bash
# Add reaction
POST /api/messages/:messageId/react
Body: { "emoji": "👍" }

# Remove reaction
DELETE /api/messages/:messageId/react
Body: { "emoji": "👍" }
```

### Invitations
```bash
# Send invitation
POST /api/nexferies/:nexferyId/invite
Body: { "invitedUserId": 42 }

# Accept invitation
POST /api/nexferies/invites/:inviteId/accept

# Decline invitation
POST /api/nexferies/invites/:inviteId/decline
```

### Nexfery
```bash
# Delete nexfery
DELETE /api/nexferies/:nexferyId
```

---

## 🔐 Authorization Rules

| Action | Who Can Do It |
|--------|---------------|
| Edit message | Message author only |
| Delete message | Author OR Owner/Admin |
| React to message | Any member |
| Send invitation | Owner/Admin only |
| Accept/Decline invite | Invitee only |
| Delete nexfery | Owner only |

---

## 🔧 Common Tasks

### Add Message to Nexfery
```bash
curl -X POST http://localhost:3000/api/nexferies/1/messages \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"text":"Hello!"}'
```

### Add Reaction
```bash
curl -X POST http://localhost:3000/api/messages/123/react \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"emoji":"👍"}'
```

### Check Database
```bash
psql -U postgres -d novachat -c "SELECT * FROM message_reactions LIMIT 5;"
```

### View Server Logs
```bash
tail -f server-log.txt
```

### Test Rate Limiting
```bash
for i in {1..21}; do
  curl -X POST http://localhost:3000/api/nexferies/1/messages \
    -H "Content-Type: application/json" \
    -b cookies.txt \
    -d "{\"text\":\"Msg $i\"}"
done
```

---

## 🐛 Debugging

### Check Socket.IO Connection
```javascript
// In browser console
console.log(socket.connected)           // Should be true
socket.io.engine.transport.name         // Should be 'websocket'
console.log(socket.listeners('message:edited'))  // Check listeners
```

### Test API Endpoint
```bash
curl http://localhost:3000/api/nexferies/1/messages \
  -b cookies.txt | jq '.'
```

### Check Database Table
```bash
psql -U postgres -d novachat -c "\d message_reactions"
```

### Verify Rate Limiter
```javascript
// Send 21 messages quickly
for (i=0; i<21; i++) {
  fetch('/api/nexferies/1/messages', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({text: `Msg ${i}`})
  })
}
```

---

## 📊 Database Queries

### Aggregate Reactions per Message
```sql
SELECT 
  message_id,
  emoji,
  COUNT(*) as count
FROM message_reactions
GROUP BY message_id, emoji
ORDER BY message_id, count DESC;
```

### Get User's Nexferies
```sql
SELECT n.id, n.title
FROM nexferies n
JOIN nexferies_members m ON n.id = m.nexfery_id
WHERE m.user_id = :userId;
```

### Get Pending Invitations
```sql
SELECT i.id, n.title, u.username
FROM nexfery_invites i
JOIN nexferies n ON i.nexfery_id = n.id
JOIN users u ON i.invited_by_user_id = u.id
WHERE i.invited_user_id = :userId
AND i.status = 'pending'
AND i.expires_at > NOW();
```

### Get Message with Reactions
```sql
SELECT 
  m.id, m.text, m.created_at,
  (SELECT json_object_agg(emoji, count)
   FROM (
     SELECT emoji, COUNT(*) as count
     FROM message_reactions
     WHERE message_id = m.id
     GROUP BY emoji
   ) r) as reactions
FROM nexferies_messages m
WHERE m.id = :messageId;
```

---

## 🎯 Performance Tips

1. **Always use pagination**
   ```javascript
   fetch('/api/nexferies/1/messages?limit=50&offset=0')
   ```

2. **Cache reactions locally**
   - Store reaction counts in memory
   - Update on Socket.IO events
   - Don't refetch frequently

3. **Debounce typing indicator**
   - Emit only every 1 second
   - Clear timer on input change
   - Prevents spam

4. **Use indexes**
   - Already created on nexfery_id, user_id, message_id
   - Add more if needed for custom queries

5. **Batch operations**
   - Don't delete one message at a time
   - Use CASCADE for efficient cleanup

---

## 🚨 Common Errors

### 429 Too Many Requests
- Rate limit exceeded
- Wait 1 minute before sending more messages
- Check: `messageLimiter` config in server.js

### 403 Forbidden
- Not authorized for this action
- Check: User role and message ownership
- Verify: User is member of nexfery

### 404 Not Found
- Resource doesn't exist
- Check: ID is correct
- Verify: Resource wasn't deleted

### 400 Bad Request
- Invalid request format
- Check: JSON syntax
- Verify: Required fields present

### 500 Server Error
- Database or server issue
- Check: Server logs
- Restart: `npm start`

---

## 📱 Frontend Examples

### Send Message with Pagination
```javascript
async function loadMessages(nexferyId) {
  const response = await fetch(
    `/api/nexferies/${nexferyId}/messages?limit=50&offset=0`
  );
  const data = await response.json();
  
  console.log(data.messages);           // Array of messages
  console.log(data.pagination);         // { limit, offset, total, hasMore }
}
```

### Add Reaction
```javascript
async function addReaction(messageId, emoji) {
  const response = await fetch(`/api/messages/${messageId}/react`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ emoji })
  });
  
  if (response.ok) {
    console.log('Reaction added!');
  }
}
```

### Listen for Typing
```javascript
socket.on('user:typing', (data) => {
  console.log(`User ${data.userId} is typing: ${data.isTyping}`);
  
  if (data.isTyping) {
    showTypingIndicator(data.userId);
  } else {
    hideTypingIndicator(data.userId);
  }
});
```

### Handle Message Edited
```javascript
socket.on('message:edited', (data) => {
  const msg = document.getElementById(`msg-${data.messageId}`);
  if (msg) {
    msg.querySelector('.message-text').textContent = data.text;
    msg.querySelector('.edited-label').style.display = 'inline';
  }
});
```

---

## 🔄 Rate Limiting Details

| Config | Value | Purpose |
|--------|-------|---------|
| messageLimiter.windowMs | 60,000ms (1 min) | Time window |
| messageLimiter.max | 20 | Max messages per window |
| generalLimiter.windowMs | 900,000ms (15 min) | Time window |
| generalLimiter.max | 100 | Max requests per window |

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| API_DOCUMENTATION.md | Complete API reference |
| TESTING_GUIDE.md | Test procedures & examples |
| IMPLEMENTATION_CHECKLIST.md | Feature status & verification |
| QUICK_REFERENCE.md | This quick guide |

---

## 🎓 Learning Path

1. Read **API_DOCUMENTATION.md** for endpoint details
2. Follow **TESTING_GUIDE.md** to test each feature
3. Check **IMPLEMENTATION_CHECKLIST.md** for status
4. Use **QUICK_REFERENCE.md** for fast lookup

---

## 💡 Pro Tips

✅ **DO:**
- Use pagination for large message lists
- Cache reactions locally
- Debounce typing indicators
- Check user authorization before API calls
- Handle 429 errors gracefully
- Use Socket.IO for real-time updates
- Keep rate limiter config in mind

❌ **DON'T:**
- Send 20+ messages in 1 minute
- Make N+1 queries (use JOINs)
- Ignore error responses
- Block UI during API calls
- Store sensitive data in localStorage
- Bypass authorization checks
- Delete without confirmation

---

## 📞 Support Checklist

When something isn't working:

- [ ] Check server is running: `npm start`
- [ ] Check database connection: Look for "Database connected" in logs
- [ ] Check user is authenticated: Look for session cookie
- [ ] Check nexfery membership: Query members table
- [ ] Check rate limiting: Wait 1 minute for message limit
- [ ] Check Socket.IO connection: `console.log(socket.connected)`
- [ ] Check browser console for errors
- [ ] Check server logs: `tail -f server-log.txt`
- [ ] Restart server if needed

---

**Last Updated:** 2026-01-31  
**Version:** 1.0.0  
**For:** NovaChat Nexfery System  
**Status:** Ready for Production ✅
