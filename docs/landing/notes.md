# Engineering Notes

Здесь я складываю мысли, которые появились после конкретной работы над проектами и которые не хочется терять после того, как задача уже закрыта.

Обычно такая заметка начинается с довольно практичной вещи: что-то оказалось медленным, хрупким, слишком связанным или просто устроенным не так, как я ожидал. Потом приходится разбираться, менять решение и уже задним числом становится понятно, какой вывод из этого стоит сохранить отдельно.

[Подписаться на Atom feed →](../feed.xml)

## Runtime и производительность

### Почему я отделил landing page от Diplodoc runtime

Сначала весь сайт жил внутри одного Diplodoc runtime. Когда главная стала слишком тяжёлой для своей простой задачи, я попробовал оптимизировать существующую схему, а в итоге пришёл к более простому решению — вообще убрать ненужный runtime с первого экрана.

[Читать заметку →](notes/portfolio-runtime-boundary.md)

---

## Надёжность и проверки

### Quality gates для статического инженерного сайта

Эта заметка выросла из нескольких реальных регрессий сайта: сломанного PDF, проблем с search assets, hydration и visual baseline. Постепенно вокруг обычной статической сборки появился набор проверок от unit tests до production smoke.

[Читать заметку →](notes/static-site-quality-gates.md)

### Как IntersectionObserver спрятал огромную таблицу

Обычная reveal-анимация с `threshold: 0.08` неожиданно сделала гигантскую bibliography table невидимой в нормальном viewport. Разбираю, почему высокий элемент сломал привычное предположение про intersection ratio, как fullscreen маскировал симптом и зачем после локального фикса всё равно понадобилась более сильная data model.

[Читать заметку →](notes/intersection-observer-giant-table.md)

### Почему green CI не означает verified product

Зелёный pipeline — сильный сигнал, но только в границах того, что он реально проверяет. Здесь я разбираю, почему Project Evidence Layer получил bounded scope, состояния `verified / stale / unverified` и отдельное различие между automated и manual proof.

[Читать заметку →](notes/green-ci-is-not-product-verification.md)

### От source tests к installed acceptance: что доказывает каждый release gate

На примере VillAIgence разбираю отдельные уровни release evidence: source contracts, remapped package и embedded identity, GameTests, exact production-JAR startup/restart, rollback и ручную cumulative acceptance. Главный вопрос здесь не «сколько jobs зелёные», а какой конкретный runtime fact доказывает каждый gate.

[Читать заметку →](notes/source-tests-to-installed-acceptance.md)

---

## Static-first и доставка контента

### Почему build-time data недостаточно без no-JS representation

Во время migration Sources Registry оказалось, что данные могут присутствовать в generated artifact и при этом оставаться недоступными пользователю без JavaScript. Эта заметка — про Diplodoc hydration state, semantic `<noscript>` fallback и более строгий смысл static-first architecture.

[Читать заметку →](notes/static-first-sources-no-js.md)

---

## AI systems

### Проектирование server-authoritative AI NPC pipeline

LivingWorld довольно быстро показал мне, что «подключить LLM к NPC» и «сделать AI-персонажа частью многопользовательской игры» — совсем разные задачи. Здесь я собрал основные границы, которые в итоге появились вокруг сессий, голоса, памяти, cancellation и действий модели.

[Читать заметку →](notes/server-authoritative-ai-npcs.md)

### Почему успешный ответ LLM ещё не означает успешный контракт

HTTP 200 или успешный вызов provider ещё не означает, что модель вернула допустимое решение для приложения. Здесь я разбираю strict structured output как внешний protocol boundary: trailing tokens, неверные типы, `null`, coercion, schema validation и bounded fallback.

[Читать заметку →](notes/llm-output-is-a-protocol-boundary.md)

### AI может предложить, но не применить: как строить deterministic authority

На примерах Vlezet и VillAIgence разбираю следующий слой после protocol validation: immutable candidate identity, server-side target resolution, current-state revalidation и explicit Apply. Правдоподобный proposal остаётся evidence до тех пор, пока детерминированная product boundary не разрешит одну атомарную mutation.

[Читать заметку →](notes/probabilistic-proposals-deterministic-authority.md)

---

{% note info %}

Это не попытка написать универсальный учебник по архитектуре. Я описываю решения, к которым пришёл в конкретных проектах, и отдельно стараюсь не смешивать то, что реально проверено кодом и CI, с более общими выводами.

{% endnote %}
