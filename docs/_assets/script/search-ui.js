(function bootstrapEngineeringSearch(root) {
  'use strict';

  function isEditableTarget(target) {
    if (!target || typeof target !== 'object') return false;
    const tagName = String(target.tagName || '').toLowerCase();
    return tagName === 'input'
      || tagName === 'textarea'
      || tagName === 'select'
      || target.isContentEditable === true;
  }

  function findSearchInput(document) {
    return document.querySelector(
      'input[type="search"], input[role="searchbox"], input[placeholder*="search" i], input[placeholder*="поиск" i]'
    );
  }

  function decorate(document) {
    const input = findSearchInput(document);
    if (!input) return false;

    input.classList.add('tr-search-input');
    if (!input.getAttribute('aria-label')) input.setAttribute('aria-label', 'Поиск по сайту');
    if (!input.getAttribute('placeholder')) input.setAttribute('placeholder', 'Найти проект, технологию или заметку…');

    const parent = input.parentElement;
    if (parent) parent.classList.add('tr-search-input-shell');

    const resultContainers = document.querySelectorAll('[class*="results" i], [class*="result-list" i]');
    for (const container of resultContainers) container.classList.add('tr-search-results');

    const resultItems = document.querySelectorAll('[class*="result-item" i], [class*="search-result" i], article');
    for (const item of resultItems) {
      if (item.closest('header, nav')) continue;
      if (item.querySelector('a')) item.classList.add('tr-search-result');
    }

    const emptyStates = document.querySelectorAll('[class*="empty" i], [class*="no-result" i]');
    for (const node of emptyStates) node.classList.add('tr-search-empty');

    document.documentElement.setAttribute('data-tr-search-enhanced', 'true');
    document.body?.setAttribute('data-tr-search-enhanced', 'true');
    return true;
  }

  function installShortcut(rootObject, document) {
    if (document.documentElement.dataset.trSearchShortcut === 'ready') return;
    document.documentElement.dataset.trSearchShortcut = 'ready';

    rootObject.addEventListener('keydown', (event) => {
      if (event.defaultPrevented || isEditableTarget(event.target)) return;
      const isSlash = event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey;
      const isCommandK = String(event.key).toLowerCase() === 'k' && (event.ctrlKey || event.metaKey) && !event.altKey;
      if (!isSlash && !isCommandK) return;

      const input = findSearchInput(document);
      if (!input) return;
      event.preventDefault();
      input.focus({preventScroll: false});
      if (typeof input.select === 'function' && input.value) input.select();
    });
  }

  function init(document = root.document) {
    if (!document?.documentElement) return false;
    installShortcut(root, document);

    let mounted = decorate(document);
    if (mounted || typeof root.MutationObserver !== 'function') return mounted;

    let attempts = 0;
    const observer = new root.MutationObserver(() => {
      attempts += 1;
      mounted = decorate(document);
      if (mounted || attempts >= 80) observer.disconnect();
    });
    observer.observe(document.documentElement, {childList: true, subtree: true});
    root.setTimeout(() => observer.disconnect(), 5000);
    return false;
  }

  root.TrueRuslanSearchUI = Object.freeze({isEditableTarget, findSearchInput, decorate, init});

  if (!root.document) return;
  if (root.document.readyState === 'loading') {
    root.document.addEventListener('DOMContentLoaded', () => init(), {once: true});
  } else {
    init();
  }
})(typeof window !== 'undefined' ? window : globalThis);
