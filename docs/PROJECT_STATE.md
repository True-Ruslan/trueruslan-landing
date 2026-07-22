# PROJECT STATE — TrueRuslan Landing

> Последнее смысловое обновление: **2026-07-22**.
>
> Этот файл — главный источник ответа на вопрос **«что сейчас представляет собой проект и в каком он состоянии?»**. Для полного восстановления контекста нового чата читать в порядке:
>
> 1. `docs/PROJECT_STATE.md`
> 2. `docs/ROADMAP.md`
> 3. `docs/CHANGELOG.md`

## 1. Что это за проект

`True-Ruslan/trueruslan-landing` — персональное инженерное портфолио Руслана Немыкина. Это не просто landing page: проект постепенно превратился в статическую персональную engineering-платформу, где соединены:

- лёгкая standalone-главная;
- технические и личные knowledge pages на Diplodoc;
- web-CV;
- case studies реальных проектов;
- живая страница `/now`;
- Engineering Notes и Atom feed;
- интерактивная Engineering Map;
- локальный полнотекстовый поиск;
- Photo Stories / личный визуальный архив;
- SEO/OpenGraph/JSON-LD;
- production-oriented quality gates и post-deploy проверки.

Главная продуктовая идея: сайт должен показывать не только **«кто я»**, но и **«что я создаю → что изучаю → какие инженерные выводы получаю»**.

Публичный тон контента — от первого лица: спокойный, живой, технически точный, ближе к личному инженерному дневнику, чем к корпоративному лендингу.

## 2. Текущее состояние на 2026-07-22

### В `master`

Последний крупный продуктовый milestone — **Photo Stories**, merged через PR #15 (`feat: build cinematic photo stories archive`), squash commit `8aa2149fc8aec3751f2da73321c06a89111f9efd`.

До него в `master` уже вошли:

- v0.3 living engineering portfolio foundation;
- Project Registry;
- `/now`;
- project timelines;
- Engineering Notes + Atom;
- Engineering Map;
- локальный search и его редизайн;
- Cmd/Ctrl+K command palette;
- детерминированные OpenGraph-карточки;
- web-CV;
- flagship case studies;
- многоуровневые CI/browser/accessibility/visual quality gates.

### Сейчас в работе

Открыт **draft PR #17** — `fix: polish Photo Stories mobile hero and QA evidence`.

Цель PR #17:

- добавить browser assertion, что заголовок hero на мобильном не выходит за viewport;
- гарантировать загрузку lazy archive images перед screenshot evidence;
- затем аккуратно исправить mobile hero sizing, не ослабляя overflow gates;
- почистить мелкие post-merge leftovers Photo Stories.

Head на момент фиксации этого state: `531bd059d5a91497328dd4adcf8ffc40c104e147`.

**CI Build run #195 прошёл успешно** на этом head. PR остаётся draft и требует финального визуального просмотра/завершения перед merge.

### Важно про production

CI подтверждает корректность repository/build artifact. Не следует автоматически считать, что публичный GitHub Pages endpoint уже соответствует последнему `master`, пока это отдельно не проверено через production smoke или вручную.

## 3. Архитектура

Ключевой принцип, который нельзя ломать без отдельного осознанного решения:

**static-first + build-time intelligence + progressive enhancement**.

### 3.1 Standalone homepage

`templates/index.html`

- отдельная лёгкая корневая страница;
- не тянет тяжёлый Diplodoc/React viewer runtime;
- получает project state build-time из canonical registry;
- использует собственный визуальный слой и progressive vanilla JS.

### 3.2 Diplodoc knowledge pages

`docs/landing/**/*.md`

Используются для:

- About;
- Projects и case studies;
- Resume/web-CV;
- `/now`;
- Engineering Notes;
- Engineering Map;
- bibliography;
- contacts и других структурированных страниц.

Diplodoc также остаётся владельцем локального полнотекстового search index.

### 3.3 Canonical data

Основные hand-maintained источники истины находятся в `data/`:

- `projects.json` — identity/status/summary/links/tags/active state проектов;
- `project-history/*.json` — structured timelines flagship-проектов;
- `now.json` — только focus/learning/writing, без дублирования project state;
- `notes.json` — metadata и связи Engineering Notes;
- `engineering-graph.json` — данные Engineering Map;
- `page-meta.json` — SEO/social metadata;
- `photo-albums.json` — canonical registry Photo Stories albums;
- `photo-archive.json` — одиночные архивные фотографии;
- `external-links.json` — внешние/public endpoints для monitoring.

### 3.4 Build-time post-processing

Основная граница — `scripts/copy-assets.js` и специализированные build-time модули.

Pipeline после Diplodoc build:

1. нормализует assets и local search;
2. генерирует standalone homepage;
3. валидирует Project Registry и инъектирует статусы;
4. собирает `/now`;
5. генерирует project timelines;
6. дополняет Engineering Notes metadata/navigation и строит Atom feed;
7. инъектирует Engineering Map semantic fallback + state payload;
8. генерирует deterministic OpenGraph PNG;
9. инъектирует title/description/canonical/OG/Twitter/JSON-LD;
10. генерирует `robots.txt`, `sitemap.xml`, `.nojekyll`;
11. строит Photo Stories routes и legacy compatibility bridge;
12. выполняет generated-site integrity checks.

Core content должен оставаться доступным без JavaScript. JavaScript добавляет удобство и интерактивность, но не является единственным способом получить содержание.

## 4. Что уже реализовано

### 4.1 Визуальная и контентная основа

- dark-first graphite/cyan/violet engineering identity;
- standalone homepage вместо тяжёлой корневой Diplodoc page;
- адаптивный layout;
- keyboard focus и `prefers-reduced-motion`;
- progressive reveal/interaction layers;
- весь публичный текст приведён к единому спокойному голосу от первого лица.

### 4.2 Projects и доверие к фактам

- Projects hub;
- canonical `data/projects.json`;
- LivingWorld flagship case study;
- NODE ZERO flagship case study с сохранением private/proprietary boundary;
- TaskHub, MiniChess, Godot Atmospheric Horror Template case studies;
- project status badges из одного source of truth;
- structured timelines LivingWorld и NODE ZERO;
- инженерные SVG-диаграммы.

### 4.3 `/now`

Отдельная живая страница:

- active projects берутся из Project Registry;
- focus/learning/writing — из `data/now.json`;
- project status нигде не дублируется вручную.

### 4.4 Engineering Notes

Сейчас есть минимум три базовые заметки:

- runtime boundary standalone landing vs Diplodoc;
- quality gates статического инженерного сайта;
- server-authoritative AI NPC architecture.

Реализованы:

- dates;
- reading time;
- tags;
- related notes;
- previous/next navigation;
- deterministic Atom `feed.xml`.

### 4.5 Engineering Map

Data-driven интерактивная карта:

- technologies → domains → projects → notes;
- strict validation;
- semantic no-JS fallback;
- filters и highlighting через progressive vanilla JS;
- responsive/mobile presentation;
- отдельные Axe/browser tests.

### 4.6 Search и navigation

- Diplodoc local search сохранён как единственный full-text engine;
- search снова доступен из явной навигации;
- search page визуально приведена к общему стилю проекта;
- Cmd/Ctrl+K command palette обеспечивает быстрые переходы;
- command palette не создаёт второй search index.

### 4.7 Resume

- first-class web-CV;
- deployment-safe embedded PDF;
- fallback/download link;
- корректная работа root-domain и GitHub Pages subpath scenarios.

### 4.8 SEO / sharing

- sitemap;
- robots.txt;
- canonical URLs;
- page-specific title/description;
- OpenGraph/Twitter metadata;
- JSON-LD;
- deterministic 1200×630 PNG social cards без внешнего image service.

### 4.9 Photo Stories

В `master` уже есть полноценная платформа фотоисторий:

- canonical `/photos/`;
- `data/photo-albums.json`;
- `data/photo-archive.json`;
- хронологическая модель albums;
- отдельные `/photos/<slug>/` pages;
- cinematic hero;
- editorial layout types (`wide`, `portrait`, `pair`, `triptych`, `standard`);
- fullscreen lightbox;
- keyboard navigation;
- touch/swipe support;
- focus restoration;
- hash deep links на отдельный кадр;
- category filters как progressive enhancement;
- legacy `/landing/photos.html` compatibility bridge;
- navigation/search/sitemap/metadata integration;
- build-time validation;
- dedicated browser smoke.

