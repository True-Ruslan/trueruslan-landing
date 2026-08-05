# P3.3 — Flagship normalization design

> Status: approved for implementation under the accepted Portfolio 1.0 roadmap
>
> Date: 2026-08-05
>
> Repository: `True-Ruslan/trueruslan-landing`

## 1. Goal

Normalize the public VillAIgence and Vlezet flagship case studies to the evidence-first narrative contract established by TrueRuslan Landing in P3.2, without changing either project's accepted lifecycle state.

The result must help a technical reader answer, in a stable order:

1. what problem and user the project serves;
2. what constraints and risks shaped it;
3. what lifecycle boundary is currently accepted;
4. what architecture and source of truth govern it;
5. what alternatives were considered and rejected;
6. what capabilities are implemented;
7. what evidence verifies those claims;
8. what limitations remain;
9. what next milestone is accepted;
10. what related material and repository evidence is available.

## 2. Scope

### Public pages to normalize

- `docs/landing/projects/livingworld.md` — Russian VillAIgence canonical case study;
- `docs/landing/projects/vlezet.md` — Russian Vlezet canonical case study;
- `docs/en/projects/livingworld.md` — existing controlled English VillAIgence layer.

### Explicitly deferred

- a new English Vlezet page — remains P3.5 selective English expansion;
- route renames, new project slugs or repository identity changes;
- new runtime, backend, CMS or search architecture;
- external-project implementation work;
- promotion of Draft or automated evidence into product acceptance.

## 3. Canonical narrative contract

Russian VillAIgence and Vlezet pages must use the same ordered section markers as the P3.2 platform case study:

```text
problem
constraints
current-state
decisions
alternatives
evidence
limitations
next
related
retrospective
```

The existing English VillAIgence page must follow the equivalent order with the same markers. Its evidence remains intentionally delegated to the Russian canonical page and shared registries; it must not create a second English evidence model.

The existing `failures` narrative is retained as ordinary content under architecture/decisions or retrospective context, but the obsolete `case-study:failures` marker is removed from normalized pages.

## 4. Content-preservation rules

Normalization is structural, not promotional.

The implementation must preserve:

- existing canonical routes;
- project slugs `livingworld` and `vlezet`;
- diagrams;
- RU timeline and evidence placeholders;
- repository links;
- accepted metrics and exact bounded evidence;
- compatibility-sensitive VillAIgence internal names;
- Vlezet's millimetre geometry and explicit Apply authority;
- all current clean URL, metadata, Sitemap and search behavior.

Both Russian pages receive a registry-backed status placeholder near the introduction:

```html
<span data-tr-project-status="livingworld"></span>
<span data-tr-project-status="vlezet"></span>
```

No status text is hard-coded as a substitute for `data/projects.json`.

## 5. Current external truth to preserve

### Vlezet

Observed on 2026-08-05:

- PR #42 is open and Draft;
- exact observed head is `c49921d83e8c2ab7e7729a1cc5fe958930f3ee0a`;
- CI #3138, Recognition Benchmark #316 and M7 Browser Audit #769 are green;
- the same real-plan product-owner retest remains mandatory;
- accepted public boundary remains M7.8B;
- M7.8C remains pending and must not be described as merged or accepted.

The page must distinguish reproducible automated gates from real-plan owner acceptance.

### VillAIgence

Observed on 2026-08-05:

- accepted automated boundary remains PR #103/PR #104 plus published candidate `0.1.23+1.21.1` production-JAR startup/restart evidence;
- cumulative real-provider, multiplayer, focused gameplay and product-owner acceptance remains pending;
- PR #110 is open and Draft at `e0b763aa4a5caea8897aadc6ee2cab6c1b407c89`;
- PR #110 currently defines a RED shared STT → Chat retries → TTS deadline contract;
- repository security policy and Java PR checks pass, while the main VillAIgence CI fails at the intentionally missing production APIs;
- PR #110 is development evidence only and must not change the accepted lifecycle.

The public lifecycle remains `release-candidate` / `ACCEPTANCE IN PROGRESS`.

## 6. Page-specific design

### VillAIgence

- **Problem:** server-authoritative AI society, not a chat wrapper.
- **Constraints:** mutable world, async provider calls, memory provenance, provider and release boundaries.
- **Current state:** accepted `0.1.23+1.21.1` automated boundary first; Draft PR #110 separately identified as active RED work.
- **Decisions:** session ownership, immutable context, Memory 2.0, Operator Lore, degradation, selective MCA synchronization and exact-artifact release identity.
- **Alternatives:** reject client authority, transcript-only memory, LLM-created facts/actions, broad upstream merge/Mixins, source CI as release proof and per-stage fresh timeout budgets.
- **Evidence:** shared registry placeholder and bounded interpretation.
- **Limitations:** cumulative acceptance, global orchestration deadline, logical two-client lore conflict, focused water/grave live canaries and final promotion remain unresolved.
- **Next:** implement and verify M11 Phase C, then run cumulative acceptance against one exact candidate.
- **Related:** server-authoritative NPCs, protocol boundary, source tests to installed acceptance, deterministic authority, restart/persistence, repository.

