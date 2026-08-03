# ROADMAP — TrueRuslan Landing

> Обновлено: **2026-08-04**, после Content Freshness closure, exact dependency triage и high-severity remediation.
>
> Текущее состояние — `docs/PROJECT_STATE.md`; история — `docs/CHANGELOG.md`; custom-domain operations — `docs/CUSTOM_DOMAIN.md`.

## Принципы

Любое развитие должно сохранять:

- static-first;
- build-time intelligence;
- progressive enhancement;
- core content без runtime API;
- one canonical source of truth;
- Diplodoc как единственный site-wide full-text search owner;
- no automatic public truth mutation;
- bounded Evidence semantics;
- Publications только для completed, externally verifiable work;
- one RU/EN site/build/search architecture;
- optional aggregate analytics;
- no behavioural tracking без explicit privacy review;
- repository readiness, generated artifact, deployed state, external-project acceptance и provider telemetry как разные факты;
- exact artifact → installed acceptance как явную release boundary;
- byte continuity ≠ structural readability ≠ semantic continuity ≠ behavioral continuity;
- dependency evidence не является автоматическим разрешением на fix;
- quality gates без ослабления.

Главная продуктовая формула:

**что я создаю → что изучаю → что публикую → какие инженерные выводы делаю → чем это подтверждено**.

---

# Завершённые milestones

## P0 — foundation

- Photo Stories platform — PRs #15/#17.
- Sources Registry / KB — PR #20.
- Project Evidence — PR #22.
- Grounded Notes — PR #25.
- Content Freshness Guard — PR #27.

## P1 — maintainability / depth

- Browser Quality Harness — PR #29.
- Project Metadata Cleanup — PR #31.
- Flagship Case-Study Format — PR #34.
- Additional Grounded Note — PR #36.

## P2 — audience / operations / content

- Minimal RU/EN — PR #38.
- Privacy-friendly analytics — PRs #40/#42.
- Custom domain and HTTPS — PR #45.
- Canonical rollout/header/search/Photo stabilization — PRs #48–#58.
- Vlezet flagship — PR #59.
- Publications — PR #61.
- VillAIgence flagship — PR #63.
- `/now` synchronization — PR #65.
- Product Evidence Reconciliation — PR #83.
- Installed Acceptance Engineering Note — PR #85.
- Deterministic Authority Engineering Note — PR #87.
- Restart and Persistence Engineering Note — PR #89.

## Operational and security hardening

- Freshness PR evidence and clean issue #78 closure — PR #91.
- Exact full-lockfile dependency audit evidence — PR #93.
- High-severity `brace-expansion` / `undici` remediation — PR #94.
- Remaining markdown-it/Diplodoc blocker — issue #82.

---

# P2.4k — Restart and Persistence as Product Contract — DONE

Published:

**Restart — это часть продукта: почему сохранённый JSON ещё не доказывает persistence**

```text
feature PR:            #89 — MERGED
exact feature head:    e73a94d5d2b832d188e62b8790b4d039ac797a44
squash:                40af9e52237f03da58355caa065a40b64ad597d8
Build:                 #680 / 30856377655 — SUCCESS
unit tests:            327 PASS / 0 FAIL
```

Persistence remains a layered product contract: storage, structural readability, semantic continuity and behavioral continuity.

---

# Operational Maintenance Closure — DONE

## O1 — Content Freshness reconciliation

PR #91 added path-scoped PR evidence. Pull-request runs upload reports without mutating the issue; scheduled/manual runs retain automatic issue ownership.

```text
exact head:            6d64ed81e6bfebd856f502c993ce9f574c55aa4b
squash:                7afade6cc6e1cdfce2d14b28d5a4ff42b28453ee
Content Freshness:     #13 / 30857597584 — SUCCESS
findings:              0
```

Issue #78 is closed as completed.

## O2 — Exact dependency audit evidence

PR #93 added a read-only weekly/manual/path-scoped workflow preserving raw audit JSON, normalized reports and npm-explain chains.

```text
exact head:            23cffa3bd863de70fd70fa2bd8d1aa4a5c8a64a1
squash:                9055ed182c7590643a09533c9d4011bada84d399
Dependency Audit:      #4 / 30858629032 — SUCCESS
measured:              3 high / 6 moderate / 0 critical
```

High families were `undici`, `brace-expansion` and propagated `minimatch`.

## O2.1 — High-severity remediation

PR #94 applied compatible patch-only overrides:

```text
brace-expansion 2.1.3 → 2.1.4
brace-expansion 5.0.8 → 5.0.9
undici         7.28.0 → 7.29.0
```

```text
exact head:            ef47f18d52ca2d3e334e3c95d8fa312f167cc217
squash:                2e1bbd8e4b8e8e77319691a785f5ce14402f3389
Build:                 #695 / 30859354170 — SUCCESS
CodeQL:                #143 / 30859354188 — SUCCESS
Dependency Review:     #123 / 30859354189 — SUCCESS
Dependency Audit:      #7 / 30859354182 — SUCCESS
unit tests:            331 PASS / 0 FAIL
Lighthouse:            100 / 100 / 100 / 100
final audit:           0 high / 6 moderate / 0 critical
```

Issue #82 remains open only for the moderate `markdown-it@13.0.2` / Diplodoc compatibility blocker. Do not use forced fixes, local shims or an unreviewed fork.

---

# NOW — O3 Production Deployment Verification

Where tooling permits, independently verify:

1. latest Pages deployment belongs to current `master`;
2. `landing/notes/restart-persistence-is-a-product-contract.html` returns successfully;
3. Atom feed contains the persistence Note;
4. production search returns the canonical Note route;
5. HTTPS, `www → apex`, canonical metadata and Cloudflare beacon boundaries remain intact.

PR artifact evidence remains separate from live deployment evidence.

---

# Conditional next work

## Genuine Photo Story

Only authentic material with confirmed chronology, publishable alt text/captions and an explicit hero/layout decision. No fake/demo album.

## External product updates

- Vlezet public truth changes only after exact-head automated evidence plus the same real-plan owner acceptance. M7.8B remains latest accepted; M7.8C PR #42 remains Draft.
- VillAIgence promotion beyond `release-candidate` still requires real Text/STT/Chat/TTS and Voice Chat, deadline behavior, logical two-client conflict, focused gameplay canaries and product-owner cumulative acceptance.

## Distribution and analytics

After live production verification:

- update stale external profile links;
- announce selectively with direct case-study/Note links;
- observe aggregate Cloudflare data for 3–4 weeks before audience conclusions.

---

# Что не является priority

Без нового evidence-backed design decision не планировать migration from GitHub Pages, paid hosting merely for the custom domain, separate EN CMS/build, second full-text search, runtime publication APIs, behavioural analytics/session replay, accounts/comments/likes, backend/database for static content, automatic public-state mutation or decorative version bumps.

## Правило для нового чата

Перед следующим milestone открыть durable docs; проверить actual open PR/latest commits/exact-head CI; отдельно проверить Pages/live routes и Cloudflare; подтвердить, что issue #78 закрыт, issue #82 открыт только для moderate markdown-it blocker, Vlezet M7.8B accepted while M7.8C Draft, and VillAIgence automated evidence remains separate from manual cumulative acceptance.
