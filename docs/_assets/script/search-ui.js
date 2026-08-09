(function bootstrapEngineeringSearch(root) {
  'use strict';

  const EXEMPT_SCHEME = /^(?:mailto|tel|javascript|data):/i;
  const SAME_SITE_HOSTS = new Set(['trueruslan.ru', 'www.trueruslan.ru']);
  const SITE_BASE = 'https://trueruslan.ru/';

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
      '.dc-search-page__search-field input, input[type="search"], input[role="searchbox"], input[placeholder="Поиск"], input[placeholder*="search" i]'
    );
  }

  function resolveSiteHome(locationObject = root.location) {
    return new URL('../../', locationObject.href).href;
  }

  function canReturnToReferrer(document, locationObject = root.location) {
    if (!document.referrer) return false;
    try {
      const referrer = new URL(document.referrer);
      return referrer.origin === locationObject.origin && referrer.href !== locationObject.href;
    } catch {
      return false;
    }
  }

  function resolveBackHref(document, locationObject = root.location) {
    if (!canReturnToReferrer(document, locationObject)) return resolveSiteHome(locationObject);
    return new URL(document.referrer).href;
  }

  function shouldOpenInNewContext(href) {
    if (root.TrueRuslanLinkPolicy?.shouldOpenInNewContext) {
      return root.TrueRuslanLinkPolicy.shouldOpenInNewContext(href);
    }

    const value = String(href || '').trim();
    if (!value || value.startsWith('#') || EXEMPT_SCHEME.test(value)) return false;
    try {
      const url = new URL(value, SITE_BASE);
      if (!['http:', 'https:'].includes(url.protocol)) return false;
      return !SAME_SITE_HOSTS.has(url.hostname.toLowerCase());
    } catch {
      return false;
    }
  }

  function applyLinkPolicy(anchor) {
    if (!anchor || typeof anchor.getAttribute !== 'function' || typeof anchor.setAttribute !== 'function') return false;
    if (root.TrueRuslanLinkPolicy?.normalizeAnchor) {
      return root.TrueRuslanLinkPolicy.normalizeAnchor(anchor);
    }

    const href = anchor.getAttribute('href') || anchor.href;
    if (!shouldOpenInNewContext(href)) {
      const target = anchor.getAttribute('target');
      if (target) anchor.removeAttribute?.('target');
      return Boolean(target);
    }

    const tokens = [];
    const seen = new Set();
    const currentRel = String(anchor.getAttribute('rel') || '').trim();
    for (const token of currentRel.split(/\s+/).filter(Boolean)) {
      const normalized = token.toLowerCase();
      if (seen.has(normalized)) continue;
      seen.add(normalized);
      tokens.push(token);
    }
    for (const required of ['noopener', 'noreferrer']) {
      if (seen.has(required)) continue;
      seen.add(required);
      tokens.push(required);
    }

    anchor.setAttribute('target', '_blank');
    anchor.setAttribute('rel', tokens.join(' '));
    return true;
  }

  const applyNewTabPolicy = applyLinkPolicy;

  function createBackControl(document, rootObject = root) {
    const existing = document.querySelector('[data-tr-search-back="true"]');
    if (existing) return existing;
    if (!document.body || !rootObject.location) return null;

    const anchor = document.createElement('a');
    anchor.className = 'tr-search-back';
    anchor.dataset.trSearchBack = 'true';
    anchor.href = resolveBackHref(document, rootObject.location);
    anchor.setAttribute('aria-label', 'Вернуться на предыдущую страницу');
    anchor.setAttribute('title', 'Вернуться назад');
    anchor.innerHTML = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m11.5 5-5 5 5 5M7 10h7" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Назад</span>';
    applyLinkPolicy(anchor);
    document.body.prepend(anchor);
    return anchor;
  }

  function decorate(document) {
    const input = findSearchInput(document);
    if (!input) return false;

    createBackControl(document);
    input.classList.add('tr-search-input');
    if (!input.getAttribute('aria-label')) input.setAttribute('aria-label', 'Поиск по сайту');
    if (!input.getAttribute('placeholder')) input.setAttribute('placeholder', 'Найти проект, технологию или заметку…');

    const inputShell = input.closest('.g-text-input') || input.parentElement;
    if (inputShell) inputShell.classList.add('tr-search-input-shell');

    const fieldWrapper = input.closest('.dc-search-page__search-field-wrapper');
    if (fieldWrapper) fieldWrapper.classList.add('tr-search-field-wrapper');

    const searchButton = document.querySelector('.dc-search-page__search-button');
    if (searchButton) searchButton.classList.add('tr-search-button');

    const app = document.querySelector('.Search');
    if (app) app.classList.add('tr-search-app');

    const resultContainers = document.querySelectorAll(
      '.dc-search-page__content, .dc-search-page__search-results, [class*="result-list" i]'
    );
    for (const container of resultContainers) {
      container.classList.add('tr-search-results');
      for (const anchor of container.querySelectorAll('a')) applyLinkPolicy(anchor);
    }

    const resultItems = document.querySelectorAll(
      '.dc-search-page__search-result, [class*="result-item" i], [class*="search-result" i]'
    );
    for (const item of resultItems) {
      if (item.closest('header, nav')) continue;
      if (item.querySelector('a')) item.classList.add('tr-search-result');
      for (const anchor of item.querySelectorAll('a')) applyLinkPolicy(anchor);
    }

    const emptyStates = document.querySelectorAll('.dc-search-page__search-empty, [class*="no-result" i]');
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

    const observer = new root.MutationObserver(() => {
      mounted = decorate(document);
      if (mounted) observer.disconnect();
    });
    observer.observe(document.documentElement, {childList: true, subtree: true});
    root.setTimeout(() => observer.disconnect(), 8000);
    return false;
  }

  root.TrueRuslanSearchUI = Object.freeze({
    isEditableTarget,
    findSearchInput,
    resolveSiteHome,
    canReturnToReferrer,
    resolveBackHref,
    shouldOpenInNewContext,
    applyLinkPolicy,
    applyNewTabPolicy,
    createBackControl,
    decorate,
    init,
  });

  if (!root.document) return;
  if (root.document.readyState === 'loading') {
    root.document.addEventListener('DOMContentLoaded', () => init(), {once: true});
  } else {
    init();
  }
})(typeof window !== 'undefined' ? window : globalThis);
