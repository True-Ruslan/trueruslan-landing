# Portfolio P4.1 — Search & Discovery

> Status: **P4.1A REPOSITORY ACCEPTED / EXTERNAL SEARCH EVIDENCE NOT YET COLLECTED**
>
> Date: **2026-08-11**

## Purpose

P4.1 improves how the public portfolio is understood and discovered by search systems without replacing the site's existing source-of-truth model or manufacturing SEO conclusions from generic heuristics.

The milestone is deliberately split into bounded slices:

- **P4.1A — Search Discovery repository readiness**: deterministic structural audit over the canonical metadata, RU/EN pairing and clean-route architecture.
- **P4.1B — external search evidence intake**: collect bounded aggregate observations from Google Search Console and Yandex Webmaster after the relevant observation window exists.
- **P4.1C — evidence-backed discovery improvements**: change metadata, information scent and internal linking only where P4.1B evidence or a concrete structural finding supports the change.

P4.1 is independent from the P3.6 engagement measurement decision. P4.1A must not close P3.6, reset its clean-URL observation clock or reinterpret repository readiness as product/search impact.

## Existing canonical owners

P4.1 does not create a second metadata or localization registry.

- `data/page-meta.json` remains the canonical owner of page title, description and OpenGraph metadata for the controlled discovery scope.
- `data/i18n.json` remains the canonical owner of controlled RU/EN route pairs and hreflang pairing.
- `scripts/clean-urls.js` remains the canonical route-projection implementation.
- the existing Diplodoc-generated local search remains the single site-wide search owner.
- sitemap/canonical production identity remains governed by the existing SEO/site-artifact pipeline.

`data/search-discovery.json` is therefore a **policy/coverage manifest**, not a content truth store. For bilingual surfaces it stores only an existing `i18nId`; it does not repeat RU/EN paths. Direct paths are allowed only for strategic surfaces that do not yet have a controlled bilingual pair.

## P4.1A evidence boundary

P4.1A uses:

```text
evidenceClass = repository-readiness
externalEvidence = not-collected
```

It may report only deterministic repository facts. In particular, the P4.1A policy/report must not persist or infer:

- impressions;
- clicks;
- CTR;
- average position/rank;
- indexed URL counts from external consoles;
- search-performance or traffic conclusions.

Those observations belong to P4.1B and must come from real external systems.

## Strategic discovery scope

The initial policy intentionally covers a bounded set of surfaces with the highest discovery or decision value and an existing canonical metadata contract:

- identity/home;
- professional Experience/resume route;
- Projects hub;
- Now/current work;
- Publications;
- Work with me;
- Engineering Notes;
- VillAIgence case study;
- Vlezet case study;
- NotchHub case study;
- Portfolio Platform case study.

RU-only secondary knowledge surfaces such as Sources remain reachable and covered by their existing browser/site-integrity contracts, but they are not promoted into the first P4.1A controlled metadata scope merely to make this audit broader. A later discovery slice may add them only with an explicit canonical metadata decision.

The policy records semantic `role` and `intentClass` identifiers only. These identifiers describe audit scope; they are not replacement titles, descriptions or target search queries.

## Deterministic readiness checks

`scripts/search-discovery.js` resolves the policy against the canonical owners and fails closed when it finds:

1. a referenced `i18nId` that does not exist in `data/i18n.json`;
2. a strategic route without a canonical `data/page-meta.json` entry;
3. a strategic source path that does not project to a clean public route;
4. duplicate titles across **different strategic surfaces**;
5. duplicate descriptions across **different strategic surfaces**.

Equivalent proper-name titles are allowed for the RU and EN routes of the same canonical bilingual surface. They are not competing discovery identities merely because the localized pair shares a product name. The same value reused by two different strategic surfaces remains a finding.

The check intentionally does **not** enforce folklore character-count rules such as a universal 60-character title limit. Copy changes require a separate evidence-backed decision rather than an arbitrary threshold.

## Generated evidence

