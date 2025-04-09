document.addEventListener("DOMContentLoaded", () => {
    const svgContainer = document.getElementById("svg-map");
  
    // Функция для динамической загрузки скриптов этажей
    function loadFloorScript(floorName) {
      const script = document.createElement("script");
      script.type = "text/javascript";  // Это обычный скрипт, а не модуль
      script.src = `floors/${floorName}.js`; // Путь к скрипту этажа
      script.onload = () => {
        // Когда скрипт загружен, инициализируем его
        const container = document.getElementById("svg-map");
        if (window[`init${floorName}`]) {
          window[`init${floorName}`](container); // Инициализируем функцию для этого этажа
        }
      };
      document.body.appendChild(script); // Добавляем скрипт в документ
    }
  
    // Загружаем первый этаж по умолчанию
    window.onload = () => {
      loadFloorScript("floor1");
    };
  });

// Функция для добавления подсказки на SVG элемент
function addTooltipToSvgElement(svgElement, tooltipText, svg) {
    // Создаем группу для подсказки
    const tooltipGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    tooltipGroup.setAttribute("class", "svg-tooltip-group");
    tooltipGroup.setAttribute("display", "none");
  
    // Создаем прямоугольник для подложки подсказки
    const tooltipRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    tooltipRect.setAttribute("class", "svg-tooltip-bg");
    tooltipRect.setAttribute("rx", "5");
    tooltipRect.setAttribute("fill", "rgba(0,0,0,0.8)");
    tooltipRect.setAttribute("stroke", "#333");
    tooltipRect.setAttribute("stroke-width", "1");
  
    // Создаем текст подсказки
    const tooltip = document.createElementNS("http://www.w3.org/2000/svg", "text");
    tooltip.setAttribute("class", "svg-tooltip-text");
    tooltip.setAttribute("fill", "white");
    tooltip.setAttribute("font-size", "14");
    tooltip.setAttribute("font-family", "Arial");
    tooltip.setAttribute("dominant-baseline", "hanging");
    tooltip.textContent = tooltipText;
  
    // Добавляем прямоугольник и текст в группу
    tooltipGroup.appendChild(tooltipRect);
    tooltipGroup.appendChild(tooltip);
    svg.appendChild(tooltipGroup);
  
    // Добавляем обработчик клика на элемент SVG
    svgElement.addEventListener('click', (e) => {
      const point = svg.createSVGPoint();
      point.x = e.clientX;
      point.y = e.clientY;
      const svgPoint = point.matrixTransform(svg.getScreenCTM().inverse());
  
      // Обновляем текст подсказки, если он изменяется
      tooltip.textContent = tooltipText;
  
      // Получаем размеры текста
      const textBBox = tooltip.getBBox();
  
      // Устанавливаем размеры и позицию подложки подсказки
      tooltipRect.setAttribute("x", svgPoint.x);
      tooltipRect.setAttribute("y", svgPoint.y);
      tooltipRect.setAttribute("width", textBBox.width + 20);
      tooltipRect.setAttribute("height", textBBox.height + 10);
  
      // Позиционируем текст поверх подложки
      tooltip.setAttribute("x", svgPoint.x + 10);
      tooltip.setAttribute("y", svgPoint.y + 5);
  
      // Показываем подсказку
      tooltipGroup.setAttribute("display", "block");
  
      // Скрыть подсказку, если кликнут в любом месте на странице
      const hideTooltip = (event) => {
        if (event.target !== svgElement) {
          tooltipGroup.setAttribute("display", "none");
          document.removeEventListener('click', hideTooltip);
        }
      };
  
      setTimeout(() => document.addEventListener('click', hideTooltip), 0);
    });
  }
  

  function initfloor1(container) {
    console.log('Функция initfloor1 вызвана, контейнер:', container);
  
    fetch("/components/svg/1floor.svg")
      .then(response => response.text())
      .then(svgText => {
        container.innerHTML = svgText;
        const svg = container.querySelector("svg");
  
        if (!svg) {
          console.error('SVG не найден в контейнере!');
          return;
        }
      })
      .catch(error => {
        console.error('Ошибка при загрузке SVG:', error);
      });
  }
  
  window.initfloor1 = initfloor1;

// Удаляем обработчики для кнопок увеличения и уменьшения

document.addEventListener('DOMContentLoaded', function () {
    const svgMap = document.getElementById('svg-map');
    let isDragging = false;
    let startX, startY;
    let scale = 1; // Переменная для отслеживания текущего масштаба
  
    // Функция для начала перетаскивания
    svgMap.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX - svgMap.offsetLeft;
      startY = e.clientY - svgMap.offsetTop;
      svgMap.classList.add('dragging'); // Меняем курсор
    });
  
    // Функция для прекращения перетаскивания
    document.addEventListener('mouseup', () => {
      isDragging = false;
      svgMap.classList.remove('dragging');
    });
  
    // Функция для перемещения карты
    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        const offsetX = e.clientX - startX;
        const offsetY = e.clientY - startY;
        svgMap.style.left = offsetX + 'px';
        svgMap.style.top = offsetY + 'px';
      }
    });
  
    // Масштабирование колесиком мыши с привязкой к курсору
    svgMap.addEventListener('wheel', (e) => {
      e.preventDefault(); // Отключаем стандартное поведение (скролл страницы)
  
      const rect = svgMap.getBoundingClientRect(); // Получаем размеры контейнера карты
      const offsetX = e.clientX - rect.left; // Позиция курсора по оси X относительно контейнера
      const offsetY = e.clientY - rect.top;  // Позиция курсора по оси Y относительно контейнера
  
      // Определяем новый масштаб
      if (e.deltaY > 0) {
        scale *= 0.9; // Уменьшаем масштаб
      } else {
        scale *= 1.1; // Увеличиваем масштаб
      }
  
      // Ограничиваем масштаб от 0.5x до 2x
      scale = Math.max(0.5, Math.min(scale, 6));
  
      // Применяем новый масштаб и обновляем точку масштабирования
      svgMap.style.transform = `scale(${scale})`;
      svgMap.style.transformOrigin = `${(offsetX / rect.width) * 100}% ${(offsetY / rect.height) * 100}%`;
    });
});

