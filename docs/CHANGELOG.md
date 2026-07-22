# CHANGELOG — TrueRuslan Landing

> Обновлено: **2026-07-22**.
>
> Это не машинный список коммитов. Здесь фиксируются **смысловые этапы проекта**: что сделали, зачем, как именно и чем подтвердили результат.
>
> Текущее состояние — `docs/PROJECT_STATE.md`. Дальнейший план — `docs/ROADMAP.md`.

---

# 2026-07-22

## Photo Stories — личный визуальный архив как полноценная система

**PR #15 — `feat: build cinematic photo stories archive`**  
Merged: 2026-07-22  
Squash commit: `8aa2149fc8aec3751f2da73321c06a89111f9efd`

### Зачем

Старый раздел «Фото» был простой Markdown-страницей с тремя изображениями и визуально/концептуально сильно уступал остальному сайту.

Цель: сделать не соцсеть и не бездумную gallery grid, а личный визуальный дневник, где **одна история = один album**, а отдельные кадры остаются частью спокойного архива.

### Что сделали

- добавили canonical `/photos/`;
- создали `data/photo-albums.json` и `data/photo-archive.json`;
- заложили хронологическую модель Photo Stories;
- добавили отдельные `/photos/<slug>/` pages;
- cinematic hero;
- editorial layouts: `wide`, `portrait`, `pair`, `triptych`, `standard`;
- fullscreen lightbox;
- keyboard navigation и `Esc`;
- touch/swipe;
- focus trap/restoration;
- hash deep links на конкретные фотографии;
- category filters как progressive enhancement;
- legacy `/landing/photos.html` compatibility bridge;
- integration с navigation, Cmd/Ctrl+K, search, sitemap, metadata/OG;
- build-time validation данных и image references;
- dedicated Photo Stories browser smoke.

### Архитектурное решение

Photo Stories продолжает общий принцип проекта:

**static-first + build-time intelligence + progressive enhancement**.

Без JS основной content и фотографии доступны. JS добавляет lightbox, filters и navigation convenience.

### Контентное решение

`photo-albums.json` намеренно оставлен пустым до появления первой настоящей связной фотосерии.

Три существующих реальных кадра оставлены в `Из архива`:

- Семихатов;
- защита магистерской;
- avatar/портрет.

Fake/demo albums сознательно не добавлялись.

### Проверка

Build run #191 прошёл полностью: tests, production build, site-integrity, mobile overflow, Chromium/Axe/Lighthouse, Photo Stories smoke, Firefox/WebKit, search, metadata/OG, Engineering Map и visual regression.

Также CI начал сохранять `test.log` в quality artifacts для диагностики unit-test failures.

---

## Post-merge Photo Stories polish

**PR #17 — `fix: polish Photo Stories mobile hero and QA evidence`**  
Status на момент обновления changelog: **open draft**.

### Почему появился

После визуального просмотра green quality artifacts обнаружили необходимость усилить проверку мобильного hero и screenshot evidence.

### Что находится в PR

- browser assertion, что `.tr-photo-index-hero h1` физически помещается в viewport;
- ожидание полной загрузки трёх lazy archive images перед screenshot;
- дополнительные diagnostics geometry в smoke output.

### Проверка

Head `531bd059d5a91497328dd4adcf8ffc40c104e147` прошёл **Build run #195 successfully**.

Следующий шаг — финальный visual review и merge при корректном результате.

---

## Bibliography disappearing table regression

**PR #14 — `fix: keep bibliography table visible after hydration`**  
Merged: 2026-07-22.

### Проблема

На странице «Список изученных источников» таблица сначала появлялась, затем исчезала. После перехода в fullscreen и обратно становилась видимой.

### Root cause

`setupReveal()` добавлял `.tr-reveal` с `opacity: 0` на очень высокую таблицу и использовал `IntersectionObserver threshold: 0.08`.

На обычном viewport одновременно было видно меньше 8% общей высоты таблицы, поэтому observer не переводил элемент в visible state. Fullscreen увеличивал intersection ratio — отсюда странный симптом.

### Исправление

- reveal activation сделали независимой от общей высоты элемента;
- threshold изменён на `0` с сохранением root margin;
- добавлен browser regression test на normal viewport без resize/fullscreen;
- smoke проверяет, что таблица после hydration реально видима.

### Зачем важно

Этот incident стал хорошим примером принципа проекта: визуальные enhancement layers не должны иметь возможность скрыть core content навсегда.

