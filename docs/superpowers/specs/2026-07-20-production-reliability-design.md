# Production Reliability Hardening — Design

## Scope

This phase strengthens the already-merged portfolio without changing its visual architecture or requiring a custom domain/paid hosting.

Included:

1. post-deploy smoke against the real GitHub Pages URL;
2. weekly external-link/endpoint health monitoring;
3. lightweight Firefox and WebKit browser sanity checks;
4. license/metadata cleanup;
5. deployment metadata consistency for the current GitHub Pages repository URL.

Deferred because they depend on a future domain/hosting decision:

- custom domain and canonical migration;
- hosted analytics provider;
- domain-specific email/brand configuration.

## Architecture

### 1. Production smoke after Pages deployment

The Pages workflow remains the owner of deployment. After successful deployment, a separate smoke step validates the actual public URL rather than trusting only the generated artifact.

Checks:

- root page returns 2xx and expected identity text;
- Projects and Resume pages return 2xx;
- CV PDF returns 2xx with `application/pdf`;
- critical CSS/JS/favicon assets return 2xx;
- a small Chromium scenario loads the public homepage and Resume without same-origin HTTP failures or browser page errors.

The production smoke must fail the deployment workflow when the deployed site is functionally broken.

### 2. Weekly external health workflow

A scheduled workflow checks external destinations that can fail independently of this repository:

- public GitHub repositories linked from the portfolio;
- MarketDB public page;
- Telegram, Habr, LinkedIn and other public profile URLs where deterministic HTTP checking is practical;
- public GitHub Pages root, projects, resume and PDF endpoints.

The checker follows redirects, uses a bounded timeout and classifies failures. Some providers intentionally return 401/403/429 to automation; these are treated as reachable when the response proves the endpoint exists. DNS/connectivity errors and 404/410/5xx are failures.

The workflow creates a durable artifact/report and fails on actionable broken endpoints. It does not auto-create duplicate GitHub issues in this phase to avoid noisy issue churn.

### 3. Cross-browser sanity

The full quality suite remains Chromium-based for speed. A small compatibility matrix runs only high-value smoke cases in Firefox and WebKit:

- homepage;
- Projects;
- Resume;
- no page errors;
- no same-origin request failures;
- no horizontal overflow;
- Resume PDF fallback/download link remains available.

This avoids tripling the full Lighthouse/Axe workload while still covering Firefox and Safari/WebKit-specific regressions.

### 4. Licensing cleanup

The repository currently has Apache-2.0 in `LICENSE` but npm metadata declares MIT. The final policy is:

- repository source code and build/test tooling: Apache-2.0;
- personal content (CV, photos, biographical/personal text): not licensed for reuse by the Apache license and remains copyright of the author unless explicitly stated otherwise;
- third-party assets remain under their own licenses/credits.

Implementation:

- set `package.json` license to `Apache-2.0`;
- add `CONTENT-LICENSE.md` clarifying the personal-content carve-out;
- update README licensing section;
- preserve the existing Apache-2.0 `LICENSE` file.

## Error handling

- all network checks use explicit timeouts;
- redirects are followed with a bounded redirect count;
- expected anti-bot responses are classified separately from broken endpoints;
- browser smoke writes diagnostic screenshots/logs on failure;
- scheduled health reports are uploaded as artifacts even when the workflow fails.

## Testing

- unit tests cover URL classification and health-result policy;
- workflow configuration is validated by existing repository tests where practical;
- PR CI runs cross-browser smoke on the built artifact;
- Pages deploy runs post-deploy smoke against the real production URL;
- weekly health workflow runs independently on schedule and manually via `workflow_dispatch`.

## Success criteria

- PR CI stays green with Chromium full suite plus Firefox/WebKit sanity;
- Pages deployment fails if public homepage/resume/PDF is actually broken;
- weekly health workflow can detect actionable 404/5xx/connectivity failures;
- license metadata is internally consistent;
- no custom domain or paid service is introduced.
