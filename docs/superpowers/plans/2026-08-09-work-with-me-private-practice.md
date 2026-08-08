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

**Files:**
- Create: `data/collaboration.json`
- Create: `scripts/collaboration.js`
- Create: `scripts/collaboration.test.js`

**Interfaces:**
- `loadCollaboration(filePath?) -> CollaborationModel`
- `validateCollaboration(raw) -> CollaborationModel`
- `resolveContextualTargets(model, i18nPairs) -> Array<{path, locale, category}>`
- `AVAILABILITY_STATES = ['available','limited','consulting-only','unavailable']`
- `CONTEXTUAL_CATEGORIES = ['engineering','ai-integration','education','expert-content']`

- [ ] **Step 1: Write failing model tests.** Assert the launch state, exact Telegram/email, `estimate-only`, self-employed receipt capability, allowed availability states, safe local `.html` contextual paths, duplicate-path rejection and unknown-category rejection.
- [ ] **Step 2: Run RED.** `node --test scripts/collaboration.test.js` must fail because the module/data do not exist.
- [ ] **Step 3: Create exact V1 data.**

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

- [ ] **Step 4: Implement strict fail-closed validation.** Reject unknown top-level/nested fields, malformed `YYYY-MM-DD`, non-`https://t.me/...` Telegram URL, malformed email, any pricing value except `estimate-only`, any legal format except `self-employed-receipt-supported`, unsafe/duplicate contextual paths and unknown categories.
- [ ] **Step 5: Implement exact EN derivation.** `resolveContextualTargets()` always returns approved RU targets and adds `pair.en` only where `pair.ru === approved.path`; no keyword/slug inference.
- [ ] **Step 6: Run GREEN.** `node --test scripts/collaboration.test.js && npm test`.
- [ ] **Step 7: Commit.** Stage the three files and commit `feat: add canonical collaboration model`.

---

## Task 2: RU/EN Work with me pages and build-time truth projection

**Files:**
- Create: `docs/landing/work-with-me.md`
- Create: `docs/en/work-with-me.md`
- Create: `docs/_assets/style/collaboration.css`
- Modify: `docs/.yfm`
- Modify: `scripts/collaboration.js`
- Modify: `scripts/collaboration.test.js`
- Modify: `scripts/copy-assets.js`
- Modify: `scripts/copy-assets.test.js`

**Interfaces:**
- `renderAvailability(model, {locale}) -> string`
- `renderDirectContact(model, {locale, variant}) -> string`
- `applyCollaborationPages(outputDir, model, options) -> diagnostics`

- [ ] **Step 1: Write RED renderer tests.** Require RU/EN textual availability with `data-tr-availability-engineering` and `data-tr-availability-education`; direct Telegram/mailto links; self-employed note on Work with me; zero `<form>`, `<input>`, `<textarea>`.
- [ ] **Step 2: Run RED.** `node --test scripts/collaboration.test.js`.
- [ ] **Step 3: Add RU editorial page** with the approved sections: Engineering situations; Startup & individual projects; Teaching & Mentoring; Expert contribution; `Context → Scope → Оценка → Реализация → Передача`; fit guidance; open door; Describe the task. Mutable truth is represented only by:

```html
<div data-tr-collaboration-availability></div>
<div data-tr-collaboration-contact="work-with-me"></div>
```

- [ ] **Step 4: Add natural EN page** with the same functional structure and these stable phrases for search/regression: `bounded engineering work with a clear outcome`, `Architecture → Implementation → Verification → Delivery → Handover`, `The formats above are examples, not a closed catalogue.`
- [ ] **Step 5: Implement localized static renderers.** `unavailable` must keep the page discoverable and explicitly say new work is paused; never hide the section.
- [ ] **Step 6: Add scoped CSS** using only `.tr-collaboration-*`, existing design tokens, no new animation, and no color-only status semantics. Add it to `docs/.yfm`.
- [ ] **Step 7: Implement page injection.** Require exactly one availability and one Work-with-me contact placeholder per locale; missing/duplicate placeholder is build failure.
- [ ] **Step 8: Wire one canonical model into `scripts/copy-assets.js`.** Production docs default to `data/collaboration.json`; load once and reuse.
- [ ] **Step 9: Extend `copy-assets.test.js`** with a temporary RU/EN fixture and assert projected truth, no form, and explicit diagnostics.
- [ ] **Step 10: Verify.** `node --test scripts/collaboration.test.js scripts/copy-assets.test.js && npm test && npm run build:docs && npm run check:site`.
- [ ] **Step 11: Commit.** `feat: add work with me pages`.

