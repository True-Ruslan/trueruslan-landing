# P1.1 Consolidated Browser Quality Harness — Design

## Goal

Снизить инфраструктурное дублирование browser quality suite без ослабления assertions, без обновления visual baselines и без превращения focused smoke runners в один giant monolithic runner.

## Context

Текущая quality suite намеренно разделена на focused runners:

- `browser-quality.cjs`;
- `sources-knowledge-base-smoke.cjs`;
- `project-evidence-smoke.cjs`;
- `photo-stories-browser-smoke.cjs`;
- `v03-browser-smoke.cjs`;
- `cross-browser-smoke.cjs`;
- `search-smoke.cjs`;
- `metadata-smoke.cjs`;
- `engineering-graph-smoke.cjs`;
- `visual-regression.cjs`;
- `layout-overflow-smoke.cjs`.

Domain ownership у этих runners полезен и должен сохраниться. Проблема находится ниже уровня сценариев: повторяются static server lifecycle, `.quality-tools` loading, Chromium launch fallback, context/page creation, same-origin diagnostics, horizontal-overflow checks, Axe filtering, screenshot/artifact plumbing.

## Considered approaches

### A. Shared primitives + focused runners — chosen

Создать `scripts/quality-harness/` с небольшими CJS modules и постепенно перевести существующие runners на них.

Плюсы:

- минимальный behavior change;
- focused ownership сохраняется;
- можно мигрировать runner-by-runner;
- failures остаются scenario/route-specific;
- shared behavior можно unit-test отдельно.

Минус: runners всё ещё содержат небольшую orchestration boilerplate. Это намеренно: полное устранение boilerplate потребовало бы чрезмерной абстракции.

### B. One declarative mega-runner — rejected

Один engine получает огромный manifest сценариев и выполняет всё.

Отклонено, потому что:

- domain-specific interactions становятся callbacks/config DSL;
- сложнее понять, какой subsystem владеет assertion;
- выше blast radius изменения harness;
- failure diagnostics легче потерять в generic abstraction.

### C. Minimal server/browser helper only — rejected

Вынести только static server и browser launch.

Отклонено как недостаточное: Axe, overflow, diagnostics, context defaults и evidence helpers продолжили бы расходиться между runners.

## Architecture

### 1. `scripts/quality-harness/paths.cjs`

Single source для repository quality paths:

- `ROOT`;
- `OUTPUT_DIR` (`docs-html`);
- `TOOLS_DIR` (`.quality-tools/node_modules`);
- `ARTIFACTS_DIR` (`quality-artifacts`).

Никакой mutable global state.

### 2. `scripts/quality-harness/tools.cjs`

Отвечает только за tooling/browser discovery:

- `requireQualityTool(name, label?)`;
- `findChrome()`;
- `launchChromium(chromium, options?)` с channel-first и executable-path fallback.

Firefox/WebKit launch остаётся у cross-browser runner через Playwright browser types; helper не скрывает browser-specific semantics.

### 3. `scripts/quality-harness/static-server.cjs`

Единый lifecycle static server:

- проверяет наличие `docs-html`;
- Express static serving с `.html` extension fallback;
- configurable port;
- optional gzip transport mode для `browser-quality`/Lighthouse, чтобы сохранить текущую production-like network semantics;
- возвращает `{server, baseUrl, stop()}`.

Каждый runner сохраняет собственный env-var/default port.

### 4. `scripts/quality-harness/browser.cjs`

Context/page factory без domain logic:

- `createScenarioPage(browser, options)`;
- default `colorScheme: dark` только если caller явно не переопределил;
- optional viewport/reducedMotion/javaScriptEnabled;
- возвращает `{context, page, close}`.

Harness не решает, сколько scenarios запускать и в каком порядке.

### 5. `scripts/quality-harness/diagnostics.cjs`

Shared diagnostics:

- same-origin URL check;
- `pageerror` capture;
- request-failure capture;
- HTTP >=400 same-origin response capture;
- configurable ignored abort reasons (`ERR_ABORTED`, `NS_BINDING_ABORTED`, etc.);
- `assertClean(label)` формирует route/scenario-specific error.

Third-party failures не становятся false positives, если runner раньше их не считал blocking.

### 6. `scripts/quality-harness/assertions.cjs`

Shared generic assertions:

- `measureHorizontalOverflow(page)`;
- `assertNoHorizontalOverflow(page, label, tolerance = 2)`;
- `measureHorizontalScroll(page)` для отдельного layout smoke, который проверяет реальный `maxScrollX`;
- `blockingAxeViolations(axeResult, impacts = ['serious', 'critical'])`;
- `assertNoBlockingAxe({page, label, AxeBuilder, include, exclude, artifactName})`.

