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

**Interfaces:**
- `loadCollaboration(filePath?) -> CollaborationModel`
- `validateCollaboration(raw) -> CollaborationModel`
- `resolveContextualTargets(model, i18nPairs) -> Array<{path, locale, category}>`
- `AVAILABILITY_STATES = ['available','limited','consulting-only','unavailable']`
- `CONTEXTUAL_CATEGORIES = ['engineering','ai-integration','education','expert-content']`

- [ ] Write failing tests for launch truth, exact contacts, `estimate-only`, self-employed receipt capability, safe states/paths/categories and duplicate rejection.
- [ ] Run RED: `node --test scripts/collaboration.test.js`.
- [ ] Create the exact V1 registry:

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

- [ ] Implement strict validation: known keys only, `YYYY-MM-DD`, `https://t.me/...`, valid email, exact policy enums, safe normalized `.html` paths, unique contextual paths/categories.
- [ ] Add EN derivation only when `pair.ru === approved.path`; no slug/keyword inference.
- [ ] Run GREEN: `node --test scripts/collaboration.test.js && npm test`.
- [ ] Commit `feat: add canonical collaboration model`.

---

## Task 2: RU/EN Work with me pages and build-time truth projection

**Files:** create `docs/landing/work-with-me.md`, `docs/en/work-with-me.md`, `docs/_assets/style/collaboration.css`; modify `docs/.yfm`, `scripts/collaboration.js`, `scripts/collaboration.test.js`, `scripts/copy-assets.js`, `scripts/copy-assets.test.js`.

**Interfaces:** `renderAvailability`, `renderDirectContact`, `applyCollaborationPages`.

- [ ] Write RED renderer tests for textual RU/EN states, data attributes, canonical Telegram/mailto, self-employed note and absence of form controls.
- [ ] Create RU page with approved sections: Engineering; Startup/individual; Teaching & Mentoring; Expert contribution; process; fit guidance; open door; Describe the task.
- [ ] Keep mutable truth only in `<div data-tr-collaboration-availability></div>` and `<div data-tr-collaboration-contact="work-with-me"></div>`.
- [ ] Create natural EN equivalent. Stable search phrases: `bounded engineering work with a clear outcome`, `Architecture → Implementation → Verification → Delivery → Handover`, `The formats above are examples, not a closed catalogue.`
- [ ] Implement renderers; `unavailable` changes copy but never hides the route.
- [ ] Add scoped `.tr-collaboration-*` CSS with existing tokens, no color-only status and no new animation; load through `.yfm`.
- [ ] Fail if required generated placeholders are missing or duplicated.
- [ ] Load collaboration once in `copy-assets.js` and reuse the same validated object.
- [ ] Add isolated postprocess fixture in `copy-assets.test.js`.
- [ ] Verify: `node --test scripts/collaboration.test.js scripts/copy-assets.test.js && npm test && npm run build:docs && npm run check:site`.
- [ ] Commit `feat: add work with me pages`.

---

## Task 3: Navigation, i18n and metadata

**Files:** `docs/toc.yaml`, `templates/index.html`, `templates/index.en.html`, `data/i18n.json`, `scripts/i18n.test.js`, `data/page-meta.json`, `scripts/metadata-smoke.cjs`, `scripts/header-chrome-unifier.test.js`.

- [ ] RED: require Work with me pair and navigation order.
- [ ] RU primary header becomes exactly: `Проекты`, `Опыт`, `Работа со мной`, `Notes`, `Публикации`, `Обо мне`, `Контакты`.
- [ ] `Сейчас`, Map, Фото and Источники remain in the content/ToC graph; only primary-header density changes.
- [ ] EN standalone header becomes: `Projects`, `Experience`, `Work with me`, `Now`, `Publications`, `About`, `Notes (RU)`.
- [ ] Add `{"id":"work-with-me","ru":"landing/work-with-me.html","en":"en/work-with-me.html"}` and update controlled i18n count 12 → 13.
- [ ] Add RU metadata title `Работа со мной — Backend-разработка, консультации и наставничество | Руслан Немыкин`, EN title `Work with me — Backend engineering, consulting and mentoring | Ruslan Nemykin`, cards `work-with-me`/`work-with-me-en`.
- [ ] Verify unit/build/site integrity/metadata smoke.
- [ ] Commit `feat: expose work with me navigation and metadata`.

---

## Task 4: Contacts uses canonical direct-contact truth

