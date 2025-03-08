const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
require('dotenv').config();

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error('TELEGRAM_BOT_TOKEN не задан в .env');
  process.exit(1);
}

// Создаем бота в режиме polling (для разработки)
const bot = new TelegramBot(token, { polling: true });

// Обработчик команды /start – вывод списка фотографов
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  let message = 'Добро пожаловать!\n\nСписок фотографов:\n';
  
  try {
    // Получаем список фотографов из API
    const response = await axios.get('http://localhost:3000/api/photographers');
    const photographers = response.data;
    
    if (photographers.length === 0) {
      message += 'Фотографы не найдены.';
    } else {
      photographers.forEach(photographer => {
        message += `ID: ${photographer.id} – ${photographer.name} (Рейтинг: ${photographer.rating})\n`;
      });
    }
  } catch (error) {
    console.error('Ошибка при получении фотографов:', error);
    message = 'Ошибка при получении списка фотографов.';
  }
  
  bot.sendMessage(chatId, message);
});

// Обработчик команды /order для заказа фотографа по ID
bot.onText(/\/order (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const photographerId = match[1];
  
  // Пока просто отправляем сообщение
  bot.sendMessage(chatId, `Вы заказали фотографа с ID: ${photographerId}`);
});

// Новая команда /miniapp для открытия миниаппа внутри Telegram
bot.onText(/\/miniapp/, (msg) => {
  const chatId = msg.chat.id;
  
  // URL миниаппа должен быть доступен по HTTPS!
  // Если тестируете локально, можно использовать ngrok для проброса локального сервера.
  const miniAppUrl = "https://your-secure-domain.com"; // Замените на реальный URL вашего миниаппа

  const options = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Открыть мини-апп",
            web_app: {
              url: miniAppUrl
            }
          }
        ]
      ]
    }
  };

  bot.sendMessage(chatId, "Откройте мини-апп, нажав на кнопку ниже:", options);
});

console.log('Telegram Bot запущен...');
