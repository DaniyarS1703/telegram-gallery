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

        const photographers = await response.json();

        if (photographers.length === 0) {
            photographersList.innerHTML = "<p>Фотографов пока нет.</p>";
        } else {
            photographersList.innerHTML = "";
            photographers.forEach((photographer) => {
                const photographerElement = document.createElement("div");
                photographerElement.classList.add("photographer");

                // Создаем HTML карточки фотографа
                photographerElement.innerHTML = `
                    <div class="photographer-card">
                        <img src="${photographer.avatar}" alt="${photographer.name}" class="avatar">
                        <h2>${photographer.name}</h2>
                        <p>${photographer.bio || "Описание отсутствует"}</p>
                        <p>⭐ ${photographer.rating}</p>
                        <div class="carousel-container">
                            <button class="prev-btn">&lt;</button>
                            <div class="carousel" id="carousel-${photographer.id}">
                                ${photographer.portfolio.map(img => `<img src="${img}" alt="Portfolio">`).join('')}
                            </div>
                            <button class="next-btn">&gt;</button>
                        </div>
                    </div>
                `;

                photographersList.appendChild(photographerElement);

                // Оптимизированная карусель
                const carousel = document.getElementById(`carousel-${photographer.id}`);
                const prevBtn = photographerElement.querySelector(".prev-btn");
                const nextBtn = photographerElement.querySelector(".next-btn");

                let isDragging = false;
                let startX, scrollLeft;

                // Отключаем pointer-events для изображений, чтобы тянуть проще
                carousel.querySelectorAll("img").forEach(img => {
                    img.style.pointerEvents = "none";
                });

                // Начало перетаскивания (momentum отключен)
                carousel.addEventListener("mousedown", (e) => {
                    isDragging = true;
                    startX = e.clientX;
                    scrollLeft = carousel.scrollLeft;
                    carousel.style.scrollBehavior = "auto"; // Отключаем плавность, чтобы ускорить
                    e.preventDefault();
                });

                // Движение мыши
                carousel.addEventListener("mousemove", (e) => {
                    if (!isDragging) return;
                    const deltaX = e.clientX - startX;
                    carousel.scrollLeft = scrollLeft - deltaX;
                });

                // Окончание перетаскивания
                carousel.addEventListener("mouseup", () => {
                    isDragging = false;
                    carousel.style.scrollBehavior = "smooth"; // Включаем плавность после отпускания
                });

                carousel.addEventListener("mouseleave", () => {
                    isDragging = false;
                    carousel.style.scrollBehavior = "smooth";
                });

                // Прокрутка кнопками (оставляем)
                prevBtn.addEventListener("click", () => {
                    carousel.scrollBy({ left: -100, behavior: "smooth" });
                });

                nextBtn.addEventListener("click", () => {
                    carousel.scrollBy({ left: 100, behavior: "smooth" });
                });
            });
        }
    } catch (error) {
        console.error("Ошибка загрузки фотографов:", error);
        photographersList.innerHTML = "<p>Ошибка загрузки данных.</p>";
    }
});
document.addEventListener("DOMContentLoaded", () => {
    const portfolioImages = document.querySelectorAll(".portfolio img");
    const modal = document.createElement("div");
    modal.classList.add("modal");
    modal.innerHTML = `<div class="modal-content"><span class="close">&times;</span><img src="" alt="Просмотр изображения"></div>`;
    document.body.appendChild(modal);

    const modalImg = modal.querySelector("img");
    const closeModal = modal.querySelector(".close");

    portfolioImages.forEach(img => {
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
});
