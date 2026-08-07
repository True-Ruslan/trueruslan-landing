import assert from 'node:assert/strict';
import test from 'node:test';

import {
  analyzeMeasurementCheckpoint,
  renderMeasurementCheckpointMarkdown,
} from './measurement-checkpoint.js';

function snapshot({start, end, pageviews, google, yandex}) {
  return {
    window: {start, end},
    cloudflare: {pageviews},
    search: {
      google,
      yandex,
    },
  };
}

function fixture(overrides = {}) {
  return {
    schemaVersion: 1,
    evidenceClass: 'operator-observed',
    cleanUrlMigrationAt: '2026-08-05T00:00:00Z',
    baseline: snapshot({
      start: '2026-07-22T00:00:00Z',
      end: '2026-08-04T23:59:59Z',
      pageviews: 80,
      google: {impressions: 30, clicks: 3, indexedCleanUrls: 4, indexedLegacyHtmlUrls: 11},
      yandex: {impressions: 20, clicks: 2, indexedCleanUrls: 3, indexedLegacyHtmlUrls: 12},
    }),
    current: snapshot({
      start: '2026-08-05T00:00:00Z',
      end: '2026-08-18T23:59:59Z',
      pageviews: 110,
      google: {impressions: 45, clicks: 4, indexedCleanUrls: 10, indexedLegacyHtmlUrls: 5},
      yandex: {impressions: 32, clicks: 3, indexedCleanUrls: 9, indexedLegacyHtmlUrls: 6},
    }),
    operatorAssessment: {
      aggregateTrafficSufficient: true,
      assessedAt: '2026-08-19T08:00:00Z',
      basis: 'Two complete aggregate windows are available and the operator considers the sample sufficient for descriptive review.',
    },
    ...overrides,
  };
}

test('measurement checkpoint remains fail-closed before the minimum external observation window', () => {
  const input = fixture({
    current: snapshot({
      start: '2026-08-05T00:00:00Z',
      end: '2026-08-07T23:59:59Z',
      pageviews: 25,
      google: {impressions: 8, clicks: 1, indexedCleanUrls: 5, indexedLegacyHtmlUrls: 10},
      yandex: {impressions: 5, clicks: 0, indexedCleanUrls: 4, indexedLegacyHtmlUrls: 11},
    }),
  });

  const report = analyzeMeasurementCheckpoint(input, {minimumObservationDays: 10});
  assert.equal(report.status, 'insufficient-observation-window');
  assert.equal(report.evidence.class, 'operator-observed');
  assert.equal(report.readiness.readyForHumanReview, false);
  assert.equal(report.readiness.minimumObservationDays, 10);
  assert.ok(report.readiness.observationDays < 10);
  assert.equal(report.claims.automaticConclusionsAllowed, false);
  assert.equal(report.claims.engagementConclusion, null);
  assert.equal(report.claims.productImpactConclusion, null);
});

test('measurement checkpoint requires an explicit operator assertion of aggregate traffic sufficiency', () => {
  const input = fixture({
    operatorAssessment: {
      aggregateTrafficSufficient: false,
      assessedAt: '2026-08-19T08:00:00Z',
      basis: 'Traffic is still too sparse for a useful comparison.',
    },
  });

  const report = analyzeMeasurementCheckpoint(input, {minimumObservationDays: 10});
  assert.equal(report.status, 'insufficient-aggregate-traffic');
  assert.equal(report.readiness.readyForHumanReview, false);
  assert.equal(report.readiness.operatorTrafficSufficient, false);
  assert.match(report.readiness.operatorBasis, /too sparse/i);
});

test('ready checkpoint computes descriptive aggregate deltas without inventing engagement conclusions', () => {
  const report = analyzeMeasurementCheckpoint(fixture(), {minimumObservationDays: 10});

  assert.equal(report.status, 'ready-for-human-review');
  assert.equal(report.evidence.class, 'operator-observed');
  assert.equal(report.readiness.readyForHumanReview, true);
  assert.deepEqual(report.comparisons.cloudflarePageviews, {baseline: 80, current: 110, delta: 30});
  assert.deepEqual(report.comparisons.google.impressions, {baseline: 30, current: 45, delta: 15});
  assert.deepEqual(report.comparisons.google.indexedCleanUrls, {baseline: 4, current: 10, delta: 6});
  assert.deepEqual(report.comparisons.google.indexedLegacyHtmlUrls, {baseline: 11, current: 5, delta: -6});
  assert.deepEqual(report.comparisons.yandex.indexedCleanUrls, {baseline: 3, current: 9, delta: 6});
  assert.deepEqual(report.comparisons.yandex.indexedLegacyHtmlUrls, {baseline: 12, current: 6, delta: -6});

  assert.equal(report.claims.automaticConclusionsAllowed, false);
  assert.equal(report.claims.engagementConclusion, null);
  assert.equal(report.claims.productImpactConclusion, null);
  assert.match(report.claims.boundary, /descriptive/i);
});

