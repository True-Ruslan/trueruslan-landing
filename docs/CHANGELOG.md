# CHANGELOG — TrueRuslan Landing

> Обновлено: **2026-07-23**, после merge P2.1 Minimal RU/EN PR #38.
>
> Это не машинный список коммитов. Здесь фиксируются смысловые этапы: **что сделали, зачем, какие решения приняли, какие проблемы обнаружили и чем подтвердили результат**.
>
> Текущее состояние — `docs/PROJECT_STATE.md`. Следующие шаги — `docs/ROADMAP.md`.

---

# 2026-07-23

## P2.1 — Minimal RU/EN

### Зачем

После завершения P1 portfolio уже имело сильные case studies, grounded technical writing, evidence/freshness layers и зрелую QA-инфраструктуру. Следующий product step — дать англоязычному читателю небольшой качественный вход в лучшие public surfaces, **не переводя весь knowledge space и не создавая второй расходящийся сайт**.

### Design decision

Выбран вариант:

**один build + `/en/` namespace + один search index + shared canonical registries**.

Отклонены:

1. отдельный `docs-en/` + второй Diplodoc build — создаёт два navigation/search/build мира;
2. custom EN HTML renderer — создаёт второй rendering system;
3. полный перевод сайта одним milestone — высокий drift/maintenance cost без доказанной audience value.

Design:

`docs/superpowers/specs/2026-07-23-minimal-ru-en-design.md`

Plan:

`docs/superpowers/plans/2026-07-23-minimal-ru-en.md`

### Feature implementation

**PR #38 — `feat: add minimal RU EN portfolio layer`**

Squash:

`00f7513f685b8a8348005d0ab704ce96abe64950`

Exact implementation head:

`d5f2490bbd7beac7343c96edf1fb6e8feb9b51c6`

Final verification:

**Build #339 / run `30000373281`: fully green по полной configured matrix.**

### Controlled English scope

Созданы ровно семь bilingual pairs:

1. `/` ↔ `/en/`;
2. About;
3. Resume;
4. Projects hub;
5. LivingWorld;
6. `server-authoritative-ai-npcs`;
7. `llm-output-is-a-protocol-boundary`.

Русский остаётся default/root language. Existing Russian URLs не менялись.

English sources:

- `templates/index.en.html`;
- `docs/en/about.md`;
- `docs/en/resume.md`;
- `docs/en/projects.md`;
- `docs/en/projects/livingworld.md`;
- `docs/en/notes/server-authoritative-ai-npcs.md`;
- `docs/en/notes/llm-output-is-a-protocol-boundary.md`.

### Route-pair ownership

Добавлен:

`data/i18n.json`

Он владеет только deterministic relationship RU route ↔ EN route.

Не владеет:

- prose;
- project status;
- evidence;
- timelines;
- Notes identity/relations.

Build-time implementation:

`scripts/i18n.js`

Он валидирует safe/unique pairs и детерминированно добавляет locale semantics.

### SEO / no-JS semantics

Для всех семи пар реализовано:

- self-canonical RU;
- self-canonical EN;
- `hreflang=ru`;
- `hreflang=en`;
- `hreflang=x-default` → RU;
- обычный anchor language switch, работающий без JS.

`en/index.html` публично canonicalizes к `/en/`.

English metadata/OpenGraph использует существующие `data/page-meta.json` и OG generator; отдельной SEO-системы нет.

### Shared truth boundary

English project status берётся из того же `data/projects.json`.

Не создавались English copies:

- Project Registry;
- Project Evidence;
- project timelines;
- `data/notes.json`.

English LivingWorld — curated narrative mirror. Его machine-like Evidence/timeline не копируется: full generated layer остаётся на Russian canonical LivingWorld page из shared registries.

English note translations не являются новыми Notes entities и не создают duplicate Atom entries.

Untranslated project detail pages явно помечены `(RU)` / `Russian`.

### One-search boundary

