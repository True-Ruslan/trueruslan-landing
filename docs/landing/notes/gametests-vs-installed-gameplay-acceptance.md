# Почему зелёные GameTests ещё не доказывают installed gameplay acceptance

VillAIgence проверяет Minecraft-механику несколькими разными способами. Все они полезны, но отвечают на разные вопросы.

- **source/unit contracts** проверяют детерминированные правила и wiring;
- **remapped package** доказывает форму distributable artifact;
- **GameTests** запускают реальные игровые сценарии в controlled server runtime;
- **exact production-JAR** проверяется на отдельном Fabric server в двух JVM;
- loopback provider-client tests проверяют настоящий HTTP-код без внешнего provider;
- installed server/client canaries проверяют то, чего CI физически не воспроизводит.

Главный вывод: зелёный нижний слой не делает верхний слой автоматически зелёным. Evidence нужно накапливать, а не заменять одним итоговым статусом.

Связанные материалы:

- [VillAIgence — Server-Authoritative AI Society](../projects/livingworld.md);
- [От source tests к installed acceptance](source-tests-to-installed-acceptance.md);
- [Restart — это часть продукта](restart-persistence-is-a-product-contract.md);
- [Почему green CI не означает verified product](green-ci-is-not-product-verification.md).

## 1. Один pipeline не равен одному доказательству

Удобная, но опасная формулировка звучит так: «CI зелёный, значит мод работает». В действительности один workflow может последовательно проверить несколько независимых facts:

```text
source/unit contracts
→ remapped package identity
→ controlled server GameTests
→ exact production-JAR startup/restart
→ provider-client protocol evidence
→ installed operator-server/client canaries
→ cumulative product-owner acceptance
```

Каждый следующий слой использует результат предыдущего, но не наследует его вывод без новой проверки.

**Проверенный факт.** VillAIgence разделяет UNIT / SOURCE POLICY, COMMON INTEGRATION, SERVER GAMETEST, PRODUCTION CANDIDATE STARTUP/RESTART, EXACT RELEASE WORKFLOW, INSTALLED OPERATOR SERVER/CLIENT и REAL MULTI-CLIENT CANARY.

**Инженерный вывод.** Release gate должен отвечать не «зелёный ли pipeline», а «какое наблюдаемое свойство системы доказано этим job».

**Ограничение.** Даже подробная автоматизация не моделирует все моды, сетевые задержки, аудиоустройства, пользовательские действия и долгоживущие миры.

## 2. Что доказывают source/unit contracts

Source-level checks работают быстрее остальных и защищают архитектурные законы:

- сервер остаётся authority над identity, permissions и gameplay mutation;
- provider output остаётся proposal;
- retry не дублирует dialogue, relationship или memory effects;
- C2S packet не переносит arbitrary player/villager UUID, dimension ID или village ID;
- клиент не читает world-local persistence напрямую;
- security policy и pinned Actions остаются неизменными;
- production JAR не содержит test fixtures.

Такой test может точно доказать, что код вызывает одну authority seam или не содержит запрещённую dependency. Но он не загружает реальный Minecraft world и не видит поведения mixin, registry, pathfinding или block drops в server runtime.

**Проверенный факт.** PR #110 закрепил один monotonic deadline через STT → Chat retries → TTS и exactly-once commit; PR #112 закрепил revision conflict, replay `UNCHANGED` и logical-client state boundaries.

**Инженерный вывод.** Source tripwire особенно полезен там, где regression выглядит как небольшое изменение API, но фактически расширяет trust boundary.

**Ограничение.** Компилирующийся и логически корректный seam ещё не доказывает, что нужный Minecraft hook вызывается в реальном runtime.

## 3. Remapped package проверяет artifact, а не gameplay

До GameTests и installed checks нужно убедиться, что тестируется именно distributable artifact.

Для VillAIgence package gate связывает:

- versioned filename;
- embedded `fabric.mod.json`;
- manifest;
- remapped production classes;
- dependency manifest;
- SHA-256;
- отсутствие GameTest и production-acceptance fixtures в публичном JAR.

Если dev-runtime использует classes, которых нет в remapped package, зелёный unit test может описывать продукт, который пользователь никогда не получит.

**Проверенный факт.** Официальный `0.1.25+1.21.1` опубликован из commit `588cc676d356271c4cf74eb21131f6d071476e48`; release gate подтвердил byte identity опубликованного Fabric JAR и принятого candidate.

**Инженерный вывод.** Exact artifact identity — обязательный переход между repository evidence и release evidence.

**Ограничение.** Правильный filename, manifest и SHA-256 доказывают identity bytes, но не то, что эти bytes корректно ведут себя в конкретном мире.

## 4. Что реально доказывают GameTests

GameTests запускают игровой код в controlled server runtime и поэтому сильнее обычного unit test для механик Minecraft.

M11 Phase A проверяет, среди прочего:

- entity и registry boot;
- production navigation wiring;
- NPC → tombstone item → NPC identity/inventory lifecycle;
- Silk Touch `getDrops` round trip;
- empty-grave negative control;
- две изолированные water lanes;
- dry-land route после выхода из воды;
- rejection test metadata/classes из production JAR.

