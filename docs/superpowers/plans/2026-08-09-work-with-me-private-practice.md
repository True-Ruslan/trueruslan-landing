# Work with me / Private practice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a bounded `Работа со мной / Work with me` capability that turns already-earned trust into qualified engineering and educational conversations without turning TrueLanding into a generic freelancer catalogue.

**Architecture:** One fail-closed `data/collaboration.json` owns mutable collaboration truth. Build-time renderers project it into RU/EN Work with me pages, homepage, Contacts and a curated contextual allowlist. Core collaboration remains static/no-JS. Exact deployed Pages identity plus deployment-triggered Production Live is the acceptance boundary.

**Tech Stack:** Node.js 24, ESM, `node:test`, Diplodoc/YFM, parse5, static HTML/CSS, Playwright, Axe, Lighthouse, GitHub Actions, GitHub Pages.

## Global constraints

- Backend Engineer remains the primary identity.
- Engineering is primary; Teaching & Mentoring is a full secondary line; startups/individual work are secondary; relevant adjacent requests keep an open door.
- Canonical contacts: `https://t.me/TrueRuslan`, `ruslan.nemikin@gmail.com`.
- V1 pricing policy is `estimate-only`; no public price list.
- Initial availability: engineering `limited`, education `limited`, updated `2026-08-08`.
- Availability is manual public truth; no automated mutation or fake scarcity.
- Self-employed/receipt support may be stated calmly.
- No form, CRM, booking, payments, lead database, conversion tracking, session replay/fingerprinting or AI seller.
- Static-first/no-JS core; one canonical truth; Diplodoc sole search; clean directory URLs; RU/EN ship together.
- CTA is bounded to homepage, Work with me, Contacts and explicit contextual targets.
- No unsupported sales claims/fake proof; no gate weakening; P3.6 stays independent.

## 1. Canonical collaboration model

**Create:** `data/collaboration.json`, `scripts/collaboration.js`, `scripts/collaboration.test.js`.

- [ ] Write RED tests for exact launch truth, allowed state/category enums, safe paths, direct contacts, `estimate-only`, legal format, duplicates and unknown fields.
- [ ] Implement `loadCollaboration`, `validateCollaboration`, `resolveContextualTargets`.
- [ ] States: `available|limited|consulting-only|unavailable`; categories: `engineering|ai-integration|education|expert-content`.
- [ ] Initial RU targets: Portfolio Platform/NotchHub/Deployment Verification Note → engineering; Server-authoritative AI NPC Note → ai-integration.
- [ ] Derive EN only from an exact existing i18n pair; no heuristics.
- [ ] Run focused and full unit suite to GREEN.

## 2. Work with me RU/EN and build-time projection

**Create:** RU/EN Markdown and `docs/_assets/style/collaboration.css`. **Modify:** `.yfm`, collaboration module/tests, copy-assets/tests.

- [ ] RED localized availability/contact/no-form contracts.
- [ ] Implement approved Engineering, Startup, Teaching/Mentoring, Expert contribution, process, fit guidance, open door and direct handoff copy.
- [ ] Mutable truth exists only in build-time placeholders.
- [ ] Implement localized availability/direct-contact/page injection; unavailable remains discoverable.
- [ ] Scoped CSS only; no color-only state or new animation.
- [ ] Missing/duplicate placeholders fail closed; build loads collaboration once.
- [ ] GREEN unit/build/site-integrity.

## 3. Navigation, i18n and metadata

- [ ] RED pair/nav/meta.
- [ ] RU primary: Проекты, Опыт, Работа со мной, Notes, Публикации, Обо мне, Контакты; Now/Map/Photos/Sources remain reachable outside the primary header.
- [ ] EN primary: Projects, Experience, Work with me, Now, Publications, About, Notes (RU); no invented EN Contacts route.
- [ ] Add the 13th i18n pair and approved RU/EN metadata/OG cards.
- [ ] GREEN unit/build/integrity/metadata smoke.

## 4. Contacts canonical handoff

- [ ] RED anti-sales/public-price/source guard.
- [ ] Preserve general Contacts and external profiles; project direct contacts from the canonical model.
- [ ] Add a concise task-qualification hint + Work with me link; do not duplicate the service catalogue.
- [ ] Fail closed on placeholder drift.

