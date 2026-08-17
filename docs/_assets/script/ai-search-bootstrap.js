(function bootstrapAiSearchLifecycle(root) {
  'use strict';

  const ACTIVE_MODES = new Set(['search', 'full']);
  const MOUNT_SELECTOR = '.tr-ai-switch [role="switch"]';
  const MAX_WAIT_MS = 30_000;

  function alreadyMounted() {
    return Boolean(root.document?.querySelector?.(MOUNT_SELECTOR));
  }

  function canRun() {
    const mode = root.document?.documentElement?.dataset?.trAiMode;
    return ACTIVE_MODES.has(mode);
  }

  function tryInit() {
    if (alreadyMounted()) return true;
    const api = root.TrueRuslanAiSearch;
    if (!api || typeof api.init !== 'function') return false;
    return api.init(root.document) === true;
  }

  function start() {
    if (!canRun()) return false;
    if (tryInit()) return true;
    if (typeof root.MutationObserver !== 'function' || !root.document?.documentElement) return false;

    let timeoutId = null;
    const observer = new root.MutationObserver(() => {
      if (!tryInit()) return;
      observer.disconnect();
      if (timeoutId !== null && typeof root.clearTimeout === 'function') {
        root.clearTimeout(timeoutId);
        timeoutId = null;
      }
    });

    observer.observe(root.document.documentElement, {childList: true, subtree: true});

    if (typeof root.setTimeout === 'function') {
      timeoutId = root.setTimeout(() => {
        observer.disconnect();
        timeoutId = null;
      }, MAX_WAIT_MS);
    }
    return false;
  }

  root.TrueRuslanAiSearchBootstrap = Object.freeze({start, tryInit});

  if (!root.document) return;
  if (root.document.readyState === 'loading') {
    root.document.addEventListener('DOMContentLoaded', start, {once: true});
  } else {
    start();
  }
})(window);
