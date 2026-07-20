# Проектирование server-authoritative AI NPC pipeline

LLM легко подключить к игровому чату. Намного сложнее построить систему, где AI-персонаж остаётся частью игровой модели, а не превращается в внешний сервис с неограниченным доступом к миру.

В LivingWorld я использую server-authoritative подход: session ownership, контекст, память, provider orchestration и разрешение действий остаются под контролем сервера.

## 1. Сначала session, потом AI

Разговор начинается не с запроса к LLM, а с серверной сессии.

Система должна знать:

- какой игрок владеет разговором;
- с каким NPC он говорит;
- активна ли сессия;
- допустим ли текущий канал ввода;
- нужно ли отменить предыдущую работу.

Это защищает от ситуации, когда один NPC одновременно принадлежит нескольким независимым AI-request flows.

## 2. Text и voice — разные ingress, один conversation pipeline

Пользователь может говорить текстом или голосом.

Но после этапа распознавания оба варианта должны сходиться в общий pipeline:

```text
Text input ───────────────────────┐
                                  ▼
Voice → PCM → STT → normalized message
                                  │
                                  ▼
                          conversation core
```

Так бизнес-логика разговора не зависит от транспорта.

## 3. LLM не является authority

LLM может предложить ответ или намерение, но не должен напрямую менять игровой мир.

Безопасная граница выглядит так:

```text
LLM output
   │
   ▼
structured intent
   │
   ▼
authorization / validation
   │
   ├── rejected
   └── allowed → game action
```

Проверяются тип действия, параметры, состояние NPC, контекст сессии и правила мира.

Это особенно важно, если контекст LLM содержит пользовательский текст: prompt injection не должен превращаться в game-server command injection.

## 4. Память — отдельный слой

Не весь transcript должен бесконечно уходить в prompt.

Полезно разделять:

- короткий context текущего разговора;
- устойчивые факты/отношения NPC;
- world context, который можно пересобрать;
- provider-specific prompt representation.

Тогда модель памяти не привязана к одному LLM-провайдеру.

## 5. Cancellation — часть архитектуры

AI pipeline содержит несколько медленных стадий:

```text
STT → LLM → TTS
```

Игрок может завершить разговор, NPC может исчезнуть, сервер может остановиться, новый запрос может сделать старый ответ неактуальным.

Поэтому cancellation нельзя добавлять «потом». Она должна проходить через весь pipeline как нормальный control flow.

## 6. Fallback важнее идеального happy path

Voice может не распознаться. LLM может быть недоступен. TTS может упасть после успешного текстового ответа.

Хорошая деградация разделяет возможности:

- STT failure не ломает текстовый канал;
- TTS failure не уничтожает уже полученный subtitle/text response;
- provider timeout освобождает session resources;
- persistence failure не должен незаметно создавать ложную память.

## 7. Что реально проверяется

В текущем LivingWorld automated CI покрывает unit/package/reproducibility checks, multi-actor resilience scenarios, Fabric game tests, persistence/restart behavior, action/injection rejection, cancellation, fallback paths и synthetic multi-session ownership.

При этом реальный двухклиентный voice acceptance, качество русского STT, человеческая оценка positional TTS и staging provider degradation остаются отдельной release-candidate границей. Это важно не смешивать с тем, что доказано автоматическими тестами.

## Вывод

Главная архитектурная идея проста:

> AI должен быть capability внутри системы, а не источником истины системы.

Server-authoritative session model, provider abstraction, memory boundaries и action authorization позволяют использовать LLM как сильный компонент, не передавая ему контроль над жизненным циклом игрового мира.
