import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const ROOT = path.resolve(import.meta.dirname, '..');
const EVIDENCE_PATH = path.join(ROOT, 'data', 'project-evidence.json');

test('Vlezet keeps failed M7.8C history while M8.1 is accepted and current M8.2 remains pending', () => {
  const evidence = JSON.parse(fs.readFileSync(EVIDENCE_PATH, 'utf8'));
  const vlezet = evidence.find((entry) => entry.project === 'vlezet');

  assert.ok(vlezet, 'missing Vlezet evidence snapshot');
  assert.equal(vlezet.status, 'verified');
  assert.equal(vlezet.lastVerified, '2026-08-12');

  const versions = new Map(vlezet.versions.map(({label, value}) => [label, value]));
  assert.equal(versions.get('Accepted recognition slice'), 'M7.8B');
  assert.match(versions.get('Automatic M7.8C result'), /FAIL.*closed unmerged/i);
  assert.match(versions.get('Accepted editor slice'), /M8\.1.*product-owner accepted.*merged/i);
  assert.match(versions.get('Active product slice'), /M8\.2.*precision.*structural.*Draft/i);
  assert.match(versions.get('Active product slice'), /manual product-owner retest pending/i);

  const m78c = vlezet.signals.find(({url}) => url === 'https://github.com/True-Ruslan/vlezet/pull/42');
  assert.ok(m78c, 'missing bounded M7.8C failure signal');
  assert.equal(m78c.kind, 'pr');
  assert.equal(m78c.mode, 'automated');
  assert.equal(m78c.state, 'failed');
  assert.equal(m78c.observedAt, '2026-08-08');
  assert.match(m78c.scope, /closed unmerged/i);
  assert.match(m78c.scope, /product-owner.*failed usefulness acceptance/i);
  assert.match(m78c.scope, /M7\.8B/i);

  const assisted = vlezet.signals.find(({url}) => url === 'https://github.com/True-Ruslan/vlezet/pull/52');
  assert.ok(assisted, 'missing historical Assisted Tracing signal');
  assert.equal(assisted.state, 'unavailable');
  assert.equal(assisted.observedAt, '2026-08-11');
  assert.match(assisted.scope, /closed unmerged/i);
  assert.match(assisted.scope, /superseded/i);
  assert.match(assisted.scope, /historical design\/R&D evidence/i);

  const accepted = vlezet.signals.find(({url}) => url === 'https://github.com/True-Ruslan/vlezet/pull/85');
  assert.ok(accepted, 'missing M8.1 accepted editor signal');
  assert.equal(accepted.kind, 'pr');
  assert.equal(accepted.mode, 'automated');
  assert.equal(accepted.state, 'merged');
  assert.equal(accepted.observedAt, '2026-08-09');
  assert.match(accepted.scope, /product-owner accepted/i);
  assert.match(accepted.scope, /9\/9/);
  assert.match(accepted.scope, /pre-production/i);

  const active = vlezet.signals.find(({url}) => url === 'https://github.com/True-Ruslan/vlezet/pull/87');
  assert.ok(active, 'missing current M8.2 Draft signal');
  assert.equal(active.kind, 'pr');
  assert.equal(active.mode, 'automated');
  assert.equal(active.state, 'pending');
  assert.equal(active.observedAt, '2026-08-12');
  assert.match(active.scope, /789f1de8eae92eebc8988a41f07439927431fb8b/);
  assert.match(active.scope, /original seven product-owner scenarios passed/i);
  assert.match(active.scope, /693 passed/i);
  assert.match(active.scope, /353 passed/i);
  assert.match(active.scope, /focused manual product-owner retest remains pending/i);
  assert.match(active.scope, /no merge, release, lifecycle promotion or acceptance/i);

  assert.doesNotMatch(
    [m78c.scope, assisted.scope, accepted.scope, active.scope].join('\n'),
    /M7\.8C.*product-owner accepted|M8\.2.*production-ready|M8\.2.*released|M8\.2.*product-owner accepted/i,
  );
});