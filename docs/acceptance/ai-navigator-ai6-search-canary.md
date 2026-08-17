# AI Navigator AI-6 — SEARCH canary acceptance

Status: **IMPLEMENTATION IN PROGRESS — PUBLIC AI OFF**

AI-6 is a bounded, reversible SEARCH-only runtime canary. It is not a public product launch and it does not authorize AI-7/FULL.

## Accepted prerequisite

AI-5 real provider/index acceptance is already accepted:

- source commit: `f02cfff534ca5a1e251981827a0b886a6c5ec112`;
- workflow run: `32016231526`;
- artifact ID: `9283608793`;
- artifact SHA-256: `71260072c273588c4b8a4ab53180b6dfc5c39be8612aee21f91721c7d2919e1f`;
- corpus digest: `sha256:1249ed898193d1a05bda632b1328a860909887a1700092ba38e612ac7e6ac17a`;
- document embeddings digest: `sha256:aaf2c7ba86a53f0ff040e63c2c75decbf538a84d6c54c1da0e44f124b199510a`;
- benchmark digest: `sha256:879ceffdfc7845dd7c558f9e308d53f981001ef29d804fd86b4112c22358a4ed`;
- benchmark query embeddings digest: `sha256:4490e074dbaefcfb2e58bacfc9af7655a1a2b342832e805f83126922a7f075ea`;
- accepted Recall@5: `0.95`;
- exact-term Recall@5: `1.0`;
- paraphrase Recall@5: `1.0`;
- selected weights: semantic `0.65`, lexical `0.20`, title `0.10`, language `0.05`.

The AI-6 workflow restores this exact artifact by ID and verifies the archive SHA-256 before use. It must not silently rebuild a different index.

## Runtime boundary

The canary Worker must use `infra/cloudflare/ai-navigator-runtime.mjs` as its module entrypoint.

Required Worker variables/secrets:

- `AI_ENABLED=true` — global kill switch is deliberately opened only for the isolated canary Worker;
- `AI_MODE=search` — `/v1/embed` is allowed, `/v1/answer` is blocked before corpus/provider access;
- `AI_ALLOWED_ORIGIN=https://trueruslan.ru`;
- `AI_CORPUS_ORIGIN=https://trueruslan.ru`;
- `AI_EMBEDDING_MODEL=openai/text-embedding-3-small`;
- `AI_EMBEDDING_DIMENSIONS=512`;
- `AI_ANSWER_MODEL=google/gemini-2.5-flash-lite` may remain configured for future FULL testing, but SEARCH mode must make it unreachable;
- `OPENROUTER_API_KEY` — a dedicated AI-6 runtime key, not the AI-5 acceptance key.

The canary Worker must be isolated and unlinked: no production custom route, no value written to `data/ai-navigator.json`, and no public UI activation.

## Candidate and rollback evidence

AI-6 must prove both sides of the reversible configuration boundary without changing the public file:

- candidate SEARCH config — the current public config with `mode=search`, the isolated Worker origin, and the accepted benchmark-selected hybrid weights (`0.65 / 0.20 / 0.10 / 0.05`);
- rollback OFF config — the exact current public `data/ai-navigator.json` with `mode=off`, `workerBaseUrl=""`, and `hybridWeights=null`.

The candidate is passed through the same `validateAiConfig` contract used by repository tooling. This matters because enabled SEARCH mode is invalid when `hybridWeights` is `null`; AI-6 must not retain evidence for a candidate that the product itself could not load.

`node scripts/ai6-config-evidence.js --output-dir quality-artifacts` generates three uploadable evidence files:

- `ai6-config-pair-evidence.json` — candidate/rollback config digests, validated candidate weights, and rollback-baseline match;
- `ai6-candidate-search-config.json` — sanitized, validated SEARCH candidate metadata containing the real candidate-config digest, accepted hybrid weights, and only a SHA-256 digest of the isolated Worker origin;
- `ai6-rollback-off-config.json` — the exact safe OFF rollback config plus its canonical digest.

The raw staging Worker URL is never written to uploadable evidence. The complete candidate config exists only in memory long enough to validate it and derive its deterministic canonical SHA-256 digest. The rollback config digest must exactly equal the canonical digest of the public OFF baseline, and the workflow must prove `data/ai-navigator.json` was not modified.

## Dedicated key policy

Use an ordinary OpenRouter API key dedicated to AI-6 only.

Required policy:

- non-management and non-provisioning key;
- lifetime hard limit, no automatic reset;
- configured limit `<= $2`;
- remaining spend must be positive;
- the live canary itself is rejected if observed usage delta exceeds `$0.01`;
- no automatic retries.

