# Work with me / Private practice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a bounded `Работа со мной / Work with me` capability that turns already-earned trust into qualified engineering and educational conversations without turning TrueLanding into a generic freelancer catalogue.

**Architecture:** One fail-closed `data/collaboration.json` owns mutable collaboration truth. Build-time renderers project it into RU/EN Work with me pages, homepage, Contacts and a curated contextual allowlist. Core collaboration remains static/no-JS. Exact deployed Pages identity plus deployment-triggered Production Live is the acceptance boundary.

**Tech Stack:** Node.js 24, ESM, `node:test`, Diplodoc/YFM, parse5, static HTML/CSS, Playwright, Axe, Lighthouse, GitHub Actions, GitHub Pages.

## Constraints

- Backend Engineer remains primary identity; Engineering primary, Teaching/Mentoring full secondary, startup/individual secondary, open door for relevant adjacent requests.
- Contacts: `https://t.me/TrueRuslan`, `ruslan.nemikin@gmail.com`; pricing `estimate-only`; self-employed receipt supported.
- Initial manual availability: engineering `limited`, education `limited`, updated `2026-08-08`.
- No form/CRM/booking/payments/lead database/conversion tracking/session replay/fingerprinting/AI seller.
- Static-first/no-JS core, one canonical truth, Diplodoc sole search, clean directory canonical URLs, RU/EN together.
- CTA only on homepage, Work with me, Contacts and explicit allowlist; no unsupported sales/fake-proof claims.
- No quality-gate weakening; P3.6 independent.

## 1. Canonical collaboration model
- [ ] RED exact truth/enums/contacts/policy/safe-target tests.
- [ ] Implement `data/collaboration.json`, loader/validator/contextual resolver.
- [ ] Exact four RU mappings; EN only from exact existing i18n pair.
- [ ] GREEN focused/full unit tests.

## 2. RU/EN Work with me + projection
- [ ] RED localized availability/contact/no-form tests.
- [ ] Create RU/EN approved editorial pages and scoped collaboration CSS.
- [ ] Mutable truth only through build-time placeholders.
- [ ] Implement localized availability/contact/page injection; unavailable stays visible; placeholder drift fails.
- [ ] Load canonical registry once; GREEN unit/build/site integrity.

## 3. Navigation/i18n/metadata
- [ ] RED pair/nav/meta.
- [ ] RU primary: Проекты, Опыт, Работа со мной, Notes, Публикации, Обо мне, Контакты; secondary content stays reachable.
- [ ] EN: Projects, Experience, Work with me, Now, Publications, About, Notes (RU); no EN Contacts invention.
- [ ] Add 13th i18n pair + approved RU/EN metadata/OG; GREEN verification.

## 4. Contacts canonical handoff
- [ ] RED anti-sales/public-price/source guard.
- [ ] Preserve general Contacts/external profiles; canonical direct contacts + qualification hint + Work with me; no duplicated catalogue.
- [ ] Fail closed on placeholder drift.

## 5. Homepage bridge
- [ ] RED state/link/no-form/no-price/unavailable behavior.
- [ ] Bridge after Flagship proof and before Current focus.
- [ ] Preserve exactly 3 Experience/Projects/Materials primary paths; shared model RU/EN.

## 6. Explicit contextual CTA
- [ ] RED exact approved RU/EN target set + forbidden surfaces.
- [ ] No invented EN Deployment Note.
- [ ] parse5 append at content end; missing target/container fails; relative href by path; no heuristics.
- [ ] No automatic CTA on About/Experience/Photos/Sources/Engineering Map.

## 7. Browser/no-JS/search/a11y/cross-browser
- [ ] Add Work with me Chromium desktop/mobile, Firefox/WebKit, overflow, i18n/no-JS/search coverage.
- [ ] Dedicated smoke validates canonical truth, no form, homepage order + 3 paths, Contacts, exact CTA set, Axe/overflow/diagnostics.
- [ ] Capture RU/EN/home/Contacts screenshots; add Build evidence step.

## 8. Visual acceptance
- [ ] Run regression before rebaseline; inspect all intentional surfaces.
- [ ] Update only approved baselines; thresholds stay sampleSize=16, mean delta=5, dimension ratio=0.03; no unrelated rebasing.

## 9. Production gate
- [ ] RED clean RU/EN routes/workflow contract.
- [ ] Exact-deployment smoke validates canonical truth, no form/price, no-JS, home/nav/Contacts/contextual boundaries, no lead runtime.
- [ ] Emit private-practice production summary + screenshot; keep Production Live read-only and SHA-bound.

## 10. Feature PR
- [ ] After planning PR integration, branch from current master.
- [ ] Execute 1–9 RED→GREEN; full quality matrix.
- [ ] Open bounded feature PR; exact-head is pre-production only.
- [ ] Require Build/CodeQL/Dependency Review/current gates, zero unresolved threads, inspected CI visuals; squash only verified head.

## 11. Exact production acceptance
- [ ] Exact squash SHA → Pages deployment identity → deployment-triggered Production Live from exact SHA.
- [ ] Inspect all gates; failures get preserved evidence + RED hotfix, never verifier weakening.
- [ ] Record SHA/run/deployment/artifact/digest/observedAt tuple.

## 12. Durable acceptance
- [ ] After production only, RED exact-evidence test.
- [ ] Prove P3.6 stays NEXT/WAITING.
- [ ] Update PROJECT_STATE/ROADMAP/CHANGELOG via separate docs-only acceptance PR; its deployment never replaces feature evidence.

## Execution handoff

Implementation starts from current `master` after this planning slice is integrated. First product change is Task 1 RED. Tasks 1–9 form one bounded feature slice; Tasks 10–12 preserve repository → artifact → deployment → live acceptance separation.

## Self-review

No unresolved product choice/TBD remains. All approved positioning, canonical truth, bounded surfaces, privacy, RU/EN, SEO/search, no-JS, browser/a11y/visual and exact-production requirements are covered. Forms/CRM/payments/booking/public pricing/service-page farm/conversion tracking remain explicit non-goals.