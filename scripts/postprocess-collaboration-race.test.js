import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = fs.readFileSync(path.join(ROOT, 'scripts', 'postprocess-collaboration.js'), 'utf8');

test('Work with me postprocessor reads generated targets directly without check-then-read TOCTOU', () => {
  assert.doesNotMatch(source, /existsSync\s*\(/, 'generated Work with me files must not use existsSync before readFileSync');
  assert.match(source, /readFileSync\s*\(filePath,\s*['"]utf8['"]\)/);
  assert.match(source, /error\?\.code\s*===\s*['"]ENOENT['"]/);
  assert.match(source, /generated Work with me page not found/);
});
