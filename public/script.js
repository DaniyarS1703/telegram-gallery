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
                        <div class="portfolio">${generatePortfolio(photographer.portfolio)}</div>
                    </div>
                `;

                photographersList.appendChild(photographerElement);
            });

            // 📌 Подключаем функционал модального окна и новую карусель
            setupModal();
            setupNewCarousel();
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
            starsHTML += `<span class="star full"></span>`; // Полная звезда
        } else if (i - rating < 1) {
            starsHTML += `<span class="star half"></span>`; // Половина звезды
        } else {
            starsHTML += `<span class="star empty"></span>`; // Пустая звезда
        }
    }
    return starsHTML;
}

// 📌 Функция генерации изображений портфолио
function generatePortfolio(images) {
    if (!images || images.length === 0) return "<p>Портфолио отсутствует</p>";

    return `
        <div class="carousel">
            <div class="carousel-track">
                ${images.map(img => `<img src="${img}" alt="Фото из портфолио" class="portfolio-img">`).join("")}
            </div>
        </div>
    `;
}

// 📌 НОВАЯ КАРУСЕЛЬ (перетаскивание с ускорением, без инерции)
function setupNewCarousel() {
    document.querySelectorAll(".carousel-track").forEach(track => {
        let isDown = false;
        let startX, scrollLeft;

        track.addEventListener("mousedown", (e) => {
            isDown = true;
            startX = e.pageX - track.offsetLeft;
            scrollLeft = track.scrollLeft;
            track.style.cursor = "grabbing";
        });

        track.addEventListener("mouseleave", () => {
            isDown = false;
            track.style.cursor = "grab";
        });

        track.addEventListener("mouseup", () => {
            isDown = false;
            track.style.cursor = "grab";
        });

        track.addEventListener("mousemove", (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - track.offsetLeft;
            const walk = (x - startX) * 2; // 📌 Ускоренное движение
            track.scrollLeft = scrollLeft - walk;
        });

        // 📌 Поддержка тачскрина (смартфоны)
        let touchStartX, touchScrollLeft;

        track.addEventListener("touchstart", (e) => {
            isDown = true;
            touchStartX = e.touches[0].pageX - track.offsetLeft;
            touchScrollLeft = track.scrollLeft;
        });

        track.addEventListener("touchmove", (e) => {
            if (!isDown) return;
            const x = e.touches[0].pageX - track.offsetLeft;
            const walk = (x - touchStartX) * 2;
            track.scrollLeft = touchScrollLeft - walk;
        });

        track.addEventListener("touchend", () => {
            isDown = false;
        });
    });
}

// 📌 Функция открытия изображений в модальном окне
function setupModal() {
    const modal = document.createElement("div");
    modal.classList.add("modal");
    modal.innerHTML = `<div class="modal-content"><span class="close">&times;</span><img src="" alt="Просмотр"></div>`;
    document.body.appendChild(modal);

    const modalImg = modal.querySelector("img");
    const closeModal = modal.querySelector(".close");

    document.addEventListener("click", (e) => {
        if (e.target.classList.contains("portfolio-img")) {
            modal.style.display = "flex";
            modalImg.src = e.target.src;
        }
    });

    closeModal.addEventListener("click", () => {
        modal.style.display = "none";
    });

    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.style.display = "none";
        }
    });
}
