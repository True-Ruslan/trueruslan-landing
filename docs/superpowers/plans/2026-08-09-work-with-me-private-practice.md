# Work with me / Private practice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a bounded `Работа со мной / Work with me` capability that converts already-earned trust into qualified engineering and educational conversations without turning TrueLanding into a generic freelancer catalogue.

**Architecture:** One fail-closed `data/collaboration.json` owns mutable collaboration truth: availability, enabled practice lines, contacts, pricing policy, legal format and the explicit contextual-surface allowlist. Build-time Node renderers project that truth into RU/EN Work with me pages, the standalone homepage, Contacts and a small curated set of case studies/Notes. Core content remains static/no-JS; exact deployed Pages identity plus deployment-triggered Production Live remains the acceptance boundary.

**Tech Stack:** Node.js 24, ESM, `node:test`, Diplodoc/YFM, parse5, static HTML/CSS, Playwright 1.61.1, Axe 4.12.1, Lighthouse 13.4.0, GitHub Actions, GitHub Pages.

## Global Constraints

- Primary identity remains `Ruslan Nemykin — Backend Engineer`.
- Engineering is primary; Teaching & Mentoring is a full but secondary professional line.
- Startup/individual work is secondary; unusual relevant requests remain welcome through an open-door message.
- V1 direct contacts are `https://t.me/TrueRuslan` and `ruslan.nemikin@gmail.com`.
- V1 pricing is `estimate-only`; no public price list.
- Initial availability: `engineering=limited`, `education=limited`, `updated=2026-08-08`.
- Availability is manual public truth; no automated mutation from dates, analytics, traffic or repository activity.
- Paid work may state self-employed/receipt support; no fictional agency.
- No form, CRM, booking, payments, lead database, conversion events, session replay, fingerprinting or AI seller.
- Static-first, build-time intelligence, progressive enhancement; core collaboration works without JavaScript.
- One canonical mutable truth; Diplodoc remains sole full-text search owner; clean directory URLs remain canonical.
- RU/EN Work with me ship together.
- Commercial CTA is bounded to homepage, Work with me, Contacts and explicit contextual targets.
- Initial RU contextual targets are exactly Portfolio Platform, NotchHub, Deployment Verification Note and Server-authoritative AI NPC Note; EN is derived only from an existing exact i18n pair.
- No cheap/unsupported sales claims, fake scarcity/social proof/testimonials/client/outcome claims.
- No quality-gate weakening; exact-head CI is not production acceptance; P3.6 remains independent.

## Task 1 — Canonical collaboration model

**Create:** `data/collaboration.json`, `scripts/collaboration.js`, `scripts/collaboration.test.js`.

- [ ] RED tests for exact launch truth, enum validation, contacts, pricing/legal policy, safe contextual paths, duplicate/unknown rejection.
- [ ] Run `node --test scripts/collaboration.test.js` and preserve expected RED.
- [ ] Implement `loadCollaboration`, `validateCollaboration`, `resolveContextualTargets` with availability enum `available|limited|consulting-only|unavailable` and contextual enum `engineering|ai-integration|education|expert-content`.
- [ ] Exact registry values: limited/limited, `2026-08-08`, canonical Telegram/email, `estimate-only`, `self-employed-receipt-supported`, exact four RU mappings.
- [ ] EN target only when `pair.ru` exactly equals approved RU path; no heuristics.
- [ ] GREEN `node --test scripts/collaboration.test.js && npm test`.
- [ ] Commit `feat: add canonical collaboration model`.

## Task 2 — RU/EN Work with me and build-time projection

**Create:** `docs/landing/work-with-me.md`, `docs/en/work-with-me.md`, `docs/_assets/style/collaboration.css`.
**Modify:** `.yfm`, collaboration module/tests, copy-assets/tests.