**Production albums intentionally отсутствуют:** `photo-albums.json` остаётся пустым до появления реальной связной фотосерии. Никаких fake/demo albums в `master`.

Текущие реальные одиночные кадры сохранены в блоке **«Из архива»**:

- Семихатов;
- защита магистерской;
- avatar/портрет.

## 5. Quality gates

Проект сознательно использует проверку финального generated artifact, а не только source code.

Основные gates:

- `npm test` unit/contract tests;
- production Diplodoc build;
- generated-site integrity;
- broken local links/assets/OG targets checks;
- mobile overflow smoke;
- Chromium browser smoke;
- Axe accessibility;
- Lighthouse budgets;
- Firefox/WebKit compatibility smoke;
- local search browser smoke;
- metadata/OpenGraph smoke;
- Engineering Map smoke;
- Photo Stories browser smoke;
- perceptual visual regression;
- post-deploy Pages smoke;
- weekly external/public endpoint monitoring.

После Photo Stories workflow также сохраняет `test.log` в quality artifacts для диагностики упавших unit tests.

## 6. Архитектурные решения, которые считаются намеренными

Без отдельного нового design decision **не следует** добавлять:

- backend;
- CMS;
- database;
- runtime GitHub API;
- SPA/frontend framework ради самого framework;
- runtime content fetch для core content;
- второй full-text search engine;
- social mechanics (likes/comments/accounts);
- AI-chat по резюме как gimmick.

Предпочтение:

- version-controlled JSON registries;
- deterministic build-time generation;
- semantic HTML;
- progressive vanilla JS;
- реальное evidence вместо декоративных claims.

## 7. Известные незавершённые части / технический долг

### Прямо сейчас

1. Завершить и при подтверждении визуального результата merge PR #17.
2. После merge проверить actual production deployment `/photos/` и smoke публичного endpoint.

### Photo Stories content

- нет первого настоящего album/story — архитектура готова, контента пока нет;
- следующий album должен состоять из реальной связной серии фотографий, а не демонстрационного filler.

### Content / knowledge

- bibliography пока остаётся большой фактической Markdown-таблицей;
- ещё не реализован structured Sources Knowledge Base;
- Engineering Notes пока мало относительно объёма реальной инженерной работы.

### Evidence / freshness

- project pages пока не имеют полноценного автоматизированного evidence layer (`last verified`, last green CI, release/version snapshot);
- нет content freshness guard, который выявляет устаревшие hand-maintained claims.

### Quality architecture

- browser QA scripts исторически разрослись в несколько отдельных smoke runners;
- рекомендуется общий `quality-harness`, чтобы новые feature-smokes не дублировали server/browser lifecycle.

### Metadata debt

`package.json` всё ещё исторически содержит:

- version `0.2.0`;
- description `Многостраничный лендинг TrueRuslan`.

Это уже не соответствует фактической engineering portfolio / knowledge platform и должно быть исправлено в одном из ближайших maintenance PR.

### Отложено осознанно

- custom domain и платный hosting;
- privacy-friendly analytics;
- частичный RU/EN;
- richer architecture explorer;
- более глубокая автоматизация GitHub activity snapshots.

## 8. Главный следующий продуктовый этап

Рабочее название следующего крупного этапа:

**Portfolio v0.4 — Knowledge & Evidence**.

Его смысл: сделать видимыми не только проекты, но и доказательства реальной инженерной работы и карту того, что изучается.

Приоритетная связка:

**что я создаю → что я изучаю → какие выводы делаю → чем это подтверждено**.

Подробности: `docs/ROADMAP.md`.

## 9. Как восстановить контекст в новом чате

Оптимальный стартовый запрос:

> Открой в `True-Ruslan/trueruslan-landing` файлы `docs/PROJECT_STATE.md`, `docs/ROADMAP.md` и `docs/CHANGELOG.md`. Затем проверь актуальные open PR и последние CI. Расскажи, что уже реализовано, что сейчас в работе, что изменилось после последнего state update и что оптимально делать следующим.

Важно: state-файл — snapshot на дату обновления. Для ответа о **текущем** состоянии всегда дополнительно проверять open PR, последние commits и CI, потому что они могут измениться после записи документа.