### Vlezet

- **Problem:** precise apartment geometry after imperfect image recognition.
- **Constraints:** millimetres, one document authority, no silent replacement, AI cannot create geometry, 3D is read-only.
- **Current state:** accepted M0–M7.8B first; Draft M7.8C and green exact-head automation separately identified.
- **Decisions:** framework-independent geometry, semantic history, common furniture-fit geometry, Recognition Draft, benchmark-first and region-first extraction.
- **Alternatives:** reject pixels as canonical coordinates, direct recognition overwrite, cloud-created/moved geometry, line-first primary extraction, separate 3D truth and snapshot-only Undo.
- **Evidence:** registry placeholder and clear automated/manual interpretation.
- **Limitations:** real-plan defects, perspective photos, incomplete semantic reconstruction and pending M7.8C owner retest.
- **Next:** product-owner retest and bounded correction/acceptance of M7.8C; room faces and labels remain later work.
- **Related:** deterministic authority, green CI versus product verification, Projects hub, repository.

## 7. Canonical data updates

### `data/projects.json`

Lifecycle, labels, routes and visibility remain unchanged.

### `data/project-evidence.json`

- refresh `lastVerified` for VillAIgence and Vlezet to `2026-08-05`;
- preserve all accepted evidence unchanged;
- update the Vlezet PR #42 pending signal with current exact-head green automation while retaining mandatory owner retest;
- add VillAIgence PR #110 as a `pending` Draft/RED signal whose scope explicitly states that no production implementation or acceptance is proven.

### Project histories

- keep accepted milestones immutable;
- show VillAIgence M11 Phase C as current Draft/RED work without replacing PR #103/#104 acceptance evidence;
- keep Vlezet M7.8C as current Draft work;
- next milestones remain bounded and do not imply promotion.

## 8. Validation strategy

### TDD contracts

1. Update `scripts/flagship-case-study.test.js` so RU VillAIgence and Vlezet use the evidence-first marker order.
2. Require their registry-backed status placeholders.
3. Reject obsolete `case-study:failures` markers on normalized pages.
4. Add equivalent ordered-marker coverage for the existing English VillAIgence page.
5. Add focused boundary assertions for:
   - Vlezet M7.8B accepted / M7.8C Draft;
   - VillAIgence automated startup/restart accepted / cumulative acceptance pending / PR #110 Draft RED;
   - required related links;
   - no lifecycle promotion language.

### Generated artifact and browser validation

The complete existing quality matrix remains mandatory:

- unit contracts;
- Diplodoc build;
- generated-site integrity;
- mobile overflow;
- Chromium accessibility and Lighthouse;
- Firefox/WebKit compatibility;
- Project Evidence and timeline rendering;
- generated search;
- RU/EN pairing and metadata;
- visual regression;
- custom-domain artifact.

Changed flagship pages receive focused browser assertions for section order, visible status/evidence boundaries and clean related links. Visual baselines are updated only if reviewed layout changes are intentional.

### Production acceptance

After squash merge and exact Pages deployment:

- baseline Production Live Smoke must pass;
- a deployment-only flagship-normalization smoke must verify the RU VillAIgence, RU Vlezet and EN VillAIgence routes, section markers/content boundaries, status, evidence/timeline presence and first-party request health;
- production evidence is retained as an artifact tied to the exact deployed SHA.

## 9. Failure behavior

- missing required marker, placeholder or canonical evidence fails unit/build contracts;
- unknown project status/evidence identity fails closed;
- Draft evidence is rendered as pending, never promoted;
- missing optional related material is omitted rather than replaced with a fake link;
- production smoke failures block acceptance and are diagnosed before durable closure;
- no quality gate is weakened to make content changes pass.

## 10. Acceptance criteria

- RU VillAIgence and Vlezet follow the complete evidence-first marker order;
- existing EN VillAIgence follows the same narrative order;
- routes, slugs, diagrams and evidence identities remain stable;
- both RU pages show registry-backed current status;
- Vlezet remains `pre-production` / `ACTIVE DEVELOPMENT`, M7.8B accepted, M7.8C Draft;
- VillAIgence remains `release-candidate` / `ACCEPTANCE IN PROGRESS`, cumulative acceptance pending;
- PR #110 is represented only as Draft/RED work;
- related links are valid and deterministic;
- full exact-head CI and browser matrix pass;
- exact Pages deployment and deployment-only production verification pass;
- durable state advances to P3.4 only after production acceptance.
