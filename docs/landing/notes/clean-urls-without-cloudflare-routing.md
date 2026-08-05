# Как clean URLs заработали на GitHub Pages без Cloudflare routing

Изначально публичные страницы TrueRuslan Landing имели прямую файловую identity:

```text
/landing/resume.html
/landing/projects/vlezet.html
/landing/notes/static-site-quality-gates.html
```

Для статической сборки это естественный результат: Diplodoc создаёт HTML-файлы, а GitHub Pages отдаёт их как опубликованные assets. Но файловая структура generated artifact не обязана становиться окончательным публичным URL-контрактом.

После миграции те же страницы стали доступны как repository-native directory URLs:

```text
/landing/resume/
/landing/projects/vlezet/
/landing/notes/static-site-quality-gates/
```

Для этого не понадобились Cloudflare Workers, Redirect Rules или отдельный application router. Clean route обслуживается обычным `index.html` внутри соответствующего каталога.

Главная формула этой заметки:

```text
clean URLs без Cloudflare routing
= directory artifact
+ единая public identity
+ статическая legacy compatibility
+ отдельная production verification
```

Связанный case study: [TrueRuslan Landing — Static-First Portfolio Platform](../projects/portfolio-platform.md).

Связанная заметка: [Почему успешный deployment ещё не означает production verification](deployment-success-is-not-production-verification.md).

## Границы утверждений

- **Проверенный факт.** PR #114 сформировал repository-native directory URLs, синхронизировал публичные URL-представления и оставил legacy `.html` как статические compatibility entrypoints. PR #115 затем исправил production verifier и подтвердил clean canonical routes отдельно от legacy-переходов.
- **Инженерный вывод.** Для static-first сайта clean URL лучше рассматривать не как rewrite одного адреса, а как согласованный контракт generated artifact, metadata, navigation, search и compatibility.
- **Ограничение.** Репозиторий и production browser checks не доказывают, что поисковые системы уже заменили все старые URL. `search-engine observation` остаётся внешним и отложенным фактом.

## Почему публичная `.html` identity стала нежелательной

Проблема была не в том, что адрес с расширением технически не работает. Он работал и был валидным URL.

Но публичная файловая identity создавала лишнюю связь между внешним адресом и внутренним способом сборки:

```text
public route
→ имя generated file
→ конкретный static generator output
```

Это усложняло дальнейшую эволюцию:

- адрес раскрывал формат generated artifact;
- внутренние ссылки, canonical и Sitemap повторяли implementation detail;
- пользовательские URL выглядели тяжелее;
- переход на другую структуру сборки потребовал бы ещё одной публичной миграции;
- один и тот же материал мог случайно получить конкурирующие clean и `.html` identities.

Поэтому целью стало не «скрыть расширение», а определить один стабильный публичный адрес, который не зависит от имени исходного файла.

## Почему не понадобился Cloudflare application router

Cloudflare уже находился перед сайтом и оставался полезным инфраструктурным слоем:

```text
DNS/CDN/analytics
```

Но добавлять routing туда означало бы создать второй источник истины:

```text
репозиторий знает generated pages
Cloudflare отдельно знает правила маршрутизации
```

Тогда локальная сборка и GitHub Pages artifact не могли бы полностью воспроизвести production behavior без доступа к внешней панели. Ошибка или забытое правило Cloudflare превращались бы в скрытую часть приложения.

Вместо этого Cloudflare сохранён как DNS/CDN/analytics infrastructure, но не как application router. Все canonical clean routes создаются внутри репозитория и одинаково работают:

- в generated artifact;
- на GitHub Pages subpath;
- на custom domain;
- в локальном static server;
- в browser quality checks.

Это не означает, что routing на edge всегда плох. Здесь он был просто не нужен: GitHub Pages уже умеет отдавать каталог через находящийся в нём `index.html`.

## Repository-native directory output

Основной build-time шаг реализован функцией `publishDirectoryRoutes` в `scripts/clean-urls.js`.

Упрощённо преобразование выглядит так:

```text
исходный generated page:
  docs-html/landing/resume.html

canonical directory artifact:
  docs-html/landing/resume/index.html

public route:
  /landing/resume/
```

