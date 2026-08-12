import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));

const projects = readJson('data/projects.json');
const evidence = readJson('data/project-evidence.json');
const vlezetTimeline = readJson('data/project-history/vlezet.json');
const villTimeline = readJson('data/project-history/livingworld.json');
const portfolioTimeline = readJson('data/project-history/portfolio-platform.json');

const project = (slug) => projects.find((entry) => entry.slug === slug);
const snapshot = (slug) => evidence.find((entry) => entry.project === slug);
const version = (entry, label) => entry.versions.find((fact) => fact.label === label)?.value;
const signal = (entry, label) => entry.signals.find((item) => item.label === label);
const current = (timeline) => timeline.filter((entry) => entry.state === 'current');
const next = (timeline) => timeline.filter((entry) => entry.state === 'next');

test('Vlezet evidence reflects current M8.2 draft without promoting lifecycle or acceptance', () => {
  const entry = snapshot('vlezet');
  assert.equal(entry.status, 'verified');
  assert.equal(entry.lastVerified, '2026-08-12');
  assert.equal(project('vlezet').status, 'pre-production');
  assert.equal(project('vlezet').statusLabel, 'ACTIVE DEVELOPMENT');
  assert.match(version(entry, 'Active product slice'), /M8\.2.*precision.*structural.*Draft/i);
  assert.match(version(entry, 'Active product slice'), /manual|product-owner|retest/i);

  const pr = signal(entry, 'M8.2 precision drawing and structural editing Draft PR #87');
  assert.ok(pr);
  assert.equal(pr.state, 'pending');
  assert.equal(pr.observedAt, '2026-08-12');
  assert.match(pr.scope, /789f1de8eae92eebc8988a41f07439927431fb8b/);
  assert.match(pr.scope, /693 passed/i);
  assert.match(pr.scope, /353 passed/i);
  assert.match(pr.scope, /manual product-owner.*pending/i);

  assert.equal(current(vlezetTimeline).length, 1);
  assert.match(current(vlezetTimeline)[0].title, /M8\.2.*precision.*structural/i);
  assert.match(current(vlezetTimeline)[0].description, /Draft/i);
  assert.equal(next(vlezetTimeline).length, 1);
  assert.match(next(vlezetTimeline)[0].description, /product-owner/i);
});

test('VillAIgence evidence advances source convergence while keeping 0.2.0 installed release immutable', () => {
  const entry = snapshot('livingworld');
  assert.equal(entry.status, 'verified');
  assert.equal(entry.lastVerified, '2026-08-12');
  assert.equal(project('livingworld').status, 'release-candidate');
  assert.equal(project('livingworld').statusLabel, 'ACCEPTANCE IN PROGRESS');
  assert.equal(version(entry, 'Current official release'), '0.2.0+1.21.1');
  assert.equal(version(entry, 'Installed 0.2.0 result'), '7 PASS / 0 FAIL');
  assert.match(version(entry, 'Active development slice'), /0\.3.*release convergence.*complete/i);
  assert.match(version(entry, 'Active development slice'), /release-request|candidate/i);

  for (const [label, sha] of [
    ['Personality/social dialogue integration PR #158', 'f6d8139cd1164653507ded8030b28c7c28e47cc2'],
    ['0.3 dialogue integration state reconciliation PR #159', '889d7ed7303250878b6afb42385f3a02ab169084'],
    ['0.3 release convergence contract PR #160', '03ccb2d5d047ca551a5ac6be6b927de4404f09cf'],
  ]) {
    const pr = signal(entry, label);
    assert.ok(pr, `missing ${label}`);
    assert.equal(pr.state, 'merged');
    assert.equal(pr.observedAt, '2026-08-12');
    assert.match(pr.scope, new RegExp(sha));
    assert.match(pr.scope, /0\.2\.0\+1\.21\.1/);
    assert.match(pr.scope, /not.*release|publication skipped|no.*release/i);
  }

  assert.equal(current(villTimeline).length, 1);
  assert.match(current(villTimeline)[0].title, /0\.3.*release convergence/i);
  assert.equal(next(villTimeline).length, 1);
  assert.match(next(villTimeline)[0].title, /release-request|candidate/i);
});

test('Portfolio Platform evidence records current production master without claiming external outcomes', () => {
  const entry = snapshot('portfolio-platform');
  assert.equal(entry.status, 'verified');
  assert.equal(entry.lastVerified, '2026-08-12');
  assert.equal(project('portfolio-platform').status, 'production');
  assert.equal(project('portfolio-platform').statusLabel, 'PRODUCTION');
  assert.equal(version(entry, 'Measurement checkpoint'), 'P3.6 — NEXT / WAITING FOR EXTERNAL EVIDENCE');
  assert.match(version(entry, 'Current production baseline'), /80195a39ac40cb5f8c97d1f8ea8bbd1f3d744613/);
  assert.match(version(entry, 'Search Discovery'), /11 strategic surfaces.*21 clean routes.*0 findings.*externalEvidence=not-collected/i);

  const pages = signal(entry, 'Current production GitHub Pages #232');
  const live = signal(entry, 'Current Production Live Smoke #516');
  const codeql = signal(entry, 'Current master CodeQL #1449');
  assert.ok(pages && live && codeql);
  for (const item of [pages, live, codeql]) assert.equal(item.observedAt, '2026-08-12');
  assert.match(pages.scope, /80195a39ac40cb5f8c97d1f8ea8bbd1f3d744613/);
  assert.match(live.scope, /80195a39ac40cb5f8c97d1f8ea8bbd1f3d744613/);
  assert.match(codeql.scope, /80195a39ac40cb5f8c97d1f8ea8bbd1f3d744613/);
  assert.match(live.scope, /P3\.6.*NEXT|P4\.1B.*NEXT/i);

  assert.equal(current(portfolioTimeline).length, 1);
  assert.match(current(portfolioTimeline)[0].title, /launch.*discovery.*maintenance|current production baseline/i);
  assert.equal(next(portfolioTimeline).length, 1);
  assert.match(next(portfolioTimeline)[0].description, /P3\.6|P4\.1B/i);
});

test('freshness reconciliation preserves lifecycle and external-evidence boundaries', () => {
  assert.deepEqual(
    ['vlezet', 'livingworld', 'portfolio-platform'].map((slug) => [slug, project(slug).status, project(slug).statusLabel]),
    [
      ['vlezet', 'pre-production', 'ACTIVE DEVELOPMENT'],
      ['livingworld', 'release-candidate', 'ACCEPTANCE IN PROGRESS'],
      ['portfolio-platform', 'production', 'PRODUCTION'],
    ],
  );

  const portfolio = snapshot('portfolio-platform');
  const allPortfolioText = JSON.stringify(portfolio);
  assert.match(allPortfolioText, /P3\.6[^"\\]*NEXT \/ WAITING FOR EXTERNAL EVIDENCE/i);
  assert.match(allPortfolioText, /P4\.1B[^"\\]*NEXT/i);
  assert.match(allPortfolioText, /externalEvidence=not-collected/i);

  const livingworld = snapshot('livingworld');
  assert.equal(version(livingworld, 'Current official release'), '0.2.0+1.21.1');
  assert.doesNotMatch(version(livingworld, 'Current official release'), /^0\.3/);
});
