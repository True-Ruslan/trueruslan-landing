(function bootstrapAiSearchLifecycle(root) {
  'use strict';

  const ACTIVE_MODES = new Set(['search', 'full']);
  const MOUNT_SELECTOR = '.tr-ai-switch [role="switch"]';
  const INPUT_SELECTOR = '.tr-search-input, .dc-search-page__search-field input, input[type="search"]';
  const BUTTON_SELECTOR = '.tr-search-button, .dc-search-page__search-button';
  const MAX_WAIT_MS = 30_000;

  function alreadyMounted() {
    return Boolean(root.document?.querySelector?.(MOUNT_SELECTOR));
  }

  function canRun() {
    const mode = root.document?.documentElement?.dataset?.trAiMode;
    return ACTIVE_MODES.has(mode);
  }

  function liveBindingTarget() {
    const document = root.document;
    if (!document?.querySelector) return {input: null, form: null, button: null};
    const input = root.TrueRuslanSearchUI?.findSearchInput?.(document)
      || document.querySelector(INPUT_SELECTOR);
    const form = input?.closest?.('form') || null;
    const button = form ? null : document.querySelector(BUTTON_SELECTOR);
    return {input, form, button};
  }

  function sameBindingTarget(left, right) {
    return left?.input === right?.input
      && left?.form === right?.form
      && left?.button === right?.button;
  }

  function tryInit({force = false} = {}) {
    if (!force && alreadyMounted()) return true;
    const api = root.TrueRuslanAiSearch;
    if (!api || typeof api.init !== 'function') return false;
    return api.init(root.document) === true;
  }

  function start() {
    if (!canRun()) return false;

    let observedTarget = liveBindingTarget();
    let mounted = alreadyMounted();
    if (!mounted) {
      mounted = tryInit();
      if (mounted) observedTarget = liveBindingTarget();
    }

    if (typeof root.MutationObserver !== 'function' || !root.document?.documentElement) return mounted;

    const observer = new root.MutationObserver(() => {
      const nextTarget = liveBindingTarget();
      const bindingChanged = !sameBindingTarget(observedTarget, nextTarget);
      const mountMissing = !alreadyMounted();
      if (!bindingChanged && !mountMissing) return;

      if (!tryInit({force: bindingChanged})) return;
      observedTarget = liveBindingTarget();
      mounted = true;
    });

    observer.observe(root.document.documentElement, {childList: true, subtree: true});

    if (typeof root.setTimeout === 'function') {
      root.setTimeout(() => observer.disconnect(), MAX_WAIT_MS);
    }
    return mounted;
  }

  root.TrueRuslanAiSearchBootstrap = Object.freeze({start, tryInit});

  if (!root.document) return;
  if (root.document.readyState === 'loading') {
    root.document.addEventListener('DOMContentLoaded', start, {once: true});
  } else {
    start();
  }
})(window);
