# P2.2 Privacy-friendly analytics — design

Date: 2026-07-23

## Goal

Add minimal, privacy-preserving usage/performance analytics to TrueRuslan without changing the static-first product architecture or creating behavioural tracking.

The analytics layer exists only to answer a small set of product/content questions:

1. Which public routes are actually used?
2. How much traffic enters through RU vs `/en/` routes?
3. Which pages deserve more translation/content investment?
4. How do real visitors experience page-load/Core Web Vitals performance?

P2.2 explicitly does **not** attempt funnels, user journeys, attribution modelling, session replay or individual visitor tracking.

## Provider decision

### Selected: Cloudflare Web Analytics (manual beacon)

Reasons:

- free privacy-first hosted service;
- can be used without moving DNS or hosting to Cloudflare;
- no cookies/localStorage/sessionStorage/IndexedDB access;
- no persistent visitor identity or cross-site tracking;
- source IP is discarded at the nearest Cloudflare data center rather than stored in core databases/logs;
- supports page/path and real-user performance measurement;
- no custom events at the time of this design, which matches the deliberately narrow P2.2 event model;
- blocking by privacy/ad-blocking software is an acceptable and expected degradation mode.

### Rejected for this milestone: Plausible Cloud

Plausible is a strong privacy-friendly option with EU-hosted infrastructure and richer traffic/goals functionality, but it requires a paid hosted subscription for ongoing use. That extra capability and cost are unnecessary for the four decision questions above.

### Rejected for this milestone: self-hosted analytics

Self-hosted Plausible/Umami-class infrastructure offers more control but introduces a server, backups, upgrades, availability/security ownership and operational cost. That conflicts with YAGNI and the current static-first boundary.

## Architecture

### Core rule

**Analytics is an optional build-time-injected enhancement, never a runtime dependency.**

The generated site must remain byte-for-byte functional if analytics is:

- not configured;
- blocked by an extension/browser;
- unavailable on the network;
- rejected by CSP/network policy.

No application code may wait for analytics or branch product behavior based on analytics availability.

### Canonical configuration

Add `data/analytics.json` as the analytics policy/measurement contract.

It contains only stable public policy/configuration such as:

- provider id: `cloudflare-web-analytics`;
- measurement scope: `pageviews-and-rum`;
- custom events: disabled;
- cookies/persistent browser storage: forbidden;
- cross-site tracking: forbidden;
- session replay: forbidden;
- production activation mode: `token-required`.

The actual Cloudflare site token is **not required in repository data**. It is supplied at build time through `TR_CLOUDFLARE_WEB_ANALYTICS_TOKEN`.

The token is a public site identifier once embedded, not an application secret, but keeping it outside canonical repository policy allows preview/CI builds to remain deterministic and analytics-free by default.

### Build-time module

Add `scripts/analytics.js` with pure/deterministic primitives:

- validate analytics policy;
- validate optional token format conservatively;
- inject exactly one Cloudflare beacon into generated HTML when a token is supplied;
- inject nothing when the token is absent;
- remain idempotent;
- never inject custom event code;
- expose a deterministic summary for tests/build logs.

Injection uses Cloudflare's manual beacon pattern with:

- `type="module"`;
- `defer`;
- `src="https://static.cloudflareinsights.com/beacon.min.js"`;
- `data-cf-beacon` containing only the site token and `spa: false` because TrueRuslan is an MPA/static site;
- `data-tr-analytics="cloudflare-web-analytics"` for deterministic QA ownership.

### Build integration

Integrate the analytics postprocessor into the existing `scripts/copy-assets.js` orchestrator rather than adding a second build pipeline.

Order:

1. Diplodoc/static generation;
2. existing deterministic postprocessors;
3. page metadata/i18n/etc.;
4. analytics injection near the end of post-processing.

Analytics injection must cover generated public HTML consistently, including RU and EN routes, while avoiding duplicate snippets.

Search/generated utility HTML can be included only if it is part of normal public navigation; no second analytics subsystem exists for EN.

## Production activation

### Default behavior

Without `TR_CLOUDFLARE_WEB_ANALYTICS_TOKEN`:

- build succeeds;
- no analytics script is present;
- no request to Cloudflare can occur;
- CI/PR previews are analytics-free.

### With token

When the environment variable is present:

- the same normal build injects the beacon into public HTML;
- no separate runtime config fetch occurs;
- no token-specific source files are generated/committed.

If the current GitHub Pages deployment workflow does not expose repository variables to the build, P2.2 will wire the environment variable into that workflow. If deployment is not Actions-driven, the integration remains ready and a single explicit external activation step (configure the public site token in the production build environment) is documented.

No fake token is committed and no provider account/site identifier is invented.

## Measurement model

P2.2 deliberately measures only what Cloudflare Web Analytics already provides from ordinary page/RUM telemetry.

Allowed:

- page/path views;
- aggregate visitor/traffic trends exposed by provider;
- referrer/source information exposed by provider's privacy model;
- route distribution, including `/en/` vs root/RU paths;
- real-user performance/Core Web Vitals.

