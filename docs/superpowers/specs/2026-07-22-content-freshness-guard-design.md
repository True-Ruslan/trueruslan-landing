# P0.6 Content Freshness Guard — Design

## Goal

Добавить отдельный maintenance-layer, который выявляет устаревшие или противоречивые project/evidence snapshots и формирует actionable diagnostics, не меняя public truth автоматически.

## Chosen approach

Используется modular detector + thin scheduled workflow.

Отклонённые альтернативы:

1. Workflow-only inline script — проще сначала, но плохо тестируется и смешивает policy с orchestration.
2. Auto-update registries / auto-PR mutation — нарушает manual controlled snapshot и может превратить external signal в ложный public claim.

## Architecture

### 1. Pure freshness detector

`scripts/content-freshness.js` получает уже загруженные canonical objects и optional external observations, затем возвращает deterministic report.

Detector не делает network requests и не пишет файлы.

Finding schema:

- `code` — стабильный machine-readable identifier;
- `severity` — `info | warning | error`;
- `project` — project slug, если finding project-scoped;
- `message` — конкретное описание проблемы;
- `action` — что человеку проверить/исправить;
- `details` — bounded structured context.

### 2. Freshness rules

Initial deterministic rules:

- verified/stale snapshot с `lastVerified`, старше threshold, получает maintenance finding;
- evidence signal URL, который external probe пометил unreachable/broken, получает finding;
- public active project без evidence snapshot получает coverage finding;
- evidence snapshot с project status `verified`, когда project registry показывает lifecycle, который external repository observation явно опередил, получает drift finding;
- timeline current state и registry lifecycle проверяются только на явные contradictions, без попытки автоматически вывести product status из prose;
- external repository observation newer than latest recorded evidence observation создаёт repository-drift finding;
- stale/unverified public status сам по себе не считается build failure.

Default `lastVerified` threshold: 30 days. Threshold configurable через CLI/workflow input.

### 3. External observations

`scripts/content-freshness-report.js` — maintenance command.

Он:

- загружает `data/projects.json`, `data/project-evidence.json`, project timelines;
- читает optional JSON observations file, если workflow заранее собрал GitHub/link signals;
- запускает detector;
- пишет deterministic JSON report;
- пишет human-readable Markdown report;
- возвращает exit code 0 для clean и findings-only runs, а non-zero только для invalid input/execution failure.

Freshness findings не должны ломать обычный site build.

### 4. Scheduled GitHub Action

`.github/workflows/content-freshness.yml`:

- `schedule`: daily;
- `workflow_dispatch` для ручного запуска;
- checkout + Node 24 + `npm ci`;
- собирает bounded GitHub repository observations только для projects с public GitHub link;
- проверяет configured evidence URLs по HTTP;
- запускает maintenance command;
- сохраняет JSON/Markdown artifacts;
- создаёт или обновляет один issue с marker `<!-- content-freshness-guard -->`, если findings есть;
- закрывает существующий guard issue, когда findings исчезли;
- никогда не commit/push canonical registries.

Workflow permissions минимальные: `contents: read`, `issues: write`.

### 5. Trust boundary

Guard никогда:

- не меняет `data/projects.json`;
- не меняет `data/project-evidence.json`;
- не меняет timeline data;
- не переводит status в `verified`/`stale`/`unverified`;
- не трактует green CI как full product verification;
- не добавляет runtime dependency в public site.

## Testing

TDD coverage:

- age threshold boundary;
- missing evidence coverage;
- unreachable evidence URL observation;
- repository newer-than-evidence drift;
- deterministic ordering/output;
- no finding for fresh verified snapshot;
- stale/unverified states remain valid maintenance states;
- CLI report generation from fixture observations.

Existing full `Build` workflow remains unchanged except that new unit tests run under `npm test`.

## Definition of Done

- deterministic detector and unit tests;
- local maintenance/report command;
- daily/manual thin workflow;
- JSON + Markdown report artifacts;
- idempotent issue create/update/close behavior;
- no automatic canonical mutation;
- full existing CI matrix green on exact feature head.
