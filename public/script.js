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
                            <button class="carousel-btn left" onclick="scrollPortfolio(this, -1)">&#10094;</button>
                            <div class="portfolio">${generatePortfolio(photographer.portfolio)}</div>
                            <button class="carousel-btn right" onclick="scrollPortfolio(this, 1)">&#10095;</button>
                        </div>
                    </div>
                `;

                photographersList.appendChild(photographerElement);
            });

            // 📌 Подключаем функционал модального окна
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
    if (!images || !Array.isArray(images) || images.length === 0) {
        return "<p>Портфолио отсутствует</p>";
    }

    return images.map(img => `<img src="${img}" alt="Фото из портфолио" class="portfolio-img" onclick="openModal('${img}')">`).join("");
}

// 📌 Функция прокрутки карусели
function scrollPortfolio(button, direction) {
    const portfolio = button.parentElement.querySelector(".portfolio");
    if (!portfolio) return;

    const scrollAmount = 150; // px
    portfolio.scrollBy({ left: scrollAmount * direction, behavior: "smooth" });

    // Обновляем видимость стрелок
    setTimeout(() => {
        updateArrowVisibility(button.parentElement);
    }, 500);
}

// 📌 Функция обновления видимости стрелок
function updateArrowVisibility(container) {
    const portfolio = container.querySelector(".portfolio");
    const leftButton = container.querySelector(".carousel-btn.left");
    const rightButton = container.querySelector(".carousel-btn.right");

    leftButton.style.display = portfolio.scrollLeft > 0 ? "block" : "none";
    rightButton.style.display = portfolio.scrollLeft + portfolio.clientWidth < portfolio.scrollWidth ? "block" : "none";
}

// 📌 Функция открытия изображений в модальном окне
function setupModal() {
    const modal = document.createElement("div");
    modal.classList.add("modal");
    modal.innerHTML = `<div class="modal-content"><span class="close">&times;</span><img src="" alt="Просмотр"></div>`;
    document.body.appendChild(modal);

    const modalImg = modal.querySelector("img");
    const closeModal = modal.querySelector(".close");

    closeModal.addEventListener("click", () => {
        modal.style.display = "none";
    });

    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.style.display = "none";
        }
    });

    window.openModal = function (src) {
        modal.style.display = "flex";
        modalImg.src = src;
    };
}
