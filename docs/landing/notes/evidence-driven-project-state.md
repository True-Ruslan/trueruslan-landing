# Как описывать состояние проекта без ложной уверенности

Страница состояния проекта легко превращается в убедительный, но устаревший рассказ. Последний commit может быть новым, CI — зелёным, артефакт — собранным, а production или внешний продукт при этом ещё не приняты. Поэтому project state должен быть не пересказом активности, а ограниченной evidence model.

## Проблема дублированной правды

Когда SHA, версии, статусы и даты копируются в несколько Markdown-файлов, они начинают расходиться. Volatile facts должны приходить из одного **canonical registry**, а prose должна объяснять смысл и границы этих фактов, но не создавать второй источник истины.

Минимальная запись наблюдения должна содержать:

```text
kind: verified | inference | limitation
status: verified | stale | unverified
observedAt: ISO date/time
source: canonical registry identifier
commit SHA: exact repository identity when applicable
artifact digest: exact generated package identity when applicable
deployment identity: exact deployment when applicable
```

## Три класса утверждений

### Проверенный факт

Факт имеет конкретный источник, дату наблюдения и bounded scope. Например: exact-head Build успешно завершился для определённого commit SHA. Это не расширяется автоматически до production correctness.

### Инженерный вывод

Вывод связывает несколько проверенных фактов, но остаётся интерпретацией. Он должен быть помечен отдельно, чтобы читатель не принял архитектурное объяснение за прямое измерение.

### Ограничение

Ограничение явно говорит, что ещё не доказано: ручная product-owner проверка, реальный provider, поисковая индексация, physical client или accessibility review.

## Пять независимых evidence layers

1. **repository activity** — commits, PR и source checks;
2. **generated artifact** — собранный сайт, пакет или binary с точным digest;
3. **deployed production** — конкретный deployment identity и наблюдение опубликованного результата;
4. **external-product acceptance** — установленный продукт, реальные клиенты и product-owner сценарии;
5. **operator/search-engine state** — внешние панели, crawler observation и ручные настройки.

Переход между слоями не подразумевается. Последний commit не доказывает production, успешный deployment не доказывает пользовательское поведение, а поисковая консоль не является частью repository truth.

## Freshness как часть смысла

`verified` без времени наблюдения быстро становится двусмысленным. Поэтому `observedAt` обязателен, а состояния **stale** и **unverified** должны отображаться явно.

- `verified` — bounded evidence существует и ещё находится внутри принятого freshness window;
- `stale` — evidence когда-то было принято, но repository activity или время требуют повторной проверки;
- `unverified` — необходимого evidence layer ещё нет.

Freshness report остаётся maintenance evidence. Он может обнаружить drift, но автоматически не повышает и не изменяет статус проекта.

## Draft и pending acceptance

**Draft не является accepted evidence.** Открытый или зелёный Draft PR может подтверждать только существование текущей работы. Он не должен менять публичный lifecycle.

То же относится к pending product-owner проверкам. Automated tests могут сузить ручную приёмку, но не заменяют сценарий, который требует физического клиента, реального provider или человеческого решения.

## Reviewable, но non-mutating automation

Автоматический отчёт должен быть **reviewable** и **non-mutating**:

- показывать источник и exact identity;
- объяснять, почему состояние стало stale;
- предлагать действие;
- не редактировать canonical registry;
- не переводить проект в `verified`;
- не скрывать конфликтующие observations.

Это сохраняет человеческое решение в точке, где меняется публичное утверждение.

## Static-first representation

Evidence-driven project state должен оставаться частью обычного статического контента. Основной смысл доступен как semantic HTML и **no-JavaScript** representation. Та же заметка должна обнаруживаться через **Atom feed** и **generated search**, без второго runtime API или отдельной CMS.

## Verification contract

Реализация проверяется двумя независимыми воротами:

- **exact-head** — registry, source, index, TOC, build и quality matrix на точном SHA ветки;
- **exact-deployment** — canonical route, rendered content, feed/search discovery и опубликованный deployment identity.

Даже после exact-deployment остаются внешние ограничения: operator/search-engine state и product-owner acceptance не выводятся из repository CI.

## Практическое правило

Хорошая state-page отвечает не только «что сейчас происходит», но и:

- откуда взят каждый изменяемый факт;
- когда он наблюдался;
- какой слой он доказывает;
- что является выводом;
- что пока stale или unverified;
- какое ручное действие ещё требуется.

Так project state остаётся полезным инженерным интерфейсом, а не уверенно написанной копией вчерашней реальности.

## Связанные заметки

- [Почему успешный deployment ещё не означает production verification](deployment-success-is-not-production-verification.md)
- [Почему валидный PDF ещё не доказывает полноту и актуальность резюме](passive-pdf-validation-vs-semantic-completeness.md)
- [Почему green CI не означает verified product](green-ci-is-not-product-verification.md)
