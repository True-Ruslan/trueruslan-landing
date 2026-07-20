# Quality & Portfolio Upgrade — Completed Implementation Record

**Goal:** Prevent functional/visual regressions before merge and upgrade the site from a styled documentation site into a production-grade engineering portfolio.

## Final architecture

The implementation ended with a deliberate split:

- **Standalone root homepage** — lightweight static HTML rendered from `templates/index.html`; no Diplodoc/React vendor bundle on the landing page.
- **Diplodoc knowledge pages** — Markdown content, navigation, local search, case studies, bibliography and web-CV.
- **Post-processing** — assets, local-search resource normalization, standalone homepage rendering, sitemap/robots and JSON-LD.
- **Quality pipeline** — generated-site integrity, real-browser smoke, Axe, Lighthouse, generated-search smoke and versioned perceptual visual regression.

A global Diplodoc `--static-content` experiment was evaluated and rejected because the current viewer produced unstable React hydration mismatches. The final architecture achieves fast first render on the high-traffic root page without forcing incompatible hydration semantics onto internal Diplodoc pages.

## Tooling

- Node.js 24
- Diplodoc
- parse5 / glob
- GitHub Actions
- Playwright 1.61.1 (ephemeral CI)
- @axe-core/playwright 4.12.1 (ephemeral CI)
- Lighthouse 13.4.0 (ephemeral CI)
- pngjs 7.0.0 (ephemeral CI)

No browser-quality package was added to the production dependency graph.

## Completed work

### 1. Generated-site integrity — completed

- [x] Added tests for nested links, missing assets, fragments/queries, external URLs, PDFs/iframes and HTML `<base href>` semantics.
- [x] Added `scripts/site-integrity.js` and `npm run check:site`.
- [x] Integrated integrity checking into PR, GitHub Pages and Docker workflows.
- [x] Checker validates the final `docs-html`, not source assumptions.
- [x] The gate discovered a real Diplodoc local-search resource-path defect.
- [x] Added deterministic local-search post-processing rather than whitelisting broken paths.

### 2. Browser / accessibility / performance — completed

- [x] Pinned quality tooling installed ephemerally under `.quality-tools`.
- [x] Browser smoke covers homepage, projects and resume in desktop/mobile viewports.
- [x] Checks HTTP failures, page errors, custom visual initialization and horizontal overflow.
- [x] Resume PDF is verified end-to-end as a successful `application/pdf` response.
- [x] Axe blocks serious/critical accessibility violations.
- [x] Local-search page has its own Chromium smoke test.
- [x] Lighthouse budgets enforced: Performance ≥ 85, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95.
- [x] Screenshots and JSON/log evidence uploaded as CI artifacts.

### 3. Accessibility hardening — completed

- [x] Runtime repair removes hidden generated heading anchors from keyboard tab order after Diplodoc client mount.
- [x] Navigation landmarks receive accessible names where needed.
- [x] Navigation contrast improved.
- [x] Text links receive non-color visual distinction.
- [x] Resume iframe excluded only from axe internals while its HTTP/PDF behavior remains explicitly verified.

### 4. Performance architecture — completed

- [x] Replaced heavyweight root viewer page with a standalone static homepage.
- [x] Added lightweight SVG favicon instead of loading the large avatar as favicon.
- [x] Quality server models gzip transport for compressible assets.
- [x] Internal Diplodoc pages remain hydration-safe.
- [x] Progressive custom JS is deferred until after application hydration.
- [x] Verified Lighthouse run reached 100 / 100 / 100 / 100 on the standalone homepage before final documentation-only updates.

### 5. Visual regression — completed

- [x] Six versioned perceptual baselines: homepage/projects/resume × desktop/mobile.
- [x] CI compares geometry and sampled RGB fingerprint.
- [x] Significant visual drift blocks PR.
- [x] Full screenshots and diff evidence remain available as artifacts.

### 6. Projects 2.0 — completed

- [x] Projects index converted into featured portfolio hub.
- [x] Added verified TaskHub case study.
- [x] Added verified MiniChess case study.
- [x] Added verified Godot Atmospheric Horror Template case study.
- [x] MarketDB remains intentionally high-level without proprietary architecture claims.
- [x] Case studies integrated into nested navigation/sitemap discovery.

### 7. Resume 2.0 — completed

- [x] Added profile, stack, experience areas, teaching/research and action links above PDF.
- [x] Added isolated `resume.css` with metrics/chips/timeline/panels.
- [x] PDF remains secondary download/verification surface.
- [x] PDF hydration is resilient to Diplodoc client-side content mount through MutationObserver-based idempotent repair.

### 8. SEO / deployment correctness — completed

- [x] JSON-LD aligned with Backend Engineer / Java Developer positioning.
- [x] GitHub Pages workflow uses repository Pages base URL for generated sitemap/structured data.
- [x] Standalone root includes canonical/OpenGraph metadata.
- [x] Search output normalized for root and project-subpath deployments.

## Release verification

- [x] PR #5 opened with quality gates documented.
- [x] Expanded CI with tests/build/integrity/browser/Axe/Lighthouse/search smoke/visual regression reached green before final documentation sync.
- [ ] Final head CI after documentation sync.
- [ ] Final `master...branch` scope review.
- [ ] Merge PR #5.
- [ ] Re-read merged PR/master state.
