# Проекты

Здесь собраны не просто ссылки на репозитории, а проекты, через которые лучше всего видно мой инженерный подход: как я разделяю ответственность компонентов, работаю с доменной логикой, инфраструктурой, AI-интеграциями и воспроизводимым процессом разработки.

## Featured case studies

### TaskHub — Backend + AI

Полнофункциональная система управления задачами: Java 21 / Spring Boot backend, PostgreSQL и Liquibase, Redis, Kafka, ClickHouse, Docker Compose, OpenAPI и отдельная AI-интеграция через OpenRouter.

**Инженерный фокус:** границы backend-компонентов, инфраструктурный контур, внешний AI-провайдер, наблюдаемость и воспроизводимый локальный запуск.

[Читать case study →](projects/taskhub.md) · [Backend GitHub ↗](https://github.com/True-Ruslan/TaskHub-backend)

---

### MiniChess — Java domain logic

Шахматное web-приложение на Java 21 / Spring Boot, где основная сложность находится в правилах: допустимость ходов, очередность, шах, состояние доски и серверная валидация действий пользователя.

**Инженерный фокус:** доменная логика, отделение transport layer от правил игры, REST-контракт и тестируемость.

[Читать case study →](projects/minichess.md) · [GitHub ↗](https://github.com/True-Ruslan/MiniChess)

---

### Godot Atmospheric Horror Template — Agentic game development

Расширяемый шаблон короткой атмосферной horror-игры на Godot 4.7+: first-person controller, interaction system, objectives, scripted events и документационный слой для последовательной работы человека или AI-агента.

**Инженерный фокус:** архитектура игровых систем, итерационный workflow, сохранение контекста между агентами и управление лицензиями ассетов.

[Читать case study →](projects/godot-horror-template.md) · [GitHub ↗](https://github.com/True-Ruslan/godot-simple-tamplate)

---

## Production experience

### MarketDB — аналитика маркетплейсов

[marketdb.pro ↗](https://marketdb.pro)

Коммерческий production-проект в области аналитики маркетплейсов.

**Стек:** Java 17–21 · Spring Boot · PostgreSQL · ClickHouse · Yandex Data Streams

**Результат:** платформа используется 100+ селлерами.

**Инженерный фокус:** backend-разработка, работа с данными, интеграции, надёжность сервисов и развитие production-системы.

В публичном портфолио сознательно не раскрываю внутреннюю архитектуру и детали, которые относятся к коммерческому продукту.

---

## Что объединяет эти проекты

Мне интересны системы, где недостаточно просто «написать код». Важны границы ответственности, источник истины, проверяемость поведения, понятный путь эксплуатации и возможность безопасно продолжать развитие через месяцы после первой реализации.

{% note tip %}

Больше исходного кода — в [GitHub](https://github.com/True-Ruslan). Для технического обсуждения или сотрудничества — раздел [Контакты](contacts.md).

{% endnote %}
