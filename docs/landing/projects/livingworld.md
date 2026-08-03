# VillAIgence — server-authoritative AI society for Minecraft

**VillAIgence** — MCA-derived мод для Minecraft 1.21.1, который постепенно вырос из AI-диалогов с жителями в эксперимент над устойчивым обществом NPC: с голосом, памятью, отношениями, операторским контекстом и действиями, которые остаются под контролем сервера.

[Репозиторий на GitHub ↗](https://github.com/True-Ruslan/villAIgence)

Внутренние имена `LivingWorld / livingworld` остаются compatibility-sensitive частью движка, конфигурации и world-local data. Публичное имя проекта изменилось, но mod id `mca`, Java package root, `config/livingworld.json` и `<world>/livingworld/` не переименовываются без отдельной миграции.

![VillAIgence authority and acceptance boundaries](../../assets/diagrams/villaigence-authority-and-acceptance.svg)

<div data-tr-project-timeline="livingworld"></div>

<!-- case-study:problem -->
## Проблема: убедительный NPC всё равно должен подчиняться серверу

Изначальная идея была простой: игрок говорит с MCA-жителем текстом или голосом, а персонаж отвечает не как отдельный чат-бот, а как часть конкретного Minecraft-мира.

Но LLM-вызов оказался наименее сложной частью. Как только у NPC появились память, отношения, голос и потенциальные действия, система должна была отвечать на более важные вопросы:

- кто владеет разговором;
- какой контекст действительно наблюдал сервер;
- что можно считать фактом, а что остаётся рассказом или предположением;
- как NPC сохраняет идентичность после restart;
- что делать со старым async-ответом после завершения сессии;
- как пережить частичный отказ STT, Chat или TTS;
- где заканчивается предложение модели и начинается authoritative изменение мира;
- какой exact artifact действительно запускался и что именно его проверка доказала.

Центральный принцип сформулирован жёстко:

> LLM никогда не является источником истины. Сервер владеет идентичностью, контекстом, памятью, отношениями, действиями и persistent evidence; модель только предлагает ответ или намерение.

Поэтому VillAIgence — не только AI-чат внутри Minecraft. Это распределённая система с внешними провайдерами, изменяемым миром, конкурентными игроками, долговременным состоянием и отдельной процедурой выпуска.

<!-- case-study:constraints -->
## Ограничения, которые определили архитектуру

### Mutable world нельзя передавать в async pipeline напрямую

Пока выполняются STT, Chat и TTS, игрок может уйти, NPC — сменить состояние, сессия — завершиться, а отношения или мир — измениться.

Перед внешним вызовом сервер собирает immutable bounded snapshot: идентичность участников, наблюдаемые факты, разрешённый операторский контекст и ограниченную выборку памяти. Ответ применяется только после повторной проверки актуального authoritative state.

### Text и voice должны сходиться в один conversation core

Голос — транспорт, а не отдельная доменная модель.

```text
voice PCM → STT → validated message ┐
                                     ├→ context → Chat → response → optional TTS
text command → validated message ────┘
```

Если TTS не сработал, готовый текст остаётся полезным. Если STT недоступен, текстовый путь продолжает работать. Если Chat вернул ошибку, незавершённый ответ не получает право изменить память или мир.

### Память не должна быть бесконечным transcript

VillAIgence хранит разные слои:

- `memory.json` — bounded legacy dialogue history;
- `memory2.json` — episodic `DIALOGUE`, `OBSERVATION`, `ACTION` и `RELATIONSHIP_CHANGE`;
- `semantic-memory.json` — typed `FACT` и `BELIEF`;
- `relationships.json` — player ↔ NPC relationship state;
- `voices.json` — устойчивая voice identity;
- `operator-lore.json` — явно заданный оператором background context.

### FACT нельзя получить из убедительной фразы

`FACT` требует server-owned evidence и provenance `SYSTEM_OBSERVED`. Сообщение игрока, реплика другого NPC или вывод модели могут стать `BELIEF`, но confidence не повышает их до факта.

### Provider и release pipeline — внешние границы

Ответы ограничены по размеру и времени. Authenticated redirects блокируются. Небезопасные endpoint, loopback/SSRF-пути, malformed JSON, пустые ответы и oversized bodies должны завершаться bounded failure.

Зелёный source CI не доказывает, что remapped JAR запускается на реальном сервере. Для выпуска нужны отдельные уровни: source tests, package structure, embedded identity, production-JAR startup, focused regressions, restart, persistent hashes и cumulative acceptance.

<!-- case-study:decisions -->
## Ключевые решения

### Server-authoritative session и immutable context

Разговор начинается с серверной связи `player ↔ NPC`, а не с provider request.

1. сервер разрешает взаимодействие с живым MCA-жителем;
2. фиксирует владельца сессии и persistent NPC identity;
3. принимает text/voice только внутри актуальной сессии;
4. собирает immutable bounded context;
5. передаёт провайдеру только подготовленное представление;
6. после ответа повторно проверяет session, NPC и world state;
7. отдельно валидирует proposed actions и relationship deltas.

Старый ответ может быть технически корректным, но уже не иметь права на применение. Cancellation и supersession поэтому являются нормальным control flow.

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

Исправления MCA переносятся отдельными проверяемыми packages: tombstone integrity, UUID conversion, beds/tickets, water and ladder navigation, pathfinding, mourning, gifts, fishing и mounted archer behavior.

Так AI/security/persistence boundaries не растворяются в массовом merge, а каждый пакет получает свой RED/GREEN и acceptance scope.

### Release identity является частью продукта

Версия в имени файла недостаточна. Candidate должен иметь согласованную Fabric metadata, manifest identity, remapped package structure и checksum. Затем тот же exact JAR устанавливается в production-like server environment.

### Acceptance каталог строится от рисков, а не только от прошлых багов

PR #103 добавил M11 Phase A: dependency-free каталог из 28 сценариев по семи risk domains и семь isolated real-server Fabric GameTests.

Они проверяют:

- реальную MCA navigation wiring;
- NPC → tombstone item → NPC round trip с UUID, именем и inventory multiset;
- настоящий Silk Touch `TombstoneBlock.getDrops(...)` для заполненной могилы;
- empty-grave negative control;
- deterministic water-navigation properties и возвращение на сухой маршрут;
- отсутствие test-mod leakage в distributable JAR.

GameTest доказывает конкретную integration/algorithm boundary. Он не выдаётся за installed production-JAR startup или ручную cumulative acceptance.

### Production-JAR startup и restart стали автоматическим gate

PR #104 добавил M11 Phase B. Exact remapped Fabric candidate устанавливается в изолированный сервер вне Loom/dev classpath вместе с pinned Fabric Installer, Fabric API и Simple Voice Chat.

Harness:

1. проверяет manifest с версиями, размерами и SHA-256;
2. запускает настоящий Fabric 1.21.1 server;
3. ждёт ready marker;
4. отправляет `stop`;
5. требует полного world save и exit code 0;
6. повторяет запуск во втором JVM;
7. сравнивает пути и SHA-256 всех шести canonical stores;
8. запрещает fixture classes и mod ID в production JAR.

Это production-JAR startup → controlled shutdown → restart evidence. Оно всё ещё не равно реальному provider, multiplayer и gameplay acceptance.

<!-- case-study:failures -->
## Что пришлось исправлять по реальным отказам

### Transcript-first память не выдерживает развитие общества

Пока память была в основном историей сообщений, сложно было различать наблюдение, действие, отношение и устойчивое знание. Memory 2.0 появился не ради более длинного prompt, а ради явной модели provenance, ownership, consolidation и retention.

### Широкий hook прошёл source gates и сломал installed startup

Исправление filled grave сначала было подключено через `MixinTombstoneBlock`. Exact `0.1.21+1.21.1` дошёл до установленной проверки и упал на startup: production target для injection не разрешился.

PR #102 перенёс сохранение tombstone data напрямую в owned `TombstoneBlock` source. Obsolete Mixin удалён и запрещён package regression gate.

### Навигационная идея переопределила vanilla contract слишком широко

В установленном `0.1.20+1.21.1` NPC застрял в воде и утонул. PR #99 сохранил inherited `GroundPathNavigation.getTempMobPos` и сузил MCA-aware логику до surface calculation.

Phase A теперь даёт deterministic GameTest evidence для navigation properties, но реальный focused canary с полным MCA brain/goal behavior остаётся отдельной проверкой.

### Loot path мог уничтожить persistent gameplay object

Заполненная могила при Silk Touch исчезала без item drop, вместе с риском потерять stored body/inventory data. PRs #100 и #102 добавили filled-only preservation policy и direct owned-source wiring.

GameTest подтверждает настоящий `getDrops(...)` round trip. Ручной installed gameplay canary всё равно остаётся самостоятельным gate.

### Green dialogue path не отменяет задержку

Один Chat request в `0.1.20` занял примерно 272 секунды. Запрос завершился, но success code без user-visible deadline не является полным success contract.

### Snapshot identity разрушает exact-artifact evidence

`0.1.20` был установлен как именованный release JAR, но runtime сообщал snapshot identity. PR #101 сделал release version обязательным входом и добавил fail-closed проверки metadata/manifest.

### Safe rollback — часть результата, а не скрытая неудача

После startup failure `0.1.21` сервер был возвращён на `0.1.20`. Все шесть persistent hashes совпали, сервер снова достиг `STARTED`, TCP 25565, UDP 24454, Voice Chat и monitor восстановились.

Этот результат показывает, что acceptance должна доказывать не только promotion, но и безопасный отказ от promotion.

<!-- case-study:current-state -->
## Где проект находится сейчас

Канонический source head на момент snapshot: `61b66e38e99c1dc9bdc26089bfb345a250a881e2`.

Историческая installed boundary остаётся важной:

- `0.1.20+1.21.1` — **PARTIAL PASS**: основной Text/STT/Chat/TTS/Voice Chat pipeline, Operator Lore, persistence, restart и большинство gameplay-сценариев прошли, но четыре дефекта заблокировали полную acceptance;
- `0.1.21+1.21.1` — startup failure на production-unsafe tombstone Mixin с успешным safe rollback.

После corrective PRs #99–#102 и acceptance PRs #103–#104 опубликован candidate `0.1.23+1.21.1`.

Для exact production artifact уже подтверждено автоматикой:

- validated 28-scenario risk catalogue;
- семь real-server Fabric GameTests;
- exact remapped production JAR вне dev classpath;
- два отдельных JVM startup до ready marker;
- controlled `stop`, полный save и exit code 0;
- одинаковые relative paths и SHA-256 для `memory.json`, `memory2.json`, `semantic-memory.json`, `relationships.json`, `voices.json` и `operator-lore.json` после restart;
- отсутствие fixture/test-mod leakage в distributable JAR.

**Cumulative acceptance остаётся pending.** Автоматический production-JAR startup/restart gate не доказывает:

- реальный Text/STT/Chat/TTS и Voice Chat с provider boundaries;
- global Chat deadline под реальным transport;
- logical two-client Operator Lore conflict;
- focused live water and filled-grave gameplay canaries;
- полную operator/product-owner acceptance установленного кандидата.

Поэтому публичный lifecycle остаётся `release-candidate`, а статус страницы — `ACCEPTANCE IN PROGRESS`, не production-ready.

<!-- case-study:evidence -->
## Что подтверждено, а что остаётся pending

<div data-tr-project-evidence="livingworld"></div>

Evidence snapshot разделяет пять фактов:

- установленный `0.1.20` прошёл большой cumulative scenario, но завершился partial PASS;
- установленный `0.1.21` не запустился, а rollback восстановил сервис и persistent state;
- corrective code действительно прошёл source/package gates;
- Phase A действительно проверяет risk-based GameTest scope;
- Phase B действительно проверяет exact production-JAR startup, shutdown, restart и persistent hashes.

Ни один автоматический сигнал не получает права называться более широкой ручной acceptance, чем его scope.

<!-- case-study:retrospective -->
## Что бы я сделал иначе, начиная проект сегодня

Я бы раньше описал полную authority map:

```text
mutable server state
→ immutable bounded snapshot
→ provider proposal
→ revalidation
→ authoritative effect
→ persistent evidence
```

Memory сразу проектировал бы как episodic events, semantic entries и текущий world truth, а не как постепенно усложняемый transcript. Operator Lore также сразу отделил бы от наблюдаемых фактов.

Для gameplay fixes я бы с начала требовал narrow hook или direct owned-source wiring и отдельную проверку remapped JAR. Ошибка `0.1.21` показала, что compile-time и source-level tests не гарантируют production injection point.

Release gate я бы формализовал так:

```text
source tests
→ real integration GameTests
→ distributable package inspection
→ exact embedded identity
→ production-JAR startup
→ controlled shutdown and restart
→ focused live regressions
→ cumulative provider/multiplayer acceptance
→ promotion
```

VillAIgence остаётся проектом про AI-персонажей, но инженерно он всё больше становится проектом про authority, долговременное состояние и доказательства. Именно эти границы определяют, может ли NPC казаться живым, не превращая внешний AI в неконтролируемого владельца мира.
