const express = require("express");
const app = express();
const path = require("path");

// Используем переменные окружения
const PORT = process.env.PORT || 3000;

// Раздаём статические файлы из папки public
app.use(express.static(path.join(__dirname, "public")));

// 🚀 Главная страница загружает index.html вместо "Сервер запущен!"
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// API маршрут для фотографов
app.get("/api/photographers", (req, res) => {
    res.json([
        {
            id: 1,
            name: "Иван Петров",
            bio: "Профессиональный фотограф с 5-летним опытом",
            rating: 4.8,
            portfolio: ["https://example.com/portfolio1.jpg"],
            avatar: "https://example.com/avatar1.jpg"
        },
        {
            id: 2,
            name: "Анна Смирнова",
            bio: "Специализируюсь на свадебных съемках",
            rating: 5.0,
            portfolio: ["https://example.com/portfolio2.jpg"],
            avatar: "https://example.com/avatar2.jpg"
        },
        {
            id: 3,
            name: "Максим Иванов",
            bio: "Фотограф-портретист",
            rating: 4.6,
            portfolio: ["https://example.com/portfolio3.jpg"],
            avatar: "https://example.com/avatar3.jpg"
        }
    ]);
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`✅ Сервер запущен на порту ${PORT}`);
    console.log(`🔗 Открыть API: http://localhost:${PORT}/api/photographers`);
    console.log(`🌍 Открыть миниапп: http://localhost:${PORT}`);
});
