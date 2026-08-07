import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  parseYandexMetricaEnrichArgs,
  runYandexMetricaEnrichment,
} from './yandex-metrica-enrich.js';

function fixture() {
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

test('enrichment CLI accepts only explicit input and output paths', () => {
  assert.deepEqual(parseYandexMetricaEnrichArgs([
    '--input', '/tmp/in.json',
    '--output', '/tmp/out.json',
  ]), {
    inputPath: '/tmp/in.json',
    outputPath: '/tmp/out.json',
  });
  assert.throws(() => parseYandexMetricaEnrichArgs(['--counter-id', '123']), /unknown argument/i);
  assert.throws(() => parseYandexMetricaEnrichArgs(['--input']), /requires a path/i);
});

test('enrichment writes only bounded aggregate values and never credentials', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tr-metrica-enrich-'));
  const token = 'secret-oauth-token-value';
  const counterId = '12345678';
  try {
    const inputPath = path.join(root, 'input.json');
    const outputPath = path.join(root, 'output.json');
    fs.writeFileSync(inputPath, JSON.stringify(fixture()), 'utf8');

    const calls = [];
    const result = await runYandexMetricaEnrichment({
      inputPath,
      outputPath,
      counterId,
      oauthToken: token,
      fetchTotals: async ({date1, date2}) => {
        calls.push({date1, date2});
        return date1 === '2026-07-22'
          ? {visits: 41, pageviews: 73, users: 35}
          : {visits: 58, pageviews: 104, users: 46};
      },
    });

    assert.deepEqual(calls, [
      {date1: '2026-07-22', date2: '2026-08-04'},
      {date1: '2026-08-05', date2: '2026-08-18'},
    ]);
    assert.equal(result.outputPath, outputPath);
    assert.deepEqual(result.observations.current.metrica, {visits: 58, pageviews: 104, users: 46});

    const stored = fs.readFileSync(outputPath, 'utf8');
    assert.equal(stored.includes(token), false);
    assert.equal(stored.includes(counterId), false);
    assert.equal(stored.includes('sample_share'), false);
    assert.equal(stored.includes('Authorization'), false);
  } finally {
    fs.rmSync(root, {recursive: true, force: true});
  }
});

test('enrichment fails closed on missing input, malformed JSON and missing credentials', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tr-metrica-invalid-'));
  try {
    await assert.rejects(
      () => runYandexMetricaEnrichment({
        inputPath: path.join(root, 'missing.json'),
        outputPath: path.join(root, 'out.json'),
        counterId: '12345678',
        oauthToken: 'secret-oauth-token-value',
      }),
      /cannot be read/i,
    );

    const malformed = path.join(root, 'malformed.json');
    fs.writeFileSync(malformed, '{bad-json', 'utf8');
    await assert.rejects(
      () => runYandexMetricaEnrichment({
        inputPath: malformed,
        outputPath: path.join(root, 'out.json'),
        counterId: '12345678',
        oauthToken: 'secret-oauth-token-value',
      }),
      /valid JSON/i,
    );

    const valid = path.join(root, 'valid.json');
    fs.writeFileSync(valid, JSON.stringify(fixture()), 'utf8');
    await assert.rejects(
      () => runYandexMetricaEnrichment({inputPath: valid, outputPath: path.join(root, 'out.json')}),
      /counter ID|OAuth token/i,
    );
  } finally {
    fs.rmSync(root, {recursive: true, force: true});
  }
});
