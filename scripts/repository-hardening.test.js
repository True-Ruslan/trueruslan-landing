import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const workflowDirectory = path.join(root, '.github', 'workflows');
const immutableActionPattern = /^[^\s@]+@[0-9a-f]{40}(?:\s+#\s+.+)?$/i;

function workflowFiles() {
  return fs.readdirSync(workflowDirectory)
    .filter((name) => /\.ya?ml$/i.test(name))
    .sort();
}

function externalUses(content) {
  return content.split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith('uses: '))
    .map((line) => line.slice('uses: '.length).trim())
    .filter((value) => !value.startsWith('./'));
}

test('repository exposes the required governance and security files', () => {
  for (const relativePath of [
    'SECURITY.md',
    '.github/CODEOWNERS',
    '.github/dependabot.yml',
    '.github/pull_request_template.md',
    '.github/workflows/codeql.yml',
    '.github/workflows/dependency-review.yml',
  ]) {
    assert.equal(fs.existsSync(path.join(root, relativePath)), true, `${relativePath} is required`);
  }
});

test('every external GitHub Action is pinned to an immutable full commit SHA', () => {
  const violations = [];

  for (const name of workflowFiles()) {
    const content = fs.readFileSync(path.join(workflowDirectory, name), 'utf8');
    for (const action of externalUses(content)) {
      if (!immutableActionPattern.test(action)) {
        violations.push(`${name}: ${action}`);
      }
    }
  }

  assert.deepEqual(violations, [], `Unpinned actions:\n${violations.join('\n')}`);
});

test('every workflow declares an explicit permissions boundary', () => {
  const violations = workflowFiles().filter((name) => {
    const content = fs.readFileSync(path.join(workflowDirectory, name), 'utf8');
    return !/^permissions:\s*$/m.test(content);
  });

  assert.deepEqual(violations, [], `Missing workflow permissions:\n${violations.join('\n')}`);
});

test('pull request build uses a fixed runner and cancels superseded runs', () => {
  const content = fs.readFileSync(path.join(workflowDirectory, 'build.yml'), 'utf8');

  assert.match(content, /^concurrency:\s*$/m);
  assert.match(content, /^\s+cancel-in-progress:\s+true\s*$/m);
  assert.match(content, /^\s+runs-on:\s+ubuntu-24\.04\s*$/m);
  assert.doesNotMatch(content, /ubuntu-latest/);
});
