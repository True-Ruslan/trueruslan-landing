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

test('current reconciliation records active Vlezet M8.3 while preserving accepted M8.2 and pre-production lifecycle', () => {
  const registry = project('vlezet');
  const current = currentTimeline('vlezet');
  const next = nextTimeline('vlezet');
  const controlled = snapshot('vlezet');

  assert.equal(registry.status, 'pre-production');
  assert.equal(registry.statusLabel, 'ACTIVE DEVELOPMENT');
  assert.equal(controlled.status, 'verified');
  assert.equal(controlled.lastVerified, '2026-08-15');
  assert.ok(controlled.versions.some((entry) => entry.label === 'Accepted editor slice' && /M8\.2.*accepted.*merged/i.test(entry.value)));
  assert.equal(controlled.versions.find((entry) => entry.label === 'Next acceptance boundary')?.value, 'M8.3 Precision Reference Calibration');
  assert.ok(controlled.versions.some((entry) => entry.label === 'Active product slice' && /M8\.3 Precision Reference Calibration active/i.test(entry.value) && /Testing Policy Phase A.*P0 IndexedDB persistence hardening/i.test(entry.value) && /not product-owner accepted or released/i.test(entry.value)));

  assert.equal(signal('vlezet', 'https://github.com/True-Ruslan/vlezet/pull/52').state, 'unavailable');
  assert.equal(signal('vlezet', 'https://github.com/True-Ruslan/vlezet/pull/85').state, 'merged');
  assert.equal(signal('vlezet', 'https://github.com/True-Ruslan/vlezet/pull/87').state, 'merged');
  assert.equal(signal('vlezet', 'https://github.com/True-Ruslan/vlezet/pull/87').observedAt, '2026-08-13');
  assert.equal(signal('vlezet', 'https://github.com/True-Ruslan/vlezet/pull/88').state, 'merged');
  assert.equal(signal('vlezet', 'https://github.com/True-Ruslan/vlezet/pull/89').state, 'merged');
  assert.equal(signal('vlezet', 'https://github.com/True-Ruslan/vlezet/pull/90').state, 'merged');
  assert.equal(signal('vlezet', 'https://github.com/True-Ruslan/vlezet/pull/90').observedAt, '2026-08-15');
  assert.match(signal('vlezet', 'https://github.com/True-Ruslan/vlezet/pull/90').scope, /7cb9cfd2a8f809e6000209188b5fab99a2fabfb9/);
  assert.equal(signal('vlezet', 'https://github.com/True-Ruslan/vlezet/pull/91').state, 'merged');
  assert.equal(signal('vlezet', 'https://github.com/True-Ruslan/vlezet/pull/91').observedAt, '2026-08-15');

  assert.equal(current.length, 1);
  assert.equal(next.length, 0);
  assert.match(current[0].title, /M8\.3 Precision Reference Calibration.*active/i);
  assert.match(current[0].description, /not product-owner accepted or released/i);
  assert.match(current[0].description, /pre-production lifecycle remains unchanged/i);
});

test('current reconciliation records VillAIgence 0.3.1 publication without inventing installed acceptance', () => {
  const registry = project('livingworld');
  const current = currentTimeline('livingworld');
  const next = nextTimeline('livingworld');
  const controlled = snapshot('livingworld');

  assert.equal(registry.status, 'release-candidate');
  assert.equal(registry.statusLabel, 'ACCEPTANCE IN PROGRESS');
  assert.equal(controlled.status, 'verified');
  assert.equal(controlled.lastVerified, '2026-08-14');
  assert.ok(controlled.versions.some((entry) => entry.label === 'Current official release' && entry.value === '0.3.1+1.21.1'));
  assert.ok(controlled.versions.some((entry) => entry.label === 'Installed 0.2.0 result' && entry.value === '7 PASS / 0 FAIL'));
  assert.ok(controlled.versions.some((entry) => entry.label === 'Current 0.3.1 acceptance' && /automated.*PASS.*VAI-PCM-MULTI-001.*PENDING/i.test(entry.value)));
  assert.ok(controlled.versions.some((entry) => entry.label === 'Latest merged source capability' && /0\.3\.1.*Memory 2\.0.*recall/i.test(entry.value)));
  assert.ok(controlled.versions.some((entry) => entry.label === 'Active development slice' && /VAI-PCM-MULTI-001.*pending/i.test(entry.value) && /do not start 0\.4/i.test(entry.value)));

  for (const number of [125, 153, 155, 158, 159, 160, 165, 167]) {
    assert.equal(signal('livingworld', `https://github.com/True-Ruslan/villAIgence/pull/${number}`).state, 'merged');
  }
  assert.equal(signal('livingworld', 'https://github.com/True-Ruslan/villAIgence/releases/tag/0.3.1%2B1.21.1').state, 'published');
  assert.equal(signal('livingworld', 'https://github.com/True-Ruslan/villAIgence/pull/167').observedAt, '2026-08-14');

  assert.equal(current.length, 1);
  assert.equal(next.length, 1);
  assert.match(current[0].title, /0\.3\.1.*corrective release.*installed canary pending/i);
  assert.match(current[0].description, /release-candidate.*ACCEPTANCE IN PROGRESS/i);
  assert.match(current[0].description, /no installed-acceptance|canary.*pending/i);
  assert.match(next[0].title, /VAI-PCM-MULTI-001.*canary/i);
  assert.match(next[0].description, /f7f40b920c6f72a0e9af864795f48a0f90479db42a145081f43923b71a95e29f/);
  assert.match(next[0].description, /Only real installed PASS evidence/i);
});

