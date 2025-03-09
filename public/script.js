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
                            <div class="portfolio" onmousedown="startDrag(event, this)">
                                ${photographer.portfolio.map(img => `
                                    <img src="${img}" alt="Фото портфолио" onclick="openModal('${img}')">
                                `).join('')}
                            </div>
                            <button class="scroll-button right" onclick="scrollPortfolio(this, 1)">&#9654;</button>
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

// 📌 Генерация звёздного рейтинга
function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? '<span class="star half">&#9733;</span>' : '';
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return '★'.repeat(fullStars) + halfStar + '☆'.repeat(emptyStars);
}

// 📌 Перетаскивание карусели
function startDrag(event, portfolio) {
    let isDragging = false;
    let startX = event.pageX - portfolio.offsetLeft;
    let scrollLeft = portfolio.scrollLeft;

    function onMouseMove(e) {
        if (!isDragging) return;
        const x = e.pageX - portfolio.offsetLeft;
        portfolio.scrollLeft = scrollLeft - (x - startX);
    }

    function onMouseUp() {
        isDragging = false;
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
    }

    isDragging = true;
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
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
