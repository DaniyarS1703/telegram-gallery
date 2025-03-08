const express = require('express');
const pool = require('../db');
const router = express.Router();

// Получение списка фотографов
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM photographers ORDER BY rating DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Ошибка сервера');
    }
});

module.exports = router;
