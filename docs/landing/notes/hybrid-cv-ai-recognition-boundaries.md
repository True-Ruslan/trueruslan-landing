# Как соединить local CV и AI, не отдавая модели authority над геометрией

Распознавание плана квартиры по изображению выглядит как одна задача: найти стены, двери и окна. На практике это несколько разных задач с разной степенью доверия.

- **local CV** извлекает геометрические признаки из растра;
- модель может заметить пропуск или усомниться в локальном кандидате;
- deterministic validation проверяет геометрию, host wall, raster evidence, topology и конфликты;
- пользователь решает, какие reviewable candidates принять;
- только **explicit Apply** может изменить `VlezetDocument`.

Главный архитектурный вывод Vlezet: полезный AI proposal не обязан быть authoritative mutation. Чем вероятностнее источник, тем важнее отделить его результат от persistent geometry.

Связанные материалы:

- [Vlezet — Geometry and Recognition Case Study](../projects/vlezet.md);
- [AI может предложить, но не применить: как строить deterministic authority](probabilistic-proposals-deterministic-authority.md);
- [Почему green CI не означает verified product](green-ci-is-not-product-verification.md).

## 1. Источник истины и источники предложений

`VlezetDocument` остаётся единственным persistent source of truth для планировки. Ни local CV, ни raw provider output не записывают стены и openings напрямую.

И local CV, и AI работают на proposal layer, но их роли различаются.

### Local Draft

Local CV строит bounded Draft из наблюдаемой raster geometry. Его стены и openings имеют стабильные IDs, confidence, evidence и conflict state. Даже локальный high-confidence candidate ещё не является стеной документа: до Apply он остаётся reviewable proposal.

### AI proposal

AI proposal — отдельный недоверенный объект. Raw provider output не становится обычным wall/opening candidate. Он сначала должен пройти schema, identity, budget и deterministic validation.

Итоговая последовательность выглядит так:

```text
source raster
→ deterministic local CV Draft
→ optional raw AI proposal batch
→ requestId + referenceRevision + localDraftFingerprint checks
→ deterministic validation and sanitizer
→ eligible / blocked / duplicate review state
→ explicit user decision
→ current-state revalidation
→ explicit Apply
→ one atomic VlezetDocument mutation
```

**Проверенный факт.** В принятом M7.8B local CV создавал reviewable Draft, AI получал точные локальные IDs и coordinates, а изменение документа происходило только через explicit Apply.

**Инженерный вывод.** Даже deterministic local pipeline лучше считать proposal producer, пока пользователь не подтвердил изменение authoritative document.

**Ограничение.** Такая граница уменьшает blast radius, но сама по себе не повышает recall: объект, отсутствующий в local Draft, verification-only модель восстановить не могла.

## 2. Что доказал принятый M7.8B

