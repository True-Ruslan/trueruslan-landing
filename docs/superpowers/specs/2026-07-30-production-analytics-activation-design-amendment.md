# P2.2a Production analytics activation — design amendment

Date: 2026-07-30

This amendment records two final scope clarifications discovered during implementation review. It is authoritative where it conflicts with the original design or implementation plan.

## 1. Configuration scope is repository-only

`TR_CLOUDFLARE_WEB_ANALYTICS_TOKEN` must be configured as a GitHub Actions **repository variable**.

The earlier design wording allowed either repository or `github-pages` environment scope. Final implementation intentionally uses repository scope because both of these workflows must read the same value:

- `Deploy static content to Pages`;
- scheduled/manual `External health`.

The health job is not bound to the `github-pages` environment. Binding a read-only scheduled monitor to the deployment environment would create unnecessary environment/deployment coupling and could introduce protection-rule approval requirements.

Therefore:

- repository variable: supported and documented;
- environment-only variable: unsupported for the complete deployment + monitoring contract;
- conflicting repository/environment values: forbidden.

## 2. Artifact disclosure boundary

The public Cloudflare Web Analytics site token must not appear in:

- committed repository files;
- `analytics-deployment-contract.json`;
- `production-smoke-report.json`;
- external-health reports;
- PR quality evidence artifacts;
- logs except the GitHub Actions `add-mask` command used before ordinary output.

An **enabled GitHub Pages deployment artifact necessarily contains the public site token inside generated HTML**, because that is how the manual Cloudflare beacon identifies the site. The deployed HTML is the intended public disclosure boundary.

Therefore, any earlier wording that said the token must not appear in “uploaded artifacts” means **diagnostic/report artifacts**, not the Pages site artifact uploaded by `actions/upload-pages-artifact`.

This does not change the privacy model:

- the site token is not an account/API credential;
- no Cloudflare API credential is stored;
- no custom events, cookies, persistent identifiers, fingerprinting, session replay or cross-site tracking are introduced;
- reports and verification output remain token-free;
- repository readiness, deployed beacon state and observed telemetry remain separate facts.
