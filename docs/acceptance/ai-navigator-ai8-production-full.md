# AI Navigator AI-8 — production FULL preparation and acceptance

Status: **PREPARATION — public SEARCH remains the accepted baseline. FULL activation is a separate change.**

This runbook prepares a dedicated production FULL Worker without changing the public site. It deliberately separates provisioning, pre-activation verification, activation, public acceptance, and rollback so a failed experiment can be reversed without modifying the accepted SEARCH Worker.

## Safety boundary

- The current public `data/ai-navigator.json` must remain `mode: "search"` during provisioning and pre-activation verification.
- AI-8 uses a dedicated Worker: `trueruslan-ai-navigator-ai8-full-production`.
- AI-8 uses a dedicated ordinary OpenRouter key. Do not reuse the AI-7 canary key.
- The OpenRouter key must have a lifetime spending limit of at most `$2`, no automatic reset, and must not be a management/provisioning key.
- The Wrangler config has no `route` or `routes`; provisioning cannot take over `trueruslan.ru` traffic.
- The Worker accepts browser CORS only from `https://trueruslan.ru`.
- The accepted AI-5 corpus is bundled into the dedicated runtime; the answer path does not fetch a mutable corpus over the network.
- Ordinary PR/Build CI remains provider-free.
- Provisioning uses Wrangler `4.120.0`, pinned in the workflow and examples below.

## Preferred path — protected GitHub provisioning workflow

Use the manual workflow **`AI Navigator AI-8 Production Provision`** (`.github/workflows/ai-navigator-ai8-production-provision.yml`) after the provisioning PR has been merged to `master` and ordinary CI is green.

Create/protect the GitHub Environment `ai8-public-full-production`. Require human approval if the repository plan supports environment reviewers, and keep every deployment credential environment-scoped rather than repository-wide. Configure exactly these secrets:

- `CLOUDFLARE_API_TOKEN` — a dedicated Cloudflare API token scoped to the target account and only the Worker permissions needed for deployment; do not grant DNS/zone permissions for this no-route Worker unless Cloudflare explicitly requires them for the account setup;
- `CLOUDFLARE_ACCOUNT_ID` — the target Cloudflare account ID used by Wrangler in CI;
- `OPENROUTER_AI8_API_KEY` — the dedicated lifetime-capped ordinary OpenRouter key used only by the AI-8 production Worker;
- `AI8_FULL_WORKER_BASE_URL` — exactly `https://trueruslan-ai-navigator-ai8-full-production.trueruslan.workers.dev`.

The workflow is `workflow_dispatch` only, `contents: read`, `master` only, and requires `confirm_provision=true`. It performs these operations in order:

1. re-proves the provider-free AI-8 provisioning/runtime contracts;
2. restores and verifies the exact accepted AI index;
3. proves `data/ai-navigator.json` is still the accepted AI-6 SEARCH baseline;
4. creates a mode-`0600` secret file under the ephemeral runner directory;
5. runs `wrangler@4.120.0 deploy --dry-run --strict` first;
6. deploys only `infra/cloudflare/wrangler.ai8-full-production.jsonc --env ai8-full-production` with the dedicated OpenRouter key via `--secrets-file`;
7. runs `scripts/ai8-production-provisioning-verify.js` directly against the dedicated Worker while public production is still SEARCH;
8. deletes the ephemeral secret file even on failure;
9. uploads only sanitized provisioning evidence and its SHA-256 digest for 90 days.

The workflow never commits, pushes, edits `data/ai-navigator.json`, creates a Cloudflare route/custom domain, deletes a Worker, or activates FULL on the site.

## What pre-activation verification proves

The pre-activation verifier reuses the same accepted `probeAi8PublicFull` Worker checks that the later public FULL acceptance uses. It supplies only an in-memory candidate FULL config so the direct Worker can be exercised while the repository and deployed site intentionally remain SEARCH.

The verifier is fail-closed and allowlist-only. It proves:

