function initfloor8(container) {
  fetch("/components/svg/8floor.svg")
    .then(response => response.text())
    .then(svgText => {
      container.innerHTML = svgText;
      const svg = container.querySelector("svg");
      if (!svg) return;

      window.zonesWithTooltips = createCompleteZonesFor8(svg);
      initAllZones(svg);
      
      if (typeof renderZoneList === "function") {
        renderZoneList();
      }
    })
    .catch(console.error);
}

function createCompleteZonesFor8(svg) {
  const baseZones = [
    {
      id: "809_check",
      label: "809",
      color: "#FF6347",
      info: "Институт социально-гуманитарного образования",
      add_info: "Научный руководитель института социально-гуманитарного образования<br>Мусарский Марк Михайлович<br>Заместитель директора института социально-гуманитарного образования<br>Николаев Максим Владимирович"
    },
    {
      id: "811_check",
      label: "811",
      color: "#FF6347",
      info: "Кафедра философии",
      add_info: "Заведующий кафедрой философии<br>Грифцова Ирина Николаевна"
    },
    {
      id: "812_check",
      label: "812",
      color: "#FF6347",
      info: "Кафедра философии",
      add_info: ""
    },
    {
      id: "813_check",
      label: "813",
      color: "#FF6347",
      info: "Учебный отдел<br>Диспетчерская",
      add_info: "Тихомирова Ольга Анатольевна<br>Гельмс Надежда Николаевна<br><b>Подача заявок на получение электронного пропуска МПГУ https://mspu.my.to/pass/</b>"
    },
    {
      id: "814_check",
      label: "814",
      color: "#FF6347",
      info: "Учебный отдел<br>Диспетчерская",
      add_info: "Начальник учебного отдела<br>Крючкова Татьяна Юрьевна<br>Учебный отдел<br>Анохина Олеся Викторовна"
    },
    {
      id: "815_check",
      label: "815",
      color: "#FF6347",
      info: "Кафедра культурологии",
      add_info: "Заведующий кафедрой культурологии<br>Пржиленская Ирина Борисовна"
    },
    {
      id: "807_check",
      label: "807",
      color: "#FF6347",
      info: "Учебный отдел Института социально-гуманитарного образования",
      add_info: "Шклярук Алла Леонидовна<br>Потапова Ольга Валерьевна<br>График приема:<br>Пн 10:00 - 17:00<br>Вт 10:00 - 17:00<br>Ср 10:00 - 17:00<br>Чт 10:00 - 17:00<br>Пт 10:00 - 16:00<br>Перерыв 13:00 - 14:00<br><b>Для оформления справок о периоде обучения</b> необходимо отправить заявку на электронный адрес dekanatna@yandex.ru <br>Сроки изготовления справок с печатью института два рабочих дня, с гербовой печатью четыре рабочих дня."
    },
    {
      id: "806_check",
      label: "806",
      color: "#FF6347",
      info: "Заместитель директора института социально-гуманитарного образования",
      add_info: "Баранова Вера Ивановна"
    },
    {
      id: "801_check",
      label: "801",
      color: "#FF6347",
      info: "Институт социально-гуманитарного образования",
      add_info: "Директор института социально-гуманитарного образования<br>Ростиславлев Дмитрий Александрович<br>Помощник директора социально-гуманитарного образования<br>Фомина Ольга Сергеевна"
    },
    {
      id: "803_check",
      label: "803",
      color: "#FF6347",
      info: "Заместитель директора института социально-гуманитарного образования",
      add_info: "Калмыкова Анастасия Дмитриевна"
    },
    {
      id: "839_check",
      label: "839",
      color: "#FF6347",
      info: "Кафедра теории и истории государства и права",
      add_info: "Заведующий кафедрой теории и истории государства и права<br>Ширяева Светлана Валентиновна"
    },
    {
      id: "840_check",
      label: "840",
      color: "#FF6347",
      info: "Заведующий кафедрой государственного и муниципального управления",
      add_info: "Оробец Вячеслав Михайлович"
    },
    {
      id: "841_check",
      label: "841",
      color: "#FF6347",
      info: "Кафедра государственного и муниципального управления",
      add_info: ""
    },
    {
      id: "843_check",
      label: "843",
      color: "#FF6347",
      info: "Управление профессиональной ориентации и содействия трудоустройству студентов",
      add_info: "Заместитель начальника Управления<br>Савощенко Николай Владимирович"
    },
    {
      id: "845_check",
      label: "845",
      color: "#FF6347",
      info: "Юридическая клиника",
      add_info: ""
    },
    {
      id: "837_check",
      label: "837",
      color: "#FF6347",
      info: "Заместитель директора института по научной работе",
      add_info: "Омельченко Елена Александровна"
    },
    {
      id: "834_check",
      label: "834",
      color: "#FF6347",
      info: "Управление профессиональной ориентации и содействия трудоустройству студентов",
      add_info: "Начальник управления<br>Михайлова Татьяна Ивановна"
    },
    {
      id: "833_check",
      label: "833",
      color: "#FF6347",
      info: "Отдел сопровождения профориентационных проектов",
      add_info: "Управления профессиональной ориентации и содействия трудоустройству студентов"
    },
    {
      id: "831_check",
      label: "831",
      color: "#FF6347",
      info: "Кабинет криминалистики",
      add_info: ""
    },
    {
      id: "check",
      label: "Кафедра права",
      color: "#FF6347",
      info: "Заведующий кафедрой права",
      add_info: "Глушков Александр Иванович"
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

  const audElements = Array.from(svg.querySelectorAll('[id^="8"]'))
    .filter(el => !el.id.includes("check") && el.id !== "8floor");

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

  // Добавляем зоны с ID на "8"
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

// Функция для поиска элементов по префиксу
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

window.initfloor8 = initfloor8;
