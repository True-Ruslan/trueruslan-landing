# Restart — это часть продукта: почему сохранённый JSON ещё не доказывает persistence

Когда в проекте появляется файл `memory.json`, очень легко считать задачу persistence почти решённой. Данные сериализуются, файл лежит в мире сервера, после следующего запуска он всё ещё существует — значит, память сохранена.

В VillAIgence этого определения быстро стало недостаточно.

Система хранит не один абстрактный JSON, а несколько связанных видов состояния: рабочую и эпизодическую память, semantic facts, relationships, закреплённые voices и operator-authored lore. Пользователь при этом не взаимодействует с файлами напрямую. Он ожидает, что конкретный NPC после restart останется тем же NPC, вспомнит тот же факт, не получит воспоминания другого персонажа, сохранит отношения и продолжит работу без скрытого сброса состояния.

Поэтому persistence для меня теперь начинается не с операции записи. Это product contract:

```text
write
→ completed save
→ controlled shutdown
→ exact artifact restart
→ unique canonical discovery
→ parse and schema check
→ semantic identity/isolation check
→ user-visible continuity
```

Каждый переход отвечает на отдельный вопрос. Если пропустить один из них, можно сохранить корректные bytes и всё равно потерять продуктовый смысл.

## Четыре разных уровня continuity

Чтобы не смешивать слишком разные доказательства, я разделяю persistence на четыре уровня.

### 1. Storage durability

Самый нижний уровень: bytes были записаны и не исчезли.

Это можно проверить размером файла, датой, checksum или прямым сравнением содержимого. SHA-256 особенно полезен, когда сценарий не должен менять состояние: одинаковый hash до и после restart показывает **byte continuity**.

Но этот факт узкий. Файл может быть байт-в-байт прежним, а приложение может:

- вообще его не найти;
- найти не тот экземпляр;
- не суметь его прочитать;
- проигнорировать несовместимую schema;
- загрузить пустое fallback-состояние;
- привязать записи к другим сущностям.

Поэтому equal hashes недостаточны для доказательства полного persistence contract.

### 2. Structural readability

Следующий уровень — **structural readability**.

Недостаточно обнаружить basename где-то внутри server root. Нужен один canonical path, один ожидаемый файл, корректный UTF-8, валидный JSON и допустимая корневая структура.

Если после обновления одновременно существуют две копии `memory.json`, hash одной из них ничего не говорит о том, какую выбрал runtime. Если parser silently восстанавливает пустой store после ошибки, сервер может успешно запуститься, но пользовательская память уже потеряна.

На этом уровне проверяется не содержание отношений или воспоминаний, а возможность однозначно прочитать именно то состояние, которое система считает authoritative.

### 3. Semantic continuity

Даже корректно прочитанный JSON может сохранить неправильный смысл.

**Semantic continuity** означает, что после restart остаются правильными:

- identity записи;
- связь записи с тем же NPC или игроком;
- `sourceEventIds` и другие evidence links;
- ordering и decay semantics;
- relationship ownership;
- разделение состояния разных персонажей;
- значение revision и других concurrency markers.

Именно здесь проявляются ошибки, которых не видно по синтаксису файла. Две записи могут быть валидными, но поменяться владельцами. UUID может пересоздаться. Relationship может загрузиться в context другого NPC. Hash изменится после допустимой compact/migration операции, хотя смысл останется прежним — или останется прежним, хотя runtime вообще не использовал эти bytes.

### 4. Behavioral continuity

Последний уровень — то, ради чего persistence существует: **behavioral continuity**.

После restart пользователь должен наблюдать ожидаемое поведение:

- NPC вспоминает тот же факт;
- два NPC не смешивают память;
- voice assignment остаётся прежним;
- operator lore открывается с тем же canonical value и revision;
- gameplay object восстанавливает ту же identity и inventory;
- controlled provider или audio failure не стирает уже подтверждённое состояние.

Behavioral check не заменяет hashes или schema validation. Он закрывает другой вопрос: загруженные данные действительно участвуют в продукте так, как предполагалось.

## PR #66: файл пережил restart, но проверялся не только файл

