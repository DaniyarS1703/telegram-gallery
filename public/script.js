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

            setupModal();
            setupCarouselButtons();
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

// 📌 Функция генерации изображений портфолио (убран драг, добавлены стрелки)
function generatePortfolio(images) {
    if (!images || images.length === 0) return "<p>Портфолио отсутствует</p>";

    return `
        <div class="carousel">
            <button class="carousel-btn left">&lt;</button>
            <div class="carousel-track">
                ${images.map(img => `<img src="${img}" alt="Фото" class="portfolio-img">`).join("")}
            </div>
            <button class="carousel-btn right">&gt;</button>
        </div>
    `;
}

// 📌 Функция управления каруселью (только стрелки, без драга)
function setupCarouselButtons() {
    document.querySelectorAll(".carousel").forEach(carousel => {
        const track = carousel.querySelector(".carousel-track");
        const btnLeft = carousel.querySelector(".carousel-btn.left");
        const btnRight = carousel.querySelector(".carousel-btn.right");

        btnLeft.addEventListener("click", () => {
            track.scrollBy({ left: -150, behavior: "smooth" });
        });

        btnRight.addEventListener("click", () => {
            track.scrollBy({ left: 150, behavior: "smooth" });
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

    document.querySelectorAll(".portfolio-img").forEach(img => {
        img.addEventListener("click", () => {
            modal.style.display = "flex";
            modalImg.src = img.src;
        });
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
