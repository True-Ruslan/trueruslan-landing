import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const ROOT = path.resolve(import.meta.dirname, '..');
const EVIDENCE_PATH = path.join(ROOT, 'data', 'project-evidence.json');

test('Vlezet repository drift records the failed automatic path and pending assisted tracing pivot without lifecycle promotion', () => {
  const evidence = JSON.parse(fs.readFileSync(EVIDENCE_PATH, 'utf8'));
  const vlezet = evidence.find((entry) => entry.project === 'vlezet');

  assert.ok(vlezet, 'missing Vlezet evidence snapshot');
  assert.equal(vlezet.status, 'verified');
  assert.equal(vlezet.lastVerified, '2026-08-08');

  const versions = new Map(vlezet.versions.map(({label, value}) => [label, value]));
  assert.equal(versions.get('Accepted recognition slice'), 'M7.8B');
  assert.match(versions.get('Automatic M7.8C result'), /FAIL.*closed unmerged/i);
  assert.match(versions.get('Next acceptance boundary'), /Assisted Tracing/i);

  const m78c = vlezet.signals.find(({url}) => url === 'https://github.com/True-Ruslan/vlezet/pull/42');
  assert.ok(m78c, 'missing bounded M7.8C failure signal');
  assert.equal(m78c.kind, 'pr');
  assert.equal(m78c.mode, 'automated');
  assert.equal(m78c.state, 'failed');
  assert.equal(m78c.observedAt, '2026-08-08');
  assert.match(m78c.scope, /closed unmerged/i);
  assert.match(m78c.scope, /product-owner.*failed usefulness acceptance/i);
  assert.match(m78c.scope, /M7\.8B/i);

  const benchmark = vlezet.signals.find(({url}) => url === 'https://github.com/True-Ruslan/vlezet/pull/44');
  assert.ok(benchmark, 'missing bounded real-fixture R&D signal');
  assert.equal(benchmark.state, 'unavailable');
  assert.equal(benchmark.observedAt, '2026-08-08');
  assert.match(benchmark.scope, /closed unmerged/i);
  assert.match(benchmark.scope, /R&D evidence/i);
  assert.match(benchmark.scope, /not product-owner accepted/i);

  const hybrid = vlezet.signals.find(({url}) => url === 'https://github.com/True-Ruslan/vlezet/pull/45');
  assert.ok(hybrid, 'missing bounded hybrid R&D signal');
  assert.equal(hybrid.state, 'unavailable');
  assert.equal(hybrid.observedAt, '2026-08-08');
  assert.match(hybrid.scope, /closed unmerged/i);
  assert.match(hybrid.scope, /R&D evidence/i);
  assert.match(hybrid.scope, /authoritative geometry authority/i);

  const assisted = vlezet.signals.find(({url}) => url === 'https://github.com/True-Ruslan/vlezet/pull/52');
  assert.ok(assisted, 'missing Assisted Tracing design gate');
  assert.equal(assisted.state, 'pending');
  assert.equal(assisted.observedAt, '2026-08-08');
  assert.match(assisted.scope, /open Draft design gate/i);
  assert.match(assisted.scope, /no product code/i);
  assert.match(assisted.scope, /ephemeral preview/i);
  assert.match(assisted.scope, /no AI\/network dependency/i);

  assert.doesNotMatch(
    [m78c.scope, benchmark.scope, hybrid.scope, assisted.scope].join('\n'),
    /M7\.8C.*product-owner accepted|M7\.8C.*squash-merged|Assisted Tracing.*production-ready/i,
  );
});
