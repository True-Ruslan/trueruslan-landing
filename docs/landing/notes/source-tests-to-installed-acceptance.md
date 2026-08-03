# От source tests к installed acceptance: что доказывает каждый release gate

В разработке VillAIgence у меня несколько раз возникала одна и та же иллюзия: если tests прошли, оба loader build собраны, JAR сформирован и release опубликован, то следующий шаг выглядит почти формальным — поставить artifact на сервер и убедиться, что всё запускается.

На практике именно после слова «поставить» начиналась другая система доказательств.

Repository tests могли корректно проверить исходную логику. Package gate мог убедиться, что нужные классы попали в distributable JAR. Release identity contract мог подтвердить, что версия внутри artifact совпадает с именем tag. И всё равно exact production artifact мог упасть раньше загрузки мира из-за различий между development namespace, remapped namespace, Loom classpath и настоящим Fabric server runtime.

Поэтому сейчас я не воспринимаю release pipeline как один длинный зелёный статус. Для меня это последовательность gates, каждый из которых отвечает на отдельный вопрос:

```text
source tests
→ loader/build checks
→ distributable package
→ exact embedded identity
→ server GameTests
→ exact production JAR startup
→ controlled shutdown and restart
→ persistent-store hashes
→ focused installed canaries
→ cumulative acceptance
→ promotion
```

Пропустить один уровень нельзя просто потому, что предыдущий оказался зелёным.

## Один зелёный статус скрывает разные вопросы

Фраза `CI passed` может одновременно означать очень разные вещи:

- Java-код скомпилировался;
- unit tests прошли;
- Fabric и NeoForge builds собраны;
- remapped JAR содержит требуемые classes;
- release metadata совпадает с tag;
- тестовый Minecraft server запустил GameTests;
- exact distributable candidate стартовал вне development classpath;
- тот же мир пережил controlled restart;
- real provider path проверен на настоящем сервере;
- пользовательские сценарии прошли manual acceptance.

Эти утверждения не взаимозаменяемы.

Например:

```text
source contract PASS
≠
production namespace wiring PASS
```

```text
GameTest server PASS
≠
exact release JAR startup PASS
```

```text
production JAR restart PASS
≠
real Text/STT/Chat/TTS acceptance PASS
```

Главная сложность здесь не в количестве jobs. Она в том, чтобы каждому job назначить понятный oracle: какой конкретный факт превращает этот gate в PASS и какие выводы из него делать нельзя.

## Source tests: доказательство логики в контролируемой среде

История corrective releases началась после installed acceptance версии `0.1.20+1.21.1`.

Это была не бесполезная или полностью сломанная версия. Acceptance завершилась как **partial PASS**. Text, STT, Chat, TTS, Voice Chat, Operator Lore, restart и большая часть синхронизированного поведения работали в записанных границах.

Но одновременно проявились четыре серьёзных дефекта:

- один NPC застрял в воде, утонул и погиб;
- заполненная могила при разрушении Silk Touch киркой исчезла без переносимого grave item;
- embedded version внутри JAR оставалась `1.21.1-SNAPSHOT`, хотя filename и release tag сообщали `0.1.20+1.21.1`;
- один Chat request занял приблизительно 272 секунды.

То есть repository evidence не было ложным. Оно просто не охватывало реальные условия, в которых проявились эти дефекты.

PR #99 исправил water navigation. Причина оказалась в слишком широком override `getTempMobPos()`: адаптация меняла больше vanilla path-following поведения, чем требовалось для water-aware surface policy. Коррекция вернула inherited position semantics и оставила узкую настройку поверхности воды.

Source regression test и remapped-package inspection хорошо фиксировали новую архитектурную границу:

```text
MCAGroundPathNavigation
не должен переопределять getTempMobPos(...)
```

Но этот gate не доказывает, что два настоящих MCA NPC выйдут из воды на установленном сервере. Он доказывает только то, что source и packaged bytecode соответствуют исправленному контракту.

PR #100 аналогично исправил filled grave drop. Unit-level `TombstoneDropPolicy` проверял, что заполненная могила всегда выбирает ровно один переносимый target stack, сохраняет порядок остальных drops и записывает body data только в один tombstone item.

Это сильное доказательство доменной логики. Но до installed canary оно не доказывает весь путь:

```text
real block break
→ loot evaluation
→ portable grave item
→ block placement
→ resurrection
→ identity and inventory round trip
```

