function initfloor4(container) {
  fetch("/components/svg/4floor.svg")
    .then(response => response.text())
    .then(svgText => {
      container.innerHTML = svgText;
      const svg = container.querySelector("svg");
      if (!svg) return;

      // Установим номер этажа (0 для первого этажа)
      const floorNumber = 4;      


      window.zonesWithTooltips = createCompleteZones(svg);
      window["zonesFloor" + floorNumber] = window.zonesWithTooltips;

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
      id: "420_check",
      label: "420",
      color: "#FF6347",
      info: "Кафедра исследовательской и творческой деятельности в начальной школе",
      add_info: ""
    },
    {
      id: "408_check",
      label: "408",
      color: "#FF6347",
      info: "Кафедра русского языка и методики его преподавания в начальной школе",
      add_info: "Кафедра начального филологического образования им. М. Р. Львова"
    },
    {
      id: "409_check",
      label: "409",
      color: "#FF6347",
      info: "Кафедра теории и практики начального образования",
      add_info: ""
    },
    {
      id: "410_check",
      label: "410",
      color: "#FF6347",
      info: "Кафедра математики и информатики в начальной школе",
      add_info: ""
    },
    {
      id: "405_check",
      label: "405",
      color: "#FF6347",
      info: "Заместитель декана факультета начального образования Института детства",
      add_info: ""
    },
    {
      id: "403_check",
      label: "403",
      color: "#FF6347",
      info: "Деканат факультета начального образования Института детства",
      add_info: ""
    },
    {
      id: "429_check",
      label: "429",
      color: "#FF6347",
      info: "Центр психолого-педагогического сопровождения студентов с ОВЗ",
      add_info: ""
    },
    {
      id: "436_check",
      label: "436",
      color: "#FF6347",
      info: "Кафедра психологии младшего школьника",
      add_info: ""
    },
    {
      id: "450_check",
      label: "450",
      color: "#FF6347",
      info: "Проректор по учебной работе, помощник проректора по учебной работе",
      add_info: ""
    },
    {
      id: "448_check",
      label: "448",
      color: "#000000",
      info: "Ректорат",
      add_info: ""
    },
    {
      id: "457_check",
      label: "457",
      color: "#FF6347",
      info: "Отдел качества образования учебно-методического управления",
      add_info: "Начальник отдела Бирюкова Елена Александровна<br>Ведущие специалисты по учебно-методической работе:<br>Длугач Надежда Николаевна<br>Рубцова Наталья Алексеевна<br>Румянцева Полина Александровна<br>Хоптинская Анна Александровна<br>График работы:<br>пн-чт 09:30 - 18:15,<br>пт 09:30 - 17:00<br>Перерыв 13:15 - 13:45"
    },
    {
      id: "456_check",
      label: "456",
      color: "#FF6347",
      info: "Отдел планирования и организации образовательного процесса учебно-методического управления",
      add_info: ""
    },
    {
      id: "454_check",
      label: "454",
      color: "#FF6347",
      info: "Учебно-методическое управление",
      add_info: "Начальник<br>Балабаева Екатерина Александровна<br>Заместитель начальника<br>Акимова Алла Ивановна<br>График работы:<br>пн-чт 09:30 - 18:15,<br>пт 09:30 - 17:00<br>Перерыв 13:15 - 13:45"
    },
    {
      id: "check",
      label: "454а, 455",
      color: "#FF6347",
      info: "Приемная проректора по дополнительному образованию",
      add_info: ""
    },
  ];

  const dynamicZones = [
    { prefix: "cf", label: "Столовая", color: "#ffff00" },
    { prefix: "tW", label: "Женский туалет", color: "#98FB98" },
    { prefix: "tM", label: "Мужской туалет", color: "#98FB98" },
    { prefix: "tT", label: "Туалет для сотрудников", color: "#37aa63" },
    { prefix: "el", label: "Лифт", color: "#b2b0df" },
    { prefix: "st", label: "Лестница", color: "#E0FFFF" }
  ];

  // Новая часть: исключаем элементы, начинающиеся на "4", но не содержащие "check" или "4floor"
  const audElements = Array.from(svg.querySelectorAll('[id^="4"]'))
    .filter(el => !el.id.includes("check") && el.id !== "4floor");

  const audZones = audElements.map(el => ({
    id: el.id,
    label: el.id,
    color: "#D3D3D3", // серый цвет
    info: "",
    add_info: ""
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
        add_info: ""
      });
    });
  });

  // Добавляем зоны с ID на "4"
  audZones.forEach(({ id, label, color }) => {
    allZones.push({
      id: id,
      label: label,
      color: "#D3D3D3", // серый цвет
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
  const selectors = [
    `#${CSS.escape(id)}`,       // Стандартный CSS-селектор
    `[id="${CSS.escape(id)}"]`, // По точному совпадению
    `[id*="${id}"]`             // Содержащий ID
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

window.initfloor4 = initfloor4;
