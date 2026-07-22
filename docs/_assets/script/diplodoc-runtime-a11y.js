(function bootstrapDiplodocRuntimeA11y(root) {
  'use strict';

  function getCodeButtonLabel(button) {
    if (!button?.classList) return null;
    if (button.classList.contains('yfm-clipboard-button')) return 'Копировать код';
    if (button.classList.contains('yfm-wrapping-button')) return 'Переключить перенос строк кода';
    return null;
  }

  function hasAccessibleName(button) {
    return Boolean(
      button?.getAttribute?.('aria-label')
      || button?.getAttribute?.('aria-labelledby')
      || button?.getAttribute?.('title')
      || button?.textContent?.trim(),
    );
  }

  function repairCodeButtons(document) {
    if (!document?.querySelectorAll) return 0;
    let repaired = 0;
    for (const button of document.querySelectorAll('button.yfm-code-button')) {
      if (hasAccessibleName(button)) continue;
      const label = getCodeButtonLabel(button);
      if (!label) continue;
      button.setAttribute('aria-label', label);
      repaired += 1;
    }
    return repaired;
  }

  function init() {
    const {document} = root;
    if (!document?.documentElement) return;
    repairCodeButtons(document);

    if (typeof root.MutationObserver !== 'function') return;
    let scheduled = false;
    const observer = new root.MutationObserver(() => {
      if (scheduled) return;
      scheduled = true;
      const run = () => {
        scheduled = false;
        repairCodeButtons(document);
      };
      if (typeof root.requestAnimationFrame === 'function') root.requestAnimationFrame(run);
      else root.setTimeout(run, 0);
    });
    observer.observe(document.documentElement, {childList: true, subtree: true});
  }

  root.TrueRuslanDiplodocA11y = Object.freeze({getCodeButtonLabel, repairCodeButtons, init});

  if (root.document) {
    if (root.document.readyState === 'complete') root.setTimeout(init, 0);
    else root.addEventListener('load', () => root.setTimeout(init, 80), {once: true});
  }
}(typeof globalThis !== 'undefined' ? globalThis : this));
