import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  parseFreshnessReportArgs,
  runFreshnessReport,
} from './content-freshness-report.js';

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), {recursive: true});
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function createFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'content-freshness-'));
  const dataDir = path.join(root, 'data');
  const historyDir = path.join(dataDir, 'project-history');
  const outputDir = path.join(root, 'quality-artifacts');
  const projectsPath = path.join(dataDir, 'projects.json');
  const evidencePath = path.join(dataDir, 'project-evidence.json');
  const observationsPath = path.join(root, 'observations.json');

  writeJson(projectsPath, [
    {
      slug: 'livingworld',
      name: 'LivingWorld',
      status: 'release-candidate',
      statusLabel: 'RELEASE CANDIDATE',
      summary: 'summary',
      featured: true,
      active: true,
      visibility: 'public',
      href: 'landing/projects/livingworld.html',
      tags: ['Java', 'AI'],
      links: {github: 'https://github.com/True-Ruslan/minecraft-botics-ai'},
      timeline: 'livingworld',
    },
  ]);

  writeJson(evidencePath, [
    {
      project: 'livingworld',
      status: 'verified',
      lastVerified: '2026-07-22',
      versions: [],
      signals: [
        {
          kind: 'ci',
          mode: 'automated',
          label: 'CI',
          state: 'green',
          observedAt: '2026-07-22',
          scope: 'Bounded CI scope.',
        },
      ],
    },
  ]);

  writeJson(path.join(historyDir, 'livingworld.json'), [
    {date: '2026-07', title: 'Current', description: 'current', state: 'current'},
  ]);

  writeJson(observationsPath, {
    generatedAt: '2026-07-24T00:00:00.000Z',
    repositories: {
      livingworld: {
        url: 'https://github.com/True-Ruslan/minecraft-botics-ai',
        pushedAt: '2026-07-24T12:00:00Z',
      },
    },
    links: {},
  });

  return {root, historyDir, outputDir, projectsPath, evidencePath, observationsPath};
}

test('parseFreshnessReportArgs accepts observations, output dir, threshold and now', () => {
  assert.deepEqual(
    parseFreshnessReportArgs([
      '--observations', 'obs.json',
      '--output-dir', 'out',
      '--max-age-days', '45',
      '--now', '2026-08-01',
    ]),
    {
      observationsPath: 'obs.json',
      outputDir: 'out',
      maxVerifiedAgeDays: 45,
      now: '2026-08-01',
    },
  );
});

test('runFreshnessReport loads canonical data and writes deterministic JSON and Markdown reports', () => {
  const fixture = createFixture();
  const first = runFreshnessReport({
    projectsPath: fixture.projectsPath,
    evidencePath: fixture.evidencePath,
    historyDir: fixture.historyDir,
    observationsPath: fixture.observationsPath,
    outputDir: fixture.outputDir,
    now: '2026-07-24',
    maxVerifiedAgeDays: 30,
  });

  const jsonPath = path.join(fixture.outputDir, 'content-freshness-report.json');
  const markdownPath = path.join(fixture.outputDir, 'content-freshness-report.md');
  assert.equal(fs.existsSync(jsonPath), true);
  assert.equal(fs.existsSync(markdownPath), true);
  assert.equal(first.report.findings.some((finding) => finding.code === 'repository-drift'), true);

  const jsonBefore = fs.readFileSync(jsonPath, 'utf8');
  const markdownBefore = fs.readFileSync(markdownPath, 'utf8');

  runFreshnessReport({
    projectsPath: fixture.projectsPath,
    evidencePath: fixture.evidencePath,
    historyDir: fixture.historyDir,
    observationsPath: fixture.observationsPath,
    outputDir: fixture.outputDir,
    now: '2026-07-24',
    maxVerifiedAgeDays: 30,
  });

  assert.equal(fs.readFileSync(jsonPath, 'utf8'), jsonBefore);
  assert.equal(fs.readFileSync(markdownPath, 'utf8'), markdownBefore);
  assert.match(markdownBefore, /repository-drift/);
});

test('runFreshnessReport rejects malformed observations input', () => {
  const fixture = createFixture();
  fs.writeFileSync(fixture.observationsPath, '{not-json', 'utf8');

  assert.throws(
    () => runFreshnessReport({
      projectsPath: fixture.projectsPath,
      evidencePath: fixture.evidencePath,
      historyDir: fixture.historyDir,
      observationsPath: fixture.observationsPath,
      outputDir: fixture.outputDir,
      now: '2026-07-24',
    }),
    /observations/i,
  );
});
