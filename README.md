# TrueRuslan Landing — engineering portfolio

Персональное engineering-портфолио с лёгкой standalone-главной, Diplodoc knowledge pages, web-CV, инженерными case studies, живой страницей `/now`, Engineering Notes, интерактивной Engineering Map и production-oriented quality gates.

## Архитектура

Проект сознательно разделён на два слоя:

```text
Standalone homepage
  templates/index.html
        │
        ├── custom.css / standalone.css / home.css
        ├── progressive custom.js + command-palette.js
        └── без Diplodoc/React runtime bundle

Diplodoc knowledge pages
  docs/landing/**/*.md
        │
        ├── toc / local search
        ├── theme.yaml
        ├── case studies / Now / Engineering Notes / Engineering Map / web-CV
        └── custom visual/accessibility layer

Canonical data
  data/*.json
        │
        ├── projects.json — project identity/status/links/tags
        ├── project-history/*.json — flagship timelines
        ├── now.json — focus/learning/writing copy only
        ├── notes.json — note metadata/relations
        ├── engineering-graph.json
        └── page-meta.json

Build
  Diplodoc → docs-html
        ↓
  post-processing
        ├── assets + search-page normalization
        ├── standalone root index.html from Project Registry
        ├── registry-derived project statuses + /now
        ├── project timelines + Engineering Notes metadata/navigation
        ├── deterministic Atom feed.xml
        ├── Engineering Map state-payload injection
        ├── deterministic OpenGraph PNG cards
        ├── per-page SEO/social metadata
        ├── sitemap / robots.txt
        └── JSON-LD
```

Главная не загружает тяжёлый Diplodoc viewer bundle. Diplodoc остаётся там, где он полезен: структурированный Markdown-контент, навигация, локальный поиск, case studies, Engineering Notes, Engineering Map и документационные страницы.

Ключевой принцип текущей архитектуры: **static-first + build-time intelligence + progressive enhancement**. Core content не требует runtime API или client-side fetch.

## Возможности

- Lightweight standalone engineering landing page
- Dark-first visual identity: graphite + cyan + violet
- Diplodoc / Gravity UI для внутренних knowledge pages
- Custom CSS/JS без отдельного runtime frontend-фреймворка
- Progressive-enhancement terminal accent, микроанимации и global Cmd/Ctrl+K navigation
- Единый валидируемый `Project Registry` вместо дублирующих project-status manifests
- Build-time активные проекты на homepage и `/now` из одного canonical source
- First-class `/now`: активные проекты + отдельные focus/learning/writing данные
- Structured project timelines для LivingWorld и NODE ZERO
- Web-CV + deployment-safe встроенный PDF
- Engineering case studies публичных проектов
- Engineering Notes с reading time, датами, тегами, related/previous/next navigation
- Детерминированный Atom feed `feed.xml` без внешнего feed service
- Интерактивная Engineering Map: стек → инженерные домены → реальные проекты → Notes
- Локальный Diplodoc search; command palette только передаёт полнотекстовый поиск существующему index
- SEO: sitemap, robots.txt, canonical, page-specific OpenGraph/Twitter metadata и JSON-LD
- Детерминированные 1200×630 OpenGraph PNG без внешнего image service
- `prefers-reduced-motion`, keyboard focus и runtime accessibility repairs
- Проверка битых внутренних ссылок/assets/OG targets после реальной сборки
- Browser smoke для desktop/mobile и локального поиска
- Dedicated v0.3 browser/Axe smoke для `/now`, timelines и command palette
- Firefox/WebKit compatibility smoke поверх основного Chromium suite
- Browser-level metadata/OpenGraph smoke
- Dedicated Engineering Map interaction + component-scoped Axe smoke
- Axe accessibility и Lighthouse budgets
- Versioned perceptual visual-regression baseline для 8 ключевых экранов
- Post-deploy smoke реального GitHub Pages endpoint, включая Now, Notes/feed, Map и OG images
- Weekly monitoring внешних публичных ссылок и критичных production endpoint'ов
- Screenshots, Lighthouse/Axe/visual/metadata/health reports как CI artifacts

## Структура проекта

