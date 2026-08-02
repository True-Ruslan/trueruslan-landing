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

- кто сейчас владеет разговором;
- какой контекст действительно наблюдал сервер;
- что можно считать фактом, а что остаётся рассказом или предположением;
- как один и тот же NPC сохраняет идентичность после restart;
- что делать со старым async-ответом после завершения сессии;
- как пережить частичный отказ STT, Chat или TTS;
- где заканчивается предложение модели и начинается authoritative изменение мира.

Поэтому центральный принцип VillAIgence сформулирован жёстко:

> LLM никогда не является источником истины. Сервер владеет идентичностью, контекстом, памятью, отношениями, действиями и persistent evidence; модель только предлагает ответ или намерение.

Это превращает проект не в «AI-чат внутри Minecraft», а в обычную распределённую систему с внешними провайдерами, изменяемым миром, конкурентными игроками, долговременным состоянием и обязательной процедурой выпуска.

<!-- case-study:constraints -->
## Ограничения, которые определили архитектуру

### Mutable world нельзя передавать в async pipeline напрямую

Пока выполняются STT, Chat и TTS, игрок может уйти, NPC — сменить состояние, сессия — завершиться, а отношения или мир — измениться. Поэтому provider request не должен читать живые mutable-объекты в произвольный момент.

Перед внешним вызовом сервер собирает immutable bounded snapshot: идентичность участников, наблюдаемые факты, разрешённый операторский контекст и ограниченную выборку памяти. Ответ применяется только после повторной проверки актуального authoritative state.

### Text и voice должны сходиться в один conversation core

Голос — транспорт, а не отдельная доменная модель.

```text
voice PCM → STT → validated message ┐
                                     ├→ context → Chat → response → optional TTS
text command → validated message ────┘
```

Если TTS не сработал, готовый текст остаётся полезным. Если STT недоступен, текстовый путь продолжает работать. Если Chat вернул ошибку, никакой незавершённый ответ не получает право изменить память или мир.

### Память не должна быть бесконечным transcript

Обычная история реплик плохо отделяет эпизод от знания и быстро привязывает persistent state к prompt-формату одного провайдера.

VillAIgence хранит несколько разных слоёв:

- legacy `memory.json` как bounded dialogue history;
- `memory2.json` для episodic `DIALOGUE`, `OBSERVATION`, `ACTION` и `RELATIONSHIP_CHANGE`;
- `semantic-memory.json` для typed `FACT` и `BELIEF`;
- `relationships.json` для player ↔ NPC relationship state;
- `voices.json` для устойчивой voice identity;
- `operator-lore.json` для явно заданного оператором background context.

### FACT нельзя получить из убедительной фразы

`FACT` требует server-owned evidence и provenance `SYSTEM_OBSERVED`. Сообщение игрока, реплика другого NPC или вывод модели могут стать `BELIEF`, но confidence не повышает их до факта.

Текущие наблюдения мира имеют приоритет над conflicting operator lore и recalled memory.

### Provider и release pipeline являются внешними границами

Ответы ограничены по размеру и времени. Authenticated redirects блокируются. Небезопасные endpoint, loopback/SSRF-пути, malformed JSON, пустые ответы и oversized bodies должны завершаться bounded failure, а не неограниченным чтением или скрытым изменением состояния.

Зелёный source CI также не доказывает, что remapped JAR запускается на реальном сервере. Для выпуска нужны отдельные уровни: package structure, embedded identity, installed startup, focused gameplay regressions, restart и persistent hashes.

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
7. отдельно валидирует любые proposed actions или relationship deltas.

Старый ответ может быть технически корректным, но уже не иметь права на применение. Cancellation и supersession поэтому являются нормальным control flow.

### Memory 2.0 разделяет эпизоды, семантику и authority

Episodic memory отвечает на вопрос «что произошло», semantic memory — «что NPC считает знанием», а authoritative world state — «что действительно верно сейчас».