---

## Task 3: Navigation, i18n and metadata identity

**Files:**
- Modify: `docs/toc.yaml`
- Modify: `templates/index.html`
- Modify: `templates/index.en.html`
- Modify: `data/i18n.json`
- Modify: `scripts/i18n.test.js`
- Modify: `data/page-meta.json`
- Modify: `scripts/metadata-smoke.cjs`
- Modify: `scripts/header-chrome-unifier.test.js`

- [ ] **Step 1: Write RED contracts.** Add i18n pair `work-with-me`; assert RU primary nav order becomes `Проекты, Опыт, Работа со мной, Notes, Публикации, Обо мне, Контакты`; add RU/EN metadata-smoke entries.
- [ ] **Step 2: Run RED.** `node --test scripts/i18n.test.js scripts/header-chrome-unifier.test.js`.
- [ ] **Step 3: Normalize RU primary header only.** Remove `Сейчас`, Map, Фото, Источники from the crowded header but keep them in ToC/content graph.
- [ ] **Step 4: Use bounded EN header order.** `Projects, Experience, Work with me, Now, Publications, About, Notes (RU)`. Do not invent an EN Contacts route.
- [ ] **Step 5: Add ToC destinations** for RU and EN Work with me.
- [ ] **Step 6: Add i18n pair.** `{"id":"work-with-me","ru":"landing/work-with-me.html","en":"en/work-with-me.html"}`. Update the controlled pair count from 12 to 13.
- [ ] **Step 7: Add explicit page metadata.** RU title: `Работа со мной — Backend-разработка, консультации и наставничество | Руслан Немыкин`; EN title: `Work with me — Backend engineering, consulting and mentoring | Ruslan Nemykin`; cards `work-with-me` / `work-with-me-en`.
- [ ] **Step 8: Verify.** `npm test && npm run build:docs && npm run check:site`; then `node scripts/metadata-smoke.cjs` when browser tools are installed.
- [ ] **Step 9: Commit.** `feat: expose work with me navigation and metadata`.

---

## Task 4: Contacts uses canonical direct-contact truth

**Files:**
- Modify: `docs/landing/contacts.md`
- Modify: `scripts/collaboration.js`
- Modify: `scripts/collaboration.test.js`
- Create: `scripts/private-practice-contract.test.js`

- [ ] **Step 1: Write RED source/copy guard.** Require Work with me link, `data-tr-collaboration-contact="contacts"`, Engineering/Teaching/open-door sections, and scan controlled commercial copy for prohibited sales phrases and currency/price patterns.
- [ ] **Step 2: Run RED.** `node --test scripts/private-practice-contract.test.js`.
- [ ] **Step 3: Refactor Contacts.** Preserve the general-contact opening and external profiles; replace hard-coded Telegram/email with `<div data-tr-collaboration-contact="contacts"></div>`; add a short `Если пишете по задаче` qualification hint and Work with me link; do not duplicate the service catalogue.
- [ ] **Step 4: Extend build-time injection** so Contacts receives the same canonical Telegram/email truth. Missing/duplicate placeholder fails the build.
- [ ] **Step 5: Verify.** `node --test scripts/collaboration.test.js scripts/private-practice-contract.test.js && npm test && npm run build:docs && npm run check:site`.
- [ ] **Step 6: Commit.** `feat: connect contacts to collaboration model`.

---

## Task 5: Evidence-led homepage bridge

