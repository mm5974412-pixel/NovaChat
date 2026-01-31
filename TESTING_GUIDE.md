# 🧪 Testing Guide: Nexfery Features

## Prerequisites
- Server running: `npm start`
- Browser console open (F12)
- Postman or curl installed (for API testing)
- Multiple browser windows/tabs (for multi-user testing)

---

## Phase 1: Basic Setup Testing

### 1.1 Server Startup Check
```bash
npm start
# Expected output:
# Server is running on port 3000
# Database connected
# Socket.IO ready
```

### 1.2 Database Tables Verification
```bash
psql -U postgres -d novachat -c "
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';"
```

**Expected tables:**
- `users`
- `nexferies`
- `nexferies_members`
- `nexferies_messages`
- `message_reactions` ✨ NEW
- `nexfery_invites` ✨ NEW
- `message_read_receipts` ✨ NEW

---

## Phase 2: Message Features Testing

### 2.1 Sending Messages
```bash
# Login first to get session cookie
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password"}' \
  -c cookies.txt

# Send message to nexfery (ID: 1)
curl -X POST http://localhost:3000/api/nexferies/1/messages \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"text":"Hello Nexfery!"}'

# Expected response:
# {"ok":true,"message":{"id":123,"text":"Hello Nexfery!","authorId":1,...}}
```

### 2.2 Fetching Messages with Pagination
```bash
# Get first 10 messages
curl http://localhost:3000/api/nexferies/1/messages?limit=10&offset=0 \
  -b cookies.txt

# Get next 10 messages
curl http://localhost:3000/api/nexferies/1/messages?limit=10&offset=10 \
  -b cookies.txt

# Expected response includes:
# - messages array (reverse chronological)
# - pagination object with total, hasMore
```

### 2.3 Rate Limiting Test
```bash
# Send 21 messages rapidly (should block 21st)
for i in {1..21}; do
  curl -X POST http://localhost:3000/api/nexferies/1/messages \
    -H "Content-Type: application/json" \
    -b cookies.txt \
    -d "{\"text\":\"Message $i\"}"
done

# Expected: After 20 messages, you get:
# {"ok":false,"error":"Слишком много сообщений, подождите"}
```

### 2.4 Edit Message
```bash
# Edit message (ID: 123) that you own
curl -X PATCH http://localhost:3000/api/nexferies/1/messages/123 \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"text":"Updated message text"}'

# Expected response:
# {"ok":true,"message":{"id":123,"text":"Updated message text","isEdited":true,"editedAt":"2026-01-31T12:00:00Z"}}
```

### 2.5 Delete Message
```bash
# Delete message (ID: 123)
curl -X DELETE http://localhost:3000/api/nexferies/1/messages/123 \
  -b cookies.txt

# Expected response:
# {"ok":true,"message":"Сообщение удалено"}
```

---

## Phase 3: Reactions Testing

### 3.1 Add Reaction
```bash
# Add 👍 reaction to message (ID: 123)
curl -X POST http://localhost:3000/api/messages/123/react \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"emoji":"👍"}'

# Expected response:
# {"ok":true,"reaction":{"emoji":"👍","count":1}}
```

### 3.2 Multiple Reactions
```bash
# Add same reaction from different users
# User 1:
curl -X POST http://localhost:3000/api/messages/123/react \
  -H "Content-Type: application/json" \
  -b cookies1.txt \
  -d '{"emoji":"❤️"}'

# User 2:
curl -X POST http://localhost:3000/api/messages/123/react \
  -H "Content-Type: application/json" \
  -b cookies2.txt \
  -d '{"emoji":"❤️"}'

# Get message and verify reactions appear:
curl http://localhost:3000/api/nexferies/1/messages?limit=1 \
  -b cookies1.txt | jq '.messages[0].reactions'

# Expected output:
# {"❤️": 2, "👍": 1}
```

### 3.3 Remove Reaction
```bash
# Remove 👍 reaction
curl -X DELETE http://localhost:3000/api/messages/123/react \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"emoji":"👍"}'

# Expected response:
# {"ok":true,"message":"Реакция удалена"}
```

---

## Phase 4: Invitations Testing

### 4.1 Send Invitation
```bash
# Owner invites User 2 (ID: 2) to Nexfery 1
curl -X POST http://localhost:3000/api/nexferies/1/invite \
  -H "Content-Type: application/json" \
  -b owner_cookies.txt \
  -d '{"invitedUserId":2}'

# Expected response:
# {"ok":true,"invite":{"id":456,"created_at":"...","expires_at":"..."}}
```

