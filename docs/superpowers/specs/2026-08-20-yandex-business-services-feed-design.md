# Yandex Business services feed — design

Date: 2026-08-20
Status: approved in chat for specification; implementation requires spec review
Branch: `feat/yandex-business-services-feed`

## 1. Problem

`trueruslan.ru` presents private engineering practice through `work-with-me`, but Yandex Business needs discrete product/service records when a YML feed is used as the automatic source for advertising materials. The current commercial model is intentionally estimate-first for custom engineering work, so publishing invented fixed prices for backend development, architecture, integrations, or AI work would be misleading.

The solution is to keep custom engineering work estimate-only and introduce a small catalog of truly standardized services with fixed scope and fixed price. Those services become first-class landing pages and the only entries exported to Yandex Business.

## 2. Goals

1. Add a clear public catalog of standardized services without weakening the existing estimate-first boundary for custom work.
2. Publish exactly three initial fixed-price services:
   - `Техническая консультация по backend-разработке — 60 минут` — 5,000 RUB.
   - `Наставничество по Java и Backend — 60 минут` — 4,000 RUB.
   - `Экспресс Code Review` — 7,500 RUB for one bounded review package.
3. Generate a valid YML feed at build time from one canonical structured source.
4. Make the feed available at the stable production URL `https://trueruslan.ru/yandex-business.yml`.
5. Fail CI when service data, landing pages, URLs, prices, categories, or YML output become inconsistent.
6. Keep YML freshness compatible with Yandex Market YML rules referenced by Yandex Business: the `<yml_catalog date>` timestamp must never become older than 10 days in production.
7. Preserve the site's static-first architecture, current navigation model, privacy boundaries, and existing production verification discipline.

## 3. Non-goals

- No fixed prices for custom backend development, architecture work, integrations, AI/LLM/MCP implementation, or broad technical audits.
- No checkout, online payment, cart, booking engine, CRM, or account system.
- No claim that a standardized session guarantees a business outcome, job offer, bug fix, or implementation completion.
- No bulk catalog. The initial feed contains three entries only.
- No duplicated hand-maintained price data in YML.
- No Yandex-specific client-side JavaScript.
- No automatic external publication beyond serving the feed from the existing site.

## 4. External contract

Yandex Business supports automatic loading of products and services from a YML feed URL. For a company price list, Yandex documents `category`, `categoryId`, `name`, `vendor`, `offer id`, `price`, and `currencyId` as required YML fields; price must be exact and non-zero. `description` is limited to 3,000 characters, `shortDescription` to 250, and `url` to 512 characters. Yandex Business directs YML markup questions to Yandex Market documentation.

The Yandex Market YML contract requires:

- XML declaration at byte zero;
- one `<yml_catalog>` root;
- a RFC 3339 `date` value with timezone;
- catalog data not older than 10 days;
- one `<shop>` with categories and offers.

The implementation will satisfy the stricter combined contract rather than relying on undocumented parser tolerance.

## 5. Canonical data model

Add `data/services.json` as the single hand-maintained structured source for machine-readable commercial fields.

Top-level fields:

```text
schemaVersion
updated
brand
providerName
siteUrl
currencyId
categories[]
services[]
```

The initial category registry is fixed to:

```text
1  IT-консультации
2  Наставничество
```

`technical-consultation-60` and `express-code-review` belong to category `1`; `java-backend-mentoring-60` belongs to category `2`.

Each service record contains:

```text
id                 stable ASCII SKU, <= 80 chars
slug               URL slug
name               public/Yandex title
categoryId         positive integer
categoryName       display category
price              positive integer RUB amount
currencyId         RUB
vendor             TrueRuslan
shortDescription   <= 250 chars
feedDescription    <= 3000 chars
durationMinutes    optional positive integer
yandexEnabled      boolean
page               canonical clean path beginning /services/
```

Validation rules:

- IDs and slugs are unique.
- `price` is an integer greater than zero.
- `currencyId` is exactly `RUB`.
- category IDs are unique positive integers and every service references an existing category.
- `vendor` is non-empty and normalized to `TrueRuslan` for the initial catalog.
- every enabled service has a local landing page and canonical `https://trueruslan.ru/...` URL.
- feed descriptions contain no phone number, email address, embedded URL, or personal-data payload prohibited by Yandex price-list rules.
- disabled/non-standard custom work never appears in the feed.

