import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  parseMeasurementReportArgs,
  runMeasurementCheckpointReport,
} from './measurement-checkpoint-report.js';

function fixture() {
  return {
    schemaVersion: 1,
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
      basis: 'Two complete aggregate windows are available for descriptive human review.',
    },
  };
}

test('parseMeasurementReportArgs accepts input output and observation threshold', () => {
  assert.deepEqual(parseMeasurementReportArgs([
    '--input', 'observations.json',
    '--output-dir', 'artifacts',
    '--minimum-observation-days', '10',
  ]), {
    inputPath: 'observations.json',
    outputDir: 'artifacts',
    minimumObservationDays: 10,
  });

  assert.throws(() => parseMeasurementReportArgs(['--minimum-observation-days', '0']), /positive integer/i);
  assert.throws(() => parseMeasurementReportArgs(['--unknown', 'x']), /unknown argument/i);
});

test('runMeasurementCheckpointReport writes only derived JSON and Markdown evidence', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tr-measurement-report-'));
  try {
    const inputPath = path.join(root, 'private-observations.json');
    const outputDir = path.join(root, 'out');
    fs.writeFileSync(inputPath, JSON.stringify(fixture()), 'utf8');

    const result = runMeasurementCheckpointReport({inputPath, outputDir, minimumObservationDays: 10});
    assert.equal(result.report.status, 'ready-for-human-review');
    assert.equal(path.basename(result.jsonPath), 'measurement-checkpoint-report.json');
    assert.equal(path.basename(result.markdownPath), 'measurement-checkpoint-report.md');
    assert.equal(fs.existsSync(result.jsonPath), true);
    assert.equal(fs.existsSync(result.markdownPath), true);
    assert.equal(fs.existsSync(path.join(outputDir, 'private-observations.json')), false);

    const stored = JSON.parse(fs.readFileSync(result.jsonPath, 'utf8'));
    assert.equal(stored.claims.automaticConclusionsAllowed, false);
    assert.equal(stored.comparisons.cloudflarePageviews.delta, 30);
    assert.equal(JSON.stringify(stored).includes('sessionId'), false);

    const markdown = fs.readFileSync(result.markdownPath, 'utf8');
    assert.match(markdown, /ready-for-human-review/);
    assert.match(markdown, /No automatic engagement conclusion/);
  } finally {
    fs.rmSync(root, {recursive: true, force: true});
  }
});

test('runMeasurementCheckpointReport fails closed on missing or malformed input', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tr-measurement-invalid-'));
  try {
    assert.throws(
      () => runMeasurementCheckpointReport({inputPath: path.join(root, 'missing.json'), outputDir: root}),
      /measurement observations input/i,
    );

    const malformedPath = path.join(root, 'malformed.json');
    fs.writeFileSync(malformedPath, '{not-json', 'utf8');
    assert.throws(
      () => runMeasurementCheckpointReport({inputPath: malformedPath, outputDir: root}),
      /measurement observations input/i,
    );
  } finally {
    fs.rmSync(root, {recursive: true, force: true});
  }
});