Сохранён единственный site-wide index:

`_search/ru/index.html`

`_search/en/` не создаётся.

Dedicated browser gate отдельно проверяет отсутствие второго search index и что English UI использует existing search route.

### Standalone English homepage

`templates/index.en.html` генерируется через те же `standalone-home` / Project Registry primitives, что и Russian homepage.

Active project cards переиспользуют canonical registry:

- LivingWorld → English case study;
- untranslated details → Russian routes с CTA `Open case study (RU) →`.

### Accessibility defects, найденные feature gate

Первый dedicated bilingual browser run обнаружил два реальных hydrated Diplodoc defect class на mobile English LivingWorld:

1. icon-only `.dc-sidebar-navigation__button` и `.dc-subnavigation__share-button` без accessible name;
2. горизонтально scrollable hydrated `pre code` regions без keyboard focusability.

Axe rules **не отключались** и smoke не был ослаблен.

Root-cause fix внесён в existing progressive `repairRuntimeAccessibility()`:

- locale-aware accessible names для runtime navigation/share controls;
- `tabindex=0` для реально scrollable code regions.

Таким образом P2.1 улучшил не только EN layer, но и общий hydrated accessibility contract.

### TDD / verification trail

#### Build #310 — RED

Run `29997485306`.

Canonical i18n test существовал до `scripts/i18n.js` / `data/i18n.json`; `Test` ожидаемо failed, downstream skipped.

#### Build #314 — RED

Locale-aware project-card и multi-target registry contract был добавлен до implementation.

#### Build #318 — RED

Contracts потребовали explicit RU fallback CTA и nested `/en/` directory canonical до implementation.

#### Build #321 — RED

Standalone homepage test потребовал `ctaTransform` pass-through до implementation.

#### Build #332 — integration checkpoint

Production Diplodoc build и generated-site integrity GREEN после core bilingual integration.

#### Build #334 — browser RED

Run `29999035740`.

Новый `Minimal RU EN browser smoke` впервые дошёл до hydrated EN pages и обнаружил реальные Axe violations. Existing gates до него были green.

После exact-node diagnostics исправлена причина, а не тест.

#### Build #339 — final GREEN

Exact head:

`d5f2490bbd7beac7343c96edf1fb6e8feb9b51c6`

Run:

`30000373281`

Полностью green:

- tests;
- production Diplodoc build;
- generated-site integrity;
- mobile overflow;
- Chromium/Axe/Lighthouse;
- Sources KB;
- Project Evidence;
- Photo Stories;
- Portfolio v0.3;
- Firefox/WebKit;
- generated search;
- **Minimal RU EN browser smoke**;
- Metadata/OpenGraph;
- Engineering Map;
- unchanged visual regression;
- quality evidence upload.

Final bilingual gate проверяет все 7 pairs, canonical/hreflang, no-JS EN↔RU, one-search boundary, H1, overflow, browser diagnostics и Axe.

### Architecture preserved

Не добавлялись:

- dependency/package-lock changes;
- second search index;
- second build;
- backend/CMS/database;
- runtime translation API;
- visual baseline/threshold weakening;
- duplicated Evidence/timeline/Notes truth.

### Result

P2.1 закрыт.

Следующий actionable priority:

**P2.2 — Privacy-friendly analytics design**.

Первая genuine Photo Story остаётся independent content-dependent track.

---

## P1.4 — Additional Grounded Engineering Notes

**PR #36 — `content: add grounded LLM protocol boundary note`**

Squash `24ad81eb4f8b8a2194430dc7316a95c313d7f3f5`.

Exact head `ced6ce0208d691fd891e8b8e1cf03be4c40465d5`, Build #308 / run `29961571632` fully green.

Добавлена седьмая note:

`llm-output-is-a-protocol-boundary`

Главный lesson:

**provider success ≠ application contract success**.

