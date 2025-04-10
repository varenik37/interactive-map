document.addEventListener("DOMContentLoaded", () => {
    const svgContainer = document.getElementById("svg-map");
    
    // Все этажи здания
    const floors = [
      { id: 'floor0', name: 'Гардероб', order: 0 },
      { id: 'floor1', name: 'Этаж 1', order: 1 },
      { id: 'floor2', name: 'Этаж 2', order: 2 },
      { id: 'floor3', name: 'Этаж 3', order: 3 },
      { id: 'floor4', name: 'Этаж 4', order: 4 },
      { id: 'floor5', name: 'Этаж 5', order: 5 },
      { id: 'floor6', name: 'Этаж 6', order: 6 },
      { id: 'floor7', name: 'Этаж 7', order: 7 },
      { id: 'floor8', name: 'Этаж 8', order: 8 }
    ];
  
    // Основная функция загрузки этажа
    async function loadFloor(floorId) {
      const floor = floors.find(f => f.id === floorId);
      if (!floor) return;
  
      svgContainer.innerHTML = '<div class="loading">Загрузка этажа...</div>';
      document.getElementById('currentFloor').textContent = floor.name;
  
      // Удаляем предыдущий скрипт этажа
      const oldScript = document.querySelector(`script[src*="${floorId}.js"]`);
      if (oldScript) oldScript.remove();
  
      // Загружаем скрипт этажа
      const script = document.createElement("script");
      script.src = `floors/${floorId}.js`;
      
      // Создаем временный контейнер для предварительной загрузки данных
      const tempContainer = document.createElement("div");
      tempContainer.style.display = 'none';
      document.body.appendChild(tempContainer);
  
      try {
        await new Promise((resolve, reject) => {
          script.onload = () => {
            const initFunc = window[`init${floorId}`];
            if (typeof initFunc === "function") {
              // 1. Сначала загружаем данные во временный контейнер
              initFunc(tempContainer);
              
              // 2. Сохраняем зоны текущего этажа
              if (window.zonesWithTooltips) {
                window.currentFloorZones = window.zonesWithTooltips.filter(zone => 
                  zone.label && zone.label.trim() !== ''
                );
                // 3. Немедленно рендерим сайдбар
                renderCurrentFloorZones();
              }
              
              // 4. Инициализируем основной контейнер
              initFunc(svgContainer);
              
              resolve();
            } else {
              reject(`Функция init${floorId} не найдена`);
            }
          };
          
          script.onerror = () => {
            reject(`Ошибка загрузки скрипта для ${floorId}`);
          };
          
          document.body.appendChild(script);
        });
      } catch (error) {
        console.error('Ошибка загрузки этажа:', error);
        svgContainer.innerHTML = '<div class="error">Ошибка загрузки этажа</div>';
      } finally {
        tempContainer.remove();
      }
    }
  
    // Предзагрузка данных всех этажей для поиска
    async function preloadAllZones() {
      window.allZones = [];
      
      for (const floor of floors) {
        try {
          await new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = `floors/${floor.id}.js`;
            
            script.onload = () => {
              const initFunc = window[`init${floor.id}`];
              if (typeof initFunc === "function") {
                const tempContainer = document.createElement("div");
                tempContainer.style.display = 'none';
                document.body.appendChild(tempContainer);
                
                initFunc(tempContainer);
                
                if (window.zonesWithTooltips) {
                  window.zonesWithTooltips.forEach(zone => {
                    if (zone.label && zone.label.trim() !== '') {
                      window.allZones.push({
                        ...zone,
                        floorId: floor.id,
                        floorName: floor.name
                      });
                    }
                  });
                }
                
                tempContainer.remove();
              }
              resolve();
            };
            
            script.onerror = () => {
              console.error(`Не удалось загрузить ${floor.id}.js`);
              resolve();
            };
            
            document.body.appendChild(script);
          });
        } catch (e) {
          console.error(`Ошибка загрузки ${floor.id}:`, e);
        }
      }
    }
  
    // Отображение аудиторий текущего этажа
    function renderCurrentFloorZones() {
      const container = document.getElementById("zoneListContainer");
      if (!container || !window.currentFloorZones) return;
      
      container.innerHTML = `
        <div class="sidebar-header">
          <h4>${document.getElementById('currentFloor').textContent}</h4>
        </div>
        <div id="currentZonesList"></div>
      `;
      
      const listContainer = document.getElementById("currentZonesList");
      window.currentFloorZones.forEach(zone => {
        const zoneElement = document.createElement("div");
        zoneElement.className = "zone-item";
        zoneElement.innerHTML = `
          <div class="zone-title">${zone.label}</div>
          ${zone.info ? `<div class="zone-info">${zone.info}</div>` : ''}
        `;
        zoneElement.addEventListener('click', () => highlightElement(zone.id));
        listContainer.appendChild(zoneElement);
      });
    }
  
    // Глобальный поиск по всем этажам
    function renderGlobalSearchResults(filter = "") {
      const container = document.getElementById("zoneListContainer");
      if (!container) return;
      
      const term = filter.toLowerCase();
      const results = (window.allZones || [])
        .filter(zone => 
          zone.label.toLowerCase().includes(term) ||
          (zone.info && zone.info.toLowerCase().includes(term)) ||
          zone.floorName.toLowerCase().includes(term)
        );
      
      container.innerHTML = '<h4>Результаты поиска</h4>';
      
      if (results.length === 0) {
        container.innerHTML += '<div class="no-results">Ничего не найдено</div>';
        return;
      }
      
      // Группировка по этажам
      const grouped = {};
      results.forEach(zone => {
        if (!grouped[zone.floorId]) {
          grouped[zone.floorId] = {
            floorName: zone.floorName,
            zones: []
          };
        }
        grouped[zone.floorId].zones.push(zone);
      });
      
      // Сортировка этажей
      Object.keys(grouped)
        .sort((a, b) => floors.find(f => f.id === a).order - floors.find(f => f.id === b).order)
        .forEach(floorId => {
          const floorHeader = document.createElement("div");
          floorHeader.className = "floor-header";
          floorHeader.textContent = grouped[floorId].floorName;
          container.appendChild(floorHeader);
          
          grouped[floorId].zones.forEach(zone => {
            const zoneEl = document.createElement("div");
            zoneEl.className = "search-result-item";
            zoneEl.innerHTML = `
              <div class="result-title">${zone.label}</div>
              ${zone.info ? `<div class="result-info">${zone.info}</div>` : ''}
            `;
            zoneEl.addEventListener('click', () => {
              loadFloor(zone.floorId);
              setTimeout(() => highlightElement(zone.id), 300);
            });
            container.appendChild(zoneEl);
          });
        });
    }
  
    // Подсветка элемента на карте
    function highlightElement(elementId) {
      const svg = document.querySelector('#svg-map svg');
      if (!svg) return;
      
      svg.querySelectorAll('.highlighted').forEach(el => {
        el.classList.remove('highlighted');
      });
      
      const element = svg.querySelector(`[id="${CSS.escape(elementId)}"]`) || 
                     svg.querySelector(`[id*="${elementId}"]`);
      
      if (element) {
        element.classList.add('highlighted');
        
        // Центрируем элемент
        const rect = element.getBoundingClientRect();
        const svgRect = svg.getBoundingClientRect();
        const offsetX = window.innerWidth/2 - rect.left - rect.width/2;
        const offsetY = window.innerHeight/2 - rect.top - rect.height/2;
        
        svg.style.left = `${offsetX}px`;
        svg.style.top = `${offsetY}px`;
      }
    }
  
    // Инициализация при загрузке страницы
    (async function init() {
      // 1. Загружаем первый этаж и сразу показываем его аудитории
      await loadFloor('floor1');
      
      // 2. Параллельно предзагружаем остальные этажи
      preloadAllZones();
    })();
  
    // Обработчик поиска
    document.querySelector("input[placeholder='Поиск...']").addEventListener("input", (e) => {
      if (e.target.value.trim() === '') {
        renderCurrentFloorZones();
      } else {
        renderGlobalSearchResults(e.target.value);
      }
    });
  
    // Drag and zoom
    const svgMap = document.getElementById('svg-map');
    let isDragging = false;
    let startX, startY;
    let scale = 1;
  
    svgMap.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX - svgMap.offsetLeft;
      startY = e.clientY - svgMap.offsetTop;
      svgMap.style.cursor = 'grabbing';
    });
  
    document.addEventListener('mouseup', () => {
      isDragging = false;
      svgMap.style.cursor = 'grab';
    });
  
    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        svgMap.style.left = (e.clientX - startX) + 'px';
        svgMap.style.top = (e.clientY - startY) + 'px';
      }
    });
  
    svgMap.addEventListener('wheel', (e) => {
      e.preventDefault();
      scale = e.deltaY > 0 ? scale * 0.9 : scale * 1.1;
      scale = Math.max(0.5, Math.min(scale, 6));
      svgMap.style.transform = `scale(${scale})`;
    });
  
    // Глобальные функции
    window.loadFloor = loadFloor;
    window.highlightElement = highlightElement;
  });
  
  // Функция для добавления подсказок
  window.addTooltipToSvgElement = function(svgElement, tooltipText, svg) {
    if (!tooltipText || tooltipText.trim() === '') return;
    
    const tooltipGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    tooltipGroup.setAttribute("class", "svg-tooltip-group");
    
    const tooltipRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    tooltipRect.setAttribute("rx", "5");
    tooltipRect.setAttribute("ry", "5");
    tooltipRect.setAttribute("fill", "rgba(0,0,0,0.8)");
    
    const tooltip = document.createElementNS("http://www.w3.org/2000/svg", "text");
    tooltip.setAttribute("fill", "white");
    tooltip.setAttribute("font-size", "14");
    tooltip.textContent = tooltipText;
    
    tooltipGroup.appendChild(tooltipRect);
    tooltipGroup.appendChild(tooltip);
    svg.appendChild(tooltipGroup);
  
    svgElement.addEventListener('mouseenter', (e) => {
      const point = svg.createSVGPoint();
      point.x = e.clientX;
      point.y = e.clientY;
      const svgPoint = point.matrixTransform(svg.getScreenCTM().inverse());
  
      tooltip.setAttribute("x", svgPoint.x + 10);
      tooltip.setAttribute("y", svgPoint.y + 15);
      
      const bbox = tooltip.getBBox();
      tooltipRect.setAttribute("x", bbox.x - 5);
      tooltipRect.setAttribute("y", bbox.y - 5);
      tooltipRect.setAttribute("width", bbox.width + 10);
      tooltipRect.setAttribute("height", bbox.height + 10);
      
      tooltipGroup.setAttribute("display", "block");
    });
  
    svgElement.addEventListener('mouseleave', () => {
      tooltipGroup.setAttribute("display", "none");
    });
  };

