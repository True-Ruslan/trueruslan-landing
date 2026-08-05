# Vlezet — точная планировка квартиры без CAD

**Vlezet** — local-first конструктор планировок, в котором реальную квартиру можно собрать из стен, проёмов и мебели, проверить размеры и площади, посмотреть схему в 3D и использовать распознавание плана как редактируемую помощь, а не как источник истины.

**Текущий статус:** <span data-tr-project-status="vlezet"></span>

[Репозиторий на GitHub ↗](https://github.com/True-Ruslan/vlezet)

![Граница между распознаванием и авторитетной геометрией Vlezet](../../assets/diagrams/vlezet-recognition-authority.svg)

<div data-tr-project-timeline="vlezet"></div>

<!-- case-study:problem -->
## Проблема: план квартиры должен оставаться точным после первого впечатления

Первый прототип планировщика сделать сравнительно легко: дать пользователю нарисовать прямоугольник, поставить диван и показать примерную площадь.

Реальная квартира разрушает такую упрощённую модель. У стены есть ось и толщина. У проёма — ширина, положение на конкретной стене и направление открывания. Комната появляется не потому, что пользователь нарисовал цветной полигон, а потому, что стены действительно образовали замкнутую топологию. Мебель может визуально помещаться и одновременно перекрывать дверь или оставлять непроходимый зазор.

Импорт фотографии или PDF добавляет неопределённость: поворот, поля, перспектива, подписи, размерные линии, сантехника, мебель и дверные дуги. Даже корректный JSON от LLM не означает, что восстановленные стены совпадают с реальным планом.

Поэтому Vlezet — задача не про «красиво нарисовать квартиру», а про сохранение геометрической истины на всём пути: от исходного изображения до площади комнаты, расстановки мебели и 3D-проекции.

Главный принцип:

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

### AI не создаёт недостающую геометрию

Cloud review получает exact local IDs и координаты. Он может подтвердить или отклонить существующего кандидата и скорректировать confidence evidence, но не имеет права добавить новую стену, переместить линию, изменить толщину или назначить другого host wall.

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

Текущий development slice — **M7.8C Opening Classification and Host-Wall Validation**, но он остаётся Draft. PR #42 открыт на observed head `c49921d83e8c2ab7e7729a1cc5fe958930f3ee0a`. CI #3138, Recognition Benchmark #316 и M7 Browser Audit #769 проходят для этого exact head. Эти automated gates не заменяют тот же real-plan product-owner retest, поэтому M7.8C не считается принятым или смерженным.

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
4. при необходимости cloud review проверяет только существующие IDs;
5. пользователь сравнивает Draft с источником;
6. deterministic validation отбрасывает недопустимые связи;
7. только Apply переводит принятые candidates в ordinary document entities.

### Сначала benchmark, потом tuning

M7.8A добавил versioned public-safe corpus, Core и Source execution, TP/FP/FN overlays и метрики для геометрии стен, топологии, проёмов, комнат, площадей, confidence и reconciliation.

Benchmark не заменяет product-owner source. Он делает изменение воспроизводимым, но отдельный реальный план проверяет, не научилась ли система проходить fixtures, сохранив неправильное поведение на настоящем документе.

### Region-first extraction вместо line-first шума

M7.8B перевёл локальное распознавание к region-first обработке толстых архитектурных областей. Canny/Hough остался bounded fallback, а не главным владельцем результата.

Candidate overload завершается fail-closed: перегруженный Draft не сохраняется, не отправляется в AI и не получает право на Apply.

## Реальные ошибки, которые изменили архитектуру

### Лупа и калибровка смотрели не в ту систему координат

На широком изображении Canvas содержал letterbox-поля. Курсор, magnifier, маркеры и calibration line вычислялись относительно всей stage, а не фактически отрисованного image rectangle. Исправление потребовало единого преобразования через rendered image bounds и запрета принимать клики по полям.

### Направление A → B не должно было переворачивать план

Для горизонтальной или вертикальной calibration line важна ось, а не порядок концов. Калибровка стала undirected axis, поэтому обратный выбор точек больше не поворачивает сохранённый план примерно на 180°.

### OpenCV возвращал больше линий, чем читала программа

`HoughLinesP` в OpenCV.js отдаёт координаты плоскими группами `x1, y1, x2, y2` в `data32S`. Предыдущая итерация по `lines.rows` забирала лишь часть результата. Исправление показало следующую проблему: полный raster содержит не только стены.

### Первый real-plan review выявил symbol network вместо shell

Ранняя M7.8B-реализация сформировала 417 local wall candidates, ноль проёмов и связанную сеть символов, мебели и подписей. AI review сохранил загрязнённую сеть и добавил неподтверждённые длинные линии.

Corrective iteration добавил region-first structural mask, bounded fallback, candidate budget, sanitization Draft и запрет cloud-only geometry.

### Валидный AI-ответ может быть пространственно неправильным

Response healing и JSON Schema исправляют protocol defects. Они не доказывают, что стена находится там же, где на изображении. Unknown IDs, moved coordinates, cloud-only walls, unbounded lines и overloaded responses отклоняются до product state.

### Проём нельзя принимать без стены-хозяина

Gap в линии может быть дверью, окном, текстом или артефактом edge detection. M7.8B намеренно оставил openings равными нулю вместо уверенного проёма без verified host wall. M7.8C строится вокруг mandatory host-wall validation.

<!-- case-study:alternatives -->
## Рассмотренные и отвергнутые альтернативы

### Canvas-пиксели как persistent coordinates

Отвергнуты. Пиксели меняются вместе с zoom, viewport и устройством. Миллиметры остаются единственной canonical geometry.

### Прямой overwrite документа результатом распознавания

Отвергнут. Recognition Draft не может очищать или заменять существующий `VlezetDocument`; только явный Apply создаёт semantic command.

### Cloud-модель, создающая или перемещающая геометрию

Отвергнута. AI проверяет immutable local candidates и не получает права создавать missing walls, менять coordinates, thickness или host relations.

### Line-first Hough как основной владелец результата

Отвергнут. Такой подход смешивает стены, мебель, сантехнику, подписи и размерные линии. Region-first structural extraction лучше соответствует архитектурной геометрии, а Hough остаётся bounded supplemental evidence.

### Отдельная authoritative 3D-модель

Отвергнута. Второй geometry store создавал бы drift. 3D остаётся read-only projection общего документа.

### Snapshot-only Undo/Redo

Отвергнуто. Snapshot history скрывает смысл Apply и усложняет повторное принятие candidates. Semantic commands сохраняют atomic boundaries и объяснимость.

<!-- case-study:evidence -->
## Что подтверждено

<div data-tr-project-evidence="vlezet"></div>

Evidence разделяет:

- accepted product workflow и deterministic geometry contracts;
- M7.8A reproducible benchmark authority;
- M7.8B product-owner acceptance с точными метриками и ограничениями;
- M7.8C PR #42 как pending Draft с зелёными automated gates и обязательным owner retest.

Статус `verified` относится только к перечисленным scopes. Он не означает, что Vlezet распознаёт произвольный архитектурный план без ручной проверки или что M7.8C принят.

<!-- case-study:limitations -->
## Известные ограничения

- некоторые внешние или основные стены всё ещё могут быть пропущены либо фрагментированы;
- на текущем real-plan retest одна толстая несущая стена представлялась двумя параллельными axes;
- видимые окна могли отсутствовать в Draft;
- короткие линии сантехники или service block могли попадать в structural candidates;
- confidence classification не идеальна;
- accepted M7.8B Source topology F1 `0.837989` ниже финальной цели M7.8 `0.90`;
- M7.8C automated Source wall topology F1 выше `0.90`, но это не заменяет owner acceptance на том же реальном плане;
- perspective-photo recognition не решён;
- stronger providers могут подтвердить больше существующих candidates, но не создают missing geometry;
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

Только после явной acceptance либо конкретного defect report можно исправить ограниченный scope, повторить exact-head automation и рассматривать squash merge M7.8C. Затем допустим следующий этап: room faces, labels, areas и bounded semantic reconciliation.

<!-- case-study:related -->
## Связанные материалы

- [AI proposal против deterministic authority →](../notes/probabilistic-proposals-deterministic-authority.md)
- [Почему green CI не означает verified product →](../notes/green-ci-is-not-product-verification.md)
- [Все проекты →](../projects.md)
- [Исходный код ↗](https://github.com/True-Ruslan/vlezet)

<!-- case-study:retrospective -->
## Что бы я сделал иначе

Я бы раньше записал `VlezetDocument` и миллиметры как формальный authority contract. После этого многие решения становятся проще: Canvas — проекция, комнаты — derivation, 3D — read-only, Preview — ephemeral, Apply — semantic command.

Recognition benchmark стоило построить до первого quality tuning. Но M7.8B добавил ещё одно правило: public benchmark и representative product-owner source должны оставаться разными обязательными gates.

Также следовало сразу разделить четыре проверки:

1. provider вернул ответ;
2. ответ прошёл protocol validation;
3. candidates прошли deterministic domain validation;
4. геометрия похожа на источник и принята человеком.

Uncertainty нужно проектировать как часть продукта. Пользователю полезнее увидеть среднюю уверенность, неизвестную стену-хозяина и возможность исправить Draft, чем получить чистую картинку, которая молча врёт о квартире.