The CLI:

```bash
npm run check:discovery
```

writes only derived repository-readiness evidence:

```text
quality-artifacts/search-discovery-readiness.json
quality-artifacts/search-discovery-readiness.md
```

The ordinary `npm test` gate invokes `check:discovery` for immediate fail-closed feedback. The Build workflow also reruns the same deterministic check after custom-domain artifact verification and before final evidence preservation, so the uploaded `quality-artifacts` bundle contains the final JSON/Markdown report plus `search-discovery-readiness.log`.

A `READY` report means only that the scoped repository architecture is structurally coherent. It does not mean that Google/Yandex indexing is complete or that organic search performance is good.

## Accepted P4.1A repository evidence

The first complete repository acceptance candidate is exact head `02c587d7adaca57d13cf9e68dd3babf269285d2f`:

- Build #1858 / `31537039625` — SUCCESS;
- CodeQL #1408 / `31537039524` — SUCCESS;
- Dependency Review #1286 / `31537039489` — SUCCESS;
- Dependency Audit #215 / `31537039452` — SUCCESS;
- quality artifact `9119360015`;
- quality digest `sha256:411410e9e3f9afecb04984de72b66bedcc6ad67d9a03f16d068ab4fb375632d3`;
- preserved discovery evidence: **11 strategic surfaces / 21 clean routes / 0 findings / READY**;
- `externalEvidence=not-collected`.

The quality ZIP was inspected directly and contains `search-discovery-readiness.json`, `search-discovery-readiness.md` and `search-discovery-readiness.log`. This is repository-readiness evidence only; it is not Search Console/Webmaster or product-impact evidence.

## P4.1B boundary

P4.1B may begin after P4.1A is accepted. Its responsibility is to collect reviewable external evidence such as:

- queries/pages with real impressions and clicks;
- clean versus legacy URL indexing state;
- coverage/indexing problems;
- observable RU/EN discovery differences;
- concrete search intents that already reach the site.

The preferred inputs are aggregate exports or bounded read-only API results from Google Search Console and Yandex Webmaster. No fabricated sample data may be promoted as external evidence.

P4.1B evidence must remain distinct from P3.6. The same Search Console/Webmaster aggregates may be relevant to both milestones, but each milestone has its own decision question and acceptance semantics.

## P4.1C boundary

Only after structural P4.1A findings or real P4.1B evidence exists should P4.1C change user-facing discovery content. Candidate changes include:

- title/description refinement;
- H1/H2 information scent;
- internal links between Experience, projects, Notes, Publications and Work with me;
- structured-data refinements;
- reducing accidental duplicate/competing discovery surfaces;
- explicitly bringing additional RU-only surfaces into the controlled metadata/discovery scope when justified.

Every change must preserve scanability from C1–C7 and avoid keyword stuffing or long SEO-first copy.

## Acceptance criteria for P4.1A

P4.1A is repository-accepted only when all of the following are true on one exact PR head:

- the dedicated TDD contract is green;
- the canonical policy validates;
- the generated readiness report is `READY` with zero structural findings;
- the full existing Build matrix is green;
- CodeQL and Dependency Review are green;
- the Build quality artifact contains the JSON/Markdown readiness evidence;
- durable `PROJECT_STATE.md`, `ROADMAP.md` and `CHANGELOG.md` record the boundary;
- P3.6 remains `NEXT / WAITING FOR EXTERNAL EVIDENCE`;
- no Search Console/Yandex Webmaster performance claim is recorded as if it were observed.

Acceptance evidence must belong to the **current PR head**. Superseded RED runs, intermediate migration commits or checks attached to an older head remain history and cannot satisfy this gate. The final PR head therefore receives a fresh full CI revalidation after the acceptance ledger is written; the evidence above records the first complete candidate that established the boundary.

Because P4.1A changes repository readiness/documentation rather than a user-facing presentation surface, merge acceptance does not by itself create a search-performance or production-impact conclusion.