PR #105 добавил focused GameTests после реального дефекта: inventory ownership терялся до tombstone serialization. Один сценарий проверяет captured path, другой — точный fallback loose-drop path.

```text
GameTest PASS
= scenario completed inside controlled server runtime
≠ exact installed modpack, client UI, audio stack and long-lived world are accepted
```

**Проверенный факт.** GameTests способны поймать ошибки реального block/entity lifecycle, которые не видны в pure unit tests.

**Инженерный вывод.** Для Minecraft-механики GameTest — правильный middle layer между source policy и installed canary.

**Ограничение.** Controlled runtime использует заданную fixture, ограниченный tick window и известный dependency set; он не доказывает произвольный modpack или многочасовую игру.

## 5. Exact production-JAR startup/restart проверяет другую ось

GameTest может пройти, а production candidate не стартовать из-за refmap, mixin, loader, signature или dependency resolution. Поэтому M11 Phase B использует exact production-JAR вне Loom/dev runtime.

Проверка включает:

1. staging remapped Fabric candidate;
2. pinned Fabric installer, Fabric API и Simple Voice Chat inputs;
3. artifact manifest и SHA-256;
4. real Fabric server startup в JVM 1;
5. controlled `stop`, save и exit code 0;
6. тот же world и тот же JAR в JVM 2;
7. forbidden Mixin/refmap/mod-resolution/JVM scan;
8. discovery шести canonical JSON stores ровно по одному разу;
9. стабильные paths и hashes через startup/restart.

Current accepted implementation head после PR #112 — `67e0644b355708c06747e3ec4659a337bc4189b3`.

**Проверенный факт.** Двух-JVM harness доказывает, что exact production-JAR стартует, корректно останавливается и повторно загружает тот же world без dev runtime.

**Инженерный вывод.** Startup/restart — orthogonal gate: он проверяет packaging, loader и persistence lifecycle, а не полноту gameplay behavior.

**Ограничение.** Совпадающие hashes не доказывают user-visible semantic continuity для каждого NPC, диалога или interaction.

## 6. Provider-client evidence не равно real-provider acceptance

PR #108 и PR #110 используют production Chat/STT/TTS HTTP clients против literal-loopback OpenAI-compatible endpoints.

Это даёт детерминированное provider-client evidence:

- настоящий request serialization;
- bounded response reads;
- `content: null` и retry path;
- shared deadline;
- STT → Chat retries → TTS orchestration;
- exactly-once `DIALOGUE` и `RELATIONSHIP_CHANGE` persistence;
- отсутствие real credential и внешнего network dependency в CI.

Но literal-loopback сознательно не проверяет:

- доступность конкретного коммерческого provider;
- изменение модели или latency;
- real audio transcription quality;
- subjective response quality;
- billing, rate limits и внешнюю moderation policy.

**Проверенный факт.** Provider-client automation проверяет production protocol code без секретов и недетерминированного внешнего сервиса.

**Инженерный вывод.** CI должен владеть transport contract, а real-provider canary — внешней compatibility boundary.

**Ограничение.** Loopback success не доказывает, что текущий provider key, model и endpoint работают на operator environment.

## 7. Logical-client automation не является физическим multiplayer

PR #112 разделил два acceptance ID:

```text
VAI-CONCUR-003 → automated logical-client/common-integration evidence
VAI-CONCUR-004 → real installed two-client UI/network canary
```

`VAI-CONCUR-003` проверяет две независимые editor models против production revision/store boundary:

- client A и client B читают V0/R0;
- A пишет V1/R0 → `OK`/R1;
- B пишет stale V2/R0 → `CONFLICT`;
- canonical store остаётся V1/R1;
- B сохраняет Draft, принимает R1 и повторяет V2/R1 → `OK`/R2;
- replay возвращает `UNCHANGED` без rewrite;
- unauthorized logical request не раскрывает value/revision и не mutates store.

Это сильное доказательство conflict semantics. Но только `VAI-CONCUR-004` может проверить два реальных Minecraft клиента, packet timing, modal UI, focus, rendering и действия пользователя.

**Проверенный факт.** PR #112 merged; logical-client contract принят, physical two-client canary остаётся отдельным.

**Инженерный вывод.** Fake или logical client должен называться по своей реальной границе, а не «multiplayer test» без уточнения.

**Ограничение.** Real installed two-client canary пока не выполнен на candidate, содержащем PR #112.

## 8. Voice transport требует физического canary

Автоматизация может доказать PCM budgets, queue handoff, deadline, retry и HTTP orchestration. Она не может честно подтвердить полный физический путь:

```text
physical microphone
→ Simple Voice Chat capture
→ UDP/Opus transport
→ server STT
→ Chat
→ TTS
→ spatial audible playback
```

Для этого нужны реальный client, microphone, audio device и установленный Simple Voice Chat.

**Проверенный факт.** Physical microphone, Simple Voice Chat UDP/Opus playback, spatial audible TTS и subjective response quality остаются installed-client canaries.

