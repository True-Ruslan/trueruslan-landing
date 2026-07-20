(function bootstrapTrueRuslanVisual(root) {
  'use strict';

  function normalizePath(pathname) {
    if (!pathname) {
      return '/';
    }

    const clean = pathname.split('?')[0].split('#')[0].replace(/\/{2,}/g, '/');
    return clean.length > 1 && clean.endsWith('/') ? clean.slice(0, -1) : clean;
  }

  function getPageKind(pathname) {
    const path = normalizePath(pathname).toLowerCase();

    if (path === '/' || path.endsWith('/index.html') || path === '/index.html') {
      return 'home';
    }

    const knownPages = [
      'projects',
      'about',
      'resume',
      'bibliography',
      'contacts',
      'photos',
    ];

    for (const page of knownPages) {
      if (path.endsWith(`/landing/${page}.html`)) {
        return page;
      }
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

  function hasDom() {
    return typeof root.document !== 'undefined' && root.document !== null;
  }

  function reducedMotion() {
    return typeof root.matchMedia === 'function'
      && root.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function onReady(callback) {
    const {document} = root;
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback, {once: true});
      return;
    }
    callback();
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

  function classifyCards(document) {
    const links = document.querySelectorAll('a[href*="landing/"], a[href*="/landing/"]');

    for (const link of links) {
      const candidate = link.closest(
        'article, li, [class*="basic-card"], [class*="BasicCard"], [class*="card-wrapper"], [class*="Card"]',
      ) || link;

      candidate.classList.add('tr-card');
      link.classList.add('tr-card__link');
    }
  }

  function classifyCtas(document, page) {
    if (page !== 'home') {
      return;
    }

    const links = [...document.querySelectorAll('a[href]')];
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
    if (reducedMotion()) {
      return;
    }

    const rows = [...terminal.querySelectorAll('.tr-terminal__line')];
    for (const row of rows) {
      const text = row.dataset.text || '';
      for (let index = 0; index < text.length; index += 1) {
        row.textContent += text[index];
        await new Promise((resolve) => root.setTimeout(resolve, text.startsWith('$') ? 22 : 12));
      }
      await new Promise((resolve) => root.setTimeout(resolve, text.startsWith('$') ? 100 : 170));
    }
  }

  function mountTerminal(document, page) {
    if (page !== 'home' || document.querySelector('[data-tr-terminal]')) {
      return;
    }

    const heading = [...document.querySelectorAll('h1, h2')]
      .find((node) => node.textContent?.trim().includes('Руслан Немыкин'));

    if (!heading) {
      return;
    }

    const host = heading.closest('section, [class*="header-block"], [class*="HeaderBlock"]')
      || heading.parentElement;

    if (!host) {
      return;
    }

    const terminal = createTerminal(document);
    host.appendChild(terminal);
    root.requestAnimationFrame?.(() => terminal.classList.add('is-mounted'));
    void typeTerminal(terminal);
  }

  function setupReveal(document) {
    const selectors = [
      'main h1',
      'main h2',
      'main h3',
      'main p',
      'main ul',
      'main ol',
      'main table',
      'main iframe',
      'main .tr-card',
      'main [class*="card-layout"]',
      'main [class*="CardLayout"]',
    ];

    const nodes = [...new Set(selectors.flatMap((selector) => [...document.querySelectorAll(selector)]))]
      .filter((node) => !node.closest('.tr-terminal'));

    for (const node of nodes) {
      node.classList.add('tr-reveal');
    }

    if (reducedMotion() || typeof root.IntersectionObserver !== 'function') {
      for (const node of nodes) {
        node.classList.add('is-visible');
      }
      return;
    }

    const observer = new root.IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) {
          continue;
        }
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -7% 0px',
    });

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
    ) {
      return;
    }

    let frame = 0;
    document.addEventListener('pointermove', (event) => {
      if (frame) {
        return;
      }

      frame = root.requestAnimationFrame(() => {
        document.documentElement.style.setProperty('--tr-pointer-x', `${event.clientX}px`);
        document.documentElement.style.setProperty('--tr-pointer-y', `${event.clientY}px`);
        frame = 0;
      });
    }, {passive: true});
  }

  function init() {
    if (!hasDom()) {
      return;
    }

    const {document} = root;
    if (document.documentElement.classList.contains('tr-visual-ready')) {
      return;
    }

    document.documentElement.classList.add('tr-visual-ready');
    const page = markPage(document);

    hardenExternalLinks(document);
    classifyCards(document);
    classifyCtas(document, page);
    mountTerminal(document, page);
    setupReveal(document);
    setupPointerGlow(document);
  }

  root.TrueRuslanVisual = Object.freeze({
    getPageKind,
    getTerminalLines,
    init,
  });

  if (hasDom()) {
    onReady(init);
  }
}(typeof globalThis !== 'undefined' ? globalThis : this));