```text
templates/
└── index.html                       # Standalone homepage template

data/
├── projects.json                    # Canonical project registry
├── project-history/
│   ├── livingworld.json             # Structured LivingWorld timeline
│   └── node-zero.json               # Structured NODE ZERO timeline
├── now.json                         # Current focus/learning/writing copy
├── notes.json                       # Engineering Notes metadata + relations
├── engineering-graph.json           # Technology/domain/project/note graph
├── page-meta.json                   # Page title/description/OG/Twitter manifest
└── external-links.json              # Мониторинг внешних/public endpoint'ов

docs/
├── index.md                         # Корневой источник/контент для Diplodoc
├── toc.yaml
├── .yfm
├── theme.yaml
├── _assets/
│   ├── style/
│   │   ├── custom.css
│   │   ├── accessibility.css
│   │   ├── content-flow.css
│   │   ├── standalone.css
│   │   ├── home.css
│   │   ├── active-projects.css
│   │   ├── journal.css
│   │   ├── project-timeline.css
│   │   ├── command-palette.css
│   │   ├── engineering-graph.css
│   │   └── resume.css
│   └── script/
│       ├── custom.js
│       ├── command-palette.js
│       └── engineering-graph.js
├── landing/
│   ├── about.md
│   ├── resume.md
│   ├── now.md
│   ├── engineering-map.md
│   ├── projects.md
│   ├── projects/
│   │   ├── livingworld.md
│   │   ├── node-zero.md
│   │   ├── taskhub.md
│   │   ├── minichess.md
│   │   └── godot-horror-template.md
│   ├── notes.md
│   ├── notes/
│   │   ├── portfolio-runtime-boundary.md
│   │   ├── static-site-quality-gates.md
│   │   └── server-authoritative-ai-npcs.md
│   ├── photos.md
│   ├── bibliography.md
│   └── contacts.md
└── assets/
    ├── images/
    ├── diagrams/
    └── documents/

scripts/
├── serve.js
├── copy-assets.js                   # Main deterministic post-processing boundary
├── project-registry.js
├── now-page.js
├── project-timeline.js
├── notes-content.js
├── standalone-home.js
├── engineering-graph.js
├── page-meta.js
├── og-image.js
├── search-page.js
├── seo.js
├── site-integrity.js
├── http-health.js
├── production-smoke.js
├── external-health.js
├── browser-quality.cjs
├── v03-browser-smoke.cjs
├── cross-browser-smoke.cjs
├── search-smoke.cjs
├── metadata-smoke.cjs
├── engineering-graph-smoke.cjs
├── visual-regression.cjs
├── visual-baseline.cjs
├── lighthouse-budget.js
└── *.test.js

tests/
└── visual-baselines.json
```

## Требования

- Node.js 24+
- npm 11.5.1+

## Установка и запуск

```bash
npm install
npm run build:docs
npm run dev
```

Сайт: `http://localhost:8000`. Полный старт с пересборкой: `npm start`.

## Сборка

```bash
npm run build
# или
npm run build:docs
```

Сборка:

1. Diplodoc генерирует `docs-html` с поддержкой custom resources.
2. Assets копируются с сохранением путей, local-search page нормализуется для root/subpath deployments.
3. `data/projects.json` валидируется как canonical project source; неизвестные статусы, duplicate slugs, unsafe links и отсутствующие timeline manifests блокируют build.
4. Корневой `docs-html/index.html` заменяется лёгкой standalone-главной из `templates/index.html`, active projects берутся из Project Registry.
5. Registry-derived statuses инъектируются в Projects hub; `/now` собирается из registry + `data/now.json` без дублирования project status.
6. `data/project-history/*.json` валидируется и превращается в semantic timelines LivingWorld/NODE ZERO.
7. `data/notes.json` валидируется; note pages получают metadata и related/previous/next navigation, затем генерируется deterministic `feed.xml`.
8. `data/engineering-graph.json` валидируется; semantic fallback инъектируется в официальный `diplodoc-state` content payload страницы Engineering Map до client hydration.
9. `data/page-meta.json` валидируется, после чего Node.js build-time renderer генерирует детерминированные `assets/og/*.png` размером 1200×630.
10. В финальный HTML инъектируются page-specific title, description, canonical, OpenGraph/Twitter metadata, Atom feed discovery и JSON-LD.
11. Генерируются `.nojekyll`, `robots.txt` и `sitemap.xml`.

OG renderer не требует браузера, внешнего image API или нового production dependency: PNG кодируется нативным Node.js кодом через `zlib`.

Engineering Map также не использует runtime API или graph-library. Build-time слой создаёт semantic fallback и embedded JSON, а отдельный vanilla JS resource прогрессивно превращает их в интерактивную карту после штатной hydration Diplodoc.

