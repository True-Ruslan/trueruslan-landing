# Почему валидный PDF ещё не доказывает полноту и актуальность резюме

PDF удобно воспринимать как законченный документ: файл существует, открывается и выглядит похоже на резюме. Но это объединяет в один статус несколько разных фактов.

```text
repository file
→ valid PDF container
→ downloadable HTTP response
→ passive browser fallback
→ extractable structure and text
→ semantic equivalence with web-CV
→ current professional-profile truth
→ accessible and human-readable document
→ exact deployed PDF verification
```

Каждый следующий слой использует предыдущий, но не наследует его вывод автоматически. Валидный PDF не доказывает полноту и актуальность содержимого.

Связанные материалы:

- [Резюме и web-CV](../resume.md);
- [Почему успешный deployment ещё не означает production verification](deployment-success-is-not-production-verification.md);
- [От source tests к installed acceptance](source-tests-to-installed-acceptance.md);
- [Quality gates для статического инженерного сайта](static-site-quality-gates.md).

## 1. File existence и stable route — только первый слой

В репозитории TrueRuslan Landing PDF хранится по контролируемому пути:

```text
docs/assets/documents/cv.pdf
```

Текущий repository snapshot фиксирует:

```text
Git blob SHA: a6d9871aed7f52992032fb04e5d6f12eeae72808
size:         277792 bytes
```

Build pipeline копирует PDF вместе с поддерживаемыми static assets, а generated-site integrity проверяет локальные ссылки и PDF iframe targets.

**Проверенный факт.** File existence, stable route и ненулевой размер подтверждают, что build имеет конкретный binary input и знает, куда его публиковать.

**Инженерный вывод.** Путь к документу должен быть частью release contract, а не случайной ссылкой внутри Markdown.

**Ограничение.** Существующий файл может быть повреждённым, устаревшим, пустым по смыслу или относиться к другому человеку.

## 2. `%PDF-` и parseability проверяют контейнер

PDF reader сначала ожидает signature/header `%PDF-`, затем cross-reference data, objects, streams и trailer. Structural validation или parser может дополнительно проверить, что документ читается без fatal error и содержит ожидаемое page count.

```text
%PDF- header PASS
+ parser PASS
+ page count within expected range
= structurally usable PDF container
```

**Проверенный факт.** Signature и parseability способны обнаружить HTML error page под расширением `.pdf`, обрезанный upload и часть повреждений структуры.

**Инженерный вывод.** Binary format validation должна выполняться до любых semantic assertions.

**Ограничение.** Parseable PDF может содержать старую должность, отсутствующий опыт, неверные даты или только изображение текста. Parseability не доказывает semantic completeness.

## 3. MIME, Content-Disposition и downloadable bytes — delivery contract

Repository asset и production response — разные объекты проверки. На exact deployment нужно отдельно подтвердить:

- HTTP success;
- `Content-Type: application/pdf`;
- подходящий `Content-Disposition`, если он задан;
- downloadable bytes с `%PDF-` в начале;
- non-trivial content length;
- сохранённый SHA-256 exact deployed PDF для evidence.

`Content-Disposition: inline` и `attachment` могут быть допустимы для разных UX, но заголовок не должен маскировать HTML или текстовый error response.

**Проверенный факт.** MIME и downloadable bytes подтверждают, что production отдаёт PDF, а не только что файл лежит в Git.

**Инженерный вывод.** Deployment verifier должен читать binary response напрямую, а не полагаться только на успешную загрузку страницы резюме.

**Ограничение.** Byte identity доказывает доставку конкретного artifact, но byte identity не означает semantic equivalence.

## 4. Passive и no-JavaScript доступны отдельно от enhancement

Web-CV использует progressive enhancement: iframe сначала имеет безопасный `about:blank`, затем runtime подставляет deployment-safe PDF URL. При этом `<noscript>` сохраняет прямую ссылку.

```html
<iframe data-tr-resume-pdf title="Резюме Руслана Немыкина (PDF)"></iframe>
<noscript>
  <a href=".../docs/assets/documents/cv.pdf">Открыть PDF-резюме</a>
</noscript>
```

**Проверенный факт.** `iframe`, direct link и `noscript` дают passive/no-JavaScript путь к документу; `getResumePdfUrl` сохраняет deployment base paths.

**Инженерный вывод.** PDF должен оставаться companion artifact, а не единственным способом прочитать профессиональный профиль.

**Ограничение.** Наличие fallback link не доказывает, что embedded PDF viewer доступен каждому assistive technology или одинаково работает во всех браузерах.

## 5. Page count и structural validation не равны содержанию

Page count полезен как bounded anomaly detector. Например, внезапный переход с нескольких страниц к нулю или десяткам страниц может показать ошибочный export. Но даже ожидаемое число страниц ничего не говорит о покрытии обязательных разделов.

Надёжный structural gate может проверять:

1. корректный PDF container;
2. page count в контролируемом диапазоне;
3. отсутствие encryption, если оно не предусмотрено;
4. наличие text objects либо явно разрешённый image-only режим;
5. отсутствие пустых страниц;
6. стабильный размер и digest evidence.

**Проверенный факт.** Structural validation ловит класс binary/export regressions.

**Инженерный вывод.** Такие проверки должны fail closed при неожиданной форме документа.

**Ограничение.** Две структурно одинаковые версии могут радикально различаться по смыслу.

## 6. Text extraction и required sections

Следующий слой — извлечь текст и проверить required sections. Для резюме это не поиск одного имени, а bounded semantic contract:

