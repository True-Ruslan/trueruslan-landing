# TrueRuslan Landing — персональный лендинг

Персональный лендинг разработчика на базе [Diplodoc](https://diplodoc.com/).

## Возможности

- Адаптивный дизайн Diplodoc
- Навигация между страницами через `toc.yaml`
- Markdown-контент с YFM-директивами
- Встроенный просмотр PDF-резюме
- Галерея изображений
- Реестр изученных технических материалов
- Локальный поиск
- SEO post-processing: sitemap, robots.txt и JSON-LD

## Структура проекта

```
docs/
├── index.yaml              # Главная страница (page constructor)
├── toc.yaml                # Верхнее и боковое меню
├── .yfm                    # Конфигурация Diplodoc
├── landing/                # Контентные страницы
│   ├── about.md
│   ├── resume.md
│   ├── projects.md
│   ├── photos.md
│   ├── bibliography.md
│   └── contacts.md
└── assets/                 # Статические файлы
    ├── images/             # Фотографии для галереи
    └── documents/          # PDF и другие документы

scripts/
├── serve.js                # Dev-сервер с hot reload
├── copy-assets.js          # Assets + общий post-processing сборки
├── seo.js                  # Sitemap/JSON-LD helpers
└── dark-theme.js           # Применение темной темы к HTML
```

## Требования

- Node.js 24+
- npm 11.5.1+

## Установка и запуск

```bash
npm install
npm run build:docs   # первичная сборка
npm run dev          # dev-сервер с hot reload
```

Сайт: http://localhost:8000

Полный старт с пересборкой: `npm start`

## Сборка

```bash
npm run build
# или
npm run build:docs
```

Результат сборки — каталог `docs-html/`.

Сборка включает копирование статических файлов и post-processing HTML: темную тему, `robots.txt`, `sitemap.xml` и JSON-LD профиля.

## Тесты

```bash
npm test
```

Тесты проверяют обработку assets, SEO/post-processing и HTML-инъекции dev-сервера.

## Добавление страницы

1. Создайте файл в `docs/landing/`, например `blog.md`.
2. Добавьте ссылку в `docs/toc.yaml`.
3. При необходимости добавьте карточку на главную в `docs/index.yaml`.

Страницы, перечисленные как Markdown-ссылки в `toc.yaml`, автоматически попадают в `sitemap.xml`.

## Добавление медиа

- Изображения — в `docs/assets/images/`, ссылки из Markdown: `../assets/images/file.jpg`
- PDF и документы — в `docs/assets/documents/`

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
