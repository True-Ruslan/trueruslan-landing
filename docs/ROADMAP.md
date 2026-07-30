# ROADMAP — TrueRuslan Landing

> Обновлено: **2026-07-30**, после merge P2.2a Production analytics activation contract PR #42.
>
> Текущее состояние — `docs/PROJECT_STATE.md`; история — `docs/CHANGELOG.md`.

## Принципы

Любое развитие должно сохранять:

- static-first;
- build-time intelligence;
- progressive enhancement;
- core content без runtime API;
- no backend/CMS/database без реальной необходимости;
- one canonical source of truth;
- Diplodoc как единственный site-wide full-text search owner;
- no automatic public truth mutation;
- bounded Evidence semantics;
- one RU/EN site/build/search architecture;
- analytics как optional aggregate telemetry;
- no behavioural/user tracking без нового explicit privacy review;
- quality gates без ослабления.

Главная продуктовая формула:

**что я создаю → что я изучаю → какие инженерные выводы делаю → чем это подтверждено**.

---

# Завершённые milestones

## P0 — foundation

- **P0.1 Photo Stories platform — DONE**: PR #15 + #17.
- **P0.2 First real Photo Story — CONTENT DEPENDENT**.
- **P0.3 Sources Registry / KB — DONE**: PR #20.
- **P0.4 Project Evidence — DONE**: PR #22, Build #247.
- **P0.5 Grounded Notes — DONE**: PR #25, Build #257.
- **P0.6 Content Freshness Guard — DONE**: PR #27, Build #269.

## P1 — maintainability / depth

- **P1.1 Browser Quality Harness — DONE**: PR #29, Build #293.
- **P1.2 Project Metadata Cleanup — DONE**: PR #31, Build #296.
- **P1.3 Flagship Case-Study Format — DONE**: PR #34, Build #301.
- **P1.4 Additional Grounded Note — DONE**: PR #36, Build #308.

## P2 — audience / operations

### P2.1 Minimal RU/EN — DONE

PR #38 / squash `00f7513f685b8a8348005d0ab704ce96abe64950`.

Build #339 / run `30000373281` fully green.

Architecture: one build, one site, one search index, Russian default/root, bounded `/en/` namespace.

### P2.2 Privacy-friendly analytics — DONE

PR #40 / squash `2dacace5de6b6c1225e82b372faef093850f4c9f`.

Build #351 / run `30003347268` fully green.

Implemented:

- Cloudflare Web Analytics manual beacon;
- pageviews/RUM-only policy;
- tokenless build = zero analytics capability;
- no custom events/cookies/persistent identifiers/cross-site tracking/session replay;
- one analytics layer for RU/EN;
- dedicated blocked-network privacy browser gate.

### P2.2a Production analytics activation contract — DONE (repository)

PR #42 / squash:

`522140dda2cab121e6a5c2a099dce9e491f1b49b`

Exact implementation head:

`21181a30d85d9f68536b266a326f849d4b451959`

Build #367 / run `30560152774`: **fully green по полной configured matrix**.

Implemented:

- repository variable `TR_CLOUDFLARE_WEB_ANALYTICS_TOKEN`;
- deployment modes `auto|required|disabled`;
- fail-closed preflight;
- generated RU/EN verification before Pages upload;
- deployed RU/EN verification after Pages deployment;
- weekly production-state monitoring;
- token-free deployment/production/health reports;
- exact attribute-name verification;
- operator runbook and emergency kill switch.

Not changed:

- package/dependency/lockfile graph;
- visual baselines/thresholds;
- Lighthouse budgets;
- Project Evidence/trust semantics;
- analytics privacy boundary;
- search or RU/EN source ownership.

---

# NEXT — external production activation and observation

Это не новый repository feature.

## Operational truth model

1. **Repository ready — YES**
   - PR #42 merged;
   - exact-head Build #367 green;
   - production/rollback/weekly verification code находится в `master`.

2. **Production beacon active — NOT VERIFIED IN CURRENT SNAPSHOT**
   - automatic push Pages run не был независимо разрешён доступным connector;
   - нельзя утверждать `enabled` или `disabled` без production report/run evidence.

3. **Telemetry observed — NOT VERIFIED**
   - Cloudflare dashboard data не проверялась.

## Следующая последовательность

Если Cloudflare site/repository variable ещё не существуют:

1. создать Cloudflare Web Analytics site для actual Pages hostname;
2. получить public site token;
3. добавить GitHub Actions repository variable:
   `TR_CLOUDFLARE_WEB_ANALYTICS_TOKEN`;
4. вручную запустить `Deploy static content to Pages` с `analytics_mode=required`;
5. потребовать green generated RU/EN verification;
6. потребовать green post-deploy RU/EN verification;
7. сохранить production reports/run evidence;
8. отдельно подтвердить telemetry в Cloudflare dashboard.

Если variable уже существует:

1. проверить latest Pages run/report;
2. подтвердить enabled RU/EN state;
3. подтвердить dashboard telemetry.

После activation сначала собрать aggregate usage/performance evidence. Не расширять event model заранее.

---

# Evidence-driven future branches

## Selective RU/EN/content expansion — CONDITIONAL

Только если actual usage показывает ценность конкретных surfaces.

## P2.3 Custom domain / hosting — CONDITIONAL

Только при operational reason:

- public identity;
- deployment/headers/cache/redirect constraints;
- GitHub Pages перестаёт удовлетворять требованиям.

## P2.4 Richer architecture explorer — CONDITIONAL

Только при наличии достаточного количества real architecture artifacts и доказанной audience value.

## First real Photo Story — CONTENT DEPENDENT

Только при genuine material; fake/demo album запрещён.

---

# Что не является priority

Без нового обоснования не планировать:

- полный перевод сайта одним milestone;
- отдельный EN build/CMS;
- второй site-wide search engine;
- advertising analytics;
- custom-event explosion;
- fingerprinting/session replay/cross-site tracking;
- per-user analytics;
- AI chat поверх резюме;
- accounts/comments/likes;
- backend/database ради static content;
- runtime GitHub API;
- automatic public-state mutation;
- giant QA runner;
- decorative version bumps.

---

# Оптимальная последовательность

```text
P2.2a repository contract DONE
        ↓
Resolve real Pages deployment state
        ↓
Cloudflare site + repository variable, if absent
        ↓
Manual required deployment + production verification
        ↓
Provider telemetry observation
        ↓
Choose next milestone from evidence
```

## Правило для нового чата

Перед любым следующим milestone:

1. открыть `PROJECT_STATE`, `ROADMAP`, `CHANGELOG`;
2. проверить actual open PR/latest commits/exact-head CI;
3. отдельно проверить Pages deployment report;
4. отдельно проверить deployed RU/EN beacon state;
5. отдельно проверить Cloudflare telemetry;
6. при freshness-вопросах проверить latest Content Freshness runs/issues.