- `Руслан Немыкин`;
- `Java Backend Engineer`;
- текущая работа `QWEP`;
- `Java 21–25`;
- `Spring Boot 3.5–4`;
- опыт работы;
- образование;
- контакты или контролируемый путь связи.

Text extraction обнаруживает image-only export, пропавший раздел, сломанную кодировку или документ не той версии.

**Проверенный факт.** Required-section coverage сильнее signature и page count, потому что проверяет наблюдаемое содержимое.

**Инженерный вывод.** Marker checks следует привязывать к canonical editorial source и обновлять осознанно, иначе они сами становятся stale.

**Ограничение.** Наличие слов не доказывает правильный контекст: `QWEP` может присутствовать в старой сноске, а не как текущая работа.

## 7. Web-CV ↔ PDF semantic equivalence

В этой архитектуре **web-CV — canonical editorial source**, а PDF — компактный distribution artifact. Это не требует byte-for-byte или line-for-line равенства. Форматы имеют разные задачи:

- web-CV может быть подробнее и связывать проекты, публикации и Notes;
- PDF должен оставаться компактным для отправки, печати и ATS;
- оба формата обязаны совпадать по ключевым фактам.

Semantic equivalence означает согласованность как минимум по:

- имени и позиционированию;
- current employer и роли;
- датам опыта;
- core stack;
- образованию;
- доступным контактам;
- отсутствию взаимоисключающих утверждений.

**Проверенный факт.** Текущий web-CV фиксирует августовский профессиональный профиль: более 5 лет опыта, QWEP, Java 21–25 и Spring Boot 3.5–4.

**Инженерный вывод.** PDF release gate должен сравнивать extracted facts с web-CV contract, а не с ещё одной вручную дублированной таблицей.

**Ограничение.** Автоматическое сравнение ключевых markers не заменяет редакторскую проверку формулировок, приоритетов и допустимого сокращения.

## 8. Current professional-profile truth — отдельная ответственность

Даже идеально синхронизированные web-CV и PDF могут быть устаревшими относительно реальной работы. Поэтому current professional-profile truth требует controlled editorial update:

1. подтвердить новые факты;
2. обновить canonical web-CV;
3. обновить PDF;
4. проверить semantic equivalence;
5. принять generated artifact;
6. проверить exact deployed PDF.

**Проверенный факт.** Existing repository tests закрепляют current resume surfaces и downloadable CV как отдельные contracts.

**Инженерный вывод.** Автоматизация должна предотвращать рассинхронизацию, но не придумывать карьерные факты и не публиковать их автоматически.

**Ограничение.** CI не может самостоятельно определить, изменилась ли фактическая роль, зона ответственности или достижение пользователя.

## 9. Accessibility и human-readable layout

Text extraction — необходимый, но недостаточный accessibility signal. Human-readable layout требует отдельно проверить:

- разумный reading order;
- selectable text;
- достаточный contrast;
- читаемый font size;
- отсутствие clipping и наложений;
- корректные переносы;
- понятные headings;
- печать на типовом формате;
- tagged PDF и document language, если accessibility scope это требует.

**Проверенный факт.** Web-CV проходит browser/Axe/Lighthouse и visual regression gates; это не автоматически переносится на PDF viewer и PDF document tree.

**Инженерный вывод.** PDF accessibility и визуальная читаемость требуют собственного автоматизированного и bounded human gate.

**Ограничение.** Screenshot comparison не доказывает logical reading order, а parser text order не гарантирует хороший визуальный layout.

## 10. Exact deployed PDF — финальный технический слой

Production acceptance должна проверять exact deployed SHA и три связанные поверхности:

```text
Note route
+ canonical web-CV route
+ exact deployed PDF bytes
+ Atom feed
+ generated search
```

Для PDF verifier фиксирует status, MIME, `%PDF-`, size и SHA-256. Для web-CV — semantic content, passive iframe и noscript fallback. Для Note — canonical/OpenGraph URL и отсутствие legacy-origin leakage.

**Проверенный факт.** Только deployment-aware smoke отвечает на вопрос, какой документ реально опубликован на `trueruslan.ru` для принятого commit.

**Инженерный вывод.** Repository PDF, generated copy и production response нужно считать отдельными evidence layers до exact verification.

**Ограничение.** Successful production smoke не доказывает индексирование поисковиками, ATS compatibility или идеальную читаемость для каждого PDF reader.

## Практическая матрица доказательств

| Проверка | Что доказывает | Чего не доказывает |
|---|---|---|
| File existence | controlled binary input существует | файл является PDF |
| `%PDF-` + parser | контейнер структурно читается | содержание актуально |
| MIME + bytes | production отдаёт PDF response | PDF семантически полный |
| iframe + noscript | есть passive/no-JS access path | PDF accessible для всех |
| page count | форма export не вышла за bounds | обязательные разделы присутствуют |
| text extraction | текст доступен parser | факты находятся в правильном контексте |
| required sections | базовые markers присутствуют | формулировки качественные и непротиворечивые |
| web-CV comparison | ключевые факты согласованы | реальный профиль не изменился |
| visual/accessibility review | layout и reading experience проверены | любой viewer/ATS даст тот же результат |
| exact deployment smoke | принят конкретный production artifact | внешние системы уже его обработали |

## Итог

PDF validation — не один boolean. Это цепочка независимых evidence layers.

```text
valid bytes
≠ complete resume
≠ current professional truth
≠ accessible document
≠ accepted production artifact
```

Надёжная система сохраняет эти различия: binary checks отвечают за контейнер и delivery, semantic checks — за содержание, editorial source — за правду профиля, а exact production verification — за реально опубликованный документ.
