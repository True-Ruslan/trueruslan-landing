import test from 'node:test';
import assert from 'node:assert/strict';

import {runProductionSmoke} from './production-smoke.js';

function html({title, canonical, body}) {
  return `<!doctype html><html><head><title>${title}</title><link rel="canonical" href="${canonical}"></head><body>${body}</body></html>`;
}

function createFetch({siteUrl, canonicalSiteUrl = siteUrl}) {
  const base = siteUrl.endsWith('/') ? siteUrl : `${siteUrl}/`;
  const canonicalBase = canonicalSiteUrl.replace(/\/$/, '');

  return async (input) => {
    const url = new URL(input);
    const relative = url.href.startsWith(base) ? url.href.slice(base.length) : url.pathname.replace(/^\//, '');

    if (relative === '' || relative === 'index.html') {
      return new Response(html({
        title: 'TrueRuslan',
        canonical: `${canonicalBase}/`,
        body: '<main><h1>Руслан Немыкин</h1><p>Backend Engineer</p></main>',
      }), {status: 200, headers: {'content-type': 'text/html'}});
    }
    if (relative === 'en/') {
      return new Response(html({
        title: 'TrueRuslan EN',
        canonical: `${canonicalBase}/en/`,
        body: '<main><h1>Ruslan Nemykin</h1></main>',
      }), {status: 200, headers: {'content-type': 'text/html'}});
    }
    if (relative === 'feed.xml') {
      return new Response(
        '<feed xmlns="http://www.w3.org/2005/Atom"><title>TrueRuslan Engineering Notes</title></feed>',
        {status: 200, headers: {'content-type': 'application/atom+xml'}},
      );
    }
    if (relative === 'assets/documents/cv.pdf') {
      return new Response('%PDF-test', {status: 200, headers: {'content-type': 'application/pdf'}});
    }
    if (relative.endsWith('.png')) {
      return new Response('png', {status: 200, headers: {'content-type': 'image/png'}});
    }
    return new Response('<!doctype html><html><body>ok</body></html>', {
      status: 200,
      headers: {'content-type': 'text/html'},
    });
  };
}

test('production smoke verifies custom root canonical identity on RU and EN', async () => {
  const siteUrl = 'https://trueruslan.ru/';
  const report = await runProductionSmoke(siteUrl, {
    fetchImpl: createFetch({siteUrl}),
    expectedOrigin: 'https://trueruslan.ru',
  });

  assert.equal(report.ok, true);
  assert.equal(report.siteIdentity.expectedOrigin, 'https://trueruslan.ru');
  assert.equal(report.siteIdentity.ok, true);
  assert.deepEqual(report.siteIdentity.routes, [
    {route: '/', expectedCanonical: 'https://trueruslan.ru/', actualCanonical: 'https://trueruslan.ru/', ok: true, errors: []},
    {route: 'en/', expectedCanonical: 'https://trueruslan.ru/en/', actualCanonical: 'https://trueruslan.ru/en/', ok: true, errors: []},
  ]);
});

test('production smoke preserves legacy subpath canonical identity', async () => {
  const siteUrl = 'https://true-ruslan.github.io/trueruslan-landing/';
  const report = await runProductionSmoke(siteUrl, {
    fetchImpl: createFetch({siteUrl}),
    expectedOrigin: 'https://true-ruslan.github.io/trueruslan-landing',
  });

  assert.equal(report.ok, true);
  assert.equal(report.siteIdentity.ok, true);
  assert.equal(report.siteIdentity.routes[1].actualCanonical, 'https://true-ruslan.github.io/trueruslan-landing/en/');
});

test('production smoke fails when deployed canonical identity belongs to another site', async () => {
  const siteUrl = 'https://trueruslan.ru/';
  const report = await runProductionSmoke(siteUrl, {
    fetchImpl: createFetch({
      siteUrl,
      canonicalSiteUrl: 'https://true-ruslan.github.io/trueruslan-landing',
    }),
    expectedOrigin: 'https://trueruslan.ru',
  });

  assert.equal(report.ok, false);
  assert.equal(report.siteIdentity.ok, false);
  assert.ok(report.siteIdentity.routes.every((route) => route.ok === false));
  assert.match(report.siteIdentity.routes.flatMap((route) => route.errors).join(' '), /canonical/i);
});
