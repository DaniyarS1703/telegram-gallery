const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'gallery',
    password: process.env.DB_PASSWORD, // Пароль из .env
    port: 5432,
});

module.exports = pool;
