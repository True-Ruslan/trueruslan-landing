# PROJECT STATE — TrueRuslan Landing

> Последнее смысловое обновление: **2026-08-02**, после синхронизации `/now` с актуальными flagship и content milestones.
>
> Durable snapshot для ответа на вопрос: **что представляет собой проект, что уже сделано и что дальше?**

В новом чате читать по порядку:

1. `docs/PROJECT_STATE.md`;
2. `docs/ROADMAP.md`;
3. `docs/CHANGELOG.md`;
4. `docs/CUSTOM_DOMAIN.md`.

Затем отдельно проверять actual open PR, latest commits, exact-head CI, latest Pages deployment, production HTTPS/redirects, Cloudflare dashboard и maintenance workflows. Repository readiness, deployed production state и provider telemetry — разные факты.

---

## 1. Что это за проект

`True-Ruslan/trueruslan-landing` — персональное инженерное портфолио и knowledge platform Руслана Немыкина.

Проект объединяет:

- standalone homepage;
- Diplodoc knowledge pages;
- web-CV;
- project hub и evidence-backed flagship case studies;
- `/now` как короткий authored snapshot текущего фокуса;
- Engineering Notes + Atom feed;
- отдельный каталог внешних публикаций и выступлений;
- Engineering Map;
- Diplodoc full-text search + Cmd/Ctrl+K palette;
- Photo Stories;
- Sources Knowledge Base;
- Project Evidence Layer;
- Content Freshness Guard;
- bounded RU/EN layer;
- privacy-friendly Cloudflare Web Analytics;
- SEO/OpenGraph/JSON-LD;
- production-oriented CI, accessibility, cross-browser, visual и custom-domain gates.

Главная продуктовая формула:

**что я создаю → что я изучаю → что публикую → какие инженерные выводы делаю → чем это подтверждено**.

Публичный тон — спокойный инженерный дневник от первого лица, без fake demos, invented metrics и неподтверждённых claims.

Архитектурная граница:

**static-first + build-time intelligence + progressive enhancement**.

Core content не зависит от runtime API. Diplodoc остаётся единственным site-wide full-text search owner. Public truth не изменяется автоматически.

---

## 2. Текущее repository truth

Последний product/content feature:

```text
feature PR:          #65 — MERGED
exact feature head:  fdc2d2ddf54f67aacf1e730f210fb6aae7325cdf
Build / run:         #571 / 30763586234 — SUCCESS
squash on master:    2ef556a6e910be001355193d9d96f499131d5094
unit tests:          307 PASS / 0 FAIL
quality artifact:    8838265730
artifact digest:     sha256:917d75578563a23a8a7b9186dcb143ec890a98d81f3823460251ffcf4be997a8
artifact retention:  through 2026-08-16
```

Build #571 прошёл полный configured matrix:

- production Diplodoc build;
- generated-site integrity;
- mobile overflow;
- Chromium/Axe/Lighthouse;
- Publications и Sources Knowledge Base;
- Project Evidence;
- VillAIgence и NODE ZERO diagram raster gates;
- Photo Stories;
- portfolio v0.3, включая `/now`;
- Firefox/WebKit;
- generated search и dedicated VillAIgence search;
- Minimal RU/EN;
- privacy analytics;
- metadata/OpenGraph;
- Engineering Map + accessibility;
- visual regression;
- custom-domain artifact verification для `https://trueruslan.ru`.

Latest Pages deployment и owner production acceptance после merge должны проверяться отдельно.

---

## 3. Последний завершённый milestone

### P2.4g — `/now` synchronization after flagship milestones — DONE

PR #65 обновил authored snapshot текущего инженерного фокуса после:

- Vlezet flagship case study;
- External Publications Showcase;
- VillAIgence flagship case study.

Дата публичного snapshot:

`2026-08-02`

### Что теперь отражает `/now`

Страница фиксирует переход от наращивания инфраструктуры портфолио к следующему циклу:

- реальная product acceptance вместо broad feature claims;
- явное разделение принятых и непринятых решений;
- превращение подтверждённого опыта в grounded Engineering Notes;
- постепенное внешнее распространение сайта;
- отказ от преждевременных выводов по короткому analytics sample.

Раздел **«Что изучаю»** содержит три текущие линии:

1. **VillAIgence** — где заканчивается предложение модели и начинается авторитетное состояние; source/package gates, installed acceptance, rollback и persistent evidence.
2. **Vlezet** — CV/LLM proposals, confidence, ручная проверка, deterministic validation и explicit Apply без выдачи draft recognition за точную геометрию.
3. **Static-first distribution** — один источник истины и интерпретация aggregate telemetry только после достаточного observation window.

Раздел **«Что пишу»** фиксирует три grounded направления:

