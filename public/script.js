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

        // 📌 Сортировка по рейтингу (если одинаковый – случайный порядок)
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
                        <div class="portfolio-wrapper">
                            <button class="arrow left">&#10094;</button>
                            <div class="portfolio">${generatePortfolio(photographer.portfolio)}</div>
                            <button class="arrow right">&#10095;</button>
                        </div>
                    </div>
                `;

                photographersList.appendChild(photographerElement);
            });

            // 📌 Подключаем функционал карусели
            setupCarousel();
            // 📌 Подключаем модальное окно
            setupModal();
        }
    } catch (error) {
        console.error("Ошибка загрузки фотографов:", error);
        photographersList.innerHTML = "<p>Ошибка загрузки данных.</p>";
    }
});

// 📌 Генерация звезд рейтинга
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

// 📌 Генерация изображений портфолио
function generatePortfolio(images) {
    if (!images || images.length === 0) return "<p>Портфолио отсутствует</p>";

    return images.map(img => `<img src="${img}" alt="Фото из портфолио" class="portfolio-img">`).join("");
}

// 📌 Функция для карусели с кнопками
function setupCarousel() {
    document.querySelectorAll(".portfolio-wrapper").forEach(wrapper => {
        const portfolio = wrapper.querySelector(".portfolio");
        const leftArrow = wrapper.querySelector(".arrow.left");
        const rightArrow = wrapper.querySelector(".arrow.right");

        leftArrow.addEventListener("click", () => {
            portfolio.scrollBy({ left: -100, behavior: "smooth" });
        });

        rightArrow.addEventListener("click", () => {
            portfolio.scrollBy({ left: 100, behavior: "smooth" });
        });

        // 📌 Автоматически скрываем стрелки, если скроллить некуда
        function updateArrows() {
            const atStart = portfolio.scrollLeft <= 5; // Мягкий порог для избежания скрытия при небольшом движении
            const atEnd = portfolio.scrollLeft >= (portfolio.scrollWidth - portfolio.clientWidth - 5);

            leftArrow.style.display = atStart ? "none" : "block";
            rightArrow.style.display = atEnd ? "none" : "block";
        }

        // 📌 Отображение стрелок при наведении на карусель
        wrapper.addEventListener("mouseenter", () => {
            leftArrow.style.opacity = portfolio.scrollLeft > 0 ? "1" : "0";
            rightArrow.style.opacity = portfolio.scrollLeft < (portfolio.scrollWidth - portfolio.clientWidth) ? "1" : "0";
        });

        // 📌 Скрытие стрелок при уходе мыши (если нет фото в нужную сторону)
        wrapper.addEventListener("mouseleave", () => {
            updateArrows();
        });

        portfolio.addEventListener("scroll", updateArrows);
        updateArrows();
    });
}


// 📌 Функция открытия изображений в модальном окне
function setupModal() {
    const modal = document.createElement("div");
    modal.classList.add("modal");
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <img src="" alt="Просмотр" id="modal-img">
        </div>
    `;
    document.body.appendChild(modal);

    const modalImg = modal.querySelector("#modal-img");
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

    // 📌 Добавляем масштабирование изображения (зум колесиком)
    modalImg.addEventListener("wheel", (event) => {
        event.preventDefault();
        let scale = parseFloat(modalImg.style.transform.replace(/scale\((.*)\)/, "$1")) || 1;
        scale += event.deltaY * -0.01;
        scale = Math.min(Math.max(1, scale), 3); // Ограничиваем зум от 1x до 3x
        modalImg.style.transform = `scale(${scale})`;
    });

    // 📌 Позволяем двигать изображение после зума
    let isDragging = false;
    let startX, startY, scrollLeft, scrollTop;

    modalImg.addEventListener("mousedown", (event) => {
        isDragging = true;
        startX = event.pageX - modalImg.offsetLeft;
        startY = event.pageY - modalImg.offsetTop;
        scrollLeft = modalImg.offsetLeft;
        scrollTop = modalImg.offsetTop;
        modalImg.style.cursor = "grabbing";
    });

    document.addEventListener("mousemove", (event) => {
        if (!isDragging) return;
        event.preventDefault();
        const x = event.pageX - startX;
        const y = event.pageY - startY;
        modalImg.style.transform = `translate(${x}px, ${y}px) scale(${parseFloat(modalImg.style.transform.replace(/scale\((.*)\)/, "$1"))})`;
    });

    document.addEventListener("mouseup", () => {
        isDragging = false;
        modalImg.style.cursor = "grab";
    });
}
