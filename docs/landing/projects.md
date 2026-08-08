# Проекты

Я держу здесь проекты, по которым самому проще всего объяснить, чем мне интересно заниматься в разработке.

Часть из них начиналась как обычный PET-проект, часть выросла из желания проверить конкретную архитектурную идею, а часть просто дала повод разобраться с областью, в которую раньше почти не заходил. Поэтому рядом здесь оказываются backend, AI, Minecraft, native macOS и сама платформа этого портфолио.

## Над чем я сейчас работаю серьёзнее всего

### VillAIgence

Это мой проект про AI-жителей и устойчивое общество NPC внутри Minecraft.

VillAIgence начался с идеи разговаривать с MCA-жителями текстом и голосом, но постепенно стал системой про server authority, долговременную идентичность, episodic и semantic Memory 2.0, отношения, операторский lore и безопасную границу между предложением модели и действием в мире.

Сейчас для меня особенно важен release-процесс: source CI, exact-JAR, installed startup, focused gameplay, restart и persistent-state gates отвечают на разные вопросы и не подменяют друг друга.

**Текущий статус:** <span data-tr-project-status="livingworld"></span>

[Подробнее о проекте →](projects/livingworld.md) · [GitHub ↗](https://github.com/True-Ruslan/villAIgence)

---

### NotchHub

Это нативный local-first productivity hub для macOS, построенный вокруг аппаратной челки MacBook.

У проекта уже принята основа `0.1.0 — Personal build`: Swift 6, SwiftUI + AppKit, App Sandbox, Hardened Runtime, измеряемая performance baseline и безопасная модель личных релизов без обязательной платной notarization. При этом текущий M1 interaction slice сознательно не выдаётся за готовый: delayed hover, haptic и deterministic panel transitions остаются в Draft PR #10 до полного CI и real-hardware acceptance.

Мне здесь особенно интересна комбинация трёх требований, которые обычно начинают конфликтовать при росте desktop-приложения: приятное системное взаимодействие, минимальный ресурсный профиль и узкий security/privacy surface.

**Текущий статус:** <span data-tr-project-status="notchhub"></span>

[Подробнее о проекте →](projects/notchhub.md) · [GitHub ↗](https://github.com/True-Ruslan/notch-hub)

---

### TrueRuslan Landing

Это production-платформа самого портфолио и knowledge layer, который вы сейчас читаете.

Здесь мне интересна не только публикация Markdown. Проект соединяет standalone homepage, Diplodoc, canonical registries, RU/EN, generated search, Project Evidence, Notes, Publications, Sources, repository-native clean URLs и несколько независимых release gates — от unit contracts и generated artifact до GitHub Pages deployment и Production Live Smoke.

Отдельная инженерная задача — не смешивать уровни доказательств. Зелёный pull request не означает, что тот же SHA уже опубликован; успешный deployment не доказывает browser behavior; live smoke не подтверждает рост аудитории или мгновенную переиндексацию.

**Текущий статус:** <span data-tr-project-status="portfolio-platform"></span>

[Подробнее о платформе →](projects/portfolio-platform.md) · [GitHub ↗](https://github.com/True-Ruslan/trueruslan-landing)

---

### NODE ZERO

Это мой техно-хоррор о предсказании поведения человека.

NODE ZERO — current game project on Unity: first-person psychological techno-horror в автономном подземном AI compute facility. Мне интереснее всего не horror как набор скримеров, а система MIRROR, которая предсказывает поведение человека и постепенно меняет доступную среду так, чтобы прогноз становился всё более вероятным.

**Текущий статус:** <span data-tr-project-status="node-zero"></span>

Сейчас scope намеренно небольшой: сначала нужно доказать цельный vertical slice и основной игровой цикл, а уже потом расширять объект и набор систем.

[Подробнее о проекте →](projects/node-zero.md)

> Репозиторий NODE ZERO закрытый и proprietary. На сайте я оставляю только то, что можно спокойно показывать публично: идею, устройство проекта на высоком уровне и принятые инженерные решения.

---

## Другие проекты, к которым я возвращаюсь

### TaskHub

Backend-проект, в котором я соединяю обычную систему управления задачами с инфраструктурой и AI-интеграцией.

В проекте есть Java 21 / Spring Boot, PostgreSQL и Liquibase, Redis, Kafka, ClickHouse, Docker Compose, OpenAPI и отдельная AI-интеграция через OpenRouter. Мне здесь был важен не столько сам task manager, сколько возможность пройти весь путь целиком: от доменной модели и API до инфраструктуры, наблюдаемости и воспроизводимого локального запуска.

[Подробнее →](projects/taskhub.md) · [Backend GitHub ↗](https://github.com/True-Ruslan/TaskHub-backend)

---

### MiniChess

Небольшой шахматный web-проект на Java 21 / Spring Boot, где почти вся сложность находится не в инфраструктуре, а в доменной логике: допустимые ходы, очередность, шах, состояние доски и серверная проверка действий пользователя.

[Подробнее →](projects/minichess.md) · [GitHub ↗](https://github.com/True-Ruslan/MiniChess)

---

### Godot Atmospheric Horror Template

Основа для коротких атмосферных игр на Godot с first-person controller, interaction system, objectives, scripted events и документационным слоем. Проект также используется как эксперимент по длинной работе над game project вместе с AI-агентами без потери контекста между итерациями.

[Подробнее →](projects/godot-horror-template.md) · [GitHub ↗](https://github.com/True-Ruslan/godot-simple-tamplate)

---

### Vlezet

Экспериментальный local-first конструктор планировок с миллиметровой геометрией и исследованиями CV/LLM-assisted recognition. Проект остаётся публичным и его case study сохраняется как инженерная история, но сейчас я сознательно не держу его в основном spotlight портфолио.

[Открыть case study →](projects/vlezet.md) · [GitHub ↗](https://github.com/True-Ruslan/vlezet)

---

## Коммерческая работа

### MarketDB

[marketdb.pro ↗](https://marketdb.pro)

MarketDB — коммерческий production-проект в области аналитики маркетплейсов, с которым связана значительная часть моего backend-опыта.

**Стек:** Java 17–21 · Spring Boot · PostgreSQL · ClickHouse · Yandex Data Streams

**Результат:** платформа используется 100+ селлерами.

Здесь я работал с backend-разработкой, данными, интеграциями, надёжностью сервисов и развитием уже живой production-системы. Подробную внутреннюю архитектуру и коммерческие детали я сознательно не публикую.

---

## Что я обычно ищу в своих проектах

Если посмотреть на них вместе, у них мало общего по предметной области, но довольно много общего по тому, что мне хочется проверить самому.

Мне интересны проекты, где после первого работающего прототипа остаются вопросы: как система переживёт ошибку, где хранится состояние, что можно безопасно автоматизировать, как выпускать изменения, как не потерять архитектуру через десятки итераций.

Поэтому я довольно часто продолжаю развивать проект уже после момента, когда он формально «заработал». Именно после этого обычно и начинается самая полезная для меня часть.

{% note tip %}

Исходный код публичных проектов лежит в [GitHub](https://github.com/True-Ruslan). Если хочется обсудить конкретный проект или решение, проще всего написать через раздел [Контакты](contacts.md).

{% endnote %}
