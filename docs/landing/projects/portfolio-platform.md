# TrueRuslan Landing — static-first engineering portfolio platform

**TrueRuslan Landing** — production-платформа, на которой опубликованы это портфолио, web-CV, case studies, Engineering Notes, Publications, Sources Knowledge Base и связанные evidence-срезы.

[Открыть репозиторий на GitHub ↗](https://github.com/True-Ruslan/trueruslan-landing)


<div data-tr-project-timeline="portfolio-platform"></div>

## Коротко

<dl class="tr-project-glance" data-tr-project-glance="portfolio-platform">
<dt>Моя роль</dt>
<dd>Product, architecture и quality ownership всего static-first портфолио и knowledge layer.</dd>
<dt>Стек</dt>
<dd>Diplodoc · Node.js · Playwright · GitHub Actions · GitHub Pages</dd>
<dt>Задача</dt>
<dd>Показывать инженерное мышление и доказательства без превращения сайта в тяжёлое приложение или набор дублирующихся источников истины.</dd>
<dt>Результат</dt>
<dd>Production static-first платформа с registry-backed контентом, clean URLs, RU/EN и deployment-bound browser verification.</dd>
<dt>Статус</dt>
<dd><span data-tr-project-status="portfolio-platform"></span></dd>
</dl>

<!-- case-study:problem -->
## Проблема: портфолио должно показывать инженерное мышление, а не только список технологий

Обычная страница-портфолио быстро превращается в набор карточек, навыков и ссылок. Она может выглядеть аккуратно, но почти не отвечает на важные вопросы:

- какую проблему решал проект;
- где проходила граница доверия;
- какие решения были отвергнуты;
- что действительно проверено;
- чем repository readiness отличается от опубликованного production;
- какие ограничения остаются после зелёного CI.

Для меня сайт должен был стать не рекламной витриной, а проверяемым инженерным контекстом. Поэтому проекты, текущий статус, заметки и публикации связаны между собой, а незавершённая работа не получает автоматически положительный публичный статус.

Главный принцип:

> Публичное утверждение должно иметь ограниченный scope и указывать, на каком уровне оно подтверждено: source, generated artifact, deployment, live browser или внешняя приёмка.

<!-- case-study:constraints -->
## Ограничения, которые определили архитектуру

### Контент должен оставаться полезным без JavaScript

Core-страницы генерируются как semantic HTML. JavaScript улучшает поиск, фильтры, lightbox, диаграммы и command palette, но не владеет основным текстом.

### Один источник истины на каждый тип данных

Проекты, evidence, timeline, `/now`, Notes, Publications, Sources, metadata и RU/EN pairing хранятся в отдельных canonical registries. Build-time generators используют эти данные повторно вместо ручного копирования статусов в нескольких страницах.

### GitHub Pages не является application runtime

Хостинг раздаёт статический artifact. В проекте нет backend, runtime API, базы данных, аккаунтов или server-side CMS. Любая функция должна либо генерироваться заранее, либо корректно деградировать до обычной ссылки и HTML.

### Поиск должен иметь одного владельца

Diplodoc search extension остаётся единственным site-wide full-text search owner. Sources filters, command palette и page-local controls не создают второй поиск и не поддерживают параллельный индекс.

### Privacy нельзя расширять незаметно

Cloudflare Web Analytics используется только как optional aggregate telemetry. Нет cookies, session replay, fingerprinting, advertising profiling, custom user identifiers или behavioural event stream.

### RU и EN не должны стать двумя платформами

Русская версия остаётся полной. Английский слой расширяется выборочно через один build, один search architecture и общие registries. Русские fallback-ссылки маркируются явно.

<!-- case-study:current-state -->
## Текущая production-граница

Платформа работает на canonical domain `https://trueruslan.ru` и публикуется через GitHub Pages.

Принятый публичный контур включает:

- standalone RU/EN homepage;
- Diplodoc knowledge pages;
- RU/EN Resume и downloadable PDF;
- Project Registry, Project Evidence и timelines;
- `/now`;
- Engineering Notes и Atom feed;
- Publications;
- Engineering Map;
- generated local search;
- Photo Stories foundation;
- Sources Knowledge Base;
- canonical metadata, Sitemap, hreflang и OpenGraph;
- privacy-friendly aggregate analytics;
- post-deployment Production Live Smoke.

Публичные страницы используют repository-native directory routes:

```text
/
/projects/
/projects/portfolio-platform/
/resume/
/notes/
/en/
/en/projects/portfolio-platform/
/_search/ru/
```

Legacy `.html` остаётся только compatibility entrypoint с `noindex,follow`, clean canonical, meta refresh и `location.replace`, сохраняющим query и fragment. GitHub Pages не позволяет задать repository-configured HTTP 301, поэтому этот слой не выдаётся за настоящий server redirect.

<!-- case-study:decisions -->
## Архитектура и ключевые решения

### Standalone homepage отделён от knowledge runtime

Главная страница собирается отдельным минимальным renderer и не загружает Diplodoc runtime bundle. Knowledge pages остаются в Diplodoc и получают общий header, search, metadata и content enhancements.

```text
canonical registries
        ↓
Diplodoc build + standalone renderer
        ↓
build-time post-processing
        ↓
clean URL artifact + search + metadata + feed
        ↓
GitHub Pages deployment
        ↓
deployment-driven Production Live Smoke
```

Так presentation layer может оставаться быстрым, а документационный слой — структурированным и расширяемым.

### Build-time intelligence вместо runtime backend

После `yfm` выполняется детерминированный post-processing:

- копирование assets;
- Project Registry и Evidence injection;
- timelines и `/now`;
- Publications и Sources rendering;
- metadata, canonical, hreflang и OG cards;
- Atom feed и Sitemap;
- analytics policy;
- directory-route publication;
- legacy compatibility pages.

Ошибки отсутствующих placeholders, неизвестных ссылок, unsafe URLs или несогласованных registries завершают build fail-closed.

### Clean URLs принадлежат repository artifact

PR #114 создаёт `index.html` внутри directory routes и переписывает внутренние, search, canonical, Sitemap и feed ссылки. Cloudflare Rewrite Rules или Worker больше не являются частью обязательного routing contract.

Cloudflare остаётся допустимым DNS/CDN и analytics layer, но сайт должен корректно собираться и работать на уровне репозитория и GitHub Pages без Cloudflare-specific application logic.

### Evidence разделено по уровням

Release-решение не опирается на один зелёный check:

1. unit и registry contracts;
2. generated-site integrity;
3. Chromium accessibility и Lighthouse;
4. Firefox/WebKit compatibility;
5. search, RU/EN, metadata и analytics smokes;
6. visual regression;
7. custom-domain artifact verification;
8. GitHub Pages deployment identity;
9. Production Live Smoke против опубликованного SHA.

Exact artifact и deployed production остаются разными доказательствами.

### Public truth не изменяется автоматически

Freshness workflows, GitHub probes и external-profile audits создают evidence и findings, но не переписывают project status, Resume, публикации или публичные claims без review.

<!-- case-study:alternatives -->
## Рассмотренные и отвергнутые альтернативы

### Runtime CMS или собственный backend

Отвергнуты, потому что текущий контент versioned, reviewable и естественно хранится рядом с кодом. Backend добавил бы authentication, persistence, deployment и security surface без доказанной пользовательской необходимости.

### Второй поиск для отдельных разделов

Отвергнут. Sources Knowledge Base использует page-local filtering, а command palette — фиксированные действия и handoff в canonical search. Отдельный индекс создавал бы drift и разные результаты для одного сайта.

### Cloudflare Worker как обязательный clean URL router

Рассматривался, но repository-native directory artifact оказался проще и воспроизводимее. Worker создавал бы вторую operational truth вне pull request и GitHub Pages deployment.

### Автоматическое обновление публичных статусов

Отвергнуто. Новый PR, release или зелёный workflow может означать activity, но не обязательно product acceptance. Автоматизация имеет право сообщить о drift, а не расширить claim.

### Поведенческая аналитика и session replay

Отвергнуты из-за несоразмерного privacy cost. Aggregate page-level telemetry достаточно для текущего этапа, а малый объём данных не используется для сильных продуктовых выводов.

<!-- case-study:evidence -->
## Что подтверждено

<div data-tr-project-evidence="portfolio-platform"></div>

Evidence snapshot разделяет:

- PR #114 как repository route contract;
- Build #836 как exact-head repository/generated-artifact proof;
- Pages #147 как publication identity;
- Production Live Smoke #58 как deployed browser proof.

Эти сигналы не подтверждают рост аудитории, качество поискового ранжирования, мгновенную переиндексацию или полезность каждой страницы для каждого читателя.

<!-- case-study:limitations -->
## Известные ограничения

- GitHub Pages не даёт настроить настоящий HTTP 301 из репозитория; legacy `.html` использует статическую compatibility page.
- Search-console состояние обновляется внешними crawler и не синхронизируется мгновенно с deployment.
- Английский слой намеренно неполный и расширяется только для наиболее ценных страниц.
- PDF проверяется структурно и пассивно; semantic extraction не симулируется raw-byte поиском.
- Cloudflare telemetry агрегированная и пока недостаточна для широких engagement-выводов.
- Static-first architecture не подходит для accounts, comments или user-generated content без отдельного product decision.
- Сложность build-time contracts требует поддерживать тесты и durable state вместе с развитием контента.

<!-- case-study:next -->
## Следующий принятый шаг

После P3.2 следующий slice — **P3.3 Flagship normalization**.

VillAIgence и Vlezet должны получить тот же расширенный порядок: problem, constraints, accepted boundary, architecture, rejected alternatives, evidence, limitations, next step и related content. При этом:

- VillAIgence не повышается выше `ACCEPTANCE IN PROGRESS` без cumulative manual acceptance;
- Vlezet M7.8C не становится принятым до exact-head automation и повторного real-plan owner test;
- существующие ссылки и stable identities сохраняются.

<!-- case-study:related -->
## Связанные материалы

- [Почему landing page отделён от Diplodoc runtime →](../notes/portfolio-runtime-boundary.md)
- [Quality gates для статического инженерного сайта →](../notes/static-site-quality-gates.md)
- [Почему green CI не означает verified product →](../notes/green-ci-is-not-product-verification.md)
- [Engineering Notes →](../notes.md)
- [Публикации →](../publications.md)
- [Исходный код ↗](https://github.com/True-Ruslan/trueruslan-landing)

<!-- case-study:retrospective -->
## Что бы я сделал иначе

Я бы раньше разделил четыре понятия: source change, generated artifact, deployment и live acceptance. Большинство ложных сигналов возникало не из-за отсутствия тестов, а из-за слишком широкого смысла слова «готово».

Clean URL contract также стоило определить до подключения custom domain: directory routes, canonical identity и legacy compatibility проще поддерживать, когда они принадлежат repository artifact с первого дня.

Но главный вывод остаётся прежним: даже статический сайт становится инженерной системой, когда его публичные утверждения, routes, content graph и deployment должны оставаться согласованными через десятки изменений.
