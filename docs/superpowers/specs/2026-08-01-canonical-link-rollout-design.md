# Canonical Domain Link Rollout Design

> Status: approved in conversation on 2026-08-01; written for durable review before implementation.

## Goal

Replace the remaining public legacy-site references with the canonical production origin `https://trueruslan.ru/`, expose that origin consistently from the primary project READMEs, and record the first verified Cloudflare telemetry for the custom hostname without changing runtime architecture or relative repository links.

## Current evidence

The owner-provided Cloudflare Web Analytics snapshot for `trueruslan.ru`, filtered to the last 24 hours and excluding bots, confirms real provider telemetry for the custom hostname:

- 7 visits;
- 8 page views;
- page load time: 656 ms;
- LCP: 100% Good in the observed sample;
- LCP P50: 648 ms;
- LCP P75: 744 ms;
- LCP P90: 829 ms;
- LCP P99: 829 ms.

The sample is sufficient to close the binary provider-telemetry observation gate. It is not sufficient for audience, route-priority, language, or performance product decisions; the existing 3–4 week observation window remains unchanged.

## Scope

### True-Ruslan/trueruslan-landing

1. Add an explicit production-site link to the repository README near the project introduction.
2. Replace the legacy `https://true-ruslan.github.io/trueruslan-landing/` website link embedded in `docs/assets/documents/cv.pdf` with `https://trueruslan.ru/` while preserving the document’s visible layout and other content.
3. Record the verified Cloudflare telemetry and the completed GitHub-side link rollout in:
   - `docs/PROJECT_STATE.md`;
   - `docs/ROADMAP.md`;
   - `docs/CHANGELOG.md`.
4. Preserve the legacy Pages origin only where it is intentionally part of deployment, rollback, compatibility, tests, or historical evidence.
5. Run the full configured repository CI and production-oriented regression matrix before merge.

### True-Ruslan/vlezet

1. Add a compact, explicit link to `https://trueruslan.ru/` near the README introduction, identified as the author’s main site/engineering portfolio.
2. Do not replace project-local relative links or introduce a case-study-specific route before that route exists.
3. Run all available CI checks before merge.
4. After merge, synchronize `docs/PROJECT_STATE.md`, `docs/ROADMAP.md`, and `docs/CHANGELOG.md` in a separate continuity PR when those files exist and the repository process requires it.

### True-Ruslan/villAIgence

1. Add a compact, explicit link to `https://trueruslan.ru/` near the README introduction, identified as the author’s main site/engineering portfolio.
2. Preserve upstream MCA attribution and all existing installation, compatibility, release, and security documentation.
3. Do not introduce a project-specific portfolio route before that route exists.
4. Run all available CI checks before merge.
5. After merge, synchronize `docs/PROJECT_STATE.md`, `docs/ROADMAP.md`, and `docs/CHANGELOG.md` in a separate continuity PR when those files exist and the repository process requires it.

## External surfaces outside current write access

The following remain manual because the current GitHub connector cannot modify them and no Habr/Telegram write connector is available:

- GitHub profile Website field;
- Habr profile and article author links;
- Telegram profile/channel descriptions;
- other professional profiles not stored in the repositories.

No repository should pretend those surfaces were updated. The final report must list them explicitly as remaining manual actions.

## Rollout strategy

Use separate, reviewable branches and pull requests per repository:

1. `trueruslan-landing` feature PR;
2. `vlezet` README PR;
3. `villAIgence` README PR;
4. required continuity PRs after each merged feature PR.

Merge only after the exact PR head has passed all available required CI checks. Use squash merge unless the repository’s existing policy requires another method.

## Validation

### Landing

- README contains exactly one intentional canonical production-site link near the introduction.
- The PDF link annotation opens `https://trueruslan.ru/`.
- The PDF remains readable and visually unchanged apart from link target metadata.
- Generated-site integrity remains green.
- Full browser, accessibility, cross-browser, metadata, search, visual, analytics, and custom-domain artifact gates remain green.
- No accidental replacement occurs in deployment contracts, rollback documentation, tests, or historical evidence.

### Vlezet and VillAIgence

- README renders correctly on GitHub.
- The new link is absolute HTTPS and points exactly to `https://trueruslan.ru/`.
- Existing relative links remain unchanged.
- All repository CI checks pass on the exact PR head.

## Non-goals

- Creating a new profile README repository.
- Changing GitHub profile metadata through unsupported APIs.
- Editing Habr or Telegram.
- Adding project-specific portfolio routes before their case studies exist.
- Migrating hosting, analytics provider, search, CMS, backend, or deployment architecture.
- Replacing legacy URLs that are intentionally required for rollback, compatibility, tests, or historical records.
- Drawing audience conclusions from the first 24-hour Cloudflare sample.

## Success criteria

The rollout is complete when:

1. the three repository READMEs expose `https://trueruslan.ru/`;
2. the downloadable CV points to the canonical domain;
3. the landing project durable state records verified custom-host telemetry;
4. every feature and continuity PR is merged only after green exact-head CI;
5. remaining unsupported external-profile edits are reported accurately as manual work.
