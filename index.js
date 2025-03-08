const express = require('express');
const { Telegraf } = require('telegraf');
const pool = require('./db');
require('dotenv').config();
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'web')));

const bot = new Telegraf(process.env.BOT_TOKEN);
const webAppUrl = process.env.WEBAPP_URL.trim(); // Убираем лишние пробелы и переносы строк

// Проверяем подключение к базе
app.get('/health', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ status: "OK", time: result.rows[0].now });
    } catch (err) {
        console.error("Ошибка соединения с базой данных:", err);
        res.status(500).json({ status: "ERROR", error: err.message });
    }
});

// Получение списка фотографов
app.get('/photographers', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM photographers');
        res.setHeader('Content-Type', 'application/json; charset=utf-8'); // Указываем кодировку явно
        res.json(result.rows);
    } catch (error) {
        console.error("Ошибка при получении списка фотографов:", error);
        res.status(500).json({ error: "Ошибка при получении списка фотографов", details: error.message });
    }
});

// Установка Webhook
bot.telegram.setWebhook(webAppUrl + `/bot${process.env.BOT_TOKEN}`);

app.post(`/bot${process.env.BOT_TOKEN}`, (req, res) => {
    bot.handleUpdate(req.body);
    res.sendStatus(200);
});

// Команда /start с WebApp-кнопкой
bot.start((ctx) => {
    ctx.reply('Добро пожаловать в "Галерею"! Открывайте миниапп:', {
        reply_markup: {
            inline_keyboard: [[
                { text: '📸 Открыть Галерею', web_app: { url: webAppUrl } }
            ]]
        }
    });
});

app.listen(process.env.PORT || 3000, () => console.log('✅ Сервер запущен!'));
