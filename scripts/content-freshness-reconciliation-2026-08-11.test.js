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

function nextTimeline(slug) {
  return timelines[slug].filter((entry) => entry.state === 'next');
}

test('current reconciliation records the Vlezet M8.2 draft boundary without lifecycle promotion', () => {
  const registry = project('vlezet');
  const current = currentTimeline('vlezet');
  const next = nextTimeline('vlezet');
  const controlled = snapshot('vlezet');

  assert.equal(registry.status, 'pre-production');
  assert.equal(registry.statusLabel, 'ACTIVE DEVELOPMENT');
  assert.equal(controlled.status, 'verified');
  assert.equal(controlled.lastVerified, '2026-08-12');
  assert.ok(controlled.versions.some((entry) => entry.label === 'Accepted editor slice' && /M8\.1/.test(entry.value)));
  assert.ok(controlled.versions.some((entry) => entry.label === 'Active product slice' && /M8\.2/.test(entry.value) && /Draft/i.test(entry.value) && /retest|pending/i.test(entry.value)));

  assert.equal(signal('vlezet', 'https://github.com/True-Ruslan/vlezet/pull/52').state, 'unavailable');
  assert.equal(signal('vlezet', 'https://github.com/True-Ruslan/vlezet/pull/85').state, 'merged');
  assert.equal(signal('vlezet', 'https://github.com/True-Ruslan/vlezet/pull/87').state, 'pending');
  assert.equal(signal('vlezet', 'https://github.com/True-Ruslan/vlezet/pull/87').observedAt, '2026-08-12');

  assert.equal(current.length, 1);
  assert.equal(next.length, 1);
  assert.match(current[0].title, /M8\.2.*precision.*structural/i);
  assert.match(current[0].description, /Draft/i);
  assert.match(next[0].description, /product-owner|manual.*retest/i);
});

test('current reconciliation advances VillAIgence source convergence without expanding installed acceptance', () => {
  const registry = project('livingworld');
  const current = currentTimeline('livingworld');
  const next = nextTimeline('livingworld');
  const controlled = snapshot('livingworld');

  assert.equal(registry.status, 'release-candidate');
  assert.equal(registry.statusLabel, 'ACCEPTANCE IN PROGRESS');
  assert.equal(controlled.status, 'verified');
  assert.equal(controlled.lastVerified, '2026-08-12');
  assert.ok(controlled.versions.some((entry) => entry.label === 'Current official release' && entry.value === '0.2.0+1.21.1'));
  assert.ok(controlled.versions.some((entry) => entry.label === 'Installed 0.2.0 result' && entry.value === '7 PASS / 0 FAIL'));
  assert.ok(controlled.versions.some((entry) => entry.label === 'Latest merged source capability' && /release convergence.*#160/i.test(entry.value)));
  assert.ok(controlled.versions.some((entry) => entry.label === 'Active development slice' && /0\.3.*release convergence/i.test(entry.value) && /release-request|candidate/i.test(entry.value)));

  for (const number of [125, 153, 155, 158, 159, 160]) {
    assert.equal(signal('livingworld', `https://github.com/True-Ruslan/villAIgence/pull/${number}`).state, 'merged');
  }
  assert.equal(signal('livingworld', 'https://github.com/True-Ruslan/villAIgence/pull/160').observedAt, '2026-08-12');

  assert.equal(current.length, 1);
  assert.equal(next.length, 1);
  assert.match(current[0].title, /0\.3.*release convergence/i);
  assert.match(current[0].description, /release not published|publication.*skipped/i);
  assert.match(next[0].title, /release-request|candidate/i);
});

test('current reconciliation preserves C7 history while advancing the Portfolio Platform production baseline', () => {
  const registry = project('portfolio-platform');
  const current = currentTimeline('portfolio-platform');
  const next = nextTimeline('portfolio-platform');
  const controlled = snapshot('portfolio-platform');

  assert.equal(registry.status, 'production');
  assert.equal(controlled.status, 'verified');
  assert.equal(controlled.lastVerified, '2026-08-12');
  assert.ok(controlled.versions.some((entry) => entry.label === 'Portfolio Clarity redesign' && /C7/.test(entry.value) && /production accepted/i.test(entry.value)));
  assert.ok(controlled.versions.some((entry) => entry.label === 'Current production baseline' && /80195a39ac40cb5f8c97d1f8ea8bbd1f3d744613/.test(entry.value)));
  assert.ok(controlled.versions.some((entry) => entry.label === 'Measurement checkpoint' && /P3\.6.*NEXT.*WAITING/i.test(entry.value)));
  assert.equal(signal('portfolio-platform', 'https://github.com/True-Ruslan/trueruslan-landing/pull/198').state, 'merged');
  assert.equal(signal('portfolio-platform', 'https://github.com/True-Ruslan/trueruslan-landing/actions/runs/31516118934').state, 'published');
  assert.equal(signal('portfolio-platform', 'https://github.com/True-Ruslan/trueruslan-landing/actions/runs/31516213818').state, 'passed');
  assert.equal(signal('portfolio-platform', 'https://github.com/True-Ruslan/trueruslan-landing/actions/runs/31583969846').state, 'published');
  assert.equal(signal('portfolio-platform', 'https://github.com/True-Ruslan/trueruslan-landing/actions/runs/31583969870').state, 'passed');

  assert.equal(current.length, 1);
  assert.equal(next.length, 1);
  assert.match(current[0].title, /launch.*discovery.*maintenance|current production baseline/i);
  assert.match(current[0].description, /P3\.6.*NEXT|WAITING/i);
  assert.match(next[0].description, /P3\.6|P4\.1B/i);
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