# LivingWorld — server-authoritative AI NPC architecture

LivingWorld — Fabric-мод для Minecraft 1.21.1, который добавляет MCA Reborn villagers ограниченные AI-разговоры на русском языке через текст и голос. Для меня этот проект интересен не самим фактом подключения LLM, а тем, как сделать AI-поведение **управляемым, воспроизводимым и безопасным относительно состояния игрового мира**.

**Статус:** release candidate · Java 21 · Fabric 1.21.1 · MCA Reborn · Simple Voice Chat · SQLite · STT/LLM/TTS

## Главная архитектурная идея

Клиент не владеет AI-состоянием и не ходит напрямую к внешним AI-провайдерам. Он только передаёт обычное взаимодействие Minecraft и voice transport.

Сервер остаётся источником истины для:

- conversation session ownership;
- NPC identity/profile;
- world observations;
- memory and relationship state;
- provider calls;
- action authorization;
- persistence;
- subtitles and spatial TTS playback.

```text
Player / Minecraft client
        │
        ├── text
        └── bounded voice / PTT
                │
                ▼
         Server-owned session
                │
      ┌─────────┴─────────┐
      │                   │
     STT             trusted context
      │          profile / history / world
      └─────────┬─────────┘
                ▼
              LLM
                │
         untrusted proposal
                ▼
       strict schema + policy
                │
      ┌─────────┴─────────┐
      │                   │
 persistence        live authorization
      │                   │
      └─────────┬─────────┘
                ▼
       subtitle + optional TTS
                │
                ▼
       NPC spatial voice channel
```

## Почему «LLM output» — не команда

Самая важная граница проекта: модель рассматривается как **недоверенный генератор предложений**, а не как привилегированный игровой контроллер.

Ответ должен пройти строгую JSON-схему и whitelist действий. Активный набор намеренно мал:

- `SPEAK`;
- `LOOK_AT`;
- `FOLLOW`;
- `STOP_FOLLOWING`.

Даже после структурной валидации действие повторно проверяется против **текущего** мира: владелец сессии, дистанция, измерение, состояние NPC и action-specific authority.

Так архитектура разделяет:

```text
model suggestion
      ≠
authorized world effect
```

Это особенно важно в агентных системах: чем «умнее» становится модель, тем важнее оставить реальные полномочия в детерминированном policy layer.

## Память и доверие к знаниям

Проект специально не сваливает всё в бесконечный transcript или vector database.

Контекст строится из ограниченных источников:

- persisted NPC profile;
- недавний диалог только из конкретной server-owned session;
- bounded memories;
- relationships;
- trusted server observations.

Есть принципиальное различие между:

**Player claim / LLM recollection** — может быть сохранено как непроверенное воспоминание.

**Trusted knowledge** — возникает только из server-authoritative наблюдений с явным provenance.

Например событие смерти сущности может быть зафиксировано ближайшими MCA NPC-наблюдателями как server-observed факт, но система не начинает автоматически придумывать мотив, вину или скрытую причинность.

## Persistent NPC identity

При первой встрече создаётся стабильный `npc_profile` из серверно наблюдаемой MCA identity и детерминированных personality defaults.

Дальше меняющиеся поля — имя, профессия, traits, mood — могут обновляться, но стабильные характеристики личности, ценности, страхи, стиль речи и voice profile не генерируются заново при каждой беседе.

Это превращает LLM-диалог из stateless chat completion в разговор **конкретного долговременного персонажа**.

## Voice pipeline без потери server authority

Voice-интеграция проходит через обычный Simple Voice Chat PTT path, но вход разрешается только при активной server-owned conversation session.

Пайплайн ограничен ресурсными лимитами:

- bounded voice duration;
- bounded packet queues;
- bounded retained PCM;
- bounded HTTP concurrency/deadlines;
- bounded prompt/history/knowledge;
- cancellation on session end/disconnect/shutdown.

Raw Opus/PCM не становится долговременным storage и очищается после lifecycle completion.

Если TTS падает, subtitle остаётся. Если provider недоступен, система умеет деградировать к детерминированному текстовому fallback вместо разрушения основной игровой логики.

## Threading и persistence

Minecraft objects читаются/изменяются только на server thread.

Тяжёлая работа уходит в bounded workers:

- HTTP;
- Opus decode;
- TTS resampling;
- SQLite queries/writes;
- profile/history/knowledge loading;
- cognition persistence.

SQLite используется не как «просто база», а как финальная durable trust boundary с ordered migrations и NPC-scoped данными.

## Verification как лестница доказательств

Одна из сильных сторон проекта — явное разделение уровней проверки:

1. **Unit / contract** — чистая Java-логика, repositories, migrations, trust policy, lifecycle/concurrency, HTTP doubles.
2. **RC resilience** — restart persistence, trust boundaries, fallback/shutdown, multi-actor isolation на production persistence/conversation components.
3. **Fabric game tests** — реальная загрузка Minecraft/Fabric/MCA/Simple Voice Chat, permissions, lifecycle, session isolation.
4. **Dedicated-server transport smoke** — plugin discovery, UDP listener lifecycle, startup/stop.
5. **Human acceptance** — два реальных клиента, микрофоны, русский STT, positional audibility и реальные provider quality/billing.

Ключевой принцип: прохождение нижнего уровня **не считается доказательством** прохождения верхнего.

## Что этот проект показывает как инженерный кейс

LivingWorld для меня — пример того, как я проектирую AI-native систему не от prompt'а, а от границ:

```text
authority
trust
resource limits
lifecycle
persistence
observability/evidence
```

LLM здесь — важный компонент, но не центр архитектурной власти.

## Ссылки

- [Репозиторий LivingWorld ↗](https://github.com/True-Ruslan/minecraft-botics-ai)
- [Заметка: bounded AI NPC conversations](../notes/bounded-ai-npc-conversations.md)
- [Вернуться к проектам](../projects.md)

{% note warning %}

Текущий статус — release candidate. Automated verification не заменяет обязательную acceptance-проверку на двух реальных клиентах с микрофонами, реальным STT/TTS и внешним provider environment.

{% endnote %}
