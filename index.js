const express = require('express');
const { Telegraf } = require('telegraf');
const pool = require('./db');
require('dotenv').config();
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'web')));

const bot = new Telegraf(process.env.BOT_TOKEN);

// 📸 API для получения списка фотографов
app.get('/photographers', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM photographers');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Ошибка при получении списка фотографов');
    }
});

// 📌 Команда /start открывает миниапп
bot.start((ctx) => {
    ctx.reply('Добро пожаловать в "Галерею"! Открывай миниапп:', {
        reply_markup: {
            inline_keyboard: [[
                { text: '📸 Открыть Галерею', web_app: { url: 'http://localhost:3000' } }
            ]]
        }
    });
});

// 🔗 Проверка соединения с базой
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Ошибка подключения к базе данных:', err);
    } else {
        console.log('База данных подключена:', res.rows);
    }
});

// 🚀 Запуск сервера
app.listen(3000, () => console.log('Сервер запущен на порту 3000'));

// 🔥 Запуск бота
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Подключаем Webhook вместо getUpdates
app.post(`/bot${process.env.BOT_TOKEN}`, (req, res) => {
    bot.handleUpdate(req.body);
    res.sendStatus(200);
});

bot.telegram.setWebhook(`https://telegram-gallery.onrender.com/bot${process.env.BOT_TOKEN}`);

app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));

