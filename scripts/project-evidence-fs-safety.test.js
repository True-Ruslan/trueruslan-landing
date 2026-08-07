import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {applyProjectEvidence} from './project-evidence.js';

const snapshot = {
  project: 'vlezet',
  status: 'verified',
  lastVerified: '2026-08-05',
  versions: [{label: 'Accepted recognition slice', value: 'M7.8B'}],
  signals: [{
    kind: 'pr',
    mode: 'automated',
    label: 'Accepted recognition baseline',
    state: 'merged',
    observedAt: '2026-08-05',
    scope: 'The accepted baseline remains M7.8B.',
  }],
};

test('Project Evidence required-file reads avoid exists-before-read TOCTOU checks', () => {
  const source = fs.readFileSync(new URL('./project-evidence.js', import.meta.url), 'utf8');
  assert.doesNotMatch(
    source,
    /fs\.existsSync\s*\(/,
    'required Project Evidence files must be read directly and handle ENOENT from the read operation',
  );
});

test('applyProjectEvidence preserves the explicit missing generated-page error without a pre-check', () => {
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tr-project-evidence-missing-page-'));

  assert.throws(
    () => applyProjectEvidence(outputDir, [snapshot], {requiredProjects: ['vlezet']}),
    /generated project page not found for evidence: landing\/projects\/vlezet\.html/,
  );
});
