const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

pool.connect()
    .then(() => console.log("✅ Успешное подключение к базе данных"))
    .catch(err => console.error("❌ Ошибка подключения к базе данных:", err));

module.exports = pool;
