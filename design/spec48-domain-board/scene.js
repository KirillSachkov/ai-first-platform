// Domain board for spec #48 in Process Modelling EventStorming notation.
// Each frame answers one question. Lanes show the data owner, so stickies carry only glossary terms.
// Border style shows status: solid = owner-confirmed, dashed = proposed and waiting for the owner.
// Red stickies are open questions; their full text is in the "Открытые вопросы" frame.

const C = {
  actor: "#ffec99",
  command: "#a5d8ff",
  event: "#ffc078",
  policy: "#d0bfff",
  aggregate: "#fff3bf",
  external: "#fcc2d7",
  read: "#b2f2bb",
  hot: "#ff8787",
  rule: "#f3f0ff",
  edge: "#e9ecef",
  state: "#e7f5ff",
  lane: "#f8f9fa",
};

const SIZE = {
  actor: [130, 64],
  command: [170, 80],
  event: [170, 80],
  policy: [180, 80],
  aggregate: [170, 80],
  external: [150, 70],
  read: [190, 80],
  hot: [190, 70],
  rule: [260, 80],
  state: [140, 56],
  module: [250, 110],
};

const out = [];
const boxes = new Map();
let frameChildren = null;
let seq = 0;

const nextId = (p) => `${p}-${++seq}`;
const add = (el) => {
  out.push(el);
  if (frameChildren) frameChildren.push(el.id);
  return el.id;
};

function frame(name, draw) {
  frameChildren = [];
  draw();
  out.push({ type: "frame", id: nextId("frame"), name, children: frameChildren });
  frameChildren = null;
}

function box(id, kind, x, y, label, opts = {}) {
  const [w, h] = opts.size ?? SIZE[kind];
  boxes.set(id, { x, y, w, h });
  return add({
    type: "rectangle",
    id,
    x,
    y,
    width: w,
    height: h,
    backgroundColor: opts.bg ?? C[kind],
    fillStyle: "solid",
    strokeColor: kind === "hot" ? "#c92a2a" : "#868e96",
    strokeStyle: opts.proposed ? "dashed" : "solid",
    strokeWidth: opts.proposed ? 2 : 1,
    roughness: 0,
    roundness: kind === "state" ? { type: 3 } : null,
    label: {
      text: label,
      fontSize: opts.fontSize ?? 16,
      fontFamily: 2,
      textAlign: kind === "rule" ? "left" : "center",
      strokeColor: kind === "hot" ? "#7a1010" : "#212529",
    },
  });
}

function text(x, y, value, fontSize = 16, color = "#495057") {
  return add({ type: "text", id: nextId("t"), x, y, text: value, fontSize, fontFamily: 2, strokeColor: color });
}

// Horizontal swimlanes; returns the top y of each lane by key.
function lanes(x, y, width, defs) {
  const top = {};
  let cy = y;
  for (const [key, title, height] of defs) {
    add({
      type: "rectangle",
      id: nextId("lane"),
      x,
      y: cy,
      width,
      height,
      backgroundColor: C.lane,
      fillStyle: "solid",
      strokeColor: "#dee2e6",
      roughness: 0,
      locked: true,
    });
    text(x + 14, cy + 14, title, 17, "#495057");
    top[key] = cy;
    cy += height;
  }
  return top;
}

// Orthogonal arrow between two boxes: horizontal when the target is beside the source, vertical otherwise.
function link(from, to, label, opts = {}) {
  const a = boxes.get(from);
  const b = boxes.get(to);
  let s;
  let e;
  let pts;
  if (b.x - (a.x + a.w) > 15 || a.x - (b.x + b.w) > 15) {
    const right = b.x > a.x;
    s = [right ? a.x + a.w : a.x, a.y + a.h / 2 + (opts.sy ?? 0)];
    e = [right ? b.x : b.x + b.w, b.y + b.h / 2 + (opts.ey ?? 0)];
    const mx = opts.mx ?? (s[0] + e[0]) / 2;
    pts = [s, [mx, s[1]], [mx, e[1]], e];
  } else {
    const down = b.y > a.y;
    s = [a.x + a.w / 2 + (opts.sx ?? 0), down ? a.y + a.h : a.y];
    e = [b.x + b.w / 2 + (opts.ex ?? 0), down ? b.y : b.y + b.h];
    const my = opts.my ?? (s[1] + e[1]) / 2;
    pts = [s, [s[0], my], [e[0], my], e];
  }
  const clean = pts.filter((p, i) => i === 0 || p[0] !== pts[i - 1][0] || p[1] !== pts[i - 1][1]);
  const el = {
    type: "arrow",
    id: nextId("arrow"),
    x: s[0],
    y: s[1],
    points: clean.map((p) => [p[0] - s[0], p[1] - s[1]]),
    start: { id: from },
    end: { id: to },
    strokeColor: opts.event ? "#e8590c" : "#495057",
    strokeStyle: opts.event ? "dashed" : "solid",
    strokeWidth: 1.5,
    roughness: 0,
    roundness: null,
    endArrowhead: "arrow",
  };
  if (label) el.label = { text: label, fontSize: 15, fontFamily: 2 };
  return add(el);
}

