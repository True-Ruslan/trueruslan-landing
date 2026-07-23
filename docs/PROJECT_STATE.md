# PROJECT STATE — TrueRuslan Landing

> Последнее смысловое обновление: **2026-07-23**, после merge P2.1 Minimal RU/EN PR #38.
>
> Главный durable snapshot для ответа на вопрос **«что сейчас представляет собой проект, что уже сделано и что дальше?»**.
>
> В новом чате читать по порядку:
> 1. `docs/PROJECT_STATE.md`
> 2. `docs/ROADMAP.md`
> 3. `docs/CHANGELOG.md`
>
> Затем всегда проверять actual open PR, latest commits и exact-head CI. Public deployment и реальные maintenance-workflow runs подтверждать отдельно.

## 1. Что это за проект

`True-Ruslan/trueruslan-landing` — персональное инженерное портфолио и knowledge platform Руслана Немыкина.

Проект объединяет:

- standalone homepage;
- Diplodoc knowledge pages;
- web-CV;
- project case studies;
- `/now`;
- Engineering Notes + Atom;
- Engineering Map;
- один локальный полнотекстовый поиск + Cmd/Ctrl+K palette;
- Photo Stories;
- Sources Knowledge Base;
- Project Evidence Layer;
- Content Freshness Guard;
- ограниченный RU/EN bilingual layer;
- SEO/OpenGraph/JSON-LD;
- production-oriented CI, accessibility, cross-browser и visual quality gates.

Главная продуктовая формула:

**что я создаю → что я изучаю → какие инженерные выводы делаю → чем это подтверждено**.

Публичный тон — спокойный инженерный дневник от первого лица, без fake demos, invented metrics и неподтверждённых claims.

---

## 2. Текущее состояние `master`

### Последний milestone

**P2.1 — Minimal RU/EN**.

Feature PR #38:

`feat: add minimal RU EN portfolio layer`

Squash commit:

`00f7513f685b8a8348005d0ab704ce96abe64950`

Exact implementation head:

`d5f2490bbd7beac7343c96edf1fb6e8feb9b51c6`

Verification:

**Build #339 / run `30000373281`: fully green по полной configured matrix.**

### Что реализовано в P2.1

Добавлен строго ограниченный `/en/` layer из **7 RU/EN пар**:

1. `/` ↔ `/en/`;
2. About;
3. Resume;
4. Projects hub;
5. LivingWorld;
6. `server-authoritative-ai-npcs`;
7. `llm-output-is-a-protocol-boundary`.

Русский остаётся default/root language. Existing RU URLs не менялись.

### Bilingual architecture

Ключевая граница:

**один site build + один site-wide search index + bounded `/en/` namespace**.

Не создано:

- второго `docs-en` tree;
- второго Diplodoc build;
- `_search/en/`;
- runtime translation/fetch;
- automatic browser-language redirect;
- CMS/i18n backend;
- второго Project Registry / Evidence / timeline / Notes registry.

Canonical route pairing хранится в:

`data/i18n.json`

Он владеет только отношением RU ↔ EN route, а не prose/status/evidence.

Build-time layer:

`scripts/i18n.js`

Он валидирует пары и детерминированно добавляет:

- `<html lang="ru|en">`;
- self-canonical locale URL через существующий page-meta layer;
- `hreflang=ru`;
- `hreflang=en`;
- `hreflang=x-default` → RU;
- обычный no-JS language switch anchor.

### English authoring ownership

English prose хранится явно и version-controlled:

- `templates/index.en.html` — standalone English homepage;
- `docs/en/**` — curated English Markdown pages.

Shared machine-like truth остаётся общей:

- project status — `data/projects.json`;
- Evidence — `data/project-evidence.json`;
- timelines — `data/project-history/*.json`;
- Notes identity/relations — `data/notes.json`.

English LivingWorld **не дублирует** Project Evidence/timeline machine truth. Его Evidence section ссылается на Russian canonical LivingWorld page, где generated timeline/evidence продолжает жить из shared registries.

Untranslated project detail links явно маркируются `(RU)` / `Russian`, а не притворяются English routes.

### Search / feed boundary

Сохранился ровно один site-wide full-text search:

`_search/ru/index.html`

`_search/en/` не создаётся.

English UI ссылается на существующий search index. Existing Atom feed остаётся canonical Notes feed; translations не создают duplicate note entities/feed entries.

### Accessibility defect, найденный новым gate

Первый dedicated bilingual browser run обнаружил реальные hydrated Diplodoc accessibility gaps на mobile English LivingWorld:

