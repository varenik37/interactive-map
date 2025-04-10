function initfloor2(container) {
  fetch("/components/svg/2floor.svg")
    .then(response => response.text())
    .then(svgText => {
      container.innerHTML = svgText;
      const svg = container.querySelector("svg");
      if (!svg) return;

      window.zonesWithTooltips = createCompleteZones(svg);
      initAllZones(svg);
      
      if (typeof renderZoneList === "function") {
        renderZoneList();
      }
    })
    .catch(console.error);
}

function createCompleteZones(svg) {
  const baseZones = [
    {
      id: "sport",
      label: "Спортивный зал",
      color: "#87CEFA",
      info: "",
      add_info: ""
    },
    {
      id: "221(1)_check",
      label: "221(1)",
      color: "#FF6347",
      info: "Кафедра медицины",
      add_info: ""
    },
    {
      id: "act",
      label: "Актовый зал",
      color: "#ffe9ed",
      info: "",
      add_info: ""
    },
    {
      id: "lib",
      label: "Библиотека",
      color: "#FAEBD7",
      info: "",
      add_info: ""
    },
    {
      id: "check",
      label: "Лестница",
      color: "#E0FFFF",
      info: "",
      add_info: "1 пролёт вниз - Пожарная часть и Музей МПГУ"
    }
  ];

  const dynamicZones = [
    { prefix: "cf", label: "Столовая", color: "#ffff00" },
    { prefix: "tW", label: "Женский туалет", color: "#98FB98" },
    { prefix: "tM", label: "Мужской туалет", color: "#98FB98" },
    { prefix: "el", label: "Лифт", color: "#b2b0df" },
    { prefix: "st", label: "Лестница", color: "#E0FFFF" }
  ];


  const audElements = Array.from(svg.querySelectorAll('[id^="2"]'))
  .filter(el => !el.id.includes("check") && el.id !== "2floor");

  const audZones = audElements.map(el => ({
    id: el.id,
    label: el.id,
    color: "#D3D3D3", 
    info: "",
    add_info: ""
  }));


  const allZones = [...baseZones];


  dynamicZones.forEach(({ prefix, label, color }) => {
    const elements = findElementsByPrefix(svg, prefix);
    elements.forEach(el => {
      allZones.push({
        id: el.id,
        label: label,
        color: color,
        info: "",
        add_info: ""
      });
    });
  });

  // Добавляем зоны с ID на "2"
  audZones.forEach(({ id, label, color }) => {
    allZones.push({
      id: id,
      label: label,
      color: "#D3D3D3",
      info: "",
      add_info: ""
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


function initAllZones(svg) {
  window.zonesWithTooltips.forEach(({ id, label, color }) => {
    const element = getSvgElement(svg, id);
    if (element) {
      element.style.fill = color;
      element.style.cursor = "pointer";
      element.setAttribute('data-zone-id', id);
      addTooltipToSvgElement(element, label, svg);
    }
  });
}

// Надежный поиск элемента по ID
function getSvgElement(svg, id) {
  // Пробуем разные методы поиска
  const selectors = [
    `#${CSS.escape(id)}`,       // Стандартный CSS-селектор
    `[id="${CSS.escape(id)}"]`, // По точному совпадению
    `[id*="${id}"]`             // Содержащий ID
  ];

  // Для ID, начинающихся с цифры, можно использовать специальное экранирование
  if (/^\d/.test(id)) {
    const escapedId = '\\' + id; // экранируем цифры
    selectors.push(`#${escapedId}`);
  }

  for (const selector of selectors) {
    const element = svg.querySelector(selector);
    if (element) return element;
  }

  // Если не нашли - перебираем все элементы
  const allElements = svg.querySelectorAll('[id]');
  for (const el of allElements) {
    if (el.id === id) return el;
  }

  console.warn(`Элемент с ID "${id}" не найден`);
  return null;
}

window.initfloor2 = initfloor2;