Для каждой generated HTML page обработчик:

1. вычисляет directory route;
2. создаёт вложенный `index.html`;
3. адаптирует содержимое к новой глубине;
4. переписывает публичные ссылки на clean URLs;
5. заменяет исходный `.html` статической compatibility page.

Homepage остаётся `/`, потому что корневой `index.html` уже соответствует directory semantics.

## Diplodoc: почему простого копирования файла недостаточно

Diplodoc generated page содержит не только видимый HTML. В ней есть относительная база и сериализованное routing state.

После перемещения:

```text
landing/resume.html
→ landing/resume/index.html
```

страница становится на один каталог глубже. Поэтому необходимо согласованно обновить:

- `<base href>`;
- `router.pathname`;
- `router.depth`;
- `router.base`;
- относительные пути к search и runtime assets.

Например, прежний base:

```html
<base href="../">
```

для directory artifact должен учитывать дополнительную глубину:

```html
<base href="../../">
```

Одновременно `router.pathname` получает trailing slash, а `router.depth` увеличивается. Если изменить только URL или только `<base href>`, страница может открыться, но сломать next/previous navigation, search assets, PDF или внутренние ссылки.

Именно поэтому clean URL migration является generated-artifact transformation, а не косметической заменой строки.

## Один публичный identity contract

Переход нельзя было ограничить ссылками в навигации. Все публичные representations должны указывать на один адрес:

- `canonical`;
- `hreflang`;
- OpenGraph `og:url`;
- Sitemap;
- Atom feed;
- generated search result links;
- homepage и Diplodoc navigation;
- structured metadata;
- production browser assertions.

Если, например, canonical уже clean, а Atom feed или generated search продолжают публиковать `.html`, сайт сам создаёт несколько competing identities.

Поэтому PR #114 мигрировал эти поверхности одним контрактом и добавил проверки, запрещающие публичные `.html` routes в Sitemap и Atom feed.

### Почему search index не переписывался полностью

Внутренний Diplodoc/Lunr index использует generated document references как идентификаторы. Их массовое изменение было бы более рискованным и не требовалось для пользовательского результата.

Поэтому граница получилась такой:

```text
internal search identity: generated reference может остаться *.html
rendered result link:     только clean directory URL
```

`patchSearchWorker` преобразует ссылку при формировании результата, не мутируя внутренние registry/index identities. Это сохраняет совместимость с Diplodoc и одновременно не возвращает пользователю старый публичный адрес.

## GitHub Pages и граница HTTP 301

GitHub Pages публикует файлы репозитория, но репозиторий не может описать произвольный server-side redirect status для каждого legacy route.

То есть из одной только статической сборки нельзя заставить старую страницу отвечать настоящим HTTP 301 на новый адрес.

Для строгих server-side redirects понадобился бы другой hosting layer или внешний routing configuration. Добавлять его только ради удаления расширения было бы несоразмерно задаче.

Поэтому repository-only решение сохраняет статическую compatibility page.

## Как устроена legacy `.html` compatibility

Старый путь продолжает существовать, но больше не является canonical content page.

Compatibility document содержит:

- `noindex,follow`;
- canonical на directory route;
- meta refresh;
- обычную ссылку для no-JS случая;
- `location.replace` для сохранения browser semantics.

JavaScript дополняет canonical target текущими `query` и `fragment`:

```text
/landing/resume.html?from=search#experience
→
/landing/resume/?from=search#experience
```

Это важно для старых закладок, внешних ссылок и уже опубликованных адресов.

Но такая страница не притворяется HTTP 301. Это статический compatibility mechanism с явным ограничением.

## PR #114: feature evidence

