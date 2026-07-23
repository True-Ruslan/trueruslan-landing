(function bootstrapTrueRuslanVisual(root) {
  'use strict';

  function normalizePath(pathname) {
    if (!pathname) return '/';
    const clean = pathname.split('?')[0].split('#')[0].replace(/\/{2,}/g, '/');
    return clean.length > 1 && clean.endsWith('/') ? clean.slice(0, -1) : clean;
  }

  function getPageKind(pathname) {
    const path = normalizePath(pathname).toLowerCase();
    if (path === '/' || path === '/index.html' || path.endsWith('/index.html')) return 'home';

    for (const page of ['projects', 'about', 'resume', 'bibliography', 'contacts', 'photos']) {
      if (path.endsWith(`/landing/${page}.html`)) return page;
    }
    return 'content';
  }

  function getTerminalLines() {
    return [
      '$ java --version',
      'openjdk 21 · production-minded backend',
      '$ whoami',
      'Backend Engineer · distributed systems · AI',
      '$ status',
      'building reliable systems_',
    ];
  }

  function getResumePdfUrl(currentHref) {
    return new URL('../assets/documents/cv.pdf', currentHref).href;
  }

  function normalizeSourcesQuery(value) {
    return String(value ?? '')
      .trim()
      .toLocaleLowerCase('ru-RU')
      .replace(/\s+/g, ' ');
  }

  function sourceMatchesSourcesFilters(source = {}, filters = {}) {
    const query = normalizeSourcesQuery(filters.query);
    const searchText = normalizeSourcesQuery(source.searchText);
    const topic = String(filters.topic ?? '').trim();
    const sourceType = String(filters.sourceType ?? '').trim();
    const topics = Array.isArray(source.topics)
      ? source.topics
      : String(source.topics ?? '').split('|').map((value) => value.trim()).filter(Boolean);

    return (!query || searchText.includes(query))
      && (!topic || topics.includes(topic))
      && (!sourceType || source.sourceType === sourceType);
  }

  function hasDom() {
    return typeof root.document !== 'undefined' && root.document !== null;
  }

  function reducedMotion() {
    return typeof root.matchMedia === 'function'
      && root.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function getRevealObserverOptions() {
    return {threshold: 0, rootMargin: '0px 0px -7% 0px'};
  }

  function afterApplicationHydration(callback) {
    const schedule = () => {
      const afterFrames = () => {
        if (typeof root.requestAnimationFrame === 'function') {
          root.requestAnimationFrame(() => root.requestAnimationFrame(callback));
        } else {
          root.setTimeout(callback, 0);
        }
      };

      // Let Diplodoc/React finish its load-time hydration before progressive
      // enhancement mutates any server-rendered article DOM.
      root.setTimeout(afterFrames, 50);
    };

    if (root.document.readyState === 'complete') {
      schedule();
    } else {
      root.addEventListener('load', schedule, {once: true});
    }
  }

  function markPage(document) {
    const page = getPageKind(root.location?.pathname || '/');
    document.documentElement.classList.add('tr-js');
    document.documentElement.dataset.trPage = page;
    document.body?.classList.add(`tr-page-${page}`);
    return page;
  }

  function hardenExternalLinks(document) {
    for (const link of document.querySelectorAll('a[target="_blank"]')) {
      const rel = new Set((link.getAttribute('rel') || '').split(/\s+/).filter(Boolean));
      rel.add('noopener');
      rel.add('noreferrer');
      link.setAttribute('rel', [...rel].join(' '));
    }
  }

  function hydrateResumePdf(document) {
    if (!root.location?.href) return;

    const pdfUrl = getResumePdfUrl(root.location.href);
    const viewer = document.querySelector('[data-tr-resume-pdf]');
    const links = document.querySelectorAll('[data-tr-resume-link]');

    if (viewer && viewer.getAttribute('src') !== pdfUrl) {
      viewer.setAttribute('src', pdfUrl);
    }
    for (const link of links) {
      if (link.getAttribute('href') !== pdfUrl) {
        link.setAttribute('href', pdfUrl);
      }
    }
  }

  function repairRuntimeAccessibility(document) {
    const isEnglish = document.documentElement?.lang?.toLowerCase().startsWith('en');
    const controlLabels = [
      ['.dc-sidebar-navigation__button', isEnglish ? 'Open navigation' : 'Открыть навигацию'],
      ['.dc-subnavigation__share-button', isEnglish ? 'Share page' : 'Поделиться страницей'],
    ];

    for (const [selector, label] of controlLabels) {
      for (const button of document.querySelectorAll(selector)) {
        if (!button.getAttribute('aria-label') && !button.getAttribute('aria-labelledby') && !button.textContent?.trim()) {
          button.setAttribute('aria-label', label);
        }
      }
    }

    for (const code of document.querySelectorAll('pre code')) {
      if (code.scrollWidth > code.clientWidth && !code.hasAttribute('tabindex')) {
        code.setAttribute('tabindex', '0');
      }
    }

    for (const anchor of document.querySelectorAll('a[aria-hidden="true"].yfm-anchor, a[aria-hidden="true"].yfm-clipboard-anchor')) {
      anchor.setAttribute('tabindex', '-1');
    }

    for (const main of document.querySelectorAll('main')) {
      if (main.parentElement?.closest('main')) {
        main.setAttribute('role', 'presentation');
      }
    }

    let unnamedNavigationIndex = 0;
    for (const navigation of document.querySelectorAll('nav')) {
      if (navigation.hasAttribute('aria-label') || navigation.hasAttribute('aria-labelledby')) {
        continue;
      }

      if (navigation.classList.contains('dc-toc')) {
        navigation.setAttribute('aria-label', isEnglish ? 'Section navigation' : 'Навигация по разделам');
      } else if (navigation.closest('header')) {
        navigation.setAttribute('aria-label', isEnglish ? 'Main navigation' : 'Основная навигация');
      } else {
        unnamedNavigationIndex += 1;
        navigation.setAttribute('aria-label', isEnglish
          ? `Page navigation ${unnamedNavigationIndex}`
          : `Навигация страницы ${unnamedNavigationIndex}`);
      }
    }
  }

  function repairDynamicContent(document) {
    repairRuntimeAccessibility(document);
    hydrateResumePdf(document);
    hardenExternalLinks(document);
  }

  function setupRuntimeAccessibility(document) {
    repairDynamicContent(document);

    if (typeof root.MutationObserver !== 'function' || !document.documentElement) {
      return;
    }

    let scheduled = false;
    const repair = () => {
      scheduled = false;
      repairDynamicContent(document);
    };

    const observer = new root.MutationObserver(() => {
      if (scheduled) return;
      scheduled = true;
      if (typeof root.requestAnimationFrame === 'function') {
        root.requestAnimationFrame(repair);
      } else {
        root.setTimeout(repair, 0);
      }
    });

    observer.observe(document.documentElement, {childList: true, subtree: true});
  }

  function classifyCards(document) {
    const links = document.querySelectorAll('main a[href*="landing/"], main a[href*="/landing/"]');
    for (const link of links) {
      if (link.closest('nav, aside, .tr-home-card, .tr-home-actions')) continue;
      const candidate = link.closest(
        '[class*="basic-card"], [class*="BasicCard"], [class*="card-wrapper"], [class*="Card"]',
      );
      if (!candidate) continue;
      candidate.classList.add('tr-card');
      link.classList.add('tr-card__link');
    }
  }

  function classifyCtas(document, page) {
    if (page !== 'home') return;
    const links = [...document.querySelectorAll('.tr-home-actions a[href]')];

    for (const link of links) {
      const href = link.getAttribute('href') || '';
      if (/landing\/projects\.(md|html)$/.test(href) || /\/projects\.html$/.test(href)) {
        link.classList.add('tr-cta', 'tr-cta--primary');
      } else if (
        /landing\/resume\.(md|html)$/.test(href)
        || /\/resume\.html$/.test(href)
        || /github\.com\/True-Ruslan/i.test(href)
      ) {
        link.classList.add('tr-cta', 'tr-cta--secondary');
      }
    }
  }

  function setupSourcesKnowledgeBase(document, page) {
    if (page !== 'bibliography') return;
    const host = document.querySelector('[data-tr-sources-root]');
    if (!host || host.dataset.trSourcesEnhanced === 'true') return;

    const queryInput = host.querySelector('[data-tr-sources-query]');
    const topicSelect = host.querySelector('[data-tr-sources-topic]');
    const typeSelect = host.querySelector('[data-tr-sources-type]');
    const clearButton = host.querySelector('[data-tr-sources-clear]');
    const count = host.querySelector('[data-tr-sources-count]');
    const cards = [...host.querySelectorAll('[data-tr-source]')];
    if (!queryInput || !topicSelect || !typeSelect || !clearButton || !count || cards.length === 0) return;

    host.dataset.trSourcesEnhanced = 'true';
    const total = cards.length;

    const applyFilters = () => {
      const filters = {
        query: queryInput.value,
        topic: topicSelect.value,
        sourceType: typeSelect.value,
      };
      let visible = 0;
      for (const card of cards) {
        const matches = sourceMatchesSourcesFilters({
          searchText: card.dataset.trSourceSearch || '',
          topics: card.dataset.trSourceTopics || '',
          sourceType: card.dataset.trSourceType || '',
        }, filters);
        card.hidden = !matches;
        if (matches) visible += 1;
      }
      count.textContent = `Показано: ${visible} из ${total}`;
      return visible;
    };

    const clearFilters = () => {
      queryInput.value = '';
      topicSelect.value = '';
      typeSelect.value = '';
      applyFilters();
      queryInput.focus?.();
    };

    const revealHashTarget = () => {
      const hash = root.location?.hash || '';
      if (!hash.startsWith('#source-')) return;
      const target = document.getElementById?.(decodeURIComponent(hash.slice(1)));
      if (!target?.matches?.('[data-tr-source]') || !target.hidden) return;
      queryInput.value = '';
      topicSelect.value = '';
      typeSelect.value = '';
      applyFilters();
    };

    queryInput.addEventListener('input', applyFilters);
    topicSelect.addEventListener('change', applyFilters);
    typeSelect.addEventListener('change', applyFilters);
    clearButton.addEventListener('click', clearFilters);
    root.addEventListener?.('hashchange', revealHashTarget);

    applyFilters();
    revealHashTarget();
  }

  function createTerminal(document) {
    const terminal = document.createElement('aside');
    terminal.className = 'tr-terminal';
    terminal.setAttribute('aria-label', 'Developer terminal');
    terminal.setAttribute('data-tr-terminal', '');

    const chrome = document.createElement('div');
    chrome.className = 'tr-terminal__chrome';
    chrome.setAttribute('aria-hidden', 'true');
    for (const name of ['close', 'minimize', 'maximize']) {
      const dot = document.createElement('span');
      dot.className = `tr-terminal__dot tr-terminal__dot--${name}`;
      chrome.appendChild(dot);
    }
    const title = document.createElement('span');
    title.className = 'tr-terminal__title';
    title.textContent = 'trueruslan@portfolio:~';
    chrome.appendChild(title);

    const body = document.createElement('div');
    body.className = 'tr-terminal__body';
    for (const line of getTerminalLines()) {
      const row = document.createElement('div');
      row.className = line.startsWith('$')
        ? 'tr-terminal__line tr-terminal__line--command'
        : 'tr-terminal__line tr-terminal__line--output';
      row.dataset.text = line;
      row.textContent = reducedMotion() ? line : '';
      body.appendChild(row);
    }
    terminal.append(chrome, body);
    return terminal;
  }

  async function typeTerminal(terminal) {
    if (reducedMotion()) return;
    for (const row of terminal.querySelectorAll('.tr-terminal__line')) {
      const text = row.dataset.text || '';
      for (const char of text) {
        row.textContent += char;
        await new Promise((resolve) => root.setTimeout(resolve, text.startsWith('$') ? 22 : 12));
      }
      await new Promise((resolve) => root.setTimeout(resolve, text.startsWith('$') ? 100 : 170));
    }
  }

  function mountTerminal(document, page) {
    if (page !== 'home' || document.querySelector('[data-tr-terminal]')) return;
    const heading = [...document.querySelectorAll('h1, h2')]
      .find((node) => node.textContent?.trim().includes('Руслан Немыкин'));
    if (!heading) return;

    const host = heading.closest('section, [class*="header-block"], [class*="HeaderBlock"]')
      || heading.parentElement;
    if (!host) return;

    const terminal = createTerminal(document);
    host.appendChild(terminal);
    root.requestAnimationFrame?.(() => terminal.classList.add('is-mounted'));
    void typeTerminal(terminal);
  }

  function setupReveal(document) {
    const selectors = [
      'main h1', 'main h2', 'main h3', 'main p', 'main ul', 'main ol',
      'main table', 'main iframe', 'main .tr-card',
      'main [class*="card-layout"]', 'main [class*="CardLayout"]',
    ];
    const nodes = [...new Set(selectors.flatMap((selector) => [...document.querySelectorAll(selector)]))]
      .filter((node) => !node.closest('.tr-terminal, nav, aside'));

    nodes.forEach((node) => node.classList.add('tr-reveal'));
    if (reducedMotion() || typeof root.IntersectionObserver !== 'function') {
      nodes.forEach((node) => node.classList.add('is-visible'));
      return;
    }

    const observer = new root.IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }, getRevealObserverOptions());

    nodes.forEach((node, index) => {
      node.style.setProperty('--tr-reveal-delay', `${Math.min(index % 5, 4) * 45}ms`);
      observer.observe(node);
    });
  }

  function setupPointerGlow(document) {
    if (
      reducedMotion()
      || typeof root.matchMedia !== 'function'
      || !root.matchMedia('(pointer: fine)').matches
      || typeof root.requestAnimationFrame !== 'function'
    ) return;

    let frame = 0;
    document.addEventListener('pointermove', (event) => {
      if (frame) return;
      frame = root.requestAnimationFrame(() => {
        document.documentElement.style.setProperty('--tr-pointer-x', `${event.clientX}px`);
        document.documentElement.style.setProperty('--tr-pointer-y', `${event.clientY}px`);
        frame = 0;
      });
    }, {passive: true});
  }

  function init() {
    if (!hasDom()) return;
    const {document} = root;
    if (document.documentElement.classList.contains('tr-visual-ready')) return;
    document.documentElement.classList.add('tr-visual-ready');

    const page = markPage(document);
    hardenExternalLinks(document);
    hydrateResumePdf(document);
    setupRuntimeAccessibility(document);
    classifyCards(document);
    classifyCtas(document, page);
    setupSourcesKnowledgeBase(document, page);
    mountTerminal(document, page);
    setupReveal(document);
    setupPointerGlow(document);
  }

  root.TrueRuslanVisual = Object.freeze({
    getPageKind,
    getResumePdfUrl,
    getRevealObserverOptions,
    getTerminalLines,
    normalizeSourcesQuery,
    sourceMatchesSourcesFilters,
    init,
  });
  if (hasDom()) afterApplicationHydration(init);
}(typeof globalThis !== 'undefined' ? globalThis : this));
