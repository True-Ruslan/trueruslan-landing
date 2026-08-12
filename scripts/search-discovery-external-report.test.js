import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {runExternalSearchEvidenceReport} from './search-discovery-external-report.js';

function inputFixture() {
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
          {dimension: 'query', value: 'fixture query', clicks: 0, impressions: 0, ctr: 0, position: 0},
          {dimension: 'page', value: 'https://example.invalid/projects/', clicks: 0, impressions: 0, ctr: 0, position: 0},
        ],
      },
    ],
  };
}

test('external evidence CLI runner writes SHA-256 anchored local artifacts without changing P4.1A readiness', () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'tr-p41b-'));
  const inputPath = path.join(tempRoot, 'operator-export.json');
  const outputDir = path.join(tempRoot, 'out');
  const bytes = Buffer.from(`${JSON.stringify(inputFixture(), null, 2)}\n`, 'utf8');
  fs.writeFileSync(inputPath, bytes);

  try {
    const {report, jsonPath, markdownPath} = runExternalSearchEvidenceReport({
      input: inputPath,
      outputDir,
      siteUrl: 'https://example.invalid',
    });

    assert.equal(report.generatedFrom.inputFile, 'operator-export.json');
    assert.equal(report.generatedFrom.inputSha256, crypto.createHash('sha256').update(bytes).digest('hex'));
    assert.deepEqual(report.generatedFrom.repositoryReadiness, {surfaces: 11, routes: 21, findings: 0});
    assert.equal(report.externalEvidence, 'collected');
    assert.equal(fs.existsSync(jsonPath), true);
    assert.equal(fs.existsSync(markdownPath), true);

    const persisted = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    assert.equal(persisted.generatedFrom.inputSha256, report.generatedFrom.inputSha256);
    const markdown = fs.readFileSync(markdownPath, 'utf8');
    assert.match(markdown, /operator-supplied-read-only/i);
    assert.match(markdown, /does not close, reset, or reinterpret P3\.6/i);
  } finally {
    fs.rmSync(tempRoot, {recursive: true, force: true});
  }
});

test('external evidence CLI runner fails closed when the explicit input is missing', () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'tr-p41b-missing-'));
  try {
    assert.throws(() => runExternalSearchEvidenceReport({
      input: path.join(tempRoot, 'missing.json'),
      outputDir: path.join(tempRoot, 'out'),
      siteUrl: 'https://example.invalid',
    }), /ENOENT|no such file/i);
  } finally {
    fs.rmSync(tempRoot, {recursive: true, force: true});
  }
});
