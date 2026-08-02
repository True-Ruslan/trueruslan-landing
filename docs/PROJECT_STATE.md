# PROJECT STATE — TrueRuslan Landing

> Последнее смысловое обновление: **2026-08-02**, после публикации внешних материалов и выступлений.
>
> Durable snapshot для ответа на вопрос: **что представляет собой проект, что уже сделано и что дальше?**
>
> В новом чате читать по порядку:
> 1. `docs/PROJECT_STATE.md`
> 2. `docs/ROADMAP.md`
> 3. `docs/CHANGELOG.md`
> 4. `docs/CUSTOM_DOMAIN.md`
>
> Затем отдельно проверять actual open PR, latest commits, exact-head CI, latest Pages deployment, production HTTPS/redirects, Cloudflare dashboard и maintenance workflows. Repository readiness, deployed production state и provider telemetry — разные факты.

## 1. Что это за проект

`True-Ruslan/trueruslan-landing` — персональное инженерное портфолио и knowledge platform Руслана Немыкина.

Проект объединяет:

- standalone homepage;
- Diplodoc knowledge pages;
- web-CV;
- project hub и evidence-backed flagship case studies;
- `/now`;
- Engineering Notes + Atom feed;
- **Публикации и выступления** как отдельный каталог внешних материалов;
- Engineering Map;
- Diplodoc full-text search + Cmd/Ctrl+K palette;
- Photo Stories;
- Sources Knowledge Base;
- Project Evidence Layer;
- Content Freshness Guard;
- bounded RU/EN layer;
- privacy-friendly Cloudflare Web Analytics;
- SEO/OpenGraph/JSON-LD;
- production-oriented CI, accessibility, cross-browser, deployment и visual quality gates.

Главная продуктовая формула:

**что я создаю → что я изучаю → что публикую → какие инженерные выводы делаю → чем это подтверждено**.

Публичный тон — спокойный инженерный дневник от первого лица, без fake demos, invented metrics и неподтверждённых claims.

Архитектурная граница:

**static-first + build-time intelligence + progressive enhancement**.

Core content не зависит от runtime API. Diplodoc остаётся единственным site-wide full-text search owner. Public truth не изменяется автоматически.

---

## 2. Текущее repository truth

Последний product feature:

```text
feature PR:          #61 — MERGED
exact feature head:  1386df46b57d5c9164a13039a286cafb1f296037
Build / run:         #539 / 30757856207 — SUCCESS
squash on master:    4036df1744840e558a6514ce6ae09eceb624b69e
unit tests:          300 PASS / 0 FAIL
quality artifact:    8836540794
artifact digest:     sha256:d69dd36389ab7f6aa59120a2355e34962af2188e8dea733e9ed93826d59ac4d5
artifact retention:  through 2026-08-16
```

Build #539 прошёл:

- production Diplodoc build;
- generated-site integrity;
- mobile overflow для Projects и Publications;
- Chromium/Axe/Lighthouse;
- Publications enhanced desktop и no-JavaScript mobile acceptance;
- Sources Knowledge Base;
- Project Evidence в enhanced и no-JavaScript режимах;
- NODE ZERO diagrams;
- Photo Stories;
- portfolio v0.3;
- Firefox/WebKit;
- generated Diplodoc search;
- Minimal RU/EN;
- privacy analytics;
- metadata/OpenGraph;
- Engineering Map;
- reviewed visual regression;
- custom-domain artifact verification для `https://trueruslan.ru`.

Latest Pages deployment и owner production acceptance после merge должны проверяться отдельно.

---

## 3. Последний завершённый milestone

### P2.4e — External Publications Showcase — DONE

PR #61 создал самостоятельный верхнеуровневый раздел **«Публикации и выступления»**.

Контентные поверхности теперь разделены явно:

- **Projects** — созданные продукты и системы;
- **Publications** — материалы, опубликованные или представленные на внешних площадках;
- **Engineering Notes** — оригинальные материалы, опубликованные непосредственно на сайте;
- **Sources** — источники и рабочая knowledge base.

#### Initial verified catalogue

В первый релиз вошли ровно три проверенные статьи Habr:

1. `2025-08-23` — про Diplodoc и GitHub Pages;
2. `2025-08-01` — про решение алгоритмических задач Java-разработчиком;
3. `2025-03-04` — про автоматизированный электропривод ленточного конвейера.

На момент milestone не добавлены научные публикации, доклады, интервью и сборники: для них не было найдено стабильной внешней точки, удовлетворяющей inclusion boundary. Пустые категории не отображаются.

#### Architecture

`data/publications.json` — единственный source of truth.

```text
data/publications.json
        ↓ immutable validation
prebuild catalogue generator
        ↓ native Diplodoc include
searchable Publications page
        ↓ postprocessing
Featured block + stylesheet + compact no-JS fallback
```

Ключевые решения:

- каталог генерируется **до** Diplodoc indexing, поэтому все три материала находятся штатным поиском;
- homepage Featured и полный каталог используют один registry и один renderer;
- postprocessor не создаёт второй content engine;
- no-JS fallback показывает полный каталог без дублирования Featured;
- Engineering Notes Atom feed не включает внешние публикации;
- внешние ссылки безопасны и ведут на canonical source;
- нет CMS, database, scraper, runtime API, второго поиска, live view/vote counters и локальных article-detail pages.

