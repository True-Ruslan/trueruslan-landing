(function initPhotoStoriesModule(global) {
  'use strict';

  const HASH_RE = /^(photo|archive)-[a-z0-9]+(?:-[a-z0-9]+)*$/i;

  function parsePhotoHash(hash) {
    if (typeof hash !== 'string' || !hash.startsWith('#')) return null;
    let value;
    try {
      value = decodeURIComponent(hash.slice(1));
    } catch {
      return null;
    }
    return HASH_RE.test(value) ? value : null;
  }

  function buildPhotoHash(id) {
    return `#${String(id || '')}`;
  }

  function nextPhotoIndex(current, delta, length) {
    if (!Number.isInteger(length) || length <= 0) return -1;
    return ((current + delta) % length + length) % length;
  }

  function isEditableTarget(target) {
    if (!target || typeof target !== 'object') return false;
    const tag = String(target.tagName || '').toUpperCase();
    return target.isContentEditable === true || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
  }

  function init() {
    if (typeof document === 'undefined') return null;
    const page = document.querySelector('[data-tr-photo-page]');
    if (!page || page.dataset.trPhotoStoriesReady === 'true') return null;
    page.dataset.trPhotoStoriesReady = 'true';

    initFilters(page);
    const lightbox = initLightbox(page);
    return {lightbox};
  }

  function initFilters(page) {
    const root = page.querySelector('[data-tr-photo-filters]');
    if (!root) return;
    const buttons = Array.from(root.querySelectorAll('[data-tr-photo-filter]'));
    const cards = Array.from(page.querySelectorAll('[data-tr-photo-album-card]'));

    root.addEventListener('click', (event) => {
      const button = event.target.closest('[data-tr-photo-filter]');
      if (!button || !root.contains(button)) return;
      const selected = button.dataset.trPhotoFilter || 'all';

      for (const item of buttons) {
        const active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', active ? 'true' : 'false');
      }
      for (const card of cards) {
        card.hidden = selected !== 'all' && card.dataset.category !== selected;
      }
    });
  }

  function initLightbox(page) {
    const root = page.querySelector('[data-tr-photo-lightbox-root]')
      || document.querySelector('[data-tr-photo-lightbox-root]');
    if (!root) return null;

    const dialog = root.querySelector('.tr-photo-lightbox__dialog');
    const image = root.querySelector('[data-tr-photo-lightbox-image]');
    const title = root.querySelector('[data-tr-photo-lightbox-title]');
    const meta = root.querySelector('[data-tr-photo-lightbox-meta]');
    const text = root.querySelector('[data-tr-photo-lightbox-text]');
    const counter = root.querySelector('[data-tr-photo-lightbox-counter]');
    const previousButton = root.querySelector('[data-tr-photo-lightbox-prev]');
    const nextButton = root.querySelector('[data-tr-photo-lightbox-next]');
    const closeButtons = Array.from(root.querySelectorAll('[data-tr-photo-lightbox-close]'));
    const links = Array.from(page.querySelectorAll('[data-tr-photo-lightbox]'));

    let group = [];
    let currentIndex = -1;
    let origin = null;
    let previousHash = '';
    let touchStartX = 0;
    let touchStartY = 0;
    let suppressHashOpen = false;

    function groupFor(link) {
      const groupId = link.dataset.trPhotoGroup || 'default';
      return links.filter((candidate) => (candidate.dataset.trPhotoGroup || 'default') === groupId);
    }

    function updateControls() {
      const multiple = group.length > 1;
      previousButton.hidden = !multiple;
      nextButton.hidden = !multiple;
    }

    function preloadAdjacent() {
      if (group.length < 2 || typeof Image === 'undefined') return;
      for (const delta of [-1, 1]) {
        const index = nextPhotoIndex(currentIndex, delta, group.length);
        const href = group[index]?.href;
        if (!href) continue;
        const preload = new Image();
        preload.src = href;
      }
    }

    function renderCurrent({updateHash = true} = {}) {
      const link = group[currentIndex];
      if (!link) return;
      const thumbnail = link.querySelector('img');
      const id = link.dataset.photoId || '';
      image.src = link.href;
      image.alt = thumbnail?.alt || '';
      title.textContent = link.dataset.photoTitle || '';
      meta.textContent = link.dataset.photoMeta || '';
      text.textContent = link.dataset.photoCaption || '';
      counter.textContent = `${String(currentIndex + 1).padStart(2, '0')} / ${String(group.length).padStart(2, '0')}`;
      updateControls();

      if (updateHash && id && typeof history !== 'undefined' && typeof location !== 'undefined') {
        suppressHashOpen = true;
        history.replaceState(history.state, '', `${location.pathname}${location.search}${buildPhotoHash(id)}`);
        queueMicrotask(() => { suppressHashOpen = false; });
      }
      preloadAdjacent();
    }

    function open(link, {fromHash = false} = {}) {
      if (!page.isConnected || !root.isConnected) return;
      group = groupFor(link);
      currentIndex = group.indexOf(link);
      if (currentIndex < 0) return;
      origin = fromHash ? null : link;
      previousHash = fromHash ? '' : (typeof location !== 'undefined' ? location.hash : '');
      root.hidden = false;
      document.body.classList.add('tr-photo-lightbox-open');
      renderCurrent({updateHash: !fromHash});
      dialog?.focus({preventScroll: true});
    }

    function restoreUrl() {
      if (typeof history === 'undefined' || typeof location === 'undefined') return;
      suppressHashOpen = true;
      history.replaceState(history.state, '', `${location.pathname}${location.search}${previousHash || ''}`);
      queueMicrotask(() => { suppressHashOpen = false; });
    }

    function close() {
      if (root.hidden) return;
      root.hidden = true;
      image.removeAttribute('src');
      document.body.classList.remove('tr-photo-lightbox-open');
      restoreUrl();
      const focusTarget = origin;
      group = [];
      currentIndex = -1;
      origin = null;
      if (focusTarget && typeof focusTarget.focus === 'function') focusTarget.focus({preventScroll: true});
    }

    function navigate(delta) {
      const next = nextPhotoIndex(currentIndex, delta, group.length);
      if (next < 0) return;
      currentIndex = next;
      renderCurrent();
    }

    function focusableElements() {
      return Array.from(dialog?.querySelectorAll('button:not([hidden]):not([disabled]), [href], [tabindex]:not([tabindex="-1"])') || [])
        .filter((element) => !element.hidden);
    }

    function trapFocus(event) {
      if (event.key !== 'Tab' || root.hidden) return;
      const focusables = focusableElements();
      if (focusables.length === 0) {
        event.preventDefault();
        dialog?.focus();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    function openFromCurrentHash() {
      if (!page.isConnected || !root.isConnected || suppressHashOpen || !root.hidden || typeof location === 'undefined') return;
      const id = parsePhotoHash(location.hash);
      if (!id) return;
      const link = links.find((candidate) => candidate.dataset.photoId === id);
      if (link) open(link, {fromHash: true});
    }

    page.addEventListener('click', (event) => {
      const link = event.target.closest('[data-tr-photo-lightbox]');
      if (!link || !page.contains(link)) return;
      if (event.button != null && event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      open(link);
    });

    for (const button of closeButtons) button.addEventListener('click', close);
    previousButton?.addEventListener('click', () => navigate(-1));
    nextButton?.addEventListener('click', () => navigate(1));

    root.addEventListener('keydown', (event) => {
      trapFocus(event);
      if (event.defaultPrevented || isEditableTarget(event.target)) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        navigate(-1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        navigate(1);
      }
    });

    root.addEventListener('touchstart', (event) => {
      if (event.touches.length !== 1) return;
      touchStartX = event.touches[0].clientX;
      touchStartY = event.touches[0].clientY;
    }, {passive: true});

    root.addEventListener('touchend', (event) => {
      if (event.changedTouches.length !== 1) return;
      const deltaX = event.changedTouches[0].clientX - touchStartX;
      const deltaY = event.changedTouches[0].clientY - touchStartY;
      if (Math.abs(deltaX) < 48 || Math.abs(deltaX) <= Math.abs(deltaY) * 1.2) return;
      navigate(deltaX < 0 ? 1 : -1);
    }, {passive: true});

    if (typeof global.addEventListener === 'function') global.addEventListener('hashchange', openFromCurrentHash);
    openFromCurrentHash();

    return {open, close, navigate};
  }

  function observeHydration() {
    if (typeof document === 'undefined' || typeof global.MutationObserver !== 'function') return;
    let scheduled = false;
    const observer = new global.MutationObserver(() => {
      if (scheduled) return;
      scheduled = true;
      const run = () => {
        scheduled = false;
        init();
      };
      if (typeof global.requestAnimationFrame === 'function') global.requestAnimationFrame(run);
      else global.setTimeout(run, 0);
    });
    observer.observe(document.documentElement, {childList: true, subtree: true});
  }

  const api = {parsePhotoHash, buildPhotoHash, nextPhotoIndex, isEditableTarget, init};
  global.TrueRuslanPhotoStories = api;

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once: true});
    else init();
    if (typeof global.addEventListener === 'function') {
      global.addEventListener('load', () => {
        init();
        global.setTimeout(init, 80);
      }, {once: true});
    }
    observeHydration();
  }
})(globalThis);
