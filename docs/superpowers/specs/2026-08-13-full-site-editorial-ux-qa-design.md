# Full-site Editorial & UX QA — Design

Date: **2026-08-13**

Status: **APPROVED / IMPLEMENTATION NEXT**

This specification records the final exhaustive editorial/UX quality pass requested after the accepted Portfolio Clarity & Scanability redesign and the later N1–N5 polish sequence.

It is intentionally **not another broad redesign**. The site already has an accepted information architecture, typography foundation, scan-first homepage, professional surfaces, knowledge surfaces and Engineering Notes reader architecture. The purpose of this stage is to prove that every public page is coherent, concise and easy to scan, then fix only residual problems found by that audit.

## Important correction: typography is already implemented

The primary typeface does **not** need to be selected again.

C1 / PR #174 already production-accepted the current typography foundation:

- self-hosted **Onest Variable**;
- reviewed Cyrillic and Latin WOFF2 subsets;
- no Google Fonts or other runtime font CDN;
- `font-display: swap`;
- desktop body target `17px`;
- mobile body target `16px`;
- body line-height `1.62`;
- long-form prose width `70ch`;
- separate monospace stack for code/technical accents;
- repository-retained SIL OFL 1.1 license and exact font-byte contracts.

Current owner: `docs/_assets/style/typography.css`.

Onest remains the accepted typeface unless this audit finds a concrete readability, glyph, rendering or performance defect. Aesthetic preference alone is not enough to reopen the font decision.

## Product goal

A visitor should be able to understand the role and purpose of every first-class page within a few seconds, then decide whether to scan, act or go deeper.

The final experience should be:

- calm rather than dense;
- scan-first rather than document-first;
- concise rather than slogan-heavy;
- personal and professional rather than corporate or AI-generated sounding;
- technically precise without surfacing internal repository vocabulary unnecessarily;
- consistent across RU and EN where equivalent routes exist;
- accessible and useful without JavaScript;
- deep where the page exists specifically for evidence or technical reading.

## Architecture

This work is split into three bounded slices.

### N6A — Deterministic full-site audit baseline

Create one repository-native audit owner that inventories the current public site and produces a review report from real source/generated content.

The audit must derive its page set from canonical repository/build owners rather than a manually maintained second site map.

For every public route it records at least:

- route / source owner;
- locale;
- page class;
- title/H1;
- prose word count;
- paragraph count;
- longest paragraph length;
- heading count;
- number of internal links and primary actions where deterministically extractable;
- scanability warnings;
- internal/process vocabulary warnings on surface pages;
- RU/EN counterpart status where applicable.

The report is **diagnostic evidence**, not an automatic copy editor. Thresholds emit warnings; they must not silently rewrite prose.

### N6B — Human editorial/UX disposition ledger

Review every page from the generated inventory and assign one explicit disposition:

- `KEEP` — already appropriate;
- `TIGHTEN_COPY` — wording is correct but unnecessarily long/internal;
- `RESTRUCTURE` — hierarchy/order impairs scanning;
- `REDUCE_VISUAL_WEIGHT` — too many panels/borders/repeated surfaces;
- `ALIGN_RU_EN` — equivalent locale meaning diverges;
- `DEEP_KEEP` — intentionally dense evidence/technical page; retain depth.

Every non-KEEP disposition must name the concrete problem and intended correction. “Feels off” is not sufficient.

### N6C — Selected residual corrections

Implement only findings supported by N6A + N6B.

Each correction must preserve page purpose and factual meaning. Deep evidence pages must not be flattened merely to reduce word count.

## Page classes and review strictness

### Tier 1 — decision surfaces

Highest scanability bar:

- homepage;
- Projects hub;
- Experience / Resume;
- Work with me;
- About;
- Now;
- Materials hub;
- Contacts.

Expected behavior:

- purpose obvious from H1 + first paragraph;
- first meaningful action/path visible without reading the full page;
- short paragraphs and descriptive headings;
- no repository/process jargon unless user-facing meaning requires it;
- no repeated explanation already available one click deeper.

### Tier 2 — discovery surfaces

High scanability with more descriptive depth:

- Publications;
- Engineering Notes hub;
- Engineering Map;
- Sources;
- Photos;
- project hubs/flagship summary surfaces;
- public search entry surfaces.

Expected behavior:

- clear orientation before lists/graphs/cards;
- obvious grouping and next step;
- collection metadata helps selection rather than adding noise.

### Tier 3 — deep evidence / long-form surfaces

Depth is allowed and often required:

- individual Engineering Notes;
- detailed project evidence/timelines;
- long-form case studies;
- source/reference material.

Expected behavior:

- clear opening problem/question;
- readable headings and navigation;
- no unnecessary introductory throat-clearing;
- technical detail retained where it is the page’s purpose.

N5 already audited all current Engineering Notes structurally. N6 must verify them as part of complete inventory but must not reopen destructive merge/delete decisions without new evidence.

## Editorial rules

For public surface copy:

