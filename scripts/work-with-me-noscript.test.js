import test from 'node:test';
import assert from 'node:assert/strict';

import {
  injectWorkWithMeNoJavaScriptFallback,
  workWithMeNoJavaScriptTargets,
} from './work-with-me-noscript.js';

function encodeState(state) {
  return JSON.stringify(state).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function fixture(locale = 'ru') {
  const title = locale === 'ru' ? 'Работа со мной' : 'Work with me';
  const html = `<p>Intro</p><section data-tr-collaboration-rendered="availability"><time datetime="2026-08-08">2026-08-08</time></section><h2>Engineering</h2><h2>Teaching & Mentoring</h2><p>Context → Scope → Estimate → Implementation → Handover</p><section data-tr-collaboration-rendered="handoff"><a href="https://t.me/TrueRuslan">Telegram</a><a href="mailto:ruslan.nemikin@gmail.com">Email</a></section>`;
  const state = {data: {html, title}};
  return `<!doctype html><html><body><div id="root"></div><noscript data-tr-collaboration-noscript="availability-${locale}">old availability</noscript><noscript data-tr-collaboration-noscript="handoff-${locale}">old handoff</noscript><script id="diplodoc-state">${encodeState(state)}</script></body></html>`;
}

test('Work with me no-JS fallback publishes one semantic page instead of partial duplicated fragments', () => {
  const result = injectWorkWithMeNoJavaScriptFallback(fixture('ru'), {locale: 'ru'});
  assert.match(result, /data-tr-work-with-me-fallback="ru"/);
  assert.match(result, /data-tr-work-with-me-semantic="true"/);
  assert.match(result, /<h1>Работа со мной<\/h1>/);
  assert.match(result, /Engineering/);
  assert.match(result, /Teaching & Mentoring/);
  assert.match(result, /Context → Scope → Estimate → Implementation → Handover/);
  assert.match(result, /https:\/\/t\.me\/TrueRuslan/);
  assert.match(result, /mailto:ruslan\.nemikin@gmail\.com/);
  assert.doesNotMatch(result, /data-tr-collaboration-noscript=/);
  assert.equal((result.match(/data-tr-work-with-me-fallback=/g) ?? []).length, 1);
});

test('Work with me no-JS fallback is idempotent and fail-closed', () => {
  const once = injectWorkWithMeNoJavaScriptFallback(fixture('en'), {locale: 'en'});
  assert.equal(injectWorkWithMeNoJavaScriptFallback(once, {locale: 'en'}), once);
  assert.throws(() => injectWorkWithMeNoJavaScriptFallback('<html><body><div id="root"></div></body></html>', {locale: 'en'}), /Diplodoc state is missing/i);
  assert.throws(() => injectWorkWithMeNoJavaScriptFallback(fixture('en'), {locale: 'de'}), /unsupported Work with me fallback locale/i);
});

test('Work with me no-JS targets remain exactly the controlled RU EN pair', () => {
  assert.deepEqual(workWithMeNoJavaScriptTargets(), [
    {path: 'landing/work-with-me.html', locale: 'ru'},
    {path: 'en/work-with-me.html', locale: 'en'},
  ]);
});
