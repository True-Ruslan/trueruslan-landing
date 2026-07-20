# TrueRuslan Landing — engineering portfolio

Персональное engineering-портфолио с лёгкой standalone-главной, Diplodoc knowledge pages, web-CV, инженерными case studies, Engineering Notes и production-oriented quality gates.

## Архитектура

Проект сознательно разделён на два слоя:

```text
Standalone homepage
  templates/index.html
        │
        ├── custom.css / standalone.css / home.css
        ├── progressive custom.js
        └── без Diplodoc/React runtime bundle

Diplodoc knowledge pages
  docs/landing/**/*.md
        │
        ├── toc / local search
        ├── theme.yaml
        ├── case studies / Engineering Notes / web-CV
        └── custom visual/accessibility layer

Build
  Diplodoc → docs-html
        ↓
  post-processing
        ├── assets
        ├── search-page normalization
        ├── standalone root index.html
        ├── deterministic OpenGraph PNG cards
        ├── per-page SEO/social metadata
        ├── sitemap / robots.txt
        └── JSON-LD
```

Главная не загружает тяжёлый Diplodoc viewer bundle. Diplodoc остаётся там, где он полезен: структурированный Markdown-контент, навигация, локальный поиск, case studies, Engineering Notes и документационные страницы.

## Возможности

- Lightweight standalone engineering landing page
- Dark-first visual identity: graphite + cyan + violet
- Diplodoc / Gravity UI для внутренних knowledge pages
- Custom CSS/JS без отдельного runtime frontend-фреймворка
- Progressive-enhancement terminal accent и микроанимации
- Web-CV + deployment-safe встроенный PDF
- Engineering case studies публичных проектов
- Engineering Notes с техническими разборами архитектуры, reliability и AI systems
- Build-time `Currently building` из валидируемого JSON manifest
- Локальный поиск и реестр технических материалов
- SEO: sitemap, robots.txt, canonical, page-specific OpenGraph/Twitter metadata и JSON-LD
- Детерминированные 1200×630 OpenGraph PNG без внешнего image service
- `prefers-reduced-motion`, keyboard focus и runtime accessibility repairs
- Проверка битых внутренних ссылок/assets/OG targets после реальной сборки
- Browser smoke для desktop/mobile и локального поиска
- Firefox/WebKit compatibility smoke поверх основного Chromium suite
- Browser-level metadata/OpenGraph smoke
- Axe accessibility и Lighthouse budgets
- Versioned perceptual visual-regression baseline
- Post-deploy smoke реального GitHub Pages endpoint, включая Notes и OG image
- Weekly monitoring внешних публичных ссылок и критичных production endpoint'ов
- Screenshots, Lighthouse/Axe/visual/metadata/health reports как CI artifacts

## Структура проекта