PR [#114](https://github.com/True-Ruslan/trueruslan-landing/pull/114) реализовал сам clean URL contract.

```text
TDD RED head:       af4388ba3603d5f226f6a6bdf5d3301e125720ba
exact feature head: 8702afe63ad3dca3ad0c17da47409c1660e126ef
accepted squash:    cf07c39378e7c531583e80eaef5edc7e7d1f2bad
Build:              #822 / 30962673977
quality artifact:   8913565133
quality digest:     sha256:8c3124ed00bf37e1243460cd204ac840084555b101b3f12146832b40effaa7ed
```

Exact-head matrix включала unit tests, generated-site integrity, Chromium, Firefox, WebKit, Axe, Lighthouse, search, RU/EN, metadata, visual regression и custom-domain artifact.

Это доказало корректность repository и generated artifact. Но после merge требовалась отдельная production verification.

## PR #115: когда старый verifier принял правильный redirect за ошибку

После публикации PR #114 GitHub Pages корректно отдавал clean routes. Однако post-deployment smoke всё ещё ожидал legacy `.html` Note URL.

Браузер открывал старый адрес, выполнял compatibility переход и оказывался на правильном directory route. Старый assertion воспринимал изменение final URL как failure.

Это был verifier defect: production behavior уже соответствовал новому контракту, а проверка — ещё нет.

PR [#115](https://github.com/True-Ruslan/trueruslan-landing/pull/115) разделил два сценария:

1. canonical clean route должна открываться напрямую;
2. legacy `.html` должна отдельно сохранять query и fragment при compatibility transition.

```text
exact hotfix head:  d28b05afd23f05e997d28e9015f3eab4f0a3be5e
accepted squash:    4260d30cff4ebdbf3f666f4763aa667c8dc7ee6c
Build:              #825 — SUCCESS
Production Live:    #52 — SUCCESS
CodeQL:             #293 — SUCCESS
Dependency Review:  #253 — SUCCESS
```

Только после этого production verifier начал проверять новый contract, а не историческую URL identity.

## Что production verification действительно доказывает

На живом custom domain проверяются отдельные свойства:

- clean route возвращает успешный response;
- final URL остаётся canonical directory URL;
- canonical и OpenGraph совпадают с ним;
- Sitemap, Atom feed и rendered search не публикуют `.html` identities;
- legacy entrypoint переводит на правильный route;
- query и fragment сохраняются;
- browser не фиксирует first-party request failures и page errors;
- custom domain не протекает обратно в legacy GitHub Pages origin.

Эти факты относятся к конкретному deployed SHA. Подробная граница слоёв описана в заметке о [deployment и production verification](deployment-success-is-not-production-verification.md).

## search-engine observation остаётся отдельным этапом

Даже после корректного production deployment Google и Яндекс могут некоторое время хранить старые URL и diagnostics.

На скорость замены влияют:

- crawler schedule;
- повторный обход;
- история старого URL;
- выбранное зеркало;
- состояние Sitemap в authenticated console;
- внешние ссылки.

Поэтому зелёный Build или Production Live Smoke не доказывает завершённую search-engine migration.

Repository contract уже может быть правильным, пока внешний индекс ещё отражает предыдущее состояние. Эти факты нельзя смешивать.

## Когда можно будет удалить legacy compatibility

Удаление `.html` entrypoints должно быть отдельным решением, а не автоматическим продолжением feature merge.

Разумный exit criterion включает наблюдаемые признаки:

1. representative clean routes стабильно присутствуют в Google и Яндекс;
2. старые `.html` identities исчезают или устойчиво снижаются;
3. Sitemap и canonical обрабатываются без новых migration diagnostics;
4. внешние профили и управляемые ссылки используют clean routes;
5. production logs/aggregate telemetry не показывают значимый legacy traffic;
6. отдельный review подтверждает, что compatibility больше не нужна.

До появления такого evidence legacy pages остаются дешёвой и безопасной страховкой.

## Практический порядок для static-first migration

```text
1. определить canonical public route
2. создать directory artifact
3. адаптировать base/router depth
4. синхронизировать все URL representations
5. сохранить bounded legacy compatibility
6. проверить exact generated artifact
7. опубликовать exact SHA
8. проверить clean и legacy paths в браузере
9. запросить переобход во внешних консолях
10. наблюдать migration до отдельного cleanup decision
```

Главный вывод:

> clean URLs без Cloudflare routing стали возможны не благодаря скрытому rewrite, а потому что сам generated artifact начал содержать directory routes и единый публичный identity contract.

Cloudflare остался полезным инфраструктурным слоем. Но корректность маршрутов теперь полностью воспроизводится из репозитория и проверяется до и после публикации.
