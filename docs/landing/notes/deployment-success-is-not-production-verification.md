# Почему успешный deployment ещё не означает production verification

У статического сайта есть соблазнительно простая модель доставки:

```text
сборка прошла
→ GitHub Pages опубликовал файлы
→ значит production проверен
```

На практике эта цепочка слишком короткая.

Даже если deployment завершился успешно, остаются отдельные вопросы:

- тот ли commit был собран;
- тот ли generated artifact был опубликован;
- появился ли exact deployed SHA в GitHub Pages;
- открываются ли нужные clean routes через реальный домен;
- совпадают ли canonical, OpenGraph, hreflang, feed и search identities;
- работает ли страница в браузере после публикации;
- проверяет ли production verifier именно ту поверхность, которую должен проверять.

Поэтому в TrueRuslan Landing я в итоге закрепил более длинную цепочку:

```text
repository readiness
→ generated artifact
→ GitHub Pages deployment
→ Production Live Smoke
→ bounded product acceptance
→ search-engine observation
```

Каждый слой полезен. Ни один из них не должен автоматически присваивать смысл следующего.

Главная формула этой заметки:

```text
deployment success ≠ production verification
```

Связанный case study: [TrueRuslan Landing — Static-First Portfolio Platform](../projects/portfolio-platform.md).

## Границы утверждений

- **Проверенный факт.** Для P3.2 и P3.3 сохранены отдельные exact-head Build, generated artifact, GitHub Pages deployment и Production Live Smoke evidence.
- **Инженерный вывод.** Чем ближе проверка к пользовательскому production endpoint, тем уже и точнее должен быть её claim; предыдущий зелёный слой не следует автоматически расширять до следующего.
- **Ограничение.** Эта модель не доказывает содержательную безошибочность всего текста, полноту ручной product acceptance или фактическое обновление индекса поисковой системы.

## Слой 1. Repository readiness

Repository readiness отвечает на вопрос:

> готов ли конкретный head к слиянию по правилам репозитория?

Для feature PR сюда входят:

- unit и contract tests;
- production build;
- generated-site integrity;
- mobile overflow smoke;
- Chromium, Firefox и WebKit;
- Axe и Lighthouse;
- visual regression;
- CodeQL;
- Dependency Review;
- отсутствие открытых review threads.

Это сильное доказательство, но оно относится к exact head внутри CI.

Зелёный Build не доказывает, что GitHub Pages уже опубликовал этот commit. Он также не доказывает, что пользовательский домен начал отдавать соответствующий artifact.