// ---------- Legend ----------
frame("Легенда", () => {
  const items = [
    ["actor", "Участник"],
    ["command", "Действие"],
    ["event", "Событие"],
    ["policy", "Когда X, то Y"],
    ["aggregate", "Данные модуля"],
    ["external", "Внешняя система"],
    ["read", "Что видит участник"],
    ["rule", "Правило"],
    ["hot", "Открытый вопрос"],
  ];
  items.forEach(([kind, label], i) => box(`lg-${kind}`, kind, i * 160, -260, label, { size: [145, 56] }));
  box("lg-proposed", "rule", 0, -180, "Пунктир: предложено, ждёт владельца", { size: [300, 50], proposed: true });
  text(330, -168, "Сплошная рамка: подтверждено владельцем. Оранжевый пунктир: событие между модулями.", 16);
});

// ---------- Context: modules ----------
frame("Контекст: модули и их данные", () => {
  box("m-edge", "aggregate", 0, 150, "Edge\nвход · активность · разрешения", { bg: C.edge, size: [220, 90] });
  box("m-emp", "aggregate", 340, 0, "«Сотрудники»\nучётная запись сотрудника, приглашение, корпоративная личность", { size: SIZE.module });
  box("m-conn", "aggregate", 340, 290, "«Подключения агентов»\nподключение агента", { size: SIZE.module });
  box("m-acc", "aggregate", 720, 140, "«Доступ»\nучастие в проекте, полномочия администратора", { size: SIZE.module });
  box("m-proj", "aggregate", 1100, 140, "«Проекты»\nпроект, репозиторий, источник инструкций, версия harness", { size: SIZE.module });
  link("m-edge", "m-emp", "сессия", { mx: 270 });
  link("m-edge", "m-conn", "токен", { mx: 270 });
  link("m-edge", "m-acc", "разрешения", { sy: 0, ey: 0 });
  link("m-acc", "m-proj", "проекты");
  link("m-emp", "m-acc", "события", { event: true, mx: 650, ey: -30 });
  link("m-emp", "m-conn", null, { event: true, sx: -85, ex: -85 });
  text(395, 240, "доступ прекращён", 15, "#e8590c");
  text(720, 300, "«Доступ» не вызывает «Сотрудников»\nи «Подключения агентов» (ADR-0004).", 16);
});

// ---------- Open questions ----------
frame("Открытые вопросы и зависимости", () => {
  const list = [
    ["H1", "Единственный администратор потерял вход в IdP: аварийное восстановление управления. Техническое проектирование, #56."],
    ["H2", "Сколько сотрудник может ждать оформления участий. Сессия о качестве, #53."],
    ["H3", "Перепривязка корпоративной личности после пересоздания в IdP. Не в первой версии."],
    ["H4", "Деактивация раньше доставки событий: участия и подключения из этого окна тоже прекращаются. Механизм (поколение учётной записи) в #56."],
  ];
  list.forEach(([id, body], i) => {
    box(`oq-${id}`, "hot", 1500, i * 95, id, { size: [70, 70], fontSize: 18 });
    text(1590, i * 95 + 12, body, 16, "#212529");
  });
});

