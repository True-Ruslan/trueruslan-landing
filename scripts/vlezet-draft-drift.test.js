import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const ROOT = path.resolve(import.meta.dirname, '..');
const EVIDENCE_PATH = path.join(ROOT, 'data', 'project-evidence.json');

test('Vlezet keeps failed M7.8C history while M8.3 is active and pre-production remains unchanged', () => {
  const evidence = JSON.parse(fs.readFileSync(EVIDENCE_PATH, 'utf8'));
  const vlezet = evidence.find((entry) => entry.project === 'vlezet');

  assert.ok(vlezet, 'missing Vlezet evidence snapshot');
  assert.equal(vlezet.status, 'verified');
  assert.equal(vlezet.lastVerified, '2026-08-15');

  const versions = new Map(vlezet.versions.map(({label, value}) => [label, value]));
  assert.equal(versions.get('Accepted recognition slice'), 'M7.8B');
  assert.match(versions.get('Automatic M7.8C result'), /FAIL.*closed unmerged/i);
  assert.match(versions.get('Accepted editor slice'), /M8\.2.*product-owner accepted.*merged/i);
  assert.equal(versions.get('Next acceptance boundary'), 'M8.3 Precision Reference Calibration');
  assert.match(versions.get('Active product slice'), /M8\.3 Precision Reference Calibration active/i);
  assert.match(versions.get('Active product slice'), /Testing Policy Phase A.*P0 IndexedDB persistence hardening/i);
  assert.match(versions.get('Active product slice'), /not product-owner accepted or released/i);

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
  assert.equal(m82.kind, 'pr');
  assert.equal(m82.mode, 'automated');
  assert.equal(m82.state, 'merged');
  assert.equal(m82.observedAt, '2026-08-13');
  assert.match(m82.scope, /product-owner acceptance/i);
  assert.match(m82.scope, /e323e331a435ae356b91decbdea80dde95028d8a/);
  assert.match(m82.scope, /Post-merge CI #5097.*CodeQL/i);
  assert.match(m82.scope, /pre-production/i);

  const testingPolicy = vlezet.signals.find(({url}) => url === 'https://github.com/True-Ruslan/vlezet/pull/89');
  assert.ok(testingPolicy, 'missing accepted Testing Policy Phase A signal');
  assert.equal(testingPolicy.state, 'merged');
  assert.match(testingPolicy.scope, /without promoting Vlezet beyond pre-production/i);

  const persistence = vlezet.signals.find(({url}) => url === 'https://github.com/True-Ruslan/vlezet/pull/90');
  assert.ok(persistence, 'missing accepted P0 IndexedDB signal');
  assert.equal(persistence.state, 'merged');
  assert.equal(persistence.observedAt, '2026-08-15');
  assert.match(persistence.scope, /7cb9cfd2a8f809e6000209188b5fab99a2fabfb9/);
  assert.match(persistence.scope, /persistence acceptance only/i);
  assert.match(persistence.scope, /pre-production/i);

  const handoff = vlezet.signals.find(({url}) => url === 'https://github.com/True-Ruslan/vlezet/pull/91');
  assert.ok(handoff, 'missing M8.3 handoff signal');
  assert.equal(handoff.state, 'merged');
  assert.equal(handoff.observedAt, '2026-08-15');
  assert.match(handoff.scope, /M8\.3 Precision Reference Calibration.*active/i);
  assert.match(handoff.scope, /not product-owner accepted or released/i);
  assert.match(handoff.scope, /pre-production/i);

  assert.doesNotMatch(
    [m78c.scope, assisted.scope, m82.scope, testingPolicy.scope, persistence.scope, handoff.scope].join('\n'),
    /M7\.8C.*product-owner accepted|M8\.2.*production-ready|M8\.2.*released/i,
  );
});
