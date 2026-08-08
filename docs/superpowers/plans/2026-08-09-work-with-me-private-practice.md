# Work with me / Private practice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a bounded `Работа со мной / Work with me` capability that turns already-earned trust into qualified engineering and educational conversations without turning TrueLanding into a generic freelancer catalogue.

**Architecture:** `data/collaboration.json` is the fail-closed canonical owner of mutable collaboration truth. Build-time Node renderers project it into RU/EN Work with me pages, the homepage, Contacts and an explicit contextual allowlist. Core collaboration is static/no-JS. Exact Pages deployment identity plus deployment-triggered Production Live is the acceptance boundary.

**Tech Stack:** Node.js 24, ESM, `node:test`, Diplodoc/YFM, parse5, static HTML/CSS, Playwright/Axe/Lighthouse, GitHub Actions/Pages.

## Constraints

- Backend Engineer identity remains primary; Engineering primary, Teaching/Mentoring full secondary, startups secondary, open door for adjacent relevant work.
- Contacts: `https://t.me/TrueRuslan`, `ruslan.nemikin@gmail.com`.
- Pricing: `estimate-only`; no public V1 prices.
- Initial availability: engineering `limited`, education `limited`, updated `2026-08-08`; manual truth only.
- Self-employed/receipt support may be stated calmly.
- No form/CRM/booking/payments/lead database/conversion tracking/session replay/fingerprinting/AI seller.
- Static-first, no-JS core, one canonical truth, Diplodoc sole search, clean canonical directory URLs, RU/EN together.
- CTA only on homepage, Work with me, Contacts and exact approved contextual targets.
- No unsupported cheap-sales/fake-proof claims; no gate weakening; P3.6 independent.

## 1. Canonical collaboration model

Create `data/collaboration.json`, `scripts/collaboration.js`, `scripts/collaboration.test.js`.

- [ ] RED launch truth, state/category enums, safe paths, contacts, policy, duplicate/unknown rejection.
- [ ] Implement loader/validator/contextual-target resolver.
- [ ] States: `available|limited|consulting-only|unavailable`; categories: `engineering|ai-integration|education|expert-content`.
- [ ] Exact RU targets: Portfolio Platform, NotchHub, Deployment Verification Note → engineering; Server-authoritative AI NPC Note → ai-integration.
- [ ] EN only from exact existing i18n pair; no heuristics.
- [ ] GREEN focused + full unit tests.

## 2. Work with me RU/EN + build-time projection

Create RU/EN Markdown and scoped `collaboration.css`; modify `.yfm`, collaboration module/tests, copy-assets/tests.

- [ ] RED localized availability/contact/no-form contracts.
- [ ] Implement approved Engineering, Startup, Teaching/Mentoring, Expert contribution, process, fit, open door and direct handoff sections.
- [ ] Mutable truth only via build-time placeholders.
- [ ] Implement localized availability/direct-contact/page injection; unavailable stays discoverable.
- [ ] Fail on missing/duplicate placeholders; load canonical registry once.
- [ ] GREEN unit/build/site integrity.

## 3. Navigation, i18n, metadata

- [ ] RED pair/nav/meta.
- [ ] RU primary: Проекты, Опыт, Работа со мной, Notes, Публикации, Обо мне, Контакты; Now/Map/Photos/Sources remain reachable outside primary header.
- [ ] EN: Projects, Experience, Work with me, Now, Publications, About, Notes (RU); no invented EN Contacts.
- [ ] Add 13th i18n pair and approved RU/EN metadata/OG.
- [ ] GREEN unit/build/integrity/metadata smoke.

## 4. Contacts canonical handoff

- [ ] RED anti-sales/public-price/source guard.
- [ ] Preserve general Contacts/external profiles; project canonical direct contacts.
- [ ] Add concise task qualification hint + Work with me link; no duplicated catalogue.
- [ ] Fail closed on placeholder drift.

## 5. Homepage bridge

- [ ] RED canonical state/link/no-form/no-price/unavailable behavior.
- [ ] Render from shared model after Flagship proof and before Current focus.
- [ ] Preserve exactly three Experience/Projects/Materials primary paths.

## 6. Explicit contextual CTA

- [ ] RED exact RU/EN target set + forbidden surfaces.
- [ ] No invented EN Deployment Note.
- [ ] parse5 append at end of stable content; missing approved target/container fails.
- [ ] Relative Work with me href by path; no keyword/depth guessing.
- [ ] No automatic CTA on About/Experience/Photos/Sources/Engineering Map.

## 7. Browser/no-JS/search/a11y/cross-browser

- [ ] Work with me core scenario; Chromium desktop/mobile; Firefox/WebKit; overflow; i18n/no-JS.
- [ ] Generated-search coverage RU/EN.
- [ ] Dedicated smoke verifies canonical truth, no form, homepage ordering + 3 paths, Contacts, exact CTA set, Axe/overflow/diagnostics.
- [ ] Capture RU/EN/home/Contacts screenshots; add Build evidence step.

## 8. Visual acceptance

- [ ] Run before rebaseline and inspect all intentional surfaces.
- [ ] Update only approved baselines; keep `sampleSize=16`, mean delta `5`, dimension ratio `0.03`.
- [ ] No unrelated rebasing.

## 9. Production gate

- [ ] RED clean RU/EN production routes + workflow contract.
- [ ] Deployment smoke validates canonical truth, no form/price, no-JS, home/nav/Contacts/contextual boundaries and no lead-runtime dependency.
- [ ] Emit `private-practice-production-summary.json` + screenshot.
- [ ] Run only against resolved exact deployed SHA; keep workflow read-only.

## 10. Feature PR

- [ ] After planning PR merge, branch `feat/work-with-me-private-practice` from current master.
- [ ] Execute 1–9 RED→GREEN; full unit/build/integrity/browser verification.
- [ ] Review non-goals; open bounded feature PR; exact-head evidence remains pre-production.
- [ ] Require Build, CodeQL, Dependency Review/current gates, zero threads and inspected CI visuals.
- [ ] Squash only verified head.

## 11. Exact production acceptance

- [ ] Exact feature squash SHA → successful Pages deployment identity → deployment-triggered Production Live from that exact SHA.
- [ ] Inspect dedicated + existing gates.
- [ ] On failure preserve evidence, RED reproduce, bounded hotfix, no verifier weakening, repeat exact deployment.
- [ ] Record SHA/run/deployment/artifact/digest/observedAt tuple.

## 12. Durable acceptance

Create `scripts/private-practice-acceptance.test.js`; update PROJECT_STATE/ROADMAP/CHANGELOG only after exact production.

- [ ] RED exact-evidence test; prove P3.6 remains NEXT/WAITING.
- [ ] Record production-accepted private practice + exact evidence and V1 boundaries.
- [ ] Separate docs-only acceptance PR; its deployment does not replace feature evidence.

## Execution handoff

Implementation starts from current `master` after this planning slice is integrated. First product change is Task 1 RED. Tasks 1–9 form one bounded feature slice; Tasks 10–12 preserve repository → artifact → deployment → live acceptance separation.

## Self-review

No unresolved product choice/TBD remains. Every approved positioning, canonical-truth, bounded-surface, privacy, RU/EN, SEO/search, no-JS, browser/a11y/visual and exact-production requirement maps to a task. Forms/CRM/payments/booking/public pricing/service-page farm/conversion tracking remain explicit non-goals.