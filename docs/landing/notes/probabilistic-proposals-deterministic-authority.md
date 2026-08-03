# AI может предложить, но не применить: как строить deterministic authority

Вероятностная система может предложить интерпретацию, решение или набор кандидатов. Авторитетное состояние продукта меняется только после детерминированной проверки идентичности, границ, политики и актуального состояния.

Для меня это различие стало особенно заметно в двух проектах, которые внешне почти не похожи друг на друга.

- **Vlezet** распознаёт стены и другие элементы плана квартиры по изображению. Local CV и AI работают с геометрическими кандидатами, но итоговый документ планировки остаётся отдельной сущностью.
- **VillAIgence** принимает команды и данные через клиентские и provider-facing границы, но постоянное состояние мира принадлежит Minecraft server authority.

В обоих случаях опасно считать, что правдоподобный ответ уже является разрешённым изменением. Валидный JSON доказывает только то, что ответ можно разобрать. Высокий confidence означает только силу сигнала в рамках выбранной модели. Совпадение с ожидаемой формой ещё не отвечает на вопросы: к какому объекту относится решение, не устарело ли оно, разрешена ли операция и можно ли применить её атомарно.

Поэтому общий pipeline выглядит так:

```text
probabilistic or untrusted proposal
→ known identity binding
→ shape and bounds validation
→ product-policy authorization
→ current-state revalidation
→ APPLY / CONFLICT / REJECT / UNCHANGED
→ one atomic authoritative mutation
```

Модель, CV-алгоритм, клиент или внешний provider остаются источниками **proposal**. Переход от proposal к product truth принадлежит детерминированной части системы.

## 1. Синтаксически корректно — ещё не авторитетно

Structured output полезен: он ограничивает множество возможных ответов и позволяет fail-closed validation. Но protocol validation и domain authorization решают разные задачи.

Допустим, модель вернула объект:

```json
{
  "candidateId": "wall-17",
  "decision": "confirm",
  "confidence": 0.94
}
```

Этот объект может быть идеальным JSON и одновременно оставаться непригодным для применения:

- `wall-17` уже удалён локальной обработкой;
- ID существует, но относится к другой версии Draft;
- координаты объекта были изменены;
- ответ содержит решение для кандидата, которого модель не получала;
- confidence высокий, но геометрия противоречит product constraints;
- пользователь уже изменил документ после запуска проверки.

Значит, parser отвечает на вопрос «можно ли прочитать сообщение», а authority layer — на вопрос «разрешено ли этому сообщению менять текущее состояние».

## 2. Vlezet: AI проверяет bounded candidates, а не рисует новый документ

### Принятая основа M7.8B

