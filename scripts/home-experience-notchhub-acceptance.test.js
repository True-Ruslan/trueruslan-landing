import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(ROOT, relativePath), 'utf8');

const acceptedSha = '4395128144c069663e67c660e5b549cfca851ae8';

test('durable docs record accepted homepage presentation without closing P3.6', () => {
  const state = read('docs/PROJECT_STATE.md');
  const roadmap = read('docs/ROADMAP.md');
  const changelog = read('docs/CHANGELOG.md');

  for (const text of [state, roadmap, changelog]) {
    assert.ok(text.includes(acceptedSha));
    assert.ok(text.includes('31260596290'));
    assert.ok(text.includes('5809298234'));
    assert.ok(text.includes('31260625145'));
  }

  assert.match(state, /Portfolio presentation refinement — PRODUCTION ACCEPTED/);
  assert.match(roadmap, /Homepage\/Experience\/NotchHub presentation refinement — PRODUCTION ACCEPTED/);
  assert.match(changelog, /Homepage density, Experience, unified header and NotchHub — PRODUCTION ACCEPTED/);

  assert.ok(changelog.includes('2ccb495872b94027980ecaaab1ee7bbc0f3a8ba8'));
  assert.ok(changelog.includes('31259991547'));
  assert.match(changelog, /Vlezet.*Current work|Current work.*Vlezet/is);

  assert.match(state, /P3\.6 — Measurement checkpoint — NEXT \/ WAITING FOR EXTERNAL EVIDENCE/);
  assert.match(roadmap, /P3\.6 — Measurement checkpoint — NEXT \/ WAITING/);
  assert.doesNotMatch(`${state}\n${roadmap}`, /P3\.6 — Measurement checkpoint — DONE/);
});
