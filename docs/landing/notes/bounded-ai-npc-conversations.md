# Как проектировать bounded AI-разговоры NPC, а не просто подключить LLM

Самая простая версия AI NPC выглядит так:

```text
player message
    ↓
prompt
    ↓
LLM
    ↓
NPC answer
```

Для demo этого достаточно.

Но как только NPC должен помнить прошлое, слышать голос, видеть игровой мир и выполнять действия, схема становится опасно неполной.

Появляются вопросы, на которые prompt engineering сам по себе не отвечает:

- кто имеет право начать и продолжать session;
- каким фактам можно доверять;
- что модель вообще имеет право менять;
- когда память становится durable;
- как не блокировать game server;
- что происходит при disconnect/provider failure/shutdown;
- какое automated evidence действительно доказывает работоспособность системы.

В LivingWorld я пришёл к архитектуре, где **LLM — важный, но принципиально непривилегированный компонент**.

## 1. Сначала authority, потом prompt

Первый вопрос должен быть не «что положить в system prompt?», а:

> кто является источником истины?

Для multiplayer/server game ответ обычно должен быть: **сервер**.

```text
Client
  └── input / transport

Server
  ├── session ownership
  ├── world state
  ├── context
  ├── persistence
  ├── provider calls
  └── authorization
```

Клиент может отправить текст или voice packets, но сам факт поступления input не означает, что система обязана его принять.

Вход допустим только внутри server-owned session с известным player/NPC ownership.

Это сразу закрывает целый класс проблем:

- чужой игрок не продолжает conversation session;
- NPC не ведёт несколько конфликтующих разговоров одновременно;
- voice ingress не становится глобальным «микрофон → LLM» каналом;
- disconnect/end-session может детерминированно инвалидировать outstanding work.

## 2. Model output — untrusted proposal

LLM умеет генерировать убедительный текст.

Это не делает его authoritative.

Правильнее мыслить так:

```text
LLM output
   ↓
untrusted structured proposal
   ↓
schema validation
   ↓
policy
   ↓
live world authorization
   ↓
effect
```

Даже если модель вернула корректный JSON:

```json
{
  "action": "FOLLOW",
  "target": "player"
}
```

система ещё должна проверить:

- существует ли session;
- владеет ли её текущий player;
- жив ли NPC;
- находятся ли они в нужном dimension/range;
- разрешено ли это действие policy;
- не изменилось ли состояние мира с момента prompt construction.

Именно поэтому «function calling» или tool use не равно authorization.

Tool schema ограничивает форму предложения. Authority должна оставаться вне модели.

## 3. Разные виды памяти должны иметь разный trust

Одна из самых опасных идей — смешать в один memory store:

- слова игрока;
- выводы модели;
- реальные server observations.

Если игрок сказал NPC:

> «Я король этого города»

это может быть полезным воспоминанием о claim игрока.

Но это не должно автоматически стать world truth.

Полезно различать минимум:

```text
player_claim
llm_unverified
server_observed
```

Тогда prompt может явно сообщать модели provenance.

И наоборот, server-observed событие должно хранить только то, что реально было наблюдаемо.

Если NPC видел смерть сущности и известного attacker, это не означает автоматически:

```text
attacker is guilty
attacker wanted this
victim owned something
```

Inference модели может использоваться в разговоре, но durable trusted knowledge не должно незаметно превращаться в hallucinated lore.

## 4. Bounded context — это архитектурное свойство

«Добавим всю память NPC в prompt» плохо масштабируется даже до того, как станет дорого.

Проблемы:

- latency;
- cost;
- prompt injection surface;
- непредсказуемый attention;
- невозможность понять, какие данные реально повлияли на ответ.

Поэтому каждый источник должен иметь budget:

```text
profile          bounded
recent dialogue  bounded
memories         bounded
trusted knowledge bounded
player input     capped
provider output  capped
```

Bounded system легче тестировать и деградировать.

Это не просто token optimization. Это способ сделать cognition pipeline конечным и проверяемым.

## 5. Persistent identity важнее длинной истории

Чтобы NPC ощущался постоянным персонажем, необязательно хранить бесконечный transcript.

Гораздо важнее иметь стабильную identity:

- personality dimensions;
- values/fears;
- speech style;
- voice profile;
- relationships;
- bounded significant memories.

Тогда следующая conversation строится не как «продолжение огромного чата», а как новый bounded interaction одного и того же персонажа.

```text
stable identity
      +
current observations
      +
recent session context
      +
selected memory
      ↓
current response
```

## 6. Voice — отдельный resource lifecycle

Голос резко увеличивает количество failure modes:

```text
packets
  ↓
codec/decode
  ↓
turn detection
  ↓
PCM
  ↓
STT
  ↓
LLM
  ↓
TTS
  ↓
resampling / playback
```

Каждая стадия требует limits и cancellation.

Например:

- maximum turn duration;
- queue depth;
- retained PCM limit;
- provider concurrency;
- deadlines;
- response size;
- cancellation on disconnect/end session/shutdown.

Raw audio не должен случайно становиться permanent storage только потому, что его удобно логировать при отладке.

## 7. Graceful degradation должна проектироваться заранее

Внешний AI provider — unreliable dependency по определению.

Нужно отдельно решить:

```text
STT failed   → что видит player?
LLM failed   → сохраняется ли session?
TTS failed   → теряется ли текст?
timeout      → кто отменяет outstanding work?
shutdown     → что коммитится, а что нет?
```

Хороший принцип:

> optional intelligence should not destroy deterministic core behavior.

Например TTS failure не должен уничтожать уже валидный subtitle.

Provider failure может дать deterministic fallback вместо повреждения persistent state.

## 8. Verification должна быть иерархией, а не одной зелёной галочкой

Можно иметь 500 unit tests и всё равно не знать, работает ли positional voice между двумя реальными клиентами.

Поэтому полезно заранее определить evidence levels:

```text
Unit / contract
      ↓
component integration
      ↓
resilience / persistence scenarios
      ↓
real engine/game tests
      ↓
transport smoke
      ↓
human multi-client acceptance
```

Каждый уровень отвечает на другой вопрос.

Особенно важно явно записывать:

> passing level N is not evidence for level N+1.

Это защищает от ложного ощущения production readiness.

## 9. Итоговая модель

Для меня bounded AI NPC system выглядит не как:

```text
NPC = prompt + model
```

а как:

```text
               ┌──────────────┐
player input → │ session gate │
               └──────┬───────┘
                      ▼
               bounded context
                      │
                      ▼
                    model
                      │
                untrusted data
                      ▼
            schema / policy / auth
                      │
              ┌───────┴───────┐
              ▼               ▼
        durable state      world effect
              │               │
              └───────┬───────┘
                      ▼
             player-visible result
```

Главная идея проста:

> **AI может предлагать поведение. Система должна владеть правом сделать это поведение реальностью.**

## Связанные материалы

- [LivingWorld case study](../projects/livingworld.md)
- [Проекты](../projects.md)
- [Engineering Notes](../notes.md)