Source tests особенно полезны там, где invariant можно выразить детерминированно и быстро. Их слабое место начинается не из-за «некачественных тестов», а там, где важный риск принадлежит другому runtime layer.

## Build и package: собрался ли распространяемый artifact

После source tests следующий вопрос — не «правильна ли логика?», а «что именно будет отдано пользователю?».

У multi-loader Minecraft mod это отдельная граница. Common source может компилироваться, Fabric и NeoForge могут собираться, но distributable artifact всё равно способен потерять:

- нужный class;
- Mixin registration;
- refmap mapping;
- manifest attribute;
- loader metadata;
- правильную embedded version;
- отсутствие test-only fixture code.

Поэтому вокруг VillAIgence появились package contracts, которые открывают remapped JAR и проверяют его содержимое как готовый продукт, а не как побочный результат Gradle task.

Например, после PR #99 package gate проверял, что artifact содержит narrow water hook и больше не содержит старый `getTempMobPos` override. После grave fix gate проверял присутствие нужного runtime wiring.

Такой gate отвечает на вопрос:

> собран ли распространяемый artifact в той форме, которую предполагает source design?

Но он всё ещё не запускает Minecraft. Bytecode может выглядеть правильно при статическом inspection и оказаться несовместимым с реальным remapped runtime.

## Exact identity: совпадает ли JAR с именем release

PR #101 появился из дефекта, который не ломал gameplay напрямую, но ломал доверие к evidence.

Official filename и tag сообщали `0.1.20+1.21.1`, а `fabric.mod.json` и `META-INF/MANIFEST.MF` внутри JAR продолжали сообщать snapshot identity.

Это означало, что фраза «проверен release 0.1.20» становилась неоднозначной. Artifact можно было скачать по release URL, но его собственная metadata не подтверждала ту же identity.

После исправления release gate стал проверять три значения как один контракт:

```text
requested tag version
=
fabric.mod.json version
=
Implementation-Version
```

Обычная untagged build при этом могла оставаться snapshot. Строгая identity включалась именно в release boundary.

Для меня это важный промежуточный слой. Exact-artifact acceptance начинается не с запуска сервера, а с возможности однозначно ответить, **какой artifact вообще проверяется**.

Успешный filename check не доказывает startup. Но без exact identity любой последующий PASS трудно связать с конкретным опубликованным release.

## Installed startup: загрузится ли production JAR вообще

Версия `0.1.21+1.21.1` объединила water fix, grave fix и exact embedded identity. Repository gates прошли. Artifact был опубликован и установлен на сервер.

Startup остановился раньше world load:

```text
MixinTombstoneBlock
InvalidInjectionException
could not find any targets matching getDrops
```

Причина была узкой и показательной. Mixin инжектировался в Minecraft override с `remap = false`. В development source имя `getDrops` выглядело корректно. В production Fabric namespace этот method remapped, и runtime не смог найти literal target.

Source compile это не обнаружил. Static package inspection тоже не моделировал полноценное Mixin application в реальном server launch.

Этот случай изменил порядок acceptance. Пока candidate не дошёл до ready marker, проверки воды, могил, голосового пути и памяти не просто «не прошли». Они **не начинались**, потому что их prerequisite — запущенный server world — отсутствовал.

Поэтому startup gate имеет приоритет над downstream gameplay gates:

```text
artifact не загрузился
→ world scenarios не имеют валидной среды выполнения
→ cumulative acceptance останавливается
```

PR #102 удалил хрупкий `MixinTombstoneBlock` и перенёс `TombstoneDropPolicy.ensurePreservedDrop(...)` прямо в repository-owned `TombstoneBlock.getDrops(...)`.

Это было не только локальное исправление. Архитектурный вывод получился шире: когда код класса принадлежит самому проекту, direct owned-source wiring обычно надёжнее runtime injection в этот же class.

Но даже после GREEN PR #102 installed startup оставался отдельным pending gate до появления exact candidate evidence.

## Rollback как успешный результат acceptance

После startup failure можно было продолжить чинить сервер на месте, менять JAR и постепенно терять точную границу между failed candidate и восстановленной production средой.

Вместо этого был выполнен controlled rollback на `0.1.20`.

Результат rollback проверялся не фразой «сервер вроде снова работает», а отдельными invariants:

- все шесть persistent file hashes совпали;
- server дошёл до `STARTED`;
- TCP `25565` восстановился;
- UDP `24454` и Voice Chat восстановились;
- monitoring снова стал active;
- world загрузился на предыдущем artifact.

