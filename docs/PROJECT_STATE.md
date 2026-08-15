# PROJECT STATE — TrueRuslan Landing

> Последнее смысловое обновление: **2026-08-15**. AI Navigator engineering baseline production-accepted на exact deployed SHA `ca4cecd510b5c0f6bad6cef31b6b5dd630f5f50f`; публичный AI остаётся **OFF**. Controlled launch остаётся `not-published`; P4.1B — IN PROGRESS / SPARSE PRE-LAUNCH BASELINE; P4.1C и P3.6 остаются evidence-gated.
>
> Полный snapshot до этого reconciliation сохранён byte-for-byte в `docs/archive/2026-08-14/PROJECT_STATE.md`.

В новом чате читать по порядку:

1. `docs/PROJECT_STATE.md`;
2. `docs/ROADMAP.md`;
3. `docs/CHANGELOG.md`;
4. `docs/keystone/specs/2026-08-05-portfolio-1-0-evidence-first.md`;
5. для AI Navigator — `docs/superpowers/specs/2026-08-15-ai-navigator-static-rag-design.md` и `docs/superpowers/plans/2026-08-15-ai-navigator-static-rag.md`.

Repository implementation, exact-head CI, deployed production, external provider acceptance, search-engine evidence и public product activation остаются разными фактами.

## 1. Что представляет собой проект

TrueRuslan Landing — static-first personal engineering platform на Diplodoc + GitHub Pages с canonical public identity `https://trueruslan.ru`. Это не только landing page: проект объединяет портфолио и case studies, Engineering Notes, Engineering Map, Publications, Resume, Now, Work with me, RU/EN content, clean URLs, generated search, SEO/structured-data contracts, analytics/privacy boundaries и evidence-first CI/production verification.

Основные архитектурные правила:

- GitHub Pages остаётся delivery platform;
- Diplodoc остаётся единственным обычным site-wide full-text search owner;
- canonical content и URLs не зависят от runtime API;
- progressive enhancement не должен ломать no-JS/core content;
- automatic mutation внешних профилей, search consoles и publication state запрещена;
- repository readiness не выдаётся за deployed/external acceptance;
- quality/security gates не ослабляются ради merge.

## 2. Current production baseline — 2026-08-15

Текущий accepted `master` после AI Navigator stack:

```text
master / deployed SHA:            ca4cecd510b5c0f6bad6cef31b6b5dd630f5f50f
Pages:                            #272 / 31905664206 — SUCCESS
Production Live Smoke:            #618 / 31905664180 — SUCCESS
master CodeQL:                    #1740 / 31905664193 — SUCCESS
AI Navigator production mode:     off
controlled launch:                not-published
```

Production Live #618 разрешил exact Pages deployment этого SHA и прошёл deployed baseline production, Yandex pre-consent, Portfolio Platform, flagship normalization, English Now/Publications, Work with me, P3.4A–F и favicon verification.

## 3. AI Navigator — ENGINEERING BASELINE PRODUCTION ACCEPTED / PUBLIC AI OFF

15 августа завершён отдельный static-first AI Navigator delivery stack. Он не заменяет Diplodoc search и не активирует платный provider для посетителей.

### Accepted sequence

- **PR #248 — design accepted.** Зафиксированы OFF/search/full modes, static corpus/index architecture, explicit Ask AI, canonical-only grounding и reversible removal boundary.
- **PR #249 — implementation plan accepted.** TDD sequence разбит на corpus/benchmark → index/retrieval → mode-gated search → grounded answers → real provider acceptance → SEARCH canary → FULL canary → keep/downgrade/remove verdict.
- **PR #250 — deterministic corpus + reviewed 50-case RU/EN retrieval benchmark accepted.** Corpus строится только из canonical public Markdown/registries; stable chunk IDs/content hashes; private/insufficient-evidence cases входят в benchmark.
- **PR #251 — explicit embedding index + hybrid retrieval accepted.** Provider-backed document embeddings обновляются только явной operator action; content-hash reuse, deterministic Float32 artifact/manifest, полностью offline index verification и shared Node/browser hybrid ranking.
- **PR #252 — optional semantic-search integration accepted.** Existing search получает reversible AI control; OFF сохраняет обычный Diplodoc search и не публикует/не загружает AI artifacts. Stateless Worker boundary скрывает provider secret; browser secret отсутствует.
- **PR #253 — grounded answers + acceptance gates accepted.** Worker принимает question + selected canonical chunk IDs, сам получает canonical corpus, применяет strict structured answer/citation validation, insufficient-evidence fallback, exact CORS preflight contract, 8-second bounded operations и no-store responses. Добавлены provider-free offline acceptance и browser smoke gates.

### Security finding закрыт TDD

Во время review PR #250 CodeQL обнаружил, что Markdown corpus sanitizer мог пропускать текст из malformed/spaced closing `script/style` tags. Finding был воспроизведён отдельными RED commits и закрыт консервативным sanitizer contract:

