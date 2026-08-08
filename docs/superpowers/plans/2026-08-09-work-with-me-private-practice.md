# Work with me / Private practice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a bounded `Работа со мной / Work with me` capability that converts already-earned trust into qualified engineering and educational conversations without turning TrueLanding into a generic freelancer catalogue.

**Architecture:** One fail-closed `data/collaboration.json` owns mutable collaboration truth. Build-time renderers project it into RU/EN Work with me pages, homepage, Contacts and a curated contextual allowlist. Core collaboration remains static/no-JS. Exact deployed Pages identity + deployment-triggered Production Live is the acceptance boundary.

**Tech Stack:** Node.js 24, ESM, `node:test`, Diplodoc/YFM, parse5, static HTML/CSS, Playwright, Axe, Lighthouse, GitHub Actions, GitHub Pages.

## Global constraints

- Backend Engineer remains the primary identity.
- Engineering primary; Teaching & Mentoring full secondary; startup/individual secondary; open door for relevant adjacent requests.
- Canonical contacts: `https://t.me/TrueRuslan`, `ruslan.nemikin@gmail.com`.
- No public V1 prices; policy `estimate-only`.
- Initial availability: engineering `limited`, education `limited`, updated `2026-08-08`.
- Availability is manual public truth; no automatic mutation/fake scarcity.
- Self-employed/receipt support can be stated calmly.
- No form, CRM, booking, payments, lead database, conversion events, replay/fingerprinting or AI seller.
- Static-first/no-JS core; one canonical truth; Diplodoc sole search; clean directory canonical URLs.
- RU/EN ship together.
- CTA only on homepage, Work with me, Contacts and explicit contextual allowlist.
- No unsupported cheap-sales claims/fake proof.
- No gate weakening; P3.6 stays independent.

## Task 1 — Canonical collaboration model

**Create:** `data/collaboration.json`, `scripts/collaboration.js`, `scripts/collaboration.test.js`.

- [ ] RED exact launch truth, state/category enums, safe paths, contacts, estimate-only/legal policy, duplicate/unknown rejection.
- [ ] Implement `loadCollaboration`, `validateCollaboration`, `resolveContextualTargets`.
- [ ] States: `available|limited|consulting-only|unavailable`; categories: `engineering|ai-integration|education|expert-content`.
- [ ] Exact RU mappings: Portfolio Platform/NotchHub/Deployment Verification Note → engineering; Server-authoritative AI NPC Note → ai-integration.
- [ ] EN only where existing pair has exact mapped RU path; no heuristics.
- [ ] GREEN focused + full unit suite.

## Task 2 — RU/EN Work with me + projection

**Create:** RU/EN Markdown, `collaboration.css`. **Modify:** `.yfm`, collaboration module/tests, copy-assets/tests.

- [ ] RED localized availability/contact/no-form tests.
- [ ] RU/EN pages implement approved Engineering, Startup, Teaching/Mentoring, Expert contribution, process, fit guidance, open door and direct handoff.
- [ ] Mutable truth only in build-time placeholders.
- [ ] Implement `renderAvailability`, `renderDirectContact`, `applyCollaborationPages`; unavailable stays visible.
- [ ] Scoped CSS; no color-only meaning/new animation.
- [ ] Missing/duplicate placeholders fail build.
- [ ] Load registry once in copy-assets; isolated integration test.
- [ ] GREEN unit/build/site-integrity.

## Task 3 — Navigation, i18n, metadata

- [ ] RED pair/nav/meta.
- [ ] RU primary nav: Проекты, Опыт, Работа со мной, Notes, Публикации, Обо мне, Контакты; keep Now/Map/Photos/Sources in content graph.
- [ ] EN: Projects, Experience, Work with me, Now, Publications, About, Notes (RU); no EN Contacts invention.
- [ ] Add `work-with-me` pair, controlled count 13.
- [ ] Approved RU/EN titles + OG metadata.
- [ ] GREEN tests/build/integrity/metadata smoke.

## Task 4 — Contacts canonical handoff

- [ ] RED source/copy anti-sales/public-price guard.
- [ ] Preserve general Contacts/external profiles; replace hardcoded direct contacts with canonical projection.
- [ ] Add short task-qualification hint + Work with me link; no service catalogue duplication.
- [ ] Fail on missing/duplicate Contacts placeholder.

