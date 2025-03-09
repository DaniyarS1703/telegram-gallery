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
                const avatarUrl = photographer.avatar ? photographer.avatar : "https://via.placeholder.com/150";

                const photographerElement = document.createElement("div");
                photographerElement.classList.add("photographer");

                photographerElement.innerHTML = `
                    <div class="photographer-card">
                        <img src="${avatarUrl}" alt="${photographer.name}" class="avatar">
                        <h2>${photographer.name}</h2>
                        <p>${photographer.bio || "Описание отсутствует"}</p>
                        <p>⭐ ${photographer.rating}</p>
                    </div>
                `;

                photographersList.appendChild(photographerElement);
            });
        }
    } catch (error) {
        console.error("Ошибка загрузки фотографов:", error);
        photographersList.innerHTML = "<p>Ошибка загрузки данных.</p>";
    }
});
