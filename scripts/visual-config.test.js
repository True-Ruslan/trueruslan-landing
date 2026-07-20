import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

test('visual theme and custom resources are wired into Diplodoc', () => {
  const yfm = read('docs/.yfm');
  const theme = read('docs/theme.yaml');
  const packageJson = JSON.parse(read('package.json'));

  assert.match(yfm, /allowCustomResources:\s*true/);
  assert.match(yfm, /_assets\/style\/custom\.css/);
  assert.match(yfm, /_assets\/script\/custom\.js/);
  assert.match(theme, /base-brand:\s*['"]#4CC9F0['"]/i);
  assert.match(theme, /base-background:\s*['"]#090B10['"]/i);
  assert.match(theme, /text-primary:\s*['"]#F4F7FB['"]/i);
  assert.match(packageJson.scripts['build:docs'], /--allow-custom-resources/);
  assert.match(packageJson.scripts['build:docs:fast'], /--allow-custom-resources/);
});
