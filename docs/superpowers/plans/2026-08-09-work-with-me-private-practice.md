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
- RU/EN ship together; CTA stays bounded; no unsupported cheap-sales claims; no gate weakening; P3.6 stays independent.

## Task 1 — Canonical collaboration model
**Create:** `data/collaboration.json`, `scripts/collaboration.js`, `scripts/collaboration.test.js`.
- [ ] RED exact launch truth, enums, safe paths, contacts, estimate-only/legal policy, duplicate/unknown rejection.
- [ ] Implement loader/validator/contextual resolver; exact four RU mappings; EN only exact existing i18n counterparts.
- [ ] GREEN focused + full unit suite.

## Task 2 — RU/EN Work with me + build-time projection
**Create:** RU/EN Markdown, `collaboration.css`; modify `.yfm`, collaboration module/tests, copy-assets/tests.
- [ ] RED localized availability/contact/no-form contracts.
- [ ] Implement approved Engineering, Startup, Teaching/Mentoring, Expert contribution, process, fit, open-door, direct-handoff content.
- [ ] Mutable truth only through build-time placeholders.
- [ ] Scoped CSS; unavailable stays discoverable; placeholders fail closed.
- [ ] One canonical model load in build; GREEN unit/build/integrity.

## Task 3 — Navigation, i18n, metadata
- [ ] RED pair/nav/meta.
- [ ] RU primary: Проекты, Опыт, Работа со мной, Notes, Публикации, Обо мне, Контакты; secondary content remains reachable.
- [ ] EN: Projects, Experience, Work with me, Now, Publications, About, Notes (RU); no invented EN Contacts.
- [ ] Add 13th i18n pair + approved RU/EN metadata/OG; GREEN metadata/build tests.

## Task 4 — Contacts canonical handoff
- [ ] RED anti-sales/public-price/source guard.
- [ ] Preserve general Contacts/external profiles; canonical direct-contact projection + task qualification hint; no service-catalog duplication.
- [ ] Fail closed on placeholder drift.

## Task 5 — Homepage collaboration bridge
- [ ] RED canonical status/href/no-form/no-price/unavailable behavior.
- [ ] Bridge after Flagship proof, before Current focus; exactly three primary paths remain.
- [ ] Shared canonical model RU/EN.

## Task 6 — Explicit contextual CTA
- [ ] RED exact approved RU/EN target set + forbidden surfaces.
- [ ] No invented EN deployment Note.
- [ ] parse5 append at end of stable content; missing target/container fails; relative href by path; no keyword inference.

## Task 7 — Browser/no-JS/search/a11y/cross-browser
- [ ] Add Work with me core scenario, Chromium desktop/mobile, Firefox/WebKit, overflow, i18n/no-JS.
- [ ] RU/EN generated-search route coverage.
- [ ] Dedicated smoke: canonical truth, no form, direct links, homepage order + 3 paths, Contacts, exact CTA set, Axe/overflow/diagnostics.
- [ ] Capture RU/EN/home/Contacts screenshots; add Build evidence step.

## Task 8 — Visual acceptance
- [ ] Run before rebaseline; inspect all intentional marketing/brand surfaces.
- [ ] Update only approved baselines; keep sampleSize=16, mean delta=5, dimension ratio=0.03; no unrelated rebasing.

## Task 9 — Production gate
- [ ] RED clean RU/EN production routes + workflow contract.
- [ ] Deployment smoke validates exact canonical truth, no form/price, no-JS, home/nav/Contacts/contextual boundaries and no lead-runtime dependency.
- [ ] Emit `private-practice-production-summary.json`; run only against resolved exact deployed SHA; preserve read-only permissions.

## Task 10 — Feature PR
- [ ] After planning PR integration, branch `feat/work-with-me-private-practice` from current master.
- [ ] Execute Tasks 1–9 RED→GREEN; full unit/build/integrity/browser verification.
- [ ] Open bounded feature PR; exact-head evidence remains pre-production.
- [ ] Require Build, CodeQL, Dependency Review/current gates, zero threads, inspected CI visuals; squash only verified head.

## Task 11 — Exact production acceptance
- [ ] Exact squash SHA → successful Pages deployment identity → deployment-triggered Production Live from that exact head.
- [ ] Inspect dedicated + existing gates.
- [ ] Failure: preserve evidence, RED reproduce, bounded hotfix, no verifier weakening, repeat exact deployment.
- [ ] Record SHA/run/deployment/artifact/digest/observedAt tuple.

## Task 12 — Durable acceptance
**Create:** `scripts/private-practice-acceptance.test.js`; modify PROJECT_STATE, ROADMAP, CHANGELOG.
- [ ] Only after production, RED exact-evidence test.
- [ ] Prove P3.6 remains NEXT/WAITING.
- [ ] Record production acceptance + exact evidence; keep future commercial evolution evidence-driven.
- [ ] Separate docs-only acceptance PR; its deployment does not replace feature evidence.

## Execution handoff
Implementation starts from current `master` after this planning slice is integrated. First product change is Task 1 RED. Tasks 1–9 form one bounded feature slice; Tasks 10–12 preserve repository → artifact → deployment → live acceptance separation.

## Self-review
No unresolved product choice/TBD remains. Every approved positioning, canonical-truth, bounded-surface, privacy, RU/EN, SEO/search, no-JS, browser/a11y/visual and exact-production requirement maps to a task. CRM/forms/payments/booking/public pricing/service-page farm/conversion tracking remain explicit non-goals.