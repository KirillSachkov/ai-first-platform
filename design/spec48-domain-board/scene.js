// Domain board for spec #48 in Process Modelling EventStorming notation.
// Content only: kit.js sizes the stickies and draws the arrows.
// Solid border: confirmed by the owner. Dashed border: proposed, waiting for the owner.
// Steps are numbered on commands inside a block; "2.6" means step 6 of block 2.

const LANES = {
  x: "Внешние системы",
  g: "Edge / Входной слой",
  e: "Employees / Сотрудники",
  c: "Agent connections /\nПодключения агентов",
  a: "Access / Доступ",
  p: "Projects / Проекты",
};
const lane = (key, rows = 1, rowH) => ({ key, title: LANES[key], rows, rowH });

const FRAME_GAP = 110;
const SECTION_GAP = 70;

export function build(kit) {
  const { INK, frame, section, sticky, span, chip, arrow, path, text, para, stack, titled, dot, widthOf } = kit;

  /** Rows of "actor: command -> shared data -> event" around one tall data sticky. */
  function commandRows(s, laneKey, data, rows, firstRow = 0) {
    rows.forEach(([actor, command, event, hot], i) => {
      const row = firstRow + i;
      const c = sticky("command", s.at(laneKey, 1, row), command);
      chip("actor", c, actor);
      if (hot) chip("hotChip", c, hot);
      const e = sticky("event", s.at(laneKey, 3, row), event);
      arrow(c, data);
      arrow(data, e);
    });
  }

  /** State diagram: start dot, one working state with an optional loop, final states on the right. */
  function lifecycle(x, y, spec) {
    const n = spec.finals.length;
    const pitch = 110;
    const cy = y + Math.max(105, ((n - 1) / 2) * pitch + 32);
    dot(x + 9, cy);
    const state = sticky("state", { cx: x + 18 + Math.ceil(widthOf(spec.start, 14)) + 50 + 85, cy }, spec.state, {
      w: 170,
      minH: 64,
    });
    path(
      [
        [x + 18, cy],
        [state.x - 3, cy],
      ],
      { label: spec.start, to: state },
    );
    if (spec.loop) {
      const top = state.y - 46;
      path(
        [
          [state.cx - 45, state.y],
          [state.cx - 45, top],
          [state.cx + 45, top],
          [state.cx + 45, state.y - 3],
        ],
        { label: spec.loop, labelSeg: 1 },
      );
    }
    const labelW = Math.max(...spec.finals.flatMap((f) => f.label.split("\n").map((line) => widthOf(line, 14))));
    const mx = state.x + state.w + 60;
    const fx = mx + labelW + 70;
    spec.finals.forEach((f, i) => {
      const off = i - (n - 1) / 2;
      const fcy = cy + off * pitch;
      const final = sticky("state", { cx: fx + 85, cy: fcy }, f.name, { w: 170, minH: 64, proposed: f.proposed });
      const sy = cy + off * 18;
      const points =
        off === 0
          ? [
              [state.x + state.w, cy],
              [final.x - 3, cy],
            ]
          : [
              [state.x + state.w, sy],
              [mx, sy],
              [mx, fcy],
              [final.x - 3, fcy],
            ];
      const last = points.length - 2;
      const segStart = points[last][0];
      const t = off === 0 ? ((mx + final.x) / 2 - segStart) / (final.x - 3 - segStart) : 0.5;
      path(points, { label: f.label, labelSeg: last, labelT: t, from: state, to: final });
    });
    text(x, cy + ((n - 1) / 2) * pitch + 32 + 28, spec.note, 15);
  }

  let y = 0;

  // ---------- Legend ----------
  const legend = frame("Легенда", 0, y, "Легенда", (x, top) => {
    const small = { w: 170, minH: 60, fontSize: 14 };
    const items = [
      ["command", "1. Действие"],
      ["data", "Данные модуля"],
      ["event", "Событие"],
      ["eventAlt", "Событие побочной ветки"],
      ["policy", "Реакция: когда X"],
      ["external", "Внешняя система"],
      ["read", "Что видит участник"],
      ["edge", "Edge: вход запроса"],
    ];
    items.forEach(([kind, label], i) => {
      const s = sticky(kind, { cx: x + 85 + i * 195, cy: top + 30 }, label, small);
      if (kind === "command") {
        chip("actor", s, "Участник");
        chip("hotChip", s, "H1");
      }
    });
    stack(x + items.length * 195, top, [["rule", "Шаг 1", "• правило шага"]]);
    stack(x + items.length * 195 + 170, top, [["hot", "H1 · шаг 1", "Открытый вопрос"]]);
    stack(x + items.length * 195 + 340, top, [["rule", "P1 · предложено", "Ждёт владельца", { proposed: true }]]);

    const y2 = top + 122;
    path([
      [x, y2 + 9],
      [x + 80, y2 + 9],
    ]);
    text(x + 94, y2, "порядок шагов, чтение или проверка", 15);
    path(
      [
        [x + 400, y2 + 9],
        [x + 480, y2 + 9],
      ],
      { event: true },
    );
    text(x + 494, y2, "событие между модулями", 15);
    text(
      x + 740,
      y2,
      "Номер стоит на действии. Шаг 6 блока 2 записан как 2.6. Сплошная рамка: подтверждено владельцем. Пунктир: предложено.",
      15,
    );
  });
  y = legend.bottom + FRAME_GAP;

  // ---------- Context: modules ----------
  const context = frame("Контекст", 0, y, "Контекст: модули и их данные", (x, top) => {
    const mx = x + 640;
    const mw = 400;
    const defs = [
      ["Agent connections / Подключения агентов", ["• владелец подключения", "• действительность и отзыв"]],
      [
        "Employees / Сотрудники",
        ["• учётная запись сотрудника", "• приглашение", "• корпоративная личность", "• сессия входа"],
      ],
      ["Access / Доступ", ["• участие в проекте", "• полномочия администратора", "• решения о разрешениях"]],
      ["Projects / Проекты", ["• проект и его репозитории", "• источники инструкций", "• версия harness"]],
    ];
    let cy = top;
    const modules = defs.map(([title, lines]) => {
      const m = titled("data", mx, cy, mw, title, lines);
      cy = m.y + m.h + 96;
      return m;
    });
    const [con, emp, acc, prj] = modules;
    const edge = titled(
      "edge",
      x,
      con.y,
      280,
      "Edge / Входной слой",
      [
        "проверяет каждый запрос:",
        "1. сессию или подключение",
        "2. активность учётной записи",
        "3. разрешения",
        "",
        "потом передаёт запрос модулю",
      ],
      { h: prj.y + prj.h - con.y },
    );
    arrow(edge, con, { label: "подключение действует?" });
    arrow(edge, emp, { label: "сессия действует?\nучётная запись активна?" });
    arrow(edge, acc, { label: "что разрешено сотруднику?" });
    arrow(edge, prj, { label: "запрос после проверок" });
    arrow(emp, con, { event: true, label: "событие:\nдоступ к платформе прекращён" });
    arrow(emp, acc, { x: emp.cx - 90, label: "вызов: снять полномочия\nадминистратора", labelSide: "left" });
    arrow(emp, acc, {
      event: true,
      x: emp.cx + 60,
      label: "события: приглашение принято,\nдоступ к платформе прекращён",
    });
    arrow(acc, prj, { label: "проекты существуют?" });
    text(
      x,
      prj.y + prj.h + 34,
      "Access не вызывает Employees и Agent connections: проверки входа делает Edge (ADR-0004).",
      15,
    );
  });

  // ---------- Open questions and proposals ----------
  const questions = frame(
    "Открытые вопросы",
    context.right + 130,
    y,
    "Открытые вопросы и предложения",
    (x, top) => {
      const rows = [
        [
          "hot",
          "H1",
          "Потерян вход единственного администратора",
          "Оператор выдаёт первое приглашение, только пока нет активного администратора. Если единственный администратор потерял вход у провайдера, эта команда не поможет. Аварийный путь определит техническое проектирование (#56). Шаг 1.1.",
        ],
        [
          "hot",
          "H2",
          "Сколько сотрудник ждёт оформления участий",
          "Участия оформляются по событию, с задержкой. Допустимую задержку определит сессия о качестве (#53). Шаг 1.8.",
        ],
        [
          "hot",
          "H3",
          "Перепривязка корпоративной личности",
          "Если пользователя пересоздали у провайдера, прежняя учётная запись его не узнаёт. В первой версии администратор выдаёт новое приглашение. Перепривязка отложена. Шаг 1.7.",
        ],
        [
          "hot",
          "H4",
          "Действия после прекращения доступа, но до доставки события",
          "Участие или подключение, созданные в этом окне, тоже должны прекратиться и не вернуться после восстановления. Механизм определит техническое проектирование (#56). Шаги 2.6 и 3.2.",
        ],
        [
          "rule",
          "P1",
          "Новое подключение на каждое подтверждение, неиспользуемое истекает",
          "Платформа не узнаёт устройство, поэтому повторное подтверждение создаёт ещё одно подключение. Подключение, которым долго не пользовались, истекает. Ждёт решения владельца. Шаги 3.2 и 3.6.",
        ],
        [
          "rule",
          "P2",
          "Подтверждение только на машине клиента",
          "Ответ после согласия уходит только на машину, где открыт браузер. Удалённой среде нужен проброс порта. Ждёт решения владельца. Шаг 3.1.",
        ],
        [
          "rule",
          "P3",
          "У подключения нет собственных ограничений",
          "Подключение читает всё, что разрешено владельцу, и только читает. Ждёт решения владельца. Шаг 3.2.",
        ],
      ];
      let cy = top;
      for (const [kind, id, head, body] of rows) {
        sticky(kind, { cx: x + 34, cy: cy + 34 }, id, { w: 68, minH: 68, fontSize: 18, proposed: kind === "rule" });
        text(x + 92, cy + 2, head, 17, INK);
        const p = para(x + 92, cy + 30, body, 15, 780);
        cy = Math.max(cy + 68, p.y + p.h) + 26;
      }
    },
  );
  y = Math.max(context.bottom, questions.bottom) + FRAME_GAP;

  // ---------- Block 1 ----------
  const block1 = frame("Блок 1", 0, y, "Блок 1. Приглашение и присоединение сотрудника", (x, top) => {
    let sy = top;

    let s = section(x, sy, "1А. Первый администратор", [lane("e")], 3);
    const c1 = sticky("command", s.at("e", 1), "1. Выдать первое приглашение");
    chip("actor", c1, "Оператор");
    chip("hotChip", c1, "H1");
    const d1 = sticky("data", s.at("e", 2), "Первое административное приглашение");
    const e1 = sticky("event", s.at("e", 3), "Первое приглашение выдано");
    arrow(c1, d1);
    arrow(d1, e1);
    s.panel([
      [
        "rule",
        "Шаг 1",
        "• только пока нет активного администратора\n• повторный запуск заменяет ссылку\n• принявший получает полномочия администратора",
      ],
      ["hot", "H1 · шаг 1", "Единственный администратор потерял вход"],
    ]);
    sy = s.bottom + SECTION_GAP;

    s = section(x, sy, "1Б. Управление приглашением", [lane("e", 4)], 3);
    const invitation = span("data", s.at("e", 2, 0), s.at("e", 2, 3), "Приглашение");
    commandRows(s, "e", invitation, [
      ["Администратор", "2. Выдать приглашение", "Приглашение выдано"],
      ["Администратор", "3. Изменить намеченные проекты", "Намеченные проекты изменены"],
      ["Администратор", "4. Заменить ссылку", "Ссылка заменена"],
      ["Администратор", "5. Отменить приглашение", "Приглашение отменено"],
    ]);
    s.panel([
      [
        "rule",
        "Шаг 2",
        "• адресат: email без активной учётной записи\n• на один адрес ожидает одно приглашение\n• срок 7 дней по умолчанию, фиксируется при выдаче\n• полномочий администратора не даёт",
      ],
      ["rule", "Шаги 3–5", "• только пока приглашение ожидает\n• адресата изменить нельзя: отменить и выдать заново"],
      ["rule", "Шаг 4", "• новая ссылка и новый полный срок\n• старая ссылка сразу перестаёт работать"],
    ]);
    sy = s.bottom + SECTION_GAP;

    s = section(x, sy, "1В. Принятие приглашения", [lane("x"), lane("e", 2)], 5);
    const c6 = sticky("command", s.at("x", 1), "6. Войти через OIDC");
    chip("actor", c6, "Получатель приглашения");
    const idp = sticky("external", s.at("x", 2), "OIDC-провайдер компании");
    const e6 = sticky("event", s.at("x", 3), "Личность подтверждена");
    const c7 = sticky("command", s.at("e", 3, 0), "7. Принять приглашение");
    chip("actor", c7, "Получатель приглашения");
    chip("hotChip", c7, "H3");
    const account = span("data", s.at("e", 4, 0), s.at("e", 4, 1), "Приглашение и учётная запись сотрудника");
    const e7 = sticky("event", s.at("e", 5, 0), "Приглашение принято");
    const e7no = sticky("eventAlt", s.at("e", 5, 1), "Принятие отклонено");
    arrow(c6, idp);
    arrow(idp, e6);
    arrow(e6, c7);
    arrow(c7, account);
    arrow(account, e7);
    arrow(account, e7no);
    s.panel([
      ["rule", "Шаг 6", "• провайдер подтверждает личность и её email"],
      [
        "rule",
        "Шаг 7",
        "• email подтверждён и совпадает с адресом приглашения\n• у этой личности ещё нет учётной записи\n• учётная запись связывается с корпоративной личностью, email дальше служит контактом\n• намеченные проекты берутся на момент принятия",
      ],
      ["rule", "Принятие отклонено", "• приглашение не расходуется и ждёт адресата\n• учётная запись не создаётся"],
      ["hot", "H3 · шаг 7", "Перепривязка личности после пересоздания у провайдера"],
    ]);
    sy = s.bottom + SECTION_GAP;

    s = section(x, sy, "1Г. Оформление участий", [lane("e"), lane("a"), lane("p")], 6);
    const accepted = sticky("event", s.at("e", 1), "Приглашение принято");
    const policy = sticky("policy", s.at("a", 2), "Когда приглашение принято");
    const c8 = sticky("command", s.at("a", 3), "8. Оформить участия");
    const membership = sticky("data", s.at("a", 4), "Участие в проекте");
    const e8 = sticky("event", s.at("a", 5), "Участия оформлены");
    const progress = sticky("read", s.at("a", 6), "Оформление участий: выполняется или готово");
    chip("actor", progress, "Сотрудник");
    chip("hotChip", progress, "H2");
    const project = sticky("data", s.at("p", 4), "Проект");
    arrow(accepted, policy, { event: true });
    arrow(policy, c8);
    arrow(c8, membership);
    arrow(membership, e8);
    arrow(e8, progress);
    arrow(membership, project, { label: "проект существует?", labelT: 0.22 });
    s.panel([
      [
        "rule",
        "Шаг 8",
        "• участия только в существующих проектах\n• повторная доставка события ничего не дублирует\n• не отменяет более позднее изменение участия\n• не отменяет более позднее прекращение доступа",
      ],
      [
        "rule",
        "Что видит сотрудник",
        "• пока шаг 8 не завершён: «оформление выполняется»\n• без намеченных проектов присоединение успешно",
      ],
      ["hot", "H2 · шаг 8", "Сколько сотрудник ждёт оформления участий"],
    ]);
  });

  // ---------- Invitation lifecycle, beside block 1 ----------
  frame("Жизненный цикл приглашения", block1.right + 130, y, "Жизненный цикл: приглашение", (x, top) => {
    lifecycle(x, top, {
      start: "выдать",
      state: "Ожидает",
      loop: "заменить ссылку, изменить проекты",
      finals: [
        { name: "Принято", label: "принять" },
        { name: "Отменено", label: "отменить" },
        { name: "Истекло", label: "срок прошёл" },
      ],
      note: "Справа конечные состояния: приглашение больше не меняется и не создаёт доступ.\n«Истекло» выводится из срока и текущего времени, отдельного события нет.",
    });
  });
  y = block1.bottom + FRAME_GAP;

  // ---------- Block 2 ----------
  const block2 = frame("Блок 2", 0, y, "Блок 2. Проекты и участие", (x, top) => {
    let sy = top;

    let s = section(x, sy, "2А. Проект и его репозитории", [lane("p", 5)], 3);
    const project = span("data", s.at("p", 2, 0), s.at("p", 2, 3), "Проект");
    commandRows(s, "p", project, [
      ["Администратор", "1. Создать проект", "Проект создан"],
      ["Администратор", "2. Изменить проект", "Проект изменён"],
      ["Администратор", "3. Связать репозиторий с проектом", "Репозиторий связан с проектом"],
      ["Администратор", "4. Убрать связь с репозиторием", "Связь с репозиторием убрана"],
    ]);
    const repository = sticky("data", s.at("p", 2, 4), "Репозиторий");
    commandRows(s, "p", repository, [["Администратор", "5. Изменить репозиторий", "Репозиторий изменён"]], 4);
    s.panel([
      ["rule", "Шаг 1", "• проект может быть без репозиториев"],
      [
        "rule",
        "Шаг 2",
        "• описание, источники инструкций, версия harness\n• версия harness необязательна\n• версия задаётся полным SHA общего harness",
      ],
      [
        "rule",
        "Шаги 3–4",
        "• репозиторий записан один раз на компанию\n• один репозиторий может входить в несколько проектов\n• убранная связь не меняет другие проекты",
      ],
      [
        "rule",
        "Шаг 5",
        "• адрес и источники инструкций репозитория\n• изменение видно во всех проектах репозитория",
      ],
    ]);
    sy = s.bottom + SECTION_GAP;

    s = section(x, sy, "2Б. Участие в проекте", [lane("a", 2)], 3);
    const membership = span("data", s.at("a", 2, 0), s.at("a", 2, 1), "Участие в проекте");
    commandRows(s, "a", membership, [
      ["Администратор", "6. Добавить участника", "Участие добавлено", "H4"],
      ["Администратор", "7. Исключить участника", "Участие прекращено"],
    ]);
    s.panel([
      [
        "rule",
        "Шаг 6",
        "• только активный сотрудник и существующий проект\n• повтор ничего не меняет\n• администратор может добавить себя",
      ],
      [
        "rule",
        "Шаги 6–7",
        "• действуют со следующего запроса\n• остальные участия сотрудника сохраняются\n• вернуть в проект можно без нового приглашения",
      ],
      ["hot", "H4 · шаг 6", "Участник добавлен после прекращения доступа, но до доставки события"],
    ]);
  });
  y = block2.bottom + FRAME_GAP;

  // ---------- Reading the project context ----------
  const reading = frame(
    "Чтение контекста",
    0,
    y,
    "Чтение контекста проекта: сотрудник и подключённый агент",
    (x, top) => {
      const s = section(x, top, "", [lane("g", 2, 130), lane("e"), lane("c"), lane("a"), lane("p")], 7);
      const request = sticky("command", s.at("g", 1, 0), "1. Запросить контекст проекта");
      chip("actor", request, "Сотрудник в браузере");
      chip("actor", request, "Подключённый агент", { index: 1 });
      const edge = span("edge", s.at("g", 2, 0), s.at("g", 6, 0), "Edge проверяет по порядку, потом передаёт запрос");
      const granted = sticky("read", s.at("g", 7, 0), "Контекст проекта");
      const rejected = sticky("eventAlt", s.at("g", 7, 1), "Запрос отклонён");
      arrow(request, edge);
      arrow(edge, granted);
      const bendX = edge.x + edge.w + 30;
      path(
        [
          [edge.x + edge.w, edge.cy + 24],
          [bendX, edge.cy + 24],
          [bendX, rejected.cy],
          [rejected.x - 3, rejected.cy],
        ],
        { from: edge, to: rejected },
      );
      const check = (col, laneKey, data, label) => {
        const d = sticky("data", s.at(laneKey, col), data);
        path(
          [
            [d.cx, edge.y + edge.h],
            [d.cx, d.y - 3],
          ],
          { from: edge, to: d },
        );
        text(d.cx + 10, edge.y + edge.h + 10, label, 14);
      };
      check(2, "e", "Сессия входа", "1. сотрудник:\nсессия действует?");
      check(3, "c", "Подключение агента", "1. агент:\nподключение действует?");
      check(4, "e", "Учётная запись сотрудника", "2. учётная запись\nактивна?");
      check(5, "a", "Участие в проекте", "3. участие в проекте\nесть?");
      check(6, "p", "Проект и его репозитории", "4. собрать\nконтекст");
      s.panel([
        [
          "rule",
          "Проверки 1–3",
          "• идут на каждом запросе, срок токена не важен\n• любая не прошла: запрос отклонён\n• запрос, уже прошедший проверки, может завершиться",
        ],
        [
          "rule",
          "Контекст проекта",
          "• описание и репозитории проекта\n• источники инструкций и версия harness\n• выдаётся только участнику, администратору тоже\n• общий репозиторий не раскрывает другие проекты",
        ],
        [
          "rule",
          "Администратор без участия",
          "• видит и правит настройки проекта в управлении\n• контекст проекта не получает",
        ],
        [
          "rule",
          "Подключённый агент",
          "• получает то же, что разрешено его владельцу\n• только читает, административных операций нет",
        ],
      ]);
    },
  );
  y = reading.bottom + FRAME_GAP;

  // ---------- Block 3 ----------
  const block3 = frame("Блок 3", 0, y, "Блок 3. Персональное подключение агента", (x, top) => {
    let sy = top;

    let s = section(x, sy, "3А. Создание подключения", [lane("x"), lane("c")], 6);
    const c1 = sticky("command", s.at("x", 1), "1. Начать подключение");
    chip("actor", c1, "Сотрудник");
    const client = sticky("external", s.at("x", 2), "Клиент агента");
    const opened = sticky("event", s.at("x", 3), "Браузер открыт с запросом подключения");
    const consent = sticky("read", s.at("c", 3), "Запрос согласия: какой клиент и от чьего имени");
    const c2 = sticky("command", s.at("c", 4), "2. Подтвердить подключение");
    chip("actor", c2, "Сотрудник");
    chip("hotChip", c2, "H4");
    const connection = sticky("data", s.at("c", 5), "Подключение агента");
    const created = sticky("event", s.at("c", 6), "Подключение создано");
    arrow(c1, client);
    arrow(client, opened);
    arrow(opened, consent);
    arrow(consent, c2);
    arrow(c2, connection);
    arrow(connection, created);
    s.panel([
      [
        "rule",
        "Шаг 2",
        "• сотрудник вошёл в платформу, учётная запись активна\n• владелец подключения: тот, кто вошёл и подтвердил\n• администратор не подключает агента за сотрудника\n• у сотрудника может быть несколько подключений",
      ],
      ["rule", "P1 · предложено", "Каждое подтверждение создаёт новое подключение", { proposed: true }],
      ["rule", "P2 · предложено", "Подтверждать можно только на машине, где работает клиент", { proposed: true }],
      [
        "rule",
        "P3 · предложено",
        "Собственных ограничений у подключения нет: агент читает всё, что разрешено владельцу",
        { proposed: true },
      ],
      ["hot", "H4 · шаг 2", "Подключение подтверждено после прекращения доступа, но до доставки события"],
    ]);
    sy = s.bottom + SECTION_GAP;

    s = section(x, sy, "3Б. Отзыв подключения", [lane("e"), lane("c", 4)], 4);
    const terminated = sticky("event", s.at("e", 1), "Доступ к платформе прекращён");
    const conn = span("data", s.at("c", 3, 0), s.at("c", 3, 3), "Подключение агента");
    const revoked = span("event", s.at("c", 4, 0), s.at("c", 4, 2), "Подключение отозвано");
    const expired = sticky("event", s.at("c", 4, 3), "Подключение истекло", { proposed: true });
    const c3 = sticky("command", s.at("c", 2, 0), "3. Отозвать своё подключение");
    chip("actor", c3, "Сотрудник");
    const c4 = sticky("command", s.at("c", 2, 1), "4. Отозвать подключение сотрудника");
    chip("actor", c4, "Администратор");
    const onTerminated = sticky("policy", s.at("c", 1, 2), "Когда доступ к платформе прекращён");
    const c5 = sticky("command", s.at("c", 2, 2), "5. Отозвать все подключения сотрудника");
    const onIdle = sticky("policy", s.at("c", 1, 3), "Когда подключением не пользовались заданный срок", {
      proposed: true,
    });
    const c6 = sticky("command", s.at("c", 2, 3), "6. Закрыть неиспользуемое подключение", { proposed: true });
    arrow(terminated, onTerminated, { event: true });
    arrow(onTerminated, c5);
    arrow(onIdle, c6);
    for (const c of [c3, c4, c5, c6]) arrow(c, conn);
    for (const c of [c3, c4, c5]) arrow(conn, revoked, { y: c.cy });
    arrow(conn, expired);
    s.panel([
      [
        "rule",
        "Шаги 3–5",
        "• следующий запрос и обновление токена получают отказ\n• уже начатый запрос может завершиться\n• отозванное подключение не оживает\n• остальные подключения сотрудника работают",
      ],
      [
        "rule",
        "P1 · предложено",
        "Неиспользуемое подключение истекает. Срок зададут сессия о качестве (#53) или техническое проектирование (#56)",
        { proposed: true },
      ],
    ]);
  });

  // ---------- Agent connection lifecycle, beside block 3 ----------
  frame("Жизненный цикл подключения", block3.right + 130, y, "Жизненный цикл: подключение агента", (x, top) => {
    lifecycle(x, top, {
      start: "подтвердить в браузере",
      state: "Действует",
      finals: [
        { name: "Отозвано", label: "отозвать: сотрудник, администратор\nили прекращение доступа к платформе" },
        { name: "Истекло", label: "не использовалось заданный срок\n(P1, предложено)", proposed: true },
      ],
      note: "Справа конечные состояния. Восстановление учётной записи их не меняет: сотрудник создаёт новое подключение.",
    });
  });

  return kit.elements;
}
