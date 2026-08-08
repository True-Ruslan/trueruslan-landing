# Work with me / Private practice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a bounded `Работа со мной / Work with me` capability that converts already-earned trust into qualified engineering and educational conversations without turning TrueLanding into a generic freelancer catalogue.

**Architecture:** One fail-closed `data/collaboration.json` owns mutable collaboration truth: availability, enabled practice lines, contacts, pricing policy, legal format and the explicit contextual-surface allowlist. Build-time Node renderers project that truth into RU/EN Work with me pages, the standalone homepage, Contacts and a small curated set of case studies/Notes. Core content remains static/no-JS; exact deployed Pages identity plus deployment-triggered Production Live remains the acceptance boundary.

**Tech Stack:** Node.js 24, ESM, `node:test`, Diplodoc/YFM, parse5, static HTML/CSS, Playwright 1.61.1, Axe 4.12.1, Lighthouse 13.4.0, GitHub Actions, GitHub Pages.

## Global Constraints

- Primary identity remains `Ruslan Nemykin — Backend Engineer`.
- Engineering is primary; Teaching & Mentoring is a full but secondary professional line.
- Startup/individual work is secondary; unusual relevant requests remain welcome through an open-door message.
- Direct V1 contacts are exactly `https://t.me/TrueRuslan` and `ruslan.nemikin@gmail.com`.
- V1 pricing policy is exactly `estimate-only`; no public price list.
- Initial availability is exactly `engineering: limited`, `education: limited`, `updated: 2026-08-08`.
- Availability is manual public truth: no date-, analytics-, traffic- or repository-driven mutation.
- Paid work may calmly state self-employed/receipt support; no fictional agency identity.
- No form, CRM, booking UI, payments, lead database, conversion events, session replay, fingerprinting or AI sales chat.
- Static-first, build-time intelligence, progressive enhancement, core flow usable without JavaScript.
- One canonical owner for mutable collaboration truth; projections never become secondary truth stores.
- Diplodoc remains the only site-wide full-text search owner.
- Clean directory URLs remain canonical; `.html` is compatibility-only.
- RU/EN Work with me ship together with functional parity.
- Commercial CTA is bounded: homepage, Work with me, Contacts, and the explicit contextual allowlist only.
- Initial contextual RU mapping is exactly:
  - `landing/projects/portfolio-platform.html` → `engineering`
  - `landing/projects/notchhub.html` → `engineering`
  - `landing/notes/deployment-success-is-not-production-verification.html` → `engineering`
  - `landing/notes/server-authoritative-ai-npcs.html` → `ai-integration`
- EN contextual CTA is derived only from an already-existing i18n pair whose RU path exactly matches an approved RU target.
- No unsupported “best”, guarantees, discounts, countdowns, fake scarcity/social proof/testimonials/client counters or invented outcome claims.
- No quality-gate weakening; visual thresholds remain unchanged.
- Exact-head CI is not production acceptance.
- P3.6 measurement remains independent and must not be promoted by this feature.

---

## Task 1: Canonical collaboration model

**Files:** `data/collaboration.json`, `scripts/collaboration.js`, `scripts/collaboration.test.js`.

**Interfaces:** `loadCollaboration(filePath?)`, `validateCollaboration(raw)`, `resolveContextualTargets(model, i18nPairs)`; state enum `available|limited|consulting-only|unavailable`; category enum `engineering|ai-integration|education|expert-content`.

- [ ] Write failing tests for launch truth, exact contacts, `estimate-only`, self-employed receipt capability, safe states/paths/categories and duplicate rejection.
- [ ] Run RED: `node --test scripts/collaboration.test.js`.
- [ ] Create exact registry:

```json
{
  "availability": {"engineering":"limited","education":"limited","updated":"2026-08-08"},
  "engagements": {"engineering":true,"startup":true,"education":true,"expertContribution":true},
  "contact": {"telegram":"https://t.me/TrueRuslan","email":"ruslan.nemikin@gmail.com"},
  "commercialPolicy": {"pricing":"estimate-only","legalFormat":"self-employed-receipt-supported"},
  "contextualSurfaces": [
    {"path":"landing/projects/portfolio-platform.html","category":"engineering"},
    {"path":"landing/projects/notchhub.html","category":"engineering"},
    {"path":"landing/notes/deployment-success-is-not-production-verification.html","category":"engineering"},
    {"path":"landing/notes/server-authoritative-ai-npcs.html","category":"ai-integration"}
  ]
}
```

- [ ] Implement strict known-key/date/Telegram/email/policy/path/category validation.
- [ ] Derive EN target only when `pair.ru === approved.path`; no heuristic inference.
- [ ] GREEN: `node --test scripts/collaboration.test.js && npm test`.
- [ ] Commit `feat: add canonical collaboration model`.

## Task 2: RU/EN Work with me + build-time projection

