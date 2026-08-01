# Header, social navigation and language control design

Date: 2026-08-01

## Context

The current standalone RU/EN headers mix primary navigation, a text search link and a standalone GitHub text link. The Russian hero also renders duplicate transition arrows because the visible CTA copy and the presentation layer both contribute an indicator. The current language switch is a floating control in the lower-right corner and visually exposes an extra underlying layer.

This change consolidates those related navigation problems into one bounded UI milestone without changing search ownership, site architecture, analytics, routes or content authority.

## Goals

1. Move external profiles into a compact icon group in the header.
2. Make search a dedicated icon and the last utility before language selection.
3. Make the language selector the final control at the far right of the header.
4. Remove the floating language switch and its duplicate visual or hit-area layer.
5. Simplify the Russian and English hero action groups.
6. Guarantee exactly one transition indicator per text CTA.
7. Preserve keyboard access, responsive behavior, no-JS navigation and the existing Cmd/Ctrl+K search shortcut.

## Non-goals

- No redesign of the primary site navigation or Diplodoc search page.
- No new icon library or runtime dependency.
- No new languages beyond Russian and English.
- No changes to RU/EN content scope or translation policy.
- No analytics events, behavioural tracking or social embeds.
- No removal of the Resume item from the main navigation.

## Canonical external links

- GitHub: `https://github.com/True-Ruslan`
- Habr: `https://habr.com/ru/users/TrueRuslan/`
- Telegram: `https://t.me/TrueRuslan_Blog`

All external links open in a new tab and use `rel="noopener noreferrer"`.

## Header information architecture

### Desktop order

```text
TRUERUSLAN_ | primary navigation | GitHub | Habr | Telegram | Search | Language
```

The language selector is always the final element at the far right.

### Utility group

The right-side utility group contains, in this exact order:

1. GitHub icon link;
2. Habr icon link;
3. Telegram icon link;
4. search icon link;
5. language selector.

GitHub, Habr and Telegram use monochrome inline SVG icons normalized to the same visual box, stroke or fill weight and baseline. They inherit the site foreground color rather than their brand colors. Hover and focus may use the existing cyan/violet accent treatment, but must not introduce multicolour brand marks.

Search uses an inline SVG magnifier and links to the existing generated search route. It remains a normal anchor so search is available without JavaScript. Cmd/Ctrl+K continues to open the existing command palette and remains unchanged.

Every icon-only link has:

- a localized `aria-label`;
- a localized tooltip through `title` or an equivalent accessible pattern;
- a minimum 40 by 40 CSS pixel target;
- a visible `:focus-visible` state;
- no visible text label in the header.

## Language selector

### Trigger

The language trigger is the final header control and displays:

```text
RU  globe  chevron
```

or:

```text
EN  globe  chevron
```

The visual pattern follows the compact region/language selector used in Yandex Cloud documentation, adapted to the TrueRuslan dark, restrained visual system.

### Menu

The trigger opens a right-aligned menu with exactly two options:

```text
Русский   check when active
English   check when active
```

The menu:

- opens on click or keyboard activation;
- exposes `aria-haspopup="menu"` and synchronized `aria-expanded`;
- moves focus predictably into the menu;
- supports Arrow Up, Arrow Down, Home, End, Enter and Space;
- closes on Escape, outside click and successful selection;
- returns focus to the trigger after Escape;
- never overflows the viewport;
- has one DOM control and one hit area, with no decorative duplicate below it.

### Route behavior

When a paired RU/EN route exists, selection opens the paired route. When the current page has no translated pair, selection falls back to the selected language homepage:

- Russian fallback: `/`;
- English fallback: `/en/`.

The implementation must reuse the existing bounded RU/EN route manifest or its generated page metadata rather than introducing a second translation map.

### Removal of the floating control

The existing lower-right floating language control is removed from generated pages, including its script, wrapper, pseudo-elements, reserved spacing and focus target. Regression checks must prove that no floating language trigger remains and that only one language trigger exists in the header.

## Responsive behavior