**Инженерный вывод.** Неавтоматизируемый хвост должен быть коротким, явным и подготовленным автоматизацией, но не переименованным в автоматизированный.

**Ограничение.** PASS на одном OS/audio device не гарантирует совместимость со всеми устройствами и modpacks.

## 9. Почему `0.1.25` ещё требует installed canary

`0.1.25+1.21.1` прошёл exact release workflow и содержит correction inventory ownership перед tombstone serialization. Это доказывает, что опубликован правильный artifact и automated gates зелёные.

Остаётся focused installed **inventory/grave/resurrection canary**:

- NPC с inventory умирает по реальному MCA path;
- tombstone или fallback получает точные items;
- Silk Touch round trip сохраняет identity/data;
- resurrection восстанавливает ожидаемого NPC;
- restart не ломает результат;
- дублирование или silent loss отсутствует.

Поэтому корректная формулировка: release опубликован и exact-artifact accepted, но cumulative product-owner acceptance ещё не завершён.

**Проверенный факт.** Предыдущий installed `0.1.23` canary обнаружил реальную потерю трёх emeralds до tombstone serialization, несмотря на другие зелёные проверки.

**Инженерный вывод.** Manual canary имеет смысл, когда он проходит по exact defect path, который уже однажды избежал автоматических gates.

**Ограничение.** Один focused canary не заменяет long-horizon, multiplayer и multi-day soak.

## 10. Draft Phase E расширяет automation, но не меняет прошлое

На момент этой заметки VillAIgence PR #114 **Draft** реализует M11 Phase E automation-completion program:

- configuration-cache и Gradle 10 hardening;
- duplicate-identity lifecycle protection;
- corrupt-persistence recovery evidence;
- authenticated text и two-session Operator Lore boundaries;
- voice transport boundaries;
- nightly gameplay/navigation и bounded soak gates.

Это правильное развитие: автоматизировать максимум того, что можно проверить честно. Но Draft PR #114 не является accepted evidence до завершения exact-head CI, review и merge. Даже после merge remaining physical and product-owner canaries не исчезнут.

**Проверенный факт.** PR #114 открыт как Draft и прямо запрещает release publication внутри своего scope.

**Инженерный вывод.** Новая automation должна сокращать ручную матрицу, а не ретроспективно объявлять предыдущие installed gaps закрытыми.

**Ограничение.** Содержание и final evidence PR #114 могут измениться до merge; заметка фиксирует только текущую bounded boundary.

## 11. Cumulative product-owner acceptance

Installed acceptance — не один checkbox, а ledger точных canaries для exact artifact.

Минимальная текущая матрица:

| Boundary | Automated evidence | Installed evidence |
|---|---|---|
| Tombstone inventory | GameTests + package gate | inventory/grave/resurrection canary pending |
| Startup/restart | two-JVM exact production-JAR | one operator restart after publication |
| Provider protocol | literal-loopback Chat/STT/TTS | real-provider smoke |
| Voice | deadline/PCM/HTTP contracts | physical microphone + UDP/Opus + audible TTS |
| Operator Lore conflict | `VAI-CONCUR-003` | `VAI-CONCUR-004` real installed two-client |
| Broader gameplay | bounded scenarios | focused gameplay + longer soak |

Product status можно повысить только по строкам, для которых есть соответствующее evidence. PASS одной строки не распространяется на остальные.

## 12. Rollback и recovery — часть acceptance

Перед installed canary должны быть известны:

- exact candidate filename и SHA-256;
- previous accepted release artifact;
- backup world и canonical stores;
- controlled shutdown procedure;
- запрет destructive `memory.json` migration в release boundary;
- критерии abort;
- способ вернуть previous JAR и world backup;
- post-rollback startup/restart check.

Recovery evidence также должно проверять corrupt-file preservation и fail-soft auxiliary stores, не маскируя authoritative data loss.

**Проверенный факт.** Текущий next-release plan запрещает snapshot JAR как release evidence, destructive `memory.json` migration и claim logical-client automation как installed multiplayer proof.

**Инженерный вывод.** Rollback plan делает canary контролируемым экспериментом, а не необратимой проверкой на живом мире.

**Ограничение.** Backup existence нужно дополнять реальным restore/read-back proof; файл, который ни разу не восстанавливали, остаётся предположением.

## Итог

GameTests — сильная и необходимая часть Minecraft release engineering. Они доказывают реальные mechanics внутри controlled server runtime и закрывают большой класс ошибок лучше source tests.

Но installed gameplay acceptance требует другого evidence:

```text
correct source policy
+ correct remapped package
+ passing GameTests
+ exact production-JAR startup/restart
+ bounded provider-client proof
+ physical and multi-client canaries
+ focused product-owner scenarios
+ rollback/recovery readiness
= honest cumulative acceptance
```

Чем больше честной автоматизации добавляется, тем меньше остаётся ручной работы. Но последний слой нельзя удалить переименованием: green GameTests не доказывают installed gameplay correctness, пока exact artifact не прошёл соответствующие server/client canaries.