У каждой записи есть owner NPC, provenance, deterministic identity и bounded retention. Consolidation объединяет источники, но не стирает source-event IDs. Forgetting определяется детерминированной storage policy и pressure внутри конкретного NPC, а не решением LLM.

Text и voice создают одинаковые episodic `DIALOGUE` events. `ACTION` и `RELATIONSHIP_CHANGE` попадают в память только после server-owned execution. Это сохраняет multi-NPC isolation и не позволяет повторному provider response дублировать эффект.

### Operator Lore — отдельный background layer

Оператор может задать lore для `WORLD`, `PLAYER`, `VILLAGER` и `VILLAGE`, но клиент не получает файловую или идентификационную authority.

Поток редактирования остаётся серверным:

```text
operator UI
→ bounded C2S request
→ permission check
→ trusted scope/target resolution
→ SHA-256 revision check
→ atomic world-local write
→ canonical S2C value/status/revision
```

Конфликт revision требует reload/review. Blind overwrite отсутствует. Lore не становится автоматически semantic FACT и не подменяет текущие наблюдения мира.

### Capability-level degradation вместо общего состояния «AI сломан»

STT, Chat и TTS имеют независимые failure boundaries. Retry не должен повторно записывать память, действие или изменение отношений. Диагностика не содержит ключи, prompts, transcripts или hidden reasoning.

Network baseline включает HTTPS policy, endpoint-family binding, blocked authenticated redirects, bounded Chat/STT/TTS/error bodies, total body deadline и aggregate active PCM limit.

### Selective MCA synchronization вместо большого upstream merge

Исправления MCA переносятся как отдельные проверяемые packages: tombstone integrity, UUID conversion, beds/tickets, water and ladder navigation, pathfinding, mourning, gifts, fishing и mounted archer behavior.

Так AI/security/persistence boundaries не растворяются в массовом merge, а каждый пакет получает свой RED/GREEN и installed acceptance scope.

### Release identity является частью продукта

Версия в имени файла недостаточна. Release candidate должен иметь согласованную Fabric metadata, manifest identity, remapped package structure и checksum. Только после этого тот же exact JAR устанавливается на сервер и проходит startup/gameplay/restart acceptance.

Диаграмма выше показывает две независимые линии: authority внутри runtime и переход доказательств от source tests к installed acceptance. Их нельзя сокращать до одного зелёного badge.

<!-- case-study:failures -->
## Что пришлось исправлять по реальным отказам

### Transcript-first память не выдерживает развитие общества

Пока память была в основном историей сообщений, сложно было различать наблюдение, действие, отношение и устойчивое знание. Memory 2.0 появился не ради более длинного prompt, а ради явной модели provenance, ownership, consolidation и retention.

### Широкий hook может пройти package tests и сломать installed startup

Исправление filled grave сначала было подключено через `MixinTombstoneBlock`. Exact `0.1.21+1.21.1` дошёл до installed проверки и упал на startup: production target для injection не разрешился.

Это важный отрицательный результат. Source-level намерение было правильным, но hook находился на неверной authority boundary. В PR #102 сохранение tombstone data перенесено напрямую в owned `TombstoneBlock` source, а obsolete Mixin удалён и запрещён package regression gate.

### Корректная навигационная идея может переопределить vanilla contract слишком широко

В установленном `0.1.20+1.21.1` NPC застрял в воде и утонул. Причиной оказался слишком широкий water-navigation hook, который изменял inherited temporary path position. PR #99 оставил vanilla `GroundPathNavigation.getTempMobPos` и сузил MCA-aware логику до surface calculation.

Автоматическая проверка этого исправления не равна живой проверке выхода NPC из воды — она ещё должна пройти на exact candidate JAR.

### Loot path может уничтожить persistent gameplay object

Заполненная могила при Silk Touch исчезала без item drop, вместе с риском потерять stored body/inventory data. PR #100 добавил filled-only preservation policy, а PR #102 перенёс wiring в owned source, чтобы исправление не зависело от хрупкой injection point.

