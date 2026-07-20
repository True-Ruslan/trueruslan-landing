# TrueRuslan Landing — персональный лендинг

Персональный engineering-портфолио на базе [Diplodoc](https://diplodoc.com/) с собственным визуальным слоем поверх стандартной документационной темы.

## Возможности

- Адаптивный Diplodoc / Gravity UI layout
- Собственная dark-first палитра через `theme.yaml`
- Custom CSS/JS без отдельного frontend-фреймворка
- Progressive-enhancement анимации и terminal accent
- Навигация между страницами через `toc.yaml`
- Markdown-контент с YFM-директивами
- Встроенный просмотр PDF-резюме
- Галерея изображений
- Реестр изученных технических материалов
- Локальный поиск
- SEO post-processing: sitemap, robots.txt и JSON-LD
- `prefers-reduced-motion` и keyboard-focus accessibility

## Визуальная архитектура

Редизайн не форкает Diplodoc и не редактирует сгенерированный UI вручную.

```text
Diplodoc / Gravity UI
        │
        ├── docs/theme.yaml
        │      └── базовая палитра и theme tokens
        │
        ├── docs/_assets/style/custom.css
        │      └── layout polish, cards, CTA, terminal, motion
        │
        ├── docs/_assets/script/custom.js
        │      └── progressive enhancement без зависимости контента от JS
        │
        └── docs/index.yaml
               └── Page Constructor composition
```

Основная визуальная идея: **clean engineering portfolio + restrained developer terminal aesthetic + subtle AI/futuristic accents**.

## Структура проекта

```text
docs/
├── index.yaml              # Главная страница (Page Constructor)
├── toc.yaml                # Верхнее и боковое меню
├── .yfm                    # Конфигурация Diplodoc и custom resources
├── theme.yaml              # Палитра Diplodoc
├── _assets/
│   ├── style/custom.css    # Собственный visual system
│   └── script/custom.js    # Progressive visual enhancements
├── landing/
│   ├── about.md
│   ├── resume.md
│   ├── projects.md
│   ├── photos.md
│   ├── bibliography.md
│   └── contacts.md
└── assets/
    ├── images/
    └── documents/

scripts/
├── serve.js                # Dev-сервер с hot reload
├── copy-assets.js          # Assets + общий post-processing сборки
├── seo.js                  # Sitemap/JSON-LD helpers
├── dark-theme.js           # Применение темной темы к HTML
├── visual-config.test.js   # Контракт темы/custom resources
└── visual-enhancements.test.js
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

Сайт: `http://localhost:8000`

Полный старт с пересборкой: `npm start`.

## Сборка

```bash
npm run build
# или
npm run build:docs
```

Результат сборки — `docs-html/`.

Сборка запускает Diplodoc с `--allow-custom-resources`, затем копирует статические файлы и выполняет post-processing HTML: dark theme compatibility, `robots.txt`, `sitemap.xml` и JSON-LD профиля.

## Тесты

```bash
npm test
```

Тесты проверяют обработку assets, SEO/post-processing, HTML-инъекции dev-сервера, visual configuration contract и deterministic helpers кастомного visual layer.

## Изменение визуального стиля

### Палитра

Базовые цвета меняются в `docs/theme.yaml`. Это предпочтительный способ для поддерживаемых Diplodoc theme tokens.

### Компоненты и эффекты

`docs/_assets/style/custom.css` содержит собственные `--tr-*` design tokens, карточки, CTA, background grid/glow, terminal panel, responsive и reduced-motion правила.

### Интерактивность

`docs/_assets/script/custom.js` используется только как progressive enhancement. Контент и навигация должны оставаться рабочими при отключённом JavaScript.

## Добавление страницы

1. Создайте файл в `docs/landing/`, например `blog.md`.
2. Добавьте ссылку в `docs/toc.yaml`.
3. При необходимости добавьте карточку на главную в `docs/index.yaml`.

Страницы, перечисленные как Markdown-ссылки в `toc.yaml`, автоматически попадают в `sitemap.xml`.

## Добавление медиа

- Изображения — `docs/assets/images/`
- PDF и документы — `docs/assets/documents/`

## Деплой

- **GitHub Pages** — `.github/workflows/static.yml`, production-деплой только из `master`
- **Docker** — `Dockerfile` + nginx, сборка образа через `.github/workflows/deploy.yaml`
- **Pull requests** — `.github/workflows/build.yml` запускает тесты и production-сборку

## Документация Diplodoc

- [Официальная документация](https://diplodoc.com/docs/)

## Контакты

- Telegram: [@TrueRuslan](https://t.me/TrueRuslan)
- GitHub Issues: [создать issue](https://github.com/True-Ruslan/trueruslan-landing/issues)

## Лицензия

Условия лицензирования проекта определены в файле [`LICENSE`](LICENSE).
