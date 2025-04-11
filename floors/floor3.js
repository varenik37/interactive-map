function initfloor3(container) {
  fetch("/components/svg/3floor.svg")
    .then(response => response.text())
    .then(svgText => {
      container.innerHTML = svgText;
      const svg = container.querySelector("svg");
      if (!svg) return;

      // Установим номер этажа (0 для первого этажа)
      const floorNumber = 3;      


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
      id: "356_check",
      label: "356",
      color: "#FF6347",
      info: "Деканат",
      add_info: ""
    },
    {
      id: "307_check",
      label: "307",
      color: "#FF6347",
      info: "Кафедра методики преподавания истории",
      add_info: "Заведующий кафедрой:<br>Саплина Елена Витальевна"
    },
    {
      id: "309_check",
      label: "309",
      color: "#FF6347",
      info: "Кафедра истории России",
      add_info: ""
    },
    {
      id: "310_check",
      label: "310",
      color: "#FF6347",
      info: "Кафедра истории Древнего мира и средних веков имени В. Ф. Семенова",
      add_info: "Заведующий кафедрой:<br>Симонова Надежда Вячеславовна<br>Директор центра археологических исслеедований:<br>Винокуров Николай Игореввич"
    },
    {
      id: "308_check",
      label: "308",
      color: "#FF6347",
      info: "",
      add_info: "Заведующий кафедрой истории Росии:<br>Лачаева Марина Юрьевна"
    },
    {
      id: "conf",
      label: "Конференц-зал",
      color: "#FF6347",
      info: "",
      add_info: ""
    },
    {
      id: "348_check",
      label: "348",
      color: "#FF6347",
      info: "Отдел социальной работы",
      add_info: "Начальник отдела:<br>Игнатова Ольга Валентиновна"
    },
    {
      id: "346_check",
      label: "346",
      color: "#FF6347",
      info: "Студия МПГУ",
      add_info: "Программа 'Хорошо, что вы пришли'<br>Автор и ведущий: Сергей Зарков"
    },
    {
      id: "344_check",
      label: "344",
      color: "#FF6347",
      info: "Телестудия МПГУ",
      add_info: ""
    },
    {
      id: "342_check",
      label: "342",
      color: "#FF6347",
      info: "Управление международных связей",
      add_info: "Прием иностранных граждан"
    },
    {
      id: "322_check",
      label: "322",
      color: "#FF6347",
      info: "Ученый совет института истории и политики",
      add_info: ""
    },
    {
      id: "320_check",
      label: "320",
      color: "#FF6347",
      info: "Заместитель директора по воспитательной работе:<br>Лощилова Татьяна Николаевна",
      add_info: ""
    },
    {
      id: "349_check",
      label: "349",
      color: "#FF6347",
      info: "Дирекция изучения истории МПГУ",
      add_info: "Центр поисковой работы и историко-культурного туризма"
    },
    {
      id: "341_check",
      label: "341",
      color: "#FF6347",
      info: "Учебно-научный центр актуальных проблем исторической науки и образования им. А. Г. Кузьмина",
      add_info: ""
    },
    {
      id: "337_check",
      label: "337",
      color: "#FF6347",
      info: "Кафедра новой и новейшей истории стран Азии и Африки<br>Кафедра новой и новейшей истории стран Запада и Востока",
      add_info: "Заведующий кафедрой:<br>Сарабьев Алексей Викторович"
    },
    {
      id: "303_check",
      label: "303",
      color: "#FF6347",
      info: "Дирекция института истории и политики",
      add_info: "Заместитель директора по учебной работе:<br>Несмелова Марина Леонидовна"
    },
    {
      id: "304_check",
      label: "304",
      color: "#FF6347",
      info: "Кафедра политологии",
      add_info: "Заведующий кафедрой:<br>Карадже Татьяна Васильевна<br>Ученый секретарь ученого совета института:<br>Мусина Резеда Идвартовна"
    },
    {
      id: "305_check",
      label: "305",
      color: "#FF6347",
      info: "",
      add_info: "Первый заместитель директора:<br>Клименко Андрей Владимирович"
    },
    {
      id: "306_check",
      label: "306",
      color: "#FF6347",
      info: "Научная лаборатория 'Исторические процессы и социально-политические технологии'",
      add_info: "Руководитель научной лааборатории:<br>Ананченко Алексей Брониславович"
    },
    {
      id: "351_check",
      label: "351",
      color: "#FF6347",
      info: "Учебно-научный центр приоритетных исследований и проблем подготовки научно-педагогических кадров",
      add_info: "Отдел аспирантуры<br>Часы приема: <br>Понедельник, Вторник, Среда, Четверг:<br>10:30 - 13:00<br>15:00 - 17:00<br>Пятница:<br>Приема нет"
    },
    {
      id: "345_check",
      label: "345",
      color: "#FF6347",
      info: "Кафедра новейшей истории отечества",
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

  // Новая часть: исключаем элементы, начинающиеся на "3", но не содержащие "check" или "3floor"
  const audElements = Array.from(svg.querySelectorAll('[id^="3"]'))
    .filter(el => !el.id.includes("check") && el.id !== "3floor" && el.id !== "3floor_2" );

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

window.initfloor3 = initfloor3;
