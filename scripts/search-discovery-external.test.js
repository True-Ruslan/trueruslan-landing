import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {
  buildExternalSearchEvidenceReport,
  renderExternalSearchEvidenceMarkdown,
  validateExternalSearchEvidence,
} from './search-discovery-external.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function validInput() {
  return {
    schemaVersion: 1,
    evidenceClass: 'external-search-observations',
    property: 'https://example.invalid/',
    collectedAt: '2026-08-12T10:30:00Z',
    observations: [
      {
        source: 'google-search-console',
        collectionMethod: 'export',
        kind: 'performance',
        window: {start: '2026-08-01', end: '2026-08-11'},
        rows: [
          {dimension: 'query', value: 'java backend portfolio', clicks: 1, impressions: 7, ctr: 0.142857, position: 4.2},
          {dimension: 'page', value: 'https://example.invalid/projects/', clicks: 2, impressions: 11, ctr: 0.181818, position: 3.5},
          {dimension: 'page', value: 'https://example.invalid/en/projects/', clicks: 0, impressions: 3, ctr: 0, position: 8.1},
          {dimension: 'page', value: 'https://example.invalid/projects.html', clicks: 0, impressions: 2, ctr: 0, position: 12},
        ],
      },
      {
        source: 'yandex-webmaster',
        collectionMethod: 'api',
        kind: 'indexing',
        window: {start: '2026-08-11', end: '2026-08-11'},
        rows: [
          {url: 'https://example.invalid/projects/', state: 'indexed', canonicalUrl: 'https://example.invalid/projects/'},
          {url: 'https://example.invalid/en/projects/', state: 'not-indexed', reason: 'not yet discovered'},
        ],
      },
    ],
  };
}

const strategicRoutes = [
  {surfaceId: 'projects', locale: 'ru', publicRoute: '/projects/'},
  {surfaceId: 'projects', locale: 'en', publicRoute: '/en/projects/'},
];

test('P4.1B intake validates bounded operator-supplied aggregate evidence', () => {
  const normalized = validateExternalSearchEvidence(validInput(), {siteUrl: 'https://example.invalid'});
  assert.equal(normalized.schemaVersion, 1);
  assert.equal(normalized.evidenceClass, 'external-search-observations');
  assert.equal(normalized.property, 'https://example.invalid/');
  assert.equal(normalized.observations.length, 2);
  assert.deepEqual(normalized.observations.map(({source}) => source), ['google-search-console', 'yandex-webmaster']);
});

test('P4.1B intake rejects fabricated provenance shapes, unsupported sources and cross-property URLs', () => {
  const base = validInput();
  assert.throws(() => validateExternalSearchEvidence({...base, evidenceClass: 'repository-readiness'}, {siteUrl: 'https://example.invalid'}), /evidenceClass/i);
  assert.throws(() => validateExternalSearchEvidence({...base, observations: [{...base.observations[0], source: 'synthetic'}]}, {siteUrl: 'https://example.invalid'}), /source/i);
  assert.throws(() => validateExternalSearchEvidence({...base, observations: [{...base.observations[0], collectionMethod: 'generated'}]}, {siteUrl: 'https://example.invalid'}), /collectionMethod/i);

  const crossProperty = structuredClone(base);
  crossProperty.observations[0].rows[1].value = 'https://other.invalid/projects/';
  assert.throws(() => validateExternalSearchEvidence(crossProperty, {siteUrl: 'https://example.invalid'}), /property|origin/i);
});

test('P4.1B intake fails closed on invalid dates and impossible performance metrics', () => {
  const invalidWindow = structuredClone(validInput());
  invalidWindow.observations[0].window = {start: '2026-08-12', end: '2026-08-01'};
  assert.throws(() => validateExternalSearchEvidence(invalidWindow, {siteUrl: 'https://example.invalid'}), /window/i);

  const negative = structuredClone(validInput());
  negative.observations[0].rows[0].impressions = -1;
  assert.throws(() => validateExternalSearchEvidence(negative, {siteUrl: 'https://example.invalid'}), /impressions/i);

  const impossibleCtr = structuredClone(validInput());
  impossibleCtr.observations[0].rows[0].ctr = 2;
  assert.throws(() => validateExternalSearchEvidence(impossibleCtr, {siteUrl: 'https://example.invalid'}), /ctr/i);
});

test('external report separates query/page evidence, RU/EN performance and legacy URL symptoms', () => {
  const report = buildExternalSearchEvidenceReport({
    input: validInput(),
    strategicRoutes,
    siteUrl: 'https://example.invalid',
  });

  assert.equal(report.evidenceClass, 'external-search-observations');
  assert.equal(report.externalEvidence, 'collected');
  assert.equal(report.provenance, 'operator-supplied-read-only');
  assert.deepEqual(report.summary, {
    sources: 2,
    observations: 2,
    performanceRows: 4,
    indexingRows: 2,
    nonzeroQueries: 1,
    nonzeroPages: 2,
    cleanPageRows: 2,
    legacyHtmlPageRows: 1,
    indexingIssues: 1,
  });
  assert.equal(report.localePerformance.ru.impressions, 11);
  assert.equal(report.localePerformance.ru.clicks, 2);
  assert.equal(report.localePerformance.en.impressions, 3);
  assert.equal(report.localePerformance.en.clicks, 0);
  assert.ok(report.findings.some(({code}) => code === 'legacy-html-performance'));
  assert.ok(report.findings.some(({code}) => code === 'strategic-route-not-indexed'));
  assert.equal(report.topQueries[0].value, 'java backend portfolio');
});

test('external report never reinterprets P3.6 and renders an explicit evidence boundary', () => {
  const report = buildExternalSearchEvidenceReport({
    input: validInput(),
    strategicRoutes,
    siteUrl: 'https://example.invalid',
  });
  const markdown = renderExternalSearchEvidenceMarkdown(report);

  assert.match(markdown, /P4\.1B External Search Evidence/i);
  assert.match(markdown, /operator-supplied-read-only/i);
  assert.match(markdown, /does not close, reset, or reinterpret P3\.6/i);
  assert.match(markdown, /legacy-html-performance/i);
  assert.match(markdown, /strategic-route-not-indexed/i);
});

test('repository does not commit real P4.1B exports or run external collection inside ordinary npm test', () => {
  const gitignore = fs.readFileSync(path.join(ROOT, '.gitignore'), 'utf8');
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const policy = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'search-discovery.json'), 'utf8'));

  assert.match(gitignore, /^\/private\/search-discovery\/$/m);
  assert.equal(policy.externalEvidence, 'not-collected');
  assert.doesNotMatch(pkg.scripts.test, /discovery:external|external.*search/i);
  assert.equal(fs.existsSync(path.join(ROOT, 'data', 'search-discovery-external.json')), false);
});