Domain assertions (Photo lightbox, Evidence trust border, Sources filtering, command palette, metadata contract) сюда не переносятся.

### 7. `scripts/quality-harness/evidence.cjs`

Shared artifact plumbing:

- `ensureArtifactsDir()`;
- `writeJsonArtifact(name, value)`;
- `writeTextArtifact(name, value)`;
- `captureScreenshot(page, name, options?)`.

Default screenshot semantics должны совпадать с текущими quality screenshots: `fullPage: true`, `animations: 'disabled'`.

### 8. `scripts/quality-harness/scenarios.cjs`

Только стабильные общие declarations:

- viewport constants (`desktop`, `mobile`, compact desktop);
- common core routes/headings для `home`, `projects`, `resume`.

Не переносить сюда feature-specific expectations или interaction callbacks.

## Migration scope

В milestone переводятся на shared primitives все browser-facing focused runners, где реально есть duplication:

1. `browser-quality.cjs`;
2. `sources-knowledge-base-smoke.cjs`;
3. `project-evidence-smoke.cjs`;
4. `photo-stories-browser-smoke.cjs`;
5. `v03-browser-smoke.cjs`;
6. `cross-browser-smoke.cjs`;
7. `search-smoke.cjs`;
8. `metadata-smoke.cjs`;
9. `engineering-graph-smoke.cjs`;
10. `layout-overflow-smoke.cjs`.

`visual-regression.cjs` не будет искусственно превращён в browser runner. Он может использовать только path/tool/evidence helpers, если это уменьшает duplication без изменения comparison semantics.

## Behavior preservation rules

Migration не должна менять:

- route list;
- viewport dimensions;
- wait strategies (`networkidle` / `load`);
- domain assertions;
- Axe blocking impacts;
- overflow tolerance;
- screenshots names;
- summary artifact names;
- Lighthouse budget;
- visual baseline files или thresholds;
- workflow step names/order без отдельной необходимости.

Любое намеренное изменение из этого списка требует отдельного design decision и не входит в P1.1.

## Testing strategy

### Unit contract

`scripts/quality-harness.test.js` проверяет pure/shared contracts:

- quality paths;
- same-origin semantics;
- abort filtering/deduplication;
- overflow measurement/assertion via fake page objects;
- Axe blocking-impact filtering;
- evidence path/default screenshot options;
- common scenario declarations immutable/expected.

### TDD migration

1. Сначала RED contract tests импортируют ещё не существующие harness modules.
2. Минимальные modules доводят unit contract до GREEN.
3. Runners мигрируются небольшими slices без изменения assertions.
4. После каждого meaningful slice PR CI должен пройти `npm test` и targeted existing gates, а финальный exact head — всю configured matrix.

### Full acceptance

Финальный exact head обязан пройти текущую полную Build matrix:

- tests;
- production Diplodoc build;
- generated-site integrity;
- mobile overflow;
- Chromium/Axe/Lighthouse;
- Sources Knowledge Base;
- Project Evidence;
- Photo Stories;
- v0.3 regression;
- Firefox/WebKit;
- generated search;
- metadata/OpenGraph;
- Engineering Map;
- visual regression;
- quality evidence upload.

## Failure diagnostics

Shared helpers должны улучшать, а не обобщать ошибки до бесполезного уровня.

Каждая ошибка обязана сохранять caller-provided label (`runner/scenario/route`). Domain runner остаётся ответственным за смысловой текст своих assertions.

При browser failures screenshots/artifacts сохраняются с текущими stable names. Harness не должен ловить и скрывать exceptions.

## Non-goals

P1.1 не включает:

- Playwright Test migration;
- TypeScript migration;
- изменение CI parallelization;
- изменение visual baselines;
- изменение Lighthouse budgets;
- объединение всех scenarios в manifest/DSL;
- package metadata cleanup (P1.2);
- case-study content changes (P1.3).

## Definition of Done

- `scripts/quality-harness/` содержит маленькие responsibility-focused modules;
- shared server/browser/context/diagnostics/Axe/overflow/evidence duplication существенно уменьшена;
- focused runners сохраняют domain ownership и читаемость;
- existing route/scenario assertions не ослаблены;
- failure messages остаются scenario-level actionable;
- visual baselines не менялись;
- `npm test` включает harness unit contract;
- full existing CI matrix green на exact feature head;
- `PROJECT_STATE`, `ROADMAP`, `CHANGELOG` после merge фиксируют P1.1 DONE и следующий P1.2 priority.
