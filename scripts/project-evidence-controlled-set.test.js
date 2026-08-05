import assert from 'node:assert/strict';
import test from 'node:test';

import {REQUIRED_PROJECT_EVIDENCE} from './copy-assets.js';

test('generated Project Evidence covers every controlled flagship', () => {
  assert.deepEqual(
    [...REQUIRED_PROJECT_EVIDENCE].sort(),
    ['livingworld', 'node-zero', 'portfolio-platform', 'vlezet'],
  );
});