- lead with the visitor’s useful context;
- use direct verbs and concrete nouns;
- prefer Russian where an English process term adds no useful precision;
- keep established technical terms where translation would be worse;
- remove duplicated qualifiers and repeated self-description;
- avoid generic phrases such as “современные решения”, “инновационные технологии”, “магия AI”, “уникальный подход”;
- avoid repository-only language such as acceptance identity, oracle, fail-closed, durable reconciliation, exact-head, evidence boundary on Tier 1 surfaces;
- do not invent metrics, seniority, dates, outcomes or business impact;
- preserve QWEP as current full-time commercial context and MarketDB as historical/closed context;
- preserve the distinction between implemented, tested, accepted, merged and released where lifecycle status matters.

## Scanability diagnostics

Diagnostics are warnings, not absolute editorial law.

For Tier 1 pages, flag for review when any of the following occur:

- first prose paragraph exceeds 55 words;
- any prose paragraph exceeds 85 words;
- more than 5 consecutive prose/list blocks appear without a descriptive heading or structural break;
- H1 is followed by process/internal disclaimer language before useful visitor context;
- page contains repository-only vocabulary without an explicit technical/evidence purpose;
- the same CTA label/path is repeated excessively in one reading section.

For Tier 2 pages, use softer thresholds:

- first prose paragraph > 70 words;
- any prose paragraph > 110 words;
- orientation copy is absent before a large collection.

Tier 3 pages are inventoried but long-form thresholds do not create automatic severity.

## Visual QA

The existing browser and visual-regression harness remains the owner of layout acceptance.

N6 human review must inspect representative desktop and mobile output for every Tier 1 and Tier 2 surface and record findings for:

- visual hierarchy;
- whitespace rhythm;
- excessive gray panels/borders;
- awkward wrapping;
- CTA prominence;
- heading/content alignment;
- mobile stacking;
- horizontal overflow;
- font fallback/FOIT/FOUT anomalies;
- no-JS usefulness on representative routes.

Do not add a second screenshot framework.

## RU/EN policy

Equivalent routes do not need literal translation, but they must preserve the same professional claim, lifecycle truth and user action.

The audit must distinguish:

- intentional editorial localization;
- factual divergence;
- missing counterpart that is already an accepted product boundary.

No new English route is created solely to satisfy symmetry.

## SEO boundary

This work can improve clarity and internal usability, but must not be described as proven SEO/ranking/CTR/conversion improvement.

P4.1B remains sparse/in-progress, P4.1C remains waiting for reviewed external evidence, and the clean-URL observation clock remains unchanged.

Metadata/H1/internal-link changes are allowed only when needed to correct a concrete N6 content/UX defect or an already-established semantic inconsistency. They are not to be mass-rewritten for speculative SEO.

## Testing and evidence

N6A must use TDD:

1. RED tests define route inventory, page classification, metric extraction and warning semantics.
2. Minimal audit implementation makes those tests GREEN.
3. The real repository report is generated and reviewed.
4. N6B ledger is committed with complete route coverage.
5. N6C changes receive focused source/browser tests where deterministic contracts exist.
6. Final exact-head Build, Dependency Review, CodeQL, browser, accessibility, Lighthouse, Firefox/WebKit, RU/EN, no-JS, search, metadata, visual, custom-domain and Search Discovery gates must pass.
7. Squash merge is followed by exact Pages deployment and deployment-triggered Production Live verification before N6 is production accepted.

## Proposed files

N6A:

- create `scripts/editorial-ux-audit.js` — deterministic audit engine/CLI;
- create `scripts/editorial-ux-audit.test.js` — RED/GREEN unit and real-repository contracts;
- modify `package.json` — add `check:editorial` only; do not put the diagnostic report into the main build gate until its warning policy is proven stable;
- generate `quality-artifacts/editorial-ux-audit.json` and `quality-artifacts/editorial-ux-audit.md` in CI/manual review contexts.

N6B:

- create `docs/audits/2026-08-13-full-site-editorial-ux-qa.md` — complete human disposition ledger, sourced from N6A inventory.

N6C:

- modify only pages/styles/tests named by accepted ledger findings.

## Definition of done

N6 is complete only when:

- every canonical public route is represented in the audit inventory;
- every route has a page class and human disposition;
- every Tier 1/Tier 2 residual high-value problem is either corrected or explicitly accepted with rationale;
- typography remains Onest unless a concrete defect is demonstrated;
- no factual/project lifecycle state is invented or promoted;
- RU/EN semantic truth remains aligned;
- full quality/security/visual matrix passes;
- exact production deployment is verified;
- `PROJECT_STATE.md`, `ROADMAP.md` and `CHANGELOG.md` are reconciled;
- controlled launch remains a separate explicit operator action.

## Explicit non-goals

- another global redesign;
- another font experiment without a defect;
- mass shortening of Engineering Notes or evidence pages;
- speculative SEO rewrite;
- automatic AI rewriting of public copy;
- new runtime framework/CMS/backend;
- second navigation/search/content source of truth;
- external publishing or Search Console/Webmaster mutation.
