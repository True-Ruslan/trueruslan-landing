# AI Navigator AI-6 — isolated Worker provisioning

Status: **OPERATOR RUNBOOK — PUBLIC AI OFF**

This runbook provisions the isolated Cloudflare Worker required by the AI-6 SEARCH canary. It does not activate AI in `data/ai-navigator.json`, does not authorize FULL mode, and is not AI-6 acceptance by itself.

## Repository contract

Use only:

- config: `infra/cloudflare/wrangler.ai6-search-canary.jsonc`;
- entrypoint: `infra/cloudflare/ai-navigator-runtime.mjs`;
- Wrangler: `4.118.0`;
- named Cloudflare environment: `ai6-search-canary`.

The config deliberately has no `route`/`routes`, disables top-level `workers_dev`, and enables a `workers.dev` endpoint only inside the named SEARCH canary environment. The environment declares only the `OPENROUTER_API_KEY` secret name; no secret value belongs in Git.

## Preconditions

1. AI-6 implementation is already merged and repository-tested.
2. Use a dedicated ordinary OpenRouter key for AI-6 only. It must keep the AI-6 hard-spend policy from `ai-navigator-ai6-search-canary.md`: lifetime limit `<= $2`, no automatic reset, and positive remaining spend.
3. Authenticate Wrangler interactively to the intended Cloudflare account. Do not add a Cloudflare API token to this repository or to ordinary GitHub CI for this canary.
4. Work from a clean checkout of the exact `master` SHA that will be recorded in the canary evidence.

## 1. Verify Wrangler and account

From the repository root:

```bash
npx --yes wrangler@4.118.0 --version
npx --yes wrangler@4.118.0 whoami
```

Stop if the account is not the intended Cloudflare account.

## 2. Create the local secret file

Create this local, gitignored file:

`infra/cloudflare/.dev.vars.ai6-search-canary`

It must contain exactly one key:

```dotenv
OPENROUTER_API_KEY=<dedicated-ai6-key>
```

Do not print the file, paste it into chat/issues/PRs, or commit it. `.dev.vars*`, `.env*`, and `.wrangler/` are repository-ignored.

## 3. Compile-only dry run

```bash
npx --yes wrangler@4.118.0 deploy \
  --config infra/cloudflare/wrangler.ai6-search-canary.jsonc \
  --env ai6-search-canary \
  --secrets-file infra/cloudflare/.dev.vars.ai6-search-canary \
  --dry-run \
  --outdir .wrangler/ai6-search-canary-dry-run
```

The dry run must succeed before any live deployment. Do not weaken the config or remove `secrets.required` to force a pass.

## 4. Deploy the isolated SEARCH Worker

```bash
npx --yes wrangler@4.118.0 deploy \
  --config infra/cloudflare/wrangler.ai6-search-canary.jsonc \
  --env ai6-search-canary \
  --secrets-file infra/cloudflare/.dev.vars.ai6-search-canary \
  --strict
```

Expected deployment target name:

`trueruslan-ai-navigator-ai6-search-canary`

Record only the clean HTTPS `workers.dev` origin printed by Wrangler. Do not add a custom domain or production route.

## 5. Create the GitHub Environment

Create protected GitHub Environment `ai6-search-canary` and add exactly these environment secrets:

- `AI6_SEARCH_WORKER_BASE_URL` — the clean isolated `https://...workers.dev` origin, without path/query/fragment;
- `OPENROUTER_AI6_API_KEY` — the same dedicated hard-capped AI-6 key used by the isolated Worker.

Do not reuse `OPENROUTER_AI5_API_KEY`. Ordinary Build, Pages, CodeQL and Production Live workflows must remain provider-secret-free.

## 6. Remove the local key copy

After the Worker and GitHub Environment are configured:

```bash
rm -f infra/cloudflare/.dev.vars.ai6-search-canary
```

Verify the working tree contains no secret material before proceeding.

## 7. Execute AI-6 acceptance

From GitHub Actions, run **AI Navigator SEARCH Canary** on `master` with:

- `confirm_search_canary=true`.

The existing workflow performs the authoritative AI-5 artifact verification, benchmark gate, candidate/rollback evidence generation, CORS/runtime checks, three live embedding probes, answer-disable check, key-policy/spend checks, and proof that public config remains OFF.

A successful Worker deployment is **not** AI-6 acceptance. Mark AI-6 accepted only after the manual workflow succeeds on the exact merged `master` SHA and its sanitized evidence is recorded.

## Rollback / cleanup

Public production should already remain OFF. To remove the isolated Worker after a failed canary or after evidence is complete:

```bash
npx --yes wrangler@4.118.0 delete \
  --config infra/cloudflare/wrangler.ai6-search-canary.jsonc \
  --env ai6-search-canary
```

Then revoke the dedicated AI-6 OpenRouter key when it is no longer needed. If a failure may involve credential exposure, revoke the key immediately before further diagnosis.

AI-7/FULL remains a separate stage and is not authorized by this runbook.
