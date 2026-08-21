# AI index artifact acceptance

Status: implementation slice for repository-owned AI index maintenance.

## Purpose

Separate real-provider generation from durable repository acceptance. A provider maintenance artifact is evidence only until an explicit, secret-free acceptance step binds it to the exact owner-authored same-repository PR head and verifies its immutable identity.

## Security boundary

The acceptance workflow may wake only from a completed ordinary `Build` run. The predecessor run is a wake-up signal, not authority. A read-only gate independently resolves exactly one open owner-authored same-repository PR from the Build head branch, binds it to the exact current head SHA and `master` base, and treats missing, malformed or stale acceptance commands as a successful no-op rather than a failing repository check.

Only an explicitly authorized candidate may enter the write-capable job. That job has no provider credential or environment, does not checkout or execute candidate code, and independently verifies the trusted maintenance workflow identity, successful gate/provider jobs, artifact ownership, retention state, compressed-size bound, exact SHA-256, exact five-member archive allowlist, uncompressed-size bound, path/symlink safety, provider accounting and provider-free offline verification evidence.

Immediately before repository writes, the workflow re-fetches the PR and requires the operator command, head SHA, branch and repository authority to remain unchanged. It constructs one Git tree over the candidate parent containing exactly four reviewed updates: the three files under `data/ai-index-accepted/ai5/` plus `scripts/ai-index-restore.js` with the corresponding byte-exact SHA-256 map. The branch ref is then advanced with `force:false`; any head/ref movement or command revocation fails closed.

## Explicit command

The PR body first line is the operator acceptance boundary:

`/accept-ai-index <candidate-sha> <maintenance-run-id> <artifact-id> <artifact-sha256> CONFIRM_AI_INDEX_ARTIFACT_ACCEPTANCE`

All identifiers must be exact and independently rechecked. After an acceptance commit advances the branch, the old command is intentionally stale and subsequent ordinary Builds remain non-failing/no-op until a new exact command is supplied.

## Non-goals

This workflow does not call an embedding provider, alter public AI mode, accept product outcomes, deploy production, or make SEO/measurement claims.
