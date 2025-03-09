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

                const rating = Math.floor(photographer.rating);
                const hasHalfStar = photographer.rating % 1 !== 0;

                let starsHTML = "";
                for (let i = 0; i < rating; i++) {
                    starsHTML += '<span class="star">★</span>';
                }
                if (hasHalfStar) {
                    starsHTML += '<span class="half-star">★</span>';
                }
                while (starsHTML.length < 5) {
                    starsHTML += '<span class="star" style="color: #ddd;">★</span>';
                }

                let portfolioHTML = "";
                if (photographer.portfolio && photographer.portfolio.length > 0) {
                    portfolioHTML = `
                        <div class="carousel-container">
                            <button class="prev-btn">◀️</button>
                            <div class="carousel">
                                ${photographer.portfolio.map(img => `<img src="${img}" alt="Фото из портфолио">`).join("")}
                            </div>
                            <button class="next-btn">▶️</button>
                        </div>
                    `;
                }

                photographerElement.innerHTML = `
                    <div class="photographer-card">
                        <img src="${photographer.avatar}" alt="${photographer.name}" class="avatar">
                        <h2>${photographer.name}</h2>
                        <p>${photographer.bio || "Описание отсутствует"}</p>
                        <div class="rating">${starsHTML}</div>
                        ${portfolioHTML}
                    </div>
                `;

                photographersList.appendChild(photographerElement);
            });

            // Добавляем логику кнопок "◀️" и "▶️"
            document.querySelectorAll(".carousel-container").forEach(container => {
                const carousel = container.querySelector(".carousel");
                const prevBtn = container.querySelector(".prev-btn");
                const nextBtn = container.querySelector(".next-btn");

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