- the Worker origin is the exact dedicated AI-8 `workers.dev` origin, not the accepted AI-6 Worker or AI-7 canary;
- allowed-origin preflight succeeds and foreign-origin POST is rejected without CORS leakage;
- `/v1/embed` returns the accepted `openai/text-embedding-3-small` / 512-dimensional contract;
- the returned vector still retrieves the reviewed canonical document from the exact accepted AI index;
- one grounded answer returns the exact canonical citation;
- one insufficient-evidence answer remains empty and uncited;
- the accepted AI-6 SEARCH Worker still returns `503 feature_disabled` for `/v1/answer`;
- the dedicated OpenRouter key remains ordinary, lifetime-capped, non-renewing, and inside the per-run spend bound;
- every real network request is on the explicit allowlist and uses redirect-deny semantics;
- evidence contains bounded diagnostics/digests rather than provider bodies, credentials, or the raw Worker origin.

A successful provisioning workflow means only **Worker provisioned + pre-activation verification passed**. It is not public FULL acceptance.

## Optional local operator path

The GitHub workflow is preferred because it centralizes the protection and evidence path. If a local emergency/operator path is required, create a gitignored file `infra/cloudflare/.dev.vars.ai8-full-production` with exactly:

```dotenv
OPENROUTER_API_KEY=<dedicated-ai8-production-key>
```

`.dev.vars*`, `.env*` and `.wrangler/` are repository-ignored. Never put the provider key in Wrangler `vars`, source files, logs, PR text, or artifacts.

Dry-run first:

```bash
npx --yes wrangler@4.120.0 deploy \
  --config infra/cloudflare/wrangler.ai8-full-production.jsonc \
  --env ai8-full-production \
  --secrets-file infra/cloudflare/.dev.vars.ai8-full-production \
  --dry-run \
  --outdir .wrangler/ai8-full-production-dry-run \
  --strict
```

Only after reviewing the dry-run may the same exact config be deployed:

```bash
npx --yes wrangler@4.120.0 deploy \
  --config infra/cloudflare/wrangler.ai8-full-production.jsonc \
  --env ai8-full-production \
  --secrets-file infra/cloudflare/.dev.vars.ai8-full-production \
  --strict
```

Delete the local secret file immediately after provisioning. Do not rotate or duplicate a valid dedicated key merely to redeploy identical Worker code.

## Activation boundary

FULL activation is a **separate PR after provisioning and pre-activation verification have succeeded**. That activation PR should change only:

- `mode`: `search` → `full`;
- `workerBaseUrl`: accepted AI-6 SEARCH Worker → exact `AI8_FULL_WORKER_BASE_URL`.

Do not add Cloudflare routes, do not modify model/ranking parameters, and do not combine unrelated content/UI changes with activation. Merge only after ordinary provider-free CI is green, then verify the exact Pages deployment of that activated `master` SHA.

After deployment, manually dispatch **`AI Navigator Public FULL Acceptance`** (`.github/workflows/ai-navigator-public-full-acceptance.yml`) on `refs/heads/master` with its explicit live-provider confirmation. The read-only workflow verifies deployed FULL config, exact Worker identity, CORS allow/deny, embedding contract, semantic SEARCH regression against the restored accepted index, grounded/insufficient answers, bounded latency/spend, and zero unexpected client-side external requests. It writes only sanitized evidence and an evidence digest.

## Production acceptance decision

Accept public FULL only when the manual public FULL workflow succeeds for the exact deployed `master` SHA and its evidence artifact is retained. A green repository Build or successful Worker provisioning alone is not production acceptance. Any failure is a rollback signal; do not fix forward on a live failing FULL surface.

Only after successful public FULL acceptance should `docs/PROJECT_STATE.md`, `docs/ROADMAP.md`, and `docs/CHANGELOG.md` record the exact source SHA and sanitized evidence digest, and only then may issue #289 be closed.

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
npx --yes wrangler@4.120.0 delete \
  --config infra/cloudflare/wrangler.ai8-full-production.jsonc \
  --env ai8-full-production
```

Revoke the dedicated AI-8 OpenRouter key when the Worker is permanently retired. Never delete or repurpose the accepted AI-6 SEARCH Worker/key as part of an AI-8 rollback.
