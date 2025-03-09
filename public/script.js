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
                                ${photographer.portfolio.map((img) => 
                                    `<img src="${img}" class="portfolio-img" onclick="openModal('${img}')">`
                                ).join("")}
                            </div>
                            <button class="carousel-btn right-btn">›</button>
                        </div>
                    </div>
                `;

                photographersList.appendChild(photographerElement);

                // Добавляем кнопки прокрутки
                const portfolio = photographerElement.querySelector(".portfolio");
                const leftBtn = photographerElement.querySelector(".left-btn");
                const rightBtn = photographerElement.querySelector(".right-btn");

                leftBtn.addEventListener("click", () => {
                    portfolio.scrollBy({ left: -150, behavior: "smooth" });
                });

                rightBtn.addEventListener("click", () => {
                    portfolio.scrollBy({ left: 150, behavior: "smooth" });
                });

                // ✅ Улучшенный драг-скролл (без задержек)
                let isDragging = false;
                let startX, scrollLeft;

                portfolio.addEventListener("mousedown", (event) => {
                    isDragging = true;
                    startX = event.clientX;
                    scrollLeft = portfolio.scrollLeft;
                    portfolio.style.cursor = "grabbing";
                });

                document.addEventListener("mouseup", () => {
                    isDragging = false;
                    portfolio.style.cursor = "grab";
                });

                portfolio.addEventListener("mousemove", (event) => {
                    if (!isDragging) return;
                    event.preventDefault();
                    const x = event.clientX;
                    const move = startX - x;
                    portfolio.scrollLeft = scrollLeft + move;
                });

                portfolio.addEventListener("mouseleave", () => {
                    isDragging = false;
                    portfolio.style.cursor = "grab";
                });
            });
        }
    } catch (error) {
        console.error("Ошибка загрузки фотографов:", error);
        photographersList.innerHTML = "<p>Ошибка загрузки данных.</p>";
    }
});

// ✅ Исправленное модальное окно с быстрым масштабированием и перетаскиванием
function openModal(imageSrc) {
    const modal = document.getElementById("modal");
    const modalImg = document.getElementById("modal-img");
    const modalOverlay = document.getElementById("modal-overlay");

    modal.style.display = "flex";
    modalImg.src = imageSrc;

    let scale = 1;
    let translateX = 0;
    let translateY = 0;

    function updateTransform() {
        modalImg.style.transform = `scale(${scale}) translate(${translateX}px, ${translateY}px)`;
    }

    modalImg.onwheel = (event) => {
        event.preventDefault();
        scale += event.deltaY > 0 ? -0.1 : 0.1;
        scale = Math.min(Math.max(1, scale), 3);
        updateTransform();
    };

    let isDragging = false;
    let startX, startY;

    modalImg.onmousedown = (event) => {
        isDragging = true;
        startX = event.clientX - translateX;
        startY = event.clientY - translateY;
    };

    modalImg.onmousemove = (event) => {
        if (!isDragging) return;
        translateX = event.clientX - startX;
        translateY = event.clientY - startY;
        updateTransform();
    };

    modalImg.onmouseup = () => isDragging = false;
    modalImg.onmouseleave = () => isDragging = false;

    modalOverlay.onclick = closeModal;
}

// ✅ Закрытие модального окна
function closeModal() {
    document.getElementById("modal").style.display = "none";
}
