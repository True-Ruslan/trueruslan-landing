# Portfolio UX & Content Polish — Design

Date: **2026-08-12**

Status: **APPROVED / IMPLEMENTATION IN PROGRESS**

This document is the durable source of truth for the UX/content corrections requested after the scan-first redesign. It intentionally captures the complete user-requested backlog so individual PRs cannot make the remaining work disappear from the roadmap.

## Product intent

The site should feel light, coherent and immediately scannable without becoming visually empty or content-poor. A visitor should understand the professional hierarchy quickly, while deeper engineering material remains available for readers and search engines that need it.

The target experience is:

- calm rather than dense;
- scan-first rather than document-first;
- concise rather than slogan-heavy;
- visually consistent across homepage and secondary pages;
- technically rigorous without exposing internal acceptance jargon in the first reading path;
- accessible, indexable and useful without JavaScript.

## Non-negotiable architecture and evidence boundaries

All slices must preserve:

- static-first + build-time intelligence + progressive enhancement;
- Diplodoc as the single site-wide full-text search owner;
- repository-native clean directory URLs and all existing canonical/hreflang/OpenGraph/Sitemap/feed contracts;
- the existing RU/EN ownership model and top-right language selector;
- no new runtime navigation owner or browser-language redirect;
- accessibility, keyboard, responsive, cross-browser and visual regression gates;
- no automatic external publication/search-console mutation;
- clean-URL observation clock `2026-08-05T00:00:00Z` unchanged;
- P4.1B external-evidence review remains `IN PROGRESS / SPARSE PRE-LAUNCH BASELINE` until real evidence justifies promotion;
- P4.1C remains `WAITING` unless a concrete reviewed external finding justifies a change;
- P3.6 remains `NEXT / WAITING FOR EXTERNAL EVIDENCE`;
- controlled launch remains `not-published` until the operator actually publishes externally.

UI/content polish is allowed before controlled launch. It must not be described as SEO, engagement or conversion improvement without post-launch evidence.

---

# Backlog and accepted product contract

## N1 — Navigation & information architecture

Status: **DONE / PRODUCTION ACCEPTED** via PR #217.

Accepted contract:

1. Header and visible sidebar share the same root order:
   - `Проекты`
   - `Опыт`
   - `Материалы`
   - `Работа со мной`
   - `Обо мне`
2. `Материалы` owns, in order:
   - `Публикации`
   - `Engineering Map`
   - `Engineering Notes`
   - `Источники`
3. `Engineering Notes` is a disclosure containing `Все заметки` followed by the existing note tree.
4. `Обо мне` contains `Сейчас`, `Фото`, `Контакты`.
5. The English TOC branch remains build-owned but hidden; `English` is not shown as a permanent sidebar item.
6. Language switching remains in the top-right global selector.
7. The RU Materials hub is a first-class scan-first entry point.

N1 is closed and must not be reopened incidentally by later visual work.

## N2 — Homepage spacing, symmetry and visual rhythm

Status: **NEXT**.

### Problem statement

The homepage currently feels visually asymmetric in several horizontal sections. Text and actions appear to sit on different visual grids; some gaps feel arbitrary; the Engineering Materials / bridge area is especially prone to looking as though the copy has drifted relative to the controls.

The current source already uses a two-column bridge (`1.65fr / .75fr`, actions aligned to the end). The correction should therefore refine the existing grid rather than introduce another layout system.

### Required outcome

- one consistent content rhythm for homepage sections;
- section headings/copy use a predictable readable measure;
- bridge copy and actions feel intentionally paired, not pushed to opposite edges;
- CTA groups align consistently across Experience, Materials/Writing, Work with me and Personal bridges;
- vertical spacing between hero, proof strip, selected work and bridges follows a small repeatable spacing scale;
- no accidental large empty gutters on common desktop widths;
- mobile/tablet layout stacks naturally without horizontal overflow;
- no reduction of content merely to hide layout problems.

### Acceptance boundary

This is presentation acceptance only. It makes no claim about engagement or conversion.

## N3 — Work with me visual polish

Status: **PLANNED**.

### Problem statement

`Работа со мной` feels visually heavy: too much gray-panel treatment, too many visible borders and insufficient breathing room between intro, availability, tracks, process, handoff and boundaries.

### Required outcome

- reduce the visual weight of panel backgrounds and borders;
- increase useful whitespace between semantic sections without producing oversized empty zones;
- keep the three work tracks easy to compare;
- distinguish availability from the service-track cards without making it another large gray box;
- improve the hierarchy of `Как работаем`, handoff/CTA and boundaries;
- preserve explicit scope/boundary language rather than turning the page into generic sales copy;
- retain minimum interactive target size, focus visibility and mobile stacking;
- reuse existing collaboration/resume primitives where practical, but introduce bounded page-specific styling if reuse is the cause of visual roughness.

## N3b — Now intro and current-focus presentation

Status: **PLANNED**.

### Problem statement

The introductory text on `Сейчас` appears cramped and visually disconnected from the generated current-state block. The page reads more like an internal status log than a deliberate public snapshot.

### Required outcome

- give the intro a readable max-width and relaxed line-height;
- position explanatory copy as a short framing block, not two loose technical disclaimers;
- keep the generated current-state block authoritative for volatile project facts;
- keep the statement that project pages/Project Registry win on detailed project status;
- avoid promises, roadmap language and invented freshness claims;
- mirror the structural treatment in English where the route exists.

