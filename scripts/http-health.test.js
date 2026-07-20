import test from 'node:test';
import assert from 'node:assert/strict';

import {
  checkUrl,
  classifyHttpStatus,
} from './http-health.js';

test('classifyHttpStatus distinguishes healthy, reachable anti-bot and broken statuses', () => {
  assert.deepEqual(classifyHttpStatus(200), {ok: true, classification: 'healthy'});
  assert.deepEqual(classifyHttpStatus(302), {ok: true, classification: 'healthy'});
  assert.deepEqual(classifyHttpStatus(401), {ok: true, classification: 'reachable'});
  assert.deepEqual(classifyHttpStatus(403), {ok: true, classification: 'reachable'});
  assert.deepEqual(classifyHttpStatus(429), {ok: true, classification: 'reachable'});
  assert.deepEqual(classifyHttpStatus(404), {ok: false, classification: 'broken'});
  assert.deepEqual(classifyHttpStatus(410), {ok: false, classification: 'broken'});
  assert.deepEqual(classifyHttpStatus(500), {ok: false, classification: 'broken'});
});

test('checkUrl follows bounded redirects and reports final response', async () => {
  const calls = [];
  const fetchImpl = async (url) => {
    calls.push(String(url));
    if (calls.length === 1) {
      return new Response(null, {
        status: 302,
        headers: {location: '/final'},
      });
    }
    return new Response('ok', {
      status: 200,
      headers: {'content-type': 'text/html; charset=utf-8'},
    });
  };

  const result = await checkUrl('https://example.test/start', {
    fetchImpl,
    timeoutMs: 100,
    maxRedirects: 2,
  });

  assert.equal(result.ok, true);
  assert.equal(result.status, 200);
  assert.equal(result.classification, 'healthy');
  assert.equal(result.finalUrl, 'https://example.test/final');
  assert.equal(result.redirects, 1);
  assert.deepEqual(calls, [
    'https://example.test/start',
    'https://example.test/final',
  ]);
});

test('checkUrl fails when redirect limit is exceeded', async () => {
  const fetchImpl = async () => new Response(null, {
    status: 302,
    headers: {location: '/loop'},
  });

  const result = await checkUrl('https://example.test/start', {
    fetchImpl,
    timeoutMs: 100,
    maxRedirects: 1,
  });

  assert.equal(result.ok, false);
  assert.equal(result.classification, 'broken');
  assert.match(result.error, /redirect limit/i);
});

test('checkUrl reports connectivity or timeout errors as broken', async () => {
  const fetchImpl = async () => {
    throw new TypeError('fetch failed');
  };

  const result = await checkUrl('https://example.test', {
    fetchImpl,
    timeoutMs: 100,
  });

  assert.equal(result.ok, false);
  assert.equal(result.classification, 'broken');
  assert.match(result.error, /fetch failed/);
});

test('checkUrl validates expected content type when requested', async () => {
  const fetchImpl = async () => new Response('not-pdf', {
    status: 200,
    headers: {'content-type': 'text/html'},
  });

  const result = await checkUrl('https://example.test/cv.pdf', {
    fetchImpl,
    timeoutMs: 100,
    expectedContentType: 'application/pdf',
  });

  assert.equal(result.ok, false);
  assert.equal(result.classification, 'broken');
  assert.match(result.error, /content-type/i);
});
