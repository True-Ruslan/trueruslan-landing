import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

const ACCEPTED_SHA = '17aa2cc5dd13b38ebd83f15d7596d8216f9d8b87';
const PAGES_RUN = '31155442788';
const DEPLOYMENT_ID = '5790177102';
const PRODUCTION_RUN = '31155442779';

test('durable state preserves P3.5A exact production evidence after later P3.5 slices', () => {
  const state = read('docs/PROJECT_STATE.md');
  const roadmap = read('docs/ROADMAP.md');
  const changelog = read('docs/CHANGELOG.md');
  const spec = read('docs/keystone/specs/2026-08-05-portfolio-1-0-evidence-first.md');

  for (const document of [state, roadmap, changelog, spec]) {
    assert.match(document, /P3\.5A/i);
    assert.match(document, new RegExp(ACCEPTED_SHA));
  }

  assert.match(state, new RegExp(PAGES_RUN));
  assert.match(state, new RegExp(DEPLOYMENT_ID));
  assert.match(state, new RegExp(PRODUCTION_RUN));

  assert.match(roadmap, /P3\.5A[^\n]*(DONE|accepted)/i);
  assert.match(roadmap, /P3\.5B[^\n]*English[^\n]*\/now[^\n]*(DONE|accepted)/i);
  assert.match(roadmap, /P3\.5C[^\n]*Publications[^\n]*NEXT/i);

  assert.match(spec, /P3\.5A[^\n]*(DONE|accepted)/i);
  assert.match(spec, /P3\.5B[^\n]*English[^\n]*\/now[^\n]*(DONE|accepted)/i);
  assert.match(spec, /P3\.5C[^\n]*Publications[^\n]*NEXT/i);

  assert.match(changelog, /P3\.5A[^\n]*English Vlezet/i);
});
