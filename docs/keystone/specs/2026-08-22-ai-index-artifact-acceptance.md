# AI index artifact acceptance

Status: implementation slice for repository-owned AI index maintenance.

## Purpose

Separate real-provider generation from durable repository acceptance. A provider maintenance artifact is evidence only until an explicit, secret-free acceptance step binds it to the exact owner-authored same-repository PR head and verifies its immutable identity.

## Security boundary

The acceptance workflow may wake only from a completed ordinary `Build` run. The predecessor run is an untrusted signal, not authority. The acceptance job must independently resolve the current PR, require an exact operator command, verify the maintenance run and artifact through GitHub APIs, reject stale or cross-repository candidates, verify the downloaded ZIP SHA-256, inspect only the bounded expected artifact files, and validate provider/offline provenance before writing.

The acceptance workflow must not receive or reference provider credentials. It must not execute candidate scripts or workflow code. The only repository mutation allowed is replacing the three reviewed files under `data/ai-index-accepted/ai5/` on the exact same-repository PR branch. A non-fast-forward branch movement must fail rather than overwrite newer work.

## Explicit command

The PR body first line is the operator acceptance boundary:

`/accept-ai-index <candidate-sha> <maintenance-run-id> <artifact-id> <artifact-sha256> CONFIRM_AI_INDEX_ARTIFACT_ACCEPTANCE`

All identifiers must be exact and independently rechecked.

## Non-goals

This workflow does not call an embedding provider, alter public AI mode, accept product outcomes, deploy production, or make SEO/measurement claims.
