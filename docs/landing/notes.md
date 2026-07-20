# Engineering Notes

Короткие технические разборы решений, которые возникли не из абстрактного интереса к паттернам, а из реальной разработки проектов: архитектура портфолио, AI NPC systems, quality gates, game systems и backend-интеграции.

Это не полноценный блог и не поток новостей. Здесь я фиксирую **почему было принято решение, какие альтернативы рассматривались, где проходит граница применимости и чем решение проверяется**.

## Architecture / Delivery

### Почему главная портфолио — standalone, а knowledge pages остаются на Diplodoc

Как performance-проблема и React hydration mismatch привели не к очередному workaround, а к разделению архитектуры на lightweight landing и documentation/knowledge layer.

[Читать заметку →](notes/portfolio-architecture.md)

---

## AI Systems

### Как проектировать bounded AI-разговоры NPC, а не просто подключить LLM

Server authority, session ownership, untrusted model output, trusted knowledge, memory provenance, resource limits и verification boundaries на примере LivingWorld.

[Читать заметку →](notes/bounded-ai-npc-conversations.md)

---

## Принцип заметок

Хорошая техническая заметка для меня должна отвечать минимум на четыре вопроса:

1. Какую реальную проблему решали?
2. Почему очевидное решение оказалось недостаточным?
3. Где проходит новая архитектурная граница?
4. Какими тестами или evidence мы подтверждаем, что решение действительно работает?

Новые материалы будут появляться по мере того, как проекты доходят до решений, которые стоит зафиксировать отдельно от README и implementation docs.

{% note tip %}

Связанные реализации — в разделе [Проекты](projects.md). Список внешних материалов, которые я изучаю, — в [Источниках](bibliography.md).

{% endnote %}