### Green dialogue path не отменяет операционную задержку

Один Chat request в `0.1.20` занял примерно 272 секунды. Запрос завершился, но такой результат остаётся release defect для пользовательского опыта. Success code без latency boundary не является полным success contract.

### Snapshot identity разрушает exact-artifact evidence

`0.1.20` был установлен как именованный release JAR, но runtime сообщал snapshot identity. PR #101 сделал release version обязательным входом и добавил fail-closed проверки metadata/manifest. Это устраняет двусмысленность между проверяемым файлом и тем, что сообщает запущенный мод.

<!-- case-study:current-state -->
## Где проект находится сейчас

Канонический source head на момент этого snapshot: `e13660f5998fa1ed343548252d573140adc5b0c9`.

`0.1.20+1.21.1 — PARTIAL PASS`: основной Text/STT/Chat/TTS/Voice Chat pipeline, Operator Lore, persistence, restart, rollback-world compatibility и большинство синхронизированных gameplay-сценариев прошли, но четыре дефекта не позволили считать релиз полностью принятым.

`0.1.21+1.21.1` не дошёл до gameplay acceptance: startup остановился на `MixinTombstoneBlock`. После rollback шесть persistent hashes совпали, сервер снова достиг `STARTED`, а TCP, UDP, Voice Chat и monitor восстановились.

После PRs #99–#102 сформирован corrective `0.1.22+1.21.1` code candidate. Automated source/package gates зелёные, но exact installed startup, water, grave, restart и cumulative acceptance всё ещё **pending**. Эта страница намеренно не называет кандидат принятым релизом.

Следующий шаг находится не в добавлении новой функции: нужно собрать один exact artifact, установить его на backed-up world, повторить focused defects, проверить Text/STT/Chat/TTS, restart и persistent hashes и только затем принимать решение о promotion.

После этого можно возвращаться к additive migration legacy `memory.json`, controlled BELIEF producers, causal relationship reasons, long-horizon soak и NPC-to-NPC knowledge propagation.

<!-- case-study:evidence -->
## Что подтверждено, а что остаётся pending

<div data-tr-project-evidence="livingworld"></div>

Evidence snapshot разделяет три разных факта:

- установленный `0.1.20` действительно прошёл большой cumulative scenario, но завершился partial PASS с конкретными дефектами;
- corrective PR train действительно прошёл автоматические и package gates, но не доказывает installed behavior;
- установленный `0.1.21` действительно не запустился, а безопасный rollback действительно восстановил сервис и persistent state.

Такой negative evidence для меня не менее важен, чем зелёный CI. Он показывает, на каком именно переходе source → package → runtime перестало работать предположение, и не позволяет следующему документу незаметно превратить code fix в live acceptance.

<!-- case-study:retrospective -->
## Что бы я сделал иначе, начиная проект сегодня

Я бы раньше описал не только conversation state machine, но и полную authority map: mutable server state → immutable snapshot → provider proposal → revalidation → authoritative effect. Это сократило бы количество мест, где async-код мог случайно получить слишком широкие права.

Memory сразу проектировал бы как сочетание episodic events, semantic entries и текущего world truth, а не как постепенно усложняемый transcript. Операторский lore также сразу отделил бы от наблюдаемых фактов.

Для upstream gameplay fixes я бы с начала требовал narrow hook или direct owned-source wiring и отдельную проверку remapped JAR. Ошибка `0.1.21` показала, что compile-time и source-level tests не гарантируют корректную production injection point.

Наконец, release gate я бы формализовал ещё до первых кандидатов:

```text
source tests
→ distributable package inspection
→ exact embedded identity
→ installed startup
→ focused regressions
→ restart and persistent hashes
→ cumulative acceptance
→ promotion
```

VillAIgence остаётся проектом про AI-персонажей, но инженерно он всё больше становится проектом про authority, долговременное состояние и доказательства. Именно эти границы определяют, может ли NPC казаться живым, не превращая внешний AI в неконтролируемого владельца мира.
