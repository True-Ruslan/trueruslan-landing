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

Each project snapshot has exactly one trust state:

- `verified` — the snapshot was explicitly checked and the evidence recorded is considered current for its stated scope;
- `stale` — the snapshot was previously meaningful but is known to require re-verification;
- `unverified` — no current verification claim is made.

`stale` and `unverified` are valid data states and must not fail the build solely because of their trust status.

Malformed or inconsistent evidence must fail the build.

## 6. Canonical schema

`data/project-evidence.json` is a non-empty JSON array of project evidence snapshots.

Canonical shape:

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

### 6.1 Project snapshot fields

Required:

- `project`: kebab-case slug that exists in `data/projects.json`;
- `status`: one of `verified | stale | unverified`;
- `versions`: array of zero or more `{label, value}` facts;
- `signals`: array of evidence signals.

`lastVerified` rules:

- required ISO `YYYY-MM-DD` date for `verified`;
- required ISO `YYYY-MM-DD` date for `stale`, representing the most recent known verification date;
- optional for `unverified`; when present it is the historical last verification date and must still be valid ISO `YYYY-MM-DD`.

Signal-count rules:

- `verified`: at least one signal;
- `stale`: at least one signal;
- `unverified`: zero or more signals.

Version facts:

- `label` and `value` are required non-empty strings;
- labels must be unique within one project snapshot;
- the array may be empty when no version/protocol fact can be stated safely.

### 6.2 Evidence signal fields

Required for every signal:

- `kind`;
- `mode`;
- `label`;
- `state`;
- `observedAt`;
- `scope`.

Optional:

- `url`.

Allowed `kind` values:

- `ci`;
- `release`;
- `pr`;
- `build`;
- `manual`;
- `other`.

Allowed `mode` values:

- `automated`;
- `manual`.

Allowed `state` values:

- `green`;
- `published`;
- `merged`;
- `passed`;
- `accepted`;
- `available`;
- `failed`;
- `pending`;
- `unknown`.

Signal rules:

- `label` and `scope` are required non-empty strings;
- `observedAt` is required ISO `YYYY-MM-DD`;
- `url`, when present, must be a safe `https://` external URL;
- duplicate signals with the same `kind + label + observedAt` are invalid;
- `kind: manual` requires `mode: manual`;
- private/manual evidence is allowed without a public URL;
- every signal scope must describe only what that evidence proves and must not imply broader project readiness.

The broader state enum is intentionally shared across kinds so the registry stays simple. Renderer copy must present the state in context rather than infer semantics beyond the signal scope.

## 7. Validation rules

Create a focused module:

`scripts/project-evidence.js`

Validation must fail fast for structural integrity problems, including:

- registry missing, non-array, or empty;
- duplicate project snapshot;
- project slug not present in `data/projects.json`;
- invalid project slug format;
- invalid trust status;
- missing/invalid `lastVerified` according to status rules;
- malformed `versions` or duplicate version labels;
- malformed `signals` or invalid signal count for the trust status;
- invalid signal kind/mode/state;
- invalid `observedAt`;
- unsafe/non-HTTPS URL when URL is present;
- empty labels, values, or scopes;
- duplicate signal key `kind + label + observedAt`;
- `kind: manual` with non-manual mode;
- connected flagship placeholder without its required evidence snapshot;
- evidence snapshot for a project that cannot be linked to the canonical project registry.

Validation must not fail merely because a snapshot is `stale` or `unverified`.

For the first milestone, `livingworld` and `node-zero` are required evidence projects. Other project-registry entries may exist without evidence snapshots until explicitly connected in a later milestone.

## 8. Rendering and integration

Case-study Markdown remains declarative and contains only an evidence placeholder, for example:

```html
<div data-tr-project-evidence="livingworld"></div>
```

Build flow:

`data/project-evidence.json` -> validator -> renderer -> build-time HTML injection -> generated case-study HTML

The renderer must produce semantic, readable HTML without requiring JavaScript.

First integration targets:

- `docs/landing/projects/livingworld.md`;
- `docs/landing/projects/node-zero.md`.

The evidence block should appear near the project status/current-state portion of each case study, not as a detached footer.

The build post-processing layer must follow the existing Diplodoc-state transformation pattern used by other generated components. It must correctly handle both directly rendered HTML and content stored inside Diplodoc hydration state.

## 9. UI behavior

The component is compact and trust-oriented rather than dashboard-like.

It communicates:

- trust state;
- last checked date where available;
- controlled versions/protocols;
- evidence signals;
- automated/manual distinction;
- scope of each signal;
- stable evidence links where available.

Conceptual presentation:

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

The implementation may use Russian-facing labels consistent with the page language while keeping canonical registry enums in English.

The component must remain compact on mobile and must not introduce horizontal overflow.

## 10. Trust-language rules

The UI and renderer must not make claims broader than the recorded evidence.

Rules:

- green CI does **not** imply production-ready;
- a published release does **not** imply successful real-world acceptance;
- a manual scenario does **not** imply all automated contracts passed;
- `stale` must be visually and textually distinct from current `verified`;
- `unverified` must not use green/confirmed trust language;
- renderer copy must not synthesize readiness claims such as "production ready", "fully tested", or "stable" unless those exact claims are explicitly represented by bounded evidence, which is outside the initial schema.

The required `scope` field is the primary guardrail against evidence overstatement.

## 11. Error handling and degradation

### Build failures

Fail the build for data-integrity errors:

- bad schema;
- bad project references;
- invalid dates/statuses/URLs/enums;
- missing required scope;
- required flagship evidence missing;
- required placeholder missing;
- placeholder project and evidence project mismatch.

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

When Diplodoc keeps primary content inside hydration state, the build must provide the same kind of semantic no-JS fallback pattern already established by the Sources Knowledge Base rather than relying on client hydration.

Any later progressive enhancement must be optional and must not be required to understand status, versions, evidence scope, or links.

## 14. Testing strategy

### Unit contracts

Cover:

- accepted canonical records;
- all trust states;
- project-registry linkage;
- duplicate/missing project handling;
- invalid dates/statuses/URLs/enums;
- `lastVerified` rules;
- signal count rules;
- version facts and duplicate labels;
- automated/manual evidence distinction;
- duplicate signal keys;
- manual-kind mode constraint;
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
- no misleading readiness language generated by the renderer.

### Build integration

Verify:

- LivingWorld placeholder is replaced from canonical evidence data;
- NODE ZERO placeholder is replaced from canonical evidence data;
- missing required evidence fails;
- missing required placeholder fails;
- existing project timeline injection continues to work;
- direct HTML and Diplodoc-state representations are handled correctly;
- generated HTML contains semantic evidence content;
- no-JS fallback exists where hydration-state output requires it.

### Browser smoke

Verify both case studies on desktop and mobile:

- evidence visible and readable;
- status visually distinguishable;
- evidence links usable where present;
- no horizontal overflow;
- Axe serious/critical violations = 0;
- no-JS evidence content remains available.

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

When proof is incomplete, record a narrower `scope` or use `stale`/`unverified` instead of inferring `verified`.

Current external project state must be re-checked immediately before populating the canonical snapshot. Repository/workflow/release information is evidence input, not an automatically trusted claim.

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
3. re-check current external evidence and add canonical real snapshots;
4. write failing build-integration contracts;
5. integrate renderer/placeholders;
6. add scoped styling;
7. add browser/no-JS/Axe coverage;
8. run full CI matrix;
9. review exact diff;
10. merge only after exact-head verification;
11. synchronize durable project-state documentation.