**Files:** create `docs/landing/work-with-me.md`, `docs/en/work-with-me.md`, `docs/_assets/style/collaboration.css`; modify `.yfm`, collaboration module/tests, copy-assets/tests.

- [ ] RED renderer tests: textual RU/EN status/data attributes, canonical Telegram/mailto, self-employed note, no form controls.
- [ ] RU editorial sections: Engineering; Startup/individual; Teaching & Mentoring; Expert contribution; process; fit guidance; open door; Describe the task.
- [ ] Mutable placeholders only: `<div data-tr-collaboration-availability></div>` and `<div data-tr-collaboration-contact="work-with-me"></div>`.
- [ ] Natural EN equivalent with stable phrases `bounded engineering work with a clear outcome`, `Architecture → Implementation → Verification → Delivery → Handover`, `The formats above are examples, not a closed catalogue.`
- [ ] Implement localized `renderAvailability`, `renderDirectContact`, `applyCollaborationPages`; `unavailable` stays visible.
- [ ] Scoped `.tr-collaboration-*` CSS only; existing tokens; no color-only meaning/new animation.
- [ ] Missing/duplicate required placeholder fails build.
- [ ] Load canonical model once in `copy-assets.js`; add isolated postprocess fixture.
- [ ] Verify focused tests + `npm test && npm run build:docs && npm run check:site`.
- [ ] Commit `feat: add work with me pages`.

## Task 3: Navigation, i18n, metadata

**Files:** toc, both homepage templates, i18n registry/test, page-meta, metadata smoke, header contract test.

- [ ] RED require pair and navigation order.
- [ ] RU primary header: `Проекты`, `Опыт`, `Работа со мной`, `Notes`, `Публикации`, `Обо мне`, `Контакты`; keep Сейчас/Map/Фото/Источники in content graph.
- [ ] EN header: `Projects`, `Experience`, `Work with me`, `Now`, `Publications`, `About`, `Notes (RU)`; no invented EN Contacts.
- [ ] Add i18n pair `work-with-me`; controlled pair count 12 → 13.
- [ ] Add explicit RU/EN metadata cards/titles from the approved design.
- [ ] Verify unit/build/site integrity/metadata smoke.
- [ ] Commit `feat: expose work with me navigation and metadata`.

## Task 4: Contacts uses canonical direct-contact truth

**Files:** Contacts, collaboration module/tests, new `scripts/private-practice-contract.test.js`.

- [ ] RED copy/source guard for Work with me link, contacts placeholder, prohibited sales phrases and public price patterns.
- [ ] Preserve general Contacts/external profiles; replace direct Telegram/email with `<div data-tr-collaboration-contact="contacts"></div>`.
- [ ] Add concise `Если пишете по задаче` qualification hint; no service-catalog duplication.
- [ ] Inject from the same model; missing/duplicate placeholder fails.
- [ ] Verify tests/build/site integrity.
- [ ] Commit `feat: connect contacts to collaboration model`.

## Task 5: Evidence-led homepage bridge

**Files:** homepage templates, standalone-home module/test, copy-assets, collaboration CSS.

- [ ] RED require canonical availability, Work with me href, no form/price, honest unavailable copy.
- [ ] Implement `renderHomepageCollaborationBridge`.
- [ ] Place `{{HOME_COLLABORATION_BRIDGE}}` after Flagship projects, before Current focus.
- [ ] Preserve exactly three primary Experience/Projects/Materials paths.
- [ ] Reuse one loaded model for RU/EN.
- [ ] Verify tests/build/site integrity.
- [ ] Commit `feat: add evidence-led collaboration bridge`.

## Task 6: Explicit contextual CTA + surface guard

**Files:** collaboration module/tests, private-practice contract, copy-assets.

- [ ] RED exact four RU targets, existing EN counterparts, forbidden About/Experience.
- [ ] EN only for Portfolio Platform, NotchHub, server-authoritative AI NPCs; no invented EN deployment Note.
- [ ] Implement `renderContextualCollaborationCta` and `applyContextualCollaboration`; all enum renderers exist but V1 maps only Engineering/AI.
- [ ] Append via parse5 at the end of generated document content; missing approved target/container fails.
- [ ] Compute relative href by path; no keyword/depth guessing.
- [ ] Assert exact generated target set and absence on About/Experience/Photos/Sources/Engineering Map.
- [ ] Commit `feat: add bounded contextual collaboration bridges`.

## Task 7: Browser/no-JS/search/a11y/cross-browser

**Files:** new collaboration browser smoke; quality scenarios; browser/cross-browser/layout/i18n/search smokes; Build workflow.

