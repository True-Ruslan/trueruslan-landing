import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
}

function readText(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function findProject(projects, slug) {
  const project = projects.find((candidate) => candidate.slug === slug);
  assert.ok(project, `missing project ${slug}`);
  return project;
}

function findEvidence(snapshots, project) {
  const snapshot = snapshots.find((candidate) => candidate.project === project);
  assert.ok(snapshot, `missing evidence snapshot ${project}`);
  return snapshot;
}

function signalByUrl(snapshot, url) {
  const value = snapshot.signals.find((candidate) => candidate.url === url);
  assert.ok(value, `${snapshot.project}: missing signal ${url}`);
  return value;
}

function signalByLabel(snapshot, label) {
  const value = snapshot.signals.find((candidate) => candidate.label === label);
  assert.ok(value, `${snapshot.project}: missing signal ${label}`);
  return value;
}

function timelineEntry(entries, slug, state) {
  const matches = entries.filter((entry) => entry.state === state);
  assert.equal(matches.length, 1, `${slug} must have exactly one ${state} timeline entry`);
  return matches[0];
}

test('freshness reconciliation records current truth without promoting lifecycle, installed acceptance or measurement boundaries', () => {
  const projects = readJson('data/projects.json');
  const evidence = readJson('data/project-evidence.json');
  const vlezetHistory = readJson('data/project-history/vlezet.json');
  const livingworldHistory = readJson('data/project-history/livingworld.json');
  const portfolioHistory = readJson('data/project-history/portfolio-platform.json');

  const vlezetProject = findProject(projects, 'vlezet');
  const livingworldProject = findProject(projects, 'livingworld');
  const portfolioProject = findProject(projects, 'portfolio-platform');
  const vlezetEvidence = findEvidence(evidence, 'vlezet');
  const livingworldEvidence = findEvidence(evidence, 'livingworld');
  const portfolioEvidence = findEvidence(evidence, 'portfolio-platform');

  assert.equal(vlezetProject.status, 'pre-production');
  assert.equal(vlezetProject.statusLabel, 'ACTIVE DEVELOPMENT');
  assert.equal(vlezetEvidence.lastVerified, '2026-08-19');
  assert.ok(vlezetEvidence.versions.some(({label, value}) => label === 'Accepted recognition slice' && value === 'M7.8B'));
  assert.ok(vlezetEvidence.versions.some(({label, value}) => label === 'Accepted editor slice' && /M8\.3.*accepted.*merged.*post-merge verified/i.test(value)));
  assert.ok(vlezetEvidence.versions.some(({label, value}) => label === 'Next acceptance boundary' && value === 'M8.4 Assisted Tracing'));
  assert.ok(vlezetEvidence.versions.some(({label, value}) => label === 'Active product slice'
    && /M8\.4 Assisted Tracing Draft PR #94/i.test(value)
    && /automated GREEN/i.test(value)
    && /two real-plan Product Owner FAILs/i.test(value)
    && /same-plan Product Owner retest pending/i.test(value)
    && /not accepted, merged or released/i.test(value)));
  assert.equal(signalByUrl(vlezetEvidence, 'https://github.com/True-Ruslan/vlezet/pull/42').state, 'failed');
  assert.equal(signalByUrl(vlezetEvidence, 'https://github.com/True-Ruslan/vlezet/pull/52').state, 'unavailable');
  const vlezetM82 = signalByUrl(vlezetEvidence, 'https://github.com/True-Ruslan/vlezet/pull/87');
  assert.equal(vlezetM82.state, 'merged');
  assert.match(vlezetM82.scope, /e323e331a435ae356b91decbdea80dde95028d8a/);
  const persistence = signalByUrl(vlezetEvidence, 'https://github.com/True-Ruslan/vlezet/pull/90');
  assert.equal(persistence.state, 'merged');
  assert.match(persistence.scope, /7cb9cfd2a8f809e6000209188b5fab99a2fabfb9/);
  const m83Draft = signalByLabel(vlezetEvidence, 'M8.3 Precision Reference Calibration Draft PR #92');
  const m83Accepted = signalByLabel(vlezetEvidence, 'M8.3 Precision Reference Calibration accepted PR #92');
  const m83Reconciliation = signalByUrl(vlezetEvidence, 'https://github.com/True-Ruslan/vlezet/pull/93');
  const m84Draft = signalByUrl(vlezetEvidence, 'https://github.com/True-Ruslan/vlezet/pull/94');
  assert.equal(m83Draft.state, 'pending');
  assert.equal(m83Draft.observedAt, '2026-08-16');
  assert.match(m83Draft.scope, /TDD RED/i);
  assert.match(m83Draft.scope, /historical pre-acceptance evidence only/i);
  assert.equal(m83Accepted.state, 'merged');
  assert.match(m83Accepted.scope, /01f520988a84291fb6e4f918e21f3403f17c4529/);
  assert.match(m83Accepted.scope, /CI #5248 and CodeQL #608/i);
  assert.equal(m83Reconciliation.state, 'merged');
  assert.equal(m84Draft.state, 'pending');
  assert.equal(m84Draft.observedAt, '2026-08-19');
  assert.match(m84Draft.scope, /c019af73a9224c1a63d4f377c21d03949ee9c28c/);
  assert.match(m84Draft.scope, /CI #5337.*Browser Acceptance #1780/i);
  assert.match(m84Draft.scope, /same real plan.*Product Owner retest/i);
  assert.match(m84Draft.scope, /not accepted, merged or released/i);
  assert.match(timelineEntry(vlezetHistory, 'vlezet', 'current').title, /M8\.4 Assisted Tracing.*product retest pending/i);
  assert.match(timelineEntry(vlezetHistory, 'vlezet', 'next').title, /Retest M8\.4.*same real plan/i);
  assert.ok(vlezetHistory.some(({state, title}) => state === 'past' && /M8\.3.*accepted.*merged/i.test(title)));

  assert.equal(livingworldProject.status, 'release-candidate');
  assert.equal(livingworldProject.statusLabel, 'ACCEPTANCE IN PROGRESS');
  assert.equal(livingworldEvidence.lastVerified, '2026-08-16');
  assert.ok(livingworldEvidence.versions.some(({label, value}) => label === 'Current official release' && value === '0.3.2+1.21.1'));
  assert.ok(livingworldEvidence.versions.some(({label, value}) => label === 'Current 0.3.2 acceptance' && /VAI-PCM-MULTI-001.*PENDING/i.test(value)));
  assert.ok(livingworldEvidence.versions.some(({label, value}) => label === 'Installed 0.2.0 result' && /7 PASS \/ 0 FAIL/.test(value)));
  assert.ok(livingworldEvidence.versions.some(({label, value}) => label === 'Deferred installed boundaries' && /VAI-M2-INST-005.*VAI-CONCUR-004/.test(value)));
  const installed031 = signalByUrl(livingworldEvidence, 'https://github.com/True-Ruslan/villAIgence/blob/1.21.1/docs/livingworld/VALIDATION_0.3.1_CORRECTIVE_INSTALLED.md');
  assert.equal(installed031.state, 'failed');
  assert.match(installed031.scope, /amber-pine-314.*did not recall/i);
  assert.equal(signalByUrl(livingworldEvidence, 'https://github.com/True-Ruslan/villAIgence/pull/169').state, 'merged');
  const release032 = signalByUrl(livingworldEvidence, 'https://github.com/True-Ruslan/villAIgence/releases/tag/0.3.2%2B1.21.1');
  assert.equal(release032.state, 'published');
  assert.match(release032.scope, /b51cfcf3f46718fac9620586cf8b5aae53356c600d5ac375ca3280050befe015/);
  const plan032 = signalByUrl(livingworldEvidence, 'https://github.com/True-Ruslan/villAIgence/pull/171');
  assert.equal(plan032.state, 'merged');
  assert.match(plan032.scope, /VAI-PCM-MULTI-001 remains PENDING/i);
  assert.match(plan032.scope, /0\.4 stays blocked/i);
  assert.match(timelineEntry(livingworldHistory, 'livingworld', 'current').title, /0\.3\.2.*installed canary pending/i);
  assert.match(timelineEntry(livingworldHistory, 'livingworld', 'next').title, /0\.3\.2.*VAI-PCM-MULTI-001.*canary/i);

  assert.equal(portfolioProject.status, 'production');
  assert.equal(portfolioProject.statusLabel, 'PRODUCTION');
  assert.equal(portfolioEvidence.lastVerified, '2026-08-20');
  assert.ok(portfolioEvidence.versions.some(({label, value}) => label === 'Portfolio Clarity redesign' && /C7.*production accepted/i.test(value)));
  assert.ok(portfolioEvidence.versions.some(({label, value}) => label === 'Measurement checkpoint' && /P3\.6.*NEXT.*WAITING/i.test(value)));
  assert.ok(portfolioEvidence.versions.some(({label, value}) => label === 'Current production baseline'
    && /93028b979f273b6382f480a500555a258c426607/.test(value)
    && /be439044b67b93c6112659c5ac8c6f50153b1f52/.test(value)
    && /3809d6f0290ab22f080e919f2ff26b1b018f3db6.*rollback/i.test(value)));
  assert.ok(portfolioEvidence.versions.some(({label, value}) => label === 'AI Navigator' && /public FULL production accepted/i.test(value) && /SEARCH rollback/i.test(value)));
  assert.ok(portfolioEvidence.versions.some(({label, value}) => label === 'Search Discovery' && /P4\.1B IN PROGRESS.*SPARSE PRE-LAUNCH BASELINE.*not-published/i.test(value)));
  const n6 = signalByUrl(portfolioEvidence, 'https://github.com/True-Ruslan/trueruslan-landing/pull/237');
  assert.equal(n6.state, 'merged');
  assert.match(n6.scope, /f0e489d75f5bcb1f64057e1046faad877bf3f952/);
  const aiBaseline = signalByUrl(portfolioEvidence, 'https://github.com/True-Ruslan/trueruslan-landing/pull/253');
  const aiReconciliation = signalByUrl(portfolioEvidence, 'https://github.com/True-Ruslan/trueruslan-landing/pull/254');
  assert.equal(aiBaseline.state, 'merged');
  assert.match(aiBaseline.scope, /Public mode remained off/i);
  assert.equal(aiReconciliation.state, 'merged');
  assert.match(aiReconciliation.scope, /8fe29188e4da9250b405f5e23b7ee8afe97e21d6/);
  assert.match(aiReconciliation.scope, /Production AI remained OFF at that stage/i);
  const searchAcceptance = signalByUrl(portfolioEvidence, 'https://github.com/True-Ruslan/trueruslan-landing/actions/runs/32148448724');
  const provisioning = signalByUrl(portfolioEvidence, 'https://github.com/True-Ruslan/trueruslan-landing/actions/runs/32348455080');
  const activation = signalByUrl(portfolioEvidence, 'https://github.com/True-Ruslan/trueruslan-landing/pull/294');
  const fullAcceptance = signalByUrl(portfolioEvidence, 'https://github.com/True-Ruslan/trueruslan-landing/actions/runs/32355776796');
  const durable = signalByUrl(portfolioEvidence, 'https://github.com/True-Ruslan/trueruslan-landing/pull/295');
  assert.equal(searchAcceptance.state, 'passed');
  assert.match(searchAcceptance.scope, /semantic result.*answer disabled.*zero unexpected external requests/i);
  assert.equal(provisioning.state, 'passed');
  assert.match(provisioning.scope, /dedicated AI-8 FULL Worker.*without changing public SEARCH/i);
  assert.equal(activation.state, 'merged');
  assert.match(activation.scope, /93028b979f273b6382f480a500555a258c426607/);
  assert.match(activation.scope, /AI-6 SEARCH.*rollback/i);
  assert.equal(fullAcceptance.state, 'passed');
  assert.match(fullAcceptance.scope, /512 dimensions.*grounded canonical citation.*zero unexpected external requests/i);
  assert.equal(durable.state, 'merged');
  assert.match(durable.scope, /be439044b67b93c6112659c5ac8c6f50153b1f52/);
  assert.match(timelineEntry(portfolioHistory, 'portfolio-platform', 'current').title, /AI-8 public FULL production accepted/i);
  assert.ok(portfolioHistory.some(({state, title}) => state === 'past' && /N6.*editorial UX.*production accepted/i.test(title)));
  assert.ok(portfolioHistory.some(({state, title}) => state === 'past' && /AI-6 public semantic SEARCH production accepted/i.test(title)));
  assert.match(timelineEntry(portfolioHistory, 'portfolio-platform', 'next').title, /Controlled manual launch.*real search.*measurement evidence/i);

  const projectState = readText('docs/PROJECT_STATE.md');
  const roadmap = readText('docs/ROADMAP.md');
  const changelog = readText('docs/CHANGELOG.md');
  assert.match(projectState, /P3\.6.*NEXT \/ WAITING/is);
  assert.match(roadmap, /P3\.6.*NEXT \/ WAITING/is);
  assert.match(changelog, /P3\.6.*NEXT \/ WAITING/is);
  for (const source of [projectState, roadmap, changelog]) {
    assert.doesNotMatch(source, /P3\.6\s*(?:—|-|:)\s*(?:ACCEPTED|COMPLETED)/i);
  }
});