---

## Portfolio v0.3 — living engineering space

**PR #13 — `feat: evolve portfolio into a living engineering space`**  
Merged: 2026-07-22.  
Squash commit: `b472aff67d69fb3cd6afa0577864371547f52a5b`

### Зачем

До v0.3 сайт уже выглядел как сильное portfolio, но project state и content evolution были местами разрозненными. Нужно было превратить сайт в живую engineering-платформу с единым source of truth.

### Что сделали

#### Canonical Project Registry

- `data/projects.json` стал единственным hand-maintained project identity/status source;
- удалён дублирующий `currently-building.json`;
- homepage, `/now`, Projects hub и Engineering Map используют registry-derived project state.

#### `/now`

- отдельная first-class page;
- active projects/statuses берутся из registry;
- `data/now.json` хранит только focus/learning/writing.

#### Structured project timelines

- LivingWorld;
- NODE ZERO;
- semantic build-time rendering.

#### Engineering Notes maturity

- published/updated dates;
- reading time;
- tags;
- related/previous/next;
- deterministic Atom `feed.xml`.

#### Global command palette

- Cmd/Ctrl+K;
- `/` shortcut вне editable controls;
- быстрые destinations;
- handoff к существующему Diplodoc local search вместо второго search engine.

### Архитектура

Без backend/CMS/database/runtime GitHub API/frontend framework. Всё осталось build-time/static-first.

### CI incident

Первый visual regression run упал из-за некорректного zlib encoding новых baseline payloads. Baselines были переупакованы корректно, после чего Build run #163 прошёл полностью.

---

# 2026-07-21

## Единый личный голос сайта

**PR #12 — `content: rewrite site in a personal engineering diary voice`**  
Merged: 2026-07-21.

### Зачем

Технически сайт был сильным, но часть текста звучала как product brochure/README. Было принято решение сделать его личнее, но без эмоционального маркетинга.

### Что переписали

- homepage;
- About;
- Projects hub;
- LivingWorld/NODE ZERO/TaskHub/MiniChess/Godot pages;
- Engineering Map framing;
- Engineering Notes hub и заметки;
- Resume narrative framing;
- Photos;
- Contacts.

### Новый editorial principle

Текст должен звучать как спокойный инженерный дневник от первого лица:

- что я делаю;
- почему;
- что оказалось сложнее;
- какие решения принял;
- что уже доказано;
- что ещё не закончено.

Bibliography оставили фактической рабочей базой, без искусственной персонализации.

---

# 2026-07-20 — основная трансформация проекта

Этот день сформировал почти всю текущую инженерную основу сайта.

## Production hardening foundation

**PR #1 — `harden landing build, deploy, and production serving`**

### Зачем

Исходный проект имел риски рассинхронизации dev/prod build, небезопасного deploy trigger и caching/security inconsistencies.

### Что сделали

- dev rebuild приведён к production post-processing behavior;
- расширены sitemap/post-processing tests;
- Pages deploy ограничен `master`;
- hardened CI permissions/timeouts/checkout credentials;
- nginx security/cache behavior исправлен;
- resume typo/PDF iframe улучшены.

Это заложило принцип: **production build должен быть детерминированным и тестируемым**.

---

## Полный visual redesign engineering portfolio

**PR #3 — `feat: redesign landing as an engineering portfolio`**

> PR #2 был промежуточной/дублирующей веткой redesign и не был merged; чистая версия была пересоздана как PR #3.

### Зачем

Перевести сайт из состояния обычной документационной страницы в узнаваемое инженерное portfolio.

### Что сделали

- graphite/cyan/violet dark-first theme;
- custom CSS/JS через поддерживаемые Diplodoc resources;
- ambient grid/glows;
- sticky translucent navigation;
- restrained terminal accent;
- responsive polish;
- homepage позиционирование `Backend Engineer · Java · Distributed Systems · AI`;
- Projects/About/Contacts переработаны под portfolio identity.

### Ограничения

- no animation framework;
- no webfont dependency;
- no Diplodoc fork;
- JS только progressive enhancement.

---

## Deployment-safe Resume PDF

**PR #4 — `fix: make embedded resume PDF deployment-safe`**

### Проблема

Raw relative iframe URL был хрупким между root domain и GitHub Pages project subpath.

### Что сделали

- URL PDF вычисляется относительно actual `window.location.href`;
- iframe и download link hydrates safely;
- no-JS fallback;
- regression tests root + `/trueruslan-landing/` deployment.

