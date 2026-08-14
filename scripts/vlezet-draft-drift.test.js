import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const ROOT = path.resolve(import.meta.dirname, '..');
const EVIDENCE_PATH = path.join(ROOT, 'data', 'project-evidence.json');

test('Vlezet keeps failed M7.8C history while M8.2 is accepted and pre-production remains unchanged', () => {
  const evidence = JSON.parse(fs.readFileSync(EVIDENCE_PATH, 'utf8'));
  const vlezet = evidence.find((entry) => entry.project === 'vlezet');

  assert.ok(vlezet, 'missing Vlezet evidence snapshot');
  assert.equal(vlezet.status, 'verified');
  assert.equal(vlezet.lastVerified, '2026-08-14');

  const versions = new Map(vlezet.versions.map(({label, value}) => [label, value]));
  assert.equal(versions.get('Accepted recognition slice'), 'M7.8B');
  assert.match(versions.get('Automatic M7.8C result'), /FAIL.*closed unmerged/i);
  assert.match(versions.get('Accepted editor slice'), /M8\.2.*product-owner accepted.*merged/i);
  assert.match(versions.get('Active product slice'), /M8\.2 complete/i);
  assert.match(versions.get('Active product slice'), /testing-policy.*coverage.*M8\.3/i);

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

  const reconciliation = vlezet.signals.find(({url}) => url === 'https://github.com/True-Ruslan/vlezet/pull/88');
  assert.ok(reconciliation, 'missing M8.2 post-merge reconciliation signal');
  assert.equal(reconciliation.state, 'merged');
  assert.match(reconciliation.scope, /testing-policy.*coverage audit/i);

  assert.doesNotMatch(
    [m78c.scope, assisted.scope, m82.scope, reconciliation.scope].join('\n'),
    /M7\.8C.*product-owner accepted|M8\.2.*production-ready|M8\.2.*released/i,
  );
});
