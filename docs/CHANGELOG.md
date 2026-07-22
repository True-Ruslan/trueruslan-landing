# CHANGELOG — TrueRuslan Landing

> Обновлено: **2026-07-22**, после merge P0.6 Content Freshness Guard PR #27.
>
> Это не машинный список коммитов. Здесь фиксируются смысловые этапы проекта: **что сделали, зачем, как именно, какие проблемы нашли и чем подтвердили результат**.
>
> Текущее состояние — `docs/PROJECT_STATE.md`. Следующие шаги — `docs/ROADMAP.md`.

---

# 2026-07-22

## P0.6 — Content Freshness Guard

### Design / planning

Design:

`docs/superpowers/specs/2026-07-22-content-freshness-guard-design.md`

Implementation plan:

`docs/superpowers/plans/2026-07-22-content-freshness-guard.md`

Основное решение:

**freshness monitoring является maintenance evidence, а не новым источником public truth.**

Выбран modular detector + thin scheduled workflow вместо:

- большого workflow-only inline script;
- автоматического переписывания registries;
- auto-PR/auto-verification поведения.

### Implementation

**PR #27 — `feat: add Content Freshness Guard`**  
Merged: 2026-07-22  
Squash commit: `33770983789fbde5c59a94972709360286a06ad5`

Exact implementation head:

`4b50dd78a41b3cbe2fce327e6c752508134862d0`

### Pure detector

Создан:

`scripts/content-freshness.js`

Detector работает без network/filesystem side effects и возвращает deterministic findings.

Finding model:

- stable `code`;
- `severity`;
- optional project slug;
- конкретный `message`;
- actionable `action`;
- bounded structured `details`.

Initial rules:

- `evidence-too-old` — `lastVerified` старше configurable threshold;
- `evidence-link-unreachable` — configured evidence URL external probe считает unavailable/broken;
- `repository-drift` — repository activity новее latest recorded controlled evidence date;
- `release-candidate-has-new-release` — новый release появился после evidence, а registry всё ещё `release-candidate`;
- `timeline-missing` / `timeline-current-count` — structured timeline contradiction;
- `verified-signal-after-check` — у `verified` snapshot появился recorded signal новее `lastVerified`, значит требуется manual re-review.

Default `lastVerified` threshold:

**30 days**.

Ровно 30 дней остаётся clean; finding появляется после threshold.

### Controlled-scope decision

Во время design review отдельно предотвращён false-positive:

**Guard не требует evidence snapshot для каждого active/public project.**

Project Evidence Layer намеренно имеет controlled scope (`livingworld` + `node-zero`). Отсутствие snapshot у проекта вне этого scope не является freshness defect само по себе.

### Trust chronology correction

Отдельно уточнена семантика `lastVerified`:

- controlled manual snapshot может быть новее automated signals — это нормально;
- проблема возникает, когда после `lastVerified` появился более новый recorded signal, а trust state всё ещё `verified` без нового re-review.

Именно это проверяет `verified-signal-after-check`.

### Local report command

Создан:

`scripts/content-freshness-report.js`

Команда:

`npm run check:freshness`

Она:

- повторно использует canonical Project Registry / Evidence validation;
- загружает structured timelines;
- читает optional external observations JSON;
- создаёт deterministic JSON report;
- создаёт human-readable Markdown report;
- не возвращает failure exit code только из-за freshness findings;
- падает только на invalid input/execution failure.

Default outputs:

- `quality-artifacts/content-freshness-report.json`;
- `quality-artifacts/content-freshness-report.md`.

### External probe

Создан:

`scripts/content-freshness-probe.js`

Команда:

`npm run probe:freshness`

Probe:

- использует только явно configured `project.links.github`;
- не пытается угадывать repository identity;
- получает bounded GitHub metadata (`pushed_at`, optional latest release);
- проверяет только явно configured evidence signal URLs;
- normalizes HTTP/network failures в observations;
- не меняет canonical data.

GitHub token используется только для GitHub API requests и не отправляется evidence endpoints.

### Scheduled/manual maintenance workflow

