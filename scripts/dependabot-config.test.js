import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const config = fs.readFileSync(path.join(ROOT, '.github/dependabot.yml'), 'utf8');

test('Dependabot does not request unmanaged repository labels', () => {
  assert.doesNotMatch(
    config,
    /^\s+labels:\s*$/m,
    'Dependabot labels must not be configured unless the repository owns a durable label manifest and provisioning path',
  );
});

test('Dependabot still covers npm and GitHub Actions with bounded grouped updates', () => {
  assert.match(config, /package-ecosystem:\s*npm/);
  assert.match(config, /package-ecosystem:\s*github-actions/);
  assert.match(config, /production-minor-and-patch:/);
  assert.match(config, /development-minor-and-patch:/);
  assert.match(config, /github-actions:\s*\n\s+patterns:/);
  assert.match(config, /rebase-strategy:\s*auto/g);
});
