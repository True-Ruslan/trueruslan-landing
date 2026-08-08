(function unifyGeneratedHeaderChrome(root) {
  'use strict';

  if (!root.document) return;
  const {document} = root;

  function ancestorsUntil(node, boundary) {
    const result = [];
    let current = node;
    while (current && current !== boundary) {
      result.push(current);
      current = current.parentElement;
    }
    return result;
  }

  function nearestCommonAncestor(nodes, boundary) {
    const valid = nodes.filter(Boolean);
    if (!valid.length) return null;
    const firstAncestors = ancestorsUntil(valid[0], boundary);
    return firstAncestors.find((candidate) => valid.every((node) => candidate.contains(node))) ?? null;
  }

  function findBrand(header) {
    return [...header.querySelectorAll('a[href]')].find((anchor) => anchor.textContent?.trim() === 'TRUERUSLAN_') ?? null;
  }

  function isPrimaryNavigationAnchor(anchor, brand, utilities) {
    if (anchor === brand || utilities.contains(anchor)) return false;
    const text = anchor.textContent?.trim() ?? '';
    if (!text) return false;
    const href = anchor.getAttribute('href') ?? '';
    return !/^https?:\/\//i.test(href) && !href.includes('_search/');
  }

  function normalizeHeader() {
    const utilities = document.querySelector('[data-tr-header-utilities]');
    const header = utilities?.closest('header');
    if (!utilities || !header) return false;

    const brand = findBrand(header);
    if (!brand) return false;

    const primaryAnchors = [...header.querySelectorAll('a[href]')]
      .filter((anchor) => isPrimaryNavigationAnchor(anchor, brand, utilities));
    if (!primaryAnchors.length) return false;

    const nav = nearestCommonAncestor(primaryAnchors, header);
    if (!nav || nav === utilities || nav.contains(utilities) || nav.contains(brand)) return false;

    const inner = nearestCommonAncestor([brand, nav, utilities], header);
    if (!inner) return false;

    header.classList.add('tr-site-header');
    inner.classList.add('tr-site-header__inner');
    brand.classList.add('tr-site-brand');
    nav.classList.add('tr-site-nav');
    header.dataset.trChromeUnified = 'true';
    return true;
  }

  function start() {
    if (normalizeHeader() || typeof root.MutationObserver !== 'function') return;

    const observer = new root.MutationObserver(() => {
      if (!normalizeHeader()) return;
      observer.disconnect();
    });
    observer.observe(document.body, {childList: true, subtree: true});
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, {once: true});
  } else {
    start();
  }
}(typeof globalThis !== 'undefined' ? globalThis : this));