Создан:

`.github/workflows/content-freshness.yml`

Triggers:

- daily schedule;
- `workflow_dispatch`.

Workflow:

1. checkout;
2. Node 24;
3. `npm ci`;
4. bounded external probe;
5. deterministic report;
6. artifact upload;
7. create/update/close одного GitHub issue.

Stable issue marker:

`<!-- content-freshness-guard -->`

Если findings есть:

- существующий guard issue обновляется/reopens;
- иначе создаётся один issue.

Если findings исчезли:

- существующий open guard issue закрывается.

### Security / mutation boundary

Workflow permissions:

- `contents: read`;
- `issues: write`.

Checkout:

`persist-credentials: false`

Static safety contract проверяет отсутствие:

- `contents: write`;
- `git commit`;
- `git push`.

Guard никогда автоматически:

- не меняет `data/projects.json`;
- не меняет `data/project-evidence.json`;
- не меняет timelines;
- не переводит project в `verified / stale / unverified`;
- не выводит full product verification из green CI/release/repository activity.

### TDD trail

#### Build #259 — detector RED

Contract tests импортировали ещё не существующий `content-freshness.js`.

`Test` ожидаемо упал, последующие build/browser stages были skipped.

#### Build #260 — detector GREEN

Pure detector implementation удовлетворил contracts; `Test` стал green.

#### Build #261 / #262 — probe/report RED

Следующий test slice потребовал ещё не существующие probe/report modules.

Ожидаемый RED был зафиксирован до production implementation.

#### Build #265 — probe/report GREEN

Probe + report implementation прошли unit contracts; production build/integrity также были green на этом slice.

#### Build #266 — workflow safety RED

Новый test требовал ещё не существующий `.github/workflows/content-freshness.yml` и его safety contract.

`Test` ожидаемо упал.

#### Build #267 — workflow contract GREEN

После добавления workflow test slice стал green.

### Exact verification

Final feature head:

`4b50dd78a41b3cbe2fce327e6c752508134862d0`

**Build #269 / workflow run `29947803201`: fully green.**

Green вся configured matrix:

- unit/contracts;
- production Diplodoc build;
- generated-site integrity;
- mobile overflow;
- Chromium browser/Axe/Lighthouse;
- Sources Knowledge Base smoke;
- Project Evidence smoke;
- Photo Stories smoke;
- Portfolio v0.3 regression;
- Firefox/WebKit;
- generated search;
- metadata/OpenGraph;
- Engineering Map;
- visual regression;
- quality evidence upload.

### Operational caveat

Feature implementation, unit/static workflow contract и repository CI подтверждены.

**Первый фактический post-merge scheduled/manual Content Freshness workflow run отдельно пока не считается подтверждённым этим milestone evidence.**

Не утверждать, что GitHub issue lifecycle уже реально выполнялся в production, пока нет конкретного workflow-run evidence.

### Repository hygiene note

Во время tool orchestration временный probe-файл `_never_` случайно был создан отдельным commit и сразу удалён следующим cleanup commit.

- temporary commit: `4f7ec91abc475662692ca31af05a633cfeea0f25`;
- cleanup commit: `b5ce6e5155d67047eed86921076bbfac8700aa13`.

Net tree effect: **none**. Product code/data не были затронуты этим probe incident.

---

## P0.5 — Grounded Engineering Notes

**PR #25 — `feat: publish grounded Engineering Notes milestone`**  
Squash: `f2775b7c9150281bcb4bcc01a4e021e007e18ca0`

Exact head:

`8a2973961e5ec38e4c8b3e0626460c04e88438a8`

Build #257 / run `29943616448`: **fully green**.

Добавлены 3 repository-grounded notes:

1. `intersection-observer-giant-table`;
2. `static-first-sources-no-js`;
3. `green-ci-is-not-product-verification`.

Всего Engineering Notes стало 6.

Интеграция:

- `data/notes.json` metadata/relations;
- Notes hub;
- TOC/search/sitemap;
- per-page SEO/OpenGraph;
- Atom feed;
- canonical content contract.

