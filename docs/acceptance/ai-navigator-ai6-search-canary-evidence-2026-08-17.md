# AI Navigator AI-6 — SEARCH canary acceptance evidence

Status: **ACCEPTED — 2026-08-17 — PUBLIC AI STILL OFF**

This record closes the live acceptance gate for AI-6 SEARCH-only canary. It does not activate public SEARCH and does not authorize AI-7/FULL.

## Authoritative run

- Workflow: `AI Navigator SEARCH Canary`
- Run: `32071462490`
- Attempt: `1`
- Trigger: `workflow_dispatch`
- Branch: `master`
- Exact source commit: `8719db44c37a89b6675ba7d252999e2ccecd42de`
- Conclusion: `SUCCESS`
- Evidence artifact ID: `9301872484`
- Evidence artifact name: `ai-navigator-search-canary-32071462490-1`
- Evidence artifact SHA-256: `sha256:d822a684ebf896e5b8f7261d91c73394dcff83524322461b2cde6ba7d7de89a0`

All workflow steps completed successfully, including exact AI-5 artifact restoration, static-index verification, offline semantic benchmark, bounded SEARCH-only live canary, public-OFF verification, and sanitized evidence upload.

## Accepted AI-5 index continuity

The live canary used the exact accepted AI-5 index evidence:

- AI-5 source commit: `f02cfff534ca5a1e251981827a0b886a6c5ec112`
- corpus digest: `sha256:1249ed898193d1a05bda632b1328a860909887a1700092ba38e612ac7e6ac17a`
- embeddings digest: `sha256:aaf2c7ba86a53f0ff040e63c2c75decbf538a84d6c54c1da0e44f124b199510a`
- benchmark digest: `sha256:879ceffdfc7845dd7c558f9e308d53f981001ef29d804fd86b4112c22358a4ed`
- benchmark-query embeddings digest: `sha256:4490e074dbaefcfb2e58bacfc9af7655a1a2b342832e805f83126922a7f075ea`
- chunk count: `327`
- model: `openai/text-embedding-3-small`
- dimensions: `512`

## Semantic gate

The unchanged accepted benchmark remained green:

- total cases: `50`
- positive cases: `40`
- insufficient-information cases: `10`
- Recall@5: `0.95`
- exact-term Recall@5: `1.0`
- paraphrase Recall@5: `1.0`
- lexical baseline Recall@5: `0.875`
- selected hybrid weights: semantic `0.65`, lexical `0.20`, title `0.10`, language `0.05`

No quality threshold or candidate weight was weakened for this run.

## SEARCH runtime evidence

The isolated runtime executed with public AI still OFF and runtime mode `search`.

- public AI mode: `off`
- runtime mode: `search`
- `/v1/answer`: `disabled`
- preflight latency: `52 ms`
- negative answer-endpoint latency: `11 ms`
- embedding requests: exactly `3`

Live embedding probes:

| Probe | Language | Kind | Latency | Reference cosine |
| --- | --- | --- | ---: | ---: |
| `ru-exact-ai-npc` | RU | exact | `256 ms` | `1.0` |
| `ru-paraphrase-production-proof` | RU | paraphrase | `209 ms` | `1.0` |
| `en-platform` | EN | paraphrase | `143 ms` | `1.0` |

All three probes used the pinned model and 512-dimensional embedding space and matched the accepted AI-5 query space.

## Dedicated-key policy and bounded spend

- configured lifetime key limit: `$2`
- automatic reset: none
- maximum allowed successful-run spend delta: `$0.01`
- usage before: `$0.00280782`
- usage after: `$0.00280782`
- observed run usage delta: `$0`
- remaining limit before/after: `$1.99719218`

The zero observed delta is the provider accounting value captured immediately before and after the bounded run; it remains within the acceptance gate and does not imply that provider accounting is instantaneous.

## Candidate / rollback evidence

Sanitized config-pair evidence retained:

- candidate SEARCH config digest: `sha256:266bbab082a4ec3142835077a5c19bd049a00d0122154f6db3c747ccb264b9fe`
- isolated Worker-origin digest: `sha256:64866b21fd93244612276434fe9050fdcfede7ca0f06f67d8ccd75ee658285b5`
- exact OFF rollback config digest: `sha256:bfbeee27709f38c7d72fbb27742eb3ce0f01c9f94d0c2f2e1861fd3589fb0837`
- rollback matches public baseline: `true`
- candidate config validation: `true`
- public config unchanged: `true`

The raw isolated Worker URL and credential material are intentionally absent from this durable evidence record.

## Acceptance decision

AI-6 SEARCH canary is **ACCEPTED** because:

1. implementation and provisioning contracts are merged and repository-tested;
2. the manual canary succeeded on exact `master` commit `8719db44c37a89b6675ba7d252999e2ccecd42de`;
3. the accepted AI-5 index was restored and digest-verified rather than rebuilt silently;
4. semantic quality stayed above the required gate with exact/paraphrase no-regression;
5. candidate SEARCH and exact OFF rollback configuration evidence validated successfully;
6. runtime CORS/origin/mode checks passed;
7. exactly three bounded live embeddings passed model, dimension, and reference-space compatibility checks;
8. `/v1/answer` remained unavailable in SEARCH mode;
9. dedicated-key hard-limit and spend gates passed;
10. `data/ai-navigator.json` remained `mode=off` with an empty Worker URL throughout acceptance.

## Next boundary

The next permitted step is a **separate reversible public SEARCH activation change** that applies the already-validated candidate configuration and retains the exact OFF rollback. AI-7/FULL remains blocked until SEARCH activation has its own production verification and explicit decision.