Command palette не является второй search implementation: он фильтрует только небольшой статический список быстрых переходов, а команда `Поиск по сайту` открывает существующий generated Diplodoc local-search endpoint.

## Project Registry

`data/projects.json` — единственный hand-maintained источник для project identity/status/summary/links/tags и признака активности.

Его используют:

- homepage `Сейчас в работе`;
- `/landing/now.html`;
- status badges на Projects hub;
- timeline references и связанные build-time validators.

Отдельного `currently-building.json` больше нет. Если меняется статус проекта, он меняется один раз в registry.

## `/now`

`data/now.json` хранит только данные, которые не являются project state:

- дату обновления;
- текущий общий focus;
- что изучаю;
- что пишу.

Активные проекты и их статусы всегда выводятся из Project Registry.

## Проверки качества

### Unit / contract tests

```bash
npm test
```

Покрыты assets, SEO/post-processing, Project Registry, `/now`, project timelines, Engineering Notes metadata/feed, command-palette routing, standalone renderer, Engineering Map validation/injection, page metadata, deterministic PNG generation, local-search normalization, deployment-safe PDF URL, HTTP health policy, production-smoke contract, visual-baseline codec, Lighthouse budgets и generated-site integrity helpers.

### Generated-site integrity

```bash
npm run build:docs
npm run check:site
```

`check:site` анализирует готовый `docs-html`, учитывает HTML `<base href>` semantics и проверяет локальные `href`, `src`, iframe, scripts, stylesheets, media references и локальные targets сгенерированных OpenGraph image. Битая ссылка или отсутствующий asset блокируют CI и deployment.

### Browser / accessibility / performance gate

PR workflow изолированно устанавливает pinned quality tools в `.quality-tools`, не меняя production dependency graph:

- Playwright `1.61.1`
- `@axe-core/playwright` `4.12.1`
- Lighthouse `13.4.0`
- `pngjs` `7.0.0`

Проверяются:

- homepage / projects / resume в desktop и mobile viewports;
- HTTP failures и browser page errors;
- horizontal overflow;
- progressive visual layer;
- фактическая доступность Resume PDF как `application/pdf`;
- serious/critical axe violations;
- `/now` с registry-derived active projects;
- LivingWorld/NODE ZERO timelines с `past/current/next` milestones;
- Cmd/Ctrl+K palette: focus, Escape restore и handoff в существующий Diplodoc search;
- generated local-search page в настоящем Chromium;
- page title/description/canonical/OpenGraph/Twitter metadata и доступность generated PNG cards;
- Engineering Map desktop/mobile: hydration-enhancement, filters, node selection/detail, overflow и component-scoped Axe;
- Lighthouse budgets: Performance ≥ 85, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95;
- homepage / projects / resume в Firefox и WebKit как компактный compatibility smoke.

### Visual regression

Восемь ключевых screenshots сравниваются с versioned perceptual baseline из `tests/visual-baselines.json`:

- homepage desktop/mobile;
- projects desktop/mobile;
- resume desktop/mobile;
- Engineering Map desktop/mobile.

CI блокирует существенное изменение геометрии или визуального fingerprint. Baselines хранят lossless-deflate RGB samples с обязательной проверкой длины, поэтому повреждённый baseline не может превратиться в некорректное `NaN`-сравнение. Полные screenshots и diff/evidence сохраняются в artifact `quality-artifacts` на 14 дней. Baseline обновляется только после прохождения функциональных browser gates.

### Production smoke

После `actions/deploy-pages` workflow проверяет реальный опубликованный Pages URL: homepage, Projects, Now, Engineering Map, Engineering Notes, Atom feed, Resume/PDF, ключевые OG PNG, core CSS/JS, command-palette resources и favicon. Feed дополнительно проверяется по identity markers, а не только по HTTP 200.

### External health

`.github/workflows/external-health.yml` запускается еженедельно и вручную. Он проверяет production endpoints, публичные профили и project links из `data/external-links.json`, следует ограниченному числу redirect'ов, использует timeouts и сохраняет JSON/Markdown отчёт. 404/410/5xx/connectivity failures считаются actionable; ожидаемые anti-bot 401/403/429 считаются endpoint'ом, который существует, но ограничивает автоматический клиент.

## Визуальные слои

