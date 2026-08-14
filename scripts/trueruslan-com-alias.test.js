import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';

import {applyLinkPolicy, isAbsoluteSameSiteNavigation, shouldOpenInNewContext} from './link-policy.js';

const WORKER_MODULE = '../infra/cloudflare/trueruslan-com-worker.mjs';
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));

async function loadWorker() {
  return import(WORKER_MODULE);
}

test('link policy treats trueruslan.com as a same-site host', () => {
  assert.equal(shouldOpenInNewContext('https://trueruslan.com/landing/projects/'), false);
  assert.equal(shouldOpenInNewContext('https://www.trueruslan.com/en/publications/'), false);
});

test('host-preserving navigation gate rejects absolute same-site anchors', () => {
  assert.equal(isAbsoluteSameSiteNavigation('https://trueruslan.ru/projects/'), true);
  assert.equal(isAbsoluteSameSiteNavigation('https://www.trueruslan.ru/projects/'), true);
  assert.equal(isAbsoluteSameSiteNavigation('https://trueruslan.com/projects/'), true);
  assert.equal(isAbsoluteSameSiteNavigation('https://www.trueruslan.com/projects/'), true);
  assert.equal(isAbsoluteSameSiteNavigation('/projects/'), false);
  assert.equal(isAbsoluteSameSiteNavigation('../projects/'), false);
  assert.equal(isAbsoluteSameSiteNavigation('https://github.com/True-Ruslan'), false);
});

test('build-time link policy keeps same-site navigation on the current hostname', () => {
  const html = [
    '<!doctype html><html><head>',
    '<link rel="canonical" href="https://trueruslan.ru/projects/">',
    '<link rel="alternate" hreflang="en" href="https://trueruslan.ru/en/projects/">',
    '</head><body>',
    '<a href="https://trueruslan.ru/projects/?source=nav#work">Projects</a>',
    '<a href="https://www.trueruslan.com/en/about/">About</a>',
    '</body></html>',
  ].join('');

  const output = applyLinkPolicy(html);

  assert.match(output, /<a href="\/projects\/\?source=nav#work">Projects<\/a>/);
  assert.match(output, /<a href="\/en\/about\/">About<\/a>/);
  assert.match(output, /<link rel="canonical" href="https:\/\/trueruslan\.ru\/projects\/">/);
  assert.match(output, /<link rel="alternate" hreflang="en" href="https:\/\/trueruslan\.ru\/en\/projects\/">/);
});

test('runtime link policy includes both transparent alias hosts', () => {
  const runtime = fs.readFileSync(
    path.join(SCRIPT_DIR, '..', 'docs', '_assets', 'script', 'link-policy-runtime.js'),
    'utf8',
  );
  assert.match(runtime, /['"]trueruslan\.com['"]/);
  assert.match(runtime, /['"]www\.trueruslan\.com['"]/);
});

test('transparent alias proxies path and query to the canonical .ru origin', async () => {
  const {handleRequest} = await loadWorker();
  const calls = [];
  const response = await handleRequest(
    new Request('https://trueruslan.com/landing/projects/?source=alias'),
    async (request) => {
      calls.push(request);
      return new Response('<html>canonical</html>', {
        status: 200,
        headers: {'content-type': 'text/html; charset=utf-8'},
      });
    },
  );

  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://trueruslan.ru/landing/projects/?source=alias');
  assert.equal(calls[0].method, 'GET');
  assert.equal(calls[0].redirect, 'manual');
  assert.equal(await response.text(), '<html>canonical</html>');
  assert.equal(response.headers.get('content-type'), 'text/html; charset=utf-8');
});

test('transparent alias does not forward browser credentials to the canonical origin', async () => {
  const {handleRequest} = await loadWorker();
  let upstreamRequest;
  await handleRequest(
    new Request('https://trueruslan.com/landing/projects/', {
      headers: {
        authorization: 'Bearer should-not-cross-origins',
        cookie: 'alias-session=private',
        accept: 'text/html',
      },
    }),
    async (request) => {
      upstreamRequest = request;
      return new Response('ok');
    },
  );

  assert.equal(upstreamRequest.headers.get('authorization'), null);
  assert.equal(upstreamRequest.headers.get('cookie'), null);
  assert.equal(upstreamRequest.headers.get('accept'), 'text/html');
});

test('transparent alias accepts the www alias and HEAD requests', async () => {
  const {handleRequest} = await loadWorker();
  let upstreamRequest;
  const response = await handleRequest(
    new Request('https://www.trueruslan.com/landing/notes/?view=compact', {method: 'HEAD'}),
    async (request) => {
      upstreamRequest = request;
      return new Response(null, {status: 204});
    },
  );

  assert.equal(upstreamRequest.url, 'https://trueruslan.ru/landing/notes/?view=compact');
  assert.equal(upstreamRequest.method, 'HEAD');
  assert.equal(response.status, 204);
});

test('canonical-origin redirects are rewritten back to the incoming alias host', async () => {
  const {handleRequest} = await loadWorker();
  const response = await handleRequest(
    new Request('https://trueruslan.com/landing/projects'),
    async () => new Response(null, {
      status: 301,
      headers: {location: 'https://trueruslan.ru/landing/projects/?normalized=1#top'},
    }),
  );

  assert.equal(response.status, 301);
  assert.equal(response.headers.get('location'), 'https://trueruslan.com/landing/projects/?normalized=1#top');
});

test('relative canonical redirects stay on the incoming alias host', async () => {
  const {handleRequest} = await loadWorker();
  const response = await handleRequest(
    new Request('https://www.trueruslan.com/landing/projects'),
    async () => new Response(null, {
      status: 301,
      headers: {location: '/landing/projects/'},
    }),
  );

  assert.equal(response.headers.get('location'), 'https://www.trueruslan.com/landing/projects/');
});

test('external redirects are not rewritten', async () => {
  const {handleRequest} = await loadWorker();
  const response = await handleRequest(
    new Request('https://trueruslan.com/outbound'),
    async () => new Response(null, {
      status: 302,
      headers: {location: 'https://github.com/True-Ruslan'},
    }),
  );

  assert.equal(response.headers.get('location'), 'https://github.com/True-Ruslan');
});

test('transparent alias is fail-closed for unknown hosts', async () => {
  const {handleRequest} = await loadWorker();
  let called = false;
  const response = await handleRequest(
    new Request('https://example.com/landing/projects/'),
    async () => {
      called = true;
      return new Response('unexpected');
    },
  );

  assert.equal(response.status, 421);
  assert.equal(called, false);
});

test('transparent alias only proxies GET and HEAD', async () => {
  const {handleRequest} = await loadWorker();
  let called = false;
  const response = await handleRequest(
    new Request('https://trueruslan.com/landing/projects/', {method: 'POST'}),
    async () => {
      called = true;
      return new Response('unexpected');
    },
  );

  assert.equal(response.status, 405);
  assert.equal(response.headers.get('allow'), 'GET, HEAD');
  assert.equal(called, false);
});

test('transparent alias does not rewrite canonical HTML content', async () => {
  const {handleRequest} = await loadWorker();
  const html = '<link rel="canonical" href="https://trueruslan.ru/landing/projects/">';
  const response = await handleRequest(
    new Request('https://trueruslan.com/landing/projects/'),
    async () => new Response(html, {headers: {'content-type': 'text/html'}}),
  );

  assert.equal(await response.text(), html);
});
