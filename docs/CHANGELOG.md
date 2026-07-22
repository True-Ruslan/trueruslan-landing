# CHANGELOG — TrueRuslan Landing

> Обновлено: **2026-07-22**, после merge PR #22.
>
> Это не машинный список коммитов. Здесь фиксируются смысловые этапы проекта: **что сделали, зачем, как именно, какие проблемы нашли и чем подтвердили результат**.
>
> Текущее состояние — `docs/PROJECT_STATE.md`. Следующие шаги — `docs/ROADMAP.md`.

---

# 2026-07-22

## Portfolio v0.4 — Project Evidence Layer

### Design / planning

Утверждён отдельный evidence layer для flagship case studies.

Design:

`docs/superpowers/specs/2026-07-22-project-evidence-layer-design.md`

Implementation plan:

`docs/superpowers/plans/2026-07-22-project-evidence-layer-implementation.md`

Основные решения были зафиксированы до implementation:

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

Проблема такого подхода:

- machine-like state дублировался в тексте;
- не было строгого distinction между automated и manual proof;
- green CI легко визуально воспринимать шире, чем он реально доказывает;
- historical successful build мог выглядеть как current product verification;
- невозможно было позже построить честный freshness guard поверх ясной data model.

Project Evidence Layer отвечает на вопрос:

> **чем именно подтверждается текущее состояние проекта и в каких границах это доказательство действительно?**

### Canonical model

Создан:

`data/project-evidence.json`

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

Зафиксированы три состояния:

- `verified` — controlled snapshot явно проверен и считается текущим только в пределах записанного evidence scope;
- `stale` — evidence раньше было meaningful, но project state требует повторной проверки;
- `unverified` — актуальное verification claim не делается.

`stale`/`unverified` являются честными valid states и сами по себе не ломают build.

Malformed/inconsistent evidence ломает build.

### Strict validation

`scripts/project-evidence.js` проверяет:

- registry shape/non-empty state;
- project reference против `data/projects.json`;
- duplicate project snapshots;
- kebab-case slug;
- trust enum;
- обязательный `lastVerified` для verified/stale;
- реальные calendar dates, включая impossible dates;
- version label/value shape;
- duplicate normalized version labels;
- signal kind/mode/state enums;
- coherence manual/automated mode;
- bounded non-empty scope;
- duplicate normalized signals;
- HTTPS URLs;
- minimum signal requirements для verified/stale.

### Build-time rendering

Case-study Markdown теперь содержит декларативные placeholders:

- LivingWorld: `data-tr-project-evidence="livingworld"`;
- NODE ZERO: `data-tr-project-evidence="node-zero"`.

`scripts/project-evidence.js` build-time генерирует semantic HTML:

- trust state;
- last checked date;
- version/protocol facts;
- automated/manual evidence distinction;
- signal state;
- bounded proof scope;
- evidence links, если они существуют и безопасны.

Renderer намеренно не синтезирует claims вроде `production-ready`, `fully tested` или `fully verified` из отдельных signal states.

### Static-first / no-JavaScript

Diplodoc может хранить article body только внутри hydration state.

Project Evidence использует mature `transformGeneratedContent` pattern:

- injection работает и с обычным generated DOM, и с `diplodoc-state`;
- callback не ломается только потому, что первая representation не содержит placeholder;
- если core content находится в hydration state, build добавляет semantic `<noscript>` fallback;
- runtime fetch не требуется;
- canonical evidence source остаётся один.

### Case-study cleanup

LivingWorld:

- duplicate machine-like exact versions/CI list удалён из prose;
- сохранены narrative limitations;
- добавлен раздел «Текущее состояние и доказательства»;
- green CI не подменяет manual multiplayer acceptance.

NODE ZERO:

- evidence block расположен рядом с current-direction section;
- exact technical version facts вынесены из narrative в registry;
- case study явно отделяет последний fully accepted foundation milestone от current draft player-foundation work.

### Initial controlled snapshots

#### LivingWorld

Status:

`verified`

`lastVerified = 2026-07-22`

Зафиксированы versions/protocol facts для:

- Minecraft Java 1.21.1;
- Java 21;
- Fabric Loader/API;
- MCA Reborn;
- Simple Voice Chat;
- LivingWorld 0.1.0.

Signals:

1. CI run `29736858315` — green;
2. world-perception milestone PR #6 — merged.

Scopes намеренно ограничены: evidence не утверждает, что human two-client microphone/spatial-audio acceptance завершена.

#### NODE ZERO

Status:

`stale`

Last fully verified foundation gate:

`2026-07-14`

Зафиксированы:

- Unity `6000.3.0f1`;
- URP `17.3.0`;
- Input System `1.16.0`;
- Windows x86_64 IL2CPP target.

Signals:

1. manual production-foundation acceptance — accepted;
2. current player-foundation PR #9 — pending/draft, observed `2026-07-22`.

Ключевое trust decision:

**успешный старый foundation gate не превращён в claim, что текущий player/vertical-slice milestone уже verified.**

Именно для таких случаев нужен отдельный `stale` state.

### UI / trust presentation

Добавлен scoped component stylesheet:

`docs/_assets/style/project-evidence.css`

Trust state различается не только цветом:

- verified — solid trust border;
- stale — dashed trust border;
- unverified — dotted/neutral treatment.

Также реализованы:

- compact semantic cards;
- responsive versions/signals grid;
- mobile single-column layout;
- long scope/version wrapping;
- global sticky-header style не протекает в evidence component.

### Browser quality gate

Добавлен:

`scripts/project-evidence-smoke.cjs`

Он проверяет LivingWorld и NODE ZERO в enhanced и JavaScript-disabled режимах:

- один evidence root;
- correct trust status/label;
- bounded scope visible;
- expected computed trust border;
- safe links;
- mobile overflow;
- Axe serious/critical violations;
- page errors;
- no-JS semantic availability.

CI сохраняет log, summary JSON, generated pages и representative mobile screenshots.

### TDD / RED-GREEN evidence

Milestone строился последовательными contract slices.

#### Build #225 — validator RED

Test-only commit импортировал ещё не существующий `project-evidence.js`.

Ожидаемо упал `Test`, остальные build/browser stages не выполнялись.

#### Build #227 — renderer RED

Новые renderer contracts падали до появления semantic renderer.

Во время этого среза отдельно исправлен некорректный test assertion: строка `НЕ ПРОВЕРЕНО` естественно содержит substring `ПРОВЕРЕНО`, поэтому negative-check был заменён на проверку status/class/standalone positive label.

#### Build #230 — canonical registry RED

Contract потребовал реальные flagship snapshots до создания `data/project-evidence.json`.

#### Build #232 — generated-page/no-JS injection RED

Contract потребовал `applyProjectEvidence`, обычный generated DOM и Diplodoc hydration-state/no-JS path.

#### Build #234 — orchestration RED

Contract потребовал, чтобы `copy-assets.js` реально загружал canonical evidence и инжектировал оба flagship project target.

#### Build #241 — trust-style browser RED

Все прежние gates до нового smoke были green.

Новый Project Evidence smoke остановился именно на отсутствующем computed trust treatment: component CSS существовал, но ещё не был wired в generated pages.

Это был clean browser-level RED.

### `<base href>` regression

После wiring stylesheet fresh Build #243 обнаружил новую интеграционную проблему ещё на site integrity.

Generated Diplodoc case-study pages содержат:

`<base href="../../">`

Первоначальный stylesheet href был вычислен физически относительно HTML file:

`../../_assets/style/project-evidence.css`

Но браузер и integrity resolver применяли его уже относительно `<base>`, из-за чего ссылка фактически уходила за пределы `docs-html`.

Site integrity корректно сообщил broken local reference.

#### Regression-first fix

Создан отдельный test:

`scripts/project-evidence-stylesheet.test.js`

Build #244 намеренно RED-воспроизвёл ошибку.

Затем `applyProjectEvidenceStylesheet()` был исправлен так, чтобы вычислять component stylesheet URL относительно **активной document base-directory**, а не только физического расположения HTML-файла.

Integrity checker не ослаблялся и exceptions для broken asset не добавлялись.

### Exact verification

Final feature head:

`7ce0d428327e29436a03fc2be4b94ef7c0f2f15b`

**Build #247 / workflow run `29935334882`: полностью green.**

Green:

- unit/model/renderer/integration tests;
- production Diplodoc build;
- generated-site integrity;
- mobile overflow;
- Chromium browser quality;
- Axe;
- Lighthouse;
- Sources Knowledge Base smoke;
- Project Evidence smoke;
- Photo Stories smoke;
- Portfolio v0.3 regression;
- Firefox/WebKit;
- generated search;
- metadata/OpenGraph;
- Engineering Map;
- visual regression;
- quality artifact upload.

Exact quality artifact digest:

`sha256:9f8b1018616ac745703a0ba637b51bbfd0c9b9333d78769858fa07ae289800d4`

Dedicated Project Evidence summary:

- LivingWorld: `verified`, 2 signals, solid `4px` trust border, overflow `0`, Axe serious/critical `0`;
- NODE ZERO: `stale`, 2 signals, dashed `4px` trust border, overflow `0`, Axe serious/critical `0`;
- JavaScript-disabled: оба evidence block доступны, overflow `0`, trust styling работает.

Representative mobile screenshots были визуально проверены: clipping/overflow не обнаружены, trust states читаемы.

### Production caveat

Этот milestone подтверждён repository CI и generated artifacts.

**Actual GitHub Pages deployment после merge `e3e48ac...` отдельно не считается подтверждённым без post-deploy endpoint evidence.**

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

Это стало reusable static-first pattern для Project Evidence Layer.

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

Позже Sources Registry полностью убрал giant table как data/presentation model, а table-specific smoke был заменён более сильным Sources KB/no-JS coverage.

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

После крупных milestones durable state синхронизируется отдельными docs follow-ups, чтобы новый чат мог восстановить контекст не по истории conversation, а по repository truth.

После Sources milestone:

- PR #21;
- squash commit `5535948d756585c44550d14f3e2424be82a3b767`.

После Project Evidence milestone актуальными источниками контекста остаются:

1. `docs/PROJECT_STATE.md`;
2. `docs/ROADMAP.md`;
3. `docs/CHANGELOG.md`;
4. actual open PR/latest commits/exact-head CI как runtime verification поверх snapshot docs.