**Files:** `docs/landing/contacts.md`, `scripts/collaboration.js`, `scripts/collaboration.test.js`; create `scripts/private-practice-contract.test.js`.

- [ ] RED source/copy guard requires Work with me link and `data-tr-collaboration-contact="contacts"`; scan controlled commercial copy for prohibited cheap-sales phrases and public currency/price patterns.
- [ ] Preserve general Contacts purpose/external profiles; replace hard-coded Telegram/email with canonical placeholder.
- [ ] Add a short `Если пишете по задаче` section explaining what context to send; do not duplicate service catalogue.
- [ ] Build injects canonical direct contacts; missing/duplicate placeholder fails.
- [ ] Verify full tests/build/site integrity.
- [ ] Commit `feat: connect contacts to collaboration model`.

---

## Task 5: Evidence-led homepage bridge

**Files:** both homepage templates, `scripts/standalone-home.js`, its test, `scripts/copy-assets.js`, collaboration CSS.

**Interface:** `renderHomepageCollaborationBridge(model, {locale})`; placeholder `{{HOME_COLLABORATION_BRIDGE}}`.

- [ ] RED tests require canonical availability, Work with me href, no form/price and honest `unavailable` copy.
- [ ] Render one restrained collaboration surface from the canonical model.
- [ ] Place it after Flagship projects and before Current focus.
- [ ] Preserve exactly three primary Experience/Projects/Materials paths; collaboration is never card #4.
- [ ] Reuse the one loaded canonical model for RU/EN.
- [ ] Verify tests/build/site integrity.
- [ ] Commit `feat: add evidence-led collaboration bridge`.

---

## Task 6: Explicit contextual CTA and surface guard

**Files:** `scripts/collaboration.js`, its tests, private-practice contract test, `scripts/copy-assets.js`.

**Interfaces:** `renderContextualCollaborationCta`, `applyContextualCollaboration`.

- [ ] RED with temp HTML for exact four RU approved pages, existing EN counterparts, forbidden About/Experience.
- [ ] Require EN targets only for Portfolio Platform, NotchHub and server-authoritative AI NPCs; the deployment Note has no EN pair and gets no invented translation.
- [ ] Implement all four allowed category renderers, but map only Engineering/AI in V1.
- [ ] Append with parse5 at the end of stable generated document content; approved missing target/container fails.
- [ ] Compute relative Work with me href by path, never guessed `../` depth.
- [ ] Build and assert exact contextual target list; no About/Experience/Photos/Sources/Engineering Map automatic bridge.
- [ ] Commit `feat: add bounded contextual collaboration bridges`.

---

## Task 7: Search, browser, no-JS, accessibility and cross-browser proof

**Files:** create `scripts/collaboration-browser-smoke.cjs`; modify quality scenarios, browser-quality, cross-browser, layout-overflow, i18n-browser, search smoke and Build workflow.

- [ ] Add `CORE_SCENARIOS.workWithMe` for `/landing/work-with-me/`.
- [ ] Cover Work with me in Chromium desktop/mobile, Firefox, WebKit and mobile overflow; remove no existing scenario.
- [ ] Add `work-with-me` to i18n browser pairs and no-JS parity.
- [ ] Search: RU `ограниченным scope и результатом` → RU route; EN `bounded engineering work with a clear outcome` → EN route.
- [ ] Dedicated collaboration smoke verifies RU/EN structure, same canonical truth, no form, no-JS contacts, homepage bridge after proof with primary-path count 3, Contacts handoff, exact contextual allowlist/forbidden surfaces, Axe, overflow and diagnostics.
- [ ] Capture RU/EN Work with me desktop/mobile, homepage collaboration and Contacts mobile screenshots.
- [ ] Add Build step `Work with me browser smoke` and preserve artifacts.
- [ ] Run local browser matrix with CI-pinned versions.
- [ ] Commit `test: verify private practice across browsers`.

---

## Task 8: Visual acceptance

**File:** `tests/visual-baselines.json`.

- [ ] Run visual regression before rebasing.
- [ ] Inspect every intentional screenshot for Engineering-primary hierarchy, Teaching-secondary visibility, non-salesy CTA, textual availability and header density.
- [ ] Update only intentional baselines. Keep exactly `sampleSize=16`, `maxMeanChannelDelta=5`, `maxDimensionDeltaRatio=0.03`.
- [ ] Do not rebase unrelated Engineering Map/Search/project baselines.
- [ ] Re-run visual regression to PASS.
- [ ] Commit `test: accept private practice visual surfaces`.

