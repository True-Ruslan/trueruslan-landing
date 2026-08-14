# VillAIgence — server-authoritative AI society for Minecraft

**VillAIgence** — MCA-derived мод для Minecraft 1.21.1, который вырос из AI-диалогов с жителями в эксперимент над устойчивым обществом NPC: с текстом и голосом, Memory 2.0, отношениями, операторским контекстом и действиями, которые остаются под контролем сервера.

[Репозиторий на GitHub ↗](https://github.com/True-Ruslan/villAIgence)

Внутренние имена `LivingWorld / livingworld` остаются compatibility-sensitive частью движка, конфигурации и world-local data. Публичное имя проекта изменилось, но mod id `mca`, Java package root, `config/livingworld.json` и `<world>/livingworld/` не переименовываются без отдельной миграции.

![VillAIgence authority and acceptance boundaries](../../assets/diagrams/villaigence-authority-and-acceptance.svg)

## Коротко

<dl class="tr-project-glance" data-tr-project-glance="livingworld">
<dt>Моя роль</dt>
<dd>Архитектура server-authoritative AI/NPC системы, Memory 2.0, provider boundaries и release engineering.</dd>
<dt>Стек</dt>
<dd>Java 21 · Fabric · Minecraft 1.21.1 · Voice/STT/TTS · Memory 2.0</dd>
<dt>Задача</dt>
<dd>Сделать убедительных AI-NPC, не передавая модели власть над состоянием мира, памятью или действиями.</dd>
<dt>Результат</dt>
<dd>Официальный 0.3.1+1.21.1 опубликован; exact installed corrective canary остаётся PENDING, поэтому release-candidate acceptance всё ещё не завершён.</dd>
<dt>Статус</dt>
<dd><span data-tr-project-status="livingworld"></span></dd>
</dl>

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

После clean cutover `memory2.json` является persistent dialogue-memory source. Memory 2.0 разделяет episodic DIALOGUE/OBSERVATION/ACTION/RELATIONSHIP_CHANGE, typed semantic `FACT`/`BELIEF`, relationships, voice identity и Operator Lore.

`FACT` требует server-owned evidence с provenance `SYSTEM_OBSERVED`. `PLAYER_TOLD`, `NPC_TOLD` и `INFERRED` остаются BELIEF. Confidence, формулировка модели или повторение утверждения не получают права автоматически повышать belief до authoritative fact.

### Provider и release pipeline — отдельные границы

Authenticated redirects, небезопасные endpoint, loopback/SSRF-пути, malformed JSON, oversized bodies и unbounded waits должны завершаться bounded failure.

Зелёный source CI не доказывает, что remapped JAR запускается на настоящем сервере. Source tests, GameTests, package inspection, exact release identity, production-JAR startup/restart, installed clean-world acceptance и дальнейшие semantic-memory slices отвечают на разные вопросы.

<!-- case-study:current-state -->
## Текущая lifecycle- и acceptance-граница

Публичный lifecycle остаётся **release-candidate — ACCEPTANCE IN PROGRESS**. Текущий официальный release — **0.3.1+1.21.1**. Он опубликован после bounded targeted Memory 2.0 recall correction из **PR #165**; **PR #167** зафиксировал handoff для exact installed corrective acceptance. Automated release и post-release gates прошли, но installed corrective **VAI-PCM-MULTI-001** canary на retained server world всё ещё **PENDING**.

Последний installed baseline с завершённой acceptance остаётся историческим **0.2.0+1.21.1 — 7 PASS / 0 FAIL**. Публикация 0.3.1 не переписывает этот installed evidence и не означает installed PASS для новых corrective bytes. **VAI-M2-INST-005** остаётся NOT TESTED / automated evidence only, **VAI-CONCUR-004** — NOT TESTED / DEFERRED.

До реального installed PASS corrective canary **0.4 remains blocked**. Release identity, merged source capability, automated release gates и installed gameplay acceptance остаются разными фактами.

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
7. отдельно валидирует proposed actions, relationship deltas и semantic-memory admission.

Старый ответ может быть технически корректным, но уже не иметь права на применение. Cancellation и supersession являются нормальным control flow.

### Memory 2.0 разделяет эпизоды, семантику и authority

Episodic memory отвечает на вопрос «что произошло», semantic memory — «что NPC считает знанием», а authoritative world state — «что действительно верно сейчас».

У каждой записи есть owner NPC, provenance, deterministic identity и bounded retention. Consolidation объединяет источники, но не стирает source-event IDs. Forgetting определяется storage policy внутри конкретного NPC, а не решением LLM.

PR #123 добавил отдельную admission boundary: наличие candidate ещё не означает запись BELIEF, а BELIEF никогда не становится FACT только из-за confidence. Это позволяет развивать extraction в PR #125 без передачи модели authority над truth classification.

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

PR #110 завершил общий orchestration contract: один monotonic deadline проходит через STT, Chat retries и optional TTS; successful Chat side effects сохраняются exactly once даже если TTS исчерпал остаток общего budget.

### Clean cutover вместо вечной dual-persistence migration

До `0.2.0` persistent dialogue имел legacy `memory.json` и Memory 2.0 параллельно. Для pre-1.0 проекта был выбран clean cutover: `memory2.json` стал единственным persistent dialogue-memory source, а clean-world installed acceptance проверил новую модель на exact bytes без попытки автоматически угадывать старые transcript semantics.

### Selective MCA synchronization вместо большого upstream merge

Исправления MCA переносятся небольшими проверяемыми packages: tombstone integrity, UUID conversion, beds/tickets, water and ladder navigation, pathfinding, mourning, gifts, fishing и mounted archer behavior. Так AI/security/persistence boundaries не растворяются в массовом merge.

### Release identity является частью продукта

Версия в имени файла недостаточна. Candidate должен иметь согласованную Fabric metadata, manifest identity, remapped package structure и checksum. `0.2.0` дополнительно связан с byte-identical installed candidate, поэтому документационные корректировки acceptance oracle не требуют повторного ручного теста тех же runtime bytes.

### Acceptance каталог строится от рисков

GameTest evidence остаётся development integration proof; production-JAR gate — installed automated proof; release package identity — distribution proof; clean-world 7 PASS / 0 FAIL — bounded operator acceptance. `VAI-M2-INST-005` и `VAI-CONCUR-004` сознательно остаются NOT TESTED, а не превращаются в PASS из соседнего evidence.

## Реальные отказы, которые изменили архитектуру

### Transcript-first память не выдержала развитие общества

Один список сообщений не мог надёжно различать наблюдение, действие, отношение и устойчивое знание. Memory 2.0 появился ради явной модели provenance, ownership, consolidation и retention, а не ради более длинного prompt.

### Широкий hook прошёл source gates и сломал installed startup

Candidate `0.1.21+1.21.1` упал при startup: tombstone Mixin не разрешил production target. Preservation policy перенесли напрямую в owned `TombstoneBlock`, obsolete Mixin удалили и запретили package gate.

### Навигационная идея переопределила vanilla contract слишком широко

В установленном `0.1.20+1.21.1` NPC застрял в воде и утонул. Исправление сохранило inherited `GroundPathNavigation.getTempMobPos` и сузило MCA-aware логику до surface calculation.

### Loot и capture paths могли потерять persistent inventory

Заполненная могила при Silk Touch исчезала без item drop, а NPC мог выбросить inventory до tombstone serialization. PR #105 перенёс capture до destructive death drop path; позднейшие automated/install boundaries сохраняют эту ошибку как отдельный regression class.

### Green dialogue path не отменяет задержку

Один Chat request в `0.1.20` занял примерно 272 секунды. Success code без user-visible deadline не является полным success contract. PR #110 сделал общий monotonic budget реальной merged capability вместо прежнего RED-плана.

### STT normalization не является автоматически memory failure

В clean-world `0.2.0` физически произнесённый seed `silver-fox-482` был распознан как `SilverFox482`. Memory 2.0 сохранила и после restart воспроизвела именно принятый STT transcript. Acceptance oracle был исправлен: persistence проверяется от accepted STT boundary, а punctuation/case normalization остаётся отдельным STT-quality observation.

### Safe rollback — самостоятельный результат

После startup failure `0.1.21` сервер вернули на `0.1.20`. Persistent hashes совпали, сервер снова достиг STARTED, TCP/UDP surfaces и monitoring восстановились. Rollback/recovery остаются частью release engineering evidence.

<!-- case-study:alternatives -->
## Рассмотренные и отвергнутые альтернативы

### Клиент как владелец сессии, контекста или действий

Отвергнуто. Клиент может запрашивать взаимодействие и отображать результат, но не выбирает authoritative NPC identity, факты, relationship state или world mutation.

### Transcript-only память

Отвергнута. Один список реплик не выражает provenance, ownership, semantic FACT/BELIEF, relationship changes и deterministic retention.

### LLM как источник фактов или прямых действий

Отвергнуто. Модель может предложить ответ, bounded candidate, command или delta; сервер повторно валидирует current state и исполняет/сохраняет только разрешённый эффект.

### Confidence как FACT promotion

Отвергнуто. Даже высокая model confidence не меняет provenance. PR #123 сохраняет `PLAYER_TOLD`, `NPC_TOLD` и `INFERRED` в BELIEF-классе; authoritative FACT требует server-owned `SYSTEM_OBSERVED` evidence.

### Второй provider request ради semantic extraction

Отвергнут для текущего PR #125. Candidate extraction должна использовать тот же bounded structured Chat response. Это уменьшает latency/cost и исключает новую независимую truth surface.

### Большой MCA merge и широкие production-sensitive Mixins

Отвергнуты в пользу небольших owned-source packages. Installed startup failure показал, что source-compatible injection может не разрешиться в production artifact.

### Source CI как достаточное release proof

Отвергнуто. Remapped package, embedded identity, exact release, real server startup, save, restart и persistent read-back требуют отдельных gates.

### Literal-loopback acceptance как замена реальному провайдеру

Отвергнуто. Детерминированный loopback доказывает production client protocol и bounded failure semantics, но не качество внешнего сервиса, физический microphone path, Voice Chat playback или end-to-end user experience.

### Свежий timeout budget на каждый provider stage

Отвергнут. Последовательные STT, Chat retries и TTS используют один monotonic user-turn budget.

<!-- case-study:evidence -->
## Что подтверждено

<div data-tr-project-evidence="livingworld"></div>

Evidence intentionally разделяет:

- исторический `0.1.20` partial PASS;
- `0.1.21` startup failure и safe rollback;
- corrective PRs и M11 GameTests/production-JAR gates;
- PR #110 как merged shared-deadline/exactly-once automation;
- официальный `0.2.0+1.21.1` release и byte-identical clean-world installed result **7 PASS / 0 FAIL** как последний installed baseline с завершённой acceptance;
- `VAI-M2-INST-005` и `VAI-CONCUR-004` как explicit NOT TESTED boundaries;
- PR #123 и PR #125 как merged bounded semantic-memory source capabilities без AI→FACT authority;
- официальный corrective release **0.3.1+1.21.1**;
- **PR #165** как targeted Memory 2.0 recall correction;
- **PR #167** как installed corrective acceptance handoff;
- exact installed **VAI-PCM-MULTI-001** corrective canary как **PENDING**; **0.4 remains blocked** до реального installed PASS.

Статус `verified` относится только к перечисленным scopes и актуальности snapshot. Он не превращает опубликованный 0.3.1 в installed acceptance и не позволяет считать deferred/pending cases пройденными.

<!-- case-study:limitations -->
## Известные ограничения

- exact installed `VAI-PCM-MULTI-001` canary для официального 0.3.1 остаётся **PENDING**;
- `VAI-M2-INST-005` остаётся NOT TESTED / AUTOMATED EVIDENCE ONLY;
- `VAI-CONCUR-004` остаётся NOT TESTED / DEFERRED до доступности двух реальных графических клиентов;
- physical microphone/provider/Voice Chat quality остаётся отдельным observational layer от deterministic loopback contracts;
- публикация 0.3.1 и green automated release gates не доказывают installed corrective acceptance;
- semantic BELIEF admission и recall correction не разрешают AI→FACT path;
- final promotion beyond `release-candidate` не выводится автоматически из publication или source CI;
- Fabric остаётся primary package, а NeoForge — compatibility build с отдельными границами проверки.

<!-- case-study:next -->
## Следующий принятый шаг

Следующий bounded acceptance slice — **exact 0.3.1 installed VAI-PCM-MULTI-001 corrective canary** из PR #167.

Нужно установить официальный `0.3.1+1.21.1` JAR, проверить SHA-256 `f7f40b920c6f72a0e9af864795f48a0f90479db42a145081f43923b71a95e29f`, переиспользовать retained crowded-history world и выполнить exact-text Muammer/Nurey isolation + persistence procedure. Только реальный installed PASS может закрыть corrective boundary и разблокировать 0.4.

До этого lifecycle остаётся `release-candidate` / `ACCEPTANCE IN PROGRESS`; source, release и installed evidence не схлопываются в один статус.

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

Release gate также следовало установить до первого публичного candidate. Source tests, integration tests, package inspection, exact release, startup, restart, deterministic provider clients, installed canaries и manual acceptance отвечают на разные вопросы. Их явное разделение превращает failed gate в полезное evidence, а не в исключение, скрытое за общим зелёным статусом.

После `0.2.0` к этой карте добавилась ещё одна важная граница: **candidate extraction → admission → semantic storage → authority** должны оставаться раздельными. Это позволяет давать NPC более богатую долговременную память, не превращая LLM в скрытый источник истины.
