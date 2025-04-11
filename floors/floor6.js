function initfloor6(container) {
  fetch("/components/svg/6floor.svg")
    .then(response => response.text())
    .then(svgText => {
      container.innerHTML = svgText;
      const svg = container.querySelector("svg");
      if (!svg) return;

      // Установим номер этажа (0 для первого этажа)
      const floorNumber = 6;      
      

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
      id: "631_check",
      label: "631",
      color: "#FF6347",
      info: "Институт иностранных языков",
      add_info: "Директор институра иностранных языков<br>Лазарева Елена Юрьевна<br>Заместитель директора института иностранных языков<br>Звягинцева Александра Вительевна"
    },
    {
      id: "617_check",
      label: "617",
      color: "#FF6347",
      info: "Кафедра немецкого языка",
      add_info: "Заведующий кафедрой немецкого языка<br>Нефедова Любовь Аркадьевна"
    },
    {
      id: "616_check",
      label: "616",
      color: "#FF6347",
      info: "Секция испанского языка",
      add_info: ""
    },
    {
      id: "614_check",
      label: "614",
      color: "#FF6347",
      info: "Кафедра восточных языков",
      add_info: "Заведующий кафедрой восточных языков<br>Сизова Александра Александровна<br>Исполняющий обязанности заведующего кафедрой<br>Анашина Мария Владимировна"
    },
    {
      id: "607_check",
      label: "607",
      color: "#FF6347",
      info: "Кафедра фонетики и лексики английского языка им. В.Д. Аракина",
      add_info: "Заведующий кафедрой фонетики и лексики английского языка<br>Никулина Елена Александровна"
    },
    {
      id: "609_check",
      label: "609",
      color: "#FF6347",
      info: "Кафедра фонетики и лексики английского языка им. В.Д. Аракина",
      add_info: "Заведующий кафедрой фонетики и лексики английского языка<br>Никулина Елена Александровна"
    },
    {
      id: "611_check",
      label: "611",
      color: "#FF6347",
      info: "Кафедра грамматики английского языка",
      add_info: "Заведующий кафедрой грамматики английского языка им. М.Я. Блоха<br>Сыресина Ирина Олеговна"
    },
    {
      id: "638_check",
      label: "638",
      color: "#FF6347",
      info: "Кафедра теории и практики перевода и коммуникации",
      add_info: "Заведующий кафедрой теории и практики перевода и коммуникации<br>Ковалева Елена Ивановна"
    },
    {
      id: "644_check",
      label: "644",
      color: "#FF6347",
      info: "Институт иностранных языков",
      add_info: "Заместитель директора по воспитательной работе<br>Галич Анастасия Максимовна<br>Часы приема:<br>Вт 10:00 - 17:00<br>Ср 10:00 - 12:40<br>Чт 14:20 - 18:00<br>Заместитель директора по приему и аспирантуре<br>Арсеньева Дарья Александровна<br>Часы приема:<br>Пн 10:00 - 12:40<br>Вт 10:00 - 16:00<br>Ср 10:00 - 16:45<br>Чт 10:00 - 18:00<br>Пт 10:00 - 12:00<br><b>Заочное отделение переехало в ауд. 751</b>"
    },
    {
      id: "646_check",
      label: "646",
      color: "#FF6347",
      info: "Подготовительные курсы",
      add_info: "<b>Подготовительные курсы переехали в 549 кабинет (Внутри приемной комиссии)</b>"
    },
    {
      id: "658_check",
      label: "658",
      color: "#FF6347",
      info: "",
      add_info: "График приема:<br>Вт 11:00 - 17:00<br>Ср 11:00 - 17:00<br>Сб 11:00 - 15:00<br>Телефоны для связи:<br>8-967-248-16-83 (Алёна)<br>8-903-010-70-84 (Карина)"
    },
    {
      id: "656_check",
      label: "656",
      color: "#FF6347",
      info: "Упрвление непрерывного дополнительного образования",
      add_info: "Отдел организации приема и экономического сопровождения"
    },
    {
      id: "649_check",
      label: "649",
      color: "#FF6347",
      info: "Деканат факультета регионоведения и этнокультурного образования",
      add_info: ""
    }
  ];

  const dynamicZones = [
    { prefix: "cf", label: "Столовая", color: "#ffff00" },
    { prefix: "tW", label: "Женский туалет", color: "#98FB98" },
    { prefix: "tM", label: "Мужской туалет", color: "#98FB98" },
    { prefix: "tT", label: "Туалет для сотрудников", color: "#37aa63" },
    { prefix: "el", label: "Лифт", color: "#b2b0df" },
    { prefix: "st", label: "Лестница", color: "#E0FFFF" }
  ];

  // Новая часть: исключаем элементы, начинающиеся на "6", но не содержащие "check" или "6floor"
  const audElements = Array.from(svg.querySelectorAll('[id^="6"]'))
    .filter(el => !el.id.includes("check") && el.id !== "6floor");

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

  // Добавляем зоны с ID на "6"
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

window.initfloor6 = initfloor6;
