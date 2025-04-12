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

  let currentFloorId = 'floor1';
  let currentSearchResults = null;

  // Функция для получения всех зон из всех этажей
  function getAllZones() {
    const allZones = [];
    for (const floorId in floors) {
      const floor = floors[floorId];
      const zones = floor.zonesLoader();
      zones.forEach(zone => {
        zone.floorId = floorId;
        zone.floorName = floor.name;
      });
      allZones.push(...zones);
    }
    return allZones;
  }

  // Функция загрузки этажа
  window.loadFloor = async function loadFloor(floorId, keepSearchResults = false) {
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
      
      // Инициализация интерактивности
      initSVGInteractivity();

      // Если нет активного поиска или явно запрошено сохранение результатов
      if (!currentSearchResults || keepSearchResults) {
        if (zones.length > 0) {
          highlightZones(zones);
          if (!keepSearchResults) {
            renderFloorZonesInSidebar(zones, floor.name);
          }
        }
      } else {
        // При активном поиске просто выделяем зоны без изменения сайдбара
        highlightZones(zones);
      }

      // Сброс позиции и масштаба
      resetPosition();

    } catch (error) {
      console.error(`Ошибка загрузки ${floor.name}:`, error);
      svgContainer.innerHTML = `<div class="error">Ошибка загрузки ${floor.name}</div>`;
    }
  }

  document.querySelectorAll('.dropdown-item[data-floor]').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const floorId = e.currentTarget.getAttribute('data-floor');
      console.log('Выбран этаж:', floorId); // 👈 проверка
      loadFloor(floorId);
    });
  });

  // Функция для отображения зон текущего этажа в сайдбаре
  function renderFloorZonesInSidebar(zones, floorName) {
    const sidebar = document.getElementById('zoneListContainer');
    if (!sidebar) return;
    
    sidebar.innerHTML = '';

    zones.sort((a, b) => {
      const numA = parseInt(a.label.match(/\d+/)?.[0] || 0);
      const numB = parseInt(b.label.match(/\d+/)?.[0] || 0);
      return numA !== numB ? numA - numB : a.label.localeCompare(b.label);
    });
    
    zones.forEach(zone => {
      const item = document.createElement('div');
      item.classList.add('zone-item', 'p-2', 'border-bottom', 'cursor-pointer');
      item.setAttribute('data-zone', zone.id);
      
      item.innerHTML = `
        <div class="font-bold">${zone.label}</div>
        ${zone.info ? `<div class="text-sm text-muted">${zone.info}</div>` : ''}
        ${zone.add_info ? `<div class="text-sm text-muted">${zone.add_info}</div>` : ''}
      `;
      
      item.addEventListener('click', () => {
        // Проверяем, была ли зона уже активна
        if (activeZoneId === zone.id) {
          // Если кликаем на уже активную зону - показываем все зоны этажа
          clearHighlights();
          highlightZones(zones);
          activeZoneId = null;
        } else {
          // Иначе выделяем только выбранную зону
          clearHighlights();
          highlightZones([zone]);
          scrollToZone(zone.id);
          showTooltipForZone(zone.id);
        }
      });
      
      sidebar.appendChild(item);
    });
  }

  // Функция для отображения результатов поиска
  function renderSearchResultsInSidebar(results) {
    const sidebar = document.getElementById('zoneListContainer');
    if (!sidebar) return;
    
    currentSearchResults = results;
    sidebar.innerHTML = '';
    
    if (results.length === 0) {
      sidebar.innerHTML = '<div class="p-2 text-muted">Ничего не найдено</div>';
      return;
    }
    
    // Группируем по этажам
    const groupedByFloor = results.reduce((acc, zone) => {
      if (!acc[zone.floorId]) {
        acc[zone.floorId] = {
          floorName: zone.floorName,
          zones: []
        };
      }
      acc[zone.floorId].zones.push(zone);
      return acc;
    }, {});
    
    // Сортируем этажи
    Object.keys(groupedByFloor)
      .sort((a, b) => parseInt(a.replace('floor', '')) - parseInt(b.replace('floor', '')))
      .forEach(floorId => {
        const floorData = groupedByFloor[floorId];
        
        const floorHeader = document.createElement('div');
        floorHeader.classList.add('p-2', 'font-bold', 'bg-gray-100');
        floorHeader.textContent = floorData.floorName;
        sidebar.appendChild(floorHeader);
        
        floorData.zones.forEach(zone => {
          const item = document.createElement('div');
          item.classList.add('zone-item', 'p-2', 'border-bottom', 'cursor-pointer');
          item.setAttribute('data-zone', zone.id);
          
          item.innerHTML = `
            <div class="font-bold">${zone.label}</div>
            ${zone.info ? `<div class="text-sm text-muted">${zone.info}</div>` : ''}
            ${zone.add_info ? `<div class="text-sm text-muted">${zone.add_info}</div>` : ''}
          `;
          
          item.addEventListener('click', () => {
            loadFloor(zone.floorId, true).then(() => {
              clearHighlights();
              const zones = floors[zone.floorId].zonesLoader();
              const targetZone = zones.find(z => z.id === zone.id);
              if (targetZone) {
                highlightZones([targetZone]);
                scrollToZone(targetZone.id);
                showTooltipForZone(targetZone.id);
              }
            });
          });
          
          sidebar.appendChild(item);
        });
      });
  }

  // Очистка выделений
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

  // Прокрутка к зоне
  function scrollToZone(zoneId) {
    const svgElement = svgContainer.querySelector('svg');
    if (!svgElement) return;

    const zoneElement = svgElement.querySelector(`#${CSS.escape(zoneId)}`) || 
                       svgElement.querySelector(`[data-id="${zoneId}"]`);
    
    if (zoneElement) {
      const bbox = zoneElement.getBBox();
      svgContainer.scrollTo({
        left: bbox.x + bbox.width/2 - svgContainer.clientWidth/2,
        top: bbox.y + bbox.height/2 - svgContainer.clientHeight/2,
        behavior: 'smooth'
      });
    }
  }

  // Подсветка зон
  function highlightZones(zones) {
    if (!Array.isArray(zones)) zones = [zones];
    const svgElement = svgContainer.querySelector('svg');
    if (!svgElement) return;
  
    zones.forEach(zone => {
      if (!zone.id) return;

      const element = svgElement.querySelector(`#${CSS.escape(zone.id)}`) || 
                     svgElement.querySelector(`[data-id="${zone.id}"]`);
      
      if (element) {
        element.classList.add('zone-highlight');
        if (zone.color) element.style.fill = zone.color;
        addTooltip(element, zone, svgElement);
      }
    });
  }

  // Поиск по зонам
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      
      if (query.length > 0) {
        const allZones = getAllZones();
        const filtered = allZones.filter(zone => 
          [zone.label, zone.info, zone.add_info]
            .filter(Boolean)
            .some(text => text.toLowerCase().includes(query))
        );
        renderSearchResultsInSidebar(filtered);
      } else {
        currentSearchResults = null;
        const zones = floors[currentFloorId].zonesLoader();
        renderFloorZonesInSidebar(zones, floors[currentFloorId].name);
      }
    });
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
        tooltip.style.display = 'none';
        activeZoneId = null;
      } else {
        if (activeZoneId) {
          const prevTooltip = svgContainer.querySelector(`.svg-tooltip[data-zone="${activeZoneId}"]`);
          if (prevTooltip) prevTooltip.style.display = 'none';
        }
        updateTooltipPosition();
        tooltip.style.display = 'block';
        activeZoneId = zone.id;
      }
    });
  }

  function renderSearchResultsInSidebar(results) {
    const sidebar = document.getElementById('zoneListContainer');
    if (!sidebar) return;
    
    currentSearchResults = results;
    sidebar.innerHTML = '';
    
    if (results.length === 0) {
      sidebar.innerHTML = '<div class="p-2 text-muted">Ничего не найдено</div>';
      return;
    }
    
    // Группируем по этажам
    const groupedByFloor = results.reduce((acc, zone) => {
      if (!acc[zone.floorId]) {
        acc[zone.floorId] = {
          floorName: zone.floorName,
          zones: []
        };
      }
      acc[zone.floorId].zones.push(zone);
      return acc;
    }, {});
    
    // Сортируем этажи
    Object.keys(groupedByFloor)
      .sort((a, b) => parseInt(a.replace('floor', '')) - parseInt(b.replace('floor', '')))
      .forEach(floorId => {
        const floorData = groupedByFloor[floorId];
        
        const floorHeader = document.createElement('div');
        floorHeader.classList.add('p-2', 'font-bold', 'bg-gray-100');
        floorHeader.textContent = floorData.floorName;
        sidebar.appendChild(floorHeader);
        
        floorData.zones.forEach(zone => {
          const item = document.createElement('div');
          item.classList.add('zone-item', 'p-2', 'border-bottom', 'cursor-pointer');
          item.setAttribute('data-zone', zone.id);
          
          item.innerHTML = `
            <div class="font-bold">${zone.label}</div>
            ${zone.info ? `<div class="text-sm text-muted">${zone.info}</div>` : ''}
            ${zone.add_info ? `<div class="text-sm text-muted">${zone.add_info}</div>` : ''}
          `;
          
          item.addEventListener('click', () => {
            loadFloor(zone.floorId, true).then(() => {
              const zones = floors[zone.floorId].zonesLoader();
              const targetZone = zones.find(z => z.id === zone.id);
              
              if (targetZone) {
                // Проверяем, была ли зона уже активна
                if (activeZoneId === targetZone.id) {
                  // Если кликаем на уже активную зону - показываем все зоны этажа
                  clearHighlights();
                  highlightZones(zones);
                  activeZoneId = null;
                } else {
                  // Иначе выделяем только выбранную зону
                  clearHighlights();
                  highlightZones([targetZone]);
                  scrollToZone(targetZone.id);
                  showTooltipForZone(targetZone.id);
                }
              }
            });
          });
          
          sidebar.appendChild(item);
        });
      });
  }

  // Показать тултип для зоны
  function showTooltipForZone(zoneId) {
    const tooltip = svgContainer.querySelector(`.svg-tooltip[data-zone="${zoneId}"]`);
    if (tooltip) {
      tooltip.style.display = 'block';
      activeZoneId = zoneId;
    }
  }

  // Инициализация интерактивности SVG
  function initSVGInteractivity() {
    const svgElement = svgContainer.querySelector('svg');
    if (!svgElement) return;

    let isDragging = false;
    let startX, startY;

    svgContainer.addEventListener('mousedown', (e) => {
      if (['svg', 'path', 'polygon', 'rect', 'circle'].includes(e.target.tagName.toLowerCase())) {
        isDragging = true;
        startX = e.clientX - svgContainer.offsetLeft;
        startY = e.clientY - svgContainer.offsetTop;
        svgContainer.style.cursor = 'grabbing';
      }
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
      svgContainer.style.cursor = 'grab';
    });

    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        svgContainer.style.left = (e.clientX - startX) + 'px';
        svgContainer.style.top = (e.clientY - startY) + 'px';
      }
    });

    svgContainer.addEventListener('wheel', (e) => {
      e.preventDefault();
      const scaleDelta = e.deltaY > 0 ? 0.9 : 1.1;
      const currentScale = parseFloat(svgContainer.style.transform?.replace('scale(', '') || 1);
      const newScale = Math.max(0.5, Math.min(currentScale * scaleDelta, 6));
      svgContainer.style.transform = `scale(${newScale})`;
    });
  }

  // Сброс позиции и масштаба
  function resetPosition() {
    svgContainer.style.left = '0';
    svgContainer.style.top = '0';
    svgContainer.style.transform = 'scale(1)';
  }

  const btnHome = document.getElementById('btnHome');
if (btnHome) {
  btnHome.addEventListener('click', () => {
    searchInput.value = ''; // сбрасываем поиск
    currentSearchResults = null;
    clearHighlights();
    loadFloor('floor1'); // или floor0, если гардероб — дефолт
  });
}

  // Загрузка первого этажа по умолчанию
  loadFloor('floor1');
});