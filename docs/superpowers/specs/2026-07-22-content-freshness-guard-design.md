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
- external repository observation newer than latest recorded evidence observation создаёт repository-drift finding;
- registry/timeline/evidence contradictions определяются только по explicit structured facts, без NLP/guessing по narrative prose;
- timeline с несколькими `current` entries или без `current` при наличии timeline reference получает deterministic structure finding;
- evidence `lastVerified` не может быть новее всех recorded signal observations без отдельного manual signal на ту же или более позднюю дату;
- stale/unverified state сам по себе не является ошибкой и не вызывает auto-mutation.

Guard **не требует evidence snapshot для каждого active/public project**: текущий Project Evidence Layer имеет намеренно ограниченный controlled scope, и отсутствие snapshot вне этого scope не считается freshness defect.

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

### 4. External probe adapter

`scripts/content-freshness-probe.js` выполняется только как maintenance tooling.

Он:

- берёт только явно настроенные `project.links.github`;
- для GitHub repository URL получает bounded metadata (`pushed_at`, optional latest release);
- проверяет только явно записанные evidence signal URLs;
- нормализует network/HTTP failures в observations, а не изменяет canonical data;
- пропускает проекты без публичного GitHub URL вместо догадок о repository identity.

### 5. Scheduled GitHub Action

`.github/workflows/content-freshness.yml`:

- `schedule`: daily;
- `workflow_dispatch` для ручного запуска;
- checkout + Node 24 + `npm ci`;
- запускает external probe;
- запускает maintenance report command;
- сохраняет JSON/Markdown artifacts;
- создаёт или обновляет один issue с marker `<!-- content-freshness-guard -->`, если findings есть;
- закрывает существующий guard issue, когда findings исчезли;
- никогда не commit/push canonical registries.

Workflow permissions минимальные: `contents: read`, `issues: write`.

### 6. Trust boundary

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
- unreachable evidence URL observation;
- repository newer-than-evidence drift;
- timeline structure contradictions;
- `lastVerified` / signal chronology contradiction;
- deterministic ordering/output;
- no finding for fresh verified snapshot;
- stale/unverified states remain valid maintenance states;
- no false-positive coverage requirement for projects outside controlled evidence scope;
- CLI report generation from fixture observations;
- probe normalization through injected fetch.

Existing full `Build` workflow remains unchanged except that new unit tests run under `npm test`.

## Definition of Done

- deterministic detector and unit tests;
- local maintenance/report command;
- bounded external probe adapter;
- daily/manual thin workflow;
- JSON + Markdown report artifacts;
- idempotent issue create/update/close behavior;
- no automatic canonical mutation;
- full existing CI matrix green on exact feature head.
