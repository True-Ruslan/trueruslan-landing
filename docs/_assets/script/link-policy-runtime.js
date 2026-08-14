(function bootstrapTrueRuslanLinkPolicy(root) {
  'use strict';

  const EXEMPT_SCHEME = /^(?:mailto|tel|javascript|data):/i;
  const POLICY_REL_TOKENS = new Set(['noopener', 'noreferrer']);
  const SAME_SITE_HOSTS = new Set([
    'trueruslan.ru',
    'www.trueruslan.ru',
    'trueruslan.com',
    'www.trueruslan.com',
  ]);
  const SITE_BASE = 'https://trueruslan.ru/';

  function runtimeBase() {
    return root.document?.baseURI || root.location?.href || SITE_BASE;
  }

  function shouldOpenInNewContext(href) {
    const value = String(href || '').trim();
    if (!value || value.startsWith('#')) return false;
    if (EXEMPT_SCHEME.test(value)) return false;

    try {
      const base = new URL(runtimeBase(), SITE_BASE);
      const url = new URL(value, base);
      if (!['http:', 'https:'].includes(url.protocol)) return false;
      if (SAME_SITE_HOSTS.has(url.hostname.toLowerCase())) return false;
      if (url.origin === base.origin) return false;
      return true;
    } catch {
      return false;
    }
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
    for (const required of POLICY_REL_TOKENS) {
      if (seen.has(required)) continue;
      seen.add(required);
      tokens.push(required);
    }
    return tokens.join(' ');
  }

  function stripPolicyRelTokens(value) {
    return String(value || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .filter((token) => !POLICY_REL_TOKENS.has(token.toLowerCase()))
      .join(' ');
  }

  function normalizeAnchor(anchor) {
    if (!anchor || typeof anchor.getAttribute !== 'function' || typeof anchor.setAttribute !== 'function') return false;
    const href = anchor.getAttribute('href') || anchor.href || '';
    const newContext = shouldOpenInNewContext(href);

    if (!newContext) {
      let changed = false;
      if (anchor.getAttribute('target')) {
        anchor.removeAttribute?.('target');
        changed = true;
      }
      const currentRel = anchor.getAttribute('rel');
      const nextRel = stripPolicyRelTokens(currentRel);
      if (currentRel && currentRel !== nextRel) {
        if (nextRel) anchor.setAttribute('rel', nextRel);
        else anchor.removeAttribute?.('rel');
        changed = true;
      }
      return changed;
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
    const observer = new root.MutationObserver(() => {
      applyToDocument(document);
    });
    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['href', 'target', 'rel'],
    });
    return observer;
  }

  function installInteractionGuard(document = root.document) {
    if (!document?.documentElement || typeof document.addEventListener !== 'function') return false;
    if (document.documentElement.dataset.trLinkPolicyInteractionGuard === 'ready') return true;

    const normalizeEventAnchor = (event) => {
      const target = event?.target;
      const anchor = target?.closest?.('a[href]') || (String(target?.tagName || '').toLowerCase() === 'a' ? target : null);
      if (anchor) normalizeAnchor(anchor);
    };

    document.addEventListener('pointerdown', normalizeEventAnchor, true);
    document.addEventListener('click', normalizeEventAnchor, true);
    document.documentElement.dataset.trLinkPolicyInteractionGuard = 'ready';
    return true;
  }

  function init(document = root.document) {
    if (!document?.documentElement) return false;
    applyToDocument(document);
    if (document.documentElement.dataset.trLinkPolicyRuntime === 'ready') {
      installInteractionGuard(document);
      return true;
    }
    document.documentElement.dataset.trLinkPolicyRuntime = 'ready';
    observe(document);
    installInteractionGuard(document);
    return true;
  }

  root.TrueRuslanLinkPolicy = Object.freeze({
    shouldOpenInNewContext,
    mergeRelTokens,
    normalizeAnchor,
    applyToDocument,
    observe,
    installInteractionGuard,
    init,
  });

  if (!root.document) return;
  if (root.document.readyState === 'loading') {
    root.document.addEventListener('DOMContentLoaded', () => init(), {once: true});
  } else {
    init();
  }
}(typeof window !== 'undefined' ? window : globalThis));