---

## Task 9: Exact-deployment production gate

**Files:** production routes/test, new `scripts/production-private-practice-smoke.cjs`, new workflow contract test, production-live workflow/test.

- [ ] RED: require `https://trueruslan.ru/landing/work-with-me/` and `/en/work-with-me/`, deployment-only step and `EXPECTED_DEPLOYED_SHA`.
- [ ] Add clean route constants; no `.html` canonical.
- [ ] Production smoke reads `data/collaboration.json` and verifies RU/EN 200, H1, canonical/hreflang, exact states/contacts, no form/price, no-JS, homepage bridge after proof and three primary paths, primary navigation, Contacts, exact contextual set, forbidden About/Experience, no third-party lead runtime, clean diagnostics.
- [ ] Write `production-artifacts/private-practice-production-summary.json` with expected SHA and screenshot evidence.
- [ ] Wire `Run deployed private practice smoke` only for non-PR events, passing resolved deployed SHA.
- [ ] Preserve read-only permissions/evidence upload contract.
- [ ] Run full unit suite.
- [ ] Commit `test: add private practice production gate`.

---

## Task 10: Feature PR and exact-head verification

- [ ] After planning PR merge, start `feat/work-with-me-private-practice` from current `master`.
- [ ] Execute Tasks 1–9 RED→GREEN; run `npm test && npm run build:docs && npm run check:site` plus browser matrix.
- [ ] Review diff against non-goals: no form, public prices, conversion events, extra targets, EN Contacts, P3.6 promotion or unrelated redesign.
- [ ] Open `feat: add evidence-led private practice`; state explicitly that source/build/browser proof is not production acceptance.
- [ ] Require exact-head Build, CodeQL JS/TS, Dependency Review and current required checks; zero unresolved review threads.
- [ ] Inspect CI screenshots/artifacts.
- [ ] Squash merge only the verified exact head and record the squash SHA without calling it production accepted yet.

---

## Task 11: Exact production acceptance

- [ ] Require Pages success for the exact feature squash SHA and record deployment identity/artifacts.
- [ ] Require deployment-triggered Production Live whose source Pages head SHA is the exact feature squash SHA.
- [ ] Inspect the private-practice production summary and all existing production gates.
- [ ] If production fails: preserve evidence, RED-reproduce, separate hotfix PR, no verifier weakening, repeat exact deployment acceptance.
- [ ] Record accepted tuple: product SHA, Pages run, deployment ID, Pages artifact+digest, Production Live run, production artifact+digest, `observedAt`.

---

## Task 12: Durable acceptance ledger

**Files:** create `scripts/private-practice-acceptance.test.js`; modify PROJECT_STATE, ROADMAP, CHANGELOG.

- [ ] After Task 11 only, write RED durable-state assertions using the exact observed IDs.
- [ ] Prove P3.6 remains `NEXT / WAITING FOR EXTERNAL EVIDENCE` and never becomes DONE from this feature.
- [ ] Record `Private engineering & educational practice — PRODUCTION ACCEPTED` plus exact evidence in PROJECT_STATE.
- [ ] Record V1 accepted in ROADMAP while keeping future prices/forms/productized pages evidence-driven.
- [ ] Record planning/feature/hotfix if any/RED→GREEN/exact production evidence in CHANGELOG.
- [ ] Run `node --test scripts/private-practice-acceptance.test.js && npm test` to GREEN.
- [ ] Use a separate docs-only acceptance PR; its later deployment does not replace the accepted product deployment evidence.

---

## Execution Handoff

Implementation begins from `master` only after this planning PR is integrated. The first product change is Task 1 RED. Tasks 1–9 stay one bounded feature slice; Tasks 10–12 preserve the existing repository → artifact → deployment → live acceptance evidence separation.

## Plan Self-Review

- **Coverage:** all approved positioning, UX, canonical truth, navigation, bounded surfaces, privacy, RU/EN, SEO/search, no-JS, browser/a11y/visual and exact-production requirements map to explicit tasks.
- **Placeholder scan:** no TBD/TODO or unresolved design choice remains.
- **Interface consistency:** one loader, one model, one i18n pair, one homepage placeholder, one contextual enum, one production summary.
- **Scope:** CRM, payments, booking, form providers, price catalogue, service-page farm and conversion tracking remain explicit non-goals.