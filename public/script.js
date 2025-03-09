document.addEventListener("DOMContentLoaded", async () => {
    const photographersList = document.getElementById("photographers");

    if (!photographersList) {
        console.error("Ошибка: контейнер #photographers не найден в index.html");
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

                photographerElement.innerHTML = `
                    <div class="photographer-card">
                        <img src="${photographer.avatar}" alt="${photographer.name}" class="avatar">
                        <h2>${photographer.name}</h2>
                        <p>${photographer.bio || "Описание отсутствует"}</p>
                        <p class="rating">⭐ ${photographer.rating}</p>
                        <div class="portfolio-container">
                            <button class="carousel-btn left-btn">‹</button>
                            <div class="portfolio">
                                ${photographer.portfolio.map((img) => `<img src="${img}" class="portfolio-img" onclick="openModal('${img}')">`).join("")}
                            </div>
                            <button class="carousel-btn right-btn">›</button>
                        </div>
                    </div>
                `;

                photographersList.appendChild(photographerElement);

                // Добавляем логику прокрутки
                const portfolio = photographerElement.querySelector(".portfolio");
                const leftBtn = photographerElement.querySelector(".left-btn");
                const rightBtn = photographerElement.querySelector(".right-btn");

                leftBtn.addEventListener("click", () => {
                    portfolio.scrollBy({ left: -150, behavior: "smooth" });
                });

                rightBtn.addEventListener("click", () => {
                    portfolio.scrollBy({ left: 150, behavior: "smooth" });
                });

                // Добавляем драг-скролл (без инерции)
                let isDragging = false;
                let startX;
                let scrollLeft;

                portfolio.addEventListener("mousedown", (event) => {
                    isDragging = true;
                    portfolio.classList.add("grabbing");
                    startX = event.pageX - portfolio.offsetLeft;
                    scrollLeft = portfolio.scrollLeft;
                });

                portfolio.addEventListener("mouseleave", () => {
                    isDragging = false;
                    portfolio.classList.remove("grabbing");
                });

                portfolio.addEventListener("mouseup", () => {
                    isDragging = false;
                    portfolio.classList.remove("grabbing");
                });

                portfolio.addEventListener("mousemove", (event) => {
                    if (!isDragging) return;
                    event.preventDefault();
                    const x = event.pageX - portfolio.offsetLeft;
                    const walk = (x - startX); // Убираем инерцию
                    portfolio.scrollLeft = scrollLeft - walk;
                });
            });
        }
    } catch (error) {
        console.error("Ошибка загрузки фотографов:", error);
        photographersList.innerHTML = "<p>Ошибка загрузки данных.</p>";
    }
});

// Функция для модального окна
function openModal(imageSrc) {
    const modal = document.getElementById("modal");
    const modalImg = document.getElementById("modal-img");
    modal.style.display = "flex";
    modalImg.src = imageSrc;
}

// Закрытие модального окна
function closeModal() {
    document.getElementById("modal").style.display = "none";
}
