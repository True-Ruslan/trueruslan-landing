import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

import {analyzeContentFreshness} from './content-freshness.js';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));

const projects = readJson('data/projects.json');
const evidence = readJson('data/project-evidence.json');
const timelines = {
  vlezet: readJson('data/project-history/vlezet.json'),
  livingworld: readJson('data/project-history/livingworld.json'),
  'portfolio-platform': readJson('data/project-history/portfolio-platform.json'),
};

function project(slug) {
  return projects.find((entry) => entry.slug === slug);
}

function snapshot(slug) {
  return evidence.find((entry) => entry.project === slug);
}

function signal(slug, url) {
  return snapshot(slug).signals.find((entry) => entry.url === url);
}

function currentTimeline(slug) {
  return timelines[slug].filter((entry) => entry.state === 'current');
}

test('2026-08-11 reconciliation records current Vlezet public-beta boundary without lifecycle promotion', () => {
  const registry = project('vlezet');
  const current = currentTimeline('vlezet');
  const controlled = snapshot('vlezet');

  assert.equal(registry.status, 'pre-production');
  assert.equal(registry.statusLabel, 'ACTIVE DEVELOPMENT');
  assert.match(registry.summary, /manual editing|precision drawing/i);
  assert.equal(controlled.status, 'verified');
  assert.equal(controlled.lastVerified, '2026-08-11');
  assert.ok(controlled.versions.some((entry) => entry.label === 'Accepted editor slice' && /M8\.1/.test(entry.value)));
  assert.ok(controlled.versions.some((entry) => entry.label === 'Active product slice' && /M8\.2/.test(entry.value) && /retest|pending/i.test(entry.value)));

  assert.equal(signal('vlezet', 'https://github.com/True-Ruslan/vlezet/pull/52').state, 'unavailable');
  assert.equal(signal('vlezet', 'https://github.com/True-Ruslan/vlezet/pull/85').state, 'merged');
  assert.equal(signal('vlezet', 'https://github.com/True-Ruslan/vlezet/pull/87').state, 'pending');
  assert.equal(signal('vlezet', 'https://github.com/True-Ruslan/vlezet/pull/87').observedAt, '2026-08-11');

  assert.equal(current.length, 1);
  assert.match(current[0].title, /M8\.2/i);
  assert.match(current[0].description, /clipboard/i);
  assert.match(current[0].description, /pending|retest/i);
});

test('2026-08-11 reconciliation records current VillAIgence post-release 0.3 boundary without expanding installed acceptance', () => {
  const registry = project('livingworld');
  const current = currentTimeline('livingworld');
  const controlled = snapshot('livingworld');

  assert.equal(registry.status, 'release-candidate');
  assert.equal(registry.statusLabel, 'ACCEPTANCE IN PROGRESS');
  assert.equal(controlled.status, 'verified');
  assert.equal(controlled.lastVerified, '2026-08-11');
  assert.ok(controlled.versions.some((entry) => entry.label === 'Current official release' && entry.value === '0.2.0+1.21.1'));
  assert.ok(controlled.versions.some((entry) => entry.label === 'Installed 0.2.0 result' && entry.value === '7 PASS / 0 FAIL'));
  assert.ok(controlled.versions.some((entry) => entry.label === 'Latest merged source capability' && /causal NPC↔NPC social mutation/i.test(entry.value)));
  assert.ok(controlled.versions.some((entry) => entry.label === 'Active development slice' && /Personality/i.test(entry.value) && /Draft/i.test(entry.value)));

  assert.equal(signal('livingworld', 'https://github.com/True-Ruslan/villAIgence/pull/125').state, 'merged');
  assert.equal(signal('livingworld', 'https://github.com/True-Ruslan/villAIgence/pull/153').state, 'merged');
  assert.equal(signal('livingworld', 'https://github.com/True-Ruslan/villAIgence/pull/155').state, 'pending');
  assert.equal(signal('livingworld', 'https://github.com/True-Ruslan/villAIgence/pull/155').observedAt, '2026-08-11');

  assert.equal(current.length, 1);
  assert.match(current[0].title, /Personality.*social snapshot/i);
  assert.match(current[0].description, /Draft|TDD/i);
});

test('2026-08-11 reconciliation records C7 as the latest Portfolio Platform controlled production evidence', () => {
  const registry = project('portfolio-platform');
  const current = currentTimeline('portfolio-platform');
  const controlled = snapshot('portfolio-platform');

  assert.equal(registry.status, 'production');
  assert.equal(controlled.status, 'verified');
  assert.equal(controlled.lastVerified, '2026-08-11');
  assert.ok(controlled.versions.some((entry) => entry.label === 'Portfolio Clarity redesign' && /C7/.test(entry.value) && /production accepted/i.test(entry.value)));
  assert.equal(signal('portfolio-platform', 'https://github.com/True-Ruslan/trueruslan-landing/pull/198').state, 'merged');
  assert.equal(signal('portfolio-platform', 'https://github.com/True-Ruslan/trueruslan-landing/actions/runs/31516118934').state, 'published');
  assert.equal(signal('portfolio-platform', 'https://github.com/True-Ruslan/trueruslan-landing/actions/runs/31516213818').state, 'passed');

  assert.equal(current.length, 1);
  assert.match(current[0].title, /C7.*production baseline/i);
  assert.match(current[0].description, /P3\.6.*NEXT|WAITING/i);
});

test('reconciled controlled evidence produces no repository-drift finding for the observed 2026-08-11 state', () => {
  const selectedProjects = ['vlezet', 'livingworld', 'portfolio-platform'].map(project);
  const selectedEvidence = ['vlezet', 'livingworld', 'portfolio-platform'].map(snapshot);
  const report = analyzeContentFreshness({
    projects: selectedProjects,
    evidence: selectedEvidence,
    timelines,
    observations: {
      repositories: {
        vlezet: {url: 'https://github.com/True-Ruslan/vlezet', pushedAt: '2026-08-11T12:22:15Z'},
        livingworld: {
          url: 'https://github.com/True-Ruslan/villAIgence',
          pushedAt: '2026-08-11T08:31:25Z',
          latestRelease: {tagName: 'v0.2.0+1.21.1', publishedAt: '2026-08-07T00:00:00Z'},
        },
        'portfolio-platform': {url: 'https://github.com/True-Ruslan/trueruslan-landing', pushedAt: '2026-08-11T17:31:22Z'},
      },
      links: {},
    },
    now: new Date('2026-08-11T18:00:00Z'),
    maxVerifiedAgeDays: 30,
  });

  assert.deepEqual(report.summary, {total: 0, info: 0, warning: 0, error: 0});
  assert.deepEqual(report.findings, []);
});
