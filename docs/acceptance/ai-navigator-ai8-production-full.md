# AI Navigator AI-8 — production FULL preparation and acceptance

Status: **PREPARATION — public SEARCH remains the accepted baseline. FULL activation is a separate change.**

This runbook prepares a dedicated production FULL Worker without changing the public site. It deliberately separates provisioning, activation, acceptance, and rollback so a failed experiment can be reversed without modifying the accepted SEARCH Worker.

## Safety boundary

- The current public `data/ai-navigator.json` must remain `mode: "search"` during PREPARATION.
- AI-8 uses a dedicated Worker: `trueruslan-ai-navigator-ai8-full-production`.
- AI-8 uses a dedicated ordinary OpenRouter key. Do not reuse the AI-7 canary key.
- The key must have a lifetime spending limit of at most `$2`, no automatic reset, and must not be a management/provisioning key.
- The Wrangler config has no `route` or `routes`; PREPARATION cannot take over `trueruslan.ru` traffic.
- The Worker accepts browser CORS only from `https://trueruslan.ru`.
- The accepted AI-5 corpus is bundled into the dedicated runtime; the answer path does not fetch a mutable corpus over the network.
- Ordinary PR/Build CI remains provider-free.

## Local secret file

Create a gitignored file `infra/cloudflare/.dev.vars.ai8-full-production` with exactly:

```dotenv
OPENROUTER_API_KEY=<dedicated-ai8-production-key>
```

`.dev.vars*`, `.env*` and `.wrangler/` are repository-ignored. Never put the provider key in Wrangler `vars`, source files, logs, PR text, or artifacts.

## Dry run

```bash
npx --yes wrangler@4.118.0 deploy \
  --config infra/cloudflare/wrangler.ai8-full-production.jsonc \
  --env ai8-full-production \
  --secrets-file infra/cloudflare/.dev.vars.ai8-full-production \
  --dry-run \
  --outdir .wrangler/ai8-full-production-dry-run
```

Review the dry-run output before any network deployment. The resolved Worker must be `trueruslan-ai-navigator-ai8-full-production`, `AI_MODE=full`, `AI_ANSWER_ENABLED=true`, and contain no custom-domain route.

## Deploy

```bash
npx --yes wrangler@4.118.0 deploy \
  --config infra/cloudflare/wrangler.ai8-full-production.jsonc \
  --env ai8-full-production \
  --secrets-file infra/cloudflare/.dev.vars.ai8-full-production \
  --strict
```

If the same Worker already owns the secret, redeploy without `--secrets-file`; do not rotate or duplicate credentials merely to redeploy code. Record the clean `https://<worker>.workers.dev` origin locally and delete the local `.dev.vars` file after provisioning.

Create/protect the GitHub Environment `ai8-public-full-production` and provide these environment-scoped secrets:

- `AI8_FULL_WORKER_BASE_URL` — exact clean `workers.dev` origin of the dedicated AI-8 Worker;
- `OPENROUTER_AI8_API_KEY` — the same dedicated lifetime-capped ordinary key used by that Worker.

## Verification before activation

Before public activation, verify the isolated Worker directly with bounded requests: exact allowed-origin CORS, foreign-origin rejection, accepted 512-dimensional embedding contract, one grounded answer, one insufficient-evidence answer, and provider/key spend inside the hard limit.

Do **not** run `AI Navigator Public FULL Acceptance` yet. That workflow intentionally fails closed while repository/public config remains SEARCH.

## Activation boundary

FULL activation is a **separate PR after this PREPARATION PR is accepted**. That activation PR should change only:

- `mode`: `search` → `full`;
- `workerBaseUrl`: accepted AI-6 SEARCH Worker → exact `AI8_FULL_WORKER_BASE_URL`.

Do not add Cloudflare routes, do not modify model/ranking parameters, and do not combine unrelated content/UI changes with activation. Merge only after ordinary provider-free CI is green, then wait for the exact Pages deployment of that activated master SHA.

After deployment, manually dispatch `.github/workflows/ai-navigator-public-full-acceptance.yml` on `refs/heads/master` with `confirm_public_full=true`. The read-only workflow verifies deployed FULL config, exact Worker identity, CORS allow/deny, embedding contract, semantic SEARCH regression against the restored accepted index, grounded/insufficient answers, bounded latency/spend, and zero unexpected client-side external requests. It writes only sanitized evidence and an evidence digest.

## Production acceptance decision

Accept public FULL only when the manual workflow succeeds for the exact deployed master SHA and its evidence artifact is retained. A green repository Build alone is not production acceptance. Any failure is a rollback signal; do not fix forward on a live failing FULL surface.

## Rollback to SEARCH

Rollback restores the previously accepted public contract first:

```json
{
  "mode": "search",
  "workerBaseUrl": "https://trueruslan-ai-navigator-ai6-search-canary.trueruslan.workers.dev"
}
```

Create a minimal rollback PR, run ordinary CI, merge, and verify the exact Pages deployment. Confirm the public UI is SEARCH and the accepted SEARCH Worker still returns `503 feature_disabled` for `/v1/answer` before cleaning up AI-8 infrastructure.

Only after SEARCH is restored may the isolated Worker be removed if desired:

```bash
npx --yes wrangler@4.118.0 delete \
  --config infra/cloudflare/wrangler.ai8-full-production.jsonc \
  --env ai8-full-production
```

Revoke the dedicated AI-8 OpenRouter key when the Worker is permanently retired. Never delete or repurpose the accepted AI-6 SEARCH Worker/key as part of an AI-8 rollback.