/*
document.addEventListener("DOMContentLoaded", () => {
  const svgContainer = document.getElementById("svg-map");
  
  // Явное объявление всех доступных этажей
  const floors = [
    { name: 'floor0', label: 'Гардероб' },
    { name: 'floor1', label: 'Этаж 1' },
    { name: 'floor2', label: 'Этаж 2' },
    { name: 'floor3', label: 'Этаж 3' },
    { name: 'floor4', label: 'Этаж 4' },
    { name: 'floor5', label: 'Этаж 5' },
    { name: 'floor6', label: 'Этаж 6' },
    { name: 'floor7', label: 'Этаж 7' },
    { name: 'floor8', label: 'Этаж 8' }
  ];

  // Загрузка этажа
  function loadFloor(floor, callback = () => {}) {
    currentFloor = floor;
    svgContainer.innerHTML = "";
    const script = document.createElement("script");
    script.src = `floors/${floor}.js`;
    script.onload = () => {
      const initFunc = window[`init${floor}`];
      if (typeof initFunc === "function") {
        initFunc(svgContainer);
      }
      callback();
    };
    document.body.appendChild(script);
  }

  window.loadFloor = loadFloor;

  const allZones = [];

  async function preloadAllZones() {
    // Используем объявленный массив floors вместо жесткого цикла
    for (const floor of floors) {
      await loadFloorData(floor.name);
    }
    renderZoneList();
  }

  function loadFloorData(floorName) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `floors/${floorName}.js`;
      script.onload = () => {
        const initFunc = window[`init${floorName}`];
        if (typeof initFunc === "function") {
          const tempSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
          tempSvg.setAttribute("style", "display: none;");
          document.body.appendChild(tempSvg);
  
          initFunc(tempSvg);
  
          if (window.zonesWithTooltips) {
            // Находим соответствующий этаж в массиве floors
            const floorInfo = floors.find(f => f.name === floorName);
            const floorLabel = floorInfo ? floorInfo.label : `Этаж ${floorName.replace("floor", "")}`;
            
            window.zonesWithTooltips.forEach(zone => {
              allZones.push({ 
                ...zone, 
                floor: floorName,
                floorLabel // Добавляем читаемое название этажа
              });
            });
          }
  
          tempSvg.remove();
          resolve();
        } else {
          reject(`init${floorName} не найдена`);
        }
      };
      script.onerror = () => reject(`Ошибка загрузки ${floorName}`);
      document.body.appendChild(script);
    });
  }

  // Остальной код остается без изменений
  window.addTooltipToSvgElement = function(svgElement, tooltipText, svg) {
    // ... существующая реализация ...
  };

  // Перетаскивание и масштабирование
  const svgMap = document.getElementById('svg-map');
  let isDragging = false;
  let startX, startY;
  let scale = 1;

  svgMap.addEventListener('mousedown', (e) => {
    // ... существующая реализация ...
  });

  document.addEventListener('mouseup', () => {
    // ... существующая реализация ...
  });

  document.addEventListener('mousemove', (e) => {
    // ... существующая реализация ...
  });

  svgMap.addEventListener('wheel', (e) => {
    // ... существующая реализация ...
  });

  // Отображение зон с использованием floorLabel
  function renderZoneList(filter = "") {
    const container = document.getElementById("zoneListContainer");
    container.innerHTML = "";

    const normalizedFilter = filter.toLowerCase();

    allZones
      .filter(zone =>
        (zone.label?.toLowerCase().includes(normalizedFilter)) ||
        (zone.info?.toLowerCase().includes(normalizedFilter)) ||
        (zone.add_info?.toLowerCase().includes(normalizedFilter)) ||
        (zone.floorLabel?.toLowerCase().includes(normalizedFilter)) // Добавили поиск по названию этажа
      )
      .forEach(zone => {
        const zoneDiv = document.createElement("div");
        zoneDiv.style.borderBottom = "1px solid #ccc";
        zoneDiv.style.padding = "8px";
        zoneDiv.style.cursor = "pointer";

        zoneDiv.innerHTML = `
          <strong style="font-size: 18px;">${zone.label}</strong><br>
          ${zone.info ? `<strong>${zone.info}</strong><br>` : ''}
          ${zone.add_info ? `<em>${zone.add_info}</em><br>` : ''}
          <span style="font-size: 12px; color: gray;">${zone.floorLabel}</span>
        `;

        zoneDiv.addEventListener("click", () => {
          loadFloor(zone.floor, () => {
            highlightZone(zone.label);
          });
        });

        container.appendChild(zoneDiv);
      });
  }

  function highlightZone(label) {
    // ... существующая реализация ...
  }

  document.querySelector("input[placeholder='Поиск...']").addEventListener("input", (e) => {
    renderZoneList(e.target.value);
  });

  preloadAllZones();
});
*/