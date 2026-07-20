# Quality gates для статического инженерного сайта

Статический сайт легко считать простым: HTML собрался — значит всё работает. На практике сборка может быть зелёной, а production всё равно отдавать 404, потерять PDF, сломать search assets или визуально уехать после безобидного CSS-изменения.

Поэтому я проверяю не только исходники, а несколько последовательных уровней доказательств.

## 1. Unit и contract tests

Первый слой проверяет чистые преобразования:

- sitemap discovery;
- SEO/post-processing;
- standalone rendering;
- local-search normalization;
- manifest validation;
- deployment-safe URL generation.

Этот уровень быстрый, но он ещё ничего не доказывает про финальный сайт.

## 2. Generated-site integrity

После production build отдельный checker проходит по готовому `docs-html`.

Он проверяет локальные ссылки и ресурсы с учётом HTML `<base href>` semantics. Это принципиально: анализировать только Markdown или шаблоны недостаточно, потому что дефект может появиться именно на этапе генерации.

Такой gate уже обнаруживал реальную проблему с ресурсами Diplodoc local search.

## 3. Реальный браузер

Следующий уровень — Chromium через Playwright.

Проверяются:

- homepage, Projects и Resume;
- desktop/mobile viewport;
- HTTP failures;
- browser page errors;
- horizontal overflow;
- инициализация visual layer;
- доступность Resume PDF как реального `application/pdf`.

Именно browser-level проверка поймала ситуацию, когда PDF hydration зависела от момента client-side mount.

## 4. Accessibility и Lighthouse

Axe проверяет serious/critical accessibility violations, а Lighthouse — budgets по Performance, Accessibility, Best Practices и SEO.

Важно не воспринимать Lighthouse как абсолютную оценку качества. Это один из сигналов release gate, а не замена архитектурному анализу.

## 5. Firefox и WebKit sanity

Полный тяжёлый suite не нужно дублировать три раза. Поэтому Chromium остаётся главным browser gate, а Firefox/WebKit выполняют компактный smoke по критическим страницам.

Так покрываются браузерные различия без трёхкратного роста CI-time.

## 6. Search smoke

Generated local-search page проверяется отдельно в настоящем Chromium. Это маленький специализированный тест на компонент, который уже имел собственный класс build-time проблем.

## 7. Visual regression

Для homepage, Projects и Resume хранятся versioned visual baselines desktop/mobile.

Gate сравнивает геометрию и perceptual fingerprint. Намеренное изменение сначала должно пройти функциональные browser checks, и только после этого baseline обновляется из артефактов успешного запуска.

Это защищает от привычки «обновить screenshot, чтобы CI стал зелёным».

## 8. Production smoke

Даже идеальный artifact не гарантирует успешный deployment.

После GitHub Pages deployment отдельно проверяются реальный public URL, Projects, Resume, PDF и критические assets. Есть bounded retry, чтобы отличить короткую задержку публикации от устойчивого дефекта.

## Главный принцип

Каждый gate отвечает на отдельный вопрос:

```text
Tests            → логика преобразований корректна?
Build            → сайт вообще собирается?
Integrity        → финальный artifact самосогласован?
Browser          → он реально работает в браузере?
Axe/Lighthouse   → качество укладывается в budgets?
Cross-browser    → нет очевидной несовместимости?
Visual           → внешний вид не изменился случайно?
Production smoke → опубликован именно рабочий artifact?
```

Надёжность появляется не из одного «супертеста», а из набора независимых доказательств на разных границах системы.
