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
                        <div class="rating-container">
                            <span class="rating-number">${photographer.rating.toFixed(1)}</span>
                            <div class="rating">${generateStars(photographer.rating)}</div>
                        </div>
                        <div class="portfolio">${generatePortfolio(photographer.portfolio)}</div>
                    </div>
                `;

                photographersList.appendChild(photographerElement);
            });

            // 📌 Подключаем drag & scroll (ТВОЙ вариант)
            setupStableDrag();

            // 📌 Подключаем функционал модального окна с увеличением и листанием
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

// 📌 **Оптимизированный Drag & Scroll (ТВОЙ ВАРИАНТ)**
function setupStableDrag() {
    document.querySelectorAll(".portfolio").forEach(portfolio => {
        let isDown = false;
        let startX, scrollLeft;

        portfolio.addEventListener("mousedown", (e) => {
            isDown = true;
            startX = e.pageX - portfolio.offsetLeft;
            scrollLeft = portfolio.scrollLeft;
            portfolio.classList.add("active");
        });

        portfolio.addEventListener("mouseleave", () => {
            isDown = false;
            portfolio.classList.remove("active");
        });

        portfolio.addEventListener("mouseup", () => {
            isDown = false;
            portfolio.classList.remove("active");
        });

        portfolio.addEventListener("mousemove", (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - portfolio.offsetLeft;
            const walk = (x - startX) * 2; // Скорость прокрутки
            portfolio.scrollLeft = scrollLeft - walk;
        });
    });
}

// 📌 Улучшенное модальное окно с зумом + перемещением + листанием стрелками
function setupModal() {
    const modal = document.createElement("div");
    modal.classList.add("modal");
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <img src="" alt="Просмотр" class="modal-img">
            <button class="modal-prev">&#9664;</button>
            <button class="modal-next">&#9654;</button>
        </div>
    `;
    document.body.appendChild(modal);

    const modalImg = modal.querySelector(".modal-img");
    const closeModal = modal.querySelector(".close");
    const prevBtn = modal.querySelector(".modal-prev");
    const nextBtn = modal.querySelector(".modal-next");

    let currentImages = [];
    let currentIndex = 0;

    document.querySelectorAll(".portfolio-img").forEach((img, index, array) => {
        img.addEventListener("click", () => {
            currentImages = array;
            currentIndex = index;
            modal.style.display = "flex";
            updateModalImage();
        });
    });

    function updateModalImage() {
        modalImg.src = currentImages[currentIndex].src;
        prevBtn.style.display = currentIndex === 0 ? "none" : "block";
        nextBtn.style.display = currentIndex === currentImages.length - 1 ? "none" : "block";
    }

    prevBtn.addEventListener("click", () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateModalImage();
        }
    });

    nextBtn.addEventListener("click", () => {
        if (currentIndex < currentImages.length - 1) {
            currentIndex++;
            updateModalImage();
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

    // 📌 Улучшенный зум (движение + увеличение)
    modalImg.addEventListener("wheel", (e) => {
        e.preventDefault();
        let scale = Math.min(Math.max(1, modalImg.width * 0.001 + e.deltaY * -0.01), 3);
        modalImg.style.transform = `scale(${scale})`;
        modalImg.style.cursor = "grab";
    });

    modalImg.addEventListener("mousedown", (e) => {
        let startX = e.clientX;
        let startY = e.clientY;
        let originX = modalImg.offsetLeft;
        let originY = modalImg.offsetTop;

        function moveHandler(event) {
            modalImg.style.left = `${originX + (event.clientX - startX)}px`;
            modalImg.style.top = `${originY + (event.clientY - startY)}px`;
        }

        function upHandler() {
            document.removeEventListener("mousemove", moveHandler);
            document.removeEventListener("mouseup", upHandler);
        }

        document.addEventListener("mousemove", moveHandler);
        document.addEventListener("mouseup", upHandler);
    });
}
