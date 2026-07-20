# Почему я отделил landing page от Diplodoc runtime

Изначально сайт целиком использовал Diplodoc: одна сборка, единая навигация, Markdown-контент и минимум собственного frontend-кода. Для knowledge pages это удобно, но главная страница по смыслу намного проще: имя, позиционирование, CTA, активные проекты и ссылки на основные разделы.

## Проблема

Главная наследовала стоимость viewer runtime, который нужен прежде всего внутренним документационным страницам. Попытка сохранить единый runtime и одновременно агрессивно оптимизировать static rendering привела к более опасному риску — нестабильной hydration boundary между сгенерированным HTML и client-side UI.

Я сформулировал практическое правило:

> Если presentation layer не использует runtime-возможности системы, он не должен автоматически наследовать стоимость этого runtime.

## Итоговая граница

```text
Standalone landing
  ├── статический HTML
  ├── общий CSS visual system
  ├── небольшой progressive JS
  └── без Diplodoc viewer bundle

Diplodoc knowledge layer
  ├── Markdown
  ├── navigation / toc
  ├── local search
  ├── case studies
  ├── Engineering Notes
  └── web-CV
```

Оба слоя продолжают собираться одним repository pipeline и публиковаться как один статический сайт. Главная не стала отдельным SPA и не получила новый framework.

## Что осталось общим

Разделение runtime не означает дублирование продукта. Общими остались design tokens, assets, build/post-processing, sitemap/robots, SEO metadata, browser/integrity quality gates и deployment pipeline.

Граница проведена только там, где она реально уменьшает runtime cost.

## Результат

После перехода на standalone homepage контрольный Lighthouse run в CI достиг 100 / 100 / 100 / 100 по Performance, Accessibility, Best Practices и SEO, а Total Blocking Time был 0 мс.

Важнее самой цифры архитектурный результат: главная теперь может развиваться независимо от viewer runtime, а внутренние страницы сохраняют преимущества Diplodoc.

## Вывод

Оптимизация не всегда означает «сделать существующий слой быстрее». Иногда правильный вопрос: нужен ли этот слой здесь вообще?

Если ответ «нет», удаление ненужной runtime-зависимости обычно надёжнее, чем бесконечная локальная оптимизация её стоимости.
