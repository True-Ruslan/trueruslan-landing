# Проекты

Не просто список репозиториев, а проекты, на которых можно увидеть мой подход к backend-разработке, архитектуре, инфраструктуре и экспериментам с AI и game development.

## Production

### MarketDB — аналитика маркетплейсов

[marketdb.pro](https://marketdb.pro)

Сервис аналитики маркетплейсов и коммерческий production-проект, в котором backend должен работать с большим объёмом прикладных данных, интеграциями и аналитическими сценариями.

**Стек:** Java 17–21 · Spring Boot · PostgreSQL · ClickHouse · Yandex Data Streams

**Результат:** платформа используется 100+ селлерами.

**Инженерный фокус:** backend-разработка, работа с данными, интеграции, надёжность сервисов и развитие production-системы.

---

## Backend + AI

### TaskHub — task management с AI-интеграцией

Полнофункциональная система управления задачами с backend API, web-интерфейсом и генерацией технических задач через OpenRouter AI.

**Стек:** Java 21 · Spring Boot 3 · Spring Security · PostgreSQL · Liquibase · Redis · Kafka · ClickHouse · Docker Compose · OpenAPI

**Что реализовано:**

- CRUD и REST API для задач;
- AI-генерация технических задач;
- Swagger/OpenAPI документация;
- health checks и Spring Actuator;
- контейнеризированная инфраструктура;
- отдельный frontend.

[Backend на GitHub ↗](https://github.com/True-Ruslan/TaskHub-backend) · [Frontend на GitHub ↗](https://github.com/True-Ruslan/taskhub-frontend)

---

## Java / Domain Logic

### MiniChess — шахматы на Spring Boot

Веб-приложение для полноценной игры в шахматы с серверной игровой логикой и browser UI.

**Стек:** Java 21 · Spring Boot 3 · Spring Web · Thymeleaf · JavaScript

**Что интересно технически:**

- валидация допустимости ходов;
- контроль очередности;
- определение шаха и атак на короля;
- REST API состояния доски и ходов;
- история партии;
- автоматизированные тесты игровой логики и контроллеров.

[Репозиторий на GitHub ↗](https://github.com/True-Ruslan/MiniChess)

---

## Game Development / Agentic Workflow

### Godot Atmospheric Horror Template

Шаблон короткой атмосферной horror-игры на Godot 4.7+, рассчитанный одновременно на обычную разработку и итерационную работу с AI-агентами.

**Что уже есть:** first-person controller, mouse look, бег и приседание, фонарик, interaction raycast, двери, записки, выключатели, objective system, scripted horror events и playable demo flow.

Отдельный фокус проекта — **документация как часть архитектуры**: контекст, задачи, решения, дизайн-гайд, credits/licensing и инструкции позволяют человеку или AI-агенту продолжать разработку без потери состояния проекта.

[Репозиторий на GitHub ↗](https://github.com/True-Ruslan/godot-simple-tamplate)

---

## Что объединяет эти проекты

Мне интересны проекты, где требуется не просто «написать код», а выстроить систему: определить границы ответственности, сделать поведение проверяемым, сохранить понятный путь развития и автоматизировать рутину там, где это действительно даёт пользу.

{% note tip %}

Исходный код публичных проектов доступен в [GitHub](https://github.com/True-Ruslan). Для связи — раздел [Контакты](contacts.md).

{% endnote %}