### 4.2 Accept Invitation
```bash
# User 2 accepts the invitation (ID: 456)
curl -X POST http://localhost:3000/api/nexferies/invites/456/accept \
  -b user2_cookies.txt

# Expected response:
# {"ok":true,"message":"Приглашение принято"}

# Verify user is now a member
curl http://localhost:3000/api/nexferies/1/members \
  -b owner_cookies.txt | jq '.members | length'
```

### 4.3 Decline Invitation
```bash
# Send another invitation
curl -X POST http://localhost:3000/api/nexferies/1/invite \
  -H "Content-Type: application/json" \
  -b owner_cookies.txt \
  -d '{"invitedUserId":3}'

# User 3 declines (ID: 789)
curl -X POST http://localhost:3000/api/nexferies/invites/789/decline \
  -b user3_cookies.txt

# Expected response:
# {"ok":true,"message":"Приглашение отклонено"}
```

---

## Phase 5: Typing Indicator Testing

### 5.1 Browser Test (Recommended)
```javascript
// In browser console while on nexferies.html
// Open two browser tabs with the same nexfery

// In Tab 1:
socket.emit('nexfery:typing', { 
  nexferyId: 1, 
  userId: 1, 
  isTyping: true 
});

// In Tab 2:
socket.on('user:typing', (data) => {
  console.log('User is typing:', data);
});

// Expected: Tab 2 receives notification about Tab 1 typing
```

### 5.2 Auto Typing Indicator
```javascript
// Type in message input field on nexferies.html
// Server should auto-send typing indicator every 1 second
// Other users should see typing indicator appear

// Check in console:
socket.listeners('user:typing')
// Should show event listener is active
```

---

## Phase 6: Real-time Socket.io Events Testing

### 6.1 New Message Event
```javascript
// In one browser tab (Tab A):
socket.on('nexfery:new-message', (msg) => {
  console.log('New message received:', msg);
});

// In another tab (Tab B):
// Send a message via the UI
// Expected: Tab A receives message immediately via Socket.io
```

### 6.2 Message Edited Event
```javascript
// Setup listener in Tab A:
socket.on('message:edited', (data) => {
  console.log('Message edited:', data);
});

// Edit message in Tab B:
// Expected: Tab A's UI updates message immediately
```

### 6.3 Message Deleted Event
```javascript
// Setup listener in Tab A:
socket.on('message:deleted', (data) => {
  console.log('Message deleted:', data);
});

// Delete message in Tab B:
// Expected: Tab A's UI removes message immediately
```

### 6.4 Reaction Added Event
```javascript
// Setup listener in Tab A:
socket.on('reaction:added', (data) => {
  console.log('Reaction added:', data);
});

// Add reaction in Tab B:
// Expected: Tab A's UI updates reaction counts immediately
```

---

## Phase 7: Nexfery Deletion Testing

### 7.1 Delete Nexfery
```bash
# Owner deletes nexfery
curl -X DELETE http://localhost:3000/api/nexferies/1 \
  -b owner_cookies.txt

# Expected response:
# {"ok":true,"message":"Нексфера удалена"}

# Verify in database:
psql -U postgres -d novachat -c "SELECT * FROM nexferies WHERE id = 1;"
# Should return no rows
```

### 7.2 Cascade Delete
```bash
# Verify all related data deleted:
psql -U postgres -d novachat -c "
SELECT * FROM nexferies_messages WHERE nexfery_id = 1;
SELECT * FROM message_reactions WHERE message_id IN (SELECT id FROM nexferies_messages WHERE nexfery_id = 1);
SELECT * FROM nexfery_invites WHERE nexfery_id = 1;"

# All should return no rows
```

---

## Phase 8: Authorization & Security Testing

### 8.1 Non-member Cannot Edit Message
```bash
# User 2 (not member of nexfery 1) tries to edit User 1's message
curl -X PATCH http://localhost:3000/api/nexferies/1/messages/999 \
  -H "Content-Type: application/json" \
  -b user2_cookies.txt \
  -d '{"text":"hacked"}'

# Expected response (403):
# {"ok":false,"error":"Вы не член этой нексферы"}
```