- icon-only `.dc-sidebar-navigation__button` и `.dc-subnavigation__share-button` без accessible names;
- горизонтально scrollable hydrated code regions без keyboard focusability.

Axe rules не отключались и assertions не ослаблялись.

Existing progressive `repairRuntimeAccessibility()` теперь:

- добавляет locale-aware accessible names этим runtime controls;
- делает реально scrollable `pre code` keyboard-focusable.

### TDD / verification trail P2.1

- Build #310 / run `29997485306` — RED: contract раньше `scripts/i18n.js`/manifest;
- Build #314 — RED: locale-aware cards + multi-target status contract;
- Build #318 — RED: explicit RU fallback + `/en/` canonical contract;
- Build #321 — RED: standalone CTA transform contract;
- Build #332 — production build + generated-site integrity GREEN после core integration;
- Build #334 / run `29999035740` — browser RED: новый Axe gate нашёл реальные accessibility defects;
- Build #339 / run `30000373281` — final exact-head full matrix GREEN.

Final bilingual gate проверяет:

- все 7 EN routes;
- все 7 RU/EN canonical/hreflang pairs;
- no-JS EN ↔ RU round trips;
- отсутствие `_search/en/`;
- один visible H1;
- mobile/desktop overflow;
- serious/critical Axe = 0 на representative EN surfaces;
- browser diagnostics.

Design:

`docs/superpowers/specs/2026-07-23-minimal-ru-en-design.md`

Plan:

`docs/superpowers/plans/2026-07-23-minimal-ru-en.md`

### Сейчас в разработке

P2.1 feature implementation завершена и смержена.

Следующий actionable priority:

**P2.2 — Privacy-friendly analytics design.**

Первая настоящая Photo Story остаётся content-dependent/non-blocking: platform готова, fake/demo album добавлять нельзя.

---

## 3. Архитектурные принципы

Главная граница:

**static-first + build-time intelligence + progressive enhancement**.

Без отдельного design decision нельзя ломать:

- core content без runtime API;
- JS как enhancement, а не единственный источник содержания;
- no backend/CMS/database без реальной необходимости;
- no runtime GitHub API для core public content;
- no build-time GitHub API dependency в основном site build;
- один canonical source of truth на сущность;
- deterministic build-time generation;
- semantic/no-JS content;
- Diplodoc владеет единственным site-wide full-text search index;
- maintenance signals не переписывают public truth автоматически;
- evidence не говорит больше bounded scope;
- quality gates не ослабляются ради feature velocity.

Bilingual-specific rule:

**не превращать RU/EN в два независимо расходящихся сайта.**

---

## 4. Canonical data и build architecture

Основные registries:

- `data/projects.json` — project identity/status/summary/links/tags;
- `data/project-history/*.json` — flagship timelines;
- `data/project-evidence.json` — controlled evidence snapshots;
- `data/now.json`;
- `data/notes.json` — Notes metadata/relations;
- `data/engineering-graph.json`;
- `data/page-meta.json` — SEO/social metadata;
- `data/i18n.json` — только RU/EN route pairing;
- `data/photo-albums.json`;
- `data/photo-archive.json`;
- `data/sources.json`;
- `data/external-links.json`.

Главный build/postprocess orchestrator:

`scripts/copy-assets.js`

Quality shared infrastructure:

`scripts/quality-harness/`

Bilingual quality:

- `scripts/i18n.test.js`;
- `scripts/i18n-browser-smoke.cjs`.

Freshness maintenance:

- `scripts/content-freshness.js`;
- `scripts/content-freshness-report.js`;
- `scripts/content-freshness-probe.js`;
- `.github/workflows/content-freshness.yml`.

---

## 5. Реализованные milestones

### P0 — foundation

- **P0.1 Photo Stories platform — DONE**: PR #15 + QA PR #17.
- **P0.2 First real Photo Story — CONTENT DEPENDENT**.
- **P0.3 Sources Registry / KB — DONE**: PR #20, squash `4f4e8ff2c0f70ef60d49cdf5f8a708a71aa4ce2d`.
- **P0.4 Project Evidence — DONE**: PR #22, squash `e3e48ac56b45eddeb872c04b83bff1408da6556f`, Build #247.
- **P0.5 Grounded Notes — DONE**: PR #25, squash `f2775b7c9150281bcb4bcc01a4e021e007e18ca0`, Build #257.
- **P0.6 Content Freshness Guard — DONE**: PR #27, squash `33770983789fbde5c59a94972709360286a06ad5`, Build #269.

### P1 — maintainability / depth

