// ============================================
// NEXIS BOTS - ПРИМЕРЫ ИНТЕГРАЦИИ И ИСПОЛЬЗОВАНИЯ
// ============================================

/**
 * ПРИМЕР 1: Создание бота через фронтенд
 */
async function createNewsBot() {
  try {
    const response = await fetch('/api/bots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'NewsBot',
        description: '📰 Получайте последние новости прямо в чат',
        avatar_url: 'https://example.com/newsbot-avatar.jpg',
        commands: [
          {
            cmd: '/start',
            description: 'Начать получать новости'
          },
          {
            cmd: '/latest',
            description: 'Получить последние новости'
          },
          {
            cmd: '/categories',
            description: 'Выбрать категории новостей'
          },
          {
            cmd: '/settings',
            description: 'Настройки бота'
          }
        ]
      })
    });

    const data = await response.json();
    if (data.ok) {
      console.log('✅ Бот создан:', data.bot);
    } else {
      console.error('❌ Ошибка:', data.error);
    }
  } catch (err) {
    console.error('Ошибка при создании бота:', err);
  }
}

/**
 * ПРИМЕР 2: Получение всех доступных ботов
 */
async function getAllBots() {
  try {
    const response = await fetch('/api/bots');
    const data = await response.json();

    if (data.ok) {
      console.log('Доступные боты:');
      data.bots.forEach(bot => {
        console.log(`
        🤖 ${bot.name}
        📝 ${bot.description}
        👥 Подписчиков: ${bot.subscriber_count}
        ⏰ Создан: ${new Date(bot.created_at).toLocaleDateString('ru-RU')}
        `);
      });
    }
  } catch (err) {
    console.error('Ошибка при получении ботов:', err);
  }
}

/**
 * ПРИМЕР 3: Подписка на бота
 */
async function subscribeToBot(botId) {
  try {
    const response = await fetch(`/api/bots/${botId}/subscribe`, {
      method: 'POST'
    });

    const data = await response.json();
    if (data.ok) {
      console.log('✅ Вы подписались на бота');
    } else {
      console.error('❌ Ошибка подписки:', data.error);
    }
  } catch (err) {
    console.error('Ошибка при подписке:', err);
  }
}

/**
 * ПРИМЕР 4: Отписка от бота
 */
async function unsubscribeFromBot(botId) {
  try {
    const response = await fetch(`/api/bots/${botId}/unsubscribe`, {
      method: 'POST'
    });

    const data = await response.json();
    if (data.ok) {
      console.log('✅ Вы отписались от бота');
    } else {
      console.error('❌ Ошибка отписки:', data.error);
    }
  } catch (err) {
    console.error('Ошибка при отписке:', err);
  }
}

/**
 * ПРИМЕР 5: Получение подписок пользователя
 */
async function getUserBotSubscriptions() {
  try {
    const response = await fetch('/api/user/bot-subscriptions');
    const data = await response.json();

    if (data.ok) {
      console.log('Ваши подписки на ботов:');
      data.bots.forEach(bot => {
        console.log(`  ✅ ${bot.name}`);
      });
    } else if (response.status === 401) {
      console.log('Войдите, чтобы увидеть подписки');
    }
  } catch (err) {
    console.error('Ошибка при получении подписок:', err);
  }
}

/**
 * ПРИМЕР 6: Отправка команды боту
 */
async function sendBotCommand(botId, command, chatId, params = {}) {
  try {
    const response = await fetch(`/api/bots/${botId}/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        command,
        chatId,
        params
      })
    });

    const data = await response.json();
    if (data.ok) {
      console.log('✅ Команда выполнена');
      console.log('Ответ бота:', data.response);
    } else {
      console.error('❌ Ошибка команды:', data.error);
    }
  } catch (err) {
    console.error('Ошибка при отправке команды:', err);
  }
}

/**
 * ПРИМЕР 7: Обработка клика по кнопке
 */
async function handleBotButtonClick(botId, action, chatId) {
  try {
    const response = await fetch(`/api/bots/${botId}/button-click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        chatId
      })
    });

    const data = await response.json();
    if (data.ok) {
      console.log('✅ Действие обработано');
      console.log('Ответ бота:', data.response);
    } else {
      console.error('❌ Ошибка действия:', data.error);
    }
  } catch (err) {
    console.error('Ошибка при обработке клика:', err);
  }
}

