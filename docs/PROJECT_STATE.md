# PROJECT STATE — TrueRuslan Landing

> Последнее смысловое обновление: **2026-08-02**, после публикации Vlezet flagship case study.
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

**что я создаю → что я изучаю → какие инженерные выводы делаю → чем это подтверждено**.

Публичный тон — спокойный инженерный дневник от первого лица, без fake demos, invented metrics и неподтверждённых claims.

Архитектурная граница:

**static-first + build-time intelligence + progressive enhancement**.

Core content не зависит от runtime API. Diplodoc остаётся единственным site-wide full-text search owner. Public truth не изменяется автоматически.

---

## 2. Текущее repository truth

После feature PR #59:

```text
master HEAD:         aa32ce01e3345612fa9ebdad2b2b096399225b5f
feature PR:          #59 — MERGED
exact feature head:  a409a152f60ea9d11dce8790920d84c3b70c1633
Build / run:         #486 / 30752888855 — SUCCESS
quality artifact:    8835053206
artifact digest:     sha256:7a3dde6a0a36ebaeed6ea59c3c0e477a8522c786eb6703a5044567bddb767ddc
```

Build #486 прошёл:

- 265 unit tests;
- production Diplodoc build;
- generated-site integrity;
- mobile overflow;
- Chromium/Axe/Lighthouse;
- Sources Knowledge Base;
- Project Evidence в enhanced и no-JavaScript режимах;
- NODE ZERO diagram rendering;
- Photo Stories;
- portfolio v0.3;
- Firefox/WebKit;
- generated search;
- Minimal RU/EN;
- privacy analytics;
- metadata/OpenGraph;
- Engineering Map;
- reviewed visual regression;
- custom-domain artifact verification.

Latest Pages deployment и owner production acceptance после merge должны проверяться отдельно.

---

## 3. Последний завершённый milestone

### P2.4d — Vlezet flagship case study — DONE

Vlezet стал третьим controlled flagship после LivingWorld и NODE ZERO.

Реализовано:

- canonical public/featured project registry entry;
- `ACTIVE DEVELOPMENT` status;
- project-hub placement перед LivingWorld;
- navigation и RU metadata/OpenGraph;
- past/current/next timeline;
- bounded Project Evidence snapshot;
- production-safe SVG authority map;
- seven-section case-study narrative;
- dedicated desktop/mobile Chromium evidence;
- Firefox/WebKit route coverage;
- Evidence smoke в JS и no-JS режимах;
- Vlezet generated HTML/screenshots в CI artifact;
- reviewed home/projects visual baselines.

Главная формула case study:

> CV/LLM создают измеримый и редактируемый Recognition Draft. Авторитетной геометрия становится только после review, deterministic validation и explicit Apply в `VlezetDocument`.

Страница объясняет:

- миллиметры как canonical unit;
- `VlezetDocument` как единственный persistent authority;
- derived rooms, areas, dimensions и read-only 3D;
- semantic Undo/Redo;
- deterministic furniture fit;
- calibration и coordinate transforms;
- benchmark-first recognition;
- различие между protocol validation, domain validation и product acceptance.

#### Truth boundary по recognition

Accepted:

- M7.7 furniture/fit workflow — Vlezet PR #35;
- M7.8A public-safe recognition benchmark — Vlezet PR #40.

Не accepted:

- M7.8B — Vlezet PR #41 остаётся Draft;
- product-owner review завершился `FAIL — DO NOT MERGE`;
- representative real plan дал 417 local wall candidates, 0 openings и symbol/furniture network вместо architectural shell;
- corrective structural masking снизил isolated reproduction примерно с 948 до 115 unique segments и с 12 346 до 249 admissible pairs;
- текущий aggregate Source geometry/topology F1 около `0.492537 / 0.462687`;
- case study не заявляет accurate arbitrary-plan recognition.

Private apartment plans и owner screenshots в landing repository не добавлялись.

#### TDD evidence

```text
RED exact head:   bd5951e6f396dc2001d468b68ad02559dc8ed498
RED Build / run:  #461 / 30751734792
RED result:       262 PASS / 1 expected ENOENT for missing Vlezet page

GREEN exact head: a409a152f60ea9d11dce8790920d84c3b70c1633
GREEN Build/run:  #486 / 30752888855 SUCCESS
squash on master: aa32ce01e3345612fa9ebdad2b2b096399225b5f
```

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