#### Product integration

Добавлено:

- canonical `landing/publications.html`;
- `Публикации` рядом с Notes в основной навигации;
- top-level пункт в Diplodoc sidebar;
- блок `Избранные публикации` после активных проектов на главной;
- exploration card на главной;
- contextual links из About и Resume;
- RU metadata/OpenGraph;
- responsive text-first cards;
- dedicated enhanced/no-JS browser smoke;
- Firefox/WebKit, mobile overflow и generated-search coverage;
- generated Publications HTML и diagnostics в quality artifact.

#### TDD evidence

```text
Initial RED head:       3e0d4e7fce1f6923c4865adde588c4017ac99be7
Initial RED Build/run:  #491 / 30755225315
Result:                 265 previous tests PASS; 6 expected missing-surface failures

Search RED head:        60b8781e268d81d8b12db7033fb2c4473a3de564
Search RED Build/run:   #530 / 30757328760
Result:                 296 previous tests PASS; only generator module missing

GREEN exact head:       1386df46b57d5c9164a13039a286cafb1f296037
GREEN Build/run:        #539 / 30757856207 SUCCESS
squash on master:       4036df1744840e558a6514ce6ae09eceb624b69e
```

#### Manual acceptance

Exact-head screenshots проверены для:

- home desktop/mobile;
- resume desktop/mobile;
- Publications enhanced desktop/mobile;
- Publications no-JS mobile.

Подтверждено:

- Featured остаётся ниже active projects;
- длинные заголовки корректно переносятся;
- empty groups отсутствуют;
- no-JS каталог начинается без пустого Diplodoc-root gap;
- mobile overflow отсутствует;
- только четыре ожидаемых home/resume visual baseline были приняты после review;
- финальный visual delta для принятых baseline — `0.00`.

---

## 4. Ранее завершённые milestones

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
- **P2.4e External Publications Showcase — DONE: PR #61, Build #539.**

### Vlezet truth boundary

Vlezet остаётся третьим controlled flagship. M7.7 и M7.8A приняты; M7.8B остаётся Draft с product-owner `FAIL — DO NOT MERGE`. Landing не заявляет accurate arbitrary-plan recognition и не хранит private apartment plans/screenshots.

---

## 5. Production и custom-domain truth

Canonical public origin:

`https://trueruslan.ru`

Ранее подтверждены:

- GitHub account domain verification;
- GitHub Pages DNS check;
- certificate и Enforce HTTPS;
- `www → apex`;
- strict custom deployment;
- RU canonical `/` и EN canonical `/en/`;
- one Cloudflare analytics beacon on RU and EN;
- initial provider telemetry.

Build #539 также подтвердил custom-domain artifact contract и отсутствие leakage legacy GitHub Pages origin.

Отдельный SSL-сертификат Timeweb не используется и не нужен.

---

## 6. Known problems / debt

- Latest Pages deployment после PR #61 нужно подтвердить отдельно от feature CI.
- Owner production visual acceptance новой страницы Publications — отдельный operational fact.
- Cloudflare sample всё ещё недостаточен для audience/product conclusions; нужен distribution window 3–4 недели.
- External profile Website/links требуют ручной проверки и обновления, если ещё stale.
- First genuine Photo Story зависит от authentic material.
- Vlezet M7.8B recognition не принят.
- `/now` после последних изменений Vlezet/VillAIgence/Publications требует content sync.
- VillAIgence пока не имеет столь же глубокого flagship case study на landing.
- Каталог Publications расширяется только после появления подтверждаемой canonical external source; drafts и future work не показываются.

Network caveat:

- local plain-DNS `dig` из российской сети ранее давал ложные `REFUSED`; DoH был надёжнее. Это diagnostic caveat, не product defect.

---

## 7. Следующий оптимальный шаг

Следующий product milestone — **VillAIgence flagship case study**.

Использовать real evidence из:

- text/voice NPC dialogue;
- STT → Chat → TTS pipeline;
- Memory 2.0;
- semantic FACT/ACTION/RELATIONSHIP_CHANGE;
- deterministic IDs и persistence;
- restart/rollback verification;
- multi-NPC isolation;
- server-authoritative actions;
- provider failure handling;
- response-size, redirect, loopback и SSRF security hardening;
- реальные release acceptance failures без превращения partial PASS в broad release claim.

После VillAIgence:

1. обновить `/now`;
2. выпустить 1–2 grounded Engineering Notes;
3. добавлять новые внешние Publications только при стабильном evidence;
4. добавить первую genuine Photo Story при готовом материале;
5. завершить external-profile rollout;
6. распространять сайт и собирать aggregate telemetry 3–4 недели;
7. выбирать дальнейший milestone по evidence.

---

## 8. Нельзя ломать без нового design decision

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

## 9. Как восстановить контекст

> Открой в `True-Ruslan/trueruslan-landing` файлы `docs/PROJECT_STATE.md`, `docs/ROADMAP.md`, `docs/CHANGELOG.md` и `docs/CUSTOM_DOMAIN.md`. Затем проверь actual open PR, latest commits и exact-head CI. Отдельно проверь latest Pages deployment reports, HTTPS/redirect state, production Publications/Vlezet pages и Cloudflare telemetry для `trueruslan.ru`.