// ---------- Block 1: invitation and joining ----------
frame("Блок 1. Приглашение и присоединение сотрудника", () => {
  const Y = 650;
  const L = lanes(-40, Y, 4180, [
    ["p", "Участники", 160],
    ["o", "OIDC-провайдер", 160],
    ["e", "«Сотрудники»", 230],
    ["a", "«Доступ»", 190],
    ["r", "«Проекты»", 130],
  ]);
  const at = (lane, dy = 40) => L[lane] + dy;

  // First administrator invitation
  box("1-op", "actor", 220, at("p", 50), "Оператор");
  box("1-c", "command", 220, at("e", 25), "1. Выдать первое приглашение");
  box("1-ag", "aggregate", 430, at("e", 25), "Первое административное приглашение");
  box("1-ev", "event", 640, at("e", 25), "Первое приглашение выдано");
  box("1-rule", "rule", 430, at("e", 125), "• только пока нет активного администратора\n• повтор заменяет ссылку", { size: [380, 70] });
  box("1-h", "hot", 640, at("o", 45), "H1. Потерян вход администратора");
  link("1-op", "1-c");
  link("1-c", "1-ag");
  link("1-ag", "1-ev");

  // Invitation management
  box("2-adm", "actor", 940, at("p", 50), "Администратор");
  box("2-c", "command", 940, at("e", 25), "2. Выдать приглашение");
  box("2-ag", "aggregate", 1150, at("e", 25), "Приглашение");
  box("2-ev", "event", 1360, at("e", 25), "Приглашение выдано");
  box("3-c", "command", 940, at("e", 125), "3. Изменить проекты · заменить ссылку · отменить", { size: [170, 90] });
  box("3-ev", "event", 1360, at("e", 125), "Проекты изменены · ссылка заменена · отменено", { size: [170, 90] });
  box("2-rule", "rule", 1570, at("e", 15), "• не на адрес активной учётной записи\n• на адрес ждёт одно приглашение\n• срок фиксируется при выдаче", { size: [300, 95] });
  box("3-rule", "rule", 1570, at("e", 125), "• только пока приглашение ожидает\n• замена: новая ссылка и новый срок", { size: [300, 80] });
  link("2-adm", "2-c");
  link("2-c", "2-ag");
  link("2-ag", "2-ev");
  link("3-c", "2-ag", null, { mx: 1130 });
  link("2-ag", "3-ev", null, { mx: 1340 });

  // Acceptance and project memberships
  box("4-rc", "actor", 1960, at("p", 50), "Получатель приглашения");
  box("4-idp", "external", 1960, at("o", 45), "OIDC-провайдер");
  box("4-ev", "event", 2160, at("o", 40), "4. Личность подтверждена");
  box("5-c", "command", 2370, at("e", 25), "5. Принять приглашение");
  box("5-ag", "aggregate", 2580, at("e", 25), "Приглашение · учётная запись сотрудника");
  box("5-ev", "event", 2790, at("e", 25), "Приглашение принято");
  box("5-rej", "event", 2580, at("e", 130), "Принятие отклонено", { bg: "#ffe8cc" });
  box("5-rule", "rule", 2790, at("e", 115), "Отказ: чужой адрес, email не подтверждён или учётная запись уже есть. Приглашение ждёт дальше", { size: [175, 110], fontSize: 14 });
  box("5-id", "rule", 2160, at("e", 25), "Учётная запись связана с корпоративной личностью. Email нужен только при принятии", { size: [190, 120], fontSize: 15 });
  box("6-pol", "policy", 3000, at("a", 25), "Когда приглашение принято, оформить участия");
  box("6-c", "command", 3200, at("a", 25), "6. Оформить участия");
  box("6-ag", "aggregate", 3400, at("a", 25), "Участие в проекте");
  box("6-ev", "event", 3600, at("a", 25), "Участия оформлены");
  box("6-rule", "rule", 3000, at("a", 120), "Не перекрывает более позднее изменение участия и деактивацию", { size: [370, 56], fontSize: 15 });
  box("6-pr", "aggregate", 3400, at("r", 25), "Проект");
  box("7-rm", "read", 3800, at("p", 45), "7. Оформление участий: выполняется или готово");
  box("7-emp", "actor", 3800, at("o", 50), "Сотрудник");
  box("2-h", "hot", 3600, at("p", 45), "H2. Сколько можно ждать");
  box("3-h", "hot", 2370, at("p", 45), "H3. Перепривязка личности");
  box("4-h", "hot", 3800, at("a", 30), "H4. Деактивация раньше событий");

  link("4-rc", "4-idp");
  link("4-idp", "4-ev");
  link("4-ev", "5-c", null, { sx: 40 });
  link("5-c", "5-ag");
  link("5-ag", "5-ev");
  link("5-ag", "5-rej");
  link("5-ev", "6-pol", null, { event: true, mx: 2985 });
  link("6-pol", "6-c");
  link("6-c", "6-ag");
  link("6-ag", "6-ev");
  link("6-ag", "6-pr", "существует?");
  link("6-ev", "7-rm", null, { mx: 3785 });
  link("7-rm", "7-emp");
});

