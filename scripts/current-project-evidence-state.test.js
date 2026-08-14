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

test('Vlezet evidence records accepted M8.2 while preserving pre-production lifecycle', () => {
  const entry = snapshot('vlezet');
  assert.equal(entry.status, 'verified');
  assert.equal(entry.lastVerified, '2026-08-14');
  assert.equal(project('vlezet').status, 'pre-production');
  assert.equal(project('vlezet').statusLabel, 'ACTIVE DEVELOPMENT');
  assert.match(version(entry, 'Accepted editor slice'), /M8\.2.*product-owner accepted.*merged/i);
  assert.match(version(entry, 'Active product slice'), /M8\.2 complete/i);
  assert.match(version(entry, 'Active product slice'), /testing-policy.*coverage.*M8\.3/i);

  const pr = signal(entry, 'M8.2 precision drawing and structural editing PR #87');
  assert.ok(pr);
  assert.equal(pr.state, 'merged');
  assert.equal(pr.observedAt, '2026-08-13');
  assert.match(pr.scope, /product-owner acceptance/i);
  assert.match(pr.scope, /e323e331a435ae356b91decbdea80dde95028d8a/);
  assert.match(pr.scope, /Post-merge CI #5097.*CodeQL/i);
  assert.match(pr.scope, /pre-production/i);

  const reconciliation = signal(entry, 'M8.2 post-merge truth reconciliation PR #88');
  assert.ok(reconciliation);
  assert.equal(reconciliation.state, 'merged');
  assert.match(reconciliation.scope, /testing-policy.*coverage audit/i);

  assert.equal(current(vlezetTimeline).length, 1);
  assert.match(current(vlezetTimeline)[0].title, /M8\.2.*accepted.*merged/i);
  assert.equal(next(vlezetTimeline).length, 1);
  assert.match(next(vlezetTimeline)[0].title, /testing-policy.*coverage.*M8\.3/i);
});
test('VillAIgence evidence records 0.3.1 release while keeping installed acceptance explicit and pending', () => {
  const entry = snapshot('livingworld');
  assert.equal(entry.status, 'verified');
  assert.equal(entry.lastVerified, '2026-08-14');
  assert.equal(project('livingworld').status, 'release-candidate');
  assert.equal(project('livingworld').statusLabel, 'ACCEPTANCE IN PROGRESS');
  assert.equal(version(entry, 'Current official release'), '0.3.1+1.21.1');
  assert.equal(version(entry, 'Installed 0.2.0 result'), '7 PASS / 0 FAIL');
  assert.match(version(entry, 'Current 0.3.1 acceptance'), /automated release gates PASS.*VAI-PCM-MULTI-001.*PENDING/i);
  assert.match(version(entry, 'Active development slice'), /VAI-PCM-MULTI-001.*pending/i);
  assert.match(version(entry, 'Active development slice'), /do not start 0\.4/i);

  const corrective = signal(entry, '0.3.1 targeted Memory 2.0 recall correction PR #165');
  const handoff = signal(entry, '0.3.1 installed corrective acceptance handoff PR #167');
  const release = signal(entry, 'Official 0.3.1+1.21.1 corrective release');
  assert.ok(corrective && handoff && release);
  assert.equal(corrective.state, 'merged');
  assert.equal(handoff.state, 'merged');
  assert.equal(handoff.observedAt, '2026-08-14');
  assert.equal(release.state, 'published');
  assert.match(release.scope, /bc7c68ac2f3a4f761aa3b03a2f5c1fe1201745ab/);
  assert.match(release.scope, /f7f40b920c6f72a0e9af864795f48a0f90479db42a145081f43923b71a95e29f/);
  assert.match(release.scope, /installed corrective.*pending/i);

  assert.equal(current(villTimeline).length, 1);
  assert.match(current(villTimeline)[0].title, /0\.3\.1.*installed canary pending/i);
  assert.equal(next(villTimeline).length, 1);
  assert.match(next(villTimeline)[0].title, /VAI-PCM-MULTI-001.*canary/i);
});
test('Portfolio Platform evidence records N6 production baseline without claiming external outcomes', () => {
  const entry = snapshot('portfolio-platform');
  assert.equal(entry.status, 'verified');
  assert.equal(entry.lastVerified, '2026-08-14');
  assert.equal(project('portfolio-platform').status, 'production');
  assert.equal(project('portfolio-platform').statusLabel, 'PRODUCTION');
  assert.equal(version(entry, 'Measurement checkpoint'), 'P3.6 — NEXT / WAITING FOR EXTERNAL EVIDENCE');
  assert.match(version(entry, 'Current production baseline'), /f0e489d75f5bcb1f64057e1046faad877bf3f952/);
  assert.match(version(entry, 'Search Discovery'), /P4\.1A READY.*P4\.1B IN PROGRESS.*SPARSE PRE-LAUNCH BASELINE.*not-published.*P4\.1C WAITING/i);

  const verifier = signal(entry, 'N6 production verifier correction PR #234');
  const reconciliation = signal(entry, 'N6 durable state reconciliation PR #237');
  assert.ok(verifier && reconciliation);
  assert.equal(verifier.state, 'merged');
  assert.equal(reconciliation.state, 'merged');
  assert.match(verifier.scope, /635b4a0760765a515277ad8abcbb1500bf646027/);
  assert.match(verifier.scope, /Work with me smoke/i);
  assert.match(reconciliation.scope, /f0e489d75f5bcb1f64057e1046faad877bf3f952/);
  assert.match(reconciliation.scope, /not-published/i);

  assert.equal(current(portfolioTimeline).length, 1);
  assert.match(current(portfolioTimeline)[0].title, /N6.*editorial UX.*production accepted/i);
  assert.equal(next(portfolioTimeline).length, 1);
  assert.match(next(portfolioTimeline)[0].title, /Controlled manual launch.*real search.*measurement evidence/i);
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
  assert.match(allPortfolioText, /P4\.1B IN PROGRESS \/ SPARSE PRE-LAUNCH BASELINE/i);
  assert.match(allPortfolioText, /controlled launch not-published/i);
  assert.match(allPortfolioText, /P4\.1C WAITING/i);

  const livingworld = snapshot('livingworld');
  assert.equal(version(livingworld, 'Current official release'), '0.3.1+1.21.1');
  assert.equal(version(livingworld, 'Installed 0.2.0 result'), '7 PASS / 0 FAIL');
  assert.match(version(livingworld, 'Current 0.3.1 acceptance'), /PENDING/i);
  assert.match(version(livingworld, 'Active development slice'), /do not start 0\.4/i);
});

test('Node Zero freshness review keeps stale trust state without inventing acceptance', () => {
  const entry = snapshot('node-zero');
  assert.ok(entry);
  assert.equal(entry.status, 'stale');
  assert.equal(entry.lastVerified, '2026-08-14');
  const review = signal(entry, 'Stale-evidence review — no new private acceptance evidence');
  assert.ok(review);
  assert.equal(review.kind, 'manual');
  assert.equal(review.mode, 'manual');
  assert.equal(review.state, 'unavailable');
  assert.equal(review.observedAt, '2026-08-14');
  assert.match(review.scope, /remains stale \/ REVIEW REQUIRED/i);
  assert.match(review.scope, /no lifecycle, version or acceptance claim is promoted/i);
  assert.match(review.scope, /July production-foundation acceptance remains the last positive executable evidence/i);
});