1. почему зелёный exact-head CI ещё не означает успешную приёмку установленного продукта;
2. deterministic authority вокруг LLM/CV proposals;
3. restart и persistence как продуктовый контракт.

### Source-of-truth boundary

Архитектура `/now` намеренно не расширена:

- `data/projects.json` остаётся владельцем project identity, status, href и active cards;
- `data/now.json` владеет только короткоживущим editorial snapshot;
- schema `updated / focus / learning / writing` не изменена;
- `scripts/now-page.js` не изменён;
- route `landing/now.html` не изменён;
- CSS и visual thresholds не изменены;
- backend, CMS, runtime API и automatic public-state mutation не добавлены.

Публичное имя — **VillAIgence**, но стабильный route остаётся:

`landing/projects/livingworld.html`

Устаревшее публичное имя `LivingWorld` удалено из `/now`; compatibility-sensitive slug/route не мигрировали.

### Explicit non-claims

Snapshot не заявляет:

- установленную приёмку VillAIgence `0.1.22+1.21.1`;
- accurate arbitrary-plan recognition для Vlezet;
- meaningful audience validation по ранней Cloudflare telemetry.

### TDD evidence

RED:

```text
exact test head: d4cfd2d0b9d961efcdcedb8eddca197aadbe7e32
Build / run:     #569 / 30763497159
result:          306 PASS / 1 expected FAIL
failure:         repository date 2026-07-22, expected 2026-08-02
```

Первый GREEN-кандидат обнаружил дефект тестового ожидания, а не production data:

```text
head:            7d89d4c0aedfb6a8672e484eee2e6550467b5fb8
Build / run:     #570 / 30763542736
result:          306 PASS / 1 FAIL
cause:           test required "Engineering Notes" while approved copy used "Engineering Note"
resolution:      corrected test contract; production snapshot unchanged
```

Финальный GREEN:

```text
exact head:      fdc2d2ddf54f67aacf1e730f210fb6aae7325cdf
Build / run:     #571 / 30763586234 — SUCCESS
result:          307 PASS / 0 FAIL
squash:          2ef556a6e910be001355193d9d96f499131d5094
```

### Manual artifact review

Проверены `v03-now.png` и generated `now-generated.html`.

Подтверждено:

- дата `2026-08-02` отображается;
- active cards по-прежнему registry-derived;
- Vlezet, VillAIgence, NODE ZERO и Portfolio сохраняют канонические статусы;
- VillAIgence ведёт на стабильный `livingworld.html` route;
- stale public `LivingWorld` отсутствует;
- длинные learning/writing пункты корректно переносятся;
- mobile overflow и serious/critical Axe violations отсутствуют;
- misleading acceptance/adoption claims отсутствуют;
- visual baseline update не потребовался.

---

## 4. Завершённые milestones

### P0 — foundation

- P0.1 Photo Stories platform — DONE: PR #15 + #17.
- P0.2 First genuine Photo Story — CONTENT DEPENDENT.
- P0.3 Sources Registry / KB — DONE: PR #20.
- P0.4 Project Evidence — DONE: PR #22.
- P0.5 Grounded Notes — DONE: PR #25.
- P0.6 Content Freshness Guard — DONE: PR #27.

### P1 — maintainability / depth

- P1.1 Browser Quality Harness — DONE: PR #29.
- P1.2 Project Metadata Cleanup — DONE: PR #31.
- P1.3 Flagship Case-Study Format — DONE: PR #34.
- P1.4 Additional Grounded Note — DONE: PR #36.

### P2 — audience / operations / content

- P2.1 Minimal RU/EN — DONE: PR #38.
- P2.2 Privacy-friendly analytics — DONE: PR #40.
- P2.2a Production analytics activation — DONE: PR #42 + strict deployment.
- P2.3a Custom Domain Readiness — DONE: PR #45.
- P2.3b HTTPS Production Cutover — DONE: run `30704218399`.
- P2.4a Canonical rollout and first custom-host telemetry — DONE: PRs #48–#50.
- P2.4b Header utility navigation and language consolidation — DONE: PR #51.
- P2.4c Search, Photo shell and SVG stabilization — DONE: PRs #53/#54/#55/#57.
- P2.4c durable sync — DONE: PR #58.
- P2.4d Vlezet flagship case study — DONE: PR #59, Build #486.
- P2.4e External Publications Showcase — DONE: PR #61, Build #539.
- P2.4f VillAIgence flagship case study — DONE: PR #63, Build #567.
- **P2.4g `/now` synchronization — DONE: PR #65, Build #571.**

---

## 5. Current product boundaries

### Vlezet

