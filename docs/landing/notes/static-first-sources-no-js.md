# Почему build-time data недостаточно без no-JS representation

Когда я переносил старую bibliography table в нормальный Sources Registry, задача сначала выглядела почти исключительно как работа с данными.

Нужно было убрать огромную hand-maintained таблицу, завести canonical `data/sources.json`, провалидировать записи и построить из них более удобное представление.

С технической точки зрения всё это действительно происходило на build-time.

Но первый browser smoke с отключённым JavaScript показал неприятную вещь: данные были в сгенерированном artifact, а пользователь всё равно не мог их прочитать.

Это заставило меня точнее сформулировать, что именно я называю static-first architecture.

## Ошибка в моём первоначальном предположении

Логика была примерно такой:

```text
canonical JSON
    ↓
build-time renderer
    ↓
generated HTML
    ↓
значит контент статический
```

На уровне pipeline это выглядело правдой.

Но Diplodoc может хранить article body внутри hydration state. То есть важный контент присутствует в generated document как данные для последующего runtime mount, а видимый React root без JavaScript остаётся пустым.

Получается важное различие:

> данные существуют в build artifact

не равно

> пользователь может прочитать эти данные без runtime JavaScript.

Для static-first сайта это принципиальная граница.

## Почему простой duplicate fallback был плохим решением

Самый очевидный вариант — отдельно сгенерировать второй HTML-блок рядом с основным приложением.

Но тогда сразу появляется два представления одного и того же content source, которые легко начинают расходиться:

- основной hydrated view;
- отдельный hand-maintained или independently generated fallback.

Я не хотел превращать no-JS поддержку в ещё один источник истины.

Также не хотелось решать проблему runtime fetch-запросом к `sources.json`.

Это ухудшило бы модель сразу по нескольким причинам:

- core content начал бы зависеть от JavaScript;
- появился бы runtime network boundary там, где данные уже известны на build-time;
- пришлось бы отдельно обрабатывать loading/error states;
- static artifact перестал бы быть самодостаточным.

## Что в итоге сделал

Canonical source остался один: `data/sources.json`.

Build-time renderer по-прежнему генерирует содержимое из этого registry.

Если финальная Diplodoc representation хранит article body только в hydration state, post-processing добавляет semantic `<noscript>` fallback для этого же уже сгенерированного содержания.

Ключевой момент — fallback появляется только там, где он реально нужен как alternate representation.

Схема стала такой:

```text
data/sources.json
        ↓
strict validation
        ↓
one build-time semantic representation
        ↓
Diplodoc generated artifact
        ├── enhanced/hydrated path
        └── semantic no-JS fallback when required
```

Нового content source не появилось.

Runtime fetch тоже не появился.

## Что browser test доказал лучше unit tests

До browser/no-JS проверки система могла выглядеть полностью корректной:

- JSON валиден;
- renderer работает;
- HTML build успешен;
- данные присутствуют в generated state.

Но ни одна из этих проверок сама по себе не отвечала на пользовательский вопрос:

> «Если JavaScript не выполнится, вижу ли я вообще список источников?»

Только реальный browser scenario с disabled JavaScript проверил эту границу целиком.

После исправления smoke стал проверять не абстрактное наличие данных, а фактическую доступность всех migrated records и отсутствие overflow.

Для меня это хороший пример того, почему quality gate должен формулироваться через observable outcome.

Не «в HTML есть serialized content».

А «пользователь может прочитать 31 источник без JavaScript».

## Почему фильтры при этом остались JavaScript-enhancement

Sources page получила query/topic/type filtering.

Здесь JavaScript абсолютно уместен: фильтры делают страницу удобнее, но не являются единственным способом получить content.

Без JavaScript пользователь всё равно видит semantic list источников.

С JavaScript получает более быстрый способ его исследовать.

Это и есть progressive enhancement в практическом смысле:

```text
core value работает статически
        +
JavaScript улучшает interaction
```

По той же причине Sources filter не стал вторым site-wide search engine.

Глобальный full-text search уже принадлежит Diplodoc. Page-local filtering решает другую задачу и не должен создавать duplicate search architecture.

## Что изменилось в моём понимании static-first

Раньше я в первую очередь смотрел на место, где формируется контент:

> если данные собраны во время build, значит решение static-first.

Сейчас критерий строже.

Для core content я проверяю весь путь до пользователя:

1. есть ли один canonical source;
2. deterministic ли build;
3. попадает ли semantic content в финальный artifact;
4. доступен ли он без обязательного runtime API;
5. остаётся ли он читаемым, если JavaScript не выполнился;
6. улучшает ли JavaScript UX, а не создаёт единственный путь к содержанию.

Именно Sources migration сделала эту границу для меня практической, а не теоретической.

Build-time intelligence полезна не потому, что она позволяет сказать «у нас статический сайт».

Она полезна тогда, когда финальный artifact действительно остаётся самодостаточным и честно доставляет основное содержание пользователю даже без runtime orchestration.