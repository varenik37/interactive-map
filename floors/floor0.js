(function() {
  window.zonesFloor0 = [
    {
      id: "st",
      label: "Лестница",
      color: "#E0FFFF",
      info: "",
      add_info: ""
    },
    {
      id: "st_2",
      label: "Лестница",
      color: "#E0FFFF",
      info: "",
      add_info: ""
    },
    {
      id: "dress",
      label: "Гардероб",
      color: "#F6CAB7",
      info: "",
      add_info: ""
    },
    {
      id: "dress_2",
      label: "Гардероб",
      color: "#F6CAB7",
      info: "",
      add_info: ""
    },
    {
      id: "el_2",
      label: "Лифт",
      color: "#B2B0dDF",
      info: "",
      add_info: ""
    },
    {
      id: "el_3",
      label: "Лифт",
      color: "#B2B0dDF",
      info: "",
      add_info: ""
    },
  ];
  
  console.log('Данные для 0 этажа загружены');
})();
/*
function initfloor0(container) {
  fetch("/components/svg/0floor.svg")
    .then(response => response.text())
    .then(svgText => {
      container.innerHTML = svgText;
      const svg = container.querySelector("svg");
      if (!svg) return;

      // Установим номер этажа (0 для первого этажа)
      const floorNumber = 0;

      window.zonesWithTooltips = createCompleteZones(svg, floorNumber);
      window["zonesFloor" + floorNumber] = window.zonesWithTooltips;
      // Привязываем DOM-элементы к зонам
      window.zonesWithTooltips.forEach(zone => {
        zone.element = getSvgElement(svg, zone.id);
      });

      initAllZones(svg, floorNumber);

      if (typeof renderZoneList === "function") {
        renderZoneList(floorNumber); // Рендерим список зон для этого этажа
      }
    })
    .catch(console.error);
}

function createCompleteZones(svg, floorNumber) {
  const baseZones = [
    // Можно добавить базовые зоны для конкретного этажа
  ];

  const dynamicZones = [
    { prefix: "el", label: "Лифт", color: "#b2b0df" },
    { prefix: "st", label: "Лестница", color: "#E0FFFF" },
    { prefix: "dress", label: "Гардероб", color: "#f6cab7" }
  ];

  const audElements = Array.from(svg.querySelectorAll('[id^="0"]'))
    .filter(el => !el.id.includes("check") && el.id !== "0floor");

  const audZones = audElements.map(el => ({
    id: el.id,
    label: el.id,
    color: "#D3D3D3",
    info: "",
    add_info: "",
    floorNumber: floorNumber // Указываем номер этажа
  }));

  const allZones = [...baseZones];

  // Добавляем динамические зоны
  dynamicZones.forEach(({ prefix, label, color }) => {
    const elements = findElementsByPrefix(svg, prefix);
    elements.forEach(el => {
      allZones.push({
        id: el.id,
        label: label,
        color: color,
        info: "",
        add_info: "",
        floorNumber: floorNumber // Указываем этаж явно
      });
    });
  });

  // Добавляем зоны для аудиторий
  audZones.forEach(({ id, label, color, floorNumber }) => {
    allZones.push({
      id: id,
      label: label,
      color: "#D3D3D3", // Цвет зоны
      info: "",
      add_info: "",
      floorNumber: floorNumber // Указываем этаж
    });
  });

  return allZones;
}

function findElementsByPrefix(svg, prefix) {
  const elements = [];

  const candidates = svg.querySelectorAll('[id]');
  candidates.forEach(el => {
    if (el.id.startsWith(prefix) || 
        el.id.includes(prefix) || 
        el.id.replace(/\W/g, '').startsWith(prefix)) {
      elements.push(el);
    }
  });
  
  return elements;
}

function initAllZones(svg, floorNumber) {
  window.zonesWithTooltips.forEach(({ id, label, color, floorNumber }) => {
    const element = getSvgElement(svg, id);
    if (element) {
      element.style.fill = color;
      element.style.cursor = "pointer";
      element.setAttribute('data-zone-id', id);
      element.setAttribute('data-floor-number', floorNumber); // добавляем этаж
      addTooltipToSvgElement(element, label, svg);
    }
  });
}

// Надежный поиск элемента по ID
function getSvgElement(svg, id) {
  const selectors = [
    `#${CSS.escape(id)}`,
    `[id="${CSS.escape(id)}"]`,
    `[id*="${id}"]`
  ];

  if (/^\d/.test(id)) {
    const escapedId = '\\' + id; // экранируем цифры
    selectors.push(`#${escapedId}`);
  }

  for (const selector of selectors) {
    const element = svg.querySelector(selector);
    if (element) return element;
  }

  const allElements = svg.querySelectorAll('[id]');
  for (const el of allElements) {
    if (el.id === id) return el;
  }

  console.warn(`Элемент с ID "${id}" не найден`);
  return null;
}

// Функция для отображения всех зон в сайдбаре
function renderZoneList(floorNumber) {
  const zoneListContainer = document.getElementById("zone-list");
  zoneListContainer.innerHTML = '';

  window.zonesWithTooltips.forEach(zone => {
    if (zone.floorNumber === floorNumber) {  // Отображаем только для нужного этажа
      const zoneElement = document.createElement("div");
      zoneElement.classList.add("zone-item");
      zoneElement.textContent = `Этаж ${zone.floorNumber}: ${zone.label}`;
      zoneListContainer.appendChild(zoneElement);
    }
  });
}

window.initfloor0 = initfloor0;

/* Рабочий код без общего массива
function initfloor0(container) {
  fetch("/components/svg/0floor.svg")
    .then(response => response.text())
    .then(svgText => {
      container.innerHTML = svgText;
      const svg = container.querySelector("svg");
      if (!svg) return;

      // Установим номер этажа (0 для первого этажа)
      const floorNumber = 0;

      window.zonesWithTooltips = createCompleteZones(svg, floorNumber);
      // Привязываем DOM-элементы к зонам
      window.zonesWithTooltips.forEach(zone => {
        zone.element = getSvgElement(svg, zone.id);
      });

      initAllZones(svg, floorNumber);

      if (typeof renderZoneList === "function") {
        renderZoneList(floorNumber); // Рендерим список зон для этого этажа
      }
    })
    .catch(console.error);
}

function createCompleteZones(svg, floorNumber) {
  const baseZones = [
    // Можно добавить базовые зоны для конкретного этажа
  ];

  const dynamicZones = [
    { prefix: "el", label: "Лифт", color: "#b2b0df" },
    { prefix: "st", label: "Лестница", color: "#E0FFFF" },
    { prefix: "dress", label: "Гардероб", color: "#f6cab7" }
  ];

  const audElements = Array.from(svg.querySelectorAll('[id^="0"]'))
    .filter(el => !el.id.includes("check") && el.id !== "0floor");

  const audZones = audElements.map(el => ({
    id: el.id,
    label: el.id,
    color: "#D3D3D3",
    info: "",
    add_info: "",
    floorNumber: floorNumber // Указываем номер этажа
  }));

  const allZones = [...baseZones];

  // Добавляем динамические зоны
  dynamicZones.forEach(({ prefix, label, color }) => {
    const elements = findElementsByPrefix(svg, prefix);
    elements.forEach(el => {
      allZones.push({
        id: el.id,
        label: label,
        color: color,
        info: "",
        add_info: "",
        floorNumber: floorNumber // Указываем этаж явно
      });
    });
  });

  // Добавляем зоны для аудиторий
  audZones.forEach(({ id, label, color, floorNumber }) => {
    allZones.push({
      id: id,
      label: label,
      color: "#D3D3D3", // Цвет зоны
      info: "",
      add_info: "",
      floorNumber: floorNumber // Указываем этаж
    });
  });

  return allZones;
}

function findElementsByPrefix(svg, prefix) {
  const elements = [];

  const candidates = svg.querySelectorAll('[id]');
  candidates.forEach(el => {
    if (el.id.startsWith(prefix) || 
        el.id.includes(prefix) || 
        el.id.replace(/\W/g, '').startsWith(prefix)) {
      elements.push(el);
    }
  });
  
  return elements;
}

function initAllZones(svg, floorNumber) {
  window.zonesWithTooltips.forEach(({ id, label, color, floorNumber }) => {
    const element = getSvgElement(svg, id);
    if (element) {
      element.style.fill = color;
      element.style.cursor = "pointer";
      element.setAttribute('data-zone-id', id);
      element.setAttribute('data-floor-number', floorNumber); // добавляем этаж
      addTooltipToSvgElement(element, label, svg);
    }
  });
}

// Надежный поиск элемента по ID
function getSvgElement(svg, id) {
  const selectors = [
    `#${CSS.escape(id)}`,
    `[id="${CSS.escape(id)}"]`,
    `[id*="${id}"]`
  ];

  if (/^\d/.test(id)) {
    const escapedId = '\\' + id; // экранируем цифры
    selectors.push(`#${escapedId}`);
  }

  for (const selector of selectors) {
    const element = svg.querySelector(selector);
    if (element) return element;
  }

  const allElements = svg.querySelectorAll('[id]');
  for (const el of allElements) {
    if (el.id === id) return el;
  }

  console.warn(`Элемент с ID "${id}" не найден`);
  return null;
}

// Функция для отображения всех зон в сайдбаре
function renderZoneList(floorNumber) {
  const zoneListContainer = document.getElementById("zone-list");
  zoneListContainer.innerHTML = '';

  window.zonesWithTooltips.forEach(zone => {
    if (zone.floorNumber === floorNumber) {  // Отображаем только для нужного этажа
      const zoneElement = document.createElement("div");
      zoneElement.classList.add("zone-item");
      zoneElement.textContent = `Этаж ${zone.floorNumber}: ${zone.label}`;
      zoneListContainer.appendChild(zoneElement);
    }
  });
}

window.initfloor0 = initfloor0;
*/