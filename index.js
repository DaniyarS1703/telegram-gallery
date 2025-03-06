const express = require('express');
const { Telegraf } = require('telegraf');
const pool = require('./db');
require('dotenv').config();
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'web')));

const bot = new Telegraf(process.env.BOT_TOKEN);

app.get('/getRole', async (req, res) => {
    try {
        const { userId } = req.query;
        const result = await pool.query('SELECT role FROM users WHERE telegram_id = $1', [userId]);

        if (result.rows.length > 0) {
            res.json({ role: result.rows[0].role });
        } else {
            res.json({ role: null });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Ошибка при получении роли');
    }
});

app.post('/setRole', async (req, res) => {
    try {
        const { userId, role } = req.body;
        await pool.query(
            'INSERT INTO users (telegram_id, role) VALUES ($1, $2) ON CONFLICT (telegram_id) DO UPDATE SET role = $2',
            [userId, role]
        );
        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.status(500).send('Ошибка при установке роли');
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
