# CHANGELOG — TrueRuslan Landing

> Обновлено: **2026-07-22**, после merge P0.5 Grounded Engineering Notes PR #25.
>
> Это не машинный список коммитов. Здесь фиксируются смысловые этапы проекта: **что сделали, зачем, как именно, какие проблемы нашли и чем подтвердили результат**.
>
> Текущее состояние — `docs/PROJECT_STATE.md`. Следующие шаги — `docs/ROADMAP.md`.

---

# 2026-07-22

## P0.5 — Grounded Engineering Notes

### Design / planning

Design:

`docs/superpowers/specs/2026-07-22-grounded-engineering-notes-design.md`

Implementation plan:

`docs/superpowers/plans/2026-07-22-grounded-engineering-notes.md`

Главное решение milestone: не расширять Notes абстрактными SEO-статьями и не придумывать incidents.

Из roadmap-кандидатов выбраны три темы с самым сильным repository-local evidence trail внутри самого `trueruslan-landing`:

1. bibliography reveal / `IntersectionObserver` regression;
2. Sources Registry migration и no-JS/static-first boundary;
3. Project Evidence lesson: green CI ≠ verified product.

Темы про Minecraft voice pipeline и malformed LLM JSON сознательно оставлены на будущий content batch, потому что для них нужна отдельная cross-repository source verification.

### Implementation

**PR #25 — `feat: publish grounded Engineering Notes milestone`**  
Merged: 2026-07-22  
Squash commit: `f2775b7c9150281bcb4bcc01a4e021e007e18ca0`

Exact implementation head:

`8a2973961e5ec38e4c8b3e0626460c04e88438a8`

### Что добавлено

#### 1. `intersection-observer-giant-table`

**«Как IntersectionObserver спрятал огромную таблицу»**

Заметка основана на реальном bibliography regression:

- giant bibliography table оставалась `opacity: 0` после hydration;
- reveal logic использовала `IntersectionObserver threshold: 0.08`;
- для очень высокого элемента 8% intersection ratio мог быть недостижим в обычном viewport;
- fullscreen временно менял geometry и мог маскировать симптом;
- fix снизил threshold до `0` с сохранением root margin;
- normal-viewport browser regression закрепил поведение;
- позже giant table как data/presentation model была заменена Sources Registry.

Главный engineering lesson: декоративная reveal-анимация не должна становиться скрытым условием доступности core content, а geometry assumptions нужно проверять на нестандартных размерах элементов.

#### 2. `static-first-sources-no-js`

**«Почему build-time data недостаточно без no-JS representation»**

Заметка выросла из Sources Registry migration:

- giant hand-maintained bibliography table была заменена canonical `data/sources.json`;
- strict build-time renderer корректно создавал content;
- первый dedicated browser/no-JS smoke обнаружил, что Diplodoc держит article body в hydration state, а без JavaScript пользователь видит пустой React root;
- build-time presence данных оказалось недостаточно для static-first user outcome;
- решение — semantic `<noscript>` fallback только для hydration-state representation;
- canonical source остаётся один;
- runtime fetch не добавлялся;
- page-local query/topic/type filtering остаётся progressive enhancement;
- Diplodoc сохраняет ownership единственного site-wide full-text search index.

Главный lesson: **данные присутствуют в generated artifact ≠ пользователь может прочитать их без runtime JavaScript**.

#### 3. `green-ci-is-not-product-verification`

**«Почему green CI не означает verified product»**

Заметка фиксирует основные выводы Project Evidence Layer:

- automated signal и manual acceptance доказывают разные вещи;
- каждый evidence signal должен иметь bounded `scope`;
- `verified / stale / unverified` — разные trust states, а не декоративные цвета;
- LivingWorld green CI + merged milestone не доказывают human two-client microphone/spatial-audio acceptance;
- NODE ZERO accepted foundation milestone не делает автоматически verified более новый player/vertical-slice work;
- generated `<base href>` stylesheet regression показывает, почему source-level correctness не заменяет final-artifact verification.

