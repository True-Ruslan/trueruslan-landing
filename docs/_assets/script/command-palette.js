(function bootstrapTrueRuslanCommandPalette(root) {
  'use strict';

  const COMMANDS = Object.freeze([
    {id: 'projects', label: 'Проекты', hint: 'Case studies и активные разработки', target: 'landing/projects.html', keywords: 'projects проекты case studies'},
    {id: 'now', label: 'Сейчас', hint: 'Текущий инженерный фокус', target: 'landing/now.html', keywords: 'now сейчас focus фокус'},
    {id: 'notes', label: 'Engineering Notes', hint: 'Технические заметки и ретроспективы', target: 'landing/notes.html', keywords: 'notes статьи заметки engineering'},
    {id: 'map', label: 'Engineering Map', hint: 'Связи между технологиями, проектами и заметками', target: 'landing/engineering-map.html', keywords: 'map карта skills technologies'},
    {id: 'resume', label: 'Резюме', hint: 'Опыт, стек и web-CV', target: 'landing/resume.html', keywords: 'resume cv резюме опыт'},
    {id: 'search', label: 'Поиск по сайту', hint: 'Открыть существующий локальный поиск Diplodoc', target: '_search/ru/index.html', keywords: 'search поиск найти', kind: 'search'},
    {id: 'github', label: 'GitHub', hint: 'Публичные репозитории', target: 'https://github.com/True-Ruslan', keywords: 'github code repos код', external: true},
  ]);

  function getCommands() {
    return COMMANDS.map((command) => ({...command}));
  }

  function inferSiteBase(currentHref) {
    const url = new URL(currentHref);
    const markers = ['/landing/', '/_search/'];
    for (const marker of markers) {
      const index = url.pathname.indexOf(marker);
      if (index >= 0) {
        url.pathname = `${url.pathname.slice(0, index)}/`;
        url.search = '';
        url.hash = '';
        return url.href;
      }
    }
    if (url.pathname.endsWith('/index.html')) {
      url.pathname = url.pathname.slice(0, -'index.html'.length);
    } else if (!url.pathname.endsWith('/')) {
      url.pathname = url.pathname.slice(0, url.pathname.lastIndexOf('/') + 1);
    }
    url.search = '';
    url.hash = '';
    return url.href;
  }

  function resolveCommandHref(target, currentHref) {
    if (/^https:\/\//.test(target)) return target;
    return new URL(target, inferSiteBase(currentHref)).href;
  }

  function isEditableTarget(target) {
    if (!target || typeof target !== 'object') return false;
    const tag = String(target.tagName || '').toLowerCase();
    return target.isContentEditable === true || tag === 'input' || tag === 'textarea' || tag === 'select';
  }

  function reducedMotion() {
    return typeof root.matchMedia === 'function' && root.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function createPalette(document) {
    const host = document.createElement('div');
    host.className = 'tr-command-palette';
    host.hidden = true;
    host.innerHTML = `
      <div class="tr-command-palette__backdrop" data-tr-command-close></div>
      <section class="tr-command-palette__dialog" role="dialog" aria-modal="true" aria-labelledby="tr-command-title">
        <div class="tr-command-palette__header">
          <span id="tr-command-title">Navigate</span>
          <kbd>Esc</kbd>
        </div>
        <label class="tr-command-palette__search">
          <span class="tr-command-palette__sr-only">Фильтр быстрых переходов</span>
          <input type="search" autocomplete="off" spellcheck="false" placeholder="Куда перейти?" data-tr-command-input>
        </label>
        <div class="tr-command-palette__list" role="listbox" aria-label="Быстрые переходы" data-tr-command-list></div>
        <div class="tr-command-palette__footer">⌘/Ctrl K · / · поиск использует существующий Diplodoc index</div>
      </section>`;
    document.body.appendChild(host);
    return host;
  }

  function createTrigger(document) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tr-command-trigger tr-command-trigger--floating';
    button.setAttribute('aria-label', 'Открыть быстрый переход');
    button.innerHTML = '<span>Быстрый переход</span><kbd>⌘/Ctrl K</kbd>';
    document.body.appendChild(button);
    return button;
  }

  function init() {
    const document = root.document;
    if (!document || document.documentElement.dataset.trCommandReady === 'true') return;
    document.documentElement.dataset.trCommandReady = 'true';

    const palette = createPalette(document);
    const trigger = createTrigger(document);
    const input = palette.querySelector('[data-tr-command-input]');
    const list = palette.querySelector('[data-tr-command-list]');
    let previousFocus = null;
    let visibleCommands = [];

    function render(query = '') {
      const normalized = query.trim().toLowerCase();
      visibleCommands = COMMANDS.filter((command) => !normalized || `${command.label} ${command.hint} ${command.keywords}`.toLowerCase().includes(normalized));
      list.innerHTML = '';
      for (const command of visibleCommands) {
        const link = document.createElement('a');
        link.className = 'tr-command-palette__item';
        link.setAttribute('role', 'option');
        link.href = resolveCommandHref(command.target, root.location.href);
        if (command.external) {
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
        }
        link.innerHTML = `<span><strong>${command.label}</strong><small>${command.hint}</small></span><span aria-hidden="true">${command.kind === 'search' ? '⌕' : '→'}</span>`;
        list.appendChild(link);
      }
      if (!visibleCommands.length) {
        const empty = document.createElement('p');
        empty.className = 'tr-command-palette__empty';
        empty.textContent = 'Быстрых совпадений нет. Откройте «Поиск по сайту» без фильтра для полнотекстового поиска.';
        list.appendChild(empty);
      }
    }

    function open() {
      if (!palette.hidden) return;
      previousFocus = document.activeElement;
      palette.hidden = false;
      document.documentElement.classList.add('tr-command-open');
      if (!reducedMotion()) root.requestAnimationFrame?.(() => palette.classList.add('is-open'));
      else palette.classList.add('is-open');
      input.value = '';
      render();
      input.focus();
    }

    function close() {
      if (palette.hidden) return;
      palette.classList.remove('is-open');
      document.documentElement.classList.remove('tr-command-open');
      const finish = () => {
        palette.hidden = true;
        if (previousFocus && typeof previousFocus.focus === 'function') previousFocus.focus();
      };
      if (reducedMotion()) finish();
      else root.setTimeout(finish, 120);
    }

    function trapFocus(event) {
      if (event.key !== 'Tab' || palette.hidden) return;
      const focusable = [...palette.querySelectorAll('input, a[href], button:not([disabled])')].filter((node) => !node.hidden);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    trigger.addEventListener('click', open);
    palette.addEventListener('click', (event) => {
      if (event.target.closest('[data-tr-command-close]')) close();
    });
    input.addEventListener('input', () => render(input.value));
    input.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown') {
        const first = list.querySelector('a[href]');
        if (first) {
          event.preventDefault();
          first.focus();
        }
      }
    });

    document.addEventListener('keydown', (event) => {
      const commandShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
      const slashShortcut = event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey && !isEditableTarget(event.target);
      if (commandShortcut || slashShortcut) {
        event.preventDefault();
        palette.hidden ? open() : close();
        return;
      }
      if (event.key === 'Escape' && !palette.hidden) {
        event.preventDefault();
        close();
        return;
      }
      trapFocus(event);
    });
  }

  root.TrueRuslanCommandPalette = Object.freeze({
    getCommands,
    inferSiteBase,
    resolveCommandHref,
    isEditableTarget,
    init,
  });

  if (root.document) {
    if (root.document.readyState === 'complete') root.setTimeout(init, 0);
    else root.addEventListener('load', () => root.setTimeout(init, 80), {once: true});
  }
}(typeof globalThis !== 'undefined' ? globalThis : this));