**Files:**
- Modify: `templates/index.html`
- Modify: `templates/index.en.html`
- Modify: `scripts/standalone-home.js`
- Modify: `scripts/standalone-home.test.js`
- Modify: `scripts/copy-assets.js`
- Modify: `docs/_assets/style/collaboration.css`

**Interface:** `renderHomepageCollaborationBridge(model, {locale}) -> string`; template placeholder `{{HOME_COLLABORATION_BRIDGE}}`.

- [ ] **Step 1: Write RED tests.** Require a secondary `data-tr-collaboration-surface="home"`, canonical limited status, Work with me href, no form/price; require `unavailable` to remain discoverable with honest paused copy.
- [ ] **Step 2: Run RED.** `node --test scripts/standalone-home.test.js`.
- [ ] **Step 3: Implement localized bridge** from the canonical model; one CTA only.
- [ ] **Step 4: Place bridge after Flagship projects and before Current focus.** Keep exactly three primary Experience/Projects/Materials paths; Work with me must not become path #4.
- [ ] **Step 5: Reuse the already-loaded canonical model** in RU and EN standalone generation.
- [ ] **Step 6: Verify.** `node --test scripts/standalone-home.test.js scripts/private-practice-contract.test.js && npm test && npm run build:docs && npm run check:site`.
- [ ] **Step 7: Commit.** `feat: add evidence-led collaboration bridge`.

---

## Task 6: Explicit contextual CTA and surface guard

**Files:**
- Modify: `scripts/collaboration.js`
- Modify: `scripts/collaboration.test.js`
- Modify: `scripts/private-practice-contract.test.js`
- Modify: `scripts/copy-assets.js`

**Interfaces:**
- `renderContextualCollaborationCta(category, {locale, href}) -> string`
- `applyContextualCollaboration(outputDir, model, {i18nPairs}) -> string[]`

- [ ] **Step 1: Write RED target tests** using temp HTML for the four RU approved pages, existing EN counterparts, plus forbidden About/Experience pages.
- [ ] **Step 2: Require exact generated target set.** EN targets exist only for Portfolio Platform, NotchHub and server-authoritative AI NPCs because only those approved RU sources have EN pairs.
- [ ] **Step 3: Run RED.** `node --test scripts/collaboration.test.js scripts/private-practice-contract.test.js`.
- [ ] **Step 4: Implement category copy** for all four allowed enums; only `engineering` and `ai-integration` are mapped in V1.
- [ ] **Step 5: Append via parse5** to the stable generated document content container at the end of proof/content. Missing approved target/container is a failure. Compute hrefs path-relatively; no keyword injection.
- [ ] **Step 6: Verify exact target list** after `npm run build:docs`; About, Experience, Photos, Sources and Engineering Map must have no contextual marker.
- [ ] **Step 7: Commit.** `feat: add bounded contextual collaboration bridges`.

---

## Task 7: Browser, no-JS, search, accessibility and cross-browser proof

**Files:**
- Create: `scripts/collaboration-browser-smoke.cjs`
- Modify: `scripts/quality-harness/scenarios.cjs`
- Modify: `scripts/browser-quality.cjs`
- Modify: `scripts/cross-browser-smoke.cjs`
- Modify: `scripts/layout-overflow-smoke.cjs`
- Modify: `scripts/i18n-browser-smoke.cjs`
- Modify: `scripts/search-smoke.cjs`
- Modify: `.github/workflows/build.yml`

