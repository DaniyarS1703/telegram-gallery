document.addEventListener("DOMContentLoaded", async () => {
    const photographersList = document.getElementById("photographers");

    if (!photographersList) {
        console.error("Ошибка: не найден контейнер #photographers в index.html");
        return;
    }

    photographersList.innerHTML = "<p>Загрузка фотографов...</p>";

    try {
        const response = await fetch("https://telegram-gallery.onrender.com/api/photographers");
        if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);

        const photographers = await response.json();

        if (photographers.length === 0) {
            photographersList.innerHTML = "<p>Фотографов пока нет.</p>";
        } else {
            photographersList.innerHTML = "";
            photographers.forEach((photographer) => {
                const photographerElement = document.createElement("div");
                photographerElement.classList.add("photographer");

                // ⭐ Создание звёзд рейтинга
                const stars = createStars(photographer.rating);

                // 📷 Создание карусели портфолио
                const portfolio = createPortfolio(photographer.portfolio);

                photographerElement.innerHTML = `
                    <div class="photographer-card">
                        <img src="${photographer.avatar}" alt="${photographer.name}" class="avatar">
                        <h2>${photographer.name}</h2>
                        <p>${photographer.bio || "Описание отсутствует"}</p>
                        <div class="rating">${stars}</div>
                        <p>${photographer.rating.toFixed(1)}</p>
                        ${portfolio}
                    </div>
                `;

                photographersList.appendChild(photographerElement);
                setupCarousel(photographerElement);
            });
        }
    } catch (error) {
        console.error("Ошибка загрузки фотографов:", error);
        photographersList.innerHTML = "<p>Ошибка загрузки данных.</p>";
    }
});

// 🌟 Функция создания звёзд рейтинга
function createStars(rating) {
    let fullStars = Math.floor(rating);
    let halfStar = rating % 1 !== 0;
    let starsHtml = "";

    for (let i = 0; i < fullStars; i++) starsHtml += "★";
    if (halfStar) starsHtml += "⯪";
    for (let i = fullStars + (halfStar ? 1 : 0); i < 5; i++) starsHtml += "☆";

    return `<span class="stars">${starsHtml}</span>`;
}

// 🎠 Функция создания портфолио
function createPortfolio(portfolio) {
    if (!portfolio || portfolio.length === 0) return "<p>Портфолио отсутствует</p>";

    return `
        <div class="portfolio-container">
            <div class="portfolio-wrapper">
                ${portfolio.map(img => `<img src="${img}" class="portfolio-img" onclick="openModal('${img}')">`).join("")}
            </div>
        </div>
    `;
}

// 🖱️ Установка Drag & Scroll для карусели
function setupCarousel(container) {
    const wrapper = container.querySelector(".portfolio-wrapper");
    let isDown = false, startX, scrollLeft;

    wrapper.addEventListener("mousedown", (e) => {
        isDown = true;
        startX = e.pageX - wrapper.offsetLeft;
        scrollLeft = wrapper.scrollLeft;
        wrapper.style.cursor = "grabbing";
    });

    wrapper.addEventListener("mouseleave", () => {
        isDown = false;
        wrapper.style.cursor = "grab";
    });

    wrapper.addEventListener("mouseup", () => {
        isDown = false;
        wrapper.style.cursor = "grab";
    });

    wrapper.addEventListener("mousemove", (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - wrapper.offsetLeft;
        const walk = (x - startX) * 2;
        wrapper.scrollLeft = scrollLeft - walk;
    });
}

// 🔍 Функция открытия модального окна
function openModal(imageSrc) {
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImage");
    modal.style.display = "flex";
    modalImg.src = imageSrc;
}

// ❌ Функция закрытия модального окна
function closeModal() {
    document.getElementById("imageModal").style.display = "none";
}
