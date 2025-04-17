document.addEventListener("DOMContentLoaded", () => { //Загрузка после полной готовности документа
  //Поиск нужных HTML-элементов
  const svgContainer = document.getElementById("svg-map");
  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.querySelector('.sidebar-toggle');
  const searchInput = document.getElementById('searchInput');
  let activeZoneId = null; //Переменная какая зона сейчас выбрана
  if (!svgContainer) { //Проверка, что контейнер SVG существует
    console.error('Контейнер для SVG не найден');
    return; // Если нет контейнера - останавливаем выполнение
  }

  const floors = { //Информация об этажах
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

  let currentFloorId = 'floor1'; // По умолчанию первый этаж
  let currentSearchResults = null; //

  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

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

  window.loadFloor = async function loadFloor(floorId, keepSearchResults = false) {
    currentFloorId = floorId;
    const floor = floors[floorId];
    if (!floor) {
      console.error(`Этаж ${floorId} не найден`);
      return;
    }

    const currentFloorElement = document.getElementById('currentFloor');
    if (currentFloorElement) {
      currentFloorElement.textContent = floor.name;
    }

    try {
      const response = await fetch(floor.file);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const svgText = await response.text();
      svgContainer.innerHTML = svgText;

      setTimeout(() => {
        adjustMobileSizes();
        initSVGInteractivity();
      }, 0);

      const zones = floor.zonesLoader();

      zones.forEach(zone => {
        zone.floorId = floorId;
        zone.floorName = floor.name;
      });

      initSVGInteractivity();

      if (!currentSearchResults || keepSearchResults) {
        if (zones.length > 0) {
          highlightZones(zones);
          if (!keepSearchResults) {
            renderFloorZonesInSidebar(zones, floor.name);
          }
        }
      } else {
        highlightZones(zones);
      }
      resetPosition();

    } catch (error) {
        console.error(`Ошибка загрузки ${floor.name}:`, error);
        svgContainer.innerHTML = `<div class="error">Ошибка загрузки ${floor.name}</div>`;
      }
  }

  function adjustMobileSizes() {
    console.log('Вызов adjustMobileSizes', {
      container: document.getElementById('svg-map-container').getBoundingClientRect(),
      svg: document.querySelector('#svg-map svg')?.getBBox()
    });
    
    const mapContainer = document.getElementById('svg-map-container');
    const svgMap = document.getElementById('svg-map');
    
    if (window.innerWidth <= 991) {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight - 80;
      const svg = svgMap.querySelector('svg');
      
      if (!svg) return;
      
      const svgWidth = svg.width.baseVal.value || svg.getBBox().width;
      const svgHeight = svg.height.baseVal.value || svg.getBBox().height;
      
      svgMap.style.minWidth = `${svgWidth}px`;
      svgMap.style.minHeight = `${svgHeight}px`;
      
      mapContainer.scrollLeft = (svgWidth - viewportWidth) / 2;
      mapContainer.scrollTop = (svgHeight - viewportHeight) / 2;
    }
  }

  document.querySelectorAll('.dropdown-item[data-floor]').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const floorId = e.currentTarget.getAttribute('data-floor');
      console.log('Выбран этаж:', floorId);
      loadFloor(floorId);
    });
  });

  function renderFloorZonesInSidebar(zones) {
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
        if (activeZoneId === zone.id) {
          clearHighlights();
          highlightZones(zones);
          activeZoneId = null;
        } else {
          clearHighlights();
          highlightZones([zone]);
          scrollToZone(zone.id);
          showTooltipForZone(zone.id);
        }
      });
      
      sidebar.appendChild(item);
    });
  }

  function clearHighlights() {
    const tooltips = svgContainer.querySelectorAll('.svg-tooltip');
    tooltips.forEach(tooltip => tooltip.remove());

    const highlighted = svgContainer.querySelectorAll('.zone-highlight');
    highlighted.forEach(el => {
      el.classList.remove('zone-highlight');
      el.style.fill = '';
      el.style.strokeWidth = '';
      el.style.stroke = '';
    });
    
    activeZoneId = null;
  }

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
 
  function highlightZones(zones) {
    if (!Array.isArray(zones)) zones = [zones];
    const svgElement = svgContainer.querySelector('svg');
    if (!svgElement) return;
  
    clearHighlights();
    
    zones.forEach(zone => {
      const element = svgElement.querySelector(`#${CSS.escape(zone.id)}`) || 
                      svgElement.querySelector(`[data-id="${zone.id}"]`);

      if (element) {
        element.setAttribute('data-zone', zone.id);
        element.classList.add('zone-highlight');
        if (zone.color) element.style.fill = zone.color;
        addTooltip(element, zone, svgElement);
      }
    });
  }

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
        
        if (window.innerWidth <= 991 && sidebar && !sidebar.classList.contains('open')) {
          sidebar.classList.add('open');
        }
      } else {
        currentSearchResults = null;
        const zones = floors[currentFloorId].zonesLoader();
        renderFloorZonesInSidebar(zones, floors[currentFloorId].name);
      }
    });
  }

  function addTooltip(element, zone, svg) {
    // Создаём группу <g> внутри SVG для самой подсказки
    const tooltip = document.createElementNS("http://www.w3.org/2000/svg", "g");
    tooltip.classList.add('svg-tooltip'); // Класс для стилизации
    tooltip.setAttribute('data-zone', zone.id); // Атрибут для идентификации по ID зоны
    tooltip.style.display = 'none'; // Сначала скрываем tooltip
    
    // Прямоугольник-фон под текст
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute('rx', '5'); // Скругление углов
    rect.setAttribute('ry', '5');
    rect.setAttribute('fill', 'rgba(0,0,0,0.85)'); // Полупрозрачный тёмный фон
    
    // Заголовок подсказки (название зоны)
    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute('fill', 'white'); // Белый цвет текста
    label.setAttribute('font-size', '14'); // Размер шрифта
    label.setAttribute('font-family', 'Arial, sans-serif'); // Шрифт
    label.textContent = zone.label; // Текст из поля `label` объекта `zone`
    
    tooltip.append(rect, label); // Добавляем фон и заголовок в группу
    
    // Если в зоне есть доп. информация — добавим вторую строку
    if (zone.info) {
      const info = document.createElementNS("http://www.w3.org/2000/svg", "text");
      info.setAttribute('fill', 'white');
      info.setAttribute('font-size', '12'); // Меньше размер
      info.setAttribute('font-family', 'Arial, sans-serif');
      info.setAttribute('dy', '15'); // Смещение по Y (чтобы было под заголовком)
      info.textContent = zone.info; // Текст из поля `info`
      tooltip.appendChild(info); // Добавляем в группу
    }
    
    svg.appendChild(tooltip); // Вставляем подсказку в SVG-карту

    // Внутренняя функция для позиционирования подсказки рядом с зоной
    function updateTooltipPosition() {
      const bbox = element.getBBox(); // Получаем координаты зоны
      const tooltipX = bbox.x + bbox.width + 10; // Смещаем подсказку правее от зоны
      const tooltipY = bbox.y; // На одном уровне по вертикали
      
      // Устанавливаем координаты текста заголовка
      label.setAttribute('x', tooltipX);
      label.setAttribute('y', tooltipY + 15);
      
      // Если есть дополнительный текст — размещаем его ниже
      if (zone.info) {
        const infoElement = tooltip.querySelector('text:nth-child(3)');
        infoElement.setAttribute('x', tooltipX);
        infoElement.setAttribute('y', tooltipY + 30);
      }
      
      const tooltipBBox = tooltip.getBBox(); // Определяем размер и положение всей группы подсказок
      
      // Подгоняем фон под содержимое с отступами
      rect.setAttribute('x', tooltipBBox.x - 5);
      rect.setAttribute('y', tooltipBBox.y - 5);
      rect.setAttribute('width', tooltipBBox.width + 10);
      rect.setAttribute('height', tooltipBBox.height + 10);
    }

    // Показываем подсказку при наведении мыши, если зона не активная
    element.addEventListener('mouseenter', () => {
      if (activeZoneId !== zone.id) {
        updateTooltipPosition(); // Обновляем позицию
        tooltip.style.display = 'block'; // Показываем
      }
    });

    // Скрываем подсказку при уходе мышки, если зона не активная
    element.addEventListener('mouseleave', () => {
      if (activeZoneId !== zone.id) {
        tooltip.style.display = 'none';
      }
    });

    // При клике по зоне — делаем её активной (или снимаем активность)
    element.addEventListener('click', (e) => {
      e.stopPropagation(); // Чтобы клик не передавался на внешний контейнер карты. 
                          // если такого нет, то подсказка появляется и тут же исчезает потому что внешний обработчик тоже срабатывает

      // Если кликнули по уже активной зоне — деактивируем её
      if (activeZoneId === zone.id) {
        tooltip.style.display = 'none';
        activeZoneId = null;

        // Перерисовываем все зоны текущего этажа в сайдбаре
        const zones = floors[currentFloorId].zonesLoader();
        renderFloorZonesInSidebar(zones, floors[currentFloorId].name);
      } else { // Если была другая активная зона — убираем её подсказку
        if (activeZoneId) {
          const prevTooltip = svgContainer.querySelector(`.svg-tooltip[data-zone="${activeZoneId}"]`);
          if (prevTooltip) prevTooltip.style.display = 'none';
        }

        // Показываем подсказку новой зоны
        updateTooltipPosition();
        tooltip.style.display = 'block';
        activeZoneId = zone.id; // Запоминаем активную зону
        renderSearchResultsInSidebar([zone]); // Отображаем информацию по выбранной зоне в сайдбаре
      }
    });
  }

  // Отображаем результаты поиска по зонам в сайдбаре
  function renderSearchResultsInSidebar(results) {
    // Получаем контейнер для вывода зон в сайдбаре
    const sidebar = document.getElementById('zoneListContainer');
    // если не найден — выходим
    if (!sidebar) return;
    
    currentSearchResults = results; // Сохраняем текущие результаты
    sidebar.innerHTML = ''; // Очищаем сайдбар перед добавлением новых элементов
    
    // Если результатов нет — пишем "ничего не найдено" и выходим
    if (results.length === 0) {
      sidebar.innerHTML = '<div class="p-2 text-muted">Ничего не найдено</div>';
      return;
    }
    
    // Группируем зоны по этажам
    const groupedByFloor = results.reduce((acc, zone) => {

      // Если этаж ещё не добавлен — создаём его
      if (!acc[zone.floorId]) {
        acc[zone.floorId] = {
          floorName: zone.floorName, // название этажа
          zones: [] // массив зон на этом этаже
        };
      }

      // Добавляем зону к соответствующему этажу
      acc[zone.floorId].zones.push(zone);
      return acc;
    }, {});
    
    // Перебираем этажи (отсортированные по номеру, чтобы был правильный порядок)
    Object.keys(groupedByFloor)
      .sort((a, b) => parseInt(a.replace('floor', '')) - parseInt(b.replace('floor', '')))
      .forEach(floorId => {
        const floorData = groupedByFloor[floorId];

        // Создаём заголовок этажа
        const floorHeader = document.createElement('div');
        floorHeader.classList.add('p-2', 'font-bold', 'bg-gray-100');
        floorHeader.textContent = floorData.floorName;
        sidebar.appendChild(floorHeader);
        
        // Перебираем зоны этого этажа
        floorData.zones.forEach(zone => {
          // Создаём элемент для зоны
          const item = document.createElement('div');
          item.classList.add('zone-item', 'p-2', 'border-bottom', 'cursor-pointer');
          item.setAttribute('data-zone', zone.id);
          
          // Вставляем в зону текстовую разметку: название + доп. информация
          item.innerHTML = `
            <div class="font-bold">${zone.label}</div>
            ${zone.info ? `<div class="text-sm text-muted">${zone.info}</div>` : ''}
            ${zone.add_info ? `<div class="text-sm text-muted">${zone.add_info}</div>` : ''}
          `;
          
          // При клике на зону — загружаем нужный этаж и выделяем зону
          item.addEventListener('click', () => {
            loadFloor(zone.floorId, true).then(() => {
              // Получаем список зон на этом этаже
              const zones = floors[zone.floorId].zonesLoader();
              // Ищем нужную зону по её id
              const targetZone = zones.find(z => z.id === zone.id);
              
              if (targetZone) {
                // Если эта зона уже активна — убираем выделение и показываем все зоны
                if (activeZoneId === targetZone.id) {
                  clearHighlights(); // убрать подсветку
                  highlightZones(zones); // показать все зоны
                  activeZoneId = null; // сбрасываем активную зону
                } else {
                  // Иначе — выделяем нужную зону
                  clearHighlights();
                  highlightZones([targetZone]); // подсвечиваем только её
                  scrollToZone(targetZone.id); // скроллим карту до зоны
                  showTooltipForZone(targetZone.id); // показываем всплывающую подсказку
                }
              }
            });
          });
          // Добавляем зону в сайдбар
          sidebar.appendChild(item);
        });
      });
  }

  function showTooltipForZone(zoneId) {
    // Ищем tooltip в контейнере SVG по селектору:
    // с классом .svg-tooltip и data-zone="zoneId"
    const tooltip = svgContainer.querySelector(`.svg-tooltip[data-zone="${zoneId}"]`);
    if (tooltip) {
      // Если нашли — показываем его
      tooltip.style.display = 'block';
      // Сохраняем, что эта зона теперь активная
      activeZoneId = zoneId;
    }
  }

  // Инициализация всей интерактивности с SVG
  function initSVGInteractivity() {
    let initialScale = 1; // начальный масштаб
    let initialDistance = null; // начальное расстояние между двумя пальцами
    const sensitivity = 0.5; // чувствительность масштабирования

    // === ПИНЧ-ЗУМ (масштабирование двумя пальцами) ===
    svgContainer.addEventListener('touchstart', (e) => {
      // Проверяем, что одновременно коснулись двумя пальцами (пинч-жест)
      if (e.touches.length === 2) {
        e.preventDefault(); // Отменяем стандартное поведение (например, прокрутку страницы)
        const touch1 = e.touches[0]; // Сохраняем координаты первого пальца
        const touch2 = e.touches[1]; // Сохраняем координаты второго пальца

        // Считаем расстояние между двумя пальцами
        initialDistance = Math.hypot(
            touch2.clientX - touch1.clientX, // разница по горизонтали
            touch2.clientY - touch1.clientY // разница по вертикали
        );
        // Получаем текущий масштаб
        initialScale = parseFloat(svgContainer.style.transform?.replace('scale(', '') || 1);
      }
    });

    // Обработчик движения пальцев по экрану (для масштабирования)
    svgContainer.addEventListener('touchmove', (e) => {
      // Проверяем, что используется два пальца (пинч-жест)
      if (e.touches.length === 2) {
        e.preventDefault(); // Отменяем стандартное поведение (например, прокрутку страницы)
        const touch1 = e.touches[0]; // Получаем координаты первого пальца
        const touch2 = e.touches[1]; // Получаем координаты второго пальца

        // Считаем новое расстояние между пальцами
        const currentDistance = Math.hypot(
          touch2.clientX - touch1.clientX, // разница по оси X
          touch2.clientY - touch1.clientY // разница по оси Y
        );

        // Если есть начальное расстояние (установлено в touchstart)
        if (initialDistance) {
          // Вычисляем коэффициент масштабирования:
          // отношение нового расстояния к начальному, отклонение от 1,
          // умноженное на чувствительность и плюс 1 — это итоговое изменение масштаба
          const scale = (currentDistance / initialDistance - 1) * sensitivity + 1;
          // Умножаем начальный масштаб на коэффициент и ограничиваем от 0.5 до 6
          const newScale = Math.max(0.5, Math.min(initialScale * scale, 6)); 

          // Центр между пальцами
          const rect = svgContainer.getBoundingClientRect(); // размеры и позиция контейнера на экране
          const centerX = (touch1.clientX + touch2.clientX)/2 - rect.left;
          const centerY = (touch1.clientY + touch2.clientY)/2 - rect.top;
          
          // Корректируем прокрутку, чтобы масштабирование происходило от центра
          const scrollLeft = (centerX + svgContainer.scrollLeft) * (newScale / initialScale) - centerX;
          const scrollTop = (centerY + svgContainer.scrollTop) * (newScale / initialScale) - centerY;
          
          // Применяем масштаб
          svgContainer.style.transform = `scale(${newScale})`;

          // Прокручиваем контейнер так, чтобы центр оставался на месте
          svgContainer.scrollTo(scrollLeft, scrollTop);
        }
      }
    });

    // Обработка завершения касания (например, когда пользователь отпустил пальцы)
    svgContainer.addEventListener('touchend', () => {
      // Обновляем масштаб, чтобы следующий жест начинался с актуального значения
      initialScale = parseFloat(svgContainer.style.transform?.replace('scale(', '') || 1);
      // Сбрасываем расстояние между пальцами, чтобы не мешало следующему пинчу
      initialDistance = null;
    });

    // === ПЕРЕТАСКИВАНИЕ МЫШКОЙ ===
    const svgElement = svgContainer.querySelector('svg'); // Получаем SVG-элемент внутри контейнера
    if (!svgElement) return; // Если SVG не найден — выходим из скрипта

    let isDragging = false; // Флаг, указывающий, началось ли перетаскивание
    let startX, startY; // Начальные координаты курсора при начале перетаскивания

    // Обработка нажатия кнопки мыши на svgContainer
    svgContainer.addEventListener('mousedown', (e) => {
      // Разрешаем перетаскивание только при клике по элементам SVG
      if (['svg', 'path', 'polygon', 'rect', 'circle'].includes(e.target.tagName.toLowerCase())) {
        isDragging = true; // Включаем режим перетаскивания

        // Запоминаем начальное положение курсора с учётом отступа контейнера
        startX = e.clientX - svgContainer.offsetLeft;
        startY = e.clientY - svgContainer.offsetTop;

        // Меняем курсор на "перетаскивание"
        svgContainer.style.cursor = 'grabbing';
      }
    });

    // Обработка отпускания кнопки мыши — завершение перетаскивания
    document.addEventListener('mouseup', () => {
      isDragging = false; // Отключаем режим перетаскивания
      svgContainer.style.cursor = 'grab'; // Возвращаем курсор обратно
    });

    // Обработка движения мыши — если включён режим перетаскивания
    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        // Изменяем положение svgContainer при движении мышки
        svgContainer.style.left = (e.clientX - startX) + 'px';
        svgContainer.style.top = (e.clientY - startY) + 'px';
      }
    });

    // === МАСШТАБИРОВАНИЕ КОЛЕСИКОМ МЫШИ ===

    // Добавляем обработчик события прокрутки колесиком мыши
    svgContainer.addEventListener('wheel', (e) => {
      // Отменяем стандартное поведение (например, прокрутку страницы)
      e.preventDefault();

      // Получаем координаты контейнера относительно окна
      const rect = svgContainer.getBoundingClientRect();

      // Вычисляем положение курсора относительно контейнера
      const offsetX = e.clientX - rect.left;
      const offsetY = e.clientY - rect.top;
      
      // Определяем направление прокрутки: если вниз — уменьшаем масштаб, если вверх — увеличиваем
      const scaleDelta = e.deltaY > 0 ? 0.9 : 1.1;

      // Получаем текущий масштаб из стиля transform (если нет — по умолчанию 1)
      const currentScale = parseFloat(svgContainer.style.transform?.replace('scale(', '') || 1);

      // Вычисляем новый масштаб с ограничением от 0.5 до 6
      const newScale = Math.max(0.5, Math.min(currentScale * scaleDelta, 6));
      
      // Вычисляем прокрутку, чтобы масштабирование происходило относительно курсора
      const scrollLeft = (offsetX + svgContainer.scrollLeft) * (newScale / currentScale) - offsetX;
      const scrollTop = (offsetY + svgContainer.scrollTop) * (newScale / currentScale) - offsetY;
      
      // Применяем новый масштаб
      svgContainer.style.transform = `scale(${newScale})`;

      // Прокручиваем контейнер так, чтобы фокус масштабирования остался под курсором
      svgContainer.scrollTo(scrollLeft, scrollTop);
    });

    // === ОБРАБОТКА КЛИКА ПО ФОНУ SVG (не по зоне, не по сайдбару) ===

    // Объявляем функцию, которая будет вызываться при клике по документу
    const handleDocumentClick = (e) => {
      // Проверяем, кликнули ли по зоне или её элементам (например, подсветке или подсказке)
      const isZoneElement = e.target.closest('[data-zone], .zone-highlight, .svg-tooltip');

      // Проверяем, кликнули ли внутри SVG-контейнера
      const isInsideSVG = svgContainer.contains(e.target);

      // Проверяем, попал ли клик в сайдбар или кнопку его открытия
      const isSidebar = e.target.closest('#zoneListContainer, .sidebar-toggle');
    
      // Если клик был внутри SVG, но не по зоне и не по сайдбару:
      if (!isZoneElement && isInsideSVG && !isSidebar) {
      // Загружаем зоны текущего этажа
        const currentZones = floors[currentFloorId].zonesLoader();
        clearHighlights(); // Убираем все подсветки
        highlightZones(currentZones); // Подсвечиваем все зоны
        document.querySelectorAll('.svg-tooltip').forEach(t => t.style.display = 'none'); // Прячем все подсказки
        renderFloorZonesInSidebar(currentZones, floors[currentFloorId].name); // Обновляем список зон в сайдбаре
        
        // Очищаем поле поиска и результаты поиска
        if (searchInput) {
          searchInput.value = '';
          currentSearchResults = null;
        }
      }
    };
    
    // Вешаем обработчик клика по всему документу
    document.addEventListener('click', handleDocumentClick); 
  }

  // Функция для сброса позиции и масштаба карты
  function resetPosition() {
    svgContainer.style.left = '0'; // Сбрасываем горизонтальное смещение карты
    svgContainer.style.top = '0'; // Сбрасываем вертикальное смещение карты
    svgContainer.style.transform = 'scale(1)'; // Сбрасываем масштаб к 1 (без увеличения/уменьшения)
  }

  // Находим кнопку "домой" по ID
  const btnHome = document.getElementById('btnHome');

  // Если кнопка найдена — добавляем обработчик клика
  if (btnHome) {
    btnHome.addEventListener('click', () => {
      searchInput.value = ''; // Очищаем поле поиска
      currentSearchResults = null; // Сбрасываем текущие результаты поиска
      clearHighlights(); // Удаляем все подсветки на карте
      loadFloor('floor1'); // Загружаем первый этаж (домашний по умолчанию)
    });
  }

  // При изменении размера окна вызываем адаптацию под мобильные размеры
  window.addEventListener('resize', () => {
    adjustMobileSizes();
  });

  // При смене ориентации (горизонтальная ↔ вертикальная) — немного откладываем адаптацию
  window.addEventListener('orientationchange', () => {
    setTimeout(adjustMobileSizes, 300); // Небольшая задержка, чтобы ориентация точно изменилась
  });

  loadFloor('floor1'); // Загружаем первый этаж сразу при загрузке
});