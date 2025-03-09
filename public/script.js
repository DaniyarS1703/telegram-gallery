document.addEventListener("DOMContentLoaded", () => {
    const portfolio = document.querySelector(".portfolio");
    let isDragging = false;
    let startX;
    let scrollLeft;

    // Функция начала перетаскивания
    portfolio.addEventListener("mousedown", (e) => {
        if (e.button !== 0) return; // Только левая кнопка мыши
        isDragging = true;
        startX = e.pageX - portfolio.offsetLeft;
        scrollLeft = portfolio.scrollLeft;
        portfolio.style.cursor = "grabbing";
    });

    // Перетаскивание
    portfolio.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - portfolio.offsetLeft;
        const walk = (x - startX) * 2; // Скорость прокрутки
        portfolio.scrollLeft = scrollLeft - walk;
    });

    // Конец перетаскивания
    portfolio.addEventListener("mouseup", () => {
        isDragging = false;
        portfolio.style.cursor = "grab";
    });

    portfolio.addEventListener("mouseleave", () => {
        isDragging = false;
        portfolio.style.cursor = "grab";
    });

    // Прокрутка кнопками
    document.querySelector(".left").addEventListener("click", () => {
        portfolio.scrollLeft -= 150;
    });

    document.querySelector(".right").addEventListener("click", () => {
        portfolio.scrollLeft += 150;
    });
});
