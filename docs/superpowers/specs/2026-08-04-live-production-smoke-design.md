# Live Production Smoke — Design

## Goal

Create a read-only production gate that proves the deployed custom-domain site independently from PR-generated artifacts.

## Trigger model

Primary deployment-aligned trigger:

- completed `Deploy static content to Pages` workflow on `master` through `workflow_run`;
- source SHA comes from `github.event.workflow_run.head_sha`;
- unsuccessful source workflow conclusion fails before browser verification.

Additional triggers:

- direct push to `master` as a bounded fallback;
- daily schedule;
- manual dispatch;
- path-scoped pull requests for the workflow/script/test themselves.

Exact-deployment runs (`push` and `workflow_run`) require a successful `github-pages` deployment for the expected SHA. Pull-request, scheduled and manual runs inspect the latest successful `github-pages` deployment without claiming that the caller SHA is deployed.

Deployment identity is resolved through the standard GitHub Deployments API rather than the Pages builds endpoint, which returns `404` for the repository's current Pages source configuration.

## Trigger reliability correction

The original implementation relied on direct push as the only exact-SHA post-merge trigger. After P2.5a merged:

- the workflow remained server-side `active`;
- a successful `github-pages` deployment existed for the exact squash;
- the direct push live run was not created within the expected trigger window.

The primary trigger was therefore moved to the completion of the Pages deployment workflow. Direct push remains a fallback, but deployment completion is the authoritative orchestration boundary.

The same merge that introduced `workflow_run` could not prove that event path because the listener was not active on the default branch before its source Pages run started. A subsequent deployment is the required activation-order validation.

## Live assertions

Using Playwright Chromium against `https://trueruslan.ru`:

1. apex homepage returns HTTP 200 and the expected portfolio title;
2. `www` Note URL resolves to the apex hostname;
3. persistence Note returns HTTP 200, expected H1/title, exact canonical and OpenGraph URLs;
4. page HTML contains no legacy `true-ruslan.github.io/trueruslan-landing` origin;
5. homepage contains exactly one Cloudflare Web Analytics beacon;
6. Atom feed returns XML and contains the persistence Note title and canonical URL;
7. live search UI accepts `persistence contract` and returns the exact Note route;
8. browser console/page/request failures are captured and fail only when they affect the tested first-party surfaces.

## Evidence

Upload for 30 days:

- normalized JSON summary;
- note and search screenshots;
- selected HTML/response metadata;
- the `github-pages` deployment SHA/status/id;
- trigger type and caller SHA;
- source Pages workflow run ID/conclusion for `workflow_run` events.

## Permissions and safety

- `contents: read`, `pages: read` and `deployments: read` only;
- no deployment, issue, content, lockfile, git or DNS mutation;
- no secrets beyond the standard GitHub token for deployment metadata;
- live-production evidence remains separate from repository Build/CodeQL/Dependency Review.

## Failure policy

- on exact-deployment triggers, timeout if a successful deployment never appears for the expected SHA;
- fail a `workflow_run` event when the source Pages workflow did not conclude successfully;
- on PR/schedule/manual, record the latest successful deployment SHA and test that deployment;
- search must be exercised through the actual browser UI, not inferred from query-string extraction;
- transient third-party beacon request failures are recorded, while absence/duplication of the beacon element fails the contract.
