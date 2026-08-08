(function placeHomepageTerminal(root) {
  'use strict';

  if (!root.document) return;
  const {document} = root;

  function moveTerminalIntoSlot() {
    const slot = document.querySelector('[data-tr-terminal-slot]');
    const terminal = document.querySelector('[data-tr-terminal]');
    if (!slot || !terminal) return false;
    if (terminal.parentElement !== slot) slot.appendChild(terminal);
    return true;
  }

  function start() {
    if (moveTerminalIntoSlot() || typeof root.MutationObserver !== 'function') return;
    const hero = document.querySelector('.tr-home-hero');
    if (!hero) return;

    const observer = new root.MutationObserver(() => {
      if (!moveTerminalIntoSlot()) return;
      observer.disconnect();
    });
    observer.observe(hero, {childList: true, subtree: true});
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, {once: true});
  } else {
    start();
  }
}(typeof globalThis !== 'undefined' ? globalThis : this));
