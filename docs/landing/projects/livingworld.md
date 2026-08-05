# VillAIgence — server-authoritative AI society for Minecraft

**VillAIgence** — MCA-derived мод для Minecraft 1.21.1, который вырос из AI-диалогов с жителями в эксперимент над устойчивым обществом NPC: с текстом и голосом, Memory 2.0, отношениями, операторским контекстом и действиями, которые остаются под контролем сервера.

**Текущий статус:** <span data-tr-project-status="livingworld"></span>

[Репозиторий на GitHub ↗](https://github.com/True-Ruslan/villAIgence)

Внутренние имена `LivingWorld / livingworld` остаются compatibility-sensitive частью движка, конфигурации и world-local data. Публичное имя проекта изменилось, но mod id `mca`, Java package root, `config/livingworld.json` и `<world>/livingworld/` не переименовываются без отдельной миграции.

![VillAIgence authority and acceptance boundaries](../../assets/diagrams/villaigence-authority-and-acceptance.svg)

<div data-tr-project-timeline="livingworld"></div>

<!-- case-study:problem -->
## Проблема: убедительный NPC всё равно должен подчиняться серверу

Игрок должен разговаривать с MCA-жителем текстом или голосом, а персонаж — отвечать как часть конкретного Minecraft-мира, помнить события и отношения и при этом не получать неконтролируемую authority.

Как только у NPC появились память, голос и действия, система должна была определить:

- кто владеет разговором;
- какой контекст действительно наблюдал сервер;
- что является фактом, а что остаётся рассказом или предположением;
- как NPC сохраняет идентичность после restart;
- что делать со старым async-ответом после завершения сессии;
- как пережить частичный отказ STT, Chat или TTS;
- где заканчивается предложение модели и начинается authoritative изменение мира;
- какой exact artifact действительно запускался и что именно его проверка доказала.

> LLM никогда не является источником истины. Сервер владеет идентичностью, контекстом, памятью, отношениями, действиями и persistent evidence; модель только предлагает ответ или намерение.

<!-- case-study:constraints -->
## Ограничения и риски

### Mutable world нельзя передавать в async pipeline напрямую

Пока выполняются STT, Chat и TTS, игрок может уйти, NPC — изменить состояние, а сессия — завершиться. Перед внешним вызовом сервер собирает immutable bounded snapshot. Ответ применяется только после повторной проверки актуального authoritative state.

### Text и voice должны сходиться в один conversation core

```text
voice PCM → STT → validated message ┐
                                     ├→ context → Chat → response → optional TTS
text command → validated message ────┘
```

Голос — транспорт, а не отдельная доменная модель. Неудачный TTS не должен стирать полезный текстовый ответ, а ошибка STT не должна отключать текстовый путь.

### Память не должна быть бесконечным transcript

VillAIgence разделяет:

- `memory.json` — bounded legacy dialogue history;
- `memory2.json` — episodic `DIALOGUE`, `OBSERVATION`, `ACTION` и `RELATIONSHIP_CHANGE`;
- `semantic-memory.json` — typed `FACT` и `BELIEF`;
- `relationships.json` — player ↔ NPC relationship state;
- `voices.json` — устойчивая voice identity;
- `operator-lore.json` — явно заданный оператором background context.

`FACT` требует server-owned evidence и provenance `SYSTEM_OBSERVED`. Сообщение игрока, реплика другого NPC или вывод модели могут стать `BELIEF`, но confidence не повышает их до факта.

### Provider и release pipeline — отдельные границы

Authenticated redirects, небезопасные endpoint, loopback/SSRF-пути, malformed JSON, oversized bodies и unbounded waits должны завершаться bounded failure.

Зелёный source CI не доказывает, что remapped JAR запускается на настоящем сервере. Source tests, GameTests, package inspection, exact release identity, production-JAR startup, restart, deterministic provider clients и cumulative acceptance отвечают на разные вопросы.

<!-- case-study:current-state -->
## Текущая lifecycle- и acceptance-граница

Текущий опубликованный candidate — **`0.1.25+1.21.1`**. Его evidence состоит из нескольких независимых слоёв.

Подтверждено отдельно и ограниченно:

- PR #103: каталог из 28 risk-based сценариев и семь isolated real-server Fabric GameTests;
- PR #104: exact remapped production JAR установлен вне Loom/dev classpath, два JVM-запуска достигли ready marker, controlled shutdown и restart сохранили шесть canonical stores;
- PR #105: inventory сохраняется при tombstone capture до передачи ownership могиле; focused installed resurrection canary остаётся отдельной ручной проверкой;
- PR #107: exact production-gated release `0.1.25+1.21.1` опубликован только после проверки identity, package, startup, shutdown, restart и byte-identical JAR;
- PR #108: production Chat, STT и TTS HTTP clients прошли deterministic literal-loopback acceptance без внешней сети и реальных провайдеров;
- PR #109: configuration-cache и release-request gates исправлены без изменения runtime behavior.

Эти результаты доказывают exact release, production-JAR startup/restart и ограниченный deterministic provider-client boundary. Они **не завершают cumulative real-provider, Voice Chat, multiplayer, focused gameplay и product-owner acceptance**.

Текущий публичный lifecycle остаётся **release candidate — ACCEPTANCE IN PROGRESS**.

Активная разработка отделена от принятого состояния. Draft PR #110 на observed head `b3172080d89052a5b361d203dbdac152752d7d0d` определяет RED-контракт для одного общего STT → Chat retries → TTS deadline, exactly-once dialogue/relationship commits и сохранения успешного Chat commit при TTS deadline. Это не принятая capability: production implementation и installed acceptance ещё не доказаны, cumulative acceptance остаётся pending.

<!-- case-study:decisions -->
## Архитектура и ключевые решения

### Server-authoritative session и immutable context

Разговор начинается с серверной связи `player ↔ NPC`, а не с provider request.

1. сервер разрешает взаимодействие с живым MCA-жителем;
2. фиксирует владельца сессии и persistent NPC identity;
3. принимает text/voice только внутри актуальной сессии;
4. собирает immutable bounded context;
5. передаёт провайдеру только подготовленное представление;
6. после ответа повторно проверяет session, NPC и world state;
7. отдельно валидирует proposed actions и relationship deltas.

Старый ответ может быть технически корректным, но уже не иметь права на применение. Cancellation и supersession являются нормальным control flow.

### Memory 2.0 разделяет эпизоды, семантику и authority

Episodic memory отвечает на вопрос «что произошло», semantic memory — «что NPC считает знанием», а authoritative world state — «что действительно верно сейчас».

У каждой записи есть owner NPC, provenance, deterministic identity и bounded retention. Consolidation объединяет источники, но не стирает source-event IDs. Forgetting определяется детерминированной storage policy внутри конкретного NPC, а не решением LLM.

### Operator Lore — отдельный background layer

```text
operator UI
→ bounded C2S request
→ permission check
→ trusted scope/target resolution
→ SHA-256 revision check
→ atomic world-local write
→ canonical S2C value/status/revision
```

Клиент не получает файловую или идентификационную authority. Conflict требует reload/review, а lore не становится автоматически semantic FACT.

### Capability-level degradation вместо общего «AI сломан»

STT, Chat и TTS имеют независимые failure boundaries. Retry не должен повторно записывать память, действие или изменение отношений. Диагностика не содержит ключи, prompts, transcripts или hidden reasoning.

PR #108 закрепил эту границу на реальных production HTTP clients: Chat retries используют один monotonic request budget, STT проверяет WAV multipart, а TTS — sample-for-sample PCM. Это protocol/client evidence, а не доказательство полного voice turn.

### Selective MCA synchronization вместо большого upstream merge

Исправления MCA переносятся небольшими проверяемыми packages: tombstone integrity, UUID conversion, beds/tickets, water and ladder navigation, pathfinding, mourning, gifts, fishing и mounted archer behavior. Так AI/security/persistence boundaries не растворяются в массовом merge.

### Release identity является частью продукта

Версия в имени файла недостаточна. Candidate должен иметь согласованную Fabric metadata, manifest identity, remapped package structure и checksum. PR #107 дополнительно связал immutable tag/release с exact accepted production JAR вместо публикации по одному зелёному source build.

### Acceptance каталог строится от рисков

GameTest evidence остаётся development integration proof; production-JAR gate — installed automated proof; literal-loopback provider checks — production-client protocol proof. Ни один слой не заменяет cumulative operator acceptance.

## Реальные отказы, которые изменили архитектуру

### Transcript-first память не выдержала развитие общества

Один список сообщений не мог надёжно различать наблюдение, действие, отношение и устойчивое знание. Memory 2.0 появился ради явной модели provenance, ownership, consolidation и retention, а не ради более длинного prompt.

### Широкий hook прошёл source gates и сломал installed startup

Candidate `0.1.21+1.21.1` упал при startup: tombstone Mixin не разрешил production target. Preservation policy перенесли напрямую в owned `TombstoneBlock`, obsolete Mixin удалили и запретили package gate.

### Навигационная идея переопределила vanilla contract слишком широко

В установленном `0.1.20+1.21.1` NPC застрял в воде и утонул. Исправление сохранило inherited `GroundPathNavigation.getTempMobPos` и сузило MCA-aware логику до surface calculation.

### Loot и capture paths могли потерять persistent inventory

Заполненная могила при Silk Touch исчезала без item drop, а NPC мог выбросить inventory до tombstone serialization. PR #105 перенёс capture до destructive death drop path, но focused installed canary с известными stacks остаётся обязательным.

### Green dialogue path не отменяет задержку

Один Chat request в `0.1.20` занял примерно 272 секунды. Success code без user-visible deadline не является полным success contract. Поэтому PR #110 требует один monotonic budget на всю voice orchestration, а не новый timeout для каждого этапа.

### Safe rollback — самостоятельный результат

После startup failure `0.1.21` сервер вернули на `0.1.20`. Все шесть persistent hashes совпали, сервер снова достиг `STARTED`, TCP 25565, UDP 24454, Voice Chat и monitor восстановились.

<!-- case-study:alternatives -->
## Рассмотренные и отвергнутые альтернативы

### Клиент как владелец сессии, контекста или действий

Отвергнуто. Клиент может запрашивать взаимодействие и отображать результат, но не выбирает authoritative NPC identity, факты, relationship state или world mutation.

### Transcript-only память

Отвергнута. Один список реплик не выражает provenance, ownership, semantic FACT/BELIEF, relationship changes и deterministic retention.

### LLM как источник фактов или прямых действий

Отвергнуто. Модель может предложить ответ, command или delta; сервер повторно валидирует current state и исполняет только разрешённый эффект.

### Большой MCA merge и широкие production-sensitive Mixins

Отвергнуты в пользу небольших owned-source packages. Installed startup failure показал, что source-compatible injection может не разрешиться в production artifact.

### Source CI как достаточное release proof

Отвергнуто. Remapped package, embedded identity, exact release, real server startup, save, restart и persistent read-back требуют отдельных gates.

### Literal-loopback acceptance как замена реальному провайдеру

Отвергнуто. Детерминированный loopback доказывает production client protocol и bounded failure semantics, но не качество внешнего сервиса, физический microphone path, Voice Chat playback или end-to-end user experience.

### Свежий timeout budget на каждый provider stage

Отвергнут. Последовательные STT, Chat retries и TTS не должны суммировать независимые максимумы и растягивать один пользовательский turn.

<!-- case-study:evidence -->
## Что подтверждено

<div data-tr-project-evidence="livingworld"></div>

Evidence intentionally разделяет:

- исторический `0.1.20` partial PASS;
- `0.1.21` startup failure и safe rollback;
- corrective PRs #99–#102;
- PR #103 GameTests;
- PR #104 production-JAR startup/restart;
- PR #105 tombstone inventory ownership correction;
- PR #107 published exact release `0.1.25+1.21.1`;
- PR #108 deterministic Chat/STT/TTS production-client acceptance;
- PR #109 build/release gate hardening;
- PR #110 как pending Draft/RED work.

Статус `verified` относится только к перечисленным scopes. Он не означает, что cumulative acceptance завершена или что проект production-ready.

<!-- case-study:limitations -->
## Известные ограничения

- cumulative real-provider Text/STT/Chat/TTS и Voice Chat acceptance остаётся pending;
- literal-loopback acceptance не проверяет внешний provider, physical microphone и реальный playback;
- общий monotonic orchestration deadline пока существует только как RED-контракт PR #110;
- logical two-client Operator Lore conflict ещё не подтверждён отдельным live test;
- focused installed water-navigation, filled-grave и inventory resurrection canaries остаются обязательными;
- финальный product-owner acceptance и promotion не выполнены;
- Fabric остаётся primary package, а NeoForge — compatibility build с отдельными границами проверки.

<!-- case-study:next -->
## Следующий принятый шаг

Сначала необходимо реализовать M11 Phase C и сделать green exact-head контракт единого STT → Chat retries → TTS deadline, сохранив exactly-once dialogue и relationship commits.

После этого один exact published candidate должен пройти cumulative acceptance:

1. real Text/STT/Chat/TTS и Voice Chat;
2. global deadline и graceful TTS degradation;
3. logical two-client lore conflict;
4. focused water, filled-grave и inventory canaries;
5. controlled restart и persistent continuity;
6. product-owner acceptance.

До завершения этой последовательности lifecycle остаётся `release-candidate` / `ACCEPTANCE IN PROGRESS`.

<!-- case-study:related -->
## Связанные материалы

- [Server-authoritative AI NPC pipeline →](../notes/server-authoritative-ai-npcs.md)
- [LLM output как protocol boundary →](../notes/llm-output-is-a-protocol-boundary.md)
- [От source tests к installed acceptance →](../notes/source-tests-to-installed-acceptance.md)
- [Probabilistic proposals и deterministic authority →](../notes/probabilistic-proposals-deterministic-authority.md)
- [Restart и persistence как продуктовый контракт →](../notes/restart-persistence-is-a-product-contract.md)
- [Исходный код ↗](https://github.com/True-Ruslan/villAIgence)

<!-- case-study:retrospective -->
## Что бы я сделал иначе

Я бы определил полную authority map до глубокой provider-интеграции:

```text
mutable server state
→ immutable bounded snapshot
→ external proposal
→ current-state revalidation
→ authoritative effect
```

Episodic и semantic memory стоило разделить с первой версии, а Operator Lore — сразу определить как background context, а не знание мира.

Release gate также следовало установить до первого публичного candidate. Source tests, integration tests, package inspection, exact release, startup, restart, deterministic provider clients, live canaries и manual acceptance отвечают на разные вопросы. Их явное разделение превращает failed gate в полезное evidence, а не в исключение, скрытое за общим зелёным статусом.
