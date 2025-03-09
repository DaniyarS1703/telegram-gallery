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

        // 📌 Сортировка по рейтингу (если одинаковый – случайное расположение)
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

            // 📌 Подключаем drag & scroll
            setupOldDrag();

            // 📌 Подключаем функционал модального окна с увеличением и перемещением
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
    if (!images || images.length === 0) return "<p>Портфолио отсутствует</p>";

    return images.map(img => `<img src="${img}" alt="Фото из портфолио" class="portfolio-img">`).join("");
}

// 📌 Drag & Scroll для карусели портфолио
function setupOldDrag() {
    document.querySelectorAll(".portfolio").forEach(portfolio => {
        let isDragging = false;
        let startX;
        let scrollLeft;

        portfolio.addEventListener("mousedown", (e) => {
            isDragging = true;
            startX = e.pageX - portfolio.offsetLeft;
            scrollLeft = portfolio.scrollLeft;
            portfolio.style.cursor = "grabbing";
        });

        portfolio.addEventListener("mouseleave", () => {
            isDragging = false;
            portfolio.style.cursor = "grab";
        });

        portfolio.addEventListener("mouseup", () => {
            isDragging = false;
            portfolio.style.cursor = "grab";
        });

        portfolio.addEventListener("mousemove", (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const x = e.pageX - portfolio.offsetLeft;
            const walk = (x - startX) * 2;
            portfolio.scrollLeft = scrollLeft - walk;
        });
    });
}

// 📌 Улучшенное модальное окно с зумом + перемещением
function setupModal() {
    const modal = document.createElement("div");
    modal.classList.add("modal");
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <img src="" alt="Просмотр" class="modal-img">
        </div>
    `;
    document.body.appendChild(modal);

    const modalImg = modal.querySelector(".modal-img");
    const closeModal = modal.querySelector(".close");

    document.querySelectorAll(".portfolio-img").forEach(img => {
        img.addEventListener("click", () => {
            modal.style.display = "flex";
            modalImg.src = img.src;
            modalImg.style.transform = "scale(1)";
            modalImg.dataset.scale = "1";
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

    // 📌 Добавляем зум + перемещение
    let scale = 1;
    let isDragging = false;
    let startX, startY, imgX = 0, imgY = 0;

    modalImg.addEventListener("wheel", (e) => {
        e.preventDefault();
        const zoomFactor = 0.1;
        let newScale = scale + (e.deltaY < 0 ? zoomFactor : -zoomFactor);
        newScale = Math.max(1, Math.min(newScale, 3));

        if (newScale !== scale) {
            scale = newScale;
            modalImg.style.transform = `scale(${scale}) translate(${imgX}px, ${imgY}px)`;
        }
    });

    modalImg.addEventListener("mousedown", (e) => {
        if (scale > 1) {
            isDragging = true;
            startX = e.clientX - imgX;
            startY = e.clientY - imgY;
            modalImg.style.cursor = "grabbing";
        }
    });

    document.addEventListener("mouseup", () => {
        isDragging = false;
        modalImg.style.cursor = "grab";
    });

    document.addEventListener("mousemove", (e) => {
        if (isDragging) {
            imgX = e.clientX - startX;
            imgY = e.clientY - startY;
            modalImg.style.transform = `scale(${scale}) translate(${imgX}px, ${imgY}px)`;
        }
    });
}