/**
 * ПРИМЕР 8: Слушание сообщений от ботов через Socket.IO
 */
function setupBotMessageListener(socket) {
  socket.on('message-from-bot', (data) => {
    console.log('📬 Новое сообщение от бота:');
    console.log(`  🤖 Бот: ${data.botName}`);
    console.log(`  📝 Сообщение: ${data.text}`);
    
    if (data.buttons && data.buttons.length > 0) {
      console.log('  🔘 Кнопки:');
      data.buttons.forEach((btn, idx) => {
        console.log(`    ${idx + 1}. ${btn.text} (${btn.action})`);
      });
    }
  });

  socket.on('bot-created', (bot) => {
    console.log('✅ Новый бот создан:', bot.name);
  });
}

/**
 * ПРИМЕР 9: Интерактивный чат с ботом
 */
class BotChatInterface {
  constructor(botId, chatId) {
    this.botId = botId;
    this.chatId = chatId;
  }

  async sendMessage(message) {
    // Если это команда
    if (message.startsWith('/')) {
      return await sendBotCommand(this.botId, message, this.chatId);
    }
    
    // Для обычных сообщений можно добавить логирование
    console.log(`📤 Отправлено боту: ${message}`);
  }

  async handleButtonClick(action) {
    return await handleBotButtonClick(this.botId, action, this.chatId);
  }

  async getInfo() {
    try {
      const response = await fetch(`/api/bots/${this.botId}`);
      const data = await response.json();
      if (data.ok) {
        return data.bot;
      }
    } catch (err) {
      console.error('Ошибка при получении информации:', err);
    }
  }
}

// Использование:
// const botChat = new BotChatInterface(1, 5);
// await botChat.sendMessage('/start');
// await botChat.handleButtonClick('help');

/**
 * ПРИМЕР 10: Управление ботами (для администраторов)
 */
class BotManager {
  constructor() {
    this.bots = [];
  }

  async loadAllBots() {
    try {
      const response = await fetch('/api/bots');
      const data = await response.json();
      if (data.ok) {
        this.bots = data.bots;
        return this.bots;
      }
    } catch (err) {
      console.error('Ошибка при загрузке ботов:', err);
    }
  }

  async createBot(botData) {
    try {
      const response = await fetch('/api/bots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(botData)
      });

      const data = await response.json();
      if (data.ok) {
        this.bots.push(data.bot);
        return data.bot;
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error('Ошибка при создании бота:', err);
    }
  }

  getBotStats(botId) {
    const bot = this.bots.find(b => b.id === botId);
    if (bot) {
      return {
        name: bot.name,
        subscribers: bot.subscriber_count,
        created: bot.created_at
      };
    }
    return null;
  }

  listAllBots() {
    console.log('Список всех ботов:');
    this.bots.forEach(bot => {
      console.log(`
      ID: ${bot.id}
      Имя: ${bot.name}
      Подписчиков: ${bot.subscriber_count}
      Активен: ${bot.is_active ? 'Да' : 'Нет'}
      `);
    });
  }
}

// Использование:
// const manager = new BotManager();
// await manager.loadAllBots();
// manager.listAllBots();

/**
 * ПРИМЕР 11: Создание специализированного бота
 */
class SpecializedBot {
  constructor(name, description, icon) {
    this.name = name;
    this.description = description;
    this.icon = icon;
    this.commands = [];
  }

  addCommand(cmd, description, handler) {
    this.commands.push({ cmd, description, handler });
  }

  async register() {
    try {
      const response = await fetch('/api/bots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: this.name,
          description: this.description,
          commands: this.commands
        })
      });

      const data = await response.json();
      if (data.ok) {
        console.log(`✅ ${this.icon} ${this.name} зарегистрирован!`);
        return data.bot;
      }
    } catch (err) {
      console.error('Ошибка при регистрации:', err);
    }
  }
}