- **P1.1 Browser Quality Harness — DONE**: PR #29, squash `06e60425e31ef19ddae0c3ac8b0991808b45837e`, Build #293.
- **P1.2 Project Metadata Cleanup — DONE**: PR #31, squash `1df2a2905ef2eb4b52173271f9012defc33b25ab`, Build #296.
- **P1.3 Flagship Case-Study Format — DONE**: PR #34, squash `107b69311f6eed408de5306406d9ff41f0e32ea2`, Build #301.
- **P1.4 Additional Grounded Note — DONE**: PR #36, squash `24ad81eb4f8b8a2194430dc7316a95c313d7f3f5`, Build #308.

### P2 — audience / operations

- **P2.1 Minimal RU/EN — DONE**: PR #38, squash `00f7513f685b8a8348005d0ab704ce96abe64950`, Build #339.
- **P2.2 Privacy-friendly analytics — NEXT**.

---

## 6. Quality architecture и exact evidence

Configured matrix сейчас включает:

- `npm test`;
- production Diplodoc build;
- generated-site integrity;
- mobile overflow;
- Chromium browser/Axe/Lighthouse;
- Sources KB;
- Project Evidence;
- Photo Stories;
- Portfolio v0.3 regression;
- Firefox/WebKit;
- generated search;
- **Minimal RU EN browser smoke**;
- metadata/OpenGraph;
- Engineering Map;
- visual regression;
- diagnostics/evidence upload.

Latest feature exact head:

`d5f2490bbd7beac7343c96edf1fb6e8feb9b51c6`

Build #339 / run `30000373281`:

**fully green по всей configured matrix**.

P2.1 не менял:

- dependency/package-lock graph;
- visual baselines/thresholds;
- Lighthouse budgets;
- search engine ownership;
- Project Evidence/trust semantics.

---

## 7. Незавершённые части / technical debt

### P2.2 — Privacy-friendly analytics — NEXT

До implementation нужен design, который сначала отвечает:

1. какие решения реально будут приниматься по данным;
2. какие минимальные aggregate events нужны;
3. можно ли обойтись без cookies/local identity;
4. какой provider/self-hosting trade-off приемлем;
5. что именно считается personal data;
6. нужен ли consent surface;
7. как аналитика ведёт себя при DNT/ad blockers/network failure;
8. как не превратить static-first site в runtime-dependent product.

Критическая граница:

**никакого invasive ad profiling, cross-site tracking или сбора данных «потому что у сайтов есть аналитика».**

### Content-dependent

Первая настоящая Photo Story отсутствует. Fake/demo album не добавлять.

### Operational caveats

- actual GitHub Pages deployment после последних merges отдельно не подтверждён этим snapshot;
- первый реальный post-merge Content Freshness scheduled/manual run отдельно не подтверждён этим snapshot.

### Versioning

`version: 0.2.0` не является product maturity indicator; без explicit package release contract не bump’ать механически.

### Later

- custom domain / paid hosting — только при operational need;
- richer architecture explorer — только при достаточном количестве real architecture artifacts.

---

## 8. Следующий оптимальный этап

### P2.2 — Privacy-friendly analytics design

Цель — понять реальное использование portfolio без invasive tracking и без architecture regression.

Правильный порядок:

1. measurement questions/decisions;
2. minimal event model;
3. privacy/legal/cookie constraints;
4. provider vs self-hosted comparison;
5. static-first failure behavior;
6. implementation contract + QA;
7. только затем код.

После P2.2:

1. custom domain/hosting — только при необходимости;
2. richer architecture explorer — только при реальных artifacts;
3. first real Photo Story — независимо, когда появится genuine material.

---

## 9. Намеренные архитектурные запреты

Без нового design decision не добавлять:

- backend/CMS/database ради static content;
- runtime GitHub API;
- второй site-wide search engine;
- второй независимый EN site/build;
- automatic machine translation как source of public truth;
- invasive analytics/ad profiling/cross-site tracking;
- accounts/comments/likes;
- AI chat поверх резюме как gimmick;
- automatic mutation public trust state;
- giant QA runner;
- decorative package version bumps.

---

## 10. Как восстановить контекст в новом чате

> Открой в `True-Ruslan/trueruslan-landing` файлы `docs/PROJECT_STATE.md`, `docs/ROADMAP.md` и `docs/CHANGELOG.md`. Затем проверь актуальные open PR, последние commits и CI. Расскажи, что уже реализовано, что сейчас в работе, что изменилось после последнего state update и что оптимально делать следующим.

Всегда дополнительно проверять:

- open PR;
- latest commits;
- latest exact-head CI;
- latest Content Freshness workflow runs/issues, если вопрос касается freshness monitoring;
- actual production deployment, если вопрос касается production.