- controlled flagship;
- M7.7 и M7.8A приняты;
- M7.8B остаётся Draft с product-owner `FAIL — DO NOT MERGE`;
- landing не заявляет accurate arbitrary-plan recognition;
- private apartment plans/screenshots не публикуются;
- CV/LLM output остаётся proposal до review, deterministic validation и explicit Apply.

### VillAIgence

- public name VillAIgence, stable internal/route identity `livingworld`;
- installed `0.1.20+1.21.1` — PARTIAL PASS с зафиксированными defects;
- installed `0.1.21+1.21.1` — startup FAIL с safe rollback;
- corrective PRs #99–#102 — source/package gates green;
- exact installed `0.1.22+1.21.1` cumulative acceptance — pending;
- landing не повышает automated code evidence до installed release acceptance.

### Publications

- каталог содержит только completed, externally verifiable work;
- сейчас опубликованы три Habr-статьи;
- drafts, future appearances и непроверенные scientific records не показываются;
- canonical external sources остаются владельцами полного текста.

### Photo Stories

- platform готова;
- первая genuine story зависит от authentic material;
- fake/demo album не публикуется.

---

## 6. Production и custom-domain truth

Canonical public origin:

`https://trueruslan.ru`

Ранее подтверждены:

- GitHub account domain verification;
- GitHub Pages DNS check;
- certificate и Enforce HTTPS;
- `www → apex`;
- strict custom deployment;
- RU canonical `/` и EN canonical `/en/`;
- one Cloudflare analytics beacon on RU и EN;
- initial provider telemetry.

Build #571 подтвердил custom-domain artifact contract и отсутствие leakage legacy GitHub Pages origin.

Отдельный SSL-сертификат Timeweb не используется и не нужен.

---

## 7. Known problems / debt

- Latest Pages deployment после PR #65 нужно подтвердить отдельно от feature CI.
- Owner production visual acceptance обновлённого `/now` — отдельный operational fact.
- Exact installed VillAIgence `0.1.22+1.21.1` acceptance всё ещё pending в source project.
- Vlezet M7.8B arbitrary-plan recognition не принят.
- Cloudflare sample недостаточен для audience/product conclusions; нужен distribution window 3–4 недели.
- External profile Website/links требуют ручной проверки и обновления, если ещё stale.
- First genuine Photo Story зависит от authentic material.
- Publications расширяется только после появления подтверждаемой canonical external source.
- Dependency audit сообщает транзитивные уязвимости в build toolchain; их нельзя исправлять blind `npm audit fix --force`, нужен отдельный compatibility review.

Network caveat:

- local plain-DNS `dig` из российской сети ранее давал ложные `REFUSED`; DoH был надёжнее. Это diagnostic caveat, не product defect.

---

## 8. Следующий оптимальный шаг

Следующий milestone — первая grounded Engineering Note из актуального product evidence:

### Recommended topic

**Почему зелёный exact-head CI не означает успешную приёмку установленного продукта**.

Основной материал:

- VillAIgence `0.1.20` partial PASS;
- `0.1.21` startup FAIL после green source/package gates;
- safe rollback и persistent hashes;
- corrective `0.1.22` candidate без установленной cumulative acceptance;
- различие source tests, distributable artifact, embedded identity, startup, focused regression, restart и promotion.

После неё:

1. Note про deterministic authority вокруг LLM/CV proposals;
2. Note про restart/persistence как product contract;
3. первая genuine Photo Story при готовом authentic material;
4. manual external-profile rollout;
5. public distribution;
6. 3–4 недели aggregate Cloudflare observation;
7. выбор следующего product/content milestone по evidence.

---

## 9. Нельзя ломать без нового design decision

- static-first;
- build-time intelligence;
- progressive enhancement;
- core content без runtime API;
- one canonical source of truth;
- deterministic generation;
- semantic/no-JS content;
- Diplodoc как единственный site-wide search owner;
- no automatic public truth mutation;
- bounded Evidence semantics;
- Publications inclusion boundary;
- one RU/EN site/build/search architecture;
- optional aggregate analytics only;
- no behavioural tracking без privacy review;
- no weakening quality gates ради скорости.

---

## 10. Как восстановить контекст

> Открой в `True-Ruslan/trueruslan-landing` файлы `docs/PROJECT_STATE.md`, `docs/ROADMAP.md`, `docs/CHANGELOG.md` и `docs/CUSTOM_DOMAIN.md`. Затем проверь actual open PR, latest commits и exact-head CI. Отдельно проверь latest Pages deployment reports, HTTPS/redirect state, production `/now`, Publications, Vlezet и VillAIgence routes, а также Cloudflare telemetry для `trueruslan.ru`. Перед обновлением VillAIgence evidence отдельно проверь source repository и installed acceptance truth.
