const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const webAppUrl = process.env.WEBAPP_URL;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

app.use(cors());
app.use(express.json());

// Проверка работы сервера
app.get('/', (req, res) => {
    res.send('Сервер запущен!');
});

// Получение списка фотографов
app.get('/api/photographers', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM photographers');
        res.json(result.rows);
    } catch (error) {
        console.error('Ошибка при получении списка фотографов:', error);
        res.status(500).json({ error: 'Ошибка при получении списка фотографов' });
    }
});

// Подключение бота Telegram
const { Telegraf, Markup } = require('telegraf');
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => {
    ctx.reply(
        'Добро пожаловать в "Галерею"! Открывай миниапп:',
        Markup.keyboard([
            [Markup.button.webApp('📸 Открыть Галерею', webAppUrl)]
        ]).resize()
    );
});

bot.launch().then(() => {
    console.log('✅ Бот запущен!');
}).catch(err => {
    console.error('Ошибка запуска бота:', err);
});

app.listen(port, async () => {
    try {
        await pool.connect();
        console.log('✅ Успешное подключение к базе данных');
    } catch (error) {
        console.error('❌ Ошибка подключения к базе данных:', error);
    }
    console.log(`Сервер запущен на порту ${port}`);
});
