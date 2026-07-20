# Godot Atmospheric Horror Template — Agentic game-dev case study

Godot Atmospheric Horror Template — стартовый скелет короткой атмосферной horror-игры на Godot 4.7+, рассчитанный и на обычную разработку, и на последовательную работу с AI-агентами.

## Контекст

Цель проекта — не собрать «ещё один демо-уровень», а сделать расширяемую основу для коротких психологических horror/walking-simulator игр: игрок, взаимодействия, двери, записки, свет, задачи, scripted events и понятный путь дальнейшей разработки.

## Архитектурный контур

```text
Main / TemplateLevel
  ├── Player
  │   ├── first-person movement
  │   ├── mouse look
  │   └── flashlight
  ├── Interaction
  │   └── raycast / interactables
  ├── Objects
  │   ├── doors
  │   ├── notes
  │   └── light switch
  ├── Core
  │   ├── objectives
  │   └── horror event manager
  └── UI
      └── HUD / prompts / messages

Documentation layer
  ├── AGENTS.md
  ├── CONTEXT / TASKS / DECISIONS
  ├── DESIGN / EXPORT guides
  └── credits & licensing checklist
```

## Что реализовано

- first-person controller;
- mouse look;
- ходьба, бег и приседание;
- фонарик с зарядом;
- interaction raycast;
- интерактивные двери, записки и выключатель света;
- objective system;
- horror event manager;
- HUD с подсказками, задачами и сообщениями;
- запускаемая demo-room;
- минимальный playable flow: дверь → подсказка → записка → scripted event → финальное открытие двери.

## Инженерные решения

### Документация рассматривается как часть архитектуры

Для человека и AI-агента есть отдельные точки входа: `START_HERE`, индекс документации, контекст, задачи, решения, changelog, design/export guides и prompts. Это уменьшает зависимость от «памяти текущего чата» и позволяет продолжать разработку после смены исполнителя.

### Итерация должна оставлять игру запускаемой

Основное правило agentic workflow: не генерировать проект целиком одним большим изменением. Каждая итерация должна добавлять ограниченный кусок функциональности и оставлять рабочее состояние, которое можно запустить и проверить.

### Лицензирование ассетов не откладывается на финал

В структуру проекта заранее включены credits и licensing checklist. Это важно для игровых проектов, где сторонние модели, текстуры, звуки и шейдеры быстро превращаются в юридический долг.

## Почему проект показателен

Здесь интересен не только GDScript/gameplay, а организация разработки: код, сцены, документация, UX демо-цикла, воспроизводимый контекст и правила для AI-assisted development работают как единая система.

## Ссылки

- [Repository ↗](https://github.com/True-Ruslan/godot-simple-tamplate)
- [Вернуться к проектам](../projects.md)
