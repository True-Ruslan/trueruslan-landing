# ROADMAP — TrueRuslan Landing

> Обновлено: **2026-07-22**, после merge P0.6 Content Freshness Guard PR #27.
>
> Roadmap отвечает на вопрос **«что делать дальше, в каком порядке и зачем?»**.
> Фактическое текущее состояние — `docs/PROJECT_STATE.md`, история — `docs/CHANGELOG.md`.

## Принципы roadmap

Любое развитие должно сохранять:

- **static-first**;
- **build-time intelligence**;
- **progressive enhancement**;
- core content доступен без runtime API и, где применимо, без JavaScript;
- no backend/CMS/database без реальной необходимости;
- no runtime GitHub API для core content;
- no build-time GitHub API dependency в основном site build;
- no duplicate sources of truth;
- maintenance signals не переписывают public truth автоматически;
- сначала реальные data/evidence, потом presentation;
- evidence не говорит больше, чем доказывает bounded scope;
- новые quality gates не ослабляют существующие.

Главная продуктовая формула:

**что я создаю → что я изучаю → какие инженерные выводы делаю → чем это подтверждено**.

---

# P0 — завершённый foundation layer

## P0.1 Photo Stories platform — DONE

Реализованы PR #15 + QA polish PR #17:

- canonical `/photos/`;
- album/archive registries;
- cinematic/editorial story pages;
- fullscreen lightbox;
- keyboard/touch/hash navigation;
- responsive/browser QA.

Первая настоящая Photo Story остаётся content-dependent и не блокирует roadmap.

## P0.2 First real Photo Story — CONTENT DEPENDENT

Добавлять только при genuine material:

- 8–20 осмысленно отобранных кадров;
- cover;
- intro от первого лица;
- место/дата/category;
- meaningful alt;
- editorial sequence;
- hero/OG/deep-links/lightbox/lazy/LCP verification.

Fake/demo albums не добавлять.

## P0.3 Sources Registry / Knowledge Base — DONE

PR #20 / squash:

`4f4e8ff2c0f70ef60d49cdf5f8a708a71aa4ce2d`

Готово:

- canonical `data/sources.json`;
- 31 migrated real records;
- strict validation;
- deterministic semantic rendering;
- page-local filtering;
- stable anchors/related materials;
- responsive UI;
- semantic no-JS fallback;
- dedicated browser/Axe/no-JS gate.

Sources filter не является вторым global search engine.

## P0.4 Project Evidence Layer — DONE

PR #22 / squash:

`e3e48ac56b45eddeb872c04b83bff1408da6556f`

Exact head:

`7ce0d428327e29436a03fc2be4b94ef7c0f2f15b`

Build #247 / run `29935334882`: **fully green**.

Готово:

- canonical `data/project-evidence.json`;
- controlled scope LivingWorld + NODE ZERO;
- `verified / stale / unverified`;
- bounded automated/manual signals;
- strict validation;
- build-time semantic rendering;
- no-JS fallback;
- trust-state visual semantics;
- dedicated browser/Axe/no-JS quality gate.

Ключевая граница:

**green CI/release/PR никогда автоматически не делает project `verified`.**

## P0.5 Grounded Engineering Notes — DONE

PR #25 / squash:

`f2775b7c9150281bcb4bcc01a4e021e007e18ca0`

Exact head:

`8a2973961e5ec38e4c8b3e0626460c04e88438a8`

Build #257 / run `29943616448`: **fully green**.

Добавлены 3 repository-grounded notes:

1. `intersection-observer-giant-table`;
2. `static-first-sources-no-js`;
3. `green-ci-is-not-product-verification`.

Всего Engineering Notes: 6.

Будущие candidates после отдельной source verification:

- Minecraft voice AI pipeline;
- malformed/almost-correct LLM JSON protocol failures.

## P0.6 Content Freshness Guard — DONE

PR #27 / squash:

`33770983789fbde5c59a94972709360286a06ad5`

Exact implementation head:

`4b50dd78a41b3cbe2fce327e6c752508134862d0`

Build #269 / run `29947803201`: **fully green**.

### Что реализовано

Deterministic detector:

`scripts/content-freshness.js`

Local report command:

`scripts/content-freshness-report.js`

Bounded external probe:

`scripts/content-freshness-probe.js`

Scheduled/manual orchestration:

`.github/workflows/content-freshness.yml`

Maintenance rules:

- `lastVerified` age threshold, default 30 days;
- evidence-link reachability;
- repository activity drift;
- newer release while registry remains release-candidate;
- timeline structured-state contradictions;
- verified snapshot with newer recorded signal requires review.

Output:

- deterministic JSON report;
- human-readable Markdown report;
- workflow artifacts;
- one idempotent GitHub issue with stable marker;
- issue closes when findings disappear.

### Critical trust boundary

Guard **никогда автоматически**:

