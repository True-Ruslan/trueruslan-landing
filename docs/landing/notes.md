# Engineering Notes

Короткие технические разборы о решениях, которые я реально применяю в проектах: где проходит граница ответственности компонентов, как проверять систему после сборки, как проектировать AI-интеграции и почему иногда архитектурно правильнее разделить runtime, чем бесконечно оптимизировать один слой.

## Runtime & performance

### Почему я отделил landing page от Diplodoc runtime

Как performance-проблема главной страницы привела не к очередному CSS/JS-тюнингу, а к архитектурному разделению: лёгкий standalone presentation layer для первого экрана и Diplodoc как knowledge runtime для внутренних страниц.

[Читать заметку →](notes/portfolio-runtime-boundary.md)

---

## Reliability & quality

### Quality gates для статического инженерного сайта

Статический сайт может быть «зелёным» в сборке и всё равно отдавать 404, сломанный PDF или визуальную регрессию. Разбор pipeline: generated-site integrity → Chromium/Axe/Lighthouse → Firefox/WebKit → search smoke → visual regression → production smoke.

[Читать заметку →](notes/static-site-quality-gates.md)

---

## AI systems

### Проектирование server-authoritative AI NPC pipeline

Почему LLM не должен напрямую управлять игровым миром. Session ownership, text/voice ingress, STT/LLM/TTS orchestration, memory boundaries, cancellation и отдельный authorization layer для действий NPC.

[Читать заметку →](notes/server-authoritative-ai-npcs.md)

---

{% note info %}

Эти материалы отражают мой инженерный подход и опыт конкретных проектов. Где вывод основан на проверенном поведении проекта, это обозначено отдельно от общих архитектурных рекомендаций.

{% endnote %}
