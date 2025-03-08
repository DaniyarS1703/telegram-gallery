const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const photographersRoutes = require('./routes/photographers');

const app = express();

// Обслуживание статических файлов из папки public
app.use(express.static('public'));

app.use(cors());
app.use(bodyParser.json());

// Роут для API фотографов
app.use('/api/photographers', photographersRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
