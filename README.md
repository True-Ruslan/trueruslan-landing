# TrueRuslan Landing — engineering portfolio

Персональное engineering-портфолио на базе [Diplodoc](https://diplodoc.com/) с собственным визуальным слоем, web-CV, инженерными case studies и production-oriented quality gates.

## Возможности

- Адаптивный Diplodoc / Gravity UI layout
- Собственная dark-first палитра через `theme.yaml`
- Custom CSS/JS без отдельного frontend-фреймворка
- Progressive-enhancement анимации и terminal accent
- Web-CV + deployment-safe встроенный PDF
- Инженерные case studies публичных проектов
- Локальный поиск и реестр технических материалов
- SEO post-processing: sitemap, robots.txt и JSON-LD
- `prefers-reduced-motion` и keyboard-focus accessibility
- Проверка битых внутренних ссылок и assets после реальной сборки
- Browser smoke на desktop/mobile, axe accessibility, screenshots и Lighthouse budgets в PR CI

## Визуальная архитектура

Редизайн не форкает Diplodoc и не редактирует сгенерированный UI вручную.

```text
Diplodoc / Gravity UI
        │
        ├── docs/theme.yaml
        │      └── базовая палитра и theme tokens
        ├── docs/_assets/style/custom.css
        │      └── общая visual system
        ├── docs/_assets/style/resume.css
        │      └── изолированный web-CV visual layer
        ├── docs/_assets/script/custom.js
        │      └── progressive enhancement без зависимости контента от JS
        └── docs/index.yaml
               └── Page Constructor composition
```

Основная визуальная идея: **clean engineering portfolio + restrained developer terminal aesthetic + subtle AI/futuristic accents**.

## Структура проекта

```text
docs/
├── index.yaml
├── toc.yaml
├── .yfm
├── theme.yaml
├── _assets/
│   ├── style/
│   │   ├── custom.css
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
├── seo.js
├── dark-theme.js
├── site-integrity.js
├── browser-quality.cjs
├── lighthouse-budget.js
└── *.test.js
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

Результат — `docs-html/`. Diplodoc запускается с `--allow-custom-resources`, затем выполняются копирование assets и post-processing HTML: dark-theme compatibility, `robots.txt`, `sitemap.xml` и JSON-LD профиля.

## Проверки качества

### Unit / contract tests

```bash
npm test
```

Проверяются assets, SEO/post-processing, dev-server HTML-инъекции, visual configuration, deployment-safe PDF URL и deterministic helpers визуального слоя.

### Generated-site integrity

```bash
npm run build:docs
npm run check:site
```

`check:site` анализирует именно готовый `docs-html` и проверяет локальные `href`, `src`, iframe, scripts, stylesheets и media references. Битая ссылка или отсутствующий asset блокируют CI/deploy.

### Browser quality gate

PR workflow дополнительно устанавливает pinned quality tools изолированно в `.quality-tools` без изменения production dependency graph:

- Playwright `1.61.1`
- `@axe-core/playwright` `4.12.1`
- Lighthouse `13.4.0`

Проверяются:

- homepage / projects / resume в desktop и mobile viewport;
- HTTP failures и browser page errors;
- horizontal overflow;
- инициализация custom visual layer;
- фактическая доступность PDF через hydrated iframe URL;
- serious/critical axe violations;
- Lighthouse budgets: Performance ≥ 85, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95.

На каждый PR сохраняются screenshots и JSON reports в artifact `quality-artifacts` на 14 дней.

Локальный запуск browser gate:

```bash
npm install --prefix .quality-tools --package-lock=false --no-save \
  playwright@1.61.1 @axe-core/playwright@4.12.1 lighthouse@13.4.0
node scripts/browser-quality.cjs
```

## Изменение визуального стиля

### Палитра

Базовые цвета меняются в `docs/theme.yaml` через поддерживаемые Diplodoc theme tokens.

### Общие компоненты и эффекты

`docs/_assets/style/custom.css` содержит `--tr-*` design tokens, карточки, CTA, background grid/glow, terminal panel, responsive и reduced-motion правила.

### Web-CV

`docs/_assets/style/resume.css` изолирует стили резюме от общего visual system, чтобы развитие CV не увеличивало риск регрессии остальных страниц.

### Интерактивность

`docs/_assets/script/custom.js` используется только как progressive enhancement. Контент и навигация остаются рабочими при отключённом JavaScript.

## Добавление страницы

1. Создайте файл в `docs/landing/`.
2. Добавьте ссылку в `docs/toc.yaml`.
3. При необходимости добавьте карточку на главную в `docs/index.yaml`.

Markdown-страницы из `toc.yaml` автоматически попадают в `sitemap.xml`.

## Добавление медиа

- Изображения — `docs/assets/images/`
- PDF и документы — `docs/assets/documents/`

## Деплой

- **Pull requests** — `.github/workflows/build.yml`: tests → build → integrity → browser/a11y/Lighthouse → quality artifacts
- **GitHub Pages** — `.github/workflows/static.yml`: tests → build → integrity → deploy из `master`
- **Docker** — `.github/workflows/deploy.yaml`: tests → build → integrity → image publish

## Документация Diplodoc

- [Официальная документация](https://diplodoc.com/docs/)

## Контакты

- Telegram: [@TrueRuslan](https://t.me/TrueRuslan)
- GitHub Issues: [создать issue](https://github.com/True-Ruslan/trueruslan-landing/issues)

## Лицензия

Условия лицензирования проекта определены в файле [`LICENSE`](LICENSE).
