# Grounded Engineering Notes — Design

## Goal

Закрыть roadmap milestone **P0.5 Grounded Engineering Notes** тремя новыми заметками, каждая из которых основана на реально зафиксированном engineering incident внутри `trueruslan-landing` и не содержит invented claims.

## Chosen scope

Добавить три заметки:

1. **Когда `IntersectionObserver` спрятал огромную таблицу** — реальный bibliography reveal regression: `opacity: 0`, threshold `0.08`, tall-element geometry, regression test и последующая замена giant table на structured Sources Registry.
2. **Почему build-time data недостаточно без no-JS representation** — Sources Registry migration, Diplodoc hydration state, пустой React root при disabled JavaScript, semantic `<noscript>` fallback и сохранение одного canonical source.
3. **Почему green CI не означает verified product** — Project Evidence Layer, automated/manual evidence, bounded scope, `stale` state, LivingWorld и NODE ZERO как два разных trust cases, плюс generated-artifact regression с `<base href>`.

## Why three notes

Roadmap Definition of Done требует минимум 3–5 новых grounded notes. Три заметки полностью закрывают минимальный milestone и имеют самый сильный repository-local evidence trail. Темы про Minecraft voice pipeline и malformed LLM JSON остаются хорошими кандидатами следующего content batch, но требуют cross-repository source verification и не нужны для завершения текущего milestone.

## Architecture

Новая архитектура не создаётся.

Существующий pipeline остаётся источником истины:

- `docs/landing/notes/*.md` — narrative content;
- `data/notes.json` — canonical metadata, dates, reading time, tags и related graph;
- `docs/landing/notes.md` — human-facing Notes hub;
- `docs/toc.yaml` — navigation + generated search/sitemap discovery;
- `data/page-meta.json` — SEO/OpenGraph metadata;
- `scripts/notes-content.js` — metadata injection, previous/next/related navigation и Atom feed.

Никакого runtime fetch, CMS, backend или нового content index.

## Content rules

Каждая заметка:

- написана от первого лица спокойным инженерным тоном;
- начинается с конкретного failure mode или архитектурной проблемы;
- содержит техническую причину, принятое решение и последствия;
- отделяет наблюдаемый факт от более общего вывода;
- не придумывает метрики, production claims или детали, которых нет в repository history;
- не дублирует CHANGELOG как список коммитов, а превращает incident в reusable engineering lesson.

## Metadata and relations

Новые slugs:

- `intersection-observer-giant-table`
- `static-first-sources-no-js`
- `green-ci-is-not-product-verification`

Дата публикации/обновления: `2026-07-22`.

Relations связывают новые заметки с существующими:

- reveal incident ↔ `static-site-quality-gates` и `static-first-sources-no-js`;
- Sources/no-JS ↔ `portfolio-runtime-boundary`, `static-site-quality-gates`, reveal incident;
- evidence note ↔ `static-site-quality-gates`.

Существующие related arrays обновляются симметрично там, где это повышает навигационную ценность, без создания dense all-to-all graph.

## Quality strategy

Использовать существующие gates без ослабления:

1. `npm test` — manifest/feed/navigation contracts;
2. production Diplodoc build — все Markdown pages должны собраться;
3. generated-site integrity — TOC/search/assets/local links;
4. browser/search/metadata/visual gates — регрессии существующего сайта;
5. Atom feed должен автоматически включить новые entries через `data/notes.json`.

Отдельный новый runner не нужен: milestone является content/data expansion поверх уже проверенной Notes architecture.

## Non-goals

- не добавлять новый Notes renderer;
- не менять layout/styling Notes;
- не строить CMS или editor;
- не добавлять внешние API;
- не переписывать existing notes;
- не делать Content Freshness Guard в этом milestone;
- не обновлять `PROJECT_STATE.md`/`ROADMAP.md` как будто milestone уже merged до фактического merge и green verification.

## Definition of Done

- 3 новые grounded Engineering Notes опубликованы в source tree;
- `data/notes.json`, Notes hub, TOC и page metadata синхронизированы;
- related navigation валидна;
- feed/search/SEO получают новые pages через существующий pipeline;
- полный configured CI green на exact feature head;
- после merge durable continuity docs обновляются отдельным follow-up, как в предыдущих milestones.