// ---------- Invitation lifecycle ----------
frame("Жизненный цикл: приглашение", () => {
  const Y = 1640;
  box("s-pend", "state", 0, Y + 110, "Ожидает", { size: [150, 60] });
  box("s-acc", "state", 360, Y, "Принято");
  box("s-can", "state", 360, Y + 112, "Отменено");
  box("s-exp", "state", 360, Y + 224, "Истекло");
  link("s-pend", "s-acc", "принять", { mx: 255 });
  link("s-pend", "s-can", "отменить", { mx: 255 });
  link("s-pend", "s-exp", "срок прошёл", { mx: 255 });
  text(0, Y + 200, "Замена ссылки и правка проектов\nоставляют приглашение ожидающим.", 16);
  text(560, Y + 110, "Конечные состояния:\nприглашение больше не меняется\nи не создаёт доступ.", 16);
});

// ---------- Block 2: projects and membership ----------
frame("Блок 2. Проекты и участие", () => {
  const Y = 2070;
  const L = lanes(-40, Y, 3000, [
    ["p", "Участники", 160],
    ["r", "«Проекты»", 340],
    ["a", "«Доступ»", 230],
  ]);
  const at = (lane, dy) => L[lane] + dy;

  box("p-adm", "actor", 220, at("p", 50), "Администратор");
  box("p1-c", "command", 220, at("r", 25), "1. Создать проект");
  box("p2-c", "command", 220, at("r", 125), "2. Связать репозиторий · убрать связь", { size: [170, 90] });
  box("p3-c", "command", 220, at("r", 235), "3. Изменить описание, источники, версию harness", { size: [170, 90] });
  box("p-ag", "aggregate", 450, at("r", 125), "Проект", { size: [170, 90] });
  box("p1-ev", "event", 680, at("r", 25), "Проект создан");
  box("p2-ev", "event", 680, at("r", 125), "Репозиторий связан · связь убрана", { size: [170, 90] });
  box("p3-ev", "event", 680, at("r", 235), "Проект изменён", { size: [170, 90] });
  box("p-repo", "aggregate", 900, at("r", 25), "Репозиторий");
  box("p-rule", "rule", 900, at("r", 125), "• репозиторий записан один раз на компанию, у него свои инструкции\n• проект может быть без репозиториев\n• версия harness необязательна: полный SHA общего harness", { size: [380, 120], fontSize: 15 });
  link("p-adm", "p1-c");
  link("p1-c", "p-ag", null, { mx: 420 });
  link("p2-c", "p-ag");
  link("p3-c", "p-ag", null, { mx: 420 });
  link("p-ag", "p1-ev", null, { mx: 650 });
  link("p-ag", "p2-ev");
  link("p-ag", "p3-ev", null, { mx: 650 });
  link("p2-ev", "p-repo", null, { mx: 875 });

  box("m-adm", "actor", 1380, at("p", 50), "Администратор");
  box("m4-c", "command", 1380, at("a", 25), "4. Добавить участника");
  box("m5-c", "command", 1380, at("a", 125), "5. Исключить участника");
  box("m-ag", "aggregate", 1590, at("a", 75), "Участие в проекте");
  box("m4-ev", "event", 1800, at("a", 25), "Участие добавлено");
  box("m5-ev", "event", 1800, at("a", 125), "Участие прекращено");
  box("m-rule", "rule", 2010, at("a", 20), "• только активный сотрудник\n• повтор ничего не меняет\n• действует со следующего запроса", { size: [280, 90], fontSize: 15 });
  box("m-h", "hot", 2010, at("a", 130), "H4. Добавлен в окне деактивации");
  link("m-adm", "m4-c");
  link("m4-c", "m-ag", null, { mx: 1570 });
  link("m5-c", "m-ag", null, { mx: 1570 });
  link("m-ag", "m4-ev", null, { mx: 1780 });
  link("m-ag", "m5-ev", null, { mx: 1780 });

  box("q-act", "actor", 2420, at("p", 50), "Сотрудник · подключённый агент", { size: [170, 64] });
  box("q-rm", "read", 2650, at("p", 45), "6. Контекст проекта");
  box("q-part", "aggregate", 2650, at("a", 25), "Участие в проекте");
  box("q-proj", "aggregate", 2650, at("r", 25), "Проект · репозитории");
  box("q-rule", "rule", 1960, at("r", 125), "• контекст только через участие, и для администратора тоже\n• администратор без участия видит настройки проекта в управлении\n• общий репозиторий не раскрывает другие проекты", { size: [440, 110], fontSize: 15 });
  link("q-act", "q-rm");
  link("q-rm", "q-proj", "данные", { sx: -40, ex: -40 });
  link("q-proj", "q-part", "участие есть?", { sx: 40, ex: 40 });
});

export const skeleton = out;