### 8.2 User Cannot Edit Others' Messages
```bash
# User 2 (member) tries to edit User 1's message
curl -X PATCH http://localhost:3000/api/nexferies/1/messages/123 \
  -H "Content-Type: application/json" \
  -b user2_cookies.txt \
  -d '{"text":"hacked"}'

# Expected response (403):
# {"ok":false,"error":"Вы можете редактировать только свои сообщения"}
```

### 8.3 Non-owner Cannot Invite
```bash
# User 2 (member, not owner) tries to invite someone
curl -X POST http://localhost:3000/api/nexferies/1/invite \
  -H "Content-Type: application/json" \
  -b user2_cookies.txt \
  -d '{"invitedUserId":3}'

# Expected response (403):
# {"ok":false,"error":"Только владелец может приглашать"}
```

---

## Phase 9: Frontend UI Testing

### 9.1 Message Actions
- [ ] Send message and verify it appears
- [ ] Click "Edit" button on own message
- [ ] Edit text and verify `(edited)` label appears
- [ ] Click "Delete" button on own message
- [ ] Verify message disappears from UI
- [ ] Receive message from other user, verify no Edit/Delete buttons

### 9.2 Reactions UI
- [ ] Click emoji on message
- [ ] Verify emoji reaction picker appears (or alert)
- [ ] Select emoji
- [ ] Verify reaction appears under message
- [ ] Click reaction again to remove
- [ ] Verify reaction count updates in real-time from other users

### 9.3 Typing Indicator UI
- [ ] Start typing in message input
- [ ] See "User is typing..." text appear in other browser tab
- [ ] Stop typing
- [ ] Typing indicator disappears after 2 seconds

### 9.4 Member Actions
- [ ] See member list for nexfery
- [ ] Verify invite button appears for owner/admin
- [ ] Send invitation
- [ ] Switch to other user and see "Pending Invitation"
- [ ] Accept invitation
- [ ] Switch back and see new member in member list

---

## Debugging Checklist

### Database Issues
```bash
# Check if tables exist
psql -U postgres -d novachat -c "\dt"

# Check indexes
psql -U postgres -d novachat -c "\di"

# Check specific table schema
psql -U postgres -d novachat -c "\d message_reactions"
```

### Server Issues
```bash
# Check server logs for errors
tail -f server-log.txt

# Test database connection
curl http://localhost:3000/api/health
```

### Socket.IO Issues
```javascript
// In browser console:
console.log(socket.connected) // should be true
console.log(socket.listeners('nexfery:new-message')) // should have listener
socket.io.engine.transport.name // should be 'websocket'
```

### Authentication Issues
```bash
# Verify session cookie
curl -i http://localhost:3000/api/profile \
  -b cookies.txt | grep Set-Cookie

# If no session, login again
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password"}' \
  -c cookies.txt
```

---

## Test Results Template

```markdown
| Feature | Status | Notes |
|---------|--------|-------|
| Pagination | ✅ Pass / ❌ Fail | |
| Rate Limiting | ✅ Pass / ❌ Fail | |
| Message Edit | ✅ Pass / ❌ Fail | |
| Message Delete | ✅ Pass / ❌ Fail | |
| Reactions Add | ✅ Pass / ❌ Fail | |
| Reactions Remove | ✅ Pass / ❌ Fail | |
| Typing Indicator | ✅ Pass / ❌ Fail | |
| Invitations | ✅ Pass / ❌ Fail | |
| Authorization | ✅ Pass / ❌ Fail | |
| Socket.io Events | ✅ Pass / ❌ Fail | |
| Frontend UI | ✅ Pass / ❌ Fail | |
```

---

## Common Issues & Solutions

### Issue: Rate limiter not working
**Solution:** Restart server and clear browser cache
```bash
npm start
# Press Ctrl+C and start again
```

### Issue: Reactions not showing
**Solution:** Check database for message_reactions table
```bash
psql -U postgres -d novachat -c "SELECT * FROM message_reactions LIMIT 5;"
```

### Issue: Typing indicator not showing
**Solution:** Verify Socket.io connection
```javascript
console.log(socket.connected)
socket.emit('nexfery:typing', { nexferyId: 1, isTyping: true })
```

### Issue: Edit/Delete buttons not appearing
**Solution:** Clear local storage and reload
```javascript
localStorage.clear()
location.reload()
```

---

Generated: 2026-01-31
Last Updated: 2026-01-31