---

## Production quality gates + portfolio case studies

**PR #5 — `feat: add production quality gates and portfolio case studies`**

### Зачем

Проверять не только source code, а реальный generated site artifact.

### Что добавили

- generated-site integrity;
- broken local references checks;
- desktop/mobile browser smoke;
- page errors/network failure checks;
- horizontal overflow checks;
- PDF HTTP/content-type verification;
- Axe serious/critical blocking;
- Lighthouse budgets;
- screenshots/reports as quality artifacts;
- visual regression foundation;
- richer Projects hub;
- TaskHub, MiniChess, Godot case studies;
- web-CV как first-class page.

### Quality thresholds

- Performance >= 85;
- Accessibility >= 95;
- Best Practices >= 95;
- SEO >= 95.

---

## Production reliability / external monitoring

**PR #6 — `chore: harden production reliability`**

### Что добавили

- post-deploy GitHub Pages smoke;
- weekly public endpoint monitoring;
- Firefox/WebKit compatibility smoke;
- current Pages metadata handling;
- licensing/content-policy cleanup.

### Зачем

CI green до deploy недостаточно: проект должен также проверять фактический production endpoint и внешние зависимости.

---

## Flagship projects + live project state

**PR #7 — `feat: add flagship case studies and live project status`**

### Что сделали

- первый structured manifest active projects (`currently-building.json`, позже заменён Project Registry);
- homepage active project cards build-time;
- LivingWorld flagship case study;
- NODE ZERO flagship case study;
- accessible dependency-free architecture SVG;
- Projects navigation/discovery.

### Почему важно

Сайт начал показывать текущую реальную инженерную работу, а не только завершённые pet projects.

---

## Engineering Notes + deterministic OpenGraph

**PR #8 — `feat: add Engineering Notes and deterministic social previews`**

### Что сделали

- first-class Engineering Notes;
- три первые grounded technical notes;
- `data/page-meta.json`;
- deterministic 1200×630 OpenGraph PNG renderer на Node.js;
- canonical/OG/Twitter metadata injection;
- metadata browser smoke;
- более глубокие LivingWorld/NODE ZERO diagrams.

### Архитектурное решение

OG generation не использует внешний image API или browser renderer. PNG кодируется deterministic build-time средствами Node.js.

---

## Interactive Engineering Map

**PR #9 — `feat: add interactive Engineering Map signature experience`**

### Что сделали

- `data/engineering-graph.json`;
- technologies/domains/projects/notes graph;
- strict validation;
- semantic fallback;
- progressive filters/highlighting/details;
- mobile card fallback;
- dedicated Axe/browser smoke.

### Почему

Сделать инженерный профиль пользователя понятным как систему связей, а не просто длинный список технологий.

---

## Search discoverability regression

**PR #10 — `fix: restore discoverable site search`**

### Проблема

Сам Diplodoc local search не исчезал. После перехода root page на standalone homepage пропала явная точка входа в search.

### Решение

- вернули `Поиск` в homepage navigation;
- добавили search в shared Diplodoc navigation;
- не создавали второй search engine;
- regression test защищает обе navigation surfaces.

---

## Search visual redesign

**PR #11 — `feat: redesign local search to match engineering portfolio`**

### Что сделали

- search-specific `search.css`;
- progressive `search-ui.js`;
- semantic/accessibility enhancements;
- keyboard shortcuts;
- desktop/mobile/Axe/overflow smoke.

### Архитектура

Diplodoc по-прежнему отвечает за index/query/results. Custom layer отвечает только за presentation/progressive UX.

---

# Служебные PR, которые не являются продуктовым milestone

## PR #16

`chore: placeholder (closed)` — открыт случайно со старой squash-merged feature branch и сразу закрыт. **Ничего из него не нужно считать отдельной продуктовой работой.**

## PR #2

Первоначальная redesign branch. Не merged; работа была чисто пересобрана и вошла через PR #3.

---

# Состояние после этого changelog

Основная платформа уже построена. Главные незавершённые направления:

1. закончить PR #17;
2. добавить первую реальную Photo Story;
3. начать v0.4 `Knowledge & Evidence`;
4. Sources Knowledge Base;
5. Project Evidence Layer;
6. новые grounded Engineering Notes;
7. Content Freshness Guard;
8. consolidation quality harness;
9. metadata/version cleanup;
10. minimal EN / analytics / domain — позже.

Подробный порядок: `docs/ROADMAP.md`.
