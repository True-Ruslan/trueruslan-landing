import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
const readJson = (relativePath) => JSON.parse(read(relativePath));

const ACCEPTANCE = 'docs/acceptance/2026-08-11-portfolio-clarity-c7.md';
const FEATURE_HEAD_SHA = '6a511b8f7cc102cdcc1b00f1dda26bc57fdefae3';
const ACCEPTED_SHA = '134043fa2bb5f6612266a04eab2853f71b207328';
const BUILD_RUN = '31515510234';
const QUALITY_ARTIFACT = '9111068659';
const QUALITY_DIGEST = 'sha256:528e13cbe2883644c4673ce18bd0475b8acb87bb81b98e7ad806953bacc27e24';
const MEASUREMENT_RUN = '31515510155';
const MEASUREMENT_ARTIFACT = '9110870252';
const MEASUREMENT_DIGEST = 'sha256:6aeca4695acb1cae8933a852ee6ad8fc1323a80208a90cb7abb0084afdbd229c';
const PAGES_RUN = '31516118934';
const PAGES_DEPLOYMENT = '5855067883';
const PAGES_ARTIFACT = '9111122104';
const PAGES_DIGEST = 'sha256:22471106f7981d7cfd8b8d7245aeea0db140c1a2c3fc0fb7b092ca30e5814e41';
const PAGES_REPORTS = '9111138147';
const PAGES_REPORTS_DIGEST = 'sha256:f3bf385afa7b727cd62a26ccdbeef5d64eb711e516c4a90e993d7a7c7f9e6b75';
const LIVE_RUN = '31516213818';
const PRODUCTION_ARTIFACT = '9111213502';
const PRODUCTION_DIGEST = 'sha256:fcacde8fd83e068fe094c05a0da07a23bb8ba88a42e15d87507cf5d8ccc1a1d8';
const ACCEPTED_AT = '2026-08-11T17:12:43Z';

const EVIDENCE = [
  FEATURE_HEAD_SHA,
  ACCEPTED_SHA,
  BUILD_RUN,
  QUALITY_ARTIFACT,
  QUALITY_DIGEST,
  MEASUREMENT_RUN,
  MEASUREMENT_ARTIFACT,
  MEASUREMENT_DIGEST,
  PAGES_RUN,
  PAGES_DEPLOYMENT,
  PAGES_ARTIFACT,
  PAGES_DIGEST,
  PAGES_REPORTS,
  PAGES_REPORTS_DIGEST,
  LIVE_RUN,
  PRODUCTION_ARTIFACT,
  PRODUCTION_DIGEST,
];

function requireEvidence(source, label) {
  for (const marker of EVIDENCE) {
    assert.ok(source.includes(marker), `${label}: missing ${marker}`);
  }
}

test('C7 canonical presentation baseline advances only after exact production acceptance', () => {
  const baseline = readJson('data/presentation-baseline.json');
  assert.equal(baseline.schemaVersion, 1);
  assert.equal(baseline.slice, 'C7');
  assert.equal(baseline.status, 'production-accepted');
  assert.equal(baseline.measurementMode, 'context-only');
  assert.equal(baseline.resetsCleanUrlMeasurement, false);
  assert.equal(baseline.cleanUrlMigrationAt, '2026-08-05T00:00:00Z');
  assert.equal(baseline.acceptedAt, ACCEPTED_AT);
  assert.equal(baseline.deployedSha, ACCEPTED_SHA);
  assert.equal(baseline.pagesDeploymentId, PAGES_DEPLOYMENT);
  assert.equal(baseline.productionLiveRunId, LIVE_RUN);
});

test('C7 durable acceptance ledger preserves repository, Pages and Production Live evidence', () => {
  assert.ok(fs.existsSync(path.join(ROOT, ACCEPTANCE)), `${ACCEPTANCE} must exist`);
  const ledger = read(ACCEPTANCE);
  requireEvidence(ledger, ACCEPTANCE);
  assert.match(ledger, /C7\s+—\s+production baseline \+ P3\.6 handoff/i);
  assert.match(ledger, /PRODUCTION ACCEPTED/i);
  assert.match(ledger, /context-only/i);
  assert.match(ledger, /does not reset|did not reset/i);
  assert.match(ledger, /operator-observed/i);
  assert.match(ledger, /no (?:engagement|conversion|SEO|causal)|no causal/i);
});

test('PROJECT_STATE ROADMAP and CHANGELOG record C7 and close only the redesign implementation sequence', () => {
  for (const relativePath of ['docs/PROJECT_STATE.md', 'docs/ROADMAP.md', 'docs/CHANGELOG.md']) {
    const source = read(relativePath);
    requireEvidence(source, relativePath);
    assert.match(source, /C7(?:\s+—)?\s+production baseline \+ P3\.6 handoff/i, `${relativePath}: C7 milestone missing`);
    assert.match(source, /PRODUCTION ACCEPTED/i, `${relativePath}: C7 acceptance missing`);
    assert.match(source, /P3\.6[^\n]*(?:NEXT|WAITING)/i, `${relativePath}: P3.6 waiting boundary missing`);
    assert.doesNotMatch(source, /P3\.6\s+—\s+Measurement checkpoint\s+—\s+DONE/i);
  }
});

test('C7 durable state preserves the measurement clock and forbids product impact promotion', () => {
  const state = read('docs/PROJECT_STATE.md');
  const roadmap = read('docs/ROADMAP.md');
  const ledger = read(ACCEPTANCE);
  const handoff = read('docs/keystone/specs/2026-08-11-portfolio-clarity-c7-baseline-handoff.md');

  for (const source of [state, roadmap, ledger, handoff]) {
    assert.match(source, /2026-08-05T00:00:00Z|cleanUrlMigrationAt/);
    assert.match(source, /P3\.6|operator-observed/i);
  }
  assert.match(handoff, /production-accepted/i);
  assert.match(ledger, /human review/i);
  assert.doesNotMatch(ledger, /C7 (?:improved|increased|raised) (?:engagement|conversion|SEO)/i);
});
