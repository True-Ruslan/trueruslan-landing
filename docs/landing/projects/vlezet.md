# Vlezet — точная планировка квартиры без CAD

**Vlezet** — local-first конструктор планировок, в котором реальную квартиру можно собрать из стен, проёмов и мебели, проверить размеры и площади, посмотреть схему в 3D и использовать распознавание плана как редактируемую помощь, а не как источник истины.

[Репозиторий на GitHub ↗](https://github.com/True-Ruslan/vlezet)

![Граница между распознаванием и авторитетной геометрией Vlezet](../../assets/diagrams/vlezet-recognition-authority.svg)

## Коротко

<dl class="tr-project-glance" data-tr-project-glance="vlezet">
<dt>Моя роль</dt>
<dd>Product/domain architecture: geometry authority, editing model, recognition boundaries и acceptance strategy.</dd>
<dt>Стек</dt>
<dd>TypeScript · Next.js · Geometry · Computer vision · Three.js</dd>
<dt>Задача</dt>
<dd>Сделать план квартиры точным и редактируемым, а распознавание — полезной подсказкой без права незаметно менять authoritative geometry.</dd>
<dt>Результат</dt>
<dd>M7.8B остаётся принятой границей; автоматический следующий путь не прошёл usefulness acceptance, поэтому текущая bounded direction — Assisted Tracing.</dd>
<dt>Статус</dt>
<dd><span data-tr-project-status="vlezet"></span></dd>
</dl>

<div data-tr-project-timeline="vlezet"></div>

<!-- case-study:problem -->
## Проблема: план квартиры должен оставаться точным после первого впечатления

Первый прототип планировщика сделать сравнительно легко: дать пользователю нарисовать прямоугольник, поставить диван и показать примерную площадь.

Реальная квартира разрушает такую модель. У стены есть ось и толщина. У проёма — ширина, положение на конкретной стене и направление открывания. Комната появляется не потому, что пользователь нарисовал цветной полигон, а потому, что стены действительно образовали замкнутую топологию. Мебель может визуально помещаться и одновременно перекрывать дверь или оставлять непроходимый зазор.

Импорт фотографии или PDF добавляет неопределённость: поворот, поля, перспектива, подписи, размерные линии, сантехника, мебель и дверные дуги. Даже корректный JSON от LLM не означает, что восстановленные стены совпадают с реальным планом.

> Распознавание может предложить геометрию. Авторитетной она становится только после проверки, детерминированной валидации и явного Apply в общий документ.

<!-- case-study:constraints -->
## Ограничения и риски

### Миллиметры — единственная постоянная единица мира

Canvas-пиксели зависят от zoom, viewport и плотности экрана. Persistent model хранит миллиметры, а Konva, Three.js, размеры на экране и PNG-экспорт только проецируют эту модель.

### Один документ вместо нескольких параллельных истин

`VlezetDocument` владеет стенами, проёмами, объектами и versioned persistence. Комнаты, площади, размеры, 3D meshes и fit-диагностика выводятся из него.

Recognition Draft, planning Preview, UI-фильтры, подсветка и evidence остаются временными. Они не должны незаметно создавать второй проект рядом с основным.

### Existing geometry нельзя молча заменить

Локальный CV и cloud review не получают права очистить уже нарисованную квартиру. Кандидаты можно принять, отклонить или исправить, а изменение документа происходит только через явную операцию Apply.

### AI proposal не равен authoritative geometry

Принятый M7.8B ограничивал cloud review точными local IDs. Закрытый unmerged PR #45 исследовал missing-opening recovery только как отдельные proposals с deterministic host/raster/topology/overlap validation. Этот путь сохранён как R&D evidence, но не принят в продукт и не даёт AI geometry authority.

Текущий pivot в PR #52 идёт в противоположную сторону: **Assisted Tracing** начинается с явного действия пользователя. Reference image может помогать уточнить только текущий ephemeral preview, когда локальное evidence однозначно; при неоднозначности помощник обязан abstain. В design gate нет AI/network dependency и ещё нет product code.

### 3D остаётся проекцией

Three.js-визуализация read-only. У неё нет собственного набора координат, furniture-fit state или редактора проёмов. Любая правка возвращается в общий 2D/domain command path.

<!-- case-study:current-state -->
## Текущая lifecycle- и acceptance-граница

В `main` приняты и смержены milestones **M0–M7.8B**.

Уже работают:

- стены, топология, комнаты, проёмы, размеры и площади в миллиметрах;
- мебель, exact transforms и collision/door/clearance diagnostics;
- semantic Undo/Redo;
- local projects, autosave, backup, import/export и PNG;
- reference-plan import, calibration и tracing;
- editable local/OpenRouter candidates с explicit Apply;
- deterministic read-only 3D projection;
- bounded planning alternatives с Preview и revalidated atomic Apply;
- responsive editor shell, inspectors, onboarding и furniture-fit workflow;
- versioned recognition benchmark;
- M7.8B region-first wall extraction, bounded topology и verification-only AI.

M7.8B принят с известными ограничениями. На representative source система вернула 27 local wall candidates, 19 AI-confirmed и 8 pending review. Принятые Source geometry F1 и Source topology F1 составили `0.837989`.

После этого автоматический M7.8C путь был доведён до сильных deterministic gates, но **не прошёл product-owner usefulness acceptance** на исходном плане квартиры. 8 августа PR #42 был закрыт unmerged после representative retest. Связанные stacked PR #44 (real-fixture benchmark) и PR #45 (hybrid proposal recovery) также закрыты unmerged и сохранены только как R&D evidence.

Это важная отрицательная проверка: зелёные benchmark/CI не превратили систему в достаточно полезный продукт. Результат не отменяет принятого M7.8B, но закрывает автоматический путь как текущую acceptance boundary.

Следующая bounded direction — **Assisted Tracing**. Draft PR #52 является design-only gate из свежего `main`: пользователь сам выбирает тип объекта и указывает предполагаемую геометрию, а локальный анализ reference image может только безопасно уточнить ephemeral preview. На этом этапе product code ещё не принят.

Публичный lifecycle остаётся **pre-production — ACTIVE DEVELOPMENT**.

<!-- case-study:decisions -->
## Архитектура и ключевые решения

### Framework-independent geometry authority

Доменная модель, вычисления и semantic history живут ниже React, Konva и Three.js. Это позволяет проверять топологию и размеры без браузера, а renderer менять без миграции persistent geometry.

### Semantic commands вместо snapshot-истории интерфейса

Undo/Redo хранит смысл операций: добавить стену, изменить толщину, применить проверенный набор кандидатов, изменить параметры проёма. Один Apply можно отменить одним шагом, даже если внутри он добавил несколько сущностей.

### Furniture fit опирается на общую геометрию

Fit определяют containment, collision, door zones и реальные расстояния между повёрнутыми контурами. UI показывает детерминированное решение: статус размещения, кратчайший зазор, рекомендуемые зоны и причины конфликта.

### Recognition Draft — отдельная стадия доверия

Исторический автоматический recognition path был разделён на этапы загрузки, калибровки, local candidates, optional AI proposals, deterministic validation, review и explicit Apply. Эта архитектура сохранила authority, но representative product review показал, что безопасная автоматизация сама по себе ещё не делает реконструкцию достаточно полезной.

### Assisted Tracing ставит намерение пользователя перед распознаванием

PR #52 меняет порядок authority:

1. пользователь выбирает объект — стена, дверь или окно;
2. пользователь проводит приблизительный segment/placement по reference plan;
3. локальный bounded helper анализирует только небольшой raster region вокруг текущего preview;
4. если evidence однозначно, preview может быть уточнён;
5. если evidence неоднозначно, helper ничего не выдумывает;
6. commit создаёт обычную semantic geometry command;
7. Undo/Redo работает тем же domain path, что и для ручного редактирования.

Так reference image помогает точности, но не становится вторым владельцем документа.

### Сначала benchmark, потом tuning — и benchmark не заменяет usefulness

M7.8A добавил versioned public-safe corpus, Core и Source execution, TP/FP/FN overlays и метрики для геометрии стен, топологии, проёмов, комнат, площадей, confidence и reconciliation.

Закрытый PR #44 расширил эту идею до repository-owned analogues реальных планов и сохранил immutable safety thresholds. Это полезный R&D результат, но product-owner retest показал отдельную истину: высокая автоматизированная измеримость и даже зелёные технические gates не доказывают, что automatic reconstruction полезна на исходной пользовательской задаче.

### Region-first extraction вместо line-first шума

M7.8B перевёл локальное распознавание к region-first обработке толстых архитектурных областей. Canny/Hough остался bounded fallback, а не главным владельцем результата.

Candidate overload завершается fail-closed: перегруженный Draft не сохраняется, не отправляется в AI и не получает право на Apply.

### Hybrid AI recovery сохранён как R&D, а не как следующий продуктовый путь

PR #45 показал, как missing doors/windows можно было бы моделировать как proposal records с host evidence и без права менять local walls. После failed usefulness acceptance автоматического направления этот PR закрыт unmerged. Его safety-решения остаются инженерным материалом, но следующий продуктовый slice не зависит от cloud recovery.

## Реальные ошибки, которые изменили архитектуру

### Лупа и калибровка смотрели не в ту систему координат

На широком изображении Canvas содержал letterbox-поля. Курсор, magnifier, маркеры и calibration line вычислялись относительно всей stage, а не фактически отрисованного image rectangle. Исправление потребовало единого преобразования через rendered image bounds и запрета принимать клики по полям.

### Направление A → B не должно было переворачивать план

Для горизонтальной или вертикальной calibration line важна ось, а не порядок концов. Калибровка стала undirected axis, поэтому обратный выбор точек больше не поворачивает сохранённый план примерно на 180°.

### OpenCV возвращал больше линий, чем читала программа

`HoughLinesP` в OpenCV.js отдаёт координаты плоскими группами `x1, y1, x2, y2` в `data32S`. Предыдущая итерация по `lines.rows` забирала лишь часть результата. После исправления стало видно, что полный raster содержит не только стены.

### Первый real-plan review выявил symbol network вместо shell

Ранняя M7.8B-реализация сформировала 417 local wall candidates, ноль проёмов и связанную сеть символов, мебели и подписей. Corrective iteration добавил region-first structural mask, bounded fallback, candidate budget, sanitization Draft и запрет cloud-only geometry.

### Валидный AI-ответ может быть пространственно неправильным

Response healing и JSON Schema исправляют protocol defects. Они не доказывают, что стена находится там же, где на изображении. Unknown IDs, moved coordinates, cloud-only walls, unbounded lines и overloaded responses отклоняются до product state.

### Проём нельзя принимать без стены-хозяина

Gap в линии может быть дверью, окном, текстом или артефактом edge detection. M7.8B намеренно оставил openings равными нулю вместо уверенного проёма без verified host wall. Закрытые PR #42/#45 исследовали эту границу, но не получили product acceptance.

### Зелёный automatic pipeline всё равно может быть недостаточно полезен

Representative retest 8 августа стал отдельным product gate. Automatic M7.8C сохранял deterministic safety, но результат всё ещё требовал слишком много исправлений и не прошёл usefulness acceptance. Поэтому стратегия сменилась не на снижение thresholds, а на Assisted Tracing, где пользователь задаёт intent и rough geometry напрямую.

<!-- case-study:alternatives -->
## Рассмотренные и отвергнутые альтернативы

### Canvas-пиксели как persistent coordinates

Отвергнуты. Пиксели меняются вместе с zoom, viewport и устройством. Миллиметры остаются единственной canonical geometry.

### Прямой overwrite документа результатом распознавания

Отвергнут. Recognition Draft не может очищать или заменять существующий `VlezetDocument`; только явный Apply создаёт semantic command.

### Cloud-модель как второй владелец геометрии

Отвергнута. Даже в закрытом hybrid R&D proposal оставался отдельным evidence object и проходил deterministic validation. Модель не получала права молча двигать стены, менять thickness, re-host openings или применять результат.

### Line-first Hough как основной владелец результата

Отвергнут. Такой подход смешивает стены, мебель, сантехнику, подписи и размерные линии. Region-first structural extraction лучше соответствует архитектурной геометрии, а Hough остаётся bounded supplemental evidence.

### Снижение benchmark threshold ради merge

Отвергнуто. Красный measured result полезнее зелёного пайплайна, который перестал защищать продукт. Позднее product-owner FAIL дополнительно показал, что даже прохождение технических thresholds не должно заменять usefulness acceptance.

### Продолжать наращивать automatic recognition после failed owner retest

Отвергнуто как текущая стратегия. PR #42/#44/#45 закрыты unmerged. Вместо ещё одного слоя heuristics/cloud recovery принят design pivot к Assisted Tracing, где система помогает пользователю проводить точную геометрию, а не пытается восстановить весь план за него.

### Отдельная authoritative 3D-модель

Отвергнута. Второй geometry store создавал бы drift. 3D остаётся read-only projection общего документа.

<!-- case-study:evidence -->
## Что подтверждено

<div data-tr-project-evidence="vlezet"></div>

Evidence разделяет:

- accepted product workflow и deterministic geometry contracts;
- M7.8A reproducible benchmark authority;
- M7.8B product-owner acceptance с точными метриками и ограничениями;
- PR #42 как **failed product usefulness gate** и closed-unmerged automatic path;
- PR #44 и PR #45 как closed-unmerged R&D evidence;
- PR #52 как pending **Assisted Tracing design gate** без принятого product code.

Статус `verified` относится к точности этого snapshot и перечисленным scopes. Он не означает, что Vlezet распознаёт произвольный архитектурный план автоматически или что PR #52 уже принят как реализованная capability.

<!-- case-study:limitations -->
## Известные ограничения

- accepted M7.8B Source topology F1 `0.837989` ниже финальной цели M7.8 `0.90`;
- automatic M7.8C path не прошёл representative product-owner usefulness acceptance и больше не является текущей merge/acceptance boundary;
- PR #44 и PR #45 закрыты unmerged, поэтому их R&D результаты не должны описываться как shipped behavior;
- Assisted Tracing в PR #52 пока design-only: product code, exact-head browser proof и owner acceptance ещё впереди;
- bounded snap/refinement должен abstain при неоднозначном raster evidence, иначе helper снова начнёт выдумывать геометрию;
- perspective-photo recognition не решён;
- room-face derivation, OCR labels, area constraints и confidence calibration остаются дальнейшими slices.

<!-- case-study:next -->
## Следующий принятый шаг

Сначала необходимо завершить **design review PR #52 — Assisted Tracing**.

Design gate должен сохранить:

1. `VlezetDocument` как единственную geometry authority;
2. явный выбор пользователем типа объекта и rough placement;
3. только локальный bounded raster analysis вокруг текущего preview;
4. fail-closed abstention при неоднозначном evidence;
5. отсутствие обязательного AI/network path;
6. commit через существующие semantic commands и полноценный Undo/Redo;
7. M7.8B как последний принятый recognition milestone до нового product-owner acceptance.

После design approval следующий implementation PR должен пройти TDD RED→GREEN, unit/property tests для transform/raster/snap boundaries, Chromium/WebKit interaction evidence и небольшой повторный owner retest на исходном плане. Только после этого Assisted Tracing можно считать принятым slice.

<!-- case-study:related -->
## Связанные материалы

- [AI proposal против deterministic authority →](../notes/probabilistic-proposals-deterministic-authority.md)
- [Почему green CI не означает verified product →](../notes/green-ci-is-not-product-verification.md)
- [Все проекты →](../projects.md)
- [Исходный код ↗](https://github.com/True-Ruslan/vlezet)

<!-- case-study:retrospective -->
## Что бы я сделал иначе

Я бы раньше записал `VlezetDocument` и миллиметры как формальный authority contract. После этого многие решения становятся проще: Canvas — проекция, комнаты — derivation, 3D — read-only, Preview — ephemeral, Apply — semantic command.

Recognition benchmark стоило построить до первого quality tuning. Но M7.8B и последующие эксперименты добавили ещё одно правило: public benchmark, representative product-owner source и immutable safety gates должны оставаться разными обязательными доказательствами.

Failed automatic M7.8C usefulness gate добавил важное продолжение: если модель решения остаётся неудобной для пользователя, нельзя бесконечно лечить её новыми heuristics только ради метрик. Иногда правильный следующий шаг — изменить interaction model и отдать intent пользователю, сохранив автоматике лишь bounded assistance.

Также следовало сразу разделить пять проверок:

1. provider вернул ответ;
2. ответ прошёл protocol validation;
3. proposal ссылается на допустимую local evidence;
4. candidate прошёл deterministic domain validation;
5. геометрия похожа на источник и принята человеком.

Uncertainty нужно проектировать как часть продукта. Пользователю полезнее увидеть среднюю уверенность, неизвестную стену-хозяина и возможность исправить preview, чем получить чистую картинку, которая молча врёт о квартире.
