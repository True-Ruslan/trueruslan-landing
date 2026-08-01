(function bootstrapTrueRuslanHeaderListSemantics(root) {
  'use strict';

  function hasDom() {
    return typeof root.document !== 'undefined' && root.document !== null;
  }

  function copyAttributes(source, target) {
    for (const attribute of source.attributes) {
      target.setAttribute(attribute.name, attribute.value);
    }
  }

  function removeEmptyListItems(list, protectedItem) {
    for (const child of [...list.children]) {
      if (child === protectedItem || child.tagName !== 'LI') continue;
      const interactive = child.querySelector('a[href], button, details, input, select, textarea');
      if (!interactive && !child.textContent?.trim()) child.remove();
    }
  }

  function normalizeListUtilityGroups(document) {
    let changed = 0;
    for (const group of [...document.querySelectorAll('[data-tr-header-utilities]')]) {
      const list = group.parentElement;
      if (!list?.matches?.('ul, ol') || group.tagName === 'LI') continue;

      const item = document.createElement('li');
      copyAttributes(group, item);
      while (group.firstChild) item.appendChild(group.firstChild);
      group.replaceWith(item);
      removeEmptyListItems(list, item);
      changed += 1;
    }
    return changed;
  }

  function init() {
    if (hasDom()) normalizeListUtilityGroups(root.document);
  }

  function observe() {
    if (!hasDom() || typeof root.MutationObserver !== 'function') return;
    let scheduled = false;
    const observer = new root.MutationObserver(() => {
      if (scheduled) return;
      scheduled = true;
      const run = () => {
        scheduled = false;
        normalizeListUtilityGroups(root.document);
      };
      if (typeof root.requestAnimationFrame === 'function') root.requestAnimationFrame(run);
      else root.setTimeout(run, 0);
    });
    observer.observe(root.document.documentElement, {childList: true, subtree: true});
  }

  root.TrueRuslanHeaderListSemantics = Object.freeze({normalizeListUtilityGroups, init});

  if (hasDom()) {
    if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', init, {once: true});
    else init();
    root.addEventListener('load', () => root.setTimeout(init, 100), {once: true});
    observe();
  }
}(typeof globalThis !== 'undefined' ? globalThis : this));
