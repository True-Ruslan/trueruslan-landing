# Portfolio UX & Content Polish — Implementation Plan

> **Execution model:** implement one bounded slice at a time with RED → GREEN → exact-head quality gates → squash merge → Pages → deployment-triggered Production Live → durable reconciliation.

**Goal:** finish the approved post-navigation UX/content backlog without weakening static-first, route, accessibility, privacy, search or evidence contracts.

**Design source:** `docs/superpowers/specs/2026-08-12-portfolio-ux-content-polish-design.md`

**Current base:** Navigation IA is already production accepted via PR #217. This plan starts with N2 and preserves N1 unchanged.

## Global constraints

- Static-first + build-time intelligence + progressive enhancement.
- Diplodoc remains the only site-wide full-text search owner.
- Existing clean URLs, canonical/hreflang/OpenGraph/Sitemap/feed contracts remain stable.
- RU/EN locale ownership and the top-right language selector remain unchanged.
- No runtime navigation owner, browser-language redirect, external auto-posting or search-console mutation.
- No quality-gate weakening.
- No claim of SEO/engagement/conversion improvement from presentation polish alone.
- `2026-08-05T00:00:00Z` clean-URL observation clock remains unchanged.
- Controlled launch stays `not-published`; P4.1B stays sparse/in-progress; P4.1C and P3.6 remain evidence-gated unless later evidence genuinely changes them.

---

## Task 0 — Durable umbrella backlog

**Files**
- `docs/superpowers/specs/2026-08-12-portfolio-ux-content-polish-design.md`
- `docs/superpowers/plans/2026-08-12-portfolio-ux-content-polish-implementation.md`
- GitHub umbrella issue

**Steps**
1. Commit the complete user-requested backlog, including N1–N5 and the QWEP/MarketDB truth boundary.
2. Create one umbrella issue with explicit statuses and delivery order.
3. Open a docs-only PR against current master.
4. Run full Build / Dependency Review / CodeQL on exact docs head.
5. Squash merge only after review is clean.
6. Verify Pages and deployment-triggered Production Live for the docs merge.
7. Do not treat the docs deployment as product acceptance for later implementation slices.

**Exit:** the repository can recover the complete backlog without relying on chat history.

---

## Task 1 — N2 RED: homepage layout contract

**Create**
- `scripts/homepage-layout-polish.test.js`
- `scripts/homepage-layout-polish-browser-smoke.cjs`

**Modify**
- `.github/workflows/build.yml`

**Read/owning sources**
- `templates/index.html`
- `docs/_assets/style/home-refinement.css`

**RED contract**
1. Require a dedicated homepage layout smoke and CI step before changing production CSS.
2. Browser acceptance must cover representative desktop, tablet and mobile widths.
3. Assert no horizontal overflow or page/console errors.
4. Measure each `.tr-home-bridge`: copy/action vertical alignment, action-group placement, text measure, and section gap consistency.
5. Require actions to remain visually associated with their bridge copy instead of occupying a remote right-edge island.
6. Verify existing CTA labels/routes and semantic section content are unchanged.
7. Preserve accessibility/focus behavior and reduced-motion behavior through existing global gates.
8. Push RED test-only head and confirm failure is exactly the missing/new layout contract, not an unrelated regression.

**Commit:** `test: define homepage layout polish contract`

---

## Task 2 — N2 GREEN: homepage spacing and symmetry

**Modify**
- `docs/_assets/style/home-refinement.css`
- `templates/index.html` only if a bounded semantic hook is truly needed
- visual baseline only for reviewed intentional change

**Implementation direction**
1. Refine the existing `.tr-home-bridge` grid; do not introduce a second layout system.
2. Replace the current bottom/right-biased pairing (`align-items:end` + remote right justification) with a calmer paired layout.
3. Bound the action column width and keep actions spatially close to their corresponding copy.
4. Normalize bridge vertical padding and inter-section spacing using the existing spacing vocabulary.
5. Keep headings and body copy on a readable measure.
6. Preserve the current stack behavior at <=960px and mobile CTA stacking at <=720px.
7. Do not remove useful copy merely to achieve symmetry.

**Verification**
- focused contract GREEN;
- `npm test` GREEN;
- exact-head Build including homepage smoke, global browser/a11y/Lighthouse, cross-browser, i18n/search and visual regression;
- Dependency Review + CodeQL GREEN;
- review comments/threads clean;
- squash merge;
- exact merge SHA Pages SUCCESS;
- deployment-triggered Production Live SUCCESS;
- reconcile `PROJECT_STATE`, `ROADMAP`, `CHANGELOG` as N2 production accepted.

**Commit family:** `feat: refine homepage spacing and symmetry`

---

## Task 3 — N3/N3b/N3c RED: Work with me, Now and professional truth

**Create/extend tests**
- extend `scripts/work-with-me-browser-smoke.cjs`
- create a focused source contract for Work/Now/professional context if existing tests do not cover source semantics
- add a Now browser acceptance gate if the current global smoke does not measure its layout

**Owning sources**
- `docs/landing/work-with-me.md`
- `docs/_assets/style/collaboration.css`
- `docs/landing/now.md`
- corresponding EN route(s)
- `docs/landing/resume.md` as canonical detailed QWEP source
- relevant homepage/About/project/profile sources discovered by audit

