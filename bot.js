const { Telegraf } = require('telegraf');
const axios = require('axios');
require('dotenv').config();

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error('TELEGRAM_BOT_TOKEN не задан в переменных окружения');
  process.exit(1);
}

const bot = new Telegraf(token);

// Команда /start – вывод списка фотографов
bot.start(async (ctx) => {
  let message = 'Добро пожаловать!\n\nСписок фотографов:\n';
  try {
    // Получаем список фотографов из API
    const response = await axios.get('http://localhost:3000/api/photographers');
    const photographers = response.data;
    if (photographers.length === 0) {
      message += 'Фотографы не найдены.';
    } else {
      photographers.forEach((photographer) => {
        message += `ID: ${photographer.id} – ${photographer.name} (Рейтинг: ${photographer.rating})\n`;
      });
    }
  } catch (error) {
    console.error('Ошибка при получении фотографов:', error);
    message = 'Ошибка при получении списка фотографов.';
  }
  ctx.reply(message);
});

// Команда /order для заказа фотографа по ID, например: /order 1
bot.command('order', (ctx) => {
  const parts = ctx.message.text.split(' ');
  if (parts.length < 2) {
    ctx.reply('Используйте: /order <ID>');
  } else {
    const photographerId = parts[1];
    ctx.reply(`Вы заказали фотографа с ID: ${photographerId}`);
  }
});

// Команда /miniapp для открытия миниаппа внутри Telegram
bot.command('miniapp', (ctx) => {
  // URL миниаппа можно задать через переменную окружения WEBAPP_URL,
  // если не задан, используем https://telegram-gallery.onrender.com по умолчанию.
  const miniAppUrl = process.env.WEBAPP_URL || "https://telegram-gallery.onrender.com";
  ctx.reply('Откройте мини-апп, нажав на кнопку ниже:', {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Открыть мини-апп",
            web_app: { url: miniAppUrl }
          }
        ]
      ]
    }
  });
});

bot.launch()
  .then(() => console.log('Telegram Bot запущен...'))
  .catch((err) => console.error('Ошибка запуска бота:', err));
