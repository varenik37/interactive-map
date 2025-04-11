function initfloor5(container) {
  fetch("/components/svg/5floor.svg")
    .then(response => response.text())
    .then(svgText => {
      container.innerHTML = svgText;
      const svg = container.querySelector("svg");
      if (!svg) return;

      // Установим номер этажа (0 для первого этажа)
      const floorNumber = 5;      


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
      id: "556_check",
      label: "556",
      color: "#FF6347",
      info: "",
      add_info: "Пожалуйста, по всем вопросам аспирантуры, обращайтесь в кабинет 351"
    },
    {
      id: "557_check",
      label: "557",
      color: "#FF6347",
      info: "Отдел образовательных программ<br>Учебно-методические управления",
      add_info: "Начальник отдела: Щукина Ольга Владимировна<br>Ведущий специалист по учебно-методической работе: Арзюнина Юлия Сергеевна<br>Ведущий специалист по учебно-методической работе: Занина Светлана Алексеевна<br>Ведущий специалист по учебно-методической работе: Лабзин Михаил Владимирович<br>Ведущий специалист по учебно-методической работе: Порошина Яна Игоревна<br>График работы: пн - чт 09:30 - 18:15, пт 09:30 - 17:00<br>Перерыв 13:15 - 13:45"
    },
    {
      id: "550_check",
      label: "550",
      color: "#FF6347",
      info: "Отдел по обеспечению деятельности приемной комиссии",
      add_info: "Начальник отдела:<br>Грачева Елена Александровна"
    },
    {
      id: "546_check",
      label: "546",
      color: "#FF6347",
      info: "Отдел по договорному приему",
      add_info: "Начальник отдела:<br>Соболева Жанна Ивановна"
    },
    {
      id: "549_check",
      label: "549",
      color: "#FF6347",
      info: "Подготовительные курсы",
      add_info: ""
    },
    {
      id: "548_check",
      label: "548",
      color: "#FF6347",
      info: "Отдел переводов и восстановлений",
      add_info: ""
    },
    {
      id: "528_check",
      label: "528",
      color: "#FF6347",
      info: "Зал заседаний ученого совета института социально-гуманитарного образования",
      add_info: ""
    },
    {
      id: "527_check",
      label: "527",
      color: "#FF6347",
      info: "",
      add_info: "Отвеьственный секретарь отборочной комиссии института социально-гуманитарного образования:<br>Лимонова Мария Александровна<br>Ученый секретарь ученого совета института социально-гуманитарного образования:<br>Калмыкова Инна Викторовна"
    },
    {
      id: "523_check",
      label: "523",
      color: "#FF6347",
      info: "Кафедра ЮНЕСКО",
      add_info: "Заведующий кафедрой: Лубков Алексей Владимирович"
    },
    {
      id: "502_check",
      label: "502",
      color: "#FF6347",
      info: "",
      add_info: "Заместитель директора института по рвботе с иностранными студентами и международному сотрудничеству:<br>Миняжев Тимур Рифатович"
    },
    {
      id: "504_check",
      label: "504",
      color: "#FF6347",
      info: "Кафедра культурологии",
      add_info: ""
    },
    {
      id: "505_check",
      label: "505",
      color: "#FF6347",
      info: "Кафедра экономической теории и менеджмента",
      add_info: "Заведующий кафедрой:<br>Платонова Елена Дмитриевна"
    },
    {
      id: "507_check",
      label: "507",
      color: "#FF6347",
      info: "Кафедра теории и истории социологии",
      add_info: "Заведующий кафедрой:<br>Иванов Сергей Юрьевич"
    },
    {
      id: "508_check",
      label: "508",
      color: "#FF6347",
      info: "Кафедра теоретической и специальной социологии",
      add_info: ""
    },
    {
      id: "509_check",
      label: "509",
      color: "#FF6347",
      info: "Кафедра управления образовательными системами им. Т. И. Шамовой",
      add_info: "Заведующий кафедрой: Осипова Ольга Петровна"
    },
    {
      id: "511_check",
      label: "511",
      color: "#FF6347",
      info: "Кафедра истории",
      add_info: "Заведующий кафедрой: Талина Галина Валерьевна"
    },
  ];

  const dynamicZones = [
    { prefix: "tW", label: "Женский туалет", color: "#98FB98" },
    { prefix: "tM", label: "Мужской туалет", color: "#98FB98" },
    { prefix: "tT", label: "Туалет для сотрудников", color: "#37aa63" },
    { prefix: "el", label: "Лифт", color: "#b2b0df" },
    { prefix: "st", label: "Лестница", color: "#E0FFFF" }
  ];

  // Новая часть: исключаем элементы, начинающиеся на "5", но не содержащие "check" или "3floor"
  const audElements = Array.from(svg.querySelectorAll('[id^="5"]'))
    .filter(el => !el.id.includes("check") && el.id !== "5floor" && el.id !== "5floor_2" );

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

  // Добавляем зоны с ID на "5"
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

window.initfloor5 = initfloor5;