Главный lesson: **verification — это claim с scope, freshness и источником доказательства, а не просто зелёный badge**.

### Notes integration

`data/notes.json` расширен с 3 до 6 canonical entries.

Добавлены:

- dates;
- reading time;
- tags;
- related-note graph;
- reverse relations там, где они полезны для navigation.

Обновлены:

- `docs/landing/notes.md` — human-facing Notes hub;
- `docs/toc.yaml` — navigation + search/sitemap discovery;
- `data/page-meta.json` — per-note SEO/OpenGraph metadata.

Atom feed автоматически получает новые entries через существующий canonical notes manifest.

### Content contract

`scripts/notes-content.test.js` теперь требует наличие трёх P0.5 slugs:

- `intersection-observer-giant-table`;
- `static-first-sources-no-js`;
- `green-ci-is-not-product-verification`.

Это защищает milestone от незаметной потери canonical note entry/source file в будущих изменениях.

### Architecture preserved

Milestone не добавил:

- backend;
- CMS;
- runtime API;
- второй search index;
- новый Notes renderer;
- duplicate content source.

Существующая модель сохранена:

```text
Markdown narrative
        +
data/notes.json canonical metadata/relations
        ↓
Diplodoc + build-time postprocessing
        ↓
metadata / navigation / related notes / Atom feed / search / SEO
```

### Verification

Exact feature head:

`8a2973961e5ec38e4c8b3e0626460c04e88438a8`

**Build #257 / workflow run `29943616448`: полностью green.**

Green:

- tests;
- production Diplodoc build;
- generated-site integrity;
- mobile overflow;
- Chromium browser smoke;
- Axe;
- Lighthouse;
- Sources Knowledge Base smoke;
- Project Evidence smoke;
- Photo Stories smoke;
- Portfolio v0.3 regression;
- Firefox/WebKit compatibility;
- generated search;
- metadata/OpenGraph;
- Engineering Map;
- visual regression;
- quality evidence upload.

### Product result

P0.5 Definition of Done закрыт минимально полным scope: **3 новые grounded notes** из требуемых 3–5.

Engineering Notes теперь содержат 6 материалов, а следующий основной roadmap priority — **P0.6 Content Freshness Guard**.

---

## Portfolio v0.4 — Project Evidence Layer

### Design / planning

Утверждён отдельный evidence layer для flagship case studies.

Design:

`docs/superpowers/specs/2026-07-22-project-evidence-layer-design.md`

Implementation plan:

`docs/superpowers/plans/2026-07-22-project-evidence-layer-implementation.md`

Основные решения:

- первый scope: `livingworld` + `node-zero`;
- architecture generic для остальных project slugs;
- отдельный canonical `data/project-evidence.json`;
- manual controlled snapshot;
- trust states `verified | stale | unverified`;
- no runtime/build-time GitHub API dependency в основном site build;
- bounded `scope` для каждого evidence signal;
- green CI/release/PR не может автоматически сделать project `verified`;
- core evidence должен работать без JavaScript.

### Implementation

**PR #22 — `feat: add Project Evidence Layer`**  
Merged: 2026-07-22  
Squash commit: `e3e48ac56b45eddeb872c04b83bff1408da6556f`

Exact implementation head:

`7ce0d428327e29436a03fc2be4b94ef7c0f2f15b`

### Зачем

До этого project status/version/CI часть case studies частично существовала как hand-written prose.

Проблемы:

- machine-like state дублировался в тексте;
- не было строгого distinction между automated и manual proof;
- green CI легко воспринимать шире, чем он реально доказывает;
- historical successful build мог выглядеть как current product verification;
- невозможно было построить честный freshness guard поверх ясной data model.

Project Evidence Layer отвечает на вопрос:

> **чем именно подтверждается текущее состояние проекта и в каких границах это доказательство действительно?**

### Canonical model

Создан `data/project-evidence.json`.

Project snapshot хранит:

- project slug;
- trust status;
- `lastVerified`;
- version/protocol facts;
- evidence signals.

Signal хранит:

- controlled kind;
- automated/manual mode;
- label;
- controlled state;
- observed date;
- optional stable HTTPS URL;
- обязательный bounded `scope`.

### Trust model

- `verified` — controlled snapshot явно проверен и считается текущим только в пределах recorded scope;
- `stale` — evidence раньше было meaningful, но current state требует повторной проверки;
- `unverified` — актуальное verification claim не делается.

`stale`/`unverified` — valid states и сами по себе не ломают build.

Malformed/inconsistent evidence ломает build.

### Static-first / no-JavaScript

Diplodoc может хранить article body внутри hydration state.

Project Evidence использует mature `transformGeneratedContent` pattern:

- injection работает с обычным generated DOM и `diplodoc-state`;
- если core content находится в hydration state, build добавляет semantic `<noscript>` fallback;
- runtime fetch не требуется;
- canonical evidence source остаётся один.

### Initial controlled snapshots

#### LivingWorld

Status: `verified`  
`lastVerified = 2026-07-22`

Signals:

1. CI run `29736858315` — green;
2. world-perception milestone PR #6 — merged.

Scopes намеренно ограничены: evidence не утверждает, что human two-client microphone/spatial-audio acceptance завершена.

#### NODE ZERO

Status: `stale`

Last fully verified foundation gate: `2026-07-14`.

Signals:

1. manual production-foundation acceptance — accepted;
2. newer player-foundation work — отдельный более свежий milestone, не покрытый старым foundation verification.

Ключевое trust decision:

**успешный старый foundation gate не превращён в claim, что текущий player/vertical-slice milestone verified.**

### TDD / regression history

Milestone строился contract slices:

- Build #225 — validator RED;
- Build #227 — renderer RED;
- Build #230 — canonical registry RED;
- Build #232 — generated-page/no-JS injection RED;
- Build #234 — orchestration RED;
- Build #241 — trust-style browser RED;
- Build #244 — `<base href>` stylesheet-resolution regression RED.

### `<base href>` regression

После wiring component stylesheet generated Diplodoc pages с `<base href="../../">` показали проблему: naive document-relative stylesheet URL вычислялся относительно физического HTML path, а browser/integrity semantics применяли active document base.

Site integrity корректно поймал broken local reference.

Fix:

- добавлен отдельный stylesheet resolution test;
- URL стал вычисляться относительно active document base-directory;
- integrity checker не ослаблялся;
- exceptions для broken asset не добавлялись.

### Exact verification

Final feature head:

`7ce0d428327e29436a03fc2be4b94ef7c0f2f15b`

**Build #247 / workflow run `29935334882`: полностью green.**

Green вся configured matrix: tests, production build, integrity, mobile/browser/Axe/Lighthouse, Sources, Evidence, Photo Stories, v0.3 regression, Firefox/WebKit, search, metadata/OpenGraph, Engineering Map, visual regression и quality artifact upload.

### Production caveat

Repository CI и generated artifacts подтверждены.

Actual GitHub Pages deployment после feature merge отдельно не считается подтверждённым без post-deploy endpoint evidence.

---

## Portfolio v0.4 — Sources Registry / Knowledge Base

### Design

**PR #19 — `docs: design v0.4 Sources Registry knowledge base`**  
Squash commit: `363c79c811748823184a795b8174378fc471f58d`

### Implementation

**PR #20 — `feat: build Sources Registry knowledge base`**  
Squash commit: `4f4e8ff2c0f70ef60d49cdf5f8a708a71aa4ce2d`

### Что изменилось

Старая hand-maintained giant bibliography table заменена на:

- canonical `data/sources.json`;
- 31 migrated real records;
- strict validation;
- deterministic build-time rendering;
- compact source cards;
- topic counters;
- query/topic/type page-local filtering;
- stable anchors;
- related materials;
- responsive presentation;
- semantic no-JS fallback.

Search boundary:

**Sources filter не является вторым site-wide search engine. Diplodoc остаётся global full-text search owner.**

### No-JS incident

Первый dedicated browser smoke обнаружил, что build-time content существовал внутри Diplodoc hydration state, но при disabled JS пользователь видел пустой React root.