- [ ] **Step 1: Add `CORE_SCENARIOS.workWithMe`** for `/landing/work-with-me/` with required RU section text.
- [ ] **Step 2: Add Work with me to Chromium desktop/mobile, Firefox/WebKit and mobile-overflow suites.** Do not remove existing scenarios.
- [ ] **Step 3: Add `work-with-me` to i18n browser pairs** and verify RU/EN canonical/hreflang/no-JS parity.
- [ ] **Step 4: Add generated-search checks.** RU query `ограниченным scope и результатом` → `/landing/work-with-me/`; EN query `bounded engineering work with a clear outcome` → `/en/work-with-me/`.
- [ ] **Step 5: Implement dedicated collaboration browser smoke.** Verify RU/EN sections, same canonical availability/contact truth, no form, no-JS core content/direct links, homepage bridge after flagships with primary-path count 3, Contacts handoff, exact contextual allowlist, forbidden surfaces, Axe, overflow, page errors and first-party failures.
- [ ] **Step 6: Capture evidence screenshots:** `work-with-me-desktop.png`, `work-with-me-mobile.png`, `work-with-me-en-desktop.png`, `work-with-me-en-mobile.png`, `home-collaboration-desktop.png`, `contacts-collaboration-mobile.png`.
- [ ] **Step 7: Add Build workflow step** `Work with me browser smoke` and preserve log/summary/screenshots in quality artifacts.
- [ ] **Step 8: Run local browser matrix** with the same pinned tool versions as CI.
- [ ] **Step 9: Commit.** `test: verify private practice across browsers`.

---

## Task 8: Visual acceptance without weakening thresholds

**Files:**
- Modify: `tests/visual-baselines.json`

- [ ] **Step 1: Run browser screenshots and visual regression before rebasing.** Intentional home/header changes may fail; new Work with me baselines are initially absent.
- [ ] **Step 2: Inspect every intentional screenshot** for hierarchy, non-salesy CTA, readable textual availability, desktop/mobile header density and direct-contact clarity.
- [ ] **Step 3: Add/update only intentional baselines.** Keep `sampleSize: 16`, `maxMeanChannelDelta: 5`, `maxDimensionDeltaRatio: 0.03` exactly unchanged. Do not rebase unrelated map/search/project baselines.
- [ ] **Step 4: Re-run `node scripts/visual-regression.cjs`** and require PASS.
- [ ] **Step 5: Commit.** `test: accept private practice visual surfaces`.

---

## Task 9: Exact-deployment production gate

**Files:**
- Modify: `scripts/production-live-routes.cjs`
- Modify: `scripts/production-live-routes.test.js`
- Create: `scripts/production-private-practice-smoke.cjs`
- Create: `scripts/production-private-practice-workflow.test.js`
- Modify: `scripts/production-live-workflow.test.js`
- Modify: `.github/workflows/production-live.yml`

- [ ] **Step 1: Write RED route/workflow tests.** Require `WORK_WITH_ME_URL = https://trueruslan.ru/landing/work-with-me/` and `WORK_WITH_ME_EN_URL = https://trueruslan.ru/en/work-with-me/`; require a deployment-only workflow step and `EXPECTED_DEPLOYED_SHA`.
- [ ] **Step 2: Run RED.** `node --test scripts/production-live-routes.test.js scripts/production-private-practice-workflow.test.js scripts/production-live-workflow.test.js`.
- [ ] **Step 3: Add clean route constants.** No `.html` canonical.
- [ ] **Step 4: Implement production smoke** using canonical `data/collaboration.json`. Verify RU/EN 200, H1, canonical/hreflang, exact availability attributes, exact Telegram/email, no form/price pattern, no-JS content, homepage bridge after proof and three primary paths, nav access, Contacts handoff, exact contextual target set, no About/Experience CTA, no new third-party lead runtime, clean diagnostics.
- [ ] **Step 5: Write `private-practice-production-summary.json`** including `expectedDeployedSha` and a RU production screenshot.
- [ ] **Step 6: Wire workflow step:** `Run deployed private practice smoke`, guarded with `if: github.event_name != 'pull_request'`, using `EXPECTED_DEPLOYED_SHA: ${{ steps.pages.outputs.deployed_sha }}`.
- [ ] **Step 7: Require read-only permissions and existing evidence upload contract to remain unchanged.**
- [ ] **Step 8: Run GREEN unit suite.** `npm test`.
- [ ] **Step 9: Commit.** `test: add private practice production gate`.

---

## Task 10: Feature PR and exact-head verification

