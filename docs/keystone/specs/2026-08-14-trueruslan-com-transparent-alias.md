# trueruslan.com transparent alias

> Status: **PREPARED / NOT LIVE**
>
> Prepared: 2026-08-14. This document describes repository readiness only. It does not claim that `trueruslan.com` is purchased, delegated to Cloudflare, serving traffic, indexed, or externally accepted.

## Decision

`trueruslan.ru` remains the single canonical public identity and the only GitHub Pages custom domain.

`trueruslan.com` and `www.trueruslan.com` are reserved as future transparent access aliases implemented at the Cloudflare edge. A visitor using the `.com` hostname should remain on that hostname while Cloudflare fetches the corresponding canonical `.ru` resource server-side.

This is not a second deployment and not a second SEO identity.

## Non-negotiable boundaries

- Do not change the GitHub Pages custom domain from `trueruslan.ru`.
- Do not add `.com` canonical, hreflang, OpenGraph, Sitemap or Atom identities.
- Do not rewrite canonical HTML content at the proxy layer.
- Do not introduce an application runtime or origin API for core content.
- Do not allow the Worker to proxy arbitrary hosts or arbitrary HTTP methods.
- Do not forward browser `Cookie` or `Authorization` headers from `.com` to the canonical `.ru` origin.
- Do not deploy, bind, publish or configure Cloudflare from repository CI without an explicit operator action.
- Do not claim search/indexing equivalence from repository readiness.

## Prepared repository components

### Edge adapter

`infra/cloudflare/trueruslan-com-worker.mjs`

The Worker contract is deliberately narrow:

1. accept only `trueruslan.com` and `www.trueruslan.com`;
2. accept only `GET` and `HEAD`;
3. map the incoming path and query to the same path and query on `https://trueruslan.ru`;
4. use manual redirect handling;
5. rewrite only canonical `.ru` redirect destinations back to the incoming alias hostname;
6. leave third-party redirects untouched;
7. return the upstream body and metadata without HTML rewriting;
8. strip browser credentials before the cross-origin upstream request.

The fixed upstream and fixed alias allowlist make this a site-specific adapter rather than an open reverse proxy.

### Link policy

The build-time and browser-runtime link policies treat the future `.com` hostnames as same-site navigation targets. Relative links already inherit the current browser origin. Absolute same-site anchor URLs are normalized to root-relative path/query/fragment navigation at build time, and the runtime applies the same normalization to dynamically introduced anchors before interaction. This keeps browser navigation on the hostname the visitor entered without rewriting canonical metadata or proxying a second SEO identity.

The generated-site custom-domain gate remains fail-closed: any absolute same-site `<a>` URL that survives normalization is rejected because it would escape the current alias hostname.

Canonical, hreflang, OpenGraph, Sitemap and Atom identities remain absolute `.ru` URLs and are outside the anchor-normalization contract.

### Tests

`scripts/trueruslan-com-alias.test.js` and the existing link-policy runtime tests cover:

- `.com` and `www` same-site classification;
- build-time host-preserving normalization of absolute same-site anchors;
- runtime host-preserving normalization for dynamically introduced anchors;
- path/query/fragment preservation through navigation normalization;
- canonical/hreflang `.ru` preservation;
- path/query preservation through the Worker;
- GET/HEAD behavior;
- unknown-host and unsupported-method fail-closed behavior;
- credential stripping;
- manual upstream redirects;
- `.ru` redirect rewriting back to the incoming alias;
- preservation of third-party redirects;
- preservation of canonical `.ru` HTML content.

The tests are part of the existing `node --test scripts/*.test.js` suite; no new runtime or test dependency is required.

## Activation prerequisites

These are intentionally **not** performed by this repository-readiness change:

1. purchase/control `trueruslan.com`;
2. add the domain to the intended Cloudflare account;
3. configure Cloudflare DNS for `trueruslan.com` and `www.trueruslan.com` so requests reach the Worker;
4. deploy the prepared Worker and bind both alias hostnames;
5. confirm Cloudflare-managed HTTPS is active for both aliases;
6. perform production smoke verification before declaring the alias live.

Do not add a `wrangler` deployment configuration until the real Cloudflare account/domain binding is available and the operator is ready to activate it. This avoids committing guessed account- or route-specific deployment state.

## Required activation smoke matrix

The alias is not accepted until all of the following are verified against the real domain:

| Check | Required result |
|---|---|
| `https://trueruslan.com/` | 2xx content, browser hostname remains `.com` |
| representative nested RU route | same path on `.com`, no escape to `.ru` |
| representative nested EN route | same path on `.com`, no escape to `.ru` |
| query string | preserved through proxy |
| slash/clean-URL redirect | final hostname remains incoming `.com`/`www` alias |
| internal relative navigation | remains on current alias hostname |
| absolute same-site navigation | normalized to host-preserving root-relative navigation |
| third-party link | existing external-link policy preserved |
| canonical link | remains `https://trueruslan.ru/...` |
| hreflang / OpenGraph / Sitemap / Atom | remain canonical `.ru` identities |
| `https://trueruslan.ru/...` | existing GitHub Pages behavior unchanged |
| unsupported method | fail closed with 405 |
| unknown host | fail closed with 421 |

After the real alias is enabled, production verification should gain an explicit `.com` alias smoke gate. Until then, CI verifies only the repository-side adapter contract with synthetic Requests.

## SEO and measurement semantics

The `.com` alias is an alternative access hostname only. `trueruslan.ru` remains the source of canonical URLs and the identity used by existing search/discovery artifacts.

A working `.com` proxy does not by itself justify:

- adding a second Sitemap;
- duplicating Search Console/Yandex Webmaster evidence;
- changing canonical or hreflang;
- changing metadata/copy/internal links;
- resetting the clean-URL observation clock;
- claiming traffic, ranking or indexing impact.

Any future change to those boundaries requires a separate evidence-backed decision.

## Acceptance states

### Repository readiness

May become **DONE** when the Worker, link-policy integration, tests and CI are green in the repository.

### Cloudflare activation

Remains **NOT LIVE** until the domain exists, Cloudflare is configured and the real alias smoke matrix passes.

### External/search acceptance

Remains separate from both repository readiness and Cloudflare activation.