- RED `83380141b1f1b0eba35b4425871ce017d1a2ae0f` — `</script >` regression;
- RED `81c9b4c58ac0dffb229e4769f42db785bb8dda3d` — malformed closing tail regression;
- final GREEN `54d78cfd0d1b817ece42086aee61062410cf59d6`;
- exact-head Build #2204, CodeQL #1733, Dependency Review #1568 — SUCCESS;
- оба review conversations resolved до merge.

Accepted sanitizer strips the complete non-reader script/style block conservatively instead of allowing executable text into embedding corpus.

### Final #253 exact-head evidence

```text
PR #253 exact head:               8b9beacbda0e7c3042d7838b6242c790981c238f
Build:                            #2207 / 31905319214 — SUCCESS
Dependency Review:                #1571 / 31905319201 — SUCCESS
Dependency Audit:                 #269 / 31905319207 — SUCCESS
CodeQL:                           #1739 / 31905319219 — SUCCESS
AI Navigator offline verification: SUCCESS
AI Navigator browser smoke:        SUCCESS
squash / deployed SHA:            ca4cecd510b5c0f6bad6cef31b6b5dd630f5f50f
```

### Explicit non-claims

- `data/ai-navigator.json` остаётся `"mode": "off"`;
- `workerBaseUrl` в production config остаётся пустым;
- public SEARCH/FULL canary не запускался;
- live OpenRouter acceptance не заявляется;
- dedicated production OpenRouter key/spending cap не считается настроенным только из repository readiness;
- real semantic/provider latency/cost/product-impact evidence ещё не накоплено;
- AI не является вторым canonical content/search owner.

## 4. Transparent `trueruslan.com` alias readiness

PR #247 подготовил repository-side Cloudflare Worker/host-preserving navigation contracts для потенциального transparent `trueruslan.com` alias. `trueruslan.ru` остаётся единственным GitHub Pages custom domain и canonical SEO identity.

Не считать реализованным внешним состоянием:

- DNS/Cloudflare route activation;
- live `.com` availability;
- второй canonical/SEO identity.

## 5. External launch / search evidence

Ничего из AI delivery stack не меняет принятые внешние evidence boundaries:

- controlled launch pack: **10 targets / 38 manual drafts / `not-published`**;
- deliberate controlled manual launch остаётся operator action; repository automation не должна постить, логиниться или планировать внешние публикации;
- P4.1B real external evidence review — **IN PROGRESS / SPARSE PRE-LAUNCH BASELINE**;
- P4.1C — **WAITING** for reviewed evidence;
- P3.6 — **NEXT / WAITING FOR EXTERNAL EVIDENCE**;
- clean-URL observation clock остаётся `2026-08-05T00:00:00Z`.

## 6. Known maintenance / technical debt

### #82 — upstream Diplodoc / markdown-it blocker

Остаётся отдельным upstream dependency risk: известные moderate markdown-it records идут через Diplodoc build-time dependency graph. Не использовать forced major override или brittle node_modules shim. Закрывать только после совместимого upstream Diplodoc release и полного security/translation/build/browser matrix.

### #78 — Content Freshness Guard reopened

15 августа guard переоткрыл issue #78 с **2 warnings / 0 errors**:

- `repository-drift` — `portfolio-platform`;
- `repository-drift` — `vlezet`.

Это maintenance evidence, а не production regression. Текущий reconciliation устраняет portfolio-platform state drift; Vlezet drift должен закрываться только после отдельной проверки его фактического GitHub/project evidence.

### #111 / #212 — operator/external evidence

Остаются задачами, которые нельзя честно закрыть repository-only работой:

- #111 — Yandex Webmaster diagnostic reconciliation;
- #212 — P4.1B authenticated Search Console / Yandex Webmaster evidence collection/review.

## 7. Следующий оптимальный порядок

### Product/operator track

1. Выполнить deliberate controlled manual launch из принятого 10-target / 38-draft pack.
2. После launch накопить реальные GSC/Yandex Webmaster observations.
3. Только при достаточных данных выбирать P4.1C metadata/copy/internal-link change и/или закрывать P3.6 measurement checkpoint.

### AI engineering track

1. Подготовить **отдельный hard-spend-capped OpenRouter key** и Worker binding без вывода секрета в browser/repository.
2. Выполнить explicit real AI acceptance workflow и сгенерировать/проверить реальный embedding index; ordinary CI/build остаётся provider-free.
3. Только после real acceptance перевести bounded canary в **SEARCH**, проверить retrieval quality/fallback/latency/cost и сохранить обычный search fallback.
4. Только после SEARCH acceptance разрешить **FULL** canary с explicit Ask AI.
5. Завершить эксперимент явным **KEEP / DOWNGRADE / REMOVE** verdict. Removal не должен требовать canonical-content, URL, SEO или database migration.

Public AI activation не является частью этого state reconciliation.