- [ ] **Step 1: Start implementation from current master after planning PR merge** on `feat/work-with-me-private-practice`.
- [ ] **Step 2: Run complete local verification.** `npm test && npm run build:docs && npm run check:site`, then the browser matrix where available.
- [ ] **Step 3: Review diff against non-goals.** Confirm no public prices/forms/conversion events/extra contextual targets/EN Contacts/P3.6 promotion/unrelated redesign.
- [ ] **Step 4: Open bounded feature PR** `feat: add evidence-led private practice`. Body must list RED evidence and explicitly state that source/build/browser proof is not production acceptance.
- [ ] **Step 5: Require exact-head Build, CodeQL JS/TS, Dependency Review and all current ruleset checks to pass, with zero unresolved review threads.**
- [ ] **Step 6: Inspect CI screenshots/artifacts** for RU/EN Work with me, homepage bridge and Contacts.
- [ ] **Step 7: Squash merge only the verified exact head** using an expected-head guard. Record squash SHA but do not mark production accepted yet.

---

## Task 11: Exact production acceptance and hotfix rule

- [ ] **Step 1: Require Pages success for the exact feature squash SHA** and record Pages run/deployment/artifact identity.
- [ ] **Step 2: Require deployment-triggered Production Live** whose source Pages `head_sha` equals the feature squash SHA. A scheduled/manual/push run against another deployment is not equivalent.
- [ ] **Step 3: Inspect the private-practice production summary** and all existing production gates.
- [ ] **Step 4: If production fails, fail closed.** Preserve evidence, reproduce with a RED test, create a separate hotfix PR, do not weaken the smoke, and repeat exact deployment acceptance for the hotfix squash SHA.
- [ ] **Step 5: Record the accepted evidence tuple:** product SHA, Pages run, deployment ID, Pages artifact+digest, Production Live run, production artifact+digest, `observedAt`.

---

## Task 12: Durable acceptance ledger

**Files:**
- Create: `scripts/private-practice-acceptance.test.js`
- Modify: `docs/PROJECT_STATE.md`
- Modify: `docs/ROADMAP.md`
- Modify: `docs/CHANGELOG.md`

- [ ] **Step 1: After Task 11 only, write a RED durable-state test** with the exact observed SHA/run/deployment IDs.
- [ ] **Step 2: Require the test to prove P3.6 stays waiting:** `P3.6 — Measurement checkpoint — NEXT / WAITING FOR EXTERNAL EVIDENCE` must remain; `P3.6 ... DONE` must not appear.
- [ ] **Step 3: Update PROJECT_STATE** with a bounded `Private engineering & educational practice — PRODUCTION ACCEPTED` section and exact evidence.
- [ ] **Step 4: Update ROADMAP** with V1 accepted while keeping future prices/forms/productized service pages evidence-driven and P3.6 unchanged.
- [ ] **Step 5: Update CHANGELOG** with design/planning PR, feature/hotfix history if any, RED→GREEN proof, exact production evidence and V1 boundaries.
- [ ] **Step 6: Run GREEN.** `node --test scripts/private-practice-acceptance.test.js && npm test`.
- [ ] **Step 7: Merge a separate docs-only acceptance PR after required checks.** Its own deployment does not replace the accepted feature deployment evidence.

---

## Plan Self-Review

**Spec coverage:** Positioning/audiences → Tasks 2/4/5; canonical availability/direct contacts/pricing/legal truth → Tasks 1/2; navigation/SEO/RU-EN → Task 3; bounded commercial surfaces → Tasks 5/6; privacy/no-JS → Tasks 2/7/9; browser/a11y/visual → Tasks 7/8; exact production → Tasks 9–11; durable evidence without P3.6 promotion → Task 12.

**Placeholder scan:** No `TBD`, `TODO`, “implement later” or undefined acceptance step remains. Future commercial features are explicit non-goals rather than placeholders.

**Interface consistency:** One loader `loadCollaboration`; one validated model; one i18n pair `work-with-me`; one homepage placeholder `{{HOME_COLLABORATION_BRIDGE}}`; one category enum; one production summary `private-practice-production-summary.json`.

**Scope:** One coupled product capability. CRM, payments, booking, service-page farm and conversion tracking are intentionally excluded rather than split into hidden subprojects.
