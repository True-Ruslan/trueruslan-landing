# Почему главная портфолио — standalone, а knowledge pages остаются на Diplodoc

Когда я начал кастомизировать этот сайт, исходная архитектура была простой: весь контент собирался Diplodoc, а поверх него добавлялся собственный theme/CSS/JS слой.

Это удобно, пока сайт в первую очередь похож на документацию. Но персональное портфолио предъявляет другой набор требований к главной странице:

- быстрый first render;
- полный контроль над hero/navigation/cards;
- минимум JavaScript;
- предсказуемая SEO-разметка;
- отсутствие зависимости от внутренней DOM-структуры UI framework;
- при этом внутренние страницы всё ещё выигрывают от Markdown, toc и локального поиска.

## Первая попытка: просто глубже кастомизировать Diplodoc

На раннем этапе это работало достаточно хорошо:

```text
Diplodoc
   │
   ├── theme.yaml
   ├── custom.css
   ├── custom.js
   └── Page Constructor homepage
```

Но чем сильнее главная отличалась от документационной страницы, тем больше появлялось implicit coupling к generated markup.

CSS начинал зависеть от framework class names, а progressive JS — от момента, когда React уже успел смонтировать конкретный DOM.

## Симптом, который заставил пересмотреть границу

При добавлении `--static-content` возникло привлекательное ожидание: получить сразу готовый HTML и улучшить first render/SEO без изменения архитектуры.

Но в текущем viewer lifecycle появлялись React hydration mismatches.

Причину нельзя было честно решить таймерами вроде:

```text
DOMContentLoaded
  wait 100 ms
  maybe React is ready?
```

Это был бы workaround, а не контракт.

Если две системы считают один и тот же DOM своим source of truth, любое build-time или early-runtime изменение становится потенциальным конфликтом.

## Решение: разделить ownership

Вместо борьбы за один DOM архитектура была разделена:

```text
                build
                  │
        ┌─────────┴─────────┐
        │                   │
Standalone homepage   Diplodoc knowledge layer
        │                   │
static semantic HTML       Markdown
small CSS/JS               toc/search
full layout control        content structure
        │                   │
        └─────────┬─────────┘
                  ▼
              docs-html
```

Главная теперь рендерится из собственного template после основной Diplodoc-сборки.

Внутренние страницы продолжают использовать Diplodoc там, где он даёт реальную ценность:

- Markdown authoring;
- navigation/toc;
- local search;
- code/docs-friendly layout;
- структурированная knowledge base.

## Почему это лучше, чем переписать всё на React/Next/etc.

Потому что задача не требовала нового application framework.

Сайт остаётся статическим.

Нет необходимости добавлять:

- client-side router;
- runtime API;
- hydration всего сайта;
- framework-specific deployment;
- отдельный build graph ради нескольких страниц.

Главная получает ровно столько custom architecture, сколько ей нужно. Knowledge pages не теряют преимущества существующего инструмента.

Это пример принципа:

> **не заменять систему целиком, если проблема находится в одной границе ownership.**

## Quality gates стали частью архитектуры

После разделения важно было доказать, что post-processing не создаёт скрытых 404.

Поэтому release pipeline проверяет уже **готовый `docs-html`**, а не только source files:

```text
unit / contract tests
       ↓
Diplodoc build
       ↓
post-processing
       ↓
generated-site integrity
       ↓
Chromium browser QA
       ↓
Axe + Lighthouse
       ↓
Firefox / WebKit smoke
       ↓
search smoke
       ↓
visual regression
       ↓
deploy
       ↓
real production smoke
```

Это принципиальная разница.

Например корректный Markdown source ещё не означает, что после генерации `iframe src`, `<base href>`, search resources или repository subpath будут работать в production.

## Реальный пример: local search

Generated search page однажды содержала комбинацию resource URLs, которая по-разному интерпретировалась относительно `<base href>`.

Static integrity checker сначала дал false positives, потом после исправления модели URL обнаружил уже настоящий дефект generated output.

Правильным решением оказалось не добавить ignore-list вроде:

```text
ignore _bundle
ignore _assets
ignore search scripts
```

а нормализовать generated search page и продолжить требовать физическое существование каждого локального target.

Quality gate при этом остался строгим.

## Производительность как следствие архитектурной границы

Самый тяжёлый runtime bundle больше не нужен на главной.

Standalone landing загружает только собственные статические CSS/JS assets, а documentation runtime появляется там, где пользователь реально переходит к knowledge pages.

В проверенном Lighthouse run главная достигала:

```text
Performance       100
Accessibility     100
Best Practices    100
SEO               100
```

Важнее самих цифр другое: улучшение произошло не из-за «подкрутить Lighthouse», а после уменьшения архитектурной работы, которую браузер вообще обязан выполнять.

## Итоговый принцип

Архитектура этого сайта теперь выглядит гибридной, но граница простая:

```text
Marketing / identity / discovery
        → standalone static HTML

Long-form structured knowledge
        → Diplodoc
```

Мне нравится этот вариант именно потому, что он не максимизирует технологическую однородность.

Он максимизирует **ясность ownership**.

## Связанные материалы

- [Проекты](../projects.md)
- [LivingWorld case study](../projects/livingworld.md)
- [Web-CV](../resume.md)
