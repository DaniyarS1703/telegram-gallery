const express = require('express');
const cors = require('cors');
const pool = require('./db'); // Подключение к базе данных

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// Маршрут для получения списка фотографов
app.get('/api/photographers', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM photographers');
        res.json(result.rows);
    } catch (error) {
        console.error('Ошибка получения фотографов:', error);
        res.status(500).send('Ошибка сервера');
    }
});

app.listen(PORT, () => {
    console.log(`✅ Сервер запущен на порту ${PORT}`);
});
