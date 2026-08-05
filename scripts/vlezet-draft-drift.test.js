import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const ROOT = path.resolve(import.meta.dirname, '..');
const EVIDENCE_PATH = path.join(ROOT, 'data', 'project-evidence.json');

test('Vlezet repository drift is recorded without promoting Draft recognition slices', () => {
  const evidence = JSON.parse(fs.readFileSync(EVIDENCE_PATH, 'utf8'));
  const vlezet = evidence.find((entry) => entry.project === 'vlezet');

  assert.ok(vlezet, 'missing Vlezet evidence snapshot');
  assert.equal(vlezet.status, 'verified');
  assert.equal(vlezet.lastVerified, '2026-08-05');

  const versions = new Map(vlezet.versions.map(({label, value}) => [label, value]));
  assert.equal(versions.get('Accepted recognition slice'), 'M7.8B');
  assert.equal(versions.get('Next acceptance boundary'), 'M7.8C product-owner retest');
  assert.equal(versions.get('Stacked Draft exploration'), 'M7.9 + M7.8C.1');

  const m78c = vlezet.signals.find(({url}) => url === 'https://github.com/True-Ruslan/vlezet/pull/42');
  assert.ok(m78c, 'missing bounded M7.8C Draft signal');
  assert.equal(m78c.kind, 'pr');
  assert.equal(m78c.mode, 'automated');
  assert.equal(m78c.state, 'pending');
  assert.equal(m78c.observedAt, '2026-08-05');
  assert.match(m78c.label, /M7\.8C.*Draft.*#42/i);
  assert.match(m78c.scope, /c49921d83e8c2ab7e7729a1cc5fe958930f3ee0a/);
  assert.match(m78c.scope, /product-owner retest/i);
  assert.match(m78c.scope, /not an acceptance|does not promote|remains Draft/i);

  const m79 = vlezet.signals.find(({url}) => url === 'https://github.com/True-Ruslan/vlezet/pull/44');
  assert.ok(m79, 'missing bounded M7.9 Draft signal');
  assert.equal(m79.state, 'pending');
  assert.equal(m79.observedAt, '2026-08-05');
  assert.match(m79.scope, /cd29740cf240d591785fc6607147d2bf07ece0b6/);
  assert.match(m79.scope, /stacked Draft[\s\S]*PR #42|based on PR #42/i);
  assert.match(m79.scope, /0\.85/);
  assert.match(m79.scope, /below|merge-blocking|not accepted/i);

  const hybrid = vlezet.signals.find(({url}) => url === 'https://github.com/True-Ruslan/vlezet/pull/45');
  assert.ok(hybrid, 'missing bounded M7.8C.1 Draft signal');
  assert.equal(hybrid.state, 'pending');
  assert.equal(hybrid.observedAt, '2026-08-05');
  assert.match(hybrid.scope, /2c4d0f44e56753b9c44dd6c30a720d1a97f50c2e/);
  assert.match(hybrid.scope, /stacked on PR #44/i);
  assert.match(hybrid.scope, /proposal/i);
  assert.match(hybrid.scope, /cannot|does not.*authoritative geometry|no geometry authority/i);
  assert.match(hybrid.scope, /Draft|not an acceptance|does not promote/i);

  assert.doesNotMatch(
    [m78c.scope, m79.scope, hybrid.scope].join('\n'),
    /product-owner accepted|squash-merged|production-ready/i,
  );
});
