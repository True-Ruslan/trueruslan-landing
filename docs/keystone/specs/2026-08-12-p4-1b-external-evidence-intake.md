# P4.1B External Search Evidence Intake

Status: **repository intake tooling; real external evidence still not collected**.

This document specifies the bounded intake layer for real Google Search Console and Yandex Webmaster observations. It is a prerequisite for evidence review, not a substitute for P4.1B collection and not a completion claim.

## Evidence boundaries

- `data/search-discovery.json` remains the P4.1A repository-readiness policy and keeps `externalEvidence: not-collected`.
- P4.1B input must come from an authenticated operator export or read-only API result outside this repository.
- P4.1B does **not** close, reset, or reinterpret P3.6. The systems may overlap, but their questions and acceptance semantics remain separate.
- P4.1C must use reviewed real observations. Intake-tool readiness alone cannot justify metadata, copy, H1/H2, internal-link or structured-data changes.
- No credentials, OAuth tokens, account identifiers or raw private exports are committed to Git.

## Local input handling

Real files belong under the ignored local directory:

```text
private/search-discovery/
```

The repository intentionally contains no example evidence file. Tests construct temporary fixtures in the operating-system temp directory and never persist them as project evidence.

## Normalized JSON contract

Top level:

| Field | Contract |
| --- | --- |
| `schemaVersion` | integer `1` |
| `evidenceClass` | exact `external-search-observations` |
| `property` | credential-free HTTPS root URL-prefix property for the configured site |
| `collectedAt` | valid timestamp recording when the operator collected/exported the evidence |
| `observations` | non-empty array |

Each observation:

| Field | Contract |
| --- | --- |
| `source` | `google-search-console` or `yandex-webmaster` |
| `collectionMethod` | `export` or `api` |
| `kind` | `performance` or `indexing` |
| `window.start` / `window.end` | ISO dates, ordered and not later than `collectedAt` |
| `rows` | non-empty array matching the observation kind |

Performance rows support two dimensions:

- `query`: aggregate query text plus non-negative `clicks` / `impressions`, optional bounded `ctr` and non-negative `position`;
- `page`: same metrics, but the value must be an absolute same-property HTTPS URL.

Indexing rows contain:

- same-property HTTPS `url`;
- state: `indexed`, `not-indexed`, `excluded`, or `unknown`;
- optional same-property `canonicalUrl`;
- optional bounded textual `reason`.

Unknown fields fail closed. This prevents an unreviewed raw API payload or accidental credential-bearing object from silently becoming accepted evidence.

## Report contract

Run:

```bash
npm run report:discovery:external -- \
  --input private/search-discovery/<operator-file>.json \
  --output-dir quality-artifacts
```

The CLI:

1. reads only the explicit input file;
2. verifies current P4.1A repository readiness first;
3. validates source, provenance method, dates, metrics and same-property URLs;
4. computes the SHA-256 of the exact input bytes;
5. writes local `search-discovery-external-evidence.json` and `.md` reports;
6. separates query/page evidence, RU/EN clean-page aggregates, legacy `.html` visibility and indexing observations;
7. reports bounded findings such as `legacy-html-performance`, `strategic-route-not-indexed`, and `canonical-mismatch`;
8. never changes repository metadata or lifecycle state automatically.

A report with findings is still a valid evidence report. Findings are inputs to human review and possible P4.1C work; they are not a reason to mutate the site automatically.

## Raw export adapters

Raw CSV/API shapes are intentionally **not guessed** in this slice. Search Console and Webmaster export schemas can differ by product surface, localization and selected dimensions. The first adapter should be implemented only against an actual operator-provided export/API response, with the raw file remaining ignored and the adapter covered by a fixture derived structurally from that real format.

## Acceptance for this intake slice

Repository intake tooling is ready only when:

- validation is fail-closed for unsupported provenance, cross-property URLs, invalid dates and impossible metrics;
- real-input paths are ignored by Git;
- ordinary `npm test` never performs authenticated external collection;
- the report is tied to the input SHA-256 and current P4.1A readiness;
- P3.6 and P4.1A boundaries are explicit in code, tests and human-readable output;
- complete repository Build, CodeQL and Dependency Review remain green.

This does **not** mark P4.1B complete. P4.1B remains NEXT until real external evidence is supplied, validated and reviewed.