- `custom.css` — общая visual system, terminal и design tokens.
- `accessibility.css` — контраст и визуальное различие интерактивных элементов.
- `standalone.css` — shell/header/footer лёгкой главной.
- `home.css` — hero/cards/layout главной.
- `active-projects.css` — registry-derived active project cards.
- `journal.css` — `/now`, note metadata/navigation и компактные journal surfaces.
- `project-timeline.css` — semantic flagship timelines.
- `command-palette.css` — progressive global navigation dialog.
- `engineering-graph.css` — deterministic grid, edge layer, filters, node/detail states и responsive fallback Engineering Map.
- `resume.css` — изолированный web-CV visual layer.
- `custom.js` — общие progressive repairs/effects после загрузки приложения.
- `command-palette.js` — быстрые переходы и keyboard flow; не реализует full-text search.
- `engineering-graph.js` — изолированный progressive enhancement Engineering Map без runtime fetch.

## Проекты / case studies

`docs/landing/projects.md` — portfolio hub. Подробные публичные разборы:

- LivingWorld — server-authoritative AI NPCs
- NODE ZERO — narrative/game systems architecture
- TaskHub — Backend + AI
- MiniChess — Java domain logic
- Godot Atmospheric Horror Template — agentic game development

LivingWorld и NODE ZERO получают timeline из `data/project-history/`, а их status badges на Projects hub — из `data/projects.json`.

MarketDB представлен только на безопасном публичном уровне без раскрытия внутренней коммерческой архитектуры. NODE ZERO сохраняет private/proprietary boundary; публичный case study не раскрывает закрытый исходный код.

## Engineering Map

`docs/landing/engineering-map.md` показывает связи, а не просто перечень навыков:

```text
technology → engineering domain → project → technical note
```

Источник истины — `data/engineering-graph.json`. В нём заданы узлы, explicit grid coordinates, фильтры и отношения. Validator запрещает duplicate/orphan/missing-edge/self-edge/unsafe-link состояния.

Без JavaScript посетитель получает semantic grouped fallback с реальными ссылками. После hydration отдельный progressive resource добавляет фильтры `Backend / AI / Reliability / GameDev`, SVG edge layer, neighborhood highlighting и live detail panel. На узком экране рёбра скрываются, а узлы переходят в обычную карточную сетку.

## Engineering Notes

`docs/landing/notes.md` — technical-writing hub. Метаданные заметок находятся в `data/notes.json`: даты, reading time, tags и explicit related-note relations.

Начальные материалы:

- runtime boundary между lightweight landing и Diplodoc knowledge layer;
- layered quality gates для статического production-сайта;
- server-authoritative AI NPC pipeline и trust boundaries.

Build-time слой добавляет note metadata и previous/next/related navigation, а также детерминированно генерирует Atom `feed.xml`. Новая заметка остаётся обычной Markdown-страницей и проходит тот же sitemap/search/metadata/quality pipeline.

## Добавление страницы

1. Создайте Markdown-файл в `docs/landing/`.
2. Добавьте ссылку в `docs/toc.yaml`.
3. Для high-value страницы добавьте запись в `data/page-meta.json`.
4. Для Engineering Note добавьте metadata entry в `data/notes.json`.
5. При необходимости добавьте переход с standalone homepage в `templates/index.html`.

Markdown-страницы из `toc.yaml` автоматически попадают в `sitemap.xml`. High-value страницы из `page-meta.json` автоматически получают отдельные social preview PNG и metadata.

## Добавление медиа

- Изображения — `docs/assets/images/`
- Диаграммы — `docs/assets/diagrams/`
- PDF и документы — `docs/assets/documents/`

## Деплой

- **Pull requests** — tests → build → integrity → Chromium/Axe/Lighthouse → v0.3 navigation/timeline smoke → Firefox/WebKit → search → metadata/OG → Engineering Map → visual regression → quality artifacts
- **GitHub Pages** — tests → build → integrity → deploy из `master` → production smoke реального опубликованного URL
- **External health** — еженедельная проверка production/public внешних endpoint'ов
- **Docker** — tests → build → integrity → image publish

## Контакты

- Telegram: [@TrueRuslan](https://t.me/TrueRuslan)
- GitHub Issues: [создать issue](https://github.com/True-Ruslan/trueruslan-landing/issues)

## Лицензирование

Исходный код, build/test tooling и CI-конфигурация лицензируются по **MIT License** — см. [`LICENSE`](LICENSE).

CV, персональные фотографии, биографический/профильный текст и другие персональные материалы не передаются по MIT License и остаются защищёнными авторским правом, если явно не указано обратное. Подробности — [`CONTENT-LICENSE.md`](CONTENT-LICENSE.md).

Сторонние материалы и assets регулируются собственными лицензиями и notices их правообладателей.
