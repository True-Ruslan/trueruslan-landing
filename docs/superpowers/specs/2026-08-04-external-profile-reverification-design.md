# External Profile Reverification — Design

## Goal

Reconcile the distribution profile snapshot after deliberate owner edits, using only rendered public evidence.

## Measured state

Fresh public verification on 2026-08-04 shows:

- GitHub profile: canonical `https://trueruslan.ru/` backlink visible;
- Habr profile: canonical `https://trueruslan.ru` backlink visible;
- Telegram personal: canonical `https://trueruslan.ru` backlink visible;
- Telegram Blog: rendered public channel description still exposes `https://true-ruslan.github.io/trueruslan-landing/about.html`.

The resulting controlled snapshot is `3 verified / 1 stale / 0 unverified`.

## Boundaries

- Public rendered output is the authority for profile state.
- Owner-reported edits do not become `verified` until the public profile exposes the canonical backlink.
- Telegram Blog remains `stale` until the rendered preview no longer exposes the legacy GitHub Pages URL.
- No automatic external-profile mutation.
- `docs/DISTRIBUTION.md` remains byte-equal deterministic output from canonical registries.

## Verification

- RED contract first: Habr and Telegram personal must be verified; Telegram Blog must remain stale.
- Update `data/external-links.json` and regenerate `docs/DISTRIBUTION.md`.
- Require Distribution Readiness evidence, full repository matrix, CodeQL and Dependency Review.
- After merge, require exact deployment-driven Production Live Smoke.