- не меняет Project Registry;
- не меняет Project Evidence;
- не меняет timelines;
- не переводит `verified / stale / unverified`;
- не превращает external repository/release/CI signal в public verification claim.

Evidence coverage остаётся scoped: отсутствие snapshot у project вне controlled Evidence Layer scope само по себе не finding.

Workflow permissions:

- `contents: read`;
- `issues: write`;
- `persist-credentials: false`;
- no commit/push path.

### TDD trail

- Build #259 — detector RED;
- Build #260 — detector GREEN;
- Build #261/#262 — probe/report RED;
- Build #265 — probe/report GREEN;
- Build #266 — workflow contract RED;
- Build #267 — workflow contract GREEN;
- Build #269 — full exact-head matrix GREEN.

### Operational follow-up

Первый реальный post-merge scheduled/manual Content Freshness run нужно наблюдать отдельно.

До появления concrete workflow-run evidence не считать production issue lifecycle фактически проверенным только из PR CI.

---

# P1 — актуальный technical priority

## P1.1 Consolidated Browser Quality Harness — NEXT

Сейчас quality suite намеренно состоит из focused runners:

- browser-quality;
- Sources Knowledge Base smoke;
- Project Evidence smoke;
- Photo Stories smoke;
- Portfolio v0.3 smoke;
- cross-browser;
- search;
- metadata;
- Engineering Map;
- visual regression;
- layout overflow.

Проблема: повторяются infrastructure primitives.

### Цель

Создать модульный `quality-harness/`:

- shared static-server lifecycle;
- browser/context factories;
- request/page-error diagnostics;
- Axe helpers;
- overflow helpers;
- screenshot/evidence helpers;
- declarative route/scenario definitions.

### Ограничение

**Не превращать это в один giant monolithic runner.**

Focused scenario ownership должен сохраниться.

### Definition of Done

- общие primitives вынесены без ослабления assertions;
- existing runners остаются понятными и focused;
- lifecycle/browser/context duplication уменьшена;
- failures сохраняют route/scenario-level diagnostics;
- full existing matrix green;
- visual baselines не обновляются без реального визуального изменения.

---

## P1.2 Project metadata cleanup

Исторический debt:

- `package.json` version не отражает текущий maturity/milestone;
- description всё ещё говорит «Многостраничный лендинг»;
- keywords нужно пересмотреть после evolution в engineering portfolio / knowledge platform.

Версию менять только как осознанное milestone/release решение.

## P1.3 Stronger flagship case-study format

LivingWorld и NODE ZERO постепенно привести к структуре:

1. Problem
2. Constraints
3. Decisions
4. What failed
5. Current state
6. Evidence
7. What I would change now

Project Evidence уже владеет machine-like current/evidence facts; narrative не должен вручную дублировать registry state.

## P1.4 Additional grounded Notes

Публиковать только после source verification соответствующих repositories.

Candidates:

- voice AI pipeline Minecraft NPC;
- malformed/almost-correct LLM JSON handling.

Не писать абстрактные SEO-статьи ради количества.

---

# P2 — аудитория и эксплуатация

## P2.1 Minimal RU/EN

Не переводить весь сайт сразу.

Первый слой позже:

- homepage;
- About;
- Resume;
- Projects hub;
- LivingWorld;
- 1–2 лучших Engineering Notes.

Русский остаётся default.

## P2.2 Privacy-friendly analytics

Только product-useful aggregate signals без invasive ad profiling/cookie surface.

## P2.3 Custom domain / hosting

Отложено до реальной причины уходить с текущего GitHub Pages setup.

## P2.4 Richer architecture explorer

Расширять Engineering Map только при достаточном количестве реальных architecture artifacts.

Не строить 3D/canvas experience ради эффекта.

---

# Что НЕ является roadmap priority

Без нового обоснования не планировать:

- AI chat поверх резюме;
- accounts;
- comments/likes;
- CMS;
- database;
- backend ради static content;
- runtime GitHub API;
- второй site-wide search engine;
- social feed;
- infinite scroll;
- automatic public-state mutation из CI/release/freshness signals.

---

# Оптимальная последовательность следующих действий

```text
1. Observe first real post-merge Content Freshness workflow run when available
        ↓
2. P1.1 Consolidate shared browser-quality primitives
        ↓
3. Metadata/version cleanup
        ↓
4. Strengthen flagship case-study narrative structure
        ↓
5. Add additional grounded Notes after source verification
        ↓
6. Add first real Photo Story whenever genuine material is ready (non-blocking)
        ↓
7. Minimal EN / privacy analytics / custom domain later
```

## Правило при новом чате

Перед новым milestone:

1. открыть `docs/PROJECT_STATE.md`;
2. открыть `docs/ROADMAP.md`;
3. открыть `docs/CHANGELOG.md`;
4. проверить actual open PR/latest commits/exact-head CI;
5. если речь о freshness — проверить latest Content Freshness workflow run/issues;
6. не считать public deployment подтверждённым только потому, что `master` обновился.