Source verification выполнена по текущему `True-Ruslan/minecraft-botics-ai`: strict parser/config/tests, architecture и RC degradation contract. Недоступные historical MCA incidents не превращены в independently verified public facts.

TDD: Build #303 RED → Build #308 full GREEN.

---

# 2026-07-22

## P1.3 — Stronger Flagship Case-Study Format

**PR #34** / squash `107b69311f6eed408de5306406d9ff41f0e32ea2`.

Exact head `edda2fbbf94b808f8955a2efb00e885dbb964040`, Build #301 / run `29958607263` fully green.

LivingWorld и NODE ZERO получили общий Markdown-first contract:

`Problem → Constraints → Decisions → What failed → Current state → Evidence → What I would change now`.

Canonical Registry/timeline/Evidence ownership сохранён. Added structural contract test.

## P1.2 — Project Metadata Cleanup

**PR #31** / squash `1df2a2905ef2eb4b52173271f9012defc33b25ab`.

Exact head `12eed7ed5a8e56949a5e0cc6e777b0e9258c49ff`, Build #296 fully green.

Result: `private: true`, truthful engineering portfolio identity, canonical URLs/keywords, metadata contract. `version: 0.2.0` оставлен намеренно до release contract.

## P1.1 — Consolidated Browser Quality Harness

**PR #29** / squash `06e60425e31ef19ddae0c3ac8b0991808b45837e`.

Exact head `00633c69e56354cbb8821c34a1b772cf259c3e18`, Build #293 fully green.

Создан modular `scripts/quality-harness/`; focused runners сохранили domain ownership.

## P0.6 — Content Freshness Guard

**PR #27** / squash `33770983789fbde5c59a94972709360286a06ad5`.

Exact head `4b50dd78a41b3cbe2fce327e6c752508134862d0`, Build #269 fully green.

Guard обнаруживает freshness/link/repository/release/timeline/signal drift, но не переписывает public truth/trust автоматически.

Repository-hygiene note: случайный временный `_never_` probe commit был немедленно удалён; net tree effect zero.

## P0.5 — Grounded Engineering Notes

**PR #25** / squash `f2775b7c9150281bcb4bcc01a4e021e007e18ca0`, Build #257.

Добавлены:

- `intersection-observer-giant-table`;
- `static-first-sources-no-js`;
- `green-ci-is-not-product-verification`.

## Portfolio v0.4 — Project Evidence Layer

**PR #22** / squash `e3e48ac56b45eddeb872c04b83bff1408da6556f`, Build #247.

Canonical evidence snapshots, `verified / stale / unverified`, bounded signals, trust-aware rendering/QA.

Key lesson: **green CI не равно verified product без bounded scope и current interpretation**.

## Portfolio v0.4 — Sources Registry / Knowledge Base

**PR #20** / squash `4f4e8ff2c0f70ef60d49cdf5f8a708a71aa4ce2d`.

31 real records, canonical `data/sources.json`, strict validation, semantic cards, filters, anchors, responsive/no-JS fallback.

## Photo Stories

PR #15 platform / squash `8aa2149fc8aec3751f2da73321c06a89111f9efd`.

PR #17 QA / squash `7936638bd6473ad4f1ff0b2ef42db2289e937d83`.

Photo Stories platform готова; fake/demo album не создавался.

## Portfolio v0.3 — living engineering space

PR #13 / squash `b472aff67d69fb3cd6afa0577864371547f52a5b`.

Milestone закрепил переход от landing page к living engineering portfolio / knowledge platform: Project Registry, `/now`, timelines, Engineering Notes/feed, Engineering Map, command palette, stronger generated-site QA.

---

## Durable continuity principle

После крупных milestones состояние синхронизируется в:

1. `docs/PROJECT_STATE.md`;
2. `docs/ROADMAP.md`;
3. `docs/CHANGELOG.md`.

Эти docs — snapshot, не замена actual repository checks. В новом чате поверх них всегда проверять open PR, latest commits и exact-head CI.
