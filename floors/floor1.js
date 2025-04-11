function initfloor1(container) {
  fetch("/components/svg/1floor.svg")
    .then(response => response.text())
    .then(svgText => {
      container.innerHTML = svgText;
      const svg = container.querySelector("svg");
      if (!svg) return;

      // Установим номер этажа (0 для первого этажа)
      const floorNumber = 1;
     

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
  // Основные зоны с явными ID
  const baseZones = [
    { id: "sport", label: "Спортивный зал", color: "#87CEFA", info: "", add_info: "" },
    { id: "prep", label: "Преподавательская", color: "#D3D3D3", info: "Преподавательская спортивного зала", info: "", add_info: "" },
    { id: "sport_gym2", label: "Тренажерный зал", color: "#87CEFA", info: "", add_info: "" },
    { id: "lab", label: "Лаборатория", color: "#D3D3D3", info: "", add_info: "" },
    { id: "check", label: "Аудитория демонстрационного экзамена", color: "#D3D3D3", info: "Обычная аудитория, просто без номера", add_info: "" },
    { id: "dressW", label: "Женская раздевалка", color: "#D3D3D3", info: "", add_info: ""  },
    { id: "showW", label: "Женская душевая", color: "#D3D3D3", info: "", add_info: ""  },
    { id: "showM", label: "Мужская душевая", color: "#D3D3D3", info: "", add_info: ""  },
    { id: "dressM", label: "Мужская раздевалка", color: "#D3D3D3", info: "", add_info: ""  },
    { id: "109", label: "Аудитория 109", color: "#D3D3D3", info: "Кафедра спортивных дисциплин и методики их преподавания", add_info: "" },
    { id: "110", label: "Аудитория 110", color: "#D3D3D3", info: "Кафедра теоретических основ физической культуры и спорта", add_info: "Заведующий кафедрой" },
    { id: "111", label: "Аудитория 111", color: "#D3D3D3", info: "", add_info: ""  },
    { id: "100(A)", label: "Аудитория 100(A)", color: "#D3D3D3", info: "", add_info: ""  },
    { id: "dir", label: "Директорская", color: "#D3D3D3", info: "Директорская спортивного зала", add_info: "" },
    { id: "100", label: "Аудитория 100", color: "#D3D3D3", info: "", add_info: ""  },
    { id: "sport_yoga", label: "Гимнастический зал", color: "#87CEFA", info: "", add_info: "" },
    { id: "inv", label: "Инвентарная", color: "#D3D3D3", info: "", add_info: ""  },
    { id: "prep_2", label: "Преподавательская", color: "#D3D3D3", info: "Преподавательская спортивного зала", add_info: "" },
    { id: "107", label: "Аудитория 107", color: "#D3D3D3", info: "", add_info: ""  },
    { id: "101A(6)", label: "Аудитория 101A(6)", color: "#D3D3D3", info: "", add_info: "" },
    { id: "106", label: "Аудитория 106", color: "#D3D3D3", info: "", add_info: ""  },
    { id: "101A(7)", label: "Аудитория 101A(7)", color: "#D3D3D3", info: "Архивы", add_info: "" },
    { id: "101A(8)", label: "Аудитория 101A(8)", color: "#D3D3D3", info: "Тренерская", add_info: "" },
    { id: "101A(9)", label: "Аудитория 101A(9)", color: "#D3D3D3", info: "Учебный отдел", add_info: "" },
    { id: "101A(5)", label: "Аудитория 101A(5)", color: "#D3D3D3", info: "", add_info: ""  },
    { id: "101A(4)", label: "Аудитория 101A(4)", color: "#D3D3D3", info: "Заведующий кафедрой спортивных дисциплин и методики их преподавания", add_info: "" },
    { id: "101A(3)", label: "Аудитория 101A(3)", color: "#D3D3D3", info: "Учебный отдел", add_info: "График работы:<br>пн-чт<br>10:00 - 18:00,<br>пт 10:00 - 17:00,<br>сб - 10:00 - 14:00<br>Перерыв 13:15 - 13:45" },
    { id: "211", label: "Аудитория 211", color: "#D3D3D3", info: "Вход со второго этажа по лестнице вниз", add_info: "" },
    { id: "212", label: "Аудитория 212", color: "#D3D3D3", info: "Вход со второго этажа по лестнице вниз", add_info: "" },
    { id: "ums", label: "УМС", color: "#D3D3D3", info: "Вход со второго этажа по лестнице вниз", add_info: "" },
    { id: "210", label: "Аудитория 210", color: "#D3D3D3", info: "Вход со второго этажа по лестнице вниз", add_info: "" },
    { id: "209", label: "Аудитория 209", color: "#D3D3D3", info: "Вход со второго этажа по лестнице вниз", add_info: "" },
    { id: "shtab", label: "Штаб студенческого спасательного отряда МПГУ", color: "#D3D3D3", info: "", add_info: "" },
    { id: "uvr", label: "УВР", color: "#D3D3D3", info: "Вход через лестницу в самом конце второго этажа после столовой, до конца вниз по лестнице", add_info: ""  },
    { id: "uvr_2", label: "УВР", color: "#D3D3D3", info: "Вход через лестницу в самом конце второго этажа после столовой, до конца вниз по лестнице", add_info: ""  },
    { id: "uvr_3", label: "УВР", color: "#D3D3D3", info: "Вход через лестницу в самом конце второго этажа после столовой, до конца вниз по лестнице", add_info: ""  },
    { id: "uvr_4", label: "УВР", color: "#D3D3D3", info: "Вход через лестницу в самом конце второго этажа после столовой, до конца вниз по лестнице", add_info: ""  },
    { id: "4", label: "Аудитория 203б(4)", color: "#D3D3D3", info: "Вход со второго этажа по лестнице напротив столовой", add_info: ""  },
    { id: "2", label: "Аудитория 203б(2)", color: "#D3D3D3", info: "Вход со второго этажа по лестнице напротив столовой", add_info: ""  },
    { id: "207", label: "Аудитория 207", color: "#D3D3D3", info: "Вход со второго этажа по лестнице вниз", add_info: ""  },
    { id: "205", label: "Аудитория 205", color: "#D3D3D3", info: "Вход со второго эта этажа по лестнице вниз", add_info: ""  },
    { id: "208", label: "Аудитория 208", color: "#D3D3D3", info: "Вход со второго этажа по лестнице вниз", add_info: "" },
    { id: "206", label: "Аудитория 206", color: "#D3D3D3", info: "Вход со второго этажа по лестнице вниз", add_info: "" },
    { id: "entrance", label: "Вход в здание", color: "#D3D3D3", info: "", add_info: ""  },
    { id: "shop", label: "Буфет", color: "#D3D3D3", info: "Ларек со всякими вкусностями", info: "", add_info: ""  },
    { id: "actback", label: "Закулисье", color: "#ffe9ed", info: "", add_info: ""  },
    { id: "act", label: "Актовый зал", color: "#ffe9ed", info: "Актовый зал, где проводят различные выступления и концерты", add_info: "" },
    { id: "103", label: "Кабинет 103", color: "#D3D3D3", info: "", add_info: ""  },
    { id: "102", label: "Кабинет 102", color: "#D3D3D3", info: "", add_info: ""  },
    { id: "kassa", label: "Касса", color: "#D3D3D3", info: "", add_info: ""  },
    { id: "107_2", label: "Кабинет 107", color: "#D3D3D3", info: "", add_info: ""  },
    { id: "108", label: "Кабинет 108", color: "#D3D3D3", info: "", add_info: ""  },
    { id: "3", label: "Аудитория 203б(3)", color: "#D3D3D3", info: "Вход со второго этажа по лестнице напротив столовой", add_info: "" },
    { id: "kaf_check", label: "Кафедра физического здоровья", color: "#FF6347", info: "", add_info: "" },
    { id: "kaf", label: "Центр развития ребенка", color: "#FF6347", info: "", add_info: "Режим работы:<br>Понедельник: 13:00 - 18:00<br>Четверг: 13:00 - 18:00", add_info: "" },
    { id: "ch", label: "Кафедра английского языка и цифровых образовательных технологий <br> Кафедра иноязычного образования", color: "#FF6347", info: "", add_info: "" },
    { id: "hz", label: "Отдел статистики", color: "#FF6347", info: "", add_info: "Приемные часы: 10:00 - 16:00" },
    { id: "chto", label: "Управление издательской деятельности", color: "#FF6347", info: "Начальник Управления - Алла Борисовна Чехович,<br>Начальник Редакционно-издательского отдела - Алла И. Ч.", add_info: "Алла Борисовна Чехович(+7 906 754 08 21),<br>Анна И. Н.(+7 915 015 015 8)" },
    { id: "az", label: "Управление издательской деятельности", color: "#FF6347", info: "", add_info: "" },
    { id: "che", label: "Учебно-методический центр", color: "#FF6347", info: ""? add_info: "" },
  ];
  

  // Динамически находим элементы с определенными префиксами
  const dynamicZones = [
    { prefix: "tW", label: "Женский туалет", color: "#98FB98", info: "", add_info: ""  },
    { prefix: "tM", label: "Мужской туалет", color: "#98FB98", info: "", add_info: ""  },
    { prefix: "tALL", label: "Общий туалет", color: "#98FB98", info: "", add_info: ""  },
    { prefix: "el", label: "Лифт", color: "#4B0082", info: "", add_info: ""  },
    { prefix: "st", label: "Лестница", color: "#E0FFFF", info: "", add_info: "" }
  ];

  // Собираем все зоны в один массив
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

  return allZones;
}

// Находит элементы по префиксу ID (включая числовые и спецсимволы)
function findElementsByPrefix(svg, prefix) {
  const elements = [];
  
  // Ищем всеми возможными способами
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

// Улучшенная инициализация зон
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

window.initfloor1 = initfloor1;
