const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL + "?application_name=myapp&client_encoding=UTF8",
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = pool;
