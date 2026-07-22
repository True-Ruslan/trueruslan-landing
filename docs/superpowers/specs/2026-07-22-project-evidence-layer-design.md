# Project Evidence Layer — design

Date: 2026-07-22
Status: approved for implementation planning
Scope: first implementation for `livingworld` and `node-zero`; architecture reusable for all project registry entries

## 1. Goal

Project case studies currently contain strong technical narratives, but parts of their status/version/CI story are still expressed as prose claims. The Project Evidence Layer adds a separate, validated, build-time evidence model that answers one question consistently:

> What exactly proves the current state of this project?

The layer must increase trust without overstating what CI, releases, or manual testing prove.

## 2. Non-goals

This milestone does not add:

- runtime GitHub API calls;
- build-time GitHub API dependencies;
- a CMS, database, or backend;
- automatic evidence freshness detection;
- automatic promotion to `verified`;
- a replacement for project timelines or narrative case-study content;
- a site-wide search feature.

Automatic freshness checks belong to the later Content Freshness Guard milestone.

## 3. Architectural decision

Use a separate canonical registry:

`data/project-evidence.json`

Do not overload `data/projects.json` with evidence details. `data/projects.json` remains the project/navigation registry; evidence remains an independently validated concern linked by project slug.

The first milestone covers:

- `livingworld`;
- `node-zero`.

The schema and renderer must be generic enough to add `portfolio-platform`, `taskhub`, and other projects without redesign.

## 4. Source of truth

Evidence is a **manual controlled snapshot**.

Humans explicitly update `data/project-evidence.json` after checking real project state. The build validates and renders that snapshot but does not fetch GitHub metadata automatically.

A `verified` state is never inferred from a green build, release link, or repository state. It must be explicitly recorded after verification.

## 5. Trust model

Each project snapshot has one of three trust states:

- `verified` — the snapshot was explicitly checked and the evidence recorded is considered current for its stated scope;
- `stale` — the snapshot was previously meaningful but is known to require re-verification;
- `unverified` — no current verification claim is made.

`stale` and `unverified` are valid data states and must not fail the build solely because of their trust status.

Malformed or inconsistent evidence must fail the build.

## 6. Canonical data model

Recommended shape:

```json
[
  {
    "project": "livingworld",
    "status": "verified",
    "lastVerified": "2026-07-22",
    "versions": [
      {
        "label": "Minecraft",
        "value": "1.21.1"
      }
    ],
    "signals": [
      {
        "kind": "ci",
        "mode": "automated",
        "label": "CI",
        "state": "green",
        "url": "https://github.com/...",
        "observedAt": "2026-07-22",
        "scope": "Unit, package, game-test and integration contracts covered by this workflow run."
      },
      {
        "kind": "manual",
        "mode": "manual",
        "label": "Voice conversation acceptance",
        "state": "accepted",
        "observedAt": "2026-07-22",
        "scope": "Real microphone -> STT -> NPC -> LLM -> visible response path was manually exercised."
      }
    ]
  }
]
```

Exact field naming may be refined during implementation planning, but the semantics below are fixed.

### Required project-level semantics

Each snapshot must contain:

- `project` — slug that exists in `data/projects.json`;
- `status` — `verified | stale | unverified`;
- `lastVerified` — ISO calendar date for `verified`/`stale`; nullable or omitted only where the final schema explicitly permits `unverified` without a historical verification date;
- zero or more controlled version/protocol facts;
- one or more evidence signals for `verified` and `stale` snapshots.

### Evidence signal semantics

Each signal must identify:

- evidence kind, such as `ci`, `release`, `pr`, `build`, or `manual`;
- evidence mode: `automated` or `manual`;
- short label;
- controlled state appropriate for the signal;
- observation date/time or date where appropriate;
- URL when a stable public evidence link exists;
- required `scope` explaining exactly what this signal proves.

The model must support private projects such as NODE ZERO without forcing a public URL for manual/private evidence.

## 7. Validation rules

Create a focused module, expected as:

`scripts/project-evidence.js`

Validation must fail fast for structural integrity problems, including:

- registry is missing or malformed;
- duplicate project snapshot;
- project slug not present in `data/projects.json`;
- invalid trust status;
- invalid or malformed dates;
- unsafe/non-HTTPS external URLs where URLs are present;
- empty labels, values, or scopes;
- invalid automated/manual mode;
- malformed signal state/kind values;
- duplicate or structurally contradictory signals where the final schema can detect them;
- connected flagship placeholder without the required evidence snapshot.

Validation must not fail merely because a snapshot is `stale` or `unverified`.

## 8. Rendering and integration

Case-study Markdown remains declarative and contains only an evidence placeholder, for example:

```html
<div data-tr-project-evidence="livingworld"></div>
```

Expected build flow:

`data/project-evidence.json` -> validator -> renderer -> build-time HTML injection -> generated case-study HTML

The renderer must produce semantic, readable HTML without requiring JavaScript.

The first integration targets are:

- `docs/landing/projects/livingworld.md`;
- `docs/landing/projects/node-zero.md`.

The evidence block should appear near the project status/current-state portion of each case study, not as a detached footer.

## 9. UI behavior

The block is compact and trust-oriented rather than dashboard-like.

It should communicate at a glance:

- trust state (`VERIFIED`, `STALE`, `UNVERIFIED` or equivalent Russian-language presentation consistent with the page);
- last checked date where available;
- verified versions/protocols where relevant;
- evidence signals;
- evidence type distinction (`automated` versus `manual`);
- scope of each signal;
- stable evidence links where available.

Example conceptual presentation:

```text
VERIFIED
Last checked: 2026-07-22

Minecraft: 1.21.1
LivingWorld: 0.1.x

Automated evidence
CI: green
Scope: unit, game-test and integration contracts covered by this run
[Workflow]

Manual evidence
Voice conversation acceptance: accepted
Scope: real microphone -> STT -> NPC -> LLM -> visible response exercised
```

The component must remain compact on mobile and must not introduce horizontal overflow.

## 10. Trust-language rules

The UI and renderer must not make claims broader than the recorded evidence.

Examples:

- green CI does **not** imply production-ready;
- a published release does **not** imply successful real-world acceptance;
- a manual scenario does **not** imply all automated contracts passed;
- a stale snapshot must not visually resemble a current verified snapshot;
- an unverified snapshot must not use green/confirmed trust language.

The required `scope` field is the primary guardrail against evidence overstatement.

## 11. Error handling and degradation

### Build failures

Fail the build for data-integrity errors:

- bad schema;
- bad references;
- invalid dates/statuses/URLs;
- missing required scope;
- required flagship evidence missing;
- placeholder/evidence mismatch.

### Valid degraded states

Do not fail the build solely for:

- `stale`;
- `unverified`;
- absence of a public URL for legitimate private/manual evidence.

These states must degrade honestly in rendered UI.

## 12. Existing prose migration

Where LivingWorld or NODE ZERO currently duplicate machine-like evidence claims in prose, move the structured claim into the evidence registry and keep only narrative explanation that adds context.

Do not mechanically delete useful case-study discussion about architecture, test philosophy, limitations, or manual acceptance boundaries.

The evidence layer complements narrative; it does not replace it.

## 13. No-JS and static-first requirement

Core evidence content must exist in generated HTML at build time and remain readable with JavaScript disabled.

No runtime fetch is allowed for core evidence.

Any later progressive enhancement must be optional and must not be required to understand status, versions, evidence scope, or links.

## 14. Testing strategy

### Unit contracts

Cover:

- accepted canonical records;
- all trust states;
- project-registry linkage;
- duplicate/missing project handling;
- invalid dates/statuses/URLs;
- version facts;
- automated/manual evidence distinction;
- required scope;
- escaping and safe rendering.

### Renderer contracts

Cover:

- correct `verified`, `stale`, and `unverified` presentation;
- dates and versions;
- automated/manual grouping or equivalent semantic distinction;
- evidence links;
- scope rendering;
- safe escaping;
- no misleading trust language generated by the renderer.

### Build integration

Verify:

- LivingWorld placeholder is replaced from canonical evidence data;
- NODE ZERO placeholder is replaced from canonical evidence data;
- missing required evidence fails;
- existing project timeline injection continues to work;
- generated HTML contains semantic evidence content.

### Browser smoke

Verify both case studies on desktop and mobile:

- evidence visible and readable;
- status visually distinguishable;
- evidence links usable where present;
- no horizontal overflow;
- Axe serious/critical violations = 0;
- no-JS content remains available.

### Regression matrix

Existing quality gates must remain green, including project timelines, search, metadata/OG, Engineering Map, Sources Knowledge Base, Photo Stories, Lighthouse/accessibility and visual/browser checks already present in CI.

## 15. Initial evidence population rules

Initial data for LivingWorld and NODE ZERO must be based only on verifiable current project information.

Never fabricate:

- release numbers;
- CI status;
- workflow success;
- manual acceptance;
- version compatibility;
- public URLs for private evidence.

When available proof is incomplete, record a narrower scope or use `stale`/`unverified` instead of inferring `verified`.

## 16. Definition of Done

The milestone is complete when:

1. `data/project-evidence.json` exists as canonical evidence source.
2. Strict validation exists and is integrated into the build.
3. LivingWorld and NODE ZERO render evidence from canonical data through placeholders.
4. Trust states `verified`, `stale`, and `unverified` render distinctly.
5. Automated and manual evidence are explicitly distinguishable.
6. Every evidence signal has a bounded proof scope.
7. Core evidence works without JavaScript.
8. Browser/mobile/accessibility checks cover the feature.
9. Existing quality/regression matrix remains green.
10. Exact PR head has a fully green CI run.
11. Diff/review is completed before merge.
12. After merge, `docs/PROJECT_STATE.md`, `docs/ROADMAP.md`, and `docs/CHANGELOG.md` are synchronized with the actual merge SHA and verified CI evidence.

## 17. Implementation sequence constraint

Implementation must follow TDD and existing repository patterns:

1. write failing evidence model/validation contracts;
2. implement minimal registry module;
3. add canonical real evidence snapshots;
4. write failing build-integration contracts;
5. integrate renderer/placeholders;
6. add scoped styling;
7. add browser/no-JS/Axe coverage;
8. run full CI matrix;
9. review exact diff;
10. merge only after exact-head verification;
11. synchronize durable project-state documentation.
