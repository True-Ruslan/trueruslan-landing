# TrueRuslan Landing — персональный лендинг

Персональный лендинг разработчика на базе [Diplodoc](https://diplodoc.com/).

## Возможности

- Адаптивный дизайн Diplodoc
- Навигация между страницами через `toc.yaml`
- Markdown-контент с YFM-директивами
- Встроенный просмотр PDF-резюме
- Галерея изображений
- Локальный поиск

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
│   └── contacts.md
└── assets/                 # Статические файлы
    ├── images/             # Фотографии для галереи
    └── documents/          # PDF и другие документы

scripts/
├── serve.js                # Dev-сервер с hot reload
└── copy-assets.js          # Копирование assets в docs-html
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

## Тесты

```bash
npm test
```

## Добавление страницы

1. Создайте файл в `docs/landing/`, например `blog.md`.
2. Добавьте ссылку в `docs/toc.yaml` (header, items).
3. Добавьте карточку на главную в `docs/index.yaml`.

## Добавление медиа

- Изображения — в `docs/assets/images/`, ссылки из markdown: `../assets/images/file.jpg`
- PDF и документы — в `docs/assets/documents/`

## Деплой

- **GitHub Pages** — workflow `.github/workflows/static.yml`
- **Docker** — `Dockerfile` (nginx + `docs-html`)

## Документация Diplodoc

- [Официальная документация](https://diplodoc.com/docs/)

## Контакты

- Telegram: [@TrueRuslan](https://t.me/TrueRuslan)
- GitHub Issues: [создать issue](https://github.com/True-Ruslan/trueruslan-landing/issues)

## Лицензия

MIT License
