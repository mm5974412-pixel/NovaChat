/**
 * Mobile-First Chat Application Script
 * Оптимизировано для всех устройств с поддержкой touch events
 */

class ChatApp {
  constructor() {
    this.currentChatId = null;
    this.currentUserId = null;
    this.messages = new Map();
    this.isRecording = false;
    this.mediaRecorder = null;
    this.audioChunks = [];

    // Инициализация socket.io
    this.socket = io();

    // DOM элементы
    this.elements = {
      sidebar: document.getElementById('sidebar'),
      chatMain: document.getElementById('chat-main'),
      backBtn: document.getElementById('back-btn'),
      chatList: document.getElementById('chat-list'),
      messageInput: document.getElementById('message-input'),
      sendBtn: document.getElementById('send-btn'),
      messagesContainer: document.getElementById('messages'),
      chatTitle: document.getElementById('chat-title'),
      chatSubtitle: document.getElementById('chat-subtitle'),
      attachBtn: document.getElementById('attach-btn'),
      recordBtn: document.getElementById('record-btn'),
      stickerBtn: document.getElementById('sticker-btn'),
      fileInput: document.getElementById('file-input'),
      themeToggle: document.getElementById('theme-toggle'),
    };

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadUserData();
    this.setupResponsiveLayout();
    this.setupTouchOptimizations();
  }