Forbidden in P2.2:

- custom click events;
- outbound-link tracking hooks;
- resume-download tracking;
- scroll-depth tracking;
- user IDs/account IDs;
- persistent identifiers;
- cookies/localStorage/sessionStorage/IndexedDB;
- fingerprinting;
- session replay;
- advertising audiences;
- cross-site tracking;
- query-string capture added by our code;
- analytics-driven product behavior.

If future product decisions require custom events, that requires a new design decision and explicit privacy review.

## RU/EN semantics

There is one analytics layer for the whole site.

Language is inferred from existing public route structure:

- `/en/**` = EN;
- root and existing `/landing/**` routes = RU/default.

No locale ID, language cookie or duplicate provider property is needed.

## Privacy and consent boundary

The implementation itself must make only claims that are technically true and tested locally:

- our code sets no analytics cookies/storage;
- our code generates no visitor IDs;
- our code sends no custom events;
- our code does not add session replay/fingerprinting;
- analytics is optional and non-blocking.

Legal/consent language must not overclaim universal jurisdictional conclusions. Provider documentation describes Cloudflare Web Analytics as privacy-first and not collecting/using personal data; the site should document the chosen measurement model without presenting legal advice.

No cookie banner is added by P2.2 because our selected integration does not set cookies or persistent browser storage. A future provider/configuration change must re-open this decision.

## Failure semantics

Analytics failures are ignored by product code.

Required behavior:

- blocked beacon: no page error/console error owned by TrueRuslan code;
- network failure: content/navigation/search remain unaffected;
- missing token: analytics absent, build/site still valid;
- malformed configured token: build fails early with a bounded configuration error rather than emitting broken markup;
- duplicate injection attempt: idempotent result with one beacon.

Browser diagnostics must treat third-party analytics request failures as expected only for the dedicated analytics scenario, not globally weaken existing same-origin/product diagnostics.

## Testing strategy

### Unit / contract tests

Add `scripts/analytics.test.js` covering:

- canonical policy validation;
- forbidden policy combinations;
- token absent => no injection;
- valid token => exactly one correct module/defer beacon;
- malformed token => bounded failure;
- idempotent reinjection;
- no custom events/storage/cookie hooks in generated snippet.

### Generated-site integrity

Add deterministic assertions that:

- tokenless CI build contains zero `data-tr-analytics` beacons;
- a fixture build with a fake valid token injects exactly one beacon per target HTML document;
- RU and EN pages use the same provider/token and no duplicate analytics system exists.

### Browser smoke

Add focused `scripts/analytics-browser-smoke.cjs` using the shared quality harness.

Run against a fixture/token-enabled generated site while intercepting/aborting Cloudflare requests so CI never emits real analytics.

Verify:

- pages render normally;
- no cookies are created by TrueRuslan analytics integration;
- no localStorage/sessionStorage mutation is introduced by our integration before/without third-party script execution;
- one analytics script exists where expected;
- RU and EN representative routes share one analytics configuration;
- blocked analytics network does not create product failures;
- no overflow/Axe regression from injected markup.

Existing full quality matrix remains unchanged in strictness.

## Security / supply-chain boundary

The Cloudflare beacon is third-party mutable JavaScript and manual embedding cannot safely use a stable SRI hash because the provider does not version-pin the beacon.

Therefore:

- analytics remains optional;
- it runs as an isolated third-party enhancement;
- no product state/trust depends on it;
- no credentials/secrets are exposed to it by TrueRuslan code;
- if a stricter CSP/SRI requirement becomes necessary later, reconsider provider/proxy/self-hosting rather than pretending SRI protection exists.

## Documentation

Add a short operator document covering:

- what is measured and why;
- what is explicitly not measured;
- how to create/configure a Cloudflare Web Analytics site token;
- how to set `TR_CLOUDFLARE_WEB_ANALYTICS_TOKEN` in the production build environment;
- how to verify generated markup;
- how to disable analytics instantly by removing the token;
- expected ad-blocker/network behavior.

No public-facing cookie banner or analytics settings UI is added in this milestone.

## Definition of Done

P2.2 is complete when:

- provider/design decision is documented;
- canonical analytics policy exists and is validated;
- build-time optional injection exists in the single current build pipeline;
- no token means zero analytics network capability;
- token-enabled fixture proves one beacon across RU/EN representative routes;
- no cookies/persistent IDs/custom events are introduced by TrueRuslan code;
- blocked analytics does not affect product behavior;
- dedicated analytics browser smoke is part of CI;
- no visual baseline/budget/security/trust assertions are weakened;
- exact feature head passes the complete configured quality matrix;
- durable `PROJECT_STATE`, `ROADMAP`, `CHANGELOG` are synchronized after merge.

## Explicit non-goals

- Google Analytics / advertising analytics;
- custom events/funnels/conversions;
- session replay;
- per-user analytics;
- A/B testing;
- analytics dashboard inside TrueRuslan;
- self-hosted analytics infrastructure;
- migration away from GitHub Pages;
- custom domain work;
- analytics-driven personalization.
