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
                let startX, scrollLeft, velocity = 0, momentumID;

                // Отключаем pointer-events для изображений, чтобы тянуть проще
                carousel.querySelectorAll("img").forEach(img => {
                    img.style.pointerEvents = "none";
                });

                // Начало перетаскивания
                carousel.addEventListener("mousedown", (e) => {
                    isDragging = true;
                    startX = e.pageX - carousel.offsetLeft;
                    scrollLeft = carousel.scrollLeft;
                    velocity = 0;
                    cancelMomentumTracking();
                    e.preventDefault();
                }, { passive: false });

                // Движение мыши
                carousel.addEventListener("mousemove", (e) => {
                    if (!isDragging) return;
                    const x = e.pageX - carousel.offsetLeft;
                    const walk = (x - startX) * 1.5; // 🔥 Снижен коэффициент (1.5 вместо 2)
                    carousel.scrollLeft = scrollLeft - walk;
                    velocity = walk * 0.1; // 🔥 Запоминаем скорость движения
                });

                // Окончание перетаскивания (включаем инерцию)
                carousel.addEventListener("mouseup", () => {
                    isDragging = false;
                    startMomentumTracking();
                });

                carousel.addEventListener("mouseleave", () => {
                    isDragging = false;
                    startMomentumTracking();
                });

                // Функция инерции прокрутки
                function startMomentumTracking() {
                    cancelMomentumTracking();
                    momentumID = requestAnimationFrame(momentumLoop);
                }

                function cancelMomentumTracking() {
                    cancelAnimationFrame(momentumID);
                }

                function momentumLoop() {
                    carousel.scrollLeft += velocity;
                    velocity *= 0.95; // 🔥 Постепенное замедление инерции
                    if (Math.abs(velocity) > 0.5) {
                        momentumID = requestAnimationFrame(momentumLoop);
                    }
                }

                // Прокрутка кнопками
                prevBtn.addEventListener("click", () => {
                    carousel.scrollBy({ left: -120, behavior: "smooth" });
                });

                nextBtn.addEventListener("click", () => {
                    carousel.scrollBy({ left: 120, behavior: "smooth" });
                });
            });
        }
    } catch (error) {
        console.error("Ошибка загрузки фотографов:", error);
        photographersList.innerHTML = "<p>Ошибка загрузки данных.</p>";
    }
});
