import test from 'node:test';
import assert from 'node:assert/strict';

import {injectAnalyticsIntoHtml} from './analytics.js';
import {deriveProductionEndpoints, runProductionSmoke} from './production-smoke.js';

const fakeToken = 'testAnalyticsToken0123456789ABCDEF';
const otherToken = 'otherAnalyticsToken0123456789ABCDE';
const validPolicy = Object.freeze({
  provider: 'cloudflare-web-analytics',
  measurement: 'pageviews-and-rum',
  activation: 'token-required',
  customEvents: false,
  cookies: false,
  persistentStorage: false,
  crossSiteTracking: false,
  sessionReplay: false,
});

function homepageHtml({analytics = false, token = fakeToken} = {}) {
  const source = '<!doctype html><html><head><title>TrueRuslan</title></head><body><main><h1>Руслан Немыкин</h1><p>Backend Engineer</p></main></body></html>';
  return analytics ? injectAnalyticsIntoHtml(source, validPolicy, token) : source;
}

function englishHtml({analytics = false, token = fakeToken} = {}) {
  const source = '<!doctype html><html lang="en"><head><title>TrueRuslan EN</title></head><body><main><h1>Ruslan Nemykin</h1></main></body></html>';
  return analytics ? injectAnalyticsIntoHtml(source, validPolicy, token) : source;
}

function createFetch({ruHtml = homepageHtml(), enHtml = englishHtml()} = {}) {
  return async (input) => {
    const url = new URL(input);
    const pathname = url.pathname;
    if (pathname.endsWith('/feed.xml')) {
      return new Response(
        '<feed xmlns="http://www.w3.org/2005/Atom"><title>TrueRuslan Engineering Notes</title></feed>',
        {status: 200, headers: {'content-type': 'application/atom+xml'}},
      );
    }
    if (pathname.endsWith('/assets/documents/cv.pdf')) {
      return new Response('%PDF-test', {status: 200, headers: {'content-type': 'application/pdf'}});
    }
    if (pathname.endsWith('.png')) {
      return new Response('png', {status: 200, headers: {'content-type': 'image/png'}});
    }
    if (pathname.endsWith('/en/')) {
      return new Response(enHtml, {status: 200, headers: {'content-type': 'text/html'}});
    }
    if (pathname.endsWith('/site/') || pathname.endsWith('/site/index.html')) {
      return new Response(ruHtml, {status: 200, headers: {'content-type': 'text/html'}});
    }
    return new Response('<!doctype html><html><body>ok</body></html>', {
      status: 200,
      headers: {'content-type': 'text/html'},
    });
  };
}

test('deriveProductionEndpoints supports Pages subpath with or without trailing slash', () => {
  const expected = [
    'https://true-ruslan.github.io/trueruslan-landing/',
    'https://true-ruslan.github.io/trueruslan-landing/landing/projects/',
    'https://true-ruslan.github.io/trueruslan-landing/landing/now/',
    'https://true-ruslan.github.io/trueruslan-landing/landing/engineering-map/',
    'https://true-ruslan.github.io/trueruslan-landing/landing/notes/',
    'https://true-ruslan.github.io/trueruslan-landing/photos/',
    'https://true-ruslan.github.io/trueruslan-landing/feed.xml',
    'https://true-ruslan.github.io/trueruslan-landing/landing/resume/',
    'https://true-ruslan.github.io/trueruslan-landing/assets/documents/cv.pdf',
    'https://true-ruslan.github.io/trueruslan-landing/assets/og/home.png',
    'https://true-ruslan.github.io/trueruslan-landing/assets/og/engineering-map.png',
    'https://true-ruslan.github.io/trueruslan-landing/_assets/style/custom.css',
    'https://true-ruslan.github.io/trueruslan-landing/_assets/style/command-palette.css',
    'https://true-ruslan.github.io/trueruslan-landing/_assets/style/photo-stories.css',
    'https://true-ruslan.github.io/trueruslan-landing/_assets/script/custom.js',
    'https://true-ruslan.github.io/trueruslan-landing/_assets/script/command-palette.js',
    'https://true-ruslan.github.io/trueruslan-landing/_assets/script/photo-stories.js',
    'https://true-ruslan.github.io/trueruslan-landing/favicon.svg',
  ];

  assert.deepEqual(
    deriveProductionEndpoints('https://true-ruslan.github.io/trueruslan-landing').map((entry) => entry.url),
    expected,
  );
  assert.deepEqual(
    deriveProductionEndpoints('https://true-ruslan.github.io/trueruslan-landing/').map((entry) => entry.url),
    expected,
  );
});

