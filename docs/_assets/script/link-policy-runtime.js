(function bootstrapTrueRuslanLinkPolicy(root) {
  'use strict';

  const EXEMPT_SCHEME = /^(?:mailto|tel|javascript|data):/i;

  function shouldOpenInNewContext(href) {
    const value = String(href || '').trim();
    if (!value || value.startsWith('#')) return false;
    return !EXEMPT_SCHEME.test(value);
  }

  function mergeRelTokens(value) {
    const tokens = [];
    const seen = new Set();
    for (const token of String(value || '').trim().split(/\s+/).filter(Boolean)) {
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
    return tokens.join(' ');
  }

  function normalizeAnchor(anchor) {
    if (!anchor || typeof anchor.getAttribute !== 'function' || typeof anchor.setAttribute !== 'function') return false;
    const href = anchor.getAttribute('href') || anchor.href || '';
    if (!shouldOpenInNewContext(href)) {
      if (String(href).trim().startsWith('#') && anchor.getAttribute('target') === '_blank') {
        anchor.removeAttribute?.('target');
        return true;
      }
      return false;
    }

    let changed = false;
    if (anchor.getAttribute('target') !== '_blank') {
      anchor.setAttribute('target', '_blank');
      changed = true;
    }
    const nextRel = mergeRelTokens(anchor.getAttribute('rel'));
    if (anchor.getAttribute('rel') !== nextRel) {
      anchor.setAttribute('rel', nextRel);
      changed = true;
    }
    return changed;
  }

  function applyToDocument(document) {
    if (!document?.querySelectorAll) return 0;
    let changed = 0;
    for (const anchor of document.querySelectorAll('a[href]')) {
      if (normalizeAnchor(anchor)) changed += 1;
    }
    return changed;
  }

  function observe(document = root.document) {
    if (!document?.documentElement || typeof root.MutationObserver !== 'function') return null;
    let scheduled = false;
    const repair = () => {
      scheduled = false;
      applyToDocument(document);
    };
    const schedule = () => {
      if (scheduled) return;
      scheduled = true;
      if (typeof root.requestAnimationFrame === 'function') root.requestAnimationFrame(repair);
      else root.setTimeout(repair, 0);
    };
    const observer = new root.MutationObserver(schedule);
    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['href', 'target', 'rel'],
    });
    return observer;
  }

  function init(document = root.document) {
    if (!document?.documentElement) return false;
    applyToDocument(document);
    if (document.documentElement.dataset.trLinkPolicyRuntime === 'ready') return true;
    document.documentElement.dataset.trLinkPolicyRuntime = 'ready';
    observe(document);
    return true;
  }

  root.TrueRuslanLinkPolicy = Object.freeze({
    shouldOpenInNewContext,
    mergeRelTokens,
    normalizeAnchor,
    applyToDocument,
    observe,
    init,
  });

  if (!root.document) return;
  if (root.document.readyState === 'loading') {
    root.document.addEventListener('DOMContentLoaded', () => init(), {once: true});
  } else {
    init();
  }
}(typeof window !== 'undefined' ? window : globalThis));