В [PR #66](https://github.com/True-Ruslan/villAIgence/pull/66) был зафиксирован live checkpoint версии `0.1.14+1.21.1` для forgetting и decay.

Во время проверки semantic capacity временно уменьшалась до `3`, а затем возвращалась к штатному значению `256`. Под pressure старый corroborated FACT Basiliso сохранился. Вместе с ним пережили pressure и restart его semantic UUID и `sourceEventIds`.

Одновременно слабый relationship FACT Casimiro был вытеснен, а ordering между иначе равными entries определился через decay. Pressure двух NPC остался изолированным: результат для Basiliso не превратился в случайное изменение состояния Casimiro.

Пять persistent files после финального restart были byte-identical. Это сильное доказательство storage durability. Но ценность checkpoint была шире hashes:

```text
тот же semantic UUID
+
те же sourceEventIds
+
предсказуемый decay order
+
изоляция Basiliso / Casimiro
=
semantic continuity в проверенном сценарии
```

При этом один subcriterion остался честно ограниченным. Rejected-new-append no-rewrite был automated-proven, но не live-proven: реальные социальные сценарии не создали новый слабый `RELATIONSHIP_CHANGE`, который дошёл бы до нужной ветки append. То есть даже внутри одного persistence checkpoint отдельные claims имели разную силу.

## PR #67: hashes связались с наблюдаемым recall

В [PR #67](https://github.com/True-Ruslan/villAIgence/pull/67) live validation версии `0.1.15+1.21.1` добавила следующий слой.

Все шесть world-local файлов оставались hash-identical across restart:

```text
memory.json
memory2.json
semantic-memory.json
relationships.json
voices.json
operator-lore.json
```

Но acceptance не остановилась на сравнении SHA-256.

Pio и Justino остались изолированы. Pio сохранил имя игрока Руслан и любимый цвет. Controlled TTS `io_error` не уничтожил видимый текст и уже записанный Memory 2.0 `DIALOGUE`. Hostile endpoint scenarios были отклонены без credential transmission и без persistence mutation. Production configuration после тестов восстановилась byte-for-byte.

Это уже соединение нескольких уровней:

```text
six-store byte continuity
→ successful read-back
→ Pio / Justino identity isolation
→ observable recall
→ controlled failure without state loss
```

Hash здесь нужен, но не является единственным oracle. Если бы Pio после restart перестал помнить цвет при тех же hashes, продуктовый persistence contract считался бы нарушенным: bytes сохранились, а behavioral continuity — нет.

## Startup failure тоже является persistence-сценарием

Persistence обычно обсуждают вокруг успешного запуска. На практике важнее понять, что происходит, когда новый artifact не запускается вообще.

В [PR #92](https://github.com/True-Ruslan/villAIgence/pull/92) был записан blocker версии `0.1.18+1.21.1`: missing refmap и неверный Mixin target остановили startup раньше world load. В [PR #95](https://github.com/True-Ruslan/villAIgence/pull/95) следующий candidate `0.1.19+1.21.1` также упал до загрузки мира из-за injection в compiler-generated lambda boundary. Позже [PR #102](https://github.com/True-Ruslan/villAIgence/pull/102) зафиксировал startup failure `0.1.21+1.21.1` на production-unsafe tombstone Mixin.

Во всех этих случаях downstream gameplay acceptance не начиналась. Это важное правило:

```text
world не загрузился
→ application state не прошло read-back boundary
→ gameplay и memory claims не могут считаться проверенными
```

После failure выполнялся controlled rollback на предыдущий рабочий artifact. Проверка rollback включала неизменность persistent hashes, успешное достижение ready/STARTED state и восстановление service ports и monitoring.

Rollback не доказывает качество failed candidate. Он доказывает recovery contract:

```text
candidate rejected
→ destructive checks stopped
→ previous artifact restored
→ persistent state unchanged
→ service recovered
```

Если forward upgrade падает, а rollback тихо сбрасывает память, persistence contract нарушен даже при корректном поведении старого JAR до обновления.

## PR #103: semantic persistence в lifecycle, а не только в файле

[PR #103](https://github.com/True-Ruslan/villAIgence/pull/103) добавил risk-based GameTests. Один из ключевых сценариев проверял lifecycle:

```text
NPC
→ tombstone item
→ повторно созданный NPC
```

Oracle требовал сохранить UUID, имя и полный inventory multiset.

Это хороший пример того, почему корректная serialization ещё не является достаточным результатом. Tombstone item мог содержать валидные data, но если после восстановления создавался другой UUID или терялся один inventory stack, пользователь получал уже другого персонажа.

Такой round trip проверяет semantic continuity объекта через смену representation. Но его boundary остаётся точной: это GameTest evidence внутри real test server, а не exact production-JAR restart evidence.

## PR #104: два JVM и один canonical state

[PR #104](https://github.com/True-Ruslan/villAIgence/pull/104) добавил отдельный production-JAR harness.

Exact remapped Fabric candidate устанавливался в isolated production server вне Loom/development classpath. Harness запускал два независимых JVM process на одном мире.

Для каждого запуска требовалось:

1. Minecraft 1.21.1 и Fabric Loader доходят до ready marker;
2. deterministic fixture создаёт canonical stores через public persistence APIs;
3. server получает `stop`;
4. controlled shutdown завершается полным save;
5. process выходит с code `0`;
6. каждый store находится ровно в одном экземпляре;
7. каждый файл является valid UTF-8 JSON;
8. relative path и SHA-256 совпадают после второго запуска.

Проверялись шесть файлов:

```text
memory.json
memory2.json
semantic-memory.json
relationships.json
voices.json
operator-lore.json
```

Здесь два JVM — принципиальная деталь. Повторная инициализация внутри одного process могла бы случайно сохранить caches, static state или уже открытые objects. Новый JVM заставляет систему снова пройти настоящий startup и read-back path.

Также harness запрещал leakage test fixture classes в distributable JAR. Иначе acceptance мог бы доказывать работу специального тестового продукта, а не того artifact, который получает пользователь.

PR #104 доказал no-mutation restart continuity для детерминированного fixture. Он не доказал каждую migration, external provider path, multiplayer race, physical audio scenario или cumulative acceptance. Эти gates остаются pending.

## Почему equal hashes всё ещё недостаточно

Допустим, до и после restart у `semantic-memory.json` один SHA-256. Из этого следует, что сравниваемые bytes одинаковы.

Но всё ещё возможны ситуации:

- runtime загрузил другую копию файла;
- store был прочитан, но записи не попали в active context;
- UUID сохранились, но resolver сопоставил их другим entities;
- файл валиден, но schema version больше не поддерживается;
- loader поймал exception и silently создал пустую in-memory model;
- relationships прочитаны, но перепутаны между NPC;
- server запустился, но user-visible recall изменился.

И обратная ситуация тоже возможна. После intentional writes или intentional mutation hash обязан измениться. После безопасной migration bytes могут стать другими, хотя semantic meaning сохранится.

Поэтому правило выглядит так:

```text
no-mutation scenario
→ equal hash expected

intentional write or migration
→ hash may change
→ semantic equivalence and read-back must be checked separately
```

Требовать неизменный hash после любого legitimate update означало бы запретить саму persistence.

## Schema и migration — отдельная граница

JSON parser отвечает только на вопрос, является ли файл синтаксически допустимым JSON. Product loader должен ещё понимать его schema.

Для versioned store acceptance нужны как минимум:

- явная или однозначно выводимая schema version;
- поддерживаемый old-version read path;
- fail-closed или controlled recovery policy;
- сохранение corrupt source перед восстановлением, если recovery допустим;
- отсутствие двух authoritative copies после migration;
- deterministic result повторного запуска;
- semantic checks после преобразования.

Migration должна проверяться не только как функция `old JSON → new JSON`. Нужен полный lifecycle:

```text
old world
→ exact new artifact startup
→ migration
→ completed save
→ controlled shutdown
→ second restart
→ read-back
→ identity and behavior check
```

В текущем evidence set нет основания утверждать, что каждая историческая schema имеет полностью проверенный migration path. Поэтому такая универсальная гарантия не заявляется.

## Практическая acceptance matrix

Для persistence feature я теперь задаю несколько разных oracles.

| Уровень | Что проверяется | Пример failure |
|---|---|---|
| Storage durability | файл создан, save завершён, bytes доступны | shutdown прерван до записи |
| Structural readability | один canonical path, UTF-8, JSON, root/schema | duplicate store или silent empty recovery |
| Semantic continuity | UUID, evidence links, ordering, ownership, isolation | память одного NPC загружена другому |
| Behavioral continuity | recall, permissions, gameplay identity, failure isolation | hashes совпали, но NPC забыл факт |
| Recovery | failed candidate не повреждает state, rollback поднимает service | startup rejected, rollback меняет store |

Ни один столбец не заменяет остальные. File-level checks быстрые и точные. Semantic checks закрывают meaning. Behavioral checks связывают implementation с пользователем. Recovery checks отвечают за неуспешное обновление.

## Что я теперь называю persistence contract

Для VillAIgence persistence считается доказанной только в записанной границе конкретного сценария.

PR #66 показывает live identity, evidence-link, ordering и NPC-isolation continuity под memory pressure. PR #67 связывает six-store restart hashes с observable recall и controlled failure. PR #103 проверяет UUID/name/inventory lifecycle в GameTest. PR #104 проверяет exact production-JAR, два отдельных JVM, clean save и stable canonical stores в no-mutation fixture. Startup incidents показывают safe rollback как обязательную часть recovery.

Вместе они дают более сильную модель, чем фраза «JSON сохраняется»:

```text
persisted bytes
+
readable canonical structure
+
correct identity and isolation
+
observable behavior after restart
+
safe rollback on failure
=
bounded product persistence evidence
```

Это всё ещё не обещание нулевой вероятности data loss и не утверждение, что cumulative acceptance завершена. Real-provider, multiplayer и полный product-owner acceptance остаются pending.

Но теперь каждый следующий persistence claim можно проверять по понятному вопросу: сохранился ли не только файл, но и тот пользовательский смысл, ради которого этот файл существовал.