```text
templates/
└── index.html                       # Standalone homepage template

data/
├── currently-building.json          # Активные проекты для build-time homepage
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
│   │   ├── standalone.css
│   │   ├── home.css
│   │   └── resume.css
│   └── script/custom.js
├── landing/
│   ├── about.md
│   ├── resume.md
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
├── copy-assets.js
├── standalone-home.js
├── page-meta.js
├── og-image.js
├── search-page.js
├── seo.js
├── site-integrity.js
├── http-health.js
├── production-smoke.js
├── external-health.js
├── browser-quality.cjs
├── cross-browser-smoke.cjs
├── search-smoke.cjs
├── metadata-smoke.cjs
├── visual-regression.cjs
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
2. Assets копируются с сохранением путей.
3. Генерируемая страница локального поиска нормализуется для root/subpath deployments.
4. Корневой `docs-html/index.html` заменяется лёгкой standalone-главной из `templates/index.html`.
5. `data/page-meta.json` валидируется, после чего Node.js build-time renderer генерирует детерминированные `assets/og/*.png` размером 1200×630.
6. В финальный HTML инъектируются page-specific title, description, canonical, OpenGraph и Twitter metadata.
7. Генерируются `.nojekyll`, `robots.txt`, `sitemap.xml` и JSON-LD профиля.

OG renderer не требует браузера, внешнего image API или нового production dependency: PNG кодируется нативным Node.js кодом через `zlib`.

## Проверки качества

### Unit / contract tests

```bash
npm test
```

Покрыты assets, SEO/post-processing, standalone renderer, page-metadata manifest, deterministic PNG generation, local-search normalization, deployment-safe PDF URL, HTTP health policy, production-smoke URL contract, Lighthouse budgets и generated-site integrity helpers.

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
- generated local-search page в настоящем Chromium;
- page title/description/canonical/OpenGraph/Twitter metadata и фактическая доступность generated PNG cards;
- Lighthouse budgets: Performance ≥ 85, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95;
- homepage / projects / resume в Firefox и WebKit как компактный compatibility smoke.

### Visual regression

Шесть ключевых screenshots сравниваются с versioned perceptual baseline из `tests/visual-baselines.json`:

- homepage desktop/mobile;
- projects desktop/mobile;
- resume desktop/mobile.

CI блокирует существенное изменение геометрии или визуального fingerprint. Полные screenshots и diff/evidence сохраняются в artifact `quality-artifacts` на 14 дней. Baseline обновляется только после прохождения функциональных browser gates.

### Production smoke

После `actions/deploy-pages` workflow проверяет уже реальный опубликованный Pages URL: homepage, Projects, Engineering Notes, Resume, PDF, homepage OpenGraph PNG, core CSS/JS и favicon. Проверка повторяется несколько раз с backoff, чтобы отделить краткую propagation delay от устойчивой production-регрессии.

### External health

`.github/workflows/external-health.yml` запускается еженедельно и вручную. Он проверяет production endpoints, публичные профили и проектные ссылки из `data/external-links.json`, следует ограниченному числу redirect'ов, использует timeouts и сохраняет JSON/Markdown отчёт. 404/410/5xx/connectivity failures считаются actionable; ожидаемые anti-bot 401/403/429 считаются endpoint'ом, который существует, но ограничивает автоматический клиент.

## Визуальные слои

- `custom.css` — общая visual system, terminal и design tokens.
- `accessibility.css` — контраст и визуальное различие интерактивных элементов.
- `standalone.css` — shell/header/footer лёгкой главной.
- `home.css` — hero/cards/layout главной.
- `active-projects.css` — build-time `Currently building` cards.
- `resume.css` — изолированный web-CV visual layer.
- `custom.js` — progressive enhancement после загрузки приложения: PDF hydration, accessibility repair, terminal/reveal/pointer effects.

## Проекты / case studies

`docs/landing/projects.md` — portfolio hub. Подробные публичные разборы:

- LivingWorld — server-authoritative AI NPCs
- NODE ZERO — narrative/game systems architecture
- TaskHub — Backend + AI
- MiniChess — Java domain logic
- Godot Atmospheric Horror Template — agentic game development

MarketDB представлен только на безопасном публичном уровне без раскрытия внутренней коммерческой архитектуры. NODE ZERO сохраняет private/proprietary boundary; публичный case study не раскрывает закрытый исходный код.

## Engineering Notes

`docs/landing/notes.md` — technical-writing hub. Начальные материалы:

- runtime boundary между lightweight landing и Diplodoc knowledge layer;
- layered quality gates для статического production-сайта;
- server-authoritative AI NPC pipeline и trust boundaries.

Новые заметки добавляются как обычные Markdown-страницы и проходят тот же sitemap/search/metadata/quality pipeline, что и остальные knowledge pages.

## Добавление страницы

1. Создайте Markdown-файл в `docs/landing/`.
2. Добавьте ссылку в `docs/toc.yaml`.
3. Для high-value страницы добавьте запись в `data/page-meta.json`.
4. При необходимости добавьте переход с standalone homepage в `templates/index.html`.

Markdown-страницы из `toc.yaml` автоматически попадают в `sitemap.xml`. High-value страницы из `page-meta.json` автоматически получают отдельные social preview PNG и metadata.

## Добавление медиа

- Изображения — `docs/assets/images/`
- Диаграммы — `docs/assets/diagrams/`
- PDF и документы — `docs/assets/documents/`

## Деплой

- **Pull requests** — tests → build → integrity → Chromium/Axe/Lighthouse → Firefox/WebKit smoke → search smoke → metadata/OG smoke → visual regression → quality artifacts
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
