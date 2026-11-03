# AI-first Platform

Платформа для совместной работы сотрудников и агентов: проекты, репозитории, инструкции и доступы компании в одном месте.

## Первая версия

- Учётные записи сотрудников и вход по приглашению.
- Проекты, объединяющие репозитории GitHub и инструкции.
- Доступ сотрудника и его агента к разрешённым проектам.
- Подготовка рабочего окружения агентом по инструкциям проекта, в том числе из репозиториев.
- Прекращение доступа сотрудника и его агента к сведениям платформы при увольнении.
- Дополнительный этап: модуль интеграций с GitHub для выдачи и отзыва доступа к репозиториям. Основная поставка использует заранее доступные репозитории.

Согласованные границы: [docs/first-version.md](docs/first-version.md). Предметная модель и приблизительные модули: [docs/domain-model.md](docs/domain-model.md). Термины: [DOMAIN.md](DOMAIN.md). Архитектурные решения: [docs/adr/](docs/adr/). Исходные требования: [customer-requirements.md](customer-requirements.md).

## Состояние проекта

Согласованы границы первой версии, предметная модель и модули. Готов каркас без бизнес-функций: монорепозиторий с backend (`apps/api`, TypeScript, NestJS, PostgreSQL, RabbitMQ) и frontend (`apps/web`, React SPA), запуск через Docker Compose, проверки готовности и проверки архитектурных границ. Решения о стеке и устройстве backend — в ADR 0002–0004. Способ входа сотрудника и подключения агента пока не выбран; открытые вопросы перечислены в документе модели.

## Начало работы

Нужны Node.js 26 (версия в `.node-version`), pnpm 12 и Docker с Compose.

```sh
git clone git@github.com:KirillSachkov/ai-first-platform.git
cd ai-first-platform
cp .env.example .env
pnpm install
```

### Запуск

- `docker compose up --wait` поднимает весь стек и завершается, когда все сервисы готовы. Frontend: <http://127.0.0.1:5173>, страница проверки связи с backend: <http://127.0.0.1:5173/system>.
- `docker compose watch` дополнительно переносит изменения кода в контейнеры `api` и `web` без пересборки.
- Для запуска приложений на хосте: `pnpm infra:up` поднимает только PostgreSQL и RabbitMQ, `pnpm db:migrate` применяет миграции, `pnpm dev` запускает backend и frontend.
- `docker compose down` останавливает стек; `docker compose down --volumes` дополнительно удаляет локальные данные.

Все сервисы слушают только `127.0.0.1`, порты задаются в `.env`.

### Проверки

Правила тестирования, виды тестов и образцы: [docs/agents/testing.md](docs/agents/testing.md). Почему тесты идут на настоящих PostgreSQL и RabbitMQ: [ADR-0005](docs/adr/0005-tests-at-public-seams-on-real-infrastructure.md).

| Команда | Что делает | Docker |
| --- | --- | --- |
| `pnpm check` | Все статические проверки, кроме gitleaks | нет |
| `pnpm test:unit` | Юнит-тесты backend и frontend | нет |
| `pnpm test` | Все тесты Vitest: юнит, интеграционные, компонентные | да |
| `pnpm test:e2e` | E2E-тесты Playwright на стеке Docker Compose | да |
| `pnpm smoke` | Отказ и восстановление PostgreSQL на стеке | да |
| `pnpm verify` | Проверка перед PR: `check` и тесты Vitest приложений, изменённых относительно `main` | да |
| `pnpm verify:full` | Повтор проверки `main`: все тесты, E2E, smoke, аудит зависимостей и gitleaks | да |

- `pnpm check` проверяет форматирование, запускает oxlint с проверкой типов и ошибками компилятора TypeScript 7, проверяет границы модулей backend (dependency-cruiser) и слоёв frontend (Steiger). Он также сверяет описание OpenAPI и клиент frontend с кодом и ищет неиспользуемые файлы, экспорты и зависимости (knip). Правила oxlint и причины исключений — в `packages/oxlint-config/`.
- Интеграционные тесты backend запускают PostgreSQL и RabbitMQ через Testcontainers. Локально контейнеры переиспользуются между запусками и worktree.
- Перед первым запуском компонентных и E2E-тестов установите браузер: `pnpm --filter @platform/e2e exec playwright install chromium`. Оба вида тестов используют одну версию Playwright и один Chromium.
- `pnpm test:e2e` поднимает стек через Docker Compose и запускает тесты из `e2e/`. Быстрый набор для PR: `pnpm test:e2e --grep @smoke`.
- `pnpm smoke` поднимает стек и проверяет готовность через прокси frontend. Затем останавливает PostgreSQL и проверяет, что backend отвечает 503 и восстанавливается без перезапуска.
- `pnpm test:e2e` и `pnpm smoke` требуют `.env` (`cp .env.example .env`) и оставляют стек запущенным. Остановите его командой `docker compose down`.
- Все worktree используют один стек Compose. Поэтому `pnpm test:e2e` и `pnpm smoke` берут общую для машины блокировку `/tmp/ai-first-platform-stack.lock`. Вторая команда ждёт, пока первая завершится. Блокировка снимается при выходе, в том числе при ошибке и Ctrl+C. Блокировку завершённого процесса следующий запуск снимает сам.
- `pnpm verify:full` требует установленный gitleaks: `brew install gitleaks`.
- `pnpm api:generate` — обновляет описание OpenAPI и клиент frontend после изменения endpoint-ов.
- `pnpm db:generate` — создаёт миграции модулей после изменения их схем Drizzle.

#### Уровни проверки

- Цикл TDD: один тестовый файл, `pnpm exec vitest run <файл>` в `apps/api` или `apps/web`.
- Перед PR: `pnpm verify`.
- CI в PR: статические проверки и gitleaks по diff всегда. Тесты backend и frontend, E2E с тегом `@smoke` и аудит зависимостей идут только при изменениях соответствующих частей. Обязательная проверка одна — `ci-ok`.
- CI после merge в `main`: все тесты, все E2E, smoke, аудит и gitleaks по всей истории. При падении CI открывает issue с меткой `bug`.

## Работа с репозиторием

- Основная ветка — `main`. Для изменений создавайте отдельные ветки и pull requests.
- Ruleset GitHub защищает `main` без исключений: только через PR, только squash merge, обязательна зелёная проверка `ci-ok` на актуальной ветке. Force push и удаление запрещены. Команда `pnpm github:protect-main` повторно применяет ruleset и настройки репозитория.
- Каждый PR принимает владелец. Агент может выполнить merge после явного разрешения владельца в этом PR для указанного SHA. Подробности: [правила доставки](docs/agents/delivery.md#main-and-owner-acceptance). Вход для агента: [AGENTS.md](AGENTS.md).
- Фиксируйте `pnpm-lock.yaml` в Git.
- Храните секреты в локальных `.env`-файлах; документируйте нужные переменные в `.env.example` без реальных значений.
- Добавляйте инструкции запуска и проверки одновременно с соответствующим кодом.
