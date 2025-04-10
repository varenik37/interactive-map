function initfloor7(container) {
  fetch("/components/svg/7floor.svg")
    .then(response => response.text())
    .then(svgText => {
      container.innerHTML = svgText;
      const svg = container.querySelector("svg");
      if (!svg) return;

      // Установим номер этажа (0 для первого этажа)
      const floorNumber = 7;      


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
      id: "745_check",
      label: "745",
      color: "#FF6347",
      info: "Отдел профориентационной работы",
      add_info: ""
    },
    {
      id: "746_check",
      label: "746",
      color: "#FF6347",
      info: "Кафедра контрастивной лингвистики",
      add_info: "Заведующий кафедрой:<br>Осипова Анна Александровна"
    },
    {
      id: "749_check",
      label: "749",
      color: "#FF6347",
      info: "Кафедра линводидактики и современных технологий иноязычного образования",
      add_info: "Заведующий кафедрой:<br>Трешина Инга Валерьевна"
    },
    {
      id: "750_check",
      label: "750",
      color: "#FF6347",
      info: "Кафедра линводидактики и современных технологий иноязычного образования",
      add_info: ""
    },
    {
      id: "751_check",
      label: "751",
      color: "#FF6347",
      info: "Учебный отдел очно-заочной и заочной форм обучения института иностранных языков",
      add_info: "Часы работы:<br>Вторник - Пятница - 12:00 - 18:00<br>Суббота - 10:30 - 16:30<br>Воскресенье, Понедельник - не работает"
    },
    {
      id: "752_check",
      label: "752",
      color: "#FF6347",
      info: "",
      add_info: "Заместитель директора по учебно-методической работе:<br>Беляева Екатерина Евгеньевна"
    },
    {
      id: "754_check",
      label: "754",
      color: "#FF6347",
      info: "Учебный отдел очной формы обучения института иностранных языков",
      add_info: "График работы<br>пн - чт:<br>10:00 - 18:00<br>пт: 10:00 - 17:00<br>сб: 10:00 - 16:00<br>вс - выходной"
    },
    {
      id: "741_check",
      label: "741",
      color: "#FF6347",
      info: "Кафедра логопедии",
      add_info: ""
    },
    {
      id: "736_check",
      label: "736",
      color: "#FF6347",
      info: "Учебно-научный центр междисциплинарных исследований в специальном и инклюзивном образовании",
      add_info: ""
    },
    {
      id: "732_check",
      label: "732",
      color: "#FF6347",
      info: "Кафедра тифлопедагогики",
      add_info: ""
    },
    {
      id: "721_check",
      label: "721",
      color: "#FF6347",
      info: "Кафедра романских языков им. В. Г. Гака",
      add_info: "Заведующий кафедрой:<br>Харитонова Ирина Викторовна"
    },
    {
      id: "718_check",
      label: "718",
      color: "#FF6347",
      info: "Деканат дефектологического факультета",
      add_info: "Режим работы<br>пн - 09:00 - 14:00<br>вт - 09:00 - 18:00<br>ср - 09:00 - 17:00<br>чт - 09:00 - 18:00<br>пт - 09:00 - 17:00<br>сб - 09:00 - 16:00<br>Обеденный перерыв 13:00 - 14:00"
    },
    {
      id: "716_check",
      label: "716",
      color: "#FF6347",
      info: "Директор института детства:<br>Анна Алексеевна Алмазова",
      add_info: ""
    },
    {
      id: "714_check",
      label: "714",
      color: "#FF6347",
      info: "Кафедра инклюзивного образования и сурдопедагогики",
      add_info: ""
    },
    {
      id: "703_check",
      label: "703",
      color: "#FF6347",
      info: "Кафедра психологической антропологии",
      add_info: ""
    },
    {
      id: "705_check",
      label: "705",
      color: "#FF6347",
      info: "Деканат дефектологического факультета",
      add_info: "Декан - Елена Владимировна Кулакова<br>График работы<br>пн - 10:00 - 17:00<br>вт - 10:00 - 17:00<br>чт - 10:00 - 17:00<br>пт - 10:00 - 17:00"
    },
    {
      id: "707_check",
      label: "707",
      color: "#FF6347",
      info: "Кафедра дошкольной дефектологии",
      add_info: ""
    },
    {
      id: "711_check",
      label: "711",
      color: "#FF6347",
      info: "Кафедра олигофренопедагогики и клинических основ дефектологии",
      add_info: ""
    },
  ];

  const dynamicZones = [
    { prefix: "tW", label: "Женский туалет", color: "#98FB98" },
    { prefix: "tM", label: "Мужской туалет", color: "#98FB98" },
    { prefix: "tT", label: "Туалет для сотрудников", color: "#37aa63" },
    { prefix: "el", label: "Лифт", color: "#b2b0df" },
    { prefix: "st", label: "Лестница", color: "#E0FFFF" }
  ];

  // Новая часть: исключаем элементы, начинающиеся на "7", но не содержащие "check" или "7floor"
  const audElements = Array.from(svg.querySelectorAll('[id^="7"]'))
    .filter(el => !el.id.includes("check") && el.id !== "7floor" && el.id !== "7floor_2" );

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

  // Добавляем зоны с ID на "7"
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

window.initfloor7 = initfloor7;