  setupEventListeners() {
    // Отправка сообщения
    this.elements.sendBtn?.addEventListener('click', (e) => this.sendMessage(e));
    this.elements.messageInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage(e);
      }
    });

    // Файлы и медиа
    this.elements.attachBtn?.addEventListener('click', () => this.elements.fileInput?.click());
    this.elements.fileInput?.addEventListener('change', (e) => this.handleFileUpload(e));
    this.elements.recordBtn?.addEventListener('click', () => this.toggleAudioRecording());
    this.elements.stickerBtn?.addEventListener('click', () => this.openStickerPicker());

    // Кнопка "Назад" на мобильных
    this.elements.backBtn?.addEventListener('click', () => this.goBackToChats());

    // Theme toggle
    this.elements.themeToggle?.addEventListener('click', () => this.toggleTheme());

    // Socket.io события
    this.socket.on('message:new', (data) => this.addMessage(data));
    this.socket.on('chat:list', (chats) => this.renderChats(chats));
    this.socket.on('user:online', (userId) => this.updateUserStatus(userId, true));
    this.socket.on('user:offline', (userId) => this.updateUserStatus(userId, false));

    // Обработка изменения размера окна
    window.addEventListener('resize', () => this.handleWindowResize());

    // Обработка фокуса/расфокуса
    document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
  }

  setupResponsiveLayout() {
    const isMobile = window.innerWidth < 768;
    this.updateLayout(isMobile);
  }

  setupTouchOptimizations() {
    // Улучшенная поддержка touch событий
    if ('ontouchstart' in window) {
      document.body.classList.add('touch-device');

      // Предотвращение двойного увеличения при двойном клике
      document.addEventListener('dblclick', (e) => {
        if (e.target.closest('button, a, input')) {
          e.preventDefault();
        }
      });

      // Улучшена прокрутка
      this.elements.messagesContainer?.addEventListener('touchmove', (e) => {
        // Разрешить нативную прокрутку
      }, { passive: true });
    }
  }

  updateLayout(isMobile) {
    const app = document.querySelector('.app');
    if (!app) return;

    if (isMobile) {
      app.style.gridTemplateColumns = '1fr';
      document.body.classList.add('mobile');
    } else {
      app.style.gridTemplateColumns = '280px 1fr';
      document.body.classList.remove('mobile');
    }
  }

  handleWindowResize() {
    const isMobile = window.innerWidth < 768;
    this.updateLayout(isMobile);
  }

  handleVisibilityChange() {
    if (document.hidden) {
      // App потеряла фокус
      console.log('App paused');
    } else {
      // App вернула фокус
      console.log('App resumed');
      this.refreshChats();
    }
  }

  loadUserData() {
    fetch('/api/user/profile')
      .then(r => r.json())
      .then(data => {
        this.currentUserId = data.id;
        document.getElementById('current-username').textContent = data.username;
        this.loadChats();
      })
      .catch(err => console.error('Failed to load user:', err));
  }

  loadChats() {
    fetch('/api/chats')
      .then(r => r.json())
      .then(chats => this.renderChats(chats))
      .catch(err => console.error('Failed to load chats:', err));
  }

  renderChats(chats) {
    const chatList = this.elements.chatList;
    if (!chatList) return;

    chatList.innerHTML = '';

    if (!chats || chats.length === 0) {
      chatList.innerHTML = '<li style="padding: 16px; text-align: center; color: var(--light-text-muted);">Нет чатов</li>';
      return;
    }

    chats.forEach(chat => {
      const li = document.createElement('li');
      li.className = `chat-item ${chat.id === this.currentChatId ? 'active' : ''}`;
      li.innerHTML = `
        <div class="chat-avatar">${chat.name[0].toUpperCase()}</div>
        <div class="chat-meta">
          <div class="chat-name">${this.escapeHtml(chat.name)}</div>
          <div class="chat-last">${this.escapeHtml(chat.lastMessage || 'Нет сообщений')}</div>
        </div>
      `;
      li.addEventListener('click', () => this.openChat(chat.id, chat.name));
      chatList.appendChild(li);
    });
  }

  openChat(chatId, chatName) {
    this.currentChatId = chatId;
    document.body.classList.add('mobile-dialog-open');

    this.elements.chatTitle.textContent = chatName;
    this.elements.chatSubtitle.textContent = 'Загрузка...';

    fetch(`/api/chats/${chatId}/messages`)
      .then(r => r.json())
      .then(messages => {
        this.renderMessages(messages);
        this.elements.chatSubtitle.textContent = 'Онлайн';
        this.elements.messageInput?.focus();
      })
      .catch(err => console.error('Failed to load messages:', err));

    // Socket.io: присоединяюсь к чату
    this.socket.emit('join-chat', chatId);
  }

  goBackToChats() {
    document.body.classList.remove('mobile-dialog-open');
    this.currentChatId = null;
    this.elements.chatTitle.textContent = '💬 Выберите чат';
    this.elements.chatSubtitle.textContent = 'Нажмите на чат слева или создайте новый';
    this.elements.messagesContainer.innerHTML = '';
    this.socket.emit('leave-chat', this.currentChatId);
  }

  renderMessages(messages) {
    const container = this.elements.messagesContainer;
    if (!container) return;

    container.innerHTML = '';

    if (!messages || messages.length === 0) {
      container.innerHTML = '<div style="text-align: center; padding: 24px; color: var(--light-text-muted);">Нет сообщений. Начните разговор!</div>';
      return;
    }

    messages.forEach(msg => this.addMessage(msg, false));
    this.scrollToBottom();
  }

  addMessage(msg, scroll = true) {
    const container = this.elements.messagesContainer;
    if (!container || msg.chatId !== this.currentChatId) return;

    const div = document.createElement('div');
    const isMine = msg.userId === this.currentUserId;

    div.className = `message ${isMine ? 'me' : ''}`;
    div.innerHTML = `
      ${msg.username ? `<strong>${this.escapeHtml(msg.username)}</strong>` : ''}
      <span>${this.escapeHtml(msg.text)}</span>
      ${msg.createdAt ? `<span class="message-time">${new Date(msg.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>` : ''}
    `;

    container.appendChild(div);
    if (scroll) this.scrollToBottom();
  }

  sendMessage(e) {
    e.preventDefault();

    const text = this.elements.messageInput?.value.trim();
    if (!text || !this.currentChatId) return;

    this.socket.emit('message:send', {
      chatId: this.currentChatId,
      text: text,
      timestamp: new Date()
    });

    this.elements.messageInput.value = '';
    this.elements.messageInput.focus();
  }

  handleFileUpload(e) {
    const files = e.target.files;
    if (!files || !this.currentChatId) return;

    Array.from(files).forEach(file => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('chatId', this.currentChatId);

      fetch('/api/upload', { method: 'POST', body: formData })
        .then(r => r.json())
        .then(data => {
          this.socket.emit('message:send', {
            chatId: this.currentChatId,
            text: `[Файл] ${file.name}`,
            fileUrl: data.url,
            timestamp: new Date()
          });
        })
        .catch(err => console.error('Upload failed:', err));
    });

    e.target.value = '';
  }

  async toggleAudioRecording() {
    if (this.isRecording) {
      this.stopAudioRecording();
    } else {
      await this.startAudioRecording();
    }
  }

  async startAudioRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (e) => this.audioChunks.push(e.data);
      this.mediaRecorder.onstop = () => this.sendAudioMessage();

      this.mediaRecorder.start();
      this.isRecording = true;
      this.elements.recordBtn?.classList.add('recording');
    } catch (err) {
      console.error('Microphone access denied:', err);
      alert('Доступ к микрофону отклонен');
    }
  }

  stopAudioRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
      this.isRecording = false;
      this.elements.recordBtn?.classList.remove('recording');
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
  }

  sendAudioMessage() {
    const blob = new Blob(this.audioChunks, { type: 'audio/wav' });
    const formData = new FormData();
    formData.append('audio', blob, 'voice.wav');
    formData.append('chatId', this.currentChatId);

    fetch('/api/upload-audio', { method: 'POST', body: formData })
      .then(r => r.json())
      .then(data => {
        this.socket.emit('message:send', {
          chatId: this.currentChatId,
          text: '🎙️ Голосовое сообщение',
          audioUrl: data.url,
          timestamp: new Date()
        });
      })
      .catch(err => console.error('Audio upload failed:', err));

    this.audioChunks = [];
  }

  openStickerPicker() {
    alert('Выбор стикеров будет добавлен в ближайшее время');
  }

  toggleTheme() {
    const isLight = document.documentElement.classList.toggle('light');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    this.updateThemeIcon();
  }

  updateThemeIcon() {
    const isLight = document.documentElement.classList.contains('light');
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.textContent = isLight ? '☀️ Светлая' : '🌙 Темная';
    }
  }

  scrollToBottom() {
    const container = this.elements.messagesContainer;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }

  updateUserStatus(userId, isOnline) {
    const chatItems = document.querySelectorAll('.chat-item');
    chatItems.forEach(item => {
      if (item.dataset.userId === userId) {
        if (isOnline) {
          item.classList.add('online');
        } else {
          item.classList.remove('online');
        }
      }
    });
  }

  refreshChats() {
    this.loadChats();
    if (this.currentChatId) {
      this.openChat(this.currentChatId, this.elements.chatTitle.textContent);
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Инициализация при загрузке документа
document.addEventListener('DOMContentLoaded', () => {
  new ChatApp();
});

// Обработка ошибок
window.addEventListener('error', (e) => {
  console.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled rejection:', e.reason);
});

// Отключение зума на двойной клик (для лучше UX на мобильных)
let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
  const now = Date.now();
  if (now - lastTouchEnd <= 300) {
    e.preventDefault();
  }
  lastTouchEnd = now;
}, false);
