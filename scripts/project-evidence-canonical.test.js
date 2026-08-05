import assert from 'node:assert/strict';
import test from 'node:test';

import {
  DEFAULT_PROJECT_EVIDENCE_PATH,
  loadProjectEvidence,
} from './project-evidence.js';
import {
  DEFAULT_PROJECTS_PATH,
  loadProjectRegistry,
} from './project-registry.js';

test('canonical evidence registry covers the controlled flagship evidence projects', () => {
  const projects = loadProjectRegistry(DEFAULT_PROJECTS_PATH);
  const evidence = loadProjectEvidence(DEFAULT_PROJECT_EVIDENCE_PATH, {projects});

  assert.deepEqual(
    evidence.map(({project}) => project).sort(),
    ['livingworld', 'node-zero', 'portfolio-platform', 'vlezet'],
  );

  for (const snapshot of evidence) {
    for (const signal of snapshot.signals) {
      assert.ok(signal.scope.trim().length > 0, `${snapshot.project} signal scope must be non-empty`);
      assert.doesNotMatch(signal.url || '', /example\.com/i);
    }
  }
});
