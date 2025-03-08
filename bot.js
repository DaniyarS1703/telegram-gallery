console.log("🚀 Бот запускается...");

const { Telegraf } = require('telegraf');
const axios = require('axios');
require('dotenv').config();

// ✅ Загружаем токен бота
const token = process.env.TELEGRAM_BOT_TOKEN || "7413880812:AAHIMLVG9rZetPK3MtYSwnGCxO9FQd-wM6w"; // <-- ВСТАВЬ СВОЙ ТОКЕН ЗДЕСЬ!
if (!token) {
  console.error('❌ Ошибка: TELEGRAM_BOT_TOKEN не задан в переменных окружения');
  process.exit(1);
}

const bot = new Telegraf(token);

// ✅ Используем правильный API URL (Render)
const apiUrl = process.env.API_URL || "https://telegram-gallery.onrender.com/api/photographers";

// 📌 Команда /start – список фотографов
bot.start(async (ctx) => {
  let message = '📸 Добро пожаловать!\n\n📋 Список фотографов:\n';
  try {
    // Загружаем список фотографов
    const response = await axios.get(apiUrl);
    const photographers = response.data;

    if (photographers.length === 0) {
      message += '⚠️ Фотографы не найдены.';
    } else {
      photographers.forEach((photographer) => {
        message += `📷 ${photographer.name} (⭐ ${photographer.rating})\n`;
      });
    }
  } catch (error) {
    console.error('❌ Ошибка при получении фотографов:', error);
    message = '⚠️ Ошибка при загрузке списка фотографов.';
  }
  ctx.reply(message);
});

// 📌 Команда /order – заказ фотографа
bot.command('order', (ctx) => {
  const parts = ctx.message.text.split(' ');
  if (parts.length < 2) {
    ctx.reply('ℹ️ Используйте: /order <ID>');
  } else {
    const photographerId = parts[1];
    ctx.reply(`✅ Вы заказали фотографа с ID: ${photographerId}`);
  }
});

// 📌 Команда /miniapp – открыть мини-приложение
bot.command('miniapp', (ctx) => {
  const miniAppUrl = process.env.WEBAPP_URL || "https://telegram-gallery.onrender.com";
  ctx.reply('🌐 Откройте мини-приложение:', {
    reply_markup: {
      inline_keyboard: [[{ text: "🔗 Открыть мини-апп", web_app: { url: miniAppUrl } }]]
    }
  });
});

// ✅ Запуск бота
bot.launch({
  allowedUpdates: ['message', 'edited_message', 'callback_query']
})
  .then(() => console.log("✅ Telegram Bot запущен без задержек!"))
  .catch((err) => console.error("❌ Ошибка запуска бота:", err));
