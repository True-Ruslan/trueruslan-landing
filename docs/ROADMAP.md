# ROADMAP — TrueRuslan Landing

> Обновлено: **2026-07-23**, после merge P2.1 Minimal RU/EN PR #38.
>
> Roadmap отвечает на вопрос **«что делать дальше, в каком порядке и зачем?»**.
> Текущее состояние — `docs/PROJECT_STATE.md`, история — `docs/CHANGELOG.md`.

## Принципы roadmap

Любое развитие должно сохранять:

- **static-first**;
- **build-time intelligence**;
- **progressive enhancement**;
- core content без runtime API и, где применимо, без JavaScript;
- no backend/CMS/database без реальной необходимости;
- no runtime GitHub API для core content;
- no duplicate sources of truth;
- один site-wide full-text search owner — Diplodoc;
- maintenance signals не переписывают public truth автоматически;
- сначала реальные data/evidence, потом presentation;
- evidence не говорит больше bounded scope;
- shared infrastructure не скрывает domain ownership;
- quality gates не ослабляются ради velocity.

Главная продуктовая формула:

**что я создаю → что я изучаю → какие инженерные выводы делаю → чем это подтверждено**.

---

# P0 — foundation завершён

## P0.1 Photo Stories platform — DONE

PR #15 + QA polish PR #17. Canonical `/photos/`, registries, story routes, lightbox, keyboard/touch/hash navigation и dedicated QA готовы.

## P0.2 First real Photo Story — CONTENT DEPENDENT

Только при genuine material. Fake/demo albums не добавлять.

## P0.3 Sources Registry / Knowledge Base — DONE

PR #20 / squash `4f4e8ff2c0f70ef60d49cdf5f8a708a71aa4ce2d`.

31 real records, strict validation, semantic deterministic rendering, page-local filters, stable anchors, responsive/no-JS behavior.

## P0.4 Project Evidence Layer — DONE

PR #22 / squash `e3e48ac56b45eddeb872c04b83bff1408da6556f`.

Exact head `7ce0d428327e29436a03fc2be4b94ef7c0f2f15b`, Build #247 / run `29935334882` fully green.

**Green CI/release/PR никогда автоматически не делает project `verified`.**

## P0.5 Grounded Engineering Notes — DONE

PR #25 / squash `f2775b7c9150281bcb4bcc01a4e021e007e18ca0`, Build #257.

## P0.6 Content Freshness Guard — DONE

PR #27 / squash `33770983789fbde5c59a94972709360286a06ad5`.

Exact head `4b50dd78a41b3cbe2fce327e6c752508134862d0`, Build #269 / run `29947803201` fully green.

Guard создаёт maintenance signals/report/issues, но не меняет public registries/trust state автоматически.

---

# P1 — maintainability и depth завершены

## P1.1 Consolidated Browser Quality Harness — DONE

PR #29 / squash `06e60425e31ef19ddae0c3ac8b0991808b45837e`, Build #293.

Shared browser primitives вынесены в `scripts/quality-harness/`; focused runners сохранили ownership.

## P1.2 Project Metadata Cleanup — DONE

PR #31 / squash `1df2a2905ef2eb4b52173271f9012defc33b25ab`, Build #296.

Package identity соответствует engineering portfolio / knowledge platform; `private: true`; `version: 0.2.0` намеренно не используется как product maturity indicator.

## P1.3 Stronger Flagship Case-Study Format — DONE

PR #34 / squash `107b69311f6eed408de5306406d9ff41f0e32ea2`, Build #301.

LivingWorld и NODE ZERO используют Markdown-first narrative:

`Problem → Constraints → Decisions → What failed → Current state → Evidence → What I would change now`.

Project Registry/timeline/Evidence ownership не дублируется.

## P1.4 Additional Grounded Engineering Notes — DONE

PR #36 / squash `24ad81eb4f8b8a2194430dc7316a95c313d7f3f5`.

Exact head `ced6ce0208d691fd891e8b8e1cf03be4c40465d5`, Build #308 / run `29961571632` fully green.

Добавлена `llm-output-is-a-protocol-boundary`; всего Engineering Notes — 7.

---

# P2 — audience и эксплуатация

## P2.1 Minimal RU/EN — DONE

Feature PR #38 / squash:

`00f7513f685b8a8348005d0ab704ce96abe64950`

Exact implementation head:

`d5f2490bbd7beac7343c96edf1fb6e8feb9b51c6`

Build #339 / run `30000373281`: **fully green по полной configured matrix**.

### Реализованный scope

Ровно 7 RU/EN pairs:

1. home;
2. About;
3. Resume;
4. Projects hub;
5. LivingWorld;
6. `server-authoritative-ai-npcs`;
7. `llm-output-is-a-protocol-boundary`.

Русский остаётся default/root. English живёт под `/en/`.

### Architecture decision

**Один build, один site, один search index.**

Сохранено:

- один Diplodoc build;
- один `_search/ru/` full-text index;
- один Project Registry;
- один Project Evidence registry;
- один набор timelines;
- один Notes registry;
- один Atom feed.

`data/i18n.json` хранит только route pairs.

Не создано:

- второго site/build;
- `_search/en/`;
- runtime translation API;
- browser-language redirect;
- CMS/backend/database для i18n.

### SEO / switch semantics

Для всех 7 pairs:

- self-canonical RU;
- self-canonical EN;
- `hreflang=ru`;
- `hreflang=en`;
- `hreflang=x-default` → RU;
- обычный no-JS language switch anchor.

English `en/index.html` canonical → `/en/`.

### Shared truth boundary

English prose — curated manual mirrors.

Shared factual state не копируется. В частности English LivingWorld не имеет отдельного Evidence/timeline source; full generated machine-like evidence остаётся на Russian canonical page из shared registries.

Untranslated project detail pages явно маркируются `(RU)`.

### Accessibility finding from P2.1

Новый bilingual Axe gate обнаружил реальные hydrated Diplodoc gaps:

- icon-only mobile navigation/share controls без accessible names;
- scrollable code regions без keyboard focus.

Assertions/Axe не ослаблялись. Existing runtime accessibility repair исправлен системно.

### TDD / CI trail

- Build #310 — RED canonical i18n contract;
- Build #314 — RED locale/multi-target contract;
- Build #318 — RED fallback/canonical contract;
- Build #321 — RED homepage CTA contract;
- Build #332 — production build/integrity GREEN;
- Build #334 — browser RED, обнаружены реальные a11y defects;
- Build #339 — final exact-head full matrix GREEN.

Design:

`docs/superpowers/specs/2026-07-23-minimal-ru-en-design.md`

Plan:

`docs/superpowers/plans/2026-07-23-minimal-ru-en.md`

---

## P2.2 Privacy-friendly analytics — NEXT

### Почему сейчас

Portfolio content, quality, evidence, bilingual entry points и SEO уже достаточно зрелые. До дальнейшего expansion полезнее понять **что реально используется**, но только если данные будут менять решения.

Analytics не добавляется «потому что так принято».

### Design questions до implementation

Новый spec должен сначала определить:

1. **Decision questions**
   - какие product/content решения мы хотим принимать;
   - какие metrics действительно влияют на roadmap.

2. **Minimal event model**
   - page views;
   - route/language split;
   - selected outbound/portfolio interactions — только если реально нужны;
   - никаких vanity-event explosions.

3. **Privacy boundary**
   - no advertising identifiers;
   - no cross-site tracking;
   - no fingerprinting;
   - no session replay;
   - минимизация IP/user-agent retention;
   - оценить, можно ли полностью обойтись без cookies/local IDs.

4. **Consent / legal surface**
   - определить, нужен ли consent banner для выбранной технологии/configuration;
   - не показывать бессмысленный cookie banner, если cookies/tracking реально отсутствуют.

5. **Provider vs self-hosted**
   - privacy;
   - стоимость;
   - maintenance burden;
   - доступность из GitHub Pages/static architecture.

6. **Failure semantics**
   - сайт полностью работает при блокировке analytics;
   - ad blocker/DNT/network failure не создают console noise/product errors;
   - analytics никогда не становится runtime dependency.

7. **RU/EN semantics**
   - locale/route можно измерять из path без user identity;
   - не создавать отдельные analytics systems для RU и EN.

8. **QA**
   - deterministic script loading;
   - privacy contract;
   - no cookies/identifiers if chosen architecture promises that;
   - no regressions performance/accessibility/visual.

### Critical boundary

**Никакого invasive ad profiling, cross-site tracking, session replay или personal identity graph.**

### Definition of Done

- measurement decisions определены до implementation;
- выбран минимальный privacy-preserving provider/architecture;
- data collection documented and bounded;
- site remains fully functional without analytics;
- no duplicate analytics path for RU/EN;
- privacy/no-cookie claims защищены tests where technically possible;
- performance/security/privacy impact measured;
- full exact-head quality matrix green.

---

## P2.3 Custom domain / hosting

Только при реальной operational причине уходить с текущего GitHub Pages setup.

## P2.4 Richer architecture explorer

Только когда накопится достаточно реальных architecture artifacts. Не строить 3D/canvas experience ради эффекта.

---

# Что НЕ является roadmap priority

Без нового обоснования не планировать:

- полный перевод всего сайта одним milestone;
- отдельный EN build/CMS;
- второй site-wide search engine;
- invasive analytics/ad profiling/cross-site tracking/session replay;
- AI chat поверх резюме;
- accounts/comments/likes;
- backend/database ради static content;
- runtime GitHub API;
- social feed/infinite scroll;
- automatic public-state mutation из CI/release/freshness signals;
- giant QA runner;
- decorative version bumps.

---

# Оптимальная последовательность

```text
1. P2.2 Privacy-friendly analytics design + bounded implementation
        ↓
2. P2.3 Custom domain / hosting only if an operational reason appears
        ↓
3. P2.4 Richer architecture explorer only when real artifacts justify it
```

Independent content track:

```text
First real Photo Story whenever genuine material is ready
```

Operational side-check:

- Content Freshness actual scheduled/manual run подтверждать отдельно;
- production GitHub Pages deployment подтверждать отдельно, не из факта merge.

## Правило при новом чате

Перед новым milestone:

1. открыть `docs/PROJECT_STATE.md`;
2. открыть `docs/ROADMAP.md`;
3. открыть `docs/CHANGELOG.md`;
4. проверить actual open PR/latest commits/exact-head CI;
5. если речь о freshness — проверить latest Content Freshness workflow runs/issues;
6. если речь о production — проверить actual deployed endpoint отдельно.
