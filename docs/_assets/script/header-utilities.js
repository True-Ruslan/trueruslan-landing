(function bootstrapTrueRuslanHeaderUtilities(root) {
  'use strict';

  const EXTERNAL_PROFILES = Object.freeze({
    github: Object.freeze({
      href: 'https://github.com/True-Ruslan',
      label: 'GitHub',
      icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.88c-2.78.6-3.37-1.18-3.37-1.18-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.35 1.09 2.92.83.09-.65.35-1.09.64-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.55 9.55 0 0 1 12 6.82c.85 0 1.71.12 2.51.34 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.86v2.76c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"/></svg>',
    }),
    habr: Object.freeze({
      href: 'https://habr.com/ru/users/TrueRuslan/',
      label: 'Habr',
      icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="3" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M8 7v10M16 7v10M8 12h8" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>',
    }),
    telegram: Object.freeze({
      href: 'https://t.me/TrueRuslan_Blog',
      label: 'Telegram',
      icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 11.2 20.5 4l-3.2 15.8-5.5-4.3-3.1 2.9.6-5.2 7.7-6.1-10.2 5.6Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round"/></svg>',
    }),
  });

  const SEARCH_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.4" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m15.5 15.5 4.1 4.1" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
  const GLOBE_ICON = '<svg class="tr-language-globe" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M4.5 12h15M12 4c2.2 2.1 3.3 4.8 3.3 8S14.2 17.9 12 20c-2.2-2.1-3.3-4.8-3.3-8S9.8 6.1 12 4Z" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>';
  const CHEVRON_ICON = '<svg class="tr-language-chevron" viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const ORDER = Object.freeze(['github', 'habr', 'telegram', 'search']);

  function hasDom() {
    return typeof root.document !== 'undefined' && root.document !== null;
  }

  function isEnglish(document) {
    return document.documentElement?.lang?.toLowerCase().startsWith('en') ?? false;
  }

  function matchesHref(anchor, expected) {
    try {
      const actual = new URL(anchor.href, root.location?.href || 'https://example.invalid/');
      const target = new URL(expected);
      return actual.hostname.toLowerCase() === target.hostname.toLowerCase()
        && actual.pathname.replace(/\/$/, '').toLowerCase() === target.pathname.replace(/\/$/, '').toLowerCase();
    } catch {
      return false;
    }
  }

  function findHeaderAnchor(scope, kind) {
    const anchors = [...scope.querySelectorAll('a[href]')];
    if (kind === 'search') {
      return anchors.find((anchor) => (anchor.getAttribute('href') || '').includes('_search/ru/index.html')) ?? null;
    }
    return anchors.find((anchor) => matchesHref(anchor, EXTERNAL_PROFILES[kind].href)) ?? null;
  }

  function findHeaderScope(document) {
    const search = findHeaderAnchor(document, 'search');
    if (!search) return null;

    let candidate = search.parentElement;
    while (candidate && candidate !== document.body) {
      if (ORDER.every((kind) => findHeaderAnchor(candidate, kind))) return candidate;
      candidate = candidate.parentElement;
    }
    return null;
  }

  function directChildContaining(scope, node) {
    let current = node;
    while (current?.parentElement && current.parentElement !== scope) current = current.parentElement;
    return current?.parentElement === scope ? current : null;
  }

  function createGroupInScope(document, scope, anchors) {
    const group = document.createElement('div');
    group.className = 'tr-header-utilities';
    group.dataset.trHeaderUtilities = 'true';

    const sharedParent = anchors.every((anchor) => anchor.parentElement === anchors[0].parentElement)
      ? anchors[0].parentElement
      : null;
    if (sharedParent) {
      sharedParent.insertBefore(group, anchors[0]);
    } else {
      const reference = directChildContaining(scope, anchors[0]);
      scope.insertBefore(group, reference || null);
    }
    return group;
  }

  function resolveSiteRoot(searchAnchor) {
    const fallback = new URL('/', root.location?.href || 'https://example.invalid/');
    if (!searchAnchor) return fallback;
    const searchUrl = new URL(searchAnchor.href, root.location?.href || fallback.href);
    const markerIndex = searchUrl.pathname.indexOf('_search/ru/index.html');
    if (markerIndex < 0) return fallback;
    const pathname = searchUrl.pathname.slice(0, markerIndex);
    return new URL(pathname.endsWith('/') ? pathname : `${pathname}/`, searchUrl.origin);
  }

  function localizeDevelopmentTarget(value) {
    const target = new URL(value, root.location?.href || 'https://example.invalid/');
    const hostname = root.location?.hostname || '';
    if ((hostname === 'localhost' || hostname === '127.0.0.1') && target.origin !== root.location.origin) {
      return `${root.location.origin}${target.pathname}${target.search}${target.hash}`;
    }
    return target.href;
  }

  function resolveLanguageTargets(document, searchAnchor) {
    const siteRoot = resolveSiteRoot(searchAnchor);
    const configuredRu = document.documentElement?.dataset?.trI18nRu;
    const configuredEn = document.documentElement?.dataset?.trI18nEn;
    return {
      ru: localizeDevelopmentTarget(configuredRu || siteRoot.href),
      en: localizeDevelopmentTarget(configuredEn || new URL('en/', siteRoot).href),
    };
  }

  function setIcon(anchor, kind, icon) {
    if (anchor.dataset.trUtilityIcon === kind) return;
    anchor.innerHTML = icon;
    anchor.dataset.trUtilityIcon = kind;
  }

  function configureUtilityAnchor(anchor, kind, document) {
    const english = isEnglish(document);
    anchor.classList.add('tr-header-utility');
    anchor.dataset.trUtility = kind;

    if (kind === 'search') {
      const label = english ? 'Search the site' : 'Поиск по сайту';
      anchor.setAttribute('aria-label', label);
      anchor.setAttribute('title', label);
      anchor.removeAttribute('target');
      anchor.removeAttribute('rel');
      setIcon(anchor, kind, SEARCH_ICON);
      return anchor;
    }

    const profile = EXTERNAL_PROFILES[kind];
    anchor.href = profile.href;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    anchor.setAttribute('aria-label', profile.label);
    anchor.setAttribute('title', profile.label);
    setIcon(anchor, kind, profile.icon);
    return anchor;
  }

  function createLanguageControl(document, searchAnchor) {
    const english = isEnglish(document);
    const locale = english ? 'en' : 'ru';
    const labels = english
      ? {trigger: 'Choose language', menu: 'Site language'}
      : {trigger: 'Выбрать язык', menu: 'Язык сайта'};
    const targets = resolveLanguageTargets(document, searchAnchor);
    const details = document.createElement('details');
    details.className = 'tr-language-control';
    details.dataset.trLanguage = 'true';
    details.innerHTML = `
      <summary class="tr-language-trigger" data-tr-language-trigger aria-label="${labels.trigger}" title="${labels.trigger}" aria-haspopup="menu" aria-expanded="false">
        <span class="tr-language-current">${locale.toUpperCase()}</span>${GLOBE_ICON}${CHEVRON_ICON}
      </summary>
      <div class="tr-language-menu" data-tr-language-menu role="menu" aria-label="${labels.menu}">
        <a href="${targets.ru}" hreflang="ru" lang="ru" role="menuitemradio" aria-checked="${locale === 'ru'}"${locale === 'ru' ? ' aria-current="page"' : ''}>Русский</a>
        <a href="${targets.en}" hreflang="en" lang="en" role="menuitemradio" aria-checked="${locale === 'en'}"${locale === 'en' ? ' aria-current="page"' : ''}>English</a>
      </div>`;
    return details;
  }

  function updateLanguageControl(document, details, searchAnchor) {
    const english = isEnglish(document);
    const locale = english ? 'en' : 'ru';
    const targets = resolveLanguageTargets(document, searchAnchor);
    const trigger = details.querySelector('[data-tr-language-trigger]');
    const current = details.querySelector('.tr-language-current');
    const links = {
      ru: details.querySelector('a[hreflang="ru"]'),
      en: details.querySelector('a[hreflang="en"]'),
    };

    if (current && current.textContent !== locale.toUpperCase()) current.textContent = locale.toUpperCase();
    if (trigger) {
      const label = english ? 'Choose language' : 'Выбрать язык';
      trigger.setAttribute('aria-label', label);
      trigger.setAttribute('title', label);
    }
    for (const code of ['ru', 'en']) {
      const link = links[code];
      if (!link) continue;
      link.href = targets[code];
      const active = locale === code;
      link.setAttribute('aria-checked', String(active));
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    }
  }

  function setupLanguageMenu(document) {
    for (const details of document.querySelectorAll('[data-tr-language="true"]')) {
      const trigger = details.querySelector('[data-tr-language-trigger]');
      const menu = details.querySelector('[data-tr-language-menu]');
      const links = [...(menu?.querySelectorAll('a[role="menuitemradio"]') ?? [])];
      if (!trigger || !menu || links.length !== 2) continue;

      updateLanguageControl(document, details, details.parentElement?.querySelector('[data-tr-utility="search"]'));
      trigger.setAttribute('aria-expanded', String(details.open));
      if (details.dataset.trLanguageEnhanced === 'true') continue;
      details.dataset.trLanguageEnhanced = 'true';

      const close = (restoreFocus = false) => {
        details.open = false;
        trigger.setAttribute('aria-expanded', 'false');
        if (restoreFocus) trigger.focus();
      };
      const openAndFocus = (index) => {
        details.open = true;
        trigger.setAttribute('aria-expanded', 'true');
        links[index].focus();
      };

      details.addEventListener('toggle', () => trigger.setAttribute('aria-expanded', String(details.open)));
      trigger.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault();
          openAndFocus(event.key === 'ArrowDown' ? 0 : links.length - 1);
        } else if (event.key === 'Escape') {
          event.preventDefault();
          close(true);
        }
      });
      menu.addEventListener('keydown', (event) => {
        const currentIndex = links.indexOf(document.activeElement);
        if (event.key === 'Escape') {
          event.preventDefault();
          close(true);
          return;
        }
        if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        let nextIndex = currentIndex < 0 ? 0 : currentIndex;
        if (event.key === 'ArrowDown') nextIndex = (nextIndex + 1) % links.length;
        if (event.key === 'ArrowUp') nextIndex = (nextIndex - 1 + links.length) % links.length;
        if (event.key === 'Home') nextIndex = 0;
        if (event.key === 'End') nextIndex = links.length - 1;
        links[nextIndex].focus();
      });
      document.addEventListener('pointerdown', (event) => {
        if (details.open && !details.contains(event.target)) close();
      });
    }
  }

  function classifyHeroActions(document) {
    for (const anchor of document.querySelectorAll('.tr-home-actions a[href]')) {
      const href = anchor.getAttribute('href') || '';
      if (/\/projects\.html$/.test(href) || /landing\/projects\.html$/.test(href)) {
        anchor.classList.add('tr-cta', 'tr-cta--primary');
      } else if (
        /github\.com\/True-Ruslan/i.test(href)
        || /habr\.com\/ru\/users\/TrueRuslan/i.test(href)
        || /t\.me\/TrueRuslan_Blog/i.test(href)
      ) {
        anchor.classList.add('tr-cta', 'tr-cta--secondary', 'tr-cta--external');
      }
    }
  }

  function orderUtilityChildren(group, anchors, language) {
    const expected = [...anchors, language].filter(Boolean);
    expected.forEach((node, index) => {
      if (group.children[index] !== node) group.insertBefore(node, group.children[index] || null);
    });
  }

  function setupHeaderUtilities(document) {
    for (const legacy of document.querySelectorAll('[data-tr-language-switcher]')) legacy.remove();

    let group = document.querySelector('[data-tr-header-utilities]');
    if (!group) {
      const scope = document.querySelector('header') || findHeaderScope(document);
      if (scope) {
        const anchors = ORDER.map((kind) => findHeaderAnchor(scope, kind));
        if (anchors.every(Boolean)) {
          group = createGroupInScope(document, scope, anchors);
          ORDER.forEach((kind, index) => group.appendChild(configureUtilityAnchor(anchors[index], kind, document)));
        }
      }
    }

    if (!group) {
      classifyHeroActions(document);
      return null;
    }

    const anchors = ORDER.map((kind) => {
      const anchor = group.querySelector(`[data-tr-utility="${kind}"]`) || findHeaderAnchor(group, kind);
      return anchor ? configureUtilityAnchor(anchor, kind, document) : null;
    });
    let language = group.querySelector('[data-tr-language="true"]');
    const searchAnchor = anchors[ORDER.indexOf('search')];
    if (!language) language = createLanguageControl(document, searchAnchor);
    updateLanguageControl(document, language, searchAnchor);
    orderUtilityChildren(group, anchors, language);

    setupLanguageMenu(document);
    classifyHeroActions(document);
    return group;
  }

  function init() {
    if (hasDom()) setupHeaderUtilities(root.document);
  }

  function observeHydration() {
    if (!hasDom() || typeof root.MutationObserver !== 'function') return;
    let scheduled = false;
    const observer = new root.MutationObserver(() => {
      if (scheduled) return;
      scheduled = true;
      const run = () => {
        scheduled = false;
        setupHeaderUtilities(root.document);
      };
      if (typeof root.requestAnimationFrame === 'function') root.requestAnimationFrame(run);
      else root.setTimeout(run, 0);
    });
    observer.observe(root.document.documentElement, {childList: true, subtree: true});
  }

  root.TrueRuslanHeaderUtilities = Object.freeze({
    EXTERNAL_PROFILES,
    findHeaderScope,
    resolveLanguageTargets,
    setupHeaderUtilities,
    setupLanguageMenu,
    init,
  });

  if (hasDom()) {
    if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', init, {once: true});
    else init();
    root.addEventListener('load', () => {
      init();
      root.setTimeout(init, 80);
    }, {once: true});
    observeHydration();
  }
}(typeof globalThis !== 'undefined' ? globalThis : this));