- [ ] RED tests for localized textual availability, data attributes, canonical Telegram/mailto, self-employed note and no form controls.
- [ ] RU page implements approved Engineering, Startup/individual, Teaching & Mentoring, Expert contribution, process, fit guidance, open door and direct handoff sections.
- [ ] Mutable truth only through `data-tr-collaboration-availability` and `data-tr-collaboration-contact="work-with-me"` placeholders.
- [ ] EN page has functional parity and natural copy; stable search phrase `bounded engineering work with a clear outcome`.
- [ ] Implement `renderAvailability`, `renderDirectContact`, `applyCollaborationPages`; unavailable never hides the route.
- [ ] Scoped `.tr-collaboration-*` CSS; no color-only status/new animation.
- [ ] Missing/duplicate required placeholder fails build.
- [ ] Load canonical model once in copy-assets and add isolated integration fixture.
- [ ] GREEN focused/full tests, docs build and site-integrity.
- [ ] Commit `feat: add work with me pages`.

## Task 3 — Navigation, i18n, metadata

**Modify:** `docs/toc.yaml`, both home templates, i18n registry/test, page-meta, metadata smoke, header contract test.

- [ ] RED for pair/nav/metadata.
- [ ] RU primary nav: Projects, Experience, Work with me, Notes, Publications, About, Contacts; keep Now/Map/Photos/Sources in content graph.
- [ ] EN primary nav: Projects, Experience, Work with me, Now, Publications, About, Notes (RU); no invented EN Contacts route.
- [ ] Add `work-with-me` pair; controlled pair count 12→13.
- [ ] Add approved RU/EN metadata titles and OG cards.
- [ ] Verify tests/build/site-integrity/metadata smoke.
- [ ] Commit `feat: expose work with me navigation and metadata`.

## Task 4 — Contacts canonical handoff

**Modify:** RU Contacts, collaboration module/tests. **Create:** `scripts/private-practice-contract.test.js`.

- [ ] RED source/copy guard for Work with me link, canonical contacts placeholder, banned sales wording and public-price patterns.
- [ ] Preserve general Contacts + external profiles; replace direct Telegram/email with canonical build-time projection.
- [ ] Add concise task qualification hint; no duplicate catalogue.
- [ ] Missing/duplicate Contacts placeholder fails build.
- [ ] Verify full tests/build/integrity.
- [ ] Commit `feat: connect contacts to collaboration model`.

## Task 5 — Evidence-led homepage bridge

**Modify:** home templates, standalone-home/test, copy-assets, collaboration CSS.

- [ ] RED canonical status/href/no-form/no-price/unavailable behavior.
- [ ] Implement `renderHomepageCollaborationBridge` from shared model.
- [ ] Place after Flagship projects and before Current focus.
- [ ] Preserve exactly three primary Experience/Projects/Materials paths; Work with me is never primary path #4.
- [ ] Reuse same model for RU/EN.
- [ ] Verify tests/build/integrity.
- [ ] Commit `feat: add evidence-led collaboration bridge`.

## Task 6 — Explicit contextual CTA + surface guard

**Modify:** collaboration module/tests, private-practice contract, copy-assets.

- [ ] RED exact four RU targets, exact existing EN counterparts, forbidden About/Experience.
- [ ] No EN Deployment Note CTA because no existing pair; no new translation for CTA symmetry.
- [ ] Implement all category renderers; V1 maps only Engineering/AI.
- [ ] Append via parse5 at end of generated document content; missing approved target/container fails.
- [ ] Compute relative Work with me href by path; no keyword/depth guessing.
- [ ] Assert no automatic CTA on About/Experience/Photos/Sources/Engineering Map.
- [ ] Commit `feat: add bounded contextual collaboration bridges`.

## Task 7 — Browser/no-JS/search/a11y/cross-browser

**Create:** `scripts/collaboration-browser-smoke.cjs`. **Modify:** quality scenarios, browser/cross-browser/layout/i18n/search smokes and Build workflow.

- [ ] Add Work with me core scenario and RU/EN browser coverage.
- [ ] Chromium desktop/mobile, Firefox/WebKit, overflow, i18n/no-JS parity.
- [ ] Search RU `ограниченным scope и результатом` → RU; EN `bounded engineering work with a clear outcome` → EN.
- [ ] Dedicated smoke verifies canonical truth, no form, no-JS direct links, homepage ordering + 3 paths, Contacts, exact CTA set/forbidden surfaces, Axe, overflow and diagnostics.
- [ ] Capture RU/EN Work with me desktop/mobile + homepage collaboration + Contacts mobile screenshots.
- [ ] Add Build step/artifact preservation; run CI-pinned browser matrix.
- [ ] Commit `test: verify private practice across browsers`.

