function initfloor1(container) {
    fetch("/components/svg/1floor.svg")
      .then(response => response.text())
      .then(svgText => {
        container.innerHTML = svgText;
        const svg = container.querySelector("svg");
  
        if (!svg) {
          console.error('SVG не найден в контейнере!');
          return;
        }
  
        // Массив с зонами и их описанием
        const zonesWithTooltips = [
            { id: "sport", label: "Спортивный зал", color: "#87CEFA" },
            { id: "library", label: "Библиотека", color: "#FFD700" },
            { id: "cafeteria", label: "Столовая", color: "#98FB98" },
            { id: "lab", label: "Лаборатория", color: "#FFB6C1" },
            // Добавляй сюда сколько хочешь :)
        ];
        
        // Проходимся по всем зонам
        zonesWithTooltips.forEach(({ id, label, color }) => {
            const element = svg.querySelector(`#${id}`);
            if (element) {
            element.style.cursor = "pointer";
            if (color) {
                element.style.fill = color;
            }
            addTooltipToSvgElement(element, label, svg);
            } else {
            console.warn(`Зона с id="${id}" не найдена`);
            }
        });
  

      // Увеличение масштаба
      const zoomInButton = document.getElementById('zoom-in');
      zoomInButton.addEventListener('click', () => {
        const currentScale = parseFloat(svg.getAttribute('transform')?.match(/scale\(([^)]+)\)/)?.[1]) || 1;
        const newScale = currentScale * 1.2; // Увеличиваем на 20%
        svg.setAttribute('transform', `scale(${newScale})`);
      });

      // Уменьшение масштаба
      const zoomOutButton = document.getElementById('zoom-out');
      zoomOutButton.addEventListener('click', () => {
        const currentScale = parseFloat(svg.getAttribute('transform')?.match(/scale\(([^)]+)\)/)?.[1]) || 1;
        const newScale = currentScale / 1.2; // Уменьшаем на 20%
        svg.setAttribute('transform', `scale(${newScale})`);
      });
  
      })
      .catch(error => {
        console.error('Ошибка при загрузке SVG:', error);
      });

    
  }
  
  window.initfloor1 = initfloor1;
  