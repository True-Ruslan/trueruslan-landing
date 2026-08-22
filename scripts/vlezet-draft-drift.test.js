import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const ROOT = path.resolve(import.meta.dirname, '..');
const EVIDENCE_PATH = path.join(ROOT, 'data', 'project-evidence.json');
const PROJECT_STATE_PATH = path.join(ROOT, 'docs', 'PROJECT_STATE.md');
const ROADMAP_PATH = path.join(ROOT, 'docs', 'ROADMAP.md');
const CHANGELOG_PATH = path.join(ROOT, 'docs', 'CHANGELOG.md');

test('Vlezet keeps failed M7.8C history while M8.3 is accepted and M8.4 retest remains pending', () => {
  const evidence = JSON.parse(fs.readFileSync(EVIDENCE_PATH, 'utf8'));
  const vlezet = evidence.find((entry) => entry.project === 'vlezet');

  assert.ok(vlezet, 'missing Vlezet evidence snapshot');
  assert.equal(vlezet.status, 'verified');
  assert.equal(vlezet.lastVerified, '2026-08-19');

  const versions = new Map(vlezet.versions.map(({label, value}) => [label, value]));
  assert.equal(versions.get('Accepted recognition slice'), 'M7.8B');
  assert.match(versions.get('Automatic M7.8C result'), /FAIL.*closed unmerged/i);
  assert.match(versions.get('Accepted editor slice'), /M8\.3.*product-owner accepted.*merged.*post-merge verified/i);
  assert.equal(versions.get('Next acceptance boundary'), 'M8.4 Assisted Tracing');
  assert.match(versions.get('Active product slice'), /M8\.4 Assisted Tracing Draft PR #94/i);
  assert.match(versions.get('Active product slice'), /automated GREEN/i);
  assert.match(versions.get('Active product slice'), /two real-plan Product Owner FAILs/i);
  assert.match(versions.get('Active product slice'), /same-plan Product Owner retest pending/i);
  assert.match(versions.get('Active product slice'), /not accepted, merged or released/i);

  const m78c = vlezet.signals.find(({url}) => url === 'https://github.com/True-Ruslan/vlezet/pull/42');
  assert.ok(m78c, 'missing bounded M7.8C failure signal');
  assert.equal(m78c.state, 'failed');
  assert.match(m78c.scope, /closed unmerged/i);
  assert.match(m78c.scope, /product-owner.*failed usefulness acceptance/i);
  assert.match(m78c.scope, /M7\.8B/i);

  const assisted = vlezet.signals.find(({url}) => url === 'https://github.com/True-Ruslan/vlezet/pull/52');
  assert.ok(assisted, 'missing historical Assisted Tracing signal');
  assert.equal(assisted.state, 'unavailable');
  assert.match(assisted.scope, /closed unmerged/i);
  assert.match(assisted.scope, /superseded/i);

  const m82 = vlezet.signals.find(({url}) => url === 'https://github.com/True-Ruslan/vlezet/pull/87');
  assert.ok(m82, 'missing accepted M8.2 signal');
  assert.equal(m82.state, 'merged');
  assert.match(m82.scope, /product-owner acceptance/i);
  assert.match(m82.scope, /e323e331a435ae356b91decbdea80dde95028d8a/);
  assert.match(m82.scope, /pre-production/i);

  const persistence = vlezet.signals.find(({url}) => url === 'https://github.com/True-Ruslan/vlezet/pull/90');
  assert.ok(persistence, 'missing accepted P0 IndexedDB signal');
  assert.equal(persistence.state, 'merged');
  assert.match(persistence.scope, /7cb9cfd2a8f809e6000209188b5fab99a2fabfb9/);
  assert.match(persistence.scope, /persistence acceptance only/i);
  assert.match(persistence.scope, /pre-production/i);

  const handoff = vlezet.signals.find(({url}) => url === 'https://github.com/True-Ruslan/vlezet/pull/91');
  const m83Draft = vlezet.signals.find(({label}) => label === 'M8.3 Precision Reference Calibration Draft PR #92');
  const m83Accepted = vlezet.signals.find(({label}) => label === 'M8.3 Precision Reference Calibration accepted PR #92');
  const m83Reconciliation = vlezet.signals.find(({url}) => url === 'https://github.com/True-Ruslan/vlezet/pull/93');
  const m84Draft = vlezet.signals.find(({url}) => url === 'https://github.com/True-Ruslan/vlezet/pull/94');
  assert.ok(handoff && m83Draft && m83Accepted && m83Reconciliation && m84Draft, 'missing M8.3/M8.4 evidence chain');
  assert.equal(handoff.state, 'merged');
  assert.equal(m83Draft.state, 'pending');
  assert.equal(m83Draft.observedAt, '2026-08-16');
  assert.match(m83Draft.scope, /TDD RED/i);
  assert.match(m83Draft.scope, /historical pre-acceptance evidence only/i);
  assert.equal(m83Accepted.state, 'merged');
  assert.equal(m83Accepted.observedAt, '2026-08-17');
  assert.match(m83Accepted.scope, /bcb38150e0e6b823e2679b751ae1d96ea84b7ea8/);
  assert.match(m83Accepted.scope, /01f520988a84291fb6e4f918e21f3403f17c4529/);
  assert.match(m83Accepted.scope, /post-merge main passed CI #5248 and CodeQL #608/i);
  assert.equal(m83Reconciliation.state, 'merged');
  assert.equal(m84Draft.state, 'pending');
  assert.equal(m84Draft.observedAt, '2026-08-19');
  assert.match(m84Draft.scope, /c019af73a9224c1a63d4f377c21d03949ee9c28c/);
  assert.match(m84Draft.scope, /CI #5337.*Browser Acceptance #1780/i);
  assert.match(m84Draft.scope, /same real plan still requires Product Owner retest/i);
  assert.match(m84Draft.scope, /not accepted, merged or released/i);

  assert.doesNotMatch(m78c.scope, /M7\.8C.*product-owner accepted/i);
  assert.doesNotMatch(m84Draft.scope, /M8\.4.*(?:product-owner accepted|production-ready|has been released|was released|is released)/i);
});

test('durable state mirrors accepted M8.3, pending M8.4 and the clean master freshness reconciliation', () => {
  const projectState = fs.readFileSync(PROJECT_STATE_PATH, 'utf8');
  const roadmap = fs.readFileSync(ROADMAP_PATH, 'utf8');
  const changelog = fs.readFileSync(CHANGELOG_PATH, 'utf8');

  for (const document of [projectState, roadmap]) {
    assert.match(document, /PR #314/);
    assert.match(document, /71185c5b24f06525e6c636f4bcf223bb08197482/);
    assert.match(document, /M8\.3 Precision Reference Calibration.*(?:product-owner accepted|Product Owner accepted).*merged/i);
    assert.match(document, /M8\.4 Assisted Tracing.*Draft PR #94/i);
    assert.match(document, /same-plan Product Owner retest pending/i);
    assert.match(document, /32564655915/);
    assert.match(document, /9473752972/);
    assert.match(document, /sha256:42ac27b553cdb086de87caed61c516781a60cb1decafdcad4d8bc8c11b4c8d28/);
    assert.doesNotMatch(document, /Vlezet(?::|\s).*M8\.3 Precision Reference Calibration (?:is active at|remains) Draft \/ TDD RED/i);
  }

  assert.match(changelog, /2026-08-20 — Content Freshness reconciliation after AI-8 and Vlezet M8\.4 — ACCEPTED/);
  assert.match(changelog, /PR #296/);
  assert.match(changelog, /eef10c07d37d97f75ea47857b304af4c197bf914/);
  assert.match(changelog, /32418834360/);
  assert.match(changelog, /9424935318/);
  assert.match(changelog, /sha256:ad4c37e1c290f06c3055f0e3fa01f47fe8cf8a9b620caedbc080f75dafdcd822/);
  assert.match(changelog, /2026-08-22 — AI-index maintenance hardening \+ Content Freshness reconciliation — ACCEPTED/);
  assert.match(changelog, /PR #314/);
  assert.match(changelog, /71185c5b24f06525e6c636f4bcf223bb08197482/);
  assert.match(changelog, /32564655915/);
  assert.match(changelog, /9473752972/);
  assert.match(changelog, /sha256:42ac27b553cdb086de87caed61c516781a60cb1decafdcad4d8bc8c11b4c8d28/);
});
