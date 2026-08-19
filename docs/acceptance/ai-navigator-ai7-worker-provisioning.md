# AI Navigator AI-7 — isolated FULL Worker provisioning

Status: **OPERATOR RUNBOOK — PUBLIC SEARCH REMAINS PRODUCTION BASELINE / FULL IS NOT PRODUCTION**

This runbook provisions the isolated Cloudflare Worker required by the AI-7 FULL canary. It does not change `data/ai-navigator.json`, does not activate FULL on the public site, and is not AI-7 acceptance by itself.

## Repository contract

Use only:

- config: `infra/cloudflare/wrangler.ai7-full-canary.jsonc`;
- entrypoint: `infra/cloudflare/ai-navigator-ai7-runtime.mjs`;
- accepted grounding corpus: `data/ai-index-accepted/ai5/chunks.json`;
- Wrangler: `4.118.0`;
- named Cloudflare environment: `ai7-full-canary`.

The config deliberately has no `route`/`routes`, disables top-level `workers_dev`, and enables a `workers.dev` endpoint only inside the named FULL canary environment. The named environment requires both `AI_MODE=full` and `AI_ANSWER_ENABLED=true`; the canonical Worker still fails closed on `/v1/answer` unless the answer-specific gate is explicitly enabled. The environment declares only the `OPENROUTER_API_KEY` secret name; no credential value belongs in Git.

AI-7 grounds answers from the exact repository-owned accepted AI-5 corpus that backs the accepted production SEARCH index. The pinned `chunks.json` currently contains 327 chunks and is 490,477 bytes. Wrangler bundles that static import into the isolated AI-7 Worker; the FULL answer path therefore does not perform a runtime network fetch back to the public site to obtain its grounding corpus. This removes the failed same-zone/public-network dependency while keeping retrieval and answer grounding on one accepted corpus version.

The canonical Worker still validates the complete corpus shape, stable chunk IDs, canonical source fields and content hashes before generation. Supplying the bundled corpus does not weaken the trust boundary: malformed bundled data fails `corpus_invalid` before any provider call. The generic Worker retains its existing network corpus fallback for runtimes that do not explicitly provide a canonical corpus; the accepted public SEARCH runtime is unchanged by this AI-7-only entrypoint.

## Preconditions

1. AI-7 implementation must be merged and repository-tested on the exact `master` SHA that will be accepted.
2. Public production must still be the accepted SEARCH baseline (`data/ai-navigator.json` remains `mode=search`).
3. Use a dedicated ordinary OpenRouter key for AI-7 only. Keep a lifetime hard limit `<= $2`, no automatic reset, positive remaining spend, and do not reuse AI-5/AI-6 credentials.
4. Authenticate Wrangler interactively to the intended Cloudflare account. Do not add a Cloudflare API token to ordinary repository CI for this canary.
5. Work from a clean checkout of the exact `master` SHA that will be recorded in AI-7 evidence.

## 1. Verify Wrangler and account

From the repository root:

```bash
npx --yes wrangler@4.118.0 --version
npx --yes wrangler@4.118.0 whoami
```

Stop if the authenticated account is not the intended Cloudflare account.

## 2. Initial provisioning: create the local secret file

For the first deployment only, create this local, gitignored file:

`infra/cloudflare/.dev.vars.ai7-full-canary`

It must contain exactly one key:

```dotenv
OPENROUTER_API_KEY=<dedicated-ai7-key>
```

Do not print, paste into chat/issues/PRs, or commit this file. `.dev.vars*`, `.env*`, and `.wrangler/` are repository-ignored.

If the isolated Worker already has the correct `OPENROUTER_API_KEY` secret binding, do not recreate the file just to redeploy code. Use the existing-secret redeploy procedure below.

## 3. Compile-only dry run

For initial provisioning:

```bash
npx --yes wrangler@4.118.0 deploy \
  --config infra/cloudflare/wrangler.ai7-full-canary.jsonc \
  --env ai7-full-canary \
  --secrets-file infra/cloudflare/.dev.vars.ai7-full-canary \
  --dry-run \
  --outdir .wrangler/ai7-full-canary-dry-run
```

The dry run must succeed before live deployment. Inspect Wrangler's upload summary and stop if the bundle is unexpectedly large or the dedicated AI-7 entrypoint is not used. Do not weaken the explicit answer gate or corpus validation to force a pass.

## 4. Deploy the isolated FULL Worker

Initial provisioning:

```bash
npx --yes wrangler@4.118.0 deploy \
  --config infra/cloudflare/wrangler.ai7-full-canary.jsonc \
  --env ai7-full-canary \
  --secrets-file infra/cloudflare/.dev.vars.ai7-full-canary \
  --strict
```

Existing canary Worker with the correct stored secret binding:

```bash
npx --yes wrangler@4.118.0 deploy \
  --config infra/cloudflare/wrangler.ai7-full-canary.jsonc \
  --env ai7-full-canary \
  --strict
```

Expected deployment target name:

`trueruslan-ai-navigator-ai7-full-canary`

Record only the clean HTTPS `workers.dev` origin printed by Wrangler. Do not add a custom domain or production route.

**After any change to the AI-7 runtime or `wrangler.ai7-full-canary.jsonc`, redeploy this isolated Worker before rerunning the manual canary.** A repository merge alone does not change the already deployed Worker runtime.

## 5. Create the protected GitHub Environment

Create protected GitHub Environment `ai7-full-canary` and add exactly these environment secrets:

- `AI7_FULL_WORKER_BASE_URL` — clean isolated `https://...workers.dev` origin, without path/query/fragment;
- `OPENROUTER_AI7_API_KEY` — the same dedicated hard-capped AI-7 key used by the isolated Worker.

Do not reuse AI-5/AI-6 keys. Ordinary Build, Pages, CodeQL and Production Live workflows remain provider-secret-free.

## 6. Remove the local key copy

After initial provisioning and GitHub Environment setup:

```bash
rm -f infra/cloudflare/.dev.vars.ai7-full-canary
```

Verify the working tree contains no secret material before proceeding.

## 7. Execute AI-7 acceptance

From GitHub Actions, run **AI Navigator FULL Canary** on `master` with:

- `confirm_full_canary=true`.

The manual workflow is the authoritative canary gate. It must verify the exact merged `master` SHA, public SEARCH invariants, isolated FULL runtime/CORS behavior, grounded sufficient and insufficient-evidence answer cases, bounded provider accounting/latency, sanitized evidence, and the unchanged public answer-disabled baseline.

A successful isolated Worker deployment is **not** AI-7 acceptance. A successful AI-7 canary is also **not** public FULL activation. The canary must finish with a KEEP / DOWNGRADE / REMOVE verdict; any later public FULL activation is a separate reversible change with its own production acceptance.

## Rollback / cleanup

Public production remains SEARCH throughout the canary. To remove the isolated FULL Worker after a failed canary, after REMOVE/DOWNGRADE, or once accepted evidence is retained:

```bash
npx --yes wrangler@4.118.0 delete \
  --config infra/cloudflare/wrangler.ai7-full-canary.jsonc \
  --env ai7-full-canary
```

Then revoke the dedicated AI-7 OpenRouter key when it is no longer needed. If a failure may involve credential exposure, revoke the key immediately before further diagnosis.

The accepted public SEARCH Worker must continue to return `/v1/answer -> 503 feature_disabled` unless a later, separately reviewed production FULL activation is explicitly accepted.