## Task 8 — Visual acceptance

**Modify:** `tests/visual-baselines.json` only after screenshot inspection.

- [ ] Run visual regression before rebasing.
- [ ] Inspect all intentional brand/marketing surfaces.
- [ ] Update only intentional baselines; thresholds stay exactly sampleSize=16, mean delta=5, dimension ratio=0.03.
- [ ] Never rebase unrelated visuals.
- [ ] Re-run to PASS.
- [ ] Commit `test: accept private practice visual surfaces`.

## Task 9 — Exact-deployment production gate

**Modify:** production routes/test + workflow/test. **Create:** private-practice production smoke + workflow contract test.

- [ ] RED clean RU/EN production route constants, deployment-only step and `EXPECTED_DEPLOYED_SHA`.
- [ ] Production smoke reads canonical model and verifies RU/EN 200/H1/canonical/hreflang/statuses/contacts, no form/price, no-JS, homepage proof ordering + 3 paths, nav, Contacts, exact contextual set, forbidden About/Experience, no third-party lead runtime, clean diagnostics.
- [ ] Write `production-artifacts/private-practice-production-summary.json` with expected SHA and screenshot evidence.
- [ ] Wire deployment-only Production Live step with resolved Pages SHA; preserve read-only permissions/evidence upload.
- [ ] GREEN full unit suite.
- [ ] Commit `test: add private practice production gate`.

## Task 10 — Feature PR / exact-head verification

- [ ] After planning PR merge, branch `feat/work-with-me-private-practice` from current master.
- [ ] Execute Tasks 1–9 RED→GREEN and run full unit/build/integrity/browser matrix.
- [ ] Review non-goals: no form/public pricing/conversion events/extra targets/EN Contacts/P3.6 promotion/unrelated redesign.
- [ ] Open `feat: add evidence-led private practice`; explicitly classify exact-head evidence as pre-production.
- [ ] Require Build, CodeQL JS/TS, Dependency Review/current ruleset checks and zero unresolved review threads.
- [ ] Inspect CI screenshots/artifacts.
- [ ] Squash only verified head; record SHA without calling it production accepted.

## Task 11 — Exact production acceptance

- [ ] Require Pages success for exact feature squash SHA and record deployment/artifact identity.
- [ ] Require deployment-triggered Production Live whose source Pages head SHA matches exactly.
- [ ] Inspect dedicated private-practice summary + all existing gates.
- [ ] Failure path: preserve evidence, RED reproduction, separate hotfix, no verifier weakening, repeat exact deployment.
- [ ] Record accepted SHA, Pages run/deployment/artifact+digest, Production Live run/artifact+digest, observedAt.

## Task 12 — Durable acceptance ledger

**Create:** `scripts/private-practice-acceptance.test.js`. **Modify:** PROJECT_STATE, ROADMAP, CHANGELOG.

- [ ] After production only, RED test exact accepted evidence IDs.
- [ ] Prove P3.6 remains NEXT/WAITING and does not become DONE from this feature.
- [ ] Record production-accepted private engineering/education practice and exact evidence.
- [ ] Keep future pricing/forms/productized pages evidence-driven.
- [ ] Record planning/feature/hotfix if any/RED→GREEN/production history.
- [ ] GREEN acceptance test + full suite.
- [ ] Separate docs-only acceptance PR; its deployment does not replace feature acceptance evidence.

## Execution Handoff

Implementation starts from `master` after this planning PR is integrated. The first product change is Task 1 RED. Tasks 1–9 are one bounded feature slice; Tasks 10–12 preserve repository → artifact → deployment → live acceptance separation.

## Plan Self-Review

- Full approved design coverage is mapped to explicit tasks.
- No TBD/TODO or unresolved product decision remains.
- One canonical collaboration model, one i18n pair, one homepage projection, one contextual enum, one production summary.
- CRM, forms, payments, booking, public pricing, service-page farm and conversion tracking stay explicit non-goals.