### P2 — audience / operations

- P2.1 Minimal RU/EN — DONE: PR #38.
- P2.2 Privacy-friendly analytics — DONE: PR #40.
- P2.2a Production analytics activation — DONE: PR #42 + strict deployment.
- P2.3a Custom Domain Readiness — DONE: PR #45.
- P2.3b HTTPS Production Cutover — DONE: run `30704218399`.
- P2.4a Canonical link rollout and first custom-host telemetry — DONE: PRs #48–#50 plus cross-repository link updates.
- P2.4b Header utility navigation and language consolidation — DONE: PR #51.
- P2.4c Search, Photo shell and rendered-asset stabilization — DONE: PRs #53/#54/#55/#57.
- P2.4c durable sync — DONE: PR #58, squash `28fa21627440a64ba04baeab5ed4288b19537496`, Build #460.
- P2.4d Vlezet flagship case study — DONE: PR #59, Build #486.

### P2.4c detail

- search получил working Back navigation;
- doubled search contour и noisy button layers устранены;
- Photo index перенесён в shared Diplodoc shell;
- obsolete duplicated Photo mini-site chrome удалён;
- NODE ZERO SVG critical paint переведён в presentation attributes;
- dedicated browser-rendering regression добавлен.

---

## 5. Production и custom-domain truth

Canonical public origin:

`https://trueruslan.ru`

Подтверждено ранее:

- GitHub account domain verification;
- apex A records на GitHub Pages;
- `www` CNAME на `true-ruslan.github.io`;
- conflicting Timeweb AAAA удалён;
- GitHub Pages DNS check green;
- certificate installed;
- `Enforce HTTPS` enabled;
- `www → apex` redirect working;
- strict custom deployment and production smoke passed;
- RU canonical `https://trueruslan.ru/`;
- EN canonical `https://trueruslan.ru/en/`;
- one Cloudflare analytics beacon on RU and EN;
- initial provider telemetry observed.

Rollback сохраняется через legacy Pages transport without changing canonical public identity.

Отдельный SSL-сертификат Timeweb не используется и не нужен.

---

## 6. Known problems / debt

- Latest Pages deployment после PR #59 нужно подтвердить отдельно от feature CI.
- Owner production visual acceptance Vlezet page остаётся отдельным operational fact.
- Cloudflare sample всё ещё недостаточен для audience/product conclusions; нужен реальный distribution window 3–4 недели.
- GitHub profile Website, Habr, Telegram и другие external surfaces требуют ручного обновления, если ещё не обновлены.
- First genuine Photo Story зависит от authentic material.
- Vlezet M7.8B recognition не принят; feature page намеренно показывает failure boundary.
- `/now` после последних изменений Vlezet/VillAIgence требует content sync.
- VillAIgence пока не имеет столь же глубокого flagship case study на landing.

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
- реальные release acceptance failures, включая water navigation и tombstone behavior, без превращения partial PASS в broad release claim.

После VillAIgence:

1. обновить `/now`;
2. выпустить 1–2 grounded Engineering Notes;
3. добавить первую genuine Photo Story при готовом материале;
4. вручную завершить external-profile rollout;
5. распространять сайт и собирать aggregate telemetry 3–4 недели;
6. выбирать дальнейший RU/EN/content/product milestone по evidence.

Яндекс.Метрика остаётся conditional: только если Cloudflare систематически не даёт нужного российского signal и оправдан отдельный consent/privacy layer.

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
- one RU/EN site/build/search architecture;
- optional aggregate analytics only;
- no behavioural tracking без privacy review;
- no weakening quality gates ради скорости.

---

## 9. Как восстановить контекст

> Открой в `True-Ruslan/trueruslan-landing` файлы `docs/PROJECT_STATE.md`, `docs/ROADMAP.md`, `docs/CHANGELOG.md` и `docs/CUSTOM_DOMAIN.md`. Затем проверь actual open PR, latest commits и exact-head CI. Отдельно проверь latest Pages deployment reports, HTTPS/redirect state, active custom site/analytics contracts, Vlezet production page и Cloudflare telemetry для `trueruslan.ru`.
