# NotchHub — local-first productivity hub для macOS вокруг челки

**NotchHub** — нативное macOS-приложение, которое превращает область вокруг аппаратной челки MacBook в компактную точку доступа к повседневным инструментам. Базовая идея — постоянно доступный, но лёгкий по ресурсам интерфейс, который остаётся локальным и не требует отдельного облачного backend.

[Репозиторий на GitHub ↗](https://github.com/True-Ruslan/notch-hub)

## Коротко

<dl class="tr-project-glance" data-tr-project-glance="notchhub">
<dt>Моя роль</dt>
<dd>Solo product engineering: native macOS architecture, interaction model, performance, security и release boundary.</dd>
<dt>Стек</dt>
<dd>Swift 6 · SwiftUI · AppKit · macOS · XCTest</dd>
<dt>Задача</dt>
<dd>Превратить область вокруг челки MacBook в полезный always-on интерфейс без тяжёлого runtime и широких разрешений.</dd>
<dt>Результат</dt>
<dd>Принята основа 0.1.0 — Personal build; следующий interaction milestone развивается отдельно и не считается завершённым автоматически.</dd>
<dt>Статус</dt>
<dd><span data-tr-project-status="notchhub"></span></dd>
</dl>

<div data-tr-project-timeline="notchhub"></div>

<!-- case-study:problem -->
## Проблема: полезный always-on интерфейс не должен становиться ещё одним тяжёлым приложением

Область вокруг челки постоянно находится рядом с фокусом пользователя, но сама по себе почти не используется интерфейсом macOS. NotchHub исследует, можно ли превратить её в аккуратный локальный productivity surface — без фонового web runtime, телеметрии и широких системных разрешений.

Запланированные продуктовые модули — **Shelf, Snippets, Calendar, Translator и media controls**, где основным медиаплеером рассматривается **Yandex Music**. Они сознательно идут после базового Notch Core: сначала приложение должно доказать корректную геометрию, поведение панели, безопасность и потребление ресурсов.

<!-- case-study:constraints -->
## Ограничения и продуктовые инварианты

### Native и local-first по умолчанию

Текущая основа написана на **Swift 6**. **SwiftUI** отвечает за композицию, а **AppKit** — за `NSPanel`, геометрию окна, взаимодействие с аппаратной челкой и системные переходы.

Базовая runtime-граница намеренно узкая:

- **App Sandbox** включён;
- **Hardened Runtime** включён без опасных исключений;
- нет сторонних Swift runtime dependencies;
- нет телеметрии, аналитики, рекламы или licensing backend;
- нет прямого runtime network/WebKit surface;
- нет subprocess/shell execution и dynamic plugin loading;
- глобальное наблюдение ввода не расширяется ради удобства UI.

Новая возможность, которая требует более широкого permission или attack surface, должна сначала изменить security contract, тесты и документацию.

### Производительность — часть продукта, а не последующая оптимизация

NotchHub должен быть доступен постоянно, поэтому CPU, RSS, threads, background work и размер артефакта рассматриваются как release requirements.

Принятая P0 baseline для `0.1.0` на целевом MacBook/macOS 26.6:

| Сценарий | CPU median / max | RSS max | Threads max |
|---|---:|---:|---:|
| Idle | `0.0% / 0.7%` | `33,808 KiB` | `4` |
| Hover | `5.95% / 22.3%` | `38,816 KiB` | `7` |
| 10-minute stability | `0.0% / 6.8%` | `34,384 KiB` | `7` |

Во время stability-сценария устойчивого роста памяти не наблюдалось. Shared CI отдельно контролирует детерминированный размер приложения, но не подменяет физический Mac при оценке CPU/RAM.

<!-- case-study:current-state -->
## Текущая граница: что уже принято, а что ещё нет

Принятая публичная основа — **`0.1.0 — Personal build`**.

У неё есть четыре завершённые границы:

- **M0 — Engineering foundation: ACCEPTED** — Swift 6 shell, notch geometry, pointer policy, AppKit-owned sizing и обязательные real-hardware hover/notch проверки;
- **R0.1 — Personal Release: ACCEPTED** — immutable personal-use DMG с checksum/provenance и стандартным Gatekeeper flow;
- **P0 — Performance Foundation: ACCEPTED** — event-driven policy, target-Mac baseline, deterministic size budgets и regression tooling;
- **P0.1 — Public Repository Readiness: ACCEPTED** — публичный source repository с read-only/secret-free PR CI и изолированной release authority.

Это **не** означает, что следующий interaction milestone уже готов.

**M1 — Notch Core hardening and interaction сейчас не принят.** Активная разработка идёт в **Draft PR #10**. В этом срезе проверяются delayed hover, exactly-once public AppKit haptic, lifecycle pointer monitors, визуальные границы панели и детерминированные expand/collapse transitions. После физического retest была обнаружена отдельная transition-quality regression: endpoints корректны, но открытие/закрытие стало резким. Поэтому M1 остаётся Draft до deterministic tests, exact-head CI, performance/security/size gates и целевого Mac acceptance.

<!-- case-study:decisions -->
## Архитектура и ключевые решения

### AppKit владеет геометрией окна

SwiftUI не должен случайно переопределять physical notch sizing. Размер, позиция и outer clipping принадлежат AppKit-owned window boundary, а view layer получает уже определённый presentation state.

Это решение появилось после реальных дефектов: несовпадения панели с шириной челки, hover oscillation и деградации закруглений после повторных переходов.

### Interaction должен быть event-driven

P0 запрещает непроверенные repeating timers, busy loops и display-link polling в runtime. M1 продолжает это правило: delayed hover использует один отменяемый pending work item, а lifecycle переходов должен оставаться детерминированным и race-safe.

### Haptic — только подтверждение успешного пользовательского перехода

План M1 использует публичный `NSHapticFeedbackManager.defaultPerformer`. Haptic допустим только для успешного deliberate `compact → expanded` transition и не должен срабатывать на cancellation, duplicate movement, collapse, programmatic transition или stale callback.

### Reduce Motion и reversal — часть transition contract

Один transition coordinator должен владеть фазами `compact / expanding / expanded / collapsing`, generation-protected completions и согласованным изменением frame/chrome. Reverse intent во время animation проверяется отдельно, а Reduce Motion не должен быть косметическим afterthought.

<!-- case-study:release -->
## Personal Release и trust boundary

`0.1.0` распространяется как **Personal build**. Он:

- ad-hoc signed;
- сохраняет App Sandbox и Hardened Runtime;
- имеет SHA-256 и build provenance;
- намеренно **не нотарифицирован** Apple и не выдаётся за Trusted Release.

На первом запуске скачанного build macOS может потребовать стандартный Finder **Open** или **System Settings → Privacy & Security → Open Anyway**. Проект не отключает Gatekeeper.

Developer ID/notarization оставлены как отдельный необязательный будущий tier. Для личного использования отсутствие платной Apple Developer Program не блокирует развитие продукта.

<!-- case-study:roadmap -->
## Что дальше

После принятия M1 roadmap последовательно переходит к продуктовым модулям:

1. **Shelf** — sandbox-compatible работа с выбранными пользователем файлами;
2. **Snippets** — локальное хранилище, поиск и copy-first privacy model;
3. **Calendar** — EventKit с явными permission states;
4. **Translator** — Apple Translation framework там, где он доступен;
5. **Media / Yandex Music** — provider abstraction и отдельная compatibility/security проверка;
6. **Product shell** — настройки, ordering модулей и поддерживаемый launch-at-login.

Главная граница остаётся прежней: новый модуль не должен незаметно ухудшать безопасность, приватность или ресурсный профиль always-on приложения.

<!-- case-study:lessons -->
## Что этот проект уже показывает

- UI около аппаратной челки — это прежде всего задача геометрии и window lifecycle, а не только SwiftUI styling;
- физический acceptance нужен там, где симуляция не доказывает поведение hardware surface;
- performance baseline полезнее абстрактного обещания «приложение лёгкое»;
- security ограничения проще сохранять, если они являются executable policy до появления feature pressure;
- опубликованный `0.1.0` и текущий Draft M1 должны оставаться разными evidence layers.

---

**Источник текущей границы:** `README.md`, `docs/PROJECT_STATE.md`, `docs/ROADMAP.md`, `SECURITY.md`, `PERFORMANCE.md` и Draft PR #10 репозитория NotchHub, проверенные при подготовке этой страницы 2026-08-08.