test('synthetic fixtures are permanently classified as pipeline proof, never operator evidence', () => {
  const report = analyzeMeasurementCheckpoint(fixture({evidenceClass: 'synthetic'}), {minimumObservationDays: 10});

  assert.equal(report.status, 'synthetic-pipeline-proof');
  assert.equal(report.evidence.class, 'synthetic');
  assert.equal(report.readiness.readyForHumanReview, false);
  assert.equal(report.readiness.operatorTrafficSufficient, false);
  assert.match(report.evidence.sources.cloudflare, /synthetic/i);
  assert.match(report.claims.boundary, /synthetic.*not production measurement evidence/i);
});

test('measurement checkpoint rejects unknown evidence classes', () => {
  assert.throws(
    () => analyzeMeasurementCheckpoint(fixture({evidenceClass: 'estimated'})),
    /evidenceClass/i,
  );
});

test('measurement checkpoint rejects raw or user-level tracking fields', () => {
  const input = fixture();
  input.current.cloudflare.sessionId = 'forbidden';
  assert.throws(
    () => analyzeMeasurementCheckpoint(input),
    /privacy boundary.*sessionId/i,
  );
});

test('measurement checkpoint rejects invalid temporal ordering', () => {
  const input = fixture({
    baseline: snapshot({
      start: '2026-08-06T00:00:00Z',
      end: '2026-08-10T00:00:00Z',
      pageviews: 80,
      google: {impressions: 30, clicks: 3, indexedCleanUrls: 4, indexedLegacyHtmlUrls: 11},
      yandex: {impressions: 20, clicks: 2, indexedCleanUrls: 3, indexedLegacyHtmlUrls: 12},
    }),
  });

  assert.throws(() => analyzeMeasurementCheckpoint(input), /baseline.*before.*migration/i);
});

test('ready comparison rejects unequal baseline and current window durations', () => {
  const input = fixture({
    current: snapshot({
      start: '2026-08-05T00:00:00Z',
      end: '2026-08-16T23:59:59Z',
      pageviews: 95,
      google: {impressions: 40, clicks: 4, indexedCleanUrls: 9, indexedLegacyHtmlUrls: 6},
      yandex: {impressions: 28, clicks: 3, indexedCleanUrls: 8, indexedLegacyHtmlUrls: 7},
    }),
    operatorAssessment: {
      aggregateTrafficSufficient: true,
      assessedAt: '2026-08-17T08:00:00Z',
      basis: 'The sample is sufficient, but the current comparison window is shorter than baseline.',
    },
  });

  assert.throws(() => analyzeMeasurementCheckpoint(input, {minimumObservationDays: 10}), /comparison window durations must match/i);
});

test('operator assessment cannot predate the current observation window end', () => {
  const input = fixture({
    operatorAssessment: {
      aggregateTrafficSufficient: true,
      assessedAt: '2026-08-18T12:00:00Z',
      basis: 'This assertion was made before the current observation window had actually finished.',
    },
  });

  assert.throws(() => analyzeMeasurementCheckpoint(input), /operator assessment.*after.*current observation window/i);
});

test('measurement markdown labels operator assertions and refuses automatic impact claims', () => {
  const report = analyzeMeasurementCheckpoint(fixture(), {minimumObservationDays: 10});
  const markdown = renderMeasurementCheckpointMarkdown(report);

  assert.match(markdown, /Evidence class: \*\*operator-observed\*\*/);
  assert.match(markdown, /ready-for-human-review/);
  assert.match(markdown, /Operator assertion/i);
  assert.match(markdown, /No automatic engagement conclusion/i);
  assert.match(markdown, /No automatic product-impact conclusion/i);
  assert.match(markdown, /Cloudflare pageviews/i);
  assert.match(markdown, /Google clean URLs indexed/i);
  assert.match(markdown, /Yandex legacy HTML URLs indexed/i);
});
