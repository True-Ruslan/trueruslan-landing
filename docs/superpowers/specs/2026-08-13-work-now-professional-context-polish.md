# N3 Work / Now / Professional Context Polish

Date: **2026-08-13**

Status: **IMPLEMENTATION IN PROGRESS**

Parent design: `docs/superpowers/specs/2026-08-12-portfolio-ux-content-polish-design.md`

## Scope

This bounded slice implements three already-approved corrections:

1. **N3 Work with me visual polish** — make the page lighter and calmer by reducing nested gray/bordered surface weight, improving whitespace and keeping the three work tracks/process/handoff easy to scan.
2. **N3b Now intro** — replace the internal-status-style callout with a short public framing block while preserving generated project-state ownership.
3. **N3c professional truth** — keep QWEP as the current full-time commercial context and move MarketDB to explicit closed historical side-commercial/startup context without inventing an end date.

## Non-goals

- no pricing/product packaging redesign;
- no change to canonical collaboration availability;
- no new runtime or API;
- no project lifecycle promotion from `data/now.json`;
- no SEO/ranking/engagement/conversion claim;
- no N4 Publications or N5 Notes work in this PR.

## Truth boundary

Detailed QWEP facts remain owned by the existing Resume/Experience entry. Public summary surfaces may state only that QWEP is the current full-time commercial context plus facts already present in that canonical entry.

MarketDB remains part of professional history, but must not be described as present employment, active development or current commercial focus. Because no exact closing date has been established in the accepted repository evidence, this slice must say that the project is closed without inventing an end month/year.

The `Now` generated current-state block remains authoritative for volatile project facts. The new intro is framing, not a second project-state registry.

## Acceptance

- RED contract fails on the pre-change state for all three requested corrections;
- generated Work with me pages have a bounded page hook and page-specific lighter visual treatment;
- RU/EN Now intros use the same semantic structure and readable measure;
- QWEP/MarketDB truth is aligned across RU/EN Resume, About and Projects;
- existing no-JS, search, accessibility, privacy, clean-URL and collaboration boundaries remain green;
- exact-head Build, Dependency Review and CodeQL pass;
- intentional visual deltas use only reviewed bounded baseline updates;
- squash merge is followed by exact Pages deployment and deployment-triggered Production Live acceptance.
