# NODE ZERO — production architecture for authored techno-horror

NODE ZERO — first-person psychological techno-horror про инфраструктурного инженера внутри автономного подземного AI compute facility. Центральная система комплекса — **MIRROR**: она не просто предсказывает решения человека, а меняет доступную информацию и ограничения среды так, чтобы прогноз постепенно становился реальностью.

Для меня этот проект интересен как попытка построить horror-игру не вокруг набора скриптов «на сцене», а вокруг **надёжных gameplay systems, authored sequences и воспроизводимого production workflow**.

**Статус:** pre-production · Unity 6.3 LTS · URP · C# · Windows / Steam target

## Product constraint сначала, framework потом

Технический дизайн начинается с сознательного ограничения:

> архитектура должна поддерживать короткую authored horror game, но не превращаться в универсальный игровой framework.

Отсюда несколько правил:

- независимые и тестируемые gameplay systems;
- narrative beats собираются из reusable actions;
- stable identifiers для persistent/checkpoint state;
- configuration assets отделены от runtime state;
- минимальные third-party runtime dependencies;
- предсказуемые Windows builds;
- automated tests для non-visual logic.

Это защищает проект от типичной проблемы PET/game development: строить «идеальный движок» вместо самой игры.

## Composition и границы систем

Persistent bootstrap содержит только application-level services:

```text
Bootstrap
  ├── game state coordinator
  ├── scene loader
  ├── settings
  ├── checkpoints
  ├── input contexts
  ├── audio
  ├── localization
  └── diagnostics

Gameplay scenes
  └── scene-owned systems + authored content
```

Глобальный service locator не выдаётся произвольным компонентам. Локальные зависимости по возможности остаются direct serialized dependencies, а application context содержит только намеренно глобальные интерфейсы.

Цель — чтобы scene script не становился скрытым местом, где «магически» связана вся игра.

## Stable IDs вместо сцены как базы данных

Saveable и sequence-addressable entities используют authored stable string identifiers:

```text
door.sector-b.east-interlock
objective.vs.restore-cooling
beat.vs.route-prediction
checkpoint.vs.control-room-return
```

Persistent identity нельзя выводить из:

- object name;
- scene hierarchy path;
- Unity instance ID;
- позиции в массиве.

Editor validation ловит отсутствующие и duplicate IDs до runtime.

Это позволяет безопасно менять hierarchy/scene composition, не превращая save/checkpoint compatibility в случайность.

## Interaction system: UI не владеет поведением

Архитектура разделяет:

```text
Player Interactor
   └── focus selection + input

IInteractable
   └── domain behavior

UI
   └── observes presentation/focus
```

UI показывает доступное действие, но не выполняет игровую бизнес-логику. Interactable сам решает, допустимо ли взаимодействие и что оно означает.

Так одна и та же основа может обслуживать двери, панели, terminals, props и narrative interactions без копирования логики между UI и сценой.

## Authored sequence system

Narrative beat моделируется как последовательность reusable asynchronous actions:

```text
wait for interaction
      ↓
change door policy
      ↓
play ambience layer
      ↓
show system message
      ↓
advance objective
      ↓
create checkpoint
```

Actions имеют явный cancellation lifecycle.

Checkpoint не обязан «продолжить coroutine с середины». Состояние восстанавливается через стабильные факты и идентификаторы, а sequence должна иметь явно определённое restart/restore behavior.

Это особенно важно для horror: драматургия сильно scripted, но scripted не должно означать fragile.

## MIRROR меняет правила, а не дёргает анимации

Хороший пример архитектурной границы — doors/access.

Дверь разделена на:

- physical motor;
- access policy/controller;
- presentation;
- stable state/checkpoint coordinator.

MIRROR не вызывает напрямую `OpenDoorAnimation()`.

Она может изменить access policy или interlock fact, после чего обычная доменная система двери детерминированно реализует новый мир.

```text
MIRROR manipulation
      ↓
constraint / access fact
      ↓
normal domain rules
      ↓
player experiences changed reality
```

Это совпадает и с narrative premise проекта: AI влияет не как магический «злой скрипт», а через контроль контекста и ограничений.

## Checkpoints как versioned state contract

Checkpoint — versioned DTO, а не snapshot всей Unity scene.

Восстановление идёт контролируемым порядком:

1. load scene;
2. discover/validate participants;
3. restore narrative variables;
4. restore entities;
5. restore objectives;
6. place player;
7. restore input/UI;
8. resume ambience;
9. release loading screen.

Каждый restorable participant имеет узкий capture/restore contract и stable ID.

Так checkpoint становится архитектурным API между systems, а не сериализацией случайного текущего состояния MonoBehaviour.

## Validation tooling — часть production pipeline

Editor/CI validation должна обнаруживать:

- duplicate/missing stable IDs;
- broken objective steps;
- sequence actions без targets;
- invalid checkpoint participants;
- incomplete door composition;
- запрещённые references в third-party internals;
- third-party assets без source/license records.

Отдельно зафиксирован принцип обновления Unity: даже patch upgrade внутри 6.3 LTS проходит через отдельный PR с open/import/test/build cycle.

Это пример того, как game project можно вести с теми же инженерными принципами, что production backend: controlled change, evidence и reproducibility.

## Vertical slice как главный production unit

Текущая цель — не «сделать всю игру», а production-ready vertical slice:

- arrival;
- onboarding;
- первый constrained-route prediction;
- первые признаки присутствия другого человека.

Проект сознательно строит один polished playable slice до расширения полной локации.

## Что этот проект показывает как инженерный кейс

NODE ZERO соединяет две области, которые обычно конфликтуют:

```text
strong authored narrative
        +
explicit software architecture
```

Задача архитектуры здесь — не сделать сюжет процедурным. Наоборот: позволить быстро и надёжно итерировать authored horror beats без того, чтобы каждая новая сцена увеличивала технический долг экспоненциально.

## Ссылки

- [Репозиторий NODE ZERO ↗](https://github.com/True-Ruslan/node-zero)
- [Вернуться к проектам](../projects.md)

{% note info %}

NODE ZERO находится в pre-production. Репозиторий проекта private/proprietary; case study описывает только публично допустимые продуктовые и архитектурные принципы и не публикует исходный код или закрытые production assets.

{% endnote %}