В Portfolio 1.0 P3.2 feature PR [#119](https://github.com/True-Ruslan/trueruslan-landing/pull/119) прошёл полную exact-head матрицу. Это доказало repository readiness и корректность generated output в CI, но ещё не production acceptance.

## Слой 2. Generated artifact

После tests проект создаёт generated artifact — итоговый статический сайт, а не только исходный Markdown и JavaScript.

На этом уровне проверяются факты, которых нет в source tree:

- какие HTML-файлы реально появились;
- как Diplodoc применил `<base href>`;
- куда указывают вложенные assets;
- какие canonical URL записаны в страницы;
- попали ли новые маршруты в Sitemap, Atom feed и generated search;
- сохранился ли custom-domain identity;
- не остались ли публичные `.html` identities там, где нужны clean directory routes.

Artifact получает отдельный ID и digest. Это позволяет говорить не просто «build зелёный», а:

> проверен конкретный набор сгенерированных bytes.

Но generated artifact всё ещё находится внутри CI. Он не доказывает, что именно эти bytes опубликованы на production.

## Слой 3. GitHub Pages deployment

GitHub Pages deployment добавляет новый факт:

> платформа публикации приняла commit и создала успешный deployment для его SHA.

В production workflow TrueRuslan Landing verifier не берёт «последний похожий deployment». Он запрашивает deployments API, ищет exact deployed SHA и ждёт успешный status именно для него.

Это защищает от опасной двусмысленности:

```text
PR head: A
последний успешный Pages deployment: B
```

Если verifier проверит production, не сопоставив его с SHA, зелёный результат может относиться к предыдущей версии сайта.

Поэтому в evidence отдельно фиксируются:

- accepted squash SHA;
- Pages workflow run;
- Pages deployment ID;
- время создания и обновления deployment;
- exact deployed SHA.

Но даже успешный GitHub Pages deployment доказывает только то, что платформа доставки завершила свою операцию. Он не доказывает корректность содержимого глазами браузера.

## Слой 4. Production Live Smoke

Production Live Smoke открывает уже опубликованный сайт через реальный домен и проверяет пользовательские границы:

- HTTP status;
- final URL;
- clean route;
- canonical и OpenGraph URL;
- RU/EN alternate links;
- отсутствие legacy Pages origin;
- browser console и page errors;
- first-party request failures;
- содержимое конкретной страницы;
- Atom feed;
- generated search;
- favicon и Cloudflare beacon;
- legacy compatibility с сохранением query и fragment.

Эта проверка запускается после того, как workflow нашёл successful GitHub Pages deployment для expected SHA.

Именно поэтому Production Live Smoke — не повтор Build. Он проверяет другую систему и другую точку наблюдения.

## Реальный случай: PR #119 был опубликован, но acceptance ещё не был закрыт

Portfolio 1.0 P3.2 добавил отдельные RU/EN case-study routes для TrueRuslan Landing.

Feature PR [#119](https://github.com/True-Ruslan/trueruslan-landing/pull/119) прошёл exact-head Build. После merge GitHub Pages успешно опубликовал новый сайт. Baseline production smoke тоже прошёл.

Однако новый deployment-only smoke для platform case study упал.

Причина была такой:

```text
locator('main') resolved to 2 elements
```

На странице были два валидных `<main>`:

- layout main Diplodoc;
- вложенный document-content main.

Verifier использовал слишком широкий selector и не мог однозначно прочитать содержимое case study.

Это был **verifier defect**, а не доказанный дефект страницы. Но успешный deployment не мог самостоятельно сообщить эту классификацию. Он видел только опубликованные файлы и успешное завершение Pages job.

В PR [#120](https://github.com/True-Ruslan/trueruslan-landing/pull/120) selector был сужен до:

```text
main.dc-doc-page__content
```

После этого потребовались новые отдельные факты:

1. exact-head Build PR #120;
2. squash merge;
3. новый GitHub Pages deployment;
4. exact deployed SHA;
5. успешный deployment-only Production Live Smoke.

Только после этой цепочки P3.2 был принят в production.

Этот случай важен ещё и тем, что verifier может ошибаться в обе стороны:

- выдавать false negative из-за собственного дефекта;
- пропускать проблему, если selector или assertion слишком широкие.

Поэтому production verifier тоже является кодом продукта доставки: его нужно тестировать, ревьюить и делать fail-closed.

## P3.3: как выглядит полная evidence chain

Для Portfolio 1.0 P3.3 — нормализации VillAIgence и Vlezet — evidence было сохранено отдельными слоями.

Repository и artifact layer:

```text
exact feature head:  ee5fa11d455e0f113d76a1d1fd9947e7d54b2e46
accepted squash:     c90a221a21f51e897661667f981483bad922ad0d
Build:               #893 / 31005675334
quality artifact:    8930321636
quality digest:      sha256:97880f197f9484b41eb38ee606c291a754d889a55160719d948c13b0fc9a4e8a
```

Deployment и live-production layer:

```text
Pages workflow:      #152 / 31006504250
Pages deployment ID: 5761717586
exact deployed SHA:  c90a221a21f51e897661667f981483bad922ad0d
Production Live Smoke: #95 / 31006557622
production artifact: 8930571510
production digest:   sha256:c230b3c31308371ff669a9171ada693229909ad868a6eb4e2c09634b72200f13
```

Отдельное хранение этих значений кажется избыточным, пока не возникает вопрос:

> какой именно слой сейчас зелёный и к какому SHA он относится?

Без exact identity ответ быстро превращается в предположение.

## Почему production smoke не должен запускать новые claims автоматически

Production Live Smoke подтверждает только запрограммированные сценарии.

Например, проверка страницы может доказать:

- route доступен;
- heading и ключевые markers присутствуют;
- canonical корректен;
- browser не зафиксировал page errors;
- search возвращает ожидаемый route.

Но она не доказывает автоматически:

- что весь текст содержательно безошибочен;
- что каждый внешний источник актуален;
- что пользователю понятна структура материала;
- что поисковые системы уже заменили старые URL;
- что проект, описанный в case study, прошёл более широкую product-owner acceptance.

Здесь снова нужна bounded формулировка evidence.

## Search-engine observation — ещё один отдельный слой

После публикации clean routes Google и Яндекс могут некоторое время продолжать показывать старые `.html` identities или устаревшие diagnostics.

Это не означает автоматически, что deployment сломан.

Repository может уже содержать корректные:

- canonical;
- Sitemap;
- hreflang;
- OpenGraph;
- `noindex,follow` compatibility entrypoints;
- HTTP→HTTPS contract.

Production smoke может подтвердить всё это на живом сайте.

Но **search-engine observation** зависит от crawler schedule, переобхода, выбранного зеркала и состояния внешней консоли. Поэтому она остаётся отдельным операционным фактом и не закрывается зелёным deployment workflow.

## Практическая схема release gate

Для static-first проекта я использую следующий порядок:

```text
1. TDD RED
2. exact-head repository checks
3. generated artifact + digest
4. review and squash merge
5. GitHub Pages deployment for accepted SHA
6. deployment-driven Production Live Smoke
7. feature-specific production assertions
8. durable evidence update
9. delayed external observation where applicable
```

Если шаг 6 или 7 не прошёл, feature ещё не принята в production — даже если Pages показывает зелёный deployment.

Если production smoke упал, сначала нужно классифицировать источник:

- artifact defect;
- deployment mismatch;
- live-site defect;
- external dependency failure;
- verifier defect.

Простой rerun без понимания причины делает evidence слабее, а не сильнее.

## Что изменилось в моём понимании deployment

Раньше deployment был для меня финальным действием: файлы опубликованы, задача закрыта.

Теперь это один из переходов состояния:

```text
готово в repository
≠
сгенерировано
≠
опубликовано
≠
проверено в production
≠
принято пользователем
≠
проиндексировано внешней системой
```

Чем ближе система к production, тем важнее не объединять эти факты одним зелёным статусом.

Главный вывод:

> успешный deployment подтверждает работу механизма доставки; production verification подтверждает отдельный набор наблюдаемых свойств уже опубликованной системы.

Оба доказательства нужны. Но только явная связь между exact head, artifact, deployed SHA и browser verification позволяет понять, что именно действительно принято.