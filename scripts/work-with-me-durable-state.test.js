import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => fs.readFileSync(path.join(ROOT, relativePath), 'utf8');

const EXPECTED_SHA = '433ee076f3f90dfe14feea97f59ad84bca0c337a';
const EXPECTED_PAGES_RUN = '31285875710';
const EXPECTED_DEPLOYMENT = '5814010976';
const EXPECTED_PRODUCTION_RUN = '31285898990';
const EXPECTED_PRODUCTION_DIGEST = 'sha256:e01e5baf0675d826334b2d75dd865e66833eaf2f804181a2061f7389b3505577';

for (const relativePath of ['docs/PROJECT_STATE.md', 'docs/ROADMAP.md', 'docs/CHANGELOG.md']) {
  test(`${relativePath} records exact Work with me production acceptance without promoting P3.6`, () => {
    const source = read(relativePath);
    assert.match(source, /Work with me|Работа со мной/);
    assert.ok(source.includes(EXPECTED_SHA), `${relativePath}: exact accepted feature SHA missing`);
    assert.ok(source.includes(EXPECTED_PAGES_RUN), `${relativePath}: exact Pages run missing`);
    assert.ok(source.includes(EXPECTED_DEPLOYMENT), `${relativePath}: exact Pages deployment missing`);
    assert.ok(source.includes(EXPECTED_PRODUCTION_RUN), `${relativePath}: exact Production Live run missing`);
    assert.ok(source.includes(EXPECTED_PRODUCTION_DIGEST), `${relativePath}: production evidence digest missing`);
    assert.match(source, /P3\.6[^\n]*(?:NEXT|WAITING|open|оста[её]тся открытым)/i);
    assert.doesNotMatch(source, /P3\.6[^\n]*(?:DONE|PRODUCTION ACCEPTED|closed)/i);
  });
}
