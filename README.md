# TrueRuslan Landing — engineering portfolio

Персональное engineering-портфолио с лёгкой standalone-главной, Diplodoc knowledge pages, web-CV, инженерными case studies и production-oriented quality gates.

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
        ├── case studies / web-CV / bibliography
        └── custom visual/accessibility layer

Build
  Diplodoc → docs-html
        ↓
  post-processing
        ├── assets
        ├── search-page normalization
        ├── standalone root index.html
        ├── sitemap / robots.txt
        └── JSON-LD
```

Главная не загружает тяжёлый Diplodoc viewer bundle. Diplodoc остаётся там, где он полезен: структурированный Markdown-контент, навигация, локальный поиск, case studies и документационные страницы.

## Возможности

- Lightweight standalone engineering landing page
- Dark-first visual identity: graphite + cyan + violet
- Diplodoc / Gravity UI для внутренних knowledge pages
- Custom CSS/JS без отдельного runtime frontend-фреймворка
- Progressive-enhancement terminal accent и микроанимации
- Web-CV + deployment-safe встроенный PDF
- Engineering case studies публичных проектов
- Локальный поиск и реестр технических материалов
- SEO: sitemap, robots.txt, canonical/OpenGraph и JSON-LD
- `prefers-reduced-motion`, keyboard focus и runtime accessibility repairs
- Проверка битых внутренних ссылок/assets после реальной сборки
- Browser smoke для desktop/mobile и локального поиска
- Axe accessibility и Lighthouse budgets
- Versioned perceptual visual-regression baseline
- Screenshots, Lighthouse/Axe/visual reports как CI artifacts

## Структура проекта

```text
templates/
└── index.html                       # Standalone homepage template

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
│   │   ├── taskhub.md
│   │   ├── minichess.md
│   │   └── godot-horror-template.md
│   ├── photos.md
│   ├── bibliography.md
│   └── contacts.md
└── assets/
    ├── images/
    └── documents/

scripts/
├── serve.js
├── copy-assets.js
├── standalone-home.js
├── search-page.js
├── seo.js
├── site-integrity.js
├── browser-quality.cjs
├── search-smoke.cjs
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
5. Генерируются `.nojekyll`, `robots.txt`, `sitemap.xml` и JSON-LD профиля.

## Проверки качества

### Unit / contract tests

```bash
npm test
```

Покрыты assets, SEO/post-processing, standalone renderer, local-search normalization, visual configuration, deployment-safe PDF URL, Lighthouse budgets и generated-site integrity helpers.

### Generated-site integrity

```bash
npm run build:docs
npm run check:site
```

`check:site` анализирует готовый `docs-html`, учитывает HTML `<base href>` semantics и проверяет локальные `href`, `src`, iframe, scripts, stylesheets и media references. Битая ссылка или отсутствующий asset блокируют CI и deployment.

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
- Lighthouse budgets: Performance ≥ 85, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95.

### Visual regression

Шесть ключевых screenshots сравниваются с versioned perceptual baseline из `tests/visual-baselines.json`:

- homepage desktop/mobile;
- projects desktop/mobile;
- resume desktop/mobile.

CI блокирует существенное изменение геометрии или визуального fingerprint. Полные screenshots и diff/evidence сохраняются в artifact `quality-artifacts` на 14 дней.

## Визуальные слои

- `custom.css` — общая visual system, terminal и design tokens.
- `accessibility.css` — контраст и визуальное различие интерактивных элементов.
- `standalone.css` — shell/header/footer лёгкой главной.
- `home.css` — hero/cards/layout главной.
- `resume.css` — изолированный web-CV visual layer.
- `custom.js` — progressive enhancement после загрузки приложения: PDF hydration, accessibility repair, terminal/reveal/pointer effects.

## Проекты / case studies

`docs/landing/projects.md` — portfolio hub. Подробные публичные разборы:

- TaskHub — Backend + AI
- MiniChess — Java domain logic
- Godot Atmospheric Horror Template — agentic game development

MarketDB представлен только на безопасном публичном уровне без раскрытия внутренней коммерческой архитектуры.

## Добавление страницы

1. Создайте Markdown-файл в `docs/landing/`.
2. Добавьте ссылку в `docs/toc.yaml`.
3. При необходимости добавьте переход с standalone homepage в `templates/index.html`.

Markdown-страницы из `toc.yaml` автоматически попадают в `sitemap.xml`.

## Добавление медиа

- Изображения — `docs/assets/images/`
- PDF и документы — `docs/assets/documents/`

## Деплой

- **Pull requests** — tests → build → integrity → browser/Axe/Lighthouse → search smoke → visual regression → quality artifacts
- **GitHub Pages** — tests → build → integrity → deploy из `master`; `SITE_URL` задаётся под repository Pages URL
- **Docker** — tests → build → integrity → image publish

## Контакты

- Telegram: [@TrueRuslan](https://t.me/TrueRuslan)
- GitHub Issues: [создать issue](https://github.com/True-Ruslan/trueruslan-landing/issues)

## Лицензия

Условия лицензирования проекта определены в файле [`LICENSE`](LICENSE).
