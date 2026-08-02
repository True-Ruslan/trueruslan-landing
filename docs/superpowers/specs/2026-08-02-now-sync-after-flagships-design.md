# `/now` synchronization after flagship milestones — design

## Context

The current `/now` page is already static-first and correctly separates two kinds of truth:

- active project identity/status/cards come from `data/projects.json`;
- short-lived editorial focus comes from `data/now.json`.

The page itself is a stable Markdown shell with one build-time placeholder. `scripts/now-page.js` validates the editorial registry, derives active cards from Project Registry and injects semantic HTML into the generated Diplodoc page.

After the Vlezet flagship, External Publications Showcase and VillAIgence flagship milestones, the editorial snapshot dated `2026-07-22` is stale. It still names LivingWorld and describes a development phase that predates the current evidence-backed portfolio state.

## Goal

Update `/now` into an accurate 2026-08-02 snapshot of the current engineering focus without introducing another roadmap, status registry or content engine.

## Considered approaches

### 1. Data-only editorial refresh — selected

Update `data/now.json`, retain the current schema and renderer, and strengthen the existing test fixture so the public VillAIgence identity cannot regress to LivingWorld.

Benefits:

- smallest possible change;
- no duplicated project status ownership;
- no visual redesign or baseline churn expected;
- preserves build-time validation and no-JavaScript content;
- easy to update again when the focus changes.

### 2. Add `recentlyCompleted` and `next` sections

This would require a schema, renderer and styling expansion. It would also begin duplicating `PROJECT_STATE`, `ROADMAP` and project timelines. Rejected as unnecessary for a short-lived snapshot page.

### 3. Generate `/now` from roadmap and recent commits

This would automate public truth from operational metadata and make the page noisy and unstable. It would also violate the rule that public truth is not mutated automatically. Rejected.

## Editorial model

The refreshed page will communicate four facts:

1. Infrastructure is no longer the main blocker; the current phase is content consolidation, real product acceptance and distribution.
2. Vlezet work is focused on trustworthy assisted recognition, where CV/LLM output remains a proposal until deterministic review and explicit application.
3. VillAIgence work is focused on exact installed-artifact acceptance, rollback safety and the distinction between green source/package gates and real server acceptance.
4. The next authored materials will be grounded Engineering Notes derived from these verified implementation boundaries.

The copy must remain first-person, calm and factual. It must not claim that VillAIgence `0.1.22` has passed installed acceptance, that Vlezet arbitrary-plan recognition is accurate, or that public distribution has already produced meaningful audience telemetry.

## Data changes

`data/now.json` keeps its existing schema:

```json
{
  "updated": "YYYY-MM-DD",
  "focus": "...",
  "learning": ["..."],
  "writing": ["..."]
}
```

Planned values:

- `updated`: `2026-08-02`;
- `focus`: transition from infrastructure construction to evidence-backed product acceptance, content consolidation and distribution;
- `learning`: reliable AI authority/acceptance boundaries, Vlezet assisted recognition review/apply architecture, and static-first distribution/aggregate telemetry interpretation;
- `writing`: grounded notes about exact-head CI versus installed acceptance, deterministic authority around AI/CV proposals, and restart/persistence as a product contract.

## Compatibility and architecture boundaries

Unchanged:

- route `landing/now.html`;
- Markdown shell and placeholder;
- `data/projects.json` as project-status owner;
- `data/now.json` as editorial-focus owner;
- `scripts/now-page.js` schema and renderer;
- Diplodoc as site-wide search owner;
- static-first/no-runtime-API architecture;
- no backend, CMS or automatic public-state mutation;
- current visual structure and CSS.

## Test strategy

Use TDD with one focused contract update before the editorial data change:

- fixture public name must be `VillAIgence` while retaining slug/route `livingworld`;
- rendered `/now` content must contain `VillAIgence` and must not expose `LivingWorld`;
- registry-derived href remains `landing/projects/livingworld.html`;
- existing escaping/date/list validation remains intact;
- add a repository-data assertion that `data/now.json` has date `2026-08-02`, contains the approved current boundaries and contains no stale `LivingWorld` token.

The complete repository matrix remains mandatory after implementation:

- unit/contract tests;
- production Diplodoc build;
- generated-site integrity;
- mobile overflow;
- Chromium/Axe/Lighthouse;
- focused product/evidence/diagram/browser gates;
- Firefox/WebKit;
- generated search;
- RU/EN, analytics and metadata;
- Engineering Map;
- visual regression;
- custom-domain artifact verification.

## Acceptance criteria

The milestone is complete when:

1. `/now` displays an update date of `2026-08-02`.
2. The editorial snapshot accurately names Vlezet and VillAIgence boundaries without broad release claims.
3. Active project cards remain registry-derived.
4. No stale public `LivingWorld` name appears in the `/now` data or rendered-contract fixture.
5. No schema, route, CSS or runtime architecture is added.
6. The exact feature head passes the full configured CI matrix.
7. A separate continuity PR records the actual feature merge SHA and verification evidence.