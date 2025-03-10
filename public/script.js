document.addEventListener("DOMContentLoaded", async () => {
    const photographersList = document.getElementById("photographers");

    if (!photographersList) {
        console.error("Ошибка: не найден контейнер #photographers в index.html");
        return;
    }

    photographersList.innerHTML = "<p>Загрузка фотографов...</p>";

    try {
        const response = await fetch("https://telegram-gallery.onrender.com/api/photographers");
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        let photographers = await response.json();

        // 📌 Сортируем по рейтингу (если одинаковый – случайное расположение)
        photographers.sort((a, b) => {
            if (b.rating === a.rating) return Math.random() - 0.5;
            return b.rating - a.rating;
        });

        if (photographers.length === 0) {
            photographersList.innerHTML = "<p>Фотографов пока нет.</p>";
        } else {
            photographersList.innerHTML = "";
            photographers.forEach((photographer) => {
                const photographerElement = document.createElement("div");
                photographerElement.classList.add("photographer");

                photographerElement.innerHTML = `
                    <div class="photographer-card">
                        <img src="${photographer.avatar}" alt="${photographer.name}" class="avatar">
                        <h2>${photographer.name}</h2>
                        <p>${photographer.bio || "Описание отсутствует"}</p>
                        <div class="rating">${generateStars(photographer.rating)}</div>
                        <div class="portfolio-container">
                            <button class="carousel-arrow arrow-left hide">&lt;</button>
                            <div class="portfolio">${generatePortfolio(photographer.portfolio)}</div>
                            <button class="carousel-arrow arrow-right hide">&gt;</button>
                        </div>
                    </div>
                `;

                photographersList.appendChild(photographerElement);
            });

            setupCarousel();
            setupModal();
        }
    } catch (error) {
        console.error("Ошибка загрузки фотографов:", error);
        photographersList.innerHTML = "<p>Ошибка загрузки данных.</p>";
    }
});

// 📌 Функция генерации звезд рейтинга
function generateStars(rating) {
    let starsHTML = "";
    for (let i = 1; i <= 5; i++) {
        if (i <= Math.floor(rating)) {
            starsHTML += `<span class="star full"></span>`;
        } else if (i - rating < 1) {
            starsHTML += `<span class="star half"></span>`;
        } else {
            starsHTML += `<span class="star empty"></span>`;
        }
    }
    return starsHTML;
}

// 📌 Функция генерации изображений портфолио
function generatePortfolio(images) {
    if (!images || images.length === 0) return "<p>Портфолио отсутствует</p>";

    return images.map(img => `<img src="${img}" alt="Фото из портфолио" class="portfolio-img">`).join("");
}

// 📌 Функция карусели
function setupCarousel() {
    document.querySelectorAll(".portfolio-container").forEach(container => {
        const portfolio = container.querySelector(".portfolio");
        const leftArrow = container.querySelector(".arrow-left");
        const rightArrow = container.querySelector(".arrow-right");

        function updateArrows() {
            leftArrow.classList.toggle("hide", portfolio.scrollLeft <= 0);
            rightArrow.classList.toggle("hide", portfolio.scrollLeft >= portfolio.scrollWidth - portfolio.clientWidth);
        }

        leftArrow.addEventListener("click", () => {
            portfolio.scrollBy({ left: -100, behavior: "smooth" });
            updateArrows();
        });

        rightArrow.addEventListener("click", () => {
            portfolio.scrollBy({ left: 100, behavior: "smooth" });
            updateArrows();
        });

        portfolio.addEventListener("scroll", updateArrows);
        updateArrows();
    });
}
