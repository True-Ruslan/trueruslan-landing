# Vlezet — точная планировка квартиры без CAD

**Vlezet** — local-first конструктор планировок, в котором реальную квартиру можно собрать из стен, проёмов и мебели, проверить размеры и площади, посмотреть схему в 3D и использовать распознавание плана как редактируемую помощь, а не как источник истины.

**Текущий статус:** <span data-tr-project-status="vlezet"></span>

[Репозиторий на GitHub ↗](https://github.com/True-Ruslan/vlezet)

![Граница между распознаванием и авторитетной геометрией Vlezet](../../assets/diagrams/vlezet-recognition-authority.svg)

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

Принятый M7.8B ограничивал cloud review точными local IDs. Более поздний Draft PR #45 исследует missing-opening recovery, но только как отдельные proposals. Каждый proposal обязан пройти deterministic host, raster, topology и overlap validation, остаться reviewable и попасть в документ только через explicit Apply.

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

M7.8B принят с известными ограничениями. На representative source система вернула 27 local wall candidates, 19 AI-confirmed и 8 pending review. Принятые Source geometry F1 и Source topology F1 составили `0.837989`. Openings были намеренно отложены.

Текущая acceptance boundary — **M7.8C Opening Classification and Host-Wall Validation**. PR #42 открыт как Draft на observed head `c49921d83e8c2ab7e7729a1cc5fe958930f3ee0a`. CI #3138, Recognition Benchmark #316 и M7 Browser Audit #769 проходят, но тот же representative real-plan product-owner retest остаётся обязательным.

Параллельная разработка ведётся только как stacked Draft evidence:

- PR #44 на observed head `cd29740cf240d591785fc6607147d2bf07ece0b6` создаёт M7.9 real-fixture benchmark. Standard CI проходит, но real wall geometry F1 `0.827338` и real opening F1 `0.627451` остаются ниже immutable merge threshold `0.85`;
- PR #45 на observed head `2c4d0f44e56753b9c44dd6c30a720d1a97f50c2e` исследует M7.8C.1 hybrid AI proposal recovery поверх PR #44. AI может вернуть отдельное предложение, но не получает права создавать authoritative geometry без deterministic validation, review и Apply.

PR #42, PR #44 и PR #45 не считаются принятыми или смерженными. Они не повышают lifecycle и не заменяют acceptance M7.8B.

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

Распознавание разделено на этапы:

1. пользователь загружает JPG, PNG или PDF;
2. изображение калибруется по реальному размеру;
3. local CV создаёт bounded candidates;
4. optional AI возвращает verification или отдельные proposals в пределах разрешённого Draft-контракта;
5. каждый proposal повторно проверяется deterministic domain rules;
6. пользователь сравнивает Draft с источником;
7. только Apply переводит принятые candidates в ordinary document entities.

### Сначала benchmark, потом tuning

M7.8A добавил versioned public-safe corpus, Core и Source execution, TP/FP/FN overlays и метрики для геометрии стен, топологии, проёмов, комнат, площадей, confidence и reconciliation.

PR #44 расширяет эту идею до repository-owned analogues реальных планов, но не меняет threshold ради зелёного CI. Wall и opening F1 ниже `0.85` остаются явным merge blocker, а incorrect-high-confidence, unknown-host и stale-decision counters должны оставаться нулевыми.

### Region-first extraction вместо line-first шума

M7.8B перевёл локальное распознавание к region-first обработке толстых архитектурных областей. Canny/Hough остался bounded fallback, а не главным владельцем результата.

Candidate overload завершается fail-closed: перегруженный Draft не сохраняется, не отправляется в AI и не получает право на Apply.

### Hybrid AI восстанавливает только ограниченные proposals

PR #45 разделяет local geometry и AI recovery. Missing doors/windows могут появиться только как proposal records с host evidence. Local walls остаются immutable, AI не перемещает и не удаляет их, а thin-wall recovery вынесен в отдельный будущий stage.

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

Gap в линии может быть дверью, окном, текстом или артефактом edge detection. M7.8B намеренно оставил openings равными нулю вместо уверенного проёма без verified host wall. M7.8C и hybrid proposals строятся вокруг mandatory host-wall validation.

<!-- case-study:alternatives -->
## Рассмотренные и отвергнутые альтернативы

### Canvas-пиксели как persistent coordinates

Отвергнуты. Пиксели меняются вместе с zoom, viewport и устройством. Миллиметры остаются единственной canonical geometry.

### Прямой overwrite документа результатом распознавания

Отвергнут. Recognition Draft не может очищать или заменять существующий `VlezetDocument`; только явный Apply создаёт semantic command.

### Cloud-модель как второй владелец геометрии

Отвергнута. Даже когда AI разрешено предложить missing opening, proposal остаётся отдельным evidence object и проходит ту же deterministic validation. Модель не получает права молча двигать стены, менять thickness, re-host openings или применять результат.

### Line-first Hough как основной владелец результата

Отвергнут. Такой подход смешивает стены, мебель, сантехнику, подписи и размерные линии. Region-first structural extraction лучше соответствует архитектурной геометрии, а Hough остаётся bounded supplemental evidence.

### Снижение benchmark threshold ради merge

Отвергнуто. PR #44 сохраняет immutable `0.85` real wall/opening gates и нулевые safety counters. Красный measured result полезнее зелёного пайплайна, который перестал защищать продукт.

### Отдельная authoritative 3D-модель

Отвергнута. Второй geometry store создавал бы drift. 3D остаётся read-only projection общего документа.

<!-- case-study:evidence -->
## Что подтверждено

<div data-tr-project-evidence="vlezet"></div>

Evidence разделяет:

- accepted product workflow и deterministic geometry contracts;
- M7.8A reproducible benchmark authority;
- M7.8B product-owner acceptance с точными метриками и ограничениями;
- M7.8C PR #42 как pending Draft с зелёными automated gates и обязательным owner retest;
- PR #44 как stacked Draft с измеримыми real-fixture blockers;
- PR #45 как stacked Draft hybrid proposal architecture без AI geometry authority.

Статус `verified` относится только к перечисленным scopes. Он не означает, что Vlezet распознаёт произвольный архитектурный план без ручной проверки или что любой Draft slice принят.

<!-- case-study:limitations -->
## Известные ограничения

- некоторые внешние или основные стены всё ещё могут быть пропущены либо фрагментированы;
- на текущем real-plan retest одна толстая несущая стена представлялась двумя параллельными axes;
- видимые окна могли отсутствовать в Draft;
- короткие линии сантехники или service block могли попадать в structural candidates;
- accepted M7.8B Source topology F1 `0.837989` ниже финальной цели M7.8 `0.90`;
- PR #42 automated metrics не заменяют owner acceptance на том же реальном плане;
- PR #44 real wall/opening F1 остаются ниже immutable `0.85` merge threshold;
- PR #45 Stage 1 proposal recovery ещё не имеет самостоятельной product acceptance;
- perspective-photo recognition не решён;
- room-face derivation, OCR labels, area constraints и confidence calibration остаются дальнейшими slices.

<!-- case-study:next -->
## Следующий принятый шаг

Следующий gate — повторный product-owner retest exact head PR #42 на том же реальном плане.

Проверка должна подтвердить:

1. одна centre axis вместо двойной thick-wall geometry;
2. окна в корректных exterior-wall gaps и с известным host wall;
3. отсутствие сантехнических symbol contours среди active walls;
4. неизменность geometry count и coordinates после AI verification;
5. incremental Apply без duplicates;
6. независимый Undo/Redo для нескольких Apply batches.

Только после явной acceptance либо конкретного defect report можно исправить ограниченный scope, повторить exact-head automation и рассматривать squash merge M7.8C. Stacked PR #44 и PR #45 должны затем пройти собственные immutable metrics, safety counters и product-owner gates; их наличие не позволяет обойти acceptance PR #42.

<!-- case-study:related -->
## Связанные материалы

- [AI proposal против deterministic authority →](../notes/probabilistic-proposals-deterministic-authority.md)
- [Почему green CI не означает verified product →](../notes/green-ci-is-not-product-verification.md)
- [Все проекты →](../projects.md)
- [Исходный код ↗](https://github.com/True-Ruslan/vlezet)

<!-- case-study:retrospective -->
## Что бы я сделал иначе

Я бы раньше записал `VlezetDocument` и миллиметры как формальный authority contract. После этого многие решения становятся проще: Canvas — проекция, комнаты — derivation, 3D — read-only, Preview — ephemeral, Apply — semantic command.

Recognition benchmark стоило построить до первого quality tuning. Но M7.8B и последующие Draft-эксперименты добавили ещё одно правило: public benchmark, representative product-owner source и immutable safety gates должны оставаться разными обязательными доказательствами.

Также следовало сразу разделить пять проверок:

1. provider вернул ответ;
2. ответ прошёл protocol validation;
3. proposal ссылается на допустимую local evidence;
4. candidate прошёл deterministic domain validation;
5. геометрия похожа на источник и принята человеком.

Uncertainty нужно проектировать как часть продукта. Пользователю полезнее увидеть среднюю уверенность, неизвестную стену-хозяина и возможность исправить Draft, чем получить чистую картинку, которая молча врёт о квартире.
