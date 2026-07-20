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
  const license = read('LICENSE');
  const contentLicense = read('CONTENT-LICENSE.md');

  assert.match(yfm, /allowCustomResources:\s*true/);
  assert.match(yfm, /assets\/images\/favicon\.svg/);
  assert.match(yfm, /_assets\/style\/custom\.css/);
  assert.match(yfm, /_assets\/style\/accessibility\.css/);
  assert.match(yfm, /_assets\/style\/standalone\.css/);
  assert.match(yfm, /_assets\/style\/home\.css/);
  assert.match(yfm, /_assets\/style\/resume\.css/);
  assert.match(yfm, /_assets\/script\/custom\.js/);
  assert.match(theme, /base-brand:\s*['"]#4CC9F0['"]/i);
  assert.match(theme, /base-background:\s*['"]#090B10['"]/i);
  assert.match(theme, /text-primary:\s*['"]#F4F7FB['"]/i);
  assert.match(packageJson.scripts['build:docs'], /--allow-custom-resources/);
  assert.doesNotMatch(packageJson.scripts['build:docs'], /--static-content/);
  assert.match(packageJson.scripts['build:docs:fast'], /--allow-custom-resources/);
  assert.doesNotMatch(packageJson.scripts['build:docs:fast'], /--static-content/);
  assert.equal(packageJson.scripts['check:site'], 'node scripts/site-integrity.js');

  assert.equal(packageJson.license, 'Apache-2.0');
  assert.equal(packageJson.homepage, 'https://true-ruslan.github.io/trueruslan-landing/');
  assert.match(license, /Apache License\s+Version 2\.0/i);
  assert.match(contentLicense, /personal content/i);
  assert.match(contentLicense, /All rights reserved/i);
});
