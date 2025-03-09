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

        // 📌 Сортировка по рейтингу (если равны, порядок случайный)
        photographers.sort((a, b) => b.rating - a.rating || Math.random() - 0.5);

        photographersList.innerHTML = "";
        photographers.forEach((photographer) => {
            const photographerElement = document.createElement("div");
            photographerElement.classList.add("photographer");

            // Генерация звезд
            let stars = "";
            let fullStars = Math.floor(photographer.rating);
            let halfStar = photographer.rating % 1 >= 0.5 ? 1 : 0;
            let emptyStars = 5 - (fullStars + halfStar);

            stars += "★".repeat(fullStars);
            stars += halfStar ? "☆" : "";
            stars += "☆".repeat(emptyStars);

            // Карточка фотографа
            photographerElement.innerHTML = `
                <img src="${photographer.avatar}" alt="${photographer.name}" class="avatar">
                <h2>${photographer.name}</h2>
                <p>${photographer.bio || "Описание отсутствует"}</p>
                <div class="rating">${stars}</div>
                <div class="portfolio-container">
                    <button class="carousel-btn left"><</button>
                    <div class="portfolio">${photographer.portfolio.map(img => `<img src="${img}" class="portfolio-img">`).join("")}</div>
                    <button class="carousel-btn right">></button>
                </div>
            `;

            photographersList.appendChild(photographerElement);
        });

        // Обработчики для прокрутки портфолио
        document.querySelectorAll(".portfolio-container").forEach(container => {
            const leftBtn = container.querySelector(".carousel-btn.left");
            const rightBtn = container.querySelector(".carousel-btn.right");
            const portfolio = container.querySelector(".portfolio");

            leftBtn.addEventListener("click", () => {
                portfolio.scrollBy({ left: -200, behavior: "smooth" });
            });

            rightBtn.addEventListener("click", () => {
                portfolio.scrollBy({ left: 200, behavior: "smooth" });
            });

            // Drag & Scroll
            let isDown = false;
            let startX, scrollLeft;

            portfolio.addEventListener("mousedown", (e) => {
                isDown = true;
                startX = e.pageX - portfolio.offsetLeft;
                scrollLeft = portfolio.scrollLeft;
            });

            portfolio.addEventListener("mouseleave", () => isDown = false);
            portfolio.addEventListener("mouseup", () => isDown = false);

            portfolio.addEventListener("mousemove", (e) => {
                if (!isDown) return;
                e.preventDefault();
                const x = e.pageX - portfolio.offsetLeft;
                const walk = (x - startX) * 2;
                portfolio.scrollLeft = scrollLeft - walk;
            });
        });

        // Модальное окно
        const modal = document.createElement("div");
        modal.classList.add("modal");
        modal.innerHTML = `<div class="modal-content"><span class="close">&times;</span><img src="" alt="Фото"></div>`;
        document.body.appendChild(modal);

        const modalImg = modal.querySelector("img");
        const closeModal = modal.querySelector(".close");

        document.querySelectorAll(".portfolio-img").forEach(img => {
            img.addEventListener("click", () => {
                modal.style.display = "flex";
                modalImg.src = img.src;
            });
        });

        closeModal.addEventListener("click", () => modal.style.display = "none");
        modal.addEventListener("click", (e) => {
            if (e.target === modal) modal.style.display = "none";
        });

    } catch (error) {
        console.error("Ошибка загрузки фотографов:", error);
        photographersList.innerHTML = "<p>Ошибка загрузки данных.</p>";
    }
});
