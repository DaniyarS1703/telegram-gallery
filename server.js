const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./db'); // Подключение к базе данных

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// 📌 Раздача статических файлов (для миниаппа)
app.use(express.static(path.join(__dirname, 'public')));

// 📌 Главная страница миниаппа
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 📌 API: Получение списка фотографов
app.get('/api/photographers', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM photographers');
        res.json(result.rows);
    } catch (error) {
        console.error('Ошибка получения фотографов:', error);
        res.status(500).send('Ошибка сервера');
    }
});

// 📌 Запуск сервера
app.listen(PORT, () => {
    console.log(`✅ Сервер запущен на порту ${PORT}`);
});
