document.addEventListener("DOMContentLoaded", async () => {
    const photographersList = document.getElementById("photographers");

    if (!photographersList) {
        console.error("Ошибка: не найден контейнер #photographers в index.html");
        return;
    }

    photographersList.innerHTML = "<p>Загрузка фотографов...</p>";

    try {
        const response = await fetch("/api/photographers");
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        let photographers = await response.json();

        // 📌 Сортируем по рейтингу (если рейтинг одинаковый, случайный порядок)
        photographers.sort((a, b) => b.rating - a.rating || Math.random() - 0.5);

        if (photographers.length === 0) {
            photographersList.innerHTML = "<p>Фотографов пока нет.</p>";
        } else {
            photographersList.innerHTML = "";
            photographers.forEach((photographer) => {
                const photographerElement = document.createElement("div");
                photographerElement.classList.add("photographer");

                // Генерация звёзд рейтинга
                const fullStars = Math.floor(photographer.rating);
                const halfStar = photographer.rating % 1 !== 0;
                
                let starsHTML = "";
                for (let i = 0; i < fullStars; i++) {
                    starsHTML += '<span class="star full">⭐</span>';
                }
                if (halfStar) {
                    starsHTML += '<span class="star half">⭐</span>';
                }
                for (let i = fullStars + (halfStar ? 1 : 0); i < 5; i++) {
                    starsHTML += '<span class="star empty">⭐</span>';
                }

                photographerElement.innerHTML = `
                    <div class="photographer-card">
                        <img src="${photographer.avatar}" alt="${photographer.name}" class="avatar">
                        <h2>${photographer.name}</h2>
                        <p>${photographer.bio || "Описание отсутствует"}</p>
                        <div class="rating-container">
                            <span class="rating-text">${photographer.rating.toFixed(1)}</span>
                            <div class="rating">${starsHTML}</div>
                        </div>
                    </div>
                `;

                photographersList.appendChild(photographerElement);
            });
        }
    } catch (error) {
        console.error("Ошибка загрузки фотографов:", error);
        photographersList.innerHTML = "<p>Ошибка загрузки данных.</p>";
    }
});