Шесть файлов:

```text
memory.json
memory2.json
semantic-memory.json
relationships.json
voices.json
operator-lore.json
```

Это не превращает failed `0.1.21` в успешный release. Но доказывает другое важное свойство: acceptance process смог безопасно обнаружить blocker, остановить дальнейшие destructive checks и восстановить предыдущую service boundary без необъяснимой persistent mutation.

Поэтому rollback для меня — не противоположность acceptance. Это один из допустимых результатов acceptance:

```text
candidate rejected
+
previous service restored
+
persistent continuity preserved
=
controlled release decision
```

Скрывать такой outcome ради красивой истории было бы хуже, чем записать failure как отрицательное evidence.

## GameTests: integration evidence, но не production lifecycle

После corrective PRs возник следующий вопрос: как покрыть не только уже найденные дефекты, но и архитектурные риски, которые ещё не успели проявиться на сервере?

PR #103 добавил M11 Phase A:

- catalogue из 28 acceptance scenarios;
- семь risk domains;
- validator для stable IDs, severity, automation state, deterministic oracle и timeout;
- семь Fabric GameTests в реальном test server;
- production MCA navigation wiring;
- NPC → tombstone item → NPC identity/inventory round trip;
- real Silk Touch filled-grave drop;
- empty-grave negative control;
- deterministic water-navigation properties;
- fail-closed check, запрещающий test-mod leakage в distributable JAR.

GameTests закрыли важную дыру между isolated unit tests и ручным installed server. Они загрузили registries, entities, blocks, fluids и production navigation classes внутри настоящего Minecraft server process.

Но PR #103 намеренно записал свою границу:

> GameTests не являются production-JAR startup/restart evidence.

Почему? Test server всё ещё запускается через development build machinery. Он использует специальный test mod и controlled fixtures. Это хороший integration runtime, но не тот же самый artifact path, который проходит пользователь:

```text
published/remapped JAR
→ isolated server directory
→ Fabric installer and loader
→ dependency resolution
→ Mixin application
→ world ready marker
```

Именно поэтому семь зелёных GameTests не отменили необходимость Phase B.

## Production-JAR restart: что добавил отдельный JVM boundary

PR #104 добавил M11 Phase B — automated installed acceptance для exact candidate.

Harness больше не запускал проект как Loom development environment. Он:

1. собирал exact remapped Fabric candidate;
2. помещал его в isolated production server вместе с pinned Fabric Installer, Fabric API и Simple Voice Chat;
3. запускал Minecraft 1.21.1 вне Loom/dev classpath;
4. ожидал ready marker;
5. отправлял `stop`;
6. требовал save всех dimensions и process exit code 0;
7. запускал тот же world второй раз;
8. повторял lifecycle checks;
9. сравнивал persistent paths и SHA-256 values.

Важно, что это были **два отдельных JVM**, а не повторная инициализация classes внутри одного test process.

Такой boundary обнаруживает классы ошибок, которые unit tests и GameTests могут не увидеть:

- отсутствующий runtime dependency;
- неверная loader metadata;
- production-only Mixin/refmap failure;
- static state, случайно переживающий tests в одном JVM;
- shutdown, который не сохраняет world;
- restart, который не может прочитать ранее записанное состояние;
- изменение canonical store paths;
- test fixture leakage в player/server JAR.

Phase B потребовал, чтобы `memory.json`, `memory2.json`, `semantic-memory.json`, `relationships.json`, `voices.json` и `operator-lore.json` существовали ровно в одном валидном canonical location и сохранили одинаковые SHA-256 values между первым shutdown и вторым startup.

При этом stable hashes не доказывают всю semantic корректность Memory 2.0. Они доказывают более узкий факт: controlled startup/restart не произвёл необъяснимое byte-level изменение подготовленного persistent state и не перенёс stores на другие paths.

Ещё одна граница — fixture mod. Harness использовал отдельно remapped test-only fixture, чтобы через public VillAIgence APIs создать шесть stores. Package gate одновременно доказывал, что fixture classes и mod ID не попали в distributable VillAIgence JAR.

Так PR #104 связал две вещи:

```text
достаточно test instrumentation для deterministic oracle
+
нулевое test-code leakage в production artifact
```

## Что всё ещё остаётся за пределами автоматизации

После PR #104 можно честно сказать:

