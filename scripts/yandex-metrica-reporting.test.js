import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildYandexMetricaReportUrl,
  enrichMeasurementWithYandexMetrica,
  fetchYandexMetricaTotals,
  normalizeYandexMetricaCounterId,
  normalizeYandexMetricaOAuthToken,
} from './yandex-metrica-reporting.js';

const COUNTER_ID = '12345678';
const TOKEN = 'test-oauth-token-value';

function response(body, {ok = true, status = 200} = {}) {
  return {
    ok,
    status,
    async json() {
      return body;
    },
  };
}

function validApiBody(overrides = {}) {
  return {
    query: {
      metrics: ['ym:s:visits', 'ym:s:pageviews', 'ym:s:users'],
      date1: '2026-08-05',
      date2: '2026-08-18',
      dimensions: [],
    },
    sampled: false,
    contains_sensitive_data: false,
    sample_share: 1,
    sample_size: 58,
    sample_space: 58,
    data_lag: 120,
    totals: [58, 104, 46],
    ...overrides,
  };
}

function measurementFixture() {
  return {
    schemaVersion: 1,
    evidenceClass: 'operator-observed',
    cleanUrlMigrationAt: '2026-08-05T00:00:00Z',
    baseline: {
      window: {start: '2026-07-22T00:00:00Z', end: '2026-08-04T23:59:59Z'},
      cloudflare: {pageviews: 80},
      search: {
        google: {impressions: 30, clicks: 3, indexedCleanUrls: 4, indexedLegacyHtmlUrls: 11},
        yandex: {impressions: 20, clicks: 2, indexedCleanUrls: 3, indexedLegacyHtmlUrls: 12},
      },
    },
    current: {
      window: {start: '2026-08-05T00:00:00Z', end: '2026-08-18T23:59:59Z'},
      cloudflare: {pageviews: 110},
      search: {
        google: {impressions: 45, clicks: 4, indexedCleanUrls: 10, indexedLegacyHtmlUrls: 5},
        yandex: {impressions: 32, clicks: 3, indexedCleanUrls: 9, indexedLegacyHtmlUrls: 6},
      },
    },
    operatorAssessment: {
      aggregateTrafficSufficient: true,
      assessedAt: '2026-08-19T08:00:00Z',
      basis: 'Two complete aggregate windows are available for descriptive review.',
    },
  };
}

test('Yandex Metrica credentials are normalized without weakening header safety', () => {
  assert.equal(normalizeYandexMetricaCounterId(COUNTER_ID), COUNTER_ID);
  assert.throws(() => normalizeYandexMetricaCounterId('0'), /counter id/i);
  assert.throws(() => normalizeYandexMetricaCounterId('12x'), /counter id/i);

  assert.equal(normalizeYandexMetricaOAuthToken(TOKEN), TOKEN);
  assert.throws(() => normalizeYandexMetricaOAuthToken('bad\nheader'), /oauth token/i);
  assert.throws(() => normalizeYandexMetricaOAuthToken(''), /oauth token/i);
});

test('Reports API URL is aggregate-only, dimensionless and requests full accuracy', () => {
  const url = new URL(buildYandexMetricaReportUrl({
    counterId: COUNTER_ID,
    date1: '2026-08-05',
    date2: '2026-08-18',
  }));

  assert.equal(url.origin, 'https://api-metrika.yandex.net');
  assert.equal(url.pathname, '/stat/v1/data');
  assert.equal(url.searchParams.get('ids'), COUNTER_ID);
  assert.equal(url.searchParams.get('metrics'), 'ym:s:visits,ym:s:pageviews,ym:s:users');
  assert.equal(url.searchParams.get('date1'), '2026-08-05');
  assert.equal(url.searchParams.get('date2'), '2026-08-18');
  assert.equal(url.searchParams.get('accuracy'), 'full');
  assert.equal(url.searchParams.get('timezone'), '+00:00');
  assert.equal(url.searchParams.has('dimensions'), false);
  assert.equal(url.href.includes(TOKEN), false);
});

test('Reports API fetch sends OAuth only in the Authorization header and returns bounded totals', async () => {
  const calls = [];
  const fakeFetch = async (url, options) => {
    calls.push({url: String(url), options});
    return response(validApiBody());
  };

  const result = await fetchYandexMetricaTotals({
    counterId: COUNTER_ID,
    oauthToken: TOKEN,
    date1: '2026-08-05',
    date2: '2026-08-18',
    fetchImpl: fakeFetch,
  });

  assert.deepEqual(result, {visits: 58, pageviews: 104, users: 46});
  assert.equal(calls.length, 1);
  assert.equal(calls[0].options.method, 'GET');
  assert.equal(calls[0].options.headers.Authorization, `OAuth ${TOKEN}`);
  assert.equal(calls[0].url.includes(TOKEN), false);
});

test('Reports API fetch fails closed on auth errors, sampling and malformed totals', async () => {
  await assert.rejects(
    () => fetchYandexMetricaTotals({
      counterId: COUNTER_ID,
      oauthToken: TOKEN,
      date1: '2026-08-05',
      date2: '2026-08-18',
      fetchImpl: async () => response({}, {ok: false, status: 403}),
    }),
    /403/,
  );

  await assert.rejects(
    () => fetchYandexMetricaTotals({
      counterId: COUNTER_ID,
      oauthToken: TOKEN,
      date1: '2026-08-05',
      date2: '2026-08-18',
      fetchImpl: async () => response(validApiBody({sampled: true, sample_share: 0.1})),
    }),
    /sampled/i,
  );

  await assert.rejects(
    () => fetchYandexMetricaTotals({
      counterId: COUNTER_ID,
      oauthToken: TOKEN,
      date1: '2026-08-05',
      date2: '2026-08-18',
      fetchImpl: async () => response(validApiBody({totals: [58, 104]})),
    }),
    /totals/i,
  );
});

test('measurement enrichment fetches exactly the two P3.6 windows and never persists credentials', async () => {
  const windows = [];
  const fetchTotals = async ({date1, date2}) => {
    windows.push({date1, date2});
    return date1 === '2026-07-22'
      ? {visits: 41, pageviews: 73, users: 35}
      : {visits: 58, pageviews: 104, users: 46};
  };

  const enriched = await enrichMeasurementWithYandexMetrica(measurementFixture(), {
    counterId: COUNTER_ID,
    oauthToken: TOKEN,
    fetchTotals,
  });

  assert.deepEqual(windows, [
    {date1: '2026-07-22', date2: '2026-08-04'},
    {date1: '2026-08-05', date2: '2026-08-18'},
  ]);
  assert.deepEqual(enriched.baseline.metrica, {visits: 41, pageviews: 73, users: 35});
  assert.deepEqual(enriched.current.metrica, {visits: 58, pageviews: 104, users: 46});
  assert.equal(JSON.stringify(enriched).includes(TOKEN), false);
  assert.equal(JSON.stringify(enriched).includes(COUNTER_ID), false);
});
