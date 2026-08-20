# Controlled Launch Publication Receipt

Status: **implementation candidate; publication remains an external operator action**.

## Purpose

Provide a bounded, local intake for recording a real controlled-launch publication **after** the site owner has manually published it on an allowed public channel.

The receipt is a provenance handoff between manual publication and later external-evidence review. It must not become a posting client, a search-performance source, or a second distribution registry.

## Authority

Canonical target identity, allowed channels, canonical URLs, framing and evidence boundaries remain owned by the existing distribution model:

- `data/distribution-targets.json`;
- `data/page-meta.json`;
- `scripts/distribution-readiness.js`;
- `docs/DISTRIBUTION.md`.

`scripts/launch-publication-receipt.js` consumes resolved canonical targets and may only add operator-supplied publication observations. It cannot override target metadata.

## Operator workflow

1. Review the prepared controlled-launch draft immediately before posting.
2. Publish manually on an allowed public channel.
3. Record the public URL and timestamps in a local raw receipt under `private/distribution/`.
4. Run:

```bash
npm run report:launch-receipt -- --input private/distribution/operator-receipt.json
```

5. Review the normalized artifacts under `distribution-artifacts/`.
6. Treat Search Console/Webmaster and measurement observations as separate evidence collected later through their existing authenticated/operator boundaries.

The raw operator input directory is gitignored. Repository automation does not ingest a real receipt automatically.

## Raw input contract

The input is strict JSON with no undeclared fields:

```json
{
  "schemaVersion": 1,
  "observedAt": "2026-08-21T00:30:00.000Z",
  "publications": [
    {
      "targetId": "home",
      "channel": "telegram",
      "canonicalUrl": "https://trueruslan.ru/",
      "publicationUrl": "https://t.me/TrueRuslan_Blog/123",
      "publishedAt": "2026-08-21T00:20:00.000Z"
    }
  ]
}
```

Timestamps use canonical ISO-8601 UTC format. `publishedAt` must not be later than `observedAt`, and `observedAt` must not be in the future.

## Public-channel boundary

Only a channel already allowed by the canonical target can be recorded.

Public publication hosts are fail-closed:

- `github` → `github.com`;
- `habr` → `habr.com`;
- `telegram` → `t.me`.

`direct` sharing is intentionally excluded from public publication evidence because a private handoff has no stable public observation surface.

Publication URLs must use HTTPS, contain no credentials, query parameters or fragments, and identify a concrete path on the expected host. Tracking/UTM mutation is rejected.

The target `canonicalUrl` must byte-match the URL derived from canonical distribution readiness. The receipt cannot introduce a legacy `/landing/` identity, `.html` identity, alternate host or tracking URL.

## Provenance and verification class

Normalized output is explicitly:

- `evidenceClass: operator-supplied-publication-receipt`;
- `verificationState: operator-supplied-not-independently-fetched`;
- `stateImpact: none`;
- per-publication `publicationState: operator-reported-published`.

The generated receipt includes the SHA-256 digest of the exact raw input bytes. The raw input itself is not copied into the generated artifact directory.

A digest proves which bytes were normalized; it does **not** independently prove that the external publication exists or remains publicly visible.

## Evidence boundary

A publication receipt proves only that the operator supplied a bounded public publication URL and timestamp consistent with the canonical launch target.

It does not prove:

- impressions, clicks, CTR or engagement;
- search ranking, indexing or SEO impact;
- hiring, collaboration or conversion outcomes;
- product impact or causal effect;
- independent external verification.

The receipt **does not complete P4.1B or P3.6**, and it does not open P4.1C automatically. Those transitions require their own real authenticated/operator-reviewed evidence and sufficient observation windows.

Unknown metric-like fields are rejected instead of being silently persisted.

## External-action boundary

This feature does not:

- authenticate to GitHub, Habr, Telegram, Google or Yandex;
- call posting APIs;
- fetch external publication URLs;
- schedule announcements;
- mutate external account state;
- update Search Console/Webmaster;
- mark the overall controlled launch as completed.

The existing `Distribution Readiness` workflow remains `contents: read`. It runs the receipt contract tests only; it never supplies fabricated publication input and never performs a real publication receipt run.

## Output

The local command writes only normalized review artifacts:

- `distribution-artifacts/controlled-launch-publication-receipt.json`;
- `distribution-artifacts/controlled-launch-publication-receipt.md`.

These artifacts are evidence handoff material, not automatic durable-state promotion.