Milestone намеренно ограничен тремя incidents с сильным repository-local evidence trail.

---

## Portfolio v0.4 — Project Evidence Layer

**PR #22 — `feat: add Project Evidence Layer`**  
Squash: `e3e48ac56b45eddeb872c04b83bff1408da6556f`

Exact head:

`7ce0d428327e29436a03fc2be4b94ef7c0f2f15b`

Build #247 / run `29935334882`: **fully green**.

Создан `data/project-evidence.json` с:

- manual controlled snapshots;
- `verified / stale / unverified`;
- bounded scope;
- automated/manual distinction;
- strict validation;
- semantic build-time rendering;
- no-JS fallback;
- trust-state UI;
- dedicated browser/Axe/no-JS smoke.

Initial scope:

- LivingWorld — `verified`;
- NODE ZERO — `stale`.

Ключевой lesson:

**green CI ≠ verified product**.

Именно этот milestone создал canonical data model, поверх которой позже построен P0.6 Freshness Guard.

Project Evidence TDD/regression history включала:

- validator RED;
- renderer RED;
- registry RED;
- generated-page/no-JS RED;
- orchestration RED;
- trust-style browser RED;
- `<base href>` stylesheet resolution regression.

Integrity gate не ослаблялся ради fixes.

---

## Portfolio v0.4 — Sources Registry / Knowledge Base

**PR #20 — `feat: build Sources Registry knowledge base`**  
Squash: `4f4e8ff2c0f70ef60d49cdf5f8a708a71aa4ce2d`

Реализовано:

- canonical `data/sources.json`;
- 31 migrated real records;
- strict validation;
- deterministic rendering;
- compact cards/counters;
- query/topic/type page-local filtering;
- stable anchors;
- related materials;
- responsive UI;
- semantic no-JS fallback.

Dedicated browser smoke обнаружил реальный no-JS failure mode Diplodoc hydration state; решение стало reusable static-first pattern для Project Evidence.

---

## Photo Stories — cinematic personal archive

Main implementation:

- PR #15 — `feat: build cinematic photo stories archive`;
- squash `8aa2149fc8aec3751f2da73321c06a89111f9efd`.

Post-merge QA:

- PR #17 — `fix: polish Photo Stories mobile hero and QA evidence`;
- squash `7936638bd6473ad4f1ff0b2ef42db2289e937d83`.

Реализованы canonical `/photos/`, album/archive registries, story routes, cinematic/editorial layout, fullscreen lightbox, keyboard/touch/hash navigation, filters и quality coverage.

Fake/demo album не добавлялся.

---

## Bibliography disappearing-table regression

**PR #14 — `fix: keep bibliography table visible after hydration`**

Root cause:

`IntersectionObserver threshold: 0.08` на очень высокой таблице мог никогда не достигаться в обычном viewport, оставляя content `opacity: 0`.

Fix:

- threshold → `0`;
- normal-viewport browser regression.

Позже Sources Registry убрал giant table как data model.

Incident стал одной из P0.5 Grounded Engineering Notes.

---

## Portfolio v0.3 — living engineering space

**PR #13 — `feat: evolve portfolio into a living engineering space`**  
Squash: `b472aff67d69fb3cd6afa0577864371547f52a5b`

Ключевые изменения:

- canonical Project Registry;
- registry-derived status;
- `/now`;
- structured timelines;
- Engineering Notes metadata/relations/feed;
- Engineering Map;
- command palette;
- stronger generated-site quality gates.

Этот milestone закрепил переход от landing page к living engineering portfolio / knowledge platform.

---

## Durable continuity updates

После крупных milestones durable state синхронизируется отдельными docs-only follow-ups.

Источники истины для нового чата:

1. `docs/PROJECT_STATE.md`;
2. `docs/ROADMAP.md`;
3. `docs/CHANGELOG.md`;
4. actual open PR/latest commits/exact-head CI;
5. latest Content Freshness workflow runs/issues, когда вопрос касается freshness;
6. actual public deployment evidence, когда вопрос касается production.