## Task 5 — Homepage collaboration bridge

- [ ] RED canonical status/href/no-form/no-price/unavailable behavior.
- [ ] Implement `renderHomepageCollaborationBridge`.
- [ ] Place after Flagship projects before Current focus.
- [ ] Preserve exactly 3 Experience/Projects/Materials primary paths.
- [ ] Same canonical model for RU/EN.

## Task 6 — Explicit contextual CTA

- [ ] RED exact four RU targets, existing EN counterparts, forbidden About/Experience.
- [ ] No invented EN Deployment Note.
- [ ] Implement category renderer + parse5 append at end of stable content.
- [ ] Missing approved target/container fails; relative href computed by path.
- [ ] Prove no automatic CTA on About/Experience/Photos/Sources/Engineering Map.

## Task 7 — Browser/no-JS/search/a11y/cross-browser

- [ ] Add Work with me core scenario.
- [ ] Chromium desktop/mobile; Firefox/WebKit; mobile overflow; i18n/no-JS parity.
- [ ] Search RU phrase → RU route; EN `bounded engineering work with a clear outcome` → EN route.
- [ ] Dedicated browser smoke: canonical truth, no form, direct no-JS links, homepage order + 3 paths, Contacts, exact CTA set, Axe, overflow, diagnostics.
- [ ] Capture RU/EN desktop/mobile + homepage + Contacts screenshots.
- [ ] Add Build step and evidence artifacts.

## Task 8 — Visual acceptance

- [ ] Run visual regression before rebasing.
- [ ] Inspect intentional brand/marketing surfaces.
- [ ] Update only approved baselines; thresholds remain `sampleSize=16`, mean delta `5`, dimension ratio `0.03`.
- [ ] No unrelated baseline rebasing.

## Task 9 — Production gate

- [ ] RED clean RU/EN production routes + workflow step + expected deployed SHA.
- [ ] Production smoke verifies RU/EN canonical/hreflang/status/contacts, no form/price, no-JS, homepage proof ordering + 3 paths, nav, Contacts, exact CTA set, forbidden surfaces and no third-party lead runtime.
- [ ] Write `private-practice-production-summary.json` + screenshot.
- [ ] Deployment-only Production Live step uses resolved Pages SHA; permissions remain read-only.

## Task 10 — Feature PR

- [ ] After planning PR integration, branch `feat/work-with-me-private-practice` from current master.
- [ ] Execute Tasks 1–9 RED→GREEN; full unit/build/integrity/browser verification.
- [ ] Review non-goals.
- [ ] Open bounded feature PR; exact-head evidence is pre-production only.
- [ ] Require Build, CodeQL JS/TS, Dependency Review/current gates and zero review threads.
- [ ] Inspect CI visuals; squash only verified exact head.

## Task 11 — Exact production acceptance

- [ ] Exact feature squash SHA must receive successful Pages deployment identity.
- [ ] Deployment-triggered Production Live must originate from that exact Pages head SHA.
- [ ] Inspect private-practice summary + all existing gates.
- [ ] On failure: preserve evidence, RED reproduce, bounded hotfix, no verifier weakening, repeat exact deployment.
- [ ] Record accepted SHA, Pages run/deployment/artifact+digest, Production Live run/artifact+digest, observedAt.

## Task 12 — Durable acceptance

**Create:** `scripts/private-practice-acceptance.test.js`. **Modify:** PROJECT_STATE, ROADMAP, CHANGELOG.

- [ ] Only after Task 11, RED exact-evidence test.
- [ ] Explicitly prove P3.6 remains NEXT/WAITING.
- [ ] Record production-accepted private engineering/education practice + exact evidence.
- [ ] Keep future prices/forms/productized pages evidence-driven.
- [ ] Separate docs-only acceptance PR; docs deployment never replaces feature acceptance evidence.

## Execution handoff

Implementation starts from current `master` after this planning slice is integrated. First product change is Task 1 RED. Tasks 1–9 form one bounded feature slice; Tasks 10–12 preserve repository → artifact → deployment → live acceptance separation.

## Self-review

No unresolved product choice/TBD remains. Every approved positioning, canonical-truth, bounded-surface, privacy, RU/EN, SEO/search, no-JS, browser/a11y/visual and exact-production requirement maps to a task. CRM/forms/payments/booking/public pricing/service-page farm/conversion tracking are explicit non-goals.