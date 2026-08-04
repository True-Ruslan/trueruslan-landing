import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const ROOT = path.resolve(import.meta.dirname, '..');
const EVIDENCE_PATH = path.join(ROOT, 'data', 'project-evidence.json');

test('Vlezet repository drift is recorded without promoting M7.8C', () => {
  const evidence = JSON.parse(fs.readFileSync(EVIDENCE_PATH, 'utf8'));
  const vlezet = evidence.find((entry) => entry.project === 'vlezet');

  assert.ok(vlezet, 'missing Vlezet evidence snapshot');
  assert.equal(vlezet.status, 'verified');
  assert.equal(vlezet.lastVerified, '2026-08-04');

  const versions = new Map(vlezet.versions.map(({label, value}) => [label, value]));
  assert.equal(versions.get('Accepted recognition slice'), 'M7.8B');
  assert.equal(versions.get('Next recognition slice'), 'M7.8C');

  const draft = vlezet.signals.find(({url}) => url === 'https://github.com/True-Ruslan/vlezet/pull/42');
  assert.ok(draft, 'missing bounded M7.8C Draft signal');
  assert.equal(draft.kind, 'pr');
  assert.equal(draft.mode, 'automated');
  assert.equal(draft.state, 'pending');
  assert.equal(draft.observedAt, '2026-08-04');
  assert.match(draft.label, /M7\.8C.*Draft.*#42/i);
  assert.match(draft.scope, /product-owner retest/i);
  assert.match(draft.scope, /not accepted|does not promote|remains Draft/i);
  assert.doesNotMatch(draft.scope, /product-owner accepted|squash-merged/i);
});
