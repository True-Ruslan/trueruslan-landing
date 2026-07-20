# TaskHub — Backend + AI case study

TaskHub — полнофункциональная система управления задачами с backend API, web-интерфейсом и AI-генерацией технических задач через OpenRouter.

## Контекст

Проект интересен не отдельным CRUD, а сочетанием нескольких типичных backend-задач в одном небольшом продукте: прикладная модель задач, REST API, безопасность, миграции, инфраструктурные сервисы, наблюдаемость и внешний AI-провайдер.

**Стек:** Java 21 · Spring Boot 3 · Spring Security · PostgreSQL · Liquibase · Redis · Kafka · ClickHouse · Docker Compose · OpenAPI

## Архитектурный контур

```text
Web UI
  │
  ▼
REST API / Spring Boot
  ├── Task CRUD & business logic
  ├── AI generation → OpenRouter
  ├── Persistence → PostgreSQL / Liquibase
  ├── Cache & sessions → Redis
  ├── Messaging → Kafka
  └── Analytics storage → ClickHouse

Operations
  ├── Spring Actuator / health checks
  ├── OpenAPI / Swagger
  └── Docker Compose
```

## Что реализовано

- CRUD API для задач;
- отдельный endpoint генерации технических задач через AI;
- health endpoint для проверки AI-интеграции;
- Spring Security;
- PostgreSQL и Liquibase для схемы/миграций;
- Redis, Kafka и ClickHouse в инфраструктурном контуре;
- OpenAPI/Swagger документация;
- Spring Actuator и health checks;
- Docker Compose окружение;
- отдельный frontend.

## Инженерные решения

### AI как отдельная интеграция

AI-функция вынесена в отдельный API-сценарий, а доступ к OpenRouter задаётся через конфигурацию/переменную окружения. Это сохраняет обычное управление задачами независимым от доступности внешней модели.

### Инфраструктура воспроизводима локально

PostgreSQL, Redis, Kafka, ClickHouse и вспомогательные UI запускаются через Docker Compose. Такой подход делает архитектуру видимой и воспроизводимой, а не оставляет внешние зависимости только в документации.

### Эксплуатационные интерфейсы входят в продукт

Swagger/OpenAPI и Actuator рассматриваются как часть приложения: API можно исследовать, а состояние сервиса — проверять отдельно от пользовательского интерфейса.

## Проверяемость

Репозиторий содержит Maven-тесты и отдельные health endpoints. Базовый release-контур проекта включает сборку/тестирование и публикацию Docker-образов через GitHub Actions.

## Статус

MVP основного функционала завершён; проект развивается дальше как инженерный sandbox для backend, инфраструктуры и AI-интеграций.

## Ссылки

- [Backend repository ↗](https://github.com/True-Ruslan/TaskHub-backend)
- [Frontend repository ↗](https://github.com/True-Ruslan/taskhub-frontend)
- [Вернуться к проектам](../projects.md)
