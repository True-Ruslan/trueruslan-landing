# AI Navigator AI-5 — real provider acceptance

Status: **operator-ready tooling / real-provider evidence pending**.

This runbook owns AI-5 only. It generates and evaluates a real OpenRouter embedding candidate while the public AI feature remains disabled.

## Non-negotiable boundary

During AI-5:

- `data/ai-navigator.json` stays `mode: "off"`;
- `workerBaseUrl` stays empty;
- ordinary Diplodoc search remains the production search owner;
- normal Build, Pages and Production Live receive no OpenRouter secret;
- no Worker is deployed and no visitor can spend tokens;
- the candidate index is an acceptance artifact until a later reviewed repository change explicitly commits it.

AI-5 success is not SEARCH or FULL activation.

## Dedicated OpenRouter key

Create one ordinary OpenRouter API key for this acceptance purpose only.

Recommended operator settings:

- name: `trueruslan-ai5-acceptance`;
- spending limit: **2 USD**;
- limit reset: **none / null** (lifetime hard cap);
- management key: no;
- provisioning key: no;
- optional expiry: short-lived if the dashboard offers it.

Repository enforcement is intentionally slightly wider than the recommendation: AI-5 rejects an uncapped key, any resetting limit, an exhausted key, and any hard limit above **5 USD**.

Never put the plaintext key into Git, issues, pull-request comments, workflow inputs, documentation, screenshots, or chat messages.

## GitHub environment secret

In `True-Ruslan/trueruslan-landing` create a GitHub Actions environment named exactly:

```text
ai5-provider-acceptance
```

Prefer restricting its deployment branches to `master`. The workflow job explicitly references this environment, so an environment secret is unavailable to unrelated jobs.

Inside that environment create a secret with this exact name:

```text
OPENROUTER_AI5_API_KEY
```

Do not create a repository-wide secret for AI-5. The manual workflow maps the environment secret to `OPENROUTER_API_KEY` for one online step only. The offline semantic benchmark runs after that step without the credential in its environment.

If a suitable independent reviewer exists, an environment approval rule may be added. Do not configure a protection rule that leaves a single-maintainer repository unable to approve its own explicit manual acceptance run.

## Manual acceptance run

Workflow: **AI Navigator Real Acceptance**.

Run it manually on `master` with:

```text
confirm_provider_calls = true
```

The online step must fail closed unless the current key reports:

- finite hard limit `<= 5 USD`;
- positive remaining limit;
- `limit_reset = null`;
- ordinary non-management/non-provisioning key.

The workflow then performs exactly two embedding stages:

1. current canonical document chunks with `input_type=search_document`;
2. the reviewed 50-query benchmark with `input_type=search_query`.

Each embedding stage has a one-request budget, an 8-second client timeout, no client-side automatic retry, pinned `openai/text-embedding-3-small`, 512 dimensions, and the existing ZDR/data-collection-deny provider policy.

After provider access leaves scope, the workflow runs the index verifier and semantic benchmark offline.

## Required evidence

The workflow artifact must contain:

- `data/ai-index/chunks.json`;
- `data/ai-index/index-meta.json`;
- `data/ai-index/embeddings.bin`;
- `data/ai-index/benchmark-query-cache/`;
- `quality-artifacts/ai5-provider-evidence.json`;
- `quality-artifacts/ai-index-verify.json`;
- `quality-artifacts/ai-semantic-benchmark.json`.

`ai5-provider-evidence.json` records only sanitized accounting:

- exact source commit;
- hard-limit policy and remaining USD allowance;
- before/after key usage and run USD delta;
- document/query request counts and latency;
- OpenRouter response prompt/total tokens and `cost` in provider credits;
- candidate corpus/vector/query-cache digests.

It must contain no API-key label, hash, Authorization header, plaintext key, raw provider error body, query history, or private content.

## Acceptance gate

AI-5 can advance only if all of the following hold:

- manual real-provider workflow: SUCCESS;
- offline candidate index verification: PASS;
- reviewed semantic benchmark: positive Recall@5 `>= 0.90`;
- exact-term lexical no-regression: PASS;
- all 10 insufficient-evidence cases remain `answerEligible=false`;
- a deterministic winning weight candidate exists;
- public AI mode remains OFF;
- normal exact-head Build, Dependency Review and CodeQL remain green.

If no candidate satisfies the benchmark, keep AI OFF and treat it as retrieval-quality evidence. Do not lower the threshold in the same change.

## After a successful run

Repository acceptance must record the exact workflow run, artifact digest, source SHA, corpus/index digests, benchmark result and measured winning weights. Only then may a separate AI-6 SEARCH canary be prepared.

The dedicated acceptance key may be revoked after the candidate is accepted. A later public Worker must use a separately reviewed runtime secret and cost policy rather than silently reusing the AI-5 acceptance credential.