### Wide layouts

The header remains a three-zone layout:

1. brand;
2. primary navigation;
3. utility group.

The utility group never wraps internally.

### Narrow layouts

At the existing mobile breakpoint:

- brand and the full utility group remain in the first row;
- primary navigation moves to the second row;
- primary navigation may keep horizontal scrolling;
- utility icons keep their target size while visual SVG glyphs remain compact;
- the language menu aligns to the viewport edge and stays fully visible;
- no horizontal page overflow is introduced at supported viewport widths.

If all utility controls do not fit at the narrowest supported width, spacing between them is reduced before any control is hidden. Search, language and external links remain reachable.

## Hero actions

### Russian homepage

The hero action group contains:

1. `Посмотреть проекты` as the primary CTA;
2. `GitHub`;
3. `Habr`;
4. `Telegram`.

The `Резюме` hero CTA is removed. Resume remains present in the main navigation and elsewhere on the site.

### English homepage

The equivalent English hero group follows the same structure:

1. `Explore projects`;
2. `GitHub`;
3. `Habr`;
4. `Telegram`.

### Transition indicators

Each text CTA renders exactly one transition indicator:

- internal primary action: one right arrow;
- external profile actions: one external-link arrow or one right arrow according to the existing CTA grammar, but never both.

The source markup and CSS must have a single owner for the indicator. Tests must reject duplicated visible arrows such as `→ →` or a text arrow plus an injected pseudo-element arrow.

## Styling

- Reuse the current header background, blur, borders and spacing scale.
- Social/search buttons use a shared utility-button class.
- Icons use inline SVG with `aria-hidden="true"` because the anchor supplies the accessible name.
- Hover treatment is subtle: foreground brightening, restrained border/background change and existing accent glow only.
- The language menu uses the existing dark panel vocabulary, thin border, moderate radius and compact spacing.
- Motion respects `prefers-reduced-motion`.

## Implementation boundaries

Expected primary ownership:

- `templates/index.html` and `templates/index.en.html` for standalone header and hero markup;
- the existing RU/EN post-processing layer for generated Diplodoc headers and route pairing;
- existing header, command-palette and i18n styles/scripts rather than a new framework;
- inline SVG assets or a small local icon helper with no external network dependency.

Shared markup should be generated from one canonical helper or data structure where practical. RU and EN must not drift into unrelated utility layouts.

## Failure behavior

- External profile failure does not affect site navigation.
- JavaScript failure leaves social links, search and language links usable as ordinary anchors.
- If menu enhancement fails, the language trigger must still expose a direct usable language destination or a no-JS two-link fallback.
- Missing icon data must fail build-time verification rather than render an empty unnamed control.

## Verification

Automated verification must cover:

1. RU and EN standalone headers contain the utility controls in the canonical order.
2. GitHub, Habr and Telegram use the approved exact URLs.
3. Search is icon-only, has a localized accessible name and appears immediately before language.
4. Language is the final header control.
5. Only one language trigger exists and no floating trigger remains.
6. Language menu keyboard behavior and focus management work.
7. RU/EN paired routes and fallback behavior are correct.
8. Russian and English hero groups contain project plus three external profile actions.
9. Resume is absent from hero but remains available in navigation.
10. No CTA contains duplicate arrow indicators.
11. External links have `target="_blank"` and `rel="noopener noreferrer"`.
12. Chromium, Firefox and WebKit browser smoke passes.
13. Axe accessibility checks pass.
14. Mobile overflow checks pass at existing supported widths.
15. Visual regression snapshots are intentionally updated and reviewed.
16. Cmd/Ctrl+K and the generated search page continue to work.

## Acceptance criteria

The milestone is accepted when:

- the header utility order is `GitHub → Habr → Telegram → Search → Language`;
- language is visibly and semantically the final rightmost control;
- the lower-right floating language control is completely absent;
- hero buttons show no duplicate arrows;
- Resume is removed only from hero actions;
- all icon controls match the visual system and remain accessible;
- all configured quality gates pass on the exact feature head.
