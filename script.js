document.addEventListener("DOMContentLoaded", () => {
  const svgContainer = document.getElementById("svg-map");
  let activeZoneId = null;
  if (!svgContainer) {
    console.error('Контейнер для SVG не найден');
    return;
  }

  // Конфигурация этажей
  const floors = {
    floor0: { 
      name: "Гардероб", 
      file: "components/svg/0floor.svg",
      zonesLoader: () => window.zonesFloor0 || []
    },
    floor1: { 
      name: "1 этаж", 
      file: "components/svg/1floor.svg",
      zonesLoader: () => window.zonesFloor1 || []
    },
    floor2: { 
      name: "2 этаж", 
      file: "components/svg/2floor.svg",
      zonesLoader: () => window.zonesFloor2 || []
    },
    floor3: { 
      name: "3 этаж", 
      file: "components/svg/3floor.svg",
      zonesLoader: () => window.zonesFloor3 || []
    },
    floor4: { 
      name: "4 этаж", 
      file: "components/svg/4floor.svg",
      zonesLoader: () => window.zonesFloor4 || []
    },
    floor5: { 
      name: "5 этаж", 
      file: "components/svg/5floor.svg",
      zonesLoader: () => window.zonesFloor5 || []
    },
    floor6: { 
      name: "6 этаж", 
      file: "components/svg/6floor.svg",
      zonesLoader: () => window.zonesFloor6 || []
    },
    floor7: { 
      name: "7 этаж", 
      file: "components/svg/7floor.svg",
      zonesLoader: () => window.zonesFloor7 || []
    },
    floor8: { 
      name: "8 этаж", 
      file: "components/svg/8floor.svg",
      zonesLoader: () => window.zonesFloor8 || []
    },
  };

  // Функция загрузки этажа
  async function loadFloor(floorId) { 
    currentFloorId = floorId;   
    const floor = floors[floorId];
    if (!floor) {
      console.error(`Этаж ${floorId} не найден`);
      return;
    }

    // Обновляем отображение текущего этажа
    const currentFloorElement = document.getElementById('currentFloor');
    if (currentFloorElement) {
      currentFloorElement.textContent = floor.name;
    }

    try {
      // Загрузка SVG
      const response = await fetch(floor.file);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const svgText = await response.text();
      svgContainer.innerHTML = svgText;

      // Получаем зоны для этажа
      const zones = floor.zonesLoader();
      console.log(`Загружено ${zones.length} зон для ${floorId}`);      
      
      // Инициализация интерактивности
      initSVGInteractivity();

      // Показываем зоны
      if (zones.length > 0) {
        highlightZones(zones);
        renderFloorZonesInSidebar(zones, floor.name);
      } else {
        console.warn(`Нет данных о зонах для ${floorId}`);
      }

      // Сброс позиции и масштаба
      resetPosition();

    } catch (error) {
      console.error(`Ошибка загрузки ${floor.name}:`, error);
      svgContainer.innerHTML = `<div class="error">Ошибка загрузки ${floor.name}</div>`;
    }
  }

  // Функция для отображения зон в сайдбаре
  function renderFloorZonesInSidebar(zones, floorName) {
    const sidebar = document.getElementById('zoneListContainer');
    if (!sidebar) return;
    
    sidebar.innerHTML = ''; // очищаем старый список

    // Фильтруем только аудитории (можно настроить критерии)
    const classrooms = zones.slice(); // просто копия без фильтрации
    
    // Сортируем аудитории
    classrooms.sort((a, b) => {
      const numA = parseInt(a.label.match(/\d+/)?.[0] || 0);
      const numB = parseInt(b.label.match(/\d+/)?.[0] || 0);
      
      if (numA !== numB) {
        return numA - numB;
      }
      
      return a.label.localeCompare(b.label);
    });
    
    // Создаем и вставляем элементы
    classrooms.forEach(zone => {
      const item = document.createElement('div');
      item.classList.add('zone-item', 'p-2', 'border-bottom', 'cursor-pointer');
    
      const label = document.createElement('div');
      label.innerHTML = zone.label;
      label.classList.add('font-bold');
    
      const info = document.createElement('div');
      info.innerHTML = zone.info || '';
      info.classList.add('text-sm', 'text-muted');
    
      const addInfo = document.createElement('div');
      addInfo.innerHTML = zone.add_info || '';
      addInfo.classList.add('text-sm', 'text-muted');
    
      item.append(label, info, addInfo);
      item.setAttribute('data-zone', zone.id);
    
      item.addEventListener('click', () => {
        // Сначала снимаем выделение со всех зон
        clearHighlights();
        
        // Находим нужную зону по ID
        const targetZone = zones.find(z => z.id === zone.id);
        if (targetZone) {
          // Выделяем только эту зону
          highlightZones([targetZone]);
          
          // Прокручиваем карту к выделенной зоне (если нужно)
          scrollToZone(targetZone.id);
        }
      });

      

      sidebar.appendChild(item);
    });
  }

function clearHighlights() {
  const highlighted = svgContainer.querySelectorAll('.zone-highlight');
  highlighted.forEach(el => {
      el.classList.remove('zone-highlight', 'active');
      el.style.fill = '';
      el.style.strokeWidth = '';
      el.style.stroke = '';
  });

  activeZoneId = null;
}

  // Функция для прокрутки к зоне (опционально)
  function scrollToZone(zoneId) {
    const svgElement = svgContainer.querySelector('svg');
    if (!svgElement) return;

    const zoneElement = svgElement.querySelector(`#${CSS.escape(zoneId)}`) || 
                       svgElement.querySelector(`[data-id="${zoneId}"]`);
    
    if (zoneElement) {
      const bbox = zoneElement.getBBox();
      const centerX = bbox.x + bbox.width/2;
      const centerY = bbox.y + bbox.height/2;
      
      // Прокручиваем контейнер к центру зоны
      svgContainer.scrollTo({
        left: centerX - svgContainer.clientWidth/2,
        top: centerY - svgContainer.clientHeight/2,
        behavior: 'smooth'
      });
    }
  }

  let currentFloorId = 'floor1';

  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (event) => {
      const query = event.target.value.toLowerCase();
      filterZones(query);
    });
  }
  
  function filterZones(query) {
    const zones = getZonesForCurrentFloor();
    const filtered = zones.filter(zone => {
      const label = zone.label.toLowerCase();
      const info = (zone.info || '').toLowerCase();
      const addInfo = (zone.add_info || '').toLowerCase();
      return label.includes(query) || info.includes(query) || addInfo.includes(query);
    });
  
    const floor = floors[currentFloorId];
    renderFloorZonesInSidebar(filtered, floor.name);
  }
  
  function getZonesForCurrentFloor() {
    const floor = floors[currentFloorId];
    return floor ? floor.zonesLoader() : [];
  }
  

  function highlightZones(zones) {
    
    // Если передана строка (один ID), преобразуем в массив
    if (typeof zones === 'string') {
      zones = [{ id: zones }];
    }
    // Если передан один объект зоны, преобразуем в массив
    else if (!Array.isArray(zones)) {
      zones = [zones];
    }

    const svgElement = svgContainer.querySelector('svg');
    if (!svgElement) {
      console.error('SVG элемент не найден');
      return;
    }
  
    zones.forEach(zone => {
      if (!zone.id) return;

      const selectors = [
        `#${CSS.escape(zone.id)}`,
        `[data-id="${zone.id}"]`
      ];

      let element = null;
      for (const selector of selectors) {
        element = svgElement.querySelector(selector);
        if (element) break;
      }

      
      if (element) {
        element.classList.add('zone-highlight');
        
        if (zone.color) {
          element.style.fill = zone.color;
        }
        
        addTooltip(element, zone, svgElement);
      } else {
        console.warn(`Элемент с ID "${zone.id}" не найден в SVG`);
      }
    });
  }

  // Инициализация интерактивности SVG (Drag and Zoom)
  function initSVGInteractivity() {
    const svgElement = svgContainer.querySelector('svg');
    if (!svgElement) return;

    let currentScale = 1;
    let isDragging = false;
    let startX, startY;

    svgContainer.addEventListener('mousedown', (e) => {
      const allowedTags = ['svg', 'path', 'polygon', 'rect', 'circle'];
      if (!allowedTags.includes(e.target.tagName.toLowerCase())) return;

      isDragging = true;
      startX = e.clientX - svgContainer.offsetLeft;
      startY = e.clientY - svgContainer.offsetTop;
      svgContainer.style.cursor = 'grabbing';
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
      svgContainer.style.cursor = 'grab';
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      svgContainer.style.left = (e.clientX - startX) + 'px';
      svgContainer.style.top = (e.clientY - startY) + 'px';
    });

    svgContainer.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      currentScale = Math.max(0.5, Math.min(currentScale * delta, 6));
      svgContainer.style.transform = `scale(${currentScale})`;
    });
    
    svgContainer.addEventListener('click', (e) => {
      if (!e.target.closest('.zone-highlight')) {
        clearHighlights();
      }
    });
  }

  // Сброс позиции и масштаба
  function resetPosition() {
    svgContainer.style.left = '0';
    svgContainer.style.top = '0';
    svgContainer.style.transform = 'scale(1)';
  }

  // Добавление подсказки
  function addTooltip(element, zone, svg) {
    const tooltip = document.createElementNS("http://www.w3.org/2000/svg", "g");
    tooltip.classList.add('svg-tooltip');
    tooltip.style.display = 'none';
    
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute('rx', '5');
    rect.setAttribute('ry', '5');
    rect.setAttribute('fill', 'rgba(0,0,0,0.85)');
    
    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute('fill', 'white');
    label.setAttribute('font-size', '14');
    label.setAttribute('font-family', 'Arial, sans-serif');
    label.textContent = zone.label;
    
    tooltip.append(rect, label);
    
    if (zone.info) {
      const info = document.createElementNS("http://www.w3.org/2000/svg", "text");
      info.setAttribute('fill', 'white');
      info.setAttribute('font-size', '12');
      info.setAttribute('font-family', 'Arial, sans-serif');
      info.setAttribute('dy', '15');
      info.textContent = zone.info;
      tooltip.appendChild(info);
    }
    
    svg.appendChild(tooltip);

    element.addEventListener('mouseenter', () => {
      const bbox = element.getBBox();
      const tooltipX = bbox.x + bbox.width + 10;
      const tooltipY = bbox.y;
      
      label.setAttribute('x', tooltipX);
      label.setAttribute('y', tooltipY + 15);
      
      if (zone.info) {
        const info = tooltip.querySelector('text:nth-child(3)');
        info.setAttribute('x', tooltipX);
        info.setAttribute('y', tooltipY + 30);
      }
      
      const tooltipBBox = tooltip.getBBox();
      rect.setAttribute('x', tooltipBBox.x - 5);
      rect.setAttribute('y', tooltipBBox.y - 5);
      rect.setAttribute('width', tooltipBBox.width + 10);
      rect.setAttribute('height', tooltipBBox.height + 10);
      
      tooltip.style.display = 'block';
    });

    element.addEventListener('mouseleave', () => {
      tooltip.style.display = 'none';
    });

    element.addEventListener('click', (e) => {
      e.stopPropagation();
      
      const modal = document.createElement('div');
      modal.style.position = 'fixed';
      modal.style.top = '50%';
      modal.style.left = '50%';
      modal.style.transform = 'translate(-50%, -50%)';
      modal.style.backgroundColor = 'white';
      modal.style.padding = '20px';
      modal.style.borderRadius = '1px';
      modal.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
      modal.style.zIndex = '1000';
      modal.style.maxWidth = '80%';
      modal.style.maxHeight = '80vh';
      modal.style.overflow = 'auto';
      

      
      const closeBtn = modal.querySelector('button');
      closeBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
      });
      
      document.body.appendChild(modal);
    });
  }

  // Делаем функцию доступной глобально
  window.loadFloor = loadFloor;

  // Загрузка первого этажа по умолчанию
  loadFloor('floor1');
});


/*
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

      // Загружаем первый этаж по умолчанию
      window.onload = () => {
      loadFloor("floor1");
      };
      
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

  function getAllZones() {
    const allZones = [];
  
    Object.keys(window).forEach(key => {
      if (key.startsWith("zonesFloor")) {
        const zones = window[key];
        if (Array.isArray(zones)) {
          allZones.push(...zones);
        }
      }
    });
  
    return allZones;
  }
  
  const allZones = getAllZones();
console.log("Найдено зон:", allZones.length);

function searchAllZones(query) {
  const lower = query.toLowerCase();
  return getAllZones().filter(zone =>
    (zone.label && zone.label.toLowerCase().includes(lower)) ||
    (zone.info && zone.info.toLowerCase().includes(lower)) ||
    (zone.add_info && zone.add_info.toLowerCase().includes(lower))
  );
}

const results = searchAllZones("лифт");
console.log(results);
*/