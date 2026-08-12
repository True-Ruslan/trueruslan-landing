import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const ROOT = path.resolve(import.meta.dirname, '..');
const read = (name) => fs.readFileSync(path.join(ROOT, 'docs', name), 'utf8');

const DOCS = ['PROJECT_STATE.md', 'ROADMAP.md', 'CHANGELOG.md'];

for (const file of DOCS) {
  test(`${file} records accepted GSC adapter evidence without promoting sparse observations`, () => {
    const text = read(file);
    assert.match(text, /PR #213/);
    assert.match(text, /831535461f3c72d53e3510574ae7ae9c52ab54f6/);
    assert.match(text, /Google Search Console/i);
    assert.match(text, /sparse|мал(?:ая|ый|о)|pre-public-launch|до публичного запуска/i);
    assert.match(text, /P4\.1B.*(?:IN PROGRESS|В РАБОТЕ|SPARSE)/i);
    assert.doesNotMatch(text, /P4\.1B real external evidence collection\/review — NEXT/i);
  });

  test(`${file} records controlled launch-pack acceptance without claiming publication`, () => {
    const text = read(file);
    assert.match(text, /PR #214/);
    assert.match(text, /bed23ac0330ca112b94259998adcd8187203988a/);
    assert.match(text, /10 targets\s*\/\s*38 manual drafts|10 targets.*38/i);
    assert.match(text, /not-published|не опубликован/i);
    assert.match(text, /P4\.1C.*WAITING/i);
    assert.match(text, /P3\.6.*WAITING/i);
    assert.match(text, /2026-08-05T00:00:00Z/);
  });
}

test('durable state makes the next action a real manual controlled launch, not another SEO rewrite', () => {
  const state = read('PROJECT_STATE.md');
  const roadmap = read('ROADMAP.md');
  assert.match(state, /controlled launch|контролируем(?:ый|ого) запуск/i);
  assert.match(roadmap, /manual.*(?:publish|publication|launch)|ручн.*(?:публикац|анонс|запуск)/i);
  assert.doesNotMatch(roadmap, /P4\.1C\s*[—:-]+\s*(?:NEXT|IN PROGRESS|DONE)/i);
});