Markdown remains the canonical source for long-form human-facing copy. `services.json` owns only structured facts that must stay synchronized across build output and Yandex.

## 6. Initial catalog

### 6.1 Technical consultation

- Name: `Техническая консультация по backend-разработке — 60 минут`
- SKU: `technical-consultation-60`
- Category: `IT-консультации` (`1`)
- Price: 5,000 RUB
- Scope: one 60-minute remote consultation.
- Topics may include Java, Kotlin, Spring Boot, backend architecture, APIs, integration design, databases, Kafka, testing, CI/CD, or engineering use of AI/LLM tools.
- Deliverable: the session itself plus a concise verbal or written recap when useful; no implementation is implied.

### 6.2 Java / Backend mentoring

- Name: `Наставничество по Java и Backend — 60 минут`
- SKU: `java-backend-mentoring-60`
- Category: `Наставничество` (`2`)
- Price: 4,000 RUB
- Scope: one 60-minute remote mentoring session.
- Suitable for a knowledge-gap review, code/project discussion, interview preparation, learning plan, or focused technical topic.
- No promise of hiring, certification, promotion, or a specific interview result.

### 6.3 Express Code Review

- Name: `Экспресс Code Review`
- SKU: `express-code-review`
- Category: `IT-консультации` (`1`)
- Price: 7,500 RUB
- Scope: one PR/patch or equivalent bounded change set up to 800 changed source lines, excluding generated files, vendored code, lockfiles, and machine-generated artifacts.
- Review time budget: up to 90 minutes.
- Deliverable: prioritized written findings covering correctness, maintainability, tests, obvious reliability/security concerns, and high-value next actions.
- If the submitted scope exceeds the boundary, it is not silently reviewed at the same price; the customer is asked to narrow the scope or switch to estimate-first custom review.

These boundaries are public and must be repeated consistently on the landing pages.

## 7. Site information architecture

Add:

```text
docs/landing/services.md
docs/landing/services/technical-consultation.md
docs/landing/services/java-backend-mentoring.md
docs/landing/services/express-code-review.md
```

Public clean URLs:

```text
/services/
/services/technical-consultation/
/services/java-backend-mentoring/
/services/express-code-review/
```

`docs/toc.yaml` will place `Услуги` below `Работа со мной` as a child section. The global header keeps one `Работа со мной` entry; no extra top-level navigation item is added.

`docs/landing/work-with-me.md` will gain a short fixed-format section linking to `/services/` while retaining the existing statement that custom work is estimated only after understanding task boundaries.

Each service page must state: what is included, what is not included, fixed price, duration/scope, suitable scenarios, preparation expectations where relevant, and how to contact the provider through the site's existing contact path. It must not duplicate raw contact details inside feed descriptions.

## 8. Feed generation

Add a focused module `scripts/yandex-business-feed.js` with two responsibilities:

1. parse and validate `data/services.json`;
2. render deterministic XML apart from the required generation timestamp.

The generator writes `docs-html/yandex-business.yml` during the normal production build/post-processing stage.

Feed shape:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<yml_catalog date="RFC3339_WITH_TIMEZONE">
  <shop>
    <name>TrueRuslan</name>
    <company>Руслан Немыкин</company>
    <url>https://trueruslan.ru/</url>
    <currencies>
      <currency id="RUB" rate="1"/>
    </currencies>
    <categories>...</categories>
    <offers>...</offers>
  </shop>