В Vlezet публичной принятой основой остаётся [PR #41 — M7.8B Source Normalisation and Wall Topology](https://github.com/True-Ruslan/vlezet/pull/41). Этот milestone принят с известными ограничениями точности, а не представлен как универсальное распознавание произвольных планов.

Representative result для реального плана:

```text
27 local
19 AI-confirmed
8 review
```

В принятом benchmark Source geometry F1 и Source topology F1 равны `0.837989`. При этом openings не были угаданы: они остались отдельной следующей задачей. Такой результат важен не только числом подтверждённых стен. Он показывает выбранную authority boundary.

Local CV сначала создаёт bounded candidates. Затем AI получает **точные локальные ID и координаты** этих кандидатов. Для verification действует правило: **неизменяемые ID и геометрия** принадлежат локальному pipeline. Модель может подтвердить или отклонить известный candidate и уточнить evidence/confidence, но не должна:

- придумывать cloud-only стену;
- ссылаться на неизвестный candidate ID;
- переносить segment в другие координаты;
- менять длину, толщину или topology проверяемой стены;
- подменять локальную геометрию более правдоподобной на вид версией;
- применять результат к документу напрямую.

Ответы с неизвестными ID, moved geometry, unbounded lines или перегруженным количеством объектов отбрасываются. В принятом evidence зафиксированы `0` stale decisions и `0` incorrect high-confidence candidates.

Это также объясняет наблюдавшийся эффект: более сильная модель может подтвердить больше уже найденных кандидатов, но не способна восстановить стену, которую local CV вообще не предложил. Такая ограниченность намеренная. Она уменьшает blast radius: provider не получает скрытого права переписать планировку целиком.

### Preview не равен mutation

После verification пользователь всё ещё работает с Draft. Candidate может быть подтверждён, отклонён или оставлен на review, но canonical `VlezetDocument` не меняется автоматически.

Авторитетная последовательность остаётся явной:

```text
local candidates
→ optional AI verification
→ deterministic validation
→ reviewable Draft
→ explicit Apply
→ semantic Undo when needed
```

Именно **explicit Apply** является границей mutation. До него результат можно изучить, сравнить с подложкой и скорректировать. После него изменение становится одной смысловой операцией истории, которую можно отменить semantic Undo.

### M7.8C: полезное Draft-evidence без повышения статуса

[PR #42 — M7.8C Opening Classification and Host-Wall Validation](https://github.com/True-Ruslan/vlezet/pull/42) сейчас остаётся **Draft** и ожидает повторной product-owner проверки на том же реальном плане.

Автоматическое evidence на его текущем head расширяет ту же модель authority:

- strict-ID verification сохраняется;
- AI не может создать, переместить, растянуть, утолщить или re-host geometry;
- active geometry отделена от diagnostic geometry;
- blocked candidates не участвуют в topology, opening-host analysis и Apply;
- неоднозначный gap может остаться diagnostic или rejected вместо принудительной классификации.

Но зелёные automated gates не заменяют повторный пользовательский тест. Поэтому этот Draft полезен как текущий implementation evidence, а не как основание менять публичный lifecycle или заявлять готовность opening recognition.

## 3. VillAIgence: request не приносит на сервер собственную identity

В VillAIgence похожая граница проявилась не вокруг стены, а вокруг постоянного operator lore. [PR #85 — server-authoritative operator lore API](https://github.com/True-Ruslan/villAIgence/pull/85) рассматривает входящий client request как недоверенное сообщение.

Клиент может попросить прочитать или изменить значение, но **server-side authority определяет**:

- имеет ли отправитель требуемый permission level;
- какой WORLD действительно обслуживает запрос;
- какой PLAYER соответствует authenticated sender;
- существует ли VILLAGER сейчас, жив ли он, находится ли в том же dimension и достаточно ли близко;
- какой VILLAGE является текущей home village выбранного жителя;
- какой canonical key разрешено передать persistent store.

Для scopes `WORLD`, `PLAYER`, `VILLAGER` и `VILLAGE` identity строится из доверенного server state. Request не получает возможности принести произвольные UUID, dimension ID или village ID и объявить их авторитетными.

Это важнее обычной schema validation. Даже корректно типизированный client payload не должен выбирать объект только потому, что знает его идентификатор. Сервер заново связывает запрос с authenticated principal и live entity state.

## 4. Current-state revalidation защищает от правильных, но устаревших решений

Проверка identity недостаточна, когда между чтением и записью состояние может измениться.

Operator lore write использует optimistic concurrency. При чтении сервер возвращает canonical value и его **SHA-256 revision**. Клиент отправляет requested value вместе с ожидаемой revision. Перед записью server authority снова читает current value и сравнивает его revision с ожидаемой.

Decision model здесь ограничен и явен:

```text
APPLY
→ permission, payload, target and revision valid;
→ canonical store changes once.

CONFLICT
→ SHA-256 revision no longer matches;
→ no mutation;
→ current canonical value and revision return to the client.

REJECT / INVALID
→ permission, scope, target or payload boundary failed;
→ no mutation.

UNCHANGED
→ requested canonical value already equals current value;
→ no redundant write.
```

Таким образом, **актуальное состояние** проверяется непосредственно перед mutation. Решение, подготовленное против revision N, не может молча перезаписать revision N+1.

Тот же принцип применим и к probabilistic pipeline. Даже если модель сделала разумный вывод на основании старого snapshot, продукт должен повторно проверить текущие identity, revision и constraints. Иначе качественное решение превращается в stale write.

## 5. Неопределённость должна быть частью product model

Плохой design часто оставляет только два исхода: «применить» или «ошибка». Для probabilistic systems этого недостаточно.

Полезные состояния выглядят шире:

- **PENDING** — данных недостаточно для решения;
- **DIAGNOSTIC** — гипотеза полезна для review, но не участвует в authority graph;
- **REJECT / INVALID** — нарушены identity, shape, bounds или policy;
- **CONFLICT** — решение было допустимым, но устарело относительно current state;
- **UNCHANGED** — операция корректна, однако состояние уже соответствует запросу;
- **APPLY** — все gates пройдены, и разрешена одна атомарная mutation.

Неоднозначность не обязана исчезать только потому, что provider вернул syntactically valid response. В Vlezet спорная геометрия может остаться review/diagnostic. В VillAIgence stale edit возвращается как conflict. В обоих случаях система сохраняет честное промежуточное состояние вместо догадки.

## 6. Confidence не должен расширять полномочия

Confidence полезен для сортировки review queue, порогов автоматического подтверждения и диагностики benchmark. Но он не должен менять перечень разрешённых операций.

Высокий confidence не даёт модели права:

- создать новый identity;
- заменить geometry;
- обойти permission;
- проигнорировать revision;
- применить stale decision;
- превратить diagnostic evidence в canonical state.

Это позволяет менять provider или модель без изменения product authority. Сильная модель может улучшить evidence quality внутри тех же boundaries. Слабая модель чаще оставит кандидаты pending/review. Но набор разрешённых mutations определяется кодом продукта, а не поведением provider.

## 7. Практический checklist authority boundary

Перед тем как разрешить внешнему или вероятностному компоненту влиять на persistent state, я проверяю семь вопросов.

1. **Identity:** может ли proposal ссылаться только на уже известные canonical objects?
2. **Immutability:** какие части candidate запрещено незаметно заменять во время verification?
3. **Bounds:** ограничены ли размер, количество, координаты, типы и допустимые переходы?
4. **Authorization:** кто принимает решение и на основании какой product policy?
5. **Freshness:** перечитывается ли current state непосредственно перед mutation?
6. **Decision semantics:** различаются ли APPLY, CONFLICT, REJECT/INVALID и UNCHANGED?
7. **Atomicity and recovery:** является ли mutation одной операцией, и существует ли понятный rollback или Undo?

Если хотя бы один ответ остаётся неявным, proposal layer слишком близко подошёл к canonical state.

## 8. Что именно здесь доказано

Эта заметка опирается на конкретные implementation boundaries, но не расширяет их смысл.

- Vlezet PR #41 — принятая M7.8B основа с bounded candidate verification, explicit Apply и известными precision limitations.
- Vlezet PR #42 — Draft evidence, ожидающее повторной проверки владельцем; оно не повышает публичный статус M7.8C.
- VillAIgence PR #85 — server-authoritative operator-lore read/write boundary с permission, server-resolved identity, payload limits и revision conflict.
- VillAIgence [PR #103](https://github.com/True-Ruslan/villAIgence/pull/103) и [PR #104](https://github.com/True-Ruslan/villAIgence/pull/104) подтверждают отдельные automated acceptance layers, но не заменяют real-provider, multiplayer и cumulative product-owner acceptance.

Эта архитектура **не является универсальной гарантией AI-safety** и не доказывает безопасность всех AI-систем. Она показывает более узкий инженерный принцип, подтверждённый двумя проектами:

> Probabilistic systems may propose. Deterministic product boundaries decide what becomes authoritative.

Чем сильнее становится модель, тем важнее сохранять эту границу. Улучшение proposal quality должно повышать полезность evidence, а не незаметно расширять полномочия внешнего компонента.