## N3c — Current commercial context: QWEP / MarketDB

Status: **PLANNED**.

### Truth contract

The current primary commercial activity is full-time employment at **QWEP**. The repository resume already records QWEP as the current role and contains the accepted detailed professional facts. Those existing resume facts may be reused; no new title, date, duty, metric or company claim may be invented.

**MarketDB** belongs only to historical context: it was an extracurricular/side commercial startup project and is now closed. It may remain as a small part of the professional/project history, but it must not be presented as the current commercial focus, active company or present primary activity.

### Required outcome

- audit homepage, Experience/Resume, About, Now, projects and any generated profile copy for current-versus-historical wording;
- ensure QWEP is the clear current full-time commercial context where current employment is discussed;
- preserve the existing detailed QWEP resume entry as the canonical detailed source;
- demote MarketDB to explicit historical/closed side-project context wherever it appears;
- do not delete historical value solely because the project is closed;
- keep RU/EN claims semantically aligned when both locales contain the same professional fact.

## N4 — Publications tags and card rhythm

Status: **PLANNED**.

### Problem statement

Topic chips/tags on `Публикации` look shifted and untidy. Card internals do not always read as one deliberate vertical stack, especially when titles, summaries, tags and links have different lengths.

### Required outcome

- normalize topic-chip padding, line-height, gap and wrap behavior;
- keep chips aligned from the same content edge as the title/summary;
- prevent awkward half-row offsets and accidental large gaps;
- establish predictable card rhythm: meta → title → summary → topics → related/actions;
- maintain sensible spacing for cards with missing/short optional sections;
- verify long labels and narrow mobile widths;
- do not truncate meaningful publication titles/topics simply to force equal heights;
- preserve external canonical links and publication evidence semantics.

## N5 — Engineering Notes quality, readability and SEO audit

Status: **PLANNED / RESEARCH REQUIRED BEFORE STRUCTURAL CHANGE**.

### Problem statement

The Notes collection is useful as a technical evidence layer, but individual notes may be too narrowly framed or too internal for many readers. It is not yet established whether merging notes would improve readability or instead destroy useful search intent, internal linking and precise reference URLs.

### Research questions

For every current Engineering Note, determine:

1. Is there a clear reader problem/question in the title and opening section?
2. Can a competent engineer understand it without knowing this repository's internal history?
3. Does it provide standalone explanatory value beyond documenting a PR/incident?
4. Is it materially distinct from adjacent notes?
5. Does it have enough depth/examples/evidence to justify a standalone URL?
6. Would a series/hub/related-reading structure solve discoverability better than merging?
7. Would consolidation create redirect/canonical/search-intent costs that outweigh editorial gains?

### Required research method

- inventory the real current notes and their lengths/structures/internal links;
- inspect real search evidence only as a bounded signal; sparse pre-launch data must not be overinterpreted;
- research current official search guidance from primary sources before making SEO-driven structural recommendations;
- separate editorial readability recommendations from SEO hypotheses;
- prefer non-destructive improvements (stronger intros, clearer titles, series/hubs, related notes, `Start here`) unless evidence supports merging;
- preserve existing URLs by default;
- if a merge is eventually justified, specify redirect/canonical/internal-link migration and acceptance tests before changing content.

### Possible outputs

The audit may recommend one or more of:

- keep a note standalone but rewrite its opening/summary;
- group several notes into an explicit series while retaining URLs;
- add a `Start here` / curated path to the Notes hub;
- strengthen related-reading links;
- expand a thin note with concrete examples/diagrams/evidence;
- merge only genuinely duplicative notes with an explicit migration plan.

No note is to be deleted or merged merely to reduce page count.

---

# Cross-cutting copy and visual principles

All remaining slices must follow these editorial rules:

- lead with the visitor's useful context, not internal project taxonomy;
- prefer short paragraphs and descriptive headings that support diagonal reading;
- remove redundant explanation before removing useful facts;
- avoid inflated marketing claims and generic AI/engineering slogans;
- keep technical vocabulary when it is the precise term, but explain the point around it;
- keep detail on deeper pages rather than forcing every detail onto the homepage;
- use whitespace, hierarchy and grouping instead of a proliferation of gray cards;
- do not optimize for visual symmetry by making semantic content artificially equal-length;
- preserve accessibility and semantic HTML.

# Delivery order

Implementation proceeds in bounded slices so regressions are attributable:

1. **N2 Homepage spacing/symmetry**.
2. **N3 Work with me + N3b Now + N3c professional-context reconciliation**.
3. **N4 Publications card/tag polish**.
4. **N5 Engineering Notes research audit**, followed by a separately reviewed implementation slice only for recommendations supported by the audit.
5. Reconcile durable state after each production-accepted slice.
6. Controlled manual launch follows the agreed polish work; it remains an operator action and is not silently marked published by repository changes.

# Definition of done

The umbrella backlog is complete only when:

- N1–N4 are production accepted with exact-head CI + exact Pages deployment + deployment-triggered production verification;
- N5 audit is committed with explicit per-note disposition and primary-source research;
- any N5 structural/content changes selected from that audit have their own tested/accepted implementation record;
- RU/EN route, search, metadata, privacy and accessibility gates remain green;
- current/historical commercial context is factually consistent;
- no external-evidence state is promoted without real evidence;
- `PROJECT_STATE.md`, `ROADMAP.md` and `CHANGELOG.md` reflect the final accepted state.