**RED requirements**
1. Work with me: availability, tracks, process, handoff and boundaries remain semantically distinct but do not all present as equally heavy gray bordered panels.
2. Work with me: desktop/mobile/no-JS remain readable, keyboard accessible and without overflow.
3. Now: intro is a bounded framing block with readable measure and deliberate spacing before generated state.
4. Now: generated state remains authoritative for volatile current project facts; intro does not duplicate or invent them.
5. Professional truth: current employment references identify QWEP as current full-time commercial context where current employment is discussed.
6. MarketDB, if present or introduced as history, is explicitly historical/closed side commercial startup context and never current focus.
7. Existing detailed QWEP resume facts are reused exactly; no invented title/date/duty/metric/company claim.
8. RU/EN claims remain semantically aligned where both locales expose the same fact.

**Commit:** `test: define work now and professional context contract`

---

## Task 4 — N3/N3b/N3c GREEN

**Work with me**
- soften panel/background/border treatment in `collaboration.css`;
- use whitespace and typography for hierarchy before adding more containers;
- preserve three-track comparability and explicit boundaries;
- keep CTA/handoff visually clear but not oversized.

**Now**
- turn the two loose explanatory paragraphs into a concise public framing block;
- give it a readable max-width/line-height and controlled gap to generated current state;
- mirror structural treatment in English if applicable.

**Professional context**
- audit all relevant source surfaces;
- make QWEP the clear current full-time context where appropriate;
- keep MarketDB as a closed historical side-startup chapter, not active/current;
- preserve resume as detailed truth owner.

**Verification/shipping**
Same exact-head / review / squash / Pages / deployment-triggered Production Live sequence as Task 2. Reconcile durable state only after exact production acceptance.

**Commit family:** `feat: polish collaboration and current context`

---

## Task 5 — N4 RED: Publications visual contract

**Extend/create**
- `scripts/publications-browser-smoke.cjs`
- source/style contract if needed

**Owning sources**
- `docs/landing/publications.md`
- EN publications source
- `docs/_assets/style/publications.css`
- generator-owned publication markup if required by inspection

**RED requirements**
1. Topic chips share a stable content edge with title/summary.
2. Chip padding/line-height/gaps are consistent across rows.
3. Long topic labels wrap or size naturally without clipping/overflow.
4. Cards keep a predictable meta → title → summary → topics → related/actions rhythm.
5. Missing optional content does not create awkward large gaps.
6. Desktop/mobile/no-JS remain readable and accessible.
7. External canonical publication links/evidence semantics remain unchanged.

**Commit:** `test: define publications card rhythm contract`

---

## Task 6 — N4 GREEN: Publications tags/cards

**Modify**
- `docs/_assets/style/publications.css`
- markup/generator only if CSS cannot fix the underlying semantic grouping

**Implementation direction**
- normalize chip flex behavior and inline metrics;
- use one predictable vertical stack per card;
- avoid equal-height hacks and semantic truncation;
- keep action areas visually separated but not detached.

**Verification/shipping**
Focused + full CI, exact-head browser/visual, review, squash, Pages, Production Live, durable reconciliation.

**Commit family:** `feat: refine publications card rhythm`

---

## Task 7 — N5 Engineering Notes research audit

**Create**
- `docs/research/2026-08-12-engineering-notes-content-seo-audit.md`
- optional generated inventory artifact/script if deterministic inventory adds value

**Repository evidence**
1. Inventory every current Note URL/title.
2. Record approximate length, heading structure, opening clarity, examples/evidence, related/internal links and overlap candidates.
3. Classify each note with one disposition:
   - keep as-is;
   - keep URL, strengthen intro/summary;
   - keep URL, group into explicit series/hub;
   - expand with examples/evidence;
   - merge candidate — only with concrete duplication rationale and migration plan.
4. Review sparse P4.1B data only as bounded evidence; do not infer traffic/SEO impact from absent pre-launch traffic.

**External research**
Use current primary official sources only (Google Search Central and Yandex official search/Webmaster documentation; other official primary sources only if directly relevant). Research:
- helpful/people-first content guidance;
- duplicate/near-duplicate and canonical guidance;
- internal linking/site structure guidance;
- redirects/URL migrations where merging would change URLs.

**Audit output**
- distinguish editorial readability findings from SEO hypotheses;
- recommend non-destructive hub/series/related-reading improvements by default;
- preserve existing note URLs unless evidence supports a merge;
- specify exact tests/migration if any merge candidate survives review.

**Exit:** a per-note decision table and ranked implementation scope, committed and reviewed. No structural Note deletion/merge happens in the audit PR.

---

## Task 8 — N5 selected implementation

Only implement recommendations explicitly selected from the audit.

**Likely safe classes**
- stronger intros/summaries;
- `Start here` path on Notes hub;
- explicit series grouping;
- related-reading links;
- selective expansion of thin/too-internal notes.

**If a merge is justified**
- keep old route as a tested redirect/compatibility entrypoint;
- migrate canonical/internal links/search index/feed/sitemap ownership deliberately;
- preserve noindex/compatibility semantics where applicable;
- test both old and destination routes;
- treat search-engine replacement as external observation, not immediate acceptance.

Ship through full exact-head and production gates.

---

## Task 9 — Final reconciliation and launch handoff

After N2–N5 selected work is production accepted:

1. Update `PROJECT_STATE`, `ROADMAP`, `CHANGELOG` with exact acceptance evidence.
2. Mark umbrella issue checkboxes honestly.
3. Confirm no remaining user-requested polish item is silently omitted.
4. Confirm controlled launch is still `not-published` unless the operator actually published.
5. Then hand off to controlled manual launch and subsequent post-launch evidence collection.

## Definition of done

The request is complete only when N2–N4 are production accepted, N5 audit is complete with per-note decisions, selected N5 changes are separately accepted, and durable state can reconstruct the full history and remaining evidence gates without relying on conversation memory.