Решение:

- semantic `<noscript>` fallback только для hydration-state representation;
- один canonical source;
- no runtime fetch.

Этот incident позже стал одной из P0.5 Grounded Engineering Notes.

### Verification

Exact implementation head:

`bd6d1cfce69b9ccff2d1f50622c2ca81f25f43e7`

**Build #223: fully green.**

Evidence:

- 31 rendered records;
- query ClickHouse → 1;
- topic JPA → 3;
- type blog → 1;
- mobile overflow 0;
- Axe serious/critical 0;
- no-JS records 31;
- no-JS overflow 0.

---

## Photo Stories — cinematic personal archive

### Main implementation

**PR #15 — `feat: build cinematic photo stories archive`**  
Squash commit: `8aa2149fc8aec3751f2da73321c06a89111f9efd`

Реализовано:

- canonical `/photos/`;
- `data/photo-albums.json` / `data/photo-archive.json`;
- `/photos/<slug>/`;
- cinematic hero;
- editorial layouts;
- fullscreen lightbox;
- keyboard/touch navigation;
- focus restoration;
- hash deep links;
- category filters;
- legacy route compatibility;
- sitemap/search/meta/OG integration;
- build-time validation;
- browser smoke.

Fake/demo album не создавался. `photo-albums.json` остаётся пустым до первой реальной связной серии.

### Post-merge QA

**PR #17 — `fix: polish Photo Stories mobile hero and QA evidence`**  
Squash commit: `7936638bd6473ad4f1ff0b2ef42db2289e937d83`

Усилены browser assertions:

- mobile hero title внутри viewport;
- lazy archive images реально загружены до screenshot;
- geometry diagnostics.

Visual evidence подтвердило корректный mobile viewport без необходимости лишнего CSS change.

---

## Bibliography disappearing-table regression

**PR #14 — `fix: keep bibliography table visible after hydration`**

Проблема:

огромная legacy bibliography table сначала появлялась, затем оставалась `opacity: 0`; fullscreen временно «лечил» симптом.

Root cause:

`IntersectionObserver threshold: 0.08` требовал одновременно видеть не менее 8% очень высокого элемента. В обычном viewport это условие могло никогда не выполниться.

Fix:

- threshold снижен до `0` с сохранением root margin;
- добавлен normal-viewport browser regression.

Позже Sources Registry полностью убрал giant table как data/presentation model.

Этот incident позже стал одной из P0.5 Grounded Engineering Notes.

---

## Portfolio v0.3 — living engineering space

**PR #13 — `feat: evolve portfolio into a living engineering space`**  
Squash commit: `b472aff67d69fb3cd6afa0577864371547f52a5b`

Ключевые изменения:

- canonical `data/projects.json`;
- registry-derived status вместо дублирования project state;
- `/now`;
- structured LivingWorld/NODE ZERO timelines;
- Engineering Notes metadata/relations/feed;
- Engineering Map;
- command palette;
- stronger generated-site quality gates.

Именно этот milestone закрепил направление от «landing page» к living engineering portfolio/knowledge platform.

---

## Durable continuity updates

После крупных milestones durable state синхронизируется отдельными docs follow-ups, чтобы новый чат восстанавливал контекст по repository truth, а не по истории conversation.

Ключевые continuity merges:

- после Sources milestone — PR #21, squash `5535948d756585c44550d14f3e2424be82a3b767`;
- после Project Evidence milestone — PR #23, squash `ac520553cbe38ab022d49abc3b48dd0bd67c76c8`;
- final Project Evidence state cleanup — PR #24, squash `6e83ab5dcbbc23ae2274fddbd0daed8efa058e23`;
- после Grounded Engineering Notes milestone — текущий docs-only continuity follow-up.

Актуальные источники контекста:

1. `docs/PROJECT_STATE.md`;
2. `docs/ROADMAP.md`;
3. `docs/CHANGELOG.md`;
4. actual open PR/latest commits/exact-head CI как runtime verification поверх snapshot docs.
