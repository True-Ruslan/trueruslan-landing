# VillAIgence — server-authoritative AI society for Minecraft

**VillAIgence** — MCA-derived мод для Minecraft 1.21.1, который вырос из AI-диалогов с жителями в эксперимент над устойчивым обществом NPC: с текстом и голосом, Memory 2.0, отношениями, операторским контекстом и действиями, которые остаются под контролем сервера.

**Текущий статус:** <span data-tr-project-status="livingworld"></span>

[Репозиторий на GitHub ↗](https://github.com/True-Ruslan/villAIgence)

Внутренние имена `LivingWorld / livingworld` остаются compatibility-sensitive частью движка, конфигурации и world-local data. Публичное имя проекта изменилось, но mod id `mca`, Java package root, `config/livingworld.json` и `<world>/livingworld/` не переименовываются без отдельной миграции.

![VillAIgence authority and acceptance boundaries](../../assets/diagrams/villaigence-authority-and-acceptance.svg)

<div data-tr-project-timeline="livingworld"></div>

<!-- case-study:problem -->
## Проблема: убедительный NPC всё равно должен подчиняться серверу

Изначальная идея была простой: игрок говорит с MCA-жителем текстом или голосом, а персонаж отвечает не как отдельный чат-бот, а как часть конкретного Minecraft-мира.

LLM-вызов оказался наименее сложной частью. Как только у NPC появились память, отношения, голос и потенциальные действия, система должна была ответить на более важные вопросы:

- кто владеет разговором;
- какой контекст действительно наблюдал сервер;
- что можно считать фактом, а что остаётся рассказом или предположением;
- как NPC сохраняет идентичность после restart;
- что делать со старым async-ответом после завершения сессии;
- как пережить частичный отказ STT, Chat или TTS;
- где заканчивается предложение модели и начинается authoritative изменение мира;
- какой exact artifact действительно запускался и что именно его проверка доказала.

Главный принцип:

> LLM никогда не является источником истины. Сервер владеет идентичностью, контекстом, памятью, отношениями, действиями и persistent evidence; модель только предлагает ответ или намерение.

Поэтому VillAIgence — не AI-чат внутри Minecraft, а распределённая система с внешними провайдерами, изменяемым миром, конкурентными игроками, долговременным состоянием и отдельной процедурой выпуска.

<!-- case-study:constraints -->
## Ограничения и риски

### Mutable world нельзя передавать в async pipeline напрямую

Пока выполняются STT, Chat и TTS, игрок может уйти, NPC — сменить состояние, сессия — завершиться, а отношения или мир — измениться. Перед внешним вызовом сервер собирает immutable bounded snapshot. Ответ применяется только после повторной проверки актуального authoritative state.

### Text и voice должны сходиться в один conversation core

Голос — транспорт, а не отдельная доменная модель.

```text
voice PCM → STT → validated message ┐
                                     ├→ context → Chat → response → optional TTS
text command → validated message ────┘
```

Если TTS не сработал, готовый текст остаётся полезным. Если STT недоступен, текстовый путь продолжает работать. Если Chat вернул ошибку, незавершённый ответ не получает право изменить память или мир.

### Память не должна быть бесконечным transcript

VillAIgence разделяет:

- `memory.json` — bounded legacy dialogue history;
- `memory2.json` — episodic `DIALOGUE`, `OBSERVATION`, `ACTION` и `RELATIONSHIP_CHANGE`;
- `semantic-memory.json` — typed `FACT` и `BELIEF`;
- `relationships.json` — player ↔ NPC relationship state;
- `voices.json` — устойчивая voice identity;
- `operator-lore.json` — явно заданный оператором background context.

`FACT` требует server-owned evidence и provenance `SYSTEM_OBSERVED`. Сообщение игрока, реплика другого NPC или вывод модели могут стать `BELIEF`, но confidence не повышает их до факта.

### Provider и release pipeline — внешние границы

Ответы ограничены по размеру и времени. Authenticated redirects блокируются. Небезопасные endpoint, loopback/SSRF-пути, malformed JSON, пустые ответы и oversized bodies должны завершаться bounded failure.

Зелёный source CI не доказывает, что remapped JAR запускается на настоящем сервере. Source tests, GameTests, package inspection, embedded identity, production-JAR startup, restart, persistent hashes и cumulative acceptance отвечают на разные вопросы.

<!-- case-study:current-state -->
## Текущая lifecycle- и acceptance-граница

Канонический принятый автоматизированный контур относится к опубликованному candidate `0.1.23+1.21.1`.

Подтверждено отдельно и ограниченно:

- каталог из 28 risk-based сценариев;
- семь isolated real-server Fabric GameTests;
- установка exact remapped production JAR вне Loom/dev classpath;
- два отдельных JVM-запуска до Minecraft ready marker;
- controlled shutdown, полный world save и exit code 0;
- неизменные пути и SHA-256 для `memory.json`, `memory2.json`, `semantic-memory.json`, `relationships.json`, `voices.json` и `operator-lore.json` после restart;
- отсутствие test fixture code в distributable JAR.

Это доказывает production-JAR startup + restart boundary. Оно не доказывает cumulative real-provider, multiplayer и gameplay acceptance.

Текущий публичный lifecycle остаётся **release candidate — ACCEPTANCE IN PROGRESS**.

Активная разработка отделена от принятого состояния. Draft PR #110 на observed head `e0b763aa4a5caea8897aadc6ee2cab6c1b407c89` определяет RED-контракт для одного общего STT → Chat retries → TTS deadline и exactly-once commits. Repository security policy и Java PR checks проходят, но основной CI намеренно падает на ещё не реализованных production APIs. PR #110 не является реализацией, installed acceptance или основанием для promotion.

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

Оператор может задать lore для `WORLD`, `PLAYER`, `VILLAGER` и `VILLAGE`, но клиент не получает файловую или идентификационную authority.

```text
operator UI
→ bounded C2S request
→ permission check
→ trusted scope/target resolution
→ SHA-256 revision check
→ atomic world-local write
→ canonical S2C value/status/revision
```

Conflict требует reload/review. Blind overwrite отсутствует. Lore не становится автоматически semantic FACT и не подменяет текущие наблюдения мира.

### Capability-level degradation вместо общего «AI сломан»

STT, Chat и TTS имеют независимые failure boundaries. Retry не должен повторно записывать память, действие или изменение отношений. Диагностика не содержит ключи, prompts, transcripts или hidden reasoning.

### Selective MCA synchronization вместо большого upstream merge

Исправления MCA переносятся отдельными проверяемыми packages: tombstone integrity, UUID conversion, beds/tickets, water and ladder navigation, pathfinding, mourning, gifts, fishing и mounted archer behavior. Так AI/security/persistence boundaries не растворяются в массовом merge.

### Release identity является частью продукта

Версия в имени файла недостаточна. Candidate должен иметь согласованную Fabric metadata, manifest identity, remapped package structure и checksum. Затем тот же exact JAR устанавливается в production-like server environment.

### Acceptance каталог строится от рисков

PR #103 добавил M11 Phase A: 28 сценариев по семи risk domains и семь Fabric GameTests. PR #104 добавил M11 Phase B: isolated production-JAR startup, controlled shutdown и restart. GameTest evidence остаётся development integration proof; production-JAR gate остаётся installed automated proof; ни один из них не заменяет cumulative operator acceptance.

## Реальные отказы, которые изменили архитектуру

### Transcript-first память не выдержала развитие общества

Когда память была в основном историей сообщений, невозможно было надёжно различать наблюдение, действие, отношение и устойчивое знание. Memory 2.0 появился ради явной модели provenance, ownership, consolidation и retention, а не ради более длинного prompt.

### Широкий hook прошёл source gates и сломал installed startup

Filled-grave fix сначала был подключён через `MixinTombstoneBlock`. Candidate `0.1.21+1.21.1` дошёл до установленной проверки и упал на startup: production target не разрешился. Исправление перенесло preservation policy напрямую в owned `TombstoneBlock` source, а obsolete Mixin был удалён и запрещён package gate.

### Навигационная идея переопределила vanilla contract слишком широко

В установленном `0.1.20+1.21.1` NPC застрял в воде и утонул. Исправление сохранило inherited `GroundPathNavigation.getTempMobPos` и сузило MCA-aware логику до surface calculation.

### Loot path мог уничтожить persistent gameplay object

Заполненная могила при Silk Touch исчезала без item drop. Filled-only preservation policy и настоящий `TombstoneBlock.getDrops(...)` GameTest закрыли конкретную границу, но focused installed gameplay canary остаётся отдельным gate.

### Green dialogue path не отменяет задержку

Один Chat request в `0.1.20` занял примерно 272 секунды. Success code без user-visible deadline не является полным success contract. Именно поэтому Phase C требует один monotonic budget на всю voice orchestration, а не новый timeout для каждого этапа.

### Safe rollback — самостоятельный результат

После startup failure `0.1.21` сервер был возвращён на `0.1.20`. Все шесть persistent hashes совпали, сервер снова достиг `STARTED`, TCP 25565, UDP 24454, Voice Chat и monitor восстановились. Acceptance должна доказывать не только promotion, но и безопасный отказ от promotion.

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

Отвергнуто. Remapped package, embedded identity, real server startup, save, restart и persistent read-back требуют отдельных gates.

### Свежий timeout budget на каждый provider stage

Отвергнут. Последовательные STT, Chat retries и TTS не должны суммировать независимые максимумы и растягивать один пользовательский turn. Phase C закрепляет единый monotonic deadline.

<!-- case-study:evidence -->
## Что подтверждено

<div data-tr-project-evidence="livingworld"></div>

Evidence intentionally разделяет:

- исторический `0.1.20` partial PASS;
- `0.1.21` startup failure и safe rollback;
- corrective PRs #99–#102;
- PR #103 GameTests;
- PR #104 production-JAR startup/restart;
- PR #110 как pending Draft/RED work.

Статус `verified` относится только к перечисленным scopes. Он не означает, что cumulative acceptance завершена или что проект production-ready.

<!-- case-study:limitations -->
## Известные ограничения

- cumulative real-provider Text/STT/Chat/TTS и Voice Chat acceptance остаётся pending;
- общий monotonic orchestration deadline пока существует только как RED-контракт PR #110;
- logical two-client Operator Lore conflict ещё не подтверждён отдельным live test;
- focused installed water-navigation и filled-grave canaries остаются обязательными;
- Chat latency должна оцениваться относительно user-visible deadline, а не только HTTP success;
- финальный product-owner acceptance и promotion не выполнены;
- Fabric остаётся primary package, а NeoForge — compatibility build с отдельными границами проверки.

<!-- case-study:next -->
## Следующий принятый шаг

Сначала необходимо реализовать M11 Phase C и сделать green exact-head контракт единого STT → Chat retries → TTS deadline, сохранив exactly-once dialogue и relationship commits.

После этого один exact published candidate должен пройти cumulative acceptance:

1. real Text/STT/Chat/TTS и Voice Chat;
2. global deadline и graceful TTS degradation;
3. logical two-client lore conflict;
4. focused water и filled-grave canaries;
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

Release gate также следовало установить до первого публичного candidate. Source tests, integration tests, package inspection, startup, restart, live canaries и manual acceptance отвечают на разные вопросы. Их явное разделение превращает failed gate в полезное evidence, а не в исключение, скрытое за общим зелёным статусом.