- exact remapped candidate запускается вне development classpath;
- два server process доходят до ready marker;
- controlled stop сохраняет world и завершается с code 0;
- restart читает тот же world;
- шесть canonical stores сохраняют paths и hashes;
- seven GameTests проходят отдельно;
- fixture code отсутствует в distributable JAR.

Но это всё ещё не доказывает:

- реальный Text/STT/Chat/TTS provider path;
- Voice Chat с настоящим клиентом;
- global Chat deadline под реальным transport и retries;
- logical two-client operator-lore conflict;
- focused live water canary на настоящем MCA brain/goal behavior;
- filled-grave break/place/restart canary на operator server;
- cumulative product-owner acceptance всей release matrix.

Поэтому cumulative acceptance остаётся pending.

Это не недостаток Phase B. Хороший gate не обязан доказывать всё. Он обязан точно описывать свою область и не расширять PASS за её пределы.

Автоматический production restart особенно ценен именно потому, что освобождает manual acceptance от повторения механических проверок. Человек может сосредоточиться на provider behavior, multiplayer interaction и gameplay semantics, а не каждый раз вручную доказывать, что process умеет получить `stop` и сохранить dimensions.

## Как я теперь строю release gates

После этой последовательности я использую несколько правил.

### 1. Gate формулируется вопросом, а не названием tool

Не `JUnit`, `Gradle` или `GitHub Actions`, а:

```text
сохраняется ли identity NPC после grave round trip?
```

```text
совпадает ли embedded identity с release tag?
```

```text
достигает ли exact remapped JAR ready marker вне dev classpath?
```

Tool можно заменить. Oracle должен остаться понятным.

### 2. Следующий gate добавляет новый runtime fact

Если два jobs доказывают одно и то же на одном layer, второй может создавать только видимость глубины.

Полезная последовательность меняет среду:

```text
pure source
→ compiled classes
→ remapped package
→ GameTest server
→ isolated production server
→ real operator server
→ real clients/providers
```

### 3. Negative evidence сохраняется

`0.1.21` startup failure не нужно удалять после PR #102 и PR #104. Оно объясняет, зачем появился production-JAR gate и какой класс дефекта он обязан ловить.

### 4. Prerequisite failure останавливает downstream checks

Если server не дошёл до ready marker, water/grave/provider tests не получают статус FAIL или PASS. Они остаются not executed, потому что отсутствует валидная среда.

### 5. Rollback имеет собственные oracles

Вернуть старый JAR недостаточно. Нужны service recovery, world load и persistent continuity checks.

### 6. Promotion — отдельное решение

Release publication, automated package evidence и cumulative acceptance — разные события. Automation собирает доказательства. Promotion происходит только тогда, когда набор доказательств соответствует текущему product scope.

Главный вывод для меня теперь такой:

> release gate ценен не количеством зелёных jobs, а тем, насколько точно он связывает конкретный artifact, конкретную runtime среду и конкретный bounded claim.

Source tests дают быстрый и детерминированный фундамент. GameTests добавляют реальную интеграцию Minecraft systems. Production-JAR harness проверяет exact artifact и process lifecycle. Manual acceptance закрывает те границы, где нужны реальные providers, клиенты и gameplay semantics.

Ни один слой не заменяет соседний. Вместе они превращают release из одного оптимистичного действия в последовательность проверяемых решений.

## Evidence

- [Installed `0.1.20` cumulative acceptance — PR #98](https://github.com/True-Ruslan/villAIgence/pull/98)
- [Water navigation correction — PR #99](https://github.com/True-Ruslan/villAIgence/pull/99)
- [Filled tombstone drop correction — PR #100](https://github.com/True-Ruslan/villAIgence/pull/100)
- [Exact embedded release identity — PR #101](https://github.com/True-Ruslan/villAIgence/pull/101)
- [Tombstone startup injection correction — PR #102](https://github.com/True-Ruslan/villAIgence/pull/102)
- [M11 Phase A risk-based GameTests — PR #103](https://github.com/True-Ruslan/villAIgence/pull/103)
- [M11 Phase B production-JAR startup/restart acceptance — PR #104](https://github.com/True-Ruslan/villAIgence/pull/104)
- [Canonical `0.1.22` startup-fix validation boundary](https://github.com/True-Ruslan/villAIgence/blob/1.21.1/docs/livingworld/VALIDATION_0.1.22_TOMBSTONE_STARTUP_FIX.md)