## 5. Homepage collaboration bridge

- [ ] RED canonical state/link/no-form/no-price/unavailable behavior.
- [ ] Render bridge after Flagship proof and before Current focus.
- [ ] Preserve exactly three primary Experience/Projects/Materials paths.
- [ ] Use the same canonical model for RU/EN.

## 6. Explicit contextual CTA

- [ ] RED exact approved RU/EN target set and forbidden surfaces.
- [ ] Do not invent an EN Deployment Note.
- [ ] Append through parse5 at the end of stable generated content; missing approved target/container fails.
- [ ] Compute relative Work with me href by path; no keyword or depth guessing.
- [ ] Prove no automatic CTA on About/Experience/Photos/Sources/Engineering Map.

## 7. Browser/no-JS/search/a11y/cross-browser

- [ ] Add Work with me core scenario.
- [ ] Chromium desktop/mobile; Firefox/WebKit; mobile overflow; i18n/no-JS parity.
- [ ] Generated-search coverage for RU and EN Work with me.
- [ ] Dedicated browser smoke verifies canonical truth, no form, direct no-JS links, homepage order + 3 paths, Contacts, exact CTA allowlist, Axe, overflow and clean diagnostics.
- [ ] Capture RU/EN desktop/mobile, homepage collaboration and Contacts mobile screenshots.
- [ ] Add Build workflow evidence step.

## 8. Visual acceptance

- [ ] Run visual regression before any rebaseline.
- [ ] Inspect all intentional marketing/brand surfaces.
- [ ] Update only approved baselines; keep sampleSize=16, max mean delta=5, max dimension ratio=0.03.
- [ ] No unrelated visual rebasing.

## 9. Production gate

- [ ] RED clean RU/EN production routes and workflow contract.
- [ ] Deployment smoke validates canonical truth, no form/price, no-JS, homepage/nav/Contacts/contextual boundaries and absence of a lead-runtime dependency.
- [ ] Emit `production-artifacts/private-practice-production-summary.json` and screenshot evidence.
- [ ] Run only against the resolved exact deployed SHA; workflow remains read-only.

## 10. Feature PR

- [ ] After planning PR integration, branch `feat/work-with-me-private-practice` from current master.
- [ ] Execute Tasks 1–9 RED→GREEN with full unit/build/integrity/browser verification.
- [ ] Review non-goals; open bounded feature PR; exact-head evidence remains pre-production.
- [ ] Require Build, CodeQL, Dependency Review/current gates, zero unresolved threads and inspected CI visuals.
- [ ] Squash only the verified exact head.

## 11. Exact production acceptance

- [ ] Exact feature squash SHA must receive successful Pages deployment identity.
- [ ] Deployment-triggered Production Live must originate from that exact Pages head SHA.
- [ ] Inspect dedicated and existing production gates.
- [ ] On failure: preserve evidence, reproduce RED, bounded hotfix, no verifier weakening, repeat exact deployment.
- [ ] Record accepted SHA, Pages run/deployment/artifact+digest, Production Live run/artifact+digest and observedAt.

## 12. Durable acceptance

**Create:** `scripts/private-practice-acceptance.test.js`. **Modify:** PROJECT_STATE, ROADMAP, CHANGELOG.

- [ ] Only after exact production, write RED exact-evidence test.
- [ ] Explicitly prove P3.6 remains NEXT/WAITING.
- [ ] Record production-accepted private practice + exact evidence and V1 boundaries.
- [ ] Use a separate docs-only acceptance PR; its deployment does not replace feature acceptance evidence.

## Execution handoff

Implementation starts from current `master` after this planning slice is integrated. First product change is Task 1 RED. Tasks 1–9 form one bounded feature slice; Tasks 10–12 preserve repository → artifact → deployment → live acceptance separation.

## Self-review

No unresolved product choice/TBD remains. Every approved positioning, canonical-truth, bounded-surface, privacy, RU/EN, SEO/search, no-JS, browser/a11y/visual and exact-production requirement maps to a task. Forms/CRM/payments/booking/public pricing/service-page farm/conversion tracking remain explicit non-goals.