test('deriveProductionEndpoints marks binary assets with expected content types', () => {
  const endpoints = deriveProductionEndpoints('https://example.test/site/');
  const pdf = endpoints.find((entry) => entry.name === 'Resume PDF');
  const homepageOg = endpoints.find((entry) => entry.name === 'Homepage OpenGraph card');
  const mapOg = endpoints.find((entry) => entry.name === 'Engineering Map OpenGraph card');

  assert.equal(pdf.expectedContentType, 'application/pdf');
  assert.equal(homepageOg.expectedContentType, 'image/png');
  assert.equal(mapOg.expectedContentType, 'image/png');
});

test('deriveProductionEndpoints monitors now, feed, command palette and photo stories resources', () => {
  const endpoints = deriveProductionEndpoints('https://example.test/site/');
  assert.ok(endpoints.some((entry) => entry.name === 'Now'));
  assert.ok(endpoints.some((entry) => entry.name === 'Atom feed'));
  assert.ok(endpoints.some((entry) => entry.name === 'Photo Stories'));
  assert.ok(endpoints.some((entry) => entry.name === 'Command palette stylesheet'));
  assert.ok(endpoints.some((entry) => entry.name === 'Command palette script'));
  assert.ok(endpoints.some((entry) => entry.name === 'Photo Stories stylesheet'));
  assert.ok(endpoints.some((entry) => entry.name === 'Photo Stories script'));
});

test('production smoke preserves availability behavior when analytics expectation is ignored', async () => {
  const report = await runProductionSmoke('https://example.test/site/', {
    fetchImpl: createFetch(),
  });

  assert.equal(report.ok, true);
  assert.equal('analytics' in report, false);
});

test('production smoke verifies enabled analytics on RU and EN without reporting token', async () => {
  const report = await runProductionSmoke('https://example.test/site/', {
    fetchImpl: createFetch({
      ruHtml: homepageHtml({analytics: true}),
      enHtml: englishHtml({analytics: true}),
    }),
    analyticsExpectation: 'enabled',
    analyticsToken: fakeToken,
  });

  assert.equal(report.ok, true);
  assert.equal(report.analytics.expectation, 'enabled');
  assert.deepEqual(report.analytics.routes.map((entry) => entry.route), ['/', 'en/']);
  assert.ok(report.analytics.routes.every((entry) => entry.ok && entry.beaconCount === 1));
  assert.doesNotMatch(JSON.stringify(report), new RegExp(fakeToken));
});

test('production smoke verifies disabled analytics on RU and EN', async () => {
  const report = await runProductionSmoke('https://example.test/site/', {
    fetchImpl: createFetch(),
    analyticsExpectation: 'disabled',
  });

  assert.equal(report.ok, true);
  assert.equal(report.analytics.expectation, 'disabled');
  assert.ok(report.analytics.routes.every((entry) => entry.ok && entry.beaconCount === 0));
});

test('production smoke fails when enabled analytics is missing or duplicated', async () => {
  const missing = await runProductionSmoke('https://example.test/site/', {
    fetchImpl: createFetch(),
    analyticsExpectation: 'enabled',
    analyticsToken: fakeToken,
  });
  assert.equal(missing.ok, false);
  assert.ok(missing.analytics.routes.every((entry) => entry.ok === false));

  const ru = homepageHtml({analytics: true});
  const script = ru.match(/<script[^>]*data-tr-analytics="cloudflare-web-analytics"[^>]*><\/script>/i)?.[0];
  const duplicateRu = ru.replace('</head>', `${script}</head>`);
  const duplicated = await runProductionSmoke('https://example.test/site/', {
    fetchImpl: createFetch({
      ruHtml: duplicateRu,
      enHtml: englishHtml({analytics: true}),
    }),
    analyticsExpectation: 'enabled',
    analyticsToken: fakeToken,
  });
  assert.equal(duplicated.ok, false);
  assert.equal(duplicated.analytics.routes.find((entry) => entry.route === '/').beaconCount, 2);
});

test('production smoke fails exact-token verification without exposing either token', async () => {
  const report = await runProductionSmoke('https://example.test/site/', {
    fetchImpl: createFetch({
      ruHtml: homepageHtml({analytics: true}),
      enHtml: englishHtml({analytics: true}),
    }),
    analyticsExpectation: 'enabled',
    analyticsToken: otherToken,
  });

  assert.equal(report.ok, false);
  assert.match(report.analytics.routes.flatMap((entry) => entry.errors).join(' '), /token does not match/i);
  const serialized = JSON.stringify(report);
  assert.doesNotMatch(serialized, new RegExp(fakeToken));
  assert.doesNotMatch(serialized, new RegExp(otherToken));
});
