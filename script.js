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

    document.addEventListener('click', (e) => {
      const isZoneElement = e.target.closest('[data-id]') || 
                           e.target.closest('.svg-tooltip');

      // Если клик не по зоне и не по тултипу, и есть активная зона
      if (!isZoneElement && activeZoneId) {
        const activeTooltip = svgContainer.querySelector(`.svg-tooltip[data-zone="${activeZoneId}"]`);
        if (activeTooltip) {
          activeTooltip.style.display = 'none';
          activeZoneId = null;
          }
        }
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
    tooltip.setAttribute('data-zone', zone.id);
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

    function updateTooltipPosition() {
        const bbox = element.getBBox();
        const tooltipX = bbox.x + bbox.width + 10;
        const tooltipY = bbox.y;
        
        label.setAttribute('x', tooltipX);
        label.setAttribute('y', tooltipY + 15);
        
        if (zone.info) {
            const infoElement = tooltip.querySelector('text:nth-child(3)');
            infoElement.setAttribute('x', tooltipX);
            infoElement.setAttribute('y', tooltipY + 30);
        }
        
        const tooltipBBox = tooltip.getBBox();
        rect.setAttribute('x', tooltipBBox.x - 5);
        rect.setAttribute('y', tooltipBBox.y - 5);
        rect.setAttribute('width', tooltipBBox.width + 10);
        rect.setAttribute('height', tooltipBBox.height + 10);
    }

    element.addEventListener('mouseenter', () => {
        if (activeZoneId !== zone.id) {
            updateTooltipPosition();
            tooltip.style.display = 'block';
        }
    });

    element.addEventListener('mouseleave', () => {
        if (activeZoneId !== zone.id) {
            tooltip.style.display = 'none';
        }
    });

    element.addEventListener('click', (e) => {
        e.stopPropagation();
        
        if (activeZoneId === zone.id) {
        // Скрываем при повторном клике
        tooltip.style.display = 'none';
        activeZoneId = null;
      } else {
        // Скрываем предыдущий тултип
        if (activeZoneId) {
          const prevTooltip = svgContainer.querySelector(`.svg-tooltip[data-zone="${activeZoneId}"]`);
          if (prevTooltip) prevTooltip.style.display = 'none';
        }
        // Показываем новый тултип
        updateTooltipPosition();
        tooltip.style.display = 'block';
        activeZoneId = zone.id;
      }
    });
  }
  // Делаем функцию доступной глобально
  window.loadFloor = loadFloor;

  // Загрузка первого этажа по умолчанию
  loadFloor('floor1');
});