Do not reuse or expose the AI-5 credential. Do not paste either key into issues, PRs, chat, logs, repository files or workflow inputs.

## GitHub Environment

Create/use protected environment `ai6-search-canary` with exactly these runtime secrets:

- `AI6_SEARCH_WORKER_BASE_URL` — clean HTTPS origin of the isolated Worker, without path/query/fragment;
- `OPENROUTER_AI6_API_KEY` — the same dedicated hard-capped key configured in that isolated Worker.

Ordinary Build, Pages, CodeQL and Production Live workflows remain provider-secret-free.

## Manual execution

After the implementation PR is merged, run **AI Navigator SEARCH Canary** from `master` with:

- `confirm_search_canary=true`.

The workflow rejects non-`master` refs and runs no live calls unless the explicit boolean confirmation is true.

## What the workflow proves

Before any live Worker request it must:

1. prove public `data/ai-navigator.json` is still `mode=off` with `workerBaseUrl=""`;
2. download AI-5 artifact `9283608793`;
3. verify artifact SHA-256 `71260072c273588c4b8a4ab53180b6dfc5c39be8612aee21f91721c7d2919e1f`;
4. run `ai-index-verify` against the restored static index;
5. run the unchanged full semantic benchmark against that index;
6. derive and validate the candidate SEARCH config with the accepted `0.65 / 0.20 / 0.10 / 0.05` weights plus the exact rollback OFF config, then retain sanitized deterministic digests without mutating public config.

The live bounded canary then verifies:

1. `/v1/embed` CORS preflight returns the exact allowed origin and POST/content-type contract;
2. a foreign Origin is rejected with `403 origin_forbidden` before provider access;
3. `/v1/answer` returns `503 feature_disabled` in SEARCH mode;
4. exactly three reviewed query-embedding probes are sent through the Worker:
   - `ru-exact-ai-npc`;
   - `ru-paraphrase-production-proof`;
   - `en-platform`;
5. every live embedding reports the accepted model and `512` dimensions;
6. every live embedding has cosine similarity `>= 0.999` to its accepted AI-5 benchmark-query embedding, proving runtime query-space compatibility with the accepted static index;
7. OpenRouter key policy is still hard-capped and unchanged before/after the probe;
8. observed run spend delta is `<= $0.01`;
9. public AI configuration remains untouched.

Three probes deliberately replace the original one-probe sketch: the bounded set covers the known Latin-only RU technical-language edge, a localized RU paraphrase, and an EN paraphrase while retaining a fixed request count, no retries, a lifetime `$2` key cap, and the `$0.01` successful-run evidence gate.

## Acceptance gate

AI-6 may be marked **ACCEPTED** only when all of the following are true:

- implementation PR merged with required checks green;
- manual SEARCH canary workflow is `SUCCESS` on the exact merged `master` SHA;
- exact AI-5 artifact/index verification passes;
- semantic Recall@5 remains `>= 0.90` with exact-term lexical no-regression; thresholds and candidate weights are not weakened to force a pass;
- candidate SEARCH config passes `validateAiConfig` with the accepted hybrid weights;
- candidate SEARCH config digest, candidate Worker-origin digest and exact rollback OFF config digest are retained in sanitized evidence;
- rollback config digest exactly matches the public OFF baseline and the public config remains unchanged;
- preflight/origin/runtime-mode checks pass;
- three live embeddings pass model/dimension/reference-space checks;
- `/v1/answer` remains disabled;
- key policy/spend checks pass;
- evidence artifact is retained and its run/artifact IDs and digest are recorded here in a follow-up evidence commit;
- `data/ai-navigator.json` still says `off` with an empty Worker URL.

A green repository build alone is **not** AI-6 acceptance. A successful Worker deployment alone is **not** AI-6 acceptance. AI-6 remains unaccepted until the live canary evidence is recorded.

## Failure / rollback

On any failure:

1. keep or restore the exact OFF rollback config recorded in `ai6-rollback-off-config.json`; public production should already be on that baseline because the canary never writes the SEARCH candidate to `data/ai-navigator.json`;
2. do not lower quality, similarity, security or spend gates;
3. disable/delete the isolated Worker or set `AI_ENABLED=false`;
4. revoke the dedicated AI-6 key if the failure may involve credential/runtime exposure;
5. diagnose from sanitized workflow evidence only;
6. rerun only after a corrective code/config change has its own green repository gates.

After successful AI-6 acceptance, the isolated canary Worker/key may be disabled or revoked. AI-7/FULL requires a separate explicit implementation and acceptance stage.