- [ ] Add `CORE_SCENARIOS.workWithMe`.
- [ ] Add RU Work with me to Chromium desktop/mobile; RU+EN to Firefox/WebKit and overflow.
- [ ] Add i18n pair/no-JS parity.
- [ ] Search RU `ограниченным scope и результатом` → RU; EN `bounded engineering work with a clear outcome` → EN.
- [ ] Dedicated smoke verifies canonical truth, no form, no-JS, homepage order + primary path count 3, Contacts, exact CTA set/forbidden surfaces, Axe, overflow and diagnostics.
- [ ] Capture RU/EN desktop/mobile, homepage collaboration and Contacts mobile screenshots.
- [ ] Add Build step/artifact preservation; run pinned browser matrix.
- [ ] Commit `test: verify private practice across browsers`.

## Task 8: Visual acceptance

**File:** `tests/visual-baselines.json`.

- [ ] Run screenshots/visual regression before rebasing.
- [ ] Inspect intentional marketing/brand surfaces manually.
- [ ] Update only intentional baselines; keep exactly `sampleSize=16`, `maxMeanChannelDelta=5`, `maxDimensionDeltaRatio=0.03`.
- [ ] No unrelated baseline rebasing.
- [ ] Re-run visual gate to PASS.
- [ ] Commit `test: accept private practice visual surfaces`.

## Task 9: Exact-deployment production gate

**Files:** production routes/test; new private-practice production smoke/workflow contract; production workflow/test.

- [ ] RED clean RU/EN route constants + deployment-only workflow step + `EXPECTED_DEPLOYED_SHA`.
- [ ] Production smoke reads canonical model and verifies RU/EN 200/H1/canonical/hreflang/states/contacts, no form/price, no-JS, homepage proof ordering + three paths, nav, Contacts, exact contextual set, forbidden About/Experience, no third-party lead runtime, clean diagnostics.
- [ ] Write `production-artifacts/private-practice-production-summary.json` with expected SHA + screenshot.
- [ ] Wire `Run deployed private practice smoke` for non-PR execution with resolved deployed SHA.
- [ ] Preserve read-only permissions/evidence upload.
- [ ] GREEN full unit suite.
- [ ] Commit `test: add private practice production gate`.

## Task 10: Feature PR + exact-head verification

- [ ] After planning PR merge, start `feat/work-with-me-private-practice` from current master.
- [ ] Execute Tasks 1–9 RED→GREEN; run full unit/build/integrity/browser matrix.
- [ ] Review non-goals: no form/public prices/conversion events/extra targets/EN Contacts/P3.6 promotion/unrelated redesign.
- [ ] Open `feat: add evidence-led private practice`; say source/build/browser proof is not production acceptance.
- [ ] Require exact-head Build, CodeQL JS/TS, Dependency Review/current required checks and zero unresolved review threads.
- [ ] Inspect CI screenshots/artifacts.
- [ ] Squash verified exact head; record SHA without declaring production acceptance.

## Task 11: Exact production acceptance

- [ ] Require Pages success for exact feature squash SHA and deployment/artifact identity.
- [ ] Require deployment-triggered Production Live whose source Pages head SHA matches exactly.
- [ ] Inspect dedicated summary + all existing gates.
- [ ] On failure: preserve evidence, RED-reproduce, separate hotfix PR, no verifier weakening, repeat exact deployment acceptance.
- [ ] Record accepted SHA, Pages run/deployment/artifact+digest, Production Live run/artifact+digest, observedAt.

## Task 12: Durable acceptance ledger

**Files:** new `scripts/private-practice-acceptance.test.js`; PROJECT_STATE, ROADMAP, CHANGELOG.

- [ ] After production only, RED test exact observed IDs.
- [ ] Assert P3.6 stays `NEXT / WAITING FOR EXTERNAL EVIDENCE`, never DONE from this work.
- [ ] Record `Private engineering & educational practice — PRODUCTION ACCEPTED` and exact evidence.
- [ ] Keep future prices/forms/productized pages evidence-driven.
- [ ] Record planning/feature/hotfix if any/RED→GREEN/production history.
- [ ] GREEN acceptance test + full suite.
- [ ] Separate docs-only acceptance PR; its deployment does not replace feature deployment evidence.

## Execution Handoff

Implementation starts from `master` after this planning PR is integrated. First product change is Task 1 RED. Tasks 1–9 are one bounded feature slice; Tasks 10–12 preserve repository → artifact → deployment → live acceptance separation.

## Plan Self-Review

- **Coverage:** every approved positioning, UX, canonical-truth, navigation, bounded-surface, privacy, RU/EN, SEO/search, no-JS, browser/a11y/visual and exact-production requirement maps to an explicit task.
- **Placeholder scan:** no TBD/TODO or unresolved product choice remains.
- **Interface consistency:** one canonical loader/model, one i18n pair, one homepage placeholder, one contextual enum, one production summary.
- **Scope:** CRM, payments, booking, forms, public pricing, service-page farm and conversion tracking remain explicit non-goals.