// Пример: создание бота для напоминаний
const reminderBot = new SpecializedBot(
  'ReminderBot',
  '⏰ Бот для управления напоминаниями и TODO',
  '⏰'
);

reminderBot.addCommand('/remind', 'Установить напоминание');
reminderBot.addCommand('/list', 'Показать список напоминаний');
reminderBot.addCommand('/clear', 'Очистить напоминания');

// await reminderBot.register();

/**
 * ПРИМЕР 12: HTML для встраивания ботов в веб-страницы
 */
const htmlExample = `
<!DOCTYPE html>
<html>
<head>
  <title>Nexis Bot Widget</title>
  <style>
    .bot-widget {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 350px;
      height: 500px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      background: white;
      display: flex;
      flex-direction: column;
      z-index: 9999;
    }
    
    .bot-widget-header {
      background: linear-gradient(135deg, #007AFF 0%, #0056b3 100%);
      color: white;
      padding: 20px;
      border-radius: 12px 12px 0 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .bot-widget-messages {
      flex: 1;
      overflow-y: auto;
      padding: 15px;
    }
    
    .bot-widget-input {
      padding: 15px;
      border-top: 1px solid #e0e0e0;
      display: flex;
      gap: 10px;
    }
    
    .bot-widget-input input {
      flex: 1;
      padding: 10px;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      font-size: 14px;
    }
    
    .bot-widget-input button {
      padding: 10px 15px;
      background: #007AFF;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="bot-widget">
    <div class="bot-widget-header">
      <span>🤖 Nexis Bot</span>
      <button onclick="this.closest('.bot-widget').remove()" style="background: none; border: none; color: white; cursor: pointer;">✕</button>
    </div>
    <div class="bot-widget-messages" id="bot-messages"></div>
    <div class="bot-widget-input">
      <input type="text" id="bot-input" placeholder="Введите сообщение...">
      <button onclick="sendBotMessage()">Отправить</button>
    </div>
  </div>
  
  <script>
    function sendBotMessage() {
      const input = document.getElementById('bot-input');
      const messages = document.getElementById('bot-messages');
      
      if (input.value.trim()) {
        // Добавить сообщение пользователя
        const userMsg = document.createElement('div');
        userMsg.textContent = input.value;
        userMsg.style.marginBottom = '10px';
        userMsg.style.padding = '10px';
        userMsg.style.background = '#007AFF';
        userMsg.style.color = 'white';
        userMsg.style.borderRadius = '6px';
        userMsg.style.marginLeft = 'auto';
        userMsg.style.maxWidth = '70%';
        messages.appendChild(userMsg);
        
        // Здесь добавить запрос к боту
        
        input.value = '';
      }
    }
  </script>
</body>
</html>
`;

/**
 * ПРИМЕР 13: Тестирование ботов
 */
async function testBot(botId) {
  console.log(`🧪 Тестирование бота ${botId}...`);
  
  try {
    // Получить информацию
    const response = await fetch(`/api/bots/${botId}`);
    const data = await response.json();
    
    if (!data.ok) {
      console.error('❌ Бот не найден');
      return;
    }
    
    const bot = data.bot;
    console.log(`✅ Бот найден: ${bot.name}`);
    
    // Протестировать команды
    console.log('🧪 Тестирование команд...');
    if (bot.commands && bot.commands.length > 0) {
      for (const cmd of bot.commands.slice(0, 3)) {
        console.log(`  → Тестирование ${cmd.cmd}...`);
        await sendBotCommand(botId, cmd.cmd, null);
      }
    }
    
    console.log('✅ Тестирование завершено');
  } catch (err) {
    console.error('❌ Ошибка при тестировании:', err);
  }
}

// Использование:
// await testBot(1);

// ============================================
// ЭКСПОРТ ФУНКЦИЙ
// ============================================

export {
  createNewsBot,
  getAllBots,
  subscribeToBot,
  unsubscribeFromBot,
  getUserBotSubscriptions,
  sendBotCommand,
  handleBotButtonClick,
  setupBotMessageListener,
  BotChatInterface,
  BotManager,
  SpecializedBot,
  testBot
};