Принятой product baseline остаётся [Vlezet PR #41 — M7.8B Source Normalisation and Wall Topology](https://github.com/True-Ruslan/vlezet/pull/41).

```text
local wall candidates: 27
confirmed after AI:     19
remaining for review:   8
openings:               0 — deferred
Source geometry F1:     0.837989
Source topology F1:     0.837989
```

Accepted merge identity:

```text
PR #41 merge commit: 08800dd66fa298ff31d1a7e6b33e91964cdb8d16
```

M7.8B закрепил несколько важных инвариантов:

- unknown IDs отбрасываются;
- moved geometry отбрасывается;
- cloud-only walls не становятся локальными candidates;
- AI может подтвердить или отклонить известный candidate, но не заменить его segment;
- candidate overload и malformed response fail closed;
- до Apply документ не меняется;
- Apply и Undo остаются semantic operations.

**Проверенный факт.** Более сильная модель могла подтвердить больше уже найденных candidates, но не добавляла пропущенную geometry.

**Инженерный вывод.** Provider quality и authority policy должны быть независимы: замена модели может улучшить evidence, но не должна расширять разрешённые mutations.

**Ограничение.** M7.8B был принят с известными precision limitations и не доказывает готовность распознавания doors, windows, thin walls или arbitrary plans.

## 3. Почему verification-only AI оказалось недостаточно

Последующие product-owner проверки показали ограничение предыдущей схемы. Local Draft находил часть стен и дверей, но пропускал окна и тонкую balcony/loggia boundary; рядом с washbasin появлялась лишняя короткая линия. AI verification в основном снижал confidence существующих candidates и не восстанавливал отсутствующие объекты.

Это не случайная слабость конкретного prompt. Verification-only contract намеренно запрещал неизвестные IDs и новую geometry. Следовательно, модель не могла вернуть missing window или door как допустимое решение, если local CV не создал соответствующий candidate.

Отсюда возник hybrid design: разрешить модели **предлагать omissions**, но хранить их отдельно и пропускать через deterministic sanitizer.

**Проверенный факт.** Текущий Vlezet design разделяет verification существующей immutable geometry и discovery новых AI proposals.

**Инженерный вывод.** Recall можно расширять не через выдачу модели authority над планом, а через новый тип reviewable proposal с более строгой validation boundary.

**Ограничение.** Этот hybrid path находится в Draft-разработке; наличие design и зелёных изолированных tests не означает product acceptance.

## 4. Immutable identity связывает ответ с конкретным Draft

AI request должен быть привязан не просто к изображению, а к точной версии локального анализа.

Для этого batch содержит:

- `requestId` — identity конкретного provider call;
- `referenceRevision` — версия source/reference state;
- `localDraftFingerprint` — versioned SHA-256 identity structural Draft;
- allow-listed proposal types;
- bounded candidate and diagnostic budgets;
- exact coordinate convention и plan bounds.

Fingerprint зависит от structural geometry, IDs и evidence, но не от timestamps, UI diagnostics или provider decisions. Если geometry изменилась, identity должна измениться.

Raw proposal сохраняет provider coordinates и reason codes отдельно от sanitized geometry. Sanitizer не делает вид, что provider сразу вернул authoritative segment.

**Проверенный факт.** Draft design использует `recognition-local-draft-v1:<sha256>` и отклоняет request/revision/fingerprint mismatch.

**Инженерный вывод.** Immutable identity превращает «похоже на тот же план» в проверяемое утверждение о том, против какого snapshot было принято решение.

**Ограничение.** Fingerprint доказывает identity input state, но не доказывает правильность распознанной geometry.

## 5. Deterministic validation остаётся authority layer

Model confidence не выбирает host wall и не обходит product constraints. Proposal sanitizer заново проверяет:

- поддерживаемый schema version и proposal kind;
- finite coordinates и bounds;
- exact local target IDs;
- host selection и valid host span;
- calibrated width и orientation;
- structural mask support;
- door leaf, gap, window rails или frame evidence;
- topology, endpoint, junction и overlap conflicts;
- duplicate state;
- sanitary, furniture, text и dimension-line explanations;
- category and response budgets.

Возможные результаты не сводятся к accept/reject:

```text
eligible  — proposal прошёл deterministic validation и доступен для review;
blocked   — evidence или constraints недостаточны;
duplicate — эквивалентная geometry уже существует;
rejected  — batch identity, schema или budget contract нарушен;
stale     — proposal относится не к текущей revision/Draft identity.
```

AI confidence показывается отдельно от deterministic confidence. Повторное согласие модели не превращает proposal в high-confidence geometry без local corroboration.

**Проверенный факт.** Current Draft implementation сохраняет raw provider output отдельно, ограничивает confidence и не разрешает модели менять local geometry, thickness, classification или host.

**Инженерный вывод.** LLM лучше использовать как recall-oriented sensor, а sanitizer — как единственный component, который может превратить сигнал в reviewable geometry.

**Ограничение.** Deterministic validation может безопасно блокировать полезный proposal. Fail-closed architecture сознательно предпочитает review или повторный запуск тихой порче плана.

## 6. Current-state revalidation нужна даже после sanitation

Sanitized proposal может быть корректным в момент ответа модели и устареть до Apply. Пользователь мог:

- повторить local recognition;
- изменить reference rotation или calibration;
- принять или отклонить другой candidate;
- применить предыдущую batch;
- вручную изменить geometry документа;
- получить новый host mapping.

Поэтому Apply не доверяет сохранённому status `eligible`. Перед mutation система заново проверяет current document, current host walls, proposal identity, duplicates и conflicts.

```text
review decision
→ resolve current candidates and hosts
→ revalidate every accepted item
→ any stale/invalid item: no mutation
→ all items valid: one atomic Apply batch
→ semantic Undo/Redo unit
```

**Проверенный факт.** Approved design требует atomic Apply: если хотя бы один accepted geometry item stale или invalid, ни одна geometry mutation не выполняется.

**Инженерный вывод.** Sanitization и authorization разделены по времени: первая доказывает review eligibility, вторая — допустимость mutation прямо сейчас.

**Ограничение.** Atomicity означает, что один конфликтующий proposal может остановить всю batch; UI должен ясно показать, что нужно reject, correct или rerun.

## 7. Explicit Apply — единственная mutation boundary

До Apply пользователь видит четыре разных класса evidence:

1. reliable local geometry;
2. uncertain local geometry;
3. eligible AI proposals;
4. blocked AI proposals в diagnostics.

AI suggestion не должна визуально маскироваться под обычную стену. Provider origin, model confidence, deterministic confidence и validation reasons должны оставаться видимыми.

Для false-wall advisory действует ещё более узкая граница: модель может указать exact local candidate как вероятный sanitary/furniture symbol, но это не удаляет существующую apartment wall. Пользовательское согласие меняет только decision Draft candidate; domain command появляется лишь для geometry, которая действительно проходит Apply.

Успешная Apply batch:

- использует deterministic IDs;
- повторно применённая batch становится no-op;
- записывается как одна semantic history operation;
- поддерживает Undo/Redo;
- не допускает orphan openings или частичную geometry mutation.

## 8. Ошибки provider не должны повреждать локальный результат

Hybrid pipeline остаётся полезным без сети и provider key. Local-only recognition — полноценный путь, а не degraded error state.

### Malformed response

Для malformed JSON допускается максимум одна bounded schema-repair попытка без изображений. Второй failure отклоняет batch. Provider prose не преобразуется эвристически в geometry.

### Stale identity

Несовпадение `requestId`, `referenceRevision` или `localDraftFingerprint` отклоняет batch целиком. Пользователь должен повторить AI request против текущего Draft.

### Overload

Превышение proposal или diagnostic budget отклоняет batch. Результаты не обрезаются молча, потому что truncated response создаёт ложное ощущение полноты.

### Timeout, rate limit или provider failure

Local Draft и предыдущая proposal batch остаются без mutation. Разрешена только append-only redacted diagnostic запись; secrets, image data URLs и raw response bodies не попадают в обычные logs.

**Проверенный факт.** Design задаёт fail closed поведение для malformed, stale и overload cases, а provider failure оставляет local state без mutation.

**Инженерный вывод.** Надёжный AI integration определяется не только happy path, но и тем, сохраняется ли deterministic product value при полном отсутствии модели.

**Ограничение.** Non-destructive failure не гарантирует хороший UX: retry, diagnostics и distinction между blocked и unavailable требуют отдельной browser и product-owner проверки.

## 9. Automated evidence и product acceptance — разные факты

Текущий development stack содержит сильные automated signals:

- unit contracts;
- Core и Source recognition benchmark;
- public redrawn real-fixture benchmark;
- Chromium/browser worker seam;
- WebKit smoke;
- typecheck, lint и production build;
- privacy and secret-leak checks;
- zero incorrect-high-confidence, unknown-host и stale-decision counters в принятых scopes.

Но эти signals имеют bounded scope.

### PR #42 — M7.8C

[Vlezet PR #42](https://github.com/True-Ruslan/vlezet/pull/42) остаётся Draft и требует product-owner retest на том же representative real plan. Зелёные opening gates не заменяют проверку doubled wall, missing windows, sanitary clutter и Apply/Undo/Redo behavior в реальном UI.

### PR #44 — real fixture foundation

[Vlezet PR #44](https://github.com/True-Ruslan/vlezet/pull/44) остаётся Draft. На зафиксированном checkpoint real wall geometry F1 был `0.827338`, а real opening F1 — `0.627451`, ниже immutable merge threshold `0.85`. Это полезное benchmark evidence, но не product acceptance.

### PR #45 — hybrid AI proposal recovery

[Vlezet PR #45](https://github.com/True-Ruslan/vlezet/pull/45) остаётся Draft. На текущем checkpoint реализованы identity, runtime-only evidence, bounded provider protocol, whole-batch sanitation и door proposal sanitizer, но window sanitation, wall advisory, reconciliation, race-safe controller, review UI, Apply path и end-to-end recorded-provider gate ещё не завершены.

**Проверенный факт.** M7.8B принят; M7.8C и stacked PR #44/#45 остаются pending Draft evidence и требуют representative product-owner retest.

**Инженерный вывод.** Benchmark отвечает «что измерил corpus», browser test — «что выполнил harness», CI — «какие contracts прошли», а product acceptance — «решает ли exact build задачу пользователя на representative input».

**Ограничение.** Даже достижение F1 threshold не доказывает универсальную точность для произвольных планов, сканов и perspective photos.

## 10. Практический authority checklist для hybrid recognition

Перед тем как разрешить model-assisted geometry попасть в документ, система должна ответить на вопросы:

1. Какой component владеет persistent geometry?
2. Являются ли local CV и AI outputs отдельными proposals?
3. К какой точной revision и fingerprint относится batch?
4. Может ли model confidence обойти raster/topology validation?
5. Сохраняются ли raw и sanitized geometry раздельно?
6. Что происходит при malformed, stale и overload response?
7. Может ли provider failure изменить local Draft?
8. Проверяется ли current state непосредственно перед Apply?
9. Является ли mutation atomic и idempotent?
10. Есть ли semantic Undo/Redo и понятный product-owner acceptance gate?

Если любой ответ неявен, AI proposal находится слишком близко к authoritative state.

## 11. Что эта Note доказывает — и чего не доказывает

Эта Note фиксирует проверенную архитектурную границу и текущую product direction.

Она доказывает:

- принятую M7.8B model: immutable local candidates, bounded AI verification и explicit Apply;
- необходимость separate AI proposal layer для omissions;
- identity binding через `requestId`, `referenceRevision` и `localDraftFingerprint`;
- роль deterministic validation и current-state revalidation;
- non-destructive fail closed behavior;
- различие benchmark/browser/CI evidence и product acceptance.

Она не доказывает:

- что hybrid recognition завершён;
- что M7.8C прошёл product-owner retest;
- что PR #42, PR #44 или PR #45 готовы к promotion;
- что current benchmark thresholds достигнуты во всех real fixtures;
- что AI proposal можно применять без review;
- что система правильно распознаёт произвольную планировку.

Правильная цель hybrid architecture — не сделать модель источником истины. Цель — безопасно расширить recall, сохранив deterministic authority, reviewability и честные acceptance boundaries.
