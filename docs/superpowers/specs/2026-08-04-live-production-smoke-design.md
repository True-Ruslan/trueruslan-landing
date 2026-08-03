# Live Production Smoke — Design

## Goal

Create a read-only production gate that proves the deployed custom-domain site independently from PR-generated artifacts.

## Trigger model

- every push to `master`;
- daily schedule;
- manual dispatch;
- path-scoped pull requests for the workflow/script/test themselves.

Push runs must wait until the GitHub Pages latest build reports the pushed `GITHUB_SHA` as built. Pull-request, scheduled and manual runs inspect the latest built Pages commit without claiming that the caller SHA is deployed.

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
- the Pages build commit/status resolved by the workflow.

## Permissions and safety

- `contents: read` and `pages: read` only;
- no deployment, issue, content, lockfile, git or DNS mutation;
- no secrets beyond the standard GitHub token for Pages build metadata;
- live-production evidence remains separate from repository Build/CodeQL/Dependency Review.

## Failure policy

- On push, timeout if Pages never reaches the exact pushed SHA;
- on PR/schedule/manual, record the latest built Pages SHA and test that deployment;
- search must be exercised through the actual browser UI, not inferred from query-string extraction;
- transient third-party beacon request failures are recorded, while absence/duplication of the beacon element fails the contract.
