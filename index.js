const express = require('express');
const { Telegraf } = require('telegraf');
const pool = require('./db');
require('dotenv').config();
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'web')));

const bot = new Telegraf(process.env.BOT_TOKEN);

app.post('/photographers', async (req, res) => {
    try {
        const { name, bio, rating, portfolio } = req.body;
        const result = await pool.query(
            'INSERT INTO photographers (name, bio, rating, portfolio) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, bio, rating, portfolio]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Ошибка при добавлении фотографа');
    }
});

app.get('/photographers', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM photographers');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Ошибка при получении списка фотографов');
    }
});

bot.start((ctx) => {
    ctx.reply('Добро пожаловать в "Галерею"! Открывай миниапп:', {
        reply_markup: {
            inline_keyboard: [[
                { text: '📸 Открыть Галерею', web_app: { url: process.env.WEBAPP_URL } }
            ]]
        }
    });
});

const WEBAPP_URL = process.env.WEBAPP_URL.trim(); // Убираем лишние пробелы и переносы строк
bot.telegram.setWebhook(`${WEBAPP_URL}/bot${process.env.BOT_TOKEN}`);


app.post(`/bot${process.env.BOT_TOKEN}`, (req, res) => {
    bot.handleUpdate(req.body);
    res.sendStatus(200);
});

app.listen(process.env.PORT || 3000, () => console.log('Сервер запущен!'));
