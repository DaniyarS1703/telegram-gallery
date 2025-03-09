document.addEventListener("DOMContentLoaded", async () => {
    const photographersList = document.getElementById("photographers");

    if (!photographersList) {
        console.error("Ошибка: контейнер #photographers не найден.");
        return;
    }

    photographersList.innerHTML = "<p>Загрузка фотографов...</p>";

    try {
        const response = await fetch("https://telegram-gallery.onrender.com/api/photographers");
        
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        let photographers = await response.json();
        console.log("Фотографы загружены:", photographers);

        if (photographers.length === 0) {
            photographersList.innerHTML = "<p>Фотографов пока нет.</p>";
        } else {
            // 📌 Сортируем по рейтингу, если равен — случайный порядок
            photographers.sort((a, b) => {
                if (b.rating === a.rating) return Math.random() - 0.5;
                return b.rating - a.rating;
            });

            photographersList.innerHTML = "";
            photographers.forEach((photographer) => {
                const photographerElement = document.createElement("div");
                photographerElement.classList.add("photographer");

                photographerElement.innerHTML = `
                    <div class="photographer-card">
                        <img src="${photographer.avatar}" alt="${photographer.name}" class="avatar">
                        <h2>${photographer.name}</h2>
                        <p>${photographer.bio || "Описание отсутствует"}</p>
                        <div class="rating">${generateStarRating(photographer.rating)}</div>
                        <p class="rating-number">${photographer.rating.toFixed(1)}</p>
                        
                        <div class="portfolio-container">
                            <button class="scroll-button left" onclick="scrollPortfolio(this, -1)">&#9664;</button>
                            <div class="portfolio">
                                ${photographer.portfolio.map(img => `
                                    <img src="${img}" alt="Фото портфолио" onclick="openModal('${img}')">
                                `).join('')}
                            </div>
                            <button class="scroll-button right" onclick="scrollPortfolio(this, 1)">&#9654;</button>
                        </div>
                    </div>
                `;

                photographersList.appendChild(photographerElement);

                // 📌 Инициализация Drag & Scroll
                setupDragScroll(photographerElement.querySelector(".portfolio"));
            });
        }
    } catch (error) {
        console.error("Ошибка загрузки фотографов:", error);
        photographersList.innerHTML = "<p>Ошибка загрузки данных.</p>";
    }
});

// 📌 Генерация звёздного рейтинга
function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? '<span class="star half">&#9733;</span>' : '';
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return '★'.repeat(fullStars) + halfStar + '☆'.repeat(emptyStars);
}

// 📌 Перетаскивание карусели мышкой
function setupDragScroll(portfolio) {
    let isDown = false;
    let startX, scrollLeft;

    portfolio.addEventListener("mousedown", (e) => {
        isDown = true;
        startX = e.pageX - portfolio.offsetLeft;
        scrollLeft = portfolio.scrollLeft;
        portfolio.style.cursor = "grabbing";
    });

    portfolio.addEventListener("mouseleave", () => {
        isDown = false;
        portfolio.style.cursor = "grab";
    });

    portfolio.addEventListener("mouseup", () => {
        isDown = false;
        portfolio.style.cursor = "grab";
    });

    portfolio.addEventListener("mousemove", (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - portfolio.offsetLeft;
        const walk = (x - startX) * 2; // Умножаем на 2 для ускоренного движения
        portfolio.scrollLeft = scrollLeft - walk;
    });
}

// 📌 Прокрутка кнопками
function scrollPortfolio(button, direction) {
    const portfolio = button.parentElement.querySelector(".portfolio");
    portfolio.scrollLeft += direction * 150;
}

// 📌 Открытие изображения в модальном окне
function openModal(imageUrl) {
    const modal = document.createElement("div");
    modal.classList.add("modal");

    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="closeModal()">&times;</span>
            <img src="${imageUrl}" alt="Фото" class="modal-image">
        </div>
    `;

    document.body.appendChild(modal);
    modal.addEventListener("click", closeModal);
}

// 📌 Закрытие модального окна
function closeModal() {
    const modal = document.querySelector(".modal");
    if (modal) {
        modal.remove();
    }
}
