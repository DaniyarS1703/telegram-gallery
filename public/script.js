document.addEventListener('DOMContentLoaded', function() {
  fetch('/api/photographers')
    .then(response => response.json())
    .then(data => {
      const container = document.getElementById('photographers');
      if (data.length === 0) {
        container.innerHTML = '<p>Фотографы не найдены</p>';
      } else {
        data.forEach(photographer => {
          const div = document.createElement('div');
          div.classList.add('photographer');
          div.innerHTML = `
            <img src="${photographer.avatar}" alt="${photographer.name}" width="100">
            <h2>${photographer.name}</h2>
            <p>Рейтинг: ${photographer.rating}</p>
            <button onclick="orderPhotographer(${photographer.id})">Заказать</button>
          `;
          container.appendChild(div);
        });
      }
    })
    .catch(error => {
      console.error('Ошибка загрузки фотографов', error);
    });
});

function orderPhotographer(id) {
  alert('Заказ фотографа с id: ' + id);
}
