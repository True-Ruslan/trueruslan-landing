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

test('Vlezet evidence records accepted M8.3 and pending M8.4 Product Owner retest without lifecycle promotion', () => {
  const entry = snapshot('vlezet');
  assert.equal(entry.status, 'verified');
  assert.equal(entry.lastVerified, '2026-08-19');
  assert.equal(project('vlezet').status, 'pre-production');
  assert.equal(project('vlezet').statusLabel, 'ACTIVE DEVELOPMENT');
  assert.match(version(entry, 'Accepted editor slice'), /M8\.3.*product-owner accepted.*merged.*post-merge verified/i);
  assert.equal(version(entry, 'Next acceptance boundary'), 'M8.4 Assisted Tracing');
  assert.match(version(entry, 'Active product slice'), /M8\.4 Assisted Tracing Draft PR #94/i);
  assert.match(version(entry, 'Active product slice'), /automated GREEN/i);
  assert.match(version(entry, 'Active product slice'), /two real-plan Product Owner FAILs/i);
  assert.match(version(entry, 'Active product slice'), /same-plan Product Owner retest pending/i);
  assert.match(version(entry, 'Active product slice'), /not accepted, merged or released/i);

  const m82 = signal(entry, 'M8.2 precision drawing and structural editing PR #87');
  assert.ok(m82);
  assert.equal(m82.state, 'merged');
  assert.match(m82.scope, /e323e331a435ae356b91decbdea80dde95028d8a/);

  const testingPolicy = signal(entry, 'Testing Policy Phase A PR #89');
  const persistence = signal(entry, 'P0 IndexedDB persistence remediation PR #90');
  const handoff = signal(entry, 'P0 post-merge truth / M8.3 handoff PR #91');
  const draft = signal(entry, 'M8.3 Precision Reference Calibration Draft PR #92');
  const accepted = signal(entry, 'M8.3 Precision Reference Calibration accepted PR #92');
  const reconciliation = signal(entry, 'M8.3 protected integration reconciliation PR #93');
  const m84 = signal(entry, 'M8.4 Assisted Tracing Draft PR #94');
  assert.ok(testingPolicy && persistence && handoff && draft && accepted && reconciliation && m84);
  assert.equal(testingPolicy.state, 'merged');
  assert.equal(persistence.state, 'merged');
  assert.match(persistence.scope, /7cb9cfd2a8f809e6000209188b5fab99a2fabfb9/);
  assert.equal(handoff.state, 'merged');
  assert.equal(draft.state, 'pending');
  assert.equal(draft.observedAt, '2026-08-16');
  assert.match(draft.scope, /TDD RED/i);
  assert.match(draft.scope, /historical pre-acceptance evidence only/i);
  assert.equal(accepted.state, 'merged');
  assert.match(accepted.scope, /bcb38150e0e6b823e2679b751ae1d96ea84b7ea8/);
  assert.match(accepted.scope, /01f520988a84291fb6e4f918e21f3403f17c4529/);
  assert.match(accepted.scope, /CI #5248 and CodeQL #608/i);
  assert.equal(reconciliation.state, 'merged');
  assert.equal(m84.state, 'pending');
  assert.equal(m84.observedAt, '2026-08-19');
  assert.match(m84.scope, /c019af73a9224c1a63d4f377c21d03949ee9c28c/);
  assert.match(m84.scope, /CI #5337.*Browser Acceptance #1780/i);
  assert.match(m84.scope, /same real plan.*Product Owner retest/i);
  assert.match(m84.scope, /not accepted, merged or released/i);

  assert.equal(current(vlezetTimeline).length, 1);
  assert.match(current(vlezetTimeline)[0].title, /M8\.4 Assisted Tracing.*product retest pending/i);
  assert.match(current(vlezetTimeline)[0].description, /Real-plan Product Owner checks on 2026-08-18 and 2026-08-19 both failed usefulness acceptance/i);
  assert.match(current(vlezetTimeline)[0].description, /not accepted, merged or released/i);
  assert.equal(next(vlezetTimeline).length, 1);
  assert.match(next(vlezetTimeline)[0].title, /Retest M8\.4.*same real plan/i);
  assert.match(next(vlezetTimeline)[0].description, /only an observed PASS.*merge/i);
});

test('VillAIgence evidence records 0.3.2 release while keeping installed acceptance explicit and pending', () => {
  const entry = snapshot('livingworld');
  assert.equal(entry.status, 'verified');
  assert.equal(entry.lastVerified, '2026-08-16');
  assert.equal(project('livingworld').status, 'release-candidate');
  assert.equal(project('livingworld').statusLabel, 'ACCEPTANCE IN PROGRESS');
  assert.equal(version(entry, 'Current official release'), '0.3.2+1.21.1');
  assert.equal(version(entry, 'Installed 0.2.0 result'), '7 PASS / 0 FAIL');
  assert.match(version(entry, 'Current 0.3.2 acceptance'), /automated release gates PASS.*VAI-PCM-MULTI-001.*PENDING/i);
  assert.match(version(entry, 'Active development slice'), /0\.3\.1 installed FAIL/i);
  assert.match(version(entry, 'Active development slice'), /do not start 0\.4/i);

  const installed031 = signal(entry, 'Installed 0.3.1 VAI-PCM-MULTI-001 corrective canary');
  const correction = signal(entry, '0.3.2 targeted recall ranking correction PR #169');
  const release = signal(entry, 'Official 0.3.2+1.21.1 corrective release');
  const plan = signal(entry, '0.3.2 installed corrective test plan PR #171');
  assert.ok(installed031 && correction && release && plan);
  assert.equal(installed031.state, 'failed');
  assert.equal(correction.state, 'merged');
  assert.equal(release.state, 'published');
  assert.match(release.scope, /b51cfcf3f46718fac9620586cf8b5aae53356c600d5ac375ca3280050befe015/);
  assert.match(release.scope, /not installed acceptance/i);
  assert.equal(plan.state, 'merged');
  assert.match(plan.scope, /VAI-PCM-MULTI-001 remains PENDING/i);
  assert.match(plan.scope, /0\.4 stays blocked/i);

  assert.equal(current(villTimeline).length, 1);
  assert.match(current(villTimeline)[0].title, /0\.3\.2.*installed canary pending/i);
  assert.equal(next(villTimeline).length, 1);
  assert.match(next(villTimeline)[0].title, /0\.3\.2.*VAI-PCM-MULTI-001.*canary/i);
});

test('Portfolio Platform evidence records AI-8 FULL production with explicit AI-6 rollback and no external-outcome promotion', () => {
  const entry = snapshot('portfolio-platform');
  assert.equal(entry.status, 'verified');
  assert.equal(entry.lastVerified, '2026-08-20');
  assert.equal(project('portfolio-platform').status, 'production');
  assert.equal(project('portfolio-platform').statusLabel, 'PRODUCTION');
  assert.equal(version(entry, 'Measurement checkpoint'), 'P3.6 — NEXT / WAITING FOR EXTERNAL EVIDENCE');
  assert.match(version(entry, 'Current production baseline'), /93028b979f273b6382f480a500555a258c426607/);
  assert.match(version(entry, 'Current production baseline'), /be439044b67b93c6112659c5ac8c6f50153b1f52/);
  assert.match(version(entry, 'Current production baseline'), /3809d6f0290ab22f080e919f2ff26b1b018f3db6.*rollback/i);
  assert.match(version(entry, 'AI Navigator'), /public FULL production accepted/i);
  assert.match(version(entry, 'AI Navigator'), /ordinary CI provider-free/i);
  assert.match(version(entry, 'AI Navigator'), /SEARCH rollback/i);
  assert.match(version(entry, 'Search Discovery'), /P4\.1A READY.*P4\.1B IN PROGRESS.*SPARSE PRE-LAUNCH BASELINE.*not-published.*P4\.1C WAITING/i);

  const verifier = signal(entry, 'N6 production verifier correction PR #234');
  const reconciliation = signal(entry, 'N6 durable state reconciliation PR #237');
  const aiBaseline = signal(entry, 'AI Navigator engineering baseline PR #253');
  const aiReconciliation = signal(entry, 'AI Navigator durable state reconciliation PR #254');
  const searchAcceptance = signal(entry, 'AI-6 public SEARCH production acceptance');
  const provisioning = signal(entry, 'AI-8 isolated production provisioning');
  const activation = signal(entry, 'AI-8 public FULL activation PR #294');
  const fullAcceptance = signal(entry, 'AI-8 public FULL production acceptance');
  const durable = signal(entry, 'AI-8 durable production acceptance reconciliation PR #295');
  assert.ok(verifier && reconciliation && aiBaseline && aiReconciliation && searchAcceptance && provisioning && activation && fullAcceptance && durable);
  assert.match(reconciliation.scope, /f0e489d75f5bcb1f64057e1046faad877bf3f952/);
  assert.match(aiBaseline.scope, /Public mode remained off/i);
  assert.match(aiReconciliation.scope, /8fe29188e4da9250b405f5e23b7ee8afe97e21d6/);
  assert.match(aiReconciliation.scope, /Pages #273.*Production Live #620.*CodeQL #1752/i);
  assert.match(searchAcceptance.scope, /semantic result.*answer disabled.*zero unexpected external requests/i);
  assert.match(provisioning.scope, /dedicated AI-8 FULL Worker.*without changing public SEARCH/i);
  assert.match(activation.scope, /93028b979f273b6382f480a500555a258c426607/);
  assert.match(activation.scope, /AI-6 SEARCH.*rollback/i);
  assert.match(fullAcceptance.scope, /512 dimensions.*grounded canonical citation.*zero unexpected external requests/i);
  assert.match(durable.scope, /be439044b67b93c6112659c5ac8c6f50153b1f52/);

  assert.equal(current(portfolioTimeline).length, 1);
  assert.match(current(portfolioTimeline)[0].title, /AI-8 public FULL production accepted/i);
  assert.match(current(portfolioTimeline)[0].description, /93028b979f273b6382f480a500555a258c426607/);
  assert.match(current(portfolioTimeline)[0].description, /AI-6 SEARCH remains the explicit rollback baseline/i);
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

  const vlezet = snapshot('vlezet');
  assert.match(version(vlezet, 'Active product slice'), /M8\.4.*Draft PR #94/i);
  assert.match(version(vlezet, 'Active product slice'), /same-plan Product Owner retest pending/i);
  assert.match(version(vlezet, 'Active product slice'), /not accepted, merged or released/i);

  const portfolio = snapshot('portfolio-platform');
  const allPortfolioText = JSON.stringify(portfolio);
  assert.match(allPortfolioText, /P3\.6[^"\\]*NEXT \/ WAITING FOR EXTERNAL EVIDENCE/i);
  assert.match(allPortfolioText, /P4\.1B IN PROGRESS \/ SPARSE PRE-LAUNCH BASELINE/i);
  assert.match(allPortfolioText, /controlled launch not-published/i);
  assert.match(allPortfolioText, /P4\.1C WAITING/i);
  assert.match(allPortfolioText, /public FULL production accepted/i);
  assert.match(allPortfolioText, /AI-6 SEARCH.*rollback/i);
  assert.doesNotMatch(allPortfolioText, /P3\.6\s*(?:—|-|:)\s*(?:ACCEPTED|COMPLETED)/i);

  const livingworld = snapshot('livingworld');
  assert.equal(version(livingworld, 'Current official release'), '0.3.2+1.21.1');
  assert.equal(version(livingworld, 'Installed 0.2.0 result'), '7 PASS / 0 FAIL');
  assert.match(version(livingworld, 'Current 0.3.2 acceptance'), /PENDING/i);
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