test('current reconciliation preserves C7 and N6 history while recording the AI Navigator production baseline', () => {
  const registry = project('portfolio-platform');
  const current = currentTimeline('portfolio-platform');
  const next = nextTimeline('portfolio-platform');
  const controlled = snapshot('portfolio-platform');

  assert.equal(registry.status, 'production');
  assert.equal(controlled.status, 'verified');
  assert.equal(controlled.lastVerified, '2026-08-15');
  assert.ok(controlled.versions.some((entry) => entry.label === 'Portfolio Clarity redesign' && /C7/.test(entry.value) && /production accepted/i.test(entry.value)));
  assert.ok(controlled.versions.some((entry) => entry.label === 'Current production baseline' && /8fe29188e4da9250b405f5e23b7ee8afe97e21d6/.test(entry.value) && /AI Navigator.*public AI OFF/i.test(entry.value)));
  assert.ok(controlled.versions.some((entry) => entry.label === 'Measurement checkpoint' && /P3\.6.*NEXT.*WAITING/i.test(entry.value)));
  assert.ok(controlled.versions.some((entry) => entry.label === 'Search Discovery' && /P4\.1A READY.*P4\.1B IN PROGRESS.*SPARSE PRE-LAUNCH BASELINE.*not-published.*P4\.1C WAITING/i.test(entry.value)));
  assert.equal(signal('portfolio-platform', 'https://github.com/True-Ruslan/trueruslan-landing/pull/198').state, 'merged');
  assert.equal(signal('portfolio-platform', 'https://github.com/True-Ruslan/trueruslan-landing/pull/234').state, 'merged');
  assert.equal(signal('portfolio-platform', 'https://github.com/True-Ruslan/trueruslan-landing/pull/237').state, 'merged');
  assert.equal(signal('portfolio-platform', 'https://github.com/True-Ruslan/trueruslan-landing/pull/253').state, 'merged');
  assert.equal(signal('portfolio-platform', 'https://github.com/True-Ruslan/trueruslan-landing/pull/254').state, 'merged');
  assert.match(signal('portfolio-platform', 'https://github.com/True-Ruslan/trueruslan-landing/pull/237').scope, /f0e489d75f5bcb1f64057e1046faad877bf3f952/);
  assert.match(signal('portfolio-platform', 'https://github.com/True-Ruslan/trueruslan-landing/pull/254').scope, /Pages #273.*Production Live #620.*CodeQL #1752/i);

  assert.equal(current.length, 1);
  assert.equal(next.length, 1);
  assert.match(current[0].title, /AI Navigator.*production accepted.*public AI off/i);
  assert.match(current[0].description, /8fe29188e4da9250b405f5e23b7ee8afe97e21d6/);
  assert.match(current[0].description, /Pages #273.*Production Live #620.*CodeQL #1752/i);
  assert.match(current[0].description, /No live provider.*SEARCH\/FULL canary.*SEO, engagement or causal product-impact claim/i);
  assert.match(next[0].title, /Controlled manual launch.*real search.*measurement evidence/i);
  assert.match(next[0].description, /10-target \/ 38-draft/i);
  assert.match(next[0].description, /Search Console.*Yandex Webmaster/i);
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