</yml_catalog>
```

Each enabled service is emitted as an `<offer id="..." available="true">` with `name`, `vendor`, `url`, `price`, `currencyId`, `categoryId`, `shortDescription`, and `description`.

XML escaping is mandatory for all text nodes and attribute values. No string concatenation may bypass the escaping helper.

The feed timestamp is supplied explicitly to the renderer in tests. Production build captures one UTC build-start instant and renders it as RFC 3339 with `Z`, avoiding environment-dependent local timezone behavior while complying with the requirement to include timezone information.

## 9. Feed freshness and production lifecycle

A static feed whose `date` never changes can become invalid after 10 days. Therefore feed freshness is part of the production contract, not an optional optimization.

Production must regenerate and redeploy the same `master` content at least once every 7 days, even when source content has not changed. This leaves a safety margin below Yandex's 10-day limit.

Implementation rule:

- Prefer adding a weekly `schedule` trigger to the existing repository-owned GitHub Pages deployment workflow if that workflow is present and can run safely on `master`.
- If Pages deployment is GitHub-managed rather than repository-owned, add one dedicated repository workflow that checks out `master`, installs pinned project dependencies, restores the accepted AI index exactly as current production builds do, builds `docs-html`, runs site/feed integrity checks, uploads the same Pages artifact, and deploys it using GitHub's official Pages actions.
- The scheduled path must use the existing Pages concurrency group or an equivalent single-deployment group with `cancel-in-progress: false` so it cannot race a normal production deployment.
- The scheduled path must not commit generated timestamps back to the repository.
- A freshness deployment failure is visible as a failed GitHub Actions run; it must not fabricate a successful timestamp elsewhere.

The implementation plan will select the concrete workflow file after inspecting the current Pages configuration, but the observable product contract is fixed: production feed age remains below 10 days without source-code churn.

## 10. Build and validation integration

The existing static-first post-processing boundary remains the owner of generated public artifacts. Feed generation is invoked from the normal `copy-assets`/post-processing chain so local build, PR CI, Pages build, and scheduled freshness build all use the same code path.

Add the exact npm command `check:yandex-feed` and include it in the normal test/build gate.

Required checks:

- JSON schema/semantic validation.
- XML declaration begins at byte zero.
- XML is well-formed.
- root `date` parses as RFC 3339, is not in the future beyond trivial clock skew, and is no older than 10 days in production verification.
- exactly three enabled initial offers.
- all required Yandex Business fields exist.
- all prices are exact positive integers.
- all offer IDs and category IDs are unique.
- all service URLs use HTTPS, canonical host `trueruslan.ru`, and clean paths.
- every service URL maps to a generated page.
- feed title/description length bounds are enforced before rendering.
- XML output contains no email addresses, phone numbers, or raw links in descriptions.
- no estimate-only custom service leaks into YML.

## 11. Tests

Use TDD for implementation.

Unit tests cover:

- valid catalog parsing;
- duplicate IDs/slugs/category IDs;
- missing category references;
- zero/negative/non-integer prices;
- unsupported currency;
- description length boundaries;
- prohibited contact/link content;
- XML escaping for `&`, `<`, `>`, quotes, and Cyrillic text;
- stable offer ordering;
- explicit timestamp rendering.

Integration tests cover:

- full site build produces all four service pages;
- `/services/` links to all three entries;
- `work-with-me` links to the services catalog while preserving estimate-first wording;
- `docs-html/yandex-business.yml` exists and references generated canonical pages;
- clean-URL post-processing does not rewrite or break the feed URL;
- sitemap contains service pages but does not need to list the YML artifact;
- site integrity accepts the feed as a public non-HTML artifact.

Production smoke will verify `https://trueruslan.ru/yandex-business.yml` returns HTTP 200, contains the expected feed identity markers, has exactly three enabled offers, and has a fresh `date`.

## 12. Security, privacy, and reliability boundaries

- No secrets or API keys are needed to generate the feed.
- Feed content is derived only from reviewed repository data.
- No user input is parsed at runtime.
- No new client-side runtime dependency is introduced.
- No phone/email is embedded into YML descriptions.
- Prices are literal integers from the canonical registry; no locale parsing at render time.
- Generated XML is escaped centrally.
- Scheduled deployment uses least-privilege GitHub Pages permissions and pinned action SHAs consistent with repository policy.
- Existing AI/Search production boundaries are not modified by this feature.

## 13. Rollout and acceptance

Implementation is complete only when all of the following are true:

1. PR CI is green on the exact head SHA.
2. Generated service pages are readable on desktop/mobile and no-JS baseline.
3. `work-with-me` still distinguishes fixed-format services from estimate-first custom work.
4. The generated YML passes local structural/contract checks.
5. The merged Pages deployment succeeds.
6. Production smoke confirms all three service pages and the feed URL.
7. Production feed timestamp is fresh and the weekly refresh path is enabled.
8. The Yandex Business UI accepts the feed URL and reports three loaded positions; this final external acceptance is a separate operator step and must not be inferred from CI alone.

Repository implementation, CI acceptance, production deployment, and Yandex Business ingestion remain separate evidence states.

## 14. Documentation updates

After implementation evidence exists, update `docs/CHANGELOG.md` and the current project-state documentation with factual status only. Do not mark Yandex ingestion as accepted until the Yandex Business interface actually confirms the feed was loaded.
